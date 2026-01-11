# Quickstart Guide: Microblog CMS

**Feature**: Microblog CMS (001-microblog-cms)
**Created**: 2026-01-11
**Phase**: 1 - Local Development Setup
**Time to Complete**: ~20 minutes

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v18.17+ or v20.x (recommended: v20.10+)
- **npm**: v9+ or **pnpm**: v8+ (recommended for faster installs)
- **Git**: v2.x
- **Supabase CLI**: v1.x (for local database management)
- **Code Editor**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript + JavaScript

---

## Step 1: Project Initialization

### 1.1 Create Next.js App

```bash
# Create new Next.js 15 app with TypeScript, Tailwind, App Router
npx create-next-app@latest microblog-cms --typescript --tailwind --app --use-pnpm

# Navigate to project directory
cd microblog-cms
```

**Configuration prompts:**

- Would you like to use ESLint? → **Yes**
- Would you like to use `src/` directory? → **No** (use `app/` directly)
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No**

### 1.2 Install Dependencies

```bash
# Core dependencies
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add react-markdown remark-gfm rehype-highlight rehype-sanitize
pnpm add slugify isomorphic-dompurify
pnpm add @upstash/redis @upstash/ratelimit
pnpm add resend

# Dev dependencies
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D supabase
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: microblog-cms
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free tier
4. Click **"Create new project"** (wait ~2 minutes for provisioning)

### 2.2 Initialize Supabase Locally

```bash
# Login to Supabase CLI
npx supabase login

# Link to your cloud project
npx supabase link --project-ref <your-project-ref>

# Initialize local Supabase (optional for local dev)
npx supabase init
```

**Project Ref**: Found in project settings → General → Reference ID

### 2.3 Create Database Schema

Create file: `supabase/migrations/20260111000001_initial_schema.sql`

```sql
-- Copy the SQL from data-model.md Migration 001 and 002
-- See: specs/001-microblog-cms/data-model.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables: posts, tags, post_tags, comments, likes
-- (Copy full SQL from data-model.md)

-- Enable RLS
-- (Copy RLS policies from data-model.md)
```

Apply migration:

```bash
# Push migration to cloud database
npx supabase db push

# Or apply locally for testing
npx supabase db reset
```

### 2.4 Generate TypeScript Types

```bash
# Generate types from database schema
npx supabase gen types typescript --project-id <project-ref> > types/database.types.ts
```

---

## Step 3: Environment Variables

Create `.env.local` file in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Resend (for email notifications)
RESEND_API_KEY=re_your_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get Supabase Keys:**

1. Go to Supabase Dashboard → Project Settings → API
2. Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Get Upstash Redis:**

1. Go to [https://upstash.com](https://upstash.com)
2. Create new Redis database (free tier)
3. Copy REST URL and token

**Get Resend API Key:**

1. Go to [https://resend.com](https://resend.com)
2. Create account and get API key
3. Add and verify your domain (or use `onboarding@resend.dev` for testing)

---

## Step 4: Configure Project

### 4.1 Create Supabase Client Utilities

**`lib/supabase/client.ts`** (Browser client):

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`lib/supabase/server.ts`** (Server client):

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

**`middleware.ts`** (Auth protection):

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect author/moderator routes
  const protectedPaths = ["/posts/new", "/posts/drafts", "/moderation"];
  if (
    protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) &&
    !user
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 4.2 Configure Tailwind CSS

**`tailwind.config.ts`**:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "768px", // Tablet breakpoint
        lg: "1024px", // Desktop breakpoint
      },
    },
  },
  plugins: [],
};
export default config;
```

### 4.3 Configure Testing

**`vitest.config.ts`**:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

**`vitest.setup.ts`**:

```typescript
import "@testing-library/jest-dom";
```

**`playwright.config.ts`**:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Step 5: Create Initial Pages

### 5.1 Root Layout

**`app/layout.tsx`**:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Microblog CMS",
  description: "A modern microblog platform with Markdown support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 5.2 Homepage (Timeline)

**`app/(main)/page.tsx`**:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>
      <div className="space-y-6">
        {posts?.map((post) => (
          <article key={post.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">
              {post.content.substring(0, 200)}...
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

---

## Step 6: Run Development Server

```bash
# Start Next.js dev server
pnpm dev

# Server runs at http://localhost:3000
```

**Verify:**

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the homepage (empty timeline)
3. No errors in terminal

---

## Step 7: Create Test User

### 7.1 Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - Auto Confirm User: **Yes**
4. Click **"Create user"**

### 7.2 Add Author Role

1. Go to Supabase Dashboard → SQL Editor
2. Run:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"author"'
)
WHERE email = 'test@example.com';
```

---

## Step 8: Testing the Setup

### 8.1 Unit Tests

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch
```

### 8.2 E2E Tests

```bash
# Install Playwright browsers (first time only)
pnpm playwright install

# Run E2E tests
pnpm test:e2e

# Open Playwright UI
pnpm playwright test --ui
```

### 8.3 Linting & Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

---

## Step 9: Useful Commands

### Development

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
```

### Database

```bash
npx supabase db push              # Push migrations to cloud
npx supabase db reset             # Reset local database
npx supabase gen types typescript # Regenerate TypeScript types
npx supabase functions deploy     # Deploy edge functions
```

### Testing

```bash
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:e2e          # Run E2E tests
pnpm playwright test   # Run Playwright tests
```

---

## Project Structure

After setup, your project should look like:

```
microblog-cms/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── posts/
│   │   ├── tags/
│   │   └── moderation/
│   ├── api/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   └── tags/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── posts/
│   ├── comments/
│   ├── tags/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── markdown/
│   ├── rate-limit/
│   └── utils/
├── types/
│   └── database.types.ts
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── supabase/
│   └── migrations/
├── .env.local
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Troubleshooting

### Issue: Supabase connection errors

**Solution**: Verify `.env.local` has correct URL and keys. Check Supabase project is not paused (free tier pauses after 7 days inactivity).

### Issue: TypeScript errors on `database.types.ts`

**Solution**: Regenerate types after schema changes:

```bash
npx supabase gen types typescript --project-id <project-ref> > types/database.types.ts
```

### Issue: Middleware infinite redirect

**Solution**: Check `middleware.ts` matcher excludes static files. Clear browser cookies and restart dev server.

### Issue: Rate limiting not working

**Solution**: Verify Upstash Redis credentials in `.env.local`. Check Redis dashboard shows active database.

### Issue: E2E tests failing

**Solution**: Ensure dev server is running (`pnpm dev`). Install Playwright browsers: `pnpm playwright install`.

---

## Next Steps

1. **Implement User Stories**: Start with P1 (Author Creates and Publishes Post)
2. **Follow TDD**: Write tests before implementation (Red-Green-Refactor)
3. **Run Tasks**: See `specs/001-microblog-cms/tasks.md` (generated in Phase 2)
4. **Deploy to Vercel**: Connect GitHub repo to Vercel for automatic deployments

---

## Resources

- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Playwright Docs**: [https://playwright.dev](https://playwright.dev)
- **React Markdown**: [https://github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown)

---

**Setup Complete!** 🎉

You now have a fully configured development environment for the Microblog CMS. Time to start implementing features!

For implementation guidance, refer to:

- [research.md](./research.md) - Technical decisions
- [data-model.md](./data-model.md) - Database schema
- [contracts/api-rest.md](./contracts/api-rest.md) - API specifications
- [tasks.md](./tasks.md) - Implementation tasks (Phase 2)
