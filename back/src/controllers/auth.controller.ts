import { Request, Response } from 'express';
import { signupService } from '../services/auth.service.js';

// 회원가입 요청을 처리하는 컨트롤러 함수
export const signupController = async (req: Request, res: Response) => {
    const { username, password, email, interests } = req.body;

    // 1. 입력값 유효성 검사
    if (!username || !password || !email || !interests || !Array.isArray(interests)) {
        return res.status(400).json({ message: 'Validation failed: Missing required fields.' });
    }

    try {
        const newUserInfo = await signupService(req.body);
        
        return res.status(201).json({
            message: 'User registered successfully and interests saved.',
            user: newUserInfo
        });

    } catch (error) {
        // ✨ 이 부분이 수정되었습니다: 상세 오류 로그 출력 ✨
        console.error('--- 회원가입 트랜잭션 실패 상세 로그 ---');
        console.error(error); // 오류 객체 전체를 콘솔에 출력합니다.
        console.error('------------------------------------');
        
        // Prisma UNIQUE constraint error (P2002) 처리
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
            return res.status(409).json({ message: 'Username or Email already exists.' });
        }
        
        // ✨ P2003 같은 다른 DB 오류도 명확히 알 수 있도록 500 에러 반환
        return res.status(500).json({ message: 'Internal server error. Check server logs for details.' });
    }
};
