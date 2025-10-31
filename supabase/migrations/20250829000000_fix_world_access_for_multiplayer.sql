/*
  # Allow players to read worlds used in their games

  This migration adds a policy so players can read worlds from games they've joined.

  ## Changes
  - Add policy to allow reading worlds that are used in games the user is participating in
*/

-- Allow users to read worlds used in games they're playing
CREATE POLICY "Users can read worlds from their games"
  ON worlds
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT world_id FROM games
      WHERE id IN (
        SELECT game_id FROM game_players
        WHERE player_id = auth.uid()
      )
    )
  );
