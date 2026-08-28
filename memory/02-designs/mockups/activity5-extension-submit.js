(function initializeActivity5ExtensionSubmit(root) {
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);
  const workflow = root.ECMISActivity5ExtensionWorkflow
    || (typeof require === "function" ? require("./activity5-extension-workflow.js") : null);
  const documents = root.ECMISActivity5ExtensionDocuments
    || (typeof require === "function" ? require("./activity5-extension-documents.js") : null);

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
  }

  function envelope(ok, code, state, result = null, errors = [], events = []) {
    return { ok, code, state, result, errors, events };
  }

  function failure(code, sourceModel, errors = []) {
    return envelope(false, code, sourceModel, null, errors, []);
  }

  function activeRevision(requestState) {
    return Array.isArray(requestState?.revisions)
      ? requestState.revisions.find(revision => revision?.revisionNo === requestState.activeRevisionNo) || null
      : null;
  }

  function isoDate(value) {
    const text = asText(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
    const parsed = new Date(`${text}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text ? "" : text;
  }

  function bangkokCivilDate(value) {
    const text = asText(value);
    if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(text)) return "";
    const instant = new Date(text);
    if (Number.isNaN(instant.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(instant);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function renderedForm(source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;
    const rendererVersion = asText(source.rendererVersion);
    const contentType = asText(source.contentType);
    const content = asText(source.content);
    const payload = source.payload && typeof source.payload === "object" && !Array.isArray(source.payload)
      ? clone(source.payload)
      : null;
    if (!rendererVersion || !contentType || (!content && !payload)) return null;
    return { rendererVersion, contentType, content, payload };
  }

  function submitPreparedRequest(sourceModel, sourceCommand) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return failure("REQUEST_NOT_FOUND", sourceModel, [{ field: "workspace", message: "ไม่พบคำขอขยายเวลาที่ต้องการยื่น" }]);
    }
    const command = sourceCommand && typeof sourceCommand === "object" && !Array.isArray(sourceCommand) ? sourceCommand : {};
    const requestState = sourceModel.requestState;
    const context = sourceModel.context;
    if (!requestState || !context || !asText(requestState.id)) {
      return failure("REQUEST_NOT_FOUND", sourceModel, [{ field: "requestId", message: "ไม่พบคำขอขยายเวลาที่ต้องการยื่น" }]);
    }
    const revision = activeRevision(requestState);
    const requestId = asText(command.requestId);
    const revisionNo = Number(command.revisionNo);
    const idempotencyKey = asText(command.idempotencyKey);
    if (requestId !== asText(requestState.id)) {
      return failure("REQUEST_NOT_FOUND", sourceModel, [{ field: "requestId", message: "คำขอที่ยื่นไม่ตรงกับคำขอที่เปิดอยู่" }]);
    }
    if (!revision || revisionNo !== requestState.activeRevisionNo) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "revisionNo", message: "ฉบับคำขอเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    const submittedSnapshot = revision.submittedSnapshot;
    if (requestState.status === workflow?.STATUSES?.SUBMITTED
      && submittedSnapshot?.payload?.idempotencyKey === idempotencyKey
      && idempotencyKey) {
      return envelope(true, "REQUEST_SUBMISSION_REPLAYED", sourceModel, sourceModel, [], []);
    }
    if (requestState.status !== workflow?.STATUSES?.READY) {
      return failure(
        submittedSnapshot ? "SNAPSHOT_IMMUTABLE" : "INVALID_TRANSITION",
        sourceModel,
        [{ field: "requestState.status", message: submittedSnapshot ? "คำขอนี้ถูกยื่นแล้วและแก้ไขไม่ได้" : "คำขอยังไม่ผ่านการตรวจความพร้อม" }]
      );
    }
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== requestState.version) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "expectedVersion", message: "คำขอมีการเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    if (!idempotencyKey) {
      return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "idempotencyKey", message: "ไม่พบรหัสยืนยันการยื่นคำขอ" }]);
    }
    const actorId = asText(command.actorId);
    if (!actorId) {
      return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "actorId", message: "ไม่พบบัญชีผู้ยื่นคำขอ" }]);
    }
    if (actorId !== asText(requestState.ownerId) || actorId !== asText(context.ownerId)) {
      return failure("ACTOR_MISMATCH", sourceModel, [{ field: "actorId", message: "บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบคำขอนี้" }]);
    }
    const at = asText(command.at);
    const submittedDate = bangkokCivilDate(at);
    if (!at || !submittedDate) {
      return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "at", message: "วันเวลายื่นคำขอไม่ถูกต้อง" }]);
    }
    const currentDeadline = isoDate(context.currentDeadline);
    const cutoffResult = rules?.calculateSubmissionCutoff(currentDeadline);
    const submissionCutoff = cutoffResult?.result?.submissionCutoff || "";
    if (!currentDeadline || !submissionCutoff
      || currentDeadline !== isoDate(requestState.currentDeadline)
      || submissionCutoff !== isoDate(requestState.submissionCutoff)
      || (context.submissionCutoff && submissionCutoff !== isoDate(context.submissionCutoff))) {
      return failure("DEADLINE_UNKNOWN", sourceModel, [{ field: "deadline", message: "ข้อมูลกำหนดเวลาไม่ครบหรือไม่ตรงกับคำขอปัจจุบัน" }]);
    }
    if (submittedDate > submissionCutoff) {
      return failure("SUBMISSION_WINDOW_CLOSED", sourceModel, [{ field: "submissionCutoff", message: "พ้นวันสุดท้ายที่ยื่นคำขอขยายเวลาได้" }]);
    }
    const rule = rules?.getExtensionPolicy(asText(context.extensionType)) || rules?.getExtensionRule(asText(context.extensionType));
    if (!rule || rule.formId !== asText(context.formId) || rule.formId !== asText(requestState.formId)
      || asText(context.caseId) !== asText(requestState.caseId)
      || Number(context.roundNo) !== Number(requestState.roundNo)) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "requestScope", message: "ข้อมูลสำนวน แบบคำขอ หรือรอบคำขอเปลี่ยนแปลง" }]);
    }
    const draftPayload = revision.draftPayload && typeof revision.draftPayload === "object" ? revision.draftPayload : {};
    const missingFields = (workflow?.REQUIRED_DRAFT_FIELDS || []).filter(field => field === "requestedDays"
      ? !Number.isFinite(Number(draftPayload[field])) || Number(draftPayload[field]) <= 0
      : !asText(draftPayload[field]));
    if (missingFields.length) {
      return failure("MISSING_REQUIRED_FIELD", sourceModel, missingFields.map(field => ({ field, message: "ข้อมูลคำขอยังไม่ครบถ้วน" })));
    }
    const requestedDaysCheck = rules?.validateRequestedDays(draftPayload.requestedDays);
    if (!requestedDaysCheck?.ok) {
      return failure(requestedDaysCheck?.code || "INVALID_REQUESTED_DAYS", sourceModel, [{ field: "requestedDays", message: "จำนวนวันที่ขอต้องเป็นจำนวนเต็ม 1 ถึง 60 วัน" }]);
    }
    const deadlineCheck = rules?.verifyDeadlineContract({
      deadlineBasis: context.deadlineBasis,
      deadlineVersion: context.deadlineVersion,
      currentDeadline,
      submittedDeadlineBasis: requestState.deadlineBasis,
      submittedDeadlineVersion: requestState.deadlineVersion
    });
    if (!deadlineCheck?.ok) {
      return failure(deadlineCheck?.code || "DEADLINE_VERSION_CONFLICT", sourceModel, [{ field: "deadline", message: "ฐานหรือรุ่นกำหนดเวลาของสำนวนเปลี่ยนแปลง" }]);
    }
    const reviewerContract = requestState.reviewerContract;
    if (!reviewerContract || reviewerContract.status !== "CONFIRMED"
      || reviewerContract.requestId !== requestState.id
      || Number(reviewerContract.revisionNo) !== Number(requestState.activeRevisionNo)
      || reviewerContract.extensionType !== requestState.extensionType
      || Number(reviewerContract.roundNo) !== Number(requestState.roundNo)
      || reviewerContract.unitKey !== context.unitKey
      || Number(reviewerContract.assignmentVersion) < 1) {
      return failure("PENDING_CONFIRMATION", sourceModel, [{ field: "reviewerContract", message: "ยังยืนยันผู้พิจารณาคำขอนี้ไม่ได้" }]);
    }
    const selectedVersionIds = Array.isArray(sourceModel.selectedVersionIds) ? sourceModel.selectedVersionIds : [];
    const repositoryByVersionId = new Map((sourceModel.repository || []).map(item => [asText(item?.versionId), item]));
    for (const versionId of selectedVersionIds) {
      const item = repositoryByVersionId.get(asText(versionId));
      if (!item) {
        return failure("DOCUMENT_VERSION_NOT_FOUND", sourceModel, [{ field: "documents", documentVersionId: asText(versionId), message: "ไม่พบเอกสารเวอร์ชันที่เลือก" }]);
      }
      if (item.availability !== documents?.DOCUMENT_AVAILABILITY?.AVAILABLE) {
        const code = item.availability === documents?.DOCUMENT_AVAILABILITY?.UPLOAD_PENDING ? "DOCUMENT_VERSION_UNAVAILABLE" : "DOCUMENT_VERSION_UNAVAILABLE";
        return failure(code, sourceModel, [{ field: "documents", documentVersionId: item.versionId, message: "เอกสารเวอร์ชันที่เลือกยังไม่พร้อมใช้ยื่น" }]);
      }
    }
    const checklist = documents?.evaluateExtensionDocumentChecklist(
      context.extensionType,
      sourceModel.repository || [],
      sourceModel.assignments || {},
      { caseId: context.caseId, reportType: context.reportType, deadlineBasis: context.deadlineBasis, appointmentContext: context.appointmentContext }
    );
    if (!checklist?.ok || !checklist.result.complete) {
      return failure("REQUIRED_DOCUMENT_MISSING", sourceModel, (checklist?.result?.missingDocumentCodes || rule.requiredDocumentCodes).map(requirementCode => ({
        field: "documents",
        requirementCode,
        message: "เอกสารบังคับยังไม่ครบหรือยังไม่พร้อมใช้ยื่น"
      })));
    }
    const documentSnapshot = documents?.snapshotSelectedDocuments(
      sourceModel.repository || [],
      selectedVersionIds,
      sourceModel.assignments || {}
    );
    if (!documentSnapshot?.ok) {
      return failure("DOCUMENT_VERSION_NOT_FOUND", sourceModel, [{ field: "documents", message: "สร้างชุดเอกสารเวอร์ชันที่เลือกไม่สำเร็จ" }]);
    }
    const formSnapshot = renderedForm(command.renderedForm);
    if (!formSnapshot) {
      return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "renderedForm", message: "สร้างแบบคำขอฉบับยื่นไม่สำเร็จ" }]);
    }
    const snapshotPayload = {
      schemaVersion: 1,
      idempotencyKey,
      request: {
        id: requestState.id,
        caseId: requestState.caseId,
        revisionNo: requestState.activeRevisionNo,
        requestVersion: requestState.version,
        extensionType: requestState.extensionType,
        formId: requestState.formId,
        roundNo: requestState.roundNo,
        draftPayload: clone(draftPayload)
      },
      renderedForm: formSnapshot,
      assignment: {
        ownerId: context.ownerId,
        ownerName: context.ownerName,
        assignmentVersion: context.assignmentVersion,
        acceptedAssignmentVersion: context.acceptedAssignmentVersion
      },
      documents: documentSnapshot.result,
      checklist: clone(checklist.result),
      deadline: {
        currentDeadline,
        submissionCutoff,
        requestedDays: draftPayload.requestedDays,
        basis: clone(requestState.deadlineBasis),
        deadlineVersion: requestState.deadlineVersion
      },
      submission: { actorId, at },
      routing: clone(reviewerContract)
    };
    const submitted = workflow?.submitRequest(requestState, {
      actorId,
      expectedVersion: requestState.version,
      at,
      snapshotPayload
    });
    if (!submitted?.ok) {
      return failure(submitted?.code || "SUBMIT_FAILED", sourceModel, submitted?.result?.errors || []);
    }
    const nextModel = clone(sourceModel);
    nextModel.requestState = submitted.state;
    nextModel.ui = {
      ...(nextModel.ui || {}),
      step: 4,
      dirty: false,
      prepared: false,
      saveState: "SAVED",
      saveMessage: "ยื่นคำขอสำเร็จแล้ว",
      submitted: true
    };
    nextModel.submission = {
      requestId: requestState.id,
      revisionNo: requestState.activeRevisionNo,
      submittedBy: actorId,
      submittedAt: at,
      idempotencyKey
    };
    nextModel.updatedAt = at;
    return envelope(true, "REQUEST_SUBMITTED", sourceModel, nextModel, [], submitted.events || []);
  }

  const api = Object.freeze({ submitPreparedRequest });
  root.ECMISActivity5ExtensionSubmit = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
