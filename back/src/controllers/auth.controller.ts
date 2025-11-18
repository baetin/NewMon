import { Request, Response } from "express";
import { upsertUserService } from "../services/auth.service.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../services/jwt.service.js";

//실제 사용 코드
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);



// Google 토큰 검증 로직
async function verifyGoogleToken(token: string) {
  if (!CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not set.");
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token, // 클라이언트가 보낸 토큰을 검증
      audience: CLIENT_ID, // 이 토큰이 우리의 앱을 위해 발행되었는지 확인
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      throw new Error("Invalid Google token payload.");
    }

    // 실제 Google Payload에서 사용자 정보를 추출하여 반환
    return {
      googleId: payload.sub, // Google의 고유 ID (DB Upsert 키)
      email: payload.email,
      displayName: payload.name || payload.email,
    };
  } catch (error) {
    console.error("Google Token Verification Failed:", error);
    throw new Error("Invalid Google token."); // 401 에러 유도
  }
}
//---------------------------------------------------------------

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

  if (!idToken) {
    return res.status(400).json({ message: "Google ID Token is required." });
  }

  try {
    // 1. Google API에 토큰 검증 요청 (더미 함수 실행)
    const googleInfo = await verifyGoogleToken(idToken);

    // 2. DB Upsert 서비스 호출 (핵심: 사용자 생성 또는 로그인 처리)
    const userInfo = await upsertUserService({
      googleId: googleInfo.googleId,
      email: googleInfo.email,
      displayName: googleInfo.displayName,
    });

    // 3. JWT 토큰 발급 (신규/기존 사용자 모두에게 필요)
    const token = generateToken({
      userId: userInfo.user_id,
      email: userInfo.email,
    });

    // ====================================================================
    // ✨ 4. 응답 분기 처리: 신규 회원 vs. 기존 회원 구분 ✨
    // ====================================================================

    if (userInfo.isNewUser) {
      // [A] 신규 회원 (회원가입 성공)
      console.log(`[USER_EVENT] New user registered: ${userInfo.email}`);

      return res.status(201).json({
        // 201 Created 상태 코드를 사용하여 신규 생성을 명확히 알림
        message: "User registered successfully. Redirecting to onboarding.",
        token: token,
        user: {
          userId: userInfo.user_id,
          displayName: userInfo.displayName,
        },
        isNewUser: true,
        // 프론트엔드에 온보딩 페이지로 이동하라고 지시할 수 있는 플래그 추가
      });
    } else {
      // [B] 기존 회원 (로그인 성공)
      console.log(`[USER_EVENT] Existing user logged in: ${userInfo.email}`);

      return res.status(200).json({
        message: "Login successful.",
        token: token,
        user: {
          userId: userInfo.user_id,
          displayName: userInfo.displayName,
        },
        isNewUser: false,
      });
    }
  } catch (error) {
    // ... (오류 처리 로직 유지) ...
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  // 1. JWT 토큰 기반의 시스템에서는 서버에 저장된 세션이 없으므로,
  //    실제 로그아웃 작업은 클라이언트가 토큰을 삭제하는 것입니다.
  // 2. 서버는 클라이언트에게 "성공적으로 처리했다"는 응답만 보냅니다.

  // *향후 토큰 블랙리스트(Blacklisting) 기능 확장을 위한 자리*

  console.log(
    `User ${
      req.userId || "unknown"
    } successfully logged out (Token cleared by client).`
  );

  return res.status(200).json({
    message:
      "Logout successful. Please delete your authentication token (JWT) from client storage.",
  });
};
