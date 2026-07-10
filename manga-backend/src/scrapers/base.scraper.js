// src/scrapers/base.scraper.js
import * as cheerio from "cheerio";
import { fetchWithBrowser } from "../services/browser.service.js";
import { slugService } from "../services/slug.service.js";

export class BaseScraper {
  static TIMEOUTS = {
    search: 8000,
    chapters: 12000,
    images: 15000
  };

  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  // Common title normalization for matching
  normalizeTitle(title) {
    return (title || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  // Common scoring logic
  scoreTitleMatch(query, candidate) {
    const q = this.normalizeTitle(query);
    const c = this.normalizeTitle(candidate);
    if (!q || !c) return -1;
    if (q === c) return 100;
    if (c.includes(q)) return 80;
    
    const qWords = new Set(q.split(" "));
    const cWords = c.split(" ");
    return cWords.filter(word => qWords.has(word)).length;
  }

  // Unified retry wrapper for all scraper operations
  async withRetry(fn, retries = 2, delay = 1000) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`[${this.name}] Retry ${i+1}/${retries} after error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        }
    }
  }

  // Unified method to find a series URL across multiple title variants with parallel search and caching
  async findSeriesUrl(titles, searchFn) {
    const primaryTitle = titles[0];
    
    // 1. Check Slug Cache First
    const cachedUrl = slugService.getSlug(this.name, primaryTitle);
    if (cachedUrl) {
      return cachedUrl;
    }

    // 2. Sequential Search with Early Exit for speed
    console.log(`[${this.name}] 🔍 Searching: ${primaryTitle}`);
    
    for (const title of titles) {
        try {
            const result = await searchFn(title);
            if (result?.seriesUrl) {
                // If we found a high quality match, stop searching other variants
                if (result.score >= 95) {
                    console.log(`[${this.name}] ✨ Perfect match found for: ${title}`);
                    slugService.saveSlug(this.name, primaryTitle, result.seriesUrl);
                    return result.seriesUrl;
                }
                
                // If it's a decent match, we'll keep it but check if others are better?
                // Actually, for speed, let's just take the first result that is "good enough" (e.g. score > 70)
                if (result.score >= 70) {
                    slugService.saveSlug(this.name, primaryTitle, result.seriesUrl);
                    return result.seriesUrl;
                }
            }
        } catch (e) {
            continue; 
        }
    }

    return null;
  }

  // Wrapper for browser fetching with logging and retries
  async fetchPage(url, options = {}) {
    return this.withRetry(async () => {
        try {
          return await fetchWithBrowser(url, {
             ...options,
             waitUntil: options.waitUntil || "domcontentloaded" // Extreme Speed Default
          });
        } catch (error) {
          console.error(`[${this.name}] Fetch Error for ${url}:`, error.message);
          throw error;
        }
    });
  }

  // Abstract methods to be implemented by child classes
  async getChapters(title) { throw new Error("Method getChapters() must be implemented"); }
  async getImages(url) { throw new Error("Method getImages() must be implemented"); }
}
