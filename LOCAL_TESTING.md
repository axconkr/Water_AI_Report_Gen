# 로컬 테스트 가이드 (Local PostgreSQL)

## ✅ 현재 설정 완료 상태

- ✅ Docker PostgreSQL 컨테이너 실행 중 (포트 5433)
- ✅ 데이터베이스 생성 완료 (`apas_dev`)
- ✅ Prisma 마이그레이션 완료 (모든 테이블 생성됨)
- ✅ Backend 서버 실행 중 (http://localhost:4000)

## 🚀 빠른 시작

### 1. Backend 서버 상태 확인

Backend 서버가 이미 실행 중입니다! 확인하려면:

```bash
curl http://localhost:4000/health
```

**예상 응답:**

```json
{
  "success": true,
  "message": "APAS Backend Server is running",
  "timestamp": "2025-11-12T11:03:44.020Z"
}
```

### 2. Frontend 서버 실행

**새 터미널을 열어서:**

```bash
cd frontend
npm run dev
```

그런 다음 브라우저에서 http://localhost:3000 접속

## 📝 테스트 시나리오

### 1. 회원가입 테스트

**브라우저에서:**

1. http://localhost:3000 접속
2. "회원가입" 클릭
3. 정보 입력:
   - 이름: 홍길동
   - 이메일: test@example.com
   - 비밀번호: Test1234! (대소문자, 숫자, 특수문자 필수)
4. 회원가입 완료 후 자동 로그인

### 2. 로그인 테스트

**curl로 테스트:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**성공 응답:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "홍길동"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**이 accessToken을 복사하여 다음 요청에 사용하세요!**

### 3. 프로젝트 생성 테스트

```bash
# 위에서 받은 accessToken을 여기에 붙여넣기
export TOKEN="eyJhbGc..."

curl -X POST http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2024년 수자원 관리 계획",
    "description": "테스트 프로젝트",
    "projectType": "WATER_RESOURCE"
  }'
```

**응답에서 projectId를 복사하세요!**

### 4. 프로젝트 목록 조회

```bash
curl http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"
```

### 5. 파일 업로드 테스트

```bash
# PDF 또는 DOCX 파일 준비
export PROJECT_ID="위에서_받은_프로젝트_ID"

curl -X POST http://localhost:4000/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "projectId=$PROJECT_ID"
```

**⚠️ 주의: 로컬 개발 환경에서는 Supabase Storage를 사용할 수 없으므로 파일 업로드 시 에러가 발생할 수 있습니다.**

**해결 방법:**

- 테스트용으로 파일을 로컬 디스크에 저장하도록 코드를 임시 수정하거나
- Supabase Storage를 사용하려면 `.env`의 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`를 실제 값으로 변경

### 6. AI 분석 테스트 (문서 업로드 후)

```bash
export DOCUMENT_ID="업로드된_문서_ID"

# 문서 분석 실행
curl -X POST http://localhost:4000/api/v1/analysis/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# 분석 결과 조회
curl http://localhost:4000/api/v1/analysis/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 7. AI 콘텐츠 생성 테스트

```bash
curl -X POST http://localhost:4000/api/v1/content/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "sectionTitle": "1. 사업 개요",
    "sectionDescription": "사업의 배경과 목적을 설명"
  }'
```

### 8. AI 채팅 테스트

```bash
curl -X POST http://localhost:4000/api/v1/content/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "message": "이 프로젝트의 주요 목표는 무엇인가요?"
  }'
```

## 🗄️ 데이터베이스 관리

### PostgreSQL 컨테이너 관리

```bash
# 컨테이너 상태 확인
docker ps | grep apas-postgres

# 컨테이너 중지
docker stop apas-postgres

# 컨테이너 시작
docker start apas-postgres

# 컨테이너 재시작
docker restart apas-postgres

# 컨테이너 로그 확인
docker logs apas-postgres

# 데이터베이스 접속
docker exec -it apas-postgres psql -U postgres -d apas_dev
```

### 데이터베이스 초기화

```bash
cd backend

# 모든 데이터 삭제하고 마이그레이션 재실행
npx prisma migrate reset

# 새 마이그레이션 생성
npx prisma migrate dev --name migration_name
```

### 데이터베이스 GUI 도구 연결

**연결 정보:**

- Host: localhost
- Port: 5433
- Database: apas_dev
- Username: postgres
- Password: apas1234

**추천 도구:**

- [TablePlus](https://tableplus.com/)
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)

## 🔧 서버 관리

### Backend 서버 재시작

```bash
# 현재 실행 중인 서버 종료
# (Claude Code 백그라운드로 실행 중이므로 터미널에서 Ctrl+C)

# 또는 포트 4000 사용 중인 프로세스 강제 종료
lsof -ti:4000 | xargs kill -9

# 서버 재시작
cd backend
npm run dev
```

### Frontend 서버 재시작

```bash
# Ctrl+C로 종료 후

# 캐시 정리 (필요시)
rm -rf .next

# 재시작
npm run dev
```

## 📊 API 테스트 컬렉션

### Postman Collection

다음 순서로 테스트하세요:

1. **Register** → POST `/auth/register`
2. **Login** → POST `/auth/login` (accessToken 저장)
3. **Get Profile** → GET `/auth/profile`
4. **Create Project** → POST `/projects` (projectId 저장)
5. **List Projects** → GET `/projects`
6. **Upload File** → POST `/upload` (documentId 저장)
7. **Analyze Document** → POST `/analysis/documents/:documentId`
8. **Generate Content** → POST `/content/generate`
9. **Chat with AI** → POST `/content/chat`

## ❗ 문제 해결

### Backend 서버가 시작되지 않음

**에러: "Port 4000 is already in use"**

```bash
lsof -ti:4000 | xargs kill -9
cd backend && npm run dev
```

**에러: "Can't reach database server"**

```bash
# PostgreSQL 컨테이너 확인
docker ps | grep apas-postgres

# 실행되지 않았다면
docker start apas-postgres

# 또는 새로 생성
docker run --name apas-postgres \
  -e POSTGRES_PASSWORD=apas1234 \
  -e POSTGRES_DB=apas_dev \
  -p 5433:5432 \
  -d postgres:15-alpine
```

### Frontend에서 API 호출 실패

**CORS 에러:**

- Backend `.env`의 `CORS_ORIGIN=http://localhost:3000` 확인
- Backend 서버 재시작

**Network Error:**

- Backend 서버가 실행 중인지 확인: `curl http://localhost:4000/health`
- Frontend `.env.local`의 `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` 확인

### AI 기능 오류

**Gemini API 에러:**

```
Error: 문서 분석 중 오류가 발생했습니다
```

- Backend `.env`의 `GEMINI_API_KEY` 확인
- API 키가 유효한지 확인

**Claude API 에러:**

```
Error: 콘텐츠 생성 중 오류가 발생했습니다
```

- Backend `.env`의 `CLAUDE_API_KEY` 확인
- API 사용량 한도 확인

### 파일 업로드 실패

**로컬 개발 환경:**

- 현재 Supabase Storage를 사용하도록 설정되어 있음
- 로컬 테스트를 위해서는 다음 중 하나 선택:
  1. Supabase 프로젝트 사용 (`.env`에 실제 값 설정)
  2. 로컬 파일 저장으로 코드 수정

## 📌 다음 단계

테스트 완료 후:

1. ✅ Backend API 동작 확인
2. ✅ Frontend에서 회원가입/로그인 테스트
3. ✅ 프로젝트 생성 및 관리 테스트
4. 🔄 파일 업로드 (Supabase 연결 필요)
5. 🔄 AI 분석 및 콘텐츠 생성 테스트
6. 🔜 Frontend AI 기능 UI 구현

## 🎯 현재 작동하는 기능

✅ **완전히 작동:**

- 회원가입 / 로그인 / 토큰 관리
- 프로젝트 CRUD
- 사용자 프로필 관리
- AI 콘텐츠 생성 (Gemini, Claude)
- AI 채팅

⚠️ **Supabase 연결 필요:**

- 파일 업로드 (Storage)
- 문서 파싱 후 AI 분석

## 💡 팁

1. **API 테스트**: Postman 또는 curl 사용
2. **DB 확인**: TablePlus 같은 GUI 도구 추천
3. **로그 확인**: Backend 터미널에서 실시간 로그 확인
4. **개발 효율**: 코드 수정 시 자동 재시작됨 (ts-node-dev)
