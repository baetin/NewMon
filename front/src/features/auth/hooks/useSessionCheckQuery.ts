import { useQuery } from "@tanstack/react-query";
import { getSessionCheck } from "@/app/layout/MainLayout/api/getSessionCheck";
import type { SessionCheckProps } from "@/app/layout/MainLayout/model/sessionCheck.types";

export const useSessionCheckQuery = () => {
  return useQuery<SessionCheckProps | null, Error>({
    queryKey: ["session"],
    queryFn: () => getSessionCheck(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
