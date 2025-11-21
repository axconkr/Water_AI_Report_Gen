#!/bin/bash
set -e

echo "========================================="
echo "CentOS 7용 Node.js 18 설치 스크립트"
echo "========================================="

# 1. 필수 도구 확인
echo "➡️  필수 도구 확인 중..."
if ! command -v curl &> /dev/null; then
    echo "❌ curl이 설치되어 있지 않습니다."
    echo "   먼저 기본 도구를 설치하세요: ./install-basics-centos7.sh"
    exit 1
fi

# 2. NVM 설치 확인
if [ -d "$HOME/.nvm" ]; then
    echo "ℹ️  NVM이 이미 설치되어 있습니다."
else
    echo "➡️  NVM 설치 중..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# 3. NVM 환경 변수 로드
echo "➡️  NVM 환경 변수 로드 중..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 4. NVM 버전 확인
echo "➡️  NVM 버전 확인 중..."
if command -v nvm &> /dev/null; then
    nvm --version
else
    echo "❌ NVM 로드 실패"
    echo ""
    echo "수동으로 다음 명령을 실행하세요:"
    echo "  export NVM_DIR=\"\$HOME/.nvm\""
    echo "  [ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\""
    echo "  nvm --version"
    exit 1
fi

# 5. Node.js 18 설치
echo "➡️  Node.js 18 설치 중..."
nvm install 18

# 6. Node.js 18을 기본 버전으로 설정
echo "➡️  Node.js 18을 기본 버전으로 설정 중..."
nvm use 18
nvm alias default 18

# 7. .nvmrc 파일 생성 (프로젝트 루트에)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/.nvmrc" ]; then
    echo "ℹ️  .nvmrc 파일이 이미 존재합니다."
else
    echo "➡️  .nvmrc 파일 생성 중..."
    echo "18" > "$PROJECT_ROOT/.nvmrc"
    echo "✅ $PROJECT_ROOT/.nvmrc 생성 완료"
fi

# 8. bashrc/zshrc 업데이트 확인
if ! grep -q "NVM_DIR" "$HOME/.bashrc" 2>/dev/null; then
    echo "➡️  .bashrc에 NVM 설정 추가 중..."
    cat >> "$HOME/.bashrc" << 'EOF'

# NVM (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    echo "✅ .bashrc 업데이트 완료"
else
    echo "ℹ️  .bashrc에 NVM 설정이 이미 있습니다."
fi

# 9. Node.js 및 npm 버전 확인
echo ""
echo "========================================="
echo "✅ Node.js 18 설치 완료!"
echo "========================================="
echo ""
echo "📌 설치된 버전:"
node --version
npm --version
echo ""
echo "📌 다음 단계:"
echo "   1. 새 터미널 세션을 시작하거나 다음 명령 실행:"
echo "      source ~/.bashrc"
echo ""
echo "   2. Node.js 버전 확인:"
echo "      node --version"
echo ""
echo "   3. 프로젝트 의존성 설치:"
echo "      cd $PROJECT_ROOT"
echo "      npm install"
echo ""
echo "📌 NVM 사용법:"
echo "   - 버전 전환: nvm use 18"
echo "   - 설치된 버전 확인: nvm ls"
echo "   - 다른 버전 설치: nvm install 20"
echo ""
