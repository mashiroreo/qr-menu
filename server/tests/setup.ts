import { PrismaClient } from '@prisma/client';

// SKIP_PRISMA=1 のときは Prisma 接続をスキップ
if (process.env.SKIP_PRISMA !== '1') {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
} 