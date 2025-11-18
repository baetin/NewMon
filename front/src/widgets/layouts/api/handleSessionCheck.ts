import axios from "axios";

export const handleSessionCheck = async () => {
  try {
    const response = await axios.get("/api/user/status");
    return response.data;
  } catch (err) {
    console.error("서비스 오류로 세션 체크에 실패했습니다.");
    return null;
  }
};
