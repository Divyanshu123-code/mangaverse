// services/aniListService.js
import axios from "axios";

const ANILIST_URL = "https://graphql.anilist.co";

export async function getMangaMetadata(title) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: MANGA) {
        id
        title {
          romaji
          english
          native
        }
        synonyms
        description
        coverImage {
          extraLarge
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_URL, {
      query,
      variables: { search: title }
    }, { timeout: 5000 });

    const media = response.data?.data?.Media;
    if (!media) return null;

    const allTitles = [
      media.title.english,
      media.title.romaji,
      media.title.native,
      ...media.synonyms
    ].filter(Boolean);

    return {
      id: media.id,
      titles: [...new Set(allTitles)],
      cover: media.coverImage.extraLarge,
      description: media.description
    };
  } catch (err) {
    console.warn("AniList check failed:", err.message);
    return null;
  }
}
