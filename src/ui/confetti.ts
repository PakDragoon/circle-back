/* A short, quiet confetti burst inside the card. Skipped for people who prefer reduced motion. */

const COLOURS = ["#ef5533", "#ffc83a", "#23946a", "#3b82f6", "#f4a3c0"];

export function confetti(container: HTMLElement, ms = 1600) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  const { width, height } = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  container.append(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const bits = Array.from({ length: 110 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 60,
    y: height * 0.45,
    vx: (Math.random() - 0.5) * 9,
    vy: -Math.random() * 9 - 3,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    w: 5 + Math.random() * 5,
    h: 3 + Math.random() * 4,
    c: COLOURS[Math.floor(Math.random() * COLOURS.length)],
  }));

  const start = performance.now();
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - ms * 0.6) / (ms * 0.4));
    for (const b of bits) {
      b.vy += 0.32;
      b.vx *= 0.99;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (t < ms) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
