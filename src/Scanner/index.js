import { getChaptersFromMangadex } from "../../manga-backend/Scrapers/Mangadex.js";
import { getChaptersFromAsura } from "../../manga-backend/Scrapers/Asura.js";
import { getChaptersFromFlame } from "../../manga-backend/Scrapers/Flame.js";

export async function getAllChapters(mangaId, mangaSlug) {
  const results = await Promise.allSettled([
    getChaptersFromMangadex(mangaId),
    getChaptersFromAsura(mangaSlug),
    getChaptersFromFlame(mangaSlug),
  ]);

  const all = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const cleaned = all
    .filter((c) => typeof c.chapter === "number" && !isNaN(c.chapter))
    .sort((a, b) => a.chapter - b.chapter);

  return cleaned.filter(
    (c, i, arr) =>
      i === arr.findIndex(
        (x) => x.chapter === c.chapter && x.source === c.source
      )
  );
}