// src/types/express-request.d.ts

import { JwtPayload } from "jsonwebtoken";

// Express 모듈을 확장하여 req 객체에 userId 속성을 추가합니다.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: JwtPayload; // JWT 페이로드 전체를 담고 싶다면 추가
    }
  }
}
