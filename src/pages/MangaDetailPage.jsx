// src/pages/MangaDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMangaById } from "../Api/mangaApi";
import { useFollow } from "../Context/FollowContext";

const CHAPTERS_PER_PAGE = 50;

export default function MangaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [scanner, setScanner] = useState("all");
  const [loading, setLoading] = useState(true);
  const [animateFollow, setAnimateFollow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { toggleFollow, isFollowed } = useFollow();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data = await fetchMangaById(id);
        setManga(data);

        const slug = data.title
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") || "";
        const res = await fetch(`/api/chapters?mangaId=${id}&slug=${slug}&title=${encodeURIComponent(data.title)}`);

        if (!res.ok) {
          console.error(`❌ Backend returned ${res.status}`);
          setChapters([]);
          setFiltered([]);
          return;
        }

        const json = await res.json().catch(() => null);
        const chapterList = json?.data || json?.chapters || [];
        
        setChapters(chapterList);
        setFiltered(chapterList);
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
    let result = [];
    if (scanner === "all") {
      result = chapters;
    } else {
      result = chapters.filter((c) => c.source === scanner);
    }
    setFiltered(result);
    setCurrentPage(1); // Reset to page 1 on filter
  }, [scanner, chapters]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading Manga Details...</p>
        </div>
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

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / CHAPTERS_PER_PAGE);
  const startIndex = (currentPage - 1) * CHAPTERS_PER_PAGE;
  const pagedChapters = filtered.slice(startIndex, startIndex + CHAPTERS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 relative pb-20">
      {/* 🎬 Banner */}
      <div
        className="relative h-[550px] bg-[#111827] overflow-hidden"
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
            <span className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full border border-pink-500/30">
              <span className="font-semibold text-gray-100">Status:</span>{" "}
              {manga.status || "Unknown"}
            </span>
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
              <span className="font-semibold text-gray-100">Year:</span>{" "}
              {manga.year || "N/A"}
            </span>
          </div>

          <p className="text-gray-300 max-w-3xl text-sm leading-relaxed mb-6 line-clamp-3 md:line-clamp-none">
            {manga.description || "No description available."}
          </p>

          <div className="flex gap-4">
            <button
               className="bg-gradient-to-r from-pink-600 to-red-500 hover:opacity-90 text-white font-bold px-8 py-3 rounded-lg shadow-xl shadow-pink-900/20 transition transform hover:scale-105 active:scale-95"
               onClick={() => {
                 if (chapters.length > 0) {
                    // Find first chapter (lowest number)
                    const sortedAsc = [...chapters].sort((a,b) => a.chapter - b.chapter);
                    const firstChap = sortedAsc[0];
                    navigate("/read", {
                      state: {
                        chapterId: firstChap.id,
                        source: firstChap.source,
                        url: firstChap.url,
                        mangaTitle: manga.title,
                        chapterNum: firstChap.chapter
                      }
                    });
                 }
               }}
            >
              Read First Chapter
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

      {/* 📘 Info Grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#161d2b] p-8 rounded-2xl border border-white/5 shadow-2xl">
              <div>
                  <h3 className="text-pink-500 font-bold uppercase text-xs tracking-widest mb-2">Details</h3>
                  <div className="space-y-3">
                      <p><span className="text-gray-400 font-medium">Author:</span> <span className="text-white">{manga.authors?.join(", ") || "Unknown"}</span></p>
                      <p><span className="text-gray-400 font-medium">Artist:</span> <span className="text-white">{manga.artists?.join(", ") || "Unknown"}</span></p>
                  </div>
              </div>
              <div>
                  <h3 className="text-pink-500 font-bold uppercase text-xs tracking-widest mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                      {manga.genres?.map(g => (
                          <span key={g} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs hover:bg-white/10 transition">{g}</span>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* 🔄 Scanner & Sort Toggle */}
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Chapters</h2>
            <span className="px-2 py-0.5 bg-[#161d2b] rounded text-xs text-gray-400 border border-white/5">{filtered.length} Total</span>
        </div>
        
        <div className="flex gap-2 bg-[#1a2235] p-1.5 rounded-xl border border-white/10 shadow-lg overflow-x-auto max-w-full">
          {availableScanners.map((src) => (
            <button
              key={src}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition text-sm whitespace-nowrap ${
                scanner === src
                  ? "bg-gradient-to-b from-pink-500 to-pink-700 text-white shadow-md shadow-pink-900/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setScanner(src)}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* 📖 Chapters List */}
      <div className="max-w-5xl mx-auto px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#161d2b] rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500">No chapters found from this scanner.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {pagedChapters.map((ch) => (
                <div
                  key={`${ch.source}-${ch.id}`}
                  onClick={() => {
                    navigate("/read", {
                      state: {
                        chapterId: ch.id,
                        source: ch.source,
                        url: ch.url,
                        mangaTitle: manga.title,
                        chapterNum: ch.chapter,
                        mangaId: id,
                        mirrors: ch.mirrors || []
                      },
                    });
                  }}
                  className="group p-4 flex justify-between items-center bg-[#161d2b] hover:bg-[#1a2336] border border-white/5 hover:border-pink-500/30 transition-all rounded-xl cursor-pointer shadow-sm hover:shadow-pink-900/10"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-bold group-hover:text-pink-400 transition truncate">
                      Chapter {ch.chapter}
                    </span>
                    <span className="text-xs text-gray-500 truncate italic">
                      {ch.title || "No Title"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-1 bg-black/40 text-gray-400 rounded-md uppercase font-bold tracking-tighter border border-white/5">
                        {ch.source}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* 🔢 Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 md:gap-4 mt-8 bg-[#161d2b] p-4 rounded-2xl border border-white/5 shadow-inner">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-pink-600/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all group"
                  aria-label="Previous Page"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                </button>
                
                <div className="flex gap-2 overflow-x-auto max-w-[150px] sm:max-w-[300px] no-scrollbar py-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 600, behavior: 'smooth' }); // Scroll back to chapter list start
                          }}
                          className={`w-10 h-10 flex-shrink-0 rounded-xl font-bold transition-all transform active:scale-90 ${
                            currentPage === p 
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-900/40" 
                            : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {p}
                        </button>
                    ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-pink-600/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all group"
                  aria-label="Next Page"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                </button>

                <div className="hidden sm:block ml-4 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}