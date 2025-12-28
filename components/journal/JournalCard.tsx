
import React from 'react';
import { JournalEntry, Mood } from '../../types';
import { MoreHorizontal, Calendar } from 'lucide-react';

interface JournalCardProps {
  entry: JournalEntry;
}

const MoodIcon: React.FC<{ mood: Mood }> = ({ mood }) => {
  const map = {
    excellent: { emoji: '😆', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    good: { emoji: '🙂', bg: 'bg-lime-100', text: 'text-lime-700' },
    neutral: { emoji: '😐', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    bad: { emoji: '😞', bg: 'bg-orange-100', text: 'text-orange-700' },
    terrible: { emoji: '😫', bg: 'bg-red-100', text: 'text-red-700' },
  };
  const m = map[mood];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${m.bg}`}>
      {m.emoji}
    </div>
  );
};

export const JournalCard: React.FC<JournalCardProps> = ({ entry }) => {
  const date = new Date(entry.createdAt);
  
  const renderContent = () => {
    switch (entry.framework) {
      case 'kpt':
        return (
          <div className="grid grid-cols-1 gap-2 text-sm mt-2">
            {entry.structuredContent.keep && (
              <div className="bg-indigo-50 p-2 rounded border-l-4 border-indigo-500">
                <span className="text-xs font-bold text-indigo-700 block">KEEP</span>
                {entry.structuredContent.keep}
              </div>
            )}
            {entry.structuredContent.problem && (
              <div className="bg-rose-50 p-2 rounded border-l-4 border-rose-500">
                <span className="text-xs font-bold text-rose-700 block">PROBLEM</span>
                {entry.structuredContent.problem}
              </div>
            )}
            {entry.structuredContent.try && (
              <div className="bg-emerald-50 p-2 rounded border-l-4 border-emerald-500">
                <span className="text-xs font-bold text-emerald-700 block">TRY</span>
                {entry.structuredContent.try}
              </div>
            )}
          </div>
        );
      case 'ywt':
        return (
           <div className="space-y-2 mt-2">
             <div className="flex gap-2"><span className="font-bold text-slate-500 w-4">Y</span> <span>{entry.structuredContent.y}</span></div>
             <div className="flex gap-2"><span className="font-bold text-slate-500 w-4">W</span> <span>{entry.structuredContent.w}</span></div>
             <div className="flex gap-2"><span className="font-bold text-slate-500 w-4">T</span> <span>{entry.structuredContent.t}</span></div>
           </div>
        );
      case 'thankful':
        return (
          <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
            {Object.values(entry.structuredContent).map((v, i) => v && <li key={i}>{v}</li>)}
          </ul>
        );
      default:
        return <p className="text-slate-700 mt-2 whitespace-pre-wrap">{entry.content}</p>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <MoodIcon mood={entry.mood} />
          <div>
            <div className="text-sm font-bold text-slate-900">
              {date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
            <div className="text-xs text-slate-400">
              {date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} • {entry.framework.toUpperCase()}
            </div>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="text-sm">
        {renderContent()}
      </div>

      {entry.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {entry.images.map((img, i) => (
            <img key={i} src={img} alt="attachment" className="w-16 h-16 object-cover rounded-lg border border-slate-100" />
          ))}
        </div>
      )}
    </div>
  );
};
