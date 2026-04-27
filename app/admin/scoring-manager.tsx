'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';

import { AppData, Category, SubCategory, ScoringCriteria } from '../types';

export default function ScoringManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);

  // Build a flat list of all subcategories with their parent category name
  const allSubCategories = localData.categories.flatMap((cat: Category) =>
    (cat.subCategories || []).map((sub: SubCategory) => ({
      ...sub,
      parentId: cat.id,
      parentName: cat.name,
    }))
  );

  const [activeSub, setActiveSub] = useState(allSubCategories[0]?.id || '');

  const handleSave = () => onSave(localData);

  const scoringList = localData.scoringSettings[activeSub] || [];

  const addCriteria = () => {
    const newCriteria = { id: Date.now().toString(), name: 'New Criteria', maxScore: 10 };
    setLocalData({
      ...localData,
      scoringSettings: {
        ...localData.scoringSettings,
        [activeSub]: [...scoringList, newCriteria]
      }
    });
  };

  const updateCriteria = (id: string, field: string, value: any) => {
    const newList = scoringList.map((c: ScoringCriteria) => c.id === id ? { ...c, [field]: value } : c);
    setLocalData({
      ...localData,
      scoringSettings: { ...localData.scoringSettings, [activeSub]: newList }
    });
  };

  const removeCriteria = (id: string) => {
    const newList = scoringList.filter((c: ScoringCriteria) => c.id !== id);
    setLocalData({
      ...localData,
      scoringSettings: { ...localData.scoringSettings, [activeSub]: newList }
    });
  };

  const activeSubInfo = allSubCategories.find(s => s.id === activeSub);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Scoring Setup</h2>
        <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSave} /> Save Changes
        </button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar: subcategories grouped by category */}
        <div className="w-1/4 bg-white p-4 rounded-lg shadow border border-gray-200 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold mb-4 text-gray-700">Sub-Categories</h3>
          {localData.categories.map((cat: Category) => (
            <div key={cat.id} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">{cat.name}</h4>
              <ul className="space-y-1">
                {(cat.subCategories || []).map((sub: SubCategory) => (
                  <li key={sub.id}>
                    <button
                      onClick={() => setActiveSub(sub.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${activeSub === sub.id ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      {sub.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right panel: criteria for selected subcategory */}
        <div className="w-3/4 bg-white p-6 rounded-lg shadow border border-gray-200">
          {activeSubInfo ? (
            <>
              <div className="mb-6">
                <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">{activeSubInfo.parentName}</span>
                <h3 className="font-semibold text-gray-800 text-lg mt-1">Criteria for {activeSubInfo.name}</h3>
              </div>

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
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>No sub-categories found. Add sub-categories in the Categories tab first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
