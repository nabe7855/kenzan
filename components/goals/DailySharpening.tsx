
import React from 'react';
import { GoalNode, SharpenLog } from '../../types';
import { Check, Leaf, Zap, Clock } from 'lucide-react';

interface DailySharpeningProps {
  goals: GoalNode[];
  logs: SharpenLog[];
  onSharpen: (leafNode: GoalNode) => void;
}

export const DailySharpening: React.FC<DailySharpeningProps> = ({ goals, logs, onSharpen }) => {
  // Recursively extract all LEAF nodes (now called 'action')
  const getAllActions = (nodes: GoalNode[]): GoalNode[] => {
    let actions: GoalNode[] = [];
    nodes.forEach(node => {
      if (node.type === 'action') {
        actions.push(node);
      }
      if (node.children) {
        actions = [...actions, ...getAllActions(node.children)];
      }
    });
    return actions;
  };

  const actions = getAllActions(goals);
  
  // Check if completed today
  const isSharpenedToday = (nodeId: string) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return logs.some(log => 
      log.nodeId === nodeId && log.timestamp >= today
    );
  };

  // Get total sharpen count per node
  const getSharpenCount = (nodeId: string) => {
    return logs.filter(log => log.nodeId === nodeId).length;
  };

  if (actions.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Leaf className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">今日の「研ぎ」タスク</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
          {actions.filter(l => !isSharpenedToday(l.id)).length} 残り
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map(action => {
          const done = isSharpenedToday(action.id);
          const count = getSharpenCount(action.id);

          return (
            <button
              key={action.id}
              onClick={() => !done && onSharpen(action)}
              disabled={done}
              className={`relative overflow-hidden group p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                done 
                  ? 'bg-emerald-50 border-emerald-200 opacity-80' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-50'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                    <Clock size={10} />
                    {action.trigger || 'いつでも'}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">Total: {count}回</span>
                </div>
                <div className={`font-bold truncate ${done ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                   {action.title}
                </div>
              </div>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                done 
                  ? 'bg-emerald-500 text-white scale-110' 
                  : 'bg-slate-100 text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-500'
              }`}>
                {done ? <Check size={20} /> : <Zap size={20} />}
              </div>
            </button>
          );
        })}
      </div>
      
      {actions.length > 0 && (
         <p className="text-[10px] text-slate-400 text-right mt-2 pr-1">
           ※ 小さな行動でも1回は1回。継続日数より「総回数」が重要です。
         </p>
      )}
    </div>
  );
};
