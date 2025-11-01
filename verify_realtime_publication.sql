-- Verify that tables are included in the supabase_realtime publication
SELECT
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Also check if the publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
