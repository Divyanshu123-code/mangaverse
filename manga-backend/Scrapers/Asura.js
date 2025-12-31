// 📂 manga-backend/Scrapers/Asura.js
import cloudscraper from "cloudscraper";
import * as cheerio from "cheerio";

const BASE_URL = "https://asuracomic.net";

/**
 * Scrape chapters from AsuraComic
 * @param {string} slug - e.g. "webtoon-character-na-kang-lim"
 */
export async function getChaptersFromAsura(slug) {
  if (!slug) return [];

  try {
    const url = `${BASE_URL}/series/${slug}`;
    console.log(`📘 Scraping Asura: ${url}`);

    // ✅ Cloudscraper automatically handles Cloudflare challenges
    const html = await cloudscraper.get(url);
    const $ = cheerio.load(html);
    const chapters = [];

    // Select all chapter links
    $("li.wp-manga-chapter > a, div.chapter-link > a").each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");
      const match = title.match(/chapter\s*([\d.]+)/i);
      const chapter = match ? parseFloat(match[1]) : null;

      if (href && chapter) {
        chapters.push({
          id: `${slug}-${chapter}`,
          chapter,
          title,
          source: "asura",
          url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
        });
      }
    });

    console.log(`✅ Asura found ${chapters.length} chapters for ${slug}`);
    return chapters.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error(`❌ Asura fetch failed for ${slug}:`, err.message);
    return [];
  }
}