const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'persons.db');

// dataディレクトリが存在しない場合は作成
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 既存のデータベースファイルがあれば削除
if (fs.existsSync(dbPath)) {
  console.log('既存のデータベースを削除します...');
  fs.unlinkSync(dbPath);
}

console.log('データベースを作成します...');
const db = new Database(dbPath);

// WALモードを有効化
db.pragma('journal_mode = WAL');

// テーブル作成
console.log('テーブルを作成します...');

// persons テーブル
db.exec(`
  CREATE TABLE persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255)
  )
`);

// attributes テーブル
db.exec(`
  CREATE TABLE attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    attribute_key VARCHAR(50) NOT NULL UNIQUE
  )
`);

// person_attributes テーブル
db.exec(`
  CREATE TABLE person_attributes (
    person_id INTEGER NOT NULL,
    attribute_id INTEGER NOT NULL,
    value BOOLEAN NOT NULL,
    PRIMARY KEY (person_id, attribute_id),
    FOREIGN KEY (person_id) REFERENCES persons(id),
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
  )
`);

// game_sessions テーブル
db.exec(`
  CREATE TABLE game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    question_count INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id)
  )
`);

// インデックス作成
console.log('インデックスを作成します...');
db.exec('CREATE INDEX idx_attributes_category ON attributes(category)');
db.exec('CREATE INDEX idx_person_attributes_person ON person_attributes(person_id)');
db.exec('CREATE INDEX idx_game_sessions_person ON game_sessions(person_id)');

db.close();

console.log('✅ データベースの初期化が完了しました!');
console.log(`データベースファイル: ${dbPath}`);
