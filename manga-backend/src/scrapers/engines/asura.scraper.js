// src/scrapers/engines/asura.scraper.js
import * as cheerio from "cheerio";
import { BaseScraper } from "../base.scraper.js";
import { evalWithBrowser } from "../../services/browser.service.js";

export class AsuraScraper extends BaseScraper {
  constructor() {
    super("Asura", "https://asuracomic.net");
  }

  async getChapters(titles) {
    if (!titles?.length) return [];
    try {
      const seriesUrl = await this.findSeriesUrl(titles, async (title) => {
        const searchUrl = `${this.baseUrl}/series?name=${encodeURIComponent(title)}`;
        const html = await this.fetchPage(searchUrl, {
            waitForSelector: "a.group, div.grid a",
            timeout: BaseScraper.TIMEOUTS.search,
        });

        const $ = cheerio.load(html);
        let match = null;
        let bestScore = -1;

        $("a.group, div.grid a[href*='/series/'], div.grid a[href*='/comics/'], a[href*='/comics/']").each((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim() || $(el).attr("title") || "";
            const score = this.scoreTitleMatch(title, text);
            if (href && (href.includes("/series/") || href.includes("/comics/")) && !href.includes("/chapter/") && score > bestScore) {
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
            id: `asura-${href.split("/").pop()}`,
            chapter: num,
            title: text || `Chapter ${num}`,
            source: "asura",
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
    try {
      const images = await evalWithBrowser(url, () => {
        const imgs = Array.from(document.querySelectorAll("#readerarea img, .reader-area img, main img, [class*='chapter'] img"))
          .map(el => el.src || el.dataset.src || el.dataset.lazySrc)
          .filter(src => src && src.startsWith("http") && !src.includes("logo") && !src.includes("avatar"));

        if (imgs.length > 0) return imgs;

        return Array.from(document.querySelectorAll("img"))
          .map(el => el.src || el.dataset.src)
          .filter(src => src && (src.includes("shrubbery.org") || src.includes("asuracomic.net/storage")));
      }, { referer: this.baseUrl, timeout: 20000 });

      return [...new Set(images)];
    } catch (err) {
      return [];
    }
  }
}
