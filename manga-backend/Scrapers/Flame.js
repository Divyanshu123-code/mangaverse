// Scrapers/Flame.js
// Uses Playwright to bypass Cloudflare + Next.js rendering on FlameComics.
import * as cheerio from "cheerio";
import { fetchWithBrowser, evalWithBrowser } from "../Services/browserService.js";

const BASE_URL = "https://flamecomics.xyz";

// ─── Chapter List ────────────────────────────────────────────────────────────

export async function getChaptersFromFlame(title) {
  if (!title) return [];

  try {
    const searchUrl = `${BASE_URL}/browse?q=${encodeURIComponent(title)}`;
    console.log(`🔍 Flame search: ${searchUrl}`);

    const html = await fetchWithBrowser(searchUrl, {
      waitForSelector: "a[href*='/series/']",
      timeout: 25000,
    });

    const $ = cheerio.load(html);

    let seriesUrl = null;
    $("a[href*='/series/']").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.includes("/chapter/")) {
        seriesUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        return false;
      }
    });

    if (!seriesUrl) {
      console.warn(`⚠️ Flame: no series found for "${title}"`);
      return [];
    }

    console.log(`📖 Flame series page: ${seriesUrl}`);

    const seriesHtml = await fetchWithBrowser(seriesUrl, {
      waitForSelector: "a[href*='/chapter/']",
      timeout: 25000,
    });

    const $s = cheerio.load(seriesHtml);
    const chapters = [];

    $s("a[href*='/chapter/']").each((_, el) => {
      const href = $s(el).attr("href");
      const numMatch = href.match(/chapter-([\d.]+)/i);
      if (numMatch) {
        const num = parseFloat(numMatch[1]);
        chapters.push({
          id: `flame-${href.split("/").pop()}`,
          chapter: num,
          title: `Chapter ${num}`,
          source: "flame",
          url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
        });
      }
    });

    const seen = new Set();
    const unique = chapters.filter((c) => {
      if (seen.has(c.chapter)) return false;
      seen.add(c.chapter);
      return true;
    });

    console.log(`✅ Flame: ${unique.length} chapters for "${title}"`);
    return unique.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error(`❌ Flame chapters failed for "${title}":`, err.message);
    return [];
  }
}

// ─── Chapter Images ───────────────────────────────────────────────────────────

export async function getImagesFromFlame(url) {
  if (!url) return [];

  try {
    console.log(`🖼️ Flame images: ${url}`);

    // Flame uses Next.js — __NEXT_DATA__ contains the chapter pages after hydration.
    const images = await evalWithBrowser(
      url,
      () => {
        // Strategy 1: extract from __NEXT_DATA__ script tag
        try {
          const nextDataEl = document.getElementById("__NEXT_DATA__");
          if (nextDataEl) {
            const json = JSON.parse(nextDataEl.textContent);
            const pp = json?.props?.pageProps;
            const pages =
              pp?.chapter?.pages ||
              pp?.pages ||
              pp?.images ||
              pp?.chapter?.images;

            if (Array.isArray(pages) && pages.length > 0) {
              return pages
                .map((p) => {
                  const src = typeof p === "string" ? p : p.url || p.src || p.image;
                  if (!src) return null;
                  return src.startsWith("/") ? `https://flamecomics.xyz${src}` : src;
                })
                .filter(Boolean);
            }
          }
        } catch (e) {}

        // Strategy 2: grab rendered <img> tags in reader area
        return Array.from(
          document.querySelectorAll(
            "#readerarea img, .reader img, main img, [class*='chapter'] img"
          )
        )
          .map((el) => el.src || el.dataset.src)
          .filter(
            (src) =>
              src &&
              src.startsWith("http") &&
              !src.includes("logo") &&
              !src.includes("icon")
          );
      },
      { referer: BASE_URL, timeout: 25000 }
    );

    const unique = [...new Set(images)];
    console.log(`✅ Flame images: ${unique.length} pages`);
    return unique;
  } catch (err) {
    console.error(`❌ Flame images failed for ${url}:`, err.message);
    return [];
  }
}
