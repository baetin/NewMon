import { useQuery } from '@tanstack/react-query';

import { getArticles } from '@/features/topicsHome/api/getArticles';
import type { TopicType } from '@/shared/types/Topics.types';

export const useArticlesQuery = (topicId: TopicType) => {
  return useQuery({
    queryKey: ['articles', 'byTopic', topicId],
    queryFn: () => getArticles(topicId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: topicId !== undefined,
  });
};
