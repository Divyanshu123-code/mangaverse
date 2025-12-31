// src/components/MangaCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MangaCard({ manga }) {
  const navigate = useNavigate();

  if (!manga) {
    return (
      <div className="bg-gray-900 p-2 rounded-lg text-gray-400 text-center w-[160px] h-[260px] flex items-center justify-center">
        Invalid Manga
      </div>
    );
  }

  const { id, cover, title, status, year } = manga;

  return (
    <div
      onClick={() => id && navigate(`/manga/${id}`)}
      className="group bg-[#10141f] p-2 rounded-lg w-[160px] cursor-pointer 
                 transform transition duration-300 hover:scale-105 
                 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]"
    >
      {/* Image Container */}
      <div className="relative w-[160px] h-[240px] overflow-hidden rounded-md">
        <img
          src={cover || 'https://via.placeholder.com/160x240?text=No+Cover'}
          alt={title || 'Untitled'}
          className="absolute inset-0 w-full h-full object-cover rounded-md transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay (appears smoothly on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Year Tag */}
        {year && (
          <div className="absolute top-2 left-2 bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
            {year}
          </div>
        )}

        {/* Status Tag */}
        {status && (
          <div
            className={`absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-md ${
              status.toLowerCase() === 'ongoing'
                ? 'bg-green-600/80'
                : status.toLowerCase() === 'complete'
                ? 'bg-blue-600/80'
                : 'bg-gray-600/80'
            }`}
          >
            {status}
          </div>
        )}

        {/* Hover Info */}
        <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-xs font-semibold text-center bg-black/50 rounded-md py-1 px-2 backdrop-blur-sm">
            {title?.length > 25 ? title.slice(0, 25) + "..." : title || 'Untitled'}
          </p>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium truncate mt-2 w-[160px] text-gray-200 group-hover:text-pink-400 transition-colors duration-300">
        {title || "Untitled"}
      </h3>
    </div>
  );
}