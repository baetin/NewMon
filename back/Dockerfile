# Node.js 최신 LTS 버전 이미지를 사용
FROM node:20-alpine

# 앱 디렉토리를 작업 디렉토리로 설정
WORKDIR /usr/src/app

# package.json과 package-lock.json 복사 (종속성 설치를 위해)
COPY package*.json ./

# 종속성 설치
RUN npm install

# 나머지 애플리케이션 소스 코드 복사
COPY . .

# TypeScript 컴파일 및 프로덕션 빌드 (Prisma Client 생성 포함)
# 실제 빌드 시에는 npx prisma generate를 먼저 실행해야 합니다.
RUN npm run build 

# 서버를 시작할 때 사용할 명령 정의 (package.json에 "start" 스크립트가 ts-node를 실행한다고 가정)
# 개발 환경에서 실행 시: ts-node src/app.ts
# 배포 환경에서는 빌드된 JS 파일을 실행합니다.
CMD [ "npm", "run", "start:dev" ]

# 포트 노출 (Docker 외부에 알려줍니다)
EXPOSE 3000