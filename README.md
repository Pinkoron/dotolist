# ToDo アプリ with Next.js & AWS Cognito

## 目的

Next.js でログイン機能付きの実践的な ToDo アプリを開発することで、以下のスキル向上を目指しました。

- 認証（Auth）機能の実装経験を積む
- AWS API（Cognito / DynamoDB）への理解を深める
- Next.js を用いたサービス開発の流れを把握する

## 構成技術

- **フレームワーク**: Next.js
- **認証**: AWS Cognito、Google 認証
- **データベース**: AWS DynamoDB
- **フロントエンドホスティング**: Vercel

## 開発環境

- **エディタ**: Visual Studio Code、Claude Code
- **バージョン管理**: GitHub
- **デプロイ**: Vercel

## 成果まとめ

- ユーザーごとに ToDo を管理できるアプリが完成
- 認証、DB 連携、デプロイまで一通り自力で構築
- 実務に近い形で開発工程を体験できた

## Getting Started

開発サーバーを起動:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで [https://dotolist-wine.vercel.app/](https://dotolist-wine.vercel.app/) にアクセスしてアプリを確認できます。

## Deploy on Vercel

このアプリは Vercel Platform を使用してデプロイされています。

Next.js のデプロイについて詳しくは [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) をご覧ください。
