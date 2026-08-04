import assert from "node:assert/strict";

class LocalStorageMock {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.localStorage = new LocalStorageMock();

const {
  ACCOUNTS,
  INVESTIGATOR_DIRECTORY,
  TRANSFER_TARGETS,
  createInitialState
} = await import("../assets/mock-data.js");
const stateApi = await import("../assets/state.js");
const {
  AppError,
  authenticate,
  canReadCase,
  canReadSpecialMatter,
  executeCommand,
  getState,
  logout,
  markNotificationRead,
  recordRouteFailure,
  resetDemo
} = stateApi;

function login(username, password) {
  if (getState().session) logout();
  return authenticate(username, password);
}

function freshAs(username, password) {
  login(username, password);
  resetDemo();
}

function currentCase(caseId) {
  return getState().cases.find((item) => item.id === caseId);
}

function currentSpecialMatter(matterId) {
  return getState().specialMatters.find((item) => item.id === matterId);
}

function command(name, caseId, payload = {}) {
  const item = currentCase(caseId) || currentSpecialMatter(caseId);
  return executeCommand(name, caseId, { expectedVersion: item.version, ...payload });
}

function expectError(status, messagePart, callback) {
  let caught;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof AppError, "expected AppError");
  assert.equal(caught.status, status);
  assert.match(caught.message, new RegExp(messagePart));
}

const meeting = {
  meetingDate: "2026-08-02",
  meetingNo: "18/2569",
  meetingNote: "บันทึกผลตามระเบียบวาระ"
};

function plusDays(value, days) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days));
  return date.toISOString().slice(0, 10);
}

const initialState = createInitialState();
assert.ok(initialState.specialMatters.length > 0);
assert.ok(initialState.specialMatters.every((matter) => !Object.hasOwn(matter, "report213") && !Object.hasOwn(matter, "report644") && !Object.hasOwn(matter, "phase")), "58/2 and 58/3 matters must not reuse ordinary case records");
for (const matter of initialState.specialMatters) {
  const expectedDecision = matter.status === "PENDING_CLERK_REVIEW" ? "PENDING" : matter.status === "RETURNED_TO_COMPLAINT_CENTER" ? "RETURNED" : "FORWARDED";
  assert.equal(matter.intake.decision, expectedDecision, `${matter.id} has inconsistent special-matter intake decision`);
  if (expectedDecision === "FORWARDED") {
    assert.ok(matter.intake.checkedAt, `${matter.id} must record intake review time before later work`);
    assert.ok(matter.intake.checkedBy, `${matter.id} must record intake reviewer before later work`);
    assert.ok(matter.intake.checkNote, `${matter.id} must record intake review note before later work`);
  }
}
for (const caseItem of initialState.cases) {
  const firstAppearanceAt = caseItem.firstAppearanceAt || caseItem.receivedAt;
  assert.equal(caseItem.report213.startedAt, firstAppearanceAt, `${caseItem.id} must start 213 at first appearance`);
  const expectedDeadline = caseItem.report213.extensionHistory
    .filter((entry) => entry.status === "APPROVED")
    .reduce((deadline, entry) => plusDays(deadline, entry.requestedDays), plusDays(firstAppearanceAt, 60));
  assert.equal(caseItem.report213.deadlineAt, expectedDeadline, `${caseItem.id} has inconsistent 213 deadline`);
  if (caseItem.report644.orderNo && ["INQUIRY", "WAIT_A7_644", "POST_DECISION", "CLOSED"].includes(caseItem.phase)) {
    const subcommittee = caseItem.report644.appointmentType === "คณะอนุกรรมการไต่สวน";
    assert.equal(caseItem.report644.signatory, subcommittee ? "ประธานกรรมการ ป.ป.ท." : "เลขาธิการคณะกรรมการ ป.ป.ท.", `${caseItem.id} has inconsistent appointment signatory`);
    if (subcommittee) {
      assert.ok(caseItem.report644.appointmentMeetingDate, `${caseItem.id} must record the subcommittee appointment meeting date`);
      assert.ok(caseItem.report644.orderDate >= caseItem.report644.appointmentMeetingDate, `${caseItem.id} order date must not precede the appointment meeting`);
      assert.equal(caseItem.report644.startedAt, caseItem.report644.appointmentMeetingDate, `${caseItem.id} must start 644 at the appointment meeting`);
    } else {
      assert.equal(caseItem.report644.appointmentMeetingDate, "", `${caseItem.id} employee-panel case must not carry a subcommittee meeting date`);
      assert.equal(caseItem.report644.startedAt, caseItem.report644.orderDate, `${caseItem.id} must start 644 at the employee-panel order date`);
    }
    const expected644Deadline = caseItem.report644.extensionHistory
      .filter((entry) => entry.status === "APPROVED")
      .reduce((deadline, entry) => plusDays(deadline, entry.requestedDays), plusDays(caseItem.report644.startedAt, 270));
    assert.equal(caseItem.report644.deadlineAt, expected644Deadline, `${caseItem.id} has inconsistent 644 deadline`);
  }
}
assert.equal(initialState.notifications.some((entry) => entry.caseId === "สส-2569-0011"), false, "submitted 213 must not seed actionable alerts");

for (const account of ACCOUNTS) {
  if (getState().session) logout();
  assert.equal(authenticate(account.username, account.password).role, account.role);
}
logout();
assert.equal(ACCOUNTS.some((entry) => entry.role === "REGISTRY"), false, "generic registry actor must not dispatch all post-decision routes");
assert.ok(ACCOUNTS.some((entry) => entry.role === "CASE_TRACKING"));
assert.ok(ACCOUNTS.some((entry) => entry.role === "DECISION_AFFAIRS"));

for (const target of TRANSFER_TARGETS) {
  const unit = target.value;
  assert.ok(ACCOUNTS.some((entry) => entry.role === "CLERK" && entry.allowedOwningUnits?.includes(unit)), `${unit} missing clerk`);
  assert.ok(ACCOUNTS.some((entry) => entry.role === "DIRECTOR" && entry.allowedOwningUnits?.includes(unit)), `${unit} missing director`);
  assert.ok(INVESTIGATOR_DIRECTORY.filter((entry) => entry.workType === "PRELIM" && entry.units.includes(unit)).length >= 2, `${unit} missing prelim workers`);
  assert.ok(INVESTIGATOR_DIRECTORY.filter((entry) => entry.workType === "INQUIRY" && entry.units.includes(unit)).length >= 2, `${unit} missing inquiry workers`);
}

localStorage.setItem("activity5-mockup-state-v4", JSON.stringify({ schemaVersion: 3, cases: [{ id: "LEGACY" }] }));
const legacyApi = await import(`../assets/state.js?legacy=${Date.now()}`);
assert.equal(legacyApi.getState().schemaVersion, 4);
assert.equal(legacyApi.getState().cases.some((entry) => entry.id === "LEGACY"), false);
localStorage.clear();

const validOldState = createInitialState();
delete validOldState.specialMatters;
validOldState.cases[0].factcheck = { required: true, result: "รอตรวจสอบ" };
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(validOldState));
const migratedApi = await import(`../assets/state.js?special-migration=${Date.now()}`);
assert.ok(migratedApi.getState().specialMatters.length > 0);
assert.equal(migratedApi.getState().cases.some((entry) => Object.hasOwn(entry, "factcheck")), false);
localStorage.clear();

const invalidSpecialState = createInitialState();
const invalidSpecialMatter = invalidSpecialState.specialMatters.find((matter) => matter.id === "special-58-3-002");
invalidSpecialMatter.intake.decision = "PENDING";
invalidSpecialMatter.intake.checkedAt = "";
invalidSpecialMatter.intake.checkedBy = "";
invalidSpecialMatter.intake.checkNote = "";
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(invalidSpecialState));
const guardedSpecialApi = await import(`../assets/state.js?special-intake-guard=${Date.now()}`);
guardedSpecialApi.authenticate("director.a5", "Director@2569");
let intakeGuardError;
try {
  guardedSpecialApi.executeCommand("SPECIAL_ASSIGN_OFFICER", invalidSpecialMatter.id, {
    expectedVersion: invalidSpecialMatter.version,
    officerAccount: "special.a5",
    reason: "ทดสอบห้ามข้ามขั้นตรวจรับ"
  });
} catch (error) {
  intakeGuardError = error;
}
assert.equal(intakeGuardError?.status, 409);
assert.match(intakeGuardError?.message || "", /ธุรการคดีต้องตรวจข้อมูล/);
localStorage.clear();

const invalidPhaseState = createInitialState();
const mergedPreliminary = invalidPhaseState.cases.find((entry) => entry.id === "สส-2569-0003");
mergedPreliminary.phase = "MERGED";
mergedPreliminary.plan.status = "DRAFT";
mergedPreliminary.plan.objective = "ตรวจข้อเท็จจริงให้ครบทั้ง 4 ประเด็น";
mergedPreliminary.plan.issues.forEach((issue) => { issue.finding = "มีข้อมูลครบสำหรับเสนอผู้ตรวจ"; });
mergedPreliminary.report213.status = "DRAFT";
mergedPreliminary.report213.summary = "สรุปข้อเท็จจริงครบถ้วน";
mergedPreliminary.report213.recommendation = "เห็นควรเสนอผู้ตรวจ";
const mergedInquiry = invalidPhaseState.cases.find((entry) => entry.id === "สส-2569-0006");
mergedInquiry.phase = "MERGED";
mergedInquiry.report644.status = "DRAFT";
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(invalidPhaseState));
const guardedPhaseApi = await import(`../assets/state.js?submission-phase-guard=${Date.now()}`);
guardedPhaseApi.authenticate("prelim.a5", "Prelim@2569");
for (const commandName of ["SUBMIT_PLAN", "SUBMIT_REPORT_213"]) {
  let phaseError;
  try {
    guardedPhaseApi.executeCommand(commandName, mergedPreliminary.id, {
      expectedVersion: mergedPreliminary.version,
      reason: "ทดสอบห้ามเสนอสำนวนที่ถูกรวมแล้ว"
    });
  } catch (error) {
    phaseError = error;
  }
  assert.equal(phaseError?.status, 409, `${commandName} must reject a merged case`);
  assert.match(phaseError?.message || "", /เฉพาะสำนวนที่อยู่ระหว่างแสวงหาข้อเท็จจริงเบื้องต้น/);
}
guardedPhaseApi.logout();
guardedPhaseApi.authenticate("inquiry.a5", "Inquiry@2569");
let report644PhaseError;
try {
  guardedPhaseApi.executeCommand("SUBMIT_REPORT_644", mergedInquiry.id, {
    expectedVersion: mergedInquiry.version,
    reason: "ทดสอบห้ามเสนอสำนวนที่ถูกรวมแล้ว"
  });
} catch (error) {
  report644PhaseError = error;
}
assert.equal(report644PhaseError?.status, 409);
assert.match(report644PhaseError?.message || "", /เฉพาะสำนวนที่อยู่ระหว่างไต่สวนข้อเท็จจริง/);
localStorage.clear();

freshAs("clerk.zone3", "ClerkZone3@2569");
let before = currentCase("สส-2569-0001");
const forbiddenVersion = before.version;
const forbiddenSnapshot = JSON.stringify(before);
const auditCount = getState().globalAudit.length;
expectError(403, "ไม่มีสิทธิ์", () => executeCommand("ACCEPT_CASE", before.id, {
  expectedVersion: forbiddenVersion,
  reason: "ทดสอบข้ามเขต"
}));
assert.equal(JSON.stringify(currentCase(before.id)), forbiddenSnapshot);
assert.equal(currentCase(before.id).version, forbiddenVersion);
assert.equal(getState().globalAudit.length, auditCount + 1);
recordRouteFailure(403, "/cases/out-of-scope");
assert.equal(currentCase(before.id).version, forbiddenVersion);

freshAs("director.a5", "Director@2569");
let item = command("ACCEPT_CASE", "สส-2569-0001", { reason: "ผู้อำนวยการตรวจรับเรื่องของเขต" });
assert.equal(item.intakeDecision, "ACCEPTED");
freshAs("director.a5", "Director@2569");
item = command("RETURN_CASE", "สส-2569-0001", { reason: "ข้อมูลไม่อยู่ในขอบเขตที่รับดำเนินการ" });
assert.equal(item.phase, "CLOSED");
freshAs("director.a5", "Director@2569");
item = command("REQUEST_TRANSFER", "สส-2569-0001", { target: "สำนักงาน ป.ป.ท. เขต 2", reason: "ผู้อำนวยการพิจารณาแล้วเห็นว่าอยู่ในเขต 2" });
assert.equal(item.assignment.state, "TRANSFER_APPROVAL_PENDING");

freshAs("clerk.a5", "Clerk@2569");
item = currentCase("สส-2569-0001");
const originalReceivedAt = item.receivedAt;
const originalDeadline = item.report213.deadlineAt;
item = command("REQUEST_TRANSFER", item.id, {
  target: "สำนักงาน ป.ป.ท. เขต 2",
  reason: "เขตอำนาจอยู่ในพื้นที่เขต 2"
});
login("secretary.a5", "Secretary@2569");
item = command("DECIDE_TRANSFER_APPROVAL", item.id, { decision: "APPROVED", reason: "อนุมัติโอนข้ามเขต" });
login("clerk.a5", "Clerk@2569");
const transferVersion = item.version;
expectError(403, "ไม่มีสิทธิ์", () => executeCommand("RESPOND_TRANSFER", item.id, {
  expectedVersion: transferVersion,
  decision: "ACCEPT",
  sourceMemoNo: "ต้น-001",
  targetMemoNo: "ปลาย-001",
  reason: "ต้นทางตอบแทนปลายทางไม่ได้"
}));
assert.equal(currentCase(item.id).version, transferVersion);
login("clerk.zone3", "ClerkZone3@2569");
assert.equal(canReadCase(ACCOUNTS.find((entry) => entry.username === "clerk.zone3"), currentCase(item.id)), false);
login("clerk.zone2", "ClerkZone2@2569");
item = command("RESPOND_TRANSFER", item.id, {
  decision: "ACCEPT",
  sourceMemoNo: "ต้น-001",
  targetMemoNo: "ปลาย-001",
  reason: "ตรวจบันทึกข้อความครบถ้วนและรับโอน"
});
assert.equal(item.owningUnit, "สำนักงาน ป.ป.ท. เขต 2");
assert.equal(item.receivedAt, originalReceivedAt);
assert.equal(item.report213.deadlineAt, originalDeadline);
assert.deepEqual(item.assignment.assignees, []);
expectError(403, "ไม่มีสิทธิ์", () => command("ACCEPT_CASE", item.id, { reason: "ธุรการที่ไม่ได้รับมอบอำนาจห้ามตรวจรับ" }));
login("director.zone2", "DirectorZone2@2569");
expectError(409, "รับไว้ดำเนินการแล้ว", () => command("ACCEPT_CASE", item.id, { reason: "ห้ามรับซ้ำ" }));
assert.equal(canReadCase(ACCOUNTS.find((entry) => entry.username === "director.a5"), item), false);
assert.equal(canReadCase(ACCOUNTS.find((entry) => entry.username === "director.zone2"), item), true);

item = command("ASSIGN_INVESTIGATOR", item.id, {
  leadInvestigator: "ณัฐชา พนักงาน ป.ป.ท. เขต 2",
  assistantInvestigators: [],
  team: "ชุดแสวงหาข้อเท็จจริงเขต 2",
  reason: "มอบหมายผู้รับผิดชอบหลัก"
});
const assignmentNotices = getState().notifications.filter((entry) => entry.caseId === item.id && entry.extensionRound === 0);
assert.deepEqual(assignmentNotices.map((entry) => entry.elapsedDays), [15, 30, 45]);
assert.ok(assignmentNotices.every((entry) => entry.recipientAccount === "prelim.zone2"));
login("prelim.zone2", "PrelimZone2@2569");
expectError(409, "ยืนยันรับผิดชอบ", () => command("UPDATE_REPORT_213", item.id, {
  summary: "ยังไม่ควรบันทึก",
  recommendation: "ยังไม่ควรบันทึก",
  reason: "ทดสอบก่อนรับงาน"
}));
item = command("ACKNOWLEDGE_ASSIGNMENT", item.id, { reason: "รับผิดชอบสำนวน" });
login("director.zone2", "DirectorZone2@2569");
const worklogsBefore = item.worklogs.length;
item = command("CHANGE_INVESTIGATOR", item.id, {
  leadInvestigator: "ณัฐชา พนักงาน ป.ป.ท. เขต 2",
  assistantInvestigators: ["พนักงานแสวงหาข้อเท็จจริงเขต 2 คนที่ 2"],
  team: item.assignment.team,
  reason: "เพิ่มผู้ช่วยสำนวน"
});
assert.ok(item.assignment.assignees.find((entry) => entry.assignmentRole === "LEAD").acknowledgedAt);
assert.equal(item.assignment.assignees.find((entry) => entry.assignmentRole === "ASSISTANT").acknowledgedAt, "");
login("prelim.zone2.2", "PrelimZone22@2569");
item = command("ACKNOWLEDGE_ASSIGNMENT", item.id, { reason: "รับหน้าที่ผู้ช่วยสำนวน" });
item = command("ADD_WORKLOG", item.id, { date: "2026-08-02", detail: "ตรวจเอกสารประกอบ", reason: "บันทึกงาน" });
assert.equal(item.worklogs.length, worklogsBefore + 1);
item = command("ADD_EVIDENCE", item.id, { title: "เอกสารเบิกจ่าย", type: "เอกสาร", source: "หน่วยงานผู้ถูกร้อง", reason: "เพิ่มหลักฐาน" });
expectError(409, "ผู้รับผิดชอบหลัก", () => command("UPDATE_REPORT_213", item.id, {
  summary: "ผู้ช่วยห้ามแก้รายงาน",
  recommendation: "ผู้ช่วยห้ามเสนอ",
  reason: "ทดสอบ least privilege"
}));
expectError(409, "ผู้รับผิดชอบหลัก", () => command("REQUEST_EXTENSION", item.id, {
  reportType: "213",
  days: 30,
  reason: "ผู้ช่วยห้ามขยาย"
}));
login("director.zone2", "DirectorZone2@2569");
const evidenceCount = item.evidence.length;
item = command("CHANGE_INVESTIGATOR", item.id, {
  leadInvestigator: "ณัฐชา พนักงาน ป.ป.ท. เขต 2",
  assistantInvestigators: [],
  team: item.assignment.team,
  reason: "ปรับทีมตามภาระงาน"
});
assert.equal(item.evidence.length, evidenceCount);
login("prelim.zone2.2", "PrelimZone22@2569");
assert.equal(canReadCase(ACCOUNTS.find((entry) => entry.username === "prelim.zone2.2"), currentCase(item.id)), false);

freshAs("prelim.a5", "Prelim@2569");
item = command("REQUEST_EXTENSION", "สส-2569-0003", { reportType: "213", days: 30, reason: "รอเอกสารประกอบ" });
item = command("UPDATE_REPORT_213", item.id, {
  summary: "รวบรวมข้อเท็จจริงครบถ้วนแล้ว",
  recommendation: "เสนอผู้ตรวจพิจารณา",
  reason: "จัดทำรายงานแล้วเสร็จ"
});
item = command("SUBMIT_REPORT_213", item.id, { reason: "เสนอรายงาน 213" });
assert.equal(item.report213.extensionHistory.find((entry) => entry.sequence === 1).status, "WITHDRAWN");
assert.ok(getState().notifications.filter((entry) => entry.caseId === item.id && !entry.readAt).every((entry) => entry.status === "CANCELLED"));
expectError(409, "ส่งตรวจหรือเสร็จสิ้นแล้ว", () => command("REQUEST_EXTENSION", item.id, { reportType: "213", days: 30, reason: "ห้ามขอหลังส่งรายงาน" }));

freshAs("review.a5", "Review@2569");
item = command("APPROVE_REPORT", "สส-2569-0011", { reportType: "213", reason: "รายงานครบถ้วน" });
assert.equal(item.report213.status, "AWAITING_SECRETARY");
login("secretary.a5", "Secretary@2569");
item = command("SECRETARY_REVIEW_REPORT", item.id, {
  reportType: "213",
  decision: "REFER_SUPPORT",
  reason: "ต้องการความเห็นเรื่องความเพียงพอของข้อเท็จจริงและข้อกฎหมายประเด็นการแก้คะแนน"
});
assert.equal(item.report213.secretaryReview.status, "SUPPORT_ORDERED");
login("caseadmin.a5", "CaseAdmin@2569");
item = command("DISPATCH_SUPPORT_SUBCOMMITTEE", item.id, {
  reportType: "213",
  dispatchNote: "หนังสือ กบค. 001/2569",
  reason: "ส่งตามคำสั่งเลขาธิการฯ"
});
item = command("RECORD_SUPPORT_SUBCOMMITTEE_OPINION", item.id, {
  reportType: "213",
  opinion: "ข้อเท็จจริงและข้อกฎหมายเพียงพอสำหรับเสนอพิจารณา",
  reason: "รับความเห็นกลับ"
});
login("secretary.a5", "Secretary@2569");
item = command("SECRETARY_REVIEW_REPORT", item.id, {
  reportType: "213",
  decision: "READY",
  reason: "เห็นชอบตามความเห็นที่ได้รับ"
});
assert.equal(item.report213.status, "READY_TO_SEND");
item = command("SEND_ACTIVITY7", item.id, { reportType: "213", reason: "เสนอรายงาน 213" });
const outboundId = item.integration.messageId;
const callbackExpectedVersion = item.version;
expectError(422, "วันที่ประชุมไม่ถูกต้อง", () => command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  meetingDate: "2026-02-30",
  result: "ACCEPT_EMPLOYEE_PANEL",
  messageId: "IN-INVALID-DATE",
  correlationId: outboundId,
  reason: "ทดสอบวันที่ไม่ถูกต้อง"
}));
expectError(409, "ไม่เป็นวันที่ในอนาคต", () => command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  meetingDate: "2026-08-03",
  result: "ACCEPT_EMPLOYEE_PANEL",
  messageId: "IN-FUTURE-DATE",
  correlationId: outboundId,
  reason: "ทดสอบวันที่ในอนาคต"
}));
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "ACCEPT_EMPLOYEE_PANEL",
  directives: [],
  messageId: "IN-213-001",
  correlationId: outboundId,
  reason: "รับผลพิจารณา"
});
const finalizedVersion = item.version;
item = executeCommand("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  expectedVersion: callbackExpectedVersion,
  result: "ACCEPT_EMPLOYEE_PANEL",
  directives: [],
  messageId: "IN-213-001",
  correlationId: outboundId,
  reason: "callback ซ้ำเหมือนเดิม"
});
assert.equal(item.version, finalizedVersion);
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "NOT_ACCEPT_TERMINATE",
  directives: [],
  messageId: "IN-213-001",
  correlationId: outboundId,
  reason: "callback ขัดแย้งภายหลัง"
});
assert.equal(item.integration.status, "DECISION_RECEIVED");
assert.equal(item.integration.decision, "ACCEPT_EMPLOYEE_PANEL");
assert.equal(item.phase, "WAIT_A7_213");
assert.ok(item.integration.callbackWarning);
expectError(409, "ไม่ก่อนวันที่คณะกรรมการ", () => command("HANDOFF_INQUIRY", item.id, {
  appointmentType: "EMPLOYEE_PANEL",
  signatory: "SECRETARY",
  orderNo: "คำสั่งก่อนมติ",
  orderDate: "2026-08-01",
  leadInvestigator: "ธนกร พนักงานไต่สวน",
  assistantInvestigators: [],
  reason: "ทดสอบลำดับวันที่"
}));
expectError(409, "ไม่เป็นวันที่ในอนาคต", () => command("HANDOFF_INQUIRY", item.id, {
  appointmentType: "EMPLOYEE_PANEL",
  signatory: "SECRETARY",
  orderNo: "คำสั่งอนาคต",
  orderDate: "2026-08-03",
  leadInvestigator: "ธนกร พนักงานไต่สวน",
  assistantInvestigators: [],
  reason: "ทดสอบลำดับวันที่"
}));
item = command("HANDOFF_INQUIRY", item.id, {
  appointmentType: "EMPLOYEE_PANEL",
  signatory: "SECRETARY",
  orderNo: "คำสั่ง 301/2569",
  orderDate: "2026-08-02",
  leadInvestigator: "ธนกร พนักงานไต่สวน",
  assistantInvestigators: ["พนักงานไต่สวนเขต 1 คนที่ 2"],
  reason: "ส่งมอบตามคำสั่ง"
});
assert.equal(item.report644.startedAt, "2026-08-02");
assert.equal(item.report644.deadlineAt, "2027-04-29");
assert.equal(item.report644.signatory, "เลขาธิการคณะกรรมการ ป.ป.ท.");
assert.equal(item.assignment.state, "ASSIGNED");

freshAs("secretary.a5", "Secretary@2569");
item = currentCase("สส-2569-0005");
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "ACCEPT_SUBCOMMITTEE",
  directives: [],
  messageId: "IN-213-SUB-001",
  correlationId: item.integration.messageId,
  reason: "รับมติแต่งตั้งคณะอนุกรรมการไต่สวน"
});
item = command("HANDOFF_INQUIRY", item.id, {
  appointmentType: "SUBCOMMITTEE",
  signatory: "CHAIR",
  orderNo: "คำสั่ง 302/2569",
  orderDate: "2026-08-02",
  leadInvestigator: "ธนกร พนักงานไต่สวน",
  assistantInvestigators: [],
  reason: "ส่งมอบตามคำสั่ง"
});
assert.equal(item.report644.startedAt, meeting.meetingDate);
assert.equal(item.report644.signatory, "ประธานกรรมการ ป.ป.ท.");

freshAs("secretary.a5", "Secretary@2569");
item = currentCase("สส-2569-0008");
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "MORE_INQUIRY",
  messageId: "IN-MORE-644",
  correlationId: item.integration.messageId,
  reason: "รับมติให้ไต่สวนเพิ่มเติม"
});
assert.equal(item.report644.supplementalInquiry.status, "ACTIVE");
assert.equal(item.report644.supplementalInquiry.deadlineAt, "2026-09-01");

freshAs("secretary.a5", "Secretary@2569");
item = currentCase("สส-2569-0008");
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "UNSUPPORTED_RESULT",
  messageId: "IN-UNKNOWN-644",
  correlationId: item.integration.messageId,
  reason: "รับผลที่ไม่รู้จัก"
});
assert.equal(item.integration.status, "QUARANTINED");
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "SUBSTANTIATE_CORRUPTION",
  directives: ["PROSECUTOR", "PARENT_AGENCY"],
  messageId: "IN-VALID-644",
  correlationId: item.integration.messageId,
  reason: "รับผลที่ตรวจสอบแล้ว"
});
assert.deepEqual(item.integration.directives, ["PARENT_AGENCY", "PROSECUTOR"]);
login("inquiry.a5", "Inquiry@2569");
expectError(409, "ครบทุกปลายทาง", () => command("POST_DECISION_HANDOFF", item.id, {
  targets: ["PARENT_AGENCY"],
  reason: "ขัดมติ"
}));
item = command("POST_DECISION_HANDOFF", item.id, { targets: ["PROSECUTOR", "PARENT_AGENCY"], reason: "ดำเนินการตรงตามมติ" });
assert.deepEqual(item.handoff.deliveries.map((entry) => entry.target), ["PROSECUTOR", "PARENT_AGENCY"]);
item = command("PREPARE_OUTGOING_PACKAGE", item.id, {
  target: "PROSECUTOR",
  accusedCategory: "CIVILIAN",
  jurisdiction: "ศาลอาญาคดีทุจริตและประพฤติมิชอบกลาง",
  caseFileReference: "บัญชีสำนวน 1 ชุด",
  resolutionReference: "มติ 18/2569",
  inquiryReportReference: "รายงาน 644 ฉบับลงนาม",
  outgoingLetterNo: "ปปท 001/2569",
  reason: "จัดเตรียมสำนวนส่งอัยการ"
});
assert.equal(item.handoff.deliveries.find((entry) => entry.target === "PROSECUTOR").prosecutorOffice, "สำนักงานคดีปราบปรามการทุจริตตามเขตอำนาจศาล");
login("review.a5", "Review@2569");
item = command("SIGN_OUTGOING_LETTER", item.id, { target: "PROSECUTOR", reason: "ตรวจและลงนามแล้ว" });
login("inquiry.a5", "Inquiry@2569");
item = command("DISPATCH_SIGNED_DELIVERY", item.id, { target: "PROSECUTOR", deliveryResult: "FAILED", deliveryNote: "ช่องทางนำส่งขัดข้อง", reason: "บันทึกผลการส่ง" });
assert.equal(item.handoff.deliveries.find((entry) => entry.target === "PROSECUTOR").status, "FAILED");
item = command("RETRY_OUTGOING_DELIVERY", item.id, { target: "PROSECUTOR", deliveryResult: "SUCCESS", deliveryNote: "นำส่งสำเร็จ เลขติดตาม A001", reason: "นำส่งซ้ำ" });
assert.equal(item.handoff.deliveries.find((entry) => entry.target === "PROSECUTOR").status, "SENT");
login("decision.a5", "Decision@2569");
item = command("SEND_DISCIPLINARY_COPY", item.id, { copyReference: "สำเนา กวฉ 001/2569", reason: "ส่งสำเนาให้ผู้รับผิดชอบเก็บรวมสำนวน" });
login("tracking.a5", "Tracking@2569");
item = command("DISPATCH_DISCIPLINARY_DELIVERY", item.id, { parentAgencyName: "การประปาท้องถิ่นตัวอย่าง", outgoingLetterNo: "กบต 001/2569", deliveryResult: "FAILED", deliveryNote: "ระบบรับหนังสือปลายทางขัดข้อง", reason: "แจ้งต้นสังกัด" });
assert.equal(item.handoff.deliveries.find((entry) => entry.target === "PARENT_AGENCY").status, "FAILED");
item = command("RETRY_DISCIPLINARY_DELIVERY", item.id, { deliveryResult: "SUCCESS", deliveryNote: "นำส่งสำเร็จ เลขติดตาม D001", reason: "นำส่งหนังสือแจ้งต้นสังกัดซ้ำ" });
assert.equal(item.handoff.deliveries.find((entry) => entry.target === "PARENT_AGENCY").status, "SENT");
assert.equal(item.handoff.status, "CLOSED");

freshAs("secretary.a5", "Secretary@2569");
item = currentCase("สส-2569-0005");
item = command("RECEIVE_ACTIVITY7", item.id, {
  ...meeting,
  result: "NOT_ACCEPT_OTHER_AGENCY",
  messageId: "IN-OTHER-213",
  correlationId: item.integration.messageId,
  reason: "รับมติส่งหน่วยงานอื่น"
});
login("prelim.a5", "Prelim@2569");
expectError(422, "ชื่อหน่วยงาน", () => command("POST_DECISION_HANDOFF", item.id, { targets: ["OTHER"], reason: "ข้อมูลไม่ครบ" }));
item = command("POST_DECISION_HANDOFF", item.id, {
  targets: ["OTHER"],
  otherAgencyName: "สำนักงานตรวจสอบจังหวัดตัวอย่าง",
  otherAgencyAddress: "อาคารราชการ ชั้น 2 จังหวัดตัวอย่าง",
  otherAgencyContact: "หนังสืออ้างอิง กค 001/2569 โทร. 02-000-0000",
  jurisdictionReason: "เป็นเรื่องที่อยู่ในอำนาจตรวจสอบของหน่วยงานดังกล่าว",
  reason: "จัดเตรียมส่งตามมติ"
});
assert.equal(item.handoff.deliveries[0].label, "สำนักงานตรวจสอบจังหวัดตัวอย่าง");

freshAs("prelim.a5", "Prelim@2569");
const initial213Deadline = currentCase("สส-2569-0003").report213.deadlineAt;
item = command("REQUEST_EXTENSION", "สส-2569-0003", { reportType: "213", days: 60, reason: "รอเอกสารเพิ่มเติม" });
let extension = item.report213.extensionHistory.find((entry) => entry.status === "PENDING");
login("review.a5", "Review@2569");
item = command("DECIDE_EXTENSION", item.id, { reportType: "213", extensionId: extension.id, decision: "APPROVED", reason: "อนุมัติครั้งที่ 1" });
extension = item.report213.extensionHistory[0];
assert.deepEqual(extension.checkpoints.map((entry) => entry.elapsedDays), [15, 30, 45]);
assert.equal(extension.periodStartedAt, initial213Deadline);
assert.equal(getState().notifications.filter((entry) => entry.caseId === item.id && entry.extensionRound === 1).length, 3);
login("prelim.a5", "Prelim@2569");
item = command("REQUEST_EXTENSION", item.id, { reportType: "213", days: 60, reason: "ยังรวบรวมไม่ครบ" });
extension = item.report213.extensionHistory.find((entry) => entry.status === "PENDING");
login("executive.a5", "Executive@2569");
item = command("DECIDE_EXTENSION", item.id, { reportType: "213", extensionId: extension.id, decision: "APPROVED", reason: "อนุมัติครั้งที่ 2" });
login("prelim.a5", "Prelim@2569");
expectError(409, "เมื่อพ้นกำหนด", () => command("CREATE_EXHAUSTION_REPORT", item.id, {
  reportType: "213",
  reasonAndNecessity: "ยังไม่แล้วเสร็จ",
  pastActions: "ติดตามเอกสาร",
  remainingActions: "สรุปรายงาน",
  obstacles: "รอเอกสาร",
  expectedCompletionAt: "2027-01-15",
  reason: "รายงานเหตุล่าช้า"
}));

freshAs("inquiry.a5", "Inquiry@2569");
item = command("REQUEST_EXTENSION", "สส-2569-0007", { reportType: "644", days: 60, reason: "ไต่สวนพยานเพิ่มเติม" });
extension = item.report644.extensionHistory.find((entry) => entry.status === "PENDING");
login("review.a5", "Review@2569");
item = command("DECIDE_EXTENSION", item.id, { reportType: "644", extensionId: extension.id, decision: "APPROVED", reason: "อนุมัติ" });
assert.deepEqual(item.report644.extensionHistory[0].checkpoints, []);
assert.equal(getState().notifications.some((entry) => entry.caseId === item.id && entry.reportType === "644"), false);

freshAs("inquiry.a5", "Inquiry@2569");
expectError(422, "เรื่องที่ขอ", () => command("CREATE_SUPPORT_REQUEST", "สส-2569-0006", {
  requestType: "SEARCH_WARRANT",
  reason: "ต้องค้นเอกสารประกอบสำนวน"
}));
item = command("CREATE_SUPPORT_REQUEST", "สส-2569-0006", {
  requestType: "SEARCH_WARRANT",
  subject: "ขอหมายค้นเพื่อยึดเอกสารการเบิกจ่าย",
  target: "ห้องเก็บเอกสารชั้น 2 อาคารสำนักงานตัวอย่าง",
  documentReference: "บัญชีเอกสาร พย.12–พย.18",
  evidenceBasis: "พยานบุคคลระบุว่าเอกสารต้นฉบับถูกเก็บไว้ในสถานที่เป้าหมาย",
  contactAddress: "อาคารสำนักงานตัวอย่าง ถนนตัวอย่าง จังหวัดตัวอย่าง",
  reason: "มีความจำเป็นต้องตรวจค้นและยึดเอกสารต้นฉบับ"
});
assert.equal(item.supportRequests[0].subject, "ขอหมายค้นเพื่อยึดเอกสารการเบิกจ่าย");
assert.equal(item.supportRequests[0].documentReference, "บัญชีเอกสาร พย.12–พย.18");
expectError(422, "ชื่อผู้ถูกกล่าวหา", () => command("RECORD_ALLEGATION_EXCEPTION", item.id, {
  exceptionType: "ACCUSED_DECEASED",
  note: "ได้รับแจ้งว่าผู้ถูกกล่าวหาเสียชีวิต",
  evidenceReference: "หนังสือรับรองการตาย 1/2569",
  reason: "บันทึกเหตุที่ไม่แจ้งข้อกล่าวหา"
}));
item = command("RECORD_ALLEGATION_EXCEPTION", item.id, {
  exceptionType: "ACCUSED_DECEASED",
  accusedName: "ผู้ถูกกล่าวหารายที่ 4",
  note: "ตรวจทะเบียนแล้วพบว่าผู้ถูกกล่าวหาเสียชีวิตก่อนแจ้งข้อกล่าวหา",
  evidenceReference: "หนังสือรับรองการตาย 1/2569",
  reason: "บันทึกเหตุที่ไม่แจ้งข้อกล่าวหา"
});
assert.equal(item.report644.allegationProcess.exceptions.at(-1).type, "ACCUSED_DECEASED");

freshAs("inquiry.a5", "Inquiry@2569");
let futureDateCase = currentCase("สส-2569-0007");
expectError(409, "วันที่ในอนาคต", () => command("PREPARE_ALLEGATION_NOTICE", futureDateCase.id, {
  accusedName: "ผู้ถูกกล่าวหารายอนาคต",
  letterNo: "นข-FUTURE-001",
  noticeDate: "2027-01-01",
  appointmentDate: "2027-01-10",
  evidenceBasis: "เอกสารประกอบการทดสอบลำดับวัน",
  reason: "ทดสอบห้ามลงวันที่หนังสือในอนาคต"
}));
futureDateCase = command("PREPARE_ALLEGATION_NOTICE", futureDateCase.id, {
  accusedName: "ผู้ถูกกล่าวหารายนัดหมายอนาคต",
  letterNo: "นข-FUTURE-APPOINTMENT",
  noticeDate: "2026-08-02",
  appointmentDate: "2026-08-10",
  evidenceBasis: "เอกสารประกอบการทดสอบวันนัดหมาย",
  reason: "ยืนยันว่าอนุญาตให้นัดหมายในอนาคต"
});
const futureAppointmentNoticeId = futureDateCase.report644.allegationProcess.notices.at(-1).id;
assert.equal(futureDateCase.report644.allegationProcess.notices.at(-1).appointmentDate, "2026-08-10");
expectError(409, "วันที่ในอนาคต", () => command("RECORD_ALLEGATION_APPEARANCE", futureDateCase.id, {
  noticeId: futureAppointmentNoticeId,
  serviceDate: "2027-01-10",
  serviceReference: "บร-FUTURE-001",
  reason: "ทดสอบห้ามบันทึกการมารับทราบในอนาคต"
}));
expectError(409, "วันที่ในอนาคต", () => command("RECORD_ALLEGATION_POSTAL", futureDateCase.id, {
  noticeId: futureAppointmentNoticeId,
  serviceDate: "2027-01-10",
  serviceReference: "EMS-FUTURE-001",
  noShowNote: "ไม่มาตามวันนัดหมาย",
  reason: "ทดสอบห้ามบันทึกการส่งไปรษณีย์ในอนาคต"
}));

futureDateCase = command("PREPARE_ALLEGATION_NOTICE", futureDateCase.id, {
  accusedName: "ผู้ถูกกล่าวหารายทดสอบผลไปรษณีย์",
  letterNo: "นข-FUTURE-RESULT",
  noticeDate: "2026-07-01",
  appointmentDate: "2026-07-10",
  evidenceBasis: "เอกสารประกอบการทดสอบผลนำส่ง",
  reason: "จัดทำหนังสือสำหรับทดสอบผลนำส่ง"
});
const futureResultNoticeId = futureDateCase.report644.allegationProcess.notices.at(-1).id;
futureDateCase = command("RECORD_ALLEGATION_POSTAL", futureDateCase.id, {
  noticeId: futureResultNoticeId,
  serviceDate: "2026-07-11",
  serviceReference: "EMS-FUTURE-RESULT",
  noShowNote: "ไม่มาตามวันนัดหมาย",
  reason: "ส่งทางไปรษณีย์"
});
expectError(409, "วันที่ในอนาคต", () => command("RECORD_ALLEGATION_POSTAL_RESULT", futureDateCase.id, {
  noticeId: futureResultNoticeId,
  deliveryResult: "DELIVERED",
  resultDate: "2027-01-10",
  resultReference: "POD-FUTURE-RESULT",
  reason: "ทดสอบห้ามบันทึกผลไปรษณีย์ในอนาคต"
}));
futureDateCase = command("RECORD_ALLEGATION_POSTAL_RESULT", futureDateCase.id, {
  noticeId: futureResultNoticeId,
  deliveryResult: "DELIVERED",
  resultDate: "2026-08-02",
  resultReference: "POD-FUTURE-RESULT",
  reason: "บันทึกผลไปรษณีย์"
});
expectError(409, "วันที่ในอนาคต", () => command("RECORD_ALLEGATION_RESPONSE", futureDateCase.id, {
  noticeId: futureResultNoticeId,
  responseOutcome: "EXPLANATION_RECEIVED",
  responseDate: "2027-01-11",
  explanation: "คำชี้แจงที่ลงวันที่ในอนาคต",
  evidenceReference: "ชจ-FUTURE-RESULT",
  reason: "ทดสอบห้ามบันทึกผลการชี้แจงในอนาคต"
}));

futureDateCase = command("PREPARE_ALLEGATION_NOTICE", futureDateCase.id, {
  accusedName: "ผู้ถูกกล่าวหารายทดสอบการปิดหนังสือ",
  letterNo: "นข-FUTURE-POSTING",
  noticeDate: "2026-07-01",
  appointmentDate: "2026-07-10",
  evidenceBasis: "เอกสารประกอบการทดสอบการปิดหนังสือ",
  reason: "จัดทำหนังสือสำหรับทดสอบการปิดหนังสือ"
});
const futurePostingNoticeId = futureDateCase.report644.allegationProcess.notices.at(-1).id;
futureDateCase = command("RECORD_ALLEGATION_POSTAL", futureDateCase.id, {
  noticeId: futurePostingNoticeId,
  serviceDate: "2026-07-11",
  serviceReference: "EMS-FUTURE-POSTING",
  noShowNote: "ไม่มาตามวันนัดหมาย",
  reason: "ส่งทางไปรษณีย์"
});
futureDateCase = command("RECORD_ALLEGATION_POSTAL_RESULT", futureDateCase.id, {
  noticeId: futurePostingNoticeId,
  deliveryResult: "FAILED",
  resultDate: "2026-08-02",
  resultReference: "RTS-FUTURE-POSTING",
  reason: "ไปรษณีย์นำส่งไม่ได้"
});
expectError(409, "วันที่ในอนาคต", () => command("RECORD_ALLEGATION_POSTING", futureDateCase.id, {
  noticeId: futurePostingNoticeId,
  postingPlace: "DOMICILE",
  serviceDate: "2027-01-12",
  locationDetail: "ภูมิลำเนาของผู้ถูกกล่าวหา",
  serviceReference: "ปด-FUTURE-POSTING",
  reason: "ทดสอบห้ามบันทึกการปิดหนังสือในอนาคต"
}));

freshAs("inquiry.a5", "Inquiry@2569");
item = command("UPDATE_REPORT_644", "สส-2569-0007", {
  planSummary: currentCase("สส-2569-0007").report644.planSummary,
  evidenceSummary: "รวบรวมพยานเพิ่มเติมแล้ว",
  summary: "สรุปใหม่",
  recommendation: "เสนอผู้ตรวจ",
  reason: "ปรับรายงาน"
});
item = command("PREPARE_ALLEGATION_NOTICE", item.id, {
  accusedName: "ผู้ถูกกล่าวหารายที่ 4",
  letterNo: "นข-644-004",
  noticeDate: "2026-07-01",
  appointmentDate: "2026-07-10",
  evidenceBasis: "เอกสารตรวจรับและผลทดสอบวัสดุสนับสนุนข้อกล่าวหา",
  reason: "จัดทำหนังสือแจ้งข้อกล่าวหา"
});
expectError(409, "แจ้งข้อกล่าวหา", () => command("SUBMIT_REPORT_644", item.id, { reason: "ยังไม่ครบขั้นแจ้งข้อกล่าวหา" }));
item = command("RECORD_ALLEGATION_APPEARANCE", item.id, {
  noticeId: item.report644.allegationProcess.notices.at(-1).id,
  serviceDate: "2026-07-10",
  serviceReference: "บร-644-004",
  reason: "มารับทราบข้อกล่าวหา"
});
item = command("RECORD_ALLEGATION_RESPONSE", item.id, {
  noticeId: item.report644.allegationProcess.notices.at(-1).id,
  responseOutcome: "EXPLANATION_RECEIVED",
  responseDate: "2026-07-15",
  explanation: "ผู้ถูกกล่าวหายื่นคำชี้แจงและพยานเอกสาร",
  evidenceReference: "ชจ-644-004",
  reason: "บันทึกคำชี้แจง"
});
item = command("PREPARE_ALLEGATION_NOTICE", item.id, {
  accusedName: "ผู้ถูกกล่าวหารายที่ 5",
  letterNo: "นข-644-005",
  noticeDate: "2026-07-01",
  appointmentDate: "2026-07-10",
  evidenceBasis: "พยานบุคคลและเอกสารการอนุมัติสนับสนุนข้อกล่าวหา",
  reason: "จัดทำหนังสือแจ้งข้อกล่าวหา"
});
const postalNoticeId = item.report644.allegationProcess.notices.at(-1).id;
item = command("RECORD_ALLEGATION_POSTAL", item.id, {
  noticeId: postalNoticeId,
  serviceDate: "2026-07-11",
  serviceReference: "EMS-644-005",
  noShowNote: "ไม่มารับทราบข้อกล่าวหาตามวันนัดหมาย",
  reason: "ส่งเอกสารทางไปรษณีย์"
});
item = command("RECORD_ALLEGATION_POSTAL_RESULT", item.id, {
  noticeId: postalNoticeId,
  deliveryResult: "DELIVERED",
  resultDate: "2026-08-02",
  resultReference: "POD-644-005",
  reason: "ไปรษณีย์นำส่งสำเร็จ"
});
expectError(409, "วันที่แจ้งข้อกล่าวหาสำเร็จ", () => command("RECORD_ALLEGATION_RESPONSE", item.id, {
  noticeId: postalNoticeId,
  responseOutcome: "EXPLANATION_RECEIVED",
  responseDate: "2026-07-15",
  explanation: "วันที่คำชี้แจงอยู่ก่อนวันที่ไปรษณีย์นำส่งสำเร็จ",
  evidenceReference: "ชจ-644-005-ผิดลำดับวัน",
  reason: "ทดสอบลำดับวัน"
}));
item = command("RECORD_ALLEGATION_RESPONSE", item.id, {
  noticeId: postalNoticeId,
  responseOutcome: "EXPLANATION_RECEIVED",
  responseDate: "2026-08-02",
  explanation: "ได้รับคำชี้แจงเป็นหนังสือ",
  evidenceReference: "ชจ-644-005",
  reason: "บันทึกคำชี้แจง"
});
item = command("PREPARE_ALLEGATION_NOTICE", item.id, {
  accusedName: "ผู้ถูกกล่าวหารายที่ 6",
  letterNo: "นข-644-006",
  noticeDate: "2026-07-01",
  appointmentDate: "2026-07-10",
  evidenceBasis: "พยานหลักฐานการเบิกจ่ายสนับสนุนข้อกล่าวหา",
  reason: "จัดทำหนังสือแจ้งข้อกล่าวหา"
});
const postingNoticeId = item.report644.allegationProcess.notices.at(-1).id;
item = command("RECORD_ALLEGATION_POSTAL", item.id, {
  noticeId: postingNoticeId,
  serviceDate: "2026-07-11",
  serviceReference: "EMS-644-006",
  noShowNote: "ไม่มารับทราบข้อกล่าวหาตามวันนัดหมาย",
  reason: "ส่งเอกสารทางไปรษณีย์"
});
item = command("RECORD_ALLEGATION_POSTAL_RESULT", item.id, {
  noticeId: postingNoticeId,
  deliveryResult: "FAILED",
  resultDate: "2026-07-14",
  resultReference: "RTS-644-006",
  reason: "ไปรษณีย์นำส่งไม่ได้"
});
item = command("RECORD_ALLEGATION_POSTING", item.id, {
  noticeId: postingNoticeId,
  postingPlace: "WORKPLACE",
  serviceDate: "2026-07-16",
  locationDetail: "สำนักทำงานของผู้ถูกกล่าวหา อาคารสำนักงานตัวอย่าง",
  serviceReference: "ปด-644-006",
  reason: "ปิดบันทึกแจ้งข้อกล่าวหา"
});
item = command("RECORD_ALLEGATION_RESPONSE", item.id, {
  noticeId: postingNoticeId,
  responseOutcome: "NO_EXPLANATION_WITHIN_NOTICE",
  responseDate: "2026-08-01",
  explanation: "ไม่ยื่นคำชี้แจงภายในเวลาที่ระบุในหนังสือแจ้ง",
  evidenceReference: "บก-644-006",
  reason: "บันทึกว่าไม่มีการยื่นคำชี้แจง"
});
item = command("SUBMIT_REPORT_644", item.id, { reason: "เสนอรายงาน" });
expectError(409, "ส่งตรวจหรือเสร็จสิ้นแล้ว", () => command("REQUEST_EXTENSION", item.id, { reportType: "644", days: 30, reason: "ห้ามขอหลังส่งรายงาน" }));
login("review.a5", "Review@2569");
item = command("RETURN_REPORT", item.id, { reportType: "644", reason: "ให้ไต่สวนข้อเท็จจริงเพิ่มเติม" });
assert.equal(item.report644.supplementalInquiry.status, "NOT_REQUIRED");

freshAs("decision.a5", "Decision@2569");
item = currentCase("สส-2569-0009");
item = command("SEND_DISCIPLINARY_COPY", item.id, { copyReference: "สำเนา กวฉ 009/2569", reason: "ส่งสำเนาให้ผู้รับผิดชอบสำนวน" });
assert.ok(item.handoff.deliveries.find((entry) => entry.target === "PARENT_AGENCY").copySentAt);

assert.equal(ACCOUNTS.some((entry) => entry.role === "FACTCHECK"), false, "ordinary FACTCHECK role must be removed");
assert.equal(createInitialState().cases.some((entry) => Object.hasOwn(entry, "factcheck")), false, "ordinary cases must not contain 58/2 factcheck fields");
freshAs("special.a5", "Special@2569");
const specialAccount = ACCOUNTS.find((entry) => entry.username === "special.a5");
assert.equal(canReadCase(specialAccount, currentCase("สส-2569-0001")), false);
assert.equal(canReadSpecialMatter(specialAccount, currentSpecialMatter("special-58-2-003")), true);
assert.equal(canReadSpecialMatter(specialAccount, currentSpecialMatter("special-58-2-001")), false);
const auditAccount = ACCOUNTS.find((entry) => entry.username === "audit.a5");
assert.equal(canReadSpecialMatter(auditAccount, currentSpecialMatter("special-58-2-001")), true);
assert.equal(canReadSpecialMatter(auditAccount, currentSpecialMatter("special-corruption-006")), true);

freshAs("clerk.a5", "Clerk@2569");
let special = command("SPECIAL_REVIEW_INTAKE", "special-58-2-001", {
  decision: "FORWARD",
  checkNote: "ตรวจข้อมูลผู้ร้อง เหตุความเดือดร้อน และหน่วยงานที่เกี่ยวข้องครบถ้วน",
  reason: "เสนอผู้อำนวยการมอบหมาย"
});
assert.equal(special.status, "PENDING_DIRECTOR_ASSIGNMENT");
login("director.a5", "Director@2569");
special = command("SPECIAL_ASSIGN_OFFICER", special.id, {
  officerAccount: "special.a5",
  reason: "มอบหมายตรวจสอบข้อเท็จจริง"
});
assert.equal(special.status, "ASSIGNED");
login("special.a5", "Special@2569");
special = command("SPECIAL_ACKNOWLEDGE_ASSIGNMENT", special.id, { reason: "รับมอบหมายเรื่อง" });
special = command("SPECIAL_SAVE_REPORT", special.id, {
  factSummary: "ตรวจขั้นตอนการอนุญาตและพบการเรียกเอกสารนอกเหนือจากรายการที่ประกาศ",
  evidenceReferences: "ประกาศขั้นตอนบริการ; คำขอรับบริการ; บันทึกถ้อยคำผู้ร้อง",
  hardshipImpact: "ผู้ร้องไม่สามารถรับบริการได้และต้องเดินทางติดต่อหลายครั้ง",
  projectValueIssue: "",
  recommendedAction: "เสนอแจ้งหัวหน้าหน่วยงานของรัฐแก้ไขปัญหาความเดือดร้อน",
  reason: "บันทึกรายงานผลการตรวจสอบ"
});
special = command("SPECIAL_SUBMIT_REPORT", special.id, { reason: "เสนอรายงานให้ผู้บังคับบัญชาระดับผู้อำนวยการตรวจ" });
assert.equal(special.status, "AWAITING_DIRECTOR_REVIEW");
login("review.a5", "Review@2569");
special = command("SPECIAL_REVIEW_REPORT_DIRECTOR", special.id, {
  decision: "FORWARD",
  opinion: "ตรวจรายงานและพยานหลักฐานแล้ว เห็นควรเสนอผู้ช่วยหรือรองเลขาธิการฯ ที่กำกับ",
  reason: "เสนอผู้ช่วยหรือรองเลขาธิการฯ ที่กำกับ"
});
login("executive.a5", "Executive@2569");
special = command("SPECIAL_REVIEW_REPORT_EXECUTIVE", special.id, {
  decision: "FORWARD",
  opinion: "เห็นควรเสนอเลขาธิการฯ พิจารณา",
  reason: "เสนอเลขาธิการฯ"
});
login("secretary.a5", "Secretary@2569");
expectError(409, "ประเภทเรื่อง", () => command("SPECIAL_SECRETARY_DECIDE", special.id, {
  outcome: "NOTIFY_SAO",
  opinion: "ปลายทางไม่ตรงประเภทเรื่อง",
  reason: "ทดสอบปลายทาง"
}));
special = command("SPECIAL_SECRETARY_DECIDE", special.id, {
  outcome: "NOTIFY_STATE_AGENCY",
  opinion: "แจ้งหัวหน้าหน่วยงานของรัฐให้แก้ไขและติดตามผล",
  reason: "บันทึกผลพิจารณา"
});
assert.equal(special.notification.targetType, "STATE_AGENCY_HEAD");
login("special.a5", "Special@2569");
special = command("SPECIAL_SEND_NOTIFICATION", special.id, {
  targetName: "หัวหน้าสำนักงานบริการประชาชนจังหวัดตัวอย่าง",
  letterNo: "ปปท 0582/2569",
  sentAt: "2026-08-02",
  deliveryReference: "หลักฐานรับหนังสือ 0582/2569",
  reason: "ส่งหนังสือแจ้งให้แก้ไข"
});
assert.equal(special.status, "AWAITING_AGENCY_ACTION");
special = command("SPECIAL_RECORD_AGENCY_RESPONSE", special.id, {
  response: "NOT_ACTED",
  responseDate: "2026-08-02",
  responseReference: "บันทึกติดตาม 0582/2569",
  note: "ตรวจติดตามแล้วหน่วยงานยังไม่ดำเนินการแก้ไข",
  reason: "บันทึกผลการติดตาม"
});
assert.equal(special.status, "READY_PUBLIC_NOTICE");
special = command("SPECIAL_RECORD_PUBLIC_NOTICE", special.id, {
  publicationDate: "2026-08-02",
  publicationReference: "ประกาศสำนักงาน ป.ป.ท. 12/2569",
  reason: "บันทึกการประกาศให้ประชาชนทราบ"
});
assert.equal(special.status, "COMPLETED");

freshAs("secretary.a5", "Secretary@2569");
special = command("SPECIAL_SECRETARY_DECIDE", "special-58-3-004", {
  outcome: "NOTIFY_SAO",
  opinion: "แจ้งสำนักงานการตรวจเงินแผ่นดินดำเนินการตามอำนาจหน้าที่",
  reason: "บันทึกผลพิจารณา"
});
assert.equal(special.notification.targetName, "สำนักงานการตรวจเงินแผ่นดิน (สตง.)");
login("special.a5", "Special@2569");
special = command("SPECIAL_SEND_NOTIFICATION", special.id, {
  letterNo: "ปปท 0583/2569",
  sentAt: "2026-08-02",
  deliveryReference: "หลักฐานรับหนังสือ สตง. 0583/2569",
  reason: "ส่งหนังสือแจ้งสำนักงานการตรวจเงินแผ่นดิน"
});
assert.equal(special.status, "COMPLETED");
assert.equal(special.notification.targetType, "SAO");

freshAs("special.a5", "Special@2569");
special = command("SPECIAL_SEND_NOTIFICATION", "special-corruption-006", {
  letterNo: "ปปท ปช 006/2569",
  sentAt: "2026-08-02",
  deliveryReference: "หลักฐานรับเรื่อง ป.ป.ช. 006/2569",
  reason: "ส่งเรื่องที่พบภายหลังว่ามีพฤติการณ์ทุจริต"
});
assert.equal(special.status, "COMPLETED");
assert.equal(special.notification.targetName, "สำนักงาน ป.ป.ช.");

freshAs("prelim.a5", "Prelim@2569");
item = command("REQUEST_MERGE_CASES", "สส-2569-0003", {
  candidateId: "สส-2569-0004",
  factsOverlap: "ข้อเท็จจริงเกี่ยวเนื่องกัน",
  accusedOverlap: "ผู้ถูกร้องกลุ่มเดียวกัน",
  reason: "เสนอรวมสำนวน"
});
expectError(409, "คำขอรวมสำนวนอื่น", () => command("REQUEST_MERGE_CASES", "สส-2569-0004", {
  candidateId: "สส-2569-0003",
  factsOverlap: "ข้อเท็จจริงเดียวกัน",
  accusedOverlap: "ผู้ถูกร้องกลุ่มเดียวกัน",
  reason: "ห้ามเสนอคำขอไขว้"
}));

freshAs("prelim.a5", "Prelim@2569");
item = command("REQUEST_MERGE_CASES", "สส-2569-0003", {
  candidateId: "สส-2569-0004",
  factsOverlap: "ข้อเท็จจริงเกี่ยวเนื่องกัน",
  accusedOverlap: "ผู้ถูกร้องกลุ่มเดียวกัน",
  reason: "เสนอรวมสำนวน"
});
command("ADD_WORKLOG", "สส-2569-0004", { date: "2026-08-02", detail: "ได้รับหลักฐานใหม่หลังเสนอรวม", reason: "บันทึกข้อมูลใหม่" });
login("secretary.a5", "Secretary@2569");
expectError(409, "ข้อมูลเปลี่ยนแปลง", () => command("DECIDE_MERGE_CASES", item.id, { decision: "APPROVED", reason: "ต้องตรวจข้อมูลล่าสุดก่อน" }));

freshAs("prelim.a5", "Prelim@2569");
item = command("REQUEST_MERGE_CASES", "สส-2569-0003", {
  candidateId: "สส-2569-0004",
  factsOverlap: "เป็นการดำเนินการต่อเนื่องในโครงการเดียวกัน",
  accusedOverlap: "มีผู้ถูกร้องกลุ่มเดียวกัน",
  reason: "เสนอรวมสำนวน"
});
login("secretary.a5", "Secretary@2569");
item = command("DECIDE_MERGE_CASES", item.id, { decision: "APPROVED", reason: "อนุมัติให้รวมสำนวน" });
const mergeRequest = item.relations.mergeRequest;
const master = currentCase(mergeRequest.proposedMasterId);
const mergedSource = currentCase(mergeRequest.proposedSourceId);
assert.equal(mergedSource.phase, "MERGED");
assert.equal(mergedSource.relations.mergedInto, master.id);
assert.ok(master.relations.mergedFrom.includes(mergedSource.id));
assert.ok(master.report213.mergedCaseProvenance.some((entry) => entry.caseId === mergedSource.id));
assert.equal(getState().cases.length, 11);

freshAs("prelim.a5", "Prelim@2569");
item = command("REQUEST_SPLIT_CASE", "สส-2569-0003", { reason: "พบการกระทำอีกส่วนที่ต้องแยกเป็นเรื่องใหม่" });
const split = item.relations.splitRequests.at(-1);
login("review.a5", "Review@2569");
item = command("REVIEW_SPLIT_CASE", item.id, { requestId: split.id, decision: "FORWARD", reason: "เห็นควรส่งดำเนินการออกเลขใหม่" });
login("caseadmin.a5", "CaseAdmin@2569");
expectError(409, "สำนวนต้นทาง", () => command("COMPLETE_SPLIT_CASE", item.id, { requestId: split.id, newCaseId: item.id, reason: "ห้ามใช้เลขเดิม" }));
expectError(409, "มีอยู่ในระบบ", () => command("COMPLETE_SPLIT_CASE", item.id, { requestId: split.id, newCaseId: "สส-2569-0004", reason: "ห้ามใช้เลขที่มีอยู่" }));
item = command("COMPLETE_SPLIT_CASE", item.id, { requestId: split.id, newCaseId: "สส-2569-0099", reason: "ศูนย์รับเรื่องร้องเรียนออกเลขใหม่แล้ว" });
assert.equal(item.relations.splitRequests.find((entry) => entry.id === split.id).newCaseId, "สส-2569-0099");

freshAs("prelim.a5", "Prelim@2569");
const scheduledNotice = getState().notifications.find((entry) => entry.recipientAccount === "prelim.a5" && entry.dueAt > getState().demoDate);
assert.ok(scheduledNotice);
expectError(409, "ยังไม่ถึงกำหนด", () => markNotificationRead(scheduledNotice.id));
const notice = getState().notifications.find((entry) => entry.recipientAccount === "prelim.a5" && !entry.readAt && entry.dueAt <= getState().demoDate);
assert.ok(notice);
const noticeCaseVersion = currentCase(notice.caseId).version;
markNotificationRead(notice.id);
assert.equal(currentCase(notice.caseId).version, noticeCaseVersion);
assert.ok(getState().notifications.find((entry) => entry.id === notice.id).readAt);

const issueTitles = currentCase("สส-2569-0003").plan.issues.map((entry) => entry.title);
assert.deepEqual(issueTitles, [
  "สถานะของผู้ถูกร้องเรียน",
  "ขอบเขตอำนาจหน้าที่ของผู้ถูกร้องเรียน",
  "การกระทำของผู้ถูกร้องเรียนถูกต้องตามอำนาจหน้าที่หรือไม่",
  "ประเด็นเกี่ยวกับความเสียหาย"
]);

const equalityState = createInitialState();
equalityState.demoDate = "2027-01-01";
const equalityCase = equalityState.cases.find((entry) => entry.id === "สส-2569-0003");
equalityCase.receivedAt = plusDays("2027-01-01", -180);
equalityCase.firstAppearanceAt = equalityCase.receivedAt;
equalityCase.report213.deadlineAt = "2027-01-01";
equalityCase.report213.extensionHistory = [1, 2].map((sequence) => ({
  id: `equality-${sequence}`,
  reportType: "213",
  sequence,
  authorityTier: sequence === 1 ? "DIRECTOR_HEAD" : "EXECUTIVE",
  requestedDays: 60,
  reason: "ทดสอบ",
  status: "APPROVED",
  checkpoints: []
}));
equalityCase.report213.exhaustion.status = "AVAILABLE";
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(equalityState));
const equalityApi = await import(`../assets/state.js?equality=${Date.now()}`);
equalityApi.authenticate("prelim.a5", "Prelim@2569");
let equalityError;
try {
  equalityApi.executeCommand("CREATE_EXHAUSTION_REPORT", equalityCase.id, {
    expectedVersion: equalityCase.version,
    reportType: "213",
    reasonAndNecessity: "ยังไม่แล้วเสร็จ",
    pastActions: "ติดตามเอกสาร",
    remainingActions: "สรุปรายงาน",
    obstacles: "รอเอกสาร",
    expectedCompletionAt: "2027-02-15",
    reason: "ทดสอบวันครบกำหนด"
  });
} catch (error) {
  equalityError = error;
}
assert.equal(equalityError?.status, 409);
assert.match(equalityError?.message || "", /เมื่อพ้นกำหนด/);

const overdueState = createInitialState();
overdueState.demoDate = "2027-01-15";
const overdueCase = overdueState.cases.find((entry) => entry.id === "สส-2569-0003");
overdueCase.receivedAt = plusDays("2027-01-01", -180);
overdueCase.firstAppearanceAt = overdueCase.receivedAt;
overdueCase.report213.deadlineAt = "2027-01-01";
overdueCase.report213.extensionHistory = [1, 2].map((sequence) => ({
  id: `overdue-${sequence}`,
  reportType: "213",
  sequence,
  authorityTier: sequence === 1 ? "DIRECTOR_HEAD" : "EXECUTIVE",
  requestedDays: 60,
  reason: "ทดสอบ",
  status: "APPROVED",
  checkpoints: []
}));
overdueCase.report213.exhaustion.status = "AVAILABLE";
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(overdueState));
const overdueApi = await import(`../assets/state.js?overdue=${Date.now()}`);
overdueApi.authenticate("prelim.a5", "Prelim@2569");
const overdueResult = overdueApi.executeCommand("CREATE_EXHAUSTION_REPORT", overdueCase.id, {
  expectedVersion: overdueCase.version,
  reportType: "213",
  reasonAndNecessity: "ยังรอเอกสารสำคัญ",
  pastActions: "ติดตามและมีหนังสือทวงถาม",
  remainingActions: "ตรวจเอกสารและสรุป",
  obstacles: "ปลายทางยังไม่ส่งเอกสาร",
  expectedCompletionAt: "2027-02-15",
  reason: "จัดทำรายงานเหตุล่าช้า"
});
assert.equal(overdueResult.report213.exhaustion.status, "AWAITING_CHAIN_OPINION");

for (const [demoDate, expectedStatus] of [["2026-08-02", 409], ["2026-08-03", 200]]) {
  const supplementalState = createInitialState();
  supplementalState.demoDate = demoDate;
  const supplementalCase = supplementalState.cases.find((entry) => entry.id === "สส-2569-0007");
  supplementalCase.report644.supplementalInquiry = {
    ...supplementalCase.report644.supplementalInquiry,
    status: "ACTIVE",
    startedAt: "2026-07-03",
    deadlineAt: "2026-08-02",
    reason: "คณะกรรมการฯ ให้ไต่สวนเพิ่มเติม"
  };
  localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(supplementalState));
  const supplementalApi = await import(`../assets/state.js?supplemental=${demoDate}-${Date.now()}`);
  supplementalApi.authenticate("inquiry.a5", "Inquiry@2569");
  let result;
  let error;
  try {
    result = supplementalApi.executeCommand("REQUEST_SUPPLEMENTAL_INQUIRY_EXTENSION", supplementalCase.id, {
      expectedVersion: supplementalCase.version,
      reason: "ยังต้องไต่สวนพยานสำคัญ"
    });
  } catch (caught) {
    error = caught;
  }
  if (expectedStatus === 409) assert.equal(error?.status, 409);
  else assert.equal(result?.report644.supplementalInquiry.status, "PENDING_BOARD");
}

const militaryState = createInitialState();
const militaryCase = militaryState.cases.find((entry) => entry.id === "สส-2569-0009");
militaryCase.handoff.status = "PENDING";
militaryCase.handoff.deliveries = [{
  target: "PROSECUTOR",
  route: "PROSECUTOR",
  label: "พนักงานอัยการ",
  status: "PENDING",
  attempts: []
}];
localStorage.setItem("activity5-mockup-state-v4", JSON.stringify(militaryState));
const militaryApi = await import(`../assets/state.js?military=${Date.now()}`);
militaryApi.authenticate("inquiry.a5", "Inquiry@2569");
const militaryPrepared = militaryApi.executeCommand("PREPARE_OUTGOING_PACKAGE", militaryCase.id, {
  expectedVersion: militaryCase.version,
  target: "PROSECUTOR",
  accusedCategory: "MILITARY",
  jurisdiction: "ศาลทหารกรุงเทพ",
  caseFileReference: "บัญชีสำนวนทหาร 1 ชุด",
  resolutionReference: "มติ 20/2569",
  inquiryReportReference: "รายงาน 644 ฉบับลงนาม",
  outgoingLetterNo: "ปปท 020/2569",
  reason: "จัดเตรียมสำนวนกรณีผู้ถูกกล่าวหาเป็นทหาร"
});
assert.equal(militaryPrepared.handoff.deliveries[0].prosecutorOffice, "พนักงานอัยการทหารตามเขตอำนาจศาลทหาร");

console.log("PASS state.test.mjs: RBAC, transfer, lead/assistant, ACK, review gates, decisions, deadlines, relations, notifications");
