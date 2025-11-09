// article.controller.ts
import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service.js';
import { ArticleData, Topic } from '../utils/types.js';

// Topic 유효성 검사 함수 (SQL Injection 및 타입 안전성 확보)
const isValidTopic = (topic: string): topic is Topic => {
  return ['Economic', 'IT_Science', 'Social', 'Sport'].includes(topic);
};

export const articleController = {
  // 1. CREATE: POST /api/articles/:topic
  async createArticle(req: Request, res: Response) {
    const { topic } = req.params;
    const data: ArticleData = req.body;
    
    // Topic 유효성 검증
    if (!isValidTopic(topic)) {
      return res.status(400).json({ message: '유효하지 않은 주제(Topic)입니다.' });
    }
    
    // 필수 항목 검증
    if (!data.keyword_id || !data.title || !data.full_text) {
      return res.status(400).json({ message: 'keyword_id, title, full_text는 필수 항목입니다.' });
    }

    try {
      const newArticle = await ArticleService.createArticle(topic, data);
      res.status(201).json({ 
        message: '기사가 성공적으로 생성되었습니다.', 
        data: newArticle 
      });
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('유효하지 않은 keyword_id')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: '기사 생성 중 서버 오류 발생' });
    }
  },

  // 2. READ: GET /api/articles/:topic/:id
  async readArticleDetail(req: Request, res: Response) {
    const { topic, id } = req.params;
    const articleId = parseInt(id);

    if (!isValidTopic(topic) || isNaN(articleId)) {
        return res.status(400).json({ message: '유효하지 않은 주제 또는 기사 ID입니다.' });
    }

    try {
      const article = await ArticleService.getArticleDetail(topic, articleId);
      
      if (!article) {
        return res.status(404).json({ message: `주제(${topic})의 기사 ID ${id}를 찾을 수 없습니다.` });
      }

      res.status(200).json(article);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '기사 상세 조회 중 오류 발생' });
    }
  },

  // 3. DELETE: DELETE /api/articles/:topic/:id
  async deleteArticle(req: Request, res: Response) {
    const { topic, id } = req.params;
    const articleId = parseInt(id);

    if (!isValidTopic(topic) || isNaN(articleId)) {
        return res.status(400).json({ message: '유효하지 않은 주제 또는 기사 ID입니다.' });
    }

    try {
      const rowCount = await ArticleService.deleteArticle(topic, articleId);

      if (rowCount === 0) {
        return res.status(404).json({ message: `주제(${topic})의 기사 ID ${id}를 찾을 수 없습니다.` });
      }

      res.status(200).json({ message: `기사 ID ${id}가 성공적으로 삭제되었습니다. (주제: ${topic})` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '기사 삭제 중 오류 발생' });
    }
  }
};