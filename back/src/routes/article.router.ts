// article.router.ts
import { Router } from "express";
import { articleController } from "../controllers/article.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", articleController.getArticles);

// [R] READ: 기사 상세 조회 (GET /api/articles/IT_Science/123)
router.get("/:topic/:id", articleController.readArticleDetail);

// [D] DELETE: 기사 삭제 (DELETE /api/articles/Sport/456)
router.delete("/:topic/:id", articleController.deleteArticle);

router.get("/search", articleController.searchArticles);

router.get("/personalized", authMiddleware, (req, res) => {
  // req.userId는 미들웨어를 통과하며 자동으로 추가된 사용자 ID입니다.
  const userId = req.userId;

  // 이 부분에서 userId를 사용하여 UserInterest 테이블을 조회하고 맞춤형 피드를 제공하는 로직을 작성합니다.
  return res.status(200).json({
    message: `Personalized feed for user ${userId}`,
    data: [],
  });
});

export default router;
