# トラブルシューティング

## 記録フォーマット

```markdown
## [日付] 問題のタイトル
- **発生タスク**: [タスク番号とタイトル]
- **発生環境**: [OS/Node.jsバージョンなど]
- **問題の詳細**: 
  - エラーメッセージ
  - 発生状況
  - 再現手順
- **原因**: 
- **解決方法**:
- **予防策**:
- **参考リンク**:
```

## トラブル記録

### 2024-03-XX 問題のタイトル
- **発生タスク**: 1.2 開発環境の構築
- **発生環境**: macOS 24.4.0 / Node.js v20.11.1
- **問題の詳細**: 
  - エラー: `Error: EACCES: permission denied`
  - 状況: npm install実行時に発生
  - 再現手順: 通常のnpm install実行
- **原因**: グローバルインストールの権限不足
- **解決方法**: `sudo npm install -g`で実行
- **予防策**: nvmを使用してユーザー権限でインストール
- **参考リンク**: [Node.js公式ドキュメント](https://nodejs.org/ja/docs/)

### 2024-03-22 フロントエンド依存関係の不足
- **発生タスク**: 8. フロントエンド：店舗情報管理画面の実装
- **発生環境**: macOS 24.4.0 / Node.js v20.11.1
- **問題の詳細**: 
  - エラー1: `Failed to resolve import "react-router-dom" from "src/App.tsx"`
  - エラー2: `Failed to resolve import "@mui/material" from "src/pages/MenuManagement.tsx"`
  - 状況: フロントエンド開発サーバー起動時に発生
  - 再現手順: `npm run dev`実行時

- **原因**: 
  - 必要な依存関係（react-router-domとMUI関連パッケージ）が`package.json`に含まれていなかった

- **解決方法**:
  1. react-router-domのインストール:
     ```bash
     npm install react-router-dom
     ```
  2. MUI関連パッケージのインストール:
     ```bash
     npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
     ```
  3. 開発サーバーの再起動

- **予防策**: 
  - プロジェクト初期設定時に必要な依存関係のチェックリストを作成
  - `package.json`に主要な依存関係を事前に記載

- **参考リンク**: 
  - [React Router Documentation](https://reactrouter.com/)
  - [MUI Installation Guide](https://mui.com/material-ui/getting-started/installation/)

## 画像アップロード関連

### Cloud Storage移行時の画像パス参照エラー
- 発生タスク: Cloud Storage移行
- 発生環境: 
  - OS: macOS 24.4.0
  - Node.js: v18.x
- 問題の詳細:
  - 画像URLの参照が`/uploads`パスを使用していた古い実装が残っていた
  - フロントエンドで画像が表示されない問題が発生
- 原因:
  - 画像パスの参照方法が統一されていなかった
  - Cloud StorageのURLとローカルパスが混在
- 解決方法:
  - すべての画像参照をCloud Storage URLに統一
  - 不要な`/uploads`ディレクトリの参照を削除
- 予防策:
  - 画像URLの取得を統一されたユーティリティ関数経由に変更
  - 環境変数での設定管理の徹底
- 参考リンク:
  - [Cloud Storage ドキュメント](https://cloud.google.com/storage/docs)

## パフォーマンス関連

### 画像読み込み時のパフォーマンス低下
- 発生タスク: メニュー表示機能
- 問題の詳細:
  - 多数の画像を同時に読み込む際にパフォーマンスが低下
  - モバイル端末での表示が特に遅い
- 解決方法:
  - 画像の遅延読み込み（Lazy Loading）の実装
  - 画像サイズの最適化
- 予防策:
  - パフォーマンスモニタリングの導入
  - 定期的なパフォーマンステストの実施

--- 