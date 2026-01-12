-- Fix Comments RLS Policy
-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create a new policy that allows authenticated users to create comments
-- The policy ensures the author_id matches the authenticated user
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
  );

-- Also add a policy for users to view their own pending comments
DROP POLICY IF EXISTS "Users can view own comments" ON comments;
CREATE POLICY "Users can view own comments"
  ON comments FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Allow any authenticated user to view all comments (for moderation)
DROP POLICY IF EXISTS "Moderators can view all comments" ON comments;
CREATE POLICY "Authenticated users can view all comments for moderation"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- Allow any authenticated user to moderate (update) comments
DROP POLICY IF EXISTS "Moderators can update comment status" ON comments;
CREATE POLICY "Authenticated users can moderate comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
