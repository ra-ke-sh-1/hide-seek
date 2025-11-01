-- Enable realtime for game_players table
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;

-- Enable realtime for games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Verify the tables are in the publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
