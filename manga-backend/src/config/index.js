// src/config/index.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5050,
  env: process.env.NODE_ENV || "development",
  cors: {
    origin: "*", // For development, customize for production
    methods: ["GET", "POST", "OPTIONS"],
  },
  cache: {
    chapterTTL: 30 * 60 * 1000, // 30 minutes
    imageTTL: 24 * 60 * 60 * 1000, // 24 hours
  },
  browser: {
    timeout: 30000,
    navigationWait: "domcontentloaded",
  }
};
