import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { THEME_COLORS, getIconComponent } from '../constants';

interface AddThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: string, icon: string) => void;
}

export const AddThemeModal: React.FC<AddThemeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');

  const iconOptions = ['Code', 'Music', 'PenTool', 'Dumbbell', 'Globe', 'BookOpen'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, selectedColor, selectedIcon);
      setTitle('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">新しいスキルテーマ</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">スキル名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: スペイン語、ギター、Python"
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">テーマカラー</label>
            <div className="flex gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${color} relative flex items-center justify-center transition-transform hover:scale-110`}
                >
                  {selectedColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">アイコン</label>
            <div className="flex gap-3">
              {iconOptions.map((iconName) => {
                const Icon = getIconComponent(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-xl border ${
                      selectedIcon === iconName 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={!title.trim()} className="w-full">
              テーマを作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};