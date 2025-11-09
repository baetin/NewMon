// // auth.routes.ts 파일 (또는 별도의 passport 설정 파일)

// import { Router } from 'express';
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { upsertUserService } from '../services/auth.service.js'; 
// import { generateAuthToken } from '../utils/token.js';


// // src/routes/auth.routes.ts 상단

// // 환경 변수를 명시적으로 가져와서 확인
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const JWT_SECRET = process.env.JWT_SECRET; // token.ts에서 필요할 수 있으므로 함께 확인

// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !JWT_SECRET) {
//     // 💡 환경 변수 로드 실패 시 어떤 값이 빠졌는지 출력
//     console.error("FATAL ERROR: 다음 환경 변수 중 누락된 값이 있습니다.");
//     console.error(`- CLIENT_ID: ${!!GOOGLE_CLIENT_ID ? 'OK' : 'MISSING'}`);
//     console.error(`- CLIENT_SECRET: ${!!GOOGLE_CLIENT_SECRET ? 'OK' : 'MISSING'}`);
//     console.error(`- REDIRECT_URI: ${!!GOOGLE_REDIRECT_URI ? 'OK' : 'MISSING'}`);
//     console.error(`- JWT_SECRET: ${!!JWT_SECRET ? 'OK' : 'MISSING'}`);
//     throw new Error("필수 환경 변수 누락으로 서버 시작 실패.");
// }

// const router = Router();
// // ... 이 코드가 실행된 후 아래 passport.use가 실행되도록 합니다.
// // passport.use(...) 내부에서는 이제 ! 대신 바로 변수를 사용하세요.

// // Passport Google Strategy 설정
// passport.use(
//     new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID!,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         callbackURL: process.env.GOOGLE_REDIRECT_URI,
//         scope: ['profile', 'email'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             const userData = {
//                 googleId: profile.id,
//                 email: profile.emails?.[0].value || '',
//                 displayName: profile.displayName,
//             };
            
//             // 💡 서비스 함수 호출: DB에 사용자 정보를 저장하거나 업데이트합니다.
//             const user = await upsertUserService(userData); 
            
//             // done(에러, 사용자 객체)
//             return done(null, user); 
//         } catch (error) {
//             return done(error, undefined);
//         }
//     })
// );

// // 1. Google 로그인 시작 라우트
// // 이 라우트로 요청이 들어오면 Google 로그인 페이지로 리다이렉트됩니다.
// router.get('/google', passport.authenticate('google', { 
//     session: false // 세션 사용 안 함 (JWT 기반이라면)
// }));

// // 2. Google 콜백 처리 라우트
// // Google 인증 후 사용자가 이 URI로 돌아옵니다.
// router.get(
//     '/google/callback',
//     passport.authenticate('google', { 
//         session: false,
//         failureRedirect: '/login-failure' // 실패 시 리다이렉트할 경로
//     }),
// // ... (콜백 라우트 내부) ...
//     (req, res) => {
//         // req.user의 타입이 AuthUser로 가정하고 논널 단언(!) 사용 (혹은 if 문으로 req.user 확인)
//         if (!req.user) {
//             // 이 경우 Passport 설정에 문제가 있거나, 콜백이 실패했으나 failureRedirect가 아닌 이리로 온 경우입니다.
//             return res.redirect('/login-failure');
//         }

//         // 💡 토큰 페이로드에 필요한 정보만 전달
//         const token = generateAuthToken({
//             userId: req.user.user_id,
//             email: req.user.email,
//         }); 
        
//          // 리다이렉트 시 isNewUser 정보를 함께 전달
//         res.redirect(`http://localhost:3000/auth/callback?token=${token}&isNewUser=${req.user.isNewUser}`);
//     }
// );
// export default router;
