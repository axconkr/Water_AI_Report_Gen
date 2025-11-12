# APAS 로컬 테스트 가이드

## 사전 준비

### 1. Supabase 데이터베이스 연결 설정

Supabase 프로젝트에서 정확한 데이터베이스 연결 문자열을 가져와야 합니다.

**Supabase Dashboard에서 확인:**

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (pifgawpsiptgsbyyxryn)
3. Settings → Database
4. Connection string 섹션에서 "URI" 선택
5. 비밀번호를 `@!Chaos0804`로 대체
6. 복사한 연결 문자열을 `backend/.env`의 `DATABASE_URL`에 붙여넣기

**연결 문자열 형식:**

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[HOST]/postgres?schema=public
```

### 2. Supabase Storage 버킷 생성

1. Supabase Dashboard → Storage
2. "New Bucket" 클릭
3. 버킷 이름: `documents`
4. Public bucket: `true` (체크)
5. Create bucket

### 3. 환경 변수 확인

**Backend (`backend/.env`)**

```env
# 반드시 확인 필요
DATABASE_URL=postgresql://postgres.pifgawpsiptgsbyyxryn:[PASSWORD]@[HOST]/postgres
SUPABASE_URL=https://pifgawpsiptgsbyyxryn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT 시크릿 (이미 설정됨)
JWT_SECRET=apas_jwt_secret_key_2024_production_ready
REFRESH_TOKEN_SECRET=apas_refresh_token_secret_key_2024_production

# AI API 키 (이미 설정됨)
GEMINI_API_KEY=AIzaSyCiaGcHqn69onapYYmdnj8g69ZhmeBZDqs
CLAUDE_API_KEY=sk-ant-api03-...
```

**Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## 설치 및 실행

### Backend 실행

```bash
# 1. Backend 디렉토리로 이동
cd backend

# 2. 의존성 설치 (이미 완료된 경우 스킵)
npm install

# 3. Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# 4. Prisma Client 생성
npx prisma generate

# 5. 서버 실행
npm run dev
```

**성공 시 출력:**

```
🚀 Server is running on port 4000
📍 Environment: development
🔗 API: http://localhost:4000/api/v1
```

### Frontend 실행

```bash
# 1. Frontend 디렉토리로 이동
cd frontend

# 2. 의존성 설치 (이미 완료된 경우 스킵)
npm install

# 3. 개발 서버 실행
npm run dev
```

**성공 시 출력:**

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

## 테스트 시나리오

### 1. 회원가입 & 로그인 테스트

1. 브라우저에서 http://localhost:3000 접속
2. "회원가입" 클릭
3. 정보 입력:
   - 이름: 테스트 사용자
   - 이메일: test@example.com
   - 비밀번호: Test1234! (대소문자, 숫자, 특수문자 포함)
4. 회원가입 완료 후 자동 로그인
5. 대시보드로 이동 확인

### 2. 프로젝트 생성 테스트

1. 대시보드에서 "새 프로젝트" 클릭
2. 프로젝트 정보 입력:
   - 이름: 2024년 수자원 관리 계획
   - 설명: 테스트 프로젝트
   - 유형: 수자원
3. 프로젝트 생성 확인
4. 프로젝트 상세 페이지로 이동

### 3. 파일 업로드 테스트

1. 프로젝트 상세 페이지에서 "파일 추가" 클릭
2. PDF 또는 DOCX 파일 선택 (최대 10MB)
3. 업로드 완료 확인
4. 업로드된 파일 목록에서 확인

### 4. AI 문서 분석 테스트 (API 직접 호출)

**Postman 또는 curl 사용:**

```bash
# 1. 로그인하여 토큰 받기
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# 응답에서 accessToken 복사

# 2. 문서 분석 요청
curl -X POST http://localhost:4000/api/v1/analysis/documents/{documentId} \
  -H "Authorization: Bearer {accessToken}"

# 3. 분석 결과 조회
curl -X GET http://localhost:4000/api/v1/analysis/documents/{documentId} \
  -H "Authorization: Bearer {accessToken}"
```

### 5. AI 콘텐츠 생성 테스트

```bash
# 섹션 콘텐츠 생성
curl -X POST http://localhost:4000/api/v1/content/generate \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{projectId}",
    "sectionTitle": "1. 사업 개요",
    "sectionDescription": "사업의 배경과 목적을 설명"
  }'
```

### 6. AI 채팅 테스트

```bash
# AI와 대화
curl -X POST http://localhost:4000/api/v1/content/chat \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{projectId}",
    "message": "업로드한 문서의 주요 내용을 요약해줘"
  }'
```

## API 엔드포인트 전체 목록

### 인증 API

- POST `/api/v1/auth/register` - 회원가입
- POST `/api/v1/auth/login` - 로그인
- POST `/api/v1/auth/refresh` - 토큰 갱신
- POST `/api/v1/auth/forgot-password` - 비밀번호 재설정
- GET `/api/v1/auth/profile` - 프로필 조회

### 프로젝트 API

- POST `/api/v1/projects` - 프로젝트 생성
- GET `/api/v1/projects` - 프로젝트 목록
- GET `/api/v1/projects/:id` - 프로젝트 상세
- PUT `/api/v1/projects/:id` - 프로젝트 수정
- DELETE `/api/v1/projects/:id` - 프로젝트 삭제

### 파일 업로드 API

- POST `/api/v1/upload` - 파일 업로드
- GET `/api/v1/upload/:projectId` - 파일 목록
- DELETE `/api/v1/upload/:documentId` - 파일 삭제

### AI 분석 API

- POST `/api/v1/analysis/documents/:documentId` - 문서 분석
- GET `/api/v1/analysis/documents/:documentId` - 분석 결과 조회

### AI 콘텐츠 API

- POST `/api/v1/content/generate` - 콘텐츠 생성
- POST `/api/v1/content/:contentId/improve` - 콘텐츠 개선
- GET `/api/v1/content/project/:projectId` - 콘텐츠 목록
- POST `/api/v1/content/chat` - AI 채팅

## 문제 해결

### Backend가 시작되지 않을 때

**Prisma 마이그레이션 오류:**

```bash
# Prisma Client 재생성
cd backend
npx prisma generate

# 마이그레이션 상태 확인
npx prisma migrate status

# 강제 마이그레이션 (주의: 데이터 손실 가능)
npx prisma migrate reset
```

**포트 충돌:**

```bash
# 4000번 포트 사용 중인 프로세스 종료
lsof -ti:4000 | xargs kill -9
```

### Frontend가 시작되지 않을 때

**포트 충돌:**

```bash
# 3000번 포트 사용 중인 프로세스 종료
lsof -ti:3000 | xargs kill -9
```

**캐시 정리:**

```bash
cd frontend
rm -rf .next
npm run dev
```

### API 호출 오류

**CORS 에러:**

- Backend `.env`의 `CORS_ORIGIN`이 `http://localhost:3000`인지 확인

**401 Unauthorized:**

- 로그인 후 받은 accessToken이 올바른지 확인
- Token이 만료되었다면 refresh API 사용

**500 Internal Server Error:**

- Backend 콘솔에서 에러 로그 확인
- DATABASE_URL이 올바른지 확인

## 다음 단계

테스트가 성공적으로 완료되면:

1. Frontend AI 기능 UI 구현
2. 문서 편집기 구현
3. 실시간 협업 기능 추가
4. 프로덕션 배포 준비
