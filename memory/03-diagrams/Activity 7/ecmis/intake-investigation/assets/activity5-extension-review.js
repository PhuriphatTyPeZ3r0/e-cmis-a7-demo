(function initializeActivity5ExtensionReview(root) {
  const workflow = root.ECMISActivity5ExtensionWorkflow
    || (typeof require === "function" ? require("./activity5-extension-workflow.js") : null);
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);
  const authority = root.ECMISActivity5ExtensionAuthority
    || (typeof require === "function" ? require("./activity5-extension-authority.js") : null);
  const progress = root.ECMISActivity5ExtensionProgress
    || (typeof require === "function" ? require("./activity5-extension-progress.js") : null);

  const REVIEW_ACTIONS = Object.freeze({
    START: "START_REVIEW",
    RETURN: "RETURN_FOR_CORRECTION",
    REJECT: "REJECT",
    APPROVE: "APPROVE"
  });
  const REVIEW_STATUSES = Object.freeze({
    IN_REVIEW: "IN_REVIEW",
    REJECTED: "REJECTED",
    APPROVED: "APPROVED"
  });
  const PENDING_CONFIRMATION = "PENDING_CONFIRMATION";

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

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function canonicalFingerprint(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(item => canonicalFingerprint(item)).join(",")}]`;
    const keys = Object.keys(value).filter(key => value[key] !== undefined).sort();
    return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalFingerprint(value[key])}`).join(",")}}`;
  }

  function response(ok, code, sourceModel, result = null, errors = [], events = []) {
    return Object.freeze({ ok, code, state: sourceModel, result: freeze(result), errors: freeze(errors), events: freeze(events) });
  }

  function failure(code, sourceModel, errors = []) {
    return response(false, code, sourceModel, sourceModel, errors, []);
  }

  function activeRevision(requestState) {
    const revisions = Array.isArray(requestState?.revisions) ? requestState.revisions : [];
    const matches = revisions.filter(revision => revision?.revisionNo === requestState?.activeRevisionNo);
    return matches.length === 1 ? matches[0] : null;
  }

  function pendingReviewerContract(requestState) {
    return {
      status: PENDING_CONFIRMATION,
      requestId: asText(requestState?.id),
      revisionNo: Number(requestState?.activeRevisionNo),
      reviewerId: "",
      reviewerRole: "",
      assignmentVersion: null,
      authorityStatus: PENDING_CONFIRMATION,
      dayPolicyStatus: PENDING_CONFIRMATION,
      canApprove: false,
      routePolicyVersion: null
    };
  }

  function createReviewerWorkspace(sourceInput) {
    const input = sourceInput && typeof sourceInput === "object" && !Array.isArray(sourceInput) ? sourceInput : {};
    const requestState = input.requestState;
    const revision = activeRevision(requestState);
    if (!asText(requestState?.id) || !revision?.submittedSnapshot) {
      return failure("REQUEST_NOT_FOUND", null, [{ field: "requestId", message: "ไม่พบคำขอฉบับที่ยื่นสำหรับพิจารณา" }]);
    }
    if (![workflow?.STATUSES?.SUBMITTED, REVIEW_STATUSES.IN_REVIEW, workflow?.STATUSES?.RETURNED, REVIEW_STATUSES.REJECTED, REVIEW_STATUSES.APPROVED].includes(requestState.status)) {
      return failure("INVALID_TRANSITION", null, [{ field: "requestState.status", message: "คำขอยังไม่อยู่ในขั้นตอนพิจารณา" }]);
    }
    const submittedSnapshot = freeze(clone(revision.submittedSnapshot));
    const frozenRoute = submittedSnapshot?.payload?.routing;
    const contract = frozenRoute && typeof frozenRoute === "object" && !Array.isArray(frozenRoute)
      ? clone(frozenRoute)
      : pendingReviewerContract(requestState);
    if (input.reviewerContract && canonicalFingerprint(input.reviewerContract) !== canonicalFingerprint(contract)) {
      return failure("AUTHORITY_ASSIGNMENT_CHANGED", null, [{ field: "reviewerContract", message: "ข้อมูลผู้พิจารณาไม่ตรงกับเส้นทางที่ล็อกไว้ตอนยื่น" }]);
    }
    const model = {
      schemaVersion: 1,
      requestState: clone(requestState),
      submittedSnapshot,
      reviewerContract: contract,
      authorityRegistry: clone(input.authorityRegistry || null),
      progressPolicy: clone(input.progressPolicy || progress?.PROGRESS_POLICY || null),
      progressOwnerAssignment: clone(input.progressOwnerAssignment || null),
      caseDeadline: asText(input.caseDeadline) || asText(submittedSnapshot?.payload?.deadline?.currentDeadline) || asText(requestState.currentDeadline),
      reviewDecisions: clone(input.reviewDecisions || []),
      timeline: clone(input.timeline || []),
      ui: { decision: "RETURN", error: "", focusTarget: "" }
    };
    model.submittedSnapshotFingerprint = canonicalFingerprint(submittedSnapshot);
    model.reviewerContractFingerprint = canonicalFingerprint(contract);
    return response(true, "REVIEWER_WORKSPACE_CREATED", null, model);
  }

  function replay(model, action, idempotencyKey) {
    if (!idempotencyKey) return null;
    return (model.reviewDecisions || []).find(item => item.action === action && item.idempotencyKey === idempotencyKey) || null;
  }

  function verifyAction(sourceModel, sourceCommand, action) {
    if (!sourceModel || typeof sourceModel !== "object" || Array.isArray(sourceModel)) {
      return failure("REQUEST_NOT_FOUND", sourceModel, [{ field: "workspace", message: "ไม่พบพื้นที่พิจารณาคำขอ" }]);
    }
    const command = sourceCommand && typeof sourceCommand === "object" && !Array.isArray(sourceCommand) ? sourceCommand : {};
    const requestState = sourceModel.requestState;
    const contract = sourceModel.reviewerContract || {};
    const revision = activeRevision(requestState);
    const fields = [
      ["requestId", asText(command.requestId), asText(requestState?.id)],
      ["revisionNo", Number(command.revisionNo), Number(requestState?.activeRevisionNo)]
    ];
    for (const [field, actual, expected] of fields) {
      if (!actual || actual !== expected || actual !== (field === "revisionNo" ? Number(contract.revisionNo) : asText(contract.requestId))) {
        return failure("VERSION_CONFLICT", sourceModel, [{ field, message: "คำขอหรือฉบับที่เปิดอยู่เปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
      }
    }
    const submittedSnapshotFingerprint = canonicalFingerprint(sourceModel.submittedSnapshot);
    const revisionSnapshotFingerprint = canonicalFingerprint(revision?.submittedSnapshot);
    if (!revision?.submittedSnapshot
      || submittedSnapshotFingerprint !== sourceModel.submittedSnapshotFingerprint
      || revisionSnapshotFingerprint !== sourceModel.submittedSnapshotFingerprint) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "submittedSnapshot", message: "ฉบับยื่นเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    if (canonicalFingerprint(contract) !== sourceModel.reviewerContractFingerprint) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "reviewerContract", message: "ข้อมูลมอบหมายหรือกติกาผู้พิจารณาเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    const liveAuthority = authority?.verifyLiveReviewerContract({
      contract,
      authorityRegistry: sourceModel.authorityRegistry,
      actorId: command.actorId,
      actorRole: command.actorRole,
      effectiveDate: command.effectiveDate || contract.effectiveDate
    });
    if (!liveAuthority?.ok) {
      const code = liveAuthority?.code || "AUTHORITY_ASSIGNMENT_CHANGED";
      return failure(code, sourceModel, [{ field: "reviewerContract", message: code === "ACTOR_MISMATCH" ? "บัญชีหรือบทบาทไม่ตรงกับผู้พิจารณาที่ได้รับมอบหมาย" : "ข้อมูลมอบหมายผู้พิจารณาเปลี่ยนแปลง" }]);
    }
    if (contract.status !== "CONFIRMED") {
      return failure(PENDING_CONFIRMATION, sourceModel, [{ field: "reviewerContract.status", message: "ยังไม่ยืนยันผู้พิจารณาคำขอนี้" }]);
    }
    if (!asText(command.actorId) || command.actorId !== asText(contract.reviewerId)) {
      return failure("ACTOR_MISMATCH", sourceModel, [{ field: "actorId", message: "บัญชีปัจจุบันไม่ใช่ผู้พิจารณาที่ได้รับมอบหมาย" }]);
    }
    if (!asText(command.actorRole) || command.actorRole !== asText(contract.reviewerRole)) {
      return failure("ACTOR_MISMATCH", sourceModel, [{ field: "actorRole", message: "บทบาทปัจจุบันไม่ตรงกับบทบาทผู้พิจารณาที่ได้รับมอบหมาย" }]);
    }
    if (!Number.isInteger(command.assignmentVersion) || command.assignmentVersion !== Number(contract.assignmentVersion)) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "assignmentVersion", message: "ข้อมูลมอบหมายผู้พิจารณาเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    if (!asText(command.at) || !asText(command.idempotencyKey)) {
      const field = !asText(command.at) ? "at" : "idempotencyKey";
      return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field, message: "ข้อมูลยืนยันการดำเนินการไม่ครบถ้วน" }]);
    }
    const existing = replay(sourceModel, action, command.idempotencyKey);
    if (existing) return { replay: existing, command };
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== requestState.version) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "expectedVersion", message: "สถานะคำขอเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    return { command };
  }

  function updateState(sourceModel, command, action, status, decisionData = {}) {
    const model = clone(sourceModel);
    model.submittedSnapshot = sourceModel.submittedSnapshot;
    model.requestState.status = status;
    model.requestState.version += 1;
    model.requestState.updatedBy = command.actorId;
    model.requestState.updatedAt = command.at;
    const decision = {
      action,
      requestId: model.requestState.id,
      revisionNo: model.requestState.activeRevisionNo,
      actorId: command.actorId,
      actorRole: command.actorRole,
      assignmentVersion: command.assignmentVersion,
      idempotencyKey: command.idempotencyKey,
      at: command.at,
      ...clone(decisionData)
    };
    model.reviewDecisions = [...(model.reviewDecisions || []), decision];
    model.timeline = [...(model.timeline || []), {
      action,
      requestId: decision.requestId,
      revisionNo: decision.revisionNo,
      actorId: decision.actorId,
      at: decision.at
    }];
    model.ui = { ...(model.ui || {}), error: "", focusTarget: "" };
    return { model, decision };
  }

  function startReview(sourceModel, sourceCommand) {
    const checked = verifyAction(sourceModel, sourceCommand, REVIEW_ACTIONS.START);
    if (checked?.ok === false) return checked;
    if (checked.replay) return response(true, "REVIEW_START_REPLAYED", sourceModel, sourceModel, [], []);
    if (sourceModel.requestState.status !== workflow?.STATUSES?.SUBMITTED) {
      return failure("INVALID_TRANSITION", sourceModel, [{ field: "requestState.status", message: "คำขอนี้ไม่ได้อยู่ในสถานะรอรับตรวจ" }]);
    }
    const updated = updateState(sourceModel, checked.command, REVIEW_ACTIONS.START, REVIEW_STATUSES.IN_REVIEW);
    return response(true, "REVIEW_STARTED", sourceModel, updated.model, [], [{ type: REVIEW_ACTIONS.START, ...updated.decision }]);
  }

  function thaiReason(value) {
    const reason = asText(value);
    return reason && /[\u0E00-\u0E7F]/.test(reason) ? reason : "";
  }

  function snapshotFieldNames(model) {
    return new Set(Object.keys(model.submittedSnapshot?.draftPayload || {}));
  }

  function snapshotDocumentIds(model) {
    return new Set((model.submittedSnapshot?.payload?.documents?.documents || []).map(item => asText(item?.versionId)).filter(Boolean));
  }

  function normalizeAffectedLinks(model, sourceLinks, required) {
    const links = Array.isArray(sourceLinks) ? sourceLinks : [];
    if (required && links.length === 0) return { ok: false, errors: [{ field: "affectedLinks", message: "กรุณาระบุข้อมูลหรือเอกสารที่ต้องแก้ไข" }] };
    const fields = snapshotFieldNames(model);
    const documentIds = snapshotDocumentIds(model);
    const assignments = model.submittedSnapshot?.payload?.documents?.requirementAssignments || {};
    const assignedDocumentIds = new Set(Object.values(assignments).flatMap(sourceItems => (Array.isArray(sourceItems) ? sourceItems : [])
      .map(item => asText(typeof item === "string" ? item : item?.versionId))
      .filter(Boolean)));
    const normalized = [];
    for (const sourceLink of links) {
      const link = sourceLink && typeof sourceLink === "object" && !Array.isArray(sourceLink) ? sourceLink : {};
      const field = asText(link.field);
      const requirementCode = asText(link.requirementCode);
      const documentVersionId = asText(link.documentVersionId);
      if (field && fields.has(field)) normalized.push({ field });
      else if (requirementCode && documentVersionId && documentIds.has(documentVersionId)) {
        if (requirementCode === "OPTIONAL_SUPPORTING_EVIDENCE") {
          if (assignedDocumentIds.has(documentVersionId)) {
            return { ok: false, errors: [{ field: "affectedLinks", message: "เอกสารเวอร์ชันนี้ถูกผูกกับรายการบังคับแล้ว จึงอ้างเป็นหลักฐานสนับสนุนที่ไม่ผูกไม่ได้" }] };
          }
          normalized.push({ requirementCode, documentVersionId });
          continue;
        }
        const assignedIds = (Array.isArray(assignments[requirementCode]) ? assignments[requirementCode] : [])
          .map(item => asText(typeof item === "string" ? item : item?.versionId))
          .filter(Boolean);
        if (!assignedIds.includes(documentVersionId)) {
          return { ok: false, errors: [{ field: "affectedLinks", message: "เอกสารเวอร์ชันที่อ้างถึงไม่ได้ผูกกับรายการบังคับนี้ในฉบับยื่น" }] };
        }
        normalized.push({ requirementCode, documentVersionId });
      }
      else return { ok: false, errors: [{ field: "affectedLinks", message: "รายการข้อมูลหรือเอกสารที่อ้างถึงไม่อยู่ในฉบับยื่น" }] };
    }
    return { ok: true, result: normalized };
  }

  function completeReview(sourceModel, sourceCommand, action, status, options = {}) {
    const checked = verifyAction(sourceModel, sourceCommand, action);
    if (checked?.ok === false) return checked;
    if (checked.replay) return response(true, `${action}_REPLAYED`, sourceModel, sourceModel, [], []);
    if (sourceModel.requestState.status !== REVIEW_STATUSES.IN_REVIEW) {
      return failure("INVALID_TRANSITION", sourceModel, [{ field: "requestState.status", message: "ต้องรับเรื่องตรวจก่อนบันทึกผลพิจารณา" }]);
    }
    const reason = thaiReason(checked.command.reason);
    if (!reason) return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "reason", message: "กรุณาระบุเหตุผลเป็นภาษาไทย" }]);
    const links = normalizeAffectedLinks(sourceModel, checked.command.affectedLinks, options.requireAffectedLinks === true);
    if (!links.ok) return failure("MISSING_REQUIRED_FIELD", sourceModel, links.errors);
    const updated = updateState(sourceModel, checked.command, action, status, { reason, affectedLinks: links.result });
    updated.model.requestState.reviewOutcome = clone(updated.decision);
    return response(true, options.code, sourceModel, updated.model, [], [{ type: action, ...updated.decision }]);
  }

  function returnForCorrection(sourceModel, sourceCommand) {
    return completeReview(sourceModel, sourceCommand, REVIEW_ACTIONS.RETURN, workflow?.STATUSES?.RETURNED, {
      requireAffectedLinks: true,
      code: "REQUEST_RETURNED"
    });
  }

  function rejectRequest(sourceModel, sourceCommand) {
    return completeReview(sourceModel, sourceCommand, REVIEW_ACTIONS.REJECT, REVIEW_STATUSES.REJECTED, {
      requireAffectedLinks: false,
      code: "REQUEST_REJECTED"
    });
  }

  function addCivilDays(value, days) {
    const text = asText(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isInteger(days)) return "";
    const date = new Date(`${text}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) return "";
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function approveRequest(sourceModel, sourceCommand) {
    const checked = verifyAction(sourceModel, sourceCommand, REVIEW_ACTIONS.APPROVE);
    if (checked?.ok === false) return checked;
    if (checked.replay) return response(true, "REQUEST_APPROVAL_REPLAYED", sourceModel, sourceModel, [], []);
    if (sourceModel.requestState.status !== REVIEW_STATUSES.IN_REVIEW) {
      return failure("INVALID_TRANSITION", sourceModel, [{ field: "requestState.status", message: "ต้องรับเรื่องตรวจก่อนอนุมัติ" }]);
    }
    const contract = sourceModel.reviewerContract || {};
    if (contract.authorityStatus !== "CONFIRMED" || contract.dayPolicyStatus !== "CONFIRMED"
      || contract.canApprove !== true || !asText(contract.routePolicyVersion)) {
      return failure(PENDING_CONFIRMATION, sourceModel, [{ field: "reviewerContract.authorityStatus", message: "ยังไม่ยืนยันอำนาจผู้อนุมัติหรือเกณฑ์จำนวนวันที่อนุมัติ จึงอนุมัติไม่ได้" }]);
    }
    if (asText(checked.command.routePolicyVersion) !== asText(contract.routePolicyVersion)) {
      return failure("VERSION_CONFLICT", sourceModel, [{ field: "routePolicyVersion", message: "กติกาเส้นทางผู้อนุมัติเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    const approvedDays = checked.command.approvedDays;
    const requestedDays = sourceModel.submittedSnapshot?.payload?.deadline?.requestedDays
      ?? sourceModel.submittedSnapshot?.draftPayload?.requestedDays;
    const approvedDaysCheck = rules?.validateApprovedDays(requestedDays, approvedDays);
    if (!approvedDaysCheck?.ok) {
      const message = approvedDaysCheck?.code === "APPROVED_DAYS_EXCEED_REQUESTED"
        ? "จำนวนวันที่อนุมัติห้ามเกินจำนวนวันที่ขอ"
        : "จำนวนวันที่อนุมัติต้องเป็นจำนวนเต็ม 1 ถึง 60 วัน";
      return failure(approvedDaysCheck?.code || "INVALID_APPROVED_DAYS", sourceModel, [{ field: "approvedDays", message }]);
    }
    const reason = thaiReason(checked.command.reason);
    if (!reason) return failure("MISSING_REQUIRED_FIELD", sourceModel, [{ field: "reason", message: "กรุณาระบุความเห็นอนุมัติเป็นภาษาไทย" }]);
    const originalDeadline = asText(sourceModel.submittedSnapshot?.payload?.deadline?.currentDeadline);
    const submittedDeadline = sourceModel.submittedSnapshot?.payload?.deadline || {};
    const deadlineCheck = rules?.verifyDeadlineContract({
      deadlineBasis: sourceModel.requestState?.deadlineBasis,
      deadlineVersion: sourceModel.requestState?.deadlineVersion,
      currentDeadline: sourceModel.requestState?.currentDeadline,
      submittedDeadlineBasis: submittedDeadline.basis,
      submittedDeadlineVersion: submittedDeadline.deadlineVersion
    });
    if (!deadlineCheck?.ok || !originalDeadline || originalDeadline !== asText(sourceModel.caseDeadline)
      || originalDeadline !== asText(sourceModel.requestState?.currentDeadline)) {
      return failure(deadlineCheck?.code || "DEADLINE_VERSION_CONFLICT", sourceModel, [{ field: "caseDeadline", message: "กำหนดเวลาสำนวนเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]);
    }
    const newDeadline = addCivilDays(originalDeadline, approvedDays);
    if (!newDeadline) return failure("DEADLINE_UNKNOWN", sourceModel, [{ field: "caseDeadline", message: "คำนวณกำหนดเวลาใหม่ไม่ได้" }]);
    const updated = updateState(sourceModel, checked.command, REVIEW_ACTIONS.APPROVE, REVIEW_STATUSES.APPROVED, {
      reason,
      requestedDays,
      approvedDays,
      previousDeadline: originalDeadline,
      newDeadline,
      routePolicyVersion: contract.routePolicyVersion,
      signature: {
        method: "DIGITAL_SIGNATURE",
        signerId: checked.command.actorId,
        signerRole: checked.command.actorRole,
        signedAt: checked.command.at,
        revisionNo: sourceModel.requestState.activeRevisionNo
      }
    });
    updated.model.requestState.requestedDays = requestedDays;
    updated.model.requestState.approvedDays = approvedDays;
    updated.model.requestState.currentDeadline = newDeadline;
    updated.model.requestState.deadlineVersion += 1;
    updated.model.requestState.reviewOutcome = clone(updated.decision);
    updated.model.caseDeadline = newDeadline;
    updated.model.deadlineApplication = {
      requestId: updated.model.requestState.id,
      revisionNo: updated.model.requestState.activeRevisionNo,
      idempotencyKey: checked.command.idempotencyKey,
      previousDeadline: originalDeadline,
      newDeadline,
      requestedDays,
      approvedDays,
      previousDeadlineVersion: sourceModel.requestState.deadlineVersion,
      newDeadlineVersion: updated.model.requestState.deadlineVersion,
      appliedAt: checked.command.at
    };
    const schedule = progress?.createProgressSchedule?.({
      approvedExtension: {
        requestId: updated.model.requestState.id,
        revisionNo: updated.model.requestState.activeRevisionNo,
        extensionRound: updated.model.requestState.roundNo,
        previousDeadline: originalDeadline,
        newDeadline
      },
      policy: sourceModel.progressPolicy,
      ownerAssignment: sourceModel.progressOwnerAssignment,
      at: checked.command.at,
      idempotencyKey: `${checked.command.idempotencyKey}:progress`
    });
    updated.model.progressScheduleStatus = schedule?.ok ? "CONFIRMED" : "PENDING_CONFIRMATION";
    updated.model.progressSchedule = schedule?.ok ? clone(schedule.result) : null;
    return response(true, "REQUEST_APPROVED", sourceModel, updated.model, [], [{ type: REVIEW_ACTIONS.APPROVE, ...updated.decision }]);
  }

  function attemptSnapshotMutation(sourceModel) {
    return failure("SNAPSHOT_IMMUTABLE", sourceModel, [{ field: "submittedSnapshot", message: "ผู้พิจารณาแก้ข้อมูลหรือเอกสารในฉบับยื่นไม่ได้" }]);
  }

  function verifyReviewerPersistence(latestModel, nextModel, persistenceContext = {}) {
    const latestRequest = latestModel?.requestState;
    const nextRequest = nextModel?.requestState;
    const expectedVersion = Number(persistenceContext.expectedVersion);
    const finalVersion = Number(persistenceContext.finalVersion);
    const snapshotFingerprint = canonicalFingerprint(latestModel?.submittedSnapshot);
    const contractFingerprint = canonicalFingerprint(latestModel?.reviewerContract);
    const valid = Boolean(latestRequest?.id)
      && latestRequest.id === nextRequest?.id
      && Number(latestRequest.activeRevisionNo) === Number(nextRequest?.activeRevisionNo)
      && Number(latestRequest.version) === expectedVersion
      && finalVersion === expectedVersion + 1
      && Number(nextRequest?.version) === finalVersion
      && snapshotFingerprint === latestModel?.submittedSnapshotFingerprint
      && snapshotFingerprint === nextModel?.submittedSnapshotFingerprint
      && canonicalFingerprint(nextModel?.submittedSnapshot) === nextModel?.submittedSnapshotFingerprint
      && contractFingerprint === latestModel?.reviewerContractFingerprint
      && contractFingerprint === nextModel?.reviewerContractFingerprint
      && canonicalFingerprint(nextModel?.reviewerContract) === nextModel?.reviewerContractFingerprint;
    return valid
      ? Object.freeze({ ok: true, code: "REVIEW_PERSISTENCE_VERIFIED" })
      : Object.freeze({ ok: false, code: "VERSION_CONFLICT", errors: Object.freeze([{ field: "reviewPersistence", message: "คำขอ ฉบับยื่น หรือกติกาผู้พิจารณาเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด" }]) });
  }

  function shouldPersistReviewResult(result) {
    return Boolean(result?.ok && !String(result.code || "").endsWith("_REPLAYED") && Array.isArray(result.events) && result.events.length > 0);
  }

  function persistReviewResult(result, persist, persistenceContext = {}) {
    if (!result?.ok || !shouldPersistReviewResult(result)) return result;
    try {
      persist(result.result, persistenceContext);
      return result;
    } catch (error) {
      return failure("PERSISTENCE_FAILED", result.state, [{ field: "persistence", message: asText(error?.message) || "บันทึกผลพิจารณาไม่สำเร็จ" }]);
    }
  }

  function sanitizeSubmittedHtml(value) {
    return String(value || "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
      .replace(/<script\b[^>]*\/?\s*>/gi, "")
      .replace(/<(?:iframe|object|embed|meta|base|link)\b[^>]*>[\s\S]*?<\/(?:iframe|object)>\s*/gi, "")
      .replace(/<(?:iframe|object|embed|meta|base|link)\b[^>]*\/?\s*>/gi, "")
      .replace(/\s+on[a-z][a-z0-9_-]*\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  function statusLabel(status) {
    return ({
      SUBMITTED: "รอรับตรวจ",
      IN_REVIEW: "อยู่ระหว่างพิจารณา",
      RETURNED: "ส่งกลับแก้ไข",
      REJECTED: "ไม่อนุมัติ",
      APPROVED: "อนุมัติแล้ว"
    })[status] || "สถานะไม่ระบุ";
  }

  function renderSubmittedFields(model) {
    const labels = {
      progress: "ความคืบหน้าปัจจุบัน",
      workDone: "งานที่ดำเนินการแล้ว",
      workRemaining: "งานที่ยังเหลือ",
      obstacles: "ปัญหาและอุปสรรค",
      reason: "เหตุผลและความจำเป็น",
      requestedDays: "จำนวนวันที่ขอ"
    };
    const payload = model.submittedSnapshot?.draftPayload || {};
    return `<dl class="a5-extension-review-fields">${Object.entries(labels).map(([field, label]) => `<div data-review-field="${field}"><dt>${label}</dt><dd>${escapeHtml(payload[field] ?? "ไม่ระบุ")}</dd></div>`).join("")}</dl>`;
  }

  function renderSubmittedDocuments(model) {
    const documents = model.submittedSnapshot?.payload?.documents?.documents || [];
    return `<ol class="a5-extension-review-documents">${documents.map(item => `<li data-review-document-version="${escapeHtml(item.versionId)}"><strong>${escapeHtml(item.name || "เอกสารประกอบ")}</strong><span>เวอร์ชัน ${escapeHtml(item.version ?? "ไม่ระบุ")}</span><code>${escapeHtml(item.versionId)}</code></li>`).join("") || "<li>ไม่มีเอกสารในฉบับยื่น</li>"}</ol>`;
  }

  function renderReviewSummary(model) {
    const deadline = model.submittedSnapshot?.payload?.deadline || {};
    const checklist = model.submittedSnapshot?.payload?.checklist?.requirements || [];
    const requirementLabels = {
      PROGRESS_REPORT: "รายงานความคืบหน้า",
      CASE_PLAN: "แผนงานคดี",
      WORK_LOG: "บันทึกการปฏิบัติงาน",
      RECEIVED_DATE_EVIDENCE: "หลักฐานวันรับสำนวน",
      INQUIRY_APPOINTMENT_ORDER: "คำสั่งแต่งตั้งคณะไต่สวน"
    };
    return `<dl class="a5-extension-review-summary">
      <div><dt>กำหนดเดิม</dt><dd>${escapeHtml(deadline.currentDeadline || model.requestState.currentDeadline || "ไม่ระบุ")}</dd></div>
      <div><dt>จำนวนวันที่ขอ</dt><dd>${escapeHtml(deadline.requestedDays ?? model.submittedSnapshot?.draftPayload?.requestedDays ?? "ไม่ระบุ")}</dd></div>
      <div><dt>จำนวนวันที่อนุมัติ</dt><dd>${escapeHtml(model.requestState.approvedDays ?? "ยังไม่อนุมัติ")}</dd></div>
      <div><dt>กำหนดปัจจุบัน</dt><dd>${escapeHtml(model.caseDeadline || "ไม่ระบุ")}</dd></div>
    </dl>${checklist.length ? `<ol class="a5-extension-review-checklist">${checklist.map(item => `<li><strong>${escapeHtml(requirementLabels[item.requirementCode] || "เอกสารประกอบ")}</strong><span>${item.complete ? "พร้อม" : "ไม่พร้อม"}</span></li>`).join("")}</ol>` : ""}`;
  }

  function renderDecisionForm(model) {
    if (model.requestState.status !== REVIEW_STATUSES.IN_REVIEW) return "";
    const fieldLabels = {
      progress: "ความคืบหน้าปัจจุบัน",
      workDone: "งานที่ดำเนินการแล้ว",
      workRemaining: "งานที่ยังเหลือ",
      obstacles: "ปัญหาและอุปสรรค",
      reason: "เหตุผลและความจำเป็น",
      requestedDays: "จำนวนวันที่ขอ"
    };
    const fields = Object.keys(model.submittedSnapshot?.draftPayload || {});
    const documents = model.submittedSnapshot?.payload?.documents?.documents || [];
    const approvalBlocked = model.reviewerContract?.authorityStatus !== "CONFIRMED"
      || model.reviewerContract?.dayPolicyStatus !== "CONFIRMED"
      || model.reviewerContract?.canApprove !== true;
    return `<section class="a5-extension-review-decision" aria-labelledby="a5ExtensionReviewDecisionTitle">
      <h3 id="a5ExtensionReviewDecisionTitle">บันทึกผลพิจารณา</h3>
      <div class="ws-field"><label for="a5ExtensionReviewDecision">ผลพิจารณา</label><select id="a5ExtensionReviewDecision"><option value="RETURN">ส่งกลับแก้ไข</option><option value="REJECT">ไม่อนุมัติ</option><option value="APPROVE"${approvalBlocked ? " disabled" : ""}>อนุมัติ${approvalBlocked ? " — รอยืนยันกติกา" : ""}</option></select></div>
      <div class="ws-field"><label for="a5ExtensionReviewReason">เหตุผลหรือความเห็นภาษาไทย</label><textarea id="a5ExtensionReviewReason"></textarea></div>
      <div class="ws-field"><label for="a5ExtensionReviewField">ข้อมูลที่ต้องแก้ไข</label><select id="a5ExtensionReviewField"><option value="">ไม่ระบุ</option>${fields.map(field => `<option value="${escapeHtml(field)}">${escapeHtml(fieldLabels[field] || "ข้อมูลคำขอ")}</option>`).join("")}</select></div>
      <div class="ws-field"><label for="a5ExtensionReviewDocument">เอกสารที่ต้องแก้ไข</label><select id="a5ExtensionReviewDocument"><option value="">ไม่ระบุ</option>${documents.map(item => `<option value="${escapeHtml(item.versionId)}">${escapeHtml(item.name || item.versionId)}</option>`).join("")}</select></div>
      <div class="ws-field"><label for="a5ExtensionApprovedDays">จำนวนวันที่อนุมัติ</label><input id="a5ExtensionApprovedDays" type="number" min="1" max="60" value="${escapeHtml(model.submittedSnapshot?.payload?.deadline?.requestedDays || "")}"><small>อนุมัติได้ 1–60 วัน และไม่เกินจำนวนวันที่ขอ</small></div>
      <p class="ws-policy-note">การกดบันทึกผลอนุมัติจะลงนาม Digital Signature ของผู้พิจารณาและตรึงผลอนุมัติ</p>
      ${approvalBlocked ? '<p class="a5-extension-policy-pending">รอยืนยันอำนาจผู้อนุมัติและเกณฑ์จำนวนวันที่อนุมัติ จึงยังอนุมัติไม่ได้</p>' : ""}
      <button type="button" class="ws-button primary" data-a5-extension-review-action="submit-decision">บันทึกผลพิจารณา</button>
    </section>`;
  }

  function renderReviewOutcome(model) {
    const terminalStatuses = new Set([workflow?.STATUSES?.RETURNED, REVIEW_STATUSES.REJECTED, REVIEW_STATUSES.APPROVED]);
    if (!terminalStatuses.has(model.requestState.status)) return "";
    const outcome = model.requestState.reviewOutcome || [...(model.reviewDecisions || [])].reverse().find(item => item.action !== REVIEW_ACTIONS.START) || {};
    const title = ({
      RETURNED: "ส่งกลับให้แก้ไขแล้ว",
      REJECTED: "ไม่อนุมัติคำขอแล้ว",
      APPROVED: "อนุมัติคำขอแล้ว"
    })[model.requestState.status] || "สิ้นสุดการพิจารณา";
    const links = Array.isArray(outcome.affectedLinks) ? outcome.affectedLinks : [];
    return `<section class="a5-extension-review-outcome" aria-labelledby="a5ExtensionReviewOutcomeTitle">
      <h3 id="a5ExtensionReviewOutcomeTitle">${escapeHtml(title)}</h3>
      <p><strong>เหตุผลหรือความเห็น:</strong> ${escapeHtml(outcome.reason || "ไม่ระบุ")}</p>
      ${Number.isInteger(outcome.approvedDays) ? `<p><strong>จำนวนวันที่อนุมัติ:</strong> ${escapeHtml(outcome.approvedDays)} วัน</p>` : ""}
      ${outcome.signature ? `<p><strong>Digital Signature:</strong> ${escapeHtml(outcome.signature.signerId || "ไม่ระบุ")} · ${escapeHtml(outcome.signature.signedAt || "ไม่ระบุเวลา")}</p>` : ""}
      ${links.length ? `<ul>${links.map(link => `<li>${link.field ? `ข้อมูลที่ต้องแก้ไข: ${escapeHtml(link.field)}` : `เอกสารเวอร์ชัน: ${escapeHtml(link.documentVersionId || "ไม่ระบุ")}`}</li>`).join("")}</ul>` : ""}
      <p class="a5-extension-policy-pending">ผลพิจารณานี้เป็นข้อมูลอ่านอย่างเดียว</p>
    </section>`;
  }

  function renderReviewerWorkspace(model) {
    if (!model?.requestState || !model?.submittedSnapshot) return '<div class="a5-extension-error" role="alert">ไม่พบคำขอฉบับที่ยื่นสำหรับพิจารณา</div>';
    const status = model.requestState.status;
    // Rendered directly (not in an <iframe>) — the content is our own paperExt() output, sanitized
    // above of <script>/event-handler/iframe/object markup, same as every other paper tab in this app.
    const renderedForm = sanitizeSubmittedHtml(model.submittedSnapshot?.payload?.renderedForm?.content);
    const safePreview = renderedForm
      ? `<div class="a5-extension-review-frame" title="แบบคำขอฉบับยื่น">${renderedForm}</div>`
      : "ไม่พบตัวอย่างแบบคำขอ";
    const canStart = status === workflow?.STATUSES?.SUBMITTED;
    return `<section class="a5-extension-review-workspace" data-review-status="${escapeHtml(status)}">
      <header class="a5-extension-workspace-head"><div><p class="ws-kicker">งานพิจารณาคำขอขยายเวลา</p><h2>คำขอ ${escapeHtml(model.requestState.id)} · ฉบับที่ ${escapeHtml(model.requestState.activeRevisionNo)}</h2></div><span class="ws-status">${escapeHtml(statusLabel(status))}</span></header>
      <div class="a5-extension-document-workspace">
        <div class="a5-extension-task-pane">
          <section class="ws-section"><h3>สรุปคำขอและรายการตรวจ</h3>${renderReviewSummary(model)}</section>
          <section class="ws-section"><h3>ข้อมูลฉบับยื่น</h3>${renderSubmittedFields(model)}</section>
          <section class="ws-section"><h3>เอกสารฉบับยื่น</h3>${renderSubmittedDocuments(model)}</section>
          ${model.ui?.error ? `<p class="a5-extension-error" role="alert">${escapeHtml(model.ui.error)}</p>` : ""}
          ${canStart ? '<button type="button" class="ws-button primary" data-a5-extension-review-action="start">รับเรื่องตรวจ</button>' : status === REVIEW_STATUSES.IN_REVIEW ? renderDecisionForm(model) : renderReviewOutcome(model)}
        </div>
        <aside class="a5-extension-document-pane" aria-label="ตัวอย่างแบบคำขอฉบับยื่น"><header><h3>แบบคำขอที่ยื่นแล้ว</h3><span class="a5-extension-version-badge">อ่านอย่างเดียว</span></header><div class="a5-extension-form-preview">${safePreview}</div></aside>
      </div>
    </section>`;
  }

  function mountReviewerWorkspace(host, options = {}) {
    if (!host || typeof host.addEventListener !== "function") return failure("INVALID_WORKSPACE", options.model, [{ field: "host", message: "ไม่พบพื้นที่แสดงผลผู้พิจารณา" }]);
    let model = options.model;
    const now = typeof options.now === "function" ? options.now : () => new Date().toISOString();
    const actorId = asText(options.actorId);
    const actorRole = asText(options.actorRole);
    const persist = typeof options.persist === "function" ? options.persist : () => {};
    const render = () => { host.innerHTML = renderReviewerWorkspace(model); };
    const focusTargetForField = field => ({
      reason: "a5ExtensionReviewReason",
      affectedLinks: "a5ExtensionReviewField",
      approvedDays: "a5ExtensionApprovedDays",
      "reviewerContract.authorityStatus": "a5ExtensionReviewDecision",
      routePolicyVersion: "a5ExtensionReviewDecision"
    })[field] || "a5ExtensionReviewDecision";
    const focusReviewError = () => {
      const targetId = asText(model.ui?.focusTarget);
      if (!targetId) return false;
      const control = host.querySelector?.(`#${targetId}`);
      if (!control || typeof control.focus !== "function") return false;
      control.focus();
      control.scrollIntoView?.({ block: "center", behavior: "smooth" });
      return true;
    };
    const commit = result => {
      if (!result.ok) {
        const error = result.errors?.[0] || {};
        model = clone(model);
        model.submittedSnapshot = options.model.submittedSnapshot;
        model.ui = { ...(model.ui || {}), error: error.message || "ดำเนินการไม่สำเร็จ", focusTarget: focusTargetForField(error.field) };
        render();
        focusReviewError();
        return result;
      }
      const persisted = persistReviewResult(result, persist, {
        expectedVersion: model.requestState.version,
        finalVersion: result.result.requestState.version
      });
      if (!persisted.ok) {
        model = clone(model);
        model.submittedSnapshot = options.model.submittedSnapshot;
        model.ui = { ...(model.ui || {}), error: persisted.errors?.[0]?.message || "บันทึกผลพิจารณาไม่สำเร็จ", focusTarget: "" };
        render();
        return persisted;
      }
      model = result.result;
      options.onChange?.(model, result);
      render();
      return result;
    };
    const baseCommand = action => ({
      requestId: model.requestState.id,
      revisionNo: model.requestState.activeRevisionNo,
      expectedVersion: model.requestState.version,
      actorId,
      actorRole,
      assignmentVersion: Number(model.reviewerContract?.assignmentVersion),
      effectiveDate: model.reviewerContract?.effectiveDate,
      at: now(),
      idempotencyKey: `${model.requestState.id}:${model.requestState.activeRevisionNo}:${action}:${model.requestState.version}`
    });
    host.addEventListener("click", event => {
      const button = event.target.closest?.("[data-a5-extension-review-action]");
      if (!button) return;
      const actionId = button.dataset.a5ExtensionReviewAction;
      // Phase 0 Task 4 — primary hard-block check (ชั้น 1) for the two
      // deny-listed reviewer actions (start / submit-decision, action-matrix
      // Category 5). The button click and any direct domain call both stop
      // here: the guard's Section 4.5 envelope surfaces the Thai messageTh
      // in the workspace error region (no raw ID, no raw status, no English
      // error) and no persistence step runs.
      const phase0Guard = root.ECMISActivity5Phase0Guard;
      if (phase0Guard?.isBlocked(actionId)) {
        const blocked = phase0Guard.blockedResult(actionId, model);
        model = clone(model);
        model.submittedSnapshot = options.model.submittedSnapshot;
        model.ui = { ...(model.ui || {}), error: blocked.messageTh, focusTarget: "" };
        render();
        return;
      }
      // ชั้น 2 (defense in depth): run commit (domain call + persist →
      // saveState) under Guard.withAction so any write attempted while the
      // blocked ID is ambient throws Phase0GuardBlockedError at the Task 3
      // chokepoints. No guard loaded → identical behaviour.
      const guardRun = fn => phase0Guard ? phase0Guard.withAction(actionId, fn) : fn();
      if (actionId === "start") {
        guardRun(() => commit(startReview(model, baseCommand("start"))));
        return;
      }
      const decision = host.querySelector?.("#a5ExtensionReviewDecision")?.value;
      const reason = host.querySelector?.("#a5ExtensionReviewReason")?.value || "";
      const field = host.querySelector?.("#a5ExtensionReviewField")?.value || "";
      const documentVersionId = host.querySelector?.("#a5ExtensionReviewDocument")?.value || "";
      const affectedLinks = [];
      if (field) affectedLinks.push({ field });
      if (documentVersionId) {
        const assignments = model.submittedSnapshot?.payload?.documents?.requirementAssignments || {};
        const requirementCode = Object.keys(assignments).find(code => (assignments[code] || []).includes(documentVersionId)) || "OPTIONAL_SUPPORTING_EVIDENCE";
        affectedLinks.push({ requirementCode, documentVersionId });
      }
      const command = { ...baseCommand(decision), reason, affectedLinks };
      if (decision === "RETURN") guardRun(() => commit(returnForCorrection(model, command)));
      else if (decision === "REJECT") guardRun(() => commit(rejectRequest(model, command)));
      else guardRun(() => commit(approveRequest(model, {
        ...command,
        approvedDays: Number(host.querySelector?.("#a5ExtensionApprovedDays")?.value),
        routePolicyVersion: model.reviewerContract?.routePolicyVersion
      })));
    });
    render();
    return response(true, "REVIEWER_WORKSPACE_MOUNTED", null, { getModel: () => model, render });
  }

  const api = Object.freeze({
    REVIEW_ACTIONS,
    REVIEW_STATUSES,
    createReviewerWorkspace,
    startReview,
    returnForCorrection,
    rejectRequest,
    approveRequest,
    attemptSnapshotMutation,
    canonicalFingerprint,
    verifyReviewerPersistence,
    shouldPersistReviewResult,
    persistReviewResult,
    renderReviewerWorkspace,
    mountReviewerWorkspace
  });
  root.ECMISActivity5ExtensionReview = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
