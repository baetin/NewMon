// crawl.router.ts

import { Router } from 'express';
import { triggerImport } from '../controllers/crawl.controller.js';

const router: Router = Router();

// POST 요청을 /trigger 경로에 매핑 -> triggerImport 함수 실행
router.post('/trigger', triggerImport);

export default router;