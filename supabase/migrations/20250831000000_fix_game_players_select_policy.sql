/*
  # Fix game_players SELECT Policy for Multiplayer Visibility

  ## Problem
  Players cannot see other players (including the host) in their game because
  the SELECT policy's EXISTS check may fail due to:
  1. Race conditions during player insertion
  2. Overly restrictive policy that requires the player to already exist in game_players

  ## Solution
  Simplify the SELECT policy to allow all authenticated users to see all game_players
  records for games they're participating in, without the circular dependency.

  ## Changes
  - Drop the existing restrictive SELECT policy
  - Create a new policy that checks if the user is in the SAME game, not requiring
    a self-referential EXISTS check
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Users can read game players for games they're in" ON game_players;

-- Create new simplified SELECT policy
-- Allow users to see ALL players in games where they are a participant OR host
CREATE POLICY "Users can see players in their games"
  ON game_players
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if this is the user's own record
    player_id = auth.uid()
    OR
    -- Allow if the user is the host of this game
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_players.game_id
      AND games.host_id = auth.uid()
    )
    OR
    -- Allow if the user is ANY player in this game
    -- (using game_id to find other players in the same game)
    game_id IN (
      SELECT game_id FROM game_players
      WHERE player_id = auth.uid()
    )
  );
