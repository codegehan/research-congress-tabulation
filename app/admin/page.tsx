'use client';

import { useState, useEffect } from 'react';
import NavBar from '../components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import CategoriesManager from './categories-manager';
import ScoringManager from './scoring-manager';
import PresentationsManager from './presentations-manager';
import JudgesManager from './judges-manager';
import { AppData } from '../types';
import { toast } from 'react-toastify';
import ResultsSummary from './results-summary';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState({ name: 'Loading...', email: '' });

  useEffect(() => {
    const adminData = localStorage.getItem('currentAdmin');
    try {
      const admin = JSON.parse(adminData || '{}');
      setAdminUser({ name: admin.name, email: "sudo@gmail.com" });
    } catch (error) {
      console.error('Failed to parse admin data:', error);
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(d => {
        setData({
          categories: d.categories || [],
          scoringSettings: d.scoringSettings || {},
          presentations: d.presentations || [],
          judges: d.judges || [],
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setData({ categories: [], scoringSettings: {}, presentations: [], judges: [] });
        setIsLoading(false);
        toast.error('Failed to load data from server');
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
      <NavBar currentUser={{ name: adminUser.name, email: adminUser.email }} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8 gap-4 print:hidden">
           <button 
             onClick={() => router.push('/dashboard')} 
             className="text-gray-500 hover:text-orange-600 flex items-center gap-2 font-medium"
           >
             <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
           </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 print:hidden">Administrator Panel</h1>
        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b print:hidden">
          {[
            { id: 'categories', label: 'Categories' },
            { id: 'scoring', label: 'Scoring Setup' },
            { id: 'presentations', label: 'Presentations' },
            { id: 'judges', label: 'Judges' },
            { id: 'results', label: 'Results Summary' }
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
          {activeTab === 'judges' && <JudgesManager data={data} onSave={saveData} />}
          {activeTab === 'results' && <ResultsSummary data={data} />}
        </div>
      </div>
    </div>
  );
}
