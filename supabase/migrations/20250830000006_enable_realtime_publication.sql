/*
  # Enable Realtime for multiplayer tables

  This migration enables Supabase Realtime for the games and game_players tables
  by adding them to the supabase_realtime publication.

  ## Changes
  1. Add game_players table to realtime publication
  2. Add games table to realtime publication
  3. Enable replica identity for proper change tracking
*/

-- Enable replica identity for proper change tracking
-- This ensures that UPDATE and DELETE events include the full row data
ALTER TABLE game_players REPLICA IDENTITY FULL;
ALTER TABLE games REPLICA IDENTITY FULL;

-- Remove tables from publication first (ignore errors if they don't exist)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE game_players;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE games;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add tables to the supabase_realtime publication
-- This allows postgres_changes events to be broadcast via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
