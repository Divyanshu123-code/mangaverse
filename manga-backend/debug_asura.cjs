const cloudscraper = require('cloudscraper');
const fs = require('fs');

async function debugAsura() {
  try {
    const html = await cloudscraper.get('https://asuracomic.net/browse?search=Omniscient+Reader');
    fs.writeFileSync('asura_search_debug.html', html);
    console.log('Saved search results to asura_search_debug.html');
  } catch (e) {
    console.error(e.message);
  }
}
debugAsura();
