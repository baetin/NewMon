import { Router } from "express";
// 컨트롤러 파일을 .js 확장자로 불러옵니다 (이전 설정 반영).
import { googleAuthCallbackController } from "../controllers/auth.controller.js";

const router = Router();

// POST /google-login 경로를 컨트롤러에 연결
router.post("/google-login", googleAuthCallbackController);

// (이전에 구현했던 signup과 login 컨트롤러는 이 파일에 모두 연결됩니다.)

export default router;
