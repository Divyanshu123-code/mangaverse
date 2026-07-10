// src/utils/proxy.utils.js

export const getHeadersForSource = (source, url) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  };

  if (source === "asura") {
    headers["Referer"] = "https://asuracomic.net/";
  } else if (source === "flame") {
    headers["Referer"] = "https://flamecomics.xyz/";
  } else if (source === "mangahub" || url.includes("mghcdn.com")) {
    headers["Referer"] = "https://1manga.co/";
  } else if (source === "manganato") {
    headers["Referer"] = "https://manganato.com/";
  } else if (source === "mangadex") {
    headers["Referer"] = "https://mangadex.org/";
  }

  return headers;
};
