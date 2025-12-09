import fs from 'fs';
import db from '../utils/db.js'; 
import format from 'pg-format'; 
import { PoolClient } from 'pg';

// ✨ 1. CSV 파서 임포트 최종 수정: 객체 전체를 가져와 함수 자체를 추출합니다. ✨
import * as csvParser from 'csv-parser'; 
const parse = (csvParser as any).default || csvParser; // Node.js 호환성을 위한 안전한 추출


// Top Table Name Map은 main.service.ts에서 가져와야 하지만, 편의상 여기에 정의합니다.
// (실제 프로젝트에서는 import 해야 합니다.)
const getTopicToTableNameMap = async (client: PoolClient): Promise<Record<number, string>> => {
    const topicMapResult = await client.query(`SELECT topic_id, topic_name FROM public.topic`);
    return topicMapResult.rows.reduce((acc, row) => {
        let name = row.topic_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
        if (name.includes('it_') && name.includes('science')) name = 'it_science';
        else if (name === "sport") name = "sports";
        acc[row.topic_id] = `topic_${name}_article`;
        return acc;
    }, {});
};


const CSV_INDEX = {
    TITLE: 10, MODIFIED_AT: 11, FULL_TEXT: 12, PUBLISHED_AT: 5, SOURCE_URL: 1, image_original_url: 16, 
    SOURCE: 4, FOCUS_AREA: 6, CATEGORY_ID: 6 // ✨ CATEGORY_ID (G열)
};

const safeValue = (value: any): string | null => (value === undefined || value === null || value === '') ? null : String(value);


export const processAndSaveCsv = (filePath: string): Promise<number> => {
    let totalRows = 0;
    let client: PoolClient | null = null;
    // ✨ 수정: Map<topicId, DataRow[][]> 형태로 데이터를 분류하여 저장 ✨
    const classifiedRecords = new Map<number, any[][]>(); 

    const insertColumns = [
        'title', 'summary_text', 'full_text', 'image_original_url', 'source', 'published_date', 
        'information_depth', 'focus_area', 'objectivity_score', 'source_url' ,'modified_at'
    ];

    return new Promise(async (resolve, reject) => {
        try {
            client = await db.connect();
            const topicToTableNameMap = await getTopicToTableNameMap(client); // ✨ 맵핑 데이터 로드 ✨
            await client.query('BEGIN'); 

            const escapedColumnList = insertColumns.map(col => client!.escapeIdentifier(col)).join(', ');

            fs.createReadStream(filePath, { encoding: 'utf8' }) 
                .pipe(parse({ headers: false, skipLines: 1 }))
                .on('data', (row: any) => {
                    // F열(인덱스 5)의 published_date 값 추출 및 처리
                    const publishedValue = row[CSV_INDEX.PUBLISHED_AT];
                    const tempDateValue = (publishedValue && new Date(publishedValue).getTime() > 0) ? new Date(publishedValue).toISOString() : null; 
                    const finalPublishedDate = (tempDateValue === null) ? new Date().toISOString() : tempDateValue;
                    
                    const topicId = parseInt(row[CSV_INDEX.CATEGORY_ID]); // ✨ CSV에서 topicId 읽기 ✨
                    
                    // 유효하지 않은 topicId는 건너뜁니다.
                    if (isNaN(topicId) || !topicToTableNameMap[topicId]) {
                        console.warn(`Skipping row due to invalid Topic ID: ${row[CSV_INDEX.CATEGORY_ID]}`);
                        return; 
                    }

                    const modifiedValue = row[CSV_INDEX.MODIFIED_AT];
                    const finalModifiedDate = (modifiedValue && new Date(modifiedValue).getTime() > 0)
                        ? new Date(modifiedValue).toISOString()
                        : new Date().toISOString();

                    // 10개 컬럼 매핑 순서 (DB 컬럼 목록과 일치)
                    const dataRow = [
                        safeValue(row[CSV_INDEX.TITLE]), safeValue(row[14]), safeValue(row[CSV_INDEX.FULL_TEXT]), 
                        safeValue(row[CSV_INDEX.image_original_url]), safeValue(row[CSV_INDEX.SOURCE]), finalPublishedDate, 
                        'BASIC', safeValue(row[CSV_INDEX.FOCUS_AREA]), 85.00, safeValue(row[CSV_INDEX.SOURCE_URL]),
                        finalModifiedDate,
                    ];

                    // ✨ 토픽 ID별로 레코드를 분류하여 Map에 저장 ✨
                    if (!classifiedRecords.has(topicId)) { classifiedRecords.set(topicId, []); }
                    classifiedRecords.get(topicId)!.push(dataRow);
                    totalRows++;
                })
                .on('end', async () => {
                    if (totalRows === 0) { // 데이터가 없는 경우
                        await client!.query('COMMIT'); client!.release();
                        return resolve(0);
                    }

                    // 2. ✨ 토픽별로 순회하며 DB에 UPSERT 실행 ✨
                    for (const [topicId, records] of classifiedRecords.entries()) {
                        const tableName = topicToTableNameMap[topicId];
                        const safeTableName = tableName;

                      
                        
                      const insertQuery = format(`
    INSERT INTO public.%s (%s) 
    VALUES %L
    ON CONFLICT (source_url) DO UPDATE 
    SET 
    
        previous_full_text = public.%s.full_text, 
        title = EXCLUDED.title, full_text = EXCLUDED.full_text, 
        image_original_url = EXCLUDED.image_original_url, source = EXCLUDED.source,
        published_date = EXCLUDED.published_date, crawled_at = NOW(), 
        update_time = NOW(),
        summary_text = EXCLUDED.summary_text,
        information_depth = EXCLUDED.information_depth, focus_area = EXCLUDED.focus_area,
        objectivity_score = EXCLUDED.objectivity_score,
        modified_at = EXCLUDED.modified_at
`, 
    safeTableName, insertColumns.join(', '), records, safeTableName
);

                        await client!.query(insertQuery);
}

                    await client!.query('COMMIT'); 
                    client!.release();
                    resolve(totalRows);
                })
                .on('error', (err: unknown) => { 
                    client?.query('ROLLBACK').catch(console.error);
                    client?.release();
                    reject(err);
                });
        } catch (dbError) {
            client?.query('ROLLBACK').catch(console.error);
            client?.release();
            reject(dbError);
        }
    });
};

// const parse = (csvParser as any).default || csvParser; // Node.js 호환성을 위한 안전한 추출
// import fs from 'fs';
// import parse from 'csv-parser';
// import db from '../utils/db.js'; 
// import format from 'pg-format'; 
// import { PoolClient } from 'pg';
// //import { parse } from 'path';
// // 야호

// export const TOPIC_ID_TO_TABLE = {
//           1: 'topic_economic_article',
//           2: 'topic_social_article', 
//           3: 'topic_it_science_article',
//           4: 'topic_sports_article',
// };
// export const TARGET_TOPIC_ID = 4; // 스포츠(4) 토픽에 저장하도록 설정

// // 🚨 [핵심] 안전한 값 추출 헬퍼 함수: undefined나 null 대신 빈 문자열 반환 (SQL TEXT/VARCHAR용)
// const safeValue = (value: any): string | null => (value === undefined || value === null || value === '') ? null : String(value);

// export const processAndSaveCsv = (filePath: string): Promise<number> => {
//           const tableName = TOPIC_ID_TO_TABLE[TARGET_TOPIC_ID];
//           if (!tableName) return Promise.reject(new Error(`Invalid TOPIC_ID: ${TARGET_TOPIC_ID}`));

//           let totalRows = 0;
//           let client: PoolClient;
//           const records: any[] = []; 

//           // DB에 삽입할 10개 컬럼 목록 (순서가 dataRow와 정확히 일치해야 함)
//           const insertColumns = [
//                     'title', 'summary_text', 'full_text', 'image_url', '"source"', 'published_date', 
//                     'information_depth', 'focus_area', 'objectivity_score', 'source_url' 
//           ];
          
//           return new Promise(async (resolve, reject) => {
//                     try {
//                               client = await db.connect();
//                               await client.query('BEGIN'); 

//                          fs.createReadStream(filePath, { encoding: 'utf8' }) 
//     // ✨ 수정: parse 대신 csvParse를 사용합니다. ✨
//     .pipe(parse({ 
//         headers: false, 
//         skipLines: 1
//     }))
//                                         .on('data', (row: any) => { 
//                                                   // F열(인덱스 5)의 published_date 값 추출
//                                                   const publishedValue = row[5]; 
                                                  
//                     // [날짜 유효성 검사 및 NOT NULL 처리]
//                                                   const tempDateValue = 
//                                                             (publishedValue && new Date(publishedValue).getTime() > 0) 
//                                                             ? new Date(publishedValue).toISOString() 
//                                                             : null; 
//                     const finalPublishedDate = (tempDateValue === null)
                    
//                         ? new Date().toISOString() // null이면 현재 시각으로 대체 (NOT NULL 준수)   
//                         : tempDateValue;
                                                            
//                                                   // ✨ 10개 컬럼 매핑 순서 (인덱스 기반) ✨
//                                                   const dataRow = [
//                                                             safeValue(row[10]), // 1. title (K열)
//                                                             safeValue(row[14]), // 2. summary_text (O열)
//                                                             safeValue(row[12]), // 3. full_text (M열)
//                                                             safeValue(row[15]), // 4. image_url (P열)
//                                                             safeValue(row[4]),  // 5. "source" (E열)
//                                                             finalPublishedDate, // 6. published_date (F열)
//                                                             'BASIC',                              // 7. information_depth 
//                                                             safeValue(row[6]),  // 8. focus_area (G열)
//                                                             85.00,                                   // 9. objectivity_score 
//                                                             safeValue(row[1])      // 10. source_url (B열)
//                                                   ];

                                                  

//                                                   records.push(dataRow);
//                                                   totalRows++;
//                                         })
//                                         .on('end', async () => {
//                                                   if (records.length === 0) {
//                                                             await client.query('COMMIT');
//                                                             client.release();
//                                                             return resolve(0);
//                                                   }

//                                                   const safeTableName = tableName; 
//                                                   const columnList = insertColumns.join(', ');
                                                  
//                                                   // 🚨 SQL 구문 오류 해결을 위한 .trim() 제거 및 구조적 수정 적용
//                                                   const insertQuery = format(`
//                                                         INSERT INTO public.%I (
//                                                             title, full_text, published_date, information_depth, objectivity_score, source_url, image_url, "source", focus_area, summary_text
//                                                         ) 
//                                                         VALUES %L
//                                                         ON CONFLICT (source_url) DO UPDATE 
//                                                         SET 
//                                                             -- ✨ 1. 기존 full_text를 previous_full_text에 백업합니다. ✨
//                                                             previous_full_text = "topic_economic_article".full_text, 
                                                            
//                                                             -- 2. 새 데이터로 컬럼을 덮어씁니다.
//                                                             title = EXCLUDED.title,
//                                                             full_text = EXCLUDED.full_text,
//                                                             image_url = EXCLUDED.image_url,
//                                                             "source" = EXCLUDED."source",
//                                                             published_date = EXCLUDED.published_date,
//                                                             crawled_at = NOW(),        
//                                                             update_time = NOW(),        -- ✨ 수정 시각 기록 ✨
//                                                             summary_text = NULL,       -- 내용 변경 시 요약 무효화
//                                                             information_depth = EXCLUDED.information_depth,
//                                                             focus_area = EXCLUDED.focus_area,
//                                                             objectivity_score = EXCLUDED.objectivity_score
//                                                         ;
//                                                     `, safeTableName, records);
//                                                   console.log('------------------ DEBUG SQL QUERY START ------------------');
//                     console.log(insertQuery); 
//                     console.log('------------------- DEBUG SQL QUERY END -------------------');
                                                  
//                                                   await client.query(insertQuery);
//                                                   await client.query('COMMIT');
//                                                   client.release();
//                                                   resolve(totalRows);
//                                         })
//                                         .on('error', (err: unknown) => { // ✨ err: unknown으로 타입 명시 ✨
//                                             client?.query('ROLLBACK').catch(console.error);
//                                             client?.release();
//                                             reject(err);
// });
//                     } catch (dbError: unknown) { // ✨ dbError: unknown으로 타입 명시 ✨
//                         // (이 부분은 Promise 래퍼 내에서 발생한 초기 DB 연결 오류를 처리합니다.)
//                         client?.query('ROLLBACK').catch(console.error);
//                         client?.release();
//                         reject(dbError);
//                     }
//           });
// };