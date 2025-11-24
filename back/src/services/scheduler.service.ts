import cron from 'node-cron';
import { processAndSaveCsv } from './data.processing.service.js';
import * as fs from 'fs';
import * as path from 'path';

// 🚨 CSV 파일 경로: (Windows 다운로드 경로 예시)
const CSV_FILE_PATH = 'C:\\Users\\ADMIN\\Downloads\\articles (3).csv'; 

const startCronJob = () => {
    cron.schedule('*/30 * * * *', async () => {
        console.log(`\n==============================================`);
        console.log(`🤖 Starting scheduled CSV import job: ${new Date().toLocaleTimeString()}`);
        
        // 🚨 크롤링 코드가 여기에 위치해야 합니다. (runNewsCrawler();)
        
        if (!fs.existsSync(CSV_FILE_PATH)) {
            console.warn(`⚠️ CSV file not found at path: ${CSV_FILE_PATH}. Skipping import job.`);
            console.log(`==============================================`);
            return;
        }

        try {
            const rowCount = await processAndSaveCsv(CSV_FILE_PATH);
            
            console.log(`✅ Successfully imported ${rowCount} rows into DB.`);
            
            // 성공 후 파일 삭제 
            fs.unlinkSync(CSV_FILE_PATH); 
            console.log(`🧹 CSV file deleted.`);
            
        } catch (error) {
            console.error('❌ CRON job failed:', (error as Error).message);
        }
        console.log(`==============================================`);
    }, {
        timezone: 'Asia/Seoul'
    });

    console.log('🗓️ CSV import scheduler started. Runs every 30 minutes.');
};

export default startCronJob;