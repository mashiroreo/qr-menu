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
exports.updateStoreLogo = exports.updateStoreInfo = exports.getStoreInfo = void 0;
const client_1 = require("@prisma/client");
const storage_1 = require("../utils/storage");
const prisma = new client_1.PrismaClient();
// URLのバリデーション関数
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
};
const getStoreInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const store = yield prisma.store.findFirst({
            where: {
                owner: {
                    publicId: userId
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                logoUrl: true,
                businessHours: true,
                specialBusinessDays: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!store) {
            return res.status(404).json({ error: "Store not found" });
        }
        res.json(store);
    }
    catch (error) {
        console.error("Error getting store info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getStoreInfo = getStoreInfo;
const updateStoreInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { name, description, address, phone, businessHours, specialBusinessDays } = req.body;
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Store name is required" });
        }
        const store = yield prisma.store.findFirst({
            where: {
                owner: {
                    publicId: userId
                }
            }
        });
        if (!store) {
            return res.status(404).json({ error: "Store not found" });
        }
        const updatedStore = yield prisma.store.update({
            where: {
                id: store.id
            },
            data: {
                name,
                description,
                address,
                phone,
                businessHours,
                specialBusinessDays
            }
        });
        res.json(updatedStore);
    }
    catch (error) {
        console.error("Error updating store info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateStoreInfo = updateStoreInfo;
const updateStoreLogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // 画像ファイルがアップロードされているか確認
        if (!req.file) {
            return res.status(400).json({ error: "画像ファイルがアップロードされていません" });
        }
        const store = yield prisma.store.findFirst({
            where: {
                owner: {
                    publicId: userId
                }
            }
        });
        if (!store) {
            return res.status(404).json({ error: "Store not found" });
        }
        // Cloud Storageに画像をアップロード
        const logoUrl = yield (0, storage_1.uploadImage)(req.file, storage_1.StorageFolders.STORE_LOGOS, `store_${store.id}`);
        const updatedStore = yield prisma.store.update({
            where: {
                id: store.id
            },
            data: {
                logoUrl
            }
        });
        res.json(updatedStore);
    }
    catch (error) {
        console.error("Error updating store logo:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateStoreLogo = updateStoreLogo;
