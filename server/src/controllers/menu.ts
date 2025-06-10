import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import { uploadImage, StorageFolders } from "../utils/storage";

const prisma = new PrismaClient();

// ... 他のコード ...

export const uploadMenuItemImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 画像ファイルがアップロードされているか確認
    if (!req.file) {
      return res.status(400).json({ error: "画像ファイルがアップロードされていません" });
    }

    const { menuItemId } = req.params;

    // メニューアイテムの存在確認と権限チェック
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: Number(menuItemId),
        store: {
          owner: {
            publicId: userId
          }
        }
      }
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found or unauthorized" });
    }

    // Cloud Storageに画像をアップロード
    const imageUrl = await uploadImage(
      req.file,
      StorageFolders.MENU_IMAGES,
      `menu_${menuItemId}`
    );

    // メニューアイテムの画像URLを更新
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: Number(menuItemId)
      },
      data: {
        imageUrl
      }
    });

    res.json(updatedMenuItem);
  } catch (error) {
    console.error("Error uploading menu item image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 