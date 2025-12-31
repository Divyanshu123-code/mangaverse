// src/Api/tagService.js
const TAGS_API = "https://api.mangadex.org/manga/tag";

let tagCache = null;

export async function fetchTags() {
  if (tagCache) return tagCache; // ✅ return cached

  const res = await fetch(TAGS_API);
  if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status}`);

  const data = await res.json();

  tagCache = data.data.map(tag => ({
    id: tag.id,                                // UUID
    name: tag.attributes?.name?.en || "Unknown", // English name
  }));

  return tagCache;
}

// Map human name → UUID
export async function getTagIdByName(name) {
  const tags = await fetchTags();
  const match = tags.find(t => 
    t.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.id : null;
}