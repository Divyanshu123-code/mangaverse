// manga-backend/test_images.cjs
const cloudscraper = require('cloudscraper');

async function testMangaHubImages() {
  const GQL_URL = "https://api.mghcdn.com/graphql";
  const slug = "omniscient-reader-s-viewpoint";
  const chapterNumber = 0;
  
  const query = `{
    chapter(x: m01, slug: "${slug}", number: ${chapterNumber}) {
      pages
    }
  }`;

  try {
    const response = await cloudscraper({
      method: "POST",
      url: GQL_URL,
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://1manga.co",
        "Referer": "https://1manga.co/"
      },
      body: JSON.stringify({ query })
    });

    const data = JSON.parse(response);
    console.log('Success:', !!data.data?.chapter?.pages);
    if (data.data?.chapter?.pages) {
        console.log('Pages sample:', data.data.chapter.pages.substring(0, 100));
    } else {
        console.log('JSON:', JSON.stringify(data));
    }
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

testMangaHubImages();
