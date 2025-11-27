import { useQuery } from "@tanstack/react-query";
import { getSessionCheck } from "../../widgets/layouts/api/getSessionCheck";
import type { SessionCheckProps } from "../../widgets/layouts/model/sessionCheck.types";

export const useSessionCheckQuery = () => {
  return useQuery<SessionCheckProps | null, Error>({
    queryKey: ["session"],
    queryFn: () => getSessionCheck(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
