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
exports.updateUserInfo = exports.getUserInfo = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ユーザー情報の取得
const getUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = yield prisma.user.findUnique({
            where: { publicId: req.user.publicId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error getting user info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserInfo = getUserInfo;
// ユーザー情報の更新
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { displayName } = req.body;
        // 表示名のバリデーション
        if (!displayName || displayName.trim() === "") {
            return res.status(400).json({ error: "Display name cannot be empty" });
        }
        const updatedUser = yield prisma.user.update({
            where: { publicId: req.user.publicId },
            data: { displayName: displayName.trim() },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUserInfo = updateUserInfo;
