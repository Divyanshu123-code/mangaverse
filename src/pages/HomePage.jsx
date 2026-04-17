import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ToggleCategory from "../components/ToggleCategory";
import MangaRow from "../Functions/MangaRow";
import ContinueReading from "../components/ContinueReading";
import { useFollow } from "../Context/FollowContext"; // ✅ import context

import {
  fetchTopRated,
  fetchTrending,
  fetchRecentlyUpdated,
} from "../Api/mangaApi";

export default function HomePage() {
  const [cat, setCat] = useState("manga");
  const lang = cat === "manga" ? "ja" : cat === "manhwa" ? "ko" : "zh";

  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const navigate = useNavigate();
  const { followed } = useFollow(); // ✅ get followed list

  // Fetch all data
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoadingTop(true);
      setLoadingTrend(true);
      setLoadingRecent(true);

      const [topResult, trendResult, recentResult] = await Promise.allSettled([
        fetchTopRated(lang),
        fetchTrending(lang),
        fetchRecentlyUpdated(lang),
      ]);

      if (cancelled) return;

      if (topResult.status === "fulfilled") setTopRated(topResult.value);
      else console.error("Top rated failed:", topResult.reason);
      setLoadingTop(false);

      if (trendResult.status === "fulfilled") setTrending(trendResult.value);
      else console.error("Trending failed:", trendResult.reason);
      setLoadingTrend(false);

      if (recentResult.status === "fulfilled") setRecentlyUpdated(recentResult.value);
      else console.error("Recently updated failed:", recentResult.reason);
      setLoadingRecent(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, [lang]);

  // Auto-rotate hero every 8s
  useEffect(() => {
    if (!trending.length) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trending.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [trending]);

  const hero = trending[heroIndex] || topRated[0] || null;

  const handleCardClick = (manga) => {
    navigate(`/manga/${manga.id}`, { state: { manga } });
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white overflow-x-hidden">
      {/* Frosted Header */}
      <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <Header />
      </div>

      <main className="pt-16">
        {/* 🎬 Hero Section */}
        <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
          <AnimatePresence mode="wait">
            {hero && (
              <motion.img
                key={hero.id}
                src={hero.cover}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/70 to-transparent" />

          {/* Text & Buttons */}
          {hero && (
            <div className="absolute bottom-20 left-8 md:left-16 z-20 max-w-2xl space-y-4">
              <motion.h1
                key={hero.title}
                className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {hero.title}
              </motion.h1>

              <motion.div
                className="flex gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition"
                  onClick={() => handleCardClick(hero)}
                >
                  Read Now
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition">
                  More Info
                </button>
              </motion.div>
            </div>
          )}

          {/* Indicator Dots */}
          {trending.length > 1 && (
            <div className="absolute bottom-6 right-10 flex gap-2 z-20">
              {trending.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === heroIndex ? "bg-pink-500 scale-110" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Continue Reading */}
        <ContinueReading />

        {/* ✅ Following Row */}
        {followed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-6 md:px-10 mb-8"
          >
            <MangaRow
              title="Library"
              items={followed}
              loading={false}
              onCardClick={handleCardClick}
            />
          </motion.div>
        )}

        {/* Category Toggle */}
        <div className="mb-4 px-6 md:px-10">
          <ToggleCategory value={cat} onChange={setCat} />
        </div>

        {/* Manga Rows */}
        <div className="space-y-8 px-6 md:px-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MangaRow
              title="Top Rated"
              items={topRated}
              loading={loadingTop}
              onCardClick={handleCardClick}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MangaRow
              title="Trending"
              items={trending}
              loading={loadingTrend}
              onCardClick={handleCardClick}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <MangaRow
              title="Recently Updated"
              items={recentlyUpdated}
              loading={loadingRecent}
              onCardClick={handleCardClick}
            />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}