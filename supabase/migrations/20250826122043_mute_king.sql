/*
  # Create game database schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_config` (jsonb for avatar customization)
      - `level` (integer, default 1)
      - `xp` (integer, default 0)
      - `coins` (integer, default 100)
      - `games_played` (integer, default 0)
      - `games_won` (integer, default 0)
      - `total_hides` (integer, default 0)
      - `total_seeks` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `worlds`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `world_data` (jsonb for block positions and configuration)
      - `thumbnail_url` (text)
      - `is_public` (boolean, default false)
      - `play_count` (integer, default 0)
      - `rating` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `games`
      - `id` (uuid, primary key)
      - `lobby_code` (text, unique)
      - `host_id` (uuid, references profiles)
      - `world_id` (uuid, references worlds)
      - `game_state` (jsonb for current game state)
      - `max_players` (integer, default 8)
      - `current_players` (integer, default 0)
      - `status` (text with check constraint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `game_players`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references games)
      - `player_id` (uuid, references profiles)
      - `role` (text, either 'hider' or 'seeker')
      - `position` (jsonb for x,y coordinates)
      - `is_found` (boolean, default false)
      - `score` (integer, default 0)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
    - Add policies for game participation and world sharing

  3. Functions
    - Auto-update updated_at timestamps
    - Handle user profile creation on signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_config jsonb DEFAULT '{}',
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  coins integer DEFAULT 100,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_hides integer DEFAULT 0,
  total_seeks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create worlds table
CREATE TABLE IF NOT EXISTS worlds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  world_data jsonb DEFAULT '{"blocks": []}',
  thumbnail_url text DEFAULT '',
  is_public boolean DEFAULT false,
  play_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  world_id uuid REFERENCES worlds(id) ON DELETE CASCADE,
  game_state jsonb DEFAULT '{}',
  max_players integer DEFAULT 8,
  current_players integer DEFAULT 0,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'hider' CHECK (role IN ('hider', 'seeker')),
  position jsonb DEFAULT '{"x": 100, "y": 150}',
  is_found boolean DEFAULT false,
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Worlds policies
CREATE POLICY "Users can read public worlds"
  ON worlds
  FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can manage own worlds"
  ON worlds
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid());

-- Games policies
CREATE POLICY "Users can read games they participate in"
  ON games
  FOR SELECT
  TO authenticated
  USING (
    host_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM game_players 
      WHERE game_id = games.id AND player_id = auth.uid()
    )
  );

CREATE POLICY "Users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Game hosts can update their games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

-- Game players policies
CREATE POLICY "Users can read game players for games they're in"
  ON game_players
  FOR SELECT
  TO authenticated
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM games 
      WHERE id = game_id AND host_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM game_players gp2
      WHERE gp2.game_id = game_players.game_id AND gp2.player_id = auth.uid()
    )
  );

CREATE POLICY "Users can join games"
  ON game_players
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own game player data"
  ON game_players
  FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid());

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER worlds_updated_at
  BEFORE UPDATE ON worlds
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();