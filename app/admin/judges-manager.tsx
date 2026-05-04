'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faUserTie, faKey, faIdBadge, faSearch, faTimes, faShieldHalved, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

import { AppData, Judge } from '../types';

export default function JudgesManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSave = () => onSave(localData);

  const judgesList = localData.judges || [];

  const addJudge = () => {
    const newJudge: Judge = {
      id: Date.now().toString(),
      accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: 'New Judge',
      credentials: 'Judge Description'
    };
    setLocalData({ ...localData, judges: [...judgesList, newJudge] });
    setShowAddModal(false);
  };

  const updateJudge = (id: string, field: string, value: string) => {
    const newList = judgesList.map((j: Judge) => j.id === id ? { ...j, [field]: value } : j);
    setLocalData({ ...localData, judges: newList });
  };

  const removeJudge = (id: string) => {
    const newList = judgesList.filter((j: Judge) => j.id !== id);
    setLocalData({ ...localData, judges: newList });
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredJudges = judgesList.filter((j: Judge) =>
    j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.credentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.accessCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const avatarColors = [
    'from-orange-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-purple-400 to-violet-500',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-500',
    'from-pink-400 to-rose-500',
    'from-lime-400 to-emerald-500',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </span>
            Judges Panel
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-[52px]">{judgesList.length} judge{judgesList.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Judge
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm"
          >
            <FontAwesomeIcon icon={faSave} /> Save All
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
          placeholder="Search by name, credentials, or access code..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJudges.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FontAwesomeIcon icon={faUserTie} className="text-gray-300 text-4xl mb-3" />
            <p className="text-gray-400 font-medium">No judges found</p>
            <p className="text-gray-300 text-sm mt-1">{searchQuery ? 'Try a different search term' : 'Click "Add Judge" to get started'}</p>
          </div>
        )}

        {filteredJudges.map((judge: Judge, index: number) => (
          <div
            key={judge.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden group"
          >
            {/* Card Header with Avatar */}
            <div className="relative px-5 pt-5 pb-4">
              <button
                onClick={() => removeJudge(judge.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                title="Remove Judge"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>

              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                  {getInitials(judge.name)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <input
                    value={judge.name}
                    onChange={e => updateJudge(judge.id, 'name', e.target.value)}
                    className="w-full font-bold text-gray-900 text-base bg-transparent border-none outline-none focus:bg-gray-50 focus:rounded-lg focus:px-2 focus:-ml-2 transition-all placeholder-gray-400"
                    placeholder="Judge Name"
                  />
                  <input
                    value={judge.credentials}
                    onChange={e => updateJudge(judge.id, 'credentials', e.target.value)}
                    className="w-full text-sm text-gray-500 bg-transparent border-none outline-none focus:bg-gray-50 focus:rounded-lg focus:px-2 focus:-ml-2 transition-all placeholder-gray-400 mt-0.5"
                    placeholder="e.g., Lead AI Engineer, Tech Corp"
                  />
                </div>
              </div>
            </div>

            {/* Access Code Section */}
            <div className="mx-5 mb-5 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} className="text-amber-500 text-xs" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Code</span>
                </div>
                <button
                  onClick={() => copyAccessCode(judge.accessCode)}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                  title="Copy code"
                >
                  <FontAwesomeIcon icon={copiedCode === judge.accessCode ? faCheck : faCopy} className="text-[10px]" />
                  <span>{copiedCode === judge.accessCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <input
                value={judge.accessCode}
                onChange={e => updateJudge(judge.id, 'accessCode', e.target.value)}
                className="w-full mt-1 text-lg font-mono font-bold text-indigo-600 bg-transparent border-none outline-none tracking-widest"
                placeholder="ACCESS CODE"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Judge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
                <FontAwesomeIcon icon={faUserTie} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add New Judge</h3>
              <p className="text-sm text-gray-500 mt-1">A new judge will be created with a unique access code. You can customize their details after creation.</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                <span>Unique access code auto-generated</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                <span>Name and credentials can be edited inline</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                <span>Access code can be copied to share</span>
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
                onClick={addJudge}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-indigo-700 transition-all text-sm"
              >
                Create Judge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
