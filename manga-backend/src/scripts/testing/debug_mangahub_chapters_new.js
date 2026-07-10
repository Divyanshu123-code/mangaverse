// src/scripts/testing/debug_mangahub_chapters.js
import axios from "axios";

const GQL_URL = "https://api.mghcdn.com/graphql";
const slug = "the-monster-duchess-and-the-contract-princess"; // That's its slug on MH

async function debug() {
    const query = `
    query ($slug: String!) {
      manga(slug: $slug) {
        title
        chapters {
          number
          title
          slug
        }
      }
    }
  `;

  try {
    const { data } = await axios.post(GQL_URL, {
      query,
      variables: { slug },
    });

    const chapters = data.data.manga.chapters;
    console.log(`Manga: ${data.data.manga.title}`);
    console.log(`Total Chapters: ${chapters.length}`);
    console.log("First 5 Chapters (raw):");
    console.log(JSON.stringify(chapters.slice(0, 5), null, 2));
    
    console.log("\nLast 5 Chapters (raw):");
    console.log(JSON.stringify(chapters.slice(-5), null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

debug();
