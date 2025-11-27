import { useQuery } from "@tanstack/react-query";
import { getInterestsArticles } from "../api/getInterestsArticles";

export const useInterestsQuerty = () => {
  return useQuery({
    queryKey: ["hotTopicArticles"],
    queryFn: getInterestsArticles,
    staleTime: 1000 * 60 * 3,
  });
};
