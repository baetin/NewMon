import type { CredentialResponse } from "@react-oauth/google";
import axios from "axios";

interface GoogleLoginProps {
  res: CredentialResponse;
  setLoginUser: (user: {
    userId: string;
    displayName: string;
    isNewUser: boolean;
  }) => void;
  navigate: (path: string) => void;
}

export const handleSuccess = async ({
  res,
  setLoginUser,
  navigate,
}: GoogleLoginProps) => {
  if (!res.credential) {
    console.error("❌ 구글 로그인 credential이 없습니다!");
    return;
  }

  try {
    const response = await axios.post("/api/auth/google-login", {
      idToken: res.credential,
    });
    console.log("백엔드 응답:", response.data);

    if (response.data.token) {
      sessionStorage.setItem("accessToken", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      sessionStorage.setItem(
        "isNewUser",
        JSON.stringify(response.data.isNewUser)
      );

      setLoginUser({
        userId: response.data.user.userId,
        displayName: response.data.user.displayName,
        isNewUser: response.data.isNewUser,
      });

      // 로그인 후 메인 페이지로 이동
      const isNewUser = JSON.parse(
        sessionStorage.getItem("isNewUser") || "false"
      );

      isNewUser ? navigate("/interest-select") : navigate("/");
    }
    return response.data;
  } catch (err) {
    console.error("❌ 구글 로그인 처리 실패:", err);
    alert("에러로 인해 로그인에 실패 했습니다.");
  }
};

export const handleError = () => {
  console.error("구글 로그인 실패");
};
