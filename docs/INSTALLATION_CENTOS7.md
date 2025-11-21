# CentOS 7에서 Node.js 20.x 설치 가이드

## 문제 상황

CentOS 7의 기본 GLIBC 버전(2.17)은 Node.js 20.x의 요구사항(GLIBC 2.27+, GLIBCXX 3.4.21+)을 충족하지 못합니다.

```
Error: Package: 2:nodejs-20.19.5-1nodesource.x86_64 (nodesource-nodejs)
       Requires: libc.so.6(GLIBC_2.28)(64bit)
Error: Package: 2:nodejs-20.19.5-1nodesource.x86_64 (nodesource-nodejs)
       Requires: libm.so.6(GLIBC_2.27)(64bit)
Error: Package: 2:nodejs-20.19.5-1nodesource.x86_64 (nodesource-nodejs)
       Requires: libstdc++.so.6(GLIBCXX_3.4.21)(64bit)
```

## 핵심 문제

NVM으로 설치한 Node.js 바이너리도 **GLIBC 2.27+**를 요구하기 때문에 CentOS 7(GLIBC 2.17)에서는 실행되지 않습니다.

```
node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
```

**Node.js 20.x는 CentOS 7에서 네이티브로 실행 불가능합니다.**

## 해결 방법

### ✅ 방법 1: Node.js 18.x 사용 (가장 간단)

Node.js 18.x는 CentOS 7의 GLIBC 2.17과 호환됩니다.

#### 설치 과정

```bash
# 1. NVM 설치 (이미 설치되어 있다면 생략)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

# 2. Node.js 18 설치
nvm install 18
nvm use 18
nvm alias default 18

# 3. 확인
node --version  # v18.x.x 출력
npm --version

# 4. 프로젝트 설정
cd /path/to/Water_AI_Report_Gen
echo "18" > .nvmrc
npm install
```

**참고**: Node.js 18.x는 2025년 4월까지 LTS 지원이 유지됩니다.

---

### ✅ 방법 2: Docker 사용 (권장 - 프로덕션)

Docker를 사용하면 호스트 시스템의 GLIBC 버전과 무관하게 Node.js 20.x를 실행할 수 있습니다.

#### Docker 설치

**방법 A: 자동 설치 스크립트 (권장)**

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/Water_AI_Report_Gen

# 설치 스크립트 실행
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh

# docker 그룹 권한 활성화
newgrp docker
```

**방법 B: 수동 설치**

```bash
# 1. 기존 Docker 제거
sudo yum remove -y docker docker-client docker-client-latest docker-common \
    docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 2. 필수 패키지 설치
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 3. Docker 저장소 추가 (올바른 경로)
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 4. Docker CE 설치
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 5. Docker 시작
sudo systemctl start docker
sudo systemctl enable docker

# 6. 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# 7. Docker Compose 설치
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 8. 설치 확인
docker --version
docker-compose --version
docker run --rm hello-world
```

#### 프로젝트 실행

```bash
cd /path/to/Water_AI_Report_Gen

# Docker Compose로 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 중지
docker compose down
```

**장점**:

- Node.js 20.x 사용 가능
- 환경 독립성, 재현성
- 프로덕션 배포와 동일한 환경

---

### ⚠️ 방법 3: 소스에서 Node.js 20 빌드 (고급, 비권장)

CentOS 7에서 Node.js 20을 소스에서 빌드하려면 먼저 **GLIBC와 GCC를 업그레이드**해야 합니다.

#### 전체 빌드 과정 (약 2-3시간 소요)

```bash
# 1. 빌드 도구 설치
sudo yum groupinstall "Development Tools" -y
sudo yum install -y wget git python3

# 2. GCC 업그레이드 (SCL 사용)
sudo yum install -y centos-release-scl
sudo yum install -y devtoolset-11
scl enable devtoolset-11 bash

# 3. GLIBC 2.28 소스 빌드 (약 1시간)
cd /tmp
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz
tar -xzf glibc-2.28.tar.gz
cd glibc-2.28
mkdir build && cd build
../configure --prefix=/opt/glibc-2.28
make -j$(nproc)
sudo make install

# 4. Node.js 20 소스 빌드 (약 1-2시간)
cd /tmp
wget https://nodejs.org/dist/v20.19.1/node-v20.19.1.tar.gz
tar -xzf node-v20.19.1.tar.gz
cd node-v20.19.1

# 커스텀 GLIBC 사용하여 빌드
./configure --prefix=/usr/local/node-20 \
  --with-intl=full-icu \
  CC="gcc" CXX="g++" \
  LDFLAGS="-Wl,--rpath=/opt/glibc-2.28/lib -Wl,--dynamic-linker=/opt/glibc-2.28/lib/ld-linux-x86-64.so.2"

make -j$(nproc)
sudo make install

# 5. PATH 설정
echo 'export PATH=/usr/local/node-20/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 6. 확인
node --version
npm --version
```

**경고**:

- 시스템 GLIBC를 교체하면 **시스템이 부팅 불가능**해질 수 있습니다.
- 위 방법은 별도 경로에 GLIBC를 설치하여 안전하지만 매우 복잡합니다.
- **Docker 사용을 강력히 권장**합니다.

---

### ✅ 방법 4: Rocky Linux/AlmaLinux 8+ 마이그레이션 (장기 권장)

CentOS 7 지원 종료(2024년 6월)로 인해 마이그레이션을 권장합니다.

```bash
# AlmaLinux 8로 마이그레이션 (ELevate 사용)
sudo yum install -y http://repo.almalinux.org/elevate/elevate-release-latest-el7.noarch.rpm
sudo yum install -y leapp-upgrade leapp-data-almalinux
sudo leapp preupgrade
sudo leapp upgrade
sudo reboot

# 마이그레이션 후 Node.js 20 설치
sudo dnf module install nodejs:20
node --version
```

**장점**:

- 최신 GLIBC 2.28+ 지원
- Node.js 20.x 네이티브 실행
- 2029년까지 지원

---

## 권장 방법 비교

| 방법            | 난이도            | Node.js 버전 | 시간    | 권장 용도                 |
| --------------- | ----------------- | ------------ | ------- | ------------------------- |
| **Node.js 18**  | ⭐ 쉬움           | 18.x         | 5분     | **개발 환경 (빠른 시작)** |
| **Docker**      | ⭐⭐ 보통         | 20.x         | 10분    | **프로덕션 (권장)**       |
| 소스 빌드       | ⭐⭐⭐⭐⭐ 어려움 | 20.x         | 2-3시간 | 특수한 경우만             |
| OS 마이그레이션 | ⭐⭐⭐ 복잡       | 20.x+        | 1-2시간 | **장기적 해결책**         |

---

## 빠른 시작 가이드

### 0단계: 기본 도구 설치 (curl/wget이 없는 경우)

```bash
# 기본 도구 설치 스크립트 실행
cd /path/to/Water_AI_Report_Gen
chmod +x scripts/install-basics-centos7.sh
./scripts/install-basics-centos7.sh
```

**또는 수동 설치**:

```bash
sudo yum install -y curl wget git
```

### 개발 환경 (5분)

**방법 A: 자동 설치 스크립트 (권장)**

```bash
cd /path/to/Water_AI_Report_Gen

# 1. 기본 도구 설치 (필요시)
chmod +x scripts/install-basics-centos7.sh
./scripts/install-basics-centos7.sh

# 2. Node.js 18 설치
chmod +x scripts/install-nodejs18-centos7.sh
./scripts/install-nodejs18-centos7.sh

# 3. 환경 변수 로드
source ~/.bashrc

# 4. 확인
node --version
npm --version
```

**방법 B: 수동 설치**

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# NVM 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
source ~/.bashrc

# Node.js 18 설치
nvm install 18
nvm use 18
nvm alias default 18

# 확인
node --version
npm --version
```

### 프로덕션 환경 (10분)

**방법 A: 자동 설치 스크립트 (권장)**

```bash
cd /path/to/Water_AI_Report_Gen

# 1. 기본 도구 설치
chmod +x scripts/install-basics-centos7.sh
./scripts/install-basics-centos7.sh

# 2. Docker 설치
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh

# 3. 프로젝트 실행
docker-compose up -d
```

**방법 B: 수동 설치**

```bash
# 1. 기본 도구 설치
sudo yum install -y curl wget git

# 2. Docker 저장소 직접 생성
sudo rm -f /etc/yum.repos.d/docker*.repo
sudo tee /etc/yum.repos.d/docker-ce.repo > /dev/null << 'EOF'
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://download.docker.com/linux/centos/$releasever/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg
EOF

# 3. Docker 설치
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum clean all && sudo yum makecache fast
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# 4. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. 확인
docker --version
docker-compose --version

# 6. 프로젝트 실행
cd /path/to/Water_AI_Report_Gen
docker-compose up -d
```

---

## NVM 사용 팁 (Node.js 18 사용 시)

### 프로젝트별 Node 버전 자동 전환

```bash
# .nvmrc 파일이 있는 디렉토리에서
nvm use

# 자동 전환 설정 (.bashrc에 추가)
cat >> ~/.bashrc << 'EOF'
# NVM 자동 버전 전환
cdnvm() {
    command cd "$@" || return $?
    nvm_path=$(nvm_find_up .nvmrc | tr -d '\n')

    if [[ ! $nvm_path = *[^[:space:]]* ]]; then
        declare default_version;
        default_version=$(nvm version default);

        if [[ $default_version == "N/A" ]]; then
            nvm alias default node
            default_version=$(nvm version default);
        fi

        if [[ $(nvm current) != "$default_version" ]]; then
            nvm use default;
        fi
    elif [[ -s $nvm_path/.nvmrc && -r $nvm_path/.nvmrc ]]; then
        declare nvm_version
        nvm_version=$(<"$nvm_path"/.nvmrc)

        declare locally_resolved_nvm_version
        locally_resolved_nvm_version=$(nvm ls --no-colors "$nvm_version" | tail -1 | tr -d '\->*' | tr -d '[:space:]')

        if [[ "$locally_resolved_nvm_version" == "N/A" ]]; then
            nvm install "$nvm_version";
        elif [[ $(nvm current) != "$locally_resolved_nvm_version" ]]; then
            nvm use "$nvm_version";
        fi
    fi
}
alias cd='cdnvm'
cd "$PWD"
EOF
```

### Node.js 18 vs 20 차이점

| 기능          | Node.js 18     | Node.js 20     |
| ------------- | -------------- | -------------- |
| LTS 지원      | 2025년 4월까지 | 2026년 4월까지 |
| CentOS 7 호환 | ✅ 완전 호환   | ❌ GLIBC 문제  |
| 최신 기능     | 대부분 지원    | 모든 최신 기능 |
| 성능          | 우수           | 더 우수        |

**결론**: CentOS 7에서는 Node.js 18 사용이 현실적입니다.

## 추가 참고사항

### CentOS 7 지원 종료

- CentOS 7의 공식 지원은 2024년 6월 30일에 종료되었습니다.
- 가능하면 Rocky Linux 8/9 또는 AlmaLinux 8/9로 마이그레이션을 권장합니다.

### NVM 공식 문서

- GitHub: https://github.com/nvm-sh/nvm
- 공식 문서: https://github.com/nvm-sh/nvm#readme

---

## 문제 해결

### GLIBC 오류 발생 시

**증상**:

```
node: /lib64/libm.so.6: version `GLIBC_2.27' not found
node: /lib64/libc.so.6: version `GLIBC_2.28' not found
```

**해결**:

```bash
# Node.js 18로 다운그레이드
nvm install 18
nvm use 18
nvm alias default 18

# 또는 Docker 사용
docker compose up -d
```

### "Unable to obtain node version" 오류

**증상**: NVM 설치 후 Node.js 버전 확인 실패

**원인**: NVM 환경 변수가 현재 세션에 로드되지 않음

**해결**:

```bash
# 1. NVM 환경 변수 수동 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 2. NVM 버전 확인
nvm --version

# 3. Node.js 설치
nvm install 18
nvm use 18
nvm alias default 18

# 4. 확인
node --version
npm --version

# 5. 새 세션에서도 작동하도록 .bashrc 재로드
source ~/.bashrc
```

**또는 자동 설치 스크립트 사용**:

```bash
chmod +x scripts/install-nodejs18-centos7.sh
./scripts/install-nodejs18-centos7.sh
```

### NVM 설치 후 "nvm: command not found"

```bash
# NVM 경로 확인 및 재로드
source ~/.bashrc
source ~/.nvm/nvm.sh

# 또는 수동으로 환경변수 추가
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Node.js 설치 후 "permission denied"

```bash
# npm 전역 패키지 경로 변경
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Docker 저장소 404 오류

**증상**:

```
failure: repodata/repomd.xml from download.docker.com_linu: [Errno 256] No more mirrors to try.
https://download.docker.com/linu/repodata/repomd.xml: [Errno 14] HTTPS Error 404 - Not Found
```

**원인**: `yum-config-manager`가 URL을 잘못 처리하거나 타이핑 오류 (`linux` → `linu`)

**완전한 해결책**:

```bash
# 1. 기존 잘못된 저장소 완전 제거
sudo rm -f /etc/yum.repos.d/docker*.repo

# 2. 저장소 파일 수동 생성 (가장 확실한 방법)
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

# 3. YUM 캐시 정리
sudo yum clean all
sudo yum makecache fast

# 4. Docker 설치
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 5. Docker 시작
sudo systemctl start docker
sudo systemctl enable docker

# 6. 확인
docker --version
```

**또는 설치 스크립트 사용 (권장)**:

```bash
cd /path/to/Water_AI_Report_Gen
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh
```

### Docker 권한 오류

```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 재로그인 또는 다음 명령 실행
newgrp docker

# Docker 서비스 상태 확인
sudo systemctl status docker
```

### 소스 빌드 실패 시

```bash
# 빌드 도구 재설치
sudo yum groupinstall "Development Tools" -y
sudo yum install -y gcc-c++ make python3 git

# GCC 버전 확인 (4.8+ 필요)
gcc --version

# Python 3 버전 확인 (3.6+ 필요)
python3 --version
```

---

## 자주 묻는 질문 (FAQ)

### Q1. Node.js 18과 20의 성능 차이는?

A: 일반적인 웹 애플리케이션에서는 5-10% 정도의 성능 차이가 있으나, 대부분의 경우 체감하기 어렵습니다.

### Q2. Node.js 18 지원은 언제까지?

A: 2025년 4월 30일까지 LTS 지원이 유지됩니다.

### Q3. Docker를 사용하면 성능 저하가 있나?

A: 네이티브 실행 대비 1-3% 정도의 오버헤드가 있으나 무시할 수 있는 수준입니다.

### Q4. GLIBC를 업그레이드하면 안 되나?

A: **절대 권장하지 않습니다.** 시스템 GLIBC를 교체하면 시스템이 부팅 불가능해질 수 있습니다.

### Q5. CentOS 7을 계속 사용해도 되나?

A: 보안 업데이트가 중단되었으므로, 가능하면 Rocky Linux 8/9 또는 AlmaLinux 8/9로 마이그레이션을 권장합니다.

---

## 요약

### 즉시 해결 (개발 환경)

```bash
nvm install 18
nvm use 18
```

### 프로덕션 환경

```bash
# Docker 사용 권장
docker compose up -d
```

### 장기적 해결

- Rocky Linux/AlmaLinux로 OS 마이그레이션 검토
