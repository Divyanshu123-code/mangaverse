// src/pages/AuthPage.jsx
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AuthCard from "../components/AuthCard";

export default function AuthPage() {
  const location = useLocation();
  const { user, loading, DEV_MODE } = useAuth();

  const pathname = location.pathname;
  let mode;
  if (pathname === "/login") mode = "login";
  else if (pathname === "/signup") mode = "signup";
  else return <Navigate to="/login" replace />;

  // Show loading state
  if (loading) return <div className="text-white flex items-center justify-center h-screen">Loading...</div>;
  
  // Redirect to home if already logged in (but not in dev mode)
  if (user && !DEV_MODE) return <Navigate to="/home" replace />;

  return <AuthCard mode={mode} />;
}
