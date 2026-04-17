// manga-backend/Scrapers/index.js
import { getChaptersFromMangadex, getMangaDetails } from "./Mangadex.js";
import { getChaptersFromAsura } from "./Asura.js";
import { getChaptersFromFlame } from "./Flame.js";
import { getChaptersFromManganato } from "./Manganato.js";
import { getChaptersFromMangaKakalot } from "./MangaKakalot.js";
import { getChaptersFromMangaHub } from "./MangaHub.js";
import { getMangaMetadata } from "../Services/aniListService.js";

/**
 * Fetch chapters from all sources in parallel.
 * This is the core logic to solve the "missing chapters" issue.
 */
export async function getAllChaptersScraped(mangaId, mangaSlug, mangaTitle) {
  const queryTitle = mangaTitle || mangaSlug;
  console.log(`🔍 Orchestrating chapter fetch for: ${queryTitle}`);

  // 1. Get Alt Titles from both MangaDex AND AniList for maximum coverage
  const dexDetail = mangaId ? await getMangaDetails(mangaId) : [];
  const aniDetail = await getMangaMetadata(queryTitle);
  const aniTitles = aniDetail?.titles || [];
  
  const searchTitles = [...new Set([queryTitle, ...dexDetail, ...aniTitles])].filter(Boolean).slice(0, 8);
  console.log(`📡 Searching mirrors with ${searchTitles.length} title variants...`);
  
  // 2. Multi-Source Fetch with Alt-Title fallback
  const results = await Promise.allSettled([
    getChaptersFromMangadex(mangaId),
    (async () => {
        for (const t of searchTitles) {
            const res = await getChaptersFromAsura(t);
            if (res.length > 0) return res;
        }
        return [];
    })(),
    (async () => {
        for (const t of searchTitles) {
            const res = await getChaptersFromFlame(t);
            if (res.length > 0) return res;
        }
        return [];
    })(),
    (async () => {
        for (const t of searchTitles) {
            const res = await getChaptersFromManganato(t);
            if (res.length > 0) return res;
            const res2 = await getChaptersFromMangaKakalot(t);
            if (res2.length > 0) return res2;
        }
        return [];
    })(),
    (async () => {
        for (const t of searchTitles) {
            const res = await getChaptersFromMangaHub(t);
            if (res.length > 0) return res;
        }
        return [];
    })(),
  ]);

  const sourceNames = ["mangadex", "asura", "flame", "manganato", "mangahub"];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`✅ ${sourceNames[i]}: ${r.value.length} chapters found`);
    } else {
      console.warn(`⚠️ ${sourceNames[i]} failed:`, r.reason?.message);
    }
  });

  const all = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const valid = all.filter(
    (c) => typeof c.chapter === "number" && !isNaN(c.chapter)
  );

  // Support for Multiple Mirrors per chapter
  const chapterMap = new Map();
  
  valid.forEach((ch) => {
    const num = ch.chapter;
    if (!chapterMap.has(num)) {
      chapterMap.set(num, {
        chapter: num,
        title: ch.title,
        mainSource: ch.source, // Keep original for default
        mirrors: []
      });
    }
    
    chapterMap.get(num).mirrors.push({
      id: ch.id,
      source: ch.source,
      url: ch.url,
      title: ch.title
    });
  });

  const consolidated = Array.from(chapterMap.values()).sort((a, b) => b.chapter - a.chapter);
  
  // Tag each chapter's mirrors with preference
  const sourcePreference = { asura: 1, flame: 1, mangahub: 2, mangadex: 3, manganato: 4 };
  consolidated.forEach(ch => {
    ch.mirrors.sort((a, b) => (sourcePreference[a.source] || 99) - (sourcePreference[b.source] || 99));
    // Update main info from the best mirror
    const best = ch.mirrors[0];
    ch.id = best.id;
    ch.source = best.source;
    ch.url = best.url;
  });

  console.log(`🏁 Consolidation finished: Found ${consolidated.length} unique chapters with mirrors.`);
  return consolidated;
}