/*
 * E-CMIS กิจกรรมที่ 5 — แบบฟอร์มซีรีส์ 4 (ผลมติ 213 → ส่งมอบ/ส่งปลายทาง)
 * 4-01 บันทึกการส่งมอบสำนวนฯ ให้คณะพนักงานไต่สวน · 4-02 หนังสือส่ง ม.62 คืน ป.ป.ช.
 * 4-03 หนังสือส่ง ป.ป.ช. 18-4(1) · 4-04 หนังสือส่งหน่วยงานอื่น ม.27 · 4-05 แจ้งผลไม่รับไว้ไต่สวน
 *
 * เนื้อหากระดาษ = verbatim จากแบบฟอร์มต้นฉบับ (.doc)
 * ผู้ลงนาม: 4-02/03/04 = เลขาธิการคณะกรรมการ ป.ป.ท. หรือผู้ที่ได้รับมอบหมาย
 *           4-01 = เจ้าของสำนวนชั้น 213 + ผอ.ผู้รับมอบ / 4-05 = หัวหน้าพนักงาน ป.ป.ท.
 */
(function initializeActivity5HandoverDocuments(root) {
  const DOC_IDS = Object.freeze({
    DOSSIER_HANDOVER: "S4_01_DOSSIER_HANDOVER",
    NACC_RETURN: "S4_02_NACC_RETURN",
    NACC_184_SEND: "S4_03_NACC_184_SEND",
    AGENCY_SEND_M27: "S4_04_AGENCY_SEND_M27",
    NOT_ACCEPT_NOTICE: "S4_05_NOT_ACCEPT_NOTICE"
  });

  const MANIFEST = Object.freeze([
    { formId: DOC_IDS.DOSSIER_HANDOVER, code: "4-01", title: "แบบบันทึกการส่งมอบสำนวนการไต่สวนเบื้องต้น ให้คณะพนักงานไต่สวน", shortLabel: "ส่งมอบสำนวน", stage: "a7-213", authorRole: "investigator" },
    { formId: DOC_IDS.NACC_RETURN, code: "4-02", title: "แบบหนังสือส่งสำนวนตามมาตรา 62 คืนสำนักงาน ป.ป.ช.", shortLabel: "คืน ป.ป.ช. (ม.62)", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.NACC_184_SEND, code: "4-03", title: "แบบหนังสือส่งสำนักงาน ป.ป.ช. กรณีสำนักงาน ป.ป.ท. รับเป็นคดีประพฤติมิชอบ แต่มีการทุจริตต่อหน้าที่รวมอยู่ด้วย ตามมาตรา 18-4 (1)", shortLabel: "ส่ง ป.ป.ช. (18/4)", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.AGENCY_SEND_M27, code: "4-04", title: "แบบหนังสือส่งหน่วยงานอื่นที่เกี่ยวข้องตามมาตรา 27", shortLabel: "ส่งหน่วยงาน (ม.27)", stage: "a7-213", authorRole: "secretary" },
    { formId: DOC_IDS.NOT_ACCEPT_NOTICE, code: "4-05", title: "แบบหนังสือแจ้งผลกรณีไม่รับไว้ไต่สวนถึงผู้ร้องเรียน", shortLabel: "แจ้งไม่รับไว้ไต่สวน", stage: "a7-213", authorRole: "clerk" }
  ]);

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
    s.handoverDocuments = object(s.handoverDocuments);
    return s;
  }

  function letterCommon(state = {}) {
    const intake = object(object(state.inquiry).intake);
    return {
      letterNo: "", issuedAt: "",
      caseRefNo: text(state.caseData?.trackingCode),
      ownerDivision: text(intake.unit),
      ownerPhone: "", ownerFax: "", ownerName: ""
    };
  }

  function defaultPayload(formId, state = {}) {
    if (formId === DOC_IDS.DOSSIER_HANDOVER) {
      return {
        ...letterCommon(state),
        division: text(object(object(state.inquiry).intake).unit), divisionPhone: "",
        caseRefNo2: text(state.caseData?.trackingCode),
        orderNo: "", orderDate: "", committeeKind: "คณะอนุกรรมการไต่สวน", appointedName: "",
        documentPages: "", evidencePieces: "",
        handoverToName: "", directorName: "", directorPositionSuffix: "", handoverDate: "",
        receiverAcknowledge: false, receivedByName: "", receivedByPosition: "", receivedDate: ""
      };
    }
    if (formId === DOC_IDS.NACC_RETURN || formId === DOC_IDS.NACC_184_SEND || formId === DOC_IDS.AGENCY_SEND_M27) {
      return {
        ...letterCommon(state),
        addresseeTitle: formId === DOC_IDS.NACC_RETURN || formId === DOC_IDS.NACC_184_SEND ? "" : "",
        naccLetterNo: "", attachmentPages: "",
        respondentSummary: "", boardMeetingNo: "", boardMeetingDate: "", boardResolution: "",
        onwardAgencyNote: "", ownerCaseRefNo: "", signerName: "", signerRoleLabel: ""
      };
    }
    // 4-05
    return {
      ...letterCommon(state),
      complainantName: "", complaintReferenceDate: "",
      respondentSummary: "", boardMeetingNo: "", boardMeetingDate: "", boardResolutionText: "",
      onwardLetterNo: "", onwardLetterDate: "", onwardAgency: "",
      officeNote: "", signerName: ""
    };
  }

  function validateRequired(formId, p) {
    const missing = [];
    const need = (...fields) => fields.forEach(f => { if (!text(p[f])) missing.push(f); });
    need("letterNo", "issuedAt");
    if (formId === DOC_IDS.DOSSIER_HANDOVER) need("orderNo", "orderDate");
    else if (formId === DOC_IDS.NOT_ACCEPT_NOTICE) need("complainantName", "boardMeetingNo", "boardMeetingDate");
    else need("respondentSummary", "boardMeetingNo", "boardMeetingDate", "boardResolution");
    return missing;
  }

  function executeHandoverDocumentAction(sourceState, actor = {}, command = {}) {
    const formId = text(command.formId);
    const meta = getMeta(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: sourceState, messageTh: "ไม่พบแบบเอกสาร" };

    if (!["save","submit","addrow","delrow"].includes(String(command.action || "save"))) return { ok: false, error: "UNSUPPORTED_ACTION", state: sourceState, messageTh: "ไม่รองรับการดำเนินการนี้" };    const s = normalizeState(sourceState);
    const now = text(command.at) || new Date().toISOString();
    const current = object(s.handoverDocuments[formId]);
    const payload = command.payload && typeof command.payload === "object" ? copy(command.payload) : object(current.fields);

    if (!text(actor.id)) return { ok: false, error: "FORBIDDEN_ACTOR", state: sourceState, messageTh: "ไม่พบผู้ดำเนินการและบทบาทที่ผ่านการยืนยัน" };
    if (text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", state: s, messageTh: `ผู้มีหน้าที่จัดทำเอกสารนี้คือ ${meta.authorRole} เท่านั้น` };
    }
    if (!s.handoverDocuments[formId] && String(command.action || "save") !== "submit") {
      s.handoverDocuments[formId] = { formId, status: "DRAFT", createdAt: now, updatedAt: now, fields: payload };
      return { ok: true, state: s, code: "HANDOVER_DOC_DRAFT_CREATED" };
    }
    if (text(command.action) === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", state: s, messageTh: "เอกสารถูกส่งแล้ว" };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", state: s, missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}` };
      s.handoverDocuments[formId] = { ...current, status: "SUBMITTED", submittedAt: now, submittedBy: text(actor.id), fields: payload };
      return { ok: true, state: s, code: "HANDOVER_DOC_SUBMITTED" };
    }
    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", state: s, messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้" };
    s.handoverDocuments[formId] = { ...current, updatedAt: now, updatedBy: text(actor.id), fields: payload };
    return { ok: true, state: s, code: "HANDOVER_DOC_DRAFT_SAVED" };
  }

  // ---------- editor (ฝั่งซ้าย) ----------
  const field = (label, name, value, type = "input") => `<label class="a5-field-block${type === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${type === "textarea" ? `<textarea class="a5-textarea" data-a5-handover-path="${name}" rows="2">${escapeHtml(value)}</textarea>` : `<input type="text" class="a5-input" data-a5-handover-path="${name}" value="${escapeHtml(value)}">`}</label>`;
  const checkboxField = (label, name, checked) => `<label class="a5-field-block"><span><input type="checkbox" data-a5-handover-path="${name}"${checked ? " checked" : ""}> ${escapeHtml(label)}</span></label>`;

  function renderHandoverEditorA5(state = {}, formId, options = {}) {
    const meta = getMeta(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const doc = object(normalizeState(state).handoverDocuments[formId]);
    const f = Object.assign(defaultPayload(formId, state), object(doc.fields));
    let body = "";
    if (formId === DOC_IDS.DOSSIER_HANDOVER) {
      body = `
<h3>บันทึกการส่งมอบสำนวนการไต่สวนเบื้องต้น</h3>
<div class="a5-form-grid">
  ${field("สำนัก/กอง", "division", f.division)}${field("โทร.", "divisionPhone", f.divisionPhone)}
  ${field("ที่ (ปป ๐๐../...)", "letterNo", f.letterNo)}
  ${field("เรื่องที่", "caseRefNo2", f.caseRefNo2)}
  ${field("คำสั่งที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  <label class="a5-field-block"><span>แต่งตั้ง</span><select class="a5-input" data-a5-handover-path="committeeKind"><option value="คณะอนุกรรมการไต่สวน"${f.committeeKind === "คณะอนุกรรมการไต่สวน" ? " selected" : ""}>คณะอนุกรรมการไต่สวน</option><option value="คณะพนักงานไต่สวน"${f.committeeKind === "คณะพนักงานไต่สวน" ? " selected" : ""}>คณะพนักงานไต่สวน</option></select></label>
  ${field("ผู้ได้รับแต่งตั้งเป็นเจ้าของสำนวน", "appointedName", f.appointedName)}
  ${field("เอกสารจำนวน (แผ่น)", "documentPages", f.documentPages)}
  ${field("วัตถุพยาน (ถ้ามี) จำนวน (ชิ้น)", "evidencePieces", f.evidencePieces)}
</div>
<h3>การมอบ/รับ</h3>
<div class="a5-form-grid">
  ${field("มอบให้ (ชื่อ-สกุล เจ้าของสำนวนชั้น 644)", "handoverToName", f.handoverToName)}
  ${field("ผู้อำนวยการผู้ลงชื่อ", "directorName", f.directorName)}
  ${field("ตำแหน่งผู้อำนวยการ", "directorPositionSuffix", f.directorPositionSuffix)}
  ${field("วันที่มอบ", "handoverDate", f.handoverDate)}
  ${checkboxField("- ได้รับสำนวนไว้เรียบร้อย ถูกต้องและครบถ้วนแล้ว", "receiverAcknowledge", f.receiverAcknowledge)}
  ${field("ผู้รับ (ชื่อ-สกุล)", "receivedByName", f.receivedByName)}
  ${field("ตำแหน่งผู้รับ", "receivedByPosition", f.receivedByPosition)}
  ${field("วันที่รับ", "receivedDate", f.receivedDate)}
</div>`;
    } else if (formId === DOC_IDS.NOT_ACCEPT_NOTICE) {
      body = `
<h3>หนังสือแจ้งผลกรณีไม่รับไว้ไต่สวนถึงผู้ร้องเรียน</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("เรียน (ผู้ร้องเรียน)", "complainantName", f.complainantName)}
  ${field("อ้างถึง หนังสือร้องเรียนลงวันที่ (ถ้ามี)", "complaintReferenceDate", f.complaintReferenceDate)}
  ${field("กรณีที่ร้องเรียน (ชื่อ-สกุล/ตำแหน่ง/สังกัดผู้ถูกร้องเรียน + ข้อเท็จจริง)", "respondentSummary", f.respondentSummary, "textarea")}
  ${field("มติ คกก. ครั้งที่", "boardMeetingNo", f.boardMeetingNo)}
  ${field("เมื่อวันที่", "boardMeetingDate", f.boardMeetingDate)}
  ${field("มติว่า", "boardResolutionText", f.boardResolutionText, "textarea")}
  ${field("อนึ่ง หนังสือที่ (ส่งหน่วยงานอื่น — ถ้ามี)", "onwardLetterNo", f.onwardLetterNo)}
  ${field("ลงวันที่", "onwardLetterDate", f.onwardLetterDate)}
  ${field("ส่งไปยัง (หน่วยงานราชการ)", "onwardAgency", f.onwardAgency)}
  ${field("สำนัก (กปท./ปปท.เขต เจ้าของสำนวน)", "officeNote", f.officeNote)}
  ${field("ผู้ลงนาม (หัวหน้าพนักงาน ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else {
      const isReturn = formId === DOC_IDS.NACC_RETURN;
      const isM27 = formId === DOC_IDS.AGENCY_SEND_M27;
      body = `
<h3>${escapeHtml(meta.title)}</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${isM27 ? field("เรียน (หัวหน้าส่วนราชการ/หน่วยงาน)", "addresseeTitle", f.addresseeTitle) : ""}
  ${!isM27 ? field(`อ้างถึง หนังสือสำนักงาน ป.ป.ช. ที่`, "naccLetterNo", f.naccLetterNo) : ""}
  ${field("สิ่งที่ส่งมาด้วย — จำนวน (แผ่น)", "attachmentPages", f.attachmentPages)}
  ${field("ผู้ถูกกล่าวหา/พฤติการณ์โดยย่อ", "respondentSummary", f.respondentSummary, "textarea")}
  ${field("มติ คกก. ครั้งที่", "boardMeetingNo", f.boardMeetingNo)}
  ${field("เมื่อวันที่", "boardMeetingDate", f.boardMeetingDate)}
  ${field("มีมติว่า", "boardResolution", f.boardResolution, "textarea")}
  ${isM27 || isReturn ? field("หมายเหตุการส่งต่อ/ผลดำเนินการ", "onwardAgencyNote", f.onwardAgencyNote, "textarea") : ""}
  ${field("ผู้รับผิดชอบ (เจ้าของเรื่อง)", "ownerName", f.ownerName)}
  ${field("ผู้ลงนาม (เลขาธิการฯ/ผู้ได้รับมอบหมาย)", "signerName", f.signerName)}
</div>`;
    }
    const buttons = editable ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-handover-action="save" data-doc-id="${escapeHtml(formId)}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-handover-action="submit" data-doc-id="${escapeHtml(formId)}">ส่งเอกสาร</button></div>` : "";
    return `<div class="a5-handover-editor" data-doc-id="${escapeHtml(formId)}"><p class="ws-policy-note">ปปท. ${escapeHtml(meta.code)} — ${escapeHtml(meta.title)}${doc.status === "SUBMITTED" ? " · ส่งแล้ว (อ่านอย่างเดียว)" : ""}</p>${body}${buttons}</div>`;
  }

  function captureHandoverEditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-handover-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5HandoverPath;
      if (!path) return;
      const parts = path.split(".");
      let current = payload;
      parts.forEach((key, index) => {
        if (index === parts.length - 1) {
          if (controlElement.type === "checkbox") current[key] = controlElement.checked;
          else if (controlElement.tagName === "SELECT") current[key] = controlElement.value;
          else current[key] = /^\d+$/.test(controlElement.value) && /(pages|pieces|No)$/.test(path) ? Number(controlElement.value) : controlElement.value;
        } else {
          current[key] = object(current[key]);
          current = current[key];
        }
      });
    });
    return payload;
  }

  // ---------- paper (ฝั่งขวา — verbatim) ----------
  const headRow = (f, extraRight = "") => `<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ${dot(f.letterNo, 90, 'ปป ๐๐.../...')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right">${extraRight || `<p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p>`}</div>
</div>
<div class="a5-letter-date-row"><p>(วัน เดือน ปี) ${dot(f.issuedAt, 60, '....................')}</p></div>`;

  function paperDossierHandover(f) {
    const rows644 = `<tr><td>- มอบ${dot(f.handoverToName, 200, '.....................................')}(ชื่อ - สกุล อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวน)</td></tr>
<tr><td>ลงชื่อ..........................................................</td></tr>
<tr><td>(${dot(f.directorName, 160, '.............................................')})</td></tr>
<tr><td>ผู้อำนวยการสำนัก..../กอง.....</td></tr>
<tr><td>วันที่ ${dot(f.handoverDate, 160, '..............................................................')}</td></tr>`;
    const receiveRows = `<tr><td>- ได้รับสำนวนไว้เรียบร้อย ถูกต้องและครบถ้วนแล้ว</td></tr>
<tr><td>ลงชื่อ............................................................ผู้รับ</td></tr>
<tr><td>(${dot(f.receivedByName, 140, '.............................................')})</td></tr>
<tr><td>ตำแหน่ง${dot(f.receivedByPosition, 100, '...................................................')}</td></tr>
<tr><td>วันที่ ${dot(f.receivedDate, 150, '..............................................................')}</td></tr>`;
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p>สำนัก/กอง${dot(f.division, 80, '......................')} &nbsp;โทร. ${dot(f.divisionPhone, 60, '.............')}</p>
<p style="text-align:center"><strong>ส่งมอบสำนวนการไต่สวนเบื้องต้น เรื่องที่${dot(f.caseRefNo2, 120, '................................')}</strong></p>
<p><strong>เรียน</strong>&nbsp; ผู้อำนวยการสำนัก..../กอง.....</p>
<p class="a5-p-indent">ด้วย คณะกรรมการ ป.ป.ท. / สำนักงาน ป.ป.ท. ได้มีคำสั่งที่${dot(f.orderNo, 80, '.................')}ลงวันที่${dot(f.orderDate, 100, '......................')}แต่งตั้ง ${show(f.committeeKind) || 'คณะอนุกรรมการไต่สวน'} ให้ดำเนินการไต่สวน เรื่องที่${dot(f.caseRefNo, 120, '......................................')} ซึ่งนาย/นาง/นางสาว${dot(f.appointedName, 100, '.........................')}ได้รับแต่งตั้งให้เป็นอนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวน ${show(f.committeeKind)}</p>
<p class="a5-p-indent">ดังนั้น จึงขอส่งสำนวนการไต่สวนเบื้องต้น ซึ่งประกอบด้วย เอกสารจำนวน${dot(f.documentPages, 40, '.........')}แผ่น และวัตถุพยาน (ถ้ามี) จำนวน${dot(f.evidencePieces, 40, '........')} ชิ้น มาเพื่อส่งมอบให้ดำเนินการตามอำนาจหน้าที่ต่อไป</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p style="margin-top:1em">(${dot(f.ownerSignerName || '', 180, '.............................................')})<br>ตำแหน่ง...................................................<br>เจ้าของสำนวนการไต่สวนเบื้องต้น</p>
<table class="a5-signature-table"><tbody>${rows644}${receiveRows}</tbody></table>
<p class="a5-form-corner">ปปท. 4-01</p></article>`;
  }

  const secretarySignBlock = f => `<p style="text-align:left;margin-top:1.5em">(${dot(f.signerName, 160, '…………………………………..')})<br>เลขาธิการคณะกรรมการ ป.ป.ท.<br>หรือ ผู้ที่ได้รับมอบหมาย</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขต เจ้าของเรื่อง)<br>โทร.${dot(f.ownerPhone, 100, '...............................')}<br>โทรสาร${dot(f.ownerFax, 90, '.........................')}<br>(นาย/นาง/นางสาว${dot(f.ownerName, 100, '..................................')}ผู้รับผิดชอบ เรื่องที่${dot(f.caseRefNo, 80, '............................')})</p>`;

  function paperNaccReturn(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอส่งคืนเรื่อง (กล่าวหา/ร้องเรียน)</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ</p>
<p><strong>อ้างถึง</strong>&nbsp;&nbsp;หนังสือสำนักงาน ป.ป.ช. ที่${dot(f.naccLetterNo, 80, '.........')}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;หนังสือ (กล่าวหา/ร้องเรียน) และเอกสารที่เกี่ยวข้อง จำนวน${dot(f.attachmentPages, 40, '......')}แผ่น</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ(สำนักงาน ป.ป.ช.) ได้ส่งเรื่องกล่าวหา/ร้องเรียน (${dot(f.respondentSummary, 400, 'ชื่อ - นามสกุล ตำแหน่ง และสังกัดของผู้ถูกกล่าวหา และ/หรือกับพวก ประกอบกับพฤติการณ์ในคำกล่าวหา/ร้องเรียน โดยย่อ')}) ให้คณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) ดำเนินการตามอำนาจหน้าที่ตามมาตรา 62 แห่งพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑ ความละเอียดแจ้งแล้ว นั้น</p>
<p class="a5-p-indent">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้ดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม โดยคณะกรรมการ ป.ป.ท. พิจารณาแล้ว ในการประชุมครั้งที่ ${dot(f.boardMeetingNo, 80, '.................')} เมื่อวันที่${dot(f.boardMeetingDate, 100, '...............................')} มีมติว่า ${dot(f.boardResolution, 200, '.....................................................')}ดังนั้น จึงขอส่งเรื่องดังกล่าวคืนสำนักงาน ป.ป.ช. เพื่อดำเนินการตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. 2561 ต่อไป</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}<p class="a5-form-corner">ปปท. 4-02</p></article>`;
  }

  function paperNacc184Send(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอส่งเรื่อง (กล่าวหา/ร้องเรียน)</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;หนังสือ (กล่าวหา/ร้องเรียน) และเอกสารที่เกี่ยวข้อง จำนวน${dot(f.attachmentPages, 40, '......')}แผ่น</p>
<p class="a5-p-indent">ด้วยสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับหนังสือ (กล่าวหา/ร้องเรียน) (${dot(f.respondentSummary, 380, 'ชื่อ – นามสกุล ตำแหน่ง และสังกัดของผู้ถูกกล่าวหา และ/หรือกับพวก ประกอบกับพฤติการณ์ในคำกล่าวหา/ร้องเรียน โดยย่อ')}) ปรากฏตามสิ่งที่ส่งมาด้วย</p>
<p class="a5-p-indent">สำนักงาน ป.ป.ท. ได้ดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม โดยคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) พิจารณาแล้ว ในการประชุมครั้งที่ ${dot(f.boardMeetingNo, 60, '.........')} เมื่อวันที่${dot(f.boardMeetingDate, 90, '.......................')} มีมติว่า ${dot(f.boardResolution, 160, '...............................')}ดังนั้น จึงขอส่งเรื่องดังกล่าวให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ (สำนักงาน ป.ป.ช.) เพื่อดำเนินการตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. 2561 ต่อไป</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}<p class="a5-form-corner">ปปท. 4-03</p></article>`;
  }

  function paperAgencySendM27(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอส่งเรื่อง(กล่าวหา/ร้องเรียน)</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 240, '(หัวหน้าส่วนราชการ/หัวหน้าหน่วยงาน)')}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;เอกสารที่เกี่ยวข้อง จำนวน${dot(f.attachmentPages, 40, '......')}แผ่น (ไม่ส่งหนังสือกล่าวหา/ร้องเรียน)</p>
<p class="a5-p-indent">ด้วย สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้รับเรื่องกล่าวหา/ร้องเรียน กรณี ${dot(f.respondentSummary, 360, '(ข้อเท็จจริงตามเรื่องที่กล่าวหา/ร้องเรียน)')} ปรากฏตามสิ่งที่ส่งมาด้วย (ถ้ามี)</p>
<p class="a5-p-indent">สำนักงาน ป.ป.ท. ได้ดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม แล้ว โดยคณะกรรมการ ป.ป.ท. พิจารณาแล้วในการประชุมครั้งที่${dot(f.boardMeetingNo, 60, '.................')}เมื่อวันที่${dot(f.boardMeetingDate, 90, '............................')} มีมติว่า ${dot(f.boardResolution, 160, '..............................................................................')}</p>
<p class="a5-p-indent">ดังนั้น จึงขอให้ท่านพิจารณาดำเนินการตามอำนาจหน้าที่ต่อไป หากผลการดำเนินการเป็นประการใดโปรดแจ้งให้ทราบด้วย จักขอบคุณมาก</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>ขอแสดงความนับถือ</p>
${secretarySignBlock(f)}<p class="a5-form-corner">ปปท. 4-04</p></article>`;
  }

  function paperNotAcceptNotice(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;แจ้งผลการพิจารณาของคณะกรรมการ&nbsp; ป.ป.ท.</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.complainantName, 220, '(ผู้ร้องเรียน)')}</p>
<p><strong>อ้างถึง</strong>&nbsp;&nbsp;หนังสือร้องเรียนของท่าน ฉบับลงวันที่ ${dot(f.complaintReferenceDate, 160, '')} &nbsp;(ถ้ามี)</p>
<p class="a5-p-indent">ตามหนังสือที่อ้างถึง ท่านได้ร้องเรียน กรณี ${dot(f.respondentSummary, 420, '(ระบุชื่อ – นามสกุล ตำแหน่งและสังกัดของผู้ถูกร้องเรียน และ/หรือกับพวก ว่า.............................................. ความละเอียดแจ้งแล้ว นั้น')}</p>
<p class="a5-p-indent">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้ดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และได้นำเสนอคณะกรรมการ ป.ป.ท. พิจารณาแล้ว ในการประชุมครั้งที่${dot(f.boardMeetingNo, 60, '................')}เมื่อวันที่${dot(f.boardMeetingDate, 90, '....................................')}โดยมีมติว่า ${show(f.boardResolutionText) || "(ใส่เนื้อหาตามมติของคณะกรรมการ ป.ป.ท.)"}</p>
<p class="a5-p-indent">อนึ่ง สำนักงาน ป.ป.ท. ได้มีหนังสือ ที่ ${dot(f.onwardLetterNo, 70, '............')}ลงวันที่${dot(f.onwardLetterDate, 90, '...........................')}ส่งไปยัง (${dot(f.onwardAgency, 100, 'หน่วยงานราชการ')}) เพื่อพิจารณาดำเนินการตามอำนาจหน้าที่ต่อไปแล้ว (กรณีส่งไปให้หน่วยงานอื่นที่เกี่ยวข้องรับไปดำเนินการต่อ)</p>
<p>จึงเรียนมาเพื่อทราบ</p>
<p>ขอแสดงความนับถือ</p>
<p style="text-align:left;margin-top:1.5em">(${dot(f.signerName, 160, '..............................................')})<br>หัวหน้าพนักงาน ป.ป.ท.</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขตพื้นที่ ของพนักงาน ป.ป.ท. เจ้าของสำนวน)&nbsp;&nbsp;${show(f.officeNote)}<br>โทร. &nbsp;${dot(f.ownerPhone, 80, '')}<br>โทรสาร &nbsp;${dot(f.ownerFax, 80, '')}<br>(ระบุชื่อ-สกุลของพนักงาน ป.ป.ท. เจ้าของสำนวน)&nbsp;${dot(f.ownerName, 100, '')}</p>
<p class="a5-letter-note" style="margin-top:1em">ตัวอย่างหนังสือแจ้งผลการพิจารณาของคณะกรรมการ ป.ป.ท. ถึงผู้ร้องเรียน กรณีไม่รับไว้ไต่สวน</p>
<p class="a5-form-corner">ปปท. 4-05</p></article>`;
  }

  function renderHandoverPaperByDocId(formId, fields = {}) {
    const f = object(fields);
    if (formId === DOC_IDS.DOSSIER_HANDOVER) return paperDossierHandover(f);
    if (formId === DOC_IDS.NACC_RETURN) return paperNaccReturn(f);
    if (formId === DOC_IDS.NACC_184_SEND) return paperNacc184Send(f);
    if (formId === DOC_IDS.AGENCY_SEND_M27) return paperAgencySendM27(f);
    if (formId === DOC_IDS.NOT_ACCEPT_NOTICE) return paperNotAcceptNotice(f);
    return "";
  }

  function renderHandoverPaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.handoverDocuments[formId]);
    return renderHandoverPaperByDocId(formId, doc.fields || defaultPayload(formId, state));
  }

  const api = Object.freeze({
    DOC_IDS, MANIFEST,
    defaultPayload, validateRequired,
    executeHandoverDocumentAction,
    renderHandoverEditorA5, captureHandoverEditorA5,
    renderHandoverPaperA5, renderHandoverPaperByDocId
  });
  root.ECMISActivity5HandoverDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
