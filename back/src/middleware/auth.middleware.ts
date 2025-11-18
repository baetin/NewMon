import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// 사용자 ID를 Request 객체에 추가하기 위해 타입 확장
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. 토큰 검증 (시크릿 키 사용)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3. 페이로드에서 userId 추출 및 요청 객체에 추가
    req.userId = decoded.userId as number;

    // 4. 다음 미들웨어 또는 컨트롤러로 이동
    next();
  } catch (error) {
    // 토큰 만료 또는 서명 불일치 오류 처리
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
