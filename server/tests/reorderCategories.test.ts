import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Menu Category Reorder API Tests', () => {
  let user: any;
  let store: any;
  let categoryA: any;
  let categoryB: any;
  let otherStoreCategory: any;

  beforeAll(async () => {
    user = await prisma.user.upsert({
      where: { publicId: 'test-user-id' },
      update: {},
      create: {
        publicId: 'test-user-id',
        email: 'catreorder@test.com',
        role: 'OWNER'
      }
    });

    store = await prisma.store.upsert({
      where: { ownerId: user.id },
      update: { name: 'CatReorder Store' },
      create: { name: 'CatReorder Store', ownerId: user.id }
    });

    categoryA = await prisma.menuCategory.create({
      data: { name: 'Cat A', storeId: store.id, order: 0 }
    });
    categoryB = await prisma.menuCategory.create({
      data: { name: 'Cat B', storeId: store.id, order: 1 }
    });

    // 他ストア
    const otherUser = await prisma.user.create({
      data: { publicId: 'other-user2', email: 'o2@test.com', role: 'OWNER' }
    });
    const otherStore = await prisma.store.create({
      data: { name: 'OtherStore2', ownerId: otherUser.id }
    });
    otherStoreCategory = await prisma.menuCategory.create({
      data: { name: 'Other Cat', storeId: otherStore.id, order: 0 }
    });
  });

  afterAll(async () => {
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('PUT /api/menu/categories/reorder', () => {
    it('should reorder categories successfully', async () => {
      const res = await request(app)
        .put('/api/menu/categories/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({ items: [ { id: categoryA.id, order: 1 }, { id: categoryB.id, order: 0 } ] });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should fail when including category from another store', async () => {
      const res = await request(app)
        .put('/api/menu/categories/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({ items: [ { id: categoryA.id, order: 1 }, { id: otherStoreCategory.id, order: 0 } ] });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid payload', async () => {
      const res = await request(app)
        .put('/api/menu/categories/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({ wrong: 'data' });

      expect(res.status).toBe(400);
    });
  });
}); 