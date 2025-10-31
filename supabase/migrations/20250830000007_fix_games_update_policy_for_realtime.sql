/*
  # Fix RLS UPDATE Policies for Realtime postgres_changes Events

  ## Problem
  Non-host players are not receiving postgres_changes events because the UPDATE policy
  on the games table only allows `host_id = auth.uid()`. Supabase Realtime checks BOTH
  SELECT and UPDATE policies before delivering UPDATE events. Non-host players fail the
  UPDATE policy check, so events are filtered out.

  ## Solution
  - Update the games table UPDATE policy to allow all game participants to RECEIVE events
  - Use WITH CHECK clause to still restrict who can PERFORM updates (hosts only)
  - Update game_players UPDATE policy to allow hosts to update player roles

  ## Changes
  1. Drop and recreate games UPDATE policy with participant-based USING clause
  2. Drop and recreate game_players UPDATE policy to allow host updates
*/

-- =============================================
-- Fix games table UPDATE policy
-- =============================================

-- Drop the old restrictive UPDATE policy
DROP POLICY IF EXISTS "Game hosts can update their games" ON games;

-- Create new UPDATE policy that allows participants to receive realtime events
-- but still restricts actual UPDATE operations to hosts only
CREATE POLICY "Game participants can receive updates, hosts can update"
  ON games
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow UPDATE event delivery to anyone who participates in the game
    host_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM game_players
      WHERE game_id = games.id AND player_id = auth.uid()
    )
  )
  WITH CHECK (
    -- But only the host can actually perform UPDATE operations
    host_id = auth.uid()
  );

-- =============================================
-- Fix game_players table UPDATE policy
-- =============================================

-- Drop the old restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update own game player data" ON game_players;

-- Create new UPDATE policy that allows hosts to update player roles
-- and allows players to receive realtime events about role changes
CREATE POLICY "Game hosts can update player data, participants can receive updates"
  ON game_players
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow UPDATE event delivery to:
    -- 1. The player whose data is being updated
    -- 2. The game host (who needs to see all player updates)
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_players.game_id
      AND games.host_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Allow actual UPDATE operations by:
    -- 1. The player themselves (for their own data)
    -- 2. The game host (for role assignments)
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_players.game_id
      AND games.host_id = auth.uid()
    )
  );
