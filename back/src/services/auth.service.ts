// import { getDbPool } from '../utils/db.js';

// // Google에서 전달받는 사용자 데이터의 타입 정의
// interface OAuthUserData {
//     googleId: string;
//     email: string;
//     displayName: string;
//     interests?: number[]; 
// }

// // 회원가입과 로그인을 동시에 처리하는 Upsert 함수
// export const upsertUserService = async (data: OAuthUserData) => {
//     const { googleId, email, displayName, interests } = data;
    
//     // getDbPool() 호출 시점에 DB 연결 환경 변수를 참조하게 됩니다.
//     const pool = getDbPool(); 
//     const client = await pool.connect(); // DB 연결 풀에서 클라이언트 획득

//     try {
//         await client.query('BEGIN'); // 트랜잭션 시작
//         let userId: number;
//         let isNewUser = false;

//         // 1. User Upsert (조회 또는 생성)
//         const upsertQuery = `
//             INSERT INTO "User" (google_id, email, display_name)
//             VALUES ($1, $2, $3)
//             ON CONFLICT (google_id) DO UPDATE 
//             SET display_name = $3 
//             RETURNING user_id, display_name, email;
//         `;
        
//         const res = await client.query(upsertQuery, [googleId, email, displayName]);
        
//         userId = res.rows[0].user_id;

//         // 2. 새 사용자 여부 확인 및 관심 분야 연결
//         const checkInterest = await client.query(
//             'SELECT user_id FROM "UserInterest" WHERE user_id = $1 LIMIT 1',
//             [userId]
//         );
        
//         // 관심사 데이터가 없고 (새 사용자), interests 배열이 있다면 연결
//         if (checkInterest.rowCount === 0 && interests && interests.length > 0) {
//             isNewUser = true;

//             // 다중 INSERT를 위해 값 구문을 만듭니다.
//             const values = interests.map((topicId, index) => 
//                 `($${index * 2 + 1}, $${index * 2 + 2})`
//             ).join(', ');
            
//             const params = interests.flatMap(topicId => [userId, topicId]);
            
//             const interestQuery = `
//                 INSERT INTO "UserInterest" (user_id, topic_id)
//                 VALUES ${values} ON CONFLICT DO NOTHING;
//             `;
//             await client.query(interestQuery, params);
//         }

//         await client.query('COMMIT'); // 트랜잭션 커밋
        
//         return {
//             user_id: userId,
//             email: res.rows[0].email,
//             displayName: res.rows[0].display_name,
//             isNewUser: isNewUser
//         };

//     } catch (error) {
//         await client.query('ROLLBACK'); // 오류 발생 시 롤백
//         throw error;
//     } finally {
//         client.release(); // DB 클라이언트 연결 반환
//     }
// };
