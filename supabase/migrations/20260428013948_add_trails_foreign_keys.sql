/*
  # Add foreign key constraints to trails and trail_images

  1. Changes
    - Add FK from trails.user_id → auth.users.id (enables PostgREST to resolve the profiles join via user_id)
    - Add FK from trail_images.trail_id → trails.id

  2. Notes
    - Without these FKs, PostgREST cannot resolve embedded resource joins and throws an error
    - The error was silently caught in TrailDetail, leaving trail as null → "Trail not found"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'trails_user_id_fkey' AND table_name = 'trails'
  ) THEN
    ALTER TABLE trails
      ADD CONSTRAINT trails_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'trail_images_trail_id_fkey' AND table_name = 'trail_images'
  ) THEN
    ALTER TABLE trail_images
      ADD CONSTRAINT trail_images_trail_id_fkey
      FOREIGN KEY (trail_id) REFERENCES trails(id) ON DELETE CASCADE;
  END IF;
END $$;
