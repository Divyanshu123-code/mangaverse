const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

async function testAsura() {
  try {
    console.log('Searching Asura...');
    const html = await cloudscraper.get('https://asuracomic.net/?s=Omniscient+Reader');
    const $ = cheerio.load(html);
    
    // Sometimes Asura uses different layouts.
    // Let's dump major structures
    console.log('Found .bsx count:', $('.bsx').length);
    console.log('Found .listupd article count:', $('.listupd article').length);
    
    // Try to find the link for ORV
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && href.includes('/series/') && text.toLowerCase().includes('omniscient')) {
        console.log(`MATCH FOUND: Text: "${text}", Href: "${href}"`);
      }
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testAsura();
