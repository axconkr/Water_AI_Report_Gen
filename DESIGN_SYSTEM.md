# APAS 모던 디자인 시스템

APAS (Automated Proposal Authoring System) 프로젝트에 적용된 모던 디자인 시스템 가이드입니다.

## 📋 목차

1. [디자인 철학](#디자인-철학)
2. [컬러 시스템](#컬러-시스템)
3. [타이포그래피](#타이포그래피)
4. [컴포넌트 스타일](#컴포넌트-스타일)
5. [애니메이션](#애니메이션)
6. [적용된 페이지](#적용된-페이지)

---

## 🎨 디자인 철학

### 핵심 원칙

1. **깔끔함 (Clean)**: 불필요한 요소를 제거하고 본질에 집중
2. **모던함 (Modern)**: 최신 디자인 트렌드를 반영한 세련된 UI
3. **직관성 (Intuitive)**: 사용자가 쉽게 이해할 수 있는 인터페이스
4. **일관성 (Consistent)**: 모든 페이지에서 통일된 디자인 언어

### 디자인 목표

- ✅ 프로페셔널한 비즈니스 애플리케이션 느낌
- ✅ AI 기능 강조 및 사용자 경험 개선
- ✅ 빠른 인지와 부드러운 인터랙션
- ✅ 반응형 디자인 (데스크톱/태블릿/모바일)

---

## 🎨 컬러 시스템

### Primary Colors (파란색)

```css
--primary-50: #eff6ff --primary-100: #dbeafe --primary-200: #bfdbfe --primary-300: #93c5fd
  --primary-400: #60a5fa --primary-500: #3b82f6 /* 메인 컬러 */ --primary-600: #2563eb
  --primary-700: #1d4ed8 --primary-800: #1e40af --primary-900: #1e3a8a;
```

**용도**: 주요 버튼, 링크, 강조 요소

### Secondary Colors (보라색)

```css
--secondary-50: #faf5ff --secondary-100: #f3e8ff --secondary-200: #e9d5ff --secondary-300: #d8b4fe
  --secondary-400: #c084fc --secondary-500: #a855f7 --secondary-600: #9333ea /* 보조 컬러 */
  --secondary-700: #7e22ce --secondary-800: #6b21a8 --secondary-900: #581c87;
```

**용도**: 그라디언트, 보조 UI 요소

### Accent Colors (초록색)

```css
--accent-50: #ecfdf5 --accent-100: #d1fae5 --accent-200: #a7f3d0 --accent-300: #6ee7b7
  --accent-400: #34d399 --accent-500: #10b981 /* 액센트 컬러 */ --accent-600: #059669
  --accent-700: #047857 --accent-800: #065f46 --accent-900: #064e3b;
```

**용도**: 성공 상태, 완료 표시

### Grayscale

```css
--gray-50: #f9fafb --gray-100: #f3f4f6 --gray-200: #e5e7eb --gray-300: #d1d5db --gray-400: #9ca3af
  --gray-500: #6b7280 --gray-600: #4b5563 --gray-700: #374151 --gray-800: #1f2937
  --gray-900: #111827;
```

---

## ✏️ 타이포그래피

### Font Family

```css
font-family:
  'Pretendard',
  -apple-system,
  BlinkMacSystemFont,
  system-ui,
  'Roboto',
  sans-serif;
```

- **Pretendard**: 한글 최적화 웹폰트 (CDN)
- **Fallback**: 시스템 기본 폰트

### Font Sizes & Weights

| 용도        | 크기        | 굵기          | 사용 예시             |
| ----------- | ----------- | ------------- | --------------------- |
| 페이지 제목 | 30px (3xl)  | Bold (700)    | 대시보드, 페이지 헤더 |
| 섹션 제목   | 24px (2xl)  | Bold (700)    | 카드 제목             |
| 서브 타이틀 | 20px (xl)   | Bold (700)    | 컴포넌트 헤더         |
| 본문        | 16px (base) | Regular (400) | 일반 텍스트           |
| 작은 텍스트 | 14px (sm)   | Medium (500)  | 설명 텍스트           |
| 캡션        | 12px (xs)   | Regular (400) | 타임스탬프, 메타정보  |

---

## 🧩 컴포넌트 스타일

### 버튼 (Buttons)

#### Primary Button

```css
.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg
         font-semibold shadow-soft
         hover:bg-primary-600
         transition-all duration-200
         hover:shadow-medium;
}
```

**사용 예시**: 주요 액션, 제출 버튼

#### Secondary Button

```css
.btn-secondary {
  @apply bg-white text-gray-700 px-4 py-2 rounded-lg
         font-semibold shadow-soft
         hover:bg-gray-50
         transition-all duration-200
         border border-gray-200;
}
```

**사용 예시**: 취소, 보조 액션

#### Hover Effect

```css
.btn-hover {
  transition: all 0.2s ease-in-out;
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### 카드 (Cards)

#### Base Card

```css
.card {
  @apply bg-white rounded-xl shadow-soft
         p-6 border border-gray-100;
}
```

#### Card Hover Effect

```css
.card-hover {
  transition: all 0.3s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
```

### 입력 필드 (Input Fields)

```css
.input-field {
  @apply w-full px-4 py-2.5 rounded-lg
         border border-gray-300
         focus:border-primary
         focus:ring-2 focus:ring-primary/20
         transition-all duration-200
         outline-none;
}
```

### 배지 (Badges)

```css
.badge {
  @apply inline-flex items-center
         px-3 py-1 rounded-full
         text-sm font-medium;
}
```

**변형**:

- **Primary**: `bg-gradient-to-r from-blue-500 to-purple-500 text-white`
- **Success**: `bg-green-100 text-green-800`
- **Info**: `bg-blue-100 text-blue-800`
- **Warning**: `bg-yellow-100 text-yellow-800`

---

## 🎬 애니메이션

### Fade In

```css
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Slide Up

```css
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Slide Down

```css
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Scale In

```css
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Animation Delays

```css
.animation-delay-200 {
  animation-delay: 200ms;
}
.animation-delay-400 {
  animation-delay: 400ms;
}
.animation-delay-600 {
  animation-delay: 600ms;
}
```

---

## 🎭 특수 효과

### Glassmorphism (글래스모피즘)

```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-dark {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

**사용 예시**: 헤더, 모달 배경

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**사용 예시**: 로고, 강조 제목

### Custom Shadows

```css
/* Soft Shadow - 일반 카드 */
shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Medium Shadow - 호버 상태 */
shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.08);

/* Hard Shadow - 드롭다운, 모달 */
shadow-hard: 0 8px 32px rgba(0, 0, 0, 0.12);

/* Inner Shadow - 눌린 상태 */
shadow-inner-soft: inset 0 2px 4px rgba(0, 0, 0, 0.06);
```

---

## 📄 적용된 페이지

### 1. 로그인 페이지 (`/auth/login`)

**주요 특징**:

- 그라디언트 배경 (`from-blue-50 via-white to-purple-50`)
- 로고 아이콘 (그라디언트 원형 배경)
- 카드 스타일 로그인 폼
- 애니메이션 효과 (`animate-fade-in`, `animate-slide-up`)
- 에러 메시지 개선 (아이콘 + 애니메이션)
- 로딩 스피너 (원형 회전 애니메이션)

### 2. 대시보드 (`/dashboard`)

**주요 특징**:

- 글래스모피즘 헤더
- 그라디언트 텍스트 제목
- 빠른 작업 카드 (그라디언트 아이콘 + 호버 효과)
- 통계 카드 (아이콘 + 호버 효과)
- 애니메이션 페이드인

**빠른 작업 카드 색상**:

- 새 프로젝트: 파란색 (`from-blue-500 to-blue-600`)
- 파일 업로드: 보라색 (`from-purple-500 to-purple-600`)
- 내 문서: 초록색 (`from-green-500 to-green-600`)
- 설정: 회색 (`from-gray-500 to-gray-600`)

### 3. 문서 분석 컴포넌트 (`DocumentAnalysis.tsx`)

**주요 특징**:

- 카드 기반 레이아웃
- 이모지 아이콘 헤더 (🔍)
- 로딩 상태 (이중 링 스피너 + 바운스 애니메이션)
- 문서 정보 카드 (그라디언트 배경 + 흰색 칩)
- 요약 카드 (회색 배경)
- 주요 주제 배지 (그라디언트)
- 목차 (호버 효과 + 인덴테이션)

### 4. 콘텐츠 생성 컴포넌트 (`ContentGenerator.tsx`)

**주요 특징**:

- 이모지 아이콘 헤더 (✨)
- 입력 폼 (커스텀 input-field 스타일)
- 로딩 상태 (이중 링 스피너 + 바운스 애니메이션)
- 생성된 콘텐츠 카드 (그라디언트 배경)
- 개선 버튼 그리드 (이모지 + btn-secondary)
- 액션 버튼 (아이콘 + btn-primary/secondary)

### 5. AI 채팅 컴포넌트 (`AIChat.tsx`)

**주요 특징**:

- 이모지 아이콘 헤더 (💬)
- 대화 없을 때 안내 (그라디언트 배경 + 예시 질문)
- 메시지 버블 (그라디언트 사용자 / 흰색 AI)
- 로딩 상태 (바운스 점 3개)
- 입력창 (input-field + 키보드 단축키 표시)
- 타임스탬프 (아이콘 + 작은 텍스트)

---

## 🎨 그라디언트 패턴

### 배경 그라디언트

```css
/* 페이지 배경 */
bg-gradient-to-br from-gray-50 to-blue-50

/* 카드 강조 */
bg-gradient-to-br from-blue-50 to-purple-50

/* 버튼/배지 */
bg-gradient-to-r from-blue-500 to-purple-500
bg-gradient-to-br from-blue-500 to-purple-600
```

### 아이콘 배경

```css
/* 파란색 */
bg-gradient-to-br from-blue-500 to-blue-600

/* 보라색 */
bg-gradient-to-br from-purple-500 to-purple-600

/* 초록색 */
bg-gradient-to-br from-green-500 to-green-600
```

---

## 📱 반응형 디자인

### Breakpoints

```css
/* Mobile First 접근 */
sm: 640px   /* 태블릿 */
md: 768px   /* 작은 데스크톱 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 큰 데스크톱 */
2xl: 1536px /* 초대형 화면 */
```

### 반응형 그리드

```css
/* 빠른 작업 카드 */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

/* 통계 카드 */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

/* 문서 정보 */
grid-cols-2 gap-4
```

---

## ⚙️ 스크롤바 커스터마이징

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## 🎯 사용 가이드

### 새 컴포넌트 만들기

1. **카드 컨테이너 사용**:

```jsx
<div className="card animate-fade-in">{/* 내용 */}</div>
```

2. **헤더 스타일**:

```jsx
<h2 className="text-xl font-bold text-gray-900">{emoji} 제목</h2>
```

3. **버튼 추가**:

```jsx
<button className="btn-primary btn-hover">액션</button>
```

4. **에러 메시지**:

```jsx
<div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-scale-in">
  <div className="flex">
    <svg className="h-5 w-5 text-red-400 mr-2">...</svg>
    <p className="text-sm text-red-800">{error}</p>
  </div>
</div>
```

### 애니메이션 적용

```jsx
{/* 페이지 로드 */}
<div className="animate-fade-in">

{/* 카드 등장 */}
<div className="animate-slide-up">

{/* 모달/팝업 */}
<div className="animate-scale-in">

{/* 순차 애니메이션 */}
<div className="animate-slide-up">
<div className="animate-slide-up animation-delay-200">
<div className="animate-slide-up animation-delay-400">
```

---

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.x
- **Font**: Pretendard (CDN)
- **Icons**: Heroicons (SVG)
- **Animations**: CSS Keyframes + Tailwind

---

## 📝 디자인 원칙 체크리스트

모든 새로운 컴포넌트/페이지는 다음을 확인하세요:

- [ ] 컬러 시스템 준수 (Primary, Secondary, Accent)
- [ ] 타이포그래피 일관성 (Pretendard 폰트)
- [ ] 카드 스타일 적용 (`.card` 클래스)
- [ ] 애니메이션 추가 (페이드인/슬라이드업)
- [ ] 호버 효과 (`.btn-hover`, `.card-hover`)
- [ ] 그라디언트 활용 (배경, 아이콘, 텍스트)
- [ ] 반응형 디자인 (모바일 → 데스크톱)
- [ ] 접근성 고려 (ARIA, 키보드 네비게이션)

---

**작성일**: 2024년 11월 12일
**버전**: 1.0
**작성자**: Claude Code
**프로젝트**: APAS (Automated Proposal Authoring System)
