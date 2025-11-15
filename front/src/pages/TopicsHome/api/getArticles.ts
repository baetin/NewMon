import axios from "axios";
import type { ArticleDataTypes } from "../../../shared/types/Article.types";
import type { TopicType } from "../../../shared/types/Topics.types";

interface GetArticlesResponseProps {
  articles: ArticleDataTypes[];
  totalCount?: number;
  totalPages?: number;
}

export const getArticles = async (
  topicId: TopicType
): Promise<GetArticlesResponseProps[]> => {
  try {
    const response = await axios.get(`/api/articles?topicId=${topicId}`);
    const data = response.data;

    // 배열이 아니면 배열로 감싸기
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("api fetch 실패", error);
    return [];
  }
};
