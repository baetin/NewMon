import pool from '../utils/db.js'; 
import { PoolClient } from 'pg';
import format from 'pg-format'; 

const getTopicToTableNameMap = async (client: PoolClient): Promise<Record<number, string>> => {
    const topicMapResult = await client.query(`SELECT topic_id, topic_name FROM public.topic`);
    
    return topicMapResult.rows.reduce((acc, row) => {
        let name = row.topic_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
        if (name.includes('it_') && name.includes('science')) {
            name = 'it_science';
        } else if (name === "sport") {
            name = "sports";
        }

        acc[row.topic_id] = `topic_${name}_article`;
        return acc;
    }, {});
};

// 이 함수는 모든 서비스에서 필요하므로 유지합니다.
export const getHotTopics = async (): Promise<any[]> => {
    const client: PoolClient = await pool.connect();
    
    try {
        const topicToTableNameMap = await getTopicToTableNameMap(client);
        const allTableNames = Object.values(topicToTableNameMap);
        
        if (allTableNames.length === 0) return [];
        
        // 4개 테이블 UNION ALL 쿼리 생성
        const unionHotQueries = allTableNames.map(tableName => {
            const safeTableName = client.escapeIdentifier(tableName); 
            const safeTopicTableValue = client.escapeLiteral(tableName);
            
            return `
                (SELECT 
                    article_id, title, summary_text, full_text, image_url, published_date, -- ✨ full_text 추가 ✨
                    ${safeTopicTableValue} AS topic_table 
                FROM public.${safeTableName}
                ORDER BY published_date DESC 
                LIMIT 5)
            `;
        }).join(' UNION ALL '); 

        const hotTopicsQuery = `
            SELECT * FROM (${unionHotQueries}) AS combined_articles
            ORDER BY published_date DESC
            LIMIT 5;
        `;
        
        const hotTopicsResult = await client.query(hotTopicsQuery); 
        return hotTopicsResult.rows;

    } catch (error) {
        console.error("Error fetching hot topics:", error);
        throw error; 
    } finally {
        client.release();
    }
};


// ----------------------------------------------------
// 2. 개인화 피드 조회 서비스 (새 함수)
// ----------------------------------------------------
export const getPersonalizedFeed = async (userId: number): Promise<any[]> => {
    const client: PoolClient = await pool.connect();
    
    let personalizedFeed: any[] = []; 
    
    try {
        const topicToTableNameMap = await getTopicToTableNameMap(client);
        
        // ----------------------------------------------------
        // 1. 사용자 관심 주제 ID 조회 (최대 2개만 선택)
        // ----------------------------------------------------
        
        const interestResult = await client.query(
            `SELECT topic_id FROM public.userinterest WHERE user_id = $1`, 
            [userId]
        );
        
        const interestedTopicIds = interestResult.rows
                                                 .map(row => row.topic_id)
                                                 .slice(0, 2); 
        
        if (interestedTopicIds.length === 0) {
            client.release();
            return []; // 관심 주제가 없으면 빈 배열 반환
        }
        
        // ----------------------------------------------------
        // 2. 개인화 피드 쿼리 생성 및 실행
        // ----------------------------------------------------
        
        // ✨ 수정: personalizedQueries 변수를 여기서 선언 및 할당합니다. ✨
        const personalizedQueries = interestedTopicIds.map(topicId => { 
            const tableName = topicToTableNameMap[topicId];
            if (!tableName) return null;
            
            const safeTableName = client.escapeIdentifier(tableName); 
            
            // 해당 관심 테이블에서 무작위 3개씩 조회
            return `
                (SELECT 
                    article_id, title, summary_text, full_text, image_url, published_date, 
                    ${topicId} AS topic_id,
                    (SELECT topic_name FROM public.topic WHERE topic_id = ${topicId}) AS topic_name
                FROM public.${safeTableName} 
                ORDER BY RANDOM() 
                LIMIT 3)
            `;
        }).filter(q => q !== null); 

        
        // 3. 모든 개인화 쿼리 통합 및 실행
        if (personalizedQueries.length > 0) {
            const finalPersonalizedQuery = personalizedQueries.join(' UNION ALL ');
            const personalizedResult = await client.query(finalPersonalizedQuery);
            personalizedFeed = personalizedResult.rows; 
        }
        
        // ✨ 최종 반환 ✨
        return personalizedFeed; 
    } catch (error) {
        console.error("Error fetching personalized feed data:", error);
        throw error; 
    } finally {
        client.release();
    }
};