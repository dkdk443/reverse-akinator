import { NextResponse } from 'next/server';
import { createSession, AI_QUESTION_LIMIT } from '@/lib/session';

export async function POST() {
  try {
    const session = createSession();

    return NextResponse.json({
      sessionId: session.sessionId,
      aiQuestionLimit: AI_QUESTION_LIMIT,
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
