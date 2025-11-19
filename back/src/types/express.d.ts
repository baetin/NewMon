import 'express-session';

declare module 'express-session' {
    // SessionData 인터페이스에 userId와 displayName 속성을 추가합니다.
    interface SessionData {
        userId: number;       
        displayName: string;  
    }
}