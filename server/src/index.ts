import express from 'express';
import cors from 'cors';
import path from 'path';
import storeRoutes from './routes/store';
import menuRoutes from './routes/menu';
import qrRoutes from './routes/qr';
import authRoutes from './routes/auth';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

// CORSの設定
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.50:5173'],
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

// uploads/qrディレクトリの作成
const qrDir = path.join(__dirname, '../uploads/qr');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
