'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faUserTie, faKey, faIdBadge } from '@fortawesome/free-solid-svg-icons';

import { AppData, Judge } from '../types';

export default function JudgesManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);

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
  };

  const updateJudge = (id: string, field: string, value: string) => {
    const newList = judgesList.map((j: Judge) => j.id === id ? { ...j, [field]: value } : j);
    setLocalData({ ...localData, judges: newList });
  };

  const removeJudge = (id: string) => {
    const newList = judgesList.filter((j: Judge) => j.id !== id);
    setLocalData({ ...localData, judges: newList });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Judges</h2>
        <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSave} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {judgesList.map((judge: Judge) => (
          <div key={judge.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 relative">
            <button 
              onClick={() => removeJudge(judge.id)} 
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2"
              title="Remove Judge"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            
            <div className="space-y-4 pr-8">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserTie} /> Name
                </label>
                <input 
                  value={judge.name}
                  onChange={e => updateJudge(judge.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-bold text-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Judge Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} /> Access Code
                </label>
                <input 
                  value={judge.accessCode}
                  onChange={e => updateJudge(judge.id, 'accessCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-orange-600 font-mono focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Login Code"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faIdBadge} /> Credentials / Description
                </label>
                <input 
                  value={judge.credentials}
                  onChange={e => updateJudge(judge.id, 'credentials', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Lead AI Engineer, Tech Corp"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button onClick={addJudge} className="flex items-center justify-center gap-2 w-full min-h-[200px] border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors">
          <FontAwesomeIcon icon={faPlus} className="text-xl" /> 
          <span className="font-semibold text-lg">Add New Judge</span>
        </button>
      </div>
    </div>
  );
}
