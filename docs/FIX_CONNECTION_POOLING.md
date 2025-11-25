# Supabase Connection Pooling 오류 해결

## 오류 메시지

```
Error: Schema engine error:
FATAL: Tenant or user not found
```

## 원인

Connection Pooling URL 형식이 잘못되었습니다. Supabase Pooling에는 두 가지 모드가 있습니다:

1. **Transaction Mode** - 대부분의 작업용 (Prisma 지원 ✅)
2. **Session Mode** - 특정 작업용 (Prisma 마이그레이션 필요 ✅)

## 해결 방법

### 1단계: Supabase Dashboard에서 올바른 연결 문자열 확인

**Settings → Database → Connection string** 섹션에서:

#### Session Mode (Prisma에 필요)

```
Host: aws-0-ap-northeast-2.pooler.supabase.com
Database: postgres
Port: 5432 (Session Mode)
User: postgres.udwsgljlxruvzmofirut
```

**연결 문자열:**

```
postgresql://postgres.udwsgljlxruvzmofirut:%40%21Chaos0804@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**주요 포인트:**

- ✅ 포트: **5432** (Session Mode)
- ✅ User: `postgres.프로젝트REF` 형식
- ✅ Host: `pooler.supabase.com`

### 2단계: Transaction Mode 추가 파라미터

Prisma는 **pgbouncer=true** 파라미터가 필요합니다:

```bash
# Session Mode + pgbouncer 파라미터
DATABASE_URL="postgresql://postgres.udwsgljlxruvzmofirut:%40%21Chaos0804@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

### 3단계: Direct Connection도 필요 (마이그레이션용)

Prisma 마이그레이션은 **Direct Connection**이 필요합니다:

```bash
# Direct Connection (마이그레이션용)
DIRECT_URL="postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres"

# Pooling Connection (애플리케이션용)
DATABASE_URL="postgresql://postgres.udwsgljlxruvzmofirut:%40%21Chaos0804@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

## 권장 설정 (최종)

### schema.prisma 수정 필요

`backend/prisma/schema.prisma` 파일 수정:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // 추가!
}
```

### .env.production 최종 설정

```bash
# Direct Connection (마이그레이션용) - 필수!
DIRECT_URL=postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres

# Pooling Connection (애플리케이션 런타임용)
DATABASE_URL=postgresql://postgres.udwsgljlxruvzmofirut:%40%21Chaos0804@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

## 또는 간단하게: Direct Connection만 사용 (권장 - 당장 해결)

Connection Pooling 설정이 복잡하므로, 우선 **Direct Connection**만 사용:

```bash
# Direct Connection (가장 간단)
DATABASE_URL=postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres
```

**장점:**

- 설정이 간단함
- 마이그레이션과 애플리케이션 모두 작동
- 개발/테스트 환경에 충분

**단점:**

- 동시 연결 수 제한 (Free plan: ~3개)
- 프로덕션에서는 Pooling 권장

## 즉시 실행 (Direct Connection 사용)

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# .env.production 수정
vi .env.production

# DATABASE_URL을 Direct Connection으로 변경:
# DATABASE_URL=postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres

# 저장 후 복사
cp .env.production .env

# Docker 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 최종 체크

성공하면 다음과 같은 로그가 보입니다:

```
apas-application  | 🚀 Starting APAS Application...
apas-application  | 📊 Running database migrations...
apas-application  | Prisma schema loaded from prisma/schema.prisma
apas-application  | Datasource "db": PostgreSQL database "postgres" at "db.udwsgljlxruvzmofirut.supabase.co:5432"
apas-application  |
apas-application  | ✅ Migrations applied successfully
apas-application  | 🚀 Backend server started on port 4000
apas-application  | 🚀 Frontend server started on port 3000
```

## 요약

**즉시 해결책 (가장 간단):**

```bash
# .env.production의 DATABASE_URL을 다음으로 변경:
DATABASE_URL=postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres
```

Connection Pooling은 나중에 프로덕션 최적화 시 설정하세요!
