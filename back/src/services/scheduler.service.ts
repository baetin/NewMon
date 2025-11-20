import cron from 'node-cron';
import { processAndSaveCsv } from './data.processing.service.js';
import * as fs from 'fs';
import * as path from 'path';

// 크롤러가 CSV를 저장하는 경로 (프로젝트 루트 기준으로 설정)
const CSV_FILE_PATH = path.join(process.cwd(), 'crawled_data', 'latest_news.csv'); 

const startCronJob = () => {
    // Cron 표현식: '*/30 * * * *' 는 매 30분마다 실행합니다.
    cron.schedule('*/30 * * * *', async () => {
        console.log(`\n==============================================`);
        console.log(`🤖 Starting scheduled CSV import job: ${new Date().toLocaleTimeString()}`);
        
        if (!fs.existsSync(CSV_FILE_PATH)) {
            console.warn('⚠️ CSV file not found at path. Skipping import job.');
            console.log(`==============================================`);
            return;
        }

        try {
            const rowCount = await processAndSaveCsv(CSV_FILE_PATH);
            
            console.log(`✅ Successfully imported ${rowCount} rows into DB.`);
            
            // 성공 후 파일 삭제 (다음 크롤링을 위해 파일을 비움)
            fs.unlinkSync(CSV_FILE_PATH); 
            console.log(`🧹 CSV file deleted.`);
            
        } catch (error) {
            console.error('❌ CRON job failed:', error);
        }
        console.log(`==============================================`);
    });

    console.log('🗓️ CSV import scheduler started. Runs every 30 minutes.');
};

export default startCronJob;