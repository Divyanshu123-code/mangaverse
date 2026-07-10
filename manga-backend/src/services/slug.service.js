// src/services/slug.service.js
import { getCache, setCache } from "./cache.service.js";
import { logger } from "../utils/logger.js";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "slug_cache.json");

/**
 * Persists the mapping between a manga title and its direct series URL 
 * on a specific mirror using a local file for permanence across restarts.
 */
class SlugService {
  constructor() {
    this.persistentCache = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        this.persistentCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      }
    } catch (err) {
      logger.error("Failed to load slug cache file:", err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.persistentCache, null, 2));
    } catch (err) {
      logger.error("Failed to save slug cache file:", err.message);
    }
  }

  getCacheKey(source, title) {
    const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").trim();
    return `slug_${source}_${normalized}`;
  }

  getSlug(source, title) {
    const key = this.getCacheKey(source, title);
    
    // Check in-memory session cache first
    const session = getCache(key);
    if (session) return session;

    // Check persistent file cache
    if (this.persistentCache[key]) {
        const item = this.persistentCache[key];
        // If not expired (7 days)
        if (Date.now() < item.expiry) {
            return item.url;
        } else {
            delete this.persistentCache[key];
        }
    }
    return null;
  }

  saveSlug(source, title, url) {
    if (!url) return;
    const key = this.getCacheKey(source, title);
    const expiry = Date.now() + 604800000; // 7 days

    logger.info(`💾 Cached slug persistence for ${source}: ${title} -> ${url}`);
    
    // Update session cache
    setCache(key, url, 604800000);

    // Update persistent cache
    this.persistentCache[key] = { url, expiry };
    this.save();
  }
}

export const slugService = new SlugService();
