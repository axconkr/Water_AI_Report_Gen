# CentOS 7 Docker 배포 가이드

CentOS 7에서 Docker를 사용하여 APAS 시스템을 배포하고, 업로드 파일을 호스트 디렉토리에 저장하는 완전한 가이드입니다.

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [Docker 설치](#docker-설치)
3. [디렉토리 구조 설정](#디렉토리-구조-설정)
4. [Docker Compose 설정](#docker-compose-설정)
5. [환경 변수 설정](#환경-변수-설정)
6. [배포 실행](#배포-실행)
7. [파일 저장 관리](#파일-저장-관리)
8. [운영 관리](#운영-관리)

---

## 시스템 요구사항

### 최소 사양

- **OS**: CentOS 7.x
- **CPU**: 2 Core 이상
- **RAM**: 4GB 이상 (권장 8GB)
- **Disk**: 20GB 이상 여유 공간
- **Network**: 인터넷 연결 필요

### 필요한 포트

- **3000**: Frontend (Next.js)
- **3001**: Backend API (Express.js)
- **5432**: PostgreSQL (선택 - Supabase 사용 시 불필요)

---

## Docker 설치

### 자동 설치 (권장)

```bash
cd /path/to/Water_AI_Report_Gen
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh
```

### 설치 확인

```bash
docker --version
docker-compose --version
sudo systemctl status docker
```

---

## 디렉토리 구조 설정

### 1. 데이터 디렉토리 생성

```bash
# 애플리케이션 루트 디렉토리
sudo mkdir -p /opt/apas

# 업로드 파일 저장 디렉토리
sudo mkdir -p /opt/apas/data/uploads

# 로그 디렉토리
sudo mkdir -p /opt/apas/logs

# 백업 디렉토리
sudo mkdir -p /opt/apas/backups

# PostgreSQL 데이터 디렉토리 (로컬 DB 사용 시)
sudo mkdir -p /opt/apas/data/postgres

# 권한 설정 (Docker 컨테이너에서 접근 가능하도록)
sudo chown -R 1000:1000 /opt/apas/data
sudo chmod -R 755 /opt/apas/data
```

### 2. 최종 디렉토리 구조

```
/opt/apas/
├── data/
│   ├── uploads/          # 업로드된 파일 (PDF, DOCX)
│   │   ├── documents/    # 원본 문서
│   │   ├── generated/    # 생성된 문서
│   │   └── temp/         # 임시 파일
│   └── postgres/         # PostgreSQL 데이터 (로컬 DB 사용 시)
├── logs/                 # 애플리케이션 로그
│   ├── frontend/
│   └── backend/
└── backups/              # 백업 파일
```

---

## Docker Compose 설정

### 1. `docker-compose.yml` 생성

프로젝트 루트에 다음 파일을 생성합니다:

**`docker-compose.yml`**:

```yaml
version: '3.8'

services:
  # Frontend Service (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    container_name: apas-frontend
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend
    networks:
      - apas-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Backend Service (Express.js)
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    container_name: apas-backend
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - SUPABASE_STORAGE_BUCKET=${SUPABASE_STORAGE_BUCKET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - UPLOAD_DIR=/app/uploads
    volumes:
      # 호스트 디렉토리를 컨테이너에 마운트
      - /opt/apas/data/uploads:/app/uploads
      - /opt/apas/logs/backend:/app/logs
    networks:
      - apas-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL (선택 - Supabase 대신 로컬 DB 사용 시)
  # postgres:
  #   image: postgres:15-alpine
  #   container_name: apas-postgres
  #   restart: unless-stopped
  #   ports:
  #     - "5432:5432"
  #   environment:
  #     - POSTGRES_USER=${POSTGRES_USER:-apas}
  #     - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  #     - POSTGRES_DB=${POSTGRES_DB:-apas_db}
  #   volumes:
  #     - /opt/apas/data/postgres:/var/lib/postgresql/data
  #   networks:
  #     - apas-network
  #   healthcheck:
  #     test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-apas}"]
  #     interval: 10s
  #     timeout: 5s
  #     retries: 5

  # Redis (캐싱 - 선택)
  # redis:
  #   image: redis:7-alpine
  #   container_name: apas-redis
  #   restart: unless-stopped
  #   ports:
  #     - "6379:6379"
  #   volumes:
  #     - /opt/apas/data/redis:/data
  #   networks:
  #     - apas-network
  #   healthcheck:
  #     test: ["CMD", "redis-cli", "ping"]
  #     interval: 10s
  #     timeout: 3s
  #     retries: 5

  # Nginx (리버스 프록시 - 선택)
  # nginx:
  #   image: nginx:alpine
  #   container_name: apas-nginx
  #   restart: unless-stopped
  #   ports:
  #     - "80:80"
  #     - "443:443"
  #   volumes:
  #     - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
  #     - /opt/apas/logs/nginx:/var/log/nginx
  #   depends_on:
  #     - frontend
  #     - backend
  #   networks:
  #     - apas-network

networks:
  apas-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

---

## Dockerfile 생성

### 1. Frontend Dockerfile

**`docker/Dockerfile.frontend`**:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --workspace=frontend --legacy-peer-deps

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY frontend ./frontend
COPY package*.json ./

# Build arguments (환경 변수)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Next.js
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Backend Dockerfile

**`docker/Dockerfile.backend`**:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install build tools (for native dependencies)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma

# Install dependencies
RUN npm ci --workspace=backend --legacy-peer-deps

# Generate Prisma Client
WORKDIR /app/backend
RUN npx prisma generate

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY backend ./backend
COPY package*.json ./

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./

# Create upload directory
RUN mkdir -p /app/uploads /app/logs
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### 3. `.dockerignore` 파일 생성

**`frontend/.dockerignore`**:

```
node_modules
.next
.git
.gitignore
.env*.local
.env.production
*.log
npm-debug.log*
.DS_Store
coverage
.vscode
.idea
```

**`backend/.dockerignore`**:

```
node_modules
dist
.git
.gitignore
.env*.local
.env.production
*.log
npm-debug.log*
.DS_Store
coverage
.vscode
.idea
uploads
logs
```

---

## 환경 변수 설정

### 1. `.env.production` 파일 생성

프로젝트 루트에 생성:

**`.env.production`**:

```bash
# ========================================
# APAS Production Environment Variables
# ========================================

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=documents

# AI Services
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT Authentication
JWT_SECRET=your_very_strong_jwt_secret_min_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx
UPLOAD_DIR=/app/uploads

# PostgreSQL (로컬 DB 사용 시만)
# POSTGRES_USER=apas
# POSTGRES_PASSWORD=your_postgres_password
# POSTGRES_DB=apas_db
```

### 2. 보안 설정

```bash
# 환경 변수 파일 권한 설정
chmod 600 .env.production

# Git에서 제외 확인
echo ".env.production" >> .gitignore
```

---

## 배포 실행

### 1. 전체 배포 스크립트 생성

**`scripts/deploy-centos7.sh`**:

```bash
#!/bin/bash
set -e

echo "========================================="
echo "APAS CentOS 7 Docker 배포 스크립트"
echo "========================================="

# 1. 환경 확인
echo "➡️  환경 확인 중..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   ./scripts/install-docker-centos7.sh 를 먼저 실행하세요."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# 2. 디렉토리 생성
echo "➡️  데이터 디렉토리 생성 중..."
sudo mkdir -p /opt/apas/data/uploads/{documents,generated,temp}
sudo mkdir -p /opt/apas/logs/{frontend,backend}
sudo mkdir -p /opt/apas/backups
sudo chown -R 1000:1000 /opt/apas/data
sudo chmod -R 755 /opt/apas/data

# 3. 환경 변수 확인
echo "➡️  환경 변수 확인 중..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다."
    echo "   .env.production 파일을 생성하세요."
    exit 1
fi

# 4. 기존 컨테이너 중지 및 제거
echo "➡️  기존 컨테이너 중지 중..."
docker-compose down || true

# 5. Docker 이미지 빌드
echo "➡️  Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 6. 컨테이너 시작
echo "➡️  컨테이너 시작 중..."
docker-compose --env-file .env.production up -d

# 7. 상태 확인
echo "➡️  컨테이너 상태 확인 중..."
sleep 5
docker-compose ps

# 8. Health Check
echo "➡️  Health Check 실행 중..."
sleep 10

# Backend Health Check
if curl -f http://localhost:3001/health &> /dev/null; then
    echo "✅ Backend: 정상"
else
    echo "❌ Backend: 비정상"
    docker-compose logs backend
fi

# Frontend Health Check
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend: 정상"
else
    echo "❌ Frontend: 비정상"
    docker-compose logs frontend
fi

echo ""
echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo ""
echo "📌 접속 정보:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend API: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "📌 로그 확인:"
echo "   전체: docker-compose logs -f"
echo "   Backend: docker-compose logs -f backend"
echo "   Frontend: docker-compose logs -f frontend"
echo ""
echo "📌 업로드 파일 위치:"
echo "   /opt/apas/data/uploads/"
echo ""
echo "📌 컨테이너 관리:"
echo "   중지: docker-compose stop"
echo "   시작: docker-compose start"
echo "   재시작: docker-compose restart"
echo "   삭제: docker-compose down"
echo ""
```

### 2. 배포 실행

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/deploy-centos7.sh

# 배포 실행
./scripts/deploy-centos7.sh
```

---

## 파일 저장 관리

### 1. 업로드 디렉토리 구조

```
/opt/apas/data/uploads/
├── documents/          # 원본 문서 (사용자 업로드)
│   ├── announcement/   # 공고문
│   ├── specification/  # 과업지시서
│   └── contract/       # 계약서
├── generated/          # AI 생성 문서
│   ├── drafts/        # 초안
│   └── final/         # 최종본
└── temp/              # 임시 파일 (24시간 후 자동 삭제)
```

### 2. Backend에서 파일 저장 설정

**`backend/src/config/upload.ts`** (생성 필요):

```typescript
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 업로드 디렉토리 설정
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || './uploads'

// 디렉토리 생성
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 파일 저장 위치 및 이름 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentType = req.body.type || 'documents'
    const uploadPath = path.join(UPLOAD_BASE_DIR, documentType)

    ensureDirectoryExists(uploadPath)
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // 파일명: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)
    cb(null, `${basename}_${uniqueSuffix}${ext}`)
  },
})

// 파일 필터 (PDF, DOCX만 허용)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'docx']
  const ext = path.extname(file.originalname).toLowerCase().substring(1)

  if (allowedTypes.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`허용되지 않는 파일 형식입니다. (허용: ${allowedTypes.join(', ')})`))
  }
}

// Multer 설정
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    files: 3, // 최대 3개 파일
  },
})

// 파일 삭제 유틸리티
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

// 임시 파일 정리 (24시간 이상 된 파일 삭제)
export const cleanupTempFiles = () => {
  const tempDir = path.join(UPLOAD_BASE_DIR, 'temp')
  const maxAge = 24 * 60 * 60 * 1000 // 24시간

  if (!fs.existsSync(tempDir)) return

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('임시 파일 정리 실패:', err)
      return
    }

    files.forEach((file) => {
      const filePath = path.join(tempDir, file)
      fs.stat(filePath, (err, stats) => {
        if (err) return

        const age = Date.now() - stats.mtimeMs
        if (age > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`파일 삭제 실패 (${file}):`, err)
            else console.log(`임시 파일 삭제: ${file}`)
          })
        }
      })
    })
  })
}
```

### 3. Cron Job 설정 (임시 파일 정리)

**`backend/src/jobs/cleanup.ts`**:

```typescript
import cron from 'node-cron'
import { cleanupTempFiles } from '../config/upload'

// 매일 새벽 3시에 임시 파일 정리
export const setupCleanupJob = () => {
  cron.schedule('0 3 * * *', () => {
    console.log('임시 파일 정리 작업 시작...')
    cleanupTempFiles()
  })

  console.log('✅ 임시 파일 정리 Cron Job 설정 완료 (매일 3:00 AM)')
}
```

### 4. 파일 접근 권한 확인

```bash
# 호스트에서 업로드된 파일 확인
ls -lah /opt/apas/data/uploads/documents/

# Docker 컨테이너에서 파일 확인
docker exec -it apas-backend ls -lah /app/uploads/documents/

# 권한 문제 발생 시
sudo chown -R 1000:1000 /opt/apas/data/uploads
sudo chmod -R 755 /opt/apas/data/uploads
```

---

## 운영 관리

### 1. 컨테이너 관리

```bash
# 전체 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# 컨테이너 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart backend

# 컨테이너 중지
docker-compose stop

# 컨테이너 시작
docker-compose start

# 컨테이너 및 이미지 삭제
docker-compose down
docker-compose down --rmi all  # 이미지도 삭제
```

### 2. 업데이트 배포

```bash
# 1. 코드 업데이트 (Git pull)
git pull origin main

# 2. 재빌드 및 배포
docker-compose down
docker-compose build --no-cache
docker-compose --env-file .env.production up -d

# 또는 배포 스크립트 재실행
./scripts/deploy-centos7.sh
```

### 3. 백업

**자동 백업 스크립트** - **`scripts/backup-centos7.sh`**:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/apas/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="apas_backup_${TIMESTAMP}"

echo "========================================="
echo "APAS 백업 시작"
echo "========================================="

# 1. 업로드 파일 백업
echo "➡️  업로드 파일 백업 중..."
sudo tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" \
    -C /opt/apas/data uploads/

# 2. 데이터베이스 백업 (Supabase 사용 시 생략 가능)
# echo "➡️  데이터베이스 백업 중..."
# docker exec apas-postgres pg_dump -U apas apas_db | \
#     gzip > "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz"

# 3. 환경 변수 백업
echo "➡️  환경 변수 백업 중..."
cp .env.production "${BACKUP_DIR}/${BACKUP_NAME}.env"

# 4. 오래된 백업 삭제 (30일 이상)
echo "➡️  오래된 백업 삭제 중..."
find "${BACKUP_DIR}" -name "apas_backup_*" -mtime +30 -delete

echo ""
echo "✅ 백업 완료: ${BACKUP_NAME}"
echo "   위치: ${BACKUP_DIR}"
ls -lh "${BACKUP_DIR}/${BACKUP_NAME}"*
```

**Cron으로 자동 백업 설정**:

```bash
# Crontab 편집
crontab -e

# 매일 새벽 2시에 백업 실행
0 2 * * * /path/to/Water_AI_Report_Gen/scripts/backup-centos7.sh
```

### 4. 모니터링

**시스템 리소스 모니터링**:

```bash
# Docker 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h /opt/apas

# 업로드 디렉토리 크기
du -sh /opt/apas/data/uploads/*
```

**로그 모니터링**:

```bash
# 실시간 로그 확인
docker-compose logs -f --tail=100

# 에러 로그만 확인
docker-compose logs backend | grep -i error

# 로그 파일 크기 확인
ls -lh /opt/apas/logs/backend/*.log
```

### 5. 방화벽 설정

```bash
# 포트 오픈
sudo firewall-cmd --permanent --add-port=3000/tcp  # Frontend
sudo firewall-cmd --permanent --add-port=3001/tcp  # Backend
sudo firewall-cmd --reload

# 확인
sudo firewall-cmd --list-ports
```

---

## 보안 설정

### 1. SELinux 설정 (필요 시)

```bash
# SELinux 상태 확인
getenforce

# SELinux Permissive 모드 (임시)
sudo setenforce 0

# SELinux Permissive 모드 (영구)
sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
```

### 2. 파일 권한 강화

```bash
# 업로드 디렉토리 권한
sudo chmod 755 /opt/apas/data/uploads
sudo chown -R 1000:1000 /opt/apas/data/uploads

# 환경 변수 파일 권한
chmod 600 .env.production

# 로그 디렉토리 권한
sudo chmod 755 /opt/apas/logs
```

---

## 문제 해결

### 1. 컨테이너 시작 실패

```bash
# 로그 확인
docker-compose logs

# 특정 서비스 로그 확인
docker-compose logs backend

# 컨테이너 재빌드
docker-compose build --no-cache
docker-compose up -d
```

### 2. 파일 업로드 실패

```bash
# 권한 확인
ls -lah /opt/apas/data/uploads/

# 권한 재설정
sudo chown -R 1000:1000 /opt/apas/data/uploads
sudo chmod -R 755 /opt/apas/data/uploads

# 컨테이너 내부 확인
docker exec -it apas-backend ls -lah /app/uploads/
```

### 3. 데이터베이스 연결 실패

```bash
# 환경 변수 확인
docker-compose exec backend printenv | grep DATABASE

# Supabase 연결 테스트
docker-compose exec backend npx prisma db pull --schema=./prisma/schema.prisma
```

### 4. 디스크 공간 부족

```bash
# Docker 정리
docker system prune -a

# 오래된 로그 삭제
find /opt/apas/logs -name "*.log" -mtime +7 -delete

# 임시 파일 삭제
rm -rf /opt/apas/data/uploads/temp/*
```

---

## 성능 최적화

### 1. Docker 리소스 제한

**`docker-compose.yml`에 추가**:

```yaml
services:
  backend:
    # ... 기존 설정 ...
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 로그 로테이션

**`/etc/logrotate.d/apas`**:

```
/opt/apas/logs/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

---

## 운영 체크리스트

### 일일 체크

- [ ] 컨테이너 상태 확인 (`docker-compose ps`)
- [ ] 로그 확인 (에러 없는지)
- [ ] 디스크 사용량 확인
- [ ] 업로드 파일 확인

### 주간 체크

- [ ] 백업 확인
- [ ] 로그 로테이션 확인
- [ ] 시스템 업데이트 확인
- [ ] 성능 모니터링

### 월간 체크

- [ ] 보안 패치 적용
- [ ] 백업 복원 테스트
- [ ] 디스크 정리
- [ ] 사용자 피드백 검토

---

**마지막 업데이트**: 2025-01-21

**권장 배포 방식**: Docker Compose + Volume Mount
