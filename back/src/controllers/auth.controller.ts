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

//Google 토큰 검증 로직
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
// //--------------------------------------------------------------------------

// //테스트용
// async function verifyGoogleToken(token: string) {
//     console.log("--- DEBUG: Bypassing actual Google verification. ---");
//     // DB Upsert 키로 사용할 고정 ID를 반환합니다.
//     return {
//         // 이미 DB에 저장된 고정 ID를 반환 (Upsert 로직 유지를 위해 필요)
//         googleId: "TEST_UNIQUE_ID_FROM_GOOGLE_001",
//         email: "db_test_001@email.com",
//         displayName: "Test User Name",
//     };
// }

export const googleAuthCallbackController = async (
  req: Request,
  res: Response
) => {
  const { idToken } = req.body;

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
    (req.session as any).displayName = userInfo.displayName;

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
    if (
      error instanceof Error &&
      error.message.includes("Invalid Google token")
    ) {
      return res
        .status(401)
        .json({ message: "Invalid or expired authentication token." });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  (req.session as any).destroy((err: any) => {
    if (err) {
      console.error("세션 삭제 오류:", err);
      return res.status(500).json({ message: "세션 삭제 실패" });
    }

    // 쿠키 삭제
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: true, // 운영환경이라면 true
      sameSite: "lax",
    });

    // 여기서 반드시 응답 보내야 함
    return res.json({ message: "로그아웃 성공" });
  });
};
