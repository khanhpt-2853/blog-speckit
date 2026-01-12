# Microblog CMS

A modern, full-featured microblogging content management system built with Next.js 16, Supabase, and TypeScript. Features include post management, comment moderation, tag-based filtering, and a responsive 3-column layout.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### Content Management

- 📝 **Rich Post Editor** - Markdown support with live preview
- 🏷️ **Tag System** - Organize posts with multiple tags (max 5 per post)
- 📄 **Draft & Publish** - Save drafts before publishing
- ✏️ **Post Editing** - Edit title, content, and tags after creation
- 🔍 **Tag Filtering** - Filter posts by tags on homepage
- 📄 **Pagination** - 10 posts per page for better performance

### User Engagement

- 💬 **Comments** - Threaded comment system with moderation
- ❤️ **Likes** - Like posts and see like counts
- 👤 **User Profiles** - Display user info and pending tasks
- 🔔 **Pending Badge** - Visual indicator for comments awaiting moderation

### Moderation

- ✅ **Comment Moderation** - Approve or reject comments
- 🛡️ **Row-Level Security** - Supabase RLS policies for data protection
- 👮 **Moderator Access** - Dedicated moderation queue interface

### User Experience

- 📱 **Responsive Design** - Mobile-first 3-column layout
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- 🔐 **Authentication** - Secure login/register with Supabase Auth
- ⚡ **Fast Performance** - Built with Next.js 16 and Turbopack

## 🛠️ Tech Stack

### Frontend

- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend

- **Supabase** - PostgreSQL database and authentication
- **Next.js API Routes** - RESTful API endpoints
- **Supabase RLS** - Row-level security policies

### Additional Tools

- **Upstash Redis** - Rate limiting (optional)
- **Resend** - Email notifications (optional)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## 📋 Prerequisites

- Node.js 18+ or 20+
- pnpm (or npm/yarn)
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd microblog-cms
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis (Optional - for rate limiting)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Resend (Optional - for email notifications)
RESEND_API_KEY=your-resend-api-key
```

### 4. Database Setup

#### Run Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Execute the following SQL files in order:

```sql
-- Main schema
supabase/migrations/20260111000001_initial_schema.sql

-- RLS policy fixes
supabase/fix-comments-rls.sql
supabase/fix-tags-rls.sql
```

#### Verify Tables Created

Check that these tables exist:

- `posts`
- `tags`
- `post_tags`
- `comments`
- `likes`

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
microblog-cms/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                   # Main application routes
│   │   ├── moderation/           # Comment moderation
│   │   ├── posts/
│   │   │   ├── [id]/[slug]/      # Post detail view
│   │   │   ├── [id]/edit/        # Post editing
│   │   │   ├── drafts/           # User's drafts
│   │   │   └── new/              # Create new post
│   │   └── tags/[tag]/           # Tag-filtered posts
│   └── api/                      # API routes
│       ├── auth/logout/
│       ├── comments/
│       ├── likes/
│       ├── moderation/
│       ├── posts/
│       └── tags/
├── components/
│   ├── comments/                 # Comment components
│   ├── layout/                   # Layout components
│   ├── markdown/                 # Markdown rendering
│   ├── moderation/               # Moderation UI
│   ├── posts/                    # Post components
│   ├── tags/                     # Tag components
│   └── ui/                       # Shared UI components
├── lib/
│   ├── email/                    # Email utilities
│   ├── markdown/                 # Markdown processing
│   ├── rate-limit/               # Rate limiting
│   ├── supabase/                 # Supabase clients
│   └── utils/                    # Utility functions
├── supabase/
│   ├── migrations/               # Database migrations
│   ├── fix-comments-rls.sql      # RLS fixes for comments
│   └── fix-tags-rls.sql          # RLS fixes for tags
├── types/
│   └── database.types.ts         # TypeScript types
└── tests/
    ├── e2e/                      # End-to-end tests
    └── unit/                     # Unit tests
```

## 🔌 API Routes

### Posts

- `GET /api/posts` - List posts (supports filtering, pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post by ID
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/publish` - Publish/unpublish post
- `GET /api/posts/[id]/likes` - Get post likes
- `POST /api/posts/[id]/likes` - Toggle like on post

### Comments

- `GET /api/comments` - List comments for a post
- `POST /api/comments` - Create new comment
- `POST /api/comments/[id]/moderate` - Approve/reject comment

### Tags

- `GET /api/tags` - List all tags with post counts
- `GET /api/tags/[tag]/posts` - Get posts by tag

### Moderation

- `GET /api/moderation/comments` - Get comments pending moderation

### Authentication

- `POST /api/auth/logout` - Logout user

## 🧪 Testing

### Run Unit Tests

```bash
pnpm test
```

### Run E2E Tests

```bash
pnpm test:e2e
```

## 🎨 Code Quality

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm type-check
```

### Code Formatting

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```

## 🏗️ Building for Production

```bash
pnpm build
```

The build output will be in the `.next` directory.

### Start Production Server

```bash
pnpm start
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework Preset: Next.js
   - Root Directory: `./` (or adjust if needed)

3. **Configure Environment Variables**
   Add all environment variables from `.env.local` in Vercel dashboard

4. **Deploy**
   Vercel will automatically build and deploy your application

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🔐 Security

### Row-Level Security (RLS)

The application uses Supabase RLS policies to ensure:

- Users can only edit/delete their own posts
- Users can only modify their own comments
- Comments are only visible after moderation approval
- Proper access control for all database operations

### Rate Limiting

Optional rate limiting via Upstash Redis:

- Prevents API abuse
- Falls back to unlimited requests if not configured
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production

## 🎯 Key Features in Detail

### Post Management

- Create posts with markdown formatting
- Add up to 5 tags per post
- Save as draft or publish immediately
- Edit posts after creation
- Delete posts (with confirmation)

### Comment System

- Add comments to published posts
- Comments require moderation before appearing
- Authors receive email notifications (if configured)
- Moderators can approve/reject from moderation queue

### Tag System

- Auto-generated tag slugs
- Tag cloud with popular tags
- Filter posts by clicking tags
- Tag management with normalization

### User Interface

- 3-column responsive layout:
  - Left: Filters and sidebar
  - Center: Posts feed
  - Right: User profile and stats
- Mobile-friendly hamburger menu
- Real-time pending comment count badge
- Smooth pagination

## 🐛 Known Issues

1. **Middleware Warning**: Next.js 16 shows deprecation warning for "middleware" → "proxy" convention
   - Non-blocking, middleware works correctly
   - Will need migration in future Next.js versions

2. **React Hook Warnings**: 4 `exhaustive-deps` warnings in ESLint
   - Non-blocking, components function correctly
   - Can be resolved by memoizing functions

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:

- Open an issue on GitHub
- Check existing documentation
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment help

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**Built with ❤️ using Next.js 16 and Supabase**
