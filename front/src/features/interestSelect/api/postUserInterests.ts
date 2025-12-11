import axios from "axios";
import type { UserInterestsProps } from "../model/UserInterestsProps.types";

export const postUserInterests = async ({ interests }: UserInterestsProps) => {
  const token = sessionStorage.getItem("accessToken");
  try {
    const response = await axios.post(
      "/api/user/interests",
      { interests },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (err) {
    console.error("관심종목 설정 실패:", err);
    throw err;
  }
};
