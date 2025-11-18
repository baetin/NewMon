// src/routes/user.router.ts 파일 (수정)

import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userRouter = Router();

// ✨ POST /api/user/interests - 관심 주제 업데이트 ✨
userRouter.post("/interests", authMiddleware, userController.updateInterests);

// 참고: GET /profile이나 PUT /profile 같은 불필요한 경로는 제거합니다.

export default userRouter;
