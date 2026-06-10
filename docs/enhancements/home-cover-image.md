# Home Page Cover Image Enhancement

**Date:** June 10, 2026  
**Status:** Implemented  
**QA:** [TC-HOME-001](../qa/home-cover-image-enhancement.md)

## Summary

Replaced the home page feature image from a generic sunset photograph (`sun-color-2020-09-26.jpg`) with the Strolling Adventure book cover illustration (`cover-spread.png`).

## Screenshot (local verification)

Captured from `npm start` at `http://localhost:4200/` on June 10, 2026:

![Home page with book cover illustration](../screenshots/home-cover-image-enhancement.png)

## Changes

| Item | Before | After |
|------|--------|-------|
| Asset | `public/sun-color-2020-09-26.jpg` (~1.1 MB) | `public/cover-spread.png` (~283 KB) |
| Template | `src/app/home/home.html` | `src` updated to `cover-spread.png` |
| Alt text | "A beautiful sunset" | "Strolling Adventure book cover illustration" |
| Styling | `.feature-image` in `home.css` (unchanged) | Full-width, responsive |

## Files touched

- `public/cover-spread.png` — added
- `public/sun-color-2020-09-26.jpg` — removed
- `src/app/home/home.html` — image `src` and `alt` updated

## Asset guidance

- Place static images in `public/` and reference them with a root-relative path (no `public/` prefix), e.g. `src="cover-spread.png"`.
- Angular copies `public/**/*` to the build output root via `angular.json`.
- Prefer descriptive filenames for book or marketing assets (`cover-spread.png` rather than dated generic names).

## Local testing

```bash
npm start
```

Verify:

1. Home page loads at `http://localhost:4200/`
2. Cover illustration appears below the page title
3. `http://localhost:4200/cover-spread.png` returns HTTP 200
4. `http://localhost:4200/sun-color-2020-09-26.jpg` returns HTTP 404 (old asset removed)

## Deployment notes

No configuration changes required. Run a normal build and deploy:

```bash
npm run deploy
```

After deploy, confirm the live home page shows the cover image and that cached browsers receive the new asset (hard refresh if needed).

## Related documentation

- [QA test case TC-HOME-001](../qa/home-cover-image-enhancement.md)
- `architecture.md` — static asset table
- `blueprint.md` — home page feature description
