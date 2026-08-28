(function initializeActivity5FactCheck(root) {
  const ROUTES = Object.freeze({
    SECTION_58_2: "SECTION_58_2",
    SECTION_58_3: "SECTION_58_3"
  });

  const ACTIONS = Object.freeze({
    inspect: Object.freeze({ role: "case-clerk", from: ["RECEIVED"] }),
    assign: Object.freeze({ role: "unit-director", from: ["INSPECTED"] }),
    "save-report": Object.freeze({ role: "investigator", from: ["ASSIGNED", "REPORT_DRAFT"] }),
    "submit-secretary": Object.freeze({ role: "investigator", from: ["REPORT_DRAFT"] }),
    "secretary-review": Object.freeze({ role: "secretary", from: ["SUBMITTED_TO_SECRETARY"] }),
    "dispatch-notice": Object.freeze({ role: "investigator", from: ["SECRETARY_REVIEWED"] }),
    "record-target-response": Object.freeze({ role: "investigator", from: ["NOTICE_DISPATCHED", "TARGET_RESPONDED"] }),
    publicize: Object.freeze({ role: "secretary", from: ["TARGET_RESPONDED"] }),
    "switch-to-case": Object.freeze({ role: "investigator", from: ["REPORT_DRAFT"] })
  });

  const clone = value => JSON.parse(JSON.stringify(value || {}));
  const text = value => String(value == null ? "" : value).trim();
  const ruleApi = () => root.ECMISActivity5Rules || (typeof require === "function" ? require("./activity5-rules.js") : null);

  function routeOf(state) {
    const type = text(state?.inquiry?.special?.type);
    if (type === "583") return ROUTES.SECTION_58_3;
    if (type === "582" || text(state?.caseData?.decision) === "58/2") return ROUTES.SECTION_58_2;
    return "";
  }

  function normalizeFactCheckState(sourceState) {
    const state = clone(sourceState);
    const route = routeOf(state);
    if (!route) return state;
    const current = state.a5FactCheckLifecycle && typeof state.a5FactCheckLifecycle === "object" ? state.a5FactCheckLifecycle : {};
    state.a5FactCheckLifecycle = {
      version: 1,
      route,
      status: text(current.status) || "RECEIVED",
      noticeRecipientType: route === ROUTES.SECTION_58_2 ? "STATE_AGENCY_HEAD" : "STATE_AUDIT_OFFICE",
      history: Array.isArray(current.history) ? current.history : [],
      ...current,
      route,
      noticeRecipientType: route === ROUTES.SECTION_58_2 ? "STATE_AGENCY_HEAD" : "STATE_AUDIT_OFFICE"
    };
    return state;
  }

  function failure(code, sourceState, errors = [], rule = null) {
    return Object.freeze({ ok: false, code, state: clone(sourceState), errors: Object.freeze(errors), rule });
  }

  function required(payload, fields) {
    return fields.filter(field => !text(payload[field]));
  }

  function executeFactCheckAction(sourceState, role, actionId, payload = {}) {
    const original = normalizeFactCheckState(sourceState);
    const lifecycle = original.a5FactCheckLifecycle;
    if (!lifecycle?.route) return failure("INVALID_ROUTE", original);
    const action = ACTIONS[actionId];
    if (!action) return failure("INVALID_ACTION", original);
    if (actionId === "publicize" && lifecycle.route !== ROUTES.SECTION_58_2) return failure("INVALID_ROUTE", original);
    if (action.role !== role) return failure("ACTOR_MISMATCH", original);
    if (!action.from.includes(lifecycle.status)) return failure("INVALID_TRANSITION", original);
    if (["save-report", "submit-secretary", "dispatch-notice", "record-target-response", "switch-to-case"].includes(actionId)
      && text(payload.actorOfficerId) !== text(lifecycle.assigneeOfficerId)) return failure("ACTOR_MISMATCH", original);

    if (actionId === "publicize") {
      if (lifecycle.targetResponse?.resolved !== false) return failure("NON_REMEDY_EVIDENCE_REQUIRED", original);
      return failure("PENDING_CONFIRMATION", original, [], ruleApi()?.getA5Rule("fact-check-publicize-authority") || null);
    }
    if (actionId === "switch-to-case") {
      if (lifecycle.report?.corruptionFound !== true) return failure("CORRUPTION_FINDING_REQUIRED", original);
      return failure("PENDING_CONFIRMATION", original, [], ruleApi()?.getA5Rule("fact-check-corruption-case-route") || null);
    }

    const state = clone(original);
    const next = state.a5FactCheckLifecycle;
    const at = text(payload.at) || new Date().toISOString();
    const actorName = text(payload.actorName);
    let missing = [];

    if (actionId === "inspect") {
      missing = required(payload, ["complaintDocumentVersionId", "inspectionNote"]);
      if (missing.length) return failure("MISSING_REQUIRED_FIELD", original, missing);
      next.inspection = { complaintDocumentVersionId: text(payload.complaintDocumentVersionId), note: text(payload.inspectionNote), inspectedAt: at, inspectedBy: actorName };
      next.status = "INSPECTED";
    } else if (actionId === "assign") {
      missing = required(payload, ["officerId", "assignmentOrderDocumentVersionId"]);
      if (missing.length) return failure("MISSING_REQUIRED_FIELD", original, missing);
      next.assigneeOfficerId = text(payload.officerId);
      next.assignment = { officerId: next.assigneeOfficerId, assignmentOrderDocumentVersionId: text(payload.assignmentOrderDocumentVersionId), assignedAt: at, assignedBy: actorName };
      next.status = "ASSIGNED";
    } else if (actionId === "save-report") {
      missing = required(payload, ["reportDocumentVersionId", "findings"]);
      if (missing.length || typeof payload.corruptionFound !== "boolean") return failure("MISSING_REQUIRED_FIELD", original, [...missing, ...(typeof payload.corruptionFound === "boolean" ? [] : ["corruptionFound"])]);
      next.report = { reportDocumentVersionId: text(payload.reportDocumentVersionId), findings: text(payload.findings), corruptionFound: payload.corruptionFound, preparedAt: at, preparedBy: actorName };
      next.status = "REPORT_DRAFT";
    } else if (actionId === "submit-secretary") {
      next.submittedToSecretaryAt = at;
      next.submittedBy = actorName;
      next.status = "SUBMITTED_TO_SECRETARY";
    } else if (actionId === "secretary-review") {
      missing = required(payload, ["opinionDocumentVersionId", "opinion"]);
      if (missing.length) return failure("MISSING_REQUIRED_FIELD", original, missing);
      next.secretaryReview = { opinionDocumentVersionId: text(payload.opinionDocumentVersionId), opinion: text(payload.opinion), reviewedAt: at, reviewedBy: actorName };
      next.status = "SECRETARY_REVIEWED";
    } else if (actionId === "dispatch-notice") {
      missing = required(payload, ["noticeDocumentVersionId", "recipient", "dispatchReference", "deliveryEvidence"]);
      if (missing.length) return failure("MISSING_REQUIRED_FIELD", original, missing);
      next.notice = { recipientType: next.noticeRecipientType, recipient: text(payload.recipient), noticeDocumentVersionId: text(payload.noticeDocumentVersionId), dispatchReference: text(payload.dispatchReference), deliveryEvidence: text(payload.deliveryEvidence), dispatchedAt: at, dispatchedBy: actorName };
      next.status = "NOTICE_DISPATCHED";
    } else if (actionId === "record-target-response") {
      missing = required(payload, ["responseDocumentVersionId", "responseSummary"]);
      const needsResolutionResult = next.route === ROUTES.SECTION_58_2;
      if (missing.length || needsResolutionResult && typeof payload.resolved !== "boolean") return failure("MISSING_REQUIRED_FIELD", original, [...missing, ...(!needsResolutionResult || typeof payload.resolved === "boolean" ? [] : ["resolved"])]);
      next.targetResponse = { responseDocumentVersionId: text(payload.responseDocumentVersionId), responseSummary: text(payload.responseSummary), responseDeadline: text(payload.responseDeadline), resolved: needsResolutionResult ? payload.resolved : null, recordedAt: at, recordedBy: actorName };
      next.status = "TARGET_RESPONDED";
    }

    next.history.push({ actionId, at, by: actorName, status: next.status });
    return Object.freeze({ ok: true, code: next.status, state });
  }

  const api = Object.freeze({ ROUTES, ACTIONS, normalizeFactCheckState, executeFactCheckAction });
  root.ECMISActivity5FactCheck = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
