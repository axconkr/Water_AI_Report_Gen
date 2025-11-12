#!/bin/bash

# Water AI Report Generator - Stop Script
# 모든 실행 중인 서버를 중지합니다 (Backend + Frontend)

set -e

echo "🛑 Water AI Report Generator 중지 중..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"

# PID로 프로세스 중지
stop_by_pid() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")

        if ps -p $pid > /dev/null 2>&1; then
            echo "   PID $pid 중지 중..."
            kill $pid 2>/dev/null || true

            # 프로세스가 종료될 때까지 대기 (최대 5초)
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 50 ]; do
                sleep 0.1
                count=$((count + 1))
            done

            # 여전히 실행 중이면 강제 종료
            if ps -p $pid > /dev/null 2>&1; then
                echo "   강제 종료 중..."
                kill -9 $pid 2>/dev/null || true
            fi

            echo -e "${GREEN}✅ $service_name 중지됨${NC}"
        else
            echo -e "${YELLOW}   $service_name 프로세스가 이미 중지되어 있습니다${NC}"
        fi

        rm -f "$pid_file"
    else
        echo -e "${YELLOW}   $service_name PID 파일을 찾을 수 없습니다${NC}"
    fi
}

# 포트로 프로세스 중지
stop_by_port() {
    local port=$1
    local service_name=$2

    echo "   포트 $port 확인 중..."

    local pids=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$pids" ]; then
        echo "   포트 $port의 프로세스 중지 중..."
        for pid in $pids; do
            kill $pid 2>/dev/null || true
        done

        # 프로세스가 종료될 때까지 대기
        sleep 1

        # 여전히 실행 중인 프로세스가 있으면 강제 종료
        local remaining=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$remaining" ]; then
            echo "   강제 종료 중..."
            for pid in $remaining; do
                kill -9 $pid 2>/dev/null || true
            done
        fi

        echo -e "${GREEN}✅ $service_name (포트 $port) 중지됨${NC}"
    else
        echo -e "${YELLOW}   포트 $port에서 실행 중인 프로세스가 없습니다${NC}"
    fi
}

# Backend 서버 중지
stop_backend() {
    echo "🔴 Backend 서버 중지 중..."

    # PID 파일로 중지 시도
    stop_by_pid "$LOG_DIR/backend.pid" "Backend"

    # 포트로도 확인 및 중지
    stop_by_port 4000 "Backend"

    echo ""
}

# Frontend 서버 중지
stop_frontend() {
    echo "🔴 Frontend 서버 중지 중..."

    # PID 파일로 중지 시도
    stop_by_pid "$LOG_DIR/frontend.pid" "Frontend"

    # 포트로도 확인 및 중지
    stop_by_port 3000 "Frontend"

    echo ""
}

# Node 관련 모든 프로세스 중지 (선택적)
stop_all_node() {
    local force=$1

    if [ "$force" = "--force" ] || [ "$force" = "-f" ]; then
        echo "⚠️  모든 Node 프로세스 중지 중..."

        # ts-node-dev 프로세스 중지
        pkill -f "ts-node-dev" 2>/dev/null || true

        # next dev 프로세스 중지
        pkill -f "next dev" 2>/dev/null || true

        echo -e "${GREEN}✅ 모든 Node 프로세스 중지됨${NC}"
        echo ""
    fi
}

# 로그 파일 정리 (선택적)
clean_logs() {
    local clean=$1

    if [ "$clean" = "--clean" ] || [ "$clean" = "-c" ]; then
        echo "🧹 로그 파일 정리 중..."

        if [ -d "$LOG_DIR" ]; then
            rm -f "$LOG_DIR"/*.log
            rm -f "$LOG_DIR"/*.pid
            echo -e "${GREEN}✅ 로그 파일 정리됨${NC}"
        fi

        echo ""
    fi
}

# 서버 상태 확인
check_final_status() {
    echo "=================================="
    echo "  최종 상태"
    echo "=================================="

    local backend_port=$(lsof -ti:4000 2>/dev/null || true)
    local frontend_port=$(lsof -ti:3000 2>/dev/null || true)

    if [ -z "$backend_port" ]; then
        echo -e "${GREEN}✅ Backend:  중지됨${NC}"
    else
        echo -e "${RED}❌ Backend:  여전히 실행 중 (PID: $backend_port)${NC}"
    fi

    if [ -z "$frontend_port" ]; then
        echo -e "${GREEN}✅ Frontend: 중지됨${NC}"
    else
        echo -e "${RED}❌ Frontend: 여전히 실행 중 (PID: $frontend_port)${NC}"
    fi

    echo "=================================="
    echo ""

    if [ -z "$backend_port" ] && [ -z "$frontend_port" ]; then
        echo -e "${GREEN}✨ 모든 서버가 성공적으로 중지되었습니다!${NC}"
    else
        echo -e "${YELLOW}⚠️  일부 서버가 여전히 실행 중입니다${NC}"
        echo "   강제 종료하려면: ./stop.sh --force"
    fi
}

# 도움말 표시
show_help() {
    echo "사용법: ./stop.sh [옵션]"
    echo ""
    echo "옵션:"
    echo "  (없음)      Backend와 Frontend 서버를 중지합니다"
    echo "  --force, -f 모든 관련 Node 프로세스를 강제 종료합니다"
    echo "  --clean, -c 로그 파일을 정리합니다"
    echo "  --help, -h  이 도움말을 표시합니다"
    echo ""
    echo "예제:"
    echo "  ./stop.sh              # 서버 중지"
    echo "  ./stop.sh --force      # 강제 종료"
    echo "  ./stop.sh --clean      # 로그 정리"
    echo "  ./stop.sh -f -c        # 강제 종료 + 로그 정리"
}

# 메인 실행
main() {
    # 도움말 확인
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
        exit 0
    fi

    stop_backend
    stop_frontend
    stop_all_node "$1"
    clean_logs "$2"
    check_final_status
}

main "$@"
