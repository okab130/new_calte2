# 医療カルテシステム Backend API

Node.js + Express + PostgreSQL によるRESTful API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして設定

```bash
cp .env.example .env
```

### 3. データベースのセットアップ

PostgreSQLをインストール後、以下を実行:

```bash
# データベース作成
createdb medical_record_db

# テーブル・初期データ作成
psql -d medical_record_db -f database/init.sql
```

### 4. サーバー起動

```bash
# 開発モード
npm run dev

# 本番モード
npm start
```

## API エンドポイント

### 認証

- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### 患者管理

- `GET /api/patients/search` - 患者検索
- `GET /api/patients/:patientId` - 患者詳細
- `POST /api/patients` - 患者登録
- `PUT /api/patients/:patientId` - 患者情報更新

### 来院記録

- `POST /api/visits` - 来院記録作成
- `GET /api/visits/patient/:patientId` - 患者の来院履歴
- `GET /api/visits/:visitId` - 来院記録詳細
- `GET /api/visits/today/list` - 本日の来院一覧

### カルテ記録

- `POST /api/medical-records` - カルテ作成
- `POST /api/medical-records/:recordId/sign` - カルテ署名
- `GET /api/medical-records/patient/:patientId` - 患者のカルテ一覧
- `GET /api/medical-records/:recordId` - カルテ詳細

### 処方オーダー

- `POST /api/prescriptions` - 処方オーダー作成
- `GET /api/prescriptions/patient/:patientId` - 患者の処方履歴
- `GET /api/prescriptions/:orderId` - 処方オーダー詳細
- `GET /api/prescriptions/medications/search` - 薬剤検索

## テスト

```bash
npm test
```

## デモユーザー

| ユーザー名 | パスワード | ロール |
|-----------|----------|--------|
| doctor | password123 | 医師 |
| nurse | password123 | 看護師 |
| clerk | password123 | 医療事務 |

## デモ患者データ

- 患者番号: 000001 - 山田 太郎
- 患者番号: 000002 - 佐藤 花子
- 患者番号: 000003 - 鈴木 一郎
- 患者番号: 000004 - 田中 美咲
- 患者番号: 000005 - 高橋 健太

## 技術スタック

- Node.js 18+
- Express 4
- PostgreSQL 14+
- JWT認証
- bcrypt (パスワードハッシュ化)

## セキュリティ

- JWTトークン認証
- パスワードハッシュ化（bcrypt）
- ロールベースアクセス制御
- SQLインジェクション対策（パラメータ化クエリ）
- アカウントロック機能（5回失敗で30分ロック）

## ライセンス

© 2024 Medical System
