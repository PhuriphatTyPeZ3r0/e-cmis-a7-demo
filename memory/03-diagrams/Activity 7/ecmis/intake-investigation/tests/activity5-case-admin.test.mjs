import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("../assets/activity5-rules.js");
const workflow = require("../assets/activity5-workflow.js");
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;
globalThis.ThaiDatePicker = { html: () => "<input>", wireAll() {} };
const workspace = require("../assets/activity5-workspace.js");

const base = workflow.normalizeA5State({
  caseData: { id: "A5-D-001", region: "เขต 1" },
  workflow: { stage: "a5-prelim", a5Status: "PLAN_APPROVED" },
  intake: { receivedDate: { effectiveDate: "2026-01-01" } },
  assignment: { approvedOfficer: "เจ้าหน้าที่เดิม" },
  staffDirectory: [
    { officerId: "เจ้าหน้าที่เดิม", officerName: "เจ้าหน้าที่เดิม", positionName: "พนักงาน ป.ป.ท.", unitName: "เขต 1", status: "ACTIVE" },
    { officerId: "expert-a", officerName: "ผู้เชี่ยวชาญ ก.", positionName: "ผู้เชี่ยวชาญ", unitName: "เขต 1", status: "ACTIVE" }
  ],
  appointmentOrders: { primary: { orderNo: "คำสั่ง 1/2569", orderSignedAt: "2026-01-31", orderDocumentVersionId: "appointment-order:v1" }, supplements: [] },
  inquiry: { intake: { unit: "เขต 1", investigator: "เจ้าหน้าที่เดิม", receivedFirstAt: "2026-01-01" }, prelim: { deadlineAt: "2026-03-02" } }
});
const timing = state => ({ received: state.intake.receivedDate.effectiveDate, first: state.inquiry.intake.receivedFirstAt, deadline: state.inquiry.prelim.deadlineAt });
const originalTiming = timing(base);
const act = (state, role, id, payload = {}) => workflow.executeA5Action(state, role, id, { actorName: `${role} ก.`, ...(role === "investigator" ? { actorOfficerId: state.assignment?.primaryOfficerId } : {}), at: "2026-02-01T09:00:00Z", ...payload });

let route = act(base, "investigator", "return-request", { reason: "ส่งผิดสำนักงาน", opinion: "ควรส่งกลับ กบค.", destination: "เขต 2" });
assert.equal(route.state.returnRoute.destination, "เขต 2", "destination from the request is recorded for the GBK reroute");
const clerkCannotRequest = act(base, "clerk", "return-request", { reason: "ส่งผิดสำนักงาน", opinion: "ควรส่งกลับ กบค.", destination: "เขต 2" });
assert.equal(clerkCannotRequest.code, "ACTOR_MISMATCH", "clerk cannot initiate the return — the assigned investigator requests it");
assert.equal(route.state.returnRoute.status, "RETURN_REQUESTED");
const requestedRouteUi = workspace.caseDetailShellA5(route.state, "director", "current-task", null);
assert.match(requestedRouteUi, /พิจารณาคำขอส่งคืนสำนวนผ่าน กบค\./);
assert.match(requestedRouteUi, /data-a5-workflow-action="return-approve"/);
assert.match(requestedRouteUi, /สำนักงานปลายทางที่เสนอ/);
assert.doesNotMatch(requestedRouteUi, /RETURN_REQUESTED|PENDING_CONFIRMATION/);
const requestedRouteAdminUi = workspace.caseDetailShellA5(route.state, "director", "case-admin", null);
assert.match(requestedRouteAdminUi, /data-step-state="current" aria-current="step"><span>2<\/span><strong>ผอ\.อนุมัติ<\/strong>/);
route = act(route.state, "director", "return-approve", { opinion: "เห็นชอบ" });
assert.match(workspace.caseDetailShellA5(route.state, "clerk", "current-task", null), /จัดส่งสำนวนคืน กบค\./);
route = act(route.state, "clerk", "return-dispatch", { letterNo: "ปป 1/2569", emsNumber: "TH001", dispatchedAt: "2026-02-02" });
assert.equal(route.state.custody.status, "IN_TRANSIT");
route = act(route.state, "clerk", "gbk-receive", { receivedAt: "2026-02-03", holder: "กบค." });
route = act(route.state, "clerk", "gbk-reroute", { opinion: "จัดเส้นทางใหม่" });
assert.equal(route.state.returnRoute.destination, "เขต 2", "GBK reroute cannot change the destination fixed at request time");
route = act(route.state, "clerk", "destination-receive", { receivedAt: "2026-02-04", holder: "ธุรการเขต 2" });
assert.equal(route.state.returnRoute.status, "DESTINATION_RECEIVED");
const completedRouteUi = workspace.caseDetailShellA5(route.state, "clerk", "case-admin", null);
assert.equal((completedRouteUi.match(/data-step-state="complete"/g) || []).length, 6);
assert.equal(route.state.inquiry.intake.unit, "เขต 2");
assert.deepEqual(timing(route.state), originalTiming, "reroute preserves received date and deadline");
assert.equal(route.state.returnRoute.history.length, 6);
assert.equal(route.state.custody.history.length, 4);
assert.equal(route.state.inquiry.intake.physicalCustody.holder, "ธุรการเขต 2");

// Reassignment ceremony (item 4): request (any investigator on the case — primary or
// assistant — or the case clerk) → clerk logs → ผอ. reassigns → outgoing officer hands off
// → incoming officer accepts (existing officer-accept mechanism, reused).
const directCannotReassign = act(base, "director", "primary-reassign", { primaryOfficerId: "เจ้าหน้าที่ใหม่", reason: "ปรับภาระงาน", expectedVersion: 1 });
assert.equal(directCannotReassign.code, "REASSIGNMENT_REQUEST_REQUIRED", "primary-reassign requires a logged request first");

const clerkCannotRequestWithoutRole = act(base, "clerk", "reassignment-request", { reason: "ปรับภาระงาน" });
assert.equal(clerkCannotRequestWithoutRole.ok, true, "clerk is an authorized requester alongside case investigators");
const clerkRequested = clerkCannotRequestWithoutRole.state;
assert.equal(clerkRequested.pendingReassignment.status, "REQUESTED");
assert.equal(clerkRequested.pendingReassignment.requestedByRole, "clerk");
const doubleRequestBlocked = act(clerkRequested, "clerk", "reassignment-request", { reason: "อีกครั้ง" });
assert.equal(doubleRequestBlocked.code, "INVALID_TRANSITION", "cannot open a second request while one is already in flight");

let reassign = act(base, "investigator", "reassignment-request", { reason: "ปรับภาระงาน" });
assert.equal(reassign.ok, true);
assert.equal(reassign.state.pendingReassignment.reason, "ปรับภาระงาน");
const investigatorAdminUiRequested = workspace.caseDetailShellA5(reassign.state, "investigator", "case-admin", null);
assert.match(investigatorAdminUiRequested, /ยื่นคำขอแล้ว — รอธุรการรับคำขอ/);
const directorBeforeLog = act(reassign.state, "director", "primary-reassign", { primaryOfficerId: "เจ้าหน้าที่ใหม่", reason: "ปรับภาระงาน", expectedVersion: 1 });
assert.equal(directorBeforeLog.code, "REASSIGNMENT_REQUEST_REQUIRED", "ผอ. cannot act before the clerk logs the request");
reassign = act(reassign.state, "clerk", "reassignment-request-log", {}).state;
assert.equal(reassign.pendingReassignment.status, "LOGGED");
const reassignment = act(reassign, "director", "primary-reassign", { primaryOfficerId: "เจ้าหน้าที่ใหม่", assistantOfficerIds: [], reason: "ปรับภาระงาน", expectedVersion: 1 });
assert.equal(reassignment.state.assignment.legalOwner, "เจ้าหน้าที่ใหม่");
assert.equal(reassignment.state.assignment.leadOfficer, "เจ้าหน้าที่ใหม่");
assert.equal(reassignment.state.inquiry.intake.investigator, "เจ้าหน้าที่ใหม่");
assert.deepEqual(timing(reassignment.state), originalTiming);
assert.equal(reassignment.state.assignment.assignmentVersion, 2);
assert.equal(reassignment.state.assignmentHistory.at(-1).action, "primary-reassign");
assert.equal(reassignment.state.pendingReassignment.status, "ASSIGNED");
assert.equal(reassignment.state.pendingReassignment.fromOfficerId, "เจ้าหน้าที่เดิม");

const newOfficerBlockedBeforeHandoff = workflow.executeA5Action(reassignment.state, "investigator", "officer-accept", { actorName: "เจ้าหน้าที่ใหม่", actorOfficerId: "เจ้าหน้าที่ใหม่", at: "2026-02-01T09:00:00Z", signature: "sig" });
assert.equal(newOfficerBlockedBeforeHandoff.code, "REASSIGNMENT_HANDOFF_REQUIRED", "the incoming officer cannot accept before the outgoing officer hands off");
const wrongOfficerHandoff = workflow.executeA5Action(reassignment.state, "investigator", "reassignment-handoff", { actorName: "เจ้าหน้าที่ใหม่", actorOfficerId: "เจ้าหน้าที่ใหม่", at: "2026-02-01T09:00:00Z", note: "ส่งมอบ" });
assert.equal(wrongOfficerHandoff.code, "ACTOR_MISMATCH", "only the outgoing officer records the handoff");
const handedOff = workflow.executeA5Action(reassignment.state, "investigator", "reassignment-handoff", { actorName: "เจ้าหน้าที่เดิม", actorOfficerId: "เจ้าหน้าที่เดิม", at: "2026-02-01T09:00:00Z", note: "ส่งมอบเอกสารครบ" });
assert.equal(handedOff.ok, true);
assert.equal(handedOff.state.pendingReassignment.status, "HANDED_OFF");
const accepted = workflow.executeA5Action(handedOff.state, "investigator", "officer-accept", { actorName: "เจ้าหน้าที่ใหม่", actorOfficerId: "เจ้าหน้าที่ใหม่", at: "2026-02-01T09:00:00Z", signature: "sig" });
assert.equal(accepted.ok, true);
assert.equal(accepted.state.pendingReassignment.status, "", "ceremony clears once the incoming officer accepts");
assert.equal(accepted.state.reassignmentHistory.map(item => item.action).join(","), "request,log,handoff,accept");

let panel = workflow.executeA5Action(base, "investigator", "panel-change-draft", { actorName: "เจ้าหน้าที่เดิม", actorOfficerId: "เจ้าหน้าที่เดิม", at: "2026-02-01T09:00:00Z", reason: "เพิ่มผู้เชี่ยวชาญ", reportDocumentVersionId: "panel-change-report:v1", proposedMembers: ["expert-a"] });
panel = workflow.executeA5Action(panel.state, "investigator", "panel-change-submit", { actorName: "เจ้าหน้าที่เดิม", actorOfficerId: "เจ้าหน้าที่เดิม", at: "2026-02-01T09:00:00Z" });
const panelSnapshot = structuredClone(panel.state);
const blockedPanel = workflow.executeA5Action(panel.state, "director", "panel-change-approve", { actorName: "ผอ." });
assert.equal(blockedPanel.code, "PENDING_CONFIRMATION");
assert.equal(blockedPanel.rule.id, "panel-change-authority");
assert.deepEqual(panel.state, panelSnapshot);
const pendingPanelUi = workspace.caseDetailShellA5(panel.state, "director", "current-task", null);
assert.match(pendingPanelUi, /รอยืนยันผู้มีอำนาจอนุมัติการปรับองค์คณะ/);
assert.doesNotMatch(pendingPanelUi, /PENDING_CONFIRMATION|SUBMITTED/);
const recordedPanel = workflow.executeA5Action(panel.state, "case-clerk", "panel-change-record-signed-order", {
  actorName: "ธุรการคดี",
  orderNo: "อนุสนธิ 2/2569",
  orderSignedAt: "2026-02-03",
  orderDocumentVersionId: "panel-change-order:v1",
  parentOrderReference: "คำสั่ง 1/2569",
  authorityRef: { status: "CONFIRMED", referenceNo: "คำสั่ง 1/2569", authorityType: "SIGNED_ORDER" },
  at: "2026-02-03T09:00:00Z"
});
assert.equal(recordedPanel.ok, true);
assert.equal(recordedPanel.state.panelChangeRequests.at(-1).status, "RECORDED");
assert.equal(recordedPanel.state.appointmentOrders.supplements[0].parentOrderReference, "คำสั่ง 1/2569");
assert.equal(recordedPanel.state.inquiry.committee213.panel[0].officerId, "expert-a");

const xl = act(base, "investigator", "case-size-set", { caseSize: "XL", reason: "คดีสำคัญ ประชาชนให้ความสนใจ", caseSizeComponents: { position: 4, personsOrAllegations: 4, budgetOrDamage: 4, evidenceDifficulty: 4 } });
assert.equal(xl.ok, true);
assert.equal(xl.state.caseAdministration.caseSize, "L", "XL starts as L until the approval chain completes");
assert.equal(xl.state.caseAdministration.caseSizeRuleId, "xl-pending-route");
assert.equal(xl.state.caseAdministration.xlRequest.status, "PENDING");
assert.equal(xl.state.caseAdministration.caseSizeScore, 4, "score from 4 weighted components");
const xlRejectedNoReason = act(base, "investigator", "case-size-set", { caseSize: "XL", caseSizeComponents: { position: 4, personsOrAllegations: 4, budgetOrDamage: 4, evidenceDifficulty: 4 } });
assert.equal(xlRejectedNoReason.code, "MISSING_REQUIRED_FIELD", "XL requires a reason");
const xlStep1 = act(xl.state, "director", "xl-approve", { opinion: "เห็นควร" });
assert.equal(xlStep1.state.caseAdministration.xlRequest.approvals.length, 1);
assert.equal(xlStep1.state.caseAdministration.caseSize, "L", "still L after first approval step");
const xlStep2 = act(xlStep1.state, "director", "xl-approve", { opinion: "เห็นควร" });
const xlStep3 = act(xlStep2.state, "secretary", "xl-approve", { opinion: "เห็นควร" });
const xlChainDone = act(xlStep3.state, "secretary", "xl-approve", { opinion: "เห็นควร" });
assert.equal(xlChainDone.state.caseAdministration.xlRequest.status, "PENDING_BOARD", "internal 4-step chain alone does not confirm XL — the board (Activity 7) does");
assert.equal(xlChainDone.state.caseAdministration.caseSize, "L", "still L while waiting for the board to confirm");
assert.ok(!workflow.getA5AdminActions(xlChainDone.state, "director").some(action => action.id === "xl-approve"), "chain is exhausted — no more director/secretary approval steps");
assert.ok(workflow.getA5AdminActions(xlChainDone.state, "committee").some(action => action.id === "xl-board-confirm"), "board (committee role) now sees the confirmation action");
const xlBoardRejectedNoMti = act(xlChainDone.state, "committee", "xl-board-confirm", { mtiDate: "2026-03-05" });
assert.equal(xlBoardRejectedNoMti.code, "MISSING_REQUIRED_FIELD", "board confirmation requires the มติ number");
const xlDone = act(xlChainDone.state, "committee", "xl-board-confirm", { mtiNo: "16/2568", mtiDate: "2026-03-05" });
assert.equal(xlDone.state.caseAdministration.xlRequest.status, "APPROVED");
assert.equal(xlDone.state.caseAdministration.caseSize, "XL", "becomes XL only once the board confirms");
assert.equal(xlDone.state.caseAdministration.caseSizeRuleId, "xl-case-route");
assert.equal(xlDone.state.caseAdministration.xlRequest.boardConfirmation.mtiNo, "16/2568");
assert.ok(workflow.getA5AdminActions(xlDone.state, "director").some(action => ["team-update", "primary-reassign"].includes(action.id)), "XL route does not block unrelated admin work");

const sizingBoundaryCases = [
  { facts: { positionScore: 1, accusedCount: 2, allegationCount: 4, caseValueAmount: 200000, impactScore: 1, witnessCount: 10, evidenceComplexityScore: 1 }, components: { position: 1, personsOrAllegations: 1, budgetOrDamage: 1, evidenceDifficulty: 1 }, score: 1, size: "S" },
  { facts: { positionScore: 2, accusedCount: 3, allegationCount: 5, caseValueAmount: 200001, impactScore: 1, witnessCount: 11, evidenceComplexityScore: 1 }, components: { position: 2, personsOrAllegations: 2, budgetOrDamage: 2, evidenceDifficulty: 2 }, score: 2, size: "S" },
  { facts: { positionScore: 3, accusedCount: 5, allegationCount: 7, caseValueAmount: 500001, impactScore: 1, witnessCount: 31, evidenceComplexityScore: 1 }, components: { position: 3, personsOrAllegations: 3, budgetOrDamage: 3, evidenceDifficulty: 3 }, score: 3, size: "M" },
  { facts: { positionScore: 4, accusedCount: 7, allegationCount: 9, caseValueAmount: 1000001, impactScore: 1, witnessCount: 61, evidenceComplexityScore: 1 }, components: { position: 4, personsOrAllegations: 4, budgetOrDamage: 4, evidenceDifficulty: 4 }, score: 4, size: "L" }
];
for (const item of sizingBoundaryCases) {
  const assessed = workflow.assessCaseSizeA5(item.facts);
  assert.deepEqual(assessed.components, item.components, "raw case facts map to the documented component brackets");
  assert.equal(assessed.score, item.score);
  assert.equal(assessed.suggestion, item.size);
}

const strongestApplicableFactor = workflow.assessCaseSizeA5({ positionScore: 1, accusedCount: 1, allegationCount: 9, caseValueAmount: 100000, impactScore: 4, witnessCount: 1, evidenceComplexityScore: 4 });
assert.deepEqual(strongestApplicableFactor.components, { position: 1, personsOrAllegations: 4, budgetOrDamage: 4, evidenceDifficulty: 4 }, "OR criteria use the highest applicable score");

const autoSized = act(base, "investigator", "case-size-set", {
  caseSize: "S",
  caseSizeFacts: { positionScore: 4, accusedCount: 7, allegationCount: 9, caseValueAmount: 1000001, impactScore: 4, witnessCount: 61, evidenceComplexityScore: 4 }
});
assert.equal(autoSized.state.caseAdministration.caseSize, "L", "S/M/L is assigned from the calculated result instead of the submitted manual choice");
assert.equal(autoSized.state.caseAdministration.caseSizeSuggestion, "L");
assert.deepEqual(autoSized.state.caseAdministration.caseSizeFacts, { positionScore: 4, accusedCount: 7, allegationCount: 9, caseValueAmount: 1000001, impactScore: 4, witnessCount: 61, evidenceComplexityScore: 4 });

const incompleteFacts = act(base, "investigator", "case-size-set", { caseSize: "S", caseSizeFacts: { positionScore: 1 } });
assert.equal(incompleteFacts.code, "MISSING_REQUIRED_FIELD", "partial facts cannot silently under-size a case");

const xlFactsWithoutReason = act(base, "investigator", "case-size-set", {
  caseSize: "XL",
  caseSizeFacts: { positionScore: 4, accusedCount: 7, allegationCount: 9, caseValueAmount: 1000001, impactScore: 4, witnessCount: 61, evidenceComplexityScore: 4 }
});
assert.equal(xlFactsWithoutReason.code, "MISSING_REQUIRED_FIELD");
assert.deepEqual(xlFactsWithoutReason.state.caseAdministration, base.caseAdministration, "a rejected XL request does not partially write its assessment");

const legacyAfterFacts = act(autoSized.state, "investigator", "case-size-set", { caseSize: "S", caseSizeComponents: { position: 1, personsOrAllegations: 1, budgetOrDamage: 1, evidenceDifficulty: 1 }, caseValueAmount: 100 });
assert.equal(Object.hasOwn(legacyAfterFacts.state.caseAdministration, "caseSizeFacts"), false, "legacy component scoring clears stale raw facts");

const clerkAdminUi = workspace.caseDetailShellA5(base, "clerk", "case-admin", null);
assert.match(clerkAdminUi, /ส่งคืนผ่าน กบค\./);
assert.doesNotMatch(clerkAdminUi, /data-a5-workflow-action="return-request"/, "clerk does not initiate the return — the assigned investigator does");
assert.doesNotMatch(clerkAdminUi, /data-a5-workflow-action="(?:team-update|primary-reassign)"/);
assert.match(clerkAdminUi, /data-a5-store-action="merge-case"/);
assert.match(clerkAdminUi, /data-a5-store-action="split-case"/);
assert.doesNotMatch(clerkAdminUi, /id="a5CaseSize"/, "clerk no longer sets case size — the assigned investigator does");
assert.match(clerkAdminUi, />ยังไม่กำหนด</);
assert.doesNotMatch(clerkAdminUi, />UNDETERMINED<|>XL</);
assert.doesNotMatch(clerkAdminUi, /transfer-post-request|transfer-accept|transfer-reject|change-investigator|org-change-request/);
const investigatorAdminUi = workspace.caseDetailShellA5(base, "investigator", "case-admin", null);
assert.match(investigatorAdminUi, /data-a5-workflow-action="panel-change-draft"/);
assert.match(investigatorAdminUi, /id="a5PanelReportDocumentVersion"/);
assert.match(investigatorAdminUi, /id="a5PanelMembers"/);
assert.match(investigatorAdminUi, /data-a5-workflow-action="return-request"/, "assigned investigator can request the return through GBK");
assert.match(investigatorAdminUi, /id="a5CaseSize"/, "assigned investigator sets the case size");
assert.match(investigatorAdminUi, /id="a5SizePosition"/, "case-size components (4 weighted factors) are part of the form");
assert.match(investigatorAdminUi, /id="a5SizeAccusedCount"/, "auto sizing collects the raw accused count");
assert.match(investigatorAdminUi, /id="a5SizeAllegationCount"/, "auto sizing collects the raw allegation count");
assert.match(investigatorAdminUi, /id="a5SizeImpact"/, "auto sizing collects the impact score separately from the amount");
assert.match(investigatorAdminUi, /id="a5SizeWitnessCount"/, "auto sizing collects the raw witness count");
assert.match(investigatorAdminUi, /id="a5SizeEvidenceComplexity"/, "auto sizing collects evidence complexity separately from the witness count");
assert.match(investigatorAdminUi, /ระบบกำหนด S\/M\/L อัตโนมัติ/);
assert.match(investigatorAdminUi, /ไม่เกิน 200,000 บาท = 1/);
assert.doesNotMatch(investigatorAdminUi, /&lt;1ล้าน=1|&lt;5ล้าน=2|&lt;20ล้าน=3/, "the obsolete budget thresholds are not shown");
assert.match(investigatorAdminUi, /a5-hint/, "case-size hint tooltip is present");
assert.doesNotMatch(investigatorAdminUi, /data-a5-store-action="merge-case"/);

const submittedPanelClerkUi = workspace.caseDetailShellA5(panel.state, "case-clerk", "case-admin", null);
assert.match(submittedPanelClerkUi, /data-a5-workflow-action="panel-change-record-signed-order"/);
assert.match(submittedPanelClerkUi, /id="a5PanelParentOrderReference"/);
assert.match(submittedPanelClerkUi, /id="a5PanelAuthorityReference"/);

const store = {
  PRIMARY: { ...structuredClone(base), caseData: { id: "PRIMARY" } },
  SECONDARY: { ...structuredClone(base), caseData: { id: "SECONDARY" } }
};
const storeSnapshot = structuredClone(store);
const unauthorizedStoreSnapshot = structuredClone(store);
const unauthorizedMerge = workspace.executeA5StoreAction(store, "SECONDARY", "investigator", "merge-case", { primaryCaseId: "PRIMARY", actorName: "เจ้าหน้าที่" });
assert.equal(unauthorizedMerge.code, "ACTOR_MISMATCH");
assert.deepEqual(store, unauthorizedStoreSnapshot);
const merged = workspace.executeA5StoreAction(store, "SECONDARY", "clerk", "merge-case", { primaryCaseId: "PRIMARY", actorName: "ธุรการ" });
assert.equal(merged.ok, true);
assert.deepEqual(store, storeSnapshot, "store orchestration returns an atomic copy and never partially mutates its caller");
assert.equal(merged.store.SECONDARY.caseAdministration.lockedByMerge, true);
assert.equal(merged.store.SECONDARY.caseAdministration.primaryCaseId, "PRIMARY");
assert.deepEqual(merged.store.PRIMARY.caseAdministration.mergedCaseIds, ["SECONDARY"]);
assert.equal(workspace.resolveA5CaseId(merged.store, "SECONDARY"), "PRIMARY");
const lockedSecondaryUi = workspace.caseDetailShellA5(merged.store.SECONDARY, "clerk", "case-admin", null);
assert.match(lockedSecondaryUi, /สำนวนรองของ PRIMARY/);
assert.deepEqual(workflow.getA5AvailableActions(merged.store.SECONDARY, "investigator"), []);
const lockedCurrentUi = workspace.caseDetailShellA5(merged.store.SECONDARY, "investigator", "current-task", null);
assert.match(lockedCurrentUi, /สำนวนนี้รวมเป็นสำนวนรองของ PRIMARY/);
assert.doesNotMatch(lockedCurrentUi, /data-a5-workflow-action|LEGACY_ACTIVE|PENDING_CONFIRMATION/);
assert.equal(workspace.executeA5StoreAction(merged.store, "PRIMARY", "clerk", "merge-case", { primaryCaseId: "SECONDARY", actorName: "ธุรการ" }).code, "MERGE_CYCLE");
const missingMerge = workspace.executeA5StoreAction(store, "SECONDARY", "clerk", "merge-case", { primaryCaseId: "MISSING", actorName: "ธุรการ" });
assert.equal(missingMerge.code, "RELATED_CASE_NOT_FOUND");
assert.deepEqual(missingMerge.store, store);

const splitBlocked = workspace.executeA5StoreAction(store, "PRIMARY", "clerk", "split-case", { actorName: "ธุรการ", boardApprovalRequired: true, selected: { subject: "ประเด็นแยก" } });
assert.equal(splitBlocked.code, "PENDING_CONFIRMATION");
assert.equal(splitBlocked.rule.id, "split-case-board-approval");
const split = workspace.executeA5StoreAction(store, "PRIMARY", "clerk", "split-case", { actorName: "ธุรการ", selected: { subject: "ประเด็นแยก", allegations: "ข้อกล่าวหาเฉพาะ", accused: ["นาย ก."] } });
assert.equal(split.ok, true);
assert.match(split.childId, /^\d{4}\/\d{4}$/, "split-case must draw a real sequential case number from the authoritative register, not a SPLIT-MOCK-derived string");
assert.equal(split.store[split.childId].caseAdministration.sourceCaseId, "PRIMARY");
assert.equal(split.store[split.childId].inquiry.inquiry644.allegations, "ข้อกล่าวหาเฉพาะ");
assert.equal(split.store[split.childId].inquiry.prelim.plan, "", "split copies selective payload only");
assert.match(workspace.caseDetailShellA5(split.store.PRIMARY, "clerk", "case-admin", null), new RegExp(split.childId.replace("/", "\\/")));
assert.doesNotMatch(workspace.caseDetailShellA5(split.store.PRIMARY, "clerk", "case-admin", null), /เลข Mock up|SPLIT-MOCK/);

// This suite's localStorage stub never persists (setItem is a no-op), so every
// issueSplitCaseId() call yields the same number — which is exactly the scenario
// the bounded retry guard exists for. With the target id already occupied, the
// handler must give up cleanly (CASE_ID_COLLISION) rather than overwrite the
// existing case or loop forever.
const collidingStore = { ...store, [split.childId]: { ...structuredClone(base), caseData: { id: split.childId } } };
const collidedSplit = workspace.executeA5StoreAction(collidingStore, "PRIMARY", "clerk", "split-case", { actorName: "ธุรการ", selected: { subject: "ประเด็นแยกลำดับถัดไป" } });
assert.equal(collidedSplit.code, "CASE_ID_COLLISION");
assert.deepEqual(collidedSplit.store, collidingStore, "a collision must not mutate the caller's store");

console.log("PASS activity5-case-admin.test.mjs: return route, reassignment, panel pending, merge/split and case size");
