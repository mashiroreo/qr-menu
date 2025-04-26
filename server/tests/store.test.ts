import { PrismaClient } from '@prisma/client';
import { app } from '../src/index';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Store API Tests', () => {
  let testUser: any;
  let testStore: any;

  beforeAll(async () => {
    // テスト用ユーザーの作成
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        publicId: 'test-user-id', // Firebase認証のモックと一致させる
        displayName: 'Test User',
        role: 'OWNER'
      }
    });

    // テスト用店舗の作成
    testStore = await prisma.store.create({
      data: {
        name: 'Test Store',
        description: 'Test Description',
        address: 'Test Address',
        phone: '123-456-7890',
        ownerId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // テストデータの削除
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
      const logoUrl = 'https://example.com/logo.png';
      const response = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token')
        .send({ logoUrl });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logoUrl', logoUrl);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .put('/api/stores/owner/logo')
        .send({ logoUrl: 'https://example.com/logo.png' });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should validate logo URL format', async () => {
      const response = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token')
        .send({ logoUrl: 'invalid-url' });

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle store not found error', async () => {
      // テスト用店舗を削除
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