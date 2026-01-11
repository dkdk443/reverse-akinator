import type { Person, Attribute, PersonAttribute } from '@/types';

type ChatMessage = {
  type: 'ai' | 'user';
  text: string;
  highlight?: 'yes' | 'no' | 'neutral';
};

interface UseQuestionsParams {
  targetPerson: Person | null;
  personAttributes: PersonAttribute[];
  sessionId: string;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
  setIsAiThinking: React.Dispatch<React.SetStateAction<boolean>>;
  setHintRemaining: React.Dispatch<React.SetStateAction<number>>;
  setAiRemaining: React.Dispatch<React.SetStateAction<number>>;
  hintRemaining: number;
  isAiThinking: boolean;
  aiRemaining: number;
  aiQuestion: string;
  setAiQuestion: React.Dispatch<React.SetStateAction<string>>;
  customYear: string;
  setCustomYear: React.Dispatch<React.SetStateAction<string>>;
  yearDirection: 'before' | 'after';
}

export function useQuestions(params: UseQuestionsParams) {
  const {
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
  } = params;

  // 通常質問の回答ロジック
  const handleAskQuestion = (attribute: Attribute) => {
    if (!targetPerson) return;

    setChatHistory(prev => [...prev, { type: 'user', text: attribute.question }]);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
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
      const birthYear = targetPerson.birth_year;
      const deathYear = targetPerson.death_year;

      let isYes = false;

      if (birthYear !== null && deathYear !== null) {
        if (yearDirection === 'before') {
          isYes = deathYear < year;
        } else {
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

  // ヒント機能（静的データから取得）
  const handleAskHint = () => {
    if (!targetPerson || hintRemaining === 0) return;

    const hintNumber = 4 - hintRemaining;
    setHintRemaining(prev => prev - 1);
    setChatHistory(prev => [...prev, { type: 'user', text: 'ヒントをください', highlight: 'neutral' }]);

    // targetPersonからヒントを取得
    const hints = [targetPerson.hint1, targetPerson.hint2, targetPerson.hint3];
    const hint = hints[hintNumber - 1];

    setTimeout(() => {
      if (hint) {
        setChatHistory(prev => [...prev, {
          type: 'ai',
          text: `💡 ${hint}`,
          highlight: 'neutral'
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          type: 'ai',
          text: 'ヒントが見つかりませんでした',
          highlight: 'neutral'
        }]);
        setHintRemaining(prev => prev + 1);
      }
    }, 600);
  };

  // AI質問
  const handleAskAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiThinking || !targetPerson || aiRemaining === 0) return;

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

    try {
      const response = await fetch('/api/ai/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          targetPersonName: targetPerson.name,
          targetPersonNameEn: targetPerson.name_en,
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

  return {
    handleAskQuestion,
    handleAskYearQuestion,
    handleAskHint,
    handleAskAIQuestion,
  };
}
