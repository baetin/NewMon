import pool from "../utils/db.js";
import { PoolClient } from "pg";

interface InterestUpdateData {
  userId: number;
  interests: number[]; // 업데이트할 topic_id 배열
}

export const updateInterests = async (data: InterestUpdateData) => {
  const { userId, interests } = data;
  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN"); // 트랜잭션 시작

    // 1. 기존 UserInterest 모두 삭제 (새로운 목록으로 대체)
    const deleteInterestsQuery = `
            DELETE FROM "userinterest" WHERE user_id = $1;
        `;
    await client.query(deleteInterestsQuery, [userId]);

    // 2. 새로운 UserInterest 삽입 (interests가 있는 경우만)
    if (interests.length > 0) {
      // 다중 VALUES 구문 생성
      const values = interests
        .map((topicId, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
        .join(", ");

      // 파라미터 배열 생성: [userId, topicId1, userId, topicId2, ...]
      const params = interests.flatMap((topicId) => [userId, topicId]);

      const insertInterestsQuery = `
                INSERT INTO "userinterest" (user_id, topic_id)
                VALUES ${values};
            `;
      await client.query(insertInterestsQuery, params);
    }

    await client.query("COMMIT"); // 성공 시 커밋

    return { userId, interests };
  } catch (error) {
    await client.query("ROLLBACK"); // 오류 발생 시 롤백
    console.error("Interest Update Transaction Failed:", error);
    throw new Error("Failed to update user interests.");
  } finally {
    client.release();
  }
};

export const getUserProfile = async (userId: number): Promise<{userId: number; displayName: string; email: string} | null> => {
    // DB에서 user_id를 기반으로 최신 display_name과 email을 조회하는 로직을 가정합니다.
    try {
        const result = await pool.query(
            `SELECT user_id, display_name, email FROM "user" WHERE user_id = $1`,
            [userId]
        );

        if (result.rowCount === 0) return null;

        const userRow = result.rows[0];

        return {
            userId: userRow.user_id,
            displayName: userRow.display_name, // DB에서 조회된 displayName
            email: userRow.email,
        };
    } catch (error) {
        console.error("DB Error fetching user profile:", error);
        throw error;
    }
};

// 기존 getPersonalizedArticles 함수 등은 여기에 계속 존재한다고 가정합니다.
