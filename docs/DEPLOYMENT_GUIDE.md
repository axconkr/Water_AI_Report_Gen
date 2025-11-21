# APAS 배포 가이드

CentOS 7에서 Docker를 사용하여 APAS 시스템을 배포하는 완전한 가이드입니다.

## 📋 시스템 구성

### 서버 정보

- **외부 IP**: 1.236.245.110
- **사용 포트**: 8020~8050 (외부 개방)
- **Frontend**: http://1.236.245.110:8020
- **Backend API**: http://1.236.245.110:8021/api/v1
- **Database**: PostgreSQL (Docker 내부, 포트 5432)
- **Supabase**: 외부 서비스 (파일 스토리지)

### 아키텍처

```
                    ┌─────────────────┐
                    │   Supabase      │
                    │  (외부 서비스)   │
                    │ - File Storage  │
                    └────────▲────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────┼──────────────────────────────┐
│              CentOS 7 (1.236.245.110)                     │
│                            │                              │
│  ┌─────────────────────────┼──────────────────────────┐   │
│  │       Docker Compose Network                       │   │
│  │                         │                          │   │
│  │  ┌──────────────┐  ┌────┴──────────────────┐      │   │
│  │  │  PostgreSQL  │  │  APAS Application     │      │   │
│  │  │  Container   │◄─┤  (Frontend + Backend) │      │   │
│  │  │  :5432       │  │  :3000 (Frontend)     │      │   │
│  │  └──────┬───────┘  │  :4000 (Backend)      │      │   │
│  │         │          └─────────┬─────────────┘      │   │
│  │         │                    │                    │   │
│  └─────────┼────────────────────┼────────────────────┘   │
│            │                    │                        │
│            │                    ├─► :8020 (Frontend)     │
│            │                    └─► :8021 (Backend API)  │
│            ▼                                             │
│  ┌──────────────────┐    ┌──────────────────┐           │
│  │ DB/              │    │ Document/        │           │
│  │ Logs/            │    │ (로컬 백업)       │           │
│  └──────────────────┘    └──────────────────┘           │
└───────────────────────────────────────────────────────────┘
```

### 디렉토리 구조

```
/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/
├── DB/                    # PostgreSQL 데이터 (Docker Volume)
├── Document/              # 업로드된 파일 (Docker Volume)
│   ├── announcement/      # 공고문
│   ├── specification/     # 과업지시서
│   ├── contract/          # 계약서
│   └── generated/         # 생성된 문서
└── Logs/                  # 애플리케이션 로그 (Docker Volume)
    ├── backend.log
    └── error.log
```

---

## 🚀 배포 단계

### 1단계: 사전 준비

#### 1.1 시스템 요구사항 확인

```bash
# OS 버전 확인
cat /etc/centos-release
# CentOS Linux release 7.x 확인

# 최소 요구사항
# - CPU: 2 Core 이상
# - RAM: 4GB 이상 (권장 8GB)
# - Disk: 20GB 이상 여유 공간
```

#### 1.2 Docker 설치

```bash
# 프로젝트 디렉토리로 이동
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# Docker 설치 스크립트 실행
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh

# 설치 확인
docker --version
docker-compose --version
```

---

### 2단계: 디렉토리 설정

```bash
# 프로젝트 루트로 이동
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 필요한 디렉토리 생성
mkdir -p DB
mkdir -p Document/{announcement,specification,contract,generated}
mkdir -p Logs

# 권한 설정 (Docker 컨테이너에서 접근 가능하도록)
chmod 755 DB Document Logs
chmod -R 755 Document/*

# 확인
ls -la
```

**예상 출력**:

```
drwxr-xr-x  2 centos centos 4096 ... DB
drwxr-xr-x  6 centos centos 4096 ... Document
drwxr-xr-x  2 centos centos 4096 ... Logs
```

---

### 3단계: 환경 변수 설정

#### 3.1 환경 변수 파일 생성

```bash
# 예제 파일을 복사
cp .env.production.example .env.production

# 환경 변수 파일 편집
vi .env.production
```

#### 3.2 필수 환경 변수 설정

**.env.production** 파일에서 다음 값들을 **반드시** 수정하세요:

```bash
# ========================================
# PostgreSQL Database (Docker 내부)
# ========================================
POSTGRES_USER=apas
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE  # ⚠️ 반드시 변경!
POSTGRES_DB=apas_db

# ========================================
# Supabase (외부 서비스 - 파일 스토리지)
# ========================================
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_STORAGE_BUCKET=documents

# ========================================
# AI Service API Keys
# ========================================
GEMINI_API_KEY=your_actual_gemini_api_key      # ⚠️ 실제 키 입력!
ANTHROPIC_API_KEY=your_actual_anthropic_key    # ⚠️ 실제 키 입력!

# ========================================
# JWT Authentication
# ========================================
JWT_SECRET=your_very_strong_jwt_secret_min_32_chars  # ⚠️ 반드시 변경!
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars  # ⚠️ 반드시 변경!

# ========================================
# Server Configuration (외부 접근)
# ========================================
NEXT_PUBLIC_API_URL=http://1.236.245.110:8021/api/v1
CORS_ORIGIN=http://1.236.245.110:8020
```

#### 3.3 강력한 비밀번호 생성 (선택)

```bash
# 랜덤 비밀번호 생성 (32자)
openssl rand -base64 32

# 예시 출력:
# XK7pQm9wZ3RhYnN0cmluZ2hlcmVhYmM=
```

---

### 4단계: 배포 실행

#### 4.1 자동 배포 스크립트 사용

```bash
# 배포 스크립트 실행
chmod +x scripts/deploy-centos7.sh
./scripts/deploy-centos7.sh
```

#### 4.2 수동 배포 (문제 발생 시)

```bash
# 1. 기존 컨테이너 중지
docker-compose down

# 2. 이미지 빌드
docker-compose build

# 3. 컨테이너 시작
docker-compose --env-file .env.production up -d

# 4. 로그 확인
docker-compose logs -f
```

---

### 5단계: 배포 확인

#### 5.1 컨테이너 상태 확인

```bash
docker-compose ps
```

**정상 출력 예시**:

```
NAME                IMAGE               STATUS              PORTS
apas-postgres       postgres:15-alpine  Up (healthy)        5432
apas-application    ...                 Up (healthy)        8020->3000, 8021->4000
```

#### 5.2 Health Check

```bash
# Backend API 확인 (서버 내부)
curl http://localhost:8021/api/v1/health

# 외부 접근 확인 (다른 컴퓨터에서)
curl http://1.236.245.110:8021/api/v1/health

# 예상 출력:
# {"status":"ok","timestamp":"2025-01-21T...","uptime":123.45}

# Frontend 확인 (서버 내부)
curl http://localhost:8020

# 외부 브라우저에서 접근
# http://1.236.245.110:8020
```

#### 5.3 데이터베이스 연결 확인

```bash
# PostgreSQL 컨테이너 접속
docker exec -it apas-postgres psql -U apas -d apas_db

# 데이터베이스 확인
\l    # 데이터베이스 목록
\dt   # 테이블 목록
\q    # 종료
```

#### 5.4 파일 업로드 테스트

```bash
# 테스트 파일 업로드 (API 사용)
# 실제 사용 시 프론트엔드에서 테스트

# 업로드된 파일 확인
ls -lh /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document/
```

---

## 🔧 운영 관리

### 컨테이너 관리

```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f                # 전체 로그
docker-compose logs -f apas           # 애플리케이션 로그
docker-compose logs -f postgres       # DB 로그

# 컨테이너 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart apas

# 컨테이너 중지
docker-compose stop

# 컨테이너 시작
docker-compose start

# 컨테이너 및 네트워크 삭제 (데이터는 유지)
docker-compose down

# 컨테이너, 네트워크, 볼륨 모두 삭제 (⚠️ 데이터 손실)
docker-compose down -v
```

### 데이터베이스 관리

```bash
# PostgreSQL 백업
docker exec apas-postgres pg_dump -U apas apas_db > backup_$(date +%Y%m%d).sql

# PostgreSQL 복원
docker exec -i apas-postgres psql -U apas apas_db < backup_20250121.sql

# 데이터베이스 크기 확인
docker exec apas-postgres psql -U apas -d apas_db -c "\l+"
```

### 파일 관리

```bash
# 업로드 디렉토리 크기 확인
du -sh /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document/*

# 오래된 파일 찾기 (30일 이상)
find /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document \
  -type f -mtime +30 -ls

# 임시 파일 정리
find /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document/temp \
  -type f -mtime +1 -delete
```

### 로그 관리

```bash
# 로그 파일 확인
tail -f /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Logs/backend.log

# 에러 로그만 확인
grep -i error /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Logs/*.log

# 로그 파일 크기 확인
ls -lh /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Logs/

# 오래된 로그 삭제 (7일 이상)
find /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Logs \
  -name "*.log" -mtime +7 -delete
```

---

## 🔒 보안 설정

### 방화벽 설정

```bash
# 필요한 포트 오픈
sudo firewall-cmd --permanent --add-port=8015/tcp  # Frontend
sudo firewall-cmd --permanent --add-port=4000/tcp  # Backend API
sudo firewall-cmd --permanent --add-port=80/tcp    # HTTP (Nginx)
sudo firewall-cmd --permanent --add-port=443/tcp   # HTTPS (Nginx)
sudo firewall-cmd --reload

# 확인
sudo firewall-cmd --list-ports
```

### 파일 권한 강화

```bash
# 환경 변수 파일 권한 제한
chmod 600 .env.production

# 업로드 디렉토리 권한
chmod 755 Document
find Document -type f -exec chmod 644 {} \;
find Document -type d -exec chmod 755 {} \;

# 로그 디렉토리 권한
chmod 755 Logs
chmod 644 Logs/*.log
```

---

## 📊 모니터링

### 시스템 리소스

```bash
# Docker 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 메모리 사용량
free -h
```

### 애플리케이션 모니터링

```bash
# Health Check (1분마다)
watch -n 60 'curl -s http://localhost:4000/api/v1/health | jq'

# 접속 로그 실시간 확인
docker-compose logs -f --tail=50 nginx
```

---

## 🚨 문제 해결

### 컨테이너 시작 실패

**증상**: 컨테이너가 시작되지 않음

**해결**:

```bash
# 로그 확인
docker-compose logs apas

# 환경 변수 확인
docker-compose config

# 컨테이너 재빌드
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 데이터베이스 연결 실패

**증상**: `ECONNREFUSED` 또는 `connection timeout`

**해결**:

```bash
# PostgreSQL 컨테이너 상태 확인
docker ps | grep postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# 환경 변수 확인
docker exec apas-application printenv | grep DATABASE

# PostgreSQL 재시작
docker-compose restart postgres
```

### 파일 업로드 실패

**증상**: 파일 업로드 시 권한 에러

**해결**:

```bash
# 권한 확인
ls -la /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 권한 재설정
chmod -R 755 /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/Document

# 컨테이너 재시작
docker-compose restart apas
```

### 디스크 공간 부족

**증상**: `no space left on device`

**해결**:

```bash
# 디스크 사용량 확인
df -h

# Docker 정리
docker system prune -a

# 오래된 로그 삭제
find Logs -name "*.log" -mtime +7 -delete

# 오래된 업로드 파일 삭제 (주의!)
find Document -type f -mtime +90 -ls
```

---

## 📦 백업 및 복원

### 자동 백업 설정

```bash
# 백업 스크립트 실행
chmod +x scripts/backup-centos7.sh
./scripts/backup-centos7.sh

# Cron으로 자동 백업 설정 (매일 새벽 2시)
crontab -e

# 다음 라인 추가
0 2 * * * /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/scripts/backup-centos7.sh
```

### 수동 백업

```bash
# 전체 백업
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/centos/backups"

mkdir -p $BACKUP_DIR

# 데이터베이스 백업
docker exec apas-postgres pg_dump -U apas apas_db | gzip > \
  $BACKUP_DIR/db_backup_${BACKUP_DATE}.sql.gz

# 업로드 파일 백업
tar -czf $BACKUP_DIR/files_backup_${BACKUP_DATE}.tar.gz \
  -C /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen Document

# 환경 변수 백업
cp .env.production $BACKUP_DIR/.env.production_${BACKUP_DATE}
```

### 복원

```bash
# 데이터베이스 복원
gunzip < /home/centos/backups/db_backup_20250121.sql.gz | \
  docker exec -i apas-postgres psql -U apas apas_db

# 파일 복원
tar -xzf /home/centos/backups/files_backup_20250121.tar.gz \
  -C /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
```

---

## 🔄 업데이트

### 애플리케이션 업데이트

```bash
# 1. Git pull
git pull origin main

# 2. 환경 변수 확인 (.env.production.example 변경사항 확인)
diff .env.production .env.production.example

# 3. 재빌드 및 재배포
docker-compose down
docker-compose build --no-cache
docker-compose --env-file .env.production up -d

# 4. 로그 확인
docker-compose logs -f
```

---

## ✅ 운영 체크리스트

### 일일 점검

- [ ] 컨테이너 상태 확인 (`docker-compose ps`)
- [ ] 애플리케이션 Health Check (`curl http://localhost:4000/api/v1/health`)
- [ ] 로그 확인 (에러 없는지)
- [ ] 디스크 사용량 확인 (`df -h`)

### 주간 점검

- [ ] 백업 파일 확인
- [ ] 업로드 파일 정리 (불필요한 파일 삭제)
- [ ] 로그 파일 정리
- [ ] 성능 모니터링 (`docker stats`)

### 월간 점검

- [ ] 백업 복원 테스트
- [ ] 보안 패치 적용 (`yum update`)
- [ ] 데이터베이스 최적화 (`VACUUM ANALYZE`)
- [ ] 시스템 전반 점검

---

**마지막 업데이트**: 2025-01-21
**문서 버전**: 1.0
