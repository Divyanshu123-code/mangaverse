const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function testFlameNextData() {
  const { data } = await axios.get('https://flamecomics.xyz/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);
  const script = $('script[id="__NEXT_DATA__"]').html();
  const json = JSON.parse(script);
  const pp = json.props.pageProps;
  console.log('pageProps keys:', Object.keys(pp));
  
  // Inspect each key type
  Object.keys(pp).forEach(k => {
    const v = pp[k];
    console.log(k, '->', Array.isArray(v) ? `Array(${v.length})` : typeof v);
    if (Array.isArray(v) && v.length > 0) {
      console.log('  Sample item keys:', Object.keys(v[0]));
      console.log('  Sample:', v.slice(0,2).map(s => ({ id: s.series_id || s.id, title: s.title })));
    }
  });
}

async function testFlameChapters() {
  const { data } = await axios.get('https://flamecomics.xyz/series/2', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);
  const script = $('script[id="__NEXT_DATA__"]').html();
  const json = JSON.parse(script);
  const pp = json.props.pageProps;
  console.log('\n=== /series/2 pageProps keys:', Object.keys(pp));
  
  if (pp.series) {
    console.log('Series keys:', Object.keys(pp.series));
    console.log('ID field:', pp.series.series_id, pp.series.id);
  }
  if (pp.chapters) {
    const ch = Array.isArray(pp.chapters) ? pp.chapters : Object.values(pp.chapters);
    console.log('Chapters type:', typeof pp.chapters, Array.isArray(pp.chapters));
    console.log('Count:', ch.length);
    console.log('First:', ch[0]);
    console.log('Last:', ch[ch.length-1]);
  }
}

testFlameNextData().then(testFlameChapters).catch(console.error);
