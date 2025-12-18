import axios from "axios";

import type { TopicType } from "@/shared/types/Topics.types";
import type { GetArticlesResponseProps } from "@/features/topicsHome/model/GetArticlesResponseProps";

export const getArticles = async (
  topicId: TopicType
): Promise<GetArticlesResponseProps> => {
  try {
    const response = await axios.get(`/api/articles?topicId=${topicId}`);
    return response.data;
  } catch (err) {
    console.error("❌ api fetch 실패:", err);
    throw err;
  }
};
