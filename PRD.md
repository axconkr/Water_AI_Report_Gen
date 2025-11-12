PRD (Product Requirements Document)
외부용역과제 수행계획서 자동 작성 시스템
문서 버전: 1.0
작성일: 2025-02-20
작성자: AI Development Team
승인자: Project Sponsor

📋 목차

문서 개요
프로젝트 배경 및 목적
사용자 정의
시스템 아키텍처
기능 요구사항
비기능 요구사항
데이터베이스 설계
API 명세
UI/UX 설계
개발 로드맵
위험 관리
성공 지표


1. 문서 개요
1.1 프로젝트 정보
항목내용프로젝트명AI 기반 외부용역과제 수행계획서 자동 작성 시스템 (APAS - Automated Proposal Authoring System)제품 코드APAS-2025대상 고객엔지니어링 회사, 컨설팅 업체, 정부 용역 수행 기업플랫폼웹 기반 (Responsive Web Application)개발 기간4개월 (MVP)예상 출시일2025년 6월
1.2 문서 목적
본 PRD는 AI 기반 외부용역과제 수행계획서 자동 작성 시스템의 개발을 위한 상세 요구사항을 정의하고, 개발팀, 디자인팀, QA팀 간의 공통 이해를 도모하기 위해 작성되었습니다.
1.3 이해관계자
역할이름/팀책임Product Owner필립제품 비전 및 우선순위 결정Tech Lead개발팀장기술 아키텍처 및 구현 방향UX Designer디자인팀사용자 경험 설계QA LeadQA팀품질 보증 및 테스트Business Stakeholder경영진비즈니스 가치 및 ROI

2. 프로젝트 배경 및 목적
2.1 비즈니스 배경
2.1.1 현재 문제점
Pain Points:

수작업 중심의 비효율

공공기관 용역 수행계획서 작성에 평균 5~7일 소요
반복적인 문서 작업으로 인한 리소스 낭비
숙련된 인력에 대한 의존도 높음


품질 일관성 부족

작성자에 따른 품질 편차
법령 및 기준 누락 가능성
과거 제안서 참조의 비효율


법규 준수의 어려움

자주 변경되는 법령 및 기준
계약서상 법적 근거 명시 누락
청렴계약 등 컴플라이언스 관리 어려움


시장 기회

국내 공공 용역 시장 규모: 연간 약 50조원
엔지니어링 업체 수: 약 65,000개
디지털 전환 가속화 추세



2.2 프로젝트 목표
2.2.1 비즈니스 목표

생산성 향상: 수행계획서 작성 시간 70% 단축 (7일 → 2일)
품질 개선: 법령 준수율 95% 이상 달성
시장 점유: 출시 후 1년 내 1,000개 기업 사용자 확보
수익 창출: 출시 후 2년 내 손익분기점 달성

2.2.2 사용자 목표

시간 절약: 반복 작업 자동화로 핵심 업무 집중
품질 향상: AI 기반 법령 분석으로 누락 방지
협업 강화: 팀원 간 문서 공유 및 버전 관리
지식 축적: 과거 제안서 데이터베이스 구축

2.2.3 기술 목표

AI 정확도: 문서 분석 정확도 90% 이상
처리 속도: 문서 업로드 후 5분 내 초안 생성
확장성: 동시 사용자 500명 지원
안정성: 시스템 가용성 99.5% 이상

2.3 성공 기준
지표목표측정 방법작성 시간 단축70%사용자 설문 및 로그 분석법령 준수율95%전문가 검수사용자 만족도4.0/5.0NPS 설문재사용률60%월간 활성 사용자 비율전환율20%무료→유료 전환

3. 사용자 정의
3.1 사용자 페르소나
페르소나 1: 프로젝트 매니저 (김대리, 35세)
배경:

중견 엔지니어링 회사 근무 8년차
월 평균 2~3건의 용역 제안서 작성
법령 및 기준 파악에 어려움

목표:

빠르고 정확한 제안서 작성
법령 준수 자동 확인
과거 제안서 재활용

페인 포인트:

반복적인 문서 작업
법령 변경사항 추적 어려움
품질 검토에 시간 소요

페르소나 2: 대표이사 (박사장, 52세)
배경:

소규모 엔지니어링 회사 운영
직접 제안서 작성 및 검토
수주율 향상이 최우선

목표:

전문적인 제안서 작성
비용 절감
수주율 향상

페인 포인트:

숙련 인력 부족
제안서 품질 관리
법률 자문 비용

페르소나 3: 신입 직원 (이사원, 28세)
배경:

엔지니어링 회사 입사 1년차
제안서 작성 경험 부족
빠른 업무 습득 필요

목표:

제안서 작성 방법 학습
실수 최소화
업무 효율성 향상

페인 포인트:

복잡한 법령 및 기준
멘토링 부족
작업 속도 느림

3.2 사용자 여정 (User Journey)
Journey 1: 처음 사용하는 사용자
1. 문제 인식 → 2. 서비스 발견 → 3. 회원가입 → 4. 튜토리얼 
   ↓
5. 문서 업로드 → 6. 목차 생성 → 7. 내용 확인 → 8. 다운로드
   ↓
9. 만족도 평가 → 10. 재방문 결정
Journey 2: 재방문 사용자
1. 로그인 → 2. 과거 프로젝트 확인 → 3. 새 프로젝트 생성
   ↓
4. 문서 업로드 → 5. AI 분석 → 6. 편집 → 7. 다운로드
   ↓
8. 팀 공유

4. 시스템 아키텍처
4.1 전체 아키텍처
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    React.js / Next.js Web Application            │  │
│  │  - Responsive Design (Desktop/Tablet/Mobile)     │  │
│  │  - Progressive Web App (PWA)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Backend API (Node.js/Express)            │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Authentication Service                     │ │  │
│  │  │  - JWT Token Management                     │ │  │
│  │  │  - Session Management                       │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Document Processing Service               │ │  │
│  │  │  - PDF Parser                              │ │  │
│  │  │  - DOCX Parser                             │ │  │
│  │  │  - Text Extraction                         │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  AI Orchestration Service                  │ │  │
│  │  │  - Prompt Engineering                      │ │  │
│  │  │  - Multi-AI Provider Manager               │ │  │
│  │  │  - Response Processing                     │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  Document Generation Service               │ │  │
│  │  │  - Template Engine                         │ │  │
│  │  │  - DOCX Export                             │ │  │
│  │  │  - PDF Export                              │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    External Services                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Gemini API   │  │ Claude API   │  │ OpenChat API │  │
│  │ (Google)     │  │ (Anthropic)  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Supabase / PostgreSQL                    │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  - Users Table                             │ │  │
│  │  │  - Projects Table                          │ │  │
│  │  │  - Documents Table                         │ │  │
│  │  │  - Conversation_History Table              │ │  │
│  │  │  - Generated_Content Table                 │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         File Storage (Supabase Storage)          │  │
│  │  - Uploaded Documents (PDF, DOCX)                │  │
│  │  - Generated Proposals                           │  │
│  │  - User Avatars                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
4.2 기술 스택
4.2.1 Frontend
분류기술버전용도FrameworkNext.js14.xReact 프레임워크LanguageTypeScript5.x타입 안정성State ManagementZustand4.x전역 상태 관리StylingTailwind CSS3.x스타일링UI Componentsshadcn/uiLatestUI 컴포넌트 라이브러리FormsReact Hook Form7.x폼 관리HTTP ClientAxios1.xAPI 통신File Uploadreact-dropzone14.x파일 업로드Rich Text EditorTipTap2.x문서 편집ChartsRecharts2.x데이터 시각화
4.2.2 Backend
분류기술버전용도RuntimeNode.js20.x LTS서버 런타임FrameworkExpress.js4.x웹 프레임워크LanguageTypeScript5.x타입 안정성AuthenticationJWT9.x인증/인가PDF Parserpdf-parse1.xPDF 파싱DOCX Parsermammoth1.xDOCX 파싱DOCX Generatordocxtemplater3.xDOCX 생성ValidationJoi17.x입력 검증LoggingWinston3.x로깅TestingJest29.x단위 테스트
4.2.3 Database & Storage
분류기술버전용도DatabasePostgreSQL15.x관계형 DBBaaSSupabaseLatest백엔드 서비스ORMPrisma5.xORMFile StorageSupabase StorageLatest파일 저장소CacheRedis7.x캐싱 (선택)
4.2.4 AI Services
서비스Provider용도GeminiGoogle문서 분석, 콘텐츠 생성ClaudeAnthropic긴 문서 처리, 법령 분석OpenChatCommunity오픈소스 대안
4.2.5 DevOps
분류기술용도HostingVercelFrontend 호스팅Backend HostingAWS EC2 / RailwayBackend 호스팅CI/CDGitHub Actions자동 배포MonitoringSentry에러 추적AnalyticsGoogle Analytics사용자 분석
4.3 시스템 흐름도
4.3.1 문서 처리 플로우
[사용자] 
   ↓ 1. 문서 업로드 (PDF/DOCX)
[Frontend]
   ↓ 2. Multipart Form Data
[Backend API]
   ↓ 3. 파일 저장
[Supabase Storage]
   ↓ 4. 문서 파싱
[Document Parser]
   ↓ 5. 텍스트 추출 + 구조 분석
[AI Service (Claude/Gemini)]
   ↓ 6. 목차 생성 + 내용 분석
[Database]
   ↓ 7. 결과 저장
[Frontend]
   ↓ 8. 사용자에게 표시
[사용자]
4.3.2 콘텐츠 생성 플로우
[사용자]
   ↓ 1. 목차 항목 선택
[Frontend]
   ↓ 2. API 요청 (목차 + 문서 컨텍스트)
[Backend API]
   ↓ 3. 프롬프트 구성
[Prompt Engineering Service]
   ↓ 4. AI API 호출
[AI Service (선택된 Provider)]
   ↓ 5. 응답 + 법령 근거 추출
[Response Processor]
   ↓ 6. 결과 저장 + 히스토리 기록
[Database]
   ↓ 7. 결과 반환
[Frontend]
   ↓ 8. 사용자에게 표시 (실시간 스트리밍)
[사용자]

5. 기능 요구사항
5.1 필수 기능 (MVP)
5.1.1 사용자 관리 (User Management)
기능 ID: UM-001
우선순위: P0 (Critical)
UM-001-01: 회원가입
요구사항:

이메일 기반 회원가입
비밀번호 강도 검증 (최소 8자, 영문+숫자+특수문자)
이메일 인증 필수
소셜 로그인 지원 (Google, Naver, Kakao)

User Story:
As a 신규 사용자,
I want to 이메일로 회원가입을 하고 싶다,
So that 서비스를 이용할 수 있다.
Acceptance Criteria:

 이메일 형식 검증
 비밀번호 강도 체크
 이메일 인증 링크 발송
 중복 가입 방지
 개인정보 처리방침 동의

데이터 모델:
typescriptinterface User {
  id: string; // UUID
  email: string; // unique
  password: string; // hashed
  name: string;
  company?: string;
  phone?: string;
  email_verified: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**API Endpoint:**
```
POST /api/auth/register
Body: {
  email: string,
  password: string,
  name: string,
  company?: string
}
Response: {
  success: boolean,
  message: string,
  data: { userId: string }
}
```

##### UM-001-02: 로그인

**요구사항:**
- 이메일 + 비밀번호 로그인
- 소셜 로그인 (Google, Naver, Kakao)
- JWT 토큰 발급 (Access Token + Refresh Token)
- 로그인 기록 저장

**User Story:**
```
As a 등록된 사용자,
I want to 이메일과 비밀번호로 로그인하고 싶다,
So that 내 프로젝트에 접근할 수 있다.
```

**Acceptance Criteria:**
- [ ] 이메일 인증 완료 사용자만 로그인 가능
- [ ] 5회 이상 실패 시 계정 잠금 (15분)
- [ ] JWT 토큰 발급 (유효기간: 1시간)
- [ ] Refresh Token 발급 (유효기간: 7일)

**API Endpoint:**
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  data: {
    accessToken: string,
    refreshToken: string,
    user: UserProfile
  }
}
```

##### UM-001-03: 프로필 관리

**요구사항:**
- 프로필 조회/수정
- 비밀번호 변경
- 회원 탈퇴

**API Endpoints:**
```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/password
DELETE /api/users/account
```

---

#### 5.1.2 문서 업로드 및 분석 (Document Upload & Analysis)

**기능 ID**: DUA-001  
**우선순위**: P0 (Critical)

##### DUA-001-01: 문서 업로드

**요구사항:**
- 지원 형식: PDF, DOCX
- 최대 파일 크기: 10MB
- 다중 파일 업로드 지원 (최대 3개)
- Drag & Drop 지원
- 업로드 진행률 표시

**User Story:**
```
As a 사용자,
I want to 공고문, 과업지시서, 계약서를 업로드하고 싶다,
So that AI가 이를 분석하여 수행계획서를 작성할 수 있다.
Acceptance Criteria:

 PDF, DOCX 파일만 업로드 가능
 파일 크기 검증 (10MB 이하)
 악성 파일 검사
 업로드 진행률 실시간 표시
 업로드 완료 후 자동 분석 시작

데이터 모델:
typescriptinterface Document {
  id: string; // UUID
  project_id: string; // FK
  user_id: string; // FK
  file_name: string;
  file_type: 'pdf' | 'docx';
  file_size: number; // bytes
  file_url: string; // Supabase Storage URL
  document_type: 'announcement' | 'specification' | 'contract' | 'other';
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';
  extracted_text?: string;
  metadata?: JSON;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**API Endpoint:**
```
POST /api/documents/upload
Content-Type: multipart/form-data
Body: {
  project_id: string,
  files: File[],
  document_types: string[]
}
Response: {
  success: boolean,
  data: {
    documents: Document[]
  }
}
```

##### DUA-001-02: 문서 파싱

**요구사항:**
- PDF 텍스트 추출
- DOCX 텍스트 및 구조 추출
- 테이블 데이터 추출
- 이미지 내 텍스트 OCR (선택)

**처리 플로우:**
```
1. 파일 다운로드 (Supabase Storage)
2. MIME Type 검증
3. 파서 선택 (PDF/DOCX)
4. 텍스트 추출
5. 구조 분석 (제목, 항목, 표 등)
6. 메타데이터 저장
7. AI 분석 준비
```

**API Endpoint:**
```
POST /api/documents/{documentId}/parse
Response: {
  success: boolean,
  data: {
    extracted_text: string,
    structure: DocumentStructure,
    tables: Table[],
    metadata: {
      pages: number,
      word_count: number,
      has_tables: boolean
    }
  }
}
```

##### DUA-001-03: AI 문서 분석

**요구사항:**
- 문서 유형 자동 인식 (공고문/과업지시서/계약서)
- 주요 정보 추출:
  - 사업명
  - 발주기관
  - 계약금액
  - 과업 범위
  - 법적 근거
  - 제출 성과물
  - 일정
- 키워드 추출
- 법령 및 기준 인식

**User Story:**
```
As a 사용자,
I want to AI가 업로드한 문서를 자동으로 분석하길 원한다,
So that 중요 정보를 빠르게 파악하고 수행계획서를 작성할 수 있다.
Acceptance Criteria:

 문서 유형 90% 이상 정확도
 주요 정보 추출 85% 이상 정확도
 처리 시간 5분 이내
 분석 결과 저장

데이터 모델:
typescriptinterface DocumentAnalysis {
  id: string;
  document_id: string; // FK
  analysis_type: 'announcement' | 'specification' | 'contract';
  extracted_info: {
    project_name?: string;
    client_organization?: string;
    contract_amount?: number;
    scope_of_work?: string[];
    legal_basis?: string[];
    deliverables?: string[];
    schedule?: {
      start_date?: string;
      end_date?: string;
      milestones?: Milestone[];
    };
  };
  keywords: string[];
  confidence_score: number; // 0-1
  ai_provider: 'gemini' | 'claude' | 'openchat';
  created_at: timestamp;
}
```

**API Endpoint:**
```
POST /api/documents/{documentId}/analyze
Response: {
  success: boolean,
  data: {
    analysis: DocumentAnalysis
  }
}
```

---

#### 5.1.3 목차 생성 (Table of Contents Generation)

**기능 ID**: TOC-001  
**우선순위**: P0 (Critical)

##### TOC-001-01: 자동 목차 생성

**요구사항:**
- 업로드된 문서 기반 목차 자동 생성
- 표준 수행계획서 구조 반영
- 사용자 커스터마이징 가능
- 계층 구조 지원 (최대 4단계)

**User Story:**
```
As a 사용자,
I want to 업로드한 문서를 분석하여 자동으로 목차를 생성하고 싶다,
So that 수행계획서의 구조를 빠르게 파악하고 수정할 수 있다.
```

**Acceptance Criteria:**
- [ ] 문서 분석 후 5초 이내 목차 생성
- [ ] 최소 10개 이상의 주요 항목 포함
- [ ] 법령 근거 항목 자동 포함
- [ ] 사용자가 항목 추가/삭제/순서 변경 가능

**표준 목차 구조:**
```
제1장 과업의 개요
  1.1 과업의 배경 및 목적
  1.2 과업의 범위
  1.3 관련 법규 및 기준
제2장 과업 수행 계획
  2.1 과업 수행 조직
  2.2 과업 수행 일정
  2.3 과업 수행 방법
제3장 품질 관리 계획
  3.1 품질관리 체계
  3.2 단계별 품질관리
제4장 안전 및 보안 관리
제5장 계약 이행 관리
제6장 청렴 이행 서약
제7장 특기사항
제8장 기대 효과
데이터 모델:
typescriptinterface TableOfContents {
  id: string;
  project_id: string; // FK
  sections: Section[];
  created_at: timestamp;
  updated_at: timestamp;
}

interface Section {
  id: string;
  title: string;
  level: number; // 1-4
  order: number;
  parent_id?: string;
  status: 'pending' | 'in_progress' | 'completed';
  content?: string;
  subsections?: Section[];
}
```

**API Endpoint:**
```
POST /api/projects/{projectId}/toc/generate
Body: {
  document_ids: string[],
  template?: 'standard' | 'engineering' | 'consulting'
}
Response: {
  success: boolean,
  data: {
    toc: TableOfContents
  }
}
```

##### TOC-001-02: 목차 편집

**요구사항:**
- 항목 추가/삭제
- 항목 순서 변경 (Drag & Drop)
- 항목 제목 수정
- 하위 항목 추가

**API Endpoints:**
```
PUT /api/projects/{projectId}/toc/sections/{sectionId}
POST /api/projects/{projectId}/toc/sections
DELETE /api/projects/{projectId}/toc/sections/{sectionId}
PUT /api/projects/{projectId}/toc/reorder
```

---

#### 5.1.4 콘텐츠 생성 (Content Generation)

**기능 ID**: CG-001  
**우선순위**: P0 (Critical)

##### CG-001-01: 항목별 콘텐츠 자동 생성

**요구사항:**
- 목차 항목 선택 시 자동 콘텐츠 생성
- 법령 및 기준 자동 인용
- 출처 표기
- 실시간 스트리밍 표시

**User Story:**
```
As a 사용자,
I want to 목차 항목을 클릭하면 해당 내용이 자동으로 작성되길 원한다,
So that 수동으로 작성하는 시간을 절약할 수 있다.
```

**Acceptance Criteria:**
- [ ] 항목당 평균 3분 이내 생성
- [ ] 법령 근거 자동 포함
- [ ] 출처 링크 제공
- [ ] 실시간 스트리밍으로 표시
- [ ] 생성된 내용 편집 가능

**프롬프트 구조:**
```
시스템 프롬프트:
"당신은 공공기관 용역 수행계획서 작성 전문가입니다. 
다음 문서를 기반으로 '{section_title}' 항목을 작성해주세요.
법령 및 기준을 명확히 인용하고 출처를 표기해주세요."

컨텍스트:
- 공고문: {announcement_text}
- 과업지시서: {specification_text}
- 계약서: {contract_text}

작성 요청:
- 항목: {section_title}
- 상위 항목: {parent_section}
- 하위 항목: {subsections}

출력 형식:
- Markdown 형식
- 법령 근거는 **법적 근거: ** 로 표기
- 표는 Markdown Table 형식
데이터 모델:
typescriptinterface GeneratedContent {
  id: string;
  section_id: string; // FK
  project_id: string; // FK
  content: string; // Markdown
  legal_references: LegalReference[];
  sources: Source[];
  ai_provider: 'gemini' | 'claude' | 'openchat';
  tokens_used: number;
  generation_time: number; // seconds
  version: number;
  status: 'generating' | 'completed' | 'error';
  created_at: timestamp;
}

interface LegalReference {
  law_name: string;
  article: string;
  content: string;
  url?: string;
}

interface Source {
  document_id: string;
  page?: number;
  excerpt: string;
}
```

**API Endpoint:**
```
POST /api/projects/{projectId}/sections/{sectionId}/generate
Body: {
  ai_provider?: 'gemini' | 'claude' | 'openchat',
  style?: 'formal' | 'standard' | 'concise',
  include_legal_basis: boolean,
  max_length?: number
}
Response: (SSE Stream)
{
  event: 'token',
  data: { token: string }
}
{
  event: 'complete',
  data: { content: GeneratedContent }
}
```

##### CG-001-02: 리서치 및 출처 확인

**요구사항:**
- AI 생성 콘텐츠의 출처 자동 추적
- 법령 데이터베이스 연동
- 인용 정확도 검증
- 출처 링크 제공

**법령 데이터베이스 소스:**
- 국가법령정보센터 API
- 행정안전부 공공데이터 포털
- 한국농어촌공사 내부 규정

**API Endpoint:**
```
POST /api/projects/{projectId}/research
Body: {
  section_id: string,
  keywords: string[],
  search_legal_basis: boolean
}
Response: {
  success: boolean,
  data: {
    sources: Source[],
    legal_references: LegalReference[],
    citations: Citation[]
  }
}
```

##### CG-001-03: 콘텐츠 편집

**요구사항:**
- Rich Text Editor (TipTap)
- 실시간 저장 (Auto-save)
- 버전 관리
- Markdown 지원
- 표 삽입/편집
- 이미지 삽입

**API Endpoints:**
```
PUT /api/projects/{projectId}/sections/{sectionId}/content
GET /api/projects/{projectId}/sections/{sectionId}/versions
POST /api/projects/{projectId}/sections/{sectionId}/revert/{versionId}
```

---

#### 5.1.5 문서 다운로드 (Document Export)

**기능 ID**: DE-001  
**우선순위**: P0 (Critical)

##### DE-001-01: 다양한 형식으로 내보내기

**요구사항:**
- 지원 형식: DOCX, PDF, Markdown
- 템플릿 적용 (표지, 헤더, 푸터)
- 목차 자동 생성
- 페이지 번호 자동 삽입

**User Story:**
```
As a 사용자,
I want to 작성된 수행계획서를 DOCX 또는 PDF로 다운로드하고 싶다,
So that 제출하거나 추가 편집할 수 있다.
```

**Acceptance Criteria:**
- [ ] DOCX 다운로드 (편집 가능)
- [ ] PDF 다운로드 (최종 제출용)
- [ ] Markdown 다운로드 (GitHub 등 공유)
- [ ] 다운로드 시간 30초 이내
- [ ] 템플릿 선택 가능

**DOCX 구조:**
```
- 표지
- 목차 (자동 생성)
- 본문 (Heading 1~4 스타일 적용)
- 표 (스타일 적용)
- 페이지 번호
- 헤더/푸터
데이터 모델:
typescriptinterface ExportRequest {
  id: string;
  project_id: string;
  user_id: string;
  format: 'docx' | 'pdf' | 'markdown';
  template: 'standard' | 'official' | 'modern';
  options: {
    include_toc: boolean;
    include_cover: boolean;
    page_numbers: boolean;
    header_footer: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
  file_url?: string;
  created_at: timestamp;
}
```

**API Endpoint:**
```
POST /api/projects/{projectId}/export
Body: {
  format: 'docx' | 'pdf' | 'markdown',
  template?: string,
  options?: ExportOptions
}
Response: {
  success: boolean,
  data: {
    export_id: string,
    status: string,
    download_url?: string
  }
}
```

##### DE-001-02: 다운로드 관리

**요구사항:**
- 다운로드 히스토리
- 재다운로드 가능
- 파일 유효기간 (7일)

**API Endpoints:**
```
GET /api/projects/{projectId}/exports
GET /api/projects/{projectId}/exports/{exportId}/download
```

---

#### 5.1.6 프로젝트 관리 (Project Management)

**기능 ID**: PM-001  
**우선순위**: P0 (Critical)

##### PM-001-01: 프로젝트 생성/조회

**요구사항:**
- 프로젝트 생성
- 프로젝트 목록 조회
- 프로젝트 상세 조회
- 프로젝트 검색

**User Story:**
```
As a 사용자,
I want to 여러 프로젝트를 생성하고 관리하고 싶다,
So that 각 용역 건별로 수행계획서를 구분하여 작성할 수 있다.
데이터 모델:
typescriptinterface Project {
  id: string;
  user_id: string; // FK
  name: string;
  description?: string;
  client_organization?: string;
  project_type: 'engineering' | 'consulting' | 'construction' | 'other';
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  contract_amount?: number;
  start_date?: date;
  end_date?: date;
  tags: string[];
  metadata?: JSON;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**API Endpoints:**
```
POST /api/projects
GET /api/projects
GET /api/projects/{projectId}
PUT /api/projects/{projectId}
DELETE /api/projects/{projectId}
GET /api/projects/search?q={query}
PM-001-02: 히스토리 관리
요구사항:

프로젝트별 활동 로그
문서 버전 히스토리
AI 생성 히스토리
편집 히스토리

데이터 모델:
typescriptinterface ProjectHistory {
  id: string;
  project_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'generated' | 'exported' | 'deleted';
  target_type: 'project' | 'document' | 'section' | 'content';
  target_id: string;
  changes?: JSON;
  metadata?: JSON;
  created_at: timestamp;
}
```

**API Endpoint:**
```
GET /api/projects/{projectId}/history

5.1.7 대화 및 컨텍스트 관리 (Conversation Management)
기능 ID: CM-001
우선순위: P1 (High)
CM-001-01: 대화 내역 저장
요구사항:

모든 AI 대화 저장
프로젝트별 대화 구분
대화 검색
대화 내보내기

데이터 모델:
typescriptinterface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  section_id?: string;
  messages: Message[];
  created_at: timestamp;
  updated_at: timestamp;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ai_provider?: string;
  tokens_used?: number;
  created_at: timestamp;
}
```

**API Endpoints:**
```
GET /api/projects/{projectId}/conversations
GET /api/projects/{projectId}/conversations/{conversationId}
POST /api/projects/{projectId}/conversations
POST /api/projects/{projectId}/conversations/{conversationId}/messages
```

---

### 5.2 부가 기능 (Phase 2)

#### 5.2.1 협업 기능

**기능 ID**: COLLAB-001  
**우선순위**: P2 (Medium)

- 프로젝트 공유
- 팀 멤버 초대
- 권한 관리 (Owner, Editor, Viewer)
- 실시간 협업 (WebSocket)
- 댓글 기능

#### 5.2.2 템플릿 관리

**기능 ID**: TEMPLATE-001  
**우선순위**: P2 (Medium)

- 커스텀 템플릿 생성
- 템플릿 라이브러리
- 템플릿 공유
- 템플릿 마켓플레이스

#### 5.2.3 AI 학습 및 개선

**기능 ID**: AI-001  
**우선순위**: P2 (Medium)

- 사용자 피드백 수집
- AI 응답 평가 (👍 👎)
- Fine-tuning 데이터 수집
- 맞춤형 AI 모델

---

## 6. 비기능 요구사항

### 6.1 성능 (Performance)

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| **페이지 로딩 시간** | 3초 이내 | Lighthouse |
| **API 응답 시간** | 500ms 이내 (95th percentile) | APM 도구 |
| **문서 업로드 속도** | 10MB/10초 이내 | 로그 분석 |
| **AI 콘텐츠 생성** | 첫 토큰 3초 이내 | 타이머 측정 |
| **동시 사용자** | 500명 | 부하 테스트 |
| **데이터베이스 쿼리** | 100ms 이내 | Query Profiling |

### 6.2 확장성 (Scalability)

- **수평 확장**: Kubernetes 기반 Auto-scaling
- **데이터베이스**: Read Replica 구성
- **파일 스토리지**: CDN 연동 (CloudFlare)
- **캐싱**: Redis 캐시 레이어

### 6.3 보안 (Security)

#### 6.3.1 인증 및 인가

- JWT 기반 인증
- Refresh Token 로테이션
- RBAC (Role-Based Access Control)
- 2FA (Two-Factor Authentication) - Phase 2

#### 6.3.2 데이터 보안

- HTTPS 강제 (TLS 1.3)
- 비밀번호 암호화 (bcrypt, salt rounds: 10)
- 민감 정보 암호화 (AES-256)
- SQL Injection 방어 (Prepared Statements)
- XSS 방어 (CSP 헤더)
- CSRF 방어 (CSRF 토큰)

#### 6.3.3 파일 보안

- 파일 타입 검증 (Magic Number)
- 파일 크기 제한 (10MB)
- 악성 코드 스캔 (ClamAV)
- 파일 접근 권한 관리

#### 6.3.4 API 보안

- Rate Limiting (100 req/min per IP)
- API Key 관리
- CORS 정책
- Request Validation

### 6.4 가용성 (Availability)

- **목표 가동률**: 99.5% (Uptime)
- **백업**: 일일 자동 백업 (Retention: 30일)
- **재해 복구**: RPO 1시간, RTO 4시간
- **모니터링**: Sentry, Grafana

### 6.5 유지보수성 (Maintainability)

- **코드 커버리지**: 80% 이상
- **문서화**: OpenAPI (Swagger)
- **로깅**: Structured Logging (Winston)
- **버전 관리**: Semantic Versioning

### 6.6 접근성 (Accessibility)

- **WCAG 2.1 Level AA** 준수
- 키보드 네비게이션
- 스크린 리더 지원
- 다국어 지원 (한국어, 영어) - Phase 2

### 6.7 호환성 (Compatibility)

#### 브라우저 지원

| 브라우저 | 최소 버전 |
|---------|----------|
| Chrome | 100+ |
| Firefox | 100+ |
| Safari | 15+ |
| Edge | 100+ |

#### 디바이스 지원

- Desktop (1920x1080 ~ 3840x2160)
- Tablet (768x1024 ~ 1024x768)
- Mobile (375x667 ~ 428x926)

---

## 7. 데이터베이스 설계

### 7.1 ERD (Entity Relationship Diagram)
```
┌─────────────┐         ┌─────────────┐
│   Users     │────1:N──│  Projects   │
└─────────────┘         └─────────────┘
       │                      │
       │                      │ 1:N
       │                      ↓
       │                ┌─────────────┐
       │                │  Documents  │
       │                └─────────────┘
       │                      │
       │                      │ 1:1
       │                      ↓
       │                ┌──────────────────┐
       │                │DocumentAnalysis  │
       │                └──────────────────┘
       │
       │                ┌─────────────────┐
       └────1:N─────────│TableOfContents  │
                        └─────────────────┘
                              │
                              │ 1:N
                              ↓
                        ┌─────────────┐
                        │  Sections   │
                        └─────────────┘
                              │
                              │ 1:N
                              ↓
                        ┌──────────────────┐
                        │GeneratedContent  │
                        └──────────────────┘
7.2 테이블 스키마
7.2.1 users
sqlCREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
7.2.2 projects
sqlCREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_organization VARCHAR(255),
  project_type VARCHAR(50), -- 'engineering', 'consulting', etc.
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'archived'
  contract_amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  tags TEXT[], -- Array of tags
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
7.2.3 documents
sqlCREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL, -- 'pdf', 'docx'
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  document_type VARCHAR(50), -- 'announcement', 'specification', 'contract', 'other'
  status VARCHAR(20) DEFAULT 'uploading', -- 'uploading', 'uploaded', 'processing', 'processed', 'error'
  extracted_text TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_status ON documents(status);
7.2.4 document_analyses
sqlCREATE TABLE document_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50), -- 'announcement', 'specification', 'contract'
  extracted_info JSONB, -- JSON structure for extracted information
  keywords TEXT[],
  confidence_score DECIMAL(3,2),
  ai_provider VARCHAR(20), -- 'gemini', 'claude', 'openchat'
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_analyses_document_id ON document_analyses(document_id);
7.2.5 table_of_contents
sqlCREATE TABLE table_of_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_toc_project_id ON table_of_contents(project_id);
7.2.6 sections
sqlCREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  toc_id UUID NOT NULL REFERENCES table_of_contents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  level INTEGER NOT NULL, -- 1, 2, 3, 4
  order_index INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_toc_id ON sections(toc_id);
CREATE INDEX idx_sections_parent_id ON sections(parent_id);
CREATE INDEX idx_sections_order ON sections(toc_id, order_index);
7.2.7 generated_contents
sqlCREATE TABLE generated_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  legal_references JSONB, -- Array of legal references
  sources JSONB, -- Array of sources
  ai_provider VARCHAR(20),
  tokens_used INTEGER,
  generation_time INTEGER, -- seconds
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_contents_section_id ON generated_contents(section_id);
CREATE INDEX idx_generated_contents_project_id ON generated_contents(project_id);
7.2.8 conversations
sqlCREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
7.2.9 messages
sqlCREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  ai_provider VARCHAR(20),
  tokens_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
7.2.10 export_requests
sqlCREATE TABLE export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format VARCHAR(20) NOT NULL, -- 'docx', 'pdf', 'markdown'
  template VARCHAR(50),
  options JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_export_requests_project_id ON export_requests(project_id);
CREATE INDEX idx_export_requests_user_id ON export_requests(user_id);
CREATE INDEX idx_export_requests_status ON export_requests(status);
7.2.11 project_history
sqlCREATE TABLE project_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'generated', 'exported', 'deleted'
  target_type VARCHAR(50), -- 'project', 'document', 'section', 'content'
  target_id UUID,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_history_project_id ON project_history(project_id);
CREATE INDEX idx_project_history_created_at ON project_history(created_at DESC);
7.3 데이터베이스 최적화
7.3.1 인덱싱 전략

Foreign Key 컬럼에 인덱스
자주 검색되는 컬럼 (status, created_at) 인덱스
JSONB 컬럼에 GIN 인덱스 (필요시)

7.3.2 파티셔닝

project_history 테이블: 월별 파티셔닝
messages 테이블: 분기별 파티셔닝

7.3.3 백업 전략

일일 전체 백업 (3 AM)
시간별 증분 백업
백업 보관 기간: 30일
재해 복구 테스트: 월 1회


8. API 명세
8.1 API 설계 원칙

RESTful API 설계
HTTP 상태 코드 표준 준수
JSON 요청/응답
API 버전 관리 (/api/v1/)
Rate Limiting
API 문서화 (Swagger/OpenAPI)

8.2 공통 응답 형식
성공 응답
json{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "message": "성공 메시지",
  "timestamp": "2025-02-20T10:00:00Z"
}
오류 응답
json{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 오류 메시지",
    "details": {
      // 추가 오류 정보
    }
  },
  "timestamp": "2025-02-20T10:00:00Z"
}
```

### 8.3 주요 API 엔드포인트

#### 8.3.1 인증 (Authentication)
```
POST /api/v1/auth/register        # 회원가입
POST /api/v1/auth/login           # 로그인
POST /api/v1/auth/logout          # 로그아웃
POST /api/v1/auth/refresh         # 토큰 갱신
POST /api/v1/auth/verify-email    # 이메일 인증
POST /api/v1/auth/forgot-password # 비밀번호 재설정 요청
POST /api/v1/auth/reset-password  # 비밀번호 재설정
```

#### 8.3.2 사용자 (Users)
```
GET    /api/v1/users/profile      # 프로필 조회
PUT    /api/v1/users/profile      # 프로필 수정
PUT    /api/v1/users/password     # 비밀번호 변경
DELETE /api/v1/users/account      # 계정 탈퇴
POST   /api/v1/users/avatar       # 아바타 업로드
```

#### 8.3.3 프로젝트 (Projects)
```
GET    /api/v1/projects           # 프로젝트 목록 조회
POST   /api/v1/projects           # 프로젝트 생성
GET    /api/v1/projects/:id       # 프로젝트 상세 조회
PUT    /api/v1/projects/:id       # 프로젝트 수정
DELETE /api/v1/projects/:id       # 프로젝트 삭제
GET    /api/v1/projects/search    # 프로젝트 검색
```

#### 8.3.4 문서 (Documents)
```
POST   /api/v1/projects/:id/documents/upload    # 문서 업로드
GET    /api/v1/projects/:id/documents           # 문서 목록
GET    /api/v1/documents/:id                    # 문서 상세
DELETE /api/v1/documents/:id                    # 문서 삭제
POST   /api/v1/documents/:id/parse              # 문서 파싱
POST   /api/v1/documents/:id/analyze            # 문서 분석
```

#### 8.3.5 목차 (Table of Contents)
```
POST /api/v1/projects/:id/toc/generate          # 목차 생성
GET  /api/v1/projects/:id/toc                   # 목차 조회
PUT  /api/v1/projects/:id/toc/sections/:sid     # 섹션 수정
POST /api/v1/projects/:id/toc/sections          # 섹션 추가
DELETE /api/v1/projects/:id/toc/sections/:sid   # 섹션 삭제
PUT /api/v1/projects/:id/toc/reorder            # 섹션 순서 변경
```

#### 8.3.6 콘텐츠 생성 (Content Generation)
```
POST /api/v1/projects/:id/sections/:sid/generate      # 콘텐츠 생성 (SSE)
PUT  /api/v1/projects/:id/sections/:sid/content       # 콘텐츠 수정
GET  /api/v1/projects/:id/sections/:sid/versions      # 버전 목록
POST /api/v1/projects/:id/sections/:sid/revert/:vid   # 버전 복원
POST /api/v1/projects/:id/research                    # 리서치
```

#### 8.3.7 내보내기 (Export)
```
POST /api/v1/projects/:id/export                # 내보내기 요청
GET  /api/v1/projects/:id/exports               # 내보내기 목록
GET  /api/v1/projects/:id/exports/:eid/download # 다운로드
```

#### 8.3.8 대화 (Conversations)
```
GET  /api/v1/projects/:id/conversations         # 대화 목록
POST /api/v1/projects/:id/conversations         # 새 대화 시작
GET  /api/v1/projects/:id/conversations/:cid    # 대화 상세
POST /api/v1/projects/:id/conversations/:cid/messages # 메시지 전송
```

#### 8.3.9 히스토리 (History)
```
GET /api/v1/projects/:id/history                # 프로젝트 히스토리
GET /api/v1/users/activity                      # 사용자 활동 로그
```

### 8.4 Rate Limiting

| 사용자 등급 | 분당 요청 수 | 일일 AI 요청 |
|------------|------------|--------------|
| Free | 60 | 10 |
| Pro | 300 | 100 |
| Enterprise | 1000 | Unlimited |

---

## 9. UI/UX 설계

### 9.1 디자인 시스템

#### 9.1.1 컬러 팔레트
```
Primary Colors:
- Primary: #3B82F6 (Blue)
- Secondary: #8B5CF6 (Purple)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)

Neutral Colors:
- Gray 50: #F9FAFB
- Gray 100: #F3F4F6
- Gray 200: #E5E7EB
- Gray 300: #D1D5DB
- Gray 400: #9CA3AF
- Gray 500: #6B7280
- Gray 600: #4B5563
- Gray 700: #374151
- Gray 800: #1F2937
- Gray 900: #111827
```

#### 9.1.2 타이포그래피
```
Font Family:
- Primary: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Monospace: "Fira Code", "Consolas", monospace

Font Sizes:
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
```

#### 9.1.3 Spacing
```
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
```

### 9.2 주요 화면 구성

#### 9.2.1 대시보드

**구성 요소:**
- Header (로고, 네비게이션, 사용자 메뉴)
- Sidebar (프로젝트 목록, 최근 항목)
- Main Content (프로젝트 카드 그리드)
- Quick Actions (새 프로젝트, 문서 업로드)

**Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Projects  Settings    [User Menu] │
├──────────┬─────────────────────────────────────────────┤
│          │  내 프로젝트                                 │
│ Sidebar  │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│          │  │ Project │ │ Project │ │ Project │      │
│ Recent   │  │   #1    │ │   #2    │ │   #3    │      │
│ Projects │  └─────────┘ └─────────┘ └─────────┘      │
│          │                                              │
│ [+ New]  │  최근 활동                                   │
│          │  - Document uploaded (2 hours ago)         │
│          │  - Content generated (5 hours ago)         │
└──────────┴─────────────────────────────────────────────┘
```

#### 9.2.2 프로젝트 상세

**구성 요소:**
- Project Header (제목, 상태, 액션 버튼)
- Tabs (문서, 목차, 콘텐츠, 히스토리)
- Document List
- TOC Tree View
- Content Editor

**Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│  ← Back    [백석지구 수리시설정비사업]    [Export] [⚙] │
├────────────────────────────────────────────────────────┤
│  [문서] [목차] [콘텐츠] [히스토리]                      │
├──────────┬─────────────────────────────────────────────┤
│          │  제1장 과업의 개요                           │
│ 목차     │    1.1 배경 및 목적  ✓                      │
│ Tree     │    1.2 과업 범위     ⏳                     │
│          │  제2장 과업 수행 계획                        │
│ [+Add]   │    2.1 조직          [Generate]            │
│          │    2.2 일정                                  │
│          │                                              │
│          │  [콘텐츠 영역]                               │
│          │  # 1.1 과업의 배경 및 목적                  │
│          │  본 용역은...                                │
│          │  [Edit] [Regenerate]                        │
└──────────┴─────────────────────────────────────────────┘
```

#### 9.2.3 문서 업로드

**구성 요소:**
- Drag & Drop Zone
- File List
- Upload Progress
- Document Type Selection

**Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│  문서 업로드                                    [×]     │
├────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐   │
│  │                                                │   │
│  │     📄 파일을 드래그하거나 클릭하여 업로드      │   │
│  │                                                │   │
│  │     지원 형식: PDF, DOCX                       │   │
│  │     최대 크기: 10MB                            │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  업로드된 파일:                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📄 공고문.pdf          [공고문 ▼]      [×]     │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 85%                     │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│               [취소]           [업로드 시작]           │
└────────────────────────────────────────────────────────┘
9.3 반응형 디자인
Desktop (≥1024px)

3단 레이아웃 (Sidebar + Main + Panel)
전체 기능 접근

Tablet (768px ~ 1023px)

2단 레이아웃 (Main + Collapsible Sidebar)
주요 기능 접근

Mobile (≤767px)

1단 레이아웃 (Full-width)
햄버거 메뉴
터치 최적화


10. 개발 로드맵
10.1 Phase 1: MVP (3개월)
목표: 핵심 기능 구현 및 알파 테스트
Month 1: 기반 구조
Week 1-2:

 프로젝트 초기 설정
 데이터베이스 스키마 구축
 인증 시스템 구현
 기본 UI 레이아웃

Week 3-4:

 문서 업로드 기능
 PDF/DOCX 파싱
 파일 스토리지 연동
 프로젝트 관리 CRUD

Month 2: 핵심 기능
Week 5-6:

 AI 통합 (Gemini/Claude)
 문서 분석 기능
 목차 자동 생성
 프롬프트 엔지니어링

Week 7-8:

 콘텐츠 자동 생성
 실시간 스트리밍
 편집 기능
 버전 관리

Month 3: 완성 및 테스트
Week 9-10:

 문서 내보내기 (DOCX/PDF)
 히스토리 관리
 대화 기능
 검색 기능

Week 11-12:

 통합 테스트
 버그 수정
 성능 최적화
 알파 테스트

Deliverables:

작동하는 MVP
알파 테스트 보고서
사용자 피드백

10.2 Phase 2: 고도화 (2개월)
목표: 부가 기능 추가 및 베타 출시
Month 4: 부가 기능
Week 13-14:

 협업 기능 (공유, 권한 관리)
 댓글 기능
 알림 기능

Week 15-16:

 템플릿 관리
 커스텀 템플릿 생성
 템플릿 라이브러리

Month 5: 개선 및 출시
Week 17-18:

 UI/UX 개선
 접근성 개선
 다국어 지원 (영어)

Week 19-20:

 베타 테스트
 보안 강화
 성능 튜닝
 공식 출시

Deliverables:

베타 버전 출시
마케팅 자료
사용자 문서

10.3 Phase 3: 확장 (진행 중)
목표: 시장 확대 및 AI 개선

 AI 모델 Fine-tuning
 엔터프라이즈 기능
 API 제공
 모바일 앱
 통합 (Google Drive, Dropbox 등)


11. 위험 관리
11.1 기술적 위험
위험영향도발생 가능성대응 전략AI API 비용 초과높음중간- 캐싱 전략<br>- 토큰 사용량 모니터링<br>- 사용자별 쿼터 설정AI 응답 품질 저하높음중간- 다중 AI Provider<br>- 프롬프트 개선<br>- 사용자 피드백 수집문서 파싱 오류중간높음- 다양한 파서 테스트<br>- 오류 처리 강화<br>- 사용자 수동 입력 옵션성능 저하중간중간- 캐싱<br>- 최적화<br>- 부하 테스트보안 취약점높음낮음- 보안 감사<br>- 정기 업데이트<br>- 침투 테스트
11.2 비즈니스 위험
위험영향도발생 가능성대응 전략사용자 확보 실패높음중간- 무료 체험<br>- 마케팅 강화<br>- 파트너십경쟁 심화중간높음- 차별화 전략<br>- 빠른 개선<br>- 고객 만족도법적 이슈높음낮음- 법률 자문<br>- 이용약관 명확화<br>- 개인정보 보호수익 모델 실패높음중간- 다양한 가격 실험<br>- 가치 제안 개선
11.3 운영 위험
위험영향도발생 가능성대응 전략인력 부족중간중간- 아웃소싱<br>- 우선순위 조정일정 지연중간높음- 버퍼 시간<br>- 애자일 방법론예산 초과높음중간- 비용 모니터링<br>- 범위 조정

12. 성공 지표
12.1 사용자 지표
지표목표 (6개월)측정 도구MAU (월간 활성 사용자)500명Google AnalyticsDAU (일간 활성 사용자)100명Google AnalyticsRetention Rate (재방문율)40%MixpanelChurn Rate (이탈율)<5%MixpanelNPS (추천 지수)40+설문
12.2 비즈니스 지표
지표목표 (6개월)측정 도구Conversion Rate (무료→유료)20%내부 분석MRR (월간 반복 수익)$5,000StripeARPU (사용자당 평균 수익)$50내부 분석CAC (고객 획득 비용)<$30마케팅 분석LTV (고객 생애 가치)>$200내부 분석
12.3 제품 지표
지표목표측정 도구평균 프로젝트 생성 시간<10분로그 분석AI 생성 만족도4.0/5.0피드백문서 다운로드율80%로그 분석페이지 로딩 시간<3초Lighthouse버그 발생률<1%Sentry
12.4 기술 지표
지표목표측정 도구시스템 가용성99.5%Uptime RobotAPI 응답 시간<500ms (95th)APMAI 생성 시간<5분로그 분석에러율<0.1%Sentry코드 커버리지80%Jest

13. 부록
13.1 용어 정의
용어설명수행계획서공공기관 용역 수주를 위해 제출하는 제안서과업지시서발주기관이 제시하는 용역 범위 및 요구사항법령 근거관련 법률 및 시행령 조항목차 (TOC)Table of Contents, 문서 구조SSEServer-Sent Events, 실시간 스트리밍JWTJSON Web Token, 인증 토큰
13.2 참고 문서

법령 및 기준

국가계약법
엔지니어링산업진흥법
농업생산기반정비사업 계획설계기준


기술 문서

Next.js Documentation
Supabase Documentation
Gemini API Reference
Claude API Reference


디자인

Material Design Guidelines
shadcn/ui Documentation



13.3 변경 이력
버전날짜변경 내용작성자1.02025-02-20초안 작성AI Dev Team

승인
역할이름서명날짜Product OwnerTech LeadBusiness Stakeholder

[문서 끝]