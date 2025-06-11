import { storageBucket } from '../config/firebase';

export enum StorageFolders {
  QR = "qr",
  STORE_LOGOS = "store_logos",
  MENU_IMAGES = "menu_images"
}

// MIMEタイプの判定
const getMimeType = (originalname: string): string => {
  const ext = originalname.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
};

// ファイル名の生成
const generateFileName = (prefix: string, originalname: string): string => {
  const timestamp = Date.now();
  const ext = originalname.split('.').pop()?.toLowerCase() || 'jpg';
  return `${prefix}_${timestamp}.${ext}`;
};

// Cloud Storageへの画像アップロード
export const uploadImage = async (
  file: Express.Multer.File,
  folder: StorageFolders,
  prefix: string = ''
): Promise<string> => {
  try {
    const filename = generateFileName(prefix, file.originalname);
    const destination = `${folder}/${filename}`;
    const fileUpload = storageBucket.file(destination);

    // メタデータの設定
    const metadata = {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000',
    };

    // ファイルのアップロード
    await fileUpload.save(file.buffer, {
      metadata: metadata,
      public: true, // パブリックアクセスを許可
    });

    // パブリックURLを取得
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // 長期間有効なURL
    });

    return url;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    throw new Error('Failed to upload image: Unknown error');
  }
};

export const uploadImageToStorage = async (
  buffer: Buffer,
  originalname: string,
  folder: string,
  prefix: string = ''
): Promise<string> => {
  try {
    const filename = generateFileName(prefix, originalname);
    const destination = `${folder}/${filename}`;
    const fileUpload = storageBucket.file(destination);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: getMimeType(originalname),
      },
    });

    // 署名付きURLを取得（1時間有効）
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600000, // 1時間有効
    });

    return url;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw new Error('Failed to upload image');
  }
}; 