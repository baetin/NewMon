import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUserInterests } from "../api/postUserInterests";
import type { UserInterestsProps } from "../model/UserInterestsProps.types";

export const useUserInterestsMutation = (navigate: (path: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserInterestsProps>({
    mutationFn: postUserInterests,
    onSuccess: (data) => {
      console.log("관심종목 설정 성공:", data);
      queryClient.invalidateQueries({ queryKey: ["userInterests"] });
      alert("관심 종목 설정에 성공했습니다.");
      navigate("/");
    },
    onError: (err) => {
      alert("시스템 오류로 관심종목 선택에 실패했습니다.");
      console.error("관심 종목 설정에 실패:", err);
    },
  });
};
