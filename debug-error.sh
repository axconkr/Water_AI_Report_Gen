#!/bin/bash
# 500 에러 디버깅 스크립트

echo "🔍 APAS 에러 디버깅 시작..."
echo "=========================================="
echo ""

REPO_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"

if [ ! -d "$REPO_DIR" ]; then
  REPO_DIR="."
fi

cd "$REPO_DIR"

# 1. Docker 컨테이너 상태 확인
echo "1️⃣ Docker 컨테이너 상태:"
docker-compose ps
echo ""

# 2. 백엔드 최근 로그 확인 (에러 필터링)
echo "2️⃣ 백엔드 에러 로그 (최근 50줄):"
docker-compose logs --tail=50 apas 2>&1 | grep -i "error\|exception\|fail" || echo "에러 로그 없음"
echo ""

# 3. 전체 백엔드 로그 (최근 100줄)
echo "3️⃣ 백엔드 전체 로그 (최근 100줄):"
docker-compose logs --tail=100 apas
echo ""

# 4. 환경변수 확인
echo "4️⃣ 환경변수 확인:"
echo "GEMINI_API_KEY: $(docker-compose exec -T apas sh -c 'echo ${GEMINI_API_KEY:0:20}...' 2>/dev/null || echo '확인 불가')"
echo "DATABASE_URL: $(docker-compose exec -T apas sh -c 'echo ${DATABASE_URL:0:30}...' 2>/dev/null || echo '확인 불가')"
echo ""

# 5. 백엔드 서버 프로세스 확인
echo "5️⃣ 백엔드 프로세스 확인:"
docker-compose exec -T apas ps aux 2>/dev/null || echo "프로세스 확인 불가"
echo ""

# 6. 데이터베이스 연결 테스트
echo "6️⃣ 데이터베이스 연결 테스트:"
docker-compose exec -T postgres pg_isready -U apas 2>/dev/null && echo "✅ PostgreSQL 정상" || echo "❌ PostgreSQL 연결 실패"
echo ""

# 7. API 헬스체크
echo "7️⃣ API 헬스체크:"
curl -s http://localhost:8021/api/v1/health | jq . 2>/dev/null || curl -s http://localhost:8021/api/v1/health || echo "API 응답 없음"
echo ""

# 8. 파일 시스템 확인
echo "8️⃣ 업로드 디렉토리 확인:"
docker-compose exec -T apas ls -la /app/uploads 2>/dev/null || echo "디렉토리 확인 불가"
echo ""

# 9. 네트워크 연결 확인
echo "9️⃣ 네트워크 연결 확인:"
docker network ls | grep apas
echo ""

# 10. 디스크 공간 확인
echo "🔟 디스크 공간 확인:"
df -h | grep -E "Filesystem|/$|/home"
echo ""

echo "=========================================="
echo "✅ 디버깅 정보 수집 완료"
echo ""
echo "💡 다음 단계:"
echo "   1. 위 로그에서 'error', 'exception' 키워드 확인"
echo "   2. GEMINI_API_KEY 설정 확인"
echo "   3. 데이터베이스 연결 상태 확인"
echo ""
echo "📋 실시간 로그 모니터링:"
echo "   docker-compose logs -f apas"
echo ""
