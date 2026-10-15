import { fmtDuration } from "../lib/game";
import { getStats } from "../lib/store";
import { LOGO_SVG } from "../ui/styles";

/* Toolbar popup: what's happening on this tab, your stats, and the manual card for desktop apps. */

const app = document.getElementById("app")!;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...kids: (Node | string | false | null | undefined)[]) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (k === "html") el.innerHTML = String(v);
    else el.setAttribute(k, String(v));
  }
  for (const c of kids) if (c != null && c !== false) el.append(c);
  return el;
}

type Ping = { platform: string | null; inCall: boolean; showing: boolean } | null;

async function pingTab(): Promise<{ tabId: number | null; info: Ping }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return { tabId: null, info: null };
  try {
    const info = await chrome.tabs.sendMessage(tab.id, { type: "ping" });
    return { tabId: tab.id, info };
  } catch {
    return { tabId: tab.id, info: null }; // not a meeting page
  }
}

function openCardWindow() {
  chrome.windows.create({ url: chrome.runtime.getURL("card/index.html"), type: "popup", width: 400, height: 640 });
  window.close();
}

(async () => {
  const [{ tabId, info }, stats] = await Promise.all([pingTab(), getStats()]);

  const brand = h("div", { class: "brand" });
  brand.innerHTML = LOGO_SVG;
  brand.append(h("div", {}, h("b", {}, "Circle Back"), h("div", { class: "muted", style: "font-size:12px" }, "Meeting bingo that marks itself")));

  let here: HTMLElement;
  if (info?.inCall) {
    here = h("div", { class: "here" },
      h("p", {}, info.showing ? `Your card is on this ${info.platform} call.` : `Your card is hidden on this ${info.platform} call.`),
      !info.showing && h("div", { class: "row" }, h("button", { class: "btn primary", onclick: async () => {
        await chrome.tabs.sendMessage(tabId!, { type: "show" });
        window.close();
      } }, "Show my card")),
    );
  } else if (info) {
    here = h("div", { class: "here" }, h("p", {}, `Join a ${info.platform} call and your card appears on its own.`));
  } else {
    here = h("div", { class: "here" },
      h("p", {}, "Your card appears on its own in Google Meet, Microsoft Teams and Zoom calls in Chrome."),
      h("p", {}, "In the desktop apps, open a card in its own window and tap squares as you hear them."),
      h("div", { class: "row" }, h("button", { class: "btn primary", onclick: openCardWindow }, "Open a card")),
    );
  }

  const top = Object.entries(stats.heard).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] || 1;
  const statBox = (n: string, label: string) => h("div", { class: "stat" }, h("b", {}, n), h("span", {}, label));

  app.append(
    brand,
    here,
    h("div", { class: "stats" },
      statBox(String(stats.bingos), stats.bingos === 1 ? "bingo" : "bingos"),
      statBox(stats.fastestMs == null ? "–" : fmtDuration(stats.fastestMs).replace("under a minute", "<1 min"), "fastest"),
      statBox(String(stats.games), stats.games === 1 ? "card" : "cards"),
    ),
    h("div", {},
      h("h2", {}, "Most heard"),
      top.length
        ? h("ol", {}, ...top.map(([label, n]) => h("li", {}, h("span", { class: "l", title: label }, label), h("span", { class: "bar" }, h("i", { style: `width:${Math.round((n / max) * 100)}%` })), h("span", { class: "n" }, String(n)))))
        : h("p", { class: "empty" }, "Nothing yet. Phrases the captions catch will show up here."),
    ),
    h("div", { class: "row" },
      h("button", { class: "btn", onclick: () => chrome.runtime.openOptionsPage() }, "Settings"),
    ),
  );
})();
