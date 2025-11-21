#!/bin/bash
set -e

echo "========================================="
echo "CentOS 7 기본 도구 설치 스크립트"
echo "========================================="

# curl, wget이 없는 경우를 위한 최소 설치 스크립트

# 1. 기본 네트워크 도구 설치
echo "➡️  기본 네트워크 도구 설치 중..."
sudo yum install -y curl wget

# 2. 개발 도구 설치
echo "➡️  기본 개발 도구 설치 중..."
sudo yum install -y git vim nano

# 3. 압축 도구 설치
echo "➡️  압축 도구 설치 중..."
sudo yum install -y tar gzip bzip2 unzip

# 4. 시스템 유틸리티 설치
echo "➡️  시스템 유틸리티 설치 중..."
sudo yum install -y net-tools bind-utils

# 5. EPEL 저장소 설치 (추가 패키지를 위해)
echo "➡️  EPEL 저장소 설치 중..."
sudo yum install -y epel-release

echo ""
echo "========================================="
echo "✅ 기본 도구 설치 완료!"
echo "========================================="
echo ""
echo "📌 설치된 도구:"
echo "   - curl: $(curl --version 2>/dev/null | head -1 || echo '설치 확인 필요')"
echo "   - wget: $(wget --version 2>/dev/null | head -1 || echo '설치 확인 필요')"
echo "   - git: $(git --version 2>/dev/null || echo '설치 확인 필요')"
echo ""
echo "📌 다음 단계:"
echo "   Docker 설치: ./install-docker-centos7.sh"
echo ""
