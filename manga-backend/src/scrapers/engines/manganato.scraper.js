// src/scrapers/engines/manganato.scraper.js
import * as cheerio from "cheerio";
import { BaseScraper } from "../base.scraper.js";
import { evalWithBrowser } from "../../services/browser.service.js";

const SEARCH_DOMAINS = [
  "https://manganato.com",
  "https://chapmanganato.to",
  "https://chapmanganato.com",
];

export class ManganatoScraper extends BaseScraper {
  constructor() {
    super("Manganato", "https://manganato.com");
  }

  slugify(title) {
    return title.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  }

  async getChapters(titles) {
    if (!titles?.length) return [];
    
    try {
      const seriesUrl = await this.findSeriesUrl(titles, async (title) => {
        const slug = this.slugify(title);
        for (const domain of SEARCH_DOMAINS) {
          try {
            const searchUrl = `${domain}/search/story/${slug}`;
            const html = await this.fetchPage(searchUrl, {
              waitForSelector: ".search-story-item, .story_item",
              timeout: BaseScraper.TIMEOUTS.search,
            });

            const $ = cheerio.load(html);
            const firstResult = $(".search-story-item, .story_item").first();
            const url = firstResult.find("a.item-title, h3 a").attr("href");
            
            if (url) {
                return { seriesUrl: url, score: 100 }; // MH searches are usually exact-slug matches
            }
          } catch (e) {
            continue;
          }
        }
        return null;
      });

      if (!seriesUrl) return [];

        const seriesHtml = await this.fetchPage(seriesUrl, {
          waitForSelector: ".chapter-name, .row a, a[href*='/chapter-']",
          timeout: 15000,
        });

        const $s = cheerio.load(seriesHtml);
        const chapters = [];

        $s(".chapter-name, .row a, a[href*='/chapter-']").each((_, el) => {
          const href = $s(el).attr("href");
          if (!href || !href.includes("chapter")) return;

          const numMatch = href.match(/chapter-([\d.]+)/);
          if (numMatch) {
            const num = parseFloat(numMatch[1]);
            chapters.push({
              id: `manganato-${num}`,
              chapter: num,
              title: $s(el).text().trim() || `Chapter ${num}`,
              source: "manganato",
              url: href,
            });
          }
        });

        const seen = new Set();
        return chapters
          .filter(c => !seen.has(c.chapter) && seen.add(c.chapter))
          .sort((a, b) => a.chapter - b.chapter);
    } catch (e) {
      return [];
    }
  }

  async getImages(url) {
    try {
      const images = await evalWithBrowser(url, () => {
        const imgs = Array.from(document.querySelectorAll(".container-chapter-reader img, .vung-doc img, .reader-content img"))
          .map(el => el.src || el.dataset.src)
          .filter(src => src && src.startsWith("http") && !src.includes("logo"));
        return imgs;
      }, { timeout: 20000 });
      return [...new Set(images)];
    } catch (err) {
      return [];
    }
  }
}
