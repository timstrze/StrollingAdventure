# Strolling Adventure Documentation

Project documentation for features, enhancements, QA, and agent instructions.

## Contents

| Folder / file | Purpose |
|---------------|---------|
| [enhancements/](./enhancements/) | Feature and UI change notes with implementation details |
| [qa/](./qa/) | Manual QA test cases |
| [New features/](./New%20features/) | Agent build instructions (historical specs and feature notes) |

## Local development

```bash
npm install
npm start
```

Open [http://localhost:4200/](http://localhost:4200/) to verify changes before deploy.

## Deploy

```bash
npm run deploy
```

Builds prerendered static output to `dist/myapp/browser` and deploys to Firebase Hosting.

## Site routes

| Route | Page |
|-------|------|
| `/` | Home |
| `/about`, `/about/author`, `/about/illustrators` | About section |
| `/activities` | Activities hub |
| `/maze`, `/wordsearch` | Interactive games |
| `/learn`, `/learn/:slug` | Nature learning (10 topics) |

See [`architecture.md`](../architecture.md) for full system details.

## Documented enhancements

| Doc | Summary | Status |
|-----|---------|--------|
| [Home page cover image](./enhancements/home-cover-image.md) | Replaced sunset photo with book cover illustration | Implemented (June 2026) |
| [Word search feature](./New%20features/wordsearch_instructions.md) | Interactive word search at `/wordsearch` | Implemented (Angular component) |

## Related project docs

| Document | Purpose |
|----------|---------|
| [`../README.md`](../README.md) | Getting started |
| [`../architecture.md`](../architecture.md) | Architecture and conventions |
| [`../blueprint.md`](../blueprint.md) | Product features |
