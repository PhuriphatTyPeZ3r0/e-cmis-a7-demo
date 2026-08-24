/* ===========================================================================
   agenda-registry-data.js — ข้อมูลและตรรกะที่ใช้ร่วมกันระหว่าง
   agenda-registry.html (ทะเบียน/รายการครั้งที่ประชุม) และ
   agenda-registry-detail.html (รายละเอียดวาระของครั้งที่ประชุมที่เลือก)

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
  if (!global.__ecmisSupabaseClient && global.supabase && typeof global.supabase.createClient === 'function') {
    global.__ecmisSupabaseClient = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }
  const sb = global.__ecmisSupabaseClient || (global.supabase && global.supabase.createClient ? global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } }) : null);

  const MEETINGS = [];
  const ITEMS = [];

  const CATEGORY_LABEL = {
    finding: 'รายงานไต่สวนเพื่อวินิจฉัยชี้มูล', preliminary: 'รายงานไต่สวนเบื้องต้น (ชุด/บัญชีแนบ)',
    policy: 'เรื่องเชิงนโยบาย/บริหารงาน', overdue: 'รายงานเกินกรอบระยะเวลา', prosecutor: 'ความเห็นอัยการ/กันบุคคลไว้เป็นพยาน'
  };
  const CATEGORY_CLASS = { finding: 'cat-finding', preliminary: 'cat-preliminary', policy: 'cat-policy', overdue: 'cat-overdue', prosecutor: 'cat-prosecutor' };
  const STATUS_LABEL = { '0': 'กำหนดการแล้ว — รอประชุม', '1': 'ประชุมแล้ว', '2': 'ยกเลิก/เลื่อน' };
  const STATUS_CLASS = { '0': 'meet-scheduled', '1': 'meet-active', '2': 'meet-cancel' };
  const STATUS_ICON = { '0': 'fa-calendar-days', '1': 'fa-circle-check', '2': 'fa-circle-xmark' };

  function meetingBadge(status, confirmed) {
    const st = String(status ?? '0');
    const label = STATUS_LABEL[st] || STATUS_LABEL['0'];
    const cls = STATUS_CLASS[st] || STATUS_CLASS['0'];
    const icon = STATUS_ICON[st] || STATUS_ICON['0'];
    let html = `<span class="meet-badge ${cls}"><i class="fa-solid ${icon} me-1"></i>${label}</span>`;
    if (confirmed) {
      html += ` <span class="meet-confirmed"><i class="fa-solid fa-clipboard-check me-1"></i>จัดวาระแล้ว</span>`;
    }
    return html;
  }

  /* trc_date เก็บเป็นปี ค.ศ. จริงใน Supabase (คอลัมน์ type DATE) — โค้ดฝั่งนี้
     (และ ECMIS.thaiDate ที่ใช้ร่วมกันทั้งระบบ) คาดหวัง fake-ISO ปี พ.ศ. เสมอ
     จึงแปลง +543 เฉพาะตอนอ่านเข้ามาเป็น object ในเครื่อง ไม่แตะ thaiDate() เอง
     เพื่อไม่ให้กระทบหน้าอื่นที่ยังใช้ค่า fake-ISO แบบเดิม */
  function toBuddhistFakeIso(realIso) {
    if (!realIso) return '';
    const [y, m, d] = String(realIso).split('-');
    return `${parseInt(y, 10) + 543}-${m}-${d}`;
  }

  /* ---------- case_ref: ตอนนี้เชื่อมจริงผ่าน tbl_res_calendar_item_case → tbl_res_request →
     tbl_cmp_case.tcc_no (RLS ของตารางเชื่อมนี้เพิ่งเปิดสิทธิ์ให้ anon select/insert — เดิม RLS
     เปิดอยู่แต่ไม่มี policy เลยสักอัน จึงเข้าถึงไม่ได้และไม่เคยถูกใช้งานจริง) เลขที่เรื่องที่พิมพ์เอง
     แล้วไม่พบสำนวนจริงในระบบ (อ้างอิงนอกระบบ) ยังคง fallback เป็น sessionStorage overlay เหมือนเดิม
     — case_ref ที่แสดงผลจึงเป็นการรวมกันของ 2 แหล่งนี้เสมอ ---------- */
  const CASE_REF_KEY = 'ecmis_agenda_case_ref_overlay';
  function getStorage() {
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) { /* ignore */ }
    try {
      if (typeof sessionStorage !== 'undefined') return sessionStorage;
    } catch (e) { /* ignore */ }
    return null;
  }
  function loadCaseRefOverlay() {
    try {
      const st = getStorage();
      return st ? JSON.parse(st.getItem(CASE_REF_KEY) || '{}') : {};
    } catch (e) { return {}; }
  }
  function saveCaseRefOverlay(map) {
    try {
      const st = getStorage();
      if (st) st.setItem(CASE_REF_KEY, JSON.stringify(map));
    } catch (e) { /* ignore */ }
  }
  function getUnresolvedCaseRef(trciId) {
    return loadCaseRefOverlay()[trciId] || '';
  }
  function setUnresolvedCaseRef(trciId, value) {
    const map = loadCaseRefOverlay();
    if (value) map[trciId] = value; else delete map[trciId];
    saveCaseRefOverlay(map);
  }

  /* trci_id -> [เลขสำนวนจริง, ...] ที่เชื่อมผ่าน tbl_res_calendar_item_case จริง (โหลดใน load()) */
  const LINKED_CASE_NOS = {};
  /* trr_id -> true สำหรับสำนวนที่ถูกบรรจุวาระแล้ว (มี link จริง) — ใช้กันคิวรอบรรจุวาระ
     ไม่ให้แสดงเรื่องที่บรรจุวาระไปแล้วซ้ำ แม้ trr_status ยังไม่ถูกอัปเดตตาม */
  const LINKED_TRR_IDS = new Set();

  function combinedCaseRef(trciId) {
    const parts = [...(LINKED_CASE_NOS[trciId] || [])];
    const unresolved = getUnresolvedCaseRef(trciId);
    if (unresolved) parts.push(...unresolved.split(',').map(s => s.trim()).filter(Boolean));
    return parts.length ? parts.join(', ') : '-';
  }

  async function resolveCaseNoToTrrId(caseNo) {
    const { data, error } = await sb
      .from('tbl_res_request')
      .select('trr_id, tbl_cmp_case!inner(tcc_no)')
      .eq('tbl_cmp_case.tcc_no', caseNo)
      .eq('is_deleted', false)
      .maybeSingle();
    if (error) throw error;
    return data ? data.trr_id : null;
  }

  /* owner/org overlay from localStorage or case metadata */
  const OWNER_ORG_KEY = 'ecmis_agenda_owner_org_overlay';
  function loadOwnerOrgOverlay() {
    try {
      const st = getStorage();
      return st ? JSON.parse(st.getItem(OWNER_ORG_KEY) || '{}') : {};
    } catch (e) { return {}; }
  }
  function saveOwnerOrgOverlay(map) {
    try {
      const st = getStorage();
      if (st) st.setItem(OWNER_ORG_KEY, JSON.stringify(map));
    } catch (e) { /* ignore */ }
  }
  function getOwnerOrg(trciId) {
    return loadOwnerOrgOverlay()[trciId] || { owner: '', org: '' };
  }
  function setOwnerOrg(trciId, owner, org) {
    const map = loadOwnerOrgOverlay();
    map[trciId] = { owner: owner || '', org: org || '' };
    saveOwnerOrgOverlay(map);
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
    const oo = getOwnerOrg(row.trci_id);
    const caseRef = combinedCaseRef(row.trci_id);
    let owner = oo.owner || row.owner || '';
    let org = oo.org || row.org || '';

    // If still empty and there is a case_ref, attempt auto-fill from ECMIS.CASES
    if ((!owner || !org) && caseRef && caseRef !== '-') {
      const firstNo = caseRef.split(',')[0].trim();
      const mock = (global.ECMIS && global.ECMIS.CASES) ? global.ECMIS.CASES.find(c => c.id === firstNo) : null;
      if (mock) {
        if (!owner) owner = mock.owner || '';
        if (!org) org = mock.ownerOrg || '';
      }
    }
    // Fallback for general meeting items (e.g. วาระ 2 หรือ 3)
    if (!owner && (!caseRef || caseRef === '-')) {
      owner = 'ฝ่ายเลขานุการคณะกรรมการ ป.ป.ท.';
      org = 'กองบริหารคดี / ฝ่ายเลขาฯ';
    }

    return {
      trci_id: row.trci_id, trc_id: row.trc_id, trci_number: row.trci_number || '',
      category: row.category || 'finding', trci_topic: row.trci_topic || '',
      case_ref: caseRef,
      owner: owner || '-',
      org: org || '-',
      remark: row.remark || '-'
    };
  }

  async function load() {
    const [{ data: mRows, error: mErr }, { data: iRows, error: iErr }, { data: licRows, error: licErr }] = await Promise.all([
      sb.from('tbl_res_calendar').select('*').eq('is_deleted', false).order('trc_id'),
      sb.from('tbl_res_calendar_item').select('*').eq('is_deleted', false).order('trci_id'),
      sb.from('tbl_res_calendar_item_case')
        .select('trci_id, trr_id, tbl_res_request!inner(tbl_cmp_case!inner(tcc_no))')
        .eq('is_deleted', false)
    ]);
    if (mErr) throw mErr;
    if (iErr) throw iErr;
    if (licErr) throw licErr;
    MEETINGS.length = 0; (mRows || []).forEach(r => MEETINGS.push(mapMeetingRow(r)));

    Object.keys(LINKED_CASE_NOS).forEach(k => delete LINKED_CASE_NOS[k]);
    LINKED_TRR_IDS.clear();
    (licRows || []).forEach(r => {
      const caseNo = r.tbl_res_request && r.tbl_res_request.tbl_cmp_case && r.tbl_res_request.tbl_cmp_case.tcc_no;
      if (!caseNo) return;
      (LINKED_CASE_NOS[r.trci_id] = LINKED_CASE_NOS[r.trci_id] || []).push(caseNo);
      LINKED_TRR_IDS.add(r.trr_id);
    });

    ITEMS.length = 0; (iRows || []).forEach(r => ITEMS.push(mapItemRow(r)));
  }

  const ready = load();

  /* ---------- helpers ---------- */
  function itemSortKey(it) {
    if (!it || it.trci_number === undefined) return 0;
    const arabic = (global.ECMIS && global.ECMIS.toArabicDigits) ? global.ECMIS.toArabicDigits(String(it.trci_number)) : String(it.trci_number);
    const clean = arabic.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const maj = parseFloat(parts[0]);
    const min = parseFloat(parts[1]);
    return (isNaN(maj) ? 0 : maj) * 1000 + (isNaN(min) ? 0 : min);
  }
  function meetingOf(item) { return MEETINGS.find(m => m.trc_id === item.trc_id); }
  function itemsOf(meetingId) {
    return ITEMS.filter(it => it.trc_id === meetingId).sort((a, b) => itemSortKey(a) - itemSortKey(b));
  }
  function isFlagged(item) { return /ไม่ผ่าน|เห็นแย้ง/.test(item.remark || ''); }
  function isBundled(item) { return /ชุด|บัญชีแนบ|เรื่องรวม/.test(item.trci_topic) || /,/.test(item.case_ref); }

  function renderCaseRef(text) {
    if (!text || text === '-') return '<span class="text-muted small">—</span>';
    const target = (global.ECMIS && global.ECMIS.resolvePage) ? global.ECMIS.resolvePage('case-register.html') : 'case-register.html';
    const linked = text.replace(/(\d[\d]{1,6}\/\d{4})/g, m =>
      `<a class="case-chip" href="${target}?q=${encodeURIComponent(m)}" title="ค้นหาในทะเบียนสำนวน">${m}</a>`);
    return `<span class="small">${linked}</span>`;
  }

  /* ดึงข้อมูลสำนวนจากระบบด้วยเลขสำนวน — จำลองการอัตโนมัติแทนขั้นตอน
     "เจ้าหน้าที่ติดต่อประสานงานกับผู้รับผิดชอบเพื่อรวบรวมข้อมูล/เอกสารประกอบวาระ"
     ในผัง AS-IS (คิวเรื่อง ณ ฐานข้อมูลจริง — เดิมค้นจาก ECMIS.CASES mock ทำให้เรื่องที่มีจริงใน
     Supabase แต่ไม่อยู่ใน mock array ค้นไม่เจอ) */
  async function lookupCaseForAgenda(caseId) {
    const trimmed = String(caseId || '').trim();
    if (!trimmed) return null;
    const { data, error } = await sb
      .from('tbl_res_request')
      .select('*, tbl_cmp_case!inner(*)')
      .eq('tbl_cmp_case.tcc_no', trimmed)
      .eq('is_deleted', false)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const mock = (global.ECMIS && global.ECMIS.CASES) ? global.ECMIS.CASES.find(c => c.id === trimmed) : null;
      if (mock) {
        const resolvedLike = ['RESOLVED_PENDING', 'RESOLVED', 'DISPATCHING', 'CLOSED'].includes(mock.status);
        const category = mock.docType === 'GENERAL' ? 'policy' : (resolvedLike ? 'finding' : 'preliminary');
        const topic = mock.docType === 'GENERAL' ? mock.subject : `รายงานไต่สวน${resolvedLike ? 'เพื่อวินิจฉัยชี้มูล' : 'เบื้องต้น'} กรณี ${mock.subject}`;
        const remarkParts = [];
        if (mock.prescription && mock.prescription !== '—') remarkParts.push(`ครบอายุความ ${global.ECMIS.thaiDate(mock.prescription)}`);
        const statusLabel = global.ECMIS.STATUS[mock.status]?.label;
        if (statusLabel) remarkParts.push(statusLabel);
        return {
          category, topic, caseRef: mock.id,
          owner: mock.owner || '', org: mock.ownerOrg || '',
          remark: remarkParts.join(' / ') || '-'
        };
      }
      return null;
    }
    const cc = data.tbl_cmp_case;
    const kase = global.ECMIS.supabaseRowToCase(data);
    const resolvedLike = ['RESOLVED_PENDING', 'RESOLVED', 'DISPATCHING', 'CLOSED'].includes(kase.status);
    const category = kase.docType === 'GENERAL' ? 'policy' : (resolvedLike ? 'finding' : 'preliminary');
    const topic = kase.docType === 'GENERAL' ? kase.subject : `รายงานไต่สวน${resolvedLike ? 'เพื่อวินิจฉัยชี้มูล' : 'เบื้องต้น'} กรณี ${kase.subject}`;
    const remarkParts = [];
    if (kase.prescription && kase.prescription !== '—') remarkParts.push(`ครบอายุความ ${global.ECMIS.thaiDate(kase.prescription)}`);
    const statusLabel = global.ECMIS.STATUS[kase.status]?.label;
    if (statusLabel) remarkParts.push(statusLabel);
    return {
      category, topic, caseRef: cc.tcc_no,
      owner: kase.owner || '', org: kase.ownerOrg || '',
      remark: remarkParts.join(' / ') || '-'
    };
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

  /* จัดวาระแล้ว (agenda-meeting-docs.html) — trc_confirmed เป็นคอลัมน์จริง เขียนกลับ Supabase
     ทันที ส่วนรายละเอียดหนังสือเชิญประชุม (เลขที่หนังสือ/วันที่ออกหนังสือ/เวลา/สถานที่/ผู้ลงนาม ฯลฯ)
     ยังไม่มีคอลัมน์ใน tbl_res_calendar จึงยังคงเป็น local state บนหน้านั้นเท่านั้น */
  async function confirmMeeting(trcId) {
    const role = global.ECMIS.currentRole();
    const { error } = await sb.from('tbl_res_calendar')
      .update({ trc_confirmed: true, updated_by: role.row, updated_datetime: new Date().toISOString() })
      .eq('trc_id', trcId);
    if (error) throw error;
    const m = MEETINGS.find(x => x.trc_id === trcId);
    if (m) m.trc_confirmed = true;
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

  async function addItem({ trc_id, trci_number, category, trci_topic, case_ref, owner, org, remark }) {
    const { data, error } = await sb.from('tbl_res_calendar_item')
      .insert({ trc_id, trci_number, category, trci_topic, remark })
      .select().single();
    if (error) throw error;

    if (owner || org) {
      setOwnerOrg(data.trci_id, owner, org);
    }

    /* เชื่อมสำนวนจริงเข้า tbl_res_calendar_item_case ถ้าเลขที่เรื่องมีอยู่จริงในระบบ — เลขที่ไม่พบ
       (พิมพ์เอง/อ้างอิงนอกระบบ) เก็บ fallback เป็น sessionStorage overlay เหมือนพฤติกรรมเดิม */
    const caseNos = String(case_ref || '').split(',').map(s => s.trim()).filter(s => s && s !== '-');
    const unresolved = [];
    const linkedNos = [];
    for (const caseNo of caseNos) {
      let trrId = null;
      try { trrId = await resolveCaseNoToTrrId(caseNo); } catch (e) { console.error('ค้นหาสำนวนไม่สำเร็จ:', e); }
      if (trrId) {
        const { error: linkErr } = await sb.from('tbl_res_calendar_item_case')
          .insert({ trci_id: data.trci_id, trr_id: trrId });
        if (linkErr) { console.error('เชื่อมสำนวนกับวาระไม่สำเร็จ:', linkErr); unresolved.push(caseNo); }
        else { linkedNos.push(caseNo); LINKED_TRR_IDS.add(trrId); }
      } else {
        unresolved.push(caseNo);
      }
    }
    if (linkedNos.length) LINKED_CASE_NOS[data.trci_id] = linkedNos;
    setUnresolvedCaseRef(data.trci_id, unresolved.join(', '));

    const mapped = mapItemRow(data);
    ITEMS.push(mapped);
    return mapped;
  }

  /* Soft delete — ตั้ง is_deleted = true เท่านั้น ข้อมูลยังอยู่ในฐานข้อมูลจริง
     เผื่อกรณีอยากสร้างวาระใหม่แทนโดยไม่ต้องลบทิ้งถาวร */
  async function deleteItem(trciId) {
    const role = global.ECMIS.currentRole();
    const { error } = await sb.from('tbl_res_calendar_item')
      .update({ is_deleted: true, updated_by: role.row, updated_datetime: new Date().toISOString() })
      .eq('trci_id', trciId);
    if (error) throw error;
    const idx = ITEMS.findIndex(x => x.trci_id === trciId);
    if (idx !== -1) ITEMS.splice(idx, 1);
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
    sb, MEETINGS, ITEMS, LINKED_TRR_IDS, CATEGORY_LABEL, CATEGORY_CLASS, STATUS_LABEL, STATUS_CLASS, STATUS_ICON, meetingBadge,
    ready, meetingOf, itemsOf, isFlagged, isBundled, itemSortKey,
    renderCaseRef, lookupCaseForAgenda, resolveCaseNoToTrrId, getOwnerOrg, setOwnerOrg,
    addMeeting, deleteMeeting, addItem, deleteItem, updateItemNumber, swapItemNumber, confirmMeeting
  };

})(window);
