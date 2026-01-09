'use client';

import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Send,
} from 'lucide-react';
import type { Attribute } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface QuestionPanelProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  attributes: Attribute[];
  aiQuestion: string;
  setAiQuestion: (question: string) => void;
  aiRemaining: number;
  isAiThinking: boolean;
  handleAskAIQuestion: (e: React.FormEvent) => void;
  customYear: string;
  setCustomYear: (year: string) => void;
  yearDirection: 'before' | 'after';
  setYearDirection: (direction: 'before' | 'after') => void;
  handleAskYearQuestion: () => void;
  handleAskQuestion: (attribute: Attribute) => void;
  setGameState: (state: 'guessing') => void;
}

export function QuestionPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  attributes,
  aiQuestion,
  setAiQuestion,
  aiRemaining,
  isAiThinking,
  handleAskAIQuestion,
  customYear,
  setCustomYear,
  yearDirection,
  setYearDirection,
  handleAskYearQuestion,
  handleAskQuestion,
  setGameState,
}: QuestionPanelProps) {
  const getQuestionsByCategory = (category: string) => {
    return attributes.filter(attr => attr.category === category);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
      <div className="max-w-4xl mx-auto">
        {/* カテゴリタブ */}
        <div className="flex overflow-x-auto py-2 px-2 border-b border-slate-100">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center flex-shrink-0 px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                ? `${cat.bg} ${cat.color} ring-2 ring-offset-1 shadow-sm`
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <cat.icon size={16} className="mr-2" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* 質問リスト */}
        <div className="p-2 h-48 md:h-52 bg-slate-50/50 flex flex-col overflow-y-auto">
          {/* AI自由質問フォーム */}
          {selectedCategory === 'ai' && (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <p className="text-sm text-slate-600 mb-3 font-medium flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                AIに自由に質問できます
              </p>
              <p className="text-xs text-slate-500 mb-4">残り: {aiRemaining}/5回</p>
              <form onSubmit={handleAskAIQuestion} className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="例: ちょんまげをしていましたか？"
                  className="flex-1 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  disabled={aiRemaining === 0 || isAiThinking}
                />
                <button
                  type="submit"
                  disabled={!aiQuestion.trim() || aiRemaining === 0 || isAiThinking}
                  className="px-4 py-3 bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Send size={16} />
                  質問
                </button>
              </form>
            </div>
          )}

          {/* 年代カテゴリ：年入力フォーム */}
          {selectedCategory === 'era' && (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <p className="text-sm text-slate-600 mb-4 font-medium">西暦を入力して絞り込み</p>
              <div className="flex items-center gap-2 w-full max-w-xs mb-4">
                <input
                  type="number"
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                  placeholder="例: 1600"
                  className="flex-1 p-3 border border-slate-300 rounded-lg text-center text-base focus:ring-2 focus:ring-amber-400 outline-none"
                />
                <span className="text-sm font-medium text-slate-600">年</span>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => {
                    setYearDirection('before');
                    handleAskYearQuestion();
                  }}
                  disabled={!customYear}
                  className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400 text-sm font-bold transition-colors"
                >
                  より前
                </button>
                <button
                  onClick={() => {
                    setYearDirection('after');
                    handleAskYearQuestion();
                  }}
                  disabled={!customYear}
                  className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400 text-sm font-bold transition-colors"
                >
                  より後
                </button>
              </div>
            </div>
          )}

          {/* プリセット質問リスト */}
          {selectedCategory !== 'ai' && selectedCategory !== 'era' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {getQuestionsByCategory(selectedCategory).map(q => (
                <button
                  key={q.id}
                  onClick={() => handleAskQuestion(q)}
                  className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md hover:text-indigo-700 transition-all text-sm md:text-base group flex items-center justify-between active:scale-[0.99]"
                >
                  <span>{q.question}</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* モバイル用回答ボタン */}
        <div className="md:hidden p-3 border-t border-slate-100 bg-white flex justify-center">
          <button
            onClick={() => setGameState('guessing')}
            className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            回答する（推理）
          </button>
        </div>
      </div>
    </div>
  );
}
