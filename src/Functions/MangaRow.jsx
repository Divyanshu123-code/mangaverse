// src/Functions/MangaRow.jsx
import React, { useRef } from "react";
import MangaCard from "../components/MangaCard";
import SkeletonCard from "../components/SkeletonCard";

export default function MangaRow({ title, items = [], loading = false, onCardClick }) {
  const scroller = useRef(null);

  const scrollBy = (dx) => {
    if (scroller.current) {
      scroller.current.scrollBy({ left: dx, behavior: "smooth" });
    }
  };

  return (
    <section className="relative group">
      <div className="px-4 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
          {title}
        </h2>
      </div>

      <button
        onClick={() => scrollBy(-600)}
        className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
        aria-label="Scroll left"
      >
        ‹
      </button>

      <button
        onClick={() => scrollBy(600)}
        className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
        aria-label="Scroll right"
      >
        ›
      </button>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0b1220] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0b1220] to-transparent" />

      <div
        ref={scroller}
        className="no-scrollbar relative px-4 pb-6 overflow-x-auto scroll-smooth"
      >
        <div className="flex gap-3">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((m) => <MangaCard key={m.id} manga={m} onCardClick={onCardClick} />)}
        </div>
      </div>
    </section>
  );
}