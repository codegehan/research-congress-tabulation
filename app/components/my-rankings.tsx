import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AppData, Category, SubCategory, Presentation } from '../types';

interface MyRankingsProps {
  scores: any[];
  data: AppData;
  currentJudge: any;
}

export default function MyRankings({ scores, data, currentJudge }: MyRankingsProps) {
  const presentationLookup = useMemo(() => {
    const map: Record<string, { presentationTypeId: string; subCategoryId: string }> = {};
    (data.presentations || []).forEach((p: Presentation) => {
      map[p.title] = { presentationTypeId: p.presentationTypeId, subCategoryId: p.subCategoryId };
    });
    return map;
  }, [data.presentations]);

  const rankingsByCatSub = useMemo(() => {
    if (!data.categories) return {};

    const grouped: Record<string, Record<string, any[]>> = {};

    data.categories.forEach((cat: Category) => {
      grouped[cat.id] = {};
      
      let subCats = cat.subCategories || [];
      if (currentJudge?.assignedSubCategoryName) {
        subCats = subCats.filter((s: SubCategory) => s.name === currentJudge.assignedSubCategoryName);
      }

      subCats.forEach((sub: SubCategory) => {
        // Find all scores for presentations in this cat and subcat
        const relevantScores = scores.filter(s => {
          const lookup = presentationLookup[s.presentationTitle];
          return lookup && lookup.presentationTypeId === cat.id && lookup.subCategoryId === sub.id;
        });

        if (relevantScores.length > 0) {
          // Sort descending by totalScore
          const sortedByScore = relevantScores.sort((a, b) => b.totalScore - a.totalScore);
          
          const ranked: any[] = [];
          let currentRank = 0;
          let i = 0;
          while (i < sortedByScore.length) {
            let j = i;
            while (j < sortedByScore.length && sortedByScore[j].totalScore === sortedByScore[i].totalScore) {
              j++;
            }
            
            currentRank++;
            for (let k = i; k < j; k++) {
              ranked.push({ ...sortedByScore[k], rank: currentRank });
            }
            
            i = j;
          }
          grouped[cat.id][sub.id] = ranked;
        }
      });
    });

    return grouped;
  }, [scores, data.categories, presentationLookup, currentJudge]);

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-100 animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-orange-100 to-purple-100 rounded-full p-6 shadow-md">
            <FontAwesomeIcon icon={faTrophy} className="w-10 h-10 text-gray-600" />
          </div>
        </div>
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
        <p className="font-poppins text-gray-600 leading-relaxed">
          You haven't scored any presentations yet. Your rankings will appear here once you submit scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faTrophy} className="text-orange-500" />
          My Rankings
        </h2>
        <p className="text-gray-500 mt-2 font-poppins text-sm">
          Here is how you have ranked the presentations based on your submitted scores.
        </p>
      </div>

      {data.categories.map((cat: Category) => {
        const catSubs = rankingsByCatSub[cat.id] || {};
        const subCategoriesWithResults = Object.keys(catSubs).map(subId => {
          return cat.subCategories.find(s => s.id === subId);
        }).filter(Boolean) as SubCategory[];

        if (subCategoriesWithResults.length === 0) {
          return null;
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

              return (
                <div key={sub.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-800">{sub.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {results.length} presentation{results.length !== 1 ? 's' : ''} scored
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Presentation Title</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">My Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((result) => (
                          <tr key={result.presentationTitle} className={`hover:bg-gray-50/50 transition-colors ${result.rank === 1 ? 'bg-orange-50/30' : ''}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {result.rank === 1 && <FontAwesomeIcon icon={faMedal} className="text-yellow-500" />}
                                {result.rank === 2 && <FontAwesomeIcon icon={faMedal} className="text-gray-400" />}
                                {result.rank === 3 && <FontAwesomeIcon icon={faMedal} className="text-amber-600" />}
                                <span className={`font-bold ${result.rank <= 3 ? 'text-lg text-orange-600' : 'text-gray-600'}`}>
                                  {result.rank}{getRankSuffix(result.rank)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <p className="font-semibold text-gray-900 leading-tight">{result.presentationTitle.toUpperCase()}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-xl font-bold text-orange-600">{result.totalScore}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
