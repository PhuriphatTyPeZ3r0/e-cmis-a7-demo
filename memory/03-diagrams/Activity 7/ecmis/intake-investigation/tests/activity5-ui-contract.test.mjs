import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;
globalThis.ThaiDatePicker = { html: () => "<input>", wireAll() {} };
require("../assets/activity5-rules.js");
require("../assets/activity5-assignment-recommendation.js");
require("../assets/activity5-workflow.js");
const workspace = require("../assets/activity5-workspace.js");

const seededCases = workspace.allA5Cases();
assert.ok(seededCases.length >= 53);
for (const unit of workspace.A5_OPERATIONAL_UNITS) {
  assert.ok(seededCases.filter(state => workspace.caseUnitA5(state) === unit).length >= 3, `มี Seed อย่างน้อย 3 สำนวนสำหรับ ${unit}`);
}
assert.ok(seededCases.every(state => state.workflow?.stage === "a5-intake"));
assert.ok(seededCases.every(state => Object.keys(state.assignment || {}).length === 0));

const missingReviewCopy = workspace.workflowErrorPresentationA5({
  code: "MISSING_REQUIRED_FIELD",
  errors: ["intakeReview.jurisdictionResult", "intakeReview.complaintTypeResult", "intakeReview.completenessResult"]
});
assert.equal(missingReviewCopy.title, "กรอกข้อมูลให้ครบถ้วน");
assert.match(missingReviewCopy.message, /ผลตรวจเขตอำนาจ/);
assert.match(missingReviewCopy.message, /ประเภทเรื่อง/);
assert.match(missingReviewCopy.message, /ผลตรวจความครบถ้วนของเอกสาร/);
assert.doesNotMatch(`${missingReviewCopy.title} ${missingReviewCopy.message}`, /MISSING_REQUIRED_FIELD|intakeReview\./);
assert.equal(missingReviewCopy.firstControlId, "a5ReviewJurisdiction");
const unknownWorkflowCopy = workspace.workflowErrorPresentationA5({ code: "SOME_INTERNAL_CODE", errors: ["internal.raw.path"] });
assert.doesNotMatch(`${unknownWorkflowCopy.title} ${unknownWorkflowCopy.message}`, /SOME_INTERNAL_CODE|internal\.raw\.path/);

const state = {
  caseData: { id: "A5-UI-001", subject: "ตรวจสอบการจัดซื้อ", complainant: "นาย ก.", agency: "หน่วยงาน ข.", region: "เขต 2", received: "5 สิงหาคม 2569" },
  documentData: { documentSubject: "ตรวจสอบการจัดซื้อ", decision: "18/1ก" },
  workflow: { stage: "a5-prelim", status: "จัดทำแผนคดี", owner: "investigator" },
  decisionHistory: [{ text: "รับสำนวนแล้ว", time: "5 สิงหาคม 2569" }]
};
workspace.ensureInquiry(state);
state.inquiry.intake.investigator = "เจ้าหน้าที่ ก.";
state.assignment.approvedOfficer = "เจ้าหน้าที่ ก.";

const task = workspace.caseDetailShellA5(state, "investigator", "current-task", null);
assert.match(task, /class="ws-card ws-case-head"/);
assert.match(task, /class="ws-card ws-stagebar a5 a5-stagebar"/);
assert.match(task, /id="a5StageCompact"[^>]+class="a5-stage-compact"/);
assert.match(task, /ขั้นที่ 2 จาก 8/);
assert.match(task, /id="a5StageToggle"[^>]+aria-expanded="false"[^>]+aria-controls="a5StageFull"/);
assert.match(task, /id="a5StageFull"[^>]+class="ws-stage-track"[^>]+hidden/);
assert.match(task, /class="admin-queue-tabs" role="tablist" aria-label="เมนูสำนวน"/);
for (const [id, label] of [["overview", "ภาพรวม"], ["current-task", "งานปัจจุบัน"], ["documents", "เอกสาร"], ["history", "ประวัติ"], ["case-admin", "บริหารสำนวน"]]) {
  assert.match(task, new RegExp(`id="a5-tab-${id}"[^>]+role="tab"[^>]+aria-controls="a5-panel-${id}"[^>]+data-a5-workspace-tab="${id}"[^>]*>${label}<`));
}
assert.match(task, /id="a5-tab-current-task"[^>]+tabindex="0"/);
assert.match(task, /id="a5-tab-overview"[^>]+tabindex="-1"/);
assert.match(task, /id="a5-panel-current-task"/);
assert.match(task, /id="a5-panel-current-task"[^>]+aria-labelledby="a5-tab-current-task"/);
assert.match(task, /class="document-workspace"/);
assert.match(task, /class="ws-card ws-editor/);
assert.match(task, /class="ws-editor-head"/);
assert.match(task, /class="ws-editor-body"/);
assert.match(task, /class="ws-doc-pane"/);
assert.match(task, /id="a5PaperStage"/);
assert.match(task, /class="ws-actions"/);
assert.doesNotMatch(task, /บริหารสำนวน \(ธุรการคดี\)/);
assert.doesNotMatch(task, /a5-case-context|a5-detail-shell|a5-primary-action-descriptor|a5-task-action-region|<dialog|a5-document-dialog/);
assert.doesNotMatch(task, /LEGACY_ACTIVE|PENDING_CONFIRMATION|ยืนยันไม่ได้จาก state/);
const actionRegion = task.match(/<div class="ws-actions">([\s\S]*?)<\/div>/)?.[1] || "";
assert.ok((actionRegion.match(/ws-button primary/g) || []).length <= 1, "action region has at most one primary button");
assert.ok((actionRegion.match(/ws-button (?:secondary|ghost|danger)/g) || []).length <= 3, "action region has at most three secondary actions");

const inquirySearchState = structuredClone(state);
inquirySearchState.workflow = { stage: "a5-inquiry", a5Status: "PLAN_APPROVED", owner: "investigator" };
inquirySearchState.assignment = { primaryOfficerId: "officer-644", assignmentVersion: 1, acceptedAssignmentVersion: 1 };
inquirySearchState.inquiry.inquiry644 = { investigatorId: "officer-644", investigator: "officer-644", startedAt: "2026-08-20", deadlineAt: "2027-05-17" };
const inquirySearchUi = workspace.caseDetailShellA5(inquirySearchState, "investigator", "current-task", null);
assert.match(inquirySearchUi, /data-a5-action="search-warrant-mock-request"[^>]*>ขอหมายค้น \(จำลอง\)<\/button>/);
assert.match(inquirySearchUi, /ไม่หยุดนับกรอบ 270 วัน/);
const issuedMockSearch = globalThis.ECMISActivity5Workflow.executeA5Action(inquirySearchState, "investigator", "search-warrant-mock-request", { actorName: "ผู้รับผิดชอบ 644", actorOfficerId: "officer-644", at: "2026-08-21T09:00:00.000Z" });
const issuedMockSearchUi = workspace.caseDetailShellA5(issuedMockSearch.state, "investigator", "current-task", null);
assert.match(issuedMockSearchUi, /ได้รับหมายค้นแล้ว \(ข้อมูลจำลอง\)/);
assert.doesNotMatch(issuedMockSearchUi, /data-a5-action="search-warrant-mock-request"/);

const documents = workspace.caseDetailShellA5(state, "investigator", "documents", null);
assert.match(documents, /id="a5-panel-documents"/);
assert.match(documents, /data-a5-open-doc="plan"/);
assert.match(documents, /id="a5PaperStage"/, "document pane stays mounted in the A4-style workspace");

const viewer = workspace.caseDetailShellA5(state, "investigator", "documents", "plan");
assert.doesNotMatch(viewer, /<dialog|a5-document-dialog/);
assert.match(viewer, /id="a5PaperStage"/);
assert.match(viewer, /id="a5-doc-tab-plan"[^>]+role="tab"[^>]+aria-controls="a5-document-panel"[^>]+tabindex="0"/);
assert.match(viewer, /id="a5-document-panel"[^>]+role="tabpanel"[^>]+aria-labelledby="a5-doc-tab-plan"/);
assert.match(viewer, /data-a5-action="print"/);
assert.match(viewer, /id="a5DocEditFab"/);
assert.match(viewer, /class="ws-button secondary ws-doc-pane-toggle"[^>]+aria-controls="a5DocumentPane"[^>]+aria-expanded="true"/);
assert.match(viewer, /class="ws-doc-pane-rail"[^>]+aria-controls="a5DocumentPane"[^>]+aria-expanded="false"/);

const history = workspace.caseDetailShellA5(state, "investigator", "history", null);
assert.match(history, /id="a5-panel-history"/);
assert.match(history, /รับสำนวนแล้ว/);

const admin = workspace.caseDetailShellA5(state, "clerk", "case-admin", null);
assert.match(admin, /id="a5-panel-case-admin"/);
assert.match(admin, /บริหารสำนวน \(ธุรการคดี\)/);

const intakeState = {
  caseData: { id: "A5-UI-INTAKE", subject: "รับสำนวน", channel: "ระบบต้นทาง", region: "เขต 2" },
  documentData: {}, workflow: { stage: "a5-intake", a5Status: "PENDING_INTAKE_CHECK" },
  inquiry: { intake: {}, prelim: {} }, decisionHistory: [],
  inboundDocumentManifest: {
    schemaVersion: 1,
    signedVersion: 4,
    signedAt: "2026-08-04T08:00:00+07:00",
    documents: [
      { documentId: "ecmis-review-record", label: "แบบบันทึกการพิจารณาและกลั่นกรองเรื่องร้องเรียน/เบาะแส", html: '<article data-inbound-signed="true"><span contenteditable="true">เอกสารกลั่นกรองฉบับลงนาม</span><input value="ข้อมูลลงนาม"></article>' },
      { documentId: "1-03", label: "แบบบันทึกการตรวจสอบเรื่องร้องเรียน", html: '<article data-inbound-signed="true">แบบ ปปท. 1-03 ฉบับลงนาม</article>' }
    ],
    expectedDocuments: [
      { documentId: "ecmis-review-record", label: "แบบบันทึกการพิจารณาและกลั่นกรองเรื่องร้องเรียน/เบาะแส" },
      { documentId: "1-03", label: "แบบบันทึกการตรวจสอบเรื่องร้องเรียน" }
    ],
    attachments: [{ name: "หลักฐานการจัดซื้อ.pdf", type: "PDF", pages: 4, size: "820 KB", description: "เอกสารจากผู้ร้อง" }],
    dispatchProof: { name: "ใบรับฝาก EMS.pdf", method: "EMS", trackingNo: "ED123456789TH" }
  }
};
const intakeTask = workspace.caseDetailShellA5(intakeState, "clerk", "current-task", null);
assert.match(intakeTask, /<h2[^>]*>รับสำนวน 1\/4 · ตรวจรับและยืนยันวันรับ<\/h2>/);
assert.match(intakeTask, /id="a5ReceivedRecordedAt"/);
assert.match(intakeTask, /id="a5ReceivedEffectiveDate"/);
assert.match(intakeTask, /วันที่เริ่มนับระยะเวลา/);
assert.match(intakeTask, /ระบบจะไม่คำนวณวันทำการแทนจนกว่าจะยืนยันกติกา/);
assert.match(intakeTask, /class="document-workspace"/);
assert.match(intakeTask, /class="ws-doc-pane a5-inbound-doc-pane"/);
assert.match(intakeTask, /class="ws-doc-toolbar"/);
assert.match(intakeTask, /id="a5InboundDocJump"/);
assert.match(intakeTask, /id="a5InboundDocJump"[^>]*><option value="__all__">ดูเอกสารทั้งหมด<\/option>/);
assert.match(intakeTask, /data-a5-inbound-doc="a4-signed-0"/);
assert.match(intakeTask, /data-a5-inbound-doc="a4-signed-1"/);
assert.match(intakeTask, /เอกสารกลั่นกรองฉบับลงนาม/);
assert.match(intakeTask, /หลักฐานการจัดซื้อ\.pdf/);
assert.match(intakeTask, /ใบรับฝาก EMS\.pdf/);
assert.match(intakeTask, /อ่านอย่างเดียว/);
assert.match(intakeTask, /contenteditable="false"/);
assert.match(intakeTask, /<input disabled value="ข้อมูลลงนาม">/);
assert.doesNotMatch(intakeTask, /contenteditable="true"/);
assert.doesNotMatch(intakeTask, /id="a5DocEditFab"|id="a5DocSave"|data-a5-action="print"|data-a5-open-inbound|download=/);
const allInboundState = structuredClone(intakeState);
allInboundState.inboundDocumentManifest.expectedDocuments.push({ documentId: "missing-form", label: "เอกสารที่ยังขาด" });
const allInboundDocuments = workspace.caseDetailShellA5(allInboundState, "clerk", "current-task", "__all__");
assert.match(allInboundDocuments, /<option value="__all__" selected>ดูเอกสารทั้งหมด<\/option>/);
assert.match(allInboundDocuments, /class="a5-inbound-all"/);
assert.ok((allInboundDocuments.match(/class="a5-inbound-all-item"/g) || []).length >= 5);
assert.match(allInboundDocuments, /ฉบับลงนาม · อ่านอย่างเดียว/);
assert.match(allInboundDocuments, /ข้อมูลอ้างอิงเอกสารแนบ/);
assert.match(allInboundDocuments, /ยังไม่ได้รับเอกสาร/);
assert.match(allInboundDocuments, /ไม่ได้รับเอกสารฉบับนี้จากระบบต้นทาง/);
assert.match(allInboundDocuments, /ไม่มีปุ่มเปิดหรือดาวน์โหลดปลอม/);
assert.doesNotMatch(allInboundDocuments, /data-a5-open-inbound|download=/);
const secondInboundDocument = workspace.caseDetailShellA5(intakeState, "clerk", "current-task", "a4-signed-1");
assert.match(secondInboundDocument, /แบบ ปปท\. 1-03 ฉบับลงนาม/);
assert.doesNotMatch(secondInboundDocument, /เอกสารกลั่นกรองฉบับลงนาม/);
const inboundAttachment = workspace.caseDetailShellA5(intakeState, "clerk", "current-task", "a4-attachment-0");
assert.match(inboundAttachment, /มีเฉพาะข้อมูลอ้างอิง/);
assert.match(inboundAttachment, /ไม่มีปุ่มเปิดหรือดาวน์โหลดปลอม/);
assert.match(intakeTask, /รอยืนยันกติกากระบวนงาน/);
assert.match(intakeTask, /data-a5-workflow-action="intake-review-submit"/);
assert.match(intakeTask, /id="a5ReviewJurisdiction"/);
assert.match(intakeTask, /id="a5ClerkOpinion"/);
assert.doesNotMatch(intakeTask, /a5ProposedOfficer|a5PrimaryOfficer|เจ้าของผลงาน\/KPI/);
assert.doesNotMatch(workspace.caseDetailShellA5(intakeState, "director", "current-task", null), /data-a5-workflow-action="intake-review-submit"/);

const unnamedProofIntakeState = structuredClone(intakeState);
unnamedProofIntakeState.inboundDocumentManifest.dispatchProof.name = "";
const unnamedProofTask = workspace.caseDetailShellA5(unnamedProofIntakeState, "clerk", "current-task", "a4-dispatch-proof");
assert.match(unnamedProofTask, /<h2>ไม่ระบุชื่อไฟล์<\/h2>/);
assert.match(unnamedProofTask, /วิธีส่ง<\/dt><dd>EMS/);
assert.match(unnamedProofTask, /เลขติดตาม<\/dt><dd>ED123456789TH/);

const special582State = {
  caseData: { id: "0010/2569", decision: "58/2" },
  workflow: { stage: "closed", a5Status: "CLOSED", status: "ปิดสำนวน" },
  inquiry: { intake: {}, prelim: {}, inquiry644: {} },
  assignment: {}, decisionHistory: [], documentData: {}
};
workspace.ensureInquiry(special582State);
assert.equal(special582State.inquiry.special?.type, "");
assert.doesNotThrow(() => workspace.caseDetailShellA5(special582State, "clerk", "current-task", null));

const proposedState = structuredClone(intakeState);
proposedState.workflow.a5Status = "PENDING_DIRECTOR_ASSIGNMENT";
proposedState.intake = { status: "PENDING_DIRECTOR_ASSIGNMENT" };
proposedState.intakeReview = { clerkOpinion: "เอกสารครบและอยู่ในอำนาจ", reviewedBy: "ธุรการคดี", reviewedAt: "2026-08-13" };
proposedState.assignment = {};
const directorTask = workspace.caseDetailShellA5(proposedState, "director", "current-task", null);
assert.match(directorTask, /data-a5-workflow-action="assignment-confirm"/);
assert.match(directorTask, /Mock deterministic v1/);
assert.match(directorTask, /type="radio"[^>]+name="a5PrimaryOfficer"/);
assert.match(directorTask, /type="checkbox"[^>]+name="a5AssistantOfficer"/);
assert.match(directorTask, /class="a5-master-list"/);
assert.match(directorTask, /class="a5-master-detail-shell"/);
assert.equal((directorTask.match(/class="a5-master-row/g) || []).length, 4);
assert.equal((directorTask.match(/class="a5-recommended-pill"/g) || []).length, 1);
assert.match(directorTask, /data-a5-candidate-focus=/);
assert.match(directorTask, /class="a5-role-segment"/);
for (const roleChoice of ["primary", "assistant", "none"]) assert.match(directorTask, new RegExp(`data-a5-role-choice="${roleChoice}"`));
assert.match(directorTask, /ความพร้อมด้านภาระงาน/);
assert.match(directorTask, /class="a5-candidate-detail"/);
assert.equal((directorTask.match(/class="a5-candidate-detail"[^>]* hidden/g) || []).length, 3);
assert.match(directorTask, /วิธีคำนวณและข้อจำกัดของคะแนน/);
assert.match(directorTask, /ทีมที่เลือก:/);
assert.match(directorTask, /class="a5-selected-team a5-assignment-command"/);
assert.match(directorTask, /ความเห็นธุรการ/);
assert.doesNotMatch(directorTask, /a5-recommendation-card|a5-recommendation-grid|a5-decision-row/);
assert.doesNotMatch(directorTask, /<small>mock-investigator-/);
assert.doesNotMatch(directorTask, /เจ้าของผลงาน\/KPI|a5PerformanceOwners/);

const custodyState = structuredClone(intakeState);
custodyState.custody = { hasOriginal: true, status: "AT_SOURCE", history: [] };
const custodyTask = workspace.caseDetailShellA5(custodyState, "clerk", "current-task", null);
assert.match(custodyTask, /id="a5CustodyEms"/);
assert.match(custodyTask, /data-a5-workflow-action="custody-dispatch"/);
const returnedCustodyState = structuredClone(custodyState);
returnedCustodyState.custody.status = "RECEIVED_AT_DESTINATION";
returnedCustodyState.custody.holder = "ธุรการเขต 2";
const returnCustodyTask = workspace.caseDetailShellA5(returnedCustodyState, "clerk", "current-task", null);
assert.match(returnCustodyTask, /id="a5CustodyReturnHolder"/);

const assertTaskMatrix = (html, heading, step) => {
  assert.match(html, new RegExp(`<h2[^>]*>${heading}<\\/h2>`));
  assert.match(html, new RegExp(`ขั้นที่ ${step} จาก 8`));
  assert.doesNotMatch(html, /LEGACY_ACTIVE|PENDING_CONFIRMATION|RETURN_REQUESTED|PLAN_(?:DRAFT|SUBMITTED|APPROVED)|ASSIGNMENT_(?:PROPOSED|APPROVED)|COMPLETED/);
  const outerActions = html.match(/<div class="ws-actions a5-current-actions">([\s\S]*?)<\/div><\/main>/)?.[1] || "";
  assert.ok((outerActions.match(/ws-button primary/g) || []).length <= 1);
};
assertTaskMatrix(directorTask, "พิจารณาและมอบหมายสำนวน", 1);
const uiRecommendation = globalThis.ECMISActivity5AssignmentRecommendation.recommendInvestigators(
  { difficulty: 3, requiredExperienceTags: ["การเงิน"], completeness: 100, unit: "เขต 2" },
  [
    { id: "mock-investigator-1", name: "พนักงาน ป.ป.ท. สมชาย", unit: "เขต 2", available: true, weightedWorkload: 1, complexityCapacity: 3, experienceTags: ["การเงิน"] },
    { id: "mock-investigator-2", name: "พนักงาน ป.ป.ท. วิภา", unit: "เขต 2", available: true, weightedWorkload: 2, complexityCapacity: 3, experienceTags: ["การเงิน"] }
  ],
  { generatedAt: "2026-08-13T09:00:00Z" }
);
const uiAssignment = globalThis.ECMISActivity5Workflow.executeA5Action(proposedState, "director", "assignment-confirm", {
  actorName: "ผอ.เขต 2",
  primaryOfficerId: "mock-investigator-2",
  assistantOfficerIds: [],
  decisionNote: "เลือกผู้เชี่ยวชาญที่รับผิดชอบพื้นที่",
  recommendationSnapshot: uiRecommendation,
  at: "2026-08-13T09:30:00Z"
});
assert.equal(uiAssignment.ok, true, "director assigns candidate 2 from a valid recommendation snapshot");
const approvedAssignmentState = uiAssignment.state;
globalThis.ECMISCurrentAccount = { officerId: "mock-investigator-1", name: "พนักงาน ป.ป.ท. สมชาย" };
const nonPrimaryAcceptUi = workspace.caseDetailShellA5(approvedAssignmentState, "investigator", "current-task", null);
assertTaskMatrix(nonPrimaryAcceptUi, "รับสำนวน 3/4 · รับมอบและลงนามรับสำนวน", 1);
assert.match(nonPrimaryAcceptUi, /data-a5-workflow-action="officer-accept"/); // ปลดล็อค: ศรร/นักสืบคนไหนก็รับแทนได้
globalThis.ECMISCurrentAccount = { officerId: "mock-investigator-2", name: "พนักงาน ป.ป.ท. วิภา" };
assert.match(workspace.caseDetailShellA5(approvedAssignmentState, "investigator", "current-task", null), /data-a5-workflow-action="officer-accept"/);
delete globalThis.ECMISCurrentAccount;
assert.match(workspace.mockAccountSelectorA5("investigator"), /บัญชีผู้ใช้งานจำลอง/);
assert.match(workspace.mockAccountSelectorA5("investigator"), /value="mock-investigator-2"/);
assert.equal(workspace.setCurrentA5MockAccount("mock-investigator-2"), true);
assert.deepEqual(workspace.currentA5Account(), { officerId: "mock-investigator-2", name: "พนักงาน ป.ป.ท. วิภา", source: "mock" });
assert.equal(workspace.canonicalA5Unit("ปราบ 1"), "กองปราบ 1");
assert.equal(workspace.canonicalA5Unit("กปท.4"), "กองปราบ 4");
assert.equal(workspace.canonicalA5Unit("สำนักงาน ป.ป.ท. เขต 5"), "เขต 5");
assert.equal(workspace.setA5UnitContext("กองปราบ 3"), true);
assert.equal(workspace.currentA5UnitContext("investigator"), "กองปราบ 3");
assert.equal(workspace.currentA5UnitContext("secretary"), "ส่วนกลาง");
assert.match(workspace.unitContextSelectorA5("investigator"), /id="wsUnitA5"/);
assert.match(workspace.unitContextSelectorA5("investigator"), /กองปราบ 3/);
assert.match(workspace.unitContextSelectorA5("secretary"), /class="ws-hidden"/);
assert.equal(workspace.caseUnitA5({ inquiry: { intake: { unit: "ปราบ 1" } } }), "กองปราบ 1");
const candidate2AcceptUi = workspace.caseDetailShellA5(approvedAssignmentState, "investigator", "current-task", null);
assert.match(candidate2AcceptUi, /data-a5-workflow-action="officer-accept"/);
const selectedMockAccount = workspace.currentA5Account();
const candidate2Accepted = globalThis.ECMISActivity5Workflow.executeA5Action(approvedAssignmentState, "investigator", "officer-accept", {
  actorName: selectedMockAccount.name,
  actorOfficerId: selectedMockAccount.officerId,
  signature: "SIGNED",
  at: "2026-08-13T10:00:00Z"
});
assert.equal(candidate2Accepted.ok, true, "assigned candidate 2 can accept after switching the current mock account");
assert.equal(candidate2Accepted.state.assignment.acceptedBy, "พนักงาน ป.ป.ท. วิภา");
assert.equal(candidate2Accepted.state.assignmentHistory.at(-1).officerId, "mock-investigator-2");
globalThis.ECMISCurrentAccount = { officerId: "mock-investigator-2", name: "พนักงาน ป.ป.ท. วิภา" };

const planState = structuredClone(state);
planState.workflow.a5Status = "PLAN_SUBMITTED";
planState.intake = { status: "PLAN_SUBMITTED" };
planState.planLifecycle = { status: "PLAN_SUBMITTED", dueAt: "2026-08-15", dueRuleId: "plan-deadline-day-kind", version: 0, history: [] };
const planDirectorTask = workspace.caseDetailShellA5(planState, "director", "current-task", null);
assert.match(planDirectorTask, /ขั้นที่ 2 จาก 8 · แผนคดี/);
assert.match(planDirectorTask, /กำหนดจัดทำแผน \+2 วัน/);
assert.match(planDirectorTask, /data-a5-workflow-action="plan-approve"/);
assert.match(planDirectorTask, /data-a5-workflow-action="plan-return"/);
assertTaskMatrix(planDirectorTask, "ตรวจและอนุมัติแผนคดี", 2);
const approvedPlanState = structuredClone(planState);
approvedPlanState.workflow.a5Status = "PLAN_APPROVED";
approvedPlanState.intake.status = "PLAN_APPROVED";
approvedPlanState.planLifecycle.status = "PLAN_APPROVED";
assert.match(workspace.caseDetailShellA5(approvedPlanState, "investigator", "current-task", null), /ขั้นที่ 3 จาก 8 · ไต่สวนเบื้องต้น/);
const review213State = structuredClone(approvedPlanState);
review213State.workflow.stage = "a5-prelim-review";
review213State.workflow.a5Status = "LEGACY_ACTIVE";
review213State.intake.status = "LEGACY_ACTIVE";
review213State.inquiry.prelim.chain = { currentIndex: 0, steps: [{ role: "group-director", label: "ผอ.กอง" }] };
assertTaskMatrix(workspace.caseDetailShellA5(review213State, "group-director", "current-task", null), "ตรวจรายงาน 213 ตามลำดับชั้น", 3);
const inquiry644State = structuredClone(approvedPlanState);
inquiry644State.workflow.stage = "a5-inquiry";
inquiry644State.inquiry.inquiry644 = { investigator: "เจ้าหน้าที่ 644", status: "อยู่ระหว่างไต่สวน", extensionHistory: [] };
assertTaskMatrix(workspace.caseDetailShellA5(inquiry644State, "investigator", "current-task", null), "ดำเนินการไต่สวน แจ้งข้อกล่าวหา และจัดทำรายงาน 644", 5);
const extensionPendingState = structuredClone(approvedPlanState);
extensionPendingState.inquiry.prelim.extensionHistory = [{ round: 1, role: "director", requestedDays: 30, reason: "รอเอกสาร", status: "PENDING" }];
assertTaskMatrix(workspace.caseDetailShellA5(extensionPendingState, "director", "current-task", null), "พิจารณาคำขอขยาย 213 ครั้งที่ 1", 3);
const closedState = structuredClone(approvedPlanState);
closedState.workflow = { stage: "closed", a5Status: "COMPLETED", complete: true };
assertTaskMatrix(workspace.caseDetailShellA5(closedState, "clerk", "current-task", null), "สำนวนเสร็จสิ้น", 8);
assert.doesNotMatch(workspace.caseDetailShellA5(closedState, "clerk", "current-task", null), /class="ws-actions a5-current-actions"/);
assert.equal(workspace.workflowActorNameA5({ workflow: { stage: "a5-prelim" }, assignment: { legalOwner: "เจ้าหน้าที่ 213" }, inquiry: { intake: { investigator: "เก่า" } } }, "investigator"), "พนักงาน ป.ป.ท. วิภา");
assert.equal(workspace.workflowActorNameA5({ workflow: { stage: "a5-inquiry" }, assignment: { legalOwner: "เจ้าหน้าที่ 213" }, inquiry: { intake: { investigator: "เจ้าหน้าที่ 213" }, inquiry644: { investigator: "เจ้าหน้าที่ 644" } } }, "investigator"), "พนักงาน ป.ป.ท. วิภา");

const extensionState = {
  caseData: { id: "A5-EXT-UI" }, workflow: { stage: "a5-prelim" },
  inquiry: workspace.createInquiry({ caseData: { id: "A5-EXT-UI" } }), decisionHistory: []
};
extensionState.inquiry.prelim.deadlineAt = "2026-12-31";
const noPendingApprovalState = structuredClone(extensionState);
const noPendingApprovalSnapshot = structuredClone(noPendingApprovalState);
assert.equal(workspace.applyExtension(noPendingApprovalState, "213", "ห้ามสร้างคำขอแทน", "director", 15).ok, false);
assert.deepEqual(noPendingApprovalState, noPendingApprovalSnapshot, "approval requires a real pending request and cannot mutate");
const noPendingDenyState = structuredClone(extensionState);
const noPendingDenySnapshot = structuredClone(noPendingDenyState);
assert.equal(workspace.denyExtension(noPendingDenyState, "213", "director", "ไม่มีคำขอ").ok, false);
assert.deepEqual(noPendingDenyState, noPendingDenySnapshot, "deny without pending cannot normalize or mutate caller");
assert.equal(workspace.requestExtension(extensionState, "213", "พยานเอกสารยังไม่ครบ", 60, "investigator").ok, true);
assert.equal(extensionState.inquiry.prelim.extensionHistory[0].status, "PENDING");
assert.doesNotMatch(workspace.extSectionHtml("213", extensionState.inquiry, "investigator"), /data-a5-action="approve-extension"/);
assert.match(workspace.extSectionHtml("213", extensionState.inquiry, "investigator"), /รอผู้อนุมัติพิจารณา/);
assert.match(workspace.extSectionHtml("213", extensionState.inquiry, "director"), /data-a5-action="approve-extension"/);
assert.equal(workspace.applyExtension(extensionState, "213", "อนุมัติตามงานคงเหลือ", "director", 15).ok, true);
assert.equal(extensionState.inquiry.prelim.extensionHistory[0].requestedDays, 60);
assert.equal(extensionState.inquiry.prelim.extensionHistory[0].approvedDays, 15);
assert.match(workspace.extSectionHtml("213", extensionState.inquiry, "investigator"), /ขอ 60 วัน[^<]+อนุมัติ 15 วัน/);
const requestVisibilityState = structuredClone(extensionState);
requestVisibilityState.inquiry.prelim.extensionHistory = [];
assert.match(workspace.extSectionHtml("213", requestVisibilityState.inquiry, "investigator"), /data-a5-action="request-extension"/);
assert.doesNotMatch(workspace.extSectionHtml("213", requestVisibilityState.inquiry, "clerk"), /data-a5-action="request-extension"/);
assert.match(workspace.extSectionHtml("213", requestVisibilityState.inquiry, "clerk"), /ผู้รับผิดชอบสำนวนเป็นผู้ยื่นคำขอขยาย/);

const deniedLifecycleState = structuredClone(requestVisibilityState);
assert.equal(workspace.requestExtension(deniedLifecycleState, "213", "รอพยาน", 30, "investigator").ok, true);
assert.equal(workspace.denyExtension(deniedLifecycleState, "213", "director", "เหตุผลไม่เพียงพอ").ok, true);
assert.equal(deniedLifecycleState.inquiry.prelim.extensionHistory[0].status, "DENIED");

const failingExtensionState = structuredClone(extensionState);
failingExtensionState.inquiry.prelim.extensionHistory = [];
failingExtensionState.inquiry.prelim.deadlineAt = new Date(Date.now() + (10 * 864e5)).toISOString().slice(0, 10);
const failingSnapshot = structuredClone(failingExtensionState);
assert.equal(workspace.requestExtension(failingExtensionState, "213", "ยื่นช้า", 60, "investigator").ok, false);
assert.deepEqual(failingExtensionState, failingSnapshot, "failed extension request must not normalize or mutate caller");
assert.equal(workspace.requestExtension(structuredClone(extensionState), "213", "ผิดบทบาท", 60, "clerk").ok, false);
const invalidApprovalState = structuredClone(extensionState);
invalidApprovalState.inquiry.prelim.extensionHistory[0].status = "PENDING";
delete invalidApprovalState.inquiry.prelim.extensionHistory[0].approvedDays;
assert.equal(workspace.applyExtension(invalidApprovalState, "213", "อนุมัติ 7 วัน", "director", 7).ok, true);
assert.equal(invalidApprovalState.inquiry.prelim.extensionHistory[0].approvedDays, 7);

const css = readFileSync(new URL("../assets/activity5-workspace.css", import.meta.url), "utf8");
const documentCss = readFileSync(new URL("../assets/activity5-document-workspace.css", import.meta.url), "utf8");
assert.match(css, /#a5App \.admin-queue-tabs/);
assert.match(css, /#a5App \.document-workspace/);
const reportWorkspaceRule = '#a5App .document-workspace:has(.ws-editor [data-a5-report-mode="edit"]) { grid-template-columns: minmax(0, 48%) minmax(0, 52%); }';
const genericCollapsedRule = '#a5App .document-workspace.pane-collapsed { grid-template-columns: minmax(0, 1fr) 44px; }';
const reportCollapsedRule = '#a5App .document-workspace.pane-collapsed:has(.ws-editor [data-a5-report-mode="edit"]) { grid-template-columns: minmax(0, 1fr) 44px; }';
assert.ok(documentCss.includes(reportWorkspaceRule));
assert.ok(documentCss.includes(genericCollapsedRule));
assert.ok(documentCss.includes(reportCollapsedRule));
assert.ok(documentCss.indexOf(reportCollapsedRule) > documentCss.indexOf(reportWorkspaceRule), "report collapse override must follow the normal 48/52 rule");
assert.doesNotMatch(documentCss, /minmax\((?:520|640)px/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto auto/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar > \.ws-doc-tabs\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar \.ws-doc-tab\s*\{[^}]*min-height:\s*44px/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar \.ws-doc-jump select\s*\{[^}]*min-height:\s*44px/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar > \.ws-button\s*\{[^}]*min-height:\s*44px/);
assert.match(documentCss, /#a5App \.ws-doc-toolbar > \.ws-doc-pane-toggle\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/);
assert.match(css, /#a5App \.ws-container > \.ws-actions[\s\S]+position:\s*fixed/);
assert.doesNotMatch(css, /#a5App \.ws-actions\s*\{[^}]*position:\s*static/);
assert.match(css, /#a5App \.a5-stagebar \.ws-stage-track\s*\{[^}]*padding:\s*1\.25rem 1rem 1\.35rem/);
assert.match(css, /#a5App \.ws-stagebar\.a5 \.ws-stage-node::after\s*\{[^}]*top:\s*21px/);
assert.match(css, /minmax\(0,\s*1fr\)/);
assert.match(css, /overflow-x:\s*clip/);
assert.match(css, /#a5App \.a5-inbound-all\s*\{[\s\S]*?min-width:\s*0/);
assert.match(css, /#a5App \.a5-inbound-all-item\s*\{[\s\S]*?overflow:\s*hidden/);
assert.match(css, /--a5-action-clearance:\s*5\.5rem/);
assert.match(css, /#a5App \.a5-selected-team\s*\{[\s\S]*?position:\s*sticky[\s\S]*?bottom:\s*calc\(var\(--a5-action-clearance\) \+ env\(safe-area-inset-bottom, 0px\)\)/);
assert.match(css, /#a5App \.a5-assignment-board\s*\{[\s\S]*?padding-bottom:\s*calc\(var\(--a5-action-clearance\)/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?--a5-action-clearance:\s*8\.5rem/);
assert.match(css, /#a5App \.a5-team-choices label\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(css, /@media\s*\(max-width:\s*1180px\)[\s\S]+\.a5-decision-row/);
assert.match(css, /#a5App \.a5-assignment-board\s*\{[\s\S]*?container-type:\s*inline-size/);
assert.match(css, /#a5App \.a5-master-row\s*\{[\s\S]*?height:\s*80px/);
assert.match(css, /#a5App \.a5-master-detail-shell\s*\{[\s\S]*?border-radius:\s*14px[\s\S]*?box-shadow:/);
assert.match(css, /#a5App \.a5-master-row\.is-focused\s*\{[\s\S]*?border-left-color:\s*#b08a3e[\s\S]*?background:\s*#eef4f8/);
assert.match(css, /#a5App \.a5-master-rank strong\s*\{[\s\S]*?border-radius:\s*50%/);
assert.match(css, /#a5App \.a5-role-segment\s*\{[\s\S]*?border-radius:\s*999px/);
assert.match(css, /#a5App \.a5-candidate-detail\s*\{[\s\S]*?border-radius:\s*10px/);
assert.match(css, /#a5App \.a5-selected-team\.a5-assignment-command\s*\{[\s\S]*?border-radius:\s*14px[\s\S]*?backdrop-filter:\s*blur\(12px\)/);
assert.match(css, /#a5App \.a5-role-segment button\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(css, /@container a5-assignment \(max-width:\s*580px\)[\s\S]*?#a5App \.a5-master-row/);
assert.match(css, /@container a5-assignment \(max-width:\s*460px\)[\s\S]*?height:\s*88px/);
assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
assert.doesNotMatch(css, /\.a5-detail-shell|\.a5-case-context|\.a5-document-dialog|--a5-(?:ink|navy|blue|surface)/);
for (const width of [1180, 720, 390, 320]) assert.match(css, new RegExp(`max-width:\\s*${width}px`));
assert.match(css, /@media\s*\(max-width:\s*1200px\)[\s\S]+#a5App \.a5-stage-compact[\s\S]+#a5App \.a5-stagebar\.is-expanded #a5StageFull/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-actions:has\(\.ws-button:only-child\)[\s\S]+width:\s*100%/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-topbar-inner[\s\S]+#a5App \.ws-case-head/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-topbar-inner\s*\{[\s\S]+display:\s*grid[\s\S]+grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-search\s*\{[\s\S]+grid-column:\s*1\s*\/\s*-1/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-profile\s*\{[\s\S]+grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.ws-font-controls button[\s\S]+min-height:\s*44px/);
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]+#a5App \.a5-stage-toggle[\s\S]+min-height:\s*44px/);

const staffHtml = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");
assert.ok(staffHtml.indexOf("assets/ecmis-workspace.css") < staffHtml.indexOf("assets/activity5-workspace.css"));
const activity4Source = readFileSync(new URL("../assets/activity4-workspace.js", import.meta.url), "utf8");
assert.match(activity4Source, /function buildA4DemoStartCases\(\)/);
assert.match(activity4Source, /CASES\.push\(\.\.\.buildA4DemoStartCases\(\)\)/);
assert.match(activity4Source, /const isA5Route=params\.get\('view'\)==='a5'/);
assert.match(activity4Source, /let selectedId=isA5Route\?null:params\.get\('case'\)\|\|null/);
assert.match(activity4Source, /if\(!isA5Route\)syncUrl\(\);renderList\(\);if\(selectedId\)renderDetail\(\)/);

assert.equal(workspace.nextA5TabIndex(0, 5, "ArrowRight"), 1);
assert.equal(workspace.nextA5TabIndex(4, 5, "ArrowRight"), 0);
assert.equal(workspace.nextA5TabIndex(0, 5, "ArrowLeft"), 4);
assert.equal(workspace.nextA5TabIndex(2, 5, "Home"), 0);
assert.equal(workspace.nextA5TabIndex(2, 5, "End"), 4);
assert.equal(workspace.nextA5TabIndex(2, 5, "Enter"), 2);

assert.deepEqual(workspace.clampA5FloatingPosition(1100, 700, 320, 480, 260, 80), { x: 52, y: 392 });
assert.deepEqual(workspace.clampA5FloatingPosition(-30, -10, 1366, 768, 500, 70), { x: 8, y: 8 });
const initialStagePresentation = Object.freeze({ compact: false, expanded: true, userSelected: false });
const compactStagePresentation = workspace.nextA5StagePresentation(initialStagePresentation, { type: "viewport", compact: true });
assert.deepEqual(compactStagePresentation, { compact: true, expanded: false, userSelected: false });
assert.deepEqual(initialStagePresentation, { compact: false, expanded: true, userSelected: false }, "stage presentation reducer cannot mutate caller");
const expandedStagePresentation = workspace.nextA5StagePresentation(compactStagePresentation, { type: "toggle" });
assert.deepEqual(expandedStagePresentation, { compact: true, expanded: true, userSelected: true });
assert.deepEqual(workspace.nextA5StagePresentation(expandedStagePresentation, { type: "toggle" }), { compact: true, expanded: false, userSelected: true });
assert.deepEqual(workspace.nextA5StagePresentation(initialStagePresentation, { type: "viewport", compact: false }), { compact: false, expanded: true, userSelected: false });
const source = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");
assert.match(source, /function syncA5CaseRoute\(caseId\)/);
assert.match(source, /function showA5\(caseId\) \{[\s\S]*?syncA5CaseRoute\(caseId\)/);
assert.match(source, /\$\('#a5BackList'\)\.onclick = \(\) => \{[\s\S]*?showA5\(null\)/);
assert.match(source, /requestAnimationFrame\(\(\) => document\.getElementById\(nextId\)\?\.focus\(\)\)/);
assert.match(source, /window\.addEventListener\('resize', clampPosition\)/);
assert.match(source, /matchMedia\('\(max-width: 767px\)'\)/);
assert.match(source, /matchMedia\('\(max-width: 1200px\)'\)/);
assert.match(source, /stagebar\.classList\.toggle\('is-expanded', expanded\)/);
assert.match(source, /toggle\.setAttribute\('aria-expanded', String\(expanded\)\)/);
assert.match(source, /full\.hidden = !expanded/);
const workspaceCss = readFileSync(new URL("../assets/activity5-workspace.css", import.meta.url), "utf8");
assert.match(workspaceCss, /\.a5-process-steps\s*\{[\s\S]*?overflow-x:\s*auto/);
assert.match(workspaceCss, /@media \(max-width:\s*640px\)[\s\S]*?\.a5-process-actions \.ws-button\s*\{\s*width:\s*100%/);
assert.match(workspaceCss, /\.a5-size-modal-grid\s*\{\s*grid-template-columns:\s*1fr/);

console.log("PASS activity5-ui-contract.test.mjs: A4-parity task workspace, persistent documents and scoped responsive shell");
