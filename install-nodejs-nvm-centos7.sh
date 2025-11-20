#!/bin/bash

# ===================================
# CentOS 7 Node.js 설치 (NVM 사용)
# ===================================
# GLIBC 2.17 제한 우회 - 소스 빌드 방식

set -e  # Exit on error

echo "🔧 CentOS 7에서 NVM을 사용한 Node.js 설치 시작..."
echo ""
echo "⚠️  중요: NodeSource 저장소의 Node.js는 GLIBC 2.27+ 필요"
echo "   CentOS 7 (GLIBC 2.17)에서는 NVM으로 소스 빌드 방식 사용"
echo ""

# GLIBC 버전 확인
echo "📋 시스템 GLIBC 버전 확인..."
GLIBC_VERSION=$(ldd --version | head -n1 | awk '{print $NF}')
echo "시스템 GLIBC 버전: $GLIBC_VERSION"
echo ""

# 기존 Node.js 정리
if command -v node &> /dev/null; then
    echo "📋 기존 Node.js 발견: $(node --version)"
    read -p "기존 Node.js를 제거하고 NVM으로 재설치하시겠습니까? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        echo "1️⃣ 기존 Node.js 제거 중..."
        sudo yum remove -y nodejs npm || true
        sudo rm -f /etc/yum.repos.d/nodesource*.repo
        sudo yum clean all
        echo "✅ 기존 Node.js 제거 완료"
    else
        echo "설치를 취소합니다."
        exit 0
    fi
else
    echo "Node.js가 설치되어 있지 않습니다."
fi
echo ""

# 빌드 도구 확인
echo "2️⃣ 빌드 도구 확인 중..."
BUILD_TOOLS="gcc-c++ make python3"
MISSING_TOOLS=""

for tool in gcc-c++ make python3; do
    if ! rpm -q $tool &> /dev/null; then
        MISSING_TOOLS="$MISSING_TOOLS $tool"
    fi
done

if [ -n "$MISSING_TOOLS" ]; then
    echo "빌드 도구 설치: $MISSING_TOOLS"
    sudo yum install -y $MISSING_TOOLS
else
    echo "✅ 필요한 빌드 도구가 모두 설치되어 있습니다"
fi
echo ""

# NVM 설치
echo "3️⃣ NVM (Node Version Manager) 설치 중..."

# 기존 NVM 확인
if [ -d "$HOME/.nvm" ]; then
    echo "기존 NVM 발견"
    read -p "기존 NVM을 제거하고 재설치하시겠습니까? (y/N): " reinstall_nvm
    if [[ $reinstall_nvm == [yY] ]]; then
        rm -rf "$HOME/.nvm"
        # .bashrc에서 NVM 관련 설정 제거
        sed -i '/NVM_DIR/d' ~/.bashrc
        sed -i '/nvm.sh/d' ~/.bashrc
    fi
fi

# NVM 설치
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash || {
        echo "❌ NVM 설치 실패"
        echo "💡 수동으로 다음 명령어를 실행해보세요:"
        echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash"
        exit 1
    }
    echo "✅ NVM 설치 완료"
else
    echo "✅ NVM이 이미 설치되어 있습니다"
fi
echo ""

# NVM 환경변수 로드
echo "4️⃣ NVM 환경변수 로드 중..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# NVM 버전 확인
if command -v nvm &> /dev/null; then
    echo "✅ NVM 버전: $(nvm --version)"
else
    echo "⚠️  NVM이 현재 세션에 로드되지 않았습니다"
    echo "다음 명령어를 실행하여 NVM을 로드하세요:"
    echo "  source ~/.bashrc"
    echo "  nvm --version"
fi
echo ""

# Node.js 버전 선택
echo "5️⃣ Node.js 버전 선택..."
echo ""
echo "설치 가능한 Node.js LTS 버전:"
echo "  1) Node.js 18.x LTS (권장 - Prisma 호환)"
echo "  2) Node.js 20.x LTS (최신 - 빌드 시간 오래 걸림)"
echo "  3) Node.js 16.x LTS (구버전)"
echo ""
read -p "선택 (1-3, 기본값: 1): " NODE_CHOICE

case $NODE_CHOICE in
    2)
        NODE_VERSION="20"
        echo "Node.js 20.x LTS 선택"
        ;;
    3)
        NODE_VERSION="16"
        echo "Node.js 16.x LTS 선택"
        ;;
    *)
        NODE_VERSION="18"
        echo "Node.js 18.x LTS 선택 (권장)"
        ;;
esac
echo ""

# Node.js 설치
echo "6️⃣ Node.js $NODE_VERSION.x LTS 설치 중..."
echo "⏳ 소스 빌드 방식이므로 5-10분 정도 소요됩니다..."
echo ""

nvm install $NODE_VERSION || {
    echo "❌ Node.js 설치 실패"
    echo ""
    echo "💡 트러블슈팅:"
    echo "   1. 빌드 도구 확인: gcc-c++, make, python3"
    echo "   2. 디스크 공간 확인: df -h"
    echo "   3. 메모리 확인: free -h"
    echo ""
    exit 1
}

echo "✅ Node.js 설치 완료"
echo ""

# Node.js 활성화
echo "7️⃣ Node.js 활성화 중..."
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION

# 버전 확인
NODE_INSTALLED_VERSION=$(node --version)
NPM_INSTALLED_VERSION=$(npm --version)

echo "✅ Node.js: $NODE_INSTALLED_VERSION"
echo "✅ npm: $NPM_INSTALLED_VERSION"
echo ""

# Prisma 호환성 확인
NODE_MAJOR=$(echo $NODE_INSTALLED_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
NODE_MINOR=$(echo $NODE_INSTALLED_VERSION | cut -d'v' -f2 | cut -d'.' -f2)

if [ "$NODE_MAJOR" -ge 18 ]; then
    if [ "$NODE_MAJOR" -eq 18 ] && [ "$NODE_MINOR" -ge 18 ]; then
        echo "✅ Prisma 요구사항 충족 (Node.js >= 18.18)"
    elif [ "$NODE_MAJOR" -gt 18 ]; then
        echo "✅ Prisma 요구사항 충족 (Node.js >= 18.18)"
    else
        echo "⚠️  경고: Prisma는 Node.js >= 18.18 권장"
        echo "   현재 버전: $NODE_INSTALLED_VERSION"
    fi
else
    echo "⚠️  경고: Prisma는 Node.js >= 18.18 필요"
    echo "   현재 버전: $NODE_INSTALLED_VERSION"
fi
echo ""

# PM2 설치
read -p "PM2 프로세스 매니저를 설치하시겠습니까? (Y/n): " install_pm2
if [[ $install_pm2 != [nN] ]]; then
    echo "8️⃣ PM2 설치 중..."
    npm install -g pm2 || {
        echo "⚠️  PM2 설치 실패 (나중에 수동으로 설치할 수 있습니다)"
    }
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        echo "✅ PM2 버전: $PM2_VERSION"
    fi
    echo ""
fi

# 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Node.js 설치가 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 설치된 버전:"
echo "   Node.js: $NODE_INSTALLED_VERSION"
echo "   npm: $NPM_INSTALLED_VERSION"
echo "   GLIBC: $GLIBC_VERSION (시스템)"
echo ""
echo "🔄 중요: 새 터미널을 열거나 다음 명령어 실행:"
echo "   source ~/.bashrc"
echo ""
echo "🔍 Node.js 확인:"
echo "   node --version"
echo "   npm --version"
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
echo "💡 NVM 주요 명령어:"
echo "   nvm ls                  - 설치된 Node.js 버전 목록"
echo "   nvm use 18              - Node.js 18 사용"
echo "   nvm use 20              - Node.js 20 사용"
echo "   nvm install 20          - Node.js 20 설치"
echo "   nvm alias default 18    - 기본 버전 설정"
echo ""
echo "📚 문서: docs/CENTOS7_NODEJS_INSTALL.md"
echo ""
