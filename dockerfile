# 1. Node.js 베이스 이미지 선택 (LTS 버전 추천)
FROM node:20-slim

# 2. 컨테이너 내 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. 의존성 설치를 위해 package.json과 package-lock.json(있다면) 복사
COPY package*.json ./

# 4. 의존성 라이브러리 설치
RUN npm install --production

# 5. 나머지 프로젝트 소스 코드 복사
COPY . .

ENV PORT=3000

# 7. 서비스 포트 개방
EXPOSE 3000

# 8. 앱 실행 명령
CMD ["node", "app.js"]