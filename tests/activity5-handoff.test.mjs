import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

class LocalStorageMock {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.localStorage = new LocalStorageMock();
await import("../assets/activity5-handoff.js");
const bridge = globalThis.ECMISActivity5Handoff;

function approvedState(decision, overrides = {}) {
  return {
    caseData: {
      id: overrides.id || `ECMIS-${decision}`,
      received: "3 สิงหาคม 2569 09:10 น.",
      subject: "ร้องเรียนการจัดซื้อ",
      complainant: "นายสมชาย ใจดี",
      agency: "สำนักงานตัวอย่าง",
      region: "เขต 2"
    },
    documentData: { decision, anonymous: Boolean(overrides.anonymous) },
    workflow: { complete: overrides.complete ?? true }
  };
}

for (const decision of ["18/1ก", "18/1ข", "18/4"]) {
  const source = approvedState(decision);
  const first = bridge.create(localStorage, source, "2026-08-04T09:00:00+07:00", "division");
  const replay = bridge.create(localStorage, source, "2026-08-04T10:00:00+07:00", "division");
  assert.equal(first.created, true, `${decision} must create a handoff`);
  assert.equal(replay.created, false, `${decision} replay must be idempotent`);
  assert.equal(replay.handoff.handoffId, first.handoff.handoffId);
  assert.equal(first.handoff.receivedDate, source.caseData.received);
  assert.equal(first.handoff.title, source.caseData.subject);
  assert.equal(first.handoff.complainant, source.caseData.complainant);
  assert.equal(first.handoff.agency, source.caseData.agency);
  assert.equal(first.handoff.unit, source.caseData.region);
  assert.equal(first.handoff.sourceReference, source.caseData.id);
}

for (const rejected of [
  approvedState("58/2"),
  approvedState("send-nacc"),
  approvedState("not-accept", { anonymous: true }),
  approvedState("18/1ก", { id: "NOT-COMPLETE", complete: false })
]) {
  const result = bridge.create(localStorage, rejected, "2026-08-04T09:00:00+07:00", "division");
  assert.equal(result.eligible, false);
}

const actingState = approvedState("18/4", { id: "ACTING" });
actingState.documentData.actingOrder = "คำสั่งที่ 12/2569 ลงวันที่ 4 สิงหาคม 2569";
const actingResult = bridge.create(localStorage, actingState, "2026-08-04T09:00:00+07:00", "acting");
assert.equal(actingResult.eligible, true);
assert.equal(actingResult.created, true);
assert.equal(actingResult.handoff.approvedBy, "ผู้รักษาราชการแทนตามคำสั่ง");
assert.equal(actingResult.handoff.appointmentOrder, actingState.documentData.actingOrder);

const bridgeStore = bridge.read(localStorage);
assert.equal(Object.keys(bridgeStore.records).length, 4, "only eligible unique Activity 4 cases must be queued");

const staffHtml = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");
const activity4Source = readFileSync(new URL("../assets/activity4-workspace.js", import.meta.url), "utf8");
const activity5Html = readFileSync(new URL("../activity5/index.html", import.meta.url), "utf8");
assert.ok(staffHtml.indexOf("assets/activity5-handoff.js") < staffHtml.indexOf("assets/activity4-workspace.js"));
assert.match(activity4Source, /ECMISActivity5Handoff\?\.create\(localStorage,state/);
assert.match(activity4Source, /activity5\/index\.html#\/cases\//);
assert.match(activity5Html, /กลับ Activity 4/);
assert.match(activity5Html, /localStorage ของเบราว์เซอร์ ไม่ใช่ production backend/);

localStorage.removeItem("activity5-mockup-state-v4");
const stateApi = await import(`../activity5/assets/state.js?handoff=${Date.now()}`);
const imported = stateApi.getState().cases.filter((item) => item.activity4HandoffId);
assert.equal(imported.length, 4);
for (const item of imported) {
  const source = bridgeStore.records[item.sourceReference];
  assert.equal(item.referenceNo, source.sourceReference);
  assert.equal(item.sourceReceivedDate, source.receivedDate);
  assert.equal(item.title, source.title);
  assert.equal(item.complainant, source.complainant);
  assert.equal(item.agency, source.agency);
  assert.equal(item.sourceUnit, source.unit);
  assert.ok(item.report213, "ordinary imported cases must retain the 213 workflow");
  assert.ok(item.report644, "ordinary imported cases must retain the 644 workflow");
}
assert.equal(imported.some((item) => item.sourceDecision === "58/2"), false);

const beforeReload = stateApi.getState().cases.length;
const reloadedApi = await import(`../activity5/assets/state.js?handoff-reload=${Date.now()}`);
assert.equal(reloadedApi.getState().cases.length, beforeReload, "Activity 5 import must not duplicate cases on reload");

console.log("PASS activity5-handoff.test.mjs: eligible branches, preservation and idempotency");
