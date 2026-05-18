# 🎮 OTAKU TRACKER

コンテンツ消費モチベーション管理ツール

## セットアップ

### 1. プロジェクトをダウンロード
このフォルダをPCの好きな場所に置く。

### 2. 依存関係インストール
コマンドプロンプトでプロジェクトフォルダに移動して:
```bash
cd otaku-tracker
npm install
```

### 3. ローカルで動作確認
```bash
npm run dev
```
ブラウザで `http://localhost:5173/otaku-tracker/` を開く。

## GitHub Pagesにデプロイ

### 1. GitHubでリポジトリを作成
- GitHub.com で新しいリポジトリを作成
- リポジトリ名は `otaku-tracker` にする（vite.config.jsのbaseパスと一致させる）
- Public にする

### 2. Gitで初期化してプッシュ
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/otaku-tracker.git
git push -u origin main
```
`YOUR_USERNAME` は自分のGitHubユーザー名に変える。

### 3. デプロイ
```bash
npm run deploy
```
これで `gh-pages` ブランチが作成されて、自動でデプロイされる。

### 4. GitHub Pagesを有効化
- リポジトリの Settings → Pages
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`
- Save

数分後に `https://YOUR_USERNAME.github.io/otaku-tracker/` でアクセスできる。

## スマホでアプリっぽく使う

### iPhone
1. Safariでサイトを開く
2. 共有ボタン → 「ホーム画面に追加」

### Android
1. Chromeでサイトを開く
2. メニュー → 「ホーム画面に追加」

PWA対応なので、ホーム画面からアプリみたいに起動できる。

## データについて
- データはブラウザのlocalStorageに保存される
- 同じブラウザ・同じデバイスでのみデータが残る
- ブラウザのデータをクリアするとデータも消える
