# Screenshot Bot (GitHub Actions + Playwright)

This repo captures **full-page screenshots** for a preset list of URLs, on a schedule and on-demand, using **GitHub Actions** and **Playwright**.

## Files
- `urls.json` — put your page URLs here.
- `capture.mjs` — Playwright script to take full-page screenshots.
- `.github/workflows/screenshots.yml` — GitHub Actions workflow that runs weekly and supports manual runs.

## Quick Start (no local setup required)
1. Create a GitHub account and a new repository (public or private).
2. Upload all files from this folder to the repo (including the `.github/workflows/` folder).
3. Go to **Actions** → select **Capture screenshots** → **Run workflow** to test.
4. After the run finishes, open the run page and download the **artifact** (ZIP) containing screenshots.
5. Edit `urls.json` to add/remove pages, commit, and runs will use your updated list.

## Scheduling
The workflow runs every Monday at **13:00 UTC** (about **9:00 AM New York time**; DST may shift by an hour). Change the `cron` in `.github/workflows/screenshots.yml` if needed.
