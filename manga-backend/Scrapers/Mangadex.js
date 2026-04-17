// manga-backend/Scrapers/Mangadex.js
import axios from "axios";

const BASE_URL = "https://api.mangadex.org";

/**
 * Get all known title variants for a manga — used for cross-source searching
 */
export async function getMangaDetails(mangaId) {
  if (!mangaId) return [];
  try {
    const { data } = await axios.get(`${BASE_URL}/manga/${mangaId}`, {
      timeout: 8000,
    });
    const attr = data.data?.attributes;
    if (!attr) return [];
    const titles = [
      attr.title?.en,
      attr.title?.ja,
      ...(attr.altTitles || []).map((t) => Object.values(t)[0]),
    ].filter(Boolean);
    return [...new Set(titles)];
  } catch (err) {
    console.warn("getMangaDetails failed:", err.message);
    return [];
  }
}

export async function getChaptersFromMangadex(mangaId) {
  if (!mangaId) return [];

  try {
    const allChapters = [];
    let offset = 0;
    const limit = 100;
    let total = null;

    while (true) {
      const { data } = await axios.get("https://api.mangadex.org/chapter", {
        params: {
          manga: mangaId,
          "translatedLanguage[]": "en",   // Keep English filter but don't drop chapter 0
          "order[chapter]": "asc",
          limit,
          offset,
        },
        timeout: 10000,
      });

      if (!data?.data?.length) break;

      allChapters.push(...data.data);
      total = data.total;
      offset += limit;

      if (offset >= (total || 0)) break;
    }

    // Also try fetching without language filter to catch more chapters
    if (allChapters.length === 0) {
      offset = 0;
      while (true) {
        const { data } = await axios.get("https://api.mangadex.org/chapter", {
          params: {
            manga: mangaId,
            "order[chapter]": "asc",
            limit,
            offset,
          },
          timeout: 10000,
        });

        if (!data?.data?.length) break;
        allChapters.push(...data.data);
        total = data.total;
        offset += limit;
        if (offset >= (total || 0)) break;
      }
    }

    if (allChapters.length === 0) {
      console.warn(`⚠️ MangaDex: no chapters found for ${mangaId}`);
      return [];
    }

    // Normalize all chapters
    const normalized = allChapters
      .map((ch) => {
        const rawChapter = ch.attributes?.chapter;
        const num =
          rawChapter !== null && rawChapter !== undefined
            ? parseFloat(rawChapter)
            : null;

        return {
          id: ch.id,
          chapter: num ?? 0,        // treat null/missing as 0 (prologue)
          title: ch.attributes?.title || "",
          lang: ch.attributes?.translatedLanguage || "unknown",
          source: "mangadex",
          url: `https://mangadex.org/chapter/${ch.id}`,
        };
      })
      .filter((c) => !isNaN(c.chapter)); // remove completely broken entries

    // Deduplicate: per chapter number, prefer English, then keep earliest uploaded
    const byChapter = new Map();
    normalized.forEach((ch) => {
      const key = ch.chapter;
      if (!byChapter.has(key)) {
        byChapter.set(key, ch);
      } else {
        const existing = byChapter.get(key);
        // Prefer English over other languages
        if (existing.lang !== "en" && ch.lang === "en") {
          byChapter.set(key, ch);
        }
      }
    });

    const result = Array.from(byChapter.values()).sort(
      (a, b) => a.chapter - b.chapter
    );

    console.log(`✅ MangaDex: ${result.length} chapters for ${mangaId}`);
    return result;
  } catch (err) {
    console.error("❌ MangaDex fetch failed:", err.message);
    return [];
  }
}