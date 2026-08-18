/* ===========================================================================
   agenda-registry-data.js — ข้อมูลและตรรกะที่ใช้ร่วมกันระหว่าง
   13-agenda-registry.html (ทะเบียน/รายการครั้งที่ประชุม) และ
   14-agenda-registry-detail.html (รายละเอียดวาระของครั้งที่ประชุมที่เลือก)

   ข้อมูลจริง — คัดจาก Agenda5_ACT7_meeting55.xlsx (วาระที่ 5 การประชุม
   คณะกรรมการ ป.ป.ท. ครั้งที่ 55/2569 วันที่ 22 ก.ค. 2569) แผ่นงาน "วาระที่ 5"
   คอลัมน์ต้นฉบับ: อนุวาระ | ลักษณะเรื่อง | เลขที่เรื่อง | สถานะ/หมายเหตุ
   จัดเก็บตามโครงสร้าง res_db.json: tbl_res_calendar (trc_*) → tbl_res_calendar_item (trci_*)
   category 5 กลุ่ม อ้างอิงจากสรุปภาพรวมในแผ่นงาน "Sheet1" ของไฟล์ต้นฉบับ (ไม่ได้กำหนดเอง)

   การเพิ่ม/แก้ไขการประชุมและวาระ จะถูกบันทึกลง sessionStorage (เช่นเดียวกับ
   ECMIS.CASES) เพื่อให้ข้อมูลคงอยู่เมื่อสลับไปมาระหว่างหน้าทะเบียนและหน้า
   รายละเอียดภายในเซสชันเดียวกัน — ยังไม่เชื่อมต่อฐานข้อมูลจริง
   =========================================================================== */
(function (global) {
  'use strict';

  const MEETINGS = [
    { trc_id: 1, trc_name: '55/2569', trc_date: '2569-07-22', trc_status: '1', trc_secrecy: 'SECRET', trc_confirmed: true }
  ];

  const ITEMS = [
    { trci_id: 1,  trc_id: 1, trci_number: '5.1',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล (รายเรื่อง)', case_ref: '1402/2569 (เลขที่ครบถ้วน)', remark: 'ครบอายุความ 24 ม.ค. 70 / ไม่ผ่านการพิจารณาอนุกรรมการกลั่นกรองฯ' },
    { trci_id: 2,  trc_id: 1, trci_number: '5.2',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '0117/2568', remark: 'ครบอายุความ 11 ต.ค. 68 / ผ่านการพิจารณา' },
    { trci_id: 3,  trc_id: 1, trci_number: '5.3',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '045362/2560', remark: 'ครบอายุความ 9 ก.ย. 77 / ผ่านการพิจารณา' },
    { trci_id: 4,  trc_id: 1, trci_number: '5.4',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '0187/2566', remark: 'ครบอายุความ 10 พ.ย. 70 / ผ่านการพิจารณา' },
    { trci_id: 5,  trc_id: 1, trci_number: '5.5',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '1007/2566', remark: 'ครบอายุความ 17 ม.ค. 76 / ผ่านการพิจารณา' },
    { trci_id: 6,  trc_id: 1, trci_number: '5.6',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '0288/2565', remark: 'ครบอายุความ ต.ค. 76 / ผ่านการพิจารณา' },
    { trci_id: 7,  trc_id: 1, trci_number: '5.7',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล (2 เรื่องรวม)', case_ref: '0048/2565, 0196/2565', remark: 'ครบอายุความ ส.ค. 79 / ผ่านการพิจารณา' },
    { trci_id: 8,  trc_id: 1, trci_number: '5.8',  category: 'finding',     trci_topic: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', case_ref: '0084/2564', remark: 'ครบอายุความ 17 ก.ย. 79 / ผ่านการพิจารณา' },
    { trci_id: 9,  trc_id: 1, trci_number: '5.9',  category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 5 เรื่อง - มีบัญชีแนบ)', case_ref: 'ตามบัญชีแนบ (ปปท.เขต 6,6,4,3,7)', remark: 'รับตาม ม.18/4 / อนุกรรมการเห็นแย้ง' },
    { trci_id: 10, trc_id: 1, trci_number: '5.10', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 6 เรื่อง)', case_ref: 'ปปท.เขต 6,3,3,3,3,7', remark: 'กรณีส่งเรื่องให้ ป.ป.ช. / อนุกรรมการเห็นสอดคล้อง' },
    { trci_id: 11, trc_id: 1, trci_number: '5.11', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (เรื่องเดียว)', case_ref: '1062/2568 (ปปท.เขต 7)', remark: 'อนุกรรมการเห็นให้ไต่สวนเบื้องต้นเพิ่มเติม' },
    { trci_id: 12, trc_id: 1, trci_number: '5.12', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 9 เรื่อง)', case_ref: 'กปท.2,1,1,1 / ปปท.เขต 9,7,9,9,6', remark: 'กรณีไม่รับไว้ไต่สวน / อนุกรรมการเห็นสอดคล้อง' },
    { trci_id: 13, trc_id: 1, trci_number: '5.13', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 7 เรื่อง)', case_ref: 'ปปท.เขต 7,5,9,6,6,6,6', remark: 'กรณีไม่รับไว้ไต่สวน / อนุกรรมการเห็นสอดคล้อง' },
    { trci_id: 14, trc_id: 1, trci_number: '5.14', category: 'policy',      trci_topic: 'ขอเห็นชอบร่างหลักเกณฑ์กำหนดขนาดของเรื่องกล่าวหา', case_ref: '-', remark: 'ใช้ประเมินผลปฏิบัติงานพนักงาน/เจ้าหน้าที่ ป.ป.ท.' },
    { trci_id: 15, trc_id: 1, trci_number: '5.15', category: 'policy',      trci_topic: 'ขอมอบหมายให้สำนักงานฯ จัดทำข้อกำหนดจริยธรรม', case_ref: '-', remark: '-' },
    { trci_id: 16, trc_id: 1, trci_number: '5.16', category: 'overdue',     trci_topic: 'รายงานดำเนินการเกินกรอบเวลาไต่สวนเบื้องต้น', case_ref: '2358/2568', remark: '-' },
    { trci_id: 17, trc_id: 1, trci_number: '5.17', category: 'overdue',     trci_topic: 'รายงานดำเนินการเกินกรอบเวลาไต่สวนวินิจฉัยชี้มูล', case_ref: '0138/2566', remark: '-' },
    { trci_id: 18, trc_id: 1, trci_number: '5.18', category: 'overdue',     trci_topic: 'รายงานดำเนินการเกินกรอบเวลาไต่สวนวินิจฉัยชี้มูล', case_ref: '120354/2560', remark: '-' },
    { trci_id: 19, trc_id: 1, trci_number: '5.19', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น', case_ref: '1287/2568', remark: 'ครบอายุความ 5 ก.ย. 68 / ไม่ผ่านการพิจารณาอนุกรรมการ' },
    { trci_id: 20, trc_id: 1, trci_number: '5.20', category: 'prosecutor',  trci_topic: 'ขอผลกันบุคคลไว้เป็นพยาน', case_ref: '0074/2566', remark: '-' },
    { trci_id: 21, trc_id: 1, trci_number: '5.21', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 140271/2563', remark: '-' },
    { trci_id: 22, trc_id: 1, trci_number: '5.22', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 056022/2560', remark: '-' },
    { trci_id: 23, trc_id: 1, trci_number: '5.23', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 2631/2557', remark: '-' },
    { trci_id: 24, trc_id: 1, trci_number: '5.24', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 2717/2558', remark: '-' },
    { trci_id: 25, trc_id: 1, trci_number: '5.25', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 1074/2558', remark: '-' },
    { trci_id: 26, trc_id: 1, trci_number: '5.26', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 7 เรื่อง)', case_ref: 'กปท.1,กอท.,ปปท.เขต 8 x5', remark: 'กรณีรับไว้ไต่สวน / อนุกรรมการเห็นสอดคล้อง' },
    { trci_id: 27, trc_id: 1, trci_number: '5.27', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 2 เรื่อง)', case_ref: 'ปปท.เขต 8,8', remark: 'อนุกรรมการเห็นแย้ง' },
    { trci_id: 28, trc_id: 1, trci_number: '5.28', category: 'preliminary', trci_topic: 'รายงานไต่สวนเบื้องต้น (ชุด 7 เรื่อง)', case_ref: 'กปท.2/ปปท.เขต 1,4,4,6,8,8', remark: 'กรณีรับไว้ไต่สวน / อนุกรรมการเห็นสอดคล้อง' },
    { trci_id: 29, trc_id: 1, trci_number: '5.29', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์', case_ref: 'เลขดำ 0384/2568', remark: '-' },
    { trci_id: 30, trc_id: 1, trci_number: '5.30', category: 'prosecutor',  trci_topic: 'ความเห็นกรณีอัยการมีคำสั่งไม่อุทธรณ์ (2 เรื่อง)', case_ref: 'เลขดำ 11372/2559, 10133/2560', remark: '-' }
  ];

  const CATEGORY_LABEL = {
    finding: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', preliminary: 'รายงานไต่สวนเบื้องต้น (ชุด/บัญชีแนบ)',
    policy: 'เรื่องเชิงนโยบาย/บริหารงาน', overdue: 'รายงานเกินกรอบระยะเวลา', prosecutor: 'ความเห็นอัยการ/กันบุคคลไว้เป็นพยาน'
  };
  const CATEGORY_CLASS = { finding: 'cat-finding', preliminary: 'cat-preliminary', policy: 'cat-policy', overdue: 'cat-overdue', prosecutor: 'cat-prosecutor' };
  const STATUS_LABEL = { '1': 'ประชุมแล้ว', '2': 'ยกเลิก/เลื่อน' };
  const STATUS_CLASS = { '1': 'meet-active', '2': 'meet-cancel' };

  /* ---------- sessionStorage persistence (เดียวกับแนวทางของ ECMIS.CASES) ---------- */
  const DATA_VERSION = '2026-08-18-agenda-registry-v1';
  if (typeof sessionStorage !== 'undefined') {
    const savedVersion = sessionStorage.getItem('ecmis_agenda_version');
    const savedMeetings = sessionStorage.getItem('ecmis_agenda_meetings');
    const savedItems = sessionStorage.getItem('ecmis_agenda_items');
    if (savedMeetings && savedItems && savedVersion === DATA_VERSION) {
      try {
        const parsedM = JSON.parse(savedMeetings);
        const parsedI = JSON.parse(savedItems);
        MEETINGS.length = 0; parsedM.forEach(m => MEETINGS.push(m));
        ITEMS.length = 0; parsedI.forEach(i => ITEMS.push(i));
      } catch (e) {
        console.error('Failed to load agenda registry data from sessionStorage:', e);
      }
    } else if (savedMeetings || savedItems) {
      sessionStorage.removeItem('ecmis_agenda_meetings');
      sessionStorage.removeItem('ecmis_agenda_items');
    }
  }
  function save() {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem('ecmis_agenda_meetings', JSON.stringify(MEETINGS));
    sessionStorage.setItem('ecmis_agenda_items', JSON.stringify(ITEMS));
    sessionStorage.setItem('ecmis_agenda_version', DATA_VERSION);
  }

  /* ---------- helpers ---------- */
  function meetingOf(item) { return MEETINGS.find(m => m.trc_id === item.trc_id); }
  function itemsOf(meetingId) { return ITEMS.filter(it => it.trc_id === meetingId); }
  function isFlagged(item) { return /ไม่ผ่าน|เห็นแย้ง/.test(item.remark || ''); }
  function isBundled(item) { return /ชุด|บัญชีแนบ|เรื่องรวม/.test(item.trci_topic) || /,/.test(item.case_ref); }
  function nextTrcId() { return MEETINGS.reduce((mx, m) => Math.max(mx, m.trc_id), 0) + 1; }
  function nextTrciId() { return ITEMS.reduce((mx, it) => Math.max(mx, it.trci_id), 0) + 1; }

  function renderCaseRef(text) {
    if (!text || text === '-') return '<span class="text-muted small">—</span>';
    const linked = text.replace(/(\d[\d]{1,6}\/\d{4})/g, m =>
      `<a class="case-chip" href="02-case-register.html?q=${encodeURIComponent(m)}" title="ค้นหาในทะเบียนสำนวน">${m}</a>`);
    return `<span class="small">${linked}</span>`;
  }

  /* ดึงข้อมูลสำนวนจากระบบด้วยเลขสำนวน — จำลองการอัตโนมัติแทนขั้นตอน
     "เจ้าหน้าที่ติดต่อประสานงานกับผู้รับผิดชอบเพื่อรวบรวมข้อมูล/เอกสารประกอบวาระ"
     ในผัง AS-IS (คัดข้อมูลจาก ECMIS.CASES โดยตรง ไม่ต้องติดต่อประสานงานเอง) */
  function lookupCaseForAgenda(caseId) {
    const kase = global.ECMIS.CASES.find(c => c.id === caseId.trim());
    if (!kase) return null;
    const resolvedLike = ['RESOLVED_PENDING', 'RESOLVED', 'DISPATCHING', 'CLOSED'].includes(kase.status);
    const category = resolvedLike ? 'finding' : 'preliminary';
    const topic = `รายงานไต่สวน${resolvedLike ? 'เพื่อวินิจฉัยชี้มูล' : 'เบื้องต้น'} กรณี ${kase.subject}`;
    const remarkParts = [];
    if (kase.prescription) remarkParts.push(`ครบอายุความ ${global.ECMIS.thaiDate(kase.prescription)}`);
    const statusLabel = global.ECMIS.STATUS[kase.status]?.label;
    if (statusLabel) remarkParts.push(statusLabel);
    return { category, topic, caseRef: kase.id, remark: remarkParts.join(' / ') || '-' };
  }

  global.AgendaRegistry = {
    MEETINGS, ITEMS, CATEGORY_LABEL, CATEGORY_CLASS, STATUS_LABEL, STATUS_CLASS,
    save, meetingOf, itemsOf, isFlagged, isBundled, nextTrcId, nextTrciId,
    renderCaseRef, lookupCaseForAgenda
  };

})(window);
