// src/manga-backend/Scrapers/Mangadex.js
import axios from "axios";

export async function getChaptersFromMangadex(mangaId) {
  if (!mangaId) return [];

  try {
    const allChapters = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const { data } = await axios.get("https://api.mangadex.org/chapter", {
        params: {
          manga: mangaId,
          translatedLanguage: ["en"],
          order: { chapter: "asc" },
          limit,
          offset,
        },
      });

      if (data?.data?.length) {
        allChapters.push(...data.data);
        offset += limit;
      } else break;

      if (offset >= (data.total || 0)) break;
    }

    // 🧹 Clean + normalize
    return allChapters
      .map((ch) => ({
        id: ch.id,
        chapter:
          parseFloat(ch.attributes?.chapter) ||
          parseFloat(ch.attributes?.title?.match(/\d+(\.\d+)?/)?.[0]) ||
          0,
        title: ch.attributes?.title || "",
        source: "mangadex",
        url: `https://mangadex.org/chapter/${ch.id}`,
      }))
      .filter((c) => c.chapter > 0)
      .sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error("❌ MangaDex fetch failed:", err.message);
    return [];
  }
}