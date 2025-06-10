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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToStorage = exports.uploadImage = exports.StorageFolders = void 0;
const firebase_1 = require("../config/firebase");
var StorageFolders;
(function (StorageFolders) {
    StorageFolders["QR"] = "qr";
    StorageFolders["STORE_LOGOS"] = "store_logos";
    StorageFolders["MENU_IMAGES"] = "menu_images";
})(StorageFolders || (exports.StorageFolders = StorageFolders = {}));
// MIMEタイプの判定
const getMimeType = (originalname) => {
    var _a;
    const ext = (_a = originalname.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        default:
            return 'image/jpeg';
    }
};
// ファイル名の生成
const generateFileName = (prefix, originalname) => {
    var _a;
    const timestamp = Date.now();
    const ext = ((_a = originalname.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'jpg';
    return `${prefix}_${timestamp}.${ext}`;
};
// Cloud Storageへの画像アップロード
const uploadImage = (file_1, folder_1, ...args_1) => __awaiter(void 0, [file_1, folder_1, ...args_1], void 0, function* (file, folder, prefix = '') {
    try {
        const filename = generateFileName(prefix, file.originalname);
        const destination = `${folder}/${filename}`;
        const fileUpload = firebase_1.storageBucket.file(destination);
        // メタデータの設定
        const metadata = {
            contentType: file.mimetype,
            cacheControl: 'public, max-age=31536000',
        };
        // ファイルのアップロード
        yield fileUpload.save(file.buffer, {
            metadata: metadata,
        });
        // 署名付きURLの取得（1時間有効）
        const [url] = yield fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000,
        });
        return url;
    }
    catch (error) {
        console.error('Error uploading image to storage:', error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadImage = uploadImage;
const uploadImageToStorage = (buffer_1, originalname_1, folder_1, ...args_1) => __awaiter(void 0, [buffer_1, originalname_1, folder_1, ...args_1], void 0, function* (buffer, originalname, folder, prefix = '') {
    try {
        const filename = generateFileName(prefix, originalname);
        const destination = `${folder}/${filename}`;
        const fileUpload = firebase_1.storageBucket.file(destination);
        yield fileUpload.save(buffer, {
            metadata: {
                contentType: getMimeType(originalname),
            },
        });
        // 署名付きURLを取得（1時間有効）
        const [url] = yield fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600000, // 1時間有効
        });
        return url;
    }
    catch (error) {
        console.error('Error uploading image to storage:', error);
        throw new Error('Failed to upload image');
    }
});
exports.uploadImageToStorage = uploadImageToStorage;
