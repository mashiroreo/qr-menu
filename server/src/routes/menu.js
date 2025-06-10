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
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../utils/upload");
const storage_1 = require("../utils/storage");
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 公開API: 認証不要でメニュー情報を取得
router.get('/public', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storeId } = req.query;
    if (!storeId) {
        return res.status(400).json({ error: 'storeIdが必要です' });
    }
    try {
        const items = yield prisma.menuItem.findMany({
            where: { storeId: Number(storeId) },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                order: true,
            },
            orderBy: {
                order: 'asc',
            },
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'メニュー情報の取得に失敗しました' });
    }
}));
// 公開API: 認証不要でカテゴリ一覧を取得
router.get('/public/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storeId } = req.query;
    if (!storeId) {
        return res.status(400).json({ error: 'storeIdが必要です' });
    }
    try {
        const categories = yield prisma.menuCategory.findMany({
            where: { storeId: Number(storeId) },
            orderBy: { order: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'カテゴリ情報の取得に失敗しました' });
    }
}));
// 公開API: 認証不要でメニューアイテム一覧を取得
router.get('/public/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.query;
    if (!categoryId) {
        return res.status(400).json({ error: 'categoryIdが必要です' });
    }
    try {
        const items = yield prisma.menuItem.findMany({
            where: { categoryId: Number(categoryId) },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                order: true,
            },
            orderBy: { order: 'asc' },
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'メニュー情報の取得に失敗しました' });
    }
}));
// 認証が必要なルート
router.use(auth_1.authenticate);
// バリデーションスキーマ
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
});
const itemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "商品名は必須です"),
    description: zod_1.z.string().nullable().optional(),
    price: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0, "価格は0以上を入力してください")),
    categoryId: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int("カテゴリーIDは整数である必要があります")),
}).passthrough();
// メニューカテゴリー一覧取得
router.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const categories = yield prisma.menuCategory.findMany({
            where: {
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
            orderBy: {
                order: "asc",
            },
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "カテゴリーの取得に失敗しました" });
    }
}));
// メニューカテゴリーの並び替え
router.put('/categories/reorder', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { items } = req.body;
        console.log('Received reorder request:', {
            body: req.body,
            items,
            storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId
        });
        if (!Array.isArray(items)) {
            console.log('Invalid items array:', items);
            return res.status(400).json({ error: '無効なデータ形式です' });
        }
        // 各アイテムのバリデーション
        const validatedItems = items.map(item => {
            const id = Number(item.id);
            const order = Number(item.order);
            console.log('Validating item:', { id, order, original: item });
            if (isNaN(id) || id <= 0) {
                throw new Error(`無効なID: ${item.id}`);
            }
            if (isNaN(order) || order < 0) {
                throw new Error(`無効な順序: ${item.order}`);
            }
            return { id, order };
        });
        // 各カテゴリーの存在確認と権限チェック
        const existingCategories = yield prisma.menuCategory.findMany({
            where: {
                id: { in: validatedItems.map(item => item.id) },
                storeId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.storeId
            }
        });
        console.log('Found existing categories:', existingCategories);
        if (existingCategories.length !== validatedItems.length) {
            const foundIds = existingCategories.map(cat => cat.id);
            const requestedIds = validatedItems.map(item => item.id);
            const invalidIds = requestedIds.filter(id => !foundIds.includes(id));
            console.log('Invalid IDs found:', { invalidIds, foundIds, requestedIds });
            return res.status(400).json({
                error: '無効なカテゴリーIDが含まれています',
                details: `見つからないID: ${invalidIds.join(', ')}`
            });
        }
        // トランザクションで一括更新
        const updatedCategories = yield prisma.$transaction(validatedItems.map(item => prisma.menuCategory.update({
            where: { id: item.id },
            data: { order: item.order }
        })));
        console.log('Successfully updated categories:', updatedCategories);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error reordering categories:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'カテゴリーの並び替えに失敗しました' });
    }
}));
// メニューカテゴリー作成
router.post("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, order } = req.body;
        const category = yield prisma.menuCategory.create({
            data: {
                name,
                description,
                order,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "カテゴリーの作成に失敗しました" });
    }
}));
// メニューカテゴリー更新
router.put("/categories/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, description, order } = req.body;
        // まず該当のカテゴリーが存在するか確認
        const existingCategory = yield prisma.menuCategory.findFirst({
            where: {
                id: parseInt(id),
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingCategory) {
            return res.status(404).json({ error: "カテゴリーが見つかりません" });
        }
        const category = yield prisma.menuCategory.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name,
                description,
                order,
            },
        });
        res.json(category);
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "カテゴリーの更新に失敗しました" });
    }
}));
// メニューカテゴリー削除
router.delete("/categories/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // まず該当のカテゴリーが存在するか確認
        const existingCategory = yield prisma.menuCategory.findFirst({
            where: {
                id: parseInt(id),
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingCategory) {
            return res.status(404).json({ error: "カテゴリーが見つかりません" });
        }
        yield prisma.menuCategory.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "カテゴリーの削除に失敗しました" });
    }
}));
// メニューアイテム一覧取得
router.get("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { categoryId } = req.query;
        const items = yield prisma.menuItem.findMany({
            where: {
                categoryId: categoryId ? Number(categoryId) : undefined,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                order: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                order: "asc",
            },
        });
        res.json(items);
    }
    catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ error: "メニューアイテムの取得に失敗しました" });
    }
}));
// メニューアイテムの並び順を更新
router.put('/items/reorder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { items } = req.body;
        console.log('Received reorder request:', {
            body: req.body,
            items,
            storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId
        });
        if (!items || !Array.isArray(items)) {
            console.log('Invalid items array:', items);
            return res.status(400).json({ error: 'リクエストデータが不正です' });
        }
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.storeId)) {
            console.log('No storeId in request');
            return res.status(403).json({ error: '権限がありません' });
        }
        // 各アイテムのバリデーション
        const validatedItems = items.map(item => {
            const id = Number(item.id);
            const order = Number(item.order);
            console.log('Validating item:', { id, order, original: item });
            if (isNaN(id) || id <= 0) {
                throw new Error(`無効なID: ${item.id}`);
            }
            if (isNaN(order) || order < 0) {
                throw new Error(`無効な順序: ${item.order}`);
            }
            return { id, order };
        });
        // 既存のアイテムを取得して権限チェック
        const existingItems = yield prisma.menuItem.findMany({
            where: {
                id: { in: validatedItems.map(item => item.id) },
                storeId: req.user.storeId
            }
        });
        console.log('Found existing items:', existingItems);
        if (existingItems.length !== validatedItems.length) {
            const foundIds = existingItems.map(item => item.id);
            const requestedIds = validatedItems.map(item => item.id);
            const invalidIds = requestedIds.filter(id => !foundIds.includes(id));
            console.log('Invalid IDs found:', { invalidIds, foundIds, requestedIds });
            return res.status(400).json({
                error: '無効なIDです',
                details: `見つからないID: ${invalidIds.join(', ')}`
            });
        }
        // トランザクションで一括更新
        const updatedItems = yield prisma.$transaction(validatedItems.map(item => prisma.menuItem.update({
            where: { id: item.id },
            data: { order: item.order }
        })));
        console.log('Successfully updated items:', updatedItems);
        res.json(updatedItems);
    }
    catch (error) {
        console.error('Error updating menu item order:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : '並び順の更新に失敗しました' });
    }
}));
// メニューアイテム作成
router.post("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("Received data:", req.body);
        // バリデーション
        const validationResult = itemSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error);
            return res.status(400).json({
                error: "入力内容に問題があります",
                details: validationResult.error.errors.map(err => err.message)
            });
        }
        const { name, description, price, categoryId } = validationResult.data;
        // カテゴリーの存在確認
        const category = yield prisma.menuCategory.findFirst({
            where: {
                id: categoryId,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!category) {
            return res.status(400).json({ error: "指定されたカテゴリーが見つかりません" });
        }
        const item = yield prisma.menuItem.create({
            data: {
                name,
                description: description || null,
                price,
                categoryId,
                storeId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.storeId,
                order: 0,
            },
        });
        console.log("Created item:", item);
        res.status(201).json(item);
    }
    catch (error) {
        console.error("Error creating item:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
            res.status(400).json({ error: "同じ名前のメニューアイテムが既に存在します" });
        }
        else if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "メニューアイテムの作成に失敗しました" });
        }
    }
}));
// メニューアイテム更新
router.put("/items/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const itemId = parseInt(req.params.id);
        if (isNaN(itemId)) {
            return res.status(400).json({ error: "無効なIDです" });
        }
        const { name, description, price, categoryId, order } = req.body;
        // まず該当のアイテムが存在するか確認
        const existingItem = yield prisma.menuItem.findFirst({
            where: {
                id: itemId,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingItem) {
            return res.status(404).json({ error: "メニューアイテムが見つかりません" });
        }
        const item = yield prisma.menuItem.update({
            where: {
                id: itemId,
            },
            data: {
                name,
                description,
                price,
                categoryId: parseInt(categoryId),
                order,
            },
        });
        res.json(item);
    }
    catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ error: "メニューアイテムの更新に失敗しました" });
    }
}));
// メニューアイテム削除
router.delete("/items/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const itemId = parseInt(req.params.id);
        if (isNaN(itemId)) {
            return res.status(400).json({ error: "無効なIDです" });
        }
        // まず該当のアイテムが存在するか確認
        const existingItem = yield prisma.menuItem.findFirst({
            where: {
                id: itemId,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingItem) {
            return res.status(404).json({ error: "メニューアイテムが見つかりません" });
        }
        yield prisma.menuItem.delete({
            where: {
                id: itemId,
            },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "メニューアイテムの削除に失敗しました" });
    }
}));
// メニューアイテム画像更新
router.put("/items/:id/image", upload_1.uploadMiddleware.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "画像がアップロードされていません" });
        }
        // まず該当のアイテムが存在するか確認
        const existingItem = yield prisma.menuItem.findFirst({
            where: {
                id: parseInt(id),
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingItem) {
            return res.status(404).json({ error: "メニューアイテムが見つかりません" });
        }
        // Cloud Storageに画像をアップロード
        const imageUrl = yield (0, storage_1.uploadImage)(req.file, storage_1.StorageFolders.MENU_IMAGES, `menu_${id}`);
        // データベースを更新
        const item = yield prisma.menuItem.update({
            where: {
                id: parseInt(id),
            },
            data: {
                imageUrl,
            },
        });
        res.json(item);
    }
    catch (error) {
        console.error("Error updating item image:", error);
        res.status(500).json({ error: "メニューアイテム画像の更新に失敗しました" });
    }
}));
// メニューアイテム画像削除
router.delete("/items/:id/image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const itemId = parseInt(req.params.id);
        if (isNaN(itemId)) {
            return res.status(400).json({ error: "無効なIDです" });
        }
        // まず該当のアイテムが存在するか確認
        const existingItem = yield prisma.menuItem.findFirst({
            where: {
                id: itemId,
                storeId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.storeId,
            },
        });
        if (!existingItem) {
            return res.status(404).json({ error: "メニューアイテムが見つかりません" });
        }
        // ストレージから画像も削除したい場合はここで実装（例: deleteImage(existingItem.imageUrl)）
        // ここでは仮にコメントアウト
        // if (existingItem.imageUrl) {
        //   await deleteImage(existingItem.imageUrl);
        // }
        // DB上のimageUrlをnullに
        yield prisma.menuItem.update({
            where: { id: itemId },
            data: { imageUrl: null },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting item image:", error);
        res.status(500).json({ error: "メニューアイテム画像の削除に失敗しました" });
    }
}));
exports.default = router;
