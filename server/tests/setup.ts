import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テスト実行前のグローバルセットアップ
beforeAll(async () => {
  // テストデータベースの接続確認
  await prisma.$connect();
});

// テスト実行後のグローバルクリーンアップ
afterAll(async () => {
  await prisma.$disconnect();
}); 