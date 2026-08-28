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

  function resolveSourceReference(storage, reference) {
    const target = text(reference);
    if (!target) return "";
    const records = read(storage).records;
    if (records[target]) return text(records[target].sourceReference) || target;
    const match = Object.values(records).find(record => [record?.activity5CaseId, record?.handoffId].some(value => text(value) === target));
    return text(match?.sourceReference);
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function buildInboundDocumentManifest(state) {
    const source = state && typeof state === "object" ? state : {};
    const versions = Array.isArray(source.documentVersions) ? source.documentVersions : [];
    const divisionVersions = versions
      .filter(version => version?.status === "signed" && Array.isArray(version?.signedSnapshot?.division?.documents))
      .sort((left, right) => (Number(right.version) || 0) - (Number(left.version) || 0));
    const finalVersion = divisionVersions[0] || null;
    const snapshot = finalVersion?.signedSnapshot?.division || {};
    const catalog = root.ECMISActivity4DocumentRules?.DOCUMENT_CATALOG || {};
    const documents = (snapshot.documents || []).map(item => {
      const documentId = text(item?.documentId);
      return Object.freeze({
        documentId,
        label: text(catalog[documentId]?.name) || documentId || "เอกสารไม่ระบุ",
        html: text(item?.html),
        source: "division-signed-snapshot"
      });
    }).filter(item => item.documentId && item.html);
    const requirements = root.ECMISActivity4DocumentRules?.resolveDocumentRequirements?.(source);
    const expectedDocuments = requirements?.supported === true
      ? requirements.documents.map(item => Object.freeze({ documentId: text(item.id), label: text(item.name) })).filter(item => item.documentId)
      : [];
    const attachments = (Array.isArray(source.caseData?.attachments) ? source.caseData.attachments : []).map(item => Object.freeze({
      name: text(item?.name),
      type: text(item?.type),
      pages: Number.isFinite(Number(item?.pages)) ? Number(item.pages) : null,
      size: text(item?.size),
      description: text(item?.desc || item?.description)
    })).filter(item => item.name);
    const data = source.documentData || {};
    const proofName = text(data.dispatchProofName);
    const dispatchMethod = text(data.dispatchSendMethod);
    const trackingNo = text(data.dispatchEms);
    const sentDate = text(data.dispatchSentDate);
    const dispatchProof = [proofName, dispatchMethod, trackingNo, sentDate].some(Boolean) ? Object.freeze({
      name: proofName,
      method: dispatchMethod,
      trackingNo,
      sentDate
    }) : null;
    return Object.freeze({
      schemaVersion: 1,
      signedVersion: finalVersion ? Number(finalVersion.version) || null : null,
      signedAt: text(snapshot.capturedAt || finalVersion?.lastSignedAt),
      documents: Object.freeze(documents),
      expectedDocuments: Object.freeze(expectedDocuments),
      attachments: Object.freeze(attachments),
      dispatchProof
    });
  }

  function hasDispatchEvidence(handoff) {
    return Boolean(
      handoff?.outgoingLetterNo
      && handoff?.outgoingLetterDate
      && handoff?.destinationUnit
      && handoff?.dispatchedAt
    );
  }

  function compactInboundDocumentManifest(manifest) {
    const source = manifest && typeof manifest === "object" ? manifest : {};
    const documents = (Array.isArray(source.documents) ? source.documents : []).map(document => ({
      documentId: String(document?.documentId || ""),
      label: String(document?.label || document?.documentId || "เอกสารไม่ระบุ"),
      source: String(document?.source || "division-signed-snapshot"),
      availableFromSource: true
    })).filter(document => document.documentId);
    return {
      ...source,
      storageMode: "SOURCE_REFERENCE",
      documents
    };
  }

  function isEligible(state, dispatchingRole = "officer") {
    return Boolean(
      state?.workflow?.complete
      && state?.workflow?.stage === "activity5-dispatch"
      && ["officer", "regional-officer"].includes(dispatchingRole)
      && ELIGIBLE_DECISIONS.has(state?.documentData?.decision)
      && state?.documentData?.dispatchConfirmedAt
      && state?.documentData?.dispatchLetterNo
      && state?.documentData?.dispatchLetterDate
      && state?.documentData?.dispatchSentDate
      && state?.documentData?.dispatchDestinationUnit
    );
  }

  function create(storage, state, dispatchedAt = new Date().toISOString(), dispatchingRole = "officer") {
    if (!isEligible(state, dispatchingRole)) return { created: false, eligible: false, handoff: null };

    const source = state.caseData || {};
    const sourceReference = String(source.id || "").trim();
    if (!sourceReference) return { created: false, eligible: false, handoff: null };

    const store = read(storage);
    const existingHandoff = store.records[sourceReference] || null;
    const replacingExisting = hasDispatchEvidence(existingHandoff);

    const handoff = {
      ...(existingHandoff || {}),
      handoffId: `activity4:${sourceReference}:activity5`,
      activity5CaseId: activity5CaseId(sourceReference),
      sourceReference,
      sourceDecision: state.documentData.decision,
      sourceChannel: String(source.channel || ""),
      sourceAgency: String(source.sourceAgency || ""),
      isFromNacc: source.isFromNacc === true,
      referralLegalBasis: String(source.referralLegalBasis || ""),
      receivedDate: String(source.received || ""),
      title: String(source.subject || ""),
      complainant: String(source.complainant || ""),
      agency: String(source.agency || ""),
      unit: String(source.region || ""),
      signedDocumentVersion: state.documentVersions?.at(-1)?.version || null,
      approvedAt: String(state.documentData.approvedAt || ""),
      approvedBy: String(state.documentData.approvedBy || ""),
      appointmentOrder: String(state.documentData.actingOrder || ""),
      outgoingLetterNo: String(state.documentData.dispatchLetterNo || ""),
      outgoingLetterDate: String(state.documentData.dispatchLetterDate || ""),
      dispatchMethod: String(state.documentData.dispatchSendMethod || ""),
      emsTrackingNo: String(state.documentData.dispatchEms || ""),
      dispatchProofName: String(state.documentData.dispatchProofName || ""),
      destinationUnit: String(state.documentData.dispatchDestinationUnit || ""),
      dispatchNote: String(state.documentData.dispatchNote || ""),
      inboundDocumentManifest: buildInboundDocumentManifest(state),
      dispatchedBy: dispatchingRole === "regional-officer" ? "เจ้าหน้าที่รับเรื่องประจำเขต" : "เจ้าหน้าที่รับเรื่อง ศรร.",
      dispatchedAt,
      sourceSystem: String(source.sourceSystem || "Activity4HTMLPrototype"),
      producerSystem: "Activity4HTMLPrototype"
    };
    store.records[sourceReference] = handoff;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(store));
      return { created: !replacingExisting, updated: replacingExisting, eligible: true, compacted: false, handoff };
    } catch (error) {
      const compactHandoff = {
        ...handoff,
        inboundDocumentManifest: compactInboundDocumentManifest(handoff.inboundDocumentManifest)
      };
      store.records[sourceReference] = compactHandoff;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(store));
        return { created: !replacingExisting, updated: replacingExisting, eligible: true, compacted: true, handoff: compactHandoff };
      } catch (compactError) {
        return { created: false, eligible: false, compacted: false, errorCode: "HANDOFF_STORAGE_FAILED", handoff: null };
      }
    }
  }

  const api = Object.freeze({ STORAGE_KEY, activity5CaseId, resolveSourceReference, buildInboundDocumentManifest, create, isEligible, read });
  root.ECMISActivity5Handoff = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
