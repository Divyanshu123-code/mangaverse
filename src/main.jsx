import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./Context/AuthContext";
import { FollowProvider } from "./Context/FollowContext";
import "./index.css";

// ✅ Fix for hero section cutoff (viewport height issue)
function setVh() {
  // Set --vh to 1% of current viewport height
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}

// Run once on load
setVh();

// Update dynamically on window resize or orientation change
window.addEventListener("resize", setVh);
window.addEventListener("orientationchange", setVh);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FollowProvider>
        <App />
      </FollowProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);