// article.router.ts
import { Router } from 'express';
import { articleController } from '../controllers/article.controller.js'

const router = Router();


router.get('/', articleController.getArticles);

// [R] READ: 기사 상세 조회 (GET /api/articles/IT_Science/123)
router.get('/:topic/:id', articleController.readArticleDetail); 

// [D] DELETE: 기사 삭제 (DELETE /api/articles/Sport/456)
router.delete('/:topic/:id', articleController.deleteArticle); 

export default router;