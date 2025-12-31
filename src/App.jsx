import { Routes, Route, Navigate } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
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
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}