#!/bin/bash
set -e

BACKUP_DIR="/opt/apas/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="apas_backup_${TIMESTAMP}"

echo "========================================="
echo "APAS 백업 시작"
echo "========================================="

# 백업 디렉토리 생성
sudo mkdir -p "${BACKUP_DIR}"

# 1. 업로드 파일 백업
echo "➡️  업로드 파일 백업 중..."
if [ -d "/opt/apas/data/uploads" ]; then
    sudo tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" \
        -C /opt/apas/data uploads/
    echo "✅ 업로드 파일 백업 완료"
else
    echo "⚠️  업로드 디렉토리가 없습니다."
fi

# 2. 환경 변수 백업
echo "➡️  환경 변수 백업 중..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "${PROJECT_ROOT}/.env.production" ]; then
    sudo cp "${PROJECT_ROOT}/.env.production" "${BACKUP_DIR}/${BACKUP_NAME}.env"
    echo "✅ 환경 변수 백업 완료"
else
    echo "⚠️  .env.production 파일이 없습니다."
fi

# 3. Docker Compose 설정 백업
echo "➡️  Docker 설정 백업 중..."
if [ -f "${PROJECT_ROOT}/docker-compose.yml" ]; then
    sudo cp "${PROJECT_ROOT}/docker-compose.yml" "${BACKUP_DIR}/${BACKUP_NAME}_docker-compose.yml"
    echo "✅ Docker 설정 백업 완료"
fi

# 4. 오래된 백업 삭제 (30일 이상)
echo "➡️  오래된 백업 삭제 중 (30일 이상)..."
sudo find "${BACKUP_DIR}" -name "apas_backup_*" -mtime +30 -delete

echo ""
echo "========================================="
echo "✅ 백업 완료!"
echo "========================================="
echo ""
echo "📌 백업 파일:"
sudo ls -lh "${BACKUP_DIR}/${BACKUP_NAME}"*
echo ""
echo "📌 백업 위치: ${BACKUP_DIR}"
echo ""
