import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const documents = require("../assets/activity5-document-domain.js");

test("normalization migrates the legacy preliminary report additively and is idempotent", () => {
  const legacy = {
    caseData: { id: "ECMIS-A5-001" },
    inquiry: { prelim: { report: "ข้อความรายงานเดิม" } }
  };

  const first = documents.normalizeA5DocumentStore(legacy);
  assert.equal(first.ok, true);
  assert.equal(first.code, "DOCUMENT_STORE_NORMALIZED");
  assert.equal(first.state.inquiry.prelim.report, "ข้อความรายงานเดิม");
  assert.deepEqual(first.state.a5DocumentStore.records, [{
    documentId: "FORM_4_REPORT_213",
    caseId: "ECMIS-A5-001",
    revisionNo: 1,
    baseRevisionNo: null,
    status: "DRAFT",
    schemaVersion: 1,
    payload: { legacyReportText: "ข้อความรายงานเดิม" },
    source: { fileName: "4. แบบรายงานผลการไต่สวนเบื้องต้น.pdf", pages: [1, 6] },
    submittedSnapshot: null,
    reviewHistory: [],
    createdBy: "เอกสารไม่ระบุ",
    createdAt: "",
    updatedBy: "เอกสารไม่ระบุ",
    updatedAt: ""
  }]);
  assert.equal(first.state.a5DocumentStore.version, 1);
  assert.deepEqual(legacy, {
    caseData: { id: "ECMIS-A5-001" },
    inquiry: { prelim: { report: "ข้อความรายงานเดิม" } }
  });

  const second = documents.normalizeA5DocumentStore(first.state);
  assert.deepEqual(second.state, first.state);
});

test("normalization blocks only the document migration when a legacy report lacks a case id", () => {
  const legacy = { inquiry: { prelim: { report: "ข้อความเดิม" } } };
  const result = documents.normalizeA5DocumentStore(legacy);

  assert.equal(result.ok, false);
  assert.equal(result.code, "MISSING_REQUIRED_FIELD");
  assert.equal(result.focusTarget, "caseData.id");
  assert.deepEqual(result.state, legacy);
  assert.deepEqual(Object.keys(result).sort(), ["code", "errors", "focusTarget", "ok", "state"]);
});

function emptyCase() {
  return { caseData: { id: "ECMIS-A5-002" } };
}

function draftCommand(overrides = {}) {
  return {
    caseId: "ECMIS-A5-002",
    documentId: "FORM_1_CASE_PLAN",
    expectedVersion: 0,
    actorId: "officer-1",
    at: "2026-08-14T09:00:00.000Z",
    idempotencyKey: "create-form-1-v1",
    payload: { objective: "รวบรวมพยานหลักฐาน" },
    source: { fileName: "1. แบบแผนงานคดี.pdf", pages: [1, 4] },
    ...overrides
  };
}

test("command without case identity returns a failure envelope instead of throwing", () => {
  const source = {};
  const result = documents.createA5DocumentDraft(source, draftCommand());

  assert.equal(result.ok, false);
  assert.equal(result.code, "MISSING_REQUIRED_FIELD");
  assert.equal(result.focusTarget, "caseData.id");
  assert.deepEqual(result.state, source);
});

test("every failed command against an unnormalized legacy state returns the original source state", () => {
  const legacy = {
    caseData: { id: "ECMIS-A5-LEGACY" },
    inquiry: { prelim: { report: "ข้อความรายงานเดิม" } }
  };
  const staleCommand = {
    caseId: "ECMIS-A5-LEGACY",
    documentId: "FORM_4_REPORT_213",
    revisionNo: 1,
    expectedVersion: 0,
    actorId: "officer-1",
    at: "2026-08-14T09:00:00.000Z",
    idempotencyKey: "legacy-stale-command",
    payload: { objective: "ไม่ควรถูกบันทึก" },
    source: { fileName: "4. แบบรายงานผลการไต่สวนเบื้องต้น.pdf", pages: [1, 6] },
    reason: "ไม่ควรถูกใช้"
  };
  const commands = [
    documents.createA5DocumentDraft,
    documents.saveA5DocumentDraft,
    documents.submitA5DocumentRevision,
    documents.returnA5DocumentRevision
  ];

  for (const command of commands) {
    const before = structuredClone(legacy);
    const result = command(legacy, staleCommand);
    assert.equal(result.ok, false);
    assert.equal(result.code, "VERSION_CONFLICT");
    assert.deepEqual(result.state, before);
    assert.deepEqual(legacy, before);
  }

  const invalidPayload = documents.createA5DocumentDraft(legacy, {
    ...staleCommand,
    documentId: "FORM_1_CASE_PLAN",
    expectedVersion: 1,
    idempotencyKey: "legacy-invalid-payload",
    payload: []
  });
  assert.equal(invalidPayload.ok, false);
  assert.equal(invalidPayload.code, "INVALID_PAYLOAD");
  assert.deepEqual(invalidPayload.state, legacy);

  const invalidSource = documents.createA5DocumentDraft(legacy, {
    ...staleCommand,
    documentId: "FORM_1_CASE_PLAN",
    expectedVersion: 1,
    idempotencyKey: "legacy-invalid-source",
    source: { fileName: "1. แบบแผนงานคดี.pdf", pages: [4, 1] }
  });
  assert.equal(invalidSource.ok, false);
  assert.equal(invalidSource.code, "INVALID_SOURCE");
  assert.deepEqual(invalidSource.state, legacy);
});

test("create and save use optimistic versions, deep clones, and idempotent receipts", () => {
  const initial = emptyCase();
  const created = documents.createA5DocumentDraft(initial, draftCommand());
  assert.equal(created.ok, true);
  assert.equal(created.code, "DOCUMENT_DRAFT_CREATED");
  assert.equal(created.state.a5DocumentStore.version, 1);
  assert.equal(created.state.a5DocumentStore.records[0].revisionNo, 1);
  assert.deepEqual(initial, emptyCase());

  const replayed = documents.createA5DocumentDraft(created.state, draftCommand());
  assert.equal(replayed.ok, true);
  assert.equal(replayed.code, "DOCUMENT_DRAFT_CREATED_REPLAYED");
  assert.deepEqual(replayed.state, created.state);

  const staleBefore = structuredClone(created.state);
  const stale = documents.saveA5DocumentDraft(created.state, {
    ...draftCommand({ idempotencyKey: "save-form-1-stale", expectedVersion: 0 }),
    revisionNo: 1,
    payload: { objective: "ข้อมูลล้าสมัย" }
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.code, "VERSION_CONFLICT");
  assert.deepEqual(stale.state, staleBefore);
  assert.deepEqual(created.state, staleBefore);

  const saved = documents.saveA5DocumentDraft(created.state, {
    ...draftCommand({ idempotencyKey: "save-form-1-v1", expectedVersion: 1 }),
    revisionNo: 1,
    payload: { objective: "แก้ไขแผน", nested: { stable: true } }
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.state.a5DocumentStore.version, 2);
  assert.deepEqual(created.state.a5DocumentStore.records[0].payload, { objective: "รวบรวมพยานหลักฐาน" });
});

test("submission freezes an immutable snapshot and return creates a correction revision atomically", () => {
  const created = documents.createA5DocumentDraft(emptyCase(), draftCommand());
  const context = { reviewer: { name: "ผู้ตรวจ" } };
  const submitted = documents.submitA5DocumentRevision(created.state, {
    ...draftCommand({ idempotencyKey: "submit-form-1-v1", expectedVersion: 1 }),
    revisionNo: 1,
    submissionContext: context
  });
  assert.equal(submitted.ok, true);
  const snapshot = submitted.state.a5DocumentStore.records[0].submittedSnapshot;
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.submissionContext.reviewer), true);
  assert.equal(Object.isFrozen(snapshot.source.pages), true);
  context.reviewer.name = "ถูกแก้ภายหลัง";
  assert.equal(snapshot.submissionContext.reviewer.name, "ผู้ตรวจ");

  const returned = documents.returnA5DocumentRevision(submitted.state, {
    ...draftCommand({ idempotencyKey: "return-form-1-v1", expectedVersion: 2 }),
    revisionNo: 1,
    reason: "กรุณาเพิ่มรายละเอียด",
    affectedFields: ["objective"]
  });
  assert.equal(returned.ok, true);
  assert.equal(returned.state.a5DocumentStore.version, 3);
  assert.equal(returned.state.a5DocumentStore.records[0].status, "RETURNED");
  assert.equal(returned.state.a5DocumentStore.records[1].status, "DRAFT");
  assert.equal(returned.state.a5DocumentStore.records[1].baseRevisionNo, 1);
  assert.deepEqual(returned.state.a5DocumentStore.records[1].payload, snapshot.payload);
  assert.notEqual(returned.state.a5DocumentStore.records[1].payload, snapshot.payload);

  const rejected = documents.saveA5DocumentDraft(returned.state, {
    ...draftCommand({ idempotencyKey: "save-returned-v1", expectedVersion: 3 }),
    revisionNo: 1,
    payload: { objective: "ห้ามแก้ฉบับเดิม" }
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "REVISION_NOT_FOUND");
});

test("a reused idempotency key with another command is rejected without mutation", () => {
  const created = documents.createA5DocumentDraft(emptyCase(), draftCommand());
  const before = structuredClone(created.state);
  const rejected = documents.saveA5DocumentDraft(created.state, {
    ...draftCommand({ expectedVersion: 1 }),
    revisionNo: 1,
    payload: { objective: "key ซ้ำ" }
  });

  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "IDEMPOTENCY_KEY_REUSED");
  assert.deepEqual(rejected.state, before);
  assert.deepEqual(created.state, before);
});

test("workflow normalization consumes the loaded document domain without changing legacy report text", () => {
  const workflow = require("../assets/activity5-workflow.js");
  const normalized = workflow.normalizeA5State({
    caseData: { id: "ECMIS-A5-003" },
    workflow: { stage: "a5-prelim" },
    inquiry: { prelim: { report: "รายงานเดิม" } }
  });
  const html = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");

  assert.equal(normalized.inquiry.prelim.report, "รายงานเดิม");
  assert.equal(normalized.a5DocumentStore.records[0].documentId, "FORM_4_REPORT_213");
  assert.ok(html.indexOf("activity5-document-domain.js") < html.indexOf("activity5-workflow.js"));
});
