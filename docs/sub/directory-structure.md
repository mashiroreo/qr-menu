# プロジェクトディレクトリ構造

## 1. バックエンド構造

```
server/
├── src/
│   ├── config/         # 設定ファイル
│   │   ├── database.ts # データベース設定
│   │   ├── firebase.ts # Firebase設定
│   │   └── app.ts      # アプリケーション設定
│   │
│   ├── controllers/    # コントローラー
│   │   ├── auth.ts     # 認証関連
│   │   ├── store.ts    # 店舗関連
│   │   └── menu.ts     # メニュー関連
│   │
│   ├── middleware/     # ミドルウェア
│   │   ├── auth.ts     # 認証ミドルウェア
│   │   └── error.ts    # エラーハンドリング
│   │
│   ├── models/         # データモデル
│   │   ├── user.ts     # ユーザーモデル
│   │   ├── store.ts    # 店舗モデル
│   │   └── menu.ts     # メニューモデル
│   │
│   ├── routes/         # ルーティング
│   │   ├── auth.ts     # 認証ルート
│   │   ├── store.ts    # 店舗ルート
│   │   └── menu.ts     # メニュールート
│   │
│   ├── services/       # ビジネスロジック
│   │   ├── auth.ts     # 認証サービス
│   │   ├── store.ts    # 店舗サービス
│   │   └── menu.ts     # メニューサービス
│   │
│   ├── types/          # 型定義
│   │   ├── user.ts     # ユーザー型
│   │   ├── store.ts    # 店舗型
│   │   └── menu.ts     # メニュー型
│   │
│   ├── utils/          # ユーティリティ
│   │   ├── logger.ts   # ロギング
│   │   └── validator.ts # バリデーション
│   │
│   └── app.ts          # アプリケーションエントリーポイント
│
├── prisma/            # Prisma設定
│   ├── schema.prisma  # データベーススキーマ
│   └── migrations/    # マイグレーションファイル
│
├── tests/             # テスト
│   ├── controllers/   # コントローラーテスト
│   ├── services/      # サービステスト
│   └── utils/         # ユーティリティテスト
│
└── package.json       # パッケージ設定
```

## 2. フロントエンド構造

```
client/
├── src/
│   ├── components/    # コンポーネント
│   │   ├── common/    # 共通コンポーネント
│   │   ├── auth/      # 認証コンポーネント
│   │   ├── store/     # 店舗コンポーネント
│   │   └── menu/      # メニューコンポーネント
│   │
│   ├── hooks/         # カスタムフック
│   │   ├── useAuth.ts # 認証フック
│   │   ├── useStore.ts # 店舗フック
│   │   └── useMenu.ts # メニューフック
│   │
│   ├── pages/         # ページ
│   │   ├── auth/      # 認証ページ
│   │   ├── store/     # 店舗ページ
│   │   └── menu/      # メニューページ
│   │
│   ├── services/      # APIサービス
│   │   ├── auth.ts    # 認証API
│   │   ├── store.ts   # 店舗API
│   │   └── menu.ts    # メニューAPI
│   │
│   ├── store/         # 状態管理
│   │   ├── auth.ts    # 認証ストア
│   │   ├── store.ts   # 店舗ストア
│   │   └── menu.ts    # メニューストア
│   │
│   ├── types/         # 型定義
│   │   ├── user.ts    # ユーザー型
│   │   ├── store.ts   # 店舗型
│   │   └── menu.ts    # メニュー型
│   │
│   ├── utils/         # ユーティリティ
│   │   ├── api.ts     # APIユーティリティ
│   │   └── validation.ts # バリデーション
│   │
│   └── App.tsx        # アプリケーションエントリーポイント
│
├── public/           # 静的ファイル
│   ├── images/      # 画像
│   └── favicon.ico  # ファビコン
│
└── package.json     # パッケージ設定
```

## 3. 設定ファイルの説明

### 3.1 バックエンド設定
- `database.ts`: データベース接続設定
- `firebase.ts`: Firebase認証・ストレージ設定
- `app.ts`: アプリケーション設定（ミドルウェア、ルーティングなど）

### 3.2 フロントエンド設定
- `vite.config.ts`: Vite設定
- `tailwind.config.js`: Tailwind CSS設定
- `tsconfig.json`: TypeScript設定

## 4. 環境変数

### 4.1 バックエンド
```
DATABASE_URL=postgresql://user:password@localhost:5432/db
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 4.2 フロントエンド
```
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```
