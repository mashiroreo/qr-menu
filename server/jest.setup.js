process.env.FIREBASE_PROJECT_ID  = 'test_project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY  = '-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----\n';

// firebase-admin モジュールを完全モックし、テスト環境で外部依存を排除
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    storage: () => ({ bucket: () => ({}) }),
  };
});

jest.mock('firebase-admin/app', () => {
  return {
    initializeApp: jest.fn(),
    cert: jest.fn(),
  };
});

jest.mock('./src/utils/storage', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://dummy/image.png'),
  StorageFolders: {
    QR: 'qr',
    STORE_LOGOS: 'store_logos',
    MENU_IMAGES: 'menu_images'
  }
})); 