import { useQuery } from "@tanstack/react-query";
import { getHotTopicArticles } from "../api/getHotTopicArticles";

export const useHotTopicQuery = () => {
  return useQuery({
    queryKey: ["hotTopicArticles"],
    queryFn: getHotTopicArticles,
    staleTime: 1000 * 60 * 3,
  });
};
