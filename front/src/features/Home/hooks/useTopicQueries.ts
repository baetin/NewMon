import { useQuery } from '@tanstack/react-query';

import { getHotTopicArticles } from '@/features/home/api/getHotTopicArticles';
import { getInterestsArticles } from '@/features/home/api/getInterestsArticles';

import { homeQuerykeys } from '../model/queryKeys';

const THREE_MINUTE = 1000 * 60 * 3;

export const useHotTopicQuery = () => {
  return useQuery({
    queryKey: homeQuerykeys.hotTopics,
    queryFn: getHotTopicArticles,
    staleTime: THREE_MINUTE,
  });
};

export const useInterestsQuery = () => {
  return useQuery({
    queryKey: homeQuerykeys.interests,
    queryFn: getInterestsArticles,
    staleTime: THREE_MINUTE,
  });
};
