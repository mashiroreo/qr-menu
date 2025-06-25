// .env.test を優先的に読み込む
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test'), override: false });

process.env.FIREBASE_PROJECT_ID  = 'test_project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY  = '-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----\n';

// firebase-admin モジュールを完全モックし、テスト環境で外部依存を排除
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    storage: () => ({ bucket: () => ({}) }),
  };
});

jest.mock('firebase-admin/app', () => {
  return {
    initializeApp: jest.fn(),
    cert: jest.fn(),
  };
});

jest.mock('./src/utils/storage', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://dummy/image.png'),
  StorageFolders: {
    QR: 'qr',
    STORE_LOGOS: 'store_logos',
    MENU_IMAGES: 'menu_images'
  }
}));

// QRCode ライブラリをモック化（ファイル出力を回避）
jest.mock('qrcode', () => ({
  toFile: jest.fn().mockResolvedValue(undefined)
}));

// SKIP_PRISMA=1 のときのみ Prisma をモック
if (process.env.SKIP_PRISMA === '1') {
  jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({})),
    Prisma: {},
  }));
}

// Jest では常にテスト用 DB を参照させる（開発用 5432 が混入している場合を上書き）
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('qr_menu_test')) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/qr_menu_test';
} 