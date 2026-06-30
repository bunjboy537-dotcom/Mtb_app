import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Difficulty, Trail, TrailImage } from '../types';
import { getDifficultyColor } from '../utils/difficulty';
import { BottomNav } from '../components/BottomNav';

interface EditTrailForm {
  name: string;
  starting_location: string;
  miles: number;
  difficulty: Difficulty;
  description: string;
}

interface ImageUpload {
  file: File;
  preview: string;
  caption: string;
}

export function EditTrail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTrail, setLoadingTrail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [existingCover, setExistingCover] = useState<TrailImage | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<ImageUpload | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const [existingAdditional, setExistingAdditional] = useState<TrailImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set());
  const [newAdditionalImages, setNewAdditionalImages] = useState<ImageUpload[]>([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EditTrailForm>();
  const selectedDifficulty = watch('difficulty');

  useEffect(() => {
    if (id) fetchTrail(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrail = async (trailId: string) => {
    try {
      const { data, error } = await supabase
        .from('trails')
        .select('*, trail_images(id, image_url, caption, is_cover, sort_order)')
        .eq('id', trailId)
        .maybeSingle();

      if (error) throw error;
      if (!data || data.user_id !== user?.id) {
        navigate('/profile');
        return;
      }

      reset({
        name: data.name,
        starting_location: data.starting_location,
        miles: data.miles,
        difficulty: data.difficulty,
        description: data.description || '',
      });

      const images: TrailImage[] = data.trail_images || [];
      images.sort((a, b) => a.sort_order - b.sort_order);
      setExistingCover(images.find((i) => i.is_cover) || null);
      setExistingAdditional(images.filter((i) => !i.is_cover));
    } catch (err) {
      console.error('Error fetching trail:', err);
      navigate('/profile');
    } finally {
      setLoadingTrail(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('trail-images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('trail-images').getPublicUrl(fileName).data.publicUrl;
  };

  const onSubmit = async (data: EditTrailForm) => {
    if (!id || !user) return;
    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('trails')
        .update({
          name: data.name,
          starting_location: data.starting_location,
          miles: data.miles,
          difficulty: data.difficulty,
          description: data.description,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle cover image replacement
      if (removeCover && existingCover) {
        await supabase.from('trail_images').delete().eq('id', existingCover.id);
      }
      if (newCoverImage) {
        if (existingCover && !removeCover) {
          await supabase.from('trail_images').delete().eq('id', existingCover.id);
        }
        const url = await uploadImage(newCoverImage.file);
        await supabase.from('trail_images').insert({
          trail_id: id,
          image_url: url,
          caption: 'Trail Start',
          is_cover: true,
          sort_order: 0,
        });
      }

      // Delete removed additional images
      for (const imgId of removedImageIds) {
        await supabase.from('trail_images').delete().eq('id', imgId);
      }

      // Upload new additional images
      const existingCount = existingAdditional.filter((i) => !removedImageIds.has(i.id)).length;
      for (let i = 0; i < newAdditionalImages.length; i++) {
        const url = await uploadImage(newAdditionalImages[i].file);
        await supabase.from('trail_images').insert({
          trail_id: id,
          image_url: url,
          caption: newAdditionalImages[i].caption,
          is_cover: false,
          sort_order: existingCount + i + 1,
        });
      }

      navigate(`/trail/${id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const difficultyLevels: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  if (loadingTrail) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
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
        <h1 className="text-3xl font-heading text-forest-800 mb-6">Edit Trail</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trail Name</label>
            <input
              {...register('name', { required: 'Trail name is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Location</label>
            <input
              {...register('starting_location', { required: 'Starting location is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
            />
            {errors.starting_location && <p className="text-red-600 text-sm mt-1">{errors.starting_location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (Miles)</label>
            <input
              {...register('miles', { required: 'Distance is required', min: 0.1 })}
              type="number"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
            />
            {errors.miles && <p className="text-red-600 text-sm mt-1">{errors.miles.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Rating</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {difficultyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setValue('difficulty', level.value)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedDifficulty === level.value
                      ? getDifficultyColor(level.value)
                      : 'bg-white border-2 border-sand-300 text-gray-700 hover:border-forest-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trail Start Photo</label>
            {newCoverImage ? (
              <div className="relative">
                <img src={newCoverImage.preview} alt="New cover" className="w-full h-64 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setNewCoverImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : existingCover && !removeCover ? (
              <div className="relative">
                <img src={existingCover.image_url} alt="Cover" className="w-full h-64 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setRemoveCover(true)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-sand-300 rounded-xl cursor-pointer bg-white hover:bg-sand-50 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload trail start photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewCoverImage({ file, preview: URL.createObjectURL(file), caption: '' });
                      setRemoveCover(false);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Additional images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Photos</label>
            <div className="space-y-4">
              {existingAdditional.filter((img) => !removedImageIds.has(img.id)).map((img) => (
                <div key={img.id} className="bg-white p-4 rounded-xl border border-sand-200">
                  <div className="relative mb-3">
                    <img src={img.image_url} alt={img.caption || 'Trail photo'} className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setRemovedImageIds((prev) => new Set([...prev, img.id]))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {img.caption && <p className="text-sm text-gray-500 px-1">{img.caption}</p>}
                </div>
              ))}

              {newAdditionalImages.map((img, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-sand-200">
                  <div className="relative mb-3">
                    <img src={img.preview} alt={`New ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setNewAdditionalImages((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) =>
                      setNewAdditionalImages((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, caption: e.target.value } : item))
                      )
                    }
                    placeholder="Add a caption (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              ))}

              <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-sand-300 rounded-xl cursor-pointer bg-white hover:bg-sand-50 transition-colors">
                <ImageIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewAdditionalImages((prev) => [...prev, { file, preview: URL.createObjectURL(file), caption: '' }]);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-forest-600 text-white py-4 rounded-xl font-semibold hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
