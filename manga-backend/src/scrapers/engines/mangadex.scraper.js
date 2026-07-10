// src/scrapers/engines/mangadex.scraper.js
import axios from "axios";
import { BaseScraper } from "../base.scraper.js";

export class MangadexScraper extends BaseScraper {
  constructor() {
    super("MangaDex", "https://api.mangadex.org");
  }

  async getMangaDetails(mangaId) {
    if (!mangaId) return [];
    try {
      const { data } = await axios.get(`${this.baseUrl}/manga/${mangaId}`, { timeout: 8000 });
      const attr = data.data?.attributes;
      if (!attr) return [];
      
      const titles = [
        attr.title?.en,
        ...(attr.altTitles || [])
          .map(t => {
            const lang = Object.keys(t)[0];
            const val = Object.values(t)[0];
            return (lang === "en" || !lang) ? val : null;
          })
          .filter(Boolean)
      ].filter(Boolean);
      
      return [...new Set(titles)];
    } catch (err) {
      return [];
    }
  }

  async getChapters(mangaId) {
    if (!mangaId) return [];
    try {
      const allChapters = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const { data } = await axios.get(`${this.baseUrl}/chapter`, {
          params: {
            manga: mangaId,
            "translatedLanguage[]": ["en"],
            "order[chapter]": "asc",
            limit,
            offset,
          },
          timeout: 10000,
        });

        if (!data?.data?.length) {
          hasMore = false;
          continue;
        }

        allChapters.push(...data.data);
        offset += limit;
        hasMore = offset < data.total;
      }

      return allChapters
        .map(ch => {
          const rawChapter = ch.attributes?.chapter;
          const num = rawChapter !== null ? parseFloat(rawChapter) : 0;

          return {
            id: ch.id,
            chapter: num,
            title: ch.attributes?.title || "",
            lang: ch.attributes?.translatedLanguage || "en",
            source: "mangadex",
            url: `https://mangadex.org/chapter/${ch.id}`,
          };
        })
        .filter(c => c.lang === "en" && !isNaN(c.chapter))
        .sort((a, b) => a.chapter - b.chapter);
    } catch (err) {
      return [];
    }
  }

  async getImages(chapterId) {
    try {
      const { data } = await axios.get(`${this.baseUrl}/at-home/server/${chapterId}`, { timeout: 10000 });
      const { baseUrl, chapter } = data;
      const { hash, data: images } = chapter;
      return images.map(img => `${baseUrl}/data/${hash}/${img}`);
    } catch (err) {
      return [];
    }
  }
}
