import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { adminOnly } from "../middleware/adminOnly";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

// リスト & 作成
router
  .route("/")
  .get(authenticate, adminOnly, getUsers)
  .post(authenticate, adminOnly, createUser);

// 個別取得・更新・削除
router
  .route("/:id")
  .get(authenticate, adminOnly, getUserById)
  .put(authenticate, adminOnly, updateUser)
  .delete(authenticate, adminOnly, deleteUser);

export default router; 