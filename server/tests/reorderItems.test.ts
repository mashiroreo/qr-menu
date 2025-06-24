import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Menu Item Reorder API Tests', () => {
  let user: any;
  let store: any;
  let category: any;
  let itemA: any;
  let itemB: any;
  let otherStoreItem: any;

  beforeAll(async () => {
    // テストユーザー & ストア作成（uid = test-user-id）
    user = await prisma.user.upsert({
      where: { publicId: 'test-user-id' },
      update: { email: 'reorder@test.com' },
      create: {
        publicId: 'test-user-id',
        email: 'reorder@test.com',
        role: 'OWNER'
      }
    });

    store = await prisma.store.upsert({
      where: { ownerId: user.id },
      update: { name: 'Reorder Store' },
      create: {
        name: 'Reorder Store',
        ownerId: user.id
      }
    });

    category = await prisma.menuCategory.create({
      data: {
        name: 'Cat',
        storeId: store.id
      }
    });

    itemA = await prisma.menuItem.create({
      data: {
        name: 'Item A',
        price: 100,
        categoryId: category.id,
        storeId: store.id,
        order: 0
      }
    });

    itemB = await prisma.menuItem.create({
      data: {
        name: 'Item B',
        price: 200,
        categoryId: category.id,
        storeId: store.id,
        order: 1
      }
    });

    // 他ストアのアイテム
    const otherUser = await prisma.user.create({
      data: {
        publicId: 'other-user',
        email: 'other@test.com',
        role: 'OWNER'
      }
    });
    const otherStore = await prisma.store.create({
      data: {
        name: 'Other Store',
        ownerId: otherUser.id
      }
    });
    const otherCategory = await prisma.menuCategory.create({
      data: {
        name: 'Other Cat',
        storeId: otherStore.id
      }
    });
    otherStoreItem = await prisma.menuItem.create({
      data: {
        name: 'Other Item',
        price: 300,
        categoryId: otherCategory.id,
        storeId: otherStore.id,
        order: 0
      }
    });
  });

  afterAll(async () => {
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('PUT /api/menu/items/reorder', () => {
    it('should reorder items successfully', async () => {
      const payload = {
        items: [
          { id: itemA.id, order: 1 },
          { id: itemB.id, order: 0 }
        ]
      };

      const res = await request(app)
        .put('/api/menu/items/reorder')
        .set('Authorization', 'Bearer test-token')
        .send(payload);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const updatedA = res.body.find((i: any) => i.id === itemA.id);
      const updatedB = res.body.find((i: any) => i.id === itemB.id);
      expect(updatedA.order).toBe(1);
      expect(updatedB.order).toBe(0);
    });

    it('should fail when including item from another store', async () => {
      const payload = {
        items: [
          { id: itemA.id, order: 1 },
          { id: otherStoreItem.id, order: 0 }
        ]
      };

      const res = await request(app)
        .put('/api/menu/items/reorder')
        .set('Authorization', 'Bearer test-token')
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('should fail with invalid payload', async () => {
      const res = await request(app)
        .put('/api/menu/items/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({ invalid: 'data' });

      expect(res.status).toBe(400);
    });
  });
}); 