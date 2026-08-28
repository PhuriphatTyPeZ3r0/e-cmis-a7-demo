import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const rules = require("../assets/activity5-extension-rules.js");
const workspace = require("../assets/activity5-extension-workspace.js");
const review = require("../assets/activity5-extension-review.js");
let embeddedWorkspaceApi = null;

function getEmbeddedWorkspace() {
  if (embeddedWorkspaceApi) return embeddedWorkspaceApi;
  const storage = new Map();
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  };
  globalThis.sessionStorage = globalThis.localStorage;
  globalThis.ThaiDatePicker = { html: () => "<input>", wireAll() {} };
  require("../assets/activity5-rules.js");
  require("../assets/activity5-assignment-recommendation.js");
  require("../assets/activity5-workflow.js");
  require("../assets/activity5-workspace.js");
  embeddedWorkspaceApi = globalThis.EXMIS;
  return embeddedWorkspaceApi;
}

function createSource(overrides = {}) {
  const source = {
    requestId: "extension:case-001:1",
    caseId: "case-001",
    caseNumber: "A5-001/2569",
    extensionType: rules.EXTENSION_TYPES.PRELIMINARY_INQUIRY,
    reportType: "213",
    roundNo: 1,
    actorId: "officer-001",
    ownerId: "officer-001",
    ownerName: "พนักงาน ป.ป.ท. ทดสอบ",
    assignment: {
      primaryOfficerId: "officer-001",
      assignmentVersion: 3,
      acceptedAssignmentVersion: 3
    },
    currentDeadline: "2026-09-30",
    submissionCutoff: "2026-09-15",
    deadlineBasis: { schemaVersion: 1, extensionType: "PRELIMINARY_INQUIRY", startEvent: "FIRST_RECEIPT", startedAt: "2026-08-01", baseDays: 60, initialDeadline: "2026-09-30" },
    deadlineVersion: 1,
    unitKey: "เขต-2",
    at: "2026-08-14T09:00:00+07:00",
    repository: [],
    draftPayload: {},
    ...overrides
  };
  source.reviewerContract = overrides.reviewerContract || {
    status: "CONFIRMED",
    requestId: source.requestId,
    revisionNo: 1,
    extensionType: source.extensionType,
    roundNo: source.roundNo,
    unitKey: source.unitKey,
    authorityTier: source.extensionType === rules.EXTENSION_TYPES.PRELIMINARY_INQUIRY && source.roundNo === 2
      ? "SUPERVISING_EXECUTIVE"
      : source.extensionType === rules.EXTENSION_TYPES.FULL_INQUIRY && source.roundNo >= 3
        ? "SUPERVISING_EXECUTIVE"
        : "UNIT_DIRECTOR",
    reviewerId: "reviewer-001",
    reviewerRole: source.extensionType === rules.EXTENSION_TYPES.PRELIMINARY_INQUIRY && source.roundNo === 2
      ? "executive"
      : source.extensionType === rules.EXTENSION_TYPES.FULL_INQUIRY && source.roundNo >= 3 ? "executive" : "director",
    assignmentId: "assignment-1",
    assignmentVersion: 1,
    effectiveDate: "2026-08-14",
    actingForTier: null,
    authorityStatus: "CONFIRMED",
    dayPolicyStatus: "CONFIRMED",
    canApprove: true,
    maxApprovedDays: 60,
    routePolicyVersion: "a5-extension-route-2026-08-15"
  };
  return source;
}

function accessContext(model, overrides = {}) {
  return {
    actorId: "officer-001",
    primaryOfficerId: "officer-001",
    assignmentVersion: 3,
    acceptedAssignmentVersion: 3,
    caseId: model.context.caseId,
    extensionType: model.context.extensionType,
    formId: model.context.formId,
    roundNo: model.context.roundNo,
    requestId: model.requestState.id,
    revisionNo: model.requestState.activeRevisionNo,
    ...overrides
  };
}

function repositoryOf(count) {
  return Array.from({ length: count }, (_, index) => ({
    artifactId: `artifact-${index + 1}`,
    versionId: `version-${index + 1}`,
    version: 1,
    name: `เอกสารประกอบ ${String(index + 1).padStart(3, "0")}`,
    documentType: index % 2 ? "WORK_LOG" : "CASE_PLAN",
    source: index % 3 ? "SYSTEM" : "A4_HANDOFF",
    documentNumber: `DOC-${index + 1}`,
    reference: `REF-${index + 1}`,
    createdAt: `2026-08-${String((index % 28) + 1).padStart(2, "0")}T09:00:00+07:00`,
    availability: "AVAILABLE"
  }));
}

function requirementRepository(codes, availability = "AVAILABLE") {
  return codes.map((code, index) => ({
    artifactId: `requirement-${code}`,
    versionId: `requirement-${code}-v1`,
    version: 1,
    name: requirementLabels[code] || "เอกสารประกอบ",
    documentType: code,
    source: "SYSTEM",
    documentNumber: `REQ-${index + 1}`,
    reference: code,
    createdAt: `2026-08-${String(index + 1).padStart(2, "0")}T09:00:00+07:00`,
    availability,
    binaryPersisted: availability === "AVAILABLE",
    storageRef: availability === "AVAILABLE" ? `storage/${code}.pdf` : "",
    integrity: availability === "AVAILABLE" ? { algorithm: "SHA-256", digest: "a".repeat(64) } : null,
    lineage: { caseId: "case-001", sourceDocumentId: code }
  }));
}

const completeFields = {
  progress: "ดำเนินการแล้วร้อยละ 70",
  workDone: "รวบรวมพยานหลักฐานส่วนหลักแล้ว",
  workRemaining: "รอเอกสารยืนยันจากหน่วยงานต้นสังกัด",
  obstacles: "เอกสารจากหน่วยงานภายนอกล่าช้า",
  reason: "จำเป็นต้องตรวจสอบเอกสารให้ครบถ้วน",
  requestedDays: 30
};
const requirementLabels = {
  CASE_PLAN: "แผนงานคดี",
  WORK_LOG: "บันทึกการปฏิบัติงาน",
  RECEIVED_DATE_EVIDENCE: "หลักฐานวันรับสำนวน",
  INQUIRY_APPOINTMENT_ORDER: "คำสั่งแต่งตั้งคณะไต่สวน"
};

function readyPreliminaryModel() {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  model = workspace.reduceRequesterWorkspace(model, { type: "SET_FIELDS", patch: completeFields }).result;
  model = workspace.saveRequesterWorkspace(model, { actorId: "officer-001", at: "2026-08-14T09:30:00+07:00" }).result;
  for (const code of codes) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }
  model = workspace.saveRequesterWorkspace(model, {
    actorId: "officer-001",
    at: "2026-08-14T09:30:30+07:00"
  }).result;
  return workspace.validateRequesterWorkspace(model, {
    actorId: "officer-001",
    at: "2026-08-14T09:31:00+07:00"
  }).result;
}

test("creates a four-step Form 2 requester workspace through the approved rule and workflow APIs", () => {
  const response = workspace.createRequesterWorkspace(createSource());

  assert.equal(response.ok, true);
  assert.equal(response.result.requestState.formId, "FORM_2");
  assert.deepEqual(response.result.steps.map(step => step.label), [
    "ข้อมูลคำขอ",
    "เอกสารประกอบ",
    "ตรวจความพร้อม",
    "ยืนยันและยื่น"
  ]);
  assert.equal(response.result.context.caseNumber, "A5-001/2569");
  assert.equal(response.result.context.currentDeadline, "2026-09-30");
  assert.equal(response.result.context.roundNo, 1);
  assert.equal(response.result.ui.step, 1);
});

test("embedded requester blocks 644 round five with a late-report signal", () => {
  const embedded = getEmbeddedWorkspace();
  globalThis.ECMISCurrentAccount = { officerId: "officer-001", name: "พนักงาน ป.ป.ท. ทดสอบ" };
  const state = {
    caseData: { id: "case-policy-644", subject: "ตรวจนโยบายรอบขยาย" },
    documentData: {},
    workflow: { stage: "a5-inquiry", status: "อยู่ระหว่างไต่สวน", owner: "investigator" },
    assignment: {
      primaryOfficerId: "officer-001",
      assignmentVersion: 3,
      acceptedAssignmentVersion: 3,
      acceptedBy: "พนักงาน ป.ป.ท. ทดสอบ"
    },
    inquiry: {
      intake: {},
      prelim: {},
      inquiry644: {
        deadlineAt: "2026-12-31",
        extensionHistory: [1, 2, 3, 4].map(round => ({ round, status: "APPROVED" }))
      }
    },
    decisionHistory: []
  };

  const opened = embedded.openExtensionWorkspaceA5(state, "investigator");
  assert.equal(opened.ok, false);
  assert.equal(opened.code, "EXTRAORDINARY_FLOW_REQUIRED");
  assert.equal(opened.signal.type, "LATE_REPORT_REQUIRED");
  assert.equal(opened.signal.target, "ACTIVITY_7");
  assert.equal(state.inquiry.extensionWorkspace, undefined);
});

test("embedded repository adapter renders every available case document without opening unavailable metadata", () => {
  const embedded = getEmbeddedWorkspace();
  const state = {
    caseData: { id: "case-preview-213", subject: "ตรวจตัวอย่างเอกสาร" },
    documentData: {},
    workflow: { stage: "a5-prelim", status: "อยู่ระหว่างไต่สวน", owner: "investigator" },
    assignment: { primaryOfficerId: "officer-001", assignmentVersion: 3, acceptedAssignmentVersion: 3 },
    inquiry: {
      intake: {},
      prelim: { plan: "แผนตรวจพยาน", workLog: "บันทึกตรวจพยาน", startedAt: "2026-08-01" },
      inquiry644: {}
    },
    inboundDocumentManifest: {
      signedVersion: 1,
      signedAt: "2026-08-01T08:00:00+07:00",
      documents: [{ documentId: "a4-signed", label: "เอกสารรับเข้าฉบับลงนาม", html: '<article contenteditable="true">ฉบับลงนามจากกิจกรรมที่ 4</article>' }],
      attachments: [{ name: "ข้อมูลแนบอ้างอิง.pdf", type: "PDF" }]
    },
    decisionHistory: []
  };
  embedded.ensureInquiry(state);
  const repository = embedded.extensionRepositoryA5(state, "213");
  const plan = repository.find(item => item.documentType === "CASE_PLAN");
  const signed = repository.find(item => item.sourceDocumentId === "a4-signed");
  const unavailable = repository.find(item => item.availability !== "AVAILABLE");

  assert.match(embedded.extensionDocumentPreviewA5(state, plan), /แผนงานคดี|แผนตรวจพยาน/);
  const signedHtml = embedded.extensionDocumentPreviewA5(state, signed);
  assert.match(signedHtml, /ฉบับลงนามจากกิจกรรมที่ 4/);
  assert.match(signedHtml, /contenteditable="false"/);
  assert.equal(embedded.extensionDocumentPreviewA5(state, unavailable), "");
});

test("Form 3 repository previews render the exact 644 plan and work log without mutating the live case", () => {
  const embedded = getEmbeddedWorkspace();
  const state = {
    caseData: { id: "case-preview-644", subject: "ตรวจตัวอย่างเอกสาร 644" },
    documentData: {},
    workflow: { stage: "a5-inquiry", status: "อยู่ระหว่างไต่สวน", owner: "investigator" },
    assignment: { primaryOfficerId: "officer-001", assignmentVersion: 3, acceptedAssignmentVersion: 3 },
    inquiry: {
      intake: {},
      prelim: { plan: "ห้ามแสดงแผน 213", workLog: "ห้ามแสดงบันทึก 213" },
      inquiry644: {
        plan: "แผนเฉพาะ 644 ตรวจเส้นทางการเงิน",
        workLog: "บันทึกเฉพาะ 644 สอบพยานแล้วสองปาก",
        startedAt: "2026-08-01"
      }
    },
    decisionHistory: []
  };
  embedded.ensureInquiry(state);
  const before = structuredClone(state);
  const repository = embedded.extensionRepositoryA5(state, "644");
  const plan = repository.find(item => item.documentType === "CASE_PLAN");
  const workLog = repository.find(item => item.documentType === "WORK_LOG");

  assert.equal(plan.availability, "AVAILABLE");
  assert.equal(workLog.availability, "AVAILABLE");
  assert.match(embedded.extensionDocumentPreviewA5(state, plan), /แผนเฉพาะ 644 ตรวจเส้นทางการเงิน/);
  assert.match(embedded.extensionDocumentPreviewA5(state, workLog), /บันทึกเฉพาะ 644 สอบพยานแล้วสองปาก/);
  assert.deepEqual(state, before);

  const withoutSources = structuredClone(state);
  withoutSources.inquiry.inquiry644.plan = "";
  withoutSources.inquiry.inquiry644.workLog = "";
  const unavailableRepository = embedded.extensionRepositoryA5(withoutSources, "644");
  assert.equal(unavailableRepository.some(item => ["CASE_PLAN", "WORK_LOG"].includes(item.documentType) && item.availability === "AVAILABLE"), false);
});

test("schema version 1 recovery hydrates exact 644 preview snapshots or downgrades stale available artifacts", () => {
  const embedded = getEmbeddedWorkspace();
  const state = {
    caseData: { id: "case-recovery-644", subject: "กู้คืนตัวอย่างเอกสาร 644" },
    documentData: {},
    workflow: { stage: "a5-inquiry", status: "อยู่ระหว่างไต่สวน", owner: "investigator" },
    assignment: { primaryOfficerId: "officer-001", assignmentVersion: 3, acceptedAssignmentVersion: 3 },
    inquiry: {
      intake: {},
      prelim: {},
      inquiry644: {
        plan: "แผน 644 ฉบับปัจจุบันสำหรับกู้คืน",
        workLog: "บันทึก 644 ฉบับปัจจุบันสำหรับกู้คืน",
        startedAt: "2026-08-01"
      }
    },
    decisionHistory: []
  };
  embedded.ensureInquiry(state);
  const freshRepository = embedded.extensionRepositoryA5(state, "644");
  const source = createSource({
    requestId: "extension:case-recovery-644:1",
    caseId: "case-recovery-644",
    caseNumber: "case-recovery-644",
    extensionType: rules.EXTENSION_TYPES.FULL_INQUIRY,
    reportType: "644",
    repository: freshRepository
  });
  const persisted = workspace.createRequesterWorkspace(source).result;
  persisted.repository.forEach(item => { delete item.previewSnapshot; });

  const hydrated = workspace.createRequesterWorkspace({ ...source, persisted });
  assert.equal(hydrated.ok, true);
  for (const documentType of ["CASE_PLAN", "WORK_LOG"]) {
    const item = hydrated.result.repository.find(candidate => candidate.documentType === documentType);
    assert.equal(item.availability, "AVAILABLE");
    assert.ok(item.previewSnapshot);
    assert.match(embedded.extensionDocumentPreviewA5(state, item), /ฉบับปัจจุบันสำหรับกู้คืน/);
  }

  const downgraded = workspace.createRequesterWorkspace({ ...source, repository: [], persisted });
  assert.equal(downgraded.ok, true);
  for (const item of downgraded.result.repository.filter(candidate => ["CASE_PLAN", "WORK_LOG"].includes(candidate.documentType))) {
    assert.notEqual(item.availability, "AVAILABLE");
    assert.equal(embedded.extensionDocumentPreviewA5(state, item), "");
  }
});

test("rejects a non-primary current account and rejects recovery or commands after assignment scope changes", () => {
  const wrongActorSource = createSource({ actorId: "intruder-002" });
  const originalSource = structuredClone(wrongActorSource);
  const deniedCreate = workspace.createRequesterWorkspace(wrongActorSource);

  assert.equal(deniedCreate.ok, false);
  assert.match(deniedCreate.errors[0].message, /บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลัก/);
  assert.deepEqual(wrongActorSource, originalSource);

  const created = workspace.createRequesterWorkspace(createSource());
  assert.equal(created.ok, true);
  assert.equal(created.result.requestState.ownerId, "officer-001");
  assert.equal(created.result.context.ownerId, "officer-001");

  const deniedRecovery = workspace.createRequesterWorkspace(createSource({
    actorId: "officer-001",
    assignment: {
      primaryOfficerId: "officer-001",
      assignmentVersion: 4,
      acceptedAssignmentVersion: 0
    },
    persisted: created.result
  }));
  assert.equal(deniedRecovery.ok, false);
  assert.match(deniedRecovery.errors[0].message, /ยังไม่ได้รับมอบหมายเวอร์ชันปัจจุบัน/);

  const before = structuredClone(created.result);
  const controller = workspace.createRequesterController({
    model: created.result,
    actorId: "officer-001",
    now: () => "2026-08-14T09:10:00+07:00",
    persist: () => {},
    getAccessContext: () => accessContext(created.result, { assignmentVersion: 4, acceptedAssignmentVersion: 4 })
  });
  const deniedCommand = controller.dispatch({ type: "SET_FIELDS", patch: { progress: "ห้ามบันทึก" } });
  assert.equal(deniedCommand.ok, false);
  assert.match(deniedCommand.errors[0].message, /ข้อมูลมอบหมายเปลี่ยนแปลง/);
  assert.deepEqual(controller.getModel(), before);

  const embedded = getEmbeddedWorkspace();
  const caseState = {
    caseData: { id: "case-owner-check", subject: "ตรวจเจ้าของคำขอ" },
    documentData: {},
    workflow: { stage: "a5-prelim", owner: "investigator" },
    assignment: {
      primaryOfficerId: "officer-001",
      assignmentVersion: 3,
      acceptedAssignmentVersion: 3,
      acceptedBy: "พนักงาน ป.ป.ท. ทดสอบ"
    },
    inquiry: { intake: { unit: "เขต 2", receivedFirstAt: "2026-08-01" }, prelim: { extensionHistory: [] }, inquiry644: {} },
    decisionHistory: []
  };
  embedded.ensureInquiry(caseState);
  globalThis.ECMISCurrentAccount = { officerId: "intruder-002", name: "บัญชีอื่น" };
  const beforeCase = structuredClone(caseState);
  const deniedEmbedded = embedded.openExtensionWorkspaceA5(caseState, "investigator");
  assert.equal(deniedEmbedded.ok, false);
  assert.match(deniedEmbedded.message, /บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลัก/);
  assert.deepEqual(caseState, beforeCase);

  globalThis.ECMISCurrentAccount = { officerId: "officer-001", name: "พนักงาน ป.ป.ท. ทดสอบ" };
  caseState.inquiry.extensionAuthorityRegistry = {
    schemaVersion: 1,
    version: 1,
    assignments: [{ assignmentId: "director-zone2", unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", actorId: "director-2", actorRole: "director", status: "ACTIVE", effectiveFrom: "2026-01-01", effectiveTo: null, actingForTier: null, source: "STATE_ASSIGNMENT" }]
  };
  const openedEmbedded = embedded.openExtensionWorkspaceA5(caseState, "investigator");
  assert.equal(openedEmbedded.ok, true);
  assert.equal(openedEmbedded.workspace.context.ownerId, "officer-001");
  caseState.assignment.assignmentVersion = 4;
  caseState.assignment.acceptedAssignmentVersion = 4;
  const deniedChangedAssignment = embedded.openExtensionWorkspaceA5(caseState, "investigator");
  assert.equal(deniedChangedAssignment.ok, false);
  assert.match(deniedChangedAssignment.message, /ข้อมูลมอบหมายเปลี่ยนแปลง/);
});

test("repository paging is stable for 0, 1, 20, and 100 canonical metadata rows", () => {
  for (const count of [0, 1, 20, 100]) {
    const model = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(count) })).result;
    const page = workspace.getRepositoryPage(model);

    assert.equal(page.ok, true);
    assert.equal(page.result.total, count);
    assert.equal(page.result.items.length, Math.min(count, 20));
    assert.equal(page.result.page, 1);
    assert.equal(page.result.pageCount, Math.max(1, Math.ceil(count / 20)));
  }
});

test("repository requirement filter scopes canonical assignment links to the active request and revision", () => {
  let model = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(4) })).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "ASSIGN_REQUIREMENT",
    requirementCode: "CASE_PLAN",
    versionLinks: ["version-1"]
  }).result;
  model.assignmentLinks = [
    { requestId: "other-request", revisionNo: 1, requirementCode: "CASE_PLAN", documentVersionId: "version-2" },
    { requestId: model.requestState.id, revisionNo: 2, requirementCode: "CASE_PLAN", documentVersionId: "version-3" }
  ];
  const filtered = workspace.reduceRequesterWorkspace(model, {
    type: "SET_REPOSITORY_FILTERS",
    patch: { requirementCode: "CASE_PLAN", sortBy: "createdAt", sortDirection: "desc" }
  });
  assert.equal(filtered.ok, true);

  const page = workspace.getRepositoryPage(filtered.result);
  assert.equal(page.ok, true);
  assert.deepEqual(page.result.items.map(item => item.versionId), ["version-1"]);
  assert.equal(page.result.query.requestId, model.requestState.id);
  assert.equal(page.result.query.revisionNo, 1);
  assert.equal(page.result.query.requirementCode, "CASE_PLAN");
  assert.equal(page.result.query.sortBy, "createdAt");
  assert.equal(page.result.query.sortDirection, "desc");
  filtered.result.ui.step = 2;
  const rendered = workspace.renderRequesterWorkspace(filtered.result, { renderForm: () => "<article>แบบคำขอ</article>" });
  assert.match(rendered, /<th>รายการบังคับ<\/th>/);
  assert.match(rendered, /data-version-id="version-1"[\s\S]*?<td[^>]+data-requirement-links[^>]*>[\s\S]*?แผนงานคดี/);
});

test("visible-only bulk selection preserves hidden and off-page exact versions", () => {
  const created = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(100) }));
  let model = workspace.reduceRequesterWorkspace(created.result, {
    type: "SET_SELECTED_VERSIONS",
    versionIds: ["version-1", "version-81"]
  }).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "SELECT_VISIBLE",
    visibleVersionIds: ["version-1", "version-2", "version-3"],
    action: "SELECT"
  }).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "SELECT_VISIBLE",
    visibleVersionIds: ["version-2"],
    action: "UNSELECT"
  }).result;

  assert.deepEqual(model.selectedVersionIds.sort(), ["version-1", "version-3", "version-81"]);
  assert.equal(model.ui.dirty, true);
});

test("available repository and package documents open through the adapter with previous and next navigation", () => {
  const repository = repositoryOf(3);
  repository[2].availability = "WITHDRAWN";
  let model = workspace.createRequesterWorkspace(createSource({ repository })).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "SET_SELECTED_VERSIONS",
    versionIds: ["version-1", "version-2", "version-3"]
  }).result;
  const opened = workspace.reduceRequesterWorkspace(model, { type: "OPEN_DOCUMENT", versionId: "version-1" });
  assert.equal(opened.ok, true);
  assert.equal(opened.result.ui.previewVersionId, "version-1");

  const adapter = {
    renderForm: () => "<article>แบบคำขอ</article>",
    renderDocument: item => `<article data-previewed-version="${item.versionId}">${item.name}</article>`
  };
  opened.result.ui.step = 2;
  const html = workspace.renderRequesterWorkspace(opened.result, adapter);
  assert.match(html, /data-a5-extension-action="open-document"[^>]+data-version-id="version-1"/);
  assert.match(html, /data-a5-extension-action="open-document"[^>]+data-version-id="version-2"/);
  assert.doesNotMatch(html, /data-a5-extension-action="open-document"[^>]+data-version-id="version-3"/);
  assert.match(html, /data-previewed-version="version-1"/);
  assert.match(html, /data-a5-extension-action="preview-previous"/);
  assert.match(html, /data-a5-extension-action="preview-next"/);

  const next = workspace.reduceRequesterWorkspace(opened.result, { type: "PREVIEW_NEXT", scope: "PACKAGE" });
  assert.equal(next.ok, true);
  assert.equal(next.result.ui.previewVersionId, "version-2");
  const nextAgain = workspace.reduceRequesterWorkspace(next.result, { type: "PREVIEW_NEXT", scope: "PACKAGE" });
  assert.equal(nextAgain.ok, false);
  assert.match(nextAgain.errors[0].message, /ไม่มีเอกสารถัดไป/);
  const deniedUnavailable = workspace.reduceRequesterWorkspace(model, { type: "OPEN_DOCUMENT", versionId: "version-3" });
  assert.equal(deniedUnavailable.ok, false);
  assert.match(deniedUnavailable.errors[0].message, /ยังไม่พร้อมเปิดดู/);
});

test("field edits save through the approved workflow seam and clear the dirty guard", () => {
  const created = workspace.createRequesterWorkspace(createSource());
  const edited = workspace.reduceRequesterWorkspace(created.result, {
    type: "SET_FIELDS",
    patch: {
      progress: "สอบปากคำแล้ว 3 ปาก",
      workDone: "รวบรวมเอกสารจัดซื้อจัดจ้างแล้ว",
      workRemaining: "รอเอกสารการเงิน",
      obstacles: "หน่วยงานต้นสังกัดยังส่งเอกสารไม่ครบ",
      reason: "จำเป็นต้องตรวจเอกสารเพิ่มเติม",
      requestedDays: 30
    }
  });

  assert.equal(edited.ok, true);
  assert.equal(workspace.shouldBlockWorkspaceExit(edited.result), true);
  const saved = workspace.saveRequesterWorkspace(edited.result, {
    actorId: "officer-001",
    at: "2026-08-14T09:05:00+07:00"
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.result.requestState.revisions[0].draftPayload.requestedDays, 30);
  assert.equal(saved.result.ui.dirty, false);
  assert.equal(saved.result.ui.saveState, "SAVED");
  assert.equal(workspace.shouldBlockWorkspaceExit(saved.result), false);
});

test("controller autosaves through an injected persistence seam and reload recovers the active draft", () => {
  const created = workspace.createRequesterWorkspace(createSource());
  let persisted = null;
  const controller = workspace.createRequesterController({
    model: created.result,
    actorId: "officer-001",
    now: () => "2026-08-14T09:10:00+07:00",
    persist: model => { persisted = structuredClone(model); }
  });
  controller.dispatch({ type: "SET_FIELDS", patch: { progress: "บันทึกอัตโนมัติ" } });

  const autosaved = controller.autosave();
  assert.equal(autosaved.ok, true);
  assert.equal(persisted.ui.saveState, "SAVED");
  const recovered = workspace.createRequesterWorkspace(createSource({ persisted }));
  assert.equal(recovered.ok, true);
  assert.equal(recovered.code, "REQUESTER_WORKSPACE_RECOVERED");
  assert.equal(recovered.result.requestState.revisions[0].draftPayload.progress, "บันทึกอัตโนมัติ");
  assert.equal(recovered.result.ui.recovered, true);
  assert.equal(recovered.result.ui.dirty, false);
});

test("recovery derives canonical active assignment links from an older persisted workspace", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "ASSIGN_REQUIREMENT",
    requirementCode: "CASE_PLAN",
    versionLinks: ["requirement-CASE_PLAN-v1"]
  }).result;
  delete model.assignmentLinks;

  const recovered = workspace.createRequesterWorkspace(createSource({ persisted: model }));
  assert.equal(recovered.ok, true);
  const filtered = workspace.reduceRequesterWorkspace(recovered.result, {
    type: "SET_REPOSITORY_FILTERS",
    patch: { requirementCode: "CASE_PLAN" }
  });
  assert.equal(filtered.ok, true);
  const page = workspace.getRepositoryPage(filtered.result);
  assert.equal(page.ok, true);
  assert.deepEqual(page.result.items.map(item => item.versionId), ["requirement-CASE_PLAN-v1"]);
});

test("assignments repair divergent persisted links and remain canonical for query readiness and snapshot", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  for (const code of codes) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }
  model.assignmentLinks = [{
    requestId: model.requestState.id,
    revisionNo: model.requestState.activeRevisionNo,
    requirementCode: "CASE_PLAN",
    documentVersionId: "requirement-WORK_LOG-v1"
  }];

  const recovered = workspace.createRequesterWorkspace(createSource({ persisted: model }));
  assert.equal(recovered.ok, true);
  assert.deepEqual(recovered.result.assignmentLinks, codes.map(requirementCode => ({
    requestId: recovered.result.requestState.id,
    revisionNo: recovered.result.requestState.activeRevisionNo,
    requirementCode,
    documentVersionId: `requirement-${requirementCode}-v1`
  })));

  recovered.result.assignmentLinks = [{
    requestId: recovered.result.requestState.id,
    revisionNo: recovered.result.requestState.activeRevisionNo,
    requirementCode: "CASE_PLAN",
    documentVersionId: "requirement-WORK_LOG-v1"
  }];
  const filtered = workspace.reduceRequesterWorkspace(recovered.result, {
    type: "SET_REPOSITORY_FILTERS",
    patch: { requirementCode: "CASE_PLAN" }
  });
  assert.deepEqual(workspace.getRepositoryPage(filtered.result).result.items.map(item => item.versionId), ["requirement-CASE_PLAN-v1"]);
  assert.equal(workspace.evaluateRequesterReadiness(filtered.result).result.complete, true);

  let ready = workspace.reduceRequesterWorkspace(filtered.result, { type: "SET_FIELDS", patch: completeFields }).result;
  ready = workspace.saveRequesterWorkspace(ready, { actorId: "officer-001", at: "2026-08-14T10:10:00+07:00" }).result;
  ready = workspace.validateRequesterWorkspace(ready, { actorId: "officer-001", at: "2026-08-14T10:11:00+07:00" }).result;
  ready.assignmentLinks = recovered.result.assignmentLinks.slice(0, 1);
  const prepared = workspace.prepareRequesterSubmission(ready, { actorId: "officer-001", at: "2026-08-14T10:12:00+07:00" });
  assert.equal(prepared.ok, true);
  assert.deepEqual(prepared.result.payload.snapshotPayload.documents.requirementAssignments.CASE_PLAN, ["requirement-CASE_PLAN-v1"]);
});

test("multiple upload choices create honest pending metadata without claiming binary persistence", () => {
  const created = workspace.createRequesterWorkspace(createSource());
  const response = workspace.reduceRequesterWorkspace(created.result, {
    type: "ADD_UPLOAD_METADATA",
    uploads: [
      {
        metadata: { artifactId: "upload-plan", version: 1, name: "แผนงานคดีฉบับแนบ.pdf", documentType: "CASE_PLAN", size: 1200 },
        injection: { versionId: "upload-plan-v1", actorId: "officer-001", at: "2026-08-14T09:15:00+07:00" }
      },
      {
        metadata: { artifactId: "upload-log", version: 1, name: "บันทึกงาน.pdf", documentType: "WORK_LOG", size: 900 },
        injection: { versionId: "upload-log-v1", actorId: "officer-001", at: "2026-08-14T09:15:01+07:00" }
      }
    ]
  });

  assert.equal(response.ok, true);
  assert.equal(response.result.repository.length, 2);
  assert.deepEqual(response.result.repository.map(item => item.availability), ["UPLOAD_PENDING", "UPLOAD_PENDING"]);
  assert.deepEqual(response.result.repository.map(item => item.binaryPersisted), [false, false]);
  assert.match(response.result.ui.saveMessage, /ยังไม่ได้จัดเก็บไฟล์จริง/);
});

test("every document mutation autosave invalidates READY and clears prior validation", () => {
  const ready = readyPreliminaryModel();
  const requiredVersion = "requirement-CASE_PLAN-v1";
  ready.repository.push({
    artifactId: "extra-available",
    versionId: "extra-available-v1",
    version: 1,
    name: "เอกสารประกอบเพิ่มเติม",
    documentType: "CASE_PLAN",
    source: "SYSTEM",
    documentNumber: "EXTRA-1",
    reference: "extra",
    createdAt: "2026-08-14T09:39:00+07:00",
    availability: "AVAILABLE",
    previousVersionId: null,
    latestVersionId: "extra-available-v1",
    isLatest: true
  });
  const scenarios = [
    { type: "SELECT_VISIBLE", visibleVersionIds: [requiredVersion], action: "UNSELECT" },
    { type: "SELECT_VISIBLE", visibleVersionIds: ["extra-available-v1"], action: "SELECT" },
    {
      type: "ADD_UPLOAD_METADATA",
      uploads: [{
        metadata: { artifactId: "new-upload", version: 1, name: "แผนงานรอจัดเก็บ.pdf", documentType: "CASE_PLAN" },
        injection: { versionId: "new-upload-v1", actorId: "officer-001", at: "2026-08-14T09:40:00+07:00" }
      }]
    },
    { type: "ASSIGN_REQUIREMENT", requirementCode: "CASE_PLAN", versionLinks: [requiredVersion] }
  ];

  for (const [index, action] of scenarios.entries()) {
    const changed = workspace.reduceRequesterWorkspace(ready, action);
    assert.equal(changed.ok, true, action.type);
    const saved = workspace.saveRequesterWorkspace(changed.result, {
      actorId: "officer-001",
      at: `2026-08-14T09:4${index}:00+07:00`
    });
    assert.equal(saved.ok, true, action.type);
    assert.equal(saved.result.requestState.status, "DRAFT", action.type);
    assert.equal(saved.result.requestState.revisions[0].validation, undefined, action.type);
  }
});

test("Form 2 has no mandatory attachments and Form 3 validates four requirements", () => {
  for (const [extensionType, codes, formId] of [
    [rules.EXTENSION_TYPES.PRELIMINARY_INQUIRY, [], "FORM_2"],
    [rules.EXTENSION_TYPES.FULL_INQUIRY, ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE", "INQUIRY_APPOINTMENT_ORDER"], "FORM_3"]
  ]) {
    let model = workspace.createRequesterWorkspace(createSource({
      requestId: `request-${formId}`,
      extensionType,
      reportType: formId === "FORM_2" ? "213" : "644",
      repository: requirementRepository(codes)
    })).result;
    model = workspace.reduceRequesterWorkspace(model, { type: "SET_FIELDS", patch: completeFields }).result;
    model = workspace.saveRequesterWorkspace(model, { actorId: "officer-001", at: "2026-08-14T09:20:00+07:00" }).result;
    for (const code of codes) {
      model = workspace.reduceRequesterWorkspace(model, {
        type: "ASSIGN_REQUIREMENT",
        requirementCode: code,
        versionLinks: [`requirement-${code}-v1`]
      }).result;
    }

    const validated = workspace.validateRequesterWorkspace(model, {
      actorId: "officer-001",
      at: "2026-08-14T09:21:00+07:00"
    });
    assert.equal(validated.ok, true, `${formId}: ${validated.code}`);
    assert.equal(validated.result.requestState.formId, formId);
    assert.equal(validated.result.requestState.status, "READY");
    assert.equal(validated.result.readiness.requirements.length, codes.length);
    assert.equal(validated.result.readiness.complete, true);
  }
});

test("validation moves to the originating Thai field and exposes a concrete focus target", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  model = workspace.reduceRequesterWorkspace(model, {
    type: "SET_FIELDS",
    patch: { ...completeFields, reason: "" }
  }).result;
  model = workspace.saveRequesterWorkspace(model, {
    actorId: "officer-001",
    at: "2026-08-14T09:50:00+07:00"
  }).result;
  for (const code of codes) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }
  model = workspace.saveRequesterWorkspace(model, {
    actorId: "officer-001",
    at: "2026-08-14T09:51:00+07:00"
  }).result;

  const validated = workspace.validateRequesterWorkspace(model, {
    actorId: "officer-001",
    at: "2026-08-14T09:52:00+07:00"
  });
  assert.equal(validated.ok, false);
  assert.equal(validated.result.ui.step, 1);
  assert.equal(validated.result.ui.focusTarget, "a5Extension-reason");
  assert.match(validated.result.ui.fieldErrors.reason, /เหตุผลและความจำเป็น/);
  assert.doesNotMatch(validated.result.ui.fieldErrors.reason, /reason|MISSING_REQUIRED_FIELD/);

  const html = workspace.renderRequesterWorkspace(validated.result, { renderForm: () => "<article>แบบคำขอ</article>" });
  assert.match(html, /id="a5Extension-reason"[^>]+aria-invalid="true"[^>]+aria-describedby="a5Extension-reason-error"/);
  assert.match(html, /id="a5Extension-reason-error"[^>]*>[^<]*เหตุผลและความจำเป็น/);
});

test("explicitly cleared requested days stays blank and blocks validation and preparation at the Thai field", () => {
  const ready = readyPreliminaryModel();
  const cleared = workspace.reduceRequesterWorkspace(ready, {
    type: "SET_FIELDS",
    patch: { requestedDays: "" }
  });
  assert.equal(cleared.ok, true);
  assert.equal(cleared.result.ui.pendingPatch.requestedDays, "");
  assert.equal(workspace.reduceRequesterWorkspace(ready, { type: "SET_FIELDS", patch: { requestedDays: "abc" } }).ok, false);

  let emitted = null;
  const controller = workspace.createRequesterController({
    model: cleared.result,
    actorId: "officer-001",
    now: () => "2026-08-14T10:20:00+07:00",
    persist: () => {},
    onPrepared: payload => { emitted = payload; }
  });
  const prepared = controller.prepareSubmission();
  assert.equal(prepared.ok, false);
  assert.equal(prepared.errors[0].field, "requestedDays");
  assert.match(prepared.errors[0].message, /จำนวนวันที่ขอ/);
  assert.doesNotMatch(prepared.errors[0].message, /requestedDays|MISSING_REQUIRED_FIELD/);
  assert.equal(emitted, null);

  const saved = workspace.saveRequesterWorkspace(cleared.result, {
    actorId: "officer-001",
    at: "2026-08-14T10:21:00+07:00"
  });
  assert.equal(saved.result.requestState.revisions[0].draftPayload.requestedDays, "");
  const validated = workspace.validateRequesterWorkspace(saved.result, {
    actorId: "officer-001",
    at: "2026-08-14T10:22:00+07:00"
  });
  assert.equal(validated.ok, false);
  assert.equal(validated.result.ui.step, 1);
  assert.equal(validated.result.ui.focusTarget, "a5Extension-requestedDays");
  assert.match(validated.result.ui.fieldErrors.requestedDays, /จำนวนวันที่ขอ/);

  const embedded = getEmbeddedWorkspace();
  const previewState = {
    caseData: { id: "case-001", subject: "ตรวจช่องจำนวนวันว่าง" },
    documentData: {},
    workflow: { stage: "a5-prelim", owner: "investigator" },
    assignment: { primaryOfficerId: "officer-001", assignmentVersion: 3, acceptedAssignmentVersion: 3 },
    inquiry: { intake: {}, prelim: { extensionHistory: [] }, inquiry644: {} },
    decisionHistory: []
  };
  embedded.ensureInquiry(previewState);
  const preview = embedded.extensionFormPreviewA5(previewState, cleared.result);
  const previewRequestedDays = preview.match(/ครั้งที่ <span class="a5-fill"[^>]*>[^<]*<\/span> จำนวน <span class="a5-fill"[^>]*>([^<]*)<\/span> วัน นับตั้งแต่/);
  assert.equal(previewRequestedDays?.[1], "");

  const listeners = {};
  const host = {
    innerHTML: "",
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return selector === "[data-a5-extension-save-status]" ? { textContent: "", dataset: {} } : null; },
    querySelectorAll() { return []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model: ready,
    actorId: "officer-001",
    now: () => "2026-08-14T10:23:00+07:00",
    persist: () => {},
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  const field = {
    value: "",
    dataset: { a5ExtensionField: "requestedDays" },
    closest(selector) { return selector === "[data-a5-extension-field]" ? this : null; }
  };
  listeners.input({ target: field });
  assert.equal(mounted.result.controller.getModel().ui.pendingPatch.requestedDays, "");
  mounted.result.dispose();
});

test("READY validation saves a pending blank day before returning the targeted error and never persists stale READY", () => {
  const ready = readyPreliminaryModel();
  const pending = workspace.reduceRequesterWorkspace(ready, {
    type: "SET_FIELDS",
    patch: { requestedDays: "" }
  }).result;

  const direct = workspace.validateRequesterWorkspace(pending, {
    actorId: "officer-001",
    at: "2026-08-14T10:24:00+07:00"
  });
  assert.equal(direct.ok, false);
  assert.equal(direct.result.requestState.status, "DRAFT");
  assert.equal(direct.result.requestState.revisions[0].draftPayload.requestedDays, "");
  assert.equal(direct.result.ui.focusTarget, "a5Extension-requestedDays");
  assert.match(direct.errors[0].field, /requestedDays/);
  assert.match(direct.result.ui.fieldErrors.requestedDays, /จำนวนวันที่ขอ/);

  const persisted = [];
  let emitted = null;
  const controller = workspace.createRequesterController({
    model: pending,
    actorId: "officer-001",
    now: () => "2026-08-14T10:25:00+07:00",
    persist: (model, context) => { persisted.push({ model: structuredClone(model), context: structuredClone(context) }); },
    onPrepared: payload => { emitted = payload; }
  });
  const validated = controller.validate();
  assert.equal(validated.ok, false);
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].model.requestState.status, "DRAFT");
  assert.equal(persisted[0].model.requestState.revisions[0].draftPayload.requestedDays, "");
  assert.equal(persisted[0].context.expectedRequestVersion, ready.requestState.version);
  assert.equal(persisted[0].context.finalRequestVersion, ready.requestState.version + 1);
  assert.equal(controller.getModel().requestState.status, "DRAFT");

  const prepared = controller.prepareSubmission();
  assert.equal(prepared.ok, false);
  assert.equal(prepared.errors[0].field, "requestedDays");
  assert.equal(emitted, null);
});

test("direct READY validation commits one exact final state across valid pending save and validation transitions", () => {
  const ready = readyPreliminaryModel();
  const pending = workspace.reduceRequesterWorkspace(ready, {
    type: "SET_FIELDS",
    patch: { progress: "ความคืบหน้าที่แก้ไขก่อนตรวจซ้ำ" }
  }).result;
  const persisted = [];
  const controller = workspace.createRequesterController({
    model: pending,
    actorId: "officer-001",
    now: () => "2026-08-14T10:26:00+07:00",
    persist: (model, context) => { persisted.push({ model: structuredClone(model), context: structuredClone(context) }); }
  });

  const validated = controller.validate();
  assert.equal(validated.ok, true);
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].model.requestState.status, "READY");
  assert.equal(persisted[0].model.requestState.revisions[0].draftPayload.progress, "ความคืบหน้าที่แก้ไขก่อนตรวจซ้ำ");
  assert.deepEqual(persisted[0].context, {
    operation: "VALIDATE",
    expectedRequestVersion: ready.requestState.version,
    finalRequestVersion: ready.requestState.version + 2
  });
  assert.equal(controller.getModel().requestState.version, ready.requestState.version + 2);
});

test("mounted autosave then validation persists two exact adjacent versions without an intermediate stale write", () => {
  const ready = readyPreliminaryModel();
  ready.ui.step = 3;
  const listeners = {};
  const persisted = [];
  const saveStatus = { textContent: "", dataset: {} };
  const progressControl = { dataset: { a5ExtensionField: "progress" }, value: "แก้ไขผ่าน mounted autosave" };
  const host = {
    innerHTML: "",
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return selector === "[data-a5-extension-save-status]" ? saveStatus : null; },
    querySelectorAll(selector) { return selector === "[data-a5-extension-field]" ? [progressControl] : []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model: ready,
    actorId: "officer-001",
    now: () => "2026-08-14T10:27:00+07:00",
    persist: (model, context) => { persisted.push({ model: structuredClone(model), context: structuredClone(context) }); },
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  listeners.click({
    target: {
      closest(selector) {
        return selector === "[data-a5-extension-action]"
          ? { dataset: { a5ExtensionAction: "validate" } }
          : null;
      }
    }
  });

  assert.equal(persisted.length, 2);
  assert.deepEqual(persisted.map(entry => entry.context), [
    { operation: "AUTOSAVE", expectedRequestVersion: ready.requestState.version, finalRequestVersion: ready.requestState.version + 1 },
    { operation: "VALIDATE", expectedRequestVersion: ready.requestState.version + 1, finalRequestVersion: ready.requestState.version + 2 }
  ]);
  assert.equal(persisted[0].model.requestState.status, "DRAFT");
  assert.equal(persisted[1].model.requestState.status, "READY");
  assert.equal(mounted.result.controller.getModel().requestState.revisions[0].draftPayload.progress, "แก้ไขผ่าน mounted autosave");
  mounted.result.dispose();
});

test("stale concurrent request version rejects the exact final validation state without mutation", () => {
  const embedded = getEmbeddedWorkspace();
  const ready = readyPreliminaryModel();
  const pending = workspace.reduceRequesterWorkspace(ready, {
    type: "SET_FIELDS",
    patch: { progress: "ข้อมูลจากหน้าต่างเดิม" }
  }).result;
  const finalState = workspace.validateRequesterWorkspace(pending, {
    actorId: "officer-001",
    at: "2026-08-14T10:28:00+07:00"
  }).result;
  const concurrent = structuredClone(ready);
  concurrent.requestState.version = ready.requestState.version + 1;
  const concurrentBefore = structuredClone(concurrent);
  const finalBefore = structuredClone(finalState);
  const persistenceContext = {
    operation: "VALIDATE",
    expectedRequestVersion: ready.requestState.version,
    finalRequestVersion: finalState.requestState.version
  };

  const checked = embedded.validateExtensionPersistenceA5?.(concurrent, finalState, persistenceContext);
  assert.equal(checked?.ok, false);
  assert.match(checked.message, /เปลี่ยนแปลงจากหน้าต่างอื่น/);
  assert.deepEqual(concurrent, concurrentBefore);
  assert.deepEqual(finalState, finalBefore);

  let stored = structuredClone(concurrent);
  const controllerBefore = structuredClone(pending);
  const controller = workspace.createRequesterController({
    model: pending,
    actorId: "officer-001",
    now: () => "2026-08-14T10:28:00+07:00",
    persist: (model, context) => {
      const allowed = embedded.validateExtensionPersistenceA5(stored, model, context);
      if (!allowed.ok) throw new Error(allowed.message);
      stored = structuredClone(model);
    }
  });
  const rejected = controller.validate();
  assert.equal(rejected.ok, false);
  assert.match(rejected.errors[0].message, /เปลี่ยนแปลงจากหน้าต่างอื่น/);
  assert.deepEqual(stored, concurrentBefore);
  assert.deepEqual(controller.getModel(), controllerBefore);
});

test("mounted validation focuses the source control after rendering the targeted error", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  model = workspace.reduceRequesterWorkspace(model, { type: "SET_FIELDS", patch: { ...completeFields, reason: "" } }).result;
  model = workspace.saveRequesterWorkspace(model, { actorId: "officer-001", at: "2026-08-14T09:53:00+07:00" }).result;
  for (const code of codes) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }
  model = workspace.saveRequesterWorkspace(model, { actorId: "officer-001", at: "2026-08-14T09:54:00+07:00" }).result;
  model.ui.step = 3;

  const listeners = {};
  let focused = 0;
  const focusControl = { focus: () => { focused += 1; }, scrollIntoView() {} };
  const saveStatus = { textContent: "", dataset: {} };
  const host = {
    innerHTML: "",
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) {
      if (selector === "#a5Extension-reason") return focusControl;
      if (selector === "[data-a5-extension-save-status]") return saveStatus;
      return null;
    },
    querySelectorAll() { return []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model,
    actorId: "officer-001",
    now: () => "2026-08-14T09:55:00+07:00",
    persist: () => {},
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  assert.equal(mounted.ok, true);
  listeners.click({
    target: {
      closest(selector) {
        return selector === "[data-a5-extension-action]"
          ? { dataset: { a5ExtensionAction: "validate" } }
          : null;
      }
    }
  });
  assert.equal(focused, 1);
  mounted.result.dispose();
});

test("clean close reauthorizes live access and persists only an authorized current model", () => {
  const created = workspace.createRequesterWorkspace(createSource()).result;
  created.ui.dirty = false;
  created.ui.saveState = "SAVED";
  let assignmentVersion = 4;
  let persisted = 0;
  let closed = 0;
  const listeners = {};
  const saveStatus = { textContent: "", dataset: {} };
  const host = {
    innerHTML: "",
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return selector === "[data-a5-extension-save-status]" ? saveStatus : null; },
    querySelectorAll() { return []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model: created,
    actorId: "officer-001",
    now: () => "2026-08-14T10:30:00+07:00",
    getAccessContext: () => accessContext(created, {
      assignmentVersion,
      acceptedAssignmentVersion: assignmentVersion
    }),
    persist: () => { persisted += 1; },
    onClose: () => { closed += 1; },
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  const close = () => listeners.click({
    target: {
      closest(selector) {
        return selector === "[data-a5-extension-action]"
          ? { dataset: { a5ExtensionAction: "close" } }
          : null;
      }
    }
  });

  close();
  assert.equal(persisted, 0);
  assert.equal(closed, 0);
  assert.match(saveStatus.textContent, /ข้อมูลมอบหมายเปลี่ยนแปลง|สิทธิ์/);

  assignmentVersion = 3;
  close();
  assert.equal(persisted, 1);
  assert.equal(closed, 1);
  assert.equal(mounted.result.controller.getModel().active, false);
  mounted.result.dispose();
});

test("readiness presents missing, metadata-only, pending, withdrawn, and old-version failures in Thai", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE", "INQUIRY_APPOINTMENT_ORDER"];
  const repository = requirementRepository(codes).filter(item => item.documentType !== "CASE_PLAN");
  repository.find(item => item.documentType === "WORK_LOG").availability = "REFERENCE_ONLY";
  repository.find(item => item.documentType === "RECEIVED_DATE_EVIDENCE").availability = "UPLOAD_PENDING";
  repository.find(item => item.documentType === "INQUIRY_APPOINTMENT_ORDER").availability = "WITHDRAWN";
  let model = workspace.createRequesterWorkspace(createSource({
    extensionType: rules.EXTENSION_TYPES.FULL_INQUIRY,
    reportType: "644",
    repository
  })).result;
  for (const code of codes.slice(1)) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }

  const readiness = workspace.evaluateRequesterReadiness(model);
  assert.equal(readiness.ok, true);
  assert.equal(readiness.result.complete, false);
  assert.match(readiness.result.messages.join(" "), /ยังไม่ได้เลือกเอกสาร/);
  assert.match(readiness.result.messages.join(" "), /มีเฉพาะข้อมูลอ้างอิง/);
  assert.match(readiness.result.messages.join(" "), /รอจัดเก็บไฟล์จริง/);
  assert.match(readiness.result.messages.join(" "), /ถูกถอนแล้ว/);
  assert.doesNotMatch(readiness.result.messages.join(" "), /REFERENCE_ONLY|UPLOAD_PENDING|WITHDRAWN|NO_VERSION_ASSIGNED/);

  const versionedRepository = requirementRepository(codes);
  versionedRepository.push({
    ...versionedRepository[0],
    versionId: "requirement-CASE_PLAN-v2",
    version: 2,
    name: "เอกสาร CASE_PLAN ฉบับล่าสุด",
    createdAt: "2026-08-12T09:00:00+07:00"
  });
  let versioned = workspace.createRequesterWorkspace(createSource({ extensionType: rules.EXTENSION_TYPES.FULL_INQUIRY, reportType: "644", repository: versionedRepository })).result;
  versioned = workspace.reduceRequesterWorkspace(versioned, { type: "ASSIGN_REQUIREMENT", requirementCode: "CASE_PLAN", versionLinks: ["requirement-CASE_PLAN-v1"] }).result;
  versioned = workspace.reduceRequesterWorkspace(versioned, { type: "ASSIGN_REQUIREMENT", requirementCode: "WORK_LOG", versionLinks: ["requirement-WORK_LOG-v1"] }).result;
  versioned = workspace.reduceRequesterWorkspace(versioned, { type: "ASSIGN_REQUIREMENT", requirementCode: "RECEIVED_DATE_EVIDENCE", versionLinks: ["requirement-RECEIVED_DATE_EVIDENCE-v1"] }).result;
  versioned = workspace.reduceRequesterWorkspace(versioned, { type: "ASSIGN_REQUIREMENT", requirementCode: "INQUIRY_APPOINTMENT_ORDER", versionLinks: ["requirement-INQUIRY_APPOINTMENT_ORDER-v1"] }).result;
  assert.match(workspace.evaluateRequesterReadiness(versioned).result.messages.join(" "), /ยืนยันเหตุผลการใช้เวอร์ชันเก่า/);
  versioned = workspace.reduceRequesterWorkspace(versioned, {
    type: "ASSIGN_REQUIREMENT",
    requirementCode: "CASE_PLAN",
    versionLinks: [{ versionId: "requirement-CASE_PLAN-v1", oldVersionConfirmed: true, oldVersionReason: "ฉบับนี้ตรงกับช่วงเวลาที่ขอขยาย" }]
  }).result;
  assert.equal(workspace.evaluateRequesterReadiness(versioned).result.complete, true);
});

test("rendered user text maps form requirement source and status codes to Thai labels", () => {
  const codes = ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"];
  let model = workspace.createRequesterWorkspace(createSource({ repository: requirementRepository(codes) })).result;
  for (const code of codes) {
    model = workspace.reduceRequesterWorkspace(model, {
      type: "ASSIGN_REQUIREMENT",
      requirementCode: code,
      versionLinks: [`requirement-${code}-v1`]
    }).result;
  }
  const visibleText = html => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const adapter = { renderForm: () => "<article>ตัวอย่างแบบคำขอ</article>" };

  model.ui.step = 2;
  const documentText = visibleText(workspace.renderRequesterWorkspace(model, adapter));
  assert.match(documentText, /แบบ ปปท\. 2/);
  assert.match(documentText, /แผนงานคดี/);
  assert.match(documentText, /ระบบสำนวน/);
  assert.match(documentText, /พร้อมใช้/);
  assert.doesNotMatch(documentText, /FORM_2|CASE_PLAN|WORK_LOG|RECEIVED_DATE_EVIDENCE|SYSTEM|AVAILABLE|PENDING_CONFIRMATION/);

  model.ui.step = 4;
  model.ui.showAllDocuments = true;
  const packageText = visibleText(workspace.renderRequesterWorkspace(model, adapter));
  assert.match(packageText, /แบบ ปปท\. 2/);
  assert.match(packageText, /แผนงานคดี · ระบบสำนวน/);
  assert.doesNotMatch(packageText, /FORM_2|CASE_PLAN|WORK_LOG|RECEIVED_DATE_EVIDENCE|SYSTEM|AVAILABLE|PENDING_CONFIRMATION/);
});

test("final requester action prepares and emits an exact payload without submitting the request", () => {
  const ready = readyPreliminaryModel();
  let emitted = null;
  const controller = workspace.createRequesterController({
    model: ready,
    actorId: "officer-001",
    now: () => "2026-08-14T09:32:00+07:00",
    persist: () => {},
    onPrepared: payload => { emitted = structuredClone(payload); }
  });

  const prepared = controller.prepareSubmission();
  assert.equal(prepared.ok, true);
  assert.equal(emitted.requestId, "extension:case-001:1");
  assert.equal(emitted.revisionNo, 1);
  assert.equal(emitted.snapshotPayload.formId, "FORM_2");
  assert.equal(emitted.snapshotPayload.documents.documents.length, 3);
  assert.equal(controller.getModel().requestState.status, "READY");
  assert.equal(controller.getModel().requestState.revisions[0].submittedSnapshot, null);
  assert.equal(prepared.result.eventName, "ecmis:a5-extension-submit-prepared");
});

test("prepared event recomputes current selected assignments and blocks every unavailable exact version", () => {
  const ready = readyPreliminaryModel();
  const unselected = workspace.reduceRequesterWorkspace(ready, {
    type: "SELECT_VISIBLE",
    visibleVersionIds: ["requirement-CASE_PLAN-v1"],
    action: "UNSELECT"
  }).result;
  const deniedUnselected = workspace.prepareRequesterSubmission(unselected, {
    actorId: "officer-001",
    at: "2026-08-14T09:34:00+07:00"
  });
  assert.equal(deniedUnselected.ok, false);
  assert.equal(deniedUnselected.code, "DOCUMENT_SNAPSHOT_FAILED");
  assert.match(deniedUnselected.errors[0].message, /เตรียมชุดเอกสารไม่สำเร็จ|ไม่ได้เลือก|ยังไม่พร้อม/);

  const pending = workspace.reduceRequesterWorkspace(ready, {
    type: "ADD_UPLOAD_METADATA",
    uploads: [{
      metadata: { artifactId: "pending-extra", version: 1, name: "เอกสารรอจัดเก็บ.pdf", documentType: "CASE_PLAN" },
      injection: { versionId: "pending-extra-v1", actorId: "officer-001", at: "2026-08-14T09:35:00+07:00" }
    }]
  }).result;
  let emitted = null;
  const controller = workspace.createRequesterController({
    model: pending,
    actorId: "officer-001",
    now: () => "2026-08-14T09:36:00+07:00",
    persist: () => {},
    onPrepared: payload => { emitted = payload; }
  });
  const deniedPending = controller.prepareSubmission();
  assert.equal(deniedPending.ok, false);
  assert.match(deniedPending.errors[0].message, /รอจัดเก็บไฟล์จริง/);
  assert.equal(emitted, null);
  assert.equal(controller.getModel().requestState.revisions[0].submittedSnapshot, null);
});

test("renders A4-parity two-pane markup with one primary action in every requester step", () => {
  const model = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(20) })).result;
  const adapter = { renderForm: () => '<article data-extension-form-adapter="true">ฟอร์มเดิม</article>' };
  for (const step of [1, 2, 3, 4]) {
    const stepModel = structuredClone(model);
    stepModel.ui.step = step;
    if (step === 4) stepModel.requestState.status = "READY";
    const html = workspace.renderRequesterWorkspace(stepModel, adapter);
    const primaryCount = (html.match(/class="[^"]*\bprimary\b[^"]*"/g) || []).length;

    assert.match(html, /data-a5-extension-workspace/);
    assert.match(html, /document-workspace/);
    assert.match(html, /ws-editor/);
    assert.match(html, /ws-doc-pane/);
    assert.match(html, /A5-001\/2569/);
    assert.match(html, /2026-09-30/);
    assert.match(html, /แบบ ปปท\. 2/);
    assert.doesNotMatch(html.replace(/<[^>]+>/g, " "), /FORM_2/);
    assert.match(html, /data-extension-form-adapter="true"/);
    assert.equal(primaryCount, 1, `step ${step} must expose exactly one primary action`);
  }

  const requestHtml = workspace.renderRequesterWorkspace(model, adapter);
  assert.match(requestHtml, /<textarea[^>]+name="progress"/);
  assert.match(requestHtml, /<textarea[^>]+name="workDone"/);
  assert.match(requestHtml, /<textarea[^>]+name="workRemaining"/);
  assert.match(requestHtml, /<textarea[^>]+name="obstacles"/);
  assert.match(requestHtml, /<textarea[^>]+name="reason"/);

  const documentsModel = structuredClone(model);
  documentsModel.ui.step = 2;
  const documentsHtml = workspace.renderRequesterWorkspace(documentsModel, adapter);
  assert.match(documentsHtml, /type="search"/);
  assert.match(documentsHtml, /ชื่อ\/เลขที่\/เลขอ้างอิง/);
  assert.match(documentsHtml, /ทุกประเภท/);
  assert.match(documentsHtml, /ทุกแหล่งที่มา/);
  assert.match(documentsHtml, /ทุกสถานะ/);
  assert.match(documentsHtml, /เฉพาะเวอร์ชันล่าสุด/);
  assert.match(documentsHtml, /แสดงทุกเวอร์ชัน/);
  assert.match(documentsHtml, /id="a5ExtensionRequirementFilter"/);
  assert.match(documentsHtml, /id="a5ExtensionSortBy"/);
  assert.match(documentsHtml, /id="a5ExtensionSortDirection"/);
  assert.match(documentsHtml, /data-a5-extension-select-visible/);
  assert.match(documentsHtml, /class="a5-extension-row-checkbox"/);
  assert.match(documentsHtml, /data-a5-extension-focus-key="version:version-1"/);
  assert.match(documentsHtml, /<label class="a5-extension-row-checkbox">[\s\S]*?<span class="a5-extension-visually-hidden">เลือก เอกสารประกอบ 001 เวอร์ชัน 1<\/span><\/label>/);
  assert.match(documentsHtml, /เวอร์ชัน 1/);
  assert.match(documentsHtml, /multiple/);
  assert.match(documentsHtml, /ใช้เอกสารเดิม/);
  assert.match(documentsHtml, /อัปโหลดเอกสารใหม่/);
  assert.match(documentsHtml, /หน้าที่ 1 จาก 1/);

  const confirmModel = structuredClone(readyPreliminaryModel());
  confirmModel.ui.step = 4;
  const confirmHtml = workspace.renderRequesterWorkspace(confirmModel, adapter);
  assert.match(confirmHtml, /ดูเอกสารทั้งหมด/);
  assert.match(confirmHtml, />ยืนยันและยื่นคำขอ</);
  assert.match(confirmHtml, /ยังไม่ได้ยื่นคำขอ/);
});

test("embedded A5 loads extension contracts in order and opens the in-page workspace without the old long popup", () => {
  const html = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");
  const source = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");
  const loadOrder = [
    "assets/activity5-extension-rules.js",
    "assets/activity5-extension-workflow.js",
    "assets/activity5-extension-documents.js",
    "assets/activity5-extension-workspace.js",
    "assets/activity5-workspace.js"
  ].map(path => html.indexOf(path));
  assert.equal(loadOrder.every(index => index >= 0), true);
  assert.deepEqual([...loadOrder].sort((left, right) => left - right), loadOrder);
  assert.ok(html.indexOf("assets/activity5-extension-workspace.css") > html.indexOf("assets/activity5-workspace.css"));

  const start = source.indexOf("if (action === 'request-extension')");
  const end = source.indexOf("if (action === 'approve-extension')", start);
  const requestPath = source.slice(start, end);
  assert.match(requestPath, /openExtensionWorkspaceA5/);
  assert.doesNotMatch(requestPath, /await popup|swalForm|Swal\.fire/);
  assert.match(source, /mountRequesterWorkspace/);
  assert.match(source, /A5_EXTENSION_RETURN_FOCUS_ACTION = 'request-extension'/);
  assert.match(source, /requestAnimationFrame[\s\S]*data-a5-action/);
});

test("extension CSS stays scoped, stacks task before documents, contains narrow controls, and uses no fixed overlay", () => {
  const css = readFileSync(new URL("../assets/activity5-extension-workspace.css", import.meta.url), "utf8");
  assert.match(css, /#a5App \.a5-extension-request-workspace/);
  assert.match(css, /@media \(max-width: 1180px\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /\.a5-extension-row-checkbox\s*{[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px;/);
  assert.match(css, /\.a5-extension-repository-bulk label\s*{[\s\S]*?min-width:\s*44px;[\s\S]*?min-height:\s*44px;[\s\S]*?align-items:\s*center;/);
  assert.match(css, /position:\s*sticky/);
  assert.doesNotMatch(css, /position:\s*fixed/);
});

test("requester rerenders restore filter and row-checkbox focus without focusing on initial mount", () => {
  const model = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(2) })).result;
  model.ui.step = 2;
  const listeners = {};
  const saveStatus = { textContent: "", dataset: {} };
  const documentState = { activeElement: null };
  let replacement = null;
  let focusCount = 0;
  const makeControl = ({ id = "", key = "" } = {}) => ({
    id,
    dataset: key ? { a5ExtensionFocusKey: key } : {},
    focus() { focusCount += 1; documentState.activeElement = this; }
  });
  const host = {
    innerHTML: "",
    ownerDocument: documentState,
    contains: control => Boolean(control),
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return selector === "[data-a5-extension-save-status]" ? saveStatus : null; },
    querySelectorAll(selector) { return selector === "[data-a5-extension-focus-key], [id]" && replacement ? [replacement] : []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model,
    actorId: "officer-001",
    now: () => "2026-08-14T11:00:00+07:00",
    persist: () => {},
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  assert.equal(focusCount, 0);

  documentState.activeElement = makeControl({ id: "a5ExtensionTypeFilter" });
  replacement = makeControl({ id: "a5ExtensionTypeFilter" });
  listeners.change({ target: { id: "a5ExtensionTypeFilter", value: "CASE_PLAN", matches: () => false } });
  assert.equal(focusCount, 1);

  documentState.activeElement = makeControl({ key: "version:version-1" });
  replacement = makeControl({ key: "version:version-1" });
  listeners.change({
    target: {
      checked: true,
      dataset: { a5ExtensionVersion: "version-1", a5ExtensionFocusKey: "version:version-1" },
      matches: selector => selector === "[data-a5-extension-version]"
    }
  });
  assert.equal(focusCount, 2);
  mounted.result.dispose();
});

test("requester search rerender restores focus and the exact text selection", async () => {
  const model = workspace.createRequesterWorkspace(createSource({ repository: repositoryOf(2) })).result;
  model.ui.step = 2;
  const listeners = {};
  let focusCount = 0;
  let restoredSelection = null;
  const activeSearch = {
    id: "a5ExtensionSearch",
    dataset: { a5ExtensionFocusKey: "repository-search" },
    value: "เอกสาร",
    selectionStart: 2,
    selectionEnd: 5,
    selectionDirection: "forward"
  };
  const replacementSearch = {
    id: "a5ExtensionSearch",
    dataset: { a5ExtensionFocusKey: "repository-search" },
    focus() { focusCount += 1; },
    setSelectionRange(start, end, direction) { restoredSelection = [start, end, direction]; }
  };
  const host = {
    innerHTML: "",
    ownerDocument: { activeElement: activeSearch },
    contains: () => true,
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return selector === "[data-a5-extension-save-status]" ? { textContent: "", dataset: {} } : null; },
    querySelectorAll(selector) { return selector === "[data-a5-extension-focus-key], [id]" ? [replacementSearch] : []; }
  };
  const mounted = workspace.mountRequesterWorkspace(host, {
    model,
    actorId: "officer-001",
    now: () => "2026-08-14T11:01:00+07:00",
    persist: () => {},
    renderForm: () => "<article>แบบคำขอ</article>"
  });
  assert.equal(focusCount, 0);
  listeners.input({ target: activeSearch });
  await new Promise(resolve => setTimeout(resolve, 220));
  assert.equal(focusCount, 1);
  assert.deepEqual(restoredSelection, [2, 5, "forward"]);
  mounted.result.dispose();
});

test("reviewer validation rerender focuses and scrolls the exact invalid Thai-reason field", () => {
  const reviewerContract = {
    status: "CONFIRMED", requestId: "EXT-UI-REVIEW-001", revisionNo: 1,
    extensionType: "PRELIMINARY_INQUIRY", roundNo: 1, unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR",
    reviewerId: "reviewer-001", reviewerRole: "director", assignmentId: "ui-assignment", assignmentVersion: 1,
    effectiveDate: "2026-08-14", actingForTier: null, authorityStatus: "CONFIRMED", dayPolicyStatus: "CONFIRMED",
    canApprove: true, maxApprovedDays: 60, routePolicyVersion: "a5-extension-route-2026-08-15"
  };
  const snapshot = {
    draftPayload: { reason: "เหตุผลเดิม", requestedDays: 30 },
    payload: { deadline: { currentDeadline: "2026-09-30", requestedDays: 30 }, documents: { documents: [], requirementAssignments: {} }, routing: reviewerContract }
  };
  const opened = review.createReviewerWorkspace({
    requestState: {
      id: "EXT-UI-REVIEW-001",
      status: "IN_REVIEW",
      activeRevisionNo: 1,
      version: 2,
      currentDeadline: "2026-09-30",
      revisions: [{ revisionNo: 1, submittedSnapshot: snapshot }]
    },
    reviewerContract,
    authorityRegistry: { schemaVersion: 1, version: 1, assignments: [{ assignmentId: "ui-assignment", unitKey: "เขต-2", authorityTier: "UNIT_DIRECTOR", actorId: "reviewer-001", actorRole: "director", status: "ACTIVE", effectiveFrom: "2026-01-01", effectiveTo: null, actingForTier: null }] }
  });
  const listeners = {};
  let focused = 0;
  let scrolled = 0;
  const reasonControl = { focus: () => { focused += 1; }, scrollIntoView: () => { scrolled += 1; } };
  const values = {
    "#a5ExtensionReviewDecision": { value: "REJECT" },
    "#a5ExtensionReviewReason": { value: "reason", ...reasonControl },
    "#a5ExtensionReviewField": { value: "" },
    "#a5ExtensionReviewDocument": { value: "" }
  };
  const host = {
    innerHTML: "",
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) { return values[selector] || null; }
  };
  review.mountReviewerWorkspace(host, {
    model: opened.result,
    actorId: "reviewer-001",
    actorRole: "director",
    now: () => "2026-08-14T11:02:00+07:00",
    persist: () => {}
  });
  listeners.click({ target: { closest: selector => selector === "[data-a5-extension-review-action]" ? { dataset: { a5ExtensionReviewAction: "submit-decision" } } : null } });
  assert.equal(focused, 1);
  assert.equal(scrolled, 1);
  assert.match(host.innerHTML, /กรุณาระบุเหตุผลเป็นภาษาไทย/);
});

test("terminal reviewer states render a read-only outcome without a decision form or mutation primary", () => {
  const snapshot = { draftPayload: {}, payload: { documents: { documents: [] } } };
  for (const status of ["RETURNED", "REJECTED", "APPROVED"]) {
    const model = {
      requestState: {
        id: `EXT-${status}`,
        status,
        activeRevisionNo: 1,
        reviewOutcome: { reason: "ผลพิจารณาภาษาไทย", approvedDays: status === "APPROVED" ? 20 : undefined }
      },
      submittedSnapshot: snapshot,
      reviewDecisions: [],
      ui: {}
    };
    const html = review.renderReviewerWorkspace(model);
    assert.match(html, /a5-extension-review-outcome/);
    assert.match(html, /ข้อมูลอ่านอย่างเดียว/);
    assert.doesNotMatch(html, /a5-extension-review-decision|submit-decision|class="[^"]*primary/);
  }
});
