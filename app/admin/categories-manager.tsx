'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';

import { AppData, Category, SubCategory } from '../types';

export default function CategoriesManager({ data, onSave }: { data: AppData, onSave: (d: AppData) => void }) {
  const [localData, setLocalData] = useState<AppData>(data);

  const handleSave = () => onSave(localData);

  const addCategory = () => {
    const newCat = { id: Date.now().toString(), name: 'New Presentation Type', subCategories: [] };
    setLocalData({ ...localData, categories: [...localData.categories, newCat] });
  };

  const updateCategoryName = (catId: string, name: string) => {
    const newCats = localData.categories.map((c: Category) => c.id === catId ? { ...c, name } : c);
    setLocalData({ ...localData, categories: newCats });
  };

  const removeCategory = (catId: string) => {
    const newCats = localData.categories.filter((c: Category) => c.id !== catId);
    setLocalData({ ...localData, categories: newCats });
  };

  const addSubCategory = (catId: string) => {
    const newSub: SubCategory = { id: Date.now().toString(), name: 'New Sub Category' };
    const newCats = localData.categories.map((c: Category) => 
      c.id === catId ? { ...c, subCategories: [...c.subCategories, newSub] } : c
    );
    setLocalData({ ...localData, categories: newCats });
  };

  const updateSubCategoryName = (catId: string, subId: string, name: string) => {
    const newCats = localData.categories.map((c: Category) => {
      if (c.id === catId) {
        return { ...c, subCategories: c.subCategories.map((s: SubCategory) => s.id === subId ? { ...s, name } : s) };
      }
      return c;
    });
    setLocalData({ ...localData, categories: newCats });
  };

  const removeSubCategory = (catId: string, subId: string) => {
    const newCats = localData.categories.map((c: Category) => {
      if (c.id === catId) {
        return { ...c, subCategories: c.subCategories.filter((s: SubCategory) => s.id !== subId) };
      }
      return c;
    });
    setLocalData({ ...localData, categories: newCats });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Categories</h2>
        <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <FontAwesomeIcon icon={faSave} /> Save Changes
        </button>
      </div>
      
      {localData.categories.map((cat: Category) => (
        <div key={cat.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <input 
              value={cat.name} 
              onChange={e => updateCategoryName(cat.id, e.target.value)}
              className="text-lg font-bold border-b border-gray-300 focus:border-orange-500 outline-none flex-1 py-1"
            />
            <button onClick={() => removeCategory(cat.id)} className="text-red-500 hover:text-red-700">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
          
          <div className="pl-6 border-l-2 border-gray-100 space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Sub-categories</h4>
            {cat.subCategories.map((sub: SubCategory) => (
              <div key={sub.id} className="flex items-center gap-4">
                <input 
                  value={sub.name} 
                  onChange={e => updateSubCategoryName(cat.id, sub.id, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <button onClick={() => removeSubCategory(cat.id, sub.id)} className="text-red-500 hover:text-red-700">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            <button onClick={() => addSubCategory(cat.id)} className="text-orange-600 text-sm font-medium hover:underline flex items-center gap-1 mt-2">
              <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Add Sub-category
            </button>
          </div>
        </div>
      ))}
      
      <button onClick={addCategory} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors">
        <FontAwesomeIcon icon={faPlus} /> Add New Presentation Type
      </button>
    </div>
  );
}
