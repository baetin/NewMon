import { useMutation, useQueryClient } from '@tanstack/react-query';

// TODO: features 로 돼 있는 경로 수정
import { homeQuerykeys } from '@/features/home/model/queryKeys';

import { postUserInterests } from '../api/postUserInterests';

export const useUserInterestsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUserInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: homeQuerykeys.interests,
      });
    },
  });
};
