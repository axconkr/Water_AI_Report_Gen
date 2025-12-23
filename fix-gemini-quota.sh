#!/bin/bash
# Gemini 할당량 문제 해결 - Claude API로 전환

set -e

echo "=========================================="
echo "  Gemini 할당량 문제 해결"
echo "  Claude API로 전환"
echo "=========================================="
echo ""

REPO_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"

if [ ! -d "$REPO_DIR" ]; then
  REPO_DIR="."
fi

cd "$REPO_DIR"

# 1. 최신 코드 가져오기
echo "1️⃣ GitHub에서 최신 코드 가져오기..."
git stash
git pull origin main
echo "   ✅ Git pull 완료"
echo ""

# 2. .env 파일에 AI_PROVIDER 추가
echo "2️⃣ .env 파일 업데이트 중..."

if [ -f .env ]; then
  # AI_PROVIDER 추가/업데이트
  if grep -q "^AI_PROVIDER=" .env; then
    sed -i.bak 's/^AI_PROVIDER=.*/AI_PROVIDER=claude/' .env
    echo "   ✅ AI_PROVIDER 업데이트: claude"
  else
    echo "" >> .env
    echo "# AI Provider Selection (claude or gemini)" >> .env
    echo "AI_PROVIDER=claude" >> .env
    echo "   ✅ AI_PROVIDER 추가: claude"
  fi

  # 백업 파일 제거
  rm -f .env.bak

  echo ""
  echo "   📋 현재 AI 설정:"
  grep -E "^(AI_PROVIDER|ANTHROPIC_API_KEY|GEMINI_API_KEY)=" .env | sed 's/=.*$/=***/' || echo "   ⚠️  AI 설정을 찾을 수 없습니다"
else
  echo "   ❌ .env 파일이 없습니다!"
  exit 1
fi
echo ""

# 3. ANTHROPIC_API_KEY 확인
echo "3️⃣ Claude API 키 확인..."
if grep -q "^ANTHROPIC_API_KEY=.\+" .env; then
  echo "   ✅ ANTHROPIC_API_KEY 설정됨"
elif grep -q "^CLAUDE_API_KEY=.\+" .env; then
  echo "   ✅ CLAUDE_API_KEY 설정됨"
else
  echo "   ❌ ANTHROPIC_API_KEY 또는 CLAUDE_API_KEY가 설정되지 않았습니다!"
  echo ""
  echo "   다음 중 하나를 .env 파일에 추가하세요:"
  echo "   ANTHROPIC_API_KEY=sk-ant-api03-..."
  echo "   또는"
  echo "   CLAUDE_API_KEY=sk-ant-api03-..."
  echo ""
  read -p "   계속하시겠습니까? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
echo ""

# 4. Docker 재빌드
echo "4️⃣ Docker 컨테이너 재빌드 중..."
docker-compose down
echo "   - 컨테이너 중지 완료"

docker-compose build --no-cache
echo "   - 이미지 재빌드 완료"

docker-compose up -d
echo "   - 컨테이너 시작 완료"
echo ""

# 5. 시작 대기
echo "5️⃣ 서비스 시작 대기 중 (30초)..."
sleep 30

# 6. 헬스체크
echo ""
echo "6️⃣ 서비스 상태 확인..."

if curl -f -s http://localhost:8021/api/v1/health > /dev/null 2>&1; then
  echo "   ✅ 백엔드 서버 정상 (Port 8021)"
else
  echo "   ⚠️  백엔드 서버 응답 없음"
fi

if curl -f -s http://localhost:8020 > /dev/null 2>&1; then
  echo "   ✅ 프론트엔드 서버 정상 (Port 8020)"
else
  echo "   ⚠️  프론트엔드 서버 응답 없음"
fi
echo ""

# 7. 로그에서 AI Provider 확인
echo "7️⃣ AI Provider 초기화 로그 확인..."
docker-compose logs apas 2>&1 | grep -i "claude\|gemini" | tail -5
echo ""

# 완료
echo "=========================================="
echo "  ✅ 수정 완료!"
echo "=========================================="
echo ""
echo "📌 변경 사항:"
echo "   - AI Provider: Gemini → Claude"
echo "   - 문서 분석: 이제 Claude API 사용"
echo "   - Gemini 429 에러 해결됨"
echo ""
echo "💡 테스트 방법:"
echo "   1. 브라우저에서 로그인: http://1.236.245.110:8020/auth/login"
echo "   2. 프로젝트 생성 및 문서 업로드"
echo "   3. 문서 분석 실행"
echo ""
echo "📊 실시간 로그 확인:"
echo "   docker-compose logs -f apas"
echo ""
echo "🔧 디버깅 (에러 발생 시):"
echo "   bash debug-error.sh"
echo ""
