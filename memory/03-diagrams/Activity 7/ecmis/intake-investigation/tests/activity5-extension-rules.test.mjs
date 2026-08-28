import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const rules = require("../assets/activity5-extension-rules.js");

test("round matrix and extraordinary signal", () => {
  assert.deepEqual([1, 2].map(n => rules.evaluateNormalRound("PRELIMINARY_INQUIRY", n).result.authorityTier), ["UNIT_DIRECTOR", "SUPERVISING_EXECUTIVE"]);
  assert.deepEqual([1, 2, 3, 4].map(n => rules.evaluateNormalRound("FULL_INQUIRY", n).result.authorityTier), ["UNIT_DIRECTOR", "UNIT_DIRECTOR", "SUPERVISING_EXECUTIVE", "SUPERVISING_EXECUTIVE"]);
  for (const [type, round] of [["PRELIMINARY_INQUIRY", 3], ["FULL_INQUIRY", 5]]) {
    const result = rules.evaluateNormalRound(type, round);
    assert.equal(result.code, "EXTRAORDINARY_FLOW_REQUIRED");
    assert.equal(result.result.type, "LATE_REPORT_REQUIRED");
  }
});

test("day policy accepts only integers 1 through 60", () => {
  for (const value of [1, 20, 60]) assert.equal(rules.validateRequestedDays(value).ok, true);
  for (const value of [0, 61, 1.5, "20"]) assert.equal(rules.validateRequestedDays(value).code, "INVALID_REQUESTED_DAYS");
  assert.equal(rules.validateApprovedDays(20, 20).ok, true);
  assert.equal(rules.validateApprovedDays(20, 21).code, "APPROVED_DAYS_EXCEED_REQUESTED");
});

test("deadline basis and cutoff are deterministic", () => {
  const prelim = rules.deriveDeadlineBasis({ extensionType: "PRELIMINARY_INQUIRY", receivedFirstAt: "2026-08-01" });
  assert.equal(prelim.result.initialDeadline, "2026-09-30");
  assert.equal(prelim.result.deadlineBasis.startEvent, "FIRST_RECEIPT");
  assert.equal(rules.deriveDeadlineBasis({ extensionType: "FULL_INQUIRY", orderType: "24v3", boardResolutionAt: "2026-01-01" }).result.deadlineBasis.startEvent, "BOARD_RESOLUTION");
  assert.equal(rules.deriveDeadlineBasis({ extensionType: "FULL_INQUIRY", orderType: "24v1", secretaryOrderSignedAt: "2026-01-01" }).result.deadlineBasis.startEvent, "SECRETARY_ORDER_SIGNED");
  assert.equal(rules.deriveDeadlineBasis({ extensionType: "FULL_INQUIRY", orderType: "24v1" }).code, "DEADLINE_BASIS_MISSING");
  assert.equal(rules.calculateSubmissionCutoff("2026-09-30").result.submissionCutoff, "2026-09-15");
});

test("document requirements stay in the canonical policy", () => {
  assert.deepEqual(rules.getExtensionPolicy("PRELIMINARY_INQUIRY").requiredDocumentCodes, []);
  assert.deepEqual(rules.getExtensionPolicy("FULL_INQUIRY").requiredDocumentCodes, ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE", "INQUIRY_APPOINTMENT_ORDER"]);
});

test("preliminary inquiry reminders occur on day 15 30 and 45 of each period", () => {
  assert.deepEqual(rules.getDeadlineReminderSchedule("PRELIMINARY_INQUIRY", "2026-08-01").result.reminders.map(item => item.dueAt), [
    "2026-08-16",
    "2026-08-31",
    "2026-09-15"
  ]);
});
