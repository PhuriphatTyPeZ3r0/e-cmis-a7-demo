(function initializeActivity5ExtensionProgress(root) {
  const PROGRESS_POLICY = Object.freeze({ intervalDays: 15, anchor: "PENDING_CONFIRMATION", status: "PENDING_CONFIRMATION" });
  const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const text = value => typeof value === "string" ? value.trim() : "";
  const response = (ok, code, state, result = null, errors = [], events = []) => Object.freeze({ ok, code, state, result, errors, events });
  const fail = (code, state, errors = []) => response(false, code, state, null, errors, []);
  function iso(value) { const source = text(value); const date = /^\d{4}-\d{2}-\d{2}$/.test(source) ? new Date(`${source}T00:00:00Z`) : null; return date && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === source ? source : ""; }
  function add(value, days) { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000); }

  function createProgressSchedule(source = {}) {
    const approved = source.approvedExtension || {};
    if (source.policy?.status !== "CONFIRMED" || source.policy?.anchor !== "EXTENSION_PERIOD_START") {
      return response(false, "PENDING_CONFIRMATION", null, { progressScheduleStatus: "PENDING_CONFIRMATION" }, [{ reasonCode: "PROGRESS_ANCHOR_UNCONFIRMED" }], []);
    }
    const previousDeadline = iso(approved.previousDeadline);
    const newDeadline = iso(approved.newDeadline);
    if (!previousDeadline || !newDeadline || !text(approved.requestId) || !Number.isInteger(approved.revisionNo)) return fail("DEADLINE_UNKNOWN", null);
    const periodStart = add(previousDeadline, 1);
    const totalDays = daysBetween(previousDeadline, newDeadline);
    const count = Math.floor(totalDays / 15);
    const obligations = Array.from({ length: count }, (_, index) => {
      const sequenceNo = index + 1;
      const dueAt = add(previousDeadline, sequenceNo * 15);
      return {
        obligationId: `progress:${approved.requestId}:r${approved.revisionNo}:s${sequenceNo}`,
        requestId: approved.requestId,
        revisionNo: approved.revisionNo,
        extensionRound: approved.extensionRound,
        sequenceNo,
        periodStart: sequenceNo === 1 ? periodStart : add(previousDeadline, (sequenceNo - 1) * 15 + 1),
        periodEnd: dueAt,
        dueAt,
        status: "DUE",
        currentAssigneeId: text(source.ownerAssignment?.assigneeId),
        assignmentVersion: Number(source.ownerAssignment?.assignmentVersion),
        revisions: [{ revisionNo: 1, baseRevisionNo: null, payload: {}, submittedSnapshot: null, createdBy: text(source.ownerAssignment?.assigneeId), createdAt: text(source.at) }],
        activeRevisionNo: 1,
        submittedBy: "",
        submittedAt: "",
        idempotencyKey: text(source.idempotencyKey)
      };
    });
    return response(true, "PROGRESS_SCHEDULE_CREATED", null, { obligations, progressScheduleStatus: "CONFIRMED", idempotencyKey: text(source.idempotencyKey) }, [], obligations.map(item => ({ type: "PROGRESS_OBLIGATION_CREATED", obligationId: item.obligationId })));
  }

  function find(state, id) { return Array.isArray(state?.obligations) ? state.obligations.find(item => item.obligationId === id) : null; }
  function verify(state, command) {
    const item = find(state, command.obligationId);
    if (!item) return fail("PROGRESS_OBLIGATION_NOT_FOUND", state);
    if (text(command.actorId) !== item.currentAssigneeId) return fail("PROGRESS_ACTOR_MISMATCH", state);
    if (!Number.isInteger(command.expectedVersion) || command.expectedVersion !== Number(state.version || 1)) return fail("VERSION_CONFLICT", state);
    return item;
  }
  function active(item) { return item.revisions.find(revision => revision.revisionNo === item.activeRevisionNo); }

  function saveProgressDraft(sourceState, command = {}) {
    const checked = verify(sourceState, command); if (checked?.ok === false) return checked;
    const revision = active(checked);
    if (!revision || revision.submittedSnapshot) return fail("PROGRESS_REVISION_IMMUTABLE", sourceState);
    const next = clone(sourceState); const target = find(next, command.obligationId); const targetRevision = active(target);
    targetRevision.payload = { ...targetRevision.payload, ...clone(command.patch || {}) };
    next.version = Number(next.version || 1) + 1;
    return response(true, "PROGRESS_DRAFT_SAVED", sourceState, next, [], [{ type: "PROGRESS_DRAFT_SAVED", obligationId: target.obligationId }]);
  }

  function submitProgressRevision(sourceState, command = {}) {
    const checked = verify(sourceState, command); if (checked?.ok === false) return checked;
    const revision = active(checked);
    if (!revision || revision.submittedSnapshot) return fail("PROGRESS_REVISION_IMMUTABLE", sourceState);
    const payload = revision.payload || {};
    for (const field of ["progress", "workDone", "workRemaining", "obstacles", "nextAction"]) if (!text(payload[field])) return fail("MISSING_REQUIRED_FIELD", sourceState, [{ field }]);
    const evidenceIds = Array.isArray(payload.evidenceVersionIds) ? payload.evidenceVersionIds : [];
    const repository = new Map((command.repository || []).map(item => [item.versionId, item]));
    if (evidenceIds.some(id => repository.get(id)?.availability !== "AVAILABLE")) return fail("PROGRESS_EVIDENCE_UNAVAILABLE", sourceState);
    if (!text(command.idempotencyKey)) return fail("MISSING_REQUIRED_FIELD", sourceState, [{ field: "idempotencyKey" }]);
    const next = clone(sourceState); const target = find(next, command.obligationId); const targetRevision = active(target);
    targetRevision.submittedSnapshot = { payload: clone(targetRevision.payload), evidenceVersions: evidenceIds.map(id => clone(repository.get(id))), submittedBy: command.actorId, submittedAt: command.at, idempotencyKey: command.idempotencyKey };
    target.status = "SUBMITTED"; target.submittedBy = command.actorId; target.submittedAt = command.at; target.idempotencyKey = command.idempotencyKey; next.version = Number(next.version || 1) + 1;
    return response(true, "PROGRESS_REVISION_SUBMITTED", sourceState, next, [], [{ type: "PROGRESS_REVISION_SUBMITTED", obligationId: target.obligationId }]);
  }

  function beginProgressCorrection(sourceState, command = {}) {
    const checked = verify(sourceState, command); if (checked?.ok === false) return checked;
    const revision = active(checked); if (!revision?.submittedSnapshot) return fail("INVALID_TRANSITION", sourceState);
    const next = clone(sourceState); const target = find(next, command.obligationId); const base = active(target); const revisionNo = Math.max(...target.revisions.map(item => item.revisionNo)) + 1;
    target.revisions.push({ revisionNo, baseRevisionNo: base.revisionNo, payload: clone(base.submittedSnapshot.payload), submittedSnapshot: null, createdBy: command.actorId, createdAt: command.at });
    target.activeRevisionNo = revisionNo; target.status = "DUE"; target.submittedBy = ""; target.submittedAt = ""; target.idempotencyKey = ""; next.version = Number(next.version || 1) + 1;
    return response(true, "PROGRESS_CORRECTION_STARTED", sourceState, next, [], [{ type: "PROGRESS_CORRECTION_STARTED", obligationId: target.obligationId, revisionNo }]);
  }

  function deriveProgressStatus(obligation, bangkokDate) {
    if (obligation?.status === "SUBMITTED" || obligation?.status === "CLOSED") return obligation.status;
    return iso(bangkokDate) && iso(obligation?.dueAt) && bangkokDate > obligation.dueAt ? "OVERDUE" : "DUE";
  }

  function reassignOpenProgress(sourceState, command = {}) {
    if (Number(sourceState?.assignmentVersion) !== Number(command.fromAssignmentVersion)) return fail("VERSION_CONFLICT", sourceState);
    const next = clone(sourceState); next.obligations.forEach(item => { if (!["SUBMITTED", "CLOSED"].includes(item.status)) item.currentAssigneeId = text(command.assigneeId); });
    next.assignmentVersion = Number(command.toAssignmentVersion); next.version = Number(next.version || 1) + 1;
    return response(true, "PROGRESS_REASSIGNED", sourceState, next, [], [{ type: "PROGRESS_REASSIGNED", at: command.at }]);
  }

  const api = Object.freeze({ PROGRESS_POLICY, createProgressSchedule, deriveProgressStatus, saveProgressDraft, submitProgressRevision, beginProgressCorrection, reassignOpenProgress });
  root.ECMISActivity5ExtensionProgress = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
