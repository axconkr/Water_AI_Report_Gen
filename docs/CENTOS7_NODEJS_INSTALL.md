# CentOS 7에서 Node.js 설치 가이드

## 문제 상황

### 문제 1: Prisma 버전 요구사항

```
npm ERR! Prisma only supports Node.js >= 18.18.
npm ERR! Please upgrade your Node.js version.
```

### 문제 2: GLIBC 버전 불일치 (NodeSource 저장소)

```
Error: Package: 2:nodejs-20.19.5-1nodesource.x86_64 (nodesource-nodejs)
       Requires: libc.so.6(GLIBC_2.28)(64bit)
Error: Package: 2:nodejs-18.20.8-1nodesource.x86_64 (nodesource-nodejs)
       Requires: libm.so.6(GLIBC_2.27)(64bit)
```

**원인**:

- CentOS 7은 **GLIBC 2.17**을 사용
- NodeSource의 Node.js 18.x는 **GLIBC 2.27** 필요
- NodeSource의 Node.js 20.x는 **GLIBC 2.28** 필요

**해결책**: **NVM(Node Version Manager)**을 사용하여 소스에서 빌드된 Node.js 설치 (GLIBC 제한 우회)

---

## ✅ 권장 해결 방법: NVM 사용 (GLIBC 제한 우회)

### 🚀 빠른 설치 (자동 스크립트) - 권장

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 최신 코드 다운로드
git pull origin main

# NVM 기반 Node.js 설치 스크립트 실행
chmod +x install-nodejs-nvm-centos7.sh
./install-nodejs-nvm-centos7.sh
```

**장점**:

- ✅ GLIBC 2.17 환경에서 작동
- ✅ Node.js 18.x, 20.x 모두 설치 가능
- ✅ 여러 Node.js 버전 관리 가능
- ✅ 빌드 자동화

### 📋 수동 설치

#### 1단계: 기존 Node.js 제거

```bash
# 기존 Node.js 확인
node --version
npm --version

# 기존 Node.js 제거
sudo yum remove -y nodejs npm

# NodeSource 저장소 제거
sudo rm -f /etc/yum.repos.d/nodesource*.repo
sudo yum clean all

# 설치 확인
which node  # 아무것도 출력되지 않아야 함
```

#### 2단계: Node.js 18.x LTS 설치

##### 방법 1: NodeSource 저장소 사용 (권장)

```bash
# NodeSource 저장소 추가 (18.x LTS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Node.js 18.x 설치
sudo yum install -y nodejs

# 버전 확인
node --version   # v18.x.x 출력되어야 함
npm --version    # 9.x.x 또는 10.x.x 출력되어야 함
```

##### 방법 2: NVM (Node Version Manager) 사용 ⭐ 권장

NVM은 소스에서 Node.js를 빌드하므로 GLIBC 제한을 우회합니다.

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# 환경변수 로드
source ~/.bashrc

# Node.js 18 LTS 설치 (권장)
nvm install 18
nvm use 18
nvm alias default 18

# 또는 Node.js 20 LTS 설치
# nvm install 20
# nvm use 20
# nvm alias default 20

# 버전 확인
node --version   # v18.x.x 또는 v20.x.x
npm --version    # 9.x.x 또는 10.x.x

# 설치된 버전 목록
nvm ls

# NVM 주요 명령어
# nvm install <version>  - Node.js 버전 설치
# nvm use <version>      - Node.js 버전 전환
# nvm ls                 - 설치된 버전 목록
# nvm alias default <v>  - 기본 버전 설정
```

**NVM 사용 시 주의사항**:

- 소스 빌드 방식이므로 설치에 5-10분 소요
- gcc-c++, make, python3 빌드 도구 필요
- 충분한 디스크 공간 필요 (1-2GB)

#### 3단계: 빌드 도구 설치

```bash
# C++ 컴파일러 및 빌드 도구 (일부 npm 패키지 빌드에 필요)
sudo yum install -y gcc-c++ make python3
```

#### 4단계: npm 전역 패키지 디렉토리 설정 (선택사항)

```bash
# npm 전역 설치 디렉토리 설정 (권한 문제 방지)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# PATH 환경변수 추가
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 5단계: 프로젝트 재설치

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
# Node.js 버전 확인 (18.x.x 이상이어야 함)
node --version

# npm 버전 확인
npm --version

# GLIBC 버전 확인
ldd --version | head -n1

# Prisma 설치 확인
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/backend
npx prisma --version

# 출력 예시:
# prisma                  : 6.19.0
# @prisma/client          : 6.19.0
# Computed Environment    : linux-x64-openssl-1.0.x
# Platform                : rhel-openssl-1.0.x
# Query Engine (Node-API) : libquery-engine xxxxx
```

---

## PM2 재설치 (필요시)

```bash
# 기존 PM2 제거
sudo npm uninstall -g pm2

# Node.js 18.x에서 PM2 재설치
sudo npm install -g pm2

# 버전 확인
pm2 --version

# PM2 시스템 부팅 시 자동 시작 설정
pm2 startup
# 출력된 명령어를 복사하여 실행
```

---

## ⚠️ CentOS 7 GLIBC 제한사항

### GLIBC 버전 확인

```bash
ldd --version | head -n1
# 출력: ldd (GNU libc) 2.17
```

### Node.js 버전별 GLIBC 요구사항

| Node.js 버전 | GLIBC 요구사항 | CentOS 7 호환 |
| ------------ | -------------- | ------------- |
| 16.x         | GLIBC 2.17     | ✅ 호환       |
| 18.x         | GLIBC 2.17     | ✅ 호환       |
| 20.x         | GLIBC 2.28     | ❌ 불가능     |
| 21.x+        | GLIBC 2.28+    | ❌ 불가능     |

**결론**: CentOS 7에서는 Node.js 18.x LTS가 최신 안정 버전입니다.

### GLIBC 업그레이드 시도 시 주의사항

⚠️ **경고**: CentOS 7에서 GLIBC를 2.28로 업그레이드하는 것은 **매우 위험**합니다.

- 시스템 전체가 불안정해질 수 있습니다
- 많은 시스템 도구와 애플리케이션이 작동하지 않을 수 있습니다
- **권장하지 않습니다**

### 대안

1. **Node.js 18.x LTS 사용** (권장) - Prisma 요구사항 충족
2. **Rocky Linux 8 / AlmaLinux 8로 업그레이드** - GLIBC 2.28 포함
3. **Docker 사용** - 컨테이너 내에서 최신 Node.js 실행

---

## 다음 단계

Node.js 18.x 설치 후:

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
