// controllers/mangaController.js
import * as mangaService from "../Services/mangaService.js";

export const getChapters = async (req, res) => {
  try {
    const { mangaId, slug, title } = req.query;
    if (!mangaId && !slug) {
      return res.status(400).json({ status: "error", message: "Missing mangaId or slug" });
    }

    const chapters = await mangaService.fetchChapters(mangaId, slug, title);
    
    res.json({
      status: "success",
      count: chapters.length,
      chapters,                                        // MangaDetailPage expects "chapters"
      data: chapters                                   // keep for backward compat
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getChapterImages = async (req, res) => {
  try {
    const { source, url, chapterId, mangaTitle, chapterNumber, mangaId } = req.query;
    if (!source) {
      return res.status(400).json({ status: "error", message: "Missing source" });
    }

    let slug = "";
    let num = parseFloat(chapterNumber);
    if (url && (source === "mangahub" || source === "manganato")) {
      const parts = url.split("/");
      slug = parts[parts.length - 2];
      if (isNaN(num)) {
        const chPart = parts[parts.length - 1];
        num = parseFloat(chPart.replace("chapter-", ""));
      }
    }

    const payload = { url, chapterId, slug, chapterNumber: num };
    const images = await mangaService.fetchImages(source, payload, mangaTitle, mangaId);

    res.json({
      status: "success",
      count: images.length,
      images,                                          // ReaderPage expects "images"
      data: images,                                    // keep for backward compat
      fallbackMode: images.length === 0 ? "failed" : "ok"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
