import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  History,
  Globe,
  User,
  Briefcase,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Send,
  HelpCircle,
  BrainCircuit,
  MessageSquare,
  Lightbulb
} from 'lucide-react';

// --- Gemini API Key ---
const apiKey = ""; // APIキーは実行環境から提供されます

// --- データ定義 ---

// 人物データ
const PERSONS = [
  // 日本史
  { id: 1, name: '織田信長', name_en: 'Oda Nobunaga', attributes: { region: 'japan', era: 'sengoku', gender: 'male', occupation: 'warrior', trait: 'war' } },
  { id: 2, name: '豊臣秀吉', name_en: 'Toyotomi Hideyoshi', attributes: { region: 'japan', era: 'sengoku', gender: 'male', occupation: 'warrior', trait: 'war' } },
  { id: 3, name: '徳川家康', name_en: 'Tokugawa Ieyasu', attributes: { region: 'japan', era: 'edo', gender: 'male', occupation: 'politician', trait: 'war' } },
  { id: 4, name: '坂本龍馬', name_en: 'Sakamoto Ryoma', attributes: { region: 'japan', era: 'bakumatsu', gender: 'male', occupation: 'warrior', trait: 'revolution' } },
  { id: 6, name: '夏目漱石', name_en: 'Natsume Soseki', attributes: { region: 'japan', era: 'modern_jp', gender: 'male', occupation: 'writer', trait: 'art' } },
  { id: 9, name: '紫式部', name_en: 'Murasaki Shikibu', attributes: { region: 'japan', era: 'ancient', gender: 'female', occupation: 'writer', trait: 'art' } },
  { id: 15, name: '手塚治虫', name_en: 'Tezuka Osamu', attributes: { region: 'japan', era: 'modern', gender: 'male', occupation: 'artist', trait: 'art' } },

  // 世界史
  { id: 16, name: 'ナポレオン・ボナパルト', name_en: 'Napoleon', attributes: { region: 'europe', era: 'modern_world', gender: 'male', occupation: 'warrior', trait: 'war' } },
  { id: 17, name: 'クレオパトラ7世', name_en: 'Cleopatra', attributes: { region: 'other', era: 'ancient', gender: 'female', occupation: 'politician', trait: 'none' } },
  { id: 18, name: 'レオナルド・ダ・ヴィンチ', name_en: 'Da Vinci', attributes: { region: 'europe', era: 'medieval', gender: 'male', occupation: 'artist', trait: 'art' } },
  { id: 20, name: 'アルベルト・アインシュタイン', name_en: 'Einstein', attributes: { region: 'europe', era: 'modern', gender: 'male', occupation: 'scientist', trait: 'nobel' } },
  { id: 21, name: 'マリー・キュリー', name_en: 'Marie Curie', attributes: { region: 'europe', era: 'modern', gender: 'female', occupation: 'scientist', trait: 'nobel' } },
  { id: 22, name: 'マハトマ・ガンディー', name_en: 'Gandhi', attributes: { region: 'asia', era: 'modern', gender: 'male', occupation: 'politician', trait: 'revolution' } },
  { id: 26, name: 'パブロ・ピカソ', name_en: 'Picasso', attributes: { region: 'europe', era: 'modern', gender: 'male', occupation: 'artist', trait: 'art' } },
  { id: 28, name: 'エイブラハム・リンカーン', name_en: 'Lincoln', attributes: { region: 'america', era: 'modern_world', gender: 'male', occupation: 'politician', trait: 'revolution' } },
];

// カテゴリ定義 (自由入力を追加)
const CATEGORIES = [
  { id: 'custom', name: '自由質問', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', isAi: true },
  { id: 'era', name: '年代', icon: History, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'region', name: '地域', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'gender', name: '性別', icon: User, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: 'occupation', name: '職業', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'trait', name: '特徴', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' },
];

// 質問定義 (既存のハードコードロジックも維持)
const QUESTIONS = [
  // 年代
  { id: 1, categoryId: 'era', text: '日本の戦国時代の人ですか？', check: (p) => p.attributes.era === 'sengoku' },
  { id: 2, categoryId: 'era', text: '江戸時代の人ですか？', check: (p) => p.attributes.era === 'edo' },
  { id: 3, categoryId: 'era', text: '幕末・明治の人ですか？', check: (p) => ['bakumatsu', 'modern_jp', 'modern_world'].includes(p.attributes.era) },
  { id: 4, categoryId: 'era', text: '現代（20世紀以降）の人ですか？', check: (p) => p.attributes.era === 'modern' },
  { id: 5, categoryId: 'era', text: '古代・中世の人ですか？', check: (p) => ['ancient', 'medieval'].includes(p.attributes.era) },

  // 地域
  { id: 11, categoryId: 'region', text: '日本人ですか？', check: (p) => p.attributes.region === 'japan' },
  { id: 12, categoryId: 'region', text: 'ヨーロッパの人ですか？', check: (p) => p.attributes.region === 'europe' },
  { id: 13, categoryId: 'region', text: 'アメリカの人ですか？', check: (p) => p.attributes.region === 'america' },
  { id: 14, categoryId: 'region', text: 'アジア（日本以外）の人ですか？', check: (p) => p.attributes.region === 'asia' },

  // 性別
  { id: 21, categoryId: 'gender', text: '男性ですか？', check: (p) => p.attributes.gender === 'male' },
  { id: 22, categoryId: 'gender', text: '女性ですか？', check: (p) => p.attributes.gender === 'female' },

  // 職業
  { id: 31, categoryId: 'occupation', text: '武将・軍人ですか？', check: (p) => p.attributes.occupation === 'warrior' },
  { id: 32, categoryId: 'occupation', text: '政治家・リーダーですか？', check: (p) => p.attributes.occupation === 'politician' },
  { id: 33, categoryId: 'occupation', text: '芸術家・作家・音楽家ですか？', check: (p) => ['artist', 'writer', 'musician'].includes(p.attributes.occupation) },
  { id: 34, categoryId: 'occupation', text: '科学者・研究者ですか？', check: (p) => p.attributes.occupation === 'scientist' },

  // 特徴
  { id: 41, categoryId: 'trait', text: '戦いに関わりましたか？', check: (p) => ['war', 'revolution'].includes(p.attributes.trait) },
  { id: 42, categoryId: 'trait', text: 'ノーベル賞を受賞しましたか？', check: (p) => p.attributes.trait === 'nobel' },
  { id: 43, categoryId: 'trait', text: '芸術作品を残しましたか？', check: (p) => p.attributes.trait === 'art' },
];

export default function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, guessing, result
  const [targetPerson, setTargetPerson] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1].id); // 初期は年代
  const [guessId, setGuessId] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // チャット自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, gameState, isAiThinking]);

  // ゲーム開始処理
  const startGame = () => {
    const randomPerson = PERSONS[Math.floor(Math.random() * PERSONS.length)];
    setTargetPerson(randomPerson);
    setGameState('playing');
    setChatHistory([{
      type: 'ai',
      text: '有名な歴史上の人物を思い浮かべました。質問をして、誰か当ててください。'
    }]);
    setQuestionCount(0);
    setGuessId('');
    setCustomQuestion('');
    setSelectedCategory(CATEGORIES[1].id); // Default to 'era'
    console.log('Target (Debug):', randomPerson.name); // デバッグ用
  };

  // Gemini API呼び出し関数
  const callGemini = async (type, payload) => {
    setIsAiThinking(true);
    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (type === 'question') {
        // 質問回答モード
        systemPrompt = `あなたは「アキネーター」のような推理ゲームのAIゲームマスターです。
        正解の歴史上の人物は「${targetPerson.name} (${targetPerson.name_en})」です。
        ユーザーはこの人物を特定するために「はい」か「いいえ」で答えられる質問をしてきます。
        ユーザーの質問に対して、以下のいずれかの言葉だけで答えてください。
        
        回答の選択肢:
        - "はい"
        - "いいえ"
        - "どちらとも言えない" (史実が曖昧な場合や、質問が的外れな場合)
        
        絶対に正解の人物名を明かさないでください。`;
        userPrompt = payload;
      } else if (type === 'hint') {
        // ヒント生成モード
        systemPrompt = `あなたは「アキネーター」のような推理ゲームのAIゲームマスターです。
        正解の歴史上の人物は「${targetPerson.name} (${targetPerson.name_en})」です。
        ユーザーにこの人物に関する「ヒント」を日本語で1つ教えてください。
        
        ルール:
        - 人物の名前は絶対に出さないでください。
        - 決定的な答えではなく、少しひねった面白いヒントにしてください。
        - 50文字以内で簡潔に答えてください。`;
        userPrompt = "ヒントをください";
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "エラーが発生しました";
      return reply.trim();

    } catch (e) {
      console.error(e);
      return "通信エラーが発生しました";
    } finally {
      setIsAiThinking(false);
    }
  };

  // プリセット質問処理
  const handleAskPreset = (question) => {
    const newHistory = [...chatHistory, { type: 'user', text: question.text }];
    setChatHistory(newHistory);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
      const isYes = question.check(targetPerson);
      const answerText = isYes ? 'はい' : 'いいえ';

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: answerText,
        highlight: isYes ? 'yes' : 'no'
      }]);
    }, 600);
  };

  // 自由質問処理 (Gemini)
  const handleAskCustom = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim() || isAiThinking) return;

    const questionText = customQuestion;
    setCustomQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', text: questionText }]);
    setQuestionCount(prev => prev + 1);

    const answer = await callGemini('question', questionText);

    // 回答に応じたハイライト判定
    let highlight = 'neutral';
    if (answer.includes('はい')) highlight = 'yes';
    else if (answer.includes('いいえ')) highlight = 'no';

    setChatHistory(prev => [...prev, {
      type: 'ai',
      text: answer,
      highlight: highlight
    }]);
  };

  // ヒント処理 (Gemini)
  const handleHint = async () => {
    if (isAiThinking) return;
    setChatHistory(prev => [...prev, { type: 'user', text: 'ヒントをください！' }]);

    const hint = await callGemini('hint');

    setChatHistory(prev => [...prev, {
      type: 'ai',
      text: `ヒント: ${hint}`,
      highlight: 'neutral'
    }]);
  };

  // 推理画面へ遷移
  const goToGuess = () => {
    setGameState('guessing');
  };

  // 推理判定
  const handleGuess = () => {
    if (!guessId) return;

    const guessedPerson = PERSONS.find(p => p.id === parseInt(guessId));
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

  // コンポーネント: チャットバブル
  const ChatBubble = ({ item }) => {
    const isAi = item.type === 'ai';
    return (
      <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}>
        <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-2 ml-2 ${isAi ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
            {isAi ? <BrainCircuit size={20} /> : <User size={20} />}
          </div>
          <div className={`p-3 md:p-4 rounded-2xl shadow-sm leading-relaxed ${isAi
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
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Reverse Akinator <span className="text-indigo-600 text-xs align-top ml-1">AI Powered</span></h1>
            <p className="text-xs text-slate-500">History Mystery Game</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-2 md:gap-4 text-sm font-medium text-slate-600">
            <button
              onClick={handleHint}
              disabled={isAiThinking}
              className="bg-amber-100 text-amber-700 px-3 py-2 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1 shadow-sm border border-amber-200"
            >
              <Lightbulb size={16} />
              <span className="hidden md:inline">ヒント</span>
            </button>
            <span className="bg-slate-100 px-3 py-2 rounded-full text-xs md:text-sm">Q: {questionCount}</span>
            <button
              onClick={goToGuess}
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

        {/* スタート画面 */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-50 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600 animate-bounce-slow">
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
              <button
                onClick={startGame}
                className="w-full bg-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Play size={24} fill="currentColor" />
                ゲームスタート
              </button>
              <div className="flex justify-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Sparkles size={12} /> Gemini搭載</span>
                <span>•</span>
                <span>完全無料</span>
              </div>
            </div>
          </div>
        )}

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
                : `正解は ${targetPerson.name} でした。`
              }
            </p>

            <div className="bg-white/10 p-6 rounded-xl mb-8 w-full max-w-sm backdrop-blur-md border border-white/20">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Target Person</p>
              <h3 className="text-2xl font-bold">{targetPerson.name}</h3>
              <p className="text-slate-300 text-sm mt-1">{targetPerson.name_en}</p>
            </div>

            <button
              onClick={startGame}
              className="bg-white text-indigo-900 py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <RotateCcw size={20} />
              もう一度遊ぶ
            </button>
          </div>
        )}

        {/* チャットエリア */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-32">
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
                  <span className="text-xs text-gray-500">Geminiが思考中...</span>
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
                  className="w-full p-4 bg-white border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm appearance-none"
                  value={guessId}
                  onChange={(e) => setGuessId(e.target.value)}
                >
                  <option value="">人物を選択...</option>
                  {PERSONS.sort((a, b) => a.id - b.id).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
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

        {/* 質問コントローラー (通常時) */}
        {gameState === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
            <div className="max-w-4xl mx-auto">

              {/* カテゴリタブ */}
              <div className="flex overflow-x-auto py-2 px-2 border-b border-slate-100 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center flex-shrink-0 px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                      ? `${cat.bg} ${cat.color} ring-2 ring-offset-1 ring-${cat.color.split('-')[1]}-200 shadow-sm`
                      : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <cat.icon size={16} className="mr-2" />
                    {cat.name}
                    {cat.isAi && <Sparkles size={12} className="ml-1 animate-pulse" />}
                  </button>
                ))}
              </div>

              {/* 質問エリア */}
              <div className="p-2 h-48 md:h-52 bg-slate-50/50 flex flex-col">
                {selectedCategory === 'custom' ? (
                  /* 自由入力エリア (Gemini) */
                  <div className="flex-1 p-4 flex flex-col justify-center items-center">
                    <div className="w-full max-w-lg">
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <Sparkles size={14} className="text-indigo-500" />
                        AIがどんな質問にも答えます（例：「ちょんまげですか？」）
                      </p>
                      <form onSubmit={handleAskCustom} className="flex gap-2">
                        <input
                          type="text"
                          value={customQuestion}
                          onChange={(e) => setCustomQuestion(e.target.value)}
                          placeholder="質問を入力..."
                          className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                          disabled={isAiThinking}
                        />
                        <button
                          type="submit"
                          disabled={!customQuestion.trim() || isAiThinking}
                          className="bg-indigo-600 disabled:bg-slate-300 text-white p-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* プリセット質問リスト */
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                      {QUESTIONS.filter(q => q.categoryId === selectedCategory).map(q => (
                        <button
                          key={q.id}
                          onClick={() => handleAskPreset(q)}
                          className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md hover:text-indigo-700 transition-all text-sm md:text-base group flex items-center justify-between active:scale-[0.99]"
                        >
                          <span>{q.text}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* モバイル用回答ボタン（下部固定） */}
              <div className="md:hidden p-3 border-t border-slate-100 bg-white flex justify-center gap-3">
                <button
                  onClick={handleHint}
                  disabled={isAiThinking}
                  className="bg-amber-100 text-amber-700 px-4 py-3 rounded-lg font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 border border-amber-200"
                >
                  <Lightbulb size={20} />
                </button>
                <button
                  onClick={goToGuess}
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