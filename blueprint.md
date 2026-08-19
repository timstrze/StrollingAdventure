# Strolling Adventure — App Blueprint

## Overview

**GiGi's Strolling Adventure** is a multi-page Angular site for the children's book *Strolling Adventure* by Gloria Taylor Crone. It promotes the book, links to purchase options and a YouTube music playlist, and provides free interactive activities and nature learning content inspired by strolls in Yorktown, Virginia.

**Live URL:** [https://www.strollingadventure.com](https://www.strollingadventure.com)

## Implemented Features

### Home (`/`)

- Split title typography ("GiGi's Strolling" script + "Adventure" caps)
- Book cover illustration (`cover-spread.png`)
- Parallax cloud layers with kite (back and front layers scroll at different speeds)
- **Buy the Book** section with Barnes & Noble, Amazon, and Xulon Press links
- **About the Book** summary with link to `/about` and YouTube playlist link
- **Activities** cards linking to maze and word search
- **Explore Nature** section linking to `/learn`
- Site footer with navigation and YouTube music link
- SEO meta tags and Book JSON-LD schema

### About pages

| Route | Content |
|-------|---------|
| `/about` | Book synopsis, themes, and purchase links |
| `/about/author` | Gloria Taylor Crone author bio |
| `/about/illustrators` | Illustrator credits |

All about pages use shared content-page styling and per-page SEO metadata.

### Activities

| Route | Content |
|-------|---------|
| `/activities` | Hub page describing maze and word search |
| `/maze` | Canvas-based maze generator with easy/medium/hard difficulty, scoring, high scores, solution reveal, and print layout |
| `/wordsearch` | Interactive word search with easy/medium/hard difficulty, word selection, scoring, high scores, answer overlay, and print layout |

Both games persist high scores in `localStorage` via `game-scores.ts`.

### Learn / nature topics

| Route | Content |
|-------|---------|
| `/learn` | Hub listing all 10 nature topics |
| `/learn/:slug` | Individual topic pages with educational content, book quotes, external sources, and CTAs |

Topics: sun, trees, clouds, squirrels, birds, honeybees, butterflies, flowers, pinecones, friends.

### SEO and discoverability

- `SeoService` sets title, description, Open Graph, Twitter, and canonical URL per route
- Book JSON-LD on home and about pages
- `public/sitemap.xml` and `public/robots.txt`
- Static prerender of all routes via Angular SSR (`outputMode: "static"`)

### Shared UI

- `SiteFooter` — site navigation, YouTube music link, buy link anchor
- `CloudParallaxBack` / `CloudParallaxFront` — homepage parallax decoration
- `content-page.css` — shared styles for content pages (about, learn, activities)
- Global print styles in `src/styles.css` (hide chrome, show print footer)

### Style and design

- Page background: soft green (`--page-bg: #cce4c6`)
- Home typography: Lobster script title, Bebas Neue caps, Inter body
- OKLCH color tokens on home page for accents and activity cards
- Responsive layout with mobile-friendly activity cards and game grids
- Print-friendly layouts for maze and word search (buttons hidden, puzzle-only output)

## Deployment

- **Hosting:** Firebase Hosting (`firebase.json` → `dist/myapp/browser`)
- **Deploy command:** `npm run deploy`
- **Prerender routes:** defined in `app.routes.server.ts` and mirrored in `prerender-routes.txt`

## Current Plan

No active development plan. The application is in a stable state with home, about, activities, games, learn content, SEO, and Firebase deployment all implemented.
