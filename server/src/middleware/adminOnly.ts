import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

// 管理者のみアクセス許可
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "管理者のみがアクセスできます" });
    return;
  }
  next();
}; 