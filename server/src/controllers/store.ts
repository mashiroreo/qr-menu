import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { AuthRequest } from "../middleware/auth";

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

    const { name, description, address, phone, businessHours } = req.body;

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
        businessHours
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

    const { logoUrl } = req.body;

    if (!logoUrl) {
      return res.status(400).json({ error: "Logo URL is required" });
    }

    if (!isValidUrl(logoUrl)) {
      return res.status(400).json({ error: "Invalid logo URL format" });
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
        logoUrl
      }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store logo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 