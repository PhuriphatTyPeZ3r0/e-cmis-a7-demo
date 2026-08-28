(function initializeActivity5ExtensionRules(root) {
  const RULE_STATUSES = Object.freeze({ CONFIRMED: "CONFIRMED", PENDING_CONFIRMATION: "PENDING_CONFIRMATION" });
  const EXTENSION_TYPES = Object.freeze({ PRELIMINARY_INQUIRY: "PRELIMINARY_INQUIRY", FULL_INQUIRY: "FULL_INQUIRY" });
  const AUTHORITY_TIERS = Object.freeze({ GROUP_DIRECTOR: "GROUP_DIRECTOR", UNIT_DIRECTOR: "UNIT_DIRECTOR", SUPERVISING_EXECUTIVE: "SUPERVISING_EXECUTIVE", SECRETARY_GENERAL_PERSONAL: "SECRETARY_GENERAL_PERSONAL" });

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  function envelope(ok, code, result = null, errors = []) {
    return deepFreeze({ ok, code, result, errors });
  }

  function policy(reportType, formId, baseDays, normalRoundLimit, roundAuthorityTiers, requiredDocumentCodes) {
    return deepFreeze({
      reportType,
      formId,
      baseDays,
      normalRoundLimit,
      roundAuthorityTiers,
      requestedDays: { min: 1, max: 60, integer: true },
      approvedDays: { min: 1, max: 60, integer: true, notOverRequested: true },
      minimumDaysBeforeDeadline: 15,
      requiredDocumentCodes,
      submitWindow: {
        minimumDaysBeforeDeadline: 15,
        dayKind: { id: "extension-submit-window-day-kind", status: RULE_STATUSES.CONFIRMED, value: "BANGKOK_CIVIL_DAY" },
        cutoffPolicy: { id: "extension-submit-window-cutoff", status: RULE_STATUSES.CONFIRMED, value: "INCLUSIVE" }
      },
      authorityChain: { status: RULE_STATUSES.CONFIRMED },
      approvalDayPolicy: { status: RULE_STATUSES.CONFIRMED }
    });
  }

  const EXTENSION_POLICIES = deepFreeze({
    [EXTENSION_TYPES.PRELIMINARY_INQUIRY]: policy("213", "FORM_2", 60, 2, {
      1: AUTHORITY_TIERS.UNIT_DIRECTOR,
      2: AUTHORITY_TIERS.SUPERVISING_EXECUTIVE
    }, ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"]),
    [EXTENSION_TYPES.FULL_INQUIRY]: policy("644", "FORM_3", 270, 4, {
      1: AUTHORITY_TIERS.UNIT_DIRECTOR,
      2: AUTHORITY_TIERS.UNIT_DIRECTOR,
      3: AUTHORITY_TIERS.SUPERVISING_EXECUTIVE,
      4: AUTHORITY_TIERS.SUPERVISING_EXECUTIVE
    }, ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE", "INQUIRY_APPOINTMENT_ORDER"])
  });
  const EXTENSION_RULES = EXTENSION_POLICIES;

  function getExtensionPolicy(extensionType) {
    return EXTENSION_POLICIES[String(extensionType || "")] || null;
  }

  function getExtensionRule(extensionType) {
    return getExtensionPolicy(extensionType);
  }

  function evaluateNormalRound(extensionType, roundNo) {
    const extensionPolicy = getExtensionPolicy(extensionType);
    if (!extensionPolicy) return envelope(false, "INVALID_EXTENSION_TYPE", null, [{ field: "extensionType" }]);
    if (!Number.isInteger(roundNo) || roundNo < 1) return envelope(false, "INVALID_ROUND", null, [{ field: "roundNo" }]);
    if (roundNo > extensionPolicy.normalRoundLimit) {
      return envelope(false, "EXTRAORDINARY_FLOW_REQUIRED", {
        type: "LATE_REPORT_REQUIRED",
        extensionType,
        reportType: extensionPolicy.reportType,
        requestedRoundNo: roundNo,
        normalRoundLimit: extensionPolicy.normalRoundLimit,
        target: "ACTIVITY_7",
        status: RULE_STATUSES.PENDING_CONFIRMATION
      });
    }
    return envelope(true, "NORMAL_EXTENSION_ROUND", {
      mode: "NORMAL",
      roundNo,
      authorityTier: extensionPolicy.roundAuthorityTiers[roundNo],
      normalRoundLimit: extensionPolicy.normalRoundLimit
    });
  }

  function validateRequestedDays(value) {
    return Number.isInteger(value) && value >= 1 && value <= 60
      ? envelope(true, "REQUESTED_DAYS_VALID", { requestedDays: value })
      : envelope(false, "INVALID_REQUESTED_DAYS", null, [{ field: "requestedDays" }]);
  }

  function validateApprovedDays(requestedDays, approvedDays) {
    if (!Number.isInteger(approvedDays) || approvedDays < 1 || approvedDays > 60) {
      return envelope(false, "INVALID_APPROVED_DAYS", null, [{ field: "approvedDays" }]);
    }
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 60) {
      return envelope(false, "INVALID_REQUESTED_DAYS", null, [{ field: "requestedDays" }]);
    }
    return approvedDays > requestedDays
      ? envelope(false, "APPROVED_DAYS_EXCEED_REQUESTED", null, [{ field: "approvedDays" }])
      : envelope(true, "APPROVED_DAYS_VALID", { requestedDays, approvedDays });
  }

  function isoDate(value) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
    const date = new Date(`${text}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : "";
  }

  function addCivilDays(value, days) {
    const text = isoDate(value);
    if (!text || !Number.isInteger(days)) return "";
    const date = new Date(`${text}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function deriveDeadlineBasis(input = {}) {
    const extensionPolicy = getExtensionPolicy(input.extensionType);
    if (!extensionPolicy) return envelope(false, "INVALID_EXTENSION_TYPE", null, [{ field: "extensionType" }]);
    let startEvent = "";
    let startedAt = "";
    if (input.extensionType === EXTENSION_TYPES.PRELIMINARY_INQUIRY) {
      startEvent = "FIRST_RECEIPT";
      startedAt = isoDate(input.receivedFirstAt);
    } else if (input.orderType === "24v3") {
      startEvent = "BOARD_RESOLUTION";
      startedAt = isoDate(input.boardResolutionAt);
    } else if (input.orderType === "24v1") {
      startEvent = "SECRETARY_ORDER_SIGNED";
      startedAt = isoDate(input.secretaryOrderSignedAt);
    }
    if (!startEvent || !startedAt) return envelope(false, "DEADLINE_BASIS_MISSING", null, [{ field: "startedAt" }]);
    const initialDeadline = addCivilDays(startedAt, extensionPolicy.baseDays);
    if (!initialDeadline) return envelope(false, "DEADLINE_UNKNOWN", null, [{ field: "initialDeadline" }]);
    return envelope(true, "DEADLINE_BASIS_DERIVED", {
      deadlineBasis: {
        schemaVersion: 1,
        extensionType: input.extensionType,
        startEvent,
        startedAt,
        baseDays: extensionPolicy.baseDays,
        initialDeadline
      },
      initialDeadline
    });
  }

  function calculateSubmissionCutoff(currentDeadline) {
    const deadline = isoDate(currentDeadline);
    if (!deadline) return envelope(false, "DEADLINE_UNKNOWN", null, [{ field: "currentDeadline" }]);
    return envelope(true, "SUBMISSION_CUTOFF_CALCULATED", { currentDeadline: deadline, submissionCutoff: addCivilDays(deadline, -15) });
  }

  function sameJson(left, right) {
    return JSON.stringify(left || null) === JSON.stringify(right || null);
  }

  function verifyDeadlineContract(input = {}) {
    if (!input.deadlineBasis || !input.submittedDeadlineBasis) return envelope(false, "DEADLINE_BASIS_MISSING", null, [{ field: "deadlineBasis" }]);
    if (!sameJson(input.deadlineBasis, input.submittedDeadlineBasis)) return envelope(false, "DEADLINE_BASIS_CONFLICT", null, [{ field: "deadlineBasis" }]);
    if (!Number.isInteger(input.deadlineVersion) || input.deadlineVersion < 1
      || input.deadlineVersion !== input.submittedDeadlineVersion) {
      return envelope(false, "DEADLINE_VERSION_CONFLICT", null, [{ field: "deadlineVersion" }]);
    }
    if (!isoDate(input.currentDeadline)) return envelope(false, "DEADLINE_UNKNOWN", null, [{ field: "currentDeadline" }]);
    return envelope(true, "DEADLINE_CONTRACT_VERIFIED", {
      deadlineBasis: input.deadlineBasis,
      deadlineVersion: input.deadlineVersion,
      currentDeadline: input.currentDeadline
    });
  }

  function evaluateRequiredDocuments(extensionType, sourceDocumentCodes) {
    const extensionPolicy = getExtensionPolicy(extensionType);
    if (!extensionPolicy) return null;
    const codes = new Set(Array.isArray(sourceDocumentCodes) ? sourceDocumentCodes.map(value => String(value || "").trim()).filter(Boolean) : []);
    const missingDocumentCodes = extensionPolicy.requiredDocumentCodes.filter(code => !codes.has(code));
    return deepFreeze({ complete: missingDocumentCodes.length === 0, missingDocumentCodes });
  }

  const api = deepFreeze({
    RULE_STATUSES,
    EXTENSION_TYPES,
    AUTHORITY_TIERS,
    EXTENSION_POLICIES,
    EXTENSION_RULES,
    getExtensionPolicy,
    getExtensionRule,
    evaluateNormalRound,
    validateRequestedDays,
    validateApprovedDays,
    deriveDeadlineBasis,
    calculateSubmissionCutoff,
    verifyDeadlineContract,
    evaluateRequiredDocuments
  });
  root.ECMISActivity5ExtensionRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
