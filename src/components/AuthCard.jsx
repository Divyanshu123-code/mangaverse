// src/components/AuthCard.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./AuthCard.css";

export default function AuthCard({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(formData.email, formData.password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = -((y / rect.height) - 0.5) * 10;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className={`auth-wrapper animated ${isSignup ? "signup-active" : ""}`}>
      <div
        className="auth-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
      >
        {/* LOGIN */}
        <div className="panel panel-login">
          <h2>Welcome Back</h2>
          <p>Login to continue</p>

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="or-divider">or</div>

          <button 
            onClick={handleGoogleLogin} 
            className="google-btn mt-3"
            disabled={loading}
          >
            <img src="/images/google.png" alt="Google" className="google-icon" />
            {isSignup ? "Sign up with Google" : "Continue with Google"}
          </button>

          <p className="switch-text">
            New here? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        {/* SIGNUP */}
        <div className="panel panel-signup">
          <h2>Create Account</h2>
          <p>Join the community</p>

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSignupSubmit}>
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <div className="or-divider">or</div>

          <button 
            onClick={handleGoogleLogin} 
            className="google-btn mt-3"
            disabled={loading}
          >
            <img src="/images/google.png" alt="Google" className="google-icon" />
            Sign up with Google
          </button>

          <p className="switch-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        {/* OVERLAY */}
        <div className="overlay">
          <div className={`overlay-panel overlay-left ${isSignup ? "active" : ""}`}>
            <h2>Welcome Back!</h2>
            <p>Login with your personal info.</p>
            <Link to="/login" className="ghost-btn">Log In</Link>
          </div>

          <div className={`overlay-panel overlay-right ${!isSignup ? "active" : ""}`}>
            <h2>Hello, Friend!</h2>
            <p>Start your journey with us.</p>
            <Link to="/signup" className="ghost-btn">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}