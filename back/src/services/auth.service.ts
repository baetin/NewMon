import pool from "../utils/db.js";
import { PoolClient } from "pg";

interface OAuthUserData {
  googleId: string;
  email: string;
  displayName: string;
}

export const upsertUserService = async (data: OAuthUserData) => {
  const { googleId, email, displayName } = data;
  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. SELECT: 기존 사용자가 있는지 확인
    const selectQuery = `SELECT user_id, email, display_name FROM "user" WHERE google_id = $1`;
    const existingUserResult = await client.query(selectQuery, [googleId]);

    let userId: number;
    let isNewUser: boolean;
    let finalUserInfo;

    if (
      existingUserResult &&
      typeof existingUserResult.rowCount === "number" &&
      existingUserResult.rowCount > 0
    ) {
      // [A] 기존 사용자: UPDATE 실행 (로그인)
      const updateQuery = `
            UPDATE "user" SET display_name = $2 
            WHERE google_id = $1 
            RETURNING user_id, email, display_name;
        `;
      const updateResult = await client.query(updateQuery, [
        googleId,
        displayName,
      ]);

      finalUserInfo = updateResult.rows[0];
      isNewUser = false;
    } else {
      // [B] 신규 사용자: INSERT 실행 (회원가입)
      const insertQuery = `
            INSERT INTO "user" (google_id, email, display_name)
            VALUES ($1, $2, $3)
            RETURNING user_id, email, display_name;
        `;
      const insertResult = await client.query(insertQuery, [
        googleId,
        email,
        displayName,
      ]);

      finalUserInfo = insertResult.rows[0];
      isNewUser = true;
    }

    await client.query("COMMIT");

    // 2. 인증 성공 후 반환
    return {
      user_id: finalUserInfo.user_id,
      email: finalUserInfo.email,
      displayName: finalUserInfo.display_name,
      isNewUser: isNewUser,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("SQL Upsert Error (SELECT/INSERT/UPDATE):", error);
    throw error;
  } finally {
    client.release();
  }
};
