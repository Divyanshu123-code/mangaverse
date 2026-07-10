const axios = require('axios');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

async function testFlame() {
  try {
    const q = 'Omniscient Reader';
    const { data } = await axios.get('https://flamecomics.xyz/?s=' + encodeURIComponent(q));
    const $ = cheerio.load(data);
    const url = $('.bsx a').first().attr('href');
    console.log('Flame matched URL:', url);
  } catch(e) { console.error('Flame error:', e.message); }
}

async function testAsura() {
  try {
    const q = 'Omniscient Reader';
    const data = await cloudscraper.get('https://asuracomic.net/?s=' + encodeURIComponent(q));
    const $ = cheerio.load(data);
    const url = $('.bsx a').first().attr('href');
    console.log('Asura matched URL:', url);
  } catch(e) { console.error('Asura error:', e.message); }
}

testFlame().then(testAsura);
