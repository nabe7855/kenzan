
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, PenLine, Flame, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { Theme, SharpenLog, Session, UserProfile } from '../types';
import { AnalogClock } from './AnalogClock';
import { LevelProgress } from './LevelProgress';
import { WorldSharpener } from './WorldSharpener';

interface StopwatchProps {
  activeTheme: Theme | null;
  onSaveSession: (seconds: number, note: string) => void;
  todayTotalSeconds: number;
  totalSecondsAll: number; // For LevelProgress
  streak: number; // For Motivation
  sharpenLogs: SharpenLog[];
  sessions: Session[];
  lastActivityTimestamp: number;
  userProfile: UserProfile;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ 
  activeTheme, 
  onSaveSession, 
  todayTotalSeconds,
  totalSecondsAll,
  streak,
  sharpenLogs,
  sessions,
  lastActivityTimestamp,
  userProfile
}) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [note, setNote] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsActive(false);
    if (elapsedSeconds > 0) {
      setShowSaveDialog(true);
    }
  };

  const handleSave = () => {
    onSaveSession(elapsedSeconds, note);
    setElapsedSeconds(0);
    setNote('');
    setShowSaveDialog(false);
  };

  const handleDiscard = () => {
    setElapsedSeconds(0);
    setNote('');
    setShowSaveDialog(false);
  };

  // Generate Motivation Message based on Streak
  const getMotivationMessage = (streak: number) => {
    if (streak === 0) return { text: "今日が最初の一歩です。0から1を作るのが最も尊い行動です。", highlight: "Start Now" };
    if (streak <= 3) return { text: "「三日坊主」の壁を越えました！習慣化の最初の難関を突破です。", highlight: "上位 60% 入り" };
    if (streak <= 7) return { text: "1週間継続！これは偶然ではありません。確かな実力です。", highlight: "上位 40% 入り" };
    if (streak <= 21) return { text: "習慣が定着し始めています。今のあなたは無敵状態に近いです。", highlight: "上位 20% 入り" };
    return { text: "驚異的な継続力です。あなたはもはやプロフェッショナルの領域にいます。", highlight: "トップ 5% プレイヤー" };
  };

  if (!activeTheme) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Play className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">準備はいいですか？</h3>
        <p className="text-slate-500 mt-2">サイドバーからテーマを選択して、記録を始めましょう。</p>
      </div>
    );
  }

  // Calculate dynamic totals including current elapsed time
  const currentTotal = activeTheme.totalSeconds + elapsedSeconds;
  const currentToday = todayTotalSeconds + elapsedSeconds;
  
  const motivation = getMotivationMessage(streak);

  // Calculate aggregate stats for WorldSharpener
  const totalDurationMinutes = Math.floor(totalSecondsAll / 60) + Math.floor(elapsedSeconds / 60);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden transition-all duration-500">
      {/* Background decoration */}
      <div className={`absolute top-0 left-0 w-full h-1 ${activeTheme.color}`} />

      {/* --- Section 0: Level Progress --- */}
      <LevelProgress totalSeconds={currentTotal} />

      {/* --- Section 0.5: The World Sharpener (Overview & Realtime) --- */}
      <WorldSharpener 
        totalSharpenCount={sharpenLogs.length}
        streakDays={streak}
        totalDurationMinutes={totalDurationMinutes}
        lastActivityTimestamp={lastActivityTimestamp}
        currentTotalSeconds={currentTotal}
        userProfile={userProfile}
      />

      {/* --- Section 1: Total Accumulated Time (Hero) --- */}
      <div className="text-center w-full mb-6 relative">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Accumulated Time</h2>
          <h1 className="text-4xl sm:text-6xl font-mono font-bold text-slate-800 tracking-tight">
             {formatTime(currentTotal)}
          </h1>
          <div className="mt-2 text-sm font-medium text-slate-600 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
             {activeTheme.title}
          </div>
      </div>

      <div className="w-full border-t border-slate-100 my-2"></div>

      {/* --- Section 2: Today's Time --- */}
      <div className="text-center mb-6 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Session</h3>
        <div className={`text-3xl sm:text-4xl font-mono font-bold ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
            {formatTime(currentToday)}
        </div>
      </div>

      {/* --- Section 3: Analog Clock & Controls --- */}
      <div className="flex flex-col items-center w-full relative mb-6">
        <div className="relative mb-8 transform scale-90 sm:scale-100">
            <AnalogClock size={180} className="shadow-2xl rounded-full" />
        </div>

        {!showSaveDialog ? (
          <div className="flex items-center gap-4 w-full max-w-xs justify-center z-10">
            {!isActive ? (
              <Button 
                onClick={() => setIsActive(true)} 
                className="w-full h-14 text-lg gap-2 shadow-lg shadow-indigo-100 rounded-full"
              >
                <Play className="w-5 h-5 fill-current" /> START
              </Button>
            ) : (
              <Button 
                onClick={() => setIsActive(false)} 
                variant="secondary"
                className="w-full h-14 text-lg gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full"
              >
                <Pause className="w-5 h-5 fill-current" /> PAUSE
              </Button>
            )}
            
            <Button 
              onClick={handleStop}
              variant="danger"
              className="h-14 w-14 flex-shrink-0 rounded-full shadow-lg shadow-red-100"
              disabled={elapsedSeconds === 0}
              title="完了"
            >
              <Square className="w-5 h-5 fill-current" />
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-left">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Session Memo</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="実施内容を一言で..."
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDiscard} variant="ghost" className="flex-1 text-slate-500">
                <RotateCcw className="w-4 h-4 mr-2" /> 破棄
              </Button>
              <Button onClick={handleSave} className="flex-[2] bg-indigo-600 hover:bg-indigo-700">
                <PenLine className="w-4 h-4 mr-2" /> 保存して振り返り
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- Section 4: Daily Insight / Stats Motivation --- */}
      <div className="w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg mt-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-white/20 p-2 rounded-lg">
             <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-400 fill-orange-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{streak}日連続記録中</span>
              {streak > 0 && (
                <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {motivation.highlight}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {motivation.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};