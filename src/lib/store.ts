import type { Game } from "./game";

/* Settings and lifetime stats live in chrome.storage.local.
 * No caption text is ever stored: only which phrases were heard and how often. */

export interface Settings {
  packId: string;
  custom: string;      // custom phrases, one per line
  player: string;      // name used with team codes
  autoMark: boolean;   // mark squares from captions
  showOn: { meet: boolean; teams: boolean; zoom: boolean };
}

export interface Stats {
  heard: Record<string, number>; // phrase label -> times heard
  games: number;
  bingos: number;
  fastestMs: number | null;
  since: number;
}

export const DEFAULT_SETTINGS: Settings = {
  packId: "corporate",
  custom: "",
  player: "",
  autoMark: true,
  showOn: { meet: true, teams: true, zoom: true },
};

const emptyStats = (): Stats => ({ heard: {}, games: 0, bingos: 0, fastestMs: null, since: Date.now() });

export async function getSettings(): Promise<Settings> {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}), showOn: { ...DEFAULT_SETTINGS.showOn, ...(settings?.showOn || {}) } };
}

export const saveSettings = (s: Settings) => chrome.storage.local.set({ settings: s });

export async function getStats(): Promise<Stats> {
  const { stats } = await chrome.storage.local.get("stats");
  return { ...emptyStats(), ...(stats || {}) };
}

// Updates run one after another so two quick ones (a phrase heard and a bingo) can't overwrite each other.
let queue: Promise<void> = Promise.resolve();
export function updateStats(fn: (s: Stats) => void): Promise<void> {
  queue = queue.then(async () => {
    const s = await getStats();
    fn(s);
    await chrome.storage.local.set({ stats: s });
  }).catch(() => {});
  return queue;
}

export const resetStats = () => chrome.storage.local.set({ stats: emptyStats() });

/* The manual card (for meetings in desktop apps) is kept in storage so the window can be closed and reopened. */
export async function getManualGame(): Promise<Game | null> {
  const { manualGame } = await chrome.storage.local.get("manualGame");
  return manualGame || null;
}
export const saveManualGame = (g: Game) => chrome.storage.local.set({ manualGame: g });

/** Random per-install ID, used in place of a name so teammates on the same code still get different cards. */
export async function installId(): Promise<string> {
  const { installId: id } = await chrome.storage.local.get("installId");
  if (id) return id;
  const fresh = Math.random().toString(36).slice(2, 10);
  await chrome.storage.local.set({ installId: fresh });
  return fresh;
}
