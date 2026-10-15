import { newGame, resolvePack, type Game } from "./lib/game";
import { Matcher } from "./lib/match";
import { platformFor, readCaptions, type Platform } from "./lib/platforms";
import { getSettings, installId, updateStats, type Settings } from "./lib/store";
import { Controller, View } from "./ui/board";
import { CARD_CSS } from "./ui/styles";

/* Runs on Meet, Teams and Zoom web pages. Shows the floating card while you're
 * in a call, and marks squares when their phrases show up in the live captions.
 * Caption text is read and matched in memory only; it is never stored or sent anywhere. */

const platform = platformFor(location.hostname);
const SCAN_MS = 800;
const POS_KEY = "overlayPos";

let mounted: { host: HTMLElement; ctl: Controller; view: View; key: string } | null = null;
let mounting = false;
let settings: Settings;
let visible = new Set<number>(); // phrases on screen in the last scan, so each hearing is counted once
let lastCaptionAt = 0;

const storeKey = (key: string) => `circle-back:${key}`;
const hiddenKey = (key: string) => `circle-back:hidden:${key}`;

function loadGame(key: string): Game | null {
  try {
    return JSON.parse(sessionStorage.getItem(storeKey(key)) || "null");
  } catch {
    return null;
  }
}

function saveGame(key: string, g: Game) {
  try {
    sessionStorage.setItem(storeKey(key), JSON.stringify(g));
  } catch {
    /* storage full or blocked: the card still works for this page view */
  }
}

async function mount(p: Platform) {
  const key = p.meetingKey(location);
  if (mounting || mounted?.key === key) return;
  mounting = true;
  try {
    await doMount(p, key);
  } finally {
    mounting = false;
  }
}

async function doMount(p: Platform, key: string) {
  unmount();

  const host = document.createElement("circle-back-card");
  host.style.cssText = "position:fixed;z-index:2147483646;left:0;top:0;";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = CARD_CSS;
  shadow.append(style);
  document.documentElement.append(host);

  const ctl = new Controller((g) => saveGame(key, g));
  let dragged = false;
  const view = new View(shadow, ctl, {
    mode: "overlay",
    onMinimize: () => {
      if (dragged) return void (dragged = false);
      view.setMinimized(!view.minimized);
      keepOnScreen(host);
    },
    onClose: () => {
      sessionStorage.setItem(hiddenKey(key), "1");
      unmount();
    },
    onDragStart: (ev) => startDrag(ev, host, () => (dragged = true)),
    onRender: () => host.dataset.x && keepOnScreen(host),
  });

  const existing = loadGame(key);
  if (existing) ctl.load(existing);
  else {
    const pack = resolvePack(settings.packId, settings.custom);
    ctl.load(newGame(pack, { player: settings.player || (await installId()) }));
    saveGame(key, ctl.game);
    await updateStats((s) => void s.games++);
  }

  mounted = { host, ctl, view, key };
  await placeFromStorage(host);
  scan();
}

// one matcher per card; dealing a new card gets a new one
const matcherCache = new WeakMap<Game, Matcher>();
function matcherFor(g: Game) {
  let m = matcherCache.get(g);
  if (!m) matcherCache.set(g, (m = new Matcher(g.cells)));
  return m;
}

function unmount() {
  mounted?.host.remove();
  mounted = null;
  visible = new Set();
}

function scan() {
  if (!mounted || !platform) return;
  const { ctl, view } = mounted;
  if (!settings.autoMark) {
    view.setStatus("manual", "Auto-marking is off. Tap a square when you hear it.");
    return;
  }
  const { found, text } = readCaptions(platform, document);
  if (found) lastCaptionAt = Date.now();
  if (found || Date.now() - lastCaptionAt < 5000) view.setStatus("listening", "Listening to captions");
  else view.setStatus("waiting", platform.captionHint);
  if (!found) return void (visible = new Set());

  const now = new Set(matcherFor(ctl.game).find(text));
  const fresh = [...now].filter((i) => !visible.has(i));
  visible = now;
  if (fresh.length) ctl.heard(fresh);
}

/* ---------- position and dragging ---------- */

function clamp(host: HTMLElement, x: number, y: number) {
  const r = host.getBoundingClientRect();
  return {
    x: Math.min(Math.max(8, x), window.innerWidth - r.width - 8),
    y: Math.min(Math.max(8, y), window.innerHeight - r.height - 8),
  };
}

function place(host: HTMLElement, x: number, y: number) {
  const c = clamp(host, x, y);
  host.style.transform = `translate(${c.x}px, ${c.y}px)`;
  host.dataset.x = String(c.x);
  host.dataset.y = String(c.y);
}

function keepOnScreen(host: HTMLElement) {
  requestAnimationFrame(() => place(host, Number(host.dataset.x || 0), Number(host.dataset.y || 0)));
}

async function placeFromStorage(host: HTMLElement) {
  const { [POS_KEY]: pos } = await chrome.storage.local.get(POS_KEY);
  await new Promise(requestAnimationFrame);
  const r = host.getBoundingClientRect();
  // default: bottom right, above the meeting's control bar
  place(host, pos?.x ?? window.innerWidth - r.width - 20, pos?.y ?? window.innerHeight - r.height - 100);
}

function startDrag(ev: PointerEvent, host: HTMLElement, onMoved: () => void) {
  if (ev.button !== 0) return;
  const sx = ev.clientX, sy = ev.clientY;
  const ox = Number(host.dataset.x || 0), oy = Number(host.dataset.y || 0);
  let moved = false;
  const move = (e: PointerEvent) => {
    if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 4) return;
    moved = true;
    place(host, ox + e.clientX - sx, oy + e.clientY - sy);
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    if (moved) {
      onMoved();
      chrome.storage.local.set({ [POS_KEY]: { x: Number(host.dataset.x), y: Number(host.dataset.y) } });
    }
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

window.addEventListener("resize", () => mounted && keepOnScreen(mounted.host));

/* ---------- lifecycle ---------- */

function tick() {
  if (!platform) return;
  const inCall = settings.showOn[platform.id] && platform.inCall(location, document);
  const key = platform.meetingKey(location);
  if (inCall && !sessionStorage.getItem(hiddenKey(key))) void mount(platform);
  else if (!inCall && mounted) unmount();
  scan();
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type === "ping") {
    reply({ platform: platform?.name ?? null, inCall: !!platform?.inCall(location, document), showing: !!mounted });
  } else if (msg?.type === "show" && platform) {
    sessionStorage.removeItem(hiddenKey(platform.meetingKey(location)));
    void mount(platform).then(() => {
      mounted?.view.setMinimized(false);
      reply({ ok: !!mounted });
    });
    return true;
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    void getSettings().then((s) => {
      settings = s;
      tick();
    });
  }
});

if (platform) {
  void getSettings().then((s) => {
    settings = s;
    tick();
    setInterval(tick, SCAN_MS);
  });
}
