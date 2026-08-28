import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const report = require("../assets/activity5-report-213.js");
const planWorklog = require("../assets/activity5-plan-worklog.js");

test("case plan and report 213 explain every writable text and date field with placeholders", () => {
  const planHtml = planWorklog.renderCasePlanEditorA5({}, {}, { editable: true });
  assert.match(planHtml, /data-a5-plan-bind="caseMetadata\.subject"[^>]+placeholder="เช่น ขอให้ตรวจสอบการจัดซื้ออุปกรณ์สำนักงาน"/);
  assert.match(planHtml, /data-a5-plan-bind="eventContext\.occurredAtPlace"[^>]+placeholder="เช่น 10 ส\.ค\. 2569 เวลา 10\.00 น\. ณ สำนักงาน\.\.\."/);
  assert.match(planHtml, /data-a5-plan-bind="limitationDates\.limitationRows\.0\.section"[^>]+placeholder="เช่น มาตรา 157"/);
  assert.match(planHtml, /data-a5-plan-row-field="action"[^>]+placeholder="ระบุงานที่จะดำเนินการ เช่น สอบพยานหรือขอเอกสาร"/);
  assert.match(planHtml, /เลือกวันที่จากปฏิทิน/);
  assert.doesNotMatch(planHtml, /ระบบบันทึกเป็น YYYY-MM-DD/);

  const state = report.normalizeReport213A5({ caseData: { id: "ECMIS-213-PLACEHOLDERS" }, assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" }, inquiry: { intake: {}, prelim: {} } }).state;
  let payload = state.a5DocumentStore.records[0].payload;
  payload = report.mutateReport213RowsA5(payload, { path: "complainants", action: "add" });
  const reportHtml = report.renderReport213EditorA5(payload, { editable: true });
  assert.match(reportHtml, /data-a5-report-bind="receipt\.sourceReference"[^>]+placeholder="เช่น เลขรับเรื่องหรือเลขอ้างอิงจากระบบต้นทาง"|placeholder="เช่น เลขรับเรื่องหรือเลขอ้างอิงจากระบบต้นทาง"[^>]+data-a5-report-bind="receipt\.sourceReference"/);
  assert.match(reportHtml, /data-a5-report-row-field="address"[^>]+placeholder="ระบุที่อยู่ที่ติดต่อได้"|placeholder="ระบุที่อยู่ที่ติดต่อได้"[^>]+data-a5-report-row-field="address"/);
  assert.match(reportHtml, /data-a5-report-bind="opinion\.finding"[^>]+placeholder="ระบุความเห็นว่าควรรับไว้ไต่สวนหรือดำเนินการอย่างไร"|placeholder="ระบุความเห็นว่าควรรับไว้ไต่สวนหรือดำเนินการอย่างไร"[^>]+data-a5-report-bind="opinion\.finding"/);
  assert.match(reportHtml, /เลือกวันที่จากปฏิทิน/);
  assert.doesNotMatch(reportHtml, /ระบบบันทึกเป็น YYYY-MM-DD/);
});

test("case plan validation names missing fields and ignores untouched helper rows", () => {
  const incomplete = {
    schemaVersion: 1,
    caseMetadata: { caseId: "CASE-PLAN-UX", receivedAt: "", complainant: "", allegation: "" },
    eventContext: { occurredAtPlace: "" },
    limitationDates: { preliminaryDeadlineAt: "" },
    accusedRows: [], fourIssues: [], requiredEvidenceActions: [], witnesses: [], requestedDocuments: [], otherOperations: [], scheduleRows: [],
    signatures: { owner: { signedAt: "" }, assistant: {} }
  };
  const missing = planWorklog.validateCasePlanA5(incomplete, { intent: "SUBMIT" });
  assert.equal(missing.ok, false);
  assert.equal(missing.errors.find(item => item.field === "caseMetadata.receivedAt")?.message, "ยังไม่ได้กรอกวันที่รับเรื่อง");
  assert.equal(missing.errors.find(item => item.field === "eventContext.occurredAtPlace")?.message, "ยังไม่ได้กรอกวัน เวลา หรือสถานที่เกิดเหตุ");
  assert.equal(missing.errors.find(item => item.field === "limitationDates.preliminaryDeadlineAt")?.message, "ยังไม่ได้กรอกวันครบกำหนด 60 วัน");

  const complete = {
    schemaVersion: 1,
    caseMetadata: { caseId: "CASE-PLAN-UX", receivedAt: "2026-08-10", complainant: "นาย ก.", allegation: "ข้อกล่าวหา" },
    eventContext: { occurredAtPlace: "สำนักงาน ก. วันที่ 10 สิงหาคม 2569" },
    limitationDates: { preliminaryDeadlineAt: "2026-10-09" },
    accusedRows: [{ name: "นาย ข.", fourIssues: ["สถานะ", "อำนาจหน้าที่", "การกระทำความผิด", "ความเสียหาย"].map(issue => ({ issue, details: "รายละเอียด" })), requiredEvidenceActions: [{ requiredEvidence: "เอกสาร", action: "ขอเอกสาร" }] }],
    fourIssues: [], requiredEvidenceActions: [],
    witnesses: [{ name: "", relevance: "", issues: "" }],
    requestedDocuments: [{ name: "", agency: "" }],
    otherOperations: [{ description: "" }],
    scheduleRows: [{ date: "2026-08-21", action: "สอบพยาน" }],
    signatures: { owner: { signedAt: "2026-08-21T01:33:00Z" }, assistant: {} }
  };
  assert.equal(planWorklog.validateCasePlanA5(complete, { intent: "SUBMIT" }).ok, true);
});

test("case plan reuses ISO receipt date and incident place from the intake record", () => {
  const normalized = planWorklog.normalizeCasePlanA5({
    caseData: { id: "seed-admin-registry-letter-002", received: "10 สิงหาคม 2569 14:20 น.", receivedAt: "2026-08-10T14:20:00+07:00", place: "สำนักงานบริหารงานส่วนกลางตัวอย่าง กรุงเทพมหานคร" },
    inquiry: { intake: {}, prelim: { deadlineAt: "2026-10-09" } },
    assignment: {}
  });
  assert.equal(normalized.state.a5CasePlan.caseMetadata.receivedAt, "2026-08-10");
  assert.equal(normalized.state.a5CasePlan.eventContext.occurredAtPlace, "สำนักงานบริหารงานส่วนกลางตัวอย่าง กรุงเทพมหานคร");
  assert.equal(normalized.state.a5CasePlan.limitationDates.preliminaryDeadlineAt, "2026-10-09");
});

test("director approval is attached to the submitted plan without changing its snapshot", () => {
  const normalized = planWorklog.normalizeCasePlanA5({
    caseData: { id: "CASE-PLAN-APPROVAL" },
    workflow: { stage: "a5-prelim" },
    inquiry: { intake: {}, prelim: {} },
    assignment: { primaryOfficerId: "owner-1", primaryOfficerName: "เจ้าของสำนวน" }
  }).state;
  const planRecord = normalized.a5DocumentStore.records.find(item => item.documentId === planWorklog.FORM_ID);
  planRecord.payload = {
    ...planRecord.payload,
    caseMetadata: { ...planRecord.payload.caseMetadata, caseId: "CASE-PLAN-APPROVAL", receivedAt: "2026-08-10", complainant: "นาย ก.", allegation: "ข้อกล่าวหา" },
    eventContext: { occurredAtPlace: "สำนักงาน ก." },
    limitationDates: { preliminaryDeadlineAt: "2026-10-09", limitationRows: [] },
    accusedRows: [{ name: "นาย ข.", fourIssues: ["สถานะ", "อำนาจหน้าที่", "การกระทำความผิด", "ความเสียหาย"].map(issue => ({ issue, details: "รายละเอียด" })), requiredEvidenceActions: [{ requiredEvidence: "เอกสาร", action: "ขอเอกสาร" }] }],
    fourIssues: [], requiredEvidenceActions: [], witnesses: [], requestedDocuments: [], otherOperations: [], scheduleRows: [{ date: "2026-08-21", action: "สอบพยาน" }],
    signatures: { ...planRecord.payload.signatures, owner: { officerId: "owner-1", officerName: "เจ้าของสำนวน", signedAt: "2026-08-21T01:00:00Z" } }
  };
  const submitted = planWorklog.submitCasePlanA5(normalized, { expectedVersion: normalized.a5DocumentStore.version, actorId: "owner-1", at: "2026-08-21T02:00:00Z", idempotencyKey: "submit-plan-approval-test" });
  assert.equal(submitted.ok, true);
  const beforeApproval = structuredClone(submitted.state.a5DocumentStore.records.find(item => item.documentId === planWorklog.FORM_ID).submittedSnapshot);
  const approved = planWorklog.approveCasePlanA5(submitted.state, { expectedVersion: submitted.state.a5DocumentStore.version, actorId: "director-1", actorName: "ผอ.เขต 1", positionName: "ผู้อำนวยการสำนักงาน ป.ป.ท. เขต 1", at: "2026-08-21T03:00:00Z", idempotencyKey: "approve-plan-test" });
  assert.equal(approved.ok, true);
  const approvedRecord = approved.state.a5DocumentStore.records.find(item => item.documentId === planWorklog.FORM_ID);
  assert.deepEqual(approvedRecord.submittedSnapshot, beforeApproval);
  assert.equal(approvedRecord.status, "APPROVED");
  assert.equal(approved.state.a5CasePlan.signatures.head.officerName, "ผอ.เขต 1");
  assert.equal(approved.state.a5CasePlan.signatures.head.signedAt, "2026-08-21T03:00:00Z");
});

test("approved plan is read only while worklog remains available", () => {
  const html = planWorklog.renderCasePlanEditorA5({ signatures: { owner: {}, assistant: {}, head: { officerName: "ผอ.เขต 1", signedAt: "2026-08-21T03:00:00Z" } } }, { entries: [] }, { editable: true, planEditable: false, worklogEditable: true });
  assert.match(html, /data-a5-plan-bind="caseMetadata\.subject"[^>]* disabled/);
  assert.doesNotMatch(html, /data-a5-plan-action="sign-owner"/);
  assert.match(html, /data-a5-plan-action="worklog-add"/);
  assert.match(html, /ผู้อำนวยการสำนักงาน ป\.ป\.ท\. เขต: ลงนามแล้ว/);
});

test("worklog validation names the exact missing field", () => {
  const normalized = planWorklog.normalizeCasePlanA5({
    caseData: { id: "CASE-WORKLOG-VALIDATION" },
    workflow: { stage: "a5-prelim" },
    inquiry: { intake: {}, prelim: {} },
    assignment: { primaryOfficerId: "owner-1", primaryOfficerName: "เจ้าของสำนวน" }
  }).state;
  const result = planWorklog.appendWorklogEntryA5(normalized, {
    expectedVersion: normalized.a5DocumentStore.version,
    actorId: "owner-1",
    actorName: "เจ้าของสำนวน",
    at: "2026-08-21T04:00:00Z",
    idempotencyKey: "worklog-validation-test",
    entry: {
      entryId: "entry-1",
      occurredAt: "2026-08-21T03:00",
      activityType: "",
      description: "สอบพยาน",
      result: "ได้รับข้อเท็จจริง",
      relatedDocumentVersionIds: []
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.focusTarget, "activityType");
  assert.equal(result.errors[0].message, "ยังไม่ได้กรอกประเภทการดำเนินการ");
});

test("investigator can append a new worklog entry after submitting the previous revision", () => {
  let state = planWorklog.normalizeCasePlanA5({
    caseData: { id: "CASE-WORKLOG-NEXT-REVISION" },
    workflow: { stage: "a5-prelim" },
    inquiry: { intake: {}, prelim: {} },
    assignment: { primaryOfficerId: "owner-1", primaryOfficerName: "เจ้าของสำนวน" }
  }).state;
  const command = (entryId, hour) => ({
    expectedVersion: state.a5DocumentStore.version,
    actorId: "owner-1",
    actorName: "เจ้าของสำนวน",
    at: `2026-08-21T0${hour}:30:00Z`,
    idempotencyKey: `append-${entryId}`,
    entry: {
      entryId,
      occurredAt: `2026-08-21T0${hour}:00`,
      activityType: "สอบพยาน",
      description: `รายละเอียด ${entryId}`,
      result: `ผล ${entryId}`,
      relatedDocumentVersionIds: []
    }
  });

  let result = planWorklog.appendWorklogEntryA5(state, command("entry-1", 1));
  assert.equal(result.ok, true);
  state = result.state;
  result = planWorklog.submitWorklogA5(state, {
    expectedVersion: state.a5DocumentStore.version,
    actorId: "owner-1",
    at: "2026-08-21T02:00:00Z",
    idempotencyKey: "submit-entry-1"
  });
  assert.equal(result.ok, true);
  state = result.state;
  result = planWorklog.appendWorklogEntryA5(state, command("entry-2", 3));

  assert.equal(result.ok, true);
  assert.equal(result.state.a5Worklog.entries.at(-1).entryId, "entry-2");
  const revisions = result.state.a5DocumentStore.records.filter(record => record.documentId === planWorklog.WORKLOG_ID);
  assert.equal(revisions.length, 2);
  assert.equal(revisions[0].status, "SUBMITTED");
  assert.equal(revisions[1].status, "DRAFT");
});

test("worklog actions surface localStorage quota failures", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  assert.match(workspace, /function persistA5WorklogState\(/);
  assert.match(workspace, /พื้นที่จัดเก็บข้อมูลของ Browser เต็ม/);
  assert.match(workspace, /readA5WorklogActionState/);
});

test("report 213 keeps the active group after row mutation and full detail rerender", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  assert.match(workspace, /const A5_REPORT_GROUP_BY_CASE = new Map\(\)/);
  assert.match(workspace, /A5_REPORT_GROUP_BY_CASE\.set\(state\.caseData\.id, id\)/);
  assert.match(workspace, /activateA5ReportGroup\(A5_REPORT_GROUP_BY_CASE\.get\(state\.caseData\.id\) \|\| 'g1'\)/);
  assert.match(workspace, /const activeReportGroupId = editor\.querySelector\('\[data-a5-report-group\]\[aria-current="step"\]'\)/);
  assert.match(workspace, /activateA5ReportGroup\(activeReportGroupId\)/);
});

test("report 213 submission error opens and focuses the first invalid section", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  assert.match(workspace, /function focusReport213SubmissionErrorA5\(/);
  assert.match(workspace, /if \(action === 'report-213-submit'\)[\s\S]*focusReport213SubmissionErrorA5\(result, reportApi/);
});

test("plan submit error handler lists missing items and focuses the exact plan control", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  assert.match(workspace, /function presentCasePlanValidationA5\(/);
  assert.match(workspace, /function focusCasePlanValidationA5\(/);
  assert.match(workspace, /data-a5-plan-bind/);
  assert.match(workspace, /ยังขาดข้อมูล/);
  assert.match(workspace, /function planStatusLabelA5\(/);
  assert.match(workspace, /planEditable/);
  assert.match(workspace, /approveCasePlanA5/);
  assert.match(workspace, /confirmA5PlanSignature\(st, \{ name: actorName \}, 'head'\)/);
});

test("editor presents navigable canonical sections and hides mutation controls for read-only users", () => {
  const state = report.normalizeReport213A5({ caseData: { id: "ECMIS-213-UI", subject: "เรื่องทดสอบ" }, assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" }, inquiry: { intake: {}, prelim: {} } }).state;
  const payload = state.a5DocumentStore.records[0].payload;
  const editable = report.renderReport213EditorA5(payload, { editable: true });
  const readOnly = report.renderReport213EditorA5(payload, { editable: false });
  assert.match(editable, /aria-current="step"/);
  assert.match(editable, /data-a5-report-bind="opinion\.finding"/);
  assert.match(editable, /data-a5-report-row-list="complainants"/);
  assert.match(editable, /data-a5-report-row-list="analysis\.allegationAnalyses"/);
  assert.equal((editable.match(/data-a5-report-section-body=/g) || []).length, 18);
  assert.match(editable, /data-a5-report-action="save"/);
  assert.match(editable, /data-a5-report-row-action="add"/);
  assert.doesNotMatch(editable, /data-a5-report-json=/);
  assert.doesNotMatch(readOnly, /data-a5-report-action="save"/);
  assert.doesNotMatch(readOnly, /data-a5-report-row-action=/);
  assert.doesNotMatch(readOnly, /<(?:input|select|textarea|button)\b/);
  assert.doesNotMatch(editable, /owner|FORM_4_REPORT_213/);
});

test("editable report exposes one top command bar with completion and draft actions", () => {
  const state = report.normalizeReport213A5({ caseData: { id: "ECMIS-213-COMMAND" }, assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" }, inquiry: { intake: {}, prelim: {} } }).state;
  const payload = state.a5DocumentStore.records[0].payload;
  const html = report.renderReport213EditorA5(payload, { editable: true, layout: "full" });

  assert.match(html, /<header class="a5r-command-bar"><div class="a5r-command-summary">[\s\S]*รายงานผลการไต่สวนเบื้องต้น \(แบบ ปปท\. 4\)[\s\S]*role="progressbar"[\s\S]*<\/div><div class="a5r-command-actions">[\s\S]*data-a5-report-action="validate"[\s\S]*data-a5-report-action="save"[\s\S]*<\/div><\/header>/);
  assert.match(html, /<progress class="a5r-command-meter"[^>]+max="100"[^>]+value="\d+"[^>]*>/);
  assert.equal((html.match(/data-a5-report-action="validate"/g) || []).length, 1);
  assert.equal((html.match(/data-a5-report-action="save"/g) || []).length, 1);
  assert.doesNotMatch(html, /class="a5r-actions"/);
});

test("editable report uses a horizontal seven-group navigator above flat numbered sections", () => {
  const state = report.normalizeReport213A5({ caseData: { id: "ECMIS-213-RAIL" }, assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" }, inquiry: { intake: {}, prelim: {} } }).state;
  const payload = state.a5DocumentStore.records[0].payload;
  const html = report.renderReport213EditorA5(payload, { editable: true, layout: "full" });
  const css = readFileSync(new URL("../assets/activity5-document-workspace.css", import.meta.url), "utf8");

  assert.match(html, /<div class="a5r-edit-layout"><nav class="a5r-tabs a5r-rail"[\s\S]*<div class="a5r-form">/);
  assert.equal((html.match(/data-a5-report-group="/g) || []).length, 7);
  assert.equal((html.match(/class="a5r-tab-status"/g) || []).length, 7);
  assert.equal((html.match(/class="a5r-tab-dot" aria-hidden="true"/g) || []).length, 7);
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1);
  assert.equal((html.match(/<h3 tabindex="-1"><span>\d+\.<\/span>/g) || []).length, 18);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5r-edit-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.doesNotMatch(css, /grid-template-columns:\s*14rem minmax\(0, 1fr\)/);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5r-rail\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5r-tab\s*\{[^}]*flex:\s*0 0 12rem/);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5r-tab-status\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5-report-row-list > fieldset\s*\{/);
  assert.match(css, /\[data-a5-report-mode="edit"\] \.a5-report-row-list > fieldset > \.ws-actions\s*\{[^}]*position:\s*static/);
});

test("staff workflow cache-busts the editable report redesign assets", () => {
  const html = readFileSync(new URL("../staff-workflow.html", import.meta.url), "utf8");

  assert.match(html, /activity5-document-workspace\.css\?v=20260819z1/);
  assert.match(html, /activity5-plan-worklog\.js\?v=20260821n/);
  assert.match(html, /activity5-report-213\.js\?v=20260821l/);
  assert.match(html, /activity5-workflow\.js\?v=20260820s7/);
  assert.match(html, /activity5-workspace\.js\?v=20260821p/);
});

test("case plan signatures require the Activity 5 electronic-signature confirmation popup", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  assert.match(workspace, /function confirmA5PlanSignature\(/);
  assert.match(workspace, /id="a5PlanSignatureAttestation"/);
  assert.match(workspace, /ตรวจสอบแผนงานคดีก่อนลงนาม/);
  assert.match(workspace, /const confirmation = await confirmA5PlanSignature\(st, account, signatureRole\);/);
  assert.match(workspace, /if \(!confirmation\.isConfirmed\) return;[\s\S]*signature\.signedAt = new Date\(\)\.toISOString\(\);/);
});

test("read-only inspector renders the complete report as semantic official data", () => {
  const state = report.normalizeReport213A5({
    caseData: { id: "ECMIS-213-INSPECT", subject: "เรื่องทดสอบ" },
    assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" },
    inquiry: { intake: { receivedFirstAt: "2026-08-03" }, prelim: {} }
  }).state;
  const payload = state.a5DocumentStore.records[0].payload;
  payload.complainants = [{ rowId: "complainant-internal-id", order: 1, personType: "PERSON", name: "", address: "", contact: "", capacity: "" }];

  const html = report.renderReport213EditorA5(payload, { editable: false, layout: "full" });

  assert.match(html, /data-a5-report-mode="inspect"/);
  assert.equal((html.match(/data-a5-report-index-item=/g) || []).length, 7);
  assert.equal((html.match(/data-a5-report-section-body=/g) || []).length, 18);
  assert.equal((html.match(/data-a5-report-control-root=/g) || []).length, 18);
  assert.match(html, /<dl\b/);
  assert.match(html, /<ol\b/);
  assert.match(html, /03\/08\/2026/);
  assert.match(html, /เอกสารไม่ระบุ/);
  assert.match(html, /บุคคล/);
  assert.doesNotMatch(html, /2026-08-03|complainant-internal-id|<(?:input|select|textarea|button)\b/);
});

test("editor offers exact evidence versions and all canonical proposal choices with pending choices disabled", () => {
  const state = report.normalizeReport213A5({ caseData: { id: "ECMIS-213-UI-2" }, assignment: { primaryOfficerId: "owner", primaryOfficerName: "ผู้รับผิดชอบ" }, inquiry: { intake: {}, prelim: {} } }).state;
  let payload = state.a5DocumentStore.records[0].payload;
  payload = report.mutateReport213RowsA5(payload, { path: "evidence", action: "add" });
  const html = report.renderReport213EditorA5(payload, { editable: true, evidenceVersions: [{ versionId: "evidence-v2", name: "สัญญาฉบับลงนาม", availability: "AVAILABLE" }] });
  assert.match(html, /สัญญาฉบับลงนาม — มีเอกสารฉบับนี้/);
  assert.equal((html.match(/value="FORM4_14_1_/g) || []).length, 18);
  assert.match(html, /value="FORM4_14_1_18" disabled/);
});

test("record 7 UI captures signed resolution items and the 644 order handover gate", () => {
  const workspace = readFileSync(new URL("../assets/activity5-workspace.js", import.meta.url), "utf8");

  for (const id of [
    "a5DownstreamDecision",
    "a5ResolutionDocumentVersion",
    "a5ResolutionText",
    "a5ResolutionCertified",
    "a5ResolutionAcceptType",
    "a5Report213ReferenceNo",
    "a5OrderNo644",
    "a5OrderSignedAt644",
    "a5OrderDocumentVersion644",
    "a5Investigator644Id",
    "a5AppointmentOfficerConfirmed",
    "a5AppointmentNotifiedAt",
    "a5AppointmentNotificationChannel",
    "a5AppointmentNotificationDocumentVersion",
    "a5AppointmentAcknowledged",
    "a5HandoverAcceptedAt",
    "a5HandoverEvidenceVersion"
  ]) assert.match(workspace, new RegExp(`id=["']${id}["']`));
  assert.match(workspace, /name="a5ResolutionItem"/);
  assert.match(workspace, /manualSource:\s*'MANUAL_COPY_FROM_ACTIVITY_7'/);
  assert.match(workspace, /certifiedTrueCopy:\s*true/);
  assert.match(workspace, /Activity 5 บันทึกสำเนาข้อมูลเท่านั้น/);
  assert.doesNotMatch(workspace, /data-a5-action="mti213-decide"/);
  assert.match(workspace, /prepare-644-order-sign/);
  assert.match(workspace, /prepare-644-order-record/);
  assert.match(workspace, /prepare-644-notify/);
  assert.match(workspace, /prepare-644-acknowledge/);
  assert.match(workspace, /prepare-644-handover-send/);
  assert.match(workspace, /prepare-644-handover-accept/);
  assert.match(workspace, /เลือกจาก Staff Directory/);
  assert.doesNotMatch(workspace, /id=["']a5Investigator644Name["']/);
});
