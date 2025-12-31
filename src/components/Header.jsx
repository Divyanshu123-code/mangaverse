// src/components/Header.jsx
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Helper: get initials from displayName or email
  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.trim().split(" ");
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "?";
  };

  return (
    <header className="bg-[#0b1220] text-white px-6 py-4 flex justify-between items-center relative shadow-md">
      {/* Logo */}
      <h1
        onClick={() => navigate("/home")}
        className="text-2xl font-bold text-pink-500 cursor-pointer"
      >
        MangaVerse
      </h1>

      {/* Right side buttons */}
      <div className="flex items-center gap-6 relative">
        {/* 🔍 Search */}
        <button
          onClick={() => navigate("/search")}
          className="hover:text-pink-500 transition"
        >
          <Search size={22} />
        </button>

        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="hover:text-pink-500 transition"
          >
            <Bell size={22} />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#111827] rounded-lg shadow-lg p-3 z-50">
              <p className="text-sm font-semibold mb-2">Notifications</p>
              <ul className="space-y-2 text-sm">
                <li className="hover:bg-gray-700 p-2 rounded">
                  New manga updates available
                </li>
                <li className="hover:bg-gray-700 p-2 rounded">
                  Your profile was updated
                </li>
                <li className="hover:bg-gray-700 p-2 rounded">
                  New features coming soon 🚀
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="bg-pink-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold"
          >
            {getInitials()}
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#111827] rounded-lg shadow-lg p-2 z-50">
              <ul className="space-y-1 text-sm">
                <li
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile"); // future profile page
                  }}
                  className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                >
                  Profile
                </li>
                <li
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings"); // placeholder
                  }}
                  className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                >
                  Settings
                </li>
                <li
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="cursor-pointer hover:bg-gray-700 p-2 rounded text-red-400"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}