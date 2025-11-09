// // src/types/express.d.ts

// // upsertUserService가 반환하는 사용자 객체의 타입과 일치해야 합니다.
// interface AuthUser {
//     user_id: number;
//     email: string;
//     displayName: string;
//     isNewUser: boolean;
// }

// declare namespace Express {
//     interface User extends AuthUser {} // Passport에서 사용하는 User 타입 정의
    
//     interface Request {
//         // req.user의 타입을 AuthUser로 확장
//         user?: AuthUser; 
//     }
// }