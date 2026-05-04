'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faUser } from '@fortawesome/free-solid-svg-icons';

import { AppData, Category, SubCategory, Presentation, Author } from '../types';

export default function PresentationsManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);

  const handleSave = () => onSave(localData);

  const addPresentation = () => {
    const newPres = {
      id: Date.now().toString(),
      title: 'New Presentation Title',
      presentationTypeId: localData.categories[0]?.id || '',
      subCategoryId: localData.categories[0]?.subCategories[0]?.id || '',
      authors: [{ name: 'Author Name', initials: 'AN' }],
      details: 'Presentation Details'
    };
    setLocalData({ ...localData, presentations: [...localData.presentations, newPres] });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Presentations</h2>
        <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSave} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {localData.presentations.map((pres: Presentation) => {
          const typeOptions = localData.categories;
          const subOptions = localData.categories.find((c: Category) => c.id === pres.presentationTypeId)?.subCategories || [];

          return (
            <div key={pres.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <input
                  value={pres.title}
                  onChange={e => updatePresentation(pres.id, 'title', e.target.value)}
                  className="text-xl font-bold border-b border-gray-300 focus:border-orange-500 outline-none flex-1 mr-4 py-1"
                  placeholder="Research Title"
                />
                <button onClick={() => removePresentation(pres.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Presentation Type</label>
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
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {typeOptions.map((t: Category) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    value={pres.subCategoryId}
                    onChange={e => updatePresentation(pres.id, 'subCategoryId', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {subOptions.map((s: SubCategory) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Details</label>
                  <textarea
                    value={pres.details}
                    onChange={e => updatePresentation(pres.id, 'details', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {pres.details}
                  </textarea>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Researchers / Authors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pres.authors.map((author: Author, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                      <input
                        value={author.name}
                        onChange={e => updateAuthor(pres.id, idx, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                        placeholder="Name"
                      />
                      <input
                        value={author.initials}
                        onChange={e => updateAuthor(pres.id, idx, 'initials', e.target.value)}
                        className="w-12 bg-transparent border-none focus:ring-0 text-sm uppercase text-center font-semibold"
                        placeholder="IN"
                        maxLength={2}
                      />
                      <button onClick={() => removeAuthor(pres.id, idx)} className="text-red-400 hover:text-red-600">
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addAuthor(pres.id)} className="flex items-center justify-center gap-2 text-sm text-orange-600 border border-dashed border-orange-300 rounded p-2 hover:bg-orange-50">
                    <FontAwesomeIcon icon={faPlus} /> Add Author
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addPresentation} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors">
        <FontAwesomeIcon icon={faPlus} /> Add New Presentation
      </button>
    </div>
  );
}
