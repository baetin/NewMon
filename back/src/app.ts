// app.ts

import express, { Application } from 'express';
import bodyParser from 'body-parser';
import articleRouter from './routes/article.router.js';
import db from './utils/db.js'; 
import cors, { CorsOptions, CorsRequest, CorsCallback } from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 3000;




const initializeDatabase = async () => {
    try {
        const client = await db.connect();
        client.release();
        console.log('✅ Database connection pool successfully initialized and tested.');
    } catch (error) {
        console.error('❌ Failed to initialize database connection:', error);
        // DB 연결 실패 시 앱이 실행되지 않도록 여기서 throw 할 수도 있습니다.
    }
};

const allowedOrigins = [
    'http://localhost:5173', // 친구의 로컬 개발 서버 포트 (일반적인 React/Vue 포트)
    'http://localhost:3001', // 기타 로컬 개발 포트
    'http://192.168.1.10:5173', // 로컬 네트워크 접속 테스트 시 친구의 내부 IP
    // ⚠️ 여기에 고객님의 공용 IP 주소와 포트도 포함되어야 합니다. (예: http://211.123.45.67:3000)
];

// 💡 CORS 설정: 외부에서 들어오는 친구의 프론트엔드 요청을 허용
const corsOptions: CorsOptions = { // CorsOptions 타입을 명시
    origin: (origin: string | undefined, callback: CorsCallback) => { // 💡 타입 명시
        // string | undefined 타입은 origin이 없을 경우(Postman, 서버 자체 요청)를 포함합니다.
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            // callback의 첫 번째 인자는 Error 객체입니다.
            callback(new Error(`CORS policy error: Origin ${origin} is not allowed`), false); 
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

// 미들웨어 설정
app.use(express.json()); 
// app.use(bodyParser.json()); // 💡 express.json() 사용 시 주석 처리
app.use(cors(corsOptions)); // 💡 CORS 미들웨어 적용

// 라우터 연결
app.use('/api/articles', articleRouter);

// 서버 시작
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // 서버 시작 후 DB 연결 초기화 함수 호출
    await initializeDatabase(); 
});