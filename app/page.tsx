'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Play, BrainCircuit, Sparkles, Star, Award, Flame } from 'lucide-react';

type Difficulty = 'easy' | 'normal' | 'hard' | 'all';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'やさしい',
    icon: Star,
    color: 'bg-emerald-400',
    hoverColor: 'hover:bg-emerald-500',
    borderColor: 'border-emerald-400',
    description: '超有名な人物',
    emoji: '⭐',
  },
  normal: {
    label: 'ふつう',
    icon: Award,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    borderColor: 'border-indigo-500',
    description: '中程度の知名度',
    emoji: '🎯',
  },
  hard: {
    label: 'むずかしい',
    icon: Flame,
    color: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-600',
    borderColor: 'border-rose-500',
    description: 'マニアック',
    emoji: '🔥',
  },
  all: {
    label: 'すべて',
    icon: Sparkles,
    color: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-700',
    borderColor: 'border-indigo-600',
    description: 'ランダム',
    emoji: '✨',
  },
};

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600 animate-bounce shadow-md shadow-indigo-100">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          私は誰でしょう？
        </h2>
        <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
          私が思い浮かべた「歴史上の人物」を当ててください。<br />
          質問を投げかけると、私が答えます。
        </p>

        {/* 難易度選択 */}
        <div className="w-full max-w-md mb-6">
          <p className="text-sm font-bold text-slate-800 mb-3">難易度を選択</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((difficulty) => {
              const config = DIFFICULTY_CONFIG[difficulty];
              const Icon = config.icon;
              const isSelected = selectedDifficulty === difficulty;
              return (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-4 rounded-xl border-2 transition-all transform active:scale-95 ${
                    isSelected
                      ? `${config.color} ${config.borderColor} text-white shadow-lg shadow-indigo-100 scale-105`
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon size={20} />
                    <span className="font-bold text-base">{config.label}</span>
                  </div>
                  <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 w-full max-w-xs">
          <Link href={`/game?difficulty=${selectedDifficulty}&gameId=${Date.now()}`}>
            <button className="w-full bg-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95">
              <Play size={24} fill="currentColor" />
              ゲームスタート
            </button>
          </Link>
          <div className="flex justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" />
              データベース搭載
            </span>
            <span>•</span>
            <span>完全無料</span>
          </div>
        </div>
      </div>
    </div>
  );
}
