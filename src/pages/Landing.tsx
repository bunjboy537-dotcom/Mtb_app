import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { user, isGuest, loading, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if ((user || isGuest) && !loading) navigate('/home');
  }, [user, isGuest, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-900">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        }}
      />

      {/* Layered gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-900/40 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative flex flex-col min-h-screen px-6">
        {/* Top badge */}
        <div className="flex justify-center pt-14">
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            <Mountain className="w-4 h-4 text-white/80" strokeWidth={1.5} />
            <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
              TrailShare
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-end pb-12">
          <div className="mb-10">
            <h1 className="text-[3.25rem] font-heading text-white leading-tight tracking-tight mb-4">
              Ride more.<br />Share the trail.
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-xs">
              Discover hidden gems, log your rides, and connect with riders in your area.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-between bg-white text-forest-900 px-6 py-4 rounded-2xl font-bold text-base hover:bg-sand-50 transition-all active:scale-[0.98] shadow-xl shadow-black/30"
            >
              <span>Create an Account</span>
              <ChevronRight className="w-5 h-5 text-forest-600" />
            </button>

            <button
              onClick={() => navigate('/signin')}
              className="w-full flex items-center justify-between bg-white/10 border border-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold text-base hover:bg-white/18 transition-all active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ChevronRight className="w-5 h-5 text-white/50" />
            </button>

            <button
              onClick={() => { continueAsGuest(); navigate('/home'); }}
              className="w-full text-white/45 text-sm py-2 hover:text-white/70 transition-colors"
            >
              Continue as Guest
            </button>
          </div>

          <p className="text-center text-white/25 text-xs mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
