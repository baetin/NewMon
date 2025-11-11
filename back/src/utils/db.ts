// db.ts
import { Pool, QueryResult } from 'pg';
import * as dotenv from 'dotenv'; // 환경 변수 관리를 위해 dotenv 사용을 권장합니다.

// .env 파일에서 환경 변수 로드
dotenv.config();

// PostgreSQL 연결 풀 설정 (환경 변수 사용)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'), // DB_PORT이 없으면 기본값 5432 사용
    max: 10, // 최대 연결 클라이언트 수
    idleTimeoutMillis: 30000 
});

// 연결 테스트 및 로깅
pool.on('connect', () => {
  console.log('✅ PostgreSQL 연결 풀이 생성되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 풀 오류 발생:', err.message, err.stack);
});

// Pool 객체를 모듈 외부로 내보냅니다.
export default pool;
export { QueryResult };