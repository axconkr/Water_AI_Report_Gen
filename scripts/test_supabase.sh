#!/bin/bash
# Supabase 연결 테스트 스크립트

echo "========================================="
echo "Supabase 연결 진단 스크립트"
echo "========================================="
echo ""

# 변수 설정
HOST="db.udwsgljlxruvzmofirut.supabase.co"
PORT="5432"
PROJECT_URL="https://udwsgljlxruvzmofirut.supabase.co"

# 1. DNS 테스트
echo "1️⃣  DNS 해석 테스트..."
if nslookup $HOST > /dev/null 2>&1; then
    IP=$(nslookup $HOST 2>/dev/null | grep -A1 "Name:" | grep "Address:" | tail -1 | awk '{print $2}')
    echo "   ✅ DNS 해석 성공"
    echo "   📌 호스트: $HOST"
    echo "   📌 IP 주소: $IP"
else
    echo "   ❌ DNS 해석 실패"
    echo "   💡 인터넷 연결을 확인하세요"
fi
echo ""

# 2. HTTPS 연결 테스트
echo "2️⃣  Supabase HTTPS 연결 테스트..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$PROJECT_URL" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ HTTPS 연결 성공 (HTTP $HTTP_CODE)"
    echo "   💡 Supabase 프로젝트가 Active 상태입니다"
else
    echo "   ❌ HTTPS 연결 실패 (HTTP $HTTP_CODE)"
    echo "   💡 Supabase 대시보드에서 프로젝트 상태를 확인하세요"
    echo "   💡 프로젝트가 Paused 상태일 수 있습니다"
fi
echo ""

# 3. PostgreSQL 포트 연결 테스트
echo "3️⃣  PostgreSQL 포트 연결 테스트..."
if timeout 10 bash -c "cat < /dev/null > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "   ✅ 포트 $PORT 연결 성공"
else
    echo "   ❌ 포트 $PORT 연결 실패"
    echo "   💡 가능한 원인:"
    echo "      - Supabase 프로젝트가 일시 중지됨"
    echo "      - 방화벽에서 아웃바운드 차단"
    echo "      - 네트워크 문제"
fi
echo ""

# 4. PostgreSQL 직접 연결 테스트 (psql 있는 경우)
echo "4️⃣  PostgreSQL 직접 연결 테스트..."
if command -v psql > /dev/null; then
    echo "   ⏳ 연결 시도 중... (최대 10초)"
    if timeout 10 psql "postgresql://postgres:%40%21Chaos0804@$HOST:$PORT/postgres" -c "SELECT version();" 2>/dev/null; then
        echo "   ✅ PostgreSQL 연결 성공!"
        psql "postgresql://postgres:%40%21Chaos0804@$HOST:$PORT/postgres" -c "SELECT version();" 2>/dev/null | head -3
    else
        echo "   ❌ PostgreSQL 연결 실패"
        echo "   💡 가능한 원인:"
        echo "      - 비밀번호 오류"
        echo "      - 데이터베이스 서버 중지됨"
    fi
else
    echo "   ⚠️  psql 설치되지 않음"
    echo "   💡 설치: sudo yum install -y postgresql"
fi
echo ""

# 5. Docker 컨테이너에서 연결 테스트
echo "5️⃣  Docker 컨테이너에서 연결 테스트..."
if docker ps -q -f name=apas-application > /dev/null 2>&1; then
    echo "   ⏳ 컨테이너 내부에서 테스트 중..."

    # DNS 테스트
    if docker exec apas-application nslookup $HOST > /dev/null 2>&1; then
        echo "   ✅ 컨테이너 DNS 해석 성공"
    else
        echo "   ❌ 컨테이너 DNS 해석 실패"
    fi

    # 환경 변수 확인
    DB_URL=$(docker exec apas-application printenv DATABASE_URL 2>/dev/null)
    if [ -n "$DB_URL" ]; then
        echo "   ✅ DATABASE_URL 환경 변수 설정됨"
        echo "   📌 ${DB_URL:0:50}..."
    else
        echo "   ❌ DATABASE_URL 환경 변수 없음"
    fi
else
    echo "   ⚠️  apas-application 컨테이너 실행 중 아님"
fi
echo ""

# 6. Supabase API 테스트
echo "6️⃣  Supabase REST API 테스트..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "${PROJECT_URL}/rest/v1/" 2>/dev/null)
if [ "$API_TEST" = "200" ] || [ "$API_TEST" = "401" ] || [ "$API_TEST" = "403" ]; then
    echo "   ✅ Supabase API 응답 (HTTP $API_TEST)"
    echo "   💡 Supabase 서비스가 정상 작동 중"
else
    echo "   ❌ Supabase API 무응답 (HTTP $API_TEST)"
fi
echo ""

# 7. 방화벽 확인
echo "7️⃣  방화벽 상태 확인..."
if command -v firewall-cmd > /dev/null; then
    if sudo firewall-cmd --state 2>/dev/null | grep -q "running"; then
        echo "   ℹ️  방화벽 실행 중"
        # 아웃바운드는 기본적으로 허용되므로 특별한 설정 불필요
        echo "   💡 아웃바운드 연결은 일반적으로 허용됨"
    else
        echo "   ℹ️  방화벽 중지됨"
    fi
else
    echo "   ℹ️  firewall-cmd 없음"
fi
echo ""

# 진단 결과 요약
echo "========================================="
echo "진단 결과 요약"
echo "========================================="
echo ""

# 문제 확인
if timeout 10 bash -c "cat < /dev/null > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "✅ 네트워크 연결: 정상"
    echo ""
    echo "💡 다음 사항을 확인하세요:"
    echo "   1. Supabase Dashboard에서 프로젝트 상태 확인"
    echo "   2. 비밀번호가 정확한지 확인: @!Chaos0804"
    echo "   3. DATABASE_URL 형식 확인"
    echo ""
    echo "📋 올바른 DATABASE_URL:"
    echo "   postgresql://postgres:%40%21Chaos0804@db.udwsgljlxruvzmofirut.supabase.co:5432/postgres"
else
    echo "❌ 네트워크 연결: 실패"
    echo ""
    echo "🔧 해결 방법:"
    echo ""
    echo "1️⃣  Supabase 프로젝트 상태 확인"
    echo "   - https://supabase.com 로그인"
    echo "   - 프로젝트 목록에서 상태 확인"
    echo "   - 'Paused' 상태면 'Resume' 클릭"
    echo ""
    echo "2️⃣  네트워크 연결 확인"
    echo "   - ping google.com"
    echo "   - curl https://supabase.com"
    echo ""
    echo "3️⃣  PostgreSQL 설치 후 직접 테스트"
    echo "   - sudo yum install -y postgresql"
    echo "   - psql \"postgresql://postgres:%40%21Chaos0804@$HOST:$PORT/postgres\" -c \"SELECT 1\""
fi
echo ""
echo "========================================="
