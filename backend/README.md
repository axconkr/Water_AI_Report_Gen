# APAS Backend

Express.js + TypeScript 기반 백엔드 API 서버

## 기술 스택

- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x (Supabase)
- **ORM**: Prisma 6.x
- **Authentication**: JWT
- **File Processing**: pdf-parse, mammoth, docxtemplater

## 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 `.env.example`을 참고하여 값을 설정하세요.

### 개발 서버 실행

```bash
npm run dev
```

서버가 [http://localhost:4000](http://localhost:4000) 에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm run start
```

### 린트

```bash
npm run lint
```

### Prisma 명령어

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# Prisma Studio 실행
npm run prisma:studio
```

## 프로젝트 구조

```
backend/
├── src/
│   ├── index.ts              # 서버 엔트리 포인트
│   ├── controllers/          # 컨트롤러
│   ├── routes/               # 라우트 정의
│   ├── middlewares/          # 미들웨어
│   ├── services/             # 비즈니스 로직
│   ├── utils/                # 유틸리티 함수
│   ├── config/               # 설정 파일
│   └── types/                # TypeScript 타입 정의
├── prisma/
│   └── schema.prisma         # Prisma 스키마
├── .env.example              # 환경 변수 예제
├── tsconfig.json             # TypeScript 설정
└── package.json
```

## API 엔드포인트

### Health Check

```
GET /health
```

### API v1

```
GET /api/v1
```

## 다음 단계

- [ ] Prisma 스키마 정의
- [ ] 데이터베이스 마이그레이션
- [ ] 인증 시스템 구현
- [ ] 파일 업로드 처리
- [ ] AI 서비스 통합
- [ ] API 문서화 (Swagger)
