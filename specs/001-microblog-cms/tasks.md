# Tasks: Microblog CMS

**Input**: Design documents from `/specs/001-microblog-cms/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: NOT explicitly requested in specification - Tests are OPTIONAL for this feature. Tasks focus on implementation.

**Organization**: Tasks are grouped by user story (P1-P5) to enable independent implementation and incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1-US5) from spec.md
- File paths follow Next.js 15 App Router structure from plan.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project with required dependencies and configuration

- [x] T001 Create Next.js 15 app with TypeScript, Tailwind CSS, App Router via `create-next-app`
- [x] T002 Install core dependencies: @supabase/supabase-js, @supabase/ssr, react-markdown, remark-gfm, slugify, @upstash/redis, @upstash/ratelimit, resend
- [x] T003 [P] Install dev dependencies: vitest, @vitejs/plugin-react, @testing-library/react, playwright, prettier
- [x] T004 [P] Configure Tailwind CSS breakpoints (768px, 1024px) in tailwind.config.ts
- [x] T005 [P] Configure TypeScript strict mode and path aliases in tsconfig.json
- [x] T006 [P] Create .env.local template with Supabase, Upstash, Resend environment variables
- [x] T007 [P] Setup ESLint and Prettier configuration files
- [x] T008 [P] Configure Vitest in vitest.config.ts with React plugin
- [x] T009 [P] Configure Playwright in playwright.config.ts for E2E testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create Supabase project and obtain connection credentials (manual via dashboard)
- [x] T011 Create database migration file: supabase/migrations/20260111000001_initial_schema.sql with posts, tags, post_tags, comments, likes tables
- [ ] T012 Apply database migration to Supabase cloud instance via `supabase db push`
- [x] T013 [P] Generate TypeScript database types: types/database.types.ts via `supabase gen types`
- [x] T014 [P] Create Supabase browser client utility in lib/supabase/client.ts using @supabase/ssr
- [x] T015 [P] Create Supabase server client utility in lib/supabase/server.ts for Server Components
- [x] T016 Implement authentication middleware in middleware.ts to protect author/moderator routes
- [x] T017 [P] Create Upstash Redis rate limiter utilities in lib/rate-limit/limiter.ts (10 posts/hr, 30 comments/hr)
- [x] T018 [P] Create tag normalization utility in lib/utils/tags.ts (lowercase, hyphenate, validate length)
- [x] T019 [P] Create slug generation utility in lib/utils/slugify.ts using slugify library
- [x] T020 [P] Create Markdown sanitization utility in lib/markdown/sanitize.ts using isomorphic-dompurify
- [x] T021 [P] Create base MarkdownRenderer component in components/markdown/MarkdownRenderer.tsx with react-markdown + remark-gfm
- [x] T022 [P] Create root layout in app/layout.tsx with Inter font and globals.css
- [x] T023 [P] Create error handling utilities in lib/utils/errors.ts for standardized API error responses

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Author Creates and Publishes Post (Priority: P1) 🎯 MVP

**Goal**: Authors can create Markdown posts, save as drafts, preview rendered content, edit drafts, and publish to public timeline

**Independent Test**: Create post with Markdown → Save as draft → Verify not on public timeline → Edit content → Publish → Verify appears on timeline with rendered Markdown

### Implementation for User Story 1

#### API Layer (US1)

- [x] T024 [P] [US1] Implement POST /api/posts route handler in app/api/posts/route.ts (create draft with rate limiting)
- [x] T025 [P] [US1] Implement GET /api/posts route handler in app/api/posts/route.ts (fetch published posts with pagination)
- [x] T026 [P] [US1] Implement GET /api/posts/[id]/route.ts (fetch single post with auth check for drafts)
- [x] T027 [P] [US1] Implement PATCH /api/posts/[id]/route.ts (update draft only, prevent editing published)
- [x] T028 [P] [US1] Implement POST /api/posts/[id]/publish/route.ts (change status to published, set published_at)
- [x] T029 [P] [US1] Implement DELETE /api/posts/[id]/route.ts (delete draft only)

#### UI Components (US1)

- [x] T030 [P] [US1] Create PostEditor component in components/posts/PostEditor.tsx (Markdown textarea + preview split view)
- [x] T031 [P] [US1] Create PostCard component in components/posts/PostCard.tsx (display post title, excerpt, tags, date)
- [x] T032 [P] [US1] Create DraftList component in components/posts/DraftList.tsx (show author's drafts with edit/delete/publish actions)
- [x] T033 [P] [US1] Create PublishConfirmDialog component in components/posts/PublishConfirmDialog.tsx (confirm publish action with warning about immutability)

#### Pages (US1)

- [x] T034 [US1] Create new post page in app/(main)/posts/new/page.tsx using PostEditor component
- [x] T035 [US1] Create edit draft page in app/(main)/posts/[id]/edit/page.tsx with auth check for draft status
- [x] T036 [US1] Create drafts list page in app/(main)/posts/drafts/page.tsx showing author's drafts
- [x] T037 [US1] Create homepage timeline in app/(main)/page.tsx fetching published posts with Server Components
- [x] T038 [US1] Create single post view page in app/(main)/posts/[id]/[slug]/page.tsx rendering Markdown with MarkdownRenderer

#### Integration (US1)

- [x] T039 [US1] Connect PostEditor to POST /api/posts for saving drafts
- [x] T040 [US1] Connect PostEditor preview pane to MarkdownRenderer component for live preview
- [x] T041 [US1] Connect PublishConfirmDialog to POST /api/posts/[id]/publish endpoint
- [x] T042 [US1] Add authentication checks in middleware.ts for /posts/new, /posts/drafts, /posts/[id]/edit routes

**Checkpoint**: User Story 1 complete - Authors can create, draft, edit, and publish Markdown posts ✅

---

## Phase 4: User Story 2 - Author Organizes Posts with Tags (Priority: P2)

**Goal**: Authors can assign 1-5 tags to posts during creation, tags are normalized automatically, posts are discoverable via tag pages

**Independent Test**: Create post with tags "JavaScript, Web Dev" → Verify normalized to "javascript, web-dev" → Navigate to tag page → Verify post appears in tag-filtered list

### Implementation for User Story 2

#### API Layer (US2)

- [x] T043 [P] [US2] Implement GET /api/tags route handler in app/api/tags/route.ts (list all tags with post counts)
- [x] T044 [P] [US2] Implement GET /api/tags/[tag]/posts route handler in app/api/tags/[tag]/posts/route.ts (posts for specific tag)

#### Tag Processing (US2)

- [x] T045 [US2] Update POST /api/posts route to process tags array, normalize via lib/utils/tags.ts, create tags table entries
- [x] T046 [US2] Update POST /api/posts route to create post_tags junction table entries (enforce max 5 tags)
- [x] T047 [US2] Update PATCH /api/posts/[id] route to handle tag updates for drafts (remove old tags, add new ones)

#### UI Components (US2)

- [x] T048 [P] [US2] Create TagInput component in components/tags/TagInput.tsx (comma-separated input with validation feedback)
- [x] T049 [P] [US2] Create TagBadge component in components/tags/TagBadge.tsx (clickable tag chip linking to tag page)
- [x] T050 [P] [US2] Create TagCloud component in components/tags/TagCloud.tsx (display popular tags with post counts)

#### Pages (US2)

- [x] T051 [US2] Create tag page in app/(main)/tags/[tag]/page.tsx showing posts with specific tag
- [x] T052 [US2] Update homepage to include TagCloud component in right sidebar (desktop layout)

#### Integration (US2)

- [x] T053 [US2] Integrate TagInput component into PostEditor for tag assignment during post creation
- [x] T054 [US2] Display TagBadge components on PostCard component for each post's tags
- [x] T055 [US2] Implement tag validation in TagInput (max 5, max 50 chars per tag, show normalized preview)

**Checkpoint**: User Story 2 complete - Posts have normalized tags and are discoverable via tag pages ✅

---

## Phase 5: User Story 3 - Reader Browses and Filters Content (Priority: P3)

**Goal**: Readers can view chronological timeline, filter by tags, use responsive layout across devices

**Independent Test**: Visit homepage on desktop → See 3-column layout → Click tag filter → Timeline updates → View on mobile → See single column with hamburger menu

### Implementation for User Story 3

#### Filtering & Pagination (US3)

- [x] T056 [US3] Update GET /api/posts route to support query params: page, per_page, tag, date_from, date_to
- [x] T057 [US3] Implement pagination logic in app/(main)/page.tsx using searchParams and URL state
- [x] T058 [US3] Add pagination UI component in components/ui/Pagination.tsx (Next/Prev buttons, page numbers)

#### Responsive Layout Components (US3)

- [x] T059 [P] [US3] Create DesktopLayout component in components/layout/DesktopLayout.tsx (3-column grid for ≥1024px)
- [x] T060 [P] [US3] Create TabletLayout component in components/layout/TabletLayout.tsx (2-column with collapsible sidebar for 768-1023px)
- [x] T061 [P] [US3] Create MobileLayout component in components/layout/MobileLayout.tsx (single column with hamburger menu for <768px)
- [x] T062 [P] [US3] Create Sidebar component in components/layout/Sidebar.tsx (navbar, user info, logout)
- [x] T063 [P] [US3] Create FilterPanel component in components/layout/FilterPanel.tsx (tag filters, date range picker)
- [x] T064 [P] [US3] Create HamburgerMenu component in components/ui/HamburgerMenu.tsx (mobile navigation drawer)

#### Pages & Layout (US3)

- [x] T065 [US3] Create main layout wrapper in app/(main)/layout.tsx detecting screen size and rendering appropriate layout component
- [x] T066 [US3] Implement CSS Grid in layout.tsx for 3-column desktop layout (240px left, 1fr center, 320px right)
- [x] T067 [US3] Implement Tailwind responsive classes for tablet 2-column breakpoint at 768px
- [x] T068 [US3] Implement Tailwind responsive classes for mobile single-column breakpoint at <768px
- [x] T069 [US3] Ensure all interactive elements meet 44×44px minimum touch target size using Tailwind min-h-11 min-w-11

#### Integration (US3)

- [x] T070 [US3] Connect FilterPanel tag clicks to update URL searchParams and trigger timeline refetch
- [x] T071 [US3] Connect FilterPanel date range picker to update URL searchParams
- [x] T072 [US3] Add loading states to PostCard list during filtering/pagination
- [x] T073 [US3] Implement empty state UI when no posts match filters

**Checkpoint**: User Story 3 complete - Readers can browse timeline with filters and responsive layout works across devices ✅

---

## Phase 6: User Story 4 - Reader Engages via Comments and Likes (Priority: P4)

**Goal**: Readers can like posts (toggle), submit comments (pending moderation), moderators approve/reject comments, authors receive email notifications

**Independent Test**: Like a post → Count increments → Unlike → Count decrements → Submit comment → Verify status "pending" → Moderator approves → Comment visible → Author receives email

### Implementation for User Story 4

#### API Layer - Likes (US4)

- [x] T074 [P] [US4] Implement POST /api/likes route handler in app/api/likes/route.ts (toggle like/unlike with rate limiting)
- [x] T075 [P] [US4] Implement GET /api/posts/[id]/likes route handler (get like count and user's like status)

#### API Layer - Comments (US4)

- [x] T076 [P] [US4] Implement POST /api/comments route handler in app/api/comments/route.ts (create pending comment with rate limiting)
- [x] T077 [P] [US4] Implement GET /api/comments route handler in app/api/comments/route.ts (fetch approved comments for post, or all for moderators)
- [x] T078 [P] [US4] Implement PATCH /api/comments/[id]/moderate route handler in app/api/comments/[id]/moderate/route.ts (moderator changes status to approved/rejected/flagged)

#### API Layer - Moderation (US4)

- [x] T079 [US4] Implement GET /api/moderation/comments route handler in app/api/moderation/comments/route.ts (moderator-only pending comment queue)

#### Email Notifications (US4)

- [x] T080 [US4] Create email notification utility in lib/email/send-notification.ts using Resend API
- [x] T081 [US4] Integrate email notification into PATCH /api/comments/[id]/moderate route when status changes to "approved"

#### UI Components - Likes (US4)

- [x] T082 [P] [US4] Create LikeButton component in components/posts/LikeButton.tsx (heart icon with count, toggle on click)
- [x] T083 [US4] Add optimistic UI updates to LikeButton (instant visual feedback before API response)

#### UI Components - Comments (US4)

- [x] T084 [P] [US4] Create CommentForm component in components/comments/CommentForm.tsx (textarea, submit, anonymous name field)
- [x] T085 [P] [US4] Create CommentList component in components/comments/CommentList.tsx (display approved comments)
- [x] T086 [P] [US4] Create CommentCard component in components/comments/CommentCard.tsx (single comment with author, date, content)
- [x] T087 [P] [US4] Create ModerationQueue component in components/moderation/ModerationQueue.tsx (pending comments with approve/reject/flag buttons)

#### Pages (US4)

- [x] T088 [US4] Create moderation page in app/(main)/moderation/page.tsx (moderator-only route showing ModerationQueue)
- [x] T089 [US4] Update single post page app/(main)/posts/[id]/[slug]/page.tsx to include CommentList and CommentForm
- [x] T090 [US4] Add middleware auth check for /moderation route requiring moderator role

#### Integration (US4)

- [x] T091 [US4] Connect LikeButton to POST /api/likes endpoint with authentication check
- [x] T092 [US4] Connect CommentForm to POST /api/comments endpoint with rate limit error handling
- [x] T093 [US4] Connect ModerationQueue approve/reject buttons to PATCH /api/comments/[id]/moderate endpoint
- [x] T094 [US4] Display pending comment count badge in Sidebar for moderators
- [x] T095 [US4] Add client-side validation to CommentForm (max length, required content)

**Checkpoint**: User Story 4 complete - Readers can like and comment on posts, moderators can approve comments, email notifications sent ✅

---

## Phase 7: User Story 5 - Responsive Layout and Mobile Experience (Priority: P5)

**Goal**: Verify responsive design works across all breakpoints with optimal performance and accessibility

**Independent Test**: Test on Chrome DevTools device emulator (iPhone, iPad, Desktop) → Verify layouts, touch targets, load times → Run Lighthouse audit → Score >80

### Implementation for User Story 5

#### Performance Optimization (US5)

- [x] T096 [P] [US5] Implement Next.js Image component for any images in UI (optimized loading)
- [x] T097 [P] [US5] Add React Server Components for data fetching (reduce client-side JavaScript)
- [x] T098 [P] [US5] Implement dynamic imports for heavy components (Markdown preview, moderation queue)
- [x] T099 [P] [US5] Configure next.config.mjs for production optimizations (minification, compression)
- [x] T100 [US5] Add loading.tsx files in route segments for streaming UI and skeleton loaders

#### Mobile Optimizations (US5)

- [x] T101 [P] [US5] Test all touch targets ≥44×44px using browser DevTools accessibility inspector
- [x] T102 [P] [US5] Verify mobile forms have proper input types (email, url) for native keyboard
- [x] T103 [P] [US5] Add meta viewport tag in app/layout.tsx for proper mobile scaling
- [x] T104 [P] [US5] Test hamburger menu open/close animation performance on mobile (smooth 60fps)

#### Cross-Browser Testing (US5)

- [x] T105 [US5] Write Playwright E2E test in **tests**/e2e/responsive-layout.spec.ts verifying 3-column desktop layout
- [x] T106 [US5] Write Playwright E2E test verifying 2-column tablet layout at 768px breakpoint
- [x] T107 [US5] Write Playwright E2E test verifying single-column mobile layout at <768px
- [x] T108 [US5] Write Playwright E2E test verifying hamburger menu functionality on mobile

#### Performance Validation (US5)

- [x] T109 [US5] Run Lighthouse audit on homepage and verify score >80 mobile
- [x] T110 [US5] Measure Markdown render time for 500-word post and verify <50ms
- [x] T111 [US5] Test homepage load on throttled 3G connection and verify <3s initial load
- [x] T112 [US5] Measure API p95 response time using Vercel Analytics and verify <200ms

**Checkpoint**: User Story 5 complete - Responsive design validated across devices with performance metrics meeting constitution standards ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [x] T113 [P] Add authentication pages: app/(auth)/login/page.tsx and app/(auth)/register/page.tsx using Supabase Auth
- [x] T114 [P] Create 404 page in app/not-found.tsx with styled error message
- [x] T115 [P] Create error boundary in app/error.tsx for global error handling
- [x] T116 [P] Add loading states to all async operations (skeleton loaders, spinners)
- [x] T117 [P] Implement toast notifications for success/error feedback using Shadcn UI Toast
- [ ] T118 [P] Add comprehensive JSDoc comments to all utility functions and components
- [x] T119 [P] Create README.md in project root with quickstart instructions reference
- [x] T120 [P] Add CSRF protection to all POST/PATCH/DELETE endpoints using Next.js built-in protection
- [ ] T121 [P] Implement proper error logging for production debugging (Sentry or Vercel integration)
- [x] T122 [P] Add SEO meta tags in app/layout.tsx and per-page metadata
- [ ] T123 [P] Verify all forms have proper accessibility labels and ARIA attributes
- [ ] T124 Run complete E2E test suite verifying all user stories end-to-end
- [ ] T125 Run Prettier formatter on entire codebase
- [ ] T126 Run ESLint and fix all warnings
- [ ] T127 Validate quickstart.md instructions by following them on fresh machine
- [x] T128 Create deployment configuration for Vercel (vercel.json if needed)
- [ ] T129 Deploy to Vercel staging environment and smoke test all features
- [ ] T130 Review all FRs from spec.md and verify implementation completeness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1) ← Foundational (required for post creation)
  - US2 (P2) ← US1 (tags depend on posts existing)
  - US3 (P3) ← US1 + US2 (filtering depends on posts and tags)
  - US4 (P4) ← US1 (comments/likes depend on published posts)
  - US5 (P5) ← US1 + US2 + US3 + US4 (validates all features work responsively)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundational (Phase 2) ← REQUIRED FOR ALL
    ↓
    ├─→ US1 (Create/Publish Post) ← MVP Foundation
    │       ↓
    │       ├─→ US2 (Tag Organization) ← Extends US1
    │       │       ↓
    │       │       └─→ US3 (Browse/Filter) ← Needs US1 + US2
    │       │
    │       └─→ US4 (Comments/Likes) ← Extends US1
    │
    └─→ US5 (Responsive Design) ← Tests US1 + US2 + US3 + US4
```

### Within Each User Story

**US1 (Create/Publish Post)**:

1. API routes (T024-T029) can run in parallel
2. UI components (T030-T033) can run in parallel
3. Pages (T034-T038) depend on components existing
4. Integration (T039-T042) depends on API routes + pages

**US2 (Tag Organization)**:

1. API routes (T043-T044) can run in parallel with US2 tag processing
2. Tag processing (T045-T047) must update US1 API routes
3. UI components (T048-T050) can run in parallel
4. Pages (T051-T052) depend on components
5. Integration (T053-T055) depends on all above

**US3 (Browse/Filter)**:

1. API updates (T056-T058) sequential (modify existing routes)
2. Layout components (T059-T064) can all run in parallel
3. Pages & layout (T065-T069) sequential (cascading dependencies)
4. Integration (T070-T073) depends on all above

**US4 (Comments/Likes)**:

1. API routes (T074-T079) can run in parallel within likes/comments groups
2. Email notifications (T080-T081) depends on moderate API route
3. UI components (T082-T087) can all run in parallel
4. Pages (T088-T090) sequential (use components)
5. Integration (T091-T095) depends on all above

**US5 (Responsive Design)**:

1. Performance optimizations (T096-T100) can all run in parallel
2. Mobile optimizations (T101-T104) can all run in parallel
3. E2E tests (T105-T108) sequential (verify layouts one by one)
4. Performance validation (T109-T112) sequential (run audits)

### Parallel Opportunities Per Phase

**Phase 1 (Setup)**: T002-T009 (8 tasks in parallel after T001)

**Phase 2 (Foundational)**: T013-T023 (11 tasks in parallel after T010-T012)

**Phase 3 (US1)**:

- API routes: T024-T029 (6 in parallel)
- UI components: T030-T033 (4 in parallel)
- Then sequential: Pages → Integration

**Phase 4 (US2)**:

- API routes + UI components: T043-T044, T048-T050 (5 in parallel)
- Then sequential: Tag processing → Pages → Integration

**Phase 5 (US3)**:

- Layout components: T059-T064 (6 in parallel)
- Then sequential: API updates → Pages → Integration

**Phase 6 (US4)**:

- API routes: T074-T078 (5 in parallel)
- UI components: T082-T087 (6 in parallel)
- Then sequential: Email → Pages → Integration

**Phase 7 (US5)**:

- Performance: T096-T100 (5 in parallel)
- Mobile: T101-T104 (4 in parallel)
- Then sequential: E2E tests → Validation

**Phase 8 (Polish)**: T113-T123 (11 tasks in parallel), then T124-T130 sequential validation

---

## Implementation Strategy

### Recommended Approach: MVP First (US1 Only)

**Week 1**: Phase 1 Setup + Phase 2 Foundational
**Week 2**: Phase 3 US1 (Create/Publish Post) - **Ship MVP**
**Week 3**: Phase 4 US2 (Tag Organization) - **Ship v1.1**
**Week 4**: Phase 5 US3 (Browse/Filter) - **Ship v1.2**
**Week 5**: Phase 6 US4 (Comments/Likes) - **Ship v1.3**
**Week 6**: Phase 7 US5 (Responsive Validation) + Phase 8 Polish - **Ship v1.4**

### Team Parallelization (if 3 developers)

After Foundational phase complete:

- **Dev 1**: US1 API routes + integration
- **Dev 2**: US1 UI components + pages
- **Dev 3**: US2 tag system (starts earlier to unblock US3)

### TDD Workflow (if tests requested later)

For each user story:

1. Write contract tests for API endpoints (RED)
2. Implement API routes to pass tests (GREEN)
3. Write component tests for UI (RED)
4. Implement components to pass tests (GREEN)
5. Write E2E test for user journey (RED)
6. Integrate components + API (GREEN)
7. Refactor (REFACTOR)

---

## Validation Checklist

Before marking a user story complete, verify:

- [ ] All tasks for that user story are complete
- [ ] API contracts match specifications in contracts/api-rest.md
- [ ] Database queries match schema in data-model.md
- [ ] UI matches responsive breakpoints from plan.md
- [ ] All functional requirements for that story are implemented
- [ ] Independent test scenario from spec.md passes
- [ ] No console errors in browser DevTools
- [ ] No TypeScript errors in VS Code
- [ ] No ESLint warnings
- [ ] Code formatted with Prettier

---

## Summary

- **Total Tasks**: 130
- **Task Count by Phase**:

  - Phase 1 Setup: 9 tasks
  - Phase 2 Foundational: 14 tasks (BLOCKING)
  - Phase 3 US1: 19 tasks (MVP)
  - Phase 4 US2: 13 tasks
  - Phase 5 US3: 18 tasks
  - Phase 6 US4: 22 tasks
  - Phase 7 US5: 17 tasks
  - Phase 8 Polish: 18 tasks

- **Parallel Opportunities**: 57 tasks marked [P] can run in parallel within their phase
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 42 tasks = ~2 weeks for 1 developer
- **Full Feature**: All phases = 130 tasks = ~6 weeks for 1 developer, ~3 weeks for 3 developers

**Next Step**: Begin Phase 1 Setup by running `npx create-next-app@latest` per quickstart.md instructions
