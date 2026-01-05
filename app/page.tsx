import Link from 'next/link';
import { Play, BrainCircuit, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600 animate-bounce">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          私は誰でしょう？
        </h2>
        <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
          私が思い浮かべた「歴史上の人物」を当ててください。<br />
          質問を投げかけると、私が答えます。
        </p>
        <div className="space-y-4 w-full max-w-xs">
          <Link href="/game">
            <button className="w-full bg-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95">
              <Play size={24} fill="currentColor" />
              ゲームスタート
            </button>
          </Link>
          <div className="flex justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Sparkles size={12} /> データベース搭載</span>
            <span>•</span>
            <span>完全無料</span>
          </div>
        </div>
      </div>
    </div>
  );
}
