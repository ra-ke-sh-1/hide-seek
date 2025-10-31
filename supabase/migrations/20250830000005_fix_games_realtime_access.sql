/*
  # Fix games realtime access - simplest approach

  Make games table very permissive to ensure realtime works.
  For a multiplayer game, it's reasonable that authenticated users can see game states.

  ## Changes
  1. Drop all existing games policies
  2. Create one simple policy: all authenticated users can read all games
*/

-- Drop all existing games policies
DROP POLICY IF EXISTS "games_select_waiting" ON games;
DROP POLICY IF EXISTS "games_select_as_host" ON games;
DROP POLICY IF EXISTS "games_select_active" ON games;
DROP POLICY IF EXISTS "games_select_host" ON games;
DROP POLICY IF EXISTS "games_select_waiting_public" ON games;
DROP POLICY IF EXISTS "games_select_participant" ON games;

-- Super simple: all authenticated users can read all games
-- This ensures realtime events are delivered to all players
CREATE POLICY "games_select_all_authenticated"
  ON games
  FOR SELECT
  TO authenticated
  USING (true);

