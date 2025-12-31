// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-white">Loading...</div>; // or a spinner
  }

  return user ? children : <Navigate to="/login" />;
}