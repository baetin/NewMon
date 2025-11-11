import express, { Application } from 'express'; // Application 타입을 추가하여 TS 환경 명확화
import bodyParser from 'body-parser';
import articleRouter from './routes/article.router.js';
import db from './utils/db.js'; // DB 연결 풀 초기화를 위해 import

const app: Application = express(); // Application 타입 명시
const PORT = process.env.PORT || 3000;

const initializeDatabase = async () => {
    try {
        // Pool에서 클라이언트 하나를 가져와 연결 상태 확인 (실제 연결 테스트)
        const client = await db.connect();
        client.release();
        console.log('✅ Database connection pool successfully initialized and tested.');
    } catch (error) {
        console.error('❌ Failed to initialize database connection:', error);
        // DB 연결 실패 시 앱 종료 등을 결정할 수 있습니다.
    }
};

// 미들웨어 설정
// express.json()이 body-parser의 역할을 대신하므로 body-parser는 제거하거나 주석 처리합니다.
app.use(express.json()); 
app.use(bodyParser.json()); // express.json() 사용 시 주석 처리하거나 제거 가능

// 라우터 연결
// app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRouter);

// 서버 시작
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // 서버 시작 후 DB 연결 초기화 함수 호출
    await initializeDatabase(); 
});