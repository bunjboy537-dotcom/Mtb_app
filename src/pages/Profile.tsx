import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LogOut, CreditCard as Edit, Trash2, X, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trail } from '../types';
import { getExperienceBadgeColor } from '../utils/difficulty';
import { BottomNav } from '../components/BottomNav';

export function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Trail | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserTrails();
    }
  // Fetch on every mount so newly created trails appear immediately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserTrails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trails')
        .select(`
          *,
          trail_images(id, image_url, is_cover)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrails(data || []);
    } catch (error) {
      console.error('Error fetching trails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('trails')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      setTrails((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting trail:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCoverImage = (trail: Trail) => {
    return trail.trail_images?.find((img) => img.is_cover)?.image_url;
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-heading text-forest-800 mb-2">
                {profile.username}
              </h1>
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
                <p className="text-gray-600 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="flex-1 flex items-center justify-center gap-2 bg-forest-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-forest-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-heading text-forest-800">
            My Trails ({trails.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-sand-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : trails.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">You haven't posted any trails yet</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 bg-forest-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-forest-700 transition-colors"
            >
              Share Your First Trail
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {trails.map((trail) => (
              <div
                key={trail.id}
                className="relative aspect-square bg-sand-200 rounded-xl overflow-hidden group"
              >
                <div
                  onClick={() => navigate(`/trail/${trail.id}`)}
                  className="w-full h-full cursor-pointer"
                >
                  {getCoverImage(trail) ? (
                    <img
                      src={getCoverImage(trail)}
                      alt={trail.name}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm text-center px-4">
                        {trail.name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/trail/${trail.id}/edit`); }}
                  className="absolute top-2 left-2 bg-black/50 hover:bg-forest-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(trail); }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-white text-xs font-medium line-clamp-1">{trail.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-heading text-forest-800">Delete Trail</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-1">Are you sure you want to delete</p>
            <p className="font-semibold text-forest-800 mb-5">"{deleteTarget.name}"?</p>
            <p className="text-gray-500 text-xs mb-6">This action cannot be undone. All photos associated with this trail will also be removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-sand-300 text-gray-700 font-semibold hover:bg-sand-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
