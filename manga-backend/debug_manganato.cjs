const axios = require('axios');
const cheerio = require('cheerio');

async function testManganato(title) {
  const query = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const searchUrl = `https://manganato.com/search/story/${query}`;
  console.log('Search URL:', searchUrl);

  try {
    const { data } = await axios.get(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);
    console.log('Items found:', $(".search-story-item").length);
    
    $(".search-story-item").each((i, el) => {
      console.log('--- Item', i + 1);
      console.log('Title:', $(el).find(".item-title").text().trim());
      console.log('Url:', $(el).find(".item-title").attr("href"));
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testManganato("Omniscient Reader's Viewpoint");
