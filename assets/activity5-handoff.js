(function initializeActivity5Handoff(root) {
  const STORAGE_KEY = "ecmis-a4-a5-handoffs-v1";
  const ELIGIBLE_DECISIONS = new Set(["18/1ก", "18/1ข", "18/4"]);

  function read(storage) {
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
      return parsed.schemaVersion === 1 && parsed.records && typeof parsed.records === "object"
        ? parsed
        : { schemaVersion: 1, records: {} };
    } catch {
      return { schemaVersion: 1, records: {} };
    }
  }

  function activity5CaseId(sourceReference) {
    return `A5-${String(sourceReference || "").replace(/[^0-9A-Za-zก-๙_-]/g, "-")}`;
  }

  function isEligible(state, approvingRole = "division") {
    return Boolean(
      state?.workflow?.complete
      && ["division", "acting"].includes(approvingRole)
      && ELIGIBLE_DECISIONS.has(state?.documentData?.decision)
    );
  }

  function create(storage, state, approvedAt = new Date().toISOString(), approvingRole = "division") {
    if (!isEligible(state, approvingRole)) return { created: false, eligible: false, handoff: null };

    const source = state.caseData || {};
    const sourceReference = String(source.id || "").trim();
    if (!sourceReference) return { created: false, eligible: false, handoff: null };

    const store = read(storage);
    if (store.records[sourceReference]) {
      return { created: false, eligible: true, handoff: store.records[sourceReference] };
    }

    const handoff = {
      handoffId: `activity4:${sourceReference}:activity5`,
      activity5CaseId: activity5CaseId(sourceReference),
      sourceReference,
      sourceDecision: state.documentData.decision,
      receivedDate: String(source.received || ""),
      title: String(source.subject || ""),
      complainant: String(source.complainant || ""),
      agency: String(source.agency || ""),
      unit: String(source.region || ""),
      approvedAt,
      approvedBy: approvingRole === "acting" ? "ผู้รักษาราชการแทนตามคำสั่ง" : "ผอ.กบค.",
      appointmentOrder: approvingRole === "acting" ? String(state.documentData.actingOrder || "") : "",
      sourceSystem: "Activity4HTMLPrototype"
    };
    store.records[sourceReference] = handoff;
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
    return { created: true, eligible: true, handoff };
  }

  const api = Object.freeze({ STORAGE_KEY, activity5CaseId, create, isEligible, read });
  root.ECMISActivity5Handoff = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
