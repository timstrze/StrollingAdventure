# GiGi's Strolling Adventure — Architecture

This document describes the system architecture, conventions, and operational context for **GiGi's Strolling Adventure** (internal CLI project name: `myapp`). It is intended for human developers and AI assistants working on the codebase.

For product intent and implemented features, see [`blueprint.md`](./blueprint.md). For Angular coding standards enforced by AI tooling, see [`GEMINI.md`](./GEMINI.md).

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Project Structure](#4-project-structure)
5. [Application Bootstrap](#5-application-bootstrap)
6. [Routing](#6-routing)
7. [Components & Features](#7-components--features)
8. [Services & Shared Utilities](#8-services--shared-utilities)
9. [State Management](#9-state-management)
10. [Styling & Design System](#10-styling--design-system)
11. [Static Assets & SEO](#11-static-assets--seo)
12. [SSR, Prerendering & Deployment](#12-ssr-prerendering--deployment)
13. [Configuration & Build](#13-configuration--build)
14. [Development Environment](#14-development-environment)
15. [Testing Strategy](#15-testing-strategy)
16. [Coding Conventions](#16-coding-conventions)
17. [Extending the Application](#17-extending-the-application)
18. [Known Gaps & Technical Debt](#18-known-gaps--technical-debt)
19. [Related Documentation](#19-related-documentation)

---

## 1. System Overview

**GiGi's Strolling Adventure** is a client-side Angular application that is **prerendered to static HTML** at build time and deployed as static files to Firebase Hosting. There is no custom backend API in this repository; the Express server in `src/server.ts` is used only for SSR/prerender tooling and optional local SSR serving.

| Attribute | Value |
|-----------|-------|
| **Type** | Multi-page SPA with prerendered routes |
| **Deployment model** | Static files (HTML/JS/CSS) on Firebase Hosting |
| **Live URL** | `https://www.strollingadventure.com` |
| **Architecture style** | Standalone components, signal-based state, zone.js change detection |

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Angular | 20.3.x |
| Language | TypeScript | 5.9.x (strict mode) |
| Reactive primitives | RxJS | 7.8.x |
| Change detection | Zone.js | 0.15.x |
| Build tool | `@angular/build` (esbuild-based) | 20.3.x |
| SSR / prerender | `@angular/ssr` + Express | 20.3.x |
| Unit tests | Jasmine + Karma | — |
| Hosting | Firebase Hosting | — |
| Package manager | npm | — |
| Dev environment | Google IDX (Nix) | Node 20 |

**Not currently used:** NgModules, NgRx/state libraries, CSS frameworks, HTTP client for app data, Firebase SDK in application code.

---

## 3. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Build (ng build)                         │
│  Angular SSR prerender → static HTML for all routes              │
│  Output: dist/myapp/browser/                                     │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting (production)                 │
│  firebase.json rewrites ** → /index.html for client navigation   │
│  Static assets: cover-spread.png, sitemap.xml, robots.txt        │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                               │
│  index.html → bootstrapApplication(App, appConfig)               │
│  App (shell) → <router-outlet />                               │
│    ├── Home (+ cloud parallax, footer)                         │
│    ├── About / Author / Illustrators                           │
│    ├── Activities / Maze / WordSearch                          │
│    └── Learn hub / Learn topic pages                           │
└──────────────────────────────────────────────────────────────────┘
```

**Data flow:** Page content is mostly static. Interactive games (maze, word search) use component-local signals and canvas/DOM logic. High scores persist in `localStorage`. SEO metadata is set per route via `SeoService` in each page component's `ngOnInit`.

---

## 4. Project Structure

```
/
├── .idx/                       # Google IDX workspace config
│   ├── dev.nix
│   └── mcp.json
├── .vscode/                    # Editor tasks, launch configs
├── docs/                       # Feature notes, QA, agent instructions
├── public/                     # Static assets copied to build output root
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── index.html
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Server bootstrap
│   ├── server.ts               # Express SSR handler (build/dev tooling)
│   ├── styles.css              # Global styles and print rules
│   └── app/
│       ├── app.ts              # Root shell (router-outlet only)
│       ├── app.html
│       ├── app.config.ts       # Browser providers
│       ├── app.config.server.ts
│       ├── app.routes.ts       # Client routes + PRERENDER_ROUTES
│       ├── app.routes.server.ts # Prerender configuration
│       ├── app.spec.ts
│       ├── seo/                # SeoService + constants
│       ├── shared/             # Footer, cloud parallax, content-page CSS
│       ├── home/
│       ├── about/
│       ├── activities/
│       ├── maze/
│       ├── learn/
│       ├── wordsearch/
│       └── game-scores.ts      # localStorage high-score helpers
├── angular.json
├── firebase.json
├── prerender-routes.txt        # Route list mirror for tooling/reference
├── blueprint.md
├── GEMINI.md
└── architecture.md             # This file
```

### Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Angular project name (CLI) | `myapp` | `ng build` targets `myapp` |
| Component selector prefix | `app` | `app-home`, `app-maze` |
| Component files | `feature.ts`, `feature.html`, `feature.css` | `home.ts`, `home.html` |
| Routes | `app.routes.ts` | Eager-loaded page components |

---

## 5. Application Bootstrap

Bootstrapping follows the modern **standalone** pattern (no `AppModule`).

```
index.html
    └── main.ts
            └── bootstrapApplication(App, appConfig)
                    ├── App          (root shell)
                    └── appConfig    (providers)
```

### Root component — `src/app/app.ts`

The root `App` component is a thin shell: it renders only `<router-outlet />`. All page content lives in routed feature components.

### Application config — `src/app/app.config.ts`

| Provider | Purpose |
|----------|---------|
| `provideRouter(routes)` | Client-side routing for all pages |
| `provideZoneChangeDetection({ eventCoalescing: true })` | Zone.js with batched DOM events |
| `provideBrowserGlobalErrorListeners()` | Global unhandled error/rejection logging |
| `provideClientHydration(withEventReplay())` | Client hydration after prerender |

---

## 6. Routing

Routes are defined in `src/app/app.routes.ts`:

| Path | Component | Description |
|------|-----------|-------------|
| `''` | `Home` | Landing page |
| `about` | `About` | Book overview |
| `about/author` | `Author` | Author page |
| `about/illustrators` | `Illustrators` | Illustrator credits |
| `activities` | `ActivitiesPage` | Activities hub |
| `maze` | `Maze` | Maze game |
| `wordsearch` | `WordSearch` | Word search game |
| `learn` | `LearnHub` | Nature topics index |
| `learn/:slug` | `LearnTopic` | Individual topic |
| `**` | redirect → `''` | Fallback |

All page components are **eagerly imported** (not lazy-loaded). The app is small enough that lazy loading is optional.

`PRERENDER_ROUTES` in the same file lists every path prerendered at build time, including all learn topic slugs from `LEARN_SLUGS`.

---

## 7. Components & Features

### Page components

| Component | Key dependencies | Notes |
|-----------|------------------|-------|
| `Home` | Cloud parallax, SiteFooter, SeoService | Buy links, activity cards, learn preview |
| `About`, `Author`, `Illustrators` | SiteFooter, SeoService, content-page CSS | About section pages |
| `ActivitiesPage` | SiteFooter, SeoService | Links to games |
| `Maze` | Canvas, game-scores, SeoService | Difficulty levels, scoring, print |
| `WordSearch` | game-scores, SeoService | Grid generation, selection, print |
| `LearnHub`, `LearnTopic` | topics.ts data, SeoService | 10 static nature topics |

### Shared components

| Component | Purpose |
|-----------|---------|
| `SiteFooter` | Footer nav (About, Author, Activities, Learn, Music, Buy) |
| `CloudParallaxBack` | Background cloud layer (homepage) |
| `CloudParallaxFront` | Foreground cloud layer with kite (homepage) |

### Learn content

Topic data is a static TypeScript array in `src/app/learn/topics.ts`. Each topic includes slug, title, description, paragraphs, an in-book quote, optional external source, and a CTA link.

---

## 8. Services & Shared Utilities

### SeoService (`src/app/seo/seo.service.ts`)

Root-scoped service that updates per-page:

- Document title
- Meta description, Open Graph, and Twitter tags
- Canonical URL (based on `SITE_URL` in `seo.constants.ts`)
- JSON-LD script injection (`setJsonLd` / `clearJsonLd`)

Constants in `seo.constants.ts` include site URL, default title/description, OG image, book ISBN, retailer offers, YouTube playlist URL, and Book schema for JSON-LD.

### game-scores.ts

Plain functions (not a service) for maze and word search high scores:

- `loadHighScore(game)` — reads from `localStorage`
- `saveHighScoreIfBetter(game, score)` — persists when score beats the record

Storage key: `strolling-adventure-high-scores`.

---

## 9. State Management

| Scope | Mechanism | Usage |
|-------|-----------|-------|
| Component-local | `signal()`, `computed()` | Game state, difficulty, scores, grid data |
| Shared / app-wide | `@Injectable({ providedIn: 'root' })` | `SeoService` |
| Persistence | `localStorage` via `game-scores.ts` | Maze and word search high scores |
| Static content | TypeScript constants | Learn topics, SEO constants, word database |

No global store (NgRx) is used.

---

## 10. Styling & Design System

### Global vs component styles

| Location | Scope | Content |
|----------|-------|---------|
| `src/styles.css` | Application-wide | Page background, print media rules |
| `src/app/home/home.css` | Home page | Typography, layout, buy/activity cards, OKLCH tokens |
| `src/app/shared/content-page.css` | About, learn, activities | Shared content page layout |
| Per-game CSS | Maze, word search | Game UI and print layouts |
| `src/app/shared/cloud-parallax/cloud-parallax.css` | Parallax layers | Cloud and kite animation |

### Design tokens

Home page defines OKLCH accent colors on `:host` in `home.css`. Global background uses `--page-bg: #cce4c6` in `styles.css`.

Home title fonts:

- Script: `"Lobster"` for "GiGi's Strolling"
- Caps: `"Bebas Neue"` for "Adventure"
- Body: `"Inter"` stack

### Print styles

Global `@media print` rules in `styles.css` hide `.no-print` elements and `app-site-footer`, and show `.print-footer` for the site URL on printed puzzle pages.

---

## 11. Static Assets & SEO

Assets in `public/` are copied to the build output root:

```json
"assets": [{ "glob": "**/*", "input": "public" }]
```

| Asset | Path | Notes |
|-------|------|-------|
| `robots.txt` | `/robots.txt` | Crawler directives |
| `sitemap.xml` | `/sitemap.xml` | All public routes |
| `cover-spread.png` | `/cover-spread.png` | Book cover (referenced in templates; may be gitignored or supplied at deploy) |

Reference public assets with **root-relative paths** (no `public/` prefix).

---

## 12. SSR, Prerendering & Deployment

### Prerender configuration

`angular.json` sets `"outputMode": "static"` with SSR entry at `src/server.ts`.

`app.routes.server.ts` configures prerender:

- `learn/:slug` — prerender params from `LEARN_SLUGS`
- `**` — all other routes prerendered

`prerender-routes.txt` mirrors the full route list for reference.

### Firebase Hosting

`firebase.json`:

- **public:** `dist/myapp/browser`
- **rewrites:** all paths → `/index.html` (SPA fallback for client navigation)

Deploy:

```bash
npm run deploy    # ng build && firebase deploy --only hosting
```

Firebase project: `strolling-adventure-8269-a69e5` (`.firebaserc`).

---

## 13. Configuration & Build

### TypeScript

- Strict mode enabled
- Angular template strictness enabled
- Target: ES2022

### npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `start` | `ng serve` | Dev server (port 4200) |
| `build` | `ng build` | Production prerender build |
| `watch` | `ng build --watch --configuration development` | Incremental builds |
| `test` | `ng test` | Karma unit tests |
| `deploy` | `ng build && firebase deploy --only hosting` | Production deploy |
| `serve:ssr:myapp` | `node dist/myapp/server/server.mjs` | Local SSR server (post-build) |

### Output

Production build emits prerendered static files to `dist/myapp/browser/`.

---

## 14. Development Environment

### Local development

```bash
npm install
npm start
npm run build
npm test
```

### Google IDX / Firebase Studio

`.idx/dev.nix` configures Node 20, Angular Language Service, and a preview server on `$PORT`. In IDX, the dev server is managed by the workspace preview — do not start `ng serve` manually in that environment (see [`GEMINI.md`](./GEMINI.md)).

### MCP servers (`.idx/mcp.json`)

| Server | Purpose |
|--------|---------|
| `angular-cli` | Angular CLI MCP integration |
| `firebase` | Firebase tools experimental MCP |

---

## 15. Testing Strategy

### Unit tests

- **Framework:** Jasmine + Karma
- **Location:** `*.spec.ts` alongside source
- **Root test:** `src/app/app.spec.ts` — verifies app creation and router-outlet rendering

Run with `npm test`.

### E2E

No end-to-end framework is configured.

---

## 16. Coding Conventions

Authoritative AI-facing rules live in [`GEMINI.md`](./GEMINI.md). Summary:

| Area | Rule |
|------|------|
| Components | Standalone, signals for state |
| Templates | `@if`, `@for`, `@switch` native control flow |
| DI | `inject()` function |
| Services | `providedIn: 'root'` for singletons |
| CSS | Native CSS; component-scoped stylesheets |

**Note:** Most components do not yet declare `ChangeDetectionStrategy.OnPush` explicitly, though `GEMINI.md` recommends it for new components.

---

## 17. Extending the Application

### Adding a new page

1. Create a standalone component under `src/app/`
2. Register the route in `app.routes.ts`
3. Add the path to `PRERENDER_ROUTES` and `prerender-routes.txt`
4. Call `SeoService.update()` in `ngOnInit`
5. Add the URL to `public/sitemap.xml`
6. Update [`blueprint.md`](./blueprint.md)
7. Run `ng build` and fix any errors

### Adding a learn topic

1. Add an entry to `LEARN_TOPICS` in `src/app/learn/topics.ts`
2. The slug is automatically included in prerender via `LEARN_SLUGS`
3. Add the URL to `public/sitemap.xml`

### AI assistant workflow

1. Read [`blueprint.md`](./blueprint.md) for current product state
2. Read this file for structural context
3. Follow [`GEMINI.md`](./GEMINI.md) for code patterns
4. Update `blueprint.md` after completing feature work
5. Run `ng build` to validate

---

## 18. Known Gaps & Technical Debt

| Item | Severity | Details |
|------|----------|---------|
| Missing `app.css` | Low | `app.ts` references `styleUrl: './app.css'` but the file does not exist. Create an empty file or remove the reference. |
| No lazy loading | Info | All routes are eagerly imported; acceptable at current size. |
| OnPush not universal | Info | `GEMINI.md` requires OnPush; most components use default change detection. |
| Package name mismatch | Info | `package.json` name is `myapp`; product title is GiGi's Strolling Adventure. |
| No E2E tests | Info | Framework not configured. |
| Screenshots folder missing | Low | `docs/` references `docs/screenshots/` but the folder is not in the repo. |
| `cover-spread.png` not in repo | Info | Referenced throughout the site; may be supplied outside version control or at deploy time. |

---

## 19. Related Documentation

| Document | Purpose |
|----------|---------|
| [`blueprint.md`](./blueprint.md) | Product overview and implemented features |
| [`GEMINI.md`](./GEMINI.md) | AI developer persona and Angular conventions |
| [`README.md`](./README.md) | Getting started and route overview |
| [`docs/README.md`](./docs/README.md) | Feature notes, QA, and agent instructions |
| [Angular docs](https://angular.dev) | Official framework reference |

---

*Last updated: August 2026 — multi-page prerendered site with home, about, activities, games, learn content, SEO, and Firebase deployment.*
