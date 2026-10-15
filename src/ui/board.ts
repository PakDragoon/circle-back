import { FREE, closest, fmtDuration, lines, markedCount, newGame, packFromCode, resolvePack, type Game } from "../lib/game";
import { PACKS } from "../lib/packs";
import { getSettings, installId, updateStats } from "../lib/store";
import { confetti } from "./confetti";
import { copyCardImage } from "./share";
import { LOGO_SVG } from "./styles";

/* The card: game rules (Controller) and what you see (View).
 * Used both in the meeting overlay and in the pop-out card window. */

export type StatusKind = "listening" | "waiting" | "manual";

/* ---------- game logic ---------- */

export class Controller {
  game!: Game;
  private listeners = new Set<(e: { justMarked?: number[]; won?: boolean }) => void>();
  constructor(private save: (g: Game) => void | Promise<void>) {}

  on(fn: (e: { justMarked?: number[]; won?: boolean }) => void) {
    this.listeners.add(fn);
  }
  private emit(e: { justMarked?: number[]; won?: boolean } = {}) {
    this.save(this.game);
    this.listeners.forEach((fn) => fn(e));
  }

  load(g: Game) {
    this.game = g;
    this.listeners.forEach((fn) => fn({}));
  }

  async start(packId: string, code?: string) {
    const s = await getSettings();
    const pack = resolvePack(packId, s.custom);
    this.game = newGame(pack, { code, player: s.player || (await installId()) });
    await updateStats((st) => void st.games++);
    this.emit();
  }

  toggle(i: number) {
    if (i === FREE) return;
    const g = this.game;
    g.marked[i] = !g.marked[i];
    g.heardAt[i] = null;
    this.after([i]);
  }

  /** Squares heard in the captions. Only unmarked squares change; the stats count every hearing. */
  heard(indexes: number[]) {
    const g = this.game;
    const fresh = indexes.filter((i) => i !== FREE && !g.marked[i]);
    const labels = indexes.filter((i) => i !== FREE).map((i) => g.cells[i].label);
    if (labels.length) void updateStats((st) => labels.forEach((l) => (st.heard[l] = (st.heard[l] || 0) + 1)));
    if (!fresh.length) return;
    const t = Date.now() - g.startedAt;
    fresh.forEach((i) => {
      g.marked[i] = true;
      g.heardAt[i] = t;
    });
    this.after(fresh);
  }

  private after(changed: number[]) {
    const g = this.game;
    let won = false;
    if (!g.bingoAt && lines(g.marked).length) {
      g.bingoAt = Date.now();
      won = true;
      const took = g.bingoAt - g.startedAt;
      void updateStats((st) => {
        st.bingos++;
        st.fastestMs = st.fastestMs == null ? took : Math.min(st.fastestMs, took);
      });
    }
    this.emit({ justMarked: changed.filter((i) => g.marked[i]), won });
  }
}

/* ---------- view ---------- */

type Child = Node | string | false | null | undefined;
function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...kids: Child[]) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (k === "html") el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of kids) if (c != null && c !== false) el.append(c);
  return el;
}

const ICON_MIN = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const ICON_X = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const ICON_MIC = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="2" width="8" height="13" rx="4" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`; // marks squares the captions caught

export interface ViewOptions {
  mode: "overlay" | "page";
  onMinimize?: () => void;
  onClose?: () => void;
  onDragStart?: (e: PointerEvent) => void;
  onRender?: () => void;
}

export class View {
  status: { kind: StatusKind; text: string } = { kind: "manual", text: "Tap a square when you hear it." };
  minimized = false;
  private panel = false;
  private note = "";
  private noteTimer = 0;
  private host: HTMLElement;

  constructor(private root: ShadowRoot | HTMLElement, private ctl: Controller, private opts: ViewOptions) {
    this.host = h("div", { class: "cb-root", lang: "en" });
    root.append(this.host);
    ctl.on((e) => this.render(e));
  }

  setStatus(kind: StatusKind, text: string) {
    if (this.status.kind === kind && this.status.text === text) return;
    this.status = { kind, text };
    this.render();
  }

  setMinimized(m: boolean) {
    this.minimized = m;
    this.render();
  }

  private flash(msg: string) {
    this.note = msg;
    this.render();
    clearTimeout(this.noteTimer);
    this.noteTimer = window.setTimeout(() => {
      this.note = "";
      this.render();
    }, 2600);
  }

  render(e: { justMarked?: number[]; won?: boolean } = {}) {
    const g = this.ctl.game;
    if (!g) return;
    this.host.replaceChildren(this.minimized ? this.pill(g) : this.card(g, e));
    this.opts.onRender?.();
  }

  private pill(g: Game) {
    const away = closest(g.marked);
    const pill = h("button", {
      class: `pill${g.bingoAt ? " won" : ""}`,
      title: "Open your bingo card",
      onclick: () => this.opts.onMinimize?.(),
      onpointerdown: (ev: PointerEvent) => this.opts.onDragStart?.(ev),
    });
    pill.innerHTML = LOGO_SVG;
    pill.append(
      h("span", {}, g.bingoAt ? "BINGO!" : "Circle Back"),
      h("span", { class: "count" }, g.bingoAt ? "" : `${markedCount(g)}/24 · ${away === 1 ? "1 away" : `${away} to go`}`),
    );
    return pill;
  }

  private card(g: Game, e: { justMarked?: number[]; won?: boolean }) {
    const packName = PACKS.find((p) => p.id === g.packId)?.name ?? "Your phrases";
    const win = new Set(lines(g.marked).flat());

    const hd = h("div", { class: "hd", onpointerdown: (ev: PointerEvent) => {
      if ((ev.target as HTMLElement).closest("button")) return;
      this.opts.onDragStart?.(ev);
    } });
    hd.innerHTML = LOGO_SVG;
    hd.append(
      h("span", { class: "title" }, "Circle Back"),
      h("span", { class: "pack" }, `· ${packName}`),
      h("span", { class: "sp" }),
      this.opts.onMinimize ? h("button", { class: "icon", title: "Minimise", "aria-label": "Minimise card", html: ICON_MIN, onclick: () => this.opts.onMinimize!() }) : "",
      this.opts.onClose ? h("button", { class: "icon", title: "Hide for this meeting", "aria-label": "Hide card for this meeting", html: ICON_X, onclick: () => this.opts.onClose!() }) : "",
    );

    const status = h("div", { class: `status ${this.status.kind}`, role: "status" }, h("span", { class: "dot" }), this.status.text);

    const grid = h("div", { class: "grid", role: "grid", "aria-label": "Bingo card" });
    g.cells.forEach((c, i) => {
      const free = i === FREE;
      const heard = g.heardAt[i];
      grid.append(
        h("button", {
          class: `cell${free ? " free" : ""}${win.has(i) && !free ? " win" : ""}${e.justMarked?.includes(i) ? " just" : ""}`,
          "aria-pressed": String(g.marked[i]),
          title: free ? "Free square" : heard != null ? `Heard ${fmtDuration(heard)} in` : g.marked[i] ? "Tap to unmark" : "Tap when you hear it",
          onclick: () => this.ctl.toggle(i),
        },
          free ? "Free" : c.label,
          heard != null && h("span", { class: "heard", html: ICON_MIC }),
        ),
      );
    });

    const away = closest(g.marked);
    const bingo = g.bingoAt == null ? null : h("div", { class: "bingo", role: "alert" },
      h("strong", {}, "BINGO!"),
      h("span", {}, `In ${fmtDuration(g.bingoAt - g.startedAt)}. Copy the card and send it to the group chat.`),
    );

    const ft = h("div", { class: "ft" },
      h("div", { class: "progress" },
        h("span", {}, h("b", {}, String(markedCount(g))), " of 24 marked"),
        h("span", {}, g.bingoAt ? `${lines(g.marked).length} line${lines(g.marked).length > 1 ? "s" : ""}` : away === 1 ? "One away from bingo" : `${away} away from bingo`),
      ),
      h("div", { class: "row" },
        h("button", { class: "btn", onclick: () => { this.panel = !this.panel; this.render(); } }, this.panel ? "Cancel" : "New card"),
        h("button", { class: `btn ${g.bingoAt ? "coral" : ""}`, onclick: async () => {
          const ok = await copyCardImage(g, packName);
          this.flash(ok ? "Card copied as an image. Paste it anywhere." : "Couldn't copy here. The image was downloaded instead.");
        } }, "Copy card"),
        h("button", { class: "chip", title: "Copy team code", onclick: async () => {
          try {
            await navigator.clipboard.writeText(g.code);
            this.flash("Team code copied. Teammates enter it under New card.");
          } catch {
            this.flash(`Team code: ${g.code}`);
          }
        } }, "Team ", h("b", {}, g.code)),
      ),
      h("div", { class: "note", role: "status" }, this.note),
    );

    // while dealing a new card, the form takes the grid's place so the card doesn't grow off screen
    const body = this.panel ? [this.newPanel(g)] : [bingo, grid];
    const card = h("div", { class: `card ${this.opts.mode === "page" ? "page" : ""}` }, hd, status, ...body, ft);
    if (e.won) requestAnimationFrame(() => confetti(card));
    return card;
  }

  private newPanel(g: Game) {
    const sel = h("select", { "aria-label": "Phrase pack" },
      ...PACKS.map((p) => h("option", { value: p.id, selected: p.id === g.packId }, p.name)),
      h("option", { value: "custom", selected: g.packId === "custom" }, "Your phrases (set in settings)"),
    ) as HTMLSelectElement;
    const code = h("input", { placeholder: "Team code (optional)", maxlength: "7", "aria-label": "Team code", spellcheck: "false" }) as HTMLInputElement;
    const err = h("div", { class: "err", role: "alert" });
    const go = async () => {
      const c = code.value.trim().toUpperCase();
      let packId = sel.value;
      if (c) {
        const fromCode = packFromCode(c);
        if (!fromCode) {
          err.textContent = "That code doesn't look right. It's like RM-7KQ2.";
          return;
        }
        packId = fromCode;
      }
      this.panel = false;
      await this.ctl.start(packId, c || undefined);
    };
    code.addEventListener("keydown", (ev) => ev.key === "Enter" && go());
    return h("div", { class: "new" },
      h("label", {}, "Phrase pack", sel),
      h("label", {}, "Playing with your team?", code),
      err,
      h("div", { class: "row" }, h("button", { class: "btn primary", onclick: go }, "Deal a new card")),
    );
  }
}
