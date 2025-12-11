import { useMutation } from "@tanstack/react-query";
import type { CredentialResponse } from "@react-oauth/google";
import type { LoginUser } from "@/shared/types/loginUser.types";
import { postLogin } from "@/features/auth/api/postLogin";

export const useLoginMutation = (
  setLoginUser: (user: LoginUser) => void,
  navigate: (path: string) => void
) => {
  return useMutation<any, Error, CredentialResponse>({
    mutationFn: async (res: CredentialResponse) => {
      if (!res.credential)
        throw new Error("구글 로그인 credential이 없습니다!");
      return postLogin(res.credential);
    },
    onSuccess: (data) => {
      const { user, isNewUser } = data;
      setLoginUser({
        userId: user.userId,
        displayName: user.displayName,
        isNewUser,
      });
      navigate(isNewUser ? "/interest-select" : "/");
    },
    onError: (err) => {
      console.error("구글 로그인 처리 실패:", err);
      alert("시스템 에러로 인해 로그인에 실패했습니다.");
    },
  });
};
