"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const prisma = new client_1.PrismaClient();
function readCsv(file) {
    const filePath = path_1.default.resolve(__dirname, '../', file);
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    return (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 0. 既存データを全削除
        yield prisma.menuItem.deleteMany();
        yield prisma.menuCategory.deleteMany();
        yield prisma.store.deleteMany();
        yield prisma.user.deleteMany();
        // 1. ユーザー投入
        const users = readCsv('user.csv');
        for (const user of users) {
            yield prisma.user.upsert({
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
            yield prisma.store.upsert({
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
            yield prisma.menuCategory.upsert({
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
            yield prisma.menuItem.upsert({
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
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
