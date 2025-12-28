import React from 'react';
import { Rank, LEVEL_THRESHOLDS } from '../types';

interface StatsCardProps {
  totalSeconds: number;
  rank: Rank;
}

export const StatsCard: React.FC<StatsCardProps> = ({ totalSeconds, rank }) => {
  const totalHours = Math.floor(totalSeconds / 3600);
  const nextRank = Object.keys(LEVEL_THRESHOLDS).find(
    (key) => LEVEL_THRESHOLDS[key as Rank] > totalSeconds
  ) as Rank | undefined;
  
  const nextThreshold = nextRank ? LEVEL_THRESHOLDS[nextRank] : 10000 * 3600;
  const progressToNext = Math.min(100, (totalSeconds / nextThreshold) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">総練習時間</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">{totalHours.toLocaleString()}</h3>
            <span className="text-slate-500">時間</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide">
          {rank}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>次へ: {nextRank || 'マスター'}</span>
          <span>{progressToNext.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-right">
          あと {Math.ceil((nextThreshold - totalSeconds) / 3600).toLocaleString()} 時間
        </p>
      </div>
    </div>
  );
};