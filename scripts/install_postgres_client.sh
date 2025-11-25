#!/bin/bash
# PostgreSQL 클라이언트 설치 스크립트 (CentOS 7)

echo "========================================="
echo "PostgreSQL 클라이언트 설치"
echo "========================================="
echo ""

# CentOS 7 Base 리포지토리에서 설치 시도
echo "📦 PostgreSQL 설치 중..."
echo ""

# 방법 1: 기본 리포지토리에서 설치
sudo yum install -y postgresql 2>&1 | tee /tmp/pg_install.log

if command -v psql > /dev/null; then
    echo ""
    echo "✅ PostgreSQL 클라이언트 설치 성공!"
    psql --version
    echo ""
else
    echo ""
    echo "⚠️  기본 리포지토리에서 설치 실패"
    echo "💡 대체 방법으로 설치 시도 중..."
    echo ""

    # 방법 2: EPEL 리포지토리 사용
    echo "📦 EPEL 리포지토리 설치 중..."
    sudo yum install -y epel-release 2>&1 | tee -a /tmp/pg_install.log

    echo "📦 PostgreSQL 재설치 시도..."
    sudo yum install -y postgresql 2>&1 | tee -a /tmp/pg_install.log

    if command -v psql > /dev/null; then
        echo ""
        echo "✅ PostgreSQL 클라이언트 설치 성공!"
        psql --version
        echo ""
    else
        echo ""
        echo "❌ 자동 설치 실패"
        echo ""
        echo "🔧 수동 설치 옵션:"
        echo ""
        echo "1️⃣  CentOS Vault 미러 사용 (오래된 패키지)"
        echo "   sudo sed -i 's|^mirrorlist=|#mirrorlist=|g' /etc/yum.repos.d/CentOS-*.repo"
        echo "   sudo sed -i 's|^#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*.repo"
        echo "   sudo yum clean all"
        echo "   sudo yum install -y postgresql"
        echo ""
        echo "2️⃣  Docker로 PostgreSQL 클라이언트 사용"
        echo "   docker run --rm -it postgres:15-alpine psql --version"
        echo ""
        echo "3️⃣  PostgreSQL 없이 테스트 (curl/telnet 사용)"
        echo "   ./scripts/test_supabase_simple.sh"
        echo ""
    fi
fi

echo "========================================="
