"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const store_1 = __importDefault(require("./routes/store"));
const menu_1 = __importDefault(require("./routes/menu"));
const qr_1 = __importDefault(require("./routes/qr"));
const auth_1 = __importDefault(require("./routes/auth"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
exports.app = app;
const port = Number(process.env.PORT) || 3000;
// CORSの設定
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://192.168.1.50:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// JSONとURLエンコードされたボディの解析
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 静的ファイルの提供
app.use('/qr', express_1.default.static(path_1.default.join(__dirname, '../uploads/qr')));
// ルーティング
app.use('/api/stores', store_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/qr', qr_1.default);
app.use('/api/auth', auth_1.default);
// uploads/qrディレクトリの作成
const qrDir = path_1.default.join(__dirname, '../uploads/qr');
if (!fs_1.default.existsSync(qrDir)) {
    fs_1.default.mkdirSync(qrDir, { recursive: true });
}
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});
