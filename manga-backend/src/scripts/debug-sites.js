// manga-backend/src/scripts/debug-sites.js
/**
 * DEBUG SITES SCRIPT
 * 
 * This script fetches the raw HTML from each manga source website
 * to understand what's being returned and why selectors might fail
 */

import { fetchWithBrowser } from "../services/browser.service.js";
import * as cheerio from "cheerio";

const SITES = {
  asura: {
    name: "Asura",
    baseUrl: "https://asuracomic.net",
    searchUrl: "https://asuracomic.net/series?name=One%20Piece",
    selectors: ["a.group", "div.grid a", "a[href*='/series/']", "a[href*='/comics/']"]
  },
  flame: {
    name: "Flame",
    baseUrl: "https://flamecomics.xyz",
    searchUrl: "https://flamecomics.xyz/browse?q=One%20Piece",
    selectors: ["a[href*='/series/']", "h3", "span", ".title"]
  },
  mangahub: {
    name: "MangaHub",
    baseUrl: "https://1manga.co",
    searchUrl: "https://1manga.co/search?q=One%20Piece",
    selectors: [".media-heading a", ".manga-title a", "a[href*='/manga/']"]
  },
  manganato: {
    name: "Manganato",
    baseUrl: "https://manganato.com",
    searchUrl: "https://manganato.com/search/story/One%20Piece",
    selectors: [".search-story-item", ".story_item", "a[href*='/manga']"]
  },
};

async function debugSite(siteKey) {
  const site = SITES[siteKey];
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🔍 DEBUGGING: ${site.name}`);
  console.log(`Base URL: ${site.baseUrl}`);
  console.log(`Search URL: ${site.searchUrl}`);
  console.log(`${"=".repeat(80)}\n`);

  try {
    console.log(`⏳ Fetching HTML from ${site.searchUrl}...`);
    const html = await fetchWithBrowser(site.searchUrl, {
      timeout: 15000,
    });

    console.log(`✓ HTML fetched successfully (${html.length} bytes)\n`);

    // Check HTTP status indirectly by looking for error patterns
    if (html.includes("404") || html.includes("not found")) {
      console.log(`⚠️  WARNING: Page may be 404 - found "404" or "not found" in HTML`);
    }
    if (html.includes("cloudflare") || html.includes("challenge")) {
      console.log(`⚠️  WARNING: Cloudflare challenge detected in HTML!`);
      console.log(`   This means the site is blocking automated requests.`);
    }
    if (html.includes("403") || html.includes("Forbidden")) {
      console.log(`⚠️  WARNING: 403 Forbidden detected in HTML`);
    }

    // Show first 500 chars of HTML (title, meta, etc)
    console.log(`\n📄 First 1000 characters of HTML:\n`);
    console.log(html.substring(0, 1000));
    console.log(`\n... [truncated] ...\n`);

    // Parse HTML and check for selectors
    const $ = cheerio.load(html);
    
    console.log(`📊 Selector Analysis:`);
    for (const selector of site.selectors) {
      const count = $(selector).length;
      console.log(`  "${selector}": ${count} matches`);
    }

    // Show some sample content
    console.log(`\n📋 Sample matched content (first 3):`);
    for (const selector of site.selectors) {
      const elements = $(selector).slice(0, 3);
      if (elements.length > 0) {
        console.log(`\n  From selector "${selector}":`);
        elements.each((i, el) => {
          const text = $(el).text().trim().substring(0, 80);
          const href = $(el).attr("href");
          console.log(`    [${i+1}] text="${text}" href="${href}"`);
        });
        break; // Show from first selector with matches
      }
    }

    // Check for common anti-bot patterns
    console.log(`\n🛡️  Anti-bot checks:`);
    console.log(`  Has Recaptcha: ${html.includes("recaptcha") ? "YES ⚠️" : "No"}`);
    console.log(`  Has JavaScript challenge: ${html.includes("__cf_bm") ? "YES (Cloudflare) ⚠️" : "No"}`);
    console.log(`  Has Turnstile: ${html.includes("turnstile") ? "YES ⚠️" : "No"}`);

  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
    console.log(`\nStack trace (first 3 lines):`);
    console.log(err.stack.split("\n").slice(0, 4).join("\n"));
  }
}

async function runDebug() {
  console.log(`\n`);
  console.log(`╔${"═".repeat(78)}╗`);
  console.log(`║  🔧 MANGAVERSE SITES DEBUG                                                ║`);
  console.log(`║  Fetching HTML from each manga source to understand failures             ║`);
  console.log(`╚${"═".repeat(78)}╝`);

  for (const siteKey of Object.keys(SITES)) {
    await debugSite(siteKey);
  }

  console.log(`\n\n${"═".repeat(80)}`);
  console.log(`✅ DEBUG COMPLETE`);
  console.log(`${"═".repeat(80)}`);
  console.log(`\nAnalysis:\n`);
  console.log(`1. If "Cloudflare challenge" is detected → Sites blocking bots → Need better headers/UA`);
  console.log(`2. If selectors show "0 matches" → HTML structure changed → Need to update selectors`);
  console.log(`3. If HTML is very short (< 5KB) → Likely getting error page or redirect`);
  console.log(`4. If "404" or "Forbidden" detected → Domain might be dead or changed\n`);
}

// Run the debug
runDebug().catch(err => {
  console.error("Debug failed:", err);
  process.exit(1);
});
