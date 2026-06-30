import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const browseItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {browseItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-forest-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" fill={isActive ? 'currentColor' : 'none'} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}

          {!isGuest && (
            <Link
              to="/create"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                location.pathname === '/create' ? 'text-forest-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Plus
                className="w-6 h-6 mb-1"
                fill={location.pathname === '/create' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">Create</span>
            </Link>
          )}

          {user && (
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                location.pathname === '/profile' ? 'text-forest-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User
                className="w-6 h-6 mb-1"
                fill={location.pathname === '/profile' ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-gray-400 hover:text-red-500"
            >
              <LogOut className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          )}

          {isGuest && (
            <Link
              to="/signin"
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-gray-400 hover:text-forest-600"
            >
              <LogIn className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
