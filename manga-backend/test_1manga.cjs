const cloudscraper = require('cloudscraper');
const GQL = 'https://api.mghcdn.com/graphql';

function gql(query) {
  return cloudscraper({
    method: 'POST', url: GQL,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json',
                'Origin': 'https://1manga.co', 'Referer': 'https://1manga.co/' },
    body: JSON.stringify({ query })
  }).then(r => JSON.parse(r)).catch(e => ({ error: e.message.substring(0, 400) }));
}

async function run() {
  // Chapter query — try to get pages/images
  console.log('=== Testing chapter query for images ===');

  // Slug for ORV is "omniscient-reader-s-viewpoint", chapter 1 number is 1
  const r1 = await gql(`{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: "1") { id pages { id url } } }`);
  console.log('chapter(pages):', JSON.stringify(r1).substring(0, 400));

  const r2 = await gql(`{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: "1") { id images } }`);
  console.log('chapter(images):', JSON.stringify(r2).substring(0, 400));

  const r3 = await gql(`{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: "1") { id title number } }`);
  console.log('chapter(id/title/number):', JSON.stringify(r3).substring(0, 400));
}

run();
