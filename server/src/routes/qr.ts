import express from "express";
import { generateQRCode } from "../controllers/qr";

const router = express.Router();

// QRコード生成API
router.post("/generate", generateQRCode);

export default router; 