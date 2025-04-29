import multer from 'multer';

// ファイルフィルター（画像ファイルのみ許可）
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイルのみアップロード可能です'));
  }
};

// multerの設定（メモリストレージを使用）
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(), // Cloud Storageにアップロードするためメモリストレージを使用
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}); 