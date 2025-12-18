import { useQuery } from '@tanstack/react-query';

import { getHotTopicArticles } from '@/features/home/api/getHotTopicArticles';

import { homeQuerykeys } from '../model/queryKeys';

export const useHotTopicQuery = () => {
  return useQuery({
    queryKey: homeQuerykeys.hotTopics,
    queryFn: getHotTopicArticles,
    staleTime: 1000 * 60 * 3, // 3분
  });
};
