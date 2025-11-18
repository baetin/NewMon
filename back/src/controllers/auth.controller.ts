import { Request, Response } from "express";
import { upsertUserService } from "../services/auth.service.js";
import { OAuth2Client } from "google-auth-library";
// import { generateToken } from "../services/jwt.service.js"; // JWT는 사용하지 않습니다.

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Request 객체에 session 속성이 있음을 TypeScript에 알리기 위해 타입 확장
declare global {
    namespace Express {
        interface Request {
            // ✨ session 속성 선언은 제거합니다. (TypeScript가 자동으로 처리) ✨
            userId?: number; // 미들웨어에서 추가될 수 있는 userId만 유지합니다.
        }
    }
}

// Google 토큰 검증 로직
async function verifyGoogleToken(token: string) {
    if (!CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID environment variable is not set.");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token, 
            audience: CLIENT_ID, 
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.sub || !payload.email) {
            throw new Error("Invalid Google token payload.");
        }

        // Google Payload에서 사용자 정보를 추출하여 반환
        return {
            googleId: payload.sub,
            email: payload.email,
            displayName: payload.name || payload.email,
        };
    } catch (error) {
        console.error("Google Token Verification Failed:", error);
        throw new Error("Invalid Google token."); // 401 에러 유도
    }
}


export const googleAuthCallbackController = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: "Google ID Token is required." });
    }

    try {
        // 1. Google API에 토큰 검증 요청
        const googleInfo = await verifyGoogleToken(idToken);

        // 2. DB Upsert 서비스 호출 (핵심: 사용자 생성 또는 로그인 처리)
        const userInfo = await upsertUserService({
            googleId: googleInfo.googleId,
            email: googleInfo.email,
            displayName: googleInfo.displayName,
        });

        // 3. ✨ 인증 성공: 사용자 ID를 세션에 저장 ✨
        (req.session as any).userId = userInfo.user_id; 

        // 4. 응답 분기 처리
        return res.status(userInfo.isNewUser ? 201 : 200).json({
            message: userInfo.isNewUser
                ? "User registered successfully. Redirecting to onboarding."
                : "Login successful.",
            user: {
                userId: userInfo.user_id,
                displayName: userInfo.displayName,
            },
            isNewUser: userInfo.isNewUser,
            // 세션 기반에서는 토큰을 반환하지 않습니다.
        });
    } catch (error) {
        // 토큰 검증 실패 또는 DB 트랜잭션 실패 처리
        console.error("--- OAuth 처리 실패 상세 로그 ---", error);

        // 401: 인증 실패 처리
        if (error instanceof Error && error.message.includes("Invalid Google token")) {
            return res.status(401).json({ message: "Invalid or expired authentication token." });
        }

        return res.status(500).json({ message: "Internal server error." });
    }
};

export const logoutController = async (req: Request, res: Response) => {
    // ✨ 로그아웃: 서버 세션 파괴 및 쿠키 삭제 ✨
    // express-session 미들웨어가 추가한 destroy 메서드를 사용합니다.
    (req.session as any).destroy((err: any) => {
        if (err) {
            console.error("Session destroy failed:", err);
            return res.status(500).json({ message: "Failed to log out." });
        }
        
        // 브라우저에 저장된 세션 쿠키를 삭제합니다.
        res.clearCookie('connect.sid'); // Express-session의 기본 쿠키 이름
        
        console.log(`User ${req.userId || 'unknown'} successfully logged out.`);
        
        return res.status(200).json({ message: "Logout successful." });
    });
};