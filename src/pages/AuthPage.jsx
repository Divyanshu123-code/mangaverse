// src/pages/AuthPage.jsx
import { useLocation, Navigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function AuthPage() {
  const location = useLocation();

  const pathname = location.pathname;
  let mode;
  if (pathname === "/login") mode = "login";
  else if (pathname === "/signup") mode = "signup";
  else return <Navigate to="/login" replace />;

  return <AuthCard mode={mode} />;
}
