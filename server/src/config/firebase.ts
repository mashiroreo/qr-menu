import { initializeApp, cert } from "firebase-admin/app";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

// プライベートキーの処理を改善
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

if (!firebasePrivateKey) {
  throw new Error("Missing FIREBASE_PRIVATE_KEY in environment variables");
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("Missing FIREBASE_PROJECT_ID in environment variables");
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error("Missing FIREBASE_CLIENT_EMAIL in environment variables");
}

try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: firebasePrivateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

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

export const storageBucket = admin.storage().bucket();
