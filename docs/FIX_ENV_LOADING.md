# Docker Compose 환경 변수 로딩 문제 해결

## 문제 원인

Docker Compose는 `${VARIABLE}` 형식의 변수 치환을 할 때 다음 순서로 값을 찾습니다:

1. **Shell 환경 변수** (현재 터미널 세션)
2. **`.env` 파일** (docker-compose.yml과 같은 디렉토리)
3. `env_file`에 지정된 파일은 **컨테이너 내부**로만 전달됨

현재 설정:

```yaml
environment:
  - DATABASE_URL=${DATABASE_URL} # ← docker-compose가 값을 찾을 수 없음
env_file:
  - .env.production # ← 이것은 컨테이너 내부로만 전달
```

## 해결 방법 (3가지 옵션)

### 옵션 1: .env.production을 .env로 복사 (추천)

**CentOS 7 서버에서 실행:**

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# .env.production을 .env로 복사
cp .env.production .env

# Docker 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

**장점:**

- 간단하고 빠름
- Docker Compose 표준 방식
- `.env` 파일은 자동으로 `.gitignore`에 포함되어 있음

**단점:**

- 파일이 두 개로 중복됨

### 옵션 2: 심볼릭 링크 생성

**CentOS 7 서버에서 실행:**

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# .env 파일이 있으면 삭제
rm -f .env

# .env.production을 가리키는 심볼릭 링크 생성
ln -s .env.production .env

# Docker 재시작
docker-compose down
docker-compose up -d
```

**장점:**

- 파일 중복 없음
- .env.production 하나만 관리

**단점:**

- 심볼릭 링크 개념 이해 필요

### 옵션 3: docker-compose.yml 수정 (환경별 파일)

docker-compose.yml을 수정하여 환경 변수를 직접 읽지 않고 env_file만 사용:

```yaml
# Environment variables - 변수 치환 제거
environment:
  # Node environment
  - NODE_ENV=production

  # Server ports
  - FRONTEND_PORT=3000
  - BACKEND_PORT=4000
  - NEXT_PUBLIC_API_URL=http://1.236.245.110:8021/api/v1

# Environment file - 모든 변수는 여기서 읽음
env_file:
  - .env.production
```

**장점:**

- docker-compose.yml이 깔끔해짐
- 변수 치환 불필요

**단점:**

- docker-compose.yml 수정 필요
- docker-compose.yml의 environment 섹션 활용 불가

## 권장 솔루션

**옵션 1 (복사)** 사용을 권장합니다.

### 빠른 해결 스크립트

```bash
#!/bin/bash
# fix_env.sh

cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

echo "========================================="
echo "환경 변수 파일 설정"
echo "========================================="
echo ""

# .env.production 파일 존재 확인
if [ ! -f .env.production ]; then
    echo "❌ 오류: .env.production 파일이 없습니다."
    exit 1
fi

echo "✅ .env.production 파일 확인됨"
echo ""

# .env 파일 백업 (있는 경우)
if [ -f .env ]; then
    echo "📦 기존 .env 파일 백업 중..."
    mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# .env.production을 .env로 복사
echo "📄 .env.production → .env 복사 중..."
cp .env.production .env

echo "✅ .env 파일 생성 완료"
echo ""

# 파일 내용 확인 (민감한 정보 제외)
echo "📋 설정된 환경 변수 (일부):"
grep -E "^(NODE_ENV|FRONTEND_PORT|BACKEND_PORT|TZ)=" .env | head -5
echo ""

# Docker 재시작
echo "🔄 Docker 컨테이너 재시작 중..."
docker-compose down
docker-compose up -d

echo ""
echo "⏳ 컨테이너 시작 대기 (30초)..."
sleep 30

echo ""
echo "========================================="
echo "컨테이너 상태 확인"
echo "========================================="
docker-compose ps

echo ""
echo "========================================="
echo "✅ 완료!"
echo "========================================="
echo ""
echo "다음 명령으로 로그를 확인하세요:"
echo "  docker-compose logs -f"
echo ""
echo "외부 접속 테스트:"
echo "  curl http://1.236.245.110:8021/api/v1/health"
echo ""
```

### 실행 방법

```bash
# 서버 접속
ssh centos@1.236.245.110

# 프로젝트 디렉토리로 이동
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 간단한 방법: 직접 복사
cp .env.production .env

# Docker 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 검증 방법

### 1. 환경 변수 로딩 확인

```bash
# docker-compose config 명령으로 최종 설정 확인
docker-compose config | grep -A 20 "environment:"

# 환경 변수가 제대로 치환되었는지 확인
docker-compose config | grep "DATABASE_URL"
```

정상적으로 로딩되면:

```yaml
environment:
  DATABASE_URL: postgresql://postgres:...@db.xyz.supabase.co:5432/postgres
```

비정상적으로 로딩되면 (현재 상태):

```yaml
environment:
  DATABASE_URL: '' # 빈 문자열
```

### 2. 컨테이너 내부 환경 변수 확인

```bash
# 컨테이너 내부의 환경 변수 확인
docker exec -it apas-application env | grep -E "(DATABASE_URL|SUPABASE|GEMINI|JWT)"
```

### 3. 애플리케이션 로그 확인

```bash
# 컨테이너 로그에서 에러 확인
docker-compose logs | grep -i "error\|warn\|fail"

# 실시간 로그 모니터링
docker-compose logs -f
```

## 추가 문제 해결

### 문제: .env 파일을 만들었는데도 여전히 경고 발생

**원인:** Docker Compose가 캐시된 설정을 사용하고 있을 수 있음

**해결:**

```bash
# 완전히 정리 후 재시작
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### 문제: 일부 환경 변수만 로딩됨

**원인:** .env 파일 형식 오류 (공백, 줄바꿈 등)

**해결:**

```bash
# .env 파일 형식 검증
cat .env | grep -v "^#" | grep -v "^$" | grep "="

# 각 변수가 올바른 형식인지 확인
# 올바른 형식: KEY=VALUE
# 잘못된 형식: KEY = VALUE (공백 있음)
```

### 문제: Supabase 연결 실패

**원인:** DATABASE_URL 형식 오류 또는 Supabase IP 화이트리스트

**해결:**

```bash
# 1. DATABASE_URL 형식 확인
echo $DATABASE_URL

# 2. Supabase 연결 테스트
docker exec -it apas-application sh -c "apk add postgresql-client && psql $DATABASE_URL -c 'SELECT 1'"

# 3. Supabase 대시보드에서:
#    - Project Settings → Database → Connection pooler (권장)
#    - Network Restrictions → Allow all IPs (또는 1.236.245.110 추가)
```

## 체크리스트

환경 변수 문제 해결 후 확인:

- [ ] `.env` 파일이 프로젝트 루트에 존재
- [ ] `.env` 파일에 모든 필수 변수 포함
- [ ] `docker-compose config` 명령으로 변수 치환 확인
- [ ] WARN 메시지가 사라짐
- [ ] 컨테이너 상태가 "Up" (Restarting 아님)
- [ ] `docker-compose logs`에 에러 없음
- [ ] Backend health check 성공: `curl http://localhost:8021/api/v1/health`
- [ ] 외부 접속 성공: `curl http://1.236.245.110:8021/api/v1/health`

모든 항목이 체크되면 정상 작동 중입니다! 🎉
