/**
 * activity5-post-resolution-documents.js
 * Comprehensive lifecycle, state machine, and authentic verbatim paper renderers for Forms 1–20.
 */
(function (root) {
  "use strict";

  const A5_GARUDA_IMG = 'data:image/png;base64,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';

  function text(val) {
    if (val === null || val === undefined) return "";
    return String(val).trim();
  }

  function object(val) {
    if (!val || typeof val !== "object" || Array.isArray(val)) return {};
    return val;
  }

  function escapeHtml(str) {
    return text(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function solid(val, minW = 60, fallback = "") {
    const raw = text(val) || fallback;
    return `<span class="a5-solid" style="min-width:${minW}px">${escapeHtml(raw)}</span>`;
  }

  function dot(val, minW = 60, fallback = "") {
    const raw = text(val) || fallback;
    return `<span class="a5-dot" style="min-width:${minW}px">${escapeHtml(raw)}</span>`;
  }

  function cb(checked, label = "") {
    const sym = checked ? "☑" : "☐";
    return `<span class="a5-cbtxt">${sym}${label ? ` ${escapeHtml(label)}` : ""}</span>`;
  }

  function idBoxes(idStr) {
    const clean = text(idStr).replace(/\D/g, "").padEnd(13, " ");
    const chars = clean.split("").slice(0, 13);
    const box = (ch) => `<span class="a5-id-box">${ch === " " ? "&nbsp;" : escapeHtml(ch)}</span>`;
    return `<span class="a5-id-boxes">` +
      box(chars[0]) + ` - ` +
      chars.slice(1, 5).map(box).join("") + ` - ` +
      chars.slice(5, 10).map(box).join("") + ` - ` +
      chars.slice(10, 12).map(box).join("") + ` - ` +
      box(chars[12]) +
      `</span>`;
  }

  const MANIFEST = Object.freeze([
    { formId: "FORM_01", number: 1, title: "แบบแผนงานคดี", documentMode: "INTERNAL_PACC", triggerAction: "ON_INTAKE_ACCEPT", authorRole: "INVESTIGATOR", signerRole: "COMMITTEE_CHAIR", recipient: { name: "คณะกรรมการ ป.ป.ท.", role: "SUPERVISORY_BOARD" } },
    { formId: "FORM_02", number: 2, title: "แบบขอขยายระยะเวลาไต่สวนเบื้องต้น", documentMode: "INTERNAL_PACC", triggerAction: "ON_TIME_LIMIT_ALERT", authorRole: "INVESTIGATOR", signerRole: "SECRETARY_GENERAL", recipient: { name: "คณะกรรมการ ป.ป.ท.", role: "SUPERVISORY_BOARD" } },
    { formId: "FORM_03", number: 3, title: "แบบขอขยายระยะเวลาไต่สวน", documentMode: "INTERNAL_PACC", triggerAction: "ON_INQUIRY_TIME_LIMIT_ALERT", authorRole: "INVESTIGATION_SUBCOMMITTEE", signerRole: "SECRETARY_GENERAL", recipient: { name: "คณะกรรมการ ป.ป.ท.", role: "SUPERVISORY_BOARD" } },
    { formId: "FORM_04", number: 4, title: "แบบรายงานผลการไต่สวนเบื้องต้น", documentMode: "INTERNAL_PACC", triggerAction: "ON_PRELIM_INQUIRY_COMPLETE", authorRole: "INVESTIGATOR", signerRole: "INVESTIGATOR_HEAD", recipient: { name: "คณะกรรมการ ป.ป.ท.", role: "SUPERVISORY_BOARD" } },
    { formId: "FORM_05", number: 5, title: "แบบหนังสือแจ้งให้รับทราบข้อกล่าวหา", documentMode: "OUTGOING_PACC", triggerAction: "ON_ALLEGATION_RESOLUTION", authorRole: "INVESTIGATION_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "ผู้ถูกกล่าวหา", role: "ACCUSED" } },
    { formId: "FORM_06", number: 6, title: "แบบบันทึกการแจ้งข้อกล่าวหา", documentMode: "INTERNAL_PACC", triggerAction: "ON_ACCUSED_ACKNOWLEDGEMENT", authorRole: "INVESTIGATION_OFFICER", signerRole: "INVESTIGATION_OFFICER", recipient: { name: "สำนวนการไต่สวน", role: "CASE_FILE" } },
    { formId: "FORM_07", number: 7, title: "แบบรายงานการไต่สวน", documentMode: "INTERNAL_PACC", triggerAction: "ON_INQUIRY_COMPLETE", authorRole: "INVESTIGATION_SUBCOMMITTEE", signerRole: "INVESTIGATION_CHAIR", recipient: { name: "คณะกรรมการ ป.ป.ท.", role: "SUPERVISORY_BOARD" } },
    { formId: "FORM_08", number: 8, title: "แบบหนังสือแจ้งให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการเพื่อฟ้องคดีต่อศาล", documentMode: "OUTGOING_PACC", triggerAction: "ON_INDICTMENT_ORDER_RECEIVED", authorRole: "CASE_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "ผู้ถูกกล่าวหา", role: "ACCUSED" } },
    { formId: "FORM_09", number: 9, title: "แบบหนังสือแจ้งผู้บังคับบัญชา กรณียังไม่พบพนักงานอัยการเพื่อฟ้องคดีต่อศาล", documentMode: "OUTGOING_PACC", triggerAction: "ON_ACCUSED_FAIL_PROSECUTOR_APPOINTMENT", authorRole: "CASE_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "ผู้บังคับบัญชาของผู้ถูกกล่าวหา", role: "AGENCY_SUPERVISOR" } },
    { formId: "FORM_10", number: 10, title: "แบบหนังสือแจ้งพนักงานอัยการ", documentMode: "OUTGOING_PACC", triggerAction: "ON_COORDINATE_PROSECUTOR_AFTER_RESOLUTION", authorRole: "CASE_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "พนักงานอัยการ สำนักงานคดีปราบปรามการทุจริต", role: "PUBLIC_PROSECUTOR" } },
    { formId: "FORM_11", number: 11, title: "แบบคำร้องขอหมายจับ", documentMode: "INTERNAL_PACC", triggerAction: "ON_PROSECUTOR_WARRANT_REQUEST", authorRole: "PACC_AUTHORIZED_PETITIONER", signerRole: "PACC_AUTHORIZED_PETITIONER", recipient: { name: "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", role: "COURT" } },
    { formId: "FORM_12", number: 12, title: "แบบบันทึกคำเบิกความ", documentMode: "INTERNAL_PACC", triggerAction: "ON_COURT_HEARING_WARRANT", authorRole: "PACC_TESTIFYING_OFFICER", signerRole: "PACC_TESTIFYING_OFFICER", recipient: { name: "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", role: "COURT" } },
    { formId: "FORM_13", number: 13, title: "แบบรายงานกระบวนการพิจารณา", documentMode: "RECEIVED_EXTERNAL", triggerAction: "ON_COURT_PROCESS_REPORT_ISSUED", authorRole: "COURT_CLERK", signerRole: "JUDGE", recipient: { name: "สำนักงาน ป.ป.ท.", role: "PETITIONER_RECIPIENT" } },
    { formId: "FORM_14", number: 14, title: "แบบหมายจับ (กรณีอายุความไม่สะดุดหยุดลง)", documentMode: "RECEIVED_EXTERNAL", triggerAction: "ON_COURT_WARRANT_ISSUED_PRE_2016", authorRole: "COURT_OFFICER", signerRole: "JUDGE", recipient: { name: "ผู้บัญชาการตำรวจแห่งชาติ / คณะกรรมการ ป.ป.ท.", role: "ENFORCEMENT_BODY" } },
    { formId: "FORM_15", number: 15, title: "แบบหมายจับ (กรณีอายุความสะดุดหยุดลง)", documentMode: "RECEIVED_EXTERNAL", triggerAction: "ON_COURT_WARRANT_ISSUED_POST_2016", authorRole: "COURT_OFFICER", signerRole: "JUDGE", recipient: { name: "ผู้บัญชาการตำรวจแห่งชาติ / คณะกรรมการ ป.ป.ท.", role: "ENFORCEMENT_BODY" } },
    { formId: "FORM_16", number: 16, title: "แบบตำหนิรูปพรรณผู้กระทำความผิด", documentMode: "INTERNAL_PACC", triggerAction: "ON_WARRANT_EXECUTION_PREPARED", authorRole: "INVESTIGATION_OFFICER", signerRole: "INVESTIGATION_OFFICER", recipient: { name: "ชุดสืบสวนจับกุม / สำนักงานตำรวจแห่งชาติ", role: "ARREST_UNIT" } },
    { formId: "FORM_17", number: 17, title: "แบบหนังสือแจ้งผลการดำเนินการว่าออกหมายจับแล้ว", documentMode: "OUTGOING_PACC", triggerAction: "ON_WARRANT_OBTAINED", authorRole: "CASE_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "พนักงานอัยการ สำนักงานคดีปราบปรามการทุจริต", role: "PUBLIC_PROSECUTOR" } },
    { formId: "FORM_18", number: 18, title: "แบบหนังสือแจ้งผู้บัญชาการตำรวจแห่งชาติ", documentMode: "OUTGOING_PACC", triggerAction: "ON_REQUEST_POLICE_ARREST", authorRole: "CASE_OFFICER", signerRole: "SECRETARY_GENERAL", recipient: { name: "ผู้บัญชาการตำรวจแห่งชาติ", role: "POLICE_COMMISSIONER" } },
    { formId: "FORM_19", number: 19, title: "แบบบันทึกข้อความส่งหมายจับให้ กอท.", documentMode: "INTERNAL_PACC", triggerAction: "ON_SEND_WARRANT_TO_SPECIAL_OPS", authorRole: "CASE_OFFICER", signerRole: "DIRECTOR_BUREAU", recipient: { name: "ผู้อำนวยการ กอท. (กองอำนวยการ/ปฏิบัติการพิเศษ)", role: "SPECIAL_OPS_DIRECTOR" } },
    { formId: "FORM_20", number: 20, title: "แบบผนึกซองขอหมายจับ", documentMode: "INTERNAL_PACC", triggerAction: "ON_SEAL_WARRANT_PACKET", authorRole: "PACC_PETITIONER", signerRole: "PACC_PETITIONER", recipient: { name: "ศาลอาญาคดีทุจริตและประพฤติมิชอบ", role: "COURT" } }
  ]);

  const ACTIONS = Object.freeze([
    "DRAFT_FORM_08", "SIGN_FORM_08", "DISPATCH_FORM_08",
    "DRAFT_FORM_09", "SIGN_FORM_09", "DISPATCH_FORM_09",
    "DRAFT_FORM_10", "SIGN_FORM_10", "DISPATCH_FORM_10",
    "DRAFT_FORM_11", "SIGN_FORM_11",
    "DRAFT_FORM_12", "SIGN_FORM_12",
    "RECEIVE_FORM_13", "RECEIVE_FORM_14", "RECEIVE_FORM_15",
    "DRAFT_FORM_16", "SIGN_FORM_16",
    "DRAFT_FORM_17", "SIGN_FORM_17", "DISPATCH_FORM_17",
    "DRAFT_FORM_18", "SIGN_FORM_18", "DISPATCH_FORM_18",
    "DRAFT_FORM_19", "SIGN_FORM_19", "DISPATCH_FORM_19",
    "DRAFT_FORM_20", "SIGN_FORM_20"
  ]);

  function normalizeState(state = {}) {
    const s = object(state);
    const postDocs = object(s.postResolutionDocuments);
    return { ...s, postResolutionDocuments: { ...postDocs } };
  }

  function getFormManifest(formId) {
    return MANIFEST.find((item) => item.formId === formId) || null;
  }

  function executePostDocumentAction(state = {}, actionType, payload = {}) {
    const s = normalizeState(state);
    const postDocs = s.postResolutionDocuments;
    const now = new Date().toISOString();
    const p = object(payload);

    if (actionType === "RECEIVE_FORM_13" || actionType === "RECEIVE_FORM_14" || actionType === "RECEIVE_FORM_15") {
      const formId = actionType === "RECEIVE_FORM_13" ? "FORM_13" : (actionType === "RECEIVE_FORM_14" ? "FORM_14" : "FORM_15");
      postDocs[formId] = {
        formId,
        lifecycleStatus: "RECEIVED",
        receivedAt: now,
        courtOrigin: text(p.courtOrigin || "ศาลอาญาคดีทุจริตและประพฤติมิชอบ"),
        officialOrderNo: text(p.officialOrderNo || p.warrantNo || ""),
        fields: { ...object(p.fields) }
      };
      return { ok: true, state: s };
    }

    const match = String(actionType).match(/^(DRAFT|SIGN|DISPATCH)_(FORM_\d{2})$/);
    if (!match) return { ok: false, error: "UNKNOWN_ACTION", state: s };

    const [, act, formId] = match;
    const meta = getFormManifest(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: s };

    if (meta.documentMode === "RECEIVED_EXTERNAL" && act !== "RECEIVE") {
      return { ok: false, error: "EXTERNAL_COURT_DOCUMENT_CANNOT_BE_AUTHORED_BY_PACC", state: s };
    }

    const current = object(postDocs[formId]);
    if (act === "DRAFT") {
      postDocs[formId] = {
        ...current,
        formId,
        lifecycleStatus: "DRAFTED",
        draftedAt: now,
        authorRole: meta.authorRole,
        fields: { ...object(current.fields), ...p }
      };
      return { ok: true, state: s };
    }

    if (act === "SIGN") {
      if (current.lifecycleStatus !== "DRAFTED" && current.lifecycleStatus !== "SIGNED") {
        return { ok: false, error: "DOCUMENT_MUST_BE_DRAFTED_BEFORE_SIGN", state: s };
      }
      postDocs[formId] = {
        ...current,
        lifecycleStatus: "SIGNED",
        signedAt: now,
        signerRole: meta.signerRole,
        signerName: text(p.signerName || current.signerName || "เลขาธิการคณะกรรมการ ป.ป.ท.")
      };
      return { ok: true, state: s };
    }

    if (act === "DISPATCH") {
      if (current.lifecycleStatus !== "SIGNED") {
        return { ok: false, error: "DOCUMENT_MUST_BE_SIGNED_BEFORE_DISPATCH", state: s };
      }
      postDocs[formId] = {
        ...current,
        lifecycleStatus: "DISPATCHED",
        dispatchedAt: now,
        dispatchTrackingNo: text(p.dispatchTrackingNo || ""),
        recipient: { ...meta.recipient, ...object(p.recipient) }
      };
      return { ok: true, state: s };
    }

    return { ok: false, error: "UNSUPPORTED_TRANSITION", state: s };
  }

  function getPostDocumentActionModel(state = {}, formId) {
    const s = normalizeState(state);
    const meta = getFormManifest(formId);
    if (!meta) return { formId, allowedActions: [], status: "UNAVAILABLE" };

    const doc = s.postResolutionDocuments[formId];
    if (meta.documentMode === "RECEIVED_EXTERNAL") {
      return {
        formId,
        status: doc ? doc.lifecycleStatus : "AWAITING_COURT_RECEIPT",
        allowedActions: doc ? [] : [`RECEIVE_${formId}`],
        isExternal: true
      };
    }

    if (!doc) {
      return { formId, status: "READY_TO_DRAFT", allowedActions: [`DRAFT_${formId}`] };
    }

    if (doc.lifecycleStatus === "DRAFTED") {
      return { formId, status: "DRAFTED", allowedActions: [`DRAFT_${formId}`, `SIGN_${formId}`] };
    }

    if (doc.lifecycleStatus === "SIGNED") {
      const allowed = [`SIGN_${formId}`];
      if (meta.documentMode === "OUTGOING_PACC") allowed.push(`DISPATCH_${formId}`);
      return { formId, status: "SIGNED", allowedActions: allowed };
    }

    return { formId, status: doc.lifecycleStatus || "PENDING", allowedActions: [] };
  }

  function renderPostDocumentEditorA5(state = {}, formId) {
    const meta = getFormManifest(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบข้อมูลแบบเอกสาร ${escapeHtml(formId)}</div>`;
    const doc = object(object(state.postResolutionDocuments)[formId]);
    const fields = object(doc.fields);
    return `<div class="a5-post-doc-editor" data-form-id="${escapeHtml(formId)}">
<h3 class="a5-editor-heading">${escapeHtml(meta.title)} (แบบที่ ${meta.number})</h3>
<div class="a5-form-grid">
  <label class="a5-field-block"><span>เลขที่เอกสาร</span><input type="text" class="a5-input" name="docNo" value="${escapeHtml(fields.docNo || "")}" placeholder="เช่น ปป ๐๐.."></label>
  <label class="a5-field-block"><span>วันที่</span><input type="text" class="a5-input" name="docDate" value="${escapeHtml(fields.docDate || "")}" placeholder="เช่น ๒๕ สิงหาคม ๒๕๖๙"></label>
  <label class="a5-field-block a5-span-2"><span>เรื่อง</span><input type="text" class="a5-input" name="subject" value="${escapeHtml(fields.subject || meta.title)}"></label>
  <label class="a5-field-block a5-span-2"><span>ผู้รับ</span><input type="text" class="a5-input" name="recipientName" value="${escapeHtml(fields.recipientName || meta.recipient.name)}"></label>
  <label class="a5-field-block a5-span-2"><span>หมายเหตุ / พฤติการณ์คดี</span><textarea class="a5-textarea" name="note" rows="3">${escapeHtml(fields.note || "")}</textarea></label>
</div>
</div>`;
  }

  function renderPostDocumentPaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.postResolutionDocuments[formId]);
    return renderPostDocumentPaperByFormId(formId, doc.fields || {});
  }

  function renderPostDocumentPaperByFormId(formId, fields = {}) {
    const id = String(formId).toUpperCase();
    if (id === "FORM_08" || id === "FORM_8") return renderForm8PaperA5(fields);
    if (id === "FORM_09" || id === "FORM_9") return renderForm9PaperA5(fields);
    if (id === "FORM_10") return renderForm10PaperA5(fields);
    if (id === "FORM_11") return renderForm11PaperA5(fields);
    if (id === "FORM_12") return renderForm12PaperA5(fields);
    if (id === "FORM_13") return renderForm13PaperA5(fields);
    if (id === "FORM_14") return renderForm14PaperA5(fields);
    if (id === "FORM_15") return renderForm15PaperA5(fields);
    if (id === "FORM_16") return renderForm16PaperA5(fields);
    if (id === "FORM_17") return renderForm17PaperA5(fields);
    if (id === "FORM_18") return renderForm18PaperA5(fields);
    if (id === "FORM_19") return renderForm19PaperA5(fields);
    if (id === "FORM_20") return renderForm20PaperA5(fields);
    return `<article class="a5-report-paper a5-post-document-paper"><header><strong>ทะเบียนแบบเอกสาร 1–20</strong><span>ยึดแบบพิมพ์ต้นทาง</span></header><table><thead><tr><th>แบบ</th><th>ชื่อเอกสาร</th><th>เจ้าของผลลัพธ์</th><th>ผู้รับ</th></tr></thead><tbody>${MANIFEST.map(item => `<tr><td>${item.formId.replace("FORM_", "")}</td><td>${escapeHtml(item.title)}</td><td>${item.documentMode === "RECEIVED_EXTERNAL" ? "ศาลออกเอกสาร" : "สำนักงาน ป.ป.ท. จัดทำ"}</td><td>${escapeHtml(item.recipient.name || "เอกสารไม่ระบุ")}</td></tr>`).join("")}</tbody></table></article>`;
  }

  // ---------- Form 8: หนังสือแจ้งให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการเพื่อฟ้องคดีต่อศาล (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm8PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form8-paper a5-paper-page">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ปป ${dot(f.letterNo, 70, '..........')}/${dot(f.letterYear, 50, '........')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>วันที่ ${dot(f.day, 35, '..........')} เดือน ${dot(f.month, 100, '.............................')} พ.ศ. ${dot(f.year, 50, '................')}</p></div>
<div class="a5-letter-meta">
  <p class="a5-letter-subject"><strong>เรื่อง</strong> ให้ไปพบพนักงานอัยการเพื่อยื่นฟ้องคดีต่อศาล</p>
  <p class="a5-letter-to"><strong>เรียน</strong> ${dot(f.recipientName, 320, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')}</p>
</div>
<div class="a5-letter-content">
  <p class="a5-p-indent">ตามที่ คณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (คณะกรรมการ ป.ป.ท.) ได้ไต่สวนข้อเท็จจริงกรณีกล่าวหาท่านว่ากระทำความผิด ${dot(f.allegationBase, 300, '...........................................................................')} นั้น</p>
  <p class="a5-p-indent">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ขอเรียนว่า คณะกรรมการ ป.ป.ท. ได้พิจารณาสำนวนการไต่สวนข้อเท็จจริงแล้ว มีมติชี้มูลความผิดทางอาญาแก่ท่านในเรื่องดังกล่าว และพนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ได้พิจารณาแล้วมีคำสั่งฟ้องท่านในความผิดดังกล่าว โดยกำหนดนัดให้ท่านไปพบพนักงานอัยการ ณ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ในวันที่ ${dot(f.appointmentDate, 140, '...............................')} เวลา ${dot(f.appointmentTime, 80, '..................')} นาฬิกา เพื่อนำตัวท่านยื่นฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 180, '........................')}</p>
  <p class="a5-p-indent">ฉะนั้น จึงขอให้ท่านไปพบพนักงานอัยการตามกำหนดวัน เวลา และสถานที่ดังกล่าวข้างต้น ทั้งนี้ หากท่านไม่ไปพบพนักงานอัยการตามกำหนดนัดโดยไม่มีเหตุอันสมควร พนักงานอัยการจักได้ประสานสำนักงาน ป.ป.ท. เพื่อดำเนินการร้องขอต่อศาลให้ออกหมายจับท่านต่อไป อนึ่ง เพื่อประโยชน์ในการประกันตัวต่อศาล ขอให้ท่านนำหลักทรัพย์หรือหลักประกันพร้อมบุคคลที่เกี่ยวข้องไปในวันดังกล่าวด้วย</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อทราบและดำเนินการต่อไป</p>
</div>
<div class="a5-letter-sign-block">
  <p class="a5-sign-respect">ขอแสดงความนับถือ</p>
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '..............................................')})</p>
    <p class="a5-sign-title">เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
  </div>
</div>
<div class="a5-letter-footer">
  <div class="a5-footer-contact">
    <p>กอง/สำนัก ${dot(f.unitName, 180, '................')}</p>
    <p>โทร. ${dot(f.phone, 200, '........................................')}</p>
    <p>โทรสาร ${dot(f.fax, 200, '................................')}</p>
    <p>(${dot(f.officerName, 220, 'นาย/นาง/นางสาว..................................ผู้รับผิดชอบ')})</p>
    <p class="a5-hint-sub">(ระบุชื่อผู้รับผิดชอบและหมายเลขโทรศัพท์ที่สามารถติดต่อได้สะดวก)</p>
  </div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '....')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 9: หนังสือแจ้งผู้บังคับบัญชา (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm9PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form9-paper a5-paper-page">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ปป ${dot(f.letterNo, 70, '..........')}/${dot(f.letterYear, 50, '........')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>วันที่ ${dot(f.day, 35, '..........')} เดือน ${dot(f.month, 100, '.............................')} พ.ศ. ${dot(f.year, 50, '................')}</p></div>
<div class="a5-letter-meta">
  <p class="a5-letter-subject"><strong>เรื่อง</strong> ขอให้ส่งตัวข้าราชการไปพบพนักงานอัยการเพื่อยื่นฟ้องคดีต่อศาล</p>
  <p class="a5-letter-to"><strong>เรียน</strong> ${dot(f.supervisorTitle, 350, '(ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอน)')}</p>
  <p class="a5-letter-refline"><strong>อ้างถึง</strong> หนังสือสำนักงาน ป.ป.ท. ลับ ที่ ปป ${dot(f.refLetterNo, 80, '..........')} ลงวันที่ ${dot(f.refLetterDate, 140, '...............................')}</p>
</div>
<div class="a5-letter-content">
  <p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้แจ้งมติของคณะกรรมการ ป.ป.ท. ชี้มูลความผิดทางวินัยและทางอาญาแก่ ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ตำแหน่ง ${dot(f.accusedPosition, 180, '................................')} สังกัด ${dot(f.accusedAgency, 200, '................................')} เพื่อให้ท่านดำเนินการตามหน้าที่และอำนาจต่อไป ความละเอียดแจ้งแล้ว นั้น</p>
  <p class="a5-p-indent">สำนักงาน ป.ป.ท. ขอเรียนว่า พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ได้พิจารณาสำนวนการไต่สวนข้อเท็จจริงแล้ว มีคำสั่งฟ้อง ${dot(f.accusedName, 200, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ในความผิดฐาน ${dot(f.offenceBase, 260, '............................................................')} และได้มีหนังสือแจ้งให้สำนักงาน ป.ป.ท. ประสานส่งตัวผู้ถูกกล่าวหาดังกล่าวไปพบพนักงานอัยการ ณ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ในวันที่ ${dot(f.appointmentDate, 140, '...............................')} เวลา ${dot(f.appointmentTime, 80, '..................')} นาฬิกา เพื่อนำตัวยื่นฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 180, '........................')}</p>
  <p class="a5-p-indent">ฉะนั้น เพื่อให้การดำเนินคดีอาญาเป็นไปด้วยความเรียบร้อยและมีประสิทธิภาพ จึงขอความร่วมมือท่านแจ้งและส่งตัว ${dot(f.accusedName, 200, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ไปพบพนักงานอัยการตามกำหนดวัน เวลา และสถานที่ดังกล่าวข้างต้น ทั้งนี้ หากไม่สามารถส่งตัวผู้ถูกกล่าวหาไปพบพนักงานอัยการตามกำหนดนัดได้โดยไม่มีเหตุอันสมควร พนักงานอัยการจักได้ดำเนินการร้องขอต่อศาลให้ออกหมายจับผู้ถูกกล่าวหาต่อไป</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณาประสานและส่งตัวผู้ถูกกล่าวหาดังกล่าวไปพบพนักงานอัยการตามกำหนดนัดต่อไปด้วย จักขอบคุณยิ่ง</p>
</div>
<div class="a5-letter-sign-block">
  <p class="a5-sign-respect">ขอแสดงความนับถือ</p>
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '..............................................')})</p>
    <p class="a5-sign-title">เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
  </div>
</div>
<div class="a5-letter-footer">
  <div class="a5-footer-contact">
    <p>กอง/สำนัก ${dot(f.unitName, 180, '................')}</p>
    <p>โทร. ${dot(f.phone, 200, '........................................')}</p>
    <p>โทรสาร ${dot(f.fax, 200, '................................')}</p>
    <p>(${dot(f.officerName, 220, 'นาย/นาง/นางสาว..................................ผู้รับผิดชอบ')})</p>
  </div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '....')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 10: หนังสือแจ้งพนักงานอัยการ (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm10PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form10-paper a5-paper-page">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ปป ${dot(f.letterNo, 70, '..........')}/${dot(f.letterYear, 50, '........')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>วันที่ ${dot(f.day, 35, '..........')} เดือน ${dot(f.month, 100, '.............................')} พ.ศ. ${dot(f.year, 50, '................')}</p></div>
<div class="a5-letter-meta">
  <p class="a5-letter-subject"><strong>เรื่อง</strong> ส่งตัวผู้ถูกกล่าวหาเพื่อยื่นฟ้องคดีต่อศาล</p>
  <p class="a5-letter-to"><strong>เรียน</strong> อัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 240, '....................')}</p>
  <p class="a5-letter-refline"><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ที่ ${dot(f.prosecutorLetterNo, 80, '..........')} ลงวันที่ ${dot(f.prosecutorLetterDate, 100, '..........')}</p>
</div>
<div class="a5-letter-content">
  <p class="a5-p-indent">ตามหนังสือที่อ้างถึง แจ้งว่าพนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ได้มีคำสั่งฟ้อง ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ในความผิดฐาน ${dot(f.offenceBase, 260, '............................................................')} และขอให้ส่งตัวผู้ถูกกล่าวหาดังกล่าวไปพบพนักงานอัยการ ณ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ในวันที่ ${dot(f.appointmentDate, 140, '...............................')} เวลา ${dot(f.appointmentTime, 80, '..................')} นาฬิกา เพื่อนำตัวยื่นฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 180, '........................')} ความละเอียดแจ้งแล้ว นั้น</p>
  <p class="a5-p-indent">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ขอเรียนว่า ได้ดำเนินการประสานและแจ้งให้ ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ผู้ถูกกล่าวหา ไปพบพนักงานอัยการตามกำหนดวัน เวลา และสถานที่ดังกล่าวข้างต้นเรียบร้อยแล้ว โดยได้มอบหมายให้ ${dot(f.escortOfficerName, 220, 'นาย/นาง/นางสาว..................................')} ตำแหน่ง ${dot(f.escortOfficerPosition, 180, '................................')} เจ้าหน้าที่ ป.ป.ท. เป็นผู้ประสานงานและนำส่งตัวผู้ถูกกล่าวหา</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อโปรดดำเนินการต่อไป</p>
</div>
<div class="a5-letter-sign-block">
  <p class="a5-sign-respect">ขอแสดงความนับถือ</p>
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '..............................................')})</p>
    <p class="a5-sign-title">เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
  </div>
</div>
<div class="a5-letter-footer">
  <div class="a5-footer-contact">
    <p>กอง/สำนัก ${dot(f.unitName, 180, '................')}</p>
    <p>โทร. ${dot(f.phone, 200, '........................................')}</p>
    <p>โทรสาร ${dot(f.fax, 200, '................................')}</p>
    <p>(${dot(f.officerName, 220, 'นาย/นาง/นางสาว..................................ผู้รับผิดชอบ')})</p>
  </div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '....')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 11: แบบคำร้องขอหมายจับ (๓ หน้า Verbatim) ----------
  function renderForm11PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-court-paper a5-form11-paper a5-paper-page">
<div class="a5-court-page-1">
  <div class="a5-court-crest-left"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56"></div>
  <div class="a5-court-caption-left"><p>( คำร้อง )</p><p>ขอหมายจับ</p></div>
  <p class="a5-court-right-meta">ที่ ${solid(f.warrantReqNo, 80, '')} / ๒๕${solid(f.warrantReqYear, 50, '')}</p>
  <p class="a5-court-action-mark">รับคำร้อง</p>
  <p class="a5-court-action-mark">เรียกสอบ</p>
  <div class="a5-court-sign-row">
    <p>${solid(f.judgeSignature, 180, '........................................')} ผู้พิพากษา</p>
    <p><strong>ศาล</strong> ${solid(f.courtName, 260, 'อาญาคดีทุจริตและประพฤติมิชอบ.....')}</p>
  </div>
  <p class="a5-court-date-rt">วันที่ ${solid(f.day, 40, '..........')} เดือน ${solid(f.month, 110, '....................')} พุทธศักราช ๒๕${solid(f.year, 50, '......')}</p>
  <p class="a5-court-center-title"><strong>ความอาญา</strong></p>
  <div class="a5-court-party-row">
    <p>คณะกรรมการ ป.ป.ท. โดย ${solid(f.petitionerName, 200, 'นาย/นาง/นางสาว....')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
    <p class="a5-party-role-rt"><strong>ผู้ร้อง</strong></p>
  </div>
  <div class="a5-court-content">
    <p class="a5-court-row">ข้าพเจ้า ${solid(f.petitionerName, 200, '')} ตำแหน่ง ${solid(f.petitionerPosition, 160, 'พนักงาน ป.ป.ท.')}</p>
    <p class="a5-court-row">อายุ ${solid(f.petitionerAge, 50, '')} ปี อาชีพ ${solid(f.petitionerJob, 100, 'รับราชการ')} สถานที่ทำงาน ${solid(f.petitionerWorkplace, 240, 'สำนักงาน ป.ป.ท.')}</p>
    <p class="a5-court-row">แขวง/ตำบล ${solid(f.petitionerSubdistrict, 130, 'คลองเกลือ')} เขต/อำเภอ ${solid(f.petitionerDistrict, 130, 'ปากเกร็ด')} จังหวัด ${solid(f.petitionerProvince, 130, 'นนทบุรี')}</p>
    <p class="a5-court-row">โทรศัพท์ ${solid(f.petitionerPhone, 160, '')} ขอยื่นคำร้องขอออกหมายจับต่อศาล ดังมีข้อความที่จะกล่าวต่อไปนี้</p>
    <p class="a5-court-p-indent"><strong>ข้อ ๑.</strong> ด้วย ${cb(true, '')} พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 160, '.......')} ได้ขอให้ พนักงาน ป.ป.ท./อนุกรรมการและเลขานุการ ขอศาลอาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 180, '......................')} ขออนุมัติหมายจับ ${solid(f.accusedName, 220, '....(ชื่อ-สกุล ผู้ถูกกล่าวหา).....')} เลขประจำตัวประชาชน ${idBoxes(f.accusedIdNo)}</p>
    <p class="a5-court-p-indent2">${cb(true, '')} ปรากฏจากรายงานการไต่สวนและวินิจฉัยชี้มูลของ คณะกรรมการ ป.ป.ท. ว่า นาย/นาง/นางสาว ${solid(f.accusedName, 220, 'ผู้ถูกกล่าวหา')}</p>
    <p class="a5-court-row">อายุ ${solid(f.accusedAge, 60, '')} ปี เชื้อชาติ ${solid(f.accusedRace, 100, '')} สัญชาติ ${solid(f.accusedNation, 100, '')} อาชีพ ${solid(f.accusedJob, 120, '-')}</p>
    <p class="a5-court-row">อยู่บ้านเลขที่ ${solid(f.accusedHouseNo, 120, '')} หมู่ที่ ${solid(f.accusedMoo, 60, '-')} ถนน ${solid(f.accusedRoad, 120, '-')}</p>
    <p class="a5-court-row">ตรอก/ซอย ${solid(f.accusedSoi, 120, '-')} ใกล้เคียง ${solid(f.accusedNearby, 120, '-')} ตำบล/แขวง ${solid(f.accusedSubdistrict, 130, '')}</p>
    <p class="a5-court-row">อำเภอ/เขต ${solid(f.accusedDistrict, 130, '')} จังหวัด ${solid(f.accusedProvince, 130, '')} โทรศัพท์ ${solid(f.accusedPhone, 120, '')}</p>
    <p class="a5-court-row">ซึ่งมีตำหนิรูปพรรณตามที่แนบมาพร้อมนี้</p>
    <div class="a5-court-cbline">${cb(f.severeCrime ?? true, 'ได้หรือน่าจะได้กระทำความผิดอาญาร้ายแรงซึ่งมีอัตราโทษจำคุกอย่างสูงเกิน ๓ ปี')}</div>
    <div class="a5-court-cbline">${cb(f.flightRisk ?? true, 'ได้หรือน่าจะได้กระทำความผิดอาญา และน่าจะหลบหนีหรือจะไปยุ่งเหยิงกับพยานหลักฐานหรือก่ออันตรายประการอื่น')}</div>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>

<div class="a5-pg-break"></div>

<div class="a5-court-page-2">
  <div class="a5-court-pgno">- ๒ -</div>
  <div class="a5-court-content">
    <p class="a5-court-row">เหตุเกิดที่ ${solid(f.incidentPlace, 400, '')}</p>
    <p class="a5-court-row">เมื่อวันที่ ${solid(f.incidentDay, 40, '..........')} เดือน ${solid(f.incidentMonth, 110, '....................')} พุทธศักราช ๒๕${solid(f.incidentYear, 50, '......')} เวลา ${solid(f.incidentTime, 80, '..........')} น.</p>
    <p class="a5-court-p">มีพฤติการณ์กระทำความผิดที่เกี่ยวกับเหตุออกหมายจับ กล่าวคือ</p>
    <p class="a5-court-p-indent">ตามวันเวลาเกิดเหตุ ชื่อ-สกุล สถานะ ตำแหน่ง อำนาจหน้าที่ผู้ถูกกล่าวหา ${solid(f.accusedRoleAndPosition, 320, '')}</p>
    <p class="a5-court-p-indent">พิจารณาพยานหลักฐานจากการไต่สวน ทั้งพยานบุคคลและพยานเอกสารรับฟังได้ความว่า เมื่อวันที่ ${solid(f.incidentSummary, 380, '')}</p>
    <p class="a5-court-p-indent">การกระทำดังกล่าวข้างต้นของผู้ถูกกล่าวหา เป็นเหตุทำให้ (ความเสียหาย) ${solid(f.incidentDamage, 350, '………………………………')}</p>
    <p class="a5-court-p-indent">ดังนั้น การกระทำของผู้ถูกกล่าวหา จึงเป็นการกระทำทุจริตในภาครัฐอันเป็นความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${solid(f.allegationBase, 300, '')}</p>
    <p class="a5-court-p-indent">คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้แจ้งคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${solid(f.inquiryOrderNo, 120, '.....................')} ลงวันที่ ${solid(f.inquiryOrderDate, 140, '.................................')} เรื่องแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำทุจริตในภาครัฐ และสิทธิคัดค้านให้ผู้ถูกกล่าวหาทราบแล้วและได้รวบรวมพยานหลักฐานที่เกี่ยวข้องของผู้ถูกกล่าวหาแล้ว และได้แจ้งข้อกล่าวหาแก่ผู้ถูกกล่าวหา โดยวิธีส่งบันทึกแจ้งข้อกล่าวหาทางไปรษณีย์ ตามหนังสือสำนักงาน ป.ป.ท. ลับ ที่ ${solid(f.noticeLetterNo, 100, '........')} ลงวันที่ ${solid(f.noticeLetterDate, 120, '.........................')} พร้อมบันทึกการแจ้งข้อกล่าวหา ฉบับลงวันที่ ${solid(f.noticeRecordDate, 120, '.......................')} ส่งไปยัง ณ ภูมิลำเนาของผู้ถูกกล่าวหา ตามหลักฐานทางทะเบียนราษฎร ณ บ้านเลขที่ ${solid(f.accusedHouseNo, 150, '...........................................')} ซึ่งผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหาแล้ว ต่อมาได้มีหนังสือชี้แจงแก้ข้อกล่าวหา ฉบับลงวันที่ ${solid(f.defenceLetterDate, 150, '…………………………..')}</p>
    <p class="a5-court-p-indent">ต่อมา คณะกรรมการ ป.ป.ท. ได้มีมติการประชุม ครั้งที่ ${solid(f.mtiNo, 80, '...........')} ลงวันที่ ${solid(f.mtiDate, 120, '..........................')} ระเบียบวาระที่ ${solid(f.mtiAgenda, 80, '.................')} คณะกรรมการ ป.ป.ท. ได้มีมติวินิจฉัยชี้มูลความผิดทางอาญาและวินัยแก่ ${solid(f.accusedName, 200, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ดังนี้</p>
    <p class="a5-court-p-indent">ประเด็นที่ ๑ ผู้ถูกกล่าวหา เป็นความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${solid(f.allegationIssue1, 280, '……………….…')} (ให้แยกประเด็นละมาตรา)</p>
    <p class="a5-court-p-indent">เมื่อวันที่ ${solid(f.prosecutorSentDate, 140, '.................................')} คณะกรรมการ ป.ป.ท. ได้ส่งรายงานการไต่สวน พร้อมด้วยเอกสารประกอบเรื่องกล่าวหา เรื่องที่ ${solid(f.caseRefNo, 120, '....................')} ไปยังอธิบดีอัยการ สำนักงานคดีปราบปรามการทุจริต ${solid(f.prosecutorRegion, 150, '................')} โดยขอให้พิจารณาคดีอาญาแก่ ${solid(f.accusedName, 180, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ตามหนังสือสำนักงาน ป.ป.ท. ลับ ที่ ปป ๐๐${solid(f.paccSecretLetterNo, 80, '.....')} / ${solid(f.paccSecretLetterYear, 60, '................')} ลงวันที่ ${solid(f.paccSecretLetterDate, 140, '……………………………..')}</p>
    <p class="a5-court-p-indent">เมื่อวันที่ ${solid(f.prosecutorReplyDate, 120, '.......................')} พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '..............')} ได้มีหนังสือแจ้งว่าได้มีคำสั่งฟ้อง ${solid(f.accusedName, 180, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ในความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${solid(f.offenceBase, 220, '.....................................')} โดยให้ส่งตัวผู้ถูกกล่าวหาไปยังสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '..............')} เพื่อฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 150, '..........')} ในวันที่ ${solid(f.appointmentDate, 130, '...............................')} เวลา ${solid(f.appointmentTime, 80, '........................')} นาฬิกา ตามหนังสือ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '....................')} ที่ ${solid(f.prosecutorLetterNo, 80, '...................')} ลงวันที่ ${solid(f.prosecutorLetterDate, 120, '…………………….')}</p>
    <p class="a5-court-p-indent">สำนักงาน ป.ป.ท. มีหนังสือ ลับ ที่ ปป ๐๐${solid(f.accusedNoticeSecretNo, 70, '...')} / ${solid(f.accusedNoticeSecretYear, 60, '.............')} ลงวันที่ ${solid(f.accusedNoticeDate, 120, '.......................')} ถึงผู้ถูกกล่าวหาแจ้งให้ไปพบพนักงานอัยการที่สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '.............')} ในวันที่ ${solid(f.appointmentDate, 130, '................................')} เวลา ${solid(f.appointmentTime, 80, '..................')} นาฬิกา โดยได้ส่งหนังสือดังกล่าวไปยังภูมิลำเนาตามทะเบียนราษฎรของผู้ถูกกล่าวหา ณ บ้านเลขที่ ${solid(f.accusedHouseNo, 180, '..............................................................')} ด้วยวิธีการส่งไปรษณีย์ด่วนพิเศษในประเทศ (EMS) ซึ่งผู้ถูกกล่าวหาได้รับทราบแล้ว ปรากฏตามไปรษณีย์ตอบรับ ${solid(f.emsReceiptNo, 200, '.................................................................')}</p>
    <p class="a5-court-p-indent">ต่อมาพนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '.........')} แจ้งว่า ผู้ถูกกล่าวหา ไม่ได้ไปพบพนักงานอัยการเพื่อยื่นฟ้องต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 150, '............')} ในวันที่ ${solid(f.appointmentDate, 120, '.........................')} เวลา ${solid(f.appointmentTime, 80, '.........................')} นาฬิกา ตามกำหนดนัดข้างต้น และไม่แจ้งเหตุขัดข้องให้ทราบและ</p>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. .....</p></div>
</div>

<div class="a5-pg-break"></div>

<div class="a5-court-page-3">
  <div class="a5-court-pgno">- ๓ -</div>
  <div class="a5-court-content">
    <p class="a5-court-p">ไม่สามารถติดต่อด้วยวิธีอื่นใดได้ กรณีมีพฤติการณ์หลบหนีและเพื่อมิให้เสียหายแก่คดี จึงขอให้พนักงาน ป.ป.ท./อนุกรรมการและเลขานุการคณะอนุกรรมการไต่สวนดำเนินการออกหมายจับ ${solid(f.accusedName, 200, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ต่อศาลอาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 150, '.........')} โดยยื่นคำร้องต่อศาลเพื่อขอให้ออกหมายจับ ${solid(f.accusedName, 200, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} เนื่องจากผู้ถูกกล่าวหา ได้หรือน่าจะได้กระทำความผิดอาญาตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ซึ่งมีอัตราโทษ ${solid(f.penaltyRate, 160, '..........................')} และมีพฤติการณ์หลบหนี จึงมีเหตุที่จะออกหมายจับได้ ตามประมวลกฎหมายวิธีพิจารณาความอาญา มาตรา ๖๖ (๒) ตามหนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 140, '............')} ที่ ${solid(f.prosecutorWarrantReqNo, 80, '.................')} ลงวันที่ ${solid(f.prosecutorWarrantReqDate, 120, '………………')}</p>
    <p class="a5-court-p-indent">เป็นการกระทำความผิดฐาน ${solid(f.offenceBase, 300, '................................................................................')} ตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ มาตรา ${solid(f.offenceSection, 160, '...................................')} รายละเอียดข้อมูลและพยานหลักฐาน ปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
    <p class="a5-court-p-indent">อนึ่ง คดีดังกล่าวเหตุเกิดขึ้นหลัง วันที่ ๓๐ เมษายน ๒๕๕๙ โดยผู้ถูกกล่าวหาได้หลบหนีไป เมื่อวันที่ ${solid(f.flightDate, 160, '..................................................')} ในระหว่างถูกดำเนินคดี จึงมิให้นับระยะเวลาที่ผู้ต้องหาหลบหนี รวมเป็นส่วนหนึ่งของอายุความ ตามมาตรา ๖๑/๑ แห่ง พ.ร.บ. มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม (ใช้ในกรณีเหตุเกิดขึ้นหลัง วันที่ ๓๐ เมษายน ๒๕๕๙)</p>
    <p class="a5-court-p-indent"><strong>ข้อ ๒.</strong> ผู้ร้องประสงค์จะทำการจับกุม ${solid(f.accusedName, 260, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')}</p>
    <p class="a5-court-p">จึงขอให้ศาลออกหมายจับ ${solid(f.accusedName, 260, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')} มาดำเนินคดี</p>
    <p class="a5-court-p-indent">ผู้ร้อง ${cb(f.previouslyRequested === true, 'เคย')} ${cb(f.previouslyRequested !== true, 'ไม่เคย')} ร้องขอให้ศาล อาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 140, '.....')} ออกหมายจับบุคคลดังกล่าว โดยอาศัยเหตุแห่งการร้องขอเดียวกันนี้ หรือเหตุอื่น (ระบุ) ${solid(f.priorRequestReason, 100, '-')}</p>
    <p class="a5-court-row">และศาลมีคำสั่ง ${solid(f.priorCourtOrder, 250, '-')}</p>
    <p class="a5-court-respect">ควรมิควรแล้วแต่จะโปรด</p>
    <div class="a5-court-sign-stack">
      <p class="a5-court-sign-line"><span class="a5-sign-dots-court"></span> ลงชื่อ ${solid(f.petitionerName, 200, '')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <span class="a5-sign-role-rt">ผู้ร้อง</span></p>
      <p class="a5-court-sign-line"><span class="a5-sign-dots-court"></span> ลงชื่อ ${solid(f.drafterName || f.petitionerName, 200, '')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <span class="a5-sign-role-rt">ผู้เรียง/พิมพ์</span></p>
    </div>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. .....</p></div>
</div>
</article>`;
  }

  // ---------- Form 12: แบบบันทึกคำเบิกความ (๑ หน้า Verbatim) ----------
  function renderForm12PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-court-paper a5-form12-paper a5-paper-page">
<div class="a5-court-crest-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56"></div>
<h1 class="a5-court-title">บันทึกคำเบิกความ</h1>
<p class="a5-court-right"><strong>ศาล</strong> ${solid(f.courtName, 260, 'อาญาคดีทุจริตและประพฤติมิชอบ......')}</p>
<p class="a5-court-date-rt">วันที่ ${solid(f.day, 40, '..........')} เดือน ${solid(f.month, 110, '....................')} พุทธศักราช ๒๕${solid(f.year, 50, '......')}</p>
<p class="a5-court-center-title"><strong>ความอาญา</strong></p>
<div class="a5-court-party-row">
  <p>คณะกรรมการ ป.ป.ท. โดย ${solid(f.petitionerName, 220, 'นาย/นาง...')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
  <p class="a5-party-role-rt"><strong>ผู้ร้อง</strong></p>
</div>
<div class="a5-court-content">
  <p class="a5-court-p-indent">พยานได้ปฏิญาณหรือสาบานตนแล้วเบิกความต่อศาล มีสาระสำคัญว่า</p>
  <p class="a5-court-row">พยานชื่อ ${solid(f.petitionerName, 220, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.')} อายุ ${solid(f.petitionerAge, 60, '..........')} ปี อาชีพ ${solid(f.petitionerJob, 120, 'รับราชการ')}</p>
  <p class="a5-court-row">ตั้งบ้านเรือนอยู่เลขที่ ${solid(f.petitionerAddress, 450, 'สำนักงาน ป.ป.ท. อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี')}</p>
  <p class="a5-court-row">เกี่ยวพันกับคดีนี้โดยเป็นผู้ร้องและรู้เห็นในคดีนี้คือ</p>
  <p class="a5-court-p-indent">(เป็นอนุกรรมการและเลขานุการ คณะอนุกรรมการไต่สวน/เป็นพนักงาน ป.ป.ท. เจ้าของสำนวนคดี) โดยเป็นคดีที่คณะกรรมการ ป.ป.ช. ได้มอบหมายให้คณะกรรมการ ป.ป.ท. ดำเนินการแทน ตามมาตรา ๖๒ แห่งพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑ โดยสำนักงาน ป.ป.ช. ได้ส่งเรื่องมายังสำนักงาน ป.ป.ท. เพื่อดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่งมีพฤติการณ์แห่งคดี คือ ${solid(f.caseNarrative, 300, '.............................................................................................................................................')}</p>
  <p class="a5-court-p-indent">ต่อมาคณะกรรมการ ป.ป.ท. มีมติชี้มูลความผิด และส่งสำนวนไปยังสำนักงานอัยการคดีพิเศษฝ่ายคดีปราบปรามการทุจริต ${solid(f.prosecutorOffice, 160, '..............')} พนักงานอัยการมีคำสั่งฟ้องคดี และแจ้งให้สำนักงาน ป.ป.ท. แจ้งให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการ แต่ผู้ถูกกล่าวหาไม่ไปพบพนักงานอัยการตามแจ้ง และพฤติการณ์น่าเชื่อว่า ผู้ถูกกล่าวหาได้กระทำความผิดจริงและหลบหนี รายละเอียดข้อมูลพยานหลักฐานปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
  <p class="a5-court-p-indent">จึงขอประทานอนุญาตศาล โปรดออกหมายจับผู้ต้องหาตามคำร้อง</p>
  <div class="a5-court-sign-block-rt">
    <p class="a5-court-sign-line">(${solid(f.petitionerName, 220, '..............................................')})</p>
    <p>พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. พยานผู้ร้อง</p>
  </div>
</div>
<div class="a5-court-pgfoot"><p>ปปท. .....</p></div>
</article>`;
  }

  // ---------- Form 13: แบบรายงานกระบวนการพิจารณา (๒ หน้า Verbatim) ----------
  function renderForm13PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-court-paper a5-form13-paper a5-paper-page">
<div class="a5-court-page-1">
  <div class="a5-court-top-grid">
    <div class="a5-court-main-title">
      <h1>รายงาน<br>กระบวนการ<br>พิจารณา</h1>
    </div>
    <div class="a5-court-right-meta">
      <img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56" style="margin-bottom:.3rem">
      <p>คดีหมายเลขดำที่ ${solid(f.blackNo, 120, '..................')} / ๒๕${solid(f.blackYear, 40, '......')}</p>
      <p>คดีหมายเลขแดงที่ ${solid(f.redNo, 120, '..................')} / ๒๕${solid(f.redYear, 40, '......')}</p>
      <p><strong>ศาล</strong> ${solid(f.courtName, 240, 'อาญาคดีทุจริตและประพฤติมิชอบ.....')}</p>
      <p>วันที่ ${solid(f.day, 40, '..........')} เดือน ${solid(f.month, 110, '....................')} พุทธศักราช ๒๕${solid(f.year, 50, '......')}</p>
    </div>
  </div>
  <p class="a5-court-center-title"><strong>ความอาญา</strong></p>
  <div class="a5-court-party-row">
    <p>คณะกรรมการ ป.ป.ท. โดย ${solid(f.petitionerName, 220, 'นาย/นาง/นางสาว...')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
    <p class="a5-party-role-rt"><strong>ผู้ร้อง</strong></p>
  </div>
  <div class="a5-court-content">
    <p class="a5-court-row">ผู้พิพากษาออกนั่งพิจารณาคดีนี้เวลา ${solid(f.courtTime, 120, '.......................')} นาฬิกา</p>
    <p class="a5-court-p-indent">วันนี้ ${solid(f.petitionerName, 200, '')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ตำแหน่ง ${solid(f.petitionerPosition, 180, 'พนักงาน ป.ป.ท.')} ได้ยื่นคำร้องขอให้ศาลออกหมายจับ</p>
    <p class="a5-court-row">สอบพยานผู้ร้องซึ่งเบิกความประกอบพยานหลักฐานที่แนบมาพร้อมคำร้อง ${solid(f.witnessCount, 80, '๑')} ปาก จำนวน ${solid(f.evidencePackCount, 80, '๑ ชุด')}</p>
    <p class="a5-court-p-indent">คดีเสร็จสิ้นการไต่สวน ให้รอฟังคำสั่ง</p>
    <p class="a5-court-right">/อ่านแล้ว</p>
    <div class="a5-court-sign-grid">
      <p class="a5-court-sign-rt">(${solid(f.judgeName, 200, '..............................................')}) ผู้พิพากษา บันทึก/อ่าน</p>
      <p class="a5-court-sign-rt">(${solid(f.petitionerName, 200, '..............................................')}) พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ผู้ร้อง</p>
    </div>
    <h2 class="a5-court-order-title">คำสั่ง</h2>
    <p class="a5-court-p-indent">พิเคราะห์พยานหลักฐานของผู้ร้องแล้วเห็นว่า ${solid(f.courtReasoning, 450, '………………………………………………………………………………………')}</p>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. .....</p></div>
</div>

<div class="a5-pg-break"></div>

<div class="a5-court-page-2">
  <div class="a5-court-pgno">- ๒ -</div>
  <div class="a5-court-content">
    <p class="a5-court-p-indent">กรณีมีพยานหลักฐานตามควรว่า ${solid(f.accusedName, 280, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')}</p>
    <div class="a5-court-cbline">${cb(f.severeCrime ?? true, 'ได้หรือน่าจะได้กระทำความผิดอาญาร้ายแรงซึ่งมีอัตราโทษจำคุกอย่างสูงเกิน ๓ ปี')}</div>
    <div class="a5-court-cbline">${cb(f.flightRisk ?? true, 'ได้หรือน่าจะได้กระทำความผิดอาญา และน่าจะหลบหนีหรือจะไปยุ่งเหยิงกับพยานหลักฐานหรือก่ออันตรายประการอื่น')}</div>
    <p class="a5-court-row">จึงอนุญาตให้ออกหมายจับ ${solid(f.accusedName, 280, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')} ตามขอ</p>
    <p class="a5-court-row">และเมื่อจัดการตามหมายจับได้แล้ว ให้ส่งบันทึกการจับกุมต่อศาลภายใน ${solid(f.reportDaysLimit, 60, '๑๕')} วัน</p>
    <p class="a5-court-p-indent">ให้ถ่ายสำเนา ${solid(f.copyDocuments, 380, '………………………………………………………………')}</p>
    <p class="a5-court-row">เพื่อเก็บไว้กับคำร้องและสำเนาหมาย</p>
    <p class="a5-court-p-indent">ได้อ่านคำสั่งให้ผู้ร้องฟังโดยชอบแล้ว</p>
    <p class="a5-court-right">/อ่านแล้ว</p>
    <div class="a5-court-sign-block-rt">
      <p class="a5-court-sign-line">(${solid(f.judgeName, 220, '..............................................')})</p>
      <p>ผู้พิพากษา</p>
    </div>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>
</article>`;
  }

  // ---------- Forms 14–15: หมายจับ ๒ กรณี (ก่อน/หลัง ๓๐ เม.ย. ๕๙) (๒ หน้า Verbatim) ----------
  function renderForm14PaperA5(fields = {}) {
    return renderWarrantPaperA5(fields, false);
  }

  function renderForm15PaperA5(fields = {}) {
    return renderWarrantPaperA5(fields, true);
  }

  function renderWarrantPaperA5(fields = {}, isAfter = false) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-court-paper a5-warrant-paper a5-form${isAfter ? '15' : '14'}-paper a5-paper-page">
<div class="a5-warrant-page-1">
  <div class="a5-warrant-head-top">
    <div class="a5-warrant-tag"><span class="a5-circle-sym">○</span> (๔๗ ทวิ) <span class="a5-warrant-badge">${isAfter ? 'เหตุเกิด ๓๐ เม.ย. ๕๙ เป็นต้นไป' : 'กรณีเหตุเกิดก่อน ๓๐ เม.ย. ๕๙'}</span></div>
    <div class="a5-warrant-court-use"><p>สำหรับศาลใช้</p></div>
  </div>
  <h1 class="a5-court-title">หมายจับ</h1>
  <div class="a5-court-crest-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56"></div>
  <p class="a5-court-right">ที่ ${solid(f.warrantNo, 120, '')} / ๒๕${solid(f.warrantYear, 50, '')}</p>
  <h2 class="a5-king-title">ในพระปรมาภิไธยพระมหากษัตริย์</h2>
  <p class="a5-court-right"><strong>ศาล</strong> ${solid(f.courtName, 260, 'อาญาคดีทุจริตและประพฤติมิชอบ.....')}</p>
  <p class="a5-court-date-rt">วันที่ ${solid(f.day, 40, '..........')} เดือน ${solid(f.month, 110, '....................')} พุทธศักราช ๒๕${solid(f.year, 50, '......')}</p>
  <p class="a5-court-center-title"><strong>ความอาญา</strong></p>
  <div class="a5-court-party-row">
    <p>คณะกรรมการ ป.ป.ท. โดย ${solid(f.petitionerName, 220, 'นาย/นาง/นางสาว....')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
    <p class="a5-party-role-rt"><strong>ผู้ร้อง</strong></p>
  </div>
  <div class="a5-court-content">
    <p class="a5-court-row"><strong>หมายถึง</strong> ผู้บัญชาการตำรวจแห่งชาติ , คณะกรรมการ ป.ป.ท.</p>
    <p class="a5-court-row"><strong>ด้วย</strong> ${solid(f.accusedName, 400, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')}</p>
    <p class="a5-court-row">ซึ่งต้องหาว่ากระทำความผิดฐาน ${solid(f.offenceBase, 400, '....................................................................................................................... ............')}</p>
    <p class="a5-court-p">กรณีมีหลักฐานตามสมควรว่า* ${solid(f.accusedName, 240, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')}</p>
    <div class="a5-court-cbline">${cb(f.severeCrime ?? true, '๑. ได้หรือน่าจะได้กระทำความผิดอาญาซึ่งมีอัตราโทษจำคุกอย่างสูงเกินสามปี')}</div>
    <div class="a5-court-cbline">${cb(f.flightRisk ?? true, '๒. ได้หรือน่าจะได้กระทำความผิดอาญาและมีเหตุอันควรเชื่อว่า')}</div>
    <div class="a5-court-cbsub">${cb(f.willFlee ?? true, '๒.๑ จะหลบหนี')} ${cb(f.willTamperEvidence ?? false, '๒.๒ จะไปยุ่งเหยิงกับพยานหลักฐาน')} ${cb(f.willCauseDanger ?? false, '๒.๓ ก่อเหตุอันตรายประการอื่น')}</div>
    <div class="a5-court-cbline">${cb(f.otherReason ?? false, '๓. อื่นๆ')}</div>
    <p class="a5-court-p-indent">เพราะฉะนั้นให้ท่านจับตัว* ${solid(f.accusedName, 260, 'ชื่อ-สกุล ผู้ถูกกล่าวหา')}</p>
    <p class="a5-court-row">เลขประจำตัวประชาชน ${idBoxes(f.accusedIdNo)} เชื้อชาติ ${solid(f.accusedRace, 100, '')}</p>
    <p class="a5-court-row">สัญชาติ ${solid(f.accusedNation, 100, '')} อาชีพ ${solid(f.accusedJob, 120, '')} อยู่บ้านเลขที่ ${solid(f.accusedHouseNo, 120, '')} หมู่ที่ ${solid(f.accusedMoo, 60, '-')}</p>
    <p class="a5-court-row">ถนน ${solid(f.accusedRoad, 130, '-')} ตรอก/ซอย ${solid(f.accusedSoi, 120, '-')} ใกล้เคียง ${solid(f.accusedNearby, 120, '-')}</p>
    <p class="a5-court-row">ตำบล/แขวง ${solid(f.accusedSubdistrict, 130, '')} อำเภอ/เขต ${solid(f.accusedDistrict, 130, '')} จังหวัด ${solid(f.accusedProvince, 130, '')}</p>
    <p class="a5-court-row">โทรศัพท์ ${solid(f.accusedPhone, 130, '')} ไปส่งที่ สำนักงานอัยการพิเศษฝ่าย${solid(f.prosecutorOffice, 160, '.....')}</p>
    ${isAfter ? `<p class="a5-court-row">ภายในอายุความ ${solid(f.limitationYears, 40, '-')} ปี นับแต่วันที่ ${solid(f.limitationStartDay, 30, '')} เดือน ${solid(f.limitationStartMonth, 80, '')} พ.ศ. ๒๕${solid(f.limitationStartYear, 40, '')} เพื่อจะได้ดำเนินการตามกฎหมาย แต่ไม่เกินวันที่ ${solid(f.limitationEndDay, 30, '-')} เดือน ${solid(f.limitationEndMonth, 80, '-')} พ.ศ. ๒๕${solid(f.limitationEndYear, 40, '-')}</p>` : `<p class="a5-court-row">ภายในอายุความ ${solid(f.limitationYears, 60, 'ให้ระบุ')} ปี นับแต่วันที่ ${solid(f.limitationStartDay, 40, 'ให้ระบุ')} เดือน ${solid(f.limitationStartMonth, 80, 'ให้ระบุ')} พ.ศ. ๒๕${solid(f.limitationStartYear, 40, 'ให้ระบุ')} เพื่อจะได้ดำเนินการตามกฎหมาย แต่ไม่เกินวันที่ ${solid(f.limitationEndDay, 40, 'ให้ระบุ')} เดือน ${solid(f.limitationEndMonth, 80, 'ให้ระบุ')} พ.ศ. ๒๕${solid(f.limitationEndYear, 40, 'ให้ระบุ')}</p>`}
    <div class="a5-court-sign-block-rt">
      <p class="a5-court-sign-line">(${solid(f.judgeName, 200, '..............................................')})</p>
      <p>ผู้พิพากษา</p>
      <p class="a5-court-flip-hint">(พลิก)</p>
    </div>
    <div class="a5-court-warrant-note">
      ${isAfter ? `<p><strong>หมายเหตุ :</strong> * ผู้ถูกกล่าวหาได้หลบหนีไปเมื่อวันที่ ${solid(f.flightDate, 140, '....................')} ในระหว่างถูกดำเนินคดี จึงมิให้นับระยะเวลาที่ผู้ต้องหาหลบหนี รวมเป็นส่วนหนึ่งของอายุความ ตามมาตรา ๖๑/๑ แห่ง พ.ร.บ. มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>` : `<p><strong>หมายเหตุ :</strong> * ให้ระบุชื่อตัว ชื่อสกุล และแนบตำหนิรูปพรรณของบุคคลที่จะถูกจับ เท่าที่ทราบไปพร้อมกับหมายนี้ด้วย<br>* เป็นการจับตัวเพื่อนำส่งพนักงานอัยการ เพื่อฟ้องคดีต่อศาล</p>`}
    </div>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>

<div class="a5-pg-break"></div>

<div class="a5-warrant-page-2">
  <div class="a5-court-pgno">- ๒ -</div>
  <div class="a5-court-content">
    <h2 class="a5-court-center-title">บันทึก</h2>
    <p class="a5-court-center">วันที่ ${solid(f.execDay, 30, '………')} เดือน ${solid(f.execMonth, 90, '………………………………')} พ.ศ. ๒๕${solid(f.execYear, 40, '………')}</p>
    <p class="a5-court-p-indent">เจ้าพนักงานผู้จัดการตามหมายได้แจ้งข้อความในหมายให้แก่ผู้เกี่ยวข้องทราบและได้ส่งหมายให้ตรวจดูแล้ว</p>
    <div class="a5-court-sign-block-center">
      <p>(${solid(f.execOfficerName, 220, '……………………………………………………..')})</p>
      <p>เจ้าพนักงานผู้จัดการตามหมาย</p>
    </div>
    <p class="a5-court-p-indent">ข้าพเจ้าผู้มีชื่อข้างท้ายนี้ได้รับทราบข้อความในหมาย และได้ตรวจดูหมายแล้ว</p>
    <div class="a5-court-sign-block-center">
      <p>(${solid(f.recipientAckName, 220, '…………………………………………………………')})</p>
      <p>ผู้รับทราบ</p>
    </div>
    <h2 class="a5-court-warn-title">คำเตือน</h2>
    <p class="a5-court-p-indent">เจ้าพนักงานผู้จัดการตามหมายพึงปฏิบัติตามกฎหมาย และต้องแจ้งข้อกล่าวหาให้ผู้ถูกจับทราบ แสดงหมายจับต่อผู้ถูกจับ พร้อมทั้งแจ้งให้ผู้ถูกจับทราบถึงสิทธิตามประมวลกฎหมายวิธีพิจารณาความอาญา มาตรา ๘</p>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>
</article>`;
  }

  // ---------- Form 16: แบบตำหนิรูปพรรณผู้กระทำความผิด (๒ หน้า Verbatim) ----------
  function renderForm16PaperA5(fields = {}) {
    const f = object(fields);
    const traitRow = (label, ...opts) => `<tr><th>${escapeHtml(label)}</th><td>${opts.map(t => `<span class="a5-trait-opt">${cb(false, t)}</span>`).join('')}</td></tr>`;
    return `<article class="a5-report-paper a5-court-paper a5-form16-paper a5-paper-page">
<div class="a5-trait-page-1">
  <div class="a5-trait-head-grid">
    <div class="a5-photo-box-tr14"><p>ภาพถ่าย<br>ผู้ถูกกล่าวหา<br>(จาก ทร.14)</p></div>
    <div class="a5-trait-head-mid">
      <img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="46" height="50">
      <p class="a5-trait-org-title"><strong>สำนักงาน ป.ป.ท.</strong></p>
      <h1 class="a5-trait-doc-title">ตำหนิรูปพรรณผู้กระทำความผิด</h1>
      <p class="a5-trait-doc-hint">(เติมข้อความในช่องว่าง และกาเครื่องหมาย ✓ ใน ☐ หน้าข้อความที่ต้องการได้มากกว่าหนึ่งรายการ)</p>
    </div>
  </div>
  <div class="a5-court-content">
    <p class="a5-court-row">ส่วนราชการ กลุ่ม/กอง/สำนัก ${solid(f.unitName, 260, '')} สำนักงาน ป.ป.ท.</p>
    <p class="a5-court-row">หมายจับที่ ${solid(f.warrantNo, 180, '')} คดี ป.ป.ท. ที่ ${solid(f.caseNo, 180, '')}</p>
    <p class="a5-court-row">วันเดือนปีที่ส่งรายงาน ${solid(f.reportSentDate, 350, '')}</p>
    <p class="a5-court-row">ความผิดฐาน ${solid(f.offenceBase, 400, '')}</p>
    <p class="a5-court-row">วันเดือนปี เวลา และสถานที่เกิดเหตุ ${solid(f.incidentTimeAndPlace, 350, '')}</p>
    <p class="a5-court-row">วันขาดอายุความหรือกำหนดล่วงเลยในการลงอาญา ${solid(f.limitationExpiryDate, 280, '')}</p>
    <p class="a5-court-row">ชื่อนามสกุล (ภาษาไทย) ${solid(f.accusedName, 240, '')} เพศ ${cb(f.gender === 'male' || f.gender === 'ชาย', 'ชาย')} ${cb(f.gender === 'female' || f.gender === 'หญิง', 'หญิง')}</p>
    <p class="a5-court-row">ชื่อนามสกุล (ภาษาอังกฤษตามหนังสือเดินทาง) ${solid(f.accusedNameEn, 300, '')}</p>
    <p class="a5-hint-sub">เลขบัตรประจำตัวประชาชน / บัตรประจำตัวเจ้าหน้าที่ของรัฐ – พนักงานองค์การของรัฐ / ใบสำคัญประจำตัวคนต่างด้าว / หนังสือเดินทาง</p>
    <p class="a5-court-row">เลขประจำตัว ${idBoxes(f.accusedIdNo)}</p>
    <p class="a5-court-row">ชื่ออื่น ${solid(f.otherFirstName, 200, '')} ชื่อสกุลอื่น ${solid(f.otherLastName, 200, '')}</p>
    <p class="a5-court-row">วันเดือนปีเกิด ${solid(f.birthDate, 160, '')} เชื้อชาติ ${solid(f.race, 120, '')} สัญชาติ ${solid(f.nationality, 120, '')}</p>
    <p class="a5-court-row">ประวัติ คดี ${solid(f.caseHistory, 400, '')}</p>
    <p class="a5-court-row">ชื่อนามสกุลบิดา ${solid(f.fatherName, 200, '')} ที่พัก ${solid(f.fatherAddress, 200, '')}</p>
    <p class="a5-court-row">ชื่อนามสกุลมารดา ${solid(f.motherName, 200, '')} ที่พัก ${solid(f.motherAddress, 200, '')}</p>
    <p class="a5-court-row">ชื่อนามสกุลสามี/ภรรยา ${solid(f.spouseName, 190, '')} ที่พัก ${solid(f.spouseAddress, 190, '')}</p>
    <p class="a5-court-row">ญาติ / เพื่อนสนิท ${solid(f.relativeName, 200, '')} ที่พัก ${solid(f.relativeAddress, 200, '')}</p>
    <p class="a5-court-row">อาชีพ อดีต ${solid(f.formerJob, 400, '')}</p>
    <p class="a5-court-row">สถานที่ทำงาน ${solid(f.workplace, 400, '')}</p>
    <p class="a5-court-row">ที่อยู่ครั้งสุดท้าย ${solid(f.lastAddress, 400, '')}</p>
    <p class="a5-court-row">ภูมิลำเนาเดิม ${solid(f.originDomicile, 400, '')}</p>
    <p class="a5-court-row">แหล่งที่ไปเป็นประจำ ${solid(f.frequentPlaces, 400, '')}</p>
    <p class="a5-court-row">กลุ่มหรือแกงค์ที่มั่วสุม ${solid(f.gangGroup, 400, '')}</p>
    <p class="a5-court-row">รายชื่อบุคคลในกลุ่ม ${solid(f.gangMembers, 400, '')}</p>
    <p class="a5-court-row">ตำหนิรูปพรรณ สูง ${solid(f.heightCm, 80, '')} ซม. น้ำหนัก ${solid(f.weightKg, 80, '')} กก. หมู่โลหิต ${solid(f.bloodGroup, 80, '')}</p>
    <table class="a5-trait-table"><tbody>
      ${traitRow('รูปร่าง', 'สูง', 'สันทัด', 'เตี้ย', 'ล่ำสัน', 'อ้วน', 'ผอม', 'อื่น ๆ')}
      ${traitRow('ผิว', 'ขาว', 'ขาวเหลือง', 'ดำ', 'ดำแดง', 'ตกกระ', 'ละเอียด', 'หยาบ', 'อื่น ๆ')}
      ${traitRow('รูปหน้า', 'กลม', 'รูปไข่', 'สามเหลี่ยม', 'สี่เหลี่ยม', 'แหลมหลิม', 'อื่น ๆ')}
      ${traitRow('ผม', 'เป๋', 'แสกกลาง', 'เสย', 'เส้นผมตรง', 'เป็นคลื่น', 'หยิก', 'ผมฟู', 'หนา', 'บาง', 'ดำ', 'ขาว', 'หงอก', 'หงอกประปราย', 'แดง', 'ทอง', 'อื่น ๆ')}
    </tbody></table>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>

<div class="a5-pg-break"></div>

<div class="a5-trait-page-2">
  <div class="a5-court-pgno">- ๒ -</div>
  <div class="a5-court-content">
    <table class="a5-trait-table"><tbody>
      ${traitRow('ศีรษะ', 'ล้านเถิก', 'ล้านเลี่ยน', 'ล้านครึ่งศีรษะ', 'ล้านง่ามถ่อ', 'อื่น ๆ')}
      ${traitRow('หน้าผาก', 'กว้าง', 'แคบ', 'โหนก', 'ตรง', 'ลาด', 'สั้น', 'อื่น ๆ')}
      ${traitRow('คิ้ว', 'หนา', 'บาง', 'ต่อ', 'ห่าง', 'สั้น', 'ชู', 'ดำ', 'ขาว', 'แดง', 'หงอกประปราย', 'อื่น ๆ')}
      ${traitRow('ตา', 'โต', 'เล็ก', 'ชั้นเดียว', 'สองชั้น', 'โปน', 'ลึก', 'ปรือ', 'หยี', 'เหล่', 'เข', 'เอก', 'ถั่ว', 'อื่น ๆ')}
      ${traitRow('หู', 'กาง', 'ลีบ', 'กลม', 'สามเหลี่ยม', 'สี่เหลี่ยม', 'กะหล่ำปลี', 'ติ่งหูเหลี่ยม', 'ติ่งหูราบ', 'ติ่งหูย้อย', 'อื่น ๆ')}
      ${traitRow('จมูก', 'ดั้งจมูกราบ', 'ดั้งจมูกโด่ง', 'ดั้งจมูกลึก', 'สันจมูกตรง', 'สันจมูกโค้ง', 'สันจมูกเหลี่ยม', 'สันจมูกสั้น', 'จมูกกว้าง', 'จมูกแคบ', 'จมูกเชิด', 'จมูกงุ้ม', 'อื่น ๆ')}
      ${traitRow('ปาก', 'หนา', 'บาง', 'กว้าง', 'แคบ', 'รูปกระจับ', 'บนยื่น', 'ล่างยื่น', 'ไม่มีร่องปาก', 'อื่น ๆ')}
      ${traitRow('ฟัน', 'ใหญ่', 'เล็ก', 'เรียบ', 'เก', 'ห่าง', 'ยื่น', 'หลอ', 'ขาว', 'เหลือง', 'ดำ', 'เลี่ยม', 'อื่น ๆ')}
      ${traitRow('คาง', 'ตรง', 'สั้น', 'ยื่น', 'ป้าน', 'บุ๋ม', 'เหลี่ยม', 'อื่น ๆ')}
      ${traitRow('หนวดและเครา', 'หนา', 'บาง', 'เล็กเรียว', 'ยาว', 'สั้น', 'ปลายงอน', 'สีดำ', 'แดง', 'หงอกขาว', 'หงอกประปราย', 'อื่น ๆ')}
      ${traitRow('สำเนียง', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคตะวันออก', 'ภาคตะวันตก', 'ภาคใต้', 'จีน', 'อื่น ๆ')}
      ${traitRow('เสียง', 'ดัง', 'ค่อย', 'แหบ', 'แหลม', 'ทุ้ม', 'อื่น ๆ')}
      ${traitRow('ตำหนิ', 'ไฝ', 'ปาน', 'แผลเป็น', 'อื่น ๆ')}
    </tbody></table>
    <p class="a5-court-row">สี ขนาด ตำแหน่ง ${solid(f.scarDetails, 420, '')}</p>
    <p class="a5-court-row">ลายสัก ${solid(f.tattoo, 440, '')}</p>
    <p class="a5-court-row">รูป สี ตำแหน่ง ${solid(f.tattooDetails, 420, '')}</p>
    <p class="a5-court-row">ลักษณะพิการ ${solid(f.disability, 440, '')}</p>
    <p class="a5-court-row">ลักษณะอันน่าสังเกต ${solid(f.notableFeatures, 420, '')}</p>
    <div class="a5-court-sign-block-center">
      <p class="a5-court-sign-line">(ลงชื่อ) ${solid(f.officerName, 220, '...................................................')} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
      <p>ตำแหน่ง ${solid(f.officerPosition, 200, '...................................................')}</p>
    </div>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. ....</p></div>
</div>
</article>`;
  }

  // ---------- Form 17: แบบหนังสือส่งหมายจับ/แจ้งผลการดำเนินการ (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm17PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form17-paper a5-paper-page">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ปป ${dot(f.letterNo, 70, '..........')}/${dot(f.letterYear, 50, '........')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>วันที่ ${dot(f.day, 35, '..........')} เดือน ${dot(f.month, 100, '.............................')} พ.ศ. ${dot(f.year, 50, '................')}</p></div>
<div class="a5-letter-meta">
  <p class="a5-letter-subject"><strong>เรื่อง</strong> แจ้งผลการดำเนินการเพื่อให้ได้ตัวผู้ถูกกล่าวหา</p>
  <p class="a5-letter-to"><strong>เรียน</strong> อัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 240, '....................')}</p>
  <p class="a5-letter-refline"><strong>อ้างถึง</strong> หนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} ที่ ${dot(f.prosecutorLetterNo, 80, '..........')} ลงวันที่ ${dot(f.prosecutorLetterDate, 100, '..........')}</p>
  <div class="a5-letter-attach">
    <p><strong>สิ่งที่ส่งมาด้วย</strong> ๑. สำเนาหมายจับศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 180, '............')} ที่ ${dot(f.warrantNo, 80, '..........')} ลงวันที่ ${dot(f.warrantDate, 100, '..........')} จำนวน ${dot(f.warrantPages, 40, '๑')} แผ่น</p>
    <p class="a5-attach-indent">๒. สำเนาตำหนิรูปพรรณผู้ถูกกล่าวหา จำนวน ${dot(f.traitPages, 40, '๒')} แผ่น</p>
    <p class="a5-attach-indent">๓. สำเนารายการข้อมูลทะเบียนราษฎรของผู้ถูกกล่าวหา จำนวน ${dot(f.censusPages, 40, '๑')} แผ่น</p>
  </div>
</div>
<div class="a5-letter-content">
  <p class="a5-p-indent">ตามหนังสือที่อ้างถึง สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 140, '............')} แจ้งว่า ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} มิได้ไปพบพนักงานอัยการตามกำหนดนัด โดยไม่ได้แจ้งเหตุผลให้ทราบ จึงไม่อาจยื่นฟ้องได้ และเห็นว่าผู้ถูกกล่าวหามีพฤติการณ์หลบหนี จึงขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ดำเนินการขอออกหมายจับผู้ถูกกล่าวหาดังกล่าวต่อศาลอาญาทุจริตและประพฤติมิชอบ ${dot(f.courtName, 160, '............')} ความละเอียดแจ้งแล้ว นั้น</p>
  <p class="a5-p-indent">สำนักงาน ป.ป.ท. ขอเรียนว่า ศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 160, '............')} ได้ออกหมายจับ ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} ตามหมายจับที่ ${dot(f.warrantNo, 120, '..........')} ลงวันที่ ${dot(f.warrantDate, 120, '..........')} เป็นที่เรียบร้อยแล้ว รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย และจะได้เร่งรัดติดตามจับและควบคุมตัวผู้ถูกกล่าวหา เพื่อนำตัวส่งไปยังพนักงานอัยการเพื่อดำเนินคดีต่อไป ทั้งนี้หากผู้ถูกกล่าวหาไปพบพนักงานอัยการภายหลังศาลออกหมายจับขอโปรดแจ้งให้ทราบด้วย เพื่อจักได้ดำเนินการในส่วนที่เกี่ยวข้อง</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อโปรดทราบ</p>
</div>
<div class="a5-letter-sign-block">
  <p class="a5-sign-respect">ขอแสดงความนับถือ</p>
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '..............................................')})</p>
    <p class="a5-sign-title">เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br><span class="a5-sign-sub">หรือผู้ที่ได้รับมอบหมาย</span></p>
  </div>
</div>
<div class="a5-letter-footer">
  <div class="a5-footer-contact">
    <p>กอง/สำนัก ${dot(f.unitName, 180, '................')}</p>
    <p>โทร. ${dot(f.phone, 200, '........................................')}</p>
    <p>โทรสาร ${dot(f.fax, 200, '................................')}</p>
    <p>(${dot(f.officerName, 220, 'นาย/นาง/นางสาว..................................ผู้รับผิดชอบ')})</p>
    <p class="a5-hint-sub">(ระบุชื่อผู้รับผิดชอบและหมายเลขโทรศัพท์ที่สามารถติดต่อได้สะดวก)</p>
  </div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '....')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 18: หนังสือแจ้งผู้บัญชาการตำรวจแห่งชาติให้ดำเนินการจับกุม (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm18PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form18-paper a5-paper-page">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ปป ${dot(f.letterNo, 70, '..........')}/${dot(f.letterYear, 50, '........')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>วันที่ ${dot(f.day, 35, '..........')} เดือน ${dot(f.month, 100, '.............................')} พ.ศ. ${dot(f.year, 50, '................')}</p></div>
<div class="a5-letter-meta">
  <p class="a5-letter-subject"><strong>เรื่อง</strong> ขอให้ดำเนินการจับกุมผู้ถูกกล่าวหาตามหมายจับ</p>
  <p class="a5-letter-to"><strong>เรียน</strong> ผู้บัญชาการตำรวจแห่งชาติ</p>
  <p class="a5-letter-attach"><strong>สิ่งที่ส่งมาด้วย</strong> สำเนาหมายจับและตำหนิรูปพรรณผู้กระทำผิด จำนวน ${dot(f.attachmentPages, 60, '....................')} แผ่น</p>
</div>
<div class="a5-letter-content">
  <p class="a5-p-indent">ด้วยศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 180, '...........')} ได้ออกหมายจับ ${dot(f.accusedName, 220, '(ชื่อ-สกุล ผู้ถูกกล่าวหา)')} บัตรประจำตัวประชาชนเลขที่ ${dot(f.accusedIdNo, 180, '.......................................')} ตามหมายจับที่ ${dot(f.warrantNo, 100, '.................')} ลงวันที่ ${dot(f.warrantDate, 120, '..................................')} ซึ่งต้องหาว่ากระทำความผิดฐาน ${dot(f.offenceBase, 260, '..............................')} โดยในการดำเนินการจับกุมนั้น คณะกรรมการ ป.ป.ท. ได้มีมติมอบหมายให้เจ้าพนักงานตำรวจดำเนินการจับกุมผู้ถูกกล่าวหาตามหมายจับดังกล่าว เพื่อดำเนินการให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการสืบจับตามหน้าที่และอำนาจต่อไป ผลเป็นประการใดโปรดแจ้ง ให้ทราบด้วย จักขอบคุณมาก</p>
</div>
<div class="a5-letter-sign-block">
  <p class="a5-sign-respect">ขอแสดงความนับถือ</p>
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '..................................')})</p>
    <p class="a5-sign-title">เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br><span class="a5-sign-sub">ผู้ที่ได้รับมอบหมาย</span></p>
  </div>
</div>
<div class="a5-letter-footer">
  <div class="a5-footer-contact">
    <p>กอง/สำนัก ${dot(f.unitName, 180, '................')}</p>
    <p>โทร. ${dot(f.phone, 200, '........................................')}</p>
    <p>โทรสาร ${dot(f.fax, 200, '................................')}</p>
    <p>(${dot(f.officerName, 220, 'นาย/นาง/นางสาว..................................ผู้รับผิดชอบ')})</p>
  </div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '...')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 19: แบบบันทึกข้อความส่งหมายจับให้ กอท. (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm19PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-letter-paper a5-form19-paper a5-paper-page">
<header class="a5-memo-header">
  <div class="a5-memo-title-row">
    <img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54">
    <h1 class="a5-memo-title-text">บันทึกข้อความ</h1>
  </div>
  <div class="a5-memo-meta-grid">
    <p><strong>ส่วนราชการ</strong> ${dot(f.unitName, 260, '.....................................')} <strong>โทร.</strong> ${dot(f.phone, 120, '....................')}</p>
    <p><strong>ที่</strong> ปป ๐๐${dot(f.letterNo, 80, '... / ......')} <strong>วันที่</strong> ${dot(f.dateText, 200, '...........................................................................................')}</p>
    <p><strong>เรื่อง</strong> ขอส่งสำเนาหมายจับผู้ถูกกล่าวหา ${dot(f.accusedName, 400, '.........................................................................................................')}</p>
    <p><strong>เรียน</strong> ผอ. กอท.</p>
  </div>
</header>
<div class="a5-letter-content">
  <p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท ได้ชี้มูลความผิดคดีเรื่องที่ ${dot(f.caseNo1, 140, '......................................')} และเรื่องที่ ${dot(f.caseNo2, 140, '...............................')} กรณีกล่าวหา ${dot(f.accusedName, 220, '..................................................')} ว่ากระทำทุจริตในภาครัฐ และสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${dot(f.prosecutorOffice, 100, '.......')} มีความเห็นสั่งฟ้องคดีต่อศาล แต่เนื่องจากผู้ถูกกล่าวหาไม่ไปพบพนักงานอัยการตามกำหนดนัด และแจ้งให้สำนักงาน ป.ป.ท. เป็นผู้ดำเนินการร้องขอต่อศาลให้ออกหมายจับ</p>
  <p class="a5-p-indent">บัดนี้ ผู้รับผิดชอบ ได้ยื่นคำร้องขอหมายจับผู้ถูกกล่าวหาดังกล่าว และศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 100, '......')} ได้อนุมัติหมายจับที่ ${dot(f.warrantNo, 80, '...../.....')} ลงวันที่ ${dot(f.warrantDate, 140, '.................................')} จึงขอส่งสำเนาหมายจับและสำเนาเอกสารหลักฐานที่เกี่ยวข้อง พร้อมรับรองสำเนาถูกต้อง ดังนี้</p>
  <div class="a5-memo-attach-list">
    <p>๑. สำเนาหมายจับศาลอาญาคดีทุจริตและประพฤติมิชอบ ${dot(f.courtName, 100, '.....')} ที่ ${dot(f.warrantNo, 80, '...../......')} ลงวันที่ ${dot(f.warrantDate, 120, '.................')}</p>
    <p>๒. สำเนาตำหนิรูปพรรณผู้ถูกกล่าวหา</p>
    <p>๓. สำเนารายการข้อมูลทะเบียนราษฎรของผู้ถูกกล่าวหา</p>
    <p>๔. สำเนาหนังสือแจ้งสำนักงานตำรวจแห่งชาติ</p>
  </div>
  <p class="a5-p-indent">มายังท่าน เพื่อดำเนินการในส่วนที่เกี่ยวข้องต่อไป รายละเอียดปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
  <p class="a5-p-indent">จึงเรียนมาเพื่อพิจารณา</p>
</div>
<div class="a5-letter-sign-block">
  <div class="a5-sign-slot">
    <p class="a5-sign-name">(${dot(f.signerName, 220, '...................................')})</p>
    <p class="a5-sign-title">ผอ. ${dot(f.directorUnit, 160, '......')}</p>
  </div>
</div>
<div class="a5-letter-footer">
  <div></div>
  <div class="a5-footer-code"><p>ปปท. ${dot(f.formCode, 50, '....')}</p></div>
</div>
</article>`;
  }

  // ---------- Form 20: แบบผนึกซองขอหมายจับ (Verbatim ๑ หน้าเต็ม) ----------
  function renderForm20PaperA5(fields = {}) {
    const f = object(fields);
    return `<article class="a5-report-paper a5-court-paper a5-form20-paper a5-paper-page">
<div class="a5-envelope-box">
  <div class="a5-envelope-meta">
    <p class="a5-env-subject"><strong>เรื่อง</strong> ขอหมายจับ</p>
    <p class="a5-env-to"><strong>เรียน</strong> อธิบดีผู้พิพากษาศาลอาญาคดีทุจริตและประพฤติมิชอบ ${solid(f.courtName, 160, '......')}</p>
  </div>
  <div class="a5-envelope-org">
    <p>สำนัก/กอง ${solid(f.unitName, 180, '......')}</p>
    <p>สำนักงาน ป.ป.ท.</p>
  </div>
  <div class="a5-envelope-case">
    <p>คดีอาญา เลขดำ ป.ป.ท. ที่ ${solid(f.blackNo, 220, '............................................')} / ${solid(f.blackYear, 60, '..........')}</p>
  </div>
  <div class="a5-envelope-charge">
    <p>ข้อหา “ฐาน ${solid(f.allegationCharge, 480, '.........................................................................................................................................................................................................................')}</p>
    <p>.............................................................................................................................................................................................................................................</p>
    <p>...........................................................................”</p>
  </div>
  <div class="a5-envelope-warrant-count">
    <p>จำนวน ๑ หมาย</p>
    <p>อายุความ ${solid(f.limitationYears, 40, '......')} ปี (วันขาดอายุความ วันที่ ${solid(f.limitationDate, 200, '................................................')})</p>
  </div>
  <div class="a5-envelope-petitioner">
    <p>${solid(f.petitionerName, 260, 'นาย/นาง/นางสาว.........................................................................')} ผู้ร้อง</p>
    <p>โทร. ${solid(f.phone, 200, '...................................................')}</p>
  </div>
  <div class="a5-court-pgfoot"><p>ปปท. .....</p></div>
</div>
</article>`;
  }

  const api = Object.freeze({
    MANIFEST,
    ACTIONS,
    executePostDocumentAction,
    getPostDocumentActionModel,
    renderPostDocumentEditorA5,
    renderPostDocumentPaperA5,
    renderPostDocumentPaperByFormId,
    renderForm8PaperA5,
    renderForm9PaperA5,
    renderForm10PaperA5,
    renderForm11PaperA5,
    renderForm12PaperA5,
    renderForm13PaperA5,
    renderForm14PaperA5,
    renderForm15PaperA5,
    renderForm16PaperA5,
    renderForm17PaperA5,
    renderForm18PaperA5,
    renderForm19PaperA5,
    renderForm20PaperA5
  });

  root.ECMISActivity5PostResolution = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
