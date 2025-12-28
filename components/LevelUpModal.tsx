
import React, { useEffect, useState } from 'react';
import { Rank } from '../types';
import { Trophy, Crown, Star, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: Rank | null;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, rank }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Optional: Add sound effect here if desired
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen || !rank) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl overflow-hidden animate-in zoom-in-50 slide-in-from-bottom-10 duration-500">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50 to-white z-0" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse z-0" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse z-0" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-6 relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg mx-auto animate-bounce">
              <Trophy size={48} className="text-white drop-shadow-md" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-8 h-8 animate-spin-slow" />
            <Sparkles className="absolute bottom-0 -left-4 text-indigo-400 w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic tracking-tighter mb-2 transform scale-110">
            LEVEL UP!
          </h2>
          
          <p className="text-slate-500 font-medium mb-6 text-sm">
            新しい領域へ到達しました
          </p>

          <div className="bg-slate-50 border-2 border-indigo-100 rounded-xl p-4 mb-8 transform transition-all hover:scale-105">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">New Rank</div>
            <div className="text-2xl font-bold text-indigo-800 flex items-center justify-center gap-2">
              <Crown size={24} className="text-amber-500 fill-amber-500" />
              {rank}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Star size={18} className="fill-white/30" />
            素晴らしき旅を続ける
          </button>
        </div>

        {/* Confetti Particles (CSS only simple version) */}
        {showConfetti && (
           <>
             <div className="absolute top-10 left-10 w-2 h-2 bg-red-400 rounded-full animate-ping" />
             <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-100" />
             <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping delay-200" />
           </>
        )}
      </div>
    </div>
  );
};
