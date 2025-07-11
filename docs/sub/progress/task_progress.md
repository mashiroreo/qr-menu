# タスク進捗状況

## フェーズ1：準備

### 1. プロジェクトの準備
- ステータス: ✅完了
- ブランチ: `feature/phase1/project-setup`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - 要件定義の確認
  - 開発環境の構築
  - Gitリポジトリの作成
- 引き継ぎ事項: なし

### 2. バックエンドの準備
- ステータス: ✅完了
- ブランチ: `feature/phase1/backend-setup`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - Express.jsの基本設定
  - SQLiteの設定
  - Prismaのインストール
- 引き継ぎ事項: なし

### 3. フロントエンドの準備
- ステータス: ✅完了
- ブランチ: `feature/phase1/frontend-setup`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - React + Viteプロジェクトの作成
  - Tailwind CSSの設定
- 引き継ぎ事項: なし

## フェーズ2：ログイン機能の実装

### 4. バックエンド：認証機能の実装
- ステータス: ✅完了
- ブランチ: `feature/phase2/auth-backend`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - Firebase Admin SDKの設定
  - ユーザー情報管理の実装
  - 認証ミドルウェアの実装
  - 認証APIの実装
- 引き継ぎ事項: フロントエンドとの連携準備

### 5. フロントエンド：ログイン画面の実装
- ステータス: ✅完了
- ブランチ: `feature/phase2/auth-frontend`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - Firebase Authenticationの設定
  - ログイン画面の実装
  - ユーザー情報の表示・編集機能の実装
  - 認証状態の管理
- 引き継ぎ事項: バックエンドの認証機能と連携

### 6. バックエンド：ログインAPIのテスト
- ステータス: ✅完了
- ブランチ: `feature/phase2/auth-test`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - 認証APIのテストケース作成
  - エラーケースのテスト
  - セキュリティテスト
  - 表示名のバリデーション追加
- 引き継ぎ事項: なし

## フェーズ3：店舗情報管理機能の実装

### 7. バックエンド：店舗情報APIの実装
- ステータス: ✅完了
- ブランチ: `feature/phase3/store-api`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - 店舗情報取得APIの実装
  - 店舗情報更新APIの実装
  - 店舗ロゴ更新APIの実装
  - バリデーション処理の実装
  - APIテストの作成と実行
- 引き継ぎ事項: フロントエンドとの連携準備

### 8. フロントエンド：店舗情報管理画面の実装
- ステータス: ✅完了
- ブランチ: `feature/phase3/store-frontend`
- 開始日: 2024-03-21
- 完了日: 2024-03-21
- 作業内容:
  - 店舗情報フォームコンポーネントの作成
  - 店舗ロゴアップロードコンポーネントの作成
  - 店舗情報管理ページの作成
  - APIとの連携実装
  - エラーハンドリングの実装
  - ローディング状態の実装
- 引き継ぎ事項: 画像アップロード機能の実装が必要 

## 2025-04-26: QR機能再実装

- ステータス: ✅完了
- ブランチ: feature/phase5/qr-feature
- 開始日: 2025-04-26
- 完了日: 2025-04-27
- 作業内容:
  1. QRコード生成API・ルーティングの実装
  2. QRコード画像の保存・配信処理の実装
  3. フロントエンド：QRコード生成・表示・ダウンロード・プレビュー機能の実装
  4. QRコードから遷移した先で店舗・メニュー情報を表示するページのデザイン刷新（カテゴリサイドバー・カード型グリッド・ダーク系デザイン）
  5. 管理画面・プロフィール・QRコード生成ページのレイアウト調整（左寄せ化・不要項目削除）
  6. 動作確認＆こまめにコミット・プッシュ
- 引き継ぎ事項:
  - 次フェーズ6「来店客向けメニュー表示・管理画面拡張」へ進行
  - 必要に応じてUI/UX改善・バグ修正を随時対応 

## QRコード画像のCloud Storage対応

**ステータス**: ✅完了
**ブランチ**: feature/qr-cloud-storage
**完了日**: 2024-04-29

### 作業内容
- Firebase Cloud Storageのセットアップ完了
- テストモードでストレージを設定（2025年5月29日まで有効）
- QRコード画像の保存先をCloud Storageに変更
- バケット名の設定を修正し、正常動作を確認

### 次のタスクへの引き継ぎ事項
- テストモードの期限（2025年5月29日）までに本番環境用のセキュリティルールを設定する必要あり
- 現在はすべてのユーザーが読み書き可能な状態
- 本番環境移行前にセキュリティルールの見直しが必要 

# タスク進捗記録

## 2024-03-26
### 🔄 Firebase Cloud Storage設定
- ブランチ: `feature/phase6/qr-storage`
- 作業内容:
  - Firebase Cloud Storage バケットの初期化
  - 環境変数の設定（FIREBASE_STORAGE_BUCKET）
  - QRコード画像のアップロード機能実装
- 次のステップ:
  - 環境変数の設定確認
  - QRコード生成機能の動作確認
  - フロントエンド側の修正（URLの表示・ダウンロード） 

## QRコード機能実装

### ✅ Firebase Cloud Storage移行
- ブランチ: `feature/phase5/qr-feature`
- 完了日: 2024-03-19
- 作業内容:
  - QRコード画像の保存先をローカルファイルシステムからFirebase Cloud Storageに移行
  - 画像のアップロード・ダウンロード機能の実装
  - 署名付きURLを使用した安全なアクセス制御
- 結果:
  - QRコードの生成・保存が正常に動作
  - ダウンロード機能も問題なく動作
  - Cloud Storageの設定（ルール、権限）も適切に完了 

## フェーズ6：来店客向けメニュー表示・管理画面拡張

### ✅ フェーズ6完了
- ステータス: ✅完了
- ブランチ: `feature/phase5/qr-feature`
- 完了日: 2024-03-19
- 作業内容:
  1. QRコード画像のCloud Storage移行
     - Firebase Cloud Storageの設定
     - 画像のアップロード・ダウンロード機能の実装
     - セキュリティ設定の適用
  2. 来店客向けメニュー表示の改善
     - カテゴリサイドバーの実装
     - レスポンシブデザインの強化
     - UI/UXの全体的な改善
  3. 管理画面の拡張
     - QRコード生成・管理機能の追加
     - レイアウトの最適化
     - ユーザビリティの向上
- 成果:
  - Cloud Storageへの移行が完了し、QRコードの生成・保存が安定して動作
  - 来店客向けメニュー表示が使いやすく改善
  - 管理画面の機能が拡張され、より効率的な運用が可能に
- 次フェーズへの引き継ぎ事項:
  - Cloud Storageのセキュリティルールの見直し（テストモード期限：2025年5月29日）
  - 必要に応じたUI/UXの継続的な改善
  - 本番環境移行時の注意点の整理 

## CORS設定とユーザー認証の修正
- ステータス: ✅完了
- ブランチ: feature/phase5/qr-feature
- 完了日: 2024-03-26
- 作業内容:
  1. サーバー側のCORS設定を修正
    - クレデンシャルを許可
    - 特定のオリジン（localhost:5173, 192.168.1.50:5173）からのアクセスを許可
  2. 認証ルートの追加と修正
    - `/api/auth`ルートを追加
    - UserProfileコンポーネントでAxiosインスタンスを使用するように修正
  3. クライアント-サーバー間の認証フローを改善

## 次のタスクへの引き継ぎ事項
- 認証関連のエラーハンドリングの強化が必要かもしれません
- 他のコンポーネントでも同様のAxiosインスタンスの使用を検討してください
- 環境変数の管理とセキュリティの観点から、定期的な見直しを推奨します 

## メニューアイテムの並び替え機能実装
- ステータス: ✅完了
- ブランチ: feature/phase5/qr-feature
- 開始日: 2024-03-02
- 完了日: 2024-03-02
- 作業内容:
  1. サーバーサイド実装
     - `/items/reorder` エンドポイントの実装
     - バリデーションとエラーハンドリングの追加
     - トランザクションを使用した一括更新
  2. クライアントサイド実装
     - `@dnd-kit` を使用したドラッグ＆ドロップ機能
     - 並び替えデータの送信処理
     - UI/UXの最適化（アニメーション、視覚的フィードバック）
  3. デバッグと改善
     - エラーハンドリングの強化
     - パフォーマンス最適化
     - 操作性の向上

## メニューアイテムのドラッグ＆ドロップ改善
- ステータス: ✅完了
- ブランチ: feature/phase5/qr-feature
- 完了日: 2024-03-02
- 作業内容:
  1. アニメーションの最適化
     - トランジション時間を短縮（200ms → 100ms）
     - イージング関数をease-outに変更
     - 視覚効果を調整（半透明効果の削除、シャドウとスケールの最適化）
  2. 操作性の向上
     - ドラッグ開始の閾値設定（8ピクセル）
     - タッチ操作の最適化
     - 画像のドラッグ無効化

## 次のタスク
- QRコード機能の実装
- メニュー表示の最適化
- テストの追加

# タスク進捗管理

## 現在のタスク

### 🔄 メニュー表示機能の改善
- ブランチ: `feature/phase2/enhance-menu-display`
- 開始日: 2024-03-21
- 作業内容:
  - メニュー表示のUIの改善
  - 画像表示の最適化
  - レスポンシブデザインの強化

## 完了したタスク

### ✅ Cloud Storage移行
- ブランチ: `feature/phase2/cloud-storage-migration`
- 完了日: 2024-03-21
- 作業内容:
  - 画像保存をCloud Storageに移行
  - 古いアップロードパスの参照を削除
  - 不要なuploadsディレクトリの削除

## 次のタスク候補

1. メニュー説明文の表示改善
   - フォントサイズと行間の最適化
   - 長文対応の改善
   - 折り畳み機能の追加

2. パフォーマンス最適化
   - 画像の遅延読み込み
   - キャッシュ戦略の実装
   - ページ読み込み速度の改善

3. UI/UXの改善
   - アニメーションの追加
   - タッチジェスチャーの実装
   - アクセシビリティの向上 

## タスク: 画像未登録時のメニューカードレイアウト修正
- ステータス: 🔄進行中 → ✅完了
- ブランチ名: fix/menu-image-placeholder
- 開始日: （作業開始日を記入）
- 完了日: （本日の日付を記入）
- 作業内容: 画像未登録時でもカードレイアウトが崩れないよう、ダミー画像領域（No Image）を表示するように修正。CSSも調整。
- 次のタスクへの引き継ぎ事項: PR作成・レビュー・マージ 

## 2025-06-15
### ✅ TypeScript / ESLint エラー解消（Phase2 step2）
- ステータス: ✅完了
- ブランチ: `fix/phase2/ts-errors-step2`
- 開始日: 2025-06-15
- 完了日: 2025-06-15
- 作業内容:
  - ESLint残りの警告・エラーを解消（no-explicit-any, no-unused-vars, react-hooks/exhaustive-deps）
  - MenuItemListをuseCallbackでリファクタリング
  - 不要なimport・変数を削除
  - 型安全性を向上させるためany→適切な型へ置換
  - 実動作テスト（npm run dev）で問題ないことを確認
- 引き継ぎ事項:
  - 今後の機能追加時も ESLint / TypeScript のルールを遵守 

### 🔄 StoreForm リファクタリング開始（Phase3）
- ブランチ: `feature/phase3/store-form-refactor`
- 開始日: 2025-06-15
- ステータス: 🔄進行中
- 作業内容:
  - StoreForm.tsx の型付け・コード整理
  - any の除去、コンポーネント分割を検討
  - ESLint 無効化コメントの撤廃を目指す
- 次のタスク:
  - 段階的にモジュール分割し動作を確認しながら修正 

### ✅ Vercel CORS ドメイン追加（Phase3）
- ステータス: ✅完了
- ブランチ: `fix/phase3/cors-vercel-domain`
- 完了日: 2025-06-15
- 作業内容:
  - Express の CORS ホワイトリストに `https://q-menu-iota.vercel.app` を追加
  - Render 側で自動デプロイを確認
  - `curl` によるヘルスチェックで `Access-Control-Allow-Origin` ヘッダーが正しく返ることを検証
- 次のタスクへの引き継ぎ事項:
  - フロントエンドから実際の API 呼び出しをテストし、ブラウザで CORS エラーが解消されたことを確認する
  - 本番ドメインを追加する場合はホワイトリストを更新すること 

| ✅ | chore/phase3/firebase-storage-prod | 2025-06-19 | Firebase Storage 本番ルール設定 & 鍵の環境変数化 | Sentry 導入 |
| 🔄 | feature/phase3/observability-setup | 2025-06-19 | Sentry 導入＋DB dump cron | Onboarding 資料ドラフト |

| ✅ | feature/phase3/observability-setup | 2025-06-19 | Sentry 導入＋DB dump cron | Onboarding 資料ドラフト |


## 2025-06-23: モバイルレイアウト改善＆モーダル調整
- ステータス: 🔄進行中
- ブランチ: `fix/phase3/mobile-layout-modal`
- 開始日: 2025-06-23
- 作業内容:
  - カード幅 `width` プロパティをメディアクエリで上書き（900px:160px, 600px:140px）
  - モーダル見出しの余白調整（padding-bottom 9px, margin-bottom 7px）
  - `<hr>` のマージンを `0 0 7px` に変更
- 次のタスクへの引き継ぎ事項: デザイン確認後、追加フィードバックに応じて微調整予定

## 2025-06-24
### ✅ Frontend: MenuItemList テスト拡充
- ブランチ: `test/phase3/frontend-menu-item-list`
- 開始日: 2025-06-24
- 完了日: 2025-06-24
- 作業内容:
  - `MenuItemList.test.tsx` に編集ボタン( onEdit )・削除ボタン( API 呼び出し )のテストケースを追加
  - `identity-obj-proxy` 対応済みの Jest 設定で実行確認
  - 全テストグリーン・ESLint エラーなしを確認
- 引き継ぎ事項:
  - 他コンポーネント (QRCodeGenerator 等) のテスト拡張を順次実施予定

### ✅ Frontend: QRCodeGenerator テスト追加
- ブランチ: `test/phase3/frontend-qrcode-generator`
- 開始日: 2025-06-24
- 完了日: 2025-06-24
- 作業内容:
  - `QRCodeGenerator.test.tsx` を実装し、店舗ID取得・QR生成フローとエラーハンドリングを検証
  - import.meta.env 依存を排除し `process.env` ベースにリファクタリング
  - Vite 設定で `define` を追加して本番ビルド時に環境変数を埋め込み
  - Babel & Jest 設定を Babel 1 本化し、全テストグリーンを確認
- 引き継ぎ事項:
  - 他コンポーネント（StoreForm など）への env 参照方式統一を検討

### 🔄 Frontend: GitHub Actions CI 追加
- ブランチ: `ci/phase3/frontend`
- 開始日: 2025-06-24
- ステータス: 🔄進行中
- 作業内容:
  - `.github/workflows/frontend-ci.yml` に lint & test 実行フローを追加

 test/phase3/backend-storage
### 🔄 Frontend: StoreForm バリデーションテスト追加
- ブランチ: `test/phase3/frontend-store-form`
- 開始日: 2025-06-25
- 作業内容:
  - 電話番号必須＆形式エラーを検証（skip 解除）
  - 更新 API が正しい payload で呼ばれることを確認
  - msw で store API をモック
- 次タスクへの引き継ぎ事項:
  - BusinessHoursInput などサブフォームのテスト（P1）

### 🔄 Backend: utils/storage テスト追加
- ブランチ: `test/phase3/backend-storage`
- 開始日: 2025-06-25
- 作業内容:
  - `getSignedUrl` 正常系
  - MIME/type バリデーションで 400 を返すエラー系
  - Supertest でエンドポイント `/api/stores/owner/logo` をモック付きで検証
- 次タスクへの引き継ぎ事項:
  - その他アップロードエンドポイント共通化テスト

## 2025-06-25
### 🔄 Frontend: Login → Navigation ガードテスト
- ブランチ: `test/phase3/frontend-auth-nav`
- 開始日: 2025-06-25
- 作業内容:
  - 未ログイン時 `/login` へリダイレクト
  - ログイン後 `/menu-management` へ遷移をテスト
  - `MemoryRouter` と `AuthContext` をモックして状態分岐を検証
- 次のタスクへの引き継ぎ事項:
  - Navigation コンポーネントのルートガード実装箇所のリファクタ余地確認

### 🔄 Frontend: MenuManagement テスト追加
- ブランチ: `test/phase3/frontend-menu-management`
- 開始日: 2025-06-25
- 作業内容:
  - CSV インポート成功時にカテゴリ・アイテムが描画される
  - ドラッグ＆ドロップ並び替えで reorder API が呼び出される
  - `msw` を用いた API モック
- 次のタスクへの引き継ぎ事項:
  - Drag-and-Drop の失敗系テスト（P1）

## 2025-06-26
### 🔄 Backend: User CRUD テスト追加
- ブランチ: `test/phase3/backend-user-tests`
- 開始日: 2025-06-26
- ステータス: 🔄進行中
- 作業内容:
  - `/api/users` CRUD エンドポイントの正常系 / 異常系テスト (ADMIN ガード)
  - Supertest & Jest を用いた統合テスト
  - テスト用 Prisma seed で管理者 & 一般ユーザーを作成
- 次のタスクへの引き継ぎ事項:
  - User ロール別ガードのユニットテスト拡充

🔄進行中
ブランチ: feature/phase1/dockerfile
開始日: 2025-07-06
作業内容: server Dockerfile 作成 & ローカルビルドテスト

🔄進行中
ブランチ: feature/phase1/infra-bootstrap
開始日: 2025-07-06
作業内容: Terraform backend/provider 作成

🔄進行中
ブランチ: feature/phase1/cloud-sql
開始日: 2025-07-06
作業内容: Cloud SQL インスタンス + Secret Manager 定義

🔄進行中
ブランチ: feature/phase2/run-deploy
開始日: 2025-07-06
作業内容: Artifact Registry, Cloud Run, Cloud Build トリガー定義

## 2025-07-12
### 🔄 Cloud SQL PG16 Edition/Tier fix
- ブランチ: `feature/phase3/cloudsql-fix`
- 開始日: 2025-07-12
- ステータス: 🔄進行中
- 作業内容:
  - Cloud SQL インスタンスの edition/tier 設定を PG16 に対応させる
  - google-beta provider 追加 または tier をカスタムへ変更
  - Secret Manager の DATABASE_URL を自動生成
- 次のタスク:
  - terraform apply 完了後にパイプライン接続を確認

### ✅ Cloud SQL PG16 Edition/Tier fix
- ブランチ: `feature/phase3/cloudsql-fix`
- 開始日: 2025-07-12
- 完了日: 2025-07-12
- ステータス: ✅完了
- 作業内容:
  - Cloud SQL インスタンス edition/tier 修正（db-custom-1-3840）
  - terraform apply & push → PR マージ
- 次のタスクへの引き継ぎ事項:
  - Cloud Build パイプラインで Cloud Run デプロイを確認

### 🔄 Cloud Run パイプライン整備
- ブランチ: `feature/phase3/cloudrun-pipeline`
- 開始日: 2025-07-12
- ステータス: 🔄進行中
- 作業内容:
  - cloudbuild.yaml に Cloud Run デプロイ step を追加
  - --update-secrets, --add-cloudsql-instances で接続設定
  - Cloud Build トリガー作成 (main ブランチ)
- 次のタスク:
  - テストデプロイ後に動作確認し PR 作成

### 🔄 Cloud Build トリガー作成
- ブランチ: `feature/phase3/cloudbuild-trigger`
- 開始日: 2025-07-12
- ステータス: 🔄進行中
- 作業内容:
  - github push trigger (main) 定義 (google_cloudbuild_trigger)
  - cloudbuild.yaml を参照し _REGION 変数を置換
  - Terraform で適用予定
- 次のタスク:
  - terraform apply 後 push テスト

### 🔄 Cloud SQL Tier (Enterprise Plus) 修正
- ブランチ: `fix/phase3/cloudsql-tier-plus`
- 開始日: 2025-07-12
- ステータス: 🔄進行中
- 作業内容:
  - PG16 Enterprise Plus でサポートされるプリセット tier へ変更
  - terraform validate/plan 実行予定
- 次のタスク:
  - terraform apply 後再度デプロイ確認

### 🔄 Cloud Build Trigger location 修正
- ブランチ: `fix/phase3/cloudbuild-trigger-location`
- 開始日: 2025-07-12
- ステータス: 🔄進行中
- 作業内容:
  - Trigger resource に `location = "asia-northeast1"` を追加
- 次のタスク:
  - terraform apply で作成確認

