import prisma from '../utils/prisma.js';
import * as bcrypt from 'bcrypt';
// 1. PrismaClient 대신, Prisma 네임스페이스를 가져옵니다.
import { Prisma } from '@prisma/client'; 

// 입력 데이터의 타입을 정의합니다.
interface SignupData {
    username: string;
    password: string;
    email: string;
    interests: number[]; // Topic ID 배열
}

// 비밀번호 해싱 및 사용자 생성을 처리하는 핵심 함수
export const signupService = async (data: SignupData) => {
    
    // 1. 비밀번호 해싱
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    // 2. DB 트랜잭션 실행: User 생성 및 UserInterest 연결
    // 2. 트랜잭션 콜백 함수에 Prisma.TransactionClient 타입을 명시합니다.
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => { 
        
        // 3-1. User 테이블에 사용자 정보 삽입
        const newUser = await tx.user.create({
            data: {
                username: data.username,
                password_hash: password_hash,
                email: data.email,
            },
        });
        
        // 3-2. UserInterest 테이블에 관심 분야 연결
        const interestData = data.interests.map((topicId: number) => ({
            user_id: newUser.user_id,
            topic_id: topicId,
        }));

        await tx.userInterest.createMany({
            data: interestData,
            skipDuplicates: true,
        });

        return newUser;
    });
    
    // 성공 시 사용자 정보 반환 (비밀번호 해시 제외)
    return {
        user_id: result.user_id,
        username: result.username,
    };
};

interface LoginData {
    username: string;
    password: string;
}

export const loginService = async (data: LoginData) => {
    
    // 1. 사용자 정보 조회 (해당 username의 레코드와 password_hash를 가져옴)
    const user = await prisma.user.findUnique({
        where: { username: data.username },
    });

    // 사용자가 존재하지 않는 경우
    if (!user) {
        return null; 
    }

    // 2. 비밀번호 검증 (입력된 비밀번호와 해시값 비교)
    // bcrypt.compare(입력된 비밀번호, DB에 저장된 해시값)
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
        return null; // 비밀번호 불일치
    }

    // 3. 검증 성공: 사용자 ID와 username 반환
    return {
        user_id: user.user_id,
        username: user.username,
    };
};