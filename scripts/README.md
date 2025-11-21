# CentOS 7 설치 스크립트

CentOS 7에서 Node.js와 Docker를 설치하기 위한 자동화 스크립트 모음입니다.

## 📋 스크립트 목록

### 1. `install-basics-centos7.sh`

**용도**: curl, wget, git 등 기본 도구 설치

**실행 방법**:

```bash
chmod +x scripts/install-basics-centos7.sh
./scripts/install-basics-centos7.sh
```

**설치 항목**:

- curl, wget (네트워크 도구)
- git, vim, nano (개발 도구)
- tar, gzip, bzip2, unzip (압축 도구)
- net-tools, bind-utils (시스템 유틸리티)
- epel-release (추가 패키지 저장소)

---

### 2. `install-nodejs18-centos7.sh`

**용도**: NVM을 통한 Node.js 18.x LTS 설치

**실행 방법**:

```bash
chmod +x scripts/install-nodejs18-centos7.sh
./scripts/install-nodejs18-centos7.sh
```

**설치 항목**:

- NVM (Node Version Manager) v0.40.1
- Node.js 18.x LTS (최신 버전)
- npm (Node.js와 함께 제공)
- .nvmrc 파일 생성 (프로젝트 루트)

**설치 후**:

```bash
# 새 터미널 또는
source ~/.bashrc

# 확인
node --version  # v18.x.x
npm --version
```

---

### 3. `install-docker-centos7.sh`

**용도**: Docker CE 및 Docker Compose 설치

**실행 방법**:

```bash
chmod +x scripts/install-docker-centos7.sh
./scripts/install-docker-centos7.sh
```

**설치 항목**:

- Docker CE (Community Edition)
- Docker CLI
- containerd.io
- Docker Compose v2.24.0+

**설치 후**:

```bash
# docker 그룹 권한 활성화
newgrp docker

# 확인
docker --version
docker-compose --version

# 테스트
docker run --rm hello-world
```

---

## 🚀 전체 설치 순서

### 개발 환경 (Node.js 18)

```bash
# 1. 기본 도구 설치
./scripts/install-basics-centos7.sh

# 2. Node.js 18 설치
./scripts/install-nodejs18-centos7.sh

# 3. 환경 변수 로드
source ~/.bashrc

# 4. 프로젝트 의존성 설치
npm install

# 5. 개발 서버 실행
npm run dev
```

### 프로덕션 환경 (Docker)

```bash
# 1. 기본 도구 설치
./scripts/install-basics-centos7.sh

# 2. Docker 설치
./scripts/install-docker-centos7.sh

# 3. docker 그룹 권한 활성화
newgrp docker

# 4. 프로젝트 실행
docker-compose up -d

# 5. 로그 확인
docker-compose logs -f
```

---

## ❓ 문제 해결

### "Permission denied" 오류

**문제**: 스크립트 실행 권한이 없음

**해결**:

```bash
chmod +x scripts/*.sh
```

### "curl: command not found" 오류

**문제**: curl이 설치되지 않음

**해결**:

```bash
# curl 수동 설치
sudo yum install -y curl

# 또는 기본 도구 스크립트 실행
./scripts/install-basics-centos7.sh
```

### "nvm: command not found" 오류

**문제**: NVM 환경 변수가 로드되지 않음

**해결**:

```bash
# 환경 변수 수동 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 또는 새 터미널 세션 시작
source ~/.bashrc
```

### Docker 저장소 404 오류

**문제**: `https://download.docker.com/linu/` (잘못된 URL)

**해결**:

- `install-docker-centos7.sh` 스크립트가 자동으로 올바른 저장소 파일을 생성합니다.
- 수동 수정이 필요한 경우 문서를 참조하세요: `docs/INSTALLATION_CENTOS7.md`

### GLIBC 버전 오류

**문제**: `node: /lib64/libc.so.6: version 'GLIBC_2.28' not found`

**원인**: CentOS 7은 GLIBC 2.17만 제공, Node.js 20은 GLIBC 2.27+ 필요

**해결**:

- Node.js 18 사용 (권장): `./scripts/install-nodejs18-centos7.sh`
- Docker 사용: `./scripts/install-docker-centos7.sh`

---

## 📚 추가 문서

자세한 설치 가이드 및 문제 해결 방법은 다음 문서를 참조하세요:

- [CentOS 7 설치 가이드](../docs/INSTALLATION_CENTOS7.md)

---

## 🔧 스크립트 커스터마이징

### Node.js 버전 변경

`install-nodejs18-centos7.sh` 파일에서 버전 수정:

```bash
# 18을 원하는 버전으로 변경
nvm install 18  # → nvm install 20
```

### Docker Compose 버전 고정

`install-docker-centos7.sh` 파일에서 버전 수정:

```bash
DOCKER_COMPOSE_VERSION="v2.24.0"  # 원하는 버전으로 변경
```

---

## ⚠️ 주의사항

1. **sudo 권한 필요**: 모든 스크립트는 sudo 권한이 필요합니다.
2. **인터넷 연결 필수**: 패키지 다운로드를 위해 인터넷 연결이 필요합니다.
3. **CentOS 7 전용**: 이 스크립트들은 CentOS 7 환경에 최적화되어 있습니다.
4. **보안**: 프로덕션 환경에서는 스크립트 내용을 검토한 후 실행하세요.

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 스크립트 실행 중 에러 메시지
2. 시스템 로그: `sudo journalctl -xe`
3. YUM 로그: `sudo cat /var/log/yum.log`
4. Docker 로그: `sudo journalctl -u docker`

---

**마지막 업데이트**: 2025-01-21
