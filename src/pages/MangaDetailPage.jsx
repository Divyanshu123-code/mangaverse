// src/pages/MangaDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMangaById } from "../Api/mangaApi";
import { useFollow } from "../Context/FollowContext";

export default function MangaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [scanner, setScanner] = useState("all");
  const [loading, setLoading] = useState(true);
  const [animateFollow, setAnimateFollow] = useState(false);

  const { toggleFollow, isFollowed } = useFollow();

 useEffect(() => {
  async function load() {
    try {
      setLoading(true);

      const data = await fetchMangaById(id);
      setManga(data);

      const slug = data.title?.toLowerCase().replace(/\s+/g, "-") || "";
      const res = await fetch(`/api/chapters?mangaId=${id}&slug=${slug}`);

      if (!res.ok) {
        console.error(`❌ Backend returned ${res.status}`);
        setChapters([]);
        setFiltered([]);
        return;
      }

      const json = await res.json().catch(() => null);
      if (!json || !json.chapters) {
        console.warn("⚠️ No JSON data or malformed response from backend");
        setChapters([]);
        setFiltered([]);
        return;
      }

      setChapters(json.chapters);
      setFiltered(json.chapters);
    } catch (err) {
      console.error("❌ Error loading manga:", err);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [id]);

  // ✅ Filter chapters instantly when scanner changes
  useEffect(() => {
    if (scanner === "all") {
      setFiltered(chapters);
    } else {
      setFiltered(chapters.filter((c) => c.source === scanner));
    }
  }, [scanner, chapters]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-gray-400">
        Loading...
      </div>
    );

  if (!manga)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-red-500">
        Manga not found
      </div>
    );

  const followed = isFollowed(manga.id);

  const handleFollow = () => {
    toggleFollow(manga);
    setAnimateFollow(true);
    setTimeout(() => setAnimateFollow(false), 700);
  };

  const availableScanners = ["all", ...new Set(chapters.map((ch) => ch.source))];

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 relative">
      {/* 🎬 Banner */}
      <div
        className="relative h-[500px] bg-[#111827] overflow-hidden"
        style={{
          backgroundImage: manga.cover
            ? `url(${manga.cover})`
            : "url(https://placehold.co/1920x1080/0b1220/FFFFFF?text=No+Cover)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 🔙 Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full p-2.5 transition"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-black/70 to-transparent"></div>

        {/* Text */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 h-full flex flex-col justify-end">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            {manga.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
            <span>
              <span className="font-semibold text-gray-100">Status:</span>{" "}
              <span
                className={
                  manga.status === "ongoing"
                    ? "text-pink-400"
                    : "text-green-400"
                }
              >
                {manga.status || "Unknown"}
              </span>
            </span>
            <span>
              <span className="font-semibold text-gray-100">Year:</span>{" "}
              {manga.year || "N/A"}
            </span>
          </div>

          <p className="text-gray-300 max-w-3xl text-sm leading-relaxed mb-6">
            {manga.description || "No description available."}
          </p>

          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-pink-600 to-red-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition">
              Read Now
            </button>

            {/* ✅ Follow toggle */}
            <button
              onClick={handleFollow}
              className={`relative px-6 py-3 rounded-lg font-semibold shadow-md transition border backdrop-blur-md 
                ${
                  followed
                    ? "bg-pink-700 border-pink-500 text-white hover:bg-pink-600"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }
                ${animateFollow ? "animate-followPulse" : ""}`}
            >
              {followed ? "✔ Following" : "+ Follow"}
              {animateFollow && (
                <span className="absolute inset-0 rounded-lg bg-pink-500/30 blur-md animate-pulseGlow"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📘 Info */}
      <div className="max-w-5xl mx-auto px-6 py-8 border-b border-white/10">
        <p className="mb-2">
          <span className="font-semibold text-gray-100">Author(s):</span>{" "}
          {Array.isArray(manga.authors) && manga.authors.length > 0
            ? manga.authors.join(", ")
            : "Unknown"}
        </p>
        <p className="mb-2">
          <span className="font-semibold text-gray-100">Artist(s):</span>{" "}
          {Array.isArray(manga.artists) && manga.artists.length > 0
            ? manga.artists.join(", ")
            : "Unknown"}
        </p>
        <p>
          <span className="font-semibold text-gray-100">Genres:</span>{" "}
          {Array.isArray(manga.genres) && manga.genres.length > 0
            ? manga.genres.join(", ")
            : "N/A"}
        </p>
      </div>

      {/* 🔄 Scanner Toggle */}
      <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Chapters</h2>
        <div className="flex gap-2 bg-[#1a2235] p-1 rounded-lg border border-white/10">
          {availableScanners.map((src) => (
            <button
              key={src}
              className={`px-4 py-1.5 rounded-md font-semibold capitalize transition ${
                scanner === src
                  ? "bg-pink-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setScanner(src)}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* 📖 Chapters */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center">No chapters available.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {filtered.map((ch) => (
              <li
                key={`${ch.source}-${ch.id}`}
                className="p-4 flex justify-between items-center hover:bg-[#1a2235] transition rounded-md"
              >
                <span className="text-gray-300 truncate">
                  Chapter {ch.chapter} {ch.title && `- ${ch.title}`}
                  <span className="text-xs text-gray-500 ml-2">
                    [{ch.source}]
                  </span>
                </span>
                <button className="text-pink-500 hover:text-pink-400 font-semibold">
                  Read
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}