(function initializeActivity5ExtensionWorkflow(root) {
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);

  const STATUSES = Object.freeze({
    DRAFT: "DRAFT",
    READY: "READY",
    SUBMITTED: "SUBMITTED",
    IN_REVIEW: "IN_REVIEW",
    RETURNED: "RETURNED",
    REJECTED: "REJECTED",
    APPROVED: "APPROVED"
  });
  const REQUIRED_DRAFT_FIELDS = Object.freeze([
    "progress",
    "workDone",
    "workRemaining",
    "obstacles",
    "reason",
    "requestedDays"
  ]);

  function asText(value) {
    return String(value || "").trim();
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

  function response(ok, code, state, result, events) {
    return Object.freeze({ ok, code, state, result: freeze(result), events: freeze(events) });
  }

  function failure(code, sourceState, result = null) {
    return response(false, code, sourceState, result, []);
  }

  function requestState(sourceState) {
    return sourceState && typeof sourceState === "object" && asText(sourceState.id) ? sourceState : null;
  }

  function activeRevision(state) {
    return Array.isArray(state.revisions)
      ? state.revisions.find(revision => revision && typeof revision === "object" && !Array.isArray(revision) && revision.revisionNo === state.activeRevisionNo) || null
      : null;
  }

  function revisionFailure(sourceState) {
    const revisions = sourceState.revisions;
    const validObjects = Array.isArray(revisions)
      && revisions.length > 0
      && revisions.every(revision => revision && typeof revision === "object" && !Array.isArray(revision));
    if (!validObjects) return failure("REQUEST_NOT_FOUND", sourceState, { errors: [{ field: "revisions" }] });
    const revisionNos = revisions.map(revision => revision.revisionNo);
    const validNumbers = revisionNos.every(revisionNo => Number.isInteger(revisionNo) && revisionNo > 0);
    const uniqueNumbers = new Set(revisionNos).size === revisionNos.length;
    const hasActiveRevision = revisionNos.filter(revisionNo => revisionNo === sourceState.activeRevisionNo).length === 1;
    return validNumbers && uniqueNumbers && hasActiveRevision
      ? null
      : failure("REQUEST_NOT_FOUND", sourceState, { errors: [{ field: "revisions" }] });
  }

  function requesterFailure(sourceState, command) {
    if (!requestState(sourceState)) return failure("REQUEST_NOT_FOUND", sourceState);
    const actorId = asText(command.actorId);
    if (!actorId) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: [{ field: "actorId" }] });
    if (actorId !== asText(sourceState.ownerId)) return failure("ACTOR_MISMATCH", sourceState);
    return null;
  }

  function createDraft(sourceState, sourceCommand) {
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const requestId = asText(command.requestId);
    const caseId = asText(command.caseId);
    const ownerId = asText(command.ownerId);
    const actorId = asText(command.actorId);
    const at = asText(command.at);
    const extensionType = asText(command.extensionType);
    const rule = rules?.getExtensionPolicy(extensionType) || rules?.getExtensionRule(extensionType) || null;
    const roundNo = Number(command.roundNo);
    const roundCheck = rules?.evaluateNormalRound(extensionType, roundNo);
    if (roundCheck && !roundCheck.ok) return failure(roundCheck.code, sourceState, roundCheck.result || { errors: roundCheck.errors || [] });
    const deadlineBasis = command.deadlineBasis && typeof command.deadlineBasis === "object" && !Array.isArray(command.deadlineBasis)
      ? clone(command.deadlineBasis)
      : null;
    const deadlineVersion = Number(command.deadlineVersion);
    const reviewerContract = command.reviewerContract && typeof command.reviewerContract === "object" && !Array.isArray(command.reviewerContract)
      ? clone(command.reviewerContract)
      : null;
    const missingFields = [
      ["requestId", requestId],
      ["caseId", caseId],
      ["extensionType", extensionType],
      ["roundNo", Number.isInteger(roundNo) && roundNo > 0],
      ["ownerId", ownerId],
      ["actorId", actorId],
      ["at", at],
      ["deadlineBasis", deadlineBasis],
      ["deadlineVersion", Number.isInteger(deadlineVersion) && deadlineVersion >= 1],
      ["currentDeadline", asText(command.currentDeadline)],
      ["reviewerContract", reviewerContract]
    ].filter(([, present]) => !present).map(([field]) => field);

    if (missingFields.length) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: missingFields.map(field => ({ field })) });
    if (!rule) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: [{ field: "extensionType" }] });
    if (reviewerContract.status !== "CONFIRMED"
      || reviewerContract.requestId !== requestId
      || Number(reviewerContract.revisionNo) !== 1
      || reviewerContract.extensionType !== extensionType
      || Number(reviewerContract.roundNo) !== roundNo
      || reviewerContract.authorityTier !== roundCheck?.result?.authorityTier) {
      return failure("PENDING_CONFIRMATION", sourceState, { errors: [{ field: "reviewerContract" }] });
    }
    const cutoff = rules?.calculateSubmissionCutoff(command.currentDeadline);
    if (!cutoff?.ok) return failure(cutoff?.code || "DEADLINE_UNKNOWN", sourceState, { errors: cutoff?.errors || [] });
    if (actorId !== ownerId) return failure("ACTOR_MISMATCH", sourceState);
    if (sourceState && typeof sourceState === "object" && asText(sourceState.id)) return failure("DUPLICATE_REQUEST", sourceState);

    const draftPayload = clone(command.draftPayload && typeof command.draftPayload === "object" ? command.draftPayload : {});
    const revision = {
      requestId,
      revisionNo: 1,
      baseRevisionNo: null,
      draftPayload,
      submittedSnapshot: null,
      createdBy: actorId,
      createdAt: at,
      updatedBy: actorId,
      updatedAt: at,
      submittedBy: "",
      submittedAt: ""
    };
    const state = {
      id: requestId,
      caseId,
      extensionType,
      formId: rule.formId,
      roundNo,
      status: STATUSES.DRAFT,
      currentDeadline: asText(command.currentDeadline),
      submissionCutoff: cutoff.result.submissionCutoff,
      deadlineBasis,
      deadlineVersion,
      reviewerContract,
      requestedDays: null,
      approvedDays: null,
      activeRevisionNo: 1,
      version: 1,
      ownerId,
      createdBy: actorId,
      createdAt: at,
      updatedBy: actorId,
      updatedAt: at,
      revisions: [revision]
    };
    const events = [{ type: "DRAFT_CREATED", requestId, revisionNo: 1, actorId, at }];
    return response(true, "DRAFT_CREATED", state, { requestId, revisionNo: 1 }, events);
  }

  function saveDraft(sourceState, sourceCommand) {
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const denied = requesterFailure(sourceState, command);
    if (denied) return denied;
    const invalidRevision = revisionFailure(sourceState);
    if (invalidRevision) return invalidRevision;
    if (![STATUSES.DRAFT, STATUSES.READY].includes(sourceState.status)) return failure("SNAPSHOT_IMMUTABLE", sourceState);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== sourceState.version) {
      return failure("VERSION_CONFLICT", sourceState);
    }
    const at = asText(command.at);
    const patch = command.patch && typeof command.patch === "object" && !Array.isArray(command.patch) ? command.patch : null;
    const missingFields = [];
    if (!at) missingFields.push("at");
    if (!patch || Object.keys(patch).length === 0) missingFields.push("patch");
    if (missingFields.length) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: missingFields.map(field => ({ field })) });

    const state = clone(sourceState);
    const revision = activeRevision(state);
    if (!revision || revision.submittedSnapshot) return failure("SNAPSHOT_IMMUTABLE", sourceState);
    revision.draftPayload = { ...revision.draftPayload, ...clone(patch) };
    revision.updatedBy = command.actorId;
    revision.updatedAt = at;
    delete revision.validation;
    state.status = STATUSES.DRAFT;
    state.version += 1;
    state.updatedBy = command.actorId;
    state.updatedAt = at;
    const events = [{ type: "DRAFT_SAVED", requestId: state.id, revisionNo: state.activeRevisionNo, actorId: command.actorId, at }];
    return response(true, "DRAFT_SAVED", state, { requestId: state.id, revisionNo: state.activeRevisionNo }, events);
  }

  function validateDraft(sourceState, sourceCommand) {
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const denied = requesterFailure(sourceState, command);
    if (denied) return denied;
    const invalidRevision = revisionFailure(sourceState);
    if (invalidRevision) return invalidRevision;
    if (sourceState.status !== STATUSES.DRAFT) return failure("INVALID_TRANSITION", sourceState);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== sourceState.version) {
      return failure("VERSION_CONFLICT", sourceState);
    }
    const at = asText(command.at);
    if (!at) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: [{ field: "at" }] });
    const revision = activeRevision(sourceState);
    if (!revision || revision.submittedSnapshot) return failure("SNAPSHOT_IMMUTABLE", sourceState);
    const payload = revision.draftPayload && typeof revision.draftPayload === "object" ? revision.draftPayload : {};
    const missingFields = REQUIRED_DRAFT_FIELDS.filter(field => {
      if (field === "requestedDays") return payload[field] === undefined || payload[field] === null || payload[field] === "";
      return !asText(payload[field]);
    });
    if (missingFields.length) {
      return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: missingFields.map(field => ({ field })) });
    }
    const requestedDaysCheck = rules?.validateRequestedDays(payload.requestedDays);
    if (!requestedDaysCheck?.ok) return failure(requestedDaysCheck?.code || "INVALID_REQUESTED_DAYS", sourceState, { errors: requestedDaysCheck?.errors || [] });
    const rule = rules?.getExtensionRule(sourceState.extensionType) || null;
    if (!rule) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: [{ field: "extensionType" }] });
    const documentCheck = command.documentCheck;
    if (!documentCheck || typeof documentCheck !== "object" || Array.isArray(documentCheck)) {
      return failure("INVALID_DOCUMENT_CHECK", sourceState, { errors: [{ field: "documentCheck" }] });
    }
    if (typeof documentCheck.complete !== "boolean") {
      return failure("INVALID_DOCUMENT_CHECK", sourceState, { errors: [{ field: "documentCheck.complete" }] });
    }
    if (!Array.isArray(documentCheck.missingDocumentCodes)
      || documentCheck.missingDocumentCodes.some(code => typeof code !== "string" || !code.trim())) {
      return failure("INVALID_DOCUMENT_CHECK", sourceState, { errors: [{ field: "documentCheck.missingDocumentCodes" }] });
    }
    const reportedMissingDocumentCodes = documentCheck.missingDocumentCodes.map(asText);
    if (documentCheck.complete !== true || reportedMissingDocumentCodes.length) {
      const missingDocumentCodes = reportedMissingDocumentCodes.length
        ? reportedMissingDocumentCodes
        : [...rule.requiredDocumentCodes];
      return failure("REQUIRED_DOCUMENT_MISSING", sourceState, { missingDocumentCodes });
    }

    const state = clone(sourceState);
    const stateRevision = activeRevision(state);
    stateRevision.validation = {
      requiredFields: [...REQUIRED_DRAFT_FIELDS],
      requiredDocumentCodes: [...rule.requiredDocumentCodes],
      validatedBy: command.actorId,
      validatedAt: at
    };
    state.status = STATUSES.READY;
    state.requestedDays = stateRevision.draftPayload.requestedDays;
    state.version += 1;
    state.updatedBy = command.actorId;
    state.updatedAt = at;
    const events = [{ type: "DRAFT_READY", requestId: state.id, revisionNo: state.activeRevisionNo, actorId: command.actorId, at }];
    return response(true, "DRAFT_READY", state, { requestId: state.id, revisionNo: state.activeRevisionNo }, events);
  }

  function submitRequest(sourceState, sourceCommand) {
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const denied = requesterFailure(sourceState, command);
    if (denied) return denied;
    const invalidRevision = revisionFailure(sourceState);
    if (invalidRevision) return invalidRevision;
    if ([STATUSES.SUBMITTED, STATUSES.RETURNED].includes(sourceState.status)) return failure("SNAPSHOT_IMMUTABLE", sourceState);
    if (sourceState.status !== STATUSES.READY) return failure("INVALID_TRANSITION", sourceState);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== sourceState.version) {
      return failure("VERSION_CONFLICT", sourceState);
    }
    const at = asText(command.at);
    const snapshotPayload = command.snapshotPayload && typeof command.snapshotPayload === "object" && !Array.isArray(command.snapshotPayload)
      ? command.snapshotPayload
      : null;
    const missingFields = [];
    if (!at) missingFields.push("at");
    if (!snapshotPayload) missingFields.push("snapshotPayload");
    if (missingFields.length) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: missingFields.map(field => ({ field })) });

    const state = clone(sourceState);
    const revision = activeRevision(state);
    if (!revision || revision.submittedSnapshot) return failure("SNAPSHOT_IMMUTABLE", sourceState);
    revision.submittedSnapshot = {
      requestId: state.id,
      revisionNo: state.activeRevisionNo,
      draftPayload: clone(revision.draftPayload),
      payload: clone(snapshotPayload),
      submittedBy: command.actorId,
      submittedAt: at
    };
    revision.submittedBy = command.actorId;
    revision.submittedAt = at;
    revision.updatedBy = command.actorId;
    revision.updatedAt = at;
    freeze(revision);
    state.status = STATUSES.SUBMITTED;
    state.version += 1;
    state.updatedBy = command.actorId;
    state.updatedAt = at;
    const events = [{ type: "REQUEST_SUBMITTED", requestId: state.id, revisionNo: state.activeRevisionNo, actorId: command.actorId, at }];
    return response(true, "REQUEST_SUBMITTED", state, {
      requestId: state.id,
      revisionNo: state.activeRevisionNo,
      submittedSnapshot: revision.submittedSnapshot
    }, events);
  }

  function beginCorrection(sourceState, sourceCommand) {
    const command = sourceCommand && typeof sourceCommand === "object" ? sourceCommand : {};
    const denied = requesterFailure(sourceState, command);
    if (denied) return denied;
    const invalidRevision = revisionFailure(sourceState);
    if (invalidRevision) return invalidRevision;
    if (sourceState.status !== STATUSES.RETURNED) return failure("INVALID_TRANSITION", sourceState);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== sourceState.version) {
      return failure("VERSION_CONFLICT", sourceState);
    }
    const at = asText(command.at);
    if (!at) return failure("MISSING_REQUIRED_FIELD", sourceState, { errors: [{ field: "at" }] });
    const submittedRevision = activeRevision(sourceState);
    if (!submittedRevision?.submittedSnapshot) return failure("REQUEST_NOT_FOUND", sourceState);

    const state = clone(sourceState);
    const priorRevision = activeRevision(state);
    const revisionNo = Math.max(0, ...state.revisions.map(revision => Number(revision.revisionNo) || 0)) + 1;
    const revision = {
      requestId: state.id,
      revisionNo,
      baseRevisionNo: priorRevision.revisionNo,
      draftPayload: clone(priorRevision.submittedSnapshot.draftPayload),
      submittedSnapshot: null,
      createdBy: command.actorId,
      createdAt: at,
      updatedBy: command.actorId,
      updatedAt: at,
      submittedBy: "",
      submittedAt: ""
    };
    state.reviewerContract = null;
    state.revisions.forEach(item => {
      if (item.submittedSnapshot) freeze(item);
    });
    state.revisions.push(revision);
    state.activeRevisionNo = revisionNo;
    state.status = STATUSES.DRAFT;
    state.version += 1;
    state.updatedBy = command.actorId;
    state.updatedAt = at;
    const events = [{ type: "CORRECTION_STARTED", requestId: state.id, revisionNo, baseRevisionNo: priorRevision.revisionNo, actorId: command.actorId, at }];
    return response(true, "CORRECTION_STARTED", state, { requestId: state.id, revisionNo, baseRevisionNo: priorRevision.revisionNo }, events);
  }

  const api = Object.freeze({ STATUSES, REQUIRED_DRAFT_FIELDS, createDraft, saveDraft, validateDraft, submitRequest, beginCorrection });
  root.ECMISActivity5ExtensionWorkflow = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
