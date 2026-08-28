import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const workflow = require("../assets/activity5-extension-workflow.js");
const review = require("../assets/activity5-extension-review.js");

const basis = { schemaVersion: 1, extensionType: "PRELIMINARY_INQUIRY", startEvent: "FIRST_RECEIPT", startedAt: "2026-08-01", baseDays: 60, initialDeadline: "2026-09-30" };
const contract = { status: "CONFIRMED", requestId: "EXT-1", revisionNo: 1, extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", reviewerId: "director-2", reviewerRole: "director", assignmentId: "a1", assignmentVersion: 1, effectiveDate: "2026-08-15", actingForTier: null, authorityStatus: "CONFIRMED", dayPolicyStatus: "CONFIRMED", canApprove: true, maxApprovedDays: 60, routePolicyVersion: "a5-extension-route-2026-08-15", source: "STATE_ASSIGNMENT" };
const registry = { schemaVersion: 1, version: 1, assignments: [{ assignmentId: "a1", unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", actorId: "director-2", actorRole: "director", status: "ACTIVE", effectiveFrom: "2026-01-01", effectiveTo: null, actingForTier: null, source: "STATE_ASSIGNMENT" }] };

function submittedState() {
  const created = workflow.createDraft(null, { requestId: "EXT-1", caseId: "CASE-1", extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, ownerId: "officer-1", actorId: "officer-1", at: "2026-08-15T09:00:00+07:00", currentDeadline: "2026-09-30", deadlineBasis: basis, deadlineVersion: 1, reviewerContract: contract, draftPayload: { progress: "คืบหน้า", workDone: "งานแล้ว", workRemaining: "งานเหลือ", obstacles: "ไม่มี", reason: "ต้องสอบเพิ่ม", requestedDays: 20 } });
  const ready = workflow.validateDraft(created.state, { actorId: "officer-1", expectedVersion: 1, at: "2026-08-15T09:01:00+07:00", documentCheck: { complete: true, missingDocumentCodes: [] } });
  return workflow.submitRequest(ready.state, { actorId: "officer-1", expectedVersion: 2, at: "2026-08-15T09:02:00+07:00", snapshotPayload: { renderedForm: { content: "<article>แบบ 2</article>" }, documents: { documents: [], requirementAssignments: {} }, deadline: { currentDeadline: "2026-09-30", submissionCutoff: "2026-09-15", requestedDays: 20, basis, deadlineVersion: 1 }, routing: contract } }).state;
}
function opened(authorityRegistry = registry) {
  return review.createReviewerWorkspace({ requestState: submittedState(), reviewerContract: contract, authorityRegistry, caseDeadline: "2026-09-30" }).result;
}
const command = (model, action, overrides = {}) => ({ requestId: "EXT-1", revisionNo: 1, expectedVersion: model.requestState.version, actorId: "director-2", actorRole: "director", assignmentVersion: 1, effectiveDate: "2026-08-15", at: "2026-08-15T10:00:00+07:00", idempotencyKey: action, ...overrides });
function reviewing() {
  const model = opened();
  return review.startReview(model, command(model, "start")).result;
}

test("review uses only frozen submitted routing and verifies live authority", () => {
  const model = opened();
  assert.deepEqual(model.reviewerContract, contract);
  assert.equal(review.startReview(model, command(model, "start")).ok, true);
  const wrong = opened();
  const before = structuredClone(wrong);
  const result = review.startReview(wrong, command(wrong, "wrong", { actorId: "other" }));
  assert.equal(result.code, "ACTOR_MISMATCH");
  assert.deepEqual(wrong, before);
});

test("reject records reason without changing deadline or version", () => {
  const model = reviewing();
  const result = review.rejectRequest(model, command(model, "reject", { reason: "หลักฐานยังไม่เพียงพอ", affectedLinks: [] }));
  assert.equal(result.ok, true);
  assert.equal(result.result.caseDeadline, "2026-09-30");
  assert.equal(result.result.requestState.deadlineVersion, 1);
});

test("approval cannot exceed request and valid approval applies once", () => {
  const invalidModel = reviewing();
  const before = structuredClone(invalidModel);
  const invalid = review.approveRequest(invalidModel, command(invalidModel, "approve-invalid", { reason: "อนุมัติตามเหตุผล", approvedDays: 21, routePolicyVersion: contract.routePolicyVersion }));
  assert.equal(invalid.code, "APPROVED_DAYS_EXCEED_REQUESTED");
  assert.deepEqual(invalidModel, before);

  const model = reviewing();
  const cmd = command(model, "approve", { reason: "อนุมัติตามเหตุผล", approvedDays: 20, routePolicyVersion: contract.routePolicyVersion });
  const result = review.approveRequest(model, cmd);
  assert.equal(result.ok, true);
  assert.equal(result.result.caseDeadline, "2026-10-20");
  assert.equal(result.result.requestState.deadlineVersion, 2);
  assert.deepEqual(result.result.requestState.reviewOutcome.signature, {
    method: "DIGITAL_SIGNATURE",
    signerId: "director-2",
    signerRole: "director",
    signedAt: "2026-08-15T10:00:00+07:00",
    revisionNo: 1
  });
  const replay = review.approveRequest(result.result, cmd);
  assert.equal(replay.code, "REQUEST_APPROVAL_REPLAYED");
  assert.equal(replay.result.requestState.deadlineVersion, 2);
  assert.deepEqual(replay.events, []);
});

test("changed registry blocks action without mutation", () => {
  const model = opened({ ...registry, version: 2 });
  const before = structuredClone(model);
  const result = review.startReview(model, command(model, "changed"));
  assert.equal(result.code, "AUTHORITY_ASSIGNMENT_CHANGED");
  assert.deepEqual(model, before);
});

test("reviewer workspace renders the submitted form's HTML directly, not inside an iframe", () => {
  const model = opened();
  const html = review.renderReviewerWorkspace(model);
  assert.doesNotMatch(html, /<iframe\b/i, "no document layer may be embedded via iframe (master plan §8)");
  assert.match(html, /<div class="a5-extension-review-frame"[^>]*>แบบ 2<\/div>|<article>แบบ 2<\/article>/, "the sanitized submitted-form HTML is rendered directly into the page");
});
