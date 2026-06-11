import {
  AfterViewInit,
  Component,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { loadHighScore, saveHighScoreIfBetter } from '../game-scores';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DiffConfig {
  cols: number;
  rows: number;
  cell: number;
  rooms: [number, number][];
}

const DIFFS: Record<Difficulty, DiffConfig> = {
  easy: { cols: 13, rows: 10, cell: 50, rooms: [[1, 1], [1, 9], [4, 5], [7, 1], [7, 9]] },
  medium: { cols: 19, rows: 14, cell: 36, rooms: [[2, 2], [2, 14], [6, 8], [10, 2], [10, 14]] },
  hard: { cols: 27, rows: 19, cell: 25, rooms: [[2, 2], [2, 22], [8, 12], [14, 2], [14, 22]] },
};

const OX = 20;
const OY = 20;
const N = 1;
const E = 2;
const S = 4;
const W = 8;
const OPP: Record<number, number> = { [N]: S, [E]: W, [S]: N, [W]: E };
const DR: Record<number, number> = { [N]: -1, [E]: 0, [S]: 1, [W]: 0 };
const DC: Record<number, number> = { [N]: 0, [E]: 1, [S]: 0, [W]: -1 };
const DIRS = [N, E, S, W];

@Component({
  selector: 'app-maze',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './maze.html',
  styleUrl: './maze.css',
})
export class Maze implements AfterViewInit {
  @ViewChild('mc') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly difficulty = signal<Difficulty>('medium');
  readonly showing = signal(false);
  readonly score = signal(0);
  readonly highScore = signal(loadHighScore('maze'));
  readonly beatHighScore = signal(false);
  readonly won = signal(false);
  readonly lastAward = signal(0);
  readonly hint = signal<string | null>(null);

  private readonly sessionStartHigh = loadHighScore('maze');
  private readonly POINTS: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };

  private ctx!: CanvasRenderingContext2D;
  private COLS = 0;
  private ROWS = 0;
  private CELL = 0;
  private ROOMS: [number, number][] = [];
  private CW = 0;
  private CH = 0;
  private dpr = 1;
  private grid: number[][] = [];
  private sol: number[][] = [];

  // User-drawn path (one entry per stroke; each stroke is a list of points)
  // The traced route as a list of maze cells. It snaps to corridors: the head
  // follows the finger but can only step through open walls.
  private path: { r: number; c: number }[] = [];
  private headPos: { x: number; y: number } | null = null; // continuous tip (sub-cell)
  private drawing = false;
  private active = false; // is the current drag connected to the path's head?
  private readonly TRACE_COLOR = '#6270a0';

  // Book illustrations (optimized webp in public/maze/). 5 are picked at
  // random per maze to fill the dead-end rooms.
  private readonly IMAGE_FILES = [
    'solo-bird',
    'solo-butterfly',
    'solo-cloud',
    'solo-flowers2',
    'solo-honeybee',
    'solo-pinecone',
    'solo-squirrels',
    'solo-sun',
    'solo-sun2',
  ];
  private images: HTMLImageElement[] = [];
  private roomImages: HTMLImageElement[] = [];

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.loadImages();
    this.applyDiff(this.difficulty());
    this.newMaze();
  }

  private loadImages(): void {
    this.images = this.IMAGE_FILES.map((name) => {
      const img = new Image();
      // Redraw once each illustration finishes loading.
      img.onload = () => {
        if (this.grid.length) this.draw(this.showing());
      };
      img.src = `maze/${name}.webp`;
      return img;
    });
  }

  /** Pick 5 distinct illustrations at random for the current maze's rooms. */
  private pickRoomImages(): HTMLImageElement[] {
    const pool = [...this.images];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  private applyDiff(level: Difficulty): void {
    const d = DIFFS[level];
    this.COLS = d.cols;
    this.ROWS = d.rows;
    this.CELL = d.cell;
    this.ROOMS = d.rooms;
    this.CW = this.COLS * this.CELL + 40;
    this.CH = this.ROWS * this.CELL + 40;
    // Render at the device pixel ratio so lines stay crisp on Retina iPads,
    // while keeping all drawing/hit-testing math in logical (CSS) coordinates.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = this.canvasRef.nativeElement;
    cv.width = Math.round(this.CW * this.dpr);
    cv.height = Math.round(this.CH * this.dpr);
    cv.style.width = this.CW + 'px';
    cv.style.removeProperty('height'); // let CSS height:auto preserve aspect ratio
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // ── Maze generation ─────────────────────────────────────────────────────────
  private roomOf(r: number, c: number): number {
    for (let i = 0; i < this.ROOMS.length; i++) {
      const [rr, rc] = this.ROOMS[i];
      if (r >= rr && r <= rr + 2 && c >= rc && c <= rc + 2) return i;
    }
    return -1;
  }

  private buildMaze(): void {
    this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    const vis = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    const stk: [number, number][] = [[0, 0]];
    vis[0][0] = 1;
    while (stk.length) {
      const [r, c] = stk[stk.length - 1];
      const avail: number[] = [];
      for (const d of DIRS) {
        const nr = r + DR[d];
        const nc = c + DC[d];
        if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) continue;
        if (!vis[nr][nc]) avail.push(d);
      }
      if (!avail.length) {
        stk.pop();
        continue;
      }
      const d = avail[0 | (Math.random() * avail.length)];
      const nr = r + DR[d];
      const nc = c + DC[d];
      this.grid[r][c] |= d;
      this.grid[nr][nc] |= OPP[d];
      const ri = this.roomOf(nr, nc);
      if (ri >= 0) {
        const [rr, rc] = this.ROOMS[ri];
        for (let i = rr; i <= rr + 2; i++)
          for (let j = rc; j <= rc + 2; j++) vis[i][j] = 1;
        for (let i = rr; i <= rr + 2; i++)
          for (let j = rc; j <= rc + 2; j++) {
            if (j < rc + 2) {
              this.grid[i][j] |= E;
              this.grid[i][j + 1] |= W;
            }
            if (i < rr + 2) {
              this.grid[i][j] |= S;
              this.grid[i + 1][j] |= N;
            }
          }
      } else {
        vis[nr][nc] = 1;
        stk.push([nr, nc]);
      }
    }
  }

  private solve(): number[][] {
    const sr = 0;
    const sc = 0;
    const er = this.ROWS - 1;
    const ec = this.COLS - 1;
    const prev: (number[] | null)[][] = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(null)
    );
    prev[sr][sc] = [sr, sc];
    const q: number[][] = [[sr, sc]];
    let qi = 0;
    while (qi < q.length) {
      const [r, c] = q[qi++];
      if (r === er && c === ec) {
        const path: number[][] = [];
        let cur = [r, c];
        while (cur[0] !== sr || cur[1] !== sc) {
          path.unshift([...cur]);
          cur = prev[cur[0]][cur[1]]!;
        }
        path.unshift([sr, sc]);
        return path;
      }
      for (const d of DIRS) {
        if (this.grid[r][c] & d) {
          const nr = r + DR[d];
          const nc = c + DC[d];
          if (!prev[nr][nc]) {
            prev[nr][nc] = [r, c];
            q.push([nr, nc]);
          }
        }
      }
    }
    return [];
  }

  // ── Icons ───────────────────────────────────────────────────────────────────
  private iPerson(cx: number, cy: number, s: number): void {
    const ctx = this.ctx;
    ctx.lineWidth = Math.max(1, s * 0.12);
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.43, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.25);
    ctx.lineTo(cx, cy + s * 0.15);
    ctx.moveTo(cx - s * 0.28, cy - s * 0.08);
    ctx.lineTo(cx + s * 0.28, cy - s * 0.08);
    ctx.moveTo(cx, cy + s * 0.15);
    ctx.lineTo(cx - s * 0.22, cy + s * 0.52);
    ctx.moveTo(cx, cy + s * 0.15);
    ctx.lineTo(cx + s * 0.22, cy + s * 0.52);
    ctx.stroke();
  }

  private iFlag(cx: number, cy: number, s: number): void {
    const ctx = this.ctx;
    ctx.lineWidth = Math.max(1, s * 0.12);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.15, cy + s * 0.5);
    ctx.lineTo(cx - s * 0.15, cy - s * 0.52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.15, cy - s * 0.52);
    ctx.lineTo(cx + s * 0.75, cy - s * 0.15);
    ctx.lineTo(cx - s * 0.15, cy + s * 0.15);
    ctx.closePath();
    ctx.stroke();
  }

  // ── Draw ────────────────────────────────────────────────────────────────────
  private draw(showSol: boolean): void {
    const ctx = this.ctx;
    const { CW, CH, CELL, COLS, ROWS } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CW, CH);

    if (showSol && this.sol && this.sol.length) {
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = Math.max(4, CELL * 0.18);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(OX + this.sol[0][1] * CELL + CELL / 2, OY + this.sol[0][0] * CELL + CELL / 2);
      for (let i = 1; i < this.sol.length; i++)
        ctx.lineTo(OX + this.sol[i][1] * CELL + CELL / 2, OY + this.sol[i][0] * CELL + CELL / 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'square';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = OX + c * CELL;
        const y = OY + r * CELL;
        if (!(this.grid[r][c] & N)) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + CELL, y);
          ctx.stroke();
        }
        if (!(this.grid[r][c] & E)) {
          ctx.beginPath();
          ctx.moveTo(x + CELL, y);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.stroke();
        }
        if (!(this.grid[r][c] & S)) {
          ctx.beginPath();
          ctx.moveTo(x, y + CELL);
          ctx.lineTo(x + CELL, y + CELL);
          ctx.stroke();
        }
        if (!(this.grid[r][c] & W)) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + CELL);
          ctx.stroke();
        }
      }
    }
    ctx.lineWidth = 2.5;
    ctx.strokeRect(OX, OY, COLS * CELL, ROWS * CELL);

    // Book illustrations fill each 3x3 dead-end room.
    for (let i = 0; i < this.ROOMS.length; i++) {
      const [rr, rc] = this.ROOMS[i];
      const img = this.roomImages[i];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      const cx = OX + (rc + 1.5) * CELL;
      const cy = OY + (rr + 1.5) * CELL;
      const box = CELL * 2.7; // fit within the 3x3 room with a little padding
      const scale = Math.min(box / img.naturalWidth, box / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    }

    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';

    // START
    const sx = OX + CELL / 2;
    const sy = OY + CELL / 2;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    this.iPerson(sx, sy - CELL * 0.06, CELL * 0.42);
    ctx.font = `bold ${Math.max(6, CELL * 0.19)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', sx, OY + CELL - CELL * 0.14);

    // END
    const ex = OX + (COLS - 1) * CELL + CELL / 2;
    const ey = OY + (ROWS - 1) * CELL + CELL / 2;
    this.iFlag(ex, ey - CELL * 0.06, CELL * 0.42);
    ctx.fillText('END', ex, OY + (ROWS - 1) * CELL + CELL - CELL * 0.14);

    this.drawPath();
  }

  private traceStyle(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = this.TRACE_COLOR;
    ctx.lineWidth = Math.max(3, this.CELL * 0.32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  private cellCenter(cell: { r: number; c: number }): { x: number; y: number } {
    return {
      x: OX + (cell.c + 0.5) * this.CELL,
      y: OY + (cell.r + 0.5) * this.CELL,
    };
  }

  private drawPath(): void {
    if (!this.path.length) return;
    const ctx = this.ctx;
    ctx.save();
    this.traceStyle();
    ctx.beginPath();
    const first = this.cellCenter(this.path[0]);
    ctx.moveTo(first.x, first.y);
    // Draw through committed cell centres, but end at the continuous tip so the
    // line follows the finger sub-cell rather than jumping cell to cell.
    const tip = this.headPos ?? this.cellCenter(this.path[this.path.length - 1]);
    if (this.path.length === 1) {
      ctx.lineTo(tip.x, tip.y);
    } else {
      for (let i = 1; i < this.path.length - 1; i++) {
        const c = this.cellCenter(this.path[i]);
        ctx.lineTo(c.x, c.y);
      }
      ctx.lineTo(tip.x, tip.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── Pointer drawing (mouse / touch / pen) ────────────────────────────────────
  private pointerPos(e: PointerEvent): { x: number; y: number } {
    const cv = this.canvasRef.nativeElement;
    const rect = cv.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.CW / rect.width),
      y: (e.clientY - rect.top) * (this.CH / rect.height),
    };
  }

  private cellOf(x: number, y: number): { r: number; c: number } | null {
    const c = Math.floor((x - OX) / this.CELL);
    const r = Math.floor((y - OY) / this.CELL);
    if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS) return null;
    return { r, c };
  }

  onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    try {
      this.canvasRef.nativeElement.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    this.drawing = true;
    this.hint.set(null);
    const pos = this.pointerPos(e);
    const cell = this.cellOf(pos.x, pos.y);

    if (this.path.length === 0) {
      // A new line can only begin on the START square.
      this.active = !!cell && cell.r === 0 && cell.c === 0;
      if (this.active) {
        this.path = [{ r: 0, c: 0 }];
        this.headPos = this.cellCenter({ r: 0, c: 0 });
        this.draw(this.showing());
      }
    } else {
      // Resuming: must press on the current head of the line.
      const head = this.path[this.path.length - 1];
      this.active = !!cell && cell.r === head.r && cell.c === head.c;
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.drawing) return;
    e.preventDefault();
    const p = this.pointerPos(e);

    if (!this.active) {
      // Not yet connected to the line — try to latch on at START or the head.
      const cell = this.cellOf(p.x, p.y);
      if (!cell) return;
      if (this.path.length === 0) {
        if (cell.r === 0 && cell.c === 0) {
          this.path = [{ r: 0, c: 0 }];
          this.headPos = this.cellCenter({ r: 0, c: 0 });
          this.active = true;
          this.draw(this.showing());
        }
        return;
      }
      const head = this.path[this.path.length - 1];
      if (cell.r === head.r && cell.c === head.c) this.active = true;
      else return;
    }

    if (this.moveHeadTowards(p)) this.draw(this.showing());
  }

  /** Are cells a and b adjacent with an open wall between them? */
  private isOpen(a: { r: number; c: number }, b: { r: number; c: number }): boolean {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
    const dir = dr === -1 ? N : dr === 1 ? S : dc === 1 ? E : W;
    return (this.grid[a.r][a.c] & dir) !== 0;
  }

  /**
   * Glide the continuous tip toward the finger in small sub-cell steps,
   * crossing into a new cell only through an open wall (which commits that
   * cell to the path) and clamping against walls otherwise. Returns true if
   * anything moved.
   */
  private moveHeadTowards(target: { x: number; y: number }): boolean {
    if (!this.headPos) return false;
    const step = Math.max(2, this.CELL * 0.2);
    let changed = false;
    let guard = 0;
    while (guard++ < 4000) {
      const dx = target.x - this.headPos.x;
      const dy = target.y - this.headPos.y;
      if (Math.abs(dx) < 0.75 && Math.abs(dy) < 0.75) break;
      // Move one axis at a time so wall transitions are always orthogonal.
      const sx = Math.sign(dx) * Math.min(step, Math.abs(dx));
      const sy = Math.sign(dy) * Math.min(step, Math.abs(dy));
      const movedX = sx !== 0 && this.tryStep(this.headPos.x + sx, this.headPos.y);
      const movedY = sy !== 0 && this.tryStep(this.headPos.x, this.headPos.y + sy);
      if (movedX || movedY) changed = true;
      else break; // fully blocked
    }
    return changed;
  }

  /** Attempt to move the tip to (nx, ny) — exactly one axis differs. */
  private tryStep(nx: number, ny: number): boolean {
    const head = this.path[this.path.length - 1];
    const cell = this.cellOf(nx, ny);

    if (cell && cell.r === head.r && cell.c === head.c) {
      // Free movement inside the current cell.
      this.headPos = { x: nx, y: ny };
      return true;
    }

    if (cell && this.isOpen(head, cell)) {
      // Crossing into an open neighbour commits (or retraces) a cell.
      const prev = this.path.length >= 2 ? this.path[this.path.length - 2] : null;
      if (prev && cell.r === prev.r && cell.c === prev.c) {
        this.path.pop();
      } else if (this.path.some((c) => c.r === cell.r && c.c === cell.c)) {
        return this.clampToCell(nx, ny, head); // would cross our own line
      } else {
        this.path.push(cell);
      }
      this.headPos = { x: nx, y: ny };
      if (cell.r === this.ROWS - 1 && cell.c === this.COLS - 1) this.win();
      return true;
    }

    // Wall (or outer border) in the way — clamp the tip inside the head cell.
    return this.clampToCell(nx, ny, head);
  }

  private clampToCell(nx: number, ny: number, cell: { r: number; c: number }): boolean {
    const x0 = OX + cell.c * this.CELL;
    const y0 = OY + cell.r * this.CELL;
    const eps = Math.min(2, this.CELL * 0.12);
    const cx = Math.min(Math.max(nx, x0 + eps), x0 + this.CELL - eps);
    const cy = Math.min(Math.max(ny, y0 + eps), y0 + this.CELL - eps);
    if (this.headPos && cx === this.headPos.x && cy === this.headPos.y) return false;
    this.headPos = { x: cx, y: cy };
    return true;
  }

  private win(): void {
    if (this.won()) return;
    const pts = this.POINTS[this.difficulty()];
    this.lastAward.set(pts);
    this.score.update((s) => s + pts);
    const total = this.score();
    if (saveHighScoreIfBetter('maze', total)) this.highScore.set(total);
    this.beatHighScore.set(total > this.sessionStartHigh);
    this.hint.set(null);
    this.won.set(true);
  }

  onPointerUp(e: PointerEvent): void {
    if (!this.drawing) return;
    this.drawing = false;
    this.active = false;
    try {
      this.canvasRef.nativeElement.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!this.won() && this.path.length === 0) {
      this.hint.set(
        'Begin your line right on the START square (top-left), then drag along the open paths to END.'
      );
    }
  }

  clearPath(): void {
    this.path = [];
    this.headPos = null;
    this.active = false;
    this.won.set(false);
    this.lastAward.set(0);
    this.hint.set(null);
    this.draw(this.showing());
  }

  // ── Controls ────────────────────────────────────────────────────────────────
  toggle(): void {
    this.showing.set(!this.showing());
    this.draw(this.showing());
  }

  newMaze(): void {
    this.showing.set(false);
    this.path = [];
    this.headPos = null;
    this.active = false;
    this.won.set(false);
    this.beatHighScore.set(false);
    this.lastAward.set(0);
    this.hint.set(null);
    this.roomImages = this.pickRoomImages();
    this.buildMaze();
    this.sol = this.solve();
    this.draw(false);
  }

  setDiff(level: Difficulty): void {
    if (this.difficulty() === level) return;
    this.difficulty.set(level);
    this.applyDiff(level);
    this.newMaze();
  }

  print(): void {
    window.print();
  }
}
