import express from "express";
import { getStoreInfo, updateStoreInfo, updateStoreLogo } from "../controllers/store";
import { authenticate } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { uploadImage } from "../utils/upload";

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
router.put("/owner/logo", uploadImage.single("logo"), updateStoreLogo);

export default router; 