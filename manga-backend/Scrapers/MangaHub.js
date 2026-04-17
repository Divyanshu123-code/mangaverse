// Scrapers/MangaHub.js
// MangaHub (1manga.co) uses Cloudflare + GraphQL for images.
// We use Playwright to bypass CF, then try the GraphQL API, then fall back to DOM scraping.
import * as cheerio from "cheerio";
import axios from "axios";
import { fetchWithBrowser, evalWithBrowser } from "../Services/browserService.js";

const BASE_URL = "https://1manga.co";
const GQL_URL = "https://api.mghcdn.com/graphql";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// ─── Chapter List ────────────────────────────────────────────────────────────

export async function getChaptersFromMangaHub(title) {
  if (!title) return [];

  try {
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(title)}`;
    console.log(`🔍 MangaHub search: ${searchUrl}`);

    const html = await fetchWithBrowser(searchUrl, {
      waitForSelector: ".media-heading a, .manga-title a",
      timeout: 25000,
    });

    const $ = cheerio.load(html);
    const seriesPath =
      $(".media-heading a").first().attr("href") ||
      $(".manga-title a").first().attr("href");

    if (!seriesPath) {
      console.warn(`⚠️ MangaHub: no series found for "${title}"`);
      return [];
    }

    const seriesUrl = seriesPath.startsWith("http")
      ? seriesPath
      : `${BASE_URL}${seriesPath}`;

    const slug = seriesUrl.split("/manga/")[1]?.replace(/\/$/, "") || "";
    console.log(`📖 MangaHub series: ${seriesUrl} (slug: ${slug})`);

    const seriesHtml = await fetchWithBrowser(seriesUrl, {
      waitForSelector: ".list-group-item a, .chapter-list a",
      timeout: 25000,
    });

    const $s = cheerio.load(seriesHtml);
    const chapters = [];

    $s(".list-group-item a, .chapter-list a").each((_, el) => {
      const href = $s(el).attr("href");
      if (!href) return;
      const match = href.match(/chapter-([\d.]+)/);
      if (match) {
        const num = parseFloat(match[1]);
        chapters.push({
          id: `mangahub-${slug}-${num}`,
          chapter: num,
          title: `Chapter ${num}`,
          source: "mangahub",
          url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
          _slug: slug, // store for image fetching
        });
      }
    });

    const seen = new Set();
    const unique = chapters.filter((c) => {
      if (seen.has(c.chapter)) return false;
      seen.add(c.chapter);
      return true;
    });

    console.log(`✅ MangaHub: ${unique.length} chapters for "${title}"`);
    return unique.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error(`❌ MangaHub chapters failed for "${title}":`, err.message);
    return [];
  }
}

// ─── Chapter Images ───────────────────────────────────────────────────────────

export async function getImagesFromMangaHub(slug, chapterNumber) {
  if (!slug || !chapterNumber) return [];

  // Strategy 1: GraphQL API (fastest, often blocked)
  try {
    const query = `{
      chapter(x: m01, slug: "${slug}", number: ${chapterNumber}) {
        pages
      }
    }`;

    const { data } = await axios.post(
      GQL_URL,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://1manga.co",
          Referer: "https://1manga.co/",
          "User-Agent": UA,
        },
        timeout: 8000,
      }
    );

    const pagesRaw = data?.data?.chapter?.pages;
    if (pagesRaw) {
      const pagesObj = JSON.parse(pagesRaw);
      const pages = Object.values(pagesObj).map(
        (p) => `https://imgx.mghcdn.com/${p}`
      );
      if (pages.length > 0) {
        console.log(`✅ MangaHub GQL: ${pages.length} images`);
        return pages;
      }
    }
  } catch (err) {
    console.warn("MangaHub GQL blocked, falling back to browser:", err.message);
  }

  // Strategy 2: Playwright DOM scraping
  try {
    const url = `${BASE_URL}/manga/${slug}/chapter-${chapterNumber}`;
    console.log(`🖼️ MangaHub browser scrape: ${url}`);

    const images = await evalWithBrowser(
      url,
      () => {
        // MangaHub renders images in a reader div
        const imgs = Array.from(
          document.querySelectorAll(
            "#chapter-reader img, .chapter-reader img, .reader-content img, main img"
          )
        )
          .map((el) => el.src || el.dataset.src)
          .filter(
            (src) =>
              src &&
              src.startsWith("http") &&
              (src.includes("mghcdn.com") || src.includes("imgx."))
          );

        if (imgs.length > 0) return imgs;

        // Fallback: any image on the CDN domain
        return Array.from(document.querySelectorAll("img"))
          .map((el) => el.src)
          .filter((src) => src && src.includes("mghcdn.com"));
      },
      { referer: BASE_URL, timeout: 25000 }
    );

    const unique = [...new Set(images)];
    console.log(`✅ MangaHub browser: ${unique.length} images`);
    return unique;
  } catch (err) {
    console.error(`❌ MangaHub images failed for ${slug} ch${chapterNumber}:`, err.message);
    return [];
  }
}
