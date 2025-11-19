import { Request, Response, NextFunction } from 'express';


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. 세션에서 사용자 ID를 확인
    const userId = (req.session as any).userId;
    const displayName = req.session.displayName;

    if (!userId) {
        // 세션에 userId가 없으면 인증 실패
        return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    // 2. userId를 요청 객체에 추가 (컨트롤러 사용을 위해)
    (req as any).userId = userId;
    (req as any).displayName = displayName;

    // 3. 인증 성공: 다음 컨트롤러로 이동
    next();
};