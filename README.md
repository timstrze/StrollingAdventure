# GiGi's Strolling Adventure

Marketing and activity site for **Strolling Adventure**, a Christian children's book by Gloria Taylor Crone. The site promotes the book, links to retailers and a YouTube music playlist, and offers free printable maze and word search puzzles plus nature learning pages inspired by walks in Yorktown, Virginia.

**Live site:** [https://www.strollingadventure.com](https://www.strollingadventure.com)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Angular 20 (standalone components, signals) |
| Rendering | Static prerender (Angular SSR) |
| Hosting | Firebase Hosting |
| Language | TypeScript (strict mode) |

## Getting started

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build → dist/myapp/browser
npm test           # Karma unit tests
npm run deploy     # build and deploy to Firebase Hosting
```

## Routes

| Path | Page |
|------|------|
| `/` | Home — book cover, buy links, activities, learn preview |
| `/about` | About the book |
| `/about/author` | Author bio |
| `/about/illustrators` | Illustrator credits |
| `/activities` | Activities hub (maze and word search) |
| `/maze` | Interactive printable maze |
| `/wordsearch` | Interactive printable word search |
| `/learn` | Nature topics hub |
| `/learn/:slug` | Individual nature topic (10 topics) |

## Project documentation

| Document | Purpose |
|----------|---------|
| [`architecture.md`](./architecture.md) | System architecture, structure, and conventions |
| [`blueprint.md`](./blueprint.md) | Product overview and implemented features |
| [`GEMINI.md`](./GEMINI.md) | AI developer conventions for Angular |
| [`docs/README.md`](./docs/README.md) | Feature notes, QA cases, and agent instructions |

## Deployment

Production builds are prerendered static HTML and deployed to Firebase Hosting:

```bash
npm run deploy
```

Output directory: `dist/myapp/browser` (configured in `firebase.json`).
