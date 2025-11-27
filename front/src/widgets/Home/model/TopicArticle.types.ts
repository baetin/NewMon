export interface TopicArticle {
  article_id: number;
  title: string;
  summary_text: string | null;
  full_text: string | null;
  image_url: string | null;
  published_date: string;
  topic_table: string;
}
