import type { Phrase } from "./packs";

/* Finds phrases in caption text. Captions arrive in all sorts of shapes
 * ("You're on mute.", "you are on mute", "YOU'RE ON MUTE!"), so both the
 * text and the phrases are normalised the same way before matching. */

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One regex per phrase. Apostrophes are optional so "youre" and "you're" both match. */
export function compile(phrase: Phrase): RegExp {
  const alts = phrase.says
    .map(normalise)
    .filter(Boolean)
    .map((s) => s.split(" ").map((w) => esc(w).replace(/'/g, "'?")).join(" "));
  if (!alts.length) return /(?!)/; // matches nothing (the free square)
  return new RegExp(`(?:^| )(?:${alts.join("|")})(?= |$)`);
}

export class Matcher {
  private res: RegExp[];
  constructor(phrases: Phrase[]) {
    this.res = phrases.map(compile);
  }
  /** Indexes of the phrases that appear in the text. */
  find(text: string): number[] {
    const t = normalise(text);
    const out: number[] = [];
    this.res.forEach((re, i) => re.test(t) && out.push(i));
    return out;
  }
}
