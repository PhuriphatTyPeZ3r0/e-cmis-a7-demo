/*
 * E-CMIS กิจกรรมที่ 5 — แบบฟอร์มซีรีส์ 5 (คำสั่งแต่งตั้ง/แก้ไขคณะไต่สวน ม.24)
 * 5-01 บันทึกเสนอประธานเพื่อลงนามในคำสั่งฯ (clerk)
 * 5-02 คำสั่ง คกก. ป.ป.ท. แต่งตั้งคณะอนุกรรมการไต่สวน ม.24 ว.3 (secretary)
 * 5-03 คำสั่ง คกก. ป.ป.ท. แก้ไขคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน (secretary)
 * 5-05 คำสั่ง สปท. แต่งตั้งองค์คณะพนักงานไต่สวน เรื่องประพฤติมิชอบ ม.24 ว.1 (secretary)
 * 5-06 คำสั่ง สปท. แก้ไขคำสั่งแต่งตั้งองค์คณะพนักงานไต่สวน (secretary)
 * 5-17 คำสั่ง สปท. แต่งตั้งคณะพนักงานไต่สวน เรื่องที่รับจาก ป.ป.ช. ตาม ม.62 (secretary)
 *
 * เนื้อหากระดาษ = verbatim clone จากแบบฟอร์มต้นฉบับ (.doc/.docx)
 */
(function initializeActivity5CommitteeOrderDocuments(root) {
  const DOC_IDS = Object.freeze({
    PROPOSE_CHAIR_SIGN_ORDER: "S5_01_PROPOSE_CHAIR_SIGN_ORDER",
    BOARD_APPOINT_SUBCOMMITTEE_ORDER: "S5_02_BOARD_SUBCOMMITTEE_ORDER",
    BOARD_MODIFY_SUBCOMMITTEE_ORDER: "S5_03_BOARD_MODIFY_SUBCOMMITTEE_ORDER",
    OFFICE_APPOINT_INQUIRY_PANEL_ORDER: "S5_05_OFFICE_INQUIRY_PANEL_ORDER",
    OFFICE_MODIFY_INQUIRY_PANEL_ORDER: "S5_06_OFFICE_MODIFY_INQUIRY_PANEL_ORDER",
    OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER: "S5_17_OFFICE_INQUIRY_PANEL_M62_ORDER"
  });

  const MANIFEST = Object.freeze([
    {
      formId: DOC_IDS.PROPOSE_CHAIR_SIGN_ORDER,
      code: "5-01",
      title: "แบบบันทึกเสนอประธาน เพื่อลงนามในคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน",
      shortLabel: "บันทึกเสนอประธานลงนามคำสั่ง",
      stage: "a7-213",
      authorRole: "clerk"
    },
    {
      formId: DOC_IDS.BOARD_APPOINT_SUBCOMMITTEE_ORDER,
      code: "5-02",
      title: "แบบคำสั่งคณะกรรมการ ป.ป.ท. กรณีแต่งตั้งคณะอนุกรรมการไต่สวน",
      shortLabel: "คำสั่ง คกก. แต่งตั้งคณะอนุกรรมการไต่สวน",
      stage: "a7-213",
      authorRole: "secretary"
    },
    {
      formId: DOC_IDS.BOARD_MODIFY_SUBCOMMITTEE_ORDER,
      code: "5-03",
      title: "แบบคำสั่งคณะกรรมการ ป.ป.ท. กรณีแก้ไขคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน",
      shortLabel: "คำสั่ง คกก. แก้ไขคำสั่งแต่งตั้ง",
      stage: "a7-213",
      authorRole: "secretary"
    },
    {
      formId: DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_ORDER,
      code: "5-05",
      title: "แบบคำสั่งสำนักงาน ป.ป.ท. กรณีแต่งตั้งองค์คณะพนักงานไต่สวน เรื่องประพฤติมิชอบ",
      shortLabel: "คำสั่ง สปท. แต่งตั้งองค์คณะพนักงานไต่สวน",
      stage: "a7-213",
      authorRole: "secretary"
    },
    {
      formId: DOC_IDS.OFFICE_MODIFY_INQUIRY_PANEL_ORDER,
      code: "5-06",
      title: "แบบคำสั่งสำนักงาน ป.ป.ท. กรณีแก้ไขคำสั่งแต่งตั้งองค์คณะพนักงานไต่สวน",
      shortLabel: "คำสั่ง สปท. แก้ไขคำสั่งแต่งตั้งองค์คณะ",
      stage: "a7-213",
      authorRole: "secretary"
    },
    {
      formId: DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER,
      code: "5-17",
      title: "แบบคำสั่งสำนักงาน ป.ป.ท. กรณีแต่งตั้งคณะพนักงานไต่สวน เรื่องที่รับจาก ป.ป.ช. ตามมาตรา 62",
      shortLabel: "คำสั่ง สปท. แต่งตั้งคณะพนักงานไต่สวน (ม.62)",
      stage: "a7-213",
      authorRole: "secretary"
    }
  ]);

  const ACTIONS = Object.freeze(
    MANIFEST.flatMap(item => [`committee-order-save:${item.formId}`, `committee-order-submit:${item.formId}`])
  );

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
    s.committeeOrderDocuments = object(s.committeeOrderDocuments);
    return s;
  }

  function defaultPayload(formId, state = {}) {
    const caseRef = text(state.caseData?.trackingCode);
    const unit = text(state.inquiry?.intake?.unit);

    if (formId === DOC_IDS.PROPOSE_CHAIR_SIGN_ORDER) {
      return {
        agencyDivision: "กลุ่มงานกิจการคณะกรรมการ กองบริหารคดี",
        phone: "๔๓13",
        letterNo: "ปป 0004/",
        issuedAt: "",
        caseRefNo: caseRef,
        originDivision: unit || "กองบริหารคดี",
        secretLetterNo: "",
        prelimCaseRefNo: caseRef,
        meetingNo: "",
        meetingDate: "",
        agendaNo: "",
        acknowledgedDate: "",
        receivedMeetingNo: "",
        nomineeDivision: unit || "กองบริหารคดี",
        memberCount: "",
        membersList: "",
        clerkSignerName: "",
        clerkSignerPosition: "เจ้าหน้าที่ ป.ป.ท./พนักงาน ป.ป.ท.",
        checkerCaseRefNo: caseRef,
        checkerSignerName: "",
        directorCaseRefNo: caseRef,
        directorSignerName: "",
        chairSignerName: ""
      };
    }

    if (formId === DOC_IDS.BOARD_APPOINT_SUBCOMMITTEE_ORDER) {
      return {
        orderNo: "",
        meetingNo: "",
        meetingYear: "",
        meetingDate: "",
        caseRefNo: caseRef,
        accusedName: "",
        accusedIdCard: "",
        accusedPosition: "",
        accusedAgency: "",
        allegationFacts: text(state.caseData?.subject),
        damageTarget: "",
        incidentDate: "",
        incidentLocation: "",
        member1Name: "",
        member2Name: "",
        member3Name: "",
        effectiveDate: "",
        orderedAt: "",
        chairSignerName: ""
      };
    }

    if (formId === DOC_IDS.BOARD_MODIFY_SUBCOMMITTEE_ORDER) {
      return {
        orderNo: "",
        secretOrderNo: "",
        secretOrderYear: "",
        secretOrderDate: "",
        accusedName: "",
        accusedPosition: "",
        allegationType: "ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ",
        meetingNo: "",
        meetingDate: "",
        modifySecretOrderNo: "",
        modifySecretOrderYear: "",
        modifySecretOrderDate: "",
        additionalAccusedList: "",
        effectiveDate: "",
        orderedAt: "",
        chairSignerName: ""
      };
    }

    if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_ORDER) {
      return {
        orderNo: "",
        meetingNo: "",
        meetingYear: "",
        meetingDate: "",
        caseRefNo: caseRef,
        accusedName: "",
        accusedIdCard: "",
        accusedPosition: "",
        accusedAuthority: "",
        allegationFacts: text(state.caseData?.subject),
        damageTarget: "",
        incidentDate: "",
        incidentLocation: "",
        member1Name: "",
        member2Name: "",
        member3Name: "",
        orderedAt: "",
        secretarySignerName: ""
      };
    }

    if (formId === DOC_IDS.OFFICE_MODIFY_INQUIRY_PANEL_ORDER) {
      return {
        orderNo: "",
        priorOrderNo: "",
        priorOrderYear: "",
        priorOrderDate: "",
        accusedName: "",
        accusedPosition: "",
        allegationType: "ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ",
        caseRefNo: caseRef,
        meetingNo: "",
        meetingDate: "",
        modifyOrderNo: "",
        modifyOrderYear: "",
        modifyOrderDate: "",
        additionalAccusedList: "",
        orderedAt: "",
        secretarySignerName: ""
      };
    }

    if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER) {
      return {
        orderNo: "",
        meetingNo: "",
        meetingYear: "",
        meetingDate: "",
        caseRefNo: caseRef,
        accusedName: "",
        accusedIdCard: "",
        accusedPosition: "",
        accusedAuthority: "",
        allegationFacts: text(state.caseData?.subject),
        damageTarget: "",
        incidentDate: "",
        incidentLocation: "",
        naccMeetingNo: "",
        naccMeetingYear: "",
        naccMeetingDate: "",
        member1Name: "",
        member2Name: "",
        member3Name: "",
        orderedAt: "",
        secretarySignerName: ""
      };
    }

    return {};
  }

  function validateRequired(formId, p = {}) {
    const missing = [];
    const need = (...fields) => fields.forEach(f => { if (!text(p[f])) missing.push(f); });

    if (formId === DOC_IDS.PROPOSE_CHAIR_SIGN_ORDER) {
      need("letterNo", "issuedAt", "caseRefNo", "meetingNo", "meetingDate");
    } else if (formId === DOC_IDS.BOARD_APPOINT_SUBCOMMITTEE_ORDER) {
      need("orderNo", "meetingNo", "meetingDate", "caseRefNo", "accusedName", "member1Name", "member2Name", "member3Name");
    } else if (formId === DOC_IDS.BOARD_MODIFY_SUBCOMMITTEE_ORDER) {
      need("orderNo", "secretOrderNo", "secretOrderDate", "accusedName", "meetingNo", "meetingDate", "additionalAccusedList");
    } else if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_ORDER) {
      need("orderNo", "meetingNo", "meetingDate", "caseRefNo", "accusedName", "member1Name", "member2Name", "member3Name");
    } else if (formId === DOC_IDS.OFFICE_MODIFY_INQUIRY_PANEL_ORDER) {
      need("orderNo", "priorOrderNo", "priorOrderDate", "accusedName", "caseRefNo", "meetingNo", "meetingDate", "additionalAccusedList");
    } else if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER) {
      need("orderNo", "meetingNo", "meetingDate", "caseRefNo", "accusedName", "naccMeetingNo", "naccMeetingDate", "member1Name", "member2Name", "member3Name");
    }
    return missing;
  }

  function executeCommitteeOrderDocumentAction(sourceState, actor = {}, command = {}) {
    const formId = text(command.formId);
    const meta = getMeta(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: sourceState, messageTh: "ไม่พบแบบเอกสาร" };

    if (!["save","submit","addrow","delrow"].includes(String(command.action || "save"))) return { ok: false, error: "UNSUPPORTED_ACTION", state: sourceState, messageTh: "ไม่รองรับการดำเนินการนี้" };    const s = normalizeState(sourceState);
    const now = text(command.at) || new Date().toISOString();
    const current = object(s.committeeOrderDocuments[formId]);
    const payload = command.payload && typeof command.payload === "object" ? copy(command.payload) : object(current.fields);

    if (!text(actor.id)) return { ok: false, error: "FORBIDDEN_ACTOR", state: sourceState, messageTh: "ไม่พบผู้ดำเนินการและบทบาทที่ผ่านการยืนยัน" };
    if (text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", state: s, messageTh: `ผู้มีหน้าที่จัดทำเอกสารนี้คือ ${meta.authorRole} เท่านั้น` };
    }

    if (!s.committeeOrderDocuments[formId] && String(command.action || "save") !== "submit") {
      s.committeeOrderDocuments[formId] = { formId, status: "DRAFT", createdAt: now, updatedAt: now, fields: payload };
      return { ok: true, state: s, code: "COMMITTEE_ORDER_DOC_DRAFT_CREATED" };
    }

    if (text(command.action) === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", state: s, messageTh: "เอกสารถูกส่งแล้ว" };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", state: s, missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}` };
      s.committeeOrderDocuments[formId] = { ...current, status: "SUBMITTED", submittedAt: now, submittedBy: text(actor.id), fields: payload };
      return { ok: true, state: s, code: "COMMITTEE_ORDER_DOC_SUBMITTED" };
    }

    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", state: s, messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้" };
    s.committeeOrderDocuments[formId] = { ...current, updatedAt: now, updatedBy: text(actor.id), fields: payload };
    return { ok: true, state: s, code: "COMMITTEE_ORDER_DOC_DRAFT_SAVED" };
  }

  // ---------- editor (ฝั่งซ้าย) ----------
  const field = (label, name, value, type = "input") => `<label class="a5-field-block${type === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${type === "textarea" ? `<textarea class="a5-textarea" data-a5-committee-order-path="${name}" rows="2">${escapeHtml(value)}</textarea>` : `<input type="text" class="a5-input" data-a5-committee-order-path="${name}" value="${escapeHtml(value)}">`}</label>`;

  function renderCommitteeOrderEditorA5(state = {}, formId, options = {}) {
    const meta = getMeta(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const doc = object(normalizeState(state).committeeOrderDocuments[formId]);
    const f = Object.assign(defaultPayload(formId, state), object(doc.fields));
    let body = "";

    if (formId === DOC_IDS.PROPOSE_CHAIR_SIGN_ORDER) {
      body = `
<h3>บันทึกเสนอประธาน เพื่อลงนามในคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน</h3>
<div class="a5-form-grid">
  ${field("ส่วนราชการ", "agencyDivision", f.agencyDivision)}${field("โทร.", "phone", f.phone)}
  ${field("ที่", "letterNo", f.letterNo)}${field("วันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("กอง/สำนัก (เรื่องเดิม)", "originDivision", f.originDivision)}${field("หนังสือ ลับ ที่", "secretLetterNo", f.secretLetterNo)}
  ${field("รายงานผลเรื่องที่", "prelimCaseRefNo", f.prelimCaseRefNo)}
  ${field("มติ คกก. ครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("ระเบียบวาระที่", "agendaNo", f.agendaNo)}
  ${field("วันที่ได้รับมติการประชุม", "acknowledgedDate", f.acknowledgedDate)}${field("มติการประชุมครั้งที่", "receivedMeetingNo", f.receivedMeetingNo)}
  ${field("กอง/สำนัก (ผู้เสนอรายชื่อ)", "nomineeDivision", f.nomineeDivision)}${field("จำนวน (ราย)", "memberCount", f.memberCount)}
  ${field("รายชื่อคณะอนุกรรมการไต่สวน", "membersList", f.membersList, "textarea")}
  ${field("ผู้จัดทำ (ชื่อ-สกุล)", "clerkSignerName", f.clerkSignerName)}${field("ตำแหน่งผู้จัดทำ", "clerkSignerPosition", f.clerkSignerPosition)}
  ${field("ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ", "checkerSignerName", f.checkerSignerName)}
  ${field("ผู้อำนวยการกองบริหารคดี", "directorSignerName", f.directorSignerName)}
  ${field("ประธานกรรมการ ป.ป.ท.", "chairSignerName", f.chairSignerName)}
</div>`;
    } else if (formId === DOC_IDS.BOARD_APPOINT_SUBCOMMITTEE_ORDER) {
      body = `
<h3>คำสั่งคณะกรรมการ ป.ป.ท. แต่งตั้งคณะอนุกรรมการไต่สวน (ม.24 ว.3)</h3>
<div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}
  ${field("มติที่ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("ปี (พ.ศ.)", "meetingYear", f.meetingYear)}
  ${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("สำนวนเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ผู้ถูกกล่าวหา", "accusedName", f.accusedName)}${field("เลขประจำตัวประชาชน", "accusedIdCard", f.accusedIdCard)}
  ${field("ตำแหน่งขณะเกิดเหตุ", "accusedPosition", f.accusedPosition)}${field("สังกัด", "accusedAgency", f.accusedAgency)}
  ${field("พฤติการณ์การกระทำความผิด", "allegationFacts", f.allegationFacts, "textarea")}
  ${field("ผู้ได้รับความเสียหาย", "damageTarget", f.damageTarget)}
  ${field("เหตุเกิดเมื่อวันที่", "incidentDate", f.incidentDate)}${field("สถานที่เกิดเหตุ", "incidentLocation", f.incidentLocation)}
  ${field("๑. ประธานอนุกรรมการ", "member1Name", f.member1Name)}
  ${field("๒. อนุกรรมการ", "member2Name", f.member2Name)}
  ${field("๓. อนุกรรมการและเลขานุการ", "member3Name", f.member3Name)}
  ${field("ตั้งแต่วันที่ (มติ คกก.)", "effectiveDate", f.effectiveDate)}
  ${field("สั่ง ณ วันที่ (ประธานลงนาม)", "orderedAt", f.orderedAt)}
  ${field("ประธานกรรมการ ป.ป.ท.", "chairSignerName", f.chairSignerName)}
</div>`;
    } else if (formId === DOC_IDS.BOARD_MODIFY_SUBCOMMITTEE_ORDER) {
      body = `
<h3>คำสั่งคณะกรรมการ ป.ป.ท. แก้ไขคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน</h3>
<div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}
  ${field("อนุสนธิคำสั่ง ลับ ที่", "secretOrderNo", f.secretOrderNo)}${field("ปี (พ.ศ.)", "secretOrderYear", f.secretOrderYear)}
  ${field("ลงวันที่", "secretOrderDate", f.secretOrderDate)}
  ${field("กรณีกล่าวหา (ชื่อ-สกุล)", "accusedName", f.accusedName)}${field("ตำแหน่ง", "accusedPosition", f.accusedPosition)}
  ${field("ฐานความผิด", "allegationType", f.allegationType, "textarea")}
  ${field("มติที่ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("แก้ไขเพิ่มเติมคำสั่ง ลับ ที่", "modifySecretOrderNo", f.modifySecretOrderNo)}${field("ปี (พ.ศ.)", "modifySecretOrderYear", f.modifySecretOrderYear)}
  ${field("ลงวันที่", "modifySecretOrderDate", f.modifySecretOrderDate)}
  ${field("รายชื่อผู้ถูกกล่าวหาเพิ่มเติม (ชื่อ-สกุล, เลขบัตร, ตำแหน่ง, ลำดับ)", "additionalAccusedList", f.additionalAccusedList, "textarea")}
  ${field("ตั้งแต่วันที่", "effectiveDate", f.effectiveDate)}
  ${field("สั่ง ณ วันที่", "orderedAt", f.orderedAt)}
  ${field("ประธานกรรมการ ป.ป.ท.", "chairSignerName", f.chairSignerName)}
</div>`;
    } else if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_ORDER) {
      body = `
<h3>คำสั่งสำนักงาน ป.ป.ท. แต่งตั้งองค์คณะพนักงานไต่สวน เรื่องประพฤติมิชอบ (ม.24 ว.1)</h3>
<div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}
  ${field("มติที่ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("ปี (พ.ศ.)", "meetingYear", f.meetingYear)}
  ${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("สำนวนคดีเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ผู้ถูกกล่าวหา", "accusedName", f.accusedName)}${field("เลขประจำตัวประชาชน", "accusedIdCard", f.accusedIdCard)}
  ${field("ตำแหน่งขณะเกิดเหตุ", "accusedPosition", f.accusedPosition)}
  ${field("อำนาจหน้าที่ผู้ถูกกล่าวหา", "accusedAuthority", f.accusedAuthority)}
  ${field("พฤติการณ์การกระทำความผิด", "allegationFacts", f.allegationFacts, "textarea")}
  ${field("ผู้ได้รับความเสียหาย", "damageTarget", f.damageTarget)}
  ${field("เหตุเกิดเมื่อวันที่", "incidentDate", f.incidentDate)}${field("สถานที่เกิดเหตุ", "incidentLocation", f.incidentLocation)}
  ${field("๑. พนักงาน ป.ป.ท. เจ้าของสำนวน", "member1Name", f.member1Name)}
  ${field("๒. พนักงาน ป.ป.ท.", "member2Name", f.member2Name)}
  ${field("๓. เจ้าหน้าที่ ป.ป.ท.", "member3Name", f.member3Name)}
  ${field("สั่ง ณ วันที่", "orderedAt", f.orderedAt)}
  ${field("เลขาธิการคณะกรรมการ ป.ป.ท.", "secretarySignerName", f.secretarySignerName)}
</div>`;
    } else if (formId === DOC_IDS.OFFICE_MODIFY_INQUIRY_PANEL_ORDER) {
      body = `
<h3>คำสั่งสำนักงาน ป.ป.ท. แก้ไขคำสั่งแต่งตั้งองค์คณะพนักงานไต่สวน</h3>
<div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}
  ${field("อนุสนธิคำสั่ง ที่", "priorOrderNo", f.priorOrderNo)}${field("ปี (พ.ศ.)", "priorOrderYear", f.priorOrderYear)}
  ${field("ลงวันที่", "priorOrderDate", f.priorOrderDate)}
  ${field("กรณีกล่าวหา (ชื่อ-สกุล)", "accusedName", f.accusedName)}${field("ตำแหน่ง", "accusedPosition", f.accusedPosition)}
  ${field("ฐานความผิด", "allegationType", f.allegationType, "textarea")}
  ${field("สำนวนคดีเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("มติที่ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("แก้ไขเพิ่มเติมคำสั่ง ที่", "modifyOrderNo", f.modifyOrderNo)}${field("ปี (พ.ศ.)", "modifyOrderYear", f.modifyOrderYear)}
  ${field("ลงวันที่", "modifyOrderDate", f.modifyOrderDate)}
  ${field("รายชื่อผู้ถูกกล่าวหาเพิ่มเติม (ชื่อ-สกุล, เลขบัตร, ตำแหน่ง, ลำดับ)", "additionalAccusedList", f.additionalAccusedList, "textarea")}
  ${field("สั่ง ณ วันที่", "orderedAt", f.orderedAt)}
  ${field("เลขาธิการคณะกรรมการ ป.ป.ท.", "secretarySignerName", f.secretarySignerName)}
</div>`;
    } else if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER) {
      body = `
<h3>คำสั่งสำนักงาน ป.ป.ท. แต่งตั้งคณะพนักงานไต่สวน เรื่องที่รับจาก ป.ป.ช. ตาม ม.62</h3>
<div class="a5-form-grid">
  ${field("คำสั่งที่", "orderNo", f.orderNo)}
  ${field("มติที่ประชุมครั้งที่", "meetingNo", f.meetingNo)}${field("ปี (พ.ศ.)", "meetingYear", f.meetingYear)}
  ${field("เมื่อวันที่", "meetingDate", f.meetingDate)}
  ${field("สำนวนคดีเรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("ผู้ถูกกล่าวหา", "accusedName", f.accusedName)}${field("เลขประจำตัวประชาชน", "accusedIdCard", f.accusedIdCard)}
  ${field("ตำแหน่งขณะเกิดเหตุ", "accusedPosition", f.accusedPosition)}
  ${field("อำนาจหน้าที่ผู้ถูกกล่าวหา", "accusedAuthority", f.accusedAuthority)}
  ${field("พฤติการณ์การกระทำความผิด", "allegationFacts", f.allegationFacts, "textarea")}
  ${field("ผู้ได้รับความเสียหาย", "damageTarget", f.damageTarget)}
  ${field("เหตุเกิดเมื่อวันที่", "incidentDate", f.incidentDate)}${field("สถานที่เกิดเหตุ", "incidentLocation", f.incidentLocation)}
  ${field("มติ ป.ป.ช. ครั้งที่", "naccMeetingNo", f.naccMeetingNo)}${field("ปี (พ.ศ.)", "naccMeetingYear", f.naccMeetingYear)}
  ${field("เมื่อวันที่ (ป.ป.ช.)", "naccMeetingDate", f.naccMeetingDate)}
  ${field("๑. พนักงาน ป.ป.ท. เจ้าของสำนวน", "member1Name", f.member1Name)}
  ${field("๒. เจ้าหน้าที่ ป.ป.ท.", "member2Name", f.member2Name)}
  ${field("๓. เจ้าหน้าที่ ป.ป.ท.", "member3Name", f.member3Name)}
  ${field("สั่ง ณ วันที่", "orderedAt", f.orderedAt)}
  ${field("เลขาธิการคณะกรรมการ ป.ป.ท.", "secretarySignerName", f.secretarySignerName)}
</div>`;
    }

    const buttons = editable ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-committee-order-action="save" data-doc-id="${escapeHtml(formId)}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-committee-order-action="submit" data-doc-id="${escapeHtml(formId)}">ส่งเอกสาร</button></div>` : "";
    return `<div class="a5-committee-order-editor" data-doc-id="${escapeHtml(formId)}"><p class="ws-policy-note">ปปท. ${escapeHtml(meta.code)} — ${escapeHtml(meta.title)}${doc.status === "SUBMITTED" ? " · ส่งแล้ว (อ่านอย่างเดียว)" : ""}</p>${body}${buttons}</div>`;
  }

  function captureCommitteeOrderEditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-committee-order-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5CommitteeOrderPath;
      if (!path) return;
      const parts = path.split(".");
      let current = payload;
      parts.forEach((key, index) => {
        if (index === parts.length - 1) {
          if (controlElement.type === "checkbox") current[key] = controlElement.checked;
          else if (controlElement.tagName === "SELECT") current[key] = controlElement.value;
          else current[key] = controlElement.value;
        } else {
          current[key] = object(current[key]);
          current = current[key];
        }
      });
    });
    return payload;
  }

  // ---------- paper (ฝั่งขวา — verbatim) ----------
  function memoHeader(f) {
    return `<div class="a5-memo-header">
  <div class="a5-memo-header-top">
    <div class="a5-memo-garuda-wrap"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="60" height="65"></div>
    <h2 class="a5-memo-title">บันทึกข้อความ</h2>
  </div>
  <p><strong>ส่วนราชการ</strong> ${dot(f.agencyDivision, 200, 'กลุ่มงานกิจการคณะกรรมการ กองบริหารคดี')} &nbsp;&nbsp;<strong>โทร.</strong> ${dot(f.phone, 60, '๔๓13')}</p>
  <p><strong>ที่</strong> ${dot(f.letterNo, 120, 'ปป 0004/....................')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>วันที่</strong> ${dot(f.issuedAt, 120, '........................................')}</p>
  <p><strong>เรื่อง</strong> คำสั่งคณะกรรมการ ป.ป.ท. เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ เรื่องที่ ${dot(f.caseRefNo, 120, '.........................')}</p>
</div>`;
  }

  function orderHeader(title, orderNo) {
    return `<div class="a5-order-header" style="text-align:center">
  <div style="margin-bottom:10px"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="60" height="65"></div>
  <h2 style="font-size:16pt;margin:0 0 5px 0"><strong>${escapeHtml(title)}</strong></h2>
  <p style="margin:0 0 10px 0">ที่ ${orderNo || '............/..............'}</p>
</div>`;
  }

  function paperProposeChairSignOrder(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
${memoHeader(f)}
<p><strong>เรียน</strong> ประธานกรรมการ ป.ป.ท. (ผ่านผู้อำนวยการกองบริหารคดี)</p>
<p class="a5-p-indent"><strong>๑. เรื่องเดิม</strong></p>
<p class="a5-p-indent">${dot(f.originDivision, 80, '(กอง/สำนัก)')} ได้มีหนังสือ ลับ ที่ ${dot(f.secretLetterNo, 160, '……………………………………………………')} เรื่อง รายงานผลการไต่สวนเบื้องต้น เรื่องที่ ${dot(f.prelimCaseRefNo, 120, '........................................')} เพื่อเข้าสู่การพิจารณาของที่ประชุมคณะกรรมการ ป.ป.ท.</p>
<p class="a5-p-indent"><strong>2. ข้อเท็จจริง</strong></p>
<p class="a5-p-indent">2.1 คณะกรรมการ ป.ป.ท. มีมติในคราวการประชุม ครั้งที่ ${dot(f.meetingNo, 80, '.............................')} เมื่อวันที่ ${dot(f.meetingDate, 100, '...........................................')} ระเบียบวาระที่ ${dot(f.agendaNo, 40, '......')} เรื่อง รายงานผลการไต่สวนเบื้องต้น โดยมีมติเป็นเอกฉันท์ เห็นชอบให้รับไว้ไต่สวน โดยให้ดำเนินการไต่สวนเป็นคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องสำคัญหรือมีความซับซ้อน ตามมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>
<p class="a5-p-indent">2.2 เมื่อวันที่ ${dot(f.acknowledgedDate, 100, '.............................................')} ผู้รับผิดชอบงานคำสั่ง ได้รับมติการประชุม ครั้งที่ ${dot(f.receivedMeetingNo, 80, '.......................')} ฉบับลงนามครบถ้วนสมบูรณ์แล้ว</p>
<p class="a5-p-indent"><strong>3. ข้อเสนอ</strong></p>
<p class="a5-p-indent">กลุ่มงานกิจการคณะกรรมการ กองบริหารคดี ได้ดำเนินการจัดทำคำสั่งคณะกรรมการ ป.ป.ท. เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวน โดยคำสั่งดังกล่าวเป็นไปตามมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. 2551 และที่แก้ไขเพิ่มเติม และข้อ 87 ตามระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ว่าด้วยหลักเกณฑ์และวิธีการไต่สวน พ.ศ. 2568 ซึ่งได้ประสานผู้รับผิดชอบสำนวน และได้รับแจ้งว่า ${dot(f.nomineeDivision, 80, '(กอง/สำนัก)')} ขอเสนอรายชื่อคณะอนุกรรมการไต่สวน เพื่อแต่งตั้งเป็นคณะอนุกรรมการไต่สวน จำนวน ${dot(f.memberCount, 30, '…….')} ราย ได้แก่ ${dot(f.membersList, 300, '(ชื่อ – สกุล ตำแหน่ง สังกัด และตำแหน่งในคณะอนุกรรมการไต่สวน)')} ซึ่งกลุ่มงานกิจการคณะกรรมการ กองบริหารคดี ได้ดำเนินการจัดทำคำสั่งโดยมีการวิเคราะห์สถานะผู้ถูกกล่าวหา อำนาจหน้าที่ผู้ถูกกล่าวหา พฤติการณ์การกระทำความผิด ตรวจสอบวันเวลาเกิดเหตุ สถานที่เกิดเหตุ และตรวจสอบเลขประจำตัวประชาชนของผู้ถูกกล่าวหา ได้อย่างถูกต้องครบถ้วนสมบูรณ์เรียบร้อยแล้ว</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณา</p>
<div style="margin:1.5em 0;text-align:center">
  <p>(${dot(f.clerkSignerName, 140, '................................................')})</p>
  <p>${escapeHtml(show(f.clerkSignerPosition)) || 'เจ้าหน้าที่ ป.ป.ท./พนักงาน ป.ป.ท.'}</p>
</div>
<p class="a5-p-indent"><strong>4. ความเห็นผู้ตรวจ (เรื่องที่ ${dot(f.checkerCaseRefNo, 100, '..........................')})</strong></p>
<p class="a5-p-indent">ได้ตรวจสอบร่างคำสั่งคณะกรรมการ ป.ป.ท. เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวนดังกล่าวถูกต้องครบถ้วนแล้ว</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณา</p>
<div style="margin:1.5em 0;text-align:center">
  <p>(${dot(f.checkerSignerName, 140, '...........................................')})</p>
  <p>ผู้อำนวยการกลุ่มงานกิจการคณะกรรมการ</p>
</div>
<p class="a5-p-indent"><strong>5. ความเห็นผู้อำนวยการกองบริหารคดี (เรื่องที่ ${dot(f.directorCaseRefNo, 100, '.............................')})</strong></p>
<p class="a5-p-indent">ได้ตรวจสอบร่างคำสั่งคณะกรรมการ ป.ป.ท. เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวนดังกล่าวถูกต้องครบถ้วน จึงเห็นควรพิจารณาลงนาม</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณา</p>
<div style="margin:1.5em 0;text-align:center">
  <p>(${dot(f.directorSignerName, 140, '...........................................')})</p>
  <p>ผู้อำนวยการกองบริหารคดี</p>
</div>
<div style="margin:1.5em 0">
  <p>- เห็นชอบ</p>
  <p>- ลงนามแล้ว</p>
  <div style="text-align:center;margin-top:1em">
    <p>(${dot(f.chairSignerName, 140, '                         ')})</p>
    <p>ประธานกรรมการ ป.ป.ท.</p>
  </div>
</div>
<p class="a5-form-corner">ปปท. 5-01</p></article>`;
  }

  function paperBoardAppointSubcommitteeOrder(f) {
    const orderNoStr = f.orderNo ? (f.meetingYear ? `${escapeHtml(f.orderNo)}/${escapeHtml(f.meetingYear)}` : escapeHtml(f.orderNo)) : '            /…………..';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:right;font-weight:bold">ลับ</p>
${orderHeader("คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", orderNoStr)}
<p style="text-align:center"><strong>เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</strong></p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติในการประชุม ครั้งที่ ${dot(f.meetingNo, 30, '......')} /${dot(f.meetingYear, 40, '.........')} เมื่อวันที่ ${dot(f.meetingDate, 100, '.........................')} ให้รับไว้ไต่สวนโดยแต่งตั้งคณะอนุกรรมการไต่สวน สำนวนเรื่องที่ ${dot(f.caseRefNo, 80, '............')} กรณีกล่าวหา ${dot(f.accusedName, 140, '...................................')} เลขประจำตัวประชาชน ${dot(f.accusedIdCard, 120, '……………………………')} ขณะเกิดเหตุดำรงตำแหน่ง ${dot(f.accusedPosition, 160, '…………..............................................')} สังกัด ${dot(f.accusedAgency, 180, '…………...........................................................')} ผู้ถูกกล่าวหา ว่ากระทำการทุจริตในภาครัฐ โดยมีพฤติการณ์กล่าวคือ ตามวันและเวลาเกิดเหตุ (พฤติการณ์การกระทำความผิด และข้อเท็จจริงที่เกี่ยวข้อง) ${dot(f.allegationFacts, 240, '.............................................................................')} เป็นเหตุให้ ${dot(f.damageTarget, 80, '..............')} ได้รับความเสียหาย เหตุเกิดเมื่อวันที่ ${dot(f.incidentDate, 80, '....................')} ที่ ${dot(f.incidentLocation, 120, '.........................................................')}</p>
<p class="a5-p-indent">อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) (10) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568 ข้อ 87 จึงแต่งตั้งคณะอนุกรรมการไต่สวน โดยมีองค์ประกอบและอำนาจหน้าที่ ดังนี้</p>
<p style="margin-left:2em"><strong>ก. องค์ประกอบ</strong></p>
<p style="margin-left:3em">๑. ${dot(f.member1Name, 180, '……………………………………….')} ประธานอนุกรรมการ</p>
<p style="margin-left:3em">๒. ${dot(f.member2Name, 180, '……………………………………….')} อนุกรรมการ</p>
<p style="margin-left:3em">๓. ${dot(f.member3Name, 180, '……………………………………….')} อนุกรรมการและเลขานุการ</p>
<p style="margin-left:2em"><strong>ข. อำนาจหน้าที่</strong></p>
<p style="margin-left:3em">๑. แสวงหา รวบรวม และดำเนินการอื่นใด เพื่อให้ได้มาซึ่งข้อเท็จจริงและพยานหลักฐาน โดยให้มีอำนาจตามมาตรา ๑๘ และมาตรา ๑๙ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>
<p style="margin-left:3em">2. ดำเนินการไต่สวนให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568</p>
<p style="margin-left:3em">3. เมื่อดำเนินการไต่สวนแล้วเสร็จ ให้เสนอสำนวนไต่สวนต่อคณะกรรมการ ป.ป.ท. เพื่อพิจารณาให้ความเห็นชอบและวินิจฉัยชี้มูล</p>
<p style="margin-left:3em">4. รับผิดชอบดำเนินการใดๆ ซึ่งเกี่ยวข้องกับสำนวนการไต่สวน จนกว่าจะปรากฏข้อเท็จจริงว่าสำนวนการไต่สวนดังกล่าวนี้ ศาลได้มีคำพิพากษาถึงที่สุด</p>
<p style="margin-left:3em">๕. ดำเนินการอื่นใดตามที่คณะกรรมการ ป.ป.ท. มอบหมาย</p>
<p class="a5-p-indent">อนึ่ง ในการดำเนินการไต่สวนของคณะอนุกรรมการไต่สวน หากพบว่ามีเจ้าหน้าที่ของรัฐหรือบุคคลอื่นซึ่งเป็นตัวการ ผู้ใช้ ผู้สนับสนุน รวมทั้งผู้ให้ ขอให้ รับว่าจะให้ หรือนิติบุคคลที่เกี่ยวข้องกับการให้ทรัพย์สินหรือประโยชน์อื่นใดแก่บุคคล เพื่อจูงใจให้กระทำการ ไม่กระทำการ หรือประวิงการกระทำอันมิชอบด้วยกฎหมายในระหว่างการไต่สวน ให้คณะอนุกรรมการไต่สวน รายงานให้คณะกรรมการ ป.ป.ท. ทราบโดยเร็ว เพื่อพิจารณาดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติมต่อไป</p>
<p class="a5-p-indent">ทั้งนี้ ตั้งแต่วันที่ ${dot(f.effectiveDate, 100, '...............................')} เป็นต้นไป (วันที่คณะกรรมการ ป.ป.ท. มีมติ)</p>
<p style="text-align:center;margin-top:1.5em">สั่ง ณ วันที่ ${dot(f.orderedAt, 120, '(วันที่ประธานคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
<div style="text-align:center;margin-top:1.5em">
  <p>(${dot(f.chairSignerName, 140, '.....................................')})</p>
  <p>ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
</div>
<p class="a5-form-corner">ปปท. 5-02</p></article>`;
  }

  function paperBoardModifySubcommitteeOrder(f) {
    const orderNoStr = f.orderNo ? escapeHtml(f.orderNo) : '....../....';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:right;font-weight:bold">ลับ</p>
${orderHeader("คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", orderNoStr)}
<p style="text-align:center"><strong>เรื่อง แก้ไขคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</strong></p>
<p class="a5-p-indent">อนุสนธิคำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ลับ ที่ ${dot(f.secretOrderNo, 50, '..........')}/${dot(f.secretOrderYear, 40, '.........')} ลงวันที่ ${dot(f.secretOrderDate, 100, '.....................................')} เรื่อง แต่งตั้งคณะอนุกรรมการไต่สวนข้อเท็จจริง กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ กรณีกล่าวหา ${dot(f.accusedName, 160, '(ชื่อ - นามสกุล และตำแหน่งของผู้ถูกกล่าวหา)')} ว่ากระทำความผิดฐาน ${dot(f.allegationType, 240, '(ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ)')}</p>
<p class="a5-p-indent">จากการไต่สวนของคณะอนุกรรมการไต่สวน พบว่า มีผู้กระทำความผิดเพิ่มเติม ดังนั้น อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) (10) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคสาม แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ประกอบกับมติคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ในการประชุมครั้งที่ ${dot(f.meetingNo, 60, '....................')} เมื่อวันที่ ${dot(f.meetingDate, 90, '..........................')} จึงให้แก้ไขเพิ่มเติมคำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ลับ ที่ ${dot(f.modifySecretOrderNo, 50, '............')}/${dot(f.modifySecretOrderYear, 40, '...........')} ลงวันที่ ${dot(f.modifySecretOrderDate, 100, '....................................')} โดยมีอำนาจไต่สวนผู้ถูกกล่าวหา ดังนี้</p>
<div style="margin-left:2em;line-height:1.8">
  ${f.additionalAccusedList ? text(f.additionalAccusedList).split('\n').map(line => `<p>• ${escapeHtml(line)}</p>`).join('') : `<p>ชื่อ - สกุล ผู้ถูกกล่าวหา, เลขบัตรประจำตัวประชาชน, ตำแหน่งขณะเกิดเหตุ, ลำดับของผู้ถูกกล่าวหา (เป็นผู้ถูกกล่าวหาที่เท่าใด)</p><p>ชื่อ - สกุล ผู้ถูกกล่าวหา, เลขบัตรประจำตัวประชาชน, ตำแหน่งขณะเกิดเหตุ, ลำดับของผู้ถูกกล่าวหา (เป็นผู้ถูกกล่าวหาที่เท่าใด)</p>`}
</div>
<p class="a5-p-indent">นอกนั้นให้เป็นไปตามคำสั่งเดิมทุกประการ</p>
<p class="a5-p-indent">ทั้งนี้ ตั้งแต่วันที่ ${dot(f.effectiveDate, 100, '...............................')} เป็นต้นไป (วันที่คณะกรรมการ ป.ป.ท. มีมติ)</p>
<p style="text-align:center;margin-top:1.5em">สั่ง ณ วันที่ ${dot(f.orderedAt, 120, '(วันที่ประธานคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
<div style="text-align:center;margin-top:1.5em">
  <p>(${dot(f.chairSignerName, 140, '.....................................')})</p>
  <p>ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
</div>
<p class="a5-form-corner">ปปท. 5-03</p></article>`;
  }

  function paperOfficeAppointInquiryPanelOrder(f) {
    const orderNoStr = f.orderNo ? (f.meetingYear ? `${escapeHtml(f.orderNo)}/${escapeHtml(f.meetingYear)}` : escapeHtml(f.orderNo)) : '…………../…………..';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
${orderHeader("คำสั่งสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", orderNoStr)}
<p style="text-align:center"><strong>เรื่อง แต่งตั้งคณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</strong></p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติในการประชุม ครั้งที่ ${dot(f.meetingNo, 30, '......')} /${dot(f.meetingYear, 40, '.........')} เมื่อวันที่ ${dot(f.meetingDate, 100, '...........................')} ให้รับไว้ไต่สวนโดยแต่งตั้งคณะพนักงานไต่สวน สำนวนคดีเรื่องที่ ${dot(f.caseRefNo, 80, '......................')} กรณีกล่าวหา ${dot(f.accusedName, 140, '....................................')} เลขประจำตัวประชาชน ${dot(f.accusedIdCard, 120, '……………………………')} ขณะเกิดเหตุดำรงตำแหน่ง ${dot(f.accusedPosition, 180, '………….............................................')} ผู้ถูกกล่าวหา ว่ากระทำการทุจริตในภาครัฐ โดยมีพฤติการณ์กล่าวคือ ผู้ถูกกล่าวหามีอำนาจหน้าที่ ${dot(f.accusedAuthority, 160, '.................................................................')} ตามวันและเวลาเกิดเหตุ (พฤติการณ์การกระทำความผิด และข้อเท็จจริงที่เกี่ยวข้อง) ${dot(f.allegationFacts, 240, '...........................................................')} เป็นเหตุให้ ${dot(f.damageTarget, 80, '.......................................')} ได้รับความเสียหาย เหตุเกิดเมื่อวันที่ ${dot(f.incidentDate, 80, '............................')} ที่ ${dot(f.incidentLocation, 120, '.......................................................................')}</p>
<p class="a5-p-indent">อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคแรก แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปราม การทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568 ข้อ 101 จึงแต่งตั้งคณะพนักงานไต่สวน โดยมีองค์ประกอบและอำนาจหน้าที่ ดังนี้</p>
<p style="margin-left:2em"><strong>ก. องค์ประกอบ</strong></p>
<p style="margin-left:3em">๑. ${dot(f.member1Name, 180, '……………………………………….')} พนักงาน ป.ป.ท. เจ้าของสำนวน</p>
<p style="margin-left:3em">๒. ${dot(f.member2Name, 180, '……………………………………….')} พนักงาน ป.ป.ท.</p>
<p style="margin-left:3em">๓. ${dot(f.member3Name, 180, '……………………………………….')} เจ้าหน้าที่ ป.ป.ท.</p>
<p style="margin-left:2em"><strong>ข. อำนาจหน้าที่</strong></p>
<p style="margin-left:3em">๑. แสวงหา รวบรวม และดำเนินการอื่นใด เพื่อให้ได้มาซึ่งข้อเท็จจริงและพยานหลักฐาน ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบ คำสั่งที่เกี่ยวข้อง</p>
<p style="margin-left:3em">2. ดำเนินการไต่สวนให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และตามระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568</p>
<p style="margin-left:3em">3. เมื่อดำเนินการไต่สวนแล้วเสร็จ ให้เสนอสำนวนไต่สวนต่อคณะกรรมการ ป.ป.ท. เพื่อพิจารณาให้ความเห็นชอบและวินิจฉัยชี้มูล</p>
<p style="margin-left:3em">4. รับผิดชอบดำเนินการใด ๆ ซึ่งเกี่ยวข้องกับสำนวนการไต่สวน จนกว่าจะปรากฏข้อเท็จจริงว่าสำนวนการไต่สวนดังกล่าวนี้ ศาลได้มีคำพิพากษาถึงที่สุด</p>
<p style="margin-left:3em">๕. ดำเนินการอื่นใดตามที่คณะกรรมการ ป.ป.ท. มอบหมาย</p>
<p class="a5-p-indent">อนึ่ง ในการดำเนินการไต่สวนของคณะพนักงานไต่สวน หากพบว่ามีเจ้าหน้าที่ของรัฐหรือบุคคลอื่นซึ่งเป็นตัวการ ผู้ใช้ ผู้สนับสนุน รวมทั้งผู้ให้ ขอให้ รับว่าจะให้ หรือนิติบุคคลที่เกี่ยวข้องกับการ ให้ทรัพย์สินหรือประโยชน์อื่นใดแก่บุคคล เพื่อจูงใจให้กระทำการ ไม่กระทำการ หรือประวิงการกระทำอันมิชอบด้วยกฎหมายในระหว่างการไต่สวน ให้คณะพนักงานไต่สวนรายงานเลขาธิการคณะกรรมการ ป.ป.ท. โดยเร็ว เพื่อพิจารณาดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ต่อไป</p>
<p class="a5-p-indent">ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p style="text-align:center;margin-top:1.5em">สั่ง ณ วันที่ ${dot(f.orderedAt, 120, '(วันที่ เลขาธิการคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
<div style="text-align:center;margin-top:1.5em">
  <p>(${dot(f.secretarySignerName, 140, '.....................................')})</p>
  <p>เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
</div>
<p class="a5-form-corner">ปปท. 5-05</p></article>`;
  }

  function paperOfficeModifyInquiryPanelOrder(f) {
    const orderNoStr = f.orderNo ? escapeHtml(f.orderNo) : '…………../…………..';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
${orderHeader("คำสั่งสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", orderNoStr)}
<p style="text-align:center"><strong>เรื่อง แก้ไขคำสั่งแต่งตั้งคณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</strong></p>
<p class="a5-p-indent">อนุสนธิคำสั่งสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ที่ ${dot(f.priorOrderNo, 50, '...........')}/${dot(f.priorOrderYear, 40, '.........')} ลงวันที่ ${dot(f.priorOrderDate, 100, '.....................................')} เรื่อง แต่งตั้งคณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ กรณีกล่าวหา ${dot(f.accusedName, 160, '(ชื่อ - นามสกุล และตำแหน่งของผู้ถูกกล่าวหา)')} ว่ากระทำความผิดฐาน ${dot(f.allegationType, 240, '(ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ)')} สำนวนคดีเรื่องที่ ${dot(f.caseRefNo, 80, '......................')}</p>
<p class="a5-p-indent">จากการไต่สวนของคณะพนักงานไต่สวน พบว่า มีผู้กระทำความผิดเพิ่มเติม ดังนั้น อาศัยอำนาจตามความในมาตรา 17 (4) (5) (6) มาตรา 17/1 มาตรา 18 มาตรา 19 และมาตรา 24 วรรคแรก แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568 ข้อ 101 ประกอบกับมติคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ในการประชุมครั้งที่ ${dot(f.meetingNo, 60, '....................')} เมื่อวันที่ ${dot(f.meetingDate, 90, '..........................')} จึงให้แก้ไขเพิ่มเติมคำสั่งสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ ที่ ${dot(f.modifyOrderNo, 50, '................')}/${dot(f.modifyOrderYear, 40, '...............')} ลงวันที่ ${dot(f.modifyOrderDate, 100, '.....................................')} โดยมีอำนาจไต่สวนผู้ถูกกล่าวหา ดังนี้</p>
<div style="margin-left:2em;line-height:1.8">
  ${f.additionalAccusedList ? text(f.additionalAccusedList).split('\n').map(line => `<p>• ${escapeHtml(line)}</p>`).join('') : `<p>• ชื่อ - สกุล ผู้ถูกกล่าวหา, เลขบัตรประจำตัวประชาชน, ตำแหน่งขณะเกิดเหตุ, ลำดับของผู้ถูกกล่าวหา (เป็นผู้ถูกกล่าวหาที่เท่าใด)</p><p>• ชื่อ - สกุล ผู้ถูกกล่าวหา, เลขบัตรประจำตัวประชาชน, ตำแหน่งขณะเกิดเหตุ, ลำดับของผู้ถูกกล่าวหา (เป็นผู้ถูกกล่าวหาที่เท่าใด)</p>`}
</div>
<p class="a5-p-indent">นอกนั้นให้เป็นไปตามคำสั่งเดิมทุกประการ</p>
<p class="a5-p-indent">ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p style="text-align:center;margin-top:1.5em">สั่ง ณ วันที่ ${dot(f.orderedAt, 120, '(วันที่ เลขาธิการคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
<div style="text-align:center;margin-top:1.5em">
  <p>(${dot(f.secretarySignerName, 140, '.....................................')})</p>
  <p>เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
</div>
<p class="a5-form-corner">ปปท. 5-06</p></article>`;
  }

  function paperOfficeAppointInquiryPanelM62Order(f) {
    const orderNoStr = f.orderNo ? (f.meetingYear ? `${escapeHtml(f.orderNo)}/${escapeHtml(f.meetingYear)}` : escapeHtml(f.orderNo)) : '            /…………..';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
${orderHeader("คำสั่งสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ", orderNoStr)}
<p style="text-align:center"><strong>เรื่อง แต่งตั้งคณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำการทุจริตในภาครัฐ</strong></p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติในการประชุม ครั้งที่ ${dot(f.meetingNo, 30, '......')} /${dot(f.meetingYear, 40, '.........')} เมื่อวันที่ ${dot(f.meetingDate, 100, '...........................')} ให้รับไว้ไต่สวนโดยแต่งตั้งคณะพนักงานไต่สวน สำนวนคดีเรื่องที่ ${dot(f.caseRefNo, 80, '................')} กรณีกล่าวหา ${dot(f.accusedName, 140, '................................')} เลขประจำตัวประชาชน ${dot(f.accusedIdCard, 120, '……………………………')} ขณะเกิดเหตุดำรงตำแหน่ง ${dot(f.accusedPosition, 180, '…………..................................................')} ผู้ถูกกล่าวหา ว่ากระทำการทุจริตในภาครัฐ โดยมีพฤติการณ์กล่าวคือ ผู้ถูกกล่าวหามีอำนาจหน้าที่ ${dot(f.accusedAuthority, 160, '............................................')} ตามวันและเวลาเกิดเหตุ (พฤติการณ์การกระทำความผิด และข้อเท็จจริงที่เกี่ยวข้อง) ${dot(f.allegationFacts, 240, '…………………………………………………………………………………………………………………')} เป็นเหตุให้ ${dot(f.damageTarget, 80, '.............................')} ได้รับความเสียหาย เหตุเกิดเมื่อวันที่ ${dot(f.incidentDate, 80, '...................')} ที่ ${dot(f.incidentLocation, 120, '.............................................')}</p>
<p class="a5-p-indent">อาศัยอำนาจตามความในมาตรา ๑๗ (๔) (๕) (6) มาตรา 17/1 มาตรา ๑๘ มาตรา ๑๙ และมาตรา 24 วรรคแรก แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปราม การทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และข้อ 5 วรรคสอง ตามระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568 ข้อ 101 ประกอบ มติคณะกรรมการ ป.ป.ช. ครั้งที่ ${dot(f.naccMeetingNo, 40, '.......')}/${dot(f.naccMeetingYear, 40, '...........')} เมื่อวันที่ ${dot(f.naccMeetingDate, 90, '.....................')} มอบหมายให้คณะกรรมการ ป.ป.ท. ดำเนินการแทน ตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. 2561 มาตรา 62 จึงแต่งตั้งคณะพนักงานไต่สวน โดยมีองค์ประกอบและอำนาจหน้าที่ ดังนี้</p>
<p style="margin-left:2em"><strong>ก. องค์ประกอบ</strong></p>
<p style="margin-left:3em">๑. ${dot(f.member1Name, 180, '……………………………………….')} พนักงาน ป.ป.ท. เจ้าของสำนวน</p>
<p style="margin-left:3em">๒. ${dot(f.member2Name, 180, '……………………………………….')} เจ้าหน้าที่ ป.ป.ท.</p>
<p style="margin-left:3em">๓. ${dot(f.member3Name, 180, '……………………………………….')} เจ้าหน้าที่ ป.ป.ท.</p>
<p style="margin-left:2em"><strong>ข. อำนาจหน้าที่</strong></p>
<p style="margin-left:3em">๑. แสวงหา รวบรวม และดำเนินการอื่นใด เพื่อให้ได้มาซึ่งข้อเท็จจริงและพยานหลักฐาน ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และระเบียบ คำสั่งที่เกี่ยวข้อง</p>
<p style="margin-left:3em">2. ดำเนินการไต่สวนให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และตามระเบียบคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐว่าด้วยหลักเกณฑ์และวิธีการการไต่สวน พ.ศ. 2568</p>
<p style="margin-left:3em">3. เมื่อดำเนินการไต่สวนแล้วเสร็จ ให้เสนอสำนวนไต่สวนต่อคณะกรรมการ ป.ป.ท. เพื่อพิจารณาให้ความเห็นชอบและวินิจฉัยชี้มูล</p>
<p style="margin-left:3em">4. รับผิดชอบดำเนินการใดๆ ซึ่งเกี่ยวข้องกับสำนวนการไต่สวน จนกว่าจะปรากฏข้อเท็จจริงว่าสำนวนการไต่สวนดังกล่าวนี้ ศาลได้มีคำพิพากษาถึงที่สุด</p>
<p style="margin-left:3em">๕. ดำเนินการอื่นใดตามที่คณะกรรมการ ป.ป.ท. มอบหมาย</p>
<p class="a5-p-indent">อนึ่ง ในการดำเนินการไต่สวนของคณะพนักงานไต่สวน หากพบว่ามีเจ้าหน้าที่ของรัฐหรือบุคคลอื่นซึ่งเป็นตัวการ ผู้ใช้ ผู้สนับสนุน รวมทั้งผู้ให้ ขอให้ รับว่าจะให้ หรือนิติบุคคลที่เกี่ยวข้องกับการ ให้ทรัพย์สินหรือประโยชน์อื่นใดแก่บุคคล เพื่อจูงใจให้กระทำการ ไม่กระทำการ หรือประวิงการกระทำอันมิชอบด้วยกฎหมายในระหว่างการไต่สวน ให้คณะพนักงานไต่สวนรายงานเลขาธิการคณะกรรมการ ป.ป.ท. โดยเร็ว เพื่อพิจารณาดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ต่อไป</p>
<p class="a5-p-indent">ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<p style="text-align:center;margin-top:1.5em">สั่ง ณ วันที่ ${dot(f.orderedAt, 120, '(วันที่ เลขาธิการคณะกรรมการ ป.ป.ท. ลงนาม)')}</p>
<div style="text-align:center;margin-top:1.5em">
  <p>(${dot(f.secretarySignerName, 140, '.....................................')})</p>
  <p>เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
</div>
<p class="a5-form-corner">ปปท. 5-17</p></article>`;
  }

  function renderCommitteeOrderPaperByDocId(formId, fields = {}) {
    const f = object(fields);
    if (formId === DOC_IDS.PROPOSE_CHAIR_SIGN_ORDER) return paperProposeChairSignOrder(f);
    if (formId === DOC_IDS.BOARD_APPOINT_SUBCOMMITTEE_ORDER) return paperBoardAppointSubcommitteeOrder(f);
    if (formId === DOC_IDS.BOARD_MODIFY_SUBCOMMITTEE_ORDER) return paperBoardModifySubcommitteeOrder(f);
    if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_ORDER) return paperOfficeAppointInquiryPanelOrder(f);
    if (formId === DOC_IDS.OFFICE_MODIFY_INQUIRY_PANEL_ORDER) return paperOfficeModifyInquiryPanelOrder(f);
    if (formId === DOC_IDS.OFFICE_APPOINT_INQUIRY_PANEL_M62_ORDER) return paperOfficeAppointInquiryPanelM62Order(f);
    return "";
  }

  function renderCommitteeOrderPaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.committeeOrderDocuments[formId]);
    return renderCommitteeOrderPaperByDocId(formId, doc.fields || defaultPayload(formId, state));
  }

  const api = Object.freeze({
    DOC_IDS,
    MANIFEST,
    ACTIONS,
    defaultPayload,
    validateRequired,
    executeCommitteeOrderDocumentAction,
    renderCommitteeOrderEditorA5,
    captureCommitteeOrderEditorA5,
    renderCommitteeOrderPaperA5,
    renderCommitteeOrderPaperByDocId
  });

  root.ECMISActivity5CommitteeOrderDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
