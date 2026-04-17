// Services/browserService.js
// Manages a single shared Playwright browser instance.
// Reusing one browser across requests is ~10x faster than launching per-request.

import { chromium } from "playwright";

let browser = null;
let launching = false;
let launchQueue = [];

const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--disable-gpu",
];

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;

  // If already launching, queue up and wait
  if (launching) {
    return new Promise((resolve, reject) => {
      launchQueue.push({ resolve, reject });
    });
  }

  launching = true;
  try {
    console.log("🚀 Launching Playwright browser...");
    browser = await chromium.launch({
      headless: true,
      args: BROWSER_ARGS,
    });

    browser.on("disconnected", () => {
      console.warn("⚠️ Browser disconnected — will relaunch on next request");
      browser = null;
    });

    console.log("✅ Browser ready");
    launchQueue.forEach((p) => p.resolve(browser));
    launchQueue = [];
    return browser;
  } catch (err) {
    launchQueue.forEach((p) => p.reject(err));
    launchQueue = [];
    throw err;
  } finally {
    launching = false;
  }
}

/**
 * Opens a new page, navigates to the URL, waits for network idle,
 * then returns the page HTML. Closes the page after use.
 *
 * @param {string} url
 * @param {object} options
 * @param {string} [options.waitForSelector] - CSS selector to wait for before extracting HTML
 * @param {number} [options.timeout=20000] - Navigation timeout in ms
 * @param {string} [options.referer] - Optional Referer header
 * @returns {Promise<string>} - Full page HTML after JS execution
 */
export async function fetchWithBrowser(url, options = {}) {
  const { waitForSelector, timeout = 20000, referer } = options;
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    extraHTTPHeaders: referer ? { Referer: referer } : {},
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout,
    });

    // If a specific element is expected, wait for it
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 8000 }).catch(() => {
        console.warn(`⚠️ Selector "${waitForSelector}" not found on ${url}`);
      });
    }

    const html = await page.content();
    return html;
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * Same as fetchWithBrowser but returns the evaluated JS result instead of HTML.
 * Useful for extracting data from window.__NEXT_DATA__ or similar.
 *
 * @param {string} url
 * @param {Function} evalFn - Function to evaluate in browser context
 * @param {object} options
 */
export async function evalWithBrowser(url, evalFn, options = {}) {
  const { timeout = 20000, referer } = options;
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    extraHTTPHeaders: referer ? { Referer: referer } : {},
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout });
    const result = await page.evaluate(evalFn);
    return result;
  } finally {
    await page.close();
    await context.close();
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (browser) await browser.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  if (browser) await browser.close();
  process.exit(0);
});
