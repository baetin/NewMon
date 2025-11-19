import axios from "axios";
import type { SessionCheckProps } from "../model/sessionCheck.types";

export const handleSessionCheck =
  async (): Promise<SessionCheckProps | null> => {
    try {
      const response = await axios.get("/api/user/status", {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      console.error("서비스 오류로 세션 체크에 실패했습니다.");
      return null;
    }
  };
