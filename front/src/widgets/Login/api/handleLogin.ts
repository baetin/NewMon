import type { CredentialResponse } from "@react-oauth/google";
import axios from "axios";

// import { useNavigate } from "react-router-dom";

interface GoogleLoginProps {
  res: CredentialResponse;
  setLoginUser: (user: { userId: string; displayName: string }) => void;
}

export const handleSuccess = async ({
  res,
  setLoginUser,
}: GoogleLoginProps) => {
  // const navigate = useNavigate();

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

      setLoginUser({
        userId: response.data.user.userId,
        displayName: response.data.user.displayName,
      });

      // 로그인 후 메인 페이지로 이동
      // navigate("/");
    }
  } catch (err) {
    console.error("❌ 구글 로그인 처리 실패:", err);
  }
};

export const handleError = () => {
  console.error("구글 로그인 실패");
};
