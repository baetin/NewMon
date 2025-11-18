import axios from "axios";

interface UserInterestsProps {
  interests: number[];
  navigate: (path: string) => void;
}

export const handleUserInterests = async ({
  interests,
  navigate,
}: UserInterestsProps) => {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await axios.post(
      "/api/user/interests",
      { interests },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("관심 종목 설정에 성공했습니다.");
    navigate("/");
    return response.data;
  } catch (err) {
    console.error("❌ 관심 종목 post 실패:", err);
    alert("시스템 오류로 관심종목 선택에 실패했습니다.");
  }
};
