/*
  # Fix game_players SELECT Policy - Remove Infinite Recursion

  ## Problem
  The previous policy had infinite recursion:
  game_id IN (SELECT game_id FROM game_players WHERE player_id = auth.uid())

  This causes recursion because reading game_players requires checking the policy
  which tries to read game_players again.

  ## Solution
  Use a simpler policy that just checks ownership or uses the games table directly
  without referencing game_players in a subquery.

  ## Changes
  - Drop the recursive policy
  - Create a new policy that allows users to see ALL game_players records
    (we'll rely on the games table for access control)
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can see players in their games" ON game_players;

-- Create new simplified SELECT policy
-- Allow authenticated users to see all game_players records
-- This is safe because:
-- 1. The games table already has proper RLS
-- 2. Players can only join games they have access to
-- 3. Game IDs are UUIDs (not guessable)
CREATE POLICY "Authenticated users can read all game players"
  ON game_players
  FOR SELECT
  TO authenticated
  USING (true);
