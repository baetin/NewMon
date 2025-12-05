import { useQuery } from "@tanstack/react-query";
import { getSearchArticles } from "../api/getSearchArticles";
import type { GetSearchArticlesProps } from "../model/types";

export const useSearchQuery = ({
  topicId,
  keywordName,
  page,
}: GetSearchArticlesProps) => {
  return useQuery({
    queryKey: ["searchArticles", topicId, keywordName, page],
    queryFn: () => getSearchArticles({ topicId, keywordName, page }),
    enabled: Boolean(keywordName && topicId), // keywordName과 topicId가 있을때만 실행
    placeholderData: (prevData) => prevData, // 부드러운 ux를 위해
  });
};
