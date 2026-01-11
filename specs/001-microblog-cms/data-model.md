# Data Model: Microblog CMS

**Feature**: Microblog CMS (001-microblog-cms)
**Created**: 2026-01-11
**Phase**: 1 - Data Model Design
**Database**: Supabase PostgreSQL 15+

## Overview

This document defines the PostgreSQL database schema for the Microblog CMS, including tables, relationships, constraints, and Row-Level Security (RLS) policies. The schema supports all 44 functional requirements from the specification while adhering to the constitution's principles.

---

## Entity Relationship Diagram

```
┌─────────────┐
│   authors   │
│ (auth.users)│
└──────┬──────┘
       │ 1
       │
       │ *
    ┌──┴──────────┐
    │    posts    │◄──────────┐
    └──────┬──────┘           │
           │ *                │ *
           │                  │
           │ 1                │
    ┌──────┴──────┐     ┌─────┴─────┐
    │  comments   │     │ post_tags │
    └──────┬──────┘     └─────┬─────┘
           │ *                │ *
           │                  │
           │ 1                │ 1
    ┌──────┴──────┐     ┌─────┴─────┐
    │   readers   │     │   tags    │
    │ (auth.users)│     └───────────┘
    └──────┬──────┘
           │ *
           │
           │ 1
    ┌──────┴──────┐
    │    likes    │
    └──────┬──────┘
           │ *
           │
           │ 1
      ┌────┴─────┐
      │  posts   │
      └──────────┘
```

---

## Tables

### 1. `posts`

Stores blog posts with Markdown content, draft/published status, and metadata.

**Columns:**

| Column         | Type        | Constraints                                        | Description                                         |
| -------------- | ----------- | -------------------------------------------------- | --------------------------------------------------- |
| `id`           | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()             | Unique post identifier                              |
| `author_id`    | UUID        | NOT NULL, FOREIGN KEY → auth.users(id)             | Author who created the post                         |
| `title`        | TEXT        | NOT NULL                                           | Post title                                          |
| `slug`         | TEXT        | NOT NULL                                           | URL-friendly slug (e.g., "microblog-cms-launch")    |
| `content`      | TEXT        | NOT NULL                                           | Markdown source content (not HTML)                  |
| `status`       | TEXT        | NOT NULL, CHECK (status IN ('draft', 'published')) | Publication status                                  |
| `published_at` | TIMESTAMPTZ | NULL                                               | Timestamp when post was published (NULL for drafts) |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                            | Post creation timestamp                             |
| `updated_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                            | Last modification timestamp                         |

**Indexes:**

- `idx_posts_author_id` ON `author_id` (for author's post list)
- `idx_posts_status_published_at` ON `(status, published_at DESC)` (for timeline queries)
- `idx_posts_slug` ON `slug` (for slug-based lookups)

**Constraints:**

- `chk_published_at_required`: `(status = 'draft' OR published_at IS NOT NULL)` - Published posts must have `published_at`
- `chk_title_not_empty`: `LENGTH(TRIM(title)) > 0` - Title cannot be empty
- `chk_content_not_empty`: `LENGTH(TRIM(content)) > 0` - Content cannot be empty

**RLS Policies:**

- **SELECT (Public)**: `status = 'published'` OR `auth.uid() = author_id` (readers see published; authors see own drafts)
- **INSERT**: `auth.uid() = author_id` (authenticated authors only)
- **UPDATE**: `auth.uid() = author_id AND status = 'draft'` (only authors can edit their drafts)
- **UPDATE (Publish)**: `auth.uid() = author_id AND OLD.status = 'draft' AND NEW.status = 'published'` (publish action)
- **DELETE**: `auth.uid() = author_id AND status = 'draft'` (only drafts can be deleted)

---

### 2. `tags`

Stores normalized tag names for categorizing posts.

**Columns:**

| Column         | Type        | Constraints                            | Description                                            |
| -------------- | ----------- | -------------------------------------- | ------------------------------------------------------ |
| `id`           | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique tag identifier                                  |
| `name`         | TEXT        | NOT NULL, UNIQUE                       | Normalized tag name (lowercase, hyphenated)            |
| `display_name` | TEXT        | NOT NULL                               | Original casing for display (e.g., "Machine Learning") |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | Tag creation timestamp                                 |

**Indexes:**

- `idx_tags_name` ON `name` (unique constraint + fast lookup)

**Constraints:**

- `chk_tag_length`: `LENGTH(name) BETWEEN 1 AND 50` (FR-013: max 50 characters)
- `chk_tag_format`: `name ~ '^[a-z0-9-]+$'` (only lowercase alphanumeric + hyphens)

**RLS Policies:**

- **SELECT**: Public (all users can view tags)
- **INSERT/UPDATE/DELETE**: `auth.jwt() ->> 'role' = 'author'` (only authors create tags via posts)

---

### 3. `post_tags` (Junction Table)

Many-to-many relationship between posts and tags.

**Columns:**

| Column       | Type        | Constraints                                         | Description           |
| ------------ | ----------- | --------------------------------------------------- | --------------------- |
| `post_id`    | UUID        | NOT NULL, FOREIGN KEY → posts(id) ON DELETE CASCADE | Post reference        |
| `tag_id`     | UUID        | NOT NULL, FOREIGN KEY → tags(id) ON DELETE CASCADE  | Tag reference         |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()                             | Association timestamp |

**Primary Key:** `(post_id, tag_id)` (composite primary key prevents duplicates)

**Indexes:**

- `idx_post_tags_tag_id` ON `tag_id` (for tag page queries: "all posts with tag X")

**Constraints:**

- `chk_max_tags_per_post`: Enforced via application logic (FR-011: 1-5 tags). Database check:

  ```sql
  CREATE OR REPLACE FUNCTION check_post_tag_count()
  RETURNS TRIGGER AS $$
  BEGIN
    IF (SELECT COUNT(*) FROM post_tags WHERE post_id = NEW.post_id) > 5 THEN
      RAISE EXCEPTION 'Post cannot have more than 5 tags';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER enforce_max_tags
  AFTER INSERT ON post_tags
  FOR EACH ROW EXECUTE FUNCTION check_post_tag_count();
  ```

**RLS Policies:**

- **SELECT**: Public (all users can see post-tag associations)
- **INSERT/DELETE**: `auth.uid() = (SELECT author_id FROM posts WHERE id = post_id)` (only post author)

---

### 4. `comments`

Stores reader comments with moderation status.

**Columns:**

| Column         | Type        | Constraints                                                                                   | Description                            |
| -------------- | ----------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| `id`           | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()                                                        | Unique comment identifier              |
| `post_id`      | UUID        | NOT NULL, FOREIGN KEY → posts(id) ON DELETE CASCADE                                           | Post being commented on                |
| `author_id`    | UUID        | NULL, FOREIGN KEY → auth.users(id) ON DELETE SET NULL                                         | Commenter (NULL for anonymous)         |
| `author_name`  | TEXT        | NULL                                                                                          | Display name for anonymous commenters  |
| `content`      | TEXT        | NOT NULL                                                                                      | Comment text (plain text, no Markdown) |
| `status`       | TEXT        | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')) | Moderation status                      |
| `moderated_by` | UUID        | NULL, FOREIGN KEY → auth.users(id)                                                            | Moderator who changed status           |
| `moderated_at` | TIMESTAMPTZ | NULL                                                                                          | Moderation timestamp                   |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()                                                                       | Comment submission timestamp           |

**Indexes:**

- `idx_comments_post_id_status` ON `(post_id, status)` (for approved comments on post page)
- `idx_comments_status` ON `status` (for moderation queue)

**Constraints:**

- `chk_comment_not_empty`: `LENGTH(TRIM(content)) > 0` (content cannot be empty)
- `chk_moderated_fields`: `(status = 'pending' OR (moderated_by IS NOT NULL AND moderated_at IS NOT NULL))` (approved/rejected/flagged must have moderator info)

**RLS Policies:**

- **SELECT**: `status = 'approved'` OR `auth.jwt() ->> 'role' = 'moderator'` (readers see approved; moderators see all)
- **INSERT**: `auth.uid() = author_id` OR `author_id IS NULL` (authenticated or anonymous)
- **UPDATE**: `auth.jwt() ->> 'role' = 'moderator'` (only moderators change status)
- **DELETE**: `auth.jwt() ->> 'role' = 'moderator'` (only moderators delete)

---

### 5. `likes`

Stores user likes on posts (one like per user per post).

**Columns:**

| Column       | Type        | Constraints                                              | Description            |
| ------------ | ----------- | -------------------------------------------------------- | ---------------------- |
| `id`         | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()                   | Unique like identifier |
| `post_id`    | UUID        | NOT NULL, FOREIGN KEY → posts(id) ON DELETE CASCADE      | Post being liked       |
| `user_id`    | UUID        | NOT NULL, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | User who liked         |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()                                  | Like timestamp         |

**Primary Key (Alternative):** `(post_id, user_id)` (composite key prevents duplicate likes)

**Indexes:**

- `idx_likes_post_id` ON `post_id` (for like count aggregation)
- `idx_likes_user_id` ON `user_id` (for "posts I liked" queries)

**Constraints:**

- `uniq_post_user_like`: UNIQUE `(post_id, user_id)` (one like per user per post, FR-030)

**RLS Policies:**

- **SELECT**: Public (all users can see like counts)
- **INSERT**: `auth.uid() = user_id` (authenticated users only)
- **DELETE**: `auth.uid() = user_id` (users can unlike their own likes)

---

## Derived Tables / Views

### `post_with_metrics` (Materialized View)

Pre-computed post metrics for faster timeline queries.

```sql
CREATE MATERIALIZED VIEW post_with_metrics AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.content,
  p.status,
  p.published_at,
  p.author_id,
  COUNT(DISTINCT l.id) AS like_count,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') AS comment_count,
  ARRAY_AGG(DISTINCT t.name) AS tags
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
GROUP BY p.id;

CREATE UNIQUE INDEX ON post_with_metrics (id);
CREATE INDEX ON post_with_metrics (published_at DESC);
```

**Refresh Strategy:**

- Manual refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY post_with_metrics;`
- Scheduled: Supabase cron job every 5 minutes
- Alternative: Use regular view for real-time data (may be slower at scale)

---

## Authentication Schema (`auth.users`)

Supabase manages `auth.users` table. We extend it with custom metadata:

**Custom Claims (stored in `auth.users.raw_user_meta_data`):**

```json
{
  "role": "author" | "moderator" | "reader",
  "display_name": "John Doe",
  "bio": "Optional bio text"
}
```

**Access in RLS Policies:**

```sql
auth.uid() -- Current user ID
auth.jwt() ->> 'role' -- User role from JWT
```

**User Roles:**

- **Author**: Can create posts, publish drafts, moderate comments on their posts
- **Moderator**: Can moderate all comments across all posts
- **Reader**: Can read, comment, and like posts

---

## Migrations

### Migration 001: Initial Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  slug TEXT NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_published_at_required CHECK (
    status = 'draft' OR published_at IS NOT NULL
  )
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (
    LENGTH(name) BETWEEN 1 AND 50 AND
    name ~ '^[a-z0-9-]+$'
  ),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tags_name ON tags(name);

-- Create post_tags junction table
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- Trigger to enforce max 5 tags per post
CREATE OR REPLACE FUNCTION check_post_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM post_tags WHERE post_id = NEW.post_id) > 5 THEN
    RAISE EXCEPTION 'Post cannot have more than 5 tags';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_tags
AFTER INSERT ON post_tags
FOR EACH ROW EXECUTE FUNCTION check_post_tag_count();

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'flagged')
  ),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_moderated_fields CHECK (
    status = 'pending' OR
    (moderated_by IS NOT NULL AND moderated_at IS NOT NULL)
  )
);

CREATE INDEX idx_comments_post_id_status ON comments(post_id, status);
CREATE INDEX idx_comments_status ON comments(status);

-- Create likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Enable Row-Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
```

### Migration 002: RLS Policies

```sql
-- Posts RLS Policies
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view own drafts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can edit own drafts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id AND status = 'draft')
  WITH CHECK (status = 'draft');

CREATE POLICY "Authors can publish own drafts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id AND status = 'draft')
  WITH CHECK (status = 'published');

CREATE POLICY "Authors can delete own drafts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- Tags RLS Policies
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Authors can create tags"
  ON tags FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'author');

-- Post Tags RLS Policies
CREATE POLICY "Anyone can view post tags"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "Post authors can manage tags"
  ON post_tags FOR ALL
  USING (
    auth.uid() IN (
      SELECT author_id FROM posts WHERE id = post_id
    )
  );

-- Comments RLS Policies
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Moderators can view all comments"
  ON comments FOR SELECT
  USING ((auth.jwt() ->> 'role')::text = 'moderator');

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id OR author_id IS NULL
  );

CREATE POLICY "Moderators can update comment status"
  ON comments FOR UPDATE
  USING ((auth.jwt() ->> 'role')::text = 'moderator');

-- Likes RLS Policies
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Data Validation Rules

| Rule                              | Implementation                    | FR Reference   |
| --------------------------------- | --------------------------------- | -------------- |
| Max 5 tags per post               | Trigger `enforce_max_tags`        | FR-011         |
| Tag length ≤50 chars              | CHECK constraint `chk_tag_length` | FR-013         |
| Tag format (lowercase-hyphenated) | CHECK `name ~ '^[a-z0-9-]+$'`     | FR-012         |
| Title not empty                   | CHECK `LENGTH(TRIM(title)) > 0`   | Spec           |
| Content not empty                 | CHECK `LENGTH(TRIM(content)) > 0` | FR-001, FR-007 |
| Published posts have timestamp    | CHECK `chk_published_at_required` | FR-005         |
| Moderated comments have moderator | CHECK `chk_moderated_fields`      | FR-025         |
| One like per user per post        | UNIQUE `(post_id, user_id)`       | FR-030         |

---

## Query Examples

### 1. Homepage Timeline (Published Posts)

```sql
SELECT
  p.id,
  p.title,
  p.slug,
  p.content,
  p.published_at,
  p.author_id,
  COUNT(DISTINCT l.id) AS like_count,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') AS comment_count,
  ARRAY_AGG(DISTINCT t.name) AS tags
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.published_at DESC
LIMIT 10 OFFSET 0;
```

### 2. Posts by Tag

```sql
SELECT
  p.id,
  p.title,
  p.slug,
  p.published_at
FROM posts p
INNER JOIN post_tags pt ON p.id = pt.post_id
INNER JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published' AND t.name = 'next-js'
ORDER BY p.published_at DESC;
```

### 3. Moderation Queue (Pending Comments)

```sql
SELECT
  c.id,
  c.content,
  c.created_at,
  c.author_name,
  p.title AS post_title,
  p.id AS post_id
FROM comments c
INNER JOIN posts p ON c.post_id = p.id
WHERE c.status = 'pending'
ORDER BY c.created_at ASC;
```

### 4. Author's Drafts

```sql
SELECT
  id,
  title,
  slug,
  created_at,
  updated_at
FROM posts
WHERE author_id = auth.uid() AND status = 'draft'
ORDER BY updated_at DESC;
```

### 5. Check if User Liked Post

```sql
SELECT EXISTS(
  SELECT 1 FROM likes
  WHERE post_id = $1 AND user_id = auth.uid()
) AS user_liked;
```

---

## Performance Considerations

1. **Timeline Query Optimization**:

   - Use materialized view `post_with_metrics` for homepage (refresh every 5 min)
   - Alternative: Cache timeline in Redis with Upstash for <200ms response time

2. **Tag Filtering**:

   - Index `idx_post_tags_tag_id` enables fast joins for tag pages
   - Consider tag count denormalization if >1000 unique tags

3. **Comment Counts**:

   - Denormalize `comment_count` column on `posts` table
   - Update via trigger on `comments` INSERT/DELETE

4. **Connection Pooling**:

   - Supabase provides connection pooler (PgBouncer) for serverless functions
   - Configure in Next.js: `supabase.from('posts').select()` uses pooler automatically

5. **Pagination**:
   - Use `LIMIT/OFFSET` for initial implementation
   - Migrate to cursor-based pagination if timeline >10K posts

---

## Next Steps

- **Phase 1 (continued)**: Define API contracts (OpenAPI spec for REST endpoints)
- **Phase 1 (continued)**: Create quickstart.md with local development setup
- **Phase 2**: Generate tasks.md with implementation order

Data model complete. Ready for API contract generation.
