import Database from 'better-sqlite3';
import path from 'path';
import type { Person, Attribute, PersonAttribute, GameSession } from '@/types';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'persons.db');
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// Person queries
export function getAllPersons(): Person[] {
  const db = getDb();
  return db.prepare('SELECT * FROM persons').all() as Person[];
}

export function getPersonById(id: number): Person | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM persons WHERE id = ?').get(id) as Person | undefined;
}

export function getRandomPerson(): Person | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM persons ORDER BY RANDOM() LIMIT 1').get() as Person | undefined;
}

// Attribute queries
export function getAllAttributes(): Attribute[] {
  const db = getDb();
  return db.prepare('SELECT * FROM attributes ORDER BY category, id').all() as Attribute[];
}

export function getAttributesByCategory(category: string): Attribute[] {
  const db = getDb();
  return db.prepare('SELECT * FROM attributes WHERE category = ? ORDER BY id').all(category) as Attribute[];
}

export function getAttributeById(id: number): Attribute | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM attributes WHERE id = ?').get(id) as Attribute | undefined;
}

// PersonAttribute queries
export function getPersonAttributes(personId: number): PersonAttribute[] {
  const db = getDb();
  return db.prepare('SELECT * FROM person_attributes WHERE person_id = ?').all(personId) as PersonAttribute[];
}

export function getPersonAttributeValue(personId: number, attributeId: number): boolean | null {
  const db = getDb();
  const result = db.prepare('SELECT value FROM person_attributes WHERE person_id = ? AND attribute_id = ?')
    .get(personId, attributeId) as { value: number } | undefined;

  if (result === undefined) return null;
  return result.value === 1;
}

// GameSession queries
export function createGameSession(personId: number): number {
  const db = getDb();
  const result = db.prepare('INSERT INTO game_sessions (person_id) VALUES (?)').run(personId);
  return result.lastInsertRowid as number;
}

export function updateGameSession(
  sessionId: number,
  questionCount: number,
  isCorrect: boolean
): void {
  const db = getDb();
  db.prepare('UPDATE game_sessions SET question_count = ?, is_correct = ? WHERE id = ?')
    .run(questionCount, isCorrect ? 1 : 0, sessionId);
}

export function getGameSession(sessionId: number): GameSession | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(sessionId) as GameSession | undefined;
}

// Close database connection
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
