import { useQuery } from '@tanstack/react-query';

import { getInterestsArticles } from '@/features/home/api/getInterestsArticles';

import { homeQuerykeys } from '../model/queryKeys';

export const useInterestsQuery = () => {
  return useQuery({
    queryKey: homeQuerykeys.interests,
    queryFn: getInterestsArticles,
    staleTime: 1000 * 60 * 3,
  });
};
