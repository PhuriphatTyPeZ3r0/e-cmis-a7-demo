import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const late = require("../assets/activity5-extension-late-report.js");
const contract = (tier, id, role, source = "STATE_ASSIGNMENT") => ({ reviewerId: id, reviewerRole: role, assignmentId: `${tier}-1`, assignmentVersion: 1, source, actingForTier: null });
const routing = { steps: [
  { tier: "GROUP_DIRECTOR", required: false, contract: contract("GROUP", "group", "group-director") },
  { tier: "UNIT_DIRECTOR", required: true, contract: contract("UNIT", "director", "director") },
  { tier: "SUPERVISING_EXECUTIVE", required: true, contract: contract("EXEC", "executive", "executive") },
  { tier: "SECRETARY_GENERAL_PERSONAL", required: true, contract: contract("PERSONAL", "secretary-general", "secretary") }
] };
const signal = { type: "LATE_REPORT_REQUIRED", target: "ACTIVITY_7", reportType: "213", extensionType: "PRELIMINARY_INQUIRY", normalRoundLimit: 2, requestedRoundNo: 3 };
const command = (state, actorId, actorRole, key, extra = {}) => ({ lateReportId: "late:CASE-1:213:exhausted-r2", expectedVersion: state.extensionLateReports[0].version, actorId, actorRole, assignmentVersion: 1, at: "2026-08-15T10:00:00+07:00", idempotencyKey: key, ...extra });

test("late report is unique and does not mutate main workflow", () => {
  const source = { workflow: { stage: "a5-prelim", owner: "investigator" }, extensionLateReports: [] };
  const result = late.createLateReport(source, { signal, caseId: "CASE-1", deadlineVersion: 3, routing, ownerId: "owner", actorId: "owner" });
  assert.equal(result.ok, true); assert.deepEqual(result.result.workflow, source.workflow); assert.equal(result.result.extensionLateReports[0].continueWork, true);
  assert.equal(late.createLateReport(result.result, { signal, caseId: "CASE-1", deadlineVersion: 3, routing, ownerId: "owner", actorId: "owner" }).code, "LATE_REPORT_ALREADY_EXISTS");
});
test("late report requires available evidence and snapshots the selected versions", () => {
  const initial = { workflow: { stage: "a5-prelim", owner: "investigator" }, extensionLateReports: [] };
  let state = late.createLateReport(initial, { signal, caseId: "CASE-1", deadlineVersion: 3, routing, ownerId: "owner", actorId: "owner" }).result;
  state = late.saveLateReportDraft(state, command(state, "owner", "investigator", "save-evidence", { patch: { reasonAndNecessity: "จำเป็น", workDone: "ทำแล้ว", workRemaining: "เหลือ", obstacles: "ติดขัด", correctivePlan: "แก้ไข", evidenceVersionIds: [] } })).result;
  assert.equal(late.submitLateReport(state, command(state, "owner", "investigator", "submit-without-evidence", { repository: [] })).code, "MISSING_REQUIRED_FIELD");
  state = late.saveLateReportDraft(state, command(state, "owner", "investigator", "select-evidence", { patch: { evidenceVersionIds: ["v1"] } })).result;
  assert.equal(late.submitLateReport(state, command(state, "owner", "investigator", "submit-unavailable-evidence", { repository: [{ versionId: "v1", availability: "REFERENCE_ONLY" }] })).code, "PACKAGE_INCOMPLETE");
  const submitted = late.submitLateReport(state, command(state, "owner", "investigator", "submit-available-evidence", { repository: [{ versionId: "v1", name: "หลักฐานงานที่ผ่านมา", availability: "AVAILABLE" }] }));
  assert.equal(submitted.ok, true);
  assert.deepEqual(submitted.result.extensionLateReports[0].revisions[0].submittedSnapshot.evidenceVersions, [{ versionId: "v1", name: "หลักฐานงานที่ผ่านมา", availability: "AVAILABLE" }]);
});
test("board result grants a case-specific period without creating another normal extension round", () => {
  const initial = { workflow: { stage: "a5-prelim", owner: "investigator" }, deadlineAt: "2026-09-30", deadlineVersion: 3, extensionLateReports: [] };
  let state = late.createLateReport(initial, { signal, caseId: "CASE-1", deadlineVersion: 3, routing, ownerId: "owner", actorId: "owner" }).result;
  state = late.saveLateReportDraft(state, command(state, "owner", "investigator", "save", { patch: { reasonAndNecessity: "จำเป็น", workDone: "ทำแล้ว", workRemaining: "เหลือ", obstacles: "ติดขัด", correctivePlan: "แก้ไข", evidenceVersionIds: ["v1"] } })).result;
  state = late.submitLateReport(state, command(state, "owner", "investigator", "submit", { repository: [{ versionId: "v1", availability: "AVAILABLE" }] })).result;
  state = late.skipGroupOpinion(state, command(state, "owner", "investigator", "skip", { reason: "ไม่อยู่ในสายงาน" })).result;
  state = late.recordLateReportOpinion(state, command(state, "director", "director", "unit", { opinion: "เห็นควร" })).result;
  state = late.recordLateReportOpinion(state, command(state, "executive", "executive", "exec", { opinion: "เห็นควร" })).result;
  state = late.recordSecretaryPersonalDecision(state, command(state, "secretary-general", "secretary", "personal", { decision: "ส่งกิจกรรมที่ 7", correctiveGuidance: "ดำเนินการต่อ" })).result;
  state = late.createLateReportPackage(state, command(state, "clerk", "clerk", "package", { packageId: "PKG-1", renderedReport: { rendererVersion: "v1", contentType: "text/html", content: "รายงาน" }, documentVersionIds: ["v1"] })).result;
  state = late.dispatchLateReportPackage(state, command(state, "clerk", "clerk", "dispatch", { packageId: "PKG-1", packageVersion: 1 })).result;
  state = late.recordActivity7Receipt(state, command(state, "clerk", "clerk", "receipt", { packageId: "PKG-1", packageVersion: 1, receiptId: "R1" })).result;
  state = late.beginWaitActivity7Result(state, command(state, "system", "system", "wait")).result;
  state = late.recordActivity7Result(state, command(state, "clerk", "clerk", "result", { result: { resultId: "RES-1", packageId: "PKG-1", packageVersion: 1, decisionArtifactVersionId: "decision-v1", decisionType: "GRANT_DAYS", grantedDays: 30, directions: "เร่งสอบพยานที่เหลือ", effectiveAt: "2026-08-20T00:00:00+07:00", receivedAt: "2026-08-20T00:00:00+07:00" } })).result;
  assert.equal(state.extensionLateReports[0].status, "RESULT_RECEIVED");
  assert.equal(state.extensionLateReports[0].results[0].deadlinePolicyStatus, "CONFIRMED");
  assert.equal(state.extensionLateReports[0].results[0].automaticNextRound, false);
  assert.equal(state.deadlineAt, "2026-10-30");
  assert.equal(state.deadlineVersion, 4);
  assert.deepEqual(state.workflow, initial.workflow);
  const repeated = late.createLateReport(state, { signal, caseId: "CASE-1", deadlineVersion: 4, routing, ownerId: "owner", actorId: "owner" });
  assert.equal(repeated.ok, true);
  assert.notEqual(repeated.result.extensionLateReports[1].lateReportId, repeated.result.extensionLateReports[0].lateReportId);
});

test("board result updates the nested preliminary deadline used by the Activity 5 workspace", () => {
  const state = {
    inquiry: {
      prelim: { deadlineAt: "2026-09-30", deadlineVersion: 3 },
      extensionLateReports: [{ lateReportId: "late-nested", reportType: "213", status: "WAIT_RESULT", version: 1, packages: [{ packageId: "PKG-1", packageVersion: 1 }], results: [], commandReceipts: [] }]
    }
  };
  const result = late.recordActivity7Result(state, {
    lateReportId: "late-nested",
    expectedVersion: 1,
    actorId: "committee",
    actorRole: "committee",
    assignmentVersion: 1,
    at: "2026-08-20T00:00:00+07:00",
    idempotencyKey: "nested-result",
    result: { packageId: "PKG-1", packageVersion: 1, decisionArtifactVersionId: "decision-v1", decisionType: "GRANT_DAYS", grantedDays: 30, directions: "เร่งดำเนินการ" }
  });
  assert.equal(result.ok, true);
  assert.equal(result.result.inquiry.prelim.deadlineAt, "2026-10-30");
  assert.equal(result.result.inquiry.prelim.deadlineVersion, 4);
});
