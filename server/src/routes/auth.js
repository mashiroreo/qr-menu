"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controllers/auth");
const router = (0, express_1.Router)();
// 認証が必要なルート
router.use(auth_1.authenticate);
// ユーザー情報の取得
router.get("/me", auth_2.getUserInfo);
// ユーザー情報の更新
router.put("/me", auth_2.updateUserInfo);
exports.default = router;
