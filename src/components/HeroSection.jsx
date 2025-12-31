import React from "react";

export default function HeroSection({ item }) {
  if (!item) return null;

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: "calc(var(--vh, 1vh) * 100)", // fixes viewport issues
      }}
    >
      {/* Background Blur Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl brightness-75"
        style={{
          backgroundImage: `url(${item.cover})`,
        }}
      ></div>

      {/* Main Poster Image (non-cropped, centered) */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col items-center justify-center text-center px-6 md:px-12">
        <img
          src={item.cover}
          alt={item.title}
          className="max-h-[70vh] object-contain rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-105"
        />

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-90 pointer-events-none"></div>

        {/* Text content */}
        <div className="relative z-20 mt-6">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {item.title}
          </h1>
          <div className="mt-4 flex gap-4 justify-center">
            <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition">
              Read Now
            </button>
            <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}