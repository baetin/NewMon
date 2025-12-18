import { useQuery } from "@tanstack/react-query";
import { getSessionCheck } from "@/features/auth/api/getSessionCheck";
import type { SessionCheckProps } from "@/features/auth/model/sessionCheck.types";

export const useSessionCheckQuery = () => {
  return useQuery<SessionCheckProps, Error>({
    queryKey: ["session"],
    queryFn: getSessionCheck,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
