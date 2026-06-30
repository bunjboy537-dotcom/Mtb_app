import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X, Upload, Image as ImageIcon, Video, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Difficulty } from '../types';
import { getDifficultyColor } from '../utils/difficulty';
import { BottomNav } from '../components/BottomNav';

interface CreatePostForm {
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

interface VideoUpload {
  file: File;
  preview: string;
  caption: string;
}

export function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState<ImageUpload | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageUpload[]>([]);
  const [videos, setVideos] = useState<VideoUpload[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePostForm>({
    defaultValues: {
      difficulty: 'moderate',
    },
  });

  const selectedDifficulty = watch('difficulty');

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
      });
    }
  };

  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdditionalImages([
        ...additionalImages,
        {
          file,
          preview: URL.createObjectURL(file),
          caption: '',
        },
      ]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setAdditionalImages(
      additionalImages.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideos((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file), caption: '' },
    ]);
    e.target.value = '';
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVideoCaption = (index: number, caption: string) => {
    setVideos((prev) => prev.map((v, i) => (i === index ? { ...v, caption } : v)));
  };

  const uploadVideo = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('trail-videos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('trail-videos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('trail-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('trail-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const onSubmit = async (data: CreatePostForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: trail, error: trailError } = await supabase
        .from('trails')
        .insert({
          user_id: user.id,
          name: data.name,
          starting_location: data.starting_location,
          miles: data.miles,
          difficulty: data.difficulty,
          description: data.description,
        })
        .select()
        .single();

      if (trailError) throw trailError;

      if (coverImage) {
        const coverImageUrl = await uploadImage(coverImage.file, user.id);
        await supabase.from('trail_images').insert({
          trail_id: trail.id,
          image_url: coverImageUrl,
          caption: 'Trail Start',
          is_cover: true,
          sort_order: 0,
        });
      }

      for (let i = 0; i < additionalImages.length; i++) {
        const imageUrl = await uploadImage(additionalImages[i].file, user.id);
        await supabase.from('trail_images').insert({
          trail_id: trail.id,
          image_url: imageUrl,
          caption: additionalImages[i].caption,
          is_cover: false,
          sort_order: i + 1,
        });
      }

      for (let i = 0; i < videos.length; i++) {
        const videoUrl = await uploadVideo(videos[i].file, user.id);
        await supabase.from('trail_videos').insert({
          trail_id: trail.id,
          video_url: videoUrl,
          caption: videos[i].caption,
          sort_order: i,
        });
      }

      navigate(`/trail/${trail.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const difficultyLevels: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-heading text-forest-800 mb-6">
          Share a Trail
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trail Name
            </label>
            <input
              {...register('name', { required: 'Trail name is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
              placeholder="Rocky Ridge Loop"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Starting Location
            </label>
            <input
              {...register('starting_location', { required: 'Starting location is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
              placeholder="City, State or Trail Head Name"
            />
            {errors.starting_location && (
              <p className="text-red-600 text-sm mt-1">{errors.starting_location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Distance (Miles)
            </label>
            <input
              {...register('miles', { required: 'Distance is required', min: 0.1 })}
              type="number"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none"
              placeholder="12.5"
            />
            {errors.miles && (
              <p className="text-red-600 text-sm mt-1">{errors.miles.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Difficulty Rating
            </label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe the trail conditions, scenery, and what riders should expect..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trail Start Photo <span className="text-gray-400 font-normal text-xs">(Optional)</span>
            </label>
            <div className="mb-4">
              {!coverImage ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-sand-300 rounded-xl cursor-pointer bg-white hover:bg-sand-50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload trail start photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={coverImage.preview}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Photos (Optional)
            </label>
            <div className="space-y-4">
              {additionalImages.map((image, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-sand-200">
                  <div className="relative mb-3">
                    <img
                      src={image.preview}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateImageCaption(index, e.target.value)}
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
                  onChange={handleAdditionalImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-semibold text-gray-700">
                Trail Videos
              </label>
              <span className="text-xs bg-sand-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                Optional
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Add ride footage, trail overviews, or action clips (MP4, MOV, etc.)
            </p>

            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-sand-200">
                  <div className="relative mb-3">
                    <video
                      src={video.preview}
                      className="w-full h-48 object-cover rounded-lg bg-gray-900"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Play className="w-3 h-3 fill-white" />
                      <span className="text-xs font-medium">Video</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={video.caption}
                    onChange={(e) => updateVideoCaption(index, e.target.value)}
                    placeholder="Add a caption (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              ))}

              <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-sand-300 rounded-xl cursor-pointer bg-white hover:bg-sand-50 transition-colors">
                <Video className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Add Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 text-white py-4 rounded-xl font-semibold hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting Trail...' : 'Post Trail'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
