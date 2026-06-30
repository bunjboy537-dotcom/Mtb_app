import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, Trail } from '../types';
import { getExperienceBadgeColor } from '../utils/difficulty';

export function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      Promise.all([fetchProfile(userId), fetchUserTrails(userId)]).finally(() =>
        setLoading(false)
      );
    }
  }, [userId]);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    setProfile(data);
  };

  const fetchUserTrails = async (uid: string) => {
    const { data } = await supabase
      .from('trails')
      .select('*, trail_images(id, image_url, is_cover)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setTrails(data || []);
  };

  const getCoverImage = (trail: Trail) =>
    trail.trail_images?.find((img) => img.is_cover)?.image_url;

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
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

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-sand-200 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-forest-700 font-semibold hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-heading text-forest-800 mb-2">{profile.username}</h1>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getExperienceBadgeColor(profile.experience_level)}`}>
              {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)}
            </span>
            {profile.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
          </div>
          {profile.bio && (
            <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-heading text-forest-800">Trails ({trails.length})</h2>
        </div>

        {trails.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">This user hasn't posted any trails yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {trails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => navigate(`/trail/${trail.id}`)}
                className="aspect-square bg-sand-200 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                {getCoverImage(trail) ? (
                  <img
                    src={getCoverImage(trail)}
                    alt={trail.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm text-center px-4">{trail.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
