# Microblog CMS

A modern, feature-rich microblogging platform built with Next.js 16, Supabase, and TypeScript. Create, organize, and share your thoughts with Markdown support, tag-based organization, comments, likes, and responsive design.

## Features

✅ **Author Content Creation**

- Create posts with GitHub Flavored Markdown
- Live Markdown preview in split-view editor
- Save as drafts (private, author-only visibility)
- Edit drafts multiple times
- Publish to public timeline (immutable once published)
- Tag management (max 5 tags, normalized lowercase-hyphenate)
- Rate limiting (10 posts/hour to prevent spam)

✅ **Tag Organization**

- Browse posts by tag
- Tag cloud visualization with font scaling
- Popular tags sidebar
- Filter posts by multiple tags

✅ **Browse & Filter**

- Homepage displaying published posts with pagination
- Advanced filtering by tags, date range, and search
- Responsive layouts (desktop 3-column, tablet 2-column, mobile single-column)
- Hamburger menu for mobile navigation

✅ **Comments & Likes**

- Comment system with moderation workflow
- Like posts with optimistic UI updates
- Email notifications on comment approval
- Moderator dashboard for comment management

✅ **Responsive Design & Performance**

- Mobile-first design with touch-optimized controls (≥44x44px touch targets)
- Performance optimizations (compression, dynamic imports, image optimization)
- Lighthouse score >80 on mobile
- E2E tests for responsive layouts

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router, React 19, Server Components)
- **Language**: TypeScript 5.9 (strict mode)
- **Database**: Supabase PostgreSQL with Row-Level Security
- **Auth**: Supabase Auth (OAuth providers + email/password)
- **Styling**: Tailwind CSS 4 with custom breakpoints (768px, 1024px)
- **Markdown**: react-markdown + remark-gfm + rehype-highlight + rehype-sanitize
- **Rate Limiting**: Upstash Redis with @upstash/ratelimit
- **Email**: Resend (for notifications)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- pnpm 10+
- Supabase account (https://supabase.com)
- Upstash Redis account (https://upstash.com) for rate limiting

## Getting Started

### 1. Clone and Install Dependencies

```bash
cd microblog-cms
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at https://supabase.com
2. Copy your project credentials
3. Create `.env.local` from the template:

```bash
cp .env.local.template .env.local
```

4. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 3. Apply Database Migration

```bash
# Install Supabase CLI globally
npm install -g supabase

# Link to your project
pnpm supabase link --project-ref your-project-ref

# Apply migration
pnpm supabase db push
```

### 4. Set Up Upstash Redis (Rate Limiting)

1. Create a Redis database at https://upstash.com
2. Add credentials to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYxxx...
```

### 5. Set Up Resend (Email Notifications)

1. Create an account at https://resend.com
2. Add your API key to `.env.local`:

```env
RESEND_API_KEY=re_xxx...
EMAIL_FROM=noreply@yourdomain.com
```

### 6. Run Development Server

````bash
pnpm dev
```with post list & filters
│   │   ├── posts/
│   │   │   ├── new/         # Create post
│   │   │   ├── drafts/      # Author's drafts
│   │   │   └── [id]/
│   │   │       ├── edit/    # Edit draft
│   │   │       └── [slug]/  # View post (with comments & likes)
│   │   ├── tags/
│   │   │   └── [tag]/       # Posts by tag
│   │   └── moderation/      # Moderator dashboard
│   ├── (auth)/              # Auth layout group
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── api/                 # API Routes
│   │   ├── posts/           # Post CRUD + likes
│   │   ├── tags/            # Tag management
│   │   ├── comments/        # Comment system
│   │   └── moderation/      # Moderation queue
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── comments/            # Comment components
│   ├── layout/              # Layout components (Sidebar, HamburgerMenu, FilterPanel)
│   ├── markdown/            # Markdown rendering
│   ├── moderation/          # Moderation components
│   ├── posts/               # Post UI components (LikeButton, PostCard, PostEditor)
│   ├── tags/                # Tag components (TagInput, TagCloud, PopularTags)
│   └── ui/                  # UI primitives (Pagination, Loading, EmptyState, Toast)
├── lib/
│   ├── email/               # Email notifications (Resend)
│   ├── markdown/            # Sanitization
│   ├── rate-limit/          # Rate limiters (Upstash Redis)
│   ├── supabase/            # Database clients
│   └── utils/               # Helper functions
├── supabase/
│   └── migrations/          # Database schema
├── tests/
│   ├── unit/                # Unit tests (Vitest)
│   └── e2e/                 # E2E tests (Playwright)
│   ├── markdown/            # Markdown rendering
│   ├── posts/               # Post UI components
│   └── tags/                # Tag components
├── lib/
│   ├── markdown/            # Sanitization
│   ├── rate-limit/          # Rate limiters
│   ├── supabase/            # Database clients
│   └── utils/               # Helper functions
├── supabase/
│   └── migrations/          # Database schema
├── types/                   # TypeScript types
└── middleware.ts            # Auth protection
````

## Database Schema

### Tables

1. **posts** - Blog posts with draft/published status
2. **tags** - Normalized tag names
3. **post_tags** - Many-to-many junction (max 5 tags)
4. **comments** - Moderation workflow (pending/approved/rejected/flagged)
5. **likes** - Unique user likes per post

```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My Post Title",
  "content": "# Markdown content here",
  "tags": ["javascript", "web-dev"]
}
```

#### List Published Posts

```http
GET /api/posts?page=1&per_page=10&tag=javascript&date_from=2024-01-01&date_to=2024-12-31
```

#### Get Single Post

```http
GET /api/posts/{id}
```

#### Update Draft

```http
PATCH /api/posts/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["new-tag"]
}
```

#### Publish Draft

```http
POST /api/posts/{id}/publish
Authorization: Bearer <token>
```

#### Delete Draft

```http
DELETE /api/posts/{id}
Authorization: Bearer <token>
```

### Tags

#### List All Tags

```http
GET /api/tags
```

#### Get Posts by Tag

```http
GET /api/tags/{tag}/posts?page=1&per_page=10
```

### Comments

#### List Comments

```http
GET /api/comments?post_id={id}&status=approved
```

#### Create Comment

```http
POST /api/comments
Content-Type: application/json

{
  "post_id": "uuid",
  "author_name": "John Doe",
  "content": "Great post!"
}
```

#### Moderate Comment

```http
PATCH /api/comments/{id}/moderate
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "approved"  // or "rejected" or "flagged"
}
```

### Likes

#### Toggle Like

````http
POST /api/likes
Content-Type: application/json
Authorization: Bearer <token>

   - `EMAIL_FROM`
4. Deploy!

## Key Features Explained

### Markdown Rendering

Posts support full Markdown with:
- **Syntax highlighting**: Via rehype-highlight
- **GitHub Flavored Markdown**: Tables, task lists, strikethrough
- **Sanitization**: XSS protection with rehype-sanitize
- **Dynamic imports**: Code splitting for optimal performance

### Tag System

- Create tags while writing posts (max 5 per post)
- Tag cloud visualization with font scaling based on popularity
- Popular tags sidebar with post counts
- Filter posts by single or multiple tags
- Normalized tag names (lowercase-hyphenate format)

### Comment Moderation Workflow
✅
- [x] **Phase 4**: User Story 2 - Tag Organization ✅
- [x] **Phase 5**: User Story 3 - Browse/Filter ✅
- [x] **Phase 6**: User Story 4 - Comments/Likes ✅
- [x] **Phase 7**: User Story 5 - Responsive Design & Performance ✅
- [ ] **Phase 8**: Polish & Production (in progress)

## Contributing

This project follows a spec-driven development process. See `/specs/001-microblog-cms/` for:

- `spec.md` - Feature specification
- `plan.md` - Technical architecture
- `data-model.md` - Database design
- `contracts/` - API contracts
- `tasks.md` - Implementation breakdown (130 tasks)

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test && pnpm test:e2e`)
5. Run linting (`pnpm lint`)
6. Format code (`pnpm format`)
7. Commit changes (`git commit -m 'Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for detailslemented with Upstash Redis using sliding window algorithm:
- **Posts**: 10 per hour (prevents spam)
- **Comments**: 30 per hour
- **Likes**: 100 per hour

### Responsive Design

- **Desktop (1024px+)**: 3-column layout (sidebar with filters, main content, popular tags)
- **Tablet (768px-1023px)**: 2-column layout with hamburger menu
- **Mobile (<768px)**: Single column with hamburger menu for navigation

Touch targets meet WCAG 2.1 AAA standards (≥44x44px) for optimal mobile accessibility.

### Authentication

- Email/password authentication via Supabase Auth
- Email confirmation required for new accounts
- Secure session management
- Protected routes via Next.js middleware
- Row Level Security policies in database

## Performance Optimizations

- **Server Components**: Default for optimal performance
- **Dynamic Imports**: Code splitting for MarkdownRenderer
- **Image Optimization**: AVIF/WebP with automatic format selection
- **Compression**: Gzip/Brotli enabled in production
- **Package Optimization**: Experimental Next.js feature for react-markdown, remark-gfm, rehype-highlight, date-fns
- **Console Log Removal**: Automatic removal in production (keeps error/warn)

Performance targets:
- Lighthouse Score: >80 on mobile
- Time to Interactive: <3s on 3G
- API Response: p95 <200ms

See [PERFORMANCE_TESTING.md](PERFORMANCE_TESTING.md) for detailed testing procedures.

## Security

- **Row Level Security**: All database access controlled by Supabase RLS policies (23 policies)
- **Rate Limiting**: Prevents abuse with Upstash Redis
- **Input Validation**: All user inputs validated and sanitized
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Markdown sanitization with rehype-sanitize
- **Authentication**: Secure session management with Supabase Auth
- **Environment Variables**: Sensitive data stored in env vars, never committed

## Testing

### Unit Tests (Vitest)

```bash
pnpm test
````

Tests cover:

- Markdown rendering performance (<100ms module load, <10ms processing)
- Utility functions
- Component logic

### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

Tests include:

- Responsive layout validation (desktop/tablet/mobile)
- Touch target compliance (≥44x44px)
- Navigation flows (hamburger menu functionality)
- Form submissions
- Viewport meta tag validation": "uuid"
  }

````

#### Get Like Count
```http
GET /api/posts/{id}/likes
}
````

#### Publish Draft

```http
POST /api/posts/{id}/publish
Authorization: Bearer <token>
```

#### Delete Draft

```http
DELETE /api/posts/{id}
Authorization: Bearer <token>
```

## Development

### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm tsc --noEmit
```

### Linting

```bash
# ESLint
pnpm lint

# Prettier
pnpm format
```

### Build

```bash
pnpm build
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY` (for US4 notifications)
   - `NEXT_PUBLIC_APP_URL` (your domain)
4. Deploy!

## Roadmap

- [x] **Phase 1**: Project setup
- [x] **Phase 2**: Foundational infrastructure
- [x] **Phase 3**: User Story 1 - Create/Publish Posts (MVP) ✅
- [ ] **Phase 4**: User Story 2 - Tag Organization
- [ ] **Phase 5**: User Story 3 - Browse/Filter
- [ ] **Phase 6**: User Story 4 - Comments/Likes
- [ ] **Phase 7**: User Story 5 - Responsive Design
- [ ] **Phase 8**: Polish & Production

## Contributing

This project follows a spec-driven development process. See `/specs/001-microblog-cms/` for:

- `spec.md` - Feature specification
- `plan.md` - Technical architecture
- `data-model.md` - Database design
- `contracts/` - API contracts
- `tasks.md` - Implementation breakdown

## License

MIT

## Support

For issues or questions, please refer to:

- [Specification](../specs/001-microblog-cms/spec.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Technical Plan](../specs/001-microblog-cms/plan.md)
