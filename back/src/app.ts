import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = 3000;



// 미들웨어 설정
app.use(express.json()); // JSON 본문 파싱

// 라우터 연결: 모든 인증 관련 경로는 /api/auth로 시작
app.use('/api/auth', authRoutes);

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});