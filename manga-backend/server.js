// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as mangaController from "./controllers/mangaController.js";
import * as proxyController from "./controllers/proxyController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// ============================
// 🧩 Middleware
// ============================
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost:")) return callback(null, true);
    callback(null, true); // Permissive for local dev
  },
  methods: ["GET"],
}));

app.use(express.json());

// ============================
// 📡 API V1 Routes (Standardized)
// ============================

// 1. Unified Manga/Manhwa Chapters
app.get("/api/v1/chapters", mangaController.getChapters);

// 2. Chapter Images (with fallback logic)
app.get("/api/v1/chapter-images", mangaController.getChapterImages);

// 3. Robust Image Proxy
app.get("/api/v1/proxy", proxyController.proxyImage);

// Legacy routes for backward compatibility with frontend
app.get("/api/chapters", mangaController.getChapters);
app.get("/api/chapter-images", mangaController.getChapterImages);
app.get("/api/proxy-image", proxyController.proxyImage);

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MangaVerse Engine Standardized API v1" });
});

// ============================
// 🚀 Start Server
// ============================
app.listen(PORT, () => {
  console.log(`
  🚀 API REDESIGNED & RUNNING
  ---------------------------
  Local:   http://localhost:${PORT}
  Service: Standardized Manga Engine
  Caching: Active
  ---------------------------
  `);
});