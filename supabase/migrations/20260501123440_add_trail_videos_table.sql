/*
  # Add trail_videos table

  1. New Tables
    - `trail_videos`
      - `id` (uuid, primary key)
      - `trail_id` (uuid, FK to trails)
      - `video_url` (text, public URL from storage)
      - `caption` (text, optional)
      - `sort_order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read any trail video
    - Users can insert/update/delete only their own trail's videos
*/

CREATE TABLE IF NOT EXISTS trail_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  caption text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trail_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view trail videos"
  ON trail_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert videos for their own trails"
  ON trail_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trails WHERE trails.id = trail_id AND trails.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update videos for their own trails"
  ON trail_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trails WHERE trails.id = trail_id AND trails.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trails WHERE trails.id = trail_id AND trails.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete videos for their own trails"
  ON trail_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trails WHERE trails.id = trail_id AND trails.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('trail-videos', 'trail-videos', true)
ON CONFLICT (id) DO NOTHING;
