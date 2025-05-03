import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import { uploadMiddleware } from "../utils/upload";
import { uploadImage, StorageFolders } from "../utils/storage";
import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const prisma = new PrismaClient();

// 公開API: 認証不要でメニュー情報を取得
router.get('/public', async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) {
    return res.status(400).json({ error: 'storeIdが必要です' });
  }
  try {
    const items = await prisma.menuItem.findMany({
      where: { storeId: Number(storeId) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'メニュー情報の取得に失敗しました' });
  }
});

// 公開API: 認証不要でカテゴリ一覧を取得
router.get('/public/categories', async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) {
    return res.status(400).json({ error: 'storeIdが必要です' });
  }
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { storeId: Number(storeId) },
      orderBy: { order: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'カテゴリ情報の取得に失敗しました' });
  }
});

// 公開API: 認証不要でメニューアイテム一覧を取得
router.get('/public/items', async (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) {
    return res.status(400).json({ error: 'categoryIdが必要です' });
  }
  try {
    const items = await prisma.menuItem.findMany({
      where: { categoryId: Number(categoryId) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'メニュー情報の取得に失敗しました' });
  }
});

// 認証が必要なルート
router.use(authenticate);

// バリデーションスキーマ
const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
});

const itemSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  description: z.string().nullable().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "価格は0以上を入力してください")
  ),
  categoryId: z.preprocess(
    (val) => Number(val),
    z.number().int("カテゴリーIDは整数である必要があります")
  ),
}).passthrough();

// メニューカテゴリー一覧取得
router.get("/categories", async (req: AuthRequest, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: {
        storeId: req.user?.storeId,
      },
      orderBy: {
        order: "asc",
      },
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "カテゴリーの取得に失敗しました" });
  }
});

// メニューカテゴリーの並び替え
router.put('/categories/reorder', authenticate, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;
    console.log('Received reorder request:', { 
      body: req.body,
      items,
      storeId: req.user?.storeId 
    });
    
    if (!Array.isArray(items)) {
      console.log('Invalid items array:', items);
      return res.status(400).json({ error: '無効なデータ形式です' });
    }

    // 各アイテムのバリデーション
    const validatedItems = items.map(item => {
      const id = Number(item.id);
      const order = Number(item.order);
      console.log('Validating item:', { id, order, original: item });
      if (isNaN(id) || id <= 0) {
        throw new Error(`無効なID: ${item.id}`);
      }
      if (isNaN(order) || order < 0) {
        throw new Error(`無効な順序: ${item.order}`);
      }
      return { id, order };
    });

    // 各カテゴリーの存在確認と権限チェック
    const existingCategories = await prisma.menuCategory.findMany({
      where: {
        id: { in: validatedItems.map(item => item.id) },
        storeId: req.user?.storeId
      }
    });
    console.log('Found existing categories:', existingCategories);

    if (existingCategories.length !== validatedItems.length) {
      const foundIds = existingCategories.map(cat => cat.id);
      const requestedIds = validatedItems.map(item => item.id);
      const invalidIds = requestedIds.filter(id => !foundIds.includes(id));
      console.log('Invalid IDs found:', { invalidIds, foundIds, requestedIds });
      return res.status(400).json({ 
        error: '無効なカテゴリーIDが含まれています',
        details: `見つからないID: ${invalidIds.join(', ')}`
      });
    }

    // トランザクションで一括更新
    const updatedCategories = await prisma.$transaction(
      validatedItems.map(item =>
        prisma.menuCategory.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );
    console.log('Successfully updated categories:', updatedCategories);

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'カテゴリーの並び替えに失敗しました' });
  }
});

// メニューカテゴリー作成
router.post("/categories", async (req: AuthRequest, res) => {
  try {
    const { name, description, order } = req.body;
    const category = await prisma.menuCategory.create({
      data: {
        name,
        description,
        order,
        storeId: req.user?.storeId!,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "カテゴリーの作成に失敗しました" });
  }
});

// メニューカテゴリー更新
router.put("/categories/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;
    
    // まず該当のカテゴリーが存在するか確認
    const existingCategory = await prisma.menuCategory.findFirst({
      where: {
        id: parseInt(id),
        storeId: req.user?.storeId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "カテゴリーが見つかりません" });
    }

    const category = await prisma.menuCategory.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
        order,
      },
    });
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "カテゴリーの更新に失敗しました" });
  }
});

// メニューカテゴリー削除
router.delete("/categories/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // まず該当のカテゴリーが存在するか確認
    const existingCategory = await prisma.menuCategory.findFirst({
      where: {
        id: parseInt(id),
        storeId: req.user?.storeId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "カテゴリーが見つかりません" });
    }

    await prisma.menuCategory.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "カテゴリーの削除に失敗しました" });
  }
});

// メニューアイテム一覧取得
router.get("/items", async (req: AuthRequest, res) => {
  try {
    const { categoryId } = req.query;
    const items = await prisma.menuItem.findMany({
      where: {
        categoryId: categoryId ? Number(categoryId) : undefined,
        storeId: req.user?.storeId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        order: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "メニューアイテムの取得に失敗しました" });
  }
});

// メニューアイテムの並び順を更新
router.put('/items/reorder', async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;
    console.log('Received reorder request:', { 
      body: req.body,
      items,
      storeId: req.user?.storeId 
    });
    
    if (!items || !Array.isArray(items)) {
      console.log('Invalid items array:', items);
      return res.status(400).json({ error: 'リクエストデータが不正です' });
    }

    if (!req.user?.storeId) {
      console.log('No storeId in request');
      return res.status(403).json({ error: '権限がありません' });
    }

    // 各アイテムのバリデーション
    const validatedItems = items.map(item => {
      const id = Number(item.id);
      const order = Number(item.order);
      console.log('Validating item:', { id, order, original: item });
      if (isNaN(id) || id <= 0) {
        throw new Error(`無効なID: ${item.id}`);
      }
      if (isNaN(order) || order < 0) {
        throw new Error(`無効な順序: ${item.order}`);
      }
      return { id, order };
    });

    // 既存のアイテムを取得して権限チェック
    const existingItems = await prisma.menuItem.findMany({
      where: {
        id: { in: validatedItems.map(item => item.id) },
        storeId: req.user.storeId
      }
    });
    console.log('Found existing items:', existingItems);

    if (existingItems.length !== validatedItems.length) {
      const foundIds = existingItems.map(item => item.id);
      const requestedIds = validatedItems.map(item => item.id);
      const invalidIds = requestedIds.filter(id => !foundIds.includes(id));
      console.log('Invalid IDs found:', { invalidIds, foundIds, requestedIds });
      return res.status(400).json({ 
        error: '無効なIDです',
        details: `見つからないID: ${invalidIds.join(', ')}`
      });
    }

    // トランザクションで一括更新
    const updatedItems = await prisma.$transaction(
      validatedItems.map(item =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );
    console.log('Successfully updated items:', updatedItems);

    res.json(updatedItems);
  } catch (error) {
    console.error('Error updating menu item order:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '並び順の更新に失敗しました' });
  }
});

// メニューアイテム作成
router.post("/items", async (req: AuthRequest, res) => {
  try {
    console.log("Received data:", req.body);

    // バリデーション
    const validationResult = itemSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      return res.status(400).json({
        error: "入力内容に問題があります",
        details: validationResult.error.errors.map(err => err.message)
      });
    }

    const { name, description, price, categoryId } = validationResult.data;

    // カテゴリーの存在確認
    const category = await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        storeId: req.user?.storeId,
      },
    });

    if (!category) {
      return res.status(400).json({ error: "指定されたカテゴリーが見つかりません" });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        storeId: req.user?.storeId!,
        order: 0,
      },
    });

    console.log("Created item:", item);
    res.status(201).json(item);
  } catch (error: any) {
    console.error("Error creating item:", error);
    if (error?.code === 'P2002') {
      res.status(400).json({ error: "同じ名前のメニューアイテムが既に存在します" });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "メニューアイテムの作成に失敗しました" });
    }
  }
});

// メニューアイテム更新
router.put("/items/:id", async (req: AuthRequest, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "無効なIDです" });
    }

    const { name, description, price, categoryId, order } = req.body;

    // まず該当のアイテムが存在するか確認
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        storeId: req.user?.storeId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "メニューアイテムが見つかりません" });
    }

    const item = await prisma.menuItem.update({
      where: {
        id: itemId,
      },
      data: {
        name,
        description,
        price,
        categoryId: parseInt(categoryId),
        order,
      },
    });
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "メニューアイテムの更新に失敗しました" });
  }
});

// メニューアイテム削除
router.delete("/items/:id", async (req: AuthRequest, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "無効なIDです" });
    }

    // まず該当のアイテムが存在するか確認
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        storeId: req.user?.storeId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "メニューアイテムが見つかりません" });
    }

    await prisma.menuItem.delete({
      where: {
        id: itemId,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "メニューアイテムの削除に失敗しました" });
  }
});

// メニューアイテム画像更新
router.put(
  "/items/:id/image",
  uploadMiddleware.single("image"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: "画像がアップロードされていません" });
      }

      // まず該当のアイテムが存在するか確認
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          id: parseInt(id),
          storeId: req.user?.storeId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: "メニューアイテムが見つかりません" });
      }

      // Cloud Storageに画像をアップロード
      const imageUrl = await uploadImage(
        req.file,
        StorageFolders.MENU_IMAGES,
        `menu_${id}`
      );

      // データベースを更新
      const item = await prisma.menuItem.update({
        where: {
          id: parseInt(id),
        },
        data: {
          imageUrl,
        },
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating item image:", error);
      res.status(500).json({ error: "メニューアイテム画像の更新に失敗しました" });
    }
  }
);

export default router; 