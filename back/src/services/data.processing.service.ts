import fs from 'fs';
import parse from 'csv-parser';
import db from '../utils/db.js';
import format from 'pg-format';
import { PoolClient } from 'pg';

// 실제 DB 테이블 이름과 ID 매핑 (TopicMaster 테이블에서 조회해야 하지만, 여기서는 임시 고정)
const TOPIC_ID_TO_TABLE = {
    1: 'topic_economic_article',
    2: 'topic_social_article',
    3: 'topic_it_science_article',
    4: 'topic_sports_article',
};
const TARGET_TOPIC_ID = 1; // 임시로 경제(1) 토픽에만 저장한다고 가정합니다.

/**
 * CSV 파일을 읽어 파싱 후 DB에 UPSERT 트랜잭션으로 저장합니다.
 * @param filePath 크롤링된 CSV 파일 경로
 * @returns 처리된 행 수
 */
export const processAndSaveCsv = (filePath: string): Promise<number> => {
    const tableName = TOPIC_ID_TO_TABLE[TARGET_TOPIC_ID];
    if (!tableName) return Promise.reject(new Error(`Invalid TOPIC_ID: ${TARGET_TOPIC_ID}`));

    let totalRows = 0;
    let client: PoolClient;
    const records: any[] = []; // 모든 레코드를 메모리에 임시 저장

    return new Promise(async (resolve, reject) => {
        try {
            client = await db.connect();
            await client.query('BEGIN'); // 트랜잭션 시작

            fs.createReadStream(filePath)
                .pipe(parse())
                .on('data', (row: any) => {
                    // ✨ CSV 컬럼 매핑 및 데이터 변환 ✨
                    // CSV 헤더: Title, Full_Text, Date, Source_URL 등이 있다고 가정
                    const dataRow = [
                        row['Title'],              // 1. title
                        row['Full_Text'],          // 2. full_text
                        new Date(row['Date']).toISOString(), // 3. published_date (날짜 변환)
                        '심층 분석',                 // 4. information_depth (예시 값)
                        85.00,                     // 5. objectivity_score (예시 값)
                        row['Source_URL']          // 6. source_url (UPSERT의 고유 키)
                    ];
                    records.push(dataRow);
                    totalRows++;
                })
                .on('end', async () => {
                    if (records.length === 0) {
                        await client.query('COMMIT');
                        client.release();
                        return resolve(0);
                    }

                    // 1. 안전한 SQL 식별자 (테이블 이름) 사용
                    const safeTableName = `"${tableName}"`;
                    
                    // 2. ✨ UPSERT 쿼리 생성: source_url 충돌 시 UPDATE ✨
                    const insertQuery = format(`
                        INSERT INTO public.%I (
                            title, full_text, published_date, information_depth, objectivity_score, source_url
                        ) 
                        VALUES %L
                        ON CONFLICT (source_url) DO UPDATE 
                        SET 
                            title = EXCLUDED.title,
                            full_text = EXCLUDED.full_text,
                            summary_text = NULL,       -- 내용 변경 시 요약 무효화
                            published_date = EXCLUDED.published_date,
                            crawled_at = NOW(),        -- 업데이트 시간 기록
                            information_depth = EXCLUDED.information_depth,
                            objectivity_score = EXCLUDED.objectivity_score
                        ;
                    `, safeTableName, records);
                    
                    // 3. DB 삽입 실행 및 커밋
                    await client.query(insertQuery);
                    await client.query('COMMIT');
                    client.release();
                    resolve(totalRows);
                })
                .on('error', (err) => {
                    client?.query('ROLLBACK').catch(console.error);
                    client?.release();
                    reject(err);
                });
        } catch (dbError) {
            reject(dbError);
        }
    });
};