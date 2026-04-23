'use client';

import { useState, useEffect } from 'react';
import NavBar from '../components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import CategoriesManager from './categories-manager';
import ScoringManager from './scoring-manager';
import PresentationsManager from './presentations-manager';
import { AppData } from '../types';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      });
  }, []);

  const saveData = async (newData: AppData) => {
    setIsLoading(true);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      setData(newData);
      toast.success("Data saved successfully!");
    } catch (e) {
      toast.error("Failed to save data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentUser={{ name: 'Admin User', email: 'admin@codegehan.com' }} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8 gap-4">
           <button 
             onClick={() => router.push('/dashboard')} 
             className="text-gray-500 hover:text-orange-600 flex items-center gap-2 font-medium"
           >
             <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
           </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Administrator Panel</h1>
        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'categories', label: 'Categories' },
            { id: 'scoring', label: 'Scoring Setup' },
            { id: 'presentations', label: 'Presentations & Researchers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'categories' && <CategoriesManager data={data} onSave={saveData} />}
          {activeTab === 'scoring' && <ScoringManager data={data} onSave={saveData} />}
          {activeTab === 'presentations' && <PresentationsManager data={data} onSave={saveData} />}
        </div>
      </div>
    </div>
  );
}
