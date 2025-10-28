// capture.mjs — Playwright full-page screenshots with human-like context
// Uses urls.json in repo root. Outputs to out/<timestamp>/.

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { chromium /*, firefox, webkit */ } from "@playwright/test";

// --- base paths (no __dirname needed) ---
const baseDir = process.cwd();

// --- load URLs ---
const urls = JSON.parse(readFileSync(path.join(baseDir, "urls.json"), "utf8"));

// --- timestamped output dir ---
const now = new Date();
const iso = now.toISOString().replace(/:/g, "-").replace(/\..+/, "Z");
const outDir = path.join(baseDir, "out", iso);
mkdirSync(outDir, { recursive: true });

// --- helpers ---
const toName = (u) =>
  u.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").replace(/_+$/g, "");

async function dismissCommonPopups(page) {
  const selectors = [
    '#onetrust-accept-btn-handler',
    'button[aria-label*="accept"]',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("I Agree")',
    'button:has-text("Continue")',
    'button:has-text("Got it")',
  ];
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);
      }
    } catch {}
  }
}

const snooze = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (base, spread = 400) => base + Math.floor(Math.random() * spread);

// --- main capture routine ---
async function captureWithChromium(url) {
  const browser = await chromium.launch({ headless: true });

  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit(537.36) Chrome/120 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/New_York",
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
    javaScriptEnabled: true,
  });

  const page = await ctx.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1",
    DNT: "1",
  });

  await snooze(jitter(500));

  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await dismissCommonPopups(page);
  await page.waitForTimeout(jitter(3000, 1500));

  const file = path.join(outDir, `${toName(url)}.png`);
  await page.screenshot({ path: file, fullPage: true });

  await ctx.close();
  await browser.close();

  return file;
}

async function captureOne(url) {
  try {
    const file = await captureWithChromium(url);
    console.log(`Saved: ${file}`);
  } catch (err) {
    const logFile = path.join(outDir, `${toName(url)}__ERROR.txt`);
    writeFileSync(logFile, String(err?.stack || err || "Unknown error"));
    console.error(`Failed: ${url}\n${err}`);
  }
}

(async () => {
  console.log(`Output folder: ${outDir}`);
  for (const url of urls) {
    await captureOne(url);
    await snooze(jitter(1200, 1000)); // small gap between sites
  }
})();
