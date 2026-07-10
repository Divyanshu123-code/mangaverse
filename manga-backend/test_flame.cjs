const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('flame_search.html', 'utf-8');
const $ = cheerio.load(html);
const script = $('script[id="__NEXT_DATA__"]').html();
if(script) {
  const json = JSON.parse(script);
  console.log(JSON.stringify(Object.keys(json.props.pageProps), null, 2));
  const series = json.props.pageProps.series || json.props.pageProps.results || [];
  const match = series.find
    ? series.find(s => s.title && s.title.toLowerCase().includes('omniscient'))
    : null;
  console.log('Match:', match);
  if (!match) {
    console.log('All titles:', series.slice(0,20).map(s => s.title));
  }
} else {
  console.log('No __NEXT_DATA__ script tag found');
}
