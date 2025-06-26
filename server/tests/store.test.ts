import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Store API Tests', () => {
  let testUser: any;
  let testStore: any;

  beforeAll(async () => {
    // テスト用ユーザーを upsert で用意（既に存在していれば取得）
    testUser = await prisma.user.upsert({
      where: { publicId: 'test-user-id' },
      update: {
        email: 'test@example.com',
        displayName: 'Test User',
      },
      create: {
        email: 'test@example.com',
        publicId: 'test-user-id',
        displayName: 'Test User',
        role: 'OWNER'
      }
    });

    // テスト用店舗を upsert で用意（ユーザーに店舗が無い場合のみ作成）
    testStore = await prisma.store.upsert({
      where: { ownerId: testUser.id },
      update: {
        name: 'Test Store',
        description: 'Test Description',
        address: 'Test Address',
        phone: '123-456-7890'
      },
      create: {
        name: 'Test Store',
        description: 'Test Description',
        address: 'Test Address',
        phone: '123-456-7890',
        ownerId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // 関連するメニューアイテム・カテゴリーを削除してから店舗を削除（外部キー制約対策）
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/stores/owner', () => {
    it('should return store information for authenticated owner', async () => {
      const response = await request(app)
        .get('/api/stores/owner')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Store');
      expect(response.body).toHaveProperty('description', 'Test Description');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/stores/owner');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/stores/owner', () => {
    it('should update store information for authenticated owner', async () => {
      const updatedData = {
        name: 'Updated Store',
        description: 'Updated Description',
        address: 'Updated Address',
        phone: '987-654-3210'
      };

      const response = await request(app)
        .put('/api/stores/owner')
        .set('Authorization', 'Bearer test-token')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Store');
      expect(response.body).toHaveProperty('description', 'Updated Description');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .put('/api/stores/owner')
        .send({
          name: 'Updated Store'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .put('/api/stores/owner')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: '' // 空の名前
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/stores/owner/logo', () => {
    it('should update store logo for authenticated owner', async () => {
      const response = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token')
        .attach('logo', __dirname + '/dummy-logo.png');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logoUrl');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .put('/api/stores/owner/logo');
      expect(response.status).toBe(401);
    });

    it.skip('should validate required fields', async () => {
      // ファイルアップロード方式では不要なテストのためスキップ
    });

    it.skip('should validate logo URL format', async () => {
      // ファイルアップロード方式では不要なテストのためスキップ
    });
  });

  describe('Error Handling', () => {
    it('should handle store not found error', async () => {
      // 関連エンティティ含めて削除
      await prisma.menuItem.deleteMany();
      await prisma.menuCategory.deleteMany();
      await prisma.store.deleteMany();

      const response = await request(app)
        .get('/api/stores/owner')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Store not found');

      // テスト用店舗を再作成
      await prisma.store.create({
        data: {
          name: 'Test Store',
          description: 'Test Description',
          address: 'Test Address',
          phone: '123-456-7890',
          ownerId: testUser.id
        }
      });
    });
  });
}); 