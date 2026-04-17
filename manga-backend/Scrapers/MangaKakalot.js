// Scrapers/MangaKakalot.js
// MangaKakalot is a mirror of Manganato — same HTML structure, plain axios works.
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://mangakakalot.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function getChaptersFromMangaKakalot(title) {
  if (!title) return [];

  try {
    const searchUrl = `${BASE_URL}/search/story/${slugify(title)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { "User-Agent": UA },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const firstResult = $(".story_item").first();
    const seriesUrl = firstResult.find("h3 a").attr("href");

    if (!seriesUrl) {
      console.warn(`⚠️ MangaKakalot: no series found for "${title}"`);
      return [];
    }

    const { data: seriesData } = await axios.get(seriesUrl, {
      headers: { "User-Agent": UA, Referer: BASE_URL },
      timeout: 10000,
    });

    const $s = cheerio.load(seriesData);
    const chapters = [];

    $s(".chapter-list .row a, .row a").each((_, el) => {
      const href = $s(el).attr("href");
      if (!href || !href.includes("chapter")) return;

      const match = href.match(/chapter-([\d.]+)/);
      if (match) {
        const num = parseFloat(match[1]);
        chapters.push({
          id: `mangakakalot-${href.split("/").pop()}`,
          chapter: num,
          title: $s(el).text().trim() || `Chapter ${num}`,
          source: "manganato", // Kakalot and Manganato share the same image CDN
          url: href,
        });
      }
    });

    const seen = new Set();
    const unique = chapters.filter((c) => {
      if (seen.has(c.chapter)) return false;
      seen.add(c.chapter);
      return true;
    });

    console.log(`✅ MangaKakalot: ${unique.length} chapters for "${title}"`);
    return unique.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error(`❌ MangaKakalot failed for "${title}":`, err.message);
    return [];
  }
}
