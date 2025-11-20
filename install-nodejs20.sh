#!/bin/bash

# ===================================
# CentOS 7 Node.js 20.x 설치 스크립트
# ===================================

set -e  # Exit on error

echo "🔧 CentOS 7에서 Node.js 20.x 설치 시작..."
echo ""

# 기존 Node.js 확인
echo "📋 현재 설치된 Node.js 버전 확인..."
if command -v node &> /dev/null; then
    echo "현재 버전: $(node --version)"
    read -p "기존 Node.js를 제거하시겠습니까? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        echo "1️⃣ 기존 Node.js 제거 중..."
        sudo yum remove -y nodejs npm || true
        echo "✅ 기존 Node.js 제거 완료"
    fi
else
    echo "Node.js가 설치되어 있지 않습니다."
fi
echo ""

# 시스템 준비
echo "2️⃣ 시스템 준비 중..."
sudo yum install -y curl wget || {
    echo "❌ curl, wget 설치 실패"
    exit 1
}
echo "✅ 시스템 준비 완료"
echo ""

# NodeSource 저장소 추가
echo "3️⃣ NodeSource 저장소 추가 중..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - || {
    echo "❌ NodeSource 저장소 추가 실패"
    echo "💡 EPEL 저장소를 먼저 설치해보세요: sudo yum install -y epel-release"
    exit 1
}
echo "✅ NodeSource 저장소 추가 완료"
echo ""

# Node.js 20.x 설치
echo "4️⃣ Node.js 20.x 설치 중..."
sudo yum install -y nodejs || {
    echo "❌ Node.js 설치 실패"
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

# Node.js 버전 검증
REQUIRED_VERSION="18.18"
CURRENT_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1,2)

if (( $(echo "$CURRENT_VERSION >= $REQUIRED_VERSION" | bc -l) )); then
    echo "✅ Node.js 버전이 Prisma 요구사항을 충족합니다 (>= 18.18)"
else
    echo "⚠️  경고: Node.js 버전이 Prisma 요구사항을 충족하지 못할 수 있습니다"
fi
echo ""

# PM2 설치 여부 확인
read -p "PM2 프로세스 매니저를 설치하시겠습니까? (Y/n): " install_pm2
if [[ $install_pm2 != [nN] ]]; then
    echo "6️⃣ PM2 설치 중..."
    sudo npm install -g pm2 || {
        echo "⚠️  PM2 설치 실패 (나중에 수동으로 설치할 수 있습니다)"
    }
    PM2_VERSION=$(pm2 --version 2>/dev/null || echo "설치 실패")
    echo "✅ PM2 버전: $PM2_VERSION"
fi
echo ""

# npm 전역 디렉토리 설정
echo "7️⃣ npm 전역 디렉토리 설정..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

if ! grep -q "npm-global/bin" ~/.bashrc; then
    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
    echo "✅ PATH 환경변수에 추가됨"
fi

echo "✅ npm 전역 디렉토리 설정 완료"
echo ""

# 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Node.js 20.x 설치가 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 설치된 버전:"
echo "   Node.js: $NODE_VERSION"
echo "   npm: $NPM_VERSION"
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
