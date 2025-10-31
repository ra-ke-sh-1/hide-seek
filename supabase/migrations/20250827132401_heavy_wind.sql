/*
  # Create trigger for new user profile creation

  1. New Functions
    - `handle_new_user()` - Creates a profile entry when a new user signs up
  
  2. New Triggers
    - `on_auth_user_created` - Executes after user insertion in auth.users
  
  3. Security
    - Function runs with SECURITY DEFINER to access auth schema
    - Automatically creates profile with username from user metadata
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username,
    avatar_config,
    level,
    xp,
    coins,
    games_played,
    games_won,
    total_hides,
    total_seeks
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    '{}',
    1,
    0,
    100,
    0,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to execute function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();