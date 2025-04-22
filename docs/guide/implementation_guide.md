# 実装ガイド

## 1. プロジェクト構造

### 1.1 バックエンド構造
```
server/
├── src/
│   ├── config/         # 設定ファイル
│   ├── controllers/    # コントローラー
│   ├── middleware/     # ミドルウェア
│   ├── models/         # データモデル
│   ├── routes/         # ルーティング
│   ├── services/       # ビジネスロジック
│   ├── types/          # 型定義
│   ├── utils/          # ユーティリティ
│   └── app.ts          # アプリケーションエントリーポイント
├── prisma/            # Prisma設定
├── tests/             # テスト
└── package.json
```

### 1.2 フロントエンド構造
```
client/
├── src/
│   ├── components/    # コンポーネント
│   ├── hooks/         # カスタムフック
│   ├── pages/         # ページ
│   ├── services/      # APIサービス
│   ├── store/         # 状態管理
│   ├── types/         # 型定義
│   ├── utils/         # ユーティリティ
│   └── App.tsx        # アプリケーションエントリーポイント
├── public/           # 静的ファイル
└── package.json
```

## 2. 開発環境のセットアップ

### 2.1 バックエンド
```bash
# プロジェクトの初期化
mkdir server
cd server
npm init -y

# 必要なパッケージのインストール
npm install express typescript @types/node @types/express ts-node prisma @prisma/client
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint prettier

# TypeScript設定
npx tsc --init

# Prisma初期化
npx prisma init
```

### 2.2 フロントエンド
```bash
# Viteプロジェクトの作成
npm create vite@latest client -- --template react-ts

# 必要なパッケージのインストール
cd client
npm install @headlessui/react @heroicons/react axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. コーディング規約

### 3.1 命名規則
- ファイル名: kebab-case
- コンポーネント: PascalCase
- 関数/変数: camelCase
- 定数: UPPER_SNAKE_CASE
- インターフェース: PascalCase

### 3.2 インポート順序
1. 外部ライブラリ
2. 内部モジュール
3. 型定義
4. スタイル

### 3.3 コメント
- 複雑なロジックには必ずコメント
- JSDoc形式で関数の説明
- TODOコメントは期限を明記

## 4. テスト方針

### 4.1 バックエンドテスト
```typescript
// テストの例
describe('StoreController', () => {
  it('should create a new store', async () => {
    const storeData = {
      name: 'Test Store',
      description: 'Test Description',
      // ...
    };

    const response = await request(app)
      .post('/api/stores')
      .send(storeData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(storeData.name);
  });
});
```

### 4.2 フロントエンドテスト
```typescript
// テストの例
describe('StoreForm', () => {
  it('should submit store data', async () => {
    render(<StoreForm />);
    
    const nameInput = screen.getByLabelText('店舗名');
    fireEvent.change(nameInput, { target: { value: 'Test Store' } });
    
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockApi.createStore).toHaveBeenCalledWith({
        name: 'Test Store',
        // ...
      });
    });
  });
});
```

## 5. デプロイメント

### 5.1 バックエンド（Render.com）
1. GitHubリポジトリにプッシュ
2. Render.comで新規サービス作成
3. 環境変数の設定
4. デプロイメントの開始

### 5.2 フロントエンド（Vercel）
1. GitHubリポジトリにプッシュ
2. Vercelで新規プロジェクト作成
3. 環境変数の設定
4. デプロイメントの開始

## 6. トラブルシューティング

### 6.1 よくある問題と解決策
1. データベース接続エラー
   - 接続文字列の確認
   - データベースの起動状態確認

2. 認証エラー
   - Firebase設定の確認
   - トークンの有効期限確認

3. ビルドエラー
   - 依存関係の確認
   - TypeScriptの型エラー確認

## 7. パフォーマンス最適化

### 7.1 バックエンド
- キャッシュの活用
- クエリの最適化
- 非同期処理の適切な使用

### 7.2 フロントエンド
- コンポーネントの最適化
- 画像の最適化
- コード分割の活用

## 8. セキュリティ対策

### 8.1 バックエンド
- 入力値のバリデーション
- SQLインジェクション対策
- CORS設定

### 8.2 フロントエンド
- XSS対策
- CSRF対策
- セキュアなCookie設定
