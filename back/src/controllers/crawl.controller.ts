// crawl.controller.ts

import { Request, Response } from "express";
import * as path from "path";
import { processAndSaveCsv } from "../services/data.processing.service.js"; // .ts 또는 .js 파일에서 임포트

// 크롤러가 CSV를 저장하는 경로 (프로젝트 루트 기준으로 설정)
// const CSV_FILE_PATH = 'c:\\Users\\ADMIN\\Desktop\\crawl\\exports\\articles.csv';
const CSV_FILE_PATH =
  "D:\\USER\\Documents\\카카오톡 받은 파일\\articles (5).csv";

// const CSV_FILE_PATH = 'C:\\Users\\ADMIN\\Downloads\\articles (3).csv';
// TypeScript 오류 처리를 위한 타입 가드
function isError(error: any): error is Error {
  return error && typeof error.message === "string";
}

// POST /api/v1/crawl/trigger 요청을 처리하는 함수
export const triggerImport = async (req: Request, res: Response) => {
  try {
    // [주의] 이 시점에 CSV 파일을 생성하는 별도의 크롤링 로직이 먼저 실행되어야 합니다.

    const rowCount: number = await processAndSaveCsv(CSV_FILE_PATH);

    // 작업 성공 응답
    return res.status(200).json({
      message: "CSV import job successfully triggered and completed.",
      rows_imported: rowCount,
    });
  } catch (error) {
    // 타입 가드를 사용하여 안전하게 오류 메시지를 추출
    const errorMessage = isError(error)
      ? error.message
      : "An unknown error occurred.";

    return res.status(500).json({
      message: "CRON job failed during import.",
      error: errorMessage,
    });
  }
};
