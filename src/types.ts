export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  location: string;
  experience_level: ExperienceLevel;
  bio: string;
  created_at: string;
}

export interface Trail {
  id: string;
  user_id: string;
  name: string;
  starting_location: string;
  miles: number;
  difficulty: Difficulty;
  description: string;
  created_at: string;
  profile?: Profile;
  trail_images?: TrailImage[];
  trail_videos?: TrailVideo[];
}

export interface TrailImage {
  id: string;
  trail_id: string;
  image_url: string;
  caption: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface TrailVideo {
  id: string;
  trail_id: string;
  video_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}
