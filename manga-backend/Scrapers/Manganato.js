// Scrapers/Manganato.js
// Manganato / Chapmanganato — no Cloudflare, plain axios + cheerio works fine.
import axios from "axios";
import * as cheerio from "cheerio";

const SEARCH_DOMAINS = [
  "https://manganato.com",
  "https://chapmanganato.com",
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

async function findSeriesUrl(title) {
  const query = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  for (const domain of SEARCH_DOMAINS) {
    const searchUrl = `${domain}/search/story/${query}`;
    try {
      const { data } = await axios.get(searchUrl, {
        headers: { "User-Agent": UA },
        timeout: 10000,
      });
      const $ = cheerio.load(data);
      const normTitle = normalize(title);
      let foundUrl = null;

      $(".search-story-item, .story_item").each((_, el) => {
        const itemTitle = $(el).find(".item-title, a[title]").first().text().trim();
        const itemUrl = $(el).find(".item-title, a[title]").first().attr("href");
        const normItem = normalize(itemTitle);

        // Match if either title contains the other (handles partial matches)
        if (
          normItem.includes(normTitle.substring(0, 10)) ||
          normTitle.includes(normItem.substring(0, 10))
        ) {
          foundUrl = itemUrl;
          return false; // break
        }
      });

      if (foundUrl) return foundUrl;
    } catch (err) {
      continue;
    }
  }
  return null;
}

async function scrapeChapterList(seriesUrl) {
  try {
    const { data } = await axios.get(seriesUrl, {
      headers: { "User-Agent": UA, Referer: "https://manganato.com/" },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    const chapters = [];

    $(".chapter-name, .row a, .chapter-list a").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (!href) return;

      const match = href.match(/chapter-([\d.]+)/);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num)) {
          chapters.push({
            id: `manganato-${num}`,
            chapter: num,
            title: text || `Chapter ${num}`,
            source: "manganato",
            url: href,
          });
        }
      }
    });

    return chapters;
  } catch (err) {
    console.error("Manganato chapter list failed:", err.message);
    return [];
  }
}

export async function getChaptersFromManganato(title) {
  if (!title) return [];
  const url = await findSeriesUrl(title);
  if (!url) {
    console.warn(`⚠️ Manganato: no series found for "${title}"`);
    return [];
  }
  const chapters = await scrapeChapterList(url);
  console.log(`✅ Manganato: ${chapters.length} chapters for "${title}"`);
  return chapters;
}

export async function getImagesFromManganato(url) {
  if (!url) return [];
  try {
    const referer = url.includes("chapmanganato")
      ? "https://chapmanganato.com/"
      : "https://manganato.com/";

    const { data } = await axios.get(url, {
      headers: { "User-Agent": UA, Referer: referer },
      timeout: 12000,
    });

    const $ = cheerio.load(data);
    const images = [];

    $(".container-chapter-reader img, .chapter-content img").each((_, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http")) images.push(src.trim());
    });

    console.log(`✅ Manganato images: ${images.length} pages`);
    return images;
  } catch (err) {
    console.error("Manganato images failed:", err.message);
    return [];
  }
}
