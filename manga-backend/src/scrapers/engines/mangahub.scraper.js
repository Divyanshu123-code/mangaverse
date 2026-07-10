// src/scrapers/engines/mangahub.scraper.js
import * as cheerio from "cheerio";
import axios from "axios";
import { BaseScraper } from "../base.scraper.js";

const GQL_URL = "https://api.mghcdn.com/graphql";

export class MangahubScraper extends BaseScraper {
  constructor() {
    super("MangaHub", "https://1manga.co");
  }

  async getChapters(titles) {
    if (!titles?.length) return [];
    try {
      const seriesUrl = await this.findSeriesUrl(titles, async (title) => {
        const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(title)}`;
        const html = await this.fetchPage(searchUrl, {
            waitForSelector: ".media-heading a, .manga-title a",
            timeout: BaseScraper.TIMEOUTS.search,
        });

        const $ = cheerio.load(html);
        let bestSlug = null;
        let bestScore = -1;

        $(".media-heading a, .manga-title a").each((_, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr("href") || "";
            const score = this.scoreTitleMatch(title, text);
            
            if (href.includes("/manga/") && score > bestScore) {
                bestScore = score;
                bestSlug = href.split("/").pop();
            }
        });

        return bestSlug ? { seriesUrl: bestSlug, score: bestScore } : null;
      });

      if (!seriesUrl) return [];
      const bestSlug = seriesUrl; // For MH, we store the slug in seriesUrl field in findSeriesUrl helper


      // Use GQL for high speed chapter list
      const query = `
        query ($slug: String!) {
          manga(slug: $slug) {
            chapters {
              number
              title
              slug
            }
          }
        }
      `;

      const { data } = await axios.post(GQL_URL, {
        query,
        variables: { slug: bestSlug },
      }, { timeout: 8000 });

      const gqlChapters = data.data?.manga?.chapters || [];
      if (gqlChapters.length > 0) {
        return gqlChapters.map(ch => {
          let num = parseFloat(ch.number);
          
          // Fix for weird MangaHub IDs (like in the user screenshot)
          // If number is huge, try to extract from title (e.g., "Chapter 123" -> 123)
          if (num > 5000) {
              const titleMatch = ch.title?.match(/Chapter\s*([\d.]+)/i);
              if (titleMatch) num = parseFloat(titleMatch[1]);
          }

          return {
            id: `mangahub-${ch.slug}-${ch.number}`,
            chapter: num,
            title: ch.title || `Chapter ${num}`,
            source: "mangahub",
            url: `${this.baseUrl}/manga/${bestSlug}/${ch.number}`,
          };
        }).sort((a, b) => a.chapter - b.chapter);
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  async getImages(slug, chapterNumber) {
    if (!slug || !chapterNumber) return [];
    try {
      const query = `
        query ($slug: String!, $number: Int!) {
          chapter(x: m01, slug: $slug, number: $number) {
            pages
          }
        }
      `;
      const { data } = await axios.post(GQL_URL, {
        query,
        variables: { slug, number: parseInt(chapterNumber) },
      }, { timeout: 10000 });

      const pages = JSON.parse(data.data?.chapter?.pages || "{}");
      const images = Object.values(pages).map(p => `https://img.mghcdn.com/manga/${p}`);
      return images;
    } catch (err) {
      return [];
    }
  }
}
