const API_BASE = "https://api.mangadex.org";
const FALLBACK_COVER =
  "https://placehold.co/512x720/0b1220/FFFFFF?text=No+Cover";

async function requestJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MangaDex API error: ${res.status} — ${text}`);
  }
  return res.json();
}

// ✅ Sync cover builder — uses relationships already included in the response
function getCoverSync(mangaId, relationships = []) {
  const cover = relationships.find((r) => r.type === "cover_art");
  if (cover?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.512.jpg`;
  }
  return FALLBACK_COVER;
}

// ✅ Async cover builder — used only when cover_art wasn't included (detail page fallback)
async function getCover(mangaId, relationships = []) {
  const cover = relationships.find((r) => r.type === "cover_art");
  if (cover?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.512.jpg`;
  }
  try {
    const res = await fetch(`${API_BASE}/cover?manga[]=${mangaId}`);
    const data = await res.json();
    const coverFile = data?.data?.[0]?.attributes?.fileName;
    if (coverFile)
      return `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}.512.jpg`;
  } catch (err) {
    console.warn("⚠️ Failed to fetch cover separately:", err);
  }
  return FALLBACK_COVER;
}

// ✅ English title extraction
function getEnglishTitle(attributes) {
  if (!attributes) return "Untitled";
  if (attributes.title?.en) return attributes.title.en;
  if (Array.isArray(attributes.altTitles)) {
    const altEn = attributes.altTitles.find((t) => t.en);
    if (altEn?.en) return altEn.en;
  }
  const vals = Object.values(attributes.title || {});
  for (const v of vals) if (v && typeof v === "string") return v;
  return "Untitled";
}

// ✅ Universal fetch for lists (used by everything)
async function fetchManga(params = {}) {
  const buildUrl = ({ includeEnglish = true } = {}) => {
    const url = new URL(`${API_BASE}/manga`);
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.set("limit", String(params.limit || 20));
    if (params.offset) url.searchParams.set("offset", String(params.offset));
    if (includeEnglish) url.searchParams.append("availableTranslatedLanguage[]", "en");

    if (params["originalLanguage[]"]) {
      url.searchParams.append("originalLanguage[]", params["originalLanguage[]"]);
    }
    if (params.title) url.searchParams.set("title", params.title);
    if (params.status) url.searchParams.append("status[]", params.status);
    if (params.demographic) {
      url.searchParams.append("publicationDemographic[]", params.demographic);
    }
    if (Array.isArray(params.genres) && params.genres.length > 0) {
      params.genres.forEach((id) => url.searchParams.append("includedTags[]", id));
    }

    Object.entries(params).forEach(([key, value]) => {
      if (!key.startsWith("order[") || value == null) return;
      url.searchParams.append(key, value);
    });

    return url.toString();
  };

  const primaryUrl = buildUrl({ includeEnglish: true });
  console.log("📡 MangaDex request:", primaryUrl);

  let data;
  try {
    data = await requestJson(primaryUrl);
  } catch (error) {
    console.warn("⚠️ Primary MangaDex request failed:", error);
    const fallbackUrl = buildUrl({ includeEnglish: false });
    console.log("📡 MangaDex fallback request:", fallbackUrl);
    data = await requestJson(fallbackUrl);
  }

  if ((data.data?.length ?? 0) === 0) {
    const fallbackUrl = buildUrl({ includeEnglish: false });
    if (fallbackUrl !== primaryUrl) {
      console.log("📡 MangaDex empty result fallback:", fallbackUrl);
      const fallbackData = await requestJson(fallbackUrl);
      if ((fallbackData.data?.length ?? 0) > 0) {
        data = fallbackData;
      }
    }
  }

  console.log(`✅ MangaDex returned ${data.data?.length ?? 0} results`);

  return (data.data || []).map((m) => ({
    id: m.id,
    title: getEnglishTitle(m.attributes),
    description:
      m.attributes?.description?.en ||
      Object.values(m.attributes?.description || {})[0] ||
      "",
    status: m.attributes?.status || "unknown",
    year: m.attributes?.year || "N/A",
    cover: getCoverSync(m.id, m.relationships),
  }));
}

// ✅ Section fetchers
export async function fetchTopRated(lang = "ja") {
  return fetchManga({
    "originalLanguage[]": lang,
    "order[rating]": "desc",
    limit: 20,
  });
}

export async function fetchTrending(lang = "ja") {
  return fetchManga({
    "originalLanguage[]": lang,
    "order[followedCount]": "desc",
    limit: 20,
  });
}

export async function fetchRecentlyUpdated(lang = "ja") {
  return fetchManga({
    "originalLanguage[]": lang,
    "order[updatedAt]": "desc",
    limit: 20,
  });
}
export async function fetchMangaById(mangaId) {
  const url = new URL(`${API_BASE}/manga/${mangaId}`);
  url.searchParams.append("includes[]", "cover_art");
  url.searchParams.append("includes[]", "author");
  url.searchParams.append("includes[]", "artist");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const m = data.data;

  return {
    id: m.id,
    title: getEnglishTitle(m.attributes),
    description:
      m.attributes?.description?.en ||
      Object.values(m.attributes?.description || {})[0] ||
      "No description available.",
    status: m.attributes?.status || "unknown",
    year: m.attributes?.year || "N/A",
    cover: await getCover(m.id, m.relationships),
    authors: m.relationships
      .filter((r) => r.type === "author")
      .map((a) => a.attributes?.name)
      .filter(Boolean),
    artists: m.relationships
      .filter((r) => r.type === "artist")
      .map((a) => a.attributes?.name)
      .filter(Boolean),
    genres: (m.attributes?.tags || []).map(
      (t) => t.attributes?.name?.en || "Unknown"
    ),
  };
}

// ✅ Paginated Chapter Fetch
export async function fetchChaptersForManga(mangaId, limit = 100) {
  const allChapters = [];
  let offset = 0;
  let total = 0;

  do {
    const sp = new URLSearchParams();
    sp.set("manga", mangaId);
    sp.set("limit", String(limit));
    sp.set("offset", String(offset));

    const res = await fetch(`${API_BASE}/chapter?${sp.toString()}&order[chapter]=asc`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    total = data.total || 0;
    allChapters.push(...(data.data || []));
    offset += limit;
  } while (offset < total);

  const chaptersByNumber = new Map();
  allChapters.forEach((ch) => {
    const chapterValue = ch.attributes?.chapter;
    const numericChapter =
      chapterValue !== null && chapterValue !== undefined
        ? parseFloat(chapterValue)
        : NaN;

    if (Number.isNaN(numericChapter)) return;

    const normalized = {
      id: ch.id,
      chapter: chapterValue,
      title: ch.attributes?.title || "",
      pages: ch.attributes?.pages || 0,
      readableAt: ch.attributes?.readableAt,
      lang: ch.attributes?.translatedLanguage || "unknown",
    };

    if (!chaptersByNumber.has(numericChapter)) {
      chaptersByNumber.set(numericChapter, normalized);
      return;
    }

    const existing = chaptersByNumber.get(numericChapter);
    if (existing.lang !== "en" && normalized.lang === "en") {
      chaptersByNumber.set(numericChapter, normalized);
    }
  });

  const chapters = Array.from(chaptersByNumber.values());

  return {
    total: chapters.length,
    chapters: chapters.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter)),
  };
}

// ✅ Search API (used by SearchPage)
export async function fetchMangaList(filters = {}, limit = 20, offset = 0) {
  return fetchManga({
    ...filters,
    limit,
    offset,
    "order[relevance]": "desc",
  });
}

// ✅ Export fetchManga for internal use (required by SearchPage)
export { fetchManga };
