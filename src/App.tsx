import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { CreatePost } from './pages/CreatePost';
import { Profile } from './pages/Profile';
import { TrailDetail } from './pages/TrailDetail';
import { EditTrail } from './pages/EditTrail';
import { PublicProfile } from './pages/PublicProfile';

function ProtectedRoute({ children, requireAuth = false }: { children: React.ReactNode; requireAuth?: boolean }) {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (user) return <>{children}</>;
  if (isGuest && !requireAuth) return <>{children}</>;
  return <Navigate to="/" />;
}

function AppRoutes() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={(user || isGuest) ? <Navigate to="/home" /> : <Landing />} />
      <Route path="/signin" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/onboarding" element={<ProtectedRoute requireAuth><Onboarding /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute requireAuth><CreatePost /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requireAuth><Profile /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
      <Route path="/trail/:id" element={<ProtectedRoute><TrailDetail /></ProtectedRoute>} />
      <Route path="/trail/:id/edit" element={<ProtectedRoute requireAuth><EditTrail /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
