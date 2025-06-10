"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
// ファイルフィルター（画像ファイルのみ許可）
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('画像ファイルのみアップロード可能です'));
    }
};
// multerの設定（メモリストレージを使用）
exports.uploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Cloud Storageにアップロードするためメモリストレージを使用
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
