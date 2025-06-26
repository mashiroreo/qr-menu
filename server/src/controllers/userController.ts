// src/controllers/userController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createUser = async (_req: Request, res: Response) => {
  try {
    const email = `test+${Date.now()}@example.com`;

    const newUser = await prisma.user.create({
      data: {
        email,
        displayName: 'テストユーザー',
        publicId: `test_${Date.now()}`
      }
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー作成に失敗しました' });
  }
};

// GET /api/users (admin only)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー取得に失敗しました' });
  }
};

// GET /api/users/:id (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'ユーザーが見つかりません' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー取得に失敗しました' });
  }
};

// PUT /api/users/:id (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, displayName, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, displayName, role },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー更新に失敗しました' });
  }
};

// DELETE /api/users/:id (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'ユーザーを削除しました' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー削除に失敗しました' });
  }
};
