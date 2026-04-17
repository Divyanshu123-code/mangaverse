// manga-backend/Scrapers/GetImages.js
import { getImagesFromAsura } from "./Asura.js";
import { getImagesFromFlame } from "./Flame.js";
import { getImagesFromMangaHub } from "./MangaHub.js";
import { getChaptersFromManganato, getImagesFromManganato } from "./Manganato.js";
import { getMangaDetails } from "./Mangadex.js";
import axios from "axios";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36";

/**
 * MangaDex Images — direct CDN API, no scraping needed
 */
export async function getImagesFromMangadex(chapterId) {
  try {
    const { data } = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`,
      { timeout: 10000 }
    );
    const { baseUrl, chapter } = data;
    const { hash, data: images } = chapter;
    return images.map((img) => `${baseUrl}/data/${hash}/${img}`);
  } catch (err) {
    console.error("MangaDex image fetch failed:", err.message);
    return [];
  }
}

/**
 * Fallback: search Manganato using alt titles
 */
async function fallbackToManganato(mangaTitle, chapterNumber, mangaId) {
  console.log(`🔄 Manganato fallback: ${mangaTitle} Ch.${chapterNumber}`);
  const altTitles = mangaId ? await getMangaDetails(mangaId) : [];
  const searchTitles = [...new Set([mangaTitle, ...altTitles.slice(0, 3)])].filter(Boolean);

  for (const title of searchTitles) {
    try {
      const chapters = await getChaptersFromManganato(title);
      const found = chapters.find((c) => c.chapter === chapterNumber);
      if (found?.url) {
        const imgs = await getImagesFromManganato(found.url);
        if (imgs.length > 0) return imgs;
      }
    } catch (e) {
      continue;
    }
  }
  return [];
}

/**
 * Main entry point — routes to correct scraper by source
 */
export async function getImagesWithFallback(source, payload, mangaTitle, mangaId) {
  let images = [];

  try {
    if (source === "mangadex") {
      images = await getImagesFromMangadex(payload.chapterId);
    } else if (source === "asura") {
      images = await getImagesFromAsura(payload.url);
    } else if (source === "flame") {
      images = await getImagesFromFlame(payload.url);
    } else if (source === "mangahub") {
      images = await getImagesFromMangaHub(payload.slug, payload.chapterNumber);
    } else if (source === "manganato") {
      images = await getImagesFromManganato(payload.url);
    }

    // If source failed, try Manganato as fallback
    if (images.length === 0 && mangaTitle && payload.chapterNumber) {
      images = await fallbackToManganato(mangaTitle, payload.chapterNumber, mangaId);
    }

    return images;
  } catch (e) {
    console.error("getImagesWithFallback error:", e.message);
    return [];
  }
}
