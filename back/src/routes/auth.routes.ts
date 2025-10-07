import { Router } from 'express';
import { signupController } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/signup 경로에 signupController 함수를 연결
router.post('/signup', signupController);

export default router;