#!/bin/bash

# APAS 원격 서버 배포 스크립트
# Usage: ./deploy.sh

set -e

# 원격 서버 정보
REMOTE_USER="centos"
REMOTE_HOST="1.236.245.110"
REMOTE_PORT="2444"
REMOTE_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"

echo "🚀 APAS 원격 서버 배포 시작..."

# 1. 필수 파일 존재 확인
echo "📋 필수 파일 확인 중..."
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다!"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일이 없습니다!"
    exit 1
fi

# 2. 원격 서버에 파일 복사
echo "📤 원격 서버로 파일 전송 중..."
scp -P ${REMOTE_PORT} .env ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/.env
scp -P ${REMOTE_PORT} docker-compose.yml ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/docker-compose.yml

# 3. 전체 프로젝트 파일 동기화 (rsync 사용)
echo "🔄 프로젝트 파일 동기화 중..."
rsync -avz -e "ssh -p ${REMOTE_PORT}" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude 'uploads' \
  --exclude 'logs' \
  --exclude '.env.local' \
  --exclude 'DB' \
  . ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# 4. 원격 서버에서 Docker 재배포
echo "🐳 Docker 컨테이너 재배포 중..."
ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

echo "🛑 기존 컨테이너 중지 및 제거..."
sudo docker-compose down -v

echo "🔨 Docker 이미지 재빌드..."
sudo docker-compose build --no-cache

echo "▶️  컨테이너 시작..."
sudo docker-compose up -d

echo "⏳ 컨테이너 시작 대기 중..."
sleep 10

echo "📊 컨테이너 상태 확인..."
sudo docker-compose ps

echo "✅ 배포 완료!"
echo ""
echo "🌐 서비스 URL:"
echo "   Frontend: http://1.236.245.110:8020"
echo "   Backend API: http://1.236.245.110:8021/api/v1"
echo ""
echo "📝 로그 확인: sudo docker logs -f apas-application"
ENDSSH

echo ""
echo "🎉 배포가 완료되었습니다!"
echo ""
echo "🌐 접속 URL:"
echo "   Frontend: http://1.236.245.110:8020"
echo "   Backend API: http://1.236.245.110:8021/api/v1/health"
echo ""
echo "📝 로그 확인 명령어:"
echo "   ssh -p 2444 centos@1.236.245.110 'sudo docker logs -f apas-application'"
