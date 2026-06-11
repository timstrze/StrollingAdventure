export type GameId = 'maze' | 'wordsearch';

const STORAGE_KEY = 'strolling-adventure-high-scores';

function readStore(): Record<GameId, number> {
  if (typeof localStorage === 'undefined') {
    return { maze: 0, wordsearch: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { maze: 0, wordsearch: 0 };
    const parsed = JSON.parse(raw) as Partial<Record<GameId, unknown>>;
    return {
      maze: typeof parsed.maze === 'number' && parsed.maze >= 0 ? parsed.maze : 0,
      wordsearch:
        typeof parsed.wordsearch === 'number' && parsed.wordsearch >= 0 ? parsed.wordsearch : 0,
    };
  } catch {
    return { maze: 0, wordsearch: 0 };
  }
}

export function loadHighScore(game: GameId): number {
  return readStore()[game];
}

/** Persists the score when it beats the saved high score. Returns true if a new record was saved. */
export function saveHighScoreIfBetter(game: GameId, score: number): boolean {
  if (typeof localStorage === 'undefined') return false;
  const store = readStore();
  if (score <= store[game]) return false;
  store[game] = score;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
