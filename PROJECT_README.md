# 医療カルテシステム - 実装完了

完全な医療カルテシステムの設計・開発を実施しました。

## 📁 プロジェクト構成

```
new_calte/
├── README.md                    # このファイル
├── docs/                        # 設計ドキュメント
│   ├── requirements/           # 要件定義
│   │   └── 01_運用イメージ.md
│   ├── models/                 # データモデル
│   │   └── 02_データモデル設計.md
│   ├── design/                 # 機能設計
│   │   └── 03_機能概要設計.md
│   ├── screens/                # 画面設計
│   │   ├── 04_画面一覧.md
│   │   └── 05_画面詳細設計.md
│   └── mockups/                # 画面モック（HTML）
│       ├── index.html          # モック一覧
│       ├── login.html          # ログイン画面
│       ├── dashboard.html      # ダッシュボード
│       ├── patient-search.html # 患者検索
│       ├── medical-record.html # カルテ記録
│       ├── prescription-order.html # 処方オーダー
│       └── css/common.css      # 共通スタイル
└── backend/                    # バックエンドAPI
    ├── src/
    │   ├── server.js          # Expressサーバー
    │   ├── config/            # 設定ファイル
    │   ├── routes/            # APIルート
    │   ├── middleware/        # ミドルウェア
    │   └── models/            # データモデル
    ├── database/
    │   └── init.sql           # DB初期化スクリプト
    └── tests/                 # テストコード
```

## 🎯 完成した成果物

### 1. 設計ドキュメント（6種類）

✅ **運用イメージ**: システム概要、運用フロー、期待効果  
✅ **データモデル設計**: 37テーブルの詳細定義、ER図、インデックス戦略  
✅ **機能概要設計**: 9つの機能群、システム構成、非機能要件  
✅ **画面一覧**: 76画面の完全一覧、画面遷移図  
✅ **画面詳細設計**: 主要10画面の詳細仕様  
✅ **画面モック**: HTML/CSS による実動作可能なモック（5画面）

### 2. バックエンドAPI（Node.js + Express + PostgreSQL）

✅ **認証API**: ログイン、トークン検証、ロールベースアクセス制御  
✅ **患者管理API**: 検索、登録、更新、詳細取得  
✅ **来院記録API**: 来院登録、履歴取得、本日の来院一覧  
✅ **カルテ記録API**: SOAP形式カルテ作成、署名機能  
✅ **処方オーダーAPI**: 処方作成、履歴取得、薬剤検索

### 3. データベース

✅ **PostgreSQL スキーマ**: 14テーブル（主要機能対応）  
✅ **初期データ**: デモユーザー、患者、薬剤データ  
✅ **インデックス**: パフォーマンス最適化

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- PostgreSQL 14以上

### 1. データベースセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE medical_record_db;

# スキーマ・初期データ投入
\c medical_record_db
\i backend/database/init.sql
```

### 2. バックエンド起動

```bash
cd backend
npm install
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

### 3. 画面モック確認

```bash
# ブラウザで開く
docs/mockups/index.html
```

または直接ログイン画面から:
```bash
docs/mockups/login.html
```

## 📡 API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### 患者管理
- `GET /api/patients/search?patientNumber=000001` - 患者検索
- `GET /api/patients/:patientId` - 患者詳細
- `POST /api/patients` - 患者登録
- `PUT /api/patients/:patientId` - 患者更新

### 来院記録
- `POST /api/visits` - 来院記録作成
- `GET /api/visits/patient/:patientId` - 患者の来院履歴
- `GET /api/visits/today/list` - 本日の来院一覧

### カルテ記録
- `POST /api/medical-records` - カルテ作成
- `POST /api/medical-records/:recordId/sign` - カルテ署名
- `GET /api/medical-records/patient/:patientId` - カルテ一覧

### 処方オーダー
- `POST /api/prescriptions` - 処方オーダー作成
- `GET /api/prescriptions/patient/:patientId` - 処方履歴

## 🔐 デモアカウント

| ユーザー名 | パスワード | ロール |
|-----------|----------|--------|
| doctor | password123 | 医師 |
| nurse | password123 | 看護師 |
| clerk | password123 | 医療事務 |

## 🧪 APIテスト例

### ログイン
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"password123"}'
```

### 患者検索（要認証）
```bash
curl -X GET "http://localhost:3000/api/patients/search?lastNameKana=ヤマダ" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏗️ 技術スタック

### バックエンド
- **Node.js** 18+
- **Express** 4.x - Webフレームワーク
- **PostgreSQL** 14+ - データベース
- **JWT** - 認証
- **bcrypt** - パスワードハッシュ化
- **express-validator** - バリデーション

### フロントエンド（モック）
- **HTML5 / CSS3**
- **レスポンシブデザイン**
- **JavaScript** (Vanilla)

## 📊 データモデルの特徴

- **37テーブル**: 完全な医療情報管理
- **正規化**: 第3正規形まで適用
- **監査証跡**: 全テーブルに作成者・更新者記録
- **論理削除**: 医療データは物理削除せず is_deleted フラグ
- **履歴管理**: カルテは全変更履歴を保存
- **暗号化対応**: 個人情報は暗号化可能な設計

## 🔒 セキュリティ対策

- ✅ JWT認証
- ✅ パスワードハッシュ化（bcrypt, rounds=10）
- ✅ ロールベースアクセス制御（RBAC）
- ✅ SQLインジェクション対策（パラメータ化クエリ）
- ✅ アカウントロック（5回失敗で30分ロック）
- ✅ セッションタイムアウト（24時間）
- ✅ CORS設定

## 📈 非機能要件

### パフォーマンス
- 画面表示応答時間: 2秒以内（目標）
- 同時接続ユーザー数: 100ユーザー以上対応

### 可用性
- 稼働率: 99.9%以上（目標）
- データバックアップ: 日次

### スケーラビリティ
- 水平スケール対応設計
- データベース接続プーリング（max 20接続）

## 🧪 テスト

```bash
cd backend
npm test
```

テストカバレッジレポート生成:
```bash
npm test -- --coverage
```

## 📝 今後の拡張計画

### Phase 2（実装予定）
- フロントエンド（React）
- 検査オーダー機能
- 予約管理機能
- 会計機能

### Phase 3（実装予定）
- 入院管理
- 看護記録
- レセプト作成
- 画像検査（DICOM対応）

### Phase 4（実装予定）
- 患者ポータル
- オンライン診療
- AI診断支援
- 多施設対応

## 📚 ドキュメント

詳細な設計ドキュメントは `docs/` ディレクトリを参照してください。

- [運用イメージ](docs/requirements/01_運用イメージ.md)
- [データモデル設計](docs/models/02_データモデル設計.md)
- [機能概要設計](docs/design/03_機能概要設計.md)
- [画面一覧](docs/screens/04_画面一覧.md)
- [画面詳細設計](docs/screens/05_画面詳細設計.md)
- [画面モック](docs/mockups/README.md)

## 📄 ライセンス

© 2024 Medical System. All rights reserved.

---

**バージョン**: 1.0  
**作成日**: 2024年1月  
**ステータス**: MVP完成（Phase 1）
