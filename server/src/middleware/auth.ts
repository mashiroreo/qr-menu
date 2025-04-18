import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase";
import { PrismaClient, Role } from "../generated/prisma";


const prisma = new PrismaClient();

// req.user を使うための拡張型
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    publicId: string;
    email?: string;
    displayName?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      publicId: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
    };

    // ユーザーが存在しない場合は作成
    if (decodedToken.email) {
      await prisma.user.upsert({
        where: { publicId: decodedToken.uid },
        create: {
          publicId: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          role: Role.OWNER,
        },
        update: {}, // 既存ユーザーは更新しない
      });
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
