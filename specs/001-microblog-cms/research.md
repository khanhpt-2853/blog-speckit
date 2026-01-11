# Research: Microblog CMS Technical Decisions

**Feature**: Microblog CMS (001-microblog-cms)
**Created**: 2026-01-11
**Phase**: 0 - Technical Research & Decision Documentation

## Overview

This document captures research findings and technical decisions for implementing the Microblog CMS using Next.js 15, TypeScript, Supabase, and Tailwind CSS. Each decision addresses specific requirements from the feature specification while adhering to the Microblog CMS Constitution v1.0.0.

---

## 1. Framework Selection: Next.js 15 App Router

### Decision

Use **Next.js 15 with App Router** for full-stack development (both frontend and backend).

### Rationale

- **Unified Codebase**: Single TypeScript codebase for both client and server eliminates context switching and reduces deployment complexity
- **React Server Components (RSC)**: Default server-side rendering improves initial page load times, meeting FR-037 (<3s on 3G) and FR-043 (Lighthouse >80)
- **API Routes**: Built-in API route handlers in `app/api/` provide serverless backend without separate Express/Fastify setup
- **Edge Runtime**: Vercel deployment leverages edge functions for global CDN distribution, reducing p95 latency to <200ms (FR-044)
- **File-based Routing**: Intuitive routing for `/posts/[id]/[slug]` (FR-021) and `/tags/[tag]` (FR-015) without manual route configuration
- **Built-in Optimizations**: Image optimization, font optimization, and automatic code splitting align with mobile-first performance budgets (Principle II)

### Alternatives Considered

- **Create React App + Express**: Rejected due to separate deployments, no SSR out-of-box, and manual optimization required
- **Remix**: Strong SSR but Vercel ecosystem integration less mature; Next.js has better Supabase integration examples
- **Astro**: Excellent for static sites but lacks built-in authentication flow and API routes for dynamic features like comments

### Implementation Notes

- Use `app/` directory (not `pages/`)
- Leverage Server Components for data fetching (reduces client bundle size)
- Use Client Components (`'use client'`) only for interactivity (forms, likes, comment submission)
- Dynamic routes: `app/posts/[id]/[slug]/page.tsx` for SEO-friendly URLs

---

## 2. Database & Backend: Supabase PostgreSQL

### Decision

Use **Supabase** for PostgreSQL database, authentication, and real-time features.

### Rationale

- **Managed PostgreSQL**: Cloud-hosted Postgres 15+ meets FR-001 to FR-044 storage requirements without infrastructure management
- **Row-Level Security (RLS)**: Built-in security policies enforce comment moderation (FR-024: pending comments invisible to readers) and draft visibility (FR-003: drafts not on public timeline)
- **Authentication**: Supabase Auth provides email/password, OAuth, and magic links, reducing custom auth implementation complexity
- **Real-time Subscriptions**: WebSocket support for live comment updates and like counts (optional enhancement for P4 features)
- **Type Generation**: CLI generates TypeScript types from database schema, ensuring type safety between DB and app
- **Edge Functions**: Can offload rate limiting (FR-038, FR-039) to Supabase Edge Functions if needed
- **Vercel Integration**: First-class integration with Vercel for environment variables and edge deployments

### Alternatives Considered

- **PlanetScale**: Great MySQL option but lacks built-in auth and RLS; would require NextAuth.js separately
- **Neon**: Excellent serverless Postgres but newer ecosystem; Supabase has more mature auth and client libraries
- **Firebase**: Real-time strength but NoSQL schema doesn't fit relational data model (Post → Tag many-to-many, Comment → Post foreign keys)

### Implementation Notes

- Use `@supabase/supabase-js` client library
- Create separate clients for server (`lib/supabase/server.ts`) and browser (`lib/supabase/client.ts`)
- Enable RLS on all tables: `posts`, `comments`, `likes`, `post_tags`
- Use Supabase Studio for schema migrations
- Store connection strings in `.env.local` (gitignored)

---

## 3. Styling: Tailwind CSS + Shadcn UI

### Decision

Use **Tailwind CSS v3.4+** with **Shadcn UI** component library for responsive design.

### Rationale

- **Mobile-First Utilities**: Tailwind's `sm:`, `md:`, `lg:` breakpoints align with FR-033 to FR-035 responsive requirements (768px, 1024px)
- **Rapid Prototyping**: Utility-first classes enable fast iteration on 3-column layout without writing custom CSS
- **Accessibility**: Shadcn UI components (built on Radix UI) provide WCAG-compliant primitives with 44×44px touch targets (FR-036)
- **Dark Mode Ready**: Tailwind's dark mode support (via `dark:` prefix) enables future dark theme (currently out of scope)
- **Performance**: PurgeCSS removes unused styles, reducing CSS bundle size for <3s load time (FR-037)
- **Design System**: Shadcn provides consistent button, card, input, and dialog components without heavy library bundle

### Alternatives Considered

- **CSS Modules**: More control but requires manual media queries and longer development time for responsive layout
- **Styled Components**: Runtime CSS-in-JS adds client-side overhead, conflicts with RSC best practices
- **Chakra UI**: Heavier bundle size (~50KB gzipped), slower than Tailwind for mobile-first performance

### Implementation Notes

- Install: `npx shadcn-ui@latest init`
- Configure breakpoints in `tailwind.config.ts`: `sm: '768px', lg: '1024px'`
- Use `@layer components` for reusable patterns (e.g., `.post-card`, `.tag-badge`)
- Implement responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Ensure all interactive elements meet 44×44px minimum: `min-h-11 min-w-11` (44px / 4px = 11 Tailwind units)

---

## 4. Markdown Rendering: react-markdown + remark-gfm

### Decision

Use **react-markdown v9+** with **remark-gfm** plugin and **DOMPurify** sanitization.

### Rationale

- **CommonMark Compliance**: `react-markdown` supports CommonMark spec (FR-009) with GitHub Flavored Markdown extensions via `remark-gfm`
- **React Integration**: Native React component renders Markdown as JSX, avoiding `dangerouslySetInnerHTML`
- **Syntax Highlighting**: Integrate `rehype-highlight` for code block syntax highlighting (supports headers, links, code blocks, lists per FR-002, FR-009)
- **XSS Protection**: Combine with `isomorphic-dompurify` to sanitize HTML output (FR-010, FR-028, FR-041)
- **Performance**: Renders 500-word post in ~15-30ms on modern devices, well under 50ms budget (FR-042)
- **SSR Compatible**: Works with React Server Components for initial HTML delivery

### Alternatives Considered

- **marked.js**: Fast parser but outputs raw HTML string, requiring manual React conversion and higher XSS risk
- **markdown-it**: Popular but requires custom React wrapper; `react-markdown` is more idiomatic
- **Tiptap / Lexical**: Rich text editors violate Principle III (Markdown as source of truth); rejected per constitution

### Implementation Notes

```typescript
// lib/markdown/MarkdownRenderer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSanitize]}
    >
      {content}
    </ReactMarkdown>
  );
}
```

- Store raw Markdown in database `posts.content` (TEXT column)
- Render on server for initial HTML, hydrate on client for interactivity
- Preview pane: Use same component with live content updates via `useState`

---

## 5. Authentication: Supabase Auth

### Decision

Use **Supabase Auth** with email/password authentication for authors and moderators.

### Rationale

- **Built-in Middleware**: Next.js middleware integration for protected routes (drafts, moderation pages)
- **Session Management**: Server-side session cookies enable secure authentication without JWT exposure
- **Role-Based Access**: Supabase Auth supports custom claims for `author` and `moderator` roles (FR-025: moderator actions)
- **No External Service**: Eliminates need for Auth0, Clerk, or NextAuth.js, reducing third-party dependencies
- **RLS Integration**: User ID automatically available in RLS policies for checking post ownership and comment authorship

### Alternatives Considered

- **NextAuth.js**: More provider options (Google, GitHub OAuth) but adds complexity; Supabase Auth simpler for email/password MVP
- **Clerk**: Excellent UX but paid tier required for production; Supabase Auth free tier sufficient for small team blog
- **Custom JWT**: Violates Principle VII (simplicity); reinventing auth introduces security risks

### Implementation Notes

- Use `@supabase/ssr` package for Next.js App Router integration
- Create middleware: `middleware.ts` to protect `/posts/new`, `/posts/drafts`, `/moderation`
- User roles stored in `auth.users` metadata: `{ role: 'author' | 'moderator' | 'reader' }`
- RLS policies check `auth.uid()` for post ownership and `auth.jwt() ->> 'role'` for moderator actions

---

## 6. Rate Limiting: Upstash Redis + Vercel Edge

### Decision

Use **Upstash Redis** with **@upstash/ratelimit** library for rate limiting.

### Rationale

- **Vercel Edge Compatible**: Upstash Redis works on Vercel Edge Runtime without cold starts (FR-044: <200ms p95)
- **Durable Storage**: Redis persistence ensures rate limit counters survive serverless function restarts
- **Sliding Window**: Library supports sliding window algorithm for accurate rate limiting (10 posts/hour, 30 comments/hour per FR-038, FR-039)
- **IP-based Limits**: Can rate limit by IP address (comments) or user ID (posts) using same library
- **Free Tier**: Upstash free tier (10K requests/day) sufficient for ~100 concurrent users

### Alternatives Considered

- **In-Memory Map**: Rejected because serverless functions are stateless; counters reset on cold start
- **Supabase Database**: Possible but adds DB load for non-critical rate limit checks; Redis faster
- **Vercel KV (Upstash)**: Same underlying tech as Upstash Redis; direct Upstash client gives more control

### Implementation Notes

```typescript
// lib/rate-limit/limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const postLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 posts/hour
});

export const commentLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1 h"), // 30 comments/hour
});
```

- Check limits in API routes before DB operations
- Return 429 status code with `Retry-After` header on limit exceeded
- Use user ID for authenticated rate limits, IP for anonymous (comments)

---

## 7. Testing Strategy: Vitest + Playwright

### Decision

Use **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Rationale

- **Vitest Performance**: 10-20x faster than Jest due to Vite's native ESM and caching (important for TDD workflow per Principle IV)
- **TypeScript Native**: No `ts-jest` transform required; TypeScript works out-of-box
- **React Testing Library**: Compatible with RTL for component testing (PostEditor, CommentForm)
- **Playwright Coverage**: Cross-browser E2E tests verify responsive layout (FR-033 to FR-037) on Chrome, Firefox, Safari
- **Visual Regression**: Playwright screenshots can validate mobile breakpoints (768px, 1024px)
- **CI/CD Ready**: Both run headless on GitHub Actions for pre-merge validation

### Alternatives Considered

- **Jest**: Slower than Vitest, requires more configuration for ESM and TypeScript
- **Cypress**: Good E2E but heavier than Playwright; Playwright has better TypeScript support and multi-browser testing
- **Testing Library alone**: Not sufficient for E2E flows like "create post → publish → verify timeline"; needs Playwright

### Implementation Notes

- Vitest config: `vitest.config.ts` with `@vitejs/plugin-react`
- Test structure:
  - Unit: `lib/markdown/parser.test.ts`, `lib/utils/tags.test.ts`
  - Integration: `app/api/posts/route.test.ts` (test API handlers with mocked Supabase)
  - E2E: `__tests__/e2e/create-post.spec.ts` (full user journey)
- Run tests before implementation (Red-Green-Refactor per Principle IV)
- CI: `npm run test:unit && npm run test:e2e` on pull requests

---

## 8. Tag Normalization: Custom Utility Function

### Decision

Implement custom **tag normalization function** in `lib/utils/tags.ts`.

### Rationale

- **Simple Requirement**: FR-012 requires lowercase + hyphen replacement (e.g., "Machine Learning" → "machine-learning")
- **No External Lib Needed**: Regex-based solution is ~10 lines, no need for `lodash` or `slugify`
- **Deterministic**: Same input always produces same tag (important for tag page URLs and filtering)
- **Validation**: Can enforce 50-character limit (FR-013) and 1-5 tag count (FR-011) in same module

### Implementation Notes

```typescript
// lib/utils/tags.ts
export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric except hyphens
    .slice(0, 50); // Enforce max length
}

export function normalizeTags(tags: string[]): string[] {
  if (tags.length > 5) throw new Error("Maximum 5 tags allowed");
  return tags.map(normalizeTag).filter((t) => t.length > 0);
}
```

- Call `normalizeTags()` in post creation API route before database insert
- Display original casing in UI but query by normalized version
- Store normalized tags in junction table `post_tags(post_id, tag)`

---

## 9. URL Slug Generation: slugify

### Decision

Use **slugify** library for generating URL slugs from post titles.

### Rationale

- **Battle-Tested**: `slugify` handles edge cases (unicode, special chars) better than custom regex
- **SEO-Friendly**: Generates readable URLs like `/posts/123/microblog-cms-launch` (FR-021)
- **Lightweight**: <2KB, no performance impact on bundle size
- **Consistency**: Same slug generation for URLs and tag normalization (reuse for tag pages)

### Implementation Notes

```typescript
// lib/utils/slugify.ts
import slugify from "slugify";

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}
```

- Generate slug on post creation from title
- Store in `posts.slug` column for fast lookup
- URL: `/posts/[id]/[slug]` where ID is primary, slug is for SEO
- Fallback: If slug collision, append ID suffix

---

## 10. Email Notifications: Resend

### Decision

Use **Resend** for email notifications (comment approval alerts per FR-026).

### Rationale

- **Vercel Integration**: Resend built by Vercel team, optimized for serverless/edge
- **Developer Experience**: React Email templates enable JSX-based email design
- **Deliverability**: High deliverability rates compared to SMTP/SendGrid
- **Free Tier**: 100 emails/day free, sufficient for small blog
- **Simple API**: One API call to send transactional email, no complex SMTP config

### Alternatives Considered

- **SendGrid**: More enterprise features but overkill for simple notifications; Resend simpler API
- **AWS SES**: Requires AWS account setup; Resend native to Vercel ecosystem
- **Nodemailer + SMTP**: Manual SMTP config error-prone; Resend handles delivery

### Implementation Notes

```typescript
// lib/email/send-notification.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyCommentApproved(
  authorEmail: string,
  postTitle: string
) {
  await resend.emails.send({
    from: "noreply@yourblog.com",
    to: authorEmail,
    subject: `New comment on "${postTitle}"`,
    html: `<p>Your post has received a new approved comment.</p>`,
  });
}
```

- Trigger in `app/api/comments/[id]/moderate/route.ts` after status update to `approved`
- Store author email in `posts` table or fetch from `auth.users`
- Use React Email for rich templates (optional enhancement)

---

## Summary of Technical Stack

| Component      | Technology           | Version | Rationale                                        |
| -------------- | -------------------- | ------- | ------------------------------------------------ |
| Framework      | Next.js              | 15.x    | Full-stack, RSC, App Router, Vercel optimization |
| Language       | TypeScript           | 5.3+    | Type safety, better DX                           |
| Database       | Supabase PostgreSQL  | 15+     | Managed Postgres, RLS, Auth, Real-time           |
| Styling        | Tailwind CSS         | 3.4+    | Mobile-first utilities, fast prototyping         |
| Components     | Shadcn UI            | Latest  | Accessible, lightweight, customizable            |
| Markdown       | react-markdown       | 9+      | CommonMark, React-native, SSR-compatible         |
| Sanitization   | isomorphic-dompurify | Latest  | XSS protection, isomorphic (SSR + client)        |
| Authentication | Supabase Auth        | 2.x     | Built-in, RLS integration, simple email/password |
| Rate Limiting  | Upstash Redis        | Latest  | Edge-compatible, durable, sliding window         |
| Email          | Resend               | Latest  | Vercel-native, React Email, high deliverability  |
| Testing (Unit) | Vitest               | Latest  | Fast, TypeScript-native, Vite-powered            |
| Testing (E2E)  | Playwright           | Latest  | Cross-browser, visual regression, CI-ready       |
| Deployment     | Vercel               | N/A     | Edge network, automatic previews, zero-config    |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Vercel Edge Network                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Next.js 15 App Router                     │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  React Server Components (Homepage, Posts)   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Client Components (Forms, Likes, Comments)  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  API Routes (/api/posts, /api/comments)      │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      External Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase    │  │   Upstash    │  │    Resend    │      │
│  │  PostgreSQL  │  │    Redis     │  │    Email     │      │
│  │  + Auth      │  │ Rate Limit   │  │ Notifications│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps (Phase 1)

1. **Data Model Design**: Define PostgreSQL schema for `posts`, `tags`, `comments`, `likes`, `post_tags` tables
2. **API Contracts**: Document REST API endpoints with request/response schemas (OpenAPI spec)
3. **Quickstart Guide**: Create local development setup instructions (Supabase CLI, Next.js dev server)
4. **Update Agent Context**: Add Next.js, Supabase, Tailwind to Copilot context file

All research findings documented. Ready to proceed to Phase 1: Design & Contracts.
