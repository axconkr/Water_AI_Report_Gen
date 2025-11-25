#!/bin/bash
# ========================================
# CentOS 7 환경 변수 자동 설정 스크립트
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================="
echo "APAS 환경 변수 설정 스크립트"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"

# 백업 생성
if [ -f .env.production ]; then
    BACKUP_FILE=".env.production.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 기존 .env.production 백업 생성: $BACKUP_FILE"
    cp .env.production "$BACKUP_FILE"
    echo ""
fi

# 예제 파일 복사
if [ ! -f .env.production.example ]; then
    echo "❌ 오류: .env.production.example 파일이 없습니다."
    exit 1
fi

echo "📄 .env.production.example에서 새 파일 생성 중..."
cp .env.production.example .env.production
echo ""

# JWT 시크릿 자동 생성
echo "🔐 JWT 시크릿 생성 중..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# sed로 값 치환
sed -i.tmp "s|your_very_strong_jwt_secret_min_32_characters_long_here|$JWT_SECRET|g" .env.production
sed -i.tmp "s|your_very_strong_refresh_secret_min_32_characters_long_here|$JWT_REFRESH_SECRET|g" .env.production
rm -f .env.production.tmp

echo "✅ JWT_SECRET 생성 완료"
echo "✅ JWT_REFRESH_SECRET 생성 완료"
echo ""

# Gemini API 키 자동 설정
echo "🤖 AI API 키 설정 중..."
sed -i.tmp "s|your_gemini_api_key_here|AIzaSyCiaGcHqn69onapYYmdnj8g69ZhmeBZDqs|g" .env.production
rm -f .env.production.tmp
echo "✅ GEMINI_API_KEY 설정 완료"
echo ""

# 파일 권한 설정
chmod 600 .env.production
echo "🔒 파일 권한을 600으로 설정했습니다."
echo ""

# 완료 메시지
echo "========================================="
echo "✅ 기본 설정이 완료되었습니다!"
echo "========================================="
echo ""
echo "⚠️  다음 값들을 수동으로 입력해야 합니다:"
echo ""
echo "1. Supabase 설정 (필수) - Supabase 대시보드에서 확인"
echo "   - DATABASE_URL"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "2. Anthropic API 키 (필수)"
echo "   - ANTHROPIC_API_KEY"
echo ""
echo "3. 선택 사항"
echo "   - OPENAI_API_KEY"
echo "   - OPENCHAT_API_URL"
echo ""
echo "========================================="
echo "다음 명령으로 파일을 편집하세요:"
echo "  vi .env.production"
echo ""
echo "또는:"
echo "  nano .env.production"
echo "========================================="
echo ""
echo "편집 후 다음 명령으로 Docker 컨테이너를 재시작하세요:"
echo "  docker-compose down"
echo "  docker-compose up -d"
echo ""
echo "상태 확인:"
echo "  docker-compose ps"
echo "  docker-compose logs -f"
echo ""
