import { useQuery } from '@tanstack/react-query';

import { getSessionCheck } from '@/features/auth/api/getSessionCheck';

export const useSessionCheckQuery = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: getSessionCheck,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
