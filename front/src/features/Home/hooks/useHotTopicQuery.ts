import { useQuery } from "@tanstack/react-query";
import { getHotTopicArticles } from "@/features/home/api/getHotTopicArticles";

export const useHotTopicQuery = () => {
  return useQuery({
    queryKey: ["hotTopicArticles"],
    queryFn: getHotTopicArticles,
    staleTime: 1000 * 60 * 3, // 3분
  });
};
