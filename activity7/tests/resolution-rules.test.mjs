/* กระบวนงาน "มติไต่สวนเบื้องต้น" — Unit Tests
   เทคนิคที่ใช้: Equivalence Partitioning (EP) / Boundary Value Analysis (BVA)
                 / State Transition Testing
   อ้างอิง: กิจกรรมที่ 7-V2.0.drawio — P2 Core Workflow (T8–T14, G4, G5)
            และ P3 Exception Flows (EX-01, EX-03, EX-04, EX-09, EX-10)
   รันด้วย: node activity7/tests/resolution-rules.test.mjs                  */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const window = {};
vm.runInNewContext(readFileSync(resolve(here, "../assets/ecmis-app.js"), "utf8"), { window });
const E = window.ECMIS;

let count = 0;
const T = (id, name, fn) => {
  count++;
  try { fn(); }
  catch (e) { throw new Error(`${id} ${name}\n    → ${e.message}`); }
};

/* =======================================================================
   UT-QRM — องค์ประชุมและเกณฑ์มติ (BVA)  ม.10 / ม.12 / ม.15
   บอร์ด 7 ท่าน → องค์ประชุมขั้นต่ำ 4, เสียงข้างมากขั้นต่ำ 4
   ======================================================================= */
const q = (present, forV, extra = {}) =>
  E.boardQuorum({ inOffice: 7, present, forV, againstV: 0, abstainV: 0, ...extra });

T("UT-QRM-01", "ขอบล่างองค์ประชุม: 3 คน (min-1) ไม่ครบ", () =>
  assert.equal(q(3, 3).quorumOk, false));
T("UT-QRM-02", "ขอบองค์ประชุมพอดี: 4 คน (min) ครบ", () =>
  assert.equal(q(4, 4).quorumOk, true));
T("UT-QRM-03", "เหนือขอบ: 5 คน (min+1) ครบ", () =>
  assert.equal(q(5, 5).quorumOk, true));
T("UT-QRM-04", "ขอบบน: 7 คน (max) ครบ", () =>
  assert.equal(q(7, 7).quorumOk, true));
T("UT-QRM-05", "องค์ประชุมขั้นต่ำของบอร์ด 7 ท่าน = 4", () =>
  assert.equal(q(7, 7).quorumMin, 4));

T("UT-QRM-06", "เสียงข้างมากขั้นต่ำ = 4 (กึ่งหนึ่งของ 7 ปัดลง +1)", () =>
  assert.equal(q(7, 7).majorityMin, 4));
T("UT-QRM-07", "เห็นด้วย 3 (min-1) ไม่ผ่านเกณฑ์มติ", () =>
  assert.equal(q(7, 3).majorityOk, false));
T("UT-QRM-08", "เห็นด้วย 4 (min) ผ่านเกณฑ์มติ", () =>
  assert.equal(q(7, 4).majorityOk, true));

T("UT-QRM-09", "ม.15 นับจากกรรมการทั้งหมด ไม่ใช่ผู้เข้าประชุม", () => {
  /* เข้าประชุม 4 เห็นด้วยทั้ง 4 → ครบองค์ประชุมและได้เสียงข้างมากพอดี */
  assert.equal(q(4, 4).canRecord, true);
  /* เข้าประชุม 4 เห็นด้วย 3 → ครบองค์ประชุม แต่ยังไม่ถึงเสียงข้างมากของ 7 */
  const r = q(4, 3);
  assert.equal(r.quorumOk, true);
  assert.equal(r.majorityOk, false);
  assert.equal(r.blockedBy, "M15_NO_MAJORITY");
});

T("UT-QRM-10", "ม.15 ว.2 ประธานชี้ขาดเมื่อคะแนนเท่ากัน", () => {
  const tied = E.boardQuorum({ inOffice: 7, present: 6, forV: 3, againstV: 3 });
  assert.equal(tied.tie, true);
  assert.equal(tied.majorityOk, false, "ยังไม่ชี้ขาด → ยังไม่ถึงเสียงข้างมาก");
  const broken = E.boardQuorum({ inOffice: 7, present: 6, forV: 3, againstV: 3, chairBreaksTie: true });
  assert.equal(broken.effectiveFor, 4);
  assert.equal(broken.majorityOk, true, "ประธานออกเสียงเพิ่ม 1 → ครบ 4 เสียง");
});

T("UT-QRM-11", "ม.10 กรรมการเหลือ 4 คน (min-1) บอร์ดทำหน้าที่ไม่ได้", () => {
  const r = E.boardQuorum({ inOffice: 4, present: 4, forV: 4 });
  assert.equal(r.boardValid, false);
  assert.equal(r.canRecord, false);
  assert.equal(r.blockedBy, "M10_BOARD_INCOMPLETE");
});
T("UT-QRM-12", "ม.10 กรรมการเหลือ 5 คน (min) บอร์ดทำหน้าที่ได้", () =>
  assert.equal(E.boardQuorum({ inOffice: 5, present: 3, forV: 3 }).boardValid, true));

T("UT-QRM-13", "ม.20 ผู้ถูกกันออกยังนับเป็นกรรมการที่มีอยู่", () => {
  /* กัน 1 ท่าน → เข้าประชุมเหลือ 6 แต่ฐานคำนวณยังเป็น 7 */
  const r = E.boardQuorum({ inOffice: 7, present: 6, forV: 4 });
  assert.equal(r.majorityMin, 4, "ฐานต้องไม่ลดลงตามจำนวนผู้ถูกกันออก");
  assert.equal(r.canRecord, true);
});

/* =======================================================================
   UT-ST — State Transition Testing
   ======================================================================= */
const K = (o = {}) => ({ chainOpinions: [], complex: false, urgent: false, ...o });

/* ---- Valid transitions ---- */
T("UT-ST-01", "PENDING_CHAIR_OF → PENDING_CHAIRMAN (T8→G4)", () =>
  assert.equal(E.canTransition("PENDING_CHAIR_OF", "PENDING_CHAIRMAN",
    K({ actorRoleId: "chair_office" })).ok, true));

T("UT-ST-02", "PENDING_CHAIRMAN → IN_SCREENING (G4 ส่งกลั่นกรองปกติ)", () =>
  assert.equal(E.canTransition("PENDING_CHAIRMAN", "IN_SCREENING",
    K({ actorRoleId: "chairman" })).ok, true));

T("UT-ST-03", "IN_SCREENING → AGENDA_SET (T10→T11→T12)", () =>
  assert.equal(E.canTransition("IN_SCREENING", "AGENDA_SET",
    K({ actorRoleId: "subcommittee" })).ok, true));

T("UT-ST-04", "AGENDA_SET → IN_MEETING (T13 เปิดวาระ)", () =>
  assert.equal(E.canTransition("AGENDA_SET", "IN_MEETING",
    K({ actorRoleId: "board_sec" })).ok, true));

T("UT-ST-05", "IN_MEETING → RESOLVED_PENDING เมื่อองค์ประชุมครบ", () =>
  assert.equal(E.canTransition("IN_MEETING", "RESOLVED_PENDING",
    K({ actorRoleId: "board_sec", quorumOk: true })).ok, true));

/* ---- Guard failures ---- */
T("UT-ST-06", "EX-04: องค์ประชุมไม่ครบ → บันทึกมติไม่ได้", () => {
  const r = E.canTransition("IN_MEETING", "RESOLVED_PENDING",
    K({ actorRoleId: "board_sec", quorumOk: false }));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "GUARD_FAILED");
});

T("UT-ST-07", "EX-09 A: สั่งบรรจุวาระด่วนไม่ได้ถ้า ผอ.กบค. ยังไม่รับรองใบด่วน", () => {
  const r = E.canTransition("PENDING_CHAIRMAN", "AGENDA_SET",
    K({ actorRoleId: "chairman", urgent: true, urgentCertified: false }));
  assert.equal(r.ok, false, "ไม่มีลายเซ็นรับรอง = Bypass ต้องทำไม่ได้");
  const ok = E.canTransition("PENDING_CHAIRMAN", "AGENDA_SET",
    K({ actorRoleId: "chairman", urgent: true, urgentCertified: true }));
  assert.equal(ok.ok, true);
});

T("UT-ST-08", "EX-03: กลับเข้าวาระหลังเลื่อน ต้องมีเลขวาระใหม่", () => {
  assert.equal(E.canTransition("DEFERRED", "AGENDA_SET",
    K({ actorRoleId: "affairs", newAgendaNo: null })).ok, false);
  assert.equal(E.canTransition("DEFERRED", "AGENDA_SET",
    K({ actorRoleId: "affairs", newAgendaNo: "5.12" })).ok, true);
});

T("UT-ST-09", "TOR 7.2.1.5: ปิดสำนวนไม่ได้ถ้ายังไม่อัปโหลดไฟล์สแกนฉบับลงนาม", () => {
  assert.equal(E.canTransition("DISPATCHING", "CLOSED",
    K({ actorRoleId: "owner", signedScanUploaded: false })).ok, false);
  assert.equal(E.canTransition("DISPATCHING", "CLOSED",
    K({ actorRoleId: "owner", signedScanUploaded: true })).ok, true);
});

T("UT-ST-10", "ปลายทางภายในไม่เข้าสถานะรอไฟล์สแกน", () => {
  const external = E.canTransition("RESOLVED", "DISPATCHING",
    K({ actorRoleId: "owner", resolution: "FORWARD", forwardTo: "NACC" }));
  assert.equal(external.ok, true, "ส่ง ป.ป.ช. = ปลายทางนอกองค์กร");
  const internal = E.canTransition("RESOLVED", "DISPATCHING",
    K({ actorRoleId: "owner", resolution: "FORWARD", forwardTo: "SCREENING" }));
  assert.equal(internal.ok, false, "คณะอนุกลั่นกรองฯ = ปลายทางภายใน");
});

/* ---- Invalid transitions (ต้องถูกปฏิเสธ) ---- */
T("UT-ST-11", "ห้ามข้ามการประชุม: AGENDA_SET → RESOLVED", () =>
  assert.equal(E.canTransition("AGENDA_SET", "RESOLVED", K()).reason, "NO_SUCH_TRANSITION"));

T("UT-ST-12", "ห้ามข้ามชั้นประธานฯ: PENDING_SECGEN → AGENDA_SET", () =>
  assert.equal(E.canTransition("PENDING_SECGEN", "AGENDA_SET", K()).reason, "NO_SUCH_TRANSITION"));

T("UT-ST-13", "ห้ามย้อนกลับ: CLOSED → IN_MEETING", () =>
  assert.equal(E.canTransition("CLOSED", "IN_MEETING", K()).reason, "NO_SUCH_TRANSITION"));

T("UT-ST-14", "ห้ามข้ามการล็อก PDF: IN_MEETING → CLOSED", () =>
  assert.equal(E.canTransition("IN_MEETING", "CLOSED", K()).reason, "NO_SUCH_TRANSITION"));

T("UT-ST-15", "สถานะที่ไม่มีอยู่จริงต้องถูกปฏิเสธ ไม่ใช่ throw", () => {
  assert.equal(E.canTransition("BANANA", "CLOSED", K()).reason, "UNKNOWN_FROM_STATE");
  assert.equal(E.canTransition("CLOSED", "BANANA", K()).reason, "UNKNOWN_TO_STATE");
});

/* ---- Actor / RBAC (EP: ผู้กระทำถูกบทบาท vs ผิดบทบาท) ---- */
T("UT-ST-16", "บทบาทผิดต้องถูกปฏิเสธพร้อมบอกบทบาทที่ถูก", () => {
  const r = E.canTransition("PENDING_CHAIRMAN", "IN_SCREENING",
    K({ actorRoleId: "owner" }));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "WRONG_ACTOR");
  assert.ok(Array.from(r.expected).includes("chairman"));
});

T("UT-ST-17", "เจ้าของสำนวนเปิดวาระประชุมแทนฝ่ายเลขานุการไม่ได้", () =>
  assert.equal(E.canTransition("AGENDA_SET", "IN_MEETING",
    K({ actorRoleId: "owner" })).reason, "WRONG_ACTOR"));

/* ---- nextStates ---- */
T("UT-ST-18", "จาก IN_MEETING มีทางออก 2 ทาง: บันทึกมติ / เลื่อนวาระ", () => {
  /* Array.from — อาร์เรย์ที่คืนจาก vm อยู่คนละ realm จึงไม่ deep-equal กับ literal */
  const outs = Array.from(E.nextStates("IN_MEETING", K({ quorumOk: true })), s => s.to).sort();
  assert.deepEqual(outs, ["DEFERRED", "RESOLVED_PENDING"]);
});
T("UT-ST-19", "องค์ประชุมไม่ครบ เหลือทางออกเดียวคือเลื่อนวาระ", () => {
  const outs = Array.from(E.nextStates("IN_MEETING", K({ quorumOk: false })), s => s.to);
  assert.deepEqual(outs, ["DEFERRED"]);
});

/* =======================================================================
   UT-EP — Equivalence Partitioning: ประเภทผลมติและปลายทาง
   ======================================================================= */
T("UT-EP-01", "มติครบ 5 ทางออกตามแบบฟอร์มมติไต่สวนเบื้องต้น", () => {
  const codes = E.RESOLUTIONS.map(r => r.code);
  ["ACCEPT_S24P1", "ACCEPT_S24P3", "REJECT", "MORE_INVESTIGATE", "FORWARD"]
    .forEach(c => assert.ok(codes.includes(c), `ขาดมติ ${c}`));
});

T("UT-EP-02", "ผู้ลงนามคำสั่งแยกตามวรรคของ ม.24", () => {
  assert.equal(E.RESOLUTIONS.find(r => r.code === "ACCEPT_S24P1").signer, "เลขาธิการฯ");
  assert.equal(E.RESOLUTIONS.find(r => r.code === "ACCEPT_S24P3").signer, "ประธานกรรมการ ป.ป.ท.");
});

T("UT-EP-03", "ปลายทาง FORWARD: valid partition = 3 ค่า, invalid = คืน null", () => {
  ["NACC", "SCREENING", "LEGAL"].forEach(c =>
    assert.ok(E.forwardTarget(c), `ควรรู้จักปลายทาง ${c}`));
  assert.equal(E.forwardTarget("UNKNOWN"), null);
  assert.equal(E.forwardTarget(""), null);
});

T("UT-EP-04", "เฉพาะปลายทางนอกองค์กรที่บังคับอัปโหลดไฟล์สแกน", () => {
  assert.equal(E.forwardTarget("NACC").requireSignedScan, true);
  assert.equal(E.forwardTarget("SCREENING").requireSignedScan, false);
  assert.equal(E.forwardTarget("LEGAL").requireSignedScan, false);
});

T("UT-EP-05", "SLA ปลายทาง: ป.ป.ช. 30 วัน / ภายใน 15 วัน", () => {
  assert.equal(E.forwardTarget("NACC").slaDays, 30);
  assert.equal(E.forwardTarget("SCREENING").slaDays, 15);
});

/* =======================================================================
   UT-SLA — BVA บนเพดาน SLA ชั้นเลขาธิการฯ (ต้นทางของกระบวนงานมติ)
   ======================================================================= */
T("UT-SLA-01", "213 รอลงนาม: 4 (max-1) ปกติ / 5 (max) เตือน / 6 เกินกำหนด", () => {
  assert.equal(E.slaClass(4, 5), "sla-warn", "เหลือ <2 วันเข้าโซนเตือนแล้ว");
  assert.notEqual(E.slaClass(5, 5), "sla-late", "ใช้ครบพอดียังไม่ถือว่าเกิน");
  assert.equal(E.slaClass(6, 5), "sla-late");
});
T("UT-SLA-02", "644 เพดาน 15 วัน: 15 ยังไม่เกิน / 16 เกิน", () => {
  assert.notEqual(E.slaClass(15, 15), "sla-late");
  assert.equal(E.slaClass(16, 15), "sla-late");
});
T("UT-SLA-03", "0 วัน = สภาวะปกติ (ขอบล่าง)", () =>
  assert.equal(E.slaClass(0, 5), "sla-ok"));

/* =======================================================================
   UT-M28 — มติโดยปริยายของเลขาธิการฯ (EX-10 / ม.28)
   ======================================================================= */
T("UT-M28-01", "รอบรายงาน = 15 วัน และเกณฑ์บอร์ดนิ่ง = 15 วัน", () => {
  assert.equal(E.M28.cycleDays, 15);
  assert.equal(E.M28.boardSilenceDays, 15);
});
T("UT-M28-02", "คิว ม.28 มีเฉพาะเรื่องที่ยังไม่ได้รายงานบอร์ด", () =>
  assert.ok(E.m28Pending().every(c => c.m28.reported === false)));

console.log(`resolution-rules: ${count} assertions groups passed`);
