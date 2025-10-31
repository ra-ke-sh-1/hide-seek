/*
  # Automatically Update current_players Count

  ## Problem
  When players join a game, they try to UPDATE the games.current_players field,
  but the RLS UPDATE policy only allows hosts to perform UPDATEs. This causes
  "row-level security policy violation" errors.

  ## Solution
  Use a database trigger to automatically update games.current_players whenever
  a row is inserted or deleted from game_players table. This way, players don't
  need UPDATE permission on the games table.

  ## Changes
  1. Create function to update current_players count
  2. Create trigger on game_players INSERT/DELETE
*/

-- Function to update current_players count for a game
CREATE OR REPLACE FUNCTION update_game_current_players()
RETURNS TRIGGER AS $$
BEGIN
  -- When a player joins (INSERT) or leaves (DELETE), update the count
  IF (TG_OP = 'INSERT') THEN
    UPDATE games
    SET current_players = (
      SELECT COUNT(*)
      FROM game_players
      WHERE game_id = NEW.game_id
    )
    WHERE id = NEW.game_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE games
    SET current_players = (
      SELECT COUNT(*)
      FROM game_players
      WHERE game_id = OLD.game_id
    )
    WHERE id = OLD.game_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_game_current_players_trigger ON game_players;

-- Create trigger on game_players table
CREATE TRIGGER update_game_current_players_trigger
  AFTER INSERT OR DELETE ON game_players
  FOR EACH ROW
  EXECUTE FUNCTION update_game_current_players();

-- Initialize current_players for existing games
UPDATE games
SET current_players = (
  SELECT COUNT(*)
  FROM game_players
  WHERE game_players.game_id = games.id
);
