import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { loadHighScore, saveHighScoreIfBetter } from '../game-scores';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

interface Cell {
  letter: string;
  answer: boolean; // belongs to a hidden word (for "Show Answer")
}

interface Placed {
  word: string;
  r0: number;
  c0: number;
  dr: number;
  dc: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface DiffConfig {
  size: number;
  count: number;
  points: number;
  dirs: [number, number][];
}

// Direction vectors.
const E: [number, number] = [0, 1];
const W: [number, number] = [0, -1];
const S: [number, number] = [1, 0];
const N: [number, number] = [-1, 0];
const SE: [number, number] = [1, 1];
const NW: [number, number] = [-1, -1];
const NE: [number, number] = [-1, 1];
const SW: [number, number] = [1, -1];

const DIFFS: Record<Difficulty, DiffConfig> = {
  easy: { size: 11, count: 7, points: 5, dirs: [E, S] },
  medium: { size: 15, count: 10, points: 10, dirs: [E, S, SE, NE] },
  hard: { size: 20, count: 13, points: 15, dirs: [E, W, S, N, SE, NW, NE, SW] },
};

/* ============================================================
   Local word database.
   - Words from the Strolling Adventure book list plus unique,
     meaningful words from the poem. Stopwords excluded.
   - The game cycles through this pool; each "New Puzzle"
     advances to the next batch.
   ============================================================ */
const WORD_DB = [
  'tigerswallowtail', 'coneflowers', 'strolling', 'squirrels', 'adventure',
  'pinecone', 'cardinal', 'honeybee', 'yorktown', 'friends', 'leaves', 'sun',
  'shines', 'bright', 'warm', 'rises', 'dawn', 'trees', 'green', 'everything',
  'clouds', 'float', 'sky', 'kite', 'high', 'play', 'climb', 'birds', 'sing',
  'song', 'stroll', 'honeybees', 'buzz', 'honey', 'butterflies', 'wings',
  'flight', 'flowers', 'grow', 'april', 'showers', 'pinecones', 'ground',
  'nice', 'pretty', 'run', 'fun', 'made', 'making', 'work', 'spread', 'fall',
];

@Component({
  selector: 'app-wordsearch',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './wordsearch.html',
  styleUrl: './wordsearch.css',
})
export class WordSearch implements OnInit {
  private readonly seo = inject(SeoService);

  readonly difficulty = signal<Difficulty>('medium');
  readonly size = signal(DIFFS.medium.size);
  readonly grid = signal<Cell[][]>([]);
  readonly words = signal<string[]>([]);
  readonly foundWords = signal<Set<string>>(new Set());
  readonly foundCells = signal<Set<number>>(new Set());
  readonly selCells = signal<Set<number>>(new Set());
  readonly showing = signal(false);
  readonly score = signal(0);
  readonly highScore = signal(loadHighScore('wordsearch'));
  readonly beatHighScore = signal(false);
  readonly won = signal(false);
  readonly lastAward = signal(0);
  readonly lastWord = signal('');

  private readonly sessionStartHigh = loadHighScore('wordsearch');
  private puzzleIndex = 0;
  private readonly shuffleSeed = Math.floor(Math.random() * 0xffffffff);
  private placed: Placed[] = [];
  private drawing = false;
  private startCell: { r: number; c: number } | null = null;
  private currentPath: { r: number; c: number }[] = [];

  constructor() {
    this.render();
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Word Search — Find Words from the Book | Strolling Adventure',
      description:
        'Free word search puzzle with words from Strolling Adventure — find sun, squirrels, honeybees, Yorktown, and more. Play online or print it!',
      path: '/wordsearch',
    });
    this.seo.clearJsonLd();
  }

  // ── Seeded RNG (mulberry32) ──────────────────────────────────────────────────
  private mulberry32(seed: number): () => number {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private shuffled(arr: string[], rand: () => number): string[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Pick the next batch of fitting words for the chosen difficulty.
  private pickWords(puzzleIndex: number, cfg: DiffConfig): string[] {
    const pool = WORD_DB.filter((w) => w.length <= cfg.size);
    const order = this.shuffled(pool, this.mulberry32(this.shuffleSeed));
    const start = (puzzleIndex * cfg.count) % order.length;
    const batch: string[] = [];
    for (let i = 0; i < cfg.count; i++) {
      batch.push(order[(start + i) % order.length]);
    }
    return [...new Set(batch)].map((w) => w.toUpperCase());
  }

  private buildGrid(
    words: string[],
    cfg: DiffConfig,
    seed: number
  ): { grid: string[][]; placed: Placed[] } | null {
    const rand = this.mulberry32(seed);
    const sz = cfg.size;
    const grid: string[][] = Array.from({ length: sz }, () => new Array(sz).fill(''));
    const placed: Placed[] = [];
    const ordered = words.slice().sort((a, b) => b.length - a.length);

    for (const word of ordered) {
      if (word.length > sz) continue;
      let done = false;
      for (let attempt = 0; attempt < 5000 && !done; attempt++) {
        const [dr, dc] = cfg.dirs[Math.floor(rand() * cfg.dirs.length)];
        const r0 = Math.floor(rand() * sz);
        const c0 = Math.floor(rand() * sz);
        const rEnd = r0 + dr * (word.length - 1);
        const cEnd = c0 + dc * (word.length - 1);
        if (rEnd < 0 || rEnd >= sz || cEnd < 0 || cEnd >= sz) continue;

        let ok = true;
        for (let i = 0; i < word.length; i++) {
          const cell = grid[r0 + dr * i][c0 + dc * i];
          if (cell !== '' && cell !== word[i]) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        for (let i = 0; i < word.length; i++) {
          grid[r0 + dr * i][c0 + dc * i] = word[i];
        }
        placed.push({ word, r0, c0, dr, dc });
        done = true;
      }
      if (!done) return null;
    }

    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        if (grid[r][c] === '') grid[r][c] = A[Math.floor(rand() * 26)];
      }
    }
    return { grid, placed };
  }

  private render(): void {
    const cfg = DIFFS[this.difficulty()];
    const words = this.pickWords(this.puzzleIndex, cfg);

    let result: { grid: string[][]; placed: Placed[] } | null = null;
    for (let s = 0; s < 60 && !result; s++) {
      result = this.buildGrid(words, cfg, this.puzzleIndex * 1000 + s + 1);
    }
    if (!result) result = this.buildGrid(words, cfg, 999999);
    if (!result) return;

    const sz = cfg.size;
    const answerCells = new Set<number>();
    for (const p of result.placed) {
      for (let i = 0; i < p.word.length; i++) {
        answerCells.add((p.r0 + p.dr * i) * sz + (p.c0 + p.dc * i));
      }
    }

    const cells: Cell[][] = result.grid.map((row, r) =>
      row.map((letter, c) => ({ letter, answer: answerCells.has(r * sz + c) }))
    );

    this.placed = result.placed;
    this.size.set(sz);
    this.grid.set(cells);
    this.words.set(result.placed.map((p) => p.word.toLowerCase()).sort());
    this.foundWords.set(new Set());
    this.foundCells.set(new Set());
    this.selCells.set(new Set());
    this.showing.set(false);
    this.won.set(false);
    this.beatHighScore.set(false);
    this.lastAward.set(0);
    this.lastWord.set('');
  }

  // ── Pointer selection ────────────────────────────────────────────────────────
  private cellFromPoint(x: number, y: number): { r: number; c: number } | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el || el.dataset['r'] === undefined || el.dataset['c'] === undefined) return null;
    return { r: +el.dataset['r'], c: +el.dataset['c'] };
  }

  // Snap the drag from start to the pointer onto one of the 8 straight lines.
  private snapLine(
    sr: number,
    sc: number,
    r: number,
    c: number
  ): { r: number; c: number }[] {
    const sz = this.size();
    const dr = r - sr;
    const dc = c - sc;
    if (dr === 0 && dc === 0) return [{ r: sr, c: sc }];
    const ang = Math.round(Math.atan2(dr, dc) / (Math.PI / 4)) * (Math.PI / 4);
    const stepR = Math.round(Math.sin(ang));
    const stepC = Math.round(Math.cos(ang));
    const denom = stepR * stepR + stepC * stepC; // 1 (ortho) or 2 (diagonal)
    let len = Math.round((dr * stepR + dc * stepC) / denom);
    if (len < 0) len = 0;
    const path: { r: number; c: number }[] = [];
    for (let i = 0; i <= len; i++) {
      const nr = sr + stepR * i;
      const nc = sc + stepC * i;
      if (nr < 0 || nr >= sz || nc < 0 || nc >= sz) break;
      path.push({ r: nr, c: nc });
    }
    return path;
  }

  private setSelection(path: { r: number; c: number }[]): void {
    const sz = this.size();
    this.currentPath = path;
    this.selCells.set(new Set(path.map((p) => p.r * sz + p.c)));
  }

  onPointerDown(e: PointerEvent): void {
    const cell = this.cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    this.drawing = true;
    this.startCell = cell;
    this.setSelection([cell]);
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.drawing || !this.startCell) return;
    const cell = this.cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    e.preventDefault();
    this.setSelection(this.snapLine(this.startCell.r, this.startCell.c, cell.r, cell.c));
  }

  onPointerUp(e: PointerEvent): void {
    if (!this.drawing) return;
    this.drawing = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    this.checkSelection();
    this.startCell = null;
    this.currentPath = [];
    this.selCells.set(new Set());
  }

  private checkSelection(): void {
    const path = this.currentPath;
    if (path.length < 2) return;
    const letters = path.map((p) => this.grid()[p.r][p.c].letter).join('');
    const reversed = letters.split('').reverse().join('');

    const found = this.foundWords();
    const target = this.words().find(
      (w) => !found.has(w) && (w.toUpperCase() === letters || w.toUpperCase() === reversed)
    );
    if (!target) return;

    const sz = this.size();
    const nextFoundCells = new Set(this.foundCells());
    for (const p of path) nextFoundCells.add(p.r * sz + p.c);
    const nextFoundWords = new Set(found);
    nextFoundWords.add(target);

    const pts = DIFFS[this.difficulty()].points;
    this.foundCells.set(nextFoundCells);
    this.foundWords.set(nextFoundWords);
    this.score.update((s) => s + pts);
    const total = this.score();
    if (saveHighScoreIfBetter('wordsearch', total)) this.highScore.set(total);
    this.lastAward.set(pts);
    this.lastWord.set(target);

    if (nextFoundWords.size === this.words().length) {
      this.beatHighScore.set(total > this.sessionStartHigh);
      this.won.set(true);
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────────
  toggleAnswer(): void {
    this.showing.set(!this.showing());
  }

  newPuzzle(): void {
    this.puzzleIndex++;
    this.render();
  }

  setDiff(level: Difficulty): void {
    if (this.difficulty() === level) return;
    this.difficulty.set(level);
    this.render();
  }

  print(): void {
    window.print();
  }
}
