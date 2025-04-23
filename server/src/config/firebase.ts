import { initializeApp, cert } from "firebase-admin/app";
import admin from "firebase-admin";

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!firebasePrivateKey) {
  throw new Error("Missing FIREBASE_PRIVATE_KEY in environment variables");
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: firebasePrivateKey,
  }),
});

const isTestEnvironment = process.env.NODE_ENV === "test";

export const adminAuth = isTestEnvironment
  ? {
      verifyIdToken: async (token: string) => {
        // テスト用のモックデータ
        return {
          uid: "test-user-id",
          email: "test@example.com",
          name: "Test User",
        };
      },
    }
  : admin.auth();
