"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qr_1 = require("../controllers/qr");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// QRコード生成API
router.post("/generate", qr_1.generateQRCode);
// QRコード画像ダウンロード用エンドポイント
router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    // セキュリティ: パスの正規化と拡張子チェック
    if (!/^[\w.-]+\.png$/.test(filename)) {
        return res.status(400).json({ error: "不正なファイル名です" });
    }
    const filePath = path_1.default.join(__dirname, "../../public/qr", filename);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ error: "ファイルが存在しません" });
    }
    res.download(filePath);
});
exports.default = router;
