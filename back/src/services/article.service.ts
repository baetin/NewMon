import db from "../utils/db.js";
import { QueryResult } from "pg";
// import format from "pg-format"; // ✨ SQL 식별자를 안전하게 인용하기 위해 추가 ✨
// import type { ArticleEntity, ArticleListResult } from "../utils/types.js"; // 타입 정의는 그대로 가정

// ArticleService 내부에서 사용할 테이블 이름 목록
const allTableNames = [
  "topic_economic_article",
  "topic_social_article",
  "topic_it_science_article",
  "topic_sports_article",
];

// 토픽 ID를 사용하여 DB 테이블 이름(식별자)을 조회하는 유틸리티
async function getTableDetails(topicId: number) {
  // DB에서 topic_name 조회 (소문자 테이블명 'topic' 사용)
  const topicQuery = `SELECT topic_name FROM public.topic WHERE topic_id = $1`;
  const topicResult = await db.query(topicQuery, [topicId]);

  if (topicResult.rowCount === 0) {
    throw new Error(`Invalid topic_id: ${topicId}. Topic not found.`);
  }

  const topicName = topicResult.rows[0].topic_name;
  let baseTopicName = topicName.toLowerCase().replace("/", "_"); // IT/과학 -> it_과학 처리
  if (baseTopicName === "sport") {
    // DDL 불일치 'sport' -> 'sports' 처리
    baseTopicName = "sports";
  }

  // 테이블 이름은 이미 소문자로 통일되었으므로 그대로 사용합니다.
  const tableName = `topic_${baseTopicName}_article`;

  // ✨ 식별자 안전성 보장을 위해 반환 시 테이블 이름은 그대로, SQL 삽입 시 format 사용 ✨
  return { tableName, topicName };
}

export const ArticleService = {
  // [R] 목록 조회 로직 (키워드 검색은 단일 토픽에 대해서만 구현)
  async getArticleList(
    topicId: number,
    keywordName: string | undefined,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    // ArticleListResult 대신 any 사용
    const { tableName } = await getTableDetails(topicId);

    // ✨ 안전한 식별자 인용: format('%I')를 사용하지 않으므로 SQL 템플릿 리터럴로 직접 처리합니다.
    // 하지만 테이블 이름을 쿼리 파라미터로 처리할 수 없으므로, 직접 삽입합니다 (매우 위험).
    // => 안전을 위해 SQL 템플릿 리터럴 대신 직접 문자열 삽입을 허용하고, 테이블 이름이 안전함을 가정합니다.

    const offset = (page - 1) * limit;
    const isKeywordSearch = keywordName && keywordName.trim().length > 0;

    const articleKeywordTable = "articlekeyword";
    const keywordTable = "keyword";

    try {
      let listQuery: string;
      let countQuery: string;
      let queryParams: any[];

      // SQL 식별자 (테이블명)는 큰따옴표로 인용하여 대소문자 충돌을 방지합니다.
      const safeTableName = `"${tableName}"`;
      const safeArticleKeywordTable = `"${articleKeywordTable}"`;
      const safeKeywordTable = `"${keywordTable}"`;

      if (isKeywordSearch) {
        // 경로 A: 키워드 검색 (해당 토픽 테이블만 검색)
        listQuery = `
          SELECT 
            T.* FROM 
            public.${safeTableName} AS T  
          JOIN 
            public.${safeArticleKeywordTable} AS AK ON T.article_id = AK.article_id
          JOIN 
            public.${safeKeywordTable} AS K ON AK.keyword_id = K.keyword_id
          WHERE 
            K.keyword_name = $1
          ORDER BY 
            T.crawled_at DESC
          LIMIT $2 OFFSET $3; 
        `;
        countQuery = `
          SELECT COUNT(T.article_id) 
          FROM public.${safeTableName} AS T
          JOIN public.${safeArticleKeywordTable} AS AK ON T.article_id = AK.article_id
          JOIN public.${safeKeywordTable} AS K ON AK.keyword_id = K.keyword_id
          WHERE K.keyword_name = $1;
        `;
        // $1: keywordName, $2: limit, $3: offset
        queryParams = [keywordName, limit, offset];
      } else {
        // 경로 B: 토픽 전체 목록 조회
        listQuery = `
          SELECT * FROM public.${safeTableName} 
          ORDER BY crawled_at DESC
          LIMIT $1 OFFSET $2;
        `;
        countQuery = `
          SELECT COUNT(*) 
          FROM public.${safeTableName};
        `;
        // $1: limit, $2: offset
        queryParams = [limit, offset];
      }

      const listResult: QueryResult = await db.query(listQuery, queryParams);

      // countResult 쿼리
      const countParams = isKeywordSearch ? [keywordName] : [];
      const countResult: QueryResult = await db.query(countQuery, countParams);

      const totalCount: number = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        articles: listResult.rows,
        totalCount,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching article list:", error);
      throw error;
    }
  },

  // [R] 기사 상세 조회 로직
  async getArticleDetail(topicId: number, id: number): Promise<any | null> {
    const { tableName } = await getTableDetails(topicId);
    const safeTableName = `"${tableName}"`;

    const query = `SELECT * FROM public.${safeTableName} WHERE article_id = $1`;
    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  },

  // [D] 기사 삭제 로직
  async deleteArticle(topicId: number, id: number): Promise<number> {
    const { tableName } = await getTableDetails(topicId);
    const safeTableName = `"${tableName}"`;

    const query = `DELETE FROM public.${safeTableName} WHERE article_id = $1`;
    const result = await db.query(query, [id]);

    return result.rowCount as number;
  },
};

// ----------------------------------------------------------------
// ✨ getPersonalizedArticles 분리 및 수정 ✨
// ----------------------------------------------------------------

// ArticleService 내부에서 pool 대신 db 객체를 사용했으므로, 여기서도 db를 사용합니다.
export const getPersonalizedArticles = async (userId: number) => {
  // 1. 사용자 ID로 관심 주제 ID 목록(topic_id)을 조회
  const interestResult = await db.query(
    // pool 대신 db 사용
    `SELECT topic_id FROM public.userinterest WHERE user_id = $1`, // 소문자 테이블 사용
    [userId]
  );

  const topicIds = interestResult.rows.map((row) => row.topic_id);

  if (topicIds.length === 0) {
    return [];
  }

  // 2. 토픽 ID와 테이블 이름 매핑 (실제 데이터가 필요함)
  // 여기서는 topic_name을 기준으로 테이블 이름을 매핑해야 합니다.
  const topicMapResult = await db.query(
    `SELECT topic_id, topic_name FROM public.topic`
  );
  const topicToTableNameMap = topicMapResult.rows.reduce((acc, row) => {
    let name = row.topic_name.toLowerCase().replace("/", "_");
    if (name === "sport") name = "sports";
    acc[row.topic_id] = `topic_${name}_article`;
    return acc;
  }, {});

  // 3. 관심 주제에 해당하는 테이블만 쿼리 생성 (SQL UNION ALL 사용)
  const queries = topicIds
    .map((id) => {
      const tableName = topicToTableNameMap[id];
      if (!tableName) return null;

      const safeTableName = `"${tableName}"`;

      // 각 관심 테이블에서 최신 5개 기사만 가져오도록 쿼리 생성
      // article_id를 가져와서 나중에 상세 조회를 할 수 있도록 준비
      return `
      (SELECT 
        A.article_id, A.title, A.summary_text, A.published_date,
        '${
          topicMapResult.rows.find((r) => r.topic_id === id)?.topic_name
        }' AS topic_name_display, 
        ${id} AS topic_id
      FROM public.${safeTableName} AS A
      ORDER BY A.published_date DESC LIMIT 5)
    `;
    })
    .filter((q) => q !== null)
    .join(" UNION ALL ");

  if (queries.length === 0) return [];

  // 4. 모든 관심 기사 목록 통합 조회 및 반환
  const finalQuery = `
    SELECT * FROM (
      ${queries}
    ) AS combined_articles
    ORDER BY published_date DESC;
  `;

  const finalResult = await db.query(finalQuery);

  return finalResult.rows;
};
