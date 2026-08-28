/*
 * E-CMIS กิจกรรมที่ 5 — แบบฟอร์มซีรีส์ 6 ชุดที่ 1 + ซีรีส์ 7 (Batch 4)
 * 6-01 ปกสำนวน · 6-02 บันทึกการปฏิบัติงานการไต่สวน · 6-03/04 เชิญให้ถ้อยคำ
 * 6-05 ติดตามพยานไม่ได้ · 6-06/07/08/09 ขอทราบ/ส่งเอกสาร/เจ้าหน้าที่ ม.18(1)
 * 6-38 ขอเพิ่มผู้ถูกกล่าวหา · 6-39 ขอกันตัวบุคคลเป็นพยาน
 * 6-42 แจ้งข้อกล่าวหาเพิ่มเติม · 6-43 ผลรับทราบ · 6-44 ปิดบันทึกแจ้งข้อกล่าวหา
 * 6-45 ให้ถ้อยคำชี้แจงผู้ถูกกล่าวหา · 6-47 บัญชีสำนวนการไต่สวน · 7-01 ส่งรายงานวินิจฉัยชี้มูล
 *
 * เนื้อหากระดาษ = verbatim จากแบบฟอร์มต้นฉบับ (.doc) — boilerplate static, field เฉพาะจุดเส้นประ
 */
(function initializeActivity5InquiryDocuments(root) {
  const DOC_IDS = Object.freeze({
    CASE_COVER: "S6_01_CASE_COVER",
    WORK_LOG: "S6_02_WORK_LOG",
    INVITE_ACCUSED: "S6_03_INVITE_ACCUSED",
    INVITE_WITNESS: "S6_04_INVITE_WITNESS",
    WITNESS_TRACK_FAIL: "S6_05_WITNESS_TRACK_FAIL",
    WITNESS_WRITTEN: "S6_06_WITNESS_WRITTEN_STATEMENT",
    AGENCY_DOCS: "S6_07_AGENCY_DOCS_OFFICER",
    AGENCY_CLARIFY: "S6_08_AGENCY_CLARIFICATION",
    AGENCY_OFFICER: "S6_09_AGENCY_SEND_OFFICER",
    ADD_ACCUSED: "S6_38_ADD_ACCUSED_REQUEST",
    PROTECT_WITNESS: "S6_39_PROTECT_WITNESS_REQUEST",
    ADDL_ALLEGATION: "S6_42_ADDITIONAL_ALLEGATION",
    ACK_RESULT: "S6_43_ACK_RESULT",
    CLOSE_NOTICE: "S6_44_CLOSE_NOTICE_RECORD",
    ACCUSED_HEARING: "S6_45_ACCUSED_HEARING",
    DOSSIER_LIST: "S6_47_DOSSIER_LIST",
    SEND_DIAGNOSIS: "S7_01_SEND_DIAGNOSIS",
    STATEMENT_GENERAL: "S6_10_STATEMENT_GENERAL",
    STATEMENT_CHILD: "S6_11_STATEMENT_CHILD",
    STATEMENT_DEAF: "S6_12_STATEMENT_DEAF",
    STATEMENT_DEAF_WRITE: "S6_13_STATEMENT_DEAF_WRITE",
    STATEMENT_FOREIGN: "S6_14_STATEMENT_FOREIGN",
    CHILD_EXAMINER: "S6_15_CHILD_EXAMINER_NOTICE",
    LAWYER_NOTICE: "S6_16_LAWYER_NOTICE",
    EARLY_EVIDENCE: "S6_17_EARLY_EVIDENCE_REQUEST",
    SUSPEND_DUTY: "S6_18_SUSPEND_DUTY_NOTICE",
    DATA_ACCESS_REQUEST: "S6_32_DATA_ACCESS_REQUEST",
    DATA_ACCESS_ORDER: "S6_33_DATA_ACCESS_ORDER",
    DATA_ACCESS_LETTER: "S6_34_DATA_ACCESS_LETTER",
    DATA_ACCESS_REPORT: "S6_35_DATA_ACCESS_REPORT",
    DATA_UTILIZATION: "S6_36_DATA_UTILIZATION",
    EVIDENCE_LEDGER: "S6_19_EVIDENCE_LEDGER",
    EVIDENCE_RETURNED: "S6_20_EVIDENCE_RETURNED",
    EVIDENCE_BURNED: "S6_21_EVIDENCE_BURNED",
    MAP_SKETCH: "S6_22_MAP_SKETCH",
    MAP_WARRANT: "S6_23_MAP_WARRANT",
    PHOTO_APPENDIX: "S6_24_PHOTO_APPENDIX",
    LINEUP_CONSENT: "S6_25_LINEUP_CONSENT",
    PHOTO_LINEUP: "S6_27_PHOTO_LINEUP",
    SCENE_GUIDE: "S6_28_SCENE_GUIDE_RECORD",
    SCENE_PHOTOS: "S6_29_SCENE_PHOTOS",
    FORENSIC_COOP: "S6_30_FORENSIC_COOPERATION",
    FORENSIC_EXPERT: "S6_31_FORENSIC_EXPERT_REQUEST"
  });

  const MANIFEST = Object.freeze([
    { formId: DOC_IDS.CASE_COVER, code: "6-01", title: "แบบปกสำนวน", shortLabel: "ปกสำนวน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.WORK_LOG, code: "6-02", title: "แบบบันทึกการปฏิบัติงานการไต่สวน", shortLabel: "บันทึกปฏิบัติงาน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.INVITE_ACCUSED, code: "6-03", title: "แบบหนังสือเชิญผู้กล่าวหามาให้ถ้อยคำ", shortLabel: "เชิญผู้กล่าวหา", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.INVITE_WITNESS, code: "6-04", title: "แบบหนังสือเชิญพยานมาให้ถ้อยคำ", shortLabel: "เชิญพยาน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.WITNESS_TRACK_FAIL, code: "6-05", title: "แบบบันทึกกรณีติดตามตัวพยานไม่ได้", shortLabel: "ติดตามพยานไม่ได้", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.WITNESS_WRITTEN, code: "6-06", title: "แบบหนังสือให้พยานส่งคำชี้แจงเป็นหนังสือหรือส่งเอกสารหลักฐาน", shortLabel: "ให้พยานส่งคำชี้แจง", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.AGENCY_DOCS, code: "6-07", title: "แบบหนังสือให้หน่วยงานส่งเอกสารตาม 18(1)", shortLabel: "ขอเอกสาร+เจ้าหน้าที่", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.AGENCY_CLARIFY, code: "6-08", title: "แบบหนังสือให้หน่วยงานส่งคำชี้แจงเป็นหนังสือตาม 18(1)", shortLabel: "ขอคำชี้แจงหน่วยงาน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.AGENCY_OFFICER, code: "6-09", title: "แบบหนังสือให้หน่วยงานส่งเจ้าหน้าที่มาให้ถ้อยคำตาม 18(1)", shortLabel: "ขอเจ้าหน้าที่ให้ถ้อยคำ", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.ADD_ACCUSED, code: "6-38", title: "แบบบันทึกขอเพิ่มผู้ถูกกล่าวหา", shortLabel: "ขอเพิ่มผู้ถูกกล่าวหา", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.PROTECT_WITNESS, code: "6-39", title: "แบบบันทึกขอกันตัวบุคคลเป็นพยาน", shortLabel: "ขอกันตัวเป็นพยาน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.ADDL_ALLEGATION, code: "6-42", title: "แบบบันทึกการแจ้งข้อกล่าวหาเพิ่มเติม", shortLabel: "แจ้งข้อกล่าวหาเพิ่มเติม", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.ACK_RESULT, code: "6-43", title: "แบบบันทึกผลการรับทราบข้อกล่าวหา", shortLabel: "ผลรับทราบข้อกล่าวหา", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.CLOSE_NOTICE, code: "6-44", title: "แบบบันทึกการปิดหมายบันทึกแจ้งข้อกล่าวหา", shortLabel: "ปิดบันทึกแจ้งข้อกล่าวหา", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.ACCUSED_HEARING, code: "6-45", title: "แบบบันทึกการให้ถ้อยคำและชี้แจงข้อกล่าวหาของผู้ถูกกล่าวหา", shortLabel: "ให้ถ้อยคำชี้แจง", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.DOSSIER_LIST, code: "6-47", title: "แบบบัญชีสำนวนการไต่สวน", shortLabel: "บัญชีสำนวนไต่สวน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.SEND_DIAGNOSIS, code: "7-01", title: "แบบบันทึกส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล เสนอคณะกรรมการ ป.ป.ท.", shortLabel: "ส่งวินิจฉัยชี้มูล", stage: "a5-inquiry-review", authorRole: "clerk" },
    { formId: DOC_IDS.STATEMENT_GENERAL, code: "6-10", title: "แบบบันทึกคำให้การ/ถ้อยคำของผู้กล่าวหาหรือพยาน", shortLabel: "คำให้การทั่วไป", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT_CHILD, code: "6-11", title: "แบบบันทึกคำให้การ/ถ้อยคำของผู้กล่าวหาหรือพยานที่เป็นเด็ก", shortLabel: "คำให้การเด็ก", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT_DEAF, code: "6-12", title: "แบบบันทึกคำให้การ ผู้กล่าวหา-พยาน ที่เป็นคนหูหนวกหรือเป็นใบ้", shortLabel: "คำให้การหูหนวก/ใบ้", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT_DEAF_WRITE, code: "6-13", title: "แบบบันทึกคำให้การ ผู้กล่าวหา-พยาน ที่เป็นคนหูหนวกหรือเป็นใบ้ (เขียนหนังสือโต้ตอบได้)", shortLabel: "คำให้การหูหนวก (โต้ตอบได้)", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.STATEMENT_FOREIGN, code: "6-14", title: "แบบบันทึกคำให้การ ผู้กล่าวหา-พยาน ที่เป็นชาวต่างประเทศ", shortLabel: "คำให้การต่างประเทศ", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.CHILD_EXAMINER, code: "6-15", title: "แบบหนังสือแจ้งสหวิชาชีพเข้าร่วมสอบปากคำเด็ก", shortLabel: "เชิญสหวิชาชีพเด็ก", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.LAWYER_NOTICE, code: "6-16", title: "แบบหนังสือแจ้งทนายความเข้าร่วมฟังการสอบปากคำผู้ถูกกล่าวหา", shortLabel: "เชิญทนายความ", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.EARLY_EVIDENCE, code: "6-17", title: "แบบหนังสือขอสืบพยานล่วงหน้า", shortLabel: "ขอสืบพยานล่วงหน้า", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.SUSPEND_DUTY, code: "6-18", title: "แบบหนังสือแจ้งให้ผู้บังคับบัญชาสั่งให้หยุดปฏิบัติหน้าที่เป็นการชั่วคราว", shortLabel: "แจ้งหยุดปฏิบัติหน้าที่", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.DATA_ACCESS_REQUEST, code: "6-32", title: "แบบคำขออนุมัติเข้าถึงข้อมูล", shortLabel: "คำขอเข้าถึงข้อมูล", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.DATA_ACCESS_ORDER, code: "6-33", title: "แบบคำสั่งอนุมัติเข้าถึงข้อมูล", shortLabel: "คำสั่งอนุมัติเข้าถึงข้อมูล", stage: "a5-inquiry", authorRole: "secretary" },
    { formId: DOC_IDS.DATA_ACCESS_LETTER, code: "6-34", title: "แบบหนังสือแจ้งคำสั่งอนุมัติเข้าถึงข้อมูล", shortLabel: "แจ้งคำสั่งเข้าถึงข้อมูล", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.DATA_ACCESS_REPORT, code: "6-35", title: "แบบรายงานผลการดำเนินการเข้าถึงข้อมูล", shortLabel: "รายงานผลเข้าถึงข้อมูล", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.DATA_UTILIZATION, code: "6-36", title: "แบบคำขอใช้ประโยชน์ข้อมูล", shortLabel: "คำขอใช้ประโยชน์ข้อมูล", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.EVIDENCE_LEDGER, code: "6-19", title: "แบบบัญชีของกลาง", shortLabel: "บัญชีของกลาง", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.EVIDENCE_RETURNED, code: "6-20", title: "แบบบัญชีทรัพย์ถูกประทุษร้ายได้คืน", shortLabel: "บัญชีทรัพย์ได้คืน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.EVIDENCE_BURNED, code: "6-21", title: "แบบบัญชีทรัพย์ที่ถูกเพลิงไหม้", shortLabel: "บัญชีทรัพย์ถูกไหม้", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.MAP_SKETCH, code: "6-22", title: "แบบแผนที่สังเขป", shortLabel: "แผนที่สังเขป", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.MAP_WARRANT, code: "6-23", title: "แบบแผนที่สังเขป ประกอบการขอหมายค้น", shortLabel: "แผนที่ประกอบหมายค้น", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.PHOTO_APPENDIX, code: "6-24", title: "แบบภาพถ่ายประกอบสำนวน", shortLabel: "ภาพถ่ายประกอบสำนวน", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.LINEUP_CONSENT, code: "6-25", title: "แบบบันทึกการยินยอมให้ชี้ตัวผู้ถูกกล่าวหา", shortLabel: "ยินยอมชี้ตัว", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.PHOTO_LINEUP, code: "6-27", title: "แบบบันทึกการชี้ภาพถ่ายผู้ถูกกล่าวหา", shortLabel: "ชี้ภาพถ่าย", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.SCENE_GUIDE, code: "6-28", title: "แบบบันทึกนำชี้สถานที่ประกอบการให้ถ้อยคำ", shortLabel: "นำชี้สถานที่", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.SCENE_PHOTOS, code: "6-29", title: "แบบภาพถ่ายนำชี้สถานที่เกิดเหตุประกอบการให้ถ้อยคำ", shortLabel: "ภาพถ่ายนำชี้", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.FORENSIC_COOP, code: "6-30", title: "แบบหนังสือขอความร่วมมือในการตรวจพิสูจน์", shortLabel: "ขอความร่วมมือตรวจพิสูจน์", stage: "a5-inquiry", authorRole: "investigator" },
    { formId: DOC_IDS.FORENSIC_EXPERT, code: "6-31", title: "แบบหนังสือขอความอนุเคราะห์ผู้เชี่ยวชาญตรวจพิสูจน์", shortLabel: "ขอผู้เชี่ยวชาญตรวจพิสูจน์", stage: "a5-inquiry", authorRole: "investigator" }
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
    s.inquiryDocuments = object(s.inquiryDocuments);
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

  // shared committee sign block (6-03…09): ประธานอนุกรรมการฯ / หัวหน้าพนักงานฯ
  const committeeSignBlock = f => `<p style="text-align:left;margin-top:1.2em">(${dot(f.signerName, 160, '.....................................................')})<br>ประธานอนุกรรมการไต่สวน<br>หรืออนุกรรมการที่ได้รับมอบหมาย/หัวหน้าพนักงาน ป.ป.ท.</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)<br>โทร. ${dot(f.ownerPhone, 60)}<br>โทรสาร ${dot(f.ownerFax, 60)}</p>`;
  const warn62 = `<p class="a5-letter-warning"><strong>คำเตือน</strong>&nbsp;&nbsp;พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา ๖๒ “ผู้ใดไม่มาให้ถ้อยคำหรือไม่ส่งเอกสารหรือหลักฐานหรือไม่ดำเนินการใด ๆ ตามมาตรา ๑๘ (๑) และ (๒) โดยไม่มีเหตุอันสมควร ต้องระวางโทษจำคุกไม่เกินหกเดือน หรือปรับไม่เกินหนึ่งหมื่นบาทหรือทั้งจำทั้งปรับ”</p>`;
  // shared บันทึกข้อความ head for memo forms (6-38/39/7-01)
  const memoHead = f => `<p><strong>บันทึกข้อความ</strong></p>
<p>ส่วนราชการ&nbsp;&nbsp;${dot(f.ownerDivision, 100, 'สำนัก/กอง .....')} &nbsp;&nbsp;โทร. ${dot(f.ownerPhone, 60)}</p>
<p>ที่ ${dot(f.letterNo, 90, 'ปป 00.../...')} &nbsp;&nbsp;&nbsp;วันที่ ${dot(f.issuedAt, 80)}</p>`;
  // shared opinion chain 4-7 (6-38/39)
  const opinionChain = f => `<p style="margin-top:.8em"><strong>4. ความเห็นผู้บังคับบัญชาชั้นต้น (หัวหน้าพนักงาน ป.ป.ท.)</strong></p>
<p>${show(f.opinionSupervisor) || ".".repeat(120)}</p><p>(${dot(f.opinionSupervisorName, 120)})<br>ตำแหน่ง<br>หัวหน้าพนักงาน ป.ป.ท.</p>
<p><strong>5. ความเห็นผู้อำนวยการ (หัวหน้าพนักงาน ป.ป.ท.)</strong></p>
<p>${show(f.opinionDirector) || ".".repeat(120)}</p><p>(${dot(f.opinionDirectorName, 120)})<br>ผู้อำนวยการ (สำนัก/กอง)</p>
<p><strong>6. ความเห็นรองเลขาธิการ/ผู้ช่วยเลขาธิการ</strong></p>
<p>${show(f.opinionDeputy) || ".".repeat(120)}</p><p>(${dot(f.opinionDeputyName, 120)})</p>
<p><strong>7. ความเห็นเลขาธิการ</strong></p>
<p>${show(f.opinionSecretary) || ".".repeat(120)}</p><p>(${dot(f.opinionSecretaryName, 120)})</p>`;

  function defaultPayload(formId, state = {}) {
    if (formId === DOC_IDS.CASE_COVER) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), caseType: "ทุจริตต่อหน้าที่", otherType: "", incidentPlace: "", incidentTime: "", limitationNote: "", evidenceTotalPages: "", complaintPages: "", supportingPages: "", otherDocs: "", receivedDate: "", committeeKind: "" };
    }
    if (formId === DOC_IDS.WORK_LOG) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), recorder: "", entries: [] };
    }
    if ([DOC_IDS.INVITE_ACCUSED, DOC_IDS.INVITE_WITNESS].includes(formId)) {
      const isWitness = formId === DOC_IDS.INVITE_WITNESS;
      const base = { ...letterCommon(state), addresseeName: "" };
      if (isWitness) return { ...base, caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", appointmentDate: "", appointmentTime: "", appointmentPlace: "" };
      return { ...base, respondentNames: "", allegationDetail: "" };
    }
    if (formId === DOC_IDS.WITNESS_TRACK_FAIL) {
      return { ...letterCommon(state), caseRefNo2: text(state.caseData?.trackingCode), place: "", witnessName: "", inviteCount: "", lastLetterNo: "", lastLetterDate: "" };
    }
    if ([DOC_IDS.WITNESS_WRITTEN, DOC_IDS.AGENCY_CLARIFY].includes(formId)) {
      return { ...letterCommon(state), addresseeName: "", caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", item1: "", item2: "" };
    }
    if ([DOC_IDS.AGENCY_DOCS, DOC_IDS.AGENCY_OFFICER].includes(formId)) {
      return { ...letterCommon(state), addresseeName: "", caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", item1: "", item2: "", officerAppointmentNote: "", appointmentDate: "", appointmentTime: "", appointmentPlace: "" };
    }
    if ([DOC_IDS.ADD_ACCUSED, DOC_IDS.PROTECT_WITNESS].includes(formId)) {
      const isAdd = formId === DOC_IDS.ADD_ACCUSED;
      return {
        ...letterCommon(state),
        caseKind: "คดีประพฤติมิชอบ",
        originalOrderNo: "", originalOrderCaseNo: "", boardMeetingNo: "", boardMeetingDate: "",
        receivedDate: "", twoYearDeadline: "", extensionRound: "",
        limitationLawSection: "", limitationYears: "", limitationExpireDate: "",
        inquiryStageProgress: "", factsFound: "",
        proposedPersons: [{ name: "", note: "" }, { name: "", note: "" }],
        ...(isAdd ? { proposalText: "มีมติเห็นควรเพิ่มชื่อบุคคลเป็นผู้ถูกกล่าวหาเพิ่มเติม" } : { lawRefs: "พ.ร.บ.มาตรการฯ พ.ศ.๒๕๕๑ มาตรา 58", proposalText: "มีมติเห็นควรกันบุคคลไว้เป็นพยาน โดยไม่ดำเนินคดี" }),
        opinionSupervisor: "", opinionSupervisorName: "", opinionDirector: "", opinionDirectorName: "",
        opinionDeputy: "", opinionDeputyName: "", opinionSecretary: "", opinionSecretaryName: ""
      };
    }
    if (formId === DOC_IDS.ADDL_ALLEGATION) {
      return { ...letterCommon(state), orderNo: "", orderDate: "", committeeKind: "คณะพนักงานไต่สวน", accusedName: "", additionalConduct: "", additionalCharge: "" };
    }
    if (formId === DOC_IDS.ACK_RESULT) {
      return { ...letterCommon(state), committeeKind: "คณะพนักงานไต่สวน", accusedName: "", noticeLetterNo: "", sentDate: "", receivedDate: "", signer1Name: "", signer2Name: "", signer3Name: "" };
    }
    if (formId === DOC_IDS.CLOSE_NOTICE) {
      return { ...letterCommon(state), place: "", closeDate: "", closeTime: "", panelMembers: "", noticeRecordDetails: "" };
    }
    if (formId === DOC_IDS.ACCUSED_HEARING) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), office: "", bookNo: "", road: "", subdistrict: "", district: "", province: "", recordedAt: "", respondentName: text(state.caseData?.respondent || state.caseData?.agency), recorderName: "", qa: [] };
    }
    if (formId === DOC_IDS.DOSSIER_LIST) {
      return { ...letterCommon(state), officeName: "", items: [] };
    }
    if ([DOC_IDS.STATEMENT_GENERAL, DOC_IDS.STATEMENT_CHILD, DOC_IDS.STATEMENT_DEAF, DOC_IDS.STATEMENT_DEAF_WRITE, DOC_IDS.STATEMENT_FOREIGN].includes(formId)) {
      const variant = {
        [DOC_IDS.STATEMENT_CHILD]: { titleSuffix: "ที่เป็นเด็ก", specialNote: "สถานที่ที่เหมาะสมสำหรับเด็กที่จัดไว้เป็นการเฉพาะ และให้บันทึกภาพและเสียงการถามปากคำด้วย" },
        [DOC_IDS.STATEMENT_DEAF]: { titleSuffix: "", interpreterLabel: "ล่ามภาษามือ" },
        [DOC_IDS.STATEMENT_DEAF_WRITE]: { titleSuffix: "", interpreterLabel: "" },
        [DOC_IDS.STATEMENT_FOREIGN]: { titleSuffix: "ที่เป็นชาวต่างประเทศ", interpreterName: "", interpreterAgency: "", interpreterLabel: "ล่าม" }
      }[formId] || {};
      return { interpreterLabel: variant.interpreterLabel || "", ...letterCommon(state), titleSuffix: variant.titleSuffix || "", specialNote: variant.specialNote || "", caseTitle: text(state.caseData?.subject), office: "", bookNo: "", road: "", subdistrict: "", district: "", province: "", recordedAt: "", place: "", respondentName: text(state.caseData?.respondent || state.caseData?.agency), recorderName: "", ...(variant.interpreterName !== undefined ? { interpreterName: variant.interpreterName, interpreterAgency: variant.interpreterAgency } : {}), deponent: { name: "", role: "ผู้กล่าวหา", age: "", race: "", nationality: "", religion: "", occupation: "", idCard: "", fatherName: "", motherName: "", registryAddress: {}, currentAddress: {}, phone: "" }, qa: [], documentsSubmitted: [] };
    }
    if (formId === DOC_IDS.CHILD_EXAMINER) {
      return { ...letterCommon(state), letterPrefix: "ปท", addresseeTitle: "", caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", childAge: "", childRole: "ผู้กล่าวหา", appointmentDate: "", appointmentTime: "", appointmentPlace: "", signerName: "" };
    }
    if (formId === DOC_IDS.LAWYER_NOTICE) {
      return { ...letterCommon(state), letterPrefix: "ปท", addresseeTitle: "", caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", accusedCount: "", signerName: "" };
    }
    if (formId === DOC_IDS.EARLY_EVIDENCE) {
      return { ...letterCommon(state), letterPrefix: "ปท", addresseeTitle: "", caseSubject: text(state.caseData?.subject), incidentWhen: "", incidentWhere: "", witnessName: "", witnessReason: "", evidenceSentNote: "", signerName: "" };
    }
    if (formId === DOC_IDS.SUSPEND_DUTY) {
      return { ...letterCommon(state), committeeKind: "คณะอนุกรรมการไต่สวน", respondentSummary: "", boardMeetingNo: "", boardMeetingDate: "", boardResolution: "", signerName: "" };
    }
    if ([DOC_IDS.DATA_ACCESS_REQUEST, DOC_IDS.DATA_UTILIZATION].includes(formId)) {
      const isUtil = formId === DOC_IDS.DATA_UTILIZATION;
      const base = {
        issuedAt: "",
        requesterLabel: "(กรรมการ เลขาธิการ หรืออนุกรรมการ หรือพนักงาน ป.ป.ท.)",
        agencyHoldingName: "", agencyAddressRoad: "", agencyAddressSubdistrict: "", agencyAddressDistrict: "", agencyAddressProvince: "",
        dataSubjectName: "", dataSubjectPosition: "", dataSubjectAffiliation: "", dataSubjectKind: "ผู้ถูกกล่าวหา",
        factsDetail: ""
      };
      if (!isUtil) return { ...base, necessityReason: "", accessPeriod: "", toolsAndMethods: "", communicationPlaceMethod: "" };
      return { ...base, purposeReason: "", dataType: "", usagePeriod: "", returnDataDetails: "" };
    }
    if (formId === DOC_IDS.DATA_ACCESS_ORDER) {
      return { orderNo: "", orderYear: "", agencyHoldingName: "", agencyAddressRoad: "", agencyAddressSubdistrict: "", agencyAddressDistrict: "", agencyAddressProvince: "", dataSubjectName: "", dataSubjectPosition: "", dataSubjectAffiliation: "", dataSubjectKind: "ผู้ถูกกล่าวหา", accessDetails: "", periodFrom: "", periodTo: "", signedDate: "", signerName: "" };
    }
    if (formId === DOC_IDS.DATA_ACCESS_LETTER) {
      return { ...letterCommon(state), addresseeTitle: "", attachedOrderNo: "", attachedOrderDate: "", signerName: "" };
    }
    if (formId === DOC_IDS.DATA_ACCESS_REPORT) {
      return { reportDate: "", orderNo: "", orderNo2: "", orderDate: "", approvedPersonName: "", approvedPosition: "", approvedAffiliation: "", reportSummary: "", signerName: "", signerPosition: "" };
    }
    if ([DOC_IDS.EVIDENCE_LEDGER, DOC_IDS.EVIDENCE_RETURNED, DOC_IDS.EVIDENCE_BURNED].includes(formId)) {
      const base = { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), ledgerNo: "", items: [] };
      if (formId === DOC_IDS.EVIDENCE_LEDGER) return base;
      if (formId === DOC_IDS.EVIDENCE_RETURNED) return base;
      return { ...base, chargeNote: "" };
    }
    if ([DOC_IDS.MAP_SKETCH, DOC_IDS.MAP_WARRANT].includes(formId)) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), incidentWhenWhere: "", mapCreatedDate: "", mapImageNote: "", mapDescription: "", isWarrant: formId === DOC_IDS.MAP_WARRANT, signerComplainant: "", signerRespondent: "", signerWitness: "", signerInvestigator: "" };
    }
    if (formId === DOC_IDS.PHOTO_APPENDIX) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), incidentWhenWhere: "", photoTakenWhen: "", photos: [], recorderName: "" };
    }
    if ([DOC_IDS.LINEUP_CONSENT, DOC_IDS.PHOTO_LINEUP].includes(formId)) {
      return { ...letterCommon(state), committeeKind: "คณะพนักงานไต่สวน", orderAuthority: "คณะกรรมการ ป.ป.ท.", recordDate: "", recordTime: "", orderNo: "", accusedName: "", lineupDetail: "", signerChair: "", signerMember: "", signerSecretary: "" };
    }
    if (formId === DOC_IDS.SCENE_GUIDE) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), incidentWhenWhere: "", guideWhen: "", panelMembers: "", guidedPersonName: "", guidedPersonPosition: "", guideLocationDetail: "", guideResults: "", signerChair: "", signerMember: "", signerSecretary: "" };
    }
    if (formId === DOC_IDS.SCENE_PHOTOS) {
      return { ...letterCommon(state), caseTitle: text(state.caseData?.subject), ownerDivision: text(object(object(state.inquiry).intake).unit), complainant: text(state.caseData?.complainant), respondent: text(state.caseData?.agency), incidentWhenWhere: "", photoWhen: "", photos: [] };
    }
    if (formId === DOC_IDS.FORENSIC_COOP) {
      return { ...letterCommon(state), addresseeName: "", attachments: ["", "", ""], orderNo: "", orderDate: "", forensicTarget: "", items: ["", "", ""], coordinatorName: "", coordinatorPhone: "", signerName: "" };
    }
    if (formId === DOC_IDS.FORENSIC_EXPERT) {
      return { ...letterCommon(state), addresseeName: "", orderNo: "", orderDate: "", inspectionTarget: "", expertiseField: "", signerName: "" };
    }
    if (formId === DOC_IDS.SEND_DIAGNOSIS) {
      return {
        ...letterCommon(state),
        caseKind: "คดีประพฤติมิชอบ",
        originalOrderNo: "", originalOrderCaseNo: "", boardMeetingNo: "", boardMeetingDate: "",
        receivedDate: "", twoYearDeadline: "", extensionRound: "",
        priorReportDate: "", priorBoardResolution: "",
        limitationLawSection: "", limitationYears: "", limitationExpireDate: "",
        inquiryProcessSummary: "",
        allegedFactsCriminal: "", allegedFactsDisciplinary: "",
        opinionCriminal: "", opinionDisciplinary: "",
        considerations: ""
      };
    }
    return { ...letterCommon(state) };
  }

  function validateRequired(formId, p) {
    const missing = [];
    const need = (...fields) => fields.forEach(f => { if (!text(p[f])) missing.push(f); });
    need("letterNo", "issuedAt");
    if (formId === DOC_IDS.CASE_COVER) need("caseTitle");
    else if (formId === DOC_IDS.WORK_LOG) need("caseTitle", "recorder");
    else if (formId === DOC_IDS.WITNESS_TRACK_FAIL) need("witnessName", "inviteCount");
    else if (formId === DOC_IDS.ADD_ACCUSED || formId === DOC_IDS.PROTECT_WITNESS) need("boardMeetingNo", "boardMeetingDate", "factsFound");
    else if (formId === DOC_IDS.ADDL_ALLEGATION) need("accusedName", "additionalCharge");
    else if (formId === DOC_IDS.ACCUSED_HEARING) need("caseTitle", "recordedAt");
    else if (formId === DOC_IDS.SEND_DIAGNOSIS) need("boardMeetingNo", "boardMeetingDate");
    else if (formId === DOC_IDS.CHILD_EXAMINER) need("childAge", "appointmentDate");
    else if (formId === DOC_IDS.LAWYER_NOTICE) need("accusedCount");
    else if (formId === DOC_IDS.EARLY_EVIDENCE) need("witnessName", "witnessReason");
    else if (formId === DOC_IDS.SUSPEND_DUTY) need("boardMeetingNo", "boardResolution");
    else if (formId === DOC_IDS.DATA_ACCESS_ORDER) need("orderNo", "dataSubjectName");
    else if (formId === DOC_IDS.DATA_ACCESS_REPORT) need("reportSummary");
    else if (formId === DOC_IDS.ADDL_ALLEGATION) { /* already above */ }
    else if (formId === DOC_IDS.ACK_RESULT) need("accusedName");
    else if (formId === DOC_IDS.CLOSE_NOTICE) need("panelMembers");
    else if ([DOC_IDS.EVIDENCE_LEDGER, DOC_IDS.EVIDENCE_RETURNED, DOC_IDS.EVIDENCE_BURNED].includes(formId)) need("caseTitle");
    else if ([DOC_IDS.MAP_SKETCH, DOC_IDS.MAP_WARRANT].includes(formId)) need("incidentWhenWhere", "mapCreatedDate");
    else if (formId === DOC_IDS.PHOTO_APPENDIX || formId === DOC_IDS.SCENE_PHOTOS) need("photoTakenWhen" in p ? "photoTakenWhen" : "photoWhen");
    else if ([DOC_IDS.LINEUP_CONSENT, DOC_IDS.PHOTO_LINEUP].includes(formId)) need("recordDate", "orderNo", "accusedName");
    else if (formId === DOC_IDS.SCENE_GUIDE) need("guideWhen", "guidedPersonName");
    else if (formId === DOC_IDS.FORENSIC_COOP) need("orderNo", "forensicTarget");
    else if (formId === DOC_IDS.FORENSIC_EXPERT) need("inspectionTarget", "expertiseField");
    return missing;
  }

  function executeInquiryDocumentAction(sourceState, actor = {}, command = {}) {
    const formId = text(command.formId);
    const meta = getMeta(formId);
    if (!meta) return { ok: false, error: "FORM_NOT_FOUND", state: sourceState, messageTh: "ไม่พบแบบเอกสาร" };

    if (!["save","submit","addrow","delrow"].includes(String(command.action || "save"))) return { ok: false, error: "UNSUPPORTED_ACTION", state: sourceState, messageTh: "ไม่รองรับการดำเนินการนี้" };    const s = normalizeState(sourceState);
    const now = text(command.at) || new Date().toISOString();
    const current = object(s.inquiryDocuments[formId]);
    const payload = command.payload && typeof command.payload === "object" ? copy(command.payload) : object(current.fields);

    if (!text(actor.id)) return { ok: false, error: "FORBIDDEN_ACTOR", state: sourceState, messageTh: "ไม่พบผู้ดำเนินการและบทบาทที่ผ่านการยืนยัน" };
    if (text(actor.role) !== meta.authorRole) {
      return { ok: false, error: "FORBIDDEN_ACTOR", state: s, messageTh: `ผู้มีหน้าที่จัดทำเอกสารนี้คือ ${meta.authorRole} เท่านั้น` };
    }
    if (!s.inquiryDocuments[formId] && String(command.action || "save") !== "submit") {
      s.inquiryDocuments[formId] = { formId, status: "DRAFT", createdAt: now, updatedAt: now, fields: payload };
      return { ok: true, state: s, code: "INQUIRY_DOC_DRAFT_CREATED" };
    }
    if (text(command.action) === "submit") {
      if (current.status !== "DRAFT") return { ok: false, error: "INVALID_TRANSITION", state: s, messageTh: "เอกสารถูกส่งแล้ว" };
      const missing = validateRequired(formId, payload);
      if (missing.length) return { ok: false, error: "MISSING_REQUIRED_FIELD", state: s, missing, messageTh: `ข้อมูลไม่ครบ: ${missing.join(", ")}` };
      s.inquiryDocuments[formId] = { ...current, status: "SUBMITTED", submittedAt: now, submittedBy: text(actor.id), fields: payload };
      return { ok: true, state: s, code: "INQUIRY_DOC_SUBMITTED" };
    }
    if (current.status !== "DRAFT") return { ok: false, error: "SNAPSHOT_IMMUTABLE", state: s, messageTh: "เอกสารส่งแล้ว แก้ไขไม่ได้" };
    s.inquiryDocuments[formId] = { ...current, updatedAt: now, updatedBy: text(actor.id), fields: payload };
    return { ok: true, state: s, code: "INQUIRY_DOC_DRAFT_SAVED" };
  }

  // ---------- editor ----------
  const field = (label, name, value, type = "input") => `<label class="a5-field-block${type === "textarea" ? " a5-span-2" : ""}"><span>${escapeHtml(label)}</span>${type === "textarea" ? `<textarea class="a5-textarea" data-a5-inq-path="${name}" rows="2">${escapeHtml(value)}</textarea>` : `<input type="text" class="a5-input" data-a5-inq-path="${name}" value="${escapeHtml(value)}">`}</label>`;

  function renderInquiryEditorA5(state = {}, formId, options = {}) {
    const meta = getMeta(formId);
    if (!meta) return `<div class="a5-alert-error">ไม่พบแบบเอกสาร</div>`;
    const editable = options.editable !== false;
    const doc = object(normalizeState(state).inquiryDocuments[formId]);
    const f = Object.assign(defaultPayload(formId, state), object(doc.fields));
    let body = "";
    if (formId === DOC_IDS.CASE_COVER) {
      body = `<div class="a5-form-grid">
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("ผู้กล่าวหา (ปกปิดชื่อ)", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  <label class="a5-field-block"><span>กรณีร้องเรียน/กล่าวหาว่ากระทำการ</span><select class="a5-input" data-a5-inq-path="caseType"><option value="ทุจริตต่อหน้าที่"${f.caseType === "ทุจริตต่อหน้าที่" ? " selected" : ""}>ทุจริตต่อหน้าที่</option><option value="ประพฤติมิชอบ"${f.caseType === "ประพฤติมิชอบ" ? " selected" : ""}>ประพฤติมิชอบ</option><option value="อื่น ๆ"${f.caseType === "อื่น ๆ" ? " selected" : ""}>อื่น ๆ</option></select></label>
  ${field("อื่น ๆ (ระบุ)", "otherType", f.otherType)}
  ${field("สถานที่เกิดเหตุ", "incidentPlace", f.incidentPlace)}${field("วันเวลาที่เกิดเหตุ", "incidentTime", f.incidentTime)}
  ${field("อายุความ", "limitationNote", f.limitationNote, "textarea")}
  ${field("เอกสารพยานหลักฐานรวม (แผ่น)", "evidenceTotalPages", f.evidenceTotalPages)}
  ${field("- คำร้องเรียน/กล่าวหา (แผ่น)", "complaintPages", f.complaintPages)}
  ${field("- เอกสารประกอบ (แผ่น)", "supportingPages", f.supportingPages)}
  ${field("- อื่น ๆ", "otherDocs", f.otherDocs)}
  ${field("สำนัก/กอง เจ้าของสำนวน", "ownerDivision", f.ownerDivision)}
  ${field("รับเรื่อง วันที่", "receivedDate", f.receivedDate)}
  ${field("คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน", "committeeKind", f.committeeKind)}
</div>`;
    } else if (formId === DOC_IDS.WORK_LOG) {
      body = `<div class="a5-form-grid">
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("ผู้กล่าวหา (ปกปิดชื่อ)", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  ${field("เจ้าของสำนวน/ผู้บันทึก", "recorder", f.recorder)}
</div>
<div data-a5-inq-rows="entries">${(f.entries || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field("วัน เดือน ปี", `entries.${i}.date`, row.date)}${field("การดำเนินการ", `entries.${i}.action`, row.action, "textarea")}
  ${field("จำนวนเอกสารพยานหลักฐาน", `entries.${i}.evidenceCount`, row.evidenceCount)}${field("หมายเหตุ", `entries.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายการดำเนินการ</button>`;
    } else if ([DOC_IDS.INVITE_ACCUSED, DOC_IDS.INVITE_WITNESS].includes(formId)) {
      const isW = formId === DOC_IDS.INVITE_WITNESS;
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field(isW ? "เรียน (ชื่อพยาน)" : "เรียน (ผู้กล่าวหา/ผู้ร้องเรียน)", "addresseeName", f.addresseeName)}
  ${isW ? field("เรื่องที่ไต่สวน", "caseSubject", f.caseSubject) : ""}
  ${isW ? field("เหตุเกิดเมื่อ", "incidentWhen", f.incidentWhen) + field("ที่", "incidentWhere", f.incidentWhere) : field("ผู้ถูกกล่าวหา (ชื่อ-สกุล/ตำแหน่ง ทุกคน)", "respondentNames", f.respondentNames, "textarea") + field("พฤติการณ์/ข้อกล่าวหา", "allegationDetail", f.allegationDetail, "textarea")}
  ${field("นัดวันที่", "appointmentDate", f.appointmentDate)}${field("เวลา", "appointmentTime", f.appointmentTime)}${field("สถานที่", "appointmentPlace", f.appointmentPlace)}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.WITNESS_TRACK_FAIL) {
      body = `<div class="a5-form-grid">
  ${field("คดีไต่สวน เรื่องที่", "caseRefNo2", f.caseRefNo2)}
  ${field("สถานที่บันทึก", "place", f.place)}
  ${field("ชื่อพยานที่เชิญ", "witnessName", f.witnessName)}
  ${field("จำนวนครั้งที่เชิญ", "inviteCount", f.inviteCount)}
  ${field("หนังสือเชิญที่", "lastLetterNo", f.lastLetterNo)}${field("ลงวันที่", "lastLetterDate", f.lastLetterDate)}
</div>`;
    } else if (formId === DOC_IDS.WITNESS_WRITTEN) {
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ชื่อพยาน)", "addresseeName", f.addresseeName)}
  ${field("เรื่องที่ไต่สวน", "caseSubject", f.caseSubject, "textarea")}
  ${field("เหตุเกิดเมื่อ", "incidentWhen", f.incidentWhen)}${field("ที่", "incidentWhere", f.incidentWhere)}
  ${field("ข้อ ๑. ที่ขอให้ชี้แจง/ส่ง", "item1", f.item1, "textarea")}
  ${field("ข้อ ๒. ที่ขอให้ชี้แจง/ส่ง", "item2", f.item2, "textarea")}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if ([DOC_IDS.AGENCY_DOCS, DOC_IDS.AGENCY_CLARIFY, DOC_IDS.AGENCY_OFFICER].includes(formId)) {
      const hasOfficerPart = formId === DOC_IDS.AGENCY_DOCS;
      const isClarify = formId === DOC_IDS.AGENCY_CLARIFY;
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (หัวหน้าหน่วยงาน)", "addresseeName", f.addresseeName)}
  ${field("เรื่องที่ไต่สวน", "caseSubject", f.caseSubject, "textarea")}
  ${field("เหตุเกิดเมื่อ", "incidentWhen", f.incidentWhen)}${field("ที่", "incidentWhere", f.incidentWhere)}
  ${field("ข้อ ๑.", "item1", f.item1, "textarea")}
  ${field("ข้อ ๒.", "item2", f.item2, "textarea")}
  ${hasOfficerPart ? field("มอบหมายเจ้าหน้าที่ไปให้ถ้อยคำ (รายละเอียด)", "officerAppointmentNote", f.officerAppointmentNote, "textarea") : ""}
  ${hasOfficerPart ? field("วันที่นัด", "appointmentDate", f.appointmentDate) + field("เวลา", "appointmentTime", f.appointmentTime) + field("สถานที่", "appointmentPlace", f.appointmentPlace) : ""}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if ([DOC_IDS.ADD_ACCUSED, DOC_IDS.PROTECT_WITNESS].includes(formId)) {
      const isAdd = formId === DOC_IDS.ADD_ACCUSED;
      body = `${memoHead(f).replace('<p><strong>บันทึกข้อความ</strong></p>', '<h3>บันทึกข้อความ</h3>')}
<div class="a5-form-grid">
  ${field(`เรื่อง (${isAdd ? "ขอเพิ่มรายชื่อผู้ถูกกล่าวหา" : "ขอกันตัวบุคคลเป็นพยาน"})`, "caseRefNo", f.caseRefNo)}
  <label class="a5-field-block"><span>ประเภทคดี</span><select class="a5-input" data-a5-inq-path="caseKind"><option value="คดีประพฤติมิชอบ"${f.caseKind === "คดีประพฤติมิชอบ" ? " selected" : ""}>คดีประพฤติมิชอบ</option><option value="คดีรับจาก ป.ป.ช. ตามมาตรา 62"${f.caseKind.includes("62") ? " selected" : ""}>คดีรับจาก ป.ป.ช. ตามมาตรา 62</option></select></label>
  ${field("เรื่องเดิม — คำสั่ง คกก. ที่", "originalOrderNo", f.originalOrderNo)}${field("ในคดีเรื่องที่", "originalOrderCaseNo", f.originalOrderCaseNo)}
  ${field("มติรับไว้ไต่สวน ครั้งที่", "boardMeetingNo", f.boardMeetingNo)}${field("เมื่อวันที่", "boardMeetingDate", f.boardMeetingDate)}
  ${field("รับเรื่องเมื่อวันที่", "receivedDate", f.receivedDate)}${field("ครบกำหนด 2 ปี วันที่", "twoYearDeadline", f.twoYearDeadline)}
  ${field("ขยายระยะเวลา ครั้งที่", "extensionRound", f.extensionRound)}
  ${field("อายุความ (มาตรา/ปี/ขาดวันที่)", "limitationLawSection", f.limitationLawSection, "textarea")}
  ${field("ข้อเท็จจริง (ไต่สวนถึงขั้นตอน/เหตุผล)", "factsFound", f.factsFound, "textarea")}
  ${!isAdd ? field("ข้อกฎหมาย/ระเบียบที่เกี่ยวข้อง", "lawRefs", f.lawRefs, "textarea") : ""}
  ${field("ข้อเสนอ/มติเห็นควร", "proposalText", f.proposalText, "textarea")}
</div>
<h4>รายชื่อที่เสนอ</h4>
<div data-a5-inq-rows="proposedPersons">${(f.proposedPersons || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field(`3.${i + 1} ชื่อ-สกุล`, `proposedPersons.${i}.name`, row.name)}${field("เป็นผู้ถูกกล่าวหาที่/หมายเหตุ", `proposedPersons.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายชื่อ</button>
<p style="margin-top:.6em">จึงเรียนมาเพื่อโปรดพิจารณา<br>(${dot(f.ownerSignerName || f.ownerName, 140, '.......................................')})<br>(อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน)</p>
${opinionChain(f)}`;
    } else if (formId === DOC_IDS.ADDL_ALLEGATION) {
      body = `<h3>บันทึกการแจ้งข้อกล่าวหาเพิ่มเติม</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("ตามคำสั่ง คกก./สปท. ที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  <label class="a5-field-block"><span>คณะ</span><select class="a5-input" data-a5-inq-path="committeeKind"><option value="คณะพนักงานไต่สวน"${f.committeeKind === "คณะพนักงานไต่สวน" ? " selected" : ""}>คณะพนักงานไต่สวน</option><option value="คณะอนุกรรมการไต่สวน"${f.committeeKind === "คณะอนุกรรมการไต่สวน" ? " selected" : ""}>คณะอนุกรรมการไต่สวน</option></select></label>
  ${field("ผู้ถูกกล่าวหา (ชื่อ-สกุล)", "accusedName", f.accusedName)}
  ${field("พฤติการณ์ที่แจ้งเพิ่มเติม/ฐานความผิด", "additionalConduct", f.additionalConduct, "textarea")}
  ${field("ฐานความผิดที่แจ้งเพิ่มเติม", "additionalCharge", f.additionalCharge, "textarea")}
</div>`;
    } else if (formId === DOC_IDS.ACK_RESULT) {
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  <label class="a5-field-block"><span>คณะ</span><select class="a5-input" data-a5-inq-path="committeeKind"><option value="คณะพนักงานไต่สวน"${f.committeeKind === "คณะพนักงานไต่สวน" ? " selected" : ""}>คณะพนักงานไต่สวน</option><option value="คณะอนุกรรมการไต่สวน"${f.committeeKind === "คณะอนุกรรมการไต่สวน" ? " selected" : ""}>คณะอนุกรรมการไต่สวน</option></select></label>
  ${field("ส่งบันทึกแจ้งข้อกล่าวหาให้ (ชื่อ-สกุล)", "accusedName", f.accusedName)}
  ${field("ตามหนังสือที่", "noticeLetterNo", f.noticeLetterNo)}
  ${field("ส่งเมื่อวันที่", "sentDate", f.sentDate)}${field("รับทราบเมื่อวันที่", "receivedDate", f.receivedDate)}
  ${field("ลงชื่อ 1 (หัวหน้าพนักงานฯ/ประธานอนุกรรมการ)", "signer1Name", f.signer1Name)}
  ${field("ลงชื่อ 2 (เจ้าหน้าที่ฯ/อนุกรรมการ)", "signer2Name", f.signer2Name)}
  ${field("ลงชื่อ 3 (เจ้าของสำนวน/เลขานุการ)", "signer3Name", f.signer3Name)}
</div>`;
    } else if (formId === DOC_IDS.CLOSE_NOTICE) {
      body = `<div class="a5-form-grid">
  ${field("สถานที่ปิดบันทึก", "place", f.place)}
  ${field("วัน เดือน ปี", "closeDate", f.closeDate)}
  ${field("เวลา (นาฬิกา)", "closeTime", f.closeTime)}
  ${field("คณะพนักงานไต่สวน ผู้ปิดบันทึก (ชื่อ-สกุล)", "panelMembers", f.panelMembers, "textarea")}
  ${field("รายละเอียดบันทึกแจ้งข้อกล่าวหาที่ปิด", "noticeRecordDetails", f.noticeRecordDetails, "textarea")}
</div>`;
    } else if (formId === DOC_IDS.ACCUSED_HEARING) {
      body = `<div class="a5-form-grid">
  ${field("เรื่อง (การไต่สวนกรณีกล่าวหา...)", "caseTitle", f.caseTitle, "textarea")}
  ${field("สำนัก", "office", f.office)}${field("เลขที่", "bookNo", f.bookNo)}
  ${field("ถนน", "road", f.road)}${field("ตำบล/แขวง", "subdistrict", f.subdistrict)}
  ${field("อำเภอ/เขต", "district", f.district)}${field("จังหวัด", "province", f.province)}
  ${field("วันที่บันทึก", "recordedAt", f.recordedAt)}
  ${field("ผู้ถูกกล่าวหา", "respondentName", f.respondentName)}
  ${field("ผู้บันทึก", "recorderName", f.recorderName)}
</div>
<h4>ถาม-ตอบ</h4>
<div data-a5-inq-rows="qa">${(f.qa || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field(`ถาม (${i + 1})`, `qa.${i}.q`, row.q, "textarea")}${field(`ตอบ (${i + 1})`, `qa.${i}.a`, row.a, "textarea")}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบคู่ถามตอบ</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มคู่ถาม-ตอบ</button>`;
    } else if (formId === DOC_IDS.DOSSIER_LIST) {
      body = `<div class="a5-form-grid">
  ${field("เรื่องที่", "caseRefNo", f.caseRefNo)}
  ${field("สำนัก (เจ้าของเรื่อง)", "officeName", f.officeName)}
</div>
<h4>รายการเอกสารในสำนวน</h4>
<div data-a5-inq-rows="items">${(f.items || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field("ชนิดของเอกสาร/หนังสือ", `items.${i}.document`, row.document, "textarea")}
  ${field("จำนวนแผ่น (หน้า)", `items.${i}.pages`, row.pages)}${field("หมายเหตุ", `items.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายการเอกสาร</button>`;
    } else if ([DOC_IDS.STATEMENT_GENERAL, DOC_IDS.STATEMENT_CHILD, DOC_IDS.STATEMENT_DEAF, DOC_IDS.STATEMENT_DEAF_WRITE, DOC_IDS.STATEMENT_FOREIGN].includes(formId)) {
      const d = object(f.deponent); const reg = object(d.registryAddress); const cur = object(d.currentAddress);
      body = `<h3>บันทึกคำให้การ/ถ้อยคำของผู้กล่าวหาหรือพยาน${f.titleSuffix ? ` (${escapeHtml(f.titleSuffix)})` : ""}</h3>
<div class="a5-form-grid">
  ${field("เรื่อง (การไต่สวนกรณีกล่าวหา...)", "caseTitle", f.caseTitle, "textarea")}
  ${field("สำนัก (เจ้าของเรื่อง)", "office", f.office)}${field("เลขที่", "bookNo", f.bookNo)}
  ${field("ถนน", "road", f.road)}${field("ตำบล/แขวง", "subdistrict", f.subdistrict)}
  ${field("อำเภอ/เขต", "district", f.district)}${field("จังหวัด", "province", f.province)}
  ${field("วันที่", "recordedAt", f.recordedAt)}
  ${field("ชื่อผู้ถูกกล่าวหา", "respondentName", f.respondentName)}
  ${field("สถานที่บันทึก", "place", f.place)}
  ${field("ต่อหน้า (ผู้บันทึก)", "recorderName", f.recorderName)}
</div>
${f.specialNote ? `<p class="ws-policy-note">${escapeHtml(f.specialNote)}</p>` : ""}
${f.interpreterName !== undefined ? `<div class="a5-form-grid">${field((f.interpreterLabel || "ล่าม") + " (ชื่อ-สกุล)", "interpreterName", f.interpreterName)}${field("หน่วยงานล่าม", "interpreterAgency", f.interpreterAgency)}</div>` : ""}
${f.interpreterLabel && f.interpreterName === undefined ? field(f.interpreterLabel + "/ผู้ช่วยสื่อสาร", "interpreterName", "") : ""}
<h4>ข้อมูลผู้ให้ถ้อยคำ</h4>
<div class="a5-form-grid">
  ${field("ชื่อผู้ให้ถ้อยคำ", "deponent.name", d.name)}
  <label class="a5-field-block"><span>เป็น</span><select class="a5-input" data-a5-inq-path="deponent.role"><option value="ผู้กล่าวหา"${d.role === "ผู้กล่าวหา" ? " selected" : ""}>ผู้กล่าวหา</option><option value="พยาน"${d.role === "พยาน" ? " selected" : ""}>พยาน</option></select></label>
  ${field("อายุ", "deponent.age", d.age)}${field("เชื้อชาติ", "deponent.race", d.race)}
  ${field("สัญชาติ", "deponent.nationality", d.nationality)}${field("ศาสนา", "deponent.religion", d.religion)}
  ${field("อาชีพ", "deponent.occupation", d.occupation)}${field("เลขบัตรประชาชน", "deponent.idCard", d.idCard)}
  ${field("บิดาชื่อ", "deponent.fatherName", d.fatherName)}${field("มารดาชื่อ", "deponent.motherName", d.motherName)}
  ${field("โทรศัพท์", "deponent.phone", d.phone)}
</div>
<h4>ถาม-ตอบ</h4>
<div data-a5-inq-rows="qa">${(f.qa || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field(`ถาม (${i + 1})`, `qa.${i}.q`, row.q, "textarea")}${field(`ตอบ (${i + 1})`, `qa.${i}.a`, row.a, "textarea")}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบคู่ถามตอบ</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มคู่ถาม-ตอบ</button>
<div class="a5-form-grid">${field("เอกสารที่มอบ", "documentsSubmitted", f.documentsSubmitted, "textarea")}</div>`;
    } else if (formId === DOC_IDS.CHILD_EXAMINER || formId === DOC_IDS.LAWYER_NOTICE) {
      const isExaminer = formId === DOC_IDS.CHILD_EXAMINER;
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field(isExaminer ? "เรียน (อัยการ/พัฒนสังคมฯ จังหวัด)" : "เรียน (ประธานทนายความ)", "addresseeTitle", f.addresseeTitle)}
  ${field("เรื่องที่ไต่สวน", "caseSubject", f.caseSubject, "textarea")}
  ${field("เหตุเกิดเมื่อ", "incidentWhen", f.incidentWhen)}${field("ที่", "incidentWhere", f.incidentWhere)}
  ${isExaminer ? field("อายุเด็ก (ปี)", "childAge", f.childAge) + field("ฐานะของเด็ก", "childRole", f.childRole) : field("ผู้ถูกกล่าวหา จำนวน (คน)", "accusedCount", f.accusedCount)}
  ${isExaminer ? field("นัดวันที่", "appointmentDate", f.appointmentDate) + field("เวลา", "appointmentTime", f.appointmentTime) + field("สถานที่", "appointmentPlace", f.appointmentPlace) : ""}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.EARLY_EVIDENCE) {
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (อัยการ)", "addresseeTitle", f.addresseeTitle)}
  ${field("เรื่องที่ไต่สวน", "caseSubject", f.caseSubject, "textarea")}
  ${field("เหตุเกิดเมื่อ", "incidentWhen", f.incidentWhen)}${field("ที่", "incidentWhere", f.incidentWhere)}
  ${field("พยาน (ชื่อ-สกุล)", "witnessName", f.witnessName)}
  ${field("เหตุผลความจำเป็นที่ต้องสืบพยานไว้ก่อน", "witnessReason", f.witnessReason, "textarea")}
  ${field("หลักฐานที่ส่งมาพร้อมคำร้อง", "evidenceSentNote", f.evidenceSentNote, "textarea")}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SUSPEND_DUTY) {
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (ผู้บังคับบัญชาผู้ถูกกล่าวหา)", "addresseeTitle", f.addresseeTitle)}
  ${field("กรณีที่ไต่สวน", "respondentSummary", f.respondentSummary, "textarea")}
  ${field("มติ คกก. ครั้งที่", "boardMeetingNo", f.boardMeetingNo)}
  ${field("เมื่อวันที่", "boardMeetingDate", f.boardMeetingDate)}
  ${field("มีมติว่า", "boardResolution", f.boardResolution, "textarea")}
  ${field("ผู้ลงนาม (ประธานกรรมการ ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else if ([DOC_IDS.DATA_ACCESS_REQUEST, DOC_IDS.DATA_UTILIZATION].includes(formId)) {
      const isUtil = formId === DOC_IDS.DATA_UTILIZATION;
      body = `<h3>${isUtil ? "คำขอใช้ประโยชน์ข้อมูลของหน่วยงาน" : "คำขออนุมัติเข้าถึงข้อมูลของหน่วยงาน"}</h3>
<div class="a5-form-grid">
  ${field("วัน เดือน ปี", "issuedAt", f.issuedAt)}
  ${field("ผู้ขอ (กรรมการ/เลขาธิการ/อนุกรรมการ/พนักงานฯ)", "requesterLabel", f.requesterLabel)}
  ${field("๑. หน่วยงานที่ครอบครองข้อมูล", "agencyHoldingName", f.agencyHoldingName)}
  ${field("ที่ตั้ง ถนน", "agencyAddressRoad", f.agencyAddressRoad)}${field("ตำบล/แขวง", "agencyAddressSubdistrict", f.agencyAddressSubdistrict)}
  ${field("อำเภอ/เขต", "agencyAddressDistrict", f.agencyAddressDistrict)}${field("จังหวัด", "agencyAddressProvince", f.agencyAddressProvince)}
  ${field("๒. ผู้ถูกเข้าถึงข้อมูล (ชื่อ-สกุล)", "dataSubjectName", f.dataSubjectName)}
  ${field("ตำแหน่ง", "dataSubjectPosition", f.dataSubjectPosition)}${field("สังกัด", "dataSubjectAffiliation", f.dataSubjectAffiliation)}
  <label class="a5-field-block"><span>มีส่วนเกี่ยวข้องเป็น</span><select class="a5-input" data-a5-inq-path="dataSubjectKind"><option value="ผู้ถูกกล่าวหา"${f.dataSubjectKind === "ผู้ถูกกล่าวหา" ? " selected" : ""}>ผู้ถูกกล่าวหา</option><option value="บุคคลอื่นที่มีเหตุอันควรเชื่อได้ว่าจะเกี่ยวข้องในเรื่องที่กล่าวหา"${f.dataSubjectKind !== "ผู้ถูกกล่าวหา" ? " selected" : ""}>บุคคลอื่นที่เกี่ยวข้อง</option></select></label>
  ${field("๓. รายละเอียดข้อเท็จจริง/พฤติการณ์", "factsDetail", f.factsDetail, "textarea")}
  ${!isUtil ? field("๔. เหตุผลความจำเป็นที่ต้องเข้าถึงข้อมูล", "necessityReason", f.necessityReason, "textarea") + field("๕. วันเดือนปี/ระยะเวลาเข้าถึงข้อมูล", "accessPeriod", f.accessPeriod, "textarea") + field("๖. เครื่องมือ/อุปกรณ์/วิธีเข้าถึงข้อมูล", "toolsAndMethods", f.toolsAndMethods, "textarea") + field("๗. สถานที่/วิธีเข้าถึงสิ่งสื่อสาร", "communicationPlaceMethod", f.communicationPlaceMethod, "textarea") : field("๓. วัตถุประสงค์/เหตุผลที่จะขอใช้ประโยชน์", "purposeReason", f.purposeReason, "textarea") + field("๔. ประเภทข้อมูลที่จะใช้ประโยชน์", "dataType", f.dataType, "textarea") + field("๕. ลักษณะ/ระยะเวลาที่จะใช้ประโยชน์", "usagePeriod", f.usagePeriod, "textarea") + field("๖. รายละเอียดการส่งข้อมูลคืน", "returnDataDetails", f.returnDataDetails, "textarea")}
</div>`;
    } else if (formId === DOC_IDS.DATA_ACCESS_ORDER) {
      body = `<h3>คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ — อนุมัติให้เข้าถึงข้อมูล</h3>
<div class="a5-form-grid">
  ${field("ที่", "orderNo", f.orderNo)}${field("ปี", "orderYear", f.orderYear)}
  ${field("๑. หน่วยงานที่ครอบครองข้อมูล", "agencyHoldingName", f.agencyHoldingName)}
  ${field("ที่ตั้ง ถนน", "agencyAddressRoad", f.agencyAddressRoad)}${field("ตำบล/แขวง", "agencyAddressSubdistrict", f.agencyAddressSubdistrict)}
  ${field("อำเภอ/เขต", "agencyAddressDistrict", f.agencyAddressDistrict)}${field("จังหวัด", "agencyAddressProvince", f.agencyAddressProvince)}
  ${field("๒. ผู้ถูกเข้าถึงข้อมูล (ชื่อ-สกุล)", "dataSubjectName", f.dataSubjectName)}
  ${field("ตำแหน่ง", "dataSubjectPosition", f.dataSubjectPosition)}${field("สังกัด", "dataSubjectAffiliation", f.dataSubjectAffiliation)}
  <label class="a5-field-block"><span>มีส่วนเกี่ยวข้องเป็น</span><select class="a5-input" data-a5-inq-path="dataSubjectKind"><option value="ผู้ถูกกล่าวหา"${f.dataSubjectKind === "ผู้ถูกกล่าวหา" ? " selected" : ""}>ผู้ถูกกล่าวหา</option><option value="บุคคลอื่น"${f.dataSubjectKind !== "ผู้ถูกกล่าวหา" ? " selected" : ""}>บุคคลอื่น</option></select></label>
  ${field("๓. รายละเอียดข้อมูลที่ต้องการเข้าถึง", "accessDetails", f.accessDetails, "textarea")}
  ${field("๔. ระยะเวลา ตั้งแต่วันที่", "periodFrom", f.periodFrom)}${field("ถึงวันที่", "periodTo", f.periodTo)}
  ${field("สั่ง ณ วันที่", "signedDate", f.signedDate)}
  ${field("ผู้ลงนาม (ประธานกรรมการ ป.ป.ท.)", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.DATA_ACCESS_LETTER) {
      body = `<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (หัวหน้าหน่วยงาน)", "addresseeTitle", f.addresseeTitle)}
  ${field("สิ่งที่ส่งมาด้วย — คำสั่ง คกก. ที่", "attachedOrderNo", f.attachedOrderNo)}${field("ลงวันที่", "attachedOrderDate", f.attachedOrderDate)}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.DATA_ACCESS_REPORT) {
      body = `<div class="a5-form-grid">
  ${field("วัน เดือน ปี", "reportDate", f.reportDate)}
  ${field("ตามคำสั่ง คกก. ที่", "orderNo", f.orderNo)}${field("เลขที่ 2", "orderNo2", f.orderNo2)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("อนุมัติให้ (ชื่อ-สกุล)", "approvedPersonName", f.approvedPersonName)}
  ${field("ตำแหน่ง", "approvedPosition", f.approvedPosition)}${field("สังกัด", "approvedAffiliation", f.approvedAffiliation)}
  ${field("สาระสำคัญผลการดำเนินการ", "reportSummary", f.reportSummary, "textarea")}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
  ${field("ตำแหน่งผู้ลงนาม", "signerPosition", f.signerPosition)}
</div>`;
    } else if ([DOC_IDS.EVIDENCE_LEDGER, DOC_IDS.EVIDENCE_RETURNED, DOC_IDS.EVIDENCE_BURNED].includes(formId)) {
      const titles = { [DOC_IDS.EVIDENCE_LEDGER]: "บัญชีของกลาง", [DOC_IDS.EVIDENCE_RETURNED]: "บัญชีของกลางที่ถูกประทุษร้ายได้คืน", [DOC_IDS.EVIDENCE_BURNED]: "บัญชีทรัพย์ที่ถูกเพลิงไหม้" };
      body = `<h3>${escapeHtml(titles[formId])}</h3>
<div class="a5-form-grid">
  ${field("บัญชีลำดับที่ (ตามสารบบคุมของกลาง)", "ledgerNo", f.ledgerNo)}
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("สำนัก/กอง เจ้าของเรื่อง", "ownerDivision", f.ownerDivision)}
  ${field("ผู้กล่าวหา", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  ${formId === DOC_IDS.EVIDENCE_BURNED ? field("ข้อหา/ฐานความผิด", "chargeNote", f.chargeNote) : ""}
</div>
<h4>รายการ${formId === DOC_IDS.EVIDENCE_LEDGER ? "ของกลาง" : formId === DOC_IDS.EVIDENCE_RETURNED ? "ทรัพย์ที่ได้คืน" : "ทรัพย์ถูกเพลิงไหม้"}</h4>
<div data-a5-inq-rows="items">${(f.items || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field("รายการ", `items.${i}.item`, row.item)}${field("จำนวน", `items.${i}.qty`, row.qty)}
  ${field("ราคา (บาท)", `items.${i}.price`, row.price)}
  ${formId === DOC_IDS.EVIDENCE_LEDGER ? field("ยึดจากใคร", `items.${i}.seizedFrom`, row.seizedFrom) + field("วัน/เดือน/ปี ที่ยึด", `items.${i}.dateSeized`, row.dateSeized) : ""}
  ${formId === DOC_IDS.EVIDENCE_RETURNED ? field("วัน/เดือน/ปี ถูกประทุษร้าย", `items.${i}.dateDamaged`, row.dateDamaged) + field("วัน/เดือน/ปี ที่ได้คืน", `items.${i}.dateReturned`, row.dateReturned) : ""}
  ${formId === DOC_IDS.EVIDENCE_BURNED ? field("ของใคร", `items.${i}.ownerNote`, row.ownerNote) + field("วัน เดือน ปี ที่ถูกเพลิงไหม้", `items.${i}.dateBurned`, row.dateBurned) : ""}
  ${field("หมายเหตุ", `items.${i}.note`, row.note)}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบแถว</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มรายการ</button>`;
    } else if ([DOC_IDS.MAP_SKETCH, DOC_IDS.MAP_WARRANT].includes(formId)) {
      body = `<h3>แผนที่สังเขป${f.isWarrant ? " ประกอบการขอหมายค้น" : ""}</h3>
<div class="a5-form-grid">
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("ผู้กล่าวหา", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  ${field("วันเวลาและสถานที่เกิดเหตุ", "incidentWhenWhere", f.incidentWhenWhere, "textarea")}
  ${field("วันที่จัดทำแผนที่สังเขป", "mapCreatedDate", f.mapCreatedDate)}
</div>
<h4>ภาพแผนที่สังเขป</h4>
<p class="ws-policy-note">N — แนบ/วาดภาพแผนที่ในช่องกระดาษ (upload หรือระบุคำอธิบาย)</p>
<div class="a5-form-grid">
  ${field("คำอธิบายแผนที่" + (f.isWarrant ? ' (อธิบายจุดที่จะขอหมายค้นบ้าน/ห้องใกล้เคียงให้เห็นชัดเจน)' : ""), "mapDescription", f.mapDescription, "textarea")}
</div>
<h3>ขอรับรองว่า แผนที่สังเขปที่ได้จัดทำขึ้นนี้ถูกต้องตรงกับความเป็นจริงทุกประการ</h3>
<div class="a5-form-grid">
  ${field("ลงชื่อ ผู้กล่าวหา", "signerComplainant", f.signerComplainant)}
  ${field("ลงชื่อ ผู้ถูกกล่าวหา", "signerRespondent", f.signerRespondent)}
  ${field("ลงชื่อ พยาน", "signerWitness", f.signerWitness)}
  ${field("ลงชื่อ ผู้จัดทำ (คณะฯ/พนักงาน ป.ป.ท.)", "signerInvestigator", f.signerInvestigator)}
</div>`;
    } else if (formId === DOC_IDS.PHOTO_APPENDIX || formId === DOC_IDS.SCENE_PHOTOS) {
      const isAppendix = formId === DOC_IDS.PHOTO_APPENDIX;
      body = `<h3>${isAppendix ? "ภาพถ่ายประกอบสำนวน" : "ภาพถ่ายนำชี้สถานที่เกิดเหตุประกอบการให้ถ้อยคำ"}</h3>
<div class="a5-form-grid">
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("สำนัก/กอง เจ้าของเรื่อง", "ownerDivision", f.ownerDivision)}
  ${field("ผู้กล่าวหา", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  ${field("วันเวลาและสถานที่เกิดเหตุ", "incidentWhenWhere", f.incidentWhenWhere, "textarea")}
  ${field(isAppendix ? "วันเวลาที่ถ่ายภาพ" : "วันเวลาที่นำชี้และถ่ายภาพ", isAppendix ? "photoTakenWhen" : "photoWhen", isAppendix ? f.photoTakenWhen : f.photoWhen)}
  ${!isAppendix ? "" : field("ผู้บันทึก/จัดทำ", "recorderName", f.recorderName)}
</div>
<h4>ภาพถ่าย</h4>
<div data-a5-inq-rows="photos">${(f.photos || []).map((row, i) => `<div class="a5-report-644-row" data-row-index="${i}">
  ${field(`ภาพที่ ${i + 1} — คำอธิบายภาพ`, `photos.${i}.description`, row.description, "textarea")}
  <button type="button" class="ws-button secondary" data-a5-inq-delrow="${i}" style="margin:.3rem 0;padding:.15rem .6rem;font-size:.75rem">ลบภาพ</button>
</div>`).join("")}</div>
<button type="button" class="ws-button secondary" data-a5-inq-addrow style="margin-top:.4rem;padding:.25rem .8rem;font-size:.8rem">+ เพิ่มภาพถ่าย</button>
${isAppendix ? '<p class="ws-policy-note">หมายเหตุ: กรณีนำภาพถ่ายมาติดให้ลงชื่อกำกับภาพถ่ายไว้ด้วย</p>' : ''}`;
    } else if ([DOC_IDS.LINEUP_CONSENT, DOC_IDS.PHOTO_LINEUP].includes(formId)) {
      const title = formId === DOC_IDS.LINEUP_CONSENT ? "บันทึกการยินยอมให้ชี้ตัวผู้ถูกกล่าวหา" : "บันทึกการชี้ภาพถ่ายผู้ถูกกล่าวหา";
      body = `<h3>${escapeHtml(title)}</h3>
<p class="ws-policy-note">(หากเป็นคณะอนุกรรมการไต่สวน ระบบจะแสดงคำว่า คณะอนุกรรมการไต่สวน และคำสั่งคณะกรรมการ ป.ป.ท. แทนอัตโนมัติ)</p>
<div class="a5-form-grid">
  ${field("วันที่", "recordDate", f.recordDate)}${field("เวลา (น.)", "recordTime", f.recordTime)}
  <label class="a5-field-block"><span>คณะ</span><select class="a5-input" data-a5-inq-path="committeeKind"><option value="คณะพนักงานไต่สวน"${f.committeeKind === "คณะพนักงานไต่สวน" ? " selected" : ""}>คณะพนักงานไต่สวน</option><option value="คณะอนุกรรมการไต่สวน"${f.committeeKind === "คณะอนุกรรมการไต่สวน" ? " selected" : ""}>คณะอนุกรรมการไต่สวน</option></select></label>
  ${field("ตามคำสั่ง (คณะกรรมการ ป.ป.ท./สำนักงาน ป.ป.ท.) ที่", "orderNo", f.orderNo)}
  ${field("ผู้ถูกกล่าวหา", "accusedName", f.accusedName)}
  ${field(formId === DOC_IDS.LINEUP_CONSENT ? "รายละเอียดการจัดให้ชี้ตัว" : "รายละเอียดการชี้ภาพถ่าย", "lineupDetail", f.lineupDetail, "textarea")}
  ${field("ลงชื่อ ประธานอนุกรรมการ/พนักงาน ป.ป.ท.", "signerChair", f.signerChair)}
  ${field("ลงชื่อ อนุกรรมการ/พนักงาน ป.ป.ท.", "signerMember", f.signerMember)}
  ${field("ลงชื่อ อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.", "signerSecretary", f.signerSecretary)}
</div>`;
    } else if (formId === DOC_IDS.SCENE_GUIDE) {
      body = `<h3>บันทึกนำชี้สถานที่ประกอบการให้ถ้อยคำ</h3>
<div class="a5-form-grid">
  ${field("เรื่องที่", "caseTitle", f.caseTitle)}
  ${field("ผู้กล่าวหา", "complainant", f.complainant)}${field("ผู้ถูกกล่าวหา", "respondent", f.respondent)}
  ${field("วันเวลาและสถานที่เกิดเหตุ", "incidentWhenWhere", f.incidentWhenWhere, "textarea")}
  ${field("วันเวลาที่นำชี้สถานที่", "guideWhen", f.guideWhen)}
  ${field("คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ประกอบด้วย (ชื่อ-สกุล/ตำแหน่ง)", "panelMembers", f.panelMembers, "textarea")}
  ${field("ผู้ถูกนำชี้ (ชื่อ-สกุล/ตำแหน่ง)", "guidedPersonName", f.guidedPersonName)}
  ${field("ตำแหน่งผู้ถูกนำชี้", "guidedPersonPosition", f.guidedPersonPosition)}
  ${field("นำไปชี้สถานที่ประกอบคำให้การที่ (สถานที่+พฤติการณ์)", "guideLocationDetail", f.guideLocationDetail, "textarea")}
  ${field("ผลการนำชี้ตามลำดับ", "guideResults", f.guideResults, "textarea")}
</div>
<h4>ลงชื่อคณะ</h4>
<div class="a5-form-grid">
  ${field("ประธานอนุกรรมการ/พนักงาน ป.ป.ท.", "signerChair", f.signerChair)}
  ${field("อนุกรรมการ/พนักงาน ป.ป.ท.", "signerMember", f.signerMember)}
  ${field("อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.", "signerSecretary", f.signerSecretary)}
</div>`;
    } else if (formId === DOC_IDS.FORENSIC_COOP) {
      body = `<h3>หนังสือขอความอนุเคราะห์ในการตรวจพิสูจน์</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (หน่วยงานตรวจพิสูจน์)", "addresseeName", f.addresseeName)}
  ${field("สิ่งที่ส่งมาด้วย ๑.", "attachments.0", f.attachments?.[0] || "")}${field("๒.", "attachments.1", f.attachments?.[1] || "")}${field("๓.", "attachments.2", f.attachments?.[2] || "")}
  ${field("ตามคำสั่ง คกก./สปท. ที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("มีกรณีจำเป็นต้องขอให้ (หน่วยงาน)", "forensicTarget", f.forensicTarget)}
  ${field("๑. ขอตรวจพิสูจน์", "items.0", f.items?.[0], "textarea")}
  ${field("๒.", "items.1", f.items?.[1], "textarea")}${field("๓.", "items.2", f.items?.[2], "textarea")}
  ${field("ผู้ประสานงาน", "coordinatorName", f.coordinatorName)}
  ${field("โทรศัพท์ผู้ประสานงาน", "coordinatorPhone", f.coordinatorPhone)}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.FORENSIC_EXPERT) {
      body = `<h3>หนังสือขอความอนุเคราะห์ผู้เชี่ยวชาญตรวจพิสูจน์</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("ลงวันที่", "issuedAt", f.issuedAt)}
  ${field("เรียน (หน่วยงาน)", "addresseeName", f.addresseeName)}
  ${field("ตามคำสั่ง คกก./สปท. ที่", "orderNo", f.orderNo)}${field("ลงวันที่", "orderDate", f.orderDate)}
  ${field("มีกรณีจำเป็นต้องตรวจสอบ", "inspectionTarget", f.inspectionTarget, "textarea")}
  ${field("ขอมอบหมายผู้เชี่ยวชาญด้าน", "expertiseField", f.expertiseField)}
  ${field("ผู้ลงนาม", "signerName", f.signerName)}
</div>`;
    } else if (formId === DOC_IDS.SEND_DIAGNOSIS) {
      body = `<h3>บันทึกข้อความ — ขอส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล</h3>
<div class="a5-form-grid">
  ${field("ที่ (เลขหนังสือ)", "letterNo", f.letterNo)}${field("วันที่", "issuedAt", f.issuedAt)}
  <label class="a5-field-block"><span>ประเภทคดี</span><select class="a5-input" data-a5-inq-path="caseKind"><option value="คดีประพฤติมิชอบ"${f.caseKind === "คดีประพฤติมิชอบ" ? " selected" : ""}>คดีประพฤติมิชอบ</option><option value="คดีรับจาก ป.ป.ช.ตามมาตรา 62"${f.caseKind.includes("62") ? " selected" : ""}>คดีรับจาก ป.ป.ช.ตามมาตรา 62</option></select></label>
  ${field("เรื่องเดิม — คำสั่ง คกก. ที่", "originalOrderNo", f.originalOrderNo)}${field("ในคดีเรื่องที่", "originalOrderCaseNo", f.originalOrderCaseNo)}
  ${field("มติรับไว้ไต่สวน ครั้งที่", "boardMeetingNo", f.boardMeetingNo)}${field("เมื่อวันที่", "boardMeetingDate", f.boardMeetingDate)}
  ${field("รับเรื่องเมื่อวันที่", "receivedDate", f.receivedDate)}${field("ครบกำหนด 2 ปี", "twoYearDeadline", f.twoYearDeadline)}
  ${field("ขยายระยะเวลา ครั้งที่", "extensionRound", f.extensionRound)}
  ${field("เคยเสนอรายงานฯ ฉบับลงวันที่", "priorReportDate", f.priorReportDate)}
  ${field("มติ คกก. ครั้งก่อน (สั่งไต่เพิ่มเติม)", "priorBoardResolution", f.priorBoardResolution, "textarea")}
  ${field("อายุความ", "limitationLawSection", f.limitationLawSection, "textarea")}
  ${field("สรุปการดำเนินการไต่สวน", "inquiryProcessSummary", f.inquiryProcessSummary, "textarea")}
  ${field("2.1 ข้อกล่าวหา — ทางอาญา", "allegedFactsCriminal", f.allegedFactsCriminal, "textarea")}
  ${field("2.1 ข้อกล่าวหา — ทางวินัย", "allegedFactsDisciplinary", f.allegedFactsDisciplinary, "textarea")}
  ${field("2.2 ความเห็นคณะ — ทางอาญา", "opinionCriminal", f.opinionCriminal, "textarea")}
  ${field("2.2 ความเห็นคณะ — ทางวินัย", "opinionDisciplinary", f.opinionDisciplinary, "textarea")}
  ${field("3. ข้อพิจารณา/ข้อเสนอ", "considerations", f.considerations, "textarea")}
</div>`;
    }
    const buttons = editable ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-inq-action="save" data-doc-id="${escapeHtml(formId)}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-inq-action="submit" data-doc-id="${escapeHtml(formId)}">ส่งเอกสาร</button></div>` : "";
    return `<div class="a5-inquiry-editor" data-doc-id="${escapeHtml(formId)}"><p class="ws-policy-note">ปปท. ${escapeHtml(meta.code)} — ${escapeHtml(meta.title)}${doc.status === "SUBMITTED" ? " · ส่งแล้ว (อ่านอย่างเดียว)" : ""}</p>${body}${buttons}</div>`;
  }

  function captureInquiryEditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-inq-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5InqPath;
      if (!path) return;
      const parts = path.split(".");
      let current = payload;
      parts.forEach((key, index) => {
        if (index === parts.length - 1) {
          if (controlElement.type === "checkbox") current[key] = controlElement.checked;
          else if (controlElement.tagName === "SELECT") current[key] = controlElement.value;
          else current[key] = /^\d+$/.test(controlElement.value) && /(pages|pieces|Count|No)$/.test(path) ? Number(controlElement.value) : controlElement.value;
        } else {
          current[key] = current[key] && typeof current[key] === "object" ? current[key] : {};
          current = current[key];
        }
      });
    });
    return payload;
  }

  // ---------- paper renderers (verbatim) ----------
  const headRow = f => `<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ${dot(f.letterNo, 90, 'ปป ๐๐.../...')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>(วัน เดือน ปี)</p></div>`;

  function paperCaseCover(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนวนการไต่สวน &nbsp;&nbsp;สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</strong></p>
<p>เรื่องที่ ${dot(f.caseTitle, 200, '…………………………….')}</p>
<p>${dot(f.complainant, 60, '................')}(ชื่อ-สกุล/ปกปิดชื่อ)...........................................<strong>ผู้กล่าวหา</strong></p>
<p style="text-align:center">ระหว่าง</p>
<p>${dot(f.respondent, 240, '........................................................................................')}<strong>ผู้ถูกกล่าวหา</strong></p>
<p>เป็นกรณีร้องเรียน/กล่าวหาว่ากระทำการ&nbsp;&nbsp;( ${f.caseType === "ทุจริตต่อหน้าที่" ? "✔" : " ) "} ทุจริตต่อหน้าที่ &nbsp;&nbsp;&nbsp;&nbsp; ( ${f.caseType === "ประพฤติมิชอบ" ? "✔" : " )"} ประพฤติมิชอบ</p>
<p>( ${f.caseType === "อื่น ๆ" ? "✔" : " )"} อื่น ๆ${dot(f.otherType, 100)}</p>
<p>สถานที่เกิดเหตุ${dot(f.incidentPlace, 220, '............................................................................................')}</p>
<p>วันเวลาที่เกิดเหตุ${dot(f.incidentTime, 230, '..........................................................................................')}</p>
<p><strong>อายุความ</strong><br>${show(f.limitationNote) || ".".repeat(130)}</p>
<p>เอกสารพยานหลักฐาน รวมจำนวน${dot(f.evidenceTotalPages, 60, '...............................')}แผ่น</p>
<p>- คำร้องเรียน/กล่าวหา &nbsp; จำนวน${dot(f.complaintPages, 60, '................................')}แผ่น</p>
<p>- เอกสารประกอบ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; จำนวน${dot(f.supportingPages, 60, '................................')}แผ่น</p>
<p>- อื่น ๆ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; จำนวน${dot(f.otherDocs, 50)}</p>
<p>สำนัก/กอง เจ้าของสำนวน${dot(f.ownerDivision, 200, '............................................................................................')}</p>
<p>รับเรื่อง&nbsp; วันที่${dot(f.receivedDate, 60, '...............')}เดือน${dot("", 60, '........................')}พ.ศ. ${dot("", 40, '.................')}</p>
<p>คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน${dot(f.committeeKind, 120, '...........................................')}</p>
<p class="a5-form-corner">ปปท. 6-01</p></article>`;
  }

  function paperInviteAccused(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ไปให้ถ้อยคำ</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(ระบุชื่อผู้กล่าวหา/ผู้ร้องเรียน)')}</p>
<p class="a5-p-indent">ตามที่ท่านได้กล่าวหา/ร้องเรียน&nbsp; ${dot(f.respondentNames, 320, '(ระบุชื่อ-นามสกุล และตำแหน่งของผู้ถูกกล่าวหาทุกคน)')} &nbsp;&nbsp;ว่ากระทำการทุจริตในภาครัฐโดยมีพฤติการณ์ ${dot(f.allegationDetail, 300, '(สรุปพฤติการณ์)')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอเชิญท่านไปให้ถ้อยคำ ในวันที่ ${dot(f.appointmentDate, 90, '..............')} เวลา ${dot(f.appointmentTime, 50, '..........')} น. ณ ${dot(f.appointmentPlace, 180, '.................')}</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}<p class="a5-letter-note">“ตัวอย่างหนังสือขอเชิญผู้กล่าวหามาให้ถ้อยคำ”</p>
<p class="a5-form-corner">ปปท. 6-03</p></article>`;
  }

  function paperInviteWitness(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ไปให้ถ้อยคำในฐานะพยาน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(ระบุชื่อพยาน)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 280, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 100, '..............')} ณ ${dot(f.incidentWhere, 160, '..............')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอเชิญท่านไปให้ถ้อยคำ ในวันที่ ${dot(f.appointmentDate, 90, '..............')} เวลา ${dot(f.appointmentTime, 50, '..........')} น. ณ ${dot(f.appointmentPlace, 180, '.................')}</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}<p class="a5-letter-note">“ตัวอย่างหนังสือขอเชิญพยานมาให้ถ้อยคำ”</p>
<p class="a5-form-corner">ปปท. 6-04</p></article>`;
  }

  function paperWorkLog(f) {
    const rows = (f.entries || []).map(row => `<tr><td>${dot(row.date, 40)}</td><td>${show(row.action) || "&nbsp;"}</td><td>${dot(row.evidenceCount, 30)}</td><td>${show(row.note) || "&nbsp;"}</td></tr>`).join("");
    const blankRows = Array.from({ length: Math.max(12 - (f.entries || []).length, 4) }, () => "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>").join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center;margin-bottom:.6em">บันทึกการปฏิบัติงานการไต่สวน</h2>
<p>เรื่องที่${dot(f.caseTitle, 160, '................................................')}</p>
<p>ผู้กล่าวหา&nbsp;&nbsp;${f.complainant ? escapeHtml(f.complainant) : ''}${'.'.repeat(28)}<strong>(ปกปิดชื่อ)</strong>${'.'.repeat(80)}</p>
<p>ผู้ถูกกล่าวหา&nbsp;&nbsp;${dot(f.respondent, 240, '........................................................................................…………………………………………………………')}</p>
<p>เจ้าของสำนวน/ผู้บันทึก${dot(f.recorder, 220, '............................................................................')}</p>
<table class="a5-table"><thead><tr><th style="width:16%">วัน เดือน ปี</th><th style="width:44%">การดำเนินการ</th><th style="width:20%">จำนวนเอกสารพยานหลักฐาน</th><th style="width:20%">หมายเหตุ</th></tr></thead>
<tbody>${rows}${blankRows}</tbody></table>
<p class="a5-letter-note" style="margin-top:1em"><strong>หมายเหตุ</strong>&nbsp;&nbsp;๑. ให้จัดทำบันทึกการปฏิบัติงานประจำเรื่องกล่าวหาร้องเรียนแต่ละเรื่อง<br>๒. เจ้าหน้าที่เจ้าของเรื่องจะต้องบันทึกการดำเนินการทุกครั้ง นับแต่วันที่ได้รับมอบให้เป็นเจ้าของเรื่อง และต้องลงลายมือชื่อกำกับไว้ทุกครั้งที่มีการบันทึกรายการต่าง ๆ<br>๓. การเสนอเรื่องต่อผู้บังคับบัญชาจะต้องแนบบันทึกการปฏิบัติงานไปด้วยทุกครั้ง<br>๔. ผู้บังคับบัญชาจะพิจารณาสั่งการ หรือมีความเห็นในเรื่องกล่าวหาร้องเรียน โดยบันทึกไว้ในช่องหมายเหตุ</p>
<p class="a5-form-corner">ปปท. 6-02</p></article>`;
  }

  function paperWitnessTrackFail(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงาน ป.ป.ท.<br>บันทึกกรณีติดตามตัวพยานมาให้ถ้อยคำไม่ได้</strong></p>
<p>คดีไต่สวน เรื่องที่${dot(f.caseRefNo2, 140, '.......................')}</p>
<p>สถานที่บันทึก${dot(f.place, 180, '..............................')}</p>
<p>${"." .repeat(100)}</p>
<p>${"." .repeat(100)}</p>
<p style="text-align:right">(${dot(f.recordedAt, 100, 'วัน เดือน ปี')})</p>
<p class="a5-p-indent">${show(f.committeeKind) || 'คณะพนักงานไต่สวน'} ได้มีหนังสือเชิญพยานราย ${dot(f.witnessName, 140, '(ระบุชื่อพยาน)')} มาให้ถ้อยคำจำนวน${dot(f.inviteCount, 50, '...............')}ครั้ง ตามหนังสือ ที่ ${dot(f.lastLetterNo, 70, '..............')} ลงวันที่ ${dot(f.lastLetterDate, 90, '..............')}</p>
<p>จึงบันทึกไว้เป็นหลักฐาน</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;พนักงาน ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;พนักงาน ป.ป.ท. เจ้าของสำนวน</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
</tbody></table>
<p class="a5-letter-note">“ตัวอย่างบันทึกกรณีการติดตามตัวพยานมาให้ถ้อยคำไม่ได้”</p>
<p class="a5-form-corner">ปปท. 6-05</p></article>`;
  }

  function paperWrittenStatementRequest(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ส่งคำชี้แจงเป็นหนังสือ/ส่งบัญชีเอกสารหรือหลักฐาน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(ระบุชื่อพยาน)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 280, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 100, '..............')} ณ ${dot(f.incidentWhere, 160, '..............')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอให้ท่านชี้แจงข้อเท็จจริงและส่งเอกสารหลักฐาน ดังนี้</p>
<p>๑.&nbsp; ${dot(f.item1, 380, '................................................................................')}</p>
<p>๒.&nbsp; ${dot(f.item2, 380, '................................................................................')}</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดส่งคำชี้แจง/ส่งบัญชีเอกสารหรือหลักฐานดังกล่าวไปยังคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ภายใน ๑๕ วัน นับแต่วันได้รับหนังสือฉบับนี้</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}<p class="a5-form-corner">ปปท. 6-06</p></article>`;
  }

  function paperAgencyDocs(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ส่งเอกสาร/หลักฐาน และมอบหมายเจ้าหน้าที่ไปให้ถ้อยคำ</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(หัวหน้าหน่วยงาน)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 280, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 100, '..............')} ณ ${dot(f.incidentWhere, 160, '..............')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอให้ท่านส่งเอกสารหลักฐาน ดังนี้</p>
<p>๑.&nbsp; ${dot(f.item1, 380, '................................................................................')}</p>
<p>๒.&nbsp; ${dot(f.item2, 380, '................................................................................')}</p>
<p class="a5-p-indent">พร้อมนี้ให้ส่งเจ้าหน้าที่ที่เกี่ยวข้องไปเพื่อให้ถ้อยคำประกอบด้วย (กรณีมีความจำเป็นต้องให้เจ้าหน้าที่ที่เกี่ยวข้องไปให้ถ้อยคำประกอบ) ${show(f.officerAppointmentNote)} ในวันที่ ${dot(f.appointmentDate, 80, '..............')} เวลา ${dot(f.appointmentTime, 50, '..........')} น. ณ ${dot(f.appointmentPlace, 150, '.................')}</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}<p class="a5-form-corner">ปปท. 6-07</p></article>`;
  }

  function paperAgencyClarify(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ส่งคำชี้แจงเป็นหนังสือ/ขอทราบข้อเท็จจริงและเอกสารพลักฐาน (เลือกใช้แล้วแต่ข้อเท็จจริง)</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(หัวหน้าหน่วยงาน)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 280, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 100, '..............')} ณ ${dot(f.incidentWhere, 160, '..............')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอให้ท่านชี้แจงข้อเท็จจริง ดังนี้</p>
<p>๑.&nbsp; ${dot(f.item1, 380, '................................................................................')}</p>
<p>๒.&nbsp; ${dot(f.item2, 380, '................................................................................')}</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดส่งคำชี้แจง เอกสารและพยานหลักฐานดังกล่าวไปยังคณะอนุกรรมการ ไต่สวน/คณะพนักงานไต่สวน ภายใน ๑๕ วัน นับแต่วันได้รับหนังสือฉบับนี้</p>
<p class="a5-p-indent">ทั้งนี้ คณะอนุกรรมการ  ไต่สวน/คณะพนักงานไต่สวน จึงขอให้ท่านส่งคำชี้แจงเป็นหนังสือ พร้อมเอกสารและพยานหลักฐานดังกล่าว</p>
<p class="a5-p-indent">หากมีข้อขัดข้องประการใด ที่ไม่สามารถจัดส่งคำชี้แจงได้ตามกำหนด โปรดแจ้งให้ทราบด้วย จักขอบคุณมาก</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}
<p style="margin-top:.8em">(ระบุชื่อ-สกุลของอนุกรรมการและเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)&nbsp;&nbsp;${dot(f.ownerName, 100)}</p>
<p class="a5-letter-note">“ตัวอย่างหนังสือขอให้หน่วยงานส่งคำชี้แจงเป็นหนังสือ ตามมาตรา ๑๘ (๑)”</p>
<p class="a5-form-corner">ปปท. 6-08</p></article>`;
  }

  function paperAgencyOfficer(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ส่งเจ้าหน้าที่ไปให้ถ้อยคำ</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 260, '(หัวหน้าหน่วยงาน)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 280, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 100, '..............')} ณ ${dot(f.incidentWhere, 160, '..............')}</p>
<p class="a5-p-indent">ฉะนั้น เพื่อประโยชน์ในการไต่สวนอาศัยอำนาจตามมาตรา 18 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอให้ท่านชี้แจงข้อเท็จจริง ดังนี้</p>
<p>๑.&nbsp; ${dot(f.item1, 380, '................................................................................')}</p>
<p>๒.&nbsp; ${dot(f.item2, 380, '................................................................................')}</p>
<p>๓.&nbsp; ประเด็นอื่นที่เกี่ยวข้อง</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดส่งเจ้าหน้าที่ไปให้ถ้อยคำต่อคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ในวันที่ ${dot(f.appointmentDate, 90, '..............')} เวลา ${dot(f.appointmentTime, 50, '..........')} น. ณ ${dot(f.appointmentPlace, 170, '.................')}</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}${warn62}<p class="a5-form-corner">ปปท. 6-09</p></article>`;
  }

  function memoPaper(f, subjectLine, middleHtml, cornerCode) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h3>บันทึกข้อความ</h3>
<p>ส่วนราชการ&nbsp;&nbsp;${dot(f.ownerDivision, 100, 'สำนัก/กอง .....')} &nbsp;&nbsp;โทร. ${dot(f.ownerPhone, 60)}</p>
<p>ที่ ${dot(f.letterNo, 90, 'ปป 00.../...')} &nbsp;&nbsp;&nbsp;&nbsp;วันที่ ${dot(f.issuedAt, 80)}</p>
${subjectLine}
${middleHtml}
<p class="a5-form-corner">${cornerCode}</p></article>`;
  }

  function paperAddAccused(f) {
    const persons = (f.proposedPersons || []).map((row, i) => `<p>3.${i + 1} นาย/นาง/นางสาว${dot(row.name, 140, '.......................................')}เป็นผู้ถูกกล่าวหาที่${dot(row.note, 100, '..................................')}</p>`).join("") + "<p>3.3 นาย/นาง/นางสาว.......................................เป็นผู้ถูกกล่าวหาที่..................................</p>";
    const subject = `<p><strong>เรื่อง</strong>&nbsp; ขอเพิ่มรายชื่อผู้ถูกกล่าวหา เรื่องที่${dot(f.caseRefNo, 80, '........')} (${show(f.caseKind)})</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<p><strong>๑. เรื่องเดิม (เลือกใส่แล้วแต่กรณี)</strong><br>1.1 คณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot(f.originalOrderNo, 90, '...............................')} ในคดีเรื่องที่ ${dot(f.originalOrderCaseNo, 90, '.................')}<br>1.1 คณะกรรมการ ป.ป.ท. มีมติรับไว้ไต่สวน ในคราวประชุมครั้งที่ ${dot(f.boardMeetingNo, 60, '...............')} เมื่อวันที่ ${dot(f.boardMeetingDate, 90, '......................')} มอบหมายให้เลขาธิการคณะกรรมการฯ ดำเนินการ<br>1.2 เรื่องนี้ สำนักงาน ป.ป.ท. รับเมื่อวันที่ ${dot(f.receivedDate, 80, '..................')} ครบกำหนด 2 ปี วันที่${dot(f.twoYearDeadline, 80, '.................')} มีการขยายระยะเวลา ครั้งที่ ${dot(f.extensionRound, 40, '......')}<br>1.3 อายุความ ${show(f.limitationLawSection)}</p>
<p><strong>2. ข้อเท็จจริง</strong><br>คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้ไต่สวน ถึงขั้นตอน${dot(f.inquiryStageProgress, 100, '.................................')}ปรากฏข้อเท็จจริงว่า${show(f.factsFound) || ".".repeat(120)}</p>
<p><strong>๓. ข้อเสนอ/ความเห็น</strong>&nbsp; คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้พิจารณาแล้ว มีมติเห็นควรเพิ่มชื่อบุคคลเป็นผู้ถูกกล่าวหาเพิ่มเติม ดังนี้</p>
${persons}
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>(${dot(f.ownerSignerName || f.ownerName, 120, '.......................................')})<br>(อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน)</p>
${opinionChain(f)}`;
    return memoPaper(f, subject, "", "ปปท. 6-38").replace("<p class=\"a5-form-corner\">", "");
  }

  function paperProtectWitness(f) {
    const persons = (f.proposedPersons || []).map((row, i) => `<p>4.${i + 1} นาย/นาง/นางสาว${dot(row.name, 140, '..............................................')}ผู้ถูกกล่าวหาที่${dot(row.note, 100, '..................................')}</p>`).join("") + "<p>4.3 นาย/นาง/นางสาว..............................................ผู้ถูกกล่าวหาที่..................................</p>";
    const subject = `<p><strong>เรื่อง</strong>&nbsp; ขอกันตัวบุคคลเป็นพยาน เรื่องที่${dot(f.caseRefNo, 80, '........')} (${show(f.caseKind)})</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<p><strong>๑. เรื่องเดิม (เลือกใส่แล้วแต่กรณี)</strong><br>1.1 คณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot(f.originalOrderNo, 90, '...............................')} ในคดีเรื่องที่ ${dot(f.originalOrderCaseNo, 90, '.................')}<br>1.1 คณะกรรมการ ป.ป.ท. มีมติรับไว้ไต่สวน ในคราวประชุมครั้งที่ ${dot(f.boardMeetingNo, 60, '...............')} เมื่อวันที่ ${dot(f.boardMeetingDate, 90, '......................')} มอบหมายให้เลขาธิการคณะกรรมการฯ ดำเนินการ<br>1.2 เรื่องนี้ สำนักงาน ป.ป.ท. รับเมื่อวันที่ ${dot(f.receivedDate, 80, '..................')} ครบกำหนด 2 ปี วันที่${dot(f.twoYearDeadline, 80, '.................')} มีการขยายระยะเวลา ครั้งที่ ${dot(f.extensionRound, 40, '......')}<br>1.3 อายุความ ${show(f.limitationLawSection)}</p>
<p><strong>2. ข้อเท็จจริง</strong><br>คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้ไต่สวน ถึงขั้นตอน${dot(f.inquiryStageProgress, 100, '.................................')}ปรากฏข้อเท็จจริงว่า${show(f.factsFound) || ".".repeat(110)}</p>
<p><strong>๓. ข้อกฎหมาย และระเบียบที่เกี่ยวข้อง</strong><br>${show(f.lawRefs) || "3.1 พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑ และที่แก้ไขเพิ่มเติม มาตรา 58<br>3.2 ประกาศคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เรื่อง หลักเกณฑ์ วิธีการและเงื่อนไขในการกันบุคคลหรือผู้ถูกกล่าวหาไว้เป็นพยาน"}</p>
<p><strong>๔. ข้อเสนอ/ความเห็น</strong>&nbsp; คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้พิจารณาแล้ว มีมติเห็นควรกันบุคคลไว้เป็นพยาน โดยไม่ดำเนินคดี ดังนี้</p>
${persons}
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>(${dot(f.ownerSignerName || f.ownerName, 120, '.......................................')})<br>(อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน)</p>
${opinionChain(f)}`;
    return memoPaper(f, subject, "", "ปปท. 6-39");
  }

  function paperAddlAllegation(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงาน ป.ป.ท.<br>บันทึกการแจ้งข้อกล่าวหาเพิ่มเติม</strong></p>
<p>สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p>
<p style="text-align:right">(${dot(f.issuedAt, 80, 'วัน เดือน ปี')})</p>
<p><strong>การแจ้งข้อกล่าวหา</strong></p>
<p class="a5-p-indent">ตามที่ คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท./สำนักงาน ป.ป.ท. ที่ ${dot(f.orderNo, 90, '...............')} ลงวันที่ ${dot(f.orderDate, 100, '...................')} นั้น</p>
<p class="a5-p-indent">${show(f.committeeKind) || 'คณะพนักงานไต่สวน'} ขอแจ้งให้ท่านทราบก่อนแจ้งข้อกล่าวหาเพิ่มเติมว่าในการชี้แจงแก้ข้อกล่าวหา ผู้ถูกกล่าวหาอาจแก้ข้อกล่าวหาได้</p>
<p class="a5-p-indent">ในการชี้แจงแก้ข้อกล่าวหาเพิ่มเติมด้วยวาจาผู้ถูกกล่าวหามีสิทธิที่จะนำทนายความหรือบุคคล ซึ่งผู้ถูกกล่าวหาไว้วางใจไม่เกินสองคนเข้าฟังการให้ถ้อยคำได้</p>
<p class="a5-p-indent">${show(f.committeeKind)} จึงขอแจ้งข้อกล่าวหาเพิ่มเติมให้ผู้ถูกกล่าวหา${dot(f.accusedName, 140, '')}ทราบ ดังนี้</p>
<p>ให้ระบุพฤติการณ์ที่แจ้งเพิ่มเติม/ฐานความผิดที่แจ้งเพิ่มเติม ${dot(f.additionalCharge, 300, '………………………………………..')}</p>
<p class="a5-letter-note">“ตัวอย่างบันทึกแจ้งข้อกล่าวหาเพิ่มเติม”</p>
<p class="a5-form-corner">ปปท. 6-42</p></article>`;
  }

  function paperAckResult(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงาน ป.ป.ท.<br>บันทึกผลการรับทราบข้อกล่าวหา</strong></p>
<p class="a5-p-indent">${show(f.committeeKind) || 'คณะพนักงานไต่สวน'} ได้ส่งบันทึกแจ้งข้อกล่าวหาให้ (${dot(f.accusedName, 160, 'ระบุชื่อ-นามสกุล ของผู้ถูกกล่าวหา')}) ทราบแล้ว ตามหนังสือ${dot(f.noticeLetterNo, 120, '...........')}</p>
<p class="a5-p-indent">${show(f.committeeKind)} ได้ส่งบันทึกแจ้งข้อกล่าวหาให้ (${show(f.accusedName)}) ทราบแล้ว เมื่อวันที่${dot(f.sentDate, 100, '..........')} และได้รับทราบเมื่อวันที่${dot(f.receivedDate, 100, '..........')}</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;หัวหน้าพนักงาน ป.ป.ท./ประธานอนุกรรมการ</td></tr><tr><td>(${dot(f.signer1Name, 100)})</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;เจ้าหน้าที่ ป.ป.ท./อนุกรรมการ</td></tr><tr><td>(${dot(f.signer2Name, 100)})</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;พนักงาน ป.ป.ท. เจ้าของสำนวน/อนุกรรมการและเลขานุการ</td></tr><tr><td>(${dot(f.signer3Name, 100)})</td></tr>
</tbody></table>
<p class="a5-letter-note"><strong>หมายเหตุ</strong>&nbsp;&nbsp;1. ให้แนบบันทึกฉบับนี้ไว้ท้ายบันทึกการแจ้งข้อกล่าวหา<br>2. ให้แนบใบไปรษณีย์ลงทะเบียนตอบรับ หรือหลักฐานจากบริการติดตามสถานะของไปรษณีย์ไทย</p>
<p class="a5-letter-note">“ตัวอย่างบันทึกผลการรับทราบข้อกล่าวหา”</p>
<p class="a5-form-corner">ปปท. 6-43</p></article>`;
  }

  function paperCloseNotice(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงาน ป.ป.ท.<br>บันทึกการปิดบันทึกการแจ้งข้อกล่าวหา</strong></p>
<p>สถานที่ปิดบันทึก${dot(f.place, 140, '...........................')}<br>${"." .repeat(100)}<br>${"." .repeat(100)}</p>
<p style="text-align:right">(${dot(f.closeDate, 80, 'วัน เดือน ปี')})</p>
<p class="a5-p-indent">วันนี้ ${dot(f.closeDate, 80)} เวลา${dot(f.closeTime, 60, '..............')}นาฬิกา คณะพนักงานไต่สวน ประกอบด้วย ${dot(f.panelMembers, 300, '(ชื่อ-สกุล เจ้าหน้าที่ ที่ปิดบันทึก)')} ได้ดำเนินการปิดบันทึกการแจ้งข้อกล่าวหา${dot(f.noticeRecordDetails, 200)}</p>
<p>จึงบันทึกไว้เป็นหลักฐาน</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;พนักงาน ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;&nbsp;&nbsp;พยาน</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
</tbody></table>
<p class="a5-letter-note">“ตัวอย่างบันทึกการปิดบันทึกการแจ้งข้อกล่าวหา”</p>
<p class="a5-form-corner">ปปท. 6-44</p></article>`;
  }

  function paperAccusedHearing(f) {
    const qaRows = (f.qa || []).map((row, i) => `<p class="a5-qa-q">ถาม&nbsp;&nbsp;${show(row.q) || "&nbsp;"}</p><p class="a5-qa-a">ตอบ&nbsp;&nbsp;${show(row.a) || "&nbsp;"}</p>`).join("") + '<p class="a5-qa-q">ถาม &nbsp;</p><p class="a5-qa-a">ตอบ &nbsp;</p>';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>บันทึกการให้ถ้อยคำ/ชี้แจงข้อกล่าวหาของผู้ถูกกล่าวหา</strong></p>
<p><strong>เรื่อง</strong>&nbsp;&nbsp;การไต่สวนกรณีกล่าวหา ${dot(f.caseTitle, 400, '(ชื่อ-สกุล และตำแหน่งของผู้ถูกกล่าวหา กระทำความผิดฐาน.......................')}</p>
<table class="a5-table a5-statement-meta"><tbody>
<tr><td style="width:20%">สำนัก (ที่เป็นเจ้าของเรื่อง)</td><td>${dot(f.office, 120)}</td></tr>
<tr><td>เลขที่</td><td>${dot(f.bookNo, 100)}</td></tr>
<tr><td>ถนน</td><td>${dot(f.road, 120)}</td></tr>
<tr><td>ตำบล/แขวง</td><td>${dot(f.subdistrict, 100)}</td></tr>
<tr><td>อำเภอ/เขต</td><td>${dot(f.district, 100)}</td></tr>
<tr><td>จังหวัด</td><td>${dot(f.province, 100)}</td></tr>
<tr><td>วันที่</td><td>${dot(f.recordedAt, 140)}</td></tr>
<tr><td>ผู้ถูกกล่าวหา</td><td>${dot(f.respondentName, 300)}</td></tr>
<tr><td>ผู้บันทึก</td><td>${dot(f.recorderName, 300)}</td></tr>
</tbody></table>
${qaRows}
<table class="a5-signature-table"><tbody>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;ผู้ถูกกล่าวหา</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.&nbsp;&nbsp;ผู้บันทึก/อ่าน</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
</tbody></table>
<p class="a5-form-corner">ปปท. 6-45</p></article>`;
  }

  function paperDossierList(f) {
    const rows = (f.items || []).map((row, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${show(row.document) || "&nbsp;"}</td><td style="text-align:center">${show(row.pages) || "&nbsp;"}</td><td>${show(row.note) || "&nbsp;"}</td></tr>`).join("");
    const blankRows = Array.from({ length: Math.max(10 - (f.items || []).length, 4) }, () => "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>").join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>บัญชีสำนวนการไต่สวน</strong></p>
<p>เรื่องที่ ${dot(f.caseRefNo, 100, '...../...........')}</p>
<p>สำนัก&nbsp;${dot(f.officeName, 140, '(ที่เป็นเจ้าของเรื่อง)')} &nbsp;&nbsp;สำนักงาน ป.ป.ท.</p>
<table class="a5-table"><thead><tr><th style="width:10%">ลำดับที่</th><th style="width:48%">ชนิดของเอกสารหรือหนังสือ</th><th style="width:16%">จำนวนแผ่น (หน้า)</th><th style="width:26%">หมายเหตุ</th></tr></thead>
<tbody>${rows}${blankRows}</tbody></table>
<p class="a5-form-corner">ปปท. 6-47</p></article>`;
  }

  function paperSendDiagnosis(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h3>บันทึกข้อความ</h3>
<p>ส่วนราชการ&nbsp;&nbsp;${dot(f.ownerDivision, 100, 'สำนัก/กอง .....')} &nbsp;&nbsp;โทร. ${dot(f.ownerPhone, 60)}</p>
<p>ที่ ${dot(f.letterNo, 90, 'ปป 00.../...')} &nbsp;&nbsp;&nbsp;&nbsp;วันที่ ${dot(f.issuedAt, 80)}</p>
<p><strong>เรื่อง</strong>&nbsp; ขอส่งรายงานการไต่สวนเพื่อวินิจฉัยชี้มูล เรื่องที่${dot(f.caseRefNo, 80, '........')} (${show(f.caseKind)})</p>
<p><strong>เรียน</strong>&nbsp; ประธานกรรมการ ป.ป.ท. (ผ่านเลขาธิการคณะกรรมการ ป.ป.ท.)</p>
<p><strong>1. เรื่องเดิม (เลือกใส่แล้วแต่กรณี)</strong><br>1.1 คณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot(f.originalOrderNo, 90, '...............................')} ในคดีเรื่องที่ ${dot(f.originalOrderCaseNo, 90, '.................')}<br>1.1 คณะกรรมการ ป.ป.ท. มีมติรับไว้ไต่สวน ในคราวประชุมครั้งที่ ${dot(f.boardMeetingNo, 60, '...............')} เมื่อวันที่ ${dot(f.boardMeetingDate, 90, '......................')} มอบหมายให้เลขาธิการคณะกรรมการฯ ดำเนินการ<br>1.2 เรื่องนี้ สำนักงาน ป.ป.ท. รับเมื่อวันที่ ${dot(f.receivedDate, 80, '..................')} ครบกำหนด 2 ปี วันที่${dot(f.twoYearDeadline, 80, '.................')} มีการขยายระยะเวลา ครั้งที่ ${dot(f.extensionRound, 40, '......')}<br>1.3 เรื่องนี้ได้เสนอรายงานการไต่สวนต่อคณะกรรมการ ป.ป.ท. แล้ว ตามรายงานการไต่สวนฉบับลงวันที่ ${dot(f.priorReportDate, 90, '...............')} คณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเพิ่มเติม ${show(f.priorBoardResolution)}<br>1.4 อายุความ ${show(f.limitationLawSection)}</p>
<p><strong>2. ข้อเท็จจริง</strong><br>${show(f.inquiryProcessSummary) || ".".repeat(130)}</p>
<p><strong>2.1 ข้อกล่าวหาของผู้ร้องเรียน/กล่าวหา (แยกรายประเด็น รายผู้ถูกกล่าวหา)</strong><br>1) ทางอาญา<br>${show(f.allegedFactsCriminal) || ".".repeat(120)}<br>2) ทางวินัย<br>${show(f.allegedFactsDisciplinary) || ".".repeat(120)}</p>
<p><strong>2.2 ความเห็นของคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน</strong><br>1) ทางอาญา<br>${show(f.opinionCriminal) || ".".repeat(120)}<br>2) ทางวินัย<br>${show(f.opinionDisciplinary) || ".".repeat(120)}</p>
<p><strong>3. ข้อพิจารณา/ข้อเสนอ</strong><br>${show(f.considerations) || ".".repeat(130)}</p>
<p style="text-align:left;margin-top:1em">จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>(${dot(f.ownerSignerName || f.signerName || f.ownerName, 120, '.......................................')})<br>(อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.เจ้าของสำนวน)</p>
<p class="a5-form-corner">ปปท. 7-01</p></article>`;
  }

  function deponentTable(f) {
    const d = object(f.deponent); const reg = object(d.registryAddress), cur = object(d.currentAddress);
    return `<table class="a5-table a5-statement-meta"><tbody>
<tr><td style="width:20%">สำนัก (เจ้าของเรื่อง)</td><td>${dot(f.office, 100)}</td></tr>
<tr><td>เลขที่</td><td>${dot(f.bookNo, 80)}</td></tr>
<tr><td>ถนน</td><td>${dot(f.road, 120)}</td></tr>
<tr><td>ตำบล/แขวง</td><td>${dot(f.subdistrict, 100)}</td></tr>
<tr><td>อำเภอ/เขต</td><td>${dot(f.district, 100)}</td></tr>
<tr><td>จังหวัด</td><td>${dot(f.province, 100)}</td></tr>
<tr><td>วันที่</td><td>${dot(f.recordedAt, 140)}</td></tr>
<tr><td>ชื่อผู้ถูกกล่าวหา</td><td>${dot(f.respondentName, 280)}</td></tr>
<tr><td>สถานที่บันทึก</td><td>${show(f.place) || "&nbsp;"}${f.specialNote ? `<br><small>${escapeHtml(f.specialNote)}</small>` : ""}</td></tr>
<tr><td>ต่อหน้า</td><td>${dot(f.recorderName, 260)}</td></tr>
</tbody></table>
<table class="a5-table a5-statement-deponent"><tbody>
<tr><td style="width:34%">ชื่อผู้ให้ถ้อยคำ</td><td>${dot(d.name, 200)}&nbsp;&nbsp;<strong>เป็น</strong> ${dot(d.role, 60)}</td></tr>
<tr><td>อายุ</td><td>${dot(d.age, 50)} ปี &nbsp; เชื้อชาติ ${dot(d.race, 60)} &nbsp; สัญชาติ ${dot(d.nationality, 60)} &nbsp; ศาสนา ${dot(d.religion, 60)}</td></tr>
<tr><td>อาชีพ</td><td>${dot(d.occupation, 150)}</td></tr>
<tr><td>หมายเลขบัตรประจำตัวประชาชน</td><td>${dot(d.idCard, 160)}</td></tr>
<tr><td>บิดาชื่อ</td><td>${dot(d.fatherName, 140)}</td></tr>
<tr><td>มารดาชื่อ</td><td>${dot(d.motherName, 140)}</td></tr>
<tr><td>ภูมิลำเนาตามทะเบียนบ้าน</td><td>เลขที่ ${dot(reg.houseNo, 40)} ซอย ${dot(reg.soi, 40)} ถนน ${dot(reg.road, 60)} ตำบล/แขวง ${dot(reg.subdistrict, 60)} อำเภอ/เขต ${dot(reg.district, 60)} จังหวัด ${dot(reg.province, 60)}</td></tr>
<tr><td>ที่อยู่ปัจจุบัน</td><td>เลขที่ ${dot(cur.houseNo, 40)} ซอย ${dot(cur.soi, 40)} ถนน ${dot(cur.road, 60)} ตำบล/แขวง ${dot(cur.subdistrict, 60)} อำเภอ/เขต ${dot(cur.district, 60)} จังหวัด ${dot(cur.province, 60)}</td></tr>
<tr><td>โทรศัพท์</td><td>${dot(d.phone, 120)}</td></tr>
</tbody></table>`;
  }

  function statementPaper(f, code, titleText, extraHead = "") {
    const qaRows = (f.qa || []).map((row, i) => `<p class="a5-qa-q">ถาม&nbsp;&nbsp;${show(row.q) || "&nbsp;"}</p><p class="a5-qa-a">ตอบ&nbsp;&nbsp;${show(row.a) || "&nbsp;"}</p>`).join("") + '<p class="a5-qa-q">ถาม &nbsp;</p><p class="a5-qa-a">ตอบ &nbsp;</p>';
    const docs = show(f.documentsSubmitted) || "๑. &nbsp;<br>๒. &nbsp;";
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>บันทึกคำให้การ/ถ้อยคำของผู้กล่าวหาหรือพยาน${titleText ? ` ${escapeHtml(titleText)}` : ""}</strong></p>
${extraHead}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;การไต่สวนกรณีกล่าวหา &nbsp;${dot(f.caseTitle, 380, '(ให้นำถ้อยคำในคำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน มาใส่)')}</p>
${deponentTable(f)}
${(f.interpreterName !== undefined || f.interpreterAgency !== undefined || f.interpreterLabel) ? `<p>${escapeHtml(f.interpreterLabel || "ล่าม")}: ${dot(f.interpreterName, 160)} &nbsp;(หน่วยงาน ${dot(f.interpreterAgency, 120)})</p>` : ""}
<p class="a5-p-indent">${code === "ปปท. 6-11" ? "ข้าฯ ได้รับแจ้งจาก (ระบุชื่อ-สกุล ของคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน) และคณะว่า ข้าฯ มีสิทธิที่จะร้องขอให้มีนักจิตวิทยาหรือนักสังคมสงเคราะห์ บุคคลที่ข้าฯ ร้องขอ และพนักงานอัยการ เข้าร่วมในการถามปากคำได้ และผู้สอบปากคำเป็นเจ้าพนักงานตามประมวลกฎหมายอาญา" : "ข้าฯ ได้รับแจ้งจากคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ผู้สอบปากคำว่าเป็นเจ้าพนักงานตามประมวลกฎหมายอาญา"} และการให้ถ้อยคำอันเป็นเท็จเป็นความผิดตามกฎหมาย ซึ่งอาจได้รับโทษจำคุกหรือปรับหรือทั้งจำทั้งปรับ ข้าฯ ได้รับทราบและเข้าใจแล้ว จึงขอให้ถ้อยคำด้วยความสมัครใจตามความสัตย์จริง ดังต่อไปนี้</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านมีภูมิลำเนาและพักอาศัยอยู่ที่ใด มีอาชีพอะไร</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;ข้าฯ มีภูมิลำเนาและพักอาศัยอยู่ตามบ้านเลขที่ดังกล่าวข้างต้น ปัจจุบันข้าฯ มีอาชีพ/ตำแหน่ง&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านมีอำนาจหน้าที่อย่างไร และเกี่ยวข้องกับเรื่องนี้อย่างไร</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านประสงค์จะร้องเรียนกล่าวหาเจ้าหน้าที่ของรัฐบุคคลใด อย่างไร (ระบุชื่อ-สกุล ตำแหน่ง และอำนาจหน้าที่ของผู้ถูกร้องเรียน)</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;พฤติการณ์ที่ร้องเรียนกล่าวหาเป็นอย่างไร</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านมีพยานหลักฐานใดที่จะพิสูจน์การกระทำความผิดของผู้ถูกกล่าวหาในคดีนี้</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
${qaRows}
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านเคยร้องเรียนกล่าวหาในประเด็นดังกล่าวข้างต้นต่อหน่วยงานของรัฐอื่นใด หรือไม่ อย่างไร และผลการดำเนินการกรณีดังกล่าวเป็นอย่างไร</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านได้มอบเอกสารอะไรให้ผู้บันทึกบ้าง</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;${docs}</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;ท่านเคยมีสาเหตุโกรธเคืองกับผู้ใดในคดีนี้มาก่อนหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;</p>
<p class="a5-qa-q">ถาม&nbsp;&nbsp;คำให้การข้างต้น ผู้บันทึกได้อ่านให้ฟัง/ข้าฯ ได้อ่านเองแล้วถูกต้องและเป็นความจริงหรือไม่</p>
<p class="a5-qa-a">ตอบ&nbsp;&nbsp;เป็นความจริง อ่านให้ฟังแล้ว/ได้อ่านเองแล้วรับว่าถูกต้อง</p>
<p class="a5-p-indent">ข้าฯ ขอรับรองว่า พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. มิได้ทำหรือจัดให้ทำการใด ๆ ซึ่งเป็นการล่อลวงหรือขู่เข็ญหรือให้สัญญาเพื่อจูงใจให้ข้าฯ ให้ถ้อยคำอย่างใด ๆ และข้าฯ ได้อ่านคำให้การแล้ว/เจ้าหน้าที่ได้อ่านคำให้การให้ข้าฯ ฟังแล้ว ขอรับรองว่าถูกต้องตามที่ให้ถ้อยคำไว้ จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>
<table class="a5-signature-table"><tbody>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;ผู้ให้ถ้อยคำ/ผู้กล่าวหา/พยาน</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>(ลงชื่อ)&nbsp;&nbsp;พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.&nbsp;&nbsp;ผู้บันทึก/อ่าน</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
</tbody></table>
<p class="a5-form-corner">${code}</p></article>`;
  }

  function committeeLetterPaper(f, code, subjectLine, bodyHtml) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
<div class="a5-letter-head-row">
  <div class="a5-letter-head-left"><p class="a5-letter-no">ที่ ${dot(f.letterNo, 90, 'ปท ๐๐..../....')}</p></div>
  <div class="a5-letter-head-center"><img class="a5-garuda" src="${garuda()}" alt="ตราครุฑ" width="50" height="54"></div>
  <div class="a5-letter-head-right"><p class="a5-letter-org">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p></div>
</div>
<div class="a5-letter-date-row"><p>(วัน เดือน ปี)</p></div>
${subjectLine}
${bodyHtml}
<p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}
<p class="a5-form-corner">${code}</p></article>`;
  }

  function evidenceTablePaper(f, code, titleText, colHeads, rowRender) {
    const rows = (f.items || []).map((row, i) => `<tr><td style="text-align:center">${i + 1}</td>${rowRender(row)}</tr>`).join("");
    const blankRows = Array.from({ length: Math.max(8 - (f.items || []).length, 4) }, () => "<tr>" + colHeads.map(() => "<td>&nbsp;</td>").join("") + "</tr>").join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>บัญชี${escapeHtml(titleText)}${titleText === "ของกลาง" ? `ลำดับที่ ${dot(f.ledgerNo, 50, '..................')}` : ""}</strong></p>
<p>${titleText === "ของกลาง" ? "" : "บัญชีลำดับที่ " + dot(f.ledgerNo, 80)} (ตามสารบบคุมของกลางของสำนัก/กอง)</p>
<p>เรื่องที่ ${dot(f.caseTitle, 200)}</p>
<p>สำนัก/กอง ${dot(f.ownerDivision, 140)} &nbsp;(ที่เป็นเจ้าของเรื่อง)</p>
<p>ผู้กล่าวหา&nbsp;&nbsp;${dot(f.complainant, 160)}<br>ผู้ถูกกล่าวหา&nbsp;&nbsp;${dot(f.respondent, 160)}<br>ข้อหา/ฐานความผิด&nbsp;&nbsp;${f.chargeNote ? escapeHtml(f.chargeNote) : ".".repeat(100)}</p>
<table class="a5-table"><thead><tr><th style="width:8%">ลำดับที่</th>${colHeads.map(h => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows}${blankRows}</tbody></table>
${code === "ปปท. 6-20" ? '<p>รวมจำนวน &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ราคา/บาท</p>' : ""}
<p class="a5-form-corner">${code}</p></article>`;
  }

  function mapPaper(f, code, isWarrant) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center">แผนที่สังเขป${isWarrant ? " ประกอบการขอหมายค้น" : ""}</h2>
<p>เรื่องที่ ${dot(f.caseTitle, 200)}</p>
<p>ผู้กล่าวหา&nbsp;&nbsp;${dot(f.complainant, 180)}<br>ผู้ถูกกล่าวหา&nbsp;&nbsp;${dot(f.respondent, 180)}</p>
<p>วันเวลาและสถานที่เกิดเหตุ&nbsp;&nbsp;${dot(f.incidentWhenWhere, 260)}</p>
<p>วันที่จัดทำแผนที่สังเขป&nbsp;&nbsp;${dot(f.mapCreatedDate, 120)}</p>
<p style="text-align:center;border:2px solid #333;padding:3em 1em;margin:1em 0"><strong>N</strong><br>ภาพแผนที่สังเขป<br>(แนบ/วาดภาพประกอบ)</p>
<p><strong>คำอธิบายแผนที่</strong>${isWarrant ? " (ให้อธิบายจุดที่จะขอหมายค้นบ้าน/ห้องใกล้เคียงที่จะแสดงที่ตั้งให้เห็นชัดเจน)" : ""}</p>
<p class="a5-p-indent">${show(f.mapDescription) || ".".repeat(120)}</p>
<p><strong>ขอรับรองว่า แผนที่สังเขปที่ได้จัดทำขึ้นนี้ถูกต้องตรงกับความเป็นจริงทุกประการ</strong>&nbsp; คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน/พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;ผู้กล่าวหา<br>(${dot(f.signerComplainant, 80)})</td>
<td>ลงชื่อ&nbsp;&nbsp;ผู้ถูกกล่าวหา<br>(${dot(f.signerRespondent, 80)})</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;พยาน<br>(${dot(f.signerWitness, 80)})</td>
<td>ลงชื่อ&nbsp;&nbsp;ผู้จัดทำ<br>(${dot(f.signerInvestigator, 80)})</td></tr>
</tbody></table>
<p class="a5-form-corner">${code}</p></article>`;
  }

  function photoPaper(f, code, titleText, whenLabel) {
    const rows = (f.photos || []).map((row, i) => `<p style="text-align:center"><strong>N — ภาพถ่ายภาพที่ ${i + 1}</strong></p><p><strong>คำอธิบายภาพถ่าย:</strong> ${show(row.description) || "&nbsp;"}</p>`).join("");
    const blankPhotos = Array.from({ length: Math.max(4 - (f.photos || []).length, 2) }, () => '<p style="text-align:center"><strong>N — ภาพถ่ายภาพที่ .....</strong></p><p>คำอธิบายภาพถ่าย: &nbsp;</p>').join("");
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>${escapeHtml(titleText)}</strong></p>
<p>เรื่องที่ ${dot(f.caseTitle, 200)}</p>
<p>สำนัก/กอง ${dot(f.ownerDivision, 140)} &nbsp;(ที่เป็นเจ้าของเรื่อง)</p>
<p>ผู้กล่าวหา&nbsp;&nbsp;${dot(f.complainant, 160)}<br>ผู้ถูกกล่าวหา&nbsp;&nbsp;${dot(f.respondent, 160)}</p>
<p>วันเวลาและสถานที่เกิดเหตุ&nbsp;&nbsp;${dot(f.incidentWhenWhere, 240)}</p>
<p>${whenLabel}&nbsp;&nbsp;${dot(whenLabel === "วันเวลาที่ถ่ายภาพ" ? f.photoTakenWhen : f.photoWhen, 160)}</p>
${rows}${blankPhotos}
${code === "ปปท. 6-24" ? `<p>ลงชื่อ&nbsp; คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน/<br>(${dot(f.recorderName, 120)})&nbsp; พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.<br>ผู้บันทึก/จัดทำ</p>
<p class="a5-letter-note">หมายเหตุ &nbsp;กรณีนำภาพถ่ายมาติดให้ลงชื่อกำกับภาพถ่ายไว้ด้วย</p>` : ""}
<p class="a5-form-corner">${code}</p></article>`;
  }

  function lineupPaper(f, code, titleText) {
    const kind = show(f.committeeKind) || 'คณะพนักงานไต่สวน';
    const authority = kind === 'คณะอนุกรรมการไต่สวน' ? 'คณะกรรมการ ป.ป.ท.' : 'สำนักงาน ป.ป.ท.';
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center">${escapeHtml(titleText)}</h2>
<p style="text-align:right">ที่ สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p>
<p style="text-align:right">(วัน เดือน ปี) ${dot(f.recordDate, 80)}</p>
<p class="a5-p-indent">วันที่ ${dot(f.recordDate, 70)} &nbsp;&nbsp;เวลา ${dot(f.recordTime, 50)} น. &nbsp;${kind} ตามคำสั่ง ${authority} ที่ ${dot(f.orderNo, 90)} ได้ดำเนินการ</p>
<p class="a5-p-indent">${titleText === "บันทึกการยินยอมให้ชี้ตัวผู้ถูกกล่าวหา" ? "จัดให้ชี้ตัว" : "ชี้ภาพถ่าย"}ผู้ถูกกล่าวหา ${dot(f.accusedName, 160)} โดยมีรายละเอียด ${show(f.lineupDetail) || "&nbsp;"}</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;ประธานอนุกรรมการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(${dot(f.signerChair, 80)})</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;อนุกรรมการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(${dot(f.signerMember, 80)})</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(${dot(f.signerSecretary, 80)})</td></tr>
</tbody></table>
<p class="a5-form-corner">${code}</p></article>`;
  }

  function sceneGuidePaper(f) {
    return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h2 style="text-align:center">บันทึกนำชี้สถานที่ประกอบการให้ถ้อยคำ</h2>
<p>(วัน เดือน ปี) ${dot(f.guideWhen.split(" ")[0] || "", 60)}</p>
<p>เรื่องที่ ${dot(f.caseTitle, 180)}</p>
<p>ผู้กล่าวหา&nbsp;&nbsp;${dot(f.complainant, 150)}<br>ผู้ถูกกล่าวหา&nbsp;&nbsp;${dot(f.respondent, 150)}</p>
<p>วันเวลาและสถานที่เกิดเหตุ&nbsp;&nbsp;${dot(f.incidentWhenWhere, 220)}</p>
<p>วันเวลาที่นำชี้สถานที่&nbsp;&nbsp;${dot(f.guideWhen, 140)}</p>
<p class="a5-p-indent">${show(f.committeeKind)} ประกอบด้วย ${dot(f.panelMembers, 250, '(ให้ระบุชื่อ-สกุล ตำแหน่ง)')}<br>ได้จัดให้ ${dot(f.guidedPersonName, 180, '(ระบุชื่อ–สกุล ตำแหน่ง ของผู้นำชี้)')}${f.guidedPersonPosition ? " " + escapeHtml(f.guidedPersonPosition) : ""}<br>นำไปชี้สถานที่ประกอบคำให้การที่ ${dot(f.guideLocationDetail, 300, '(ระบุสถานที่และพฤติการณ์ที่เกี่ยวข้องตามคำให้ถ้อยคำ)')}</p>
<p class="a5-p-indent">ปรากฏผลการนำไปชี้สถานที่ตามคำให้การตามลำดับ ดังนี้ คือ</p>
<p>${show(f.guideResults) || "&nbsp;".repeat(10)}</p>
<table class="a5-signature-table"><tbody>
<tr><td>ลงชื่อ&nbsp;&nbsp;ประธานอนุกรรมการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;อนุกรรมการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
<tr><td>ลงชื่อ&nbsp;&nbsp;อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท.</td></tr><tr><td>(&nbsp;&nbsp;&nbsp;&nbsp;)</td></tr>
</tbody></table>
<p class="a5-form-corner">ปปท. 6-28</p></article>`;
  }

  function forensicCoopPaper(f) {
    const atts = [0,1,2].map(i => `<p>${["๑","๒","๓"][i]}.&nbsp; ${show(f.attachments?.[i]) || "&nbsp;"}</p>`).join("");
    const items = [0,1,2].map(i => `<p>${["๑","๒","๓"][i]}.&nbsp; ${show(f.items?.[i]) || "&nbsp;"}</p>`).join("");
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอความอนุเคราะห์ในการตรวจพิสูจน์</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 280, "(หน่วยงานตรวจพิสูจน์)")}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;${atts}</p>
<p class="a5-p-indent">ด้วยคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท./สำนักงาน ป.ป.ท. ที่ ${dot(f.orderNo, 90, '........')} ลงวันที่ ${dot(f.orderDate, 110, '............')} มีกรณีจำเป็นต้องขอให้ ${dot(f.forensicTarget, 180, '......................')}</p>
<p>ขอตรวจพิสูจน์ ดังนี้</p>
${items}
<p class="a5-p-indent">จึงเรียนขอความอนุเคราะห์มาเพื่อตรวจพิสูจน์ดังกล่าว โดยคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้มอบหมายให้ ${dot(f.coordinatorName, 160)} เป็นผู้ประสานงานโดยตรง ติดต่อได้ที่ ${dot(f.coordinatorPhone, 100)}</p>
<p>ขอแสดงความนับถือ</p>
<p>(${dot(f.signerName, 160, '.....................................................')})</p>
<p class="a5-form-corner">ปปท. 6-30</p></article>`;
  }

  function forensicExpertPaper(f) {
    return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอความอนุเคราะห์</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeName, 280, "(หน่วยงาน)")}</p>
<p class="a5-p-indent">ด้วยคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท./สำนักงาน ป.ป.ท. ที่ ${dot(f.orderNo, 90, '........')} ลงวันที่ ${dot(f.orderDate, 110, '............')} มีกรณีจำเป็นต้องตรวจสอบ ${dot(f.inspectionTarget, 320, '..........................................................')}</p>
<p class="a5-p-indent">จึงเรียนขอความอนุเคราะห์มา เพื่อโปรดมอบหมายให้เจ้าหน้าที่ผู้เชี่ยวชาญด้าน ${dot(f.expertiseField, 180, '................')} ไปดำเนินการตรวจสอบพร้อมกับทำความเห็นเกี่ยวกับผลการตรวจสอบ</p>
<p>ขอแสดงความนับถือ</p>
${committeeSignBlock(f)}
<p style="margin-top:.8em">(ระบุชื่อ-สกุลของอนุกรรมการและเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)&nbsp;&nbsp;${dot(f.ownerName, 100)}</p>
<p class="a5-letter-note">“ตัวอย่างหนังสือขอความอนุเคราะห์ผู้เชี่ยวชาญตรวจพิสูจน์”</p>
<p class="a5-form-corner">ปปท. 6-31</p></article>`;
  }

  function renderInquiryPaperByDocId(formId, fields = {}) {
    const f = object(fields);
    if (formId === DOC_IDS.CASE_COVER) return paperCaseCover(f);
    if (formId === DOC_IDS.WORK_LOG) return paperWorkLog(f);
    if (formId === DOC_IDS.INVITE_ACCUSED) return paperInviteAccused(f);
    if (formId === DOC_IDS.INVITE_WITNESS) return paperInviteWitness(f);
    if (formId === DOC_IDS.WITNESS_TRACK_FAIL) return paperWitnessTrackFail(f);
    if (formId === DOC_IDS.WITNESS_WRITTEN) return paperWrittenStatementRequest(f);
    if (formId === DOC_IDS.AGENCY_DOCS) return paperAgencyDocs(f);
    if (formId === DOC_IDS.AGENCY_CLARIFY) return paperAgencyClarify(f);
    if (formId === DOC_IDS.AGENCY_OFFICER) return paperAgencyOfficer(f);
    if (formId === DOC_IDS.ADD_ACCUSED) return paperAddAccused(f);
    if (formId === DOC_IDS.PROTECT_WITNESS) return paperProtectWitness(f);
    if (formId === DOC_IDS.ADDL_ALLEGATION) return paperAddlAllegation(f);
    if (formId === DOC_IDS.ACK_RESULT) return paperAckResult(f);
    if (formId === DOC_IDS.CLOSE_NOTICE) return paperCloseNotice(f);
    if (formId === DOC_IDS.ACCUSED_HEARING) return paperAccusedHearing(f);
    if (formId === DOC_IDS.DOSSIER_LIST) return paperDossierList(f);
    if (formId === DOC_IDS.EVIDENCE_LEDGER) return evidenceTablePaper(f, "ปปท. 6-19", "ของกลาง", ["รายการ","จำนวน","ราคา (บาท)","ยึดจากใคร","วัน/เดือน/ปี ที่ยึด","หมายเหตุ"], row => `<td>${show(row.item) || "&nbsp;"}</td><td style="text-align:center">${show(row.qty) || "&nbsp;"}</td><td style="text-align:center">${show(row.price) || "&nbsp;"}</td><td>${show(row.seizedFrom) || "&nbsp;"}</td><td>${show(row.dateSeized) || "&nbsp;"}</td><td>${show(row.note) || "&nbsp;"}</td>`);
    if (formId === DOC_IDS.EVIDENCE_RETURNED) return evidenceTablePaper(f, "ปปท. 6-20", "ของกลางที่ถูกประทุษร้ายได้คืน", ["รายการ","จำนวน","ราคา (บาท)","วัน/เดือน/ปี ถูกประทุษร้าย","วัน/เดือน/ปี ที่ได้คืน"], row => `<td>${show(row.item) || "&nbsp;"}</td><td style="text-align:center">${show(row.qty) || "&nbsp;"}</td><td style="text-align:center">${show(row.price) || "&nbsp;"}</td><td>${show(row.dateDamaged) || "&nbsp;"}</td><td>${show(row.dateReturned) || "&nbsp;"}</td>`);
    if (formId === DOC_IDS.EVIDENCE_BURNED) return evidenceTablePaper(f, "ปปท. 6-21", "ทรัพย์ที่ถูกเพลิงไหม้", ["รายการ","จำนวน","ราคา (บาท)","ของใคร","วัน เดือน ปี ที่ถูกเพลิงไหม้","หมายเหตุ"], row => `<td>${show(row.item) || "&nbsp;"}</td><td style="text-align:center">${show(row.qty) || "&nbsp;"}</td><td style="text-align:center">${show(row.price) || "&nbsp;"}</td><td>${show(row.ownerNote) || "&nbsp;"}</td><td>${show(row.dateBurned) || "&nbsp;"}</td><td>${show(row.note) || "&nbsp;"}</td>`);
    if (formId === DOC_IDS.MAP_SKETCH) return mapPaper(f, "ปปท. 6-22", false);
    if (formId === DOC_IDS.MAP_WARRANT) return mapPaper(f, "ปปท. 6-23", true);
    if (formId === DOC_IDS.PHOTO_APPENDIX) return photoPaper(f, "ปปท. 6-24", "ภาพถ่ายประกอบสำนวน", "วันเวลาที่ถ่ายภาพ");
    if (formId === DOC_IDS.LINEUP_CONSENT) return lineupPaper(f, "ปปท. 6-25", "บันทึกการยินยอมให้ชี้ตัวผู้ถูกกล่าวหา");
    if (formId === DOC_IDS.PHOTO_LINEUP) return lineupPaper(f, "ปปท. 6-27", "บันทึกการชี้ภาพถ่ายผู้ถูกกล่าวหา");
    if (formId === DOC_IDS.SCENE_GUIDE) return sceneGuidePaper(f);
    if (formId === DOC_IDS.SCENE_PHOTOS) return photoPaper(f, "ปปท. 6-29", "ภาพถ่ายนำชี้ที่เกิดเหตุประกอบการให้ถ้อยคำ", "วันเวลาที่นำชี้และถ่ายภาพ");
    if (formId === DOC_IDS.FORENSIC_COOP) return forensicCoopPaper(f);
    if (formId === DOC_IDS.FORENSIC_EXPERT) return forensicExpertPaper(f);
    if (formId === DOC_IDS.SEND_DIAGNOSIS) return paperSendDiagnosis(f);
    if ([DOC_IDS.STATEMENT_GENERAL, DOC_IDS.STATEMENT_CHILD, DOC_IDS.STATEMENT_DEAF, DOC_IDS.STATEMENT_DEAF_WRITE, DOC_IDS.STATEMENT_FOREIGN].includes(formId)) {
      const titles = { [DOC_IDS.STATEMENT_CHILD]: "ที่เป็นเด็ก", [DOC_IDS.STATEMENT_FOREIGN]: "ที่เป็นชาวต่างประเทศ" };
      const extra = formId === DOC_IDS.STATEMENT_CHILD ? `<p class="ws-policy-note" style="text-align:center">(${escapeHtml(f.specialNote || "สถานที่ที่เหมาะสมสำหรับเด็กที่จัดไว้เป็นการเฉพาะ")})</p>` : "";
      return statementPaper(f, meta_code_of(formId), titles[formId] || "", extra);
    }
    if (formId === DOC_IDS.CHILD_EXAMINER) return committeeLetterPaper(f, "ปปท. 6-15", `<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอเชิญเข้าร่วมสอบปากคำเด็กในฐานะผู้กล่าวหา/พยาน/ผู้ถูกกล่าวหา</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 300, 'อัยการ (พื้นที่ที่รับผิดชอบ)/พัฒนาสังคมและความมั่นคงของมนุษย์จังหวัด')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 260, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 90, '..........')} ณ ${dot(f.incidentWhere, 140, '..........')}</p>
<p class="a5-p-indent">เนื่องจากในการดำเนินการตามคำสั่งดังกล่าวมีความจำเป็นจะต้องถามปากคำเด็กซึ่งมีอายุ ${dot(f.childAge, 40, '......')} ปี ในฐานะเป็น ${dot(f.childRole, 120, '(ผู้กล่าวหาหรือพยานหรือผู้ถูกกล่าวหา)')}</p>`, { signerName: f.signerName });
    if (formId === DOC_IDS.LAWYER_NOTICE) return committeeLetterPaper(f, "ปปท. 6-16", `<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอความอนุเคราะห์มอบหมายทนายความเข้าฟังการสอบปากคำผู้ถูกกล่าวหา</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 300, 'ประธานทนายความ (ตามพื้นที่รับผิดชอบ)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 260, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 90, '..........')} ณ ${dot(f.incidentWhere, 140, '..........')}</p>
<p class="a5-p-indent">เนื่องจากในการดำเนินการตามคำสั่งดังกล่าวมีความจำเป็นจะต้องสอบปากคำผู้ถูกกล่าวหา จำนวน ${dot(f.accusedCount, 30, '....')} คน ดังนั้น เพื่อปฏิบัติตามประมวลกฎหมายวิธีพิจารณาความอาญา</p>`, {});
    if (formId === DOC_IDS.EARLY_EVIDENCE) return committeeLetterPaper(f, "ปปท. 6-17", `<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้ศาลมีคำสั่งสืบพยานบุคคลไว้ก่อน</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 240, 'อัยการ (พื้นที่ที่รับผิดชอบ)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้มีมติให้ไต่สวนเจ้าหน้าที่ของรัฐ ถูกกล่าวหาว่ากระทำการทุจริตในภาครัฐ กรณี ${dot(f.caseSubject, 260, '(ให้ระบุเรื่องที่ไต่สวน)')} เหตุเกิดเมื่อ ${dot(f.incidentWhen, 90, '..........')} ณ ${dot(f.incidentWhere, 140, '..........')}</p>
<p class="a5-p-indent">ข้อเท็จจริงปรากฏว่า ${dot(f.witnessName, 200, '(ระบุชื่อ-สกุลของพยาน)')} — ${dot(f.witnessReason, 320, '(เหตุผลและความจำเป็นที่ต้องสืบพยานไว้ก่อนตาม พ.ร.บ.วิธีพิจารณาคดีทุจริตฯ)')}</p>
<p class="a5-p-indent">คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวนได้ส่งหลักฐานการไต่สวนมายังพนักงานอัยการพร้อมกับคำร้องนี้ ${show(f.evidenceSentNote)}</p>
<p class="a5-p-indent">จึงเรียนมาเพื่อโปรดให้พนักงานอัยการพิจารณาดำเนินการตามประมวลกฎหมายวิธีพิจารณาความอาญา มาตรา ๒๓๗ ทวิ ต่อไป</p>`, {});
    if (formId === DOC_IDS.SUSPEND_DUTY) return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอให้สั่งเจ้าหน้าที่ของรัฐหยุดปฏิบัติหน้าที่เป็นการชั่วคราว</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 260, '(ผู้บังคับบัญชาของผู้ถูกกล่าวหา)')}</p>
<p class="a5-p-indent">ด้วยคณะกรรมการ ป.ป.ท. ได้ดำเนินการไต่สวนโดยการแต่งตั้ง${show(f.committeeKind)} แสวงหาข้อมูลและรวบรวมพยานหลักฐาน กรณี ${dot(f.respondentSummary, 340, '(กรณีที่ไต่สวน)')}</p>
<p class="a5-p-indent">คณะกรรมการ ป.ป.ท. ในคราวประชุม ครั้งที่${dot(f.boardMeetingNo, 60, '................')}เมื่อวันที่${dot(f.boardMeetingDate, 100, '.....................................')} ได้พิจารณาแล้วมีมติว่า ${dot(f.boardResolution, 160, '......................')}</p>
<p>จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการในส่วนที่เกี่ยวข้องต่อไป</p>
<p>ขอแสดงความนับถือ</p>
<p style="text-align:left;margin-top:1.2em">(${dot(f.signerName, 160, '.....................................................')})<br>ประธานกรรมการ ป.ป.ท.</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)<br>โทร. ${dot(f.ownerPhone, 60)}<br>โทรสาร ${dot(f.ownerFax, 60)}</p>
<p class="a5-form-corner">ปปท. 6-18</p></article>`;
    if (formId === DOC_IDS.DATA_ACCESS_REQUEST || formId === DOC_IDS.DATA_UTILIZATION) {
      const isUtil = formId === DOC_IDS.DATA_UTILIZATION;
      const items = isUtil
        ? `<p>๓.&nbsp; วัตถุประสงค์ เหตุผลและความจำเป็นที่จะขอใช้ประโยชน์ ${dot(f.purposeReason, 200, '')}</p>
<p>๔.&nbsp; ประเภทของข้อมูลที่จะใช้ประโยชน์ ${dot(f.dataType, 200)}</p>
<p>๕.&nbsp; ลักษณะและระยะเวลาที่จะใช้ประโยชน์ ${dot(f.usagePeriod, 200)}</p>
<p>๖.&nbsp; รายละเอียดในการส่งข้อมูลคืน ${dot(f.returnDataDetails, 200)}</p>`
        : `<p>๔.&nbsp; เหตุผล ความจำเป็นที่ต้องเข้าถึงข้อมูล และเหตุผลที่ทำให้เชื่อว่าจะได้ข้อมูล ${dot(f.necessityReason, 180)}</p>
<p>๕.&nbsp; วันเดือนปี และระยะเวลาที่จะดำเนินการเข้าถึงข้อมูล ${dot(f.accessPeriod, 180)}</p>
<p>๖.&nbsp; บัญชีเครื่องมือหรืออุปกรณ์ และวิธีการเข้าถึงข้อมูล ${dot(f.toolsAndMethods, 180)}</p>
<p>๗.&nbsp; สถานที่และวิธีการเข้าถึงในสิ่งสื่อสารที่ต้องการ ${dot(f.communicationPlaceMethod, 180)}</p>`;
      return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h3 style="text-align:center">${isUtil ? "คำขอใช้ประโยชน์ข้อมูลของหน่วยงาน" : "คำขออนุมัติเข้าถึงข้อมูลของหน่วยงาน"}</h3>
<p style="text-align:right">(${dot(f.issuedAt, 80, 'วัน เดือน ปี')})</p>
<p><strong>เรื่อง</strong>&nbsp; ${isUtil ? "ขอใช้ประโยชน์ข้อมูลหน่วยงาน" : "ขออนุมัติเข้าถึงข้อมูลหน่วยงาน"}</p>
<p><strong>เรียน</strong>&nbsp; ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<p class="a5-p-indent">ด้วย ${dot(f.requesterLabel, 220)} มีเหตุผล ความจำเป็น${isUtil ? "ที่ต้องขอใช้ประโยชน์ข้อมูลของหน่วยงาน ซึ่งได้มาตามมาตรา ๑๙ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ.๒๕๕๑" : "ที่ต้องดำเนินการเข้าถึงข้อมูลของหน่วยงาน"} ดังนี้</p>
<p>๑.&nbsp; ชื่อหน่วยงานที่ครอบครองข้อมูล${dot(f.agencyHoldingName, 140, '..............................................................')}ที่ตั้งเลขที่ ${dot("", 40, '......................')}ถนน${dot(f.agencyAddressRoad, 60)} ต.${dot(f.agencyAddressSubdistrict, 50)} อ.${dot(f.agencyAddressDistrict, 50)} จ.${dot(f.agencyAddressProvince, 50)}</p>
<p>๒.&nbsp; ชื่อ-สกุล ผู้ถูกเข้าถึงข้อมูล${dot(f.dataSubjectName, 130, '…………………………………………………..')}ตำแหน่ง${dot(f.dataSubjectPosition, 70, '......................')} สังกัด${dot(f.dataSubjectAffiliation, 90, '..............................................')}</p>
<p>( ${f.dataSubjectKind === "ผู้ถูกกล่าวหา" ? "✔" : " "} ) ผู้ถูกกล่าวหา<br>( ${f.dataSubjectKind !== "ผู้ถูกกล่าวหา" ? "✔" : " "} ) บุคคลอื่นที่มีเหตุอันควรเชื่อได้ว่าจะเกี่ยวข้องในเรื่องที่กล่าวหา</p>
<p>๓.&nbsp; รายละเอียดเกี่ยวกับข้อเท็จจริงและพฤติการณ์ที่เกี่ยวข้องกับการกระทำผิดของผู้ถูกเข้าถึงข้อมูล<br>${dot(f.factsDetail, 400, '....................................................................................................................................')}</p>
${items}
<p class="a5-form-corner">${formId === DOC_IDS.DATA_ACCESS_REQUEST ? "ปปท. 6-32" : "ปปท. 6-36"}</p></article>`;
    }
    if (formId === DOC_IDS.DATA_ACCESS_ORDER) return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<h3 style="text-align:center">คำสั่งคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</h3>
<p>ที่ ${dot(f.orderNo, 60, '.......')}/${dot(f.orderYear, 40, '....')}</p>
<p><strong>เรื่อง</strong>&nbsp; อนุมัติให้ดำเนินการเข้าถึงข้อมูลของหน่วยงาน (${dot(f.dataSubjectName, 120)})</p>
<p class="a5-p-indent">เพื่อประโยชน์ในการไต่สวน หรือเพื่อประโยชน์ในการพิจารณาของคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐหรือคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน</p>
<p class="a5-p-indent">อาศัยอำนาจตามความในมาตรา ๑๙ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขออนุมัติให้ดำเนินการเข้าถึงข้อมูล ดังนี้</p>
<p>๑.&nbsp; ชื่อหน่วยงานที่ครอบครองข้อมูล${dot(f.agencyHoldingName, 140, '..............................................................')}ที่ตั้งเลขที่ ${dot("", 40)}ถนน${dot(f.agencyAddressRoad, 60)} ต.${dot(f.agencyAddressSubdistrict, 50)} อ.${dot(f.agencyAddressDistrict, 50)} จ.${dot(f.agencyAddressProvince, 50)}</p>
<p>๒.&nbsp; ชื่อ-สกุล ผู้ถูกเข้าถึงข้อมูล${dot(f.dataSubjectName, 130, '…………………………………………………..')}ตำแหน่ง${dot(f.dataSubjectPosition, 70)} สังกัด${dot(f.dataSubjectAffiliation, 90)}</p>
<p>( ${f.dataSubjectKind === "ผู้ถูกกล่าวหา" ? "✔" : " "} ) ผู้ถูกกล่าวหา<br>( ${f.dataSubjectKind !== "ผู้ถูกกล่าวหา" ? "✔" : " "} ) บุคคลอื่นที่มีเหตุอันควรเชื่อได้ว่าจะเกี่ยวข้องในเรื่องที่กล่าวหา</p>
<p>๓.&nbsp; รายละเอียดของข้อมูลที่ต้องการเข้าถึง ${dot(f.accessDetails, 250)}</p>
<p>๔.&nbsp; ระยะเวลาในการเข้าถึงข้อมูล ตั้งแต่วันที่ ${dot(f.periodFrom, 80)} ถึงวันที่ ${dot(f.periodTo, 80)}</p>
<p>สั่งไว้ ณ วันที่ ${dot(f.signedDate, 90)}</p>
<p style="text-align:right">(${dot(f.signerName, 140)})</p>
<p class="a5-form-corner">ปปท. 6-33</p></article>`;
    if (formId === DOC_IDS.DATA_ACCESS_LETTER) return `<article class="a5-report-paper a5-letter-paper a5-paper-page a5-prelim-paper">
${headRow(f)}
<p><strong>เรื่อง</strong>&nbsp;&nbsp;ขอเข้าถึงข้อมูล</p>
<p><strong>เรียน</strong>&nbsp;&nbsp;${dot(f.addresseeTitle, 260, '(หัวหน้าหน่วยงาน)')}</p>
<p><strong>สิ่งที่ส่งมาด้วย</strong>&nbsp;&nbsp;สำเนาคำสั่งคณะกรรมการ ป.ป.ท. ที่${dot(f.attachedOrderNo, 70, '.............')} ลงวันที่${dot(f.attachedOrderDate, 110, '........................................')}</p>
<p class="a5-p-indent">เพื่อประโยชน์ในการไต่สวน หรือเพื่อประโยชน์ในการพิจารณาของคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐหรือคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน จึงเรียนมาเพื่อโปรดพิจารณา</p>
<p>ขอแสดงความนับถือ</p>
<p style="text-align:left;margin-top:1.2em">(${dot(f.signerName, 160, '.....................................................')})<br>ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ/<br>ประธานอนุกรรมการไต่สวน/หัวหน้าพนักงาน ป.ป.ท.</p>
<p style="margin-top:.8em">สำนัก (กปท./ปปท.เขตพื้นที่ ของฝ่ายเลขานุการไต่สวน/พนักงาน ป.ป.ท. เจ้าของสำนวน)</p>
<p class="a5-form-corner">ปปท. 6-34</p></article>`;
    if (formId === DOC_IDS.DATA_ACCESS_REPORT) return `<article class="a5-report-paper a5-prelim-paper a5-paper-page">
<p style="text-align:center"><strong>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>รายงานผลการดำเนินการเข้าถึงข้อมูลของหน่วยงาน</strong></p>
<p style="text-align:right">(${dot(f.reportDate, 80, 'วัน เดือน ปี')})</p>
<p><strong>เรียน</strong>&nbsp; ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
<p class="a5-p-indent">ตามที่คณะกรรมการ ป.ป.ท. ได้มีคำสั่ง ที่ ${dot(f.orderNo, 50)}/${dot(f.orderNo2, 40)} ลงวันที่ ${dot(f.orderDate, 90)} อนุมัติให้ ${dot(f.approvedPersonName, 140)} ตำแหน่ง ${dot(f.approvedPosition, 90)} สังกัด ${dot(f.approvedAffiliation, 100)}</p>
<p class="a5-p-indent">บัดนี้ การดำเนินการเข้าถึงข้อมูลของหน่วยงานดังกล่าวได้ยุติและเสร็จสิ้นแล้ว จึงขอรายงานผลการดำเนินการต่อคณะกรรมการ ป.ป.ท. โดยมีสาระสำคัญ ${dot(f.reportSummary, 350, '..........................................................................................')}</p>
<p class="a5-p-indent">รายละเอียดปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
<p>จึงเรียนมาเพื่อโปรดนำเสนอคณะกรรมการ ป.ป.ท. พิจารณาต่อไป</p>
<p>ลงชื่อ</p><p>(${dot(f.signerName, 140)})</p><p>ตำแหน่ง ${dot(f.signerPosition, 100)}</p>
<p class="a5-letter-note">“ตัวอย่างหนังสือรายงานผลการดำเนินการเข้าถึงข้อมูลของหน่วยงาน”</p>
<p class="a5-form-corner">ปปท. 6-35</p></article>`;
    return "";
  }

  function meta_code_of(formId) {
    const meta = getMeta(formId);
    return meta ? `ปปท. ${meta.code}` : "";
  }


  function renderInquiryPaperA5(state = {}, formId) {
    const s = normalizeState(state);
    const doc = object(s.inquiryDocuments[formId]);
    return renderInquiryPaperByDocId(formId, doc.fields || defaultPayload(formId, state));
  }

  const api = Object.freeze({
    DOC_IDS, MANIFEST,
    defaultPayload, validateRequired,
    executeInquiryDocumentAction,
    renderInquiryEditorA5, captureInquiryEditorA5,
    renderInquiryPaperA5, renderInquiryPaperByDocId
  });
  root.ECMISActivity5InquiryDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
