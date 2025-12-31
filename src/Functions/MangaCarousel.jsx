// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HomePage = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(
          "https://api.mangadex.org/manga?limit=20&includes[]=cover_art"
        );
        const data = await res.json();

        // Map to simplified list
        const formatted = data.data.map((manga) => {
          const cover = manga.relationships.find(
            (rel) => rel.type === "cover_art"
          );
          return {
            id: manga.id,
            title: manga.attributes.title.en || "Untitled",
            cover: cover
              ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
              : "https://via.placeholder.com/150x200?text=No+Cover",
          };
        });

        setMangaList(formatted);
      } catch (error) {
        console.error("Error fetching manga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Discover Manga</h1>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-40 h-60 bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/70 rounded-full hover:bg-gray-700"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Scrollable Manga List */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {mangaList.map((manga) => (
              <Link
                to={`/manga/${manga.id}`}
                key={manga.id}
                className="flex-none w-40"
              >
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="w-full h-60 object-cover"
                  />
                  <div className="p-2 text-sm truncate">{manga.title}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/70 rounded-full hover:bg-gray-700"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;