import { useQuery } from '@tanstack/react-query';

import { getSearchArticles } from '../api/getSearchArticles';
import type { GetSearchArticlesProps } from '../model/types';

export const useSearchQuery = ({
  topicId,
  keywordName,
  page = 1,
}: GetSearchArticlesProps) => {
  return useQuery({
    queryKey: ['searchArticles', topicId, keywordName, page],
    queryFn: () => getSearchArticles({ topicId, keywordName, page }),
    enabled: keywordName.trim().length > 0 && topicId !== undefined, // keywordName과 topicId가 있을때만 실행
    placeholderData: page > 1 ? (prev) => prev : undefined, // 부드러운 ux를 위해
  });
};
