// /manga-backend/Scrapers/Flame.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function getChaptersFromFlame(slug) {
  if (!slug) return [];

  try {
    const url = `https://flamecomics.xyz/series/${slug}/`;
    console.log(`🔥 Fetching FlameComics chapters from: ${url}`);

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);
    const chapters = [];

    // ✅ New selector for flamecomics.xyz
    $(".eph-num").each((i, el) => {
      const title = $(el).find(".chapternum").text().trim();
      const href = $(el).find("a").attr("href");
      const chapterNumMatch = title.match(/(\d+\.?\d*)/);
      const chapter = chapterNumMatch ? parseFloat(chapterNumMatch[1]) : i + 1;

      if (href) {
        chapters.push({
          id: `${slug}-${chapter}`,
          chapter,
          title,
          source: "flame",
          url: href.startsWith("http") ? href : `https://flamecomics.xyz${href}`,
        });
      }
    });

    console.log(`✅ Found ${chapters.length} chapters on FlameComics`);
    return chapters;
  } catch (err) {
    console.error("❌ FlameComics scrape failed:", err.message);
    return [];
  }
}