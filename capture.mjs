import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { chromium } from "@playwright/test";
import path from "path";

// Load URLs
const urls = JSON.parse(readFileSync("./urls.json", "utf8"));

// Timestamped folder like: out/2025-10-28_13-00-00Z
const now = new Date();
const iso = now.toISOString().replace(/[:]/g, "-").replace(/\..+/, "Z");
const outDir = path.join("out", iso);
mkdirSync(outDir, { recursive: true });

// Utility to make a filename from a URL
const toName = (u) =>
  u
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+$/g, "");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

  for (const url of urls) {
    const page = await ctx.newPage();
    const name = toName(url);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(3000);

      // Try to dismiss common cookie banners (best-effort)
      const selectors = [
        'button[aria-label*="accept"]',
        'button:has-text("Accept")',
        'button:has-text("I Agree")',
        '#onetrust-accept-btn-handler',
      ];
      for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) {
          await el.click().catch(() => {});
          await page.waitForTimeout(500);
          break;
        }
      }

      const file = path.join(outDir, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Saved: ${file}`);
    } catch (err) {
      const logFile = path.join(outDir, `${name}__ERROR.txt`);
      writeFileSync(logFile, String(err));
      console.error(`Failed: ${url}`, err);
    } finally {
      await page.close();
    }
  }

  await ctx.close();
  await browser.close();
})();
