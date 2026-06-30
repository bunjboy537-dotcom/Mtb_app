import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Trail } from '../types';
import { getDifficultyColor } from '../utils/difficulty';
import { BottomNav } from '../components/BottomNav';

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

export function Explore() {
  const navigate = useNavigate();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTrails();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrails = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trails')
        .select(`
          *,
          profile:profiles!trails_user_id_profiles_fkey(username, experience_level),
          trail_images(id, image_url, is_cover, sort_order)
        `);

      if (filter !== 'all') {
        query = query.eq('difficulty', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setTrails(data || []);
    } catch (err) {
      console.error('Error fetching trails:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCoverImage = (trail: Trail) =>
    trail.trail_images?.find((img) => img.is_cover)?.image_url;

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-heading text-forest-800 mb-6">Explore Trails</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-all flex-shrink-0 ${
                filter === opt.value
                  ? 'bg-forest-600 text-white'
                  : 'bg-white border border-sand-300 text-gray-700 hover:border-forest-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-sand-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-sand-200 rounded w-3/4" />
                  <div className="h-4 bg-sand-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : trails.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No trails found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => navigate(`/trail/${trail.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {getCoverImage(trail) && (
                  <div className="relative h-48 bg-sand-200">
                    <img
                      src={getCoverImage(trail)}
                      alt={trail.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(trail.difficulty)}`}>
                        {trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-heading text-forest-800 mb-2">{trail.name}</h2>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{trail.starting_location}</span>
                    <span className="mx-2">·</span>
                    <span className="font-semibold text-forest-700">{trail.miles} mi</span>
                  </div>
                  {trail.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trail.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span>Posted by {trail.profile?.username || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
