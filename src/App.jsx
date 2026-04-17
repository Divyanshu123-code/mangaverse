import { Routes, Route, Navigate } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MangaDetailPage from "./pages/MangaDetailPage";
import ReaderPage from "./pages/ReaderPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import { useAuth } from "./Context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading, DEV_MODE } = useAuth();

  if (loading) return <div className="text-white">Loading...</div>;
  if (DEV_MODE) return children;

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />

      {/* protected */}
      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/manga/:id" element={<PrivateRoute><MangaDetailPage /></PrivateRoute>} />
      <Route path="/read" element={<PrivateRoute><ReaderPage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}