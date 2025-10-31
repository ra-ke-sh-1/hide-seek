/*
  # Add has_reached_den column to game_players

  ## Purpose
  Track hiders who successfully reached the den (won) vs those who were found (lost).
  Game continues until all hiders are either found OR reached den.

  ## Changes
  - Add has_reached_den boolean column to game_players table
  - Defaults to false
*/

-- Add has_reached_den column
ALTER TABLE game_players
ADD COLUMN IF NOT EXISTS has_reached_den BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_players_has_reached_den
ON game_players(has_reached_den);
