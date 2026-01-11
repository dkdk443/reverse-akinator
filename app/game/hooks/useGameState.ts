import { useState, useEffect } from 'react';
import type { Person, Attribute, PersonAttribute } from '@/types';

type Difficulty = 'easy' | 'normal' | 'hard' | 'all';

type GameState = 'playing' | 'guessing' | 'result-win' | 'result-lose';

type ChatMessage = {
  type: 'ai' | 'user';
  text: string;
  highlight?: 'yes' | 'no' | 'neutral';
};

// 難易度別のフィルタリング関数
function filterPersonsByDifficulty(persons: Person[], difficulty: Difficulty): Person[] {
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

export function useGameState(difficulty: Difficulty, gameId: string) {
  // データ管理
  const [persons, setPersons] = useState<Person[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [personAttributes, setPersonAttributes] = useState<PersonAttribute[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [targetPerson, setTargetPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ゲーム状態
  const [gameState, setGameState] = useState<GameState>('playing');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { type: 'ai', text: '私は誰でしょう？質問して当ててみてください！' }
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
  const [hintRemaining, setHintRemaining] = useState(3);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);

  // 初期データ取得
  useEffect(() => {
    async function initGame() {
      try {
        // 静的JSONからデータ取得
        const dataRes = await fetch('/data/gameData.json');
        const data = await dataRes.json();
        setPersons(data.persons);
        setAttributes(data.attributes);
        setPersonAttributes(data.personAttributes);

        // セッション開始
        const sessionRes = await fetch('/api/session/start', { method: 'POST' });
        const session = await sessionRes.json();
        setSessionId(session.sessionId);
        setAiRemaining(session.aiQuestionLimit);

        // 難易度に基づいて人物をフィルタリング
        const filteredPersons = filterPersonsByDifficulty(data.persons, difficulty);

        if (filteredPersons.length === 0) {
          console.error('No persons found for this difficulty');
          setIsLoading(false);
          return;
        }

        // ランダムに人物選択
        const randomPerson = filteredPersons[Math.floor(Math.random() * filteredPersons.length)];
        setTargetPerson(randomPerson);

        // console.log('Target (Debug):', randomPerson.name, '| Difficulty:', difficulty, '| Trivia Level:', randomPerson.trivia_level);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to init game:', error);
      }
    }

    initGame();
  }, [difficulty, gameId]);

  return {
    // データ
    persons,
    attributes,
    personAttributes,
    sessionId,
    targetPerson,
    isLoading,

    // ゲーム状態
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

    // 年代質問
    customYear,
    setCustomYear,
    yearDirection,
    setYearDirection,

    // AI質問
    aiQuestion,
    setAiQuestion,
    aiRemaining,
    setAiRemaining,
    isAiThinking,
    setIsAiThinking,
    hintRemaining,
    setHintRemaining,

    // シェア
    shareImageBlob,
    setShareImageBlob,
  };
}
