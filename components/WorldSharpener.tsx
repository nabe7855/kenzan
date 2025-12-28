
import React, { useState, useEffect, useMemo } from 'react';
import { Globe, TrendingUp, AlertTriangle, Shield, Sword, Zap, Crown, Activity, Clock, MousePointerClick, Star, Filter, User } from 'lucide-react';
import { WORLD_POPULATION, SPIRITUAL_TIERS, COUNTRY_MILESTONES, DEMOGRAPHICS } from '../constants';
import { UserProfile } from '../types';

interface WorldSharpenerProps {
  totalSharpenCount: number;
  streakDays: number;
  totalDurationMinutes: number;
  lastActivityTimestamp: number;
  currentTotalSeconds: number; // For Realtime View
  userProfile: UserProfile;
}

type Tab = 'overview' | 'realtime';
type FilterType = 'global' | 'age' | 'gender' | 'region';

export const WorldSharpener: React.FC<WorldSharpenerProps> = ({
  totalSharpenCount,
  streakDays,
  totalDurationMinutes,
  lastActivityTimestamp,
  currentTotalSeconds,
  userProfile
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [displayRank, setDisplayRank] = useState(WORLD_POPULATION);
  const [isRusting, setIsRusting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('global');

  // Determine current population based on filter
  const currentPopulation = useMemo(() => {
    switch (activeFilter) {
      case 'age':
        return userProfile.ageGroup ? DEMOGRAPHICS.age[userProfile.ageGroup] : WORLD_POPULATION;
      case 'gender':
        return userProfile.gender ? DEMOGRAPHICS.gender[userProfile.gender] : WORLD_POPULATION;
      case 'region':
        return userProfile.region ? DEMOGRAPHICS.region[userProfile.region] : WORLD_POPULATION;
      case 'global':
      default:
        return WORLD_POPULATION;
    }
  }, [activeFilter, userProfile]);

  // --------------------------------------------------------------------------
  // Logic: Overview (TGI Based)
  // --------------------------------------------------------------------------
  
  // 1. Calculate Rust (Decay)
  const rustMultiplier = useMemo(() => {
    if (!lastActivityTimestamp) return 1.0;

    const now = Date.now();
    const hoursSinceLast = (now - lastActivityTimestamp) / (1000 * 60 * 60);

    if (hoursSinceLast < 24) {
      return 1.0;
    } else if (hoursSinceLast < 72) {
      const daysOver = Math.floor((hoursSinceLast - 24) / 24) + 1;
      return Math.max(0.8, 1.0 - (daysOver * 0.05));
    } else {
      return 0.8;
    }
  }, [lastActivityTimestamp]);

  useEffect(() => {
    setIsRusting(rustMultiplier < 1.0);
  }, [rustMultiplier]);

  // 2. Calculate TGI
  const currentTGI = useMemo(() => {
    const rawTGI = (totalSharpenCount * 3) + (streakDays * 5) + (totalDurationMinutes * 0.2);
    return rawTGI * rustMultiplier;
  }, [totalSharpenCount, streakDays, totalDurationMinutes, rustMultiplier]);

  // 3. Determine Rank based on TGI
  const overviewRank = useMemo(() => {
    let upperTier = SPIRITUAL_TIERS[0];
    let lowerTier = SPIRITUAL_TIERS[SPIRITUAL_TIERS.length - 1];

    for (let i = 0; i < SPIRITUAL_TIERS.length - 1; i++) {
      if (currentTGI >= SPIRITUAL_TIERS[i].minTGI && currentTGI < SPIRITUAL_TIERS[i+1].minTGI) {
        lowerTier = SPIRITUAL_TIERS[i];
        upperTier = SPIRITUAL_TIERS[i+1];
        break;
      }
    }
    
    if (currentTGI >= SPIRITUAL_TIERS[SPIRITUAL_TIERS.length - 1].minTGI) {
        return SPIRITUAL_TIERS[SPIRITUAL_TIERS.length - 1].estimatedRank;
    }

    const rangeTGI = upperTier.minTGI - lowerTier.minTGI;
    const progress = (currentTGI - lowerTier.minTGI) / rangeTGI;
    const rankDiff = lowerTier.estimatedRank - upperTier.estimatedRank;
    const rank = lowerTier.estimatedRank - (rankDiff * progress);
    
    // Scale rank based on population if not global
    // (Note: Overview mainly uses Global for 'Tiers' logic context, but we can scale display)
    // For simplicity, Overview TGI rank remains Global concept, Realtime is filtered.
    return Math.floor(Math.max(1, rank));
  }, [currentTGI]);

  const currentTier = useMemo(() => {
    return [...SPIRITUAL_TIERS].reverse().find(t => currentTGI >= t.minTGI) || SPIRITUAL_TIERS[0];
  }, [currentTGI]);

  const targetCountry = useMemo(() => {
    const sortedCountries = [...COUNTRY_MILESTONES].sort((a, b) => b.population - a.population);
    return sortedCountries.find(c => c.population < overviewRank) || sortedCountries[sortedCountries.length - 1];
  }, [overviewRank]);

  // --------------------------------------------------------------------------
  // Logic: Realtime (Time Based - GlobalRanking Logic)
  // --------------------------------------------------------------------------

  const realtimeStats = useMemo(() => {
    const totalHours = currentTotalSeconds / 3600;
    let percentile = 100;
    let phaseTitle = '入門期';
    let phase = 'P1';
    let speed = 0; // People overtaken per second approx

    const P1_LIMIT = 20;
    const P2_LIMIT = 100;
    const P3_LIMIT = 1000;

    if (totalHours < P1_LIMIT) {
      // P1: 100 -> 80
      phase = 'P1';
      phaseTitle = '入門期';
      percentile = 100 - totalHours; // 1% drop per hour
      // Speed: 1% of Pop = 80M. 80M / 3600s = ~22,000/s
      speed = (currentPopulation * 0.01) / 3600; 
    } else if (totalHours < P2_LIMIT) {
      // P2: 80 -> 5
      phase = 'P2';
      phaseTitle = '選抜期';
      const progress = (totalHours - P1_LIMIT) / (P2_LIMIT - P1_LIMIT);
      percentile = 80 * Math.pow((5 / 80), progress);
      
      const pNow = percentile;
      const hNext = (currentTotalSeconds + 1) / 3600;
      const progNext = (hNext - P1_LIMIT) / (P2_LIMIT - P1_LIMIT);
      const pNext = 80 * Math.pow((5 / 80), progNext);
      const diffPercent = pNow - pNext;
      speed = (diffPercent / 100) * currentPopulation;
    } else if (totalHours < P3_LIMIT) {
      // P3: 5 -> 1
      phase = 'P3';
      phaseTitle = '習慣期';
      const progress = (totalHours - P2_LIMIT) / (P3_LIMIT - P2_LIMIT);
      percentile = 5 - (4 * Math.pow(progress, 0.5));
      
      const pNow = percentile;
      const hNext = (currentTotalSeconds + 1) / 3600;
      const progNext = (hNext - P2_LIMIT) / (P3_LIMIT - P2_LIMIT);
      const pNext = 5 - (4 * Math.pow(progNext, 0.5));
      const diffPercent = pNow - pNext;
      speed = (diffPercent / 100) * currentPopulation;
    } else {
      // P4: 1 -> 0.01
      phase = 'P4';
      phaseTitle = '達人期';
      percentile = 1 * (1000 / totalHours);
      speed = 100; // Very slow
    }
    
    // Calculate Rank from Percentile relative to Current Population
    const rank = Math.floor(currentPopulation * (percentile / 100));
    return { rank: Math.max(1, rank), percentile, phaseTitle, phase, speed };
  }, [currentTotalSeconds, currentPopulation]);


  // --------------------------------------------------------------------------
  // Animation Effect (Odometer)
  // --------------------------------------------------------------------------

  // Target rank depends on tab
  const targetRank = activeTab === 'overview' ? overviewRank : realtimeStats.rank;

  useEffect(() => {
    let start = displayRank;
    const end = targetRank;
    const diff = end - start;
    
    // If difference is huge (tab switch), snap closer or animate fast
    // If difference is small (realtime update), animate smooth
    
    if (Math.abs(diff) < 5) {
      setDisplayRank(end);
      return;
    }

    // Adjust duration based on context
    const duration = activeTab === 'realtime' ? 1000 : 1500; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Realtime view needs linear feel for ticking, Overview needs ease-out
      const ease = activeTab === 'realtime' ? progress : 1 - Math.pow(1 - progress, 3);
      
      const nextVal = Math.floor(start + (diff * ease));
      setDisplayRank(nextVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetRank, activeTab, currentPopulation]); // Re-run when population changes

  
  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const formatRank = (num: number) => num.toLocaleString();

  // Calculate "1 in N people"
  const oneInN = Math.max(1, Math.floor(currentPopulation / displayRank));

  return (
    <div className={`w-full mb-6 rounded-2xl border relative overflow-hidden transition-all duration-500 ${
      isRusting && activeTab === 'overview'
        ? 'bg-[#fdfbf7] border-amber-200 shadow-[inset_0_0_60px_rgba(180,83,9,0.1)]' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Rust Overlay Effect */}
      {isRusting && activeTab === 'overview' && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grunge-wall.png')] mix-blend-multiply"></div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 relative z-20">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'overview' 
              ? 'text-indigo-600 bg-indigo-50/50' 
              : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Globe size={14} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'realtime' 
              ? 'text-orange-600 bg-orange-50/50' 
              : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} /> Realtime
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 relative z-10 min-h-[160px]">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isRusting ? 'text-amber-700' : 'text-slate-500'}`}>
                    Global Ranking (TGI)
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-slate-400">No.</span>
                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums ${
                    isRusting ? 'text-amber-800' : 'text-slate-800'
                  }`}>
                    {formatRank(displayRank)}
                  </span>
                </div>

                {/* --- 1 in N People Display (Overview) --- */}
                <div className="flex items-center gap-2 mt-1 bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">
                   <Star size={14} className="text-indigo-500 fill-indigo-500" />
                   <div className="text-xs text-slate-600 font-medium">
                     あなたは およそ <span className="font-bold text-base text-indigo-600">{oneInN.toLocaleString()}</span> 人に1人の逸材です
                   </div>
                </div>

              </div>

              <div className="flex flex-col items-end">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${
                  isRusting ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Sword size={14} className={isRusting ? 'fill-amber-700 text-amber-700' : 'fill-slate-400 text-slate-400'} />
                  <span className="font-bold text-xs">{currentTier.name}</span>
                </div>
                {isRusting && (
                  <div className="flex items-center gap-1 mt-1 text-xs font-bold text-red-600 animate-pulse">
                    <AlertTriangle size={10} />
                    <span>Rust Detected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Milestone Indicator */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 backdrop-blur-sm mt-3">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-500 font-medium">Next Target</span>
                <span className="text-slate-400">
                  あと {Math.max(0, overviewRank - targetCountry.population).toLocaleString()} 人
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-2xl filter drop-shadow-sm">{targetCountry.emoji}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-800">{targetCountry.name}</span>
                    <span className="text-xs text-slate-400">{formatRank(targetCountry.population)}人</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isRusting ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: '60%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REALTIME */}
        {activeTab === 'realtime' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Filters */}
            <div className="flex justify-end gap-1 mb-3">
               {[
                 { id: 'global', label: '世界', icon: Globe },
                 { id: 'age', label: userProfile.ageGroup || '年代', icon: Clock, disabled: !userProfile.ageGroup },
                 { id: 'gender', label: userProfile.gender === 'Male' ? '男性' : userProfile.gender === 'Female' ? '女性' : '性別', icon: User, disabled: !userProfile.gender },
                 { id: 'region', label: userProfile.region === 'Japan' ? '国内' : '地域', icon: Crown, disabled: !userProfile.region },
               ].map((f) => (
                 <button
                   key={f.id}
                   disabled={f.disabled}
                   onClick={() => setActiveFilter(f.id as FilterType)}
                   className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      activeFilter === f.id
                        ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'
                        : f.disabled ? 'opacity-40 bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                   }`}
                   title={f.disabled ? "プロフィール設定で情報を追加してください" : ""}
                 >
                   <f.icon size={10} />
                   {f.label}
                 </button>
               ))}
            </div>

            <div className="flex justify-between items-start mb-2">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-1">
                       <Zap size={12} className="fill-orange-600" />
                       Realtime Estimate
                     </span>
                     <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                       {realtimeStats.phaseTitle}
                     </span>
                  </div>
                   <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400">No.</span>
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums text-orange-600">
                      {formatRank(displayRank)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {(currentPopulation / 1000000).toFixed(1)}M
                    </span>
                  </div>

                  {/* --- 1 in N People Display (Realtime) --- */}
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={14} className="text-orange-500 fill-orange-500" />
                    <div className="text-xs text-slate-600 font-medium">
                      <span className="font-bold">{activeFilter === 'global' ? '世界' : activeFilter === 'age' ? '同年代' : activeFilter === 'gender' ? '同性' : '国内'}</span>で
                      およそ <span className="font-bold text-base text-orange-600">{oneInN.toLocaleString()}</span> 人に1人の逸材です
                    </div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overtaking</div>
                  <div className="font-mono font-bold text-lg text-slate-700 flex items-center justify-end gap-1">
                    <TrendingUp size={16} className="text-emerald-500" />
                    {Math.max(1, Math.floor(realtimeStats.speed)).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/sec</span>
                  </div>
               </div>
            </div>

            <div className="mt-4">
               <div className="flex justify-between text-xs text-slate-500 mb-1">
                 <span>Top {realtimeStats.percentile.toFixed(4)}%</span>
                 <span>Next Phase</span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 w-full animate-pulse opacity-80" />
               </div>
               <p className="text-[10px] text-slate-400 mt-2 text-right">
                 ※ 時間経過に基づく理論上の推定順位です
               </p>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer Info */}
      <div className={`px-5 py-2 border-t text-[10px] flex justify-between items-center ${
         activeTab === 'realtime' ? 'bg-orange-50/30 border-orange-100' : 
         isRusting ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}>
         <div className="flex gap-3">
           {activeTab === 'overview' ? (
             <>
                <span>TGI: <span className="font-mono font-bold">{currentTGI.toFixed(1)}</span></span>
                {isRusting && <span>(Decay: {(rustMultiplier * 100).toFixed(0)}%)</span>}
             </>
           ) : (
             <span className="flex items-center gap-1 text-orange-600/80 font-bold">
               <Clock size={10} />
               Stopwatch Running...
             </span>
           )}
         </div>
         <div className="flex items-center gap-1">
            {activeTab === 'overview' ? (
              <>
                 <Shield size={10} />
                 <span>研がないと錆びます</span>
              </>
            ) : (
              <>
                <MousePointerClick size={10} />
                <span>行動で確定</span>
              </>
            )}
         </div>
      </div>
    </div>
  );
};