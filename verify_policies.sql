-- Check all RLS policies on games and game_players tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('games', 'game_players')
ORDER BY tablename, cmd, policyname;
