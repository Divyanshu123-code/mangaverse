// src/scripts/testing/check_dex_chapters.js
import axios from "axios";

async function test() {
    // Search for the ID of "The Monstrous Duke's Adopted Daughter"
    // Based on previous logs, it was 50fc2f0f-aeac-4152-82ba-164b3bb3b5b3 or similar
    const mangaId = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0"; // From URL in screenshot
    const url = `https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&limit=10&order[chapter]=asc`;
    
    try {
        const { data } = await axios.get(url);
        console.log(`MangaDex Chapters for ${mangaId}:`);
        data.data.forEach(ch => {
            console.log(`Ch: ${ch.attributes.chapter} | Title: ${ch.attributes.title} | ID: ${ch.id}`);
        });
    } catch (err) {
        console.error(err.message);
    }
}

test();
