
import React from 'react';
import { LayoutDashboard, BarChart2, Book, Trophy, Settings, Plus, Target, BookOpenText, Sword } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onAddTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab, onAddTheme }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'ホーム' },
    { id: 'grinding', icon: Sword, label: '自己研鑽' },
    { id: 'goals', icon: Target, label: '目標' },
    { id: 'stats', icon: BarChart2, label: '統計' },
    { id: 'journal', icon: Book, label: '日記' },
    { id: 'blog', icon: BookOpenText, label: 'ブログ' },
    { id: 'profile', icon: Trophy, label: 'プロフィール' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-serif text-xl italic">K</div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ken-san</span>
          </div>
          
          <button 
            onClick={onAddTheme}
            className="w-full flex items-center gap-2 bg-indigo-50 text-indigo-700 p-3 rounded-lg font-medium hover:bg-indigo-100 transition-colors mb-6"
          >
            <Plus className="w-5 h-5" />
            <span>新規テーマ</span>
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-slate-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : ''}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
           <button className="flex items-center gap-3 text-slate-500 hover:text-slate-900 text-sm font-medium w-full">
            <Settings className="w-5 h-5" />
            設定
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};