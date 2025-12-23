#!/bin/bash
# 빠른 배포 스크립트 - GitHub에서 최신 코드 받아서 배포

set -e

echo "🚀 빠른 배포 시작..."
echo ""

# 현재 디렉토리 확인
REPO_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"

if [ ! -d "$REPO_DIR" ]; then
  echo "❌ 프로젝트 디렉토리를 찾을 수 없습니다: $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"

# 1. 현재 브랜치 및 상태 확인
echo "📌 현재 Git 상태:"
git branch
git status --short
echo ""

# 2. 로컬 변경사항 확인
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  로컬 변경사항이 있습니다. 임시 저장합니다..."
  git stash save "Auto-stash before deploy $(date +%Y%m%d_%H%M%S)"
  echo "   ✅ 변경사항 임시 저장 완료"
  STASHED=true
else
  echo "✅ 로컬 변경사항 없음"
  STASHED=false
fi
echo ""

# 3. GitHub에서 최신 변경사항 확인
echo "🔍 원격 저장소 최신 상태 확인..."
git fetch origin

# 변경사항 있는지 확인
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ 이미 최신 상태입니다. 변경사항이 없습니다."

  if [ "$STASHED" = true ]; then
    echo "   복원할 stash가 있습니다: git stash pop"
  fi

  exit 0
fi

echo "📥 새로운 변경사항이 있습니다:"
git log HEAD..origin/main --oneline
echo ""

# 4. Git Pull
echo "⬇️  최신 코드 가져오기 (git pull)..."
git pull origin main
echo "   ✅ Git pull 완료"
echo ""

# 5. Docker 재시작
echo "🐳 Docker 컨테이너 재시작 중..."

# 컨테이너 중지
echo "   - 컨테이너 중지 중..."
docker-compose down

# 이미지 재빌드
echo "   - 이미지 재빌드 중..."
docker-compose build

# 컨테이너 시작
echo "   - 컨테이너 시작 중..."
docker-compose up -d

echo "   ✅ Docker 재시작 완료"
echo ""

# 6. 시작 대기
echo "⏳ 서비스 시작 대기 중 (15초)..."
sleep 15

# 7. 헬스체크
echo "🏥 서비스 상태 확인..."

if curl -f -s http://localhost:8021/api/v1/health > /dev/null 2>&1; then
  echo "   ✅ 백엔드 서버 정상 (Port 8021)"
else
  echo "   ⚠️  백엔드 서버 응답 없음 (Port 8021)"
fi

if curl -f -s http://localhost:8020 > /dev/null 2>&1; then
  echo "   ✅ 프론트엔드 서버 정상 (Port 8020)"
else
  echo "   ⚠️  프론트엔드 서버 응답 없음 (Port 8020)"
fi
echo ""

# 8. Stash 복원 안내
if [ "$STASHED" = true ]; then
  echo "💡 임시 저장한 변경사항이 있습니다."
  echo "   복원하려면: git stash pop"
  echo "   확인하려면: git stash list"
  echo ""
fi

# 9. 최근 로그
echo "📋 최근 로그 (20줄):"
docker-compose logs --tail=20 apas
echo ""

# 완료
echo "=========================================="
echo "  ✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 서비스 URL:"
echo "   - 프론트엔드: http://1.236.245.110:8020"
echo "   - 백엔드 API: http://1.236.245.110:8021/api/v1"
echo ""
echo "📊 실시간 로그 확인:"
echo "   docker-compose logs -f apas"
echo ""
