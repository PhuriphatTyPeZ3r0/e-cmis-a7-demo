import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const workflow = require("../assets/activity5-extension-workflow.js");
const submit = require("../assets/activity5-extension-submit.js");

const basis = { schemaVersion: 1, extensionType: "PRELIMINARY_INQUIRY", startEvent: "FIRST_RECEIPT", startedAt: "2026-08-01", baseDays: 60, initialDeadline: "2026-09-30" };
const contract = { status: "CONFIRMED", requestId: "EXT-1", revisionNo: 1, extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", reviewerId: "director-2", reviewerRole: "director", assignmentId: "a1", assignmentVersion: 1, effectiveDate: "2026-08-15", actingForTier: null, authorityStatus: "CONFIRMED", dayPolicyStatus: "CONFIRMED", canApprove: true, maxApprovedDays: 60, routePolicyVersion: "a5-extension-route-2026-08-15" };
const codes = ["PROGRESS_REPORT"];

function readyModel() {
  const created = workflow.createDraft(null, { requestId: "EXT-1", caseId: "CASE-1", extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, ownerId: "officer-1", actorId: "officer-1", at: "2026-08-15T09:00:00+07:00", currentDeadline: "2026-09-30", deadlineBasis: basis, deadlineVersion: 1, reviewerContract: contract, draftPayload: { progress: "คืบหน้า", workDone: "งานแล้ว", workRemaining: "งานเหลือ", obstacles: "ไม่มี", reason: "ต้องสอบเพิ่ม", requestedDays: 20 } });
  const ready = workflow.validateDraft(created.state, { actorId: "officer-1", expectedVersion: 1, at: "2026-08-15T09:01:00+07:00", documentCheck: { complete: true, missingDocumentCodes: [] } });
  const sourceIds = { PROGRESS_REPORT: "ACTIVITY5_EXTENSION_PROGRESS" };
  const repository = codes.map((code, index) => ({ artifactId: `a${index}`, versionId: `v${index}`, version: 1, name: code, documentType: code, reportType: "213", source: "A5_DOCUMENT_STORE", availability: "AVAILABLE", isLatest: true, latestVersionId: `v${index}`, createdAt: "2026-08-01T00:00:00+07:00", signedArtifactRef: { store: "A5_DOCUMENT_STORE", documentId: sourceIds[code], revisionNo: 1, snapshotFingerprint: `fp${index}` }, lineage: { caseId: "CASE-1", sourceDocumentId: sourceIds[code], sourceRevisionNo: 1, sourceEvent: "DOCUMENT_SUBMITTED" }, semantic: {} }));
  return { context: { caseId: "CASE-1", reportType: "213", extensionType: "PRELIMINARY_INQUIRY", formId: "FORM_2", roundNo: 1, ownerId: "officer-1", ownerName: "เจ้าหน้าที่", assignmentVersion: 1, acceptedAssignmentVersion: 1, currentDeadline: "2026-09-30", submissionCutoff: "2026-09-15", deadlineBasis: basis, deadlineVersion: 1, unitKey: "เขต-2" }, requestState: ready.state, repository, selectedVersionIds: repository.map(item => item.versionId), assignments: Object.fromEntries(repository.map(item => [item.documentType, [item.versionId]])), ui: {} };
}
const command = (model, overrides = {}) => ({ requestId: "EXT-1", revisionNo: 1, expectedVersion: model.requestState.version, idempotencyKey: "submit-1", actorId: "officer-1", at: "2026-09-15T23:59:59+07:00", renderedForm: { rendererVersion: "v1", contentType: "text/html", content: "<article>แบบ 2</article>" }, ...overrides });

test("submit freezes deadline basis version and reviewer routing", () => {
  const model = readyModel();
  const before = structuredClone(model);
  const result = submit.submitPreparedRequest(model, command(model));
  assert.equal(result.ok, true);
  const snapshot = result.result.requestState.revisions[0].submittedSnapshot.payload;
  assert.deepEqual(snapshot.deadline.basis, basis);
  assert.equal(snapshot.deadline.deadlineVersion, 1);
  assert.deepEqual(snapshot.routing, contract);
  assert.deepEqual(snapshot.submission.signature, {
    method: "DIGITAL_SIGNATURE",
    signerId: "officer-1",
    signedAt: "2026-09-15T23:59:59+07:00",
    revisionNo: 1
  });
  assert.deepEqual(model, before);
});

test("cutoff is inclusive and recalculated from current deadline", () => {
  const accepted = readyModel();
  assert.equal(submit.submitPreparedRequest(accepted, command(accepted)).ok, true);
  const closed = readyModel();
  const before = structuredClone(closed);
  const result = submit.submitPreparedRequest(closed, command(closed, { at: "2026-09-16T00:00:00+07:00" }));
  assert.equal(result.code, "SUBMISSION_WINDOW_CLOSED");
  assert.deepEqual(closed, before);
});

test("deadline version conflict and pending route fail without mutation", () => {
  for (const mutate of [model => { model.context.deadlineVersion = 2; }, model => { model.requestState.reviewerContract.status = "PENDING_CONFIRMATION"; }]) {
    const model = readyModel();
    mutate(model);
    const before = structuredClone(model);
    const result = submit.submitPreparedRequest(model, command(model));
    assert.equal(result.ok, false);
    assert.deepEqual(model, before);
    assert.deepEqual(result.events, []);
  }
});

test("submission replay is idempotent", () => {
  const model = readyModel();
  const first = submit.submitPreparedRequest(model, command(model));
  const replay = submit.submitPreparedRequest(first.result, command(first.result));
  assert.equal(replay.code, "REQUEST_SUBMISSION_REPLAYED");
  assert.deepEqual(replay.events, []);
});
