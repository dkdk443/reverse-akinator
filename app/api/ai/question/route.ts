import { NextRequest, NextResponse } from 'next/server';
import { getSession, incrementAiQuestionCount, getAiQuestionRemaining } from '@/lib/session';
import { getPersonById } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, targetPersonId, question } = body;

    // バリデーション
    if (!sessionId || !targetPersonId || !question) {
      const missing = [];
      if (!sessionId) missing.push('sessionId');
      if (!targetPersonId) missing.push('targetPersonId');
      if (!question) missing.push('question');

      console.error('AI question validation failed:', { sessionId, targetPersonId, question, missing });

      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // セッション確認
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 400 }
      );
    }

    // 回数制限チェック
    const canAsk = incrementAiQuestionCount(sessionId);
    if (!canAsk) {
      return NextResponse.json(
        { error: 'AI質問の回数制限に達しました（最大5回）' },
        { status: 429 }
      );
    }

    // 対象人物を取得
    const targetPerson = getPersonById(targetPersonId);
    if (!targetPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    // Gemini API呼び出し
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      return NextResponse.json(
        { error: 'AI service not available' },
        { status: 503 }
      );
    }

    // Google Generative AI SDKを初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `あなたは「アキネーター」のような推理ゲームのAIゲームマスターです。
正解の歴史上の人物は「${targetPerson.name} (${targetPerson.name_en})」です。
ユーザーはこの人物を特定するために「はい」か「いいえ」で答えられる質問をしてきます。
ユーザーの質問に対して、以下のいずれかの言葉だけで答えてください。

回答の選択肢:
- "はい"
- "いいえ"
- "どちらとも言えない" (史実が曖昧な場合や、質問が的外れな場合)

絶対に正解の人物名を明かさないでください。

ユーザーの質問: ${question}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const answer = response.text().trim() || 'エラーが発生しました';

    const remaining = getAiQuestionRemaining(sessionId);

    return NextResponse.json({
      answer,
      remainingCount: remaining,
      message: `AI質問は残り${remaining}回です`,
    });
  } catch (error: any) {
    console.error('AI question error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);

    // レート制限エラー
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'AI質問の利用制限に達しました。しばらく待ってから再度お試しください。' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'AI質問の処理に失敗しました' },
      { status: 500 }
    );
  }
}
