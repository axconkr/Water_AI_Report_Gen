# Vercel 배포 가이드

## 📊 현재 프로젝트 구조 분석

### 아키텍처

```
Water_AI_Report_Gen/
├── frontend/          # Next.js 14 (Vercel 최적화)
├── backend/           # Express.js + TypeScript (Node.js 서버)
└── package.json       # Monorepo root
```

### 배포 가능성 평가

| 컴포넌트     | Vercel 배포    | 권장 호스팅           | 이유                                          |
| ------------ | -------------- | --------------------- | --------------------------------------------- |
| **Frontend** | ✅ 가능 (최적) | Vercel                | Next.js 네이티브 지원                         |
| **Backend**  | ⚠️ 제한적      | Railway/Render/Fly.io | Express.js는 Serverless Functions로 전환 필요 |
| **Database** | ❌ 불가능      | Supabase (설계대로)   | 이미 Supabase 사용 중                         |

---

## 🚀 배포 전략

### 전략 1: Vercel (Frontend) + Railway (Backend) - 권장

**장점**:

- Frontend: Vercel의 최적화된 Next.js 배포
- Backend: Express.js 그대로 사용 가능
- 최소한의 코드 변경

**구성**:

```
Frontend (Vercel) ─── HTTPS ────→ Backend (Railway) ─── DB ────→ Supabase
                                       ↓
                                   File Storage
                                       ↓
                                   Supabase Storage
```

---

### 전략 2: Vercel 풀스택 배포 (고급)

**Backend를 Vercel Serverless Functions로 전환**

**장점**:

- 단일 플랫폼 관리
- 자동 스케일링
- 비용 효율적 (사용량 기반)

**단점**:

- Express.js 코드 대규모 리팩토링 필요
- Serverless 실행 시간 제한 (10초)
- 파일 업로드 크기 제한 (4.5MB body)

---

## 📋 전략 1 구현: Vercel + Railway

### Step 1: Frontend Vercel 배포

#### 1.1 Vercel 설정 파일 생성

**`vercel.json`** (프로젝트 루트):

```json
{
  "version": 2,
  "buildCommand": "npm run build --workspace=frontend",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev:frontend",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

#### 1.2 Frontend 환경 변수 설정

**`.env.example`** (frontend/):

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 1.3 Git 설정

**`.gitignore` 확인**:

```bash
# 이미 올바르게 설정되어 있음
.env
.env*.local
.env.production
node_modules/
.next/
dist/
```

#### 1.4 GitHub에 푸시

```bash
# Git 초기화 (아직 안했다면)
git init

# 원격 저장소 추가
git remote add origin https://github.com/yourusername/water-ai-report-gen.git

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit: APAS project setup"

# GitHub에 푸시
git branch -M main
git push -u origin main
```

#### 1.5 Vercel 배포

**방법 A: Vercel CLI (권장)**

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

**방법 B: Vercel 웹 대시보드**

1. https://vercel.com 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. 빌드 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (monorepo root)
   - **Build Command**: `npm run build --workspace=frontend`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `npm install`
5. 환경 변수 추가:
   - `NEXT_PUBLIC_API_URL`: Backend URL (나중에 Railway URL로 업데이트)
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
6. "Deploy" 클릭

---

### Step 2: Backend Railway 배포

#### 2.1 Railway 설정 파일 생성

**`railway.toml`** (프로젝트 루트):

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build --workspace=backend"

[deploy]
startCommand = "npm run start --workspace=backend"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3001"
```

#### 2.2 Backend에 Health Check 엔드포인트 추가

**`backend/src/index.ts`** 또는 별도 파일:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})
```

#### 2.3 Backend 환경 변수 설정

**`.env.example`** (backend/):

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=documents

# AI Services
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx
```

#### 2.4 Railway 배포

**방법 A: Railway CLI**

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up

# 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your_supabase_db_url
# ... 기타 환경 변수
```

**방법 B: Railway 웹 대시보드**

1. https://railway.app 접속
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. 설정:
   - **Root Directory**: `./`
   - **Build Command**: `npm install && npm run build --workspace=backend`
   - **Start Command**: `npm run start --workspace=backend`
   - **Watch Paths**: `backend/**`
5. 환경 변수 추가 (위 `.env.example` 참조)
6. Deploy

#### 2.5 CORS 설정 업데이트

**`backend/src/config/cors.ts`** (생성 필요):

```typescript
import cors from 'cors'

const allowedOrigins = [
  'http://localhost:3000', // 로컬 개발
  'https://your-frontend.vercel.app', // Vercel 프로덕션
  process.env.CORS_ORIGIN, // 환경 변수
].filter(Boolean)

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

---

### Step 3: Frontend와 Backend 연결

#### 3.1 Vercel 환경 변수 업데이트

Railway 배포 후 얻은 URL로 업데이트:

```bash
# Vercel CLI
vercel env add NEXT_PUBLIC_API_URL production

# 입력: https://your-backend.railway.app
```

또는 Vercel 대시보드에서 업데이트.

#### 3.2 Railway 환경 변수 업데이트

```bash
# Railway CLI
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

#### 3.3 재배포

```bash
# Frontend 재배포 (Vercel)
vercel --prod

# Backend 재배포 (Railway)
railway up
```

---

## 🔧 전략 2 구현: Vercel 풀스택 (선택적)

### Backend를 Vercel Serverless Functions로 전환

#### 구조 변경

```
frontend/
├── pages/
│   └── api/           # Backend API를 여기로 이동
│       ├── auth/
│       ├── documents/
│       └── ...
├── lib/
│   ├── prisma.ts      # Prisma 클라이언트
│   └── services/      # 비즈니스 로직
└── ...
```

#### 제약 사항

1. **실행 시간 제한**:
   - Hobby: 10초
   - Pro: 60초
   - AI 생성(긴 시간 소요)은 Streaming 또는 Queue 필요

2. **Body 크기 제한**:
   - 4.5MB (파일 업로드 제한적)
   - 해결: Supabase Storage 직접 업로드

3. **Cold Start**:
   - 첫 요청 시 지연 발생
   - 해결: Edge Functions 사용

#### 장점

- 단일 저장소, 단일 배포
- 자동 스케일링
- 비용 효율적

#### 단점

- 대규모 리팩토링 필요
- 기능 제약 존재
- 디버깅 복잡

**결론**: 현재는 **전략 1 (Vercel + Railway) 권장**

---

## 📦 배포 체크리스트

### Git 준비

- [ ] `.gitignore` 확인 (`.env`, `node_modules/`, `dist/` 제외)
- [ ] `.env.example` 파일 생성 (모든 필요한 환경 변수 문서화)
- [ ] 민감 정보 제거 확인 (API 키, 비밀번호 등)
- [ ] `README.md` 업데이트
- [ ] GitHub 저장소 생성 및 푸시

### Frontend (Vercel)

- [ ] `vercel.json` 설정
- [ ] 환경 변수 준비 (`NEXT_PUBLIC_API_URL`, Supabase)
- [ ] Build 명령 테스트: `npm run build --workspace=frontend`
- [ ] Vercel 프로젝트 생성
- [ ] 도메인 설정 (선택)
- [ ] 배포 후 동작 확인

### Backend (Railway)

- [ ] `railway.toml` 설정 (선택)
- [ ] Health check 엔드포인트 추가
- [ ] 환경 변수 준비 (DB, Supabase, AI 키, JWT)
- [ ] Build 명령 테스트: `npm run build --workspace=backend`
- [ ] Railway 프로젝트 생성
- [ ] Database 연결 확인 (Supabase)
- [ ] CORS 설정 업데이트
- [ ] 배포 후 API 동작 확인

### Database (Supabase)

- [ ] Supabase 프로젝트 생성
- [ ] Prisma 마이그레이션 실행
- [ ] Storage 버킷 생성
- [ ] Row Level Security (RLS) 정책 설정
- [ ] 환경 변수에 DB URL 추가

### 통합 테스트

- [ ] Frontend → Backend API 호출 확인
- [ ] Backend → Database 연결 확인
- [ ] 파일 업로드 → Supabase Storage 확인
- [ ] AI 서비스 연동 확인
- [ ] 인증 플로우 확인

---

## 🌐 도메인 설정 (선택)

### Vercel 커스텀 도메인

1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가 (예: `apas.yourdomain.com`)
3. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: apas
   Value: cname.vercel-dns.com
   ```

### Railway 커스텀 도메인

1. Railway 대시보드 → Settings → Custom Domain
2. 도메인 추가 (예: `api.yourdomain.com`)
3. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: api
   Value: your-project.railway.app
   ```

---

## 💰 비용 예상

### Vercel

| 플랜  | 가격   | 대역폭   | 빌드 시간  | 권장        |
| ----- | ------ | -------- | ---------- | ----------- |
| Hobby | 무료   | 100GB/월 | 100시간/월 | 개발/테스트 |
| Pro   | $20/월 | 1TB/월   | 400시간/월 | 프로덕션    |

### Railway

| 플랜      | 가격            | 리소스    | 권장     |
| --------- | --------------- | --------- | -------- |
| Trial     | $5 크레딧       | 512MB RAM | 테스트   |
| Developer | $5/월 + 사용량  | 8GB RAM   | 개발     |
| Team      | $20/월 + 사용량 | 32GB RAM  | 프로덕션 |

**예상 월 비용 (소규모)**:

- Vercel Hobby: 무료
- Railway Developer: ~$10-15
- Supabase Free: 무료 (500MB DB)
- **총: ~$10-15/월**

---

## 🔐 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프로덕션 환경 변수 설정 (Vercel/Railway)
- [ ] JWT Secret 강력하게 설정 (32자 이상)
- [ ] CORS Origin 정확히 설정
- [ ] API Rate Limiting 설정
- [ ] Supabase RLS 정책 활성화
- [ ] HTTPS 강제 (Vercel/Railway 기본 제공)
- [ ] 민감한 에러 메시지 숨김

---

## 📝 배포 후 모니터링

### Vercel Analytics

```bash
# @vercel/analytics 설치
npm install @vercel/analytics --workspace=frontend
```

**`frontend/src/app/layout.tsx`**:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Railway Logs

```bash
# CLI로 로그 확인
railway logs

# 또는 대시보드에서 실시간 로그 확인
```

---

## 🚨 문제 해결

### Frontend 빌드 실패

**증상**: Vercel 빌드 에러

**해결**:

```bash
# 로컬에서 빌드 테스트
npm run build --workspace=frontend

# 타입 에러 확인
npm run type-check --workspace=frontend
```

### Backend API 연결 실패

**증상**: CORS 에러

**해결**:

1. Railway 환경 변수에 `CORS_ORIGIN` 설정 확인
2. Vercel URL이 정확한지 확인
3. Backend CORS 설정 코드 확인

### Database 연결 실패

**증상**: Prisma 클라이언트 에러

**해결**:

```bash
# Prisma 클라이언트 재생성
npm run prisma:generate --workspace=backend

# DATABASE_URL 환경 변수 확인
railway variables get DATABASE_URL
```

---

## 📚 추가 참고 자료

- [Vercel Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [Railway Node.js 배포 가이드](https://docs.railway.app/guides/nodejs)
- [Supabase 프로덕션 가이드](https://supabase.com/docs/guides/platform/going-into-prod)
- [Prisma 프로덕션 Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**마지막 업데이트**: 2025-01-21

**권장 배포 전략**: Vercel (Frontend) + Railway (Backend) + Supabase (Database)
