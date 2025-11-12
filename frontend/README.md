# APAS Frontend

Next.js 14.x 기반 프론트엔드 애플리케이션

## 기술 스택

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand (예정)
- **HTTP Client**: Axios (예정)
- **UI Components**: shadcn/ui (예정)

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm run start
```

### 타입 체크

```bash
npm run type-check
```

### 린트

```bash
npm run lint
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
│       └── globals.css
├── public/               # Static files
├── .env.local.example    # Environment variables example
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 환경 변수

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 다음 단계

- [ ] shadcn/ui 설치
- [ ] Zustand 상태 관리 설정
- [ ] Axios 인터셉터 설정
- [ ] 인증 시스템 구현
- [ ] 레이아웃 컴포넌트 개발
