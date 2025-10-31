/*
  # Fix profiles RLS for multiplayer

  Allow users to read other players' profiles (username only) for multiplayer lobbies.

  ## Changes
  1. Add policy to allow reading profiles
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;

-- Allow authenticated users to read all profiles (for displaying usernames in lobbies)
CREATE POLICY "profiles_select_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
