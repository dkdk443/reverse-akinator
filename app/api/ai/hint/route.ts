import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, targetPersonName, hintNumber } = body;

    // バリデーション
    if (!targetPersonName) {
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

    // ヒント番号に基づいて難易度を調整
    const currentHintNumber = hintNumber || 1;
    let difficultyInstruction = '';

    if (currentHintNumber === 1) {
      // 1回目：難しい（抽象的・間接的）
      difficultyInstruction = `
難易度：難しい
- 非常に抽象的で間接的なヒント
- 時代背景や雰囲気を示唆する程度
- 具体的な職業や業績は避ける
- 例：「この人物が生きた時代は、世界が大きく動いた時代でした」
- 例：「この人物の影響は、現代にも色濃く残っています」`;
    } else if (currentHintNumber === 2) {
      // 2回目：中程度（やや具体的）
      difficultyInstruction = `
難易度：中程度
- やや具体的だが、まだ推理が必要なヒント
- 職業分野や活動領域をほのめかす
- 具体的な作品名や出来事は避ける
- 例：「この人物は、日本の文化に大きな影響を与えた芸術家です」
- 例：「この人物の決断が、歴史の流れを変えました」`;
    } else {
      // 3回目：簡単（具体的・直接的）
      difficultyInstruction = `
難易度：簡単
- 具体的で直接的なヒント
- 代表的な業績や作品、出来事を示す
- 人物を特定しやすい情報を含める
- 例：「この人物は、明治維新で重要な役割を果たした政治家です」
- 例：「この人物の代表作は、日本文学の最高峰として知られています」`;
    }

    const prompt = `あなたは「アキネーター」のような推理ゲームのAIゲームマスターです。
正解の歴史上の人物は「${targetPersonName}」です。

これは${currentHintNumber}回目のヒントです。
プレイヤーがこの人物を特定できるように、以下の難易度に従ってヒントを1つ出してください。

${difficultyInstruction}

共通要件：
- 正解の人物名を絶対に明かさないこと
- 1〜2文で簡潔に
- 面白く、魅力的に

ヒントのみを返してください（前置きや説明は不要）。`;

    // 503エラー用のリトライロジック（最大3回、指数バックオフ）
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const hint = response.text().trim();

        return NextResponse.json({
          hint,
          success: true,
        });
      } catch (error: any) {
        lastError = error;

        // 503エラーの場合のみリトライ
        if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
          console.log(`Attempt ${attempt}/${maxRetries} failed with 503 error. Retrying...`);

          if (attempt < maxRetries) {
            // 指数バックオフ: 1秒、2秒、4秒
            const delayMs = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        } else {
          // 503以外のエラーはすぐにスロー
          throw error;
        }
      }
    }

    // 全てのリトライが失敗した場合
    throw lastError;
  } catch (error: any) {
    console.error('Hint generation error:', error);
    console.error('Error message:', error?.message);

    // 503エラー（サーバー過負荷）
    if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
      return NextResponse.json(
        { error: 'AIサービスが混雑しています。数秒後にもう一度お試しください。' },
        { status: 503 }
      );
    }

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
