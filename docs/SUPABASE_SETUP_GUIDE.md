# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. **Supabase 로그인**
   - https://supabase.com 접속
   - 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Organization 선택 또는 생성
   - 프로젝트 정보 입력:
     - **Name**: `APAS Production` (또는 원하는 이름)
     - **Database Password**: 강력한 비밀번호 생성 (저장해두세요!)
     - **Region**: Northeast Asia (Seoul) - 한국에 가장 가까운 리전
     - **Pricing Plan**: Free 또는 Pro 선택

3. **프로젝트 생성 대기**
   - 2-3분 소요됨
   - 생성 완료 후 대시보드로 이동

## 2단계: 데이터베이스 스키마 생성

### SQL Editor 사용 (추천)

1. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭
   - "New query" 버튼 클릭

2. **SQL 스크립트 복사**
   - `backend/prisma/migrations/001_initial_schema.sql` 파일 열기
   - 전체 내용 복사

3. **SQL 실행**
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭 (Ctrl/Cmd + Enter)
   - 성공 메시지 확인

## 3단계: 생성된 테이블 확인

**Table Editor**에서 다음 11개 테이블 확인:

- ✅ users
- ✅ projects
- ✅ documents
- ✅ document_analyses
- ✅ table_of_contents
- ✅ sections
- ✅ generated_contents
- ✅ conversations
- ✅ messages
- ✅ export_requests
- ✅ project_history

## 4단계: Storage 버킷 생성

1. **Storage 메뉴 열기**
   - 왼쪽 메뉴에서 **Storage** 클릭

2. **새 버킷 생성**
   - "New bucket" 버튼 클릭
   - 버킷 정보:
     - **Name**: `documents`
     - **Public bucket**: ❌ 체크 해제
     - **File size limit**: 10 MB
     - **Allowed MIME types**:
       - `application/pdf`
       - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## 5단계: API 키 복사

1. **Settings → API** 메뉴 열기

2. **필요한 정보 복사:**

```bash
# Project URL
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co

# API Keys
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Database 연결 정보:**

**Settings → Database → Connection String → URI**

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 6단계: .env.production 업데이트

CentOS 7 서버에서:

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
vi .env.production
```

복사한 값들로 수정:

```bash
DATABASE_URL=postgresql://postgres:실제비밀번호@db.실제프로젝트REF.supabase.co:5432/postgres
SUPABASE_URL=https://실제프로젝트REF.supabase.co
SUPABASE_ANON_KEY=실제키값...
SUPABASE_SERVICE_ROLE_KEY=실제키값...
SUPABASE_STORAGE_BUCKET=documents
```

## 7단계: Docker 재시작

```bash
# .env 파일 생성
cp .env.production .env

# Docker 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 8단계: 연결 테스트

```bash
# Backend health check
curl http://localhost:8021/api/v1/health

# 외부 접속
curl http://1.236.245.110:8021/api/v1/health
```

## 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 11개 테이블 생성 확인
- [ ] documents 버킷 생성
- [ ] API 키 복사
- [ ] .env.production 업데이트
- [ ] Docker 재시작
- [ ] 연결 테스트 성공

완료! 🎉
