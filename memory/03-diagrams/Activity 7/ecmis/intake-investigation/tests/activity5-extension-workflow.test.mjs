import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const workflow = require("../assets/activity5-extension-workflow.js");

const basis = { schemaVersion: 1, extensionType: "PRELIMINARY_INQUIRY", startEvent: "FIRST_RECEIPT", startedAt: "2026-08-01", baseDays: 60, initialDeadline: "2026-09-30" };
const contract = { status: "CONFIRMED", requestId: "EXT-1", revisionNo: 1, extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", reviewerId: "director-2", reviewerRole: "director", assignmentId: "a1", assignmentVersion: 1, effectiveDate: "2026-08-15", authorityStatus: "CONFIRMED", dayPolicyStatus: "CONFIRMED", canApprove: true, maxApprovedDays: 60, routePolicyVersion: "a5-extension-route-2026-08-15" };
const draftPayload = { progress: "คืบหน้า", workDone: "งานแล้ว", workRemaining: "งานเหลือ", obstacles: "ไม่มี", reason: "ต้องสอบเพิ่ม", requestedDays: 20 };
function create(overrides = {}) {
  return workflow.createDraft(null, { requestId: "EXT-1", caseId: "CASE-1", extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, ownerId: "officer-1", actorId: "officer-1", at: "2026-08-15T09:00:00+07:00", currentDeadline: "2026-09-30", deadlineBasis: basis, deadlineVersion: 1, reviewerContract: contract, draftPayload, ...overrides });
}

test("normal draft stores immutable deadline and reviewer scope without mutating input", () => {
  const source = {};
  const result = workflow.createDraft(source, { requestId: "EXT-1", caseId: "CASE-1", extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, ownerId: "officer-1", actorId: "officer-1", at: "2026-08-15T09:00:00+07:00", currentDeadline: "2026-09-30", deadlineBasis: basis, deadlineVersion: 1, reviewerContract: contract, draftPayload });
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.deadlineBasis, basis);
  assert.equal(result.state.submissionCutoff, "2026-09-15");
  assert.deepEqual(source, {});
});

test("extraordinary round returns signal and no state mutation", () => {
  const result = create({ roundNo: 3, reviewerContract: { ...contract, roundNo: 3 } });
  assert.equal(result.code, "EXTRAORDINARY_FLOW_REQUIRED");
  assert.equal(result.result.type, "LATE_REPORT_REQUIRED");
  assert.equal(result.state, null);
  assert.deepEqual(result.events, []);
});

test("validation enforces requested days integer 1 through 60", () => {
  for (const invalid of [0, 61, 1.5, "20"]) {
    const created = create({ draftPayload: { ...draftPayload, requestedDays: invalid } });
    const before = structuredClone(created.state);
    const result = workflow.validateDraft(created.state, { actorId: "officer-1", expectedVersion: 1, at: "2026-08-15T09:01:00+07:00", documentCheck: { complete: true, missingDocumentCodes: [] } });
    assert.equal(result.code, "INVALID_REQUESTED_DAYS");
    assert.deepEqual(created.state, before);
  }
  const created = create();
  assert.equal(workflow.validateDraft(created.state, { actorId: "officer-1", expectedVersion: 1, at: "2026-08-15T09:01:00+07:00", documentCheck: { complete: true, missingDocumentCodes: [] } }).ok, true);
});

test("correction creates revision N+1 and clears stale reviewer contract", () => {
  const created = create();
  const ready = workflow.validateDraft(created.state, { actorId: "officer-1", expectedVersion: 1, at: "2026-08-15T09:01:00+07:00", documentCheck: { complete: true, missingDocumentCodes: [] } });
  const submitted = workflow.submitRequest(ready.state, { actorId: "officer-1", expectedVersion: 2, at: "2026-08-15T09:02:00+07:00", snapshotPayload: { deadline: { basis, deadlineVersion: 1 }, routing: contract } });
  const returned = structuredClone(submitted.state);
  returned.status = "RETURNED";
  const result = workflow.beginCorrection(returned, { actorId: "officer-1", expectedVersion: returned.version, at: "2026-08-15T09:03:00+07:00" });
  assert.equal(result.ok, true);
  assert.equal(result.state.activeRevisionNo, 2);
  assert.equal(result.state.reviewerContract, null);
  assert.equal(result.state.revisions[0].submittedSnapshot.revisionNo, 1);
});
