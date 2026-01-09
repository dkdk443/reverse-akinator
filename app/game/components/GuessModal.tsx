'use client';

import { XCircle, CheckCircle2 } from 'lucide-react';
import type { Person } from '@/types';

interface GuessModalProps {
  persons: Person[];
  guessId: string;
  onGuessIdChange: (id: string) => void;
  onGuess: () => void;
  onClose: () => void;
}

export function GuessModal({
  persons,
  guessId,
  onGuessIdChange,
  onGuess,
  onClose,
}: GuessModalProps) {
  return (
    <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b border-slate-200 flex items-center bg-white">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <XCircle size={24} className="text-slate-400" />
        </button>
        <h3 className="flex-1 text-center font-bold text-lg">回答する</h3>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <p className="mb-6 text-slate-600 text-center">思い浮かべた人物を選んでください</p>
        <div className="w-full space-y-4">
          <select
            className="w-full p-4 bg-white border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={guessId}
            onChange={(e) => onGuessIdChange(e.target.value)}
          >
            <option value="">人物を選択...</option>
            {persons.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={onGuess}
            disabled={!guessId}
            className="w-full bg-indigo-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={24} />
            これで決定
          </button>
        </div>
      </div>
    </div>
  );
}
