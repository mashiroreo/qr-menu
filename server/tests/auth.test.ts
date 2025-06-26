import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Auth API Tests', () => {
  let testUser: any;

  beforeAll(async () => {
    // Firebase モックの uid と揃える
    testUser = await prisma.user.upsert({
      where: { publicId: 'test-user-id' },
      update: {
        email: 'auth@test.com',
        displayName: 'Auth Tester',
      },
      create: {
        email: 'auth@test.com',
        publicId: 'test-user-id',
        displayName: 'Auth Tester',
        role: 'OWNER',
      }
    });

    // ユーザーに紐づく店舗が無いとミドルウェアが 404 を返すため、店舗も用意しておく
    await prisma.store.upsert({
      where: { ownerId: testUser.id },
      update: {
        name: 'Auth Store'
      },
      create: {
        name: 'Auth Store',
        ownerId: testUser.id
      }
    });
  });

  afterAll(async () => {
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/auth/me', () => {
    it('should return user info for authenticated request', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'auth@test.com');
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/me', () => {
    it('should update displayName', async () => {
      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', 'Bearer test-token')
        .send({ displayName: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('displayName', 'Updated Name');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', 'Bearer test-token')
        .send({ displayName: '' });

      expect(res.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .put('/api/auth/me')
        .send({ displayName: 'Should fail' });

      expect(res.status).toBe(401);
    });
  });
}); 