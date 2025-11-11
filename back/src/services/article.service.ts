// article.service.ts
import db from '../utils/db.js'; 
import { QueryResult } from 'pg';
import type { ArticleEntity, ArticleListResult } from '../utils/types.js';

// 토픽 ID를 사용하여 DB 테이블 이름을 조회하고 조합하는 로직
async function getTableDetails(topicId: number) {
    // 1. Topic 테이블에서 topic_name 조회 (Topic 테이블 이름은 DDL에 따라 "Topic" 또는 "topic" 중 하나일 수 있으므로 "Topic"을 사용하여 시도)
    const topicQuery = `SELECT topic_name FROM public.topic WHERE topic_id = $1`;
    const topicResult = await db.query(topicQuery, [topicId]);

    if (topicResult.rowCount === 0) {
        throw new Error(`Invalid topic_id: ${topicId}. Topic not found.`); 
    }
    
    let topicName = topicResult.rows[0].topic_name; 
    
    // 2. topic_name을 DDL에 맞게 변환 및 소문자 통일
    let baseTopicName = topicName.toLowerCase();
    if (baseTopicName === 'sport') {
        baseTopicName = 'sports'; // DDL 불일치('Sports') 해결
    }
    
    // 최종 테이블 이름: DB에 저장된 소문자 이름 (예: topic_sports_article)
    const tableName = `topic_${baseTopicName}_article`; 
    
    return { tableName, topicName };
}

export const ArticleService = {
    // [R] 목록 조회 로직 (LIMIT 10 적용)
    async getArticleList(
        topicId: number, 
        keywordName: string | undefined, 
        page: number = 1, 
        limit: number = 10 
    ): Promise<ArticleListResult> {
        
        const { tableName } = await getTableDetails(topicId); // 💡 ID를 사용해 테이블 이름 조회
        
        const offset = (page - 1) * limit;
        const isKeywordSearch = keywordName && keywordName.trim().length > 0;
        
        // 테이블 이름도 모두 소문자로 변경 (DB와 일치)
        const articleKeywordTable = 'articlekeyword';
        const keywordTable = 'keyword';
        
        try {
            let listQuery: string;
            let countQuery: string;
            let queryParams: any[];

            if (isKeywordSearch) {
                // 경로 A: 키워드 검색
                listQuery = `
                    SELECT 
                        T.*, K.keyword_name 
                    FROM 
                        public.${tableName} AS T  
                    JOIN 
                        public.${articleKeywordTable} AS AK ON T.article_id = AK.article_id
                    JOIN 
                        public.${keywordTable} AS K ON AK.keyword_id = K.keyword_id
                    WHERE 
                        K.keyword_name = $1
                    ORDER BY 
                        T.crawled_at DESC
                    LIMIT 10 OFFSET $2; 
                `;
                countQuery = `
                    SELECT COUNT(T.article_id) 
                    FROM public.${tableName} AS T
                    JOIN public.${articleKeywordTable} AS AK ON T.article_id = AK.article_id
                    JOIN public.${keywordTable} AS K ON AK.keyword_id = K.keyword_id
                    WHERE K.keyword_name = $1;
                `;
                queryParams = [keywordName, offset];
            } else {
                // 경로 B: 토픽 전체 목록 조회
                listQuery = `
                    SELECT * FROM public.${tableName} 
                    ORDER BY crawled_at DESC
                    LIMIT 10 OFFSET $1;
                `;
                countQuery = `
                    SELECT COUNT(*) 
                    FROM public.${tableName};
                `;
                queryParams = [offset]; 
            }

            const listResult: QueryResult = await db.query(listQuery, queryParams);
            const countParams = isKeywordSearch ? [keywordName] : []; 
            const countResult: QueryResult = await db.query(countQuery, countParams);
            
            const totalCount: number = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalCount / 10); 
            
            return {
                articles: listResult.rows as ArticleEntity[],
                totalCount,
                totalPages,
            };

        } catch (error) {
            console.error("Error fetching article list:", error);
            throw error;
        }
    },

    // [R] 기사 상세 조회 로직
    async getArticleDetail(topicId: number, id: number): Promise<ArticleEntity | null> {
        const { tableName } = await getTableDetails(topicId); 
        
        // 💡 쿼리에서 따옴표 제거 (소문자 테이블 접근)
        const query = `SELECT * FROM public.${tableName} WHERE article_id = $1`;
        const result = await db.query(query, [id]);
        
        if (result.rowCount === 0) {
            return null;
        }
        return result.rows[0] as ArticleEntity;
    },

    // [D] 기사 삭제 로직
    async deleteArticle(topicId: number, id: number): Promise<number> {
        const { tableName } = await getTableDetails(topicId); 

        // 💡 쿼리에서 따옴표 제거 (소문자 테이블 접근)
        const query = `DELETE FROM public.${tableName} WHERE article_id = $1`;
        const result = await db.query(query, [id]);

        return result.rowCount as number; 
    }
};