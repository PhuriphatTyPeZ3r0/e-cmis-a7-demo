import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const recommendation = require("../assets/activity5-assignment-recommendation.js");
const workflow = require("../assets/activity5-workflow.js");

const legacy = {
  caseData: { id: "A5-001", received: "5 สิงหาคม 2569" },
  workflow: { stage: "a5-intake", status: "legacy status" },
  inquiry: { prelim: { plan: "แผนเดิม" } },
  decisionHistory: [{ text: "เหตุการณ์เดิม", time: "เดิม" }]
};

const normalized = workflow.normalizeA5State(legacy);
assert.notEqual(normalized, legacy);
assert.equal(normalized.workflow.stage, "a5-intake");
assert.equal(normalized.workflow.status, "legacy status");
assert.equal(normalized.workflow.a5Status, workflow.PROCESS_STATES.PENDING_INTAKE_CHECK);
assert.equal(normalized.inquiry.prelim.plan, "แผนเดิม");
assert.deepEqual(normalized.decisionHistory, legacy.decisionHistory);
assert.deepEqual(workflow.normalizeA5State(normalized), normalized, "normalization must be idempotent");

const legacyClerkAccepted = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: workflow.PROCESS_STATES.CLERK_ACKNOWLEDGED },
  intake: { status: workflow.PROCESS_STATES.CLERK_ACKNOWLEDGED },
  assignment: { primaryOfficerId: "legacy-primary", assignmentVersion: 4 },
  inquiry: { intake: { investigator: "legacy-primary" } }
});
assert.equal(legacyClerkAccepted.workflow.a5Status, workflow.PROCESS_STATES.OFFICER_ACCEPTED);
assert.equal(legacyClerkAccepted.assignment.acceptedAssignmentVersion, 4);
assert.deepEqual(workflow.getA5AvailableActions(legacyClerkAccepted, "investigator").map(action => action.id), ["plan-start"]);
assert.deepEqual(workflow.normalizeA5State(legacyClerkAccepted), legacyClerkAccepted, "legacy clerk acceptance migration is idempotent");

const legacyExplicitAccepted = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: workflow.PROCESS_STATES.OFFICER_ACCEPTED },
  assignment: { primaryOfficerId: "legacy-explicit", assignmentVersion: 2, acceptedBy: "legacy-explicit", acceptedAt: "2569-08-01" },
  inquiry: { intake: { investigator: "legacy-explicit" } }
});
assert.equal(legacyExplicitAccepted.assignment.acceptedAssignmentVersion, 2);
assert.deepEqual(workflow.normalizeA5State(legacyExplicitAccepted), legacyExplicitAccepted, "explicit legacy acceptance migration is idempotent");

const closed = workflow.normalizeA5State({
  workflow: { stage: "closed", complete: true, a5Status: workflow.PROCESS_STATES.PENDING_INTAKE_CHECK },
  intake: { status: workflow.PROCESS_STATES.PENDING_INTAKE_CHECK }
});
assert.equal(closed.workflow.a5Status, workflow.PROCESS_STATES.COMPLETED);
assert.equal(closed.intake.status, workflow.PROCESS_STATES.COMPLETED);
assert.deepEqual(workflow.getA5AvailableActions(closed, "clerk"), []);
const completedLegacyStage = workflow.normalizeA5State({
  workflow: { stage: "a5-outcome", complete: true, a5Status: workflow.PROCESS_STATES.PLAN_DRAFT },
  intake: { status: workflow.PROCESS_STATES.PLAN_DRAFT }
});
assert.equal(completedLegacyStage.workflow.a5Status, workflow.PROCESS_STATES.COMPLETED);
assert.equal(completedLegacyStage.intake.status, workflow.PROCESS_STATES.COMPLETED);

const legacyWaiting = workflow.normalizeA5State({
  workflow: { stage: "a5-prelim", a5Status: workflow.PROCESS_STATES.PLAN_DRAFT },
  inquiry: { prelim: { planStatus: "รออนุมัติจากหัวหน้าพนักงาน" } }
});
assert.equal(legacyWaiting.workflow.a5Status, workflow.PROCESS_STATES.PLAN_SUBMITTED);
assert.equal(legacyWaiting.intake.status, workflow.PROCESS_STATES.PLAN_SUBMITTED);

const legacyPrelimDraft = workflow.normalizeA5State({
  workflow: { stage: "a5-prelim" },
  inquiry: {
    intake: { investigator: "เจ้าหน้าที่เดิม", team: ["สมาชิกเดิม"] },
    prelim: { plan: "แผน 213 เดิม", planStatus: "รอจัดทำแผนคดี" }
  }
});
assert.equal(legacyPrelimDraft.workflow.a5Status, workflow.PROCESS_STATES.PLAN_DRAFT);
assert.equal(legacyPrelimDraft.assignment.approvedOfficer, "เจ้าหน้าที่เดิม");
assert.equal(legacyPrelimDraft.planLifecycle.plan, "แผน 213 เดิม");
const legacyPrelimSubmitted = workflow.executeA5Action(legacyPrelimDraft, "investigator", "plan-submit", {
  actorName: "เจ้าหน้าที่เดิม",
  actorOfficerId: "เจ้าหน้าที่เดิม",
  at: "2569-08-01"
});
assert.equal(legacyPrelimSubmitted.ok, true, "legacy draft is immediately usable after normalization");

const legacyInquiryDraft = workflow.normalizeA5State({
  workflow: { stage: "a5-inquiry" },
  inquiry: {
    intake: { investigator: "เจ้าหน้าที่ 213 เดิม" },
    inquiry644: { investigator: "เจ้าหน้าที่ 644", plan: "แผน 644 เดิม", planStatus: "รอคำสั่งแต่งตั้ง" }
  }
});
assert.equal(legacyInquiryDraft.workflow.a5Status, workflow.PROCESS_STATES.PLAN_DRAFT);
assert.equal(legacyInquiryDraft.assignment.approvedOfficer, "เจ้าหน้าที่ 644");
assert.equal(legacyInquiryDraft.planLifecycle.plan, "แผน 644 เดิม");
const formerOwnerRejected = workflow.executeA5Action(legacyInquiryDraft, "investigator", "plan-submit", {
  actorName: "เจ้าหน้าที่ 213 เดิม",
  actorOfficerId: "เจ้าหน้าที่ 213 เดิม",
  plan: "อดีตเจ้าของพยายามแก้ 644",
  at: "2569-08-02"
});
assert.equal(formerOwnerRejected.ok, false);
assert.equal(formerOwnerRejected.code, "ACTOR_MISMATCH");
const inquirySubmitted = workflow.executeA5Action(legacyInquiryDraft, "investigator", "plan-submit", {
  actorName: "เจ้าหน้าที่ 644",
  actorOfficerId: "เจ้าหน้าที่ 644",
  plan: "แผน 644 ปรับปรุง",
  at: "2569-08-02"
});
assert.equal(inquirySubmitted.state.inquiry.inquiry644.planStatus, "รออนุมัติจากหัวหน้าพนักงาน");
assert.equal(inquirySubmitted.state.inquiry.inquiry644.plan, "แผน 644 ปรับปรุง");
assert.equal(inquirySubmitted.state.inquiry.inquiry644.investigator, "เจ้าหน้าที่ 644");
assert.equal(inquirySubmitted.state.inquiry.intake.investigator, "เจ้าหน้าที่ 213 เดิม", "visible 213 owner remains unchanged");
const inquiryApproved = workflow.executeA5Action(inquirySubmitted.state, "director", "plan-approve", {
  actorName: "ผอ. 644",
  at: "2569-08-03"
});
assert.equal(inquiryApproved.state.inquiry.inquiry644.planStatus, "approved");
assert.equal(inquiryApproved.state.planLifecycle.version, 1);

const legacyInquiryApproved = workflow.normalizeA5State({
  workflow: { stage: "a5-inquiry" },
  inquiry: {
    intake: { investigator: "เจ้าหน้าที่ 644" },
    inquiry644: {
      plan: "แผน 644 อนุมัติเดิม",
      planStatus: "approved",
      planApprovedBy: "ผอ.เดิม",
      planApprovedAt: "2569-07-31",
      planVersion: 3
    }
  }
});
assert.equal(legacyInquiryApproved.workflow.a5Status, workflow.PROCESS_STATES.PLAN_APPROVED);
assert.equal(legacyInquiryApproved.planLifecycle.status, workflow.PROCESS_STATES.PLAN_APPROVED);
assert.equal(legacyInquiryApproved.planLifecycle.plan, "แผน 644 อนุมัติเดิม");
assert.equal(legacyInquiryApproved.planLifecycle.approvedBy, "ผอ.เดิม");
assert.equal(legacyInquiryApproved.planLifecycle.approvedAt, "2569-07-31");
assert.equal(legacyInquiryApproved.planLifecycle.version, 3);

const legacyInquirySubmitted = workflow.normalizeA5State({
  workflow: { stage: "a5-inquiry" },
  inquiry: { inquiry644: { planStatus: "รออนุมัติจากหัวหน้าพนักงาน" } }
});
assert.equal(legacyInquirySubmitted.workflow.a5Status, workflow.PROCESS_STATES.PLAN_SUBMITTED);

const inquirySearchWarrantMock = workflow.normalizeA5State({
  caseData: { id: "A5-644-SEARCH" },
  workflow: { stage: "a5-inquiry", a5Status: workflow.PROCESS_STATES.PLAN_APPROVED },
  assignment: { primaryOfficerId: "officer-644", assignmentVersion: 1, acceptedAssignmentVersion: 1 },
  inquiry: { inquiry644: { startedAt: "2026-08-20", deadlineAt: "2027-05-17" } }
});
assert.deepEqual(workflow.getA5InterventionActions(inquirySearchWarrantMock, "investigator").map(action => action.id), ["search-warrant-mock-request"]);
const inquirySearchWarrantGranted = workflow.executeA5Action(inquirySearchWarrantMock, "investigator", "search-warrant-mock-request", {
  actorName: "ผู้รับผิดชอบ 644",
  actorOfficerId: "officer-644",
  at: "2026-08-21T09:00:00.000Z"
});
assert.equal(inquirySearchWarrantGranted.ok, true);
assert.equal(inquirySearchWarrantGranted.state.searchWarrantRequests.at(-1).status, "ISSUED");
assert.equal(inquirySearchWarrantGranted.state.searchWarrantRequests.at(-1).mock, true);
assert.equal(inquirySearchWarrantGranted.state.searchWarrantRequests.at(-1).createdStage, "a5-inquiry");
assert.equal(inquirySearchWarrantGranted.state.inquiry.inquiry644.deadlineAt, "2027-05-17", "mock search warrant does not change the 270-day deadline");
assert.deepEqual(inquirySearchWarrantGranted.state.externalExchanges, [], "mock search warrant does not dispatch to Activity 9");
const inquirySearchWarrantWrongActor = workflow.executeA5Action(inquirySearchWarrantMock, "director", "search-warrant-mock-request", { actorName: "ผอ.หน่วยงาน", at: "2026-08-21T09:00:00.000Z" });
assert.equal(inquirySearchWarrantWrongActor.code, "ACTOR_MISMATCH");
assert.deepEqual(inquirySearchWarrantWrongActor.state, inquirySearchWarrantMock);

const conflicting = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: workflow.PROCESS_STATES.ASSIGNMENT_APPROVED },
  intake: { status: workflow.PROCESS_STATES.PENDING_INTAKE_CHECK }
});
assert.equal(conflicting.workflow.a5Status, workflow.PROCESS_STATES.ASSIGNMENT_APPROVED);
assert.equal(conflicting.intake.status, workflow.PROCESS_STATES.ASSIGNMENT_APPROVED, "workflow.a5Status is canonical");

const firstActions = workflow.getA5AvailableActions(normalized, "clerk");
assert.deepEqual(firstActions.map(action => action.id), ["intake-review-submit"]);
assert.equal(workflow.getA5PrimaryAction(normalized, "clerk").id, "intake-review-submit");
assert.equal(workflow.getA5PrimaryAction(normalized, "director"), null);

const wrongActor = workflow.executeA5Action(normalized, "director", "intake-review-submit", { actorName: "ผอ." });
assert.equal(wrongActor.ok, false);
assert.equal(wrongActor.code, "ACTOR_MISMATCH");
assert.deepEqual(normalized, workflow.normalizeA5State(legacy), "failed action must not mutate input");
const missingReceivedDate = workflow.executeA5Action(normalized, "clerk", "intake-review-submit", { actorName: "ธุรการ ก." });
assert.equal(missingReceivedDate.code, "MISSING_REQUIRED_FIELD");
assert.ok(missingReceivedDate.errors.includes("intakeReview.documentResults"));
assert.deepEqual(normalized, workflow.normalizeA5State(legacy), "missing received date does not mutate input");

const processRecommendation = recommendation.recommendInvestigators(
  { difficulty: 3, requiredExperienceTags: ["ทั่วไป"], completeness: 100, unit: "เขต 1" },
  [{ id: "เจ้าหน้าที่ ข.", name: "เจ้าหน้าที่ ข.", unit: "เขต 1", available: true, weightedWorkload: 2, complexityCapacity: 3, experienceTags: ["ทั่วไป"] }],
  { generatedAt: "2569-08-01" }
);
const steps = [
  ["clerk", "intake-review-submit", { actorName: "ธุรการ ก.", receivedDate: { channel: "ระบบต้นทาง", recordedAt: "2569-08-01", effectiveDate: "2569-08-01" }, intakeReview: { documentResults: [{ id: "form-3", result: "COMPLETE" }], jurisdictionResult: "IN_SCOPE", complaintTypeResult: "CORRUPTION", completenessResult: "COMPLETE", clerkOpinion: "เอกสารครบ" } }, workflow.PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT],
  ["director", "assignment-confirm", { actorName: "ผอ. ค.", primaryOfficerId: "เจ้าหน้าที่ ข.", assistantOfficerIds: [], decisionNote: "เหมาะสมกับสำนวน", recommendationSnapshot: processRecommendation }, workflow.PROCESS_STATES.ASSIGNMENT_APPROVED],
  ["investigator", "officer-accept", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "เจ้าหน้าที่ ข.", signature: "SIGNED" }, workflow.PROCESS_STATES.OFFICER_ACCEPTED],
  ["investigator", "plan-start", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "เจ้าหน้าที่ ข." }, workflow.PROCESS_STATES.PLAN_DRAFT]
];

let current = normalized;
for (const [role, actionId, payload, expectedState] of steps) {
  const beforeHistory = current.decisionHistory.length;
  const result = workflow.executeA5Action(current, role, actionId, { ...payload, at: `2569-08-${String(beforeHistory + 1).padStart(2, "0")}` });
  assert.equal(result.ok, true, actionId);
  assert.equal(result.code, "TRANSITIONED", actionId);
  assert.equal(result.state.workflow.a5Status, expectedState, actionId);
  assert.equal(result.state.decisionHistory.length, beforeHistory + 1, `${actionId} appends one event`);
  assert.notEqual(result.state, current, `${actionId} returns a new state`);
  current = result.state;
}

assert.equal(current.assignment.primaryOfficerId, "เจ้าหน้าที่ ข.");
assert.equal(current.assignment.approvedOfficer, "เจ้าหน้าที่ ข.");
assert.equal(current.assignment.legalOwner, "เจ้าหน้าที่ ข.");
assert.equal(current.assignment.leadOfficer, "เจ้าหน้าที่ ข.");
assert.deepEqual(current.assignment.teamMembers, []);
assert.equal(current.assignment.performanceOwners, undefined, "KPI owners are never inferred from team");
assert.equal(current.assignment.acceptedBy, "เจ้าหน้าที่ ข.");
assert.equal(current.inquiry.intake.investigator, "เจ้าหน้าที่ ข.", "legacy renderer sees the approved investigator");
assert.equal(current.assignmentHistory.length, 2, "assignment and acceptance are separate assignment records");
const legacyResponsibility = workflow.normalizeA5State({
  workflow: { stage: "a5-prelim" },
  inquiry: { intake: { investigator: "เจ้าหน้าที่หลัก", team: ["สมาชิก ก.", "สมาชิก ข."] }, prelim: {} }
});
assert.equal(legacyResponsibility.assignment.legalOwner, "เจ้าหน้าที่หลัก");
assert.equal(legacyResponsibility.assignment.leadOfficer, "เจ้าหน้าที่หลัก");
assert.deepEqual(legacyResponsibility.assignment.teamMembers, ["สมาชิก ก.", "สมาชิก ข."]);
assert.equal(legacyResponsibility.assignment.performanceOwners, undefined);
assert.equal(current.planLifecycle.dueAt, "2569-08-06", "plan due is stored as +2 calendar days in mock state");
assert.equal(current.planLifecycle.dueRuleId, "plan-deadline-day-kind");
const existingDueState = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: "ASSIGNMENT_APPROVED" },
  intake: { status: "ASSIGNMENT_APPROVED" }, assignment: { approvedOfficer: "เจ้าหน้าที่ ข." },
  planLifecycle: { dueAt: "2026-08-20" }, inquiry: { intake: { investigator: "เจ้าหน้าที่ ข." }, prelim: {} }
});
const acceptedWithExistingDue = workflow.executeA5Action(existingDueState, "investigator", "officer-accept", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "เจ้าหน้าที่ ข.", signature: "SIGNED", at: "2026-08-13T09:00:00Z" });
assert.equal(acceptedWithExistingDue.state.planLifecycle.dueAt, "2026-08-20", "officer acceptance preserves an existing plan deadline");

const datedIntake = workflow.executeA5Action(normalized, "clerk", "intake-review-submit", {
  actorName: "ธุรการ ก.",
  at: "2026-08-13T09:00:00Z",
  receivedDate: { channel: "ข้อมูลจากระบบต้นทาง", recordedAt: "2026-08-12", effectiveDate: "2026-08-13", outsideHoursOrHoliday: true },
  intakeReview: { documentResults: [{ id: "form-3", result: "COMPLETE" }], jurisdictionResult: "IN_SCOPE", complaintTypeResult: "CORRUPTION", completenessResult: "COMPLETE", clerkOpinion: "เอกสารครบ" }
});
assert.equal(datedIntake.ok, true);
assert.equal(datedIntake.state.intake.receivedDate.effectiveDate, "2026-08-13");
assert.equal(datedIntake.state.intake.receivedDate.ruleId, "received-date-outside-office-hours");
const missingEffectiveDate = workflow.executeA5Action(normalized, "clerk", "intake-review-submit", {
  actorName: "ธุรการ ก.", receivedDate: { channel: "ข้อมูลจากระบบต้นทาง", recordedAt: "2026-08-12", outsideHoursOrHoliday: true },
  intakeReview: { documentResults: [{ id: "form-3", result: "COMPLETE" }], jurisdictionResult: "IN_SCOPE", complaintTypeResult: "CORRUPTION", completenessResult: "COMPLETE", clerkOpinion: "เอกสารครบ" }
});
assert.equal(missingEffectiveDate.code, "MISSING_REQUIRED_FIELD");
assert.deepEqual(missingEffectiveDate.errors, ["receivedDate.effectiveDate"]);

const custodyBase = workflow.normalizeA5State({
  workflow: { stage: "a5-intake" },
  custody: { hasOriginal: true, status: "AT_SOURCE" },
  inquiry: { intake: {} }
});
assert.ok(workflow.getA5AvailableActions(custodyBase, "clerk").some(action => action.id === "custody-dispatch"));
const custodyDispatched = workflow.executeA5Action(custodyBase, "clerk", "custody-dispatch", {
  actorName: "ธุรการ ก.", destination: "เขต 2", letterNo: "ปป 001/2569", emsNumber: "TH123", dispatchedAt: "2026-08-13", at: "2026-08-13T10:00:00Z"
});
assert.equal(custodyDispatched.state.custody.status, "IN_TRANSIT");
assert.equal(custodyDispatched.state.inquiry.intake.physicalCustody.emsNumber, "TH123");
const custodyReceived = workflow.executeA5Action(custodyDispatched.state, "clerk", "custody-receive", {
  actorName: "ธุรการเขต 2", receivedAt: "2026-08-14", holder: "งานธุรการคดี เขต 2", at: "2026-08-14T09:00:00Z"
});
assert.equal(custodyReceived.state.custody.status, "RECEIVED_AT_DESTINATION");
assert.equal(custodyReceived.state.custody.history.length, 2);
const custodyReturnMissingHolder = workflow.executeA5Action(custodyReceived.state, "clerk", "custody-return", {
  actorName: "ธุรการเขต 2", returnedAt: "2026-08-15", reason: "ส่งคืนต้นทาง"
});
assert.deepEqual(custodyReturnMissingHolder.errors, ["holder"]);
const custodyReturned = workflow.executeA5Action(custodyReceived.state, "clerk", "custody-return", {
  actorName: "ธุรการเขต 2", returnedAt: "2026-08-15", reason: "ส่งคืนต้นทาง", holder: "งานสารบรรณ กบค.", at: "2026-08-15T09:00:00Z"
});
assert.equal(custodyReturned.state.custody.status, "RETURNED");
assert.equal(custodyReturned.state.custody.holder, "งานสารบรรณ กบค.");

const deadlineAlert = workflow.getA5DeadlineAlert({
  workflow: { stage: "a5-prelim" },
  inquiry: { prelim: { startedAt: "2026-06-29", deadlineAt: "2026-08-28" } }
}, "2026-08-13");
assert.equal(deadlineAlert.level, "warning");
assert.equal(deadlineAlert.elapsedDays, 45);
assert.equal(deadlineAlert.remainingDays, 15);
const day15Alert = workflow.getA5DeadlineAlert({
  workflow: { stage: "a5-prelim" },
  inquiry: { prelim: { startedAt: "2026-08-01", deadlineAt: "2026-09-30" } }
}, "2026-08-16");
assert.equal(day15Alert.reminderDay, 15);
const extensionDay30Alert = workflow.getA5DeadlineAlert({
  workflow: { stage: "a5-prelim" },
  inquiry: { prelim: { startedAt: "2026-08-01", deadlineAt: "2026-10-30", extensionHistory: [{ status: "APPROVED", approvedDays: 30, previousDeadline: "2026-09-30" }] } }
}, "2026-10-30");
assert.equal(extensionDay30Alert.reminderDay, 30);

const missingOfficer = workflow.executeA5Action(
  { ...normalized, workflow: { ...normalized.workflow, a5Status: workflow.PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT } },
  "clerk",
  "assignment-confirm",
  { actorName: "ธุรการ ก." }
);
assert.equal(missingOfficer.ok, false);
assert.equal(missingOfficer.code, "ACTOR_MISMATCH");

const corruptApprovalState = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: workflow.PROCESS_STATES.PENDING_DIRECTOR_ASSIGNMENT },
  assignment: {},
  inquiry: { intake: {} }
});
const corruptApproval = workflow.executeA5Action(corruptApprovalState, "director", "assignment-confirm", { actorName: "ผอ. ค." });
assert.equal(corruptApproval.ok, false);
assert.equal(corruptApproval.code, "MISSING_REQUIRED_FIELD");
assert.deepEqual(corruptApproval.errors, ["primaryOfficerId"]);
assert.deepEqual(corruptApproval.state, corruptApprovalState, "corrupt approval does not mutate state");
const legacyPrefillNotProof = workflow.normalizeA5State({
  workflow: { stage: "a5-intake", a5Status: workflow.PROCESS_STATES.ASSIGNMENT_PROPOSED },
  intake: { status: workflow.PROCESS_STATES.ASSIGNMENT_PROPOSED },
  assignment: { proposedOfficer: "เจ้าหน้าที่ใหม่" },
  inquiry: { intake: { investigator: "ชื่อเดิมจากต้นทาง" } }
});
assert.equal(legacyPrefillNotProof.assignment.approvedOfficer, undefined, "legacy investigator is not assignment approval proof");

const submittedPlan = workflow.executeA5Action(current, "investigator", "plan-submit", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  plan: "ตรวจพยานเอกสารและพยานบุคคล",
  at: "2569-08-07"
});
assert.equal(submittedPlan.ok, true);
assert.equal(submittedPlan.state.workflow.a5Status, workflow.PROCESS_STATES.PLAN_SUBMITTED);
assert.equal(submittedPlan.state.planLifecycle.plan, "ตรวจพยานเอกสารและพยานบุคคล");
assert.equal(submittedPlan.state.inquiry.prelim.planStatus, "รออนุมัติจากหัวหน้าพนักงาน");
const directorPlanActions = workflow.getA5AvailableActions(submittedPlan.state, "director");
assert.deepEqual(directorPlanActions.map(action => action.id), ["plan-approve", "plan-return"]);
assert.equal(directorPlanActions.filter(action => action.primary).length, 1);
assert.equal(workflow.getA5PrimaryAction(submittedPlan.state, "director").id, "plan-approve");

const returnedPlan = workflow.executeA5Action(submittedPlan.state, "director", "plan-return", {
  actorName: "ผอ. ค.",
  reason: "เพิ่มแผนตรวจเอกสาร",
  at: "2569-08-08"
});
assert.equal(returnedPlan.ok, true);
assert.equal(returnedPlan.state.workflow.a5Status, workflow.PROCESS_STATES.PLAN_RETURNED);
assert.equal(returnedPlan.state.inquiry.prelim.planStatus, "ส่งกลับแก้ไข");
assert.equal(returnedPlan.state.inquiry.prelim.planReturnReason, "เพิ่มแผนตรวจเอกสาร");

const resubmittedPlan = workflow.executeA5Action(returnedPlan.state, "investigator", "plan-submit", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  plan: "เพิ่มแผนตรวจเอกสารแล้ว",
  at: "2569-08-09"
});
const approvedPlan = workflow.executeA5Action(resubmittedPlan.state, "director", "plan-approve", {
  actorName: "ผอ. ค.",
  at: "2569-08-10"
});
assert.equal(approvedPlan.ok, true);
assert.equal(approvedPlan.state.workflow.a5Status, workflow.PROCESS_STATES.PLAN_APPROVED);
assert.equal(approvedPlan.state.planLifecycle.history.length, 5);
assert.equal(approvedPlan.state.planLifecycle.version, 1);
assert.equal(approvedPlan.state.inquiry.prelim.planStatus, "approved");
assert.equal(approvedPlan.state.inquiry.prelim.planApprovedBy, "ผอ. ค.");

const approvedWithExistingTeam = structuredClone(approvedPlan.state);
approvedWithExistingTeam.inquiry.intake.team = ["เจ้าหน้าที่ ข.", "สมาชิกเดิม"];
const amendmentPreservingTeam = workflow.executeA5Action(approvedWithExistingTeam, "investigator", "plan-amend", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  reason: "แก้รายละเอียดแผนโดยไม่เปลี่ยนทีม",
  at: "2569-08-10"
});
assert.deepEqual(amendmentPreservingTeam.state.planLifecycle.amendment.teamMembers, ["เจ้าหน้าที่ ข.", "สมาชิกเดิม"]);

const amendmentDraft = workflow.executeA5Action(approvedPlan.state, "investigator", "plan-amend", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  reason: "เพิ่มสมาชิกทีมหลังอนุมัติ",
  teamMembers: ["เจ้าหน้าที่ ข.", "เจ้าหน้าที่ ง."],
  at: "2569-08-11"
});
assert.equal(amendmentDraft.ok, true);
assert.equal(amendmentDraft.state.workflow.a5Status, workflow.PROCESS_STATES.AMENDMENT_DRAFT);
assert.equal(amendmentDraft.state.planLifecycle.amendment.baseVersion, 1);
const amendmentSubmitted = workflow.executeA5Action(amendmentDraft.state, "investigator", "amendment-submit", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  plan: "แผนแก้ไขพร้อมสมาชิกทีมเพิ่ม",
  at: "2569-08-12"
});
const amendmentReturned = workflow.executeA5Action(amendmentSubmitted.state, "director", "amendment-return", {
  actorName: "ผอ. ค.",
  reason: "เพิ่มหน้าที่สมาชิกใหม่",
  at: "2569-08-13"
});
assert.equal(amendmentReturned.state.workflow.a5Status, workflow.PROCESS_STATES.AMENDMENT_RETURNED);
const amendmentResubmitted = workflow.executeA5Action(amendmentReturned.state, "investigator", "amendment-submit", {
  actorName: "เจ้าหน้าที่ ข.",
  actorOfficerId: "เจ้าหน้าที่ ข.",
  plan: "แผนแก้ไขพร้อมหน้าที่สมาชิกใหม่",
  at: "2569-08-14"
});
const amendmentApproved = workflow.executeA5Action(amendmentResubmitted.state, "director", "amendment-approve", {
  actorName: "ผอ. ค.",
  at: "2569-08-15"
});
assert.equal(amendmentApproved.ok, true);
assert.equal(amendmentApproved.state.workflow.a5Status, workflow.PROCESS_STATES.AMENDMENT_APPROVED);
assert.equal(amendmentApproved.state.planLifecycle.version, 2);
assert.equal(amendmentApproved.state.planLifecycle.amendment.version, 2);
assert.equal(amendmentApproved.state.inquiry.prelim.plan, "แผนแก้ไขพร้อมหน้าที่สมาชิกใหม่");
assert.deepEqual(amendmentApproved.state.inquiry.intake.team, ["เจ้าหน้าที่ ข.", "เจ้าหน้าที่ ง."]);

const missingAmendReason = workflow.executeA5Action(approvedPlan.state, "investigator", "plan-amend", { actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "เจ้าหน้าที่ ข." });
assert.equal(missingAmendReason.ok, false);
assert.equal(missingAmendReason.code, "MISSING_REQUIRED_FIELD");
assert.deepEqual(missingAmendReason.errors, ["reason"]);

const pendingDeadline = workflow.executeA5Action(current, "investigator", "plan-deadline-confirm", {
  actorName: "เจ้าหน้าที่ ข.", actorOfficerId: "เจ้าหน้าที่ ข."
});
assert.equal(pendingDeadline.ok, false);
assert.equal(pendingDeadline.code, "PENDING_CONFIRMATION");
assert.equal(pendingDeadline.rule.id, "plan-deadline-day-kind");

const viewModel = workflow.buildA5ViewModel(approvedPlan.state, "investigator", "task");
assert.equal(viewModel.activeTab, "task");
assert.equal(viewModel.processState, workflow.PROCESS_STATES.PLAN_APPROVED);
assert.deepEqual(viewModel.actions.map(action => action.id), ["plan-amend"]);

console.log("PASS activity5-process-flow.test.mjs: normalization, intake/assignment and plan lifecycle");
