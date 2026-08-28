/* ==========================================================================
   cases.js — ทะเบียนเคสกลางของ ecmis-transform
   store: localStorage "ecmis-transform-cases-v1"  ·  events: "…-events-v1"

   ประวัติการแก้ 2026-08-17
   1) getCase() เดิม return seed ให้ "ทุก" id (บรรทัดสุดท้ายเป็น return ECMIS_SEED_CASE
      แบบไม่มีเงื่อนไข) ทำให้ขอเคสอะไรก็ได้ 0001/2569 กลับมา → เปลี่ยนเป็น strict คืน null
   2) ก7/ก10 (assets/ecmis-app.js) สั่ง `global.ECMIS = {…}` ทับทั้งก้อน ทำให้
      ECMIS.saveCase / addEvent / getEvents ที่ไฟล์นี้ติดตั้งไว้ "หายทั้งหมด"
      → ย้าย API หลักไปอยู่ใต้ ECMISHub ซึ่งไม่มีใครแตะ แล้วเย็บ ECMIS.* กลับซ้ำ
        หลังสคริปต์อื่นโหลดเสร็จ (re-attach) เพื่อรองรับโค้ดเดิมที่เรียก ECMIS.getCase
   3) global `getCase` ถูกประกาศซ้ำ 3 ที่ (ไฟล์นี้ + ก7 + ก10) ตัวที่โหลดหลังทับตัวหน้า
      → โค้ดกลาง (case-bar / pipe-buttons) ต้องเรียกผ่าน ECMISHub เท่านั้น
   ========================================================================== */

var CASES_STORE_KEY  = "ecmis-transform-cases-v1";
var EVENTS_STORE_KEY = "ecmis-transform-events-v1";


var ECMIS_SEED_CASE = {
  id: "0001/2569",
  trackingNo: "69-0001",
  pin: "1234",
  subject: "กรณีร้องเรียนการทุจริตจัดซื้อจัดจ้าง อบต.บางเลน",
  title: "กรณีร้องเรียนการทุจริตจัดซื้อจัดจ้าง อบต.บางเลน",
  complainant: "นายสมชาย ใจซื่อ",
  accused: "นายวิชัย ยอดทอง (นายช่างโยธา กรมป่าไม้)",
  agency: "องค์การบริหารส่วนตำบลบางเลน / กรมป่าไม้",
  status: "อยู่ระหว่างไต่สวน (213)",
  investigator: "พ.ต.ท.สมศักดิ์ ใจดี",
  zone: "เขต 1 ภาคกลาง",
  sla213: "เหลือ 22 วัน",
  legalBase: "ม.18/4",
  owner: "นายสุพจน์ รับเรื่อง",
  ownerLogin: "intake.officer",
  at: "intake-investigation",
  ownerOrg: "ศูนย์รับเรื่องร้องเรียน (ศรร.)",
  allegation: "อนุมัติจัดจ้างและตรวจรับงานก่อสร้างถนน คสล. งบประมาณ 1,240,000 บาท ทั้งที่งานไม่ได้มาตรฐานและไม่เป็นไปตามแบบแปลน",
  receivedDate: "2568-10-08",
  docType: "213",
  signPhase: "WAIT",
  slaDays: 2,
  slaLimit: 5,
  related: {
    witnessNo: "WP-2569-000464",
    boardAgenda: "วาระ 5.4 ประชุม 36/2569 (5 พ.ค. 2569)",
    chkCase: "CHK-69-0001 (กรมศิลปากร ขอเครื่องราชฯ)",
    warrantNo: "ศท-2569-0012",
    legalCase: "คดีดำ อท. 123/2569"
  }
};

/* ---- สำนวนอื่นในระบบ — ให้คิวงานของแต่ละคนมีของจริงให้แสดง
   `at`         = ตอนนี้สำนวนอยู่ที่กิจกรรมไหน
   `ownerLogin` = ใครถือสำนวน (ตรงกับบัญชีใน shared-assets/auth.js)             */
var ECMIS_SEED_MORE = [
  // ── เดิม 7 เคส + เติมให้ครบทุกกิจกรรมเหมือนข้อมูลจริง (รวม ~24 เคส) ──
  { id:"0007/2569", subject:"เรียกรับเงินเพื่อออกใบอนุญาตก่อสร้าง",
    accused:"นายอาทิตย์ ส่องแสง (เจ้าพนักงานท้องถิ่น)", agency:"เทศบาลตำบลบ้านโป่ง",
    complainant:"นางสาวมาลี ดอกไม้", status:"รับเรื่องใหม่ รอกลั่นกรอง",
    owner:"นายสุพจน์ รับเรื่อง", ownerLogin:"intake.officer", ownerOrg:"ศูนย์รับเรื่องร้องเรียน (ศรร.)",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-14",
    docType:"รับเรื่อง", sla213:"เหลือ 12 วัน", slaDays:12, slaLimit:15 },

  { id:"0012/2569", subject:"ทุจริตโครงการอาหารกลางวันโรงเรียน",
    accused:"นางแก้ว นามสมมติ (ผอ.โรงเรียน)", agency:"สพป. นครปฐม เขต 2",
    complainant:"ผู้ปกครองนักเรียน (ไม่ประสงค์ออกนาม)", status:"ถูกตีกลับ — รอแก้ไขเพิ่มเติม",
    owner:"นายสุพจน์ รับเรื่อง", ownerLogin:"intake.officer", ownerOrg:"ศูนย์รับเรื่องร้องเรียน (ศรร.)",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-06-02",
    docType:"213", returned:true, sla213:"เกินกำหนด 3 วัน", slaDays:-3, slaLimit:15 },

  { id:"0018/2569", subject:"เจ้าหน้าที่เรียกรับเงินค่าธรรมเนียมออกใบอนุญาตก่อสร้างเกินอัตราที่กำหนด",
    accused:"นายดนัย อนุญาตดี (นายช่างโยธาชำนาญงาน)", agency:"เทศบาลนครนนทบุรี",
    complainant:"นายวินัย สร้างบ้าน", status:"รอ ผอ.ศรร. พิจารณาสั่งการ",
    owner:"นายสุพจน์ รับเรื่อง", ownerLogin:"intake.officer", ownerOrg:"ศูนย์รับเรื่องร้องเรียน (ศรร.)",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-10", docType:"รับเรื่อง", slaDays:8, slaLimit:15 },

  { id:"0024/2569", subject:"ทุจริตจัดซื้อครุภัณฑ์คอมพิวเตอร์โรงเรียน ราคาสูงเกินจริง",
    accused:"นางสาวรัตนา จัดซื้อดี (เจ้าพนักงานพัสดุ)", agency:"สำนักงานเขตพื้นที่การศึกษานครปฐม เขต 1",
    complainant:"คณะครูโรงเรียนวัดบางเลน", status:"รอ ผอ.กบค. อนุมัติออกเลขสำนวน",
    owner:"นายสุพจน์ รับเรื่อง", ownerLogin:"intake.officer", ownerOrg:"ศูนย์รับเรื่องร้องเรียน (ศรร.)",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-07-22", docType:"213", slaDays:5, slaLimit:15 },

  { id:"0033/2569", subject:"ออกโฉนดที่ดินทับที่สาธารณประโยชน์ 8 ไร่",
    accused:"นายมนตรี ที่ดินงาม (เจ้าพนักงานที่ดินชำนาญการ)", agency:"สำนักงานที่ดินจังหวัดนครปฐม",
    complainant:"องค์การบริหารส่วนตำบลบางปลา", status:"อยู่ระหว่างไต่สวน (213) — ใกล้ครบกำหนด",
    owner:"พ.ต.ท.สมศักดิ์ ใจดี", ownerLogin:"intake.officer", ownerOrg:"สนง. ป.ป.ท. เขต 1",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-06-18", docType:"213", slaDays:2, slaLimit:15, urgent:true },

  { id:"0041/2569", subject:"ซ้ำ — ร้องเรียนจัดซื้อวัสดุสำนักงาน อบต.บางเลน (เรื่องซ้ำกับ 0001/2569)",
    accused:"นายวิชัย ยอดทอง (นายช่างโยธา)", agency:"อบต.บางเลน",
    complainant:"นายสมชาย ใจซื่อ", status:"ตรวจพบเรื่องซ้ำ — รอรวมสำนวน",
    owner:"นายสุพจน์ รับเรื่อง", ownerLogin:"intake.officer", ownerOrg:"ศูนย์รับเรื่องร้องเรียน (ศรร.)",
    at:"intake-investigation", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-16", docType:"รับเรื่อง", slaDays:10, slaLimit:15, duplicateOf:"0001/2569" },

  { id:"0147/2568", subject:"ทุจริตจัดซื้อเวชภัณฑ์โรงพยาบาลรัฐ สูงเกินจริง",
    accused:"นายแพทย์สมชาย บริหารดี (ผอ.โรงพยาบาล)", agency:"โรงพยาบาลศูนย์แห่งหนึ่ง",
    complainant:"บัตรสนเท่ห์", status:"รอเลขาธิการพิจารณา (ก7)",
    owner:"นายธนกฤต บุญมี", ownerLogin:"Thanakrit.B", ownerOrg:"กองบริหารคดี",
    at:"board-resolution", zone:"เขต 3 ภาคอีสาน", receivedDate:"2568-09-20", docType:"213", slaDays:9, slaLimit:15 },

  { id:"2015/2569", subject:"ฮั้วประมูลงานก่อสร้างถนนลาดยาง",
    accused:"นายชูชาติ ชนะศึก (ผอ.กองช่าง)", agency:"อบจ. ราชบุรี",
    complainant:"บริษัทผู้เข้าประมูลรายอื่น", status:"รอบรรจุวาระคณะกรรมการ ป.ป.ท. (644)",
    owner:"นายธนกฤต บุญมี", ownerLogin:"Thanakrit.B", ownerOrg:"กองบริหารคดี",
    at:"board-resolution", zone:"เขต 7 ภาคตะวันตก", receivedDate:"2568-12-19",
    docType:"644", sla213:"เหลือ 8 วัน" },

  { id:"1547/2568", subject:"ปลอมเอกสารเบิกจ่ายค่าเดินทางราชการ",
    accused:"นายมานะ พากเพียร (นักวิชาการชำนาญการ)", agency:"กรมพัฒนาฝีมือแรงงาน",
    complainant:"หน่วยตรวจสอบภายใน", status:"มีมติชี้มูลวินัย — ส่งต้นสังกัด",
    owner:"นางสาวปิยะดา ตรวจสอบ", ownerLogin:"chk.officer", ownerOrg:"กองบริหารคดี",
    at:"person-screening", zone:"ส่วนกลาง", receivedDate:"2568-03-11",
    docType:"มติ", resolution:"ชี้มูลวินัย" },

  { id:"0123/2569", subject:"เรียกรับผลประโยชน์ในการอนุมัติสัมปทาน",
    accused:"นายวิชัย ยอดทอง", agency:"กรมป่าไม้",
    complainant:"ผู้ประกอบการรายหนึ่ง", status:"อยู่ระหว่างการพิจารณาของอัยการ",
    owner:"นายเอกพงศ์ วินิจฉัย", ownerLogin:"legal.officer", ownerOrg:"กองกฎหมาย",
    at:"legal-case", zone:"ส่วนกลาง", receivedDate:"2568-09-30",
    docType:"สำนวนอัยการ", legalCase:"คดีดำ อท. 123/2569" },

  { id:"0088/2569", subject:"ข่มขู่พยานในคดีจัดซื้อเวชภัณฑ์",
    accused:"ผู้มีอิทธิพลในพื้นที่", agency:"โรงพยาบาลชุมชนแห่งหนึ่ง",
    complainant:"พยานในสำนวน 0001/2569", status:"รอพิจารณาคำขอคุ้มครองพยาน",
    owner:"นางสาวธันธิตา คุ้มภัย", ownerLogin:"wp.officer", ownerOrg:"สำนักคุ้มครองพยาน",
    at:"witness-protection", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-01",
    docType:"คบ.1", witnessNo:"WP-2569-000464", slaDays:5, slaLimit:15 },

  // ── board-resolution เพิ่มเติม (ให้เลขาธิการ/อนุกลั่นกรองมีงานครบ) ──
  { id:"0228/2569", subject:"อนุมัติโครงการขุดลอกคลองโดยมิชอบ เอื้อประโยชน์ผู้รับจ้างรายเดียว",
    accused:"นายประเสริฐ ขุดลอกดี (นายก อบต.)", agency:"อบต.บางเลน",
    complainant:"ชาวบ้านตำบลบางเลน", status:"บอร์ดมีมติรับไต่สวน — รอออกคำสั่ง ม.24",
    owner:"นางสาวศิริพร กิจการ", ownerLogin:"Siriporn.K", ownerOrg:"กองบริหารคดี",
    at:"board-resolution", zone:"เขต 1 ภาคกลาง", receivedDate:"2568-08-11", docType:"213", slaDays:4, slaLimit:15, resolution:"ACCEPT_S24P1" },

  { id:"0391/2569", subject:"ทุจริตเงินอุดหนุนโรงเรียนเอกชน 4.5 ล้านบาท",
    accused:"นางสาวกานดา อุดหนุนดี (ผอ.กองการศึกษา)", agency:"เทศบาลเมืองชลบุรี",
    complainant:"กรมส่งเสริมการปกครองท้องถิ่น", status:"อยู่ระหว่างพิจารณาโดยอนุกลั่นกรอง (ก7)",
    owner:"นางสาวศิริพร กิจการ", ownerLogin:"Siriporn.K", ownerOrg:"กองบริหารคดี",
    at:"board-resolution", zone:"เขต 2 ภาคตะวันออก", receivedDate:"2569-03-14", docType:"213", slaDays:11, slaLimit:15 },

  { id:"0622/2569", subject:"วินิจฉัยชี้มูล — เรียกรับสินบนออกใบอนุญาตโรงงาน",
    accused:"นายประสิทธิ์ โรงงานดี (วิศวกรชำนาญการ)", agency:"สำนักงานอุตสาหกรรมจังหวัดระยอง",
    complainant:"ผู้ประกอบการโรงงาน", status:"อยู่ระหว่างวินิจฉัยชี้มูล (ก7.2)",
    owner:"นางสาวศิริพร กิจการ", ownerLogin:"Siriporn.K", ownerOrg:"กองบริหารคดี",
    at:"board-resolution", zone:"เขต 2 ภาคตะวันออก", receivedDate:"2568-11-02", docType:"RULING", slaDays:6, slaLimit:15 },

  // ── person-screening / witness / legal / warrant เพิ่มเติม ──
  { id:"1882/2569", subject:"ตรวจสอบประวัติ — ขอเครื่องราชอิสริยาภรณ์ (รอบตุลาคม 2569)",
    accused:"นายพงศ์ศักดิ์ ประวัติดี (ข้าราชการ)", agency:"กรมศิลปากร",
    complainant:"สำนักเลขาธิการคณะรัฐมนตรี", status:"รอตรวจสอบประวัติ — ส่งกองบริหารคดีแล้ว",
    owner:"นางสาวปิยะดา ตรวจสอบ", ownerLogin:"chk.officer", ownerOrg:"กองบริหารคดี",
    at:"person-screening", zone:"ส่วนกลาง", receivedDate:"2569-07-01", docType:"CHK", slaDays:7, slaLimit:15 },

  { id:"0114/2569", subject:"คุ้มครองพยาน — คดีทุจริตจัดซื้อครุภัณฑ์ (พยานปากสำคัญ)",
    accused:"ผู้ถูกกล่าวหาในคดี 0024/2569", agency:"สำนักงานเขตพื้นที่การศึกษา",
    complainant:"พยานปากสำคัญ คดี 0024/2569", status:"อนุมัติคุ้มครองแล้ว — อยู่ระหว่างคุ้มครอง",
    owner:"นางสาวธันธิตา คุ้มภัย", ownerLogin:"wp.officer", ownerOrg:"สำนักคุ้มครองพยาน",
    at:"witness-protection", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-07-15", docType:"คบ.3", witnessNo:"WP-2569-000512" },

  { id:"0456/2569", subject:"อัยการขอให้ไต่สวนเพิ่มเติม — คดีทุจริตสัมปทานป่าไม้",
    accused:"นายวิชัย ยอดทอง และพวก", agency:"กรมป่าไม้",
    complainant:"สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริตฯ", status:"รอความเห็นกฎหมาย (ก10) — อัยการสั่งเพิ่มเติม",
    owner:"นายเอกพงศ์ วินิจฉัย", ownerLogin:"legal.officer", ownerOrg:"กองกฎหมาย",
    at:"legal-case", zone:"ส่วนกลาง", receivedDate:"2569-05-20", docType:"สำนวนอัยการ", legalCase:"คดีดำ อท. 123/2569", slaDays:12, slaLimit:30 },

  { id:"0099/2569", subject:"ออกหมายจับผู้ต้องหาหลบหนี — คดีทุจริตจัดซื้อจัดจ้าง อบต.บางเลน",
    accused:"นายวิชัย ยอดทอง (หลบหนี)", agency:"ศาลอาญาคดีทุจริตฯ",
    complainant:"พนักงานไต่สวน (เสนอขอหมายจับ)", status:"รอศาลออกหมายจับ",
    owner:"นางสาวอรุณี ใจมั่น", ownerLogin:"warrant.officer", ownerOrg:"กองปราบปรามการทุจริตฯ",
    at:"arrest-warrant", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-12", docType:"หมายจับ", warrantNo:"ศท-2569-0012" },

  { id:"0102/2569", subject:"หมายจับ — คดีเรียกรับเงินใบอนุญาต (ผู้ต้องหาหลบหนี)",
    accused:"นายอาทิตย์ ส่องแสง (หลบหนี)", agency:"ศาลอาญาคดีทุจริตฯ",
    complainant:"พนักงานไต่สวน", status:"ศาลออกหมายแล้ว — รอจับกุม",
    owner:"นางสาวอรุณี ใจมั่น", ownerLogin:"warrant.officer", ownerOrg:"กองปราบปรามการทุจริตฯ",
    at:"arrest-warrant", zone:"เขต 1 ภาคกลาง", receivedDate:"2569-08-18", docType:"หมายจับ", warrantNo:"ศท-2569-0018" },

  { id:"9001/2569", trackingNo:"AN-9001", pin:"0001",
    subject:"รายงานสรุปสถิติรับเรื่องร้องเรียน ไตรมาส 3/2569",
    complainant:"ระบบ", accused:"—", agency:"สำนักงาน ป.ป.ท. ส่วนกลาง",
    status:"รายงานพร้อมใช้งาน (ก12)",
    owner:"นางสาวมนัสนันท์ วิเคราะห์", ownerLogin:"report.analyst", ownerOrg:"กองยุทธศาสตร์และแผนงาน",
    at:"analytics", zone:"ส่วนกลาง", receivedDate:"2569-08-01", docType:"รายงาน", kind:"analytics" },

  { id:"9002/2569", trackingNo:"GW-9002", pin:"0002",
    subject:"เชื่อมโยงข้อมูล ป.ป.ช. — ทะเบียนเรื่องร้องเรียนข้ามหน่วยงาน",
    complainant:"ระบบ", accused:"—", agency:"ศูนย์เทคโนโลยีสารสนเทศ",
    status:"เชื่อมโยงปกติ (ก13)",
    owner:"นายอรรถพล เชื่อมโยง", ownerLogin:"gateway.officer", ownerOrg:"ศูนย์เทคโนโลยีสารสนเทศ",
    at:"integration-gateway", zone:"ส่วนกลาง", receivedDate:"2569-08-05", docType:"เชื่อมโยง", kind:"gateway" },

  { id:"9101/2569", trackingNo:"MG-9101", pin:"0003",
    subject:"นำเข้าข้อมูลเรื่องร้องเรียนย้อนหลัง (ก11) — ชุดทดสอบ 3 รายการ",
    complainant:"ระบบ", accused:"—", agency:"ศูนย์เทคโนโลยีสารสนเทศ",
    status:"นำเข้าเสร็จแล้ว (ก11)",
    owner:"นายธีรพงษ์ ถ่ายโอน", ownerLogin:"migrate.admin", ownerOrg:"ศูนย์เทคโนโลยีสารสนเทศ",
    at:"data-migration", zone:"ส่วนกลาง", receivedDate:"2569-07-28", docType:"นำเข้า", kind:"migration" },
];

(function(global){
  "use strict";

  /* ---------- helpers ---------- */
  function normId(id){
    var s = String(id == null ? "" : id).trim();
    // ยอมรับทั้ง 0001/2569 และ 0001-2569 แต่ห้ามแปลง id อื่นที่มี "-" อยู่ตามปกติ
    if (/^\d{4}-\d{4}$/.test(s)) s = s.replace("-", "/");
    return s;
  }
  function readJSON(key, fallback){
    try{
      if (typeof localStorage === "undefined") return fallback;
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function writeJSON(key, val){
    try{ if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e){ return false; }
  }
  function broadcast(msg){
    try{ if (typeof BroadcastChannel !== "undefined") new BroadcastChannel("ecmis-transform").postMessage(msg); }catch(e){}
  }

  /* ---------- seed ----------
     ใช้เวอร์ชันกำกับ เพราะของเดิมเช็กแค่ "ว่างไหม" พอเพิ่มสำนวนใหม่เข้า seed
     เครื่องที่เคยเปิดแล้วจะไม่ได้ของใหม่เลย (localStorage ไม่ว่าง)
     ถ้าเวอร์ชันไม่ตรง จะเติมเฉพาะสำนวนที่ยังไม่มี ไม่ทับงานที่ผู้ใช้ทำไว้        */
  var SEED_VERSION = "2026-08-19-rich";
  (function seed(){
    var arr = readJSON(CASES_STORE_KEY, null) || [];
    var ver = null;
    try{ ver = localStorage.getItem(CASES_STORE_KEY + "-seed"); }catch(e){}
    if (ver === SEED_VERSION && arr.length) return;
    var all = [ECMIS_SEED_CASE].concat(ECMIS_SEED_MORE);
    // upsert: เติมของใหม่ + อัปเดต owner/at ของที่มีอยู่ให้ตรงบัญชีปัจจุบัน (ไม่ทับ status/งานที่ผู้ใช้ทำ)
    var byId = {};
    all.forEach(function(c){ byId[String(c.id)] = c; });
    var changed = false;
    arr.forEach(function(existing){
      var seed = byId[String(existing.id)];
      if(seed){
        if(existing.ownerLogin !== seed.ownerLogin || existing.owner !== seed.owner || existing.ownerOrg !== seed.ownerOrg || existing.at !== seed.at){
          existing.owner = seed.owner;
          existing.ownerLogin = seed.ownerLogin;
          existing.ownerOrg = seed.ownerOrg;
          existing.at = seed.at;
          if(seed.subject) existing.subject = seed.subject;
          if(seed.title) existing.title = seed.title;
          changed = true;
        }
      }
    });
    all.forEach(function(c){
      if (!arr.some(function(x){ return String(x.id) === String(c.id); })) { arr.push(c); changed = true; }
    });
    if(changed || ver !== SEED_VERSION) writeJSON(CASES_STORE_KEY, arr);
    try{ localStorage.setItem(CASES_STORE_KEY + "-seed", SEED_VERSION); }catch(e){}
  })();

  /* ---------- read ---------- */
  function getAllCases(){
    var arr = readJSON(CASES_STORE_KEY, null);
    return (arr && arr.length) ? arr : [ECMIS_SEED_CASE];
  }

  // strict: ไม่พบ → null (เดิมคืน seed ให้ทุก id ทำให้หลายเคสเป็นไปไม่ได้)
  function getCase(id){
    var want = normId(id);
    if (!want) return null;
    var arr = getAllCases();
    for (var i = 0; i < arr.length; i++){
      if (normId(arr[i].id) === want) return arr[i];
    }
    return null;
  }

  // เผื่อ caller ที่ต้องมีอะไรถือไว้เสมอ — ต้องเรียกชื่อนี้ตรง ๆ ให้เห็นชัดว่ายอม fallback
  function getCaseOrSeed(id){ return getCase(id) || ECMIS_SEED_CASE; }
  function getSeedCase(){ return getCase(ECMIS_SEED_CASE.id) || ECMIS_SEED_CASE; }
  function hasCase(id){ return !!getCase(id); }

  /* ---------- write ---------- */
  function saveCase(patch){
    if (!patch) return null;
    var id  = normId(patch.id) || ECMIS_SEED_CASE.id;
    var arr = getAllCases().slice();
    var idx = -1;
    for (var i = 0; i < arr.length; i++){ if (normId(arr[i].id) === id){ idx = i; break; } }

    var saved;
    if (idx === -1){
      // เคสใหม่: ไม่ clone seed ทับ (เดิม Object.assign({}, SEED, patch) ทำให้เคสใหม่
      // ได้ชื่อ/ผู้ถูกกล่าวหาของ 0001/2569 ไปทั้งชุด) — เก็บแค่ที่ส่งมาจริง
      saved = Object.assign({ id: id }, patch, { id: id });
      arr.unshift(saved);
    } else {
      Object.assign(arr[idx], patch, { id: id });
      saved = arr[idx];
    }
    writeJSON(CASES_STORE_KEY, arr);
    /* ห้ามเขียน sessionStorage "ecmis_cases" จากที่นี่
       คีย์นั้นเป็น state ภายในของ ก7/ก10 — ก10 (legal-case/assets/ecmis-app.js:708-719)
       อ่านคีย์นี้แล้วสั่ง CASES.length = 0 ทันทีโดยไม่เช็กเวอร์ชัน
       ถ้าเราเขียนทับ ก10 จะทิ้งเคสของตัวเองทั้งหมดแล้วเหลือแต่เคสของ hub
       ช่องทางที่ถูกคือให้ปลายทางอ่าน localStorage ผ่าน bridge ของตัวเอง */
    broadcast({ type: "case-updated", id: id });
    return saved;
  }

  /* ---------- events (audit trail ข้ามกิจกรรม) ---------- */
  function addEvent(caseId, evt){
    var id   = normId(caseId) || ECMIS_SEED_CASE.id;
    var list = readJSON(EVENTS_STORE_KEY, []);
    var rec  = Object.assign({ at: new Date().toISOString(), caseId: id }, evt || {});
    list.unshift(rec);
    if (list.length > 500) list = list.slice(0, 500);
    writeJSON(EVENTS_STORE_KEY, list);
    broadcast({ type: "event-added", id: id });
    return rec;
  }
  function getEvents(caseId){
    var list = readJSON(EVENTS_STORE_KEY, []);
    if (!caseId) return list;
    var want = normId(caseId);
    return list.filter(function(e){ return normId(e.caseId) === want; });
  }

  /* ---------- query param ---------- */
  function getQueryCaseId(){
    try{
      var u = new URL(location.href);
      return normId(u.searchParams.get("case") || u.searchParams.get("id") || "");
    }catch(e){ return ""; }
  }
  // เคสที่หน้านี้ "กำลังพูดถึง" — ?case= ก่อน ถ้าไม่มีใช้เคสกลาง
  function activeCaseId(){ return getQueryCaseId() || ECMIS_SEED_CASE.id; }

  /* ---------- หน้าที่ประชาชนเห็น: ห้ามโชว์ UI ภายใน ----------
     ตรวจพบ 2026-08-17 ว่า complaint-form.html / tracking.html อยู่ใต้ /intake-investigation/
     ทำให้ pipe rail และแถบเคสภายในไปโผล่บนหน้าสาธารณะ = ผู้ร้องเห็นปุ่ม
     "ส่งรายงาน 213 → ก7 มติ" และชื่อผู้ถูกกล่าวหา/หน่วยงานของสำนวน ซึ่งเป็นข้อมูลภายใน */
  var PUBLIC_PAGES = [
    "complaint-form.html",      // ยื่นเรื่องร้องเรียน
    "tracking.html",            // ตรวจสอบสถานะเรื่อง
    "additional-documents.html",// ส่งเอกสารเพิ่มเติม
    "tangrat.html",             // ช่องทางแอปทางรัฐ — เป็นช่องทางของประชาชน ห้าม guard
    "member-register.html",     // สมัครสมาชิกผู้ร้อง
    "member-dashboard.html",    // หน้าสมาชิกผู้ร้อง
    "login.html", "loginadmin.html", "seed-a5.html"
  ];
  /* หน้าที่ต้องระบุด้วย path เพราะชื่อไฟล์ซ้ำกับหน้าภายใน */
  var PUBLIC_PATHS = [];
  /* หน้า landing สาธารณะย้ายมาไว้ root แล้ว (index.html) — ไม่โหลด runtime เจ้าหน้าที่อยู่แล้ว
     แต่กันไว้เผื่อมีสคริปต์ใดหลุดเข้าไป                                              */
  var ROOT_PUBLIC = /(^|\/)(index\.html)?$/;
  function isPublicPage(){
    try{
      var p = location.pathname.toLowerCase();
      var f = (p.split("/").pop() || "");
      if (PUBLIC_PAGES.indexOf(f) !== -1) return true;
      for (var i = 0; i < PUBLIC_PATHS.length; i++){
        if (p.indexOf(PUBLIC_PATHS[i].toLowerCase()) !== -1) return true;
      }
      // หน้า landing ที่ root: "/" หรือ "/index.html" (แต่ไม่ใช่ "<กิจกรรม>/index.html")
      if (ROOT_PUBLIC.test(p) && p.split("/").filter(Boolean).length <= 1) return true;
      return false;
    }catch(e){ return false; }
  }

  /* ---------- namespace หลัก: ไม่มีใครทับ ---------- */
  var Hub = {
    PUBLIC_PAGES: PUBLIC_PAGES,
    PUBLIC_PATHS: PUBLIC_PATHS,
    isPublicPage: isPublicPage,
    CASES_STORE_KEY: CASES_STORE_KEY,
    EVENTS_STORE_KEY: EVENTS_STORE_KEY,
    CASE_SEED: ECMIS_SEED_CASE,
    normId: normId,
    getCase: getCase,
    getCaseOrSeed: getCaseOrSeed,
    getSeedCase: getSeedCase,
    hasCase: hasCase,
    getAllCases: getAllCases,
    saveCase: saveCase,
    addEvent: addEvent,
    getEvents: getEvents,
    getQueryCaseId: getQueryCaseId,
    activeCaseId: activeCaseId
  };
  global.ECMISHub = Hub;

  /* ---------- back-compat globals ----------
     หมายเหตุ: ก7/ก10 ประกาศ `function getCase()` ของตัวเองใน assets/ecmis-app.js
     ซึ่งโหลดหลังไฟล์นี้และจะทับ global ตัวนี้ — เป็นเรื่องปกติและถูกต้องสำหรับหน้าเหล่านั้น
     โค้ดกลางของ hub จึงต้องเรียก ECMISHub.* เท่านั้น ห้ามพึ่ง global เปล่า */
  global.getCase       = global.getCase       || getCase;
  global.getCaseOrSeed = global.getCaseOrSeed || getCaseOrSeed;
  global.getSeedCase   = global.getSeedCase   || getSeedCase;
  global.getAllCases   = global.getAllCases   || getAllCases;
  global.saveCase      = global.saveCase      || saveCase;
  global.addEvent      = global.addEvent      || addEvent;
  global.getEvents     = global.getEvents     || getEvents;
  global.getQueryCaseId= global.getQueryCaseId|| getQueryCaseId;
  global.CASE_SEED     = global.CASE_SEED     || ECMIS_SEED_CASE;

  /* ---------- เย็บ ECMIS.* ให้โค้ดเดิม ----------
     ก7/ก10 สั่ง `global.ECMIS = {…}` ทับทั้งก้อนตอน ecmis-app.js โหลด
     จึงต้อง attach ซ้ำหลังจากนั้น ไม่ใช่ครั้งเดียวตอน parse */
  function attachToECMIS(){
    if (!global.ECMIS) global.ECMIS = {};
    var E = global.ECMIS;

    /* getCase: ให้ของเจ้าบ้าน (ก7/ก10) ทำงานก่อน ถ้าไม่พบค่อยถามทะเบียนกลาง
       ข้อควรระวัง: ก7/ก10 เขียนไว้ว่า `return CASES.find(...) || CASES[0]`
       คือ "ไม่เคยคืน null" — ถ้าเช็กแค่ if(r) จะได้เคสผิด (CASES[0]) มาแบบเงียบ ๆ
       จึงต้องเทียบ id ที่ได้กับ id ที่ขอ ถ้าไม่ตรงถือว่าเจ้าบ้านไม่มี */
    if (!E.__hubGetCasePatched){
      var host = E.getCase;
      E.getCase = function(id){
        var want = normId(id);
        if (typeof host === "function"){
          try{
            var r = host.call(E, id);
            if (r && normId(r.id) === want) return r;
          }catch(e){}
        }
        var c = getCase(id);
        if (c) return c;
        // ไม่มีทั้งสองที่ — คืน fallback ของเจ้าบ้านไว้ เพื่อไม่ให้หน้าเดิมที่ไม่เช็ก null พัง
        if (typeof host === "function"){ try{ return host.call(E, id); }catch(e){} }
        return null;
      };
      E.__hubGetCasePatched = true;
    }

    // API ของ hub — ตั้งทับได้เสมอ เพราะเจ้าบ้านไม่มีชื่อเหล่านี้
    E.hub             = Hub;
    E.CASE_SEED       = ECMIS_SEED_CASE;
    E.saveCase        = saveCase;
    E.addEvent        = addEvent;
    E.getEvents       = getEvents;
    E.getQueryCaseId  = getQueryCaseId;
    E.activeCaseId    = activeCaseId;
    if (!E.CASES) E.CASES = getAllCases();
  }

  attachToECMIS();                                   // เผื่อไม่มีสคริปต์อื่น
  if (typeof document !== "undefined"){
    if (document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", attachToECMIS);  // หลัง ecmis-app.js
    } else {
      attachToECMIS();
    }
    // กันกรณี ecmis-app.js ทับหลัง DOMContentLoaded (defer/async)
    setTimeout(attachToECMIS, 0);
    setTimeout(attachToECMIS, 300);
  }
  global.ECMISHub.attachToECMIS = attachToECMIS;

})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
