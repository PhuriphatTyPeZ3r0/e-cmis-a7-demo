/* กฎธุรกิจฝั่งเลขาธิการคณะกรรมการ ป.ป.ท. — กิจกรรมที่ 7.1 การไต่สวนเบื้องต้น
   อ้างอิง: กิจกรรมที่ 7-V2.0.drawio หน้า "TO-BE P2 Core Workflow (Swimlane)"
            Lane L3 · โหนด T5 (S1) / G1 / G3 และ G5
   รันด้วย: node activity7/tests/secgen-rules.test.mjs                      */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../assets/ecmis-app.js"), "utf8");

/* ecmis-app.js เป็น IIFE ที่แขวน API ไว้บน window — จำลอง window ให้พอรันได้
   (document/sessionStorage ถูกใช้เฉพาะในฟังก์ชันวาดหน้าจอ จึงไม่ต้อง stub) */
const window = {};
vm.runInNewContext(source, { window });
const ECMIS = window.ECMIS;

/* ---------------------------------------------------------------------
   G1 — ผังเขียนว่า "เป็นเรื่องยุ่งยากซับซ้อน *หรือ* ความเห็นในสาย
   บังคับบัญชาไม่ตรงกัน" เงื่อนไขหลังเป็นข้อเท็จจริงที่ระบบตรวจได้เอง
   --------------------------------------------------------------------- */
const diverged = ECMIS.g1Triggers(ECMIS.getCase("1547/2568"));
assert.equal(diverged.diverged, true, "1547/2568 มีความเห็นต่างกันในสายบังคับบัญชา");
assert.equal(diverged.complex, false, "เคสนี้ไม่ได้ถูกตั้ง complex ไว้ล่วงหน้า");
assert.equal(diverged.required, true, "เงื่อนไขที่ 2 เพียงข้อเดียวต้องพาเข้าคณะอนุสนับสนุนฯ ได้");

const split = ECMIS.chainDivergence(ECMIS.getCase("1547/2568")).split;
assert.equal(split.from.roleId, "section_head");
assert.equal(split.to.roleId, "director", "ต้องชี้ชั้นแรกที่ความเห็นเริ่มแตกได้ถูกต้อง");

const aligned = ECMIS.g1Triggers(ECMIS.getCase("1615/2568"));
assert.equal(aligned.diverged, false, "1615/2568 ความเห็นตรงกันทุกชั้น");
assert.equal(aligned.required, false, "ความเห็นตรงกัน + ไม่ซับซ้อน ต้องไม่เข้า G1");

assert.equal(
  ECMIS.g1Triggers({ ...ECMIS.getCase("1615/2568"), complex: true }).required, true,
  "ดุลพินิจ 'ซับซ้อน' ของเลขาธิการฯ ต้องบังคับ G1 ได้ แม้ความเห็นตรงกัน");

assert.equal(
  ECMIS.g1Triggers({ chainOpinions: [], complex: false }).diverged, false,
  "สำนวนที่ยังไม่มีความเห็นบันทึกไว้ ต้องไม่ถูกตัดสินว่าความเห็นแตก");

/* ---------------------------------------------------------------------
   SLA ชั้นเลขาธิการฯ — ผังกำหนดไว้ 2 ระยะ และค่าต่างกันตามชนิดรายงาน
   213: รอลงนาม 5 / ลงนามเสร็จ 3   |   644: เสนอ 15 / ลงนาม 15
   --------------------------------------------------------------------- */
/* spread ก่อนเทียบ — อ็อบเจกต์จาก vm อยู่คนละ realm จึงไม่ reference-equal กับ literal */
assert.deepEqual({ ...ECMIS.DOC_TYPES["213"].sla }, { waitSign: 5, completeSign: 3 });
assert.deepEqual({ ...ECMIS.DOC_TYPES["644"].sla }, { waitSign: 15, completeSign: 15 });

assert.equal(ECMIS.effectiveSlaLimit(ECMIS.getCase("1547/2568")), 5,
  "รายงาน 213 ที่รอลงนาม ต้องใช้เพดาน 5 วัน");
assert.equal(ECMIS.effectiveSlaLimit(ECMIS.getCase("1615/2568")), 15,
  "รายงาน 644 ที่รอลงนาม ต้องใช้เพดาน 15 วัน");

/* เพดานของชั้นเลขาธิการฯ ต้องไม่ไปทับ SLA ของขั้นตอนอื่น */
const screening = ECMIS.getCase("1588/2568");
assert.equal(ECMIS.effectiveSlaLimit(screening), screening.slaLimit,
  "สำนวนที่อยู่ชั้นอนุกลั่นกรองฯ ต้องยังใช้ SLA เดิมของขั้นนั้น");

/* กันการถดถอย: 644 ที่ใช้ไป 11 วันต้องไม่ถูกตีว่าเกินกำหนดด้วยเพดาน 213 */
assert.notEqual(
  ECMIS.slaClass(screening.slaDays, ECMIS.effectiveSlaLimit(screening)), "sla-late");
const r644 = ECMIS.getCase("1615/2568");
assert.notEqual(ECMIS.slaClass(r644.slaDays, ECMIS.effectiveSlaLimit(r644)), "sla-late",
  "644 ใช้ไป 11 จาก 15 วัน ยังไม่เกินกำหนด");

/* ---------------------------------------------------------------------
   ม.28 — เลขาธิการฯ สั่งรับ/ไม่รับเบื้องต้น แล้วรายงานบอร์ดทุก 15 วัน
   --------------------------------------------------------------------- */
assert.equal(ECMIS.M28.cycleDays, 15);
assert.equal(ECMIS.M28.boardSilenceDays, 15);
assert.ok(ECMIS.m28Pending().length > 0, "ต้องมีสำนวนรอเข้ารอบรายงานให้เห็นในต้นแบบ");
assert.ok(ECMIS.m28Pending().every((c) => c.m28.reported === false),
  "คิว ม.28 ต้องมีเฉพาะเรื่องที่ยังไม่ได้รายงานบอร์ด");
assert.equal(ECMIS.m28Pending().some((c) => c.id === "1490/2568"), false,
  "เรื่องที่รายงานบอร์ดไปแล้วต้องหลุดออกจากคิว");

/* ---------------------------------------------------------------------
   G5 — ทางออกของมติ และผู้ลงนามตาม ม.24
   --------------------------------------------------------------------- */
/* แบบฟอร์ม "มติการประชุม ไต่สวนเบื้องต้น.docx" ใน Drive เขียนบรรทัดนี้เป็น
   ช่องว่างปลายทางเดียว จึงต้องเป็นมติเดียวที่เลือกปลายทางได้ ไม่ใช่มติแยกชนิด */
const forward = ECMIS.RESOLUTIONS.find((r) => r.code === "FORWARD");
assert.ok(forward, "ต้องคงมติ FORWARD ไว้ตามแบบฟอร์มจริง");
assert.equal(forward.needsDestination, true, "มติ FORWARD ต้องบังคับเลือกปลายทาง");

const nacc = ECMIS.forwardTarget("NACC");
assert.equal(nacc.external, true, "ป.ป.ช. เป็นปลายทางนอกองค์กร");
/* [F-02] นาฬิกาสองเรือน — 15 วันคือกำหนดส่งตามกฎหมาย (ม.18/1) ขยายไม่ได้
   ส่วน 30 วันคือกรอบกำกับติดตามของกิจกรรมที่ 8 (CHK011) มิใช่กำหนดส่ง */
assert.equal(nacc.statutorySlaDays, 15,
  "ม.18/1 (ก)(3)/(ข)(1)/(ข)(3) — ส่งสำนวนให้ ป.ป.ช. ภายใน 15 วัน");
assert.equal(nacc.trackingSlaDays, 30,
  "เล่ม 6 กิจกรรมที่ 8 CHK011 — กรอบกำกับติดตาม 30 วันนับแต่วันที่ได้รับมติ");
assert.equal(nacc.requireArchiveCopy, true,
  "ม.18/1 บังคับคัดสำเนาสำนวนเก็บรักษาไว้เป็นหลักฐาน");
assert.equal(nacc.requireSignedScan, true,
  "ปลายทางนอกองค์กรต้องบังคับอัปโหลดไฟล์สแกนฉบับลงนามกลับ (TOR 7.2.1.5)");
assert.equal(ECMIS.forwardTarget("SCREENING").external, false,
  "คณะอนุกลั่นกรองฯ เป็นปลายทางภายใน จึงไม่ต้องอัปโหลดไฟล์สแกน");
assert.equal(ECMIS.forwardTarget("SCREENING").requireSignedScan, false);
assert.equal(ECMIS.forwardTarget("SCREENING").statutorySlaDays, undefined,
  "ปลายทางภายในไม่อยู่ใต้ ม.18/1 จึงต้องไม่มีกำหนดส่งตามกฎหมาย");

assert.equal(ECMIS.RESOLUTIONS.find((r) => r.code === "ACCEPT_S24P1").signer, "เลขาธิการฯ",
  "ม.24 ว.1 องค์คณะพนักงาน ป.ป.ท. — เลขาธิการฯ เป็นผู้แต่งตั้ง");
assert.equal(ECMIS.RESOLUTIONS.find((r) => r.code === "ACCEPT_S24P3").signer, "ประธานกรรมการ ป.ป.ท.",
  "ม.24 ว.3 คณะอนุกรรมการไต่สวน — บอร์ดแต่งตั้ง เลขาธิการฯ เป็นเพียงผู้เสนอแนะ");

/* ---------------------------------------------------------------------
   ขอบเขต — กิจกรรมที่ 7 เริ่มนับที่เลขาธิการฯ เท่านั้น
   --------------------------------------------------------------------- */
assert.equal(ECMIS.isUpstreamRole("secgen"), false, "เลขาธิการฯ คือจุดเริ่มของกิจกรรมที่ 7");
assert.equal(ECMIS.isUpstreamRole("deputy_sg"), true, "รองเลขาธิการฯ ยังอยู่ในกิจกรรมที่ 5");
assert.equal(ECMIS.isUpstreamRole("deputy"), true, "ผู้ช่วยเลขาธิการฯ ยังอยู่ในกิจกรรมที่ 5");

assert.equal(ECMIS.canAct(ECMIS.getCase("1610/2568"), "secgen"), false,
  "สำนวนที่ยังร่างอยู่ในกอง/เขต เลขาธิการฯ ต้องยังสั่งการไม่ได้");
assert.equal(ECMIS.canAct(ECMIS.getCase("1547/2568"), "secgen"), true,
  "สำนวนที่เสนอถึงเลขาธิการฯ แล้ว ต้องสั่งการได้");

console.log("secgen-rules: all assertions passed");
