// controllers/proxyController.js
import axios from "axios";
import { getHeadersForSource } from "../utils/proxyUtils.js";

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
];

export const proxyImage = async (req, res) => {
  const { url, source } = req.query;
  if (!url) return res.status(400).send("No URL provided");

  const refererVariants = [
    getHeadersForSource(source, url)["Referer"],
    "https://mangahub.io/",
    "https://1manga.co/",
    "https://manganato.com/",
    "" // No referer as last resort
  ].filter((v, i, a) => a.indexOf(v) === i);

  const tryRequest = async (attempt = 0, refererIdx = 0) => {
    try {
      const headers = getHeadersForSource(source, url);
      headers["User-Agent"] = USER_AGENTS[attempt % USER_AGENTS.length];
      if (refererIdx < refererVariants.length) {
          headers["Referer"] = refererVariants[refererIdx];
      }

      const response = await axios.get(url, {
        headers,
        responseType: "stream",
        timeout: 15000,
        validateStatus: (status) => status < 400
      });

      res.set("Content-Type", response.headers["content-type"] || "image/jpeg");
      res.set("Cache-Control", "public, max-age=604800, immutable");
      response.data.pipe(res);
    } catch (error) {
      const is403 = error.response?.status === 403;
      
      if (is403 && refererIdx < refererVariants.length - 1) {
          console.warn(`🛡️ 403 detected. Trying alternate referer: ${refererVariants[refererIdx + 1]}`);
          return tryRequest(attempt, refererIdx + 1);
      }

      if (attempt < 2 && !is403) {
        console.warn(`🔄 Retrying proxy for ${url} (Attempt ${attempt + 1})`);
        return tryRequest(attempt + 1, refererIdx);
      }
      
      console.error(`❌ Proxy failed for ${url}: ${error.message}`);
      res.status(error.response?.status || 500).send("Proxy error");
    }
  };

  await tryRequest();
};
