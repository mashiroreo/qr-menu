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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageBucket = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebasePrivateKey = (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n");
if (!firebasePrivateKey) {
    throw new Error("Missing FIREBASE_PRIVATE_KEY in environment variables");
}
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: firebasePrivateKey,
    }),
    storageBucket: "qrmenu-34cc1.firebasestorage.app"
});
const isTestEnvironment = process.env.NODE_ENV === "test";
exports.adminAuth = isTestEnvironment
    ? {
        verifyIdToken: (token) => __awaiter(void 0, void 0, void 0, function* () {
            // テスト用のモックデータ
            return {
                uid: "test-user-id",
                email: "test@example.com",
                name: "Test User",
            };
        }),
    }
    : firebase_admin_1.default.auth();
exports.storageBucket = firebase_admin_1.default.storage().bucket();
