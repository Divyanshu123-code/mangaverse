// src/components/ReadingHistory.jsx
import React, { useEffect, useState } from "react";

const ReadingHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch reading history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem("readingHistory") || "[]");
    // Sort by most recently read
    savedHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setHistory(savedHistory);
  }, []);

  if (history.length === 0) return null; // hide section if empty

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-2 text-white">Continue Reading</h2>
      <div className="flex overflow-x-auto gap-4">
        {history.map((manga) => (
          <div
            key={manga.mangaId}
            className="w-40 flex-shrink-0 bg-gray-800 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.location.href = `/manga/${manga.mangaId}/chapter/${manga.lastChapterRead}`} // redirect to last chapter
          >
            <img
              src={manga.coverUrl || "https://via.placeholder.com/150x220?text=No+Cover"}
              alt={manga.title}
              className="rounded-lg w-full h-56 object-cover"
            />
            <h3 className="mt-2 font-semibold text-white truncate">{manga.title}</h3>
            <p className="text-sm text-gray-400">Last read: Chapter {manga.lastChapterRead}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReadingHistory;