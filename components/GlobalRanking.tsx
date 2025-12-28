import React, { useMemo } from 'react';
import { TrendingUp, Users, Crown, Zap, Activity } from 'lucide-react';

interface GlobalRankingProps {
  totalSeconds: number;
}

type Phase = 'P1' | 'P2' | 'P3' | 'P4';

interface RankingData {
  percentile: number;
  rankRatio: number;
  phase: Phase;
  phaseTitle: string;
  velocity: 'Low' | 'Normal' | 'High';
  message: string;
}

export const GlobalRanking: React.FC<GlobalRankingProps> = ({ totalSeconds }) => {
  const totalHours = totalSeconds / 3600;

  const data: RankingData = useMemo(() => {
    let percentile = 100;
    let phase: Phase = 'P1';
    let phaseTitle = '入門期';
    let velocity: 'Low' | 'Normal' | 'High' = 'Low';
    let message = '';

    // Constants based on requirements
    const P1_LIMIT = 20;
    const P2_LIMIT = 100;
    const P3_LIMIT = 1000;
    
    // Logic Implementation
    if (totalHours < P1_LIMIT) {
      // P1: 入門期 (0 - 20h)
      // Linear decrease: 100% -> 80%
      phase = 'P1';
      phaseTitle = '入門期';
      velocity = 'Low';
      // Formula: 100 - (hours / 20) * 20
      percentile = 100 - totalHours; 
      message = 'まずは20時間の壁を目指しましょう。多くの人がここで脱落します。';
    } else if (totalHours < P2_LIMIT) {
      // P2: 選抜期 (20 - 100h)
      // Exponential decrease: 80% -> 5% (The "Gobo-nuki" Phase)
      phase = 'P2';
      phaseTitle = '選抜期';
      velocity = 'High';
      
      // Calculate progress ratio (0 to 1) within the phase
      const progress = (totalHours - P1_LIMIT) / (P2_LIMIT - P1_LIMIT);
      
      // Logarithmic interpolation for visual "fast drop" feel, or simple Exponential
      // Using Exponential Decay: P = Start * (End/Start)^Progress
      percentile = 80 * Math.pow((5 / 80), progress);
      
      message = '今、猛烈な勢いでライバルを追い抜いています！このまま突き抜けろ！';
    } else if (totalHours < P3_LIMIT) {
      // P3: 習慣期 (100 - 1000h)
      // Logarithmic decrease: 5% -> 1%
      phase = 'P3';
      phaseTitle = '習慣期';
      velocity = 'Normal';
      
      const progress = (totalHours - P2_LIMIT) / (P3_LIMIT - P2_LIMIT);
      // Linear interpolation in log scale or simple mapping
      // Let's use simple mapping for stability: 5 - (4 * progress)
      // But requirement says "Logarithmic decrease", so curve should slow down
      percentile = 5 - (4 * Math.pow(progress, 0.5)); // Square root curve for "settling in" feel
      
      message = '上位5%に定着しました。ここからは自分との戦いです。';
    } else {
      // P4: 達人期 (1000h+)
      // Power law: 1% -> 0.01%
      phase = 'P4';
      phaseTitle = '達人期';
      velocity = 'Low';
      
      // Formula: 1 * (1000 / hours)
      percentile = 1 * (1000 / totalHours);
      
      message = '静寂の領域。昨日の自分を0.0001%超える旅へ。';
    }

    // Safety clamp
    percentile = Math.max(0.00001, Math.min(100, percentile));

    // Calculate Ratio (1 in X people)
    // 50% = 1 in 2, 10% = 1 in 10, 1% = 1 in 100
    const rankRatio = Math.floor(100 / percentile);

    return { percentile, rankRatio, phase, phaseTitle, velocity, message };
  }, [totalHours]);

  // Visual Styles based on Phase
  const getContainerStyle = () => {
    switch (data.phase) {
      case 'P2': // The exciting phase
        return 'bg-gradient-to-r from-amber-50 to-orange-100 border-orange-200 ring-2 ring-orange-400 ring-opacity-50';
      case 'P3':
        return 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200';
      case 'P4':
        return 'bg-slate-900 text-white border-slate-700';
      default:
        return 'bg-white border-slate-100';
    }
  };

  const getPercentileColor = () => {
    switch (data.phase) {
      case 'P2': return 'text-orange-600';
      case 'P3': return 'text-indigo-700';
      case 'P4': return 'text-emerald-400';
      default: return 'text-slate-700';
    }
  };

  return (
    <div className={`w-full mb-6 rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all duration-500 ${getContainerStyle()}`}>
      {/* Background Effect for P2 */}
      {data.phase === 'P2' && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-400 opacity-20 blur-2xl rounded-full animate-pulse"></div>
      )}

      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
               data.phase === 'P4' ? 'bg-slate-800 text-emerald-400' : 'bg-white/60 text-slate-500'
             }`}>
               {data.phase === 'P2' && <Zap size={12} className="text-orange-500 fill-orange-500" />}
               {data.phase === 'P4' && <Crown size={12} className="text-emerald-500 fill-emerald-500" />}
               {data.phaseTitle}
             </div>
             {data.velocity === 'High' && (
               <span className="text-[10px] font-bold text-orange-600 animate-pulse">
                 RANK RISING FAST!
               </span>
             )}
          </div>
          
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-sm font-bold ${data.phase === 'P4' ? 'text-slate-400' : 'text-slate-500'}`}>
              上位
            </span>
            <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tighter tabular-nums leading-none ${getPercentileColor()}`}>
              {/* Decimal places change based on velocity to emphasize movement */}
              {data.percentile.toFixed(data.velocity === 'High' ? 5 : 4)}
            </span>
            <span className={`text-sm font-bold ${data.phase === 'P4' ? 'text-slate-400' : 'text-slate-500'}`}>
              %
            </span>
          </div>

          <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${data.phase === 'P4' ? 'text-slate-300' : 'text-slate-600'}`}>
             <Users size={16} />
             <span>およそ <span className="font-bold text-lg mx-1">{data.rankRatio.toLocaleString()}</span> 人に1人の逸材</span>
          </div>
        </div>

        {/* Phase Icon/Visual */}
        <div className="hidden sm:block opacity-80">
           {data.phase === 'P1' && <Activity size={48} className="text-slate-300" />}
           {data.phase === 'P2' && <TrendingUp size={48} className="text-orange-500 drop-shadow-lg" />}
           {data.phase === 'P3' && <Crown size={48} className="text-indigo-300" />}
           {data.phase === 'P4' && <Crown size={48} className="text-emerald-500 fill-emerald-500/20" />}
        </div>
      </div>

      <div className={`mt-4 pt-3 border-t text-xs sm:text-sm italic ${
        data.phase === 'P4' ? 'border-slate-700 text-emerald-200' : 'border-black/5 text-slate-500'
      }`}>
        "{data.message}"
      </div>
    </div>
  );
};