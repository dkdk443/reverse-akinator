const fs = require('fs');
const path = require('path');

const csvDir = path.join(__dirname, '..', 'data', 'csv');
const outputDir = path.join(__dirname, '..', 'public', 'data');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// 出力ディレクトリ作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// persons.csv -> persons.json
const personsCSV = fs.readFileSync(path.join(csvDir, 'persons.csv'), 'utf-8');
const persons = parseCSV(personsCSV).map(p => ({
  id: parseInt(p.id),
  name: p.name,
  name_en: p.name_en || null,
  birth_year: p.birth_year ? parseInt(p.birth_year) : null,
  death_year: p.death_year === '9999' ? null : (p.death_year ? parseInt(p.death_year) : null),
  era: p.era || null,
  region: p.region || null,
  gender: p.gender || null,
  occupation: p.occupation || null,
  major_achievement: p.major_achievement || null,
  historical_significance: p.historical_significance || null,
  famous_quote: p.famous_quote || null,
  personality_trait: p.personality_trait || null,
  fun_fact: p.fun_fact || null,
  modern_comparison: p.modern_comparison || null,
  if_alive_today: p.if_alive_today || null,
  recommended_for: p.recommended_for || null,
  trivia_level: p.trivia_level ? parseInt(p.trivia_level) : null,
  catchphrase: p.catchphrase || null,
  hint1: p.hint1 || null,
  hint2: p.hint2 || null,
  hint3: p.hint3 || null,
}));

fs.writeFileSync(
  path.join(outputDir, 'persons.json'),
  JSON.stringify(persons, null, 2)
);
console.log(`✅ persons.json: ${persons.length}件`);

// attributes.csv -> attributes.json
const attributesCSV = fs.readFileSync(path.join(csvDir, 'attributes.csv'), 'utf-8');
const attributes = parseCSV(attributesCSV).map(a => ({
  id: parseInt(a.id),
  category: a.category,
  question: a.question,
  attribute_key: a.attribute_key,
}));

fs.writeFileSync(
  path.join(outputDir, 'attributes.json'),
  JSON.stringify(attributes, null, 2)
);
console.log(`✅ attributes.json: ${attributes.length}件`);

// person_attributes.csv -> personAttributes.json
const personAttributesCSV = fs.readFileSync(path.join(csvDir, 'person_attributes.csv'), 'utf-8');
const personAttributes = parseCSV(personAttributesCSV).map(pa => ({
  person_id: parseInt(pa.person_id),
  attribute_id: parseInt(pa.attribute_id),
  value: true,
}));

fs.writeFileSync(
  path.join(outputDir, 'personAttributes.json'),
  JSON.stringify(personAttributes, null, 2)
);
console.log(`✅ personAttributes.json: ${personAttributes.length}件`);

// 全データを1つにまとめたファイルも生成（1リクエストで取得可能に）
const gameData = { persons, attributes, personAttributes };
fs.writeFileSync(
  path.join(outputDir, 'gameData.json'),
  JSON.stringify(gameData)
);
console.log(`✅ gameData.json: 全データ統合`);

console.log(`\n出力先: ${outputDir}`);
