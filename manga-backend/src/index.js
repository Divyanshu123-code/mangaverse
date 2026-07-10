// src/index.js
import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const server = app.listen(config.port, () => {
  logger.success(`
  🚀 MANGAVERSE BACKEND REDESIGNED & RUNNING
  -----------------------------------------
  Version: 2.0.0 (Modular Engine)
  Port:    ${config.port}
  Mode:    ${config.env}
  -----------------------------------------
  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});
