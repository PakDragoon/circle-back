import { newGame, resolvePack } from "../lib/game";
import { getManualGame, getSettings, installId, saveManualGame, updateStats } from "../lib/store";
import { Controller, View } from "../ui/board";
import { CARD_CSS } from "../ui/styles";

/* The card in its own window, for meetings in desktop apps where captions can't be read.
 * You tap squares yourself; the card is saved so you can close the window and come back. */

(async () => {
  const style = document.createElement("style");
  style.textContent = CARD_CSS;
  document.head.append(style);

  const ctl = new Controller((g) => saveManualGame(g));
  const view = new View(document.getElementById("app")!, ctl, { mode: "page" });
  view.status = { kind: "manual", text: "Tap a square when you hear it." };

  const saved = await getManualGame();
  // a card older than 12 hours belongs to another meeting
  if (saved && Date.now() - saved.startedAt < 12 * 3600_000) ctl.load(saved);
  else {
    const s = await getSettings();
    const g = newGame(resolvePack(s.packId, s.custom), { player: s.player || (await installId()) });
    await saveManualGame(g);
    await updateStats((st) => void st.games++);
    ctl.load(g);
  }
})();
