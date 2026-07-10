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
  console.log('=== Testing chapter query with Float number ===');
  const r = await gql(`{ chapter(x: m01, slug: "omniscient-reader-s-viewpoint", number: 1.0) { id title number pages } }`);
  console.log('Result:', JSON.stringify(r, null, 2));
}

run();
