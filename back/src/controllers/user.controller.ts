// src/controllers/user.controller.ts 파일 (수정)

import { Request, Response } from "express";
import { updateInterests } from "../services/user.service.js"; // 함수 이름 변경

export const userController = {
  // 1. 관심 주제 설정 및 업데이트
  async updateInterests(req: Request, res: Response) {
    // authMiddleware를 통해 JWT에서 userId를 추출
    const userId = req.userId;
    const { interests } = req.body;

    if (!userId || !Array.isArray(interests)) {
      return res
        .status(400)
        .json({ message: "Invalid request or missing interests array." });
    }

    // interests 배열의 요소가 숫자인지 확인하는 추가 유효성 검사 필요

    try {
      const updatedInfo = await updateInterests({ userId, interests });

      res.status(200).json({
        message: "Interests updated successfully.",
        data: updatedInfo,
      });
    } catch (error: any) {
      // P2003 (Foreign Key) 오류는 잘못된 topicId를 보냈을 때 발생할 수 있습니다.
      res.status(500).json({ message: error.message });
    }
  },
  // 다른 컨트롤러 메서드 (예: updateProfile)는 제거 또는 주석 처리
};
