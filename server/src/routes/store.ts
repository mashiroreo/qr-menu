import express from "express";
import { getStoreInfo, updateStoreInfo, updateStoreLogo } from "../controllers/store";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// 認証が必要なルート
router.use(authenticate);

// 店舗情報の取得
router.get("/owner", getStoreInfo);

// 店舗情報の更新
router.put("/owner", updateStoreInfo);

// 店舗ロゴの更新
router.put("/owner/logo", updateStoreLogo);

export default router; 