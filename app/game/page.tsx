'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  History,
  Globe,
  Briefcase,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Cake,
  User,
} from 'lucide-react';
import type { Attribute } from '@/types';
import { ResultModal } from './components/ResultModal';
import { GuessModal } from './components/GuessModal';
import { QuestionPanel } from './components/QuestionPanel';
import { useGameState } from './hooks/useGameState';

type Difficulty = 'easy' | 'normal' | 'hard' | 'all';

const CATEGORIES = [
  { id: 'ai', name: 'AI質問', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'era', name: '年代', icon: History, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'region', name: '地域', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'gender', name: '性別', icon: User, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: 'age', name: '年齢', icon: Cake, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'occupation', name: '職業', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'trait', name: '特徴', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-100' },
];

// 難易度別のフィルタリング関数（GuessModal用）
function filterPersonsByDifficulty(persons: any[], difficulty: Difficulty) {
  if (difficulty === 'all') return persons;

  return persons.filter(person => {
    const triviaLevel = person.trivia_level ?? 0;
    switch (difficulty) {
      case 'easy':
        return triviaLevel >= 85;
      case 'normal':
        return triviaLevel >= 70 && triviaLevel < 85;
      case 'hard':
        return triviaLevel < 70;
      default:
        return true;
    }
  });
}

// 難易度ラベルマップ
const DIFFICULTY_LABELS = {
  easy: 'やさしい',
  normal: 'ふつう',
  hard: 'むずかしい',
  all: 'すべて',
};

export default function GamePage() {
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'normal';
  const gameId = searchParams.get('gameId') || '';

  // カスタムフックで状態管理
  const {
    persons,
    attributes,
    personAttributes,
    sessionId,
    targetPerson,
    isLoading,
    gameState,
    setGameState,
    chatHistory,
    setChatHistory,
    selectedCategory,
    setSelectedCategory,
    guessId,
    setGuessId,
    questionCount,
    setQuestionCount,
    customYear,
    setCustomYear,
    yearDirection,
    setYearDirection,
    aiQuestion,
    setAiQuestion,
    aiRemaining,
    setAiRemaining,
    isAiThinking,
    setIsAiThinking,
    hintRemaining,
    setHintRemaining,
    shareImageBlob,
    setShareImageBlob,
  } = useGameState(difficulty, gameId);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 結果画面で画像を事前取得
  useEffect(() => {
    if (gameState === 'result-win' && targetPerson) {
      const difficultyLabel = DIFFICULTY_LABELS[difficulty];
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const ogImageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(targetPerson.name)}&difficulty=${encodeURIComponent(difficultyLabel)}&questions=${questionCount}&result=win`;

      fetch(ogImageUrl)
        .then(response => response.blob())
        .then(blob => setShareImageBlob(blob))
        .catch(error => console.error('Failed to prefetch share image:', error));
    }
  }, [gameState, targetPerson, difficulty, questionCount, setShareImageBlob]);

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

  // ヒント機能
  const handleAskHint = async () => {
    if (!targetPerson || !sessionId || hintRemaining === 0 || isAiThinking) return;

    const hintNumber = 4 - hintRemaining; // 1, 2, or 3
    setHintRemaining(prev => prev - 1);
    setChatHistory(prev => [...prev, { type: 'user', text: 'ヒントをください', highlight: 'neutral' }]);
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          targetPersonId: targetPerson.id,
          targetPersonName: targetPerson.name,
          hintNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.hint) {
        setChatHistory(prev => [...prev, {
          type: 'ai',
          text: data.error || 'ヒントの取得に失敗しました',
          highlight: 'neutral'
        }]);
        setHintRemaining(prev => prev + 1); // エラー時は回数を戻す
        setIsAiThinking(false);
        return;
      }

      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: `💡 ${data.hint}`,
        highlight: 'neutral'
      }]);
    } catch (error) {
      console.error('Hint request failed:', error);
      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: '通信エラーが発生しました',
        highlight: 'neutral'
      }]);
      setHintRemaining(prev => prev + 1); // エラー時は回数を戻す
    } finally {
      setIsAiThinking(false);
    }
  };

  // AI質問
  const handleAskAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiThinking || !targetPerson || aiRemaining === 0) return;

    // セッションIDチェック
    if (!sessionId) {
      setChatHistory(prev => [...prev, {
        type: 'ai',
        text: 'セッションが初期化されていません。ページを再読み込みしてください。',
        highlight: 'neutral'
      }]);
      return;
    }

    const questionText = aiQuestion;
    setAiQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', text: questionText }]);
    setQuestionCount(prev => prev + 1);
    setIsAiThinking(true);

    console.log('AI Question Request:', { sessionId, targetPersonId: targetPerson.id, question: questionText });

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

      // エラーレスポンスの処理
      if (!response.ok || !data.answer) {
        setChatHistory(prev => [...prev, {
          type: 'ai',
          text: data.error || 'AI質問の処理に失敗しました',
          highlight: 'neutral'
        }]);
        setIsAiThinking(false);
        return;
      }

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

  // SNSシェア機能
  const handleShare = async () => {
    if (!targetPerson) return;

    const difficultyLabel = DIFFICULTY_LABELS[difficulty];
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // ハッシュタグ付きシェアテキスト
    const shareText = `私は「${targetPerson.name}」を当てました！🎯\n\n難易度: ${difficultyLabel}\n質問数: ${questionCount}回\n\n#ReverseAkinator #歴史上の人物クイズ #推理ゲーム`;
    const shareUrl = baseUrl;

    // Web Share API非対応の場合はフォールバック
    if (!navigator.share) {
      const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(xUrl, '_blank', 'width=600,height=400');
      return;
    }

    try {
      // 画像とテキストを同時にシェア
      if (shareImageBlob && navigator.canShare) {
        const file = new File([shareImageBlob], 'reverse-akinator-result.png', { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: shareText,
            files: [file],
          });
          return;
        }
      }

      // 画像シェアが不可能な場合、テキストのみでシェア
      await navigator.share({
        title: 'Reverse Akinator',
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      // ユーザーがキャンセルした場合は何もしない
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }

      // その他のエラーはフォールバック
      console.error('Share failed:', error);
      const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(xUrl, '_blank', 'width=600,height=400');
    }
  };

  // OG画像をプレビュー表示
  const handlePreviewOGImage = () => {
    if (!targetPerson) return;

    const difficultyLabel = DIFFICULTY_LABELS[difficulty];
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const ogImageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(targetPerson.name)}&difficulty=${encodeURIComponent(difficultyLabel)}&questions=${questionCount}&result=win`;

    window.open(ogImageUrl, '_blank');
  };

  const ChatBubble = ({ item }: { item: typeof chatHistory[0] }) => {
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
            <button
              onClick={handleAskHint}
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
          <ResultModal
            isWin={gameState === 'result-win'}
            targetPerson={targetPerson}
            difficulty={DIFFICULTY_LABELS[difficulty]}
            questionCount={questionCount}
            onShare={handleShare}
            onPreviewImage={handlePreviewOGImage}
          />
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
          <GuessModal
            persons={filterPersonsByDifficulty(persons, difficulty)}
            guessId={guessId}
            onGuessIdChange={setGuessId}
            onGuess={handleGuess}
            onClose={() => setGameState('playing')}
          />
        )}

        {/* 質問コントローラー */}
        {gameState === 'playing' && (
          <QuestionPanel
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            attributes={attributes}
            aiQuestion={aiQuestion}
            setAiQuestion={setAiQuestion}
            aiRemaining={aiRemaining}
            isAiThinking={isAiThinking}
            handleAskAIQuestion={handleAskAIQuestion}
            customYear={customYear}
            setCustomYear={setCustomYear}
            yearDirection={yearDirection}
            setYearDirection={setYearDirection}
            handleAskYearQuestion={handleAskYearQuestion}
            handleAskQuestion={handleAskQuestion}
            setGameState={setGameState}
          />
        )}
      </main>
    </div>
  );
}
