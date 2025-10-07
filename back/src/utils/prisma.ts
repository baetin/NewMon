import { PrismaClient } from '@prisma/client';

// PrismaClient 인스턴스를 한 번만 생성하여 재사용합니다.
const prisma = new PrismaClient();

// 필요하다면 여기서 DB 연결을 테스트하거나 초기화 작업을 할 수 있습니다.

export default prisma;