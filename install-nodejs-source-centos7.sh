#!/bin/bash

# ===================================
# CentOS 7 Node.js 소스 빌드 설치
# ===================================
# GLIBC 2.17 환경에서 완전한 소스 컴파일 방식

set -e  # Exit on error

echo "🔧 CentOS 7에서 Node.js 소스 빌드 설치 시작..."
echo ""
echo "⚠️  중요: 이 스크립트는 Node.js를 완전히 소스에서 빌드합니다"
echo "   시간: 30-60분 소요 (CPU 성능에 따라)"
echo "   요구사항: 4GB+ RAM, 5GB+ 디스크 공간"
echo ""

# 시스템 정보 확인
echo "📋 시스템 정보 확인..."
GLIBC_VERSION=$(ldd --version | head -n1 | awk '{print $NF}')
CPU_CORES=$(nproc)
TOTAL_MEM=$(free -h | grep Mem | awk '{print $2}')
AVAILABLE_DISK=$(df -h . | tail -1 | awk '{print $4}')

echo "GLIBC 버전: $GLIBC_VERSION"
echo "CPU 코어: $CPU_CORES"
echo "총 메모리: $TOTAL_MEM"
echo "사용 가능 디스크: $AVAILABLE_DISK"
echo ""

# 메모리 확인
TOTAL_MEM_MB=$(free -m | grep Mem | awk '{print $2}')
if [ "$TOTAL_MEM_MB" -lt 2048 ]; then
    echo "⚠️  경고: 메모리가 2GB 미만입니다 ($TOTAL_MEM_MB MB)"
    echo "   빌드 중 메모리 부족으로 실패할 수 있습니다"
    read -p "계속하시겠습니까? (y/N): " continue_build
    if [[ $continue_build != [yY] ]]; then
        echo "설치를 취소합니다."
        exit 0
    fi
fi
echo ""

# 기존 Node.js 제거
if command -v node &> /dev/null; then
    echo "📋 기존 Node.js 발견: $(node --version 2>/dev/null || echo 'version error')"
    read -p "기존 Node.js를 제거하시겠습니까? (y/N): " remove_node
    if [[ $remove_node == [yY] ]]; then
        echo "1️⃣ 기존 Node.js 제거 중..."
        sudo yum remove -y nodejs npm || true
        sudo rm -f /etc/yum.repos.d/nodesource*.repo
        sudo yum clean all
        # NVM 제거
        rm -rf ~/.nvm
        sed -i '/NVM_DIR/d' ~/.bashrc
        sed -i '/nvm.sh/d' ~/.bashrc
        echo "✅ 기존 Node.js 제거 완료"
    fi
fi
echo ""

# 빌드 도구 설치
echo "2️⃣ 빌드 도구 설치 중..."
sudo yum groupinstall -y "Development Tools" || {
    echo "Development Tools 그룹 설치 실패, 개별 패키지 설치 시도..."
    sudo yum install -y gcc gcc-c++ make
}
sudo yum install -y python3 python3-devel || {
    echo "⚠️  Python 3 설치 실패"
}
echo "✅ 빌드 도구 설치 완료"
echo ""

# Node.js 버전 선택
echo "3️⃣ Node.js 버전 선택..."
echo ""
echo "CentOS 7 (GLIBC 2.17)에서 빌드 가능한 버전:"
echo "  1) Node.js 18.20.5 (LTS, 권장 - Prisma 호환)"
echo "  2) Node.js 16.20.2 (구버전 LTS)"
echo "  3) Node.js 14.21.3 (EOL, 권장하지 않음)"
echo ""
read -p "선택 (1-3, 기본값: 1): " NODE_CHOICE

case $NODE_CHOICE in
    2)
        NODE_VERSION="16.20.2"
        NODE_MAJOR="16"
        echo "Node.js 16.20.2 선택"
        ;;
    3)
        NODE_VERSION="14.21.3"
        NODE_MAJOR="14"
        echo "Node.js 14.21.3 선택 (EOL)"
        ;;
    *)
        NODE_VERSION="18.20.5"
        NODE_MAJOR="18"
        echo "Node.js 18.20.5 선택 (권장)"
        ;;
esac
echo ""

# 작업 디렉토리 생성
WORK_DIR="/tmp/nodejs-build-$$"
mkdir -p $WORK_DIR
cd $WORK_DIR

# Node.js 소스 다운로드
echo "4️⃣ Node.js $NODE_VERSION 소스 다운로드 중..."
wget https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz || {
    echo "❌ 다운로드 실패"
    echo "💡 수동 다운로드: https://nodejs.org/dist/v$NODE_VERSION/"
    exit 1
}

# 압축 해제
echo "5️⃣ 압축 해제 중..."
tar -xzf node-v$NODE_VERSION.tar.gz
cd node-v$NODE_VERSION

# 빌드 옵션 설정
echo "6️⃣ 빌드 설정 중..."
echo "설치 경로: /usr/local"
echo "병렬 빌드: $CPU_CORES 코어 사용"
echo ""

# Configure
./configure --prefix=/usr/local || {
    echo "❌ Configure 실패"
    exit 1
}

# 빌드 (병렬 처리)
echo "7️⃣ Node.js 빌드 중... (30-60분 소요)"
echo "⏳ 빌드 시작: $(date)"
echo ""

# 빌드 진행 상황 표시
make -j$CPU_CORES 2>&1 | tee build.log || {
    echo ""
    echo "❌ 빌드 실패"
    echo ""
    echo "💡 트러블슈팅:"
    echo "   1. 메모리 부족 시: make -j1 (단일 코어 빌드)"
    echo "   2. 로그 확인: cat $WORK_DIR/node-v$NODE_VERSION/build.log"
    echo "   3. 디스크 공간 확인: df -h"
    echo ""
    exit 1
}

echo ""
echo "⏳ 빌드 완료: $(date)"
echo ""

# 설치
echo "8️⃣ Node.js 설치 중..."
sudo make install || {
    echo "❌ 설치 실패"
    exit 1
}

# 심볼릭 링크 확인
if [ ! -L /usr/bin/node ]; then
    sudo ln -sf /usr/local/bin/node /usr/bin/node
fi
if [ ! -L /usr/bin/npm ]; then
    sudo ln -sf /usr/local/bin/npm /usr/bin/npm
fi

# 버전 확인
echo "9️⃣ 설치 확인 중..."
NODE_INSTALLED_VERSION=$(/usr/local/bin/node --version)
NPM_INSTALLED_VERSION=$(/usr/local/bin/npm --version)

echo "✅ Node.js: $NODE_INSTALLED_VERSION"
echo "✅ npm: $NPM_INSTALLED_VERSION"
echo ""

# GLIBC 의존성 확인
echo "🔍 GLIBC 의존성 확인..."
ldd /usr/local/bin/node | grep -i glibc || echo "GLIBC 의존성 없음 (정상)"
echo ""

# Prisma 호환성 확인
if [[ "$NODE_MAJOR" -ge 18 ]]; then
    echo "✅ Prisma 요구사항 충족 (Node.js >= 18.18)"
elif [[ "$NODE_MAJOR" -eq 16 ]]; then
    echo "⚠️  Prisma는 Node.js >= 18.18 권장"
else
    echo "❌ Prisma는 Node.js >= 18.18 필요"
fi
echo ""

# PM2 설치
read -p "PM2 프로세스 매니저를 설치하시겠습니까? (Y/n): " install_pm2
if [[ $install_pm2 != [nN] ]]; then
    echo "🔟 PM2 설치 중..."
    sudo /usr/local/bin/npm install -g pm2 || {
        echo "⚠️  PM2 설치 실패"
    }
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        echo "✅ PM2 버전: $PM2_VERSION"
    fi
    echo ""
fi

# 정리
echo "🧹 임시 파일 정리 중..."
cd /
rm -rf $WORK_DIR
echo "✅ 정리 완료"
echo ""

# 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Node.js 소스 빌드 설치가 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 설치된 버전:"
echo "   Node.js: $NODE_INSTALLED_VERSION"
echo "   npm: $NPM_INSTALLED_VERSION"
echo "   설치 경로: /usr/local/bin/"
echo "   GLIBC: $GLIBC_VERSION (시스템)"
echo ""
echo "🔍 확인 명령어:"
echo "   node --version"
echo "   npm --version"
echo "   which node"
echo ""
echo "📦 다음 단계:"
echo "   1. 프로젝트 디렉토리로 이동:"
echo "      cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"
echo ""
echo "   2. 기존 node_modules 삭제:"
echo "      rm -rf node_modules backend/node_modules frontend/node_modules"
echo ""
echo "   3. 의존성 설치:"
echo "      npm install"
echo "      cd backend && npm install && npx prisma generate"
echo "      cd ../frontend && npm install"
echo ""
echo "   4. 빌드 및 실행:"
echo "      cd backend && npm run build"
echo "      cd ../frontend && npm run build"
echo "      cd .. && pm2 start ecosystem.config.js"
echo ""
echo "💡 참고: 이 Node.js는 GLIBC 2.17에서 완전히 작동합니다!"
echo ""
