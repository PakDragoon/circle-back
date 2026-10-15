/* Card styles, shared by the in-meeting overlay (inside a shadow root, so the
 * meeting page's CSS can't leak in) and the pop-out card window. */

export const CARD_CSS = `
:host, .cb-root {
  --paper: #fffaf1; --paper-2: #f6eedf; --ink: #1f1a1c; --ink-2: #5d5457; --ink-3: #8d8386;
  --line: #e8dcc8; --coral: #ef5533; --coral-ink: #ffffff; --coral-soft: #fde4da;
  --sun: #ffc83a; --mint: #23946a; --amber: #c27c0e;
  --shadow: 0 18px 50px -12px rgba(20, 12, 8, .45), 0 0 0 1px rgba(20, 12, 8, .08);
  all: initial;
  font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ink);
}
@media (prefers-color-scheme: dark) {
  :host, .cb-root {
    --paper: #221c1e; --paper-2: #2c2427; --ink: #f6eee6; --ink-2: #c9bdb6; --ink-3: #998d88;
    --line: #3d3337; --coral-soft: #4a2a22; --mint: #4cc795; --amber: #f0b44c;
    --shadow: 0 18px 50px -12px rgba(0, 0, 0, .7), 0 0 0 1px rgba(255, 255, 255, .08);
  }
}
* { box-sizing: border-box; }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--coral); outline-offset: 2px; }

.card { position: relative; width: 344px; background: var(--paper); border-radius: 18px; box-shadow: var(--shadow); overflow: hidden; }
.card.page { box-shadow: none; border-radius: 0; width: 100%; max-width: 420px; margin: 0 auto; }

.hd { display: flex; align-items: center; gap: 8px; padding: 10px 10px 8px 14px; cursor: grab; user-select: none; }
.page .hd { cursor: default; }
.hd:active { cursor: grabbing; }
.logo { width: 22px; height: 22px; flex: none; }
.title { font-weight: 750; letter-spacing: -.01em; font-size: 14px; }
.pack { color: var(--ink-3); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.hd .sp { flex: 1; }
.icon { width: 28px; height: 28px; border: 0; background: transparent; border-radius: 8px; display: grid; place-items: center; color: var(--ink-2); flex: none; }
.icon:hover { background: var(--paper-2); color: var(--ink); }

.status { display: flex; align-items: center; gap: 7px; margin: 0 14px 10px; font-size: 12px; color: var(--ink-2); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-3); flex: none; }
.status.listening .dot { background: var(--mint); box-shadow: 0 0 0 0 rgba(35,148,106,.6); animation: pulse 1.8s infinite; }
.status.waiting .dot { background: var(--amber); }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(35,148,106,.55); } 70% { box-shadow: 0 0 0 7px rgba(35,148,106,0); } 100% { box-shadow: 0 0 0 0 rgba(35,148,106,0); } }

.grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; padding: 0 12px; }
.cell { position: relative; aspect-ratio: 1; border: 1px solid var(--line); background: var(--paper); border-radius: 9px; padding: 3px;
  display: grid; place-items: center; text-align: center; font-size: 10.5px; line-height: 1.15; font-weight: 600; color: var(--ink);
  hyphens: auto; -webkit-hyphens: auto; overflow-wrap: break-word; transition: background-color .18s, color .18s, transform .18s; }
.cell:hover { border-color: var(--coral); }
.cell[aria-pressed="true"] { background: var(--coral); border-color: var(--coral); color: var(--coral-ink); }
.cell.free { background: var(--paper-2); color: var(--ink-2); font-weight: 750; letter-spacing: .04em; text-transform: uppercase; font-size: 10px; }
.cell.free[aria-pressed="true"] { background: var(--paper-2); color: var(--ink-2); border-color: var(--line); }
.cell.win { box-shadow: 0 0 0 2px var(--sun); }
.cell.just { animation: pop .45s ease; }
@keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
.cell .heard { position: absolute; right: 3px; top: 3px; width: 10px; height: 10px; opacity: .9; }

.ft { display: grid; gap: 8px; padding: 10px 14px 14px; }
.progress { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; color: var(--ink-2); }
.progress b { color: var(--ink); }
.row { display: flex; gap: 6px; align-items: center; }
.btn { border: 1px solid var(--line); background: var(--paper); border-radius: 10px; padding: 7px 11px; font-weight: 600; font-size: 12.5px; white-space: nowrap; }
.btn:hover { border-color: var(--ink-3); }
.btn.primary { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.btn.coral { background: var(--coral); color: var(--coral-ink); border-color: var(--coral); }
.chip { margin-left: auto; border: 1px dashed var(--line); background: transparent; border-radius: 999px; padding: 5px 10px; font-size: 11.5px; color: var(--ink-2); white-space: nowrap; }
.chip b { color: var(--ink); font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: .04em; }
.chip:hover { border-color: var(--coral); }
.note { font-size: 11.5px; color: var(--ink-3); min-height: 1em; }

.new { display: grid; gap: 8px; margin: 0 12px 4px; padding: 12px; border-radius: 12px; background: var(--paper-2); }
.new label { display: grid; gap: 4px; font-size: 11.5px; font-weight: 650; color: var(--ink-2); }
.new select, .new input { border: 1px solid var(--line); background: var(--paper); border-radius: 8px; padding: 7px 8px; font-weight: 500; font-size: 12.5px; }
.new input { text-transform: uppercase; font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: .05em; }
.new input::placeholder { text-transform: none; font-family: system-ui, sans-serif; letter-spacing: 0; }
.new .err { color: var(--coral); font-size: 11.5px; }

.bingo { margin: 0 12px 2px; padding: 12px 14px; border-radius: 12px; background: var(--sun); color: #2a1d00; display: grid; gap: 2px; }
.bingo strong { font-size: 22px; font-weight: 850; letter-spacing: .02em; line-height: 1; }
.bingo span { font-size: 12px; }

.pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px 8px 9px; border-radius: 999px; background: var(--paper); border: 0;
  box-shadow: var(--shadow); font-weight: 650; font-size: 12.5px; cursor: grab; user-select: none; }
.pill .logo { width: 20px; height: 20px; }
.pill .count { color: var(--ink-2); font-weight: 600; }
.pill.won { background: var(--sun); color: #2a1d00; }

canvas.confetti { position: absolute; inset: 0; pointer-events: none; width: 100%; height: 100%; }
@media (prefers-reduced-motion: reduce) { .cell.just, .status.listening .dot { animation: none; } }
`;

export const LOGO_SVG = `<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#ef5533"/><g fill="#fff"><rect x="12" y="12" width="11" height="11" rx="3"/><rect x="26.5" y="12" width="11" height="11" rx="3" opacity=".45"/><rect x="41" y="12" width="11" height="11" rx="3" opacity=".45"/><rect x="12" y="26.5" width="11" height="11" rx="3" opacity=".45"/><rect x="26.5" y="26.5" width="11" height="11" rx="3"/><rect x="41" y="26.5" width="11" height="11" rx="3" opacity=".45"/><rect x="12" y="41" width="11" height="11" rx="3" opacity=".45"/><rect x="26.5" y="41" width="11" height="11" rx="3" opacity=".45"/><rect x="41" y="41" width="11" height="11" rx="3"/></g></svg>`;
