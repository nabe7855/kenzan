import React from 'react';
import { Rank, LEVEL_THRESHOLDS } from '../types';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface LevelProgressProps {
  totalSeconds: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ totalSeconds }) => {
  // ランクの定義順序を取得
  const ranks = Object.keys(LEVEL_THRESHOLDS) as Rank[];
  
  // 現在のランク、次のランク、その次のランクを特定
  let currentRankIndex = 0;
  for (let i = 0; i < ranks.length; i++) {
    if (totalSeconds >= LEVEL_THRESHOLDS[ranks[i]]) {
      currentRankIndex = i;
    }
  }

  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[currentRankIndex + 1];
  const nextNextRank = ranks[currentRankIndex + 2];

  // 次のランクまでの進捗計算
  const currentThreshold = LEVEL_THRESHOLDS[currentRank];
  const nextThreshold = nextRank ? LEVEL_THRESHOLDS[nextRank] : LEVEL_THRESHOLDS[currentRank] * 2; // レジェンド以降は仮想
  
  const range = nextThreshold - currentThreshold;
  const progress = totalSeconds - currentThreshold;
  const percentage = Math.min(100, Math.max(0, (progress / range) * 100));
  
  const hoursToNext = Math.ceil((nextThreshold - totalSeconds) / 3600);

  // その次のランクまでの残り時間
  const nextNextThreshold = nextNextRank ? LEVEL_THRESHOLDS[nextNextRank] : null;
  const hoursToNextNext = nextNextThreshold 
    ? Math.ceil((nextNextThreshold - totalSeconds) / 3600) 
    : null;

  return (
    <div className="w-full mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-slate-800">{currentRank}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">NEXT: {nextRank || 'MAX'}</span>
          <span className="text-sm font-bold text-indigo-600">あと {hoursToNext.toLocaleString()} 時間</span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner mb-3">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
        </div>
      </div>

      {/* Milestone Roadmap */}
      {nextNextRank && hoursToNextNext && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 bg-white p-2 rounded-lg border border-slate-50">
          <Target className="w-3 h-3" />
          <span>さらにその先: </span>
          <span className="font-medium text-slate-600">{nextNextRank}</span>
          <span>まで</span>
          <span className="font-mono text-slate-600">あと {hoursToNextNext.toLocaleString()} 時間</span>
        </div>
      )}
      
      {!nextNextRank && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <TrendingUp className="w-3 h-3" />
          <span>頂点は目前です。歴史に名を刻みましょう。</span>
        </div>
      )}
    </div>
  );
};