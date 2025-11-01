# Production Migration Guide

This guide explains how to apply database migrations to your production Supabase instance.

## Prerequisites

- Access to your Supabase production dashboard
- Your production project reference ID (found in Project Settings)

---

## Method 1: Manual Migration (Recommended for First Time)

### Step 1: Access SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your production project
3. Click "SQL Editor" in the left sidebar

### Step 2: Execute Migrations in Order

Run each migration file in the following order. Copy the entire content of each file and click "Run":

#### 1. Base Schema (20250826122043_mute_king.sql)
Creates all base tables: profiles, worlds, games, game_players

#### 2. User Profile Trigger (20250827132401_heavy_wind.sql)
Sets up automatic profile creation on user signup

#### 3. World Access Fix (20250829000000_fix_world_access_for_multiplayer.sql)
Allows players to access worlds in multiplayer games

#### 4. Profiles RLS (20250830000004_fix_profiles_rls.sql)
Allows players to see each other's usernames

#### 5. Games RLS (20250830000005_fix_games_realtime_access.sql)
Makes games table readable by all authenticated users

#### 6. **CRITICAL: Enable Realtime (20250830000006_enable_realtime_publication.sql)**
Enables postgres_changes events for realtime multiplayer

**⚠️ IMPORTANT:** After running migration #6, realtime events will be enabled. No restart is needed for cloud Supabase.

---

## Method 2: Using Supabase CLI (For Automation)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or using Homebrew (macOS/Linux):
```bash
brew install supabase/tap/supabase
```

Or using Scoop (Windows):
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### Step 3: Link Your Project

```bash
cd /path/to/your/project
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your project reference ID from:
- Dashboard → Project Settings → General → Reference ID

### Step 4: Push Migrations to Production

```bash
supabase db push
```

This will push all migrations in the `supabase/migrations` directory to production.

### Step 5: Verify Migrations

```bash
supabase db remote list
```

This shows all applied migrations on production.

---

## Method 3: GitHub Actions CI/CD (Advanced)

Create `.github/workflows/deploy-migrations.yml`:

```yaml
name: Deploy Database Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

Add these secrets to your GitHub repository:
- `SUPABASE_PROJECT_REF`: Your project reference ID
- `SUPABASE_ACCESS_TOKEN`: Generate from Dashboard → Account → Access Tokens

---

## Verification

After running migrations, verify they worked:

### 1. Check Tables Exist

Go to: Dashboard → Table Editor

You should see:
- profiles
- worlds
- games
- game_players

### 2. Verify Realtime is Enabled

Run this in SQL Editor:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

You should see:
- game_players
- games

### 3. Test Multiplayer

Create a game and verify:
- Players can join
- Player list updates in real-time
- Game starts for all players when host clicks "Start Game"

---

## Troubleshooting

### Issue: Migration fails with "already exists" error

**Solution:** Check which migrations have already been applied:
```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

Then manually run only the missing migrations.

### Issue: Realtime events not working after migration

**Solution:** Verify the publication:
```sql
-- Check if tables are in publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check replica identity
SELECT schemaname, tablename, relreplident
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE tablename IN ('games', 'game_players');
```

`relreplident` should be 'f' (full).

### Issue: RLS policies blocking queries

**Solution:** Check your policies:
```sql
-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Rollback (Emergency)

If a migration causes issues, you can rollback:

### Using Dashboard
1. Go to SQL Editor
2. Run the reverse operations manually (DROP policies, DROP tables, etc.)

### Using CLI
```bash
# Restore to a previous migration
supabase db reset --version 20250830000005
```

**⚠️ WARNING:** This will delete all data created after that migration!

---

## Best Practices

1. **Test migrations locally first** using `npx supabase start`
2. **Backup production database** before running migrations
3. **Run migrations during low-traffic periods**
4. **Have a rollback plan ready**
5. **Monitor application logs** after deployment
6. **Verify realtime functionality** immediately after deployment

---

## Migration Files Summary

| File | Purpose | Critical? |
|------|---------|-----------|
| 20250826122043_mute_king.sql | Base schema | ✅ Yes |
| 20250827132401_heavy_wind.sql | User trigger | ✅ Yes |
| 20250829000000_fix_world_access_for_multiplayer.sql | World access | ✅ Yes |
| 20250830000004_fix_profiles_rls.sql | Profile visibility | ✅ Yes |
| 20250830000005_fix_games_realtime_access.sql | Games RLS | ✅ Yes |
| 20250830000006_enable_realtime_publication.sql | Realtime events | ⚠️ CRITICAL |

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for realtime connection errors
3. Verify environment variables are correct
4. Check RLS policies aren't blocking queries
