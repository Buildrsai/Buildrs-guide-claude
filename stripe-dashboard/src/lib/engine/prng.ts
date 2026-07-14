/**
 * Deterministic PRNG. Never use Math.random or Date.now anywhere in the
 * engine — every draw must come from an Rng seeded by the scenario seed.
 */

/** xmur3 string hash → 32-bit seed */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private readonly gen: () => number;
  private readonly seedValue: number;

  constructor(seed: number | string) {
    this.seedValue =
      typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
    this.gen = mulberry32(this.seedValue);
  }

  /**
   * Derive an independent, stable child stream. Each pipeline stage forks
   * with its own label so that changing how many draws one stage makes
   * never reshuffles the output of another stage.
   */
  fork(label: string): Rng {
    return new Rng(hashSeed(`${this.seedValue}:${label}`));
  }

  /** float in [0, 1) */
  next(): number {
    return this.gen();
  }

  /** integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("Rng.pick: empty array");
    return arr[this.int(0, arr.length - 1)];
  }

  /** pick by weight — items expose a weightPct-like number */
  weighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
    const total = items.reduce((sum, it) => sum + weightOf(it), 0);
    if (total <= 0) return this.pick(items);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= weightOf(item);
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  /** normal distribution via Box–Muller */
  normal(mean: number, sd: number): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * sd;
  }

  /** geometric-ish delay in days, 0-based, p = stop probability per day */
  geometricDays(p: number, maxDays: number): number {
    let d = 0;
    while (d < maxDays && !this.chance(p)) d++;
    return d;
  }

  /** deterministic id: prefix_ + n lowercase alphanumerics */
  id(prefix: string, length = 16): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < length; i++) out += chars[this.int(0, chars.length - 1)];
    return `${prefix}_${out}`;
  }
}
