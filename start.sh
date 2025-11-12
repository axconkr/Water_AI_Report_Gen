#!/bin/bash

# Water AI Report Generator - Start Script
# 모든 서버를 시작합니다 (Backend + Frontend)

set -e

echo "🚀 Water AI Report Generator 시작 중..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 로그 디렉토리 생성
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

# 환경 변수 확인
check_env() {
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${YELLOW}⚠️  경고: backend/.env 파일이 없습니다${NC}"
        echo "   backend/.env.example을 복사하여 .env 파일을 만들어주세요"
        exit 1
    fi
}

# 포트 사용 확인
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  포트 $port가 이미 사용 중입니다 ($service)${NC}"
        echo "   다른 프로세스를 중지하려면 ./stop.sh를 실행하세요"
        return 1
    fi
    return 0
}

# Backend 서버 시작
start_backend() {
    echo -e "${BLUE}📦 Backend 서버 시작 중...${NC}"

    cd "$BACKEND_DIR"

    # Node modules 설치 확인
    if [ ! -d "node_modules" ]; then
        echo "   Dependencies 설치 중..."
        npm install
    fi

    # 포트 확인
    if ! check_port 4000 "Backend"; then
        return 1
    fi

    # Background에서 실행
    nohup npm run dev > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$LOG_DIR/backend.pid"

    echo -e "${GREEN}✅ Backend 서버 시작됨 (PID: $BACKEND_PID)${NC}"
    echo "   URL: http://localhost:4000"
    echo "   로그: $LOG_DIR/backend.log"

    cd "$PROJECT_ROOT"
}

# Frontend 서버 시작
start_frontend() {
    echo ""
    echo -e "${BLUE}🎨 Frontend 서버 시작 중...${NC}"

    cd "$FRONTEND_DIR"

    # Node modules 설치 확인
    if [ ! -d "node_modules" ]; then
        echo "   Dependencies 설치 중..."
        npm install
    fi

    # 포트 확인
    if ! check_port 3000 "Frontend"; then
        return 1
    fi

    # Background에서 실행
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"

    echo -e "${GREEN}✅ Frontend 서버 시작됨 (PID: $FRONTEND_PID)${NC}"
    echo "   URL: http://localhost:3000"
    echo "   로그: $LOG_DIR/frontend.log"

    cd "$PROJECT_ROOT"
}

# 서버 상태 확인
check_status() {
    echo ""
    echo -e "${BLUE}🔍 서버 상태 확인 중...${NC}"
    sleep 3

    local backend_running=false
    local frontend_running=false

    if [ -f "$LOG_DIR/backend.pid" ]; then
        local backend_pid=$(cat "$LOG_DIR/backend.pid")
        if ps -p $backend_pid > /dev/null 2>&1; then
            backend_running=true
        fi
    fi

    if [ -f "$LOG_DIR/frontend.pid" ]; then
        local frontend_pid=$(cat "$LOG_DIR/frontend.pid")
        if ps -p $frontend_pid > /dev/null 2>&1; then
            frontend_running=true
        fi
    fi

    echo ""
    echo "=================================="
    echo "  서버 상태"
    echo "=================================="

    if [ "$backend_running" = true ]; then
        echo -e "${GREEN}✅ Backend:  실행 중${NC}"
    else
        echo -e "${YELLOW}❌ Backend:  중지됨${NC}"
    fi

    if [ "$frontend_running" = true ]; then
        echo -e "${GREEN}✅ Frontend: 실행 중${NC}"
    else
        echo -e "${YELLOW}❌ Frontend: 중지됨${NC}"
    fi

    echo "=================================="
    echo ""

    if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
        echo -e "${GREEN}🎉 모든 서버가 성공적으로 시작되었습니다!${NC}"
        echo ""
        echo "📝 애플리케이션 접속: http://localhost:3000"
        echo "🔧 API 서버: http://localhost:4000"
        echo ""
        echo "💡 서버를 중지하려면: ./stop.sh"
        echo "📋 로그 확인: tail -f logs/backend.log 또는 logs/frontend.log"
    else
        echo -e "${YELLOW}⚠️  일부 서버가 시작되지 않았습니다${NC}"
        echo "   로그를 확인해주세요:"
        echo "   - Backend: $LOG_DIR/backend.log"
        echo "   - Frontend: $LOG_DIR/frontend.log"
        return 1
    fi
}

# 메인 실행
main() {
    check_env

    start_backend || {
        echo -e "${YELLOW}Backend 시작 실패. 종료합니다.${NC}"
        exit 1
    }

    start_frontend || {
        echo -e "${YELLOW}Frontend 시작 실패. Backend를 중지합니다.${NC}"
        ./stop.sh
        exit 1
    }

    check_status
}

main "$@"
