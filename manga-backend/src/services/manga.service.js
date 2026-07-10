// src/services/manga.service.js
import { scraperFactory } from "../scrapers/factory.js";
import { getMangaMetadata } from "./anilist.service.js";
import { getCache, setCache } from "./cache.service.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

export const fetchChapters = async (mangaId, slug, title, refresh = false) => {
  const cacheKey = `chapters_${mangaId || slug}`;
  const cached = refresh ? null : getCache(cacheKey);
  if (cached) return cached;

  const queryTitle = title || slug;
  const dexEngine = scraperFactory.getEngine("mangadex");

  // Start with known title immediately to reduce cold-start latency
  let searchTitles = [queryTitle];

  logger.info(`🔍 Aggregating chapters for: ${queryTitle}`);

  // 1. Fetch Metadata in background to avoid blocking initial scraper starts
  const metadataTask = Promise.all([
    mangaId ? dexEngine.getMangaDetails(mangaId) : Promise.resolve([]),
    getMangaMetadata(queryTitle).catch(() => null)
  ]).then(([dexAlt, ani]) => {
    const fresh = [...new Set([queryTitle, ...dexAlt, ...(ani?.titles || [])])]
        .filter(Boolean)
        .slice(0, 3);
    searchTitles = fresh;
    return fresh;
  });

  // 2. Parallel Fetch Across Sources
  const engineTasks = scraperFactory.getAllEngines().map(async (engine) => {
    try {
      if (engine.name === "MangaDex") {
        return mangaId ? await engine.getChapters(mangaId) : [];
      }

      // First try with the best title we have immediately
      let results = await engine.getChapters(searchTitles);
      
      // If we got nothing and searchTitles was just the one, wait for metadata and try once more if needed
      if (results.length === 0 && searchTitles.length === 1) {
          const updatedTitles = await metadataTask;
          if (updatedTitles.length > 1) {
              results = await engine.getChapters(updatedTitles);
          }
      }
      
      return results;
    } catch (e) {
      logger.warn(`⚠️ Source ${engine.name} failed: ${e.message}`);
      return [];
    }
  });

  const allSourceResults = await Promise.allSettled(engineTasks);
  const allChaptersFlat = allSourceResults
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  // 3. Consolidated Chapter Map
  const chapterMap = new Map();
  allChaptersFlat.forEach(ch => {
    const num = ch.chapter;
    if (!chapterMap.has(num)) {
      chapterMap.set(num, {
        chapter: num,
        title: ch.title,
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

  // Sort mirrors by preference (Asura > Flame > MangaHub > MangaDex > Manganato)
  const sourcePreference = { asura: 1, flame: 2, mangahub: 3, mangadex: 4, manganato: 5 };
  const consolidated = Array.from(chapterMap.values())
    .map(ch => {
      ch.mirrors.sort((a, b) => (sourcePreference[a.source] || 99) - (sourcePreference[b.source] || 99));
      const best = ch.mirrors[0];
      return {
        ...ch,
        id: best.id,
        mainSource: best.source,
        url: best.url
      };
    })
    .sort((a, b) => b.chapter - a.chapter);

  if (consolidated.length > 0) {
    setCache(cacheKey, consolidated, config.cache.chapterTTL);
  }
  return consolidated;
};

export const fetchImages = async (source, payload, mangaTitle, mangaId) => {
  const cacheKey = `images_${source}_${payload.url || payload.chapterId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const engine = scraperFactory.getEngine(source);
    let images = [];

    if (source === "mangahub") {
      images = await engine.getImages(payload.slug, payload.chapterNumber);
    } else if (source === "mangadex") {
      images = await engine.getImages(payload.chapterId);
    } else {
      images = await engine.getImages(payload.url);
    }

    // Secondary fallback to Manganato if images fail
    if (images.length === 0 && mangaTitle && payload.chapterNumber) {
        logger.info(`🔄 Applying Manganato fallback for ${mangaTitle}`);
        const nato = scraperFactory.getEngine("manganato");
        images = await nato.getChapters(mangaTitle).then(async (chaps) => {
            const found = chaps.find(c => c.chapter === payload.chapterNumber);
            return found ? await nato.getImages(found.url) : [];
        }).catch(() => []);
    }

    if (images.length > 0) {
      setCache(cacheKey, images, config.cache.imageTTL);
    }
    return images;
  } catch (err) {
    logger.error(`❌ Image fetch failed: ${err.message}`);
    return [];
  }
};
