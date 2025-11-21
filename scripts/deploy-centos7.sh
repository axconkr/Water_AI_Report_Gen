#!/bin/bash
set -e

echo "========================================="
echo "APAS CentOS 7 Docker 배포 스크립트"
echo "========================================="

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 1. 환경 확인
echo "➡️  환경 확인 중..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   ./scripts/install-docker-centos7.sh 를 먼저 실행하세요."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# 2. 디렉토리 생성
echo "➡️  데이터 디렉토리 생성 중..."
sudo mkdir -p /opt/apas/data/uploads/{documents,generated,temp}
sudo mkdir -p /opt/apas/logs/{frontend,backend}
sudo mkdir -p /opt/apas/backups
sudo chown -R 1000:1000 /opt/apas/data
sudo chmod -R 755 /opt/apas/data

# 3. 환경 변수 확인
echo "➡️  환경 변수 확인 중..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다."
    echo "   .env.production.example을 복사하여 .env.production을 생성하세요:"
    echo "   cp .env.production.example .env.production"
    exit 1
fi

# 4. 기존 컨테이너 중지 및 제거
echo "➡️  기존 컨테이너 중지 중..."
docker-compose down || true

# 5. Docker 이미지 빌드
echo "➡️  Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 6. 컨테이너 시작
echo "➡️  컨테이너 시작 중..."
docker-compose --env-file .env.production up -d

# 7. 상태 확인
echo "➡️  컨테이너 상태 확인 중..."
sleep 5
docker-compose ps

# 8. Health Check
echo "➡️  Health Check 실행 중..."
sleep 10

# Backend Health Check
if curl -f http://localhost:4000/api/v1/health &> /dev/null; then
    echo "✅ Backend: 정상"
else
    echo "⚠️  Backend: Health Check 실패"
    docker-compose logs backend | tail -20
fi

# Frontend Health Check  
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend: 정상"
else
    echo "⚠️  Frontend: Health Check 실패"
    docker-compose logs apas | tail -20
fi

echo ""
echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo ""
echo "📌 접속 정보:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend API: http://$(hostname -I | awk '{print $1}'):4000"
echo ""
echo "📌 로그 확인:"
echo "   전체: docker-compose logs -f"
echo "   Backend: docker-compose logs -f apas"
echo ""
echo "📌 업로드 파일 위치:"
echo "   /opt/apas/data/uploads/"
echo ""
echo "📌 컨테이너 관리:"
echo "   중지: docker-compose stop"
echo "   시작: docker-compose start"
echo "   재시작: docker-compose restart"
echo "   삭제: docker-compose down"
echo ""
