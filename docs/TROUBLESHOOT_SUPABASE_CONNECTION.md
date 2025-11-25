# Supabase 연결 오류 해결 가이드

## 오류 메시지

```
Error: P1001: Can't reach database server at `db.udwsgljlxruvzmofirut.supabase.co:5432`
Please make sure your database server is running at `db.udwsgljlxruvzmofirut.supabase.co:5432`.
```

## 원인 분석

이 오류는 다음 4가지 원인 중 하나입니다:

1. ❌ **DATABASE_URL 형식 오류** - 비밀번호 특수문자 인코딩 문제
2. ❌ **Supabase 프로젝트 일시 중지** - 무료 플랜 비활성 프로젝트
3. ❌ **네트워크 연결 문제** - 방화벽 또는 DNS
4. ❌ **Connection Pooling 미사용** - Direct connection 제한

---

## 해결 방법 1: DATABASE_URL 형식 확인 (가장 흔한 원인)

### 문제: 비밀번호에 특수문자가 있는 경우

PostgreSQL 연결 문자열에서 특수문자는 URL 인코딩이 필요합니다.

**특수문자 예시:**

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `/` → `%2F`
- `=` → `%3D`
- `?` → `%3F`
- `:` → `%3A`

### CentOS 7 서버에서 확인

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 현재 DATABASE_URL 확인 (비밀번호 부분만)
grep "DATABASE_URL" .env.production

# 예시:
# 잘못된 형식:
# DATABASE_URL=postgresql://postgres:MyP@ssw0rd!@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres

# 올바른 형식 (@ → %40, ! → %21):
# DATABASE_URL=postgresql://postgres:MyP%40ssw0rd%21@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres
```

### 비밀번호 URL 인코딩 스크립트

```bash
#!/bin/bash
# encode_password.sh - 비밀번호 URL 인코딩

# 비밀번호 입력 (예: MyP@ssw0rd!)
read -s -p "데이터베이스 비밀번호 입력: " PASSWORD
echo ""

# URL 인코딩
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))")

echo ""
echo "원본 비밀번호: $PASSWORD"
echo "인코딩된 비밀번호: $ENCODED"
echo ""
echo "DATABASE_URL에 사용할 전체 문자열:"
echo "postgresql://postgres:${ENCODED}@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres"
```

**실행:**

```bash
chmod +x encode_password.sh
./encode_password.sh
```

---

## 해결 방법 2: Connection Pooling 사용 (권장)

Supabase는 **Connection Pooling**을 사용하는 것을 강력히 권장합니다.

### Supabase 대시보드에서 설정

1. **Settings → Database** 메뉴 열기
2. **Connection Pooling** 섹션 찾기
3. **Connection string** 복사:

```bash
# Direct connection (포트 5432) - 제한적
postgresql://postgres:[PASSWORD]@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres

# Connection pooling (포트 6543) - 권장!
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 주요 차이점

| 구분      | Direct Connection  | Connection Pooling      |
| --------- | ------------------ | ----------------------- |
| 포트      | 5432               | **6543**                |
| 호스트    | db.xxx.supabase.co | **pooler.supabase.com** |
| 동시 연결 | 제한적 (3개)       | **많음 (100+)**         |
| 권장 여부 | ❌                 | ✅                      |

### .env.production 수정

```bash
vi .env.production
```

**변경:**

```bash
# 기존 (Direct)
DATABASE_URL=postgresql://postgres:비밀번호@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres

# 새로운 (Pooling) - 이것으로 변경!
DATABASE_URL=postgresql://postgres.udwsgljlxruvzmofirut:비밀번호@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

---

## 해결 방법 3: Supabase 프로젝트 상태 확인

### Supabase 대시보드 확인

1. https://supabase.com → 로그인
2. 프로젝트 목록에서 상태 확인:
   - ✅ **Active** - 정상
   - ⚠️ **Paused** - 일시 중지됨 (무료 플랜 7일 미사용)
   - ❌ **Inactive** - 비활성

### 일시 중지된 경우

1. 프로젝트 클릭
2. **Resume project** 버튼 클릭
3. 2-3분 대기 후 상태 **Active** 확인

---

## 해결 방법 4: 네트워크 연결 테스트

### CentOS 7 서버에서 테스트

```bash
# 1. DNS 해석 확인
nslookup db.udwsgljlxruvzmofirut.supabase.co

# 정상 출력 예시:
# Server:		168.126.63.1
# Address:	168.126.63.1#53
#
# Non-authoritative answer:
# Name:	db.udwsgljlxruvzmofirut.supabase.co
# Address: 54.180.123.456

# 2. 포트 연결 테스트 (5432)
telnet db.udwsgljlxruvzmofirut.supabase.co 5432

# 성공 시: "Connected to..."
# 실패 시: "Connection refused" 또는 timeout

# telnet 없으면 설치:
# sudo yum install -y telnet

# 3. Pooler 포트 테스트 (6543)
telnet aws-0-ap-northeast-2.pooler.supabase.com 6543

# 4. HTTPS 연결 테스트
curl -v https://udwsgljlxruvzmofirut.supabase.co

# 5. PostgreSQL 직접 연결 테스트 (psql 설치 필요)
psql "postgresql://postgres:비밀번호@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres" -c "SELECT 1"

# 성공 시:
#  ?column?
# ----------
#         1
# (1 row)
```

### 방화벽 확인

```bash
# 아웃바운드 방화벽 규칙 확인
sudo firewall-cmd --list-all

# 필요시 PostgreSQL 포트 허용
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --permanent --add-port=6543/tcp
sudo firewall-cmd --reload
```

---

## 해결 방법 5: Docker 네트워크 설정 확인

### Docker 컨테이너에서 연결 테스트

```bash
# 컨테이너 내부로 진입
docker exec -it apas-application sh

# DNS 테스트
nslookup db.udwsgljlxruvzmofirut.supabase.co

# 포트 테스트 (telnet 없으면 wget 사용)
wget --spider --timeout=10 https://udwsgljlxruvzmofirut.supabase.co

# 환경 변수 확인
echo $DATABASE_URL

# 컨테이너 나가기
exit
```

### Docker 네트워크 문제 해결

```bash
# Docker 네트워크 재생성
docker-compose down
docker network prune -f
docker-compose up -d
```

---

## 종합 해결 스크립트

모든 단계를 자동으로 체크하는 스크립트:

```bash
#!/bin/bash
# check_supabase_connection.sh

echo "========================================="
echo "Supabase 연결 진단 시작"
echo "========================================="
echo ""

# 1. .env 파일 확인
echo "1. .env 파일 확인..."
if [ -f .env ]; then
    echo "   ✅ .env 파일 존재"
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f 2-)
    if [ -n "$DATABASE_URL" ]; then
        echo "   ✅ DATABASE_URL 설정됨"
        # 호스트와 포트 추출
        HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        echo "   📌 호스트: $HOST"
        echo "   📌 포트: $PORT"
    else
        echo "   ❌ DATABASE_URL 없음"
        exit 1
    fi
else
    echo "   ❌ .env 파일 없음"
    exit 1
fi
echo ""

# 2. DNS 해석 테스트
echo "2. DNS 해석 테스트..."
if nslookup $HOST > /dev/null 2>&1; then
    echo "   ✅ DNS 해석 성공"
    IP=$(nslookup $HOST | grep "Address:" | tail -1 | awk '{print $2}')
    echo "   📌 IP: $IP"
else
    echo "   ❌ DNS 해석 실패"
fi
echo ""

# 3. 포트 연결 테스트
echo "3. 포트 연결 테스트..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "   ✅ 포트 $PORT 연결 성공"
else
    echo "   ❌ 포트 $PORT 연결 실패"
    echo "   💡 Connection Pooling (포트 6543) 사용을 권장합니다"
fi
echo ""

# 4. HTTPS 연결 테스트
echo "4. HTTPS 연결 테스트..."
PROJECT_REF=$(echo $HOST | cut -d '.' -f 1 | sed 's/db\.//')
if curl -s -o /dev/null -w "%{http_code}" "https://${PROJECT_REF}.supabase.co" | grep -q "200\|301\|302"; then
    echo "   ✅ HTTPS 연결 성공"
else
    echo "   ⚠️  HTTPS 연결 확인 필요"
fi
echo ""

# 5. Docker 컨테이너 상태
echo "5. Docker 컨테이너 상태..."
if docker ps | grep -q apas-application; then
    STATUS=$(docker ps --format "{{.Status}}" --filter "name=apas-application")
    echo "   📌 컨테이너 상태: $STATUS"
else
    echo "   ❌ 컨테이너 실행 중 아님"
fi
echo ""

# 6. PostgreSQL 연결 테스트 (선택)
echo "6. PostgreSQL 직접 연결 테스트..."
if command -v psql > /dev/null; then
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        echo "   ✅ PostgreSQL 연결 성공!"
    else
        echo "   ❌ PostgreSQL 연결 실패"
        echo "   💡 비밀번호 특수문자 URL 인코딩 확인 필요"
    fi
else
    echo "   ⚠️  psql 미설치 (선택 사항)"
fi
echo ""

echo "========================================="
echo "진단 완료"
echo "========================================="
echo ""
echo "💡 권장 사항:"
echo "1. Connection Pooling 사용 (포트 6543)"
echo "2. 비밀번호 특수문자 URL 인코딩"
echo "3. Supabase 프로젝트 Active 상태 확인"
echo ""
```

**실행:**

```bash
chmod +x check_supabase_connection.sh
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
./check_supabase_connection.sh
```

---

## 최종 해결 체크리스트

다음 순서대로 확인하세요:

### 1. Connection Pooling 사용 (가장 중요!)

- [ ] Supabase Dashboard → Settings → Database
- [ ] Connection Pooling 섹션에서 연결 문자열 복사
- [ ] 포트 **6543** 사용하는지 확인
- [ ] 호스트가 `pooler.supabase.com`인지 확인
- [ ] .env.production 업데이트

### 2. 비밀번호 URL 인코딩

- [ ] 비밀번호에 특수문자(`@`, `#`, `$`, 등) 있는지 확인
- [ ] 특수문자를 URL 인코딩 (`@` → `%40`)
- [ ] DATABASE_URL 업데이트

### 3. Supabase 프로젝트 상태

- [ ] Supabase Dashboard에서 프로젝트 상태 **Active** 확인
- [ ] Paused 상태면 **Resume** 클릭

### 4. 네트워크 연결

- [ ] `nslookup` 명령으로 DNS 해석 확인
- [ ] `telnet` 또는 `nc`로 포트 연결 확인
- [ ] 방화벽 아웃바운드 규칙 확인

### 5. Docker 재시작

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# .env 파일 업데이트
cp .env.production .env

# Docker 완전 재시작
docker-compose down
docker system prune -f
docker-compose up -d

# 로그 확인
docker-compose logs -f | grep -i "database\|prisma\|error"
```

---

## 예상 결과

모든 설정이 올바르면 다음과 같은 로그가 보입니다:

```
apas-application  | Prisma schema loaded from prisma/schema.prisma
apas-application  | Datasource "db": PostgreSQL database "postgres" at "pooler.supabase.com:6543"
apas-application  |
apas-application  | ✅ Database connected successfully
apas-application  | 🚀 Backend server started on port 4000
apas-application  | 🚀 Frontend server started on port 3000
```

연결 성공! 🎉
