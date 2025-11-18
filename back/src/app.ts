import express, { Application } from "express";
import session from 'express-session'; // 세션 관리
import cookieParser from 'cookie-parser'; // 쿠키 파서
import articleRouter from "./routes/article.router.js";
import db from "./utils/db.js"; // DB 연결 풀 인스턴스를 가져옴
import authRoutes from "./routes/auth.router.js";
import userRouter from "./routes/user.routers.js";
import * as dotenv from "dotenv";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// 1. 쿠키 파서 설정 (세션을 사용하기 위해 필요)
app.use(cookieParser());

// 2. 세션 설정 (userId를 서버 메모리/DB에 저장하고 ID만 쿠키로 클라이언트에 전송)
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_key',
    resave: false, 
    saveUninitialized: false, 
    cookie: { /* ... */ }
}));

// ----------------------------------------------------------------
// 1. 미들웨어 설정 (중복 제거 및 JSON 파싱)
// ----------------------------------------------------------------
app.use(express.json()); // 표준 JSON 파서만 사용

// ----------------------------------------------------------------
// 2. DB 연결 테스트 함수 (서버 시작 후 비동기적으로 실행)
// ----------------------------------------------------------------
const testDatabaseConnection = async () => {
  try {
    const client = await db.connect(); // Pool에서 클라이언트 획득
    client.release(); // 연결 해제
    console.log("✅ Database connection pool successfully tested.");
  } catch (error) {
    console.error(
      "❌ Failed to connect to database. Check credentials/server status:",
      error
    );
    // DB 연결 실패 시에도 서버는 일단 실행되도록 허용
  }
};

// ----------------------------------------------------------------
// 3. 라우터 연결
// ----------------------------------------------------------------
// 모든 인증 경로는 /api/auth 아래로 연결
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRouter);
app.use("/api/user", userRouter);

// ----------------------------------------------------------------
// 4. 서버 시작 및 DB 연결 테스트
// ----------------------------------------------------------------
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // 서버 시작 후 DB 연결 테스트 호출
  await testDatabaseConnection();
});
