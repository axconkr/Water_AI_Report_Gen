# Supabase 설정 가이드

이 문서는 APAS 프로젝트를 위한 Supabase 설정 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

### 1.1 회원가입 및 로그인

1. [https://supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성

1. Dashboard에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Project name**: `apas-production` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자 대상)
   - **Pricing Plan**: Free tier 선택 (MVP 단계)

3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 1-2분 대기

## 2. 데이터베이스 설정

### 2.1 연결 정보 확인

1. Dashboard → Settings → Database
2. **Connection string** 복사:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres
   ```

### 2.2 환경 변수 설정

**Backend `.env` 파일**:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_KEY=[YOUR-SUPABASE-SERVICE-ROLE-KEY]
```

**Frontend `.env.local` 파일**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
```

### 2.3 API Keys 확인

1. Dashboard → Settings → API
2. 다음 키들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (⚠️ 절대 프론트엔드에 노출하지 말 것): `SUPABASE_KEY`

## 3. Prisma 마이그레이션 실행

### 3.1 Prisma 초기화

```bash
cd backend
npx prisma generate
```

### 3.2 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

이 명령어는:

- Prisma schema를 기반으로 SQL 마이그레이션 파일 생성
- Supabase PostgreSQL에 테이블 생성
- Prisma Client 재생성

### 3.3 마이그레이션 확인

```bash
npx prisma studio
```

브라우저에서 [http://localhost:5555](http://localhost:5555) 열어 데이터베이스 확인

## 4. Supabase Storage 설정

### 4.1 Bucket 생성

1. Dashboard → Storage
2. "Create a new bucket" 클릭
3. Bucket 정보 입력:
   - **Name**: `documents`
   - **Public bucket**: ❌ (비공개)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 4.2 Storage Policies 설정

**업로드 정책** (Authenticated users can upload):

```sql
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**다운로드 정책** (Users can download their own documents):

```sql
CREATE POLICY "Users can download their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**삭제 정책** (Users can delete their own documents):

```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 5. Row Level Security (RLS) 설정

### 5.1 Users 테이블

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);
```

### 5.2 Projects 테이블

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own projects"
ON projects FOR ALL
TO authenticated
USING (auth.uid()::text = user_id);
```

### 5.3 Documents 테이블

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own documents"
ON documents FOR ALL
TO authenticated
USING (auth.uid()::text = user_id);
```

### 5.4 기타 테이블

`document_analyses`, `table_of_contents`, `sections`, `generated_contents`, `conversations`, `messages`, `export_requests`, `project_history` 테이블에도 동일한 RLS 적용

## 6. 인증 설정

### 6.1 Email Provider 설정

1. Dashboard → Authentication → Providers
2. **Email** provider 활성화
3. 설정:
   - ✅ Enable email provider
   - ✅ Confirm email
   - ✅ Secure email change

### 6.2 Google OAuth (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials
4. "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs 추가:
   ```
   https://[PROJECT-ID].supabase.co/auth/v1/callback
   ```
7. Client ID와 Client Secret 복사
8. Supabase Dashboard → Authentication → Providers → Google
   - Client ID 입력
   - Client Secret 입력
   - ✅ Enable Google provider

### 6.3 JWT Secret 설정

1. Dashboard → Settings → API
2. **JWT Settings** 섹션에서 `JWT Secret` 확인
3. Backend `.env`에 추가:
   ```env
   JWT_SECRET=[SUPABASE-JWT-SECRET]
   ```

## 7. 테스트

### 7.1 데이터베이스 연결 테스트

```bash
cd backend
npm run dev
```

서버 로그에서 "🚀 Server is running" 확인

### 7.2 Prisma Studio로 데이터 확인

```bash
npm run prisma:studio
```

### 7.3 Frontend에서 Supabase 연결 테스트

```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 8. 프로덕션 배포 시 고려사항

### 8.1 환경 분리

- **Development**: 별도 Supabase 프로젝트 사용
- **Staging**: 프로덕션과 동일한 설정의 테스트 환경
- **Production**: 실제 사용자 데이터

### 8.2 백업 설정

1. Dashboard → Database → Backups
2. 자동 백업 활성화 (Free tier: 7일 보관)

### 8.3 모니터링

1. Dashboard → Logs
2. 에러 로그 정기 확인
3. 쿼리 성능 모니터링

### 8.4 보안 체크리스트

- [ ] RLS 정책 모든 테이블에 적용
- [ ] Service Role Key는 절대 프론트엔드에 노출하지 않음
- [ ] CORS 설정 확인 (허용된 도메인만)
- [ ] Rate limiting 설정
- [ ] API Keys 주기적 갱신

## 9. 문제 해결

### 9.1 연결 오류

- DATABASE_URL 형식 확인
- 비밀번호에 특수문자가 있으면 URL 인코딩 필요
- 방화벽 설정 확인

### 9.2 마이그레이션 실패

```bash
# 마이그레이션 리셋
npx prisma migrate reset

# 다시 마이그레이션
npx prisma migrate dev
```

### 9.3 RLS 정책 오류

- Supabase Dashboard → Database → Policies에서 정책 확인
- SQL Editor에서 직접 정책 수정 가능

## 10. 유용한 명령어

```bash
# Prisma Client 재생성
npx prisma generate

# 마이그레이션 상태 확인
npx prisma migrate status

# 데이터베이스 스키마 확인
npx prisma db pull

# Seed 데이터 추가 (선택)
npx prisma db seed
```

## 참고 링크

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/with-nextjs)
