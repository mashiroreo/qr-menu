// src/controllers/userController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createUser = async (_req: Request, res: Response) => {
  try {
    const email = `test+${Date.now()}@example.com`;

    const newUser = await prisma.user.create({
      data: {
        email,
        displayName: 'テストユーザー'
      }
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ユーザー作成に失敗しました' });
  }
};
