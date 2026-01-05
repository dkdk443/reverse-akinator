'use client';

import { useState, useEffect, useRef } from 'react';
import {
  History,
  Globe,
  User,
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  BrainCircuit,
  Lightbulb,
  Cake
} from 'lucide-react';

const CATEGORIES = [
  { id: 'era', name: '年代', icon: History, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'region', name: '地域', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'gender', name: '性別', icon: User, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: 'age', name: '年齢', icon: Cake, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'occupation', name: '職業', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'trait', name: '特徴', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' },
];

// 仮の質問データ（後でAPIから取得）
const TEMP_QUESTIONS: Record<string, Array<{ id: number; text: string }>> = {
  era: [
    { id: 1, text: '古代の人ですか？' },
    { id: 2, text: '中世の人ですか？' },
    { id: 3, text: '近世の人ですか？' },
    { id: 4, text: '近代の人ですか？' },
    { id: 5, text: '現代の人ですか？' },
  ],
  region: [
    { id: 11, text: '日本人ですか？' },
    { id: 12, text: 'ヨーロッパの人ですか？' },
    { id: 13, text: 'アメリカの人ですか？' },
    { id: 14, text: 'アジア（日本以外）の人ですか？' },
  ],
  gender: [
    { id: 21, text: '男性ですか？' },
    { id: 22, text: '女性ですか？' },
  ],
  age: [
    { id: 31, text: '若くして亡くなりましたか（50歳未満）？' },
    { id: 32, text: '長生きしましたか（80歳以上）？' },
  ],
  occupation: [
    { id: 41, text: '政治家ですか？' },
    { id: 42, text: '軍人・武将ですか？' },
    { id: 43, text: '芸術家ですか？' },
    { id: 44, text: '科学者ですか？' },
    { id: 45, text: '作家ですか？' },
    { id: 46, text: '音楽家ですか？' },
    { id: 47, text: '思想家・宗教家ですか？' },
  ],
  trait: [
    { id: 51, text: '戦いに関わりましたか？' },
    { id: 52, text: '革命を起こしましたか？' },
    { id: 53, text: '芸術作品を残しましたか？' },
    { id: 54, text: 'ノーベル賞を受賞しましたか？' },
  ],
};

// 仮の人物リスト（後でAPIから取得）
const TEMP_PERSONS = [
  { id: 1, name: '織田信長' },
  { id: 2, name: '豊臣秀吉' },
  { id: 3, name: '徳川家康' },
  { id: 4, name: '坂本龍馬' },
  { id: 6, name: '夏目漱石' },
];

export default function GamePage() {
  const [gameState, setGameState] = useState<'playing' | 'guessing' | 'result-win' | 'result-lose'>('playing');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'ai' | 'user'; text: string; highlight?: 'yes' | 'no' | 'neutral' }>>([
    { type: 'ai', text: '有名な歴史上の人物を思い浮かべました。質問をして、誰か当ててください。' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('era');
  const [guessId, setGuessId] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [customYear, setCustomYear] = useState('');
  const [yearDirection, setYearDirection] = useState<'before' | 'after'>('before');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskQuestion = (question: { id: number; text: string }) => {
    setChatHistory(prev => [...prev, { type: 'user', text: question.text }]);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
      // 仮の回答（後でAPIから取得）
      const answers = ['はい', 'いいえ', 'どちらとも言えない'];
      const answerText = answers[Math.floor(Math.random() * answers.length)];
      const highlight = answerText === 'はい' ? 'yes' : answerText === 'いいえ' ? 'no' : 'neutral';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: answerText,
        highlight: highlight as 'yes' | 'no' | 'neutral'
      }]);
    }, 600);
  };

  const handleAskYearQuestion = () => {
    if (!customYear || isNaN(parseInt(customYear))) return;

    const questionText = `${customYear}年より${yearDirection === 'before' ? '前' : '後'}の人ですか？`;
    setChatHistory(prev => [...prev, { type: 'user', text: questionText }]);
    setQuestionCount(prev => prev + 1);
    setCustomYear('');

    setTimeout(() => {
      // 仮の回答（後でAPIから取得）
      const answers = ['はい', 'いいえ', 'どちらとも言えない'];
      const answerText = answers[Math.floor(Math.random() * answers.length)];
      const highlight = answerText === 'はい' ? 'yes' : answerText === 'いいえ' ? 'no' : 'neutral';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: answerText,
        highlight: highlight as 'yes' | 'no' | 'neutral'
      }]);
    }, 600);
  };

  const handleGuess = () => {
    if (!guessId) return;

    const guessedPerson = TEMP_PERSONS.find(p => p.id === parseInt(guessId));
    if (!guessedPerson) return;

    // 仮の判定（後でAPIで正解判定）
    const isCorrect = Math.random() > 0.5;

    if (isCorrect) {
      setChatHistory(prev => [...prev,
        { type: 'user', text: `${guessedPerson.name} ですか？` },
        { type: 'ai', text: '正解です！素晴らしい推理力ですね。' }
      ]);
      setGameState('result-win');
    } else {
      setChatHistory(prev => [...prev,
        { type: 'user', text: `${guessedPerson.name} ですか？` },
        { type: 'ai', text: `残念、違います。正解は織田信長でした。` }
      ]);
      setGameState('result-lose');
    }
  };

  const ChatBubble = ({ item }: { item: typeof chatHistory[0] }) => {
    const isAi = item.type === 'ai';
    return (
      <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}>
        <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-2 ml-2 ${isAi ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
            {isAi ? <BrainCircuit size={20} /> : <User size={20} />}
          </div>
          <div className={`p-3 md:p-4 rounded-2xl shadow-sm leading-relaxed ${
            isAi
              ? item.highlight === 'yes' ? 'bg-green-50 border border-green-200 text-gray-800'
                : item.highlight === 'no' ? 'bg-red-50 border border-red-200 text-gray-800'
                  : 'bg-white border border-gray-100 text-gray-800'
              : 'bg-indigo-600 text-white'
          }`}>
            <p className="text-sm md:text-base whitespace-pre-wrap">{item.text}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* ヘッダー */}
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
            <span className="bg-slate-100 px-3 py-2 rounded-full text-xs md:text-sm">Q: {questionCount}</span>
            <button
              onClick={() => setGameState('guessing')}
              className="bg-indigo-600 text-white px-3 py-2 md:px-4 rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span className="hidden md:inline">回答する</span>
            </button>
          </div>
        )}
      </header>

      {/* メインエリア */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* 結果画面 */}
        {(gameState === 'result-win' || gameState === 'result-lose') && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm text-white text-center animate-in zoom-in duration-300">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${gameState === 'result-win' ? 'bg-green-500' : 'bg-red-500'}`}>
              {gameState === 'result-win' ? <Sparkles size={48} /> : <XCircle size={48} />}
            </div>
            <h2 className="text-4xl font-bold mb-2">
              {gameState === 'result-win' ? '正解！' : '残念...'}
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              {gameState === 'result-win'
                ? `${questionCount}回の質問で正解しました！`
                : '正解は織田信長でした。'
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white text-indigo-900 py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <RotateCcw size={20} />
              もう一度遊ぶ
            </button>
          </div>
        )}

        {/* チャットエリア */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-80 md:pb-72">
            {chatHistory.map((item, index) => (
              <ChatBubble key={index} item={item} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* 推理モードオーバーレイ */}
        {gameState === 'guessing' && (
          <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-200 flex items-center bg-white">
              <button onClick={() => setGameState('playing')} className="p-2 hover:bg-slate-100 rounded-full">
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
                  onChange={(e) => setGuessId(e.target.value)}
                >
                  <option value="">人物を選択...</option>
                  {TEMP_PERSONS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleGuess}
                  disabled={!guessId}
                  className="w-full bg-indigo-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={24} />
                  これで決定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 質問コントローラー */}
        {gameState === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
            <div className="max-w-4xl mx-auto">
              {/* カテゴリタブ */}
              <div className="flex overflow-x-auto py-2 px-2 border-b border-slate-100">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center flex-shrink-0 px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
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
                {/* 年代カテゴリの場合：年入力フォームを表示 */}
                {selectedCategory === 'era' && (
                  <div className="p-3 mb-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 mb-2 font-medium">年を指定して質問</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customYear}
                        onChange={(e) => setCustomYear(e.target.value)}
                        placeholder="1600"
                        className="w-24 p-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                      <span className="flex items-center text-sm text-gray-600">年より</span>
                      <select
                        value={yearDirection}
                        onChange={(e) => setYearDirection(e.target.value as 'before' | 'after')}
                        className="p-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                      >
                        <option value="before">前</option>
                        <option value="after">後</option>
                      </select>
                      <button
                        onClick={handleAskYearQuestion}
                        disabled={!customYear}
                        className="px-4 py-2 bg-amber-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        質問
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                  {TEMP_QUESTIONS[selectedCategory]?.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleAskQuestion(q)}
                      className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md hover:text-indigo-700 transition-all text-sm md:text-base group flex items-center justify-between active:scale-[0.99]"
                    >
                      <span>{q.text}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
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
        )}
      </main>
    </div>
  );
}
