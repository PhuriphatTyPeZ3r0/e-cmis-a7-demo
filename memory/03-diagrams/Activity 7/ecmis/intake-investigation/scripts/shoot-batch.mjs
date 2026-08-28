import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { startServer } from "./serve.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = "/private/tmp/claude-501/-Users-jetsadasomporn-Downloads-E-CMIS-A4-Production/c3b97818-5bef-4d51-a5a5-0224f1f75982/scratchpad/fidelity";

const CSS = ["assets/ecmis.css", "assets/ecmis-workspace.css", "assets/activity5-workspace.css", "assets/activity5-document-workspace.css"]
  .map(f => `<link rel="stylesheet" href="/${f}">`).join("\n");

const names = process.argv.slice(2);
if (!names.length) { console.error("usage: node shoot-batch.mjs <name1> <name2> ..."); process.exit(1); }

const server = await startServer(8791);
const browser = await chromium.launch();
for (const name of names) {
  const file = `${OUT}/${name}.html`;
  if (!existsSync(file)) { console.log(`SKIP ${name}: no html file`); continue; }
  const html = readFileSync(file, "utf8");
  const page_ = `<!doctype html><html lang="th"><head><meta charset="utf-8">${CSS}</head><body><div id="a5App">${html}</div></body></html>`;
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const failed = [];
  page.on("requestfailed", r => failed.push(r.url()));
  await page.goto("http://localhost:8791/__inline__", { waitUntil: "load" }).catch(() => {});
  await page.setContent(page_, { waitUntil: "load" });
  if (failed.length) console.log(`${name}: FAILED REQUESTS`, failed);
  const nodes = await page.$$(".a5-paper-page");
  if (nodes.length) {
    for (let i = 0; i < nodes.length; i++) await nodes[i].screenshot({ path: `${OUT}/${name}-p${i + 1}.png` });
    console.log(`${name}: ${nodes.length} pages`);
  } else {
    const root = await page.$("article, .a4-paper, .a5-report-paper, .a5-paper");
    if (root) { await root.screenshot({ path: `${OUT}/${name}-p1.png` }); console.log(`${name}: 1 page (no .a5-paper-page found)`); }
    else { console.log(`${name}: NO ROOT ELEMENT FOUND`); }
  }
  await page.close();
}
await browser.close();
server.close();
console.log("batch done");
