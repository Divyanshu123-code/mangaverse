// src/api/routes/manga.routes.js
import express from "express";
import * as mangaController from "../controllers/manga.controller.js";
import * as proxyController from "../controllers/proxy.controller.js";

const router = express.Router();

// Chapter aggregation
router.get("/chapters", mangaController.getChapters);

// Chapter images
router.get("/chapter-images", mangaController.getChapterImages);

// Image proxy
router.get("/proxy", proxyController.proxyImage);
router.get("/proxy-image", proxyController.proxyImage); // Legacy compatibility

export default router;
