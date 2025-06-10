"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// QRコード画像の保存先
const qrDir = path_1.default.join(__dirname, "../../uploads/qr");
if (!fs_1.default.existsSync(qrDir)) {
    fs_1.default.mkdirSync(qrDir, { recursive: true });
}
// QRコード生成API
const generateQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { storeId } = req.body;
        if (!storeId) {
            return res.status(400).json({ error: "storeId is required" });
        }
        const APP_URL = process.env.APP_URL || 'http://localhost:5173';
        const qrUrl = `${APP_URL}/menu/${storeId}`;
        const fileName = `store_${storeId}_${Date.now()}.png`;
        const filePath = path_1.default.join(qrDir, fileName);
        yield qrcode_1.default.toFile(filePath, qrUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        const publicPath = `/qr/${fileName}`;
        res.json({ url: publicPath });
    }
    catch (error) {
        console.error("[QR] Error generating QR code:", error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }
});
exports.generateQRCode = generateQRCode;
