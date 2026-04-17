// utils/proxyUtils.js
export const getHeadersForSource = (source, url) => {
  const common = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };

  const specific = {};
  if (source === "manganato") {
    specific["Referer"] = url?.includes("chapmanganato") ? "https://chapmanganato.com/" : "https://manganato.com/";
  } else if (source === "mangakakalot") {
    specific["Referer"] = "https://mangakakalot.com/";
  } else if (source === "mangahub" || source === "1manga") {
    specific["Referer"] = "https://1manga.co/";
    specific["Origin"] = "https://1manga.co";
  } else if (source === "flame") {
    specific["Referer"] = "https://flamecomics.xyz/";
  } else if (source === "asura") {
    specific["Referer"] = url?.includes("asurascans") ? "https://asurascans.com/" : "https://asuracomic.net/";
  } else if (source === "mangadex") {
    specific["Referer"] = "https://mangadex.org/";
  }

  return { ...common, ...specific };
};
