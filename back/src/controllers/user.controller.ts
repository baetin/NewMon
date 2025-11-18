import { Request, Response } from "express";
import { updateInterests } from "../services/user.service.js"; 

// 이 코드는 authMiddleware가 req.userId를 추가했음을 전제합니다.
// (타입 확장은 이미 전역 파일이나 미들웨어 파일에 되어 있다고 가정)

export const userController = {
    
    // 1. [R] 인증 상태 확인: GET /api/user/status
    async checkAuthStatus(req: Request, res: Response) {
        // authMiddleware가 성공적으로 통과하면 req.userId에 사용자 ID가 설정됩니다.
        const userId = req.userId; 

        // 인증 실패 검증 (미들웨어가 처리하지만, 안전을 위해)
        if (!userId) {
            return res.status(401).json({ isAuthenticated: false, message: "No active session. Please log in." });
        }

        try {
            // 사용자 ID가 존재한다는 것은 세션이 유효하다는 증거입니다.
            return res.status(200).json({
                isAuthenticated: true,
                userId: userId,
                message: "Session is active."
            });
        } catch (error) {
            console.error("Error during session status check:", error);
            return res.status(500).json({ message: "Internal server error during check." });
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
        const areInterestsValid = interests.every(item => typeof item === 'number' && item > 0);
        if (!areInterestsValid) {
            return res.status(400).json({ message: "Interest IDs must be positive integers." });
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
                detail: error.message 
            });
        }
    },
};