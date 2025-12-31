// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAllChaptersScraped } from "./Scrapers/index.js";
import { getChaptersFromAsura } from "./Scrapers/Asura.js";
import { getChaptersFromFlame } from "./Scrapers/Flame.js";
import { getChaptersFromMangadex } from "./Scrapers/Mangadex.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// ============================
// 🧩 Middleware
// ============================
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// ============================
// ✅ Health Check Route
// ============================
app.get("/", (req, res) => {
  res.json({ message: "🔥 MangaVerse Backend API is running!" });
});

// ============================
// 🧠 Unified Chapter Fetcher
// ============================
// Example: /api/chapters?mangaId=abc123&slug=the-beginning-after-the-end
app.get("/api/chapters", async (req, res) => {
  const { mangaId, slug } = req.query;

  if (!mangaId && !slug) {
    return res.status(400).json({
      error: "Missing required parameters: 'mangaId' or 'slug'.",
    });
  }

  try {
    console.log(`🔍 Fetching chapters for:`, { mangaId, slug });

    const chapters = await getAllChaptersScraped(mangaId, slug);

    if (!Array.isArray(chapters) || chapters.length === 0) {
      console.warn(`⚠️ No chapters found for ${slug || mangaId}`);
      return res.status(404).json({ message: "No chapters found." });
    }

    res.status(200).json({
      success: true,
      total: chapters.length,
      chapters,
    });
  } catch (error) {
    console.error("❌ Error in /api/chapters:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chapters from scanners.",
      details: error.message,
    });
  }
});

// ============================
// 🧩 Individual Scanner Routes
// ============================

app.get("/api/mangadex/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📚 Fetching MangaDex chapters for ${id}`);
    const chapters = await getChaptersFromMangadex(id);
    res.json({ source: "mangadex", total: chapters.length, chapters });
  } catch (err) {
    console.error("❌ MangaDex error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/asura/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`📘 Fetching Asura chapters for ${slug}`);
    const chapters = await getChaptersFromAsura(slug);
    res.json({ source: "asura", total: chapters.length, chapters });
  } catch (err) {
    console.error("❌ Asura error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/flame/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🔥 Fetching FlameScans chapters for ${slug}`);
    const chapters = await getChaptersFromFlame(slug);
    res.json({ source: "flame", total: chapters.length, chapters });
  } catch (err) {
    console.error("❌ FlameScans error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// 🚀 Start Server
// ============================
app.listen(PORT, () => {
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`
📡 Endpoints:
  • GET /api/chapters?mangaId=abc&slug=slug-name
  • GET /api/mangadex/:id
  • GET /api/asura/:slug
  • GET /api/flame/:slug
  `);
});