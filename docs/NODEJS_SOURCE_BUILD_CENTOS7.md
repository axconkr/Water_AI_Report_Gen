# CentOS 7 Node.js 소스 빌드 가이드

## 문제 상황

NVM을 사용해도 GLIBC 오류가 발생하는 경우:

```
node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)
```

**원인**: NVM이 미리 빌드된 바이너리를 다운로드했기 때문입니다.

**해결책**: Node.js를 **소스에서 완전히 컴파일**하여 CentOS 7의 GLIBC 2.17에 맞게 빌드합니다.

---

## ✅ 해결 방법: 소스 빌드

### 🚀 자동 설치 (권장)

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 최신 코드 다운로드
git pull origin main

# 소스 빌드 스크립트 실행
chmod +x install-nodejs-source-centos7.sh
./install-nodejs-source-centos7.sh
```

**소요 시간**: 30-60분 (CPU 성능에 따라)

**시스템 요구사항**:

- 최소 4GB RAM
- 5GB 이상 여유 디스크 공간
- gcc, g++, make, python3

---

## 📋 수동 설치

### 1단계: 기존 Node.js 완전 제거

```bash
# yum으로 설치된 Node.js 제거
sudo yum remove -y nodejs npm

# NodeSource 저장소 제거
sudo rm -f /etc/yum.repos.d/nodesource*.repo
sudo yum clean all

# NVM 제거
rm -rf ~/.nvm
sed -i '/NVM_DIR/d' ~/.bashrc
sed -i '/nvm.sh/d' ~/.bashrc

# 확인
which node  # 아무것도 나오지 않아야 함
```

### 2단계: 빌드 도구 설치

```bash
# Development Tools 설치
sudo yum groupinstall -y "Development Tools"

# 추가 필수 패키지
sudo yum install -y gcc gcc-c++ make python3 python3-devel

# 확인
gcc --version
g++ --version
make --version
python3 --version
```

### 3단계: Node.js 소스 다운로드

```bash
# 작업 디렉토리 생성
mkdir -p ~/nodejs-build
cd ~/nodejs-build

# Node.js 18.20.5 LTS 다운로드 (권장)
wget https://nodejs.org/dist/v18.20.5/node-v18.20.5.tar.gz

# 또는 Node.js 16.20.2 (구버전)
# wget https://nodejs.org/dist/v16.20.2/node-v16.20.2.tar.gz

# 압축 해제
tar -xzf node-v18.20.5.tar.gz
cd node-v18.20.5
```

### 4단계: 빌드 구성

```bash
# Configure (기본 설정)
./configure --prefix=/usr/local

# 또는 사용자 디렉토리에 설치
# ./configure --prefix=$HOME/local
```

### 5단계: 컴파일 및 설치

```bash
# CPU 코어 수 확인
nproc  # 예: 4

# 병렬 빌드 (코어 수만큼)
# 메모리가 충분하다면 (4GB 이상)
make -j$(nproc)

# 메모리가 부족하다면 (2-4GB)
# make -j2

# 메모리가 매우 부족하다면 (2GB 미만)
# make -j1

# 소요 시간: 30-60분
```

### 6단계: 설치

```bash
# 시스템 전역 설치 (권장)
sudo make install

# 심볼릭 링크 생성
sudo ln -sf /usr/local/bin/node /usr/bin/node
sudo ln -sf /usr/local/bin/npm /usr/bin/npm

# 확인
node --version   # v18.20.5
npm --version    # 10.x.x
which node       # /usr/local/bin/node
```

### 7단계: GLIBC 의존성 확인

```bash
# Node.js 바이너리의 GLIBC 의존성 확인
ldd /usr/local/bin/node | grep GLIBC

# 출력 예시:
# libc.so.6 => /lib64/libc.so.6 (0x00007f...)
# libm.so.6 => /lib64/libm.so.6 (0x00007f...)
# (GLIBC 2.17 버전만 표시되어야 함)
```

---

## 🎯 빌드 최적화

### 메모리 부족 시

빌드 중 메모리 부족으로 실패하는 경우:

```bash
# 스왑 메모리 생성 (임시)
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 빌드 진행
make -j1  # 단일 코어 빌드

# 빌드 후 스왑 제거
sudo swapoff /swapfile
sudo rm /swapfile
```

### 빌드 시간 단축

```bash
# ccache 사용 (빌드 캐시)
sudo yum install -y ccache

# 환경변수 설정
export CC="ccache gcc"
export CXX="ccache g++"

# Configure 및 빌드
./configure --prefix=/usr/local
make -j$(nproc)
```

### 디스크 공간 절약

```bash
# 빌드 후 소스 디렉토리 삭제
cd ~
rm -rf ~/nodejs-build

# npm 캐시 정리
npm cache clean --force
```

---

## 🔧 PM2 설치

```bash
# PM2 전역 설치
sudo npm install -g pm2

# 버전 확인
pm2 --version

# 시스템 부팅 시 자동 시작 설정
pm2 startup
# 출력된 명령어를 복사하여 실행

# PM2 프로세스 저장
pm2 save
```

---

## 📦 프로젝트 설치

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 기존 node_modules 완전 삭제
rm -rf node_modules backend/node_modules frontend/node_modules
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json

# 루트 의존성 설치
npm install

# Backend 설치
cd backend
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# Backend 빌드
npm run build

# Frontend 설치
cd ../frontend
npm install

# Frontend 빌드
npm run build

# PM2로 서비스 시작
cd ..
pm2 start ecosystem.config.js
pm2 save

# 상태 확인
pm2 status
```

---

## 🛠️ 트러블슈팅

### 문제 1: Configure 실패

```bash
# Python 버전 확인
python3 --version  # 3.6 이상 필요

# Python 설치
sudo yum install -y python3 python3-devel
```

### 문제 2: 빌드 중 메모리 부족

```
Error: Cannot allocate memory
```

**해결책**:

1. 단일 코어 빌드: `make -j1`
2. 스왑 메모리 추가 (위 참조)
3. 불필요한 프로세스 종료

### 문제 3: 빌드 중 디스크 공간 부족

```bash
# 디스크 공간 확인
df -h

# 불필요한 파일 삭제
sudo yum clean all
rm -rf ~/.cache/*
```

### 문제 4: 빌드가 중간에 멈춤

```bash
# 빌드 로그 확인
tail -f build.log

# 프로세스 확인
ps aux | grep make

# 강제 종료 후 재시작
pkill -9 make
make clean
make -j2
```

### 문제 5: npm 권한 오류

```bash
# npm 전역 디렉토리 권한 설정
sudo chown -R $USER:$(id -gn $USER) /usr/local/lib/node_modules
sudo chown -R $USER:$(id -gn $USER) /usr/local/bin
```

---

## 📊 Node.js 버전별 빌드 시간

| 버전        | 빌드 시간 (4코어) | Prisma 호환 |
| ----------- | ----------------- | ----------- |
| 14.21.3     | ~25분             | ❌          |
| 16.20.2     | ~35분             | ⚠️ 구버전   |
| **18.20.5** | **~45분**         | **✅ 권장** |

---

## ⚠️ 주의사항

### 1. 빌드 실패 대비

빌드가 실패할 경우를 대비하여:

- 중요 데이터 백업
- 충분한 시간 확보 (1-2시간)
- 안정적인 네트워크 환경

### 2. 시스템 리소스

최소 요구사항:

- **CPU**: 2코어 이상
- **RAM**: 4GB 이상 (권장 8GB)
- **디스크**: 5GB 이상 여유 공간

### 3. 업데이트

소스 빌드 방식은 자동 업데이트가 되지 않으므로:

- 정기적으로 최신 버전 확인
- 보안 패치 수동 적용

---

## 🎉 성공 확인

빌드가 성공적으로 완료되면:

```bash
# Node.js 버전 확인
node --version
# v18.20.5 출력

# GLIBC 의존성 확인 (2.17만 표시되어야 함)
ldd $(which node) | grep GLIBC

# Prisma 테스트
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen/backend
npx prisma --version
# Prisma 정상 작동 확인

# 프로젝트 실행
pm2 status
# apas-backend, apas-frontend 정상 실행 확인
```

---

## 📚 참고 자료

- [Node.js 공식 빌드 가이드](https://github.com/nodejs/node/blob/main/BUILDING.md)
- [CentOS 7 Development Tools](https://wiki.centos.org/HowTos/Custom_Kernel)
- [Node.js 다운로드](https://nodejs.org/dist/)

---

## 다음 단계

1. ✅ Node.js 소스 빌드 완료
2. ✅ Prisma 호환성 확인
3. ✅ 프로젝트 의존성 설치
4. ✅ PM2로 서비스 실행
5. 🚀 APAS 시스템 개발 시작!
