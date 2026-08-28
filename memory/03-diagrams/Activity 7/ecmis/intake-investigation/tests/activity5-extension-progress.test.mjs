import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const progress = require("../assets/activity5-extension-progress.js");
const approved = days => ({ requestId: "EXT-1", revisionNo: 1, extensionRound: 1, previousDeadline: "2026-09-30", newDeadline: new Date(Date.UTC(2026, 8, 30 + days)).toISOString().slice(0, 10) });

test("confirmed policy creates progress obligations every 15 days", () => {
  const result = progress.createProgressSchedule({ approvedExtension: approved(20), policy: progress.PROGRESS_POLICY, ownerAssignment: { assigneeId: "owner", assignmentVersion: 1 }, at: "2026-10-01T00:00:00+07:00", idempotencyKey: "default" });
  assert.equal(result.code, "PROGRESS_SCHEDULE_CREATED");
  assert.equal(result.result.progressScheduleStatus, "CONFIRMED");
  assert.deepEqual(result.result.obligations.map(item => item.dueAt), ["2026-10-15"]);
});
test("confirmed anchor creates only complete 15-day periods", () => {
  const policy = { status: "CONFIRMED", anchor: "EXTENSION_PERIOD_START" };
  assert.deepEqual(progress.createProgressSchedule({ approvedExtension: approved(20), policy, ownerAssignment: { assigneeId: "owner", assignmentVersion: 1 }, at: "2026-10-01T00:00:00+07:00", idempotencyKey: "s20" }).result.obligations.map(item => item.dueAt), ["2026-10-15"]);
  assert.deepEqual(progress.createProgressSchedule({ approvedExtension: approved(30), policy, ownerAssignment: { assigneeId: "owner", assignmentVersion: 1 }, at: "2026-10-01T00:00:00+07:00", idempotencyKey: "s30" }).result.obligations.map(item => item.dueAt), ["2026-10-15", "2026-10-30"]);
});
test("submitted progress is immutable and correction is revision two", () => {
  const schedule = progress.createProgressSchedule({ approvedExtension: approved(20), policy: { status: "CONFIRMED", anchor: "EXTENSION_PERIOD_START" }, ownerAssignment: { assigneeId: "owner", assignmentVersion: 1 }, at: "2026-10-01T00:00:00+07:00", idempotencyKey: "s" }).result;
  const state = { version: 1, assignmentVersion: 1, obligations: schedule.obligations };
  const saved = progress.saveProgressDraft(state, { obligationId: state.obligations[0].obligationId, actorId: "owner", expectedVersion: 1, patch: { progress: "คืบหน้า", workDone: "ทำแล้ว", workRemaining: "เหลือ", obstacles: "ไม่มี", nextAction: "ทำต่อ", evidenceVersionIds: ["v1"] } });
  const submitted = progress.submitProgressRevision(saved.result, { obligationId: state.obligations[0].obligationId, actorId: "owner", expectedVersion: 2, at: "2026-10-15T00:00:00+07:00", idempotencyKey: "p1", repository: [{ versionId: "v1", availability: "AVAILABLE" }] });
  assert.equal(submitted.result.obligations[0].status, "SUBMITTED");
  const corrected = progress.beginProgressCorrection(submitted.result, { obligationId: state.obligations[0].obligationId, actorId: "owner", expectedVersion: 3, at: "2026-10-16T00:00:00+07:00" });
  assert.equal(corrected.result.obligations[0].activeRevisionNo, 2);
  assert.ok(corrected.result.obligations[0].revisions[0].submittedSnapshot);
});
