import { getAllChaptersScraped } from "./manga-backend/Scrapers/index.js";

async function test() {
    const title = "Omniscient Reader"; // A classic Manhwa
    const mangaId = "304620" // Example MD id for ORV
    console.log(`Starting test for ${title}...`);
    const chapters = await getAllChaptersScraped(mangaId, "", title);
    console.log(`Total chapters found: ${chapters.length}`);
    const sources = [...new Set(chapters.flatMap(c => c.mirrors.map(m => m.source)))];
    console.log(`Sources found: ${sources.join(", ")}`);
    
    // Check first and last chapter
    if (chapters.length > 0) {
        console.log(`First chapter:`, JSON.stringify(chapters[0], null, 2));
    }
}

test();
