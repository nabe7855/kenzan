
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Theme, Session, Rank, LEVEL_THRESHOLDS, JournalEntry, GoalNode, SharpenLog, AuthUser, BlogPost, UserProfile, AgeGroup, Gender, Region, SlashLog, GrindingStats } from './types';
import { BLOG_POSTS } from './constants';
import { storageService } from './services/storageService';
import { Navigation } from './components/Navigation';
import { Stopwatch } from './components/Stopwatch';
import { ThemeList } from './components/ThemeList';
import { StatsCard } from './components/StatsCard';
import { AddThemeModal } from './components/AddThemeModal';
import { JournalEditor } from './components/journal/JournalEditor';
import { JournalCard } from './components/journal/JournalCard';
import { CalendarView } from './components/journal/CalendarView';
import { GoalWizard } from './components/goals/GoalWizard';
import { MindMapTree } from './components/goals/MindMapTree';
import { DailySharpening } from './components/goals/DailySharpening';
import { LoginScreen } from './components/auth/LoginScreen'; 
import { BlogList } from './components/blog/BlogList';
import { BlogPostModal } from './components/blog/BlogPost';
import { Grinding } from './components/Grinding';
import { LevelUpModal } from './components/LevelUpModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Clock, Award, Star, Book, BookOpen, PenLine, Sparkles, Filter, Plus, Target, LogOut, User, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; 

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', avatar: '', joinedAt: Date.now() });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<GoalNode[]>([]);
  const [sharpenLogs, setSharpenLogs] = useState<SharpenLog[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  
  // Grinding State
  const [slashLogs, setSlashLogs] = useState<SlashLog[]>([]);
  const [grindingStats, setGrindingStats] = useState<GrindingStats | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isGoalWizardOpen, setIsGoalWizardOpen] = useState(false);
  
  // Level Up Modal State
  const [levelUpRank, setLevelUpRank] = useState<Rank | null>(null);
  
  // Blog State
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  
  const [journalInitialContent, setJournalInitialContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<UserProfile>>({});

  // Load data
  useEffect(() => {
    // Check auth
    const currentUser = storageService.getCurrentUser();
    setUser(currentUser);
    
    // Load Extended Profile
    const profile = storageService.getProfile();
    setUserProfile(profile);

    const loadedThemes = storageService.getThemes();
    const loadedSessions = storageService.getSessions();
    const loadedJournal = storageService.getJournalEntries();
    const loadedGoals = storageService.getGoals();
    const loadedLogs = storageService.getSharpenLogs();
    const loadedSlashLogs = storageService.getSlashLogs();

    setThemes(loadedThemes);
    setSessions(loadedSessions);
    setJournalEntries(loadedJournal);
    setGoals(loadedGoals);
    setSharpenLogs(loadedLogs);
    setSlashLogs(loadedSlashLogs);
    
    // Load Grinding Stats
    if (currentUser) {
       const stats = storageService.getGrindingStats(currentUser.id);
       setGrindingStats(stats);
    }

    if (loadedThemes.length > 0 && !activeThemeId) {
      setActiveThemeId(loadedThemes[0].id);
    }
  }, []); 

  // Re-load stats if user changes
  useEffect(() => {
    if (user) {
      const stats = storageService.getGrindingStats(user.id);
      setGrindingStats(stats);
    }
  }, [user]);

  const activeTheme = themes.find(t => t.id === activeThemeId) || null;
  const totalSecondsAll = themes.reduce((acc, t) => acc + t.totalSeconds, 0);
  
  // Calculate Today's Total Seconds for the active theme
  const getTodayTotalSeconds = (themeId: string | null) => {
    if (!themeId) return 0;
    const today = new Date().toDateString();
    return sessions
      .filter(s => s.themeId === themeId && new Date(s.endTime).toDateString() === today)
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  };

  const todayTotalSeconds = getTodayTotalSeconds(activeThemeId);

  // Calculate Streak (Based on Session Data)
  const getStreak = () => {
    if (sessions.length === 0) return 0;
    
    // Get unique dates sorted desc
    const uniqueDates = Array.from<string>(new Set(
      sessions.map(s => new Date(s.endTime).toDateString())
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if streak is alive (activity today or yesterday)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = getStreak();

  // Calculate Last Activity Timestamp (Latest of Session OR SharpenLog)
  const lastActivityAt = (() => {
    const latestSession = sessions.length > 0 ? sessions[0].endTime : 0;
    const latestLog = sharpenLogs.length > 0 ? sharpenLogs[0].timestamp : 0;
    return Math.max(latestSession, latestLog);
  })();

  const getRank = (seconds: number): Rank => {
    let currentRank = Rank.Beginner;
    for (const [rank, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
      if (seconds >= threshold) {
        currentRank = rank as Rank;
      }
    }
    return currentRank;
  };

  const overallRank = getRank(totalSecondsAll);

  // --- Handlers ---

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser);
    storageService.saveCurrentUser(authUser);
    
    // Sync basic info to Profile
    const updatedProfile = { ...userProfile, name: authUser.name, avatar: authUser.avatar || '' };
    setUserProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  const handleLogout = () => {
    setUser(null);
    storageService.removeCurrentUser();
  };

  const handleSaveSession = (seconds: number, note: string) => {
    if (!activeThemeId) return;

    // Check rank before update
    const prevRank = getRank(totalSecondsAll);

    const newSession: Session = {
      id: generateId(),
      themeId: activeThemeId,
      startTime: Date.now() - seconds * 1000,
      endTime: Date.now(),
      durationSeconds: seconds,
      note,
    };

    const updatedThemes = themes.map(t => {
      if (t.id === activeThemeId) {
        return { ...t, totalSeconds: t.totalSeconds + seconds };
      }
      return t;
    });

    // Update state
    setThemes(updatedThemes);
    setSessions(prev => [newSession, ...prev]);
    
    storageService.saveThemes(updatedThemes);
    storageService.saveSession(newSession);

    // Check rank after update (Aggregate)
    const newTotalSecondsAll = updatedThemes.reduce((acc, t) => acc + t.totalSeconds, 0);
    const newRank = getRank(newTotalSecondsAll);

    if (newRank !== prevRank) {
      setLevelUpRank(newRank);
    }

    const themeName = themes.find(t => t.id === activeThemeId)?.title || '練習';
    const minutes = Math.floor(seconds / 60);
    const timeText = minutes > 60 ? `${(minutes / 60).toFixed(1)}時間` : `${minutes}分`;
    const defaultText = `【${themeName}】を${timeText}実施しました。\n${note ? `メモ: ${note}` : ''}`;
    
    setJournalInitialContent(defaultText);
    setTimeout(() => setIsJournalModalOpen(true), 500); 
  };

  const handleAddTheme = (title: string, color: string, icon: string) => {
    const newTheme: Theme = {
      id: generateId(),
      title,
      color,
      icon,
      totalSeconds: 0,
      createdAt: Date.now(),
    };
    const updatedThemes = [...themes, newTheme];
    setThemes(updatedThemes);
    storageService.saveThemes(updatedThemes);
    setActiveThemeId(newTheme.id);
  };

  const handleSaveJournal = (entry: JournalEntry) => {
    const updatedEntries = [entry, ...journalEntries];
    setJournalEntries(updatedEntries);
    storageService.saveJournalEntry(entry);
    setJournalInitialContent(''); 
  };

  const handleSaveGoal = (rootGoal: GoalNode) => {
    const updatedGoals = [...goals, rootGoal];
    setGoals(updatedGoals);
    storageService.saveGoals(updatedGoals);
  };

  const handleSharpen = (actionNode: GoalNode) => {
    const newLog: SharpenLog = {
      id: generateId(),
      nodeId: actionNode.id,
      nodeTitle: actionNode.title,
      timestamp: Date.now()
    };
    const updatedLogs = [newLog, ...sharpenLogs];
    setSharpenLogs(updatedLogs);
    storageService.saveSharpenLog(newLog);

    if (confirm(`「${actionNode.title}」を完了しました！\nこのまま日記に記録しますか？`)) {
      setJournalInitialContent(`【研ぎ完了】${actionNode.title}を実施しました。\nTrigger: ${actionNode.trigger || 'なし'}`);
      setIsJournalModalOpen(true);
    }
  };

  const handleSlash = (durationSec: number, earnedTGI: number) => {
    if (!user || !grindingStats) return;

    // Helper to calculate rank (duplicated locally to ensure sync)
    // In a real app, this should be a shared utility or server-side
    const calculateRank = (tgi: number) => {
       const k = 0.00138;
       const rank = 8232000000 * Math.exp(-k * tgi);
       return Math.max(1, Math.floor(rank));
    };

    const newTotalTGI = grindingStats.totalTGI + earnedTGI;
    const rankBefore = grindingStats.currentRank;
    const rankAfter = calculateRank(newTotalTGI);

    const newLog: SlashLog = {
      id: generateId(),
      userId: user.id,
      durationSec,
      earnedTGI,
      executedAt: Date.now(),
      rankBefore,
      rankAfter,
      overtakenCount: Math.max(0, rankBefore - rankAfter)
    };
    
    const newStats: GrindingStats = {
      ...grindingStats,
      totalTGI: newTotalTGI,
      currentRank: rankAfter,
      lastSlashedAt: Date.now(),
      bestRank: Math.min(grindingStats.bestRank, rankAfter)
    };

    setSlashLogs([newLog, ...slashLogs]);
    setGrindingStats(newStats);
    
    storageService.saveSlashLog(newLog);
    storageService.saveGrindingStats(newStats);
  };

  const handleUpdateProfile = () => {
    const updated = { ...userProfile, ...editProfileData };
    setUserProfile(updated);
    storageService.saveProfile(updated);
    setIsEditingProfile(false);
  };

  const filteredJournalEntries = selectedDate
    ? journalEntries.filter(entry => {
        const d = new Date(entry.createdAt);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : journalEntries;

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySessions = sessions.filter(s => 
        new Date(s.endTime).toISOString().split('T')[0] === date
      );
      const totalSec = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      return {
        name: new Date(date).toLocaleDateString('ja-JP', { weekday: 'short' }),
        hours: parseFloat((totalSec / 3600).toFixed(1)),
      };
    });
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'grinding':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">自己研鑽 -GRINDING-</h2>
               <p className="text-slate-500 text-sm">力を溜め、世界を一閃せよ</p>
             </div>
             {grindingStats && (
                <Grinding 
                  stats={grindingStats} 
                  onSlash={handleSlash} 
                />
             )}
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">目標マップ (Markdown Outline)</h2>
              <button 
                onClick={() => setIsGoalWizardOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規目標を分解
              </button>
            </div>
            
            <div className="grid gap-6">
              {goals.length > 0 ? (
                themes.map(theme => {
                    const themeGoals = goals.filter(g => g.themeId === theme.id);
                    if (themeGoals.length === 0) return null;
                    return (
                        <MindMapTree key={theme.id} theme={theme} nodes={themeGoals} />
                    );
                })
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                  <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-700">目標がまだ設定されていません</h3>
                  <p className="text-slate-500 mt-2 mb-6">
                    「大目標」を「中目標」「小目標」そして「アクション」へ。<br/>
                    階層構造で思考を整理しましょう。
                  </p>
                  <button 
                    onClick={() => setIsGoalWizardOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    目標設定ウィザードを開始
                  </button>
                </div>
              )}
              {goals.some(g => !g.themeId) && (
                 <div className="opacity-50">
                    <h4 className="text-sm font-bold text-slate-400 mb-2">未分類の目標</h4>
                    <MindMapTree theme={{...themes[0], title: '未分類', color: 'bg-slate-500'}} nodes={goals.filter(g => !g.themeId)} />
                 </div>
              )}
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">週間アクティビティ</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      hide 
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">全体の内訳</h3>
                <div className="space-y-4">
                  {themes.map(theme => (
                    <div key={theme.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{theme.title}</span>
                        <span className="text-slate-500">{Math.floor(theme.totalSeconds / 3600)}時間</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${theme.color}`} 
                          style={{ width: `${Math.min(100, (theme.totalSeconds / (totalSecondsAll || 1)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">研ぎ（行動）実績</h3>
                 <div className="text-center py-6">
                   <div className="text-5xl font-bold text-emerald-600 mb-2">{sharpenLogs.length}</div>
                   <div className="text-sm text-slate-500 font-medium uppercase tracking-widest">生涯研ぎ回数</div>
                   <div className="mt-4 text-xs text-slate-400">
                     小さな行動の積み重ねが、<br/>とてつもない結果を生みます。
                   </div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'journal':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">日記・振り返り</h2>
              <button 
                onClick={() => {
                  setJournalInitialContent('');
                  setIsJournalModalOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                書く
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CalendarView 
                  entries={journalEntries}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">継続のヒント</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      「KPT法」を使って、今日のKeep(継続)とProblem(改善)を書き出してみましょう。
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {selectedDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 animate-in fade-in slide-in-from-left-2">
                    <Filter size={16} />
                    <span>
                      {selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の記録を表示中
                    </span>
                  </div>
                )}

                {filteredJournalEntries.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="inline-block p-4 rounded-full bg-slate-50 mb-3"><BookOpen size={32} /></div>
                    <p className="mb-4">
                      {selectedDate ? 'この日の記録はありません。' : 'まだ日記がありません。'}
                    </p>
                    <button onClick={() => setIsJournalModalOpen(true)} className="text-indigo-600 font-medium text-sm hover:underline">
                      今日の振り返りを書く
                    </button>
                  </div>
                ) : (
                  filteredJournalEntries.map(entry => (
                    <JournalCard key={entry.id} entry={entry} />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case 'blog':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <BlogList 
              posts={BLOG_POSTS} 
              onSelectPost={setSelectedBlogPost} 
            />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white text-center shadow-lg shadow-indigo-200 relative overflow-hidden">
               <button 
                onClick={handleLogout}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="ログアウト"
              >
                <LogOut size={18} />
              </button>

              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/30 overflow-hidden">
                 {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-4xl">👑</span>
                 )}
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-indigo-100 font-medium mb-4">{overallRank}</p>
              <div className="flex justify-center gap-8 text-center border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <div className="text-xs text-indigo-200 uppercase tracking-wider">セッション</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{journalEntries.length}</div>
                  <div className="text-xs text-indigo-200 uppercase tracking-wider">日記</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{sharpenLogs.length}</div>
                  <div className="text-xs text-indigo-200 uppercase tracking-wider">研ぎ回数</div>
                </div>
              </div>
            </div>

            {/* Profile Edit Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <User className="text-indigo-500" /> プロフィール詳細
                 </h3>
                 {!isEditingProfile ? (
                   <button 
                    onClick={() => {
                       setEditProfileData(userProfile);
                       setIsEditingProfile(true);
                    }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                   >
                     編集する
                   </button>
                 ) : (
                   <div className="flex gap-2">
                     <button onClick={() => setIsEditingProfile(false)} className="text-sm text-slate-500 hover:text-slate-700">キャンセル</button>
                     <button onClick={handleUpdateProfile} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        <Save size={14} /> 保存
                     </button>
                   </div>
                 )}
               </div>
               
               {isEditingProfile ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">年代</label>
                       <select 
                         className="w-full p-2 rounded border border-slate-200 text-sm"
                         value={editProfileData.ageGroup || ''}
                         onChange={(e) => setEditProfileData({...editProfileData, ageGroup: e.target.value as AgeGroup})}
                       >
                         <option value="">未選択</option>
                         <option value="10s">10代</option>
                         <option value="20s">20代</option>
                         <option value="30s">30代</option>
                         <option value="40s">40代</option>
                         <option value="50s">50代</option>
                         <option value="60s+">60代以上</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">性別</label>
                       <select 
                         className="w-full p-2 rounded border border-slate-200 text-sm"
                         value={editProfileData.gender || ''}
                         onChange={(e) => setEditProfileData({...editProfileData, gender: e.target.value as Gender})}
                       >
                         <option value="">未選択</option>
                         <option value="Male">男性</option>
                         <option value="Female">女性</option>
                         <option value="Other">その他</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">居住地域</label>
                       <select 
                         className="w-full p-2 rounded border border-slate-200 text-sm"
                         value={editProfileData.region || ''}
                         onChange={(e) => setEditProfileData({...editProfileData, region: e.target.value as Region})}
                       >
                         <option value="">未選択</option>
                         <option value="Japan">日本</option>
                         <option value="Asia">アジア(日本以外)</option>
                         <option value="NorthAmerica">北米</option>
                         <option value="Europe">欧州</option>
                         <option value="Other">その他</option>
                       </select>
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-3 gap-4 text-sm">
                   <div>
                     <span className="block text-xs text-slate-400">年代</span>
                     <span className="font-medium">{userProfile.ageGroup ? `${userProfile.ageGroup.replace('s', '代')}` : '未設定'}</span>
                   </div>
                   <div>
                     <span className="block text-xs text-slate-400">性別</span>
                     <span className="font-medium">{userProfile.gender === 'Male' ? '男性' : userProfile.gender === 'Female' ? '女性' : userProfile.gender === 'Other' ? 'その他' : '未設定'}</span>
                   </div>
                   <div>
                     <span className="block text-xs text-slate-400">居住地域</span>
                     <span className="font-medium">{userProfile.region === 'Japan' ? '日本' : userProfile.region || '未設定'}</span>
                   </div>
                 </div>
               )}
               
               <p className="text-xs text-slate-400 mt-4">
                 ※ この情報は「世界ランキング」の比較対象を最適化するために使用されます。
               </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="text-amber-500" /> 実績
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { title: 'はじめの一歩', desc: '最初のセッションを記録', done: sessions.length > 0 },
                   { title: '研ぎ師', desc: 'ミニ行動を記録', done: sharpenLogs.length > 0 },
                   { title: '献身', desc: '100時間達成', done: totalSecondsAll > 360000 },
                   { title: '博識', desc: '3つ以上のスキル', done: themes.length >= 3 },
                   { title: '没頭', desc: '10時間以上のセッション', done: sessions.some(s => s.durationSeconds > 36000) },
                   { title: '三日坊主卒業', desc: '3日連続で記録', done: currentStreak >= 3 },
                 ].map((badge, i) => (
                   <div key={i} className={`p-4 rounded-xl border ${badge.done ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                     <div className="flex items-center gap-2 mb-1">
                       <Star className={`w-4 h-4 ${badge.done ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                       <span className={`font-semibold text-sm ${badge.done ? 'text-amber-900' : 'text-slate-500'}`}>{badge.title}</span>
                     </div>
                     <p className="text-xs text-slate-500">{badge.desc}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <DailySharpening 
               goals={goals} 
               logs={sharpenLogs} 
               onSharpen={handleSharpen} 
             />

            <Stopwatch 
              activeTheme={activeTheme} 
              onSaveSession={handleSaveSession}
              todayTotalSeconds={todayTotalSeconds}
              totalSecondsAll={activeTheme ? activeTheme.totalSeconds : 0}
              streak={currentStreak}
              sharpenLogs={sharpenLogs}
              sessions={sessions}
              lastActivityTimestamp={lastActivityAt}
              userProfile={userProfile}
            />

            <div>
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-900">最近のセッション</h3>
                <button onClick={() => setActiveTab('journal')} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">すべて見る</button>
              </div>
              <div className="space-y-3">
                {sessions.slice(0, 3).map(session => (
                  <div key={session.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{themes.find(t => t.id === session.themeId)?.title}</div>
                        <div className="text-xs text-slate-500">{new Date(session.endTime).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-medium text-slate-600">
                      {Math.floor(session.durationSeconds / 60)}分
                    </span>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-sm text-slate-400 px-1">まだ活動がありません。記録を始めましょう！</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex">
        <Navigation 
          activeTab={activeTab} 
          onChangeTab={setActiveTab}
          onAddTheme={() => setIsAddModalOpen(true)}
        />
        
        <main className="flex-1 md:ml-64 pb-24 md:pb-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="md:hidden flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-serif text-xl italic">K</div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">ken-san</span>
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
               <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=User`} alt="User" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              {renderContent()}
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
              <div className="hidden lg:flex items-center justify-end gap-3 mb-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{overallRank}</div>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                   <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=User`} alt="User" />
                </div>
              </div>

              {activeTab === 'dashboard' && (
                <ThemeList 
                  themes={themes} 
                  activeThemeId={activeThemeId} 
                  onSelectTheme={(id) => {
                    setActiveThemeId(id);
                    if (window.innerWidth < 1024) {
                       setActiveTab('dashboard'); 
                    }
                  }} 
                />
              )}
              {activeTab !== 'dashboard' && (
                 <div className="hidden lg:block">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">クイックナビ</h3>
                   <div className="space-y-2">
                     <button onClick={() => setActiveTab('dashboard')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition">
                        ← ダッシュボードに戻る
                     </button>
                     <button onClick={() => setActiveTab('blog')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition">
                        📚 継続のヒントを読む
                     </button>
                   </div>
                 </div>
              )}
            </div>
          </div>
        </main>

        <AddThemeModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddTheme}
        />

        <JournalEditor
          isOpen={isJournalModalOpen}
          onClose={() => setIsJournalModalOpen(false)}
          onSave={handleSaveJournal}
          initialContent={journalInitialContent}
        />

        <GoalWizard
          isOpen={isGoalWizardOpen}
          onClose={() => setIsGoalWizardOpen(false)}
          onSave={handleSaveGoal}
          themes={themes}
        />
        
        <BlogPostModal 
          post={selectedBlogPost}
          isOpen={!!selectedBlogPost}
          onClose={() => setSelectedBlogPost(null)}
        />
        
        <LevelUpModal
           isOpen={!!levelUpRank}
           onClose={() => setLevelUpRank(null)}
           rank={levelUpRank}
        />
      </div>
    </Router>
  );
};

export default App;
