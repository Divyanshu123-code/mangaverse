// services/mangaService.js
import { getAllChaptersScraped } from "../Scrapers/index.js";
import { getImagesWithFallback } from "../Scrapers/GetImages.js";
import { getCache, setCache } from "./cacheService.js";

export const fetchChapters = async (mangaId, slug, title) => {
  const cacheKey = `chapters_${mangaId || slug}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const chapters = await getAllChaptersScraped(mangaId, slug, title);
  if (chapters && chapters.length > 0) {
    setCache(cacheKey, chapters, 1800000); // 30 mins
  }
  return chapters;
};

export const fetchImages = async (source, payload, mangaTitle, mangaId) => {
  const cacheKey = `images_${source}_${payload.url || payload.chapterId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const images = await getImagesWithFallback(source, payload, mangaTitle, mangaId);
  if (images && images.length > 0) {
    setCache(cacheKey, images, 86400000); // 24 hours
  }
  return images;
};
