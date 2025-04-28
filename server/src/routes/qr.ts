import express from "express";
import { generateQRCode } from "../controllers/qr";
import path from "path";
import fs from "fs";

const router = express.Router();

// QRコード生成API
router.post("/generate", generateQRCode);

// QRコード画像ダウンロード用エンドポイント
router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  // セキュリティ: パスの正規化と拡張子チェック
  if (!/^[\w.-]+\.png$/.test(filename)) {
    return res.status(400).json({ error: "不正なファイル名です" });
  }
  const filePath = path.join(__dirname, "../../public/qr", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "ファイルが存在しません" });
  }
  res.download(filePath);
});

export default router; 