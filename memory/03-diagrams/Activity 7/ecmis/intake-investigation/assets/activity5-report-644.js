(function initializeActivity5Report644(root) {
  const FORM_5_ID = "FORM_5_ACCUSATION_NOTICE";
  const FORM_6_ID = "FORM_6_ACCUSATION_RECORD";
  const FORM_7_ID = "FORM_7_REPORT_644";
  const A5_GARUDA_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADKBAMAAAAFnIJvAAAABGdBTUEAALGIlZj0pgAAADBQTFRFAAAAgAAAAIAAgIAAAACAgACAAICAgICAwMDA/wAAAP8A//8AAAD//wD/AP//////ex+xxAAAAAlwSFlzAAAOQAAADkUBMpLx3wAADBBJREFUeJzVnAuC5LYKRdkB+98lO+CVBZePLNmuT78klWSmuyzrCIEQYDmkf/2h/yZBiFcE+h1Mal/xI/2Q0IaLn15YXjf+6FPm6f9H+O0kVU1QfPNjAkOIJPxyklQ4Rux/068JJJ1QvvjRh0S4EfjnBKa/JsSiG38J/dJnoN8/J2Ca/ozAWgnHrw8JT42aWFy1RpCnBHljJH9NIMhL47a/kEGkEPggPJrgp4TXDIl2gnxFOI1Phh4mAk1Nln29hnYeydF2vp2PPoPwmjOeCHbTmbEieFu2nkMoKrN0ELT7c6I1YkUYzXyE4e4omjrhtcgFNzA2pDNBNjKwqwLalCFBkYEOGVLAaH4S4SAs1BNCUBDYZiYJ1Ahityx0yusoUax97MWvKWmzNHY4yQ2VDbDq6RBt8b2hCcN+dfiiuWM6E9g0vLT7PcHmqRG0EPiQkEEYsi7MXq339RVTtuN9gU0Edb6a4a6dw54whGDv7lgMQy2dQK6nMf51N07YauK42ayKc1czwhCQQdCtFsj+2QlhNx/qsDUXhPELmyROWM/1bqWnEOjO1FAJY5rsXtb9XN8Sjgn2SVoQzJ2OSV7O9OEHxmfDh/CvBjZVE4EqYa1nwlh2l9VcY/aXBLfQw2AvCAyvsZ4mC4xsb5sI4oT0f7tpGIRh9YsWNr9Dzz7o4pegCDjsxf3kywamsiEoCJGSgGDThG9XhOOi7xpre4IMqYZcWkYYElwQ+ueSYJPUCKYb3LoyRynrYa8HcXOWmSDkg5QtgaoYw4GcCDaFYjMhneAG5mIsdjexFZSERQQ3tq7Xf9Y3UdM0ljQ+SwKNXWvrOsRW/EFwaZotFSNZE9gn8Ypgl4790xXSCB6Q7AmxSfr1k+vCzezGj0EEgaqtnFQ9NmgSiBohY1NDnYJOiF/30xR6jnjz3KTeLCtC18Tp9jbGMMUipbfg7KllivM0zffbsAnjWRAgHdbziuBWblY96+HYs2yVYRhTAw/JzCVZMF8IYAr+QGiVHdjWhXmIyGjWwrgbZqWdwNTnes44dMQYIfK0C9XlSl3KJMg1QbLTh4ReOUn14OqEYOXWSycIdQqXJC0CbrcFieHPhD6CvslBqclfERBsRJbR+3C/E1tVtQTJXjgAC4IbfKqodhJwiT9OIoRBbQmYaenX/GcKQZm0WTN+Dg3LmRDOpllBXxNS97gWlUVfYwBmdhsCuY/n6VbrXy0YEcsNkkApwrgCB3KapQxEqN6j9UdWSwFbkxTB8pDhW3MIFA0x/CqE1J6ijFBcawGYgpxOmcYEIbxvncOU4jUoQep3DDVXQIzVfhxuSUoak7M1+pZJiOhiBK0wlgMGCVpLsoXT1kvIOOJu8si83Wc++wgGop5irpWmCXW/T9MY8QNDFX2aSp/Fo6Xd1klCGOUamQm5VqqCI4iLMCRXVF87pdbSt5eqU3TukXiRIRDsmatJ1kXAypDueQsBu6fklmzbp93POWILHZEUxvgI+xPvCAIhi/gWI6Fm4P2M4o6t8UpQT0J7AlM0MuJBSA+EJ9niK9o+jFo/ZOh+TYXXhMNeJPaAWLWWJ1dvPUI+nxEvIfg6gaktZ8mWSrgs/M1OYM7GrCh1OmEYeYaS4M4E0cgibPVbDcIInn/CWrNrheakBNhaP4XgtfCUt+hyqKOmTnZVpOdGUBktCUiDYbjm3fyJkYXjGQ564UVIM1a25eAiLwm5NZXN7vByuJoWAGsck0VBgC9u8WAjsMVlUgyWQCBB6MypylGnLSucLE3lDcEliMWJ5M0usuS1cAtSAhfQ5+RlJjSVkRnJuD8yLNvtO8H9gRB8yYYQ/rF/cE3TvVrLogJJdzxX6SZCrLbIlDAgWwU+YFNmy0TSjes1Ab4ChLJViIdMKFaO5cEhIzqcH0/OIXT41JQCvljMdXESfFfX9Ftedt0S0qLDm5dAVsh9h2QYN6IcLERzXnPpqf+KsjULKiCNoF4dKwSq1tEUsibgXp5MNm6qQXdJSWERfBZhSWCEwcgvGyHbcvGSsYmcU/HpV/fcfHg8igjjHAZDBnO35DqaE4sFAUsiqoLScrK5KWeE0W6/ILTsBZHwnmB/l5tXj7pO9xXjKZHXmUCRmo/tUWllqguCCsGUYIK5cCcRQhCJWOqkhQWhVGvICy2qZ/1B0OoZT8v5HyPkdumbTcsT0m/5phffo/E9oberyo462SLlO914RdDuJY5Yq3DyxxYaLpfCloBJGYVTBNnnT3ru+OIpoW5dWkus5icaxtvwFNreEco8RYRh0Ax0ULymiKfWgA2hevzpB4w8484qzRuE8GuZHvYJr6rZWNE1QcVTGevymiAfEWBRpdPiFOewag+4IaRaI+c8pcHt8luEMkI+dyEUsYJcC7E3AUL4ZEvgTIgzHjuPdE1wRctwGfN5EbUIIbze3mXsCfBxYiWjUw82Sa3tThUbAgXBApQgYGKIOCNJOg/hjoBq4CudIU/Qsfo0CiyUjfnivN7yazu8Mh7SGsEzPN/W2EXohO10rEWwO8yQvD+sLEy7zaIRWXPSHsoQ7oa84j2nRpyrIN37Y0LdOb3c0J4oTv3h940iloSsGvrpjIigUhT7Psazn6a1DKYGIS8rZZnSFziJEcb+wHZ2aBmObQhWwrBnTjrqGpCBfRdF7G/llvH0/y0ZUNIzixyZp3km7KIczlBaFPqcEHOtFCd2zNWZeVWzkaqbx4R6W4kUzYDGejaopp5xZugpQSmUW+ogueWU7whl+shRnxLGFFF5WD894XAhxomeUS/YHUnaEaxeJGVc4gE2vKpYue/4HinjG7aEXNr9GWbdCOMkndqKCEsq9d4nBE/zwzkwzk1Z6ujpVJTvzSDeIdjjjoiHIZj1J173zIoWix/aeYMQmhOcr4H/lPEQOcjmLoygvbx3S/Bd5aiqeWCN+GkUsjzmZ/Gzh8Po3iCU2lorIpuO4zEB9Q8vJ2mfP1RlI1C1+loU2ymefoxDju/tcdhCzW1ADBslSQByF9H39ulRDBtLjiV6UZU8iRfDxylQ2R0N2xHYqrvFFR2lc4UMdZ+Fs13reRsvoVe4v+qOwkGx5CVaO9YtoUYXReHSCf2zAVzErapRIo4x60SwXXV1BOWWYAHqcQZkHADEUQ4jxLMDcgNeVMYeEFqO6+7Zs2cUuYvFbnu5ImhRqFaC+qxkLn+RY10TomjrNFh8nuy7np8nBOz+7iJQJJE4WXoPeELwNZy9SRTcf0TQXIG+sWaC8j1Bqgjtw/6M6wcEPe8ENmMU178h+NawyB58/X1kS12nVkVdCEGTEETrlXf+roY+VYQTJR7lALCuYp0IsYFxDBC73ayIKIsr8uwV4lSvwH4eKwDr+ixCebrR6ro3hFK79dGxZ6VnQl92kqQrQhmQOSI7jn98OdvT9HygRYjXMrTTR0J4EaBvzgTHlEPjVPsNQdXPUOBGjC9PbzYL0ibHLWFOZEolvZ+FwNTLqvW1DPFOTdSMQaBqPG04IfAjwly6q4R0Ut661BWr1d4RyngxzLmugVJ0HfIbhP5sgKynZqxsWYNGfhHt72dJM5NJUcSPPcVGJHYcNW2Ud739k4R0sObhuATEGudyCDkYFuIT3xqnZzL1MUz6b7bXNKrSJvO4kQG9DJwBSPM4nqc8EUbNvvjJLOV3yKQUbxr6G0dUJG11mqezVAAIIOONBp5EoPoS1TNCZkuCp1W+AHgcyKYQwdrcRlyX18TjU3+5xQmea/t6pN37QfeEEsOgwON1y3hZ2T3IxwR/jOKCeELrsV6+VETbLPQBoYQo5NUkZSovsHqd6fJzTSiPbk3vXhEoRirfyBC1QX9RmZwAV+7b3OeaRvVxJAviZSfliBUow6lPCXYziqz+mmyN/5Ru8tA7gh2QHv+KouzMEZ3Zq27f5nHWvQUZY8rtoYeks/g2fxD2U5SjcOuhsPqbk97gO4Kn/bYn4JVr9lNSi1d2PiB49OonAyNeUt6/tvouQW2DswDZt1V/LPFLgtlPvK3qvvt3BIsr4B4kCU8AzwjxOjI1wrPPo4bYqo2Aze8+WX9OiMcL42yls54K8bSd1eqD8EzJbxE8AmYk0Y8Bzwlo/sboPyK8NfoPCe+K8O8jPP5/tXxBeBfwwR3vfv4HpAT+CEwM+dUAAAAASUVORK5CYII=';
  const REPORT_SECTION_KEYS = Object.freeze([
    "intake", "accusers", "accusedPersons", "allegations", "evidence", "otherMeasures", "eventContext", "damage",
    "limitation", "legalBasis", "chargeNotice", "adjudication", "offenceConclusions", "proposal"
  ]);
  const EVIDENCE_CATEGORY_LABELS_A5 = Object.freeze({ WITNESS: "พยานบุคคล (๕.๑)", DOCUMENT: "พยานเอกสาร (๕.๒)", OTHER: "พยานวัตถุและอื่น ๆ (๕.๓)", HOME_AGENCY_RESULT: "ผลสอบข้อเท็จจริง/วินัย/ละเมิดของหน่วยงานต้นสังกัด (๕.๔)" });
  const OTHER_MEASURE_LABELS_A5 = Object.freeze({ WITNESS_PROTECTION: "การคุ้มครองพยาน (๖.๑)", SET_ASIDE_AS_WITNESS: "การกันบุคคลหรือผู้ถูกกล่าวหาไว้เป็นพยาน (๖.๒)", OTHER: "การดำเนินการอื่น (๖.๓)" });
  const SOURCES = Object.freeze({
    [FORM_5_ID]: Object.freeze({ fileName: "5. แบบหนังสือแจ้งให้รับทราบข้อกล่าวหา.pdf", pages: [1, 2] }),
    [FORM_6_ID]: Object.freeze({ fileName: "6. แบบบันทึกการแจ้งข้อกล่าวหา.pdf", pages: [1, 3] }),
    [FORM_7_ID]: Object.freeze({ fileName: "7. แบบรายงานการไต่สวน.pdf", pages: [1, 3] })
  });
  const ACTIONS = Object.freeze([
    "additional-accused-request", "additional-accused-record-signed-order",
    "form-5-save", "form-5-submit", "form-5-sign", "form-5-service-record", "form-6-save", "form-6-submit", "panel-objection-record", "defence-record",
    "report-644-save", "report-644-submit", "report-644-review-record-opinion", "report-644-review-return",
    "report-644-sign", "report-644-route-select", "report-644-urgent-letter-attach", "report-644-support-record-opinion", "report-644-secretary-confirm-support",
    "report-644-create-package", "report-644-send-a7", "report-644-record-receipt", "report-644-record-result"
  ]);
  const REPORT_644_REVIEW_STEPS = Object.freeze({
    LINE_SUPERVISOR: "LINE_SUPERVISOR",
    UNIT_DIRECTOR: "UNIT_DIRECTOR",
    SUPERVISING_EXECUTIVE: "SUPERVISING_EXECUTIVE",
    SECRETARY_GENERAL: "SECRETARY_GENERAL"
  });
  const REPORT_644_ROUTES = Object.freeze({ NORMAL: "NORMAL", SUPPORT_COMMITTEE: "SUPPORT_COMMITTEE", URGENT: "URGENT" });
  const REVIEW_STEP_DEFAULTS = Object.freeze({
    LINE_SUPERVISOR: Object.freeze({ roleCode: "group-director", roleLabel: "ผอ.กลุ่มงาน" }),
    UNIT_DIRECTOR: Object.freeze({ roleCode: "director", roleLabel: "ผอ.เขต/ผอ.กอง" }),
    SUPERVISING_EXECUTIVE: Object.freeze({ roleCode: "executive", roleLabel: "ผู้ช่วย/รองเลขาธิการที่กำกับ" }),
    SECRETARY_GENERAL: Object.freeze({ roleCode: "secretary", roleLabel: "เลขาธิการ ป.ป.ท." })
  });
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const text = value => typeof value === "string" ? value.trim() : "";
  const copy = value => JSON.parse(JSON.stringify(value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const domain = () => root.ECMISActivity5DocumentDomain || (typeof require === "function" ? require("./activity5-document-domain.js") : null);
  const active = (state, documentId) => (object(state.a5DocumentStore).records || []).filter(record => record.documentId === documentId).sort((left, right) => right.revisionNo - left.revisionNo)[0] || null;
  const exact = (state, documentId, revisionNo) => (object(state.a5DocumentStore).records || []).find(record => record.documentId === documentId && record.revisionNo === revisionNo) || null;
  const repository = state => [state.a5EvidenceRepository, state.evidenceRepository, state.documentRepository].flatMap(items => Array.isArray(items) ? items : []);
  const exactVersion = (state, versionId) => repository(state).find(item => text(item.versionId || item.documentVersionId) === text(versionId) && item.availability !== "MISSING") || null;
  const addDaysISO = (dateStr, days) => {
    const parsed = new Date(`${text(dateStr)}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return "";
    parsed.setUTCDate(parsed.getUTCDate() + days);
    return parsed.toISOString().slice(0, 10);
  };

  // Forms 5/6 are per-accused documents (แบบ 5 "เรียน [ชื่อผู้ถูกกล่าวหา]" เอกพจน์; แบบ 6 ส่วนที่ 3 ลายเซ็นผู้ถูกกล่าวหาคนเดียว)
  // — see .superpowers/sdd/activity5-phase1/form-5-source-map.md / form-6-source-map.md.
  // documentId is tagged per accused so the shared document-domain store (one active record per documentId)
  // holds one Form 5 + one Form 6 per accused without any change to activity5-document-domain.js.
  const FORM_4_ID = "FORM_4_REPORT_213";
  const baseFormId = documentId => text(documentId).split("::")[0];
  const form5DocId = accusedRowId => `${FORM_5_ID}::${accusedRowId}`;
  const form6DocId = accusedRowId => `${FORM_6_ID}::${accusedRowId}`;

  function accusedRosterFromReport213(state) {
    const record = (object(state.a5DocumentStore).records || []).filter(item => item.documentId === FORM_4_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
    const rows = record?.submittedSnapshot?.accusedPersons || record?.payload?.accusedPersons || [];
    return Array.isArray(rows) ? rows : [];
  }

  function initialPayload(baseId, state, accusedRow) {
    const caseMeta = { caseId: text(state.caseData?.id), caseNumber: text(state.caseData?.caseNumber), subject: text(state.caseData?.subject) };
    const accusedRef = accusedRow ? { rowId: text(accusedRow.rowId), name: text(accusedRow.name) || "เอกสารไม่ระบุ", position: text(accusedRow.position), agency: text(accusedRow.agency) } : null;
    if (baseId === FORM_5_ID) return {
      caseMeta, accusedRef, noticeMeta: { letterNo: "", issuedAt: "", caseRefNo: "" },
      attachments: { appointmentOrder: { refNo: "", date: "", pageCount: "", versionId: "" } },
      returnAddress: { division: "" }, inPersonMeeting: { date: "", time: "", venueDivision: "", floor: "" }, lawyerCoordination: { contactName: "", contactPhone: "" },
      preparer: { officerId: text(state.assignment?.primaryOfficerId), displayName: text(state.assignment?.primaryOfficerName) || "เอกสารไม่ระบุ" },
      signer: { authorityStatus: "PENDING_CONFIRMATION", displayName: "เอกสารไม่ระบุ" },
      caseOwnerContact: { division: "", phone: "", fax: "", officerName: text(state.assignment?.primaryOfficerName) || "เอกสารไม่ระบุ", officerPhone: "" }
    };
    if (baseId === FORM_6_ID) return {
      caseMeta, accusedRef, noticeRef: { documentId: "", revisionNo: 0 }, recordMeta: { issuedAt: "" }, offenceCategory: [],
      issue1EventNarrative: "", issue2: { statusPosition: "", authority: "", conduct: "", damage: "" },
      issue3: { criminalCharge: "", disciplinaryCharge: "", incidentDate: "", incidentPeriodFrom: "", incidentPeriodTo: "", incidentLocation: { subdistrict: "", district: "", province: "" } },
      panel: [], panelSignatures: [], acknowledgement: { receivedDate: "", explainByDate: "", accusedSignedAt: "" },
      copies: [{ copyNo: 1, holder: "CASE_FILE", deliveredAt: "", receiptEvidenceVersionId: "" }, { copyNo: 2, holder: "ACCUSED_KEEP", deliveredAt: "", receiptEvidenceVersionId: "" }, { copyNo: 3, holder: "ACCUSED_RETURN", deliveredAt: "", returnedAt: "", receiptEvidenceVersionId: "" }],
      preparer: { officerId: text(state.assignment?.primaryOfficerId), displayName: text(state.assignment?.primaryOfficerName) || "เอกสารไม่ระบุ" },
      signer: { authorityStatus: "PENDING_CONFIRMATION", displayName: "เอกสารไม่ระบุ" }
    };
    return {
      reportMeta: { docRef: "", matterNo: "", owningDivision: "", issuedAt: "" },
      intake: {
        caseType: "",
        nacc: { receivedAt: "", refNo: "", trackingNo: "", channel: "", transferMeetingNo: "", transferDate: "", naccLetterRef: "", pptReceivedAt: "" },
        misconduct: { receivedAt: "", channel: "" },
        appointmentOrder: { orderRef: "", amendmentNote: "", versionId: "" }
      },
      accusers: [], accusedPersons: [], allegations: [], evidence: [],
      otherMeasures: [], eventContext: { place: "", period: "" }, damage: { description: "", amount: "" },
      limitation: [], legalBasis: [],
      chargeNotice: { orderNotice: { letterRef: "" }, objection: { summary: "" }, perAccused: [] },
      adjudication: { perAccused: [], issueFraming: "", factsFound: "", factAnalysis: "", lawAnalysis: "", opinions: [] },
      offenceConclusions: [], proposal: {}, panelSignatures: []
    };
  }

  function normalizeReport644A5(sourceState) {
    const normalized = domain()?.normalizeA5DocumentStore?.(sourceState);
    if (normalized && !normalized.ok) return normalized;
    const state = copy(normalized?.state || sourceState);
    const store = object(state.a5DocumentStore);
    store.records = Array.isArray(store.records) ? store.records : [];
    let added = 0;
    const ensure = (documentId, baseId, accusedRow) => {
      if (active(state, documentId)) return;
      store.records.push({ documentId, caseId: text(state.caseData?.id), revisionNo: 1, baseRevisionNo: null, status: "DRAFT", schemaVersion: 1, payload: initialPayload(baseId, state, accusedRow), source: copy(SOURCES[baseId]), submittedSnapshot: null, reviewHistory: [], createdBy: "เอกสารไม่ระบุ", createdAt: "", updatedBy: "เอกสารไม่ระบุ", updatedAt: "" });
      added += 1;
    };
    ensure(FORM_7_ID, FORM_7_ID, null);
    const form7 = active(state, FORM_7_ID);
    // ผู้ถูกกล่าวหาของ 644 มาจากรายงาน 213 ที่เสนอแล้ว (ข้อมูลยืนยันแล้ว ไม่ให้กรอกซ้ำ) — เติมครั้งแรกเท่านั้น ไม่ทับข้อมูลที่นักสืบแก้ไขต่อ
    if (form7 && !(form7.payload.accusedPersons || []).length) {
      const roster = accusedRosterFromReport213(state);
      if (roster.length) {
        form7.payload.accusedPersons = roster.map((row, index) => ({ rowId: text(row.rowId), order: index + 1, name: text(row.name), position: text(row.position), agency: text(row.agency) }));
        added += 1;
      }
    }
    (form7?.payload.accusedPersons || []).forEach(row => {
      if (!text(row.rowId)) return;
      ensure(form5DocId(row.rowId), FORM_5_ID, row);
      ensure(form6DocId(row.rowId), FORM_6_ID, row);
    });
    store.version = Number(store.version || 0) + added;
    state.a5DocumentStore = store;
    state.a5Report644Lifecycle = normalizeLifecycle(state.a5Report644Lifecycle);
    syncChargeNoticePerAccused(form7, state.a5Report644Lifecycle);
    return { ok: true, code: "REPORT_644_NORMALIZED", state, errors: [], focusTarget: "" };
  }

  function error(errors, field, message, code = "MISSING_REQUIRED_FIELD") {
    errors.push({ field, message, code });
  }

  function validateStableRows(rows, field, errors, idKey = "rowId") {
    if (!Array.isArray(rows)) return error(errors, field, "รูปแบบรายการไม่ถูกต้อง", "INVALID_PAYLOAD");
    const ids = new Set();
    rows.forEach((row, index) => {
      const id = text(row?.[idKey]);
      if (!id || ids.has(id)) error(errors, `${field}.${index}`, "รหัสรายการซ้ำหรือไม่ครบ", "INVALID_PAYLOAD");
      if (row?.order !== index + 1) error(errors, `${field}.${index}.order`, "ลำดับรายการต้องต่อเนื่อง", "INVALID_PAYLOAD");
      ids.add(id);
    });
  }

  function validationResult(errors, code = "DOCUMENT_VALID") {
    return { ok: errors.length === 0, code: errors[0]?.code || code, errors: errors.map(({ field, message }) => ({ field, message })), focusTarget: errors[0]?.field || "" };
  }

  function validateForm5A5(payload, context = {}) {
    const value = object(payload), errors = [];
    if (!text(value.accusedRef?.rowId)) error(errors, "accusedRef", "ไม่พบผู้ถูกกล่าวหาที่อ้างอิงเอกสารนี้", "BROKEN_REFERENCE");
    if (context.intent === "SUBMISSION") {
      ["letterNo", "issuedAt"].forEach(field => { if (!text(value.noticeMeta?.[field])) error(errors, `noticeMeta.${field}`, "ข้อมูลหนังสือแจ้งข้อกล่าวหาไม่ครบถ้วน"); });
      ["refNo", "date", "pageCount", "versionId"].forEach(field => { if (!text(value.attachments?.appointmentOrder?.[field])) error(errors, `attachments.appointmentOrder.${field}`, "ต้องอ้างอิงคำสั่งแต่งตั้งที่ลงนามแล้วให้ครบถ้วน", "ATTACHMENT_VERSION_MISSING"); });
      if (!text(value.returnAddress?.division)) error(errors, "returnAddress.division", "ต้องระบุหน่วยงานปลายทางส่งบันทึกกลับคืน");
      if (!text(value.caseOwnerContact?.officerName) || !text(value.caseOwnerContact?.officerPhone)) error(errors, "caseOwnerContact", "ต้องระบุชื่อและหมายเลขโทรศัพท์เจ้าของสำนวน");
    }
    return validationResult(errors, "FORM_5_VALID");
  }

  function validateForm6A5(payload, context = {}) {
    const value = object(payload), errors = [];
    if (!text(value.accusedRef?.rowId)) error(errors, "accusedRef", "ไม่พบผู้ถูกกล่าวหาที่อ้างอิงเอกสารนี้", "BROKEN_REFERENCE");
    if (context.intent === "SUBMISSION") {
      const expectedNoticeId = value.accusedRef?.rowId ? form5DocId(value.accusedRef.rowId) : "";
      if (!expectedNoticeId || value.noticeRef?.documentId !== expectedNoticeId || !Number.isInteger(value.noticeRef?.revisionNo) || value.noticeRef.revisionNo < 1) error(errors, "noticeRef", "ต้องอ้างอิงหนังสือแจ้งข้อกล่าวหาฉบับที่แน่นอนของผู้ถูกกล่าวหาคนเดียวกัน", "BROKEN_REFERENCE");
      if (!text(value.recordMeta?.issuedAt)) error(errors, "recordMeta.issuedAt", "ต้องระบุวันที่บันทึก");
      if (!Array.isArray(value.offenceCategory) || !value.offenceCategory.length) error(errors, "offenceCategory", "ต้องเลือกฐานความผิดอย่างน้อยหนึ่งประเภท");
      if (!text(value.issue1EventNarrative)) error(errors, "issue1EventNarrative", "ต้องบรรยายเหตุการณ์หรือเรื่องราวที่เกิดขึ้น");
      ["statusPosition", "authority", "conduct", "damage"].forEach(field => { if (!text(value.issue2?.[field])) error(errors, `issue2.${field}`, "ต้องระบุองค์ประกอบความผิดให้ครบทุกประเด็น"); });
      if (!text(value.issue3?.criminalCharge)) error(errors, "issue3.criminalCharge", "ต้องระบุข้อหาความผิดทางอาญา");
      if (!text(value.issue3?.incidentDate) && !(text(value.issue3?.incidentPeriodFrom) && text(value.issue3?.incidentPeriodTo))) error(errors, "issue3.incidentDate", "ต้องระบุวันที่เกิดเหตุหรือช่วงเวลาที่เกิดเหตุ");
      ["subdistrict", "district", "province"].forEach(field => { if (!text(value.issue3?.incidentLocation?.[field])) error(errors, `issue3.incidentLocation.${field}`, "ต้องระบุสถานที่เกิดเหตุให้ครบตำบล/อำเภอ/จังหวัด"); });
      validateStableRows(value.panel, "panel", errors);
      if (!(value.panel || []).length) error(errors, "panel", "ต้องมีรายชื่อคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวนอย่างน้อยหนึ่งคน");
      const panelIds = new Set((value.panel || []).map(row => row.rowId));
      if (!(value.panelSignatures || []).length || (value.panel || []).some(row => !(value.panelSignatures || []).some(sig => sig.panelRowId === row.rowId && text(sig.signedBy) && text(sig.signedAt)))) error(errors, "panelSignatures", "ลายมือชื่อองค์คณะไม่ครบทุกคน", "SIGNATURE_REQUIRED");
      (value.panelSignatures || []).forEach((sig, index) => { if (!panelIds.has(sig.panelRowId)) error(errors, `panelSignatures.${index}.panelRowId`, "ลายมือชื่ออ้างอิงบุคคลที่ไม่อยู่ในองค์คณะ", "BROKEN_REFERENCE"); });
    }
    const copies = Array.isArray(value.copies) ? value.copies : [];
    const shape = [[1, "CASE_FILE"], [2, "ACCUSED_KEEP"], [3, "ACCUSED_RETURN"]];
    if (copies.length !== 3 || shape.some(([copyNo, holder], index) => copies[index]?.copyNo !== copyNo || copies[index]?.holder !== holder)) error(errors, "copies", "ต้องมีบันทึกครบสามฉบับ: เก็บในสำนวน / ผู้ถูกกล่าวหาเก็บเอง / ผู้ถูกกล่าวหาส่งคืน", "PACKAGE_INCOMPLETE");
    if (context.intent === "SUBMISSION" && (!text(copies[2]?.returnedAt) || !text(copies[2]?.receiptEvidenceVersionId))) error(errors, "copies.2.receiptEvidenceVersionId", "ต้องมีหลักฐานผู้ถูกกล่าวหาลงนามและส่งบันทึกคืน", "RECEIPT_REQUIRED");
    return validationResult(errors, "FORM_6_VALID");
  }

  function validateReport644A5(payload, context = {}) {
    const value = object(payload), errors = [];
    const keys = [...REPORT_SECTION_KEYS, "reportMeta", "panelSignatures"];
    if (!keys.every(key => Object.hasOwn(value, key)) || Object.keys(value).some(key => !keys.includes(key))) error(errors, "payload", "โครงสร้างรายงาน 644 ไม่ครบตามแบบ", "INVALID_PAYLOAD");
    ["accusers", "accusedPersons", "allegations", "evidence", "otherMeasures", "limitation", "legalBasis", "offenceConclusions", "panelSignatures"].forEach(field => validateStableRows(value[field], field, errors, field === "panelSignatures" ? "signatureId" : "rowId"));
    const accusedIds = new Set((value.accusedPersons || []).map(row => row.rowId));
    const allegationIds = new Set((value.allegations || []).map(row => row.rowId));
    if (context.intent === "SUBMISSION") {
      REPORT_SECTION_KEYS.filter(field => field !== "proposal").forEach(field => {
        const item = value[field];
        const empty = Array.isArray(item) ? item.length === 0 : typeof item === "string" ? !text(item) : !Object.values(object(item)).some(entry => Array.isArray(entry) ? entry.length : text(entry));
        if (empty) error(errors, field, "ข้อมูลรายงานส่วนนี้ไม่ครบถ้วน", "PACKAGE_INCOMPLETE");
      });
    }
    (value.evidence || []).forEach((row, index) => { if (!text(row.documentVersionId) || !text(row.factSupported)) error(errors, `evidence.${index}`, "พยานหลักฐานต้องอ้างอิงฉบับและข้อเท็จจริง"); });
    (value.limitation || []).forEach((row, index) => { if (row.allegationRowId && !allegationIds.has(row.allegationRowId)) error(errors, `limitation.${index}.allegationRowId`, "อ้างอิงข้อกล่าวหาที่ไม่มีอยู่จริง", "BROKEN_REFERENCE"); });
    (value.offenceConclusions || []).forEach((row, index) => {
      if (!accusedIds.has(row.accusedRowId) || !allegationIds.has(row.allegationRowId)) error(errors, `offenceConclusions.${index}`, "ผลวินิจฉัยต้องอ้างอิงผู้ถูกกล่าวหาและข้อกล่าวหาที่ถูกต้อง", "BROKEN_REFERENCE");
      if (row.dropped === true) {
        if (!text(row.droppedReason)) error(errors, `offenceConclusions.${index}.droppedReason`, "ต้องระบุเหตุผลที่ให้ข้อกล่าวหาตกไป");
      } else if (context.intent === "SUBMISSION") {
        const hasCriminal = (row.criminalCharges || []).some(item => text(item.lawName) && text(item.section));
        const hasDisciplinary = (row.disciplinaryCharges || []).some(item => text(item.basis));
        const hasOther = text(row.otherRouting?.type);
        if (!hasCriminal && !hasDisciplinary && !hasOther) error(errors, `offenceConclusions.${index}`, "ต้องระบุฐานความผิดทางอาญา วินัย หรือกรณีอื่นอย่างน้อยหนึ่งอย่าง", "PACKAGE_INCOMPLETE");
      }
    });
    if (context.intent === "SUBMISSION") {
      for (const allegationId of allegationIds) {
        if (!(value.limitation || []).some(row => row.allegationRowId === allegationId && text(row.expiresAt))) error(errors, "limitation", "ต้องระบุอายุความของทุกข้อกล่าวหา", "PACKAGE_INCOMPLETE");
      }
      for (const accusedId of accusedIds) for (const allegationId of allegationIds) {
        if (!(value.offenceConclusions || []).some(row => row.accusedRowId === accusedId && row.allegationRowId === allegationId)) error(errors, "offenceConclusions", "ต้องมีผลวินิจฉัยแยกทุกผู้ถูกกล่าวหาและทุกข้อกล่าวหา", "PACKAGE_INCOMPLETE");
      }
      const opinions = value.adjudication?.opinions || [];
      if (!opinions.length || opinions.some(item => !["MAJORITY", "MINORITY"].includes(item.kind) || !text(item.opinionId) || !text(item.authorName) || !text(item.text))) error(errors, "adjudication.opinions", "ต้องเก็บความเห็นข้างมาก/ข้างน้อยเป็นรายบุคคล", "PACKAGE_INCOMPLETE");
      if (!(value.panelSignatures || []).length || value.panelSignatures.some(item => !text(item.signedBy) || !text(item.signedAt) || !text(item.methodLabel))) error(errors, "panelSignatures", "ลายมือชื่อองค์คณะไม่ครบถ้วน", "SIGNATURE_REQUIRED");
    }
    return validationResult(errors, "REPORT_644_VALID");
  }

  function normalizeLifecycle(input) {
    const value = object(input);
    return {
      status: text(value.status) || "REPORT_644_DRAFT", services: Array.isArray(value.services) ? copy(value.services) : [], defences: Array.isArray(value.defences) ? copy(value.defences) : [],
      submissions: Array.isArray(value.submissions) ? copy(value.submissions) : [], reviewOpinions: Array.isArray(value.reviewOpinions) ? copy(value.reviewOpinions) : [], signatures: Array.isArray(value.signatures) ? copy(value.signatures) : [],
      packages: Array.isArray(value.packages) ? copy(value.packages) : [], dispatches: Array.isArray(value.dispatches) ? copy(value.dispatches) : [], receipts: Array.isArray(value.receipts) ? copy(value.receipts) : [], results: Array.isArray(value.results) ? copy(value.results) : [],
      additionalAccusedRequests: Array.isArray(value.additionalAccusedRequests) ? copy(value.additionalAccusedRequests) : [],
      reviewChain: Array.isArray(value.reviewChain) ? copy(value.reviewChain) : [],
      reviewConfiguration: copy(object(value.reviewConfiguration)),
      returnOrders: Array.isArray(value.returnOrders) ? copy(value.returnOrders) : [],
      route: text(value.route), routeHistory: Array.isArray(value.routeHistory) ? copy(value.routeHistory) : [],
      supplementalDocuments: Array.isArray(value.supplementalDocuments) ? copy(value.supplementalDocuments) : [],
      supportCommitteeOpinions: Array.isArray(value.supportCommitteeOpinions) ? copy(value.supportCommitteeOpinions) : [],
      auditHistory: Array.isArray(value.auditHistory) ? copy(value.auditHistory) : [],
      commandReceipts: Array.isArray(value.commandReceipts) ? copy(value.commandReceipts) : []
    };
  }

  function buildReport644ReviewChainA5(configuration = {}) {
    const config = object(configuration);
    const assignmentVersion = Number(config.assignmentVersion || 0);
    const stepTypes = [
      ...(config.includeLineSupervisor === true ? [REPORT_644_REVIEW_STEPS.LINE_SUPERVISOR] : []),
      REPORT_644_REVIEW_STEPS.UNIT_DIRECTOR,
      ...(config.includeSupervisingExecutive === true ? [REPORT_644_REVIEW_STEPS.SUPERVISING_EXECUTIVE] : []),
      REPORT_644_REVIEW_STEPS.SECRETARY_GENERAL
    ];
    const assignments = object(config.assignments);
    return stepTypes.map((stepType, index) => {
      const assigned = object(assignments[stepType]);
      const defaults = REVIEW_STEP_DEFAULTS[stepType];
      return {
        stepId: text(assigned.stepId) || `record10-review-${index + 1}-${stepType.toLowerCase()}`,
        sequence: index + 1,
        stepType,
        roleCode: text(assigned.roleCode) || defaults.roleCode,
        roleLabel: text(assigned.roleLabel) || defaults.roleLabel,
        actorId: text(assigned.actorId),
        actorName: text(assigned.actorName),
        assignmentVersion,
        status: index === 0 ? "CURRENT" : "PENDING",
        opinionId: "",
        completedAt: ""
      };
    });
  }

  function currentReviewStep(lifecycle) {
    return lifecycle.reviewChain.find(step => step.status === "CURRENT") || null;
  }

  function actorCanReview(step, person, input) {
    if (!step || step.roleCode !== text(person.role)) return false;
    if (step.actorId && step.actorId !== text(person.id)) return false;
    return Number(step.assignmentVersion || 0) === Number(input.assignmentVersion || 0);
  }

  function advanceReview(lifecycle, step, opinionId, at) {
    step.status = "COMPLETED";
    step.opinionId = text(opinionId);
    step.completedAt = text(at);
    const next = lifecycle.reviewChain.find(item => item.sequence > step.sequence && item.status === "PENDING");
    if (next) next.status = "CURRENT";
    return next || null;
  }

  // ข้อ ๑๑.๒/๑๑.๓ ของแบบ 7 มาจากหลักฐานการส่ง (Form 5 form-5-service-record) และคำให้การ (defence-record) ที่มีอยู่แล้ว — sync แทนกรอกซ้ำ (source map form-7 §11)
  function syncChargeNoticePerAccused(form7, lifecycle) {
    if (!form7) return;
    const services = lifecycle.services || [], defences = lifecycle.defences || [];
    form7.payload.chargeNotice = form7.payload.chargeNotice || { orderNotice: { letterRef: "" }, objection: { summary: "" }, perAccused: [] };
    form7.payload.chargeNotice.perAccused = (form7.payload.accusedPersons || []).map(row => {
      const service = services.filter(item => item.accusedRowId === row.rowId).sort((left, right) => (left.noticeRevisionNo || 0) - (right.noticeRevisionNo || 0)).at(-1);
      const defence = defences.filter(item => item.accusedPersonRef === row.rowId).at(-1);
      return {
        accusedRowId: row.rowId,
        noticeDocumentId: service ? form5DocId(row.rowId) : "", noticeRevisionNo: service ? service.noticeRevisionNo : null,
        sentAt: service ? service.servedAt : "", method: service ? service.method : "", acknowledgedAt: service ? service.servedAt : "",
        defenceStatement: defence ? text(defence.statement) : "", defenceNoDefence: defence ? defence.noDefence === true : false, defenceEvidenceCount: defence ? (defence.attachmentVersionIds || []).length : 0
      };
    });
  }

  function fail(state, code, field, message) {
    return { ok: false, code, state: copy(state), errors: field ? [{ field, message }] : [], focusTarget: field || "" };
  }

  function commandContext(sourceState, actor, action, command) {
    const state = copy(sourceState), person = object(actor), input = object(command);
    for (const field of ["caseId", "at", "idempotencyKey"]) if (!text(input[field])) return { failure: fail(sourceState, "MISSING_REQUIRED_FIELD", field, "ข้อมูลคำสั่งไม่ครบถ้วน") };
    if (!text(person.id) || !text(person.name) || !text(person.role)) return { failure: fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ไม่พบผู้ดำเนินการ") };
    if (text(input.caseId) !== text(state.caseData?.id)) return { failure: fail(sourceState, "CASE_MISMATCH", "caseId", "สำนวนไม่ตรงกับเอกสาร") };
    const lifecycle = normalizeLifecycle(state.a5Report644Lifecycle), fingerprint = JSON.stringify({ action, actor: person, command: input });
    const receipt = lifecycle.commandReceipts.find(item => item.idempotencyKey === input.idempotencyKey);
    if (receipt) return receipt.fingerprint === fingerprint ? { replay: { ok: true, code: `${receipt.code}_REPLAYED`, state, errors: [], focusTarget: "" } } : { failure: fail(sourceState, "IDEMPOTENCY_KEY_REUSED", "idempotencyKey", "รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว") };
    if (input.expectedVersion !== Number(state.a5DocumentStore?.version || 0)) return { failure: fail(sourceState, "VERSION_CONFLICT", "expectedVersion", "ข้อมูลมีการเปลี่ยนแปลง") };
    return { state, person, input, lifecycle, fingerprint };
  }

  function finish(context, state, code, extra = {}) {
    context.lifecycle.commandReceipts.push({ idempotencyKey: context.input.idempotencyKey, fingerprint: context.fingerprint, code, at: context.input.at });
    state.a5Report644Lifecycle = context.lifecycle;
    state.workflow = { ...object(state.workflow), downstreamStatus: context.lifecycle.status };
    return { ok: true, code, state, errors: [], focusTarget: "", ...extra };
  }

  function bump(state) {
    state.a5DocumentStore.version = Number(state.a5DocumentStore.version || 0) + 1;
  }

  function authorityPending(state, actor, input) {
    const authority = object(input.authorityRef);
    return authority.status === "CONFIRMED" && (!text(authority.roleCode) || text(authority.roleCode) === text(actor.role)) ? null : fail(state, "PENDING_CONFIRMATION", "authorityRef", "รอยืนยันผู้มีอำนาจตามเอกสารต้นทาง");
  }

  function saveDraft(state, person, input, documentId, validator) {
    const record = active(state, documentId);
    if (person.role !== "investigator" || text(state.assignment?.primaryOfficerId) !== text(person.id)) return fail(state, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเท่านั้นที่แก้ไขเอกสารได้");
    const validation = validator(input.payload, { intent: "DRAFT" });
    if (!validation.ok) return { ...validation, state: copy(state) };
    return domain().saveA5DocumentDraft(state, { caseId: input.caseId, documentId, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, payload: copy(input.payload) });
  }

  function submitDocument(state, person, input, documentId, validator) {
    const record = active(state, documentId), validation = validator(record.payload, { intent: "SUBMISSION" });
    if (!validation.ok) return { ...validation, state: copy(state) };
    return domain().submitA5DocumentRevision(state, { caseId: input.caseId, documentId, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, submissionContext: { documentId, revisionNo: record.revisionNo } });
  }

  function reportPackage(state, record, lifecycle, input, person) {
    const payload = record.payload;
    const accusedRows = Array.isArray(payload.accusedPersons) ? payload.accusedPersons : [];
    const forms5 = accusedRows.map(row => { const form5 = active(state, form5DocId(row.rowId)); return { documentId: form5.documentId, accusedRowId: row.rowId, revisionNo: form5.revisionNo, snapshot: copy(form5.submittedSnapshot) }; });
    const forms6 = accusedRows.map(row => { const form6 = active(state, form6DocId(row.rowId)); return { documentId: form6.documentId, accusedRowId: row.rowId, revisionNo: form6.revisionNo, snapshot: copy(form6.submittedSnapshot) }; });
    return {
      packageId: input.packageId, caseId: input.caseId, report: { documentId: FORM_7_ID, revisionNo: record.revisionNo, snapshot: copy(record.payload) },
      appointmentOrder: copy(exactVersion(state, payload.intake?.appointmentOrder?.versionId)), forms5, forms6,
      serviceRecords: copy(lifecycle.services), defenceRecords: copy(lifecycle.defences),
      evidence: payload.evidence.map(item => copy(exactVersion(state, item.documentVersionId))), renderedPayload: renderReport644PaperA5(payload), submittedBy: person.id, submittedByName: person.name, submittedAt: input.at
    };
  }

  function validateSubmissionPrerequisites(state, lifecycle, record) {
    const payload = record.payload;
    if (!exactVersion(state, payload.intake?.appointmentOrder?.versionId)) return fail(state, "ATTACHMENT_VERSION_MISSING", "intake.appointmentOrder.versionId", "ไม่พบคำสั่งแต่งตั้งฉบับที่อ้างอิง");
    const accusedRows = Array.isArray(payload.accusedPersons) ? payload.accusedPersons : [];
    if (!accusedRows.length) return fail(state, "PACKAGE_INCOMPLETE", "accusedPersons", "ยังไม่มีผู้ถูกกล่าวหาในรายงาน");
    for (const row of accusedRows) {
      const form5 = active(state, form5DocId(row.rowId)), form6 = active(state, form6DocId(row.rowId));
      if (form5?.status !== "SUBMITTED" || !lifecycle.services.some(item => item.accusedRowId === row.rowId && item.noticeRevisionNo === form5.revisionNo && item.evidenceVersionIds.every(id => exactVersion(state, id)))) return fail(state, "PACKAGE_INCOMPLETE", "chargeNotice", `หนังสือแจ้งข้อกล่าวหาและหลักฐานการส่งของ ${show(row.name)} ยังไม่ครบ`);
      if (form6?.status !== "SUBMITTED" || !validateForm6A5(form6.payload, { intent: "SUBMISSION" }).ok || !exactVersion(state, form6.payload.copies[2]?.receiptEvidenceVersionId)) return fail(state, "PACKAGE_INCOMPLETE", "acknowledgement", `บันทึกแจ้งข้อกล่าวหาและหลักฐานรับสำเนาของ ${show(row.name)} ยังไม่ครบ`);
    }
    const defended = new Set(lifecycle.defences.map(item => item.accusedPersonRef));
    if (accusedRows.some(row => !defended.has(row.rowId))) return fail(state, "PACKAGE_INCOMPLETE", "defence", "ยังไม่มีคำให้การหรือบันทึกไม่ยื่นคำให้การของผู้ถูกกล่าวหาครบทุกคน");
    if ((payload.evidence || []).some(item => !exactVersion(state, item.documentVersionId))) return fail(state, "ATTACHMENT_VERSION_MISSING", "evidence", "พยานหลักฐานบางฉบับไม่พร้อมใช้");
    return null;
  }

  function executeReport644Action(sourceState, actor, action, command) {
    if (!ACTIONS.includes(action)) return fail(sourceState, "INVALID_TRANSITION", "action", "ไม่รู้จักขั้นตอนรายงาน 644");
    const context = commandContext(sourceState, actor, action, command);
    if (context.failure || context.replay) return context.failure || context.replay;
    let { state, person, input, lifecycle } = context;

    if (action === "additional-accused-request") {
      if (person.role !== "investigator" || text(state.assignment?.primaryOfficerId) !== person.id) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเท่านั้นที่จัดทำคำขอเพิ่มผู้ถูกกล่าวหาได้");
      const accused = object(input.accused);
      if (!text(input.requestId) || !text(accused.name) || !text(input.reason) || !text(input.evidenceSummary)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "additionalAccusedRequest", "ต้องระบุผู้ถูกกล่าวหา เหตุผล และพยานหลักฐานที่เชื่อมโยง");
      if (lifecycle.additionalAccusedRequests.some(item => item.requestId === input.requestId)) return fail(sourceState, "INVALID_TRANSITION", "requestId", "มีคำขอเพิ่มผู้ถูกกล่าวหารหัสนี้แล้ว");
      lifecycle.additionalAccusedRequests.push({
        requestId: input.requestId,
        status: "REQUESTED",
        accused: { name: text(accused.name), position: text(accused.position), agency: text(accused.agency) },
        reason: text(input.reason),
        evidenceSummary: text(input.evidenceSummary),
        requestedBy: person.id,
        requestedByName: person.name,
        requestedAt: input.at,
        signedOrder: null,
        accusedRowId: ""
      });
      bump(state);
      return finish(context, state, "ADDITIONAL_ACCUSED_REQUESTED");
    }

    if (action === "additional-accused-record-signed-order") {
      if (!['clerk', 'case-clerk'].includes(person.role)) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ธุรการคดีเป็นผู้บันทึกคำสั่งหรืออนุสนธิฉบับลงนาม");
      const request = lifecycle.additionalAccusedRequests.find(item => item.requestId === input.requestId);
      if (!request || request.status !== "REQUESTED") return fail(sourceState, "INVALID_TRANSITION", "requestId", "ไม่พบคำขอที่รอบันทึกคำสั่งฉบับลงนาม");
      const authority = object(input.authorityRef);
      if (authority.status !== "CONFIRMED" || !text(authority.referenceNo)) return fail(sourceState, "PENDING_CONFIRMATION", "authorityRef", "รอคำสั่งหรืออนุสนธิฉบับลงนามจากผู้มีอำนาจตามเอกสารต้นทาง");
      if (!text(input.orderNo) || !/^\d{4}-\d{2}-\d{2}$/.test(text(input.orderSignedAt))) return fail(sourceState, "MISSING_REQUIRED_FIELD", "signedOrder", "ต้องระบุเลขที่และวันที่ของคำสั่งหรืออนุสนธิฉบับลงนาม");
      if (!text(input.orderDocumentVersionId) || !exactVersion(state, input.orderDocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "orderDocumentVersionId", "ไม่พบคำสั่งหรืออนุสนธิฉบับลงนามในคลังเอกสาร");
      const form7 = active(state, FORM_7_ID);
      if (!form7) return fail(sourceState, "INVALID_TRANSITION", "report644", "ไม่พบร่างรายงาน 644");
      const rowId = `additional-accused-${text(input.requestId).replace(/[^A-Za-z0-9_-]/g, "-")}`;
      if ((form7.payload.accusedPersons || []).some(row => row.rowId === rowId)) return fail(sourceState, "INVALID_TRANSITION", "requestId", "ผู้ถูกกล่าวหาตามคำขอนี้ถูกเพิ่มแล้ว");
      form7.payload.accusedPersons = [...(form7.payload.accusedPersons || []), {
        rowId,
        order: (form7.payload.accusedPersons || []).length + 1,
        name: request.accused.name,
        position: request.accused.position,
        agency: request.accused.agency,
        idCardNo: "",
        rank: "",
        registeredAddress: "",
        currentStatus: "",
        dismissalNote: ""
      }];
      form7.payload = syncReport644DerivedRowsA5(form7.payload);
      form7.payload.intake = object(form7.payload.intake);
      form7.payload.intake.appointmentOrder = object(form7.payload.intake.appointmentOrder);
      form7.payload.intake.appointmentOrder.amendmentNote = `${input.orderNo} ลงวันที่ ${input.orderSignedAt}`;
      request.status = "ORDER_RECORDED";
      request.accusedRowId = rowId;
      request.signedOrder = {
        orderNo: input.orderNo,
        orderSignedAt: input.orderSignedAt,
        orderDocumentVersionId: input.orderDocumentVersionId,
        authorityRef: copy(authority),
        recordedBy: person.id,
        recordedByName: person.name,
        recordedAt: input.at
      };
      state.a5Report644Lifecycle = lifecycle;
      bump(state);
      const normalized = normalizeReport644A5(state);
      if (!normalized.ok) return { ...normalized, state: copy(sourceState) };
      state = normalized.state;
      context.lifecycle = state.a5Report644Lifecycle;
      return finish(context, state, "ADDITIONAL_ACCUSED_ORDER_RECORDED", { accusedRowId: rowId });
    }

    if (action === "report-644-save") {
      const saved = saveDraft(state, person, input, FORM_7_ID, validateReport644A5);
      return saved.ok ? { ...saved, code: "REPORT_644_DRAFT_SAVED" } : { ...saved, state: copy(sourceState) };
    }

    if (["form-5-save", "form-6-save"].includes(action)) {
      const accusedRowId = text(input.accusedRowId);
      if (!accusedRowId) return fail(sourceState, "MISSING_REQUIRED_FIELD", "accusedRowId", "ไม่พบผู้ถูกกล่าวหาที่อ้างอิงเอกสารนี้");
      const config = action === "form-5-save" ? [form5DocId(accusedRowId), validateForm5A5, "FORM_5_DRAFT_SAVED"] : [form6DocId(accusedRowId), validateForm6A5, "FORM_6_DRAFT_SAVED"];
      const saved = saveDraft(state, person, input, config[0], config[1]);
      return saved.ok ? { ...saved, code: config[2] } : { ...saved, state: copy(sourceState) };
    }

    if (["form-5-submit", "form-6-submit"].includes(action)) {
      if (person.role !== "investigator") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเท่านั้นที่เสนอเอกสารได้");
      const accusedRowId = text(input.accusedRowId);
      if (!accusedRowId) return fail(sourceState, "MISSING_REQUIRED_FIELD", "accusedRowId", "ไม่พบผู้ถูกกล่าวหาที่อ้างอิงเอกสารนี้");
      const config = action === "form-5-submit" ? [form5DocId(accusedRowId), validateForm5A5, "FORM_5_SUBMITTED"] : [form6DocId(accusedRowId), validateForm6A5, "FORM_6_SUBMITTED"];
      if (action === "form-6-submit") {
        const noticeRef = active(state, form6DocId(accusedRowId))?.payload.noticeRef;
        if (noticeRef?.documentId !== form5DocId(accusedRowId) || !exact(state, noticeRef.documentId, noticeRef.revisionNo)?.submittedSnapshot) return fail(sourceState, "PACKAGE_INCOMPLETE", "noticeRef", "หนังสือแจ้งข้อกล่าวหาฉบับอ้างอิงยังไม่ได้เสนอ");
      }
      const submitted = submitDocument(state, person, input, config[0], config[1]);
      return submitted.ok ? { ...submitted, code: config[2] } : { ...submitted, state: copy(sourceState) };
    }

    if (action === "form-5-sign") {
      const accusedRowId = text(input.accusedRowId);
      const notice = accusedRowId ? active(state, form5DocId(accusedRowId)) : null;
      if (!notice || notice.status !== "SUBMITTED") return fail(sourceState, "INVALID_TRANSITION", "status", "หนังสือแจ้งข้อกล่าวหายังไม่ได้เสนอหรือลงนามแล้ว");
      if (!text(input.methodLabel)) return fail(sourceState, "SIGNATURE_REQUIRED", "methodLabel", "ต้องระบุวิธีลงนาม");
      notice.payload.signer = { authorityStatus: "CONFIRMED", displayName: person.name, role: person.role };
      lifecycle.form5Signatures = Array.isArray(lifecycle.form5Signatures) ? lifecycle.form5Signatures : [];
      lifecycle.form5Signatures.push({ accusedRowId, documentId: notice.documentId, revisionNo: notice.revisionNo, signedBy: person.id, signerName: person.name, signerRole: person.role, signedAt: input.at, methodLabel: input.methodLabel });
      bump(state);
      return finish(context, state, "FORM_5_SIGNED");
    }

    if (action === "form-5-service-record") {
      const accusedRowId = text(input.accusedRowId);
      const notice = accusedRowId ? active(state, form5DocId(accusedRowId)) : null;
      if (!notice || notice.status !== "SUBMITTED" || notice.payload.signer?.authorityStatus !== "CONFIRMED") return fail(sourceState, "SIGNATURE_REQUIRED", "signer", "ต้องลงนามหนังสือแจ้งข้อกล่าวหาก่อนบันทึกหลักฐานการส่ง");
      if (!text(input.serviceRecordId) || !text(input.servedAt) || !(input.evidenceVersionIds || []).length || input.evidenceVersionIds.some(id => !exactVersion(state, id))) return fail(sourceState, "RECEIPT_REQUIRED", "evidenceVersionIds", "ต้องมีหนังสือแจ้งฉบับที่เสนอและหลักฐานการส่งที่ตรวจสอบได้");
      lifecycle.services.push({ serviceRecordId: input.serviceRecordId, accusedRowId, noticeRevisionNo: notice.revisionNo, method: text(input.method), recipient: text(input.recipient), servedAt: input.servedAt, evidenceVersionIds: copy(input.evidenceVersionIds), recordedBy: person.id, recordedAt: input.at });
      // ส่วนที่ ๓ ของแบบ ๖ อ้างวันที่ตามใบตอบรับไปรษณีย์ของแบบ ๕ (source map form-6 §page3) — derive แทนให้กรอกซ้ำ
      const record6 = active(state, form6DocId(accusedRowId));
      if (record6 && record6.status === "DRAFT") {
        record6.payload.acknowledgement = record6.payload.acknowledgement || {};
        record6.payload.acknowledgement.receivedDate = input.servedAt;
        record6.payload.acknowledgement.explainByDate = addDaysISO(input.servedAt, 30);
      }
      syncChargeNoticePerAccused(active(state, FORM_7_ID), lifecycle);
      bump(state);
      return finish(context, state, "FORM_5_SERVICE_RECORDED");
    }

    if (action === "panel-objection-record") {
      const accusedRowId = text(input.accusedRowId);
      if (!accusedRowId || !text(input.objectionId) || !text(input.panelRowId) || !text(input.reason) || !text(input.filedAt)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "reason", "ต้องระบุผู้ถูกคัดค้าน เหตุผล และวันที่ยื่นคำร้องคัดค้าน");
      lifecycle.panelObjections = Array.isArray(lifecycle.panelObjections) ? lifecycle.panelObjections : [];
      lifecycle.panelObjections.push({ objectionId: input.objectionId, accusedRowId, panelRowId: input.panelRowId, reason: text(input.reason), filedAt: input.filedAt, status: "RECEIVED_PENDING_PANEL_CHANGE", recordedBy: person.id, recordedAt: input.at });
      bump(state);
      return finish(context, state, "PANEL_OBJECTION_RECORDED");
    }

    if (action === "defence-record") {
      if (!text(input.defenceRecordId) || !text(input.accusedPersonRef) || (!text(input.statement) && input.noDefence !== true)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "statement", "ต้องบันทึกคำให้การหรือระบุว่าไม่ยื่นคำให้การ");
      lifecycle.defences.push({ defenceRecordId: input.defenceRecordId, accusedPersonRef: input.accusedPersonRef, statement: text(input.statement), noDefence: input.noDefence === true, attachmentVersionIds: copy(input.attachmentVersionIds || []), recordedBy: person.id, recordedAt: input.at });
      syncChargeNoticePerAccused(active(state, FORM_7_ID), lifecycle);
      bump(state);
      return finish(context, state, "DEFENCE_RECORDED");
    }

    if (action === "report-644-submit") {
      if (person.role !== "investigator" || text(state.assignment?.primaryOfficerId) !== person.id) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้รับผิดชอบสำนวนเท่านั้นที่เสนอรายงานได้");
      const reviewConfiguration = object(input.reviewConfiguration);
      const reviewAuthority = object(reviewConfiguration.authorityRef);
      if (typeof reviewConfiguration.includeLineSupervisor !== "boolean" || typeof reviewConfiguration.includeSupervisingExecutive !== "boolean" || Number(reviewConfiguration.assignmentVersion || 0) !== Number(state.assignment?.assignmentVersion || 0) || reviewAuthority.status !== "CONFIRMED" || !text(reviewAuthority.referenceNo)) {
        return fail(sourceState, "PENDING_CONFIRMATION", "reviewConfiguration", "ต้องยืนยันสาย ผอ.กลุ่มงาน ผู้ช่วย/รองเลขาธิการ และรุ่นคำสั่งมอบหมายก่อนเสนอรายงาน");
      }
      const record = active(state, FORM_7_ID), validation = validateReport644A5(record.payload, { intent: "SUBMISSION" });
      if (!validation.ok) return { ...validation, state: copy(sourceState) };
      const prerequisite = validateSubmissionPrerequisites(state, lifecycle, record);
      if (prerequisite) return { ...prerequisite, state: copy(sourceState) };
      if (!text(input.packageId)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "packageId", "ไม่พบเลขอ้างอิงชุดเสนอรายงาน");
      const packageRecord = reportPackage(state, record, lifecycle, input, person);
      const submitted = domain().submitA5DocumentRevision(state, { caseId: input.caseId, documentId: FORM_7_ID, revisionNo: record.revisionNo, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, submissionContext: copy(packageRecord) });
      if (!submitted.ok) return { ...submitted, state: copy(sourceState) };
      state = submitted.state;
      lifecycle.submissions.push(packageRecord);
      lifecycle.reviewConfiguration = copy(reviewConfiguration);
      lifecycle.reviewChain = buildReport644ReviewChainA5(reviewConfiguration);
      lifecycle.status = "REPORT_644_REVIEW_PENDING";
      return finish(context, state, "REPORT_644_SUBMITTED", { package: copy(packageRecord) });
    }

    const submission = lifecycle.submissions.at(-1);
    if (!submission) return fail(sourceState, "PACKAGE_INCOMPLETE", "submissionPackage", "ยังไม่มีชุดเสนอรายงาน 644");
    const pending = authorityPending(sourceState, person, input);
    if (pending && !["report-644-sign", "report-644-record-receipt"].includes(action)) return pending;

    if (action === "report-644-review-record-opinion") {
      if (lifecycle.status !== "REPORT_644_REVIEW_PENDING") return fail(sourceState, "INVALID_TRANSITION", "status", "รายงานไม่ได้อยู่ระหว่างตรวจ");
      if (!text(input.opinionText) || !text(input.opinionId)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "opinionText", "ต้องระบุความเห็นและเลขอ้างอิงความเห็น");
      if (!text(object(input.signature).methodLabel)) return fail(sourceState, "SIGNATURE_REQUIRED", "signature", "ผู้ให้ความเห็นต้องลงนาม");
      const step = currentReviewStep(lifecycle);
      if (!actorCanReview(step, person, input)) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้ใช้นี้ไม่ใช่ผู้ตรวจในลำดับปัจจุบันหรือคำสั่งมอบหมายไม่ตรงรุ่น");
      if (step.stepType === REPORT_644_REVIEW_STEPS.UNIT_DIRECTOR && !text(submission.submittedBy)) return fail(sourceState, "PENDING_CONFIRMATION", "submittedBy", "ไม่พบผู้จัดทำรายงาน 644 ที่จะได้รับแต้ม");
      const opinion = {
        opinionId: text(input.opinionId), reportDocumentId: FORM_7_ID, reportRevisionNo: submission.report.revisionNo,
        sequence: lifecycle.reviewOpinions.length + 1, stepId: step.stepId, stepType: step.stepType,
        reviewerId: person.id, reviewerName: person.name, reviewerRole: text(input.positionName) || step.roleLabel,
        reviewerRoleCode: person.role, authorityRef: copy(object(input.authorityRef)), assignmentVersion: Number(input.assignmentVersion || 0),
        decision: "ENDORSE", opinionText: text(input.opinionText), affectedFields: [], affectedDocumentVersionIds: [], recordedAt: input.at,
        signature: { signedBy: person.id, signedAt: input.at, methodLabel: text(object(input.signature).methodLabel) }
      };
      lifecycle.reviewOpinions.push(opinion);
      lifecycle.signatures.push({ signatureType: step.stepType, submissionPackageId: submission.packageId, reportRevisionNo: submission.report.revisionNo, signedBy: person.id, signerName: person.name, signerRole: opinion.reviewerRole, signedAt: input.at, methodLabel: opinion.signature.methodLabel, authorityRef: copy(opinion.authorityRef) });
      const next = advanceReview(lifecycle, step, opinion.opinionId, input.at);
      if (!next) lifecycle.status = "REPORT_644_ROUTE_PENDING";
      if (step.stepType === REPORT_644_REVIEW_STEPS.UNIT_DIRECTOR) {
        const meritApi = root.ECMISActivity5MeritPoints || (typeof require === "function" ? require("./activity5-merit-points.js") : null);
        if (!meritApi) return fail(sourceState, "DEPENDENCY_UNAVAILABLE", "meritPoints", "ไม่พบระบบนับแต้ม 644");
        const meritResult = meritApi.accrue(state, { officerId: submission.submittedBy, officerName: text(submission.submittedByName), reportType: "644", caseId: state.caseData?.id, signedAt: input.at, signedBy: person.id });
        if (!meritResult.ok && meritResult.code !== "ALREADY_AWARDED") return { ...meritResult, state: copy(sourceState) };
        if (meritResult.ok) lifecycle.auditHistory.push({ action: "merit-accrue-644", fromStatus: "REPORT_644_REVIEW_PENDING", toStatus: "MERIT_ACCRUED", by: person.id, role: person.role, at: input.at, beneficiaryId: submission.submittedBy });
      }
      bump(state);
      return finish(context, state, "REPORT_644_OPINION_RECORDED", { opinion: copy(opinion) });
    }

    if (action === "report-644-review-return") {
      if (lifecycle.status !== "REPORT_644_REVIEW_PENDING") return fail(sourceState, "INVALID_TRANSITION", "status", "รายงานไม่ได้อยู่ระหว่างตรวจ");
      const step = currentReviewStep(lifecycle);
      if (!actorCanReview(step, person, input)) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ผู้ใช้นี้ไม่ใช่ผู้ตรวจในลำดับปัจจุบันหรือคำสั่งมอบหมายไม่ตรงรุ่น");
      const affectedFields = (input.affectedFields || []).map(text).filter(Boolean), affectedDocumentVersionIds = (input.affectedDocumentVersionIds || []).map(text).filter(Boolean);
      if (!text(input.reason) || (!affectedFields.length && !affectedDocumentVersionIds.length)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "reason", "ต้องระบุเหตุผลและส่วนหรือเอกสารที่ต้องแก้ไข");
      const returned = domain().returnA5DocumentRevision(state, { caseId: input.caseId, documentId: FORM_7_ID, revisionNo: submission.report.revisionNo, expectedVersion: input.expectedVersion, actorId: person.id, at: input.at, idempotencyKey: input.idempotencyKey, reason: input.reason, affectedFields, affectedDocumentVersionIds });
      if (!returned.ok) return { ...returned, state: copy(sourceState) };
      state = returned.state;
      lifecycle.reviewOpinions.push({ opinionId: input.opinionId || `return-${input.idempotencyKey}`, reportDocumentId: FORM_7_ID, reportRevisionNo: submission.report.revisionNo, sequence: lifecycle.reviewOpinions.length + 1, stepId: step.stepId, stepType: step.stepType, reviewerId: person.id, reviewerName: person.name, reviewerRole: text(input.positionName) || step.roleLabel, reviewerRoleCode: person.role, authorityRef: copy(object(input.authorityRef)), decision: "RETURN", opinionText: input.reason, affectedFields, affectedDocumentVersionIds, recordedAt: input.at, signature: null });
      lifecycle.returnOrders.push({
        returnOrderId: `return-order-${input.idempotencyKey}`, caseId: input.caseId, reportRevisionNo: submission.report.revisionNo,
        correctionRevisionNo: submission.report.revisionNo + 1, reason: text(input.reason), instruction: text(input.instruction),
        affectedFields, affectedDocumentVersionIds, orderedAt: input.at, durationDays: 30,
        deadlineStartAt: "", deadlineAt: "", deadlineRuleStatus: "PENDING_CONFIRMATION",
        orderedBy: person.id, orderedByName: person.name, stepId: step.stepId
      });
      lifecycle.status = "REPORT_644_RETURNED";
      return finish(context, state, "REPORT_644_RETURNED", { revisionNo: submission.report.revisionNo + 1 });
    }

    if (action === "report-644-sign") {
      return fail(sourceState, "INVALID_TRANSITION", "action", "การลงนาม Record 10 ต้องทำในขั้นบันทึกความเห็นของผู้ตรวจตามลำดับ");
    }

    if (action === "report-644-route-select") {
      if (lifecycle.status !== "REPORT_644_ROUTE_PENDING") return fail(sourceState, "INVALID_TRANSITION", "status", "รายงานยังตรวจไม่ครบทุกชั้น");
      if (person.role !== "secretary") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "เลขาธิการเป็นผู้เลือกเส้นทางเสนอรายงาน 644");
      const route = text(input.route);
      if (!Object.values(REPORT_644_ROUTES).includes(route) || !text(input.reason)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "route", "ต้องเลือกเส้นทางและระบุเหตุผล");
      if (route === REPORT_644_ROUTES.SUPPORT_COMMITTEE && !["SUPPORT_1", "SUPPORT_2"].includes(text(input.committeeId))) return fail(sourceState, "MISSING_REQUIRED_FIELD", "committeeId", "ต้องระบุคณะอนุกรรมการสนับสนุนที่รับเรื่อง");
      lifecycle.route = route;
      lifecycle.routeHistory.push({ route, committeeId: text(input.committeeId), reason: text(input.reason), selectedBy: person.id, selectedAt: input.at });
      lifecycle.status = route === REPORT_644_ROUTES.NORMAL ? "REPORT_644_BOARD_READY" : route === REPORT_644_ROUTES.URGENT ? "REPORT_644_URGENT_LETTER_PENDING" : "REPORT_644_SUPPORT_COMMITTEE_PENDING";
      bump(state);
      return finish(context, state, "REPORT_644_ROUTE_SELECTED", { route: copy(lifecycle.routeHistory.at(-1)) });
    }

    if (action === "report-644-urgent-letter-attach") {
      if (lifecycle.status !== "REPORT_644_URGENT_LETTER_PENDING" || lifecycle.route !== REPORT_644_ROUTES.URGENT) return fail(sourceState, "INVALID_TRANSITION", "status", "สำนวนไม่ได้อยู่ในขั้นแนบหนังสือขอบรรจุวาระด่วน");
      if (!text(input.documentVersionId) || !text(input.referenceNo) || !text(input.reason)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "documentVersionId", "ต้องแนบหนังสือขอบรรจุวาระด่วนและระบุเหตุผล");
      if (!exactVersion(state, input.documentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "documentVersionId", "ไม่พบหนังสือขอบรรจุวาระด่วนฉบับที่อ้างอิง");
      const document = { documentType: "URGENT_AGENDA_REQUEST", documentVersionId: text(input.documentVersionId), referenceNo: text(input.referenceNo), reason: text(input.reason), attachedBy: person.id, attachedAt: input.at };
      lifecycle.supplementalDocuments.push(document);
      lifecycle.status = "REPORT_644_BOARD_READY";
      bump(state);
      return finish(context, state, "REPORT_644_URGENT_LETTER_ATTACHED", { document: copy(document) });
    }

    if (action === "report-644-support-record-opinion") {
      if (lifecycle.status !== "REPORT_644_SUPPORT_COMMITTEE_PENDING" || lifecycle.route !== REPORT_644_ROUTES.SUPPORT_COMMITTEE) return fail(sourceState, "INVALID_TRANSITION", "status", "สำนวนไม่ได้อยู่ระหว่างคณะอนุกรรมการสนับสนุนพิจารณา");
      const selected = lifecycle.routeHistory.at(-1);
      const authority = object(input.authorityRef);
      if (!["committee", "clerk"].includes(person.role) || text(authority.committeeId) !== text(selected.committeeId)) return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ต้องเป็นคณะอนุกรรมการสนับสนุนที่ได้รับมอบหมายหรือธุรการผู้บันทึกรับความเห็นฉบับลงนาม");
      if (!text(input.opinionText) || !text(input.documentVersionId) || !text(object(input.signature).methodLabel)) return fail(sourceState, "MISSING_REQUIRED_FIELD", "opinionText", "ต้องมีความเห็น เอกสารประกอบ และลายเซ็น");
      if (!exactVersion(state, input.documentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "documentVersionId", "ไม่พบเอกสารความเห็นคณะอนุกรรมการสนับสนุนฉบับที่อ้างอิง");
      const opinion = { committeeId: selected.committeeId, opinionText: text(input.opinionText), documentVersionId: text(input.documentVersionId), recordedBy: person.id, recorderName: person.name, recordedAt: input.at, authorityRef: copy(authority), signature: { signedBy: person.id, signedAt: input.at, methodLabel: text(object(input.signature).methodLabel) } };
      lifecycle.supportCommitteeOpinions.push(opinion);
      lifecycle.supplementalDocuments.push({ documentType: "SUPPORT_COMMITTEE_OPINION", documentVersionId: opinion.documentVersionId, committeeId: opinion.committeeId, attachedBy: person.id, attachedAt: input.at });
      lifecycle.status = "REPORT_644_SUPPORT_SECRETARY_CONFIRM_PENDING";
      bump(state);
      return finish(context, state, "REPORT_644_SUPPORT_OPINION_RECORDED", { opinion: copy(opinion) });
    }

    if (action === "report-644-secretary-confirm-support") {
      if (lifecycle.status !== "REPORT_644_SUPPORT_SECRETARY_CONFIRM_PENDING") return fail(sourceState, "INVALID_TRANSITION", "status", "ยังไม่มีความเห็นคณะอนุกรรมการสนับสนุนให้เลขาธิการยืนยัน");
      if (person.role !== "secretary") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "เลขาธิการเป็นผู้ยืนยันความเห็นคณะอนุกรรมการสนับสนุน");
      if (!text(input.opinionText) || !text(input.methodLabel)) return fail(sourceState, "SIGNATURE_REQUIRED", "methodLabel", "ต้องให้ความเห็นและลงนามยืนยัน");
      lifecycle.signatures.push({ signatureType: "SECRETARY_SUPPORT_CONFIRMATION", submissionPackageId: submission.packageId, reportRevisionNo: submission.report.revisionNo, signedBy: person.id, signerName: person.name, signerRole: text(input.positionName) || "เลขาธิการ ป.ป.ท.", opinionText: text(input.opinionText), signedAt: input.at, methodLabel: text(input.methodLabel), authorityRef: copy(object(input.authorityRef)) });
      lifecycle.status = "REPORT_644_BOARD_READY";
      bump(state);
      return finish(context, state, "REPORT_644_SUPPORT_CONFIRMED");
    }

    if (action === "report-644-create-package") {
      if (lifecycle.status !== "REPORT_644_BOARD_READY") return fail(sourceState, "INVALID_TRANSITION", "status", "รายงานยังไม่พร้อมจัดชุดส่งกิจกรรมที่ 7");
      if (person.role !== "clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "เจ้าหน้าที่รับส่งเป็นผู้จัดชุดเอกสารส่งกิจกรรมที่ 7");
      const unitDirectorSignature = lifecycle.signatures.find(item => item.submissionPackageId === submission.packageId && item.signatureType === REPORT_644_REVIEW_STEPS.UNIT_DIRECTOR);
      if (!unitDirectorSignature) return fail(sourceState, "SIGNATURE_REQUIRED", "signature", "ต้องมีลายมือชื่อ ผอ.เขต/ผอ.กอง ก่อนจัดชุด");
      if (!text(input.coverDocumentVersionId) || !exactVersion(state, input.coverDocumentVersionId)) return fail(sourceState, "ATTACHMENT_VERSION_MISSING", "coverDocumentVersionId", "ไม่พบหนังสือเสนอรายงานฉบับที่อ้างอิง");
      const urgentDocument = lifecycle.supplementalDocuments.find(item => item.documentType === "URGENT_AGENDA_REQUEST");
      if (lifecycle.route === REPORT_644_ROUTES.URGENT && !urgentDocument) return fail(sourceState, "PACKAGE_INCOMPLETE", "urgentDocumentVersionId", "ชุดเร่งด่วนไม่มีหนังสือขอบรรจุวาระด่วน");
      const packageRecord = {
        packageId: input.boardPackageId || `board-${submission.packageId}`, submissionPackageId: submission.packageId,
        signedReportRef: { documentId: FORM_7_ID, revisionNo: submission.report.revisionNo, signature: copy(unitDirectorSignature) },
        coverDocumentVersionId: text(input.coverDocumentVersionId), urgentDocumentVersionId: text(urgentDocument?.documentVersionId),
        supportOpinionDocumentVersionIds: lifecycle.supportCommitteeOpinions.map(item => item.documentVersionId),
        reviewOpinionIds: lifecycle.reviewOpinions.filter(item => item.reportRevisionNo === submission.report.revisionNo).map(item => item.opinionId),
        attachmentVersionIds: copy(input.attachmentVersionIds || []), route: lifecycle.route, createdAt: input.at
      };
      lifecycle.packages.push(packageRecord); bump(state);
      return finish(context, state, "REPORT_644_PACKAGE_CREATED", { boardPackage: copy(packageRecord) });
    }

    const boardPackage = lifecycle.packages.at(-1);
    if (!boardPackage) return fail(sourceState, "PACKAGE_INCOMPLETE", "boardPackage", "ยังไม่มีชุดเอกสารเสนอคณะกรรมการ");
    if (action === "report-644-send-a7") {
      if (lifecycle.status !== "REPORT_644_BOARD_READY") return fail(sourceState, "INVALID_TRANSITION", "status", "ชุดเอกสารยังไม่พร้อมส่งกิจกรรมที่ 7");
      if (person.role !== "clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "เจ้าหน้าที่รับส่งเป็นผู้ส่งชุดเอกสารไปกิจกรรมที่ 7");
      if (object(input.recipientAuthority).status !== "CONFIRMED") return fail(sourceState, "RECIPIENT_UNCONFIRMED", "recipientAuthority", "รอยืนยันหน่วยงานผู้รับ");
      if (!["dispatchId", "recipientName", "letterNo", "dispatchedAt", "deliveryMethod"].every(field => text(input[field]))) return fail(sourceState, "MISSING_REQUIRED_FIELD", "dispatch", "ข้อมูลจัดส่งไม่ครบถ้วน");
      lifecycle.dispatches.push({ dispatchId: input.dispatchId, packageId: boardPackage.packageId, recipientName: input.recipientName, letterNo: input.letterNo, dispatchedAt: input.dispatchedAt, dispatchedBy: person.id, deliveryMethod: input.deliveryMethod, trackingNo: text(input.trackingNo), receivedAt: "", receivedBy: "", evidenceVersionIds: [] });
      lifecycle.status = "REPORT_644_SENT_TO_A7"; bump(state);
      return finish(context, state, "REPORT_644_DISPATCHED");
    }
    if (action === "report-644-record-receipt") {
      if (person.role !== "clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "เจ้าหน้าที่รับส่งเป็นผู้บันทึกหลักฐานรับ");
      const dispatch = lifecycle.dispatches.at(-1);
      if (!dispatch || !text(input.receivedAt) || !text(input.receivedBy) || !(input.evidenceVersionIds || []).length) return fail(sourceState, "RECEIPT_REQUIRED", "receivedAt", "ข้อมูลและหลักฐานการรับไม่ครบถ้วน");
      Object.assign(dispatch, { receivedAt: input.receivedAt, receivedBy: input.receivedBy, evidenceVersionIds: copy(input.evidenceVersionIds) });
      lifecycle.receipts.push({ dispatchId: dispatch.dispatchId, receivedAt: input.receivedAt, receivedBy: input.receivedBy, evidenceVersionIds: copy(input.evidenceVersionIds), recordedBy: person.id });
      lifecycle.status = "REPORT_644_WAIT_RESULT"; bump(state);
      return finish(context, state, "REPORT_644_RECEIPT_RECORDED");
    }
    if (lifecycle.status !== "REPORT_644_WAIT_RESULT") return fail(sourceState, "INVALID_TRANSITION", "status", "ยังไม่พร้อมบันทึกผลพิจารณา");
    if (person.role !== "clerk") return fail(sourceState, "FORBIDDEN_ACTOR", "actor", "ธุรการคดีเป็นผู้บันทึกรับผลจากกิจกรรมที่ 7");
    if (lifecycle.results.length) return fail(sourceState, "RESULT_ALREADY_RECORDED", "result", "บันทึกผลพิจารณาแล้ว");
    if (!["resultCode", "resultReference", "decidedAt"].every(field => text(input[field]))) return fail(sourceState, "MISSING_REQUIRED_FIELD", "resultCode", "ข้อมูลผลพิจารณาไม่ครบถ้วน");
    if (!["APPROVED", "RETURN_FOR_CORRECTION", "SUPPORTING_SUBCOMMITTEE", "ADDITIONAL_INQUIRY"].includes(text(input.resultCode))) return fail(sourceState, "INVALID_RESULT_CODE", "resultCode", "ผลนี้เป็นมติชี้มูลของ Record 11 ไม่ใช่ผลตรวจเสนอใน Record 10");
    lifecycle.results.push({ packageId: boardPackage.packageId, resultCode: input.resultCode, resultLabel: text(input.resultLabel), resultReference: input.resultReference, decidedAt: input.decidedAt, recordedBy: person.id, recordedAt: input.at });
    lifecycle.status = "REPORT_644_RESULT_RECEIVED"; bump(state);
    return finish(context, state, "REPORT_644_RESULT_RECORDED");
  }

  const REPORT_644_ROW_DEFINITIONS = Object.freeze({
    accusers: Object.freeze({ prefix: "accuser", defaults: { name: "", address: "", capacity: "", anonymized: false } }),
    allegations: Object.freeze({ prefix: "allegation", defaults: { summary: "", eventDescription: "" } }),
    evidence: Object.freeze({ prefix: "evidence", defaults: { category: "", title: "", factSupported: "", custodyNote: "", documentVersionId: "" } }),
    otherMeasures: Object.freeze({ prefix: "measure", defaults: { kind: "", detail: "", result: "" } }),
    limitation: Object.freeze({ prefix: "limitation", defaults: { allegationRowId: "", startAt: "", expiresAt: "", source: "", note: "" } }),
    legalBasis: Object.freeze({ prefix: "law", defaults: { lawName: "", section: "", applicationReason: "" } })
  });

  function nextStableRowId(prefix, rows) {
    const used = new Set(rows.map(row => text(row?.rowId)));
    let sequence = rows.length + 1;
    while (used.has(`${prefix}-${sequence}`)) sequence += 1;
    return `${prefix}-${sequence}`;
  }

  function syncReport644DerivedRowsA5(sourcePayload) {
    const payload = copy(sourcePayload);
    const accusedRows = Array.isArray(payload.accusedPersons) ? payload.accusedPersons : [];
    const allegationRows = Array.isArray(payload.allegations) ? payload.allegations : [];
    const accusedIds = new Set(accusedRows.map(row => text(row?.rowId)).filter(Boolean));
    const allegationIds = new Set(allegationRows.map(row => text(row?.rowId)).filter(Boolean));
    const adjudication = object(payload.adjudication);
    const existingIssues = new Map((Array.isArray(adjudication.perAccused) ? adjudication.perAccused : []).map(row => [text(row?.accusedRowId), row]));
    adjudication.perAccused = accusedRows.filter(row => accusedIds.has(text(row?.rowId))).map(row => ({
      accusedRowId: text(row.rowId), statusIssue: "", authorityIssue: "", conductIssue: "", damageIssue: "",
      ...copy(existingIssues.get(text(row.rowId)) || {})
    }));
    adjudication.opinions = Array.isArray(adjudication.opinions) ? adjudication.opinions : [];
    payload.adjudication = adjudication;

    const existingConclusions = new Map((Array.isArray(payload.offenceConclusions) ? payload.offenceConclusions : []).map(row => [`${text(row?.accusedRowId)}::${text(row?.allegationRowId)}`, row]));
    payload.offenceConclusions = accusedRows.flatMap(accused => allegationRows.map(allegation => {
      const key = `${text(accused.rowId)}::${text(allegation.rowId)}`;
      return {
        rowId: `conclusion-${text(accused.rowId)}-${text(allegation.rowId)}`,
        order: 0,
        accusedRowId: text(accused.rowId),
        allegationRowId: text(allegation.rowId),
        dropped: false,
        droppedReason: "",
        criminalCharges: [],
        disciplinaryCharges: [],
        otherRouting: { type: "", detail: "" },
        ...copy(existingConclusions.get(key) || {})
      };
    })).map((row, index) => ({ ...row, order: index + 1 }));
    payload.limitation = (Array.isArray(payload.limitation) ? payload.limitation : []).filter(row => !text(row?.allegationRowId) || allegationIds.has(text(row.allegationRowId)));
    return payload;
  }

  function mutateReport644RowsA5(sourcePayload, command = {}) {
    const payload = copy(sourcePayload);
    const path = text(command.path);
    const definition = REPORT_644_ROW_DEFINITIONS[path];
    if (!definition) return payload;
    const rows = Array.isArray(payload[path]) ? payload[path] : [];
    if (command.action === "add") rows.push({ rowId: nextStableRowId(definition.prefix, rows), order: rows.length + 1, ...copy(definition.defaults) });
    if (command.action === "delete") rows.splice(0, rows.length, ...rows.filter(row => text(row?.rowId) !== text(command.rowId)));
    if (command.action === "move") {
      const from = rows.findIndex(row => text(row?.rowId) === text(command.rowId));
      const to = from + Number(command.direction || 0);
      if (from >= 0 && to >= 0 && to < rows.length) rows.splice(to, 0, rows.splice(from, 1)[0]);
    }
    payload[path] = rows.map((row, index) => ({ ...row, order: index + 1 }));
    return syncReport644DerivedRowsA5(payload);
  }

  const SECTION_TITLES = Object.freeze([
    "การรับเรื่อง", "ผู้กล่าวหา", "ผู้ถูกกล่าวหา", "ข้อกล่าวหา", "พยานหลักฐาน", "การดำเนินการอื่น", "วันเวลาและสถานที่เกิดเหตุ",
    "ความเสียหาย", "อายุความ", "กฎหมายและระเบียบที่เกี่ยวข้อง", "การแจ้งข้อกล่าวหาและการชี้แจงแก้ข้อกล่าวหา", "เหตุผลในการพิจารณาวินิจฉัย", "สรุปบทความผิดผู้ถูกกล่าวหา", "ข้อเสนอ"
  ]);
  const EMPTY_LABEL = "ยังไม่มีรายการ";
  const show = value => text(value) || "เอกสารไม่ระบุ";
  const setPathValue = (target, path, value) => {
    const parts = path.split(".");
    let current = target;
    parts.forEach((part, index) => {
      const key = /^\d+$/.test(part) ? Number(part) : part;
      if (index === parts.length - 1) current[key] = value;
      else current = current[key];
    });
  };
  const control = (label, path, value, disabled, type = "textarea") => `<label class="a5-report-field"><span>${escapeHtml(label)}</span>${type === "input" ? `<input data-a5-644-path="${path}" value="${escapeHtml(value)}"${disabled}>` : `<textarea data-a5-644-path="${path}"${disabled}>${escapeHtml(value)}</textarea>`}</label>`;
  const hidden = (path, value) => `<input type="hidden" data-a5-644-path="${path}" value="${escapeHtml(value)}">`;
  const rows = (items, render) => Array.isArray(items) && items.length ? items.map(render).join("") : `<p class="a5-report-blank">${EMPTY_LABEL}</p>`;
  const card = (content, index) => `<div class="a5-report-644-row"><strong>รายการที่ ${index + 1}</strong>${content}</div>`;
  const mutableRows = (path, items, render, disabled) => {
    const list = Array.isArray(items) ? items : [];
    const content = list.length ? list.map((row, index, all) => `<div class="a5-report-644-row" data-a5-644-row="${escapeHtml(path)}" data-row-key="${escapeHtml(row.rowId)}"><strong>รายการที่ ${index + 1}</strong>${render(row, index)}${disabled ? "" : `<div class="ws-actions"><button type="button" class="ws-button ghost" data-a5-644-row-action="move" data-path="${escapeHtml(path)}" data-row-key="${escapeHtml(row.rowId)}" data-direction="-1"${index === 0 ? " disabled" : ""}>เลื่อนขึ้น</button><button type="button" class="ws-button ghost" data-a5-644-row-action="move" data-path="${escapeHtml(path)}" data-row-key="${escapeHtml(row.rowId)}" data-direction="1"${index === all.length - 1 ? " disabled" : ""}>เลื่อนลง</button><button type="button" class="ws-button danger" data-a5-644-row-action="delete" data-path="${escapeHtml(path)}" data-row-key="${escapeHtml(row.rowId)}">ลบรายการ</button></div>`}</div>`).join("") : `<p class="a5-report-blank">${EMPTY_LABEL}</p>`;
    return `${content}${disabled ? "" : `<button type="button" class="ws-button secondary" data-a5-644-row-action="add" data-path="${escapeHtml(path)}">เพิ่มรายการ</button>`}`;
  };
  const opinionKindLabel = kind => kind === "MAJORITY" ? "ความเห็นข้างมาก" : kind === "MINORITY" ? "ความเห็นข้างน้อย" : "เอกสารไม่ระบุ";

  const selectField = (label, path, value, disabled, optionsMap, includeBlank = true) => `<label class="a5-report-field"><span>${escapeHtml(label)}</span><select data-a5-644-path="${path}"${disabled}>${includeBlank ? `<option value=""${value ? "" : " selected"}>— ยังไม่เลือก —</option>` : ""}${Object.entries(optionsMap).map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}"${value === optValue ? " selected" : ""}>${escapeHtml(optLabel)}</option>`).join("")}</select></label>`;
  const checkboxField = (label, path, checked, disabled) => `<label class="a5-report-field a5-report-checkbox"><input type="checkbox" data-a5-644-path="${path}" value="true"${checked ? " checked" : ""}${disabled}> ${escapeHtml(label)}</label>`;

  function renderReport644SectionEditor(payload, key, disabled, options = {}) {
    if (key === "intake") {
      const intake = payload.intake || {}, nacc = intake.nacc || {}, misconduct = intake.misconduct || {}, order = intake.appointmentOrder || {};
      return `<fieldset class="a5-report-644-row"><legend>เลือกกรณีการรับเรื่อง (ข้อ ๑)</legend>
        <label><input type="radio" name="a5-report-644-intake-type" data-a5-644-path="intake.caseType" value="NACC_S62"${intake.caseType === "NACC_S62" ? " checked" : ""}${disabled}> กรณีรับจากสำนักงาน ป.ป.ช. ตามมาตรา 62</label>
        <label><input type="radio" name="a5-report-644-intake-type" data-a5-644-path="intake.caseType" value="MISCONDUCT"${intake.caseType === "MISCONDUCT" ? " checked" : ""}${disabled}> กรณีคดีประพฤติมิชอบ</label></fieldset>
        <div class="a5-report-644-row"><strong>๑.๑–๑.๓ กรณี ป.ป.ช. มาตรา 62</strong>
          ${control("วันที่ ป.ป.ช. รับเรื่อง", "intake.nacc.receivedAt", nacc.receivedAt, disabled, "input")}${control("เลขอ้างอิง", "intake.nacc.refNo", nacc.refNo, disabled, "input")}${control("เลขดำติดตาม", "intake.nacc.trackingNo", nacc.trackingNo, disabled, "input")}
          ${control("ช่องทางรับเรื่อง", "intake.nacc.channel", nacc.channel, disabled)}
          ${control("มติคณะกรรมการ ป.ป.ช. ครั้งที่", "intake.nacc.transferMeetingNo", nacc.transferMeetingNo, disabled, "input")}${control("วันที่ส่งเรื่องมา ป.ป.ท.", "intake.nacc.transferDate", nacc.transferDate, disabled, "input")}${control("หนังสือ ป.ป.ช. ที่", "intake.nacc.naccLetterRef", nacc.naccLetterRef, disabled, "input")}
          ${control("วันที่ ป.ป.ท./เขต รับเรื่อง", "intake.nacc.pptReceivedAt", nacc.pptReceivedAt, disabled, "input")}</div>
        <div class="a5-report-644-row"><strong>๑.๑–๑.๒ กรณีคดีประพฤติมิชอบ</strong>
          ${control("วันที่รับเรื่อง", "intake.misconduct.receivedAt", misconduct.receivedAt, disabled, "input")}${control("ช่องทางรับเรื่อง", "intake.misconduct.channel", misconduct.channel, disabled)}</div>
        <div class="a5-report-644-row"><strong>๑.๔/๑.๒ มติคณะกรรมการ ป.ป.ท. ให้ไต่สวน</strong>
          ${control("เลขที่คำสั่ง", "intake.appointmentOrder.orderRef", order.orderRef, disabled, "input")}${control("หมายเหตุคำสั่งแก้ไขเพิ่มเติม-ไต่สวนบุคคลเพิ่ม (ถ้ามี)", "intake.appointmentOrder.amendmentNote", order.amendmentNote, disabled)}
          ${controlVersion("ฉบับลงนามอ้างอิง (คลังเอกสาร)", "intake.appointmentOrder.versionId", order.versionId, disabled, options.evidenceVersions)}</div>`;
    }
    if (key === "accusers") return mutableRows("accusers", payload.accusers, (row, index) => `${hidden(`accusers.${index}.rowId`, row.rowId)}${hidden(`accusers.${index}.order`, row.order)}${control("ชื่อผู้กล่าวหา", `accusers.${index}.name`, row.name, disabled, "input")}${control("ที่อยู่หรือข้อมูลติดต่อ", `accusers.${index}.address`, row.address, disabled)}${control("ฐานะที่เกี่ยวข้อง", `accusers.${index}.capacity`, row.capacity, disabled, "input")}${checkboxField("ขอปกปิดชื่อ", `accusers.${index}.anonymized`, row.anonymized === true, disabled)}`, disabled);
    if (key === "accusedPersons") return rows(payload.accusedPersons, (row, index) => card(`${hidden(`accusedPersons.${index}.rowId`, row.rowId)}${hidden(`accusedPersons.${index}.order`, row.order)}${control("ชื่อผู้ถูกกล่าวหา", `accusedPersons.${index}.name`, row.name, disabled, "input")}${control("เลขบัตรประจำตัวประชาชน", `accusedPersons.${index}.idCardNo`, row.idCardNo, disabled, "input")}${control("ตำแหน่ง", `accusedPersons.${index}.position`, row.position, disabled, "input")}${control("ยศ", `accusedPersons.${index}.rank`, row.rank, disabled, "input")}${control("หน่วยงาน/สังกัด", `accusedPersons.${index}.agency`, row.agency, disabled, "input")}${control("ที่อยู่ตามทะเบียนราษฎรขณะแจ้งข้อกล่าวหา", `accusedPersons.${index}.registeredAddress`, row.registeredAddress, disabled)}${control("สถานะปัจจุบัน", `accusedPersons.${index}.currentStatus`, row.currentStatus, disabled, "input")}${control("คำสั่ง/เหตุที่ถูกไล่ออก (ถ้ามี)", `accusedPersons.${index}.dismissalNote`, row.dismissalNote, disabled)}`, index));
    if (key === "allegations") return mutableRows("allegations", payload.allegations, (row, index) => `${hidden(`allegations.${index}.rowId`, row.rowId)}${hidden(`allegations.${index}.order`, row.order)}${control("รายละเอียดข้อกล่าวหา", `allegations.${index}.summary`, row.summary, disabled)}${control("วันเวลาและสถานที่เกิดเหตุ", `allegations.${index}.eventDescription`, row.eventDescription, disabled)}`, disabled);
    if (key === "evidence") return mutableRows("evidence", payload.evidence, (row, index) => `${hidden(`evidence.${index}.rowId`, row.rowId)}${hidden(`evidence.${index}.order`, row.order)}${controlVersion("ฉบับพยานหลักฐาน (คลังเอกสาร)", `evidence.${index}.documentVersionId`, row.documentVersionId, disabled, options.evidenceVersions)}${selectField("หมวดพยานหลักฐาน", `evidence.${index}.category`, row.category, disabled, EVIDENCE_CATEGORY_LABELS_A5)}${control("ชื่อพยานหลักฐาน", `evidence.${index}.title`, row.title, disabled, "input")}${control("ข้อเท็จจริงที่สนับสนุน", `evidence.${index}.factSupported`, row.factSupported, disabled)}${control("การเก็บรักษา", `evidence.${index}.custodyNote`, row.custodyNote, disabled)}`, disabled);
    if (key === "otherMeasures") return mutableRows("otherMeasures", payload.otherMeasures, (row, index) => `${hidden(`otherMeasures.${index}.rowId`, row.rowId)}${hidden(`otherMeasures.${index}.order`, row.order)}${selectField("หมวด", `otherMeasures.${index}.kind`, row.kind, disabled, OTHER_MEASURE_LABELS_A5)}${control("การดำเนินการ", `otherMeasures.${index}.detail`, row.detail, disabled)}${control("ผลการดำเนินการ", `otherMeasures.${index}.result`, row.result, disabled)}`, disabled);
    if (key === "eventContext") return `${control("สถานที่เกิดเหตุ", "eventContext.place", payload.eventContext?.place, disabled, "input")}${control("วันเวลาเกิดเหตุ", "eventContext.period", payload.eventContext?.period, disabled, "input")}`;
    if (key === "damage") return `${control("รายละเอียดความเสียหาย", "damage.description", payload.damage?.description, disabled)}${control("จำนวนความเสียหาย", "damage.amount", payload.damage?.amount, disabled, "input")}`;
    if (key === "limitation") {
      const allegationOptions = Object.fromEntries((payload.allegations || []).map(row => [row.rowId, show(row.summary)]));
      return mutableRows("limitation", payload.limitation, (row, index) => `${hidden(`limitation.${index}.rowId`, row.rowId)}${hidden(`limitation.${index}.order`, row.order)}${selectField("ข้อกล่าวหาที่เกี่ยวข้อง", `limitation.${index}.allegationRowId`, row.allegationRowId, disabled, allegationOptions)}${control("วันเริ่มนับ", `limitation.${index}.startAt`, row.startAt, disabled, "input")}${control("วันขาดอายุความ", `limitation.${index}.expiresAt`, row.expiresAt, disabled, "input")}${control("ที่มาของการคำนวณ", `limitation.${index}.source`, row.source, disabled)}${control("หมายเหตุ", `limitation.${index}.note`, row.note, disabled)}`, disabled);
    }
    if (key === "legalBasis") return mutableRows("legalBasis", payload.legalBasis, (row, index) => `${hidden(`legalBasis.${index}.rowId`, row.rowId)}${hidden(`legalBasis.${index}.order`, row.order)}${control("ชื่อกฎหมาย", `legalBasis.${index}.lawName`, row.lawName, disabled, "input")}${control("มาตรา", `legalBasis.${index}.section`, row.section, disabled, "input")}${control("เหตุผลที่นำมาใช้", `legalBasis.${index}.applicationReason`, row.applicationReason, disabled)}`, disabled);
    if (key === "chargeNotice") {
      const accused = new Map((payload.accusedPersons || []).map(row => [row.rowId, row.name]));
      return `${control("การแจ้งคำสั่งแต่งตั้งฉบับที่ (๑๑.๑)", "chargeNotice.orderNotice.letterRef", payload.chargeNotice?.orderNotice?.letterRef, disabled, "input")}${control("ผลการคัดค้านผู้ไต่สวน (๑๑.๑ ถ้ามี)", "chargeNotice.objection.summary", payload.chargeNotice?.objection?.summary, disabled)}
      <h4>๑๑.๒–๑๑.๓ การแจ้งข้อกล่าวหาและการชี้แจงแก้ข้อกล่าวหารายบุคคล (มาจากหลักฐานการส่งแบบ ๕ และบันทึกคำให้การโดยอัตโนมัติ)</h4>
      ${rows(payload.chargeNotice?.perAccused, row => `<div class="a5-report-644-row"><strong>${escapeHtml(show(accused.get(row.accusedRowId)))}</strong><dl class="ws-readonly"><div><dt>ส่งข้อกล่าวหาเมื่อ</dt><dd>${escapeHtml(show(row.sentAt))} (${escapeHtml(show(row.method))})</dd></div><div><dt>รับทราบเมื่อ</dt><dd>${escapeHtml(show(row.acknowledgedAt))}</dd></div><div><dt>คำให้การ/ชี้แจง</dt><dd>${row.defenceNoDefence ? "ไม่ยื่นคำให้การ" : escapeHtml(show(row.defenceStatement))}${row.defenceEvidenceCount ? ` (${row.defenceEvidenceCount} หลักฐาน)` : ""}</dd></div></dl></div>`)}`;
    }
    if (key === "adjudication") {
      const accused = new Map((payload.accusedPersons || []).map(row => [row.rowId, row.name]));
      return `${control("คดีมีประเด็นที่ต้องวินิจฉัยว่า", "adjudication.issueFraming", payload.adjudication?.issueFraming, disabled)}${control("ข้อเท็จจริงจากการไต่สวนได้ความว่า", "adjudication.factsFound", payload.adjudication?.factsFound, disabled)}
      <h4>๑๒.๑–๑๒.๔ ประเด็นวินิจฉัยรายบุคคล</h4>
      ${rows(payload.adjudication?.perAccused, (row, index) => card(`${hidden(`adjudication.perAccused.${index}.accusedRowId`, row.accusedRowId)}<p class="ws-readonly-line">${escapeHtml(show(accused.get(row.accusedRowId)))}</p>${control("๑๒.๑ สถานะของผู้ถูกกล่าวหา", `adjudication.perAccused.${index}.statusIssue`, row.statusIssue, disabled)}${control("๑๒.๒ อำนาจหน้าที่", `adjudication.perAccused.${index}.authorityIssue`, row.authorityIssue, disabled)}${control("๑๒.๓ การกระทำ", `adjudication.perAccused.${index}.conductIssue`, row.conductIssue, disabled)}${control("๑๒.๔ ความเสียหาย", `adjudication.perAccused.${index}.damageIssue`, row.damageIssue, disabled)}`, index))}
      ${control("พิเคราะห์แล้วเห็นว่า", "adjudication.factAnalysis", payload.adjudication?.factAnalysis, disabled)}${control("ข้อกฎหมายที่ปรับใช้", "adjudication.lawAnalysis", payload.adjudication?.lawAnalysis, disabled)}<h4>ความเห็น/มติองค์คณะ</h4>${rows(payload.adjudication?.opinions, (row, index) => card(`${hidden(`adjudication.opinions.${index}.opinionId`, row.opinionId)}${hidden(`adjudication.opinions.${index}.kind`, row.kind)}${control("ประเภทความเห็น", `adjudication.opinions.${index}.kindLabel`, opinionKindLabel(row.kind), " disabled", "input")}${control("ผู้ให้ความเห็น", `adjudication.opinions.${index}.authorName`, row.authorName, disabled, "input")}${control("รายละเอียดความเห็น", `adjudication.opinions.${index}.text`, row.text, disabled)}`, index))}`;
    }
    if (key === "offenceConclusions") {
      const accused = new Map((payload.accusedPersons || []).map(row => [row.rowId, row.name]));
      const allegations = new Map((payload.allegations || []).map(row => [row.rowId, row.summary]));
      return rows(payload.offenceConclusions, (row, index) => card(`${hidden(`offenceConclusions.${index}.rowId`, row.rowId)}${hidden(`offenceConclusions.${index}.order`, row.order)}${hidden(`offenceConclusions.${index}.accusedRowId`, row.accusedRowId)}${hidden(`offenceConclusions.${index}.allegationRowId`, row.allegationRowId)}<dl class="ws-readonly"><div><dt>ผู้ถูกกล่าวหา</dt><dd>${escapeHtml(show(accused.get(row.accusedRowId)))}</dd></div><div><dt>ข้อกล่าวหา</dt><dd>${escapeHtml(show(allegations.get(row.allegationRowId)))}</dd></div></dl>
        ${checkboxField("ให้ข้อกล่าวหาตกไป", `offenceConclusions.${index}.dropped`, row.dropped === true, disabled)}${control("เหตุผลที่ให้ตกไป", `offenceConclusions.${index}.droppedReason`, row.droppedReason, disabled)}
        <p class="ws-readonly-line">กรณีมีมูลความผิด — ความผิดทางอาญา</p>${rows(row.criminalCharges, (charge, ci) => card(`${control("ฐานความผิดตามกฎหมาย", `offenceConclusions.${index}.criminalCharges.${ci}.lawName`, charge.lawName, disabled, "input")}${control("มาตรา", `offenceConclusions.${index}.criminalCharges.${ci}.section`, charge.section, disabled, "input")}`, ci))}
        <p class="ws-readonly-line">ความผิดทางวินัย</p>${rows(row.disciplinaryCharges, (charge, di) => card(`${control("ฐานความผิดวินัยตามกฎหมายของหน่วยงาน", `offenceConclusions.${index}.disciplinaryCharges.${di}.basis`, charge.basis, disabled)}`, di))}
        <p class="ws-readonly-line">กรณีอื่น ๆ เช่น เพิกถอนคำสั่งทางปกครอง (ม.46), ส่งต้นสังกัด, ส่ง ป.ป.ช.</p>${control("ประเภทกรณีอื่น", `offenceConclusions.${index}.otherRouting.type`, row.otherRouting?.type, disabled, "input")}${control("รายละเอียด", `offenceConclusions.${index}.otherRouting.detail`, row.otherRouting?.detail, disabled)}`, index));
    }
    return `<p class="ws-readonly-line">เห็นควรเสนอเรื่องให้คณะกรรมการ ป.ป.ท. พิจารณาวินิจฉัยชี้มูลตามความเห็นในข้อ ๑๓</p>`;
  }

  function renderReport644EditorA5(payload, options = {}) {
    const disabled = options.editable === true ? "" : " disabled";
    const sections = REPORT_SECTION_KEYS.map((key, index) => `<section data-a5-644-section="${key}"><h3>${index + 1}. ${SECTION_TITLES[index]}</h3>${renderReport644SectionEditor(payload, key, disabled, options)}</section>`).join("");
    return `<div class="a5-report-644-editor"><p class="ws-policy-note">รายงานการไต่สวนมี 14 ส่วนเนื้อหา โดยข้อมูลรับเรื่อง คำสั่งแต่งตั้ง และลายมือชื่อองค์คณะแยกกำกับฉบับ</p>${sections}${options.editable === true ? '<button type="button" class="ws-button primary" data-a5-report-644-action="save">บันทึกร่างรายงาน 644</button>' : ""}</div>`;
  }

  function captureReport644EditorA5(container, sourcePayload) {
    const payload = copy(sourcePayload);
    container?.querySelectorAll?.("[data-a5-644-path]").forEach(controlElement => {
      const path = controlElement.dataset.a5644Path;
      if (!path || path.endsWith("kindLabel")) return;
      if (controlElement.type === "radio") { if (controlElement.checked) setPathValue(payload, path, controlElement.value); return; }
      if (controlElement.type === "checkbox") { setPathValue(payload, path, controlElement.checked); return; }
      const value = controlElement.value;
      setPathValue(payload, path, /^\d+$/.test(String(value)) && /\.(order|copyNo)$/.test(path) ? Number(value) : value);
    });
    return payload;
  }

  const COPY_HOLDER_LABELS = Object.freeze({ CASE_FILE: "เก็บในสำนวนการไต่สวน", ACCUSED_KEEP: "ผู้ถูกกล่าวหาเก็บไว้เอง", ACCUSED_RETURN: "ผู้ถูกกล่าวหาลงนามส่งคืน" });
  const OFFENCE_CATEGORY_OPTIONS = Object.freeze(["ทุจริตต่อหน้าที่", "กระทำความผิดต่อตำแหน่งหน้าที่ราชการ", "กระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม", "ประพฤติมิชอบ"]);
  const AVAILABILITY_LABELS_A5 = Object.freeze({ AVAILABLE: "พร้อมใช้", MISSING: "ไม่มีในคลัง", PENDING: "รอตรวจสอบ" });

  function controlVersion(label, path, value, disabled, versions) {
    const list = Array.isArray(versions) ? versions.slice() : [];
    if (value && !list.some(item => item.versionId === value)) list.push({ versionId: value, name: "ไม่พบฉบับอ้างอิง", availability: "MISSING" });
    const options = [{ versionId: "", name: "— ยังไม่เลือก —", availability: "" }, ...list];
    return `<label class="a5-report-field"><span>${escapeHtml(label)}</span><select data-a5-644-path="${path}"${disabled}>${options.map(item => `<option value="${escapeHtml(item.versionId)}"${item.versionId === (value || "") ? " selected" : ""}>${escapeHtml(item.name || "เอกสาร")}${item.availability ? ` — ${escapeHtml(AVAILABILITY_LABELS_A5[item.availability] || item.availability)}` : ""}</option>`).join("")}</select></label>`;
  }

  function renderForm5EditorA5(payload, options = {}) {
    const disabled = options.editable === true ? "" : " disabled";
    const a = payload.attachments?.appointmentOrder || {};
    return `<div class="a5-form5-editor"><p class="ws-policy-note">หนังสือแจ้งให้รับทราบข้อกล่าวหา — จัดทำแยกฉบับต่อผู้ถูกกล่าวหาแต่ละคน: ${escapeHtml(show(payload.accusedRef?.name))}</p>
      <section><h3>ข้อมูลหนังสือ</h3>${control("เลขที่หนังสือ", "noticeMeta.letterNo", payload.noticeMeta?.letterNo, disabled, "input")}${control("วันที่ออกหนังสือ", "noticeMeta.issuedAt", payload.noticeMeta?.issuedAt, disabled, "input")}${control("เลขที่เรื่องกล่าวหา", "noticeMeta.caseRefNo", payload.noticeMeta?.caseRefNo, disabled, "input")}</section>
      <section><h3>คำสั่งแต่งตั้งที่แนบ (สิ่งที่ส่งมาด้วย 1)</h3>${control("เลขที่คำสั่ง", "attachments.appointmentOrder.refNo", a.refNo, disabled, "input")}${control("วันที่คำสั่ง", "attachments.appointmentOrder.date", a.date, disabled, "input")}${control("จำนวนแผ่น", "attachments.appointmentOrder.pageCount", a.pageCount, disabled, "input")}${controlVersion("ฉบับลงนามอ้างอิง (คลังเอกสาร)", "attachments.appointmentOrder.versionId", a.versionId, disabled, options.evidenceVersions)}</section>
      <section><h3>การส่งคืนบันทึกที่ลงนามแล้ว</h3>${control("กอง/สำนักปลายทางรับคืน", "returnAddress.division", payload.returnAddress?.division, disabled, "input")}</section>
      <section><h3>นัดหมายรับทราบด้วยตนเอง (ถ้ามี)</h3>${control("วันที่นัด", "inPersonMeeting.date", payload.inPersonMeeting?.date, disabled, "input")}${control("เวลานัด", "inPersonMeeting.time", payload.inPersonMeeting?.time, disabled, "input")}${control("กอง/สำนัก", "inPersonMeeting.venueDivision", payload.inPersonMeeting?.venueDivision, disabled, "input")}${control("ชั้น", "inPersonMeeting.floor", payload.inPersonMeeting?.floor, disabled, "input")}</section>
      <section><h3>ผู้ประสานทนายความ (ถ้าไม่มีทนายและต้องการให้จัดหา)</h3>${control("ชื่อผู้ประสาน", "lawyerCoordination.contactName", payload.lawyerCoordination?.contactName, disabled, "input")}${control("โทรศัพท์", "lawyerCoordination.contactPhone", payload.lawyerCoordination?.contactPhone, disabled, "input")}</section>
      <section><h3>เจ้าของสำนวนและผู้ลงนาม</h3>${control("กอง/สำนัก", "caseOwnerContact.division", payload.caseOwnerContact?.division, disabled, "input")}${control("โทร", "caseOwnerContact.phone", payload.caseOwnerContact?.phone, disabled, "input")}${control("โทรสาร", "caseOwnerContact.fax", payload.caseOwnerContact?.fax, disabled, "input")}${control("ชื่อเจ้าของสำนวน", "caseOwnerContact.officerName", payload.caseOwnerContact?.officerName, disabled, "input")}${control("โทรศัพท์เจ้าของสำนวน", "caseOwnerContact.officerPhone", payload.caseOwnerContact?.officerPhone, disabled, "input")}</section>
      ${options.editable === true ? '<button type="button" class="ws-button primary" data-a5-form5-action="save">บันทึกร่างหนังสือแจ้งข้อกล่าวหา</button>' : ""}</div>`;
  }

  function renderForm5PaperA5(payload) {
    const a = payload.attachments?.appointmentOrder || {}, accused = payload.accusedRef || {};
    return `<article class="a5-report-paper a5-form5-paper"><header class="a5-f5-head">
      <p class="a5-f5-top"><span class="a5-f5-letterno"><strong>ที่ ${escapeHtml(show(payload.noticeMeta?.letterNo))}</strong></span><img class="a5-garuda a5-garuda-f5" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="44" height="48"><span class="a5-f5-address">สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</span></p>
      <p class="a5-f5-date">${escapeHtml(show(payload.noticeMeta?.issuedAt))}</p></header>
      <p><strong>เรื่อง</strong> แจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน (เรื่องที่ ${escapeHtml(show(payload.noticeMeta?.caseRefNo))})</p>
      <p><strong>เรียน</strong> ${escapeHtml(show(accused.name))}</p>
      <p><strong>สิ่งที่ส่งมาด้วย</strong></p>
      <ol><li>สำเนาคำสั่งสำนักงาน ป.ป.ท. ที่ ${escapeHtml(show(a.refNo))} ลงวันที่ ${escapeHtml(show(a.date))} จำนวน ${escapeHtml(show(a.pageCount))} แผ่น</li><li>บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน จำนวน 2 ฉบับ</li></ol>
      <p>ด้วยสำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้มีคำสั่งที่ ${escapeHtml(show(a.refNo))} ลงวันที่ ${escapeHtml(show(a.date))} เรื่อง แต่งตั้งคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน กรณีกล่าวหา ${escapeHtml(show(accused.name))} ตำแหน่ง ${escapeHtml(show(accused.position))} สังกัด ${escapeHtml(show(accused.agency))} ว่ากระทำการทุจริตในภาครัฐ รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย 1 เพื่อดำเนินการตามมาตรา 33 แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอส่งบันทึกแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน มายังท่าน จำนวน 2 ฉบับ รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย 2 โดยขอให้ท่านดำเนินการ ดังนี้</p>
      <ol>
        <li>ลงลายมือชื่อและวันเดือนปีที่รับทราบข้อกล่าวหาในบันทึกการแจ้งข้อกล่าวหาทั้ง 2 ฉบับ ท่านเก็บไว้เอง จำนวน 1 ฉบับ แล้วส่งอีก จำนวน 1 ฉบับ กลับคืนไปยัง ${escapeHtml(show(payload.returnAddress?.division))} สำนักงาน ป.ป.ท. อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี 11120 โดยจะถือว่าวันที่ระบุในใบตอบรับทางไปรษณีย์เป็นวันที่ท่านได้รับแจ้งข้อกล่าวหา</li>
        <li>ชี้แจงแก้ข้อกล่าวหาภายใน 30 วัน นับแต่วันที่ได้รับแจ้ง โดยท่านจะชี้แจงเป็นหนังสือหรือด้วยวาจาก็ได้และมีสิทธิที่จะแสดงพยานหลักฐานหรือนำพยานบุคคลไปให้ถ้อยคำประกอบการชี้แจง หากชี้แจงด้วยวาจามีสิทธินำทนายความหรือบุคคลที่ท่านไว้วางใจไม่เกิน 2 คน เข้าฟังการชี้แจงหรือให้ถ้อยคำ หากพ้นกำหนดเวลา 30 วันแล้ว ท่านไม่ชี้แจงแก้ข้อกล่าวหาจะถือว่าผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหาและไม่ประสงค์ที่จะแก้ข้อกล่าวหา</li>
        <li>การคัดค้านคณะพนักงานไต่สวน ให้ทำคำร้องเป็นหนังสือระบุชื่อและนามสกุลของผู้ถูกคัดค้าน พร้อมทั้งแสดงข้อเท็จจริงที่เป็นเหตุแห่งการคัดค้านไว้ในคำร้องคัดค้านด้วยว่าจะทำให้การไต่สวนข้อเท็จจริงไม่ได้ความจริงและความยุติธรรมอย่างใด โดยต้องยื่นคำร้องต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ผู้ถูกกล่าวหาทราบเหตุแห่งการคัดค้าน</li>
      </ol>
      <p>อนึ่ง หากท่านประสงค์จะไปรับทราบข้อกล่าวหาด้วยตนเอง ขอให้ท่านไปพบคณะพนักงานไต่สวน ในวันที่ ${escapeHtml(show(payload.inPersonMeeting?.date))} เวลา ${escapeHtml(show(payload.inPersonMeeting?.time))} ณ ${escapeHtml(show(payload.inPersonMeeting?.venueDivision))} สำนักงาน ป.ป.ท. อาคารซอฟต์แวร์ปาร์ค ชั้น ${escapeHtml(show(payload.inPersonMeeting?.floor))} ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี ทั้งนี้ หากท่านไม่มีทนายความและประสงค์จะให้สำนักงาน ป.ป.ท. จัดหาทนายความให้ ขอให้แจ้ง ${escapeHtml(show(payload.lawyerCoordination?.contactName))} โทร. ${escapeHtml(show(payload.lawyerCoordination?.contactPhone))} พนักงาน ป.ป.ท. เจ้าของสำนวน ทราบล่วงหน้าก่อนวันนัด</p>
      <p>จึงเรียนมาเพื่อทราบ</p>
      <p class="a5-form5-signoff">ขอแสดงความนับถือ</p>
      <p class="a5-form5-signoff">(${escapeHtml(show(payload.signer?.displayName))})<br>หัวหน้าพนักงาน ป.ป.ท. /ประธานอนุกรรมการไต่สวน</p>
      <p class="a5-form5-footer">${escapeHtml(show(payload.caseOwnerContact?.division))}<br>โทร. ${escapeHtml(show(payload.caseOwnerContact?.phone))}<br>โทรสาร ${escapeHtml(show(payload.caseOwnerContact?.fax))}<br>(${escapeHtml(show(payload.caseOwnerContact?.officerName))} ${escapeHtml(show(payload.caseOwnerContact?.officerPhone))})</p>
      <p class="a5-f5-pptmark">ปปท. ......</p>
    </article>`;
  }

  function renderForm6EditorA5(payload, options = {}) {
    const disabled = options.editable === true ? "" : " disabled";
    const cat = Array.isArray(payload.offenceCategory) ? payload.offenceCategory : [];
    return `<div class="a5-form6-editor"><p class="ws-policy-note">บันทึกการแจ้งข้อกล่าวหา — ผู้ถูกกล่าวหา: ${escapeHtml(show(payload.accusedRef?.name))}</p>
      <section><h3>ส่วนที่ 1 การแจ้งข้อกล่าวหา</h3>
        ${control("วันที่บันทึก", "recordMeta.issuedAt", payload.recordMeta?.issuedAt, disabled, "input")}
        <fieldset class="a5-form6-category"><legend>ฐานความผิด</legend>${OFFENCE_CATEGORY_OPTIONS.map(label => `<label><input type="checkbox" data-a5-form6-category="${escapeHtml(label)}"${cat.includes(label) ? " checked" : ""}${disabled}>${escapeHtml(label)}</label>`).join("")}</fieldset>
        ${control("๑. ประเด็นเกี่ยวกับเหตุการณ์หรือเรื่องราวที่เกิดขึ้น", "issue1EventNarrative", payload.issue1EventNarrative, disabled)}
        <h4>๒. ประเด็นเกี่ยวกับองค์ประกอบความผิด</h4>
        ${control("สถานะ ตำแหน่ง และความเป็นเจ้าหน้าที่ของรัฐ", "issue2.statusPosition", payload.issue2?.statusPosition, disabled)}
        ${control("อำนาจหน้าที่", "issue2.authority", payload.issue2?.authority, disabled)}
        ${control("การกระทำผิดต่อตำแหน่งหน้าที่", "issue2.conduct", payload.issue2?.conduct, disabled)}
        ${control("ความเสียหาย", "issue2.damage", payload.issue2?.damage, disabled)}
        <h4>๓. ประเด็นผู้ถูกกล่าวหากระทำผิดกฎหมายในข้อหา</h4>
        ${control("ข้อหาความผิดทางอาญา", "issue3.criminalCharge", payload.issue3?.criminalCharge, disabled)}
        ${control("ความผิดทางวินัยฐาน", "issue3.disciplinaryCharge", payload.issue3?.disciplinaryCharge, disabled)}
        ${control("เหตุเกิดวันที่", "issue3.incidentDate", payload.issue3?.incidentDate, disabled, "input")}
        ${control("ช่วงเวลาเกิดเหตุ ตั้งแต่", "issue3.incidentPeriodFrom", payload.issue3?.incidentPeriodFrom, disabled, "input")}${control("ถึง", "issue3.incidentPeriodTo", payload.issue3?.incidentPeriodTo, disabled, "input")}
        ${control("ตำบล", "issue3.incidentLocation.subdistrict", payload.issue3?.incidentLocation?.subdistrict, disabled, "input")}${control("อำเภอ", "issue3.incidentLocation.district", payload.issue3?.incidentLocation?.district, disabled, "input")}${control("จังหวัด", "issue3.incidentLocation.province", payload.issue3?.incidentLocation?.province, disabled, "input")}
      </section>
      <section><h3>ส่วนที่ 2 การแจ้งสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน</h3>${rows(payload.panel, (row, index) => card(`${hidden(`panel.${index}.rowId`, row.rowId)}${hidden(`panel.${index}.order`, row.order)}${control("ชื่อ", `panel.${index}.name`, row.name, disabled, "input")}${control("บทบาท", `panel.${index}.roleLabel`, row.roleLabel, disabled, "input")}`, index))}</section>
      <section><h3>ส่วนที่ 3 การรับทราบข้อกล่าวหา</h3><p class="ws-policy-note">มาจากวันที่บันทึกหลักฐานการส่งแบบ ปปท. ๕ โดยอัตโนมัติ (วันตามใบตอบรับไปรษณีย์) ไม่ต้องกรอกซ้ำ</p><dl class="ws-readonly"><div><dt>วันที่ได้รับทราบข้อกล่าวหา</dt><dd>${escapeHtml(show(payload.acknowledgement?.receivedDate))}</dd></div><div><dt>ประสงค์ชี้แจงแก้ข้อกล่าวหาภายในวันที่ (รับทราบ + 30 วัน)</dt><dd>${escapeHtml(show(payload.acknowledgement?.explainByDate))}</dd></div></dl>${hidden("acknowledgement.receivedDate", payload.acknowledgement?.receivedDate)}${hidden("acknowledgement.explainByDate", payload.acknowledgement?.explainByDate)}</section>
      <section><h3>สำเนาบันทึก (3 ฉบับตามแบบ)</h3>${rows(payload.copies, (row, index) => card(`${hidden(`copies.${index}.copyNo`, row.copyNo)}${hidden(`copies.${index}.holder`, row.holder)}<p class="ws-readonly-line">${escapeHtml(COPY_HOLDER_LABELS[row.holder] || row.holder)}</p>${control("วันที่ส่งมอบ", `copies.${index}.deliveredAt`, row.deliveredAt, disabled, "input")}${row.holder === "ACCUSED_RETURN" ? `${control("วันที่ส่งคืน", `copies.${index}.returnedAt`, row.returnedAt, disabled, "input")}${controlVersion("หลักฐานการรับ (คลังเอกสาร)", `copies.${index}.receiptEvidenceVersionId`, row.receiptEvidenceVersionId, disabled, options.evidenceVersions)}` : ""}`, index))}</section>
      ${options.editable === true ? '<button type="button" class="ws-button primary" data-a5-form6-action="save">บันทึกร่างบันทึกการแจ้งข้อกล่าวหา</button>' : ""}</div>`;
  }

  function captureForm6EditorA5(container, sourcePayload) {
    const payload = captureReport644EditorA5(container, sourcePayload);
    const boxes = Array.from(container?.querySelectorAll?.("[data-a5-form6-category]") || []);
    if (boxes.length) payload.offenceCategory = boxes.filter(box => box.checked).map(box => box.dataset.a5Form6Category);
    return payload;
  }

  // Verbatim renderer (source: 6. แบบบันทึกการแจ้งข้อกล่าวหา.pdf, 3 pages) — the prior version
  // dropped every fixed procedural/rights-notice paragraph the template requires (right to
  // written or oral explanation, right to counsel, the five recusal grounds, the acknowledgement
  // clause, etc.) and only echoed the data-bound fields. Fixed fields the payload has no source
  // for yet (appointment order no./date) render as blank fillable slots, same convention as
  // renderReport213PaperA5/renderReport644PaperA5.
  function renderForm6PaperA5(payload) {
    const accused = payload.accusedRef || {}, cat = Array.isArray(payload.offenceCategory) ? payload.offenceCategory : [];
    const offenceClause = cat.length ? cat.map(escapeHtml).join(" / ") : "&nbsp;";
    const panelRows = Array.isArray(payload.panel) ? payload.panel : [];
    const panelRoleFallback = ["พนักงาน ป.ป.ท./ประธานอนุกรรมการ", "เจ้าหน้าที่ ป.ป.ท./อนุกรรมการ", "พนักงาน ป.ป.ท. เจ้าของสำนวน/อนุกรรมการและเลขานุการ"];
    const incidentPeriod = payload.issue3?.incidentPeriodFrom || payload.issue3?.incidentPeriodTo
      ? `(หรือระหว่างวันที่ ${dot(payload.issue3?.incidentPeriodFrom)} ถึงวันที่ ${dot(payload.issue3?.incidentPeriodTo)})`
      : `(หรือระหว่างวันที่ ${dot()} ถึงวันที่ ${dot()})`;
    return `<article class="a5-report-paper a5-form6-paper"><header class="a5-f6-head">
      <p class="a5-f6-garuda"><img src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56"></p>
      <p class="a5-f6-org">สำนักงาน ป.ป.ท.</p>
      <h3 class="a5-f6-title">บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน</h3>
      <p class="a5-f6-date">${payload.recordMeta?.issuedAt ? `(${thDate(payload.recordMeta.issuedAt)})` : "(วัน เดือน ปี)"}</p></header>
      <h3>ส่วนที่ ๑ การแจ้งข้อกล่าวหา</h3>
      <p>ด้วย สำนักงาน ป.ป.ท./คณะกรรมการ ป.ป.ท. ได้มีคำสั่งที่ ${dot()} ลงวันที่ ${dot()} แต่งตั้งคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน เพื่อดำเนินการไต่สวน กรณีกล่าวหา (${escapeHtml(show(accused.name))} ตำแหน่งและสังกัด${escapeHtml(show(accused.position))} ${escapeHtml(show(accused.agency))}) ว่ากระทำการทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ (ระบุข้อความตามคำสั่งแต่งตั้งพนักงาน ป.ป.ท./คณะอนุกรรมการ) ${offenceClause !== "&nbsp;" ? `ในข้อหา ${offenceClause}` : ""} ปรากฏตามเอกสารแนบท้ายบันทึกฉบับนี้</p>
      <p>บัดนี้ คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ขอแจ้งให้ท่านทราบก่อนแจ้งข้อกล่าวหาว่าในการชี้แจงแก้ข้อกล่าวหา ผู้ถูกกล่าวหาอาจแก้ข้อกล่าวหาโดยทำเป็นหนังสือหรือมาชี้แจงด้วยวาจาก็ได้ และผู้ถูกกล่าวหามีสิทธิที่จะให้ถ้อยคำหรือไม่ก็ได้ ถ้าผู้ถูกกล่าวหาให้ถ้อยคำ ถ้อยคำของผู้ถูกกล่าวหานั้นอาจใช้เป็นพยานหลักฐานในการพิจารณาคดีได้</p>
      <p>ในการชี้แจงแก้ข้อกล่าวหาด้วยวาจาผู้ถูกกล่าวหามีสิทธิที่จะนำทนายความหรือบุคคลซึ่งผู้ถูกกล่าวหาไว้วางใจไม่เกินสองคนเข้าฟังการให้ถ้อยคำของตนได้ ก่อนเริ่มถามคำให้การในคดีที่มีอัตราโทษจำคุกหรือประหารชีวิต หากผู้ถูกกล่าวหาไม่มีทนายความและต้องการทนายความ สำนักงาน ป.ป.ท. จะจัดหาทนายความให้ หากผู้ถูกกล่าวหาไม่มีทนายความและมีอายุไม่เกินสิบแปดปีในวันที่แจ้งข้อกล่าวหา สำนักงาน ป.ป.ท. จะจัดทนายความให้ และผู้ถูกกล่าวหาจะนำพยานหลักฐานมาเอง หรือจะอ้างพยานหลักฐานโดยขอให้คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน พิจารณาเรียกพยานหลักฐานนั้นมาก็ได้ ทั้งนี้ มีสิทธิที่จะขี้แจงข้อกล่าวหาและนำพยานหลักฐานมาสืบแก้ข้อกล่าวหาภายในเวลาอันสมควรแต่อย่างช้าไม่เกิน ๓๐ วัน นับแต่วันที่ได้รับทราบข้อกล่าวหาหรือถือว่าได้รับทราบข้อกล่าวหา คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ได้รวบรวมพยานหลักฐานที่เกี่ยวข้องกับข้อกล่าวหาแล้ว จึงขอแจ้งข้อกล่าวหาให้ผู้ถูกกล่าวหาทราบ ดังนี้</p>
      <p><strong>๑. ประเด็นเกี่ยวกับเหตุการณ์หรือเรื่องราวที่เกิดขึ้น</strong><br><em>ระบุข้อเท็จจริงและพฤติการณ์ในการกระทำผิดเท่าที่จะทำให้ผู้ถูกกล่าวหาเข้าใจข้อกล่าวหาได้ดี จัดลำดับเหตุการณ์ว่ามีความเป็นมาอย่างไร โดยมีรายละเอียดเกี่ยวกับบุคคล สิ่งของ เวลา และสถานที่ตามสมควรและผู้ถูกกล่าวหาเข้าไปเกี่ยวข้องกับเหตุการณ์นั้นอย่างไร</em><br>${escapeHtml(show(payload.issue1EventNarrative))}</p>
      <p><strong>๒. ประเด็นเกี่ยวกับองค์ประกอบความผิด</strong><br><em>จากการไต่สวนข้อเท็จจริงฟังได้ว่า (พิจารณาองค์ประกอบความผิดตามกฎหมายที่จะแจ้งข้อกล่าวหาต่อผู้ถูกกล่าวหาแต่ละคนแล้วอ้างข้อเท็จจริงว่าผู้ถูกกล่าวหาทำอะไร อย่างไร ให้ครบทุกองค์ประกอบความผิด ตามลำดับประเด็น)</em></p>
      <ul>
        <li>ประเด็นเกี่ยวกับสถานะ ตำแหน่ง และความเป็นเจ้าหน้าที่ของรัฐ ${escapeHtml(show(payload.issue2?.statusPosition))}</li>
        <li>ประเด็นเกี่ยวกับอำนาจหน้าที่ ${escapeHtml(show(payload.issue2?.authority))}</li>
        <li>ประเด็นเกี่ยวกับการกระทำผิดต่อตำแหน่งหน้าที่ ${escapeHtml(show(payload.issue2?.conduct))}</li>
        <li>ประเด็นเกี่ยวกับความเสียหาย ${escapeHtml(show(payload.issue2?.damage))}</li>
      </ul>
      <p><strong>๓. ประเด็นผู้ถูกกล่าวหากระทำผิดกฎหมายในข้อหา</strong><br>จึงขอแจ้งข้อกล่าวหาว่าท่านกระทำความผิดทางอาญาในข้อหา (อ้างว่าผู้ถูกกล่าวหากระทำความผิดกฎหมายในฐานความผิดใด โดยระบุชื่อความผิดในกฎหมายลงไป แต่ไม่จำเป็นต้องระบุเลขมาตรา) ${escapeHtml(show(payload.issue3?.criminalCharge))}</p>
      <p>และมีความผิดทางวินัยฐาน ${dot(payload.issue3?.disciplinaryCharge)}</p>
      <p>เหตุเกิดวันที่ ${dot(payload.issue3?.incidentDate ? thDate(payload.issue3.incidentDate) : "")} ${incidentPeriod} สถานที่เกิดเหตุอยู่ในท้องที่ตำบล ${dot(payload.issue3?.incidentLocation?.subdistrict)} อำเภอ ${dot(payload.issue3?.incidentLocation?.district)} จังหวัด ${dot(payload.issue3?.incidentLocation?.province)}</p>
      <h3>ส่วนที่ ๒ การแจ้งสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน</h3>
      <p>คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ประกอบด้วยบุคคลตามรายชื่อ ดังต่อไปนี้</p>
      <ol>${panelRows.length ? panelRows.map((row, i) => `<li>${escapeHtml(show(row.name))} ${escapeHtml(show(row.roleLabel)) || panelRoleFallback[i] || panelRoleFallback.at(-1)}</li>`).join("") : panelRoleFallback.map(role => `<li>${dot()} ${role}</li>`).join("")}</ol>
      <p>ขอแจ้งให้ทราบว่าผู้ถูกกล่าวหามีสิทธิคัดค้านผู้ได้รับการแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน โดยผู้ถูกกล่าวหาจะต้องทำคำร้องเป็นหนังสือระบุชื่อและนามสกุลของผู้ถูกคัดค้าน พร้อมทั้งแสดงข้อเท็จจริงที่เป็นเหตุแห่งการคัดค้านไว้ในคำร้องคัดค้านด้วยว่าจะทำให้การไต่สวนข้อเท็จจริงไม่ได้ความจริงและความยุติธรรมอย่างหนึ่งอย่างใด และยื่นคำร้องคัดค้านเป็นหนังสือต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ผู้ถูกกล่าวหาทราบเหตุแห่งการคัดค้านอย่างหนึ่งอย่างใด ดังต่อไปนี้</p>
      <ol>
        <li>ผู้ไต่สวนรู้เห็นเหตุการณ์หรือเคยสอบสวนหรือพิจารณาเกี่ยวกับเรื่องที่กล่าวหาในฐานะอื่นที่มิใช่ในฐานะพนักงาน ป.ป.ท. หรือเจ้าหน้าที่ ป.ป.ท. มาก่อน</li>
        <li>ผู้ไต่สวนมีส่วนได้เสียในเรื่องที่กล่าวหา</li>
        <li>ผู้ไต่สวนมีสาเหตุโกรธเคืองกับผู้กล่าวหา</li>
        <li>ผู้ไต่สวนเป็นผู้กล่าวหา หรือผู้ถูกกล่าวหา หรือเป็นคู่สมรส บุพการี ผู้สืบสันดาน หรือพี่น้องร่วมบิดามารดา หรือร่วมบิดาหรือมารดากับผู้กล่าวหาหรือผู้ถูกกล่าวหา</li>
        <li>ผู้ไต่สวนมีความสัมพันธ์ใกล้ชิดในฐานะญาติ หรือเป็นหุ้นส่วน หรือมีผลประโยชน์ร่วมกัน หรือขัดแย้งกันทางธุรกิจกับผู้กล่าวหาหรือผู้ถูกกล่าวหา</li>
      </ol>
      <p>ทั้งนี้ กรณีที่ผู้ถูกกล่าวหามิได้ดำเนินการให้ครบถ้วนตามเงื่อนไขข้างต้น ให้ถือว่าผู้ถูกกล่าวหาไม่ประสงค์ที่จะคัดค้านผู้ได้รับการแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ในกรณีดังกล่าว</p>
      <p class="a5-f6-sig">ลงชื่อ ${dot(panelRows[0]?.name)} ${panelRoleFallback[0]}<br>(${dot()})</p>
      <p class="a5-f6-sig">ลงชื่อ ${dot(panelRows[1]?.name)} ${panelRoleFallback[1]}<br>(${dot()})</p>
      <p class="a5-f6-sig">ลงชื่อ ${dot(panelRows[2]?.name)} ${panelRoleFallback[2]}<br>(${dot()})</p>
      <h3>ส่วนที่ ๓ การรับทราบข้อกล่าวหา</h3>
      <p>ข้าพเจ้า (${dot(accused.name)}) ได้รับทราบและเข้าใจข้อกล่าวหาโดยตลอดและได้รับทราบสิทธิการคัดค้านผู้ได้รับแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวนแล้ว โดยได้รับบันทึกนี้ จำนวน ๑ ฉบับ และสำเนาคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${dot()} ลงวันที่ ${dot()} จำนวน ๑ ฉบับ ไว้แล้ว เมื่อวันที่ ${dot(payload.acknowledgement?.accusedSignedAt ? thDate(payload.acknowledgement.accusedSignedAt) : "")} (คือวันที่ได้รับหนังสือแจ้งให้รับทราบข้อกล่าวหาตามที่ระบุในไปรษณีย์ตอบรับ) และประสงค์ที่จะชี้แจงแก้ข้อกล่าวหาภายในวันที่ ${dot(payload.acknowledgement?.explainByDate ? thDate(payload.acknowledgement.explainByDate) : "")} (ต้องชี้แจงภายใน ๓๐ วันนับแต่วันที่ได้รับทราบข้อกล่าวหาหรือถือว่าได้รับทราบข้อกล่าวหา) หากพ้นกำหนดนี้แล้ว ให้ถือว่าข้าพเจ้าไม่ประสงค์ที่จะชี้แจงแก้ข้อกล่าวหา และในกรณีที่ข้าพเจ้าประสงค์จะคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ข้าพเจ้าจะต้องยื่นคำร้องเป็นหนังสือต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ทราบเหตุคัดค้าน เพื่อเป็นหลักฐานจึงลงลายมือชื่อไว้เป็นสำคัญ</p>
      <p class="a5-f6-sig">ลงชื่อ ${dot()} ผู้ถูกกล่าวหา<br>(${dot(accused.name)})</p>
      <p class="a5-f6-note"><strong>หมายเหตุ</strong> บันทึกนี้ให้ทำเป็น ๓ ฉบับ เก็บไว้ในสำนวนการไต่สวนจำนวน ๑ ฉบับ ส่งให้ผู้ถูกกล่าวหาจำนวน ๒ ฉบับ เพื่อให้ผู้ถูกกล่าวหาลงลายมือชื่อและวันเดือนปีที่รับทราบข้อกล่าวหา ผู้ถูกกล่าวหาเก็บไว้ จำนวน ๑ ฉบับ และส่งกลับคืน จำนวน ๑ ฉบับ เก็บรวมไว้ในสำนวนการไต่สวน</p>
      <h4>การจัดทำสำเนา</h4>
      ${paperList(payload.copies, row => `${escapeHtml(COPY_HOLDER_LABELS[row.holder] || row.holder)} — ส่งมอบ ${escapeHtml(show(row.deliveredAt))}${row.holder === "ACCUSED_RETURN" ? ` · ส่งคืน ${escapeHtml(show(row.returnedAt))}` : ""}`)}
    </article>`;
  }

  function paperList(items, render) {
    return Array.isArray(items) && items.length ? `<ol>${items.map(item => `<li>${render(item)}</li>`).join("")}</ol>` : `<p class="a5-report-blank">${EMPTY_LABEL}</p>`;
  }

  function offenceConclusionOutcome(row) {
    if (row.dropped) return `ให้ข้อกล่าวหาตกไป — ${escapeHtml(show(row.droppedReason))}`;
    const parts = [];
    (row.criminalCharges || []).forEach(item => parts.push(`อาญา: ${escapeHtml(show(item.lawName))} มาตรา ${escapeHtml(show(item.section))}`));
    (row.disciplinaryCharges || []).forEach(item => parts.push(`วินัย: ${escapeHtml(show(item.basis))}`));
    if (text(row.otherRouting?.type)) parts.push(`${escapeHtml(show(row.otherRouting.type))}: ${escapeHtml(show(row.otherRouting.detail))}`);
    return parts.length ? parts.join(" / ") : "เอกสารไม่ระบุ";
  }

  /* ---------- Phase 7B: paper renderer ตรงแบบพิมพ์จริง 3 หน้า (source: form-7-source-map.md + agy transcribe PDF จริง) ---------- */
  const A5_THAI_NUM = Object.freeze({ 1: '๑', 2: '๒', 3: '๓', 4: '๔', 5: '๕', 6: '๖', 7: '๗', 8: '๘', 9: '๙', 10: '๑๐', 11: '๑๑', 12: '๑๒', 13: '๑๓', 14: '๑๔' });
  const a5Num = value => A5_THAI_NUM[Number(value)] || String(value || '');
  const THAI_MONTHS = Object.freeze(['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']);
  const thDate = value => {
    const parsed = new Date(`${text(value)}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return '';
    const day = a5Num(parsed.getUTCDate());
    const month = THAI_MONTHS[parsed.getUTCMonth()];
    const year = a5Num(parsed.getUTCFullYear() + 543);
    return `${day} ${month} ${year}`;
  };
  const slot = value => { const v = text(value); return v ? `<span class="a5-f4-slot">${escapeHtml(v)}</span>` : `<span class="a5-f4-slot">&nbsp;</span>`; };
  const dot = value => { const v = text(value); return v ? `<span class="a5-f4-dots">${escapeHtml(v)}</span>` : `<span class="a5-f4-dots">&nbsp;</span>`; };
  const dateSlot = value => `<span class="a5-f4-slot a5-f4-date">${thDate(value)}</span>`;
  const f7Section = (no, heading, body) => `<section class="a5-f7-section"><h3 class="a5-f7-section-title">${no}. ${heading}</h3>${body}</section>`;
  const f7Item = (no, text2, extra = '') => `<p class="a5-f7-item${no ? ' a5-f7-item-sub' : ''}">${no ? `<span class="a5-f7-sub-no">${no}</span> ` : ''}${text2}${extra}</p>`;
  const f7List = (rows, render) => Array.isArray(rows) && rows.length ? rows.map((row, i) => f7Item(`(${a5Num(i + 1)})`, render(row))).join('') : `<p class="a5-f7-item">&nbsp;</p>`;

  function renderReport644PaperA5(payload, pageOnly) {
    const p = object(payload);
    const meta = object(p.reportMeta);
    const intake = object(p.intake);
    const isNacc = intake.caseType === 'NACC_S62';
    const isMisconduct = intake.caseType === 'MISCONDUCT';
    const nacc = object(intake.nacc);
    const misconduct = object(intake.misconduct);
    const order = object(intake.appointmentOrder);
    const accusedMap = new Map((p.accusedPersons || []).map(row => [row.rowId, row]));
    const allegationMap = new Map((p.allegations || []).map(row => [row.rowId, row]));
    const evidenceBy = category => (p.evidence || []).filter(row => row.category === category);
    const measuresBy = kind => (p.otherMeasures || []).filter(row => row.kind === kind);

    /* หัวกระดาษ — หน้า 1 */
    const head = `<header class="a5-f7-head">
      <p class="a5-f7-docref">ปปท. ${slot(meta.docRef)}</p>
      <div class="a5-f7-crest"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="52" height="56"></div>
      <h1 class="a5-f7-org">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</h1>
      <h2 class="a5-f7-title">รายงานการไต่สวน</h2>
      <p class="a5-f7-meta">เรื่องที่ ${dot(meta.matterNo)}</p>
      <p class="a5-f7-meta">สำนัก/กอง ${dot(meta.owningDivision)} ที่เป็นเจ้าของเรื่อง (ตามเลขเรื่อง)</p>
      <p class="a5-f7-meta a5-f7-date">วันที่ ${dateSlot(meta.issuedAt)}</p>
      <p class="a5-f7-meta"><b>เรียน</b> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
    </header>`;

    /* ๑ การรับเรื่อง — สองกรณี */
    const receiveSection = f7Section('๑', 'การรับเรื่อง (เลือกใส่เฉพาะกรณีตามข้อเท็จจริง)', `
      <p class="a5-f7-branch"><b>กรณีรับจากสำนักงาน ป.ป.ช. ตามมาตรา ๖๒</b></p>
      ${f7Item('๑.๑', `เมื่อวันที่ ${dateSlot(nacc.receivedAt)} สำนักงาน ป.ป.ช. รับเรื่องที่ ${slot(nacc.refNo)} (เลขอ้างอิง/เลขดำติดตามที่ ${slot(nacc.trackingNo)}) จาก ${slot(nacc.channel)} (ระบุช่องทางการรับเรื่อง เช่น บัตรสนเท่ห์ ผู้ร้อง พนักงานสอบสวน สถานีตำรวจ สำนักงานตรวจเงินแผ่นดิน หรือ ${slot('')})`)}
      ${f7Item('๑.๒', `สำนักงาน ป.ป.ช./สำนักงาน ป.ป.ช. จังหวัด ${slot('')} ส่งเรื่องมายังสำนักงาน ป.ป.ท. /สำนักงาน ปปท. เขต ${slot('')} ตามมติคณะกรรมการ ป.ป.ช. ครั้งที่ ${slot(nacc.transferMeetingNo)} เมื่อวันที่ ${dateSlot(nacc.transferDate)} ตามหนังสือ ป.ป.ช. ที่ ${slot(nacc.naccLetterRef)}`)}
      ${f7Item('๑.๓', `สำนักงาน ป.ป.ท. /สำนักงาน ป.ป.ท. เขต ${slot('')} รับเรื่องเมื่อวันที่ ${dateSlot(nacc.pptReceivedAt)}`)}
      ${f7Item('๑.๔', `คณะกรรมการ ป.ป.ท. มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. /สำนักงาน ป.ป.ท. ลับ ที่ ${slot(order.orderRef)} (ในกรณีที่มีคำสั่งให้แก้ไขเพิ่มเติม-ไต่สวนบุคคลใดเพิ่มเติม ให้ระบุไว้ด้วย ${slot(order.amendmentNote)})`)}
      <p class="a5-f7-branch"><b>กรณีคดีประพฤติมิชอบ</b></p>
      ${f7Item('๑.๑', `เมื่อวันที่ ${dateSlot(misconduct.receivedAt)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${slot('')} รับเรื่อง ${slot(misconduct.channel)} (ระบุช่องทางรับเรื่อง เช่น หนังสือร้องเรียน สายด่วน ๑๒๐๖ เว็บไซต์สำนักงาน ป.ป.ท. ${slot('')}) วันที่ ${dateSlot('')}`)}
      ${f7Item('๑.๒', `คณะกรรมการ ป.ป.ท. มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. /สำนักงาน ป.ป.ท. ลับ ที่ ${slot(order.orderRef)} (ในกรณีที่มีคำสั่งให้แก้ไขเพิ่มเติม-ไต่สวนบุคคลใดเพิ่มเติม ให้ระบุไว้ด้วย ${slot(order.amendmentNote)})`)}
    `);

    /* ๒–๕ หน้า 1 */
    const accusersSection = f7Section('๒', 'ผู้กล่าวหา (ระบุชื่อ-สกุล ตำแหน่ง และที่อยู่ หรือขอปกปิดชื่อ)', f7List(p.accusers, row => `${escapeHtml(show(row.name))}${row.anonymized ? ' (ขอปกปิดชื่อ)' : ''}${row.capacity ? ` ตำแหน่ง ${escapeHtml(show(row.capacity))}` : ''}${row.address ? ` ที่อยู่ ${escapeHtml(show(row.address))}` : ''}`));
    const accusedSection = f7Section('๓', 'ผู้ถูกกล่าวหา (ให้ระบุชื่อ-สกุล หมายเลขบัตรประจำตัวประชาชน ตำแหน่ง ยศ สังกัด และที่อยู่ (ตามทะเบียนราษฎรขณะแจ้งข้อกล่าวหา) สถานะปัจจุบันเป็นรายบุคคล (หากถูกไล่ออกให้ระบุคำสั่งหรือเหตุที่ถูกไล่ออกด้วย) โดยกำหนดผู้ถูกกล่าวหาเป็นลำดับ หากผู้ถูกกล่าวหามีจำนวนมากอาจทำเป็นบัญชีแนบท้ายที่ได้จากการตรวจสอบ)', f7List(p.accusedPersons, row => `${escapeHtml(show(row.name))} เลขบัตรประจำตัวประชาชน ${slot(row.idCardNo)} ตำแหน่ง ${escapeHtml(show(row.position))} ยศ ${slot(row.rank)} สังกัด ${escapeHtml(show(row.agency))} ที่อยู่ ${slot(row.registeredAddress)} สถานะปัจจุบัน ${slot(row.currentStatus)}${row.dismissalNote ? ` (ถูกไล่ออก: ${escapeHtml(show(row.dismissalNote))})` : ''}`));
    const allegationSection = f7Section('๔', 'ข้อกล่าวหา พฤติการณ์ที่กล่าวหา (สรุปพฤติการณ์ตามคำกล่าวหาของผู้กล่าวหาหรือจากคำสั่งแต่งตั้ง)', f7List(p.allegations, row => `${escapeHtml(show(row.summary))}${row.eventDescription ? ` — ${escapeHtml(show(row.eventDescription))}` : ''}`));
    const evidenceItem = row => `[${EVIDENCE_CATEGORY_LABELS_A5[row.category] || show(row.category)}] ${escapeHtml(show(row.title))}${row.factSupported ? ` — ${escapeHtml(show(row.factSupported))}` : ''}`;
    const evidenceSection = f7Section('๕', 'การรวบรวมพยานหลักฐาน (สรุปคำให้การของผู้ให้ถ้อยคำให้ชัดเจนว่าบุคคลนั้นให้การในประเด็นใดมีสาระสำคัญว่าอย่างไร โดยเรียงลำดับตามความสำคัญ และสรุปประเด็นสำคัญของเอกสาร)', `
      <p class="a5-f7-sub">๕.๑ พยานบุคคล (สรุปคำให้การผู้กล่าวหา/พยาน)</p>${f7List(evidenceBy('WITNESS'), evidenceItem)}
      <p class="a5-f7-sub">๕.๒ พยานเอกสาร (สรุปข้อเท็จจริงจากพยานเอกสารที่รวบรวม)</p>${f7List(evidenceBy('DOCUMENT'), evidenceItem)}
      <p class="a5-f7-sub">๕.๓ พยานวัตถุ และพยานอื่น ๆ</p>${f7List(evidenceBy('OTHER'), evidenceItem)}
      <p class="a5-f7-sub">๕.๔ ผลการดำเนินการสอบข้อเท็จจริง/วินัย/ละเมิดของหน่วยงานต้นสังกัด</p>${f7List(evidenceBy('HOME_AGENCY_RESULT'), evidenceItem)}
    `);
    const page1 = `<section class="a5-paper-page" data-page="1">${head}${receiveSection}${accusersSection}${accusedSection}${allegationSection}${evidenceSection}<p class="a5-f7-pptmark">ปปท. ${dot('')}</p></section>`;

    /* หน้า 2 — ๖–๑๒ */
    const measuresItem = row => `${[OTHER_MEASURE_LABELS_A5[row.kind] || show(row.kind)] ? '' : ''}${escapeHtml(show(row.detail))}${row.result ? ` — ผล: ${escapeHtml(show(row.result))}` : ''}`;
    const measuresSection = f7Section('๖', 'การดำเนินการอื่น ๆ', `
      <p class="a5-f7-sub">๖.๑ การคุ้มครองพยาน</p>${f7List(measuresBy('WITNESS_PROTECTION'), measuresItem)}
      <p class="a5-f7-sub">๖.๒ การกันบุคคลหรือผู้ถูกกล่าวหาไว้เป็นพยาน</p>${f7List(measuresBy('SET_ASIDE_AS_WITNESS'), measuresItem)}
      <p class="a5-f7-sub">๖.๓ การดำเนินการอื่น ๆ (ถ้ามี) เช่น การสืบพยานบุคคลไว้ล่วงหน้า....</p>${f7List(measuresBy('OTHER'), measuresItem)}
    `);
    const eventSection = f7Section('๗', 'วันเวลาและสถานที่เกิดเหตุ', `<p class="a5-f7-item">${dot(p.eventContext?.place)}${p.eventContext?.period ? ` · ${escapeHtml(show(p.eventContext.period))}` : ''}</p>`);
    const damageSection = f7Section('๘', 'ความเสียหาย', `<p class="a5-f7-item">${dot(p.damage?.description)}${p.damage?.amount ? ` <b>จำนวนความเสียหาย:</b> ${escapeHtml(show(p.damage.amount))}` : ''}</p>`);
    const limitationSection = f7Section('๙', 'อายุความ (ให้ระบุอายุความและวันขาดอายุความของการกระทำความผิดที่ถูกกล่าวหาทุกข้อกล่าวหา)', f7List(p.limitation, row => `${allegationMap.get(row.allegationRowId)?.summary ? escapeHtml(show(allegationMap.get(row.allegationRowId).summary)) + ' — ' : ''}วันขาดอายุความ ${dateSlot(row.expiresAt)} (${escapeHtml(show(row.source))})`));
    const legalSection = f7Section('๑๐', 'กฎหมายและระเบียบที่เกี่ยวข้อง (กฎหมายหรือระเบียบที่เกี่ยวกับอำนาจหน้าที่ของผู้ถูกร้องเรียน บทความผิดทางอาญาและวินัย ระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายที่เกี่ยวข้องกับการปฏิบัติงานที่ถูกร้องเรียน หากเป็นระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายเฉพาะให้พิมพ์เนื้อหาด้วย ให้ระบุชื่อกฎหมายพร้อมมาตรา)', f7List(p.legalBasis, row => `${escapeHtml(show(row.lawName))} มาตรา ${escapeHtml(show(row.section))}${row.applicationReason ? ` — ${escapeHtml(show(row.applicationReason))}` : ''}`));
    const cn = object(p.chargeNotice);
    const perAccused = Array.isArray(cn.perAccused) ? cn.perAccused : [];
    const chargeNoticeSection = `<section class="a5-f7-section"><h3 class="a5-f7-section-title">๑๑. การแจ้งคำสั่ง/ข้อกล่าวหา และการชี้แจงแก้ข้อกล่าวหา</h3>
      <p class="a5-f7-sub">๑๑.๑ การแจ้งคำสั่ง (แต่งตั้งคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน) ให้ผู้ถูกกล่าวหาทราบ ตามหนังสือ ${slot(cn.orderNotice?.letterRef)} / การคัดค้าน — ผลการคัดค้าน ${slot(cn.objection?.summary)}</p>
      <p class="a5-f7-sub">๑๑.๒ การแจ้งข้อกล่าวหา</p>
      ${perAccused.map(row => f7Item('', `ได้แจ้งข้อกล่าวหาให้ผู้ถูกกล่าวหาทราบ (${accusedMap.get(row.accusedRowId)?.name || ''}) ตามหนังสือ ${slot(row.noticeDocumentRef || row.noticeLetterRef || '')} เมื่อวันที่ ${dateSlot(row.sentAt)} ทางไปรษณีย์ลงทะเบียนตอบรับ และผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหา ทางไปรษณีย์/รับทราบด้วยตนเองแล้ว เมื่อวันที่ ${dateSlot(row.acknowledgedAt)}`)).join('') || `<p class="a5-f7-item">&nbsp;</p>`}
      <p class="a5-f7-sub">๑๑.๓ การชี้แจงแก้ข้อกล่าวหา</p>
      ${perAccused.map(row => `<p class="a5-f7-item">(๑) คำให้การผู้ถูกกล่าวหา/หนังสือชี้แจงแก้ข้อกล่าวหา ${row.defenceNoDefence ? '(ไม่ยื่นคำชี้แจง)' : dot(row.defenceStatement)}</p><p class="a5-f7-item">(๒) พยานหลักฐานของผู้ถูกกล่าวหา</p>${(row.defenceEvidence || []).map((ev, i) => f7Item(`(๒.${a5Num(i + 1)})`, `${escapeHtml(show(ev.category))}: ${escapeHtml(show(ev.detail))}`)).join('') || ''}`).join('') || '<p class="a5-f7-item">&nbsp;</p>'}
    </section>`;
    const adj = object(p.adjudication);
    const perAccusedIssues = Array.isArray(adj.perAccused) ? adj.perAccused : [];
    const adjudicationSection = `<section class="a5-f7-section"><h3 class="a5-f7-section-title">๑๒. เหตุผลในการพิจารณาวินิจฉัย (ให้สรุปพฤติการณ์และพยานหลักฐานโดยปรับให้เข้ากับองค์ประกอบข้อกฎหมาย โดยให้พิจารณาผู้ถูกกล่าวหาแต่ละรายตามลำดับ)</h3>
      ${perAccusedIssues.map(row => `<p class="a5-f7-item"><b>${accusedMap.get(row.accusedRowId)?.name || ''}</b></p>
        ${f7Item('๑๒.๑', `ประเด็นเกี่ยวกับสถานะของผู้ถูกกล่าวหา ${dot(row.statusIssue)}`)}
        ${f7Item('๑๒.๒', `ประเด็นเกี่ยวกับอำนาจหน้าที่ของผู้ถูกกล่าวหา ${dot(row.authorityIssue)}`)}
        ${f7Item('๑๒.๓', `ประเด็นเกี่ยวกับการกระทำของผู้ถูกกล่าวหา ${dot(row.conductIssue)}`)}
        ${f7Item('๑๒.๔', `ประเด็นความเสียหาย ${dot(row.damageIssue)}`)}`).join('')}
      <p class="a5-f7-item">คดีมีประเด็นที่ต้องวินิจฉัยว่า ${dot(adj.issueFraming)}</p>
      <p class="a5-f7-item">ข้อเท็จจริงจากการไต่สวนได้ความว่า ${dot(adj.factsFound)}</p>
    </section>`;
    const page2 = `<section class="a5-paper-page" data-page="2"><p class="a5-f7-pagenum">- ๒ -</p>${measuresSection}${eventSection}${damageSection}${limitationSection}${legalSection}${chargeNoticeSection}${adjudicationSection}</section>`;

    /* หน้า 3 — ๑๒ ต่อ + ๑๓ + ๑๔ + ลายเซ็น */
    const opinions = Array.isArray(adj.opinions) ? adj.opinions : [];
    const conclusions = Array.isArray(p.offenceConclusions) ? p.offenceConclusions : [];
    const conclusionItem = row => {
      const accusedName = accusedMap.get(row.accusedRowId)?.name || '';
      const allegationText = allegationMap.get(row.allegationRowId)?.summary || '';
      if (row.dropped === true) return `${accusedName} · ${allegationText} — <b>ให้ข้อกล่าวหาตกไป</b> ${dot(row.droppedReason)}`;
      const parts = [];
      (row.criminalCharges || []).forEach(item => parts.push(`ความผิดทางอาญา ${escapeHtml(show(item.lawName))} มาตรา ${escapeHtml(show(item.section))}`));
      (row.disciplinaryCharges || []).forEach(item => parts.push(`ความผิดทางวินัย ${escapeHtml(show(item.basis))}`));
      if (text(row.otherRouting?.type)) parts.push(`${escapeHtml(show(row.otherRouting.type))}: ${escapeHtml(show(row.otherRouting.detail))}`);
      return `${accusedName} · ${allegationText} — ${parts.length ? parts.join(' / ') : 'มีมูลความผิด'}`;
    };
    const opinionItem = item => `<p class="a5-f7-item">${item.kind === 'MINORITY' ? 'ความเห็นข้างน้อย' : 'ความเห็นข้างมาก'} — ${escapeHtml(show(item.authorName))}: ${escapeHtml(show(item.text))}</p>`;
    const page3 = `<section class="a5-paper-page" data-page="3"><p class="a5-f7-pagenum">- ๓ -</p>
      <section class="a5-f7-section"><h3 class="a5-f7-section-title">๑๒. (ต่อ)</h3>
        <p class="a5-f7-item">พิเคราะห์แล้วเห็นว่า (ให้ปรับข้อเท็จจริงให้เข้ากับข้อกฎหมายตามองค์ประกอบความผิดในแต่ละฐาน) ${dot(adj.factAnalysis)}</p>
        <p class="a5-f7-item">ความเห็น/มติ (ในกรณีที่คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน มีความเห็นแย้ง ให้ระบุเสียงข้างมากและข้างน้อย พร้อมทั้งเหตุผลในการวินิจฉัย หรือในกรณีที่คณะพนักงานไต่สวน ซึ่งไม่สามารถหาเสียงข้างมากได้ ให้ระบุเหตุผลในการวินิจฉัยของแต่ละคน) ${dot(adj.lawAnalysis)}</p>
        ${opinions.map(opinionItem).join('')}
        <p class="a5-f7-note">(ในกรณีที่แจ้งข้อกล่าวหาผู้ถูกกล่าวหาฐานความผิดใดแล้ว จะต้องมีความเห็นในทุกข้อกล่าวหา)</p>
      </section>
      ${f7Section('๑๓', 'สรุปบทความผิดผู้ถูกกล่าวหาแต่ละรายตามลำดับ', `
        <p class="a5-f7-item">- กรณีให้ข้อกล่าวหาตกไป (ให้สรุปความเห็น โดยย่อและให้มีความเห็นทางคดี.... จึงเห็นควรให้ข้อกล่าวหาตกไป)</p>
        <p class="a5-f7-item">- กรณีมีมูลความผิด</p>
        ${conclusions.map(conclusionItem).join('')}
        <p class="a5-f7-item">- กรณีอื่น ๆ เช่น กรณีไม่มีความผิดทางอาญาแต่มีความผิดทางวินัย หรือกรณีเพิกถอนคำสั่งทางปกครองตามมาตรา ๔๖ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม, ส่งเรื่องให้ต้นสังกัดดำเนินการในส่วนที่เกี่ยวข้อง, ส่งคณะกรรมการ ป.ป.ช. เป็นต้น</p>
      `)}
      ${f7Section('๑๔', 'ข้อเสนอ', '<p class="a5-f7-item">เห็นควรเสนอเรื่องให้คณะกรรมการ ป.ป.ท. พิจารณาวินิจฉัยชี้มูลตามความเห็นในข้อ ๑๓</p>')}
      <div class="a5-f7-signatures">
        <div class="a5-f7-sign"><p class="a5-f7-sig-line">ลงชื่อ ${slot((p.panelSignatures || [])[0]?.signerName || '')} <b>ประธานอนุกรรมการ/พนักงาน ป.ป.ท.</b></p><p class="a5-f7-sig-line">(${slot('')})</p></div>
        <div class="a5-f7-sign"><p class="a5-f7-sig-line">ลงชื่อ ${slot((p.panelSignatures || [])[1]?.signerName || '')} <b>อนุกรรมการ/เจ้าหน้าที่ ป.ป.ท.</b></p><p class="a5-f7-sig-line">(${slot('')})</p></div>
        <div class="a5-f7-sign"><p class="a5-f7-sig-line">ลงชื่อ ${slot((p.panelSignatures || [])[2]?.signerName || '')} <b>อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวน</b></p><p class="a5-f7-sig-line">(${slot('')})</p></div>
      </div>
    </section>`;

    const pages = [page1, page2, page3];
    const html = pages.map((content, index) => (pageOnly && index + 1 !== pageOnly) ? '' : content).join('');
    return `<article class="a5-report-paper a5-f7-paper">${html}</article>`;
  }

  const api = Object.freeze({
    FORM_5_ID, FORM_6_ID, FORM_7_ID, REPORT_SECTION_KEYS, ACTIONS, REPORT_644_REVIEW_STEPS, REPORT_644_ROUTES, form5DocId, form6DocId, buildReport644ReviewChainA5, normalizeReport644A5, validateForm5A5, validateForm6A5, validateReport644A5, executeReport644Action,
    mutateReport644RowsA5, syncReport644DerivedRowsA5,
    renderReport644EditorA5, captureReport644EditorA5, renderReport644PaperA5, renderForm5EditorA5, renderForm5PaperA5, renderForm6EditorA5, captureForm6EditorA5, renderForm6PaperA5
  });
  root.ECMISActivity5Report644 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
