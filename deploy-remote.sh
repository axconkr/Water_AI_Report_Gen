#!/bin/bash

# APAS 원격 서버 배포 스크립트 (GitHub 방식)
# 원격 서버에서 실행할 스크립트

set -e

echo "🚀 APAS 원격 서버 배포 시작..."

# 프로젝트 디렉토리
PROJECT_DIR="/home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"
REPO_URL="https://github.com/axconkr/Water_AI_Report_Gen.git"
BRANCH="main"

# 1. 프로젝트 디렉토리로 이동
cd ${PROJECT_DIR}

# 2. Git에서 최신 코드 가져오기
echo "📥 GitHub에서 최신 코드 가져오기..."
if [ -d ".git" ]; then
    echo "   기존 저장소 업데이트 중..."
    git fetch origin
    git reset --hard origin/${BRANCH}
    git pull origin ${BRANCH}
else
    echo "   저장소 클론 중..."
    cd ..
    rm -rf Water_AI_Report_Gen
    git clone ${REPO_URL}
    cd Water_AI_Report_Gen
fi

# 3. .env 파일 확인
echo "📋 환경 변수 파일 확인..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다!"
    echo "   .env.example을 복사하여 .env를 생성하고 실제 값을 입력하세요:"
    echo "   cp .env.example .env"
    echo "   vi .env"
    exit 1
fi

# 4. Docker 컨테이너 중지 및 제거
echo "🛑 기존 Docker 컨테이너 중지..."
sudo docker-compose down -v || true

# 5. Docker 이미지 재빌드
echo "🔨 Docker 이미지 빌드 중..."
sudo docker-compose build --no-cache

# 6. Docker 컨테이너 시작
echo "▶️  Docker 컨테이너 시작..."
sudo docker-compose up -d

# 7. 컨테이너 시작 대기
echo "⏳ 컨테이너 시작 대기 중..."
sleep 15

# 8. 상태 확인
echo "📊 배포 상태 확인..."
sudo docker-compose ps

echo ""
echo "✅ 배포가 완료되었습니다!"
echo ""
echo "🌐 서비스 URL:"
echo "   Frontend: http://1.236.245.110:8020"
echo "   Backend API: http://1.236.245.110:8021/api/v1"
echo ""
echo "📝 로그 확인:"
echo "   sudo docker logs -f apas-application"
echo ""
echo "🔍 헬스체크:"
echo "   curl http://localhost:4000/api/v1/health"
