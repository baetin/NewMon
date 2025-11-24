import fs from 'fs';
import parse from 'csv-parser';
import db from '../utils/db.js'; 
import format from 'pg-format'; 
import { PoolClient } from 'pg';
//import { parse } from 'path';

export const TOPIC_ID_TO_TABLE = {
          1: 'topic_economic_article',
          2: 'topic_social_article', 
          3: 'topic_it_science_article',
          4: 'topic_sports_article',
};
export const TARGET_TOPIC_ID = 4; // 스포츠(4) 토픽에 저장하도록 설정

// 🚨 [핵심] 안전한 값 추출 헬퍼 함수: undefined나 null 대신 빈 문자열 반환 (SQL TEXT/VARCHAR용)
const safeValue = (value: any): string | null => (value === undefined || value === null || value === '') ? null : String(value);

export const processAndSaveCsv = (filePath: string): Promise<number> => {
          const tableName = TOPIC_ID_TO_TABLE[TARGET_TOPIC_ID];
          if (!tableName) return Promise.reject(new Error(`Invalid TOPIC_ID: ${TARGET_TOPIC_ID}`));

          let totalRows = 0;
          let client: PoolClient;
          const records: any[] = []; 

          // DB에 삽입할 10개 컬럼 목록 (순서가 dataRow와 정확히 일치해야 함)
          const insertColumns = [
                    'title', 'summary_text', 'full_text', 'image_url', '"source"', 'published_date', 
                    'information_depth', 'focus_area', 'objectivity_score', 'source_url' 
          ];
          
          return new Promise(async (resolve, reject) => {
                    try {
                              client = await db.connect();
                              await client.query('BEGIN'); 

                         fs.createReadStream(filePath, { encoding: 'utf8' }) 
    // ✨ 수정: parse 대신 csvParse를 사용합니다. ✨
    .pipe(parse({ 
        headers: false, 
        skipLines: 1
    }))
                                        .on('data', (row: any) => { 
                                                  // F열(인덱스 5)의 published_date 값 추출
                                                  const publishedValue = row[5]; 
                                                  
                    // [날짜 유효성 검사 및 NOT NULL 처리]
                                                  const tempDateValue = 
                                                            (publishedValue && new Date(publishedValue).getTime() > 0) 
                                                            ? new Date(publishedValue).toISOString() 
                                                            : null; 
                    const finalPublishedDate = (tempDateValue === null)
                    
                        ? new Date().toISOString() // null이면 현재 시각으로 대체 (NOT NULL 준수)   
                        : tempDateValue;
                                                            
                                                  // ✨ 10개 컬럼 매핑 순서 (인덱스 기반) ✨
                                                  const dataRow = [
                                                            safeValue(row[10]), // 1. title (K열)
                                                            safeValue(row[14]), // 2. summary_text (O열)
                                                            safeValue(row[12]), // 3. full_text (M열)
                                                            safeValue(row[15]), // 4. image_url (P열)
                                                            safeValue(row[4]),  // 5. "source" (E열)
                                                            finalPublishedDate, // 6. published_date (F열)
                                                            'BASIC',                              // 7. information_depth 
                                                            safeValue(row[6]),  // 8. focus_area (G열)
                                                            85.00,                                   // 9. objectivity_score 
                                                            safeValue(row[1])      // 10. source_url (B열)
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

                                                  const safeTableName = tableName; 
                                                  const columnList = insertColumns.join(', ');
                                                  
                                                  // 🚨 SQL 구문 오류 해결을 위한 .trim() 제거 및 구조적 수정 적용
                                                  const insertQuery = format(`INSERT INTO public.%I (
                                                            ${columnList}
                                                  ) VALUES %L
                                                  ON CONFLICT (source_url) DO UPDATE 
                                                  SET 
                                                            title = EXCLUDED.title, full_text = EXCLUDED.full_text, 
                        image_url = EXCLUDED.image_url, "source" = EXCLUDED."source",
                                                            published_date = EXCLUDED.published_date, crawled_at = NOW(), 
                                                            information_depth = EXCLUDED.information_depth, focus_area = EXCLUDED.focus_area,
                                                            objectivity_score = EXCLUDED.objectivity_score, summary_text = NULL 
                                                  ;`, safeTableName, records);

                                                  console.log('------------------ DEBUG SQL QUERY START ------------------');
                    console.log(insertQuery); 
                    console.log('------------------- DEBUG SQL QUERY END -------------------');
                                                  
                                                  await client.query(insertQuery);
                                                  await client.query('COMMIT');
                                                  client.release();
                                                  resolve(totalRows);
                                        })
                                        .on('error', (err: unknown) => { // ✨ err: unknown으로 타입 명시 ✨
                                            client?.query('ROLLBACK').catch(console.error);
                                            client?.release();
                                            reject(err);
});
                    } catch (dbError: unknown) { // ✨ dbError: unknown으로 타입 명시 ✨
                        // (이 부분은 Promise 래퍼 내에서 발생한 초기 DB 연결 오류를 처리합니다.)
                        client?.query('ROLLBACK').catch(console.error);
                        client?.release();
                        reject(dbError);
                    }
          });
};