// src/pages/SettingsPage.jsx
import { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const Card = ({ title, icon, children, danger }) => (
    <div
      className={`relative p-6 rounded-2xl mb-8 backdrop-blur-lg border ${
        danger
          ? "border-red-500/40 bg-red-900/20"
          : "border-pink-500/20 bg-white/5"
      } shadow-xl`}
    >
      <h2
        className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          danger ? "text-red-400" : "text-pink-400"
        }`}
      >
        {icon} {title}
      </h2>
      {children}
      {!danger && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/10 shadow-[0_0_20px_rgba(236,72,153,0.3)]" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#1f2937] text-white px-6 py-12 relative">
      {/* Header with Close Button */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          ⚙️ Settings
        </h1>
        <button
          onClick={() => navigate("/home")}
          className="p-3 rounded-full bg-white/10 hover:bg-red-500/30 
                     border border-pink-500/40 text-pink-400 
                     hover:text-red-400 transition shadow-lg hover:scale-110"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Profile */}
      <Card title="Profile" icon={<FaUser />}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-pink-500/30 focus:ring-2 focus:ring-pink-500 outline-none transition"
          />
          <div className="flex gap-3">
            <input
              type="file"
              className="block text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 
                         file:rounded-md file:border-0 file:text-sm 
                         file:bg-gradient-to-r file:from-pink-600 file:to-purple-600 file:text-white hover:file:opacity-90"
            />
            <button className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-semibold hover:scale-105 transition transform">
              Update Profile
            </button>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card title="Account" icon={<FaLock />}>
        <p className="text-gray-300 mb-4 flex items-center gap-2">
          <FaEnvelope /> dk1474434@gmail.com
        </p>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-pink-500/30 focus:ring-2 focus:ring-pink-500 outline-none mb-4 transition"
        />
        <div className="flex gap-4">
          <button className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:scale-105 transition transform">
            Change Password
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-semibold hover:scale-105 transition transform">
            Send Reset Email
          </button>
        </div>
      </Card>

      {/* MangaVerse Data */}
      <Card title="MangaVerse Data" icon="📚">
        <div className="flex gap-4">
          <button className="px-5 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg font-semibold hover:scale-105 transition transform">
            Clear Favorites
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition transform">
            Clear Reading History
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card title="Danger Zone" icon={<FaTrash />} danger>
        <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-700 rounded-lg font-bold hover:scale-110 transition transform">
          Delete Account
        </button>
      </Card>
    </div>
  );
}