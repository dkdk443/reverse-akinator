# 逆アキネーター (Reverse Akinator)

ユーザーが有名な歴史上の人物を思い浮かべ、システム(AI)に質問を投げかける。AIがその質問に「はい」「いいえ」「どちらとも言えない」で回答し、ユーザーが推理して人物を当てるゲーム。

## 技術スタック

- **フロントエンド・バックエンド**: Next.js 14 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite (better-sqlite3)
- **デプロイ**: Vercel
- **コンテナ**: Docker

## 必要要件

### ローカル開発の場合
- Node.js 20.x
- npm

### Docker開発の場合
- Docker
- Docker Compose

## セットアップ

### 方法1: Docker を使う (推奨)

#### 開発環境

```bash
# リポジトリをクローン
git clone <repository-url>
cd reverse-akinator

# 環境変数ファイルをコピー
cp .env.example .env

# 開発サーバーを起動 (ホットリロード有効)
docker-compose up dev

# ブラウザで http://localhost:3000 にアクセス
```

#### 本番環境

```bash
# ビルドして起動
docker-compose up app

# バックグラウンドで起動
docker-compose up -d app
```

#### Dockerコマンド

```bash
# コンテナを停止
docker-compose down

# ログを確認
docker-compose logs -f

# コンテナに入る
docker-compose exec app sh

# イメージを再ビルド
docker-compose build --no-cache
```

### 方法2: ローカルで直接実行

```bash
# リポジトリをクローン
git clone <repository-url>
cd reverse-akinator

# 依存関係をインストール
npm install

# 環境変数ファイルをコピー
cp .env.example .env

# データベースを初期化 (スクリプト作成後)
npm run db:init

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

## プロジェクト構成

```
reverse-akinator/
├─ app/
│  ├─ page.tsx              # スタート画面
│  ├─ game/
│  │  └─ page.tsx           # ゲーム画面
│  └─ api/
│     ├─ start/route.ts     # ゲーム開始(ランダム人物選択)
│     ├─ answer/route.ts    # 質問に回答
│     └─ guess/route.ts     # 正誤判定
├─ lib/
│  └─ db.ts                 # SQLite接続・クエリ
├─ data/
│  └─ persons.db            # SQLiteファイル
├─ types/
│  └─ index.ts              # 型定義
├─ Dockerfile               # Docker設定
├─ docker-compose.yml       # Docker Compose設定
└─ .dockerignore            # Dockerビルド除外設定
```

## 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# データベース初期化 (今後実装)
npm run db:init

# データベースシード (今後実装)
npm run db:seed
```

## 環境変数

`.env.example` をコピーして `.env` を作成してください。

```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/persons.db
NEXT_TELEMETRY_DISABLED=1
```

## データベース

SQLiteを使用しています。データベースファイルは `data/persons.db` に保存されます。

### テーブル構成

- `persons`: 人物マスタ (30人の歴史上の人物)
- `attributes`: 属性マスタ (質問内容)
- `person_attributes`: 人物と属性の紐付け
- `game_sessions`: ゲームセッション (統計用)

## ゲームの流れ

1. スタート画面で「開始」ボタンをクリック
2. カテゴリから質問を選択 (年代、地域、性別、職業など)
3. AIが「はい」「いいえ」「どちらとも言えない」で回答
4. 質問を繰り返し、人物を推理
5. 人物名を入力して正誤判定

## デプロイ

### Vercel

```bash
# Vercelにデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### その他のプラットフォーム

Dockerを使用しているため、任意のコンテナホスティングサービスにデプロイ可能です:
- AWS ECS / Fargate
- Google Cloud Run
- Azure Container Instances
- Railway
- Render

## 開発ステータス

- [x] プロジェクト設計
- [ ] Next.jsプロジェクト作成
- [ ] SQLiteデータベース作成・初期データ投入
- [ ] API実装
- [ ] UI実装
- [ ] デプロイ

## 将来的な拡張機能

- フリー入力質問の自然言語処理
- 人物数の拡大 (100人、1000人...)
- 質問履歴の最適化 (機械学習)
- マルチプレイヤー対応
- ランキング機能

## ライセンス

MIT

## お問い合わせ

問題や提案がある場合は、Issueを作成してください。
