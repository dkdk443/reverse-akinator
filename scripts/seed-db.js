const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'persons.db');
const db = new Database(dbPath);

console.log('初期データを投入します...');

// トランザクション開始
const insertData = db.transaction(() => {
  // 1. 人物データ
  console.log('人物データを投入中...');
  const insertPerson = db.prepare('INSERT INTO persons (name, name_en, description) VALUES (?, ?, ?)');

  const persons = [
    // 日本史 (15人)
    ['織田信長', 'Oda Nobunaga', '戦国時代の武将'],
    ['豊臣秀吉', 'Toyotomi Hideyoshi', '戦国時代の武将'],
    ['徳川家康', 'Tokugawa Ieyasu', '江戸幕府初代将軍'],
    ['坂本龍馬', 'Sakamoto Ryoma', '幕末の志士'],
    ['西郷隆盛', 'Saigo Takamori', '明治時代の軍人'],
    ['夏目漱石', 'Natsume Soseki', '近代の作家'],
    ['樋口一葉', 'Higuchi Ichiyo', '近代の作家・女性'],
    ['野口英世', 'Noguchi Hideyo', '近代の科学者'],
    ['紫式部', 'Murasaki Shikibu', '平安時代の作家・女性'],
    ['聖徳太子', 'Prince Shotoku', '飛鳥時代の政治家'],
    ['源義経', 'Minamoto no Yoshitsune', '平安時代末期の武将'],
    ['葛飾北斎', 'Katsushika Hokusai', '江戸時代の芸術家'],
    ['伊藤博文', 'Ito Hirobumi', '明治時代の政治家'],
    ['福沢諭吉', 'Fukuzawa Yukichi', '明治時代の思想家'],
    ['手塚治虫', 'Tezuka Osamu', '現代の漫画家'],

    // 世界史 (15人)
    ['ナポレオン・ボナパルト', 'Napoleon Bonaparte', '近代の軍人・フランス'],
    ['クレオパトラ7世', 'Cleopatra VII', '古代の女王・エジプト'],
    ['レオナルド・ダ・ヴィンチ', 'Leonardo da Vinci', 'ルネサンスの芸術家・イタリア'],
    ['ヴォルフガング・アマデウス・モーツァルト', 'Wolfgang Amadeus Mozart', '近世の音楽家・オーストリア'],
    ['アルベルト・アインシュタイン', 'Albert Einstein', '現代の科学者・ドイツ系'],
    ['マリー・キュリー', 'Marie Curie', '近代の科学者・女性・ポーランド'],
    ['マハトマ・ガンディー', 'Mahatma Gandhi', '現代の政治家・インド'],
    ['マザー・テレサ', 'Mother Teresa', '現代の宗教家・女性'],
    ['ウィリアム・シェイクスピア', 'William Shakespeare', '近世の作家・イギリス'],
    ['ルートヴィヒ・ヴァン・ベートーヴェン', 'Ludwig van Beethoven', '近代の音楽家・ドイツ'],
    ['パブロ・ピカソ', 'Pablo Picasso', '現代の芸術家・スペイン'],
    ['チャールズ・チャップリン', 'Charlie Chaplin', '現代の俳優・イギリス'],
    ['エイブラハム・リンカーン', 'Abraham Lincoln', '近代の政治家・アメリカ'],
    ['ジョン・F・ケネディ', 'John F. Kennedy', '現代の政治家・アメリカ'],
    ['チンギス・ハン', 'Genghis Khan', '中世の軍人・モンゴル'],
  ];

  persons.forEach(person => insertPerson.run(person[0], person[1], person[2]));

  // 2. 属性データ（質問）
  console.log('属性データを投入中...');
  const insertAttribute = db.prepare('INSERT INTO attributes (category, question, attribute_key) VALUES (?, ?, ?)');

  const attributes = [
    // 年代 (era)
    ['era', '古代の人ですか？', 'era_ancient'],
    ['era', '中世の人ですか？', 'era_medieval'],
    ['era', '近世の人ですか？', 'era_early_modern'],
    ['era', '近代の人ですか？', 'era_modern'],
    ['era', '現代の人ですか？', 'era_contemporary'],

    // 地域 (region)
    ['region', '日本人ですか？', 'region_japan'],
    ['region', '中国・モンゴルの人ですか？', 'region_china_mongolia'],
    ['region', 'ヨーロッパの人ですか？', 'region_europe'],
    ['region', 'アメリカの人ですか？', 'region_america'],
    ['region', 'その他のアジアの人ですか？', 'region_other_asia'],
    ['region', 'アフリカの人ですか？', 'region_africa'],

    // 性別 (gender)
    ['gender', '男性ですか？', 'gender_male'],
    ['gender', '女性ですか？', 'gender_female'],

    // 年齢 (age)
    ['age', '若くして亡くなりましたか（50歳未満）？', 'age_died_young'],
    ['age', '長生きしましたか（80歳以上）？', 'age_long_lived'],

    // 職業 (occupation)
    ['occupation', '政治家ですか？', 'occupation_politician'],
    ['occupation', '軍人・武将ですか？', 'occupation_military'],
    ['occupation', '芸術家ですか？', 'occupation_artist'],
    ['occupation', '科学者ですか？', 'occupation_scientist'],
    ['occupation', '作家ですか？', 'occupation_writer'],
    ['occupation', '音楽家ですか？', 'occupation_musician'],
    ['occupation', '思想家・宗教家ですか？', 'occupation_philosopher'],

    // 特徴 (trait)
    ['trait', '戦いに関わりましたか？', 'trait_battle'],
    ['trait', '革命を起こしましたか？', 'trait_revolution'],
    ['trait', '芸術作品を残しましたか？', 'trait_artwork'],
    ['trait', 'ノーベル賞を受賞しましたか？', 'trait_nobel'],
  ];

  attributes.forEach(attr => insertAttribute.run(attr[0], attr[1], attr[2]));

  // 3. 人物と属性の紐付け
  console.log('人物と属性の紐付けを投入中...');
  const insertPersonAttr = db.prepare('INSERT INTO person_attributes (person_id, attribute_id, value) VALUES (?, ?, ?)');

  // 属性IDをキーで取得できるようにマッピング
  const attrMap = {};
  db.prepare('SELECT id, attribute_key FROM attributes').all().forEach(row => {
    attrMap[row.attribute_key] = row.id;
  });

  // 各人物の属性を定義（1=はい, 0=いいえ）
  // person_id, attribute_key, value の配列
  const personAttributes = [
    // 1. 織田信長
    [1, 'era_early_modern', 1], [1, 'region_japan', 1], [1, 'gender_male', 1],
    [1, 'occupation_military', 1], [1, 'trait_battle', 1], [1, 'age_died_young', 1],

    // 2. 豊臣秀吉
    [2, 'era_early_modern', 1], [2, 'region_japan', 1], [2, 'gender_male', 1],
    [2, 'occupation_military', 1], [2, 'occupation_politician', 1], [2, 'trait_battle', 1],

    // 3. 徳川家康
    [3, 'era_early_modern', 1], [3, 'region_japan', 1], [3, 'gender_male', 1],
    [3, 'occupation_military', 1], [3, 'occupation_politician', 1], [3, 'trait_battle', 1],
    [3, 'age_long_lived', 1],

    // 4. 坂本龍馬
    [4, 'era_modern', 1], [4, 'region_japan', 1], [4, 'gender_male', 1],
    [4, 'occupation_politician', 1], [4, 'trait_revolution', 1], [4, 'age_died_young', 1],

    // 5. 西郷隆盛
    [5, 'era_modern', 1], [5, 'region_japan', 1], [5, 'gender_male', 1],
    [5, 'occupation_military', 1], [5, 'occupation_politician', 1], [5, 'trait_battle', 1],

    // 6. 夏目漱石
    [6, 'era_modern', 1], [6, 'region_japan', 1], [6, 'gender_male', 1],
    [6, 'occupation_writer', 1], [6, 'trait_artwork', 1],

    // 7. 樋口一葉
    [7, 'era_modern', 1], [7, 'region_japan', 1], [7, 'gender_female', 1],
    [7, 'occupation_writer', 1], [7, 'trait_artwork', 1], [7, 'age_died_young', 1],

    // 8. 野口英世
    [8, 'era_modern', 1], [8, 'region_japan', 1], [8, 'gender_male', 1],
    [8, 'occupation_scientist', 1],

    // 9. 紫式部
    [9, 'era_medieval', 1], [9, 'region_japan', 1], [9, 'gender_female', 1],
    [9, 'occupation_writer', 1], [9, 'trait_artwork', 1],

    // 10. 聖徳太子
    [10, 'era_ancient', 1], [10, 'region_japan', 1], [10, 'gender_male', 1],
    [10, 'occupation_politician', 1],

    // 11. 源義経
    [11, 'era_medieval', 1], [11, 'region_japan', 1], [11, 'gender_male', 1],
    [11, 'occupation_military', 1], [11, 'trait_battle', 1], [11, 'age_died_young', 1],

    // 12. 葛飾北斎
    [12, 'era_early_modern', 1], [12, 'region_japan', 1], [12, 'gender_male', 1],
    [12, 'occupation_artist', 1], [12, 'trait_artwork', 1], [12, 'age_long_lived', 1],

    // 13. 伊藤博文
    [13, 'era_modern', 1], [13, 'region_japan', 1], [13, 'gender_male', 1],
    [13, 'occupation_politician', 1],

    // 14. 福沢諭吉
    [14, 'era_modern', 1], [14, 'region_japan', 1], [14, 'gender_male', 1],
    [14, 'occupation_philosopher', 1], [14, 'occupation_writer', 1], [14, 'trait_artwork', 1],

    // 15. 手塚治虫
    [15, 'era_contemporary', 1], [15, 'region_japan', 1], [15, 'gender_male', 1],
    [15, 'occupation_artist', 1], [15, 'trait_artwork', 1],

    // 16. ナポレオン
    [16, 'era_modern', 1], [16, 'region_europe', 1], [16, 'gender_male', 1],
    [16, 'occupation_military', 1], [16, 'occupation_politician', 1], [16, 'trait_battle', 1],
    [16, 'trait_revolution', 1],

    // 17. クレオパトラ7世
    [17, 'era_ancient', 1], [17, 'region_africa', 1], [17, 'gender_female', 1],
    [17, 'occupation_politician', 1], [17, 'age_died_young', 1],

    // 18. レオナルド・ダ・ヴィンチ
    [18, 'era_early_modern', 1], [18, 'region_europe', 1], [18, 'gender_male', 1],
    [18, 'occupation_artist', 1], [18, 'occupation_scientist', 1], [18, 'trait_artwork', 1],

    // 19. モーツァルト
    [19, 'era_early_modern', 1], [19, 'region_europe', 1], [19, 'gender_male', 1],
    [19, 'occupation_musician', 1], [19, 'trait_artwork', 1], [19, 'age_died_young', 1],

    // 20. アインシュタイン
    [20, 'era_contemporary', 1], [20, 'region_europe', 1], [20, 'gender_male', 1],
    [20, 'occupation_scientist', 1], [20, 'trait_nobel', 1], [20, 'age_long_lived', 1],

    // 21. マリー・キュリー
    [21, 'era_modern', 1], [21, 'region_europe', 1], [21, 'gender_female', 1],
    [21, 'occupation_scientist', 1], [21, 'trait_nobel', 1],

    // 22. ガンディー
    [22, 'era_contemporary', 1], [22, 'region_other_asia', 1], [22, 'gender_male', 1],
    [22, 'occupation_politician', 1], [22, 'occupation_philosopher', 1], [22, 'trait_revolution', 1],

    // 23. マザー・テレサ
    [23, 'era_contemporary', 1], [23, 'region_other_asia', 1], [23, 'gender_female', 1],
    [23, 'occupation_philosopher', 1], [23, 'trait_nobel', 1], [23, 'age_long_lived', 1],

    // 24. シェイクスピア
    [24, 'era_early_modern', 1], [24, 'region_europe', 1], [24, 'gender_male', 1],
    [24, 'occupation_writer', 1], [24, 'trait_artwork', 1],

    // 25. ベートーヴェン
    [25, 'era_modern', 1], [25, 'region_europe', 1], [25, 'gender_male', 1],
    [25, 'occupation_musician', 1], [25, 'trait_artwork', 1],

    // 26. ピカソ
    [26, 'era_contemporary', 1], [26, 'region_europe', 1], [26, 'gender_male', 1],
    [26, 'occupation_artist', 1], [26, 'trait_artwork', 1],

    // 27. チャップリン
    [27, 'era_contemporary', 1], [27, 'region_europe', 1], [27, 'gender_male', 1],
    [27, 'occupation_artist', 1], [27, 'trait_artwork', 1], [27, 'age_long_lived', 1],

    // 28. リンカーン
    [28, 'era_modern', 1], [28, 'region_america', 1], [28, 'gender_male', 1],
    [28, 'occupation_politician', 1], [28, 'trait_battle', 1],

    // 29. ケネディ
    [29, 'era_contemporary', 1], [29, 'region_america', 1], [29, 'gender_male', 1],
    [29, 'occupation_politician', 1], [29, 'age_died_young', 1],

    // 30. チンギス・ハン
    [30, 'era_medieval', 1], [30, 'region_china_mongolia', 1], [30, 'gender_male', 1],
    [30, 'occupation_military', 1], [30, 'occupation_politician', 1], [30, 'trait_battle', 1],
  ];

  personAttributes.forEach(([personId, attrKey, value]) => {
    const attrId = attrMap[attrKey];
    insertPersonAttr.run(personId, attrId, value);
  });
});

// トランザクション実行
insertData();

db.close();

console.log('✅ 初期データの投入が完了しました!');
console.log('投入されたデータ:');
console.log('  - 人物: 30人');
console.log('  - 質問属性: 26個');
console.log('  - 人物と属性の関連: 多数');
