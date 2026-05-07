'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [topNLimits, setTopNLimits] = useState<Record<string, number>>({});
  const printRef = useRef<HTMLDivElement>(null);

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

  const presentationLookup = useMemo(() => {
    const map: Record<string, { presentationTypeId: string; subCategoryId: string }> = {};
    (data.presentations || []).forEach((p: Presentation) => {
      map[p.title] = { presentationTypeId: p.presentationTypeId, subCategoryId: p.subCategoryId };
    });
    return map;
  }, [data.presentations]);

  const resultsByCatSub = useMemo(() => {
    if (!data.categories) return {};
    const presentationAggregates: Record<string, { total: number; count: number; type: string; subCategoryId: string }> = {};
    scores.forEach((s) => {
      if (!presentationAggregates[s.presentationTitle]) {
        const lookup = presentationLookup[s.presentationTitle];
        presentationAggregates[s.presentationTitle] = {
          total: 0, count: 0, type: s.presentationType,
          subCategoryId: lookup?.subCategoryId || '',
        };
      }
      presentationAggregates[s.presentationTitle].total += s.totalScore;
      presentationAggregates[s.presentationTitle].count += 1;
    });
    const rankedList: RankedPresentation[] = Object.entries(presentationAggregates).map(([title, agg]) => ({
      title, presentationType: agg.type, subCategoryId: agg.subCategoryId,
      avgScore: agg.total / agg.count, judgeCount: agg.count,
    }));
    const grouped: Record<string, Record<string, RankedPresentation[]>> = {};
    data.categories.forEach((cat: Category) => {
      grouped[cat.id] = {};
      (cat.subCategories || []).forEach((sub: SubCategory) => {
        const items = rankedList
          .filter((p) => p.presentationType === cat.id && p.subCategoryId === sub.id)
          .sort((a, b) => b.avgScore - a.avgScore)
          .map((p, index) => ({ ...p, rank: index + 1 }));
        if (items.length > 0) grouped[cat.id][sub.id] = items;
      });
    });
    return grouped;
  }, [scores, data.categories, presentationLookup]);

  const detailData = useMemo(() => {
    if (!detailTitle || !detailType) return null;
    const entries = scores.filter((s) => s.presentationTitle?.toUpperCase() === detailTitle?.toUpperCase());
    if (entries.length === 0) return null;
    const pres = data.presentations?.find((p: Presentation) => p.title.toUpperCase() === detailTitle?.toUpperCase());
    const subCategoryId = pres?.subCategoryId || '';
    const criteria: ScoringCriteria[] = data.scoringSettings?.[subCategoryId] || [];
    let criteriaColumns: { id: string; name: string }[] = criteria.map((c) => ({ id: c.id, name: c.name }));
    if (criteriaColumns.length === 0 && entries.length > 0) {
      const allKeys = new Set<string>();
      entries.forEach((e) => { if (e.scores) Object.keys(e.scores).forEach((k) => allKeys.add(k)); });
      criteriaColumns = Array.from(allKeys).map((k) => ({ id: k, name: k }));
    }
    return { entries, criteriaColumns };
  }, [detailTitle, detailType, scores, data]);

  const getTopNKey = (catId: string, subId: string) => `${catId}::${subId}`;
  const setTopN = (catId: string, subId: string, value: number) => {
    setTopNLimits((prev) => ({ ...prev, [getTopNKey(catId, subId)]: value }));
  };
  const getTopN = (catId: string, subId: string) => topNLimits[getTopNKey(catId, subId)] || 0;

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  // Get unique judges who scored presentations in a specific subcategory
  const getJudgesForSubCategory = (catId: string, subId: string): string[] => {
    const presInSub = (data.presentations || [])
      .filter((p: Presentation) => p.presentationTypeId === catId && p.subCategoryId === subId)
      .map((p: Presentation) => p.title);
    const judgeSet = new Set<string>();
    scores.forEach((s) => {
      if (presInSub.some((t) => t.toUpperCase() === s.presentationTitle?.toUpperCase())) {
        judgeSet.add(s.judgeName || s.judgeId);
      }
    });
    return Array.from(judgeSet).sort();
  };

  // Print a single subcategory as a professional report
  const handlePrintSubCategory = (catName: string, subName: string, catId: string, subId: string) => {
    const results = resultsByCatSub[catId]?.[subId] || [];
    const topN = getTopN(catId, subId);
    const displayResults = topN > 0 ? results.slice(0, topN) : results;
    const judges = getJudgesForSubCategory(catId, subId);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = displayResults.map((r) => `
      <tr style="${r.rank === 1 ? 'background:#fffbeb;' : ''}">
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;font-size:${r.rank! <= 3 ? '14px' : '12px'};color:${r.rank! <= 3 ? '#c2410c' : '#6b7280'};">
          ${r.rank}${getRankSuffix(r.rank!)}
        </td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;font-size:12px;">${r.title.toUpperCase()}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;font-size:14px;color:#ea580c;">${r.avgScore.toFixed(2)}</td>
      </tr>
    `).join('');

    const judgeSignatures = judges.map((name) => `
      <div style="text-align:center;">
        <div style="height:50px;"></div>
        <div style="border-top:1px solid #111; width:80%; margin:0 auto; padding-top:8px;">
          <div style="font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">${name}</div>
          <div style="font-size:11px;color:#6b7280;">Panel Judge</div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${catName} - ${subName} Results</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#111827; padding:32px 40px; }
        @page { size: landscape; margin:15mm 12mm; }
        @media print { body { padding:0; } }
      </style></head><body>

      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;border-bottom:3px double #e5e7eb;padding-bottom:24px;">
        <img src="/img/TechtopiaWordmark_Colored.png" alt="Logo" style="height:48px;margin-bottom:12px;" onerror="this.style.display='none'" />
        <h1 style="font-size:22px;font-weight:800;color:#111827;margin-bottom:4px;">OFFICIAL TABULATION RESULTS</h1>
        <div style="font-size:14px;color:#6b7280;font-weight:500;">${dateStr}</div>
      </div>

      <!-- Category / SubCategory Info -->
      <div style="margin-bottom:24px;">
        <div style="display:flex;"> 
          <div style="font-size:16px;color:#111827;margin-top:2px;margin-right:10px;">Category:</div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-top:2px;"> ${catName}</div>
        </div>  
        <div style="display:flex;">
          <div style="font-size:16px;color:#111827;margin-top:2px;margin-right:10px;">Sub-Category :</div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-top:2px;"> ${subName}</div>
        </div>
      </div>
      <!-- Results Table -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-radius:8px;overflow:hidden;margin-bottom:32px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;border-bottom:2px solid #d1d5db;width:70px;">Rank</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;border-bottom:2px solid #d1d5db;">Presentation Title</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;border-bottom:2px solid #d1d5db;width:110px;">Avg Score</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <!-- Judge Signatures Section -->
      <div style="margin-top:40px;border-top:2px solid #e5e7eb;padding-top:24px;">
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:24px;">Panel of Judges — Conforme</h3>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:32px 24px;">
          ${judgeSignatures}
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top:48px;border-top:1px solid #e5e7eb;padding-top:16px;text-align:center;">
        <p style="font-size:10px;color:#9ca3af;">This is a system-generated document. Printed on ${dateStr}.</p>
      </div>

    </body></html>`);

    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
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
      {data.categories.map((cat: Category) => {
        const catSubs = resultsByCatSub[cat.id] || {};
        const subCategoriesWithResults = (cat.subCategories || []).filter((sub: SubCategory) => catSubs[sub.id]?.length > 0);

        if (subCategoriesWithResults.length === 0) {
          return (
            <div key={cat.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
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
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <FontAwesomeIcon icon={faTrophy} className="text-sm" />
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
            </div>

            {subCategoriesWithResults.map((sub: SubCategory) => {
              const results = catSubs[sub.id] || [];
              const topN = getTopN(cat.id, sub.id);
              const displayResults = topN > 0 ? results.slice(0, topN) : results;

              return (
                <div key={sub.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{sub.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {results.length} presentation{results.length !== 1 ? 's' : ''} ranked
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                      <button
                        onClick={() => handlePrintSubCategory(cat.name, sub.name, cat.id, sub.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                      >
                        <FontAwesomeIcon icon={faPrint} className="text-xs" />
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Presentation Title</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Judges</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Avg Score</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {displayResults
                          .map((result) => ({ ...result, title: result.title.toUpperCase() }))
                          .map((result) => (
                          <tr key={result.title} className={`hover:bg-gray-50/50 transition-colors ${result.rank === 1 ? 'bg-orange-50/30' : ''}`}>
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
                              <span className="text-xl font-bold text-orange-600">{result.avgScore.toFixed(2)}</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => { setDetailTitle(result.title); setDetailType(result.presentationType); }}
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

                  {topN > 0 && results.length > topN && (
                    <p className="text-xs text-gray-400 mt-3 text-right">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setDetailTitle(null); setDetailType(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 truncate">{detailTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">Scores from {detailData.entries.length} judge{detailData.entries.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => { setDetailTitle(null); setDetailType(null); }} className="flex-shrink-0 ml-4 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky left-0 bg-gray-50 z-10">Judge</th>
                      {detailData.criteriaColumns.map((col) => (
                        <th key={col.id} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap">{col.name}</th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider border-b border-gray-200 bg-orange-50/50">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detailData.entries.map((entry, idx) => (
                      <tr key={`${entry.judgeId}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">{entry.judgeName || entry.judgeId}</td>
                        {detailData.criteriaColumns.map((col) => {
                          const val = entry.scores?.[col.id];
                          return <td key={col.id} className="px-4 py-3 text-center text-gray-700 font-medium">{val !== undefined && val !== '' ? val : '—'}</td>;
                        })}
                        <td className="px-4 py-3 text-center font-bold text-orange-600 bg-orange-50/30">{entry.totalScore}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="px-4 py-3 font-bold text-gray-700 sticky left-0 bg-gray-50 z-10 text-xs uppercase tracking-wider">Average</td>
                      {detailData.criteriaColumns.map((col) => {
                        const vals = detailData.entries.map((e) => { const v = e.scores?.[col.id]; return typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN; }).filter((v) => !isNaN(v));
                        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                        return <td key={col.id} className="px-4 py-3 text-center font-bold text-gray-700">{vals.length > 0 ? avg.toFixed(2) : '—'}</td>;
                      })}
                      <td className="px-4 py-3 text-center font-bold text-orange-700 bg-orange-50/50 text-lg">
                        {detailData.entries.length > 0 ? (detailData.entries.reduce((sum, e) => sum + e.totalScore, 0) / detailData.entries.length).toFixed(2) : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
