const axios = require('axios');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

async function searchFlame(title) {
  try {
    const q = title.replace(/\s+/g, '+').toLowerCase();
    const url = 'https://flamecomics.xyz/?s=' + q;
    console.log('Fetching', url);
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const firstUrl = $('.bsx a').first().attr('href');
    console.log('Flame found URL:', firstUrl);
  } catch(e) { console.error('Flame fail:', e.message); }
}

searchFlame("Omniscient Reader");
