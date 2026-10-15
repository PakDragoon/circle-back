/* Where each meeting app puts its live captions, and how to tell you're in a call.
 * Meeting apps change their pages often, so all of that knowledge lives here.
 * Selectors prefer accessibility attributes and test IDs over styling class names. */

export type PlatformId = "meet" | "teams" | "zoom";

export interface Platform {
  id: PlatformId;
  name: string;
  /** True when the page is an actual call, not the lobby, chat or home screen. */
  inCall: (loc: Location, doc: Document) => boolean;
  /** A stable key for this meeting, so a reload keeps your card. */
  meetingKey: (loc: Location) => string;
  /** Elements whose text is the live captions. */
  captions: string[];
  /** How to turn captions on, shown when none are found. */
  captionHint: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "meet",
    name: "Google Meet",
    inCall: (loc) => /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\/|$)/.test(loc.pathname),
    meetingKey: (loc) => `meet${loc.pathname.slice(0, 13)}`,
    captions: [
      '[role="region"][aria-label*="aption" i]',
      '[jsname="dsyhDe"]',
      ".a4cQT",
    ],
    captionHint: "Turn on captions (CC, or press C) to mark squares automatically.",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    inCall: (_loc, doc) =>
      !!doc.querySelector('[data-tid="hangup-main-btn"], [data-tid="call-hangup"], #hangup-button, [data-tid*="hangup" i]'),
    meetingKey: () => "teams-call",
    captions: [
      '[data-tid="closed-caption-renderer-wrapper"]',
      '[data-tid="closed-captions-renderer"]',
      '[data-tid="closed-caption-text"]',
    ],
    captionHint: "Turn on live captions (More, Language and speech) to mark squares automatically.",
  },
  {
    id: "zoom",
    name: "Zoom",
    inCall: (loc) => /\/wc\//.test(loc.pathname),
    meetingKey: (loc) => `zoom${(/\/wc\/(\d+)/.exec(loc.pathname) || [])[1] ?? ""}`,
    captions: [
      "#live-transcription-subtitle",
      ".live-transcription-subtitle__box",
      '[class*="live-transcription-subtitle"]',
    ],
    captionHint: "Turn on captions (the CC button) to mark squares automatically.",
  },
];

export function platformFor(host: string): Platform | null {
  if (host === "meet.google.com") return PLATFORMS[0];
  if (/(^|\.)teams\.(microsoft|live)\.com$|^teams\.cloud\.microsoft$/.test(host)) return PLATFORMS[1];
  if (/(^|\.)zoom\.us$/.test(host)) return PLATFORMS[2];
  return null;
}

/** Text of every caption element on the page, outermost matches only. */
export function readCaptions(p: Platform, doc: Document): { found: boolean; text: string } {
  const els = new Set<Element>();
  for (const sel of p.captions) doc.querySelectorAll(sel).forEach((e) => els.add(e));
  const outer = [...els].filter((e) => ![...els].some((o) => o !== e && o.contains(e)));
  return { found: outer.length > 0, text: outer.map((e) => (e as HTMLElement).innerText || e.textContent || "").join("\n") };
}
