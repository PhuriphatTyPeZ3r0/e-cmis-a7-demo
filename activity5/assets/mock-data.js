export const DEMO_DATE = "2026-08-02";

export const PHASES = Object.freeze({
  INTAKE: "รอตรวจรับเรื่อง",
  PRELIMINARY: "แสวงหาข้อเท็จจริง",
  WAIT_A7_213: "รอผลพิจารณารับไว้ไต่สวน",
  INQUIRY: "ไต่สวนข้อเท็จจริง",
  WAIT_A7_644: "รอผลวินิจฉัย",
  POST_DECISION: "ดำเนินการตามมติ",
  MERGED: "รวมเข้าสำนวนหลัก",
  CLOSED: "เสร็จสิ้น"
});

export const ASSIGNMENT_STATES = Object.freeze({
  UNASSIGNED: "ยังไม่มอบหมาย",
  TRANSFER_APPROVAL_PENDING: "รอเลขาธิการฯ อนุมัติโอน",
  TRANSFER_PENDING: "รอรับโอน",
  ASSIGNED: "มอบหมายแล้ว",
  ACKNOWLEDGED: "รับงานแล้ว",
  REASSIGN_PENDING: "รอเปลี่ยนผู้รับผิดชอบ"
});

export const REPORT_STATES = Object.freeze({
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "ส่งตรวจแล้ว",
  RETURNED: "ส่งกลับแก้ไข",
  AWAITING_SECRETARY: "รอเลขาธิการฯ พิจารณา",
  READY_TO_SEND: "พร้อมเสนอคณะกรรมการฯ",
  LOCKED: "ล็อกฉบับแล้ว"
});

export const INTEGRATION_STATES = Object.freeze({
  QUEUED: "ยังไม่ได้เสนอ",
  SENT: "เสนอแล้ว",
  ACKED: "รับเรื่องแล้ว",
  FAILED: "ส่งเสนอไม่สำเร็จ",
  DECISION_RECEIVED: "รับผลพิจารณาแล้ว",
  QUARANTINED: "ผลการพิจารณาต้องตรวจสอบ"
});

export const HANDOFF_STATES = Object.freeze({
  PENDING: "รอดำเนินการ",
  PARTIAL: "ส่งต่อสำเร็จบางส่วน",
  FAILED: "นำส่งไม่สำเร็จ",
  ACKNOWLEDGED: "ปลายทางรับแล้ว",
  AWAITING_EXTERNAL: "รอหน่วยงานภายนอก",
  CLOSED: "ส่งต่อครบถ้วน",
  REOPENED: "เปิดดำเนินการอีกครั้ง"
});

export const PLAN_STATES = Object.freeze({
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "ส่งตรวจแล้ว",
  APPROVED: "อนุมัติแล้ว",
  RETURNED: "ส่งกลับแก้ไข"
});

export const SPECIAL_MATTER_STATES = Object.freeze({
  PENDING_CLERK_REVIEW: "รอธุรการคดีตรวจข้อมูล",
  PENDING_DIRECTOR_ASSIGNMENT: "รอผู้อำนวยการมอบหมาย",
  RETURNED_TO_COMPLAINT_CENTER: "ส่งคืนศูนย์รับเรื่องร้องเรียน",
  ASSIGNED: "มอบหมายผู้รับผิดชอบแล้ว",
  FACT_FINDING: "อยู่ระหว่างตรวจสอบข้อเท็จจริง",
  REPORT_RETURNED: "รายงานถูกส่งกลับแก้ไข",
  AWAITING_DIRECTOR_REVIEW: "รอผู้บังคับบัญชาระดับผู้อำนวยการตรวจรายงาน",
  AWAITING_EXECUTIVE_REVIEW: "รอผู้ช่วยหรือรองเลขาธิการฯ ที่กำกับตรวจรายงาน",
  AWAITING_SECRETARY: "รอเลขาธิการฯ พิจารณา",
  READY_TO_NOTIFY: "พร้อมแจ้งหน่วยงานตามผลพิจารณา",
  AWAITING_AGENCY_ACTION: "รอผลแก้ไขจากหัวหน้าหน่วยงานของรัฐ",
  READY_PUBLIC_NOTICE: "พร้อมประกาศให้ประชาชนทราบ",
  COMPLETED: "ดำเนินการแจ้งตามผลพิจารณาแล้ว"
});

export const RESULT_OPTIONS_213 = Object.freeze([
  { value: "ACCEPT_EMPLOYEE_PANEL", label: "รับไว้ดำเนินการโดยคณะพนักงาน ป.ป.ท." },
  { value: "ACCEPT_SUBCOMMITTEE", label: "รับไว้ดำเนินการโดยคณะอนุกรรมการไต่สวน" },
  { value: "MORE_PRELIMINARY", label: "ให้แสวงหาข้อเท็จจริงเพิ่มเติม" },
  { value: "NOT_ACCEPT_TRANSFER_NACC", label: "ไม่รับไว้และส่งต่อ ป.ป.ช." },
  { value: "NOT_ACCEPT_TERMINATE", label: "ไม่รับไว้และยุติเรื่อง" },
  { value: "NOT_ACCEPT_OTHER_AGENCY", label: "ไม่รับไว้และส่งหน่วยงานอื่น" }
]);

export const RESULT_OPTIONS_644 = Object.freeze([
  { value: "MORE_INQUIRY", label: "ให้ไต่สวนเพิ่มเติม" },
  { value: "SUBSTANTIATE_CORRUPTION", label: "ชี้มูลความผิดทางอาญาและ/หรือวินัย กรณีทุจริตต่อหน้าที่" },
  { value: "SUBSTANTIATE_MISCONDUCT", label: "ชี้มูลความผิดทางอาญาและ/หรือวินัย กรณีประพฤติมิชอบ" },
  { value: "SUBSTANTIATE_SERIOUS_DISCIPLINE", label: "ชี้มูลความผิดวินัยร้ายแรง" },
  { value: "ALLEGATION_UNFOUNDED", label: "ข้อกล่าวหาไม่มีมูล" }
]);

export const EXTERNAL_TARGETS = Object.freeze([
  { value: "PROSECUTOR", label: "พนักงานอัยการ" },
  { value: "PARENT_AGENCY", label: "หน่วยงานต้นสังกัด" },
  { value: "NACC", label: "ป.ป.ช." },
  { value: "OTHER", label: "หน่วยงานอื่น" },
  { value: "ACCUSED", label: "ผู้ถูกกล่าวหา" }
]);

const ZONE_UNITS = Object.freeze(Array.from({ length: 9 }, (_, index) => `สำนักงาน ป.ป.ท. เขต ${index + 1}`));

export const TRANSFER_TARGETS = Object.freeze(ZONE_UNITS.map((unit) => ({ value: unit, label: unit })));

const generatedZoneLeaders = [3, 4, 5, 6, 7, 8, 9].flatMap((zone) => {
  const unit = `สำนักงาน ป.ป.ท. เขต ${zone}`;
  const accounts = [
    zone === 3 ? null : {
      username: `clerk.zone${zone}`,
      password: `ClerkZone${zone}@2569`,
      name: `เจ้าหน้าที่ธุรการคดีเขต ${zone}`,
      role: "CLERK",
      unit: `ธุรการคดี ${unit}`,
      allowedOwningUnits: [unit]
    },
    {
      username: `director.zone${zone}`,
      password: `DirectorZone${zone}@2569`,
      name: `ผู้อำนวยการเขต ${zone}`,
      role: "DIRECTOR",
      unit,
      allowedOwningUnits: [unit]
    },
    {
      username: `review.zone${zone}`,
      password: `ReviewZone${zone}@2569`,
      name: `หัวหน้าพนักงาน ป.ป.ท. เขต ${zone}`,
      role: "REVIEW",
      unit,
      position: `ผู้อำนวยการ${unit}`,
      authority: "หัวหน้าพนักงาน ป.ป.ท. ระดับผู้อำนวยการ",
      allowedOwningUnits: [unit]
    }
  ];
  return accounts.filter(Boolean);
});

const generatedCaseWorkers = ZONE_UNITS.flatMap((unit, index) => {
  const zone = index + 1;
  const suffixes = zone <= 2 ? [2] : [1, 2];
  return suffixes.flatMap((sequence) => [
    {
      username: `prelim.zone${zone}.${sequence}`,
      password: `PrelimZone${zone}${sequence}@2569`,
      name: `พนักงานแสวงหาข้อเท็จจริงเขต ${zone} คนที่ ${sequence}`,
      role: "PRELIM",
      unit
    },
    {
      username: `inquiry.zone${zone}.${sequence}`,
      password: `InquiryZone${zone}${sequence}@2569`,
      name: `พนักงานไต่สวนเขต ${zone} คนที่ ${sequence}`,
      role: "INQUIRY",
      unit
    }
  ]);
});

export const ROLES = Object.freeze({
  CLERK: "ธุรการคดี",
  DIRECTOR: "ผอ.สำนัก/กอง/สำนักงานเขต",
  PRELIM: "พนักงานผู้แสวงหาข้อเท็จจริง",
  REVIEW: "หัวหน้าพนักงาน ป.ป.ท. ระดับผู้อำนวยการ",
  EXECUTIVE: "ผู้ช่วย/รองเลขาธิการฯ ที่กำกับดูแล",
  SECRETARY: "เลขาธิการคณะกรรมการ ป.ป.ท.",
  CASE_ADMIN: "เจ้าหน้าที่กองบริหารคดี",
  INQUIRY: "พนักงานไต่สวน",
  CASE_TRACKING: "กลุ่มงานบริหารติดตามคดี (กบต.)",
  DECISION_AFFAIRS: "กลุ่มคำวินิจฉัย/กลุ่มกิจการ",
  SPECIAL_OFFICER: "เจ้าหน้าที่ผู้ตรวจสอบข้อเท็จจริงตามมาตรา 58/2 และ 58/3",
  AUDIT: "ผู้ตรวจสอบระบบ"
});

export const ACCOUNTS = Object.freeze([
  {
    username: "clerk.a5",
    password: "Clerk@2569",
    name: "อรอนงค์ งานคดี",
    role: "CLERK",
    unit: "ธุรการคดี สำนักงาน ป.ป.ท. เขต 1",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 1"],
    delegatedAuthorities: ["intake.accept", "intake.return", "transfer.request"],
    authority: "ได้รับมอบสิทธิ์จากผู้อำนวยการเขต 1 ตามทะเบียนสิทธิ์"
  },
  {
    username: "clerk.zone2",
    password: "ClerkZone2@2569",
    name: "พิมพ์ชนก ธุรการเขต 2",
    role: "CLERK",
    unit: "ธุรการคดี สำนักงาน ป.ป.ท. เขต 2",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 2"]
  },
  {
    username: "clerk.zone3",
    password: "ClerkZone3@2569",
    name: "ศุภชัย ธุรการเขต 3",
    role: "CLERK",
    unit: "ธุรการคดี สำนักงาน ป.ป.ท. เขต 3",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 3"]
  },
  {
    username: "director.a5",
    password: "Director@2569",
    name: "สมชาย ผู้อำนวยการ",
    role: "DIRECTOR",
    unit: "สำนักงาน ป.ป.ท. เขต 1",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 1"]
  },
  {
    username: "director.zone2",
    password: "DirectorZone2@2569",
    name: "กมล ผู้อำนวยการเขต 2",
    role: "DIRECTOR",
    unit: "สำนักงาน ป.ป.ท. เขต 2",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 2"]
  },
  {
    username: "prelim.a5",
    password: "Prelim@2569",
    name: "ปวีณา พนักงาน ป.ป.ท.",
    role: "PRELIM",
    unit: "กลุ่มแสวงหาข้อเท็จจริง"
  },
  {
    username: "prelim.zone2",
    password: "PrelimZone2@2569",
    name: "ณัฐชา พนักงาน ป.ป.ท. เขต 2",
    role: "PRELIM",
    unit: "สำนักงาน ป.ป.ท. เขต 2"
  },
  {
    username: "review.a5",
    password: "Review@2569",
    name: "วิโรจน์ ผู้อำนวยการเขต 1",
    role: "REVIEW",
    unit: "สำนักงาน ป.ป.ท. เขต 1",
    position: "ผู้อำนวยการสำนักงาน ป.ป.ท. เขต 1",
    authority: "หัวหน้าพนักงาน ป.ป.ท. ระดับผู้อำนวยการ",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 1"]
  },
  {
    username: "review.zone2",
    password: "ReviewZone2@2569",
    name: "มณีรัตน์ ผู้อำนวยการเขต 2",
    role: "REVIEW",
    unit: "สำนักงาน ป.ป.ท. เขต 2",
    position: "ผู้อำนวยการสำนักงาน ป.ป.ท. เขต 2",
    authority: "หัวหน้าพนักงาน ป.ป.ท. ระดับผู้อำนวยการ",
    allowedOwningUnits: ["สำนักงาน ป.ป.ท. เขต 2"]
  },
  {
    username: "executive.a5",
    password: "Executive@2569",
    name: "ศิริพร ผู้อนุมัติ",
    role: "EXECUTIVE",
    unit: "ผู้ช่วย/รองเลขาธิการฯ ที่กำกับดูแล"
  },
  {
    username: "secretary.a5",
    password: "Secretary@2569",
    name: "นฤมล ฝ่ายเลขานุการ",
    role: "SECRETARY",
    unit: "ฝ่ายเลขานุการคดี"
  },
  {
    username: "caseadmin.a5",
    password: "CaseAdmin@2569",
    name: "เจ้าหน้าที่กองบริหารคดี",
    role: "CASE_ADMIN",
    unit: "กองบริหารคดี"
  },
  {
    username: "inquiry.a5",
    password: "Inquiry@2569",
    name: "ธนกร พนักงานไต่สวน",
    role: "INQUIRY",
    unit: "กลุ่มไต่สวนข้อเท็จจริง"
  },
  {
    username: "inquiry.zone2",
    password: "InquiryZone2@2569",
    name: "ภาคิน พนักงานไต่สวนเขต 2",
    role: "INQUIRY",
    unit: "สำนักงาน ป.ป.ท. เขต 2"
  },
  {
    username: "tracking.a5",
    password: "Tracking@2569",
    name: "ชลธิชา เจ้าหน้าที่ กบต.",
    role: "CASE_TRACKING",
    unit: "กลุ่มงานบริหารติดตามคดี กองบริหารคดี"
  },
  {
    username: "decision.a5",
    password: "Decision@2569",
    name: "พิชญา กลุ่มคำวินิจฉัยและกิจการ",
    role: "DECISION_AFFAIRS",
    unit: "กลุ่มคำวินิจฉัย/กลุ่มกิจการ"
  },
  {
    username: "special.a5",
    password: "Special@2569",
    name: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
    role: "SPECIAL_OFFICER",
    unit: "สำนักงาน ป.ป.ท. เขต 1"
  },
  {
    username: "audit.a5",
    password: "Audit@2569",
    name: "รัตนา ผู้ตรวจสอบ",
    role: "AUDIT",
    unit: "หน่วยตรวจสอบภายใน"
  },
  ...generatedZoneLeaders,
  ...generatedCaseWorkers
]);

export const ROLE_PERMISSIONS = Object.freeze({
  CLERK: [
    "case.read",
    "transfer.respond",
    "special.intake.review"
  ],
  DIRECTOR: ["case.read", "intake.accept", "intake.return", "transfer.request", "assignment.assign", "assignment.change", "special.assign"],
  PRELIM: [
    "case.read",
    "assignment.acknowledge",
    "plan.edit",
    "plan.submit",
    "worklog.edit",
    "evidence.edit",
    "report213.edit",
    "report213.submit",
    "extension.request",
    "extension.exhaustion.create",
    "support.request",
    "relations.request",
    "handoff.postDecision",
    "postdecision.prepare",
    "postdecision.dispatch",
    "postdecision.retry"
  ],
  REVIEW: [
    "case.read",
    "review.queue",
    "plan.review",
    "report213.review",
    "report644.review",
    "extension.review.director",
    "extension.chain.opinion",
    "relations.review",
    "postdecision.sign",
    "special.report.review.director"
  ],
  EXECUTIVE: ["case.read", "extension.review.executive", "special.report.review.executive"],
  SECRETARY: [
    "case.read",
    "report.secretary.review",
    "activity7.send",
    "activity7.receive",
    "handoff.inquiry",
    "extension.escalation.finalize",
    "extension.escalation.send",
    "transfer.approve",
    "relations.decide",
    "special.report.decide"
  ],
  CASE_ADMIN: ["case.read", "support.dispatch", "support.opinion.record", "relations.forward"],
  INQUIRY: [
    "case.read",
    "assignment.acknowledge",
    "worklog.edit",
    "evidence.edit",
    "report644.edit",
    "report644.submit",
    "extension.request",
    "extension.exhaustion.create",
    "support.request",
    "relations.request",
    "handoff.postDecision",
    "postdecision.prepare",
    "postdecision.dispatch",
    "postdecision.retry"
  ],
  CASE_TRACKING: ["case.read", "disciplinary.dispatch", "disciplinary.retry"],
  DECISION_AFFAIRS: ["case.read", "disciplinary.copy"],
  SPECIAL_OFFICER: ["special.read", "special.acknowledge", "special.report.edit", "special.report.submit", "special.notify"],
  AUDIT: ["case.read", "audit.read"]
});

export const INVESTIGATOR_DIRECTORY = Object.freeze([
  { name: "ปวีณา พนักงาน ป.ป.ท.", account: "prelim.a5", units: ["สำนักงาน ป.ป.ท. เขต 1"], workType: "PRELIM" },
  { name: "ธนกร พนักงานไต่สวน", account: "inquiry.a5", units: ["สำนักงาน ป.ป.ท. เขต 1"], workType: "INQUIRY" },
  { name: "ณัฐชา พนักงาน ป.ป.ท. เขต 2", account: "prelim.zone2", units: ["สำนักงาน ป.ป.ท. เขต 2"], workType: "PRELIM" },
  { name: "ภาคิน พนักงานไต่สวนเขต 2", account: "inquiry.zone2", units: ["สำนักงาน ป.ป.ท. เขต 2"], workType: "INQUIRY" },
  ...generatedCaseWorkers.map((account) => ({
    name: account.name,
    account: account.username,
    units: [account.unit],
    workType: account.role === "PRELIM" ? "PRELIM" : "INQUIRY"
  }))
]);

export const INVESTIGATORS = Object.freeze(INVESTIGATOR_DIRECTORY.map((entry) => entry.name));

const issueTitles = [
  "สถานะของผู้ถูกร้องเรียน",
  "ขอบเขตอำนาจหน้าที่ของผู้ถูกร้องเรียน",
  "การกระทำของผู้ถูกร้องเรียนถูกต้องตามอำนาจหน้าที่หรือไม่",
  "ประเด็นเกี่ยวกับความเสียหาย"
];

function makeIssues(values = []) {
  return issueTitles.map((title, index) => ({
    id: `issue-${index + 1}`,
    title,
    finding: values[index] || ""
  }));
}

function initialAudit(caseId, actor, action, reason, version, time) {
  return {
    id: `${caseId}-audit-${version}`,
    caseId,
    actor,
    role: "SYSTEM",
    action,
    reason,
    version,
    outcome: "SUCCESS",
    time
  };
}

function addYears(date, years) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function emptyExhaustion() {
  return {
    status: "NOT_REQUIRED",
    reasonAndNecessity: "",
    pastActions: "",
    remainingActions: "",
    obstacles: "",
    expectedCompletionAt: "",
    createdAt: "",
    createdBy: "",
    chainOpinion: "",
    chainOpinionAt: "",
    chainOpinionBy: "",
    secretaryOpinion: "",
    remedy: "",
    finalizedAt: "",
    finalizedBy: "",
    sentAt: "",
    sentBy: "",
    messageId: "",
    inboundMessageId: "",
    correlationId: "",
    directive: "",
    meetingDate: "",
    meetingNo: "",
    receivedAt: "",
    receivedBy: "",
    inboundMessages: [],
    quarantinedInbound: [],
    directiveWarning: ""
  };
}

function emptySecretaryReview() {
  return {
    status: "NOT_REQUIRED",
    complexityDecision: "",
    outboundAt: "",
    outboundBy: "",
    supportOpinion: "",
    supportOpinionAt: "",
    returnedReason: "",
    finalizedAt: "",
    finalizedBy: ""
  };
}

function emptyAllegationProcess() {
  return {
    evidenceAssessment: "NOT_RECORDED",
    notices: [],
    exceptions: []
  };
}

function seededAllegationProcess(caseId, accusedNames, options = {}) {
  const completeCount = options.completeCount ?? accusedNames.length;
  const noticeDate = options.noticeDate || "2026-06-01";
  return {
    evidenceAssessment: "SUFFICIENT",
    notices: accusedNames.map((accusedName, index) => {
      const complete = index < completeCount;
      return {
        id: `${caseId}-notice-${index + 1}`,
        accusedName,
        letterNo: `นข-${caseId.replaceAll("-", "")}-${index + 1}`,
        noticeDate,
        appointmentDate: addDays(noticeDate, 7 + index),
        evidenceBasis: "พยานเอกสารและพยานบุคคลในสำนวนสนับสนุนข้อกล่าวหาเพียงพอ",
        createdAt: `${noticeDate}T09:00:00+07:00`,
        createdBy: "ธนกร พนักงานไต่สวน",
        service: complete
          ? {
              status: "SERVED_IN_PERSON",
              method: "IN_PERSON",
              date: addDays(noticeDate, 7 + index),
              reference: `บร-${caseId.replaceAll("-", "")}-${index + 1}`,
              location: ""
            }
          : {
              status: "PENDING_APPOINTMENT",
              method: "",
              date: "",
              reference: "",
              location: ""
            },
        responses: complete
          ? [{
              id: `${caseId}-notice-${index + 1}-response-1`,
              outcome: "EXPLANATION_RECEIVED",
              date: addDays(noticeDate, 10 + index),
              explanation: "รับฟังและบันทึกคำชี้แจงของผู้ถูกกล่าวหาแล้ว",
              evidenceReference: `ชจ-${caseId.replaceAll("-", "")}-${index + 1}`,
              recordedAt: `${addDays(noticeDate, 10 + index)}T10:00:00+07:00`,
              recordedBy: "ธนกร พนักงานไต่สวน"
            }]
          : []
      };
    }),
    exceptions: []
  };
}

function baseCase(overrides) {
  const id = overrides.id;
  const version = overrides.version || 1;
  const receivedAt = overrides.receivedAt || "2026-06-15";
  const base = {
    id,
    referenceNo: id,
    title: "",
    complainant: "ผู้ร้องเรียนปกปิดชื่อ",
    agency: "หน่วยงานของรัฐ",
    owningUnit: "สำนักงาน ป.ป.ท. เขต 1",
    receivedAt,
    sourceBoundary: "ศูนย์รับเรื่องร้องเรียน",
    phase: "INTAKE",
    priority: "ปกติ",
    version,
    assignment: {
      state: "UNASSIGNED",
      team: "",
      investigator: "",
      assignees: [],
      sourceOwningUnit: "",
      transferTarget: "",
      transferReason: "",
      transferResponse: "NOT_REQUIRED",
      transferResponseReason: "",
      transferApproval: {
        status: "NOT_REQUIRED",
        requestedAt: "",
        requestedBy: "",
        decidedAt: "",
        decidedBy: "",
        decisionReason: "",
        sourceMemoNo: "",
        targetMemoNo: ""
      }
    },
    plan: {
      status: "DRAFT",
      objective: "",
      issues: makeIssues(),
      reviewerNote: ""
    },
    worklogs: [],
    evidence: [],
    supportRequests: [],
    report213: {
      status: "DRAFT",
      summary: "",
      recommendation: "",
      startedAt: receivedAt,
      deadlineAt: addDays(receivedAt, 60),
      extensionHistory: [],
      revisions: [],
      exhaustion: emptyExhaustion(),
      secretaryReview: emptySecretaryReview(),
      reviewerNote: ""
    },
    integration: {
      status: "QUEUED",
      reportType: "",
      messageId: "",
      decision: "",
      decisionLabel: "",
      directives: [],
      lastError: "",
      callbackWarning: "",
      attempts: [],
      inboundMessages: [],
      quarantinedCallbacks: [],
      inboundMessageId: "",
      correlationId: "",
      finalizedAt: "",
      meetingDate: "",
      meetingNo: "",
      meetingNote: ""
    },
    report644: {
      status: "DRAFT",
      appointmentType: "",
      signatory: "",
      orderNo: "",
      orderDate: "",
      appointmentMeetingDate: "",
      planSummary: "",
      evidenceSummary: "",
      allegationNotice: "",
      response: "",
      allegationProcess: emptyAllegationProcess(),
      summary: "",
      recommendation: "",
      startedAt: "",
      deadlineAt: "",
      extensionHistory: [],
      revisions: [],
      exhaustion: emptyExhaustion(),
      secretaryReview: emptySecretaryReview(),
      supplementalInquiry: {
        status: "NOT_REQUIRED",
        startedAt: "",
        deadlineAt: "",
        reason: "",
        extensionReason: "",
        extensionDecision: "",
        extensionDays: 0,
        requestedAt: "",
        decidedAt: "",
        decidedBy: ""
      },
      reviewerNote: ""
    },
    handoff: {
      status: "PENDING",
      target: "",
      note: "",
      deliveries: []
    },
    registry: {
      status: "PENDING",
      dispatchNo: "",
      dispatchedAt: "",
      acknowledgmentNo: "",
      acknowledgedAt: ""
    },
    overallDeadline: {
      startAt: receivedAt,
      normalAt: addYears(receivedAt, 2),
      necessaryAt: addYears(receivedAt, 3),
      foreignEvidenceAt: addYears(receivedAt, 5)
    },
    relations: {
      mergedInto: "",
      mergedFrom: [],
      mergeRequest: {
        status: "NOT_REQUESTED",
        candidateId: "",
        proposedMasterId: "",
        proposedSourceId: "",
        factsOverlap: "",
        accusedOverlap: "",
        requestedAt: "",
        requestedBy: "",
        decision: "",
        decisionReason: "",
        decidedAt: "",
        decidedBy: ""
      },
      splitRequests: []
    },
    audit: [
      initialAudit(
        id,
        "ระบบรับเรื่อง",
        "CASE_CREATED",
        "รับเรื่องจากศูนย์รับเรื่องร้องเรียน",
        version,
        `${overrides.receivedAt || "2026-06-15"}T09:00:00+07:00`
      )
    ]
  };

  const mergedAssignment = {
    ...base.assignment,
    ...(overrides.assignment || {}),
    transferApproval: {
      ...base.assignment.transferApproval,
      ...(overrides.assignment?.transferApproval || {})
    }
  };
  const legacyInvestigator = String(mergedAssignment.investigator || "").trim();
  const assignees = overrides.assignment?.assignees || (legacyInvestigator
    ? [(() => {
        const directoryEntry = INVESTIGATOR_DIRECTORY.find((entry) => entry.name === legacyInvestigator);
        return {
          name: legacyInvestigator,
          account: directoryEntry?.account || "",
          workType: directoryEntry?.workType || (overrides.phase === "INQUIRY" ? "INQUIRY" : "PRELIM"),
          assignmentRole: "LEAD",
          acknowledgedAt: mergedAssignment.state === "ACKNOWLEDGED" ? `${receivedAt}T10:00:00+07:00` : ""
        };
      })()]
    : []);
  const report213Extensions = overrides.report213?.extensionHistory || base.report213.extensionHistory;
  const report213Deadline = report213Extensions
    .filter((entry) => entry.status === "APPROVED")
    .reduce((deadline, entry) => addDays(deadline, entry.requestedDays), addDays(receivedAt, 60));

  return {
    ...base,
    ...overrides,
    assignment: {
      ...mergedAssignment,
      assignees: assignees.map((entry, index) => ({ ...entry, assignmentRole: entry.assignmentRole || (index === 0 ? "LEAD" : "ASSISTANT") })),
      investigator: assignees.map((entry) => entry.name).join(", ")
    },
    plan: { ...base.plan, ...(overrides.plan || {}) },
    report213: {
      ...base.report213,
      ...(overrides.report213 || {}),
      startedAt: receivedAt,
      deadlineAt: report213Deadline,
      extensionHistory: report213Extensions,
      exhaustion: { ...base.report213.exhaustion, ...(overrides.report213?.exhaustion || {}) },
      secretaryReview: { ...base.report213.secretaryReview, ...(overrides.report213?.secretaryReview || {}) }
    },
    integration: { ...base.integration, ...(overrides.integration || {}) },
    report644: {
      ...base.report644,
      ...(overrides.report644 || {}),
      allegationProcess: {
        ...base.report644.allegationProcess,
        ...(overrides.report644?.allegationProcess || {}),
        notices: overrides.report644?.allegationProcess?.notices || base.report644.allegationProcess.notices,
        exceptions: overrides.report644?.allegationProcess?.exceptions || base.report644.allegationProcess.exceptions
      },
      exhaustion: { ...base.report644.exhaustion, ...(overrides.report644?.exhaustion || {}) },
      secretaryReview: { ...base.report644.secretaryReview, ...(overrides.report644?.secretaryReview || {}) },
      supplementalInquiry: { ...base.report644.supplementalInquiry, ...(overrides.report644?.supplementalInquiry || {}) }
    },
    handoff: { ...base.handoff, ...(overrides.handoff || {}) },
    registry: { ...base.registry, ...(overrides.registry || {}) },
    relations: {
      ...base.relations,
      ...(overrides.relations || {}),
      mergeRequest: { ...base.relations.mergeRequest, ...(overrides.relations?.mergeRequest || {}) },
      splitRequests: overrides.relations?.splitRequests || base.relations.splitRequests
    }
  };
}

function activity4ReceivedDate(value) {
  const months = {
    "มกราคม": 1, "กุมภาพันธ์": 2, "มีนาคม": 3, "เมษายน": 4,
    "พฤษภาคม": 5, "มิถุนายน": 6, "กรกฎาคม": 7, "สิงหาคม": 8,
    "กันยายน": 9, "ตุลาคม": 10, "พฤศจิกายน": 11, "ธันวาคม": 12
  };
  const match = String(value || "").match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  if (!match || !months[match[2]]) return "";
  const year = Number(match[3]) > 2400 ? Number(match[3]) - 543 : Number(match[3]);
  return `${year}-${String(months[match[2]]).padStart(2, "0")}-${String(Number(match[1])).padStart(2, "0")}`;
}

function activity4OwningUnit(unit) {
  const zone = String(unit || "").match(/เขต\s*(\d+)/)?.[1];
  if (zone) return `สำนักงาน ป.ป.ท. เขต ${zone}`;
  return "สำนักงาน ป.ป.ท. เขต 1";
}

export function createImportedActivity4Case(handoff) {
  const receivedAt = activity4ReceivedDate(handoff.receivedDate)
    || String(handoff.approvedAt || "").slice(0, 10)
    || DEMO_DATE;
  return baseCase({
    id: handoff.activity5CaseId,
    referenceNo: handoff.sourceReference,
    title: handoff.title,
    complainant: handoff.complainant,
    agency: handoff.agency,
    owningUnit: activity4OwningUnit(handoff.unit),
    receivedAt,
    firstAppearanceAt: receivedAt,
    sourceBoundary: "Activity 4 HTML prototype",
    sourceReference: handoff.sourceReference,
    sourceDecision: handoff.sourceDecision,
    sourceReceivedDate: handoff.receivedDate,
    sourceUnit: handoff.unit,
    activity4HandoffId: handoff.handoffId,
    audit: [initialAudit(
      handoff.activity5CaseId,
      "Activity 4 HTML prototype",
      "ACTIVITY4_HANDOFF_IMPORTED",
      `รับข้อมูลส่งต่อ ${handoff.sourceReference} หลัง ผอ.กบค. อนุมัติ`,
      1,
      handoff.approvedAt
    )]
  });
}

function seededCases() {
  return [
    baseCase({
      id: "สส-2569-0001",
      title: "ร้องเรียนการจัดซื้อวัสดุสำนักงานราคาสูงผิดปกติ",
      agency: "สำนักงานจังหวัดตัวอย่าง",
      receivedAt: "2026-08-01",
      phase: "INTAKE",
      priority: "เร่งด่วน"
    }),
    baseCase({
      id: "สส-2569-0002",
      title: "ร้องเรียนการเบิกค่าเดินทางโดยไม่มีภารกิจ",
      agency: "กรมบริการสาธารณะ",
      receivedAt: "2026-07-30",
      phase: "INTAKE",
      assignment: {
        state: "TRANSFER_PENDING",
        sourceOwningUnit: "สำนักงาน ป.ป.ท. เขต 1",
        transferTarget: "สำนักงาน ป.ป.ท. เขต 2",
        transferReason: "เขตอำนาจของเรื่องอยู่ในพื้นที่สำนักงาน ป.ป.ท. เขต 2",
        transferApproval: {
          status: "APPROVED",
          requestedAt: "2026-07-30T10:00:00+07:00",
          requestedBy: "อรอนงค์ งานคดี",
          decidedAt: "2026-07-30T14:00:00+07:00",
          decidedBy: "นฤมล ฝ่ายเลขานุการ"
        }
      }
    }),
    baseCase({
      id: "สส-2569-0003",
      title: "ร้องเรียนเรียกรับผลประโยชน์ในการออกใบอนุญาต",
      agency: "สำนักงานเขตตัวอย่าง",
      receivedAt: "2026-06-20",
      phase: "PRELIMINARY",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "ชุดแสวงหาข้อเท็จจริง 1",
        investigator: "ปวีณา พนักงาน ป.ป.ท."
      },
      plan: {
        status: "APPROVED",
        objective: "ตรวจสอบขั้นตอนออกใบอนุญาตและเส้นทางการติดต่อระหว่างคู่กรณี",
        issues: makeIssues([
          "ตรวจคำขอและลำดับเหตุการณ์",
          "ตรวจคำสั่งมอบหมายหน้าที่",
          "ตรวจผลกระทบต่อผู้ขออนุญาต",
          "รวบรวมเอกสารและถ้อยคำที่เกี่ยวข้อง"
        ])
      },
      worklogs: [
        {
          id: "wl-0003-1",
          date: "2026-07-02",
          detail: "ตรวจทะเบียนคำขออนุญาตและบันทึกการนัดหมาย",
          actor: "ปวีณา พนักงาน ป.ป.ท."
        }
      ],
      evidence: [
        {
          id: "ev-0003-1",
          title: "ทะเบียนคำขออนุญาต",
          type: "เอกสาร",
          source: "สำนักงานเขตตัวอย่าง",
          integrity: "ตรวจรับแล้ว"
        }
      ],
      report213: {
        status: "DRAFT",
        summary: "อยู่ระหว่างสรุปความเชื่อมโยงของเอกสารและถ้อยคำ",
        recommendation: "",
        startedAt: "2026-06-25",
        deadlineAt: "2026-08-23"
      }
    }),
    baseCase({
      id: "สส-2569-0004",
      title: "ร้องเรียนการใช้รถราชการเพื่อประโยชน์ส่วนตัว",
      agency: "สำนักบริหารทรัพยากร",
      receivedAt: "2026-05-01",
      phase: "PRELIMINARY",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "ชุดแสวงหาข้อเท็จจริง 2",
        investigator: "ปวีณา พนักงาน ป.ป.ท."
      },
      plan: {
        status: "RETURNED",
        objective: "ตรวจการอนุมัติและการใช้รถราชการนอกเวลาราชการ",
        issues: makeIssues([
          "ตรวจวันเวลาและเส้นทางใช้รถ",
          "ตรวจผู้มีอำนาจอนุมัติ",
          "ประเมินค่าใช้จ่ายที่เกิดขึ้น",
          "เปรียบเทียบบันทึก GPS กับเอกสารควบคุมรถ"
        ]),
        reviewerNote: "เพิ่มวิธีตรวจสอบข้อมูล GPS และผู้รับรองการใช้รถ"
      },
      report213: {
        status: "RETURNED",
        summary: "พบการใช้รถนอกเวลาราชการหลายครั้ง แต่หลักฐานอนุมัติยังไม่ครบ",
        recommendation: "รวบรวมหลักฐานเพิ่มเติม",
        startedAt: "2026-05-06",
        deadlineAt: "2026-08-03",
        extensionHistory: [
          {
            id: "ext-0004-1",
            reportType: "213",
            requestedDays: 30,
            reason: "รอข้อมูล GPS จากผู้ให้บริการ",
            status: "APPROVED",
            sequence: 1,
            authorityTier: "DIRECTOR_HEAD",
            requestedAt: "2026-06-15T10:00:00+07:00",
            decidedAt: "2026-06-17T14:00:00+07:00",
            decidedBy: "วิโรจน์ ผู้อำนวยการเขต 1"
          },
          {
            id: "ext-0004-2",
            reportType: "213",
            requestedDays: 60,
            reason: "ยังรอหนังสือรับรองข้อมูล GPS และถ้อยคำผู้ควบคุมรถ",
            status: "PENDING",
            sequence: 2,
            authorityTier: "EXECUTIVE",
            requestedAt: "2026-07-15T09:30:00+07:00",
            requestedBy: "ปวีณา พนักงาน ป.ป.ท.",
            decidedAt: "",
            decidedBy: ""
          }
        ],
        reviewerNote: "แนบหนังสือรับรองข้อมูล GPS ก่อนส่งตรวจอีกครั้ง"
      }
    }),
    baseCase({
      id: "สส-2569-0005",
      title: "ร้องเรียนเอื้อประโยชน์ในการกำหนดขอบเขตงาน",
      agency: "องค์การมหาชนตัวอย่าง",
      receivedAt: "2026-04-15",
      phase: "WAIT_A7_213",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "ชุดแสวงหาข้อเท็จจริง 1",
        investigator: "ปวีณา พนักงาน ป.ป.ท."
      },
      plan: {
        status: "APPROVED",
        objective: "ตรวจความสัมพันธ์และที่มาของเงื่อนไขการจัดซื้อ",
        issues: makeIssues(["ตรวจร่างขอบเขตงาน", "ตรวจคณะกรรมการ", "ตรวจผลต่อการแข่งขัน", "ตรวจหลักฐานการติดต่อ"])
      },
      report213: {
        status: "LOCKED",
        summary: "ข้อเท็จจริงมีมูลเพียงพอให้เสนอรับไว้ดำเนินการ",
        recommendation: "เสนอรับไว้ดำเนินการไต่สวนข้อเท็จจริง",
        startedAt: "2026-04-20",
        deadlineAt: "2026-06-18"
      },
      integration: {
        status: "ACKED",
        reportType: "213",
        messageId: "OUT-213-2569-018",
        decision: "",
        decisionLabel: ""
      },
      handoff: {
        status: "AWAITING_EXTERNAL",
        target: "คณะกรรมการ ป.ป.ท.",
        note: "รอผลพิจารณารายงาน 213"
      }
    }),
    baseCase({
      id: "สส-2569-0006",
      title: "ร้องเรียนทุจริตเงินช่วยเหลือผู้ประสบภัย",
      agency: "สำนักงานป้องกันภัยจังหวัดตัวอย่าง",
      receivedAt: "2026-01-10",
      phase: "INQUIRY",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "คณะพนักงานไต่สวน 3",
        investigator: "ธนกร พนักงานไต่สวน"
      },
      plan: {
        status: "APPROVED",
        objective: "ตรวจสิทธิผู้รับเงินและเส้นทางการเบิกจ่าย",
        issues: makeIssues(["ตรวจบัญชีผู้มีสิทธิ", "ตรวจผู้อนุมัติ", "คำนวณความเสียหาย", "ตรวจบัญชีธนาคารและพยานบุคคล"])
      },
      report213: {
        status: "LOCKED",
        summary: "ผลเบื้องต้นมีมูลให้รับไว้ดำเนินการ",
        recommendation: "รับไว้ไต่สวนข้อเท็จจริง",
        startedAt: "2026-01-15",
        deadlineAt: "2026-03-15"
      },
      integration: {
        status: "DECISION_RECEIVED",
        reportType: "213",
        messageId: "IN-213-2569-041",
        decision: "ACCEPT_EMPLOYEE_PANEL",
        decisionLabel: "รับไว้ดำเนินการโดยคณะพนักงาน ป.ป.ท."
      },
      report644: {
        status: "DRAFT",
        appointmentType: "คณะพนักงานไต่สวน",
        signatory: "เลขาธิการคณะกรรมการ ป.ป.ท.",
        orderNo: "คำสั่ง 118/2569",
        orderDate: "2026-03-20",
        appointmentMeetingDate: "",
        planSummary: "ตรวจผู้รับเงิน 46 ราย เอกสารอนุมัติ และบัญชีรับโอน",
        evidenceSummary: "รวบรวมบัญชีธนาคารแล้ว 31 ราย",
        allegationNotice: "แจ้งข้อกล่าวหาแล้ว 1 ราย อีก 2 รายอยู่ระหว่างนัดหมาย",
        response: "ผู้ถูกกล่าวหาคนที่ 1 ส่งคำชี้แจงแล้ว",
        allegationProcess: seededAllegationProcess("สส-2569-0006", ["ผู้ถูกกล่าวหารายที่ 1", "ผู้ถูกกล่าวหารายที่ 2", "ผู้ถูกกล่าวหารายที่ 3"], { completeCount: 1, noticeDate: "2026-06-15" }),
        summary: "อยู่ระหว่างตรวจเส้นทางการเงินส่วนที่เหลือ",
        recommendation: "",
        startedAt: "2026-03-20",
        deadlineAt: addDays("2026-03-20", 270)
      },
      handoff: {
        status: "ACKNOWLEDGED",
        target: "คณะพนักงานไต่สวน 3",
        note: "รับสำนวนและบัญชีเอกสารครบแล้ว"
      }
    }),
    baseCase({
      id: "สส-2569-0007",
      title: "ร้องเรียนเปลี่ยนแปลงผลตรวจรับงานก่อสร้าง",
      agency: "เทศบาลเมืองตัวอย่าง",
      receivedAt: "2025-11-15",
      phase: "INQUIRY",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "คณะอนุกรรมการไต่สวน 2",
        investigator: "ธนกร พนักงานไต่สวน"
      },
      report213: {
        status: "LOCKED",
        summary: "พบข้อขัดแย้งระหว่างรายงานตรวจรับกับสภาพงานจริง",
        recommendation: "รับไว้ไต่สวนข้อเท็จจริง",
        startedAt: "2025-11-20",
        deadlineAt: "2026-01-18"
      },
      report644: {
        status: "RETURNED",
        appointmentType: "คณะอนุกรรมการไต่สวน",
        signatory: "ประธานกรรมการ ป.ป.ท.",
        orderNo: "คำสั่ง 52/2569",
        orderDate: "2026-01-12",
        appointmentMeetingDate: "2026-01-10",
        planSummary: "ตรวจแบบก่อสร้าง รายงานควบคุมงาน และการเบิกจ่าย",
        evidenceSummary: "มีเอกสารตรวจรับ ภาพถ่าย และผลทดสอบวัสดุ",
        allegationNotice: "แจ้งข้อกล่าวหาครบ 3 ราย",
        response: "ได้รับคำชี้แจงครบ 3 ราย",
        allegationProcess: seededAllegationProcess("สส-2569-0007", ["ผู้ถูกกล่าวหารายที่ 1", "ผู้ถูกกล่าวหารายที่ 2", "ผู้ถูกกล่าวหารายที่ 3"], { noticeDate: "2026-05-20" }),
        summary: "พบการรับรองงานบางส่วนไม่ตรงกับผลทดสอบ",
        recommendation: "เสนอชี้มูลตามพยานหลักฐาน",
        startedAt: "2026-01-10",
        deadlineAt: addDays("2026-01-10", 270),
        reviewerNote: "ชี้แจงน้ำหนักพยานผู้ควบคุมงานและผลทดสอบวัสดุเพิ่มเติม"
      }
    }),
    baseCase({
      id: "สส-2569-0008",
      title: "ร้องเรียนฮั้วประมูลโครงการปรับปรุงระบบประปา",
      agency: "การประปาท้องถิ่นตัวอย่าง",
      receivedAt: "2025-08-20",
      phase: "WAIT_A7_644",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "คณะอนุกรรมการไต่สวน 1",
        investigator: "ธนกร พนักงานไต่สวน"
      },
      report213: {
        status: "LOCKED",
        summary: "พบแบบแผนการเสนอราคาที่มีความเชื่อมโยงกัน",
        recommendation: "รับไว้ไต่สวนข้อเท็จจริง",
        startedAt: "2025-08-25",
        deadlineAt: "2025-10-23"
      },
      report644: {
        status: "LOCKED",
        appointmentType: "คณะอนุกรรมการไต่สวน",
        signatory: "ประธานกรรมการ ป.ป.ท.",
        orderNo: "คำสั่ง 201/2568",
        orderDate: "2025-11-01",
        appointmentMeetingDate: "2025-10-30",
        planSummary: "ตรวจข้อเสนอราคา ผู้ถือหุ้น และธุรกรรมระหว่างผู้เสนอราคา",
        evidenceSummary: "เอกสารและข้อมูลธุรกรรมครบตามแผน",
        allegationNotice: "แจ้งข้อกล่าวหาครบทุกฝ่าย",
        response: "บันทึกคำชี้แจงและพยานหักล้างครบแล้ว",
        allegationProcess: seededAllegationProcess("สส-2569-0008", ["ผู้ถูกกล่าวหารายที่ 1", "ผู้ถูกกล่าวหารายที่ 2"], { noticeDate: "2026-03-10" }),
        summary: "สรุปข้อเท็จจริงและความเห็นแล้ว",
        recommendation: "เสนอพิจารณาตามพยานหลักฐาน",
        startedAt: "2025-10-30",
        deadlineAt: addDays("2025-10-30", 270)
      },
      integration: {
        status: "SENT",
        reportType: "644",
        messageId: "OUT-644-2569-009",
        decision: "",
        decisionLabel: ""
      },
      handoff: {
        status: "AWAITING_EXTERNAL",
        target: "คณะกรรมการ ป.ป.ท.",
        note: "ส่งรายงาน 644 แล้ว รอการตอบรับ"
      }
    }),
    baseCase({
      id: "สส-2569-0009",
      title: "ร้องเรียนอนุมัติเบิกจ่ายโดยไม่มีผลงานจริง",
      agency: "กรมพัฒนาพื้นที่ตัวอย่าง",
      receivedAt: "2025-05-12",
      phase: "POST_DECISION",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "คณะพนักงานไต่สวน 1",
        investigator: "ธนกร พนักงานไต่สวน"
      },
      report213: {
        status: "LOCKED",
        summary: "พบมูลการเบิกจ่ายโดยไม่มีผลงานรองรับ",
        recommendation: "รับไว้ไต่สวนข้อเท็จจริง"
      },
      report644: {
        status: "LOCKED",
        appointmentType: "คณะพนักงานไต่สวน",
        signatory: "เลขาธิการคณะกรรมการ ป.ป.ท.",
        orderNo: "คำสั่ง 145/2568",
        orderDate: "2025-08-01",
        appointmentMeetingDate: "",
        planSummary: "ตรวจสัญญา ผลงาน และการอนุมัติเบิกจ่าย",
        evidenceSummary: "รวบรวมครบตามประเด็น",
        allegationNotice: "แจ้งข้อกล่าวหาครบ",
        response: "ได้รับคำชี้แจงครบ",
        allegationProcess: seededAllegationProcess("สส-2569-0009", ["ผู้ถูกกล่าวหารายที่ 1"], { noticeDate: "2026-01-15" }),
        summary: "สรุปว่ามีการรับรองผลงานที่ยังไม่เกิดขึ้น",
        recommendation: "เสนอส่งดำเนินคดีและแจ้งต้นสังกัด",
        startedAt: "2025-08-01",
        deadlineAt: addDays("2025-08-01", 270)
      },
      integration: {
        status: "DECISION_RECEIVED",
        reportType: "644",
        messageId: "IN-644-2569-006",
        decision: "SUBSTANTIATE_CORRUPTION",
        decisionLabel: "ชี้มูลความผิดทางอาญาและ/หรือวินัย กรณีทุจริตต่อหน้าที่"
      },
      handoff: {
        status: "PARTIAL",
        target: "หลายหน่วยงาน",
        note: "พนักงานอัยการรับแล้ว หน่วยงานต้นสังกัดยังส่งไม่สำเร็จ",
        deliveries: [
          { target: "PROSECUTOR", route: "PROSECUTOR", label: "สำนักงานคดีปราบปรามการทุจริต", status: "SENT", reference: "อส-2569-114", outgoingLetterNo: "อส-2569-114", dispatchedAt: "2026-07-29", dispatchedBy: "ธนกร พนักงานไต่สวน", attempts: [{ sequence: 1, at: "2026-07-29T10:00:00+07:00", status: "SENT" }] },
          {
            target: "PARENT_AGENCY",
            label: "หน่วยงานต้นสังกัด",
            route: "DISCIPLINARY",
            status: "FAILED",
            dispatchStatus: "FAILED",
            outgoingLetterNo: "สบ-2569-337",
            reference: "",
            lastError: "การส่งหนังสือไปยังปลายทางไม่สำเร็จ",
            attempts: [{ sequence: 1, at: "2026-07-30T11:15:00+07:00", status: "FAILED" }]
          }
        ]
      },
      registry: {
        status: "PARTIAL",
        dispatchNo: "สบ-2569-337",
        dispatchedAt: "2026-07-30",
        acknowledgmentNo: "อส-2569-114",
        acknowledgedAt: "2026-08-01"
      }
    }),
    baseCase({
      id: "สส-2569-0010",
      title: "ร้องเรียนรับรองเอกสารเพื่อเอื้อประโยชน์แก่เอกชน",
      agency: "สำนักงานสาขาตัวอย่าง",
      receivedAt: "2025-02-03",
      phase: "CLOSED",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "คณะพนักงานไต่สวน 4",
        investigator: "ธนกร พนักงานไต่สวน"
      },
      report213: {
        status: "LOCKED",
        summary: "พบเหตุให้รับไว้ดำเนินการ",
        recommendation: "รับไว้ไต่สวนข้อเท็จจริง"
      },
      report644: {
        status: "LOCKED",
        appointmentType: "คณะพนักงานไต่สวน",
        signatory: "เลขาธิการคณะกรรมการ ป.ป.ท.",
        orderNo: "คำสั่ง 88/2568",
        orderDate: "2025-04-10",
        appointmentMeetingDate: "",
        planSummary: "ตรวจเอกสารรับรองและผู้ใช้ประโยชน์",
        evidenceSummary: "หลักฐานครบถ้วน",
        allegationNotice: "แจ้งข้อกล่าวหาครบ",
        response: "ได้รับคำชี้แจงครบ",
        allegationProcess: seededAllegationProcess("สส-2569-0010", ["ผู้ถูกกล่าวหารายที่ 1"], { noticeDate: "2025-09-01" }),
        summary: "ดำเนินการเสร็จสิ้นตามมติ",
        recommendation: "ปิดสำนวนหลังส่งต่อครบถ้วน",
        startedAt: "2025-04-10",
        deadlineAt: addDays("2025-04-10", 270)
      },
      integration: {
        status: "DECISION_RECEIVED",
        reportType: "644",
        messageId: "IN-644-2569-002",
        decision: "SUBSTANTIATE_SERIOUS_DISCIPLINE",
        decisionLabel: "ชี้มูลความผิดวินัยร้ายแรง"
      },
      handoff: {
        status: "CLOSED",
        target: "หน่วยงานต้นสังกัด",
        note: "ปลายทางตอบรับครบถ้วน",
        deliveries: [
          { target: "PARENT_AGENCY", label: "หน่วยงานต้นสังกัด", status: "ACKNOWLEDGED", reference: "ตส-2569-088" }
        ]
      },
      registry: {
        status: "ACKNOWLEDGED",
        dispatchNo: "สบ-2569-201",
        dispatchedAt: "2026-06-20",
        acknowledgmentNo: "ตส-2569-088",
        acknowledgedAt: "2026-06-25"
      }
    }),
    baseCase({
      id: "สส-2569-0011",
      title: "ร้องเรียนแก้ไขคะแนนคัดเลือกผู้รับจ้างหลังปิดรับข้อเสนอ",
      agency: "สถาบันการศึกษาตัวอย่าง",
      receivedAt: "2026-05-25",
      phase: "PRELIMINARY",
      assignment: {
        state: "ACKNOWLEDGED",
        team: "ชุดแสวงหาข้อเท็จจริง 3",
        investigator: "ปวีณา พนักงาน ป.ป.ท."
      },
      plan: {
        status: "APPROVED",
        objective: "ตรวจลำดับการให้คะแนนและสิทธิแก้ไขข้อมูลหลังปิดรับข้อเสนอ",
        issues: makeIssues([
          "ตรวจบันทึกคะแนนทุกฉบับ",
          "ตรวจอำนาจของคณะกรรมการ",
          "เปรียบเทียบผลก่อนและหลังแก้ไข",
          "ตรวจประวัติระบบและคำชี้แจงผู้เกี่ยวข้อง"
        ])
      },
      report213: {
        status: "SUBMITTED",
        summary: "พบการแก้ไขคะแนนหลังปิดรับข้อเสนอโดยไม่มีบันทึกเหตุผลในระบบ",
        recommendation: "เสนอหัวหน้าพนักงาน ป.ป.ท. ระดับผู้อำนวยการตรวจความครบถ้วนก่อนเสนอคณะกรรมการ ป.ป.ท.",
        startedAt: "2026-05-29",
        deadlineAt: "2026-07-27",
        extensionHistory: [
          {
            id: "ext-0011-1",
            reportType: "213",
            requestedDays: 30,
            reason: "รอต้นฉบับประวัติการแก้ไขคะแนนจากผู้ดูแลระบบ",
            status: "WITHDRAWN",
            sequence: 1,
            authorityTier: "DIRECTOR_HEAD",
            requestedAt: "2026-07-10T11:20:00+07:00",
            requestedBy: "ปวีณา พนักงาน ป.ป.ท.",
            decidedAt: "",
            decidedBy: "",
            withdrawnAt: "2026-08-02",
            withdrawnBy: "ปวีณา พนักงาน ป.ป.ท.",
            withdrawalReason: "รายงานแล้วเสร็จและเสนอผู้ตรวจแล้ว"
          }
        ]
      }
    })
  ];
}

function seededNotifications(cases) {
  return cases.flatMap((item) => {
    if (item.phase !== "PRELIMINARY" || !["DRAFT", "RETURNED"].includes(item.report213.status)) return [];
    const lead = item.assignment.assignees?.find((entry) => entry.assignmentRole === "LEAD");
    if (!lead?.account || !item.report213.startedAt) return [];
    return [15, 30, 45].map((elapsedDays) => {
      const dueAt = addDays(item.report213.startedAt, elapsedDays);
      return {
        id: `notice-${item.id}-213-0-${elapsedDays}`,
        caseId: item.id,
        reportType: "213",
        extensionRound: 0,
        elapsedDays,
        dueAt,
        recipientAccount: lead.account,
        recipientName: lead.name,
        status: dueAt <= DEMO_DATE ? "DUE" : "SCHEDULED",
        readAt: ""
      };
    });
  });
}

function specialMatter(overrides) {
  const receivedAt = overrides.receivedAt || "2026-07-01";
  const base = {
    id: overrides.id,
    referenceNo: overrides.referenceNo,
    type: "ARTICLE_58_2",
    title: "",
    complainant: "ผู้ร้องเรียนปกปิดชื่อ",
    affectedAgency: "หน่วยงานของรัฐ",
    owningUnit: "สำนักงาน ป.ป.ท. เขต 1",
    receivedAt,
    status: "PENDING_CLERK_REVIEW",
    version: 1,
    intake: {
      decision: "PENDING",
      checkedAt: "",
      checkedBy: "",
      checkNote: "",
      returnReason: ""
    },
    assignment: {
      officerName: "",
      officerAccount: "",
      assignedAt: "",
      assignedBy: "",
      acknowledgedAt: ""
    },
    report: {
      status: "DRAFT",
      factSummary: "",
      evidenceReferences: "",
      hardshipImpact: "",
      projectValueIssue: "",
      recommendedAction: "",
      submittedAt: "",
      submittedBy: "",
      directorOpinion: "",
      directorReviewedAt: "",
      executiveOpinion: "",
      executiveReviewedAt: "",
      secretaryOutcome: "",
      secretaryOpinion: "",
      secretaryDecidedAt: ""
    },
    notification: {
      targetType: "",
      targetName: "",
      letterNo: "",
      sentAt: "",
      sentBy: "",
      deliveryReference: "",
      agencyResponse: "",
      agencyResponseDate: "",
      agencyResponseReference: "",
      publicNoticeDate: "",
      publicNoticeReference: ""
    },
    audit: [initialAudit(overrides.id, "ระบบรับเรื่อง", "SPECIAL_MATTER_RECEIVED", "รับเรื่องร้องเรียนเพื่อเข้าสู่การตรวจสอบข้อเท็จจริง", 1, `${receivedAt}T09:00:00+07:00`)]
  };
  return {
    ...base,
    ...overrides,
    intake: { ...base.intake, ...(overrides.intake || {}) },
    assignment: { ...base.assignment, ...(overrides.assignment || {}) },
    report: { ...base.report, ...(overrides.report || {}) },
    notification: { ...base.notification, ...(overrides.notification || {}) }
  };
}

function seededSpecialMatters() {
  return [
    specialMatter({
      id: "special-58-2-001",
      referenceNo: "เลขรับเรื่อง ศรร. 158/2569",
      type: "ARTICLE_58_2",
      title: "ร้องเรียนขั้นตอนการอนุญาตที่สร้างความเดือดร้อนแก่ประชาชน",
      affectedAgency: "สำนักงานบริการประชาชนจังหวัดตัวอย่าง",
      receivedAt: "2026-08-01"
    }),
    specialMatter({
      id: "special-58-3-002",
      referenceNo: "เลขรับเรื่อง ศรร. 149/2569",
      type: "ARTICLE_58_3",
      title: "ร้องเรียนโครงการกำหนดวงเงินสูงเกินจริงและไม่คุ้มค่า",
      affectedAgency: "องค์การบริหารส่วนจังหวัดตัวอย่าง",
      receivedAt: "2026-07-28",
      status: "PENDING_DIRECTOR_ASSIGNMENT",
      intake: {
        decision: "FORWARDED",
        checkedAt: "2026-07-29T09:00:00+07:00",
        checkedBy: "อรอนงค์ งานคดี",
        checkNote: "ตรวจข้อมูลผู้ร้อง หน่วยงาน และรายละเอียดโครงการครบถ้วน"
      }
    }),
    specialMatter({
      id: "special-58-2-003",
      referenceNo: "เลขรับเรื่อง ศรร. 131/2569",
      type: "ARTICLE_58_2",
      title: "ร้องเรียนหน่วยงานเรียกเอกสารเกินกว่าที่ประกาศไว้",
      affectedAgency: "สำนักงานทะเบียนจังหวัดตัวอย่าง",
      receivedAt: "2026-07-12",
      status: "FACT_FINDING",
      intake: {
        decision: "FORWARDED",
        checkedAt: "2026-07-13T09:00:00+07:00",
        checkedBy: "อรอนงค์ งานคดี",
        checkNote: "ตรวจข้อมูลผู้ร้อง เหตุความเดือดร้อน และหน่วยงานที่เกี่ยวข้องครบถ้วน"
      },
      assignment: {
        officerName: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        officerAccount: "special.a5",
        assignedAt: "2026-07-13T10:00:00+07:00",
        assignedBy: "สมชาย ผู้อำนวยการ",
        acknowledgedAt: "2026-07-13T11:00:00+07:00"
      },
      report: {
        factSummary: "ตรวจประกาศขั้นตอนบริการและรายการเอกสารที่เจ้าหน้าที่เรียกเพิ่มเติม",
        evidenceReferences: "ประกาศขั้นตอนบริการ ฉบับลงวันที่ 3 มกราคม 2569; บันทึกถ้อยคำผู้ร้อง",
        hardshipImpact: "ผู้ร้องต้องเดินทางกลับมายื่นเอกสารหลายครั้งและไม่สามารถรับบริการได้ตามกำหนด",
        recommendedAction: "เสนอให้หัวหน้าหน่วยงานตรวจสอบและแก้ไขขั้นตอนบริการ"
      }
    }),
    specialMatter({
      id: "special-58-3-004",
      referenceNo: "เลขรับเรื่อง ศรร. 097/2569",
      type: "ARTICLE_58_3",
      title: "ร้องเรียนโครงการปรับปรุงอาคารที่กำหนดวงเงินไม่สอดคล้องกับเนื้องาน",
      affectedAgency: "กรมอาคารสาธารณะตัวอย่าง",
      receivedAt: "2026-06-20",
      status: "AWAITING_SECRETARY",
      intake: {
        decision: "FORWARDED",
        checkedAt: "2026-06-21T09:00:00+07:00",
        checkedBy: "อรอนงค์ งานคดี",
        checkNote: "ตรวจข้อมูลโครงการ หน่วยงาน และประเด็นวงเงินหรือความคุ้มค่าครบถ้วน"
      },
      assignment: {
        officerName: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        officerAccount: "special.a5",
        assignedAt: "2026-06-22T10:00:00+07:00",
        assignedBy: "สมชาย ผู้อำนวยการ",
        acknowledgedAt: "2026-06-22T11:00:00+07:00"
      },
      report: {
        status: "AWAITING_SECRETARY",
        factSummary: "ตรวจแบบประมาณราคา ขอบเขตงาน และราคากลางของโครงการแล้ว",
        evidenceReferences: "แบบประมาณราคา 1–5; ราคากลาง; ขอบเขตงาน",
        projectValueIssue: "วงเงินบางรายการไม่สอดคล้องกับปริมาณงานตามแบบ",
        recommendedAction: "เสนอแจ้งสำนักงานการตรวจเงินแผ่นดินดำเนินการตามอำนาจหน้าที่",
        submittedAt: "2026-07-05T09:00:00+07:00",
        submittedBy: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        directorOpinion: "ตรวจรายงานและพยานหลักฐานแล้ว เห็นควรเสนอผู้ช่วยหรือรองเลขาธิการฯ ที่กำกับ",
        directorReviewedAt: "2026-07-08T10:00:00+07:00",
        executiveOpinion: "เห็นควรเสนอเลขาธิการฯ พิจารณา",
        executiveReviewedAt: "2026-07-12T10:00:00+07:00"
      }
    }),
    specialMatter({
      id: "special-58-2-005",
      referenceNo: "เลขรับเรื่อง ศรร. 061/2569",
      type: "ARTICLE_58_2",
      title: "ร้องเรียนความล่าช้าในการให้บริการประชาชนโดยไม่มีเหตุผล",
      affectedAgency: "สำนักงานอนุญาตจังหวัดตัวอย่าง",
      receivedAt: "2026-05-10",
      status: "AWAITING_AGENCY_ACTION",
      intake: {
        decision: "FORWARDED",
        checkedAt: "2026-05-11T09:00:00+07:00",
        checkedBy: "อรอนงค์ งานคดี",
        checkNote: "ตรวจข้อมูลผู้ร้อง เหตุความเดือดร้อน และหน่วยงานที่เกี่ยวข้องครบถ้วน"
      },
      assignment: {
        officerName: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        officerAccount: "special.a5",
        assignedAt: "2026-05-12T10:00:00+07:00",
        assignedBy: "สมชาย ผู้อำนวยการ",
        acknowledgedAt: "2026-05-12T11:00:00+07:00"
      },
      report: {
        status: "SECRETARY_DECIDED",
        factSummary: "ตรวจพบว่าการดำเนินการล่าช้ากว่าขั้นตอนที่หน่วยงานประกาศไว้",
        evidenceReferences: "คำขอรับบริการ; ประกาศขั้นตอน; บันทึกถ้อยคำเจ้าหน้าที่",
        hardshipImpact: "ประชาชนไม่สามารถใช้สิทธิต่อเนื่องจากบริการดังกล่าวได้",
        recommendedAction: "แจ้งหัวหน้าหน่วยงานของรัฐแก้ไขปัญหาความเดือดร้อน",
        secretaryOutcome: "NOTIFY_STATE_AGENCY",
        secretaryOpinion: "แจ้งหัวหน้าหน่วยงานแก้ไขและติดตามผล",
        secretaryDecidedAt: "2026-06-10T10:00:00+07:00"
      },
      notification: {
        targetType: "STATE_AGENCY_HEAD",
        targetName: "หัวหน้าสำนักงานอนุญาตจังหวัดตัวอย่าง",
        letterNo: "ปปท 001/2569",
        sentAt: "2026-06-12",
        sentBy: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        deliveryReference: "หลักฐานรับหนังสือ 001/2569"
      }
    }),
    specialMatter({
      id: "special-corruption-006",
      referenceNo: "เลขรับเรื่อง ศรร. 044/2569",
      type: "ARTICLE_58_3",
      title: "เรื่องที่ตรวจพบภายหลังว่ามีพฤติการณ์ทุจริต",
      affectedAgency: "หน่วยงานโครงการตัวอย่าง",
      receivedAt: "2026-04-18",
      status: "READY_TO_NOTIFY",
      intake: {
        decision: "FORWARDED",
        checkedAt: "2026-04-19T09:00:00+07:00",
        checkedBy: "อรอนงค์ งานคดี",
        checkNote: "ตรวจข้อมูลโครงการและหน่วยงานที่เกี่ยวข้องครบถ้วน"
      },
      assignment: {
        officerName: "วรพล เจ้าหน้าที่ตรวจสอบข้อเท็จจริง",
        officerAccount: "special.a5",
        assignedAt: "2026-04-20T10:00:00+07:00",
        assignedBy: "สมชาย ผู้อำนวยการ",
        acknowledgedAt: "2026-04-20T11:00:00+07:00"
      },
      report: {
        status: "SECRETARY_DECIDED",
        factSummary: "ระหว่างตรวจสอบพบพยานหลักฐานเกี่ยวกับการเรียกรับผลประโยชน์",
        evidenceReferences: "บันทึกถ้อยคำ; เอกสารการโอนเงิน",
        projectValueIssue: "ประเด็นที่พบไม่ใช่เพียงความไม่คุ้มค่าของโครงการ",
        recommendedAction: "ส่งเรื่องให้สำนักงาน ป.ป.ช.",
        secretaryOutcome: "REFER_NACC",
        secretaryOpinion: "ให้ส่งเรื่องและรายงานไปยังสำนักงาน ป.ป.ช.",
        secretaryDecidedAt: "2026-07-20T10:00:00+07:00"
      },
      notification: {
        targetType: "NACC",
        targetName: "สำนักงาน ป.ป.ช."
      }
    })
  ];
}

export function createInitialState() {
  const cases = seededCases();
  return {
    schemaVersion: 4,
    demoDate: DEMO_DATE,
    eventCounter: 48,
    session: null,
    preferences: {
      fontScale: 0,
      highContrast: false
    },
    globalAudit: [],
    notifications: seededNotifications(cases),
    specialMatters: seededSpecialMatters(),
    cases
  };
}

export function getResultOptions(reportType) {
  return reportType === "644" ? RESULT_OPTIONS_644 : RESULT_OPTIONS_213;
}

export function getResultLabel(value, reportType) {
  return getResultOptions(reportType).find((item) => item.value === value)?.label || "ผลการพิจารณาอื่นที่ต้องตรวจสอบ";
}

export function getTargetLabel(value) {
  return EXTERNAL_TARGETS.find((item) => item.value === value)?.label || value;
}

export function getAllowedTargets(reportType, decision) {
  const targetValues = reportType === "213"
    ? {
        NOT_ACCEPT_TRANSFER_NACC: ["NACC"],
        NOT_ACCEPT_OTHER_AGENCY: ["OTHER"],
        NOT_ACCEPT_TERMINATE: []
      }[decision]
    : {
        SUBSTANTIATE_CORRUPTION: ["PROSECUTOR", "PARENT_AGENCY"],
        SUBSTANTIATE_MISCONDUCT: ["PROSECUTOR", "PARENT_AGENCY"],
        SUBSTANTIATE_SERIOUS_DISCIPLINE: ["PARENT_AGENCY"],
        ALLEGATION_UNFOUNDED: ["ACCUSED"]
      }[decision];
  return (targetValues || []).map((value) => EXTERNAL_TARGETS.find((target) => target.value === value));
}
