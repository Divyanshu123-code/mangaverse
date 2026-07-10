// src/services/anilist.service.js
import axios from "axios";
import { logger } from "../utils/logger.js";

const ANILIST_URL = "https://graphql.anilist.co";

export const getMangaMetadata = async (searchTitle) => {
  if (!searchTitle) return null;

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
      }
    }
  `;

  try {
    const { data } = await axios.post(ANILIST_URL, {
      query,
      variables: { search: searchTitle },
    }, { timeout: 8000 });

    const media = data?.data?.Media;
    if (!media) return null;

    return {
      id: media.id,
      titles: [
        media.title.english,
        media.title.romaji,
        ...(media.synonyms || [])
      ].filter(Boolean)
    };
  } catch (err) {
    logger.warn(`AniList metadata failed for "${searchTitle}":`, err.message);
    return null;
  }
};
