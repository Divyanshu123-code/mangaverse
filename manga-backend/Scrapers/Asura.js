// Scrapers/Asura.js
// Uses Playwright to bypass Cloudflare + Astro JS rendering on AsuraScans.
import * as cheerio from "cheerio";
import { fetchWithBrowser, evalWithBrowser } from "../Services/browserService.js";

const BASE_URL = "https://asuracomic.net";

// ─── Chapter List ────────────────────────────────────────────────────────────

export async function getChaptersFromAsura(title) {
  if (!title) return [];

  try {
    const searchUrl = `${BASE_URL}/series?name=${encodeURIComponent(title)}`;
    console.log(`🔍 Asura search: ${searchUrl}`);

    const html = await fetchWithBrowser(searchUrl, {
      waitForSelector: "a.group, div.grid a",
      timeout: 25000,
    });

    const $ = cheerio.load(html);

    // Find the first matching series link
    let seriesUrl = null;
    $("a.group, div.grid a[href*='/series/']").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/series/")) {
        seriesUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        return false; // break
      }
    });

    if (!seriesUrl) {
      console.warn(`⚠️ Asura: no series found for "${title}"`);
      return [];
    }

    console.log(`📖 Asura series page: ${seriesUrl}`);

    const seriesHtml = await fetchWithBrowser(seriesUrl, {
      waitForSelector: "a[href*='/chapter/']",
      timeout: 25000,
    });

    const $s = cheerio.load(seriesHtml);
    const chapters = [];

    $s("a[href*='/chapter/']").each((_, el) => {
      const href = $s(el).attr("href");
      const text = $s(el).text().trim();
      const numMatch =
        href.match(/chapter-([\d.]+)/i) || text.match(/chapter\s*([\d.]+)/i);

      if (numMatch) {
        const num = parseFloat(numMatch[1]);
        chapters.push({
          id: `asura-${href.split("/").pop()}`,
          chapter: num,
          title: text || `Chapter ${num}`,
          source: "asura",
          url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
        });
      }
    });

    // Deduplicate by chapter number
    const seen = new Set();
    const unique = chapters.filter((c) => {
      if (seen.has(c.chapter)) return false;
      seen.add(c.chapter);
      return true;
    });

    console.log(`✅ Asura: ${unique.length} chapters for "${title}"`);
    return unique.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.error(`❌ Asura chapters failed for "${title}":`, err.message);
    return [];
  }
}

// ─── Chapter Images ───────────────────────────────────────────────────────────

export async function getImagesFromAsura(url) {
  if (!url) return [];

  try {
    console.log(`🖼️ Asura images: ${url}`);

    // Asura uses Astro — images are in JS component props, not raw HTML.
    // We evaluate in the browser to extract them after JS runs.
    const images = await evalWithBrowser(
      url,
      () => {
        // Strategy 1: grab all <img> tags in the reader area
        const imgs = Array.from(
          document.querySelectorAll(
            "#readerarea img, .reader-area img, main img, [class*='chapter'] img"
          )
        )
          .map((el) => el.src || el.dataset.src || el.dataset.lazySrc)
          .filter(
            (src) =>
              src &&
              src.startsWith("http") &&
              !src.includes("logo") &&
              !src.includes("avatar") &&
              !src.includes("banner")
          );

        if (imgs.length > 0) return imgs;

        // Strategy 2: scan all images on page, filter by CDN domain
        return Array.from(document.querySelectorAll("img"))
          .map((el) => el.src || el.dataset.src)
          .filter(
            (src) =>
              src &&
              (src.includes("shrubbery.org") ||
                src.includes("asuracomic.net/storage") ||
                src.includes("asurascans.com/storage"))
          );
      },
      { referer: BASE_URL, timeout: 25000 }
    );

    const unique = [...new Set(images)];
    console.log(`✅ Asura images: ${unique.length} pages`);
    return unique;
  } catch (err) {
    console.error(`❌ Asura images failed for ${url}:`, err.message);
    return [];
  }
}
