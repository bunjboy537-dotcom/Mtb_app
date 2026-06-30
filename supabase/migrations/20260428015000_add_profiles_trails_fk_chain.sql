/*
  # Add FK chain: profiles.user_id → auth.users, trails → profiles

  1. Changes
    - profiles.user_id gets a FK to auth.users(id)
    - trails gets a direct FK to profiles(user_id) so PostgREST can resolve
      the `profile:profiles(...)` embedded join without a hint

  2. Notes
    - Without a direct FK between trails and profiles, PostgREST cannot
      auto-resolve the join and silently returns null for the profile relation.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_user_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'trails_user_id_profiles_fkey' AND table_name = 'trails'
  ) THEN
    ALTER TABLE trails
      ADD CONSTRAINT trails_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;
