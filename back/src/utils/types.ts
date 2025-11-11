// types.ts (수정 후 최종 버전)

export type Topic = "Economic" | "IT_Science" | "Social" | "Sport";

// CREATE/UPDATE 시 API 요청 바디에 들어오는 데이터 형태
export interface ArticleData {
    keyword_id: number;
    title: string;
    full_text: string;
    
    // DDL: summary_text 에 대응
    summary: string; 
    
    // DDL: image_url 에 대응
    image_url?: string; 
    
    // DDL: "source" 에 대응
    publisher?: string; 
    
    // DDL의 NOT NULL 필드
    published_date: Date | string; 
    information_depth: string;
    objectivity_score: number | string; 
    focus_area?: string; 
}

// ----------------------------------------------------
// 💡 [추가된 부분] ArticleEntity 정의
// ----------------------------------------------------
// DB에서 조회되어 반환되는 데이터 형태
export interface ArticleEntity extends ArticleData {
    article_id: number; // DB의 Primary Key
    crawled_at: Date;   // DB의 자동 생성 값
    // Note: DDL의 'summary_text'나 'source'가 있다면 여기서 매핑 필요.
    // 하지만 서비스 코드에서 DDL 불일치 문제를 ArticleData에서 해결했으므로, 
    // 여기서는 DB가 추가하는 필드만 명시적으로 추가합니다.
}
// ----------------------------------------------------

export interface ArticleListResult {
    articles: ArticleEntity[]; 
    totalCount: number;      
    totalPages: number;     
}