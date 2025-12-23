#!/bin/bash
# CentOS 원격 서버에서 JWT 설정 업데이트 및 배포 스크립트

set -e

echo "=========================================="
echo "  APAS JWT 토큰 설정 업데이트 배포"
echo "=========================================="
echo ""

# 설정
REPO_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"
BACKUP_DIR="/home/centos/SHINHWA_AI/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📂 작업 디렉토리: $REPO_DIR"
echo "💾 백업 디렉토리: $BACKUP_DIR"
echo ""

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 1. 현재 .env 파일 백업
echo "1️⃣ 현재 설정 백업 중..."
if [ -f "$REPO_DIR/.env" ]; then
  cp "$REPO_DIR/.env" "$BACKUP_DIR/.env.backup.$TIMESTAMP"
  echo "   ✅ .env 파일 백업 완료: $BACKUP_DIR/.env.backup.$TIMESTAMP"
else
  echo "   ⚠️  .env 파일이 없습니다."
fi

# 2. Git pull
echo ""
echo "2️⃣ 최신 코드 가져오기 (git pull)..."
cd "$REPO_DIR"
git stash  # 로컬 변경사항 임시 저장
git pull origin main
echo "   ✅ Git pull 완료"

# 3. .env 파일 업데이트
echo ""
echo "3️⃣ .env 파일 업데이트 중..."
if [ -f "$REPO_DIR/.env" ]; then
  # JWT_EXPIRES_IN 추가/업데이트
  if grep -q "^JWT_EXPIRES_IN=" "$REPO_DIR/.env"; then
    sed -i.bak 's/^JWT_EXPIRES_IN=.*/JWT_EXPIRES_IN=365d/' "$REPO_DIR/.env"
    echo "   ✅ JWT_EXPIRES_IN 업데이트: 365d"
  else
    echo "" >> "$REPO_DIR/.env"
    echo "# JWT Token Expiration" >> "$REPO_DIR/.env"
    echo "JWT_EXPIRES_IN=365d" >> "$REPO_DIR/.env"
    echo "   ✅ JWT_EXPIRES_IN 추가: 365d"
  fi

  # REFRESH_TOKEN_EXPIRES_IN 추가/업데이트
  if grep -q "^REFRESH_TOKEN_EXPIRES_IN=" "$REPO_DIR/.env"; then
    sed -i.bak 's/^REFRESH_TOKEN_EXPIRES_IN=.*/REFRESH_TOKEN_EXPIRES_IN=365d/' "$REPO_DIR/.env"
    echo "   ✅ REFRESH_TOKEN_EXPIRES_IN 업데이트: 365d"
  else
    echo "REFRESH_TOKEN_EXPIRES_IN=365d" >> "$REPO_DIR/.env"
    echo "   ✅ REFRESH_TOKEN_EXPIRES_IN 추가: 365d"
  fi

  # 백업 파일 제거
  rm -f "$REPO_DIR/.env.bak"
else
  echo "   ❌ .env 파일이 없습니다. .env.example을 복사하세요."
  exit 1
fi

# 4. Docker 컨테이너 중지
echo ""
echo "4️⃣ Docker 컨테이너 중지 중..."
cd "$REPO_DIR"
docker-compose down
echo "   ✅ 컨테이너 중지 완료"

# 5. Docker 이미지 재빌드 (캐시 없이)
echo ""
echo "5️⃣ Docker 이미지 재빌드 중 (캐시 없이)..."
docker-compose build --no-cache
echo "   ✅ 이미지 빌드 완료"

# 6. Docker 컨테이너 시작
echo ""
echo "6️⃣ Docker 컨테이너 시작 중..."
docker-compose up -d
echo "   ✅ 컨테이너 시작 완료"

# 7. 시작 대기
echo ""
echo "7️⃣ 서비스 초기화 대기 중..."
echo "   ⏳ 30초 대기..."
for i in {30..1}; do
  echo -ne "   ⏱️  $i 초 남음...\r"
  sleep 1
done
echo ""

# 8. 헬스체크
echo ""
echo "8️⃣ 서비스 상태 확인 중..."

# 백엔드 헬스체크
if curl -f -s http://localhost:8021/api/v1/health > /dev/null 2>&1; then
  echo "   ✅ 백엔드 서버 정상 (Port 8021)"
else
  echo "   ⚠️  백엔드 서버 응답 없음"
fi

# 프론트엔드 헬스체크
if curl -f -s http://localhost:8020 > /dev/null 2>&1; then
  echo "   ✅ 프론트엔드 서버 정상 (Port 8020)"
else
  echo "   ⚠️  프론트엔드 서버 응답 없음"
fi

# 9. 로그 확인
echo ""
echo "9️⃣ 최근 로그 확인..."
docker-compose logs --tail=20 apas

# 완료 메시지
echo ""
echo "=========================================="
echo "  ✅ 배포 완료!"
echo "=========================================="
echo ""
echo "📌 변경 사항:"
echo "   - JWT Access Token 만료: 1h → 365d"
echo "   - JWT Refresh Token 만료: 7d → 365d"
echo ""
echo "💡 중요 사항:"
echo "   - 기존 토큰은 무효화되었습니다"
echo "   - 모든 사용자는 다시 로그인해야 합니다"
echo ""
echo "🌐 접속 URL:"
echo "   - 프론트엔드: http://1.236.245.110:8020"
echo "   - 백엔드 API: http://1.236.245.110:8021/api/v1"
echo "   - 로그인 페이지: http://1.236.245.110:8020/auth/login"
echo ""
echo "📊 로그 실시간 확인:"
echo "   docker-compose logs -f apas"
echo ""
echo "🔄 롤백이 필요한 경우:"
echo "   cp $BACKUP_DIR/.env.backup.$TIMESTAMP $REPO_DIR/.env"
echo "   docker-compose down && docker-compose up -d --build"
echo ""
