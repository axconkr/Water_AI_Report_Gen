#!/bin/bash
# JWT 토큰 시간 제한 제거 업데이트 스크립트

set -e

echo "🔧 JWT 토큰 설정 업데이트 중..."

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 작업 디렉토리: $SCRIPT_DIR"

# .env 파일 업데이트
if [ -f .env ]; then
  echo "✏️  .env 파일 업데이트 중..."

  # JWT_EXPIRES_IN 추가 또는 업데이트
  if grep -q "^JWT_EXPIRES_IN=" .env; then
    sed -i.bak 's/^JWT_EXPIRES_IN=.*/JWT_EXPIRES_IN=365d/' .env
    echo "   - JWT_EXPIRES_IN 업데이트 완료"
  else
    echo "JWT_EXPIRES_IN=365d" >> .env
    echo "   - JWT_EXPIRES_IN 추가 완료"
  fi

  # REFRESH_TOKEN_EXPIRES_IN 추가 또는 업데이트
  if grep -q "^REFRESH_TOKEN_EXPIRES_IN=" .env; then
    sed -i.bak 's/^REFRESH_TOKEN_EXPIRES_IN=.*/REFRESH_TOKEN_EXPIRES_IN=365d/' .env
    echo "   - REFRESH_TOKEN_EXPIRES_IN 업데이트 완료"
  else
    echo "REFRESH_TOKEN_EXPIRES_IN=365d" >> .env
    echo "   - REFRESH_TOKEN_EXPIRES_IN 추가 완료"
  fi

  echo "✅ .env 파일 업데이트 완료"
else
  echo "⚠️  .env 파일이 없습니다. .env.example을 복사하세요."
  exit 1
fi

# Docker 컨테이너 재시작
echo ""
echo "🐳 Docker 컨테이너 재시작 중..."
docker-compose down
echo "   - 컨테이너 중지 완료"

docker-compose build --no-cache
echo "   - 이미지 재빌드 완료"

docker-compose up -d
echo "   - 컨테이너 시작 완료"

# 시작 대기
echo ""
echo "⏳ 서비스 시작 대기 중... (30초)"
sleep 30

# 헬스 체크
echo ""
echo "🏥 서비스 상태 확인 중..."
if curl -f -s http://localhost:8021/api/v1/health > /dev/null; then
  echo "✅ 백엔드 서버 정상 동작"
else
  echo "⚠️  백엔드 서버 응답 없음"
fi

if curl -f -s http://localhost:8020 > /dev/null; then
  echo "✅ 프론트엔드 서버 정상 동작"
else
  echo "⚠️  프론트엔드 서버 응답 없음"
fi

echo ""
echo "✅ JWT 토큰 설정 업데이트 완료!"
echo "📌 토큰 만료 시간: 365일 (1년)"
echo ""
echo "💡 기존 사용자는 다시 로그인해야 새로운 토큰을 받을 수 있습니다."
echo "   로그인 페이지: http://1.236.245.110:8020/auth/login"
