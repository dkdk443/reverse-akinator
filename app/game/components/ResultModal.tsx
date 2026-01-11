'use client';

import {
  Globe,
  User,
  Sparkles,
  XCircle,
  RotateCcw,
  Share2,
  Image,
  BrainCircuit,
} from 'lucide-react';
import type { Person } from '@/types';

interface ResultModalProps {
  isWin: boolean;
  targetPerson: Person;
  difficulty: string;
  questionCount: number;
  onShare: () => void;
  onPreviewImage: () => void;
}

export function ResultModal({
  isWin,
  targetPerson,
  difficulty,
  questionCount,
  onShare,
  onPreviewImage,
}: ResultModalProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm overflow-hidden p-4">
      <div className="bg-white text-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">

        {/* ヘッダーエリア */}
        <div className="bg-indigo-600 p-6 text-center relative shrink-0">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-3 text-indigo-600 ring-4 ring-indigo-400/50">
            {isWin ? <Sparkles size={40} /> : <XCircle size={40} />}
          </div>
          <div className="mb-1">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-400/50 px-2 py-0.5 rounded-full">
              {isWin ? '正解' : '不正解'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight drop-shadow-sm">
            {targetPerson.name}
          </h1>
          <p className="text-indigo-200 text-sm font-medium tracking-wide mb-4">{targetPerson.name_en}</p>

          {targetPerson.catchphrase && (
            <div className="inline-block bg-yellow-400 text-yellow-900 text-xs md:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg transform -rotate-1 border border-yellow-300">
              {targetPerson.catchphrase}
            </div>
          )}
        </div>

        {/* スクロール可能なコンテンツ */}
        <div className="p-5 md:p-6 overflow-y-auto bg-slate-50" style={{ maxHeight: 'calc(100vh - 300px)' }}>

          {/* 基本情報グリッド */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">生没年</p>
              <p className="font-bold text-sm text-slate-700">
                {targetPerson.birth_year && targetPerson.death_year
                  ? `${targetPerson.birth_year} - ${targetPerson.death_year}`
                  : '不明'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">職業・身分</p>
              <p className="font-bold text-sm text-slate-700">{targetPerson.occupation || '不明'}</p>
            </div>
          </div>

          {/* 主要な功績 */}
          {targetPerson.major_achievement && (
            <div className="mb-6 relative">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> 主要な功績
              </h3>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-slate-700 leading-relaxed shadow-sm">
                <p>{targetPerson.major_achievement}</p>
              </div>
            </div>
          )}

          {/* 名言と性格 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {targetPerson.famous_quote && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-500" /> 名言
                </h3>
                <blockquote className="relative p-4 text-sm italic text-slate-600 border-l-4 border-indigo-300 bg-white rounded-r-lg shadow-sm">
                  {targetPerson.famous_quote}
                </blockquote>
              </div>
            )}
            {targetPerson.personality_trait && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                  <User className="w-4 h-4 text-pink-500" /> 性格・特徴
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  {targetPerson.personality_trait}
                </p>
              </div>
            )}
          </div>

          {/* 現代で言うと */}
          {(targetPerson.modern_comparison || targetPerson.if_alive_today) && (
            <div className="bg-indigo-50/80 rounded-xl p-5 border border-indigo-100 mb-6 relative overflow-hidden">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-3 relative z-10">
                <Globe className="w-4 h-4 text-indigo-600" /> 現代で言うと？
              </h3>
              <div className="space-y-3 relative z-10">
                {targetPerson.modern_comparison && (
                  <div className="flex gap-3 items-start">
                    <span className="bg-white text-indigo-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-indigo-100 shrink-0 mt-0.5">タイプ</span>
                    <p className="text-sm text-slate-700 font-medium">{targetPerson.modern_comparison}</p>
                  </div>
                )}
                {targetPerson.if_alive_today && (
                  <div className="flex gap-3 items-start">
                    <span className="bg-white text-indigo-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-indigo-100 shrink-0 mt-0.5">もし生きてたら</span>
                    <p className="text-sm text-slate-700">{targetPerson.if_alive_today}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 豆知識とマニアック度 */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {targetPerson.fun_fact && (
              <div className="flex-1 bg-slate-800 text-slate-200 p-4 rounded-xl flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase flex items-center gap-1">
                  豆知識
                </p>
                <p className="text-xs leading-relaxed">{targetPerson.fun_fact}</p>
              </div>
            )}
            {targetPerson.trivia_level !== null && (
              <div className="shrink-0 bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
                <p className="text-[10px] text-slate-400 mb-1">マニアック度</p>
                <div className="text-2xl font-black text-yellow-400 flex items-end leading-none">
                  <span>{targetPerson.trivia_level}</span>
                  <span className="text-xs text-slate-500 font-normal mb-1 ml-0.5">/100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッターアクション */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          {/* 正解時のシェアボタン */}
          {isWin && (
            <div className="mb-3 flex gap-3">
              <button
                onClick={onShare}
                className="flex-[2] py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200 transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Share2 size={16} /> シェア
              </button>
              {/* <button
                onClick={onPreviewImage}
                className="flex-1 py-3 rounded-xl border-2 border-emerald-500 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                title="シェア画像をプレビュー"
              >
                <Image size={16} /> 画像
              </button> */}
            </div>
          )}

          {/* 共通ボタン */}
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(targetPerson.name)}`, '_blank')}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2"
            >
              <Globe size={16} /> 調べる
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-[2] py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition flex items-center justify-center gap-2 transform active:scale-95"
            >
              <RotateCcw size={16} /> もう一度遊ぶ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
