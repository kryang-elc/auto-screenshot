// capture.mjs — human-like Playwright capture with full-page screenshots
// Works with urls.json in the same folder. Outputs to out/<timestamp>/.

// --- imports ---
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium /*, firefox, webkit */ } from "@playwright/test";

// --- paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = p
