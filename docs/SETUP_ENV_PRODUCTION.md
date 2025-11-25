# CentOS 7 서버 환경 변수 설정 가이드

## 현재 문제 상황

컨테이너가 재시작 반복 상태이며, 다음 환경 변수들이 누락되어 있습니다:

- DATABASE_URL
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- ANTHROPIC_API_KEY
- JWT_SECRET
- JWT_REFRESH_SECRET

## 1단계: CentOS 7 서버 접속

```bash
# SSH로 서버 접속
ssh centos@1.236.245.110

# 프로젝트 디렉토리로 이동
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
```

## 2단계: .env.production 파일 생성

```bash
# 예제 파일 복사
cp .env.production.example .env.production

# 파일 편집
vi .env.production
```

## 3단계: 환경 변수 설정

### 3.1 Supabase 설정 (필수)

Supabase 대시보드에서 다음 정보를 가져오세요:

1. **Project Settings → Database → Connection String → URI**

   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

2. **Project Settings → API**
   ```
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=eyJ... (anon public key)
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role secret key)
   SUPABASE_STORAGE_BUCKET=documents
   ```

### 3.2 AI API Keys 설정 (필수)

사용자가 제공한 API 키:

```bash
GEMINI_API_KEY=AIzaSyCiaGcHqn69onapYYmdnj8g69ZhmeBZDqs
ANTHROPIC_API_KEY=sk-ant-api03-... (Claude API 키)
OPENAI_API_KEY=  # 선택 사항
OPENCHAT_API_URL=  # 선택 사항 (오픈소스 대안)
```

### 3.3 JWT Secret 생성 (필수)

보안 키를 자동 생성합니다:

```bash
# JWT_SECRET 생성
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.production

# JWT_REFRESH_SECRET 생성
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env.production
```

### 3.4 서버 설정 (자동 설정됨)

이미 docker-compose.yml에 설정되어 있습니다:

```bash
NODE_ENV=production
FRONTEND_PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_API_URL=http://1.236.245.110:8021/api/v1
CORS_ORIGIN=http://1.236.245.110:8020
```

## 4단계: 완성된 .env.production 예시

```bash
# ========================================
# Database Configuration (Supabase 사용)
# ========================================
DATABASE_URL=postgresql://postgres:your_supabase_password@db.abcdefgh.supabase.co:5432/postgres

# ========================================
# Supabase Configuration (필수)
# ========================================
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=documents

# ========================================
# AI Service API Keys
# ========================================
GEMINI_API_KEY=AIzaSyCiaGcHqn69onapYYmdnj8g69ZhmeBZDqs
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=
OPENCHAT_API_URL=

# ========================================
# JWT Authentication
# ========================================
JWT_SECRET=생성된_32자_이상의_랜덤_문자열
JWT_REFRESH_SECRET=생성된_32자_이상의_랜덤_문자열

# ========================================
# Server Configuration
# ========================================
NODE_ENV=production
FRONTEND_PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_API_URL=http://1.236.245.110:8021/api/v1
CORS_ORIGIN=http://1.236.245.110:8020

# ========================================
# File Upload Configuration
# ========================================
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# ========================================
# Timezone
# ========================================
TZ=Asia/Seoul
```

## 5단계: 파일 권한 설정

```bash
# .env.production 파일 보안 설정 (중요!)
chmod 600 .env.production
chown centos:centos .env.production
```

## 6단계: Docker 컨테이너 재시작

```bash
# 기존 컨테이너 종료
docker-compose down

# 새 설정으로 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인 (30초 대기 후)
sleep 30
docker-compose ps
```

## 7단계: 컨테이너 로그 확인

```bash
# 전체 로그 확인
docker-compose logs

# 실시간 로그 모니터링
docker-compose logs -f

# 마지막 100줄만 확인
docker-compose logs --tail=100
```

## 8단계: 헬스 체크 확인

```bash
# Backend 헬스 체크
curl http://localhost:4000/api/v1/health

# 외부 접근 테스트 (다른 컴퓨터에서 실행)
curl http://1.236.245.110:8021/api/v1/health
curl http://1.236.245.110:8020
```

## 9단계: 방화벽 확인 (접속 안 될 경우)

```bash
# 현재 방화벽 규칙 확인
sudo firewall-cmd --list-all

# 포트 8020, 8021 열기 (필요시)
sudo firewall-cmd --permanent --add-port=8020/tcp
sudo firewall-cmd --permanent --add-port=8021/tcp
sudo firewall-cmd --reload

# SELinux 상태 확인
sudo getenforce

# SELinux가 Enforcing이면 임시로 Permissive 설정 (테스트용)
sudo setenforce 0
```

## 10단계: 포트 리스닝 확인

```bash
# Docker 컨테이너가 포트를 리스닝하는지 확인
sudo netstat -tulpn | grep -E '(8020|8021)'

# 또는
sudo ss -tulpn | grep -E '(8020|8021)'

# 예상 출력:
# tcp  0  0  :::8020  :::*  LISTEN  12345/docker-proxy
# tcp  0  0  :::8021  :::*  LISTEN  12346/docker-proxy
```

## 문제 해결 (Troubleshooting)

### 문제 1: 컨테이너가 계속 재시작됨

```bash
# 자세한 에러 로그 확인
docker-compose logs apas

# Supabase 연결 테스트
docker exec -it apas-application sh
wget -O- https://YOUR-PROJECT-REF.supabase.co
```

### 문제 2: 외부 접속이 안됨

```bash
# 1. 컨테이너 내부에서 확인
docker exec -it apas-application sh
curl http://localhost:3000
curl http://localhost:4000/api/v1/health

# 2. 호스트에서 확인
curl http://localhost:8020
curl http://localhost:8021/api/v1/health

# 3. 외부에서 확인
curl http://1.236.245.110:8020
curl http://1.236.245.110:8021/api/v1/health
```

### 문제 3: Supabase 연결 실패

```bash
# .env.production의 Supabase 설정 확인
cat .env.production | grep SUPABASE

# Supabase 대시보드에서:
# 1. Project Settings → Database → Connection pooling 사용 권장
# 2. Connection string 형식 확인
# 3. IP allowlist 설정 (1.236.245.110 추가)
```

## 자동 설정 스크립트

빠른 설정을 위한 스크립트:

```bash
#!/bin/bash
# setup_env.sh

cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 백업 생성
if [ -f .env.production ]; then
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
fi

# 예제 파일 복사
cp .env.production.example .env.production

# JWT 시크릿 자동 생성
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# 기본 AI API 키 설정
sed -i "s/your_gemini_api_key_here/AIzaSyCiaGcHqn69onapYYmdnj8g69ZhmeBZDqs/" .env.production
sed -i "s/your_very_strong_jwt_secret_min_32_characters_long_here/$JWT_SECRET/" .env.production
sed -i "s/your_very_strong_refresh_secret_min_32_characters_long_here/$JWT_REFRESH_SECRET/" .env.production

echo "✅ .env.production 파일이 생성되었습니다."
echo ""
echo "⚠️  다음 값들을 직접 입력해야 합니다:"
echo "  1. DATABASE_URL (Supabase 대시보드에서)"
echo "  2. SUPABASE_URL"
echo "  3. SUPABASE_ANON_KEY"
echo "  4. SUPABASE_SERVICE_ROLE_KEY"
echo "  5. ANTHROPIC_API_KEY"
echo ""
echo "vi .env.production 명령으로 파일을 편집하세요."
```

실행 방법:

```bash
chmod +x setup_env.sh
./setup_env.sh
```

## 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] .env.production 파일 생성 완료
- [ ] Supabase DATABASE_URL 설정 완료
- [ ] Supabase URL, Keys 설정 완료
- [ ] AI API Keys (Gemini, Claude) 설정 완료
- [ ] JWT Secrets 생성 완료
- [ ] 파일 권한 600으로 설정 완료
- [ ] docker-compose down → up -d 실행 완료
- [ ] 컨테이너 상태 "Up" 확인
- [ ] Backend health check (localhost:4000/api/v1/health) 성공
- [ ] 방화벽 포트 8020, 8021 오픈 확인
- [ ] 외부 접속 테스트 성공

## 완료 후 확인

모든 설정이 완료되면:

```bash
# 최종 상태 확인
docker-compose ps
# 예상: STATUS가 "Up" 상태

# 백엔드 API 테스트
curl http://1.236.245.110:8021/api/v1/health
# 예상: {"status":"ok","timestamp":"..."}

# 프론트엔드 접속
curl -I http://1.236.245.110:8020
# 예상: HTTP/1.1 200 OK

# 브라우저로 접속
# http://1.236.245.110:8020
```

정상 작동 시 브라우저에서 Next.js 애플리케이션이 표시됩니다.
