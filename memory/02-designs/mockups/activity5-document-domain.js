(function initializeActivity5DocumentDomain(root) {
  const FORM_4_DOCUMENT_ID = "FORM_4_REPORT_213";
  const FORM_4_SOURCE = Object.freeze({ fileName: "4. แบบรายงานผลการไต่สวนเบื้องต้น.pdf", pages: Object.freeze([1, 6]) });

  function clone(value) {
    if (Array.isArray(value)) {
      const copied = value.map(clone);
      return Object.isFrozen(value) ? Object.freeze(copied) : copied;
    }
    if (value && typeof value === "object") {
      const copied = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
      return Object.isFrozen(value) ? Object.freeze(copied) : copied;
    }
    return value;
  }

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function envelope(ok, code, state, errors = []) {
    const copiedErrors = clone(errors);
    return Object.freeze({ ok, code, state: clone(state), errors: Object.freeze(copiedErrors), focusTarget: copiedErrors[0]?.field || "" });
  }

  function emptyStore(caseId) {
    return { schemaVersion: 1, caseId, version: 0, records: [], commandReceipts: [] };
  }

  function legacyReportOf(state) {
    const value = asObject(asObject(state.inquiry).prelim).report;
    return typeof value === "string" ? value : "";
  }

  function recordForLegacyReport(caseId, text) {
    return {
      documentId: FORM_4_DOCUMENT_ID,
      caseId,
      revisionNo: 1,
      baseRevisionNo: null,
      status: "DRAFT",
      schemaVersion: 1,
      payload: { legacyReportText: text },
      source: clone(FORM_4_SOURCE),
      submittedSnapshot: null,
      reviewHistory: [],
      createdBy: "เอกสารไม่ระบุ",
      createdAt: "",
      updatedBy: "เอกสารไม่ระบุ",
      updatedAt: ""
    };
  }

  function failure(code, state, field, message) {
    return envelope(false, code, state, field ? [{ field, message }] : []);
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function freezeDeep(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freezeDeep);
    return Object.freeze(value);
  }

  function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === "object") return Object.keys(value).sort().reduce((result, key) => {
      if (value[key] !== undefined) result[key] = canonicalize(value[key]);
      return result;
    }, {});
    return value;
  }

  function fingerprint(operation, command) {
    return JSON.stringify(canonicalize({ operation, command }));
  }

  function fingerprintA5SubmittedSnapshot(snapshot) {
    const body = clone(asObject(snapshot));
    delete body.snapshotFingerprint;
    return JSON.stringify(canonicalize(body));
  }

  function activeRecord(store, documentId) {
    return store.records
      .filter(record => record?.documentId === documentId)
      .sort((left, right) => Number(right.revisionNo) - Number(left.revisionNo))[0] || null;
  }

  function normalizeForCommand(sourceState) {
    const normalized = normalizeA5DocumentStore(sourceState);
    return normalized.ok ? normalized.state : null;
  }

  function validateCommon(sourceState, sourceCommand, operation) {
    const source = clone(asObject(sourceState));
    const state = normalizeForCommand(sourceState);
    if (!state || !isPlainObject(state.a5DocumentStore)) {
      return { failure: failure("MISSING_REQUIRED_FIELD", source, "caseData.id", "ไม่พบเลขอ้างอิงสำนวน") };
    }
    const command = isPlainObject(sourceCommand) ? clone(sourceCommand) : {};
    const store = state.a5DocumentStore;
    const required = ["caseId", "documentId", "actorId", "at", "idempotencyKey"];
    for (const field of required) {
      command[field] = asText(command[field]);
      if (!command[field]) return { failure: failure("MISSING_REQUIRED_FIELD", state, field, "ข้อมูลบังคับไม่ครบถ้วน") };
    }
    if (!Number.isInteger(command.expectedVersion)) return { failure: failure("MISSING_REQUIRED_FIELD", state, "expectedVersion", "ไม่พบรุ่นข้อมูล") };
    const commandFingerprint = fingerprint(operation, command);
    const receipt = store.commandReceipts.find(item => item?.idempotencyKey === command.idempotencyKey);
    if (receipt) {
      if (receipt.fingerprint !== commandFingerprint) return { failure: failure("IDEMPOTENCY_KEY_REUSED", state, "idempotencyKey", "รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว") };
      return { replay: envelope(true, `${receipt.code}_REPLAYED`, state) };
    }
    if (command.caseId !== store.caseId) return { failure: failure("CASE_MISMATCH", state, "caseId", "สำนวนไม่ตรงกับเอกสาร") };
    if (command.expectedVersion !== store.version) return { failure: failure("VERSION_CONFLICT", state, "expectedVersion", "ข้อมูลมีการเปลี่ยนแปลง") };
    return { state, command, store, commandFingerprint };
  }

  function sourceIsValid(source) {
    return isPlainObject(source)
      && asText(source.fileName)
      && Array.isArray(source.pages)
      && source.pages.length === 2
      && source.pages.every(page => Number.isInteger(page) && page > 0)
      && source.pages[0] <= source.pages[1];
  }

  function recordReceipt(store, command, operation, commandFingerprint, code, record) {
    store.commandReceipts.push({
      idempotencyKey: command.idempotencyKey,
      operation,
      fingerprint: commandFingerprint,
      code,
      documentId: record.documentId,
      revisionNo: record.revisionNo,
      storeVersion: store.version
    });
  }

  function createA5DocumentDraftInternal(sourceState, sourceCommand) {
    const context = validateCommon(sourceState, sourceCommand, "createA5DocumentDraft");
    if (context.failure || context.replay) return context.failure || context.replay;
    const { state, command, store, commandFingerprint } = context;
    if (!isPlainObject(command.payload)) return failure("INVALID_PAYLOAD", state, "payload", "ข้อมูลเอกสารไม่ถูกต้อง");
    if (!sourceIsValid(command.source)) return failure("INVALID_SOURCE", state, "source", "ข้อมูลต้นฉบับไม่ถูกต้อง");
    if (store.records.some(record => record?.documentId === command.documentId)) return failure("DOCUMENT_ALREADY_EXISTS", state, "documentId", "มีเอกสารนี้แล้ว");
    const record = {
      documentId: command.documentId,
      caseId: command.caseId,
      revisionNo: 1,
      baseRevisionNo: null,
      status: "DRAFT",
      schemaVersion: 1,
      payload: clone(command.payload),
      source: { fileName: asText(command.source.fileName), pages: clone(command.source.pages) },
      submittedSnapshot: null,
      reviewHistory: [],
      createdBy: command.actorId,
      createdAt: command.at,
      updatedBy: command.actorId,
      updatedAt: command.at
    };
    store.records.push(record);
    store.version += 1;
    recordReceipt(store, command, "createA5DocumentDraft", commandFingerprint, "DOCUMENT_DRAFT_CREATED", record);
    return envelope(true, "DOCUMENT_DRAFT_CREATED", state);
  }

  function draftRevisionContext(sourceState, sourceCommand, operation) {
    const context = validateCommon(sourceState, sourceCommand, operation);
    if (context.failure || context.replay) return context;
    const { state, command, store } = context;
    if (!Number.isInteger(command.revisionNo) || command.revisionNo < 1) return { failure: failure("MISSING_REQUIRED_FIELD", state, "revisionNo", "ไม่พบฉบับเอกสาร") };
    const active = activeRecord(store, command.documentId);
    if (!active) return { failure: failure("DOCUMENT_NOT_FOUND", state, "documentId", "ไม่พบเอกสาร") };
    if (active.revisionNo !== command.revisionNo) return { failure: failure("REVISION_NOT_FOUND", state, "revisionNo", "ไม่ใช่ฉบับปัจจุบัน") };
    return { ...context, active };
  }

  function saveA5DocumentDraftInternal(sourceState, sourceCommand) {
    const context = draftRevisionContext(sourceState, sourceCommand, "saveA5DocumentDraft");
    if (context.failure || context.replay) return context.failure || context.replay;
    const { state, command, store, active, commandFingerprint } = context;
    if (!isPlainObject(command.payload)) return failure("INVALID_PAYLOAD", state, "payload", "ข้อมูลเอกสารไม่ถูกต้อง");
    if (active.submittedSnapshot) return failure("SNAPSHOT_IMMUTABLE", state, "revisionNo", "เอกสารถูกส่งแล้ว") ;
    if (active.status !== "DRAFT") return failure("INVALID_TRANSITION", state, "revisionNo", "เอกสารไม่อยู่ระหว่างร่าง");
    active.payload = clone(command.payload);
    active.updatedBy = command.actorId;
    active.updatedAt = command.at;
    store.version += 1;
    recordReceipt(store, command, "saveA5DocumentDraft", commandFingerprint, "DOCUMENT_DRAFT_SAVED", active);
    return envelope(true, "DOCUMENT_DRAFT_SAVED", state);
  }

  function submitA5DocumentRevisionInternal(sourceState, sourceCommand) {
    const context = draftRevisionContext(sourceState, sourceCommand, "submitA5DocumentRevision");
    if (context.failure || context.replay) return context.failure || context.replay;
    const { state, command, store, active, commandFingerprint } = context;
    if (command.submissionContext !== undefined && !isPlainObject(command.submissionContext)) return failure("INVALID_PAYLOAD", state, "submissionContext", "ข้อมูลการส่งไม่ถูกต้อง");
    if (active.submittedSnapshot) return failure("SNAPSHOT_IMMUTABLE", state, "revisionNo", "เอกสารถูกส่งแล้ว");
    if (active.status !== "DRAFT") return failure("INVALID_TRANSITION", state, "revisionNo", "เอกสารไม่อยู่ระหว่างร่าง");
    const submittedSnapshot = {
      documentId: active.documentId,
      caseId: active.caseId,
      revisionNo: active.revisionNo,
      schemaVersion: active.schemaVersion,
      payload: clone(active.payload),
      source: clone(active.source),
      submissionContext: clone(command.submissionContext || {}),
      submittedBy: command.actorId,
      submittedAt: command.at,
      idempotencyKey: command.idempotencyKey
    };
    active.submittedSnapshot = freezeDeep({
      ...submittedSnapshot,
      snapshotFingerprint: fingerprintA5SubmittedSnapshot(submittedSnapshot)
    });
    active.status = "SUBMITTED";
    active.updatedBy = command.actorId;
    active.updatedAt = command.at;
    store.version += 1;
    recordReceipt(store, command, "submitA5DocumentRevision", commandFingerprint, "DOCUMENT_REVISION_SUBMITTED", active);
    return envelope(true, "DOCUMENT_REVISION_SUBMITTED", state);
  }

  function returnA5DocumentRevisionInternal(sourceState, sourceCommand) {
    const context = draftRevisionContext(sourceState, sourceCommand, "returnA5DocumentRevision");
    if (context.failure || context.replay) return context.failure || context.replay;
    const { state, command, store, active, commandFingerprint } = context;
    const reason = asText(command.reason);
    if (!reason) return failure("MISSING_REQUIRED_FIELD", state, "reason", "ไม่ระบุเหตุผลส่งกลับ");
    if (active.status !== "SUBMITTED" || !active.submittedSnapshot) return failure("INVALID_TRANSITION", state, "revisionNo", "เอกสารยังไม่พร้อมส่งกลับแก้ไข");
    const affectedFields = command.affectedFields === undefined ? [] : command.affectedFields;
    const affectedDocumentVersionIds = command.affectedDocumentVersionIds === undefined ? [] : command.affectedDocumentVersionIds;
    if (!Array.isArray(affectedFields) || !Array.isArray(affectedDocumentVersionIds)) return failure("INVALID_PAYLOAD", state, "affectedFields", "ข้อมูลส่งกลับแก้ไขไม่ถูกต้อง");
    const snapshot = active.submittedSnapshot;
    active.status = "RETURNED";
    active.reviewHistory.push({ action: "RETURNED", actorId: command.actorId, at: command.at, reason, affectedFields: clone(affectedFields), affectedDocumentVersionIds: clone(affectedDocumentVersionIds) });
    const correction = {
      documentId: active.documentId,
      caseId: active.caseId,
      revisionNo: active.revisionNo + 1,
      baseRevisionNo: active.revisionNo,
      status: "DRAFT",
      schemaVersion: active.schemaVersion,
      payload: clone(snapshot.payload),
      source: clone(snapshot.source),
      submittedSnapshot: null,
      reviewHistory: [],
      createdBy: command.actorId,
      createdAt: command.at,
      updatedBy: command.actorId,
      updatedAt: command.at
    };
    store.records.push(correction);
    store.version += 1;
    recordReceipt(store, command, "returnA5DocumentRevision", commandFingerprint, "DOCUMENT_REVISION_RETURNED", correction);
    return envelope(true, "DOCUMENT_REVISION_RETURNED", state);
  }

  function normalizeA5DocumentStore(sourceState) {
    const state = clone(asObject(sourceState));
    const existing = asObject(state.a5DocumentStore);
    const caseId = asText(existing.caseId || asObject(state.caseData).id);
    const hasLegacyReport = Boolean(legacyReportOf(state).trim());
    if (!caseId) {
      if (hasLegacyReport) return envelope(false, "MISSING_REQUIRED_FIELD", state, [{ field: "caseData.id", message: "ไม่พบเลขอ้างอิงสำนวน" }]);
      return envelope(true, "DOCUMENT_STORE_NORMALIZED", state);
    }
    const store = {
      schemaVersion: 1,
      caseId,
      version: Math.max(0, Number(existing.version) || 0),
      records: Array.isArray(existing.records) ? clone(existing.records) : [],
      commandReceipts: Array.isArray(existing.commandReceipts) ? clone(existing.commandReceipts) : []
    };
    const legacy = legacyReportOf(state);
    if (legacy.trim() && !store.records.some(record => record?.documentId === FORM_4_DOCUMENT_ID)) {
      store.records.push(recordForLegacyReport(caseId, legacy));
      store.version = Math.max(1, store.version + 1);
    }
    state.a5DocumentStore = store;
    return envelope(true, "DOCUMENT_STORE_NORMALIZED", state);
  }

  function preserveSourceOnFailure(sourceState, run) {
    const result = run();
    return result.ok ? result : envelope(false, result.code, asObject(sourceState), result.errors);
  }

  function createA5DocumentDraft(sourceState, sourceCommand) {
    return preserveSourceOnFailure(sourceState, () => createA5DocumentDraftInternal(sourceState, sourceCommand));
  }

  function saveA5DocumentDraft(sourceState, sourceCommand) {
    return preserveSourceOnFailure(sourceState, () => saveA5DocumentDraftInternal(sourceState, sourceCommand));
  }

  function submitA5DocumentRevision(sourceState, sourceCommand) {
    return preserveSourceOnFailure(sourceState, () => submitA5DocumentRevisionInternal(sourceState, sourceCommand));
  }

  function returnA5DocumentRevision(sourceState, sourceCommand) {
    return preserveSourceOnFailure(sourceState, () => returnA5DocumentRevisionInternal(sourceState, sourceCommand));
  }

  const api = Object.freeze({ normalizeA5DocumentStore, createA5DocumentDraft, saveA5DocumentDraft, submitA5DocumentRevision, returnA5DocumentRevision, fingerprintA5SubmittedSnapshot });
  root.ECMISActivity5DocumentDomain = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
