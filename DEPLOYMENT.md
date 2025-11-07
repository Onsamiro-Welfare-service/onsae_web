# ONSAE Web Renew - 배포 가이드

## 📋 목차
- [환경 변수](#환경-변수)
- [로컬 빌드](#로컬-빌드)
- [Docker 배포](#docker-배포)
- [Vercel 배포](#vercel-배포)
- [트러블슈팅](#트러블슈팅)

---

## 환경 변수

### 필수 환경 변수

프로덕션 환경에서 **반드시 설정**해야 하는 환경 변수:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

### 선택적 환경 변수

```env
NEXT_PUBLIC_APP_NAME=온새미로
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 환경 변수 우선순위

Next.js는 다음 순서로 환경 변수를 읽습니다:

1. `.env.production.local` (프로덕션 전용, Git 무시)
2. `.env.local` (Git 무시)
3. `.env.production` (프로덕션 전용)
4. `.env`

**권장사항:** `.env.example` 파일을 복사하여 `.env.production` 생성

---

## 로컬 빌드

### 1. 프로덕션 빌드 생성

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 확인
ls -la .next/
```

### 2. 로컬에서 프로덕션 모드 테스트

```bash
# 프로덕션 서버 실행
npm start

# 서버가 http://localhost:3000 에서 실행됨
```

### 3. 환경 변수 확인

빌드 후 브라우저 개발자 도구에서 환경 변수가 올바르게 주입되었는지 확인:

```javascript
// 브라우저 콘솔에서 실행
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## Docker 배포

### 1. Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=https://api.your-domain.com/api

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker 빌드 및 실행

```bash
# 이미지 빌드
docker build -t onsae-web:latest .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.your-domain.com/api \
  onsae-web:latest
```

### 3. Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
    restart: unless-stopped
```

```bash
# Docker Compose로 실행
docker-compose up -d
```

---

## Vercel 배포

### 1. Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
```

### 2. 프로젝트 배포

```bash
# 프로덕션 배포
vercel --prod

# 배포 전 미리보기
vercel
```

### 3. 환경 변수 설정

Vercel 대시보드에서:

1. **Settings** → **Environment Variables**
2. 다음 환경 변수 추가:
   ```
   NEXT_PUBLIC_API_URL = https://api.your-domain.com/api
   ```
3. **Save** 후 자동 재배포

### 4. GitHub 연동

```bash
# GitHub 저장소와 연결
vercel --github
```

연결 후, GitHub에 push할 때마다 자동 배포됩니다.

---

## 트러블슈팅

### 빌드 에러: 환경 변수 누락

**증상:**
```
Error: NEXT_PUBLIC_API_URL is not defined
```

**해결:**
```bash
# .env.production 파일 확인
cat .env.production

# 환경 변수 설정
echo "NEXT_PUBLIC_API_URL=https://api.your-domain.com/api" > .env.production
```

### 런타임 에러: API 연결 실패

**증상:**
- 브라우저 콘솔에 CORS 에러
- Network 탭에서 API 요청 실패

**해결:**
1. 환경 변수가 올바르게 설정되었는지 확인
2. 백엔드 CORS 설정 확인
3. API 서버가 실행 중인지 확인

### 환경 변수가 변경되지 않음

**원인:** Next.js는 빌드 시점에 환경 변수를 주입합니다.

**해결:**
```bash
# 다시 빌드
npm run build

# 컨테이너 재시작
docker-compose down
docker-compose up -d
```

---

## 체크리스트

배포 전 확인 사항:

- [ ] 환경 변수 설정 확인
- [ ] 프로덕션 빌드 성공
- [ ] 로컬에서 `npm start` 테스트 완료
- [ ] API 서버 연결 확인
- [ ] CORS 설정 확인
- [ ] HTTPS 설정 확인 (프로덕션)
- [ ] 도메인 설정 확인
- [ ] SSL 인증서 설정 확인

---

## 추가 리소스

- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Docker 공식 문서](https://docs.docker.com/)

