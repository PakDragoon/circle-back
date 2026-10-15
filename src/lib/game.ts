import { customPack, packById, type Pack, type Phrase } from "./packs";

/* A game is one 5×5 card. The middle square is free. Cards are generated
 * from a seed, so a team code gives everyone a card from the same pack
 * while each person's card is still different. */

export const SIZE = 5;
export const FREE = 12;

export interface Game {
  packId: string;
  seed: string;
  code: string;        // team code, e.g. "RM-7KQ2"
  cells: Phrase[];     // 25 cells; cells[FREE] is the free square
  marked: boolean[];
  heardAt: (number | null)[]; // when captions marked the square (ms since start), null if tapped or unmarked
  startedAt: number;
  bingoAt: number | null;
}

/* cyrb53 string hash and mulberry32 PRNG: small, fast, good enough for shuffling. */
export function hash(str: string): number {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function rng(seed: string) {
  let a = hash(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const PACK_TAG: Record<string, string> = { corporate: "CO", remote: "RM", engineering: "EN", sales: "SA", custom: "MY" };

export function newCode(packId: string, random = Math.random): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(random() * CODE_CHARS.length)];
  return `${PACK_TAG[packId] ?? "CO"}-${s}`;
}

/** Which pack a team code belongs to, or null if it isn't a valid code. */
export function packFromCode(code: string): string | null {
  const m = /^([A-Z]{2})-([A-Z0-9]{4})$/.exec(code.trim().toUpperCase());
  if (!m) return null;
  const id = Object.entries(PACK_TAG).find(([, tag]) => tag === m[1])?.[0];
  return id ?? null;
}

export function resolvePack(packId: string, custom: string): Pack {
  if (packId === "custom") {
    const c = customPack(custom);
    if (c.phrases.length >= 24) return c;
  }
  return packById(packId === "custom" ? "corporate" : packId);
}

export function newGame(pack: Pack, opts: { code?: string; player?: string; now?: number } = {}): Game {
  const code = opts.code?.toUpperCase() || newCode(pack.id);
  const seed = `${code}:${(opts.player || "").toLowerCase()}:${opts.code ? "" : Math.random()}`;
  const r = rng(seed);
  const pool = [...pack.phrases];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 24);
  const cells = [...picked.slice(0, FREE), { label: "Free", says: [] }, ...picked.slice(FREE)];
  const marked = cells.map((_, i) => i === FREE);
  return { packId: pack.id, seed, code, cells, marked, heardAt: cells.map(() => null), startedAt: opts.now ?? Date.now(), bingoAt: null };
}

const ALL_LINES: number[][] = (() => {
  const all: number[][] = [];
  for (let r = 0; r < SIZE; r++) all.push([0, 1, 2, 3, 4].map((c) => r * SIZE + c));
  for (let c = 0; c < SIZE; c++) all.push([0, 1, 2, 3, 4].map((r) => r * SIZE + c));
  all.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return all;
})();

/** All complete lines (rows, columns, both diagonals) as lists of cell indexes. */
export const lines = (marked: boolean[]) => ALL_LINES.filter((l) => l.every((i) => marked[i]));

/** How many squares away from the closest bingo. */
export const closest = (marked: boolean[]) => Math.min(...ALL_LINES.map((l) => l.filter((i) => !marked[i]).length));

export function markedCount(g: Game) {
  return g.marked.filter((m, i) => m && i !== FREE).length;
}

export function fmtDuration(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 1) return "under a minute";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
