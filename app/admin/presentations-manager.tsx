'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faUser, faSearch, faChevronDown, faChevronUp, faTimes, faFileAlt, faLayerGroup, faFolderOpen, faAlignLeft, faUsers, faCheck, faFileExcel, faBuilding, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

import { AppData, Category, SubCategory, Presentation, Author } from '../types';
import * as XLSX from 'xlsx';

export default function PresentationsManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPresTypeId, setNewPresTypeId] = useState<string>('');
  const [newPresSubId, setNewPresSubId] = useState<string>('');

  const handleSave = useCallback(() => onSave(localData), [localData, onSave]);

  // Keyboard shortcuts: Ctrl + "+" to add, Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '`')) {
        e.preventDefault();
        setNewPresTypeId(localData.categories[0]?.id || '');
        setNewPresSubId(localData.categories[0]?.subCategories[0]?.id || '');
        setShowAddModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const addPresentation = () => {
    const newPres: Presentation = {
      id: Date.now().toString(),
      contestantNo: '#',
      title: 'New Presentation Title',
      presentationTypeId: newPresTypeId || localData.categories[0]?.id || '',
      subCategoryId: newPresSubId || localData.categories[0]?.subCategories[0]?.id || '',
      authors: [{ name: 'Author Name', initials: 'AN' }],
      details: 'Presentation Details',
      campus: '',
      areaCluster: ''
    };
    setLocalData({ ...localData, presentations: [...localData.presentations, newPres] });
    setExpandedId(newPres.id);
    setShowAddModal(false);
  };

  const updatePresentation = (id: string, field: string, value: any) => {
    const newList = localData.presentations.map((p: Presentation) => p.id === id ? { ...p, [field]: value } : p);
    setLocalData({ ...localData, presentations: newList });
  };

  const updatePresentationMultiple = (id: string, updates: Record<string, any>) => {
    const newList = localData.presentations.map((p: Presentation) => p.id === id ? { ...p, ...updates } : p);
    setLocalData({ ...localData, presentations: newList });
  };

  const removePresentation = (id: string) => {
    const newList = localData.presentations.filter((p: Presentation) => p.id !== id);
    setLocalData({ ...localData, presentations: newList });
    if (expandedId === id) setExpandedId(null);
  };

  const addAuthor = (presId: string) => {
    const newList = localData.presentations.map((p: Presentation) => {
      if (p.id === presId) {
        return { ...p, authors: [...p.authors, { name: 'New Author', initials: 'NA' }] };
      }
      return p;
    });
    setLocalData({ ...localData, presentations: newList });
  };

  const updateAuthor = (presId: string, idx: number, field: string, value: string) => {
    const newList = localData.presentations.map((p: Presentation) => {
      if (p.id === presId) {
        const newAuthors = [...p.authors];
        newAuthors[idx] = { ...newAuthors[idx], [field]: value };
        return { ...p, authors: newAuthors };
      }
      return p;
    });
    setLocalData({ ...localData, presentations: newList });
  };

  const removeAuthor = (presId: string, idx: number) => {
    const newList = localData.presentations.map((p: Presentation) => {
      if (p.id === presId) {
        const newAuthors = [...p.authors];
        newAuthors.splice(idx, 1);
        return { ...p, authors: newAuthors };
      }
      return p;
    });
    setLocalData({ ...localData, presentations: newList });
  };

  const filteredPresentations = localData.presentations.filter((p: Presentation) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authors.some((a: Author) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryName = (id: string) => localData.categories.find((c: Category) => c.id === id)?.name || '—';
  const getSubCategoryName = (typeId: string, subId: string) => {
    const cat = localData.categories.find((c: Category) => c.id === typeId);
    return cat?.subCategories.find((s: SubCategory) => s.id === subId)?.name || '—';
  };

const handleExportExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Group presentations by category (presentationTypeId)
  const groupedByCategory = localData.presentations.reduce((acc: Record<string, Presentation[]>, pres: Presentation) => {
    const categoryKey = pres.presentationTypeId || 'uncategorized';
    if (!acc[categoryKey]) acc[categoryKey] = [];
    acc[categoryKey].push(pres);
    return acc;
  }, {});

  Object.entries(groupedByCategory).forEach(([categoryId, categoryPresentations]) => {
    const categoryName = getCategoryName(categoryId) || 'Uncategorized';

    // Further group by subcategory within each category
    const groupedBySubCategory = (categoryPresentations as Presentation[]).reduce((acc: Record<string, Presentation[]>, pres: Presentation) => {
      const subKey = pres.subCategoryId || 'general';
      if (!acc[subKey]) acc[subKey] = [];
      acc[subKey].push(pres);
      return acc;
    }, {});

    const sheetData: (string | number)[][] = [];

    Object.entries(groupedBySubCategory).forEach(([subCategoryId, subPresentations]) => {
      const subCategoryName = getSubCategoryName(categoryId, subCategoryId) || 'General';

      // Subcategory header row
      sheetData.push([subCategoryName]);
      // Column headers
      sheetData.push(['Presentation No', 'Title', 'Authors', 'Campus', 'Area/Cluster']);

      // Numbered rows per subcategory
      (subPresentations as Presentation[]).forEach((pres: Presentation, index: number) => {
        const authors = pres.authors.map((a: Author) => a.name).join('; ');
        sheetData.push([
          index + 1,                  // Sequential number per subcategory
          pres.title || '',
          authors,
          pres.campus || '',
          pres.areaCluster || '',
        ]);
      });

      sheetData.push([]); // Empty row between subcategories
    });

    // Sanitize sheet name (Excel limit: 31 chars, no special chars)
    const sheetName = categoryName.replace(/[:\\\/\?\*\[\]]/g, '').substring(0, 31);
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Optional: bold the subcategory header rows by tracking their row indices
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  XLSX.writeFile(workbook, "presentations_export.xlsx");
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
            </span>
            Presentations
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-[52px]">{localData.presentations.length} presentation{localData.presentations.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm"
            title="Export to Excel"
          >
            <FontAwesomeIcon icon={faFileExcel} /> Export
          </button>
          <button
            onClick={() => {
              setNewPresTypeId(localData.categories[0]?.id || '');
              setNewPresSubId(localData.categories[0]?.subCategories[0]?.id || '');
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm"
            title="Add New Presentation (Ctrl + `)"
          >
            <FontAwesomeIcon icon={faPlus} /> Add New
            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded border border-white/30">Ctrl `</kbd>
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm"
            title="Save All (Ctrl + S)"
          >
            <FontAwesomeIcon icon={faSave} /> Save All
            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded border border-white/30">Ctrl S</kbd>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by title or author name..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Presentations List */}
      <div className="space-y-8">
        {filteredPresentations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-300 text-4xl mb-3" />
            <p className="text-gray-400 font-medium">No presentations found</p>
            <p className="text-gray-300 text-sm mt-1">{searchQuery ? 'Try a different search term' : 'Click "Add New" to get started'}</p>
          </div>
        ) : (
          localData.categories.map((cat: Category) => {
            const catPresentations = filteredPresentations.filter((p: Presentation) => p.presentationTypeId === cat.id);

            if (catPresentations.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500 text-lg" />
                  {cat.name} Presentations
                </h3>
                
                <div className="space-y-6 pl-2 md:pl-4">
                  {(cat.subCategories || []).map((subCat: SubCategory) => {
                    let subCatPresentations = catPresentations.filter((p: Presentation) => p.subCategoryId === subCat.id);
                    
                    if (subCatPresentations.length === 0) return null;

                    // Sort alphabetically by title
                    subCatPresentations = subCatPresentations.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

                    return (
                      <div key={subCat.id} className="space-y-3">
                        <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFolderOpen} className="text-blue-500 text-sm" />
                          {subCat.name}
                        </h4>
                        <div className="space-y-3 pl-2 md:pl-4 border-l-2 border-blue-100">
                          {subCatPresentations.map((pres: Presentation, index: number) => {
                            const isExpanded = expandedId === pres.id;
                            const typeOptions = localData.categories;
                            const subOptions = localData.categories.find((c: Category) => c.id === pres.presentationTypeId)?.subCategories || [];

                            return (
            <div
              key={pres.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded
                  ? 'border-orange-300 shadow-lg shadow-orange-50 ring-1 ring-orange-100'
                  : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : pres.id)}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-bold text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">{pres.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
                      {getCategoryName(pres.presentationTypeId)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      <FontAwesomeIcon icon={faFolderOpen} className="text-[10px]" />
                      {getSubCategoryName(pres.presentationTypeId, pres.subCategoryId)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                      {pres.authors.length} author{pres.authors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'text-orange-500' : ''}`}
                />
              </div>

              {/* Expanded Editor */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5 animate-fade-in">
                  {/* Title */}
                  <div className="pt-5 space-y-5">
                    <div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faUser} className="text-orange-400" />
                          Contestant No.
                        </label>
                        <input
                          value={pres.contestantNo || ''}
                          onChange={e => updatePresentation(pres.id, 'contestantNo', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Enter contestant number"
                        />
                      </div>

                      <div className='mt-3'>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faFileAlt} className="text-orange-400" />
                          Title
                        </label>
                        <input
                          value={pres.title || ''}
                          onChange={e => updatePresentation(pres.id, 'title', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Enter presentation title"
                        />
                      </div>
                    </div>

                    {/* Type & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faLayerGroup} className="text-orange-400" />
                          Presentation Type
                        </label>
                        <select
                          value={pres.presentationTypeId}
                          onChange={e => {
                            const newType = e.target.value;
                            const newSubs = localData.categories.find((c: any) => c.id === newType)?.subCategories || [];
                            console.log('Selected Type:', newType, 'Available Subcategories:', newSubs);
                            updatePresentationMultiple(pres.id, {
                              presentationTypeId: newType,
                              subCategoryId: newSubs[0]?.id || ''
                            });
                          }}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                        >
                          {typeOptions.map((t: Category) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faFolderOpen} className="text-blue-400" />
                          Category
                        </label>
                        <select
                          value={pres.subCategoryId}
                          onChange={e => updatePresentation(pres.id, 'subCategoryId', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                        >
                          {subOptions.map((s: SubCategory) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Campus & Area/Cluster */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faBuilding} className="text-teal-400" />
                          Campus
                        </label>
                        <select
                          value={pres.campus || ''}
                          onChange={e => updatePresentation(pres.id, 'campus', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                        >
                          <option value="">Select Campus</option>
                          <option value="JRMSU Main">JRMSU Main</option>
                          <option value="JRMSU - Katipunan">JRMSU - Katipunan</option>
                          <option value="JRMSU - Tampilisan">JRMSU - Tampilisan</option>
                          <option value="JRMSU- Siocon">JRMSU- Siocon</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-400" />
                          Area / Cluster
                        </label>
                        <input
                          value={pres.areaCluster || ''}
                          onChange={e => updatePresentation(pres.id, 'areaCluster', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Enter Area/Cluster"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        <FontAwesomeIcon icon={faAlignLeft} className="text-purple-400" />
                        Details
                      </label>
                      <textarea
                        value={pres.details || ''}
                        onChange={e => updatePresentation(pres.id, 'details', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all resize-none"
                        placeholder="Enter presentation details..."
                      />
                    </div>

                    {/* Authors */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        <FontAwesomeIcon icon={faUsers} className="text-emerald-400" />
                        Researchers / Authors
                      </label>
                      <div className="space-y-2">
                        {pres.authors.map((author: Author, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                              {author.initials || '?'}
                            </span>
                            <input
                              value={author.name || ''}
                              onChange={e => updateAuthor(pres.id, idx, 'name', e.target.value)}
                              className="flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none placeholder-gray-400"
                              placeholder="Author name"
                            />
                            <input
                              value={author.initials || ''}
                              onChange={e => updateAuthor(pres.id, idx, 'initials', e.target.value)}
                              className="w-14 text-center bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs uppercase font-bold text-gray-600 outline-none focus:ring-2 focus:ring-orange-200"
                              placeholder="IN"
                              maxLength={2}
                            />
                            <button
                              onClick={() => removeAuthor(pres.id, idx)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                              title="Remove author"
                            >
                              <FontAwesomeIcon icon={faTimes} className="text-xs" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addAuthor(pres.id)}
                          className="w-full flex items-center justify-center gap-2 text-sm text-orange-600 border border-dashed border-orange-200 rounded-xl py-2.5 hover:bg-orange-50 hover:border-orange-400 transition-all font-medium"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add Author
                        </button>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => removePresentation(pres.id)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-medium"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" /> Delete Presentation
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-200">
                <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add New Presentation</h3>
              <p className="text-sm text-gray-500 mt-1">A new presentation will be created with default values. You can customize it after creation.</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Presentation Type</label>
                <select
                  value={newPresTypeId}
                  onChange={e => {
                    const newType = e.target.value;
                    const newSubs = localData.categories.find(c => c.id === newType)?.subCategories || [];
                    setNewPresTypeId(newType);
                    setNewPresSubId(newSubs[0]?.id || '');
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                >
                  {localData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Category</label>
                <select
                  value={newPresSubId}
                  onChange={e => setNewPresSubId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                >
                  {(localData.categories.find(c => c.id === newPresTypeId)?.subCategories || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addPresentation}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 transition-all text-sm"
              >
                Create Presentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
