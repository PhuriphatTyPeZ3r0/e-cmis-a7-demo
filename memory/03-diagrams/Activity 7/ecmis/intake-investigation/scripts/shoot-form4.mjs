import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import { startServer } from "./serve.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = "/private/tmp/claude-501/-Users-jetsadasomporn-Downloads-E-CMIS-A4-Production/c3b97818-5bef-4d51-a5a5-0224f1f75982/scratchpad/fidelity";
const html = readFileSync(`${OUT}/form4.html`, "utf8");

const CSS = ["assets/ecmis.css", "assets/ecmis-workspace.css", "assets/activity5-workspace.css", "assets/activity5-document-workspace.css"]
  .map(f => `<link rel="stylesheet" href="/${f}">`).join("\n");

const page_ = `<!doctype html><html lang="th"><head><meta charset="utf-8">${CSS}</head><body><div id="a5App"><div class="a5-report-paper a5-f4-paper">${html}</div></div></body></html>`;

const server = await startServer(8791);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const failed = [];
page.on("requestfailed", r => failed.push(r.url()));
await page.goto("http://localhost:8791/__inline__", { waitUntil: "load" }).catch(() => {});
await page.setContent(page_, { waitUntil: "load" });
console.log("failed requests:", JSON.stringify(failed));
const nodes = await page.$$(".a5-paper-page");
console.log("pages found:", nodes.length);
for (let i = 0; i < nodes.length; i++) {
  await nodes[i].screenshot({ path: `${OUT}/form4-p${i + 1}.png` });
}
await browser.close();
server.close();
console.log("done");
