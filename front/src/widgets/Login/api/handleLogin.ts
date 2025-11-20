import type { CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import type { LoginUser } from "../../../shared/types/loginUser.types";

interface GoogleLoginProps {
  res: CredentialResponse;
  setLoginUser: (user: LoginUser) => void;
  navigate: (path: string) => void;
}

export const handleLogin = async ({
  res,
  setLoginUser,
  navigate,
}: GoogleLoginProps) => {
  if (!res.credential) {
    console.error("❌ 구글 로그인 credential이 없습니다!");
    return;
  }

  try {
    const response = await axios.post(
      "/api/auth/google-login",
      {
        idToken: res.credential,
      },
      {
        withCredentials: true,
      }
    );
    console.log("백엔드 응답:", response.data);

    if (response.status === 200 || response.status === 201) {
      const { user, isNewUser } = response.data;

      setLoginUser({
        userId: user.userId,
        displayName: user.displayName,
        isNewUser: isNewUser,
      });

      isNewUser ? navigate("/interest-select") : navigate("/");
    }

    return response.data;
  } catch (err) {
    console.error("❌ 구글 로그인 처리 실패:", err);
    alert("시스템 에러로 인해 로그인에 실패 했습니다.");
  }
};

export const handleError = () => {
  console.error("구글 로그인 실패");
};
