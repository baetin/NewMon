import pool from "../utils/db.js";
import { PoolClient } from "pg"; // pg 클라이언트 타입 정의를 위해 import

// Google에서 전달받는 사용자 데이터의 타입 정의
interface OAuthUserData {
  googleId: string;
  email: string;
  displayName: string;
  interests?: number[];
}

// 회원가입과 로그인을 동시에 처리하는 Upsert 함수
export const upsertUserService = async (data: OAuthUserData) => {
  const { googleId, email, displayName, interests } = data;
  const client: PoolClient = await pool.connect(); // DB 연결 풀에서 클라이언트 획득

  try {
    await client.query("BEGIN"); // 트랜잭션 시작

    // 1. User Upsert (조회 및 생성/업데이트)
    // PostgreSQL의 INSERT ... ON CONFLICT (UPSERT) 구문 사용
    const upsertQuery = `
            INSERT INTO "user" (google_id, email, display_name)
            VALUES ($1, $2, $3)
            ON CONFLICT (google_id) DO UPDATE 
            SET display_name = $3  -- 기존 사용자일 경우 display_name만 업데이트 (로그인 역할)
            RETURNING user_id, display_name, email;
        `;

    // $1: googleId, $2: email, $3: displayName
    const res = await client.query(upsertQuery, [googleId, email, displayName]);

    const userId: number = res.rows[0].user_id;
    let isNewUser: boolean = res.command === "INSERT"; // INSERT 명령이면 새 사용자

    // 2. 새 사용자일 경우에만 관심 분야 연결
    // interests가 있고, DB에서 새로 생성되었고, 이전에 관심사가 설정되지 않았다면 연결합니다.
    if (isNewUser && interests && interests.length > 0) {
      // UserInterest에 데이터 삽입
      const values = interests
        .map((topicId, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
        .join(", ");

      const params = interests.flatMap((topicId) => [userId, topicId]);

      const interestQuery = `
                INSERT INTO "userinterest" (user_id, topic_id)
                VALUES ${values} ON CONFLICT DO NOTHING;
            `;
      await client.query(interestQuery, params);
    }

    await client.query("COMMIT"); // 트랜잭션 커밋

    // 3. 인증 성공 후 반환
    return {
      user_id: userId,
      email: res.rows[0].email,
      displayName: res.rows[0].display_name,
      isNewUser: isNewUser, // 회원가입 여부 반환
    };
  } catch (error) {
    await client.query("ROLLBACK"); // 오류 발생 시 롤백
    // 디버깅을 위해 오류를 콘솔에 출력합니다.
    console.error("SQL Upsert Error:", error);
    throw error;
  } finally {
    client.release(); // DB 클라이언트 연결 반환
  }
};
