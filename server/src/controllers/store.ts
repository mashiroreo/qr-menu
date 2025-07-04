import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import { uploadImage, StorageFolders } from "../utils/storage";

const prisma = new PrismaClient();

// URLのバリデーション関数
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getStoreInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const store = await prisma.store.findFirst({
      where: {
        owner: {
          publicId: userId
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        logoUrl: true,
        businessHours: true,
        specialBusinessDays: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (error) {
    console.error("Error getting store info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStoreInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, address, phone, businessHours, specialBusinessDays } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Store name is required" });
    }

    const store = await prisma.store.findFirst({
      where: {
        owner: {
          publicId: userId
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: store.id
      },
      data: {
        name,
        description,
        address,
        phone,
        businessHours,
        specialBusinessDays
      }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStoreLogo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 画像ファイルがアップロードされているか確認
    if (!req.file) {
      return res.status(400).json({ error: "画像ファイルがアップロードされていません" });
    }

    const store = await prisma.store.findFirst({
      where: {
        owner: {
          publicId: userId
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Cloud Storageに画像をアップロード
    const logoUrl = await uploadImage(
      req.file,
      StorageFolders.STORE_LOGOS,
      `store_${store.id}`
    );

    const updatedStore = await prisma.store.update({
      where: {
        id: store.id
      },
      data: {
        logoUrl
      }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store logo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 