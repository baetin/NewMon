import pool from "../utils/db.js";
import { PoolClient } from "pg"; // pg 클라이언트 타입 정의를 위해 import

// Google에서 전달받는 사용자 데이터의 타입 정의
interface OAuthUserData {
  googleId: string;
  email: string;
  displayName: string;
}

// 회원가입과 로그인을 동시에 처리하는 Upsert 함수
export const upsertUserService = async (data: OAuthUserData) => {
  const { googleId, email, displayName } = data; // interests 제거
  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. User Upsert (조회 및 생성/업데이트)
    const upsertQuery = `
            INSERT INTO "user" (google_id, email, display_name)
            VALUES ($1, $2, $3)
            ON CONFLICT (google_id) DO UPDATE 
            SET display_name = $3 
            RETURNING user_id, display_name, email;
        `;

    const res = await client.query(upsertQuery, [googleId, email, displayName]);

    const userId: number = res.rows[0].user_id;
    // 명령어가 'INSERT'이면 새 사용자, 아니면 기존 사용자입니다.
    let isNewUser: boolean = res.command === "INSERT";

    // 2. 관심 분야 연결 로직 제거
    // (이제 별도의 API POST /api/user/interests를 통해 처리됩니다.)
    // if (isNewUser && interests && interests.length > 0) { ... } 로직 전체 제거

    await client.query("COMMIT");

    // 3. 인증 성공 후 반환
    return {
      user_id: userId,
      email: res.rows[0].email,
      displayName: res.rows[0].display_name,
      isNewUser: isNewUser, // 회원가입 여부 반환
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("SQL Upsert Error:", error);
    throw error;
  } finally {
    client.release();
  }
};
