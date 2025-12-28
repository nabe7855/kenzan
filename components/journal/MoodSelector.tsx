
import React from 'react';
import { Mood } from '../../types';

interface MoodSelectorProps {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  const moods: { type: Mood; emoji: string; label: string; color: string }[] = [
    { type: 'excellent', emoji: '😆', label: '最高', color: 'bg-emerald-100 border-emerald-500' },
    { type: 'good', emoji: '🙂', label: '良い', color: 'bg-lime-100 border-lime-500' },
    { type: 'neutral', emoji: '😐', label: '普通', color: 'bg-yellow-100 border-yellow-500' },
    { type: 'bad', emoji: '😞', label: '悪い', color: 'bg-orange-100 border-orange-500' },
    { type: 'terrible', emoji: '😫', label: '最悪', color: 'bg-red-100 border-red-500' },
  ];

  return (
    <div className="flex justify-between gap-2">
      {moods.map((m) => (
        <button
          key={m.type}
          type="button"
          onClick={() => onSelect(m.type)}
          className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
            selectedMood === m.type
              ? `${m.color} scale-105 shadow-sm`
              : 'bg-white border-transparent hover:bg-slate-50'
          }`}
        >
          <span className="text-2xl mb-1">{m.emoji}</span>
          <span className="text-[10px] font-bold text-slate-600">{m.label}</span>
        </button>
      ))}
    </div>
  );
};
