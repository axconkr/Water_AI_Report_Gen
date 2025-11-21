#!/bin/bash
set -e

echo "========================================="
echo "CentOS 7용 Docker 설치 스크립트"
echo "========================================="

# 1. 기존 Docker 관련 패키지 제거
echo "➡️  기존 Docker 패키지 제거 중..."
sudo yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine || true

# 2. 필수 유틸리티 설치
echo "➡️  필수 패키지 설치 중..."
sudo yum install -y yum-utils device-mapper-persistent-data lvm2 curl wget

# 3. 기존 Docker 저장소 제거
echo "➡️  기존 Docker 저장소 제거 중..."
sudo rm -f /etc/yum.repos.d/docker*.repo

# 4. Docker CE 저장소 직접 생성 (yum-config-manager 우회)
echo "➡️  Docker 저장소 추가 중..."
sudo tee /etc/yum.repos.d/docker-ce.repo > /dev/null << 'EOF'
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://download.docker.com/linux/centos/$releasever/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg

[docker-ce-stable-debuginfo]
name=Docker CE Stable - Debuginfo $basearch
baseurl=https://download.docker.com/linux/centos/$releasever/debug-$basearch/stable
enabled=0
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg

[docker-ce-stable-source]
name=Docker CE Stable - Sources
baseurl=https://download.docker.com/linux/centos/$releasever/source/stable
enabled=0
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg
EOF

echo "✅ 저장소 파일 생성 완료"

# 6. YUM 캐시 정리
echo "➡️  YUM 캐시 정리 중..."
sudo yum clean all
sudo yum makecache fast

# 7. Docker CE 설치
echo "➡️  Docker CE 설치 중..."
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 8. Docker 서비스 시작 및 자동 시작 설정
echo "➡️  Docker 서비스 시작 중..."
sudo systemctl start docker
sudo systemctl enable docker

# 9. Docker 상태 확인
echo "➡️  Docker 설치 확인 중..."
sudo docker --version

# 10. Hello World 테스트
echo "➡️  Docker 테스트 실행 중..."
sudo docker run --rm hello-world

# 11. 현재 사용자를 docker 그룹에 추가
echo "➡️  사용자를 docker 그룹에 추가 중..."
sudo usermod -aG docker $USER

# 12. Docker Compose 설치 (최신 버전)
echo "➡️  Docker Compose 설치 중..."

# curl이 정상 작동하는지 확인
if command -v curl &> /dev/null; then
    echo "   curl 사용 가능, 최신 버전 확인 중..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$DOCKER_COMPOSE_VERSION" ]; then
        echo "   ⚠️  최신 버전 확인 실패, v2.24.0 사용"
        DOCKER_COMPOSE_VERSION="v2.24.0"
    else
        echo "   최신 버전: $DOCKER_COMPOSE_VERSION"
    fi
else
    echo "   ⚠️  curl 없음, 기본 버전 v2.24.0 사용"
    DOCKER_COMPOSE_VERSION="v2.24.0"
fi

sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose 2>/dev/null || {
    echo "❌ Docker Compose 다운로드 실패"
    echo "   수동 설치 방법:"
    echo "   sudo curl -L https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose"
    echo "   sudo chmod +x /usr/local/bin/docker-compose"
}

sudo chmod +x /usr/local/bin/docker-compose

# 심볼릭 링크 생성
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 13. Docker Compose 버전 확인
echo "➡️  Docker Compose 버전 확인 중..."
if command -v docker-compose &> /dev/null; then
    docker-compose --version
else
    echo "⚠️  Docker Compose 설치 실패, 수동 설치 필요"
fi

echo ""
echo "========================================="
echo "✅ Docker 설치 완료!"
echo "========================================="
echo ""
echo "📌 중요: docker 그룹 권한을 적용하려면 다음 중 하나를 실행하세요:"
echo "   1) 로그아웃 후 재로그인"
echo "   2) 다음 명령 실행: newgrp docker"
echo ""
echo "📌 설치된 버전:"
docker --version
docker-compose --version
echo ""
echo "📌 다음 명령으로 Docker가 정상 작동하는지 확인하세요:"
echo "   docker run --rm hello-world"
echo ""
