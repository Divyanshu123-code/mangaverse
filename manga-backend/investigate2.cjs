const axios = require('axios');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

// Test exact Asura selectors on the chapter list
async function testAsuraChapters() {
  console.log('\n=== Asura chapter scraping ===');
  try {
    const html = await cloudscraper.get('https://asuracomic.net/series/omniscient-readers-viewpoint-8c85a9ba');
    const $ = cheerio.load(html);
    
    const links = [];
    $('a[href*="chapter"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().substring(0, 60);
      if (href && href.includes('asura') && !href.includes('series')) {
        links.push({ href, text });
      }
    });
    console.log('Chapter links found:', links.length);
    console.log('First 5:', links.slice(0, 5));
    console.log('Last 5:', links.slice(-5));
  } catch(e) { console.error('Asura err:', e.message); }
}

// Test Flame - try to find their search or series API
async function testFlameFind() {
  console.log('\n=== Flame series search ===');
  try {
    // Try their browse/library page
    const { data } = await axios.get('https://flamecomics.xyz/library', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const script = $('script[id="__NEXT_DATA__"]').html();
    if (script) {
      const json = JSON.parse(script);
      console.log('Library pageProps keys:', Object.keys(json.props.pageProps));
      const series = json.props.pageProps.series || [];
      console.log('Series count:', series.length);
      const match = series.find(s => s.title && s.title.toLowerCase().includes('omniscient'));
      console.log('Omniscient match:', match ? { id: match.series_id || match.id, title: match.title } : 'not found');
      if (series.length > 0) console.log('Sample:', series.slice(0,3).map(s => ({ id: s.series_id || s.id, title: s.title })));
    }
  } catch(e) { console.error('Flame library err:', e.message); }
  
  try {
    // Try direct series page for ORV
    const { data } = await axios.get('https://flamecomics.xyz/series/1', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const title = $('h1').first().text().trim();
    console.log('Flame /series/1 title:', title);
  } catch(e) { console.error('Flame series/1 err:', e.message); }

  try {
    const { data } = await axios.get('https://flamecomics.xyz/series/2', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const title = $('h1').first().text().trim();
    console.log('Flame /series/2 title:', title);
    
    // Look for __NEXT_DATA__ to find chapter structure
    const script = $('script[id="__NEXT_DATA__"]').html();
    if (script) {
      const json = JSON.parse(script);
      const pp = json.props.pageProps;
      console.log('Series/2 pageProps keys:', Object.keys(pp));
      if (pp.series) console.log('Series data:', { id: pp.series.id, title: pp.series.title });
      if (pp.chapters) console.log('Chapters count:', pp.chapters.length, 'first:', pp.chapters[0]);
    }
  } catch(e) { console.error('Flame series/2 err:', e.message); }
}

testAsuraChapters().then(testFlameFind);
