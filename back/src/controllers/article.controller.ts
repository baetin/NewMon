// article.controller.ts
import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service.js';

export const articleController = {
    // 1. [R] 목록 조회: GET /api/articles?topicId=...&keywordName=...&page=...
    async getArticles(req: Request, res: Response) {
        const { topicId, keywordName, page, limit } = req.query; 
        
        const idNum = parseInt(topicId as string);

        // 1. topicId 파라미터 검증 (숫자 유효성)
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({ 
                message: '유효한 토픽 ID(topicId)가 필요합니다. (숫자 형태)'
            });
        }
        
        // 2. 파라미터 파싱
        const keyword = typeof keywordName === 'string' && keywordName.trim() !== '' ? keywordName : undefined; 
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        
        try {
            // 3. 서비스 호출
            const listData = await ArticleService.getArticleList(
                idNum, // Topic ID (number)
                keyword, 
                pageNum, 
                limitNum 
            );
            
            res.status(200).json(listData);

        } catch (error: any) {
            console.error("Error in getArticles:", error);
            // Topic ID 조회 실패 에러 처리 (TopicMaster에서 던진 에러)
            if (error.message.includes('Topic not found')) {
                 return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: '기사 목록 조회 중 서버 오류 발생', detail: error.message });
        }
    },

    // 2. [R] 기사 상세 조회: GET /api/articles/:topicId/:id
    async readArticleDetail(req: Request, res: Response) {
        const { topicId, id } = req.params;
        const topicIdNum = parseInt(topicId);
        const articleId = parseInt(id);

        if (isNaN(topicIdNum) || isNaN(articleId) || topicIdNum <= 0) {
            return res.status(400).json({ message: '유효하지 않은 토픽 ID 또는 기사 ID입니다.' });
        }

        try {
            const article = await ArticleService.getArticleDetail(topicIdNum, articleId);
            
            if (!article) {
                return res.status(404).json({ message: `기사 ID ${id}를 찾을 수 없습니다.` });
            }

            res.status(200).json(article);
        } catch (error: any) {
            console.error(error);
            if (error.message.includes('Topic not found')) {
                 return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: '기사 상세 조회 중 오류 발생', detail: error.message });
        }
    },

    // 3. [D] 기사 삭제: DELETE /api/articles/:topicId/:id
    async deleteArticle(req: Request, res: Response) {
        const { topicId, id } = req.params;
        const topicIdNum = parseInt(topicId);
        const articleId = parseInt(id);

        if (isNaN(topicIdNum) || isNaN(articleId) || topicIdNum <= 0) {
            return res.status(400).json({ message: '유효하지 않은 토픽 ID 또는 기사 ID입니다.' });
        }

        try {
            const rowCount = await ArticleService.deleteArticle(topicIdNum, articleId);

            if (rowCount === 0) {
                return res.status(404).json({ message: `기사 ID ${id}를 찾을 수 없거나 삭제할 수 없습니다.` });
            }

            res.status(200).json({ message: `기사 ID ${id}가 성공적으로 삭제되었습니다. (Topic ID: ${topicIdNum})` });
        } catch (error: any) {
            console.error(error);
            if (error.message.includes('Topic not found')) {
                 return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: '기사 삭제 중 오류 발생', detail: error.message });
        }
    }
};