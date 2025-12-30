import { Request, Response } from "express";
import { updateInterests, getUserProfile } from "../services/user.service.js";

// 이 코드는 authMiddleware가 req.userId를 추가했음을 전제합니다.
// (타입 확장은 이미 전역 파일이나 미들웨어 파일에 되어 있다고 가정)

export const userController = {
  // 1. [R] 인증 상태 확인: GET /api/user/status
  async checkAuthStatus(req: Request, res: Response) {
    const userId = req.userId; // authMiddleware에서 설정됨

    if (!userId) {
      return res
        .status(401)
        .json({
          isAuthenticated: false,
          message: "No active session. Please log in.",
        });
    }

    try {
      // 1. ✨ DB에서 userId를 기반으로 최신 프로필 정보 조회 ✨
      const userProfile = await getUserProfile(userId);

      if (!userProfile) {
        // 토큰은 유효하지만 DB에서 사용자가 삭제된 경우
        return res
          .status(404)
          .json({ isAuthenticated: false, message: "User profile not found." });
      }

      // 2. 인증 성공 및 DB 정보와 함께 상태 반환
      return res.status(200).json({
        isAuthenticated: true,
        userId: userProfile.userId,
        displayName: userProfile.displayName, // ✨ DB에서 조회된 displayName 반환 ✨
        message: "Session is active.",
      });
    } catch (error) {
      console.error("Error during session status check:", error);
      // DB 조회 실패 시 500 에러 반환
      return res
        .status(500)
        .json({ message: "Internal server error during check." });
    }
  },

  // 2. [C/U] 관심 주제 설정 및 업데이트: POST /api/user/interests
  async updateInterests(req: Request, res: Response) {
    const userId = req.userId; // authMiddleware가 추가한 userId
    const { interests } = req.body;

    // 1. 필수 값 및 인증 검증
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: "Interests must be an array." });
    }

    // interests 배열의 요소가 숫자인지 확인하는 추가 유효성 검사 필요 (선택적)
    const areInterestsValid = interests.every(
      (item) => typeof item === "number" && item > 0
    );
    if (!areInterestsValid) {
      return res
        .status(400)
        .json({ message: "Interest IDs must be positive integers." });
    }

    try {
      // 2. 서비스 호출 (DB 트랜잭션 실행)
      const updatedInfo = await updateInterests({ userId, interests });

      res.status(200).json({
        message: "Interests updated successfully.",
        data: updatedInfo,
      });
    } catch (error: any) {
      console.error("Error in updateInterests:", error);
      // P2003 (Foreign Key) 오류는 잘못된 topicId를 보냈을 때 발생할 수 있습니다.
      res.status(500).json({
        message: "Failed to update interests due to a server error.",
        detail: error.message,
      });
    }
  },
};
