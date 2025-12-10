import { useQuery } from "@tanstack/react-query";
import { getInterestsArticles } from "@/features/home/api/getInterestsArticles";

export const useInterestsQuery = () => {
  return useQuery({
    queryKey: ["interestsTopicArticles"],
    queryFn: getInterestsArticles,
    staleTime: 1000 * 60 * 3,
  });
};
