
import React, { useState, useEffect, useRef } from 'react';
import { Sword, Sparkles, Wind, TrendingUp, AlertTriangle, Shield, Trophy, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { GrindingStats, SlashLog } from '../types';
import { COUNTRY_MILESTONES, WORLD_POPULATION } from '../constants';

interface GrindingProps {
  stats: GrindingStats;
  onSlash: (durationSec: number, earnedTGI: number) => void;
}

// Helper: Calculate Rank from TGI (Logarithmic Simulation)
// TGI 0 = 8.2B, TGI 10000 = ~8000
const calculateRank = (tgi: number) => {
  // Formula: Rank = 8.232e9 * exp(-k * tgi)
  // Derived k to make TGI 10000 ~= 8000 rank
  const k = 0.00138;
  const rank = WORLD_POPULATION * Math.exp(-k * tgi);
  return Math.max(1, Math.floor(rank));
};

export const Grinding: React.FC<GrindingProps> = ({ stats, onSlash }) => {
  const [phase, setPhase] = useState<'idle' | 'grinding' | 'slashing' | 'result'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Display States
  const [displayRank, setDisplayRank] = useState(stats.currentRank);
  const [accumulatedTGI, setAccumulatedTGI] = useState(0); // Potential TGI during grinding
  const [rustLevel, setRustLevel] = useState(0); // 0 to 1 (1 is max rust)
  const [slashedResult, setSlashedResult] = useState<{
    overtaken: number;
    countries: string[];
    rankBefore: number;
    rankAfter: number;
  } | null>(null);

  // Initialize Rust Level
  useEffect(() => {
    if (stats.lastSlashedAt === 0) {
      setRustLevel(0);
      return;
    }
    const hours = (Date.now() - stats.lastSlashedAt) / (1000 * 60 * 60);
    if (hours > 24) {
      // Scale rust from 0 to 1 between 24h and 72h
      const r = Math.min(1, (hours - 24) / 48);
      setRustLevel(r);
    } else {
      setRustLevel(0);
    }
  }, [stats.lastSlashedAt]);

  // Sync rank when idle
  useEffect(() => {
    if (phase === 'idle') {
      setDisplayRank(stats.currentRank);
    }
  }, [stats.currentRank, phase]);

  // Timer Logic
  useEffect(() => {
    if (phase === 'grinding') {
      timerRef.current = window.setInterval(() => {
        setElapsedSec(prev => {
          const next = prev + 1;
          // Calculate TGI preview: 1 min = 1.0 TGI
          setAccumulatedTGI((next / 60) * 1.0);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Handlers
  const startGrinding = () => {
    setPhase('grinding');
    setElapsedSec(0);
    setAccumulatedTGI(0);
  };

  const executeSlash = () => {
    setPhase('slashing');

    // 1. Calculate Earnings
    const sessionTGI = (elapsedSec / 60) * 1.0;
    const newTotalTGI = stats.totalTGI + sessionTGI;
    
    // 2. Calculate New Rank
    const rankBefore = stats.currentRank;
    const rankAfter = calculateRank(newTotalTGI);
    const overtaken = Math.max(0, rankBefore - rankAfter);

    // 3. Find Overtaken Countries
    const overtakenCountries = COUNTRY_MILESTONES
      .filter(c => c.population < rankBefore && c.population >= rankAfter)
      .sort((a, b) => b.population - a.population) // Largest first
      .map(c => c.name);

    setSlashedResult({
      overtaken,
      countries: overtakenCountries,
      rankBefore,
      rankAfter
    });

    // 4. Trigger Animation & Commit
    setTimeout(() => {
      // Simulate "Slash" impact delay
      onSlash(elapsedSec, sessionTGI);
      animateOdometer(rankBefore, rankAfter);
      setPhase('result');
      setRustLevel(0); // Rust cleared
    }, 800); // Wait for slash animation
  };

  const animateOdometer = (start: number, end: number) => {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out exponential
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = Math.floor(start - ((start - end) * ease));
      setDisplayRank(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const closeResult = () => {
    setPhase('idle');
    setElapsedSec(0);
    setSlashedResult(null);
  };

  // --- Visuals ---
  
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getTargetCountry = () => {
    const sorted = [...COUNTRY_MILESTONES].sort((a, b) => b.population - a.population);
    return sorted.find(c => c.population < stats.currentRank) || sorted[sorted.length - 1];
  };
  const nextTarget = getTargetCountry();

  // Rust Filter Style
  const containerStyle = rustLevel > 0 
    ? { filter: `sepia(${rustLevel * 0.8}) grayscale(${rustLevel * 0.5})` }
    : {};
  const rustOverlayOpacity = rustLevel * 0.3;

  return (
    <div className="relative w-full max-w-2xl mx-auto h-[600px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl text-white select-none transition-all duration-1000" style={containerStyle}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-0"></div>
      
      {/* Rust Texture Overlay */}
      {rustLevel > 0 && (
         <div 
           className="absolute inset-0 pointer-events-none z-10 bg-[url('https://www.transparenttextures.com/patterns/grunge-wall.png')] mix-blend-overlay"
           style={{ opacity: rustOverlayOpacity }}
         />
      )}

      {/* Aura / Charge Effect (During Grinding) */}
      {phase === 'grinding' && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
           <div className="w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-pulse opacity-20"></div>
           <div 
             className="absolute w-full h-full bg-gradient-to-t from-indigo-500/10 to-transparent"
             style={{ opacity: Math.min(1, elapsedSec / 60) }} 
           />
        </div>
      )}

      {/* SLASH VISUAL EFFECT */}
      {phase === 'slashing' && (
        <div className="absolute inset-0 z-[100] bg-white animate-out fade-out duration-500 pointer-events-none">
           <div className="absolute top-1/2 left-0 w-full h-2 bg-white shadow-[0_0_50px_20px_white] -rotate-12 transform scale-x-150 origin-left animate-in slide-in-from-left duration-200"></div>
        </div>
      )}

      {/* --- CONTENT LAYOUT --- */}
      <div className="relative z-20 h-full flex flex-col p-8">
        
        {/* Header Info */}
        <div className="flex justify-between items-start">
           <div>
             <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">
               World Ranking
             </div>
             <div className="font-mono text-4xl font-black tracking-tighter tabular-nums flex items-baseline gap-2">
               <span className="text-lg text-slate-500">No.</span>
               {displayRank.toLocaleString()}
             </div>
             {phase !== 'result' && (
               <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                 <Shield size={10} />
                 {rustLevel > 0 
                    ? <span className="text-amber-500 font-bold">刃が錆びついています (Rank Decay)</span> 
                    : "刃の状態: 良好"}
               </div>
             )}
           </div>

           {phase !== 'result' && (
             <div className="text-right">
               <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">
                 Next Target
               </div>
               <div className="flex items-center justify-end gap-2">
                 <span className="text-2xl">{nextTarget.emoji}</span>
                 <div className="text-right">
                   <div className="font-bold text-sm">{nextTarget.name}</div>
                   <div className="text-xs text-slate-500">あと {Math.max(0, stats.currentRank - nextTarget.population).toLocaleString()} 人</div>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Center Visual (Sword & Timer) */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
           
           {/* Sword Icon with effects */}
           <div className={`relative transition-all duration-700 ${phase === 'grinding' ? 'scale-110 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'scale-100'} ${phase === 'slashing' ? 'translate-x-[1000px] rotate-45 opacity-0' : ''}`}>
              <Sword 
                size={180} 
                strokeWidth={1}
                className={`transition-colors duration-1000 ${
                  rustLevel > 0.5 ? 'text-amber-700' : 
                  rustLevel > 0 ? 'text-amber-400' :
                  phase === 'grinding' ? 'text-indigo-200 fill-indigo-500/20' : 'text-slate-600'
                }`} 
              />
              {phase === 'grinding' && (
                <Sparkles className="absolute top-0 right-0 text-white animate-ping" />
              )}
           </div>

           {/* Timer Display */}
           {phase === 'grinding' && (
             <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
               <div className="text-6xl font-black font-mono tracking-wider text-white drop-shadow-md">
                 {formatTime(elapsedSec)}
               </div>
               <div className="text-indigo-300 font-bold mt-2 text-sm uppercase tracking-widest animate-pulse">
                 Accumulating Energy...
               </div>
               <div className="mt-2 text-xs text-slate-500">
                 Est. TGI: +{accumulatedTGI.toFixed(2)}
               </div>
             </div>
           )}

           {/* Result View */}
           {phase === 'result' && slashedResult && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
               <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
               <h2 className="text-3xl font-black italic text-white mb-2">
                 SLASH COMPLETE
               </h2>
               <div className="text-center space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest">Overtaken</div>
                    <div className="text-4xl font-black text-emerald-400 tabular-nums">
                      {slashedResult.overtaken.toLocaleString()}
                      <span className="text-sm text-emerald-600 ml-1">人</span>
                    </div>
                  </div>
                  
                  {slashedResult.countries.length > 0 && (
                    <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/30">
                      <div className="text-xs text-emerald-300 mb-1">国家規模の撃破を確認</div>
                      {slashedResult.countries.slice(0, 2).map(c => (
                        <div key={c} className="font-bold text-lg text-white">
                          {c} <span className="text-sm font-normal text-slate-300">全土を両断</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6">
                    <Button onClick={closeResult} className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8 py-3 rounded-full">
                      次なる戦いへ
                    </Button>
                  </div>
               </div>
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto h-24 flex items-end justify-center">
           {phase === 'idle' && (
             <button
               onClick={startGrinding}
               className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
             >
               <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 opacity-80 group-hover:opacity-100 transition-opacity"></span>
               <span className="relative text-lg font-bold tracking-widest flex items-center gap-3">
                 <Wind className="w-5 h-5" /> 己を研ぐ (Grind)
               </span>
             </button>
           )}

           {phase === 'grinding' && (
             <button
               onClick={executeSlash}
               className="group relative w-full max-w-sm h-16 bg-white rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-pulse hover:animate-none transition-transform active:scale-95"
             >
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
               <span className="flex items-center justify-center gap-3 text-slate-900 font-black text-xl tracking-widest uppercase h-full w-full">
                 <Zap className="fill-slate-900" /> ぶった斬る (SLASH)
               </span>
             </button>
           )}
        </div>

      </div>
    </div>
  );
};
