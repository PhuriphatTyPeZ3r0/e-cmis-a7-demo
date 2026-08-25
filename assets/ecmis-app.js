

(function (global) {
'use strict';

const ROLES = [
  { id:'secgen', login:'Apichat.S', row:1, group:'เลขาธิการฯ/รองเลขาธิการ', title:'เลขาธิการคณะกรรมการ ป.ป.ท.',
    name:'นายอภิชาติ สุจริตกุล', org:'สำนักงาน ป.ป.ท.', lane:'L1', flow:'S1 / G1 — จุดเริ่ม กจ.7', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','sign.report213','decide.complex','sign.order24p1','approve.general','return'] },

  { id:'support_sub', login:'Jiraporn.N', row:2, group:'คณะอนุกรรมการสนับสนุนเลขาธิการฯ', title:'อนุกรรมการสนับสนุนเลขาธิการฯ',
    name:'นางสาวจิราพร นิติกิจ', org:'คณะอนุกรรมการสนับสนุนเลขาธิการฯ', lane:'L2', flow:'S2 / G2', act:'7.1, 7.2',
    perms:['view.assigned','download','support.opinion','support.certify','request.moreinfo'], defaultGroup:'group1' },

  { id:'chairman', login:'Wichai.Y', row:3, group:'ประธานกรรมการ ป.ป.ท.', title:'ประธานกรรมการ ป.ป.ท.',
    name:'นายวิชัย ยุติธรรม', org:'คณะกรรมการ ป.ป.ท.', lane:'L5', flow:'G4 / S7', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','order.agenda','sign.agenda','sign.order24p3','sign.ruling','vote','bypass.approve','return'] },

  { id:'board_sec', login:'Thanakrit.B', row:4, group:'กลุ่มงานวินิจฉัยและมติคณะกรรมการ', title:'เจ้าหน้าที่กลุ่มงานคำวินิจฉัยและมติคณะกรรมการ',
    name:'นายธนกฤต บุญมี', org:'กองบริหารคดี', lane:'L7', flow:'S8 / S10', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','create.agenda','create.invite','record.minutes','lock.pdf','compile.minutes','doc.generate','dispatch.resolution'] },

  { id:'board', login:'Somboon.T', row:5, group:'คณะกรรมการ ป.ป.ท.', title:'กรรมการ ป.ป.ท.',
    name:'นายสมบูรณ์ ธรรมรัฐ', org:'คณะกรรมการ ป.ป.ท.', lane:'L8', flow:'S9 / G5', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','vote','read.agenda.advance'] },

  { id:'affairs', login:'Siriporn.K', row:6, group:'กลุ่มงานกิจการคณะกรรมการ', title:'เจ้าหน้าที่กลุ่มงานกิจการคณะกรรมการ',
    name:'นางสาวศิริพร กิจการ', org:'กองบริหารคดี', lane:'L7', flow:'S7 / S11', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','EDIT.MASTER','doc.generate','order24.draft','secrecy.set'] }
];

const DOC_TYPES = {
  '213': {
    code:'213', label:'รายงานการไต่สวนเบื้องต้น (แบบ ปปท. ๒-๑๓)', short:'รายงาน 213',
    sla:{ waitSign:5, completeSign:3 }
  },
  '644': {
    code:'644', label:'รายงานการไต่สวนข้อเท็จจริง (แบบ ปปท. ๖-๔๔)', short:'รายงาน 644',
    sla:{ waitSign:15, completeSign:15 }
  },

  RULING: {
    code:'RULING', label:'รายงานการไต่สวนวินิจฉัยชี้มูล (ม.24 วรรคท้าย)', short:'รายงานวินิจฉัยชี้มูล',
    sla:{ waitSign:15, completeSign:15 }
  },

  GENERAL: {
    code:'GENERAL', label:'บันทึกเสนอเรื่องทั่วไป / ข้อกฎหมาย / กิจการคณะกรรมการ (กิจกรรม 7.3)', short:'เรื่องทั่วไป/ข้อกฎหมาย',
    sla:{ waitSign:5, completeSign:5 }
  }
};

const SIGN_PHASE = {
  WAIT:     { key:'WAIT',     label:'รอเลขาธิการฯ ลงนาม',       slaKey:'waitSign' },
  COMPLETE: { key:'COMPLETE', label:'ลงนามแล้ว รอส่งต่อให้ครบ', slaKey:'completeSign' }
};

function secgenSlaLimit(kase){
  const dt = DOC_TYPES[kase.docType] || DOC_TYPES['213'];
  const ph = SIGN_PHASE[kase.signPhase] || SIGN_PHASE.WAIT;
  return dt.sla[ph.slaKey];
}

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
  { k:'doc.generate',  cat:'การแก้ไข',  label:'สร้างเอกสารจากแบบร่างอัตโนมัติ' },
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
  { k:'dispatch.resolution',cat:'ปลายน้ำ',label:'ส่งมติคืนกอง / สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต' },
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

function can(permKey, roleId){
  const r = getRole(roleId || currentRoleId());
  return !!(r.perms && r.perms.includes(permKey));
}

function canEditMaster(roleId){ return can('EDIT.MASTER', roleId); }

function canViewCase(kase, roleId){
  const r = getRole(roleId || currentRoleId());
  if(can('view.all', r.id)) return true;
  if(can('view.assigned', r.id)) return !!kase.subCommittee || kase.complex;
  if(can('view.own', r.id)) return kase.owner === r.name || kase.ownerOrg === r.org;
  return false;
}

const STATUS = {

  DRAFT:            { label:'ร่างรายงาน 213 (ในกอง/เขต)',   cls:'st-draft',    owner:'owner',        scope:'UPSTREAM' },
  RETURNED:         { label:'ส่งคืน กจ.5 — รอแก้ไข',        cls:'st-returned', owner:'owner',        scope:'UPSTREAM' },
  PENDING_SECTION:  { label:'รอหัวหน้ากลุ่มงาน (ในกอง/เขต)', cls:'st-pending',  owner:'section_head', scope:'UPSTREAM' },
  PENDING_DIRECTOR: { label:'รอ ผอ.กอง / ผอ.เขต',           cls:'st-pending',  owner:'director',     scope:'UPSTREAM' },
  PENDING_DEPUTY:   { label:'รอผู้ช่วย / รองเลขาธิการฯ',     cls:'st-pending',  owner:'deputy',       scope:'UPSTREAM' },

  PENDING_SECGEN:   { label:'รอเลขาธิการฯ ลงนาม',         cls:'st-pending',  owner:'secgen' },
  IN_SUPPORT_SUB:   { label:'ส่งให้คณะอนุสนับสนุนฯ พิจารณาแล้ว', cls:'st-review', owner:'support_sub' },
  PENDING_URGENT:   { label:'รอ ผอ.กบค. รับรองใบด่วน',     cls:'st-urgent',   owner:'dir_case' },
  PENDING_CHAIRMAN: { label:'รอประธานฯ สั่งการ',           cls:'st-pending',  owner:'chairman' },
  IN_SCREENING:     { label:'อยู่อนุกลั่นกรองฯ',           cls:'st-review',   owner:'subcommittee' },
  AGENDA_SET:       { label:'รอบรรจุวาระ',                cls:'st-agenda',   owner:'board_sec' },

  IN_MEETING:       { label:'อยู่ระหว่างประชุมบอร์ด',      cls:'st-review',   owner:'board_sec' },
  DEFERRED:         { label:'เลื่อน/ถอนวาระ — รอเลขวาระใหม่', cls:'st-returned', owner:'affairs' },
  RESOLVED_PENDING: { label:'มีมติแล้ว รอล็อก PDF/ลงนาม',  cls:'st-pending',  owner:'board_sec' },
  RESOLVED:         { label:'มีมติแล้ว',                  cls:'st-done',     owner:'board_sec' },
  DISPATCHING:      { label:'ส่งมติออกแล้ว รอไฟล์ลงนามกลับ', cls:'st-pending',  owner:'owner' },
  CLOSED:           { label:'ปิดสำนวน',                   cls:'st-closed',   owner:null },

  PENDING_SECTION_72:  { label:'รอหัวหน้ากลุ่มงาน (รายงานวินิจฉัยชี้มูล)',      cls:'st-pending', owner:'section_head' },
  PENDING_DIRECTOR_72: { label:'รอ ผอ.กอง / ผอ.เขต (รายงานวินิจฉัยชี้มูล)',      cls:'st-pending', owner:'director' },
  PENDING_DEPUTY_72:   { label:'รอผู้ช่วย / รองเลขาธิการฯ (รายงานวินิจฉัยชี้มูล)', cls:'st-pending', owner:'deputy' },
  RETURNED_72:         { label:'ตีกลับเจ้าของสำนวน (รายงานวินิจฉัยชี้มูล)',      cls:'st-returned', owner:'owner' },
  PENDING_SECGEN_72:   { label:'รอเลขาธิการฯ พิจารณา / ลงนาม (วินิจฉัยชี้มูล)',   cls:'st-pending', owner:'secgen' },
  IN_SUPPORT_SUB_72:   { label:'ส่งคณะอนุสนับสนุนเลขาธิการฯ พิจารณาแล้ว',        cls:'st-review',  owner:'support_sub' },
  PENDING_URGENT_72:   { label:'รอ ผอ.กบค. รับรองเหตุผลเร่งด่วน',                cls:'st-urgent',  owner:'dir_case' },
  PENDING_CHAIRMAN_URGENT_72: { label:'รอประธานฯ ลงนามมอบหมาย / บรรจุวาระด่วน',  cls:'st-pending', owner:'chairman' },
  IN_SCREENING_72:     { label:'อยู่คณะอนุกลั่นกรองเรื่องไต่สวนข้อเท็จจริง',      cls:'st-review',  owner:'subcommittee' },
  PENDING_INVITE_72:   { label:'รอจัดทำหนังสือเชิญประชุม',                       cls:'st-pending', owner:'board_sec' },
  IN_MEETING_72:       { label:'อยู่ระหว่างประชุมบอร์ด (วินิจฉัยชี้มูล)',         cls:'st-review',  owner:'board_sec' },
  RESOLVED_PENDING_72: { label:'มีมติแล้ว รอจัดทำรายงานวินิจฉัยชี้มูล',          cls:'st-pending', owner:'affairs' },
  PENDING_SIGN_RULING_72: { label:'รอประธานฯ ลงนามรายงานวินิจฉัยชี้มูล',         cls:'st-pending', owner:'chairman' },
  PENDING_AREA_NOTICE_72: { label:'รอพื้นที่บันทึกรับมติ / แจ้งผล (ม.32)',       cls:'st-pending', owner:'owner' },
  DISPATCHING_NACC_72:    { label:'รอส่งเรื่องให้ ป.ป.ช. (นอกอำนาจ ม.19)',       cls:'st-pending', owner:'owner' },
  PENDING_DISPATCH_GUILTY_72: { label:'ชี้มูลความผิดแล้ว รอส่งดำเนินคดี',        cls:'st-review',  owner:'affairs' },
  CLOSED_72: { label:'ปิดสำนวน — จบกระบวนการกิจกรรมที่ 7',                      cls:'st-closed',  owner:null }
};

// รหัสสถานะ CHAR(3) ตามที่ออกแบบไว้ใน tbl_res_request.trr_status (res_db.json) —
// บล็อก 000-099 = สายงานหลัก, บล็อก 100-199 = สายรายงานวินิจฉัยชี้มูล (คีย์ลงท้าย _72)
const STATUS_CODE = {
  DRAFT:'000', RETURNED:'001', PENDING_SECTION:'002', PENDING_DIRECTOR:'003', PENDING_DEPUTY:'004',
  PENDING_SECGEN:'005', IN_SUPPORT_SUB:'006', PENDING_URGENT:'007',
  PENDING_CHAIRMAN:'009', IN_SCREENING:'010', AGENDA_SET:'011', IN_MEETING:'012', DEFERRED:'013',
  RESOLVED_PENDING:'014', RESOLVED:'015', DISPATCHING:'016', CLOSED:'017',

  PENDING_SECTION_72:'100', PENDING_DIRECTOR_72:'101', PENDING_DEPUTY_72:'102', RETURNED_72:'103',
  PENDING_SECGEN_72:'104', IN_SUPPORT_SUB_72:'105', PENDING_URGENT_72:'106', PENDING_CHAIRMAN_URGENT_72:'107',
  IN_SCREENING_72:'108', PENDING_INVITE_72:'109', IN_MEETING_72:'110', RESOLVED_PENDING_72:'111',
  PENDING_SIGN_RULING_72:'112', PENDING_AREA_NOTICE_72:'113', DISPATCHING_NACC_72:'114',
  PENDING_DISPATCH_GUILTY_72:'115', CLOSED_72:'116'
};
const CODE_STATUS = Object.fromEntries(Object.entries(STATUS_CODE).map(([k, v]) => [v, k]));

const TRANSITIONS = [

  { from:'PENDING_SECGEN', to:'IN_SUPPORT_SUB', event:'SIGN_COMPLEX', actor:'secgen',
    ref:'เสนอเลขาธิการฯ', guard:k => g1Triggers(k).required,
    note:'สำนวนซับซ้อน หรือความเห็นในสายบังคับบัญชาไม่ตรงกัน' },
  { from:'PENDING_SECGEN', to:'PENDING_URGENT', event:'SIGN_URGENT', actor:'secgen',
    ref:'เสนอขอเพิ่มวาระด่วน', guard:k => !g1Triggers(k).required && !!k.urgent,
    note:'กรณีไม่ใช่เรื่องซับซ้อน และมีใบด่วน' },
  { from:'PENDING_SECGEN', to:'PENDING_CHAIRMAN', event:'SIGN_NORMAL', actor:'secgen',
    ref:'เสนอตามขั้นตอนปกติ', guard:k => !g1Triggers(k).required && !k.urgent,
    note:'กรณีไม่ใช่เรื่องซับซ้อน และไม่มีใบด่วน' },
  { from:'PENDING_SECGEN', to:'RETURNED', event:'RETURN_TO_SOURCE', actor:'secgen',
    ref:'ส่งคืนสายงานต้นทาง', note:'ส่งคืนเรื่องกลับสายงานต้นทาง' },

  { from:'IN_SUPPORT_SUB', to:'PENDING_CHAIRMAN', event:'SUPPORT_ALIGNED', actor:'support_sub',
    ref:'อนุกรรมการฯ เห็นชอบตามเสนอ', note:'ความเห็นสอดคล้อง — เสนอประธานฯ สั่งการ' },
  { from:'IN_SUPPORT_SUB', to:'PENDING_URGENT', event:'SUPPORT_DIVERGED_URGENT', actor:'support_sub',
    ref:'อนุกรรมการฯ เห็นชอบวาระด่วน', guard:k => !!k.urgent,
    note:'ความเห็นไม่ตรงกัน — เสนอพิจารณาวาระด่วน' },
  { from:'IN_SUPPORT_SUB', to:'PENDING_CHAIRMAN', event:'SUPPORT_DIVERGED', actor:'support_sub',
    ref:'อนุกรรมการฯ เห็นชอบวาระปกติ', guard:k => !k.urgent, note:'ความเห็นไม่ตรงกัน — เสนอเข้าการกลั่นกรองปกติ' },

  { from:'PENDING_URGENT', to:'PENDING_CHAIRMAN', event:'URGENT_CERTIFY', actor:'dir_case',
    ref:'รับรองเหตุผลเร่งด่วน', note:'ผอ.กบค. ลงนามรับรองเหตุผลเร่งด่วน' },
  { from:'PENDING_URGENT', to:'IN_SCREENING', event:'URGENT_REJECT', actor:'dir_case',
    ref:'ไม่รับรองเหตุผลเร่งด่วน', note:'ไม่รับรองใบด่วน — ปรับเข้าสู่เส้นทางกลั่นกรองปกติ' },

  { from:'PENDING_CHAIRMAN', to:'IN_SCREENING', event:'ORDER_SCREENING', actor:'chairman',
    ref:'ประธานฯ สั่งส่งกลั่นกรอง', note:'สั่งส่งกลั่นกรองตามปกติ' },
  { from:'PENDING_CHAIRMAN', to:'AGENDA_SET', event:'ORDER_AGENDA_URGENT', actor:'chairman',
    ref:'ประธานฯ สั่งบรรจุวาระด่วน', guard:k => !!k.urgentCertified,
    note:'สั่งบรรจุวาระด่วน — ต้องมีลายเซ็นรับรองของ ผอ.กบค. ก่อนเท่านั้น' },

  { from:'IN_SCREENING', to:'AGENDA_SET', event:'SCREENING_RESOLVED', actor:'subcommittee',
    ref:'กลั่นกรองแล้วเสร็จ' },

  { from:'AGENDA_SET', to:'IN_MEETING', event:'OPEN_AGENDA', actor:'board_sec',
    ref:'เปิดการประชุม' },
  { from:'IN_MEETING', to:'RESOLVED_PENDING', event:'RECORD_RESOLUTION', actor:'board_sec',
    ref:'บันทึกมติที่ประชุม', guard:k => !!k.quorumOk,
    note:'องค์ประชุมไม่ครบ ระบบต้องบล็อกการบันทึกมติ' },
  { from:'IN_MEETING', to:'DEFERRED', event:'DEFER_AGENDA', actor:'board_sec',
    ref:'ถอน/เลื่อนวาระ', note:'เลื่อน/ถอนวาระ — ต้องปิดเลขวาระเดิม' },
  { from:'DEFERRED', to:'AGENDA_SET', event:'REAGENDA', actor:'affairs',
    ref:'บรรจุวาระใหม่', guard:k => !!k.newAgendaNo,
    note:'กลับเข้าประชุมต้องได้เลขวาระใหม่เสมอ' },

  { from:'RESOLVED_PENDING', to:'RESOLVED', event:'LOCK_PDF', actor:'board_sec',
    ref:'อนุมัติมติที่ประชุม', guard:k => can('EDIT.MASTER', k.actorRoleId) || !k.actorRoleId,
    note:'ล็อกไฟล์ PDF — แก้ไขได้เฉพาะ 7 คนที่มีสิทธิ์ EDIT.MASTER' },
  { from:'RESOLVED', to:'DISPATCHING', event:'DISPATCH_EXTERNAL', actor:'owner',
    ref:'ส่งเรื่องหน่วยงานภายนอก', guard:k => k.resolution === 'FORWARD' && !!k.forwardTo &&
                               (forwardTarget(k.forwardTo) || {}).external === true,
    note:'ปลายทางนอกองค์กรเท่านั้นที่ต้องรอไฟล์สแกนฉบับลงนามกลับ' },

  { from:'DISPATCHING', to:'CLOSED', event:'UPLOAD_SIGNED_SCAN', actor:'owner',
    ref:'ระเบียบการคัดสำเนาและอัปโหลดฉบับลงนาม · ม.18/1',
    guard:k => !!k.signedScanUploaded &&
               (!(forwardTarget(k.forwardTo) || {}).requireArchiveCopy || !!k.archiveCopyKept),
    note:'ต้องอัปโหลดไฟล์สแกนฉบับลงนาม และ (ถ้าปลายทางบังคับ) ต้องคัดสำเนาสำนวนเก็บไว้เป็นหลักฐานตาม ม.18/1' },
  { from:'RESOLVED', to:'CLOSED', event:'CLOSE_CASE', actor:'owner',
    ref:'บันทึกมติการไต่สวน', note:'รับไว้ไต่สวน (ยิงกลับ กจ.5) หรือไม่รับไว้ไต่สวน (ปิดสำนวน)' },
  { from:'RESOLVED', to:'AGENDA_SET', event:'REVISE_RESOLUTION', actor:'affairs',
    ref:'ขอทบทวนมติ', guard:k => !!k.newAgendaNo,
    note:'ขอแก้ไข/ทบทวนมติ — มติเดิมไม่ถูกลบ ผูกคู่กับมติใหม่' },

  { from:'CLOSED', to:'PENDING_SECTION_72', event:'SUBMIT_RULING_REPORT', actor:'owner',
    ref:'เสนอรายงานไต่สวนชี้มูล', guard:k => k.resolution === 'ACCEPT_S24P1' || k.resolution === 'ACCEPT_S24P3',
    note:'คณะไต่สวน/คณะพนักงานไต่สวนตาม ม.24 เสนอรายงานการไต่สวนวินิจฉัยชี้มูล' },

  { from:'PENDING_SECTION_72', to:'PENDING_DIRECTOR_72', event:'PROPOSE_72', actor:'section_head', ref:'เสนอตามลำดับชั้น' },
  { from:'PENDING_SECTION_72', to:'RETURNED_72', event:'RETURN_72', actor:'section_head', ref:'ส่งคืนเสนอตามลำดับชั้น' },
  { from:'PENDING_DIRECTOR_72', to:'PENDING_DEPUTY_72', event:'PROPOSE_72', actor:'director', ref:'เสนอตามลำดับชั้น' },
  { from:'PENDING_DIRECTOR_72', to:'RETURNED_72', event:'RETURN_72', actor:'director', ref:'ส่งคืนเสนอตามลำดับชั้น' },
  { from:'PENDING_DEPUTY_72', to:'PENDING_SECGEN_72', event:'PROPOSE_72', actor:'deputy', ref:'เสนอตามลำดับชั้น' },
  { from:'PENDING_DEPUTY_72', to:'RETURNED_72', event:'RETURN_72', actor:'deputy', ref:'ส่งคืนเสนอตามลำดับชั้น' },
  { from:'RETURNED_72', to:'PENDING_SECTION_72', event:'RESUBMIT_72', actor:'owner', ref:'ส่งคืนแก้ไขและเสนอใหม่' },

  { from:'PENDING_SECGEN_72', to:'IN_SUPPORT_SUB_72', event:'SIGN_COMPLEX_72', actor:'secgen',
    ref:'เสนอสำนวนซับซ้อน', guard:k => !!k.complex72,
    note:'สำนวนมีประเด็นซับซ้อนยุ่งยาก — เข้าคณะอนุกรรมการสนับสนุนเลขาธิการฯ ก่อน' },
  { from:'PENDING_SECGEN_72', to:'PENDING_URGENT_72', event:'SIGN_URGENT_72', actor:'secgen',
    ref:'เสนอขอเพิ่มวาระด่วน', guard:k => !k.complex72 && !!k.urgent72 },
  { from:'PENDING_SECGEN_72', to:'IN_SCREENING_72', event:'SIGN_NORMAL_72', actor:'secgen',
    ref:'เสนอเข้าการกลั่นกรองปกติ', guard:k => !k.complex72 && !k.urgent72 },
  { from:'IN_SUPPORT_SUB_72', to:'PENDING_URGENT_72', event:'SUPPORT_DONE_URGENT_72', actor:'support_sub',
    ref:'เห็นชอบวาระด่วน', guard:k => !!k.urgent72 },
  { from:'IN_SUPPORT_SUB_72', to:'IN_SCREENING_72', event:'SUPPORT_DONE_72', actor:'support_sub',
    ref:'เห็นชอบวาระปกติ', guard:k => !k.urgent72 },

  { from:'PENDING_URGENT_72', to:'PENDING_CHAIRMAN_URGENT_72', event:'URGENT_CERTIFY_72', actor:'dir_case',
    ref:'รับรองเหตุผลเร่งด่วน', note:'ผอ.กบค. รับรองเหตุผลเร่งด่วน' },
  { from:'PENDING_CHAIRMAN_URGENT_72', to:'PENDING_INVITE_72', event:'AGENDA_URGENT_72', actor:'chairman',
    ref:'ลงนามบรรจุวาระด่วน', note:'ประธานฯ ลงนามมอบหมาย/บรรจุวาระด่วน — ข้ามขั้นตอนการกลั่นกรอง' },

  { from:'IN_SCREENING_72', to:'PENDING_INVITE_72', event:'SCREEN_DONE_72', actor:'subcommittee',
    ref:'กลั่นกรองและบรรจุวาระ' },

  { from:'PENDING_INVITE_72', to:'IN_MEETING_72', event:'OPEN_MEETING_72', actor:'board_sec', ref:'เปิดการประชุม' },
  { from:'IN_MEETING_72', to:'RESOLVED_PENDING_72', event:'RECORD_RESOLUTION_72', actor:'board_sec',
    ref:'บันทึกมติที่ประชุม', guard:k => !!k.quorumOk72,
    note:'องค์ประชุมไม่ครบ ระบบต้องบล็อกการบันทึกมติ (เช่นเดียวกับชั้นไต่สวนเบื้องต้น)' },

  { from:'RESOLVED_PENDING_72', to:'PENDING_SIGN_RULING_72', event:'DRAFT_RULING_72', actor:'affairs', ref:'ร่างรายงานวินิจฉัยชี้มูล' },
  { from:'PENDING_SIGN_RULING_72', to:'PENDING_SECTION_72', event:'SIGN_MORE_INVESTIGATE_72', actor:'chairman',
    ref:'สั่งไต่สวนเพิ่มเติม · ม.24 วรรคท้าย', guard:k => k.resolution72 === 'MORE_INVESTIGATE_72',
    note:'"จะสั่งให้ไต่สวนเพิ่มเติม หรือจะไต่สวนเองใหม่ทั้งหมดหรือบางส่วนก็ได้" — วนกลับเข้าสายอนุมัติใหม่ทั้งสาย (round72++)' },
  { from:'PENDING_SIGN_RULING_72', to:'PENDING_AREA_NOTICE_72', event:'SIGN_NO_MERIT_72', actor:'chairman',
    ref:'ข้อกล่าวหาไม่มีมูล · ม.32', guard:k => k.resolution72 === 'NO_MERIT_72' },
  { from:'PENDING_SIGN_RULING_72', to:'DISPATCHING_NACC_72', event:'SIGN_FORWARD_NACC_72', actor:'chairman',
    ref:'ส่งเรื่องให้ ป.ป.ช. · ม.19(ข)(1)', guard:k => k.resolution72 === 'FORWARD_NACC' },
  { from:'PENDING_SIGN_RULING_72', to:'PENDING_DISPATCH_GUILTY_72', event:'SIGN_GUILTY_72', actor:'chairman',
    ref:'วินิจฉัยชี้มูลความผิด · ม.17(3)(4)·ม.38·ม.44', guard:k => k.resolution72 === 'GUILTY_72' },

  { from:'PENDING_AREA_NOTICE_72', to:'CLOSED_72', event:'NOTICE_RECORDED_72', actor:'owner',
    ref:'แจ้งผลผู้ถูกกล่าวหา · ม.32', guard:k => !!k.noticeSentDate72,
    note:'บันทึกรับมติ + แจ้งผู้ถูกกล่าวหาแล้วไม่ช้ากว่า 15 วันนับแต่วันที่คณะกรรมการ ป.ป.ท. มีมติ' },
  { from:'DISPATCHING_NACC_72', to:'CLOSED_72', event:'NACC_DISPATCHED_72', actor:'owner',
    ref:'ส่งมอบสำนวนให้ ป.ป.ช. · ม.19(ข)(1)', guard:k => !!k.signedScanUploaded72,
    note:'ส่งเรื่องพร้อมสำนวนให้ ป.ป.ช. ภายใน 15 วันนับแต่วันที่ได้รับเรื่อง — ต้องอัปโหลดไฟล์สแกนฉบับนำส่งกลับ' },

  { from:'PENDING_DISPATCH_GUILTY_72', to:'CLOSED_72', event:'CLOSE_GUILTY_72', actor:'affairs',
    ref:'ส่งเรื่องดำเนินการทางอาญาและวินัย · ม.38·ม.44', guard:k => bothTracksDone72(k),
    note:'ปิดสำนวนได้เมื่อสายอาญา (ถ้ามี) ส่งอัยการแล้ว และสายวินัย (ถ้ามี) ส่งหน่วยงานต้นสังกัดแล้ว' }
];

function transitionsBetween(from, to){
  return TRANSITIONS.filter(t => t.from === from && t.to === to);
}

function canTransition(from, to, kase){
  if(!STATUS[from]) return { ok:false, reason:'UNKNOWN_FROM_STATE' };
  if(!STATUS[to])   return { ok:false, reason:'UNKNOWN_TO_STATE' };
  const cands = transitionsBetween(from, to);
  if(!cands.length) return { ok:false, reason:'NO_SUCH_TRANSITION' };

  const k = kase || {};
  if(k.actorRoleId){
    const byActor = cands.filter(t => t.actor === k.actorRoleId);
    if(!byActor.length) return { ok:false, reason:'WRONG_ACTOR', expected:cands.map(t => t.actor) };
  }
  const pool = k.actorRoleId ? cands.filter(t => t.actor === k.actorRoleId) : cands;
  const passed = pool.find(t => !t.guard || t.guard(k) === true);
  return passed
    ? { ok:true, transition:passed, event:passed.event, ref:passed.ref }
    : { ok:false, reason:'GUARD_FAILED', guards:pool.map(t => t.note || t.ref) };
}

function nextStates(from, kase){
  return TRANSITIONS.filter(t => t.from === from)
    .filter(t => !t.guard || !kase || t.guard(kase) === true)
    .map(t => ({ to:t.to, event:t.event, actor:t.actor, ref:t.ref }));
}

const UPSTREAM_CHAIN = ['owner','section_head','director','deputy'];

const APPROVAL_CHAIN = ['secgen'];

const FLOW_STEPS = [
  { key:'secgen',    label:'เลขาธิการฯ พิจารณา / ลงนาม', ref:'เสนอเลขาธิการฯ' },
  { key:'urgent',    label:'ใบด่วน / ผอ.กบค.',           ref:'รับรองเหตุผลเร่งด่วน' },
  { key:'chairman',  label:'ประธานฯ สั่งการ',            ref:'ประธานฯ สั่งการ' },
  { key:'screening', label:'อนุกลั่นกรองฯ 1–8',          ref:'อนุกรรมการกลั่นกรอง' },
  { key:'agenda',    label:'บรรจุวาระ',                 ref:'บรรจุวาระการประชุม' },
  { key:'resolution',label:'บอร์ดลงมติ',                ref:'คณะกรรมการลงมติ' },
  { key:'order',     label:'ออกคำสั่ง ม.24',             ref:'ออกคำสั่ง' }
];

const STATUS_STEP = {

  DRAFT:'secgen', RETURNED:'secgen',
  PENDING_SECTION:'secgen', PENDING_DIRECTOR:'secgen', PENDING_DEPUTY:'secgen',
  PENDING_SECGEN:'secgen', IN_SUPPORT_SUB:'secgen',
  PENDING_URGENT:'urgent',
  PENDING_CHAIRMAN:'chairman',
  IN_SCREENING:'screening',
  AGENDA_SET:'agenda',
  RESOLVED:'resolution', CLOSED:'order'
};

/* Page filenames are the single canonical name across the whole site (no more
   root/res dual-naming) so this is just an identity pass-through, kept as a
   function since it's part of the public ECMIS API other modules call. */
function resolvePage(path) {
  return path;
}

function isUpstreamRole(roleId){ const r = getRole(roleId); return r.scope === 'UPSTREAM'; }
/* board_sec's home page is agenda-registry.html (ทะเบียนวาระการประชุม) — every other
   role still shares inbox.html. This is the one place that decision lives, so
   every redirect/nav-link/breadcrumb across the app stays correct if that ever changes.
   (resolution-inbox.html is still board_sec's work-inbox for the full flow — reachable via
   its own sidebar item, "รายการรอจัดทำมติ" — it's just no longer the post-login landing page.) */
function homeHref(roleId){
  const r = roleId || currentRoleId();
  if (r === 'board_sec') return resolvePage('agenda-registry.html');
  if (r === 'support_sub' || r === 'sup_chair' || r === 'sup_sec' || r === 'sup_asst') return resolvePage('support-subcommittee-inbox.html');
  if (r === 'board' || r === 'board_ex') return resolvePage('board-inbox.html');
  return resolvePage('inbox.html');
}
function isUpstreamCase(kase){ const s = STATUS[kase.status]; return !!(s && s.scope === 'UPSTREAM'); }
function isCase72(kase){
  return !!kase && (
    kase.procType === '7.2' ||
    kase.docType === 'RULING' ||
    String(kase.id || '').includes('1119/') ||
    String(kase.id || '').includes('1396/') ||
    String(kase.id || '').includes('1402/')
  );
}
function isCase73(kase){
  return !!kase && (
    kase.procType === '7.3' ||
    kase.docType === 'GENERAL' ||
    kase.docType === 'GENERAL_MEMO' ||
    String(kase.id || '').startsWith('กจ.') ||
    String(kase.legalBase || '').includes('ม.33') ||
    String(kase.legalBase || '').includes('ระเบียบ') ||
    String(kase.legalBase || '').includes('นโยบาย')
  );
}

const PAGE_FOR_72 = {
  PENDING_SECTION_72:'approval-review.html', PENDING_DIRECTOR_72:'approval-review.html',
  PENDING_DEPUTY_72:'approval-review.html', RETURNED_72:'approval-review.html',
  PENDING_SECGEN_72:'approval-review.html',
  IN_SUPPORT_SUB_72:'support-subcommittee.html',
  PENDING_URGENT_72:'urgent-agenda.html', PENDING_CHAIRMAN_URGENT_72:'urgent-agenda.html',
  IN_SCREENING_72:'subcommittee-screening.html',
  PENDING_INVITE_72:'agenda-registry.html',
  IN_MEETING_72:'board-resolution.html',
  RESOLVED_PENDING_72:'ruling-report.html',
  PENDING_SIGN_RULING_72:'ruling-report.html',
  PENDING_AREA_NOTICE_72:'ruling-report.html',
  DISPATCHING_NACC_72:'ruling-report.html',
  PENDING_DISPATCH_GUILTY_72:'ruling-report.html',
  CLOSED_72:'board-resolution.html'
};
function pageForCase72(kase){ return resolvePage(PAGE_FOR_72[kase.status] || 'case-register.html'); }

function pageForCaseByStatus(kase) {
  if (!kase) return resolvePage('case-register.html');
  if (isCase72(kase)) return pageForCase72(kase);
  const st = kase.status;
  if (['PENDING_SECGEN', 'RETURNED', 'DRAFT', 'PENDING_SECTION', 'PENDING_DIRECTOR', 'PENDING_DEPUTY'].includes(st)) {
    return resolvePage('approval-review.html');
  }
  if (st === 'IN_SUPPORT_SUB') return resolvePage('support-subcommittee.html');
  if (st === 'IN_SCREENING') return resolvePage('subcommittee-screening.html');
  if (['PENDING_CHAIRMAN', 'PENDING_URGENT'].includes(st)) {
    return resolvePage('chairman-agenda.html');
  }
  if (st === 'AGENDA_SET') return resolvePage('agenda-registry.html');
  if (['IN_MEETING', 'RESOLVED_PENDING', 'RESOLVED', 'DEFERRED', 'CLOSED'].includes(st)) {
    return resolvePage('board-resolution.html');
  }
  return resolvePage('approval-review.html');
}

const OPINION_TYPES = {
  ACCEPT:  { code:'ACCEPT',  label:'เห็นควรรับไว้ไต่สวน' },
  REJECT:  { code:'REJECT',  label:'เห็นควรไม่รับไว้ไต่สวน / ยุติเรื่อง' },
  MORE:    { code:'MORE',    label:'เห็นควรแสวงหาข้อเท็จจริงเพิ่มเติม' },
  FORWARD: { code:'FORWARD', label:'เห็นควรส่งเรื่องให้ ป.ป.ช.' }
};

function chainDivergence(kase){
  const ops = kase.chainOpinions || [];
  const kinds = [...new Set(ops.map(o => o.type))];
  const diverged = kinds.length > 1;
  let split = null;
  if(diverged){

    for(let i = 1; i < ops.length; i++){
      if(ops[i].type !== ops[i-1].type){ split = { from: ops[i-1], to: ops[i] }; break; }
    }
  }
  return { opinions: ops, diverged, kinds, split };
}

function g1Triggers(kase){
  const d = chainDivergence(kase);
  return {
    complex:   !!kase.complex,
    diverged:  d.diverged,
    divergence: d,
    required:  !!kase.complex || d.diverged
  };
}

const BOARD_MIN_IN_OFFICE = 5;

function boardQuorum({ inOffice, present, forV = 0, againstV = 0, abstainV = 0, chairBreaksTie = false }){
  const boardValid  = inOffice >= BOARD_MIN_IN_OFFICE;
  const quorumMin   = Math.ceil(inOffice / 2);
  const quorumOk    = boardValid && present >= quorumMin;
  const majorityMin = Math.floor(inOffice / 2) + 1;
  const tie         = forV === againstV && forV > 0;
  const effectiveFor= tie && chairBreaksTie ? forV + 1 : forV;
  const majorityOk  = effectiveFor >= majorityMin;
  return {
    boardValid, quorumMin, quorumOk, majorityMin, majorityOk, tie,
    effectiveFor, forV, againstV, abstainV, present, inOffice,

    canRecord: boardValid && quorumOk && majorityOk,
    blockedBy: !boardValid ? 'M10_BOARD_INCOMPLETE'
             : !quorumOk   ? 'M12_NO_QUORUM'
             : !majorityOk ? 'M15_NO_MAJORITY' : null
  };
}

const M24P1_MIN_PANEL = 2;
const M24P1_STAFF_FREE = 2;

function panelComposition({ officers = 0, staff = 0 } = {}){
  const total = officers + staff;

  const minSize    = total >= M24P1_MIN_PANEL;

  const hasOfficer = officers >= 1;

  const officerMin = staff <= M24P1_STAFF_FREE ? 0 : Math.ceil(staff / 2);
  const ratioOk    = staff <= M24P1_STAFF_FREE || officers >= officerMin;
  return {
    officers, staff, total, minSize, hasOfficer, ratioOk, officerMin,
    exceptional: staff > M24P1_STAFF_FREE,

    valid: minSize && hasOfficer && ratioOk,
    blockedBy: !minSize    ? 'M24P1_MIN_PANEL'
             : !hasOfficer ? 'M24P1_NO_OFFICER'
             : !ratioOk    ? 'M24P1_OFFICER_RATIO' : null
  };
}

const M28 = { cycleDays: 15, boardSilenceDays: 15 };

const M28_ORDERS = [
  { code:'ACCEPT',  label:'สั่งรับเรื่องไว้พิจารณา',      lawRef:'ม.28' },
  { code:'REJECT',  label:'สั่งไม่รับเรื่องไว้พิจารณา',   lawRef:'ม.28 ประกอบ ม.25 / ม.26' },
  { code:'DISMISS', label:'สั่งจำหน่ายเรื่อง',            lawRef:'ม.28 ประกอบ ม.26' }
];
function m28Order(code){ return M28_ORDERS.find(o => o.code === code) || null; }

function m28Pending(){
  return CASES.filter(c => c.m28 && c.m28.reported === false);
}

const ACT7_SECTIONS = [
  { id: 1, name: 'Section 1: ขั้นตอนเสนอกลั่นกรองและบรรจุวาระ', shortName: 'Section 1', badgeCls: 'bg-info text-dark', borderCls: 'border-info' },
  { id: 2, name: 'Section 2: ขั้นตอนการพิจารณาของคณะกรรมการ ป.ป.ท.', shortName: 'Section 2', badgeCls: 'bg-warning text-dark', borderCls: 'border-warning' },
  { id: 3, name: 'Section 3: ขั้นตอนหลังบอร์ดมีมติ / คำสั่ง / การดำเนินการ', shortName: 'Section 3', badgeCls: 'bg-purple text-white', borderCls: 'border-purple' },
  { id: 4, name: 'Section 4: ขั้นตอนส่งออกและเสร็จสิ้น', shortName: 'Section 4', badgeCls: 'bg-success text-white', borderCls: 'border-success' }
];

const RESOLUTION_STAGES = [
  { n: 1, label: 'อยู่ระหว่างการจัดทำมติ', icon: 'fa-hourglass-half', cls: 'st-stage-1' },
  { n: 2, label: 'จัดทำมติแล้วเสร็จ', icon: 'fa-circle-check', cls: 'st-stage-2' },
  { n: 3, label: 'ส่งสำเนามติเพื่อจัดทำคำสั่ง', icon: 'fa-file-signature', cls: 'st-stage-3' },
  { n: 4, label: 'ส่งมติและเอกสารที่เกี่ยวข้องเพื่อทำความเห็นชี้มูล (กรณีชี้มูล)', icon: 'fa-gavel', cls: 'st-stage-4' },
  { n: 5, label: 'ส่งมติและเอกสารที่เกี่ยวข้องคืนเจ้าของสำนวน/ผู้รับผิดชอบ', icon: 'fa-arrow-rotate-left', cls: 'st-stage-5' },
  { n: 6, label: 'จัดทำรายงานประชุมแล้วเสร็จ', icon: 'fa-clipboard-check', cls: 'st-stage-6' }
];

function resolutionStageLabel(n) {
  const s = RESOLUTION_STAGES.find(x => x.n === n);
  return s ? s.label : '';
}

function resolutionStageBadge(n) {
  const s = RESOLUTION_STAGES.find(x => x.n === n) || RESOLUTION_STAGES[0];
  return `<span class="st ${s.cls}"><i class="fa-solid ${s.icon} me-1"></i>${s.label}</span>`;
}

function computeResolutionStage(c) {
  if (!c) return 1;
  if (c.meetingReportDone || c.status === 'CLOSED' || c.status === 'DISPATCHING') {
    return 6;
  }
  if (c.status !== 'RESOLVED' && !c.recordedDocHtml && !c.resolution) {
    return 1;
  }
  
  const resCode = (typeof c.resolution === 'object' ? c.resolution?.code : c.resolution) || c.resolutionCode || '';
  
  if (resCode.includes('ACCEPT') || resCode.includes('M24') || (c.procType === '7.1' && (resCode === 'ACCEPT_S24P1' || resCode === 'ACCEPT_S24P3' || resCode === 'ACCEPT_PRELIMINARY'))) {
    if (c.order24Signed || c.order24Done) return 6;
    return 3;
  }

  if (c.procType === '7.2' || resCode.includes('RULING') || resCode.includes('DISCIPLINARY') || resCode.includes('CRIMINAL') || resCode.includes('PROSECUTE')) {
    if (c.rulingDocSigned) return 6;
    return 4;
  }

  if (resCode.includes('DISMISS') || resCode.includes('FORWARD') || resCode.includes('NACC') || resCode.includes('MORE') || resCode.includes('NOT_ACCEPTED') || resCode.includes('NO_GROUND')) {
    return 5;
  }

  if (c.status === 'RESOLVED' || c.recordedDocHtml) {
    return 2;
  }

  return 1;
}

const ACT7_STATUSES = [

  { section: 1, name: 'อยู่ระหว่างกลั่นกรองโดยอนุกรรมการฯ', icon: 'fa-users-gear' },
  { section: 1, name: 'รอประธานอนุมัติบรรจุวาระ', icon: 'fa-user-tie' },
  { section: 1, name: 'บรรจุระเบียบวาระการประชุมแล้ว', icon: 'fa-calendar-check' },

  { section: 2, name: 'อยู่ระหว่างพิจารณาโดยคณะกรรมการ ป.ป.ท.', icon: 'fa-gavel' },
  { section: 2, name: 'บอร์ดมีมติแล้ว - รอจัดทำรายงานการประชุม', icon: 'fa-file-signature' },
  { section: 2, name: 'อยู่ระหว่างการจัดทำมติ', icon: 'fa-file-pen' },
  { section: 2, name: 'จัดทำมติแล้วเสร็จ', icon: 'fa-file-circle-check' },
  { section: 2, name: 'ส่งสำเนามติเพื่อจัดทำคำสั่ง', icon: 'fa-copy' },
  { section: 2, name: 'ส่งมติและเอกสารที่เกี่ยวข้องเพื่อทำความเห็นชี้มูล (กรณีชี้มูล)', icon: 'fa-file-shield' },
  { section: 2, name: 'ส่งมติและเอกสารที่เกี่ยวข้องคืนเจ้าของสำนวน/ผู้รับผิดชอบ', icon: 'fa-share-from-square' },
  { section: 2, name: 'จัดทำรายงานประชุมแล้วเสร็จ', icon: 'fa-file-circle-check' },

  { section: 3, name: 'บอร์ดมีมติรับไต่สวน - รอจัดทำคำสั่ง ม.24', icon: 'fa-file-shield' },
  { section: 3, name: 'อยู่ระหว่างเสนอลงนามคำสั่ง ม.24 วรรคแรก', icon: 'fa-file-pen' },
  { section: 3, name: 'อยู่ระหว่างเสนอลงนามคำสั่ง ม.24 วรรคสาม', icon: 'fa-file-circle-check' },
  { section: 3, name: 'บอร์ดมีมติไม่รับไต่สวน - รอดำเนินการปิดสำนวน', icon: 'fa-box-archive' },
  { section: 3, name: 'บอร์ดมีมติส่ง ป.ป.ช.', icon: 'fa-paper-plane' },
  { section: 3, name: 'บอร์ดมีมติส่งไต่สวนพยานเพิ่มเติม', icon: 'fa-magnifying-glass-plus' },
  { section: 3, name: 'บอร์ดมีมติอื่นๆ - ส่งแจ้งประสานงานหน่วยงาน', icon: 'fa-share-nodes' },

  { section: 4, name: 'ส่งออกผลมติและคำสั่งเรียบร้อย', icon: 'fa-circle-check' }
];

function getAct7Status(c) {
  if (c && c.act7Status) return c.act7Status;

  const st = c ? c.status : '';
  const res = c ? (c.resolution || c.boardResolution || '') : '';

  if (st === 'DISPATCHING' || st === 'CLOSED') {
    return 'ส่งออกผลมติและคำสั่งเรียบร้อย';
  }
  if (st === 'RESOLVED_PENDING') {
    return 'บอร์ดมีมติแล้ว - รอจัดทำรายงานการประชุม';
  }
  if (st === 'IN_MEETING' || st === 'DEFERRED') {
    return 'อยู่ระหว่างพิจารณาโดยคณะกรรมการ ป.ป.ท.';
  }
  if (st === 'AGENDA_SET') {
    return 'บรรจุระเบียบวาระการประชุมแล้ว';
  }
  if (st === 'PENDING_CHAIRMAN') {
    return 'รอประธานอนุมัติบรรจุวาระ';
  }
  if (st === 'IN_SCREENING') {
    return 'อยู่ระหว่างกลั่นกรองโดยอนุกรรมการฯ';
  }
  if (st === 'RESOLVED') {
    if (c.resolutionStage && c.resolutionStage < 6) {
      const stageLabel = resolutionStageLabel(c.resolutionStage);
      if (stageLabel) return stageLabel;
    }
    if (res === 'ACCEPT_S24P1' || res === 'ACCEPT') {
      if (c.order24Signed) return 'ส่งออกผลมติและคำสั่งเรียบร้อย';
      if (c.order24Drafted) return 'อยู่ระหว่างเสนอลงนามคำสั่ง ม.24 วรรคแรก';
      return 'บอร์ดมีมติรับไต่สวน - รอจัดทำคำสั่ง ม.24';
    }
    if (res === 'ACCEPT_S24P3') {
      if (c.order24Signed) return 'ส่งออกผลมติและคำสั่งเรียบร้อย';
      return 'อยู่ระหว่างเสนอลงนามคำสั่ง ม.24 วรรคสาม';
    }
    if (res === 'REJECT' || res === 'DISMISS' || res === 'NO_GROUND') {
      return 'บอร์ดมีมติไม่รับไต่สวน - รอดำเนินการปิดสำนวน';
    }
    if (res === 'FORWARD' || (c.forwardTo && c.forwardTo.includes('NACC'))) {
      return 'บอร์ดมีมติส่ง ป.ป.ช.';
    }
    if (res === 'MORE' || res === 'MORE_INFO') {
      return 'บอร์ดมีมติส่งไต่สวนพยานเพิ่มเติม';
    }
    if (res === 'OTHER' || res === 'FORWARD_OTHER') {
      return 'บอร์ดมีมติอื่นๆ - ส่งแจ้งประสานงานหน่วยงาน';
    }
    return 'บอร์ดมีมติแล้ว - รอจัดทำรายงานการประชุม';
  }

  return 'ยังไม่เข้าสู่กิจกรรมที่ 7';
}

const ACT7_STATUSES_72 = [
  { section: 1, name: 'อยู่ระหว่างสายอนุมัติ/เลขาธิการฯ พิจารณา (วินิจฉัยชี้มูล)', icon: 'fa-user-pen' },
  { section: 1, name: 'อยู่ระหว่างกลั่นกรอง/เตรียมวาระ (วินิจฉัยชี้มูล)', icon: 'fa-users-gear' },
  { section: 2, name: 'อยู่ระหว่างพิจารณาโดยคณะกรรมการ ป.ป.ท. (วินิจฉัยชี้มูล)', icon: 'fa-gavel' },
  { section: 2, name: 'บอร์ดมีมติแล้ว - รอจัดทำรายงานวินิจฉัยชี้มูล', icon: 'fa-file-signature' },
  { section: 3, name: 'รอส่งดำเนินการ/แจ้งผลตามมติวินิจฉัยชี้มูล', icon: 'fa-share-nodes' },
  { section: 4, name: 'ปิดสำนวน (กิจกรรมที่ 7.2)', icon: 'fa-circle-check' }
];
const ACT7_STAGE_72 = {
  PENDING_SECTION_72:0, PENDING_DIRECTOR_72:0, PENDING_DEPUTY_72:0, RETURNED_72:0, PENDING_SECGEN_72:0,
  IN_SUPPORT_SUB_72:1, PENDING_URGENT_72:1, PENDING_CHAIRMAN_URGENT_72:1, IN_SCREENING_72:1, PENDING_INVITE_72:1,
  IN_MEETING_72:2,
  RESOLVED_PENDING_72:3, PENDING_SIGN_RULING_72:3,
  PENDING_AREA_NOTICE_72:4, DISPATCHING_NACC_72:4, PENDING_DISPATCH_GUILTY_72:4,
  CLOSED_72:5
};
function getAct7Status72(c) {
  if (c && c.act7Status72) return c.act7Status72;
  const idx = ACT7_STAGE_72[c && c.status];
  return ACT7_STATUSES_72[idx !== undefined ? idx : 0].name;
}

function act7Badge(statusName, list) {
  const item = (list || ACT7_STATUSES).find(s => s.name === statusName);
  const secId = item ? item.section : 1;
  const icon = item ? item.icon : 'fa-circle-info';

  const secStyles = {
    1: 'background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD;',
    2: 'background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;',
    3: 'background:#F3E8FF; color:#6B21A8; border:1px solid #E9D5FF;',
    4: 'background:#DCFCE7; color:#15803D; border:1px solid #BBF7D0;'
  };

  const style = secStyles[secId] || secStyles[1];
  return `<span class="badge rounded-pill fw-medium py-1 px-2 d-inline-flex align-items-center gap-1" style="${style} font-size:0.73rem; max-width:200px; line-height:1.2" title="${statusName}">
    <i class="fa-solid ${icon}" style="font-size:0.7rem; flex-shrink:0"></i><span class="text-truncate" style="min-width:0">${statusName}</span>
  </span>`;
}

const CASES = [
  {
    id:'1525/2558',
    subject:'กล่าวหาผู้บริหารสถานศึกษาแห่งหนึ่ง จัดซื้อครุภัณฑ์คอมพิวเตอร์ราคาสูงเกินจริง',
    legalBase:'ม.18/4',
    status:'AGENDA_SET',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'นายพิชิต รักชาติ (ผู้ร้อง)',
    accused:[ { no:1, name:'นายบัณฑิต ศึกษาดี', pos:'ผู้อำนวยการสถานศึกษา', idcard:'3-1102-0xxxx-xx-x', agency:'โรงเรียนแห่งหนึ่ง' } ],
    allegation:'อนุมัติจัดซื้อครุภัณฑ์คอมพิวเตอร์จำนวน 40 เครื่อง ในราคาสูงกว่าราคากลางที่กระทรวงดิจิทัลฯ กำหนด รวม 1,240,000 บาท',
    receivedDate:'2568-10-08', deadline60:'2568-12-07', deadline2y:'2570-10-08', prescription:'2570-06-30',
    docRef:'ปป 0020/0912 ลงวันที่ 24 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:2, slaLimit:15, subCommittee:'คณะที่ 1',
    meetingNo:'37/2569', agendaNo:'5.1', meetingDate:'2569-08-20',
    docType:'213', signPhase:'COMPLETE'
  },
  {
    id:'1547/2568',
    subject:'กล่าวหาเจ้าหน้าที่องค์การบริหารส่วนตำบลแห่งหนึ่ง จัดซื้อจัดจ้างโครงการก่อสร้างถนน คสล. โดยมิชอบ',
    legalBase:'ม.18/4',
    status:'IN_MEETING',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'นายวิรัตน์ ศรีสุข (ผู้ร้อง)',
    accused:[
      { no:1, name:'นายก้องภพ ทองแท้', pos:'นายกองค์การบริหารส่วนตำบล', idcard:'3-1009-0xxxx-xx-x', agency:'อบต.บางแสน' },
      { no:2, name:'นางมาลี เรืองรอง', pos:'ปลัดองค์การบริหารส่วนตำบล', idcard:'3-1012-0xxxx-xx-x', agency:'อบต.บางแสน' }
    ],
    allegation:'ร่วมกันกำหนดคุณลักษณะเฉพาะของงานก่อสร้างเพื่อเอื้อประโยชน์ให้ผู้เสนอราคารายหนึ่งเป็นผู้ชนะการเสนอราคา',
    receivedDate:'2568-11-14', deadline60:'2569-01-13', deadline2y:'2570-11-14', prescription:'2571-03-20',
    docRef:'ปป 0020/1028 ลงวันที่ 7 พฤษภาคม 2569',
    urgent:false, complex:true, dupWarning:false,
    slaDays:3, slaLimit:15, subCommittee:'คณะที่ 1',
    meetingNo:'37/2569', agendaNo:'5.2', meetingDate:'2569-08-20',
    docType:'213', signPhase:'COMPLETE'
  },
  {
    id:'1189/2569',
    subject:'กล่าวหาเจ้าหน้าที่สำนักงานที่ดินแห่งหนึ่ง ออกโฉนดที่ดินทับที่สาธารณประโยชน์',
    legalBase:'ม.62',
    status:'RESOLVED',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'องค์การบริหารส่วนตำบลแห่งหนึ่ง',
    accused:[ { no:1, name:'นายมนตรี ที่ดินงาม', pos:'เจ้าพนักงานที่ดินชำนาญการ', idcard:'3-1201-0xxxx-xx-x', agency:'สนง.ที่ดินจังหวัด' } ],
    allegation:'ดำเนินการออกโฉนดที่ดินเลขที่ 12345 เนื้อที่ 8 ไร่ ทับที่สาธารณประโยชน์ โดยมิได้ตรวจสอบระวางแผนที่',
    receivedDate:'2568-09-15', deadline60:'2568-11-14', deadline2y:'2570-09-15', prescription:'2571-08-15',
    docRef:'ปป 0020/0855 ลงวันที่ 10 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:1, slaLimit:15, subCommittee:'คณะที่ 2',
    meetingNo:'36/2569', agendaNo:'5.4', meetingDate:'2569-08-05',
    orderNo:'ปปท 31/2569',
    resolution:'ACCEPT_S24P1', signedBySecgen: true, secgenSignedAt:'04 ส.ค. 2569',
    resolutionStage: 3, resolvedAtIso: '2026-08-05T03:00:00.000Z'
  },
  {
    id:'1609/2568',
    subject:'กล่าวหาพนักงานรัฐวิสาหกิจแห่งหนึ่ง ทุจริตการเบิกจ่ายค่าน้ำมันเชื้อเพลิง',
    legalBase:'ม.18/4',
    status:'IN_MEETING',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'ความปรากฏต่อสำนักงาน',
    accused:[ { no:1, name:'นายวีระ ขับขี่ดี', pos:'พนักงานขับรถยนต์', idcard:'3-1301-0xxxx-xx-x', agency:'รัฐวิสาหกิจแห่งหนึ่ง' } ],
    allegation:'เบิกจ่ายค่าน้ำมันเชื้อเพลิงโดยใช้ใบเสร็จรับเงินอันเป็นเท็จ',
    receivedDate:'2568-12-20', deadline60:'2569-02-18', deadline2y:'2570-12-20', prescription:'2573-02-01',
    docRef:'ปป 0020/1380 ลงวันที่ 12 สิงหาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:5, slaLimit:15, subCommittee:'คณะที่ 3',
    meetingNo:'37/2569', agendaNo:'5.3', meetingDate:'2569-08-20',
    docType:'213', signPhase:'COMPLETE'
  },
  {
    id:'1396/2564',
    subject:'กล่าวหาข้าราชการสังกัดกรมโยธาธิการฯ เรียกรับเงินจากผู้ประกอบการเพื่อแลกกับการออกใบอนุญาต (ม.62)',
    legalBase:'ม.62',
    status:'AGENDA_SET',
    procType:'7.2',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'สำนักงาน ป.ป.ช. (ส่งเรื่องมอบหมาย)',
    accused:[ { no:1, name:'นายเอกชัย รุ่งเรือง', pos:'นายช่างโยธาชำนาญงาน', idcard:'3-1005-0xxxx-xx-x', agency:'กรมโยธาธิการฯ' } ],
    allegation:'เรียกรับเงินจำนวน 50,000 บาท จากผู้ประกอบการเพื่อแลกกับการเร่งรัดออกใบอนุญาตก่อสร้าง',
    receivedDate:'2568-12-02', deadline60:'2569-01-31', deadline2y:'2570-12-02', prescription:'2569-09-18',
    docRef:'ปป 0020/1104 ลงวันที่ 20 พฤษภาคม 2569',
    urgent:true, urgent72:true, urgentReason:'คดีใกล้ขาดอายุความภายใน 45 วัน และผู้ถูกร้องมีพฤติการณ์จะโอนย้ายหน่วยงาน (ผอ.กบค. รับรองใบด่วนแล้ว)',
    complex:false, dupWarning:false,
    slaDays:1, slaLimit:15, subCommittee:null,
    meetingNo:'37/2569', agendaNo:'5.4', meetingDate:'2569-08-20',
    docType:'RULING', signPhase:'COMPLETE'
  },
  {
    id:'1119/2565',
    subject:'กล่าวหาเจ้าหน้าที่โรงพยาบาลรัฐแห่งหนึ่ง เบิกจ่ายค่าตอบแทนล่วงเวลาอันเป็นเท็จ',
    legalBase:'ม.18/4',
    status:'RESOLVED',
    procType:'7.2',
    owner:'นางสาวปรียา ตั้งมั่น', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 2',
    complainant:'บัตรสนเท่ห์ (ความปรากฏต่อสำนักงาน)',
    accused:[
      { no:1, name:'นายสุรชัย พัฒนา', pos:'นักจัดการงานทั่วไปชำนาญการ', idcard:'3-3007-0xxxx-xx-x', agency:'รพ.ศูนย์แห่งหนึ่ง' },
      { no:2, name:'นางวราภรณ์ สุขใจ', pos:'เจ้าพนักงานการเงินและบัญชี', idcard:'3-3009-0xxxx-xx-x', agency:'รพ.ศูนย์แห่งหนึ่ง' }
    ],
    allegation:'ร่วมกันจัดทำเอกสารเบิกจ่ายค่าตอบแทนการปฏิบัติงานนอกเวลาราชการอันเป็นเท็จ รวม 47 ครั้ง เป็นเงิน 382,400 บาท',
    receivedDate:'2568-11-25', deadline60:'2569-01-24', deadline2y:'2570-11-25', prescription:'2572-01-10',
    docRef:'ปป 0021/0987 ลงวันที่ 2 พฤษภาคม 2569',
    urgent:false, complex:true, dupWarning:false,
    slaDays:2, slaLimit:15, subCommittee:'คณะที่ 3',
    meetingNo:'36/2569', agendaNo:'5.1', meetingDate:'2569-08-05',
    resolution72:'GUILTY_72', resolutionStage:4, resolvedAtIso: '2026-08-05T03:00:00.000Z',
    docType:'RULING'
  },
  {
    id:'1402/2565',
    subject:'กล่าวหาเจ้าหน้าที่ด่านศุลกากร ตรวจปล่อยสินค้าโดยมิชอบ',
    legalBase:'ม.18/4',
    status:'IN_MEETING_72',
    procType:'7.2',
    owner:'นายฉัตรชัย ตรวจการ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 2',
    complainant:'กรมศุลกากร (ผู้แจ้งเรื่อง)',
    accused:[ { no:1, name:'นายภัทร ศุลกากร', pos:'นักวิชาการศุลกากรชำนาญการ', idcard:'3-1004-0xxxx-xx-x', agency:'ด่านศุลกากรแห่งหนึ่ง' } ],
    allegation:'ร่วมมือกับบริษัทนำเข้าสินค้าประเมินราคาต่ำกว่าความเป็นจริง เสียหายรวม 2.4 ล้านบาท',
    receivedDate:'2568-11-10', deadline60:'2569-01-09', deadline2y:'2570-11-10', prescription:'2572-04-15',
    docRef:'ปป 0020/1210 ลงวันที่ 05 สิงหาคม 2569',
    urgent:false, complex:true, dupWarning:false,
    slaDays:4, slaLimit:15, subCommittee:'คณะที่ 1',
    meetingNo:'37/2569', agendaNo:'5.5', meetingDate:'2569-08-20',
    docType:'RULING', signPhase:'COMPLETE'
  },
  {
    id:'0807/2568',
    subject:'กล่าวหาเจ้าหน้าที่แขวงทางหลวงแห่งหนึ่ง ทุจริตงบประมาณค่าซ่อมบำรุงทางหลวงแผ่นดิน (ม.62)',
    legalBase:'ม.62',
    status:'IN_MEETING',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'ประชาชนผู้ใช้ทางหลวง (ผู้ร้องเรียน)',
    accused:[
      { no:1, name:'นายสมศักดิ์ ทางหลวงดี', pos:'นายช่างโยธาชำนาญงาน', idcard:'3-1008-0xxxx-xx-x', agency:'แขวงทางหลวงแห่งหนึ่ง' },
      { no:2, name:'นายประดิษฐ์ ซ่อมบำรุง', pos:'นายช่างเครื่องกลปฏิบัติงาน', idcard:'3-1011-0xxxx-xx-x', agency:'แขวงทางหลวงแห่งหนึ่ง' }
    ],
    allegation:'ร่วมกันจัดทำเอกสารเบิกจ่ายงบประมาณซ่อมแซมผิวจราจรอันเป็นเท็จ โดยมิได้มีการปฏิบัติงานจริง',
    receivedDate:'2568-11-20', deadline60:'2569-01-19', deadline2y:'2570-11-20', prescription:'2571-06-15',
    docRef:'ปป 0020/1028 ลงวันที่ 7 พฤษภาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:2, slaLimit:15, subCommittee:'คณะที่ 6',
    meetingNo:'37/2569', agendaNo:'5.6', meetingDate:'2569-08-20',
    docType:'213', signPhase:'COMPLETE'
  },
  {
    id:'1855/2568',
    subject:'รายงานผลการไต่สวนเพื่อวินิจฉัยชี้มูล กรณีกล่าวหาเจ้าหน้าที่รัฐปฏิบัติหน้าที่โดยมิชอบ (พยานหลักฐานไม่พอรับฟัง)',
    legalBase:'ม.18/4',
    status:'IN_MEETING_72',
    procType:'7.2',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 1',
    complainant:'นายธนพล มุ่งมั่น (ผู้กล่าวหา)',
    accused:[
      { no:1, name:'นายบัณฑิต ศึกษาดี', pos:'ผู้อำนวยการสถานศึกษา', idcard:'3-1102-0xxxx-xx-x', agency:'โรงเรียนแห่งหนึ่ง' }
    ],
    allegation:'กล่าวหาว่าละเว้นการปฏิบัติหน้าที่ในการตรวจรับพัสดุโครงการก่อสร้างอาคารเรียน',
    receivedDate:'2568-12-10', deadline60:'2569-02-08', deadline2y:'2570-12-10', prescription:'2571-12-30',
    docRef:'ปป 0020/1455 ลงวันที่ 15 สิงหาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:3, slaLimit:15, subCommittee:null,
    meetingNo:'37/2569', agendaNo:'5.7', meetingDate:'2569-08-20',
    docType:'RULING', signPhase:'COMPLETE'
  },
  {
    id:'กจ.101/2569',
    subject:'บันทึกขอความเห็นทางข้อกฎหมายกรณีการบังคับใช้มาตรา ๑๘/๑ แห่ง พ.ร.บ. มาตรการของฝ่ายบริหารฯ',
    legalBase:'ม.18/1',
    status:'AGENDA_SET',
    procType:'7.3',
    owner:'นางสาวรัชนี นิติการ', ownerOrg:'กองกฎหมาย',
    complainant:'กองกฎหมาย (เสนอความเห็นข้อกฎหมาย)',
    accused:[],
    allegation:'ขอความเห็นทางข้อกฎหมายเกี่ยวกับการคัดสำเนาสำนวนและการส่งเรื่องให้ ป.ป.ช. ตามมาตรา ๑๘/๑ เพื่อเสนอที่ประชุมคณะกรรมการ ป.ป.ท. พิจารณาให้แนวปฏิบัติ',
    receivedDate:'2569-07-10', deadline60:'2569-09-08', deadline2y:'2571-07-10', prescription:'—',
    docRef:'ปป 0005/0421 ลงวันที่ 10 กรกฎาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    docType:'GENERAL', signPhase:'COMPLETE',
    slaDays:2, slaLimit:5, subCommittee:null,
    meetingNo:'37/2569', agendaNo:'4.1', meetingDate:'2569-08-20'
  },
  {
    id:'กจ.102/2569',
    subject:'บันทึกขอทบทวนมติพนักงานอัยการสั่งไม่ฟ้องผู้ถูกกล่าวหาในคดีทุจริตจัดซื้อจัดจ้างโครงการก่อสร้างระบบประปา (ม.33)',
    legalBase:'ม.33',
    status:'RESOLVED',
    procType:'7.3',
    owner:'นายวิชาญ ปราบปราม', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 1',
    complainant:'พนักงานอัยการ (แจ้งคำสั่งไม่ฟ้อง)',
    accused:[
      { no:1, name:'นายสมศักดิ์ มั่นคง', pos:'อดีตนายกเทศมนตรี', idcard:'3-1002-0xxxx-xx-x', agency:'เทศบาลตำบลแห่งหนึ่ง' }
    ],
    allegation:'พนักงานอัยการมีคำสั่งไม่ฟ้องผู้ถูกกล่าวหา กองปราบปรามฯ พิจารณาแล้วเห็นว่ามีพยานหลักฐานสมบูรณ์ จึงเสนอคณะกรรมการ ป.ป.ท. พิจารณาทบทวนมติหรือมีมติฟ้องคดีเองตาม ม.33',
    receivedDate:'2569-06-15', deadline60:'2569-08-14', deadline2y:'2571-06-15', prescription:'2573-05-20',
    docRef:'ปป 0015/0789 ลงวันที่ 15 มิถุนายน 2569',
    urgent:false, complex:true, dupWarning:false,
    docType:'GENERAL', signPhase:'COMPLETE',
    slaDays:3, slaLimit:5, subCommittee:null,
    meetingNo:'36/2569', agendaNo:'4.2', meetingDate:'2569-08-05',
    resolution:'REVIEW_PROSECUTOR_73', resolutionStage: 5, resolvedAtIso: '2026-08-05T03:00:00.000Z'
  },
  {
    id:'กจ.103/2569',
    subject:'บันทึกขออนุมัติแต่งตั้งคณะทำงานเฉพาะกิจตรวจสอบข้อเท็จจริงกรณีโครงการเร่งด่วนเพื่อความโปร่งใส',
    legalBase:'ระเบียบฯ',
    status:'IN_MEETING',
    procType:'7.3',
    owner:'นายพงษ์ศักดิ์ ตรวจการ', ownerOrg:'กองบริหารคดี',
    complainant:'กองบริหารคดี (เสนอตามภารกิจ)',
    accused:[],
    allegation:'ขออนุมัติแต่งตั้งคณะทำงานเฉพาะกิจเพื่อสนับสนุนการตรวจสอบข้อมูลเชิงลึกในพื้นที่เสี่ยงสูง',
    receivedDate:'2569-08-01', deadline60:'2569-09-30', deadline2y:'2571-08-01', prescription:'—',
    docRef:'ปป 0002/0991 ลงวันที่ 1 สิงหาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    docType:'GENERAL', signPhase:'COMPLETE',
    slaDays:1, slaLimit:5, subCommittee:null,
    meetingNo:'37/2569', agendaNo:'4.3', meetingDate:'2569-08-20'
  },
  {
    id:'1015/2568',
    subject:'กล่าวหาเจ้าหน้าที่เทศบาลแห่งหนึ่ง เรียกรับผลประโยชน์จากผู้ขออนุญาตประกอบกิจการ',
    legalBase:'ม.18/4',
    status:'RETURNED',
    procType:'7.1',
    owner:'นายสมชาย ใจซื่อ', ownerOrg:'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1',
    complainant:'นางสมหญิง ค้าขาย (ผู้ร้อง)',
    accused:[ { no:1, name:'นายอรรถพล เทศบาล', pos:'หัวหน้าฝ่ายพัฒนารายได้', idcard:'3-1405-0xxxx-xx-x', agency:'เทศบาลแห่งหนึ่ง' } ],
    allegation:'เรียกรับเงินจากผู้ประกอบการเพื่อแลกกับการออกใบอนุญาตประกอบกิจการที่เป็นอันตรายต่อสุขภาพ',
    receivedDate:'2568-11-01', deadline60:'2568-12-31', deadline2y:'2570-11-01', prescription:'2570-12-05',
    docRef:'ปป 0020/0978 ลงวันที่ 28 เมษายน 2569',
    urgent:false, complex:false, dupWarning:false,
    slaDays:4, slaLimit:5, subCommittee:null,
    meetingNo:null, agendaNo:null,
    returnedBy:'director', returnedByName:'นายประเสริฐ มั่นคง (ผอ.สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต 1)',
    returnReason:'DOC_INCOMPLETE',
    returnNote:'เอกสารพยานหลักฐานประกอบข้อ 3 (สำเนาใบอนุญาต) ยังไม่ครบถ้วน และยังไม่ได้แนบบันทึกถ้อยคำผู้ร้อง กรุณาแนบเพิ่มเติมแล้วเสนอกลับ',
    docType:'213', signPhase:'WAIT'
  },
  {
    id:'0012/2565',
    subject:'กล่าวหาเจ้าหน้าที่สำนักงานเขตแห่งหนึ่ง ละเว้นการบังคับใช้กฎหมายควบคุมอาคาร',
    legalBase:'ม.18/4',
    status:'PENDING_SECGEN',
    procType:'7.1',
    owner:'นางสาวปรียา ตั้งมั่น', ownerOrg:'กองปราบปรามการทุจริตในภาครัฐ 2',
    complainant:'นายธีรพงษ์ รักษ์เมือง (ผู้ร้อง)',
    accused:[ { no:1, name:'นายฉัตรชัย ตรวจการ', pos:'นายช่างโยธาอาวุโส', idcard:'3-1502-0xxxx-xx-x', agency:'สำนักงานเขตแห่งหนึ่ง' } ],
    allegation:'ละเว้นไม่ดำเนินการตามอำนาจหน้าที่กับอาคารที่ก่อสร้างผิดแบบแปลนที่ได้รับอนุญาต รวม 6 หลัง ต่อเนื่องกว่า 2 ปี',
    receivedDate:'2568-12-08', deadline60:'2569-02-06', deadline2y:'2570-12-08', prescription:'2572-05-30',
    docRef:'ปป 0021/1131 ลงวันที่ 26 พฤษภาคม 2569',
    urgent:false, complex:false, dupWarning:false,
    docType:'644', signPhase:'WAIT',
    slaDays:11, slaLimit:15, subCommittee:null,
    meetingNo:null, agendaNo:null
  }
];

/* ---------- ที่มาของสำนวน: ความเห็นตามลำดับชั้น (owner→section_head→director→deputy→secgen) ----------
   สร้างจากสถานะปัจจุบันของแต่ละสำนวนแบบเดียวกันทุกสำนวน แทนข้อมูลเดิมที่บางสำนวนมีบันทึกไว้
   บางสำนวนไม่มี — เลขาธิการฯ มีหน้าที่เพียงลงนามให้ความเห็นเมื่อถึงชั้นนี้ จึงใช้ ACCEPT เสมอ */
const CHAIN_ROLE_ORDER = ['owner', 'section_head', 'director', 'deputy', 'secgen'];
const CHAIN_ROLE_NOTE = {
  owner:        'พิจารณาสำนวนแล้วเห็นว่าเข้าหลักเกณฑ์รับไว้ดำเนินการ เห็นควรเสนอตามลำดับชั้น',
  section_head: 'ตรวจสอบสำนวนแล้วเห็นพ้องกับผู้รับผิดชอบสำนวน เห็นควรเสนอผู้บังคับบัญชาลำดับถัดไป',
  director:     'พิจารณาแล้วเห็นชอบตามที่เสนอ เห็นควรเสนอลำดับชั้นถัดไป',
  deputy:       'ตรวจสอบสำนวนแล้วเห็นชอบตามที่เสนอ เห็นควรนำเสนอเลขาธิการฯ พิจารณา',
  secgen:       'เห็นชอบตามที่เสนอ ลงนามและเสนอขั้นตอนถัดไปตามลำดับ'
};
const CHAIN_STEP_OFFSET_DAYS = [10, 16, 23, 30, 45];

function addDaysToDateStr(dateStr, days) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  let yr = parseInt(parts[0], 10);
  const isBuddhist = yr > 2400;
  if (isBuddhist) yr -= 543;
  const d = new Date(yr, parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  const outYr = isBuddhist ? d.getFullYear() + 543 : d.getFullYear();
  return `${outYr}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function chainStepsDone(status) {
  const suffix = status.endsWith('_72') ? '_72' : '';
  const base = suffix ? status.slice(0, -3) : status;
  if (base === 'DRAFT' || base === 'RETURNED') return 0;
  const ladder = ['PENDING_SECTION', 'PENDING_DIRECTOR', 'PENDING_DEPUTY', 'PENDING_SECGEN'];
  const idx = ladder.indexOf(base);
  return idx === -1 ? 5 : idx + 1;
}

function buildChainOpinions(c) {
  if (!c.receivedDate) return [];
  const steps = chainStepsDone(c.status);
  return CHAIN_ROLE_ORDER.slice(0, steps).map((roleId, i) => ({
    roleId, type: 'ACCEPT',
    date: addDaysToDateStr(c.receivedDate, CHAIN_STEP_OFFSET_DAYS[i]),
    note: CHAIN_ROLE_NOTE[roleId]
  }));
}

CASES.forEach(c => {
  if(!c.docType)   c.docType = '213';
  if(!c.signPhase) c.signPhase = 'WAIT';
  c.chainOpinions = buildChainOpinions(c);
});

/* ---------- ตัวช่วยแปลงข้อมูลระหว่าง Supabase (tbl_res_request/tbl_cmp_case) กับรูปแบบ kase
   ที่หน้าเว็บทุกหน้าใช้ร่วมกัน (เดิมมีสำเนาเฉพาะใน inbox.html — ย้ายมาไว้ที่นี่เพื่อให้
   หน้าอื่น เช่น approval-review.html ใช้ตรรกะเดียวกัน ไม่เขียนซ้ำแยกกัน) ---------- */
function addYearsToDateStr(dateStr, years) {
  const [y, m, d] = String(dateStr).split('-');
  return `${parseInt(y, 10) + years}-${m}-${d}`;
}

function toBuddhistFakeIso(realIso) {
  if (!realIso) return null;
  const [y, m, d] = String(realIso).split('-');
  return `${parseInt(y, 10) + 543}-${m}-${d}`;
}

function supabaseRowToCase(row) {
  const cc = row.tbl_cmp_case;
  if (!cc) return null;
  const kase = {
    trr_id: row.trr_id, tcc_id: cc.tcc_id,
    id: cc.tcc_no, subject: cc.tcc_subject, allegation: cc.tcc_allegation,
    legalBase: cc.tcc_legal_base, complainant: cc.tcc_complainant,
    owner: cc.tcc_owner, ownerOrg: cc.tcc_owner_org,
    receivedDate: toBuddhistFakeIso(cc.tcc_received_date),
    prescription: toBuddhistFakeIso(cc.tcc_prescription_date),
    docRef: cc.tcc_doc_ref, docType: cc.tcc_doc_type || '213',
    complex: !!cc.tcc_complex,
    accused: (cc.tbl_cmp_case_accused || [])
      .sort((a, b) => (a.tcca_no || 0) - (b.tcca_no || 0))
      .map(a => ({ no: a.tcca_no, name: a.tcca_name, pos: a.tcca_position, idcard: a.tcca_idcard, agency: a.tcca_agency })),
    status: CODE_STATUS[row.trr_status] || row.trr_status,
    slaDays: row.trr_sla_days, slaLimit: row.trr_sla_limit,
    urgent: !!row.trr_urgent, urgent72: !!row.trr_urgent,
    signedBySecgen: !!row.trr_signed_secgen, subCommittee: row.trr_sub_committee,
    signPhase: row.trr_signed_secgen ? 'COMPLETE' : 'WAIT',
    resolutionStage: row.trr_resolution_stage || null,
    recordedDocHtml: row.trr_recorded_doc_html || null,
    meetingNo: row.trr_meeting_no || null, agendaNo: row.trr_agenda_no || null,
    meetingDate: toBuddhistFakeIso(row.trr_meeting_date)
  };
  if (kase.receivedDate) {
    kase.deadline60 = addDaysToDateStr(kase.receivedDate, 60);
    kase.deadline2y = addYearsToDateStr(kase.receivedDate, 2);
  }
  const memCase = (Array.isArray(CASES) ? CASES : []).find(x => x.id === cc.tcc_no);
  if (memCase) {
    if (memCase.procType) kase.procType = memCase.procType;
    if (memCase.docType) kase.docType = memCase.docType;
    if (memCase.legalBase) kase.legalBase = memCase.legalBase;
    if (memCase.resolution) kase.resolution = memCase.resolution;
    if (memCase.boardOpinion) kase.boardOpinion = memCase.boardOpinion;
    if (memCase.resolvedAtIso) kase.resolvedAtIso = memCase.resolvedAtIso;
    if (memCase.ownerClarification) kase.ownerClarification = memCase.ownerClarification;
    if (memCase.order24Members) kase.order24Members = memCase.order24Members;
    if (memCase.order24Done) kase.order24Done = memCase.order24Done;
    if (memCase.order24Signed) kase.order24Signed = memCase.order24Signed;
    if (memCase.recordedDocHtml && !kase.recordedDocHtml) kase.recordedDocHtml = memCase.recordedDocHtml;
  }
  if (!kase.procType) {
    if (isCase73(kase)) kase.procType = '7.3';
    else if (isCase72(kase)) kase.procType = '7.2';
    else kase.procType = '7.1';
  }
  kase.chainOpinions = buildChainOpinions(kase);
  return kase;
}

/* ---------- แจ้งเตือนล่วงหน้าก่อนครบกำหนด 60 วัน / 2 ปี (deadline60/deadline2y) ----------
   deadline60/deadline2y เป็นวันที่แบบ "fake ISO ปีพุทธศักราช" เดียวกับ receivedDate ทั้งระบบ
   (เช่น "2569-01-13" คือปี พ.ศ. เขียนแทนที่ตำแหน่งปี ค.ศ. ตรงๆ) จึงต้องเทียบกับ "วันนี้" ที่แปลง
   เป็นรูปแบบเดียวกันก่อน ไม่ใช่ new Date() ตรงๆ ไม่เช่นนั้นจะต่างกัน 543 ปีทันที */
function fakeTodayIso() {
  const real = new Date();
  const realIso = `${real.getFullYear()}-${String(real.getMonth() + 1).padStart(2, '0')}-${String(real.getDate()).padStart(2, '0')}`;
  return toBuddhistFakeIso(realIso);
}
function daysUntilFakeIso(fakeIsoStr) {
  const today = new Date(fakeTodayIso() + 'T00:00:00');
  const target = new Date(fakeIsoStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}
/* คืนรายการ { kase, deadlineType, daysLeft } ของสำนวนที่ deadline60/deadline2y อยู่ในช่วง
   0-15 วันข้างหน้า (เตือนล่วงหน้า 15 วัน) เรียงจากใกล้ครบกำหนดที่สุดก่อน */
function upcomingDeadlines(cases) {
  const out = [];
  (cases || []).forEach(kase => {
    ['deadline60', 'deadline2y'].forEach(dt => {
      const val = kase[dt];
      if (!val) return;
      const daysLeft = daysUntilFakeIso(val);
      if (daysLeft >= 0 && daysLeft <= 15) out.push({ kase, deadlineType: dt, daysLeft });
    });
  });
  out.sort((a, b) => a.daysLeft - b.daysLeft);
  return out;
}
/* ปลายทางของสำนวนตาม role ปัจจุบัน (สายหลัก 213/644) — คัดลอกจาก mapping เดิมที่ใช้ใน
   command-palette (ค้นหาสำนวนคดี) ด้านล่าง เพื่อให้ badge แจ้งเตือนคลิกแล้วพาไปหน้าเดียวกัน */
const PAGE_FOR_MAIN = {
  owner:'approval-review.html', section_head:'approval-review.html',
  director:'approval-review.html', deputy:'approval-review.html',
  secgen:'approval-review.html', support_sub:'support-subcommittee.html',
  chairman:'chairman-agenda.html', subcommittee:'subcommittee-screening.html',
  board_sec:'agenda-registry.html', affairs:'board-resolution.html',
  board:'board-resolution.html', board_ex:'board-resolution.html',
  legal:'board-resolution.html', admin:'case-register.html'
};
function pageForCase(kase, roleId) {
  if (kase && typeof kase === 'object') return pageForCaseByStatus(kase);
  const target = isCase72(kase) ? pageForCase72(kase) : (PAGE_FOR_MAIN[roleId] || 'approval-review.html');
  return resolvePage(target);
}

const M28_LOG = {
  '1396/2564': { orderType:'ACCEPT', orderedDate:'2569-05-22', reported:false, dueDate:'2569-06-06' },
  '1119/2565': { orderType:'ACCEPT', orderedDate:'2569-05-26', reported:false, dueDate:'2569-06-10' },
  '1525/2558': { orderType:'ACCEPT', orderedDate:'2569-04-30', reported:true,  dueDate:'2569-05-15',
                 boardOutcome:'บอร์ดไม่มีมติเป็นอย่างอื่นภายใน 15 วัน — ถือว่ามีมติตามคำสั่งเลขาธิการฯ' },
  '1015/2568': { orderType:'REJECT', orderedDate:'2569-05-28', reported:false, dueDate:'2569-06-12' }
};
CASES.forEach(c => { if(M28_LOG[c.id]) c.m28 = M28_LOG[c.id]; });

/* ---------- รายชื่อคณะอนุกรรมการกลั่นกรองฯ 1-8 (ฐานข้อมูลบุคลากรจำลอง) ----------
   ใช้ดึงชื่อ-ตำแหน่งอนุกรรมการมาลงแบบฟอร์มคำสั่ง ม.24 โดยอัตโนมัติตาม kase.subCommittee
   แทนการกรอกชื่อซ้ำเดิมทุกสำนวน ตามมติที่ประชุม 13/08/2569 ระเบียบวาระที่ 3 */
const SUBCOMMITTEE_ROSTER = {
  'คณะที่ 1': [
    { name:'นายสุเมธ นิติธรรม', pos:'ผู้ทรงคุณวุฒิด้านกฎหมาย', rank:'chair' },
    { name:'นายสมชาย ใจซื่อ', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นางสาวปรียา ตั้งมั่น', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 2': [
    { name:'นายวรพล ตรวจสอบ', pos:'ผู้ทรงคุณวุฒิด้านบัญชี', rank:'chair' },
    { name:'นางสาวณัฐฐา เที่ยงธรรม', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายอนุชา สืบสวน', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 3': [
    { name:'นายประดิษฐ์ ยุติธรรม', pos:'ผู้ทรงคุณวุฒิด้านการจัดซื้อจัดจ้าง', rank:'chair' },
    { name:'นางสาวศิริพร ซื่อตรง', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายกิตติ ไต่สวน', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 4': [
    { name:'นายชัยวัฒน์ พิทักษ์สิทธิ์', pos:'ผู้ทรงคุณวุฒิด้านปกครองท้องถิ่น', rank:'chair' },
    { name:'นางสาวรัชนี บริสุทธิ์', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายธีระพงษ์ เสาะหา', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 5': [
    { name:'นายพิสิษฐ์ รอบรู้', pos:'ผู้ทรงคุณวุฒิด้านทรัพยากรธรรมชาติ', rank:'chair' },
    { name:'นางสาวจุฑามาศ แจ้งจริง', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายวุฒิชัย ค้นหา', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 6': [
    { name:'นายอรรถพล วินิจฉัย', pos:'ผู้ทรงคุณวุฒิด้านการแพทย์', rank:'chair' },
    { name:'นางสาวเบญจวรรณ มั่นคง', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายศักดิ์ดา เจนจัด', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 7': [
    { name:'นายเอกภพ ธรรมนูญ', pos:'ผู้ทรงคุณวุฒิด้านภาษีอากร', rank:'chair' },
    { name:'นางสาวปวีณา สุจริตกุล', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายบุญเลิศ พากเพียร', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ],
  'คณะที่ 8': [
    { name:'นายไพศาล ยึดมั่น', pos:'ผู้ทรงคุณวุฒิด้านวิศวกรรม', rank:'chair' },
    { name:'นางสาวกาญจนา ถูกต้อง', pos:'นิติกรชำนาญการ', rank:'member' },
    { name:'นายสุรพงษ์ ตามรอย', pos:'นักสืบสวนสอบสวนชำนาญการ', rank:'secretary' }
  ]
};

const CASES_VERSION = '2026-08-25-activity7-templates-v2';
if (typeof sessionStorage !== 'undefined') {
  const savedVersion = sessionStorage.getItem('ecmis_cases_version');
  const savedCases = sessionStorage.getItem('ecmis_cases');
  if (savedCases && savedVersion === CASES_VERSION) {
    try {
      const parsed = JSON.parse(savedCases);
      CASES.length = 0;
      parsed.forEach(c => CASES.push(c));
    } catch (e) {
      console.error('Failed to load CASES from sessionStorage:', e);
    }
  } else if (savedCases) {
    sessionStorage.removeItem('ecmis_cases');
  }
}
function saveCases() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('ecmis_cases', JSON.stringify(CASES));
    sessionStorage.setItem('ecmis_cases_version', CASES_VERSION);
  }
}

const RETURN_REASONS = [
  { code:'DOC_INCOMPLETE', label:'เอกสาร/พยานหลักฐานไม่ครบถ้วน' },
  { code:'FACT_UNCLEAR',   label:'ข้อเท็จจริงยังไม่ชัดเจน ต้องแสวงหาเพิ่มเติม' },
  { code:'LAW_DISAGREE',   label:'ความเห็นข้อกฎหมายไม่ตรงกัน' },
  { code:'WRONG_FORM',     label:'รูปแบบรายงานไม่ถูกต้องตามแบบที่กำหนด' },
  { code:'WRONG_ROUTE',    label:'เสนอผิดสายงาน / ผิดหน่วยงานรับผิดชอบ' },
  { code:'OTHER',          label:'อื่น ๆ (ระบุเหตุผล)' }
];

const RESOLUTIONS = [
  { code:'ACCEPT_S24P1', group:'รับไว้ไต่สวน',
    label:'รับไว้ไต่สวน — ดำเนินการเป็นองค์คณะ (ม.24 วรรคหนึ่ง)',
    doc:'คำสั่งแต่งตั้งองค์คณะพนักงาน ป.ป.ท. (ปปท. ๕-๐๑)', signer:'เลขาธิการฯ' },
  { code:'ACCEPT_S24P3', group:'รับไว้ไต่สวน',
    label:'รับไว้ไต่สวน — ดำเนินการเป็นคณะอนุกรรมการไต่สวน (ม.24 วรรคสาม)',
    doc:'คำสั่งแต่งตั้งคณะอนุกรรมการไต่สวน (ปปท. ๕-๐๔)', signer:'ประธานกรรมการ ป.ป.ท.' },

  { code:'NOT_ACCEPTED', group:'ไม่รับเรื่องไว้พิจารณา',
    label:'ไม่รับเรื่องไว้พิจารณา (ม.25 ห้ามเด็ดขาด / ม.26 ดุลพินิจ)',
    doc:'หนังสือแจ้งผลการพิจารณา (ระบุมาตราที่อ้าง)', signer:'—',
    needsLawRef:true, legalBasis:'ม.25 / ม.26' },

  { code:'DISMISS', group:'ไม่รับเรื่องไว้พิจารณา',
    label:'สั่งจำหน่ายเรื่อง (ม.26)',
    doc:'หนังสือแจ้งคำสั่งจำหน่ายเรื่อง', signer:'—',
    needsLawRef:true, legalBasis:'ม.26 (ประกอบ ม.28)' },

  { code:'NO_GROUND', group:'ข้อกล่าวหาไม่มีมูล',
    label:'ข้อกล่าวหาไม่มีมูล — ข้อกล่าวหาเป็นอันตกไป (ม.32)',
    doc:'หนังสือแจ้งผลผู้ถูกกล่าวหา (ม.32 ไม่ช้ากว่า 15 วัน)', signer:'—',
    noticeDays:15, noticeBasis:'ม.32 — แจ้งผู้ถูกกล่าวหาไม่ช้ากว่า 15 วันนับแต่วันที่บอร์ดมีมติ',
    legalBasis:'ม.32' },
  { code:'MORE_INVESTIGATE', group:'มติอื่น ๆ',
    label:'ให้ผู้รับผิดชอบสำนวนไต่สวนเบื้องต้นเพิ่มเติม',
    doc:'บันทึกแจ้งมติให้ไต่สวนเพิ่มเติม', signer:'—' },

  { code:'FORWARD', group:'มติอื่น ๆ',
    label:'ส่งเรื่องให้หน่วยงาน / คณะอนุกลั่นกรองฯ พิจารณา',
    doc:'หนังสือนำส่งเรื่อง', signer:'—', needsDestination:true }
];

function resolutionOf(code){ return RESOLUTIONS.find(r => r.code === code) || null; }

const FORWARD_TARGETS = [
  { code:'NACC',      label:'สำนักงาน ป.ป.ช. (นอกอำนาจ ป.ป.ท.)',
    external:true,  requireSignedScan:true, requireArchiveCopy:true,
    statutorySlaDays:15,
    statutoryBasis:'ม.18/1 (ก)(3) / (ข)(1) / (ข)(3) — ส่งสำนวนภายใน 15 วัน · กำหนดตายตัวตามกฎหมาย ขยายไม่ได้',
    trackingSlaDays:30,
    trackingBasis:'เล่ม 6 กิจกรรมที่ 8 · CHK011 — กรอบกำกับติดตาม 30 วันนับแต่วันที่ได้รับมติ (มิใช่กำหนดส่ง)',
    archiveBasis:'ม.18/1 — ต้องคัดสำเนาสำนวนเก็บรักษาไว้เป็นหลักฐาน',
    doc:'หนังสือนำส่งสำนวนถึงสำนักงาน ป.ป.ช.' },
  { code:'SCREENING', label:'คณะอนุกรรมการกลั่นกรองเรื่องไต่สวนข้อเท็จจริง',
    external:false, requireSignedScan:false, requireArchiveCopy:false,
    trackingSlaDays:15,
    trackingBasis:'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — กฎหมายไม่ได้กำหนดเส้นตายไว้',
    doc:'บันทึกส่งเรื่องเข้าคณะอนุกลั่นกรองฯ' },
  { code:'LEGAL',     label:'กองกฎหมาย (กกม.)',
    external:false, requireSignedScan:false, requireArchiveCopy:false,
    trackingSlaDays:15,
    trackingBasis:'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — กฎหมายไม่ได้กำหนดเส้นตายไว้',
    doc:'บันทึกขอความเห็นทางกฎหมาย' },
  { code:'OTHER',     label:'อื่นๆ (ระบุปลายทาง)',
    external:false, requireSignedScan:false, requireArchiveCopy:false,
    trackingSlaDays:15,
    trackingBasis:'กรอบกำกับติดตามเชิงบริหารภายในสำนักงาน — ปลายทางนอกรายการมาตรฐาน ผู้บันทึกกำหนดกรอบเองตามความเหมาะสม',
    doc:'บันทึกส่งเรื่อง (ระบุปลายทางเอง)' }
];
function forwardTarget(code){ return FORWARD_TARGETS.find(t => t.code === code) || null; }

const RESOLUTIONS_72 = [
  { code:'FORWARD_NACC', group:'ส่ง ป.ป.ช. (นอกอำนาจ)',
    label:'ส่งเรื่องให้คณะกรรมการ ป.ป.ช. เนื่องจากอยู่ในหน้าที่และอำนาจของ ป.ป.ช.',
    doc:'หนังสือนำส่งเรื่องถึงสำนักงาน ป.ป.ช.', signer:'ประธานกรรมการ ป.ป.ท.',
    legalBasis:'ม.19 (ข)(1)',
    noticeDays:15, noticeBasis:'ม.19 (ข)(1) — ส่งเรื่องพร้อมสำนวนให้คณะกรรมการ ป.ป.ช. ภายใน 15 วันนับแต่วันที่ได้รับเรื่อง' },
  { code:'MORE_INVESTIGATE_72', group:'ให้ไต่สวนเพิ่มเติม',
    label:'ให้ไต่สวนเพิ่มเติม หรือไต่สวนเองใหม่ทั้งหมดหรือบางส่วน',
    doc:'บันทึกแจ้งมติให้ไต่สวนเพิ่มเติม (ระบุเหตุผล)', signer:'—',
    legalBasis:'ม.24 วรรคท้าย', requiresReason:true,
    reasonNote:'"ให้ระบุเหตุผลของการดำเนินการดังกล่าวไว้ด้วย" — ม.24 วรรคท้าย บังคับให้มีเหตุผลกำกับเสมอ' },
  { code:'NO_MERIT_72', group:'ยุติเรื่อง',
    label:'ข้อกล่าวหาไม่มีมูล — ข้อกล่าวหาเป็นอันตกไป',
    doc:'หนังสือแจ้งผลผู้ถูกกล่าวหา', signer:'—',
    legalBasis:'ม.32',
    noticeDays:15, noticeBasis:'ม.32 — แจ้งให้ผู้ถูกกล่าวหาทราบโดยเร็ว ไม่ช้ากว่า 15 วันนับแต่วันที่คณะกรรมการ ป.ป.ท. มีมติ' },
  { code:'GUILTY_72', group:'ชี้มูลความผิด',
    label:'วินิจฉัยชี้มูลความผิด (อาญา และ/หรือ วินัย)',
    doc:'รายงานการไต่สวนและวินิจฉัยชี้มูล', signer:'ประธานกรรมการ ป.ป.ท.',
    legalBasis:'ม.17(3)(4) · ม.38 · ม.44', needsGuiltyTrack:true }
];
function resolution72(code){ return RESOLUTIONS_72.find(r => r.code === code) || null; }

const RESOLUTIONS_73 = [
  { code:'APPROVE_73', group:'อนุมัติ',
    label:'อนุมัติ / เห็นชอบตามเสนอ',
    doc:'บันทึกแจ้งมติอนุมัติ', signer:'ประธานกรรมการ ป.ป.ท.' },
  { code:'REJECT_73', group:'ไม่อนุมัติ',
    label:'ไม่อนุมัติ / ให้ยุติเรื่อง',
    doc:'บันทึกแจ้งมติไม่อนุมัติ', signer:'—' },
  { code:'REVIEW_PROSECUTOR_73', group:'ทบทวนมติอัยการ',
    label:'ขอทบทวนมติพนักงานอัยการ (ยืนยันข้อกล่าวหา / มีมติฟ้องคดีเอง)',
    doc:'หนังสือขอให้ทบทวนมติถึงพนักงานอัยการ', signer:'ประธานกรรมการ ป.ป.ท.',
    legalBasis:'พ.ร.บ. มาตรการของฝ่ายบริหารฯ ม.๓๓' },
  { code:'LEGAL_DIVISION_73', group:'ส่งกองกฎหมาย',
    label:'ส่งกองกฎหมายเพื่อตรวจสอบและให้ความเห็นทางข้อกฎหมายก่อน',
    doc:'บันทึกส่งกองกฎหมายพิจารณา', signer:'—' },
  { code:'SPECIAL_TASK_73', group:'เฉพาะกิจอื่น ๆ',
    label:'แต่งตั้งคณะทำงานเฉพาะกิจ / มอบหมายดำเนินการเฉพาะเรื่อง',
    doc:'คำสั่งแต่งตั้ง / บันทึกมอบหมายงาน', signer:'ประธานกรรมการ ป.ป.ท.' }
];
function resolution73(code){ return RESOLUTIONS_73.find(r => r.code === code) || null; }

/* กิจกรรมที่ 7 (ตาม TOR) เริ่มนับเมื่อรายงานมาถึงเลขาธิการฯ — สาย 3 ชั้น
   (ผอ.กอง/ผอ.สำนักงาน ป.ป.ท. เขต/รองเลขาธิการฯ) เป็นขั้นก่อนหน้านั้น จึงไม่แยก
   เป็นสเต็ปของตัวเอง ให้สเต็ปที่ 1 เริ่มที่ "เลขาธิการฯ ลงนาม" เลย */
const FLOW_STEPS_72 = [
  { key:'secgen72',  label:'เลขาธิการฯ ลงนาม',               ref:'เลขาธิการฯ ลงนาม' },
  { key:'agenda72',  label:'กลั่นกรอง / บรรจุวาระ',          ref:'กลั่นกรองและบรรจุวาระ' },
  { key:'meeting72', label:'ประชุม / บันทึกมติ',             ref:'ประชุมและบันทึกมติ' },
  { key:'ruling72',  label:'จัดทำ / ลงนามรายงานวินิจฉัยชี้มูล', ref:'จัดทำรายงานวินิจฉัยชี้มูล' },
  { key:'dispatch72',label:'แจ้งผล / ส่งดำเนินการต่อ',        ref:'แจ้งผลและส่งเรื่องดำเนินการ' }
];
const STATUS_STEP_72 = {
  PENDING_SECTION_72:'secgen72', PENDING_DIRECTOR_72:'secgen72', PENDING_DEPUTY_72:'secgen72', RETURNED_72:'secgen72',
  PENDING_SECGEN_72:'secgen72',
  IN_SUPPORT_SUB_72:'agenda72', PENDING_URGENT_72:'agenda72', PENDING_CHAIRMAN_URGENT_72:'agenda72', IN_SCREENING_72:'agenda72',
  PENDING_INVITE_72:'meeting72', IN_MEETING_72:'meeting72',
  RESOLVED_PENDING_72:'ruling72', PENDING_SIGN_RULING_72:'ruling72',
  PENDING_AREA_NOTICE_72:'dispatch72', DISPATCHING_NACC_72:'dispatch72', PENDING_DISPATCH_GUILTY_72:'dispatch72',
  CLOSED_72:'dispatch72'
};

function trackStatus72(kase, kind){
  const track = kind === 'criminal' ? kase.criminalTrack72 : kase.disciplinaryTrack72;
  const active = kind === 'criminal' ? !!kase.guiltyCriminal72 : !!kase.guiltyDiscipline72;
  if(!active) return 'N/A';
  return (track && track.status) || 'PENDING';
}
function bothTracksDone72(kase){
  const crimOk = !kase.guiltyCriminal72 || trackStatus72(kase,'criminal') === 'DISPATCHED';
  const discOk = !kase.guiltyDiscipline72 || trackStatus72(kase,'disciplinary') === 'DISPATCHED';
  return crimOk && discOk;
}

const CONFIG = {

  returnAllLevels: true,

  urgentAutoDays: 90,

  subQuorumRatio: 0.5,
  subMemberCount: 7,

  eMeetingMode: 'AFTER'
};

const RETURN_SCOPES = [
  { code:'TO_DIRECTOR', label:'ส่งคืน ผอ.กอง / ผอ.สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต',
    note:'ใช้กรณีข้อบกพร่องอยู่ที่การกลั่นกรองของหน่วยงาน เช่น ความเห็นตามลำดับชั้นไม่ครบ' },
  { code:'TO_OWNER', label:'ส่งคืนเจ้าของสำนวนโดยตรง',
    note:'ใช้กรณีข้อบกพร่องอยู่ที่ตัวรายงาน 213 หรือพยานหลักฐานต้นทาง' }
];

const MATERIAL_FIELDS = [
  { id:'f_allegation', label:'ข้อกล่าวหา' },
  { id:'f_finding',    label:'ผลการแสวงหาข้อเท็จจริงและพยานหลักฐาน' },
  { id:'f_opinionType',label:'ความเห็นของผู้รับผิดชอบสำนวน' }
];

const DEMO_TODAY = new Date(2026, 7, 4);

function daysUntil(thaiIso){
  const p = String(thaiIso).split('-');
  if(p.length !== 3) return null;
  const target = new Date(+p[0] - 543, +p[1] - 1, +p[2]);
  return Math.round((target - DEMO_TODAY) / 86400000);
}

/* ---------- วันทำการ (หักเสาร์-อาทิตย์อัตโนมัติ, ยังไม่รวมวันหยุดราชการพิเศษ) ----------
   ใช้คำนวณกำหนดเวลาออกมติ 15 วันทำการ ตามมติที่ประชุม 13/08/2569 */
function isWeekend(d){ const day = d.getDay(); return day === 0 || day === 6; }

function addBusinessDays(startDate, days){
  const d = new Date(startDate.getTime());
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) added++;
  }
  return d;
}

function parseIsoToDate(iso) {
  if (!iso) return null;
  if (iso instanceof Date) return new Date(iso.getTime());
  const str = String(iso).split('T')[0];
  const parts = str.split('-');
  if (parts.length < 3) return new Date(iso);
  let yr = parseInt(parts[0], 10);
  if (yr > 2400) yr -= 543;
  return new Date(yr, parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function businessDaysBetween(startDate, endDate){
  let count = 0;
  const s = parseIsoToDate(startDate);
  const e = parseIsoToDate(endDate);
  if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const d = new Date(s.getTime());
  while (d < e) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) count++;
  }
  return count;
}

const RESOLUTION_SLA_LIMIT_DAYS = 15;

/* สถานะ "ระหว่างจัดทำมติ" (resolutionStage 1-5) มีกำหนด 15 วันทำการนับจากวันที่บอร์ดมีมติ (resolvedAtIso)
   คืน null เมื่อไม่เข้าเงื่อนไขนี้ (เช่น จัดทำรายงานเสร็จแล้ว) เพื่อให้ slaBadge() ใช้ SLA ปกติของสำนวนแทน */
function resolutionSlaInfo(kase){
  if (kase && kase.status === 'RESOLVED' && kase.resolutionStage && kase.resolutionStage < 6 && kase.resolvedAtIso) {
    const start = parseIsoToDate(kase.resolvedAtIso);
    return { used: businessDaysBetween(start, DEMO_TODAY), limit: RESOLUTION_SLA_LIMIT_DAYS };
  }
  return null;
}
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                     'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function thaiDate(iso){
  if(!iso || iso === '—') return '—';
  const p = String(iso).split('-');
  if(p.length !== 3) return iso;
  let year = parseInt(p[0], 10);
  if (!isNaN(year) && year < 2400) {
    year += 543; // แปลงปี ค.ศ. เป็น พ.ศ. เสมอ
  }
  return `${parseInt(p[2],10)} ${THAI_MONTHS[parseInt(p[1],10)-1]} ${year}`;
}
const THAI_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
function thaiDayName(iso){
  const p = String(iso).split('-');
  if(p.length !== 3) return '';
  let year = parseInt(p[0], 10);
  if (year > 2400) year -= 543;
  const d = new Date(year, parseInt(p[1],10) - 1, parseInt(p[2],10));
  return THAI_DAYS[d.getDay()];
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
function getRole(id){
  const found = ROLES.find(r => r.id === id);
  if (found) return found;
  if (id === 'chair_office') return ROLES.find(r => r.id === 'chairman') || ROLES[0];
  if (id === 'board_ex') return ROLES.find(r => r.id === 'board') || ROLES[0];
  if (id === 'sup_chair' || id === 'sup_sec' || id === 'sup_asst') return ROLES.find(r => r.id === 'support_sub') || ROLES[0];
  if (id === 'board_sec') return ROLES.find(r => r.id === 'board_sec') || ROLES[0];
  if (id === 'secgen' || id === 'deputy_sg' || id === 'deputy') return ROLES.find(r => r.id === 'secgen') || ROLES[0];
  return ROLES.find(r => r.id === 'affairs') || ROLES[0];
}

// ผู้ใช้งานที่ได้รับอนุญาตให้เข้าสู่ระบบ (Cleansed 6 Users)
const LOGIN_ALLOWED_ROLE_IDS = [
  'secgen',
  'support_sub',
  'chairman',
  'board_sec',
  'board',
  'affairs'
];

function roleIdForLogin(username){
  const u = String(username || '').trim().toLowerCase();
  if(!u) return null;
  const role = ROLES.find(r => LOGIN_ALLOWED_ROLE_IDS.includes(r.id) && r.login && r.login.toLowerCase() === u);
  return role ? role.id : null;
}

/* Centralized Page Permissions Matrix (RBAC & Page Guard) */
const PAGE_PERMISSIONS = {
  // Main Inbox Screens
  'inbox.html': ['secgen', 'chairman', 'affairs', 'owner', 'director', 'deputy', 'section_head', 'legal', 'admin'],
  'support-subcommittee-inbox.html': ['support_sub', 'sup_chair', 'sup_sec', 'sup_asst'],
  'board-inbox.html': ['board', 'board_ex'],
  'resolution-inbox.html': ['board_sec', 'affairs'],
  'meeting-report.html': ['board_sec', 'affairs'],
  'board-room.html': ['board', 'board_ex', 'board_sec', 'secgen'],
  'dashboard.html': ['secgen', 'chairman', 'board_sec', 'board', 'board_ex', 'affairs'],
  'followup-dashboard.html': ['secgen', 'chairman', 'board_sec', 'board', 'board_ex', 'affairs'],
  'case-register.html': null, // public/all roles
  'register.html': null, // public/all roles

  // Registry Screens (Strictly removed for chairman & affairs per rules)
  'agenda-registry.html': ['board_sec', 'board', 'board_ex', 'support_sub'],
  'agenda-registry-detail.html': ['board_sec', 'board', 'board_ex', 'support_sub'],
  'agenda-detail.html': ['board_sec', 'board', 'board_ex', 'support_sub'],

  // Detail / Document Screens (Comprehensive coverage with Edit Gate inside page)
  'approval-review.html': ['secgen', 'affairs', 'owner', 'director', 'deputy', 'section_head', 'board_sec', 'chairman', 'board', 'board_ex'],
  'review.html': ['secgen', 'affairs', 'owner', 'director', 'deputy', 'section_head', 'board_sec', 'chairman', 'board', 'board_ex'],
  'support-subcommittee.html': ['support_sub', 'sup_chair', 'sup_sec', 'sup_asst', 'affairs', 'secgen', 'board_sec', 'chairman', 'board', 'board_ex'],
  'chairman-agenda.html': ['chairman', 'affairs', 'board_sec', 'secgen', 'board', 'board_ex'],
  'chairman.html': ['chairman', 'affairs', 'board_sec', 'secgen', 'board', 'board_ex'],
  'subcommittee-screening.html': ['subcommittee', 'subcom_1', 'subcom_2', 'subcom_3', 'subcom_4', 'subcom_5', 'subcom_6', 'subcom_7', 'subcom_8', 'affairs', 'chairman', 'secgen', 'board_sec', 'board', 'board_ex'],
  'screening.html': ['subcommittee', 'subcom_1', 'subcom_2', 'subcom_3', 'subcom_4', 'subcom_5', 'subcom_6', 'subcom_7', 'subcom_8', 'affairs', 'chairman', 'secgen', 'board_sec', 'board', 'board_ex'],
  'order-m24.html': ['secgen', 'chairman', 'affairs', 'board_sec', 'board', 'board_ex', 'owner', 'director', 'deputy', 'section_head'],
  'order.html': ['secgen', 'chairman', 'affairs', 'board_sec', 'board', 'board_ex', 'owner', 'director', 'deputy', 'section_head'],
  'board-resolution.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'resolution.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'resolution-72.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'ruling-report.html': ['board_sec', 'affairs', 'chairman', 'secgen', 'board', 'board_ex'],
  'urgent-agenda.html': ['dir_case', 'chairman', 'affairs', 'secgen', 'board_sec', 'board', 'board_ex'],
  'agenda-set.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'agenda.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'agenda-meeting-docs.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'meeting-docs.html': ['board_sec', 'affairs', 'chairman', 'board', 'board_ex', 'secgen'],
  'login.html': null,
  'index.html': null
};

function canAccessPage(pageName, roleId){
  const cleanPage = (pageName || '').split('?')[0].split('#')[0];
  const perms = PAGE_PERMISSIONS[cleanPage];
  if (perms === undefined || perms === null) return true;
  return Array.isArray(perms) && perms.includes(roleId);
}

/* current role — เก็บใน sessionStorage เพื่อให้สลับข้ามหน้าได้ */
function currentRoleId(){ return sessionStorage.getItem('ecmis_role') || 'affairs'; }
function setRole(id){
  sessionStorage.setItem('ecmis_role', id);
  const r = getRole(id);
  if (r && r.login) {
    sessionStorage.setItem('ecmis_username', r.login);
  }
  const page = (location.pathname.split('/').pop() || '').split('?')[0];
  if (!canAccessPage(page, id)) {
    location.href = homeHref(id);
    return;
  }
  location.reload();
}
function currentRole(){ return getRole(currentRoleId()); }

function isAuthed(){ return sessionStorage.getItem('ecmis_authed') === '1'; }
function currentUsername(){ return sessionStorage.getItem('ecmis_username') || ''; }
function logout(){
  sessionStorage.removeItem('ecmis_authed');
  sessionStorage.removeItem('ecmis_role');
  sessionStorage.removeItem('ecmis_username');
  sessionStorage.removeItem('ecmis_flash_toast');
  location.href = resolvePage('login.html');
}

function inboxFor(roleId){
  return CASES.filter(c => STATUS[c.status] && STATUS[c.status].owner === roleId);
}

function canAct(kase, roleId){
  const st = STATUS[kase.status];
  if(!st || st.scope === 'UPSTREAM') return false;
  if(roleId === 'support_sub' || roleId === 'sup_chair' || roleId === 'sup_sec' || roleId === 'sup_asst') {
    return st.owner === 'support_sub' || kase.status === 'IN_SUPPORT_SUB' || kase.status === 'IN_SUPPORT_SUB_72';
  }
  return st.owner === roleId;
}

function canRecall(kase, roleId){
  if(roleId !== 'owner') return false;
  return ['PENDING_SECTION','PENDING_DIRECTOR','PENDING_DEPUTY'].includes(kase.status);
}

function inResFolder() {
  return (typeof location !== 'undefined') && (
    (location.pathname || '').includes('/res/') ||
    (location.pathname || '').endsWith('/res')
  );
}

/* Dynamic Asset Path Resolver */
function assetUrl(relPath) {
  const p = (relPath || '').replace(/^\/+/, '');
  return inResFolder() ? `../assets/${p}` : `assets/${p}`;
}

/* Supabase Singleton Provider */
const DEFAULT_SUPABASE_URL = 'https://ljhabbwjxnoucrcrsoii.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd';

function getSupabaseClient(url, key, customOpts) {
  if (window.__ecmisSupabaseClient) {
    return window.__ecmisSupabaseClient;
  }
  const targetUrl = url || DEFAULT_SUPABASE_URL;
  const targetKey = key || DEFAULT_SUPABASE_KEY;
  const defaultOpts = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  };
  const opts = customOpts ? Object.assign({}, defaultOpts, customOpts) : defaultOpts;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.__ecmisSupabaseClient = window.supabase.createClient(targetUrl, targetKey, opts);
    return window.__ecmisSupabaseClient;
  }
  return null;
}

const NAV = [
  { section:'ภาพรวม' },
  { href: role => homeHref(role?.id),     icon:'fa-inbox',

    label: role => {
      if (!role) return 'รายการพิจารณา/ลงนาม';
      if (role.id === 'board_sec') return 'ทะเบียนวาระการประชุม';
      if (role.id === 'board' || role.id === 'board_ex') return 'รอบการประชุมและอ่านวาระล่วงหน้า';
      if (role.id === 'affairs') return 'รายการเรื่องที่ต้องจัดทำ';
      if (role.id === 'support_sub' || role.id === 'sup_chair') return 'รายการสำนวนรอกลั่นกรอง';
      if (isUpstreamRole(role.id)) return 'รายการติดตามสถานะสำนวน';
      return 'รายการพิจารณา/ลงนาม';
    },
    /* board_sec's badge lives on the resolution-inbox.html item below instead — that page
       (not this home item) is what actually shows the full inboxFor() scope of cases. */
    badge: role => !role || role.id !== 'board_sec' },
  { href:'case-register.html',         icon:'fa-folder-open',      label:'ทะเบียนสำนวน' },

  { section:'การประชุมคณะกรรมการ ป.ป.ท.' },
  { href:'meeting-report.html',        icon:'fa-file-contract',    label:'จัดทำรายงานมติการประชุม',
    visible: role => !!role && can('compile.minutes', role.id) },
  { href:'agenda-registry.html',       icon:'fa-table-list',       label:'ทะเบียนวาระการประชุม',
    /* board_sec/secgen/chairman/affairs ซ่อนลิงก์นี้ไว้ — ประธานฯ, เลขาธิการฯ และกลุ่มงานกิจการฯ ไม่มีกระบวนงานในหน้านี้ */
    visible: role => !!role && role.id !== 'secgen' && role.id !== 'board_sec' && role.id !== 'chairman' && role.id !== 'affairs' },
  { href:'resolution-inbox.html',      icon:'fa-scale-balanced',   label:'รายการรอจัดทำมติ',
    /* work-inbox เดิมของ board_sec ครอบคลุมทั้ง flow (AGENDA_SET..RESOLVED/RESOLVED_PENDING)
       กว้างกว่าคิวใน agenda-registry.html (ซึ่งเป็นแค่ AGENDA_SET/PENDING_INVITE_72/DEFERRED)
       จึงยังต้องมีลิงก์แยกไว้ — badge ของ home item ด้านบนก็ย้ายมาไว้ที่นี่ด้วย */
    visible: role => !!role && role.id === 'board_sec', badge:true },
  { href:'dashboard.html',                icon:'fa-chart-pie',        label:'Dashboard สถิติมติ',
    visible: role => !!role && ['affairs','board_sec','chairman','board','secgen'].includes(role.id) },
  { href:'followup-dashboard.html',       icon:'fa-diagram-project',  label:'ติดตามผลมติ',
    /* บอร์ด/ประธานฯ ต้องเห็นหน้านี้ด้วย — ตาม design doc (สรุปการเชื่อมโยงกิจกรรมกับกิจกรรมที่7)
       กจ.8 ป้อน feedback loop กลับเข้า Dashboard เสนอบอร์ด กจ.7 พร้อมแจ้งเตือนคดีล่าช้าให้บอร์ดเร่งรัด
       ไม่ใช่แค่ฝ่ายปฏิบัติการ (affairs/board_sec) เท่านั้นที่ควรเห็น */
    visible: role => !!role && ['affairs','board_sec','chairman','board'].includes(role.id) }
];

function navLabel(navItem, role){
  return typeof navItem.label === 'function' ? navItem.label(role) : navItem.label;
}
function navHref(navItem, role){
  const h = typeof navItem.href === 'function' ? navItem.href(role) : navItem.href;
  return resolvePage(h);
}

function visibleNavFor(role){
  const filtered = NAV.filter(n => !n.visible || n.visible(role));
  return filtered.filter((n, i) => {
    if(!n.section) return true;
    const next = filtered[i + 1];
    return !!next && !next.section;
  });
}

function renderShell(activeHref){
  if(!isAuthed()){
    location.href = resolvePage('login.html');
    return;
  }
  const role = currentRole();

  /* Page Guard Check: ป้องกันการพิมพ์ URL เข้าถึงหน้าที่ไม่มีสิทธิ์ */
  const currentPage = (location.pathname.split('/').pop() || '').split('?')[0];
  if (!canAccessPage(currentPage, role.id)) {
    sessionStorage.setItem('ecmis_flash_toast', JSON.stringify({
      type: 'warn',
      message: `คุณไม่มีสิทธิ์เข้าถึงหน้านี้ในบทบาท ${role.name} (${role.title}) — ระบบได้นำท่านกลับมายังหน้าหลัก`
    }));
    location.href = homeHref(role.id);
    return;
  }

  const inboxCount = inboxFor(role.id).length;

  const notifications = [
    { title: 'เสนอเรื่องใหม่', body: 'สำนวน 1547/2568 รอเลขาธิการฯ พิจารณา/ลงนาม', time: '10 นาทีที่แล้ว', icon: 'fa-user-check', cls: 'bg-primary text-white' },
    { title: 'มติบอร์ดเสร็จสิ้น', body: 'บันทึกมติที่ประชุมบอร์ด สำนวน 1119/2565 แล้ว', time: '1 ชม. ที่แล้ว', icon: 'fa-scale-balanced', cls: 'bg-success text-white' },
    { title: 'คำร้องขอใบด่วน', body: 'ผอ.กบค. ส่งใบด่วนขอวาระด่วน สำนวน 1396/2564', time: '2 ชม. ที่แล้ว', icon: 'fa-bolt', cls: 'bg-warning text-dark' }
  ];
  const notifItems = notifications.map(n => `
    <li class="p-2 border-bottom" style="font-size:0.78rem">
      <div class="d-flex gap-2">
        <span class="rounded-circle d-flex align-items-center justify-content-center ${n.cls}" style="width:28px;height:28px;flex:0 0 auto">
          <i class="fa-solid ${n.icon}" style="font-size:0.75rem"></i>
        </span>
        <div>
          <strong class="d-block text-dark dark-text-light" style="font-size:0.8rem">${n.title}</strong>
          <span class="text-muted d-block" style="font-size:0.74rem">${n.body}</span>
          <small class="text-muted" style="font-size:0.66rem">${n.time}</small>
        </div>
      </div>
    </li>`).join('');

  /* แจ้งเตือนล่วงหน้า 15 วันก่อนครบกำหนด 60 วัน/2 ปี — เฉพาะสำนวนที่ role นี้เข้าถึงได้ */
  const deadlineAlerts = upcomingDeadlines(CASES.filter(c => canViewCase(c, role.id)));
  const DEADLINE_LABEL = { deadline60: 'ครบกำหนด 60 วัน', deadline2y: 'ครบกำหนด 2 ปี' };
  const deadlineNotifItems = deadlineAlerts.map(a => {
    const href = pageForCase(a.kase, role.id) + '?case=' + encodeURIComponent(a.kase.id);
    const urgentCls = a.daysLeft <= 3 ? 'bg-danger text-white' : 'bg-warning text-dark';
    return `
    <li class="p-2 border-bottom" style="font-size:0.78rem">
      <a href="${href}" class="d-flex gap-2 text-decoration-none">
        <span class="rounded-circle d-flex align-items-center justify-content-center ${urgentCls}" style="width:28px;height:28px;flex:0 0 auto">
          <i class="fa-solid fa-clock" style="font-size:0.75rem"></i>
        </span>
        <div>
          <strong class="d-block text-dark dark-text-light" style="font-size:0.8rem">${DEADLINE_LABEL[a.deadlineType]}</strong>
          <span class="text-muted d-block" style="font-size:0.74rem">สำนวน ${a.kase.id} — เหลือ ${a.daysLeft} วัน</span>
        </div>
      </a>
    </li>`;
  }).join('');
  const totalNotifCount = notifications.length + deadlineAlerts.length;

  const ROLE_SWITCHER_GROUPS = [
    {
      group: 'เลขาธิการฯ/รองเลขาธิการ',
      roles: ['secgen']
    },
    {
      group: 'คณะอนุกรรมการสนับสนุนเลขาธิการฯ',
      roles: ['support_sub']
    },
    {
      group: 'คณะกรรมการ ป.ป.ท.',
      roles: ['chairman', 'board']
    },
    {
      group: 'กลุ่มงานวินิจฉัยและมติคณะกรรมการ',
      roles: ['board_sec']
    },
    {
      group: 'กลุ่มงานกิจการคณะกรรมการ',
      roles: ['affairs']
    }
  ];

  const roleMenuHtml = ROLE_SWITCHER_GROUPS.map(g => {
    const items = g.roles.map(rid => {
      const r = getRole(rid);
      if(!r) return '';
      const isActive = r.id === role.id;
      return `<li>
        <a class="dropdown-item py-1 px-3 ${isActive ? 'active' : ''}" href="#" onclick="event.preventDefault(); ECMIS.setRole('${r.id}');" style="font-size:0.8rem">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="fw-semibold">${r.title}</div>
              <small class="text-muted ${isActive ? 'text-white-50' : ''}">${r.name}</small>
            </div>
            ${isActive ? '<i class="fa-solid fa-check ms-2 text-warning"></i>' : ''}
          </div>
        </a>
      </li>`;
    }).join('');
    return `<li><h6 class="dropdown-header text-navy fw-bold py-1 px-3 mt-1" style="font-size:0.72rem; letter-spacing:0.5px; background:rgba(15,42,98,0.04);">${g.group}</h6></li>${items}`;
  }).join('');

  /* ---- topbar ---- */
  const topbar = `
  <header class="app-topbar no-print">
    <button class="btn btn-sm text-secondary d-lg-none border-0" id="sbToggle" aria-label="เปิด/ปิดเมนู">
      <i class="fa-solid fa-bars"></i>
    </button>
    <button class="btn btn-sm text-secondary d-none d-lg-inline-flex border-0" id="sbCollapseToggle" aria-label="ย่อ/ขยายเมนูด้านข้าง" title="ย่อ/ขยายเมนูด้านข้าง">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="ms-auto d-flex align-items-center gap-2">
      <!-- Font Size Controls -->
      <span class="text-muted small d-none d-sm-inline ms-2" style="font-size:0.8rem">ขนาดตัวอักษร:</span>
      <div class="btn-group btn-group-sm border rounded-pill overflow-hidden bg-light" role="group" aria-label="ขนาดตัวอักษร">
        <button type="button" class="btn btn-sm btn-light border-end px-2 py-0 text-secondary" onclick="ECMIS.changeFont(-1)" title="อักษรเล็กลง" style="font-size:0.78rem">A-</button>
        <button type="button" class="btn btn-sm btn-light border-end px-2 py-0 text-secondary" onclick="ECMIS.changeFont(0)" title="ขนาดปกติ" style="font-size:0.78rem">A</button>
        <button type="button" class="btn btn-sm btn-light px-2 py-0 text-secondary" onclick="ECMIS.changeFont(1)" title="อักษรใหญ่ขึ้น" style="font-size:0.78rem">A+</button>
      </div>

      <!-- Color mode: วนสามโหมด ปกติ (Light) → มืด (Dark) → คอนทราสต์สูง (High Contrast) -->
      <button id="colorModeToggle" class="btn btn-sm btn-light border rounded-pill px-3 py-1 text-secondary d-inline-flex align-items-center gap-1" onclick="ECMIS.toggleColorMode()" title="ปรับสี" style="font-size:0.8rem">
        <i class="fa-solid fa-circle-half-stroke"></i> <span>ปรับสี</span>
      </button>

      <!-- Notification Bell -->
      <div class="dropdown">
        <button class="btn btn-sm btn-light border-0 rounded-circle position-relative p-2 ms-1" data-bs-toggle="dropdown" aria-expanded="false" title="การแจ้งเตือน" style="width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center">
          <i class="fa-solid fa-bell text-secondary"></i>
          <span id="notifBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger ${totalNotifCount ? '' : 'd-none'}" style="font-size:.58rem; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; padding:0">${totalNotifCount}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end p-0" style="width:290px; max-height:360px; overflow-y:auto">
          <li id="notifDeadlineSection">${deadlineAlerts.length ? `<h6 class="dropdown-header border-bottom p-2 text-danger" style="font-size: 0.82rem"><i class="fa-solid fa-clock me-1"></i>ใกล้ครบกำหนด (ภายใน 15 วัน)</h6><ul class="list-unstyled m-0">${deadlineNotifItems}</ul>` : ''}</li>
          <li><h6 class="dropdown-header border-bottom p-2 text-dark dark-text-light" style="font-size: 0.82rem">การแจ้งเตือนล่าสุด</h6></li>
          ${notifItems}
          <li class="text-center p-2"><a href="#" style="font-size:0.75rem; text-decoration:none; color:var(--ecmis-navy)">ดูการแจ้งเตือนทั้งหมด</a></li>
        </ul>
      </div>

      <!-- User Profile Dropdown Pill -->
      <div class="dropdown user-profile ms-1">
        <button class="btn btn-sm btn-light border rounded-pill px-3 py-1 dropdown-toggle user-pill text-secondary d-inline-flex align-items-center gap-1" data-bs-toggle="dropdown" aria-expanded="false" style="font-size:0.82rem" title="ข้อมูลผู้ใช้งาน">
          <i class="fa-solid fa-user"></i>
          <span>${role.name} — ${role.title}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" style="min-width: 260px;">
          <li class="px-3 py-2 border-bottom bg-light">
            <div class="fw-bold text-dark" style="font-size:0.85rem">${role.name}</div>
            <div class="text-muted small">${role.title}</div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style="font-size:0.68rem">ผู้ใช้งานปัจจุบัน</span>
          </li>
          <li><a class="dropdown-item text-danger py-2 px-3 fw-semibold" href="#" id="btnLogout" style="font-size:0.82rem"><i class="fa-solid fa-right-from-bracket me-2"></i>ออกจากระบบ</a></li>
        </ul>
      </div>
    </div>
  </header>`;

  /* ---- sidebar ---- */
  const navHtml = visibleNavFor(role).map(n => {
    if(n.section) return `<div class="nav-section">${n.section}</div>`;
    const href = navHref(n, role);
    const active = href === activeHref;
    const showBadge = typeof n.badge === 'function' ? n.badge(role) : n.badge;
    const badge = showBadge && inboxCount ? `<span class="badge bg-danger rounded-pill">${inboxCount}</span>` : '';
    const step  = n.step ? `<span class="step-no">${n.step}</span>` : `<i class="fa-solid ${n.icon}"></i>`;
    const label = navLabel(n, role);
    return `<a class="nav-link ${active?'active':''}" href="${href}" title="${label}" ${n.muted?'style="opacity:.7"':''}>
      ${step}<span>${label}</span>${badge}
    </a>`;
  }).join('');

  /* Sidebar-bottom user chip — ข้อมูลผู้ใช้งานปัจจุบัน และ Logout */
  const userChip = `
  <div class="dropdown sidebar-user-chip">
    <button class="sidebar-user-chip-btn" data-bs-toggle="dropdown" aria-expanded="false" title="${role.name} — ${role.title}">
      <span class="sidebar-user-chip-avatar">${role.name.charAt(0)}</span>
      <span class="sidebar-user-chip-text">
        <strong>${role.name}</strong>
        <small>${role.title}</small>
      </span>
    </button>
    <ul class="dropdown-menu shadow" style="min-width: 240px;">
      <li class="px-3 py-2 border-bottom bg-light">
        <div class="fw-bold text-dark" style="font-size:0.85rem">${role.name}</div>
        <div class="text-muted small">${role.title}</div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style="font-size:0.68rem">ผู้ใช้งานปัจจุบัน</span>
      </li>
      <li><a class="dropdown-item text-danger py-2 px-3 fw-semibold" href="#" id="btnLogoutSidebar" style="font-size:0.82rem"><i class="fa-solid fa-right-from-bracket me-2"></i>ออกจากระบบ</a></li>
    </ul>
  </div>`;

  const isResPage = typeof location !== 'undefined' && location.pathname.includes('/res/');
  const brandLogoSrc = isResPage ? '../assets/pacc_logo.png' : 'assets/pacc_logo.png';

  const sidebar = `
  <nav class="app-sidebar no-print" id="appSidebar">
    <a class="brand text-decoration-none" href="${homeHref(role.id)}">
      <img src="${brandLogoSrc}" onerror="this.onerror=null;this.src='pacc_logo.png';" alt="ตราสำนักงาน ป.ป.ท.">
      <span>E-CMIS
        <small>สำนักงาน ป.ป.ท.</small>
      </span>
    </a>
    <div class="sidebar-nav-scroll">${navHtml}</div>
    ${userChip}
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', topbar + sidebar);

  ['btnLogout', 'btnLogoutSidebar'].forEach(id => {
    const btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', e => { e.preventDefault(); logout(); });
  });
  const tog = document.getElementById('sbToggle');
  if(tog) tog.addEventListener('click', () => document.getElementById('appSidebar').classList.toggle('open'));
  const collapseTog = document.getElementById('sbCollapseToggle');
  if(collapseTog) collapseTog.addEventListener('click', () => toggleSidebarCollapse());

  initA11yAndPref();
  initCommandPalette();
  initVoiceInput();
  initCharCounterAndCopy();
  initDocPaneToggle();

  const DETAIL_PAGES = [
    'resolution-72.html', 'resolution.html', 'board-resolution.html', 'ruling-report.html',
    'approval-review.html', 'review.html', 'agenda-set.html', 'agenda.html',
    'agenda-meeting-docs.html', 'meeting-docs.html', 'agenda-registry-detail.html', 'agenda-detail.html',
    'order-m24.html', 'order.html', 'subcommittee-screening.html', 'screening.html',
    'support-subcommittee.html', 'urgent-agenda.html', 'chairman-agenda.html', 'chairman.html'
  ];
  if (DETAIL_PAGES.includes(activeHref) && !document.querySelector('[data-no-back="true"]')) {
    renderBackButton();
  }

  document.querySelectorAll('form[id], main form').forEach(f => {
    if (f.id) initRealTimeValidation(f);
  });

  document.querySelectorAll('form[data-autosave]').forEach(f => {
    const key = f.dataset.autosave || ('draft_' + f.id);
    initAutoSave(f.id, key, 'คุณยังมีข้อมูลที่ไม่ได้บันทึก — ออกจากหน้านี้?');
  });

  document.querySelectorAll('table tbody:empty, table tbody').forEach(tbody => {
    if (!tbody.children.length) {
      const cols = tbody.closest('table')?.querySelectorAll('thead th').length || 4;
      tbody.innerHTML = Array.from({length:3}, () =>
        `<tr class="skeleton-row">${Array.from({length:cols}, () =>
          `<td><div class="skeleton-box" style="height:14px;border-radius:4px;background:#e2e8f0;width:${60+Math.random()*30|0}%"></div></td>`
        ).join('')}</tr>`
      ).join('');
    }
  });

  // Empty State: show friendly message when no data after load
  setTimeout(() => {
    document.querySelectorAll('table tbody').forEach(tbody => {
      const rows = tbody.querySelectorAll('tr:not(.skeleton-row)');
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="99" class="ecmis-empty-state">
          <div style="text-align:center;padding:32px 16px;color:var(--ecmis-muted)">
            <i class="fa-solid fa-inbox fa-2x mb-3" style="opacity:.4"></i>
            <div style="font-size:.92rem;font-weight:600">ไม่พบข้อมูล</div>
            <div style="font-size:.8rem;margin-top:4px">ไม่มีรายการที่ตรงกับเงื่อนไข หรือยังไม่มีข้อมูลในระบบ</div>
          </div>
        </td></tr>`;
      }
    });
  }, 800);

  const activeNav = NAV.find(n => navHref(n, role) === activeHref);
  if (activeNav) {
    let parentSection = 'ภาพรวม';
    for (let i = 0; i < NAV.length; i++) {
      if (NAV[i].section) parentSection = NAV[i].section;
      if (navHref(NAV[i], role) === activeHref) break;
    }
    const breadcrumbHtml = `
      <nav aria-label="breadcrumb" class="no-print mb-2">
        <ol class="breadcrumb" style="font-size:0.75rem; margin:0 0 12px 0; padding:0; list-style:none; display:flex; gap:6px">
          <li class="breadcrumb-item"><a href="${homeHref(role.id)}" style="text-decoration:none; color:var(--ecmis-navy)"><i class="fa-solid fa-house me-1"></i>Home</a></li>
          <li class="breadcrumb-item text-muted" style="display:flex; gap:6px"><span style="margin:0 4px">/</span>${parentSection}</li>
          <li class="breadcrumb-item active" style="display:flex; gap:6px" aria-current="page"><span style="margin:0 4px">/</span>${navLabel(activeNav, role)}</li>
        </ol>
      </nav>`;
    const appMain = document.querySelector('.app-main');
    if (appMain) {
      appMain.insertAdjacentHTML('afterbegin', breadcrumbHtml);
    }
  }

  /* Flash Toast Listener */
  const flashToast = sessionStorage.getItem('ecmis_flash_toast');
  if (flashToast) {
    try {
      const ft = JSON.parse(flashToast);
      sessionStorage.removeItem('ecmis_flash_toast');
      setTimeout(() => {
        if (ft.type === 'warn') toastWarn(ft.message);
        else toastOk(ft.message);
      }, 300);
    } catch(e) {
      sessionStorage.removeItem('ecmis_flash_toast');
    }
  }

  refreshDeadlineNotificationsFromSupabase(role);
}

/* แจ้งเตือนใกล้ครบกำหนดใน renderShell() ด้านบนคำนวณจาก CASES (mock array) ตอน render ครั้งแรก
   เพราะ renderShell ทำงานแบบ synchronous บนทุกหน้า — ฟังก์ชันนี้ fire-and-forget รีเฟรชด้วยข้อมูล
   จริงจาก Supabase ทีหลัง (ไม่ block การ render เริ่มต้น) หน้าที่ยังไม่ได้โหลด supabase-js CDN
   script (ยัง migrate ไม่ครบทุกหน้า) จะข้ามส่วนนี้ไปเงียบๆ ไม่กระทบการทำงานอื่น */
async function refreshDeadlineNotificationsFromSupabase(role) {
  if (typeof window.supabase === 'undefined') return;
  try {
    const sbShell = getSupabaseClient();
    if (!sbShell) throw new Error('Supabase client unavailable');
    const { data, error } = await sbShell
      .from('tbl_res_request')
      .select('*, tbl_cmp_case!inner(*, tbl_cmp_case_accused(*))')
      .eq('is_deleted', false);
    if (error) throw error;
    const cases = (data || []).map(supabaseRowToCase).filter(Boolean);
    const alerts = upcomingDeadlines(cases.filter(c => canViewCase(c, role.id)));

    const DEADLINE_LABEL = { deadline60: 'ครบกำหนด 60 วัน', deadline2y: 'ครบกำหนด 2 ปี' };
    const itemsHtml = alerts.map(a => {
      const href = pageForCase(a.kase, role.id) + '?case=' + encodeURIComponent(a.kase.id);
      const urgentCls = a.daysLeft <= 3 ? 'bg-danger text-white' : 'bg-warning text-dark';
      return `
      <li class="p-2 border-bottom" style="font-size:0.78rem">
        <a href="${href}" class="d-flex gap-2 text-decoration-none">
          <span class="rounded-circle d-flex align-items-center justify-content-center ${urgentCls}" style="width:28px;height:28px;flex:0 0 auto">
            <i class="fa-solid fa-clock" style="font-size:0.75rem"></i>
          </span>
          <div>
            <strong class="d-block text-dark dark-text-light" style="font-size:0.8rem">${DEADLINE_LABEL[a.deadlineType]}</strong>
            <span class="text-muted d-block" style="font-size:0.74rem">สำนวน ${escapeHtml(a.kase.id)} — เหลือ ${a.daysLeft} วัน</span>
          </div>
        </a>
      </li>`;
    }).join('');

    const section = document.getElementById('notifDeadlineSection');
    if (section) {
      section.innerHTML = alerts.length
        ? `<h6 class="dropdown-header border-bottom p-2 text-danger" style="font-size: 0.82rem"><i class="fa-solid fa-clock me-1"></i>ใกล้ครบกำหนด (ภายใน 15 วัน)</h6><ul class="list-unstyled m-0">${itemsHtml}</ul>`
        : '';
    }
    const badge = document.getElementById('notifBadge');
    if (badge) {
      const MOCK_NOTIF_COUNT = 3; // จำนวนคงที่ของ "การแจ้งเตือนล่าสุด" (ข้อมูลตัวอย่าง ไม่ได้มาจากฐานข้อมูลจริง)
      const total = MOCK_NOTIF_COUNT + alerts.length;
      badge.textContent = total;
      badge.classList.toggle('d-none', total === 0);
    }
  } catch (err) {
    console.warn('โหลดแจ้งเตือนใกล้ครบกำหนดจาก Supabase ไม่สำเร็จ ใช้รายการสำนวนจำลอง:', err);
    try {
      const fallbackAlerts = upcomingDeadlines(CASES.filter(c => canViewCase(c, role.id)));
      const DEADLINE_LABEL = { deadline60: 'ครบกำหนด 60 วัน', deadline2y: 'ครบกำหนด 2 ปี' };
      const itemsHtml = fallbackAlerts.map(a => {
        const href = pageForCase(a.kase, role.id) + '?case=' + encodeURIComponent(a.kase.id);
        const urgentCls = a.daysLeft <= 3 ? 'bg-danger text-white' : 'bg-warning text-dark';
        return `
        <li class="p-2 border-bottom" style="font-size:0.78rem">
          <a href="${href}" class="d-flex gap-2 text-decoration-none">
            <span class="rounded-circle d-flex align-items-center justify-content-center ${urgentCls}" style="width:28px;height:28px;flex:0 0 auto">
              <i class="fa-solid fa-clock" style="font-size:0.75rem"></i>
            </span>
            <div>
              <strong class="d-block text-dark dark-text-light" style="font-size:0.8rem">${DEADLINE_LABEL[a.deadlineType]}</strong>
              <span class="text-muted d-block" style="font-size:0.74rem">สำนวน ${escapeHtml(a.kase.id)} — เหลือ ${a.daysLeft} วัน</span>
            </div>
          </a>
        </li>`;
      }).join('');
      const section = document.getElementById('notifDeadlineSection');
      if (section && fallbackAlerts.length) {
        section.innerHTML = `<h6 class="dropdown-header border-bottom p-2 text-danger" style="font-size: 0.82rem"><i class="fa-solid fa-clock me-1"></i>ใกล้ครบกำหนด (ภายใน 15 วัน)</h6><ul class="list-unstyled m-0">${itemsHtml}</ul>`;
      }
      const badge = document.getElementById('notifBadge');
      if (badge) {
        const total = 3 + fallbackAlerts.length;
        badge.textContent = total;
        badge.classList.toggle('d-none', total === 0);
      }
    } catch (e) { /* ignore fallback error */ }
  }
}

function stepperHtml(statusKey, stepsArr, stepMap){
  stepsArr = stepsArr || FLOW_STEPS;
  stepMap = stepMap || STATUS_STEP;
  const cur = stepMap[statusKey] || 'report';
  const idx = stepsArr.findIndex(s => s.key === cur);
  return `<div class="flow-stepper">` + stepsArr.map((s,i) => {
    const cls = i < idx ? 'done' : (i === idx ? 'active' : '');
    const mark = i < idx ? '<i class="fa-solid fa-check"></i>' : (i+1);
    return `<div class="fstep ${cls}">
      <div class="dot">${mark}</div>
      <div class="lbl">${s.label}</div>
    </div>`;
  }).join('') + `</div>`;
}

function typeBadge(c, force72){
  const is72 = force72 !== undefined ? force72 : isCase72(c);
  const is73 = isCase73(c);
  if (is73) {
    return '<span class="meet-badge meet-type-general"><i class="fa-solid fa-scale-balanced me-1"></i>เรื่องทั่วไป</span>';
  }
  if (is72) {
    return '<span class="meet-badge meet-type-ruling"><i class="fa-solid fa-gavel me-1"></i>วินิจฉัยชี้มูล</span>';
  }
  return '<span class="meet-badge meet-type-inquiry"><i class="fa-solid fa-file-lines me-1"></i>ไต่สวนเบื้องต้น</span>';
}

function statusBadge(statusKey){
  const s = STATUS[statusKey];
  if (!s) return '';
  const icon = s.icon || 'fa-circle-dot';
  return `<span class="meet-badge ${s.cls}"><i class="fa-solid ${icon} me-1" style="font-size:0.65rem"></i>${s.label}</span>`;
}

/* เพดาน SLA ที่ใช้จริงกับสำนวน — ชั้นเลขาธิการฯ ใช้ตารางตามชนิดรายงาน/ระยะ
   (ผัง P2 โหนด t5) ส่วนชั้นอื่นยังใช้ค่าที่ติดมากับสำนวน                  */
function effectiveSlaLimit(kase){
  return kase.status === 'PENDING_SECGEN' ? secgenSlaLimit(kase) : kase.slaLimit;
}

function slaBadge(kase){
  const resSla = resolutionSlaInfo(kase);
  if (resSla) {
    return `<span class="sla ${slaClass(resSla.used, resSla.limit)}" title="กำหนดออกมติ 15 วันทำการนับจากวันที่บอร์ดมีมติ">
      <i class="fa-solid fa-clock me-1"></i>${slaLabel(resSla.used, resSla.limit)} (ออกมติ)</span>`;
  }
  const lim = effectiveSlaLimit(kase);
  return `<span class="sla ${slaClass(kase.slaDays, lim)}">
    <i class="fa-solid fa-clock me-1"></i>${slaLabel(kase.slaDays, lim)}</span>`;
}

function actionBar(kase, roleId, buttons, opts){
  const role = getRole(roleId);
  /* opts.forceAllowed — ใช้เมื่อหน้าเพจคำนวณสิทธิ์เองแล้วจากโมเดลสิทธิ์เฉพาะของหน้านั้น
     (เช่น order24.draft / role.id===SIGNER.roleId) ไม่ใช่จาก STATUS[status].owner ทั่วไป
     ค่าเริ่มต้น false เพื่อไม่กระทบพฤติกรรมเดิมของหน้าอื่นที่พึ่งพา canAct ตามสถานะ */
  const allowed = (opts && opts.forceAllowed) || canAct(kase, roleId);
  let inner;

  if(isUpstreamCase(kase)){

    const ownerRole = STATUS[kase.status] ? getRole(STATUS[kase.status].owner) : null;
    inner = `<div class="no-permission" style="border-color:#d79b00;background:#fff8ec">
      <i class="fa-solid fa-arrow-right-to-bracket me-1"></i>
      <strong>สำนวนนี้ยังไม่เข้าสู่กิจกรรมที่ 7</strong> — อยู่ระหว่างการเสนอตามลำดับชั้น
      ภายในกอง / สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ เขต ซึ่งเป็นกระบวนงานของ <strong>กิจกรรมที่ 5</strong>
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
    </div>`;
  }

  const scopeTag = role.scope === 'UPSTREAM'
    ? `<span class="st st-draft ms-1">นอกขอบเขต กจ.7</span>`
    : '';
  const editTag = canEditMaster(roleId)
    ? `<span class="st st-done ms-1" title="ชีตแถว 15 — มีเพียง 7 คนที่แก้ไขมติ/คำสั่ง/รายงานได้">
         <i class="fa-solid fa-pen-to-square"></i> แก้ไขมติได้</span>`
    : `<span class="st st-closed ms-1" title="ชีตแถว 15/17 — บทบาทนี้แก้ไขมติ/คำสั่ง/รายงานไม่ได้">
         <i class="fa-solid fa-lock"></i> แก้ไขมติไม่ได้</span>`;

  return `<div class="action-bar" id="caseActionBar">
    <div class="role-hint">
      <i class="fa-solid fa-user me-1"></i>กำลังดำเนินการในบทบาท:
      <strong>${role.title}</strong> ${scopeTag} ${editTag}
    </div>${inner}
  </div>`;
}

/* เลขไทย — เอกสารราชการที่พิมพ์ออกใช้เลขไทย ต่างจากฟิลด์กรอกข้อมูลในฟอร์ม
   ซึ่งยังคงเป็นเลขอารบิกเพื่อความสะดวกในการพิมพ์/ค้นหา                    */
const THAI_DIGITS = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
function toThaiDigits(input){
  if(input === undefined || input === null) return input;
  return String(input).replace(/[0-9]/g, d => THAI_DIGITS[d]);
}

/* -------------------------------------------- Document Template Engine */
/* แทนค่าฟิลด์ลงเทมเพลต — จำลอง Document Template Engine (TOR 7.1.3.6)
   ทุกค่าที่ผ่านฟังก์ชันนี้ถือว่ากำลังลงเอกสารจริง จึงแปลงเป็นเลขไทยเสมอ    */
/* ค่าที่ไหลเข้า mergeField() มาจาก Supabase (เขียนได้โดย anon key ที่ฝังอยู่ในหน้าเว็บทุกหน้า
   โดยดีไซน์ เพราะระบบยังไม่มี auth จริง) จึงถือเป็น untrusted input เสมอ — escape ก่อน wrap
   ป้องกัน stored XSS ผ่านชื่อผู้ถูกกล่าวหา/ความเห็น/ฯลฯ ที่ render ลง docPaper.innerHTML */
function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mergeField(value, placeholder){
  if(value === undefined || value === null || String(value).trim() === ''){
    return `<span class="mergefield empty" title="ยังไม่มีข้อมูล — ต้องกรอกในฟอร์มด้านซ้าย">${escapeHtml(placeholder||'……………')}</span>`;
  }
  return `<span class="mergefield filled" title="Auto-fill จากฟอร์ม/ฐานข้อมูลกลาง E-CMIS">${escapeHtml(toThaiDigits(value))}</span>`;
}

/* -------------------------------------------- PAGINATION (มติการประชุม / เอกสาร .doc-resolution)
   เอกสารมติจริงยาวเกิน 1 หน้าเสมอ (ผู้ถูกร้องหลายคน/ความเห็นยาว) และหน้า 2 เป็นต้นไปต้องมี
   หัวกระดาษวิ่ง + เลขหน้าซ้ำ (ขนาดอักษรในเอกสารมติ.xlsx ข้อ 7-8) — เดิมใช้เทคนิค <table><thead>
   ให้เบราว์เซอร์พิมพ์ซ้ำเอง แต่ทำเลขหน้าที่ต้องขึ้นเฉพาะหน้า 2+ (ไม่ขึ้นหน้า 1) ไม่ได้ เพราะ thead
   ซ้ำเนื้อหาเดิมทุกหน้ารวมหน้าแรกด้วย ฟังก์ชันนี้จึงวัดความสูงเนื้อหาจริงในเบราว์เซอร์ (DOM ที่ซ่อน
   ไว้ด้วย visibility:hidden ไม่ใช่ display:none จึงยัง layout จริง) แล้วตัดแบ่งเป็นหลาย .doc-paper
   ซ้อนกันเอง แทนการพึ่ง CSS paged-media (Chrome ยังไม่รองรับ margin-box ที่จำเป็นสำหรับเลขหน้าแบบนี้)

   opts:
     introBlock   — HTML คงที่ที่อยู่หัวหน้า 1 เท่านั้น ไม่ไหลข้ามหน้า (หัวเรื่อง/ข้อมูลอ้างอิงสั้นๆ)
     flowBlocks   — array ของ HTML แต่ละชิ้น เป็นหน่วยเล็กสุดที่ตัดขึ้นหน้าใหม่ระหว่างกลางไม่ได้
     signBlock    — HTML คงที่ที่อยู่ท้ายหน้าสุดท้ายเท่านั้น (ลายเซ็น + ลับท้ายกระดาษ)
     runningHeaderHtml(pageNo) — คืน HTML หัวกระดาษวิ่งของหน้านั้น (ไม่ใช้กับหน้า 1) */
function paginateDoc(containerEl, opts){
  const { introBlock, flowBlocks, signBlock, runningHeaderHtml, docClass } = opts;
  const pageClass = `doc-paper${docClass ? ' ' + docClass : ''} a4-paper`;

  let probe = document.getElementById('docPaperProbe');
  if(!probe){
    probe = document.createElement('div');
    probe.id = 'docPaperProbe';
    document.body.appendChild(probe);
  }
  probe.className = pageClass;
  probe.style.cssText = 'position:absolute !important; visibility:hidden !important; pointer-events:none !important; left:-99999px !important; top:0 !important; width:210mm !important; box-sizing:border-box !important; padding:15mm 15mm 18mm 20mm !important; font-family:"Sarabun","Prompt",sans-serif !important; font-size:16pt !important; line-height:1.25 !important; height:auto !important; min-height:0 !important; max-height:none !important; overflow:visible !important; aspect-ratio:auto !important;';

  const mmProbe = document.createElement('div');
  mmProbe.style.cssText = 'position:absolute; visibility:hidden; left:-99999px; height:297mm; width:0; box-sizing:border-box;';
  document.body.appendChild(mmProbe);
  const PHYSICAL_A4_PX = mmProbe.getBoundingClientRect().height;
  mmProbe.remove();

  // Optimal safe budget: full A4 height minus 16px safety clearance for bottom footer "ลับ"
  const PAGE_BUDGET = PHYSICAL_A4_PX - 16;

  function measure(html){
    probe.innerHTML = html;
    return probe.offsetHeight || probe.scrollHeight;
  }

  const pages = [];
  let pageBlocks = introBlock ? [introBlock] : [];
  let isFirst = true;

  function pushPage(){
    if (pageBlocks.length > 0) {
      pages.push({ isFirst, blocks: pageBlocks });
      pageBlocks = [];
      isFirst = false;
    }
  }
  function prefixFor(estPageNo){ return isFirst ? '' : runningHeaderHtml(estPageNo); }

  (flowBlocks || []).forEach(block => {
    if (!block) return;
    const isFirstBlock = pageBlocks.length === (isFirst ? 1 : 0);
    const candidate = prefixFor(pages.length + (isFirst ? 1 : 2)) + pageBlocks.join('') + block;
    if(isFirstBlock || measure(candidate) <= PAGE_BUDGET){
      pageBlocks.push(block);
    } else {
      pushPage();
      pageBlocks.push(block);
    }
  });

  if (signBlock) {
    const withSign = prefixFor(pages.length + (isFirst ? 1 : 2)) + pageBlocks.join('') + signBlock;
    const isFirstBlock = pageBlocks.length === (isFirst ? 1 : 0);
    if(isFirstBlock || measure(withSign) <= PAGE_BUDGET){
      pageBlocks.push(signBlock);
      pushPage();
    } else {
      pushPage();
      pageBlocks = [signBlock];
      pushPage();
    }
  } else if (pageBlocks.length > 0) {
    pushPage();
  }

  containerEl.innerHTML = pages.map((p, i) => {
    const pageNo = i + 1;
    const header = p.isFirst ? '' : runningHeaderHtml(pageNo);
    const footSecret = (opts.secret !== false) ? '<div class="doc-secret-foot">ลับ</div>' : '';
    return `<div class="${pageClass}" data-page-no="${pageNo}" style="height:297mm; max-height:297mm; overflow:hidden; box-sizing:border-box;">${header}${p.blocks.join('')}${footSecret}</div>`;
  }).join('');
}

function paginateResolutionDoc(containerEl, opts){
  return paginateDoc(containerEl, { ...opts, docClass: 'doc-resolution' });
}

/* ---------------------------------------------------------- EXPORT PDF (Direct PDF File Download) */
async function exportDocToPdf(containerEl, filename = 'document.pdf', opts = {}) {
  if (!containerEl || typeof document === 'undefined') return;

  // Check if html2pdf is available, if not dynamically load it
  if (typeof html2pdf === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      const isRes = typeof location !== 'undefined' && location.pathname.includes('/res/');
      script.src = isRes ? '../assets/html2pdf.bundle.min.js' : 'assets/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = () => {
        console.warn('html2pdf.bundle.min.js failed to load, falling back to window.print()');
        window.print();
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  if (typeof html2pdf === 'undefined') {
    window.print();
    return;
  }

  if (typeof toastOk === 'function') {
    toastOk('กำลังแปลงและสร้างไฟล์ PDF กรุณารอสักครู่...');
  }

  const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const opt = {
    margin: [0, 0, 0, 0],
    filename: pdfFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: opts.orientation || 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(containerEl).save();
    if (typeof toastOk === 'function') {
      toastOk(`ดาวน์โหลด ${escapeHtml(pdfFilename)} สำเร็จ`);
    }
  } catch (err) {
    console.error('PDF Export error:', err);
    if (typeof toastWarn === 'function') {
      toastWarn('ไม่สามารถดาวน์โหลด PDF โดยตรงได้ กำลังเปิดหน้าพิมพ์แทน...');
    }
    window.print();
  }
}

/* ---------------------------------------------------------- EXPORT DOCX (Word Document Export) */
function exportDocToDocx(containerEl, filename = 'document.docx'){
  if (!containerEl) return;
  const pages = containerEl.querySelectorAll('.doc-paper, .a4-paper');
  let bodyContent = '';
  
  if (pages.length > 0) {
    pages.forEach((p, idx) => {
      const clone = p.cloneNode(true);
      clone.querySelectorAll('.doc-run-title, .doc-run-page').forEach(el => el.remove());
      bodyContent += clone.innerHTML;
      if (idx < pages.length - 1) {
        bodyContent += '<br clear="all" style="page-break-before:always; mso-break-type:section-break">';
      }
    });
  } else {
    bodyContent = containerEl.innerHTML;
  }

  const wordHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${escapeHtml(filename.replace(/\\.docx$/i, ''))}</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
  size: 595.3pt 841.9pt; /* A4 210mm x 297mm */
  margin: 70.85pt 56.7pt 56.7pt 70.85pt; /* Top 2.5cm, Right 2cm, Bottom 2cm, Left 2.5cm */
  mso-header-margin: 35.4pt;
  mso-footer-margin: 35.4pt;
  mso-paper-source: 0;
}
div.Section1 {
  page: Section1;
}
body {
  font-family: 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Cordia New', serif;
  font-size: 16pt;
  line-height: 1.25;
  color: #000000;
}
p {
  margin: 4pt 0;
  line-height: 1.25;
  text-align: justify;
  text-justify: inter-cluster;
}
.doc-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin: 6pt 0 2pt;
}
.doc-sub {
  text-align: center;
  font-size: 16pt;
  margin-bottom: 8pt;
}
.doc-h {
  font-size: 16pt;
  font-weight: bold;
  margin-top: 10pt;
  margin-bottom: 2pt;
}
.doc-indent {
  text-indent: 2.5em;
  text-align: justify;
  text-justify: inter-cluster;
  font-size: 16pt;
  margin-bottom: 4pt;
}
.doc-row {
  font-size: 16pt;
  margin-bottom: 2pt;
}
.doc-sign {
  text-align: center;
  font-size: 16pt;
  margin-top: 16pt;
  line-height: 1.35;
}
.doc-dots {
  border-bottom: 1px dotted #000;
  display: inline-block;
  min-width: 140px;
}
.doc-sign-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 16pt;
}
img {
  max-width: 100%;
}
</style>
</head>
<body>
<div class="Section1">
${bodyContent}
</div>
</body>
</html>`;

  const blob = new Blob(['\\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.docx') ? filename : filename + '.docx';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(link.href);
  }, 300);
}

/* ---------------------------------------------------------- PRINT DOC (Official A4 Clean Print) */
function printDoc(containerEl){
  const target = containerEl || document.getElementById('docPaper');
  if (!target) {
    window.print();
    return;
  }
  
  let printFrame = document.getElementById('ecmisPrintFrame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'ecmisPrintFrame';
    printFrame.style.cssText = 'position:fixed; top:-9999px; left:-9999px; width:0; height:0; border:0;';
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>พิมพ์เอกสาร</title>
<link rel="stylesheet" href="assets/a4-ecmis-workspace.css">
<link rel="stylesheet" href="assets/ecmis-app.css">
<style>
@page { size: A4 portrait; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; width: 210mm; }
.doc-paper, .a4-paper {
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
  margin: 0 auto !important;
  width: 210mm !important;
  min-height: 297mm !important;
  box-sizing: border-box !important;
  padding: 25mm 20mm 20mm 25mm !important;
  page-break-after: always !important;
  break-after: page !important;
}
.doc-paper:last-child, .a4-paper:last-child {
  page-break-after: auto !important;
  break-after: auto !important;
}
</style>
</head>
<body>
${target.innerHTML}
</body>
</html>`);
  frameDoc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 300);
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
function showFloatToast(msg, type = 'success') {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('ecmis-float-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ecmis-float-toast';
    el.style.cssText = 'position:fixed;top:18px;right:24px;z-index:999999;padding:8px 20px;border-radius:999px;font-size:0.88rem;font-weight:500;background:#0F2A62;color:#FFFFFF;box-shadow:0 8px 24px rgba(15,42,98,0.35);border:1px solid rgba(255,255,255,0.18);transition:all 0.25s cubic-bezier(0.4,0,0.2,1);display:inline-flex;align-items:center;gap:10px;pointer-events:none;';
    document.body.appendChild(el);
  }
  const isOk = type === 'success';
  const iconHtml = isOk
    ? '<i class="fa-solid fa-circle-check text-white" style="font-size:1.1rem"></i>'
    : '<i class="fa-solid fa-triangle-exclamation text-warning" style="font-size:1.1rem"></i>';

  el.style.background = '#0F2A62';
  el.style.color = '#FFFFFF';
  el.innerHTML = `${iconHtml}<span style="color:#FFFFFF;font-weight:500;letter-spacing:0.1px">${msg}</span>`;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';

  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
  }, 2200);
}

function toastOk(msg){
  showFloatToast(msg, 'success');
}
function toastWarn(msg){
  showFloatToast(msg, 'warning');
}

function signDialog(docName, signerName){
  let selectedMode = 'hand';

  return Swal.fire({
    width: 720,
    padding: '1.25rem',
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-pen me-1"></i> ลงนาม',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#16A34A',
    cancelButtonColor: '#7C8CA3',
    reverseButtons: true,
    html: `<div class="text-start" style="font-size:0.9rem;">
      <!-- Title & Header -->
      <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <i class="fa-solid fa-pen-nib text-primary fa-lg"></i>
        <h5 class="m-0 fw-bold" style="color:#0F2A62;">ลงนาม${docName || 'เอกสาร'}</h5>
      </div>

      <!-- Info Banner -->
      <div class="p-3 mb-3 rounded-3 d-flex align-items-center gap-2" style="background:#EFF6FF; border:1px solid #DBEAFE; color:#1E40AF; font-size:0.85rem;">
        <i class="fa-solid fa-user me-1"></i>
        <span>ผู้ลงนามคือ <strong>${signerName || 'เจ้าหน้าที่ผู้จัดทำเอกสาร'}</strong> จึงมีเฉพาะการลงนามและไม่มีปุ่มไม่เห็นชอบ/ตีกลับ</span>
      </div>

      <!-- Selection Header -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div>
          <div class="fw-bold" style="font-size:0.9rem; color:#1F2937;">เลือกวิธีลงนาม <span class="text-danger">*</span></div>
          <div class="text-muted" style="font-size:0.78rem;">เลือกได้เพียง 1 วิธีต่อการอนุมัติหนึ่งครั้ง</div>
        </div>
        <div id="swal-sig-mode-badge" class="badge rounded-pill bg-light text-primary border px-2 py-1" style="font-size:0.78rem;">
          <i class="fa-solid fa-check me-1"></i> เซ็นมือ
        </div>
      </div>

      <!-- Method Cards -->
      <div class="row g-3 mb-3">
        <div class="col-6">
          <div id="swal-card-hand" class="p-3 rounded-3 border d-flex gap-3 align-items-start" style="cursor:pointer; background:#F0F6FF; border-color:#2563EB !important; transition:all 0.2s;">
            <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:38px; height:38px; background:#DBEAFE; color:#2563EB;">
              <i class="fa-solid fa-pen fa-lg"></i>
            </div>
            <div>
              <div class="fw-bold text-dark" style="font-size:0.88rem;">1. เซ็นมือ</div>
              <div class="text-muted" style="font-size:0.75rem; line-height:1.35;">ใช้เมาส์หรือทัชแพดลากลายเซ็น <span class="text-primary">(หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ)</span></div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div id="swal-card-cert" class="p-3 rounded-3 border d-flex gap-3 align-items-start" style="cursor:pointer; background:#FFFFFF; border-color:#E5E7EB !important; transition:all 0.2s;">
            <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:38px; height:38px; background:#F1F5F9; color:#64748B;">
              <i class="fa-solid fa-shield-halved fa-lg"></i>
            </div>
            <div>
              <div class="fw-bold text-dark" style="font-size:0.88rem;">2. ลายเซ็น</div>
              <div class="text-muted" style="font-size:0.75rem; line-height:1.35;">หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Area (Option 1) -->
      <div id="swal-box-canvas" class="border rounded-3 p-3 mb-3 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div class="fw-bold" style="font-size:0.9rem; color:#0F172A;">เซ็นชื่อในกรอบด้านล่าง</div>
            <div class="text-muted" style="font-size:0.76rem;">กดเมาส์ค้างแล้วลาก หรือใช้นิ้วบนอุปกรณ์ระบบสัมผัส</div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary border px-2 py-1 rounded-2" id="swal-sig-clear" style="font-size:0.78rem;">
            <i class="fa-solid fa-eraser me-1"></i> ล้างลายเซ็น
          </button>
        </div>
        <div class="sig-canvas-wrapper" style="border: 1px dashed #94A3B8; border-radius: 8px; background:#FAFBFD;">
          <canvas id="swal-sig-canvas" width="640" height="170" style="width:100%; height:170px; touch-action:none;"></canvas>
        </div>
      </div>

      <!-- Certificate Box -->
      <div class="p-3 rounded-3" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.82rem;">
        <div class="d-flex align-items-center gap-2 mb-1">
          <i class="fa-solid fa-circle-check text-success fa-lg"></i>
          <strong>Certificate: PACC-OFFICER-2569-001</strong>
        </div>
        <div>ผู้ถือใบรับรอง: <strong>${signerName || 'เจ้าหน้าที่'}</strong></div>
        <div class="mt-1 text-success" style="font-size:0.78rem;">หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ</div>
      </div>
      <input type="hidden" id="swal-sig-input">
    </div>`,
    didOpen() {
      const cardHand = document.getElementById('swal-card-hand');
      const cardCert = document.getElementById('swal-card-cert');
      const boxCanvas = document.getElementById('swal-box-canvas');
      const badge = document.getElementById('swal-sig-mode-badge');

      function setMode(mode) {
        selectedMode = mode;
        if (mode === 'hand') {
          cardHand.style.background = '#F0F6FF';
          cardHand.style.borderColor = '#2563EB';
          cardHand.querySelector('div:first-child').style.background = '#DBEAFE';
          cardHand.querySelector('div:first-child').style.color = '#2563EB';

          cardCert.style.background = '#FFFFFF';
          cardCert.style.borderColor = '#E5E7EB';
          cardCert.querySelector('div:first-child').style.background = '#F1F5F9';
          cardCert.querySelector('div:first-child').style.color = '#64748B';

          boxCanvas.style.display = 'block';
          badge.className = 'badge rounded-pill bg-light text-primary border px-2 py-1';
          badge.innerHTML = '<i class="fa-solid fa-check me-1"></i> เซ็นมือ';

          initSignaturePad('swal-sig-canvas', 'swal-sig-clear', 'swal-sig-input');
        } else {
          cardCert.style.background = '#F0F6FF';
          cardCert.style.borderColor = '#2563EB';
          cardCert.querySelector('div:first-child').style.background = '#DBEAFE';
          cardCert.querySelector('div:first-child').style.color = '#2563EB';

          cardHand.style.background = '#FFFFFF';
          cardHand.style.borderColor = '#E5E7EB';
          cardHand.querySelector('div:first-child').style.background = '#F1F5F9';
          cardHand.querySelector('div:first-child').style.color = '#64748B';

          boxCanvas.style.display = 'none';
          badge.className = 'badge rounded-pill bg-light text-primary border px-2 py-1';
          badge.innerHTML = '<i class="fa-solid fa-shield-halved me-1"></i> Digital Signature';
        }
      }

      cardHand.addEventListener('click', () => setMode('hand'));
      cardCert.addEventListener('click', () => setMode('cert'));

      initSignaturePad('swal-sig-canvas', 'swal-sig-clear', 'swal-sig-input');
    },
    preConfirm(){
      let sigData = '';
      if (selectedMode === 'hand') {
        sigData = document.getElementById('swal-sig-input')?.value;
        if (!sigData && window.ecmis && window.ecmis.signaturePad) {
          sigData = window.ecmis.signaturePad.getDataUrl('swal-sig-canvas');
        }
      }
      return { mode: selectedMode, sig: sigData };
    }
  });
}

function sequentialSignDialog(docName, signers){
  const cur = signers[0];
  const rest = signers.slice(1);
  let selectedMode = 'hand';

  const stepList = signers.map((s,i) => `
    <div class="d-flex align-items-start gap-2 mb-2" style="font-size:.82rem">
      <span class="st ${i===0?'st-pending':'st-draft'}" style="min-width:26px;text-align:center">${i+1}</span>
      <div>
        <strong>${s.name}</strong> — ${s.title}
        ${i===0
          ? '<div class="text-muted" style="font-size:.74rem"><i class="fa-solid fa-signature me-1"></i>ลงนามในขั้นตอนนี้</div>'
          : `<div class="text-muted" style="font-size:.74rem"><i class="fa-solid fa-clock me-1"></i>${s.note || 'รอดำเนินการในขั้นตอนถัดไปของผัง'}</div>`}
      </div>
    </div>`).join('');

  return Swal.fire({
    width: 720,
    padding: '1.25rem',
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-pen me-1"></i> ลงนาม',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#16A34A',
    cancelButtonColor: '#7C8CA3',
    reverseButtons: true,
    html: `<div class="text-start" style="font-size:0.9rem;">
      <!-- Title & Header -->
      <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <i class="fa-solid fa-pen-nib text-primary fa-lg"></i>
        <h5 class="m-0 fw-bold" style="color:#0F2A62;">ลงนาม${docName || 'เอกสาร'}</h5>
      </div>

      <!-- Info Banner -->
      <div class="p-3 mb-3 rounded-3 d-flex align-items-center gap-2" style="background:#EFF6FF; border:1px solid #DBEAFE; color:#1E40AF; font-size:0.85rem;">
        <i class="fa-solid fa-user me-1"></i>
        <span>ผู้ลงนามคือ <strong>${cur.name}</strong> (${cur.title}) จึงมีเฉพาะการลงนามและไม่มีปุ่มไม่เห็นชอบ/ตีกลับ</span>
      </div>

      <div class="mb-3" style="background:#f4f8f4;border:1px solid #cfe3d4;border-radius:8px;padding:10px 12px">
        <div class="mb-1" style="font-size:.72rem;font-weight:600;color:var(--ecmis-muted,#6b7280)">
          ลำดับผู้ลงนามของเอกสารนี้ (${signers.length} ลำดับ)</div>
        ${stepList}
      </div>

      <!-- Selection Header -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div>
          <div class="fw-bold" style="font-size:0.9rem; color:#1F2937;">เลือกวิธีลงนาม <span class="text-danger">*</span></div>
          <div class="text-muted" style="font-size:0.78rem;">เลือกได้เพียง 1 วิธีต่อการอนุมัติหนึ่งครั้ง</div>
        </div>
        <div id="swal-sig-mode-badge" class="badge rounded-pill bg-light text-primary border px-2 py-1" style="font-size:0.78rem;">
          <i class="fa-solid fa-check me-1"></i> เซ็นมือ
        </div>
      </div>

      <!-- Method Cards -->
      <div class="row g-3 mb-3">
        <div class="col-6">
          <div id="swal-card-hand" class="p-3 rounded-3 border d-flex gap-3 align-items-start" style="cursor:pointer; background:#F0F6FF; border-color:#2563EB !important; transition:all 0.2s;">
            <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:38px; height:38px; background:#DBEAFE; color:#2563EB;">
              <i class="fa-solid fa-pen fa-lg"></i>
            </div>
            <div>
              <div class="fw-bold text-dark" style="font-size:0.88rem;">1. เซ็นมือ</div>
              <div class="text-muted" style="font-size:0.75rem; line-height:1.35;">ใช้เมาส์หรือทัชแพดลากลายเซ็น <span class="text-primary">(หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ)</span></div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div id="swal-card-cert" class="p-3 rounded-3 border d-flex gap-3 align-items-start" style="cursor:pointer; background:#FFFFFF; border-color:#E5E7EB !important; transition:all 0.2s;">
            <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:38px; height:38px; background:#F1F5F9; color:#64748B;">
              <i class="fa-solid fa-shield-halved fa-lg"></i>
            </div>
            <div>
              <div class="fw-bold text-dark" style="font-size:0.88rem;">2. ลายเซ็น</div>
              <div class="text-muted" style="font-size:0.75rem; line-height:1.35;">หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Area (Option 1) -->
      <div id="swal-box-canvas" class="border rounded-3 p-3 mb-3 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div class="fw-bold" style="font-size:0.9rem; color:#0F172A;">เซ็นชื่อในกรอบด้านล่าง</div>
            <div class="text-muted" style="font-size:0.76rem;">กดเมาส์ค้างแล้วลาก หรือใช้นิ้วบนอุปกรณ์ระบบสัมผัส</div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary border px-2 py-1 rounded-2" id="swal-sig-clear" style="font-size:0.78rem;">
            <i class="fa-solid fa-eraser me-1"></i> ล้างลายเซ็น
          </button>
        </div>
        <div class="sig-canvas-wrapper" style="border: 1px dashed #94A3B8; border-radius: 8px; background:#FAFBFD;">
          <canvas id="swal-sig-canvas" width="640" height="170" style="width:100%; height:170px; touch-action:none;"></canvas>
        </div>
      </div>

      <!-- Certificate Box -->
      <div class="p-3 rounded-3" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.82rem;">
        <div class="d-flex align-items-center gap-2 mb-1">
          <i class="fa-solid fa-circle-check text-success fa-lg"></i>
          <strong>Certificate: PACC-OFFICER-2569-001</strong>
        </div>
        <div>ผู้ถือใบรับรอง: <strong>${cur.name} (${cur.title})</strong></div>
        <div class="mt-1 text-success" style="font-size:0.78rem;">หากผู้ใช้มี Digital Signature จะประทับลงในเอกสารพร้อมภาพลายเซ็นอัตโนมัติ</div>
      </div>
      <input type="hidden" id="swal-sig-input">
    </div>`,
    didOpen() {
      const cardHand = document.getElementById('swal-card-hand');
      const cardCert = document.getElementById('swal-card-cert');
      const boxCanvas = document.getElementById('swal-box-canvas');
      const badge = document.getElementById('swal-sig-mode-badge');

      function setMode(mode) {
        selectedMode = mode;
        if (mode === 'hand') {
          cardHand.style.background = '#F0F6FF';
          cardHand.style.borderColor = '#2563EB';
          cardHand.querySelector('div:first-child').style.background = '#DBEAFE';
          cardHand.querySelector('div:first-child').style.color = '#2563EB';

          cardCert.style.background = '#FFFFFF';
          cardCert.style.borderColor = '#E5E7EB';
          cardCert.querySelector('div:first-child').style.background = '#F1F5F9';
          cardCert.querySelector('div:first-child').style.color = '#64748B';

          boxCanvas.style.display = 'block';
          badge.className = 'badge rounded-pill bg-light text-primary border px-2 py-1';
          badge.innerHTML = '<i class="fa-solid fa-check me-1"></i> เซ็นมือ';

          initSignaturePad('swal-sig-canvas', 'swal-sig-clear', 'swal-sig-input');
        } else {
          cardCert.style.background = '#F0F6FF';
          cardCert.style.borderColor = '#2563EB';
          cardCert.querySelector('div:first-child').style.background = '#DBEAFE';
          cardCert.querySelector('div:first-child').style.color = '#2563EB';

          cardHand.style.background = '#FFFFFF';
          cardHand.style.borderColor = '#E5E7EB';
          cardHand.querySelector('div:first-child').style.background = '#F1F5F9';
          cardHand.querySelector('div:first-child').style.color = '#64748B';

          boxCanvas.style.display = 'none';
          badge.className = 'badge rounded-pill bg-light text-primary border px-2 py-1';
          badge.innerHTML = '<i class="fa-solid fa-shield-halved me-1"></i> Digital Signature';
        }
      }

      cardHand.addEventListener('click', () => setMode('hand'));
      cardCert.addEventListener('click', () => setMode('cert'));

      initSignaturePad('swal-sig-canvas', 'swal-sig-clear', 'swal-sig-input');
    },
    preConfirm(){
      let sigData = '';
      if (selectedMode === 'hand') {
        sigData = document.getElementById('swal-sig-input')?.value;
        if (!sigData && window.ecmis && window.ecmis.signaturePad) {
          sigData = window.ecmis.signaturePad.getDataUrl('swal-sig-canvas');
        }
      }
      return { mode: selectedMode, signer: cur, next: rest[0] || null, sig: sigData };
    }
  });
}

const COLOR_MODES = ['light', 'dark', 'contrast'];
const COLOR_MODE_META = {
  light:    { icon:'fa-sun',                text:'ปกติ',           toast:'เปลี่ยนเป็นโหมดปกติ (Light Mode)',        nextTitle:'สลับเป็นโหมดมืด' },
  dark:     { icon:'fa-moon',                text:'โหมดมืด',        toast:'เปลี่ยนเป็นโหมดมืด (Dark Mode)',          nextTitle:'สลับเป็นโหมดคอนทราสต์สูง' },
  contrast: { icon:'fa-circle-half-stroke',  text:'คอนทราสต์สูง',   toast:'เปลี่ยนเป็นโหมดคอนทราสต์สูง (High Contrast)', nextTitle:'สลับเป็นโหมดปกติ' }
};

function applyColorMode(mode) {
  document.body.classList.remove('dark-mode', 'high-contrast');
  if (mode === 'dark') document.body.classList.add('dark-mode');
  else if (mode === 'contrast') document.body.classList.add('high-contrast');

  const btn = document.getElementById('colorModeToggle');
  if (btn) {
    const meta = COLOR_MODE_META[mode];
    const icon = btn.querySelector('i');
    const label = btn.querySelector('span');
    if (icon) icon.className = `fa-solid ${meta.icon}`;
    if (label) label.textContent = meta.text;
    btn.title = meta.nextTitle;
  }
}

function toggleColorMode() {
  const current = localStorage.getItem('ecmis_color_mode') || 'light';
  const next = COLOR_MODES[(COLOR_MODES.indexOf(current) + 1) % COLOR_MODES.length];
  localStorage.setItem('ecmis_color_mode', next);
  applyColorMode(next);
  toastOk(COLOR_MODE_META[next].toast);
}

function toggleSidebarCollapse() {
  const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('ecmis_sidebar_collapsed', isCollapsed);
}

let fontStep = 0;
function changeFont(dir) {
  if (dir === 0) fontStep = 0;
  else fontStep = Math.max(-2, Math.min(3, fontStep + dir));
  const baseSize = 14.5 + fontStep * 2;
  document.documentElement.style.fontSize = baseSize + 'px';
  localStorage.setItem('ecmis_font_step', fontStep);
  toastOk(`ปรับขนาดตัวอักษรเป็น: ${dir > 0 ? 'ใหญ่ขึ้น' : dir < 0 ? 'เล็กลง' : 'ปกติ'}`);
}

function initA11yAndPref() {
  if (typeof document === 'undefined') return;

  const fontStepVal = parseInt(localStorage.getItem('ecmis_font_step') || '0', 10);
  const baseSize = 14.5 + fontStepVal * 2;
  document.documentElement.style.fontSize = baseSize + 'px';

  let colorMode = localStorage.getItem('ecmis_color_mode');
  if (colorMode === null) {

    if (localStorage.getItem('ecmis_high_contrast') === 'true') colorMode = 'contrast';
    else if (localStorage.getItem('ecmis_dark_mode') === 'true') colorMode = 'dark';
    else if (localStorage.getItem('ecmis_dark_mode') === null &&
             window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) colorMode = 'dark';
    else colorMode = 'light';
    localStorage.setItem('ecmis_color_mode', colorMode);
  }
  applyColorMode(colorMode);

  const isCollapsed = localStorage.getItem('ecmis_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    document.body.classList.add('sidebar-collapsed');
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
}

function initCommandPalette() {
  if (typeof document === 'undefined') return;

  const html = `
  <div class="cmd-palette-backdrop no-print" id="cmdPalette">
    <div class="cmd-palette-box">
      <div class="cmd-palette-search-wrapper">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" class="cmd-palette-input" id="cmdPaletteInput" placeholder="พิมพ์ชื่อเมนู หรือ เลขสำนวนคดี (เช่น 1547/2568)..." autocomplete="off">
      </div>
      <div class="cmd-palette-results" id="cmdPaletteResults"></div>
      <div class="cmd-palette-hint">
        <span><kbd>↑↓</kbd> เลือก &nbsp; <kbd>Enter</kbd> เปิดหน้าจอ &nbsp; <kbd>Esc</kbd> ปิด</span>
        <span>Command Palette <kbd>Ctrl + K</kbd></span>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  const backdrop = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdPaletteInput');
  const results = document.getElementById('cmdPaletteResults');

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      backdrop.classList.toggle('show');
      if (backdrop.classList.contains('show')) {
        input.value = '';
        renderResults('');
        setTimeout(() => input.focus(), 100);
      }
    }
    if (e.key === 'Escape' && backdrop.classList.contains('show')) {
      backdrop.classList.remove('show');
    }
  });

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.classList.remove('show');
  });

  input.addEventListener('input', e => {
    renderResults(e.target.value);
  });

  input.addEventListener('keydown', e => {
    const items = results.querySelectorAll('.cmd-palette-item');
    if (!items.length) return;
    let activeIdx = Array.from(items).findIndex(el => el.classList.contains('active'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIdx !== -1) items[activeIdx].classList.remove('active');
      activeIdx = (activeIdx + 1) % items.length;
      items[activeIdx].classList.add('active');
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIdx !== -1) items[activeIdx].classList.remove('active');
      activeIdx = (activeIdx - 1 + items.length) % items.length;
      items[activeIdx].classList.add('active');
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx !== -1) {
        items[activeIdx].click();
      } else {
        items[0].click();
      }
    }
  });

  function renderResults(q) {
    results.innerHTML = '';
    const query = q.toLowerCase().trim();

    /* ใช้เมนูชุดเดียวกับ sidebar (กรองตามสิทธิ์บทบาทปัจจุบันแล้ว) แทนรายการ
       ตายตัว เพื่อไม่ให้ Command Palette พาไปหน้าที่เมนูข้าง ๆ ซ่อนไว้ */
    const paletteRole = currentRole();
    const menus = visibleNavFor(paletteRole)
      .filter(n => n.href)
      .map(n => {
        const lbl = navLabel(n, paletteRole);
        return { label: n.step ? `${lbl} (ขั้นตอน ${n.step})` : lbl, href: navHref(n, paletteRole), icon: n.icon, cat: 'Menu' };
      });

    const matchedMenus = menus.filter(m => m.label.toLowerCase().includes(query));
    const matchedCases = CASES.filter(c =>
      c.id.toLowerCase().includes(query) ||
      c.subject.toLowerCase().includes(query)
    );

    let html = '';

    if (matchedMenus.length) {
      html += `<div style="font-size:0.75rem;font-weight:600;color:var(--ecmis-muted);padding:6px 12px">เมนูการนำทาง</div>`;
      matchedMenus.forEach((m, idx) => {
        html += `
        <a class="cmd-palette-item ${idx===0&&!query?'active':''}" href="${m.href}">
          <i class="fa-solid ${m.icon}"></i>
          <span>${m.label}</span>
          <span class="cmd-palette-item-meta">${m.cat}</span>
        </a>`;
      });
    }

    if (matchedCases.length) {
      html += `<div style="font-size:0.75rem;font-weight:600;color:var(--ecmis-muted);padding:12px 12px 6px">สำนวนคดี</div>`;
      matchedCases.forEach((c, idx) => {
        const activeClass = !matchedMenus.length && idx === 0 ? 'active' : '';
        const targetPage = pageForCaseByStatus(c);
        html += `
        <a class="cmd-palette-item ${activeClass}" href="${targetPage}?case=${encodeURIComponent(c.id)}">
          <i class="fa-solid fa-folder-closed"></i>
          <span><strong>เลขสำนวน: ${c.id}</strong> — ${c.subject.substring(0, 50)}...</span>
          <span class="cmd-palette-item-meta">สถานะ: ${STATUS[c.status]?.label || c.status}</span>
        </a>`;
      });
    }

    if (!matchedMenus.length && !matchedCases.length) {
      html = `<div style="padding:20px;text-align:center;color:var(--ecmis-muted);font-size:0.9rem">
        <i class="fa-solid fa-circle-question fa-lg mb-2"></i><br>ไม่พบรายการที่ตรงกับคำค้นหา
      </div>`;
    }

    results.innerHTML = html;
  }
}

function initSmartCombobox(selectEl) {
  if (!selectEl || selectEl.nextElementSibling?.classList.contains('smart-combo-container')) return;

  const container = document.createElement('div');
  container.className = 'smart-combo-container';

  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'smart-combo-toggle';
  toggleBtn.setAttribute('tabindex', '0');
  toggleBtn.setAttribute('role', 'combobox');
  toggleBtn.setAttribute('aria-expanded', 'false');

  const toggleContent = document.createElement('div');
  toggleContent.className = 'smart-combo-toggle-text text-truncate';
  
  const chevron = document.createElement('i');
  chevron.className = 'fa-solid fa-chevron-down smart-combo-chevron';
  
  toggleBtn.appendChild(toggleContent);
  toggleBtn.appendChild(chevron);

  const dropdown = document.createElement('div');
  dropdown.className = 'smart-combo-dropdown';

  const searchBox = document.createElement('div');
  searchBox.className = 'smart-combo-search';
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group input-group-sm';
  inputGroup.innerHTML = `
    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
    <input type="text" class="form-control" placeholder="ค้นหารายการ..." autocomplete="off">
  `;
  searchBox.appendChild(inputGroup);
  const searchInput = inputGroup.querySelector('input');

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'smart-combo-items';

  let currentHighlightedIndex = -1;
  let currentFilteredList = [];

  function getOptions() {
    return Array.from(selectEl.options).map(opt => {
      let title = opt.textContent.trim();
      let sub = opt.dataset.sub || opt.dataset.title || opt.dataset.desc || '';
      if (!sub && (title.includes(' — ') || title.includes(' - '))) {
        const parts = title.split(/\s+[—-]\s+/);
        if (parts.length >= 2) {
          title = parts[0];
          sub = parts.slice(1).join(' — ');
        }
      }
      return {
        value: opt.value,
        text: opt.textContent.trim(),
        title: title,
        sub: sub,
        selected: opt.selected || opt.value === selectEl.value,
        disabled: opt.disabled
      };
    });
  }

  function updateToggleDisplay() {
    const opts = getOptions();
    const curVal = selectEl.value;
    const matched = opts.find(o => o.value === curVal) || opts.find(o => o.selected) || opts[0];
    if (!matched || !matched.value) {
      toggleContent.innerHTML = `<span class="text-muted">${selectEl.getAttribute('placeholder') || '— เลือกรายการ —'}</span>`;
    } else {
      toggleContent.innerHTML = `
        <span class="smart-combo-toggle-title fw-medium">${matched.title}</span>
        ${matched.sub ? `<span class="text-muted ms-1 small">(${matched.sub})</span>` : ''}
      `;
    }
  }

  function renderItems(filterText) {
    itemsContainer.innerHTML = '';
    const q = (filterText || '').trim().toLowerCase();
    const opts = getOptions().filter(o => o.value !== "");
    currentFilteredList = opts.filter(o => 
      !q || o.text.toLowerCase().includes(q) || o.title.toLowerCase().includes(q) || o.sub.toLowerCase().includes(q)
    );

    currentHighlightedIndex = -1;

    if (!currentFilteredList.length) {
      itemsContainer.innerHTML = `<div class="text-muted text-center py-3" style="font-size:0.82rem"><i class="fa-solid fa-circle-question d-block mb-1 opacity-50"></i>ไม่พบข้อมูลที่ค้นหา</div>`;
      return;
    }

    currentFilteredList.forEach((o, idx) => {
      const item = document.createElement('div');
      item.className = 'smart-combo-item';
      const isCur = selectEl.value === o.value;
      if (isCur) {
        item.classList.add('active');
        currentHighlightedIndex = idx;
      }
      item.dataset.index = idx;
      item.innerHTML = `
        <div class="smart-combo-item-content">
          <div class="smart-combo-item-title">${o.title}</div>
          ${o.sub ? `<div class="smart-combo-item-sub">${o.sub}</div>` : ''}
        </div>
        ${isCur ? `<i class="fa-solid fa-check text-primary ms-2"></i>` : ''}
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption(o);
      });
      itemsContainer.appendChild(item);
    });
  }

  function selectOption(opt) {
    if (!opt) return;
    selectEl.value = opt.value;
    updateToggleDisplay();
    closeDropdown();
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    selectEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function openDropdown() {
    document.querySelectorAll('.smart-combo-dropdown').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.smart-combo-toggle').forEach(t => t.classList.remove('is-open'));
    dropdown.style.display = 'flex';
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    searchInput.value = '';
    renderItems('');
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  dropdown.appendChild(searchBox);
  dropdown.appendChild(itemsContainer);
  container.appendChild(toggleBtn);
  container.appendChild(dropdown);

  selectEl.style.display = 'none';
  selectEl.parentNode.insertBefore(container, selectEl.nextSibling);
  updateToggleDisplay();

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === 'flex';
    if (isOpen) closeDropdown();
    else openDropdown();
  });

  toggleBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      openDropdown();
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
  });
  searchInput.addEventListener('click', e => e.stopPropagation());

  searchInput.addEventListener('keydown', (e) => {
    const items = itemsContainer.querySelectorAll('.smart-combo-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentHighlightedIndex = (currentHighlightedIndex + 1) % items.length;
      highlightItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentHighlightedIndex = (currentHighlightedIndex - 1 + items.length) % items.length;
      highlightItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentHighlightedIndex >= 0 && currentFilteredList[currentHighlightedIndex]) {
        selectOption(currentFilteredList[currentHighlightedIndex]);
      } else if (currentFilteredList.length === 1) {
        selectOption(currentFilteredList[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      toggleBtn.focus();
    }
  });

  function highlightItem(items) {
    items.forEach((it, idx) => {
      it.classList.toggle('keyboard-focus', idx === currentHighlightedIndex);
      if (idx === currentHighlightedIndex) {
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  selectEl.addEventListener('change', updateToggleDisplay);

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });

  container.smartComboRefresh = () => {
    updateToggleDisplay();
    renderItems(searchInput.value);
  };
}

function initMultiSelectCombo(inputEl, candidates, opts) {
  if (!inputEl || inputEl.nextElementSibling?.classList.contains('smart-combo-container')) return;
  opts = opts || {};
  const placeholder = opts.placeholder || '— เลือกผู้ชี้แจง (เลือกได้มากกว่า 1 คน) —';
  const searchPlaceholder = opts.searchPlaceholder || 'ค้นหาหรือพิมพ์ชื่อผู้ชี้แจงเพิ่ม แล้วกด Enter...';
  const selectAll = !!opts.selectAll;

  let selected = inputEl.value.split(',').map(s => s.trim()).filter(Boolean);

  const container = document.createElement('div');
  container.className = 'smart-combo-container smart-combo-multi';

  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'form-control smart-combo-toggle';
  toggleBtn.style.cursor = 'pointer';

  const dropdown = document.createElement('div');
  dropdown.className = 'smart-combo-dropdown';

  const searchBox = document.createElement('div');
  searchBox.className = 'smart-combo-search';
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group input-group-sm';
  inputGroup.innerHTML = `
    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
    <input type="text" class="form-control" placeholder="${searchPlaceholder}" autocomplete="off">
  `;
  searchBox.appendChild(inputGroup);
  const searchInput = inputGroup.querySelector('input');

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'smart-combo-items';

  function commit() {
    inputEl.value = selected.join(', ');
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    renderToggle();
  }

  function renderToggle() {
    toggleBtn.innerHTML = '';
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'd-flex flex-wrap align-items-center gap-1 flex-grow-1';

    if (!selected.length) {
      const ph = document.createElement('span');
      ph.className = 'text-muted';
      ph.textContent = placeholder;
      tagsWrap.appendChild(ph);
    } else {
      selected.forEach(name => {
        const tag = document.createElement('span');
        tag.className = 'smart-combo-tag';
        tag.textContent = name;
        const rm = document.createElement('i');
        rm.className = 'fa-solid fa-xmark';
        rm.title = 'เอาออก';
        rm.addEventListener('click', (e) => {
          e.stopPropagation();
          selected = selected.filter(s => s !== name);
          commit();
          renderItems(searchInput.value);
        });
        tag.appendChild(rm);
        tagsWrap.appendChild(tag);
      });
    }

    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-down smart-combo-chevron ms-2';
    toggleBtn.appendChild(tagsWrap);
    toggleBtn.appendChild(chevron);
  }

  function renderItems(filterText) {
    itemsContainer.innerHTML = '';
    const q = filterText.trim().toLowerCase();
    const filtered = candidates.filter(c => c.toLowerCase().includes(q));

    /* "เลือกทั้งหมด" ผูกกับรายการทั้งหมด ไม่ใช่แค่ผลกรอง — ซ่อนขณะกำลังพิมพ์ค้นหา
       เพื่อไม่ให้กดพลาดว่ากำลัง "เลือกทั้งหมดของผลกรอง" */
    if (selectAll && !q) {
      const allSelected = candidates.length > 0 && candidates.every(c => selected.includes(c));
      const allItem = document.createElement('div');
      allItem.className = 'smart-combo-item smart-combo-item-selectall';
      allItem.innerHTML = `<i class="fa-${allSelected ? 'solid fa-square-check' : 'regular fa-square'} me-2"></i><strong>${allSelected ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}</strong>`;
      allItem.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = allSelected
          ? selected.filter(s => !candidates.includes(s))
          : [...new Set([...selected, ...candidates])];
        commit();
        renderItems(searchInput.value);
      });
      itemsContainer.appendChild(allItem);
    }

    filtered.forEach(name => {
      const item = document.createElement('div');
      item.className = 'smart-combo-item';
      const isSel = selected.includes(name);
      if (isSel) item.classList.add('active');
      item.innerHTML = `<i class="fa-${isSel ? 'solid fa-square-check' : 'regular fa-square'} me-2"></i>${name}`;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = isSel ? selected.filter(s => s !== name) : [...selected, name];
        commit();
        renderItems(searchInput.value);
      });
      itemsContainer.appendChild(item);
    });

    const q2 = filterText.trim();
    if (q2 && !candidates.some(c => c.toLowerCase() === q2.toLowerCase()) && !selected.includes(q2)) {
      const addItem = document.createElement('div');
      addItem.className = 'smart-combo-item smart-combo-item-add';
      addItem.innerHTML = `<i class="fa-solid fa-plus me-2"></i>เพิ่ม "${q2}"`;
      addItem.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = [...selected, q2];
        commit();
        searchInput.value = '';
        renderItems('');
      });
      itemsContainer.appendChild(addItem);
    }

    if (!filtered.length && !q2) {
      itemsContainer.innerHTML = `<div class="text-muted text-center py-2" style="font-size:0.8rem">ไม่พบรายการ — พิมพ์เพื่อเพิ่มชื่อใหม่</div>`;
    }
  }

  dropdown.appendChild(searchBox);
  dropdown.appendChild(itemsContainer);
  container.appendChild(toggleBtn);
  container.appendChild(dropdown);

  inputEl.style.display = 'none';
  inputEl.parentNode.insertBefore(container, inputEl.nextSibling);

  renderToggle();

  function openDropdown() {
    document.querySelectorAll('.smart-combo-dropdown').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.smart-combo-toggle').forEach(t => t.classList.remove('is-open'));
    dropdown.style.display = 'flex';
    toggleBtn.classList.add('is-open');
    searchInput.value = '';
    renderItems('');
    setTimeout(() => searchInput.focus(), 100);
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    toggleBtn.classList.remove('is-open');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.style.display === 'flex';
    if (open) closeDropdown();
    else openDropdown();
  });

  searchInput.addEventListener('input', e => renderItems(e.target.value));
  searchInput.addEventListener('click', e => e.stopPropagation());
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const val = searchInput.value.trim();
    if (val && !selected.includes(val)) {
      selected = [...selected, val];
      commit();
      searchInput.value = '';
      renderItems('');
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  });
}

function initRealTimeValidation(formEl) {
  if (!formEl) return;
  const inputs = formEl.querySelectorAll('input, select, textarea');
  inputs.forEach(el => {
    el.addEventListener('input', () => validateField(el));
    el.addEventListener('change', () => validateField(el));
  });

  function validateField(el) {
    if (el.hasAttribute('required') && !el.value.trim()) {
      el.classList.add('is-invalid-ecmis');
      el.classList.remove('is-valid-ecmis');
      const err = el.parentNode.querySelector('.val-msg');
      if (err) {
        err.classList.add('show');
        err.classList.add('val-err');
        err.textContent = 'กรุณากรอกข้อมูลในช่องนี้';
      }
    } else {
      el.classList.remove('is-invalid-ecmis');
      el.classList.add('is-valid-ecmis');
      const err = el.parentNode.querySelector('.val-msg');
      if (err) {
        err.classList.remove('show');
      }
    }
  }
}

let speechRecognitions = {};

function toggleVoiceRecognition(textareaId) {
  if (typeof window === 'undefined') return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toastWarn('เบราว์เซอร์ของคุณไม่รองรับการพิมพ์ด้วยเสียง (Speech Recognition)');
    return;
  }

  const ta = document.getElementById(textareaId);
  const btn = document.getElementById('voiceBtn-' + textareaId);
  const indicator = document.getElementById('voiceIndicator-' + textareaId);
  if (!ta) return;

  if (ta.disabled || ta.readOnly || ta.hasAttribute('disabled') || ta.hasAttribute('readonly') || ta.hasAttribute('data-no-voice')) {
    toastWarn('ช่องนี้ไม่สามารถกรอกข้อมูลหรือพิมพ์ด้วยเสียงได้');
    return;
  }

  if (speechRecognitions[textareaId]) {
    speechRecognitions[textareaId].stop();
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'th-TH';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    speechRecognitions[textareaId] = recognition;
    if (btn) {
      btn.classList.add('btn-danger', 'pulse');
      btn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    }
    if (indicator) indicator.style.display = 'inline-flex';
    toastOk('เริ่มต้นพิมพ์ด้วยเสียง... พูดได้เลยครับ/ค่ะ');
  };

  recognition.onerror = (e) => {
    console.error('Speech recognition error:', e.error);
    toastWarn('การพิมพ์ด้วยเสียงขัดข้อง: ' + e.error);
    cleanupVoice(textareaId);
  };

  recognition.onend = () => {
    cleanupVoice(textareaId);
  };

  recognition.onresult = (event) => {
    if (ta.disabled || ta.readOnly || ta.hasAttribute('disabled') || ta.hasAttribute('readonly')) return;
    const text = event.results[0][0].transcript;
    if (text) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const currentText = ta.value;
      ta.value = currentText.substring(0, start) + text + currentText.substring(end);
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.dispatchEvent(new Event('input'));
      ta.dispatchEvent(new Event('change'));
      toastOk('เพิ่มข้อความจากการพูดแล้ว');
    }
  };

  recognition.start();
}

function cleanupVoice(textareaId) {
  const btn = document.getElementById('voiceBtn-' + textareaId);
  const indicator = document.getElementById('voiceIndicator-' + textareaId);
  if (btn) {
    btn.classList.remove('btn-danger', 'pulse');
    btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  }
  if (indicator) indicator.style.display = 'none';
  delete speechRecognitions[textareaId];
}

function initVoiceInput() {
  if (typeof document === 'undefined') return;
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(ta => {
    if (ta.hasAttribute('data-no-voice')) return;
    if (ta.id && !document.getElementById('voiceBtn-' + ta.id)) {
      const buttonHtml = `
        <button type="button" class="btn btn-sm btn-outline-secondary voice-btn ms-2" id="voiceBtn-${ta.id}" title="พิมพ์ด้วยเสียง" style="border-radius: 50%; width: 28px; height: 28px; padding:0; display: inline-flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-microphone"></i>
        </button>
        <span class="voice-indicator ms-2" id="voiceIndicator-${ta.id}" style="font-size:0.75rem; color: var(--ecmis-red); display:none;">
          <span class="voice-dot"></span>กำลังฟัง...
        </span>`;

      const counter = document.getElementById(ta.id + 'Counter');
      if (counter) {
        counter.parentNode.insertBefore(document.createRange().createContextualFragment(buttonHtml), counter);
      } else {
        const label = ta.previousElementSibling;
        if (label && label.classList.contains('form-label')) {
          label.appendChild(document.createRange().createContextualFragment(buttonHtml));
        }
      }

      const btn = document.getElementById('voiceBtn-' + ta.id);
      const indicator = document.getElementById('voiceIndicator-' + ta.id);
      if (btn) {
        btn.addEventListener('click', () => { toggleVoiceRecognition(ta.id); });
      }

      function syncVoiceBtnState() {
        const isOff = ta.disabled || ta.readOnly || ta.hasAttribute('disabled') || ta.hasAttribute('readonly') || ta.hasAttribute('data-no-voice');
        if (btn) {
          btn.disabled = isOff;
          btn.style.display = isOff ? 'none' : 'inline-flex';
          if (indicator && isOff) indicator.style.display = 'none';
          if (isOff && speechRecognitions[ta.id]) {
            speechRecognitions[ta.id].stop();
            cleanupVoice(ta.id);
          }
        }
      }

      syncVoiceBtnState();
      ta.addEventListener('change', syncVoiceBtnState);
      ta.addEventListener('input', syncVoiceBtnState);
      setInterval(syncVoiceBtnState, 300);
    }
  });
}

window.ecmis = window.ecmis || {};
window.ecmis.signaturePad = (function () {
    const pads = new Map();

    function point(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const existing = pads.get(canvasId);
        if (existing && existing.canvas === canvas) return;
        pads.delete(canvasId);

        const context = canvas.getContext("2d");
        const state = { canvas: canvas, drawing: false, hasInk: false };
        pads.set(canvasId, state);

        context.strokeStyle = "#173f91";
        context.lineWidth = 3;
        context.lineCap = "round";
        context.lineJoin = "round";

        canvas.addEventListener("pointerdown", function (event) {
            event.preventDefault();
            state.drawing = true;
            canvas.setPointerCapture(event.pointerId);
            const pos = point(canvas, event);
            context.beginPath();
            context.moveTo(pos.x, pos.y);
        });

        canvas.addEventListener("pointermove", function (event) {
            if (!state.drawing) return;
            event.preventDefault();
            const pos = point(canvas, event);
            context.lineTo(pos.x, pos.y);
            context.stroke();
            state.hasInk = true;
        });

        function stop(event) {
            if (!state.drawing) return;
            state.drawing = false;
            try { canvas.releasePointerCapture(event.pointerId); } catch (_) { }
        }

        canvas.addEventListener("pointerup", stop);
        canvas.addEventListener("pointercancel", stop);
        canvas.addEventListener("pointerleave", stop);
    }

    function clear(canvasId) {
        const canvas = document.getElementById(canvasId);
        const state = pads.get(canvasId);
        if (!canvas || !state) return;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        state.hasInk = false;
    }

    function getDataUrl(canvasId) {
        const canvas = document.getElementById(canvasId);
        const state = pads.get(canvasId);
        return canvas && state && state.hasInk ? canvas.toDataURL("image/png") : "";
    }

    return { init, clear, getDataUrl };
})();

function initSignaturePad(canvasId, clearBtnId, inputId) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);
  const input = document.getElementById(inputId);
  if (!canvas) return;

  if (window.ecmis && window.ecmis.signaturePad) {
    window.ecmis.signaturePad.init(canvasId);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (window.ecmis && window.ecmis.signaturePad) {
        window.ecmis.signaturePad.clear(canvasId);
      }
      if (input) input.value = '';
    });
  }

  if (canvas && input) {
    const syncInput = () => {
      if (window.ecmis && window.ecmis.signaturePad) {
        input.value = window.ecmis.signaturePad.getDataUrl(canvasId);
      }
    };
    canvas.addEventListener('pointerup', syncInput);
    canvas.addEventListener('pointerleave', syncInput);
    canvas.addEventListener('pointercancel', syncInput);
  }
}

function initAutoSave(formId, draftKey, warningText) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Restore draft if exists
  const draft = sessionStorage.getItem(draftKey);
  if (draft) {
    try {
      const data = JSON.parse(draft);
      Object.keys(data).forEach(key => {
        const el = form.querySelector(`[name="${key}"], #${key}`);
        if (el) {
          if (el.type === 'checkbox') el.checked = data[key];
          else if (el.type === 'radio') {
            const rad = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
            if (rad) rad.checked = true;
          }
          else el.value = data[key];
          el.dispatchEvent(new Event('input'));
        }
      });
      toastOk('ดึงร่างข้อมูลที่บันทึกไว้อัตโนมัติแล้ว');
    } catch(e){}
  }

  // Periodic Auto-save
  let modified = false;
  form.addEventListener('input', () => { modified = true; });
  form.addEventListener('change', () => { modified = true; });

  setInterval(() => {
    if (!modified) return;
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach(el => {
      const name = el.name || el.id;
      if (name) {
        if (el.type === 'checkbox') data[name] = el.checked;
        else if (el.type === 'radio') {
          if (el.checked) data[name] = el.value;
        }
        else data[name] = el.value;
      }
    });
    sessionStorage.setItem(draftKey, JSON.stringify(data));
    modified = false;
    const time = new Date().toLocaleTimeString('th-TH');
    toastOk(`บันทึกร่างข้อมูลอัตโนมัติแล้วเมื่อ ${time}`);
  }, 10000);

  // Unsaved Warning before navigating away
  window.addEventListener('beforeunload', (e) => {
    if (modified) {
      e.preventDefault();
      e.returnValue = warningText || 'คุณยังมีข้อมูลที่ไม่ได้บันทึก';
      return e.returnValue;
    }
  });

  // Attach submit clear
  form.addEventListener('submit', () => {
    modified = false;
    sessionStorage.removeItem(draftKey);
  });
}

function initCharCounterAndCopy() {
  if (typeof document === 'undefined') return;
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(ta => {
    if (ta.hasAttribute('readonly') || ta.hasAttribute('disabled')) return;
    if (ta.nextElementSibling?.classList.contains('textarea-helper-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'textarea-helper-bar d-flex justify-content-between align-items-center mt-1 px-1';
    bar.style.fontSize = '0.72rem';
    bar.style.color = 'var(--ecmis-muted)';

    const counterSpan = document.createElement('span');
    counterSpan.className = 'char-counter';
    const maxLength = ta.getAttribute('maxlength') || '500';
    counterSpan.textContent = `ตัวอักษร: ${ta.value.length}/${maxLength}`;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn-xs btn-outline-secondary py-0 px-2';
    copyBtn.style.fontSize = '0.7rem';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy me-1"></i>คัดลอก';
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(ta.value).then(() => {
        toastOk('คัดลอกข้อความลงคลิปบอร์ดแล้ว');
      });
    });

    bar.appendChild(counterSpan);
    bar.appendChild(copyBtn);

    ta.parentNode.insertBefore(bar, ta.nextSibling);

    ta.addEventListener('input', () => {
      counterSpan.textContent = `ตัวอักษร: ${ta.value.length}/${maxLength}`;
    });
  });
}

/* ---------- ช่องข้อความยืดหยุ่น (rich-text) สำหรับกรอก/วางข้อความยาว เช่น "พฤติการณ์คดี" ----------
   ต่างจาก <textarea> ตรงที่รองรับตัวหนา + ย่อหน้าไม่จำกัดความยาว, และ sanitize เนื้อหาที่วางมา
   จาก Word/เว็บอื่น เหลือเฉพาะ b/strong/i/em/u/p/br/div ตัดสไตล์/ฟอนต์แปลกปลอมทิ้งหมด */
function sanitizeRichPaste(html) {
  const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'P', 'BR', 'DIV']);
  const srcDoc = new DOMParser().parseFromString(html, 'text/html');
  function walk(srcNode) {
    const frag = document.createDocumentFragment();
    srcNode.childNodes.forEach(child => {
      if (child.nodeType === 3) { frag.appendChild(document.createTextNode(child.textContent)); return; }
      if (child.nodeType !== 1) return;
      const inner = walk(child);
      if (ALLOWED.has(child.tagName)) {
        const el = document.createElement(child.tagName);
        el.appendChild(inner);
        frag.appendChild(el);
      } else {
        frag.appendChild(inner);
      }
    });
    return frag;
  }
  const out = document.createElement('div');
  out.appendChild(walk(srcDoc.body));
  return out.innerHTML;
}
function plainTextToHtml(text) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return text.split(/\n{2,}/).map(para =>
    `<p>${para.split('\n').map(esc).join('<br>')}</p>`).join('') || '<p></p>';
}
function initRichTextBox(boxEl, opts) {
  if (!boxEl) return;
  const toolbarEl = (opts && opts.toolbar) ? document.getElementById(opts.toolbar) : boxEl.previousElementSibling;
  boxEl.setAttribute('contenteditable', 'true');

  boxEl.addEventListener('paste', e => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const insertHtml = html ? sanitizeRichPaste(html) : plainTextToHtml(text);
    document.execCommand('insertHTML', false, insertHtml);
    if (opts && opts.onChange) opts.onChange();
  });

  if (toolbarEl) {
    toolbarEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-format]');
      if (!btn) return;
      boxEl.focus();
      document.execCommand(btn.dataset.format);
      if (opts && opts.onChange) opts.onChange();
    });
  }

  boxEl.addEventListener('input', () => { if (opts && opts.onChange) opts.onChange(); });

  if (opts && opts.initialHtml) boxEl.innerHTML = opts.initialHtml;
}

function initAuditTrail(containerId, events) {

  const el = document.getElementById(containerId);
  if (!el) return;
  if (!events || !events.length) {
    el.innerHTML = `<div class="text-muted text-center py-3" style="font-size:.82rem">
      <i class="fa-solid fa-clock-rotate-left me-1"></i>ยังไม่มีประวัติการดำเนินการ</div>`;
    return;
  }
  el.innerHTML = `<ul class="list-unstyled mb-0">` + events.map((e, i) => `
    <li class="d-flex gap-3 py-2 ${i < events.length-1 ? 'border-bottom' : ''}">
      <div style="flex:0 0 32px;height:32px;border-radius:50%;background:var(--ecmis-navy);
           color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;margin-top:2px">
        ${(e.actor||'?')[0]}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.85rem"><strong>${e.actor||'ระบบ'}</strong>
          <span class="text-muted" style="font-size:.75rem"> · ${e.role||''}</span>
        </div>
        <div style="font-size:.82rem;margin:.1rem 0">${e.action||''}</div>
        ${e.detail ? `<div style="font-size:.76rem;color:var(--ecmis-muted)">${e.detail}</div>` : ''}
        <div style="font-size:.72rem;color:var(--ecmis-muted);margin-top:.15rem">
          <i class="fa-solid fa-clock me-1"></i>${e.date||''}
        </div>
      </div>
    </li>`).join('') + `</ul>`;
}

/* ---- 5.4 Checklist with Gatekeeper ---- */
function initChecklistGatekeeper(checklistId, nextBtnId) {
  const checklist = document.getElementById(checklistId);
  const nextBtn   = document.getElementById(nextBtnId);
  if (!checklist || !nextBtn) return;

  function updateGate() {
    const boxes  = checklist.querySelectorAll('input[type="checkbox"]');
    const allDone = Array.from(boxes).every(cb => cb.checked);
    nextBtn.disabled = !allDone;
    nextBtn.title = allDone ? '' : 'กรุณาติ๊กรายการตรวจสอบให้ครบก่อน';
    if (allDone) nextBtn.classList.add('btn-save-pulse');
    else nextBtn.classList.remove('btn-save-pulse');
  }

  checklist.addEventListener('change', updateGate);
  updateGate();
}

function initBulkActions(tableId, toolbarId, onAction) {
  const table   = document.getElementById(tableId);
  const toolbar = document.getElementById(toolbarId);
  if (!table || !toolbar) return;

  function getChecked() {
    return Array.from(table.querySelectorAll('tbody input[type="checkbox"]:checked'));
  }
  function refreshToolbar() {
    const checked = getChecked();
    toolbar.classList.toggle('show', checked.length > 0);
    const countEl = toolbar.querySelector('.bulk-count');
    if (countEl) countEl.textContent = `เลือก ${checked.length} รายการ`;
  }

  table.addEventListener('change', e => {
    if (e.target.type === 'checkbox') refreshToolbar();
  });
  const selectAll = table.querySelector('thead input[type="checkbox"]');
  if (selectAll) {
    selectAll.addEventListener('change', () => {
      table.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => {
        cb.checked = selectAll.checked;
      });
      refreshToolbar();
    });
  }
  toolbar.querySelectorAll('[data-bulk-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.bulkAction;
      const rows   = getChecked().map(cb => cb.closest('tr'));
      if (typeof onAction === 'function') onAction(action, rows);
    });
  });
}

function initDragDropUpload(zoneId, fileListId, allowedTypes, maxMB) {
  const zone     = document.getElementById(zoneId);
  const fileList = document.getElementById(fileListId);
  if (!zone || !fileList) return;
  const MB = (maxMB || 10) * 1024 * 1024;

  function renderFile(file) {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 p-2 border rounded mb-2';
    row.style.fontSize = '0.82rem';
    row.innerHTML = `
      <i class="fa-solid fa-file-lines text-muted"></i>
      <span class="flex-grow-1">${file.name} <span class="text-muted">(${(file.size/1024).toFixed(0)} KB)</span></span>
      <div class="upload-progress-bar flex-grow-1" style="max-width:120px">
        <div class="upload-progress-fill" style="width:0%"></div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2 remove-file-btn">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    fileList.appendChild(row);
    row.querySelector('.remove-file-btn').addEventListener('click', () => row.remove());

    const fill = row.querySelector('.upload-progress-fill');
    let pct = 0;
    const iv = setInterval(() => {
      pct = Math.min(pct + 10 + Math.random() * 15, 100);
      fill.style.width = pct + '%';
      if (pct >= 100) { clearInterval(iv); fill.style.background = 'var(--ecmis-ok)'; }
    }, 120);
  }

  function handleFiles(files) {
    Array.from(files).forEach(f => {
      if (f.size > MB) { toastWarn(`ไฟล์ "${f.name}" มีขนาดเกิน ${maxMB || 10} MB`); return; }
      if (allowedTypes && !allowedTypes.some(t => f.name.toLowerCase().endsWith(t))) {
        toastWarn(`ไฟล์ "${f.name}" ไม่ใช่ประเภทที่รองรับ`); return;
      }
      renderFile(f);
    });
    toastOk(`เพิ่มไฟล์ ${files.length} รายการแล้ว`);
  }

  zone.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.onchange = () => handleFiles(inp.files);
    inp.click();
  });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
}

function initDocPaneToggle() {
  if (typeof document === 'undefined') return;

  const runToggleInit = () => {
    const docPane = document.querySelector('.doc-pane');
    if (!docPane) return;

    const docCol = docPane.closest('[class*="col-xl-"], [class*="col-lg-"], [class*="col-md-"]');
    if (!docCol) return;

    const formCol = docCol.previousElementSibling;
    if (!formCol) return;

    if (formCol.dataset.toggleInited === '1') return;
    formCol.dataset.toggleInited = '1';

    const origClass = formCol.className;
    formCol.dataset.origClass = origClass;

    let isHidden = false;

    function setDocVisibility(hide) {
      isHidden = hide;
      if (isHidden) {
        docCol.classList.add('d-none');
        formCol.className = origClass.replace(/col-(xl|lg|md)-\d+/g, 'col-12 col-xl-12 col-lg-12');
      } else {
        docCol.classList.remove('d-none');
        formCol.className = origClass;
      }
      updateButtons();
    }

    function updateButtons() {
      document.querySelectorAll('.btn-doc-toggle').forEach(btn => {
        if (isHidden) {
          btn.innerHTML = '<i class="fa-solid fa-eye me-1"></i>แสดงเอกสาร';
          btn.classList.remove('btn-outline-secondary', 'btn-light');
          btn.classList.add('btn-navy');
        } else {
          btn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i>ซ่อนเอกสาร';
          btn.classList.remove('btn-navy');
          if (btn.classList.contains('btn-doc-toggle-toolbar')) {
            btn.classList.add('btn-light');
          } else {
            btn.classList.add('btn-outline-secondary');
          }
        }
      });
    }

    const pageHeadTarget = document.querySelector('.page-head .ms-auto') || document.querySelector('.page-head');
    if (pageHeadTarget && !document.querySelector('.btn-doc-toggle-header')) {
      const headBtn = document.createElement('button');
      headBtn.type = 'button';
      headBtn.className = 'btn btn-sm btn-outline-secondary btn-doc-toggle btn-doc-toggle-header ms-2 no-print';
      headBtn.title = 'ซ่อน/แสดง เลย์เอาต์เอกสารฝั่งขวา';
      headBtn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i>ซ่อนเอกสาร';
      headBtn.addEventListener('click', () => setDocVisibility(!isHidden));
      pageHeadTarget.appendChild(headBtn);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runToggleInit);
  } else {
    runToggleInit();
  }
  setTimeout(runToggleInit, 100);
}

const DEFAULT_SUGGESTIONS = {
  suggestions: [
    'เห็นชอบตามความเห็นและข้อเสนอของเจ้าหน้าที่รับเรื่อง',
    'ส่งกลับให้ตรวจสอบข้อเท็จจริงและเอกสารเพิ่มเติม',
    'เห็นควรเสนอ ผู้อำนวยการกองบริหารคดี พิจารณาต่อไป',
    'โปรดตรวจสอบข้อเท็จจริงเพิ่มเติม',
    'พบข้อมูลที่ควรตรวจสอบความเชื่อมโยง',
    'เอกสารประกอบยังไม่ครบถ้วน',
    'เสนอให้ตรวจสอบอำนาจหน้าที่ของหน่วยงาน'
  ],
  reasons: [
    'ข้อเท็จจริงไม่เพียงพอต่อการดำเนินการ',
    'ไม่อยู่ในอำนาจหน้าที่ของสำนักงาน ป.ป.ท.',
    'ไม่ปรากฏพฤติการณ์หรือบุคคลที่เกี่ยวข้องชัดเจน',
    'เรื่องอยู่ระหว่างการพิจารณาของหน่วยงานอื่น',
    'ผู้ร้องถอนเรื่องหรือไม่ประสงค์ดำเนินการต่อ'
  ]
};

function getSuggestionsData() {
  try {
    const stored = localStorage.getItem('ecmis_managed_suggestions');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.suggestions) && Array.isArray(parsed.reasons)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse managed suggestions:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SUGGESTIONS));
}

function saveSuggestionsData(data) {
  try {
    localStorage.setItem('ecmis_managed_suggestions', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save managed suggestions:', e);
  }
}

function openSuggestionsModal() {
  const currentData = getSuggestionsData();

  const modalHtml = `
    <div class="text-start" style="font-family:var(--font); color:#1E293B">
      <div class="row g-3">
        <!-- Col 1: คำแนะนำที่ใช้บ่อย -->
        <div class="col-md-6">
          <div class="p-3 rounded-3" style="background:#F8FAFC; border:1px solid #E2E8F0">
            <h6 class="fw-bold mb-3" style="color:#0F2A62"><i class="fa-solid fa-lightbulb text-warning me-1"></i>คำแนะนำที่ใช้บ่อย</h6>
            <div class="input-group input-group-sm mb-3">
              <input type="text" id="swal-new-suggestion" class="form-control form-control-sm" placeholder="เพิ่มข้อความแนะนำ">
              <button type="button" class="btn btn-navy btn-sm" id="swal-add-suggestion-btn">
                <i class="fa-solid fa-plus me-1"></i>เพิ่ม
              </button>
            </div>
            <div id="swal-suggestions-list" class="pe-1" style="max-height:260px; overflow-y:auto; font-size:0.85rem"></div>
          </div>
        </div>

        <!-- Col 2: เหตุผลไม่รับไว้ดำเนินการ -->
        <div class="col-md-6">
          <div class="p-3 rounded-3" style="background:#F8FAFC; border:1px solid #E2E8F0">
            <h6 class="fw-bold mb-3" style="color:#0F2A62"><i class="fa-solid fa-circle-exclamation text-danger me-1"></i>เหตุผลไม่รับไว้ดำเนินการ</h6>
            <div class="input-group input-group-sm mb-3">
              <input type="text" id="swal-new-reason" class="form-control form-control-sm" placeholder="เพิ่มเหตุผล">
              <button type="button" class="btn btn-navy btn-sm" id="swal-add-reason-btn">
                <i class="fa-solid fa-plus me-1"></i>เพิ่ม
              </button>
            </div>
            <div id="swal-reasons-list" class="pe-1" style="max-height:260px; overflow-y:auto; font-size:0.85rem"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  let workingData = JSON.parse(JSON.stringify(currentData));

  Swal.fire({
    title: '<span style="font-family:var(--font); font-weight:700; color:#0F2A62; font-size:1.35rem"><i class="fa-solid fa-sliders text-primary me-2"></i>จัดการคำแนะนำและเหตุผล</span>',
    html: modalHtml,
    width: 820,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i>บันทึกรายการ',
    cancelButtonText: 'ยกเลิก',
    customClass: {
      confirmButton: 'btn btn-navy px-4 py-2 me-2',
      cancelButton: 'btn btn-outline-secondary px-4 py-2'
    },
    buttonsStyling: false,
    didOpen: () => {
      function renderLists() {

        const sugContainer = document.getElementById('swal-suggestions-list');
        if (sugContainer) {
          if (!workingData.suggestions.length) {
            sugContainer.innerHTML = `<div class="text-muted text-center py-3">ยังไม่มีข้อความแนะนำ</div>`;
          } else {
            sugContainer.innerHTML = workingData.suggestions.map((item, idx) => `
              <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm">
                <span class="text-truncate me-2" style="font-size:0.82rem; color:#334155">${item}</span>
                <button type="button" class="btn btn-danger btn-xs py-1 px-2 text-nowrap" onclick="window._deleteSugItem(${idx})">
                  <i class="fa-solid fa-trash-can me-1"></i>ลบ
                </button>
              </div>
            `).join('');
          }
        }

        // Render Reasons List
        const reasonContainer = document.getElementById('swal-reasons-list');
        if (reasonContainer) {
          if (!workingData.reasons.length) {
            reasonContainer.innerHTML = `<div class="text-muted text-center py-3">ยังไม่มีรายการเหตุผล</div>`;
          } else {
            reasonContainer.innerHTML = workingData.reasons.map((item, idx) => `
              <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm">
                <span class="text-truncate me-2" style="font-size:0.82rem; color:#334155">${item}</span>
                <button type="button" class="btn btn-danger btn-xs py-1 px-2 text-nowrap" onclick="window._deleteReasonItem(${idx})">
                  <i class="fa-solid fa-trash-can me-1"></i>ลบ
                </button>
              </div>
            `).join('');
          }
        }
      }

      window._deleteSugItem = (idx) => {
        workingData.suggestions.splice(idx, 1);
        renderLists();
      };
      window._deleteReasonItem = (idx) => {
        workingData.reasons.splice(idx, 1);
        renderLists();
      };

      document.getElementById('swal-add-suggestion-btn')?.addEventListener('click', () => {
        const inp = document.getElementById('swal-new-suggestion');
        const val = inp?.value.trim();
        if (val) {
          workingData.suggestions.push(val);
          inp.value = '';
          renderLists();
        }
      });

      document.getElementById('swal-add-reason-btn')?.addEventListener('click', () => {
        const inp = document.getElementById('swal-new-reason');
        const val = inp?.value.trim();
        if (val) {
          workingData.reasons.push(val);
          inp.value = '';
          renderLists();
        }
      });

      renderLists();
    },
    preConfirm: () => {
      return workingData;
    }
  }).then((res) => {
    if (res.isConfirmed && res.value) {
      saveSuggestionsData(res.value);
      toastOk('บันทึกรายการคำแนะนำและเหตุผลเรียบร้อยแล้ว');
      initWritingSuggestions();
    }
  });
}

function initWritingSuggestions() {
  if (typeof document === 'undefined') return;
  const textareas = document.querySelectorAll('textarea');
  const data = getSuggestionsData();

  textareas.forEach((ta, index) => {
    if (ta.hasAttribute('data-no-suggestions') || ta.disabled || ta.readOnly) return;
    if (!ta.id) {
      ta.id = 'ta-sug-' + index + '-' + Math.random().toString(36).substring(2, 6);
    }

    let chipContainer = document.getElementById('sugChips-' + ta.id);
    if (!chipContainer) {
      chipContainer = document.createElement('div');
      chipContainer.id = 'sugChips-' + ta.id;
      chipContainer.className = 'sug-chips-box mt-2 p-2 rounded-3 border bg-light shadow-xs';
      chipContainer.style.fontSize = '0.8rem';

      ta.parentNode.insertBefore(chipContainer, ta.nextSibling);
    }

    const parentText = (ta.parentNode ? ta.parentNode.innerText : '') + ' ' + (ta.placeholder || '') + ' ' + ta.id;
    const isReasonBox = /เหตุผล|ส่งคืน|ตีกลับ|ยุติ|ไม่รับ/.test(parentText);

    // จัดลำดับความเกี่ยวข้อง (เหตุผล vs คำแนะนำการเขียน)
    const primaryItems = isReasonBox ? data.reasons.concat(data.suggestions) : data.suggestions.concat(data.reasons);
    const top3 = primaryItems.slice(0, 3);

    if (!top3.length) return;

    // สร้าง HTML ชิปคำแนะนำล่วงหน้า เพื่อคงรายการคำแนะนำให้พร้อมใช้งานเสมอแม้อยู่หลังการคลิกเลือก
    chipContainer.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-2 text-warning fw-semibold">
        <div class="d-flex align-items-center gap-1">
          <i class="fa-solid fa-lightbulb"></i>
          <span>คำแนะนำการเขียน</span>
          <span class="badge rounded-pill bg-warning text-dark ms-1" style="font-size:0.7rem">${top3.length} ข้อเสนอ</span>
        </div>
        <small class="text-muted" style="font-size:0.72rem"><i class="fa-solid fa-hand-pointer me-1"></i>คลิกเพื่อเลือก</small>
      </div>
      <div class="d-flex flex-wrap gap-2">
        ${top3.map(s => `
          <button type="button" class="btn btn-sm btn-outline-secondary bg-white text-dark rounded-pill py-1 px-3 shadow-xs sug-chip-btn"
                  style="font-size:0.78rem; border-color:#CBD5E1; transition:all 0.18s cubic-bezier(0.4, 0, 0.2, 1);"
                  data-text="${s.replace(/"/g, '&quot;')}">
            <i class="fa-solid fa-plus text-primary me-1" style="font-size:0.7rem"></i>${s}
          </button>
        `).join('')}
      </div>
    `;

    // ผูก event เมื่อผู้ใช้กดปุ่มชิปคำแนะนำ
    chipContainer.querySelectorAll('.sug-chip-btn').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToInsert = btn.getAttribute('data-text');
        if (textToInsert) {
          const start = ta.selectionStart || ta.value.length;
          const end = ta.selectionEnd || ta.value.length;
          const currentVal = ta.value;
          const prefix = (start > 0 && !currentVal.endsWith('\n') && !currentVal.endsWith(' ')) ? ' ' : '';

          ta.value = currentVal.substring(0, start) + prefix + textToInsert + currentVal.substring(end);
          ta.selectionStart = ta.selectionEnd = start + prefix.length + textToInsert.length;
          ta.focus();
          ta.dispatchEvent(new Event('input'));
          ta.dispatchEvent(new Event('change'));
          toastOk('แทรกข้อความแนะนำแล้ว');
        }
      });
    });

    const showChips = () => chipContainer.classList.add('active');
    const hideChips = () => chipContainer.classList.remove('active');

    ta.addEventListener('focus', showChips);
    ta.addEventListener('click', showChips);

    ta.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== ta && !chipContainer.contains(document.activeElement)) {
          hideChips();
        }
      }, 200);
    });
  });
}

function initHeaderSuggestionsButton() {
  if (typeof document === 'undefined') return;
  const target = document.querySelector('.page-head .ms-auto') || document.querySelector('.page-head');
  if (target && !document.querySelector('.btn-manage-sug')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-primary btn-manage-sug rounded-pill px-3 py-1 me-2 no-print';
    btn.innerHTML = '<i class="fa-solid fa-lightbulb text-warning me-1"></i>จัดการคำแนะนำ';
    btn.title = 'จัดการข้อความคำแนะนำและเหตุผลมาตรฐาน';
    btn.addEventListener('click', openSuggestionsModal);
    target.insertBefore(btn, target.firstChild);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () => {
    const docPane = document.querySelector('.doc-pane, .doc-paper');
    if (docPane) {
      document.body.classList.add('printing-doc-only');
      document.querySelectorAll('.row > [class*="col-"]').forEach(col => {
        if (!col.querySelector('.doc-pane, .doc-paper')) {
          col.classList.add('no-print-temp');
        }
      });
    }
  });
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing-doc-only');
    document.querySelectorAll('.no-print-temp').forEach(col => {
      col.classList.remove('no-print-temp');
    });
  });
}

if (typeof document !== 'undefined') {
  const initSug = () => {
    initHeaderSuggestionsButton();
    initWritingSuggestions();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSug);
  } else {
    initSug();
  }
  setTimeout(initSug, 200);
}

/* ---------- Universal Document Editor (Toolbar Button + Rich Text Bar) ---------- */
function initDocEditor(opts) {
  opts = opts || {};
  const stageId = opts.stageId || 'docPaper';
  const mayEdit = opts.mayEdit !== undefined ? opts.mayEdit : true;
  const onSave = opts.onSave;
  
  let docPaperWrap = document.getElementById(stageId);
  if (!docPaperWrap) return null;

  const docPane = docPaperWrap.closest('.ws-doc-pane') || docPaperWrap.parentElement;
  let toolbar = docPane ? docPane.querySelector('.ws-doc-toolbar') : null;
  let docEditBar = document.getElementById('docEditBar');
  let editBtn = document.getElementById('btnDocEdit') || document.getElementById('docEditBtn') || document.getElementById('docEditFab');

  // Clean up any legacy floating FAB from body
  document.querySelectorAll('body > .doc-edit-fab').forEach(el => el.remove());

  // Attach button into toolbar
  if (!editBtn) {
    editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.id = 'btnDocEdit';
    editBtn.className = 'btn btn-sm btn-light btn-doc-edit ms-auto me-1';
    editBtn.title = 'เปิด/ปิดโหมดแก้ไขเอกสาร';
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square me-1"></i><span>แก้ไขเอกสาร</span>';

    if (toolbar) {
      const toggle = toolbar.querySelector('.ws-doc-pane-toggle');
      const printBtn = toolbar.querySelector('[onclick*="print"], #btnDocPrint');
      if (printBtn && printBtn.parentElement) {
        printBtn.parentElement.insertBefore(editBtn, printBtn);
      } else if (toggle && toggle.parentElement) {
        toggle.parentElement.insertBefore(editBtn, toggle);
      } else {
        toolbar.appendChild(editBtn);
      }
    } else {
      docPaperWrap.parentElement.insertBefore(editBtn, docPaperWrap);
    }
  } else {
    // If it was an old fab button, modernize it
    if (!editBtn.classList.contains('btn-doc-edit')) {
      editBtn.className = 'btn btn-sm btn-light btn-doc-edit ms-auto me-1';
    }
    if (!editBtn.innerHTML.trim()) {
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    }
    if (toolbar && !toolbar.contains(editBtn)) {
      const printBtn = toolbar.querySelector('[onclick*="print"], #btnDocPrint');
      const toggle = toolbar.querySelector('.ws-doc-pane-toggle');
      if (printBtn && printBtn.parentElement) {
        printBtn.parentElement.insertBefore(editBtn, printBtn);
      } else if (toggle && toggle.parentElement) {
        toggle.parentElement.insertBefore(editBtn, toggle);
      } else {
        toolbar.appendChild(editBtn);
      }
    }
  }

  if (!docEditBar) {
    const bar = document.createElement('div');
    bar.className = 'doc-edit-bar';
    bar.id = 'docEditBar';
    bar.innerHTML = `
      <span class="doc-edit-bar-label"><i class="fa-solid fa-pen-to-square me-1"></i>แก้ไขเอกสาร</span>
      <span class="doc-edit-bar-sep"></span>
      <button type="button" data-format="bold" title="ตัวหนา"><b>B</b></button>
      <button type="button" data-format="italic" title="ตัวเอียง"><i>I</i></button>
      <button type="button" data-format="underline" title="ขีดเส้นใต้"><u>U</u></button>
      <span class="doc-edit-bar-sep"></span>
      <button type="button" data-format="justifyLeft" title="ชิดซ้าย"><i class="fa-solid fa-align-left"></i></button>
      <button type="button" data-format="justifyCenter" title="กึ่งกลาง"><i class="fa-solid fa-align-center"></i></button>
      <button type="button" data-format="justifyRight" title="ชิดขวา"><i class="fa-solid fa-align-right"></i></button>
      <span class="doc-edit-bar-sep"></span>
      <button type="button" data-format="undo" title="เลิกทำ"><i class="fa-solid fa-rotate-left"></i></button>
      <button type="button" data-format="redo" title="ทำซ้ำ"><i class="fa-solid fa-rotate-right"></i></button>
      <span class="doc-edit-bar-sep"></span>
      <button type="button" class="btn btn-sm btn-gold" id="btnSaveDocEdit" style="width:auto;padding:0 .6rem">บันทึกการแก้ไข</button>
    `;
    const host = docPaperWrap.parentElement;
    if (host) host.insertBefore(bar, docPaperWrap);
    docEditBar = bar;
  }

  if (mayEdit) {
    editBtn.classList.remove('d-none');
  } else {
    editBtn.classList.add('d-none');
  }

  function setDocEditMode(on) {
    docPaperWrap = document.getElementById(stageId);
    if (!docPaperWrap) return;
    docPaperWrap.querySelectorAll('.doc-paper, .a4-paper, .a4-page').forEach(p => {
      if (on) p.setAttribute('contenteditable', 'true');
      else p.removeAttribute('contenteditable');
    });
    editBtn.classList.toggle('active', on);
    editBtn.innerHTML = on
      ? '<i class="fa-solid fa-check me-1"></i><span>กำลังแก้ไข</span>'
      : '<i class="fa-solid fa-pen-to-square me-1"></i><span>แก้ไขเอกสาร</span>';
    if (docEditBar) docEditBar.classList.toggle('show', on);
  }

  editBtn.onclick = () => {
    const on = !editBtn.classList.contains('active');
    setDocEditMode(on);
  };

  if (docEditBar) {
    docEditBar.onclick = e => {
      const btn = e.target.closest('[data-format]');
      if (btn) {
        document.execCommand(btn.dataset.format);
        docPaperWrap.querySelector('.doc-paper, .a4-paper, .a4-page')?.focus();
      }
    };
  }

  const saveBtn = document.getElementById('btnSaveDocEdit') || (docEditBar && docEditBar.querySelector('#btnSaveDocEdit'));
  if (saveBtn) {
    saveBtn.onclick = () => {
      setDocEditMode(false);
      if (typeof onSave === 'function') {
        onSave(docPaperWrap.innerHTML);
      }
      toastOk('บันทึกการแก้ไขเอกสารเรียบร้อย');
    };
  }

  return {
    setDocEditMode,
    setMayEdit: (allowed) => {
      editBtn.classList.toggle('d-none', !allowed);
    }
  };
}

/* ---------- Master Declarative Component: ws-doc-toolbar ---------- */
function renderDocToolbar(opts) {
  if (typeof document === 'undefined') return null;
  opts = opts || {};

  let targetEl = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
  const docWorkspace = opts.workspace ? (typeof opts.workspace === 'string' ? document.querySelector(opts.workspace) : opts.workspace) : document.getElementById('docWorkspace');
  const stageId = opts.stageId || 'docPaper';
  const stageEl = document.getElementById(stageId);
  const paneEl = stageEl ? (stageEl.closest('.ws-doc-pane') || stageEl.parentElement) : document.querySelector('.ws-doc-pane');

  if (!targetEl) {
    if (paneEl) {
      targetEl = paneEl.querySelector('.ws-doc-toolbar');
      if (!targetEl) {
        targetEl = document.createElement('div');
        targetEl.className = 'ws-doc-toolbar';
        if (stageEl) {
          paneEl.insertBefore(targetEl, stageEl);
        } else {
          paneEl.appendChild(targetEl);
        }
      }
    } else {
      targetEl = document.querySelector('.ws-doc-toolbar');
    }
  }
  if (!targetEl) return null;

  // Build Left Content (Title/Badge or Tabs or Jump Select)
  let leftHtml = '';
  if (Array.isArray(opts.tabs) && opts.tabs.length > 0) {
    leftHtml = `<div class="ws-doc-tabs">` + opts.tabs.map(t => {
      const activeCls = t.active ? ' active' : '';
      const iconHtml = t.icon ? `<i class="${t.icon} me-1"></i>` : '';
      const countHtml = t.count !== undefined ? `<span class="badge bg-secondary ms-1">${t.count}</span>` : '';
      return `<button type="button" class="ws-doc-tab${activeCls}" data-tab-id="${t.id}" ${t.disabled ? 'disabled' : ''}>${iconHtml}${t.label}${countHtml}</button>`;
    }).join('') + `</div>`;
  } else if (opts.title) {
    const iconHtml = opts.icon ? `<i class="${opts.icon}"></i> ` : '<i class="fa-solid fa-file-word"></i> ';
    const badgeHtml = opts.badge ? `<span class="badge-tpl">${opts.badge}</span>` : '';
    leftHtml = `<span class="name">${iconHtml}${opts.title} ${badgeHtml}</span>`;
  }

  if (opts.subTabs && Array.isArray(opts.subTabs.items) && opts.subTabs.items.length > 0) {
    const subLabel = opts.subTabs.label ? `<span class="sub-tab-label small text-muted me-1">${opts.subTabs.label}</span>` : '';
    leftHtml += `<div class="ws-doc-subtabs ms-2 d-inline-flex align-items-center gap-1">${subLabel}` + opts.subTabs.items.map(st => {
      const actCls = st.active ? ' active' : '';
      return `<button type="button" class="btn btn-xs btn-outline-secondary subtab-btn${actCls}" data-subtab-id="${st.id}">${st.label}</button>`;
    }).join('') + `</div>`;
  }

  if (opts.jump && Array.isArray(opts.jump.options)) {
    const jumpLabel = opts.jump.label ? `<span>${opts.jump.label}</span>` : '<span>ข้ามไปที่</span>';
    leftHtml += `<div class="ws-doc-jump ms-auto me-2">${jumpLabel}<select class="form-select form-select-sm">` + opts.jump.options.map(opt => {
      const sel = opt.selected ? ' selected' : '';
      return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
    }).join('') + `</select></div>`;
  }

  // Right Actions
  const showEdit = opts.editable !== false;
  const showPdf = opts.exportPdf !== false && opts.printable !== false;
  const showDocx = opts.exportDocx !== false;
  const showCollapse = opts.collapsible !== false && (!!docWorkspace || !!paneEl);

  let rightHtml = '<div class="d-flex align-items-center gap-1 ms-auto">';
  if (showEdit) {
    rightHtml += `<button type="button" class="btn btn-sm btn-light btn-doc-edit" id="btnDocEdit" title="แก้ไขเนื้อหาเอกสาร (Rich Text)"><i class="fa-solid fa-pen-to-square"></i></button>`;
  }
  if (showPdf) {
    rightHtml += `<button type="button" class="btn btn-sm btn-light" id="btnDocPdf" title="ดาวน์โหลดไฟล์ PDF / สั่งพิมพ์"><i class="fa-solid fa-print me-1"></i>พิมพ์/PDF</button>`;
  }
  if (showDocx) {
    rightHtml += `<button type="button" class="btn btn-sm btn-light" id="btnDocx" title="ดาวน์โหลดไฟล์ Microsoft Word (.docx)"><i class="fa-solid fa-download me-1"></i>.docx</button>`;
  }
  if (showCollapse) {
    rightHtml += `<button type="button" class="ws-doc-pane-toggle" id="btnPaneCollapse" title="ย่อแผงเอกสาร"><i class="fa-solid fa-angles-right"></i></button>`;
  }
  rightHtml += '</div>';

  targetEl.innerHTML = leftHtml + rightHtml;

  // Rail button if workspace collapsed
  if (paneEl && showCollapse) {
    let railBtn = paneEl.querySelector('.ws-doc-pane-rail');
    if (!railBtn) {
      railBtn = document.createElement('button');
      railBtn.type = 'button';
      railBtn.className = 'ws-doc-pane-rail';
      railBtn.id = 'btnPaneExpand';
      railBtn.title = 'ขยายแผงเอกสาร';
      railBtn.innerHTML = '<i class="fa-solid fa-angles-left"></i><span>เอกสาร</span>';
      paneEl.insertBefore(railBtn, targetEl);
    }
  }

  // Bind Tab clicks
  if (Array.isArray(opts.tabs)) {
    targetEl.querySelectorAll('.ws-doc-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        targetEl.querySelectorAll('.ws-doc-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        if (typeof opts.onTabChange === 'function') {
          opts.onTabChange(tabBtn.dataset.tabId);
        }
      });
    });
  }

  // Bind Subtab clicks
  if (opts.subTabs) {
    targetEl.querySelectorAll('.subtab-btn').forEach(subBtn => {
      subBtn.addEventListener('click', () => {
        targetEl.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        subBtn.classList.add('active');
        if (typeof opts.subTabs.onSubTabChange === 'function') {
          opts.subTabs.onSubTabChange(subBtn.dataset.subtabId);
        }
      });
    });
  }

  // Bind Jump select
  if (opts.jump) {
    const jumpSelect = targetEl.querySelector('.ws-doc-jump select');
    if (jumpSelect) {
      jumpSelect.addEventListener('change', (e) => {
        if (typeof opts.jump.onChange === 'function') {
          opts.jump.onChange(e.target.value);
        }
      });
    }
  }

  // Bind Unified Print / PDF Preview
  const pdfBtn = targetEl.querySelector('#btnDocPdf');
  if (pdfBtn && showPdf) {
    pdfBtn.addEventListener('click', () => {
      if (typeof opts.onPrint === 'function') {
        opts.onPrint();
      } else {
        window.print();
      }
    });
  }

  // Bind Docx Export
  const docxBtn = targetEl.querySelector('#btnDocx');
  if (docxBtn && opts.exportDocx) {
    docxBtn.addEventListener('click', async () => {
      if (typeof opts.exportDocx === 'object' && typeof opts.exportDocx.onExport === 'function') {
        opts.exportDocx.onExport(stageEl);
      } else if (typeof opts.onExportDocx === 'function') {
        opts.onExportDocx(stageEl);
      } else {
        const fn = typeof opts.exportDocx === 'object' && opts.exportDocx.filename
          ? (typeof opts.exportDocx.filename === 'function' ? opts.exportDocx.filename() : opts.exportDocx.filename)
          : `${(opts.title || 'document').replace(/\s+/g, '_')}.docx`;
        exportDocToDocx(stageEl || document.body, fn);
      }
    });
  }

  // Bind Pane Collapsible with Persistence
  if (showCollapse && docWorkspace) {
    const PANE_KEY = opts.paneKey || 'ecmis-docpane-collapsed';
    const setPaneCollapsed = (collapsed) => {
      docWorkspace.classList.toggle('pane-collapsed', collapsed);
      try { localStorage.setItem(PANE_KEY, collapsed ? '1' : '0'); } catch(e) {}
    };

    try {
      if (localStorage.getItem(PANE_KEY) === '1') setPaneCollapsed(true);
    } catch(e) {}

    const colBtn = targetEl.querySelector('#btnPaneCollapse');
    if (colBtn) colBtn.addEventListener('click', () => setPaneCollapsed(true));

    const expBtn = paneEl ? paneEl.querySelector('#btnPaneExpand') : null;
    if (expBtn) expBtn.addEventListener('click', () => setPaneCollapsed(false));
  }

  // Initialize Doc Editor
  let editorInstance = null;
  if (showEdit && stageEl) {
    editorInstance = initDocEditor({
      stageId: stageId,
      mayEdit: opts.mayEdit !== undefined ? opts.mayEdit : true,
      onSave: opts.onSaveEdit
    });
  }

  return {
    element: targetEl,
    editor: editorInstance
  };
}

/* ---------- Master Component: Back Navigation Button ---------- */
function renderBackButton(opts) {
  if (typeof document === 'undefined') return null;
  opts = opts || {};

  const currentRole = (typeof currentRoleId === 'function' ? getRole(currentRoleId()) : null) || { id: 'board_sec' };
  let defaultHref = homeHref ? homeHref(currentRole.id) : 'inbox.html';
  let defaultLabel = 'กลับหน้ารายการ';

  // Context-aware defaults based on current page
  const path = (typeof location !== 'undefined' ? location.pathname : '').split('/').pop() || '';
  if (path.includes('resolution-72') || path.includes('board-resolution') || (path.includes('resolution') && !path.includes('inbox'))) {
    defaultHref = (currentRole.id === 'board_sec' || currentRole.id === 'affairs')
      ? resolvePage('resolution-inbox.html')
      : (homeHref ? homeHref(currentRole.id) : 'inbox.html');
    defaultLabel = (currentRole.id === 'board_sec' || currentRole.id === 'affairs')
      ? 'กลับรายการจัดทำมติ'
      : 'กลับหน้ารายการ';
  } else if (path.includes('ruling-report')) {
    defaultHref = (currentRole.id === 'board_sec' || currentRole.id === 'affairs')
      ? resolvePage('resolution-inbox.html')
      : (homeHref ? homeHref(currentRole.id) : 'inbox.html');
    defaultLabel = 'กลับรายการจัดทำมติ';
  } else if (path.includes('support-subcommittee') && !path.includes('inbox')) {
    defaultHref = resolvePage('support-subcommittee-inbox.html');
    defaultLabel = 'กลับรายการกลั่นกรอง';
  } else if (path.includes('agenda-meeting-docs') || path.includes('meeting-docs')) {
    const params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(location.search) : null;
    const meetId = params ? params.get('meet') : null;
    defaultHref = meetId ? resolvePage(`agenda-detail.html?meet=${encodeURIComponent(meetId)}`) : resolvePage('agenda-registry.html');
    defaultLabel = meetId ? 'กลับรายละเอียดวาระ' : 'กลับทะเบียนวาระการประชุม';
  } else if (path.includes('agenda-registry-detail') || path.includes('agenda-detail')) {
    defaultHref = resolvePage('agenda-registry.html');
    defaultLabel = 'กลับทะเบียนวาระการประชุม';
  } else if (path.includes('chairman-agenda') || path.includes('chairman')) {
    defaultHref = resolvePage('inbox.html');
    defaultLabel = 'กลับรายการพิจารณา/สั่งการ';
  } else if (path.includes('approval-review') || path.includes('review') || path.includes('subcommittee-screening') || path.includes('screening') || path.includes('urgent-agenda') || path.includes('order-m24') || path.includes('order')) {
    defaultHref = homeHref ? homeHref(currentRole.id) : 'inbox.html';
    defaultLabel = 'กลับหน้ารายการ';
  }

  const href = opts.href || opts.fallback || defaultHref;
  const label = opts.label || defaultLabel;
  const icon = opts.icon || 'fa-solid fa-arrow-left me-1';
  const cls = opts.className || 'text-decoration-none small d-block mb-1 btn-back-nav';
  const inlineStyle = opts.style !== undefined ? opts.style : 'color:var(--ecmis-muted)';

  // Target element (find in page-head or container)
  let targetContainer = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
  if (!targetContainer) {
    const pageHead = document.querySelector('.page-head');
    if (pageHead) {
      // Remove any legacy duplicate manual back links
      pageHead.querySelectorAll('#backLink, #btnBackToInbox, a.back-link, a.btn-outline-secondary[href*="agenda-registry"], a[href="inbox.html"].small').forEach(el => {
        if (!el.classList.contains('btn-back-nav')) el.remove();
      });

      targetContainer = pageHead.querySelector('div:first-child');
      if (targetContainer) {
        // Ensure parent div is not forcing horizontal flex layout on h1
        targetContainer.classList.remove('d-flex', 'align-items-center');
      }
    }
  }

  if (!targetContainer) return null;

  // Clean up any legacy wrap
  targetContainer.querySelectorAll('.btn-back-nav-wrap').forEach(w => w.remove());

  // Check if back button already exists in targetContainer
  let btn = targetContainer.querySelector('.btn-back-nav');
  if (!btn) {
    btn = document.createElement('a');
    btn.className = cls;
    btn.id = opts.id || 'btnBackNav';
    if (inlineStyle) btn.setAttribute('style', inlineStyle);
    targetContainer.insertBefore(btn, targetContainer.firstChild);
  } else {
    btn.className = cls;
    if (inlineStyle) btn.setAttribute('style', inlineStyle);
  }

  btn.href = href;
  btn.innerHTML = `<i class="${icon}"></i><span>${label}</span>`;
  btn.title = label;

  // Add click handler to prefer history.back() when referrer is internal and different page
  btn.addEventListener('click', (e) => {
    if (opts.useHistory !== false && typeof document !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        const curUrl = new URL(location.href);
        if (refUrl.origin === curUrl.origin && refUrl.pathname !== curUrl.pathname) {
          e.preventDefault();
          history.back();
        }
      } catch (err) {}
    }
  });

  return btn;
}

global.ECMIS = {
  ROLES, STATUS, STATUS_CODE, CODE_STATUS, STATUS_STEP, FLOW_STEPS, APPROVAL_CHAIN,
  buildChainOpinions, supabaseRowToCase, toBuddhistFakeIso, addDaysToDateStr, addYearsToDateStr,
  upcomingDeadlines, pageForCase,
  CASES, RETURN_REASONS, RESOLUTIONS, resolutionOf,
  DOC_TYPES, SIGN_PHASE, secgenSlaLimit, FORWARD_TARGETS, forwardTarget,

  RESOLUTIONS_72, resolution72, FLOW_STEPS_72, STATUS_STEP_72,
  RESOLUTIONS_73, resolution73, isCase73,
  trackStatus72, bothTracksDone72,
  OPINION_TYPES, chainDivergence, g1Triggers, M28, M28_ORDERS, m28Order, m28Pending,
  TRANSITIONS, canTransition, nextStates, transitionsBetween,
  BOARD_MIN_IN_OFFICE, boardQuorum,
  M24P1_MIN_PANEL, M24P1_STAFF_FREE, panelComposition,
  CONFIG, RETURN_SCOPES, MATERIAL_FIELDS, daysUntil,
  UPSTREAM_CHAIN, isUpstreamRole, isUpstreamCase, isCase72, PAGE_FOR_72, pageForCase72, pageForCaseByStatus, homeHref, resolvePage,
  PAGE_PERMISSIONS, canAccessPage, inResFolder, assetUrl, getSupabaseClient,
  PERM_DEFS, can, canEditMaster, canViewCase,
  thaiDate, thaiDayName, toThaiDigits, slaClass, slaLabel, effectiveSlaLimit, getCase, getRole, roleIdForLogin, LOGIN_ALLOWED_ROLE_IDS,
  addBusinessDays, businessDaysBetween, resolutionSlaInfo, SUBCOMMITTEE_ROSTER,
  currentRoleId, currentRole, setRole, inboxFor, canAct, canRecall,
  isAuthed, currentUsername, logout,
  renderShell, stepperHtml, statusBadge, typeBadge, slaBadge, actionBar,
  mergeField, escapeHtml, fakeTodayIso, daysUntilFakeIso, paginateDoc, paginateResolutionDoc, exportDocToDocx, exportDocToPdf, printDoc, confirmAction, toastOk, toastWarn, signDialog, sequentialSignDialog,

  ACT7_SECTIONS, ACT7_STATUSES, getAct7Status, act7Badge,
  ACT7_STATUSES_72, getAct7Status72,
  RESOLUTION_STAGES, resolutionStageLabel, resolutionStageBadge, computeResolutionStage,

  saveCases, toggleColorMode, toggleSidebarCollapse, changeFont, toggleVoiceRecognition,
  initSmartCombobox, initMultiSelectCombo, initRealTimeValidation, initVoiceInput, initSignaturePad,
  signaturePad: (window.ecmis && window.ecmis.signaturePad),
  initAutoSave, initCharCounterAndCopy,

  initAuditTrail, initChecklistGatekeeper, initBulkActions, initDragDropUpload,
  initDocPaneToggle, initRichTextBox, initDocEditor, renderDocToolbar, renderBackButton,

  getSuggestionsData, saveSuggestionsData, openSuggestionsModal, initWritingSuggestions
};

})(window);

