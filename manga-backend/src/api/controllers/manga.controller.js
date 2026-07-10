import * as mangaService from "../../services/manga.service.js";
import { logger } from "../../utils/logger.js";

export const getChapters = async (req, res, next) => {
  try {
    const { mangaId, slug, title, refresh } = req.query;
    if (!mangaId && !slug) {
      return res.status(400).json({ status: "error", message: "Missing mangaId or slug" });
    }

    const chapters = await mangaService.fetchChapters(
      mangaId,
      slug,
      title,
      refresh === "1" || refresh === "true"
    );
    
    res.json({
      status: "success",
      count: chapters.length,
      chapters
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterImages = async (req, res, next) => {
  try {
    const { source, url, chapterId, mangaTitle, chapterNumber, mangaId } = req.query;
    if (!source) {
      return res.status(400).json({ status: "error", message: "Missing source" });
    }

    const payload = { url, chapterId, chapterNumber: parseFloat(chapterNumber) };
    const images = await mangaService.fetchImages(source, payload, mangaTitle, mangaId);

    res.json({
      status: "success",
      count: images.length,
      images
    });
  } catch (error) {
    next(error);
  }
};
