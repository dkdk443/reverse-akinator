'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  History,
  Globe,
  User,
  Briefcase,
  Sparkles,
  BrainCircuit,
  Cake,
} from 'lucide-react';
import { ResultModal } from './components/ResultModal';
import { GuessModal } from './components/GuessModal';
import { QuestionPanel } from './components/QuestionPanel';
import { ChatHistory } from './components/ChatHistory';
import { GameHeader } from './components/GameHeader';
import { useGameState } from './hooks/useGameState';
import { useQuestions } from './hooks/useQuestions';

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

  // useQuestionsフックで質問処理
  const { handleAskQuestion, handleAskYearQuestion, handleAskHint, handleAskAIQuestion } = useQuestions({
    targetPerson,
    personAttributes,
    sessionId,
    setChatHistory,
    setQuestionCount,
    setIsAiThinking,
    setHintRemaining,
    setAiRemaining,
    hintRemaining,
    isAiThinking,
    aiRemaining,
    aiQuestion,
    setAiQuestion,
    customYear,
    setCustomYear,
    yearDirection,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 結果画面で画像を事前取得
  useEffect(() => {
    if (gameState === 'result-win' && targetPerson) {
      const difficultyLabel = DIFFICULTY_LABELS[difficulty];
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const params = new URLSearchParams({
        name: targetPerson.name,
        difficulty: difficultyLabel,
        questions: questionCount.toString(),
        result: 'win',
      });

      if (targetPerson.name_en) {
        params.append('name_en', targetPerson.name_en);
      }
      if (targetPerson.catchphrase) {
        params.append('catchphrase', targetPerson.catchphrase);
      }

      const ogImageUrl = `${baseUrl}/api/og?${params.toString()}`;

      fetch(ogImageUrl)
        .then(response => response.blob())
        .then(blob => setShareImageBlob(blob))
        .catch(error => console.error('Failed to prefetch share image:', error));
    }
  }, [gameState, targetPerson, difficulty, questionCount, setShareImageBlob]);

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
    const params = new URLSearchParams({
      name: targetPerson.name,
      difficulty: difficultyLabel,
      questions: questionCount.toString(),
      result: 'win',
    });

    if (targetPerson.name_en) {
      params.append('name_en', targetPerson.name_en);
    }
    if (targetPerson.catchphrase) {
      params.append('catchphrase', targetPerson.catchphrase);
    }

    const ogImageUrl = `${baseUrl}/api/og?${params.toString()}`;

    window.open(ogImageUrl, '_blank');
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
      <GameHeader
        gameState={gameState}
        questionCount={questionCount}
        aiRemaining={aiRemaining}
        hintRemaining={hintRemaining}
        isAiThinking={isAiThinking}
        onHint={handleAskHint}
        onGuess={() => setGameState('guessing')}
      />

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

        <ChatHistory
          chatHistory={chatHistory}
          isAiThinking={isAiThinking}
          chatEndRef={chatEndRef}
        />

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
