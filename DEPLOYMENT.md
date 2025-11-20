# APAS CentOS 7 배포 가이드

## 목차

- [시스템 요구사항](#시스템-요구사항)
- [사전 준비](#사전-준비)
- [설치 단계](#설치-단계)
- [환경 설정](#환경-설정)
- [서비스 실행](#서비스-실행)
- [프로세스 관리](#프로세스-관리)
- [트러블슈팅](#트러블슈팅)

---

## 시스템 요구사항

### 최소 사양

- **OS**: CentOS 7.x
- **CPU**: 2 Core 이상
- **RAM**: 4GB 이상 (권장 8GB)
- **Disk**: 20GB 이상
- **Network**: 인터넷 연결 필수

### 필수 소프트웨어

- Node.js 20.x LTS
- PostgreSQL 15.x (또는 Supabase 사용)
- Git
- Nginx (프록시 서버)
- PM2 (프로세스 관리)

---

## 사전 준비

### 1. 시스템 업데이트

```bash
sudo yum update -y
sudo yum install -y epel-release
sudo yum install -y git wget curl vim
```

### 2. Node.js 20.x 설치

```bash
# NodeSource 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js 설치
sudo yum install -y nodejs

# 버전 확인
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 3. PostgreSQL 15.x 설치 (선택 사항)

#### Supabase 사용 시

- Supabase 클라우드를 사용하는 경우 이 단계를 건너뛰세요.

#### 로컬 PostgreSQL 설치 시

```bash
# PostgreSQL 15 저장소 추가
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# PostgreSQL 15 설치
sudo yum install -y postgresql15-server postgresql15-contrib

# 초기화
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# 서비스 시작 및 자동 시작 설정
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# 데이터베이스 생성
sudo -u postgres psql
CREATE DATABASE apas;
CREATE USER apas_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE apas TO apas_user;
\q
```

### 4. PM2 설치 (프로세스 관리)

```bash
sudo npm install -g pm2

# 시스템 부팅 시 자동 시작 설정
pm2 startup
# 출력된 명령어 실행
```

### 5. Nginx 설치 (리버스 프록시)

```bash
sudo yum install -y nginx

# 서비스 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx

# 방화벽 설정
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 설치 단계

### 1. 프로젝트 클론

```bash
# 작업 디렉토리 생성
sudo mkdir -p /var/www
cd /var/www

# 저장소 클론
sudo git clone https://github.com/axconkr/Water_AI_Report_Gen.git apas
cd apas

# 소유권 변경
sudo chown -R $USER:$USER /var/www/apas
```

### 2. 의존성 설치

#### Backend

```bash
cd /var/www/apas/backend
npm install

# Prisma 클라이언트 생성
npx prisma generate
```

#### Frontend

```bash
cd /var/www/apas/frontend
npm install
```

---

## 환경 설정

### 1. Backend 환경 변수 설정

```bash
cd /var/www/apas/backend
cp .env.example .env
vim .env
```

`.env` 파일 내용:

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_key_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_strong_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here
CLAUDE_API_KEY=your-anthropic-api-key-here
OPENCHAT_API_KEY=your-openai-api-key-here

# CORS
CORS_ORIGIN=http://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx
```

### 2. Frontend 환경 변수 설정

```bash
cd /var/www/apas/frontend
cp .env.local.example .env.local
vim .env.local
```

`.env.local` 파일 내용:

```env
NEXT_PUBLIC_API_URL=http://your-domain.com/api/v1
```

### 3. 데이터베이스 마이그레이션

```bash
cd /var/www/apas/backend
npx prisma migrate deploy
```

### 4. Backend 빌드

```bash
cd /var/www/apas/backend
npm run build
```

### 5. Frontend 빌드

```bash
cd /var/www/apas/frontend
npm run build
```

---

## 서비스 실행

### PM2를 사용한 프로세스 관리

#### 1. PM2 Ecosystem 파일 생성

```bash
cd /var/www/apas
vim ecosystem.config.js
```

`ecosystem.config.js` 내용:

```javascript
module.exports = {
  apps: [
    {
      name: 'apas-backend',
      cwd: '/var/www/apas/backend',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/www/apas/logs/backend-error.log',
      out_file: '/var/www/apas/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'apas-frontend',
      cwd: '/var/www/apas/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/apas/logs/frontend-error.log',
      out_file: '/var/www/apas/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
}
```

#### 2. 로그 디렉토리 생성

```bash
mkdir -p /var/www/apas/logs
```

#### 3. PM2로 서비스 시작

```bash
cd /var/www/apas
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 설정 저장 (재부팅 시 자동 시작)
pm2 save
```

### Nginx 설정

#### 1. Nginx 설정 파일 생성

```bash
sudo vim /etc/nginx/conf.d/apas.conf
```

`apas.conf` 내용:

```nginx
# Backend API 업스트림
upstream backend {
    server 127.0.0.1:4000;
    keepalive 64;
}

# Frontend 업스트림
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 설정
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    # Static files
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 로그 설정
    access_log /var/log/nginx/apas-access.log;
    error_log /var/log/nginx/apas-error.log;
}
```

#### 2. Nginx 설정 테스트 및 재시작

```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx
```

---

## 프로세스 관리

### PM2 명령어

#### 서비스 제어

```bash
# 시작
pm2 start ecosystem.config.js

# 중지
pm2 stop all
pm2 stop apas-backend
pm2 stop apas-frontend

# 재시작
pm2 restart all
pm2 restart apas-backend
pm2 restart apas-frontend

# 삭제
pm2 delete all
pm2 delete apas-backend
```

#### 모니터링

```bash
# 상태 확인
pm2 status

# 실시간 로그
pm2 logs

# 특정 앱 로그
pm2 logs apas-backend
pm2 logs apas-frontend

# 모니터링 대시보드
pm2 monit
```

#### 업데이트 배포

```bash
# 1. 최신 코드 가져오기
cd /var/www/apas
git pull origin main

# 2. Backend 업데이트
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# 3. Frontend 업데이트
cd ../frontend
npm install
npm run build

# 4. 서비스 재시작 (무중단)
pm2 reload ecosystem.config.js
```

---

## 트러블슈팅

### 1. 포트가 이미 사용 중

```bash
# 포트 사용 확인
sudo lsof -i :3000
sudo lsof -i :4000

# 프로세스 종료
sudo kill -9 <PID>
```

### 2. 데이터베이스 연결 실패

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql-15

# 연결 테스트
psql -h localhost -U apas_user -d apas

# 로그 확인
sudo tail -f /var/lib/pgsql/15/data/log/postgresql-*.log
```

### 3. Nginx 오류

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 설정 테스트
sudo nginx -t

# 로그 확인
sudo tail -f /var/log/nginx/apas-error.log
```

### 4. PM2 프로세스 오류

```bash
# 로그 확인
pm2 logs --err

# 프로세스 상세 정보
pm2 info apas-backend

# 메모리 사용량 확인
pm2 monit

# 프로세스 재시작
pm2 restart all
```

### 5. 방화벽 설정

```bash
# 방화벽 상태 확인
sudo firewall-cmd --state

# 열린 포트 확인
sudo firewall-cmd --list-all

# HTTP/HTTPS 포트 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 6. SELinux 문제

```bash
# SELinux 상태 확인
getenforce

# 일시적 비활성화 (권장하지 않음)
sudo setenforce 0

# 영구 비활성화 (필요 시)
sudo vim /etc/selinux/config
# SELINUX=disabled로 변경 후 재부팅
```

---

## 보안 권장사항

### 1. 방화벽 설정

```bash
# 필요한 포트만 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 2. SSL/TLS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo yum install -y certbot python2-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 3. 파일 권한 설정

```bash
# 프로젝트 파일 권한
chmod 755 /var/www/apas
chmod 644 /var/www/apas/backend/.env
chmod 644 /var/www/apas/frontend/.env.local

# uploads 디렉토리
mkdir -p /var/www/apas/backend/uploads
chmod 775 /var/www/apas/backend/uploads
```

### 4. 정기 백업

```bash
# 데이터베이스 백업 스크립트
vim /var/www/apas/scripts/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/apas"
mkdir -p $BACKUP_DIR

# PostgreSQL 백업
pg_dump -U apas_user apas > $BACKUP_DIR/apas_$DATE.sql

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "apas_*.sql" -mtime +7 -delete
```

```bash
# 실행 권한 부여
chmod +x /var/www/apas/scripts/backup-db.sh

# Cron 작업 추가 (매일 새벽 2시)
crontab -e
0 2 * * * /var/www/apas/scripts/backup-db.sh
```

---

## 모니터링

### 1. 시스템 리소스 모니터링

```bash
# CPU/메모리 사용량
top
htop

# 디스크 사용량
df -h

# PM2 모니터링
pm2 monit
```

### 2. 로그 모니터링

```bash
# PM2 로그
pm2 logs

# Nginx 로그
sudo tail -f /var/log/nginx/apas-access.log
sudo tail -f /var/log/nginx/apas-error.log

# 시스템 로그
sudo journalctl -u nginx -f
```

---

## 추가 리소스

- [Node.js 공식 문서](https://nodejs.org/docs/)
- [PM2 문서](https://pm2.keymetrics.io/docs/)
- [Nginx 문서](https://nginx.org/en/docs/)
- [Prisma 문서](https://www.prisma.io/docs/)
- [CentOS 7 문서](https://docs.centos.org/en-US/docs/)

---

## 문의

문제가 발생하면 GitHub Issues에 등록해주세요:
https://github.com/axconkr/Water_AI_Report_Gen/issues
