// src/types/express-request.d.ts

import { JwtPayload } from "jsonwebtoken";
import "express-session"; // express-session 타입을 가져와야 확장이 가능합니다.

declare module "express-session" {
  interface SessionData {
    userId: number; // 세션에 저장할 데이터 타입 정의
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: JwtPayload;
    }
  }
}
