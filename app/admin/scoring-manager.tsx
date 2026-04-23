'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';

import { AppData, Category, ScoringCriteria } from '../types';

export default function ScoringManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);
  const [activeCat, setActiveCat] = useState(data.categories[0]?.id || '');

  const handleSave = () => onSave(localData);

  const scoringList = localData.scoringSettings[activeCat] || [];

  const addCriteria = () => {
    const newCriteria = { id: Date.now().toString(), name: 'New Criteria', maxScore: 10 };
    setLocalData({
      ...localData,
      scoringSettings: {
        ...localData.scoringSettings,
        [activeCat]: [...scoringList, newCriteria]
      }
    });
  };

  const updateCriteria = (id: string, field: string, value: any) => {
    const newList = scoringList.map((c: ScoringCriteria) => c.id === id ? { ...c, [field]: value } : c);
    setLocalData({
      ...localData,
      scoringSettings: { ...localData.scoringSettings, [activeCat]: newList }
    });
  };

  const removeCriteria = (id: string) => {
    const newList = scoringList.filter((c: ScoringCriteria) => c.id !== id);
    setLocalData({
      ...localData,
      scoringSettings: { ...localData.scoringSettings, [activeCat]: newList }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Scoring Setup</h2>
        <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSave} /> Save Changes
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/4 bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="font-semibold mb-4 text-gray-700">Presentation Types</h3>
          <ul className="space-y-2">
            {localData.categories.map((cat: Category) => (
              <li key={cat.id}>
                <button 
                  onClick={() => setActiveCat(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded ${activeCat === cat.id ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="w-3/4 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-semibold mb-6 text-gray-800">Criteria for {localData.categories.find((c: Category) => c.id === activeCat)?.name}</h3>
          
          <div className="space-y-4">
            {scoringList.map((criteria: ScoringCriteria) => (
              <div key={criteria.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <input 
                  value={criteria.name}
                  onChange={e => updateCriteria(criteria.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  placeholder="Criteria Name"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Max Pts:</span>
                  <input 
                    type="number"
                    value={criteria.maxScore}
                    onChange={e => updateCriteria(criteria.id, 'maxScore', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-center"
                  />
                </div>
                <button onClick={() => removeCriteria(criteria.id)} className="text-red-500 hover:text-red-700 p-2">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            <button onClick={addCriteria} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-orange-500 hover:text-orange-500 mt-4">
              <FontAwesomeIcon icon={faPlus} /> Add Criteria
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-end">
            <span className="font-semibold text-gray-700">Total Possible Score: </span>
            <span className="ml-2 font-bold text-xl text-orange-600">
              {scoringList.reduce((sum: number, c: ScoringCriteria) => sum + (c.maxScore || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
