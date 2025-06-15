import express from 'express';
import cors from 'cors';
import path from 'path';
import storeRoutes from './routes/store';
import menuRoutes from './routes/menu';
import qrRoutes from './routes/qr';
import authRoutes from './routes/auth';
import fs from 'fs';
import dotenv from "dotenv";

// デバッグ用：.envファイルのパスを表示
console.log('Current directory:', process.cwd());
console.log('.env file path:', path.resolve(process.cwd(), '.env'));

// dotenvの設定を明示的に行う
const result = dotenv.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env file loaded successfully');
}

// 環境変数の確認
console.log('Environment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'exists' : 'missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'exists' : 'missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'exists' : 'missing');

const app = express();
const port = Number(process.env.PORT) || 3000;

// CORSの設定
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.50:5173', 'http://192.168.1.59:5173', 'http://192.168.1.70:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSONとURLエンコードされたボディの解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use('/qr', express.static(path.join(__dirname, '../uploads/qr')));

// ルーティング
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// uploads/qrディレクトリの作成
const qrDir = path.join(__dirname, '../uploads/qr');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});

export { app };
