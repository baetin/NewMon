// // src/controllers/auth.controller.ts 파일

// import { Request, Response } from 'express';
// // ✨ 변경된 서비스 함수를 import 합니다. ✨
// import { upsertUserService } from '../services/auth.service.js'; 

// // 이 함수는 실제 Google 토큰을 검증하고 사용자 데이터를 추출하는 로직 뒤에 호출된다고 가정합니다.
// export const googleAuthCallbackController = async (req: Request, res: Response) => {
    
//     // 이 데이터는 실제 OAuth 흐름에서 Google API를 통해 검증된 후 req.body로 전달된다고 가정합니다.
//     const { googleId, email, displayName, interests } = req.body; 

//     // 1. 입력값 유효성 검사
//     if (!googleId || !email) {
//         return res.status(400).json({ message: 'Google ID and email are required for authentication.' });
//     }

//     try {
//         // 2. 서비스 호출 (회원가입/로그인 Upsert 로직 실행)
//         const userInfo = await upsertUserService({ googleId, email, displayName, interests });
        
//         // 3. 성공 응답
//         // 실제 운영 환경에서는 JWT 토큰을 생성하여 반환해야 합니다.
        
//         return res.status(200).json({
//             message: userInfo.isNewUser ? 'User registered successfully.' : 'Login successful.',
//             user: {
//                 userId: userInfo.user_id,
//                 email: userInfo.email,
//                 displayName: userInfo.displayName,
//             }
//             // token: token // 실제 구현 시
//         });

//     } catch (error) {
//         // 4. 오류 처리 및 로깅
//         console.error('--- OAuth 처리 실패 상세 로그 ---');
//         console.error(error);
//         console.error('------------------------------------');
        
//         // DB 오류가 발생했을 때 500 에러를 반환합니다.
//         return res.status(500).json({ message: 'Internal server error. Check server logs for details.' });
//     }
// };

// // 라우터 파일에서는 이 컨트롤러를 POST /api/auth/google-login 경로에 연결해야 합니다.