# CentOS 7에서 Node.js 20.x 설치 가이드

## 문제 상황

```
npm ERR! Prisma only supports Node.js >= 18.18.
npm ERR! Please upgrade your Node.js version.
```

Prisma는 Node.js 18.18 이상이 필요하지만, CentOS 7 기본 저장소의 Node.js는 구버전입니다.

---

## 해결 방법

### 1단계: 기존 Node.js 제거 (설치되어 있는 경우)

```bash
# 기존 Node.js 확인
node --version
npm --version

# 기존 Node.js 제거
sudo yum remove -y nodejs npm

# 설치 확인
which node  # 아무것도 출력되지 않아야 함
```

### 2단계: Node.js 20.x LTS 설치

#### 방법 1: NodeSource 공식 저장소 사용 (권장)

```bash
# NodeSource 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js 20.x 설치
sudo yum install -y nodejs

# 버전 확인
node --version   # v20.x.x 출력되어야 함
npm --version    # 10.x.x 출력되어야 함
```

#### 방법 2: NVM (Node Version Manager) 사용

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# 환경변수 로드
source ~/.bashrc

# Node.js 20 LTS 설치
nvm install 20
nvm use 20
nvm alias default 20

# 버전 확인
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 3단계: npm 전역 패키지 디렉토리 설정 (선택사항)

```bash
# npm 전역 설치 디렉토리 설정 (권한 문제 방지)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# PATH 환경변수 추가
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 4단계: 프로젝트 재설치

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 기존 node_modules 삭제
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -f package-lock.json
rm -f backend/package-lock.json
rm -f frontend/package-lock.json

# 루트 의존성 설치
npm install

# Backend 설치
cd backend
npm install

# Prisma 클라이언트 생성
npx prisma generate

# Frontend 설치
cd ../frontend
npm install
```

---

## 트러블슈팅

### 문제 1: curl 명령어가 없는 경우

```bash
sudo yum install -y curl wget
```

### 문제 2: NodeSource 저장소 추가 실패

```bash
# EPEL 저장소 활성화
sudo yum install -y epel-release

# 시스템 업데이트
sudo yum update -y

# 다시 시도
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
```

### 문제 3: npm 권한 오류

```bash
# npm 전역 디렉토리 소유권 변경
sudo chown -R $USER:$(id -gn $USER) ~/.npm
sudo chown -R $USER:$(id -gn $USER) ~/.npm-global
```

### 문제 4: 방화벽/프록시 환경

```bash
# HTTP 프록시 설정 (필요시)
npm config set proxy http://proxy.server.com:8080
npm config set https-proxy http://proxy.server.com:8080

# SSL 인증서 문제 시 (권장하지 않음)
npm config set strict-ssl false
```

---

## 설치 확인

```bash
# Node.js 버전 확인 (20.x.x여야 함)
node --version

# npm 버전 확인 (10.x.x여야 함)
npm --version

# Prisma 설치 확인
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/backend
npx prisma --version

# 출력 예시:
# prisma                  : 6.19.0
# @prisma/client          : 6.19.0
# Computed Environment    : linux-arm64-openssl-3.0.x
# Platform                : linux-arm64-openssl-3.0.x
# Query Engine (Node-API) : libquery-engine xxxxx
```

---

## PM2 재설치 (필요시)

```bash
# 기존 PM2 제거
sudo npm uninstall -g pm2

# Node.js 20.x에서 PM2 재설치
sudo npm install -g pm2

# 버전 확인
pm2 --version
```

---

## 빠른 설치 스크립트

전체 과정을 자동화한 스크립트:

```bash
#!/bin/bash
set -e

echo "🔧 CentOS 7에서 Node.js 20.x 설치 시작..."

# 기존 Node.js 제거
echo "1️⃣ 기존 Node.js 제거..."
sudo yum remove -y nodejs npm || true

# NodeSource 저장소 추가
echo "2️⃣ NodeSource 저장소 추가..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js 20.x 설치
echo "3️⃣ Node.js 20.x 설치..."
sudo yum install -y nodejs

# 버전 확인
echo "4️⃣ 설치 확인..."
node --version
npm --version

# PM2 설치
echo "5️⃣ PM2 설치..."
sudo npm install -g pm2

echo "✅ Node.js 20.x 설치 완료!"
echo ""
echo "이제 프로젝트 디렉토리로 이동하여 npm install을 실행하세요."
```

저장 후 실행:

```bash
chmod +x install-nodejs20.sh
./install-nodejs20.sh
```

---

## 다음 단계

Node.js 20.x 설치 후:

1. **프로젝트 클린 재설치**

   ```bash
   cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm install
   ```

2. **Backend 설정**

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

3. **Frontend 설정**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **서비스 시작**
   ```bash
   cd ..
   pm2 start ecosystem.config.js
   pm2 save
   ```

---

## 참고 자료

- [NodeSource 공식 문서](https://github.com/nodesource/distributions)
- [Prisma 시스템 요구사항](https://www.prisma.io/docs/reference/system-requirements)
- [Node.js 공식 사이트](https://nodejs.org/)
- [NVM GitHub](https://github.com/nvm-sh/nvm)
