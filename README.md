# APAS - Automated Proposal Authoring System

AI 기반 외부용역과제 수행계획서 자동 작성 시스템

## 프로젝트 개요

한국 공공기관 용역 수행계획서를 AI로 자동 생성하는 웹 기반 시스템입니다.

### 주요 기능

- 📄 **문서 업로드 및 분석**: PDF/DOCX 형식의 공고문, 과업지시서, 계약서 분석
- 🤖 **AI 기반 콘텐츠 생성**: Gemini, Claude, OpenChat을 활용한 자동 작성
- 📋 **자동 목차 생성**: 표준 수행계획서 구조에 맞춘 목차 자동 생성
- ⚖️ **법령 근거 자동 인용**: 관련 법규 및 기준 자동 추출 및 인용
- 📤 **다양한 형식 내보내기**: DOCX, PDF, Markdown 형식 지원

## 기술 스택

### Frontend

- Next.js 14.x
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js 20.x LTS
- Express.js
- TypeScript
- Prisma ORM

### Database & Storage

- PostgreSQL 15.x (Supabase)
- Supabase Storage

### AI Services

- Google Gemini
- Anthropic Claude
- OpenChat

## 프로젝트 구조

```
Water_AI_Report_Gen/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express.js 백엔드
├── docs/              # 문서
├── PRD.md            # 제품 요구사항 문서
├── CLAUDE.md         # Claude Code 가이드
└── README.md         # 프로젝트 소개
```

## 개발 로드맵

### Phase 1: MVP (3개월)

- ✅ 프로젝트 초기화
- 🔄 인증 시스템 구현
- 📝 문서 업로드 및 파싱
- 🤖 AI 통합 및 콘텐츠 생성
- 📥 문서 내보내기

### Phase 2: 고도화 (2개월)

- 협업 기능
- 템플릿 관리
- UI/UX 개선
- 베타 출시

### Phase 3: 확장

- AI 모델 Fine-tuning
- 엔터프라이즈 기능
- 모바일 앱

## 시작하기

### 사전 요구사항

- Node.js 20.x 이상
- PostgreSQL 15.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/axconkr/Water_AI_Report_Gen.git
cd Water_AI_Report_Gen

# Frontend 설치
cd frontend
npm install

# Backend 설치
cd ../backend
npm install

# 환경 변수 설정
cp backend/.env.example backend/.env
# backend/.env 파일을 편집하여 필요한 API 키 설정
```

### 서버 실행

#### 간편 실행 (권장)

```bash
# 모든 서버 시작 (Backend + Frontend)
./start.sh

# 모든 서버 중지
./stop.sh

# 강제 종료 (모든 Node 프로세스)
./stop.sh --force

# 로그 파일과 함께 정리
./stop.sh --clean
```

#### 개별 실행

```bash
# Backend 서버 (http://localhost:4000)
cd backend
npm run dev

# Frontend 서버 (http://localhost:3000)
cd frontend
npm run dev
```

### 로그 확인

```bash
# Backend 로그
tail -f logs/backend.log

# Frontend 로그
tail -f logs/frontend.log
```

## 문서

- [PRD (Product Requirements Document)](./PRD.md)
- [Claude Code 가이드](./CLAUDE.md)

## 라이선스

TBD

## 기여

TBD

## 연락처

프로젝트 관련 문의: axconkr@github.com
