(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  const FORM_ID = "FORM_4_REPORT_213";
  const SOURCE = Object.freeze({ fileName: "4. แบบรายงานผลการไต่สวนเบื้องต้น.pdf", pages: [1, 6] });
  const SECTION_KEYS = Object.freeze([
    "documentMeta", "receipt", "complainants", "accusedPersons", "allegations", "factFindings",
    "eventContext", "damage", "evidence", "legalBasis", "limitation", "witnessProtection",
    "analysis", "opinion", "proposal", "reviewOpinions", "boardCover", "investigatorSignatures"
  ]);
  const SECTION_TITLES = Object.freeze([
    "ข้อมูลเอกสาร", "การรับเรื่อง", "ผู้กล่าวหา", "ผู้ถูกกล่าวหา", "ข้อกล่าวหา", "ข้อเท็จจริง",
    "พฤติการณ์", "ความเสียหาย", "พยานหลักฐาน", "ข้อกฎหมาย", "อายุความ", "คุ้มครองพยาน",
    "การวิเคราะห์", "ความเห็น", "ข้อเสนอ", "ความเห็นตามลำดับชั้น", "เอกสารเสนอคณะกรรมการ", "ผู้จัดทำรายงาน"
  ]);
  // กลุ่ม UI สำหรับ editor รายงาน 213 — จัด 18 ส่วนเป็น 7 กลุ่ม ตามหน้าแบบพิมพ์ (owner อนุมัติ 15 ส.ค. 69, ปรับโฉมรอบ 2)
  const REPORT_213_GROUPS = Object.freeze([
    { id: "g1", label: "ข้อมูลเรื่อง", keys: ["documentMeta", "receipt"], formPage: 1 },
    { id: "g2", label: "คู่กรณีและข้อกล่าวหา", keys: ["complainants", "accusedPersons", "allegations"], formPage: 2 },
    { id: "g3", label: "ข้อเท็จจริงและความเสียหาย", keys: ["factFindings", "eventContext", "damage"], formPage: 3 },
    { id: "g4", label: "พยานหลักฐานและข้อกฎหมาย", keys: ["evidence", "legalBasis"], formPage: 4 },
    { id: "g5", label: "อายุความ คุ้มครอง และวิเคราะห์", keys: ["limitation", "witnessProtection", "analysis"], formPage: 5 },
    { id: "g6", label: "ความเห็นและข้อเสนอ", keys: ["opinion", "proposal"], formPage: 6 },
    { id: "g7", label: "ลำดับชั้นและผู้จัดทำ", keys: ["reviewOpinions", "boardCover", "investigatorSignatures"], formPage: 6 }
  ]);
  const CONFIRMED_BRANCHES = [
    ["รับไว้ไต่สวน ตามมาตรา 24", ["เหตุความสำคัญหรือความซับซ้อน"]],
    ["ไม่รับไว้ไต่สวน เพราะพยานหลักฐานไม่เพียงพอ", ["ข้อเท็จจริงและพยานหลักฐาน"]],
    ["ไม่รับเรื่อง เพราะผู้ถูกร้องไม่ใช่เจ้าหน้าที่รัฐ", ["สถานะผู้ถูกร้อง"]],
    ["ไม่รับเรื่อง เพราะไม่ใช่การทุจริตในภาครัฐ", ["พฤติการณ์"]],
    ["ส่งคืน ป.ป.ช. เพราะล่วงพ้นเวลาดำเนินคดี", ["เหตุอายุความ"]],
    ["ส่งคืน ป.ป.ช. เพราะเหลือเวลาไม่ถึงหกเดือน", ["เหตุความจำเป็น"]],
    ["ส่งคืน ป.ป.ช. ตามมาตรา 18/3", ["เหตุอำนาจหน้าที่"]],
    ["ไม่รับเรื่องตามมาตรา 25 (1)", ["ผลการพิจารณาเดิม"]],
    ["ไม่รับเรื่องตามมาตรา 25 (2)", ["ผลการวินิจฉัยเดิม"]],
    ["ไม่รับเรื่องตามมาตรา 25 (3)", ["สถานะคดีอาญา"]],
    ["ไม่รับเรื่องตามมาตรา 25 (4)", ["ข้อเท็จจริงการถึงแก่ความตาย"]],
    ["ไม่รับเรื่องตามมาตรา 26 (5)", ["วันพ้นจากตำแหน่ง"]],
    ["ไม่รับเรื่องตามมาตรา 26 (1)", ["พยานหลักฐานหรือพฤติการณ์"]],
    ["ไม่รับเรื่องตามมาตรา 26 (2)", ["วันเกิดเหตุและเหตุไม่อาจหาพยาน"]]
  ];
  const BRANCHES = Object.freeze(Array.from({ length: 18 }, (_, index) => {
    const source = CONFIRMED_BRANCHES[index];
    return Object.freeze({
      branchKey: `FORM4_14_1_${String(index + 1).padStart(2, "0")}`,
      thaiLabel: source?.[0] || `ข้อเสนอข้อ ${index + 1} — รอยืนยันข้อความจากเอกสารต้นทาง`,
      requiredDetailKeys: Object.freeze(source?.[1] || [])
    });
  }));
  const PENDING_BRANCH_KEYS = new Set(BRANCHES.slice(CONFIRMED_BRANCHES.length).map(item => item.branchKey));
  const CASE_TYPE_LABELS = Object.freeze({ NACC_SECTION_62: "เรื่องที่รับจาก ป.ป.ช. ตามมาตรา 62", MISCONDUCT: "เรื่องกล่าวหาการทุจริตในภาครัฐ", "": "เอกสารไม่ระบุ" });
  const PERSON_TYPE_LABELS = Object.freeze({ PERSON: "บุคคล", ORGANIZATION: "องค์กร" });
  const AVAILABILITY_LABELS = Object.freeze({ AVAILABLE: "มีเอกสารฉบับนี้", REFERENCE_ONLY: "มีเฉพาะข้อมูลอ้างอิง", MISSING: "ไม่พบเอกสารฉบับนี้" });
  const READ_ONLY_SECTIONS = new Set(["reviewOpinions", "boardCover", "investigatorSignatures"]);
  const DERIVED_RECEIPT_FIELDS = new Set(["caseType", "sourceReceivedAt", "sourceChannel", "paccReceivedAt", "preliminaryDueAt"]);
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawString = value => typeof value === "string" ? value : "";
  const text = value => rawString(value).trim();
  const copy = value => JSON.parse(JSON.stringify(value));
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const domain = () => root.ECMISActivity5DocumentDomain || (typeof require === "function" ? require("./activity5-document-domain.js") : null);
  const identifier = row => text(row?.rowId || row?.opinionId || row?.slotId);
  const ordered = rows => [...(Array.isArray(rows) ? rows : [])].sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0) || identifier(left).localeCompare(identifier(right)));
  const activeFor = (state, documentId) => (object(state.a5DocumentStore).records || []).filter(record => record?.documentId === documentId).sort((left, right) => Number(right.revisionNo) - Number(left.revisionNo))[0] || null;
  const active = state => activeFor(state, FORM_ID);
  const placeholder = value => !text(value) || /^(?:\.{2,}|[-–—_]+|ระบุ|กรอก|ไม่พบข้อมูลต้นทาง|เอกสารไม่ระบุ)$/u.test(text(value));
  const isDate = value => !text(value) || /^\d{4}-\d{2}-\d{2}$/.test(text(value));
  const isTimestamp = value => !text(value) || (!Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value));
  const err = (errors, field, message, code = "INVALID_PAYLOAD") => errors.push({ field, message, code });
  const refs = (values, ids) => Array.isArray(values) && values.every(value => ids.has(value));
  const getPath = (source, path) => path.split(".").reduce((value, key) => value?.[key], source);
  const setPath = (source, path, value) => {
    const keys = path.split(".");
    let target = source;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) target[key] = value;
      else {
        if (!object(target[key]) || Array.isArray(target[key])) target[key] = {};
        target = target[key];
      }
    });
  };

  function currentTask2Links(state) {
    const plan = activeFor(state, "FORM_1_CASE_PLAN");
    const worklog = activeFor(state, "ACTIVITY5_DAILY_WORKLOG");
    const entries = ordered(worklog?.payload?.entries);
    return {
      plan: { documentId: "FORM_1_CASE_PLAN", revisionNo: Number(plan?.revisionNo) || 0 },
      worklog: { documentId: "ACTIVITY5_DAILY_WORKLOG", revisionNo: Number(worklog?.revisionNo) || 0, cutoffEntryId: text(entries.at(-1)?.entryId) },
      worklogEntryIds: entries.map(entry => text(entry.entryId)).filter(Boolean)
    };
  }

  function officerNameOf(id) {
    const value = text(id);
    if (!value) return "";
    const profiles = (root.EXMIS && Array.isArray(root.EXMIS.MOCK_INVESTIGATOR_PROFILES)) ? root.EXMIS.MOCK_INVESTIGATOR_PROFILES : [];
    const profile = profiles.find(item => text(item.id) === value);
    return profile ? text(profile.name) : "";
  }

  function derived(state) {
    const caseData = object(state.caseData);
    const inquiry = object(state.inquiry);
    const intake = object(inquiry.intake);
    const preliminary = object(inquiry.prelim);
    const assignment = object(state.assignment);
    const task2 = currentTask2Links(state);
    const officerName = text(assignment.primaryOfficerName) || officerNameOf(assignment.primaryOfficerId) || officerNameOf(intake.investigator) || text(intake.investigator) || "เอกสารไม่ระบุ";
    return {
      documentMeta: {
        caseId: text(caseData.id),
        caseNumber: text(caseData.caseNumber),
        subject: text(caseData.subject || state.documentData?.documentSubject),
        unitName: text(intake.unit),
        preparedAt: "",
        responsibleOfficer: { officerId: text(assignment.primaryOfficerId), displayName: officerName, positionName: text(assignment.primaryOfficerPosition) },
        assistantOfficers: (Array.isArray(assignment.assistantOfficerIds) ? assignment.assistantOfficerIds : []).map((id, index) => ({ officerId: text(id), displayName: text(assignment.assistantOfficerNames?.[index]) || "เอกสารไม่ระบุ", positionName: "" })),
        sourceLinks: { assignmentVersion: Math.max(0, Number(assignment.assignmentVersion) || 0), plan: task2.plan, worklog: task2.worklog }
      },
      receipt: {
        caseType: text(caseData.decision).includes("62") ? "NACC_SECTION_62" : text(caseData.decision) ? "MISCONDUCT" : "",
        sourceReceivedAt: text(caseData.received),
        sourceChannel: text(caseData.channel),
        paccReceivedAt: text(intake.receivedFirstAt),
        preliminaryDueAt: text(preliminary.deadlineAt)
      },
      worklogEntryIds: task2.worklogEntryIds,
      investigatorSignatures: [{ slotId: "responsible", order: 1, officerName, positionName: text(assignment.primaryOfficerPosition), roleLabel: "พนักงาน ป.ป.ท. ผู้รับผิดชอบ", signatureStatusLabel: "รอลงนาม" }]
    };
  }

  function evidenceRepository(state) {
    const sources = [state?.a5EvidenceRepository, state?.evidenceRepository, state?.documentRepository];
    if (typeof root.ECMISActivity5EvidenceRepository === "function") sources.push(root.ECMISActivity5EvidenceRepository(state, "213"));
    const byVersion = new Map();
    sources.flatMap(value => Array.isArray(value) ? value : []).forEach(item => {
      const versionId = text(item?.versionId || item?.documentVersionId);
      if (versionId && !byVersion.has(versionId)) byVersion.set(versionId, { versionId, availability: ["AVAILABLE", "REFERENCE_ONLY", "MISSING"].includes(item.availability) ? item.availability : "MISSING", name: text(item.name || item.title) });
    });
    return byVersion;
  }

  function evidenceProjection(state, rows) {
    const repository = evidenceRepository(state);
    return (Array.isArray(rows) ? rows : []).map(row => {
      const version = repository.get(text(row.documentVersionId));
      return { ...row, availability: version?.availability || "MISSING" };
    });
  }

  function payloadFor(state) {
    const source = derived(state);
    const legacy = object(object(state.inquiry).prelim).report;
    return {
      documentMeta: source.documentMeta,
      receipt: { caseType: source.receipt.caseType, sourceReceivedAt: source.receipt.sourceReceivedAt, sourceReference: "", sourceChannel: source.receipt.sourceChannel, sourceProvince: "", sourceResolutionNo: "", sourceResolutionAt: "", paccReceivedAt: source.receipt.paccReceivedAt, divisionReceivedAt: "", preliminaryDueAt: source.receipt.preliminaryDueAt, assignedAt: "", reassignmentRows: [] },
      complainants: [],
      accusedPersons: [],
      allegations: [],
      factFindings: { summary: "", chronologyRows: [], worklogEntryIds: source.worklogEntryIds },
      eventContext: { background: "", method: "", participants: "", location: "", period: "" },
      damage: { description: "", amount: "", currency: "THB", injuredParties: "", calculationNote: "" },
      evidence: [],
      legalBasis: { lawRows: [], authorityAnalysis: "" },
      limitation: { offenceRows: [], overallStatus: "", analysis: "" },
      witnessProtection: { requested: false, persons: [], summary: "" },
      analysis: { allegationAnalyses: [], overallAnalysis: "" },
      opinion: { summaryNote: typeof legacy === "string" && legacy.trim() ? legacy : "", finding: "", rationale: "" },
      proposal: { branchKey: "", reason: "", legalBasisRowIds: [], branchDetails: {} },
      reviewOpinions: [],
      boardCover: null,
      investigatorSignatures: source.investigatorSignatures
    };
  }

  function refreshDerived(state, record) {
    if (!record || record.status !== "DRAFT") return;
    const source = derived(state);
    const payload = object(record.payload);
    payload.documentMeta = { ...source.documentMeta, preparedAt: rawString(payload.documentMeta?.preparedAt) };
    payload.receipt = { ...payloadFor(state).receipt, ...object(payload.receipt), ...source.receipt };
    payload.factFindings = { ...payloadFor(state).factFindings, ...object(payload.factFindings), worklogEntryIds: source.worklogEntryIds };
    payload.evidence = evidenceProjection(state, payload.evidence);
    payload.investigatorSignatures = source.investigatorSignatures;
    record.payload = payload;
  }

  function normalizeReport213A5(sourceState) {
    const normalized = domain()?.normalizeA5DocumentStore?.(sourceState);
    if (normalized && !normalized.ok) return normalized;
    const state = copy(normalized?.state || sourceState);
    const store = object(state.a5DocumentStore);
    const records = Array.isArray(store.records) ? store.records : [];
    let record = active(state);
    if (!record) {
      record = { documentId: FORM_ID, caseId: text(state.caseData?.id), revisionNo: 1, baseRevisionNo: null, status: "DRAFT", schemaVersion: 1, payload: payloadFor(state), source: copy(SOURCE), submittedSnapshot: null, reviewHistory: [], createdBy: "เอกสารไม่ระบุ", createdAt: "", updatedBy: "เอกสารไม่ระบุ", updatedAt: "" };
      records.push(record);
      store.version = Math.max(0, Number(store.version) || 0) + 1;
    } else if (Object.keys(object(record.payload)).length === 1 && Object.hasOwn(record.payload, "legacyReportText") && record.status === "DRAFT") {
      const original = typeof record.payload.legacyReportText === "string" && record.payload.legacyReportText.trim() ? record.payload.legacyReportText : object(object(sourceState.inquiry).prelim).report;
      record.payload = payloadFor(state);
      record.payload.opinion.summaryNote = typeof original === "string" ? original : "";
    }
    refreshDerived(state, record);
    state.a5DocumentStore = { ...store, records };
    return { ok: true, code: "REPORT_213_NORMALIZED", state, errors: [], focusTarget: "" };
  }

  const REPEATED = Object.freeze([
    ["receipt.reassignmentRows", "rowId"], ["complainants", "rowId"], ["accusedPersons", "rowId"], ["allegations", "rowId"],
    ["factFindings.chronologyRows", "rowId"], ["evidence", "rowId"], ["legalBasis.lawRows", "rowId"], ["limitation.offenceRows", "rowId"],
    ["witnessProtection.persons", "rowId"], ["analysis.allegationAnalyses", "rowId"], ["reviewOpinions", "opinionId"], ["investigatorSignatures", "slotId"]
  ]);

  function validateRows(payload, errors) {
    REPEATED.forEach(([path, identityKey]) => {
      const rows = getPath(payload, path);
      if (!Array.isArray(rows)) {
        err(errors, path, "รูปแบบรายการไม่ถูกต้อง");
        return;
      }
      const ids = new Set();
      ordered(rows).forEach((row, index) => {
        const id = text(row?.[identityKey]);
        if (!id || ids.has(id)) err(errors, path, "รหัสรายการซ้ำหรือไม่ครบ", "DUPLICATE_ROW_ID");
        ids.add(id);
        if (!Number.isInteger(row?.order) || row.order !== index + 1) err(errors, path, "ลำดับรายการไม่ต่อเนื่อง", "INVALID_ROW_ORDER");
      });
    });
  }

  function sectionComplete(payload) {
    const branch = BRANCHES.find(item => item.branchKey === text(payload.proposal?.branchKey));
    const laws = new Set((payload.legalBasis?.lawRows || []).map(row => row.rowId));
    return {
      documentMeta: !placeholder(payload.documentMeta?.responsibleOfficer?.displayName),
      receipt: Boolean(payload.receipt?.caseType && payload.receipt?.paccReceivedAt && payload.receipt?.preliminaryDueAt),
      complainants: payload.complainants?.length > 0 && payload.complainants.every(row => !placeholder(row.name) && !placeholder(row.address) && ["PERSON", "ORGANIZATION"].includes(row.personType)),
      accusedPersons: payload.accusedPersons?.length > 0 && payload.accusedPersons.every(row => !placeholder(row.name) && !placeholder(row.position) && Array.isArray(row.relatedAllegationRowIds)),
      allegations: payload.allegations?.length > 0 && payload.allegations.every(row => !placeholder(row.summary) && !placeholder(row.place) && Array.isArray(row.accusedRowIds)),
      factFindings: !placeholder(payload.factFindings?.summary) && payload.factFindings?.chronologyRows?.length > 0 && payload.factFindings.chronologyRows.every(row => !placeholder(row.fact) && Array.isArray(row.sourceEvidenceRowIds)),
      eventContext: ["background", "method", "participants", "location", "period"].every(key => !placeholder(payload.eventContext?.[key])),
      damage: !placeholder(payload.damage?.description) && (!placeholder(payload.damage?.amount) || payload.damage?.description === "ไม่มีความเสียหายที่ประเมินได้"),
      evidence: payload.evidence?.length > 0 && payload.evidence.every(row => !placeholder(row.title) && !placeholder(row.factSupported) && row.availability === "AVAILABLE" && !placeholder(row.documentVersionId)),
      legalBasis: payload.legalBasis?.lawRows?.length > 0 && payload.legalBasis.lawRows.every(row => !placeholder(row.lawName) && !placeholder(row.section) && !placeholder(row.applicationReason)) && !placeholder(payload.legalBasis?.authorityAnalysis),
      limitation: payload.limitation?.offenceRows?.length > 0 && payload.limitation.offenceRows.every(row => !placeholder(row.expiresAt) && !placeholder(row.source) && laws.has(row.legalBasisRowId)) && !placeholder(payload.limitation?.overallStatus) && !placeholder(payload.limitation?.analysis),
      witnessProtection: typeof payload.witnessProtection?.requested === "boolean" && !placeholder(payload.witnessProtection?.summary) && (!payload.witnessProtection.requested || payload.witnessProtection.persons?.length > 0),
      analysis: payload.analysis?.allegationAnalyses?.length > 0 && payload.analysis.allegationAnalyses.every(row => !placeholder(row.factAnalysis) && !placeholder(row.conclusion)) && !placeholder(payload.analysis?.overallAnalysis),
      opinion: !placeholder(payload.opinion?.finding) && !placeholder(payload.opinion?.rationale),
      proposal: Boolean(branch && !PENDING_BRANCH_KEYS.has(branch.branchKey) && !placeholder(payload.proposal?.reason) && payload.proposal?.legalBasisRowIds?.length && refs(payload.proposal.legalBasisRowIds, laws) && branch.requiredDetailKeys.every(key => !placeholder(payload.proposal?.branchDetails?.[key]))),
      reviewOpinions: Array.isArray(payload.reviewOpinions) && payload.reviewOpinions.length > 0,
      boardCover: Boolean(payload.boardCover),
      investigatorSignatures: Array.isArray(payload.investigatorSignatures) && payload.investigatorSignatures.length > 0
    };
  }

  function validateReport213A5(input, context = {}) {
    const payload = object(input);
    const errors = [];
    const keys = Object.keys(payload);
    if (keys.length !== SECTION_KEYS.length || !SECTION_KEYS.every(key => Object.hasOwn(payload, key)) || keys.some(key => !SECTION_KEYS.includes(key))) err(errors, "payload", "โครงสร้างรายงานต้องมี 18 ส่วนตามแบบ", "INVALID_PAYLOAD");
    validateRows(payload, errors);
    const accusedIds = new Set((payload.accusedPersons || []).map(row => row.rowId));
    const allegationIds = new Set((payload.allegations || []).map(row => row.rowId));
    const evidenceIds = new Set((payload.evidence || []).map(row => row.rowId));
    const lawIds = new Set((payload.legalBasis?.lawRows || []).map(row => row.rowId));
    (payload.complainants || []).forEach((row, index) => { if (!["PERSON", "ORGANIZATION"].includes(row.personType)) err(errors, `complainants.${index}.personType`, "ประเภทผู้กล่าวหาไม่ถูกต้อง"); });
    (payload.accusedPersons || []).forEach((row, index) => { if (!refs(row.relatedAllegationRowIds, allegationIds)) err(errors, `accusedPersons.${index}.relatedAllegationRowIds`, "อ้างอิงข้อกล่าวหาไม่ถูกต้อง", "BROKEN_REFERENCE"); });
    (payload.allegations || []).forEach((row, index) => { if (!refs(row.accusedRowIds, accusedIds)) err(errors, `allegations.${index}.accusedRowIds`, "อ้างอิงผู้ถูกกล่าวหาไม่ถูกต้อง", "BROKEN_REFERENCE"); });
    (payload.factFindings?.chronologyRows || []).forEach((row, index) => { if (!refs(row.sourceEvidenceRowIds, evidenceIds)) err(errors, `factFindings.chronologyRows.${index}.sourceEvidenceRowIds`, "อ้างอิงพยานหลักฐานไม่ถูกต้อง", "BROKEN_REFERENCE"); });
    (payload.limitation?.offenceRows || []).forEach((row, index) => { if (!accusedIds.has(row.accusedRowId) || !lawIds.has(row.legalBasisRowId)) err(errors, `limitation.offenceRows.${index}`, "อ้างอิงผู้ถูกกล่าวหาหรือข้อกฎหมายไม่ถูกต้อง", "BROKEN_REFERENCE"); });
    (payload.analysis?.allegationAnalyses || []).forEach((row, index) => { if (!allegationIds.has(row.allegationRowId) || !accusedIds.has(row.accusedRowId) || !refs(row.evidenceRowIds, evidenceIds) || !refs(row.legalBasisRowIds, lawIds)) err(errors, `analysis.allegationAnalyses.${index}`, "อ้างอิงผลวิเคราะห์ไม่ถูกต้อง", "BROKEN_REFERENCE"); });
    if (text(payload.receipt?.caseType) && !["NACC_SECTION_62", "MISCONDUCT"].includes(payload.receipt.caseType)) err(errors, "receipt.caseType", "ประเภทเรื่องไม่ถูกต้อง");
    (payload.evidence || []).forEach((row, index) => { if (!["AVAILABLE", "REFERENCE_ONLY", "MISSING"].includes(row.availability)) err(errors, `evidence.${index}.availability`, "สถานะเอกสารไม่ถูกต้อง"); });
    const dateFields = [
      "documentMeta.preparedAt", "receipt.sourceReceivedAt", "receipt.sourceResolutionAt", "receipt.paccReceivedAt", "receipt.divisionReceivedAt", "receipt.preliminaryDueAt", "receipt.assignedAt"
    ];
    dateFields.forEach(path => { if (!isDate(getPath(payload, path))) err(errors, path, "วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD", "INVALID_DATE"); });
    (payload.receipt?.reassignmentRows || []).forEach((row, index) => { if (!isTimestamp(row.assignedAt)) err(errors, `receipt.reassignmentRows.${index}.assignedAt`, "วันเวลามอบหมายไม่ถูกต้อง", "INVALID_DATE"); });
    (payload.allegations || []).forEach((row, index) => ["eventDateFrom", "eventDateTo"].forEach(key => { if (!isDate(row[key])) err(errors, `allegations.${index}.${key}`, "วันที่เกิดเหตุไม่ถูกต้อง", "INVALID_DATE"); }));
    (payload.factFindings?.chronologyRows || []).forEach((row, index) => { if (!isDate(row.occurredAt)) err(errors, `factFindings.chronologyRows.${index}.occurredAt`, "วันที่ข้อเท็จจริงไม่ถูกต้อง", "INVALID_DATE"); });
    (payload.limitation?.offenceRows || []).forEach((row, index) => ["startAt", "expiresAt"].forEach(key => { if (!isDate(row[key])) err(errors, `limitation.offenceRows.${index}.${key}`, "วันที่อายุความไม่ถูกต้อง", "INVALID_DATE"); }));
    (payload.reviewOpinions || []).forEach((row, index) => { if (!isTimestamp(row.recordedAt) || !Number.isInteger(row.sourceRevisionNo) || row.sourceRevisionNo < 0) err(errors, `reviewOpinions.${index}`, "ข้อมูลความเห็นตามลำดับชั้นไม่ถูกต้อง"); });
    if (text(payload.damage?.amount) && !/^\d+(?:\.\d+)?$/.test(text(payload.damage.amount))) err(errors, "damage.amount", "จำนวนความเสียหายต้องเป็นเลขฐานสิบ");
    const branch = BRANCHES.find(item => item.branchKey === text(payload.proposal?.branchKey));
    if (text(payload.proposal?.branchKey) && !branch) err(errors, "proposal.branchKey", "ข้อเสนอไม่อยู่ในแบบรายงาน", "INVALID_PROPOSAL_BRANCH");
    if (branch && PENDING_BRANCH_KEYS.has(branch.branchKey)) err(errors, "proposal.branchKey", "ข้อเสนอนี้รอยืนยันข้อความและอำนาจจากเอกสารต้นทาง", "PENDING_CONFIRMATION");
    if (branch && !PENDING_BRANCH_KEYS.has(branch.branchKey)) {
      if (placeholder(payload.proposal?.reason)) err(errors, "proposal.reason", "ต้องระบุเหตุผลประกอบข้อเสนอ", "PROPOSAL_BRANCH_INCOMPLETE");
      if (!(payload.proposal?.legalBasisRowIds || []).length || !refs(payload.proposal.legalBasisRowIds, lawIds)) err(errors, "proposal.legalBasisRowIds", "ต้องระบุข้อกฎหมายที่อ้างอิง", "PROPOSAL_BRANCH_INCOMPLETE");
      const detail = object(payload.proposal?.branchDetails);
      if (Object.keys(detail).some(key => !branch.requiredDetailKeys.includes(key))) err(errors, "proposal.branchDetails", "พบรายละเอียดที่ไม่ใช่ของข้อเสนอที่เลือก", "INVALID_PROPOSAL_BRANCH");
      if (branch.requiredDetailKeys.some(key => placeholder(detail[key]))) err(errors, "proposal.branchDetails", "รายละเอียดข้อเสนอไม่ครบ", "PROPOSAL_BRANCH_INCOMPLETE");
    }
    const completed = sectionComplete(payload);
    const completion = Object.fromEntries(SECTION_KEYS.map(key => [key, completed[key] ? "COMPLETE" : READ_ONLY_SECTIONS.has(key) && (payload[key] === null || payload[key]?.length === 0) ? "READ_ONLY_EMPTY" : hasMeaningfulValue(payload[key]) ? "PARTIAL" : "EMPTY"]));
    if (context.intent === "SUBMISSION") {
      SECTION_KEYS.filter(key => !["reviewOpinions", "boardCover", "investigatorSignatures"].includes(key)).forEach(key => { if (!completed[key]) err(errors, key, "ข้อมูลที่จำเป็นสำหรับเสนอรายงานไม่ครบถ้วน", "MISSING_REQUIRED_FIELD"); });
    }
    return { ok: errors.length === 0, code: errors.length ? errors[0].code : "REPORT_213_VALID", errors: errors.map(({ field, message }) => ({ field, message })), focusTarget: errors[0]?.field || "", completion };
  }

  function hasMeaningfulValue(value) {
    if (typeof value === "boolean") return true;
    if (typeof value === "string") return !placeholder(value);
    if (Array.isArray(value)) return value.some(hasMeaningfulValue);
    if (value && typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
    return false;
  }

  function readonlyMismatch(supplied, source, record) {
    const meta = object(supplied.documentMeta);
    const receipt = object(supplied.receipt);
    const checks = [
      ["documentMeta.caseId", meta, "caseId", source.documentMeta.caseId], ["documentMeta.caseNumber", meta, "caseNumber", source.documentMeta.caseNumber],
      ["documentMeta.subject", meta, "subject", source.documentMeta.subject], ["documentMeta.unitName", meta, "unitName", source.documentMeta.unitName],
      ["documentMeta.responsibleOfficer", meta, "responsibleOfficer", source.documentMeta.responsibleOfficer], ["documentMeta.assistantOfficers", meta, "assistantOfficers", source.documentMeta.assistantOfficers],
      ["documentMeta.sourceLinks", meta, "sourceLinks", source.documentMeta.sourceLinks],
      ...[...DERIVED_RECEIPT_FIELDS].map(key => [`receipt.${key}`, receipt, key, source.receipt[key]]),
      ["reviewOpinions", supplied, "reviewOpinions", record.payload.reviewOpinions], ["boardCover", supplied, "boardCover", record.payload.boardCover],
      ["investigatorSignatures", supplied, "investigatorSignatures", source.investigatorSignatures]
    ];
    return checks.find(([, container, key, expected]) => Object.hasOwn(container, key) && !same(container[key], expected));
  }

  function saveReport213DraftA5(sourceState, command) {
    const original = copy(sourceState);
    const normalized = normalizeReport213A5(sourceState);
    if (!normalized.ok) return { ...normalized, state: original };
    const record = active(normalized.state);
    const input = object(command);
    const owner = text(record.payload?.documentMeta?.responsibleOfficer?.officerId);
    if (text(input.actorId) !== owner) return { ok: false, code: "FORBIDDEN_ACTOR", state: original, errors: [{ field: "actorId", message: "ผู้ใช้นี้ไม่มีสิทธิ์แก้ไขรายงาน" }], focusTarget: "" };
    if (record.status !== "DRAFT") return { ok: false, code: "SNAPSHOT_IMMUTABLE", state: original, errors: [{ field: "status", message: "ฉบับที่เสนอแล้วแก้ไขไม่ได้" }], focusTarget: "status" };
    const source = derived(normalized.state);
    const supplied = object(input.payload);
    const mismatch = readonlyMismatch(supplied, source, record);
    if (mismatch) return { ok: false, code: "READ_ONLY_FIELD", state: original, errors: [{ field: mismatch[0], message: "ข้อมูลต้นทางหรือข้อมูลตรวจทานแก้ไขไม่ได้" }], focusTarget: mismatch[0] };
    const priorEvidence = new Map((record.payload.evidence || []).map(row => [row.rowId, row]));
    const repository = evidenceRepository(normalized.state);
    const evidenceSpoof = (supplied.evidence || []).find(row => {
      const before = priorEvidence.get(row.rowId);
      const actual = repository.get(text(row.documentVersionId))?.availability || "MISSING";
      return before && before.documentVersionId === row.documentVersionId && Object.hasOwn(row, "availability") && row.availability !== actual;
    });
    if (evidenceSpoof) return { ok: false, code: "READ_ONLY_FIELD", state: original, errors: [{ field: "evidence.availability", message: "สถานะเอกสารอ้างอิงแก้ไขไม่ได้" }], focusTarget: "evidence" };
    const payload = { ...copy(record.payload), ...copy(supplied) };
    payload.documentMeta = { ...source.documentMeta, preparedAt: rawString(object(supplied.documentMeta).preparedAt || record.payload.documentMeta?.preparedAt) };
    payload.receipt = { ...copy(record.payload.receipt), ...copy(object(supplied.receipt)), ...source.receipt };
    payload.factFindings = { ...copy(record.payload.factFindings), ...copy(object(supplied.factFindings)), worklogEntryIds: source.worklogEntryIds };
    payload.evidence = evidenceProjection(normalized.state, supplied.evidence ?? record.payload.evidence);
    payload.reviewOpinions = copy(record.payload.reviewOpinions);
    payload.boardCover = copy(record.payload.boardCover);
    payload.investigatorSignatures = source.investigatorSignatures;
    const validation = validateReport213A5(payload, { intent: "DRAFT" });
    if (!validation.ok) return { ok: false, code: validation.code, state: original, errors: validation.errors, focusTarget: validation.focusTarget };
    const result = domain().saveA5DocumentDraft(normalized.state, { caseId: text(input.caseId), documentId: FORM_ID, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: text(input.actorId), at: text(input.at), idempotencyKey: text(input.idempotencyKey), payload });
    return result.ok ? { ...result, code: "REPORT_213_DRAFT_SAVED" } : { ...result, state: original };
  }

  function validateSourceLinks(state, payload) {
    const records = object(state.a5DocumentStore).records || [];
    const links = object(payload.documentMeta).sourceLinks;
    const plan = records.find(item => item.documentId === links?.plan?.documentId && item.revisionNo === links?.plan?.revisionNo);
    const worklog = records.find(item => item.documentId === links?.worklog?.documentId && item.revisionNo === links?.worklog?.revisionNo);
    if (!plan || !worklog) return false;
    const entries = ordered(worklog.payload?.entries);
    const ids = entries.map(entry => text(entry.entryId)).filter(Boolean);
    return text(links.worklog.cutoffEntryId) === text(entries.at(-1)?.entryId) && same(payload.factFindings?.worklogEntryIds || [], ids);
  }

  function buildReport213SubmissionA5(sourceState, command) {
    const original = copy(sourceState);
    const normalized = normalizeReport213A5(sourceState);
    if (!normalized.ok) return { ...normalized, state: original };
    const record = active(normalized.state);
    const input = object(command);
    if (text(input.caseId) !== text(normalized.state.caseData?.id) || Number(input.revisionNo) !== record?.revisionNo) return { ok: false, code: "SOURCE_REVISION_NOT_FOUND", state: original, errors: [{ field: "revisionNo", message: "ไม่พบฉบับรายงาน" }], focusTarget: "revisionNo" };
    const validation = validateReport213A5(record.payload, { intent: "SUBMISSION" });
    if (!validation.ok) return { ok: false, code: validation.code, state: original, errors: validation.errors, focusTarget: validation.focusTarget };
    if (!validateSourceLinks(normalized.state, record.payload)) return { ok: false, code: "SOURCE_REVISION_NOT_FOUND", state: original, errors: [{ field: "documentMeta.sourceLinks", message: "เอกสารแผนงานหรือบันทึกการปฏิบัติงานไม่ตรงฉบับที่อ้างอิง" }], focusTarget: "documentMeta" };
    const repository = evidenceRepository(normalized.state);
    const unresolved = record.payload.evidence.find(row => repository.get(text(row.documentVersionId))?.availability !== "AVAILABLE");
    if (unresolved) return { ok: false, code: "EVIDENCE_VERSION_UNAVAILABLE", state: original, errors: [{ field: "evidence", message: "ไม่พบเอกสารพยานหลักฐานฉบับที่อ้างอิง" }], focusTarget: "evidence" };
    const links = record.payload.documentMeta.sourceLinks;
    return {
      ok: true,
      code: "REPORT_213_SUBMISSION_CANDIDATE_BUILT",
      state: normalized.state,
      errors: [],
      focusTarget: "",
      submissionCandidate: {
        payload: copy(record.payload),
        report: { documentId: FORM_ID, revisionNo: record.revisionNo },
        plan: copy(links.plan),
        worklog: { ...copy(links.worklog), includedEntryIds: copy(record.payload.factFindings.worklogEntryIds) },
        evidenceVersionIds: record.payload.evidence.map(row => row.documentVersionId)
      }
    };
  }

  const ROW_DEFAULTS = Object.freeze({
    "complainants": { personType: "PERSON", name: "", address: "", contact: "", capacity: "" },
    "accusedPersons": { name: "", position: "", agency: "", statusAtEvent: "", relatedAllegationRowIds: [] },
    "allegations": { summary: "", eventDateFrom: "", eventDateTo: "", place: "", accusedRowIds: [] },
    "factFindings.chronologyRows": { occurredAt: "", fact: "", sourceEvidenceRowIds: [] },
    "evidence": { category: "", title: "", factSupported: "", custodyNote: "", documentVersionId: "", availability: "MISSING" },
    "legalBasis.lawRows": { lawName: "", section: "", applicationReason: "" },
    "limitation.offenceRows": { accusedRowId: "", legalBasisRowId: "", startAt: "", expiresAt: "", source: "", note: "" },
    "witnessProtection.persons": { nameOrCode: "", measure: "", reason: "" },
    "analysis.allegationAnalyses": { allegationRowId: "", accusedRowId: "", factAnalysis: "", evidenceRowIds: [], legalBasisRowIds: [], conclusion: "" }
  });
  const ROW_PREFIX = Object.freeze({ complainants: "complainant", accusedPersons: "accused", allegations: "allegation", "factFindings.chronologyRows": "chronology", evidence: "evidence", "legalBasis.lawRows": "law", "limitation.offenceRows": "limitation", "witnessProtection.persons": "witness", "analysis.allegationAnalyses": "analysis" });
  let rowSequence = 0;
  const freshRowId = path => `${ROW_PREFIX[path] || "row"}-${Date.now().toString(36)}-${(++rowSequence).toString(36)}`;

  function mutateReport213RowsA5(input, command) {
    const payload = copy(input);
    const path = text(command?.path);
    if (!Object.hasOwn(ROW_DEFAULTS, path)) return payload;
    const rows = ordered(getPath(payload, path));
    const rowId = text(command?.rowId);
    if (command?.action === "add") rows.push({ rowId: freshRowId(path), order: rows.length + 1, ...copy(ROW_DEFAULTS[path]) });
    if (command?.action === "delete") {
      const index = rows.findIndex(row => row.rowId === rowId);
      if (index >= 0) rows.splice(index, 1);
    }
    if (command?.action === "move") {
      const index = rows.findIndex(row => row.rowId === rowId);
      const next = index + Number(command.direction || 0);
      if (index >= 0 && next >= 0 && next < rows.length) [rows[index], rows[next]] = [rows[next], rows[index]];
    }
    rows.forEach((row, index) => { row.order = index + 1; });
    setPath(payload, path, rows);
    return payload;
  }

  const LABELS = Object.freeze({
    preparedAt: "วันที่จัดทำ", sourceReference: "เลขอ้างอิงต้นทาง", sourceProvince: "จังหวัดต้นทาง", sourceResolutionNo: "เลขมติ/หนังสือต้นทาง", sourceResolutionAt: "วันที่มติ/หนังสือต้นทาง", divisionReceivedAt: "วันที่หน่วยงานรับเรื่อง", assignedAt: "วันที่มอบหมาย",
    personType: "ประเภทผู้กล่าวหา", name: "ชื่อ", address: "ที่อยู่", contact: "ข้อมูลติดต่อ", capacity: "ฐานะผู้กล่าวหา", position: "ตำแหน่ง", agency: "หน่วยงาน", statusAtEvent: "สถานะขณะเกิดเหตุ", relatedAllegationRowIds: "ข้อกล่าวหาที่เกี่ยวข้อง",
    summary: "สรุป", eventDateFrom: "วันที่เริ่มเหตุ", eventDateTo: "วันที่สิ้นสุดเหตุ", place: "สถานที่", accusedRowIds: "ผู้ถูกกล่าวหาที่เกี่ยวข้อง", occurredAt: "วันที่เกิดข้อเท็จจริง", fact: "ข้อเท็จจริง", sourceEvidenceRowIds: "พยานหลักฐานอ้างอิง",
    background: "ความเป็นมา", method: "วิธีการ", participants: "ผู้เกี่ยวข้อง", location: "สถานที่", period: "ช่วงเวลา", description: "รายละเอียด", amount: "จำนวนเงิน", currency: "สกุลเงิน", injuredParties: "ผู้เสียหาย", calculationNote: "หลักการคำนวณ",
    category: "ประเภทพยานหลักฐาน", title: "ชื่อพยานหลักฐาน", factSupported: "ข้อเท็จจริงที่สนับสนุน", custodyNote: "การเก็บรักษา", documentVersionId: "เอกสารฉบับที่อ้างอิง", lawName: "ชื่อกฎหมาย", section: "มาตรา", applicationReason: "เหตุผลที่ใช้", authorityAnalysis: "วิเคราะห์อำนาจหน้าที่",
    accusedRowId: "ผู้ถูกกล่าวหา", legalBasisRowId: "ข้อกฎหมาย", startAt: "วันเริ่มนับ", expiresAt: "วันครบอายุความ", source: "ที่มาของการคำนวณ", note: "หมายเหตุ", overallStatus: "สถานะอายุความรวม", analysis: "บทวิเคราะห์อายุความ",
    requested: "ขอคุ้มครองพยาน", nameOrCode: "ชื่อหรือรหัสพยาน", measure: "มาตรการ", reason: "เหตุผล", allegationRowId: "ข้อกล่าวหา", factAnalysis: "วิเคราะห์ข้อเท็จจริง", evidenceRowIds: "พยานหลักฐาน", legalBasisRowIds: "ข้อกฎหมาย", conclusion: "ข้อสรุป", overallAnalysis: "บทวิเคราะห์รวม",
    summaryNote: "สรุปจากข้อมูลเดิม", finding: "ผลความเห็น", rationale: "เหตุผลความเห็น", branchKey: "ข้อเสนอ", branchDetails: "รายละเอียดข้อเสนอ"
  });

  const htmlValue = value => escapeHtml(rawString(value));
  const inputControl = (path, value, label, type = "text") => `<label class="a5-report-field"><span>${escapeHtml(label)}</span><input type="${type}" value="${htmlValue(value)}" data-a5-report-bind="${escapeHtml(path)}"></label>`;
  const textareaControl = (path, value, label) => `<label class="a5-report-field"><span>${escapeHtml(label)}</span><textarea data-a5-report-bind="${escapeHtml(path)}">${htmlValue(value)}</textarea></label>`;
  const optionsFor = (rows, valueKey, labelKey) => ordered(rows).map(row => ({ value: row[valueKey], label: row[labelKey] || "เอกสารไม่ระบุ" }));
  const selectControl = (path, value, label, options, multiple = false) => {
    const selected = new Set(Array.isArray(value) ? value : [value]);
    return `<label class="a5-report-field"><span>${escapeHtml(label)}</span><select data-a5-report-bind="${escapeHtml(path)}"${multiple ? " multiple" : ""}>${options.map(option => `<option value="${escapeHtml(option.value)}"${selected.has(option.value) ? " selected" : ""}${option.disabled ? " disabled" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
  };

  function rowFieldControl(path, field, value, payload, options) {
    const label = LABELS[field] || "ข้อมูล";
    const selectMap = {
      personType: Object.entries(PERSON_TYPE_LABELS).map(([key, item]) => ({ value: key, label: item })),
      relatedAllegationRowIds: optionsFor(payload.allegations, "rowId", "summary"), accusedRowIds: optionsFor(payload.accusedPersons, "rowId", "name"),
      sourceEvidenceRowIds: optionsFor(payload.evidence, "rowId", "title"), evidenceRowIds: optionsFor(payload.evidence, "rowId", "title"), legalBasisRowIds: optionsFor(payload.legalBasis?.lawRows, "rowId", "lawName"),
      accusedRowId: optionsFor(payload.accusedPersons, "rowId", "name"), allegationRowId: optionsFor(payload.allegations, "rowId", "summary"), legalBasisRowId: optionsFor(payload.legalBasis?.lawRows, "rowId", "lawName"),
      documentVersionId: (options.evidenceVersions || []).map(item => ({ value: item.versionId, label: `${item.name || "เอกสาร"} — ${AVAILABILITY_LABELS[item.availability] || AVAILABILITY_LABELS.MISSING}` }))
    };
    if (selectMap[field]) {
      const values = Array.isArray(value) ? value : [value];
      values.filter(Boolean).forEach(selected => { if (!selectMap[field].some(item => item.value === selected)) selectMap[field].push({ value: selected, label: "ไม่พบฉบับอ้างอิง" }); });
      const selected = new Set(values);
      return `<label class="a5-report-field"><span>${escapeHtml(label)}</span><select data-a5-report-row-field="${field}"${Array.isArray(value) ? " multiple" : ""}>${selectMap[field].map(item => `<option value="${escapeHtml(item.value)}"${selected.has(item.value) ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>`;
    }
    const type = /(?:At|DateFrom|DateTo)$/.test(field) ? "date" : "text";
    const multiline = ["address", "fact", "summary", "factSupported", "custodyNote", "applicationReason", "source", "note", "measure", "reason", "factAnalysis", "conclusion"].includes(field);
    return `<label class="a5-report-field"><span>${escapeHtml(label)}</span>${multiline ? `<textarea data-a5-report-row-field="${field}">${htmlValue(value)}</textarea>` : `<input type="${type}" value="${htmlValue(value)}" data-a5-report-row-field="${field}">`}</label>`;
  }

  function rowsControl(path, rows, payload, options) {
    const defaults = ROW_DEFAULTS[path];
    return `<div class="a5-report-row-list" data-a5-report-row-list="${path}">${ordered(rows).map((row, index, all) => `<fieldset data-a5-report-row="${path}" data-row-key="${escapeHtml(row.rowId)}"><legend>รายการที่ ${index + 1}</legend>${Object.keys(defaults).filter(field => field !== "availability").map(field => rowFieldControl(path, field, row[field], payload, options)).join("")}<div class="ws-actions"><button type="button" class="ws-button ghost" data-a5-report-row-action="move" data-path="${path}" data-row-key="${escapeHtml(row.rowId)}" data-direction="-1"${index === 0 ? " disabled" : ""}>เลื่อนขึ้น</button><button type="button" class="ws-button ghost" data-a5-report-row-action="move" data-path="${path}" data-row-key="${escapeHtml(row.rowId)}" data-direction="1"${index === all.length - 1 ? " disabled" : ""}>เลื่อนลง</button><button type="button" class="ws-button danger" data-a5-report-row-action="delete" data-path="${path}" data-row-key="${escapeHtml(row.rowId)}">ลบรายการ</button></div></fieldset>`).join("")}<button type="button" class="ws-button secondary" data-a5-report-row-action="add" data-path="${path}">เพิ่มรายการ</button></div>`;
  }

  function derivedSummary(payload) {
    const meta = payload.documentMeta || {};
    const blank = "—";
    return `<dl class="a5-report-derived"><dt>เลขสำนวน</dt><dd>${escapeHtml(meta.caseNumber || blank)}</dd><dt>เรื่อง</dt><dd>${escapeHtml(meta.subject || blank)}</dd><dt>หน่วยงาน</dt><dd>${escapeHtml(meta.unitName || blank)}</dd><dt>ผู้รับผิดชอบ</dt><dd>${escapeHtml(meta.responsibleOfficer?.displayName || blank)}</dd><dt>แผนงานคดีฉบับ</dt><dd>${Number(meta.sourceLinks?.plan?.revisionNo) || blank}</dd><dt>บันทึกการปฏิบัติงานฉบับ</dt><dd>${Number(meta.sourceLinks?.worklog?.revisionNo) || blank}</dd></dl>`;
  }

  function sectionControls(key, payload, options) {
    if (key === "documentMeta") return `${derivedSummary(payload)}${inputControl("documentMeta.preparedAt", payload.documentMeta?.preparedAt, LABELS.preparedAt, "date")}`;
    if (key === "receipt") return `<div class="a5-report-derived">ประเภทเรื่อง: ${escapeHtml(CASE_TYPE_LABELS[payload.receipt?.caseType] || "—")}<br>วันที่สำนักงานรับเรื่อง: ${escapeHtml(payload.receipt?.paccReceivedAt || "—")}<br>วันครบกำหนด: ${escapeHtml(payload.receipt?.preliminaryDueAt || "—")}</div>${["sourceReference", "sourceProvince", "sourceResolutionNo", "sourceResolutionAt", "divisionReceivedAt", "assignedAt"].map(field => inputControl(`receipt.${field}`, payload.receipt?.[field], LABELS[field], field.endsWith("At") ? "date" : "text")).join("")}`;
    if (ROW_DEFAULTS[key]) return rowsControl(key, payload[key], payload, options);
    if (key === "factFindings") return `${textareaControl("factFindings.summary", payload.factFindings?.summary, "สรุปข้อเท็จจริง")}<p class="a5-report-derived">อ้างอิงบันทึกการปฏิบัติงาน ${payload.factFindings?.worklogEntryIds?.length || 0} รายการ</p>${rowsControl("factFindings.chronologyRows", payload.factFindings?.chronologyRows, payload, options)}`;
    if (key === "eventContext") return ["background", "method", "participants", "location", "period"].map(field => textareaControl(`eventContext.${field}`, payload.eventContext?.[field], LABELS[field])).join("");
    if (key === "damage") return `${textareaControl("damage.description", payload.damage?.description, LABELS.description)}${inputControl("damage.amount", payload.damage?.amount, LABELS.amount)}${inputControl("damage.currency", payload.damage?.currency, LABELS.currency)}${textareaControl("damage.injuredParties", payload.damage?.injuredParties, LABELS.injuredParties)}${textareaControl("damage.calculationNote", payload.damage?.calculationNote, LABELS.calculationNote)}`;
    if (key === "legalBasis") return `${rowsControl("legalBasis.lawRows", payload.legalBasis?.lawRows, payload, options)}${textareaControl("legalBasis.authorityAnalysis", payload.legalBasis?.authorityAnalysis, LABELS.authorityAnalysis)}`;
    if (key === "limitation") return `${rowsControl("limitation.offenceRows", payload.limitation?.offenceRows, payload, options)}${textareaControl("limitation.overallStatus", payload.limitation?.overallStatus, LABELS.overallStatus)}${textareaControl("limitation.analysis", payload.limitation?.analysis, LABELS.analysis)}`;
    if (key === "witnessProtection") return `${selectControl("witnessProtection.requested", String(Boolean(payload.witnessProtection?.requested)), LABELS.requested, [{ value: "false", label: "ไม่ขอคุ้มครอง" }, { value: "true", label: "ขอคุ้มครอง" }])}${rowsControl("witnessProtection.persons", payload.witnessProtection?.persons, payload, options)}${textareaControl("witnessProtection.summary", payload.witnessProtection?.summary, "สรุปการพิจารณาคุ้มครองพยาน")}`;
    if (key === "analysis") return `${rowsControl("analysis.allegationAnalyses", payload.analysis?.allegationAnalyses, payload, options)}${textareaControl("analysis.overallAnalysis", payload.analysis?.overallAnalysis, LABELS.overallAnalysis)}`;
    if (key === "opinion") return `${textareaControl("opinion.summaryNote", payload.opinion?.summaryNote, LABELS.summaryNote)}${textareaControl("opinion.finding", payload.opinion?.finding, LABELS.finding)}${textareaControl("opinion.rationale", payload.opinion?.rationale, LABELS.rationale)}`;
    if (key === "proposal") {
      const branch = BRANCHES.find(item => item.branchKey === payload.proposal?.branchKey);
      return `${selectControl("proposal.branchKey", payload.proposal?.branchKey, LABELS.branchKey, [{ value: "", label: "เลือกข้อเสนอ" }, ...BRANCHES.map(item => ({ value: item.branchKey, label: item.thaiLabel, disabled: PENDING_BRANCH_KEYS.has(item.branchKey) }))])}${textareaControl("proposal.reason", payload.proposal?.reason, LABELS.reason)}${selectControl("proposal.legalBasisRowIds", payload.proposal?.legalBasisRowIds, LABELS.legalBasisRowIds, optionsFor(payload.legalBasis?.lawRows, "rowId", "lawName"), true)}${(branch?.requiredDetailKeys || []).map(detail => textareaControl(`proposal.branchDetails.${detail}`, payload.proposal?.branchDetails?.[detail], detail)).join("")}`;
    }
    if (key === "reviewOpinions") return `<div class="a5-report-derived">${ordered(payload.reviewOpinions).map(item => `${escapeHtml(item.reviewerRole)}: ${escapeHtml(item.opinionText)}`).join("<br>") || "ยังไม่มีความเห็นตามลำดับชั้น"}</div>`;
    if (key === "boardCover") return `<div class="a5-report-derived">${payload.boardCover ? `${escapeHtml(payload.boardCover.displayReference || "—")} — ${escapeHtml(payload.boardCover.statusLabel || "—")}` : "ยังไม่มีเอกสารเสนอคณะกรรมการ"}</div>`;
    if (key === "investigatorSignatures") return `<div class="a5-report-derived">${ordered(payload.investigatorSignatures).map(item => `${escapeHtml(item.officerName)} — ${escapeHtml(item.roleLabel)} — ${escapeHtml(item.signatureStatusLabel)}`).join("<br>") || "—"}</div>`;
    return "";
  }

  const completionLabel = value => ({ EMPTY: "ยังไม่ครบ", PARTIAL: "กรอกบางส่วน", COMPLETE: "ครบ", READ_ONLY_EMPTY: "ไม่มีข้อมูลต้นทาง" }[value] || "ยังไม่ครบ");

  const OFFICIAL_EMPTY = "เอกสารไม่ระบุ";
  const INSPECT_LABELS = Object.freeze({
    ...LABELS,
    caseType: "ประเภทเรื่อง", sourceReceivedAt: "วันที่รับเรื่องจากต้นทาง", sourceChannel: "ช่องทางรับเรื่อง", paccReceivedAt: "วันที่สำนักงานรับเรื่อง", preliminaryDueAt: "วันครบกำหนด",
    reviewerRole: "ผู้พิจารณา", opinionText: "ความเห็น", decision: "ผลการพิจารณา", reviewedAt: "วันที่พิจารณา",
    displayReference: "เลขอ้างอิงเอกสาร", statusLabel: "สถานะเอกสาร", officerName: "ชื่อผู้จัดทำ", positionName: "ตำแหน่ง", roleLabel: "หน้าที่", signatureStatusLabel: "สถานะการลงนาม", signedAt: "วันที่ลงนาม"
  });

  const formatInspectDate = value => {
    const match = rawString(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
  };

  function inspectReferences(payload, options) {
    const pairs = [
      [payload.complainants, "name"], [payload.accusedPersons, "name"], [payload.allegations, "summary"],
      [payload.evidence, "title"], [payload.legalBasis?.lawRows, "lawName"]
    ];
    const references = new Map();
    pairs.forEach(([rows, labelKey]) => (rows || []).forEach(row => {
      const label = text(row?.[labelKey]);
      if (row?.rowId && label) references.set(row.rowId, label);
    }));
    (options.evidenceVersions || []).forEach(item => {
      if (item?.versionId) references.set(item.versionId, text(item.name) || "เอกสารอ้างอิง");
    });
    return references;
  }

  function inspectValue(value, field, payload, options, references) {
    if (Array.isArray(value)) {
      if (!value.length) return OFFICIAL_EMPTY;
      return value.map(item => references.get(item) || item).join(", ");
    }
    if (value === true) return field === "requested" ? "ขอคุ้มครอง" : "ใช่";
    if (value === false) return field === "requested" ? "ไม่ขอคุ้มครอง" : "ไม่ใช่";
    if (value === null || value === undefined || text(String(value)) === "") return OFFICIAL_EMPTY;
    if (field === "caseType") return CASE_TYPE_LABELS[value] || OFFICIAL_EMPTY;
    if (field === "personType") return PERSON_TYPE_LABELS[value] || value;
    if (field === "availability") return AVAILABILITY_LABELS[value] || value;
    if (field === "currency" && value === "THB") return "บาท";
    if (field === "branchKey") return BRANCHES.find(item => item.branchKey === value)?.thaiLabel || OFFICIAL_EMPTY;
    if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(String(value))) return formatInspectDate(String(value));
    return references.get(value) || value;
  }

  function inspectDl(entries, payload, options, references) {
    return `<dl class="a5r-inspect-data">${entries.map(([label, value, field]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(inspectValue(value, field || "", payload, options, references))}</dd></div>`).join("")}</dl>`;
  }

  function inspectRows(path, rows, fields, payload, options, references) {
    const values = ordered(rows);
    if (!values.length) return `<p class="a5r-inspect-empty" data-a5-report-row-list="${escapeHtml(path)}">${OFFICIAL_EMPTY}</p>`;
    return `<ol class="a5r-inspect-list" data-a5-report-row-list="${escapeHtml(path)}">${values.map(row => `<li>${inspectDl(fields.map(field => [INSPECT_LABELS[field] || field, row?.[field], field]), payload, options, references)}</li>`).join("")}</ol>`;
  }

  function inspectSectionContent(key, payload, options, references) {
    if (key === "documentMeta") {
      const meta = payload.documentMeta || {};
      return inspectDl([
        ["เลขสำนวน", meta.caseNumber], ["เรื่อง", meta.subject], ["หน่วยงาน", meta.unitName], ["ผู้รับผิดชอบ", meta.responsibleOfficer?.displayName],
        ["แผนงานคดีฉบับ", Number(meta.sourceLinks?.plan?.revisionNo) || ""], ["บันทึกการปฏิบัติงานฉบับ", Number(meta.sourceLinks?.worklog?.revisionNo) || ""], [LABELS.preparedAt, meta.preparedAt, "preparedAt"]
      ], payload, options, references);
    }
    if (key === "receipt") {
      const receipt = payload.receipt || {};
      return inspectDl(["caseType", "sourceReceivedAt", "sourceChannel", "sourceReference", "sourceProvince", "sourceResolutionNo", "sourceResolutionAt", "paccReceivedAt", "divisionReceivedAt", "preliminaryDueAt", "assignedAt"].map(field => [INSPECT_LABELS[field] || field, receipt[field], field]), payload, options, references)
        + inspectRows("receipt.reassignmentRows", receipt.reassignmentRows, ["assignedAt", "reason"], payload, options, references);
    }
    if (ROW_DEFAULTS[key]) {
      const fields = Object.keys(ROW_DEFAULTS[key]).filter(field => !["rowId", "order"].includes(field));
      if (key === "evidence" && !fields.includes("availability")) fields.push("availability");
      return inspectRows(key, payload[key], fields, payload, options, references);
    }
    if (key === "factFindings") return inspectDl([["สรุปข้อเท็จจริง", payload.factFindings?.summary], ["รายการบันทึกการปฏิบัติงานที่อ้างอิง", payload.factFindings?.worklogEntryIds?.length || ""]], payload, options, references) + inspectRows("factFindings.chronologyRows", payload.factFindings?.chronologyRows, Object.keys(ROW_DEFAULTS["factFindings.chronologyRows"]), payload, options, references);
    if (key === "eventContext") return inspectDl(["background", "method", "participants", "location", "period"].map(field => [LABELS[field], payload.eventContext?.[field], field]), payload, options, references);
    if (key === "damage") return inspectDl(["description", "amount", "currency", "injuredParties", "calculationNote"].map(field => [LABELS[field], payload.damage?.[field], field]), payload, options, references);
    if (key === "legalBasis") return inspectRows("legalBasis.lawRows", payload.legalBasis?.lawRows, Object.keys(ROW_DEFAULTS["legalBasis.lawRows"]), payload, options, references) + inspectDl([[LABELS.authorityAnalysis, payload.legalBasis?.authorityAnalysis]], payload, options, references);
    if (key === "limitation") return inspectRows("limitation.offenceRows", payload.limitation?.offenceRows, Object.keys(ROW_DEFAULTS["limitation.offenceRows"]), payload, options, references) + inspectDl([[LABELS.overallStatus, payload.limitation?.overallStatus], [LABELS.analysis, payload.limitation?.analysis]], payload, options, references);
    if (key === "witnessProtection") return inspectDl([[LABELS.requested, payload.witnessProtection?.requested, "requested"], ["สรุปการพิจารณาคุ้มครองพยาน", payload.witnessProtection?.summary]], payload, options, references) + inspectRows("witnessProtection.persons", payload.witnessProtection?.persons, Object.keys(ROW_DEFAULTS["witnessProtection.persons"]), payload, options, references);
    if (key === "analysis") return inspectRows("analysis.allegationAnalyses", payload.analysis?.allegationAnalyses, Object.keys(ROW_DEFAULTS["analysis.allegationAnalyses"]), payload, options, references) + inspectDl([[LABELS.overallAnalysis, payload.analysis?.overallAnalysis]], payload, options, references);
    if (key === "opinion") return inspectDl(["summaryNote", "finding", "rationale"].map(field => [LABELS[field], payload.opinion?.[field], field]), payload, options, references);
    if (key === "proposal") return inspectDl([
      [LABELS.branchKey, payload.proposal?.branchKey, "branchKey"], [LABELS.reason, payload.proposal?.reason], [LABELS.legalBasisRowIds, payload.proposal?.legalBasisRowIds, "legalBasisRowIds"],
      ...Object.entries(object(payload.proposal?.branchDetails)).map(([field, value]) => [field, value, field])
    ], payload, options, references);
    if (key === "reviewOpinions") return inspectRows("reviewOpinions", payload.reviewOpinions, ["reviewerRole", "opinionText", "decision", "reviewedAt"], payload, options, references);
    if (key === "boardCover") return payload.boardCover ? inspectDl([[INSPECT_LABELS.displayReference, payload.boardCover.displayReference], [INSPECT_LABELS.statusLabel, payload.boardCover.statusLabel]], payload, options, references) : `<p class="a5r-inspect-empty">${OFFICIAL_EMPTY}</p>`;
    if (key === "investigatorSignatures") return inspectRows("investigatorSignatures", payload.investigatorSignatures, ["officerName", "positionName", "roleLabel", "signatureStatusLabel", "signedAt"], payload, options, references);
    return `<p class="a5r-inspect-empty">${OFFICIAL_EMPTY}</p>`;
  }

  function renderReport213InspectorA5(payload, options, validation) {
    const completionOf = key => validation.completion[key] || "EMPTY";
    const groupStateOf = group => {
      const states = group.keys.map(completionOf);
      if (states.every(state => state === "COMPLETE")) return { label: "ครบ", cls: "complete" };
      if (states.some(state => state === "COMPLETE" || state === "PARTIAL")) return { label: "กรอกบางส่วน", cls: "partial" };
      return { label: "ยังไม่ครบ", cls: "empty" };
    };
    const doneCount = SECTION_KEYS.filter(key => completionOf(key) === "COMPLETE").length;
    const partialCount = SECTION_KEYS.filter(key => completionOf(key) === "PARTIAL").length;
    const pct = Math.round((doneCount + partialCount * .5) / SECTION_KEYS.length * 100);
    const references = inspectReferences(payload, options);
    const index = `<nav class="a5r-inspect-index" aria-label="สารบัญรายงาน 213"><ol>${REPORT_213_GROUPS.map((group, number) => {
      const state = groupStateOf(group);
      return `<li data-a5-report-index-item="${group.id}" data-a5-report-group-state="${state.cls}"><span>${number + 1}</span><strong>${escapeHtml(group.label)}</strong><small>${group.keys.length} ส่วน · ${state.label}</small></li>`;
    }).join("")}</ol></nav>`;
    const groups = REPORT_213_GROUPS.map((group, groupIndex) => `<section class="a5r-group a5r-inspect-group" data-a5-report-group-body="${group.id}"><header><span>ส่วนที่ ${groupIndex + 1}</span><h2>${escapeHtml(group.label)}</h2><small>แบบพิมพ์หน้า ${group.formPage}</small></header>${group.keys.map(key => {
      const sectionIndex = SECTION_KEYS.indexOf(key);
      return `<section class="a5r-inspect-section" data-a5-report-section-body="${key}"><h3>${sectionIndex + 1}. ${escapeHtml(SECTION_TITLES[sectionIndex])}</h3><div data-a5-report-control-root="${key}" aria-readonly="true">${inspectSectionContent(key, payload, options, references)}</div></section>`;
    }).join("")}</section>`).join("");
    return `<section class="a5-report-editor a5r-editor a5r-inspector${options.layout === "full" ? " a5r-editor-full" : ""}" data-a5-report-editable="false" data-a5-report-mode="inspect">
      <header class="a5r-inspect-head"><div><small>รายงาน 213 · แบบ ปปท. 4</small><h2>รายงานผลการไต่สวนเบื้องต้น</h2></div><p>สำหรับตรวจสอบข้อมูล · อ่านอย่างเดียว</p></header>
      <div class="a5r-progress a5r-inspect-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="ความครบถ้วนของรายงาน"><span>ความครบถ้วน ${pct}%</span><strong>${doneCount}/${SECTION_KEYS.length} ส่วนครบ${partialCount ? ` · ${partialCount} ส่วนกรอกบางส่วน` : ""}</strong></div>
      <div class="a5r-inspect-layout">${index}<div class="a5r-form-groups">${groups}</div></div>
    </section>`;
  }

  function renderReport213EditorA5(payload, options = {}) {
    const normalizedOptions = { ...options, evidenceVersions: Array.isArray(options.evidenceVersions) ? options.evidenceVersions : [] };
    const editable = options.editable !== false;
    const validation = validateReport213A5(payload);
    if (!editable) return renderReport213InspectorA5(payload, normalizedOptions, validation);
    const completionOf = key => validation.completion[key] || "EMPTY";
    const sectionsByKey = {};
    const sections = SECTION_KEYS.map((key, index) => {
      const errors = validation.errors.filter(error => error.field === key || error.field.startsWith(`${key}.`));
      const sectionEditable = editable && !READ_ONLY_SECTIONS.has(key);
      let content = sectionControls(key, payload, normalizedOptions);
      if (!sectionEditable) content = content.replace(/<button\b[^>]*data-a5-report-row-action[^>]*>[\s\S]*?<\/button>/g, "").replace(/<(input|select|textarea)\b(?![^>]*\bdisabled\b)/g, '<$1 disabled');
      const html = `<section data-a5-report-section-body="${key}"><h3 tabindex="-1"><span>${index + 1}.</span> ${escapeHtml(SECTION_TITLES[index])}</h3><div data-a5-report-control-root="${key}"${sectionEditable ? "" : ' aria-readonly="true"'}>${content}</div><div id="a5-report-error-${key}" class="a5-report-errors" role="alert">${errors.map(error => `<p>${escapeHtml(error.message)}</p>`).join("")}</div></section>`;
      sectionsByKey[key] = html;
      return html;
    }).join("");
    const groupStateOf = group => {
      const states = group.keys.map(completionOf);
      if (states.every(state => state === "COMPLETE")) return { icon: "✓", label: "ครบ", cls: "complete" };
      if (states.some(state => state === "COMPLETE" || state === "PARTIAL")) return { icon: "◐", label: "กรอกบางส่วน", cls: "partial" };
      return { icon: "○", label: "ยังไม่ครบ", cls: "empty" };
    };
    const doneCount = SECTION_KEYS.filter(key => completionOf(key) === "COMPLETE").length;
    const partialCount = SECTION_KEYS.filter(key => completionOf(key) === "PARTIAL").length;
    const pct = Math.round((doneCount + partialCount * 0.5) / SECTION_KEYS.length * 100);
    const tabs = REPORT_213_GROUPS.map((group, index) => {
      const state = groupStateOf(group);
      return `<button type="button" class="a5r-tab${index ? "" : " is-active"}" data-a5-report-group="${group.id}" data-a5-report-group-state="${state.cls}"${index ? "" : ' aria-current="step"'}><span class="a5r-tab-number" aria-hidden="true">${index + 1}</span><span class="a5r-tab-copy"><span class="a5r-tab-label">${escapeHtml(group.label)}</span><span class="a5r-tab-status"><span class="a5r-tab-dot" aria-hidden="true"></span><small>${group.keys.length} ส่วน · ${state.label}</small></span></span></button>`;
    }).join("");
    const groups = REPORT_213_GROUPS.map((group, index) => `<div class="a5r-group${index ? "" : " is-active"}" data-a5-report-group-body="${group.id}"${index ? " hidden" : ""}>${group.keys.map(key => sectionsByKey[key] || "").join("")}</div>`).join("");
    const paperHtml = renderReport213PaperA5(payload, 1);
    const firstState = groupStateOf(REPORT_213_GROUPS[0]);
    const actionsHtml = '<button type="button" class="ws-button secondary" data-a5-report-action="validate">ตรวจสอบความครบ</button><button type="button" class="ws-button primary" data-a5-report-action="save">บันทึกร่าง</button>';
    const commandHtml = `<header class="a5r-command-bar"><div class="a5r-command-summary"><div class="a5r-command-title"><small>รายงาน 213</small><h2>รายงานผลการไต่สวนเบื้องต้น (แบบ ปปท. 4)</h2></div><div class="a5r-command-progress"><progress class="a5r-command-meter" max="100" value="${pct}" role="progressbar" aria-label="ความครบถ้วนของรายงาน">${pct}%</progress><strong>${pct}%</strong><span>${doneCount}/${SECTION_KEYS.length} ส่วนครบ${partialCount ? ` · ${partialCount} ส่วนกรอกบางส่วน` : ""}</span></div></div><div class="a5r-command-actions">${actionsHtml}</div></header>`;
    const tabsHtml = `<nav class="a5r-tabs a5r-rail" aria-label="ส่วนรายงาน 213">${tabs}</nav>`;
    const formHead = `<header class="a5r-form-head"><div class="a5r-form-head-title"><small data-a5-report-group-page>รายงาน 213 · แบบ ปปท. 4 · ตรงแบบพิมพ์หน้า ${REPORT_213_GROUPS[0].formPage}</small><strong data-a5-report-group-title>ส่วนที่ 1/${REPORT_213_GROUPS.length} · ${escapeHtml(REPORT_213_GROUPS[0].label)}</strong></div><span class="a5r-form-head-badge ${firstState.cls}" data-a5-report-group-badge>${firstState.icon} ${firstState.label}</span><div class="a5r-form-nav"><button type="button" class="ws-button ghost" data-a5-report-group-nav="prev" aria-label="กลุ่มก่อนหน้า">ก่อนหน้า</button><button type="button" class="ws-button ghost" data-a5-report-group-nav="next" aria-label="กลุ่มถัดไป">ถัดไป</button></div></header>`;
    const formGroups = `<div class="a5r-form-groups">${groups}</div>`;
    if (options.layout === 'full') {
      // โหมดเอกสารเต็มความกว้างใน doc pane — ไม่มี split preview (owner อนุมัติรอบ 3, 15 ส.ค. 69)
      return `<section class="a5-report-editor a5r-editor a5r-editor-full" data-a5-report-editable="${editable}" data-a5-report-mode="edit">
      ${commandHtml}
      <div class="a5r-edit-layout">${tabsHtml}<div class="a5r-form">${formHead}${formGroups}</div></div>
    </section>`;
    }
    return `<section class="a5-report-editor a5r-editor" data-a5-report-editable="${editable}" data-a5-report-mode="edit">
      ${commandHtml}
      <div class="a5r-edit-layout">${tabsHtml}<div class="a5r-body">
        <div class="a5r-form">${formHead}${formGroups}</div>
        <aside class="a5r-preview" aria-label="ตัวอย่างเอกสารแบบ ปปท. 4">
          <div class="a5r-preview-head"><span>ตัวอย่างเอกสาร (แบบ ปปท. 4)</span><span class="a5r-preview-pagenav" role="group" aria-label="นำทางหน้าตัวอย่าง"><button type="button" data-a5-report-preview-nav="prev" aria-label="หน้าก่อนหน้า">◀</button><strong data-a5-report-preview-label>1/6</strong><button type="button" data-a5-report-preview-nav="next" aria-label="หน้าถัดไป">▶</button><button type="button" data-a5-report-preview-zoom="out" aria-label="ย่อเอกสาร">−</button><output data-a5-report-preview-zoom-label>100%</output><button type="button" data-a5-report-preview-zoom="in" aria-label="ขยายเอกสาร">+</button></span></div>
          <div class="a5r-preview-canvas" data-a5-report-preview-canvas>${paperHtml}</div>
        </aside>
      </div></div>
    </section>`;
  }

  function captureReport213EditorA5(container, basePayload) {
    const payload = copy(basePayload);
    container.querySelectorAll("[data-a5-report-bind]").forEach(control => {
      const value = control.multiple ? [...control.selectedOptions].map(option => option.value) : control.dataset.a5ReportBind === "witnessProtection.requested" ? control.value === "true" : control.value;
      setPath(payload, control.dataset.a5ReportBind, value);
    });
    Object.keys(ROW_DEFAULTS).forEach(path => {
      const rows = [...container.querySelectorAll(`[data-a5-report-row="${path}"]`)].map((fieldset, index) => {
        const prior = (getPath(basePayload, path) || []).find(row => row.rowId === fieldset.dataset.rowKey);
        const row = { rowId: fieldset.dataset.rowKey, order: index + 1, ...copy(ROW_DEFAULTS[path]), ...copy(prior || {}) };
        fieldset.querySelectorAll("[data-a5-report-row-field]").forEach(control => { row[control.dataset.a5ReportRowField] = control.multiple ? [...control.selectedOptions].map(option => option.value) : control.value; });
        row.order = index + 1;
        return row;
      });
      setPath(payload, path, rows);
    });
    return payload;
  }

  const show = value => placeholder(value) ? "—" : text(value);
  const line = (label, value) => `<p><strong>${escapeHtml(label)}:</strong> <span class="a5-report-blank">${escapeHtml(show(value))}</span></p>`;
  const list = (rows, renderer) => rows?.length ? `<ol>${ordered(rows).map(row => `<li>${renderer(row)}</li>`).join("")}</ol>` : `<p class="a5-report-blank">—</p>`;
  const namesBy = (rows, key) => new Map((rows || []).map(row => [row.rowId, show(row[key])]));
  const resolved = (ids, index) => (ids || []).map(id => index.get(id) || "ไม่พบข้อมูลอ้างอิง").join(", ") || "เอกสารไม่ระบุ";
  function renderReport213PaperA5Legacy(payload, pageOnly) {
    const accused = namesBy(payload.accusedPersons, "name");
    const allegations = namesBy(payload.allegations, "summary");
    const evidence = namesBy(payload.evidence, "title");
    const laws = namesBy(payload.legalBasis?.lawRows, "lawName");
    const branch = BRANCHES.find(item => item.branchKey === payload.proposal?.branchKey);
    const pages = [
      ["ข้อมูลเรื่องและการรับเรื่อง", `${line("เลขสำนวน", payload.documentMeta?.caseNumber)}${line("เรื่อง", payload.documentMeta?.subject)}${line("หน่วยงาน", payload.documentMeta?.unitName)}${line("วันที่จัดทำ", payload.documentMeta?.preparedAt)}${line("ผู้รับผิดชอบ", payload.documentMeta?.responsibleOfficer?.displayName)}${line("ตำแหน่ง", payload.documentMeta?.responsibleOfficer?.positionName)}${line("แผนงานคดีฉบับ", payload.documentMeta?.sourceLinks?.plan?.revisionNo ? String(payload.documentMeta.sourceLinks.plan.revisionNo) : "")}${line("บันทึกการปฏิบัติงานฉบับ", payload.documentMeta?.sourceLinks?.worklog?.revisionNo ? String(payload.documentMeta.sourceLinks.worklog.revisionNo) : "")}${line("ประเภทเรื่อง", CASE_TYPE_LABELS[payload.receipt?.caseType])}${line("วันที่รับจากต้นทาง", payload.receipt?.sourceReceivedAt)}${line("เลขอ้างอิงต้นทาง", payload.receipt?.sourceReference)}${line("ช่องทางต้นทาง", payload.receipt?.sourceChannel)}${line("จังหวัดต้นทาง", payload.receipt?.sourceProvince)}${line("เลขมติ/หนังสือต้นทาง", payload.receipt?.sourceResolutionNo)}${line("วันที่มติ/หนังสือต้นทาง", payload.receipt?.sourceResolutionAt)}${line("วันที่สำนักงานรับเรื่อง", payload.receipt?.paccReceivedAt)}${line("วันที่หน่วยงานรับเรื่อง", payload.receipt?.divisionReceivedAt)}${line("วันครบกำหนดไต่สวนเบื้องต้น", payload.receipt?.preliminaryDueAt)}${line("วันที่มอบหมาย", payload.receipt?.assignedAt)}${list(payload.receipt?.reassignmentRows, row => `${escapeHtml(show(row.assignedAt))} ${escapeHtml(show(row.fromOfficerName))} ถึง ${escapeHtml(show(row.toOfficerName))} ${escapeHtml(show(row.unitName))}`)}`],
      ["คู่กรณีและข้อกล่าวหา", `<h3>ผู้กล่าวหา</h3>${list(payload.complainants, row => `${escapeHtml(PERSON_TYPE_LABELS[row.personType] || "เอกสารไม่ระบุ")} ${escapeHtml(show(row.name))}; ที่อยู่ ${escapeHtml(show(row.address))}; ติดต่อ ${escapeHtml(show(row.contact))}; ฐานะ ${escapeHtml(show(row.capacity))}`)}<h3>ผู้ถูกกล่าวหา</h3>${list(payload.accusedPersons, row => `${escapeHtml(show(row.name))}; ตำแหน่ง ${escapeHtml(show(row.position))}; หน่วยงาน ${escapeHtml(show(row.agency))}; สถานะขณะเกิดเหตุ ${escapeHtml(show(row.statusAtEvent))}; ข้อกล่าวหา ${escapeHtml(resolved(row.relatedAllegationRowIds, allegations))}`)}<h3>ข้อกล่าวหา</h3>${list(payload.allegations, row => `${escapeHtml(show(row.summary))}; ช่วงเกิดเหตุ ${escapeHtml(show(row.eventDateFrom))} ถึง ${escapeHtml(show(row.eventDateTo))}; สถานที่ ${escapeHtml(show(row.place))}; ผู้ถูกกล่าวหา ${escapeHtml(resolved(row.accusedRowIds, accused))}`)}`],
      ["ข้อเท็จจริง พฤติการณ์ และความเสียหาย", `${line("สรุปข้อเท็จจริง", payload.factFindings?.summary)}${list(payload.factFindings?.chronologyRows, row => `${escapeHtml(show(row.occurredAt))}: ${escapeHtml(show(row.fact))}; พยานหลักฐาน ${escapeHtml(resolved(row.sourceEvidenceRowIds, evidence))}`)}${line("จำนวนบันทึกการปฏิบัติงานที่อ้างอิง", String(payload.factFindings?.worklogEntryIds?.length || 0))}${line("ความเป็นมา", payload.eventContext?.background)}${line("วิธีการ", payload.eventContext?.method)}${line("ผู้เกี่ยวข้อง", payload.eventContext?.participants)}${line("สถานที่", payload.eventContext?.location)}${line("ช่วงเวลา", payload.eventContext?.period)}${line("รายละเอียดความเสียหาย", payload.damage?.description)}${line("จำนวนความเสียหาย", payload.damage?.amount)}${line("สกุลเงิน", payload.damage?.currency)}${line("ผู้เสียหาย", payload.damage?.injuredParties)}${line("หลักการคำนวณ", payload.damage?.calculationNote)}`],
      ["พยานหลักฐานและข้อกฎหมาย", `<h3>พยานหลักฐาน</h3>${list(payload.evidence, row => `${escapeHtml(show(row.category))}: ${escapeHtml(show(row.title))}; สนับสนุน ${escapeHtml(show(row.factSupported))}; การเก็บรักษา ${escapeHtml(show(row.custodyNote))}; ${escapeHtml(AVAILABILITY_LABELS[row.availability] || AVAILABILITY_LABELS.MISSING)}`)}<h3>ข้อกฎหมาย</h3>${list(payload.legalBasis?.lawRows, row => `${escapeHtml(show(row.lawName))} มาตรา ${escapeHtml(show(row.section))}; ${escapeHtml(show(row.applicationReason))}`)}${line("วิเคราะห์อำนาจหน้าที่", payload.legalBasis?.authorityAnalysis)}`],
      ["อายุความ การคุ้มครอง และการวิเคราะห์", `<h3>อายุความ</h3>${list(payload.limitation?.offenceRows, row => `${escapeHtml(accused.get(row.accusedRowId) || "ไม่พบข้อมูลอ้างอิง")}; ${escapeHtml(laws.get(row.legalBasisRowId) || "ไม่พบข้อมูลอ้างอิง")}; เริ่ม ${escapeHtml(show(row.startAt))}; ครบ ${escapeHtml(show(row.expiresAt))}; ที่มา ${escapeHtml(show(row.source))}; หมายเหตุ ${escapeHtml(show(row.note))}`)}${line("สถานะอายุความรวม", payload.limitation?.overallStatus)}${line("บทวิเคราะห์อายุความ", payload.limitation?.analysis)}${line("การขอคุ้มครองพยาน", payload.witnessProtection?.requested === true ? "ขอคุ้มครอง" : "ไม่ขอคุ้มครอง")}${list(payload.witnessProtection?.persons, row => `${escapeHtml(show(row.nameOrCode))}; มาตรการ ${escapeHtml(show(row.measure))}; เหตุผล ${escapeHtml(show(row.reason))}`)}${line("สรุปการคุ้มครองพยาน", payload.witnessProtection?.summary)}<h3>การวิเคราะห์รายข้อกล่าวหา</h3>${list(payload.analysis?.allegationAnalyses, row => `${escapeHtml(allegations.get(row.allegationRowId) || "ไม่พบข้อมูลอ้างอิง")} / ${escapeHtml(accused.get(row.accusedRowId) || "ไม่พบข้อมูลอ้างอิง")}; ${escapeHtml(show(row.factAnalysis))}; พยานหลักฐาน ${escapeHtml(resolved(row.evidenceRowIds, evidence))}; ข้อกฎหมาย ${escapeHtml(resolved(row.legalBasisRowIds, laws))}; ข้อสรุป ${escapeHtml(show(row.conclusion))}`)}${line("บทวิเคราะห์รวม", payload.analysis?.overallAnalysis)}`],
      ["ความเห็นและข้อเสนอ", `${line("สรุปข้อมูลเดิม", payload.opinion?.summaryNote)}${line("ผลความเห็น", payload.opinion?.finding)}${line("เหตุผลความเห็น", payload.opinion?.rationale)}${line("ข้อเสนอ", branch?.thaiLabel)}${line("เหตุผลประกอบข้อเสนอ", payload.proposal?.reason)}${line("ข้อกฎหมายที่อ้างอิง", resolved(payload.proposal?.legalBasisRowIds, laws))}${Object.entries(object(payload.proposal?.branchDetails)).map(([label, value]) => line(label, value)).join("")}<h3>ความเห็นตามลำดับชั้น</h3>${list(payload.reviewOpinions, row => `${escapeHtml(show(row.reviewerName))} ${escapeHtml(show(row.reviewerRole))}: ${escapeHtml(show(row.opinionText))}; ${escapeHtml(show(row.recordedAt))}`)}${line("เอกสารเสนอคณะกรรมการ", payload.boardCover?.displayReference)}${line("สถานะเอกสารเสนอคณะกรรมการ", payload.boardCover?.statusLabel)}<h3>ผู้จัดทำรายงาน</h3>${list(payload.investigatorSignatures, row => `${escapeHtml(show(row.officerName))}; ${escapeHtml(show(row.positionName))}; ${escapeHtml(show(row.roleLabel))}; ${escapeHtml(show(row.signatureStatusLabel))}`)}`]
    ];
    return `<article class="a5-report-paper">${pages.map(([title, content], index) => (pageOnly && index + 1 !== pageOnly) ? "" : `<section class="a5-paper-page" data-page="${index + 1}"><header><strong>แบบ ปปท. 4 — รายงานผลการไต่สวนเบื้องต้น</strong><span>${index + 1}/6</span></header><h2>${escapeHtml(title)}</h2>${content}</section>`).join("")}</article>`;
  }

  /* ---------- Phase 4: renderer ตรงแบบพิมพ์จริง 6 หน้า (source: form-4-source-map.md, VISUALLY_VERIFIED) ---------- */
  const A5_THAI_NUM = Object.freeze({ 1: '๑', 2: '๒', 3: '๓', 4: '๔', 5: '๕', 6: '๖', 7: '๗', 8: '๘', 9: '๙', 10: '๑๐', 11: '๑๑', 12: '๑๒', 13: '๑๓', 14: '๑๔', 15: '๑๕', 16: '๑๖', 17: '๑๗', 18: '๑๘' });
  const a5Num = value => A5_THAI_NUM[Number(value)] || String(Number(value) || '');
  const A5_THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  const thNum = value => String(value ?? '').split('').map(ch => A5_THAI_DIGITS[ch] ?? ch).join('');
  const A5_THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const thDate = value => {
    const text = String(value || '').trim();
    if (!text) return '';
    const m = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return text;
    const year = Number(m[1]) + 543;
    return `${thNum(Number(m[3]))} ${A5_THAI_MONTHS[Number(m[2]) - 1]} ${thNum(year)}`;
  };
  const A5_GARUDA_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADKBAMAAAAFnIJvAAAABGdBTUEAALGIlZj0pgAAADBQTFRFAAAAgAAAAIAAgIAAAACAgACAAICAgICAwMDA/wAAAP8A//8AAAD//wD/AP//////ex+xxAAAAAlwSFlzAAAOQAAADkUBMpLx3wAADBBJREFUeJzVnAuC5LYKRdkB+98lO+CVBZePLNmuT78klWSmuyzrCIEQYDmkf/2h/yZBiFcE+h1Mal/xI/2Q0IaLn15YXjf+6FPm6f9H+O0kVU1QfPNjAkOIJPxyklQ4Rux/068JJJ1QvvjRh0S4EfjnBKa/JsSiG38J/dJnoN8/J2Ca/ozAWgnHrw8JT42aWFy1RpCnBHljJH9NIMhL47a/kEGkEPggPJrgp4TXDIl2gnxFOI1Phh4mAk1Nln29hnYeydF2vp2PPoPwmjOeCHbTmbEieFu2nkMoKrN0ELT7c6I1YkUYzXyE4e4omjrhtcgFNzA2pDNBNjKwqwLalCFBkYEOGVLAaH4S4SAs1BNCUBDYZiYJ1Ahityx0yusoUax97MWvKWmzNHY4yQ2VDbDq6RBt8b2hCcN+dfiiuWM6E9g0vLT7PcHmqRG0EPiQkEEYsi7MXq339RVTtuN9gU0Edb6a4a6dw54whGDv7lgMQy2dQK6nMf51N07YauK42ayKc1czwhCQQdCtFsj+2QlhNx/qsDUXhPELmyROWM/1bqWnEOjO1FAJY5rsXtb9XN8Sjgn2SVoQzJ2OSV7O9OEHxmfDh/CvBjZVE4EqYa1nwlh2l9VcY/aXBLfQw2AvCAyvsZ4mC4xsb5sI4oT0f7tpGIRh9YsWNr9Dzz7o4pegCDjsxf3kywamsiEoCJGSgGDThG9XhOOi7xpre4IMqYZcWkYYElwQ+ueSYJPUCKYb3LoyRynrYa8HcXOWmSDkg5QtgaoYw4GcCDaFYjMhneAG5mIsdjexFZSERQQ3tq7Xf9Y3UdM0ljQ+SwKNXWvrOsRW/EFwaZotFSNZE9gn8Ypgl4790xXSCB6Q7AmxSfr1k+vCzezGj0EEgaqtnFQ9NmgSiBohY1NDnYJOiF/30xR6jnjz3KTeLCtC18Tp9jbGMMUipbfg7KllivM0zffbsAnjWRAgHdbziuBWblY96+HYs2yVYRhTAw/JzCVZMF8IYAr+QGiVHdjWhXmIyGjWwrgbZqWdwNTnes44dMQYIfK0C9XlSl3KJMg1QbLTh4ReOUn14OqEYOXWSycIdQqXJC0CbrcFieHPhD6CvslBqclfERBsRJbR+3C/E1tVtQTJXjgAC4IbfKqodhJwiT9OIoRBbQmYaenX/GcKQZm0WTN+Dg3LmRDOpllBXxNS97gWlUVfYwBmdhsCuY/n6VbrXy0YEcsNkkApwrgCB3KapQxEqN6j9UdWSwFbkxTB8pDhW3MIFA0x/CqE1J6ijFBcawGYgpxOmcYEIbxvncOU4jUoQep3DDVXQIzVfhxuSUoak7M1+pZJiOhiBK0wlgMGCVpLsoXT1kvIOOJu8si83Wc++wgGop5irpWmCXW/T9MY8QNDFX2aSp/Fo6Xd1klCGOUamQm5VqqCI4iLMCRXVF87pdbSt5eqU3TukXiRIRDsmatJ1kXAypDueQsBu6fklmzbp93POWILHZEUxvgI+xPvCAIhi/gWI6Fm4P2M4o6t8UpQT0J7AlM0MuJBSA+EJ9niK9o+jFo/ZOh+TYXXhMNeJPaAWLWWJ1dvPUI+nxEvIfg6gaktZ8mWSrgs/M1OYM7GrCh1OmEYeYaS4M4E0cgibPVbDcIInn/CWrNrheakBNhaP4XgtfCUt+hyqKOmTnZVpOdGUBktCUiDYbjm3fyJkYXjGQ564UVIM1a25eAiLwm5NZXN7vByuJoWAGsck0VBgC9u8WAjsMVlUgyWQCBB6MypylGnLSucLE3lDcEliMWJ5M0usuS1cAtSAhfQ5+RlJjSVkRnJuD8yLNvtO8H9gRB8yYYQ/rF/cE3TvVrLogJJdzxX6SZCrLbIlDAgWwU+YFNmy0TSjes1Ab4ChLJViIdMKFaO5cEhIzqcH0/OIXT41JQCvljMdXESfFfX9Ftedt0S0qLDm5dAVsh9h2QYN6IcLERzXnPpqf+KsjULKiCNoF4dKwSq1tEUsibgXp5MNm6qQXdJSWERfBZhSWCEwcgvGyHbcvGSsYmcU/HpV/fcfHg8igjjHAZDBnO35DqaE4sFAUsiqoLScrK5KWeE0W6/ILTsBZHwnmB/l5tXj7pO9xXjKZHXmUCRmo/tUWllqguCCsGUYIK5cCcRQhCJWOqkhQWhVGvICy2qZ/1B0OoZT8v5HyPkdumbTcsT0m/5phffo/E9oberyo462SLlO914RdDuJY5Yq3DyxxYaLpfCloBJGYVTBNnnT3ru+OIpoW5dWkus5icaxtvwFNreEco8RYRh0Ax0ULymiKfWgA2hevzpB4w8484qzRuE8GuZHvYJr6rZWNE1QcVTGevymiAfEWBRpdPiFOewag+4IaRaI+c8pcHt8luEMkI+dyEUsYJcC7E3AUL4ZEvgTIgzHjuPdE1wRctwGfN5EbUIIbze3mXsCfBxYiWjUw82Sa3tThUbAgXBApQgYGKIOCNJOg/hjoBq4CudIU/Qsfo0CiyUjfnivN7yazu8Mh7SGsEzPN/W2EXohO10rEWwO8yQvD+sLEy7zaIRWXPSHsoQ7oa84j2nRpyrIN37Y0LdOb3c0J4oTv3h940iloSsGvrpjIigUhT7Psazn6a1DKYGIS8rZZnSFziJEcb+wHZ2aBmObQhWwrBnTjrqGpCBfRdF7G/llvH0/y0ZUNIzixyZp3km7KIczlBaFPqcEHOtFCd2zNWZeVWzkaqbx4R6W4kUzYDGejaopp5xZugpQSmUW+ogueWU7whl+shRnxLGFFF5WD894XAhxomeUS/YHUnaEaxeJGVc4gE2vKpYue/4HinjG7aEXNr9GWbdCOMkndqKCEsq9d4nBE/zwzkwzk1Z6ujpVJTvzSDeIdjjjoiHIZj1J173zIoWix/aeYMQmhOcr4H/lPEQOcjmLoygvbx3S/Bd5aiqeWCN+GkUsjzmZ/Gzh8Po3iCU2lorIpuO4zEB9Q8vJ2mfP1RlI1C1+loU2ymefoxDju/tcdhCzW1ADBslSQByF9H39ulRDBtLjiV6UZU8iRfDxylQ2R0N2xHYqrvFFR2lc4UMdZ+Fs13reRsvoVe4v+qOwkGx5CVaO9YtoUYXReHSCf2zAVzErapRIo4x60SwXXV1BOWWYAHqcQZkHADEUQ4jxLMDcgNeVMYeEFqO6+7Zs2cUuYvFbnu5ImhRqFaC+qxkLn+RY10TomjrNFh8nuy7np8nBOz+7iJQJJE4WXoPeELwNZy9SRTcf0TQXIG+sWaC8j1Bqgjtw/6M6wcEPe8ENmMU178h+NawyB58/X1kS12nVkVdCEGTEETrlXf+roY+VYQTJR7lALCuYp0IsYFxDBC73ayIKIsr8uwV4lSvwH4eKwDr+ixCebrR6ro3hFK79dGxZ6VnQl92kqQrQhmQOSI7jn98OdvT9HygRYjXMrTTR0J4EaBvzgTHlEPjVPsNQdXPUOBGjC9PbzYL0ibHLWFOZEolvZ+FwNTLqvW1DPFOTdSMQaBqPG04IfAjwly6q4R0Ut661BWr1d4RyngxzLmugVJ0HfIbhP5sgKynZqxsWYNGfhHt72dJM5NJUcSPPcVGJHYcNW2Ud739k4R0sObhuATEGudyCDkYFuIT3xqnZzL1MUz6b7bXNKrSJvO4kQG9DJwBSPM4nqc8EUbNvvjJLOV3yKQUbxr6G0dUJG11mqezVAAIIOONBp5EoPoS1TNCZkuCp1W+AHgcyKYQwdrcRlyX18TjU3+5xQmea/t6pN37QfeEEsOgwON1y3hZ2T3IxwR/jOKCeELrsV6+VETbLPQBoYQo5NUkZSovsHqd6fJzTSiPbk3vXhEoRirfyBC1QX9RmZwAV+7b3OeaRvVxJAviZSfliBUow6lPCXYziqz+mmyN/5Ru8tA7gh2QHv+KouzMEZ3Zq27f5nHWvQUZY8rtoYeks/g2fxD2U5SjcOuhsPqbk97gO4Kn/bYn4JVr9lNSi1d2PiB49OonAyNeUt6/tvouQW2DswDZt1V/LPFLgtlPvK3qvvt3BIsr4B4kCU8AzwjxOjI1wrPPo4bYqo2Aze8+WX9OiMcL42yls54K8bSd1eqD8EzJbxE8AmYk0Y8Bzwlo/sboPyK8NfoPCe+K8O8jPP5/tXxBeBfwwR3vfv4HpAT+CEwM+dUAAAAASUVORK5CYII=';
  const a5F = (v, w) => `<span class="a5-fill" style="${w ? `min-width:${w}px` : ''}">${escapeHtml(v ?? '')}</span>`;
  const FORM4_S14_1_ITEMS = Object.freeze([
    "เห็นควรรับไว้ไต่สวน ตามนัยมาตรา ๒๔ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากปรากฏพฤติการณ์และพยานหลักฐานเพียงพอที่จะดำเนินการไต่สวนข้อเท็จจริง โดยเห็นควรมอบหมาย คณะพนักงานไต่สวน หรือโดยเห็นควรตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องที่สำคัญหรือมีความซับซ้อน (ให้ระบุสำคัญหรือซับซ้อนอย่างไร โดยพิจารณาจากหลักเกณฑ์และเงื่อนไขตามมติคณะกรรมการ ป.ป.ท. ครั้งที่ ๑๖/๒๕๖๘ ลงวันที่ ๕ มีนาคม ๒๕๖๘ แจ้งเวียนตามหนังสือ กองกฎหมาย ด่วนที่สุด ที่ ปป ๐๐๐๒/ว ๕๕๙ ลงวันที่ ๖ มีนาคม ๒๕๖๘)",
    "เห็นควรไม่รับไว้ไต่สวนข้อเท็จจริง เนื่องจากไม่ปรากฏพฤติการณ์และพยานหลักฐานเพียงพอจะดำเนินการไต่สวนข้อเท็จจริง",
    "ไม่รับเรื่องไว้พิจารณา เนื่องจากผู้ถูกกล่าวหาไม่ใช่เจ้าหน้าที่รัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม",
    "ไม่รับเรื่องไว้พิจารณา เนื่องจากไม่ใช่การกล่าวหาว่ากระทำทุจริตในภาครัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม",
    "เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๑ (ข)(๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากขณะรับเรื่องจากคณะกรรมการ ป.ป.ช. ได้ล่วงพ้นเวลาที่จะดำเนินการทางวินัยและดำเนินคดีอาญาแก่ผู้ถูกร้องแล้ว",
    "เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๑ (ข)(๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากขณะรับเรื่องจากคณะกรรมการ ป.ป.ช. เหลือเวลาไม่ถึง ๖ เดือนและไม่อยู่ในวิสัยที่จะดำเนินการให้แล้วเสร็จก่อนล่วงพ้นเวลาดังกล่าวได้",
    "เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นกรณีร้องเรียนว่าร่ำรวยผิดปกติ / เป็นกรณีร้องเรียนความผิดตามพระราชบัญญัติว่าด้วยความผิดเกี่ยวกับการเสนอราคาต่อหน่วยงานของรัฐ พ.ศ.๒๕๔๒ / เป็นกรณีร้องเรียนผู้บริหารท้องถิ่นมีส่วนร่วมในการกระทำความผิด / จึงเป็นเรื่องที่ไม่อยู่ในหน้าที่และอำนาจของคณะกรรมการ ป.ป.ท. หรือเป็นเรื่องที่ไม่อยู่ในหน้าที่และอำนาจของคณะกรรมการ ป.ป.ช. รวมอยู่ด้วย",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๑) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ช. รับไว้พิจารณาหรือได้วินิจฉัยเสร็จเด็ดขาดแล้ว",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๒) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ท. ได้วินิจฉัยเสร็จเด็ดขาดแล้ว และไม่มีพยานหลักฐานใหม่ซึ่งเป็นสาระสำคัญแห่งคดี",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่เป็นคดีอาญาในประเด็นเดียวกันและศาลประทับฟ้องหรือมีคำสั่งเสร็จเด็ดขาดแล้วโดยไม่มีการถอนฟ้องหรือทิ้งฟ้อง หรือเป็นกรณีที่ศาลยังไม่วินิจฉัยในเนื้อหาแห่งคดี",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๔) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากผู้ถูกกล่าวหาตาย",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๕) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ผู้ถูกร้องพ้นจากการเป็นเจ้าหน้าที่ของรัฐก่อนถูกกล่าวหาเกินห้าปี",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๑) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ไม่ระบุพยานหลักฐานหรือระบุพฤติการณ์แห่งการกระทำที่ชัดเจนเพียงพอที่จะดำเนินการไต่สวนได้",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๒) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ล่วงเลยมาแล้วเกินห้าปีนับแต่วันเกิดเหตุถึงวันที่มีการกล่าวหาและเป็นเรื่องที่ไม่อาจหาพยานหลักฐานเพียงพอที่จะดำเนินการไต่สวนต่อไปได้",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ท. เห็นว่าไม่ใช่เป็นการกระทำผิดวินัยอย่างร้ายแรง",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๔) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องประพฤติมิชอบที่ไม่ใช่การกระทำความผิดวินัยและไม่ก่อให้เกิดความเสียหายแก่ราชการอย่างร้ายแรง",
    "ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๕) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปรามปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่องค์กรบริหารงานบุคคลหรือหน่วยงานของรัฐกำลังพิจารณาอยู่หรือได้พิจารณาเป็นที่ยุติแล้ว และไม่มีเหตุแสดงให้เห็นว่าการพิจารณานั้นไม่ชอบ",
    "อื่น ๆ..............."
  ]);
  const FORM4_S18_ITEMS = Object.freeze([
    "รับไว้ไต่สวน เนื่องจากปรากฏพฤติการณ์และพยานหลักฐานเพียงพอจะดำเนินการไต่สวน โดยมอบหมายคณะพนักงานไต่สวน",
    "รับไว้ไต่สวน เนื่องจากปรากฏพฤติการณ์และพยานหลักฐานเพียงพอจะดำเนินการไต่สวนข้อเท็จจริง โดยเสนอคณะกรรมการ ป.ป.ท. ตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องที่สำคัญหรือซับซ้อน",
    "ไม่รับไว้พิจารณา ตามนัยมาตรา",
    "ไม่รับเรื่องไว้พิจารณา เนื่องจากผู้ถูกกล่าวหาไม่ใช่เจ้าหน้าที่ของรัฐ",
    "ไม่รับเรื่องไว้พิจารณา เนื่องจากไม่ใช่การกล่าวหาว่าเจ้าหน้าที่ของรัฐกระทำทุจริตในภาครัฐ",
    "เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช.",
    "เห็นควรยุติการไต่สวนเนื่องจากผู้ถูกร้องตาย",
    "ไม่รับไว้ไต่สวนข้อเท็จจริง เนื่องจากไม่ปรากฏพฤติการณ์หรือพยานหลักฐานว่าผู้ถูกกล่าวหาได้กระทำการทุจริตในภาครัฐ",
    "อื่นๆ........................................................................................................"
  ]);
  const FORM4_SIG_TRIPLE = (name, role) =>
    `<div class="a5-f4-sig"><p class="a5-f4-sig-line"><span class="a5-f4-sig-label">(ลงชื่อ)</span><span class="a5-f4-sig-dots">${a5F(name || '', 260)}</span></p><p class="a5-f4-sig-line"><span class="a5-f4-sig-label">(</span><span class="a5-f4-sig-dots">${a5F('', 200)}</span><span class="a5-f4-sig-label">)</span></p><p class="a5-f4-sig-line"><span class="a5-f4-sig-label">(ตำแหน่ง)</span><span class="a5-f4-sig-dots">${a5F(role || '', 240)}</span></p></div>`;
  const form4Section = (no, heading, body) => {
    const paren = heading.indexOf(' (');
    let title = paren > 0 ? heading.slice(0, paren) : heading;
    let desc = paren > 0 ? heading.slice(paren + 2) : '';
    if (desc.endsWith(')')) desc = desc.slice(0, -1);
    const to = title.indexOf(' เพื่อ');
    if (to > 0) { desc = title.slice(to + 1) + (desc ? ' ' + desc : ''); title = title.slice(0, to); }
    return `<section class="a5-f4-section"><h3 class="a5-f4-section-title">${no}. <b>${title}</b>${desc ? ` <span class="a5-f4-sec-desc">(${desc})</span>` : ''}</h3>${body}</section>`;
  };
  const form4Item = (no, text, extra = '', sub = true) => `<p class="a5-f4-item${sub && no ? ' a5-f4-item-sub' : ''}">${no ? `<span class="a5-f4-sub-no">${no}</span> ` : ''}${text}${extra}</p>`;
  const form4Cb = (checked) => `<span class="a5-f4-cb">${checked ? '☑' : '☐'}</span>`;
  function renderReport213PaperA5(payload, pageOnly) {
    const p = object(payload);
    const meta = object(p.documentMeta), rcpt = object(p.receipt);
    const isNacc = rcpt.caseType === 'NACC_SECTION_62';
    const branch = BRANCHES.find(item => item.branchKey === p.proposal?.branchKey);
    const branchIndex = branch ? BRANCHES.indexOf(branch) : -1;
    const showVal = value => escapeHtml(show(value));
    const DOTS = '';
    const slot = value => { const v = text(value); return v ? `<span class="a5-f4-slot">${escapeHtml(v)}</span>` : `<span class="a5-f4-slot">&nbsp;</span>`; };
    const dot = (value) => { const v = text(value); return v ? `<span class="a5-f4-dots">${escapeHtml(v)}</span>` : `<span class="a5-f4-dots">&nbsp;</span>`; };
    const dateSlot = value => `<span class="a5-f4-slot a5-f4-date">${thDate(show(value))}</span>`;
    const complainantList = ordered(p.complainants).map((row, i) => form4Item(`(${a5Num(i + 1)})`, `${showVal(row.name)} ${row.address ? `ที่อยู่ ${showVal(row.address)}` : ''} ${row.contact ? `ติดต่อ ${showVal(row.contact)}` : ''} ${row.capacity ? `ฐานะ ${showVal(row.capacity)}` : ''}`, '', false)).join('');
    const accusedList = ordered(p.accusedPersons).map((row, i) => form4Item(`(${a5Num(i + 1)})`, `${showVal(row.name)} ${row.position ? `ตำแหน่ง ${showVal(row.position)}` : ''} ${row.agency ? `สังกัด ${showVal(row.agency)}` : ''} ${row.statusAtEvent ? `สถานะ ${showVal(row.statusAtEvent)}` : ''}`, '', false)).join('');
    const allegationList = ordered(p.allegations).map((row, i) => form4Item(`(${a5Num(i + 1)})`, showVal(row.summary))).join('');
    const chronologyList = ordered(p.factFindings?.chronologyRows).map((row, i) => form4Item(`(${a5Num(i + 1)})`, `${showVal(row.occurredAt)} ${showVal(row.fact)}`)).join('');
    const evidenceByCat = category => ordered(p.evidence).filter(row => row.category === category).map(row => showVal(row.title)).join('; ') || '';
    const lawsList = ordered(p.legalBasis?.lawRows).map((row, i) => form4Item(`(${a5Num(i + 1)})`, `${showVal(row.lawName)} ${row.section ? `มาตรา ${showVal(row.section)}` : ''}`)).join('');
    const analysisRows = (p.analysis?.allegationAnalyses || []).map((row, i) => form4Item(`(${a5Num(i + 1)})`, showVal(row.factAnalysis))).join('');
    const reviewByRole = roleLabel => (p.reviewOpinions || []).find(row => String(row.reviewerRole || '').includes(roleLabel));
    const signatureBlock = (officerName, roleLabel) => FORM4_SIG_TRIPLE(officerName || '', roleLabel || '');
    const opinionBlock = (no, heading, note, roleKey, slotText) => {
      const review = reviewByRole(roleKey);
      return `<section class="a5-f4-section"><h3 class="a5-f4-section-title">${no}. ${heading}</h3>${note ? `<p class="a5-f4-note">${note}</p>` : ''}<p class="a5-f4-item">${showVal(review?.opinionText || '')}${slotText ? ` ${slot(slotText)}` : ''}</p>${signatureBlock(review?.reviewerName, review?.reviewerRole)}</section>`;
    };
    /* หน้า 1 — บันทึกข้อความ + ๑ การรับเรื่อง + ๒ ผู้ร้องเรียน + ๓ ผู้ถูกร้องเรียน */
    const page1 = `<header class="a5-f4-memo-head">
      <div class="a5-f4-memo-top"><img class="a5-f4-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="46" height="50"><h2 class="a5-f4-memo-title">บันทึกข้อความ</h2></div>
      <div class="a5-f4-memo-agency"><p class="a5-f4-memo-row"><span class="a5-f4-memo-label">ส่วนราชการ</span> ${dot(meta.unitName)} <span class="a5-f4-memo-label">สำนัก/กอง</span> ${dot('')}</p><p class="a5-f4-memo-row a5-f4-memo-tel"><span class="a5-f4-memo-label">โทร.</span> ${dot('')}</p></div>
      <div class="a5-f4-memo-grid">
        <p class="a5-f4-memo-row"><span class="a5-f4-memo-label">ที่</span> ปป ${dot(thNum(meta.caseNumber))}</p>
        <p class="a5-f4-memo-row"><span class="a5-f4-memo-label">วันที่</span> ${dateSlot(meta.preparedAt)}</p>
      </div>
      <p class="a5-f4-memo-row"><b>เรื่อง</b> <span class="a5-f4-memo-subject">รายงานการไต่สวนเบื้องต้น เรื่องที่ ${slot(meta.subject)}</span> <span class="a5-f4-memo-tag">(${isNacc ? 'คดีรับจากสำนักงาน ป.ป.ช. มาตรา ๖๒' : 'คดีประพฤติมิชอบ'})</span></p>
      <p class="a5-f4-memo-row"><b>เรียน</b> เลขาธิการคณะกรรมการ ป.ป.ท.</p>
    </header>
    ${form4Section('๑', 'การรับเรื่อง (เลือกใส่เฉพาะกรณีตามข้อเท็จจริง)', isNacc ? `
      <p class="a5-f4-branch">(คดีรับจากสำนักงาน ป.ป.ช. มาตรา ๖๒)</p>
      ${form4Section('๑.๑', 'การรับเรื่องจากสำนักงาน ป.ป.ช.', `
        ${form4Item('(๑)', `เมื่อวันที่ ${dateSlot(rcpt.sourceReceivedAt)} สำนักงาน ป.ป.ช. รับเรื่องที่ ${slot(rcpt.sourceReference)} จาก ${slot(rcpt.sourceChannel)}`)}
        ${form4Item('(๒)', `สำนักงาน ป.ป.ช./สำนักงาน ป.ป.ช. จังหวัด ${slot(rcpt.sourceProvince)} ส่งเรื่องมายังสำนักงาน ป.ป.ท. ตามมติคณะกรรมการ ป.ป.ช. ครั้งที่ ${slot(rcpt.sourceResolutionNo)} เมื่อวันที่ ${dateSlot(rcpt.sourceResolutionAt)}`)}`)}
      ${form4Section('๑.๒', 'การรับเรื่องของสำนักงาน ป.ป.ท.', `
        ${form4Item('(๑)', `เมื่อวันที่ ${dateSlot(rcpt.paccReceivedAt)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${slot('')} รับเรื่องจากสำนักงาน ป.ป.ช. /สำนักงาน ป.ป.ช. จังหวัด ${slot('')} ครบกำหนด ๖๐ วัน วันที่ ${dateSlot(rcpt.preliminaryDueAt)}`)}
        ${form4Item('(๒)', `เมื่อวันที่ ${dateSlot(rcpt.divisionReceivedAt)} สำนัก/กอง รับสำนวนจากศูนย์รับเรื่องร้องเรียน กองบริหารคดี`)}
        ${form4Item('(๓)', `เมื่อวันที่ ${dateSlot(rcpt.assignedAt)} นาย/นาง/นางสาว ${slot(meta.responsibleOfficer?.displayName?.replace(/^พนักงาน ป\.ป\.ท\.\s*/, ''))} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวน โดยมี นาย/นาง/นางสาว ${slot('')} เจ้าหน้าที่ ป.ป.ท. เป็นผู้ช่วย`)}
        ${form4Item('(๔)', `เมื่อวันที่ ${dateSlot('')} นาย/นาง/นางสาว ${slot('')} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวนต่อจากนาย/นาง/นางสาว ${slot('')} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')}`)}`)}` : `
      <p class="a5-f4-branch">(คดีประพฤติมิชอบ)</p>
      ${form4Item('๑.๑', `เมื่อวันที่ ${dateSlot(rcpt.paccReceivedAt)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${slot('')} รับเรื่อง ${slot(rcpt.sourceChannel)} ครบกำหนด ๖๐ วัน วันที่ ${dateSlot(rcpt.preliminaryDueAt)}`)}
      ${form4Item('๑.๒', `เมื่อวันที่ ${dateSlot(rcpt.divisionReceivedAt)} สำนัก/กอง รับสำนวนจากศูนย์รับเรื่องร้องเรียน กองบริหารคดี`)}
      ${form4Item('๑.๓', `เมื่อวันที่ ${dateSlot(rcpt.assignedAt)} นาย/นาง/นางสาว ${slot(meta.responsibleOfficer?.displayName?.replace(/^พนักงาน ป\.ป\.ท\.\s*/, ''))} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวน โดยมี นาย/นาง/นางสาว ${slot('')} เจ้าหน้าที่ ป.ป.ท. เป็นผู้ช่วย`)}
      ${form4Item('๑.๔', `เมื่อวันที่ ${dateSlot('')} นาย/นาง/นางสาว ${slot('')} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวนต่อจากนาย/นาง/นางสาว ${slot('')} พนักงาน ป.ป.ท. สำนัก/กอง ${slot('')}`)}`)}
    ${form4Section('๒', 'ผู้ร้องเรียน (ระบุชื่อและที่อยู่ หรือขอปกปิดชื่อ โดยกำหนดเป็นลำดับ) เช่น ผู้ร้องเรียนปกปิดตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑', complainantList || form4Item('', slot('')) )}
    ${form4Section('๓', 'ผู้ถูกร้องเรียน (ให้ระบุชื่อ นามสกุล หมายเลขบัตรประจำตัวประชาชน ตำแหน่ง ยศและสังกัด สถานะปัจจุบัน เป็นรายบุคคล โดยกำหนดเป็นผู้ถูกร้องเรียนเป็นลำดับ หากผู้ถูกกล่าวหามีจำนวนมากอาจทำเป็นบัญชีแนบท้ายที่ได้จากการตรวจสอบ)', accusedList || form4Item('', slot('')) )}
    <p class="a5-f4-pptmark">ปปท. <span class="a5-f4-dots">${'..........'}</span></p>`;
    /* หน้า 2 — ๔–๑๓ */
    const page2 = `${form4Section('๔', 'ข้อกล่าวหา/ร้องเรียนและพฤติการณ์จากคำกล่าวหา/ร้องเรียน', `
      <p class="a5-f4-sub">๔.๑ ข้อกล่าวหา/ร้องเรียน (สรุปประเด็นข้อกล่าวหา/ร้องเรียน ตามคำกล่าวหา/ร้องเรียน)</p>${allegationList || form4Item('', slot(''))}
      <p class="a5-f4-sub">๔.๒ พฤติการณ์ (สรุปข้อเท็จจริงจากคำกล่าวหา/ร้องเรียน)</p>${form4Item('', showVal(p.factFindings?.summary))}`)}
    ${form4Section('๕', 'การตรวจสอบข้อเท็จจริง (สรุปข้อเจริงที่ได้รับให้ครบ)', `
      <p class="a5-f4-sub">๕.๑ คำให้การของผู้กล่าวหา/ร้องเรียน/พยาน</p>${form4Item('', showVal(''))}
      <p class="a5-f4-sub">๕.๒ ข้อเท็จจริงที่ได้จากการขอทราบข้อเท็จจริงจากหน่วยงาน</p>${form4Item('', showVal(''))}
      <p class="a5-f4-sub">๕.๓ ผลการดำเนินการสอบข้อเท็จจริง/วินัย/ละเมิดของหน่วยงานต้นสังกัด</p>${form4Item('', showVal(''))}
      <p class="a5-f4-sub">๕.๔ อื่น ๆ เช่น การตรวจสอบในท้องที่เกิดเหตุหรือดำเนินการอื่น (ถ้ามี)</p>${chronologyList || form4Item('', showVal(''))}`)}
    ${form4Section('๖', 'วัน เวลา และสถานที่เกิดเหตุ (หากยังไม่ชัดเจน ควรกำหนดโดยประมาณ)', form4Item('', `${showVal(p.eventContext?.location)} ${showVal(p.eventContext?.period)}`))}
    ${form4Section('๗', 'ความเสียหาย (หากยังไม่ชัดเจน ควรกำหนดโดยประมาณ)', form4Item('', `${showVal(p.damage?.description)} ${p.damage?.amount ? `จำนวน ${showVal(p.damage?.amount)} ${showVal(p.damage?.currency || 'บาท')}` : ''}`))}
    ${form4Section('๘', 'พยานหลักฐานประกอบ (พยานหลักฐานที่ผู้กล่าวหาอ้างประกอบคำกล่าวหา/ร้องเรียน) หรือที่ได้มาจากการตรวจสอบข้อเท็จจริง ให้ระบุแยกเป็นข้อ ๆ โดยไม่ต้องใส่รายละเอียด ให้ระบุจำนวน)', `
      <p class="a5-f4-sub">๘.๑ พยานบุคคล/พยานเชี่ยวชาญ</p>${form4Item('', showVal(evidenceByCat('บุคคล') || evidenceByCat('PERSON') || ''))}
      <p class="a5-f4-sub">๘.๒ พยานเอกสาร</p>${form4Item('', showVal(evidenceByCat('เอกสาร') || evidenceByCat('DOCUMENT') || ''))}
      <p class="a5-f4-sub">๘.๓ พยานวัตถุ</p>${form4Item('', showVal(evidenceByCat('วัตถุ') || evidenceByCat('OBJECT') || ''))}
      <p class="a5-f4-sub">๘.๔ พยานอื่น ๆ (ถ้ามี)</p>${form4Item('', showVal(evidenceByCat('อื่น ๆ') || evidenceByCat('OTHER') || ''))}`)}
    ${form4Section('๙', 'กฎหมายและระเบียบที่เกี่ยวข้องในช่วงระยะเวลากระทำความผิด (กฎหมายหรือระเบียบที่เกี่ยวกับอำนาจหน้าที่ของผู้ถูกร้องเรียน บทความผิดทางอาญาและวินัย ระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายที่เกี่ยวข้องกับการปฏิบัติงานที่ถูกร้องเรียน ให้ระบุชื่อกฎหมายพร้อมมาตรา หากเป็นระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายเฉพาะให้พิมพ์เนื้อหาด้วย)', lawsList || form4Item('', showVal('')))}
    ${form4Section('๑๐', 'อายุความ (หากกำหนดโดยชัดเจนไม่ได้ ให้กำหนดโดยประมาณ จากทุกฐานความผิดที่เกี่ยวข้อง โดยเฉพาะฐานความผิดที่มีอายุความน้อยที่สุด และกำหนดวันขาดอายุความ)', `${(p.limitation?.offenceRows || []).map((row, i) => form4Item(`(${a5Num(i + 1)})`, `${showVal(row.source)} ${row.expiresAt ? `ขาดอายุความวันที่ ${showVal(row.expiresAt)}` : ''}`)).join('')}${form4Item('', showVal(p.limitation?.analysis))}`)}
    ${form4Section('๑๑', 'มาตรการคุ้มครองเบื้องต้นตามมาตรา ๔๓ (ให้ระบุว่า มีหรือไม่มีการใช้มาตรการคุ้มครองพยานเบื้องต้น ตามมาตรา ๔๓ )', form4Item('', `${p.witnessProtection?.requested === true ? 'มีการใช้มาตรการคุ้มครองพยานเบื้องต้น' : 'ไม่มีการใช้มาตรการคุ้มครองพยานเบื้องต้น'} ${showVal(p.witnessProtection?.summary)}`))}
    ${form4Section('๑๒', 'ข้อพิจารณา (พิจารณาผลการตรวจสอบข้อเท็จจริง โดยต้องพิจารณาใน ๔ ประเด็น ดังนี้', `
      <p class="a5-f4-sub">๑๒.๑ ประเด็นเกี่ยวกับสถานะของผู้ถูกร้องเรียน เริ่มต้นด้วยการวิเคราะห์ความเป็นหน่วยงานของรัฐที่ผู้ถูกร้องเรียนสังกัดว่าเป็นหน่วยงานประเภทส่วนราชการ รัฐวิสาหกิจ หรือหน่วยงานอื่นของรัฐ จากนั้นวิเคราะห์ว่า (ขณะเกิดเหตุผู้ถูกร้องเรียนเป็นเจ้าหน้าที่ของรัฐประเภท ${slot('')} ตำแหน่ง ${slot('')} ระดับ ${slot('')} สังกัด ${slot('')})</p>${form4Item('', showVal(p.analysis?.allegationAnalyses?.[0]?.factAnalysis || ''))}
      <p class="a5-f4-sub">๑๒.๒ ประเด็นเกี่ยวกับขอบเขตอำนาจหน้าที่ของผู้ถูกร้องเรียน</p>${form4Item('', showVal(p.analysis?.allegationAnalyses?.[1]?.factAnalysis || ''))}
      <p class="a5-f4-sub">๑๒.๓ ประเด็นเกี่ยวกับการกระทำของผู้ถูกร้องเรียนว่าถูกต้องตามอำนาจหน้าที่ หรือไม่ อย่างไร</p>${form4Item('', showVal(p.analysis?.allegationAnalyses?.[2]?.factAnalysis || ''))}
      <p class="a5-f4-sub">๑๒.๔ ประเด็นเกี่ยวกับความเสียหาย</p>${form4Item('', showVal(p.analysis?.allegationAnalyses?.[3]?.factAnalysis || ''))}`)}
    ${form4Section('๑๓', 'ความเห็น (โดยนำข้อ ๕ และ ข้อ ๑๒ มาประกอบการพิจารณา) (ให้วินิจฉัยพฤติการณ์จากคำกล่าวหา/ร้องเรียนและข้อเท็จจริงจากการตรวจสอบปรับเข้ากับหลักกฎหมาย ระเบียบ คำสั่ง มติ ข้อบังคับต่าง ๆ ว่าเป็นคำกล่าวหา/ร้องเรียนที่ถูกต้องตามเงื่อนไขที่จะรับไว้', form4Item('', showVal(p.opinion?.finding)))}`;
    /* หน้า 3 — ๑๓ ต่อ + ๑๔ + ๑๔.๑ (๑)–(๖) */
    const s141arr = FORM4_S14_1_ITEMS.map((itemText, i) => {
      const no = `(${a5Num(i + 1)})`;
      const selected = branchIndex === i;
      let extra = '';
      if (i === 14 || i === 15) {
        extra = `<div class="a5-f4-nested"><p class="a5-f4-item">${form4Cb(false)} เห็นควรส่งให้ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอน หรือไม่ เนื่องจาก ${dot('')}</p><p class="a5-f4-item">${form4Cb(false)} ไม่ส่ง ${dot('')} เนื่องจาก ${dot('')}</p></div>`;
      }
      return `<p class="a5-f4-item a5-f4-s14-1${selected ? ' selected' : ''}">${form4Cb(selected)} ${no} ${itemText}${extra}</p>`;
    });
    const page3 = `
      <p class="a5-f4-item">...ดำเนินการไต่สวนต่อไปหรือไม่ โดยแต่งตั้งคณะพนักงานไต่สวน หรือแต่งตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องสำคัญหรือมีความซับซ้อนแล้วแต่กรณี เพื่อประกอบการพิจารณา)</p>
      <p class="a5-f4-label">เห็นควรรับพิจารณาดำเนินการไต่สวนโดยแต่งตั้งคณะพนักงานไต่สวน ประกอบด้วย</p>
      ${form4Item('(๑)', `นาย/นาง/นางสาว ${slot(p.investigatorSignatures?.[0]?.officerName || '')} พนักงาน ป.ป.ท. เจ้าของสำนวน`)}
      ${form4Item('(๒)', `นาย/นาง/นางสาว ${slot(p.investigatorSignatures?.[1]?.officerName || '')} เจ้าหน้าที่ ป.ป.ท.`)}
      ${form4Item('(๓)', `นาย/นาง/นางสาว ${slot('')} เจ้าหน้าที่ ป.ป.ท.`)}
      <p class="a5-f4-label">เห็นควรรับพิจารณาดำเนินการไต่สวนข้อเท็จจริงโดยแต่งตั้งคณะอนุกรรมการไต่สวน ประกอบด้วย</p>
      ${form4Item('(๑)', `นาย/นาง/นางสาว ${slot('')} ประธานอนุกรรมการ / ตำแหน่ง ${slot('')} สังกัด ${slot('')}`)}
      ${form4Item('(๒)', `นาย/นาง/นางสาว ${slot('')} อนุกรรมการ / ตำแหน่ง ${slot('')} สังกัด ${slot('')}`)}
      ${form4Item('(๓)', `นาย/นาง/นางสาว ${slot('')} อนุกรรมการและเลขานุการ / ตำแหน่ง ${slot('')} สังกัด ${slot('')}`)}
      ${form4Section('๑๔', 'ข้อเสนอ', '')}
      ${form4Section('๑๔.๑', 'พิจารณาดำเนินการ (เลือกกรณีใดกรณีหนึ่งตามข้อเท็จจริง)', s141arr.slice(0, 6).join(''))}`;
    /* หน้า 4 — ๑๔.๑ (๗)–(๑๗ เริ่ม) */
    const page4 = `${s141arr.slice(6, 17).join('')}<p class="a5-f4-item a5-f4-s14-1">${form4Cb(false)} (๑๗) ${FORM4_S14_1_ITEMS[16].split(' เนื่องจาก')[0]} เนื่องจากเป็นเรื่องที่</p>`;
    /* หน้า 5 — (๑๗ ต่อ) + (๑๘) + ๑๔.๒ + ลงชื่อ + ๑๕–๑๘ + §18 checkbox 1–3 + 25/26 grid */
    const s18First = FORM4_S18_ITEMS.slice(0, 3).map((itemText, i) => {
      if (i === 2) {
        return `<p class="a5-f4-item">${form4Cb(false)} ${itemText} <span class="a5-f4-s18-grid"><span class="a5-f4-s18-col">${['๒๕ (๑)', '๒๕ (๒)', '๒๕ (๓)', '๒๕ (๔)', '๒๕ (๕)'].map(x => `<span>${form4Cb(false)} ${x}</span>`).join('')}</span><span class="a5-f4-s18-col">${['๒๖ (๑)', '๒๖ (๒)', '๒๖ (๓)', '๒๖ (๔)', '๒๖ (๕)'].map(x => `<span>${form4Cb(false)} ${x}</span>`).join('')}</span></span> แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>`;
      }
      return `<p class="a5-f4-item">${form4Cb(false)} ${itemText}</p>`;
    }).join('');
    const page5 = `
      <p class="a5-f4-item">องค์กรบริหารงานบุคคลหรือหน่วยงานของรัฐกำลังพิจารณาอยู่หรือได้พิจารณาเป็นที่ยุติแล้ว และไม่มีเหตุแสดงให้เห็นว่าการพิจารณานั้นไม่ชอบ</p>
      ${form4Item('(๑๘)', `${FORM4_S14_1_ITEMS[17]} ${slot(p.proposal?.reason || '')}`)}
      ${form4Section('๑๔.๒', 'นำเสนอคณะกรรมการ ป.ป.ท. เพื่อพิจารณา', `<p class="a5-f4-item">จึงเรียนมาเพื่อโปรดพิจารณา</p>${signatureBlock(p.investigatorSignatures?.[0]?.officerName, p.investigatorSignatures?.[0]?.positionName)}`)}
      ${opinionBlock('๑๕', 'ความเห็นผู้บังคับบัญชาชั้นต้น. (หัวหน้าพนักงาน ป.ป.ท.) (เรื่องที่', '(ให้เสนอความเห็นพร้อมเหตุผล เช่น เห็นควรรับ / ไม่รับไว้พิจารณา เนื่องจาก........... )', 'ชั้นต้น', meta.subject)}
      ${opinionBlock('๑๖', 'ความเห็นผู้อำนวยการสำนัก (หัวหน้าพนักงาน ป.ป.ท.) (เรื่องที่', '(ให้เสนอความเห็นพร้อมเหตุผล เช่น เห็นควรรับ / ไม่รับไว้พิจารณา เนื่องจาก........... )', 'ผู้อำนวยการ', meta.subject)}
      ${opinionBlock('๑๗', 'ความเห็นรองเลขาธิการฯ (เรื่องที่', '', 'รองเลขาธิการ', meta.subject)}
      ${form4Section('๑๘', 'ความเห็นเลขาธิการฯ', s18First)}`;
    /* หน้า 6 — §18 checkbox 4–9 + ลงชื่อ + board cover */
    const s18Rest = FORM4_S18_ITEMS.slice(3).map((itemText, i) => {
      const no = i + 4;
      const isOther = no === 9;
      return `<p class="a5-f4-item">${form4Cb(false)} ${itemText}${isOther ? ` ${slot(p.proposal?.reason || '')}` : ''}</p>`;
    }).join('');
    const page6 = `${form4Section('๑๘', 'ความเห็นเลขาธิการฯ', `${s18Rest}${signatureBlock('', 'เลขาธิการฯ')}`)}
      <section class="a5-f4-section a5-f4-boardcover">
        <p class="a5-f4-item"><b>เรียน</b> ประธานกรรมการ ป.ป.ท. (เรื่องที่ ${slot(meta.subject)})</p>
        <p class="a5-f4-item">ด้วย เลขาธิการคณะกรรมการ ป.ป.ท. ได้มอบหมายให้พนักงาน ป.ป.ท. ดำเนินการไต่สวนเบื้องต้น ตามนัยมาตรา ๒๔ แห่ง พระราชบัญญัติ มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม พนักงาน ป.ป.ท. ได้ดำเนินการเสร็จเรียบร้อยแล้วตามรายงานการไต่สวนเบื้องต้นที่เสนอมาพร้อมนี้</p>
        <p class="a5-f4-item">เห็นควรบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท.</p>
        <p class="a5-f4-item">${form4Cb(false)} เพื่อพิจารณา</p>
        <p class="a5-f4-item">${form4Cb(false)} เพื่อทราบ</p>
        <p class="a5-f4-item">จึงเรียนมาเพื่อโปรดพิจารณา</p>
        ${signatureBlock('', '')}
      </section>`;
    const pages = [page1, page2, page3, page4, page5, page6];
    const pageNum = index => index === 0 ? '' : `<p class="a5-f4-pagenum">- ${thNum(index + 1)} -</p>`;
    return `<article class="a5-report-paper a5-f4-paper">${pages.map((content, index) => (pageOnly && index + 1 !== pageOnly) ? "" : `<section class="a5-paper-page" data-page="${index + 1}">${pageNum(index)}${content}</section>`).join("")}</article>`;
  }

  const REPORT_213_ACTIONS = Object.freeze([
    "report-213-submit", "report-213-review-record-opinion", "report-213-review-return", "report-213-sign",
    "report-213-create-board-cover", "report-213-dispatch-board-package", "report-213-record-receipt", "report-213-record-result"
  ]);

  function lifecycleFor213(state) {
    const current = object(state.a5Report213Lifecycle);
    return {
      status: text(current.status) || "REPORT_213_DRAFT",
      submissions: Array.isArray(current.submissions) ? copy(current.submissions) : [],
      reviewOpinions: Array.isArray(current.reviewOpinions) ? copy(current.reviewOpinions) : [],
      signatures: Array.isArray(current.signatures) ? copy(current.signatures) : [],
      boardCovers: Array.isArray(current.boardCovers) ? copy(current.boardCovers) : [],
      boardPackages: Array.isArray(current.boardPackages) ? copy(current.boardPackages) : [],
      dispatches: Array.isArray(current.dispatches) ? copy(current.dispatches) : [],
      receipts: Array.isArray(current.receipts) ? copy(current.receipts) : [],
      results: Array.isArray(current.results) ? copy(current.results) : [],
      commandReceipts: Array.isArray(current.commandReceipts) ? copy(current.commandReceipts) : []
    };
  }

  function lifecycleFailure(state, code, field, message) {
    return { ok: false, code, state: copy(state), errors: field ? [{ field, message }] : [], focusTarget: field || "" };
  }

  function confirmedAuthority(command, actor, state, field = "authorityRef") {
    const authority = object(command.authorityRef);
    if (authority.status !== "CONFIRMED" || (text(authority.roleCode) && text(authority.roleCode) !== text(actor.role))) {
      return lifecycleFailure(state, "PENDING_CONFIRMATION", field, "รอยืนยันผู้มีอำนาจดำเนินการตามเอกสารต้นทาง");
    }
    return null;
  }

  function exactRecord(state, documentId, revisionNo) {
    return (object(state.a5DocumentStore).records || []).find(record => record.documentId === documentId && record.revisionNo === revisionNo) || null;
  }

  function versionSnapshot(item) {
    return item ? copy(item.submittedSnapshot || { documentId: item.documentId, revisionNo: item.revisionNo, payload: item.payload, source: item.source }) : null;
  }

  function evidenceVersion(state, versionId) {
    return [state.a5EvidenceRepository, state.evidenceRepository, state.documentRepository]
      .flatMap(items => Array.isArray(items) ? items : [])
      .find(item => text(item.versionId || item.documentVersionId) === text(versionId)) || null;
  }

  function report213Package(state, candidate, command, actor) {
    const reportRecord = exactRecord(state, candidate.report.documentId, candidate.report.revisionNo);
    const planRecord = exactRecord(state, candidate.plan.documentId, candidate.plan.revisionNo);
    const worklogRecord = exactRecord(state, candidate.worklog.documentId, candidate.worklog.revisionNo);
    return {
      packageId: text(command.packageId),
      caseId: text(command.caseId),
      report: { ...copy(candidate.report), snapshot: versionSnapshot(reportRecord) },
      plan: { ...copy(candidate.plan), snapshot: versionSnapshot(planRecord) },
      worklog: { ...copy(candidate.worklog), snapshot: versionSnapshot(worklogRecord) },
      evidence: candidate.evidenceVersionIds.map(versionId => {
        const artifact = evidenceVersion(state, versionId);
        return { artifactId: text(artifact?.artifactId), versionId, snapshot: copy(artifact) };
      }),
      renderedPayload: renderReport213PaperA5(candidate.payload),
      submittedBy: text(actor.id),
      submittedAt: text(command.at),
      sourceLocators: [copy(SOURCE)]
    };
  }

  function validateLifecycleCommand(sourceState, actor, command, operation) {
    const state = copy(sourceState);
    const input = object(command);
    const person = object(actor);
    for (const field of ["caseId", "at", "idempotencyKey"]) {
      if (!text(input[field])) return { failure: lifecycleFailure(state, "MISSING_REQUIRED_FIELD", field, "ข้อมูลคำสั่งไม่ครบถ้วน") };
    }
    if (!text(person.id) || !text(person.name) || !text(person.role)) return { failure: lifecycleFailure(state, "FORBIDDEN_ACTOR", "actor", "ไม่พบผู้ดำเนินการและบทบาท") };
    if (text(input.caseId) !== text(state.caseData?.id)) return { failure: lifecycleFailure(state, "CASE_MISMATCH", "caseId", "สำนวนไม่ตรงกับเอกสาร") };
    const lifecycle = lifecycleFor213(state);
    const receipt = lifecycle.commandReceipts.find(item => item.idempotencyKey === text(input.idempotencyKey));
    const fingerprint = JSON.stringify({ operation, actor: person, command: input });
    if (receipt) {
      if (receipt.fingerprint !== fingerprint) return { failure: lifecycleFailure(state, "IDEMPOTENCY_KEY_REUSED", "idempotencyKey", "รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว") };
      return { replay: { ok: true, code: `${receipt.code}_REPLAYED`, state, errors: [], focusTarget: "" } };
    }
    const storeVersion = Number(state.a5DocumentStore?.version || 0);
    if (!Number.isInteger(input.expectedVersion) || input.expectedVersion !== storeVersion) return { failure: lifecycleFailure(state, "VERSION_CONFLICT", "expectedVersion", "ข้อมูลมีการเปลี่ยนแปลง") };
    return { state, input, person, lifecycle, fingerprint };
  }

  function finishLifecycle(context, state, code, additions = {}) {
    const lifecycle = context.lifecycle;
    lifecycle.commandReceipts.push({ idempotencyKey: text(context.input.idempotencyKey), fingerprint: context.fingerprint, code, at: text(context.input.at) });
    state.a5Report213Lifecycle = lifecycle;
    state.workflow = { ...object(state.workflow), downstreamStatus: lifecycle.status };
    return { ok: true, code, state, errors: [], focusTarget: "", ...additions };
  }

  function bumpStore(state) {
    state.a5DocumentStore = { ...object(state.a5DocumentStore), version: Number(state.a5DocumentStore?.version || 0) + 1 };
  }

  function executeReport213Action(sourceState, actor, action, command) {
    if (!REPORT_213_ACTIONS.includes(action)) return lifecycleFailure(sourceState, "INVALID_TRANSITION", "action", "ไม่รู้จักขั้นตอนรายงาน 213");
    const context = validateLifecycleCommand(sourceState, actor, command, action);
    if (context.failure || context.replay) return context.failure || context.replay;
    let { state, input, person, lifecycle } = context;
    const activeRecord = active(state);

    if (action === "report-213-submit") {
      if (person.role !== "investigator" || text(activeRecord?.payload?.documentMeta?.responsibleOfficer?.officerId) !== text(person.id)) return lifecycleFailure(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเท่านั้นที่เสนอรายงานได้");
      if (!text(input.packageId)) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", "packageId", "ไม่พบเลขอ้างอิงชุดเสนอรายงาน");
      if (lifecycle.submissions.some(item => item.packageId === text(input.packageId))) return lifecycleFailure(sourceState, "PACKAGE_INCOMPLETE", "packageId", "เลขอ้างอิงชุดเสนอรายงานซ้ำ");
      const candidate = buildReport213SubmissionA5(state, { caseId: input.caseId, revisionNo: input.revisionNo });
      if (!candidate.ok) return { ...candidate, state: copy(sourceState) };
      const packageRecord = report213Package(candidate.state, candidate.submissionCandidate, input, person);
      const submitted = domain().submitA5DocumentRevision(candidate.state, {
        caseId: input.caseId, documentId: FORM_ID, revisionNo: active(candidate.state).revisionNo,
        expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey,
        submissionContext: { packageId: packageRecord.packageId, plan: packageRecord.plan, worklog: packageRecord.worklog, evidence: packageRecord.evidence }
      });
      if (!submitted.ok) return { ...submitted, state: copy(sourceState) };
      state = submitted.state;
      lifecycle.status = "REPORT_213_REVIEW_PENDING";
      lifecycle.submissions.push(packageRecord);
      return finishLifecycle(context, state, "REPORT_213_SUBMITTED", { package: copy(packageRecord) });
    }

    const submission = lifecycle.submissions.at(-1);
    if (!submission) return lifecycleFailure(sourceState, "PACKAGE_INCOMPLETE", "submissionPackage", "ยังไม่มีชุดเสนอรายงาน 213");

    if (["report-213-review-record-opinion", "report-213-review-return", "report-213-sign", "report-213-create-board-cover", "report-213-dispatch-board-package", "report-213-record-result"].includes(action)) {
      const pending = confirmedAuthority(input, person, sourceState);
      if (pending) return pending;
    }

    if (action === "report-213-review-record-opinion") {
      if (lifecycle.status !== "REPORT_213_REVIEW_PENDING") return lifecycleFailure(sourceState, "INVALID_TRANSITION", "status", "รายงานไม่ได้อยู่ระหว่างตรวจ");
      if (!text(input.opinionText) || !text(input.opinionId)) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", "opinionText", "ต้องระบุความเห็นและเลขอ้างอิงความเห็น");
      const opinion = { opinionId: text(input.opinionId), reportDocumentId: FORM_ID, reportRevisionNo: submission.report.revisionNo, sequence: lifecycle.reviewOpinions.length + 1, reviewerId: person.id, reviewerName: person.name, reviewerRole: person.role, decision: "ENDORSE", opinionText: text(input.opinionText), affectedFields: [], affectedDocumentVersionIds: [], recordedAt: input.at, signature: input.signature ? { signedBy: person.id, signedAt: input.at, methodLabel: text(input.signature.methodLabel) } : null };
      lifecycle.reviewOpinions.push(opinion);
      if (input.finalLevel === true) lifecycle.status = "REPORT_213_BOARD_READY";
      bumpStore(state);
      return finishLifecycle(context, state, "REPORT_213_OPINION_RECORDED", { opinion: copy(opinion) });
    }

    if (action === "report-213-review-return") {
      if (lifecycle.status !== "REPORT_213_REVIEW_PENDING") return lifecycleFailure(sourceState, "INVALID_TRANSITION", "status", "รายงานไม่ได้อยู่ระหว่างตรวจ");
      const affectedFields = Array.isArray(input.affectedFields) ? input.affectedFields.map(text).filter(Boolean) : [];
      const affectedDocumentVersionIds = Array.isArray(input.affectedDocumentVersionIds) ? input.affectedDocumentVersionIds.map(text).filter(Boolean) : [];
      if (!text(input.reason) || (!affectedFields.length && !affectedDocumentVersionIds.length)) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", "reason", "ต้องระบุเหตุผลและส่วนหรือเอกสารที่ต้องแก้ไข");
      const returned = domain().returnA5DocumentRevision(state, { caseId: input.caseId, documentId: FORM_ID, revisionNo: submission.report.revisionNo, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, reason: input.reason, affectedFields, affectedDocumentVersionIds });
      if (!returned.ok) return { ...returned, state: copy(sourceState) };
      state = returned.state;
      lifecycle.reviewOpinions.push({ opinionId: text(input.opinionId) || `return-${input.idempotencyKey}`, reportDocumentId: FORM_ID, reportRevisionNo: submission.report.revisionNo, sequence: lifecycle.reviewOpinions.length + 1, reviewerId: person.id, reviewerName: person.name, reviewerRole: person.role, decision: "RETURN", opinionText: text(input.reason), affectedFields, affectedDocumentVersionIds, recordedAt: input.at, signature: null });
      lifecycle.status = "REPORT_213_RETURNED";
      return finishLifecycle(context, state, "REPORT_213_RETURNED", { revisionNo: submission.report.revisionNo + 1 });
    }

    if (action === "report-213-sign") {
      if (lifecycle.status !== "REPORT_213_BOARD_READY" || !text(input.methodLabel)) return lifecycleFailure(sourceState, "SIGNATURE_REQUIRED", "methodLabel", "รายงานยังไม่พร้อมลงนามหรือไม่ระบุวิธีลงนาม");
      const signature = { reportDocumentId: FORM_ID, reportRevisionNo: submission.report.revisionNo, submissionPackageId: submission.packageId, signedBy: person.id, signerName: person.name, signerRole: person.role, signedAt: input.at, methodLabel: text(input.methodLabel) };
      lifecycle.signatures.push(signature);
      bumpStore(state);
      return finishLifecycle(context, state, "REPORT_213_SIGNED", { signature: copy(signature) });
    }

    if (action === "report-213-create-board-cover") {
      const signature = lifecycle.signatures.find(item => item.submissionPackageId === submission.packageId);
      if (!signature) return lifecycleFailure(sourceState, "SIGNATURE_REQUIRED", "signature", "ต้องลงนามรายงานก่อนจัดทำหนังสือเสนอคณะกรรมการ");
      if (!text(input.coverDocumentId) || !text(input.coverReference)) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", "coverReference", "ข้อมูลหนังสือเสนอคณะกรรมการไม่ครบถ้วน");
      const created = domain().createA5DocumentDraft(state, { caseId: input.caseId, documentId: input.coverDocumentId, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, source: { fileName: "เอกสารไม่ระบุ", pages: [1, 1] }, payload: { coverReference: text(input.coverReference), submissionPackageId: submission.packageId } });
      if (!created.ok) return { ...created, state: copy(sourceState) };
      state = created.state;
      const cover = { documentId: text(input.coverDocumentId), revisionNo: 1, coverReference: text(input.coverReference), createdAt: input.at };
      const boardPackage = { packageId: text(input.boardPackageId) || `board-${submission.packageId}`, submissionPackageId: submission.packageId, signedReportRef: { documentId: FORM_ID, revisionNo: submission.report.revisionNo, signature }, boardCoverRef: { documentId: cover.documentId, revisionNo: cover.revisionNo }, reviewOpinionIds: lifecycle.reviewOpinions.filter(item => item.reportRevisionNo === submission.report.revisionNo).map(item => item.opinionId), attachmentVersionIds: Array.isArray(input.attachmentVersionIds) ? copy(input.attachmentVersionIds) : [], createdAt: input.at };
      lifecycle.boardCovers.push(cover);
      lifecycle.boardPackages.push(boardPackage);
      return finishLifecycle(context, state, "REPORT_213_BOARD_PACKAGE_CREATED", { boardPackage: copy(boardPackage) });
    }

    const boardPackage = lifecycle.boardPackages.find(item => item.submissionPackageId === submission.packageId);
    if (!boardPackage) return lifecycleFailure(sourceState, "PACKAGE_INCOMPLETE", "boardPackage", "ยังไม่มีชุดเอกสารเสนอคณะกรรมการ");

    if (action === "report-213-dispatch-board-package") {
      if (object(input.recipientAuthority).status !== "CONFIRMED") return lifecycleFailure(sourceState, "RECIPIENT_UNCONFIRMED", "recipientAuthority", "รอยืนยันหน่วยงานผู้รับชุดเอกสาร");
      for (const field of ["dispatchId", "recipientName", "letterNo", "dispatchedAt", "deliveryMethod"]) if (!text(input[field])) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", field, "ข้อมูลจัดส่งไม่ครบถ้วน");
      const dispatch = { dispatchId: input.dispatchId, packageId: boardPackage.packageId, recipientName: input.recipientName, letterNo: input.letterNo, dispatchedAt: input.dispatchedAt, dispatchedBy: person.id, deliveryMethod: input.deliveryMethod, trackingNo: text(input.trackingNo), receivedAt: "", receivedBy: "", evidenceVersionIds: [] };
      lifecycle.dispatches.push(dispatch);
      lifecycle.status = "REPORT_213_SENT_TO_A7";
      bumpStore(state);
      return finishLifecycle(context, state, "REPORT_213_DISPATCHED", { dispatch: copy(dispatch) });
    }

    const dispatch = lifecycle.dispatches.at(-1);
    if (action === "report-213-record-receipt") {
      if (lifecycle.status !== "REPORT_213_SENT_TO_A7" || !dispatch) return lifecycleFailure(sourceState, "INVALID_TRANSITION", "status", "ชุดเอกสารยังไม่ได้จัดส่ง");
      if (!text(input.receivedAt) || !text(input.receivedBy) || !(input.evidenceVersionIds || []).length) return lifecycleFailure(sourceState, "RECEIPT_REQUIRED", "receivedAt", "ข้อมูลและหลักฐานการรับไม่ครบถ้วน");
      dispatch.receivedAt = input.receivedAt;
      dispatch.receivedBy = input.receivedBy;
      dispatch.evidenceVersionIds = copy(input.evidenceVersionIds);
      lifecycle.receipts.push({ dispatchId: dispatch.dispatchId, receivedAt: input.receivedAt, receivedBy: input.receivedBy, evidenceVersionIds: copy(input.evidenceVersionIds), recordedBy: person.id });
      lifecycle.status = "REPORT_213_WAIT_RESULT";
      bumpStore(state);
      return finishLifecycle(context, state, "REPORT_213_RECEIPT_RECORDED");
    }

    if (lifecycle.status !== "REPORT_213_WAIT_RESULT") return lifecycleFailure(sourceState, "INVALID_TRANSITION", "status", "ยังไม่พร้อมบันทึกผลพิจารณา");
    if (lifecycle.results.length) return lifecycleFailure(sourceState, "RESULT_ALREADY_RECORDED", "result", "บันทึกผลพิจารณาแล้ว");
    if (!text(input.resultCode) || !text(input.decidedAt) || !text(input.resultReference)) return lifecycleFailure(sourceState, "MISSING_REQUIRED_FIELD", "resultCode", "ข้อมูลผลพิจารณาไม่ครบถ้วน");
    const result = { packageId: boardPackage.packageId, resultCode: input.resultCode, resultLabel: text(input.resultLabel), resultReference: input.resultReference, decidedAt: input.decidedAt, recordedBy: person.id, recordedAt: input.at };
    lifecycle.results.push(result);
    lifecycle.status = "REPORT_213_RESULT_RECEIVED";
    bumpStore(state);
    return finishLifecycle(context, state, "REPORT_213_RESULT_RECORDED", { result: copy(result) });
  }

  function getReport213ActionModelA5(sourceState) {
    const lifecycle = lifecycleFor213(sourceState);
    const labels = {
      "report-213-submit": "เสนอรายงาน 213", "report-213-review-record-opinion": "บันทึกความเห็นตรวจรายงาน", "report-213-review-return": "ส่งกลับแก้ไข",
      "report-213-sign": "ลงนามรายงาน", "report-213-create-board-cover": "จัดทำหนังสือเสนอคณะกรรมการ", "report-213-dispatch-board-package": "ส่งชุดเอกสารให้กิจกรรมที่ 7",
      "report-213-record-receipt": "บันทึกการรับชุดเอกสาร", "report-213-record-result": "บันทึกผลพิจารณา"
    };
    const byStatus = { REPORT_213_DRAFT: ["report-213-submit"], REPORT_213_RETURNED: ["report-213-submit"], REPORT_213_REVIEW_PENDING: ["report-213-review-record-opinion", "report-213-review-return"], REPORT_213_BOARD_READY: ["report-213-sign", "report-213-create-board-cover", "report-213-dispatch-board-package"], REPORT_213_SENT_TO_A7: ["report-213-record-receipt"], REPORT_213_WAIT_RESULT: ["report-213-record-result"] };
    return (byStatus[lifecycle.status] || []).map(id => ({ id, label: labels[id], enabled: id === "report-213-submit", reason: id === "report-213-submit" ? "" : "รอยืนยันผู้มีอำนาจตามเอกสารต้นทาง" }));
  }

  const api = Object.freeze({ FORM_ID, SECTION_KEYS, SECTION_TITLES, REPORT_213_GROUPS, BRANCHES, REPORT_213_ACTIONS, normalizeReport213A5, validateReport213A5, saveReport213DraftA5, buildReport213SubmissionA5, executeReport213Action, getReport213ActionModelA5, mutateReport213RowsA5, captureReport213EditorA5, renderReport213EditorA5, renderReport213PaperA5, renderReport213PaperA5Legacy });
  root.ECMISActivity5Report213 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
