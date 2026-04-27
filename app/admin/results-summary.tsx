'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { AppData, Category, Presentation } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faTrophy, faMedal } from '@fortawesome/free-solid-svg-icons';

interface ScoreEntry {
  presentationTitle: string;
  presentationType: string;
  totalScore: number;
  judgeId: string;
  judgeName: string;
  submittedAt: string;
}

interface RankedPresentation {
  title: string;
  presentationType: string;
  avgScore: number;
  judgeCount: number;
  rank?: number;
}

export default function ResultsSummary({ data }: { data: AppData }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'scores'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoreData: ScoreEntry[] = [];
      snapshot.forEach((doc) => {
        scoreData.push(doc.data() as ScoreEntry);
      });
      setScores(scoreData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resultsByCategory = useMemo(() => {
    if (!data.categories) return {};

    // 1. Group scores by presentation title
    const presentationAggregates: Record<string, { total: number; count: number; type: string }> = {};

    scores.forEach((s) => {
      if (!presentationAggregates[s.presentationTitle]) {
        presentationAggregates[s.presentationTitle] = { total: 0, count: 0, type: s.presentationType };
      }
      presentationAggregates[s.presentationTitle].total += s.totalScore;
      presentationAggregates[s.presentationTitle].count += 1;
    });

    // 2. Calculate averages and create list
    const rankedList: RankedPresentation[] = Object.entries(presentationAggregates).map(([title, agg]) => ({
      title,
      presentationType: agg.type,
      avgScore: agg.total / agg.count,
      judgeCount: agg.count,
    }));

    // 3. Separate by category and sort by rank
    const grouped: Record<string, RankedPresentation[]> = {};
    data.categories.forEach((cat) => {
      grouped[cat.id] = rankedList
        .filter((p) => p.presentationType === cat.id)
        .sort((a, b) => b.avgScore - a.avgScore)
        .map((p, index) => ({ ...p, rank: index + 1 }));
    });

    return grouped;
  }, [scores, data.categories]);

  const handlePrint = (categoryId: string) => {
    const printContent = document.getElementById(`print-section-${categoryId}`);
    if (printContent) {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {data.categories.map((cat) => {
        const categoryResults = resultsByCategory[cat.id] || [];
        return (
          <div key={cat.id} id={`print-section-${cat.id}`} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 break-after-page">
            <div className="flex justify-between items-center mb-6 print:mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FontAwesomeIcon icon={faTrophy} className="text-orange-500" />
                  {cat.name} Results
                </h2>
                <p className="text-gray-500 text-sm mt-1 print:block hidden">
                  Official Tabulation Summary • {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handlePrint(cat.id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors print:hidden"
              >
                <FontAwesomeIcon icon={faPrint} />
                Print Results
              </button>
            </div>

            {categoryResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Research Presentation Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Judges</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Average Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoryResults.map((result) => (
                      <tr key={result.title} className={`hover:bg-gray-50/50 transition-colors ${result.rank === 1 ? 'bg-orange-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {result.rank === 1 && <FontAwesomeIcon icon={faMedal} className="text-yellow-500" />}
                            {result.rank === 2 && <FontAwesomeIcon icon={faMedal} className="text-gray-400" />}
                            {result.rank === 3 && <FontAwesomeIcon icon={faMedal} className="text-amber-600" />}
                            <span className={`font-bold ${result.rank! <= 3 ? 'text-lg' : 'text-gray-600'}`}>
                              {result.rank}
                              {result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : result.rank === 3 ? 'rd' : 'th'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 leading-tight">{result.title}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {result.judgeCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-orange-600">
                            {result.avgScore.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No scores submitted yet for this category.</p>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @media print {
          body {
            background: white !important;
          }
          .break-after-page {
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin-bottom: 2rem !important;
          }
          table {
            border: 1px solid #e5e7eb !important;
          }
          th {
            background-color: #f9fafb !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
