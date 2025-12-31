// src/Api/ChapterService.js
import { fetchChaptersForManga } from "./mangaApi";

export async function getChapters(mangaId, provider) {
  switch (provider) {
    case "MangaDex":
      return await fetchChaptersForManga(mangaId);
    case "ReaperScans":
      // TODO: implement Reaper scraper
      return { chapters: [] };
    case "AsuraScans":
      // TODO: implement Asura scraper
      return { chapters: [] };
    default:
      return { chapters: [] };
  }
}