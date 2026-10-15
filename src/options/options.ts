import { customPack, PACKS } from "../lib/packs";
import { getSettings, resetStats, saveSettings } from "../lib/store";
import { LOGO_SVG } from "../ui/styles";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
$("brand").insertAdjacentHTML("afterbegin", LOGO_SVG);

const pack = $<HTMLSelectElement>("packId");
for (const p of [...PACKS, { id: "custom", name: "Your phrases" }]) pack.add(new Option(p.name, p.id));

const custom = $<HTMLTextAreaElement>("custom");
const count = $("count");
const showCount = () => {
  const n = customPack(custom.value).phrases.length;
  count.textContent = n >= 24 ? `${n} phrases. Ready to play.` : `${n} of 24 phrases.`;
  count.className = `count${n && n < 24 ? " bad" : ""}`;
};
custom.addEventListener("input", showCount);

const flash = (el: HTMLElement, msg: string) => {
  el.textContent = msg;
  setTimeout(() => (el.textContent = ""), 2500);
};

(async () => {
  const s = await getSettings();
  pack.value = s.packId;
  $<HTMLInputElement>("player").value = s.player;
  custom.value = s.custom;
  $<HTMLInputElement>("autoMark").checked = s.autoMark;
  for (const k of ["meet", "teams", "zoom"] as const) $<HTMLInputElement>(k).checked = s.showOn[k];
  showCount();
})();

$("save").addEventListener("click", async () => {
  const n = customPack(custom.value).phrases.length;
  if (pack.value === "custom" && n < 24) {
    flash($("saved"), "Add at least 24 phrases to use your own pack.");
    return;
  }
  await saveSettings({
    packId: pack.value,
    player: $<HTMLInputElement>("player").value.trim(),
    custom: custom.value,
    autoMark: $<HTMLInputElement>("autoMark").checked,
    showOn: { meet: $<HTMLInputElement>("meet").checked, teams: $<HTMLInputElement>("teams").checked, zoom: $<HTMLInputElement>("zoom").checked },
  });
  flash($("saved"), "Saved. New cards will use these settings.");
});

$("reset").addEventListener("click", async () => {
  if (!confirm("Reset your bingo stats? This can't be undone.")) return;
  await resetStats();
  flash($("resetMsg"), "Stats reset.");
});
