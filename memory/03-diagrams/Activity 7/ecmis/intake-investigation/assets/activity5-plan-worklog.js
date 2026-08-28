(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  const FORM_ID = "FORM_1_CASE_PLAN";
  const WORKLOG_ID = "ACTIVITY5_DAILY_WORKLOG";
  const FORM_644_ID = "FORM_1_CASE_PLAN_644";
  const WORKLOG_644_ID = "ACTIVITY5_DAILY_WORKLOG_644";
  const FORM_SOURCE = Object.freeze({ fileName: "1. แบบแผนงานคดี.pdf", pages: [1, 2] });
  const HEAD_PENDING = "PENDING_CONFIRMATION";
  // owner ยืนยันผู้มีอำนาจอนุมัติ/ลงนามแผนคดีแล้ว 17 ส.ค. 2569 (ตรงกับ document-authority-register แถว FORM_1)
  const HEAD_CONFIRMED = "CONFIRMED";
  const HEAD_AUTHORITY_ROLE = "director";
  const HEAD_AUTHORITY_LABEL = "ผู้อำนวยการสำนักงาน ป.ป.ท. เขต";
  const ISSUE_KEYS = Object.freeze([["สถานะ", "status"], ["อำนาจหน้าที่", "authority"], ["การกระทำความผิด", "action"], ["ความเสียหาย", "damage"]]);
  const OTHER_OPERATIONS_FIXED_ITEMS = Object.freeze(["ตรวจสอบสถานที่เกิดเหตุ", "จัดทำแผนที่เกิดเหตุ"]);
  const ACTIVITY_LABELS = Object.freeze({ IMPORTED_LEGACY_NOTE: "นำเข้าจากบันทึกเดิม", WITNESS_INTERVIEW: "สอบพยาน", DOCUMENT_REQUEST: "ขอเอกสาร", SITE_INSPECTION: "ตรวจสถานที่" });

  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const copy = value => JSON.parse(JSON.stringify(value));
  const text = value => String(value || "").trim();
  const isoDateValue = (...values) => {
    for (const value of values) {
      const match = text(value).match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    return "";
  };
  const escapeHtml = value => String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const dayAfter = (value, days) => { const date = new Date(`${text(value)}T00:00:00Z`); return Number.isNaN(date.valueOf()) ? "" : new Date(date.valueOf() + days * 86400000).toISOString().slice(0, 10); };
  const A5_THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
  const a5Num = value => String(value || "").split("").map(ch => A5_THAI_DIGITS[ch] ?? ch).join("");
  const domain = () => root.ECMISActivity5DocumentDomain || (typeof require === "function" ? require("./activity5-document-domain.js") : null);
  const active = (state, documentId) => object(state.a5DocumentStore).records?.filter(record => record?.documentId === documentId).sort((a, b) => b.revisionNo - a.revisionNo)[0] || null;
  const scope = state => ["a5-inquiry", "a5-inquiry-review", "a7-644", "a5-outcome", "a5-prosecutor", "closed"].includes(text(state.workflow?.stage)) ? "inquiry644" : "prelim";
  const legacy = state => object(object(state.inquiry)[scope(state)]);
  const documentIds = key => key === "inquiry644" ? { form: FORM_644_ID, worklog: WORKLOG_644_ID } : { form: FORM_ID, worklog: WORKLOG_ID };
  const legacyScopes = state => [["แผนงานคดีไต่สวนเบื้องต้นเดิม", object(object(state.inquiry).prelim), "prelim"], ["แผนงานคดีไต่สวนเดิม", object(object(state.inquiry).inquiry644), "inquiry644"]];

  function basePlan(state, scopeKey = scope(state)) {
    const c = object(state.caseData), p = object(object(state.inquiry)[scopeKey]), intake = object(object(state.inquiry).intake), assignment = object(state.assignment), issues = object(p.issues);
    const assistants = Array.isArray(assignment.assistantOfficerIds) ? assignment.assistantOfficerIds : [];
    return {
      schemaVersion: 1,
      caseMetadata: { caseId: text(c.id), subject: text(c.subject || state.documentData?.documentSubject), complainant: text(c.complainant), allegation: text(p.allegations || c.subject || state.documentData?.documentSubject), complaintChannel: text(c.channel), receivedAt: isoDateValue(intake.receivedFirstAt, p.startedAt, c.receivedFirstAt, c.receivedAt, c.received), sourceTypes: { fromNacc: Boolean(intake.m62?.flag || text(c.decision).includes("62")), misconduct: text(c.decision).includes("18/4") } },
      eventContext: { occurredAtPlace: text(p.place || c.place) },
      limitationDates: { preliminaryDeadlineAt: isoDateValue(p.deadlineAt), twoYearDeadlineAt: dayAfter(isoDateValue(intake.receivedFirstAt, p.startedAt, c.receivedFirstAt, c.receivedAt, c.received), 730), limitationRows: [] },
      accusedRows: Array.isArray(p.accused) ? p.accused.map(name => ({ name: text(name) })) : [],
      fourIssues: ISSUE_KEYS.map(([issue, key]) => ({ issue, details: text(issues[key]) })),
      requiredEvidenceActions: ISSUE_KEYS.map(([issue, key]) => ({ issue, requiredEvidence: text(issues[`${key}Docs`]), action: text(issues[`${key}Todo`]) })),
      witnesses: Array.isArray(p.witnesses) ? p.witnesses.map(name => ({ name: text(name), relevance: "", issues: "" })) : [],
      requestedDocuments: [], otherOperations: [], scheduleRows: [],
      otherOperationsFixed: OTHER_OPERATIONS_FIXED_ITEMS.map(item => ({ item, detail: "" })),
      legacyNotes: legacyScopes(state).filter(([, value]) => text(value.plan)).map(([source, value]) => ({ source, text: text(value.plan) })),
      signatures: { owner: { officerId: text(assignment.primaryOfficerId || assignment.legalOwner), officerName: text(assignment.primaryOfficerName) || "เอกสารไม่ระบุ", signedAt: "" }, assistant: { officerId: text(assistants[0]), officerName: text(assignment.assistantOfficerName) || "เอกสารไม่ระบุ", signedAt: "" }, head: { status: HEAD_CONFIRMED, roleCode: HEAD_AUTHORITY_ROLE, authorityLabel: HEAD_AUTHORITY_LABEL, officerId: "", officerName: "เอกสารไม่ระบุ", signedAt: "" } }
    };
  }

  function importedEntries(state, scopeKey = null) {
    return legacyScopes(state).filter(([, , key]) => !scopeKey || key === scopeKey).filter(([, value]) => text(value.workLog)).map(([source, value, key]) => ({ entryId: `legacy-worklog-note-${key}`, occurredAt: "", activityType: "IMPORTED_LEGACY_NOTE", description: text(value.workLog), officerId: "", officerName: "เอกสารไม่ระบุ", result: source, relatedDocumentVersionIds: [], createdAt: "" }));
  }

  function ordered(entries) { return [...entries].sort((a, b) => `${a.occurredAt}|${a.createdAt}|${a.entryId}`.localeCompare(`${b.occurredAt}|${b.createdAt}|${b.entryId}`)); }
  function migrationRecord(caseId, documentId, payload) { return { documentId, caseId, revisionNo: 1, baseRevisionNo: null, status: "DRAFT", schemaVersion: 1, payload: copy(payload), source: copy(FORM_SOURCE), submittedSnapshot: null, reviewHistory: [], createdBy: "เอกสารไม่ระบุ", createdAt: "", updatedBy: "เอกสารไม่ระบุ", updatedAt: "" }; }

  function normalizeCasePlanA5(sourceState) {
    const normalized = domain()?.normalizeA5DocumentStore?.(sourceState);
    if (normalized && !normalized.ok) return normalized;
    const state = copy(normalized?.state || sourceState);
    const store = object(state.a5DocumentStore);
    const records = Array.isArray(store.records) ? store.records : [];
    const currentIds = documentIds(scope(state));
    [["prelim", documentIds("prelim")], ["inquiry644", documentIds("inquiry644")]].forEach(([key, ids]) => {
      const legacyScope = object(object(state.inquiry)[key]);
      if (key === scope(state) || text(legacyScope.plan) || text(legacyScope.workLog)) {
        if (!active(state, ids.form)) { records.push(migrationRecord(text(state.caseData?.id), ids.form, basePlan(state, key))); store.version = Math.max(0, Number(store.version) || 0) + 1; }
        if (!active(state, ids.worklog)) { records.push(migrationRecord(text(state.caseData?.id), ids.worklog, { schemaVersion: 1, entries: importedEntries(state, key) })); store.version = Math.max(0, Number(store.version) || 0) + 1; }
      }
    });
    state.a5DocumentStore = { ...store, records };
    const planRecord = active(state, currentIds.form);
    const canonicalPlan = copy(planRecord?.payload || basePlan(state));
    canonicalPlan.caseMetadata = object(canonicalPlan.caseMetadata);
    canonicalPlan.limitationDates = object(canonicalPlan.limitationDates);
    const sourceReceivedAt = isoDateValue(state.inquiry?.intake?.receivedFirstAt, state.inquiry?.[scope(state)]?.startedAt, state.caseData?.receivedFirstAt, state.caseData?.receivedAt, state.caseData?.received);
    if (!isoDateValue(canonicalPlan.caseMetadata.receivedAt) && sourceReceivedAt) canonicalPlan.caseMetadata.receivedAt = sourceReceivedAt;
    canonicalPlan.eventContext = object(canonicalPlan.eventContext);
    if (!text(canonicalPlan.eventContext.occurredAtPlace) && text(state.caseData?.place)) canonicalPlan.eventContext.occurredAtPlace = text(state.caseData.place);
    const sourceDeadlineAt = isoDateValue(state.inquiry?.[scope(state)]?.deadlineAt);
    if (!isoDateValue(canonicalPlan.limitationDates.preliminaryDeadlineAt) && sourceDeadlineAt) canonicalPlan.limitationDates.preliminaryDeadlineAt = sourceDeadlineAt;
    if (!isoDateValue(canonicalPlan.limitationDates.twoYearDeadlineAt) && sourceReceivedAt) canonicalPlan.limitationDates.twoYearDeadlineAt = dayAfter(sourceReceivedAt, 730);
    canonicalPlan.signatures = object(canonicalPlan.signatures);
    const recordedApproval = [...(planRecord?.reviewHistory || [])].reverse().find(item => item?.action === "PLAN_APPROVED");
    const lifecycleApproval = text(state.planLifecycle?.approvedAt) ? {
      actorId: "",
      actorName: text(state.planLifecycle.approvedBy) || "ผู้อนุมัติแผนคดี",
      positionName: HEAD_AUTHORITY_LABEL,
      signedAt: text(state.planLifecycle.approvedAt)
    } : null;
    const approval = recordedApproval || lifecycleApproval;
    if (approval) canonicalPlan.signatures.head = {
      status: HEAD_CONFIRMED,
      roleCode: HEAD_AUTHORITY_ROLE,
      authorityLabel: text(approval.positionName) || HEAD_AUTHORITY_LABEL,
      officerId: text(approval.actorId),
      officerName: text(approval.actorName) || "เอกสารไม่ระบุ",
      signedAt: text(approval.signedAt),
      signatureMethod: text(approval.signatureMethod) || "ELECTRONIC_SIGNATURE"
    };
    const canonicalLog = active(state, currentIds.worklog)?.payload || { schemaVersion: 1, entries: importedEntries(state, scope(state)) };
    state.a5CasePlan = copy(canonicalPlan);
    state.a5Worklog = { schemaVersion: 1, ...copy(canonicalLog), entries: ordered(canonicalLog.entries || []) };
    return { ok: true, code: "CASE_PLAN_NORMALIZED", state };
  }

  function validateCasePlanA5(plan, options = {}) {
    const model = object(plan), signatures = object(model.signatures), intent = text(options.intent || "DRAFT");
    const errors = [];
    if (Number(model.schemaVersion) !== 1) errors.push({ field: "schemaVersion", message: "โครงสร้างแผนงานคดีไม่ถูกต้อง" });
    for (const key of ["accusedRows", "fourIssues", "requiredEvidenceActions", "witnesses", "requestedDocuments", "otherOperations", "scheduleRows"]) if (!Array.isArray(model[key])) errors.push({ field: key, message: "โครงสร้างรายการในแผนงานคดีไม่ถูกต้อง" });
    if (intent === "SUBMIT" || intent === "HEAD_APPROVAL") {
      const metadata = object(model.caseMetadata), dates = object(model.limitationDates), context = object(model.eventContext);
      for (const [field, value, message] of [
        ["caseMetadata.caseId", metadata.caseId, "ยังไม่ได้ระบุเลขสำนวน"],
        ["caseMetadata.receivedAt", metadata.receivedAt, "ยังไม่ได้กรอกวันที่รับเรื่อง"],
        ["caseMetadata.complainant", metadata.complainant, "ยังไม่ได้กรอกผู้กล่าวหา"],
        ["caseMetadata.allegation", metadata.allegation, "ยังไม่ได้กรอกข้อกล่าวหา"],
        ["eventContext.occurredAtPlace", context.occurredAtPlace, "ยังไม่ได้กรอกวัน เวลา หรือสถานที่เกิดเหตุ"],
        ["limitationDates.preliminaryDeadlineAt", dates.preliminaryDeadlineAt, "ยังไม่ได้กรอกวันครบกำหนด 60 วัน"]
      ]) if (!text(value)) errors.push({ field, message });
      if (!(model.accusedRows || []).some(row => text(row?.name))) errors.push({ field: "accusedRows", message: "ต้องระบุผู้ถูกกล่าวหาอย่างน้อยหนึ่งราย" });
      const firstAccused = (model.accusedRows || []).find(row => text(row?.name));
      const nestedIssues = firstAccused?.fourIssues;
      const nestedActions = firstAccused?.requiredEvidenceActions;
      const effectiveIssues = Array.isArray(nestedIssues) && nestedIssues.some(row => text(row?.details)) ? nestedIssues : (model.fourIssues || []);
      const effectiveActions = Array.isArray(nestedActions) && nestedActions.some(row => text(row?.requiredEvidence) || text(row?.action)) ? nestedActions : (model.requiredEvidenceActions || []);
      if (effectiveIssues.length !== 4 || effectiveIssues.some(row => !text(row?.details))) errors.push({ field: "fourIssues", message: "ต้องบันทึกข้อเท็จจริงครบ 4 ประเด็น" });
      if (!effectiveActions.some(row => text(row?.requiredEvidence) && text(row?.action))) errors.push({ field: "requiredEvidenceActions", message: "ต้องระบุหลักฐานและการดำเนินการอย่างน้อยหนึ่งรายการ" });
      if (!(model.scheduleRows || []).some(row => text(row?.date) && text(row?.action))) errors.push({ field: "scheduleRows", message: "ต้องระบุแผนการไต่สวนอย่างน้อยหนึ่งรายการ" });
      const incompleteWitness = (model.witnesses || []).findIndex(row => !text(row?.name) && [row?.relevance, row?.issues].some(text));
      const incompleteDocument = (model.requestedDocuments || []).findIndex(row => !text(row?.name) && text(row?.agency));
      if (incompleteWitness >= 0) errors.push({ field: `witnesses.${incompleteWitness}.name`, message: "กรอกชื่อพยานบุคคลในรายการที่เริ่มกรอกไว้" });
      if (incompleteDocument >= 0) errors.push({ field: `requestedDocuments.${incompleteDocument}.name`, message: "กรอกชื่อพยานเอกสารในรายการที่เริ่มกรอกไว้" });
      if (!text(signatures.owner?.signedAt)) errors.push({ field: "signatures.owner", message: "ยังไม่มีลายมือชื่อพนักงาน ป.ป.ท. เจ้าของสำนวน" });
      if (text(signatures.assistant?.officerId) && !text(signatures.assistant?.signedAt)) errors.push({ field: "signatures.assistant", message: "ยังไม่มีลายมือชื่อเจ้าหน้าที่ ป.ป.ท. ผู้ช่วยเจ้าของสำนวน" });
    }
    if (intent === "HEAD_APPROVAL") {
      if (signatures.head?.status === HEAD_PENDING) errors.push({ field: "signatures.head", code: HEAD_PENDING, blocked: true, message: `รอยืนยันผู้มีอำนาจลงนาม (${HEAD_AUTHORITY_LABEL})` });
      else if (!text(signatures.head?.signedAt)) errors.push({ field: "signatures.head", message: `ยังไม่มีลายมือชื่อ${HEAD_AUTHORITY_LABEL}` });
    }
    return { ok: errors.length === 0, code: errors.length ? "CASE_PLAN_INVALID" : "CASE_PLAN_VALID", errors, focusTarget: errors[0]?.field || "" };
  }

  function syncAliases(state) {
    const next = normalizeCasePlanA5(state);
    return next.ok ? next.state : state;
  }

  function appendWorklogEntryA5(sourceState, command) {
    const source = copy(sourceState), normalized = normalizeCasePlanA5(sourceState);
    if (!normalized.ok) return { ...normalized, state: source };
    const input = object(command), entry = object(input.entry), at = text(input.at);
    const required = ["expectedVersion", "actorId", "actorName", "at", "idempotencyKey"];
    const missing = required.find(key => key === "expectedVersion" ? !Number.isInteger(input[key]) : !text(input[key]));
    if (missing) return { ok: false, code: "MISSING_REQUIRED_FIELD", state: source, errors: [{ field: missing, message: "ข้อมูลคำสั่งไม่ครบถ้วน" }], focusTarget: missing };
    const entryFields = ["entryId", "occurredAt", "activityType", "description", "result"];
    const entryFieldLabels = {
      entryId: "เลขอ้างอิงบันทึก",
      occurredAt: "วันและเวลาที่ดำเนินการ",
      activityType: "ประเภทการดำเนินการ",
      description: "รายละเอียด",
      result: "ผลการดำเนินการ"
    };
    const missingEntry = entryFields.find(key => !text(entry[key]));
    if (missingEntry || !Array.isArray(entry.relatedDocumentVersionIds)) return { ok: false, code: "INVALID_PAYLOAD", state: source, errors: [{ field: missingEntry || "relatedDocumentVersionIds", message: missingEntry ? `ยังไม่ได้กรอก${entryFieldLabels[missingEntry]}` : "รายการเอกสารอ้างอิงไม่ถูกต้อง" }], focusTarget: missingEntry || "relatedDocumentVersionIds" };
    const occurredAt = Date.parse(entry.occurredAt), commandAt = Date.parse(at);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text(entry.occurredAt)) || !Number.isFinite(occurredAt) || !Number.isFinite(commandAt) || occurredAt > commandAt) return { ok: false, code: "INVALID_OCCURRED_AT", state: source, errors: [{ field: "entry.occurredAt", message: "วันดำเนินการต้องเป็นวันเวลาที่ถูกต้องและไม่อยู่หลังเวลาบันทึก" }], focusTarget: "entry.occurredAt" };
    const refs = entry.relatedDocumentVersionIds.map(text);
    if (refs.some(value => !value) || new Set(refs).size !== refs.length) return { ok: false, code: "INVALID_RELATED_DOCUMENT_VERSIONS", state: source, errors: [{ field: "entry.relatedDocumentVersionIds", message: "รายการเอกสารอ้างอิงซ้ำหรือไม่ครบถ้วน" }], focusTarget: "entry.relatedDocumentVersionIds" };
    const logRecord = active(normalized.state, documentIds(scope(normalized.state)).worklog);
    const entries = logRecord.payload.entries || [];
    const stamped = { entryId: text(entry.entryId), occurredAt: text(entry.occurredAt), activityType: text(entry.activityType), description: text(entry.description), officerId: text(input.actorId), officerName: text(input.actorName), result: text(entry.result), relatedDocumentVersionIds: refs, createdAt: at };
    const replay = object(normalized.state.a5DocumentStore).commandReceipts?.some(receipt => receipt?.idempotencyKey === text(input.idempotencyKey));
    if (entries.some(item => item.entryId === text(entry.entryId)) && !replay) return { ok: false, code: "DUPLICATE_WORKLOG_ENTRY", state: source, errors: [{ field: "entry.entryId", message: "เลขอ้างอิงบันทึกนี้มีอยู่แล้ว" }], focusTarget: "entry.entryId" };
    const payload = { schemaVersion: 1, entries: replay ? entries : ordered([...entries, stamped]) };
    const documentCommand = { caseId: normalized.state.caseData.id, documentId: logRecord.documentId, revisionNo: logRecord.revisionNo, expectedVersion: input.expectedVersion, actorId: text(input.actorId), at, idempotencyKey: text(input.idempotencyKey), payload };
    const result = logRecord.status === "SUBMITTED" && logRecord.submittedSnapshot
      ? domain().createA5DocumentRevision(normalized.state, documentCommand)
      : domain().saveA5DocumentDraft(normalized.state, documentCommand);
    return result.ok ? { ...result, state: syncAliases(result.state) } : { ...result, state: source };
  }

  function saveCasePlanA5(sourceState, command) {
    const source = copy(sourceState), normalized = normalizeCasePlanA5(sourceState);
    if (!normalized.ok) return { ...normalized, state: source };
    const input = object(command), record = active(normalized.state, documentIds(scope(normalized.state)).form);
    const required = ["expectedVersion", "actorId", "at", "idempotencyKey"];
    const missing = required.find(key => key === "expectedVersion" ? !Number.isInteger(input[key]) : !text(input[key]));
    if (missing || !object(input.payload).schemaVersion) return { ok: false, code: "MISSING_REQUIRED_FIELD", state: source, errors: [{ field: missing || "payload", message: "ข้อมูลคำสั่งบันทึกแผนไม่ครบถ้วน" }], focusTarget: missing || "payload" };
    const result = domain().saveA5DocumentDraft(normalized.state, { caseId: normalized.state.caseData.id, documentId: record.documentId, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: text(input.actorId), at: text(input.at), idempotencyKey: text(input.idempotencyKey), payload: copy(input.payload) });
    return result.ok ? { ...result, state: syncAliases(result.state) } : { ...result, state: source };
  }

  function submitCasePlanA5(sourceState, command) {
    const source = copy(sourceState), normalized = normalizeCasePlanA5(sourceState);
    if (!normalized.ok) return { ...normalized, state: source };
    const input = object(command), record = active(normalized.state, documentIds(scope(normalized.state)).form);
    const validation = validateCasePlanA5(record.payload, { intent: "SUBMIT" });
    if (!validation.ok) return { ok: false, code: "CASE_PLAN_INVALID", state: source, errors: validation.errors, focusTarget: validation.focusTarget };
    const worklog = active(normalized.state, documentIds(scope(normalized.state)).worklog);
    const result = domain().submitA5DocumentRevision(normalized.state, { caseId: normalized.state.caseData.id, documentId: record.documentId, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: text(input.actorId), at: text(input.at), idempotencyKey: text(input.idempotencyKey), submissionContext: { worklogDocumentId: worklog?.documentId || "", worklogRevisionNo: worklog?.revisionNo || 0 } });
    return result.ok ? { ...result, state: syncAliases(result.state) } : { ...result, state: source };
  }

  function approveCasePlanA5(sourceState, command) {
    const source = copy(sourceState), normalized = normalizeCasePlanA5(sourceState);
    if (!normalized.ok) return { ...normalized, state: source };
    const input = object(command), state = normalized.state, store = object(state.a5DocumentStore);
    const required = ["expectedVersion", "actorName", "at", "idempotencyKey"];
    const missing = required.find(key => key === "expectedVersion" ? !Number.isInteger(input[key]) : !text(input[key]));
    if (missing) return { ok: false, code: "MISSING_REQUIRED_FIELD", state: source, errors: [{ field: missing, message: "ข้อมูลผู้อนุมัติแผนไม่ครบถ้วน" }], focusTarget: missing };
    if (Number(input.expectedVersion) !== Number(store.version)) return { ok: false, code: "VERSION_CONFLICT", state: source, errors: [{ field: "expectedVersion", message: "ข้อมูลแผนงานคดีมีการเปลี่ยนแปลง" }], focusTarget: "expectedVersion" };
    const replay = (store.commandReceipts || []).find(item => item?.idempotencyKey === text(input.idempotencyKey));
    if (replay) return { ok: true, code: "CASE_PLAN_APPROVED_REPLAYED", state: syncAliases(state), errors: [], focusTarget: "" };
    const record = active(state, documentIds(scope(state)).form);
    if (!record?.submittedSnapshot || record.status !== "SUBMITTED") return { ok: false, code: "INVALID_TRANSITION", state: source, errors: [{ field: "casePlan", message: "แผนงานคดียังไม่ได้ส่งให้ ผอ. พิจารณา" }], focusTarget: "casePlan" };
    const validation = validateCasePlanA5(record.submittedSnapshot.payload, { intent: "SUBMIT" });
    if (!validation.ok) return { ok: false, code: "CASE_PLAN_INVALID", state: source, errors: validation.errors, focusTarget: validation.focusTarget };
    const approval = {
      action: "PLAN_APPROVED",
      documentId: record.documentId,
      revisionNo: record.revisionNo,
      actorId: text(input.actorId),
      actorName: text(input.actorName),
      positionName: text(input.positionName) || HEAD_AUTHORITY_LABEL,
      signedAt: text(input.at),
      signatureMethod: "ELECTRONIC_SIGNATURE"
    };
    record.reviewHistory = [...(record.reviewHistory || []), approval];
    record.status = "APPROVED";
    record.updatedBy = text(input.actorId) || text(input.actorName);
    record.updatedAt = text(input.at);
    store.version = Number(store.version || 0) + 1;
    store.commandReceipts = [...(store.commandReceipts || []), { idempotencyKey: text(input.idempotencyKey), operation: "approveCasePlanA5", code: "CASE_PLAN_APPROVED", documentId: record.documentId, revisionNo: record.revisionNo, storeVersion: store.version }];
    return { ok: true, code: "CASE_PLAN_APPROVED", state: syncAliases(state), errors: [], focusTarget: "" };
  }

  function submitWorklogA5(sourceState, command) {
    const source = copy(sourceState), normalized = normalizeCasePlanA5(sourceState);
    if (!normalized.ok) return { ...normalized, state: source };
    const input = object(command), record = active(normalized.state, documentIds(scope(normalized.state)).worklog);
    const required = ["expectedVersion", "actorId", "at", "idempotencyKey"];
    const missing = required.find(key => key === "expectedVersion" ? !Number.isInteger(input[key]) : !text(input[key]));
    if (missing) return { ok: false, code: "MISSING_REQUIRED_FIELD", state: source, errors: [{ field: missing, message: "ข้อมูลคำสั่งส่งบันทึกการปฏิบัติงานไม่ครบถ้วน" }], focusTarget: missing };
    if (!record || !Array.isArray(record.payload?.entries) || record.payload.entries.length === 0) return { ok: false, code: "WORKLOG_EMPTY", state: source, errors: [{ field: "entries", message: "ต้องมีบันทึกการปฏิบัติงานอย่างน้อยหนึ่งรายการ" }], focusTarget: "entries" };
    const result = domain().submitA5DocumentRevision(normalized.state, { caseId: normalized.state.caseData.id, documentId: record.documentId, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: text(input.actorId), at: text(input.at), idempotencyKey: text(input.idempotencyKey), submissionContext: { entryCount: record.payload.entries.length } });
    return result.ok ? { ...result, state: syncAliases(result.state) } : { ...result, state: source };
  }

  function renderCasePlanEditorA5(plan, worklog, options = {}) {
    const model = object(plan), log = object(worklog);
    const planEditable = options.planEditable !== undefined ? options.planEditable !== false : options.editable !== false;
    const worklogEditable = options.worklogEditable !== undefined ? options.worklogEditable !== false : options.editable !== false;
    const disabled = planEditable ? "" : " disabled";
    const label = type => ACTIVITY_LABELS[type] || "บันทึกการปฏิบัติงาน";
    const part = (no, title, body) => `<section class="a5-plan-part"><h4 class="a5-plan-part-title">ส่วนที่ ${no} ${title}</h4>${body}</section>`;
    const PLAN_PLACEHOLDERS = Object.freeze({
      "caseMetadata.subject": "เช่น ขอให้ตรวจสอบการจัดซื้ออุปกรณ์สำนักงาน",
      "caseMetadata.complainant": "เช่น นาย ก. หรือ ไม่ปรากฏชื่อผู้กล่าวหา",
      "caseMetadata.allegation": "สรุปพฤติการณ์หรือข้อกล่าวหาโดยย่อ",
      "eventContext.occurredAtPlace": "เช่น 10 ส.ค. 2569 เวลา 10.00 น. ณ สำนักงาน...",
      "otherOperations": "ระบุการดำเนินการเพิ่มเติม รายการละ 1 บรรทัด"
    });
    const placeholderFor = (path, labelText, type = "text") => {
      if (PLAN_PLACEHOLDERS[path]) return PLAN_PLACEHOLDERS[path];
      if (type === "date") return "เลือกวันที่";
      if (/\.name$/.test(path) && path.startsWith("accusedRows.")) return "ระบุชื่อและนามสกุลผู้ถูกกล่าวหา";
      if (path.includes("witnesses.") && path.endsWith(".name")) return "ระบุชื่อและนามสกุลพยาน";
      if (path.endsWith(".relevance")) return "อธิบายความเกี่ยวข้องกับเหตุการณ์หรือคู่กรณี";
      if (path.endsWith(".issues")) return "ระบุประเด็นข้อเท็จจริงที่ต้องสอบถาม";
      if (path.includes("requestedDocuments.") && path.endsWith(".name")) return "ระบุชื่อหนังสือ สัญญา รายงาน หรือเอกสารที่ต้องขอ";
      if (path.includes("requestedDocuments.") && path.endsWith(".agency")) return "ระบุชื่อหน่วยงานหรือผู้ครอบครองเอกสาร";
      if (path.startsWith("otherOperationsFixed.")) return "ระบุรายละเอียด ผลที่ต้องการ และสถานที่ถ้ามี";
      if (labelText.includes("มาตรา")) return "เช่น มาตรา 157";
      if (labelText.includes("จำนวนปีอายุความ")) return "เช่น 15";
      return `ระบุ${labelText}`;
    };
    const dateHint = type => type === "date" ? '<small>เลือกวันที่จากปฏิทิน</small>' : "";
    const field = (labelText, path, value, type = "text", placeholder = "") => `<div class="ws-field"><label>${labelText}</label><input type="${type}" data-a5-plan-bind="${path}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder || placeholderFor(path, labelText, type))}"${disabled}>${dateHint(type)}</div>`;
    const list = (labelText, path, items) => `<div class="ws-field"><label>${labelText}</label><textarea data-a5-plan-list="${path}" placeholder="${escapeHtml(placeholderFor(path, labelText))}"${disabled}>${escapeHtml((items || []).map(item => item.name || item.description || item.action || "").join("\n"))}</textarea></div>`;
    const checkboxField = (labelText, path, checked) => `<label class="ws-choice"><input type="checkbox" data-a5-plan-bind="${path}"${checked ? " checked" : ""}${disabled}><span><strong>${labelText}</strong></span></label>`;
    const TABLE_CHECKBOXES = {
      status: ["กพ.๗/สัญญาจ้าง", "เลขบัตรประชาชน/ทะเบียนราษฎร์", "ระเบียบข้อบังคับ/ประกาศเกี่ยวกับวินัย", "คำสั่งไล่ออก/ให้ออก/ลาออก/เกษียณอายุราชการ/ใบมรณบัตร"],
      authority: ["คำสั่งแต่งตั้ง/มอบหมาย", "หลักฐานการมอบหมายให้ทำหน้าที่จากผู้บังคับบัญชา", "มาตรฐานกำหนดตำแหน่ง (Job Description)"],
      act: ["พยานหลักฐานยืนยันการกระทำความผิด", "รายงาน คกก.สอบข้อเท็จจริง/วินัย/ละเมิดของต้นสังกัด"]
    };
    const ISSUE_GROUP_KEYS = ["status", "authority", "act", "damage"];
    const accusedCount = Math.max((model.accusedRows || []).length + 1, 1);
    const accusedBlocks = Array.from({ length: accusedCount }, (_, accusedIndex) => {
      const row = model.accusedRows?.[accusedIndex] || {};
      const nestedIssues = row.fourIssues || [];
      const nestedActions = row.requiredEvidenceActions || [];
      const checks = row.tableRows || {};
      const issueBlocks = ISSUE_KEYS.map(([issue], issueIndex) => {
        const flatIssue = model.fourIssues?.[issueIndex];
        const flatAction = model.requiredEvidenceActions?.[issueIndex];
        const details = nestedIssues[issueIndex]?.details ?? flatIssue?.details ?? "";
        const requiredEvidence = nestedActions[issueIndex]?.requiredEvidence ?? flatAction?.requiredEvidence ?? "";
        const action = nestedActions[issueIndex]?.action ?? flatAction?.action ?? "";
        const group = ISSUE_GROUP_KEYS[issueIndex];
        const checkboxSet = TABLE_CHECKBOXES[group] || [];
        const checkboxHtml = checkboxSet.map((checkboxLabel, checkboxIndex) => {
          const path = `accusedRows.${accusedIndex}.tableRows.${group}.checks.${checkboxIndex}`;
          const checked = Boolean(checks?.[group]?.checks?.[checkboxIndex]);
          return `<label class="ws-choice a5-plan-cb"><input type="checkbox" data-a5-plan-bind="${path}"${checked ? " checked" : ""}${disabled}><span>${escapeHtml(checkboxLabel)}</span></label>`;
        }).join("");
        const factExamples = ["ระบุตำแหน่ง สังกัด และสถานะขณะเกิดเหตุ", "ระบุอำนาจหน้าที่ตามกฎหมาย คำสั่ง หรือการมอบหมาย", "สรุปพฤติการณ์การกระทำที่ต้องตรวจสอบ", "ระบุผู้เสียหาย ลักษณะและมูลค่าความเสียหาย"];
        return `<div class="a5-plan-issue-block"><div class="a5-plan-issue-title">${escapeHtml(issue)}</div><div class="ws-field"><label>ข้อเท็จจริง</label><input data-a5-plan-bind="accusedRows.${accusedIndex}.fourIssues.${issueIndex}.details" value="${escapeHtml(details)}" placeholder="${escapeHtml(factExamples[issueIndex])}"${disabled}></div><div class="ws-field"><label>หลักฐานที่ต้องใช้</label>${checkboxHtml ? `<div class="a5-plan-cb-group">${checkboxHtml}</div>` : ""}<input data-a5-plan-bind="accusedRows.${accusedIndex}.requiredEvidenceActions.${issueIndex}.requiredEvidence" value="${escapeHtml(requiredEvidence)}" placeholder="ระบุหลักฐานอื่นที่ต้องใช้เพิ่มเติม"${disabled}></div><div class="ws-field"><label>สิ่งที่ต้องดำเนินการ</label><input data-a5-plan-bind="accusedRows.${accusedIndex}.requiredEvidenceActions.${issueIndex}.action" value="${escapeHtml(action)}" placeholder="เช่น ทำหนังสือขอเอกสาร สอบพยาน หรือตรวจสอบข้อมูล"${disabled}></div></div>`;
      }).join("");
      const removeButton = disabled || accusedCount <= 1 ? "" : `<button type="button" class="ws-button danger a5-plan-accused-remove" data-a5-plan-action="accused-remove" data-a5-plan-accused-index="${accusedIndex}">ลบผู้ถูกกล่าวหา</button>`;
      return `<fieldset class="a5-plan-accused-block"><legend class="a5-plan-accused-head"><span>ผู้ถูกกล่าวหา ${a5Num(accusedIndex + 1)}</span>${removeButton}</legend>${field("ชื่อผู้ถูกกล่าวหา", `accusedRows.${accusedIndex}.name`, row.name)}${issueBlocks}</fieldset>`;
    }).join("");
    const limitationLabels = ["สั้นสุด", "ยาวสุด"];
    const limitationFields = limitationLabels.map((label, index) => {
      const row = model.limitationDates?.limitationRows?.[index] || {};
      return `<div class="ws-grid-3 a5-plan-limitation-row">${field(`อายุความ${label} — มาตรา`, `limitationDates.limitationRows.${index}.section`, row.section)}${field(`อายุความ${label} — จำนวนปีอายุความ`, `limitationDates.limitationRows.${index}.years`, row.years, "number")}<div class="ws-field"><label>อายุความ${label} — ขาดอายุความวันที่ (คำนวณอัตโนมัติ)</label><input type="date" value="${escapeHtml(row.expiresAt)}" disabled></div></div>`;
    }).join("");
    const witnessCount = Math.max((model.witnesses || []).length + 1, 2);
    const witnessRows = Array.from({ length: witnessCount }, (_, index) => {
      const row = model.witnesses?.[index] || {};
      return `<div class="ws-grid-3 a5-plan-witness-row">${field(`พยานบุคคล ${index + 1} — ชื่อ`, `witnesses.${index}.name`, row.name)}${field("เกี่ยวข้องอย่างไร", `witnesses.${index}.relevance`, row.relevance)}${field("สอบประเด็นใด", `witnesses.${index}.issues`, row.issues)}</div>`;
    }).join("");
    const documentCount = Math.max((model.requestedDocuments || []).length + 1, 2);
    const documentRows = Array.from({ length: documentCount }, (_, index) => {
      const row = model.requestedDocuments?.[index] || {};
      return `<div class="ws-grid-2 a5-plan-document-row">${field(`พยานเอกสาร ${index + 1} — ชื่อเอกสาร`, `requestedDocuments.${index}.name`, row.name)}${field("ขอจากหน่วยงานใด", `requestedDocuments.${index}.agency`, row.agency)}</div>`;
    }).join("");
    const otherOperationsFixedFields = OTHER_OPERATIONS_FIXED_ITEMS.map((item, index) => {
      const row = model.otherOperationsFixed?.[index] || {};
      return field(`การดำเนินการอื่น ๆ ${index + 1}. ${row.item || item}`, `otherOperationsFixed.${index}.detail`, row.detail);
    }).join("");
    const rowField = (labelText, fieldKey, value, type = "text") => `<div class="ws-field"><label>${labelText}</label><input type="${type}" data-a5-plan-row-field="${fieldKey}" value="${escapeHtml(value)}" placeholder="${escapeHtml(type === "date" ? "เลือกวันที่" : "ระบุงานที่จะดำเนินการ เช่น สอบพยานหรือขอเอกสาร")}"${disabled}>${dateHint(type)}</div>`;
    const scheduleRowsList = model.scheduleRows?.length ? model.scheduleRows : [{}];
    const scheduleRowsHtml = scheduleRowsList.map((row, index) => `<div class="a5-plan-row" data-a5-plan-row="scheduleRows" data-a5-plan-row-id="${escapeHtml(row.rowId || `schedule-row-${index}`)}"><div class="ws-grid-2">${rowField("วัน/เดือน/ปี", "date", row.date, "date")}${rowField("การดำเนินการ", "action", row.action)}</div>${disabled ? "" : '<div class="ws-actions"><button type="button" class="ws-button danger" data-a5-plan-row-action="delete">ลบแถว</button></div>'}</div>`).join("");
    const scheduleRowsSection = `<div class="ws-field a5-plan-row-list" data-a5-plan-row-list="scheduleRows"><label>แผนการไต่สวน</label>${scheduleRowsHtml}${disabled ? "" : '<button type="button" class="ws-button secondary" data-a5-plan-row-action="add" data-a5-plan-row-path="scheduleRows">เพิ่มแถวแผนการไต่สวน</button>'}</div>`;
    const signatures = object(model.signatures);
    const signButtons = planEditable ? `<button type="button" class="ws-button secondary" data-a5-plan-action="sign-owner">ลงนามเจ้าของสำนวน</button>${signatures.assistant?.officerId ? '<button type="button" class="ws-button secondary" data-a5-plan-action="sign-assistant">ลงนามผู้ช่วยเจ้าของสำนวน</button>' : ''}` : "";
    const part1 = part(1, "ข้อมูลทั่วไป", `${checkboxField("คดีรับจาก ป.ป.ช.", "caseMetadata.sourceTypes.fromNacc", model.caseMetadata?.sourceTypes?.fromNacc)}${checkboxField("คดีประพฤติมิชอบ", "caseMetadata.sourceTypes.misconduct", model.caseMetadata?.sourceTypes?.misconduct)}<div class="ws-grid-2">${field("เรื่อง", "caseMetadata.subject", model.caseMetadata?.subject)}${field("ผู้กล่าวหา", "caseMetadata.complainant", model.caseMetadata?.complainant)}${field("ข้อกล่าวหา", "caseMetadata.allegation", model.caseMetadata?.allegation)}${field("วันที่รับเรื่อง", "caseMetadata.receivedAt", model.caseMetadata?.receivedAt, "date")}${field("วันเวลา/สถานที่เกิดเหตุ", "eventContext.occurredAtPlace", model.eventContext?.occurredAtPlace)}${field("ครบกำหนด 60 วัน", "limitationDates.preliminaryDeadlineAt", model.limitationDates?.preliminaryDeadlineAt, "date")}${field("ครบกำหนด 2 ปี", "limitationDates.twoYearDeadlineAt", model.limitationDates?.twoYearDeadlineAt, "date")}</div>${limitationFields}`);
    const part2 = part(2, "ผู้ถูกกล่าวหาและประเด็น", `${accusedBlocks}${disabled ? "" : '<div class="ws-actions"><button type="button" class="ws-button secondary" data-a5-plan-action="accused-add">เพิ่มผู้ถูกกล่าวหา</button></div>'}`);
    const part3 = part(3, "พยานบุคคล พยานเอกสาร และการดำเนินการอื่น ๆ", `${witnessRows}${documentRows}${otherOperationsFixedFields}${list("การดำเนินการอื่น ๆ (เพิ่มเติม)", "otherOperations", model.otherOperations)}`);
    const part4 = part(4, "แผนการไต่สวน", scheduleRowsSection);
    const part5 = part(5, "การลงนาม", `<div class="a5-plan-signature-status"><p>เจ้าของสำนวน: ${escapeHtml(signatures.owner?.officerName)} · ${signatures.owner?.signedAt ? "ลงนามแล้ว" : "ยังไม่ลงนาม"}</p><p>ผู้ช่วยเจ้าของสำนวน: ${escapeHtml(signatures.assistant?.officerName)} · ${signatures.assistant?.signedAt ? "ลงนามแล้ว" : "ยังไม่ลงนาม"}</p>${signButtons}<p>${escapeHtml(HEAD_AUTHORITY_LABEL)}: ${signatures.head?.signedAt ? "ลงนามแล้ว" : "ยังไม่ลงนาม"}</p></div>`);
    return `<section class="ws-section a5-plan-editor">${part1}${part2}${part3}${part4}${part5}</section><section class="ws-section a5-worklog-editor"><h3>บันทึกการปฏิบัติงาน</h3><ol class="ws-history a5-worklog-timeline">${(log.entries || []).map(entry => `<li><strong>${escapeHtml(label(entry.activityType))}</strong><span>${escapeHtml(entry.description)}</span><time>${escapeHtml(entry.occurredAt || entry.createdAt)}</time></li>`).join("") || "<li>ยังไม่มีบันทึกการปฏิบัติงาน</li>"}</ol>${worklogEditable ? "<div class=\"ws-actions\"><button type=\"button\" class=\"ws-button secondary\" data-a5-plan-action=\"worklog-add\">เพิ่มบันทึกการปฏิบัติงาน</button><button type=\"button\" class=\"ws-button primary\" data-a5-plan-action=\"worklog-submit\">ส่งบันทึกฉบับปัจจุบัน</button></div>" : ""}</section>`;
  }

  const api = Object.freeze({ normalizeCasePlanA5, validateCasePlanA5, saveCasePlanA5, submitCasePlanA5, approveCasePlanA5, submitWorklogA5, appendWorklogEntryA5, renderCasePlanEditorA5, FORM_ID, WORKLOG_ID, FORM_644_ID, WORKLOG_644_ID });
  root.ECMISActivity5PlanWorklog = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
