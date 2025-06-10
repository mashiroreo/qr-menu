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
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const client_1 = require("@prisma/client");
 fix/ts-build-config
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const prisma = new client_1.PrismaClient();
const adminAuth = firebase_admin_1.default.auth();

(0, globals_1.describe)("認証APIのテスト", () => {
    let testUserToken;
    let testUserId;
    (0, globals_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        // テスト用のユーザーを作成
 fix/ts-build-config
        const testUser = yield adminAuth.createUser({

            email: "test@example.com",
            password: "password123",
            displayName: "Test User",
        });
        testUserId = testUser.uid;
        // テスト用のカスタムトークンを作成
 fix/ts-build-config
        testUserToken = yield adminAuth.createCustomToken(testUserId);
    }));
    (0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        // テスト用のユーザーを削除
        yield adminAuth.deleteUser(testUserId);

        yield prisma.$disconnect();
    }));
    (0, globals_1.describe)("GET /api/auth/me", () => {
        (0, globals_1.it)("認証済みユーザーが自分の情報を取得できる", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${testUserToken}`);
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body).toHaveProperty("publicId", testUserId);
            (0, globals_1.expect)(response.body).toHaveProperty("email", "test@example.com");
            (0, globals_1.expect)(response.body).toHaveProperty("displayName", "Test User");
        }));
        (0, globals_1.it)("トークンがない場合は401エラーを返す", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app).get("/api/auth/me");
            (0, globals_1.expect)(response.status).toBe(401);
            (0, globals_1.expect)(response.body).toHaveProperty("error", "No token provided");
        }));
        (0, globals_1.it)("無効なトークンの場合は401エラーを返す", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid-token");
            (0, globals_1.expect)(response.status).toBe(401);
        }));
    });
    (0, globals_1.describe)("PUT /api/auth/me", () => {
        (0, globals_1.it)("認証済みユーザーが表示名を更新できる", () => __awaiter(void 0, void 0, void 0, function* () {
            const newDisplayName = "Updated Test User";
            const response = yield (0, supertest_1.default)(index_1.app)
                .put("/api/auth/me")
                .set("Authorization", `Bearer ${testUserToken}`)
                .send({ displayName: newDisplayName });
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.body).toHaveProperty("displayName", newDisplayName);
        }));
        (0, globals_1.it)("トークンがない場合は401エラーを返す", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put("/api/auth/me")
                .send({ displayName: "New Name" });
            (0, globals_1.expect)(response.status).toBe(401);
            (0, globals_1.expect)(response.body).toHaveProperty("error", "No token provided");
        }));
        (0, globals_1.it)("無効なトークンの場合は401エラーを返す", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put("/api/auth/me")
                .set("Authorization", "Bearer invalid-token")
                .send({ displayName: "New Name" });
            (0, globals_1.expect)(response.status).toBe(401);
        }));
        (0, globals_1.it)("表示名が空の場合は400エラーを返す", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.app)
                .put("/api/auth/me")
                .set("Authorization", `Bearer ${testUserToken}`)
                .send({ displayName: "" });
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(response.body).toHaveProperty("error", "Display name cannot be empty");
        }));
    });
});
