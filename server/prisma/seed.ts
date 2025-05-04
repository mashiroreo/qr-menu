import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function readCsv(file: string) {
  const filePath = path.resolve(__dirname, '../', file);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true });
}

async function main() {
  // 0. 既存データを全削除
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 1. ユーザー投入
  const users = readCsv('user.csv');
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        publicId: user.publicId,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: new Date(Number(user.createdAt)),
        updatedAt: new Date(Number(user.updatedAt)),
      },
    });
  }

  // 2. 店舗投入
  const stores = readCsv('store.csv');
  for (const store of stores) {
    await prisma.store.upsert({
      where: { id: Number(store.id) },
      update: {},
      create: {
        id: Number(store.id),
        name: store.name,
        description: store.description,
        address: store.address,
        phone: store.phone,
        logoUrl: store.logoUrl,
        businessHours: store.businessHours,
        ownerId: store.ownerId,
        createdAt: new Date(Number(store.createdAt)),
        updatedAt: new Date(Number(store.updatedAt)),
      },
    });
  }

  // 3. カテゴリ投入
  const categories = readCsv('menucategory.csv');
  for (const cat of categories) {
    await prisma.menuCategory.upsert({
      where: { id: Number(cat.id) },
      update: {},
      create: {
        id: Number(cat.id),
        name: cat.name,
        description: cat.description,
        order: Number(cat.order),
        storeId: Number(cat.storeId),
        createdAt: new Date(Number(cat.createdAt)),
        updatedAt: new Date(Number(cat.updatedAt)),
      },
    });
  }

  // 4. メニューアイテム投入
  const items = readCsv('menuitem.csv');
  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: Number(item.id) },
      update: {},
      create: {
        id: Number(item.id),
        name: item.name,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        order: Number(item.order),
        categoryId: Number(item.categoryId),
        storeId: Number(item.storeId),
        createdAt: new Date(Number(item.createdAt)),
        updatedAt: new Date(Number(item.updatedAt)),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 