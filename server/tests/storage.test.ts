// Prisma はこのテストでは不要なので完全にモックして DB 初期化を回避
jest.mock('@prisma/client', () => ({}));

// === Prisma を完全モックする環境変数 ===
process.env.SKIP_PRISMA = '1';

// Jestのモックは import より先に定義する必要がある
const mockSave = jest.fn();
const mockGetSignedUrl = jest.fn().mockResolvedValue(['https://example.com/image.jpg']);

// utils をインポートする前にアンモックして本実装を使用
jest.unmock('../src/utils/storage');

import { uploadImageToStorage, uploadImage, StorageFolders } from '../src/utils/storage';
import { storageBucket } from '../src/config/firebase';

// storageBucket.file が未定義の場合に備えて直接モックを設定
(storageBucket as any).file = () => ({
  save: mockSave,
  getSignedUrl: mockGetSignedUrl,
});

describe('Storage utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploadImage returns signed url', async () => {
    mockSave.mockResolvedValue(undefined);
    const file = {
      originalname: 'test.png',
      mimetype: 'image/png',
      buffer: Buffer.from('data'),
    } as unknown as Express.Multer.File;
    const url = await uploadImage(file, StorageFolders.STORE_LOGOS, 'test');
    expect(url).toBe('https://example.com/image.jpg');
    expect(mockSave).toHaveBeenCalled();
    expect(mockGetSignedUrl).toHaveBeenCalled();
  });

  it('uploadImageToStorage sets jpeg for unknown ext', async () => {
    mockSave.mockResolvedValue(undefined);
    await uploadImageToStorage(Buffer.from('data'), 'file.unknown', 'test_folder');
    const args = mockSave.mock.calls[0][1];
    expect(args.metadata.contentType).toBe('image/jpeg');
  });

  it('uploadImage throws when save fails', async () => {
    mockSave.mockRejectedValue(new Error('save error'));
    const file = { originalname: 'a.png', mimetype: 'image/png', buffer: Buffer.from('d') } as unknown as Express.Multer.File;
    await expect(uploadImage(file, StorageFolders.STORE_LOGOS)).rejects.toThrow('Failed to upload image');
  });
}); 