(function initializeActivity5ExtensionAuthority(root) {
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);
  const ROUTE_POLICY_VERSION = "a5-extension-route-2026-08-15";

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    return value;
  }

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function envelope(ok, code, result = null, errors = []) {
    return freeze({ ok, code, result: clone(result), errors: clone(errors) });
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizedUnitKey(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function isoDate(value) {
    const source = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source)) return "";
    const parsed = new Date(`${source}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === source ? source : "";
  }

  function roleForTier(tier) {
    if (tier === "GROUP_DIRECTOR") return "group-director";
    if (tier === rules?.AUTHORITY_TIERS?.UNIT_DIRECTOR) return "director";
    return "secretary";
  }

  function createMockAuthorityRegistry({ unitKey, effectiveFrom }) {
    const normalized = normalizedUnitKey(unitKey);
    const start = isoDate(effectiveFrom);
    if (!normalized || !start) return envelope(false, "PENDING_CONFIRMATION", null, [{ reasonCode: "AUTHORITY_ASSIGNMENT_MISSING" }]);
    const assignments = [rules.AUTHORITY_TIERS.UNIT_DIRECTOR, rules.AUTHORITY_TIERS.SUPERVISING_EXECUTIVE].map(tier => ({
      assignmentId: `mock-authority:${normalized}:${tier.toLowerCase()}`,
      unitKey: normalized,
      authorityTier: tier,
      actorId: `mock-authority:${normalized}:${tier.toLowerCase()}`,
      actorRole: roleForTier(tier),
      status: "ACTIVE",
      effectiveFrom: start,
      effectiveTo: null,
      actingForTier: null,
      source: "MOCK_ROLE_SLOT"
    }));
    return envelope(true, "MOCK_AUTHORITY_REGISTRY_CREATED", { schemaVersion: 1, version: 1, assignments });
  }

  function effectiveAssignments(registry, unitKey, tier, effectiveDate) {
    const assignments = Array.isArray(registry?.assignments) ? registry.assignments : [];
    return assignments.filter(item => normalizedUnitKey(item?.unitKey) === unitKey
      && item?.authorityTier === tier
      && isoDate(item?.effectiveFrom) && item.effectiveFrom <= effectiveDate
      && (!item.effectiveTo || (isoDate(item.effectiveTo) && effectiveDate <= item.effectiveTo)));
  }

  function pending(reasonCode) {
    return envelope(false, "PENDING_CONFIRMATION", null, [{ reasonCode }]);
  }

  function resolveReviewerContract(source = {}) {
    const round = rules?.evaluateNormalRound(source.extensionType, Number(source.roundNo));
    if (!round?.ok) return envelope(false, round?.code || "INVALID_ROUND", round?.result, round?.errors || []);
    const unitKey = normalizedUnitKey(source.unitKey);
    const effectiveDate = isoDate(source.effectiveDate);
    const requestId = text(source.requestId);
    const revisionNo = Number(source.revisionNo);
    if (!unitKey || !effectiveDate || !requestId || !Number.isInteger(revisionNo) || revisionNo < 1) {
      return pending("AUTHORITY_ASSIGNMENT_MISSING");
    }
    let registry = source.authorityRegistry && typeof source.authorityRegistry === "object" ? source.authorityRegistry : null;
    let matches = registry ? effectiveAssignments(registry, unitKey, round.result.authorityTier, effectiveDate) : [];
    const hasExplicitForKey = Array.isArray(registry?.assignments) && registry.assignments.some(item => normalizedUnitKey(item?.unitKey) === unitKey
      && item?.authorityTier === round.result.authorityTier);
    if (!matches.length && !hasExplicitForKey && source.allowMockRoleSlot === true) {
      const mock = createMockAuthorityRegistry({ unitKey, effectiveFrom: effectiveDate });
      if (!mock.ok) return mock;
      registry = mock.result;
      matches = effectiveAssignments(registry, unitKey, round.result.authorityTier, effectiveDate);
    }
    if (!matches.length) return pending(hasExplicitForKey ? "AUTHORITY_VACANT" : "AUTHORITY_ASSIGNMENT_MISSING");
    if (matches.length !== 1) return pending("AUTHORITY_ASSIGNMENT_AMBIGUOUS");
    const assignment = matches[0];
    if (assignment.status === "VACANT") return pending("AUTHORITY_VACANT");
    if (assignment.status !== "ACTIVE" || !text(assignment.actorId) || !text(assignment.assignmentId)
      || assignment.actorRole !== roleForTier(round.result.authorityTier)) {
      return pending("AUTHORITY_ASSIGNMENT_MISSING");
    }
    if (assignment.actingForTier && assignment.actingForTier !== round.result.authorityTier) {
      return pending("ACTING_ASSIGNMENT_INCOMPLETE");
    }
    if (round.result.authorityTier === "SECRETARY_GENERAL_PERSONAL"
      && (assignment.source !== "STATE_ASSIGNMENT" || assignment.actingForTier)) {
      return pending("ACTING_ASSIGNMENT_INCOMPLETE");
    }
    const assignmentVersion = Number(registry?.version);
    if (!Number.isInteger(assignmentVersion) || assignmentVersion < 1) return pending("AUTHORITY_ASSIGNMENT_MISSING");
    return envelope(true, "REVIEWER_CONTRACT_CONFIRMED", {
      status: "CONFIRMED",
      requestId,
      revisionNo,
      extensionType: source.extensionType,
      roundNo: round.result.roundNo,
      unitKey,
      authorityTier: round.result.authorityTier,
      reviewerId: assignment.actorId,
      reviewerRole: assignment.actorRole,
      assignmentId: assignment.assignmentId,
      assignmentVersion,
      effectiveDate,
      actingForTier: assignment.actingForTier || null,
      authorityStatus: "CONFIRMED",
      dayPolicyStatus: "CONFIRMED",
      canApprove: true,
      maxApprovedDays: 60,
      routePolicyVersion: ROUTE_POLICY_VERSION,
      source: assignment.source || "STATE_ASSIGNMENT"
    });
  }

  function verifyLiveReviewerContract(source = {}) {
    const contract = source.contract;
    if (!contract || contract.status !== "CONFIRMED") return pending("AUTHORITY_ASSIGNMENT_MISSING");
    if (text(source.actorId) !== text(contract.reviewerId) || text(source.actorRole) !== text(contract.reviewerRole)) {
      return envelope(false, "ACTOR_MISMATCH", null, [{ field: "actorId" }]);
    }
    const effectiveDate = isoDate(source.effectiveDate || contract.effectiveDate);
    const registry = source.authorityRegistry;
    if (!registry || Number(registry.version) !== Number(contract.assignmentVersion)) {
      return envelope(false, "AUTHORITY_ASSIGNMENT_CHANGED", null, [{ field: "assignmentVersion" }]);
    }
    const matches = effectiveAssignments(registry, normalizedUnitKey(contract.unitKey), contract.authorityTier, effectiveDate)
      .filter(item => item.status === "ACTIVE" && item.assignmentId === contract.assignmentId && item.actorId === contract.reviewerId
        && item.actorRole === contract.reviewerRole && (item.actingForTier || null) === (contract.actingForTier || null));
    if (matches.length !== 1) return envelope(false, "AUTHORITY_ASSIGNMENT_CHANGED", null, [{ field: "assignmentId" }]);
    return envelope(true, "REVIEWER_CONTRACT_VERIFIED", { contract: clone(contract) });
  }

  const api = freeze({ ROUTE_POLICY_VERSION, resolveReviewerContract, verifyLiveReviewerContract, createMockAuthorityRegistry });
  root.ECMISActivity5ExtensionAuthority = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
