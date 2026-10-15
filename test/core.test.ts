import { describe, expect, it } from "vitest";
import { Matcher, normalise } from "../src/lib/match";
import { PACKS, customPack, packById } from "../src/lib/packs";
import { FREE, closest, lines, newCode, newGame, packFromCode, resolvePack } from "../src/lib/game";

describe("matcher", () => {
  const m = new Matcher([
    { label: "Mute", says: ["you're on mute", "you are muted"] },
    { label: "Circle back", says: ["circle back", "circling back"] },
    { label: "ETA", says: ["eta"] },
    { label: "Free", says: [] },
  ]);
  it("normalises punctuation, case and curly quotes", () => {
    expect(normalise("YOU’RE  on   mute!!")).toBe("you're on mute");
  });
  it("matches with or without apostrophes", () => {
    expect(m.find("Sorry, youre on mute")).toEqual([0]);
    expect(m.find("I think you're on mute, Sam.")).toEqual([0]);
  });
  it("matches variants and several phrases at once", () => {
    expect(m.find("Let's circle back. You are muted.")).toEqual([0, 1]);
    expect(m.find("Circling back on this")).toEqual([1]);
  });
  it("only matches whole words", () => {
    expect(m.find("the theta value and metadata")).toEqual([]);
    expect(m.find("what's the ETA?")).toEqual([2]);
  });
  it("never matches the free square", () => {
    expect(m.find("")).toEqual([]);
    expect(m.find("anything at all")).toEqual([]);
  });
});

describe("packs", () => {
  it("every pack has enough distinct phrases for a card", () => {
    for (const p of PACKS) {
      expect(p.phrases.length, p.id).toBeGreaterThanOrEqual(24);
      expect(new Set(p.phrases.map((x) => x.label)).size, p.id).toBe(p.phrases.length);
    }
  });
  it("parses custom phrases with alternatives", () => {
    const c = customPack("Kaizen\nJust a sec | one sec | give me a sec\n\n");
    expect(c.phrases).toEqual([
      { label: "Kaizen", says: ["Kaizen"] },
      { label: "Just a sec", says: ["Just a sec", "one sec", "give me a sec"] },
    ]);
  });
  it("falls back to a built-in pack when the custom one is too short", () => {
    expect(resolvePack("custom", "a\nb").id).toBe("corporate");
  });
});

describe("cards", () => {
  const pack = packById("remote");
  it("has 25 cells with a free, pre-marked middle", () => {
    const g = newGame(pack);
    expect(g.cells).toHaveLength(25);
    expect(g.cells[FREE].label).toBe("Free");
    expect(g.marked.filter(Boolean)).toHaveLength(1);
    expect(new Set(g.cells.map((c) => c.label)).size).toBe(25);
  });
  it("same team code and name gives the same card; different names differ", () => {
    const a = newGame(pack, { code: "RM-7KQ2", player: "Hassan" });
    const b = newGame(pack, { code: "rm-7kq2", player: "hassan" });
    const c = newGame(pack, { code: "RM-7KQ2", player: "Rijja" });
    expect(a.cells.map((x) => x.label)).toEqual(b.cells.map((x) => x.label));
    expect(a.cells.map((x) => x.label)).not.toEqual(c.cells.map((x) => x.label));
  });
  it("team codes carry their pack", () => {
    const code = newCode("engineering");
    expect(code).toMatch(/^EN-[A-Z2-9]{4}$/);
    expect(packFromCode(code.toLowerCase())).toBe("engineering");
    expect(packFromCode("nope")).toBeNull();
  });
  it("detects rows, columns and diagonals", () => {
    const m = Array(25).fill(false);
    m[FREE] = true;
    expect(lines(m)).toEqual([]);
    expect(closest(m)).toBe(4);
    [0, 6, 18].forEach((i) => (m[i] = true));
    expect(closest(m)).toBe(1);
    m[24] = true;
    expect(lines(m)).toEqual([[0, 6, 12, 18, 24]]);
    [2, 7, 17, 22].forEach((i) => (m[i] = true));
    expect(lines(m)).toHaveLength(2);
  });
});
