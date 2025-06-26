import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../src/app';

const prisma = new PrismaClient();

// トークン値に応じて firebase モックが UID を返す設定 (config/firebase.ts)
const ADMIN_TOKEN = 'admin-token';
const OWNER_TOKEN = 'owner-token';

describe('User CRUD API (Admin Guard)', () => {
  let adminUser: any;
  let ownerUser: any;
  let targetUser: any; // CRUD 対象

  beforeAll(async () => {
    // 管理者ユーザーを作成
    adminUser = await prisma.user.upsert({
      where: { publicId: 'admin-user-id' },
      update: {
        role: 'ADMIN',
        email: 'admin@example.com',
        displayName: 'Admin User'
      },
      create: {
        publicId: 'admin-user-id',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'ADMIN'
      }
    });

    // 一般ユーザー (OWNER) を作成
    ownerUser = await prisma.user.upsert({
      where: { publicId: 'owner-user-id' },
      update: {
        role: 'OWNER',
        email: 'owner@example.com',
        displayName: 'Owner User'
      },
      create: {
        publicId: 'owner-user-id',
        email: 'owner@example.com',
        displayName: 'Owner User',
        role: 'OWNER'
      }
    });

    // CRUD 対象ユーザー
    targetUser = await prisma.user.upsert({
      where: { publicId: 'target-user-id' },
      update: {
        email: 'target@example.com',
        displayName: 'Target User',
        role: 'OWNER'
      },
      create: {
        publicId: 'target-user-id',
        email: 'target@example.com',
        displayName: 'Target User',
        role: 'OWNER'
      }
    });

    // OWNER 用のストアを作成（adminOnly 判定まで到達させるため）
    await prisma.store.upsert({
      where: { ownerId: ownerUser.id },
      update: { name: 'Owner Store' },
      create: { name: 'Owner Store', ownerId: ownerUser.id }
    });
  });

  afterAll(async () => {
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/users', () => {
    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should forbid non-admin users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${OWNER_TOKEN}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // 確認
      const found = await prisma.user.findUnique({ where: { id: targetUser.id } });
      expect(found).toBeNull();
    });

    it('should forbid deletion by non-admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${ownerUser.id}`)
        .set('Authorization', `Bearer ${OWNER_TOKEN}`);

      expect(res.status).toBe(403);
    });
  });
}); 