# ONSAE Web Renew - Next.js Migration

온새미로(ONSAE) 웹 애플리케이션을 Vite + React에서 Next.js 15로 마이그레이션한 프로젝트입니다.

## 🚀 기술 스택

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5
- **UI Library:** Material-UI (MUI) v7
- **State Management:** TanStack Query (React Query) v5
- **Styling:** Emotion, MUI System
- **Charts:** ApexCharts
- **Icons:** Iconify
- **Date:** Day.js
- **Utils:** es-toolkit

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (dashboard)/       # 대시보드 레이아웃 그룹
│   │   ├── layout.tsx
│   │   ├── page.tsx       # 메인 대시보드
│   │   ├── user/
│   │   ├── question/
│   │   ├── responses/
│   │   ├── products/
│   │   ├── blog/
│   │   ├── uploads/
│   │   └── admin/
│   ├── sign-in/           # 로그인 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── globals.css
│   └── providers.tsx      # 글로벌 프로바이더
├── components/            # 공통 컴포넌트
├── layouts/              # 레이아웃 컴포넌트
├── sections/             # 페이지별 섹션 컴포넌트
├── services/             # API 서비스
├── hooks/                # 커스텀 훅
├── routes/               # 라우팅 유틸리티
├── theme/                # MUI 테마 설정
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
└── _mock/                # 목 데이터
```

## 🔧 주요 변경사항

### 1. 라우팅 시스템
- **Before:** React Router (react-router-dom)
- **After:** Next.js App Router
- 파일 기반 라우팅으로 전환
- 동적 라우팅 및 레이아웃 그룹 활용

### 2. 빌드 도구
- **Before:** Vite
- **After:** Next.js (Turbopack 지원)

### 3. Import 경로
- 모든 import를 `@/` alias로 통일
- `src/` → `@/`로 일괄 변경

### 4. 클라이언트/서버 컴포넌트
- 필요한 컴포넌트에 `'use client'` 지시어 추가
- Provider, hooks 사용 컴포넌트는 클라이언트 컴포넌트로 설정

## 🛠 설치 및 실행

### 개발 환경 실행
```bash
npm install
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## 🌍 환경 변수

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=온새미로
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📝 주요 페이지

- **/** - 대시보드 메인
- **/user** - 사용자 관리
- **/question** - 질문 관리
- **/responses** - 응답 관리
- **/products** - 제품 관리
- **/blog** - 블로그
- **/uploads** - 업로드 관리
- **/admin** - 관리자 설정
- **/sign-in** - 로그인

## 🎨 테마

MUI v7을 사용하여 커스텀 테마를 구성했습니다:
- Light mode 지원
- 커스텀 컬러 팔레트
- 커스텀 타이포그래피
- 커스텀 컴포넌트 스타일

## 📦 주요 의존성

```json
{
  "dependencies": {
    "next": "15.5.4",
    "react": "19.1.0",
    "@mui/material": "^7.3.4",
    "@tanstack/react-query": "^5.90.2",
    "@emotion/react": "^11.14.0",
    "@iconify/react": "^6.0.2",
    "apexcharts": "^5.3.5",
    "dayjs": "^1.11.18"
  }
}
```

## 🔄 마이그레이션 체크리스트

- ✅ Next.js 프로젝트 초기 설정
- ✅ 의존성 패키지 마이그레이션
- ✅ 컴포넌트 및 레이아웃 이전
- ✅ React Router → Next.js App Router 전환
- ✅ API 서비스 레이어 이전
- ✅ 스타일 및 테마 설정
- ✅ 환경 설정 및 빌드 구성
- ✅ 빌드 성공 확인

## 🚧 향후 작업

- [ ] 서버 컴포넌트 최적화
- [ ] ISR/SSG 전략 수립
- [ ] API Route 구현
- [ ] 이미지 최적화 (next/image 적용)
- [ ] 성능 최적화
- [ ] E2E 테스트 작성

## 📄 라이선스

MIT

## 👥 기여자

ONSAE Development Team
