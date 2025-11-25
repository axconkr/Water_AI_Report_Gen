# APAS 배포 가이드 (Docker + Supabase)

## 배포 방식

GitHub → 원격 서버 Pull → Docker 빌드 및 실행

## 준비사항

### 1. Supabase 설정

1. https://supabase.com 에서 프로젝트 생성
2. Settings → Database에서 Connection String 복사
3. Settings → API에서 API Keys 복사:
   - `anon` `public` key
   - `service_role` `secret` key

### 2. 원격 서버 요구사항

- CentOS 7.x
- Docker & Docker Compose
- Git
- 포트 8020, 8021 개방

## 배포 단계

### Step 1: 로컬에서 GitHub에 푸시

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Step 2: 원격 서버 초기 설정 (최초 1회만)

```bash
# SSH 접속
ssh -p 2444 centos@1.236.245.110

# 프로젝트 클론
mkdir -p /home/centos/SHINHWA_AI/1.AI_Report
cd /home/centos/SHINHWA_AI/1.AI_Report
git clone https://github.com/axconkr/Water_AI_Report_Gen.git
cd Water_AI_Report_Gen

# .env 파일 생성
cp .env.example .env
vi .env
```

**`.env` 파일 수정:**

```env
NEXT_PUBLIC_API_URL=http://1.236.245.110:8021/api/v1
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@...
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
JWT_SECRET=your-strong-secret-min-32-chars
JWT_REFRESH_SECRET=your-strong-refresh-secret-min-32-chars
```

```bash
# 배포 스크립트 실행 권한
chmod +x deploy-remote.sh

# 필요한 디렉토리 생성
sudo mkdir -p Document Logs
sudo chown -R centos:centos .
```

### Step 3: 배포 실행

```bash
# 원격 서버에서 배포 스크립트 실행
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
./deploy-remote.sh
```

## 배포 스크립트 (`deploy-remote.sh`)가 수행하는 작업

1. Git에서 최신 코드 Pull
2. `.env` 파일 확인
3. 기존 Docker 컨테이너 중지
4. Docker 이미지 재빌드
5. 새 컨테이너 시작
6. 상태 확인

## 접속 URL

- **Frontend**: http://1.236.245.110:8020
- **Backend API**: http://1.236.245.110:8021/api/v1
- **Health Check**: http://1.236.245.110:8021/api/v1/health

## 유용한 명령어

### 로그 확인

```bash
sudo docker logs -f apas-application
sudo docker logs --tail 100 apas-application
```

### 컨테이너 상태

```bash
sudo docker-compose ps
sudo docker stats apas-application
```

### 재시작

```bash
sudo docker-compose restart apas
```

### 완전 재빌드

```bash
sudo docker-compose down -v
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

## 업데이트 배포

로컬에서 변경사항을 Push한 후:

```bash
ssh -p 2444 centos@1.236.245.110
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
./deploy-remote.sh
```

## 트러블슈팅

### 1. 포트 충돌

```bash
sudo netstat -tlnp | grep -E '8020|8021'
sudo docker-compose down
```

### 2. Docker 이미지 문제

```bash
sudo docker system prune -a
sudo docker-compose build --no-cache
```

### 3. 환경 변수 변경 후

```bash
vi .env
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d
```

### 4. 데이터베이스 마이그레이션

```bash
sudo docker exec -it apas-application sh
cd backend
npx prisma migrate deploy
exit
```

## Supabase 연결 확인

```bash
# 컨테이너 내부에서
sudo docker exec -it apas-application sh
cd backend
npx prisma db pull  # 스키마 확인
npx prisma studio  # GUI (포트 5555)
```

## 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] JWT_SECRET과 JWT_REFRESH_SECRET이 강력한 랜덤 문자열로 설정됨
- [ ] Supabase Row Level Security (RLS) 활성화
- [ ] 방화벽에서 필요한 포트만 개방 (8020, 8021)
- [ ] Docker 컨테이너 리소스 제한 설정됨

## 문의

문제 발생 시: https://github.com/axconkr/Water_AI_Report_Gen/issues
