// src/components/ToggleCategory.jsx
import React from "react";

export default function ToggleCategory({ value, onChange }) {
  const categories = [
    { id: "manga", label: "Manga" },
    { id: "manhwa", label: "Manhwa / Manhua" },
  ];

  return (
    <div className="flex justify-center md:justify-start mt-4">
      <div className="bg-[#131a2a] rounded-full p-1 flex gap-2 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
        {categories.map((cat) => {
          const active = value === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`relative px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 
              ${
                active
                  ? "text-white bg-gradient-to-r from-pink-600 to-red-500 shadow-[0_0_10px_rgba(236,72,153,0.6)] scale-105"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
              {active && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600/20 to-red-500/20 blur-md -z-10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}