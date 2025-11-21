# セットアップ詳細手順書

医療カルテシステムの環境構築からアプリケーション起動までの詳細手順です。

## 📋 目次

1. [システム要件](#システム要件)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [データベースセットアップ](#データベースセットアップ)
4. [バックエンドセットアップ](#バックエンドセットアップ)
5. [フロントエンドセットアップ](#フロントエンドセットアップ)
6. [起動方法](#起動方法)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## システム要件

### 必須ソフトウェア

| ソフトウェア | バージョン | 用途 |
|------------|----------|------|
| Node.js | 20.x 以上 | バックエンド・フロントエンド実行環境 |
| npm | 9.x 以上 | パッケージマネージャー |
| PostgreSQL | 14.x 以上 | データベース |
| Git | 2.x 以上 | バージョン管理 |

### 推奨開発環境

- **OS**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **エディタ**: VS Code
- **メモリ**: 8GB以上
- **ディスク空き容量**: 5GB以上

---

## 開発環境のセットアップ

### 1. Node.jsのインストール

#### Windows

```powershell
# 公式サイトからインストーラーをダウンロード
# https://nodejs.org/

# またはChocolateyを使用
choco install nodejs-lts
```

#### macOS

```bash
# Homebrewを使用
brew install node@20
```

#### Linux (Ubuntu)

```bash
# NodeSource経由でインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. インストール確認

```bash
node --version  # v20.x.x が表示されること
npm --version   # 9.x.x 以上が表示されること
```

### 3. PostgreSQLのインストール

#### Windows

```powershell
# 公式サイトからインストーラーをダウンロード
# https://www.postgresql.org/download/windows/

# またはChocolateyを使用
choco install postgresql
```

インストール時の設定：
- **ポート**: 5432（デフォルト）
- **スーパーユーザーパスワード**: 任意（覚えておくこと）
- **ロケール**: Japanese, Japan

#### macOS

```bash
# Homebrewを使用
brew install postgresql@14

# サービス起動
brew services start postgresql@14
```

#### Linux (Ubuntu)

```bash
# PostgreSQLインストール
sudo apt update
sudo apt install postgresql postgresql-contrib

# サービス起動
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. PostgreSQL接続確認

```bash
# PostgreSQLに接続（Windowsの場合）
psql -U postgres

# パスワードを入力してログインできればOK
```

---

## データベースセットアップ

### 方法1: PostgreSQL直接実行（推奨）

#### 1. データベース作成

```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE medical_record_db;

# データベース一覧で確認
\l

# 作成したデータベースに接続
\c medical_record_db
```

#### 2. スキーマ・初期データ投入

```bash
# SQLファイルを実行（PostgreSQLプロンプト内で）
\i C:/Users/user/gh/new_calte2/backend/database/init.sql

# または外部から実行
psql -U postgres -d medical_record_db -f backend/database/init.sql
```

#### 3. テーブル作成確認

```sql
-- テーブル一覧表示
\dt

-- デモユーザー確認
SELECT user_id, username, role FROM users;

-- 患者データ確認
SELECT patient_id, last_name, first_name FROM patients LIMIT 5;
```

### 方法2: Prisma使用（TypeScript版の場合）

```bash
cd backend

# Prismaクライアント生成
npx prisma generate

# マイグレーション実行（開発環境）
npx prisma migrate dev --name init

# Prisma Studioでデータ確認
npx prisma studio
```

---

## バックエンドセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/okab130/new_calte2.git
cd new_calte2
```

### 2. バックエンドディレクトリへ移動

```bash
cd backend
```

### 3. 依存関係のインストール

```bash
npm install
```

インストールされる主要パッケージ：
- express: Webフレームワーク
- pg: PostgreSQLクライアント
- jsonwebtoken: JWT認証
- bcrypt/bcryptjs: パスワードハッシュ化
- express-validator: バリデーション
- dotenv: 環境変数管理

### 4. 環境変数の設定

`.env` ファイルを作成（PostgreSQL版）:

```bash
# .envファイルを作成
touch .env  # Windows: type nul > .env
```

`.env` の内容:

```env
# サーバー設定
PORT=3000
NODE_ENV=development

# データベース接続
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=medical_record_db

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS設定
CORS_ORIGIN=http://localhost:5173
```

または Prisma版の場合:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medical_record_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

### 5. データベース接続テスト

```bash
# Node.jsで接続テスト（PostgreSQL版）
node -e "const { Pool } = require('pg'); const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'medical_record_db', password: 'your_password', port: 5432 }); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows); pool.end(); });"
```

---

## フロントエンドセットアップ

### 1. フロントエンドディレクトリへ移動

```bash
cd ../frontend
```

### 2. 依存関係のインストール

```bash
npm install
```

インストールされる主要パッケージ：
- react: UIライブラリ
- react-router-dom: ルーティング
- @reduxjs/toolkit: 状態管理
- @mui/material: UIコンポーネント
- axios: HTTP通信

### 3. 環境変数の設定（オプション）

`.env` ファイルを作成:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 起動方法

### 1. バックエンド起動

```bash
# backendディレクトリで実行
cd backend

# 開発モード（ホットリロード有効）
npm run dev

# または本番モード
npm start
```

**起動確認メッセージ**:
```
Server is running on http://localhost:3000
Database connected successfully
```

### 2. フロントエンド起動（別ターミナル）

```bash
# frontendディレクトリで実行
cd frontend

# 開発サーバー起動
npm run dev
```

**起動確認メッセージ**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. モックアップの確認（HTMLモック）

ブラウザで以下のファイルを直接開く：

```
# ファイルエクスプローラーで開く
mockups/01_login.html
mockups/02_dashboard.html
docs/mockups/index.html
```

---

## 動作確認

### 1. API動作確認

#### ヘルスチェック

```bash
curl http://localhost:3000/api/health
```

**期待レスポンス**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

#### ログインAPI

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"password123"}'
```

**期待レスポンス**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "doctor",
    "role": "doctor"
  }
}
```

#### 患者検索API（認証必要）

```bash
# 上記で取得したトークンを使用
curl -X GET "http://localhost:3000/api/patients/search?lastNameKana=ヤマダ" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. フロントエンド動作確認

1. ブラウザで `http://localhost:5173` を開く
2. ログイン画面が表示される
3. デモアカウントでログイン:
   - ユーザー名: `doctor`
   - パスワード: `password123`
4. ダッシュボードが表示される

### 3. データベース確認

```bash
# PostgreSQLに接続
psql -U postgres -d medical_record_db

# ユーザー一覧確認
SELECT * FROM users;

# 患者一覧確認
SELECT * FROM patients LIMIT 10;

# テーブル数確認
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

---

## トラブルシューティング

### ポートが既に使用されている

**エラー**: `Error: listen EADDRINUSE: address already in use :::3000`

**解決方法**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID番号> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### データベース接続エラー

**エラー**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**解決方法**:

```bash
# PostgreSQLサービスが起動しているか確認
# Windows
Get-Service postgresql*

# サービス起動
Start-Service postgresql-x64-14

# macOS
brew services list
brew services start postgresql@14

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### 認証エラー

**エラー**: `password authentication failed for user "postgres"`

**解決方法**:

1. PostgreSQLのパスワードを確認
2. `.env` ファイルのパスワードを正しく設定
3. PostgreSQLの `pg_hba.conf` を確認（必要に応じて認証方式を変更）

### node_modules関連エラー

**エラー**: モジュールが見つからない

**解決方法**:

```bash
# node_modulesとpackage-lock.jsonを削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### Prismaマイグレーションエラー

**エラー**: `Migration failed`

**解決方法**:

```bash
# Prismaクライアント再生成
npx prisma generate

# データベースをリセット（注意: データが消えます）
npx prisma migrate reset

# マイグレーション再実行
npx prisma migrate dev
```

### フロントエンドビルドエラー

**エラー**: Viteビルドエラー

**解決方法**:

```bash
# キャッシュクリア
rm -rf node_modules/.vite

# 再起動
npm run dev
```

---

## テスト実行

### バックエンドテスト

```bash
cd backend

# 全テスト実行
npm test

# カバレッジ付きテスト
npm test -- --coverage

# 特定のテストファイルのみ実行
npm test -- tests/api.test.js

# ウォッチモード
npm run test:watch
```

### フロントエンドテスト

```bash
cd frontend

# テスト実行
npm test

# UI付きテスト
npm run test:ui
```

---

## 本番環境へのデプロイ

### バックエンドビルド

```bash
cd backend

# TypeScript版の場合
npm run build

# ビルド成果物確認
ls dist/

# 本番起動
NODE_ENV=production npm start
```

### フロントエンドビルド

```bash
cd frontend

# 本番ビルド
npm run build

# ビルド成果物確認
ls dist/

# プレビュー
npm run preview
```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してシステムを理解してください：

1. [要件定義・前提条件](01_要件定義・前提条件.md)
2. [データモデル設計](02_データモデル設計.md)
3. [運用フロー・機能概要設計](03_運用フロー・機能概要設計.md)
4. [画面一覧・画面詳細設計](04_画面一覧・画面詳細設計.md)
5. [技術仕様・アーキテクチャ設計](05_技術仕様・アーキテクチャ設計.md)

---

## サポート

問題が解決しない場合は、以下を確認してください：

- Node.jsとnpmのバージョンが要件を満たしているか
- PostgreSQLが正しくインストール・起動されているか
- 環境変数（.env）が正しく設定されているか
- ファイアウォール設定でポート3000, 5173が許可されているか

---

**最終更新**: 2025-01-20  
**ドキュメントバージョン**: 1.0.0
