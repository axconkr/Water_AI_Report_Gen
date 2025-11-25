#!/bin/bash
# Supabase 간단 연결 테스트 (PostgreSQL 클라이언트 없이)

echo "========================================="
echo "Supabase 연결 테스트 (간단 버전)"
echo "========================================="
echo ""

# 변수 설정
HOST="db.fcyrxpffqxaxxhxqpebw.supabase.co"
PORT="5432"
PROJECT_URL="https://fcyrxpffqxaxxhxqpebw.supabase.co"

# 1. 인터넷 연결 테스트
echo "1️⃣  인터넷 연결 테스트..."
if ping -c 2 8.8.8.8 > /dev/null 2>&1; then
    echo "   ✅ 인터넷 연결 정상"
else
    echo "   ❌ 인터넷 연결 실패"
    exit 1
fi
echo ""

# 2. DNS 해석 테스트
echo "2️⃣  DNS 해석 테스트..."
if nslookup $HOST > /dev/null 2>&1; then
    IP=$(nslookup $HOST 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    echo "   ✅ DNS 해석 성공"
    echo "   📌 $HOST → $IP"
else
    echo "   ❌ DNS 해석 실패"
    exit 1
fi
echo ""

# 3. Supabase 프로젝트 HTTPS 테스트
echo "3️⃣  Supabase 프로젝트 상태 확인..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$PROJECT_URL" 2>/dev/null)
echo "   HTTP 응답 코드: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ Supabase 프로젝트 Active"
    echo "   💡 프로젝트가 정상 작동 중입니다"
elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    echo "   ❌ Supabase 프로젝트 응답 없음"
    echo "   💡 프로젝트가 Paused 상태이거나 네트워크 문제입니다"
    echo ""
    echo "🔧 해결 방법:"
    echo "   1. https://supabase.com 로그인"
    echo "   2. 프로젝트 찾기: fcyrxpffqxaxxhxqpebw"
    echo "   3. 상태가 'Paused'이면 'Resume' 클릭"
    exit 1
else
    echo "   ⚠️  예상치 못한 응답: $HTTP_CODE"
fi
echo ""

# 4. PostgreSQL 포트 연결 테스트
echo "4️⃣  PostgreSQL 포트 연결 테스트..."
if timeout 10 bash -c "echo > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "   ✅ 포트 $PORT 연결 성공"
    echo "   💡 데이터베이스 서버가 응답하고 있습니다"
else
    echo "   ❌ 포트 $PORT 연결 실패"
    echo ""
    echo "🔧 가능한 원인:"
    echo "   1. Supabase 프로젝트가 일시 중지됨 (가장 가능성 높음)"
    echo "   2. 방화벽에서 아웃바운드 PostgreSQL 포트 차단"
    echo "   3. Supabase 서버 일시적 문제"
    echo ""
    echo "📋 확인 사항:"
    echo "   - Supabase Dashboard에서 프로젝트 상태 확인"
    echo "   - 프로젝트 Settings → Database → Connection info 확인"
    exit 1
fi
echo ""

# 5. Supabase REST API 테스트
echo "5️⃣  Supabase REST API 테스트..."
API_URL="${PROJECT_URL}/rest/v1/"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$API_URL" 2>/dev/null)
echo "   API 응답 코드: $API_CODE"

if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "401" ] || [ "$API_CODE" = "403" ]; then
    echo "   ✅ Supabase API 정상 작동"
else
    echo "   ⚠️  Supabase API 응답 없음"
fi
echo ""

# 6. Docker 환경 변수 확인
echo "6️⃣  Docker 환경 변수 확인..."
if docker ps -q -f name=apas-application > /dev/null 2>&1; then
    DB_URL=$(docker exec apas-application printenv DATABASE_URL 2>/dev/null | head -c 80)
    if [ -n "$DB_URL" ]; then
        echo "   ✅ DATABASE_URL 설정됨"
        echo "   📌 ${DB_URL}..."
    else
        echo "   ❌ DATABASE_URL 환경 변수 없음"
    fi
else
    echo "   ⚠️  apas-application 컨테이너 실행 중 아님"
fi
echo ""

# 7. .env 파일 확인
echo "7️⃣  .env 파일 확인..."
if [ -f .env ]; then
    if grep -q "^DATABASE_URL=" .env; then
        DB_URL_FILE=$(grep "^DATABASE_URL=" .env | head -c 80)
        echo "   ✅ .env 파일에 DATABASE_URL 존재"
        echo "   📌 ${DB_URL_FILE}..."
    else
        echo "   ❌ .env 파일에 DATABASE_URL 없음"
    fi
else
    echo "   ❌ .env 파일 없음"
fi
echo ""

# 진단 결과
echo "========================================="
echo "진단 결과"
echo "========================================="
echo ""

# 포트 연결 재확인
if timeout 10 bash -c "echo > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "✅ 네트워크 연결: 정상"
    echo "✅ Supabase 데이터베이스: 응답 중"
    echo ""
    echo "💡 Docker 컨테이너가 연결 실패하는 경우:"
    echo "   1. DATABASE_URL 형식 확인"
    echo "   2. 비밀번호 URL 인코딩 확인 (@!Chaos0804 → %40%21Chaos0804)"
    echo "   3. Docker 재시작"
    echo ""
    echo "📋 올바른 DATABASE_URL:"
    echo "postgresql://postgres:%40%21Chaos0804@db.fcyrxpffqxaxxhxqpebw.supabase.co:5432/postgres"
    echo ""
    echo "🔧 Docker 재시작 명령:"
    echo "   cp .env.production .env"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
else
    echo "❌ 네트워크 연결: 실패"
    echo "❌ Supabase 데이터베이스: 응답 없음"
    echo ""
    echo "🚨 문제: Supabase 프로젝트가 일시 중지되었을 가능성이 높습니다"
    echo ""
    echo "📋 해결 방법:"
    echo ""
    echo "1️⃣  Supabase Dashboard에서 프로젝트 재개"
    echo "   a. 브라우저에서 https://supabase.com 접속"
    echo "   b. 로그인"
    echo "   c. 프로젝트 목록에서 'fcyrxpffqxaxxhxqpebw' 찾기"
    echo "   d. 프로젝트 상태 확인:"
    echo "      - ✅ Active: 정상 (다른 문제)"
    echo "      - ⚠️  Paused: 일시 중지됨 → 'Resume project' 클릭"
    echo "      - ❌ Inactive: 비활성 → 'Restore project' 클릭"
    echo "   e. 프로젝트 재개 후 2-3분 대기"
    echo "   f. 이 스크립트 다시 실행"
    echo ""
    echo "2️⃣  프로젝트가 Active인데도 연결 안 되는 경우"
    echo "   a. Supabase Status 확인: https://status.supabase.com"
    echo "   b. 서버 재부팅 시도"
    echo "   c. Supabase Support 문의"
fi
echo ""
echo "========================================="
