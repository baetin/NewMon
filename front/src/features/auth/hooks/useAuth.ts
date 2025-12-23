import { useSessionCheckQuery } from './useSessionCheckQuery';

// 현재 클라이언트 상태 읽기
export const useAuth = () => {
  const { data, isPending, isError } = useSessionCheckQuery();

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    isPending,
    userId: data?.userId ?? null,
    displayName: data?.displayName ?? '',
    isNewUser: data?.isNewUser,
    isError,
  };
};
