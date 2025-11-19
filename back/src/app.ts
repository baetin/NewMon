import express, { Application } from "express";
import session from 'express-session'; 
import cookieParser from 'cookie-parser'; 
import * as dotenv from "dotenv";

import articleRouter from "./routes/article.router.js";
import db from "./utils/db.js"; 
import authRoutes from "./routes/auth.router.js";
import userRouter from "./routes/user.routers.js";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// ✨ 1. 미들웨어 설정 (순서가 중요!) ✨
// ================================================================

// 1. JSON 파싱: 모든 요청의 Body를 먼저 읽어들입니다. (가장 먼저 와야 함)
app.use(express.json());

// 2. 쿠키 파서 설정
app.use(cookieParser());

// 3. 세션 설정 (쿠키 파서 다음에 와야 쿠키를 읽어 세션 ID를 파악할 수 있음)
app.use(session({
    secret: process.env.SESSION_SECRET || '!@#$A_Very_Long_Random_String_For_My_Session_3817fHDKL', 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, 
        secure: false,
    }
}));

// ----------------------------------------------------------------
// 2. DB 연결 테스트 함수 (유지)
// ----------------------------------------------------------------
const testDatabaseConnection = async () => {
    try {
        const client = await db.connect(); 
        client.release();
        console.log("✅ Database connection pool successfully tested.");
    } catch (error) {
        console.error("❌ Failed to connect to database. Check credentials/server status:", error);
    }
};

// ----------------------------------------------------------------
// 3. 라우터 연결 (미들웨어 설정 후)
// ----------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRouter);
app.use("/api/user", userRouter);

// ----------------------------------------------------------------
// 4. 서버 시작
// ----------------------------------------------------------------
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await testDatabaseConnection();
});