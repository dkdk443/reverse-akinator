'use client';

import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';

type GameState = 'playing' | 'guessing' | 'result-win' | 'result-lose';

interface GameHeaderProps {
  gameState: GameState;
  questionCount: number;
  aiRemaining: number;
  hintRemaining: number;
  isAiThinking: boolean;
  onHint: () => void;
  onGuess: () => void;
}

export function GameHeader({
  gameState,
  questionCount,
  aiRemaining,
  hintRemaining,
  isAiThinking,
  onHint,
  onGuess,
}: GameHeaderProps) {
  return (
    <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white hidden md:block">
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Reverse Akinator</h1>
          <p className="text-xs text-slate-500">History Mystery Game</p>
        </div>
      </div>
      {gameState === 'playing' && (
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium text-slate-600">
          <button
            onClick={onHint}
            disabled={hintRemaining === 0 || isAiThinking}
            className="bg-amber-100 text-amber-700 px-3 py-2 rounded-full hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs md:text-sm shadow-sm hover:shadow-md"
            title={hintRemaining === 0 ? 'ヒントを使い切りました' : `ヒントを表示 (残り${hintRemaining}回)`}
          >
            <Sparkles size={16} />
            <span>ヒント</span>
            <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full text-xs font-bold">{hintRemaining}</span>
          </button>
          <span className="bg-slate-100 px-2 py-1.5 rounded-full text-xs">AI:{aiRemaining}</span>
          <span className="bg-slate-100 px-2 py-1.5 rounded-full text-xs">Q:{questionCount}</span>
          <button
            onClick={onGuess}
            className="bg-indigo-600 text-white px-3 py-2 md:px-4 rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
          >
            <CheckCircle2 size={18} />
            <span className="hidden md:inline">回答する</span>
          </button>
        </div>
      )}
    </header>
  );
}
