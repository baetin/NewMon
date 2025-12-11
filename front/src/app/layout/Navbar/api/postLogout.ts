import axios from "axios";

export const postLogout = async () => {
  try {
    const { data } = await axios.post("/api/auth/google-logout", null, {
      withCredentials: true,
    });
    return data;
  } catch (err) {
    console.error("❌ 구글 로그아웃 처리 실패:", err);
    throw err;
  }
};
