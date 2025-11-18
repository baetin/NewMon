import axios from "axios";

export const handleLogout = async () => {
  try {
    const response = await axios.post("/api/auth/google-logout");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    return response.data;
  } catch (err) {
    console.error("❌ 구글 로그아웃 처리 실패:", err);
  }
};
