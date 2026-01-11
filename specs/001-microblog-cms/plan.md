# Implementation Plan: Microblog CMS

**Branch**: `001-microblog-cms` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-microblog-cms/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Microblog CMS enables authors to create and publish Markdown-based blog posts with draft/publish workflow, tag-based organization, reader engagement through comments and likes, and a responsive 3-column layout optimized for mobile-first experience. Technical approach uses Next.js 15 App Router with TypeScript for full-stack development, Supabase for PostgreSQL database and authentication, Tailwind CSS for responsive styling, and deploys to Vercel for edge performance.

## Technical Context

**Language/Version**: TypeScript 5.3+ / JavaScript ES2023
**Primary Dependencies**: Next.js 15.x (App Router), React 18.3+, Supabase Client 2.x
**Storage**: Supabase PostgreSQL (cloud-hosted), Supabase Auth for authentication
**Testing**: Vitest for unit tests, Playwright for E2E tests, React Testing Library
**Target Platform**: Vercel Edge Network (serverless deployment)
**Project Type**: Web application (full-stack Next.js with App Router)
**Performance Goals**:

- Lighthouse score >80 mobile
- Markdown render <50ms for 500-word posts
- API p95 <200ms
- Initial page load <3s on 3G

**Constraints**:

- Mobile-first responsive design (breakpoints: 768px, 1024px)
- Touch targets ≥44×44px
- CommonMark Markdown specification compliance
- XSS protection on all user input
- Rate limiting: 10 posts/hour, 30 comments/hour

**Scale/Scope**:

- Single/small team blog (not multi-tenant)
- ~100 concurrent readers target
- ~1000 posts maximum initial capacity
- 6 core entities (Post, Tag, Comment, Like, Author, Reader)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Principle I: Content-First Architecture

- **Status**: PASS
- **Evidence**: Core entities (Post, Tag, Comment) are central to all features. No organizational-only components.
- **Compliance**: All features directly support content creation (posts), organization (tags), or consumption (reading, comments, likes).

### ✅ Principle II: Mobile-First Responsive Design

- **Status**: PASS
- **Evidence**: Technical constraints specify breakpoints (768px, 1024px), touch targets (44×44px), and 3G performance budget (<3s load).
- **Compliance**: Tailwind CSS enables mobile-first approach. Next.js Image optimization ensures fast mobile loading.

### ✅ Principle III: Markdown as Content Source of Truth

- **Status**: PASS
- **Evidence**: FR-007 requires storing Markdown in database. FR-008 mandates render-time HTML generation.
- **Compliance**: Database stores TEXT column for markdown_content. Rendering uses `marked` or `react-markdown` at display time only.

### ✅ Principle IV: Test-First for User Journeys (NON-NEGOTIABLE)

- **Status**: PASS
- **Evidence**: Spec contains 5 user stories with detailed acceptance scenarios. Testing stack includes Vitest + Playwright.
- **Compliance**: Tests must be written before implementation per TDD workflow. Each user story has independent test criteria.

### ✅ Principle V: Moderation-First Security

- **Status**: PASS
- **Evidence**: FR-023 enforces pending-by-default comment status. FR-010, FR-028, FR-041 mandate XSS sanitization.
- **Compliance**: DOMPurify/isomorphic-dompurify for HTML sanitization. Supabase RLS policies enforce comment visibility rules.

### ✅ Principle VI: Timeline-Based Information Architecture

- **Status**: PASS
- **Evidence**: FR-016 requires reverse chronological homepage. FR-021 mandates canonical URLs with slugs.
- **Compliance**: Database queries ORDER BY published_at DESC. URL structure: /posts/[id]/[slug]. Tag pages secondary navigation.

**Constitution Compliance**: ✅ ALL GATES PASSED - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 15 App Router Structure
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (main)/
│   ├── layout.tsx          # 3-column responsive layout
│   ├── page.tsx             # Homepage timeline
│   ├── posts/
│   │   ├── [id]/
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Individual post page
│   │   ├── new/
│   │   │   └── page.tsx     # Create post
│   │   └── drafts/
│   │       └── page.tsx     # Manage drafts
│   ├── tags/
│   │   └── [tag]/
│   │       └── page.tsx     # Tag-filtered posts
│   └── moderation/
│       └── page.tsx         # Comment moderation queue
├── api/
│   ├── posts/
│   │   ├── route.ts         # POST /api/posts (create)
│   │   └── [id]/
│   │       ├── route.ts     # GET, PUT, DELETE
│   │       └── publish/
│   │           └── route.ts # POST publish action
│   ├── comments/
│   │   ├── route.ts         # POST, GET
│   │   └── [id]/
│   │       └── moderate/
│   │           └── route.ts # PATCH approval status
│   ├── likes/
│   │   └── route.ts         # POST toggle like
│   └── tags/
│       └── route.ts         # GET all tags
├── layout.tsx               # Root layout
└── globals.css              # Tailwind imports

components/
├── ui/                      # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── textarea.tsx
├── posts/
│   ├── PostEditor.tsx       # Markdown editor with preview
│   ├── PostCard.tsx         # Timeline post display
│   ├── PostList.tsx         # Paginated post list
│   └── MarkdownRenderer.tsx # Safe HTML render
├── comments/
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   └── ModerationQueue.tsx
├── tags/
│   ├── TagInput.tsx         # Tag creation/normalization
│   ├── TagFilter.tsx        # Sidebar filter
│   └── TagCloud.tsx
└── layout/
    ├── Header.tsx           # Left sidebar (desktop)
    ├── Sidebar.tsx          # Right sidebar (filters)
    └── MobileNav.tsx        # Hamburger menu

lib/
├── supabase/
│   ├── client.ts            # Browser client
│   ├── server.ts            # Server-side client
│   └── schema.sql           # Database schema
├── markdown/
│   ├── parser.ts            # Markdown to HTML
│   └── sanitizer.ts         # XSS protection
├── rate-limit/
│   └── limiter.ts           # Upstash Redis rate limiter
└── utils/
    ├── tags.ts              # Tag normalization
    └── slugify.ts           # URL slug generation

types/
├── database.types.ts        # Supabase generated types
└── index.ts                 # Shared types

__tests__/
├── unit/
│   ├── markdown.test.ts
│   ├── tags.test.ts
│   └── sanitizer.test.ts
├── integration/
│   ├── posts.test.ts
│   ├── comments.test.ts
│   └── auth.test.ts
└── e2e/
    ├── create-post.spec.ts
    ├── comment-flow.spec.ts
    └── responsive.spec.ts

public/
└── (static assets)

.env.local                   # Supabase keys (gitignored)
next.config.mjs
tailwind.config.ts
tsconfig.json
package.json
vitest.config.ts
playwright.config.ts
```

**Structure Decision**: Selected Next.js App Router web application structure. This is a full-stack application where Next.js handles both frontend (React Server Components) and backend (API Routes). Directory structure follows Next.js 15 App Router conventions with route groups for authentication and main content. Supabase provides PostgreSQL database, authentication, and real-time subscriptions. Tailwind CSS handles responsive styling. Testing organized by unit/integration/E2E layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. All constitution principles are satisfied by the chosen architecture.
