# APAS 개발 계획서

## 1. 개발 개요

### 1.1 프로젝트 정보
- **프로젝트명**: APAS (Automated Proposal Authoring System)
- **개발 기간**: 4개월 (MVP)
- **개발 방법론**: Agile (2주 스프린트)
- **목표**: AI 기반 수행계획서 자동 작성 시스템 MVP 출시

### 1.2 핵심 목표
- 작성 시간 70% 단축 (7일 → 2일)
- 법령 준수율 95% 이상
- AI 정확도 90% 이상
- 시스템 가용성 99.5% 이상

---

## 2. Phase 1: MVP 개발 (3개월)

### Month 1: 기반 구조 구축

#### Week 1-2: 개발 환경 및 인증 시스템
**목표**: 프로젝트 기반 설정 및 사용자 인증 시스템 구현

**작업 항목**:
1. **프로젝트 초기 설정**
   - ✅ Git 저장소 초기화
   - ✅ GitHub 저장소 생성
   - Frontend: Next.js 14.x + TypeScript 설정
   - Backend: Express.js + TypeScript 설정
   - 개발 환경 설정 (ESLint, Prettier, Husky)

2. **데이터베이스 설계 및 구축**
   - Supabase 프로젝트 생성
   - PostgreSQL 스키마 설계
   - Prisma 설정 및 마이그레이션
   - 테이블 생성 (users, projects 등)

3. **인증 시스템 구현**
   - JWT 기반 인증 시스템
   - 회원가입/로그인 API
   - 이메일 인증
   - 소셜 로그인 (Google)
   - Frontend 인증 UI

4. **기본 UI 레이아웃**
   - 디자인 시스템 설정 (Tailwind CSS, shadcn/ui)
   - Header/Sidebar 컴포넌트
   - 대시보드 레이아웃
   - 반응형 디자인 기초

**예상 산출물**:
- 작동하는 로그인/회원가입 시스템
- 기본 대시보드 UI
- API 문서 (Swagger)

---

#### Week 3-4: 문서 업로드 및 파일 처리
**목표**: 문서 업로드 및 파싱 기능 구현

**작업 항목**:
1. **파일 업로드 시스템**
   - Supabase Storage 연동
   - Drag & Drop 파일 업로드 UI
   - 파일 크기/형식 검증
   - 업로드 진행률 표시
   - 다중 파일 업로드 (최대 3개)

2. **문서 파싱 엔진**
   - PDF 파서 구현 (pdf-parse)
   - DOCX 파서 구현 (mammoth)
   - 텍스트 추출 및 구조 분석
   - 테이블 데이터 추출
   - 메타데이터 저장

3. **프로젝트 관리 CRUD**
   - 프로젝트 생성/조회/수정/삭제 API
   - 프로젝트 목록 UI
   - 프로젝트 상세 페이지
   - 문서 목록 관리

4. **파일 보안**
   - 파일 타입 검증 (Magic Number)
   - 악성 코드 스캔 기초
   - 접근 권한 관리

**예상 산출물**:
- 문서 업로드 및 저장 시스템
- PDF/DOCX 파싱 기능
- 프로젝트 관리 기능

---

### Month 2: AI 통합 및 핵심 기능

#### Week 5-6: AI 통합 및 문서 분석
**목표**: AI Provider 통합 및 문서 자동 분석

**작업 항목**:
1. **AI 서비스 통합**
   - Gemini API 연동
   - Claude API 연동
   - OpenChat API 연동 (선택)
   - AI Provider 추상화 레이어
   - 에러 처리 및 폴백

2. **프롬프트 엔지니어링**
   - 문서 분석용 프롬프트 설계
   - 한국어 공공문서 특화 프롬프트
   - 법령 추출 프롬프트
   - 컨텍스트 관리 전략

3. **문서 분석 기능**
   - 문서 유형 자동 인식
   - 주요 정보 추출 (사업명, 발주기관, 금액 등)
   - 법령 및 기준 자동 추출
   - 키워드 분석
   - 신뢰도 점수 계산

4. **분석 결과 UI**
   - 분석 결과 표시 페이지
   - 추출된 정보 편집 기능
   - 법령 목록 표시
   - 신뢰도 시각화

**예상 산출물**:
- 작동하는 AI 문서 분석 시스템
- 정보 추출 정확도 85% 이상
- 분석 결과 대시보드

---

#### Week 7-8: 목차 생성 및 콘텐츠 자동 작성
**목표**: AI 기반 목차 생성 및 섹션별 콘텐츠 자동 생성

**작업 항목**:
1. **자동 목차 생성**
   - 표준 수행계획서 목차 템플릿
   - AI 기반 목차 자동 생성
   - 계층 구조 생성 (최대 4단계)
   - 목차 커스터마이징 UI

2. **목차 편집 기능**
   - Tree View 컴포넌트
   - Drag & Drop 순서 변경
   - 섹션 추가/삭제/수정
   - 섹션 상태 관리 (pending/in_progress/completed)

3. **콘텐츠 자동 생성**
   - 섹션별 콘텐츠 생성 API
   - SSE 스트리밍 구현
   - 법령 근거 자동 인용
   - 출처 추적 및 표기
   - 토큰 사용량 모니터링

4. **콘텐츠 편집 기능**
   - Rich Text Editor (TipTap)
   - Markdown 지원
   - 실시간 자동 저장
   - 버전 관리
   - 표/이미지 삽입

**예상 산출물**:
- 자동 목차 생성 시스템
- 섹션별 콘텐츠 자동 작성 기능
- 실시간 스트리밍 UI
- 편집 가능한 에디터

---

### Month 3: 완성 및 테스트

#### Week 9-10: 문서 내보내기 및 부가 기능
**목표**: 문서 내보내기 및 히스토리 관리

**작업 항목**:
1. **문서 내보내기**
   - DOCX 생성 엔진 (docxtemplater)
   - PDF 생성 (DOCX → PDF 변환)
   - Markdown 내보내기
   - 템플릿 시스템 (표지, 헤더, 푸터)
   - 목차 자동 생성
   - 페이지 번호 삽입

2. **히스토리 관리**
   - 프로젝트 활동 로그
   - 문서 버전 히스토리
   - AI 생성 히스토리
   - 편집 히스토리
   - 타임라인 UI

3. **대화 기능**
   - 대화 내역 저장
   - 프로젝트별 대화 구분
   - 대화 검색
   - 대화 내보내기

4. **검색 기능**
   - 프로젝트 검색
   - 콘텐츠 전체 검색
   - 태그 기반 필터링
   - 날짜 범위 필터

**예상 산출물**:
- DOCX/PDF/Markdown 내보내기
- 히스토리 관리 시스템
- 대화 및 검색 기능

---

#### Week 11-12: 통합 테스트 및 최적화
**목표**: 품질 보증 및 성능 최적화

**작업 항목**:
1. **통합 테스트**
   - E2E 테스트 작성 (Playwright)
   - API 통합 테스트
   - 사용자 시나리오 테스트
   - 크로스 브라우저 테스트
   - 모바일 반응형 테스트

2. **단위 테스트**
   - Frontend 컴포넌트 테스트
   - Backend API 테스트
   - 문서 파싱 테스트
   - AI 응답 처리 테스트
   - 커버리지 80% 목표

3. **성능 최적화**
   - 페이지 로딩 속도 최적화
   - API 응답 시간 개선
   - 데이터베이스 쿼리 최적화
   - 캐싱 전략 구현
   - 이미지 최적화

4. **버그 수정 및 개선**
   - 버그 트래킹 (GitHub Issues)
   - 우선순위별 버그 수정
   - UI/UX 개선
   - 에러 핸들링 강화
   - 로깅 시스템 개선

5. **알파 테스트**
   - 내부 테스트 진행
   - 피드백 수집
   - 사용성 테스트
   - 성능 측정
   - 개선 사항 적용

**예상 산출물**:
- 테스트 완료된 MVP
- 알파 테스트 보고서
- 성능 최적화 보고서
- 배포 준비 완료

---

## 3. Phase 2: 고도화 (2개월)

### Month 4: 부가 기능 추가

#### Week 13-14: 협업 기능
**작업 항목**:
- 프로젝트 공유 기능
- 팀 멤버 초대
- 권한 관리 (Owner/Editor/Viewer)
- 실시간 협업 (WebSocket)
- 댓글 기능
- 알림 시스템

#### Week 15-16: 템플릿 관리
**작업 항목**:
- 커스텀 템플릿 생성
- 템플릿 라이브러리
- 템플릿 미리보기
- 템플릿 공유
- 템플릿 카테고리

### Month 5: 개선 및 출시

#### Week 17-18: UI/UX 개선
**작업 항목**:
- 접근성 개선 (WCAG 2.1 AA)
- 키보드 네비게이션
- 다국어 지원 (영어)
- 다크 모드
- 사용자 온보딩

#### Week 19-20: 베타 테스트 및 출시
**작업 항목**:
- 베타 테스터 모집
- 베타 테스트 진행
- 피드백 반영
- 보안 강화
- 성능 튜닝
- 공식 출시
- 마케팅 자료 제작

---

## 4. Phase 3: 확장 (진행 중)

### 주요 목표
- AI 모델 Fine-tuning
- 엔터프라이즈 기능 추가
- API 제공
- 모바일 앱 개발
- 외부 서비스 통합

---

## 5. 개발 우선순위

### P0 (Critical) - MVP 필수 기능
- [x] 프로젝트 초기화
- [ ] 사용자 인증 시스템
- [ ] 문서 업로드 및 파싱
- [ ] AI 문서 분석
- [ ] 목차 자동 생성
- [ ] 콘텐츠 자동 생성
- [ ] 문서 내보내기 (DOCX/PDF)
- [ ] 프로젝트 관리

### P1 (High) - MVP 권장 기능
- [ ] 히스토리 관리
- [ ] 대화 기능
- [ ] 검색 기능
- [ ] 버전 관리

### P2 (Medium) - Phase 2 기능
- [ ] 협업 기능
- [ ] 템플릿 관리
- [ ] 다국어 지원
- [ ] 접근성 개선

### P3 (Low) - Phase 3 기능
- [ ] AI Fine-tuning
- [ ] API 제공
- [ ] 모바일 앱

---

## 6. 기술 스택 상세

### Frontend
```
- Framework: Next.js 14.x
- Language: TypeScript 5.x
- State Management: Zustand 4.x
- Styling: Tailwind CSS 3.x
- UI Components: shadcn/ui
- Forms: React Hook Form 7.x
- HTTP Client: Axios 1.x
- File Upload: react-dropzone 14.x
- Rich Text Editor: TipTap 2.x
- Charts: Recharts 2.x
```

### Backend
```
- Runtime: Node.js 20.x LTS
- Framework: Express.js 4.x
- Language: TypeScript 5.x
- Authentication: JWT 9.x
- PDF Parser: pdf-parse 1.x
- DOCX Parser: mammoth 1.x
- DOCX Generator: docxtemplater 3.x
- Validation: Joi 17.x
- Logging: Winston 3.x
- Testing: Jest 29.x
```

### Database & Storage
```
- Database: PostgreSQL 15.x
- BaaS: Supabase
- ORM: Prisma 5.x
- File Storage: Supabase Storage
- Cache: Redis 7.x (선택)
```

### AI Services
```
- Gemini (Google): 문서 분석, 콘텐츠 생성
- Claude (Anthropic): 긴 문서 처리, 법령 분석
- OpenChat: 오픈소스 대안
```

### DevOps
```
- Hosting: Vercel (Frontend), Railway (Backend)
- CI/CD: GitHub Actions
- Monitoring: Sentry
- Analytics: Google Analytics
```

---

## 7. 위험 관리

### 기술적 위험
| 위험 | 대응 전략 |
|------|----------|
| AI API 비용 초과 | 캐싱 전략, 사용자별 쿼터, 토큰 모니터링 |
| AI 응답 품질 저하 | 다중 Provider, 프롬프트 개선, 피드백 수집 |
| 문서 파싱 오류 | 다양한 파서 테스트, 오류 처리, 수동 입력 옵션 |
| 성능 저하 | 캐싱, 최적화, 부하 테스트 |

### 일정 관리
| 위험 | 대응 전략 |
|------|----------|
| 일정 지연 | 2주 버퍼 시간, 우선순위 조정, 스코프 관리 |
| 리소스 부족 | 외부 협력, 우선순위 재조정 |

---

## 8. 성공 지표

### 기술 지표
- 시스템 가용성: 99.5%
- API 응답 시간: <500ms (95th)
- AI 생성 시간: <5분
- 에러율: <0.1%
- 코드 커버리지: 80%

### 사용자 지표 (6개월 목표)
- MAU: 500명
- Retention Rate: 40%
- NPS: 40+
- 작성 시간 단축: 70%

---

## 9. 다음 단계

1. ✅ 프로젝트 초기화 완료
2. 🔄 Week 1-2 개발 시작
   - Next.js 프로젝트 설정
   - Express.js 프로젝트 설정
   - Supabase 설정
   - 인증 시스템 구현
