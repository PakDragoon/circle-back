import { build, context } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

/* Bundles each entry point as its own script (content scripts can't be ES modules)
 * and copies the static files into dist/, which is what you load in chrome://extensions. */

const watch = process.argv.includes("--watch");
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

const opts = {
  entryPoints: {
    content: "src/content.ts",
    "popup/popup": "src/popup/popup.ts",
    "card/card": "src/card/card.ts",
    "options/options": "src/options/options.ts",
  },
  outdir: "dist",
  bundle: true,
  format: "iife",
  target: "chrome116",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  logLevel: "info",
};

const copy = () => {
  cpSync("src/manifest.json", "dist/manifest.json");
  cpSync("src/icons", "dist/icons", { recursive: true });
  for (const f of ["popup/index.html", "card/index.html", "options/index.html", "ui/page.css"]) cpSync(`src/${f}`, `dist/${f}`);
};

if (watch) {
  const ctx = await context(opts);
  copy();
  await ctx.watch();
  console.log("watching… reload the extension in chrome://extensions after changes");
} else {
  await build(opts);
  copy();
}
