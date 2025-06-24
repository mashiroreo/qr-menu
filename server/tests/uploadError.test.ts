import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';
import path from 'path';

// uploadImage をエラー返しにモック
jest.mock('../src/utils/storage', () => {
  const original = jest.requireActual('../src/utils/storage');
  return {
    ...original,
    uploadImage: jest.fn().mockRejectedValue(new Error('upload failed'))
  };
});

const prisma = new PrismaClient();

describe('Cloud Storage Upload Error Handling', () => {
  let user: any;
  let store: any;
  let category: any;
  let item: any;

  beforeAll(async () => {
    // ユーザー & ストア
    user = await prisma.user.upsert({
      where: { publicId: 'test-user-id' },
      update: {},
      create: {
        publicId: 'test-user-id',
        email: 'upload@test.com',
        role: 'OWNER'
      }
    });
    store = await prisma.store.upsert({
      where: { ownerId: user.id },
      update: { name: 'Upload Store' },
      create: { name: 'Upload Store', ownerId: user.id }
    });
    category = await prisma.menuCategory.create({
      data: { name: 'Cat', storeId: store.id }
    });
    item = await prisma.menuItem.create({
      data: {
        name: 'Item',
        price: 100,
        categoryId: category.id,
        storeId: store.id,
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

  describe('Store logo upload error', () => {
    const logoPath = path.join(__dirname, 'dummy-logo.png');

    it('should return 500 when uploadImage throws', async () => {
      const res = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token')
        .attach('logo', logoPath);
      expect(res.status).toBe(500);
    });

    it('should return 400 when no file attached', async () => {
      const res = await request(app)
        .put('/api/stores/owner/logo')
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
    });
  });

  describe('Menu item image upload error', () => {
    const imgPath = path.join(__dirname, 'dummy-logo.png');

    it('should return 500 when uploadImage throws', async () => {
      const res = await request(app)
        .put(`/api/menu/items/${item.id}/image`)
        .set('Authorization', 'Bearer test-token')
        .attach('image', imgPath);
      expect(res.status).toBe(500);
    });

    it('should return 400 when no file attached', async () => {
      const res = await request(app)
        .put(`/api/menu/items/${item.id}/image`)
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
    });
  });
}); 