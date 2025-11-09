// article.service.ts
import db from '../utils/db.js'; 
import { ArticleData, ArticleEntity, Topic } from '../utils/types.js';

export const ArticleService = {
  // CREATE: 기사 생성 로직
  async createArticle(topic: Topic, data: ArticleData): Promise<{ article_id: number, topic: Topic }> {
    const { keyword_id, title, full_text, original_url, summary, category, publisher } = data;
    const tableName = `Topic_${topic}_Article`;
    
    try {
      // 1. 기사 데이터 삽입 (Topic 테이블)
      const articleQuery = `
        INSERT INTO "${tableName}" 
        (title, full_text, summary_text, image_url, source, publisher, category) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING article_id
      `;
      // original_url 대신 image_url 칼럼에 해당 값을 바인딩 ($4)
      const articleResult = await db.query(articleQuery, [
        title, full_text, summary, original_url, publisher, category 
      ]);
      const newArticleId: number = articleResult.rows[0].article_id;

      // 2. ArticleKeyword 테이블에 관계 삽입
      const keywordRelationQuery = `
        INSERT INTO "ArticleKeyword" (article_id, keyword_id) 
        VALUES ($1, $2)
      `;
      await db.query(keywordRelationQuery, [newArticleId, keyword_id]);

      return { article_id: newArticleId, topic };
    } catch (error: any) {
      if (error.code === '23503') { 
        throw new Error('유효하지 않은 keyword_id 입니다. (FK 제약 위반)');
      }
      throw error;
    }
  },

  // READ: 기사 상세 조회 로직
  async getArticleDetail(topic: Topic, id: number): Promise<ArticleEntity | null> {
    const tableName = `Topic_${topic}_Article`; 
    
    // 상세 정보 조회
    const query = `SELECT * FROM "${tableName}" WHERE article_id = $1`;
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0] as ArticleEntity;
  },
  
    // DELETE: 기사 삭제 로직
    async deleteArticle(topic: Topic, id: number): Promise<number> {
    const tableName = `Topic_${topic}_Article`; 

    // 삭제 쿼리 실행
    const query = `DELETE FROM "${tableName}" WHERE article_id = $1`;
    const result = await db.query(query, [id]);

        // **오류 해결 부분:** result.rowCount를 number로 명시적으로 캐스팅합니다.
    return result.rowCount as number; 
    }
};