# 開発フェーズ手順書

## フェーズ1：準備

### 1. プロジェクトの準備
1. 要件定義の再確認とタスク分解
   - 仕様書の確認
   - 機能のタスク分解
   - 開発順序の決定

2. 開発環境の構築
   - Node.jsのインストール
   - SQLiteのインストール
   - Visual Studio Codeの設定
   - Gitリポジトリの作成

### 2. バックエンドの準備
1. Express.jsの基本設定
   - プロジェクトの初期化
   - 基本的なミドルウェアの設定
   - 動作確認（Hello, world!）

2. SQLiteの設定
   - Prismaのインストール
   - データベースファイルの作成
   - 接続テスト

### 3. フロントエンドの準備
1. React + Viteプロジェクトの作成
   - プロジェクトの初期化
   - 基本的なコンポーネントの作成
   - 動作確認

2. Tailwind CSSの設定
   - インストール
   - 設定ファイルの作成
   - 基本的なスタイルの適用

## フェーズ2：ログイン機能の実装

### 4. バックエンド：認証機能の実装
1. Firebase Admin SDKの設定
   - ミドルウェアの作成
   - トークン検証の実装

2. ユーザー情報管理
   - データベーススキーマの作成
   - ユーザーAPIの実装

### 5. フロントエンド：ログイン画面の実装
1. ログインUIの作成
   - コンポーネントの設計
   - スタイリング

2. Firebase Authenticationの実装
   - ログイン処理
   - トークン管理

### 6. バックエンド：ログインAPIのテスト
1. APIテスト
   - Postmanでの動作確認
   - エラーハンドリングの確認

2. データベース確認
   - ユーザー情報の保存確認
   - データ整合性の確認

## フェーズ3：店舗情報管理機能の実装

### 7. バックエンド：店舗情報APIの実装
1. 店舗情報取得API
   - GET /api/stores/ownerの実装
   - データ取得ロジック

2. 店舗情報更新API
   - PUT /api/stores/ownerの実装
   - バリデーション処理

### 8. フロントエンド：店舗情報管理画面の実装
1. UI作成
   - フォームコンポーネント
   - スタイリング

2. API連携
   - データ取得処理
   - 更新処理

### 9. バックエンド：画像アップロード機能の実装
1. 画像アップロードAPI
   - POST /api/stores/owner/logoの実装
   - ファイルバリデーション

### 10. フロントエンド：画像アップロード機能の実装
1. 画像アップロードUI
   - ファイル選択
   - プレビュー表示

2. API連携
   - アップロード処理
   - エラーハンドリング

## フェーズ4：メニュー管理機能の実装

### 11. バックエンド：メニュー情報APIの実装
1. メニューカテゴリーAPI
   - CRUD処理の実装

2. メニューアイテムAPI
   - CRUD処理の実装

### 12. フロントエンド：メニュー管理画面の実装
1. UI作成
   - カテゴリー管理
   - アイテム管理

2. API連携
   - データ操作処理

## フェーズ5：QRコード表示機能の実装

### 13. バックエンド：QRコード生成機能の実装
1. QRコード生成API
   - 生成ロジック
   - 保存処理

### 14. フロントエンド：QRコード表示画面の実装
1. UI作成
   - QRコード表示
   - ダウンロード機能

## フェーズ6：その他の機能の実装

### 15. バックエンド
1. PostgreSQL移行
   - データベース構築
   - データ移行

### 16. フロントエンド
1. 来店客向けメニュー表示
   - 画面実装
   - スタイリング

2. 管理画面
   - 店舗一覧
   - 店舗編集

## フェーズ7：テストとデプロイ

### 17. テストとデプロイ
1. テスト実施
   - ユニットテスト
   - E2Eテスト
   - ブラウザ互換性テスト

2. デプロイ
   - フロントエンド（Vercel/Netlify）
   - バックエンド（Render.com）

3. CI/CD設定
   - 自動デプロイ
   - テスト自動化

## 補足事項
- 各フェーズ終了時に動作確認を実施
- Gitを活用したバージョン管理
- ドキュメントの随時更新
- 必要に応じてフェーズの順序を調整可能
