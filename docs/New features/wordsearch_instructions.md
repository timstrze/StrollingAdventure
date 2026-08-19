# Word Search — Feature Documentation

**Status:** Implemented as an Angular component at `/wordsearch`  
**Component:** `src/app/wordsearch/wordsearch.ts`

This document describes the shipped word search feature. An earlier version of this file specified a standalone single-file HTML page; that approach was superseded by the Angular implementation below.

---

## Overview

Interactive word search puzzle based on vocabulary from *Strolling Adventure*. Players find hidden words in a letter grid, earn points, track high scores, and can print a clean puzzle page.

**Route:** `/wordsearch`  
**Template:** `src/app/wordsearch/wordsearch.html`  
**Styles:** `src/app/wordsearch/wordsearch.css`

---

## Difficulty levels

| Level | Grid size | Words placed | Directions | Points per word |
|-------|-----------|--------------|------------|-----------------|
| Easy | 11×11 | 7 | Horizontal, vertical | 5 |
| Medium | 15×15 | 10 | + 2 diagonals | 10 |
| Hard | 20×20 | 13 | All 8 directions | 15 |

Default difficulty: **medium**.

---

## Word database

Words are drawn from `WORD_DB` in `wordsearch.ts` — book-themed terms such as `tigerswallowtail`, `coneflowers`, `strolling`, `squirrels`, `adventure`, `pinecone`, `cardinal`, `honeybee`, `yorktown`, `friends`, `leaves`, `sun`, and additional poem vocabulary.

Each **New Puzzle** advances to the next batch of words from the pool.

---

## Grid generation

1. Grid size depends on selected difficulty.
2. Words are sorted longest-first before placement.
3. Up to 5,000 random position/direction attempts per word.
4. Overlapping letters are allowed when characters match.
5. Empty cells are filled with random uppercase letters (A–Z).
6. Placed word metadata (start row/col, direction vector) is stored for answer highlighting.

---

## Interactive features

| Feature | Behavior |
|---------|----------|
| Word selection | Click/drag to select cells; valid words are marked found |
| Show Answer | Toggles highlight on all answer cells |
| New Puzzle | Generates a new grid from the word pool |
| Score | Points awarded per word found (varies by difficulty) |
| High score | Persisted in `localStorage` via `game-scores.ts` |
| Print | Uses global print styles; buttons and footer hidden; puzzle-only output |

---

## Visual design

- Black and white puzzle aesthetic
- System sans-serif font stack
- Grid rendered as an HTML table with bordered cells
- Word list displayed below the grid
- Print footer shows `www.strollingadventure.com` (via `.print-footer` in global styles)

---

## SEO

On init, the component calls `SeoService.update()` with page-specific title and description for `/wordsearch`.

---

## Related files

| File | Role |
|------|------|
| `src/app/wordsearch/wordsearch.ts` | Component logic, grid generation, scoring |
| `src/app/wordsearch/wordsearch.html` | Template |
| `src/app/wordsearch/wordsearch.css` | Styles including print layout |
| `src/app/game-scores.ts` | High score persistence |
| `src/styles.css` | Global print media rules |

---

## Local testing

```bash
npm start
```

Open [http://localhost:4200/wordsearch](http://localhost:4200/wordsearch) and verify:

1. Grid renders at default (medium) difficulty
2. Word selection marks found words and updates score
3. Show Answer toggles highlights
4. Print preview hides buttons and shows puzzle only
5. High score persists after page reload
