/*
 * E-CMIS กิจกรรมที่ 5 — แบบฟอร์มซีรีส์ 2 (ชั้นไต่สวนเบื้องต้น)
 * 2-01 บันทึกการปฏิบัติงาน · 2-03 ขอทราบรายละเอียดคำร้องเพิ่มเติม · 2-04 ขอทราบข้อเท็จจริง (ป.ป.ช. มอบหมาย)
 * 2-05 สอบถามเรื่องร้องเรียนประเด็นเดียวกัน · 2-06 บันทึกคำให้การผู้ร้องเรียน/พยาน
 *
 * เนื้อหากระดาษ = verbatim จากแบบฟอร์มต้นฉบับ (.doc) — boilerplate เป็น static text,
 * field (input ฝั่งซ้าย) = เฉพาะจุดเส้นประ/ช่องว่างของแบบ
 * Lifecycle: DRAFT → SUBMITTED (ผ่าน executePrelimDocumentAction)
 */
(function initializeActivity5PrelimDocuments(root) {
  const DOC_IDS = Object.freeze({
    WORK_LOG: "S2_01_WORK_LOG",
    ADDITIONAL_REQUEST: "S2_03_ADDITIONAL_REQUEST",
    NACC_FACTS: "S2_04_NACC_FACT_REQUEST",
    DUPLICATE_QUERY: "S2_05_DUPLICATE_QUERY",
    STATEMENT: "S2_06_STATEMENT_RECORD",
    STATEMENT_ADDL: "S2_07_STATEMENT_ADDITIONAL",
    FACT_REQUEST: "S2_08_FACT_EVIDENCE_REQUEST",
    FACT_FOLLOWUP: "S2_09_FACT_FOLLOWUP",
    FACT_ADDL: "S2_10_FACT_ADDITIONAL",
    COOPERATION: "S2_11_COOPERATION_REQUEST",
    DOSSIER_LIST: "S2_14_DOSSIER_LIST",
    AGENDA_PROPOSAL: "S3_02_AGENDA_PROPOSAL"
  });

  const MANIFEST = Object.freeze([
    { formId: DOC_IDS.WORK_LOG, code: "2-01", title: "แบบบันทึกการปฏิบัติงานการไต่สวน", shortLabel: "บันทึกปฏิบัติงาน", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.ADDITIONAL_REQUEST, code: "2-03", title: "แบบหนังสือขอทราบรายละเอียดตามคำร้องเพิ่มเติม (คดีประพฤติมิชอบ)", shortLabel: "ขอทราบคำร้องเพิ่มเติม", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.NACC_FACTS, code: "2-04", title: "แบบหนังสือขอทราบข้อเท็จจริงเพิ่มเติมจากผู้กล่าวหา กรณีสำนักงาน ป.ป.ช. มอบหมาย", shortLabel: "ขอทราบข้อเท็จจริง (ม.62)", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.DUPLICATE_QUERY, code: "2-05", title: "แบบหนังสือสอบถามการดำเนินการเรื่องร้องเรียนในประเด็นเดียวกัน", shortLabel: "สอบถามเรื่องซ้ำ", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT, code: "2-06", title: "แบบบันทึกคำให้การของผู้ร้องเรียนหรือพยาน (ชั้นไต่สวนเบื้องต้น)", shortLabel: "บันทึกคำให้การ", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT_ADDL, code: "2-07", title: "แบบบันทึกคำให้การของผู้ร้องเรียนหรือพยานเพิ่มเติม (ชั้นไต่สวนเบื้องต้น)", shortLabel: "คำให้การเพิ่มเติม", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.FACT_REQUEST, code: "2-08", title: "แบบหนังสือขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐาน", shortLabel: "ขอทราบข้อเท็จจริง+เอกสาร", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.FACT_FOLLOWUP, code: "2-09", title: "แบบหนังสือติดตามผลการขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐาน", shortLabel: "ติดตามผลขอทราบ", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.FACT_ADDL, code: "2-10", title: "แบบหนังสือขอทราบข้อเท็จจริงและเอกสารพยานหลักฐานเพิ่มเติม", shortLabel: "ขอทราบเพิ่มเติม", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.COOPERATION, code: "2-11", title: "แบบหนังสือขอความร่วมมือในการปฏิบัติราชการ", shortLabel: "ขอความร่วมมือ", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.DOSSIER_LIST, code: "2-14", title: "แบบบัญชีสำนวนการไต่สวนเบื้องต้น", shortLabel: "บัญชีสำนวน", stage: "a5-prelim", authorRole: "investigator" },
    { formId: DOC_IDS.AGENDA_PROPOSAL, code: "3-02", title: "แบบบันทึกเสนอเรื่องเพื่อบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท. (คณะอนุกลั่นกรองฯ)", shortLabel: "เสนอบรรจุวาระ", stage: "a7-213", authorRole: "clerk" }
  ]);

  const ACTIONS = Object.freeze(
    MANIFEST.flatMap(item => [`prelim-save:${item.formId}`, `prelim-submit:${item.formId}`])
  );

  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const text = value => typeof value === "string" ? value.trim() : "";
  const copy = value => JSON.parse(JSON.stringify(value ?? {}));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const show = value => escapeHtml(text(value));
  const dot = (value, width, placeholder) => {
    const filled = text(value);
    if (filled) return escapeHtml(filled);
    return `<span class="a5-dotline">${placeholder || ".".repeat(width || 20)}</span>`;
  };
  const garuda = () => root.ECMISActivity5PostResolution?.GARUDA_IMG || "";

  function getMeta(formId) {
    return MANIFEST.find(item => item.formId === formId) || null;
  }

  function normalizeState(state = {}) {
    const s = copy(state);
    s.prelimDocuments = object(s.prelimDocuments);
    return s;
  }

  function defaultPayload(formId, state = {}) {
    const intake = object(state.inquiry).intake || {};
    const common = {
      letterNo: "", issuedAt: "", caseRefNo: text(state.caseData?.trackingCode),
      ownerDivision: text(intake.unit), ownerPhone: "", ownerFax: "", ownerName: ""
    };
    if (formId === DOC_IDS.WORK_LOG) {
      return { ...common, caseSubject: text(state.caseData?.subject), complainantHidden: true, complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), recorder: "", entries: [] };
    }
    if (formId === DOC_IDS.STATEMENT) {
      return {
        ...common,
        caseTitle: text(state.caseData?.subject), office: "", bookNo: "",
        recordedAt: "", place: "", respondentName: text(state.caseData?.respondent || state.caseData?.agency),
        recorderName: "",
        deponent: { name: "", position: "", age: "", role: "ผู้ร้องเรียน", race: "ไทย", nationality: "ไทย", religion: "", occupation: "", idCard: "", idCardOther: "", idExpiry: "", fatherName: "", motherName: "", registryAddress: { houseNo: "", soi: "", road: "", subdistrict: "", district: "", province: "", nearby: "" }, currentAddress: { houseNo: "", soi: "", road: "", subdistrict: "", district: "", province: "", nearby: "" }, phone: "", contactPerson: "", contactPhone: "", relationToParties: "" },
        qa: [], documentsSubmitted: [], readConfirmation: "อ่านให้ฟังแล้ว"
      };
    }
    // letters 2-03 / 2-04 / 2-05
    const base = {
      ...common,
      addressee: text(state.caseData?.complainant),
      referenceNote: "",
      investigatorName: "", appointmentDate: "", appointmentTime: "", appointmentPlace: "", contactPhone: ""
    };
    if (formId === DOC_IDS.ADDITIONAL_REQUEST) {
      return { ...base, allegationBase: "ประพฤติมิชอบ", respondentAgency: text(state.caseData?.agency), question1: "", question2: "", personRoleLabel: "ผู้ร้องเรียน" };
    }
    if (formId === DOC_IDS.NACC_FACTS) {
      return { ...base, allegationBase: "ทุจริตต่อหน้าที่", respondentAgency: text(state.caseData?.agency), question1: "", question2: "" };
    }
    if (formId === DOC_IDS.DUPLICATE_QUERY) {
      return { ...base, accusedOfficer: text(state.caseData?.respondent || state.caseData?.agency), accusedAgency: text(state.caseData?.agency), incidentSummary: "", queriedAgency: "" };
    }
    if (formId === DOC_IDS.STATEMENT_ADDL) {
      return { ...common, deponentName: "", deponentRole: "ผู้ร้องเรียน", recordRound: "๑", caseTitle: text(state.caseData?.subject), place: "", recordedAt: "", recorderName: "", confirmOriginalAnswer: "", additionalPointsAnswer: "", readConfirmation: "อ่านให้ฟังแล้ว" };
    }
    if (formId === DOC_IDS.FACT_REQUEST) {
      return { ...base, recipientLabel: "", incidentSummary: "", requestItems1: "", requestItems2: "", evidenceItemsNote: "", duplicateQuestionAnswer: "" };
    }
    if (formId === DOC_IDS.FACT_FOLLOWUP) {
      return { ...base, followupRound: "๑", referenceNote2: "", originalDeadlineDays: "", newDeadlineDays: "" };
    }
    if (formId === DOC_IDS.FACT_ADDL) {
      return { ...base, referenceNote2: "", additionalPoint1: "", additionalPoint2: "" };
    }
    if (formId === DOC_IDS.COOPERATION) {
      return { ...base, coordinatorName: "", coordinatorPhone: "", missionSubject: "", cooperationPoints: "" };
    }
    if (formId === DOC_IDS.DOSSIER_LIST) {
      return { ...common, officeName: "", items: [] };
    }
    if (formId === DOC_IDS.AGENDA_PROPOSAL) {
      return { ...letterCommon(), committeeNo: "", secretaryMeetingNo: "", secretaryMeetingDate: "", ownerDivision: text(state.inquiry?.intake?.unit), countAdditional: "", countNacc: "", countNotAccepted: "", signerName: "", signerCommitteeNo: "" };
    }
    return { ...base };
  }
  function letterCommon() { return { letterNo: "", issuedAt: "", caseRefNo: "", ownerSignerName: "", ownerDivision: "", ownerPhone: "", ownerFax: "", ownerName: "", contactPhone: "" }; }

  // ---------- actions ----------
  function executePrelimDocumentAction(sourceState, actor = {}, command = {}) {
    const formId = text(command.formId);
    const meta = getMeta(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: sourceState, messageTh: "ไม่พบแบบเอกสาร" };

    if (!["save","submit","addrow","delrow"].includes(String(command.action || "save"))) return { ok: false, error: "UNSUPPORTED_ACTION", state: sourceState, messageTh: "ไม่รองรับการดำเนินการนี้" };    const s = normalizeState(sourceState);
    const now = text(command.at) || new Date().toISOString();
    const current = object(s.prelimDocuments[formId]);
    const payload = command.payload && typeof command.payload === "object" ? copy(command.payload) : object(current.fields);

    if (!text(actor.id)) return { ok: false, error: "FORBIDDEN_ACTOR", state: sourceState, messageTh: "ไม่พบผู้ดำเนินการและบทบาทที่ผ่านการยืนยัน" };
    if (text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", state: s, messageTh: "ผู้รับผิดชอบสำนวนเท่านั้นที่จัดทำเอกสารนี้ได้" };
    }
    if (!s.prelimDocuments[formId] && String(command.action || "save") !== "submit") {
      s.prelimDocuments[formId] = { formId, status: "DRAFT", createdAt: now, updatedAt: now, fields: payload };
      return { ok: true, state: s, code: "PRELIM_DOC_DRAFT_CREATED" };
    }
    if (text(command.action) === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", state: s, messageTh: "เอกสารถูกส่งแล้ว" };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", state: s, missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}` };
      s.prelimDocuments[formId] = { ...current, status: "SUBMITTED", submittedAt: now, submittedBy: text(actor.id), fields: payload };
      return { ok: true, state: s, code: "PRELIM_DOC_SUBMITTED" };
    }
    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", state: s, messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้" };
    s.prelimDocuments[formId] = { ...current, updatedAt: now, updatedBy: text(actor.id), fields: payload };
    return { ok: true, state: s, code: "PRELIM_DOC_DRAFT_SAVED" };
  }

  function validateRequired(formId, p) {
    const missing = [];
    const need = (...fields) => fields.forEach(f => { if (!text(p[f])) missing.push(f); });
    if (formId === DOC_IDS.WORK_LOG) need("caseSubject", "recorder");
    else if (formId === DOC_IDS.STATEMENT || formId === DOC_IDS.STATEMENT_ADDL) need("caseTitle", "recordedAt");
    else if (formId === DOC_IDS.DOSSIER_LIST) need("caseRefNo");
    else if (formId === DOC_IDS.AGENDA_PROPOSAL) need("letterNo", "issuedAt", "committeeNo");
    else if ([DOC_IDS.FACT_REQUEST, DOC_IDS.FACT_FOLLOWUP, DOC_IDS.FACT_ADDL, DOC_IDS.COOPERATION].includes(formId)) {
      need("letterNo", "issuedAt");
      if (formId === DOC_IDS.COOPERATION) need("coordinatorName");
      else if (formId !== DOC_IDS.FACT_ADDL) need("referenceNote2" in p ? "referenceNote2" : "referenceNote");
      else need("referenceNote2", "additionalPoint1");
    }
    else need("letterNo", "issuedAt", "addressee");
    return missing;
  }

  // ---------- editor (ฝั่งซ้าย) ----------
  const field = (label, name, value, type = "input") => `<label class="a5-field-block${type === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${type === "textarea" ? `<textarea class="a5-textarea" data-a5-prelim-path="${name}" rows="2">${escapeHtml(value)}</textarea>` : `<input type="text" class="a5-input" data-a5-prelim-path="${name}" value="${escapeHtml(value)}">`}</label>`;
  const addrFields = (prefix, addr = {}) => [
    field("เลขที่", `${prefix}.houseNo`, addr.houseNo), field("ซอย", `${prefix}.soi`, addr.soi),
    field("ถนน", `${prefix}.road`, addr.road), field("ตำบล/แขวง", `${prefix}.subdistrict`, addr.subdistrict),
    field("อำเภอ/เขต", `${prefix}.district`, addr.district), field("จังหวัด", `${prefix}.province`, addr.province),
    field("สถานที่ใกล้เคียง", `${prefix}.nearby`, addr.nearby)
  ].join("");

  function renderPrelimEditorA5(state = {}, formId, options = {}) {
    const meta = getMeta(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const disabledAttr = editable ? "" : "disabled";
    const doc = object(normalizeState(state).prelimDocuments[formId]);
    const f = Object.assign(defaultPayload(formId, state), object(doc.fields));
    const dis = attr => editable ? attr : attr.replace(/data-a5-prelim-path="[^"]*"/g, 'data-a5-prelim-x="1"').replace("<input ", "<input disabled ").replace("<textarea ", "<textarea disabled ");
    let body = "";
    if (formId === DOC_IDS.WORK_LOG) {
      body = `
<h3>บันทึกการปฏิบัติงานการไต่สวนเบื้องต้น</h3>
<div class="a5-form-grid">
  ${field("เรื่องที่", "caseSubject", f.caseSubject)}
  ${field("ผู้กล่าวหา/ร้องเรียน (ปกปิดชื่อ)", "complainant", f.complainant)}
  ${field("ผู้ถูกร้องเรียน", "respondent", f.respondent)}
  ${field("เจ้าของสำนวน/ผู้บันทึก", "recorder", f.recorder)}
</div>
<p class="ws-policy-note">ตารางบันทึกการดำเนินการ — เพิ่มแถวได้ด้านล่าง (วัน เดือน ปี / การดำเนินการ / จำนวนเอกสารพยานหลักฐาน / หมายเหตุ)</p>
<div data-a5-prelim-rows="entries">${(f.entries || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field("วัน เดือน ปี", `entries.${i}.date`, row.date)}${field("การดำเนินการ", `entries.${i}.action`, row.action, "textarea")}
  ${field("จำนวนเอกสารพยานหลักฐาน", `entries.${i}.evidenceCount`, row.evidenceCount)}${field("หมายเหตุ", `entries.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-prelim-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-prelim-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายการดำเนินการ</button>
<section><h3>หมายเหตุท้ายแบบ (แสดงบนกระดาษ)</h3><p class="ws-policy-note">๑. ให้จัดทำบันทึกฯ ประจำเรื่องกล่าวหาร้องเรียนแต่ละเรื่อง · ๒. บันทึกการดำเนินการทุกครั้ง พร้อมลงลายมือชื่อ · ๓. เสนอผู้บังคับบัญชาต้องแนบบันทึกฯ ทุกครั้ง · ๔. ผู้บังคับบัญชาบันทึกสั่งการ/ความเห็นในช่องหมายเหตุ</p></section>`;
    } else if (formId === DOC_IDS.STATEMENT) {
      const d = object(f.deponent); const reg = object(d.registryAddress); const cur = object(d.currentAddress);
      body = `
<h3>บันทึกคำให้การ/ถ้อยคำของผู้กล่าวหา/ร้องเรียน หรือ พยาน</h3>
<div class="a5-form-grid">
  ${field("เรื่อง (การไต่สวนเบื้องต้นกรณีกล่าวหา...)", "caseTitle", f.caseTitle, "textarea")}
  ${field("สำนัก", "office", f.office)}${field("เลขที่", "bookNo", f.bookNo)}
  ${field("วันที่บันทึก", "recordedAt", f.recordedAt)}${field("สถานที่บันทึก", "place", f.place)}
  ${field("ชื่อผู้ถูกร้องเรียน", "respondentName", f.respondentName)}${field("ต่อหน้า (ผู้บันทึก)", "recorderName", f.recorderName)}
</div>
<h3>ข้อมูลผู้ให้ถ้อยคำ</h3>
<div class="a5-form-grid">
  ${field("ชื่อผู้ให้ถ้อยคำ (นาย/นาง/นางสาว/ยศ)", "deponent.name", d.name)}
  ${field("ตำแหน่ง/อาชีพปัจจุบัน", "deponent.position", d.position)}
  ${field("อายุ (ปี)", "deponent.age", d.age)}
  <label class="a5-field-block"><span>เป็น</span><select class="a5-input" data-a5-prelim-path="deponent.role"><option value="ผู้ร้องเรียน"${d.role === "ผู้ร้องเรียน" ? " selected" : ""}>ผู้ร้องเรียน</option><option value="พยาน"${d.role === "พยาน" ? " selected" : ""}>พยาน</option></select></label>
  ${field("เชื้อชาติ", "deponent.race", d.race)}${field("สัญชาติ", "deponent.nationality", d.nationality)}
  ${field("ศาสนา", "deponent.religion", d.religion)}${field("อาชีพ", "deponent.occupation", d.occupation)}
  ${field("เลขบัตรประชาชน", "deponent.idCard", d.idCard)}${field("บัตรอื่น/วันหมดอายุ", "deponent.idExpiry", d.idExpiry)}
  ${field("บิดาชื่อ", "deponent.fatherName", d.fatherName)}${field("มารดาชื่อ", "deponent.motherName", d.motherName)}
</div>
<h4>ภูมิลำเนาตามทะเบียนบ้าน</h4><div class="a5-form-grid">${addrFields("deponent.registryAddress", reg)}</div>
<h4>ที่อยู่ปัจจุบัน</h4><div class="a5-form-grid">${addrFields("deponent.currentAddress", cur)}</div>
<div class="a5-form-grid">
  ${field("โทรศัพท์", "deponent.phone", d.phone)}
  ${field("บุคคลที่ติดต่อได้", "deponent.contactPerson", d.contactPerson)}
  ${field("โทรศัพท์ผู้ติดต่อ", "deponent.contactPhone", d.contactPhone)}
  ${field("เกี่ยวข้องอย่างไรกับคู่กรณี", "deponent.relationToParties", d.relationToParties, "textarea")}
</div>
<h3>ถาม-ตอบ</h3>
<div data-a5-prelim-rows="qa">${(f.qa || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field(`ถาม (${i + 1})`, `qa.${i}.q`, row.q, "textarea")}${field(`ตอบ (${i + 1})`, `qa.${i}.a`, row.a, "textarea")}
  <button type="button" class="ws-button secondary" data-a5-prelim-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบคู่ถามตอบ</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-prelim-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มคู่ถาม-ตอบ</button>
<div class="a5-form-grid">${field("การอ่านคำให้การ", "readConfirmation", f.readConfirmation)}</div>`;
    } else if (formId === DOC_IDS.STATEMENT_ADDL) {
      body = `
<h3>บันทึกคำให้การ (เพิ่มเติม)</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล ผู้ให้ถ้อยคำ", "deponentName", f.deponentName)}
  <label class="a5-field-block"><span>เป็น</span><select class="a5-input" data-a5-prelim-path="deponentRole"><option value="ผู้ร้องเรียน"${f.deponentRole === "ผู้ร้องเรียน" ? " selected" : ""}>ผู้ร้องเรียน</option><option value="พยาน"${f.deponentRole === "พยาน" ? " selected" : ""}>พยาน</option></select></label>
  ${field("ครั้งที่", "recordRound", f.recordRound)}
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("สถานที่บันทึกถ้อยคำ", "place", f.place)}
  ${field("วัน เดือน ปี", "recordedAt", f.recordedAt)}
  ${field("ชื่อ-สกุล/ตำแหน่งผู้บันทึก", "recorderName", f.recorderName, "textarea")}
</div>
<h3>ถาม-ตอบ</h3>
<div class="a5-form-grid">
  ${field("ตอบ (ยืนยันคำให้การเดิม)", "confirmOriginalAnswer", f.confirmOriginalAnswer, "textarea")}
  ${field("ตอบ (ประเด็นให้ถ้อยคำเพิ่มเติม)", "additionalPointsAnswer", f.additionalPointsAnswer, "textarea")}
</div>`;
    } else if (formId === DOC_IDS.FACT_REQUEST) {
      body = `
<h3>หนังสือขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐาน</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("พฤติการณ์โดยสังเขป", "incidentSummary", f.incidentSummary, "textarea")}
  ${field("ข้อขอทราบ 1 (ตำแหน่ง/อำนาจหน้าที่ฯ + ขอสำเนาราชการ)", "requestItems1", f.requestItems1, "textarea")}
  ${field("ข้อขอทราบ 2 (เอกสารพยานหลักฐานที่ขอ)", "requestItems2", f.requestItems2, "textarea")}
  ${field("ข้อ ๓ หน่วยงานเคยรับเรื่องหรือไม่/ผลดำเนินการ", "duplicateQuestionAnswer", f.duplicateQuestionAnswer, "textarea")}
</div>
<h3>ผู้ลงนาม</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล หัวหน้าพนักงาน ป.ป.ท.", "ownerSignerName", f.ownerSignerName)}
  ${field("สำนัก/กอง", "ownerDivision", f.ownerDivision)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("(เจ้าของสำนวน)", "ownerName", f.ownerName)}
</div>`;
    } else if (formId === DOC_IDS.FACT_FOLLOWUP) {
      body = `
<h3>หนังสือติดตามผลการขอทราบข้อเท็จจริงฯ</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ติดตามครั้งที่", "followupRound", f.followupRound)}
  ${field("อ้างถึง (หนังสือติดต่อฉบับหลังสุด)", "referenceNote2", f.referenceNote2, "textarea")}
  ${field("เดิมกำหนดภายใน (วัน)", "originalDeadlineDays", f.originalDeadlineDays)}
  ${field("ขอให้ดำเนินการภายใน (วัน)", "newDeadlineDays", f.newDeadlineDays)}
  ${field("โทรศัพท์ติดต่อ", "contactPhone", f.contactPhone)}
</div>
<h3>ผู้ลงนาม</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล หัวหน้าพนักงาน ป.ป.ท.", "ownerSignerName", f.ownerSignerName)}
  ${field("สำนัก/กอง", "ownerDivision", f.ownerDivision)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("(เจ้าของสำนวน)", "ownerName", f.ownerName)}
</div>`;
    } else if (formId === DOC_IDS.FACT_ADDL) {
      body = `
<h3>หนังสือขอทราบข้อเท็จจริงและเอกสารพยานหลักฐานเพิ่มเติม</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("อ้างถึง (หนังสือติดต่อฉบับหลังสุด)", "referenceNote2", f.referenceNote2, "textarea")}
  ${field("ประเด็นตรวจสอบเพิ่มเติม 1", "additionalPoint1", f.additionalPoint1, "textarea")}
  ${field("ประเด็นตรวจสอบเพิ่มเติม 2", "additionalPoint2", f.additionalPoint2, "textarea")}
  ${field("โทรศัพท์ติดต่อ", "contactPhone", f.contactPhone)}
</div>
<h3>ผู้ลงนาม</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล หัวหน้าพนักงาน ป.ป.ท.", "ownerSignerName", f.ownerSignerName)}
  ${field("สำนัก/กอง", "ownerDivision", f.ownerDivision)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("(เจ้าของสำนวน)", "ownerName", f.ownerName)}
</div>`;
    } else if (formId === DOC_IDS.COOPERATION) {
      body = `
<h3>หนังสือขอความร่วมมือในการปฏิบัติราชการ</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ผู้ประสานงาน (ชื่อ-สกุล)", "coordinatorName", f.coordinatorName)}
  ${field("โทรศัพท์ผู้ประสานงาน", "coordinatorPhone", f.coordinatorPhone)}
  ${field("เรื่อง/สถานที่ที่ปฏิบัติราชการ", "missionSubject", f.missionSubject, "textarea")}
  ${field("ประเด็นที่ขอความร่วมมือ", "cooperationPoints", f.cooperationPoints, "textarea")}
</div>
<h3>ผู้ลงนาม</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล หัวหน้าพนักงาน ป.ป.ท.", "ownerSignerName", f.ownerSignerName)}
  ${field("สำนัก/กอง", "ownerDivision", f.ownerDivision)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("(เจ้าของสำนวน)", "ownerName", f.ownerName)}
</div>`;
    } else if (formId === DOC_IDS.DOSSIER_LIST) {
      body = `
<h3>บัญชีสำนวนการไต่สวนเบื้องต้น</h3>
<div class="a5-form-grid">
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("สำนัก", "officeName", f.officeName)}
</div>
<div data-a5-prelim-rows="items">${(f.items || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field("ชนิดและหมายเลขหนังสือ", `items.${i}.document`, row.document)}
  ${field("จำนวนแผ่น", `items.${i}.pages`, row.pages)}
  ${field("หมายเหตุ", `items.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-prelim-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-prelim-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายการเอกสาร</button>`;
    } else if (formId === DOC_IDS.AGENDA_PROPOSAL) {
      body = `
<h3>เสนอเรื่องบรรจุเข้าวาระประชุม คกก. ป.ป.ท. (คณะอนุกลั่นกรองฯ)</h3>
<div class="a5-form-grid">
  ${field("ที่ (ปป ๐๐../...)", "letterNo", f.letterNo)}
  ${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("คณะอนุกรรมการกลั่นกรอง คณะที่", "committeeNo", f.committeeNo)}
  ${field("เลขาธิการพิจารณา ครั้งที่", "secretaryMeetingNo", f.secretaryMeetingNo)}
  ${field("วันที่เลขาธิการพิจารณา", "secretaryMeetingDate", f.secretaryMeetingDate)}
  ${field("สำนวนคดีของ (กอง/สำนัก)", "ownerDivision", f.ownerDivision)}
  ${field("กรณีให้ไต่สวนเบื้องต้นเพิ่มเติม (จำนวนเรื่อง)", "countAdditional", f.countAdditional)}
  ${field("กรณีส่ง ป.ป.ช. (จำนวนเรื่อง)", "countNacc", f.countNacc)}
  ${field("กรณีไม่รับไว้ไต่สวน (จำนวนเรื่อง)", "countNotAccepted", f.countNotAccepted)}
  ${field("ผู้ลงนาม (อนุกรรมการและเลขานุการ)", "signerName", f.signerName)}
  ${field("คณะที่ (ผู้ลงนาม)", "signerCommitteeNo", f.signerCommitteeNo)}
</div>`;
    } else {
      const isNacc = formId === DOC_IDS.NACC_FACTS;
      const isDup = formId === DOC_IDS.DUPLICATE_QUERY;
      body = `
<h3>${escapeHtml(meta.title)}</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือขาออก)", "letterNo", f.letterNo)}
  ${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${isDup ? field("หน่วยงานที่สอบถาม", "queriedAgency", f.queriedAgency) : field("เรียน (ผู้กล่าวหา/ผู้ร้องเรียน)", "addressee", f.addressee)}
  ${isDup ? "" : field("อ้างถึง (หนังสือ/บันทึกคำให้การ ลงวันที่)", "referenceNote", f.referenceNote)}
  ${isDup ? field("เจ้าหน้าที่ของรัฐที่ถูกกล่าวหา", "accusedOfficer", f.accusedOfficer) : ""}
  ${isDup ? "" : field("สังกัดผู้ถูกกล่าวหา", "respondentAgency", f.respondentAgency)}
  ${isDup ? field("พฤติการณ์โดยสังเขป", "incidentSummary", f.incidentSummary, "textarea") : field("ฐานความผิด", "allegationBase", f.allegationBase)}
  ${formId === DOC_IDS.ADDITIONAL_REQUEST ? field("สถานะผู้รับหนังสือ", "personRoleLabel", f.personRoleLabel) : ""}
  ${formId === DOC_IDS.ADDITIONAL_REQUEST ? field("ข้อ 1. ที่ขอทราบ", "question1", f.question1, "textarea") + field("ข้อ 2. ที่ขอทราบ", "question2", f.question2, "textarea") : ""}
  ${isDup ? "" : field("พนักงาน ป.ป.ท. ผู้รับถ้อยคำ", "investigatorName", f.investigatorName)}
  ${isDup ? "" : field("นัดวันที่", "appointmentDate", f.appointmentDate)}
  ${isDup ? "" : field("เวลา (น.)", "appointmentTime", f.appointmentTime)}
  ${isDup ? "" : field("สถานที่นัด", "appointmentPlace", f.appointmentPlace)}
  ${field("โทรศัพท์ติดต่อ", "contactPhone", f.contactPhone)}
</div>
<h3>ผู้ลงนาม</h3>
<div class="a5-form-grid">
  ${field("ชื่อ-สกุล หัวหน้าพนักงาน ป.ป.ท.", "ownerSignerName", f.ownerSignerName)}
  ${field("สำนัก/กอง", "ownerDivision", f.ownerDivision)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("(นาย/นาง/นางสาว ... เจ้าของสำนวน)", "ownerName", f.ownerName)}
</div>`;
    }
    const buttons = editable ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-prelim-action="save" data-doc-id="${escapeHtml(formId)}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-prelim-action="submit" data-doc-id="${escapeHtml(formId)}">ส่งเอกสาร</button></div>` : "";
    return `<div class="a5-prelim-editor" data-doc-id="${escapeHtml(formId)}"><p class="ws-policy-note">ปปท. ${escapeHtml(meta.code)} — ${escapeHtml(meta.title)}${doc.status === "SUBMITTED" ? " · ส่งแล้ว (อ่านอย่างเดียว)" : ""}</p>${dis(body)}${buttons}</div>`;
  }

  function capturePrelimEditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-prelim-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5PrelimPath;
      if (!path) return;
      const parts = path.split(".");
      let current = payload;
      parts.forEach((key, index) => {
        const match = key.match(/^(\w+)\[(\d+)\]$/);
        const useKey = match ? match[1] : key;
        if (match) { current[useKey] = Array.isArray(current[useKey]) ? current[useKey] : []; current = current[useKey]; key = Number(match[2]); }
        if (index === parts.length - 1) {
          if (controlElement.type === "checkbox") current[key] = controlElement.checked;
          else if (controlElement.tagName === "SELECT") current[key] = controlElement.value;
          else current[key] = /^\d+$/.test(controlElement.value) && /(age|Count|No)$/.test(path) ? Number(controlElement.value) : controlElement.value;
        } else {
          if (typeof key === "number") current = current[key] || (current[key] = {});
          else current[key] = object(current[key]);
          current = current[key];
        }
      });
    });
    return payload;
  }

  // ---------- paper (ฝั่งขวา — verbatim) ----------
  const WARN62 = `<p class="a5-letter-warning"><strong>คำเตือน</strong>&nbsp;&nbsp;พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๖๒ “ผู้ใดไม่มาให้ถ้อยคำหรือไม่ส่งเอกสารหรือหลักฐานหรือไม่ดำเนินการใด ๆ ตามมาตรา ๑๘ (๑) และ (๒) โดยไม่มีเหตุอันสมควร ต้องระวางโทษจำคุกไม่เกินหกเดือน หรือปรับไม่เกินหนึ่งหมื่นบาทหรือทั้งจำทั้งปรับ”</p>`;
  const letterHead = (f, code) => `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper" data-prelim-code="${code}">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ${dot(f.letterNo, 90, 'ปป ๐๐.../...')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>(วัน เดือน ปี) ${dot(f.issuedAt, 60, '....................')}</p></div>`;
  const letterFoot = f => `<p class="a5-p-indent" style="margin-top:1.2em">ขอแสดงความนับถือ</p>
<div class="a5-sign-block" style="text-align:center;margin-top:2em">
  <p>ลงชื่อ...........................................................</p>
  <p>(${dot(f.ownerSignerName, 200, '..........................................................')})</p>
  <p>ตำแหน่ง..........หัวหน้าพนักงาน ป.ป.ท..............</p>
</div>
<p style="margin-top:.8em">สำนัก/กอง${dot(f.ownerDivision, 120, '........................')}</p>
<p>โทร. ${dot(f.ownerPhone, 100, '....................')} &nbsp;&nbsp; โทรสาร${dot(f.ownerFax, 100, '....................')}</p>
<p>(นาย/นาง/นางสาว${dot(f.ownerName, 140, '..........................')}เจ้าของสำนวน)</p>`;

  function paperWorkLog(f) {
    const rows = (f.entries || []).map(row => `<tr><td>${dot(row.date, 40)}</td><td>${show(row.action) || "&nbsp;"}</td><td>${dot(row.evidenceCount, 30)}</td><td>${show(row.note) || "&nbsp;"}</td></tr>`).join("");
    const blankRows = Array.from({ length: Math.max(10 - (f.entries || []).length, 4) }, () => "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>").join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center;margin-bottom:.6em">บันทึกการปฏิบัติงานการไต่สวนเบื้องต้น</h2>
<p>เรื่องที่${dot(f.caseSubject, 160, '................................................')}</p>
<p>ผู้กล่าวหา/ร้องเรียน&nbsp;&nbsp;${f.complainant ? escapeHtml(f.complainant) : ''}${'.'.repeat(28)}<strong>(ปกปิดชื่อ)</strong>${'.'.repeat(94)}</p>
<p>ผู้ถูกร้องเรียน&nbsp;&nbsp;${dot(f.respondent, 260, '......................................................................................................')}</p>
<p>เจ้าของสำนวน/ผู้บันทึก${dot(f.recorder, 240, '....................................................................................................')}</p>
<table class="a5-table"><thead><tr><th style="width:16%">วัน เดือน ปี</th><th style="width:44%">การดำเนินการ</th><th style="width:20%">จำนวนเอกสารพยานหลักฐาน</th><th style="width:20%">หมายเหตุ</th></tr></thead>
<tbody>${rows}${blankRows}</tbody></table>
<p class="a5-letter-note" style="margin-top:1em"><strong>หมายเหตุ</strong>&nbsp;&nbsp;๑. ให้จัดทำบันทึกการปฏิบัติงานประจำเรื่องกล่าวหาร้องเรียนแต่ละเรื่อง<br>๒. เจ้าหน้าที่เจ้าของเรื่องจะต้องบันทึกการดำเนินการทุกครั้ง นับแต่วันที่ได้รับมอบให้เป็นเจ้าของเรื่อง และต้องลงลายมือชื่อกำกับไว้ทุกครั้งที่มีการบันทึกรายการต่าง ๆ<br>๓. การเสนอเรื่องต่อผู้บังคับบัญชาจะต้องแนบบันทึกการปฏิบัติงานไปด้วยทุกครั้ง<br>๔. ผู้บังคับบัญชาจะพิจารณาสั่งการ หรือมีความเห็นในเรื่องกล่าวหาร้องเรียน โดยบันทึกไว้ในช่องหมายเหตุ</p>
<p class="a5-form-corner">ปปท. 2-01</p></article>`;
  }

  function paperAdditionalRequest(f) {
    return `${letterHead(f, "2-03")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบรายละเอียดตามคำร้องเรียน/กล่าวหาเพิ่มเติม (เรื่องที่ ${dot(f.caseRefNo, 60, '....................')})</p>
<p><strong>เรียน</strong>&nbsp; ${dot(f.addressee, 300, '(ให้ระบุชื่อผู้กล่าวหา/ผู้ร้องเรียน)')}</p>
<p class="a5-p-indent">อ้างถึง&nbsp; หนังสือร้องเรียน ฉบับลงวันที่ หรือบันทึกคำให้การของท่านลงวันที่ ${dot(f.referenceNote, 160, '(ถ้ามี)')}</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง ได้มีการร้องเรียนกล่าวหา (ให้ระบุว่าเจ้าหน้าที่ของรัฐ (สังกัด${dot(f.respondentAgency, 80, '......')} ผู้ถูกกล่าวหา) ว่ากระทำความผิดฐาน ${dot(f.allegationBase, 160, '(ฐานทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ)')}) ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ใคร่ขอทราบว่าท่านเป็น (${dot(f.personRoleLabel, 60, 'ให้ระบุว่าเป็นผู้กล่าวหาหรือผู้ร้องเรียน')}) ในเรื่องดังกล่าวหรือไม่ หากมิได้เป็น แต่ทราบรายละเอียดเกี่ยวกับเรื่องดังกล่าวเป็นอย่างดี สำนักงาน ป.ป.ท. มีความจำเป็นจะต้องขอทราบรายละเอียดตามคำร้องเรียนเพิ่มเติม ดังนี้</p>
<p>1. ${dot(f.question1, 320, '..................................................................')}&nbsp;&nbsp;2. ${dot(f.question2, 320, '..................................................................')}</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อขอเชิญท่านไปให้ถ้อยคำต่อ&nbsp;&nbsp;&nbsp;${dot(f.investigatorName, 180, '(ชื่อ-นามสกุล พนักงาน ป.ป.ท.)')}</p>
<p>ในวันที่ ${dot(f.appointmentDate, 100, '......')}&nbsp;&nbsp;เวลา ${dot(f.appointmentTime, 60, '......')}&nbsp;&nbsp;น.&nbsp; ณ ${dot(f.appointmentPlace, 200, '(ให้ระบุสถานที่)')} โดยให้นำบัตรประจำตัวประชาชน พร้อมเอกสารพยานหลักฐานที่เกี่ยวข้องไปประกอบการให้ถ้อยคำ หรือหากมีข้อขัดข้องประการใดที่ไม่สามารถไปให้ถ้อยคำในวันและเวลาดังกล่าวได้ ขอให้แจ้งให้ทราบตามหมายเลขโทรศัพท์${dot(f.contactPhone, 140, '....................')} หรือหากไม่สามารถไปให้ถ้อยคำได้ โปรดแจ้งรายละเอียดข้อเท็จจริงดังกล่าว พร้อมกับส่งเอกสารพยานหลักฐานที่เกี่ยวข้องไปยังสำนักงาน ป.ป.ท. ภายใน ๑๕ วัน นับแต่วันที่ได้รับหนังสือฉบับนี้ด้วย จักขอบคุณมาก</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-03</p></article>`;
  }

  function paperNaccFacts(f) {
    return `${letterHead(f, "2-04")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบรายละเอียดตามคำร้องเรียน/กล่าวหาเพิ่มเติม (เรื่องที่ ${dot(f.caseRefNo, 60, '....................')})</p>
<p><strong>เรียน</strong>&nbsp; ${dot(f.addressee, 300, '(ให้ระบุชื่อผู้กล่าวหา/ผู้ร้องเรียน)')}</p>
<p class="a5-p-indent">ด้วย สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับมอบหมายจากคณะกรรมการ ป.ป.ช. ให้ดำเนินการแทน กรณีที่ท่านได้ร้องเรียน/กล่าวหา (ให้ระบุว่าเจ้าหน้าที่ของรัฐ (สังกัด${dot(f.respondentAgency, 80, '......')} ผู้ถูกกล่าวหา) ว่ากระทำความผิดฐาน ${dot(f.allegationBase, 160, '(ฐานทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม)')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา ๑๘ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม สำนักงาน ป.ป.ท. มีกรณีจำเป็นต้องขอทราบรายละเอียดตามคำกล่าวหาเพิ่มเติม ดังนี้</p>
<p>1. ${dot(f.question1, 320, '..................................................................')}&nbsp;&nbsp;2. ${dot(f.question2, 320, '..................................................................')}</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อขอเชิญท่านไปให้ถ้อยคำต่อ&nbsp;&nbsp;&nbsp;${dot(f.investigatorName, 180, '(ชื่อ-นามสกุล พนักงาน ป.ป.ท.')}</p>
<p>ในวันที่ ${dot(f.appointmentDate, 100, '......')}&nbsp;&nbsp;เวลา ${dot(f.appointmentTime, 60, '......')}&nbsp;&nbsp;น.&nbsp; ณ ${dot(f.appointmentPlace, 200, '(ให้ระบุสถานที่)')} โดยให้นำบัตรประจำตัวประชาชน พร้อมเอกสารพยานหลักฐานที่เกี่ยวข้องไปประกอบการให้ถ้อยคำ หรือหากมีข้อขัดข้องประการใดที่ไม่สามารถไปให้ถ้อยคำในวันและเวลาดังกล่าวได้ ขอให้แจ้งให้ทราบตามหมายเลขโทรศัพท์${dot(f.contactPhone, 140, '....................')} หรือหากไม่สามารถไปให้ถ้อยคำได้ โปรดแจ้งรายละเอียดข้อเท็จจริงดังกล่าว พร้อมกับส่งเอกสารพยานหลักฐานที่เกี่ยวข้องไปยังสำนักงาน ป.ป.ท. ภายใน ๑๕ วัน นับแต่วันที่ได้รับหนังสือฉบับนี้ด้วย จักขอบคุณมาก</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-04</p></article>`;
  }

  function paperDuplicateQuery(f) {
    return `${letterHead(f, "2-05")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบการดำเนินการเรื่องร้องเรียน (เรื่องที่ ${dot(f.caseRefNo, 60, '.................')})</p>
<p><strong>เรียน</strong>&nbsp; หัวหน้าหน่วยงานของรัฐ หรือหน่วยงานที่มีอำนาจไต่สวนคดีทุจริตหรือประพฤติมิชอบ</p>
<p class="a5-p-indent">ด้วยสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับเรื่องกล่าวหาร้องเรียน......(${dot(f.accusedOfficer, 120, 'เจ้าหน้าที่ของรัฐ....')}(${dot(f.accusedAgency, 80, 'หน่วยงาน')}).....).......กรณี${dot(f.incidentSummary, 400, '..............(ระบุรายละเอียดของพฤติการณ์ที่มีการกล่าวหาที่สามารถเข้าใจได้ว่าเป็นการร้องเรียนเกี่ยวกับเรื่องใดอย่างไร พอสังเขป)')} ไว้ดำเนินการ</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา ๑๘ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม สำนักงาน ป.ป.ท. ขอทราบว่า ${dot(f.queriedAgency, 160, '(ชื่อหน่วยงานที่สอบถาม)')} ได้รับเรื่องร้องเรียนกล่าวหากรณีเดียวกันนี้ไว้พิจารณาแล้วหรือไม่ หากมี ขอทราบผลการดำเนินการและเอกสารหลักฐานที่เกี่ยวข้อง โดยขอให้แจ้งข้อเท็จจริงและส่งเอกสารพยานหลักฐานซึ่งรับรองสำเนาถูกต้องทุกหน้าไปยัง สำนักงาน ป.ป.ท. ภายใน ๑๕ วัน นับแต่วันที่ได้รับหนังสือฉบับนี้ จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-05</p></article>`;
  }

  function paperStatement(f) {
    const d = object(f.deponent);
    const reg = object(d.registryAddress), cur = object(d.currentAddress);
    const addrLine = a => [a.houseNo, a.soi, a.road, a.subdistrict, a.district, a.province]
      .map(text)
      .filter(Boolean)
      .map(escapeHtml)
      .join(" ต.") || "&nbsp;";
    const qaRows = (f.qa || []).map((row, i) => `<p class="a5-qa-q">ถาม&nbsp;&nbsp;${show(row.q) || "&nbsp;"}</p><p class="a5-qa-a">ตอบ&nbsp;&nbsp;${show(row.a) || "&nbsp;"}</p>`).join("");
    const docs = (f.documentsSubmitted || []).length ? (f.documentsSubmitted || []).map((x, i) => `<p>${["๑","๒","๓","๔","๕"][i] || i + 1}. ${show(x.text || x)}</p>`).join("") : "<p>๑. &nbsp;</p><p>๒. &nbsp;</p>";
    const blankQa = Array.from({ length: Math.max(0, 4 - (f.qa || []).length) }, () => '<p class="a5-qa-q">ถาม &nbsp;</p><p class="a5-qa-a">ตอบ &nbsp;</p>').join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</strong><br><strong>บันทึกคำให้การ/ถ้อยคำของผู้กล่าวหา/ร้องเรียน หรือ พยาน</strong></p>
<p><strong>เรื่อง</strong>&nbsp;&nbsp;การไต่สวนเบื้องต้นกรณีกล่าวหา ${dot(f.caseTitle, 500, '...(ชื่อ-สกุล และตำแหน่งของผู้ถูกร้องเรียน กระทำความผิดฐานทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ)')}</p>
<table class="a5-table a5-statement-meta"><tbody>
<tr><td style="width:18%">สำนัก</td><td>${dot(f.office, 120)}</td><td style="width:14%">เลขที่</td><td>${dot(f.bookNo, 100)}</td></tr>
<tr><td>วันที่</td><td colspan="3">${dot(f.recordedAt, 140)}</td></tr>
<tr><td>ชื่อผู้ถูกร้องเรียน</td><td colspan="3">${dot(f.respondentName, 300)}</td></tr>
<tr><td>สถานที่บันทึก</td><td colspan="3">${dot(f.place, 300)}</td></tr>
<tr><td>ต่อหน้า</td><td colspan="3">${dot(f.recorderName, 300)} (ชื่อ-สกุล ตำแหน่งของผู้บันทึก)</td></tr>
</tbody></table>
<table class="a5-table a5-statement-deponent"><tbody>
<tr><td style="width:34%">ชื่อผู้ให้ถ้อยคำ<br>(นาย/นาง/นางสาว/ยศ)</td><td>${dot(d.name, 200)}</td></tr>
<tr><td>อายุ</td><td>${dot(d.age, 60)} ปี &nbsp;&nbsp;<strong>เป็น</strong> ${dot(d.role, 80, '(ผู้ร้องเรียน/พยาน)')}</td></tr>
<tr><td>เชื้อชาติ</td><td>${dot(d.race, 100)} &nbsp; สัญชาติ ${dot(d.nationality, 80)} &nbsp; ศาสนา ${dot(d.religion, 80)}</td></tr>
<tr><td>อาชีพ</td><td>${dot(d.occupation, 160)}</td></tr>
<tr><td>หมายเลขบัตรประจำตัวประชาชน</td><td>${dot(d.idCard, 160)} หรือบัตร${dot(d.idCardOther, 80, '....................')} เลขที่ ${dot(d.idCardOther, 80)} &nbsp; วันหมดอายุ ${dot(d.idExpiry, 100)}</td></tr>
<tr><td>บิดาชื่อ</td><td>${dot(d.fatherName, 160)}</td></tr>
<tr><td>มารดาชื่อ</td><td>${dot(d.motherName, 160)}</td></tr>
<tr><td>ภูมิลำเนาตามทะเบียนบ้าน</td><td>เลขที่ ${dot(reg.houseNo, 60)} ซอย ${dot(reg.soi, 60)} ถนน ${dot(reg.road, 80)} ตำบล/แขวง ${dot(reg.subdistrict, 80)} อำเภอ/เขต ${dot(reg.district, 80)} จังหวัด ${dot(reg.province, 80)} สถานที่ใกล้เคียง ${dot(reg.nearby, 100)}</td></tr>
<tr><td>โทรศัพท์ (บ้าน/มือถือ)</td><td>${dot(d.phone, 140)}</td></tr>
<tr><td>ที่อยู่ปัจจุบัน</td><td>เลขที่ ${dot(cur.houseNo, 60)} ซอย ${dot(cur.soi, 60)} ถนน ${dot(cur.road, 80)} ตำบล/แขวง ${dot(cur.subdistrict, 80)} อำเภอ/เขต ${dot(cur.district, 80)} จังหวัด ${dot(cur.province, 80)} สถานที่ใกล้เคียง ${dot(cur.nearby, 100)}</td></tr>
<tr><td>บุคคลที่ติดต่อได้</td><td>${dot(d.contactPerson, 140)} โทรศัพท์ ${dot(d.contactPhone, 120)}</td></tr>
<tr><td>ผู้ให้ถ้อยคำเกี่ยวข้องอย่างไรกับคู่กรณี<br>(คู่กรณี คือ ผู้กล่าวหา/ผู้ถูกกล่าวหา)</td><td>${show(d.relationToParties) || "&nbsp;"}</td></tr>
</tbody></table>
<p class="a5-p-indent">ข้าฯ ได้รับแจ้งจาก (ให้ระบุชื่อเจ้าหน้าที่) ว่า ผู้บันทึกถ้อยคำเป็นเจ้าพนักงานตามประมวลกฎหมายอาญา และการให้ถ้อยคำอันเป็นเท็จเป็นความผิดตามกฎหมาย ซึ่งอาจได้รับโทษจำคุกหรือปรับ หรือทั้งจำทั้งปรับ ข้าฯ ได้รับทราบและเข้าใจแล้ว จึงขอให้ถ้อยคำด้วยความสมัครใจตามความสัตย์จริง ดังต่อไปนี้</p>
${qaRows}${blankQa}
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านเคยร้องเรียนกล่าวหาในประเด็นดังกล่าวข้างต้นต่อหน่วยงานของรัฐอื่นใด หรือไม่ อย่างไร และผลการดำเนินการกรณีดังกล่าวเป็นอย่างไร</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านได้มอบเอกสารอะไรให้ผู้บันทึกบ้าง</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;${docs}</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านเคยมีสาเหตุโกรธเคืองกับผู้ใดในคดีนี้มาก่อนหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;คำให้การข้างต้น ผู้บันทึกได้อ่านให้ฟัง/ข้าฯ ได้อ่านเองแล้วถูกต้องและเป็นความจริงหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;เป็นความจริง ${show(f.readConfirmation) || 'อ่านให้ฟังแล้ว'}/ได้อ่านเองแล้วรับว่าถูกต้อง</p>
<p class="a5-p-indent">ข้าฯ ขอรับรองว่า พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. มิได้ทำหรือจัดให้ทำการใด ๆ ซึ่งเป็นการล่อลวงหรือขู่เข็ญหรือให้สัญญาเพื่อจูงใจให้ข้าฯ ให้ถ้อยคำอย่างใด ๆ และข้าฯ ได้อ่านคำให้การแล้ว/เจ้าหน้าที่ได้อ่านคำให้การให้ข้าฯ ฟังแล้ว ขอรับรองว่าถูกต้องตามที่ให้ถ้อยคำไว้ จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>
<table class="a5-signature-table"><tbody>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;ผู้ให้ถ้อยคำ/ผู้ร้องเรียน/พยาน</td></tr>
<tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr>
<tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr>
<tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)&nbsp;&nbsp;ผู้บันทึก/อ่าน</td></tr>
</tbody></table>
<p class="a5-letter-note">(หมายเหตุ กรณีผู้ให้ถ้อยคำไม่สามารถลงลายมือชื่อได้ให้พิมพ์ลายนิ้วมือแทน พร้อมระบุว่า “ลายพิมพ์นิ้วมือใด” ส่วนกรณีที่ไม่สามารถพิมพ์ลายนิ้วมือได้ให้บันทึกเหตุแห่งการนั้นไว้)</p>
<p class="a5-form-corner">ปปท. 2-06</p></article>`;
  }

  function paperStatementAddl(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p>บันทึกคำให้การของ ${dot(f.deponentName, 160, '(ชื่อ-สกุล)')} &nbsp;<strong>${show(f.deponentRole) || 'ผู้ร้องเรียน'}</strong>&nbsp; เพิ่มเติม ครั้งที่ ${dot(f.recordRound, 60, '.............')} เรื่องที่ ${dot(f.caseTitle, 100, '....................')}</p>
<p style="text-align:center">${dot(f.place, 200, '(สถานที่บันทึกถ้อยคำ)')}</p>
<p style="text-align:center">(${dot(f.recordedAt, 120, 'วัน เดือน ปี')})</p>
<p class="a5-p-indent">วันนี้ ${dot(f.recorderName, 260, '(ชื่อ-สกุล และตำแหน่งของผู้บันทึก)')} ได้บันทึกถ้อยคำข้าฯ เพิ่มเติม &nbsp;ข้าฯ ได้รับแจ้งจากผู้บันทึกถ้อยคำว่าเป็นเจ้าพนักงานตามประมวลกฎหมายอาญา และการให้ถ้อยคำอันเป็นเท็จเป็นความผิดตามกฎหมาย ซึ่งอาจได้รับโทษจำคุกหรือปรับหรือทั้งจำทั้งปรับ ข้าฯ ได้รับทราบและเข้าใจแล้ว จึงขอให้ถ้อยคำด้วยความสมัครใจตามความสัตย์จริง ดังต่อไปนี้</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ผู้บันทึกได้อ่านคำให้การเดิมให้ท่านฟังแล้ว จะยืนยันตามคำให้การเดิมหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;${show(f.confirmOriginalAnswer) || "&nbsp;"}</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ประเด็นที่ต้องการให้ถ้อยคำเพิ่มเติม</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;${show(f.additionalPointsAnswer) || "&nbsp;"}</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;คำให้การข้างต้น ผู้บันทึกได้อ่านให้ฟัง/ข้าฯ ได้อ่านเองแล้วถูกต้องและเป็นความจริงหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;เป็นความจริง ${show(f.readConfirmation) || 'อ่านให้ฟังแล้ว'}/ได้อ่านเองแล้วรับว่าถูกต้อง</p>
<p class="a5-p-indent">ข้าฯ ขอรับรองว่า พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. มิได้ทำหรือจัดให้ทำการใดๆ ซึ่งเป็นการล่อลวงหรือขู่เข็ญ หรือให้สัญญาเพื่อจูงใจให้ข้าฯให้ถ้อยคำอย่างใด ๆ และข้าฯ ได้อ่านคำให้การแล้ว/เจ้าหน้าที่ได้อ่านคำให้การให้ข้าฯ ฟังแล้ว ขอรับรองว่าถูกต้องตามที่ให้ถ้อยคำไว้ จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>
<table class="a5-signature-table"><tbody>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;ผู้ให้ถ้อยคำ/ผู้ร้องเรียน/พยาน</td></tr><tr><td>(&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;)&nbsp;&nbsp;ผู้บันทึก/อ่าน</td></tr>
</tbody></table>
<p class="a5-letter-note">(หมายเหตุ กรณีผู้ให้ถ้อยคำไม่สามารถลงลายมือชื่อได้ให้พิมพ์ลายนิ้วมือแทน พร้อมระบุว่า “ลายพิมพ์นิ้วมือใด” ส่วนกรณีที่ไม่สามารถพิมพ์ลายนิ้วมือได้ให้บันทึกเหตุแห่งการนั้นไว้)</p>
<p class="a5-form-corner">ปปท. 2-07</p></article>`;
  }

  function paperFactRequest(f) {
    return `${letterHead(f, "2-08")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐาน</p>
<p><strong>เรียน</strong>&nbsp; หัวหน้าหน่วยงานที่ครอบครองเอกสาร</p>
<p class="a5-p-indent">ด้วย สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับเรื่องกล่าวหาร้องเรียน ${dot(f.incidentSummary, 420, '(ระบุพฤติการณ์การร้องเรียนพอสังเขปว่า เป็นกรณีกระทำการทุจริตต่อตำแหน่งหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ ) (หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม เมื่อใด ที่ไหน อย่างไร )')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวน อาศัยอำนาจตามมาตรา ๑๘ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม สำนักงาน ป.ป.ท. ขอทราบข้อเท็จจริงพร้อมทั้งขอเอกสารพยานหลักฐานที่เกี่ยวข้องกับเรื่องดังกล่าว ดังนี้ (ถ้ามีจำนวนมากให้ระบุแยกเป็นข้อ ๆ )</p>
<p class="a5-p-indent">${dot(f.requestItems1, 520, '(ขอทราบว่านาย/นาง/นางสาว ... ในช่วงเดือน/ปี (ในขณะเกิดเหตุ) ดำรงตำแหน่งใด มีอำนาจหน้าที่อย่างไร และปัจจุบันดำรงตำแหน่งใด สังกัดใด และมีอำนาจหน้าที่อย่างไรบ้าง พร้อมทั้งขอสำเนาประวัติการรับราชการและสำเนาคำสั่งแต่งตั้ง/มอบหมายให้ปฏิบัติหน้าที่)')}</p>
<p class="a5-p-indent">${dot(f.requestItems2, 520, 'ขอเอกสารพยานหลักฐานที่เกี่ยวข้องกับเรื่องกล่าวหา (ให้ระบุว่าเป็นเอกสารใดบ้าง)')}</p>
<p class="a5-p-indent">๓. ในเรื่องที่มีการกล่าวหาร้องเรียนข้างต้น หน่วยงานเคยได้รับเรื่องร้องเรียนดังกล่าวหรือไม่อย่างไร หากมีขอทราบผลการดำเนินการ ${show(f.duplicateQuestionAnswer)}</p>
<p class="a5-p-indent">จึงขอได้โปรดแจ้งข้อเท็จจริงและจัดส่งเอกสารพยานหลักฐานที่เกี่ยวข้อง ซึ่งรับรองสำเนาถูกต้องทุกหน้าไปยัง สำนักงาน ป.ป.ท. ภายใน ๑๕ วัน (หรือพิจารณาตามความเหมาะสม) นับแต่วันที่ได้รับหนังสือฉบับนี้ด้วย จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-08</p></article>`;
  }

  function paperFactFollowup(f) {
    return `${letterHead(f, "2-09")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐาน (ติดตามครั้งที่ ${dot(f.followupRound, 50, '...........')})</p>
<p><strong>เรียน</strong>&nbsp; (หัวหน้าส่วนราชการ/หัวหน้าหน่วยงานของผู้ถูกร้องเรียน)</p>
<p class="a5-p-indent">อ้างถึง&nbsp; ${dot(f.referenceNote2, 300, '(หนังสือที่ติดต่อระหว่างหน่วยงานฉบับหลังสุด)')}</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้ขอให้แจ้งข้อเท็จจริงและจัดส่งเอกสารพยานหลักฐานที่เกี่ยวข้องกับเรื่องกล่าวหาร้องเรียน (เท้าความเดิมของหนังสือที่อ้างถึง) ไปยังสำนักงาน ป.ป.ท. ภายใน${dot(f.originalDeadlineDays, 40, '……')}วัน นับแต่วันที่ได้รับหนังสือ ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">บัดนี้ เวลาได้ล่วงเลยมาพอสมควรแล้ว สำนักงาน ป.ป.ท. ยังไม่ได้รับแจ้งข้อเท็จจริงและเอกสารพยานหลักฐานดังกล่าวจากท่านแต่อย่างใด ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา ๑๘ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติมจึงขอให้เร่งรัดดำเนินการแจ้งข้อเท็จจริงพร้อมทั้งส่งเอกสารพยานหลักฐานที่เกี่ยวข้อง ซึ่งรับรองสำเนาถูกต้องทุกหน้าไปยังสำนักงาน ป.ป.ท. ภายใน ${dot(f.newDeadlineDays, 40, '.......')} วัน (หรือพิจารณาตามความเหมาะสม) นับแต่วันที่ได้รับหนังสือฉบับนี้ ทั้งนี้ หากท่านมีข้อขัดข้องประการใด ขอได้แจ้งให้ทราบต่อไปด้วย จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-09</p></article>`;
  }

  function paperFactAddl(f) {
    return `${letterHead(f, "2-10")}
<p><strong>เรื่อง</strong>&nbsp; ขอทราบข้อเท็จจริงและขอเอกสารพยานหลักฐานเพิ่มเติม</p>
<p><strong>เรียน</strong>&nbsp; (หัวหน้าส่วนราชการ/หัวหน้าหน่วยงาน)</p>
<p class="a5-p-indent">อ้างถึง&nbsp; ${dot(f.referenceNote2, 300, '(หนังสือที่ติดต่อระหว่างหน่วยงานฉบับหลังสุด)')}</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับแจ้งข้อเท็จจริงและเอกสารพยานหลักฐานที่เกี่ยวข้องกับเรื่องกล่าวหาร้องเรียน (เท้าความเดิมของหนังสือที่อ้างถึง) ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">สำนักงาน ป.ป.ท. มีความจำเป็นที่จะต้องตรวจสอบเพิ่มเติมในประเด็นที่เกี่ยวข้องกับข้อเท็จจริงและเอกสารพยานหลักฐาน ดังนี้</p>
<p>${dot(f.additionalPoint1, 400, '..................................................................')}</p>
<p>${dot(f.additionalPoint2, 400, '..................................................................')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวน อาศัยอำนาจตามมาตรา ๑๘ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอให้แจ้งข้อเท็จจริงและส่งเอกสารพยานหลักฐานซึ่งรับรองสำเนาถูกต้องทุกหน้าไปยัง สำนักงาน ป.ป.ท. ภายใน ๑๕ วัน (หรือพิจารณาตามความเหมาะสม) นับแต่วันที่ได้รับหนังสือฉบับนี้ จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
${letterFoot(f)}${WARN62}<p class="a5-form-corner">ปปท. 2-10</p></article>`;
  }

  function paperCooperation(f) {
    return `${letterHead(f, "2-11")}
<p><strong>เรื่อง</strong>&nbsp; ขอความร่วมมือในการปฏิบัติราชการ</p>
<p><strong>เรียน</strong>&nbsp; (หัวหน้าส่วนราชการ/หัวหน้าหน่วยงาน)</p>
<p class="a5-p-indent">ด้วย สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้มอบหมายให้คณะพนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. มาปฏิบัติราชการ โดยมี ${dot(f.coordinatorName, 140, '......')} (ชื่อ-สกุล หมายเลขโทรศัพท์ ${dot(f.coordinatorPhone, 80, '.........')}) เป็นผู้ประสานงาน เพื่อดำเนินการไต่สวนเบื้องต้น เรื่อง ${dot(f.missionSubject, 220, '(ให้ระบุว่าเป็นเรื่องอะไร สถานที่ใด)')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวน อาศัยอำนาจตามมาตรา ๑๘ (๔) พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ในการนี้สำนักงาน ป.ป.ท. ใคร่ขอความร่วมมือ ${dot(f.cooperationPoints, 320, '(ให้ระบุประเด็นเรื่องที่ต้องการให้ช่วยเหลือ)')} แก่พนักงาน ป.ป.ท. หรือเจ้าหน้าที่ ป.ป.ท. พร้อมคณะดังกล่าว หากพนักงาน ป.ป.ท. หรือเจ้าหน้าที่ ป.ป.ท. ประสงค์จะขอเอกสารพยานหลักฐานต่างๆ ที่เกี่ยวข้อง ขอได้โปรดอนุเคราะห์ด้วย จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
${letterFoot(f)}<p class="a5-form-corner">ปปท. 2-11</p></article>`;
  }

  function paperDossierList(f) {
    const rows = (f.items || []).map((row, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${show(row.document) || "&nbsp;"}</td><td style="text-align:center">${show(row.pages) || "&nbsp;"}</td><td>${show(row.note) || "&nbsp;"}</td></tr>`).join("");
    const blankRows = Array.from({ length: Math.max(14 - (f.items || []).length, 4) }, () => "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>").join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center;margin-bottom:.6em">บัญชีสำนวนการไต่สวนเบื้องต้น</h2>
<p>เรื่องที่ ${dot(f.caseRefNo, 120, '...................')}</p>
<p>สำนัก${dot(f.officeName, 240, '.............................................................................................')}สำนักงาน ป.ป.ท.</p>
<table class="a5-table"><thead><tr><th style="width:12%">ลำดับที่</th><th style="width:46%">ชนิดและหมายเลขหนังสือ</th><th style="width:16%">จำนวนแผ่น</th><th style="width:26%">หมายเหตุ</th></tr></thead>
<tbody>${rows}${blankRows}</tbody></table>
<p class="a5-form-corner">ปปท. 2-14</p></article>`;
  }

  function paperAgendaProposal(f) {
    const total = [f.countAdditional, f.countNacc, f.countNotAccepted].filter(x => text(x)).length;
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:right">คณะอนุกรรมการกลั่นกรอง เรื่อง รายงานผลการไต่สวนเบื้องต้น&nbsp;&nbsp;โทร. .............<br>ที่ ${dot(f.letterNo, 90, 'ปป ๐๐../...')}</p>
<h3 style="text-align:center">เสนอเรื่องร้องเรียนกล่าวหาเพื่อบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท.</h3>
<p><strong>เรียน</strong>&nbsp; ประธานกรรมการ ป.ป.ท.</p>
<p class="a5-p-indent">ด้วย คณะอนุกรรมการกลั่นกรอง เรื่อง รายงานผลการไต่สวนเบื้องต้น คณะที่ ${dot(f.committeeNo, 50, '.......')} ได้มีการประชุมพิจารณารายงานผลการไต่สวนเบื้องต้นที่ผ่านการพิจารณาของเลขาธิการคณะกรรมการ ป.ป.ท. ครั้งที่ ${dot(f.secretaryMeetingNo, 60, '............')} เมื่อวันที่ ${dot(f.secretaryMeetingDate, 100, '.....................')} โดยได้จัดทำมติการประชุมของคณะอนุกรรมการกลั่นกรอง เรื่อง รายงานผลการไต่สวนเบื้องต้นดังกล่าว เพื่อเสนอเรื่องร้องเรียนกล่าวหาบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท. แยกตามประเภทความเห็น ดังนี้</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;1. กรณีให้ไต่สวนเบื้องต้นเพิ่มเติม (รับเรื่องตามมาตรา 62) จำนวน ${dot(f.countAdditional, 60, '…………..…')} เรื่อง</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;2. กรณีส่งเรื่องให้คณะกรรมการ ป.ป.ช. (รับเรื่องตามมาตรา 62) จำนวน ${dot(f.countNacc, 60, '…………….…')} เรื่อง</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;3. กรณีไม่รับไว้ไต่สวน (รับเรื่องตามมาตรา 62) จำนวน ${dot(f.countNotAccepted, 60, '…………..…')} เรื่อง</p>
<p class="a5-p-indent">รวมจำนวนเรื่องที่ได้พิจารณาแล้วเสร็จทั้งสิ้น ....................... เรื่อง ซึ่งเป็นสำนวนคดีของ (${dot(f.ownerDivision, 80, 'กอง/สำนัก')}) รายละเอียดปรากฏตามบัญชีรายงานผลการไต่สวนเบื้องต้น และมติของคณะอนุกรรมการกลั่นกรอง เรื่อง รายงานผลการไต่สวนเบื้องต้น คณะที่ ................................... ที่แนบมาพร้อมนี้</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณาและบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท.</p>
<p style="text-align:center;margin-top:1.5em">(${dot(f.signerName, 140, '....................................')})<br>อนุกรรมการและเลขานุการ<br>คณะอนุกรรมการกลั่นกรองฯ คณะที่ ${dot(f.signerCommitteeNo, 30, '....')}</p>
<p class="a5-form-corner">ปปท. 3-02</p></article>`;
  }

  function renderPrelimPaperByDocId(formId, fields = {}) {
    const f = object(fields);
    if (formId === DOC_IDS.WORK_LOG) return paperWorkLog(f);
    if (formId === DOC_IDS.ADDITIONAL_REQUEST) return paperAdditionalRequest(f);
    if (formId === DOC_IDS.NACC_FACTS) return paperNaccFacts(f);
    if (formId === DOC_IDS.DUPLICATE_QUERY) return paperDuplicateQuery(f);
    if (formId === DOC_IDS.STATEMENT) return paperStatement(f);
    if (formId === DOC_IDS.STATEMENT_ADDL) return paperStatementAddl(f);
    if (formId === DOC_IDS.FACT_REQUEST) return paperFactRequest(f);
    if (formId === DOC_IDS.FACT_FOLLOWUP) return paperFactFollowup(f);
    if (formId === DOC_IDS.FACT_ADDL) return paperFactAddl(f);
    if (formId === DOC_IDS.COOPERATION) return paperCooperation(f);
    if (formId === DOC_IDS.DOSSIER_LIST) return paperDossierList(f);
    if (formId === DOC_IDS.AGENDA_PROPOSAL) return paperAgendaProposal(f);
    return "";
  }

  function renderPrelimPaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.prelimDocuments[formId]);
    return renderPrelimPaperByDocId(formId, doc.fields || defaultPayload(formId, state));
  }

  const api = Object.freeze({
    DOC_IDS, MANIFEST, ACTIONS,
    defaultPayload, validateRequired,
    executePrelimDocumentAction,
    renderPrelimEditorA5, capturePrelimEditorA5,
    renderPrelimPaperA5, renderPrelimPaperByDocId
  });
  root.ECMISActivity5PrelimDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
