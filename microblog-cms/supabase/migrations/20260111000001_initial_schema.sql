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
