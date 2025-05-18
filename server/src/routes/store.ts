import express, { Request, Response } from "express";
import { getStoreInfo, updateStoreInfo, updateStoreLogo } from "../controllers/store";
import { authenticate, AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { uploadMiddleware } from "../utils/upload";

const router = express.Router();
const prisma = new PrismaClient();

// 公開API: 認証不要で店舗情報を取得
router.get('/public/:storeId', async (req, res) => {
  const { storeId } = req.params;
  try {
    const store = await prisma.store.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: '店舗情報の取得に失敗しました' });
  }
});

// 認証が必要なルート
router.use(authenticate);

// 店舗情報の取得
router.get("/owner", getStoreInfo);

// 店舗情報の更新
router.put("/owner", updateStoreInfo);

// 店舗ロゴの更新
router.put("/owner/logo", uploadMiddleware.single("logo"), updateStoreLogo);

// 店舗ロゴの削除
router.delete("/owner/logo", async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user?.storeId) {
      return res.status(403).json({ error: "権限がありません" });
    }
    // 既存のロゴURL取得
    const store = await prisma.store.findUnique({
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
    await prisma.store.update({
      where: { id: user.storeId },
      data: { logoUrl: null },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting store logo:", error);
    res.status(500).json({ error: "店舗ロゴの削除に失敗しました" });
  }
});

export default router; 