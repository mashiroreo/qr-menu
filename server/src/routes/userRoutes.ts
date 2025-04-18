// src/routes/userRoutes.ts
import { Router } from "express";
import { createUser } from "../controllers/userController";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /users（認証されたユーザーのみアクセス可能）
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const loginUser = req.user;
    const message = "認証済みユーザーのみがアクセスできます";
    res.json({ message, loginUser });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラー" });
  }
});

export default router;
