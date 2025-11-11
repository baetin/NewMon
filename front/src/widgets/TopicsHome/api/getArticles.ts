import axios from "axios";
import type { ArticleDataTypes } from "../../../shared/types/Article.types";
import type { TopicType } from "../../../shared/types/Topics.types";

export const getArticles = async (
  topicId: TopicType
): Promise<ArticleDataTypes[]> => {
  try {
    const response = await axios.get<ArticleDataTypes[]>(
      `/api/articles?topicId=${topicId}`
    );
    return response.data;
  } catch (error) {
    console.error("api fetch 실패", error);
    throw error;
  }
};
