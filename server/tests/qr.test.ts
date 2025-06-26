import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';
import request from 'supertest';

const prisma = new PrismaClient();

describe('QR API Tests', () => {
  beforeAll(() => {
    // QR コントローラが参照する環境変数を設定
    process.env.APP_URL = 'https://example.com';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/qr/generate', () => {
    it('should generate qr code for valid storeId', async () => {
      const res = await request(app)
        .post('/api/qr/generate')
        .send({ storeId: 123 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('url');
      expect(typeof res.body.url).toBe('string');
    });

    it('should return 400 when storeId is missing', async () => {
      const res = await request(app)
        .post('/api/qr/generate')
        .send({});

      expect(res.status).toBe(400);
    });
  });
}); 