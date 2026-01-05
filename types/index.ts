// Database types
export interface Person {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  image_url: string | null;
}

export interface Attribute {
  id: number;
  category: AttributeCategory;
  question: string;
  attribute_key: string;
}

export interface PersonAttribute {
  person_id: number;
  attribute_id: number;
  value: boolean;
}

export interface GameSession {
  id: number;
  person_id: number;
  question_count: number | null;
  is_correct: boolean | null;
  created_at: string;
}

// Enums
export type AttributeCategory =
  | 'era'        // 年代
  | 'region'     // 地域
  | 'gender'     // 性別
  | 'age'        // 年齢
  | 'occupation' // 職業
  | 'trait';     // 特徴

export type AnswerType = 'はい' | 'いいえ' | 'どちらとも言えない';

// API Request/Response types
export interface StartGameResponse {
  sessionId: string;
  message: string;
}

export interface AnswerRequest {
  sessionId: string;
  attributeId: number;
}

export interface AnswerResponse {
  answer: AnswerType;
  questionCount: number;
}

export interface GuessRequest {
  sessionId: string;
  guessedPersonId: number;
}

export interface GuessResponse {
  isCorrect: boolean;
  correctPerson: Person;
  questionCount: number;
}

// Game state types
export interface GameState {
  sessionId: string;
  personId: number;
  questionHistory: QuestionHistory[];
  questionCount: number;
}

export interface QuestionHistory {
  attributeId: number;
  question: string;
  answer: AnswerType;
}

// Category display info
export interface CategoryInfo {
  key: AttributeCategory;
  emoji: string;
  label: string;
}
