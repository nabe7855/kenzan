import React from 'react';
import { Theme, Rank, LEVEL_THRESHOLDS } from '../types';
import { getIconComponent } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ThemeListProps {
  themes: Theme[];
  activeThemeId: string | null;
  onSelectTheme: (id: string) => void;
}

export const ThemeList: React.FC<ThemeListProps> = ({ themes, activeThemeId, onSelectTheme }) => {
  const getRank = (seconds: number): Rank => {
    let currentRank = Rank.Beginner;
    for (const [rank, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
      if (seconds >= threshold) {
        currentRank = rank as Rank;
      }
    }
    return currentRank;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 px-1">スキル一覧</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {themes.map((theme) => {
          const Icon = getIconComponent(theme.icon);
          const rank = getRank(theme.totalSeconds);
          const hours = Math.floor(theme.totalSeconds / 3600);
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`w-full flex items-center p-4 rounded-xl border transition-all text-left group ${
                activeThemeId === theme.id
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${theme.color} bg-opacity-10 flex items-center justify-center mr-4 flex-shrink-0`}>
                <Icon className={`w-6 h-6 text-opacity-100 ${theme.color.replace('bg-', 'text-')}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold truncate ${activeThemeId === theme.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {theme.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <span className="font-medium text-slate-700">{hours}時間</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>{rank}</span>
                </div>
              </div>

              <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-1 ${
                activeThemeId === theme.id ? 'text-indigo-500' : ''
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};