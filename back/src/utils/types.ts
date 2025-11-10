// types.ts

export type Topic = "Economic" | "IT_Science" | "Social" | "Sport";

export interface ArticleData {
  keyword_id: number;
  title: string;
  full_text: string;
  original_url?: string;
  summary?: string;
  category?: string;
  publisher?: string;
}

export interface ArticleEntity extends ArticleData {
  article_id: number;
  crawled_at: Date;
  // 기타 ERD에 정의된 필드 (objectivity_score, information_depth 등)
}
