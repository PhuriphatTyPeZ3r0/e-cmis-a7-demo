import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";

const require = createRequire(import.meta.url);
const report = require("../assets/activity5-report-213.js");
const workflow = require("../assets/activity5-workflow.js");

function source(overrides = {}) {
  return {
    caseData: { id: "ECMIS-213-001", caseNumber: "1/2569", subject: "ตรวจสอบการจัดซื้อ", complainant: "นาย ก", channel: "หนังสือ", received: "2026-08-01" },
    workflow: { stage: "a5-prelim" },
    assignment: { assignmentVersion: 3, primaryOfficerId: "officer-1", primaryOfficerName: "พนักงาน ป.ป.ท. สมชาย", primaryOfficerPosition: "พนักงาน ป.ป.ท." },
    staffDirectory: [
      { officerId: "officer-1", officerName: "พนักงาน ป.ป.ท. สมชาย", positionName: "พนักงาน ป.ป.ท.", unitName: "กองบริหารคดี", status: "ACTIVE" },
      { officerId: "officer-2", officerName: "พนักงาน ป.ป.ท. คนใหม่", positionName: "พนักงาน ป.ป.ท.", unitName: "กองบริหารคดี", status: "ACTIVE" }
    ],
    inquiry: { intake: { receivedFirstAt: "2026-08-01", unit: "กองบริหารคดี", investigator: "พนักงาน ป.ป.ท. สมชาย" }, prelim: { report: "บันทึกสรุปเดิม", deadlineAt: "2026-09-30" } },
    ...overrides
  };
}

function reviewLifecycleState(steps) {
  const fixture = source({ caseData: { ...source().caseData, id: "CASE-213-CHAIN" } });
  fixture.inquiry.intake.investigator = fixture.assignment.primaryOfficerId;
  const state = report.normalizeReport213A5(fixture).state;
  const record = state.a5DocumentStore.records.find(item => item.documentId === report.FORM_ID);
  record.status = "SUBMITTED";
  record.submittedSnapshot = { documentId: report.FORM_ID, caseId: state.caseData.id, revisionNo: 1, payload: structuredClone(record.payload) };
  state.a5Report213Lifecycle = {
    status: "REPORT_213_REVIEW_PENDING",
    submissions: [{ packageId: "package-1", report: { documentId: report.FORM_ID, revisionNo: 1, snapshot: { revisionNo: 1 } } }],
    reviewChain: steps, reviewOpinions: [], signatures: [], signedVersions: [], routeHistory: [], supplementalDocuments: [],
    supportCommitteeOpinions: [], screeningOpinions: [], chairDecisions: [], auditHistory: [], boardCovers: [],
    boardPackages: [], dispatches: [], receipts: [], results: [], commandReceipts: []
  };
  state.workflow = { downstreamStatus: "REPORT_213_REVIEW_PENDING" };
  return state;
}

function reviewStep(sequence, stepType, roleCode, roleLabel, status) {
  return { stepId: `step-${sequence}`, sequence, stepType, roleCode, roleLabel, actorId: "", actorName: "", authorityRef: {}, status, opinionId: "", completedAt: "" };
}

function reviewCommand(state, id, authority = {}) {
  return { caseId: state.caseData.id, expectedVersion: state.a5DocumentStore.version, at: `2026-08-20T10:${String(id).padStart(2, "0")}:00.000Z`, idempotencyKey: `command-${id}`, authorityRef: { status: "CONFIRMED", referenceNo: `คำสั่ง-${id}`, ...authority } };
}

function resultReadyState(overrides = {}) {
  const state = reviewLifecycleState([]);
  state.a5Report213Lifecycle.status = "REPORT_213_WAIT_RESULT";
  state.a5Report213Lifecycle.boardPackages = [{ packageId: "board-package-1", submissionPackageId: "package-1" }];
  state.workflow.downstreamStatus = "REPORT_213_WAIT_RESULT";
  Object.assign(state, overrides);
  return state;
}

test("normalization imports legacy report once into opinion summary note and keeps all 18 sections", () => {
  const first = report.normalizeReport213A5(source());
  const record = first.state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  assert.equal(first.ok, true);
  assert.equal(Object.keys(record.payload).length, 18);
  assert.equal(record.payload.opinion.summaryNote, "บันทึกสรุปเดิม");
  assert.equal(first.state.inquiry.prelim.report, "บันทึกสรุปเดิม");
  assert.deepEqual(report.normalizeReport213A5(first.state).state, first.state);
});

test("legacy summary alone never completes or validates Form 4", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload;
  const result = report.validateReport213A5(payload, { intent: "SUBMISSION" });
  assert.equal(result.ok, false);
  assert.notEqual(result.completion.opinion, "COMPLETE");
  assert.ok(result.errors.some(error => error.field === "complainants"));
});

test("date validation tells the user to use the calendar instead of exposing storage format", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === report.FORM_ID).payload);
  payload.documentMeta.preparedAt = "วันที่ผิด";
  const result = report.validateReport213A5(payload);
  const error = result.errors.find(item => item.field === "documentMeta.preparedAt");

  assert.equal(error.message, "กรุณาเลือกวันที่จากปฏิทิน");
  assert.doesNotMatch(error.message, /YYYY-MM-DD/);
});

test("paper renders canonical repeated rows in order and six pages without internal IDs", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.complainants = [{ rowId: "person-b", order: 2, personType: "PERSON", name: "นาง ข", address: "", contact: "", capacity: "" }, { rowId: "person-a", order: 1, personType: "PERSON", name: "นาย ก", address: "", contact: "", capacity: "" }];
  payload.accusedPersons = [{ rowId: "accused-a", order: 1, name: "นาย ค", position: "ผอ.", agency: "หน่วยงาน", statusAtEvent: "", relatedAllegationRowIds: [] }];
  payload.allegations = [{ rowId: "allegation-a", order: 1, summary: "จัดซื้อ", eventDateFrom: "", eventDateTo: "", place: "", accusedRowIds: ["accused-a"] }];
  payload.evidence = [{ rowId: "evidence-a", order: 1, category: "เอกสาร", title: "สัญญา", factSupported: "ข้อเท็จจริง", custodyNote: "", documentVersionId: "doc:1", availability: "AVAILABLE" }];
  const html = report.renderReport213PaperA5(payload);
  assert.equal((html.match(/class="a5-paper-page"/g) || []).length, 6);
  assert.ok(html.indexOf("นาย ก") < html.indexOf("นาง ข"));
  assert.doesNotMatch(html, /person-a|officer-1|doc:1/);
});

test("proposal requires selected branch reason legal basis and its exact detail keys", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.proposal = { branchKey: "FORM4_14_1_01", reason: "", legalBasisRowIds: [], branchDetails: {} };
  let result = report.validateReport213A5(payload, { intent: "SUBMISSION" });
  assert.ok(result.errors.some(error => error.field === "proposal.reason"));
  payload.proposal = { branchKey: "FORM4_14_1_01", reason: "มีเหตุ", legalBasisRowIds: ["law-1"], branchDetails: { "เหตุความสำคัญหรือความซับซ้อน": "รายละเอียด" } };
  payload.legalBasis.lawRows = [{ rowId: "law-1", order: 1, lawName: "กฎหมาย", section: "24", applicationReason: "ใช้บังคับ" }];
  result = report.validateReport213A5(payload, { intent: "SUBMISSION" });
  assert.ok(!result.errors.some(error => error.field.startsWith("proposal")));
});

test("only the responsible investigator can save and derived identity cannot be overwritten", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  const command = { caseId: state.caseData.id, expectedVersion: state.a5DocumentStore.version, actorId: "other", at: "2026-08-15T10:00:00.000Z", idempotencyKey: "forbidden", payload };
  assert.equal(report.saveReport213DraftA5(state, command).code, "FORBIDDEN_ACTOR");
  payload.documentMeta.responsibleOfficer.displayName = "ปลอม";
  const guarded = report.saveReport213DraftA5(state, { ...command, actorId: "officer-1", idempotencyKey: "readonly" });
  assert.equal(guarded.code, "READ_ONLY_FIELD");
  assert.deepEqual(guarded.state, state);
});

test("clean authored projection saves while current derived fields are rebuilt", () => {
  const state = report.normalizeReport213A5(source()).state;
  const record = state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  const payload = structuredClone(record.payload);
  payload.documentMeta = { preparedAt: "2026-08-15" };
  delete payload.receipt.caseType;
  delete payload.receipt.paccReceivedAt;
  delete payload.receipt.preliminaryDueAt;
  const result = report.saveReport213DraftA5(state, {
    caseId: state.caseData.id,
    expectedVersion: state.a5DocumentStore.version,
    actorId: "officer-1",
    at: "2026-08-15T10:00:00.000Z",
    idempotencyKey: "clean-projection",
    payload
  });
  assert.equal(result.ok, true);
  const saved = result.state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  assert.equal(saved.payload.documentMeta.caseNumber, "1/2569");
  assert.equal(saved.payload.receipt.paccReceivedAt, "2026-08-01");
});

test("draft save stores incomplete legal references without content validation", () => {
  const state = report.normalizeReport213A5(source()).state;
  const record = state.a5DocumentStore.records.find(item => item.documentId === report.FORM_ID);
  const payload = structuredClone(record.payload);
  payload.limitation.offenceRows = [{
    rowId: "limitation-1",
    order: 1,
    accusedRowId: "ยังไม่เลือกผู้ถูกกล่าวหา",
    legalBasisRowId: "มาตราที่ยังกรอกไม่เสร็จ",
    startAt: "",
    expiresAt: "",
    source: "",
    note: ""
  }];

  const saved = report.saveReport213DraftA5(state, {
    caseId: state.caseData.id,
    expectedVersion: state.a5DocumentStore.version,
    actorId: "officer-1",
    at: "2026-08-21T10:00:00.000Z",
    idempotencyKey: "save-incomplete-law-draft",
    payload
  });

  assert.equal(saved.ok, true);
  const savedRecord = saved.state.a5DocumentStore.records.find(item => item.documentId === report.FORM_ID);
  assert.equal(savedRecord.payload.limitation.offenceRows[0].legalBasisRowId, "มาตราที่ยังกรอกไม่เสร็จ");
  assert.equal(report.validateReport213A5(savedRecord.payload, { intent: "SUBMISSION" }).ok, false);
});

test("mock submission builds from an incomplete report without content reference or evidence validation", () => {
  const state = report.normalizeReport213A5(source()).state;
  const record = state.a5DocumentStore.records.find(item => item.documentId === report.FORM_ID);
  record.payload.documentMeta.preparedAt = "วันที่ผิด";
  record.payload.documentMeta.sourceLinks = {};
  record.payload.factFindings.worklogEntryIds = [];
  record.payload.evidence = [{ rowId: "evidence-1", order: 1, documentVersionId: "missing-version" }];

  const result = report.buildReport213SubmissionA5(state, {
    caseId: state.caseData.id,
    revisionNo: record.revisionNo
  });

  assert.equal(result.ok, true);
  assert.equal(result.code, "REPORT_213_SUBMISSION_CANDIDATE_BUILT");
  assert.deepEqual(result.submissionCandidate.plan, { documentId: "FORM_1_CASE_PLAN", revisionNo: 0 });
  assert.deepEqual(result.submissionCandidate.worklog.includedEntryIds, []);
  assert.deepEqual(result.submissionCandidate.evidenceVersionIds, ["missing-version"]);
});

test("row commands preserve stable identity through reorder and delete and create nested IDs", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.complainants = [
    { rowId: "person-a", order: 1, personType: "PERSON", name: "ก", address: "", contact: "", capacity: "" },
    { rowId: "person-b", order: 2, personType: "PERSON", name: "ข", address: "", contact: "", capacity: "" }
  ];
  const moved = report.mutateReport213RowsA5(payload, { path: "complainants", action: "move", rowId: "person-b", direction: -1 });
  assert.deepEqual(moved.complainants.map(row => [row.rowId, row.order]), [["person-b", 1], ["person-a", 2]]);
  const removed = report.mutateReport213RowsA5(moved, { path: "complainants", action: "delete", rowId: "person-a" });
  assert.deepEqual(removed.complainants.map(row => row.rowId), ["person-b"]);
  const added = report.mutateReport213RowsA5(removed, { path: "legalBasis.lawRows", action: "add" });
  assert.match(added.legalBasis.lawRows[0].rowId, /^law-/);
  assert.equal(added.legalBasis.lawRows[0].order, 1);
});

test("legacy document upgrade preserves the original string byte-for-byte", () => {
  const state = report.normalizeReport213A5(source()).state;
  const record = state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  record.payload = { legacyReportText: "  ข้อความเดิม\n" };
  const normalized = report.normalizeReport213A5(state).state;
  const upgraded = normalized.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  assert.equal(upgraded.payload.opinion.summaryNote, "  ข้อความเดิม\n");
});

test("normalization refreshes exact Task 2 revisions and worklog cutoff before save", () => {
  const state = report.normalizeReport213A5(source()).state;
  state.a5DocumentStore.records.push(
    { documentId: "FORM_1_CASE_PLAN", caseId: state.caseData.id, revisionNo: 2, status: "DRAFT", payload: {} },
    { documentId: "ACTIVITY5_DAILY_WORKLOG", caseId: state.caseData.id, revisionNo: 4, status: "DRAFT", payload: { entries: [{ entryId: "entry-b", order: 2 }, { entryId: "entry-a", order: 1 }] } }
  );
  const normalized = report.normalizeReport213A5(state).state;
  const record = normalized.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  assert.deepEqual(record.payload.documentMeta.sourceLinks.plan, { documentId: "FORM_1_CASE_PLAN", revisionNo: 2 });
  assert.deepEqual(record.payload.documentMeta.sourceLinks.worklog, { documentId: "ACTIVITY5_DAILY_WORKLOG", revisionNo: 4, cutoffEntryId: "entry-b" });
  assert.deepEqual(record.payload.factFindings.worklogEntryIds, ["entry-a", "entry-b"]);
  const saved = report.saveReport213DraftA5(normalized, { caseId: normalized.caseData.id, expectedVersion: normalized.a5DocumentStore.version, actorId: "officer-1", at: "2026-08-15T10:00:00.000Z", idempotencyKey: "task2-refresh", payload: structuredClone(record.payload) });
  assert.equal(saved.ok, true);
});

test("evidence version and availability are resolved from the repository and cannot be spoofed", () => {
  const state = report.normalizeReport213A5({ ...source(), a5EvidenceRepository: [{ versionId: "evidence-v3", availability: "AVAILABLE", name: "สัญญาฉบับ 3" }] }).state;
  let record = state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  record.payload.evidence = [{ rowId: "evidence-a", order: 1, category: "เอกสาร", title: "สัญญา", factSupported: "ข้อเท็จจริง", custodyNote: "เก็บในสำนวน", documentVersionId: "evidence-v3", availability: "AVAILABLE" }];
  const current = report.normalizeReport213A5(state).state;
  record = current.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  const spoof = structuredClone(record.payload);
  spoof.evidence[0].availability = "REFERENCE_ONLY";
  const rejected = report.saveReport213DraftA5(current, { caseId: current.caseData.id, expectedVersion: current.a5DocumentStore.version, actorId: "officer-1", at: "2026-08-15T10:00:00.000Z", idempotencyKey: "evidence-spoof", payload: spoof });
  assert.equal(rejected.code, "READ_ONLY_FIELD");
  const unresolved = structuredClone(record.payload);
  unresolved.evidence.push({ rowId: "evidence-b", order: 2, category: "เอกสาร", title: "เอกสารปลอม", factSupported: "ข้อเท็จจริง", custodyNote: "", documentVersionId: "made-up", availability: "AVAILABLE" });
  const saved = report.saveReport213DraftA5(current, { caseId: current.caseData.id, expectedVersion: current.a5DocumentStore.version, actorId: "officer-1", at: "2026-08-15T10:00:00.000Z", idempotencyKey: "evidence-resolve", payload: unresolved });
  assert.equal(saved.ok, true);
  const savedRecord = saved.state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213");
  assert.equal(savedRecord.payload.evidence.find(row => row.rowId === "evidence-b").availability, "MISSING");
});

test("all nested repeated groups validate stable identity order and references", () => {
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.complainants = [{ rowId: "complainant-a", order: 1, personType: "PERSON", name: "", address: "", contact: "", capacity: "" }];
  payload.accusedPersons = [{ rowId: "accused-a", order: 1, name: "นาย ก", position: "ผอ.", agency: "หน่วยงาน", statusAtEvent: "", relatedAllegationRowIds: [] }];
  payload.legalBasis.lawRows = [{ rowId: "law-a", order: 1, lawName: "กฎหมาย", section: "1", applicationReason: "ใช้บังคับ" }];
  payload.limitation.offenceRows = [
    { rowId: "limit-a", order: 1, accusedRowId: "accused-a", legalBasisRowId: "law-a", startAt: "2026-01-01", expiresAt: "2036-01-01", source: "เอกสาร", note: "" },
    { rowId: "limit-a", order: 2, accusedRowId: "missing", legalBasisRowId: "law-a", startAt: "2026-01-01", expiresAt: "2036-01-01", source: "เอกสาร", note: "" }
  ];
  payload.analysis.allegationAnalyses = [{ rowId: "analysis-a", order: 2, allegationRowId: "missing", accusedRowId: "accused-a", factAnalysis: "", evidenceRowIds: [], legalBasisRowIds: ["law-a"], conclusion: "" }];
  const result = report.validateReport213A5(payload);
  assert.ok(result.errors.some(error => error.field === "limitation.offenceRows"));
  assert.ok(result.errors.some(error => error.field === "limitation.offenceRows.1"));
  assert.ok(result.errors.some(error => error.field === "analysis.allegationAnalyses"));
  assert.ok(result.errors.some(error => error.field === "analysis.allegationAnalyses.0"));
  assert.notEqual(result.completion.complainants, "COMPLETE");
});

test("proposal manifest exposes 18 canonical keys and keeps unconfirmed source branches pending", () => {
  assert.equal(report.BRANCHES.length, 18);
  assert.deepEqual(report.BRANCHES.map(item => item.branchKey), Array.from({ length: 18 }, (_, index) => `FORM4_14_1_${String(index + 1).padStart(2, "0")}`));
  const state = report.normalizeReport213A5(source()).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.proposal.branchKey = "FORM4_14_1_18";
  const result = report.validateReport213A5(payload);
  assert.ok(result.errors.some(error => error.field === "proposal.branchKey" && /รอยืนยัน/.test(error.message)));
});

test("Thai paper translates enum and false boolean semantics without leaking internal keys", () => {
  const state = report.normalizeReport213A5(source({ caseData: { ...source().caseData, decision: "62" } })).state;
  const payload = structuredClone(state.a5DocumentStore.records.find(item => item.documentId === "FORM_4_REPORT_213").payload);
  payload.complainants = [{ rowId: "person-a", order: 1, personType: "PERSON", name: "นาย ก", address: "กรุงเทพฯ", contact: "", capacity: "" }];
  payload.evidence = [{ rowId: "evidence-a", order: 1, category: "เอกสาร", title: "สัญญา", factSupported: "ข้อเท็จจริง", custodyNote: "", documentVersionId: "secret-version", availability: "AVAILABLE" }];
  payload.witnessProtection = { requested: false, persons: [], summary: "ไม่มีเหตุจำเป็น" };
  const html = report.renderReport213PaperA5(payload);
  assert.match(html, /คดีรับจากสำนักงาน ป\.ป\.ช\. มาตรา ๖๒/);
  assert.match(html, /บันทึกข้อความ/);
  assert.match(html, /สัญญา/);
  assert.match(html, /ไม่มีการใช้มาตรการคุ้มครองพยานเบื้องต้น/);
  assert.doesNotMatch(html, /NACC_SECTION_62|PERSON|AVAILABLE|documentVersionId|secret-version|sourceLinks/);
});

test("review chain separates director executive and secretary and projects signatures to Form 4", () => {
  let state = reviewLifecycleState([
    reviewStep(1, "UNIT_DIRECTOR", "director", "ผอ.หน่วยงาน", "CURRENT"),
    reviewStep(2, "SUPERVISING_EXECUTIVE", "executive", "ผู้ช่วย/รองเลขาธิการตามสายกำกับ", "PENDING"),
    reviewStep(3, "SECRETARY_GENERAL", "secretary", "เลขาธิการ ป.ป.ท.", "PENDING")
  ]);
  const wrong = report.executeReport213Action(state, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-review-record-opinion", { ...reviewCommand(state, 1, { roleCode: "secretary" }), opinionId: "wrong", opinionText: "เห็นชอบ", signature: { methodLabel: "Digital Signature" } });
  assert.equal(wrong.code, "FORBIDDEN_ACTOR");
  assert.deepEqual(wrong.state, state);
  let result = report.executeReport213Action(state, { id: "director-1", name: "ผอ.หน่วยงาน", role: "director" }, "report-213-review-record-opinion", { ...reviewCommand(state, 2, { roleCode: "director" }), opinionId: "opinion-director", opinionText: "เห็นชอบ", positionName: "ผอ.หน่วยงาน", signature: { methodLabel: "Digital Signature" } });
  assert.equal(result.ok, true);
  state = result.state;
  result = report.executeReport213Action(state, { id: "executive-1", name: "รองเลขาธิการ", role: "executive" }, "report-213-review-record-opinion", { ...reviewCommand(state, 3, { roleCode: "executive" }), opinionId: "opinion-executive", opinionText: "เห็นชอบตามสายกำกับ", positionName: "รองเลขาธิการ ป.ป.ท.", signature: { methodLabel: "Digital Signature" } });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_FINAL_SIGNATURE_PENDING");
  state = result.state;
  result = report.executeReport213Action(state, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-sign", { ...reviewCommand(state, 4, { roleCode: "secretary" }), opinionText: "เห็นควรเสนอคณะกรรมการ", positionName: "เลขาธิการ ป.ป.ท.", methodLabel: "Digital Signature" });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_SIGNED_AWAITING_ROUTE");
  assert.equal(result.state.a5Report213Lifecycle.signedVersions.at(-1).signatureType, "SECRETARY_GENERAL");
  const paper = report.renderReport213PaperA5(result.state.a5DocumentStore.records[0].payload);
  assert.match(paper, /รองเลขาธิการ ป\.ป\.ท\./);
  assert.match(paper, /เห็นควรเสนอคณะกรรมการ/);
  assert.match(paper, /เลขาธิการ ป\.ป\.ท\./);
});

test("a visible final-signature action signs in the mock without authority metadata", () => {
  const state = reviewLifecycleState([reviewStep(1, "SECRETARY_GENERAL", "secretary", "เลขาธิการ ป.ป.ท.", "CURRENT")]);
  state.a5Report213Lifecycle.status = "REPORT_213_FINAL_SIGNATURE_PENDING";
  const command = reviewCommand(state, 5);
  delete command.authorityRef;
  const allowed = report.executeReport213Action(state, { id: "executive-1", name: "รองเลขาธิการ", role: "executive" }, "report-213-sign", { ...command, opinionText: "เห็นชอบ", methodLabel: "Digital Signature" });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.signature.signerRole, "ผู้ปฏิบัติหน้าที่แทนเลขาธิการ ป.ป.ท.");
});

test("normal route lets GBK send to the board and returns result work to the case clerk", () => {
  const signed = reviewLifecycleState([]);
  signed.a5Report213Lifecycle.status = "REPORT_213_SIGNED_AWAITING_ROUTE";
  signed.a5Report213Lifecycle.signatures.push({ signatureType: "SECRETARY_GENERAL", submissionPackageId: "package-1", signedBy: "sg-1" });
  let result = report.executeReport213Action(signed, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-route-select", { ...reviewCommand(signed, 7, { roleCode: "secretary" }), route: "NORMAL", reason: "สำนวนทั่วไป" });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_GBK_PENDING");
  let state = result.state;
  assert.deepEqual(report.getReport213ActionModelA5(state, "clerk").map(action => action.label), ["ส่งมติบอร์ด"]);
  result = report.executeReport213Action(state, { id: "gbk-1", name: "ธุรการ กบค.", role: "clerk" }, "report-213-gbk-receive", { ...reviewCommand(state, 8, { roleCode: "clerk" }), receivedAt: "2026-08-20", receiptReference: "กบค-1" });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_WAIT_RESULT");
  assert.equal(result.state.a5Report213Lifecycle.boardPackages.length, 1);
  assert.equal(result.state.workflow.owner, "case-clerk");
  assert.deepEqual(workflow.getA5AvailableActions(result.state, "case-clerk").map(action => action.id), ["report-213-record-result"]);
  const urgent = structuredClone(signed);
  result = report.executeReport213Action(urgent, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-route-select", { ...reviewCommand(urgent, 10, { roleCode: "secretary" }), route: "URGENT", reason: "ใกล้ขาดอายุความ" });
  state = result.state;
  result = report.executeReport213Action(state, { id: "clerk-1", name: "ธุรการ", role: "clerk" }, "report-213-urgent-letter-attach", { ...reviewCommand(state, 11, { roleCode: "clerk" }), documentVersionId: "urgent:v1", referenceNo: "ด่วน-1", reason: "ใกล้ขาดอายุความ" });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_CHAIR_AGENDA_PENDING");
  assert.equal(result.state.a5Report213Lifecycle.supplementalDocuments[0].documentType, "URGENT_AGENDA_REQUEST");
  const support = structuredClone(signed);
  result = report.executeReport213Action(support, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-route-select", { ...reviewCommand(support, 12, { roleCode: "secretary" }), route: "SUPPORT_COMMITTEE", committeeId: "SUPPORT_2", reason: "ยุ่งยากซับซ้อน" });
  state = result.state;
  result = report.executeReport213Action(state, { id: "support-1", name: "อนุกรรมการสนับสนุน", role: "committee" }, "report-213-support-record-opinion", { ...reviewCommand(state, 13, { roleCode: "committee", committeeId: "SUPPORT_2" }), opinionText: "เห็นสอดคล้อง", documentVersionId: "support:v1", signature: { methodLabel: "Digital Signature" } });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_SUPPORT_SECRETARY_CONFIRM_PENDING");
  state = result.state;
  const supportSignCommand = reviewCommand(state, 16);
  delete supportSignCommand.authorityRef;
  result = report.executeReport213Action(state, { id: "sg-1", name: "เลขาธิการ", role: "secretary" }, "report-213-secretary-confirm-support", { ...supportSignCommand, opinionText: "ยืนยันความเห็น", positionName: "เลขาธิการ ป.ป.ท.", methodLabel: "Digital Signature" });
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_CHAIR_AGENDA_PENDING");
});

test("legacy normal-route screening state migrates to board result work without restarting", () => {
  const state = reviewLifecycleState([]);
  state.a5Report213Lifecycle.status = "REPORT_213_SCREENING_PENDING";
  state.a5Report213Lifecycle.route = "NORMAL";

  const normalized = report.normalizeReport213A5(state).state;

  assert.equal(normalized.a5Report213Lifecycle.status, "REPORT_213_WAIT_RESULT");
  assert.equal(normalized.a5Report213Lifecycle.boardPackages.length, 1);
  assert.equal(normalized.workflow.owner, "case-clerk");
});

test("canonical review owner blocks legacy action fallback and return grants no extra days", () => {
  const state = reviewLifecycleState([
    reviewStep(1, "UNIT_DIRECTOR", "director", "ผอ.หน่วยงาน", "COMPLETED"),
    reviewStep(2, "SUPERVISING_EXECUTIVE", "executive", "ผู้ช่วย/รองเลขาธิการตามสายกำกับ", "CURRENT"),
    reviewStep(3, "SECRETARY_GENERAL", "secretary", "เลขาธิการ ป.ป.ท.", "PENDING")
  ]);
  assert.deepEqual(workflow.getA5AvailableActions(state, "director"), []);
  assert.deepEqual(workflow.getA5AvailableActions(state, "executive").map(action => action.id), ["report-213-review-record-opinion", "report-213-review-return"]);
  const returnedState = reviewLifecycleState([reviewStep(1, "UNIT_DIRECTOR", "director", "ผอ.หน่วยงาน", "CURRENT")]);
  const returned = report.executeReport213Action(returnedState, { id: "director-1", name: "ผอ.หน่วยงาน", role: "director" }, "report-213-review-return", { ...reviewCommand(returnedState, 14, { roleCode: "director" }), reason: "พยานหลักฐานไม่ครบ", affectedFields: ["evidence"] });
  assert.equal(returned.ok, true);
  assert.equal(returned.state.inquiry.prelim.deadlineAt, "2026-09-30");
  assert.equal(returned.state.inquiry.prelim.additionalDeadlineAt, undefined);
});

test("canonical 213 resolution stores the signed resolution and creates every ordered downstream task", () => {
  const state = workflow.normalizeA5State(resultReadyState());
  assert.deepEqual(workflow.getA5AvailableActions(state, "case-clerk").map(action => action.id), ["report-213-record-result"]);
  assert.deepEqual(workflow.getA5AvailableActions(state, "committee"), []);
  const legacyBoardEntry = workflow.executeA5Action(state, "committee", "report-213-record-result", {
    ...reviewCommand(state, 19, { roleCode: "committee" }),
    actorId: "board-recorder-1",
    actorName: "เจ้าหน้าที่กิจกรรมที่ 7"
  });
  assert.equal(legacyBoardEntry.code, "ACTOR_MISMATCH");

  const uncertified = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 20, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    decisionCode: "NOT_ACCEPT",
    resolutionReference: "มติ 45/2569",
    resolutionDocumentVersionId: "board-resolution:v3",
    resolutionText: "ไม่รับไว้ไต่สวนและให้ส่งเรื่องตามมติ",
    decidedAt: "2026-08-20",
    resolutionItems: [
      { code: "SEND_NACC", instructionText: "ส่งสำนวนให้สำนักงาน ป.ป.ช." },
      { code: "SEND_DISCIPLINE_AGENCY", instructionText: "ส่งมติให้หน่วยงานต้นสังกัด" }
    ]
  });
  assert.equal(uncertified.code, "MANUAL_SOURCE_CONFIRMATION_REQUIRED");
  assert.deepEqual(uncertified.state, state);

  const result = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 21, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    actorRoleCode: "clerk",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "NOT_ACCEPT",
    resolutionReference: "มติ 45/2569",
    resolutionDocumentVersionId: "board-resolution:v3",
    resolutionText: "ไม่รับไว้ไต่สวนและให้ส่งเรื่องตามมติ",
    decidedAt: "2026-08-20",
    resolutionItems: [
      { code: "SEND_NACC", instructionText: "ส่งสำนวนให้สำนักงาน ป.ป.ช." },
      { code: "SEND_DISCIPLINE_AGENCY", instructionText: "ส่งมติให้หน่วยงานต้นสังกัด" }
    ]
  });

  assert.equal(result.ok, true, `${result.code}: ${JSON.stringify(result.errors)}`);
  assert.equal(result.state.a5Report213Lifecycle.results[0].resolutionDocumentVersionId, "board-resolution:v3");
  assert.equal(result.state.a5Report213Lifecycle.results[0].sourceType, "MANUAL_COPY_FROM_ACTIVITY_7");
  assert.equal(result.state.a5Report213Lifecycle.results[0].certifiedTrueCopy, true);
  assert.deepEqual(result.state.downstreamTasks.map(item => item.type), ["SEND_NACC", "SEND_DISCIPLINE_AGENCY"]);
  assert.equal(result.state.workflow.downstreamStatus, "OUTCOME_TASKS_PENDING");
  assert.deepEqual(workflow.getA5AvailableActions(result.state, "clerk").map(action => action.id), ["outcome-task-start"]);
});

test("external resolution task requires the destination, dispatch document and receipt evidence", () => {
  const state = workflow.normalizeA5State(resultReadyState());
  const recorded = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 25, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "NOT_ACCEPT",
    resolutionReference: "มติ 50/2569",
    resolutionDocumentVersionId: "board-resolution:v8",
    resolutionText: "ให้ส่งเรื่องแก่พนักงานสอบสวน",
    decidedAt: "2026-08-20",
    resolutionItems: [{ code: "SEND_POLICE", instructionText: "ส่งสำนวนต้นฉบับแก่พนักงานสอบสวน" }]
  });
  const taskId = recorded.state.downstreamTasks[0].id;
  const started = workflow.executeA5Action(recorded.state, "clerk", "outcome-task-start", { actorName: "ธุรการคดี", taskId, at: "2026-08-21T09:00:00.000Z" });
  const blocked = workflow.executeA5Action(started.state, "clerk", "outcome-task-send", { actorName: "ธุรการคดี", taskId, letterNo: "ปป 10/2569", sentAt: "2026-08-21", at: "2026-08-21T10:00:00.000Z" });
  assert.equal(blocked.code, "MISSING_REQUIRED_FIELD");

  const sent = workflow.executeA5Action(started.state, "clerk", "outcome-task-send", {
    actorName: "ธุรการคดี",
    taskId,
    letterNo: "ปป 10/2569",
    sentAt: "2026-08-21",
    destination: "สถานีตำรวจตามเขตอำนาจ",
    dispatchDocumentVersionId: "dispatch-letter:v1",
    deliveryMethod: "ระบบ E-CMIS",
    at: "2026-08-21T10:00:00.000Z"
  });
  assert.equal(sent.ok, true);
  assert.equal(sent.state.externalExchanges[0].destination, "สถานีตำรวจตามเขตอำนาจ");
  assert.equal(sent.state.externalExchanges[0].dispatchDocumentVersionId, "dispatch-letter:v1");
  const received = workflow.executeA5Action(sent.state, "clerk", "outcome-task-record-receipt", { actorName: "ธุรการคดี", taskId, receivedAt: "2026-08-22", evidence: "receipt:v1", at: "2026-08-22T10:00:00.000Z" });
  assert.equal(received.ok, true);
  assert.equal(received.state.downstreamTasks[0].status, "COMPLETED");
});

test("additional 213 resolution creates a correction revision without inventing a new deadline", () => {
  const state = workflow.normalizeA5State(resultReadyState());
  const result = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 21, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "ADDITIONAL",
    resolutionReference: "มติ 46/2569",
    resolutionDocumentVersionId: "board-resolution:v4",
    resolutionText: "ให้ไต่สวนประเด็นการกำหนดราคากลางเพิ่มเติม",
    decidedAt: "2026-08-20",
    resolutionItems: [{ code: "ADDITIONAL_213", instructionText: "รวบรวมหลักฐานการกำหนดราคากลางเพิ่ม" }]
  });

  assert.equal(result.ok, true, `${result.code}: ${JSON.stringify(result.errors)}`);
  assert.equal(result.state.a5Report213Lifecycle.status, "REPORT_213_RETURNED");
  assert.equal(result.state.workflow.downstreamStatus, "REPORT_213_RETURNED");
  assert.equal(result.state.workflow.owner, "investigator");
  assert.equal(result.state.inquiry.prelim.additionalDeadlineAt, undefined);
  assert.equal(result.state.a5DocumentStore.records.at(-1).revisionNo, 2);
  assert.equal(result.state.a5DocumentStore.records.at(-1).status, "DRAFT");
  assert.equal(result.state.downstreamTasks[0].status, "IN_PROGRESS");
  assert.equal(result.state.downstreamTasks[0].resolutionItem.orderedDueAt, "");
});

test("section 62 case always creates a section 65 reporting task after the 213 resolution", () => {
  const fixture = resultReadyState();
  fixture.caseData.decision = "62";
  fixture.inquiry.intake.m62 = { flag: true };
  fixture.assignment.acceptedAssignmentVersion = fixture.assignment.assignmentVersion;
  const state = workflow.normalizeA5State(fixture);
  const result = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 22, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "NOT_ACCEPT",
    resolutionReference: "มติ 47/2569",
    resolutionDocumentVersionId: "board-resolution:v5",
    resolutionText: "ไม่ปรากฏพยานหลักฐานเพียงพอ",
    decidedAt: "2026-08-20",
    resolutionItems: [{ code: "END_NO_EVIDENCE", instructionText: "แจ้งผลและยุติเรื่อง" }]
  });

  assert.equal(result.ok, true, `${result.code}: ${JSON.stringify(result.errors)}`);
  assert.deepEqual(result.state.downstreamTasks.map(item => item.type), ["NOTIFY_DECISION", "REPORT_NACC_SECTION_65"]);
  const reported = workflow.executeA5Action(result.state, "investigator", "nacc-report-add", {
    actorName: "พนักงาน ป.ป.ท. สมชาย",
    actorOfficerId: "officer-1",
    letterNo: "ปป 65/2569",
    reportDate: "2026-08-21",
    summary: "รายงานมติ 47/2569",
    at: "2026-08-21T10:00:00.000Z"
  });
  assert.equal(reported.ok, true);
  assert.equal(reported.state.downstreamTasks.find(item => item.type === "REPORT_NACC_SECTION_65").status, "COMPLETED");
});

test("24v1 inquiry starts from the secretary signature only after required case handover is accepted", () => {
  const state = workflow.normalizeA5State(resultReadyState());
  const recorded = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 23, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "ACCEPT",
    resolutionReference: "มติ 48/2569",
    resolutionDocumentVersionId: "board-resolution:v6",
    resolutionText: "รับไว้ไต่สวนโดยแต่งตั้งคณะพนักงานไต่สวน",
    decidedAt: "2026-08-20",
    resolutionItems: [{ code: "ACCEPT_24V1", instructionText: "แต่งตั้งคณะพนักงานไต่สวนตามมาตรา 24 วรรคหนึ่ง" }]
  });
  const taskId = recorded.state.downstreamTasks[0].id;
  const started = workflow.executeA5Action(recorded.state, "clerk", "outcome-task-start", { actorName: "ธุรการคดี", taskId, at: "2026-08-21T09:00:00.000Z" });
  const order = {
    actorName: "ธุรการคดี",
    taskId,
    at: "2026-08-22T09:00:00.000Z",
    orderNo: "คำสั่ง 12/2569",
    orderSignedAt: "2026-08-22",
    orderDocumentVersionId: "inquiry-order:v1",
    orderSignatureMethod: "Digital Signature",
    investigator644Id: "officer-2",
    appointmentOfficerConfirmed: false
  };
  const blocked = workflow.executeA5Action(started.state, "clerk", "outcome-task-complete", order);
  assert.equal(blocked.code, "ACTOR_MISMATCH");
  assert.deepEqual(blocked.state, started.state);

  assert.deepEqual(workflow.getA5AvailableActions(started.state, "secretary").map(action => action.id), ["prepare-644-order-sign"]);
  const signed = workflow.executeA5Action(started.state, "secretary", "prepare-644-order-sign", { ...order, actorName: "เลขาธิการ ป.ป.ท." });
  assert.equal(signed.ok, true);
  assert.equal(signed.state.downstreamTasks[0].status, "AWAITING_NOTIFICATION");
  assert.equal(signed.state.downstreamTasks[0].pendingOrder.investigator644Name, "พนักงาน ป.ป.ท. คนใหม่");

  const notified = workflow.executeA5Action(signed.state, "case-clerk", "prepare-644-notify", {
    actorName: "ธุรการคดี",
    taskId,
    notifiedAt: "2026-08-22",
    notificationChannel: "ระบบ E-CMIS",
    notificationDocumentVersionId: "appointment-notice:v1",
    at: "2026-08-22T09:30:00.000Z"
  });
  assert.equal(notified.ok, true);
  assert.equal(notified.state.downstreamTasks[0].status, "AWAITING_ACKNOWLEDGEMENT");

  const wrongOfficerAcknowledgement = workflow.executeA5Action(notified.state, "investigator", "prepare-644-acknowledge", {
    actorName: "พนักงาน ป.ป.ท. สมชาย",
    actorOfficerId: "officer-1",
    taskId,
    acknowledged: true,
    at: "2026-08-22T09:40:00.000Z"
  });
  assert.equal(wrongOfficerAcknowledgement.code, "ACTOR_MISMATCH");
  assert.deepEqual(wrongOfficerAcknowledgement.state, notified.state);

  const acknowledged = workflow.executeA5Action(notified.state, "investigator", "prepare-644-acknowledge", {
    actorName: "พนักงาน ป.ป.ท. คนใหม่",
    actorOfficerId: "officer-2",
    taskId,
    acknowledged: true,
    at: "2026-08-22T09:45:00.000Z"
  });
  assert.equal(acknowledged.ok, true);
  assert.equal(acknowledged.state.downstreamTasks[0].status, "AWAITING_HANDOVER_SEND");

  const sent = workflow.executeA5Action(acknowledged.state, "investigator", "prepare-644-handover-send", {
    actorName: "พนักงาน ป.ป.ท. สมชาย",
    actorOfficerId: "officer-1",
    taskId,
    at: "2026-08-22T10:00:00.000Z",
    handoverLetterNo: "ปป 001/2569",
    handoverSentAt: "2026-08-22",
    handoverEvidenceVersionId: "handover:v1"
  });
  assert.equal(sent.ok, true);
  assert.equal(sent.state.downstreamTasks[0].status, "AWAITING_HANDOVER_ACCEPT");

  const completed = workflow.executeA5Action(sent.state, "investigator", "prepare-644-handover-accept", {
    actorName: "พนักงาน ป.ป.ท. คนใหม่",
    actorOfficerId: "officer-2",
    taskId,
    at: "2026-08-23T09:00:00.000Z",
    handoverAcceptedAt: "2026-08-23",
  });
  assert.equal(completed.ok, true, `${completed.code}: ${JSON.stringify(completed.errors)}`);
  assert.equal(completed.state.workflow.downstreamStatus, "REPORT_644_DRAFT");
  assert.equal(completed.state.inquiry.inquiry644.startedAt, "2026-08-22");
  assert.equal(completed.state.inquiry.inquiry644.deadlineAt, "2027-05-19");
  assert.equal(completed.state.inquiry.committee213.handoverDoc.acceptedAt, "2026-08-23");
});

test("24v3 inquiry starts from the board decision date, not the order recording date", () => {
  const state = workflow.normalizeA5State(resultReadyState());
  const recorded = workflow.executeA5Action(state, "case-clerk", "report-213-record-result", {
    ...reviewCommand(state, 24, { roleCode: "clerk" }),
    actorId: "case-clerk-1",
    actorName: "ธุรการคดี",
    manualSource: "MANUAL_COPY_FROM_ACTIVITY_7",
    certifiedTrueCopy: true,
    decisionCode: "ACCEPT",
    resolutionReference: "มติ 49/2569",
    resolutionDocumentVersionId: "board-resolution:v7",
    resolutionText: "รับไว้ไต่สวนโดยตั้งคณะอนุกรรมการไต่สวน",
    decidedAt: "2026-08-20",
    resolutionItems: [{ code: "ACCEPT_24V3", instructionText: "ตั้งคณะอนุกรรมการไต่สวนตามมาตรา 24 วรรคสาม" }]
  });
  const taskId = recorded.state.downstreamTasks[0].id;
  const started = workflow.executeA5Action(recorded.state, "clerk", "outcome-task-start", { actorName: "ธุรการคดี", taskId, at: "2026-08-21T09:00:00.000Z" });
  const unknownOfficer = workflow.executeA5Action(started.state, "case-clerk", "prepare-644-order-record", {
    actorName: "ธุรการคดี",
    taskId,
    at: "2026-08-25T08:00:00.000Z",
    orderNo: "คำสั่ง 13/2569",
    orderSignedAt: "2026-08-25",
    orderDocumentVersionId: "inquiry-order:v2",
    orderSignatureMethod: "Digital Signature",
    orderSignerAuthority: { status: "CONFIRMED", authorityType: "BOARD_CHAIR", referenceNo: "มติ 49/2569" },
    investigator644Id: "unknown-officer",
    appointmentOfficerConfirmed: true
  });
  assert.equal(unknownOfficer.code, "STAFF_DIRECTORY_ENTRY_REQUIRED");

  const ordered = workflow.executeA5Action(started.state, "case-clerk", "prepare-644-order-record", {
    actorName: "ธุรการคดี",
    taskId,
    at: "2026-08-25T09:00:00.000Z",
    orderNo: "คำสั่ง 13/2569",
    orderSignedAt: "2026-08-25",
    orderDocumentVersionId: "inquiry-order:v2",
    orderSignatureMethod: "Digital Signature",
    orderSignerAuthority: { status: "CONFIRMED", authorityType: "BOARD_CHAIR", referenceNo: "มติ 49/2569" },
    investigator644Id: "officer-1",
    appointmentOfficerConfirmed: true
  });
  assert.equal(ordered.ok, true);
  const notified = workflow.executeA5Action(ordered.state, "case-clerk", "prepare-644-notify", { actorName: "ธุรการคดี", taskId, notifiedAt: "2026-08-25", notificationChannel: "ระบบ E-CMIS", notificationDocumentVersionId: "appointment-notice:v2", at: "2026-08-25T10:00:00.000Z" });
  assert.equal(notified.ok, true);
  const completed = workflow.executeA5Action(notified.state, "investigator", "prepare-644-acknowledge", { actorName: "พนักงาน ป.ป.ท. สมชาย", actorOfficerId: "officer-1", taskId, acknowledged: true, at: "2026-08-25T10:30:00.000Z" });
  assert.equal(completed.ok, true, `${completed.code}: ${JSON.stringify(completed.errors)}`);
  assert.equal(completed.state.inquiry.inquiry644.startedAt, "2026-08-20");
  assert.equal(completed.state.inquiry.inquiry644.deadlineAt, "2027-05-17");
});

test("workspace exposes authority signature and three canonical route controls", () => {
  const workspaceSource = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");
  assert.match(workspaceSource, /FINAL_SIGNATURE_PENDING: 'เลขาธิการให้ความเห็นและลงนามขั้นสุดท้าย'/);
  assert.match(workspaceSource, /id="a5Report213AuthorityRef"/);
  assert.match(workspaceSource, /id="a5Report213ActingForSecretary"/);
  assert.match(workspaceSource, /value="NORMAL"/);
  assert.match(workspaceSource, /value="SUPPORT_COMMITTEE"/);
  assert.match(workspaceSource, /value="URGENT"/);
  assert.match(workspaceSource, /Document Version หนังสือขอบรรจุวาระด่วน/);
});
