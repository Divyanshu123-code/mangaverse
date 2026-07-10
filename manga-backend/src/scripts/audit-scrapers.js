// manga-backend/src/scripts/audit-scrapers.js
/**
 * SCRAPER AUDIT & TESTING SCRIPT
 * 
 * This script tests each scraper in isolation and reports:
 * - Whether it can load the base URL
 * - Whether it can search for a test manga
 * - Whether it can fetch chapters
 * - Whether it can extract images
 * - Any error messages or silent failures
 */

import { scraperFactory } from "../scrapers/factory.js";
import { logger } from "../utils/logger.js";

const TEST_MANGA = "One Piece"; // Universal test case
const TEST_MANGA_ID_MANGADEX = "5fed0576-8b94-4210-b0f7-9920703a9940"; // One Piece on MangaDex

async function testScraper(scraperName) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📊 TESTING SCRAPER: ${scraperName}`);
  console.log(`${"=".repeat(70)}\n`);

  try {
    const scraper = scraperFactory.getEngine(scraperName);
    
    console.log(`✓ Scraper initialized: ${scraper.name}`);
    console.log(`✓ Base URL: ${scraper.baseUrl}`);
    
    // TEST 1: Check if methods exist
    console.log(`\n[1/4] Checking methods...`);
    const hasGetChapters = typeof scraper.getChapters === 'function';
    const hasGetImages = typeof scraper.getImages === 'function';
    console.log(`  ✓ getChapters() exists: ${hasGetChapters}`);
    console.log(`  ✓ getImages() exists: ${hasGetImages}`);
    
    if (!hasGetChapters) {
      console.log(`❌ CRITICAL: getChapters() not found!`);
      return;
    }

    // TEST 2: Search & get chapters
    console.log(`\n[2/4] Testing chapter retrieval for "${TEST_MANGA}"...`);
    console.log(`  ⏳ Fetching chapters... (this may take 10-30 seconds)`);
    
    let chapters = [];
    try {
      const startTime = Date.now();
      
      if (scraperName === "mangadex") {
        chapters = await scraper.getChapters(TEST_MANGA_ID_MANGADEX);
      } else {
        chapters = await scraper.getChapters([TEST_MANGA]);
      }
      
      const elapsed = Date.now() - startTime;
      console.log(`  ⏱️  Elapsed: ${elapsed}ms`);
      console.log(`  ✓ Returned ${chapters.length} chapters`);
      
      if (chapters.length === 0) {
        console.log(`  ⚠️  WARNING: No chapters found! This could indicate:`);
        console.log(`     - Search failed silently`);
        console.log(`     - Selectors don't match current HTML`);
        console.log(`     - Domain blocked or changed`);
        console.log(`     - Timeout before results loaded`);
      } else {
        console.log(`  ✓ Sample chapters:`);
        chapters.slice(0, 3).forEach(ch => {
          console.log(`    - Chapter ${ch.chapter}: "${ch.title}" (${ch.source})`);
        });
      }
    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      console.log(`     Stack: ${err.stack.split("\n").slice(0, 3).join("\n     ")}`);
    }

    // TEST 3: Try image extraction if we have a chapter
    if (chapters.length > 0 && hasGetImages) {
      console.log(`\n[3/4] Testing image extraction...`);
      const testChapter = chapters[chapters.length - 1]; // Latest chapter
      console.log(`  ⏳ Fetching images for chapter ${testChapter.chapter}...`);
      
      try {
        const startTime = Date.now();
        let images = [];
        
        if (scraperName === "mangahub") {
          // MangaHub needs slug and chapterNumber
          images = await scraper.getImages(testChapter.id?.split("-")[1], testChapter.chapter);
        } else if (scraperName === "mangadex") {
          // MangaDex needs chapterId
          images = await scraper.getImages(testChapter.id);
        } else {
          // Others need URL
          images = await scraper.getImages(testChapter.url);
        }
        
        const elapsed = Date.now() - startTime;
        console.log(`  ⏱️  Elapsed: ${elapsed}ms`);
        console.log(`  ✓ Returned ${images.length} images`);
        
        if (images.length === 0) {
          console.log(`  ⚠️  WARNING: No images found!`);
        } else {
          console.log(`  ✓ Sample image URL: ${images[0].substring(0, 80)}...`);
        }
      } catch (err) {
        console.log(`  ❌ ERROR: ${err.message}`);
      }
    }

    // TEST 4: Check base.scraper methods
    console.log(`\n[4/4] Checking base scraper methods...`);
    console.log(`  ✓ normalizeTitle() exists: ${typeof scraper.normalizeTitle === 'function'}`);
    console.log(`  ✓ scoreTitleMatch() exists: ${typeof scraper.scoreTitleMatch === 'function'}`);
    console.log(`  ✓ findSeriesUrl() exists: ${typeof scraper.findSeriesUrl === 'function'}`);
    console.log(`  ✓ fetchPage() exists: ${typeof scraper.fetchPage === 'function'}`);

  } catch (err) {
    console.log(`❌ FATAL ERROR: ${err.message}`);
    console.log(err.stack);
  }
}

async function runAudit() {
  console.log(`\n`);
  console.log(`╔${"═".repeat(68)}╗`);
  console.log(`║  🔍 MANGAVERSE SCRAPER AUDIT                                        ║`);
  console.log(`║  Testing: ${TEST_MANGA}${" ".repeat(33 - TEST_MANGA.length)}║`);
  console.log(`╚${"═".repeat(68)}╝`);
  console.log(`\nThis audit will test each scraper independently to identify bugs.\n`);

  const scrapers = ["asura", "flame", "mangahub", "manganato", "mangadex"];
  
  for (const scraperName of scrapers) {
    await testScraper(scraperName);
  }

  console.log(`\n\n${"═".repeat(70)}`);
  console.log(`📋 AUDIT COMPLETE`);
  console.log(`${"═".repeat(70)}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the results above for each scraper`);
  console.log(`2. Note which scrapers returned 0 chapters`);
  console.log(`3. Look for error messages indicating root causes`);
  console.log(`4. Check if errors are consistent across all non-MangaDex sources`);
  console.log(`5. Test URLs manually in browser to compare with scraper results\n`);
}

// Run the audit
runAudit().catch(err => {
  console.error("Audit failed:", err);
  process.exit(1);
});
