import axios from "axios";

export const handleUserInterests = async (interests: number[]) => {
  try {
    const response = await axios.post("/api/user/interests", {
      interests,
    });
    alert("관심 종목 설정에 성공했습니다.");
    return response.data;
  } catch (err) {
    console.error("❌ 관심 종목 post 실패:", err);
    alert("시스템 오류로 관심종목 선택에 실패했습니다.");
  }
};
