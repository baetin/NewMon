export interface ArticleDataTypes {
  article_id: number;
  title: string;
  summary_text: string;
  before_text?: string; // 추후 변경 가능
  full_text: string;
  image_url: string;
  source: string;
  published_date: string;
  crawled_at: string;
  information_depth: string;
  focus_area: string;
  objectivity_score: string;
}
