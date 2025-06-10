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
const express_1 = __importDefault(require("express"));
const store_1 = require("../controllers/store");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const upload_1 = require("../utils/upload");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// 公開API: 認証不要で店舗情報を取得
router.get('/public/:storeId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storeId } = req.params;
    try {
        const store = yield prisma.store.findUnique({
            where: { id: Number(storeId) },
            select: {
                id: true,
                name: true,
                description: true,
                logoUrl: true,
                address: true,
                phone: true,
                businessHours: true,
                specialBusinessDays: true,
            },
        });
        if (!store) {
            return res.status(404).json({ error: '店舗が見つかりません' });
        }
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ error: '店舗情報の取得に失敗しました' });
    }
}));
// 認証が必要なルート
router.use(auth_1.authenticate);
// 店舗情報の取得
router.get("/owner", store_1.getStoreInfo);
// 店舗情報の更新
router.put("/owner", store_1.updateStoreInfo);
// 店舗ロゴの更新
router.put("/owner/logo", upload_1.uploadMiddleware.single("logo"), store_1.updateStoreLogo);
// 店舗ロゴの削除
router.delete("/owner/logo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user.storeId)) {
            return res.status(403).json({ error: "権限がありません" });
        }
        // 既存のロゴURL取得
        const store = yield prisma.store.findUnique({
            where: { id: user.storeId },
        });
        if (!store) {
            return res.status(404).json({ error: "店舗が見つかりません" });
        }
        // ストレージから画像も削除したい場合はここで実装（例: deleteImage(store.logoUrl)）
        // ここでは仮にコメントアウト
        // if (store.logoUrl) {
        //   await deleteImage(store.logoUrl);
        // }
        // DB上のlogoUrlをnullに
        yield prisma.store.update({
            where: { id: user.storeId },
            data: { logoUrl: null },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting store logo:", error);
        res.status(500).json({ error: "店舗ロゴの削除に失敗しました" });
    }
}));
exports.default = router;
