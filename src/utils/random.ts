/** Fisher–Yates shuffle that does not mutate the input. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function randomFrom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** Returns `count` unique random items (or all items if count is larger). */
export function pickMany<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

/**
 * Draws from a curated pool without repeating an item until the whole pool
 * has been exhausted, then reshuffles for the next round.
 */
export class NoRepeatPool<T> {
  private readonly items: T[];
  private bag: T[] = [];

  constructor(items: readonly T[]) {
    this.items = [...items];
  }

  next(): T | undefined {
    if (this.items.length === 0) return undefined;
    if (this.bag.length === 0) this.bag = shuffle(this.items);
    return this.bag.pop();
  }

  /** Number of items left before the pool reshuffles. */
  get remaining(): number {
    return this.bag.length > 0 ? this.bag.length : this.items.length;
  }

  get size(): number {
    return this.items.length;
  }

  reset(): void {
    this.bag = [];
  }
}
