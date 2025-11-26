import { useQuery } from "@tanstack/react-query";
import type { TopicType } from "../../../shared/types/Topics.types";
import { getArticles } from "../api/getArticles";
import type { GetArticlesResponseProps } from "../model/GetArticlesResponseProps";

export const useArticlesQuery = (topicId: TopicType) => {
  return useQuery<GetArticlesResponseProps, Error>({
    queryKey: ["article", topicId],
    queryFn: () => getArticles(topicId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
