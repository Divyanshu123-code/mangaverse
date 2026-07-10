const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

// Dump the actual raw hrefs from Asura
async function investigateAsuraRaw() {
  const html = await cloudscraper.get('https://asuracomic.net/series/omniscient-readers-viewpoint-8c85a9ba');
  const $ = cheerio.load(html);
  // Dump all hrefs containing 'chapter'
  const hrefs = [];
  $('a[href*="chapter"]').each((i, el) => {
    hrefs.push($(el).attr('href'));
  });
  console.log('All href[*chapter]:', hrefs.slice(0, 10));
}
investigateAsuraRaw().catch(console.error);
