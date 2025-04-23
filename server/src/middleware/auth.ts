import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase";
import { PrismaClient } from "../generated/prisma";


const prisma = new PrismaClient();

// req.user を使うための拡張型
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    publicId: string;
    email?: string;
    displayName?: string;
    storeId?: number;
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

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { publicId: decodedToken.uid },
      include: {
        store: true,
      },
    });

    if (!user) {
      // ユーザーが存在しない場合は作成
      const newUser = await prisma.user.create({
        data: {
          publicId: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || '',
          role: "OWNER",
          store: {
            create: {
              name: "新規店舗",
              description: "",
            },
          },
        },
        include: {
          store: true,
        },
      });

      req.user = {
        uid: decodedToken.uid,
        publicId: decodedToken.uid,
        email: decodedToken.email || undefined,
        displayName: decodedToken.name || undefined,
        storeId: newUser.store?.id,
      };
    } else {
      req.user = {
        uid: decodedToken.uid,
        publicId: user.publicId,
        email: user.email,
        displayName: user.displayName || undefined,
        storeId: user.store?.id,
      };
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
