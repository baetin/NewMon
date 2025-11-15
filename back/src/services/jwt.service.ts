import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-do-not-use-in-prod";
const TOKEN_EXPIRATION = "7d";

interface TokenPayload {
  userId: number;
  email: string;
}

// JWT 토큰 생성 함수
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};
