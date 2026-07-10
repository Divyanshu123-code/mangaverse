// src/scripts/testing/check_mh_html.js
import { fetchWithBrowser } from "../../services/browser.service.js";
import * as cheerio from "cheerio";

async function test() {
    const url = "https://1manga.co/manga/the-monster-duchess-and-the-contract-princess";
    console.log("Fetching MH page...");
    const html = await fetchWithBrowser(url, { waitForSelector: "a.list-group-item" });
    const $ = cheerio.load(html);
    
    console.log("Found chapters count:", $("a.list-group-item").length);
    $("a.list-group-item").slice(0, 10).each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr("href");
        console.log(`[${i}] Text: "${text}" | Href: "${href}"`);
    });
}

test();
