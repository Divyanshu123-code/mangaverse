// src/scrapers/engines/flame.scraper.js
import * as cheerio from "cheerio";
import { BaseScraper } from "../base.scraper.js";

export class FlameScraper extends BaseScraper {
  constructor() {
    super("Flame", "https://flamecomics.xyz");
  }

  async getChapters(titles) {
    if (!titles?.length) return [];
    try {
      const seriesUrl = await this.findSeriesUrl(titles, async (title) => {
        const searchUrl = `${this.baseUrl}/browse?q=${encodeURIComponent(title)}`;
        const html = await this.fetchPage(searchUrl, {
            waitForSelector: "a[href*='/series/']",
            timeout: BaseScraper.TIMEOUTS.search,
        });

        const $ = cheerio.load(html);
        let match = null;
        let bestScore = -1;

        $("a[href*='/series/']").each((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).find("h3, span, .title").text().trim() || $(el).text().trim();
            const score = this.scoreTitleMatch(title, text);

            if (href && !href.includes("/chapter/") && score > bestScore) {
                bestScore = score;
                match = { seriesUrl: href.startsWith("http") ? href : `${this.baseUrl}${href}`, score };
            }
        });
        return match;
      });

      if (!seriesUrl) return [];

      const seriesHtml = await this.fetchPage(seriesUrl, {
        waitForSelector: "a[href*='/chapter/']",
        timeout: 15000,
      });

      const $s = cheerio.load(seriesHtml);
      const chapters = [];

      $s("a[href*='/chapter/']").each((_, el) => {
        const href = $s(el).attr("href");
        const text = $s(el).text().trim();
        const numMatch = href.match(/chapter-([\d.]+)/i) || text.match(/chapter\s*([\d.]+)/i);

        if (numMatch) {
          const num = parseFloat(numMatch[1]);
          chapters.push({
            id: `flame-${href.split("/").pop()}`,
            chapter: num,
            title: text || `Chapter ${num}`,
            source: "flame",
            url: href.startsWith("http") ? href : `${this.baseUrl}${href}`,
          });
        }
      });

      const seen = new Set();
      return chapters
        .filter(c => !seen.has(c.chapter) && seen.add(c.chapter))
        .sort((a, b) => a.chapter - b.chapter);
    } catch (err) {
      return [];
    }
  }

  async getImages(url) {
    // Flame uses Next.js, images are usually in <img> tags in a reader container
    try {
      const html = await this.fetchPage(url, {
        waitForSelector: "main img",
        timeout: 20000,
      });
      const $ = cheerio.load(html);
      const images = [];
      $("main img, [class*='reader'] img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src && src.startsWith("http") && !src.includes("logo")) {
          images.push(src);
        }
      });
      return [...new Set(images)];
    } catch (err) {
      return [];
    }
  }
}
