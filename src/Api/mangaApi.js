const API_BASE = "https://api.mangadex.org";
const FALLBACK_COVER =
  "https://placehold.co/512x720/0b1220/FFFFFF?text=No+Cover";

// ✅ Build cover URL safely
async function getCover(mangaId, relationships = []) {
  let cover = relationships.find((r) => r.type === "cover_art");

  if (!cover?.attributes?.fileName) {
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

  return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.512.jpg`;
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
  const url = new URL(`${API_BASE}/manga`);
  url.searchParams.set("limit", params.limit || 20);
  url.searchParams.set("availableTranslatedLanguage[]", "en");
  url.searchParams.set("includes[]", "cover_art");

  // 🔍 Add filters
  if (params.title) url.searchParams.set("title", params.title);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.type) url.searchParams.set("originalLanguage[]", getLangFromType(params.type));
  if (params.demographic) url.searchParams.set("publicationDemographic", params.demographic);
  if (Array.isArray(params.genres) && params.genres.length > 0) {
    params.genres.forEach((genreId) => url.searchParams.append("includedTags[]", genreId));
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || ["title", "status", "type", "demographic", "genres"].includes(key)) return;
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
    else url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  return Promise.all(
    (data.data || []).map(async (m) => ({
      id: m.id,
      title: getEnglishTitle(m.attributes),
      description:
        m.attributes?.description?.en ||
        Object.values(m.attributes?.description || {})[0] ||
        "",
      status: m.attributes?.status || "unknown",
      year: m.attributes?.year || "N/A",
      cover: await getCover(m.id, m.relationships),
    }))
  );
}

// 🈯️ Helper to map type → language
function getLangFromType(type) {
  switch (type) {
    case "manga":
      return "ja";
    case "manhwa":
      return "ko";
    case "manhua":
      return "zh";
    default:
      return null;
  }
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

// ✅ Full Manga Details
export async function fetchMangaById(mangaId) {
  const url = new URL(`${API_BASE}/manga/${mangaId}`);
  url.searchParams.set("includes[]", "cover_art");
  url.searchParams.set("includes[]", "author");
  url.searchParams.set("includes[]", "artist");

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
    const url = new URL(`${API_BASE}/chapter`);
    url.searchParams.set("manga", mangaId);
    url.searchParams.append("translatedLanguage[]", "en");
    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);
    url.searchParams.set("order[chapter]", "asc");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    total = data.total || 0;
    allChapters.push(...(data.data || []));
    offset += limit;
  } while (offset < total);

  const chapters = allChapters.map((ch) => ({
    id: ch.id,
    chapter: ch.attributes?.chapter || "?",
    title: ch.attributes?.title || "",
    pages: ch.attributes?.pages || 0,
    readableAt: ch.attributes?.readableAt,
  }));

  return {
    total,
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