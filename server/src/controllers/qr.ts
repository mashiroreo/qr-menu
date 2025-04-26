import { Request, Response } from "express";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

// QRコード画像の保存先
const qrDir = path.join(__dirname, "../../public/qr");
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// QRコード生成API
export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.body;
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }
    const qrUrl = `${req.protocol}://${req.get("host")}/menu/${storeId}`;
    const fileName = `store_${storeId}_${Date.now()}.png`;
    const filePath = path.join(qrDir, fileName);
    await QRCode.toFile(filePath, qrUrl, { width: 400 });
    const publicPath = `/qr/${fileName}`;
    res.json({ url: publicPath });
  } catch (error) {
    console.error("[QR] Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
}; 