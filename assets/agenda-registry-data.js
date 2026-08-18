/* ===========================================================================
   agenda-registry-data.js — ข้อมูลและตรรกะที่ใช้ร่วมกันระหว่าง
   13-agenda-registry.html (ทะเบียน/รายการครั้งที่ประชุม) และ
   14-agenda-registry-detail.html (รายละเอียดวาระของครั้งที่ประชุมที่เลือก)

   เชื่อมต่อฐานข้อมูลจริงแล้ว (Supabase project ljhabbwjxnoucrcrsoii) ตาม
   โครงสร้าง res_db.json: tbl_res_calendar (trc_*) → tbl_res_calendar_item
   (trci_*) — กิจกรรมที่ 7 ตาม TOR คือ "พัฒนาระบบบริหารจัดการกระบวนงาน
   พิจารณาและดำเนินการตามมติคณะกรรมการ ป.ป.ท." (โมดูล res)

   หมายเหตุขอบเขต: การเชื่อมสำนวน (tbl_res_request → tbl_cmp_case ของ
   กิจกรรมที่ 4) ยังไม่รวมอยู่ในรอบนี้ เพราะ tbl_cmp_case ยังไม่มีในโปรเจกต์ —
   เลขที่เรื่อง (case_ref) จึงยังเก็บเป็น overlay ใน sessionStorage ไปก่อน
   จนกว่าจะต่อสำนวนจริงจากกิจกรรมที่ 5/6/10 (ตามที่ผู้ใช้งานยืนยัน ไม่ใช่
   กิจกรรมที่ 4 โดยตรง)
   =========================================================================== */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://ljhabbwjxnoucrcrsoii.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd';
  const sb = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const MEETINGS = [];
  const ITEMS = [];

  const CATEGORY_LABEL = {
    finding: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', preliminary: 'รายงานไต่สวนเบื้องต้น (ชุด/บัญชีแนบ)',
    policy: 'เรื่องเชิงนโยบาย/บริหารงาน', overdue: 'รายงานเกินกรอบระยะเวลา', prosecutor: 'ความเห็นอัยการ/กันบุคคลไว้เป็นพยาน'
  };
  const CATEGORY_CLASS = { finding: 'cat-finding', preliminary: 'cat-preliminary', policy: 'cat-policy', overdue: 'cat-overdue', prosecutor: 'cat-prosecutor' };
  const STATUS_LABEL = { '0': 'กำหนดการแล้ว — รอประชุม', '1': 'ประชุมแล้ว', '2': 'ยกเลิก/เลื่อน' };
  const STATUS_CLASS = { '0': 'meet-scheduled', '1': 'meet-active', '2': 'meet-cancel' };

  /* trc_date เก็บเป็นปี ค.ศ. จริงใน Supabase (คอลัมน์ type DATE) — โค้ดฝั่งนี้
     (และ ECMIS.thaiDate ที่ใช้ร่วมกันทั้งระบบ) คาดหวัง fake-ISO ปี พ.ศ. เสมอ
     จึงแปลง +543 เฉพาะตอนอ่านเข้ามาเป็น object ในเครื่อง ไม่แตะ thaiDate() เอง
     เพื่อไม่ให้กระทบหน้าอื่นที่ยังใช้ค่า fake-ISO แบบเดิม */
  function toBuddhistFakeIso(realIso) {
    if (!realIso) return '';
    const [y, m, d] = String(realIso).split('-');
    return `${parseInt(y, 10) + 543}-${m}-${d}`;
  }

  /* ---------- case_ref: ยังไม่มีคอลัมน์ในฐานข้อมูลจริง — การเชื่อมสำนวนต้องผ่าน
     tbl_res_calendar_item_case → tbl_res_request → tcc_id (tbl_cmp_case ของ
     กิจกรรมที่ 4) ซึ่งยังไม่ได้สร้างในโปรเจกต์นี้ เก็บเป็น overlay ใน
     sessionStorage คีย์ตาม trci_id ไปก่อน (ข้อมูลเรื่อง/สำนวนจริงในอนาคตจะมา
     จากกิจกรรมที่ 5/6/10 ตามที่วิเคราะห์ไว้ ไม่ใช่กิจกรรมที่ 4 โดยตรง) ---------- */
  const CASE_REF_KEY = 'ecmis_agenda_case_ref_overlay';
  function loadCaseRefOverlay() {
    try { return JSON.parse(sessionStorage.getItem(CASE_REF_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveCaseRefOverlay(map) {
    try { sessionStorage.setItem(CASE_REF_KEY, JSON.stringify(map)); } catch (e) { /* ignore */ }
  }
  function getCaseRef(trciId) {
    return loadCaseRefOverlay()[trciId] || '-';
  }
  function setCaseRef(trciId, value) {
    const map = loadCaseRefOverlay();
    map[trciId] = value;
    saveCaseRefOverlay(map);
  }

  function mapMeetingRow(row) {
    return {
      trc_id: row.trc_id, trc_name: row.trc_name || '',
      trc_date: toBuddhistFakeIso(row.trc_date), trc_status: row.trc_status || '0',
      trc_start_time: row.trc_start_time || '', trc_end_time: row.trc_end_time || '',
      trc_confirmed: !!row.trc_confirmed
    };
  }
  function mapItemRow(row) {
    return {
      trci_id: row.trci_id, trc_id: row.trc_id, trci_number: row.trci_number || '',
      category: row.category || 'finding', trci_topic: row.trci_topic || '',
      case_ref: getCaseRef(row.trci_id), remark: row.remark || '-'
    };
  }

  async function load() {
    const [{ data: mRows, error: mErr }, { data: iRows, error: iErr }] = await Promise.all([
      sb.from('tbl_res_calendar').select('*').eq('is_deleted', false).order('trc_id'),
      sb.from('tbl_res_calendar_item').select('*').eq('is_deleted', false).order('trci_id')
    ]);
    if (mErr) throw mErr;
    if (iErr) throw iErr;
    MEETINGS.length = 0; (mRows || []).forEach(r => MEETINGS.push(mapMeetingRow(r)));
    ITEMS.length = 0; (iRows || []).forEach(r => ITEMS.push(mapItemRow(r)));
  }

  const ready = load();

  /* ---------- helpers ---------- */
  function itemSortKey(it) {
    const parts = String(it.trci_number).split('.');
    return (parseFloat(parts[0]) || 0) * 1000 + (parseFloat(parts[1]) || 0);
  }
  function meetingOf(item) { return MEETINGS.find(m => m.trc_id === item.trc_id); }
  function itemsOf(meetingId) {
    return ITEMS.filter(it => it.trc_id === meetingId).sort((a, b) => itemSortKey(a) - itemSortKey(b));
  }
  function isFlagged(item) { return /ไม่ผ่าน|เห็นแย้ง/.test(item.remark || ''); }
  function isBundled(item) { return /ชุด|บัญชีแนบ|เรื่องรวม/.test(item.trci_topic) || /,/.test(item.case_ref); }

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

  /* ---------- mutations: เขียนลง Supabase จริง แล้วอัปเดต array ในเครื่อง ---------- */
  async function addMeeting({ trc_name, trc_date, trc_status, trc_start_time, trc_end_time }) {
    const role = global.ECMIS.currentRole();
    const { data, error } = await sb.from('tbl_res_calendar')
      .insert({
        trc_name, trc_date, trc_status,
        trc_start_time: trc_start_time || null, trc_end_time: trc_end_time || null,
        created_by: role.row, created_datetime: new Date().toISOString()
      })
      .select().single();
    if (error) throw error;
    const mapped = mapMeetingRow(data);
    MEETINGS.push(mapped);
    return mapped;
  }

  /* Soft delete — ตั้ง is_deleted = true เท่านั้น ข้อมูลยังอยู่ในฐานข้อมูลจริง
     เผื่อกรณีอยากสร้างครั้งที่ประชุมใหม่โดยไม่ต้องลบทิ้งถาวร */
  async function deleteMeeting(trcId) {
    const role = global.ECMIS.currentRole();
    const { error } = await sb.from('tbl_res_calendar')
      .update({ is_deleted: true, updated_by: role.row, updated_datetime: new Date().toISOString() })
      .eq('trc_id', trcId);
    if (error) throw error;
    const idx = MEETINGS.findIndex(m => m.trc_id === trcId);
    if (idx !== -1) MEETINGS.splice(idx, 1);
  }

  async function addItem({ trc_id, trci_number, category, trci_topic, case_ref, remark }) {
    const { data, error } = await sb.from('tbl_res_calendar_item')
      .insert({ trc_id, trci_number, category, trci_topic, remark })
      .select().single();
    if (error) throw error;
    setCaseRef(data.trci_id, case_ref || '-');
    const mapped = mapItemRow(data);
    ITEMS.push(mapped);
    return mapped;
  }

  async function updateItemNumber(trciId, newNumber) {
    const it = ITEMS.find(x => x.trci_id === trciId);
    if (!it) return;
    const { error } = await sb.from('tbl_res_calendar_item').update({ trci_number: newNumber }).eq('trci_id', trciId);
    if (error) throw error;
    it.trci_number = newNumber;
  }

  /* "เลื่อนขึ้น/ลง" หมายถึงสลับเลขวาระที่กับรายการข้างเคียงในครั้งที่ประชุม
     เดียวกัน (เรียงตาม trci_number) — DB ยังไม่มีคอลัมน์ลำดับแสดงผลแยก */
  async function swapItemNumber(trciId, dir) {
    const it = ITEMS.find(x => x.trci_id === trciId);
    if (!it) return false;
    const group = itemsOf(it.trc_id);
    const pos = group.findIndex(x => x.trci_id === trciId);
    const swapWith = group[pos + dir];
    if (!swapWith) return false;
    const a = it.trci_number, b = swapWith.trci_number;
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      sb.from('tbl_res_calendar_item').update({ trci_number: b }).eq('trci_id', it.trci_id),
      sb.from('tbl_res_calendar_item').update({ trci_number: a }).eq('trci_id', swapWith.trci_id)
    ]);
    if (e1 || e2) throw (e1 || e2);
    it.trci_number = b; swapWith.trci_number = a;
    return true;
  }

  global.AgendaRegistry = {
    MEETINGS, ITEMS, CATEGORY_LABEL, CATEGORY_CLASS, STATUS_LABEL, STATUS_CLASS,
    ready, meetingOf, itemsOf, isFlagged, isBundled,
    renderCaseRef, lookupCaseForAgenda,
    addMeeting, deleteMeeting, addItem, updateItemNumber, swapItemNumber, setCaseRef
  };

})(window);
