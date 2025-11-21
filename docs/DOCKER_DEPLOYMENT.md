# Docker 배포 가이드 - CentOS 7

APAS (Automated Proposal Authoring System) Docker 기반 프로덕션 배포 가이드

---

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [Supabase 설정](#supabase-설정)
3. [서버 준비](#서버-준비)
4. [Docker 설치](#docker-설치)
5. [애플리케이션 배포](#애플리케이션-배포)
6. [서비스 관리](#서비스-관리)
7. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 시스템 요구사항

- **OS**: CentOS 7.x
- **CPU**: 2코어 이상 (권장 4코어)
- **RAM**: 4GB 이상 (권장 8GB)
- **디스크**: 20GB 이상 여유 공간
- **네트워크**: 인터넷 연결 필수

### 필수 서비스

- Docker 20.10 이상
- Docker Compose 1.29 이상
- Git

### 외부 서비스

- Supabase 프로젝트 (PostgreSQL)
- Google Gemini API 키
- Anthropic Claude API 키 (선택)

---

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. https://app.supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `apas-production`
   - Database Password: 강력한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)` 선택
   - Pricing Plan: `Free` 또는 `Pro`

### 2. 데이터베이스 URL 확인

**Settings → Database → Connection String** 에서 확인:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. API 키 확인

**Settings → API** 에서 다음 키 복사:

- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **anon public**: 공개 키 (프론트엔드용)
- **service_role secret**: 비밀 키 (백엔드용, 절대 노출 금지)

### 4. 스토리지 버킷 생성

**Storage → Create Bucket**:

1. Bucket 이름: `documents`
2. Public bucket: `false` (비공개)
3. File size limit: `10 MB`
4. Allowed MIME types:
   - `application/pdf`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 5. RLS (Row Level Security) 정책 설정

Supabase SQL Editor에서 실행:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_of_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policy
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policy
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );
```

---

## 서버 준비

### 1. 서버 접속

```bash
ssh centos@your-server-ip
```

### 2. 시스템 업데이트

```bash
sudo yum update -y
sudo yum install -y yum-utils device-mapper-persistent-data lvm2 git
```

### 3. 방화벽 설정

```bash
# 포트 8015 오픈 (애플리케이션)
sudo firewall-cmd --permanent --add-port=8015/tcp

# 포트 80/443 오픈 (Nginx - 선택사항)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# 방화벽 재시작
sudo firewall-cmd --reload

# 확인
sudo firewall-cmd --list-ports
```

### 4. 디렉토리 생성

```bash
# 애플리케이션 디렉토리
sudo mkdir -p /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 문서 업로드 볼륨
sudo mkdir -p /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 소유권 변경
sudo chown -R centos:centos /home/centos/SHINHWA_AI
```

---

## Docker 설치

### 1. Docker Repository 추가

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

### 2. Docker 설치

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

### 3. Docker 서비스 시작

```bash
# Docker 시작
sudo systemctl start docker

# 부팅 시 자동 시작 설정
sudo systemctl enable docker

# 상태 확인
sudo systemctl status docker
```

### 4. Docker 권한 설정

```bash
# centos 사용자를 docker 그룹에 추가
sudo usermod -aG docker centos

# 재로그인 (권한 적용을 위해)
exit
ssh centos@your-server-ip

# 확인
docker --version
# Docker version 20.10.x 이상
```

### 5. Docker Compose 설치

```bash
# Docker Compose 다운로드
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose

# 실행 권한 부여
sudo chmod +x /usr/local/bin/docker-compose

# 확인
docker-compose --version
# Docker Compose version v2.24.5 이상
```

---

## 애플리케이션 배포

### 1. 소스 코드 다운로드

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# GitHub에서 클론
git clone https://github.com/axconkr/Water_AI_Report_Gen.git .

# 또는 기존 코드가 있다면
git pull origin main
```

### 2. 환경 변수 설정

```bash
# .env.production 파일 생성
cp .env.production.example .env.production

# 환경 변수 편집
vi .env.production
```

**필수 설정 항목**:

```bash
# Server Configuration
NODE_ENV=production
FRONTEND_PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_API_URL=http://your-server-ip:4000/api/v1

# Supabase (앞에서 복사한 값으로 대체)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # 선택사항

# JWT Secrets (강력한 랜덤 문자열 생성)
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=생성된_랜덤_문자열
JWT_REFRESH_SECRET=생성된_랜덤_문자열

# Security
SESSION_SECRET=생성된_랜덤_문자열
BCRYPT_SALT_ROUNDS=10

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://your-server-ip:8015
```

### 3. JWT Secret 생성

```bash
# JWT Secret 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# 출력값을 JWT_SECRET에 복사

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# 출력값을 JWT_REFRESH_SECRET에 복사

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# 출력값을 SESSION_SECRET에 복사
```

### 4. Docker 이미지 빌드

```bash
# Docker 이미지 빌드 (5-10분 소요)
docker-compose build

# 빌드 진행 상황 확인
docker images | grep apas
```

### 5. 데이터베이스 마이그레이션

프로덕션 환경에서는 먼저 데이터베이스 스키마를 생성해야 합니다:

```bash
# 임시 컨테이너로 마이그레이션 실행
docker-compose run --rm apas sh -c "cd /app/backend && npx prisma migrate deploy"
```

### 6. 애플리케이션 시작

```bash
# Docker Compose로 시작 (백그라운드)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 보기
docker-compose logs -f apas
```

### 7. 상태 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 출력 예시:
# NAME                IMAGE               STATUS              PORTS
# apas-application    apas:latest         Up 2 minutes        0.0.0.0:8015->3000/tcp, 0.0.0.0:4000->4000/tcp
# apas-nginx          nginx:alpine        Up 2 minutes        0.0.0.0:80->80/tcp

# Health check
curl http://localhost:4000/api/v1/health
# {"status":"ok","timestamp":"2024-01-15T12:34:56.789Z"}

# 브라우저에서 접속
# http://your-server-ip:8015
```

---

## 서비스 관리

### 기본 명령어

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 로그 확인 (실시간)
docker-compose logs -f

# 로그 확인 (최근 100줄)
docker-compose logs --tail=100

# 컨테이너 내부 접속
docker-compose exec apas sh

# 리소스 사용량 확인
docker stats

# 디스크 사용량 확인
docker system df
```

### 코드 업데이트

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 최신 코드 가져오기
git pull origin main

# 기존 컨테이너 중지 및 제거
docker-compose down

# 이미지 재빌드
docker-compose build

# 서비스 재시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 데이터베이스 마이그레이션

```bash
# 새로운 마이그레이션 적용
docker-compose run --rm apas sh -c "cd /app/backend && npx prisma migrate deploy"

# Prisma 클라이언트 재생성
docker-compose run --rm apas sh -c "cd /app/backend && npx prisma generate"

# 서비스 재시작
docker-compose restart apas
```

### 백업

```bash
# 업로드된 문서 백업
tar -czf document-backup-$(date +%Y%m%d).tar.gz \
  /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 환경 변수 백업
cp .env.production .env.production.backup

# Docker 볼륨 백업
docker run --rm \
  -v apas-logs:/source \
  -v /home/centos/backup:/backup \
  alpine tar -czf /backup/apas-logs-$(date +%Y%m%d).tar.gz -C /source .
```

### 로그 관리

```bash
# 로그 파일 위치
docker-compose logs --tail=100 apas > apas.log

# 로그 로테이션 설정 (Docker 자동 처리)
# docker-compose.yml에 logging 섹션 참조

# 오래된 로그 삭제
docker system prune -f
```

---

## 트러블슈팅

### 1. 컨테이너가 시작되지 않을 때

```bash
# 상세 로그 확인
docker-compose logs apas

# 컨테이너 상태 확인
docker-compose ps

# 일반적인 원인:
# - 환경 변수 누락 (.env.production 확인)
# - 포트 충돌 (8015, 4000 포트 사용 중인지 확인)
# - 데이터베이스 연결 실패 (DATABASE_URL 확인)

# 포트 사용 확인
sudo netstat -tuln | grep -E '8015|4000'

# 포트를 사용 중인 프로세스 종료
sudo lsof -ti:8015 | xargs kill -9
```

### 2. 데이터베이스 연결 오류

```bash
# Supabase 연결 테스트
docker-compose exec apas sh -c "cd /app/backend && npx prisma db pull"

# 확인 사항:
# - DATABASE_URL 형식이 올바른지 확인
# - Supabase 프로젝트가 활성화되어 있는지 확인
# - 비밀번호에 특수문자가 있다면 URL 인코딩 필요
#   예: password@123 → password%40123

# 네트워크 연결 테스트
ping db.your-project-ref.supabase.co
```

### 3. Gemini API 오류

```bash
# 환경 변수 확인
docker-compose exec apas sh -c 'echo $GEMINI_API_KEY'

# API 키 테스트
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"

# 로그에서 오류 확인
docker-compose logs apas | grep -i "gemini"
```

### 4. 파일 업로드 실패

```bash
# 업로드 디렉토리 권한 확인
ls -la /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 권한 수정
sudo chown -R centos:centos /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document
sudo chmod -R 755 /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 컨테이너 내부 확인
docker-compose exec apas ls -la /app/uploads
```

### 5. 메모리 부족

```bash
# 메모리 사용량 확인
free -h
docker stats

# 스왑 메모리 추가 (임시)
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 적용
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Docker 리소스 제한 조정
# docker-compose.yml의 resources 섹션 참조
```

### 6. Nginx 502 Bad Gateway

```bash
# Nginx 컨테이너 로그 확인
docker-compose logs nginx

# 백엔드 상태 확인
curl http://localhost:4000/api/v1/health

# Nginx 설정 테스트
docker-compose exec nginx nginx -t

# Nginx 재시작
docker-compose restart nginx
```

### 7. 컨테이너 완전 재시작

```bash
# 모든 컨테이너 중지 및 제거
docker-compose down

# 볼륨까지 제거 (주의: 데이터 손실)
docker-compose down -v

# 이미지 재빌드 (캐시 무시)
docker-compose build --no-cache

# 서비스 재시작
docker-compose up -d
```

### 8. 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# Docker 디스크 사용량 확인
docker system df

# 사용하지 않는 이미지/컨테이너 삭제
docker system prune -a -f

# 특정 이미지 삭제
docker images
docker rmi image-id

# 볼륨 정리
docker volume prune
```

---

## 보안 권장사항

### 1. 환경 변수 보호

```bash
# .env.production 파일 권한 설정
chmod 600 .env.production

# Git에서 제외 (.gitignore 확인)
echo ".env.production" >> .gitignore
```

### 2. Firewall 설정

```bash
# 필요한 포트만 오픈
sudo firewall-cmd --permanent --remove-port=4000/tcp  # API 직접 접근 차단
sudo firewall-cmd --reload

# Nginx를 통해서만 접근 허용
```

### 3. SSL/TLS 설정 (프로덕션 권장)

```bash
# Let's Encrypt 인증서 발급
sudo yum install -y certbot

# 인증서 생성
sudo certbot certonly --standalone -d your-domain.com

# 인증서 경로
ls /etc/letsencrypt/live/your-domain.com/

# Nginx 설정에 SSL 추가
# docker/nginx.conf 참조

# 자동 갱신 설정
sudo crontab -e
# 0 0 * * * certbot renew --quiet && docker-compose restart nginx
```

### 4. 정기 업데이트

```bash
# 시스템 업데이트
sudo yum update -y

# Docker 이미지 업데이트
docker-compose pull
docker-compose up -d
```

---

## 성능 최적화

### 1. Docker 리소스 제한

`docker-compose.yml`에서 조정:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### 2. Nginx 캐싱

`docker/nginx.conf`에 캐시 설정 추가:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
proxy_cache my_cache;
```

### 3. 데이터베이스 연결 풀

백엔드 Prisma 설정 (`backend/prisma/schema.prisma`):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10
}
```

---

## 모니터링

### 1. 로그 모니터링

```bash
# 실시간 로그
docker-compose logs -f apas

# 에러 로그만 필터링
docker-compose logs apas | grep -i error

# 특정 시간대 로그
docker-compose logs --since 2024-01-15T10:00:00 apas
```

### 2. 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats

# 시스템 리소스
htop  # 설치: sudo yum install -y htop
```

### 3. Health Check

```bash
# API Health Check
curl http://localhost:4000/api/v1/health

# 자동 모니터링 스크립트
cat > /home/centos/health-check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health)
if [ $response -ne 200 ]; then
  echo "$(date) - Health check failed: HTTP $response" >> /var/log/apas-health.log
  docker-compose restart apas
fi
EOF

chmod +x /home/centos/health-check.sh

# Cron 등록 (5분마다)
crontab -e
# */5 * * * * /home/centos/health-check.sh
```

---

## 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Supabase 문서](https://supabase.com/docs)
- [Nginx 문서](https://nginx.org/en/docs/)
- [프로젝트 README](../README.md)
- [CentOS 7 배포 가이드](./DEPLOYMENT.md)

---

## 문의 및 지원

- GitHub Issues: https://github.com/axconkr/Water_AI_Report_Gen/issues
- 프로젝트 문서: `docs/` 디렉토리 참조
