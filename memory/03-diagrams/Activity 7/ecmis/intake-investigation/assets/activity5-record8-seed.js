(function initializeActivity5Record8Seed(root) {
  const clone = value => JSON.parse(JSON.stringify(value));

  function buildActivity5Record8Seed() {
    const api = root.ECMISActivity5Report644 || (typeof require === "function" ? require("./activity5-report-644.js") : null);
    if (!api) throw new Error("ECMISActivity5Report644 is required");
    const caseId = "R8-DEMO/2569";
    const accusedRowId = "record8-accused-1";
    const normalized = api.normalizeReport644A5({
      caseData: {
        id: caseId,
        trackingYear: "69/8008",
        trackingCode: "8008",
        subject: "Record 8 Demo — ไต่สวนชี้มูลและจัดทำรายงาน 644",
        complainant: "ผู้กล่าวหาตัวอย่าง",
        agency: "หน่วยงานตัวอย่าง",
        region: "กองปราบ 1",
        channel: "หนังสือราชการ",
        receivedFirstAt: "2026-01-20"
      },
      workflow: { stage: "a5-inquiry", a5Status: "A5_INQUIRY", status: "อยู่ระหว่างไต่สวนชี้มูล", downstreamStatus: "REPORT_644_DRAFT" },
      inquiry: {
        intake: { unit: "กองปราบ 1", investigator: "mock-investigator-1", receivedFirstAt: "2026-01-20", orderNo: "คำสั่ง 10/2569", orderDate: "2026-08-01" },
        prelim: { startedAt: "2026-01-20", deadlineAt: "2026-07-18", planStatus: "approved", extensionHistory: [] },
        inquiry644: { startedAt: "2026-08-01", deadlineAt: "2027-04-28", investigator: "mock-investigator-1", status: "อยู่ระหว่างไต่สวนชี้มูล", planStatus: "approved", plan: "รวบรวมพยานเอกสาร แจ้งข้อกล่าวหา รับคำชี้แจง และจัดทำรายงาน 644", accused: ["นาย ก."], allegations: "รับรองงานที่ส่งมอบไม่ครบถ้วน", witnesses: [], statements: "", extensionHistory: [] },
        committee213: { orderType: "24v1", orderNo: "คำสั่ง 10/2569", orderDate: "2026-08-01", handoverDoc: { letterNo: "สปท 001/2569" } }
      },
      assignment: { primaryOfficerId: "mock-investigator-1", primaryOfficerName: "พนักงาน ป.ป.ท. สมชาย", legalOwner: "mock-investigator-1", assignmentVersion: 1, acceptedAssignmentVersion: 1 },
      a5EvidenceRepository: [
        { versionId: "record8-appointment:v1", name: "คำสั่งแต่งตั้งคณะไต่สวน 10/2569", availability: "AVAILABLE" },
        { versionId: "record8-additional-order:v1", name: "อนุสนธิคำสั่งเพิ่มผู้ถูกกล่าวหา", availability: "AVAILABLE" },
        { versionId: "record8-service:v1", name: "หลักฐานการส่งหนังสือแจ้งข้อกล่าวหา", availability: "AVAILABLE" },
        { versionId: "record8-receipt:v1", name: "หลักฐานรับสำเนาแบบ ปปท. 6", availability: "AVAILABLE" },
        { versionId: "record8-evidence:v1", name: "พยานเอกสารการเบิกจ่าย", availability: "AVAILABLE" }
      ],
      a5DocumentStore: {
        version: 1,
        records: [{
          documentId: "FORM_4_REPORT_213",
          caseId,
          revisionNo: 1,
          status: "SUBMITTED",
          payload: { accusedPersons: [{ rowId: accusedRowId, order: 1, name: "นาย ก.", position: "เจ้าหน้าที่ตรวจรับ", agency: "หน่วยงานตัวอย่าง" }] },
          submittedSnapshot: { accusedPersons: [{ rowId: accusedRowId, order: 1, name: "นาย ก.", position: "เจ้าหน้าที่ตรวจรับ", agency: "หน่วยงานตัวอย่าง" }] }
        }]
      },
      caseAdministration: { caseSize: "M", xlRequest: { status: "" } },
      decisionHistory: [{ text: "เปิด Seed สำหรับสาธิต Record 8", time: "21 สิงหาคม 2569" }],
      custody: { status: "AT_SOURCE", holder: "กองปราบ 1", hasOriginal: true, history: [] },
      returnRoute: { status: "", destination: "" },
      documentData: {},
      activity4Payload: null
    });
    const state = normalized.state;
    const records = state.a5DocumentStore.records;
    const active = documentId => records.filter(record => record.documentId === documentId).sort((left, right) => right.revisionNo - left.revisionNo)[0];
    const form5 = active(api.form5DocId(accusedRowId));
    Object.assign(form5.payload.noticeMeta, { letterNo: "ปปท 001/2569", issuedAt: "2026-08-21", caseRefNo: caseId });
    form5.payload.attachments.appointmentOrder = { refNo: "คำสั่ง 10/2569", date: "2026-08-01", pageCount: "2", versionId: "record8-appointment:v1" };
    form5.payload.returnAddress.division = "กองปราบ 1";
    form5.payload.caseOwnerContact = { division: "กองปราบ 1", phone: "021234567", fax: "", officerName: "พนักงาน ป.ป.ท. สมชาย", officerPhone: "021234567" };

    const form6 = active(api.form6DocId(accusedRowId));
    form6.payload.noticeRef = { documentId: api.form5DocId(accusedRowId), revisionNo: 1 };
    form6.payload.recordMeta.issuedAt = "2026-08-22";
    form6.payload.offenceCategory = ["CRIMINAL"];
    form6.payload.issue1EventNarrative = "ผู้ถูกกล่าวหาได้รับแจ้งข้อกล่าวหาตามพยานหลักฐานในสำนวน";
    form6.payload.issue2 = { statusPosition: "เป็นเจ้าหน้าที่ของรัฐ", authority: "มีหน้าที่ตรวจรับงาน", conduct: "รับรองงานที่ไม่ครบถ้วน", damage: "รัฐได้รับความเสียหาย" };
    form6.payload.issue3 = { criminalCharge: "ปฏิบัติหน้าที่โดยมิชอบ", disciplinaryCharge: "", incidentDate: "2026-01-15", incidentPeriodFrom: "", incidentPeriodTo: "", incidentLocation: { subdistrict: "บางรัก", district: "บางรัก", province: "กรุงเทพมหานคร" } };
    form6.payload.panel = [{ rowId: "record8-panel-1", order: 1, name: "พนักงาน ป.ป.ท. สมชาย", role: "พนักงานไต่สวน" }];
    form6.payload.panelSignatures = [{ panelRowId: "record8-panel-1", signedBy: "พนักงาน ป.ป.ท. สมชาย", signedAt: "2026-08-22", methodLabel: "ลายมือชื่ออิเล็กทรอนิกส์" }];
    form6.payload.copies[2].returnedAt = "2026-08-22";
    form6.payload.copies[2].receiptEvidenceVersionId = "record8-receipt:v1";

    const form7 = active(api.FORM_7_ID);
    Object.assign(form7.payload.reportMeta, { docRef: "ร644/1", matterNo: caseId, owningDivision: "กองปราบ 1", issuedAt: "2026-08-23" });
    form7.payload.intake = { caseType: "MISCONDUCT", nacc: {}, misconduct: { receivedAt: "2026-01-20", channel: "หนังสือราชการ" }, appointmentOrder: { orderRef: "คำสั่ง 10/2569", amendmentNote: "", versionId: "record8-appointment:v1" } };
    form7.payload.accusers = [{ rowId: "record8-accuser-1", order: 1, name: "ผู้กล่าวหาตัวอย่าง", address: "กรุงเทพมหานคร", capacity: "ผู้ร้อง", anonymized: false }];
    form7.payload.allegations = [{ rowId: "record8-allegation-1", order: 1, summary: "รับรองงานที่ส่งมอบไม่ครบถ้วน", eventDescription: "เกิดเหตุวันที่ 15 มกราคม 2569 ที่กรุงเทพมหานคร" }];
    form7.payload.evidence = [{ rowId: "record8-evidence-1", order: 1, documentVersionId: "record8-evidence:v1", category: "DOCUMENT", title: "เอกสารการเบิกจ่าย", factSupported: "ยืนยันการเบิกจ่ายก่อนส่งมอบครบ", custodyNote: "เก็บในสำนวน" }];
    form7.payload.otherMeasures = [{ rowId: "record8-measure-1", order: 1, kind: "OTHER", detail: "ตรวจสอบทะเบียนเอกสาร", result: "พบข้อมูลสอดคล้อง" }];
    form7.payload.eventContext = { place: "กรุงเทพมหานคร", period: "15 มกราคม 2569" };
    form7.payload.damage = { description: "รัฐชำระเงินเกินผลงาน", amount: "100000" };
    form7.payload.limitation = [{ rowId: "record8-limitation-1", order: 1, allegationRowId: "record8-allegation-1", startAt: "2026-01-15", expiresAt: "2046-01-15", source: "คำนวณจากวันเกิดเหตุ", note: "" }];
    form7.payload.legalBasis = [{ rowId: "record8-law-1", order: 1, lawName: "กฎหมายตัวอย่าง", section: "มาตรา 1", applicationReason: "ใช้วินิจฉัยการปฏิบัติหน้าที่" }];
    form7.payload.chargeNotice.orderNotice.letterRef = "ปปท 001/2569";
    form7.payload.adjudication = { perAccused: [], issueFraming: "การรับรองงานเป็นการปฏิบัติหน้าที่โดยมิชอบหรือไม่", factsFound: "พบการรับรองก่อนส่งมอบครบ", factAnalysis: "พยานเอกสารสอดคล้องกัน", lawAnalysis: "เข้าองค์ประกอบตามกฎหมายตัวอย่าง", opinions: [{ opinionId: "record8-opinion-1", kind: "MAJORITY", authorName: "พนักงาน ป.ป.ท. สมชาย", text: "เห็นว่าข้อกล่าวหามีมูล" }] };
    form7.payload = api.syncReport644DerivedRowsA5(form7.payload);
    Object.assign(form7.payload.adjudication.perAccused[0], { statusIssue: "เป็นเจ้าหน้าที่ของรัฐ", authorityIssue: "มีอำนาจตรวจรับ", conductIssue: "รับรองงานไม่ครบ", damageIssue: "รัฐเสียหาย" });
    Object.assign(form7.payload.offenceConclusions[0], { dropped: false, droppedReason: "", criminalCharges: [{ lawName: "กฎหมายตัวอย่าง", section: "มาตรา 1" }], disciplinaryCharges: [], otherRouting: { type: "", detail: "" } });
    form7.payload.panelSignatures = [{ signatureId: "record8-signature-1", order: 1, signedBy: "พนักงาน ป.ป.ท. สมชาย", signedAt: "2026-08-23", methodLabel: "ลายมือชื่ออิเล็กทรอนิกส์" }];
    state.a5Report644Lifecycle.additionalAccusedRequests = [{ requestId: "record8-additional-request-1", status: "REQUESTED", accused: { name: "นาง ข.", position: "เจ้าหน้าที่การเงิน", agency: "หน่วยงานตัวอย่าง" }, reason: "พบพยานหลักฐานเชื่อมโยงเพิ่มเติม", evidenceSummary: "เอกสารการเบิกจ่ายฉบับเพิ่มเติม", requestedBy: "mock-investigator-1", requestedByName: "พนักงาน ป.ป.ท. สมชาย", requestedAt: "2026-08-21T09:00:00Z", signedOrder: null, accusedRowId: "" }];
    return clone(state);
  }

  const api = Object.freeze({
    DEMO_CASE_ID: "R8-DEMO/2569",
    buildActivity5Record8Seed,
    buildSeedCases: () => ({ "R8-DEMO/2569": buildActivity5Record8Seed() })
  });
  root.ECMISActivity5Record8Seed = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
