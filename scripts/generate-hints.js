const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const csvPath = path.join(__dirname, '..', 'data', 'csv', 'persons.csv');

// CSV parse/write helpers
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
  return { headers, rows };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function escapeCSVField(field) {
  if (!field) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCSV(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(h => escapeCSVField(row[h]));
    lines.push(values.join(','));
  }
  return lines.join('\n') + '\n';
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateHints(person, model) {
  const prompt = `あなたは歴史クイズゲームのヒント作成者です。
以下の歴史上の人物について、3段階の難易度でヒントを作成してください。

人物: ${person.name} (${person.name_en || ''})
時代: ${person.era || ''}
職業: ${person.occupation || ''}
主な功績: ${person.major_achievement || ''}

以下の形式でJSON形式で返してください（他の文言は不要）:
{
  "hint1": "難しいヒント（抽象的・間接的、時代背景や雰囲気を示唆する程度）",
  "hint2": "中程度のヒント（やや具体的、職業分野や活動領域をほのめかす）",
  "hint3": "簡単なヒント（具体的、代表的な業績や出来事を示す）"
}

重要:
- 各ヒントは1〜2文で簡潔に
- 人物名を絶対に含めない
- 面白く興味を引く表現で
- JSON形式のみ返す`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim();

  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON not found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // CSV読み込み
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCSV(csvContent);

  // ヒントカラムを追加
  if (!headers.includes('hint1')) headers.push('hint1');
  if (!headers.includes('hint2')) headers.push('hint2');
  if (!headers.includes('hint3')) headers.push('hint3');

  console.log(`🎯 ${rows.length}人分のヒントを生成します...\n`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const person = rows[i];

    // 既にヒントがある場合はスキップ
    if (person.hint1 && person.hint2 && person.hint3) {
      console.log(`⏭️  [${i + 1}/${rows.length}] ${person.name} - スキップ（既存）`);
      skipCount++;
      continue;
    }

    try {
      console.log(`🔄 [${i + 1}/${rows.length}] ${person.name} - 生成中...`);

      const hints = await generateHints(person, model);

      person.hint1 = hints.hint1;
      person.hint2 = hints.hint2;
      person.hint3 = hints.hint3;

      console.log(`✅ [${i + 1}/${rows.length}] ${person.name} - 完了`);
      console.log(`   hint1: ${hints.hint1.substring(0, 40)}...`);
      successCount++;

      // レート制限対策: 1秒待機
      if (i < rows.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${rows.length}] ${person.name} - エラー: ${error.message}`);

      // エラー時は3秒待機してリトライ
      await sleep(3000);
      i--; // リトライ
    }

    // 10人ごとに途中保存
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(csvPath, toCSV(headers, rows));
      console.log(`💾 途中保存 (${i + 1}/${rows.length})\n`);
    }
  }

  // 最終保存
  fs.writeFileSync(csvPath, toCSV(headers, rows));

  console.log(`\n✨ 完了!`);
  console.log(`   成功: ${successCount}人`);
  console.log(`   スキップ: ${skipCount}人`);
  console.log(`   保存先: ${csvPath}`);
}

main().catch(console.error);
