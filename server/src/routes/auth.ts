import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getUserInfo, updateUserInfo } from "../controllers/auth";

const router = Router();

// 認証が必要なルート
router.use(authenticate);

// ユーザー情報の取得
router.get("/me", getUserInfo);

// ユーザー情報の更新
router.put("/me", updateUserInfo);

export default router; 