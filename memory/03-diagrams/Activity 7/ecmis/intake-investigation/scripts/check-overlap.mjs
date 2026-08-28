import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const OUT = "/private/tmp/claude-501/-Users-jetsadasomporn-Downloads-E-CMIS-A4-Production/c3b97818-5bef-4d51-a5a5-0224f1f75982/scratchpad/fidelity";

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;
globalThis.ThaiDatePicker = { html: () => "<input>", wireAll() {} };
const workspace = require("../assets/activity5-workspace.js");
const workflow = require("../assets/activity5-workflow.js");

const state = workflow.normalizeA5State({
  caseData: { id: "A5-LIVE-PROBE-001", subject: "ทุจริตการจัดซื้อจัดจ้าง (ทดสอบ layout)", channel: "หนังสือร้องเรียน", region: "เขต 1" },
  assignment: { primaryOfficerId: "owner", primaryOfficerName: "นายทดสอบ ระบบ" },
  workflow: { stage: "a5-prelim", a5Status: "PLAN_APPROVED" },
  inquiry: { intake: { unit: "เขต 1", investigator: "นายทดสอบ ระบบ", receivedFirstAt: "2026-08-01" }, prelim: { deadlineAt: "2026-09-30" } }
});
const shell = workspace.caseDetailShellA5(state, "investigator", "current-task", "213");

const CSS = ["assets/ecmis.css", "assets/ecmis-workspace.css", "assets/activity5-workspace.css", "assets/activity5-document-workspace.css", "assets/ecmis-sidebar.css"]
  .map(f => `<link rel="stylesheet" href="http://localhost:8080/${f}">`).join("\n");
const cssOverride = process.argv[2] ? require("node:fs").readFileSync(process.argv[2], "utf8") : "";
const label = process.argv[3] || "baseline";

const page_ = `<!doctype html><html lang="th"><head><meta charset="utf-8">${CSS}<style>${cssOverride}</style></head><body><div id="a5App">${shell}</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://localhost:8080/staff-workflow.html", { waitUntil: "load" }); // establish origin so relative loads work
await page.setContent(page_, { waitUntil: "load" });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/overlap-${label}.png`, fullPage: false });
console.log("done:", label);
await browser.close();
