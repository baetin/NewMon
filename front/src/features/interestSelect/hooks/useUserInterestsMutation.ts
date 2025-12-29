import { useMutation } from '@tanstack/react-query';

import { homeQuerykeys } from '@/features/home/model/queryKeys';
import { queryClient } from '@/shared/lib';

import { postUserInterests } from '../api/postUserInterests';

export const useUserInterestsMutation = () => {
  return useMutation({
    mutationFn: postUserInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: homeQuerykeys.interests,
      });
    },
  });
};
