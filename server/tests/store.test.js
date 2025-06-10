"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const index_1 = require("../src/index");
const supertest_1 = __importDefault(require("supertest"));
const prisma = new client_1.PrismaClient();
describe('Store API Tests', () => {
    let testUser;
    let testStore;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // テスト用ユーザーの作成
        testUser = yield prisma.user.create({
            data: {
                email: 'test@example.com',
                publicId: 'test-user-id', // Firebase認証のモックと一致させる
                displayName: 'Test User',
                role: 'OWNER'
            }
        });
        // テスト用店舗の作成
        testStore = yield prisma.store.create({
            data: {
                name: 'Test Store',
                description: 'Test Description',
                address: 'Test Address',
                phone: '123-456-7890',
                ownerId: testUser.id
            }
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // テストデータの削除
        yield prisma.store.deleteMany();
        yield prisma.user.deleteMany();
        yield prisma.$disconnect();
    }));
    describe('GET /api/stores/owner', () => {
        it('should return store information for authenticated owner', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .get('/api/stores/owner')
                .set('Authorization', 'Bearer test-token');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Test Store');
            expect(response.body).toHaveProperty('description', 'Test Description');
        }));
        it('should return 401 for unauthenticated requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .get('/api/stores/owner');
            expect(response.status).toBe(401);
        }));
    });
    describe('PUT /api/stores/owner', () => {
        it('should update store information for authenticated owner', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedData = {
                name: 'Updated Store',
                description: 'Updated Description',
                address: 'Updated Address',
                phone: '987-654-3210'
            };
            const response = yield (0, supertest_1.default)(index_1.app)
                .put('/api/stores/owner')
                .set('Authorization', 'Bearer test-token')
                .send(updatedData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Updated Store');
            expect(response.body).toHaveProperty('description', 'Updated Description');
        }));
        it('should return 401 for unauthenticated requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put('/api/stores/owner')
                .send({
                name: 'Updated Store'
            });
            expect(response.status).toBe(401);
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put('/api/stores/owner')
                .set('Authorization', 'Bearer test-token')
                .send({
                name: '' // 空の名前
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('PUT /api/stores/owner/logo', () => {
        it('should update store logo for authenticated owner', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put('/api/stores/owner/logo')
                .set('Authorization', 'Bearer test-token')
                .attach('logo', __dirname + '/dummy-logo.png');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('logoUrl');
        }));
        it('should return 401 for unauthenticated requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put('/api/stores/owner/logo')
                .attach('logo', __dirname + '/dummy-logo.png');
            expect(response.status).toBe(401);
        }));
        it.skip('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            // ファイルアップロード方式では不要なテストのためスキップ
        }));
        it.skip('should validate logo URL format', () => __awaiter(void 0, void 0, void 0, function* () {
            // ファイルアップロード方式では不要なテストのためスキップ
        }));
    });
    describe('Error Handling', () => {
        it('should handle store not found error', () => __awaiter(void 0, void 0, void 0, function* () {
            // テスト用店舗を削除
            yield prisma.store.deleteMany();
            const response = yield (0, supertest_1.default)(index_1.app)
                .get('/api/stores/owner')
                .set('Authorization', 'Bearer test-token');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Store not found');
            // テスト用店舗を再作成
            yield prisma.store.create({
                data: {
                    name: 'Test Store',
                    description: 'Test Description',
                    address: 'Test Address',
                    phone: '123-456-7890',
                    ownerId: testUser.id
                }
            });
        }));
    });
});
