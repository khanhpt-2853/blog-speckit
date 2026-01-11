# API Contracts: Microblog CMS

**Feature**: Microblog CMS (001-microblog-cms)
**Created**: 2026-01-11
**Phase**: 1 - API Contract Definitions
**Base URL**: `/api`
**Format**: REST JSON API

## Overview

This document defines the REST API contracts for the Microblog CMS, including request/response schemas, authentication requirements, validation rules, and error handling. All endpoints follow Next.js App Router conventions in the `app/api/` directory.

---

## Authentication

All authenticated endpoints require a valid Supabase session cookie. Authentication is handled via Supabase Auth middleware.

**Headers:**

```
Authorization: Bearer <supabase_jwt_token>
Cookie: sb-access-token=<token>; sb-refresh-token=<token>
```

**Auth Errors:**

- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions (e.g., non-moderator accessing moderation endpoint)

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* resource data */
  },
  "meta": {
    /* optional metadata */
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      /* optional field-level errors */
    }
  }
}
```

### Pagination Metadata

```json
{
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

---

## Endpoints

### 1. Posts

#### `POST /api/posts`

Create a new draft post.

**Authentication**: Required (Author)

**Request Body:**

```typescript
{
  title: string;          // Required, min 1 char
  content: string;        // Required, Markdown format
  tags: string[];         // Optional, 0-5 tags (unnormalized)
}
```

**Validation:**

- `title`: Length 1-200 characters
- `content`: Length 1-50,000 characters
- `tags`: Array length 0-5, each tag ≤50 characters

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "# Hello World\n\nThis is **markdown**.",
    "status": "draft",
    "tags": ["next-js", "typescript"],
    "published_at": null,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid input (empty title, >5 tags, tag >50 chars)
- `401 Unauthorized`: Not authenticated
- `429 Too Many Requests`: Exceeded 10 posts/hour rate limit

---

#### `GET /api/posts`

Get paginated list of published posts (timeline).

**Authentication**: Optional

**Query Parameters:**

```typescript
{
  page?: number;          // Default: 1
  per_page?: number;      // Default: 10, max: 50
  tag?: string;           // Filter by tag (normalized name)
  date_from?: string;     // ISO 8601 date (e.g., "2026-01-01")
  date_to?: string;       // ISO 8601 date
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-title",
      "content": "Markdown content...",
      "published_at": "2026-01-11T10:00:00Z",
      "author": {
        "id": "uuid",
        "display_name": "John Doe"
      },
      "tags": ["next-js", "typescript"],
      "like_count": 42,
      "comment_count": 5
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid query parameters (page < 1, invalid date format)

---

#### `GET /api/posts/[id]`

Get a single post by ID (includes draft if user is author).

**Authentication**: Optional (required for drafts)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Post Title",
    "slug": "post-title",
    "content": "Full markdown content...",
    "status": "published",
    "published_at": "2026-01-11T10:00:00Z",
    "created_at": "2026-01-11T09:00:00Z",
    "updated_at": "2026-01-11T09:30:00Z",
    "author": {
      "id": "uuid",
      "display_name": "John Doe"
    },
    "tags": ["next-js", "typescript"],
    "like_count": 42,
    "comment_count": 5,
    "user_liked": false // Only if authenticated
  }
}
```

**Errors:**

- `404 Not Found`: Post doesn't exist or is draft and user is not author
- `403 Forbidden`: Attempting to view draft without author permission

---

#### `PATCH /api/posts/[id]`

Update a draft post (published posts are immutable).

**Authentication**: Required (Author of the post)

**Request Body:**

```typescript
{
  title?: string;         // Optional
  content?: string;       // Optional
  tags?: string[];        // Optional, replaces all tags
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "content": "Updated content...",
    "status": "draft",
    "tags": ["next-js"],
    "updated_at": "2026-01-11T11:00:00Z"
  }
}
```

**Errors:**

- `400 Bad Request`: Validation errors (empty title, >5 tags)
- `403 Forbidden`: User is not post author or post is published
- `404 Not Found`: Post doesn't exist

---

#### `POST /api/posts/[id]/publish`

Publish a draft post (immutable after publication).

**Authentication**: Required (Author of the post)

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2026-01-11T12:00:00Z"
  }
}
```

**Errors:**

- `400 Bad Request`: Post is already published
- `403 Forbidden`: User is not post author
- `404 Not Found`: Post doesn't exist

---

#### `DELETE /api/posts/[id]`

Delete a draft post (published posts cannot be deleted).

**Authentication**: Required (Author of the post)

**Response:** `204 No Content`

**Errors:**

- `403 Forbidden`: User is not post author or post is published
- `404 Not Found`: Post doesn't exist

---

### 2. Comments

#### `GET /api/comments`

Get comments for a post (only approved comments for readers).

**Authentication**: Optional (moderators see all)

**Query Parameters:**

```typescript
{
  post_id: string;        // Required, post UUID
  page?: number;          // Default: 1
  per_page?: number;      // Default: 20, max: 100
  status?: string;        // Moderators only: 'pending' | 'approved' | 'rejected' | 'flagged'
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "author": {
        "id": "uuid",
        "display_name": "Jane Smith"
      },
      "content": "Great post! Thanks for sharing.",
      "status": "approved",
      "created_at": "2026-01-11T13:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 15
  }
}
```

**Errors:**

- `400 Bad Request`: Missing `post_id` or invalid pagination
- `404 Not Found`: Post doesn't exist

---

#### `POST /api/comments`

Submit a new comment (status: pending by default).

**Authentication**: Optional (can be anonymous)

**Request Body:**

```typescript
{
  post_id: string;        // Required, post UUID
  content: string;        // Required, plain text (no Markdown)
  author_name?: string;   // Required if anonymous
}
```

**Validation:**

- `content`: Length 1-2,000 characters
- `author_name`: Required if not authenticated, max 100 characters

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "content": "My comment text",
    "status": "pending",
    "created_at": "2026-01-11T14:00:00Z"
  },
  "message": "Comment submitted for moderation. It will appear after approval."
}
```

**Errors:**

- `400 Bad Request`: Validation errors (empty content, missing author_name)
- `404 Not Found`: Post doesn't exist
- `429 Too Many Requests`: Exceeded 30 comments/hour rate limit

---

#### `PATCH /api/comments/[id]/moderate`

Moderate a comment (approve, reject, or flag).

**Authentication**: Required (Moderator)

**Request Body:**

```typescript
{
  status: "approved" | "rejected" | "flagged"; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "moderated_by": "moderator_uuid",
    "moderated_at": "2026-01-11T15:00:00Z"
  }
}
```

**Side Effects:**

- If `status = 'approved'`: Send email notification to post author (FR-026)

**Errors:**

- `400 Bad Request`: Invalid status value
- `403 Forbidden`: User is not a moderator
- `404 Not Found`: Comment doesn't exist

---

### 3. Likes

#### `POST /api/likes`

Toggle like on a post (like if not liked, unlike if already liked).

**Authentication**: Required

**Request Body:**

```typescript
{
  post_id: string; // Required, post UUID
}
```

**Response:** `200 OK` (Like Added)

```json
{
  "success": true,
  "data": {
    "post_id": "uuid",
    "liked": true,
    "like_count": 43
  }
}
```

**Response:** `200 OK` (Like Removed)

```json
{
  "success": true,
  "data": {
    "post_id": "uuid",
    "liked": false,
    "like_count": 42
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid `post_id`
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Post doesn't exist

---

### 4. Tags

#### `GET /api/tags`

Get all tags with post counts.

**Authentication**: Optional

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "next-js",
      "display_name": "Next.js",
      "post_count": 15
    },
    {
      "id": "uuid",
      "name": "typescript",
      "display_name": "TypeScript",
      "post_count": 23
    }
  ]
}
```

---

### 5. Moderation Queue

#### `GET /api/moderation/comments`

Get pending comments for moderation.

**Authentication**: Required (Moderator)

**Query Parameters:**

```typescript
{
  status?: 'pending' | 'flagged';  // Default: 'pending'
  page?: number;                    // Default: 1
  per_page?: number;                // Default: 20
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post": {
        "id": "uuid",
        "title": "Post Title"
      },
      "author_name": "Anonymous User",
      "content": "Comment text...",
      "status": "pending",
      "created_at": "2026-01-11T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 5
  }
}
```

**Errors:**

- `403 Forbidden`: User is not a moderator

---

## Rate Limiting

All rate limits return `429 Too Many Requests` when exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 10,
      "window": "1 hour",
      "retry_after": 3600 // seconds
    }
  }
}
```

**Limits:**

- `POST /api/posts`: 10 requests/hour per user (FR-038)
- `POST /api/comments`: 30 requests/hour per IP (FR-039)
- `POST /api/likes`: 100 requests/hour per user (prevent spam)

---

## Error Codes

| Code                  | HTTP Status | Description                              |
| --------------------- | ----------- | ---------------------------------------- |
| `VALIDATION_ERROR`    | 400         | Invalid request body or query parameters |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication        |
| `FORBIDDEN`           | 403         | Insufficient permissions                 |
| `NOT_FOUND`           | 404         | Resource doesn't exist                   |
| `CONFLICT`            | 409         | Resource conflict (e.g., duplicate like) |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                        |
| `INTERNAL_ERROR`      | 500         | Server error                             |

---

## Implementation Notes

### Next.js Route Handlers

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { postLimiter } from '@/lib/rate-limit/limiter'

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const { success } = await postLimiter.limit(userId)
  if (!success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: '...' } },
      { status: 429 }
    )
  }

  // 2. Authentication
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '...' } },
      { status: 401 }
    )
  }

  // 3. Validation
  const body = await request.json()
  const { title, content, tags } = body
  if (!title || !content) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '...' } },
      { status: 400 }
    )
  }

  // 4. Business logic
  const { data, error } = await supabase.from('posts').insert({ ... }).select()

  // 5. Response
  return NextResponse.json({ success: true, data }, { status: 201 })
}
```

### Type Safety

Generate TypeScript types from contracts:

```typescript
// types/api.ts
export interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface PostResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Testing

### Contract Tests (Vitest)

```typescript
// __tests__/integration/posts.test.ts
import { describe, it, expect } from "vitest";

describe("POST /api/posts", () => {
  it("creates a draft post with valid data", async () => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Post",
        content: "# Test",
        tags: ["test"],
      }),
    });

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("draft");
  });

  it("returns 400 for empty title", async () => {
    const response = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title: "", content: "Content" }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
```

---

## Next Steps

- **Phase 1 (continued)**: Create `quickstart.md` with local development setup
- **Phase 2**: Generate `tasks.md` for implementation

API contracts complete. Ready for quickstart guide generation.
