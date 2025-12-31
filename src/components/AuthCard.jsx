// src/components/AuthCard.jsx
import { Link } from "react-router-dom";
import "./AuthCard.css";

export default function AuthCard({ mode }) {
  const isSignup = mode === "signup";

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

          <form>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit" className="primary-btn">
              Log In
            </button>
          </form>

          <p className="switch-text">
            New here? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        {/* SIGNUP */}
        <div className="panel panel-signup">
          <h2>Create Account</h2>
          <p>Join the community</p>

          <form>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit" className="primary-btn">
              Sign Up
            </button>
          </form>

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