-- Fix Tags RLS Policy to allow all authenticated users to create tags
DROP POLICY IF EXISTS "Authors can create tags" ON tags;

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix Post Tags RLS Policy to allow post authors to manage their post tags
DROP POLICY IF EXISTS "Post authors can manage tags" ON post_tags;

CREATE POLICY "Post authors can manage post tags"
  ON post_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can delete post tags"
  ON post_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
  );
