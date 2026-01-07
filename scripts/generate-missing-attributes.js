const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'persons.db');
const csvDir = path.join(__dirname, '..', 'data', 'csv');

const db = new Database(dbPath);

console.log('不足している人物の属性データを生成します...');

// CSVパーサー
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

// persons.csvから読み込み
const personsCSV = fs.readFileSync(path.join(csvDir, 'persons.csv'), 'utf-8');
const persons = parseCSV(personsCSV);

// attributesを取得
const attributes = db.prepare('SELECT * FROM attributes').all();
const attrMap = {};
attributes.forEach(attr => {
  attrMap[attr.attribute_key] = attr.id;
});

// era, region, gender, occupationのマッピング
const eraMap = {
  '古代': 'era_ancient',
  '中世': 'era_medieval',
  '近世': 'era_early_modern',
  '近代': 'era_modern',
  '現代': 'era_contemporary',
  '戦国時代': 'era_early_modern',
  '戦国〜江戸時代': 'era_early_modern',
  '江戸時代': 'era_early_modern',
  '幕末': 'era_modern',
  '幕末〜明治': 'era_modern',
  '明治': 'era_modern',
  '明治〜大正': 'era_modern',
  '明治〜昭和': 'era_modern',
  '大正': 'era_modern',
  '大正〜昭和': 'era_modern',
  '昭和': 'era_contemporary',
  '昭和〜平成': 'era_contemporary',
  '平安時代': 'era_medieval',
  '平安〜鎌倉時代': 'era_medieval',
  '平安時代末期': 'era_medieval',
  '鎌倉時代': 'era_medieval',
  '南北朝〜室町時代': 'era_medieval',
  '飛鳥時代': 'era_ancient',
  'ルネサンス': 'era_early_modern',
  '近世': 'era_early_modern',
  'バロック': 'era_early_modern',
  '古典派': 'era_modern',
  '古典〜ロマン派': 'era_modern',
  '産業革命期': 'era_modern',
};

const regionMap = {
  '日本': 'region_japan',
  'フランス': 'region_europe',
  'エジプト': 'region_africa',
  'イタリア': 'region_europe',
  'オーストリア': 'region_europe',
  'ドイツ': 'region_europe',
  'ドイツ→アメリカ': 'region_europe',
  'ポーランド→フランス': 'region_europe',
  'インド': 'region_other_asia',
  'イギリス': 'region_europe',
  'スペイン': 'region_europe',
  'アメリカ': 'region_america',
  'モンゴル': 'region_china_mongolia',
  'ローマ': 'region_europe',
  'マケドニア': 'region_europe',
  'ギリシャ': 'region_europe',
  '中国': 'region_china_mongolia',
  'アラビア': 'region_other_asia',
  'パレスチナ': 'region_other_asia',
  'ポーランド': 'region_europe',
  '南アフリカ': 'region_africa',
  'アルゼンチン': 'region_america',
  'ソ連': 'region_europe',
  'ロシア': 'region_europe',
  'オランダ': 'region_europe',
};

const genderMap = {
  '男性': 'gender_male',
  '女性': 'gender_female',
};

// トランザクション開始
const insertData = db.transaction(() => {
  let insertCount = 0;

  persons.forEach(person => {
    const personId = parseInt(person.id);

    // person_id 31以降のみ処理
    if (personId <= 30) return;

    // この人物の既存属性を確認
    const existing = db.prepare('SELECT COUNT(*) as count FROM person_attributes WHERE person_id = ?').get(personId);
    if (existing.count > 0) {
      console.log(`person_id ${personId} は既に属性データがあります。スキップ`);
      return;
    }

    console.log(`person_id ${personId} (${person.name}) の属性データを生成中...`);

    const insertPersonAttr = db.prepare('INSERT INTO person_attributes (person_id, attribute_id, value) VALUES (?, ?, ?)');

    // era
    const eraKey = eraMap[person.era];
    if (eraKey && attrMap[eraKey]) {
      insertPersonAttr.run(personId, attrMap[eraKey], 1);
      insertCount++;
    }

    // region
    const regionKey = regionMap[person.region];
    if (regionKey && attrMap[regionKey]) {
      insertPersonAttr.run(personId, attrMap[regionKey], 1);
      insertCount++;
    }

    // gender
    const genderKey = genderMap[person.gender];
    if (genderKey && attrMap[genderKey]) {
      insertPersonAttr.run(personId, attrMap[genderKey], 1);
      insertCount++;
    }

    // age (birth_year と death_year から計算)
    if (person.birth_year && person.death_year) {
      const age = parseInt(person.death_year) - parseInt(person.birth_year);
      if (age < 50 && attrMap['age_died_young']) {
        insertPersonAttr.run(personId, attrMap['age_died_young'], 1);
        insertCount++;
      } else if (age >= 80 && attrMap['age_long_lived']) {
        insertPersonAttr.run(personId, attrMap['age_long_lived'], 1);
        insertCount++;
      }
    }

    // occupation (簡易マッピング - キーワードで判定)
    const occupation = person.occupation || '';
    const occupationMappings = [
      { keywords: ['政治家', '大統領', '首相', '皇帝', '王', '女王', '執権', '将軍'], key: 'occupation_politician' },
      { keywords: ['武将', '軍人', '指導者', '革命家'], key: 'occupation_military' },
      { keywords: ['画家', '芸術家', '浮世絵師', 'デザイナー'], key: 'occupation_artist' },
      { keywords: ['科学者', '物理学者', '学者', '天文学者'], key: 'occupation_scientist' },
      { keywords: ['作家', '小説家', '詩人', '歌人', '劇作家'], key: 'occupation_writer' },
      { keywords: ['作曲家', '音楽家', '歌手'], key: 'occupation_musician' },
      { keywords: ['思想家', '宗教家', '僧侶', '哲学者', '修道女'], key: 'occupation_philosopher' },
      { keywords: ['実業家', '起業家'], key: 'occupation_entrepreneur' },
      { keywords: ['俳優', '女優', 'エンターテイナー', '映画'], key: 'occupation_entertainer' },
      { keywords: ['発明家'], key: 'occupation_inventor' },
      { keywords: ['看護師', '医師'], key: 'occupation_medical' },
    ];

    occupationMappings.forEach(mapping => {
      if (mapping.keywords.some(keyword => occupation.includes(keyword)) && attrMap[mapping.key]) {
        insertPersonAttr.run(personId, attrMap[mapping.key], 1);
        insertCount++;
      }
    });
  });

  console.log(`\n合計 ${insertCount} 件の属性を追加しました`);
});

// トランザクション実行
insertData();

db.close();

console.log('✅ 不足していた属性データの生成が完了しました!');
