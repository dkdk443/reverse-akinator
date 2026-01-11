import { createClient } from "@libsql/client";
import type { Person, Attribute, PersonAttribute, GameSession } from '@/types';

function getDatabaseConfig() {
  // Turso cloud database
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  // Local SQLite file (for Docker or local development)
  const dbPath = process.env.DATABASE_PATH || './data/persons.db';
  return {
    url: `file:${dbPath}`,
  };
}

const db = createClient(getDatabaseConfig());

// Person queries
export async function getAllPersons(): Promise<Person[]> {
  const result = await db.execute('SELECT * FROM persons');
  return result.rows as unknown as Person[];
}

export async function getPersonById(id: number): Promise<Person | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM persons WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as Person | undefined;
}

export async function getRandomPerson(): Promise<Person | undefined> {
  const result = await db.execute('SELECT * FROM persons ORDER BY RANDOM() LIMIT 1');
  return result.rows[0] as unknown as Person | undefined;
}

// Attribute queries
export async function getAllAttributes(): Promise<Attribute[]> {
  const result = await db.execute('SELECT * FROM attributes ORDER BY category, id');
  return result.rows as unknown as Attribute[];
}

export async function getAttributesByCategory(category: string): Promise<Attribute[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM attributes WHERE category = ? ORDER BY id',
    args: [category],
  });
  return result.rows as unknown as Attribute[];
}

export async function getAttributeById(id: number): Promise<Attribute | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM attributes WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as Attribute | undefined;
}

// PersonAttribute queries
export async function getPersonAttributes(personId: number): Promise<PersonAttribute[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM person_attributes WHERE person_id = ?',
    args: [personId],
  });
  return result.rows as unknown as PersonAttribute[];
}

export async function getPersonAttributeValue(personId: number, attributeId: number): Promise<boolean | null> {
  const result = await db.execute({
    sql: 'SELECT value FROM person_attributes WHERE person_id = ? AND attribute_id = ?',
    args: [personId, attributeId],
  });

  if (result.rows.length === 0) return null;
  return (result.rows[0] as unknown as { value: number }).value === 1;
}

// GameSession queries
export async function createGameSession(personId: number): Promise<number> {
  const result = await db.execute({
    sql: 'INSERT INTO game_sessions (person_id) VALUES (?)',
    args: [personId],
  });
  return Number(result.lastInsertRowid);
}

export async function updateGameSession(
  sessionId: number,
  questionCount: number,
  isCorrect: boolean
): Promise<void> {
  await db.execute({
    sql: 'UPDATE game_sessions SET question_count = ?, is_correct = ? WHERE id = ?',
    args: [questionCount, isCorrect ? 1 : 0, sessionId],
  });
}

export async function getGameSession(sessionId: number): Promise<GameSession | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM game_sessions WHERE id = ?',
    args: [sessionId],
  });
  return result.rows[0] as unknown as GameSession | undefined;
}
