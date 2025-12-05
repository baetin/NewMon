import type { ArticleDataTypes } from "../../../shared/types/Article.types";
import type { TopicType } from "../../../shared/types/Topics.types";

export interface GetSearchArticlesProps {
  topicId: TopicType | null;
  keywordName: string;
  page?: number;
}

export interface SearchArticlesResponse {
  articles: ArticleDataTypes[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
