const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'persons.db');
const csvPath = path.join(dataDir, 'csv', 'persons_100_complete.csv');

if (!fs.existsSync(dbPath)) {
  console.error('❌ データベースが見つかりません。先に npm run db:init を実行してください。');
  process.exit(1);
}

console.log('100人の歴史上の人物データを読み込みます...');
const db = new Database(dbPath);

// CSVファイルを読み込む
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log(`ヘッダー: ${headers.join(', ')}`);
console.log(`データ行数: ${lines.length - 1}`);

// 既存のpersonsデータを削除
db.exec('DELETE FROM person_attributes');
db.exec('DELETE FROM persons');
db.exec('DELETE FROM game_sessions');

const insertPerson = db.prepare(`
  INSERT INTO persons (
    id, name, name_en, birth_year, death_year, era, region, gender, occupation,
    major_achievement, historical_significance, famous_quote, personality_trait,
    fun_fact, modern_comparison, if_alive_today, recommended_for, trivia_level, catchphrase
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let successCount = 0;
let errorCount = 0;

// ヘッダー行をスキップして、データ行を処理
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  try {
    // CSVパース (簡易版 - カンマ区切り)
    const values = line.split(',');

    if (values.length < 19) {
      console.warn(`⚠️  行 ${i}: データが不完全です (${values.length}列)`);
      errorCount++;
      continue;
    }

    const person = {
      id: parseInt(values[0]) || null,
      name: values[1] || '',
      name_en: values[2] || null,
      birth_year: parseInt(values[3]) || null,
      death_year: parseInt(values[4]) || null,
      era: values[5] || null,
      region: values[6] || null,
      gender: values[7] || null,
      occupation: values[8] || null,
      major_achievement: values[9] || null,
      historical_significance: values[10] || null,
      famous_quote: values[11] || null,
      personality_trait: values[12] || null,
      fun_fact: values[13] || null,
      modern_comparison: values[14] || null,
      if_alive_today: values[15] || null,
      recommended_for: values[16] || null,
      trivia_level: parseInt(values[17]) || null,
      catchphrase: values[18] || null,
    };

    insertPerson.run(
      person.id,
      person.name,
      person.name_en,
      person.birth_year,
      person.death_year,
      person.era,
      person.region,
      person.gender,
      person.occupation,
      person.major_achievement,
      person.historical_significance,
      person.famous_quote,
      person.personality_trait,
      person.fun_fact,
      person.modern_comparison,
      person.if_alive_today,
      person.recommended_for,
      person.trivia_level,
      person.catchphrase
    );

    successCount++;
    if (successCount % 10 === 0) {
      console.log(`  ${successCount}人のデータを登録しました...`);
    }
  } catch (error) {
    console.error(`❌ 行 ${i} でエラー:`, error.message);
    errorCount++;
  }
}

db.close();

console.log('\n✅ データのインポートが完了しました!');
console.log(`成功: ${successCount}人`);
if (errorCount > 0) {
  console.log(`⚠️  エラー: ${errorCount}件`);
}
