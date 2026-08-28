/*
 * E-CMIS กิจกรรมที่ 5 — แบบฟอร์มซีรีส์ 5 (คำสั่งแต่งตั้งคณะไต่สวน ม.24 — คัดค้าน/แจ้งทราบ/เชิญประชุม)
 * 5-07 แจ้งผู้ถูกคัดค้านทราบ · 5-08 คำสั่ง คกก. แต่งตั้งคณะอนุกรรมการไต่สวน (ม.62)
 * 5-09 คำสั่ง คกก. แต่งตั้งอนุกรรมการไต่สวนเพิ่มเติม · 5-10 คำสั่ง คกก. แก้ไขคำสั่งแต่งตั้งอนุกรรมการไต่สวน
 * 5-11 แจ้งคำสั่งแต่งตั้งให้อนุกรรมการไต่สวน (คนนอก) ทราบ · 5-12 แจ้งคำสั่งแต่งตั้ง (คนนอก) ให้ผู้บังคับบัญชาทราบ
 * 5-13 บันทึกแจ้งคำสั่งแต่งตั้งให้ผู้บังคับบัญชาทราบ · 5-14 แจ้งผลการดำเนินการ กรณีคัดค้านอนุกรรมการไต่สวน
 * 5-15 บันทึกขอเชิญประชุม (คนใน) · 5-16 หนังสือขอเชิญประชุม (คนนอก)
 * 5-18 บันทึกแจ้งคำสั่งแต่งตั้งคณะพนักงานไต่สวน ให้ผู้บังคับบัญชาทราบ · 5-19 แจ้งผลการดำเนินการ กรณีคัดค้านพนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.
 *
 * เนื้อหากระดาษ = verbatim จากแบบฟอร์มต้นฉบับ (.doc/.docx)
 * ผู้ลงนาม: 5-08/09/10 = ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (authorRole: committee)
 *           5-11/12/14/19 = เลขาธิการคณะกรรมการ ป.ป.ท. หรือผู้ที่ได้รับมอบหมาย (authorRole: secretary)
 *           5-07/13/18 = ผอ.กบค. ปฏิบัติราชการแทนเลขาธิการคณะกรรมการ ป.ป.ท. (authorRole: secretary, signerLabel ต่างจาก 5-11/12/14/19)
 *           5-15/16 = ประธาน/อนุกรรมการและเลขานุการไต่สวน (authorRole: inquiry-subcommittee)
 */
(function initializeActivity5CommitteeNoticeDocuments(root) {
  const DOC_IDS = Object.freeze({
    OBJECTION_NOTICE: "S5_07_OBJECTION_NOTICE",
    SUBCOMMITTEE_ORDER_M62: "S5_08_SUBCOMMITTEE_ORDER_M62",
    SUBCOMMITTEE_ORDER_ADD: "S5_09_SUBCOMMITTEE_ORDER_ADD",
    SUBCOMMITTEE_ORDER_AMEND: "S5_10_SUBCOMMITTEE_ORDER_AMEND",
    SUBCOMMITTEE_NOTICE_OUTSIDER: "S5_11_SUBCOMMITTEE_NOTICE_OUTSIDER",
    SUBCOMMITTEE_NOTICE_SUPERVISOR: "S5_12_SUBCOMMITTEE_NOTICE_SUPERVISOR",
    SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO: "S5_13_SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO",
    OBJECTION_RESULT_SUBCOMMITTEE: "S5_14_OBJECTION_RESULT_SUBCOMMITTEE",
    MEETING_INVITE_INSIDER: "S5_15_MEETING_INVITE_INSIDER",
    MEETING_INVITE_OUTSIDER: "S5_16_MEETING_INVITE_OUTSIDER",
    PANEL_NOTICE_SUPERVISOR_MEMO: "S5_18_PANEL_NOTICE_SUPERVISOR_MEMO",
    OBJECTION_RESULT_PANEL: "S5_19_OBJECTION_RESULT_PANEL"
  });

  const MANIFEST = Object.freeze([
    { formId: DOC_IDS.OBJECTION_NOTICE, code: "5-07", title: "แบบหนังสือแจ้งให้อนุกรรมการไต่สวน พนักงาน ป.ป.ท. เจ้าหน้าที่ ป.ป.ท. ที่ถูกคัดค้านทราบ", shortLabel: "แจ้งผู้ถูกคัดค้านทราบ", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.SUBCOMMITTEE_ORDER_M62, code: "5-08", title: "แบบคำสั่งคณะกรรมการ ป.ป.ท. กรณีแต่งตั้งคณะอนุกรรมการไต่สวน เรื่องที่รับจาก ป.ป.ช. ตามมาตรา 62", shortLabel: "คำสั่งแต่งตั้ง คกก. (ม.62)", stage: "a7-213", authorRole: "committee" },
    { formId: DOC_IDS.SUBCOMMITTEE_ORDER_ADD, code: "5-09", title: "แบบคำสั่งคณะกรรมการ ป.ป.ท. กรณีแต่งตั้งอนุกรรมการไต่สวนเพิ่มเติม", shortLabel: "แต่งตั้งอนุกรรมการเพิ่มเติม", stage: "a7-213", authorRole: "committee" },
    { formId: DOC_IDS.SUBCOMMITTEE_ORDER_AMEND, code: "5-10", title: "แบบคำสั่งคณะกรรมการ ป.ป.ท. กรณีแก้ไขคำสั่งแต่งตั้งอนุกรรมการไต่สวน", shortLabel: "แก้ไขคำสั่งแต่งตั้ง", stage: "a7-213", authorRole: "committee" },
    { formId: DOC_IDS.SUBCOMMITTEE_NOTICE_OUTSIDER, code: "5-11", title: "แบบหนังสือแจ้งคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน หรืออนุกรรมการไต่สวน (เพิ่มเติม) ให้อนุกรรมการไต่สวน (คนนอก) ทราบ", shortLabel: "แจ้งอนุกรรมการไต่สวน (คนนอก)", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR, code: "5-12", title: "แบบหนังสือแจ้งคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน (คนนอก) ให้ผู้บังคับบัญชาทราบ", shortLabel: "แจ้งผู้บังคับบัญชา (คนนอก)", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO, code: "5-13", title: "แบบบันทึกแจ้งคำสั่งแต่งตั้งอนุกรรมการไต่สวน ให้ผู้บังคับบัญชาทราบ", shortLabel: "บันทึกแจ้งผู้บังคับบัญชา", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.OBJECTION_RESULT_SUBCOMMITTEE, code: "5-14", title: "แบบหนังสือแจ้งผลการดำเนินการ กรณีคัดค้านอนุกรรมการไต่สวน", shortLabel: "แจ้งผลคัดค้านอนุกรรมการ", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.MEETING_INVITE_INSIDER, code: "5-15", title: "แบบบันทึกขอเชิญประชุมคณะอนุกรรมการไต่สวน (คนใน)", shortLabel: "เชิญประชุม (คนใน)", stage: "a7-213", authorRole: "inquiry-subcommittee" },
    { formId: DOC_IDS.MEETING_INVITE_OUTSIDER, code: "5-16", title: "แบบหนังสือขอเชิญประชุม (คนนอก)", shortLabel: "เชิญประชุม (คนนอก)", stage: "a7-213", authorRole: "inquiry-subcommittee" },
    { formId: DOC_IDS.PANEL_NOTICE_SUPERVISOR_MEMO, code: "5-18", title: "แบบบันทึกแจ้งคำสั่งแต่งตั้งคณะพนักงานไต่สวน ให้ผู้บังคับบัญชาทราบ", shortLabel: "บันทึกแจ้งคณะพนักงานไต่สวน", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.OBJECTION_RESULT_PANEL, code: "5-19", title: "แบบหนังสือแจ้งผลการดำเนินการ กรณีคัดค้านพนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.", shortLabel: "แจ้งผลคัดค้านพนักงาน", stage: "a7-213", authorRole: "secretary" }
  ]);

  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const text = value => typeof value === "string" ? value.trim() : "";
  const copy = value => JSON.parse(JSON.stringify(value ?? {}));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const show = value => text(value) || "";
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
    s.committeeNoticeDocuments = object(s.committeeNoticeDocuments);
    return s;
  }

  function commonBase(state = {}) {
    const intake = object(object(state.inquiry).intake);
    return {
      letterNo: "", issuedAt: "",
      division: text(intake.unit), divisionPhone: "",
      caseRefNo: text(state.caseData?.trackingCode),
      ownerPhone: "", ownerFax: "", ownerName: "", signerName: ""
    };
  }

  function defaultPayload(formId, state = {}) {
    const base = commonBase(state);
    if (formId === DOC_IDS.OBJECTION_NOTICE) {
      return { ...base, objectorName: "", objectedKind: "อนุกรรมการไต่สวน", committeeOrderNo: "", committeeOrderDate: "" };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_M62) {
      return {
        ...base, orderNo: "", orderDate: "", meetingNo: "", meetingDate: "",
        accusedName: "", accusedIdCard: "", accusedPosition: "", accusedAgency: "",
        allegationNarrative: "", damagedParty: "", incidentDate: "", incidentPlace: "",
        naccMeetingNo: "", naccMeetingDate: "", chairName: "", member2Name: "", secretaryName: ""
      };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_ADD) {
      return {
        ...base, ownOrderNo: "", ownOrderDate: "", origOrderNo: "", origOrderDate: "",
        accusedNamePosition: "", chargeType: "ทุจริตต่อหน้าที่", meetingNo: "", meetingDate: "", additionalMembers: ""
      };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_AMEND) {
      return {
        ...base, ownOrderNo: "", ownOrderDate: "", origOrderNo: "", origOrderDate: "",
        oldMemberName: "", accusedNamePosition: "", chargeType: "ทุจริตต่อหน้าที่",
        changeReason: "", newMemberName: "", meetingNo: "", meetingDate: ""
      };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_OUTSIDER) {
      return { ...base, addresseeName: "", attachOrderNo: "", attachOrderDate: "" };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR) {
      return { ...base, addresseeSupervisor: "", orderNo: "", orderDate: "", appointedNamePosition: "" };
    }
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO) {
      return { ...base, addresseeSupervisor: "", orderNo: "", orderDate: "", appointedNameUnit: "" };
    }
    if (formId === DOC_IDS.OBJECTION_RESULT_SUBCOMMITTEE) {
      return { ...base, addresseeName: "", refLetter: "", committeeOrderNo: "", committeeOrderDate: "", objectionCount: "", meetingNo: "", meetingDate: "", resolutionText: "" };
    }
    if (formId === DOC_IDS.MEETING_INVITE_INSIDER || formId === DOC_IDS.MEETING_INVITE_OUTSIDER) {
      return { ...base, addresseeName: "", committeeOrderNo: "", committeeOrderDate: "", accusedName: "", meetingRound: "", meetingDate: "", meetingTime: "", meetingRoom: "" };
    }
    if (formId === DOC_IDS.PANEL_NOTICE_SUPERVISOR_MEMO) {
      return { ...base, addresseeSupervisor: "", investigator1NameUnit: "", investigator2NameUnit: "", orderNo: "", orderDate: "" };
    }
    // 5-19
    return { ...base, addresseeName: "", refLetter: "", panelOrderNo: "", panelOrderDate: "", objectedNames: "", objectionCount: "", meetingNo: "", meetingDate: "", resolutionText: "" };
  }

  function validateRequired(formId, p) {
    const missing = [];
    const need = (...fields) => fields.forEach(f => { if (!text(p[f])) missing.push(f); });
    if (formId === DOC_IDS.OBJECTION_NOTICE) need("letterNo", "issuedAt", "objectorName", "committeeOrderNo", "committeeOrderDate");
    else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_M62) need("orderNo", "orderDate", "caseRefNo", "accusedName", "chairName", "secretaryName");
    else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_ADD) need("ownOrderNo", "ownOrderDate", "origOrderNo", "origOrderDate", "accusedNamePosition", "additionalMembers");
    else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_AMEND) need("ownOrderNo", "ownOrderDate", "origOrderNo", "origOrderDate", "oldMemberName", "newMemberName");
    else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_OUTSIDER) need("letterNo", "issuedAt", "addresseeName", "attachOrderNo", "attachOrderDate");
    else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR) need("letterNo", "issuedAt", "addresseeSupervisor", "orderNo", "orderDate", "appointedNamePosition");
    else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO) need("letterNo", "issuedAt", "addresseeSupervisor", "orderNo", "orderDate", "appointedNameUnit");
    else if (formId === DOC_IDS.OBJECTION_RESULT_SUBCOMMITTEE) need("letterNo", "issuedAt", "addresseeName", "meetingNo", "meetingDate", "resolutionText");
    else if (formId === DOC_IDS.MEETING_INVITE_INSIDER || formId === DOC_IDS.MEETING_INVITE_OUTSIDER) need("letterNo", "issuedAt", "addresseeName", "meetingRound", "meetingDate");
    else if (formId === DOC_IDS.PANEL_NOTICE_SUPERVISOR_MEMO) need("letterNo", "issuedAt", "addresseeSupervisor", "investigator1NameUnit", "orderNo", "orderDate");
    else if (formId === DOC_IDS.OBJECTION_RESULT_PANEL) need("letterNo", "issuedAt", "addresseeName", "meetingNo", "meetingDate", "resolutionText");
    return missing;
  }

  function executeCommitteeNoticeDocumentAction(sourceState, actor = {}, command = {}) {
    const formId = text(command.formId);
    const meta = getMeta(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: sourceState, messageTh: "ไม่พบแบบเอกสาร" };

    if (!["save","submit","addrow","delrow"].includes(String(command.action || "save"))) return { ok: false, error: "UNSUPPORTED_ACTION", state: sourceState, messageTh: "ไม่รองรับการดำเนินการนี้" };    const s = normalizeState(sourceState);
    const now = text(command.at) || new Date().toISOString();
    const current = object(s.committeeNoticeDocuments[formId]);
    const payload = command.payload && typeof command.payload === "object" ? copy(command.payload) : object(current.fields);

    if (!text(actor.id)) return { ok: false, error: "FORBIDDEN_ACTOR", state: sourceState, messageTh: "ไม่พบผู้ดำเนินการและบทบาทที่ผ่านการยืนยัน" };
    if (text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", state: s, messageTh: `ผู้มีหน้าที่จัดทำเอกสารนี้คือ ${meta.authorRole} เท่านั้น` };
    }
    if (!s.committeeNoticeDocuments[formId] && String(command.action || "save") !== "submit") {
      s.committeeNoticeDocuments[formId] = { formId, status: "DRAFT", createdAt: now, updatedAt: now, fields: payload };
      return { ok: true, state: s, code: "COMMITTEE_NOTICE_DOC_DRAFT_CREATED" };
    }
    if (text(command.action) === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", state: s, messageTh: "เอกสารถูกส่งแล้ว" };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", state: s, missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}` };
      s.committeeNoticeDocuments[formId] = { ...current, status: "SUBMITTED", submittedAt: now, submittedBy: text(actor.id), fields: payload };
      return { ok: true, state: s, code: "COMMITTEE_NOTICE_DOC_SUBMITTED" };
    }
    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", state: s, messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้" };
    s.committeeNoticeDocuments[formId] = { ...current, updatedAt: now, updatedBy: text(actor.id), fields: payload };
    return { ok: true, state: s, code: "COMMITTEE_NOTICE_DOC_DRAFT_SAVED" };
  }

  // ---------- editor (ฝั่งซ้าย) ----------
  const field = (label, name, value, type = "input") => `<label class="a5-field-block${type === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${type === "textarea" ? `<textarea class="a5-textarea" data-a5-cnotice-path="${name}" rows="2">${escapeHtml(value)}</textarea>` : `<input type="text" class="a5-input" data-a5-cnotice-path="${name}" value="${escapeHtml(value)}">`}</label>`;
  const selectField = (label, name, value, options) => `<label class="a5-field-block"><span>${escapeHtml(label)}</span><select class="a5-input" data-a5-cnotice-path="${name}">${options.map(o => `<option value="${escapeHtml(o)}"${value === o ? " selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select></label>`;

  function renderCommitteeNoticeEditorA5(state = {}, formId, options = {}) {
    const meta = getMeta(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const doc = object(normalizeState(state).committeeNoticeDocuments[formId]);
    const f = Object.assign(defaultPayload(formId, state), object(doc.fields));
    let body = "";

    if (formId === DOC_IDS.OBJECTION_NOTICE) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("สำนัก/กอง", "division", f.division)}${field("โทร.", "divisionPhone", f.divisionPhone)}
  ${field("ที่ (ปป ๐๐../...)", "letterNo", f.letterNo)}${field("วันที่", "issuedAt", f.issuedAt)}
  ${field("ผู้ยื่นหนังสือคัดค้าน (ชื่อ-สกุล)", "objectorName", f.objectorName)}
  ${selectField("คัดค้าน", "objectedKind", f.objectedKind, ["อนุกรรมการไต่สวน", "พนักงาน ป.ป.ท.", "เจ้าหน้าที่ ป.ป.ท."])}
  ${field("ตามคำสั่งคณะกรรมการ ป.ป.ท. ลับ ที่", "committeeOrderNo", f.committeeOrderNo)}${field("ลงวันที่", "committeeOrderDate", f.committeeOrderDate)}
  ${field("ผู้ลงนาม (ผอ.กบค. ปฏิบัติราชการแทนเลขาธิการฯ)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_M62) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}${field("สั่ง ณ วันที่", "orderDate", f.orderDate)}
  ${field("มติ คกก. ป.ป.ท. ครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("สำนวนคดีเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ผู้ถูกกล่าวหา (ชื่อ-สกุล)", "accusedName", f.accusedName)}${field("เลขประจำตัวประชาชน", "accusedIdCard", f.accusedIdCard)}
  ${field("ตำแหน่งขณะเกิดเหตุ", "accusedPosition", f.accusedPosition)}${field("สังกัด", "accusedAgency", f.accusedAgency)}
  ${field("พฤติการณ์การกระทำความผิด", "allegationNarrative", f.allegationNarrative, "textarea")}
  ${field("ผู้ได้รับความเสียหาย", "damagedParty", f.damagedParty)}${field("เหตุเกิดเมื่อวันที่", "incidentDate", f.incidentDate)}
  ${field("เหตุเกิดที่", "incidentPlace", f.incidentPlace)}
  ${field("มติ คกก. ป.ป.ช. ครั้งที่", "naccMeetingNo", f.naccMeetingNo)}${field("เมื่อวันที่", "naccMeetingDate", f.naccMeetingDate)}
  ${field("ประธานอนุกรรมการ", "chairName", f.chairName)}${field("อนุกรรมการ", "member2Name", f.member2Name)}
  ${field("อนุกรรมการและเลขานุการ", "secretaryName", f.secretaryName)}
  ${field("ผู้ลงนาม (ประธานกรรมการ ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_ADD) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("คำสั่งที่ (ฉบับนี้)", "ownOrderNo", f.ownOrderNo)}${field("สั่ง ณ วันที่", "ownOrderDate", f.ownOrderDate)}
  ${field("อนุสนธิคำสั่งที่", "origOrderNo", f.origOrderNo)}${field("ลงวันที่", "origOrderDate", f.origOrderDate)}
  ${field("ผู้ถูกกล่าวหา (ชื่อ-นามสกุล และตำแหน่ง)", "accusedNamePosition", f.accusedNamePosition)}
  ${selectField("กระทำความผิดฐาน", "chargeType", f.chargeType, ["ทุจริตต่อหน้าที่", "กระทำความผิดต่อตำแหน่งหน้าที่ราชการ", "กระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม", "ประพฤติมิชอบ"])}
  ${field("สำนวนคดีเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("อนุกรรมการไต่สวนเพิ่มเติม (หนึ่งชื่อต่อบรรทัด)", "additionalMembers", f.additionalMembers, "textarea")}
  ${field("ผู้ลงนาม (ประธานกรรมการ ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_AMEND) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("คำสั่งที่ (ฉบับนี้)", "ownOrderNo", f.ownOrderNo)}${field("สั่ง ณ วันที่", "ownOrderDate", f.ownOrderDate)}
  ${field("อนุสนธิคำสั่งที่", "origOrderNo", f.origOrderNo)}${field("ลงวันที่", "origOrderDate", f.origOrderDate)}
  ${field("อนุกรรมการไต่สวนเดิม (ชื่อ-นามสกุล)", "oldMemberName", f.oldMemberName)}
  ${field("ผู้ถูกกล่าวหา (ชื่อ-นามสกุล และตำแหน่ง)", "accusedNamePosition", f.accusedNamePosition)}
  ${selectField("กระทำความผิดฐาน", "chargeType", f.chargeType, ["ทุจริตต่อหน้าที่", "กระทำความผิดต่อตำแหน่งหน้าที่ราชการ", "กระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม", "ประพฤติมิชอบ"])}
  ${field("เหตุผลที่จำเป็นต้องเปลี่ยนแปลง", "changeReason", f.changeReason, "textarea")}
  ${field("อนุกรรมการไต่สวนแทน (ชื่อ-นามสกุล)", "newMemberName", f.newMemberName)}
  ${field("ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("ผู้ลงนาม (ประธานกรรมการ ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_OUTSIDER) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ชื่ออนุกรรมการไต่สวน)", "addresseeName", f.addresseeName)}
  ${field("สิ่งที่ส่งมาด้วย — สำเนาคำสั่งที่", "attachOrderNo", f.attachOrderNo)}${field("ลงวันที่", "attachOrderDate", f.attachOrderDate)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("ผู้รับผิดชอบ (ชื่อ-สกุล)", "ownerName", f.ownerName)}
  ${field("ผู้ลงนาม (เลขาธิการฯ/ผู้ได้รับมอบหมาย)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (หัวหน้าหน่วยงานต้นสังกัด)", "addresseeSupervisor", f.addresseeSupervisor)}
  ${field("คำสั่งที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("ผู้ได้รับแต่งตั้ง (ชื่อ-ตำแหน่ง-สังกัด)", "appointedNamePosition", f.appointedNamePosition)}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("เจ้าของสำนวน (ชื่อ-สกุล)", "ownerName", f.ownerName)}
  ${field("ผู้ลงนาม (เลขาธิการฯ/ผู้ได้รับมอบหมาย)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("สำนัก/กอง", "division", f.division)}${field("โทร.", "divisionPhone", f.divisionPhone)}
  ${field("ที่ (ปป ๐๐../...)", "letterNo", f.letterNo)}${field("วันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ผอ.สำนักฯ/กอง ของผู้ที่ได้รับแต่งตั้ง)", "addresseeSupervisor", f.addresseeSupervisor)}
  ${field("คำสั่งที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("ผู้ได้รับแต่งตั้ง (ชื่อ-สกุล สังกัด)", "appointedNameUnit", f.appointedNameUnit)}
  ${field("ผู้ลงนาม (ผอ.กบค. ปฏิบัติราชการแทนเลขาธิการฯ)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.OBJECTION_RESULT_SUBCOMMITTEE) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ผู้ถูกกล่าวหา/ผู้มีส่วนได้เสีย ที่คัดค้าน)", "addresseeName", f.addresseeName)}
  ${field("อ้างถึง (หนังสือคัดค้าน)", "refLetter", f.refLetter)}
  ${field("ตามคำสั่ง คกก. ป.ป.ท. ที่", "committeeOrderNo", f.committeeOrderNo)}${field("ลงวันที่", "committeeOrderDate", f.committeeOrderDate)}
  ${field("จำนวนผู้ถูกคัดค้าน (ราย)", "objectionCount", f.objectionCount)}
  ${field("มติ คกก. ครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("มติว่า", "resolutionText", f.resolutionText, "textarea")}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("เจ้าของสำนวน (ชื่อ-สกุล)", "ownerName", f.ownerName)}
  ${field("ผู้ลงนาม (เลขาธิการฯ/ผู้ได้รับมอบหมาย)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.MEETING_INVITE_INSIDER || formId === DOC_IDS.MEETING_INVITE_OUTSIDER) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("สำนัก/กอง", "division", f.division)}${field("โทร.", "divisionPhone", f.divisionPhone)}
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ชื่อ-สกุล ประธาน/อนุกรรมการไต่สวน)", "addresseeName", f.addresseeName)}
  ${field("ตามคำสั่ง คกก. ป.ป.ท. ที่", "committeeOrderNo", f.committeeOrderNo)}${field("ลงวันที่", "committeeOrderDate", f.committeeOrderDate)}
  ${field("กรณีกล่าวหา (ชื่อ-นามสกุลผู้ถูกกล่าวหา)", "accusedName", f.accusedName)}${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ประชุมครั้งที่", "meetingRound", f.meetingRound)}${field("วันที่", "meetingDate", f.meetingDate)}
  ${field("เวลา", "meetingTime", f.meetingTime)}${field("ห้องประชุม", "meetingRoom", f.meetingRoom)}
  ${field("ผู้ลงนาม (ประธาน/อนุกรรมการและเลขานุการไต่สวน)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.PANEL_NOTICE_SUPERVISOR_MEMO) {
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("สำนัก/กอง", "division", f.division)}${field("โทร.", "divisionPhone", f.divisionPhone)}
  ${field("ที่ (ปป ๐๐../...)", "letterNo", f.letterNo)}${field("วันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ผอ.สำนักฯ/กอง ของพนักงาน ป.ป.ท. เจ้าของสำนวน)", "addresseeSupervisor", f.addresseeSupervisor)}
  ${field("พนักงาน ป.ป.ท. เจ้าของสำนวน (ชื่อ-สกุล สังกัด)", "investigator1NameUnit", f.investigator1NameUnit)}
  ${field("พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. (ชื่อ-สกุล สังกัด)", "investigator2NameUnit", f.investigator2NameUnit)}
  ${field("คำสั่งสำนักงาน ป.ป.ท. ที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("ผู้ลงนาม (ผอ.กบค. ปฏิบัติราชการแทนเลขาธิการฯ)", "signerName", f.signerName)}
</div>`;
    } else {
      // 5-19
      body = `<h3>${escapeHtml(meta.title)}</h3><div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ผู้ถูกกล่าวหา/ผู้มีส่วนได้เสีย ที่คัดค้าน)", "addresseeName", f.addresseeName)}
  ${field("อ้างถึง (หนังสือคัดค้าน)", "refLetter", f.refLetter)}
  ${field("ตามคำสั่งสำนักงาน ป.ป.ท. ที่", "panelOrderNo", f.panelOrderNo)}${field("ลงวันที่", "panelOrderDate", f.panelOrderDate)}
  ${field("ผู้ถูกคัดค้าน (ชื่อ-สกุล พนักงาน/เจ้าหน้าที่ ป.ป.ท.)", "objectedNames", f.objectedNames)}${field("จำนวน (ราย)", "objectionCount", f.objectionCount)}
  ${field("มติ คกก. ครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("มติว่า", "resolutionText", f.resolutionText, "textarea")}
  ${field("โทร.", "ownerPhone", f.ownerPhone)}${field("โทรสาร", "ownerFax", f.ownerFax)}
  ${field("เจ้าของสำนวน (ชื่อ-สกุล)", "ownerName", f.ownerName)}
  ${field("ผู้ลงนาม (เลขาธิการฯ/ผู้ได้รับมอบหมาย)", "signerName", f.signerName)}
</div>`;
    }

    const buttons = editable ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-cnotice-action="save" data-doc-id="${escapeHtml(formId)}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-cnotice-action="submit" data-doc-id="${escapeHtml(formId)}">ส่งเอกสาร</button></div>` : "";
    return `<div class="a5-cnotice-editor" data-doc-id="${escapeHtml(formId)}"><p class="ws-policy-note">ปปท. ${escapeHtml(meta.code)} — ${escapeHtml(meta.title)}${doc.status === "SUBMITTED" ? " · ส่งแล้ว (อ่านอย่างเดียว)" : ""}</p>${body}${buttons}</div>`;
  }

  function captureCommitteeNoticeEditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-cnotice-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5CnoticePath;
      if (!path) return;
      const parts = path.split(".");
      let current = payload;
      parts.forEach((key, index) => {
        if (index === parts.length - 1) {
          current[key] = controlElement.tagName === "SELECT" ? controlElement.value : controlElement.value;
        } else {
          current[key] = object(current[key]);
          current = current[key];
        }
      });
    });
    return payload;
  }

  // ---------- paper (ฝั่งขวา — verbatim) ----------
  const headRow = f => `<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ${dot(f.letterNo, 90, 'ปป ๐๐.../...')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>(วัน เดือน ปี) ${dot(f.issuedAt, 60, '....................')}</p></div>`;

  const memoHead = (f, subject, addressee) => `<h2 class="a5-paper-title">บันทึกข้อความ</h2>
<p><strong>ส่วนราชการ</strong> สำนัก/กอง${dot(f.division, 80, '......')} &nbsp;<strong>โทร.</strong> ${dot(f.divisionPhone, 60, '....')}</p>
<p><strong>ที่</strong> ${dot(f.letterNo, 90, 'ปป ๐๐../...')} <span class="a5-paper-right"><strong>วันที่</strong> ${dot(f.issuedAt, 60, '....................')}</span></p>
<p><strong>เรื่อง</strong> ${subject}</p>
<p><strong>เรียน</strong> ${addressee}</p>`;

  const chiefActingSecretarySignBlock = f => `<p style="margin-top:1.5em">(${dot(f.signerName, 160, '..............................................')})<br>ผอ. กบค. ปฏิบัติราชการแทน<br>เลขาธิการคณะกรรมการ ป.ป.ท.</p>`;

  const secretarySignBlock = (f, ownerLabel = 'เจ้าของสำนวน') => `<p style="text-align:left;margin-top:1.5em">(${dot(f.signerName, 160, '…………………………………..')})<br>เลขาธิการคณะกรรมการ ป.ป.ท.<br>หรือ ผู้ที่ได้รับมอบหมาย</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขต เจ้าของเรื่อง)<br>โทร. ${dot(f.ownerPhone, 100, '...............................')}<br>โทรสาร ${dot(f.ownerFax, 90, '.........................')}<br>(นาย/นาง/นางสาว${dot(f.ownerName, 100, '..................................')}${ownerLabel})</p>`;

  const chairmanSignBlock = f => `<p style="margin-top:1.5em">(${dot(f.signerName, 160, '.....................................')})<br>ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>`;

  const subcommitteeChairSignBlock = f => `<p style="margin-top:1.5em">(${dot(f.signerName, 160, '..............................................')})<br>ประธาน/อนุกรรมการและเลขานุการไต่สวน</p>`;

  const AGENDA_ITEMS = {
    1: `<p><strong>วาระที่ ๑</strong> เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ</p>
<p><strong>วาระที่ ๒</strong> เรื่องเสนอเพื่อพิจารณา</p>
<p class="a5-p-indent">๒.๑ พิจารณากำหนดแนวทางและระยะเวลาในการไต่สวน (ข้อ 8๙)</p>
<p class="a5-p-indent">๒.๒ พิจารณามอบหมายให้อนุกรรมการที่เป็นพนักงานเจ้าหน้าที่ และหรืออนุกรรมการคนใดคนหนึ่งหรือหลายคน ปฏิบัติหน้าที่ตามที่มอบหมาย (ข้อ 9๖)</p>
<p><strong>วาระที่ ๓</strong> เรื่องอื่น ๆ (ถ้ามี)</p>`,
    2: `<p><strong>วาระที่ ๑</strong> เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ</p>
<p><strong>วาระที่ 2</strong> เรื่องรับรองรายงานการประชุม ครั้งที่ 1/......... เมื่อวันที่.........................................</p>
<p><strong>วาระที่ ๓</strong> เรื่องเพื่อทราบ — ฝ่ายเลขารายงานผลการดำเนินการไต่สวนที่ผ่านมา</p>
<p><strong>วาระที่ ๔</strong> เรื่องเพื่อพิจารณา — พิจารณาข้อเท็จจริงและพยานหลักฐานจาการไต่สวนข้อเท็จจริงว่าเพียงพอที่จะแจ้งข้อกล่าวหาหรือไม่ หากเพียงพอจะแจ้งในความผิดอาญาและวินัยฐานใด</p>
<p><strong>วาระที่ 5</strong> เรื่องอื่น ๆ (ถ้ามี)</p>`,
    3: `<p><strong>วาระที่ ๑</strong> เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ</p>
<p><strong>วาระที่ 2</strong> เรื่องรับรองรายงานการประชุม ครั้งที่ 2/......... เมื่อวันที่.........................................</p>
<p><strong>วาระที่ ๓</strong> เรื่องเพื่อทราบ — ฝ่ายเลขารายงานผลการแจ้งข้อกล่าวหาและการชี้แจงแก้ข้อกล่าวหา</p>
<p><strong>วาระที่ ๔</strong> เรื่องเพื่อพิจารณา — พิจารณาคำชี้แจงแก้ข้อกล่าวหาของผู้ถูกกล่าวหา และการไต่สวนข้อเท็จจริงเพิ่มเติมตามประเด็นที่ผู้ถูกกล่าวหาชี้แจง</p>
<p><strong>วาระที่ 5</strong> เรื่องอื่น ๆ (ถ้ามี)</p>`,
    4: `<p><strong>วาระที่ ๑</strong> เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ</p>
<p><strong>วาระที่ 2</strong> เรื่องรับรองรายงานการประชุม ครั้งที่ 3/......... เมื่อวันที่.........................................</p>
<p><strong>วาระที่ ๓</strong> เรื่องเพื่อทราบ — ฝ่ายเลขารายงานผลการไต่สวนพยานบุคคลฝ่ายผู้ถูกกล่าวหา</p>
<p><strong>วาระที่ ๔</strong> เรื่องเพื่อพิจารณา — พิจารณาพยานหลักฐานและวินิจฉัยในประเด็นข้อเท็จจริงและข้อกฎหมาย (ข้อ 97)</p>
<p><strong>วาระที่ 5</strong> เรื่องอื่น ๆ (ถ้ามี)</p>`
  };

  function agendaPage(round, caseName) {
    return `<section class="a5-paper-page">
<h3 class="a5-paper-title">ระเบียบวาระการประชุม</h3>
<p class="a5-paper-center">คณะอนุกรรมการไต่สวน กรณีกล่าวหา ${escapeHtml(caseName)}</p>
<p class="a5-paper-center">ครั้งที่ ${round}/..............<br>วันที่..............เวลา ........ น.<br>ณ ห้องประชุมชั้น ........ สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี</p>
${AGENDA_ITEMS[round]}
</section>`;
  }

  function paperObjectionNotice(f) {
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
${memoHead(f, 'แจ้งการคัดค้านอนุกรรมการไต่สวน /พนักงาน ป.ป.ท. /เจ้าหน้าที่ ป.ป.ท.', 'ผอ.สำนัก/กอง')}
<p class="a5-p-indent">ด้วย ${dot(f.objectorName, 160, '(ชื่อ - สกุล ผู้ยื่นหนังสือคัดค้าน)')} ได้มีหนังสือคัดค้าน (${escapeHtml(show(f.objectedKind)) || 'อนุกรรมการไต่สวน /พนักงาน ป.ป.ท. /เจ้าหน้าที่ ป.ป.ท.'}) ตามคำสั่งคณะกรรมการ ป.ป.ท. ลับ ที่ ${dot(f.committeeOrderNo, 80, '...............')} ลงวันที่ ${dot(f.committeeOrderDate, 100, '...................................')})</p>
<p class="a5-p-indent">ในการนี้ เพื่อประโยชน์ในการไต่สวน ตามมาตรา 30 วรรคสอง แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. 2551 และที่แก้ไขเพิ่มเติม กองบริหารคดี จึงขอแจ้งให้ผู้ถูกคัดค้านระงับการปฏิบัติหน้าที่ไว้พลางก่อน และให้ผู้ถูกคัดค้านทำบันทึกชี้แจงเสนอคณะกรรมการ ป.ป.ท. เพื่อพิจารณาวินิจฉัยโดยด่วน</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
${chiefActingSecretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-07</p></article>`;
  }

  function paperSubcommitteeOrderM62(f) {
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
<p class="a5-paper-right">ลับ</p>
<h2 class="a5-paper-title">คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</h2>
<p class="a5-paper-center">ที่ ${dot(f.orderNo, 80, '…………../…………..')}</p>
<p class="a5-paper-center"><strong>เรื่อง</strong> แต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติในการประชุม ครั้งที่ ${dot(f.meetingNo, 60, '....../.........')} เมื่อวันที่ ${dot(f.meetingDate, 90, '......................')} ให้รับไว้ไต่สวนโดยแต่งตั้งคณะอนุกรรมการไต่สวน สำนวนคดีเรื่องที่ ${dot(f.caseRefNo, 150, '............................................')} กรณีกล่าวหา ${dot(f.accusedName, 150, '...............................................')} เลขประจำตัวประชาชน ${dot(f.accusedIdCard, 100, '……………………………......')} ขณะเกิดเหตุดำรงตำแหน่ง ${dot(f.accusedPosition, 150, '...............................................')} สังกัด ${dot(f.accusedAgency, 150, '...........................................................………….')} ผู้ถูกกล่าวหา ว่ากระทำการทุจริตในภาครัฐ โดยมีพฤติการณ์กล่าวคือ ตามวันและเวลาเกิดเหตุ (พฤติการณ์การกระทำความผิด และข้อเท็จจริงที่เกี่ยวข้อง) ${dot(f.allegationNarrative, 400, '...................................................................................................................')} เป็นเหตุให้ ${dot(f.damagedParty, 120, '................................................')} ได้รับความเสียหาย เหตุเกิดเมื่อวันที่ ${dot(f.incidentDate, 80, '............................')} ที่ ${dot(f.incidentPlace, 120, '...........................................')}</p>
<p class="a5-p-indent">อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) (10) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ประกอบมติคณะกรรมการ ป.ป.ช. ครั้งที่ ${dot(f.naccMeetingNo, 60, '......../.............')} เมื่อวันที่${dot(f.naccMeetingDate, 90, '..............................')} มอบหมายให้คณะกรรมการ ป.ป.ท. ดำเนินการแทน ตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. 2561 มาตรา 62 จึงแต่งตั้งคณะอนุกรรมการไต่สวน โดยมีองค์ประกอบและอำนาจหน้าที่ ดังนี้</p>
<p><strong>ก. องค์ประกอบ</strong></p>
<table class="a5-signature-table"><tbody>
<tr><td>๑. ${dot(f.chairName, 160, '……………………………………….')}</td><td>ประธานอนุกรรมการ</td></tr>
<tr><td>๒. ${dot(f.member2Name, 160, '……………………………………….')}</td><td>อนุกรรมการ</td></tr>
<tr><td>๓. ${dot(f.secretaryName, 160, '……………………………………….')}</td><td>อนุกรรมการและเลขานุการ</td></tr>
</tbody></table>
<p><strong>ข. อำนาจหน้าที่</strong></p>
<p>๑. แสวงหา รวบรวม และดำเนินการอื่นใด เพื่อให้ได้มาซึ่งข้อเท็จจริงและพยานหลักฐาน โดยให้มีอำนาจตามมาตรา ๑๘ และมาตรา ๑๙ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>
<p>2. ดำเนินการไต่สวนให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568</p>
<p>3. เมื่อดำเนินการไต่สวนแล้วเสร็จ ให้เสนอสำนวนไต่สวนต่อคณะกรรมการ ป.ป.ท. เพื่อพิจารณาให้ความเห็นชอบและวินิจฉัยชี้มูล</p>
<p>4. รับผิดชอบดำเนินการใด ๆ ซึ่งเกี่ยวข้องกับสำนวนการไต่สวน จนกว่าจะปรากฏข้อเท็จจริง ว่าสำนวนการไต่สวนดังกล่าวนี้ ศาลได้มีคำพิพากษาถึงที่สุด</p>
<p>๕. ดำเนินการอื่นใดตามที่คณะกรรมการ ป.ป.ท. มอบหมาย</p>
<p class="a5-p-indent">อนึ่ง ในการดำเนินการไต่สวนของคณะอนุกรรมการไต่สวน หากพบว่ามีเจ้าหน้าที่ของรัฐหรือบุคคลอื่นซึ่งเป็นตัวการ ผู้ใช้ ผู้สนับสนุน รวมทั้งผู้ให้ ขอให้ รับว่าจะให้ หรือนิติบุคคลที่เกี่ยวข้องกับการให้ทรัพย์สินหรือประโยชน์อื่นใดแก่บุคคล เพื่อจูงใจให้กระทำการ ไม่กระทำการ หรือประวิงการกระทำอันมิชอบด้วยกฎหมายในระหว่างการไต่สวน ให้คณะอนุกรรมการไต่สวนรายงานให้คณะกรรมการ ป.ป.ท. ทราบโดยเร็ว เพื่อพิจารณาดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติมต่อไป</p>
<p>ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p>สั่ง ณ วันที่ ${dot(f.orderDate, 120, '(วันที่ ประธานคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
${chairmanSignBlock(f)}
<p class="a5-form-corner">ปปท. 5-08</p></article>`;
  }

  function paperSubcommitteeOrderAdd(f) {
    const members = (text(f.additionalMembers) || "............................................").split("\n").map(name => `<p>${escapeHtml(name.trim() || "............................................")} &nbsp;&nbsp;อนุกรรมการ</p>`).join("");
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
<p class="a5-paper-right">ลับ</p>
<h2 class="a5-paper-title">คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</h2>
<p class="a5-paper-center">ที่${dot(f.ownOrderNo, 60, '...../....')}</p>
<p class="a5-paper-center"><strong>เรื่อง</strong> แต่งตั้งอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐเพิ่มเติม</p>
<p class="a5-p-indent">อนุสนธิคำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ที่ ${dot(f.origOrderNo, 80, '.........../...........')} ลงวันที่${dot(f.origOrderDate, 100, '.....................................')}เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ กรณีกล่าวหา ${dot(f.accusedNamePosition, 200, '....(ชื่อ-นามสกุล และตำแหน่งของผู้ถูกกล่าวหา)....')} ว่ากระทำความผิดฐาน (${escapeHtml(show(f.chargeType)) || 'ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ'}) สำนวนคดีเรื่องที่ ${dot(f.caseRefNo, 120, '..........................')}</p>
<p class="a5-p-indent">เพื่อให้การไต่สวนข้อเท็จจริงมีประสิทธิภาพยิ่งขึ้น อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) (10) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ประกอบกับมติคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ในการประชุมครั้งที่${dot(f.meetingNo, 60, '....................')}เมื่อวันที่${dot(f.meetingDate, 90, '..........................')} จึงแต่งตั้งอนุกรรมการไต่สวนเพิ่มเติม ดังนี้</p>
${members}
<p class="a5-p-indent">โดยให้มีอำนาจหน้าที่เช่นเดียวกับคณะอนุกรรมการไต่สวนตามคำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ที่${dot(f.origOrderNo, 60, '....../.......')}ลงวันที่${dot(f.origOrderDate, 90, '.........................')} ทุกประการ</p>
<p>ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p>สั่ง ณ วันที่ ${dot(f.ownOrderDate, 120, '(วันที่ ประธานคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
${chairmanSignBlock(f)}
<p class="a5-form-corner">ปปท. 5-09</p></article>`;
  }

  function paperSubcommitteeOrderAmend(f) {
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
<p class="a5-paper-right">ลับ</p>
<h2 class="a5-paper-title">คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</h2>
<p class="a5-paper-center">ที่${dot(f.ownOrderNo, 60, '...../.....')}</p>
<p class="a5-paper-center"><strong>เรื่อง</strong> แก้ไขคำสั่งแต่งตั้งอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</p>
<p class="a5-p-indent">อนุสนธิคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot(f.origOrderNo, 80, '......../...........')} ลงวันที่ ${dot(f.origOrderDate, 100, '............................')} ได้แต่งตั้ง ${dot(f.oldMemberName, 150, '...(ชื่อ – นามสกุลของอนุกรรมการไต่สวน)...')} เป็นอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ โดยกล่าวหา ${dot(f.accusedNamePosition, 180, '.....(ชื่อ-นามสกุล และตำแหน่งของผู้ถูกกล่าวหา).....')} ว่ากระทำความผิดฐาน (${escapeHtml(show(f.chargeType)) || 'ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ'})</p>
<p class="a5-p-indent">เนื่องจาก ${dot(f.oldMemberName, 150, '(ชื่อ – นามสกุลของอนุกรรมการไต่สวนตามคำสั่งเดิม)')} ได้ ${dot(f.changeReason, 200, '(ระบุเหตุผลที่จำเป็นต้องเปลี่ยนแปลงอนุกรรมการไต่สวน)')} ดังนั้น เพื่อให้การไต่สวนมีประสิทธิภาพยิ่งขึ้น อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) (10) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ประกอบกับมติคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ในการประชุมครั้งที่${dot(f.meetingNo, 60, '.........')}เมื่อวันที่${dot(f.meetingDate, 90, '..................')}จึงแต่งตั้ง ${dot(f.newMemberName, 150, '(ชื่อ –นามสกุลของผู้ได้รับการแต่งตั้งเป็นอนุกรรมการไต่สวนแทน)')} เป็นอนุกรรมการแทน นอกนั้นให้เป็นไปตามคำสั่งเดิมทุกประการ</p>
<p>ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p>สั่ง ณ วันที่ ${dot(f.ownOrderDate, 120, '(วันที่คณะกรรมการ ป.ป.ท. มีมติ)')}</p>
${chairmanSignBlock(f)}
<p class="a5-form-corner">ปปท. 5-10</p></article>`;
  }

  function paperSubcommitteeNoticeOutsider(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-cnotice-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;แต่งตั้งคณะอนุกรรมการไต่สวน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 220, '(ให้ระบุชื่อของอนุกรรมการไต่สวน)')}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;สำเนาคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot(f.attachOrderNo, 80, '....................')} ลงวันที่ ${dot(f.attachOrderDate, 100, '........................................')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน ตามนัยมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่งท่านได้รับการแต่งตั้งเป็นอนุกรรมการไต่สวน รายละเอียดตามสิ่งที่ส่งมาด้วย</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f, "ผู้รับผิดชอบ")}
<p class="a5-form-corner">ปปท. 5-11</p></article>`;
  }

  function paperSubcommitteeNoticeSupervisor(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-cnotice-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;แต่งตั้งคณะอนุกรรมการไต่สวน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeSupervisor, 220, '(หัวหน้าหน่วยงานต้นสังกัดผู้ที่ได้รับแต่งตั้งเป็นอนุกรรมการ)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ได้มีคำสั่งที่ ${dot(f.orderNo, 80, '......')} ลงวันที่ ${dot(f.orderDate, 90, '........')} แต่งตั้งคณะอนุกรรมการไต่สวน ตามนัยมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหาร ในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่ง ${dot(f.appointedNamePosition, 180, '(ชื่อ - ตำแหน่ง สังกัด)')} ได้รับการแต่งตั้งเป็นอนุกรรมการไต่สวน</p>
<p class="a5-p-indent">ทั้งนี้ สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ได้แจ้งให้ (ชื่อ - นามสกุลของอนุกรรมการ) ทราบคำสั่งแล้ว</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-12</p></article>`;
  }

  function paperSubcommitteeNoticeSupervisorMemo(f) {
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
${memoHead(f, 'แต่งตั้งคณะอนุกรรมการไต่สวน', dot(f.addresseeSupervisor, 260, 'ผู้อำนวยการสำนักฯ /กอง ของผู้ที่ได้รับการแต่งตั้งเป็นอนุกรรมการไต่สวน'))}
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีคำสั่งที่${dot(f.orderNo, 60, '....../.......')} เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ ลงวันที่${dot(f.orderDate, 90, '...................')} เพื่อดำเนินการไต่สวนข้อเท็จจริงตามนัยมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่ง ${dot(f.appointedNameUnit, 150, '(ชื่อ - สกุล สังกัด ที่ได้รับแต่งตั้ง)')} ได้รับการแต่งตั้งเป็นอนุกรรมการไต่สวน รายละเอียดตามสำเนาคำสั่งที่แนบมาพร้อมนี้</p>
<p>จึงเรียนมาเพื่อโปรดทราบ และขอให้แจ้งผู้ซึ่งได้รับการแต่งตั้งตามคำสั่งดังกล่าวทราบด้วย</p>
${chiefActingSecretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-13</p></article>`;
  }

  function paperObjectionResultSubcommittee(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-cnotice-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;แจ้งผลการดำเนินการ กรณีการคัดค้านอนุกรรมการไต่สวน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 220, '..........(ผู้ถูกกล่าวหา/ผู้มีส่วนได้เสีย ที่คัดค้านอนุกรรมการไต่สวน).........')}</p>
<p><strong>อ้างถึง</strong>&nbsp;&nbsp;${dot(f.refLetter, 220, '(หนังสือของผู้ถูกกล่าวหา/ผู้มีส่วนได้เสีย ที่คัดค้านอนุกรรมการไต่สวน)')}</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง ท่านได้คัดค้านคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวนตามคำสั่งคณะกรรมการ ป.ป.ท. ที่${dot(f.committeeOrderNo, 80, '........................')}ลงวันที่${dot(f.committeeOrderDate, 100, '................................')}โดยคัดค้านอนุกรรมการไต่สวน จำนวน ${dot(f.objectionCount, 40, '......')} ราย ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ได้พิจารณาเรื่องดังกล่าว ในการประชุมครั้งที่${dot(f.meetingNo, 60, '.........')}เมื่อวันที่${dot(f.meetingDate, 90, '.................')}มีมติว่า ${dot(f.resolutionText, 220, '..........................................................')}</p>
<p>จึงเรียนมาเพื่อทราบ</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-14</p></article>`;
  }

  function paperMeetingInviteInsider(f) {
    const agendaCase = show(f.accusedName) || ".....................................";
    return `<article class="a5-report-paper a5-cnotice-paper">
<section class="a5-paper-page">
${memoHead(f, 'ขอเชิญประชุม', dot(f.addresseeName, 220, '(ชื่อ-สกุล) ประธาน/อนุกรรมการไต่สวน'))}
<p class="a5-p-indent">ด้วยประธานอนุกรรมการไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. ที่${dot(f.committeeOrderNo, 60, '........')}ลงวันที่${dot(f.committeeOrderDate, 90, '....................')}กรณีกล่าวหา ${dot(f.accusedName, 150, '(ชื่อ – นามสกุล ผู้ถูกกล่าวหา)')} เรื่องที่${dot(f.caseRefNo, 100, '.................')}กำหนดให้ประชุมคณะอนุกรรมการไต่สวน ครั้งที่${dot(f.meetingRound, 40, '...............')}ในวันที่${dot(f.meetingDate, 90, '......................')}เวลา${dot(f.meetingTime, 40, '..............')}น. ณ ห้องประชุม ${dot(f.meetingRoom, 80, '...........')} สำนักงาน ป.ป.ท. โดยมีระเบียบวาระการประชุมตามเอกสารที่ส่งมาพร้อมนี้ จึงขอเชิญท่านเข้าร่วมประชุมตามวันเวลาและสถานที่ดังกล่าว</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
<p>ขอแสดงความนับถือ</p>
${subcommitteeChairSignBlock(f)}
<p class="a5-form-corner">ปปท. 5-15</p>
</section>
${[1, 2, 3, 4].map(round => agendaPage(round, agendaCase)).join('')}
</article>`;
  }

  function paperMeetingInviteOutsider(f) {
    const agendaCase = show(f.accusedName) || ".....................................";
    return `<article class="a5-report-paper a5-cnotice-paper">
<section class="a5-paper-page a5-letter-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอเชิญประชุม</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 220, '.....................................................')}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;ระเบียบวาระการประชุมคณะอนุกรรมการไต่สวน ครั้งที่.../….</p>
<p class="a5-p-indent">ด้วยประธานอนุกรรมการไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. ที่${dot(f.committeeOrderNo, 60, '........')}ลงวันที่${dot(f.committeeOrderDate, 90, '....................')}กรณีกล่าวหา ${dot(f.accusedName, 150, '(ชื่อ - นามสกุลผู้ถูกกล่าวหา)')} เรื่องที่ ${dot(f.caseRefNo, 100, '..................')}กำหนดให้ประชุมคณะอนุกรรมการไต่สวน ครั้งที่${dot(f.meetingRound, 40, '..........')}ในวันที่${dot(f.meetingDate, 90, '......................')}เวลา${dot(f.meetingTime, 40, '..............')}น. ณ ห้องประชุม ${dot(f.meetingRoom, 80, '...........')} สำนักงาน ป.ป.ท. โดยมีระเบียบวาระการประชุมตามสิ่งที่ส่งมาด้วย จึงขอเชิญท่านเข้าร่วมประชุมตามวันเวลาและสถานที่ดังกล่าว</p>
<p>จึงเรียนมาเพื่อโปรดทราบ</p>
<p>ขอแสดงความนับถือ</p>
${subcommitteeChairSignBlock(f)}
<p class="a5-form-corner">ปปท. 5-16</p>
</section>
${[1, 2, 3, 4].map(round => agendaPage(round, agendaCase)).join('')}
</article>`;
  }

  function paperPanelNoticeSupervisorMemo(f) {
    return `<article class="a5-report-paper a5-cnotice-paper a5-paper-page">
${memoHead(f, 'แจ้งคำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท. ให้ดำเนินการไต่สวน', dot(f.addresseeSupervisor, 260, 'ผู้อำนวยการสำนักฯ/กอง/ ของพนักงาน ป.ป.ท. เจ้าของสำนวน ที่ได้รับแต่งตั้งให้เป็นคณะพนักงานไต่สวน'))}
<p class="a5-p-indent">ด้วยเลขาธิการคณะกรรมการ ป.ป.ท. ได้มีคำสั่งให้ดำเนินการไต่สวน โดยแต่งตั้งให้ ${dot(f.investigator1NameUnit, 150, '(ชื่อ - สกุล) พนักงาน ป.ป.ท. เจ้าของสำนวน สังกัด..........................')} และ ${dot(f.investigator2NameUnit, 150, '(ชื่อ – สกุล) พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. สังกัด...')} เป็นองค์คณะไต่สวน ตามนัยมาตรา ๒๔ วรรคหนึ่ง แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม รายละเอียดตามสำเนาคำสั่งสำนักงาน ป.ป.ท. ที่${dot(f.orderNo, 60, '....../......')} เรื่อง แต่งตั้งคณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ ลงวันที่ ${dot(f.orderDate, 90, '........................')} ที่แนบมาพร้อมนี้</p>
<p>จึงเรียนมาเพื่อโปรดทราบ และขอให้แจ้งผู้ซึ่งได้รับการแต่งตั้งตามคำสั่งดังกล่าวทราบด้วย</p>
${chiefActingSecretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-18</p></article>`;
  }

  function paperObjectionResultPanel(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-cnotice-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;แจ้งผลการดำเนินการ กรณีการคัดค้านพนักงาน ป.ป.ท. /เจ้าหน้าที่ ป.ป.ท.</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 220, '.....................................................')}</p>
<p><strong>อ้างถึง</strong>&nbsp;&nbsp;${dot(f.refLetter, 220, '(หนังสือของผู้ถูกกล่าวหา/ผู้มีส่วนได้เสีย ที่คัดค้านพนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.)')}</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง ท่านได้คัดค้านคณะพนักงานไต่สวน ตามคำสั่งสำนักงาน ป.ป.ท. ที่${dot(f.panelOrderNo, 80, '............')}ลงวันที่${dot(f.panelOrderDate, 100, '............................')}โดยคัดค้าน ${dot(f.objectedNames, 150, '(ชื่อ-สกุล พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.)')} จำนวน ${dot(f.objectionCount, 40, '.......')} ราย ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ได้พิจารณาเรื่องดังกล่าว ในการประชุมครั้งที่${dot(f.meetingNo, 60, '..........')}เมื่อวันที่${dot(f.meetingDate, 90, '..............')}มีมติว่า ${dot(f.resolutionText, 220, '..........................................')}</p>
<p>จึงเรียนมาเพื่อทราบ</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}
<p class="a5-form-corner">ปปท. 5-19</p></article>`;
  }

  function renderCommitteeNoticePaperByDocId(formId, fields = {}) {
    const f = object(fields);
    if (formId === DOC_IDS.OBJECTION_NOTICE) return paperObjectionNotice(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_M62) return paperSubcommitteeOrderM62(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_ADD) return paperSubcommitteeOrderAdd(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_ORDER_AMEND) return paperSubcommitteeOrderAmend(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_OUTSIDER) return paperSubcommitteeNoticeOutsider(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR) return paperSubcommitteeNoticeSupervisor(f);
    if (formId === DOC_IDS.SUBCOMMITTEE_NOTICE_SUPERVISOR_MEMO) return paperSubcommitteeNoticeSupervisorMemo(f);
    if (formId === DOC_IDS.OBJECTION_RESULT_SUBCOMMITTEE) return paperObjectionResultSubcommittee(f);
    if (formId === DOC_IDS.MEETING_INVITE_INSIDER) return paperMeetingInviteInsider(f);
    if (formId === DOC_IDS.MEETING_INVITE_OUTSIDER) return paperMeetingInviteOutsider(f);
    if (formId === DOC_IDS.PANEL_NOTICE_SUPERVISOR_MEMO) return paperPanelNoticeSupervisorMemo(f);
    if (formId === DOC_IDS.OBJECTION_RESULT_PANEL) return paperObjectionResultPanel(f);
    return "";
  }

  function renderCommitteeNoticePaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.committeeNoticeDocuments[formId]);
    return renderCommitteeNoticePaperByDocId(formId, doc.fields || defaultPayload(formId, state));
  }

  const api = Object.freeze({
    DOC_IDS, MANIFEST,
    defaultPayload, validateRequired,
    executeCommitteeNoticeDocumentAction,
    renderCommitteeNoticeEditorA5, captureCommitteeNoticeEditorA5,
    renderCommitteeNoticePaperA5, renderCommitteeNoticePaperByDocId
  });
  root.ECMISActivity5CommitteeNoticeDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
