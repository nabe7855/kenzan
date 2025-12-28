import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { MoodSelector } from './MoodSelector';
import { JournalEntry, JournalFramework, Mood } from '../../types';

import { v4 as uuidv4 } from 'uuid';

// Speech Recognition Type Definition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface JournalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  initialContent?: string; // Prop for pre-filling content from Stopwatch
}

const FRAMEWORKS: { id: JournalFramework; label: string; desc: string }[] = [
  { id: 'free', label: '自由記述', desc: '形式にとらわれず自由に記録' },
  { id: 'kpt', label: 'KPT法', desc: 'Keep(継続), Problem(課題), Try(挑戦)' },
  { id: 'ywt', label: 'YWT法', desc: 'やったこと, わかったこと, 次やること' },
  { id: '4line', label: '4行日記', desc: '事実, 発見, 教訓, 宣言' },
  { id: 'thankful', label: '感謝日記', desc: '今日あった良いこと、感謝すること' },
];

export const JournalEditor: React.FC<JournalEditorProps> = ({ isOpen, onClose, onSave, initialContent = '' }) => {
  const [mood, setMood] = useState<Mood>('neutral');
  const [framework, setFramework] = useState<JournalFramework>('free');
  const [content, setContent] = useState('');
  const [structuredContent, setStructuredContent] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeInputKey, setActiveInputKey] = useState<string | null>(null);

  // Load initial content when modal opens
  useEffect(() => {
    if (isOpen && initialContent) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleStructureChange = (key: string, value: string) => {
    setStructuredContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl]);
      setImageUrl('');
    }
  };

  // --- Voice Input Logic ---
  const handleVoiceInput = (targetKey: string | 'content') => {
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('お使いのブラウザは音声入力に対応していません。Google Chromeなどをご利用ください。');
      return;
    }

    if (isListening) {
      // Stop logic is handled by the recognition instance usually, but for UI toggle:
      setIsListening(false);
      setActiveInputKey(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setActiveInputKey(targetKey);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      if (targetKey === 'content') {
        setContent(prev => prev + (prev ? '\n' : '') + transcript);
      } else {
        setStructuredContent(prev => ({
          ...prev,
          [targetKey]: (prev[targetKey] || '') + (prev[targetKey] ? ' ' : '') + transcript
        }));
      }
      setIsListening(false);
      setActiveInputKey(null);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setActiveInputKey(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveInputKey(null);
    };

    recognition.start();
  };

  const renderMicButton = (targetKey: string) => (
    <button
      type="button"
      onClick={() => handleVoiceInput(targetKey)}
      className={`p-2 rounded-full transition-colors absolute bottom-2 right-2 ${isListening && activeInputKey === targetKey
        ? 'bg-red-100 text-red-600 animate-pulse'
        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      title="音声入力"
    >
      {isListening && activeInputKey === targetKey ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = content;
    if (framework !== 'free' && !finalContent) {
      finalContent = Object.values(structuredContent).join('\n');
    }

    const entry: JournalEntry = {
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mood,
      framework,
      content: finalContent,
      structuredContent,
      images,
      tags: [],
    };
    onSave(entry);

    // Reset form
    setMood('neutral');
    setFramework('free');
    setContent('');
    setStructuredContent({});
    setImages([]);
    onClose();
  };

  const renderFrameworkInputs = () => {
    switch (framework) {
      case 'kpt':
        return (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-indigo-600 mb-1">Keep (良かったこと・継続すること)</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg bg-indigo-50/50 border border-indigo-100 focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={structuredContent.keep || ''}
                onChange={(e) => handleStructureChange('keep', e.target.value)}
                placeholder="うまくいったこと、続けたい習慣..."
              />
              {renderMicButton('keep')}
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-rose-600 mb-1">Problem (改善点・課題)</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg bg-rose-50/50 border border-rose-100 focus:ring-2 focus:ring-rose-500 text-sm"
                rows={2}
                value={structuredContent.problem || ''}
                onChange={(e) => handleStructureChange('problem', e.target.value)}
                placeholder="うまくいかなかったこと、悩み..."
              />
              {renderMicButton('problem')}
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-emerald-600 mb-1">Try (次に挑戦すること)</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-500 text-sm"
                rows={2}
                value={structuredContent.try || ''}
                onChange={(e) => handleStructureChange('try', e.target.value)}
                placeholder="具体的な解決策、新しい試み..."
              />
              {renderMicButton('try')}
            </div>
          </div>
        );
      case 'ywt':
        return (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-1">Y: やったこと</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={structuredContent.y || ''}
                onChange={(e) => handleStructureChange('y', e.target.value)}
              />
              {renderMicButton('y')}
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-1">W: わかったこと</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={structuredContent.w || ''}
                onChange={(e) => handleStructureChange('w', e.target.value)}
              />
              {renderMicButton('w')}
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-1">T: 次にやること</label>
              <textarea
                className="w-full p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={structuredContent.t || ''}
                onChange={(e) => handleStructureChange('t', e.target.value)}
              />
              {renderMicButton('t')}
            </div>
          </div>
        );
      case '4line':
        return (
          <div className="space-y-3">
            {['事実', '発見', '教訓', '宣言'].map((label, i) => (
              <div key={label} className="relative">
                <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                <input
                  type="text"
                  className="w-full p-2 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={structuredContent[`line${i + 1}`] || ''}
                  onChange={(e) => handleStructureChange(`line${i + 1}`, e.target.value)}
                  placeholder={`${label}を一言で...`}
                />
                {renderMicButton(`line${i + 1}`)}
              </div>
            ))}
          </div>
        );
      case 'thankful':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-amber-600 mb-1">今日感謝すること・良かったこと（3つ）</label>
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex gap-2 items-center relative">
                <span className="text-amber-500 font-bold">{num}.</span>
                <input
                  type="text"
                  className="w-full p-2 pr-10 rounded-lg border border-amber-200 bg-amber-50/30 focus:ring-2 focus:ring-amber-500 text-sm"
                  value={structuredContent[`thank${num}`] || ''}
                  onChange={(e) => handleStructureChange(`thank${num}`, e.target.value)}
                  placeholder="ありがとう..."
                />
                {renderMicButton(`thank${num}`)}
              </div>
            ))}
          </div>
        );
      case 'free':
      default:
        return (
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日はどんな一日でしたか？学んだこと、感じたことを自由に書きましょう。"
              className="w-full p-4 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px] text-base leading-relaxed"
            />
            {renderMicButton('content')}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">新しい振り返り</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="journal-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Mood Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">今日の気分</label>
              <MoodSelector selectedMood={mood} onSelect={setMood} />
            </div>

            {/* Framework Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">記録フレームワーク</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as JournalFramework)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {FRAMEWORKS.map(f => (
                  <option key={f.id} value={f.id}>{f.label} - {f.desc}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Content Inputs */}
            {renderFrameworkInputs()}

            {/* Images (Simulated) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">画像添付（URL）</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-sm"
                />
                <button type="button" onClick={handleAddImage} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200">
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <Button type="submit" form="journal-form" className="w-full shadow-lg shadow-indigo-200">
            記録を保存
          </Button>
        </div>
      </div>
    </div>
  );
};