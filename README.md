# 医療カルテシステム

完全な医療カルテシステムの設計・開発・実装が完了したプロジェクトです。

## 📁 プロジェクト構成

```
new_calte2/
├── README.md                    # このファイル
├── SETUP.md                     # セットアップ手順書（詳細版）
├── 01_要件定義・前提条件.md
├── 02_データモデル設計.md
├── 03_運用フロー・機能概要設計.md
├── 04_画面一覧・画面詳細設計.md
├── 05_技術仕様・アーキテクチャ設計.md
├── docs/                        # 詳細設計ドキュメント
│   ├── requirements/
│   ├── models/
│   ├── design/
│   ├── screens/
│   └── mockups/                # HTML画面モック
├── backend/                    # バックエンドAPI
│   ├── src/
│   ├── database/
│   ├── tests/
│   └── prisma/
├── frontend/                   # フロントエンド（React）
│   └── src/
└── mockups/                   # HTMLモックアップ
```

## 🎯 完成した成果物

### 1. 設計ドキュメント（完備）
- ✅ 要件定義・前提条件
- ✅ データモデル設計（37テーブル）
- ✅ 運用フロー・機能概要設計
- ✅ 画面一覧（76画面）・画面詳細設計
- ✅ 技術仕様・アーキテクチャ設計

### 2. バックエンド実装
- ✅ Node.js + Express + PostgreSQL/Prisma
- ✅ 認証API（JWT）
- ✅ 患者管理API
- ✅ 来院記録API
- ✅ カルテ記録API
- ✅ 処方オーダーAPI
- ✅ 配送管理API

### 3. フロントエンド実装
- ✅ React + Redux + Material-UI
- ✅ ログイン画面
- ✅ ダッシュボード
- ✅ 配送依頼一覧

### 4. モックアップ
- ✅ HTML/CSSによる9画面のモックアップ

## 🚀 クイックスタート

### 前提条件
- **Node.js** 20.x 以上
- **PostgreSQL** 14.x 以上
- **npm** 9.x 以上

### 1. リポジトリのクローン

```bash
git clone https://github.com/okab130/new_calte2.git
cd new_calte2
```

### 2. バックエンドセットアップ

```bash
cd backend

# 依存関係インストール
npm install

# 環境変数設定（.envファイルを作成）
# DATABASE_URL, JWT_SECRET等を設定

# データベース初期化（PostgreSQL版）
psql -U postgres
CREATE DATABASE medical_record_db;
\c medical_record_db
\i database/init.sql
\q

# または Prisma版
npx prisma migrate dev
npx prisma generate

# サーバー起動（開発モード）
npm run dev
```

バックエンドが `http://localhost:3000` で起動します。

### 3. フロントエンドセットアップ

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

フロントエンドが `http://localhost:5173` で起動します。

### 4. モックアップの確認

ブラウザで以下のファイルを直接開きます：

```
mockups/01_login.html
mockups/02_dashboard.html
docs/mockups/index.html
```

## 📡 API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### 患者管理
- `GET /api/patients/search` - 患者検索
- `GET /api/patients/:id` - 患者詳細
- `POST /api/patients` - 患者登録
- `PUT /api/patients/:id` - 患者更新

### 来院記録
- `POST /api/visits` - 来院記録作成
- `GET /api/visits/patient/:patientId` - 患者の来院履歴
- `GET /api/visits/today/list` - 本日の来院一覧

### カルテ記録
- `POST /api/medical-records` - カルテ作成
- `POST /api/medical-records/:id/sign` - カルテ署名
- `GET /api/medical-records/patient/:patientId` - カルテ一覧

### 処方オーダー
- `POST /api/prescriptions` - 処方オーダー作成
- `GET /api/prescriptions/patient/:patientId` - 処方履歴

### 配送管理（配送システム機能）
- `GET /api/v1/delivery-orders` - 配送依頼一覧
- `POST /api/v1/delivery-orders` - 配送依頼作成
- `GET /api/v1/delivery-orders/stats` - 統計情報

## 🔐 デモアカウント

| ユーザー名 | パスワード | ロール |
|-----------|----------|--------|
| doctor | password123 | 医師 |
| nurse | password123 | 看護師 |
| clerk | password123 | 医療事務 |

## 🏗️ 技術スタック

### バックエンド
- **Node.js** 20.x
- **Express** 4.x/5.x
- **PostgreSQL** 14+
- **Prisma** ORM
- **JWT** 認証
- **bcrypt/bcryptjs** パスワードハッシュ化
- **TypeScript**

### フロントエンド
- **React** 18.x
- **Redux Toolkit** 状態管理
- **Material-UI** UIコンポーネント
- **Vite** ビルドツール
- **TypeScript**

### その他
- **Jest** テストフレームワーク
- **Supertest** APIテスト

## 🧪 テスト実行

### バックエンドテスト

```bash
cd backend
npm test                    # 全テスト実行
npm test -- --coverage     # カバレッジ付き
npm run test:watch         # ウォッチモード
```

### フロントエンドテスト

```bash
cd frontend
npm test                    # 全テスト実行
npm run test:ui            # UI付きテスト
```

## 📦 本番ビルド

### バックエンド

```bash
cd backend
npm run build
npm start
```

### フロントエンド

```bash
cd frontend
npm run build
npm run preview
```

## 📚 ドキュメント

詳細なドキュメントは以下を参照してください：

- [要件定義・前提条件](01_要件定義・前提条件.md)
- [データモデル設計](02_データモデル設計.md)
- [運用フロー・機能概要設計](03_運用フロー・機能概要設計.md)
- [画面一覧・画面詳細設計](04_画面一覧・画面詳細設計.md)
- [技術仕様・アーキテクチャ設計](05_技術仕様・アーキテクチャ設計.md)
- [セットアップ詳細手順](SETUP.md)

## 🔧 トラブルシューティング

### ポートが既に使用されている

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### データベース接続エラー

```bash
# PostgreSQL接続確認
psql -U postgres -l

# Prisma再生成
npx prisma generate
npx prisma db pull
```

### node_modulesエラー

```bash
# クリーンインストール
rm -rf node_modules package-lock.json
npm install
```

## 📄 ライセンス

© 2025 Medical System. All rights reserved.

## 👥 作成者

AI駆動開発チーム

## 📅 更新履歴

- **2025-01-20**: プロジェクト初期セットアップ、GitHubアップロード完了
- **v1.0.0**: MVP完成（Phase 1）
