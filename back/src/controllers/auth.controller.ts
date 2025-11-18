import { Request, Response } from "express";
import { upsertUserService } from "../services/auth.service.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../services/jwt.service.js";

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Google 토큰 검증 로직
async function verifyGoogleToken(token: string) {
  console.log("--- DEBUG: Skipping actual Google verification. ---");
  // 실제 토큰 검증이 성공했을 때와 같은 Payload 구조를 반환합니다.

  // ✨ 주의: 이 값들은 클라이언트가 보낸 토큰에 담겨있다고 가정하는 고정된 더미 데이터입니다.
  return {
    googleId: "TEST_UNIQUE_ID_FROM_GOOGLE_001",
    email: "db_test_001@email.com",
    displayName: "Test User Name",
  };
}

export const googleAuthCallbackController = async (
  req: Request,
  res: Response
) => {
  // 1. 클라이언트로부터 Google ID 토큰만 받기
  const { idToken } = req.body; // ✨ interests 필드 제거 ✨

  if (!idToken) {
    return res.status(400).json({ message: "Google ID Token is required." });
  }

  try {
    // 2. Google API에 토큰 검증 요청 (더미 함수 실행)
    const googleInfo = await verifyGoogleToken(idToken);

    // 3. DB Upsert 서비스 호출 (회원가입/로그인 처리)
    const userInfo = await upsertUserService({
      googleId: googleInfo.googleId,
      email: googleInfo.email,
      displayName: googleInfo.displayName,
      // ✨ interests 필드를 제거하고 호출합니다. ✨
    });

    // 4. 인증 성공: JWT 토큰 발급
    const token = generateToken({
      userId: userInfo.user_id,
      email: userInfo.email,
    });

    return res.status(200).json({
      message: userInfo.isNewUser
        ? "User registered successfully."
        : "Login successful.",
      token: token,
      user: {
        userId: userInfo.user_id,
        displayName: userInfo.displayName,
      },
    });
  } catch (error) {
    // 토큰 검증 실패 또는 DB 트랜잭션 실패 처리
    console.error("--- OAuth 처리 실패 상세 로그 ---", error);

    // 401: 인증 실패 (토큰 무효)
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
