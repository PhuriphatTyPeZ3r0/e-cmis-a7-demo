import { chromium } from "playwright";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const OUT = "/private/tmp/claude-501/-Users-jetsadasomporn-Downloads-E-CMIS-A4-Production/c3b97818-5bef-4d51-a5a5-0224f1f75982/scratchpad/fidelity";

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;
globalThis.ThaiDatePicker = { html: () => "<input>", wireAll() {} };
const workflow = require("../assets/activity5-workflow.js");

const state = workflow.normalizeA5State({
  caseData: { id: "A5-LIVE-PROBE-001", subject: "ทุจริตการจัดซื้อจัดจ้าง (ทดสอบ layout)", channel: "หนังสือร้องเรียน", region: "เขต 1" },
  assignment: { primaryOfficerId: "owner", primaryOfficerName: "นายทดสอบ ระบบ" },
  workflow: { stage: "a5-prelim", a5Status: "PLAN_APPROVED" },
  inquiry: { intake: { unit: "เขต 1", investigator: "นายทดสอบ ระบบ", receivedFirstAt: "2026-08-01" }, prelim: { deadlineAt: "2026-09-30" } }
});
const store = { [state.caseData.id]: state };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://localhost:8080/staff-workflow.html?role=officer&view=a5", { waitUntil: "networkidle" });
await page.evaluate(([key, value]) => localStorage.setItem(key, value), ["ecmis-a4-workspace-v3", JSON.stringify(store)]);
await page.goto(`http://localhost:8080/staff-workflow.html?role=officer&view=a5&case=${state.caseData.id}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/live-detail-before.png`, fullPage: false });
console.log("done, title:", await page.title());
await browser.close();
