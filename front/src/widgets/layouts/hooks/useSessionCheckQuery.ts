import { useQuery } from "@tanstack/react-query";
import { getSessionCheck } from "../api/getSessionCheck";
import type { SessionCheckProps } from "../model/sessionCheck.types";

export const useSessionCheckQuery = () => {
  return useQuery<SessionCheckProps | null, Error>({
    queryKey: ["session"],
    queryFn: () => getSessionCheck(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};
