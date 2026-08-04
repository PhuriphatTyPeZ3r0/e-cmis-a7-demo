/* ==========================================================================
   E-CMIS Back-Office — Shared runtime (กิจกรรมที่ 7.1 การไต่สวนเบื้องต้น)
   อ้างอิงผัง: กิจกรรมที่ 7-V2.0.drawio  หน้า "TO-BE ไต่สวนเบื้องต้น" และ
              "TO-BE P2 Core Workflow (Swimlane)"  T1–T14 / G1–G5
   หมายเหตุ: prototype นี้ยังไม่มี RBAC จริง ใช้ current-user switcher สาธิต
   ========================================================================== */
(function (global) {
'use strict';

/* ---------------------------------------------------------------- ROLES
   scope:'UPSTREAM' = อยู่นอกขอบเขตกิจกรรมที่ 7 — เป็นการเสนอตามลำดับชั้น
                      ภายในกอง / สำนักงาน ป.ป.ท. เขต ซึ่งเป็นของกิจกรรมที่ 5
   scope:'IN'       = อยู่ในขอบเขตกิจกรรมที่ 7
   จุดเริ่มต้นของกิจกรรมที่ 7 คือ "เลขาธิการคณะกรรมการ ป.ป.ท."            */
/* ครบ 27 ตำแหน่ง / 11 กลุ่มงาน ตาม Google Sheet tab "กลุ่มผู้ใช้งานระบบ"
   perms = ชุดสิทธิ์ที่ระบบบังคับใช้จริง (ดูตาราง PERM_DEFS ด้านล่าง)          */
const ROLES = [
  /* ── 1. คณะกรรมการ ป.ป.ท. ─────────────────────────────────────────── */
  { id:'chairman', row:1, group:'คณะกรรมการ ป.ป.ท.', title:'ประธานกรรมการ ป.ป.ท.',
    name:'นายวิชัย ยุติธรรม', org:'คณะกรรมการ ป.ป.ท.', lane:'L5', flow:'G4 / S7', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','order.agenda','sign.agenda','sign.order24p3','sign.ruling','vote','bypass.approve','return'] },
  { id:'board', row:2, group:'คณะกรรมการ ป.ป.ท.', title:'กรรมการ ป.ป.ท.',
    name:'นายสมบูรณ์ ธรรมรัฐ', org:'คณะกรรมการ ป.ป.ท.', lane:'L8', flow:'S9 / G5', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','vote','read.agenda.advance'] },
  { id:'board_ex', row:3, group:'คณะกรรมการ ป.ป.ท.', title:'กรรมการ ป.ป.ท. โดยตำแหน่ง',
    name:'เลขาธิการคณะกรรมการ ป.ป.ท.', org:'คณะกรรมการ ป.ป.ท.', lane:'L8', flow:'S9 / G5', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','vote','read.agenda.advance'] },

  /* ── 2. คณะอนุสนับสนุนเลขาธิการฯ (2 คณะ) ──────────────────────────── */
  { id:'sup_chair', row:4, group:'คณะอนุสนับสนุนเลขาธิการฯ', title:'ประธานคณะอนุสนับสนุนฯ',
    name:'นายกิตติ ปรีชาญาณ', org:'ส่วนกลาง (2 คณะ)', lane:'L2', flow:'S2 / G2', act:'7.1, 7.2',
    perms:['view.assigned','download','support.opinion','support.certify'] },
  { id:'support_sub', row:5, group:'คณะอนุสนับสนุนเลขาธิการฯ', title:'อนุกรรมการสนับสนุนเลขาธิการฯ',
    name:'นางสาวจิราพร นิติกิจ', org:'ส่วนกลาง (2 คณะ)', lane:'L2', flow:'S2 / G2', act:'7.1, 7.2',
    perms:['view.assigned','download','support.opinion'] },
  { id:'sup_sec', row:6, group:'คณะอนุสนับสนุนเลขาธิการฯ', title:'อนุกรรมการและเลขานุการ (อนุสนับสนุนฯ)',
    name:'นายพงศกร ธรรมสาร', org:'ส่วนกลาง (2 คณะ)', lane:'L2', flow:'S2', act:'7.1, 7.2',
    perms:['view.assigned','download','support.opinion','support.minutes','doc.generate'] },
  { id:'sup_asst', row:7, group:'คณะอนุสนับสนุนเลขาธิการฯ', title:'อนุกรรมการและผู้ช่วยเลขานุการ (อนุสนับสนุนฯ)',
    name:'นางสาวเบญจมาศ ใจดี', org:'ส่วนกลาง (2 คณะ)', lane:'L2', flow:'S2', act:'7.1, 7.2',
    perms:['view.assigned','download','request.moreinfo'] },

  /* ── 3. คณะอนุกลั่นกรองเรื่องไต่สวนข้อเท็จจริง (คณะ 1-8) ───────────── */
  { id:'scr_chair', row:8, group:'คณะอนุกลั่นกรองฯ (คณะ 1-8)', title:'ประธานคณะอนุกลั่นกรองฯ',
    name:'นายสุเมธ นิติธรรม', org:'ส่วนกลาง (คณะ 1-8)', lane:'L6', flow:'S6', act:'7.1, 7.2',
    perms:['view.assigned','download','screen.vote'] },
  { id:'subcommittee', row:9, group:'คณะอนุกลั่นกรองฯ (คณะ 1-8)', title:'อนุกรรมการกลั่นกรองฯ',
    name:'นางปราณี ยุติธรรม', org:'ส่วนกลาง (คณะ 1-8)', lane:'L6', flow:'S6', act:'7.1, 7.2',
    perms:['view.assigned','download','screen.vote'] },
  { id:'scr_sec', row:10, group:'คณะอนุกลั่นกรองฯ (คณะ 1-8)', title:'อนุกรรมการและเลขานุการ (อนุกลั่นกรองฯ)',
    name:'นายวรวุฒิ นิติกร', org:'นิติกร กบค.', lane:'L6', flow:'S6', act:'7.1, 7.2',
    perms:['view.assigned','download','screen.minutes','doc.generate','present.board'] },
  { id:'scr_asst', row:11, group:'คณะอนุกลั่นกรองฯ (คณะ 1-8)', title:'อนุกรรมการและผู้ช่วยเลขานุการ (อนุกลั่นกรองฯ)',
    name:'นางสาวอารยา สุจริต', org:'นิติกร กบค.', lane:'L6', flow:'S6', act:'7.1, 7.2',
    perms:['view.assigned','download','doc.generate'] },

  /* ── 4. คณะผู้บริหาร ───────────────────────────────────────────────── */
  { id:'secgen', row:12, group:'คณะผู้บริหาร', title:'เลขาธิการคณะกรรมการ ป.ป.ท.',
    name:'นายอภิชาติ สุจริตกุล', org:'สำนักงาน ป.ป.ท.', lane:'L1', flow:'S1 / G1 — จุดเริ่ม กจ.7', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','sign.report213','decide.complex','sign.order24p1','approve.general','return'] },
  { id:'deputy_sg', row:13, group:'คณะผู้บริหาร', title:'รองเลขาธิการคณะกรรมการ ป.ป.ท.',
    name:'นายสุรพงษ์ วัฒนา', org:'สำนักงาน ป.ป.ท.', lane:'—', flow:'ต้นทาง (กจ.5)', act:'7.1, 7.2, 7.3', scope:'UPSTREAM',
    perms:['view.all','download','sign.report213','return'] },
  { id:'deputy', row:14, group:'คณะผู้บริหาร', title:'ผู้ช่วยเลขาธิการคณะกรรมการ ป.ป.ท.',
    name:'นางสาวพิมพ์ใจ รัตนกุล', org:'สำนักงาน ป.ป.ท.', lane:'—', flow:'ต้นทาง (กจ.5)', act:'7.1, 7.2, 7.3', scope:'UPSTREAM',
    perms:['view.all','download'] },

  /* ── 5. กองบริหารคดี (กบค.) ────────────────────────────────────────── */
  { id:'affairs', row:15, group:'กองบริหารคดี (กบค.)', title:'เจ้าหน้าที่กลุ่มงานกิจการคณะกรรมการ',
    name:'นางสาวศิริพร กิจการ', org:'กองบริหารคดี', lane:'L7', flow:'S7 / S11', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','EDIT.MASTER','create.agenda','create.invite','doc.generate','order24.draft','secrecy.set'] },
  { id:'board_sec', row:16, group:'กองบริหารคดี (กบค.)', title:'เจ้าหน้าที่กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ',
    name:'นายธนกฤต บุญมี', org:'กองบริหารคดี', lane:'L7', flow:'S8 / S10', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','record.minutes','lock.pdf','compile.minutes','doc.generate','dispatch.resolution'] },
  { id:'dir_case', row:20, group:'กองบริหารคดี (กบค.)', title:'ผู้อำนวยการกองบริหารคดี (ผอ.กบค.)',
    name:'นางสาวณพัสตร์ ศรีสมเกียรติ', org:'กองบริหารคดี', lane:'L3', flow:'S3 / S5', act:'7.1, 7.2',
    perms:['view.all','download','EDIT.MASTER','certify.urgent','assign.subcommittee','sign.general'] },
  { id:'track', row:21, group:'กองบริหารคดี (กบค.)', title:'กลุ่มงานบริหารติดตามคดี (กบต.)',
    name:'นายชัยวัฒน์ ติดตาม', org:'กองบริหารคดี', lane:'—', flow:'เชื่อม กจ.8', act:'7.2',
    perms:['view.all','download','track.discipline'] },
  { id:'admin_gen', row:22, group:'กองบริหารคดี (กบค.)', title:'กลุ่มงานบริหารคดีและบริหารทั่วไป',
    name:'นางวิไล ธุรการ', org:'กองบริหารคดี', lane:'L3', flow:'S5', act:'7.1',
    perms:['view.all','download','intake.route'] },

  /* ── 6. กอง / สำนักงาน ป.ป.ท. เขต (ต้นสังกัดสำนวน) ─────────────────── */
  { id:'owner', row:17, group:'กอง / สนง. ป.ป.ท. เขต', title:'ผู้รับผิดชอบสำนวน / พนักงาน ป.ป.ท. (นักสืบ)',
    name:'นายสมชาย ใจซื่อ', org:'สนง. ป.ป.ท. เขต 1', lane:'—', flow:'ต้นทาง (กจ.5)', act:'7.1, 7.2, 7.3', scope:'UPSTREAM',
    perms:['view.own','download.own','ack.resolution','urgent.request','present.board.ruling','dispatch.nacc'] },
  { id:'section_head', row:18, group:'กอง / สนง. ป.ป.ท. เขต', title:'หัวหน้ากลุ่มงาน (นสส. / ชพ.)',
    name:'นางกาญจนา วงศ์ธรรม', org:'สนง. ป.ป.ท. เขต 1', lane:'—', flow:'ต้นทาง (กจ.5)', act:'7.1, 7.2', scope:'UPSTREAM',
    perms:['view.own','download.own'] },
  { id:'director', row:19, group:'กอง / สนง. ป.ป.ท. เขต', title:'ผอ.กอง / ผอ.สนง. ป.ป.ท. เขต',
    name:'นายประเสริฐ มั่นคง', org:'สนง. ป.ป.ท. เขต 1', lane:'—', flow:'ต้นทาง (กจ.5)', act:'7.1, 7.2, 7.3', scope:'UPSTREAM',
    perms:['view.own','download.own','urgent.endorse'] },

  /* ── 7-9. สำนักงานเลขาธิการ / สารบรรณ / กองปราบ ────────────────────── */
  { id:'chair_office', row:23, group:'สำนักงานเลขาธิการ', title:'หน้าห้องประธานกรรมการ ป.ป.ท.',
    name:'นางสุนีย์ ธำรงชัย', org:'สำนักงานเลขาธิการ', lane:'L4', flow:'S4', act:'7.1, 7.2',
    perms:['view.all','download','intake.screen','route.subcommittee'] },
  { id:'registry', row:24, group:'สำนักเลขาธิการ', title:'สารบรรณกลางสำนักเลขาธิการ',
    name:'นายอนุชา สารบรรณ', org:'สำนักเลขาธิการ', lane:'—', flow:'นอก E-CMIS', act:'7.1',
    perms:['view.all','download','docnumber.issue'] },
  { id:'suppress', row:25, group:'กองปราบปรามการทุจริตฯ (กปท. 1-5)', title:'เจ้าหน้าที่กองปราบปรามการทุจริตในภาครัฐ',
    name:'นายภาณุ ปราบทุจริต', org:'กปท. 1-5', lane:'—', flow:'ต้นทางเอกสาร', act:'7.1, 7.2',
    perms:['view.own','download.own','memo.submit'] },

  /* ── 10. กองกฎหมาย (กกม.) ──────────────────────────────────────────── */
  { id:'legal', row:26, group:'กองกฎหมาย (กกม.)', title:'นิติกร / ผอ.กองกฎหมาย',
    name:'นายเอกพงศ์ วินิจฉัย', org:'กองกฎหมาย', lane:'—', flow:'เชื่อม กจ.10', act:'7.3',
    perms:['view.all','download','legal.opinion','doc.generate'] },

  /* ── 11. ผู้ดูแลระบบ E-CMIS ────────────────────────────────────────── */
  { id:'sysadmin', row:27, group:'ผู้ดูแลระบบ E-CMIS', title:'ผู้ดูแลระบบ (System Admin)',
    name:'นายกฤษณะ แอดมิน', org:'ศูนย์เทคโนโลยีสารสนเทศ', lane:'—', flow:'ทุกขั้น', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','admin.sla','admin.users','admin.reassign','audit.view'] }
];

/* --------------------------------------------------- DOCUMENT TYPE + SLA
   ผัง P2 โหนด t5 (★ S1) กำหนด SLA ของชั้นเลขาธิการฯ ไว้เป็น 2 ระยะ และ
   แยกค่าตามชนิดรายงานที่เสนอเข้ามา:
     รายงาน 213 — รอลงนาม 5 วัน / ลงนามเสร็จ 3 วัน
     รายงาน 644 — เสนอ 15 วัน   / ลงนาม 15 วัน
   ค่าทั้งหมดตั้งให้ Admin แก้ได้ (TOR 7.2.1.3)                            */
const DOC_TYPES = {
  '213': {
    code:'213', label:'รายงานการไต่สวนเบื้องต้น (แบบ ปปท. ๒-๑๓)', short:'รายงาน 213',
    sla:{ waitSign:5, completeSign:3 }
  },
  '644': {
    code:'644', label:'รายงานการไต่สวนข้อเท็จจริง (แบบ ปปท. ๖-๔๔)', short:'รายงาน 644',
    sla:{ waitSign:15, completeSign:15 }
  }
};
/* ระยะที่สำนวนกำลังอยู่ในชั้นเลขาธิการฯ — ใช้เลือกเพดาน SLA ที่ถูกต้อง */
const SIGN_PHASE = {
  WAIT:     { key:'WAIT',     label:'รอเลขาธิการฯ ลงนาม',       slaKey:'waitSign' },
  COMPLETE: { key:'COMPLETE', label:'ลงนามแล้ว รอส่งต่อให้ครบ', slaKey:'completeSign' }
};

/* เพดาน SLA ของสำนวนในชั้นเลขาธิการฯ — แทนการ hard-code slaLimit ต่อสำนวน */
function secgenSlaLimit(kase){
  const dt = DOC_TYPES[kase.docType] || DOC_TYPES['213'];
  const ph = SIGN_PHASE[kase.signPhase] || SIGN_PHASE.WAIT;
  return dt.sla[ph.slaKey];
}

/* ---- นิยามสิทธิ์ที่ระบบบังคับใช้ (ใช้แสดงในหน้าจอบริหารสิทธิ์) ---- */
const PERM_DEFS = [
  { k:'view.all',      cat:'การเข้าถึง', label:'ดูสำนวนได้ทุกเรื่องในกิจกรรมที่ 7' },
  { k:'view.own',      cat:'การเข้าถึง', label:'ดูได้เฉพาะสำนวนของตนเอง', note:'ชีตแถว 17' },
  { k:'view.assigned', cat:'การเข้าถึง', label:'ดูได้เฉพาะสำนวนที่ได้รับมอบหมายให้คณะของตน' },
  { k:'download',      cat:'การเข้าถึง', label:'ดาวน์โหลดเอกสารได้ทุกเรื่อง' },
  { k:'download.own',  cat:'การเข้าถึง', label:'ดาวน์โหลดได้เฉพาะสำนวนของตนเอง', note:'ชีตแถว 17' },
  { k:'EDIT.MASTER',   cat:'การแก้ไข',  label:'แก้ไขมติ / คำสั่ง / รายงานในระบบ',
    note:'สิทธิพิเศษสูงสุด — ชีตแถว 15 ระบุว่ามีเพียง 7 คนเท่านั้น (เจ้าหน้าที่กลุ่มงานกิจการฯ 6 + ผอ.กบค. 1)', critical:true },
  { k:'record.minutes',cat:'การแก้ไข',  label:'บันทึกมติที่ประชุมเข้าระบบ' },
  { k:'lock.pdf',      cat:'การแก้ไข',  label:'ล็อกไฟล์ PDF มติ' },
  { k:'compile.minutes',cat:'การแก้ไข', label:'Auto-compile รายงานการประชุมรวม' },
  { k:'create.agenda', cat:'การแก้ไข',  label:'จัดทำระเบียบวาระการประชุม' },
  { k:'create.invite', cat:'การแก้ไข',  label:'จัดทำหนังสือเชิญประชุม' },
  { k:'secrecy.set',   cat:'การแก้ไข',  label:'กำหนดชั้นความลับของเอกสาร' },
  { k:'order24.draft', cat:'การแก้ไข',  label:'ร่างคำสั่งแต่งตั้งคณะไต่สวน ม.24' },
  { k:'doc.generate',  cat:'การแก้ไข',  label:'สร้างเอกสารจาก Mail-Merge Template' },
  { k:'sign.report213',cat:'การลงนาม',  label:'ลงนามดิจิทัลรายงาน 213 / 644' },
  { k:'sign.agenda',   cat:'การลงนาม',  label:'ลงนามสั่งบรรจุวาระการประชุม' },
  { k:'sign.order24p1',cat:'การลงนาม',  label:'ลงนามคำสั่ง ม.24 วรรคหนึ่ง (องค์คณะ)' },
  { k:'sign.order24p3',cat:'การลงนาม',  label:'ลงนามคำสั่ง ม.24 วรรคสาม (คณะอนุกรรมการไต่สวน)' },
  { k:'sign.ruling',   cat:'การลงนาม',  label:'ลงนามรายงานวินิจฉัยชี้มูล' },
  { k:'sign.general',  cat:'การลงนาม',  label:'ลงนามหนังสือทั่วไป' },
  { k:'certify.urgent',cat:'จุดควบคุม', label:'รับรองเหตุผลเร่งด่วนบนใบด่วน',
    note:'จุดควบคุม Bypass — ชีตแถว 20', critical:true },
  { k:'bypass.approve',cat:'จุดควบคุม', label:'สั่งบรรจุวาระด่วนข้ามอนุกลั่นกรองฯ', note:'ชีตแถว 1' },
  { k:'assign.subcommittee',cat:'จุดควบคุม', label:'กระจายสำนวนเข้าคณะอนุกลั่นกรองฯ 1-8' },
  { k:'decide.complex',cat:'จุดควบคุม', label:'ตัดสินว่าเป็นเรื่องยุ่งยากซับซ้อน (G1)' },
  { k:'return',        cat:'จุดควบคุม', label:'ส่งคืนสายงานต้นทาง (Return)' },
  { k:'vote',          cat:'การประชุม', label:'ลงมติในที่ประชุมคณะกรรมการ',
    note:'กรรมการที่มีส่วนได้เสียถูกกันสิทธิ์นี้ตาม ม.20 — ชีตแถว 2', critical:true },
  { k:'read.agenda.advance', cat:'การประชุม', label:'อ่านระเบียบวาระล่วงหน้า 3 วัน' },
  { k:'present.board', cat:'การประชุม', label:'ชี้แจงต่อบอร์ดแทนนักสืบ (ชั้นไต่สวนเบื้องต้น)', note:'ชีตแถว 10' },
  { k:'present.board.ruling', cat:'การประชุม', label:'ชี้แจงต่อบอร์ดด้วยตนเอง (ชั้นวินิจฉัยชี้มูล)' },
  { k:'screen.vote',   cat:'การประชุม', label:'ลงมติกลั่นกรองในคณะอนุกลั่นกรองฯ' },
  { k:'screen.minutes',cat:'การประชุม', label:'บันทึกมติคณะอนุกลั่นกรองฯ' },
  { k:'support.opinion',cat:'การประชุม',label:'เสนอความเห็นคณะอนุสนับสนุนฯ' },
  { k:'support.certify',cat:'การประชุม',label:'รับรองมติคณะอนุสนับสนุนฯ' },
  { k:'support.minutes',cat:'การประชุม',label:'บันทึกมติคณะอนุสนับสนุนฯ' },
  { k:'request.moreinfo',cat:'การประชุม',label:'ขอเอกสาร/ข้อมูลเพิ่มเติมจากเจ้าของสำนวน' },
  { k:'ack.resolution',cat:'ปลายน้ำ',   label:'บันทึกรับมติในระบบ' },
  { k:'urgent.request',cat:'ปลายน้ำ',   label:'ยื่นใบด่วนขอบรรจุวาระ' },
  { k:'urgent.endorse',cat:'ปลายน้ำ',   label:'เห็นชอบใบด่วนเบื้องต้นก่อนส่ง ผอ.กบค.' },
  { k:'dispatch.resolution',cat:'ปลายน้ำ',label:'ส่งมติคืนกอง / สนง. ป.ป.ท. เขต' },
  { k:'dispatch.nacc', cat:'ปลายน้ำ',   label:'ทำหนังสือนำส่งสำนวนถึง ป.ป.ช.' },
  { k:'track.discipline',cat:'ปลายน้ำ', label:'ติดตามผลการดำเนินการทางวินัย (เชื่อม กจ.8)' },
  { k:'intake.screen', cat:'ปลายน้ำ',   label:'ลงรับและคัดกรองสำนวนอิเล็กทรอนิกส์' },
  { k:'intake.route',  cat:'ปลายน้ำ',   label:'รับเรื่องจากสารบรรณและส่งเข้าอนุกลั่นกรองฯ' },
  { k:'route.subcommittee',cat:'ปลายน้ำ',label:'ส่งเรื่องเข้าอนุกลั่นกรองฯ ตามคำสั่งประธานฯ' },
  { k:'memo.submit',   cat:'ปลายน้ำ',   label:'จัดทำบันทึกเสนอนำเรียนประธานฯ' },
  { k:'legal.opinion', cat:'ปลายน้ำ',   label:'จัดทำบันทึกความเห็นทางกฎหมาย' },
  { k:'docnumber.issue',cat:'ปลายน้ำ',  label:'ออกเลขหนังสือ / เลขคำสั่ง', note:'นอกขอบเขต E-CMIS' },
  { k:'admin.sla',     cat:'ผู้ดูแลระบบ',label:'ตั้งค่าจำนวนวันแจ้งเตือน SLA' },
  { k:'admin.users',   cat:'ผู้ดูแลระบบ',label:'บริหารผู้ใช้ ประเภทตำแหน่ง และสิทธิ์' },
  { k:'admin.reassign',cat:'ผู้ดูแลระบบ',label:'Re-assign ผู้พิจารณากรณีลา / ตำแหน่งว่าง' },
  { k:'audit.view',    cat:'ผู้ดูแลระบบ',label:'ดู Audit Log' }
];

/* ---- ตรวจสิทธิ์ ---- */
function can(permKey, roleId){
  const r = getRole(roleId || currentRoleId());
  return !!(r.perms && r.perms.includes(permKey));
}
/* ผู้มีสิทธิ์แก้ไขมติ/คำสั่ง/รายงาน — ชีตระบุ 7 คน */
function canEditMaster(roleId){ return can('EDIT.MASTER', roleId); }
/* ขอบเขตการมองเห็นสำนวน */
function canViewCase(kase, roleId){
  const r = getRole(roleId || currentRoleId());
  if(can('view.all', r.id)) return true;
  if(can('view.assigned', r.id)) return !!kase.subCommittee || kase.complex;
  if(can('view.own', r.id)) return kase.owner === r.name || kase.ownerOrg === r.org;
  return false;
}

/* ------------------------------------------------- STATE MACHINE (7.1)
   สถานะที่มี scope:'UPSTREAM' = สำนวนยังไม่เข้ากิจกรรมที่ 7
   ระบบยังแสดงให้ติดตามได้ แต่ไม่มี Action ใดในโมดูลนี้                    */
const STATUS = {
  /* ---- นอกขอบเขต กจ.7 : การเสนอตามลำดับชั้นภายในกอง/เขต (กจ.5) ---- */
  DRAFT:            { label:'ร่างรายงาน 213 (ในกอง/เขต)',   cls:'st-draft',    owner:'owner',        scope:'UPSTREAM' },
  RETURNED:         { label:'ส่งคืน กจ.5 — รอแก้ไข',        cls:'st-returned', owner:'owner',        scope:'UPSTREAM' },
  PENDING_SECTION:  { label:'รอหัวหน้ากลุ่มงาน (ในกอง/เขต)', cls:'st-pending',  owner:'section_head', scope:'UPSTREAM' },
  PENDING_DIRECTOR: { label:'รอ ผอ.กอง / ผอ.เขต',           cls:'st-pending',  owner:'director',     scope:'UPSTREAM' },
  PENDING_DEPUTY:   { label:'รอผู้ช่วย / รองเลขาธิการฯ',     cls:'st-pending',  owner:'deputy',       scope:'UPSTREAM' },

  /* ---- จุดเริ่มกิจกรรมที่ 7 ---- */
  PENDING_SECGEN:   { label:'รอเลขาธิการฯ ลงนาม',         cls:'st-pending',  owner:'secgen' },
  IN_SUPPORT_SUB:   { label:'อยู่คณะอนุสนับสนุนฯ',         cls:'st-review',   owner:'support_sub' },
  PENDING_URGENT:   { label:'รอ ผอ.กบค. รับรองใบด่วน',     cls:'st-urgent',   owner:'dir_case' },
  PENDING_CHAIR_OF: { label:'รอหน้าห้องประธานฯ คัดกรอง',   cls:'st-pending',  owner:'chair_office' },
  PENDING_CHAIRMAN: { label:'รอประธานฯ สั่งการ',           cls:'st-pending',  owner:'chairman' },
  IN_SCREENING:     { label:'อยู่อนุกลั่นกรองฯ',           cls:'st-review',   owner:'subcommittee' },
  AGENDA_SET:       { label:'บรรจุวาระแล้ว',              cls:'st-agenda',   owner:'board_sec' },
  RESOLVED:         { label:'มีมติแล้ว',                  cls:'st-done',     owner:'board_sec' },
  CLOSED:           { label:'ปิดสำนวน',                   cls:'st-closed',   owner:null }
};

/* สายการเสนอตามลำดับชั้น "ภายในกอง/เขต" — นอกขอบเขต กจ.7 แสดงเป็นประวัติอ่านอย่างเดียว */
const UPSTREAM_CHAIN = ['owner','section_head','director','deputy'];

/* ในขอบเขต กจ.7 เลขาธิการฯ เป็นชั้นอนุมัติเดียว ไม่มีสายลำดับชั้นต่อจากนี้ */
const APPROVAL_CHAIN = ['secgen'];

/* Stepper ของกิจกรรมที่ 7.1 — เริ่มที่เลขาธิการฯ */
const FLOW_STEPS = [
  { key:'secgen',    label:'เลขาธิการฯ พิจารณา / ลงนาม', ref:'S1 · G1' },
  { key:'urgent',    label:'ใบด่วน / ผอ.กบค.',           ref:'G3 · S3' },
  { key:'chairman',  label:'ประธานฯ สั่งการ',            ref:'S4 · G4' },
  { key:'screening', label:'อนุกลั่นกรองฯ 1–8',          ref:'S5 · S6' },
  { key:'agenda',    label:'บรรจุวาระ',                 ref:'S7 · S8' },
  { key:'resolution',label:'บอร์ดลงมติ',                ref:'S9 · G5' },
  { key:'order',     label:'ออกคำสั่ง ม.24',             ref:'S11' }
];

const STATUS_STEP = {
  /* สถานะต้นทางยังไม่เข้า stepper ของ กจ.7 — ชี้ไปขั้นแรกเพื่อแสดงว่ากำลังจะเข้า */
  DRAFT:'secgen', RETURNED:'secgen',
  PENDING_SECTION:'secgen', PENDING_DIRECTOR:'secgen', PENDING_DEPUTY:'secgen',
  PENDING_SECGEN:'secgen', IN_SUPPORT_SUB:'secgen',
  PENDING_URGENT:'urgent',
  PENDING_CHAIR_OF:'chairman', PENDING_CHAIRMAN:'chairman',
  IN_SCREENING:'screening',
  AGENDA_SET:'agenda',
  RESOLVED:'resolution', CLOSED:'order'
};

/* ---- ตัวช่วยเรื่องขอบเขต ---- */
function isUpstreamRole(roleId){ const r = getRole(roleId); return r.scope === 'UPSTREAM'; }
function isUpstreamCase(kase){ const s = STATUS[kase.status]; return !!(s && s.scope === 'UPSTREAM'); }

/* ------------------------------------------------- G1 — เงื่อนไขที่ 2
   ผัง P2 โหนด g1 อ่านว่า "เป็นเรื่องยุ่งยากซับซ้อน **หรือความเห็นใน
   สายบังคับบัญชาไม่ตรงกัน**" — เงื่อนไขหลังเป็นข้อเท็จจริงที่ระบบรู้เองได้
   จากความเห็นที่แต่ละชั้นบันทึกไว้ตอนเสนอขึ้นมา จึงคำนวณให้อัตโนมัติ
   แทนที่จะให้เลขาธิการฯ ตอบเอง                                          */
const OPINION_TYPES = {
  ACCEPT:  { code:'ACCEPT',  label:'เห็นควรรับไว้ไต่สวน' },
  REJECT:  { code:'REJECT',  label:'เห็นควรไม่รับไว้ไต่สวน / ยุติเรื่อง' },
  MORE:    { code:'MORE',    label:'เห็นควรแสวงหาข้อเท็จจริงเพิ่มเติม' },
  FORWARD: { code:'FORWARD', label:'เห็นควรส่งเรื่องให้ ป.ป.ช.' }
};

/* คืนผลวิเคราะห์ความเห็นตามลำดับชั้นของสำนวน (ต้นทาง กจ.5 → เลขาธิการฯ) */
function chainDivergence(kase){
  const ops = kase.chainOpinions || [];
  const kinds = [...new Set(ops.map(o => o.type))];
  const diverged = kinds.length > 1;
  let split = null;
  if(diverged){
    /* ชั้นแรกที่ความเห็นเริ่มต่างจากชั้นก่อนหน้า — ใช้ชี้จุดที่ต้องอ่านซ้ำ */
    for(let i = 1; i < ops.length; i++){
      if(ops[i].type !== ops[i-1].type){ split = { from: ops[i-1], to: ops[i] }; break; }
    }
  }
  return { opinions: ops, diverged, kinds, split };
}

/* G1 ต้องเข้าคณะอนุสนับสนุนฯ หรือไม่ — รวมทั้ง 2 เงื่อนไขตามผัง */
function g1Triggers(kase){
  const d = chainDivergence(kase);
  return {
    complex:   !!kase.complex,          /* เงื่อนไข 1 — ดุลพินิจเลขาธิการฯ */
    diverged:  d.diverged,              /* เงื่อนไข 2 — ระบบตรวจให้ */
    divergence: d,
    required:  !!kase.complex || d.diverged
  };
}

/* ------------------------------------------------------------ ม.28
   เลขาธิการฯ สั่งรับ/ไม่รับเบื้องต้น แล้วต้องรายงานคณะกรรมการ ป.ป.ท.
   ทุก 15 วัน — หากบอร์ดไม่มีมติเป็นอย่างอื่นภายใน 15 วัน ให้ถือว่า
   บอร์ดมีมติตามคำสั่งของเลขาธิการฯ                                      */
const M28 = { cycleDays: 15, boardSilenceDays: 15 };

/* สำนวนที่เลขาธิการฯ สั่งการแล้วและต้องเข้ารายงานรอบ ม.28 ถัดไป */
function m28Pending(){
  return CASES.filter(c => c.m28 && c.m28.reported === false);
}

/* --------------------------------------------------- MOCK CASE DATASET */
const CASES = [
  {
    id:'1547/2568', pcms:'PCMS-68-001547',
    subject:'กล่าวหาเจ้าหน้าที่องค์การบริหารส่วนตำบลแห่งหนึ่ง จัดซื้อจัดจ้างโครงการก่อสร้างถนน คสล. โดยมิชอบ',
    legalBase:'ม.18/4', /* ม.18/4 พรบ.มาตรการฯ | ม.62 พรป.ปปช. */
    status:'PENDING_SECGEN',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'นายวิรัตน์ ศรีสุข (ผู้ร้อง)',
    accused:[
      { no:1, name:'นายก้องภพ ทองแท้',   pos:'นายกองค์การบริหารส่วนตำบล',   idcard:'3-1009-0xxxx-xx-x', agency:'อบต.บางแสน' },
      { no:2, name:'นางมาลี เรืองรอง',    pos:'ปลัดองค์การบริหารส่วนตำบล',   idcard:'3-1012-0xxxx-xx-x', agency:'อบต.บางแสน' },
      { no:3, name:'นายชาญชัย ก่อสร้าง',  pos:'ผู้อำนวยการกองช่าง',          idcard:'3-2001-0xxxx-xx-x', agency:'อบต.บางแสน' }
    ],
    allegation:'ร่วมกันกำหนดคุณลักษณะเฉพาะของงานก่อสร้างเพื่อเอื้อประโยชน์ให้ผู้เสนอราคารายหนึ่งเป็นผู้ชนะการเสนอราคา และตรวจรับงานทั้งที่งานไม่แล้วเสร็จตามสัญญา',
    receivedDate:'2568-11-14', deadline60:'2569-01-13', deadline2y:'2570-11-14', prescription:'2571-03-20',
    docRef:'ปป 0020/1028 ลงวันที่ 7 พฤษภาคม 2569',
    urgent:false, complex:false, dupWarning:true,
    docType:'213', signPhase:'WAIT',
    slaDays:3, slaLimit:5, subCommittee:null,
    meetingNo:null, agendaNo:null,
    /* ความเห็นตามลำดับชั้น — ชั้น ผอ.เขต เห็นต่างจากนักสืบและหัวหน้ากลุ่มงาน
       ระบบจึงตรวจพบ G1 เงื่อนไขที่ 2 ให้เองโดยเลขาธิการฯ ไม่ต้องกาเอง     */
    chainOpinions:[
      { roleId:'owner',        type:'ACCEPT', date:'2568-11-28',
        note:'พยานหลักฐานเพียงพอที่จะสนับสนุนข้อกล่าวหาว่ามีมูลความผิด เห็นควรรับไว้ไต่สวน' },
      { roleId:'section_head', type:'ACCEPT', date:'2568-12-02',
        note:'เห็นพ้องกับผู้รับผิดชอบสำนวน' },
      { roleId:'director',     type:'MORE',   date:'2568-12-09',
        note:'ราคากลางที่ใช้เปรียบเทียบยังไม่ได้มาจากหน่วยงานกลาง เห็นควรแสวงหาข้อเท็จจริงเพิ่มเติมก่อน' },
      { roleId:'deputy',       type:'ACCEPT', date:'2568-12-16',
        note:'ข้อบกพร่องที่ ผอ.เขต ตั้งข้อสังเกตสามารถแก้ในชั้นไต่สวนได้ เห็นควรรับไว้ไต่สวน' }
    ]
  },
  {
    id:'1602/2568', pcms:'PCMS-68-001602',
    subject:'กล่าวหาข้าราชการสังกัดกรมหนึ่ง เรียกรับเงินจากผู้ประกอบการเพื่อแลกกับการออกใบอนุญาต',
    legalBase:'ม.62',
    status:'PENDING_URGENT',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'สำนักงาน ป.ป.ช. (ส่งเรื่องมอบหมาย)',
    accused:[ { no:1, name:'นายเอกชัย รุ่งเรือง', pos:'นายช่างโยธาชำนาญงาน', idcard:'3-1005-0xxxx-xx-x', agency:'กรมโยธาธิการฯ' } ],
    allegation:'เรียกรับเงินจำนวน 50,000 บาท จากผู้ประกอบการเพื่อแลกกับการเร่งรัดออกใบอนุญาตก่อสร้าง',
    receivedDate:'2568-12-02', deadline60:'2569-01-31', deadline2y:'2570-12-02', prescription:'2569-09-18',
    docRef:'ปป 0020/1104 ลงวันที่ 20 พฤษภาคม 2569',
    urgent:true, urgentReason:'คดีใกล้ขาดอายุความภายใน 45 วัน และผู้ถูกร้องมีพฤติการณ์จะโอนย้ายหน่วยงาน',
    complex:false, dupWarning:false,
    slaDays:6, slaLimit:5, subCommittee:null,
    meetingNo:null, agendaNo:null
  },
  {
    id:'1588/2568', pcms:'PCMS-68-001588',
    subject:'กล่าวหาเจ้าหน้าที่โรงพยาบาลรัฐแห่งหนึ่ง เบิกจ่ายค่าตอบแทนล่วงเวลาอันเป็นเท็จ',
    legalBase:'ม.18/4',
    status:'IN_SCREENING',
    owner:'นางสาวปรียา ตั้งมั่น', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 2',
    complainant:'บัตรสนเท่ห์ (ความปรากฏต่อสำนักงาน)',
    accused:[
      { no:1, name:'นายสุรชัย พัฒนา', pos:'นักจัดการงานทั่วไปชำนาญการ', idcard:'3-3007-0xxxx-xx-x', agency:'รพ.ศูนย์แห่งหนึ่ง' },
      { no:2, name:'นางวราภรณ์ สุขใจ', pos:'เจ้าพนักงานการเงินและบัญชี',  idcard:'3-3009-0xxxx-xx-x', agency:'รพ.ศูนย์แห่งหนึ่ง' }
    ],
    allegation:'ร่วมกันจัดทำเอกสารเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการอันเป็นเท็จ รวม 47 ครั้ง เป็นเงิน 382,400 บาท',
    receivedDate:'2568-11-25', deadline60:'2569-01-24', deadline2y:'2570-11-25', prescription:'2572-01-10',
    docRef:'ปป 0021/0987 ลงวันที่ 2 พฤษภาคม 2569',
    urgent:false, complex:true, dupWarning:false,
    slaDays:9, slaLimit:15, subCommittee:'คณะที่ 3',
    meetingNo:null, agendaNo:null
  },
  {
    id:'1490/2568', pcms:'PCMS-68-001490',
    subject:'กล่าวหาผู้บริหารสถานศึกษาแห่งหนึ่ง จัดซื้อครุภัณฑ์คอมพิวเตอร์ราคาสูงเกินจริง',
    legalBase:'ม.18/4',
    status:'AGENDA_SET',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'นายพิชิต รักชาติ (ผู้ร้อง)',
    accused:[ { no:1, name:'นายบัณฑิต ศึกษาดี', pos:'ผู้อำนวยการสถานศึกษา', idcard:'3-1102-0xxxx-xx-x', agency:'โรงเรียนแห่งหนึ่ง' } ],
    allegation:'อนุมัติจัดซื้อครุภัณฑ์คอมพิวเตอร์จำนวน 40 เครื่อง ในราคาสูงกว่าราคากลางที่กระทรวงดิจิทัลฯ กำหนด รวม 1,240,000 บาท',
    receivedDate:'2568-10-08', deadline60:'2568-12-07', deadline2y:'2570-10-08', prescription:'2570-06-30',
    docRef:'ปป 0020/0912 ลงวันที่ 24 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:2, slaLimit:15, subCommittee:'คณะที่ 1',
    meetingNo:'37/2569', agendaNo:'5.9', meetingDate:'2569-05-19'
  },
  {
    id:'1455/2568', pcms:'PCMS-68-001455',
    subject:'กล่าวหาเจ้าหน้าที่สำนักงานที่ดินแห่งหนึ่ง ออกโฉนดที่ดินทับที่สาธารณประโยชน์',
    legalBase:'ม.62',
    status:'RESOLVED',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'องค์การบริหารส่วนตำบลแห่งหนึ่ง',
    accused:[ { no:1, name:'นายมนตรี ที่ดินงาม', pos:'เจ้าพนักงานที่ดินชำนาญการ', idcard:'3-1201-0xxxx-xx-x', agency:'สนง.ที่ดินจังหวัด' } ],
    allegation:'ดำเนินการออกโฉนดที่ดินเลขที่ 12345 เนื้อที่ 8 ไร่ ทับที่สาธารณประโยชน์ โดยมิได้ตรวจสอบระวางแผนที่',
    receivedDate:'2568-09-15', deadline60:'2568-11-14', deadline2y:'2570-09-15', prescription:'2571-08-15',
    docRef:'ปป 0020/0855 ลงวันที่ 10 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:1, slaLimit:15, subCommittee:'คณะที่ 2',
    meetingNo:'36/2569', agendaNo:'5.4', meetingDate:'2569-05-05',
    resolution:'ACCEPT_S24P1'
  },
  {
    id:'1610/2568', pcms:'PCMS-68-001610',
    subject:'กล่าวหาพนักงานรัฐวิสาหกิจแห่งหนึ่ง ทุจริตการเบิกจ่ายค่าน้ำมันเชื้อเพลิง',
    legalBase:'ม.18/4',
    status:'DRAFT',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'ความปรากฏต่อสำนักงาน',
    accused:[ { no:1, name:'นายวีระ ขับขี่ดี', pos:'พนักงานขับรถยนต์', idcard:'3-1301-0xxxx-xx-x', agency:'รัฐวิสาหกิจแห่งหนึ่ง' } ],
    allegation:'เบิกจ่ายค่าน้ำมันเชื้อเพลิงโดยใช้ใบเสร็จรับเงินอันเป็นเท็จ',
    receivedDate:'2568-12-20', deadline60:'2569-02-18', deadline2y:'2570-12-20', prescription:'2573-02-01',
    docRef:'—',
    urgent:false, complex:false, dupWarning:false,
    slaDays:0, slaLimit:5, subCommittee:null,
    meetingNo:null, agendaNo:null
  },
  {
    id:'1523/2568', pcms:'PCMS-68-001523',
    subject:'กล่าวหาเจ้าหน้าที่เทศบาลแห่งหนึ่ง เรียกรับผลประโยชน์จากผู้ขออนุญาตประกอบกิจการ',
    legalBase:'ม.18/4',
    status:'RETURNED',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สนง. ป.ป.ท. เขต 1',
    complainant:'นางสมหญิง ค้าขาย (ผู้ร้อง)',
    accused:[ { no:1, name:'นายอรรถพล เทศบาล', pos:'หัวหน้าฝ่ายพัฒนารายได้', idcard:'3-1405-0xxxx-xx-x', agency:'เทศบาลแห่งหนึ่ง' } ],
    allegation:'เรียกรับเงินจากผู้ประกอบการเพื่อแลกกับการออกใบอนุญาตประกอบกิจการที่เป็นอันตรายต่อสุขภาพ',
    receivedDate:'2568-11-01', deadline60:'2568-12-31', deadline2y:'2570-11-01', prescription:'2570-12-05',
    docRef:'ปป 0020/0978 ลงวันที่ 28 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:4, slaLimit:5, subCommittee:null,
    meetingNo:null, agendaNo:null,
    returnedBy:'director', returnedByName:'นายประเสริฐ มั่นคง (ผอ.สนง. ป.ป.ท. เขต 1)',
    returnReason:'DOC_INCOMPLETE',
    returnNote:'เอกสารพยานหลักฐานประกอบข้อ 3 (สำเนาใบอนุญาต) ยังไม่ครบถ้วน และยังไม่ได้แนบบันทึกถ้อยคำผู้ร้อง กรุณาแนบเพิ่มเติมแล้วเสนอกลับ'
  }
];

/* เพิ่มสำนวนตัวอย่างชนิด 644 ที่ความเห็นตลอดสายตรงกัน — ใช้เทียบกับ 1547/2568
   ให้เห็นว่า G1 ไม่ถูกจุดชนวน และเพดาน SLA เปลี่ยนตามชนิดรายงาน            */
CASES.push({
  id:'1615/2568', pcms:'PCMS-68-001615',
  subject:'กล่าวหาเจ้าหน้าที่สำนักงานเขตแห่งหนึ่ง ละเว้นการบังคับใช้กฎหมายควบคุมอาคาร',
  legalBase:'ม.18/4',
  status:'PENDING_SECGEN',
  owner:'นางสาวปรียา ตั้งมั่น', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 2',
  complainant:'นายธีรพงษ์ รักษ์เมือง (ผู้ร้อง)',
  accused:[ { no:1, name:'นายฉัตรชัย ตรวจการ', pos:'นายช่างโยธาอาวุโส', idcard:'3-1502-0xxxx-xx-x', agency:'สำนักงานเขตแห่งหนึ่ง' } ],
  allegation:'ละเว้นไม่ดำเนินการตามอำนาจหน้าที่กับอาคารที่ก่อสร้างผิดแบบแปลนที่ได้รับอนุญาต รวม 6 หลัง ต่อเนื่องกว่า 2 ปี',
  receivedDate:'2568-12-08', deadline60:'2569-02-06', deadline2y:'2570-12-08', prescription:'2572-05-30',
  docRef:'ปป 0021/1131 ลงวันที่ 26 พฤษภาคม 2569',
  urgent:false, complex:false, dupWarning:false,
  docType:'644', signPhase:'WAIT',
  slaDays:11, slaLimit:15, subCommittee:null,
  meetingNo:null, agendaNo:null,
  chainOpinions:[
    { roleId:'owner',        type:'ACCEPT', date:'2568-12-18', note:'พฤติการณ์ละเว้นชัดเจน มีเอกสารตรวจสอบรองรับ เห็นควรรับไว้ไต่สวน' },
    { roleId:'section_head', type:'ACCEPT', date:'2568-12-24', note:'เห็นพ้องตามที่เสนอ' },
    { roleId:'director',     type:'ACCEPT', date:'2569-01-06', note:'เห็นชอบตามลำดับชั้น' },
    { roleId:'deputy',       type:'ACCEPT', date:'2569-01-14', note:'เห็นควรเสนอเลขาธิการฯ ลงนาม' }
  ]
});

/* ค่าเริ่มต้นของฟิลด์ที่เพิ่มภายหลัง — กันหน้าจอพังกับสำนวนที่ยังไม่มีข้อมูลชุดใหม่ */
CASES.forEach(c => {
  if(!c.docType)       c.docType = '213';
  if(!c.signPhase)     c.signPhase = 'WAIT';
  if(!c.chainOpinions) c.chainOpinions = [];
});

/* ---- รอบรายงาน ม.28 ของคำสั่งที่เลขาธิการฯ สั่งไปแล้ว ----
   orderType = คำสั่งเบื้องต้นของเลขาธิการฯ | reported = เข้ารอบรายงานบอร์ดแล้วหรือยัง
   dueDate   = วันครบกำหนดรายงานรอบ 15 วัน                                 */
const M28_LOG = {
  '1602/2568': { orderType:'ACCEPT', orderedDate:'2569-05-22', reported:false, dueDate:'2569-06-06' },
  '1588/2568': { orderType:'ACCEPT', orderedDate:'2569-05-26', reported:false, dueDate:'2569-06-10' },
  '1490/2568': { orderType:'ACCEPT', orderedDate:'2569-04-30', reported:true,  dueDate:'2569-05-15',
                 boardOutcome:'บอร์ดไม่มีมติเป็นอย่างอื่นภายใน 15 วัน — ถือว่ามีมติตามคำสั่งเลขาธิการฯ' },
  '1523/2568': { orderType:'REJECT', orderedDate:'2569-05-28', reported:false, dueDate:'2569-06-12' }
};
CASES.forEach(c => { if(M28_LOG[c.id]) c.m28 = M28_LOG[c.id]; });

/* Reason Code สำหรับการตีกลับ (EX-01 — TOR 7.2.1.2) */
const RETURN_REASONS = [
  { code:'DOC_INCOMPLETE', label:'เอกสาร/พยานหลักฐานไม่ครบถ้วน' },
  { code:'FACT_UNCLEAR',   label:'ข้อเท็จจริงยังไม่ชัดเจน ต้องแสวงหาเพิ่มเติม' },
  { code:'LAW_DISAGREE',   label:'ความเห็นข้อกฎหมายไม่ตรงกัน' },
  { code:'WRONG_FORM',     label:'รูปแบบรายงานไม่ถูกต้องตามแบบที่กำหนด' },
  { code:'WRONG_ROUTE',    label:'เสนอผิดสายงาน / ผิดหน่วยงานรับผิดชอบ' },
  { code:'OTHER',          label:'อื่น ๆ (ระบุเหตุผล)' }
];

/* ผลมติ 5 ประเภทของ 7.1 (G5) — ตรงกับ Template มติการประชุม ไต่สวนเบื้องต้น */
const RESOLUTIONS = [
  { code:'ACCEPT_S24P1', group:'รับไว้ไต่สวน',
    label:'รับไว้ไต่สวน — ดำเนินการเป็นองค์คณะ (ม.24 วรรคหนึ่ง)',
    doc:'คำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท. (ปปท. ๕-๐๑)', signer:'เลขาธิการฯ' },
  { code:'ACCEPT_S24P3', group:'รับไว้ไต่สวน',
    label:'รับไว้ไต่สวน — ดำเนินการเป็นคณะอนุกรรมการไต่สวน (ม.24 วรรคสาม)',
    doc:'คำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน (ปปท. ๕-๐๔)', signer:'ประธานกรรมการ ป.ป.ท.' },
  { code:'REJECT', group:'ไม่รับไว้ไต่สวน',
    label:'ไม่รับไว้ไต่สวน (ระบุมาตราและเหตุผล)',
    doc:'หนังสือแจ้งผลผู้ถูกกล่าวหา (ม.32 ภายใน 15 วัน)', signer:'—' },
  { code:'MORE_INVESTIGATE', group:'มติอื่น ๆ',
    label:'ให้ผู้รับผิดชอบสำนวนไต่สวนเบื้องต้นเพิ่มเติม',
    doc:'บันทึกแจ้งมติให้ไต่สวนเพิ่มเติม', signer:'—' },
  /* ผัง P2 เส้น G5 ทางที่ 3 — เป็นมติแยกกลุ่มของตัวเอง ไม่ใช่ "มติอื่น ๆ"
     เพราะมีปลายทางและ SLA เฉพาะ (ส่งมอบสำนวนให้ ป.ป.ช. ภายใน 30 วัน)  */
  { code:'FORWARD_NACC', group:'ส่งเรื่องให้ ป.ป.ช.',
    label:'ส่งเรื่องให้สำนักงาน ป.ป.ช. (อยู่นอกอำนาจ ป.ป.ท.)',
    doc:'หนังสือนำส่งสำนวนถึงสำนักงาน ป.ป.ช.', signer:'เลขาธิการฯ',
    slaDays:30, note:'ระบบบังคับอัปโหลดไฟล์สแกนฉบับลงนามกลับ (TOR 7.2.1.5)' }
];

/* =========================================================================
   DESIGN DECISIONS — คำตอบ Q1–Q5 ที่นำมาบังคับใช้ในต้นแบบ
   ทุกค่าในนี้เป็น "ข้อสันนิษฐานเชิงออกแบบ" ที่ตั้งให้ Admin แก้ได้
   ยังต้องให้ ป.ป.ท. ยืนยันก่อน Go-Live
   ========================================================================= */
const CONFIG = {
  /* Q1 — ทุกชั้นที่ถือคิวตีกลับได้ แต่แยก "ระดับการตีกลับ" 2 แบบ */
  returnAllLevels: true,
  /* Q2 — ระบบเสนอ "เร่งด่วน" อัตโนมัติเมื่อเหลือเวลาตาม ม.23 น้อยกว่าค่านี้ */
  urgentAutoDays: 90,
  /* Q3 — องค์ประชุมคณะอนุกลั่นกรองฯ: ใช้กึ่งหนึ่งโดยอนุโลมจาก ม.12 (ตั้งค่าได้) */
  subQuorumRatio: 0.5,
  subMemberCount: 7,
  /* Q5 — โหมดบันทึกมติ: 'AFTER' อยู่ในขอบเขต TOR | 'LIVE' ต้องออก Change Request */
  eMeetingMode: 'AFTER'
};

/* Q1 — ระดับการส่งคืนของเลขาธิการฯ
   เนื่องจากกิจกรรมที่ 7 เริ่มที่เลขาธิการฯ การส่งคืนทุกกรณีคือการ
   "ส่งเรื่องออกนอกกิจกรรมที่ 7" กลับไปยังสายงานต้นทาง (กิจกรรมที่ 5)
   ต่างกันเพียงว่าให้กลับไปตกที่ชั้นใดของกอง/เขต                        */
const RETURN_SCOPES = [
  { code:'TO_DIRECTOR', label:'ส่งคืน ผอ.กอง / ผอ.สนง. ป.ป.ท. เขต',
    note:'ใช้กรณีข้อบกพร่องอยู่ที่การกลั่นกรองของหน่วยงาน เช่น ความเห็นตามลำดับชั้นไม่ครบ' },
  { code:'TO_OWNER', label:'ส่งคืนเจ้าของสำนวนโดยตรง',
    note:'ใช้กรณีข้อบกพร่องอยู่ที่ตัวรายงาน 213 หรือพยานหลักฐานต้นทาง' }
];

/* Q1 — ฟิลด์ "สาระสำคัญ" ถ้าถูกแก้ ต้องเสนอใหม่ตามลำดับชั้นทั้งสาย
   เพราะความเห็นของผู้พิจารณาเดิมตั้งอยู่บนเนื้อหาที่เปลี่ยนไปแล้ว */
const MATERIAL_FIELDS = [
  { id:'f_allegation', label:'ข้อกล่าวหา' },
  { id:'f_finding',    label:'ผลการแสวงหาข้อเท็จจริงและพยานหลักฐาน' },
  { id:'f_opinionType',label:'ความเห็นของผู้รับผิดชอบสำนวน' }
];

/* ------------------------------------------------------------ HELPERS */
/* จำนวนวันคงเหลือถึงวันครบกำหนด (รับ ISO 'พ.ศ.-MM-DD' แปลงเป็น ค.ศ. ก่อน) */
function daysUntil(thaiIso){
  const p = String(thaiIso).split('-');
  if(p.length !== 3) return null;
  const target = new Date(+p[0] - 543, +p[1] - 1, +p[2]);
  const today  = new Date(2026, 7, 4);          /* ตรึงวันที่อ้างอิงของต้นแบบ */
  return Math.round((target - today) / 86400000);
}
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                     'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function thaiDate(iso){
  if(!iso || iso === '—') return '—';
  const p = String(iso).split('-');
  if(p.length !== 3) return iso;
  return `${parseInt(p[2],10)} ${THAI_MONTHS[parseInt(p[1],10)-1]} ${p[0]}`;
}
function slaClass(used, limit){
  if(used > limit) return 'sla-late';
  if(used >= limit - 2) return 'sla-warn';
  return 'sla-ok';
}
function slaLabel(used, limit){
  if(used > limit) return `เกินกำหนด ${used - limit} วัน`;
  return `ใช้ไป ${used}/${limit} วัน`;
}
function getCase(id){ return CASES.find(c => c.id === id) || CASES[0]; }
function getRole(id){ return ROLES.find(r => r.id === id) || ROLES[0]; }

/* current role — เก็บใน sessionStorage เพื่อให้สลับข้ามหน้าได้ */
function currentRoleId(){ return sessionStorage.getItem('ecmis_role') || 'owner'; }
function setRole(id){ sessionStorage.setItem('ecmis_role', id); location.reload(); }
function currentRole(){ return getRole(currentRoleId()); }

/* งานที่ค้างอยู่ที่บทบาทนี้ (Work Inbox count) */
function inboxFor(roleId){
  return CASES.filter(c => STATUS[c.status] && STATUS[c.status].owner === roleId);
}

/* สิทธิ์: บทบาทปัจจุบันเป็น "เจ้าของคิว" ของสำนวนนี้หรือไม่
   — และสำนวนต้องเข้าขอบเขตกิจกรรมที่ 7 แล้วเท่านั้น                    */
function canAct(kase, roleId){
  const st = STATUS[kase.status];
  if(!st || st.scope === 'UPSTREAM') return false;   /* ยังไม่เข้า กจ.7 */
  return st.owner === roleId;
}

/* Recall: เจ้าของเรื่องดึงกลับได้เฉพาะขณะยังอยู่ในสายต้นทาง (กจ.5)
   เมื่อเข้ากิจกรรมที่ 7 แล้ว การดึงกลับต้องทำผ่านการ "ส่งคืน" ของเลขาธิการฯ */
function canRecall(kase, roleId){
  if(roleId !== 'owner') return false;
  return ['PENDING_SECTION','PENDING_DIRECTOR','PENDING_DEPUTY'].includes(kase.status);
}

/* -------------------------------------------------------- SHELL RENDER */
const NAV = [
  { section:'ภาพรวม' },
  { href:'01-work-inbox.html',            icon:'fa-inbox',            label:'Work Inbox', badge:true },
  { href:'02-case-register.html',         icon:'fa-folder-open',      label:'ทะเบียนสำนวน 7.1' },
  { href:'11-secgen-desk.html',           icon:'fa-gavel',            label:'โต๊ะสั่งการเลขาธิการฯ', ref:'L3 · S1–S11' },
  { section:'ต้นทาง — นอกขอบเขตกิจกรรมที่ 7' },
  { href:'03-report-213.html',            icon:'fa-file-import',      label:'รายงาน 213 ที่รับเข้า (อ่านอย่างเดียว)', ref:'กจ.5', muted:true },
  { section:'กระบวนงานไต่สวนเบื้องต้น (7.1)' },
  { href:'04-approval-review.html',       icon:'fa-user-check',       label:'เลขาธิการฯ พิจารณา / ลงนาม', step:1, ref:'S1–G1' },
  { href:'05-urgent-memo.html',           icon:'fa-bolt',             label:'ใบด่วนขอบรรจุวาระ', step:2, ref:'G3–S3' },
  { href:'06-chairman-agenda.html',       icon:'fa-gavel',            label:'ประธานฯ สั่งการ / บรรจุวาระ', step:3, ref:'S4–S8' },
  { href:'07-subcommittee-screening.html',icon:'fa-users-viewfinder', label:'อนุกลั่นกรองฯ คณะ 1–8', step:4, ref:'S5–S6' },
  { href:'08-board-resolution.html',      icon:'fa-scale-balanced',   label:'บันทึกมติที่ประชุมบอร์ด', step:5, ref:'S9–G5' },
  { href:'09-order-m24.html',             icon:'fa-stamp',            label:'ออกคำสั่งแต่งตั้งคณะไต่สวน ม.24', step:6, ref:'S11' },
  { section:'บริหารระบบ' },
  { href:'10-user-permissions.html',      icon:'fa-users-gear',       label:'กลุ่มผู้ใช้งานและสิทธิ์ (RBAC)', ref:'TOR 14.4.3' }
];

function renderShell(activeHref){
  const role = currentRole();
  const inboxCount = inboxFor(role.id).length;

  /* ---- topbar ---- */
  /* จัดกลุ่มตาม "กลุ่มงาน" ให้ตรงกับ Google Sheet tab กลุ่มผู้ใช้งานระบบ */
  const groups = [];
  ROLES.forEach(r => {
    let g = groups.find(x => x.name === r.group);
    if(!g){ g = { name:r.group, items:[] }; groups.push(g); }
    g.items.push(r);
  });
  const roleItems = groups.map(g => `
    <li><h6 class="dropdown-header text-uppercase" style="font-size:.66rem;letter-spacing:.4px">${g.name}</h6></li>` +
    g.items.map(r => {
      const up = r.scope === 'UPSTREAM';
      const edit = r.perms.includes('EDIT.MASTER')
        ? '<span class="st st-urgent ms-1" style="font-size:.6rem">แก้ไขได้</span>' : '';
      return `<li><a class="dropdown-item ${r.id===role.id?'active':''}" href="#" data-role="${r.id}" ${up?'style="opacity:.72"':''}>
        <strong>${r.row}. ${r.title}</strong>${edit}
        ${up?'<span class="st st-draft ms-1" style="font-size:.6rem">นอกขอบเขต กจ.7</span>':''}
        <small>${r.name} · ${r.org} · กิจกรรม ${r.act}</small>
      </a></li>`;
    }).join('')).join('<li><hr class="dropdown-divider"></li>');

  const topbar = `
  <header class="app-topbar">
    <button class="btn btn-sm text-white d-lg-none border-0" id="sbToggle" aria-label="เปิด/ปิดเมนู">
      <i class="fa-solid fa-bars"></i>
    </button>
    <a class="brand text-white text-decoration-none" href="01-work-inbox.html">
      <img src="pacc_logo.png" alt="ตราสำนักงาน ป.ป.ท.">
      <span>E-CMIS
        <small>กิจกรรมที่ 7.1 การไต่สวนเบื้องต้น</small>
      </span>
    </a>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a href="01-work-inbox.html" class="btn btn-sm text-white position-relative border-0" title="งานค้างของฉัน">
        <i class="fa-regular fa-bell"></i>
        ${inboxCount ? `<span class="position-absolute top-50 start-100 translate-middle-y badge rounded-pill bg-danger" style="font-size:.6rem">${inboxCount}</span>` : ''}
      </a>
      <div class="dropdown role-switcher">
        <button class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fa-regular fa-user me-1"></i>${role.name}
          <span class="d-none d-md-inline"> — ${role.title}</span>
          <span class="role-badge-demo">DEMO</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><h6 class="dropdown-header">สลับบทบาทผู้ใช้ (จำลอง — ยังไม่มี RBAC จริง)</h6></li>
          ${roleItems}
        </ul>
      </div>
    </div>
  </header>`;

  /* ---- sidebar ---- */
  const navHtml = NAV.map(n => {
    if(n.section) return `<div class="nav-section">${n.section}</div>`;
    const active = n.href === activeHref;
    const badge = n.badge && inboxCount ? `<span class="badge bg-danger rounded-pill">${inboxCount}</span>` : '';
    const step  = n.step ? `<span class="step-no">${n.step}</span>` : `<i class="fa-solid ${n.icon}"></i>`;
    return `<a class="nav-link ${active?'active':''}" href="${n.href}" ${n.muted?'style="opacity:.7"':''}>
      ${step}<span>${n.label}${n.ref?`<br><small class="text-muted" style="font-size:.68rem">${n.muted?'':'ผัง '}${n.ref}</small>`:''}</span>${badge}
    </a>`;
  }).join('');

  const sidebar = `
  <nav class="app-sidebar" id="appSidebar">
    ${navHtml}
    <div class="nav-section">อ้างอิง</div>
    <a class="nav-link" href="index.html"><i class="fa-solid fa-globe"></i><span>กลับเว็บสาธารณะ</span></a>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', topbar + sidebar);

  document.querySelectorAll('[data-role]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); setRole(el.dataset.role); });
  });
  const tog = document.getElementById('sbToggle');
  if(tog) tog.addEventListener('click', () => document.getElementById('appSidebar').classList.toggle('open'));
}

/* -------------------------------------------------------- UI BUILDERS */
function stepperHtml(statusKey){
  const cur = STATUS_STEP[statusKey] || 'report';
  const idx = FLOW_STEPS.findIndex(s => s.key === cur);
  return `<div class="flow-stepper">` + FLOW_STEPS.map((s,i) => {
    const cls = i < idx ? 'done' : (i === idx ? 'active' : '');
    const mark = i < idx ? '<i class="fa-solid fa-check"></i>' : (i+1);
    return `<div class="fstep ${cls}">
      <div class="dot">${mark}</div>
      <div class="lbl">${s.label}<br><span style="font-size:.66rem;opacity:.75">${s.ref}</span></div>
    </div>`;
  }).join('') + `</div>`;
}

function statusBadge(statusKey){
  const s = STATUS[statusKey];
  return s ? `<span class="st ${s.cls}">${s.label}</span>` : '';
}

/* เพดาน SLA ที่ใช้จริงกับสำนวน — ชั้นเลขาธิการฯ ใช้ตารางตามชนิดรายงาน/ระยะ
   (ผัง P2 โหนด t5) ส่วนชั้นอื่นยังใช้ค่าที่ติดมากับสำนวน                  */
function effectiveSlaLimit(kase){
  return kase.status === 'PENDING_SECGEN' ? secgenSlaLimit(kase) : kase.slaLimit;
}

function slaBadge(kase){
  const lim = effectiveSlaLimit(kase);
  return `<span class="sla ${slaClass(kase.slaDays, lim)}">
    <i class="fa-regular fa-clock me-1"></i>${slaLabel(kase.slaDays, lim)}</span>`;
}

/* Action bar — ปุ่มเปลี่ยนตามบทบาท (ข้อกำหนดหลักของ Step 3) */
function actionBar(kase, roleId, buttons){
  const role = getRole(roleId);
  const allowed = canAct(kase, roleId);
  let inner;

  if(isUpstreamCase(kase)){
    /* สำนวนยังไม่เข้ากิจกรรมที่ 7 — ไม่มี Action ใดในโมดูลนี้ */
    const ownerRole = STATUS[kase.status] ? getRole(STATUS[kase.status].owner) : null;
    inner = `<div class="no-permission" style="border-color:#d79b00;background:#fff8ec">
      <i class="fa-solid fa-arrow-right-to-bracket me-1"></i>
      <strong>สำนวนนี้ยังไม่เข้าสู่กิจกรรมที่ 7</strong> — อยู่ระหว่างการเสนอตามลำดับชั้น
      ภายในกอง / สำนักงาน ป.ป.ท. เขต ซึ่งเป็นกระบวนงานของ <strong>กิจกรรมที่ 5</strong>
      ${ownerRole ? `<br>ขณะนี้เรื่องอยู่ที่ <strong>${ownerRole.title}</strong>` : ''}
      <br><small>กิจกรรมที่ 7 เริ่มนับเมื่อรายงานมาถึง <strong>เลขาธิการคณะกรรมการ ป.ป.ท.</strong></small>
    </div>`;
  } else if(allowed && buttons.length){
    inner = buttons.map(b =>
      `<button type="button" class="btn ${b.cls} btn-sm" data-act="${b.act}">
        <i class="fa-solid ${b.icon} me-1"></i>${b.label}</button>`).join('');
  } else {
    const ownerRole = STATUS[kase.status] ? getRole(STATUS[kase.status].owner) : null;
    inner = `<div class="no-permission">
      <i class="fa-solid fa-lock me-1"></i>
      บทบาท <strong>${role.title}</strong> ไม่มีสิทธิ์ดำเนินการกับสำนวนนี้ในสถานะปัจจุบัน
      ${ownerRole ? ` — ขณะนี้เรื่องอยู่ที่ <strong>${ownerRole.title}</strong>` : ''}
      <br><small>สลับบทบาทที่มุมขวาบนเพื่อทดสอบสิทธิ์ของผู้ใช้รายอื่น</small>
    </div>`;
  }

  const scopeTag = role.scope === 'UPSTREAM'
    ? `<span class="st st-draft ms-1">นอกขอบเขต กจ.7</span>`
    : `<span class="chip ms-1">ผัง ${role.lane} · ${role.flow}</span>`;
  const editTag = canEditMaster(roleId)
    ? `<span class="st st-urgent ms-1" title="ชีตแถว 15 — มีเพียง 7 คนที่แก้ไขมติ/คำสั่ง/รายงานได้">
         <i class="fa-solid fa-pen-to-square"></i> แก้ไขมติได้</span>`
    : `<span class="st st-closed ms-1" title="ชีตแถว 15/17 — บทบาทนี้แก้ไขมติ/คำสั่ง/รายงานไม่ได้">
         <i class="fa-solid fa-lock"></i> แก้ไขมติไม่ได้</span>`;

  return `<div class="action-bar">
    <div class="role-hint">
      <i class="fa-regular fa-user me-1"></i>กำลังดำเนินการในบทบาท:
      <strong>${role.title}</strong> ${scopeTag} ${editTag}
    </div>${inner}
  </div>`;
}

/* -------------------------------------------- MAIL-MERGE (Document) */
/* แทนค่าฟิลด์ลงเทมเพลต — จำลอง Mail-Merge Template Engine (TOR 7.1.3.6) */
function mergeField(value, placeholder){
  if(value === undefined || value === null || String(value).trim() === ''){
    return `<span class="mergefield empty" title="ยังไม่มีข้อมูล — ต้องกรอกในฟอร์มด้านซ้าย">${placeholder||'……………'}</span>`;
  }
  return `<span class="mergefield filled" title="Auto-fill จากฟอร์ม/ฐานข้อมูลกลาง E-CMIS">${value}</span>`;
}

/* ---------------------------------------------------------- DIALOGS */
function confirmAction(opts){
  return Swal.fire({
    title: opts.title,
    html: opts.html || '',
    icon: opts.icon || 'question',
    showCancelButton: true,
    confirmButtonText: opts.confirmText || 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: opts.danger ? '#a5322a' : '#0a2647',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: { popup:'text-start' }
  });
}
function toastOk(msg){
  Swal.fire({ toast:true, position:'top-end', icon:'success', title:msg,
    showConfirmButton:false, timer:2600, timerProgressBar:true });
}
function toastWarn(msg){
  Swal.fire({ toast:true, position:'top-end', icon:'warning', title:msg,
    showConfirmButton:false, timer:3200, timerProgressBar:true });
}

/* --------------------------------- Digital Signature simulation dialog */
function signDialog(docName, signerName){
  return Swal.fire({
    title:'ลงลายมือชื่อดิจิทัล',
    html:`<div class="text-start" style="font-size:.9rem">
      <p class="mb-2">เอกสาร: <strong>${docName}</strong></p>
      <p class="mb-2">ผู้ลงนาม: <strong>${signerName}</strong></p>
      <div class="mb-2" style="background:#fdf7e8;border-left:4px solid #c9a227;padding:.6rem .8rem;border-radius:0 6px 6px 0">
        ระบบจะแปลงเอกสารเป็น PDF และผนึกลายมือชื่ออิเล็กทรอนิกส์
        ตาม พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ฯ (TOR 14.6)
      </div>
      <label class="form-label mt-2">รหัส OTP ที่ส่งไปยังโทรศัพท์ที่ลงทะเบียน</label>
      <input id="swal-otp" class="form-control" maxlength="6" inputmode="numeric" placeholder="กรอก 6 หลัก (ทดสอบ: 123456)">
      <div class="mt-2" style="font-size:.75rem;color:#6b7280">
        <i class="fa-solid fa-circle-info me-1"></i>ผู้ให้บริการ CA (ThaiD Sign / CA หน่วยงาน) ยังรอ ป.ป.ท. ยืนยัน
      </div>
    </div>`,
    showCancelButton:true, confirmButtonText:'ยืนยันลงนาม', cancelButtonText:'ยกเลิก',
    confirmButtonColor:'#0a2647', cancelButtonColor:'#6b7280', reverseButtons:true,
    preConfirm(){
      const v = document.getElementById('swal-otp').value.trim();
      if(v.length !== 6){ Swal.showValidationMessage('กรุณากรอก OTP ให้ครบ 6 หลัก'); return false; }
      return v;
    }
  });
}

/* ------------------------------------------------------------ EXPORT */
global.ECMIS = {
  ROLES, STATUS, STATUS_STEP, FLOW_STEPS, APPROVAL_CHAIN,
  CASES, RETURN_REASONS, RESOLUTIONS,
  DOC_TYPES, SIGN_PHASE, secgenSlaLimit,
  OPINION_TYPES, chainDivergence, g1Triggers, M28, m28Pending,
  CONFIG, RETURN_SCOPES, MATERIAL_FIELDS, daysUntil,
  UPSTREAM_CHAIN, isUpstreamRole, isUpstreamCase,
  PERM_DEFS, can, canEditMaster, canViewCase,
  thaiDate, slaClass, slaLabel, effectiveSlaLimit, getCase, getRole,
  currentRoleId, currentRole, setRole, inboxFor, canAct, canRecall,
  renderShell, stepperHtml, statusBadge, slaBadge, actionBar,
  mergeField, confirmAction, toastOk, toastWarn, signDialog
};

})(window);
