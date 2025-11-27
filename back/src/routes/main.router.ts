import { Router } from 'express';
import { mainController } from '../controllers/main.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; 

const mainRouter = Router();

// 1. 핫 토픽 경로 (인증 불필요 - 선택적)
// 일반적으로 핫 토픽은 비로그인 사용자에게도 보여줍니다. (여기서는 인증을 제외했습니다.)
mainRouter.get('/hot', mainController.getHotFeed);

// 2. 개인화 피드 경로 (인증 필수)
mainRouter.get('/personalized', authMiddleware, mainController.getPersonalFeed);

export default mainRouter;