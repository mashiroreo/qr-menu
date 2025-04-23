import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import path from 'path';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import storeRouter from './routes/store';
import menuRouter from './routes/menu';

const app = express();
const port = 3000;

// ✅ CORSの詳細設定
app.use(cors({
  origin: "http://localhost:5173", // フロントの開発サーバーURL
  credentials: true,
}));

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/menu', menuRouter);

// 画像ファイルの静的配信設定
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { app };
