// src/services/browser.service.js
import { chromium } from "playwright";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

let browser = null;
let launchPromise = null;

async function getBrowser() {
  if (browser) return browser;
  if (launchPromise) return launchPromise;

  launchPromise = (async () => {
    logger.info("🚀 Launching Playwright browser instance...");
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    return browser;
  })();

  return launchPromise;
}

export async function fetchWithBrowser(url, options = {}) {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  try {
    if (options.referer) {
      await page.setExtraHTTPHeaders({ Referer: options.referer });
    }

    await page.goto(url, {
      waitUntil: options.waitUntil || config.browser.navigationWait,
      timeout: options.timeout || config.browser.timeout,
    });

    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: options.timeout || 10000 }).catch(() => null);
    }

    const html = await page.content();
    return html;
  } finally {
    await page.close();
    await context.close();
  }
}

export async function evalWithBrowser(url, evalFn, options = {}) {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  try {
    if (options.referer) {
      await page.setExtraHTTPHeaders({ Referer: options.referer });
    }

    await page.goto(url, {
      waitUntil: options.waitUntil || config.browser.navigationWait,
      timeout: options.timeout || config.browser.timeout,
    });

    if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => null);
    }

    return await page.evaluate(evalFn);
  } finally {
    await page.close();
    await context.close();
  }
}
