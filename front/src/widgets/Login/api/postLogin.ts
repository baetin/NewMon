import axios from "axios";

export const postLogin = async (idToken: string) => {
  try {
    const response = await axios.post(
      "/api/auth/google-login",
      { idToken },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("❌ 구글 로그인 처리 실패:", err);
    throw err;
  }
};
