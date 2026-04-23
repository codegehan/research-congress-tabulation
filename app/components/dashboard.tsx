'use client';

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faLayerGroup,
  faBuilding,
  faTrophy,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import NavBar from './navbar';
import AccordionSection from './accordion';
import CategoryItem from './category-items';
import PresentationDetails from './presentation-details';
import ScoringTabulation from './scoring-tabulation';
import { AppData, Category, SubCategory, Presentation, Author } from '../types';

// ============ Main Dashboard Component ============
export default function Dashboard() {
  const [currentUser] = useState({ name: 'John Doe', email: 'john@example.com' });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      });
  }, []);
  
  // Presentation state
  const [openPresentations, setOpenPresentations] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // Title selection
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [presentationType, setPresentationType] = useState<string | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const presentationsData = useMemo(() => {
    if (!data || !data.categories) return [];
    return data.categories.map((cat: Category, idx: number) => ({
      id: cat.id,
      name: cat.name,
      icon: idx === 0 ? faBook : faLayerGroup,
      categories: (cat.subCategories || []).map((sub: SubCategory) => ({
        id: sub.id,
        name: sub.name,
        titles: (data.presentations || [])
          .filter((p: Presentation) => p.presentationTypeId === cat.id && p.subCategoryId === sub.id)
          .map((p: Presentation) => p.title)
      }))
    }));
  }, [data]);

  const selectedPresentation = useMemo(() => {
    if (!data || !selectedTitle) return null;
    return data.presentations.find((p: Presentation) => p.title === selectedTitle) || { title: selectedTitle, authors: [] as Author[] };
  }, [data, selectedTitle]);

  // Handle scroll for back-to-top button
  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      setShowBackToTop(window.scrollY > 300);
    }
  }, []);

  // Set up scroll listener with useEffect
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Handle title selection with smooth scroll
  const handleSelectTitle = useCallback((title: string, type: string) => {
    setSelectedTitle(title);
    setPresentationType(type);
    setIsScoring(false);
    // Scroll to details section after state update
    setTimeout(() => {
      const detailsElement = document.getElementById('title-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }, []);

  // Callbacks with useCallback for optimization
  const togglePresentation = useCallback((id: string) => {
    setOpenPresentations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        setExpandedCategory(null);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategory((prev) => (prev === catId ? null : catId));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <NavBar currentUser={currentUser} />

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Accordions */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-24">
              {/* Presentations Accordion */}
              {presentationsData.map((presentation) => (
                <AccordionSection
                  key={presentation.id}
                  title={presentation.name}
                  icon={presentation.icon}
                  colorClass="hover:bg-orange-50 transition-colors"
                  isOpen={openPresentations.has(presentation.id)}
                  onToggle={() => togglePresentation(presentation.id)}
                >
                  {presentation.categories.map((category) => (

                    <CategoryItem
                      key={category.id}
                      category={category}
                      isExpanded={expandedCategory === category.id}
                      selectedTitle={selectedTitle}
                      onToggle={() => toggleCategory(category.id)}
                      onSelectTitle={(title) => handleSelectTitle(title, presentation.id as 'research' | 'poster')}
                      colorClass="bg-orange-50"
                    />
      
                  ))}
                </AccordionSection>
              ))}
            </div>
          </div>
          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-100 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : selectedPresentation && presentationType ? (
              isScoring ? (
                <ScoringTabulation
                  // titleId={}
                  title={selectedPresentation.title}
                  presentationType={presentationType}
                  criteria={data?.scoringSettings?.[presentationType] || []}
                  onBack={() => setIsScoring(false)}
                />
              ) : (
                <PresentationDetails
                  presentation={selectedPresentation}
                  onScoringClick={() => setIsScoring(true)}
                />
              )
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-orange-100 to-purple-100 rounded-full p-6 shadow-md">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="w-10 h-10 text-gray-600"
                    />
                  </div>
                </div>
                <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-2">
                  Select a Presentation
                </h3>
                <p className="font-poppins text-gray-600 leading-relaxed">
                  Choose a presentation category from the left/top navigation to view
                  details, evaluation criteria, and access the scoring
                  procedures for submission.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
          title="Back to top"
        >
          <FontAwesomeIcon
            icon={faArrowUp}
            className="w-6 h-6 group-hover:scale-110 transition-transform"
          />
        </button>
      )}
    </div>
  );
}
