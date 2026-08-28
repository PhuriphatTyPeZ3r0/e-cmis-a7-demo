(function initializeActivity4DocumentRules(root) {
  const DECISIONS = Object.freeze([
    "18/1ก",
    "18/1ข",
    "18/4",
    "58/2",
    "send-nacc",
    "not-accept"
  ]);
  const DECISION_SET = new Set(DECISIONS);
  const LEGACY_DECISION = "62";
  const REVIEW_RECORD_ID = "ecmis-review-record";
  const LEGACY_REVIEW_RECORD_ID = "pcms-review-record";
  const FORM3_NACC_REASONS = Object.freeze([
    Object.freeze({ id: "nacc-jurisdiction", label: "เจ้าหน้าที่รัฐอยู่ในอำนาจหน้าที่ของ คกก.ป.ป.ช." }),
    Object.freeze({ id: "bid-collusion", label: "ร้องเรียนความผิด พ.ร.บ. เสนอราคาฯ" }),
    Object.freeze({ id: "unusual-wealth", label: "ร้องเรียนพฤติการณ์ร่ำรวยผิดปกติ" }),
    Object.freeze({ id: "natural-resources", label: "เรื่องทรัพยากรธรรมชาติ" }),
    Object.freeze({ id: "national-security", label: "เรื่องความมั่นคงชาติ" }),
    Object.freeze({ id: "transnational-offense", label: "กรณีที่เป็นความผิดข้ามชาติ" }),
    Object.freeze({ id: "procurement-over-2m", label: "จัดซื้อจัดจ้าง เกิน 2 ล้านบาท" }),
    Object.freeze({ id: "state-concession", label: "กรณีที่เกี่ยวกับสัมปทานโดยรัฐ" }),
    Object.freeze({ id: "high-level-officer", label: "เจ้าหน้าที่รัฐผู้ถูกกล่าวหาดำรงตำแหน่งข้าราชการตั้งแต่ระดับอำนวยการสูงขึ้นไป" })
  ]);
  const FORM3_REASON_IDS = new Set(FORM3_NACC_REASONS.map(reason => reason.id));
  const LEGACY_NEGATIVE_CONCESSION_REASON = "กรณีไม่เกี่ยวกับสัมปทานโดยรัฐ";
  const FORM3_REASON_ID_BY_LABEL = new Map(FORM3_NACC_REASONS.map(reason => [reason.label, reason.id]));
  [
    ["เจ้าหน้าที่ของรัฐอยู่ในอำนาจหน้าที่ของคณะกรรมการ ป.ป.ช.", "nacc-jurisdiction"],
    ["ร้องเรียนความผิดตาม พ.ร.บ. ว่าด้วยความผิดเกี่ยวกับการเสนอราคาต่อหน่วยงานของรัฐ", "bid-collusion"],
    ["กรณีความผิดข้ามชาติ", "transnational-offense"],
    ["จัดซื้อจัดจ้างเกิน 2 ล้านบาท", "procurement-over-2m"]
  ].forEach(([label, id]) => FORM3_REASON_ID_BY_LABEL.set(label, id));
  const DOCUMENT_CATALOG = Object.freeze({
    "back-cover": Object.freeze({ id: "back-cover", name: "ใบปกเอกสารลับ", kind: "cover", official: false, pages: 1, register: "none", numbered: false, counted: false }),
    [REVIEW_RECORD_ID]: Object.freeze({ id: REVIEW_RECORD_ID, name: "แบบบันทึกการพิจารณาและกลั่นกรองเรื่องร้องเรียน/เบาะแส", kind: "review", official: true, pages: 1 }),
    [LEGACY_REVIEW_RECORD_ID]: Object.freeze({ id: LEGACY_REVIEW_RECORD_ID, name: "แบบบันทึกการพิจารณาและกลั่นกรองเรื่องร้องเรียน/เบาะแส", kind: "review", official: true, pages: 1, legacyAliasFor: REVIEW_RECORD_ID }),
    "1-01": Object.freeze({ id: "1-01", name: "แบบปกสำนวนการไต่สวน (สีฟ้า)", kind: "official", official: true, pages: 1 }),
    "1-02": Object.freeze({ id: "1-02", name: "แบบแจ้งการร้องเรียน/เบาะแส", kind: "official", official: true, pages: 2 }),
    "1-03": Object.freeze({ id: "1-03", name: "แบบบันทึกการตรวจสอบเรื่องร้องเรียน", kind: "official", official: true, pages: 2 }),
    "1-04": Object.freeze({ id: "1-04", name: "แบบบันทึกส่งเรื่องร้องเรียนให้หน่วยงานดำเนินการตามอำนาจหน้าที่ กรณีประพฤติมิชอบ ตามมาตรา 18/4", kind: "official", official: true, pages: 1 }),
    "1-05": Object.freeze({ id: "1-05", name: "แบบบันทึกส่งเรื่องร้องเรียนให้หน่วยงานดำเนินการตามหน้าที่ ตามมาตรา 62", kind: "official", official: true, pages: 1 }),
    "1-06": Object.freeze({ id: "1-06", name: "แบบหนังสือแจ้งผู้ร้องเรียน กรณีรับไว้ดำเนินการ ตามมาตรา 18/4", kind: "official", official: true, pages: 1 }),
    "1-07": Object.freeze({ id: "1-07", name: "แบบหนังสือแจ้งผู้ร้องเรียน กรณีสำนักงาน ป.ป.ช. ส่งเรื่องให้สำนักงาน ป.ป.ท. ดำเนินการตามมาตรา 62", kind: "official", official: true, pages: 1 }),
    "1-08": Object.freeze({ id: "1-08", name: "แบบหนังสือแจ้งสำนักงาน ป.ป.ช. กรณีรับไว้ดำเนินการตามมาตรา 62", kind: "official", official: true, pages: 1 }),
    "1-09": Object.freeze({ id: "1-09", name: "แบบหนังสือส่งเรื่องร้องเรียนคืนคณะกรรมการ ป.ป.ช. กรณีอายุความไม่ถึง 6 เดือน ตามมาตรา 18/1 (ข) (3)", kind: "official", official: true, pages: 1 }),
    "1-10": Object.freeze({ id: "1-10", name: "แบบบันทึกเสนอส่งเรื่องร้องเรียนให้สำนักงาน ป.ป.ช. กรณีสำนักงาน ป.ป.ท. รับเรื่องเอง", kind: "official", official: true, pages: 1 }),
    "1-11": Object.freeze({ id: "1-11", name: "แบบหนังสือส่งเรื่องร้องเรียนให้สำนักงาน ป.ป.ช. กรณีสำนักงาน ป.ป.ท. รับเรื่องเอง", kind: "official", official: true, pages: 1 }),
    "1-12": Object.freeze({ id: "1-12", name: "แบบบัญชีส่งเรื่องร้องเรียนให้สำนักงาน ป.ป.ช. ดำเนินการ กรณีสำนักงาน ป.ป.ท. รับเรื่องเอง", kind: "official", official: true, pages: 1 }),
    "1-13": Object.freeze({ id: "1-13", name: "แบบบันทึกเสนอส่งเรื่องแจ้งให้ผู้ร้องเรียนทราบ กรณีส่งให้สำนักงาน ป.ป.ช. ดำเนินการ", kind: "official", official: true, pages: 1 }),
    "1-14": Object.freeze({ id: "1-14", name: "แบบหนังสือแจ้งให้ผู้ร้องเรียนทราบผลการดำเนินการ กรณีส่งให้สำนักงาน ป.ป.ช. ดำเนินการ", kind: "official", official: true, pages: 1 }),
    "58/2-03": Object.freeze({ id: "58/2-03", name: "ตัวอย่างหนังสือบันทึกย่อแจ้งผู้ร้องเรียนทราบ ศรร.", kind: "official", official: true, pages: 2 }),
    "58/2-04": Object.freeze({ id: "58/2-04", name: "ตัวอย่างหนังสือบันทึกย่อแจ้งผู้ร้องเรียนทราบ ปปท. เขต", kind: "official", official: true, pages: 2 }),
    "58/2-05": Object.freeze({ id: "58/2-05", name: "ตัวอย่างหนังสือส่งเอกสารเรื่องร้องเรียนไป ปปท. เขต", kind: "official", official: true, pages: 3 }),
    "nacc-board-resolution": Object.freeze({ id: "nacc-board-resolution", name: "สำเนามติคณะกรรมการ ป.ป.ท.", kind: "evidence", official: false, pages: 0 }),
    "nacc-original-dossier": Object.freeze({ id: "nacc-original-dossier", name: "สำนวนและเอกสารต้นฉบับจากสำนักงาน ป.ป.ช. ครบชุด", kind: "evidence", official: false, pages: 0 }),
    "notification-evidence": Object.freeze({ id: "notification-evidence", name: "หลักฐานการแจ้งผลให้ผู้ร้องเรียน", kind: "evidence", official: false, pages: 0 })
  });

  function asObject(value) {
    return value && typeof value === "object" ? value : {};
  }

  function contextOf(record) {
    const source = asObject(record);
    const caseData = asObject(source.caseData && typeof source.caseData === "object" ? source.caseData : source);
    const documentData = asObject(source.documentData && typeof source.documentData === "object" ? source.documentData : source);
    return { source, caseData, documentData };
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function toThaiDigits(value) {
    return String(value == null ? "" : value).replace(/[0-9]/g, digit => "๐๑๒๓๔๕๖๗๘๙"[Number(digit)]);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderOfficialDocumentBindings(record, documentId) {
    const { documentData } = contextOf(record);
    const blank = "........................................";
    const value = field => toThaiDigits(escapeHtml(text(documentData[field]) || blank));
    const contactHtml = `<div class="official-contact"><p>${value("contactOfficeName")}</p><p>${value("contactOfficeAddress")}</p><p>โทร. ${value("contactOfficePhone")} โทรสาร ${value("contactOfficeFax")}</p></div>`;
    const notification = {
      recipientHtml: value("recipientName"),
      complaintReferenceHtml: `<span>หนังสือร้องเรียนของท่าน ฉบับลงวันที่ ${value("complaintLetterDate")}</span>`,
      contactHtml
    };
    if (["1-06", "1-07", "1-14"].includes(documentId)) return Object.freeze(notification);
    if (documentId === "1-08") {
      return Object.freeze({
        recipientHtml: value("naccRecipientName"),
        provinceHtml: value("naccProvince"),
        incomingLetterNoHtml: value("naccIncomingLetterNo"),
        incomingLetterDateHtml: value("naccIncomingLetterDate"),
        blackTrackingNoHtml: value("naccBlackTrackingNo"),
        referenceHtml: `<span>${value("naccRecipientName")} ${value("naccProvince")} หนังสือที่ ${value("naccIncomingLetterNo")} ลงวันที่ ${value("naccIncomingLetterDate")} เลขดำติดตามที่ ${value("naccBlackTrackingNo")}</span>`,
        contactHtml
      });
    }
    if (documentId === "1-12") {
      const reportHeadingHtml = `<h2>บัญชีเรื่องกล่าวหา/ร้องเรียนเจ้าหน้าที่ของรัฐ ประจำปี พ.ศ. ${value("naccReportYear")} ครั้งที่ ........ จำนวน ๑ เรื่อง</h2>`;
      const attachmentPagesHtml = value("naccDossierAttachmentPages");
      return Object.freeze({
        reportHeadingHtml,
        attachmentPagesHtml,
        reportHtml: `${reportHeadingHtml}<p>จำนวน ${attachmentPagesHtml} แผ่น</p>`
      });
    }
    return Object.freeze({});
  }

  function channelKey(value) {
    return text(value).toLowerCase().replace(/[\s_-]/g, "");
  }

  function isM62Channel(value) {
    const key = channelKey(value);
    return key.includes("ม.62") || key.includes("ม62") || key.includes("มาตรา62") || (key.includes("ป.ป.ช.") && key.includes("api"));
  }

  function isNaccApiCase(record) {
    const { source, caseData } = contextOf(record);
    return caseData.isFromNacc === true
      || source.isFromNacc === true
      || text(caseData.sourceAgency || source.sourceAgency).toUpperCase() === "NACC"
      || text(caseData.sourceSystem || source.sourceSystem).toUpperCase() === "NACC_API";
  }

  function normalizeNaccApiIntake(record) {
    const source = clone(asObject(record));
    const hasNestedCaseData = source.caseData && typeof source.caseData === "object";
    const caseData = hasNestedCaseData ? asObject(source.caseData) : source;
    const documentData = asObject(source.documentData);
    Object.assign(caseData, {
      channel: text(caseData.channel) || "ป.ป.ช. (API)",
      isFromNacc: true,
      sourceAgency: "NACC",
      sourceSystem: "NACC_API",
      referralLegalBasis: "18/1ข"
    });
    documentData.decision = "18/1ข";
    if (hasNestedCaseData) source.caseData = caseData;
    else source.caseData = { ...caseData };
    source.documentData = documentData;
    return source;
  }

  function naccIntakeAlerts(record) {
    if (!isNaccApiCase(record)) return Object.freeze([]);
    const { caseData } = contextOf(record);
    const assessment = asObject(caseData.naccAssessment);
    const alerts = [];
    if (assessment.jurisdiction === "out_of_scope") alerts.push(Object.freeze({
      code: "NACC_OUT_OF_SCOPE",
      severity: "critical",
      title: "ตรวจพบว่าไม่อยู่ในอำนาจสำนักงาน ป.ป.ท.",
      action: "เสนอคณะกรรมการ ป.ป.ท. และเตรียมส่งเรื่องคืนสำนักงาน ป.ป.ช."
    }));
    const remainingMonthsValue = assessment.limitationRemainingMonths;
    const remainingMonths = Number(remainingMonthsValue);
    if (remainingMonthsValue !== null && remainingMonthsValue !== "" && Number.isFinite(remainingMonths) && remainingMonths >= 0 && remainingMonths <= 6) alerts.push(Object.freeze({
      code: "NACC_LIMITATION_SIX_MONTHS",
      severity: "critical",
      title: `อายุความเหลือ ${remainingMonths} เดือน`,
      action: "เร่งเสนอคณะกรรมการ ป.ป.ท. เพื่อพิจารณาก่อนดำเนินการต่อ"
    }));
    if (assessment.documentsComplete === false) alerts.push(Object.freeze({
      code: "NACC_DOCUMENTS_INCOMPLETE",
      severity: "warning",
      title: "เอกสารจากสำนักงาน ป.ป.ช. ไม่ครบถ้วน",
      action: "ประสานขอเอกสารเพิ่มเติม หากไม่ได้รับให้เตรียมส่งเรื่องคืนสำนักงาน ป.ป.ช."
    }));
    return Object.freeze(alerts);
  }

  const NACC_API_SEEDS = Object.freeze([
    Object.freeze({
      id: "seed-nacc-api-central-registry-001", channel: "ป.ป.ช. (API)", region: "ส่วนกลาง", province: "กรุงเทพมหานคร", registry: {},
      isFromNacc: true, sourceAgency: "NACC", sourceSystem: "NACC_API", referralLegalBasis: "18/1ข",
      complainant: "สำนักงาน ป.ป.ช.", subject: "เรื่องกล่าวหาจากสำนักงาน ป.ป.ช. รอลงรับสารบรรณกลาง", agency: "หน่วยงานของรัฐตัวอย่าง",
      received: "21 สิงหาคม 2569 08:30 น.", receivedAt: "2026-08-21T08:30:00+07:00", type: "เรื่องจากสำนักงาน ป.ป.ช.",
      place: "กรุงเทพมหานคร", detail: "รับข้อมูลเรื่องกล่าวหาผ่าน API จากสำนักงาน ป.ป.ช.", damage: "อยู่ระหว่างตรวจสอบ", request: "ลงรับและดำเนินการตามมาตรา 18/1(ข)",
      attachments: [{ name: "สำนวนจากสำนักงาน ป.ป.ช. 001.pdf", type: "PDF", pages: 8, size: "1.8 MB", desc: "เอกสารที่รับผ่าน API" }],
      naccAssessment: { jurisdiction: "pending", limitationRemainingMonths: 18, documentsComplete: true }
    }),
    Object.freeze({
      id: "seed-nacc-api-case-admin-002", channel: "ป.ป.ช. (API)", region: "ส่วนกลาง", province: "นนทบุรี", registry: { office: "0151/2569" },
      isFromNacc: true, sourceAgency: "NACC", sourceSystem: "NACC_API", referralLegalBasis: "18/1ข",
      complainant: "สำนักงาน ป.ป.ช.", subject: "เรื่องกล่าวหาจากสำนักงาน ป.ป.ช. รอลงรับ กบค.", agency: "องค์กรปกครองส่วนท้องถิ่นตัวอย่าง",
      received: "21 สิงหาคม 2569 08:45 น.", receivedAt: "2026-08-21T08:45:00+07:00", type: "เรื่องจากสำนักงาน ป.ป.ช.",
      place: "จังหวัดนนทบุรี", detail: "รับข้อมูลเรื่องกล่าวหาผ่าน API จากสำนักงาน ป.ป.ช.", damage: "อยู่ระหว่างตรวจสอบ", request: "ลงรับและดำเนินการตามมาตรา 18/1(ข)", attachments: [],
      naccAssessment: { jurisdiction: "pending", limitationRemainingMonths: 5, documentsComplete: true }
    }),
    Object.freeze({
      id: "seed-nacc-api-srr-003", channel: "ป.ป.ช. (API)", region: "ส่วนกลาง", province: "ปทุมธานี", registry: { office: "0152/2569", kbk: "0091/2569" },
      isFromNacc: true, sourceAgency: "NACC", sourceSystem: "NACC_API", referralLegalBasis: "18/1ข",
      complainant: "สำนักงาน ป.ป.ช.", subject: "เรื่องกล่าวหาจากสำนักงาน ป.ป.ช. รอธุรการ ศรร.", agency: "หน่วยงานของรัฐตัวอย่าง",
      received: "21 สิงหาคม 2569 09:00 น.", receivedAt: "2026-08-21T09:00:00+07:00", type: "เรื่องจากสำนักงาน ป.ป.ช.",
      place: "จังหวัดปทุมธานี", detail: "รับข้อมูลเรื่องกล่าวหาผ่าน API จากสำนักงาน ป.ป.ช.", damage: "อยู่ระหว่างตรวจสอบ", request: "ลงรับและดำเนินการตามมาตรา 18/1(ข)", attachments: [],
      naccAssessment: { jurisdiction: "out_of_scope", limitationRemainingMonths: 6, documentsComplete: false }
    })
  ]);

  function requiresForm102(channel) {
    const key = channelKey(channel);
    return key.includes("walkin") || key.includes("1206") || key.includes("โทร");
  }

  function isContactable(record) {
    const { source, caseData, documentData } = contextOf(record);
    if ([source.contactable, caseData.contactable, documentData.contactable].some(value => value === false)) return false;
    if ([source.anonymous, source.anonymousDetected, caseData.anonymous, caseData.anonymousDetected, documentData.anonymous].some(Boolean)) return false;
    const contactability = [source.contactability, caseData.contactability, documentData.contactability].map(value => text(value).toLowerCase()).find(Boolean);
    if (["uncontactable", "anonymous", "unknown", "none", "ไม่สามารถติดต่อได้"].includes(contactability)) return false;
    if (["contactable", "available", "ติดต่อได้"].includes(contactability)) return true;
    const workingCopy = asObject(documentData.workingCopy);
    const phones = [workingCopy.phone, documentData.complainantPhone, documentData.contactPhone, caseData.complainantPhone, caseData.contactPhone, caseData.phone, source.complainantPhone, source.contactPhone, source.phone];
    const emails = [workingCopy.email, documentData.complainantEmail, documentData.contactEmail, caseData.complainantEmail, caseData.contactEmail, caseData.email, source.complainantEmail, source.contactEmail, source.email];
    const addresses = [workingCopy.address, documentData.complainantAddress, documentData.contactAddress, caseData.complainantAddress, caseData.contactAddress, source.complainantAddress, source.contactAddress];
    if (phones.some(value => /\d{5,}/.test(text(value))) || emails.some(value => /@/.test(text(value))) || addresses.some(value => text(value).length >= 8)) return true;
    return false;
  }

  function documentIdsFor(decision, context) {
    const ids = ["back-cover", REVIEW_RECORD_ID];
    const includeForm102 = requiresForm102(context.caseData.channel || context.source.channel);
    const contactable = isContactable(context.source);
    const incomingM62 = isM62Channel(context.caseData.channel || context.source.channel);
    if (includeForm102) ids.push("1-02");
    if (decision === "18/1ก") ids.push("1-01", "1-03");
    if (decision === "18/1ข") {
      ids.push("1-01", "1-03");
      if (incomingM62) ids.push("1-05");
      if (incomingM62 && contactable) ids.push("1-07");
      if (incomingM62) ids.push("1-08");
    }
    if (decision === "18/4") {
      ids.push("1-01", "1-03", "1-04");
      if (contactable) ids.push("1-06");
    }
    if (decision === "58/2") {
      if (context.documentData.reliefOperationKind === "central") {
        ids.push("58/2-03");
        if (context.documentData.centralSendsDossierToRegion === true) ids.push("58/2-05");
      }
      if (context.documentData.reliefOperationKind === "regional") ids.push("58/2-04");
    }
    if (decision === "send-nacc") {
      if (context.documentData.naccTransferKind === "return") ids.push("1-09", "nacc-board-resolution", "nacc-original-dossier");
      if (context.documentData.naccTransferKind === "forward") {
        ids.push("1-10", "1-11", "1-12", "1-13");
        if (contactable) ids.push("1-14");
      }
    }
    if (decision === "not-accept") {
      ids.push("notification-evidence");
    }
    return ids;
  }

  function resolveDocumentRequirements(record) {
    const context = contextOf(record);
    const decision = text(context.documentData.decision || context.source.decision);
    const legacy = decision === LEGACY_DECISION;
    const validation = validateDecisionRecord(context.source);
    const supported = validation.valid;
    const documentIds = supported ? documentIdsFor(decision, context) : [];
    const documents = documentIds.map(id => DOCUMENT_CATALOG[id]).filter(Boolean);
    return Object.freeze({
      decision,
      status: legacy ? "manual-review" : supported ? "confirmed" : "unsupported",
      supported,
      legacy,
      contactable: isContactable(context.source),
      requiresForm102: requiresForm102(context.caseData.channel || context.source.channel),
      documentIds: Object.freeze(documentIds),
      officialDocumentIds: Object.freeze(documents.filter(document => document.official).map(document => document.id)),
      documents: Object.freeze(documents)
    });
  }

  function signedSnapshotDocumentIds(record) {
    const requirements = resolveDocumentRequirements(record);
    return requirements.supported ? requirements.documentIds : Object.freeze([REVIEW_RECORD_ID]);
  }

  function validateDecisionRecord(record) {
    const context = contextOf(record);
    const decision = text(context.documentData.decision || context.source.decision);
    const errors = [];
    if (decision === LEGACY_DECISION) errors.push("legacy-decision-manual-review");
    else if (!DECISION_SET.has(decision)) errors.push("unsupported-decision");
    if (isNaccApiCase(context.source) && decision !== "18/1ข") errors.push("nacc-api-decision-locked");
    if (decision === "send-nacc" && !["forward", "return"].includes(context.documentData.naccTransferKind)) errors.push("invalid-nacc-transfer-kind");
    if (decision === "send-nacc" && context.documentData.needsReasonReview === true) errors.push("form3-reason-review-required");
    if (decision === "58/2" && !["central", "regional"].includes(context.documentData.reliefOperationKind)) errors.push("invalid-relief-operation-kind");
    if (decision === "58/2" && context.documentData.reliefOperationKind === "central" && typeof context.documentData.centralSendsDossierToRegion !== "boolean") errors.push("missing-central-region-dossier-choice");
    if (decision === "58/2" && context.documentData.reliefOperationKind === "regional" && context.documentData.centralSendsDossierToRegion != null) errors.push("invalid-regional-dossier-transfer");
    return Object.freeze({
      valid: errors.length === 0,
      decision,
      status: decision === LEGACY_DECISION ? "manual-review" : errors.length === 0 ? "confirmed" : "unsupported",
      errors: Object.freeze(errors),
      errorCodes: Object.freeze(errors)
    });
  }

  function migrateForm3Reasons(sourceStore) {
    const original = asObject(sourceStore);
    const store = JSON.parse(JSON.stringify(original));
    let changed = false;
    Object.values(store).forEach(record => {
      const documentData = record && typeof record === "object" ? record.documentData : null;
      if (!documentData || !Array.isArray(documentData.reasons)) return;
      const migratedReasonIds = [];
      const legacyReasonLabels = Array.isArray(documentData.legacyReasonLabels) ? [...documentData.legacyReasonLabels] : [];
      let needsReasonReview = documentData.needsReasonReview === true;
      documentData.reasons.forEach(value => {
        const reason = text(value);
        if (!reason) return;
        if (FORM3_REASON_IDS.has(reason)) {
          if (!migratedReasonIds.includes(reason)) migratedReasonIds.push(reason);
          return;
        }
        if (reason === LEGACY_NEGATIVE_CONCESSION_REASON) {
          if (!legacyReasonLabels.includes(reason)) legacyReasonLabels.push(reason);
          needsReasonReview = true;
          return;
        }
        const mappedId = FORM3_REASON_ID_BY_LABEL.get(reason);
        if (mappedId) {
          if (!migratedReasonIds.includes(mappedId)) migratedReasonIds.push(mappedId);
          return;
        }
        if (!legacyReasonLabels.includes(reason)) legacyReasonLabels.push(reason);
        needsReasonReview = true;
      });
      if (documentData.reasons.length !== migratedReasonIds.length || documentData.reasons.some((reason, index) => reason !== migratedReasonIds[index])) {
        documentData.reasons = migratedReasonIds;
        changed = true;
      }
      if (legacyReasonLabels.length && JSON.stringify(documentData.legacyReasonLabels || []) !== JSON.stringify(legacyReasonLabels)) {
        documentData.legacyReasonLabels = legacyReasonLabels;
        changed = true;
      }
      if (documentData.needsReasonReview !== needsReasonReview) {
        documentData.needsReasonReview = needsReasonReview;
        changed = true;
      }
    });
    return Object.freeze({ store, changed });
  }

  function confirmForm3ReasonReview(sourceDocumentData, review) {
    const documentData = JSON.parse(JSON.stringify(asObject(sourceDocumentData)));
    const metadata = asObject(review);
    const reasonIds = Array.isArray(documentData.reasons) ? [...new Set(documentData.reasons.map(text).filter(reason => FORM3_REASON_IDS.has(reason)))] : [];
    const errors = [];
    if (documentData.decision !== "send-nacc") errors.push("invalid-review-decision");
    if (reasonIds.length === 0) errors.push("missing-current-form3-reason");
    if (!text(metadata.reviewedAt)) errors.push("missing-reviewed-at");
    if (!text(metadata.reviewedBy)) errors.push("missing-reviewed-by");
    if (errors.length === 0) {
      documentData.needsReasonReview = false;
      documentData.replacementReasonIds = reasonIds;
      documentData.reasonReviewedAt = text(metadata.reviewedAt);
      documentData.reasonReviewedBy = text(metadata.reviewedBy);
    }
    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
      errorCodes: Object.freeze(errors),
      documentData
    });
  }

  function validateDispatch(record) {
    const context = contextOf(record);
    const data = context.documentData;
    const decisionValidation = validateDecisionRecord(context.source);
    const errors = [...decisionValidation.errors];
    if (!["18/1ก", "18/1ข", "18/4"].includes(decisionValidation.decision)) errors.push("unsupported-dispatch-decision");
    if (context.source?.workflow?.owner !== "officer" || context.source?.workflow?.stage !== "officer-dispatch" || context.source?.workflow?.complete === true) errors.push("invalid-dispatch-workflow");
    if (text(data.dispatchConfirmedAt)) errors.push("dispatch-already-confirmed");
    const values = {
      dispatchLetterNo: text(data.dispatchLetterNo),
      dispatchLetterDate: text(data.dispatchLetterDate),
      dispatchSendMethod: text(data.dispatchSendMethod),
      dispatchEms: text(data.dispatchEms),
      dispatchSentDate: text(data.dispatchSentDate),
      dispatchDestinationUnit: text(data.dispatchDestinationUnit)
    };
    for (const field of ["dispatchLetterNo", "dispatchLetterDate", "dispatchSendMethod", "dispatchSentDate", "dispatchDestinationUnit"]) {
      if (!values[field]) errors.push(`missing-${field}`);
    }
    if (values.dispatchSendMethod === "EMS" && !values.dispatchEms) errors.push("missing-dispatchEms");
    return Object.freeze({
      valid: errors.length === 0,
      decision: decisionValidation.decision,
      errors: Object.freeze(errors),
      errorCodes: Object.freeze(errors),
      values: Object.freeze(values)
    });
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nextDocumentVersion(versions) {
    return versions.reduce((highest, version) => Math.max(highest, Number(version?.version) || 0), 0) + 1;
  }

  function emptySignature(previous, fallbackRole) {
    return {
      signed: false,
      signerName: "",
      signerRole: text(previous?.signerRole) || fallbackRole,
      signedAt: "",
      signatureId: ""
    };
  }

  function signatureEvidence(signature) {
    const evidence = clone(asObject(signature));
    delete evidence.signedSnapshot;
    delete evidence.renderVersion;
    return evidence;
  }

  function normalizeLegacyDocumentEvidence(sourceRecord) {
    const original = asObject(sourceRecord);
    const record = clone(original);
    record.documentData = asObject(record.documentData);
    record.documentVersions = Array.isArray(record.documentVersions) ? record.documentVersions : [];
    let changed = false;
    record.documentVersions = record.documentVersions.map(version => {
      if (!version || typeof version !== "object" || ["draft", "signed", "superseded", "legacy-unverified"].includes(version.status)) return version;
      changed = true;
      return { ...version, status: "legacy-unverified", active: false };
    });
    record.documentVersions.forEach(version => {
      if (!version || typeof version !== "object") return;
      version.signedSnapshot = asObject(version.signedSnapshot);
      version.signatures = asObject(version.signatures);
      for (const signerType of ["officer", "center", "division"]) {
        const versionSignature = asObject(version.signatures[signerType]);
        const documentSignature = asObject(record.documentData[`${signerType}Signature`]);
        const redundantSnapshot = versionSignature.signedSnapshot || (version.active === true ? documentSignature.signedSnapshot : null);
        if (!version.signedSnapshot[signerType] && redundantSnapshot) {
          version.signedSnapshot[signerType] = clone(redundantSnapshot);
          changed = true;
        }
        if (Object.prototype.hasOwnProperty.call(versionSignature, "signedSnapshot")) {
          delete versionSignature.signedSnapshot;
          version.signatures[signerType] = versionSignature;
          changed = true;
        }
        if (Object.prototype.hasOwnProperty.call(documentSignature, "signedSnapshot")) {
          delete documentSignature.signedSnapshot;
          record.documentData[`${signerType}Signature`] = documentSignature;
          changed = true;
        }
      }
    });
    const legacySignatures = {};
    for (const signerType of ["officer", "center", "division"]) {
      const signature = record.documentData[`${signerType}Signature`];
      if (signature?.signed === true && !signature.signedSnapshot) legacySignatures[signerType] = signatureEvidence(signature);
    }
    const hasVerifiedActive = record.documentVersions.some(version => version?.active === true && version?.status === "signed");
    const hasLegacyActive = record.documentVersions.some(version => version?.active === true && version?.status === "legacy-unverified");
    if (!hasVerifiedActive && !hasLegacyActive && Object.keys(legacySignatures).length) {
      record.documentVersions.push({
        version: nextDocumentVersion(record.documentVersions),
        status: "legacy-unverified",
        active: true,
        legacySignatures
      });
      changed = true;
    }
    return Object.freeze({ record, changed });
  }

  const EDIT_FIELDS = Object.freeze({
    officer: new Set([
      "documentSubject", "decision", "reasons", "notAcceptReason", "anonymous", "proposedRegion", "officerOpinion",
      "reviewRoute", "absenceReasonType", "absenceNote", "actingOfficer", "actingOrder", "naccTransferKind",
      "reliefOperationKind", "centralSendsDossierToRegion",
      "naccOtherChecked", "naccOtherReason", "boardResolutionAttached", "originalDossierAttached", "documentPack", "workingCopy", "naccIncomingLetterNo",
      "naccIncomingLetterDate", "naccBlackTrackingNo", "naccRecipientName", "naccProvince", "naccBoardNo",
      "naccBoardDate", "naccBoardAgenda", "naccBoardAttachmentPages", "naccDossierAttachmentPages", "naccReportYear",
      "accusedName", "accusedPositionAffiliation", "complaintLetterDate", "recipientName", "contactOfficeName",
      "contactOfficeAddress", "contactOfficePhone", "contactOfficeFax", "ownerPosition"
    ]),
    center: new Set(["centerDecision", "centerOpinion"]),
    division: new Set(["divisionOpinion", "actingOrder"]),
    dispatch: new Set([
      "dispatchLetterNo", "dispatchLetterDate", "dispatchSendMethod", "dispatchEms", "dispatchSentDate", "dispatchSentTime",
      "dispatchDestinationUnit", "dispatchNote", "dispatchProofName", "naccLetterNo", "naccLetterDate", "naccSendMethod",
      "naccEms", "naccSentDate", "naccBoardNote", "naccProofName", "naccNotified",
      "boardResolutionAttached", "originalDossierAttached"
    ])
  });

  function documentSourceSectionLocked(record, section) {
    if (section === "dispatch") return false;
    const data = asObject(asObject(record).documentData);
    return data[`${section}Signature`]?.signed === true;
  }

  function applyDocumentSourceEdits(sourceRecord, input) {
    const original = asObject(sourceRecord);
    const metadata = asObject(input);
    const section = text(metadata.section);
    const allowed = EDIT_FIELDS[section];
    if (!allowed) return Object.freeze({ applied: false, record: clone(original), errors: Object.freeze(["invalid-edit-section"]) });
    if (documentSourceSectionLocked(original, section)) return Object.freeze({ applied: false, record: clone(original), errors: Object.freeze(["signed-document-locked"]) });
    const normalized = normalizeLegacyDocumentEvidence(original);
    const record = normalized.record;
    record.documentData = asObject(record.documentData);
    let applied = false;
    Object.entries(asObject(metadata.values)).forEach(([field, value]) => {
      if (!allowed.has(field)) return;
      record.documentData[field] = clone(value);
      applied = true;
    });
    return Object.freeze({ applied, record, errors: Object.freeze([]) });
  }

  function recordDocumentSignature(sourceRecord, input) {
    const original = asObject(sourceRecord);
    const metadata = asObject(input);
    const signerType = text(metadata.signerType);
    const renderVersion = text(metadata.renderVersion);
    const signature = asObject(metadata.signature);
    const errors = [];
    if (!["officer", "center", "division"].includes(signerType)) errors.push("invalid-signer-type");
    if (!signature.signed || !text(signature.signedAt) || !text(signature.signatureId)) errors.push("invalid-signature");
    if (!renderVersion) errors.push("missing-render-version");
    if (!metadata.signedSnapshot || typeof metadata.signedSnapshot !== "object") errors.push("missing-signed-snapshot");
    if (errors.length) return Object.freeze({ valid: false, errors: Object.freeze(errors), errorCodes: Object.freeze(errors), record: clone(original), version: null });

    const normalized = normalizeLegacyDocumentEvidence(original);
    const record = normalized.record;
    record.documentData = asObject(record.documentData);
    record.documentVersions = Array.isArray(record.documentVersions) ? record.documentVersions : [];
    let activeVersion = record.documentVersions.find(version => version?.active === true);
    if (activeVersion?.status === "legacy-unverified") {
      activeVersion.active = false;
      activeVersion = null;
    }
    if (!activeVersion) {
      activeVersion = {
        version: nextDocumentVersion(record.documentVersions),
        status: "draft",
        active: true,
        createdAt: text(signature.signedAt),
        createdBy: text(signature.signerName),
        renderVersion: "",
        signedSnapshot: {},
        signatures: {}
      };
      record.documentVersions.push(activeVersion);
    }
    activeVersion.signedSnapshot = asObject(activeVersion.signedSnapshot);
    activeVersion.signatures = asObject(activeVersion.signatures);
    if (activeVersion.signedSnapshot[signerType] || activeVersion.signatures[signerType]) {
      return Object.freeze({ valid: false, errors: Object.freeze(["signer-already-signed"]), errorCodes: Object.freeze(["signer-already-signed"]), record: clone(original), version: null });
    }
    if (text(activeVersion.renderVersion) && activeVersion.renderVersion !== renderVersion) {
      return Object.freeze({ valid: false, errors: Object.freeze(["render-version-mismatch"]), errorCodes: Object.freeze(["render-version-mismatch"]), record: clone(original), version: null });
    }

    const signedSnapshot = clone(metadata.signedSnapshot);
    const storedSignature = { ...clone(signature), renderVersion };
    activeVersion.status = "signed";
    activeVersion.renderVersion = renderVersion;
    activeVersion.signedSnapshot[signerType] = signedSnapshot;
    activeVersion.signatures[signerType] = clone(storedSignature);
    activeVersion.lastSignedAt = text(signature.signedAt);
    activeVersion.lastSignedBy = text(signature.signerName);
    record.documentData[`${signerType}Signature`] = storedSignature;
    return Object.freeze({ valid: true, errors: Object.freeze([]), errorCodes: Object.freeze([]), record, version: activeVersion });
  }

  function returnDocumentForCorrection(sourceRecord, input) {
    const original = asObject(sourceRecord);
    const metadata = asObject(input);
    const actorType = text(metadata.actorType);
    const actorName = text(metadata.actorName);
    const reason = text(metadata.reason);
    const returnedAt = text(metadata.returnedAt);
    const errors = [];
    if (!["center", "division", "regional-director"].includes(actorType)) errors.push("unauthorized-correction-return");
    if (!reason) errors.push("missing-correction-reason");
    if (!returnedAt) errors.push("missing-returned-at");
    if (errors.length) return Object.freeze({ valid: false, errors: Object.freeze(errors), errorCodes: Object.freeze(errors), record: clone(original), version: null });

    const normalized = normalizeLegacyDocumentEvidence(original);
    const record = normalized.record;
    record.documentData = asObject(record.documentData);
    record.documentVersions = Array.isArray(record.documentVersions) ? record.documentVersions : [];
    const signedVersion = record.documentVersions.find(version => version?.active === true && ["signed", "legacy-unverified"].includes(version?.status));
    if (!signedVersion) {
      return Object.freeze({ valid: false, errors: Object.freeze(["missing-active-signed-version"]), errorCodes: Object.freeze(["missing-active-signed-version"]), record: clone(original), version: null });
    }

    const verifiedSnapshot = signedVersion.status === "signed";
    if (verifiedSnapshot) signedVersion.status = "superseded";
    signedVersion.active = false;
    signedVersion.supersededAt = returnedAt;
    signedVersion.supersededBy = actorName;
    signedVersion.supersededReason = reason;
    const version = {
      version: nextDocumentVersion(record.documentVersions),
      status: "draft",
      active: true,
      previousVersion: signedVersion.version,
      createdAt: returnedAt,
      createdBy: actorName,
      correctionReason: reason,
      renderVersion: "",
      signedSnapshot: {},
      signatures: {}
    };
    signedVersion.replacedByVersion = version.version;
    record.documentVersions.push(version);
    record.documentData.officerSignature = emptySignature(record.documentData.officerSignature, "เจ้าหน้าที่รับเรื่อง");
    record.documentData.centerSignature = emptySignature(record.documentData.centerSignature, "ผู้อำนวยการศูนย์รับเรื่องร้องเรียน");
    record.documentData.divisionSignature = emptySignature(record.documentData.divisionSignature, "ผู้อำนวยการกองบริหารคดี");
    return Object.freeze({ valid: true, errors: Object.freeze([]), errorCodes: Object.freeze([]), record, version });
  }

  function isSignedDocumentLocked(record) {
    const source = asObject(record);
    const versions = Array.isArray(source.documentVersions) ? source.documentVersions : [];
    const activeVersion = versions.find(version => version?.active === true);
    if (activeVersion?.status === "signed" && Object.keys(asObject(activeVersion.signedSnapshot)).length > 0) return true;
    const documentData = asObject(source.documentData);
    return [documentData.officerSignature, documentData.centerSignature, documentData.divisionSignature].some(signature => signature?.signed === true);
  }

  const CASE_PHASES = Object.freeze({
    OFFICER_DRAFT: "OFFICER_DRAFT",
    OFFICER_SIGNED: "OFFICER_SIGNED",
    CENTER_REVIEW: "CENTER_REVIEW",
    DIVISION_REVIEW: "DIVISION_REVIEW",
    OFFICER_CORRECTION: "OFFICER_CORRECTION",
    REGIONAL_DIRECTOR_REVIEW: "REGIONAL_DIRECTOR_REVIEW",
    APPROVED_AWAITING_OFFICER_ACTION: "APPROVED_AWAITING_OFFICER_ACTION",
    TERMINAL: "TERMINAL"
  });

  const TERMINAL_STAGES = new Set([
    "duplicate-closed",
    "activity5-dispatch",
    "relief-dispatched",
    "notification-confirmed"
  ]);

  function transitionResult(ok, code, record, errors = [], effects = []) {
    return Object.freeze({
      ok,
      code,
      record,
      errors: Object.freeze(errors),
      errorCodes: Object.freeze(errors),
      effects: Object.freeze(effects)
    });
  }

  function transitionFailure(code, sourceRecord, errors = [code]) {
    return transitionResult(false, code, clone(asObject(sourceRecord)), errors, []);
  }

  function actorMetadata(actor) {
    const source = asObject(actor);
    return {
      role: text(source.role),
      name: text(source.name),
      at: text(source.at),
      region: text(source.region)
    };
  }

  function isTerminalCase(record) {
    const source = asObject(record);
    const workflow = asObject(source.workflow);
    const data = asObject(source.documentData);
    return workflow.complete === true
      || workflow.phase === CASE_PHASES.TERMINAL
      || TERMINAL_STAGES.has(text(workflow.stage))
      || Boolean(text(data.dispatchConfirmedAt) || text(data.naccDispatchConfirmedAt) || text(data.notificationConfirmedAt));
  }

  function intakeOwnerOf(record, fallbackRole = "officer") {
    const source = asObject(record);
    const workflow = asObject(source.workflow);
    const data = asObject(source.documentData);
    const existing = asObject(workflow.intakeOwner);
    const role = ["officer", "regional-officer"].includes(text(existing.role))
      ? text(existing.role)
      : ["officer", "regional-officer"].includes(text(workflow.owner))
        ? text(workflow.owner)
        : fallbackRole;
    return {
      role,
      officer: text(existing.officer || data.assignedOfficer || asObject(source.caseData).assignedOfficer)
    };
  }

  function requireTransitionActor(actor, roles, record) {
    if (!roles.includes(actor.role)) return transitionFailure("UNAUTHORIZED_TRANSITION", record);
    if (!actor.name || !actor.at) return transitionFailure("MISSING_TRANSITION_AUDIT", record);
    return null;
  }

  function requireRegionalActorScope(actor, record) {
    if (actor.role !== "regional-officer") return null;
    if (actor.region && actor.region === text(asObject(asObject(record).caseData).region)) return null;
    return transitionFailure("UNAUTHORIZED_TRANSITION", record);
  }

  function requireWorkflow(record, owners, stages) {
    const workflow = asObject(asObject(record).workflow);
    return owners.includes(text(workflow.owner)) && stages.includes(text(workflow.stage));
  }

  function applyWorkflow(record, values) {
    record.workflow = { ...asObject(record.workflow), ...values };
    return record;
  }

  function ensureDecisionHistory(record) {
    record.decisionHistory = Array.isArray(record.decisionHistory) ? record.decisionHistory : [];
    return record.decisionHistory;
  }

  function correctionOwner(record, fallbackRole) {
    const owner = intakeOwnerOf(record, fallbackRole);
    if (!owner.officer) return null;
    return owner;
  }

  function requireIntakeOfficer(actor, owner, record) {
    if (!owner) return transitionFailure("MISSING_INTAKE_OWNER", record);
    if (actor.role !== owner.role) return transitionFailure("UNAUTHORIZED_TRANSITION", record);
    if (actor.name !== owner.officer) return transitionFailure("INTAKE_OFFICER_MISMATCH", record);
    return null;
  }

  function validateOfficialDispatchEvidence(record) {
    const data = asObject(asObject(record).documentData);
    const values = {
      dispatchLetterNo: text(data.dispatchLetterNo),
      dispatchLetterDate: text(data.dispatchLetterDate),
      dispatchSendMethod: text(data.dispatchSendMethod),
      dispatchEms: text(data.dispatchEms),
      dispatchSentDate: text(data.dispatchSentDate),
      dispatchDestinationUnit: text(data.dispatchDestinationUnit)
    };
    const errors = [];
    for (const field of ["dispatchLetterNo", "dispatchLetterDate", "dispatchSendMethod", "dispatchSentDate", "dispatchDestinationUnit"]) {
      if (!values[field]) errors.push(`missing-${field}`);
    }
    if (values.dispatchSendMethod === "EMS" && !values.dispatchEms) errors.push("missing-dispatchEms");
    errors.push(...validateOutgoingIssuanceProjection(record));
    return Object.freeze({ valid: errors.length === 0, values: Object.freeze(values), errors: Object.freeze(errors) });
  }

  function validateOutgoingIssuanceProjection(record) {
    const api = root.ECMISActivity4OutgoingRegisters;
    if (!api?.resolveOutgoingSlots) return [];
    const slots = api.resolveOutgoingSlots(record);
    const projected = asObject(asObject(record).documentData?.outgoingIssuances);
    const errors = [];
    for (const slot of slots) {
      if (!["fixed", "select", "reference", "blocked-unconfigured"].includes(slot.mode)) continue;
      const issuance = projected[slot.slotId];
      if (!issuance) {
        errors.push(slot.mode === "blocked-unconfigured" ? `REGISTER_UNCONFIGURED:${slot.slotId}` : `OUTGOING_NUMBER_REQUIRED:${slot.slotId}`);
        continue;
      }
      if (issuance.status === "legacy-unverified") errors.push(`LEGACY_NUMBER_UNVERIFIED:${slot.slotId}`);
      else if (!["issued", "manual-authoritative"].includes(issuance.status)) errors.push(`OUTGOING_NUMBER_REQUIRED:${slot.slotId}`);
    }
    return errors;
  }

  function validateNaccDispatchEvidence(record) {
    const data = asObject(asObject(record).documentData);
    const errors = [];
    for (const field of ["naccLetterNo", "naccLetterDate", "naccSendMethod", "naccSentDate"]) {
      if (!text(data[field])) errors.push(`missing-${field}`);
    }
    if (text(data.naccSendMethod) === "EMS" && !text(data.naccEms)) errors.push("missing-naccEms");
    if (data.naccTransferKind === "return") {
      if (!text(data.naccBoardNo)) errors.push("missing-naccBoardNo");
      if (!text(data.naccBoardDate)) errors.push("missing-naccBoardDate");
      if (data.boardResolutionAttached !== true) errors.push("missing-boardResolutionAttached");
      if (data.originalDossierAttached !== true) errors.push("missing-originalDossierAttached");
    }
    errors.push(...validateOutgoingIssuanceProjection(record));
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  function validateNotificationEvidence(sourceEvidence) {
    const evidence = asObject(sourceEvidence);
    const method = text(evidence.method).toLowerCase();
    const errors = [];
    if (!["letter", "email", "phone"].includes(method)) errors.push("invalid-notification-method");
    if (!text(evidence.notifiedAt)) errors.push("missing-notifiedAt");
    if (method === "letter") {
      if (!text(evidence.approvedTemplateId)) errors.push("missing-approved-template");
      if (!text(evidence.outgoingLetterNo)) errors.push("missing-outgoing-letter-no");
      if (!text(evidence.letterDate)) errors.push("missing-letter-date");
      if (!text(evidence.recipient)) errors.push("missing-recipient");
    }
    if (method === "email") {
      if (!/@/.test(text(evidence.recipient))) errors.push("invalid-email-recipient");
      if (!text(evidence.evidenceName) && !text(evidence.note)) errors.push("missing-email-evidence");
    }
    if (method === "phone") {
      if (!/\d{5,}/.test(text(evidence.contact))) errors.push("invalid-phone-contact");
      if (!text(evidence.evidenceName) && !text(evidence.note)) errors.push("missing-phone-evidence");
    }
    return Object.freeze({ valid: errors.length === 0, method, errors: Object.freeze(errors) });
  }

  function transitionCase(sourceRecord, action, payload, sourceActor) {
    const original = asObject(sourceRecord);
    const record = clone(original);
    record.workflow = asObject(record.workflow);
    record.documentData = asObject(record.documentData);
    record.assignmentHistory = Array.isArray(record.assignmentHistory) ? record.assignmentHistory : [];
    const input = asObject(payload);
    const actor = actorMetadata(sourceActor);
    const workflow = record.workflow;
    const data = record.documentData;
    const decision = text(data.decision);

    if (action === "officer-sign") {
      const actorError = requireTransitionActor(actor, ["officer", "regional-officer"], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      if (!requireWorkflow(record, [actor.role], actor.role === "regional-officer" ? ["regional-officer"] : ["officer"])) return transitionFailure("INVALID_TRANSITION_STATE", original);
      // fix: regional case ต้องเก็บ intakeOwner เป็น regional-officer ไม่ใช่ officer เดิม
      workflow.intakeOwner = { role: actor.role, officer: actor.name || text(intakeOwnerOf(record, actor.role).officer) };
      workflow.phase = CASE_PHASES.OFFICER_SIGNED;
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "officer-send") {
      const actorError = requireTransitionActor(actor, ["officer", "regional-officer"], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      const expectedStages = actor.role === "regional-officer" ? ["regional-officer"] : ["officer"];
      if (!requireWorkflow(record, [actor.role], expectedStages) || data.officerSignature?.signed !== true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const existingOwner = correctionOwner(record, actor.role);
      const officerError = workflow.correction && !text(workflow.correction.resolvedAt)
        ? requireIntakeOfficer(actor, existingOwner, original)
        : null;
      if (officerError) return officerError;
      const screeningOpinion = text(data.screening?.officerOpinion || data.screening?.decision);
      if (!["new", "suspected_duplicate"].includes(screeningOpinion)) return transitionFailure("INVALID_SCREENING_OPINION", original);
      if (screeningOpinion === "suspected_duplicate" && (!text(data.screening?.linkedCaseId) || !text(data.screening?.note))) return transitionFailure("INCOMPLETE_DUPLICATE_OPINION", original);
      workflow.intakeOwner = existingOwner || intakeOwnerOf(record, actor.role);
      const correction = asObject(workflow.correction);
      if (text(correction.source) === "regional-director" && !text(correction.resolvedAt)) {
        applyWorkflow(record, { owner: "regional-director", stage: "regional-director", phase: CASE_PHASES.REGIONAL_DIRECTOR_REVIEW, complete: false });
        correction.resolvedAt = actor.at;
        correction.resolvedBy = actor.name;
        ensureDecisionHistory(record).push({ text: `เจ้าหน้าที่เขต ${actor.name} แก้ไขและส่ง ผอ.สำนักงาน ป.ป.ท. เขต พิจารณาใหม่`, time: actor.at });
      } else if (["center", "division"].includes(text(correction.source)) && !text(correction.resolvedAt)) {
        applyWorkflow(record, { owner: "center", stage: "center", phase: CASE_PHASES.CENTER_REVIEW, complete: false });
        ensureDecisionHistory(record).push({ text: `เจ้าหน้าที่รับเรื่อง ${actor.name} แก้ไขและส่ง ผอ.ศรร. พิจารณาใหม่`, time: actor.at });
      } else if (actor.role === "regional-officer") {
        applyWorkflow(record, { owner: "regional-director", stage: "regional-director", phase: CASE_PHASES.REGIONAL_DIRECTOR_REVIEW, complete: false });
      } else if (data.reviewRoute === "division") {
        if (!text(data.absenceReasonType) || !text(data.absenceNote)) return transitionFailure("INCOMPLETE_EXCEPTIONAL_ROUTE_REASON", original);
        const owner = text(data.actingOfficer) && data.actingOfficer !== "ผู้อำนวยการกองบริหารคดี" ? "acting" : "division";
        applyWorkflow(record, { owner, stage: owner, phase: CASE_PHASES.DIVISION_REVIEW, complete: false });
      } else applyWorkflow(record, { owner: "center", stage: "center", phase: CASE_PHASES.CENTER_REVIEW, complete: false });
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "center-send") {
      const actorError = requireTransitionActor(actor, ["center"], original);
      if (actorError) return actorError;
      if (!requireWorkflow(record, ["center"], ["center"]) || data.centerSignature?.signed !== true || !text(data.centerOpinion)) return transitionFailure("INVALID_TRANSITION_STATE", original);
      applyWorkflow(record, { owner: "division", stage: "division", phase: CASE_PHASES.DIVISION_REVIEW, complete: false });
      if (workflow.correction && !text(workflow.correction.resolvedAt)) {
        workflow.correction.resolvedAt = actor.at;
        workflow.correction.resolvedBy = actor.name;
      }
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (["center-return", "division-return", "regional-director-return"].includes(action)) {
      const route = {
        "center-return": { roles: ["center"], owners: ["center"], stages: ["center"] },
        "division-return": { roles: ["division", "acting"], owners: ["division", "acting"], stages: ["division", "acting"] },
        "regional-director-return": { roles: ["regional-director"], owners: ["regional-director"], stages: ["regional-director"] }
      }[action];
      const actorError = requireTransitionActor(actor, route.roles, original);
      if (actorError) return actorError;
      if (action === "regional-director-return" && (!actor.region || actor.region !== text(asObject(record.caseData).region))) return transitionFailure("UNAUTHORIZED_TRANSITION", original);
      const reason = text(input.reason);
      if (!reason) return transitionFailure("MISSING_CORRECTION_REASON", original);
      if (!input.correctionApplied || !requireWorkflow(record, route.owners, route.stages)) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const hasSignedEvidence = (Array.isArray(record.documentVersions) ? record.documentVersions : []).some(version => version?.active === true && (["signed", "legacy-unverified"].includes(version?.status) || (version?.status === "draft" && text(version.correctionReason))));
      if (!hasSignedEvidence) return transitionFailure("SIGNED_DOCUMENT_VERSION_REQUIRED", original);
      const owner = correctionOwner(record, action === "regional-director-return" ? "regional-officer" : "officer");
      if (!owner) return transitionFailure("MISSING_INTAKE_OWNER", original);
      delete data.approvedOpinion;
      delete data.approvedLinkedCaseId;
      delete data.approvalStatus;
      delete data.approvedDocumentVersion;
      const source = action === "center-return" ? "center" : action === "division-return" ? "division" : "regional-director";
      const status = action === "center-return"
        ? "ผอ.ศรร. ส่งกลับเจ้าหน้าที่รับเรื่องแก้ไข"
        : action === "division-return"
          ? "ผอ.กบค. ส่งกลับเจ้าหน้าที่รับเรื่องแก้ไข — ต้องเสนอ ผอ.ศรร. ใหม่"
          : "ผอ.สำนักงาน ป.ป.ท. เขต ส่งกลับเจ้าหน้าที่เขตแก้ไข";
      applyWorkflow(record, {
        owner: owner.role,
        stage: owner.role === "regional-officer" ? "regional-officer" : "officer",
        status,
        phase: CASE_PHASES.OFFICER_CORRECTION,
        complete: false,
        correction: { source, reason, requestedAt: actor.at, requestedBy: actor.name, resolvedAt: "", resolvedBy: "" }
      });
      const historyText = action === "center-return"
        ? `[ส่งกลับแก้ไข] ผอ.ศรร. ส่งกลับเจ้าหน้าที่รับเรื่อง ${owner.officer} · เหตุผล: ${reason}`
        : action === "division-return"
          ? `[ส่งกลับแก้ไข] ผอ.กบค. ส่งกลับเจ้าหน้าที่รับเรื่อง ${owner.officer} และขอความเห็น ผอ.ศรร. เพิ่มเติม · เหตุผล: ${reason}`
          : `ผอ.สำนักงาน ป.ป.ท. เขต ส่งกลับเจ้าหน้าที่เขต ${owner.officer} · เหตุผล: ${reason}`;
      ensureDecisionHistory(record).push({ text: historyText, time: actor.at });
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "regional-director-approve") {
      const actorError = requireTransitionActor(actor, ["regional-director"], original);
      if (actorError) return actorError;
      if (!requireWorkflow(record, ["regional-director"], ["regional-director"]) || !text(data.divisionOpinion) || data.divisionSignature?.signed !== true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const caseRegion = text(asObject(record.caseData).region);
      if (!actor.region || actor.region !== caseRegion) return transitionFailure("UNAUTHORIZED_TRANSITION", original);
      const activeSignedVersion = (Array.isArray(record.documentVersions) ? record.documentVersions : []).find(version => version?.active === true && version?.status === "signed");
      if (!activeSignedVersion?.version) return transitionFailure("SIGNED_DOCUMENT_VERSION_REQUIRED", original);
      let owner = correctionOwner(record, "regional-officer");
      // migration: เคสเก่าที่ officer-sign บันทึก intakeOwner เป็น officer ให้แก้เป็น regional-officer อัตโนมัติ
      if (owner && owner.role === "officer" && String(caseRegion||'').includes('เขต')) {
        owner = { role: "regional-officer", officer: owner.officer };
        record.workflow.intakeOwner = owner;
      }
      if (!owner || owner.role !== "regional-officer") return transitionFailure("MISSING_INTAKE_OWNER", original);
      const officerOpinion = text(data.screening?.officerOpinion || data.screening?.decision);
      if (!["new", "suspected_duplicate"].includes(officerOpinion)) return transitionFailure("INVALID_SCREENING_OPINION", original);
      applyWorkflow(record, { owner: owner.role, stage: "officer-finalize-screening", phase: CASE_PHASES.APPROVED_AWAITING_OFFICER_ACTION, complete: false, intakeOwner: owner });
      data.approvedAt = text(data.approvedAt || data.divisionSignature.signedAt || actor.at);
      data.approvedBy = text(data.approvedBy || data.divisionSignature.signerName || actor.name);
      data.approvedOpinion = officerOpinion;
      data.approvedLinkedCaseId = officerOpinion === "suspected_duplicate" ? text(data.screening?.linkedCaseId) : "";
      data.approvedDocumentVersion = activeSignedVersion.version;
      data.approvalStatus = "signed_awaiting_officer_action";
      if (workflow.correction && !text(workflow.correction.resolvedAt)) {
        workflow.correction.resolvedAt = actor.at;
        workflow.correction.resolvedBy = actor.name;
      }
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "approve") {
      const roles = ["division", "acting"];
      const actorError = requireTransitionActor(actor, roles, original);
      if (actorError) return actorError;
      if (!requireWorkflow(record, roles, roles) || data.divisionSignature?.signed !== true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const owner = intakeOwnerOf(record, "officer");
      const officerOpinion = text(data.screening?.officerOpinion || data.screening?.decision);
      if (!["new", "suspected_duplicate"].includes(officerOpinion)) return transitionFailure("INVALID_SCREENING_OPINION", original);
      if (officerOpinion === "new" && ["18/1ก", "18/1ข", "18/4"].includes(text(data.decision)) && !text(data.caseNumber)) return transitionFailure("CASE_NUMBER_REQUIRED", original);
      if (officerOpinion === "suspected_duplicate" && !text(data.screening?.linkedCaseId)) return transitionFailure("MISSING_DUPLICATE_TARGET", original);
      applyWorkflow(record, {
        owner: owner.role,
        stage: "officer-finalize-screening",
        phase: CASE_PHASES.APPROVED_AWAITING_OFFICER_ACTION,
        complete: false,
        intakeOwner: owner
      });
      data.approvedAt = text(data.approvedAt || data.divisionSignature.signedAt || actor.at);
      data.approvedBy = text(data.approvedBy || data.divisionSignature.signerName || actor.name);
      data.approvedOpinion = officerOpinion;
      data.approvedLinkedCaseId = officerOpinion === "suspected_duplicate" ? text(data.screening.linkedCaseId) : "";
      const activeSignedVersion = (Array.isArray(record.documentVersions) ? record.documentVersions : []).find(version => version?.active === true && version?.status === "signed");
      if (!activeSignedVersion?.version) return transitionFailure("SIGNED_DOCUMENT_VERSION_REQUIRED", original);
      data.approvedDocumentVersion = activeSignedVersion.version;
      data.approvalStatus = "signed_awaiting_officer_action";
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "officer-finalize-screening") {
      const owner = intakeOwnerOf(record);
      const actorError = requireTransitionActor(actor, [owner.role], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      const officerError = requireIntakeOfficer(actor, correctionOwner(record, owner.role), original);
      if (officerError) return officerError;
      if (text(data.approvalStatus) === "officer_action_completed" || text(data.duplicateMergedAt)) return transitionResult(true, "ALREADY_CONFIRMED", record);
      if (!requireWorkflow(record, [owner.role], ["officer-finalize-screening"]) || workflow.complete === true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const activeSignedVersion = (Array.isArray(record.documentVersions) ? record.documentVersions : []).find(version => version?.active === true && version?.status === "signed");
      if (data.divisionSignature?.signed !== true || !text(data.approvedAt) || data.approvalStatus !== "signed_awaiting_officer_action" || !activeSignedVersion || activeSignedVersion.version !== data.approvedDocumentVersion) return transitionFailure("SCREENING_APPROVAL_REQUIRED", original);
      if (data.approvedOpinion === "suspected_duplicate") {
        const targetId = text(data.approvedLinkedCaseId);
        const target = asObject(input.linkedCaseRecord);
        if (!targetId || !target.caseData) return transitionFailure("DUPLICATE_TARGET_NOT_FOUND", original);
        if (text(target.caseData.id) !== targetId || targetId === text(asObject(record.caseData).id)) return transitionFailure("INVALID_DUPLICATE_TARGET", original);
        const updatedTarget = clone(target);
        updatedTarget.documentData = asObject(updatedTarget.documentData);
        updatedTarget.documentData.mergedDuplicates = Array.isArray(updatedTarget.documentData.mergedDuplicates) ? updatedTarget.documentData.mergedDuplicates : [];
        updatedTarget.decisionHistory = Array.isArray(updatedTarget.decisionHistory) ? updatedTarget.decisionHistory : [];
        if (!updatedTarget.documentData.mergedDuplicates.some(item => text(item?.caseId) === text(asObject(record.caseData).id))) {
          updatedTarget.documentData.mergedDuplicates.push({ caseId: text(asObject(record.caseData).id), at: actor.at, note: text(data.screening?.additionalInfo) });
          updatedTarget.decisionHistory.push({ text: `[รับเรื่องรวม] รับ ${text(asObject(record.caseData).id)} รวมเข้า ${targetId}`, time: actor.at });
        }
        data.duplicateMergedAt = actor.at;
        data.duplicateMergedBy = actor.name;
        data.duplicatePackagePreparedAt = "";
        data.duplicatePackagePreparedBy = "";
        applyWorkflow(record, { owner: owner.role, stage: "officer-dispatch", status: "รวมกับเรื่องเดิมแล้ว — รอจัดชุดเอกสารและจัดส่งไปยังเขตที่รับผิดชอบ", phase: CASE_PHASES.APPROVED_AWAITING_OFFICER_ACTION, complete: false });
        ensureDecisionHistory(record).push({ text: `[รวมเรื่อง] ${text(asObject(record.caseData).id)} รวมกับ ${targetId} ตามผลอนุมัติ`, time: actor.at });
        data.approvalStatus = "officer_action_completed";
        return transitionResult(true, "CONFIRMED", record, [], [{ type: "UPSERT_LINKED_CASE", caseId: targetId, record: updatedTarget }]);
      } else if (data.approvedOpinion === "new") {
        const stage = decision === "send-nacc" ? "nacc-dispatch" : "officer-dispatch";
        applyWorkflow(record, { owner: owner.role, stage, phase: CASE_PHASES.APPROVED_AWAITING_OFFICER_ACTION, complete: false });
      } else return transitionFailure("INVALID_APPROVED_SCREENING_OPINION", original);
      data.approvalStatus = "officer_action_completed";
      return transitionResult(true, "CONFIRMED", record);
    }

    if (action === "confirm-duplicate-package") {
      const owner = correctionOwner(record, "officer");
      const actorError = requireTransitionActor(actor, owner ? [owner.role] : [], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      const officerError = requireIntakeOfficer(actor, owner, original);
      if (officerError) return officerError;
      if (text(data.duplicatePackagePreparedAt)) return transitionResult(true, "ALREADY_CONFIRMED", record);
      if (!requireWorkflow(record, [owner.role], ["officer-dispatch"]) || data.approvedOpinion !== "suspected_duplicate" || !text(data.duplicateMergedAt) || !text(data.approvedLinkedCaseId)) return transitionFailure("INVALID_TRANSITION_STATE", original);
      data.duplicatePackagePreparedAt = actor.at;
      data.duplicatePackagePreparedBy = actor.name;
      ensureDecisionHistory(record).push({ text: `[จัดชุดเอกสาร] เจ้าหน้าที่ ${actor.name} ยืนยันจัดชุดเอกสารของ ${text(asObject(record.caseData).id)} และ ${text(data.approvedLinkedCaseId)} ครบแล้ว`, time: actor.at });
      return transitionResult(true, "CONFIRMED", record);
    }

    if (action === "confirm-dispatch") {
      const storedOwner = intakeOwnerOf(record);
      const activeOwnerRole = ["officer", "regional-officer"].includes(text(workflow.owner))
        ? text(workflow.owner)
        : storedOwner.role;
      const owner = { ...storedOwner, role: activeOwnerRole };
      const actorError = requireTransitionActor(actor, [owner.role], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      if (text(data.dispatchConfirmedAt) || ["activity5-dispatch", "relief-dispatched", "notification-confirmed"].includes(text(workflow.stage))) {
        return transitionResult(true, "ALREADY_CONFIRMED", record);
      }
      if (!requireWorkflow(record, [owner.role], ["officer-dispatch"]) || workflow.complete === true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const officerError = requireIntakeOfficer(actor, owner, original);
      if (officerError) return officerError;
      if (data.approvedOpinion === "suspected_duplicate" && !text(data.duplicatePackagePreparedAt)) return transitionFailure("DUPLICATE_PACKAGE_NOT_PREPARED", original);
      workflow.intakeOwner = owner;

      if (decision === "not-accept") {
        const evidence = input.notificationEvidence || data.notificationEvidence;
        const validation = validateNotificationEvidence(evidence);
        if (!validation.valid) return transitionFailure("INVALID_NOTIFICATION_EVIDENCE", original, [...validation.errors]);
        data.notificationEvidence = clone(evidence);
        data.notificationConfirmedAt = actor.at;
        applyWorkflow(record, { owner: owner.role, stage: "notification-confirmed", phase: CASE_PHASES.TERMINAL, complete: true });
        return transitionResult(true, "CONFIRMED", record);
      }

      if (!["18/1ก", "18/1ข", "18/4", "58/2"].includes(decision)) return transitionFailure("UNSUPPORTED_COMPLETION_BRANCH", original);
      const validation = validateOfficialDispatchEvidence(record);
      if (!validation.valid) return transitionFailure("INVALID_DISPATCH_EVIDENCE", original, [...validation.errors]);
      data.dispatchConfirmedAt = actor.at;
      const activity5 = ["18/1ก", "18/1ข", "18/4"].includes(decision);
      applyWorkflow(record, {
        owner: owner.role,
        stage: activity5 ? "activity5-dispatch" : "relief-dispatched",
        phase: CASE_PHASES.TERMINAL,
        complete: true
      });
      return transitionResult(true, "CONFIRMED", record, [], activity5 ? [{ type: "CREATE_A5_PENDING" }] : []);
    }

    if (action === "nacc-dispatch-confirm") {
      const owner = intakeOwnerOf(record);
      const actorError = requireTransitionActor(actor, [owner.role], original);
      if (actorError) return actorError;
      const scopeError = requireRegionalActorScope(actor, original);
      if (scopeError) return scopeError;
      if (text(data.naccDispatchConfirmedAt) || (workflow.stage === "nacc-dispatch" && workflow.complete === true)) return transitionResult(true, "ALREADY_CONFIRMED", record);
      if (decision !== "send-nacc" || !requireWorkflow(record, [owner.role], ["nacc-dispatch"]) || workflow.complete === true) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const validation = validateNaccDispatchEvidence(record);
      if (!validation.valid) return transitionFailure("INVALID_NACC_DISPATCH_EVIDENCE", original, [...validation.errors]);
      data.naccDispatchConfirmedAt = actor.at;
      applyWorkflow(record, { owner: owner.role, stage: "nacc-dispatch", phase: CASE_PHASES.TERMINAL, complete: true });
      return transitionResult(true, "CONFIRMED", record);
    }

    if (action === "recall-assignment") {
      const actorError = requireTransitionActor(actor, ["admin"], original);
      if (actorError) return actorError;
      if (isTerminalCase(record)) return transitionFailure("TERMINAL_CASE_LOCKED", original);
      if (workflow.correction && !text(workflow.correction.resolvedAt)) return transitionFailure("CORRECTION_OWNER_LOCKED", original);
      const previousOfficer = text(data.assignedOfficer);
      const reason = text(input.reason);
      if (!previousOfficer || !reason) return transitionFailure("INVALID_RECALL", original);
      data.previousOfficer = previousOfficer;
      data.previousBackupOfficer = text(data.backupOfficer);
      data.assignedOfficer = "";
      data.backupOfficer = "";
      asObject(record.caseData).assignedOfficer = "";
      record.assignmentHistory.push({
        action: "recall",
        previousOfficer,
        newOfficer: "",
        previousBackupOfficer: data.previousBackupOfficer,
        newBackupOfficer: "",
        reason,
        actor: actor.name,
        time: actor.at
      });
      applyWorkflow(record, { owner: "admin", stage: "admin", status: "รอมอบหมายใหม่", phase: CASE_PHASES.OFFICER_CORRECTION, complete: false });
      return transitionResult(true, "TRANSITIONED", record);
    }

    if (action === "assign") {
      const actorError = requireTransitionActor(actor, ["admin"], original);
      if (actorError) return actorError;
      if (isTerminalCase(record)) return transitionFailure("TERMINAL_CASE_LOCKED", original);
      if (!requireWorkflow(record, ["admin"], ["admin", "admin-registry", "admin-assign"])) return transitionFailure("INVALID_TRANSITION_STATE", original);
      const assignedOfficer = text(input.assignedOfficer || data.assignedOfficer);
      const backupOfficer = text(input.backupOfficer || data.backupOfficer);
      if (!assignedOfficer || assignedOfficer === backupOfficer) return transitionFailure("INVALID_ASSIGNMENT", original);
      const previousOfficer = text(data.previousOfficer);
      const previousBackupOfficer = text(data.previousBackupOfficer);
      data.assignedOfficer = assignedOfficer;
      data.backupOfficer = backupOfficer;
      data.previousOfficer = "";
      data.previousBackupOfficer = "";
      asObject(record.caseData).assignedOfficer = assignedOfficer;
      record.assignmentHistory.push({
        action: previousOfficer ? "reassign" : "assign",
        previousOfficer,
        newOfficer: assignedOfficer,
        previousBackupOfficer,
        newBackupOfficer: backupOfficer,
        actor: actor.name,
        time: actor.at
      });
      applyWorkflow(record, {
        owner: "officer",
        stage: "officer",
        status: "รอเจ้าหน้าที่พิจารณา",
        phase: CASE_PHASES.OFFICER_DRAFT,
        complete: false,
        intakeOwner: { role: "officer", officer: assignedOfficer }
      });
      return transitionResult(true, "TRANSITIONED", record);
    }

    return transitionFailure("UNKNOWN_TRANSITION", original);
  }

  function registryPlan(channel, region) {
    const ch = String(channel || "").toLowerCase();
    const central = !String(region || "").includes("เขต");
    if (ch.includes("walk")) return central ? ["kbk", "srr"] : ["srr"];
    if (ch.includes("1206")) return ["srr"];
    if (ch.includes("โทร")) return [];
    if (ch.includes("จดหมาย")) return central ? ["office", "kbk", "srr"] : ["srr"];
    if (ch.includes("หนังสือจากหน่วยงาน")) return ["kbk", "srr"];
    if (ch.includes("62")) return ["office", "kbk", "srr"];
    if (ch.includes("หนังสือ")) return central ? ["office", "kbk", "srr"] : ["srr"];
    return ["kbk", "srr"];
  }
  const REGISTRY_KEY_LABELS = Object.freeze({
    office: "สารบรรณกลาง",
    kbk: "กบค.",
    srr: "ศรร."
  });
  function registryCompleteness(caseData) {
    const plan = registryPlan(caseData && caseData.channel, caseData && caseData.region);
    const registry = (caseData && caseData.registry) || {};
    const obtained = plan.filter(key => !!registry[key]);
    return {
      plan,
      obtained,
      required: plan.length,
      complete: obtained.length,
      isComplete: obtained.length === plan.length,
      missing: plan.filter(key => !registry[key])
    };
  }

  const api = Object.freeze({
    registryPlan,
    registryCompleteness,
    REGISTRY_KEY_LABELS,
    DECISIONS,
    DOCUMENT_CATALOG,
    REVIEW_RECORD_ID,
    LEGACY_REVIEW_RECORD_ID,
    FORM3_NACC_REASONS,
    NACC_API_SEEDS,
    isNaccApiCase,
    normalizeNaccApiIntake,
    naccIntakeAlerts,
    toThaiDigits,
    renderOfficialDocumentBindings,
    migrateForm3Reasons,
    confirmForm3ReasonReview,
    isContactable,
    contactabilityPredicate: isContactable,
    resolveDocumentRequirements,
    signedSnapshotDocumentIds,
    validateDecisionRecord,
    validateDispatch,
    normalizeLegacyDocumentEvidence,
    applyDocumentSourceEdits,
    documentSourceSectionLocked,
    recordDocumentSignature,
    returnDocumentForCorrection,
    isSignedDocumentLocked,
    CASE_PHASES,
    isTerminalCase,
    validateNotificationEvidence,
    transitionCase
  });
  root.ECMISActivity4DocumentRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
