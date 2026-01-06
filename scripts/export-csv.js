const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'persons.db');
const outputDir = path.join(__dirname, '..', 'data', 'csv');

// 出力ディレクトリ作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const db = new Database(dbPath);

// CSVエスケープ関数
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 配列をCSV行に変換
function arrayToCsvRow(arr) {
  return arr.map(escapeCsv).join(',');
}

// テーブルをCSVにエクスポート
function exportTableToCsv(tableName, outputFile) {
  console.log(`Exporting ${tableName}...`);

  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();

  if (rows.length === 0) {
    console.log(`  ⚠️  ${tableName} is empty`);
    return;
  }

  // ヘッダー行
  const headers = Object.keys(rows[0]);
  const csvLines = [arrayToCsvRow(headers)];

  // データ行
  rows.forEach(row => {
    const values = headers.map(header => row[header]);
    csvLines.push(arrayToCsvRow(values));
  });

  // ファイル書き込み
  const csvContent = csvLines.join('\n');
  fs.writeFileSync(outputFile, csvContent, 'utf8');

  console.log(`  ✅ Exported ${rows.length} rows to ${path.basename(outputFile)}`);
}

// person_attributesを特別にエクスポート（valueカラムは除外、trueのみ）
function exportPersonAttributes(outputFile) {
  console.log('Exporting person_attributes...');

  const rows = db.prepare('SELECT person_id, attribute_id FROM person_attributes WHERE value = 1').all();

  if (rows.length === 0) {
    console.log('  ⚠️  person_attributes is empty');
    return;
  }

  // ヘッダー行
  const csvLines = ['person_id,attribute_id'];

  // データ行
  rows.forEach(row => {
    csvLines.push(`${row.person_id},${row.attribute_id}`);
  });

  // ファイル書き込み
  const csvContent = csvLines.join('\n');
  fs.writeFileSync(outputFile, csvContent, 'utf8');

  console.log(`  ✅ Exported ${rows.length} rows to ${path.basename(outputFile)}`);
}

// 各テーブルをエクスポート
console.log('Starting CSV export...\n');

exportTableToCsv('persons', path.join(outputDir, 'persons.csv'));
exportTableToCsv('attributes', path.join(outputDir, 'attributes.csv'));
exportPersonAttributes(path.join(outputDir, 'person_attributes.csv'));
exportTableToCsv('game_sessions', path.join(outputDir, 'game_sessions.csv'));

db.close();

console.log('\n✅ All tables exported successfully!');
console.log(`Output directory: ${outputDir}`);
