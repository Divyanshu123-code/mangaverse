const axios = require('axios');
const cheerio = require('cheerio');

async function investigateFlame() {
  console.log('\n=== Testing Flame series listing ===');
  try {
    const { data } = await axios.get('https://flamecomics.xyz/series', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
    });
    const $ = cheerio.load(data);
    const script = $('script[id="__NEXT_DATA__"]').html();
    if (script) {
      const json = JSON.parse(script);
      const pageProps = json.props.pageProps;
      console.log('Keys:', Object.keys(pageProps));
      if (pageProps.series) {
        console.log('Series count:', pageProps.series.length);
        const match = pageProps.series.find(s => s.title && s.title.toLowerCase().includes('omniscient'));
        console.log('Omniscient:', match ? { id: match.series_id, title: match.title } : 'not found');
        console.log('First 5:', pageProps.series.slice(0, 5).map(s => ({ id: s.series_id, title: s.title })));
      }
    }
  } catch (e) { console.error('Flame series err:', e.message); }
}

async function investigateAsura() {
  console.log('\n=== Testing Asura selectors ===');
  const cloudscraper = require('cloudscraper');
  try {
    const html = await cloudscraper.get('https://asuracomic.net/series/omniscient-readers-viewpoint-8c85a9ba');
    const $ = cheerio.load(html);
    // Try various selectors
    const selectors = ['div[class*="chapter"] a', 'a[href*="chapter"]', 'li a[href*="chapter"]', 'h3 a', '.chp-release a'];
    selectors.forEach(sel => {
      const count = $(sel).length;
      if (count > 0) console.log(`Selector "${sel}": ${count} results`);
    });
  } catch(e) { console.error('Asura err:', e.message); }
}

async function testMangaDextTotal() {
  console.log('\n=== MangaDex total chapters ===');
  try {
    const { data } = await axios.get('https://api.mangadex.org/chapter', {
      params: {
        manga: '9a414441-bbad-43f1-a3a7-dc262ca790a3',
        limit: 1,
      }
    });
    console.log('Total (no lang filter):', data.total);
    const { data: data2 } = await axios.get('https://api.mangadex.org/chapter', {
      params: {
        manga: '9a414441-bbad-43f1-a3a7-dc262ca790a3',
        'translatedLanguage[]': 'en',
        limit: 1,
      }
    });
    console.log('Total (en only):', data2.total);
  } catch(e) { console.error('MangaDex err:', e.message); }
}

investigateFlame().then(investigateAsura).then(testMangaDextTotal);
