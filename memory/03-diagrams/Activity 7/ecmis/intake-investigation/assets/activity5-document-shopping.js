(function initializeActivity5DocumentShopping(root) {
  const clone = value => JSON.parse(JSON.stringify(value ?? {}));
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};

  const CORE_CODES = Object.freeze({
    FORM_01: "2-02",
    FORM_02: "2-12",
    FORM_03: "6-37",
    FORM_04: "2-13",
    FORM_05: "6-40",
    FORM_06: "6-41",
    FORM_07: "6-46",
    FORM_08: "8-14",
    FORM_09: "8-15",
    FORM_10: "8-16",
    FORM_11: "8-17",
    FORM_12: "8-18",
    FORM_13: "8-19",
    FORM_14: "8-22",
    FORM_15: "8-21",
    FORM_16: "8-20",
    FORM_17: "8-24",
    FORM_18: "8-25",
    FORM_19: "8-26",
    FORM_20: "8-23"
  });

  const CORE_STAGES = Object.freeze({
    FORM_01: ["a5-prelim", "a5-inquiry"],
    FORM_02: ["a5-prelim"],
    FORM_03: ["a5-inquiry"],
    FORM_04: ["a5-prelim", "a5-prelim-review", "a7-213"],
    FORM_05: ["a5-inquiry"],
    FORM_06: ["a5-inquiry"],
    FORM_07: ["a5-inquiry", "a5-inquiry-review", "a7-644"],
    FORM_08: ["a5-prosecutor"], FORM_09: ["a5-prosecutor"], FORM_10: ["a5-prosecutor"],
    FORM_11: ["a5-prosecutor"], FORM_12: ["a5-prosecutor"], FORM_13: ["a5-prosecutor"],
    FORM_14: ["a5-prosecutor"], FORM_15: ["a5-prosecutor"], FORM_16: ["a5-prosecutor"],
    FORM_17: ["a5-prosecutor"], FORM_18: ["a5-prosecutor"], FORM_19: ["a5-prosecutor"], FORM_20: ["a5-prosecutor"]
  });

  const MODULES = Object.freeze([
    { key: "prelim", rootKey: "ECMISActivity5PrelimDocuments", storeKey: "prelimDocuments", render: "renderPrelimPaperA5" },
    { key: "handover", rootKey: "ECMISActivity5HandoverDocuments", storeKey: "handoverDocuments", render: "renderHandoverPaperA5" },
    { key: "committee-order", rootKey: "ECMISActivity5CommitteeOrderDocuments", storeKey: "committeeOrderDocuments", render: "renderCommitteeOrderPaperA5" },
    { key: "committee-notice", rootKey: "ECMISActivity5CommitteeNoticeDocuments", storeKey: "committeeNoticeDocuments", render: "renderCommitteeNoticePaperA5" },
    { key: "inquiry", rootKey: "ECMISActivity5InquiryDocuments", storeKey: "inquiryDocuments", render: "renderInquiryPaperA5" },
    { key: "outcome", rootKey: "ECMISActivity5OutcomeDocuments", storeKey: "outcomeDocuments", render: "renderOutcomePaperByDocId" }
  ]);
  const RECEIVED_EXTERNAL_CODES = new Set(["7-02", "8-19", "8-21", "8-22", "8-47", "8-48"]);

  function codeParts(code) {
    return String(code || "").split("-").map(value => Number(value) || 0);
  }

  function compareCode(left, right) {
    const a = codeParts(left.code);
    const b = codeParts(right.code);
    return a[0] - b[0] || a[1] - b[1] || String(left.id).localeCompare(String(right.id));
  }

  function buildCatalog() {
    const items = [];
    const post = root.ECMISActivity5PostResolution;
    for (const meta of post?.MANIFEST || []) {
      const code = CORE_CODES[meta.formId];
      if (!code) continue;
      items.push({
        id: meta.formId,
        code,
        title: meta.title,
        shortLabel: meta.title,
        stages: CORE_STAGES[meta.formId] || [],
        authorRole: meta.authorRole || "เอกสารไม่ระบุ",
        recipient: meta.recipient?.name || "เอกสารไม่ระบุ",
        documentMode: meta.documentMode || "INTERNAL_PACC",
        selectionPolicy: meta.documentMode === "RECEIVED_EXTERNAL" ? "RECEIVED_EXTERNAL" : "MANUAL_ONLY",
        moduleKey: "core",
        storeKey: "postResolutionDocuments"
      });
    }
    for (const definition of MODULES) {
      const module = root[definition.rootKey];
      for (const meta of module?.MANIFEST || []) {
        const receivedExternal = meta.documentMode === "RECEIVED_EXTERNAL" || RECEIVED_EXTERNAL_CODES.has(meta.code);
        items.push({
          id: meta.formId,
          code: meta.code,
          title: meta.title,
          shortLabel: meta.shortLabel || meta.title,
          stages: Array.isArray(meta.allowedStages) ? [...meta.allowedStages] : [meta.stage].filter(Boolean),
          authorRole: meta.authorRole || "เอกสารไม่ระบุ",
          recipient: meta.recipient?.name || "เอกสารไม่ระบุ",
          documentMode: receivedExternal ? "RECEIVED_EXTERNAL" : meta.documentMode || "INTERNAL_PACC",
          selectionPolicy: receivedExternal ? "RECEIVED_EXTERNAL" : "MANUAL_ONLY",
          moduleKey: definition.key,
          rootKey: definition.rootKey,
          storeKey: definition.storeKey,
          render: definition.render
        });
      }
    }
    items.push({
      id: "mti",
      code: "7-02",
      title: "แบบรายงานผลการวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท.",
      shortLabel: "มติคณะกรรมการ ป.ป.ท.",
      stages: ["a7-213", "a7-644", "a5-outcome"],
      authorRole: "เอกสารไม่ระบุ",
      recipient: "สำนักงาน ป.ป.ท.",
      documentMode: "RECEIVED_EXTERNAL",
      selectionPolicy: "RECEIVED_EXTERNAL",
      moduleKey: "core",
      storeKey: "a5DocumentStore"
    });
    const seenCodes = new Set();
    return items.sort(compareCode).filter(item => {
      if (!item.code || seenCodes.has(item.code)) return false;
      seenCodes.add(item.code);
      return true;
    });
  }

  function resolveAutoPick(state = {}) {
    const stage = String(state.workflow?.stage || "");
    const inquiry = object(state.inquiry);
    const prelim = object(inquiry.prelim);
    const inquiry644 = object(inquiry.inquiry644);
    const picks = [];
    const add = (...ids) => ids.forEach(id => { if (id && !picks.includes(id)) picks.push(id); });
    const record10Status = String(state.a5Report644Lifecycle?.status || state.workflow?.downstreamStatus || "");
    const record11Picks = root.ECMISActivity5Record11?.resolveRecord11DocumentAutoPickA5?.(state) || [];
    if (record11Picks.length) {
      add(...record11Picks);
      return picks;
    }

    if ([
      "REPORT_644_REVIEW_PENDING", "REPORT_644_ROUTE_PENDING", "REPORT_644_URGENT_LETTER_PENDING",
      "REPORT_644_SUPPORT_COMMITTEE_PENDING", "REPORT_644_SUPPORT_SECRETARY_CONFIRM_PENDING",
      "REPORT_644_BOARD_READY", "REPORT_644_SENT_TO_A7", "REPORT_644_WAIT_RESULT"
    ].includes(record10Status)) {
      add("FORM_07", "S7_01_SEND_DIAGNOSIS");
      return picks;
    }

    if (stage === "a5-prelim") {
      add("FORM_01", "S2_01_WORK_LOG", "FORM_04");
      if ((prelim.extensionHistory || []).length || prelim.extensionWorkspace?.active) add("FORM_02");
    }
    if (stage === "a5-prelim-review") add("FORM_04");
    if (stage === "a7-213") {
      add("S3_02_AGENDA_PROPOSAL", "mti");
      const committee = object(inquiry.committee213);
      const fromNacc = Boolean(inquiry.intake?.m62?.flag || state.caseData?.decision === "62");
      if (committee.orderType === "24v3") add("S5_01_PROPOSE_CHAIR_SIGN_ORDER", fromNacc ? "S5_08_SUBCOMMITTEE_ORDER_M62" : "S5_02_BOARD_SUBCOMMITTEE_ORDER");
      if (committee.orderType === "24v1") add(fromNacc ? "S5_17_OFFICE_INQUIRY_PANEL_M62_ORDER" : "S5_05_OFFICE_INQUIRY_PANEL_ORDER");
      const priorOwner = inquiry.intake?.investigator;
      const nextOwner = committee.investigator644 || inquiry644.investigator;
      if (committee.handoverDoc?.letterNo || priorOwner && nextOwner && priorOwner !== nextOwner) add("S4_01_DOSSIER_HANDOVER");
    }
    if (stage === "a5-inquiry") {
      add("FORM_01", "S6_01_CASE_COVER", "S6_02_WORK_LOG", "FORM_07");
      const records = Array.isArray(state.a5DocumentStore?.records) ? state.a5DocumentStore.records : [];
      const allegationStarted = Boolean(inquiry644.noticeSentAt || records.some(record => String(record.documentId || "").startsWith("FORM_5_") || String(record.documentId || "").startsWith("FORM_6_")));
      if (allegationStarted) add("FORM_05", "FORM_06");
      const search = Array.isArray(state.searchWarrantRequests) ? state.searchWarrantRequests.at(-1) : null;
      if (search) {
        add("S8_44_SEARCH_INVESTIGATION_REPORT", "S8_45_SEARCH_WARRANT_PETITION", "S8_46_PETITIONER_WITNESS_STATEMENT", "S8_49_SEARCH_WARRANT_ENVELOPE", "S6_23_MAP_WARRANT");
        if (search.courtResult || ["ISSUED", "DENIED", "COMPLETED"].includes(search.status)) add("S8_47_COURT_PROCEEDING_REPORT", "S8_48_COURT_SEARCH_WARRANT");
        if (search.searchExecution || search.status === "COMPLETED") add("S8_50_SEARCH_RECORD", "S8_51_SEARCH_WARRANT_EXECUTION_REPORT", "S8_52_SEIZURE_RECORD");
      }
    }
    if (stage === "a5-inquiry-review") add("FORM_07", "S7_01_SEND_DIAGNOSIS");
    return picks;
  }

  function addSelected(state = {}, formIds = []) {
    const next = clone(state);
    const catalog = buildCatalog();
    const byId = new Map(catalog.map(item => [item.id, item]));
    const existing = Array.isArray(next.documentShopping?.selectedIds) ? [...next.documentShopping.selectedIds] : [];
    const added = [];
    const skipped = [];
    const failed = [];
    const uniqueIds = [...new Set((Array.isArray(formIds) ? formIds : []).map(String).filter(Boolean))];
    for (const formId of uniqueIds) {
      const item = byId.get(formId);
      if (!item) {
        failed.push({ formId, code: "FORM_NOT_FOUND" });
        continue;
      }
      if (item.selectionPolicy === "RECEIVED_EXTERNAL") {
        failed.push({ formId, code: "EXTERNAL_DOCUMENT_REQUIRES_RECEIPT" });
        continue;
      }
      if (existing.includes(formId)) {
        skipped.push(formId);
        continue;
      }
      existing.push(formId);
      added.push(formId);
    }
    next.documentShopping = { ...object(next.documentShopping), selectedIds: existing };
    return { ok: failed.length === 0, state: next, added, skipped, failed };
  }

  function preview(state = {}, formId, renderCore) {
    const item = buildCatalog().find(entry => entry.id === formId);
    if (!item) return { ok: false, code: "FORM_NOT_FOUND", item: null, html: "" };
    let html = "";
    if (item.moduleKey === "core") {
      html = typeof renderCore === "function" ? renderCore(clone(state), formId) : "";
    } else {
      const module = root[item.rootKey];
      if (item.moduleKey === "outcome") {
        const fields = state.outcomeDocuments?.[formId]?.fields || module?.defaultPayload?.(formId, clone(state)) || {};
        html = module?.renderOutcomePaperByDocId?.(formId, fields) || "";
      } else {
        html = module?.[item.render]?.(clone(state), formId) || "";
      }
    }
    return { ok: Boolean(html), code: html ? "PREVIEW_READY" : "PREVIEW_UNAVAILABLE", item, html };
  }

  const api = Object.freeze({ buildCatalog, resolveAutoPick, addSelected, preview });
  root.ECMISActivity5DocumentShopping = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
