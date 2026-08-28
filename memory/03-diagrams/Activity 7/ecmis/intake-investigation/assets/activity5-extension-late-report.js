(function initializeActivity5ExtensionLateReport(root) {
  const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const text = value => typeof value === "string" ? value.trim() : "";
  const response = (ok, code, state, result = null, errors = [], events = []) => Object.freeze({ ok, code, state, result, errors, events });
  const fail = (code, state, errors = []) => response(false, code, state, null, errors, []);
  const reports = state => Array.isArray(state?.inquiry?.extensionLateReports) ? state.inquiry.extensionLateReports : Array.isArray(state?.extensionLateReports) ? state.extensionLateReports : [];
  const find = (state, id) => reports(state).find(item => item.lateReportId === id);
  const active = report => report?.revisions?.find(item => item.revisionNo === report.activeRevisionNo);
  function addCivilDays(value, days) { const source = text(value); if (!/^\d{4}-\d{2}-\d{2}$/.test(source) || !Number.isInteger(days)) return ""; const date = new Date(`${source}T00:00:00Z`); if (Number.isNaN(date.getTime())) return ""; date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
  function fingerprint(value) { if (value === null || typeof value !== "object") return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`; return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${fingerprint(value[key])}`).join(",")}}`; }
  function canonicalExtensionLedger(state, reportType) {
    if (reportType !== "644") return [];
    const inquiry = state?.inquiry && typeof state.inquiry === "object" ? state.inquiry : state;
    return Array.isArray(inquiry?.inquiry644?.extensionHistory) ? inquiry.inquiry644.extensionHistory : [];
  }
  function canonicalProgressObligations(state) {
    const inquiry = state?.inquiry && typeof state.inquiry === "object" ? state.inquiry : state;
    return Array.isArray(inquiry?.extensionProgress?.obligations) ? inquiry.extensionProgress.obligations : [];
  }
  function isoDate(value) {
    const source = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source)) return "";
    const date = new Date(`${source}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === source ? source : "";
  }
  function validateNormalExtensionLedger(reportType, source) {
    if (reportType !== "644") return { ok: true, ledger: clone(Array.isArray(source) ? source : []) };
    const ledger = Array.isArray(source) ? source : [];
    if (ledger.length !== 4) return { ok: false, code: "NORMAL_EXTENSION_LEDGER_INCOMPLETE" };
    const rounds = ledger.map(item => Number(item?.round));
    if (new Set(rounds).size !== 4 || ![1, 2, 3, 4].every(round => rounds.includes(round))) return { ok: false, code: "NORMAL_EXTENSION_LEDGER_INCOMPLETE" };
    const invalid = ledger.some(item => {
      const requestedDays = Number(item?.requestedDays);
      const approvedDays = Number(item?.approvedDays);
      return item?.status !== "APPROVED"
        || !Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 60
        || !Number.isInteger(approvedDays) || approvedDays < 1 || approvedDays > 60
        || approvedDays > requestedDays;
    });
    return invalid
      ? { ok: false, code: "NORMAL_EXTENSION_LEDGER_INVALID" }
      : { ok: true, ledger: clone(ledger).sort((left, right) => left.round - right.round) };
  }
  function hasOverdueProgress(reportType, obligations, asOf) {
    if (reportType !== "644") return false;
    return (Array.isArray(obligations) ? obligations : []).some(item => {
      const belongsToReport = item?.reportType === reportType || text(item?.requestId).includes(`:${reportType}:`);
      return belongsToReport && isoDate(item?.dueAt) && item.dueAt <= asOf && !["SUBMITTED", "CLOSED"].includes(item?.status);
    });
  }
  function baseCheck(state, command) {
    const report = find(state, command.lateReportId);
    if (!report) return fail("LATE_REPORT_NOT_FOUND", state);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== report.version) return fail("VERSION_CONFLICT", state);
    const prior = report.commandReceipts.find(item => item.idempotencyKey === command.idempotencyKey);
    if (prior) return prior.fingerprint === fingerprint(command) ? response(true, `${prior.action}_REPLAYED`, state, state, [], []) : fail("IDEMPOTENCY_KEY_REUSED", state);
    return report;
  }
  function receipt(report, command, action) { report.commandReceipts.push({ idempotencyKey: command.idempotencyKey, fingerprint: fingerprint(command), action }); }
  function mutate(state, command, action, fn) { const next = clone(state); const report = find(next, command.lateReportId); fn(report, next); report.version += 1; receipt(report, command, action); return response(true, action, state, next, [], [{ type: action, lateReportId: report.lateReportId }]); }

  function createLateReport(sourceState, command = {}) {
    const signal = command.signal || {};
    if (signal.type !== "LATE_REPORT_REQUIRED" || !["ACTIVITY_7", "BOARD_DIRECT"].includes(signal.target) || !["213", "644"].includes(signal.reportType)) return fail("INVALID_EXHAUSTION_SIGNAL", sourceState);
    const limit = signal.reportType === "213" ? 2 : 4;
    if (signal.normalRoundLimit !== limit || signal.requestedRoundNo !== limit + 1) return fail("INVALID_EXHAUSTION_SIGNAL", sourceState);
    const ledgerCheck = validateNormalExtensionLedger(signal.reportType, canonicalExtensionLedger(sourceState, signal.reportType));
    if (!ledgerCheck.ok) return fail(ledgerCheck.code, sourceState);
    if (signal.reportType === "644" && Array.isArray(command.extensionLedger) && fingerprint(ledgerCheck.ledger) !== fingerprint(validateNormalExtensionLedger(signal.reportType, command.extensionLedger).ledger)) return fail("NORMAL_EXTENSION_LEDGER_CONFLICT", sourceState);
    if (!text(command.ownerId) || text(command.actorId) !== text(command.ownerId)) return fail("ACTOR_MISMATCH", sourceState);
    const exhaustionKey = `${signal.extensionType}:${limit}:${command.deadlineVersion}`;
    if (reports(sourceState).some(item => item.exhaustionKey === exhaustionKey)) return fail("LATE_REPORT_ALREADY_EXISTS", sourceState);
    const routing = clone(command.routing || {});
    const steps = Array.isArray(routing.steps) ? routing.steps : [];
    const personalStep = steps.find(item => item.tier === "SECRETARY_GENERAL_PERSONAL");
    const personalSourceConfirmed = personalStep?.contract?.source === "STATE_ASSIGNMENT"
      || (routing.mode === "MOCK" && personalStep?.contract?.source === "MOCK_ROLE_SLOT");
    if (!steps.some(item => item.tier === "UNIT_DIRECTOR") || !steps.some(item => item.tier === "SUPERVISING_EXECUTIVE") || !personalStep || !personalSourceConfirmed || personalStep.contract?.actingForTier) return fail("SECRETARY_PERSONAL_CONFIRMATION_REQUIRED", sourceState);
    const priorCount = reports(sourceState).filter(item => item.reportType === signal.reportType).length;
    const lateReportId = `late:${command.caseId}:${signal.reportType}:exhausted-r${limit}${priorCount ? `:deadline-v${command.deadlineVersion}` : ''}`;
    const next = clone(sourceState);
    const target = next.inquiry && typeof next.inquiry === "object" ? next.inquiry : next;
    if (!Array.isArray(target.extensionLateReports)) target.extensionLateReports = [];
    target.extensionLateReports.push({ lateReportId, exhaustionKey, caseId: command.caseId, ownerId: command.ownerId, reportType: signal.reportType, extensionType: signal.extensionType, deliveryTarget: signal.target, normalExtensionLedger: ledgerCheck.ledger, status: "DRAFT", version: 1, activeRevisionNo: 1, revisions: [{ revisionNo: 1, baseRevisionNo: null, payload: {}, submittedSnapshot: null }], routing, routingIndex: 0, opinions: [], secretaryDecision: null, packages: [], dispatches: [], receipts: [], boardSubmissions: [], results: [], commandReceipts: [], continueWork: true });
    return response(true, "LATE_REPORT_CREATED", sourceState, next, [], [{ type: "LATE_REPORT_CREATED", lateReportId }]);
  }
  function saveLateReportDraft(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (command.actorId !== checked.ownerId) return fail("ACTOR_MISMATCH", state); const revision = active(checked); if (!revision || revision.submittedSnapshot) return fail("INVALID_TRANSITION", state); return mutate(state, command, "LATE_REPORT_DRAFT_SAVED", report => { active(report).payload = { ...active(report).payload, ...clone(command.patch || {}) }; }); }
  function submitLateReport(state, command = {}) {
    const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked;
    if (command.actorId !== checked.ownerId) return fail("ACTOR_MISMATCH", state);
    if (!["DRAFT", "RETURNED"].includes(checked.status)) return fail("INVALID_TRANSITION", state);
    const ledgerCheck = validateNormalExtensionLedger(checked.reportType, canonicalExtensionLedger(state, checked.reportType));
    if (!ledgerCheck.ok) return fail(ledgerCheck.code, state);
    if (checked.reportType === "644" && fingerprint(ledgerCheck.ledger) !== fingerprint(checked.normalExtensionLedger)) return fail("NORMAL_EXTENSION_LEDGER_CONFLICT", state);
    const asOf = isoDate(command.asOf);
    if (checked.reportType === "644" && !text(command.asOf)) return fail("AS_OF_DATE_REQUIRED", state);
    if (checked.reportType === "644" && !asOf) return fail("AS_OF_DATE_INVALID", state);
    const progressObligations = canonicalProgressObligations(state);
    if (hasOverdueProgress(checked.reportType, progressObligations, asOf)) return fail("PROGRESS_REPORT_OVERDUE", state);
    const revision = active(checked), payload = revision.payload || {};
    for (const field of ["reasonAndNecessity", "workDone", "workRemaining", "obstacles", "correctivePlan"]) if (!text(payload[field])) return fail("MISSING_REQUIRED_FIELD", state, [{ field }]);
    const ids = Array.isArray(payload.evidenceVersionIds) ? payload.evidenceVersionIds : [];
    if (!ids.length || ids.some(id => !text(id))) return fail("MISSING_REQUIRED_FIELD", state, [{ field: "evidenceVersionIds" }]);
    const repo = new Map((command.repository || []).map(item => [item.versionId, item]));
    if (ids.some(id => repo.get(id)?.availability !== "AVAILABLE")) return fail("PACKAGE_INCOMPLETE", state);
    return mutate(state, command, "LATE_REPORT_SUBMITTED", report => { const current = active(report); current.submittedSnapshot = { payload: clone(current.payload), extensionLedger: clone(ledgerCheck.ledger), progressObligations: clone(progressObligations), evidenceVersions: ids.map(id => clone(repo.get(id))), routing: clone(report.routing), submittedBy: command.actorId, submittedAt: command.at }; const step = report.routing.steps[0]; report.routingIndex = 0; report.status = step?.tier === "GROUP_DIRECTOR" ? "OPINION_GROUP_PENDING" : "OPINION_UNIT_PENDING"; });
  }
  function verifyStep(report, command) { const step = report.routing.steps[report.routingIndex]; const contract = step?.contract || {}; return step && command.actorId === contract.reviewerId && command.actorRole === contract.reviewerRole && Number(command.assignmentVersion) === Number(contract.assignmentVersion) ? step : null; }
  function nextStatus(report) { const step = report.routing.steps[report.routingIndex]; return ({ GROUP_DIRECTOR: "OPINION_GROUP_PENDING", UNIT_DIRECTOR: "OPINION_UNIT_PENDING", SUPERVISING_EXECUTIVE: "OPINION_EXECUTIVE_PENDING", SECRETARY_GENERAL_PERSONAL: "SECRETARY_DECISION_PENDING" })[step?.tier] || "SECRETARY_DECISION_PENDING"; }
  function recordLateReportOpinion(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; const step = verifyStep(checked, command); if (!step || step.tier === "SECRETARY_GENERAL_PERSONAL") return fail("ROUTING_STEP_MISMATCH", state); return mutate(state, command, "LATE_REPORT_OPINION_RECORDED", report => { report.opinions.push({ tier: step.tier, actorId: command.actorId, opinion: text(command.opinion), at: command.at }); report.routingIndex += 1; report.status = nextStatus(report); }); }
  function skipGroupOpinion(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (command.actorId !== checked.ownerId) return fail("ACTOR_MISMATCH", state); const step = checked.routing.steps[checked.routingIndex]; if (step?.tier !== "GROUP_DIRECTOR" || step.required !== false || !text(command.reason)) return fail("GROUP_SKIP_NOT_ALLOWED", state); return mutate(state, command, "GROUP_OPINION_SKIPPED", report => { report.opinions.push({ tier: "GROUP_DIRECTOR", skipped: true, reason: command.reason, actorId: command.actorId, at: command.at }); report.routingIndex += 1; report.status = nextStatus(report); }); }
  function returnLateReport(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (!verifyStep(checked, command)) return fail("ACTOR_MISMATCH", state); return mutate(state, command, "LATE_REPORT_RETURNED", report => { const base = active(report); const revisionNo = Math.max(...report.revisions.map(item => item.revisionNo)) + 1; report.revisions.push({ revisionNo, baseRevisionNo: base.revisionNo, payload: clone(base.submittedSnapshot?.payload || base.payload), submittedSnapshot: null }); report.activeRevisionNo = revisionNo; report.status = "RETURNED"; report.routingIndex = 0; }); }
  function recordSecretaryPersonalDecision(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; const step = verifyStep(checked, command); const sourceConfirmed = step?.contract?.source === "STATE_ASSIGNMENT" || (checked.routing?.mode === "MOCK" && step?.contract?.source === "MOCK_ROLE_SLOT"); if (checked.status !== "SECRETARY_DECISION_PENDING" || step?.tier !== "SECRETARY_GENERAL_PERSONAL" || !sourceConfirmed || step.contract?.actingForTier) return fail("SECRETARY_PERSONAL_CONFIRMATION_REQUIRED", state); return mutate(state, command, "SECRETARY_PERSONAL_DECISION_RECORDED", report => { report.secretaryDecision = { actorId: command.actorId, assignmentId: step.contract.assignmentId, assignmentVersion: command.assignmentVersion, decision: command.decision, correctiveGuidance: command.correctiveGuidance, at: command.at }; report.status = "READY_TO_DISPATCH"; }); }
  function createLateReportPackage(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (checked.status !== "READY_TO_DISPATCH" || !checked.secretaryDecision || !text(command.packageId) || !command.renderedReport?.content) return fail("PACKAGE_INCOMPLETE", state); return mutate(state, command, "LATE_REPORT_PACKAGE_CREATED", report => { report.packages.push({ packageId: command.packageId, packageVersion: 1, lateReportId: report.lateReportId, revisionNo: report.activeRevisionNo, renderedReport: clone(command.renderedReport), documentVersionIds: clone(command.documentVersionIds || []), snapshotFingerprint: fingerprint(active(report).submittedSnapshot), createdBy: command.actorId, createdAt: command.at }); }); }
  function exactPackage(report, command) { return report.packages.find(item => item.packageId === command.packageId && item.packageVersion === command.packageVersion); }
  function dispatchLateReportPackage(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (checked.status !== "READY_TO_DISPATCH" || !exactPackage(checked, command)) return fail("PACKAGE_VERSION_MISMATCH", state); return mutate(state, command, "LATE_REPORT_DISPATCHED", report => { report.dispatches.push({ packageId: command.packageId, packageVersion: command.packageVersion, dispatchedBy: command.actorId, dispatchedAt: command.at }); report.status = "DISPATCHED"; }); }
  function recordActivity7Receipt(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; const sent = checked.dispatches.some(item => item.packageId === command.packageId && item.packageVersion === command.packageVersion); if (checked.status !== "DISPATCHED" || !sent) return fail("PACKAGE_VERSION_MISMATCH", state); return mutate(state, command, "ACTIVITY_7_RECEIPT_RECORDED", report => { report.receipts.push({ packageId: command.packageId, packageVersion: command.packageVersion, receiptId: command.receiptId, receivedAt: command.at }); report.status = "RECEIVED_BY_ACTIVITY_7"; }); }
  function beginWaitActivity7Result(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (checked.status !== "RECEIVED_BY_ACTIVITY_7") return fail("RECEIPT_REQUIRED", state); return mutate(state, command, "ACTIVITY_7_RESULT_WAIT_STARTED", report => { report.status = "WAIT_RESULT"; }); }
  function recordActivity7Return(state, command = {}) { const checked = baseCheck(state, command); if (checked?.ok !== undefined) return checked; if (!["RECEIVED_BY_ACTIVITY_7", "WAIT_RESULT"].includes(checked.status)) return fail("INVALID_TRANSITION", state); return mutate(state, command, "ACTIVITY_7_RETURN_RECORDED", report => { const base = active(report); const revisionNo = Math.max(...report.revisions.map(item => item.revisionNo)) + 1; report.revisions.push({ revisionNo, baseRevisionNo: base.revisionNo, payload: clone(base.submittedSnapshot.payload), submittedSnapshot: null }); report.activeRevisionNo = revisionNo; report.status = "RETURNED"; report.routingIndex = 0; }); }
  function recordActivity7Result(state, command = {}) {
    const checked = baseCheck(state, command);
    if (checked?.ok !== undefined) return checked;
    if (checked.status !== "WAIT_RESULT") return fail("RECEIPT_REQUIRED", state);
    const result = command.result || {};
    if (!text(result.decisionArtifactVersionId)) return fail("RESULT_ARTIFACT_REQUIRED", state);
    if (!exactPackage(checked, result)) return fail("PACKAGE_VERSION_MISMATCH", state);
    if (!['GRANT_DAYS', 'DIRECTIONS_ONLY'].includes(result.decisionType)) return fail("INVALID_BOARD_DECISION", state);
    if (result.decisionType === 'GRANT_DAYS' && (!Number.isInteger(result.grantedDays) || result.grantedDays < 1)) return fail("INVALID_GRANTED_DAYS", state);
    if (!text(result.directions)) return fail("BOARD_DIRECTIONS_REQUIRED", state);
    const currentDeadlineRecord = state.inquiry && typeof state.inquiry === 'object'
      ? (checked.reportType === '213' ? state.inquiry.prelim : state.inquiry.inquiry644)
      : state;
    if (result.decisionType === 'GRANT_DAYS' && !addCivilDays(currentDeadlineRecord?.deadlineAt, result.grantedDays)) return fail("DEADLINE_UNKNOWN", state);
    return mutate(state, command, "ACTIVITY_7_RESULT_RECORDED", (report, next) => {
      const storedResult = { ...clone(result), deadlinePolicyStatus: "CONFIRMED", automaticNextRound: false };
      report.results.push(storedResult);
      report.status = "RESULT_RECEIVED";
      if (result.decisionType === 'GRANT_DAYS') {
        const target = next.inquiry && typeof next.inquiry === 'object'
          ? (report.reportType === '213' ? next.inquiry.prelim : next.inquiry.inquiry644)
          : next;
        const currentDeadline = text(target?.deadlineAt);
        target.deadlineAt = addCivilDays(currentDeadline, result.grantedDays);
        target.deadlineVersion = Number(target.deadlineVersion || state.deadlineVersion || 0) + 1;
      }
    });
  }
  function sendLateReportToBoard(state, command = {}) {
    const checked = baseCheck(state, command);
    if (checked?.ok !== undefined) return checked;
    if (checked.status !== "READY_TO_DISPATCH" || command.actorRole !== "clerk") return fail("INVALID_TRANSITION", state);
    if (!text(command.referenceNo) || !text(command.submittedAt)) return fail("MISSING_REQUIRED_FIELD", state);
    return mutate(state, command, "LATE_REPORT_SENT_TO_BOARD", report => {
      if (!Array.isArray(report.boardSubmissions)) report.boardSubmissions = [];
      report.boardSubmissions.push({ referenceNo: text(command.referenceNo), submittedAt: text(command.submittedAt), submittedBy: text(command.actorId) });
      report.status = "BOARD_RESULT_PENDING";
    });
  }
  function recordBoardResult(state, command = {}) {
    const checked = baseCheck(state, command);
    if (checked?.ok !== undefined) return checked;
    if (checked.status !== "BOARD_RESULT_PENDING" || command.actorRole !== "clerk") return fail("INVALID_TRANSITION", state);
    const result = command.result || {};
    if (!['GRANT_DAYS', 'DIRECTIONS_ONLY'].includes(result.decisionType)) return fail("INVALID_BOARD_DECISION", state);
    if (!text(result.resolutionNo) || !text(result.decidedAt) || !text(result.directions)) return fail("MISSING_REQUIRED_FIELD", state);
    if (result.decisionType === 'GRANT_DAYS' && (!Number.isInteger(result.grantedDays) || result.grantedDays < 1)) return fail("INVALID_GRANTED_DAYS", state);
    const currentDeadlineRecord = state.inquiry && typeof state.inquiry === 'object'
      ? (checked.reportType === '213' ? state.inquiry.prelim : state.inquiry.inquiry644)
      : state;
    if (result.decisionType === 'GRANT_DAYS' && !addCivilDays(currentDeadlineRecord?.deadlineAt, result.grantedDays)) return fail("DEADLINE_UNKNOWN", state);
    return mutate(state, command, "BOARD_RESULT_RECORDED", (report, next) => {
      report.results.push({ ...clone(result), source: "BOARD_DIRECT", deadlinePolicyStatus: "CONFIRMED", automaticNextRound: false, recordedBy: text(command.actorId), recordedAt: command.at });
      report.status = "RESULT_RECEIVED";
      if (result.decisionType === 'GRANT_DAYS') {
        const target = next.inquiry && typeof next.inquiry === 'object'
          ? (report.reportType === '213' ? next.inquiry.prelim : next.inquiry.inquiry644)
          : next;
        target.deadlineAt = addCivilDays(text(target?.deadlineAt), result.grantedDays);
        target.deadlineVersion = Number(target.deadlineVersion || state.deadlineVersion || 0) + 1;
      }
    });
  }
  const api = Object.freeze({ createLateReport, saveLateReportDraft, submitLateReport, recordLateReportOpinion, skipGroupOpinion, returnLateReport, recordSecretaryPersonalDecision, createLateReportPackage, dispatchLateReportPackage, recordActivity7Receipt, beginWaitActivity7Result, recordActivity7Return, recordActivity7Result, sendLateReportToBoard, recordBoardResult });
  root.ECMISActivity5ExtensionLateReport = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
