// src/utils/logger.js
const levels = {
  info: "🔵 INFO",
  warn: "🟡 WARN",
  error: "🔴 ERROR",
  success: "🟢 SUCCESS"
};

const log = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${levels[level] || "⚪️"}: ${message}`, ...args);
};

export const logger = {
  info: (msg, ...args) => log("info", msg, ...args),
  warn: (msg, ...args) => log("warn", msg, ...args),
  error: (msg, ...args) => log("error", msg, ...args),
  success: (msg, ...args) => log("success", msg, ...args),
};
