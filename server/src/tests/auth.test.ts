import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../config/firebase";

const prisma = new PrismaClient();

describe("認証APIのテスト", () => {
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // テスト用のユーザーを作成
    const testUser = await adminAuth.createUser({
      email: "test@example.com",
      password: "password123",
      displayName: "Test User",
    });

    testUserId = testUser.uid;

    // テスト用のカスタムトークンを作成
    testUserToken = await adminAuth.createCustomToken(testUserId);
  });

  afterAll(async () => {
    // テスト用のユーザーを削除
    await adminAuth.deleteUser(testUserId);
    await prisma.$disconnect();
  });

  describe("GET /api/auth/me", () => {
    it("認証済みユーザーが自分の情報を取得できる", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("publicId", testUserId);
      expect(response.body).toHaveProperty("email", "test@example.com");
      expect(response.body).toHaveProperty("displayName", "Test User");
    });

    it("トークンがない場合は401エラーを返す", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "No token provided");
    });

    it("無効なトークンの場合は401エラーを返す", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/auth/me", () => {
    it("認証済みユーザーが表示名を更新できる", async () => {
      const newDisplayName = "Updated Test User";
      const response = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ displayName: newDisplayName });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("displayName", newDisplayName);
    });

    it("トークンがない場合は401エラーを返す", async () => {
      const response = await request(app)
        .put("/api/auth/me")
        .send({ displayName: "New Name" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "No token provided");
    });

    it("無効なトークンの場合は401エラーを返す", async () => {
      const response = await request(app)
        .put("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .send({ displayName: "New Name" });

      expect(response.status).toBe(401);
    });

    it("表示名が空の場合は400エラーを返す", async () => {
      const response = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ displayName: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Display name cannot be empty");
    });
  });
}); 