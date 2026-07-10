const cloudscraper = require('cloudscraper');

async function testMangaHubAlt() {
  const GQL_URL = "https://api.mangahub.io/graphql";
  const query = `{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: 1) { pages } }`;
  
  try {
    const response = await cloudscraper({
      method: "POST",
      url: GQL_URL,
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://mangahub.io",
        "Referer": "https://mangahub.io/"
      },
      body: JSON.stringify({ query })
    });
    console.log('Success:', response.substring(0, 100));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

testMangaHubAlt();
