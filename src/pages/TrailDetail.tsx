import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User as UserIcon, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Trail } from '../types';
import { getDifficultyColor, getExperienceBadgeColor } from '../utils/difficulty';

export function TrailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTrail(id);
    }
  }, [id]);

  const fetchTrail = async (trailId: string) => {
    try {
      const { data, error } = await supabase
        .from('trails')
        .select(`
          *,
          profile:profiles!trails_user_id_profiles_fkey(id, user_id, username, experience_level),
          trail_images(id, image_url, caption, is_cover, sort_order),
          trail_videos(id, video_url, caption, sort_order)
        `)
        .eq('id', trailId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      if (data.trail_images) {
        data.trail_images.sort((a, b) => a.sort_order - b.sort_order);
      }

      setTrail(data);
    } catch (error) {
      console.error('Error fetching trail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Trail not found</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-forest-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-forest-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const coverImage = trail.trail_images?.find((img) => img.is_cover);
  const additionalImages = trail.trail_images?.filter((img) => !img.is_cover) || [];
  const videos = trail.trail_videos?.sort((a, b) => a.sort_order - b.sort_order) || [];

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="sticky top-0 z-10 bg-white border-b border-sand-200 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-forest-700 font-semibold hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {coverImage && (
          <div className="relative">
            <img
              src={coverImage.image_url}
              alt="Trail Start"
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-gray-700">Trail Start</span>
            </div>
          </div>
        )}

        <div className="px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-heading text-forest-800 flex-1 mr-4">
              {trail.name}
            </h1>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${getDifficultyColor(trail.difficulty)}`}>
              {trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-1.5" />
              <span className="font-medium">{trail.starting_location}</span>
            </div>
            <span className="font-semibold text-forest-700">{trail.miles} miles</span>
          </div>

          {trail.description && (
            <div className="mb-6">
              <h2 className="text-lg font-heading text-forest-800 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{trail.description}</p>
            </div>
          )}

          <div
            onClick={() => navigate(`/profile/${trail.profile?.user_id}`)}
            className="bg-white rounded-xl p-4 border border-sand-200 cursor-pointer hover:border-forest-300 transition-colors mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-forest-700" />
              </div>
              <div>
                <p className="font-semibold text-forest-800">
                  {trail.profile?.username || 'Unknown'}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getExperienceBadgeColor(trail.profile?.experience_level || 'beginner')}`}>
                  {trail.profile?.experience_level?.charAt(0).toUpperCase() + (trail.profile?.experience_level?.slice(1) || '')}
                </span>
              </div>
            </div>
          </div>

          {additionalImages.length > 0 && (
            <div>
              <h2 className="text-lg font-heading text-forest-800 mb-3">More Photos</h2>
              <div className="space-y-4">
                {additionalImages.map((image) => (
                  <div key={image.id}>
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Trail photo'}
                      className="w-full rounded-xl"
                    />
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-2 px-1">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div>
              <h2 className="text-lg font-heading text-forest-800 mb-3 flex items-center gap-2">
                <Play className="w-5 h-5 text-forest-600 fill-forest-600" />
                Trail Videos
              </h2>
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id}>
                    <video
                      src={video.video_url}
                      className="w-full rounded-xl bg-gray-900"
                      controls
                      playsInline
                    />
                    {video.caption && (
                      <p className="text-sm text-gray-600 mt-2 px-1">{video.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
