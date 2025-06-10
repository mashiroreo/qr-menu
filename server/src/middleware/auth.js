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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "認証トークンが提供されていません" });
        return;
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = yield firebase_1.adminAuth.verifyIdToken(token);
        console.log('Decoded token:', decodedToken);
        // ユーザー情報を取得
        const user = yield prisma.user.findUnique({
            where: { publicId: decodedToken.uid },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        console.log('Found user:', user);
        if (!user) {
            // ユーザーが存在しない場合は作成
            const newUser = yield prisma.user.create({
                data: {
                    publicId: decodedToken.uid,
                    email: decodedToken.email || '',
                    displayName: decodedToken.name || '',
                    role: "OWNER",
                    store: {
                        create: {
                            name: "新規店舗",
                            description: "",
                        },
                    },
                },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            console.log('Created new user:', newUser);
            if (!((_a = newUser.store) === null || _a === void 0 ? void 0 : _a.id)) {
                console.error('Store not created for new user');
                res.status(500).json({ error: "ストア情報の作成に失敗しました" });
                return;
            }
            req.user = {
                uid: decodedToken.uid,
                publicId: decodedToken.uid,
                email: decodedToken.email || undefined,
                displayName: decodedToken.name || undefined,
                storeId: newUser.store.id,
            };
        }
        else {
            if (!((_b = user.store) === null || _b === void 0 ? void 0 : _b.id)) {
                console.error('No store found for existing user');
                res.status(404).json({ error: "Store not found" });
                return;
            }
            req.user = {
                uid: decodedToken.uid,
                publicId: user.publicId,
                email: user.email,
                displayName: user.displayName || undefined,
                storeId: user.store.id,
            };
        }
        console.log('Setting user in request:', req.user);
        next();
    }
    catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ error: "無効なトークンです" });
    }
});
exports.authenticate = authenticate;
