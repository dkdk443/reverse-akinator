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
  Cake,
  Send
} from 'lucide-react';
import type { Person, Attribute, PersonAttribute } from '@/types';

const CATEGORIES = [
  { id: 'ai', name: 'AI質問', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'era', name: '年代', icon: History, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'region', name: '地域', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'gender', name: '性別', icon: User, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: 'age', name: '年齢', icon: Cake, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'occupation', name: '職業', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'trait', name: '特徴', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default function GamePage() {
  // データ管理
  const [persons, setPersons] = useState<Person[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [personAttributes, setPersonAttributes] = useState<PersonAttribute[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [targetPerson, setTargetPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ゲーム状態
  const [gameState, setGameState] = useState<'playing' | 'guessing' | 'result-win' | 'result-lose'>('playing');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'ai' | 'user'; text: string; highlight?: 'yes' | 'no' | 'neutral' }>>([
    { type: 'ai', text: '有名な歴史上の人物を思い浮かべました。質問をして、誰か当ててください。' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('ai');
  const [guessId, setGuessId] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  // 年代質問
  const [customYear, setCustomYear] = useState('');
  const [yearDirection, setYearDirection] = useState<'before' | 'after'>('before');

  // AI質問
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiRemaining, setAiRemaining] = useState(5);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 初期データ取得
  useEffect(() => {
    async function initGame() {
      try {
        // データ取得
        const dataRes = await fetch('/api/data/init');
        const data = await dataRes.json();
        setPersons(data.persons);
        setAttributes(data.attributes);
        setPersonAttributes(data.personAttributes);

        // セッション開始
        const sessionRes = await fetch('/api/session/start', { method: 'POST' });
        const session = await sessionRes.json();
        setSessionId(session.sessionId);
        setAiRemaining(session.aiQuestionLimit);

        // ランダムに人物選択
        const randomPerson = data.persons[Math.floor(Math.random() * data.persons.length)];
        setTargetPerson(randomPerson);

        console.log('Target (Debug):', randomPerson.name);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to init game:', error);
      }
    }

    initGame();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // カテゴリ別の質問を取得
  const getQuestionsByCategory = (category: string) => {
    return attributes.filter(attr => attr.category === category);
  };

  // 通常質問の回答ロジック
  const handleAskQuestion = (attribute: Attribute) => {
    if (!targetPerson) return;

    setChatHistory(prev => [...prev, { type: 'user', text: attribute.question }]);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
      // クライアント側で回答判定
      const personAttr = personAttributes.find(
        pa => pa.person_id === targetPerson.id && pa.attribute_id === attribute.id
      );

      const answer = personAttr?.value ? 'はい' : 'いいえ';
      const highlight = personAttr?.value ? 'yes' : 'no';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: answer,
        highlight: highlight as 'yes' | 'no'
      }]);
    }, 600);
  };

  // 年代質問
  const handleAskYearQuestion = () => {
    if (!customYear || isNaN(parseInt(customYear)) || !targetPerson) return;

    const year = parseInt(customYear);
    const questionText = `${customYear}年より${yearDirection === 'before' ? '前' : '後'}の人ですか？`;
    setChatHistory(prev => [...prev, { type: 'user', text: questionText }]);
    setQuestionCount(prev => prev + 1);
    setCustomYear('');

    setTimeout(() => {
      // 生まれ年と死亡年を使って判定
      const birthYear = targetPerson.birth_year;
      const deathYear = targetPerson.death_year;

      let isYes = false;

      if (birthYear !== null && deathYear !== null) {
        if (yearDirection === 'before') {
          // 「より前」= 死亡年がその年より前
          isYes = deathYear < year;
        } else {
          // 「より後」= 生まれ年がその年より後
          isYes = birthYear > year;
        }
      }

      const answerText = isYes ? 'はい' : 'いいえ';
      const highlight = isYes ? 'yes' : 'no';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: answerText,
        highlight: highlight as 'yes' | 'no'
      }]);
    }, 600);
  };

  // AI質問
  const handleAskAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiThinking || !targetPerson || aiRemaining === 0) return;

    const questionText = aiQuestion;
    setAiQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', text: questionText }]);
    setQuestionCount(prev => prev + 1);
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          targetPersonId: targetPerson.id,
          question: questionText,
        }),
      });

      if (response.status === 429) {
        setChatHistory(prev => [...prev, {
          type: 'ai',
          text: 'AI質問の回数制限に達しました（最大5回）',
          highlight: 'neutral'
        }]);
        setIsAiThinking(false);
        return;
      }

      const data = await response.json();
      setAiRemaining(data.remainingCount);

      const highlight = data.answer.includes('はい') ? 'yes'
        : data.answer.includes('いいえ') ? 'no'
        : 'neutral';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: data.answer,
        highlight: highlight as 'yes' | 'no' | 'neutral'
      }]);
    } catch (error) {
      console.error('AI question failed:', error);
      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: '通信エラーが発生しました',
        highlight: 'neutral'
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 推測判定
  const handleGuess = () => {
    if (!guessId || !targetPerson) return;

    const guessedPerson = persons.find(p => p.id === parseInt(guessId));
    if (!guessedPerson) return;

    const isCorrect = guessedPerson.id === targetPerson.id;

    if (isCorrect) {
      setChatHistory(prev => [...prev,
        { type: 'user', text: `${guessedPerson.name} ですか？` },
        { type: 'ai', text: '正解です！素晴らしい推理力ですね。' }
      ]);
      setGameState('result-win');
    } else {
      setChatHistory(prev => [...prev,
        { type: 'user', text: `${guessedPerson.name} ですか？` },
        { type: 'ai', text: `残念、違います。正解は ${targetPerson.name} でした。` }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <BrainCircuit size={48} className="animate-pulse text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">ゲームを準備中...</p>
        </div>
      </div>
    );
  }

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
            <span className="bg-amber-100 text-amber-700 px-3 py-2 rounded-full text-xs">AI残: {aiRemaining}</span>
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
        {(gameState === 'result-win' || gameState === 'result-lose') && targetPerson && (
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
                : `正解は ${targetPerson.name} でした。`
              }
            </p>
            <div className="bg-white/10 p-6 rounded-xl mb-8 w-full max-w-sm backdrop-blur-md border border-white/20">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Target Person</p>
              <h3 className="text-2xl font-bold">{targetPerson.name}</h3>
              <p className="text-slate-300 text-sm mt-1">{targetPerson.name_en}</p>
            </div>
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
            {isAiThinking && (
              <div className="flex w-full mb-4 justify-start">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="text-xs text-gray-500">AIが思考中...</span>
                </div>
              </div>
            )}
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
                  {persons.map(p => (
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
        )}
      </main>
    </div>
  );
}
