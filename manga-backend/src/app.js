// src/app.js
import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import mangaRoutes from "./api/routes/manga.routes.js";

const app = express();

// Middlewares
app.use(cors(config.cors));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1", mangaRoutes);
// Legacy compatibility
app.use("/api", mangaRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "MangaVerse Engine", version: "2.0.0" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

export default app;
