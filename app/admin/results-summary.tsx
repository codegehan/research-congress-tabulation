'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { AppData, Category, SubCategory, Presentation, ScoringCriteria } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faTrophy, faMedal, faTableCells, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';

interface ScoreEntry {
  presentationTitle: string;
  presentationType: string;
  totalScore: number;
  judgeId: string;
  judgeName: string;
  submittedAt: string;
  scores: Record<string, number | string>;
}

interface RankedPresentation {
  title: string;
  presentationType: string;
  subCategoryId: string;
  avgScore: number;
  judgeCount: number;
  rank?: number;
}

export default function ResultsSummary({ data }: { data: AppData }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTitle, setDetailTitle] = useState<string | null>(null);
  const [detailType, setDetailType] = useState<string | null>(null);
  // Top-N limit per subcategory table, keyed by "catId::subId"
  const [topNLimits, setTopNLimits] = useState<Record<string, number>>({});

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

  // Build a lookup: presentationTitle -> { presentationTypeId, subCategoryId }
  const presentationLookup = useMemo(() => {
    const map: Record<string, { presentationTypeId: string; subCategoryId: string }> = {};
    (data.presentations || []).forEach((p: Presentation) => {
      map[p.title] = { presentationTypeId: p.presentationTypeId, subCategoryId: p.subCategoryId };
    });
    return map;
  }, [data.presentations]);

  // Group and rank by category → subcategory
  const resultsByCatSub = useMemo(() => {
    if (!data.categories) return {};

    // 1. Aggregate scores per presentation title
    const presentationAggregates: Record<string, { total: number; count: number; type: string; subCategoryId: string }> = {};

    scores.forEach((s) => {
      if (!presentationAggregates[s.presentationTitle]) {
        const lookup = presentationLookup[s.presentationTitle];
        presentationAggregates[s.presentationTitle] = {
          total: 0,
          count: 0,
          type: s.presentationType,
          subCategoryId: lookup?.subCategoryId || '',
        };
      }
      presentationAggregates[s.presentationTitle].total += s.totalScore;
      presentationAggregates[s.presentationTitle].count += 1;
    });

    // 2. Build ranked list
    const rankedList: RankedPresentation[] = Object.entries(presentationAggregates).map(([title, agg]) => ({
      title,
      presentationType: agg.type,
      subCategoryId: agg.subCategoryId,
      avgScore: agg.total / agg.count,
      judgeCount: agg.count,
    }));

    // 3. Group: catId -> subId -> sorted list with ranks
    const grouped: Record<string, Record<string, RankedPresentation[]>> = {};

    data.categories.forEach((cat: Category) => {
      grouped[cat.id] = {};
      (cat.subCategories || []).forEach((sub: SubCategory) => {
        const items = rankedList
          .filter((p) => p.presentationType === cat.id && p.subCategoryId === sub.id)
          .sort((a, b) => b.avgScore - a.avgScore)
          .map((p, index) => ({ ...p, rank: index + 1 }))
        if (items.length > 0) {
          grouped[cat.id][sub.id] = items;
        }
      });
    });

    return grouped;
  }, [scores, data.categories, presentationLookup]);

  // Build detail table data for the selected presentation
  const detailData = useMemo(() => {
    if (!detailTitle || !detailType) return null;

    const entries = scores.filter((s) => s.presentationTitle === detailTitle);
    if (entries.length === 0) return null;

    const pres = data.presentations?.find((p: Presentation) => p.title === detailTitle);
    const subCategoryId = pres?.subCategoryId || '';

    const criteria: ScoringCriteria[] = data.scoringSettings?.[subCategoryId] || [];
    let criteriaColumns: { id: string; name: string }[] = criteria.map((c) => ({ id: c.id, name: c.name }));

    if (criteriaColumns.length === 0 && entries.length > 0) {
      const allKeys = new Set<string>();
      entries.forEach((e) => {
        if (e.scores) Object.keys(e.scores).forEach((k) => allKeys.add(k));
      });
      criteriaColumns = Array.from(allKeys).map((k) => ({ id: k, name: k }));
    }

    return { entries, criteriaColumns };
  }, [detailTitle, detailType, scores, data]);

  const getTopNKey = (catId: string, subId: string) => `${catId}::${subId}`;

  const setTopN = (catId: string, subId: string, value: number) => {
    setTopNLimits((prev) => ({ ...prev, [getTopNKey(catId, subId)]: value }));
  };

  const getTopN = (catId: string, subId: string) => topNLimits[getTopNKey(catId, subId)] || 0; // 0 = show all

  const handlePrint = () => {
    window.print();
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Global Print Button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faPrint} />
          Print All Results
        </button>
      </div>

      {data.categories.map((cat: Category) => {
        const catSubs = resultsByCatSub[cat.id] || {};
        const subCategoriesWithResults = (cat.subCategories || []).filter((sub: SubCategory) => catSubs[sub.id]?.length > 0);

        if (subCategoriesWithResults.length === 0) {
          return (
            <div key={cat.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 break-after-page">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon={faTrophy} className="text-orange-500" />
                {cat.name}
              </h2>
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No scores submitted yet for this category.</p>
              </div>
            </div>
          );
        }

        return (
          <div key={cat.id} className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <FontAwesomeIcon icon={faTrophy} className="text-sm" />
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
            </div>

            {/* SubCategory Tables */}
            {subCategoriesWithResults.map((sub: SubCategory) => {
              const results = catSubs[sub.id] || [];
              const topN = getTopN(cat.id, sub.id);
              const displayResults = topN > 0 ? results.slice(0, topN) : results;

              return (
                <div
                  key={sub.id}
                  id={`print-section-${cat.id}-${sub.id}`}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 break-after-page"
                >
                  {/* SubCategory Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {results.length} presentation{results.length !== 1 ? 's' : ''} ranked
                      </p>
                      <p className="text-gray-500 text-sm mt-1 print:block hidden">
                        Official Tabulation Summary • {cat.name} — {sub.name} • {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 print:hidden">
                      {/* Top N Dropdown */}
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-xs" />
                        <select
                          value={topN}
                          onChange={(e) => setTopN(cat.id, sub.id, parseInt(e.target.value))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all cursor-pointer"
                        >
                          <option value={0}>Show All</option>
                          <option value={3}>Top 3</option>
                          <option value={5}>Top 5</option>
                          <option value={10}>Top 10</option>
                          <option value={15}>Top 15</option>
                          <option value={20}>Top 20</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Presentation Title</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Judges</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Avg Score</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center print:hidden">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {displayResults
                        .map((result) => ({...result, title: result.title.toUpperCase()}))
                        .map((result) => (
                          <tr
                            key={result.title}
                            className={`hover:bg-gray-50/50 transition-colors ${result.rank === 1 ? 'bg-orange-50/30' : ''}`}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {result.rank === 1 && <FontAwesomeIcon icon={faMedal} className="text-yellow-500" />}
                                {result.rank === 2 && <FontAwesomeIcon icon={faMedal} className="text-gray-400" />}
                                {result.rank === 3 && <FontAwesomeIcon icon={faMedal} className="text-amber-600" />}
                                <span className={`font-bold ${result.rank! <= 3 ? 'text-lg' : 'text-gray-600'}`}>
                                  {result.rank}{getRankSuffix(result.rank!)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <p className="font-semibold text-gray-900 leading-tight">{result.title}</p>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {result.judgeCount}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-xl font-bold text-orange-600">
                                {result.avgScore.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center print:hidden">
                              <button
                                onClick={() => {
                                  setDetailTitle(result.title);
                                  setDetailType(result.presentationType);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                                title="View all judges' scores"
                              >
                                <FontAwesomeIcon icon={faTableCells} />
                                View Scores
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Show count info when filtered */}
                  {topN > 0 && results.length > topN && (
                    <p className="text-xs text-gray-400 mt-3 text-right print:hidden">
                      Showing top {topN} of {results.length} presentations
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Detail Scores Modal */}
      {detailTitle && detailData && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setDetailTitle(null); setDetailType(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 truncate">{detailTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Scores from {detailData.entries.length} judge{detailData.entries.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => { setDetailTitle(null); setDetailType(null); }}
                className="flex-shrink-0 ml-4 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky left-0 bg-gray-50 z-10">
                        Judge
                      </th>
                      {detailData.criteriaColumns.map((col) => (
                        <th
                          key={col.id}
                          className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap"
                        >
                          {col.name}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider border-b border-gray-200 bg-orange-50/50">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detailData.entries.map((entry, idx) => (
                      <tr key={`${entry.judgeId}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                          {entry.judgeName || entry.judgeId}
                        </td>
                        {detailData.criteriaColumns.map((col) => {
                          const val = entry.scores?.[col.id];
                          return (
                            <td key={col.id} className="px-4 py-3 text-center text-gray-700 font-medium">
                              {val !== undefined && val !== '' ? val : '—'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-orange-600 bg-orange-50/30">
                          {entry.totalScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Average Footer */}
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="px-4 py-3 font-bold text-gray-700 sticky left-0 bg-gray-50 z-10 text-xs uppercase tracking-wider">
                        Average
                      </td>
                      {detailData.criteriaColumns.map((col) => {
                        const vals = detailData.entries
                          .map((e) => {
                            const v = e.scores?.[col.id];
                            return typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
                          })
                          .filter((v) => !isNaN(v));
                        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                        return (
                          <td key={col.id} className="px-4 py-3 text-center font-bold text-gray-700">
                            {vals.length > 0 ? avg.toFixed(2) : '—'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-orange-700 bg-orange-50/50 text-lg">
                        {detailData.entries.length > 0
                          ? (detailData.entries.reduce((sum, e) => sum + e.totalScore, 0) / detailData.entries.length).toFixed(2)
                          : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
