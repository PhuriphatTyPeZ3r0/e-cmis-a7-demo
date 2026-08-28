import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const recommendation = require("../assets/activity5-assignment-recommendation.js");
const workflow = require("../assets/activity5-workflow.js");

const caseProfile = Object.freeze({
  difficulty: 4,
  requiredExperienceTags: ["จัดซื้อจัดจ้าง", "การเงิน"],
  completeness: 80,
  unit: "เขต 1"
});
const officers = Object.freeze([
  Object.freeze({ id: "officer-b", name: "เจ้าหน้าที่ ข.", unit: "เขต 1", available: true, activeCaseCount: 2, weightedWorkload: 3, complexityCapacity: 4, experienceTags: ["จัดซื้อจัดจ้าง", "การเงิน"] }),
  Object.freeze({ id: "officer-a", name: "เจ้าหน้าที่ ก.", unit: "เขต 1", available: true, activeCaseCount: 2, weightedWorkload: 3, complexityCapacity: 4, experienceTags: ["จัดซื้อจัดจ้าง", "การเงิน"] }),
  Object.freeze({ id: "officer-z", name: "เจ้าหน้าที่ นอกเขต", unit: "เขต 2", available: true, activeCaseCount: 0, weightedWorkload: 0, complexityCapacity: 5, experienceTags: ["จัดซื้อจัดจ้าง", "การเงิน"] }),
  Object.freeze({ id: "officer-x", name: "เจ้าหน้าที่ ไม่พร้อม", unit: "เขต 1", available: false, activeCaseCount: 0, weightedWorkload: 0, complexityCapacity: 5, experienceTags: ["จัดซื้อจัดจ้าง", "การเงิน"] })
]);

const originalCase = structuredClone(caseProfile);
const originalOfficers = structuredClone(officers);
const first = recommendation.recommendInvestigators(caseProfile, officers, { generatedAt: "2026-08-13T09:00:00Z" });
const second = recommendation.recommendInvestigators(caseProfile, officers, { generatedAt: "2026-08-13T09:00:00Z" });
assert.deepEqual(first, second, "identical inputs produce an identical snapshot and order");
assert.deepEqual(first.candidates.map(item => item.officerId), ["officer-a", "officer-b"], "ties use officer id ascending and exclude ineligible officers");
assert.deepEqual(first.candidates[0].breakdown, { workload: 70, difficultyFit: 100, relevantExperience: 100, dataCompleteness: 80 });
assert.equal(first.candidates[0].totalScore, 86);
assert.equal(first.modelVersion, "deterministic-v1");
assert.deepEqual(caseProfile, originalCase, "recommendation does not mutate case input");
assert.deepEqual(officers, originalOfficers, "recommendation does not mutate officer input");

const incomplete = recommendation.recommendInvestigators({ difficulty: 3, requiredExperienceTags: [], unit: "เขต 1" }, [{ id: "officer-a", name: "ก.", unit: "เขต 1", available: true }], { generatedAt: "2026-08-13T09:00:00Z" });
assert.equal(incomplete.candidates[0].breakdown.workload, 0);
assert.equal(incomplete.candidates[0].breakdown.relevantExperience, 0);
assert.ok(incomplete.candidates[0].missingFields.includes("weightedWorkload"));
assert.ok(incomplete.candidates[0].missingFields.includes("requiredExperienceTags"));
assert.ok(incomplete.candidates[0].reasons.some(reason => reason.includes("ข้อมูลไม่ครบ")));
const emptyValues = recommendation.recommendInvestigators({ difficulty: "", requiredExperienceTags: ["การเงิน"], completeness: "", unit: "เขต 1" }, [{ id: "officer-empty", name: "ค่าว่าง", unit: "เขต 1", available: true, weightedWorkload: "", complexityCapacity: "", experienceTags: [] }], { generatedAt: "2026-08-13T09:00:00Z" });
assert.deepEqual(emptyValues.candidates[0].breakdown, { workload: 0, difficultyFit: 0, relevantExperience: 0, dataCompleteness: 0 });
assert.ok(emptyValues.candidates[0].missingFields.includes("weightedWorkload"));
assert.ok(emptyValues.candidates[0].missingFields.includes("difficulty"));
assert.ok(emptyValues.candidates[0].missingFields.includes("completeness"));

const intakeSource = {
  caseData: { id: "A5-ASSIGN-001", region: "เขต 1" },
  workflow: { stage: "a5-intake", a5Status: "PENDING_INTAKE_CHECK" },
  intake: {}, inquiry: { intake: {} }, assignment: {}, decisionHistory: []
};
const act = (state, role, actionId, payload = {}) => workflow.executeA5Action(state, role, actionId, { actorName: role === "director" ? "ผอ.เขต 1" : role === "clerk" ? "ธุรการคดี" : "เจ้าหน้าที่ ก.", at: "2026-08-13T09:00:00Z", ...payload });
const reviewed = act(intakeSource, "clerk", "intake-review-submit", {
  intakeReview: {
    documentResults: [{ id: "form-3", result: "COMPLETE" }],
    jurisdictionResult: "IN_SCOPE", complaintTypeResult: "CORRUPTION",
    completenessResult: "COMPLETE", clerkOpinion: "เอกสารครบ ควรมอบหมาย"
  },
  receivedDate: { channel: "กิจกรรม 4", recordedAt: "2026-08-13", effectiveDate: "2026-08-13" }
});
assert.equal(reviewed.ok, true);
assert.equal(reviewed.state.workflow.a5Status, "PENDING_DIRECTOR_ASSIGNMENT");
assert.deepEqual(workflow.getA5AvailableActions(reviewed.state, "clerk").filter(action => action.id.includes("assignment")), [], "clerk has no personnel assignment action");

const reviewSnapshot = structuredClone(reviewed.state);
const invalidTeam = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-a", assistantOfficerIds: ["officer-a"] });
assert.equal(invalidTeam.code, "INVALID_ASSIGNMENT_TEAM");
assert.deepEqual(reviewed.state, reviewSnapshot, "failed assignment does not mutate caller");

const snapshot = recommendation.recommendInvestigators(caseProfile, officers, { generatedAt: "2026-08-13T09:00:00Z" });
assert.equal(recommendation.validateRecommendationSnapshot(snapshot), true);
const tamperedSnapshot = structuredClone(snapshot);
tamperedSnapshot.candidates[0].totalScore = 100;
assert.equal(recommendation.validateRecommendationSnapshot(tamperedSnapshot), false, "snapshot hash detects candidate tampering");
const malformedSnapshot = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-a", recommendationSnapshot: { modelVersion: "deterministic-v1", candidates: [] } });
assert.equal(malformedSnapshot.code, "INVALID_RECOMMENDATION_SNAPSHOT");
const tamperedAssignment = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-a", recommendationSnapshot: tamperedSnapshot });
assert.equal(tamperedAssignment.code, "INVALID_RECOMMENDATION_SNAPSHOT");
const wrongModel = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-a", decisionNote: "override", recommendationSnapshot: { modelVersion: "other", candidates: [{ officerId: "officer-a" }] } });
assert.equal(wrongModel.code, "INVALID_RECOMMENDATION_SNAPSHOT");
const unrankedWithoutReason = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-unranked", recommendationSnapshot: snapshot });
assert.equal(unrankedWithoutReason.code, "OVERRIDE_REASON_REQUIRED");
const missingOverrideReason = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-b", assistantOfficerIds: [], recommendationSnapshot: snapshot });
assert.equal(missingOverrideReason.code, "OVERRIDE_REASON_REQUIRED");
const assigned = act(reviewed.state, "director", "assignment-confirm", { primaryOfficerId: "officer-b", assistantOfficerIds: ["officer-a", "officer-a"], decisionNote: "เลือกตามความเชี่ยวชาญเฉพาะพื้นที่", recommendationSnapshot: snapshot });
assert.equal(assigned.ok, true);
assert.equal(assigned.state.assignment.primaryOfficerId, "officer-b");
assert.deepEqual(assigned.state.assignment.assistantOfficerIds, ["officer-a"]);
assert.equal(assigned.state.assignment.assignmentVersion, 1);
assert.equal(assigned.state.assignment.recommendationSnapshotId, snapshot.id);
assert.equal(assigned.state.assignment.performanceOwners, undefined, "new assignment never infers KPI owners");

const wrongAccept = workflow.executeA5Action(assigned.state, "investigator", "officer-accept", { actorName: "เจ้าหน้าที่ ก.", actorOfficerId: "officer-a", at: "2026-08-13T10:00:00Z" });
assert.equal(wrongAccept.code, "MISSING_REQUIRED_FIELD"); // any investigator/officer รับแทนได้ — เคสนี้ขาด signature จึงเจอ MISSING_REQUIRED_FIELD ก่อน ACTOR_MISMATCH
const accepted = workflow.executeA5Action(assigned.state, "investigator", "officer-accept", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "officer-b", signature: "SIGNED", at: "2026-08-13T10:00:00Z" });
assert.equal(accepted.ok, true);
assert.equal(accepted.state.workflow.a5Status, "OFFICER_ACCEPTED");
assert.equal(accepted.state.assignment.acceptedAssignmentVersion, 1);

const updated = workflow.executeA5Action(accepted.state, "director", "team-update", { actorName: "ผอ.เขต 1", assistantOfficerIds: ["officer-c"], reason: "เพิ่มผู้เชี่ยวชาญ", expectedVersion: 1, at: "2026-08-13T11:00:00Z" });
assert.equal(updated.ok, true);
assert.equal(updated.state.workflow.a5Status, "OFFICER_ACCEPTED");
assert.equal(updated.state.assignment.assignmentVersion, 2);
assert.equal(updated.state.assignment.acceptedAssignmentVersion, 2, "assistant-only update keeps the same primary accepted");
const stale = workflow.executeA5Action(updated.state, "director", "team-update", { actorName: "ผอ.เขต 1", assistantOfficerIds: [], reason: "ล้าสมัย", expectedVersion: 1 });
assert.equal(stale.code, "VERSION_CONFLICT");

const reassignRequested = workflow.executeA5Action(updated.state, "investigator", "reassignment-request", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "officer-b", reason: "ปรับภาระงาน", at: "2026-08-13T11:30:00Z" });
assert.equal(reassignRequested.ok, true, "the current primary officer may request their own reassignment");
const reassignLogged = workflow.executeA5Action(reassignRequested.state, "clerk", "reassignment-request-log", { actorName: "ธุรการเขต 1", at: "2026-08-13T11:45:00Z" });
assert.equal(reassignLogged.ok, true);
const reassigned = workflow.executeA5Action(reassignLogged.state, "director", "primary-reassign", { actorName: "ผอ.เขต 1", primaryOfficerId: "officer-a", assistantOfficerIds: ["officer-b"], reason: "ปรับภาระงาน", expectedVersion: 2, at: "2026-08-13T12:00:00Z" });
assert.equal(reassigned.ok, true);
assert.equal(reassigned.state.workflow.a5Status, "ASSIGNMENT_APPROVED");
assert.equal(reassigned.state.assignment.acceptedAt, "");
assert.equal(reassigned.state.assignment.assignmentVersion, 3);
assert.equal(reassigned.state.assignment.acceptedAssignmentVersion, 0);
assert.equal(reassigned.state.inquiry.intake.investigator, "officer-a");
const normalizedReassignment = workflow.normalizeA5State(reassigned.state);
assert.equal(normalizedReassignment.assignment.acceptedAssignmentVersion, 0, "normalization preserves the explicit pending acceptance version after reassignment");
assert.deepEqual(workflow.getA5AvailableActions(normalizedReassignment, "investigator").map(action => action.id), ["officer-accept"]);

const active644 = structuredClone(updated.state);
active644.workflow.stage = "a5-inquiry";
active644.workflow.a5Status = "PLAN_DRAFT";
active644.inquiry.inquiry644 = { investigator: "officer-b" };
active644.pendingReassignment = { status: "LOGGED", requestedBy: "เจ้าหน้าที่ ข.", requestedByRole: "investigator", reason: "ปรับผู้ถือสำนวน 644", loggedBy: "ธุรการเขต 1" };
const reassigned644 = workflow.executeA5Action(active644, "director", "primary-reassign", { actorName: "ผอ.เขต 1", primaryOfficerId: "officer-a", assistantOfficerIds: ["officer-b"], reason: "ปรับผู้ถือสำนวน 644", expectedVersion: 2, at: "2026-08-13T12:00:00Z" });
assert.equal(reassigned644.ok, true);
assert.equal(reassigned644.state.inquiry.intake.investigator, "officer-a");
assert.equal(reassigned644.state.inquiry.inquiry644.investigator, "officer-a");
assert.deepEqual(workflow.getA5AvailableActions(reassigned644.state, "investigator").map(action => action.id), ["officer-accept"]);
assert.deepEqual(workflow.getA5AdminActions(reassigned644.state, "investigator").map(action => action.id), ["reassignment-handoff"], "the outgoing officer still sees the handoff action while acceptance is pending");
const blockedPlan = workflow.executeA5Action(reassigned644.state, "investigator", "plan-start", { actorName: "เจ้าหน้าที่ ก.", actorOfficerId: "officer-a" });
assert.equal(blockedPlan.code, "ASSIGNMENT_ACCEPTANCE_REQUIRED");

const custodyState = structuredClone(assigned.state);
custodyState.custody = { hasOriginal: true, status: "AT_SOURCE", history: [] };
const custody = workflow.executeA5Action(custodyState, "clerk", "custody-dispatch", { actorName: "ธุรการคดี", destination: "เขต 1", letterNo: "ปป 1/2569", emsNumber: "TH001", dispatchedAt: "2026-08-13" });
assert.equal(custody.ok, true);
assert.equal(custody.state.workflow.a5Status, "ASSIGNMENT_APPROVED", "custody remains independent from assignment state");

const legacyProposal = workflow.normalizeA5State({ workflow: { stage: "a5-intake", a5Status: "ASSIGNMENT_PROPOSED" }, assignment: { proposedOfficer: "คนที่ธุรการเคยเสนอ", performanceOwners: ["เจ้าของ KPI"] }, inquiry: { intake: {} } });
assert.equal(legacyProposal.workflow.a5Status, "PENDING_DIRECTOR_ASSIGNMENT");
assert.equal(legacyProposal.assignment.primaryOfficerId, "");
assert.deepEqual(legacyProposal.assignment.legacyPerformanceOwners, ["เจ้าของ KPI"]);
const legacyAgain = workflow.normalizeA5State(legacyProposal);
assert.equal(legacyAgain.migrationAudit.length, 1, "migration audit is idempotent");
assert.deepEqual(legacyAgain, legacyProposal, "legacy proposal normalization is deeply idempotent");
const proposalWithAliases = workflow.normalizeA5State({ workflow: { stage: "a5-intake", a5Status: "ASSIGNMENT_PROPOSED" }, assignment: { proposedOfficer: "draft-a", approvedOfficer: "draft-a", legalOwner: "draft-a", leadOfficer: "draft-a", teamMembers: ["draft-b"] }, inquiry: { intake: { investigator: "draft-a", team: ["draft-b"] } } });
assert.equal(proposalWithAliases.assignment.primaryOfficerId, "");
assert.equal(proposalWithAliases.assignment.approvedOfficer, undefined);
assert.equal(proposalWithAliases.inquiry.intake.investigator, undefined);
assert.deepEqual(workflow.normalizeA5State(proposalWithAliases), proposalWithAliases);

const conflict = workflow.normalizeA5State({ workflow: { stage: "a5-intake", a5Status: "ASSIGNMENT_APPROVED" }, assignment: { approvedOfficer: "officer-a", legalOwner: "officer-b" }, inquiry: { intake: {} } });
assert.equal(conflict.migrationBlocked, true);
assert.deepEqual(workflow.getA5AvailableActions(conflict, "director"), []);

console.log("PASS activity5-assignment-recommendation.test.mjs: deterministic advisory, assignment authority, acceptance, migration and custody");
