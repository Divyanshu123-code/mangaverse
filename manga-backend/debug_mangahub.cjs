const cloudscraper = require('cloudscraper');
const GQL = 'https://api.mghcdn.com/graphql';

async function testMangaHub() {
  const query = `{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: 1.0) { id pages } }`;
  
  try {
    const result = await cloudscraper({
      method: 'POST',
      url: GQL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://1manga.co',
        'Referer': 'https://1manga.co/'
      },
      body: JSON.stringify({ query })
    });
    
    const json = JSON.parse(result);
    console.log('Pages raw:', json?.data?.chapter?.pages?.substring(0, 500));
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testMangaHub();
