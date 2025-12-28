
import React, { useState } from 'react';
import { GoalNode, Theme } from '../../types';
import { Button } from '../ui/Button';
import { X, ArrowRight, Sparkles, Target, Zap, Clock, List, Flag, CheckCircle } from 'lucide-react';

interface GoalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rootGoal: GoalNode) => void;
  themes: Theme[];
}

// Generate UUID polyfill
const generateId = () => Math.random().toString(36).substr(2, 9);

export const GoalWizard: React.FC<GoalWizardProps> = ({ isOpen, onClose, onSave, themes }) => {
  const [step, setStep] = useState(0); // 0: Theme, 1: Major, 2: Medium, 3: Small, 4: Action
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [majorGoal, setMajorGoal] = useState('');
  const [mediumGoal, setMediumGoal] = useState('');
  const [smallGoal, setSmallGoal] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [trigger, setTrigger] = useState('');

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinish = () => {
    if (!selectedThemeId) return;

    const majorId = generateId();
    const mediumId = generateId();
    const smallId = generateId();
    const actionId = generateId();

    // Construct the tree: Major -> Medium -> Small -> Action
    const rootNode: GoalNode = {
      id: majorId,
      parentId: null,
      themeId: selectedThemeId,
      title: majorGoal,
      type: 'major',
      children: [
        {
          id: mediumId,
          parentId: majorId,
          title: mediumGoal,
          type: 'medium',
          children: [
            {
              id: smallId,
              parentId: mediumId,
              title: smallGoal,
              type: 'small',
              children: [
                {
                  id: actionId,
                  parentId: smallId,
                  title: actionPlan,
                  type: 'action',
                  trigger: trigger,
                  children: [],
                  createdAt: Date.now()
                }
              ],
              createdAt: Date.now()
            }
          ],
          createdAt: Date.now()
        }
      ],
      createdAt: Date.now()
    };

    onSave(rootNode);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(0);
    setSelectedThemeId(null);
    setMajorGoal('');
    setMediumGoal('');
    setSmallGoal('');
    setActionPlan('');
    setTrigger('');
  };

  const getStepContent = () => {
    switch (step) {
      case 0: // Theme Selection
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <List className="text-slate-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">どのテーマの目標ですか？</h3>
              <p className="text-slate-500 text-sm mt-2">
                スキルカテゴリを選択してください。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedThemeId === theme.id
                      ? `border-indigo-500 bg-indigo-50 text-indigo-900`
                      : 'border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="font-bold">{theme.title}</div>
                  <div className="text-xs text-slate-500 mt-1">現在の練習時間: {Math.floor(theme.totalSeconds / 3600)}時間</div>
                </button>
              ))}
              {themes.length === 0 && (
                <div className="text-center text-slate-400 py-4">
                  まだテーマがありません。先にホーム画面からテーマを作成してください。
                </div>
              )}
            </div>
          </div>
        );
      case 1: // Major Goal
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flag className="text-indigo-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">大目標（Major Goal）</h3>
              <p className="text-slate-500 text-sm mt-2">
                最終的に達成したい「大きな夢」は何ですか？
              </p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-xs font-mono text-slate-400 mb-2 border border-slate-100">
              # {majorGoal || '...'}
            </div>
            <input
              value={majorGoal}
              onChange={(e) => setMajorGoal(e.target.value)}
              placeholder="例：英語でビジネス交渉ができるようになる"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-lg"
              autoFocus
            />
          </div>
        );
      case 2: // Medium Goal
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">中目標（Medium Goal）</h3>
              <p className="text-slate-500 text-sm mt-2">
                それを達成するための「具体的なマイルストーン」は？
              </p>
            </div>
            <div className="space-y-1 mb-4 opacity-60">
               <div className="font-bold text-slate-800"># {majorGoal}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-xs font-mono text-slate-400 mb-2 border border-slate-100">
              ## {mediumGoal || '...'}
            </div>
            <input
              type="text"
              value={mediumGoal}
              onChange={(e) => setMediumGoal(e.target.value)}
              placeholder="例：TOEIC 800点を取得する"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-0 text-lg"
              autoFocus
            />
          </div>
        );
      case 3: // Small Goal
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <List className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">小目標（Small Goal）</h3>
              <p className="text-slate-500 text-sm mt-2">
                中目標を達成するための「要素・手段」は何ですか？
              </p>
            </div>
            <div className="space-y-1 mb-4 opacity-60 text-sm">
               <div className="font-bold text-slate-800"># {majorGoal}</div>
               <div className="pl-4 font-medium text-slate-700">## {mediumGoal}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-xs font-mono text-slate-400 mb-2 border border-slate-100">
              - {smallGoal || '...'}
            </div>
            <input
              type="text"
              value={smallGoal}
              onChange={(e) => setSmallGoal(e.target.value)}
              placeholder="例：語彙力を強化する"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 text-lg"
              autoFocus
            />
          </div>
        );
      case 4: // Action Plan & Trigger
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="text-center mb-6">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="text-emerald-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">アクションプラン & トリガー</h3>
              <p className="text-slate-500 text-sm mt-2">
                明日からできる「1秒」の行動と、それをやるタイミングは？
              </p>
            </div>

            <div className="space-y-1 mb-4 opacity-60 text-xs">
               <div className="font-bold text-slate-800"># {majorGoal}</div>
               <div className="pl-4 font-medium text-slate-700">## {mediumGoal}</div>
               <div className="pl-8 text-slate-600">- {smallGoal}</div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg text-xs font-mono text-slate-400 mb-2 border border-slate-100">
              [ ] {actionPlan || '...'} @ {trigger || '...'}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500">アクション（極小行動）</label>
                <input
                  type="text"
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder="例：英単語帳を1回開く"
                  className="w-full p-3 rounded-lg border-2 border-emerald-400 focus:border-emerald-600 focus:ring-0 bg-emerald-50"
                  autoFocus
                />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500">トリガー（いつやる？）</label>
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <input
                      type="text"
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value)}
                      placeholder="例：歯磨きのあと"
                      className="w-full p-3 rounded-lg border-b-2 border-slate-200 focus:border-amber-500 outline-none"
                    />
                 </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>

        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          {getStepContent()}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 0}
            className={step === 0 ? 'invisible' : ''}
          >
            戻る
          </Button>
          
          {step < 4 ? (
            <Button 
                onClick={handleNext} 
                disabled={
                    (step === 0 && !selectedThemeId) ||
                    (step === 1 && !majorGoal) || 
                    (step === 2 && !mediumGoal) ||
                    (step === 3 && !smallGoal)
                }
            >
              次へ <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={!actionPlan || !trigger} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              登録して完了
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
