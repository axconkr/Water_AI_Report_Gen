# CentOS 7에 Claude Code 설치 가이드

Claude Code는 Anthropic의 공식 CLI 도구로, 터미널에서 Claude AI를 사용할 수 있게 해줍니다.

---

## 전제 조건

- CentOS 7 운영체제
- Node.js 18.x 이상 설치 (Node.js 설치 가이드 참조: `docs/CENTOS7_NODEJS_INSTALL.md`)
- Anthropic API 키

---

## 설치 방법

### 방법 1: npx로 직접 실행 (권장)

Claude Code를 설치하지 않고 바로 사용할 수 있습니다.

```bash
# Claude Code 실행
npx @anthropic-ai/claude-code

# 또는 짧은 명령어
npx @anthropic-ai/claude-code
```

**장점**:

- 설치 불필요
- 항상 최신 버전 사용
- 디스크 공간 절약

### 방법 2: 전역 설치

자주 사용한다면 전역으로 설치할 수 있습니다.

```bash
# 전역 설치
npm install -g @anthropic-ai/claude-code

# 설치 확인
claude-code --version

# 실행
claude-code
```

### 방법 3: 프로젝트별 로컬 설치

특정 프로젝트에서만 사용하는 경우:

```bash
cd /your/project/directory

# 로컬 설치
npm install --save-dev @anthropic-ai/claude-code

# package.json 스크립트에 추가
# "scripts": {
#   "claude": "claude-code"
# }

# 실행
npm run claude
```

---

## API 키 설정

Claude Code를 사용하려면 Anthropic API 키가 필요합니다.

### 1. API 키 발급

1. https://console.anthropic.com/ 접속
2. 로그인 또는 회원가입
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키 복사 (sk-ant-...로 시작)

### 2. API 키 설정 방법

#### 방법 A: 환경 변수로 설정 (권장)

```bash
# .bashrc 또는 .bash_profile에 추가
echo 'export ANTHROPIC_API_KEY="sk-ant-your-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# 설정 확인
echo $ANTHROPIC_API_KEY
```

#### 방법 B: 실행 시 직접 입력

```bash
# API 키를 직접 전달
ANTHROPIC_API_KEY="sk-ant-your-api-key-here" npx @anthropic-ai/claude-code
```

#### 방법 C: .env 파일 사용

```bash
# 프로젝트 루트에 .env 파일 생성
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen
echo 'ANTHROPIC_API_KEY=sk-ant-your-api-key-here' > .env

# .gitignore에 추가 (보안)
echo '.env' >> .gitignore
```

---

## 사용 방법

### 기본 사용

```bash
# Claude Code 실행
npx @anthropic-ai/claude-code

# 또는 전역 설치한 경우
claude-code
```

### 특정 프로젝트에서 실행

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# Claude Code 실행
npx @anthropic-ai/claude-code

# 특정 파일 분석
npx @anthropic-ai/claude-code analyze backend/src/index.ts

# 코드 리뷰
npx @anthropic-ai/claude-code review
```

### 유용한 명령어

```bash
# 도움말 보기
claude-code --help

# 버전 확인
claude-code --version

# 대화형 모드
claude-code chat

# 파일 분석
claude-code analyze <file-path>

# 코드 생성
claude-code generate <description>
```

---

## CentOS 7 특정 설정

### 1. 권한 설정

```bash
# npm 전역 디렉토리 권한 설정
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# PATH 추가
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. 방화벽 설정 (필요시)

Claude Code는 Anthropic API 서버(api.anthropic.com)와 통신합니다.

```bash
# HTTPS 아웃바운드 허용 확인
sudo firewall-cmd --list-all

# 필요시 HTTPS 허용
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 프록시 환경 설정 (필요시)

```bash
# HTTP 프록시 설정
export HTTP_PROXY="http://proxy.server.com:8080"
export HTTPS_PROXY="http://proxy.server.com:8080"

# npm 프록시 설정
npm config set proxy http://proxy.server.com:8080
npm config set https-proxy http://proxy.server.com:8080
```

---

## 트러블슈팅

### 문제 1: "command not found: claude-code"

```bash
# PATH 확인
echo $PATH

# npm 전역 bin 경로 확인
npm config get prefix

# .bashrc 재로드
source ~/.bashrc

# 또는 npx로 실행
npx @anthropic-ai/claude-code
```

### 문제 2: API 키 오류

```bash
# API 키 환경변수 확인
echo $ANTHROPIC_API_KEY

# API 키가 비어있다면 다시 설정
export ANTHROPIC_API_KEY="sk-ant-your-api-key-here"

# .bashrc에 영구 추가
echo 'export ANTHROPIC_API_KEY="sk-ant-your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 문제 3: 네트워크 연결 오류

```bash
# DNS 확인
nslookup api.anthropic.com

# 연결 테스트
curl -I https://api.anthropic.com

# 프록시 설정 확인
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### 문제 4: Node.js 버전 오류

```bash
# Node.js 버전 확인 (18.x 이상 필요)
node --version

# Node.js 18.x 설치 가이드 참조
# docs/CENTOS7_NODEJS_INSTALL.md
```

### 문제 5: 권한 오류 (EACCES)

```bash
# npm 캐시 정리
npm cache clean --force

# 소유권 변경
sudo chown -R $USER:$(id -gn $USER) ~/.npm
sudo chown -R $USER:$(id -gn $USER) ~/.npm-global

# 또는 npx 사용 (권한 문제 회피)
npx @anthropic-ai/claude-code
```

---

## VS Code 통합 (선택사항)

CentOS 7에서 GUI를 사용한다면 VS Code와 통합할 수 있습니다.

### VS Code 설치

```bash
# Microsoft 저장소 추가
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'

# VS Code 설치
sudo yum check-update
sudo yum install -y code

# 실행
code
```

### Claude Code 확장 설치

1. VS Code 실행
2. Extensions (Ctrl+Shift+X)
3. "Claude Code" 검색
4. Install 클릭
5. API 키 설정

---

## 보안 모범 사례

### API 키 보안

1. **절대 Git에 커밋하지 마세요**

   ```bash
   # .gitignore에 추가
   echo '.env' >> .gitignore
   echo '.env.local' >> .gitignore
   ```

2. **환경 변수 사용**

   ```bash
   # .bashrc 또는 .bash_profile에 추가
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

3. **파일 권한 설정**

   ```bash
   # .env 파일 권한 제한
   chmod 600 .env
   ```

4. **API 키 교체**
   - 주기적으로 API 키 교체
   - 노출된 경우 즉시 재발급

---

## 비용 관리

Claude API는 사용량에 따라 과금됩니다.

### 사용량 모니터링

1. https://console.anthropic.com/ 접속
2. Usage 메뉴에서 사용량 확인
3. 예산 알림 설정

### 비용 절감 팁

1. **적절한 모델 선택**
   - Claude 3.5 Sonnet: 일반 작업
   - Claude 3 Haiku: 간단한 작업 (저렴)

2. **프롬프트 최적화**
   - 불필요한 컨텍스트 제거
   - 명확하고 간결한 질문

3. **캐싱 활용**
   - 반복 작업에 캐시 사용

---

## 유용한 리소스

- [Claude Code 공식 문서](https://docs.anthropic.com/claude/docs)
- [Anthropic API 문서](https://docs.anthropic.com/claude/reference)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Anthropic Console](https://console.anthropic.com/)

---

## 예제: 프로젝트 분석

```bash
cd /home/centos/SHINHWA_AI/1.AI_Report/Water_AI_Report_Gen

# 프로젝트 구조 분석
npx @anthropic-ai/claude-code "현재 프로젝트 구조를 분석하고 개선점을 제안해주세요"

# 특정 파일 리뷰
npx @anthropic-ai/claude-code "backend/src/index.ts 파일을 리뷰해주세요"

# 코드 생성
npx @anthropic-ai/claude-code "사용자 인증 미들웨어를 작성해주세요"

# 버그 찾기
npx @anthropic-ai/claude-code "이 프로젝트에서 잠재적인 보안 취약점을 찾아주세요"
```

---

## 다음 단계

1. ✅ Node.js 18.x 설치 완료
2. ✅ Anthropic API 키 발급
3. ✅ Claude Code 설치
4. ✅ API 키 환경변수 설정
5. 🚀 Claude Code로 프로젝트 개발 시작!

---

## 문의 및 지원

- Anthropic 지원: https://support.anthropic.com/
- Claude Code Issues: https://github.com/anthropics/claude-code/issues
- 프로젝트 Issues: https://github.com/axconkr/Water_AI_Report_Gen/issues
