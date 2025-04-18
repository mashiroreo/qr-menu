import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/users/me
router.get("/me", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "認証されていません" });
        return;
      }
  
      res.json(req.user); // ← return いらない！
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error);
      res.status(500).json({ error: "サーバーエラー" });
    }
  });
  

export default router; 