import { randomUUID } from 'crypto';

export interface Session {
  sessionId: string;
  aiQuestionCount: number;
  aiQuestionLimit: number;
  createdAt: Date;
  expiresAt: Date;
}

// インメモリセッションストア
const sessions = new Map<string, Session>();

// セッションの有効期限（30分）
const SESSION_DURATION = 30 * 60 * 1000;

// AI質問の上限
export const AI_QUESTION_LIMIT = 5;

/**
 * 新しいセッションを作成
 */
export function createSession(): Session {
  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);

  const session: Session = {
    sessionId,
    aiQuestionCount: 0,
    aiQuestionLimit: AI_QUESTION_LIMIT,
    createdAt: now,
    expiresAt,
  };

  sessions.set(sessionId, session);
  return session;
}

/**
 * セッションを取得
 */
export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // 有効期限チェック
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * AI質問回数をインクリメント
 */
export function incrementAiQuestionCount(sessionId: string): boolean {
  const session = getSession(sessionId);

  if (!session) {
    return false;
  }

  if (session.aiQuestionCount >= session.aiQuestionLimit) {
    return false;
  }

  session.aiQuestionCount++;
  sessions.set(sessionId, session);
  return true;
}

/**
 * AI質問の残り回数を取得
 */
export function getAiQuestionRemaining(sessionId: string): number {
  const session = getSession(sessionId);

  if (!session) {
    return 0;
  }

  return session.aiQuestionLimit - session.aiQuestionCount;
}

/**
 * 期限切れセッションをクリーンアップ
 */
function cleanupExpiredSessions() {
  const now = new Date();
  sessions.forEach((session, id) => {
    if (now > session.expiresAt) {
      sessions.delete(id);
    }
  });
}

// 5分ごとにクリーンアップ
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
