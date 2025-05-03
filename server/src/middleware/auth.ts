import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase";
import { PrismaClient } from "@prisma/client";


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
    res.status(401).json({ error: "認証トークンが提供されていません" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('Decoded token:', decodedToken);

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { publicId: decodedToken.uid },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('Found user:', user);

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
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      console.log('Created new user:', newUser);

      if (!newUser.store?.id) {
        console.error('Store not created for new user');
        res.status(500).json({ error: "ストア情報の作成に失敗しました" });
        return;
      }

      req.user = {
        uid: decodedToken.uid,
        publicId: decodedToken.uid,
        email: decodedToken.email || undefined,
        displayName: decodedToken.name || undefined,
        storeId: newUser.store.id,
      };
    } else {
      if (!user.store?.id) {
        console.error('No store found for existing user');
        res.status(404).json({ error: "Store not found" });
        return;
      }

      req.user = {
        uid: decodedToken.uid,
        publicId: user.publicId,
        email: user.email,
        displayName: user.displayName || undefined,
        storeId: user.store.id,
      };
    }

    console.log('Setting user in request:', req.user);
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "無効なトークンです" });
  }
};
