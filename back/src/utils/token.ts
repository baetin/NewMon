import jwt from 'jsonwebtoken';
// Node.js 환경에서 환경 변수(예: .env 파일)를 사용하려면 dotenv 등의 설정을 확인하세요.

// 토큰에 담을 사용자 정보의 타입 정의
interface TokenPayload {
    userId: number;
    email: string;
    // 필요한 경우 다른 정보 추가
}

/**
 * 사용자 정보를 기반으로 JWT 인증 토큰을 생성합니다.
 * @param payload - 토큰에 포함될 사용자 데이터
 * @returns 생성된 JWT 문자열
 */
export const generateAuthToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        // 🚨 환경 변수 로드 실패 시 명확한 에러를 발생시킵니다.
        console.error("🚨 FATAL ERROR: JWT_SECRET 환경 변수가 설정되지 않았습니다.");
        throw new Error("JWT_SECRET is not configured.");
    }
    
    // 토큰 생성
    // expiresIn: 토큰 만료 시간 설정 (예: '1h', '7d')
    return jwt.sign(payload, secret, { expiresIn: '7d' }); 
};

/**
 * JWT 토큰의 유효성을 검증하고, 성공 시 페이로드(사용자 정보)를 반환합니다.
 * @param token - 클라이언트로부터 받은 JWT 문자열
 * @returns 유효한 경우 토큰 페이로드
 */
export const verifyAuthToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
    }

    try {
        // 토큰 검증 및 페이로드 디코딩
        const decoded = jwt.verify(token, secret);
        
        // 디코딩된 객체가 우리가 정의한 TokenPayload 타입을 따르는지 확인
        return decoded as TokenPayload;
    } catch (error) {
        // 토큰이 만료되었거나, 서명이 유효하지 않은 경우
        throw new Error("유효하지 않거나 만료된 토큰입니다.");
    }
};