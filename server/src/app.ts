import express from 'express';
import cors from 'cors';
import path from 'path';
import storeRoutes from './routes/store';
import menuRoutes from './routes/menu';
import qrRoutes from './routes/qr';
import authRoutes from './routes/auth';
import fs from 'fs';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Sentry 初期化（DSN が無い場合はスキップ）
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [new ProfilingIntegration()],
  });
}

const app = express();

// CORS
const staticOrigins = [
  'http://localhost:5173',
  'http://192.168.1.50:5173',
  'http://192.168.1.59:5173',
  'http://192.168.1.70:5173',
  'https://q-menu-iota.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (staticOrigins.includes(origin)) return callback(null, true);
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル
app.use('/qr', express.static(path.join(__dirname, '../uploads/qr')));

// Sentry ハンドラ
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ルーティング
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_, res) => res.status(200).json({ status: 'ok' }));

// uploads/qr ディレクトリが無ければ作成
const qrDir = path.join(__dirname, '../uploads/qr');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// エラーハンドラ
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

export { app }; 