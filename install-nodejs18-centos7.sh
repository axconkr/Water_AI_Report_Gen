#!/bin/bash

# ===================================
# CentOS 7 Node.js 18.x LTS 설치 스크립트
# ===================================
# CentOS 7의 GLIBC 2.17과 호환되는 마지막 LTS 버전

set -e  # Exit on error

echo "🔧 CentOS 7에서 Node.js 18.x LTS 설치 시작..."
echo ""
echo "⚠️  중요: CentOS 7은 GLIBC 2.17을 사용합니다."
echo "   Node.js 20.x는 GLIBC 2.28이 필요하므로 설치할 수 없습니다."
echo "   Node.js 18.x LTS (Prisma 호환)를 설치합니다."
echo ""

# 기존 Node.js 확인
echo "📋 현재 설치된 Node.js 버전 확인..."
if command -v node &> /dev/null; then
    echo "현재 버전: $(node --version)"
    read -p "기존 Node.js를 제거하시겠습니까? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        echo "1️⃣ 기존 Node.js 제거 중..."
        sudo yum remove -y nodejs npm || true
        # NodeSource 저장소도 제거
        sudo rm -f /etc/yum.repos.d/nodesource*.repo
        sudo yum clean all
        echo "✅ 기존 Node.js 제거 완료"
    fi
else
    echo "Node.js가 설치되어 있지 않습니다."
fi
echo ""

# 시스템 준비
echo "2️⃣ 시스템 준비 중..."
sudo yum install -y curl wget gcc-c++ make || {
    echo "❌ 필수 패키지 설치 실패"
    exit 1
}
echo "✅ 시스템 준비 완료"
echo ""

# NodeSource 저장소 추가 (Node.js 18.x)
echo "3️⃣ NodeSource 저장소 추가 중 (Node.js 18.x LTS)..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - || {
    echo "❌ NodeSource 저장소 추가 실패"
    echo "💡 EPEL 저장소를 먼저 설치해보세요: sudo yum install -y epel-release"
    exit 1
}
echo "✅ NodeSource 저장소 추가 완료"
echo ""

# Node.js 18.x 설치
echo "4️⃣ Node.js 18.x LTS 설치 중..."
sudo yum install -y nodejs || {
    echo "❌ Node.js 설치 실패"
    echo ""
    echo "💡 대안 방법: NVM 사용"
    echo "   다음 명령어를 실행하세요:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash"
    echo "   source ~/.bashrc"
    echo "   nvm install 18"
    echo "   nvm use 18"
    exit 1
}
echo "✅ Node.js 설치 완료"
echo ""

# 버전 확인
echo "5️⃣ 설치 버전 확인..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"
echo ""

# Node.js 버전 검증 (18.18 이상이어야 Prisma 호환)
NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
NODE_MINOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f2)

if [ "$NODE_MAJOR" -ge 18 ] && [ "$NODE_MINOR" -ge 18 ]; then
    echo "✅ Node.js 버전이 Prisma 요구사항을 충족합니다 (>= 18.18)"
elif [ "$NODE_MAJOR" -ge 19 ]; then
    echo "✅ Node.js 버전이 Prisma 요구사항을 충족합니다"
else
    echo "⚠️  경고: Node.js 버전이 Prisma 최소 요구사항(18.18)보다 낮을 수 있습니다"
    echo "   현재 버전: $NODE_VERSION"
fi
echo ""

# 빌드 도구 설치
echo "6️⃣ Node.js 빌드 도구 설치..."
sudo yum install -y gcc-c++ make python3 || {
    echo "⚠️  빌드 도구 설치 실패 (일부 npm 패키지가 설치되지 않을 수 있습니다)"
}
echo "✅ 빌드 도구 설치 완료"
echo ""

# PM2 설치 여부 확인
read -p "PM2 프로세스 매니저를 설치하시겠습니까? (Y/n): " install_pm2
if [[ $install_pm2 != [nN] ]]; then
    echo "7️⃣ PM2 설치 중..."
    sudo npm install -g pm2 || {
        echo "⚠️  PM2 설치 실패 (나중에 수동으로 설치할 수 있습니다)"
    }
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        echo "✅ PM2 버전: $PM2_VERSION"
    fi
fi
echo ""

# npm 전역 디렉토리 설정
echo "8️⃣ npm 전역 디렉토리 설정..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

if ! grep -q "npm-global/bin" ~/.bashrc; then
    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
    echo "✅ PATH 환경변수에 추가됨"
fi

echo "✅ npm 전역 디렉토리 설정 완료"
echo ""

# GLIBC 버전 확인
echo "9️⃣ 시스템 GLIBC 버전 확인..."
GLIBC_VERSION=$(ldd --version | head -n1 | awk '{print $NF}')
echo "시스템 GLIBC 버전: $GLIBC_VERSION"
echo ""

# 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Node.js 18.x LTS 설치가 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 설치된 버전:"
echo "   Node.js: $NODE_VERSION (Prisma 호환 ✅)"
echo "   npm: $NPM_VERSION"
echo "   GLIBC: $GLIBC_VERSION"
echo ""
echo "🔄 다음 단계:"
echo "   1. 새 터미널을 열거나 다음 명령어 실행:"
echo "      source ~/.bashrc"
echo ""
echo "   2. 프로젝트 디렉토리로 이동:"
echo "      cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen"
echo ""
echo "   3. 기존 node_modules 삭제:"
echo "      rm -rf node_modules backend/node_modules frontend/node_modules"
echo ""
echo "   4. 의존성 재설치:"
echo "      npm install"
echo "      cd backend && npm install && npx prisma generate"
echo "      cd ../frontend && npm install"
echo ""
echo "💡 문제가 발생하면 docs/CENTOS7_NODEJS_INSTALL.md를 참조하세요."
echo ""
