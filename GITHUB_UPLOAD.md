# 🚚 GitHubへのアップロード手順

## 📤 GitHubへアップロードする手順

### 方法1: GitHub Web UIで作成（推奨）

1. **GitHubでリポジトリを作成**
   - https://github.com/new にアクセス
   - リポジトリ名: 任意（例: `medical-system`）
   - 説明: `医療カルテシステム - 設計・モックアップ・実装完備`
   - Public または Private を選択
   - **"Initialize this repository with a README" はチェックしない**
   - "Create repository" をクリック

2. **ローカルからプッシュ**
   ```bash
   cd C:\Users\user\gh\new_calte2
   
   # リモートリポジトリを追加（YOUR_USERNAMEを実際のユーザー名に置き換え）
   git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
   
   # ブランチ名をmainに変更
   git branch -M main
   
   # プッシュ
   git push -u origin main
   ```

3. **認証**
   - ユーザー名を入力
   - パスワードには**Personal Access Token**を使用
   - Token作成: https://github.com/settings/tokens

### 方法2: GitHub CLIを使用（オプション）

GitHub CLIをインストールしている場合：

```bash
# GitHub CLIインストール（未インストールの場合）
winget install GitHub.cli

# 認証
gh auth login

# リポジトリ作成とプッシュ
cd C:\Users\user\gh\new_calte2
gh repo create medical-system --public --source=. --description "医療カルテシステム" --push
```

## 🔐 Personal Access Tokenの作成方法

1. https://github.com/settings/tokens にアクセス
2. "Generate new token" → "Generate new token (classic)" をクリック
3. Note: `medical-system`
4. スコープ:
   - ✅ repo (全て)
   - ✅ workflow
5. "Generate token" をクリック
6. **トークンをコピー**（後で確認できません）
7. git push時のパスワードとして使用

## ✅ 確認

アップロード後、以下を確認してください：

```bash
# リモートリポジトリ確認
git remote -v

# プッシュ確認
git log --oneline -1
```
