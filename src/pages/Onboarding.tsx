import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ExperienceLevel } from '../types';

interface OnboardingForm {
  username: string;
  location: string;
  experience_level: ExperienceLevel;
  bio: string;
}

export function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: {
      username: '',
      location: '',
      experience_level: 'beginner',
      bio: '',
    },
  });

  const selectedExperience = watch('experience_level');

  useEffect(() => {
    if (profile) {
      setValue('username', profile.username);
      setValue('location', profile.location);
      setValue('experience_level', profile.experience_level);
      setValue('bio', profile.bio);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: OnboardingForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: data.username,
          location: data.location,
          experience_level: data.experience_level,
          bio: data.bio,
        }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      await refreshProfile();
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="min-h-screen bg-sand-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-heading text-forest-800 mb-2">
          {profile ? 'Edit Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-gray-600 mb-8">
          Tell us about yourself to join the TrailShare community
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              {...register('username', { required: 'Username is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none transition-all"
              placeholder="ridername"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none transition-all"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Riding Experience
            </label>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setValue('experience_level', level.value)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    selectedExperience === level.value
                      ? 'border-forest-600 bg-forest-50 text-forest-700'
                      : 'border-sand-300 bg-white text-gray-700 hover:border-forest-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:ring-2 focus:ring-forest-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Tell us about your riding style and favorite trails..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 text-white py-4 rounded-xl font-semibold hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
