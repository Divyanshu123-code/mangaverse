import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, RefreshCcw, Layers } from "lucide-react";

async function fetchMangadexImages(chapterId) {
  const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`);
  const data = await res.json();
  const { baseUrl, chapter } = data;
  const { hash, data: pages } = chapter;
  return pages.map((img) => `${baseUrl}/data/${hash}/${img}`);
}

export default function ReaderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    chapterId: initialId, 
    source: initialSource, 
    url: initialUrl, 
    mangaTitle, 
    chapterNum, 
    mangaId,
    mirrors = [] 
  } = location.state || {};

  const [currentMirror, setCurrentMirror] = useState({ id: initialId, source: initialSource, url: initialUrl });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentMirror.source) {
      setError("No chapter source provided.");
      setLoading(false);
      return;
    }

    async function loadImages() {
      try {
        setLoading(true);
        setError("");

        let imageList = [];

        if (currentMirror.source === "mangadex") {
          if (!currentMirror.id) throw new Error("Missing chapter ID for MangaDex.");
          imageList = await fetchMangadexImages(currentMirror.id);
        } else {
          const query = new URLSearchParams({ source: currentMirror.source });
          if (currentMirror.id) query.append("chapterId", currentMirror.id);
          if (currentMirror.url) query.append("url", currentMirror.url);
          if (mangaTitle) query.append("mangaTitle", mangaTitle);
          if (chapterNum) query.append("chapterNumber", chapterNum);
          if (mangaId) query.append("mangaId", mangaId);

          const res = await fetch(`/api/v1/chapter-images?${query.toString()}`);
          const json = await res.json();
          
          if (!res.ok || json.status === "error") {
            throw new Error(json.message || "Failed to load chapter images.");
          }
          
          imageList = json.data || [];
        }

        if (imageList.length === 0) {
          setError("No images found on this mirror. Please try switching to a different mirror.");
        } else {
          setImages(imageList);
        }
      } catch (err) {
        console.error("❌ Reader error:", err);
        setError(err.message || "Failed to load images from this source.");
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [currentMirror, mangaId]);

  const handleMirrorSwitch = (mirror) => {
    if (mirror.source === currentMirror.source && mirror.id === currentMirror.id) return;
    setCurrentMirror(mirror);
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#050914] text-gray-400 gap-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium animate-pulse">Scanning Mirror: {currentMirror.source}...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-gray-200 selection:bg-pink-500/30">
      {/* Premium Multi-Mirror Header */}
      <div className="sticky top-0 z-50 bg-[#0b1220]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
            <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
            <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
            </button>
        </div>

        <div className="text-center flex-1 px-4 overflow-hidden">
          <p className="text-sm font-bold text-white truncate max-w-[250px] mx-auto">
            {mangaTitle || "Manga"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-[10px] px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full font-black uppercase tracking-tighter">
              CH {chapterNum}
            </span>
          </div>
        </div>

        {/* Mirror Selector */}
        <div className="flex items-center gap-2">
            {mirrors.length > 1 && (
                <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition">
                        <Layers size={14} className="text-pink-400" />
                        <span className="text-xs font-bold uppercase tracking-wide">{currentMirror.source}</span>
                    </button>
                    {/* Mirror Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#161d2b] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[60]">
                        <p className="text-[10px] text-gray-500 font-bold uppercase p-2 border-b border-white/5 mb-1">Available Mirrors</p>
                        {mirrors.map((m, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleMirrorSwitch(m)}
                                className={`w-full text-left p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${m.source === currentMirror.source ? 'bg-pink-500/20 text-pink-400 px-3' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                {m.source}
                                {m.source === currentMirror.source && <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Reader Error Overlay */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 max-w-md text-center">
                <p className="text-red-400 font-bold mb-2">Mirror Error</p>
                <p className="text-sm text-gray-500 mb-6">{error}</p>
                <div className="flex flex-col gap-2">
                    {mirrors.filter(m => m.source !== currentMirror.source).slice(0, 1).map((m, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleMirrorSwitch(m)}
                            className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition"
                        >
                            <RefreshCcw size={16} />
                            Try Mirror: {m.source}
                        </button>
                    ))}
                    <button onClick={() => navigate(-1)} className="text-xs text-gray-500 hover:text-white transition py-2">Go back to chapter list</button>
                </div>
            </div>
        </div>
      )}

      {/* Reader ViewPORT */}
      {!error && (
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-2">
            {images.map((imgSrc, index) => {
              const proxiedSrc = currentMirror.source === "mangadex" 
                ? imgSrc 
                : `/api/v1/proxy?url=${encodeURIComponent(imgSrc)}&source=${currentMirror.source}`;

              return (
                <div key={`${currentMirror.source}-${index}`} className="w-full relative group">
                    <img
                        src={proxiedSrc}
                        alt={`Page ${index + 1}`}
                        loading="lazy"
                        className="w-full h-auto object-contain block select-none"
                        onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/800x1200/0b1220/555?text=Mirror+Error+on+Page+${index+1}`;
                        }}
                    />
                </div>
              );
            })}
          </div>
      )}

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-5 bg-white text-black rounded-2xl shadow-2xl hover:bg-pink-500 hover:text-white transition-all transform active:scale-95 group"
        title="Scroll to Top"
      >
        <ArrowUp size={28} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
}
