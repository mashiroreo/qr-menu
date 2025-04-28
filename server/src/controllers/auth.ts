import { Request, Response } from "express";
import { adminAuth } from "../config/firebase";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

// ユーザー情報の取得
export const getUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { publicId: req.user.publicId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ユーザー情報の更新
export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { displayName } = req.body;

    // 表示名のバリデーション
    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ error: "Display name cannot be empty" });
    }

    const updatedUser = await prisma.user.update({
      where: { publicId: req.user.publicId },
      data: { displayName: displayName.trim() },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 