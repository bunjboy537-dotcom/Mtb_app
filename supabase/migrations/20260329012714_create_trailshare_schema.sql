/*
  # TrailShare Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `username` (text, unique, required)
      - `location` (text)
      - `experience_level` (enum: beginner, intermediate, advanced, expert)
      - `bio` (text)
      - `created_at` (timestamptz)
    
    - `trails`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `starting_location` (text, required)
      - `miles` (decimal, required)
      - `difficulty` (enum: easy, moderate, hard, expert)
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `trail_images`
      - `id` (uuid, primary key)
      - `trail_id` (uuid, foreign key to trails)
      - `image_url` (text, required)
      - `caption` (text)
      - `is_cover` (boolean, default false)
      - `sort_order` (integer, default 0)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, but only update their own
    - Trails: Users can read all trails, create their own, update/delete only their own
    - Trail Images: Users can read all images, create images for their trails, update/delete only their own trail images
*/

-- Create experience_level enum
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create difficulty enum
CREATE TYPE difficulty AS ENUM ('easy', 'moderate', 'hard', 'expert');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  location text DEFAULT '',
  experience_level experience_level DEFAULT 'beginner',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create trails table
CREATE TABLE IF NOT EXISTS trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  starting_location text NOT NULL,
  miles decimal NOT NULL,
  difficulty difficulty NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create trail_images table
CREATE TABLE IF NOT EXISTS trail_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid REFERENCES trails(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text DEFAULT '',
  is_cover boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trails policies
CREATE POLICY "Trails are viewable by everyone"
  ON trails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own trails"
  ON trails FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trails"
  ON trails FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trails"
  ON trails FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trail images policies
CREATE POLICY "Trail images are viewable by everyone"
  ON trail_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create images for their own trails"
  ON trail_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trails
      WHERE trails.id = trail_images.trail_id
      AND trails.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own trail images"
  ON trail_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trails
      WHERE trails.id = trail_images.trail_id
      AND trails.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trails
      WHERE trails.id = trail_images.trail_id
      AND trails.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own trail images"
  ON trail_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trails
      WHERE trails.id = trail_images.trail_id
      AND trails.user_id = auth.uid()
    )
  );