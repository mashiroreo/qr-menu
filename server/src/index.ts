import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import userRouter from './routes/user';

const app = express();
const port = 3000;

// ✅ CORSの詳細設定
app.use(cors({
  origin: "http://localhost:5173", // フロントの開発サーバーURL
  credentials: true,
}));

app.use(express.json());
app.use('/api/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
