const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'persons.db');
const csvDir = path.join(__dirname, '..', 'data', 'csv');

const db = new Database(dbPath);

console.log('CSVからデータを投入します...');

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
  // 1. 人物データ
  console.log('人物データを投入中...');
  const personsCSV = fs.readFileSync(path.join(csvDir, 'persons.csv'), 'utf-8');
  const persons = parseCSV(personsCSV);

  const insertPerson = db.prepare('INSERT INTO persons (id, name, name_en, description, image_url, birth_year, death_year) VALUES (?, ?, ?, ?, ?, ?, ?)');

  persons.forEach(p => {
    insertPerson.run(
      parseInt(p.id),
      p.name,
      p.name_en || null,
      p.description || null,
      p.image_url || null,
      p.birth_year ? parseInt(p.birth_year) : null,
      p.death_year ? parseInt(p.death_year) : null
    );
  });

  // 2. 属性データ
  console.log('属性データを投入中...');
  const attributesCSV = fs.readFileSync(path.join(csvDir, 'attributes.csv'), 'utf-8');
  const attributes = parseCSV(attributesCSV);

  const insertAttribute = db.prepare('INSERT INTO attributes (id, category, question, attribute_key) VALUES (?, ?, ?, ?)');

  attributes.forEach(a => {
    insertAttribute.run(parseInt(a.id), a.category, a.question, a.attribute_key);
  });

  // 3. 人物と属性の紐付け
  console.log('人物と属性の紐付けを投入中...');
  const personAttributesCSV = fs.readFileSync(path.join(csvDir, 'person_attributes.csv'), 'utf-8');
  const personAttributes = parseCSV(personAttributesCSV);

  const insertPersonAttr = db.prepare('INSERT INTO person_attributes (person_id, attribute_id, value) VALUES (?, ?, ?)');

  personAttributes.forEach(pa => {
    insertPersonAttr.run(parseInt(pa.person_id), parseInt(pa.attribute_id), 1);
  });
});

// トランザクション実行
insertData();

db.close();

console.log('✅ CSVからのデータ投入が完了しました!');
