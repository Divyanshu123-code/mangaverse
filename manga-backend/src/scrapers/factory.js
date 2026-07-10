// src/scrapers/factory.js
import { AsuraScraper } from "./engines/asura.scraper.js";
import { FlameScraper } from "./engines/flame.scraper.js";
import { MangadexScraper } from "./engines/mangadex.scraper.js";
import { ManganatoScraper } from "./engines/manganato.scraper.js";
import { MangahubScraper } from "./engines/mangahub.scraper.js";

class ScraperFactory {
  constructor() {
    this.engines = {
      asura: new AsuraScraper(),
      flame: new FlameScraper(),
      mangadex: new MangadexScraper(),
      manganato: new ManganatoScraper(),
      mangahub: new MangahubScraper(),
    };
  }

  getEngine(source) {
    const engine = this.engines[source.toLowerCase()];
    if (!engine) throw new Error(`Source "${source}" not supported`);
    return engine;
  }

  getAllEngines() {
    return Object.values(this.engines);
  }
}

export const scraperFactory = new ScraperFactory();
