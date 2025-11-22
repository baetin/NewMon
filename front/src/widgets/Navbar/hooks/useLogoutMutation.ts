import { useMutation } from "@tanstack/react-query";
import { postLogout } from "../api/postLogout";

export const useLogoutMutation = () => {
  return useMutation<void, Error, void>({
    mutationFn: postLogout,
    onSuccess: (data) => {
      console.log("로그아웃 성공:", data);
    },
    onError: (err) => {
      console.error("로그아웃 실패:", err);
    },
  });
};
