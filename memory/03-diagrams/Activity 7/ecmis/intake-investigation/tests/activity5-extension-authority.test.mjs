import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const authority = require("../assets/activity5-extension-authority.js");

const assignment = (overrides = {}) => ({ assignmentId: "director-zone2", unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", actorId: "director-2", actorRole: "director", status: "ACTIVE", effectiveFrom: "2026-01-01", effectiveTo: null, actingForTier: null, source: "STATE_ASSIGNMENT", ...overrides });
const resolve = (registry, overrides = {}) => authority.resolveReviewerContract({ requestId: "EXT-1", revisionNo: 1, extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, unitKey: "เขต 2", effectiveDate: "2026-08-15", authorityRegistry: registry, allowMockRoleSlot: false, ...overrides });

test("one effective assignment creates an exact reviewer contract", () => {
  const registry = { schemaVersion: 1, version: 3, assignments: [assignment()] };
  const result = resolve(registry);
  assert.equal(result.ok, true);
  assert.equal(result.result.reviewerId, "director-2");
  assert.equal(result.result.assignmentVersion, 3);
  assert.equal(authority.verifyLiveReviewerContract({ contract: result.result, authorityRegistry: registry, actorId: "director-2", actorRole: "director", effectiveDate: "2026-08-15" }).ok, true);
});

test("round two routes to the supervising executive and not the secretary-general", () => {
  const registry = { schemaVersion: 1, version: 1, assignments: [assignment({
    assignmentId: "executive-zone2",
    authorityTier: "SUPERVISING_EXECUTIVE",
    actorId: "executive-2",
    actorRole: "executive"
  })] };
  const result = resolve(registry, { roundNo: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.result.reviewerRole, "executive");
});

test("round two may route to the secretary-general when the supervising tier has no active assignment", () => {
  const registry = { schemaVersion: 1, version: 1, assignments: [assignment({
    assignmentId: "secretary-general",
    authorityTier: "SECRETARY_GENERAL_PERSONAL",
    actorId: "secretary-general",
    actorRole: "secretary"
  })] };
  const result = resolve(registry, { roundNo: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.result.authorityTier, "SECRETARY_GENERAL_PERSONAL");
  assert.equal(result.result.reviewerRole, "secretary");
});

test("missing vacancy overlap and incomplete acting assignments block", () => {
  assert.equal(resolve({ schemaVersion: 1, version: 1, assignments: [] }).errors[0].reasonCode, "AUTHORITY_ASSIGNMENT_MISSING");
  assert.equal(resolve({ schemaVersion: 1, version: 1, assignments: [assignment({ status: "VACANT", actorId: "" })] }, { allowMockRoleSlot: true }).errors[0].reasonCode, "AUTHORITY_VACANT");
  assert.equal(resolve({ schemaVersion: 1, version: 1, assignments: [assignment(), assignment({ assignmentId: "other", actorId: "director-3" })] }).errors[0].reasonCode, "AUTHORITY_ASSIGNMENT_AMBIGUOUS");
  assert.equal(resolve({ schemaVersion: 1, version: 1, assignments: [assignment({ actingForTier: "SUPERVISING_EXECUTIVE" })] }).errors[0].reasonCode, "ACTING_ASSIGNMENT_INCOMPLETE");
});

test("changed registry or wrong actor blocks frozen contract", () => {
  const registry = { schemaVersion: 1, version: 1, assignments: [assignment()] };
  const contract = resolve(registry).result;
  assert.equal(authority.verifyLiveReviewerContract({ contract, authorityRegistry: registry, actorId: "wrong", actorRole: "director" }).code, "ACTOR_MISMATCH");
  assert.equal(authority.verifyLiveReviewerContract({ contract, authorityRegistry: { ...registry, version: 2 }, actorId: "director-2", actorRole: "director" }).code, "AUTHORITY_ASSIGNMENT_CHANGED");
});
