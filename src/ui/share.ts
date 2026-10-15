import { FREE, fmtDuration, lines, markedCount, type Game } from "../lib/game";

/* Draws the card as a PNG and puts it on the clipboard, ready to paste into
 * Slack or Teams. Falls back to downloading the image if the clipboard is blocked. */

const W = 900, PAD = 48, GAP = 10;
const CELL = (W - PAD * 2 - GAP * 4) / 5;

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > max && line) {
      out.push(line);
      line = w;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawCard(g: Game, packName: string): HTMLCanvasElement {
  const top = 150;
  const H = top + CELL * 5 + GAP * 4 + 120;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const font = (w: number, s: number) => `${w} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  ctx.fillStyle = "#fffaf1";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ef5533";
  roundRect(ctx, PAD, 44, 52, 52, 13);
  ctx.fill();
  ctx.fillStyle = "#fff";
  [[0, 0], [1, 1], [2, 2]].forEach(([x, y]) => {
    roundRect(ctx, PAD + 9 + x * 12.5, 53 + y * 12.5, 9, 9, 2.5);
    ctx.fill();
  });

  ctx.fillStyle = "#1f1a1c";
  ctx.font = font(800, 34);
  ctx.textBaseline = "alphabetic";
  ctx.fillText(g.bingoAt ? "BINGO!" : "Meeting bingo", PAD + 70, 80);
  ctx.fillStyle = "#8d8386";
  ctx.font = font(500, 20);
  ctx.fillText(packName, PAD + 72, 108);

  const win = new Set(lines(g.marked).flat());
  g.cells.forEach((cell, i) => {
    const x = PAD + (i % 5) * (CELL + GAP);
    const y = top + Math.floor(i / 5) * (CELL + GAP);
    const free = i === FREE;
    const on = g.marked[i] && !free;
    ctx.fillStyle = free ? "#f6eedf" : on ? "#ef5533" : "#ffffff";
    roundRect(ctx, x, y, CELL, CELL, 16);
    ctx.fill();
    ctx.lineWidth = win.has(i) && !free ? 6 : 2;
    ctx.strokeStyle = win.has(i) && !free ? "#ffc83a" : on ? "#ef5533" : "#e8dcc8";
    ctx.stroke();

    ctx.fillStyle = free ? "#5d5457" : on ? "#ffffff" : "#1f1a1c";
    ctx.font = font(free ? 800 : 650, 19);
    ctx.textAlign = "center";
    const ls = wrap(ctx, free ? "FREE" : cell.label, CELL - 18).slice(0, 4);
    const lh = 23;
    ls.forEach((l, k) => ctx.fillText(l, x + CELL / 2, y + CELL / 2 - ((ls.length - 1) * lh) / 2 + k * lh + 7));
    ctx.textAlign = "left";
  });

  const by = top + CELL * 5 + GAP * 4 + 60;
  ctx.fillStyle = "#1f1a1c";
  ctx.font = font(700, 22);
  const summary = g.bingoAt ? `Bingo in ${fmtDuration(g.bingoAt - g.startedAt)}` : `${markedCount(g)} of 24 marked`;
  ctx.fillText(summary, PAD, by);
  ctx.fillStyle = "#8d8386";
  ctx.font = font(500, 18);
  ctx.textAlign = "right";
  ctx.fillText("Circle Back · meeting bingo", W - PAD, by);
  ctx.textAlign = "left";
  return c;
}

export async function copyCardImage(g: Game, packName: string): Promise<boolean> {
  const canvas = drawCard(g, packName);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "circle-back-bingo.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return false;
  }
}
