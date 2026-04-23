import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

import { ScoringCriteria } from '../types';

interface ScoringTabulationProps {
  // titleId: string;
  title: string;
  presentationType: string;
  criteria: ScoringCriteria[];
  onBack: () => void;
}

export default function ScoringTabulation({ title, presentationType, criteria, onBack,}: ScoringTabulationProps) {
  const [scores, setScores] = useState<Record<string, number | string>>({});

  const handleScoreChange = (id: string, value: string, maxScore: number) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setScores((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    if (numValue < 0) numValue = 0;
    if (numValue > maxScore) numValue = maxScore;
    setScores((prev) => ({ ...prev, [id]: numValue }));
  };

  const totalScore = useMemo(() => {
    return criteria.reduce((sum, item) => {
      const val = scores[item.id];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
  }, [scores, criteria]);

  const handleSubmit = () => {
    const submissionData = {
      presentationTitle: title,
      presentationType: presentationType,
      scores: scores,
      totalScore: totalScore,
      submittedAt: new Date().toISOString()
    };
    
    console.log(JSON.stringify(submissionData, null, 2));
    
    // TODO: Put the saving of json data of scores here (e.g., fetch/API call to backend)
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8 border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-2 font-poppins text-sm font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            Back to Details
          </button>
          <h2 className="font-poppins text-2xl font-bold text-gray-900">
            Scoring: {title} 
          </h2>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            {presentationType === 'research'
              ? 'Research Presentation Rubric'
              : 'Poster Presentation Rubric'}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center min-w-[120px]">
          <span className="block text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
            Total Score
          </span>
          <span className="text-3xl font-bold text-gray-900">{totalScore}</span>
          <span className="text-gray-500 text-sm ml-1">/ 100</span>
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors gap-4"
          >
            <div className="flex-1">
              <h3 className="font-poppins font-semibold text-gray-900">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 font-poppins mt-1">
                Maximum points: {item.maxScore}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={item.maxScore}
                value={scores[item.id] !== undefined ? scores[item.id] : ''}
                onChange={(e) =>
                  handleScoreChange(item.id, e.target.value, item.maxScore)
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 font-poppins text-center font-semibold text-lg text-gray-900"
                placeholder="0"
              />
              <span className="text-gray-400 font-poppins">pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button 
          onClick={handleSubmit}
          className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white font-poppins font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <FontAwesomeIcon icon={faSave} className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Submit Evaluation
        </button>
      </div>
    </div>
  );
}
