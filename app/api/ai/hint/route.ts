import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, targetPersonId, targetPersonName } = body;

    // バリデーション
    if (!targetPersonId || !targetPersonName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // セッションIDがあれば確認（オプション）
    if (sessionId) {
      const session = getSession(sessionId);
      if (!session) {
        console.warn('Session not found, but continuing with hint generation');
      }
    }

    // Gemini API設定
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

    const prompt = `あなたは「アキネーター」のような推理ゲームのAIゲームマスターです。
正解の歴史上の人物は「${targetPersonName}」です。

プレイヤーがこの人物を特定しやすくなるように、面白くて有益なヒントを1つ出してください。

ヒントの要件：
- 正解の人物名を明かさないこと
- 直接的すぎず、でも推理の助けになるヒント
- 歴史的事実や特徴を活用
- 1〜2文で簡潔に
- 面白く、魅力的に

例：「この人物が活躍した時代は、日本が大きく変わろうとしていた激動の時代でした」
例：「この人物の作品は、今でも多くの人に愛され続けています」

ヒントのみを返してください（前置きや説明は不要）。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text().trim();

    return NextResponse.json({
      hint,
      success: true,
    });
  } catch (error: any) {
    console.error('Hint generation error:', error);
    console.error('Error message:', error?.message);

    // レート制限エラー
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'AI機能の利用制限に達しました。しばらく待ってから再度お試しください。' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'ヒントの生成に失敗しました' },
      { status: 500 }
    );
  }
}
