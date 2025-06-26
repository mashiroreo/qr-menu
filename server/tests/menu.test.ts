import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('Menu API Tests', () => {
  let testUser: any;
  let testStore: any;
  let testCategory: any;
  let testItem: any;

  beforeAll(async () => {
    // Create user & store
    testUser = await prisma.user.create({
      data: {
        email: 'menu@test.com',
        publicId: 'test-user-id',
        displayName: 'Menu Tester',
        role: 'OWNER'
      }
    });
    testStore = await prisma.store.create({
      data: { name: 'Menu Store', ownerId: testUser.id }
    });
    // create category
    testCategory = await prisma.menuCategory.create({
      data: { name: 'Category', storeId: testStore.id }
    });
  });

  afterAll(async () => {
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/menu/items', () => {
    it('should create a menu item', async () => {
      const payload = { name: 'Test Item', price: 500, description: 'Desc', categoryId: testCategory.id, storeId: testStore.id };
      const res = await request(app)
        .post('/api/menu/items')
        .set('Authorization', 'Bearer test-token')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Item');
      testItem = res.body;
    });
  });

  describe('GET /api/menu/items', () => {
    it('should list items for category', async () => {
      const res = await request(app)
        .get(`/api/menu/items?categoryId=${testCategory.id}`)
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/menu/items/:id', () => {
    it('should update item', async () => {
      const res = await request(app)
        .put(`/api/menu/items/${testItem.id}`)
        .set('Authorization', 'Bearer test-token')
        .send({ name: 'Updated', price: 600, description: 'Updated', categoryId: testCategory.id, storeId: testStore.id });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated');
    });
  });

  describe('DELETE /api/menu/items/:id', () => {
    it('should delete item', async () => {
      const res = await request(app)
        .delete(`/api/menu/items/${testItem.id}`)
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(204);
    });
  });

  describe('Public menu', () => {
    it('should return 200 for valid store', async () => {
      const res = await request(app)
        .get(`/api/menu/public?storeId=${testStore.id}`);
      expect(res.status).toBe(200);
    });
    it('should return 404 for invalid store', async () => {
      const res = await request(app)
        .get('/api/menu/public?storeId=999999');
      expect(res.status).toBe(404);
    });
  });
}); 