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
exports.uploadMenuItemImage = void 0;
const client_1 = require("@prisma/client");
const storage_1 = require("../utils/storage");
const prisma = new client_1.PrismaClient();
// ... 他のコード ...
const uploadMenuItemImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { menuItemId } = req.params;
        // メニューアイテムの存在確認と権限チェック
        const menuItem = yield prisma.menuItem.findFirst({
            where: {
                id: Number(menuItemId),
                store: {
                    owner: {
                        publicId: userId
                    }
                }
            }
        });
        if (!menuItem) {
            return res.status(404).json({ error: "Menu item not found or unauthorized" });
        }
        // Cloud Storageに画像をアップロード
        const imageUrl = yield (0, storage_1.uploadImage)(req.file, storage_1.StorageFolders.MENU_IMAGES, `menu_${menuItemId}`);
        // メニューアイテムの画像URLを更新
        const updatedMenuItem = yield prisma.menuItem.update({
            where: {
                id: Number(menuItemId)
            },
            data: {
                imageUrl
            }
        });
        res.json(updatedMenuItem);
    }
    catch (error) {
        console.error("Error uploading menu item image:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.uploadMenuItemImage = uploadMenuItemImage;
