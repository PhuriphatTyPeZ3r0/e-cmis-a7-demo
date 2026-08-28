import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");

const CSS = [
  "assets/ecmis.css",
  "assets/ecmis-workspace.css",
  "assets/activity5-workspace.css",
  "assets/activity5-document-workspace.css",
  "assets/activity5-extension-workspace.css"
].map(f => `<link rel="stylesheet" href="file://${ROOT}/${f}">`).join("\n");

export async function shoot(html, outPath, { selector = ".a4-paper, .a5r-paper, .a5-report-paper, article" } = {}) {
  const page = `<!doctype html><html lang="th"><head><meta charset="utf-8">${CSS}<style>body{background:#e5e7eb;padding:24px;}</style></head><body><div id="a5App">${html}</div></body></html>`;
  const browser = await chromium.launch();
  const browserPage = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  await browserPage.setContent(page, { waitUntil: "load" });
  const target = await browserPage.$(selector);
  if (!target) {
    console.error(`NO MATCH for selector "${selector}" in ${outPath}`);
    await browserPage.screenshot({ path: outPath, fullPage: true });
  } else {
    await target.screenshot({ path: outPath });
  }
  await browser.close();
}

export { require, ROOT };
