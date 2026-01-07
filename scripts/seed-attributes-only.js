const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'persons.db');
const csvDir = path.join(__dirname, '..', 'data', 'csv');

const db = new Database(dbPath);

console.log('CSVからattributesとperson_attributesのデータを投入します...');

// CSVパーサー（シンプル版）
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || null;
    });
    return obj;
  });
}

// トランザクション開始
const insertData = db.transaction(() => {
  // 1. 既存のattributesとperson_attributesを削除
  console.log('既存のattributesとperson_attributesデータを削除中...');
  db.prepare('DELETE FROM person_attributes').run();
  db.prepare('DELETE FROM attributes').run();

  // 2. 属性データ
  console.log('属性データを投入中...');
  const attributesCSV = fs.readFileSync(path.join(csvDir, 'attributes.csv'), 'utf-8');
  const attributes = parseCSV(attributesCSV);

  const insertAttribute = db.prepare('INSERT INTO attributes (id, category, question, attribute_key) VALUES (?, ?, ?, ?)');

  attributes.forEach(a => {
    insertAttribute.run(parseInt(a.id), a.category, a.question, a.attribute_key);
  });

  console.log(`  ${attributes.length}件の属性を投入しました`);

  // 3. 人物と属性の紐付け
  console.log('人物と属性の紐付けを投入中...');
  const personAttributesCSV = fs.readFileSync(path.join(csvDir, 'person_attributes.csv'), 'utf-8');
  const personAttributes = parseCSV(personAttributesCSV);

  const insertPersonAttr = db.prepare('INSERT INTO person_attributes (person_id, attribute_id, value) VALUES (?, ?, ?)');

  personAttributes.forEach(pa => {
    insertPersonAttr.run(parseInt(pa.person_id), parseInt(pa.attribute_id), 1);
  });

  console.log(`  ${personAttributes.length}件の紐付けを投入しました`);
});

// トランザクション実行
insertData();

db.close();

console.log('✅ CSVからのデータ投入が完了しました!');
