import type { ArticleDataTypes } from "../../../shared/types/Article.types";

export interface GetArticlesResponseProps {
  articles: ArticleDataTypes[];
  totalCount?: number;
  totalPages?: number;
}
