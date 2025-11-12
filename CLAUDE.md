# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**APAS (Automated Proposal Authoring System)** - AI-powered system for automatically generating Korean public sector proposal documents (수행계획서) for engineering and consulting companies.

**Tech Stack:**
- Frontend: Next.js 14.x, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js 20.x LTS, Express.js, TypeScript
- Database: PostgreSQL 15.x (via Supabase)
- AI Services: Google Gemini, Anthropic Claude, OpenChat
- File Processing: pdf-parse, mammoth, docxtemplater
- Storage: Supabase Storage

## Key Architecture Patterns

### Multi-AI Provider System
- **AI Orchestration Service** manages multiple AI providers (Gemini, Claude, OpenChat)
- Prompt engineering layer abstracts provider-specific implementations
- Each provider serves different use cases:
  - Gemini: Document analysis, content generation
  - Claude: Long document processing, legal analysis
  - OpenChat: Open-source alternative/fallback

### Document Processing Pipeline
```
User Upload → Storage → Parsing (PDF/DOCX) → Text Extraction → AI Analysis →
Structured Data → TOC Generation → Section-by-Section Content Generation →
Template-based Export (DOCX/PDF)
```

### Key Data Flow
1. **Document Analysis**: Extract project metadata (발주기관, 계약금액, 과업 범위, 법적 근거, etc.)
2. **TOC Generation**: AI generates hierarchical table of contents (최대 4단계)
3. **Content Generation**: Each section generated via SSE streaming with legal references
4. **Export**: Template engine applies Korean government document formatting

## Critical Business Logic

### Legal Reference System
- All generated content must include **법적 근거** (legal basis) with citations
- Sources: 국가법령정보센터 API, 행정안전부 공공데이터 포털
- Legal references stored as structured data with law name, article, content, URL

### Standard Document Structure (표준 목차)
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
제4장 안전 및 보안 관리
제5장 계약 이행 관리
제6장 청렴 이행 서약
제7장 특기사항
제8장 기대 효과
```

### Document Types
- `announcement`: 공고문 (project announcement)
- `specification`: 과업지시서 (scope of work)
- `contract`: 계약서 (contract documents)

## Development Commands

**Note**: This is a greenfield project. Development commands will be established during implementation.

Expected structure:
```bash
# Frontend development
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run test         # Run frontend tests

# Backend development
npm run dev:server   # Start Express dev server
npm run build:server # Build backend
npm run test:server  # Run backend tests

# Database
npx prisma migrate dev    # Run migrations
npx prisma studio        # Database GUI
npx prisma generate      # Generate Prisma client
```

## Database Schema Key Points

### Core Tables Hierarchy
```
users (1:N) → projects (1:N) → documents (1:1) → document_analyses
projects (1:1) → table_of_contents (1:N) → sections (1:N) → generated_contents
projects (1:N) → conversations (1:N) → messages
```

### Important Indexes
- All foreign keys indexed
- `status` fields indexed (documents, projects, sections)
- `tags` array uses GIN index
- JSONB fields may need GIN indexes for complex queries

### JSONB Fields
- `projects.metadata`: Project-specific custom data
- `documents.metadata`: File metadata (pages, word_count, has_tables)
- `document_analyses.extracted_info`: Structured extraction results
- `generated_contents.legal_references`: Array of legal citations
- `generated_contents.sources`: Array of source documents

## API Design Patterns

### RESTful Conventions
- All APIs under `/api/v1/` namespace
- Standard response format:
  ```typescript
  {
    success: boolean,
    data?: any,
    error?: { code: string, message: string, details?: any },
    timestamp: string
  }
  ```

### SSE Streaming for AI Generation
```typescript
POST /api/v1/projects/:id/sections/:sid/generate
Response: Server-Sent Events
  event: 'token' → { token: string }
  event: 'complete' → { content: GeneratedContent }
```

### Authentication
- JWT-based with access tokens (1 hour) and refresh tokens (7 days)
- All protected routes require `Authorization: Bearer <token>`
- Rate limiting: 60 req/min (free), 300 req/min (pro)

## Performance Requirements

### Critical Metrics
- Page load time: <3s
- API response: <500ms (95th percentile)
- Document upload: 10MB in <10s
- AI content generation: First token in <3s
- Concurrent users: 500

### Optimization Strategies
- Redis caching for AI responses and document analyses
- CDN for file storage (CloudFlare)
- Database read replicas
- Query optimization with proper indexes

## Security Considerations

### File Upload Security
- File type validation via Magic Number (not just extension)
- 10MB size limit per file
- Malware scanning with ClamAV
- Sanitize filenames before storage
- Access control on Supabase Storage

### Data Protection
- Password: bcrypt with 10 salt rounds
- Sensitive data: AES-256 encryption
- SQL injection: Use Prisma parameterized queries
- XSS: CSP headers, sanitize user input
- CSRF: CSRF tokens on state-changing operations

### API Security
- Rate limiting per IP and user
- Request validation (Joi schemas)
- CORS policy configuration
- HTTPS only (TLS 1.3)

## AI Prompt Engineering

### System Prompts Structure
```
Role: "당신은 공공기관 용역 수행계획서 작성 전문가입니다."
Context: { announcement_text, specification_text, contract_text }
Task: "'{section_title}' 항목을 작성해주세요."
Requirements:
  - 법령 및 기준을 명확히 인용
  - 출처 표기
  - Markdown 형식
  - 법적 근거는 **법적 근거: ** 로 표기
```

### Token Usage Management
- Track tokens per request and per user
- Implement user quotas (free: 10/day, pro: 100/day)
- Cache common analyses to reduce API costs
- Monitor costs per AI provider

## Testing Requirements

### Coverage Targets
- Unit tests: ≥80%
- Integration tests: ≥70%
- E2E tests for critical paths

### Critical Test Areas
- Document parsing (various PDF/DOCX formats)
- AI response handling and streaming
- Legal reference extraction accuracy
- Export template rendering
- Authentication flows
- File upload security

## Deployment Strategy

### Hosting
- Frontend: Vercel (recommended for Next.js)
- Backend: AWS EC2 or Railway
- Database: Supabase (managed PostgreSQL)
- File Storage: Supabase Storage + CDN

### Monitoring
- Error tracking: Sentry
- APM: Consider New Relic or Datadog
- Uptime: Target 99.5% availability
- Metrics: Response times, AI generation times, error rates

## Korean Language Specifics

### Character Encoding
- Always use UTF-8 encoding
- Database collation: UTF-8
- Ensure proper Korean character support in PDF/DOCX export

### Document Formatting
- Korean government document formatting standards
- Heading styles (제1장, 제2장 format)
- Proper spacing and punctuation rules
- Table formatting for Korean content

## Business Logic Validations

### Project Creation
- Validate project name (required)
- Client organization (optional but recommended)
- Project type from predefined enum
- Contract amount validation (positive number)

### Document Upload
- Maximum 3 files per upload
- Must specify document type (announcement/specification/contract)
- File extension whitelist: .pdf, .docx only
- Virus scan before processing

### Content Generation
- Validate section exists and belongs to project
- Check user has permission to generate content
- Validate AI provider availability
- Store generation metadata (tokens, time, provider)

## Version Control

### Git Workflow
- Use semantic versioning
- Branch strategy: feature branches from main
- Commit messages in English (technical) or Korean (business logic)
- PR required for main branch

### Important Files to Track
- Database migrations (Prisma)
- API documentation (OpenAPI/Swagger)
- Environment variable templates
- Deployment configurations

## Phase 1 MVP Priorities

Focus areas (3-month timeline):
1. **Month 1**: Auth, document upload, parsing
2. **Month 2**: AI integration, TOC generation, content generation
3. **Month 3**: Export, history, testing

Defer to Phase 2:
- Collaboration features
- Template marketplace
- Real-time co-editing
- Mobile app
- Advanced analytics
