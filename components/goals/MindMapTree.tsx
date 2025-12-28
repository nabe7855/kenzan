
import React from 'react';
import { GoalNode, Theme } from '../../types';
import { Target, Leaf, GitBranch, ChevronRight, Hash, Minus, CheckSquare, Clock } from 'lucide-react';

interface MindMapTreeProps {
  theme: Theme;
  nodes: GoalNode[];
}

// Recursive Outline Renderer
const OutlineNode: React.FC<{ node: GoalNode; depth: number; isLast: boolean }> = ({ node, depth, isLast }) => {
  const getStyles = () => {
    switch (node.type) {
      case 'major': // H1
        return 'text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2 border-b border-slate-100 pb-1';
      case 'medium': // H2
        return 'text-base font-semibold text-slate-700 mt-2 mb-1 flex items-center gap-2';
      case 'small': // List Item
        return 'text-sm text-slate-600 flex items-start gap-2 my-1';
      case 'action': // Task
        return 'text-sm font-medium text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex items-start gap-2 my-1.5';
      default:
        return 'text-sm text-slate-800';
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'major': return <Hash className="w-4 h-4 text-indigo-500" />;
      case 'medium': return <span className="text-indigo-400 font-mono text-xs">##</span>;
      case 'small': return <Minus className="w-3 h-3 text-slate-400 mt-1.5" />;
      case 'action': return <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5" />;
      default: return null;
    }
  };

  return (
    <div className="relative">
       {/* Indentation Line */}
       {depth > 0 && (
         <div 
           className="absolute left-0 top-0 bottom-0 border-l border-slate-200 border-dashed"
           style={{ left: `${(depth - 1) * 20 + 9}px` }} 
         />
       )}

      <div 
        className={`${getStyles()}`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <span>{node.title}</span>
          {node.trigger && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-normal">
              <Clock size={10} />
              <span>@ {node.trigger}</span>
            </div>
          )}
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, idx) => (
            <OutlineNode 
                key={child.id} 
                node={child} 
                depth={depth + 1} 
                isLast={idx === node.children.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapTree: React.FC<MindMapTreeProps> = ({ theme, nodes }) => {
  if (nodes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
      <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50`}>
        <div className={`w-8 h-8 rounded-lg ${theme.color} bg-opacity-10 flex items-center justify-center`}>
           {/* Assuming icon would be rendered here in a real app, keeping simple */}
           <Target className={`w-4 h-4 ${theme.color.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{theme.title}</h3>
      </div>

      <div className="p-6 font-mono leading-relaxed">
        {nodes.map((node, i) => (
          <OutlineNode 
            key={node.id} 
            node={node} 
            depth={0} 
            isLast={i === nodes.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};
