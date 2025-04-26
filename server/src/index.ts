import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import path from 'path';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import storeRouter from './routes/store';
import menuRouter from './routes/menu';
import qrRouter from './routes/qr';

const app = express();
const port = 3000;

// ✅ CORSの詳細設定
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.1.50:5173"
  ], // フロントの開発サーバーURLとスマホ用IP
  credentials: true,
}));

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/menu', menuRouter);
app.use('/api/qr', qrRouter);

// 画像ファイルの静的配信設定
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/qr', express.static(path.join(__dirname, '../public/qr')));

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { app };
