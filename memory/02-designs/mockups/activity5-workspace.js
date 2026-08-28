/* E-CMIS กิจกรรมที่ 5 — ระบบกระบวนการดำเนินงานเรื่องร้องเรียนกล่าวหา
 * แนวทางเดียวกับ activity4-workspace.js (IIFE เดียว, render-string, SweetAlert,
 * localStorage ร่วมกับกิจกรรมที่ 4 — สำนวนเดียวต่อเนื่อง ไม่มีรอยต่อ)
 *
 * ครอบคลุม 17 กระบวนงานตามกระบวนการไต่สวน.xlsx (sheet6):
 *  1 รับเรื่อง/ตรวจ/มอบหมาย (+โอนก่อนมอบหมาย สถานะรอปลายทางรับโอน)  2 ไต่สวนเบื้องต้น 213
 *  3 กิจกรรมแทรก (คุ้มครองพยาน A6 / บันทึกงานหมายค้นภายใน A5)        4 ขยายเวลา 213 (2 รอบปกติ)
 *  5 213 ใช้รอบปกติครบ → รายงานเหตุล่าช้าเสนอ คกก.                    6 ตรวจ/เสนอ 213 ตามลำดับชั้น 4 ชั้น
 *  7 ผลมติ 213 (+ตั้งชุดไต่สวน 24ว.1/24ว.3, หนังสือส่งมอบ 213→644)    8 ไต่สวนชี้มูล 644
 *  9 ขยายเวลา 644 (4 รอบปกติ; หลังจากนั้น block รอ authority)          10 ตรวจ/เสนอ 644 ตามลำดับชั้น
 * 11 ผลมติ 644 (7 ทาง, ไต่เพิ่ม 30+30)                               12 อัยการสั่งการ/ตีกลับ
 * 13 โอน/รวม/แยก/เปลี่ยนผู้รับผิดชอบ/ปรับองค์คณะ                     14 คดี ม.62 (ป.ป.ช. มอบหมาย + ม.65)
 * 15 ตรวจสอบข้อเท็จจริง 58/2                                        16 ตรวจสอบข้อเท็จจริง 58/3
 * 17 (สถิติ/รายงาน — view รายการ)
 */
(() => {
  const STORAGE_KEY = 'ecmis-a4-workspace-v3';
  const LEGACY_A5_KEY = 'activity5-mockup-state-v4';
  const LEGACY_HANDOFF_KEY = 'ecmis-a4-a5-handoffs-v1';
  const MIGRATED_KEY = 'ecmis-a5-migrated-v1';
  const ROLE_KEY = 'ecmis-a4-role';
  const A5_ROLE_KEY = 'ecmis-a5-role';
  const A5_ACCOUNT_KEY = 'ecmis-a5-current-account';
  const A5_ASSIGNMENT_SELECTIONS = new Map();
  const A5_ASSIGNMENT_FOCUS = new Map();
  let A5_EXTENSION_RETURN_FOCUS_ACTION = '';

  const ROLE_LABELS = {
    clerk: 'ธุรการคดี',
    investigator: 'ผู้รับผิดชอบสำนวน (นักสืบ)',
    'group-director': 'ผอ.กลุ่มงาน (สายตรวจ)',
    director: 'ผอ.สำนักงาน ป.ป.ท. เขต/กอง/สำนัก',
    secretary: 'ผู้ช่วย/รอง/เลขาธิการ ป.ป.ท.',
    committee: 'คณะกรรมการ ป.ป.ท.',
    anonymous: 'กล่องบัตรสนเท่ห์'
  };
  const ROLE_ORDER = ['clerk', 'investigator', 'group-director', 'director', 'secretary', 'committee', 'anonymous'];
  const UNITS = ['ส่วนกลาง', 'เขต 1', 'เขต 2', 'เขต 3', 'เขต 4', 'เขต 5', 'เขต 6', 'เขต 7', 'เขต 8', 'เขต 9',
    'กปท.1', 'กปท.2', 'กปท.3', 'กปท.4', 'กปท.5', 'กอท.'];
  const INVESTIGATORS = ['พนักงาน ป.ป.ท. สมชาย', 'พนักงาน ป.ป.ท. วิภา', 'พนักงาน ป.ป.ท. ธเนศ', 'พนักงาน ป.ป.ท. จินตนา', 'พนักงาน ป.ป.ท. อนุชา'];
  const MOCK_INVESTIGATOR_PROFILES = Object.freeze(INVESTIGATORS.map((name, index) => Object.freeze({
    id: `mock-investigator-${index + 1}`,
    name,
    unit: 'เขต 2',
    available: true,
    activeCaseCount: index + 1,
    weightedWorkload: index + 1,
    complexityCapacity: Math.min(5, index + 2),
    experienceTags: index % 2 ? ['การเงิน'] : ['จัดซื้อจัดจ้าง', 'การเงิน']
  })));
  function officerDisplayNameA5(value, state = {}) {
    const officerId = String(value || '').trim();
    const assignment = state.assignment || {};
    const explicitName = String(assignment.primaryOfficerName || assignment.approvedOfficerName || '').trim();
    if (explicitName) return explicitName;
    const profile = MOCK_INVESTIGATOR_PROFILES.find(candidate => candidate.id === officerId);
    if (profile) return profile.name;
    if (!officerId) return 'ยังไม่ระบุผู้รับผิดชอบ';
    if (/^(mock-|[a-z]+[-_:]?\d)/i.test(officerId)) return 'ยังไม่ระบุชื่อผู้รับผิดชอบ';
    return officerId;
  }
  function currentA5Account() {
    const authAccount = globalThis.ECMISCurrentAccount;
    if (authAccount?.officerId && authAccount?.name) return { officerId: String(authAccount.officerId), name: String(authAccount.name), source: 'adapter' };
    try {
      const stored = JSON.parse(sessionStorage.getItem(A5_ACCOUNT_KEY) || 'null');
      const profile = MOCK_INVESTIGATOR_PROFILES.find(candidate => candidate.id === stored?.officerId);
      if (profile) return { officerId: profile.id, name: profile.name, source: 'mock' };
    } catch { return null; }
    return null;
  }
  function setCurrentA5MockAccount(officerId) {
    const profile = MOCK_INVESTIGATOR_PROFILES.find(candidate => candidate.id === String(officerId || ''));
    try {
      if (!profile) {
        sessionStorage.removeItem(A5_ACCOUNT_KEY);
        return false;
      }
      sessionStorage.setItem(A5_ACCOUNT_KEY, JSON.stringify({ officerId: profile.id, name: profile.name, mock: true }));
      return true;
    } catch {
      return false;
    }
  }
  function mockAccountSelectorA5(role) {
    if (role !== 'investigator') return '';
    const adapterAccount = globalThis.ECMISCurrentAccount;
    if (adapterAccount?.officerId && adapterAccount?.name) {
      return `<div class="a5-mock-account"><span>บัญชีทดสอบจาก adapter</span><strong>${escapeHtml(adapterAccount.name)}</strong></div>`;
    }
    const current = currentA5Account();
    const options = MOCK_INVESTIGATOR_PROFILES.map(profile => `<option value="${profile.id}" ${current?.officerId === profile.id ? 'selected' : ''}>${escapeHtml(profile.name)}</option>`).join('');
    return `<label class="a5-mock-account" for="a5MockAccount"><span>บัญชีผู้ใช้งานจำลอง</span><select id="a5MockAccount"><option value="">เลือกบัญชี Mock up</option>${options}</select></label>`;
  }
  const EXTENSION_RULES = Object.freeze({
    '213': { baseDays: 60, rounds: ['director', 'secretary'], label: 'ไต่สวนเบื้องต้น (213)' },
    '644': { baseDays: 270, rounds: ['director', 'director', 'secretary', 'secretary'], label: 'ไต่สวนชี้มูล (644)' }
  });
  const EXTENSION_DAYS = 60;
  const A5_FORMS = Object.freeze({
    plan: { code: 'แบบ ปปท. 1', name: 'แผนงานคดี (ไต่สวนเบื้องต้น/ไต่สวน)' },
    '213': { code: 'แบบ ปปท. 4', name: 'รายงานผลการไต่สวนเบื้องต้น' },
    ext213: { code: 'แบบ ปปท. 2', name: 'บันทึกขอขยายระยะเวลาไต่สวนเบื้องต้น' },
    '644': { code: 'แบบ ปปท. 7', name: 'รายงานการไต่สวน' },
    ext644: { code: 'แบบ ปปท. 3', name: 'บันทึกขอขยายระยะเวลาไต่สวน' },
    notice: { code: 'แบบ ปปท. 5', name: 'หนังสือแจ้งให้รับทราบข้อกล่าวหาและสิทธิคัดค้าน' },
    record: { code: 'แบบ ปปท. 6', name: 'บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้าน' },
    mti: { code: 'แบบมติ คกก.', name: 'มติคณะกรรมการ ป.ป.ท.' },
    letter: { code: 'หนังสือส่ง', name: 'หนังสือส่งสำนวนคดี' },
    p8: { code: 'แบบ ปปท. 8', name: 'หนังสือแจ้งผู้ถูกกล่าวหาไปพบพนักงานอัยการ' },
    p9: { code: 'แบบ ปปท. 9', name: 'หนังสือแจ้งผู้บังคับบัญชา (ยังไม่พบอัยการ)' },
    p10: { code: 'แบบ ปปท. 10', name: 'หนังสือแจ้งพนักงานอัยการ' },
    p11: { code: 'แบบ ปปท. 11', name: 'คำร้องขอหมายจับ' },
    p12: { code: 'แบบ ปปท. 12', name: 'บันทึกคำเบิกความ' },
    p13: { code: 'แบบ ปปท. 13', name: 'รายงานกระบวนการพิจารณา' },
    p14: { code: 'แบบ ปปท. 14', name: 'หมายจับ (อายุความไม่สะดุดหยุดลง)' },
    p15: { code: 'แบบ ปปท. 15', name: 'หมายจับ (อายุความสะดุดหยุดลง)' },
    p16: { code: 'แบบ ปปท. 16', name: 'ตำหนิรูปพรรณผู้กระทำความผิด' },
    p17: { code: 'แบบ ปปท. 17', name: 'หนังสือแจ้งผลการดำเนินการว่าออกหมายแล้ว' },
    p18: { code: 'แบบ ปปท. 18', name: 'หนังสือแจ้งผู้บัญชาการตำรวจแห่งชาติ' },
    p19: { code: 'แบบ ปปท. 19', name: 'บันทึกข้อความส่งหมายจับให้ กอท.' },
    p20: { code: 'แบบ ปปท. 20', name: 'ผนึกซองขอหมายจับ' }
  });
  const A5_LETTER_HEAD = (state, topic) => {
    const c = state.caseData || {}, q = state.inquiry?.inquiry644 || {};
    return `<p class="a5-letter-ref"><strong>ที่ ปป ..........</strong></p><p class="a5-letter-addr">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐</p><p class="a5-letter-date">${a5Date(todayISO())}</p><p class="a5-letter-topic"><strong>เรื่อง</strong> ${topic}</p><p class="a5-letter-to"><strong>เรียน</strong> ${a5Fill('')}</p>`;
  };
  const a5AccusedLine = (state) => {
    const q = state.inquiry?.inquiry644 || {};
    return (q.accused && q.accused.length) ? q.accused.join(', ') : '...............................';
  };
  const REVIEW_CHAIN = Object.freeze({
    '213': [
      { level: 1, role: 'group-director', label: 'ผอ.กลุ่มงาน (เฉพาะสายจริง)', optional: true },
      { level: 2, role: 'director', label: 'ผอ.สำนักงาน ป.ป.ท. เขต/กอง/สำนัก' },
      { level: 3, role: 'secretary', label: 'ผู้ช่วย/รองเลขาธิการ ป.ป.ท.' },
      { level: 4, role: 'secretary', label: 'เลขาธิการ ป.ป.ท.' }
    ],
    '644': [
      { level: 1, role: 'group-director', label: 'ผอ.กลุ่มงาน (เฉพาะสายจริง)', optional: true },
      { level: 2, role: 'director', label: 'ผอ.สำนักงาน ป.ป.ท. เขต/กอง/สำนัก' },
      { level: 3, role: 'secretary', label: 'ผู้ช่วย/รองเลขาธิการ ป.ป.ท.' },
      { level: 4, role: 'secretary', label: 'เลขาธิการ ป.ป.ท.' }
    ]
  });
  const MTI_213_RESULTS = ['รับไว้ไต่สวน', 'ไม่รับไว้ไต่สวน', 'ให้ไต่สวนเบื้องต้นเพิ่มเติม', 'ส่งสำนักงาน ป.ป.ช.'];
  const MTI_644_RESULTS = ['ชี้มูลความผิดอาญาและวินัย', 'ชี้มูลความผิดวินัย', 'ชี้มูลคดีประพฤติมิชอบ ม.18/4', 'ข้อกล่าวหาไม่มีมูล/สิทธิฟ้องระงับ', 'ส่งสำนักงาน ป.ป.ช.', 'ส่งพนักงานสอบสวน', 'ให้ไต่สวนชี้มูลเพิ่มเติม'];
  const PROSECUTOR_ORDERS = ['เพิ่มผู้ถูกกล่าวหา', 'แจ้งข้อกล่าวหาเพิ่มเติม', 'แยกสำนวน / แยกรายงาน 644', 'ไต่สวนข้อเท็จจริงเพิ่มเติม'];
  const THAI_MONTHS = { มกราคม: 1, กุมภาพันธ์: 2, มีนาคม: 3, เมษายน: 4, พฤษภาคม: 5, มิถุนายน: 6, กรกฎาคม: 7, สิงหาคม: 8, กันยายน: 9, ตุลาคม: 10, พฤศจิกายน: 11, ธันวาคม: 12, 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };

  const $ = (s, root = document) => root?.querySelector(s);
  const $$ = (s, root = document) => [...(root?.querySelectorAll(s) || [])];
  const escapeHtml = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const addDays = (iso, days) => { const [y, m, d] = String(iso || '').slice(0, 10).split('-').map(Number); if (!y || !m || !d) return ''; const dt = new Date(y, m - 1, d + days); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; };
  const daysLeft = (deadlineIso) => { if (!deadlineIso) return null; const ms = new Date(deadlineIso + 'T23:59:59') - Date.now(); return Math.ceil(ms / 864e5); };
  const parseThaiDate = (value) => { const m = String(value || '').match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/); if (!m) return ''; const mo = THAI_MONTHS[m[2]]; if (!mo) return ''; return `${Number(m[3]) - 543}-${String(mo).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`; };

  // Phase 0 Task 3: every localStorage write below that carries case/legal
  // state routes through globalThis.ECMISActivity5Phase0Guard.assertWritable()
  // first. This is the single chokepoint (Section 4.1 "persistence เกิดหลัง
  // command สำเร็จเท่านั้น"): if the guard isn't loaded (e.g. older test
  // harnesses that don't require activity5-phase0-guard.js), the check is a
  // no-op and behaviour is unchanged. See assets/activity5-phase0-guard.js
  // for the HARD_BLOCK definition and the deny-list contract Task 4 owns.
  const A5_SEED_CASES = {"0001/2569": {"caseData": {"id": "0001/2569", "trackingYear": "69/7580", "trackingCode": "7580", "subject": "เรื่องที่ 1 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 1", "agency": "หน่วยงาน 1", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0002/2569": {"caseData": {"id": "0002/2569", "trackingYear": "69/6098", "trackingCode": "6098", "subject": "เรื่องที่ 2 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 2", "agency": "หน่วยงาน 2", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0003/2569": {"caseData": {"id": "0003/2569", "trackingYear": "69/6192", "trackingCode": "6192", "subject": "เรื่องที่ 3 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 3", "agency": "หน่วยงาน 3", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0004/2569": {"caseData": {"id": "0004/2569", "trackingYear": "69/3203", "trackingCode": "3203", "subject": "เรื่องที่ 4 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 4", "agency": "หน่วยงาน 4", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0005/2569": {"caseData": {"id": "0005/2569", "trackingYear": "69/5289", "trackingCode": "5289", "subject": "เรื่องที่ 5 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 5", "agency": "หน่วยงาน 5", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0006/2569": {"caseData": {"id": "0006/2569", "trackingYear": "69/4403", "trackingCode": "4403", "subject": "เรื่องที่ 6 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 6", "agency": "หน่วยงาน 6", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0007/2569": {"caseData": {"id": "0007/2569", "trackingYear": "69/3629", "trackingCode": "3629", "subject": "เรื่องที่ 7 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 7", "agency": "หน่วยงาน 7", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0008/2569": {"caseData": {"id": "0008/2569", "trackingYear": "69/9766", "trackingCode": "9766", "subject": "เรื่องที่ 8 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 8", "agency": "หน่วยงาน 8", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0009/2569": {"caseData": {"id": "0009/2569", "trackingYear": "69/5839", "trackingCode": "5839", "subject": "เรื่องที่ 9 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 9", "agency": "หน่วยงาน 9", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}, "0010/2569": {"caseData": {"id": "0010/2569", "trackingYear": "69/1713", "trackingCode": "1713", "subject": "เรื่องที่ 10 — ตัวอย่างคดีสำหรับการไต่สวน", "complainant": "ผู้ร้อง 10", "agency": "หน่วยงาน 10", "region": "ส่วนกลาง", "channel": "Walk In", "receivedFirstAt": "2026-08-17"}, "workflow": {"stage": "a5-intake", "a5Status": "INTAKE_SUBMITTED", "status": "INTAKE_SUBMITTED"}, "inquiry": {"intake": {"unit": "ปราบ 1", "investigator": "investig-001", "receivedFirstAt": "2026-08-17", "orderNo": "", "orderDate": ""}, "prelim": {"startedAt": "2026-08-17", "deadlineAt": "2026-10-16", "planStatus": "draft"}, "inquiry644": {"startedAt": "", "deadlineAt": "", "status": "รอคำสั่งแต่งตั้ง"}}, "assignment": {"primaryOfficerId": "investig-001", "legalOwner": "investig-001", "assignmentVersion": 1, "acceptedAssignmentVersion": 1}, "a5DocumentStore": {"version": 1, "records": []}, "caseAdministration": {"caseSize": "UNDETERMINED", "xlRequest": {"status": ""}}, "decisionHistory": [], "custody": {"status": "AT_SOURCE", "holder": "สำนักงาน", "hasOriginal": false, "history": []}, "returnRoute": {"status": "", "destination": ""}, "documentData": {}, "activity4Payload": null}};
  function readStore() { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw || raw === '{}') { localStorage.setItem(STORAGE_KEY, JSON.stringify(A5_SEED_CASES)); return JSON.parse(JSON.stringify(A5_SEED_CASES)); } return JSON.parse(raw || '{}'); } catch { return {}; } }
  function writeStore(store) {
    globalThis.ECMISActivity5Phase0Guard?.assertWritable();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  function readLegacy(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }
  function getState(id) {
    const store = readStore();
    const resolvedId = resolveA5CaseId(store, id) || id;
    const s = store[resolvedId] || null;
    if (s && normalizeIncomingCase(s)) writeStore(store);
    return s;
  }
  function saveState(id, state) {
    globalThis.ECMISActivity5Phase0Guard?.assertWritable();
    const store = readStore(); store[id] = state; writeStore(store);
  }
  function issueOrderNo213() {
    globalThis.ECMISActivity5Phase0Guard?.assertWritable();
    const buddhistYear = new Date().getFullYear() + 543;
    const key = `ecmis-a5-order213-sequence-${buddhistYear}`;
    const next = Math.max(1, Number(localStorage.getItem(key) || 0) + 1);
    localStorage.setItem(key, String(next));
    return `คำสั่งที่ ${next}/${buddhistYear}`;
  }
  function issueSplitCaseId() {
    globalThis.ECMISActivity5Phase0Guard?.assertWritable();
    const buddhistYear = new Date().getFullYear() + 543;
    const key = `ecmis-a5-split-case-sequence-${buddhistYear}`;
    const next = Math.max(1, Number(localStorage.getItem(key) || 0) + 1);
    localStorage.setItem(key, String(next));
    return `${String(next).padStart(4, '0')}/${buddhistYear}`;
  }
  function notify(icon, title, text) { if (window.Swal) return Swal.fire({ icon, title, text, confirmButtonText: 'ปิด', confirmButtonColor: '#082b50' }); alert(`${title}\n${text}`); }
  const A5_FIELD_PRESENTATION = Object.freeze({
    actorName: ['ชื่อผู้ดำเนินการ', null],
    primaryOfficerId: ['ผู้รับผิดชอบหลัก', null],
    decisionNote: ['เหตุผลการมอบหมาย', 'a5AssignmentDecisionNote'],
    recommendationSnapshot: ['ข้อมูลคำแนะนำผู้รับผิดชอบ', null],
    signature: ['ลายมือชื่อรับมอบสำนวน', 'a5AcceptanceSignature'],
    receivedDate: ['ข้อมูลวันรับสำนวน', 'a5ReceivedRecordedAt'],
    'receivedDate.channel': ['ช่องทางรับสำนวน', 'a5ReceivedChannel'],
    'receivedDate.recordedAt': ['วันที่ระบบต้นทางบันทึก', 'a5ReceivedRecordedAt'],
    'receivedDate.effectiveDate': ['วันที่เริ่มนับระยะเวลา', 'a5ReceivedEffectiveDate'],
    'intakeReview.documentResults': ['ผลตรวจเอกสารที่รับมา', null],
    'intakeReview.jurisdictionResult': ['ผลตรวจเขตอำนาจ', 'a5ReviewJurisdiction'],
    'intakeReview.complaintTypeResult': ['ประเภทเรื่อง', 'a5ReviewComplaintType'],
    'intakeReview.completenessResult': ['ผลตรวจความครบถ้วนของเอกสาร', 'a5ReviewCompleteness'],
    'intakeReview.clerkOpinion': ['ข้อสังเกตและความเห็นเสนอ ผอ.เขต', 'a5ClerkOpinion']
  });
  function workflowErrorPresentationA5(result = {}) {
    const code = String(result.code || '');
    const fields = Array.isArray(result.errors) ? result.errors.map(path => A5_FIELD_PRESENTATION[path]).filter(Boolean) : [];
    if (code === 'MISSING_REQUIRED_FIELD') {
      return {
        title: 'กรอกข้อมูลให้ครบถ้วน',
        message: fields.length ? `กรุณากรอก: ${fields.map(([label]) => label).join(', ')}` : 'กรุณาตรวจสอบและกรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        firstControlId: fields.find(([, controlId]) => controlId)?.[1] || null
      };
    }
    const known = {
      ACTOR_MISMATCH: ['ไม่มีสิทธิ์ดำเนินการ', 'บัญชีผู้ใช้งานปัจจุบันไม่มีสิทธิ์ทำรายการนี้'],
      INVALID_TRANSITION: ['ยังดำเนินการขั้นนี้ไม่ได้', 'สถานะปัจจุบันของสำนวนไม่รองรับรายการที่เลือก'],
      INVALID_ASSIGNMENT_TEAM: ['ข้อมูลทีมไม่ถูกต้อง', 'ผู้รับผิดชอบหลักต้องไม่ซ้ำกับผู้ช่วยผู้รับผิดชอบ'],
      INVALID_RECOMMENDATION_SNAPSHOT: ['ข้อมูลคำแนะนำไม่สมบูรณ์', 'กรุณาสร้างคำแนะนำผู้รับผิดชอบใหม่ก่อนยืนยันมอบหมาย'],
      OVERRIDE_REASON_REQUIRED: ['ต้องระบุเหตุผลการมอบหมาย', 'กรุณาระบุเหตุผลเมื่อเลือกผู้รับผิดชอบนอกอันดับคำแนะนำ'],
      VERSION_CONFLICT: ['ข้อมูลสำนวนมีการเปลี่ยนแปลง', 'กรุณาโหลดข้อมูลล่าสุดแล้วดำเนินการอีกครั้ง'],
      ASSIGNMENT_ACCEPTANCE_REQUIRED: ['ต้องรับมอบสำนวนก่อน', 'ผู้รับผิดชอบหลักต้องลงนามรับคำสั่งมอบหมายเวอร์ชันปัจจุบันก่อนดำเนินงาน'],
      RELATED_CASE_NOT_FOUND: ['ไม่พบสำนวนที่เกี่ยวข้อง', 'กรุณาตรวจสอบเลขสำนวนแล้วลองอีกครั้ง'],
      PENDING_CONFIRMATION: ['ยังดำเนินการไม่ได้', String(result.rule?.label || 'กติกากระบวนงานส่วนนี้ยังรอการยืนยัน')],
      CLOSURE_BLOCKED: ['ยังปิดสำนวนไม่ได้', Array.isArray(result.errors) && result.errors.length ? result.errors.map(item => item.message).filter(Boolean).join(' · ') : 'ยังมีเงื่อนไขก่อนปิดสำนวนที่ไม่ครบถ้วน']
    };
    const [title, message] = known[code] || ['ดำเนินการไม่สำเร็จ', 'กรุณาตรวจสอบข้อมูลและสถานะสำนวนแล้วลองอีกครั้ง'];
    return { title, message, firstControlId: null };
  }
  function focusWorkflowErrorA5(presentation, root = document) {
    const control = presentation?.firstControlId ? root?.querySelector?.(`#${presentation.firstControlId}`) : null;
    if (!control) return;
    control.focus();
    control.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }
  function confirmDo(title, text, confirmButtonText = 'ยืนยัน') { if (!window.Swal) return Promise.resolve({ isConfirmed: confirm(`${title}\n${text}`) }); return Swal.fire({ icon: 'question', title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'ยกเลิก', confirmButtonColor: '#082b50', cancelButtonColor: '#687789' }); }
  function swalForm(title, html, confirmText = 'ยืนยัน') { if (!window.Swal) return Promise.resolve({ isConfirmed: true, value: {} }); return Swal.fire({ title, html, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'ยกเลิก', confirmButtonColor: '#082b50', cancelButtonColor: '#687789', preConfirm: () => { const out = {}; $$('#swalForm [data-sf]').forEach(el => out[el.dataset.sf] = el.type === 'checkbox' ? el.checked : el.value.trim()); return out; } }); }

  /* ---------- โครงสร้างข้อมูลเฟสไต่สวน ---------- */
  function defaultInquiry(state) {
    const c = state?.caseData || {};
    return {
      status: 'intake',
      extensionProgress: { version: 1, assignmentVersion: 1, obligations: [], policyStatus: 'PENDING_CONFIRMATION' },
      extensionLateReports: [],
      intake: {
        unit: c.region || '', director: '', investigator: '', team: [], orderNo: '', orderDate: '', assignedAt: '', acceptedAt: '', handoffRef: c.id || '',
        receivedFirstAt: parseThaiDate(c.received) || '',
        transfer: { status: '', target: '', note: '', by: '', at: '' },
        transferPost: { status: '', target: '', letterSource: '', letterTarget: '', by: '', approvedBy: '', at: '' },
        m62: { flag: Boolean(c.decision === '62'), sourceLetter: '', sourceMtiDate: '', ageCheck: '', report65Letter: '', report65Date: '', recalled: false }
      },
      prelim: {
        plan: '', planStatus: 'รอจัดทำแผนคดี', planApprovedBy: '', planApprovedAt: '', workLog: '', evidence: '', searchWarrant: '',
        issues: { status: '', authority: '', action: '', damage: '' },
        startedAt: '', deadlineAt: '', submittedAt: '', report: '', status: 'รอจัดทำแผนคดี',
        extensionHistory: [], progressReports: [], reviewChain: [], supportOpinion: '', supportBy: '', supportPending: false, fastTrack: false,
        additionalDeadlineAt: '', additionalExtendedOnce: false, additionalExtensionPending: null, lateReport: ''
      },
      committee213: { result: '', mtiNo: '', mtiDate: '', orderType: '', orderNo: '', orderDate: '', decidedAt: '', decidedBy: '', note: '', investigator644: '', handoverDoc: { flag: false, letterNo: '', date: '' } },
      inquiry644: {
        investigator: '', team: [], plan: '', planStatus: 'รอคำสั่งแต่งตั้ง', planApprovedBy: '', planApprovedAt: '',
        accused: [], witnesses: [], noticeSentAt: '', statements: '', allegations: '', witnessProtection: '', searchWarrant: '',
        startedAt: '', deadlineAt: '', submittedAt: '', report: '', status: 'รอคำสั่งแต่งตั้ง',
        extensionHistory: [], progressReports: [], reviewChain: [], supportOpinion: '', supportBy: '', supportPending: false, fastTrack: false,
        additionalDeadlineAt: '', additionalExtendedOnce: false, additionalExtensionPending: null, lateReport: '', orders: []
      },
      committee644: { result: '', mtiNo: '', mtiDate: '', decidedAt: '', decidedBy: '', note: '' },
      prosecutor: { orderType: '', orderDetail: '', orderedAt: '', executedAt: '', returnedAt: '', letters: '', reportA7: false },
      outcome: { type: '', letters: '', prosecutor: '', disciplineAgency: '', disciplineSentAt: '', followup: '', closedAt: '', closedBy: '' },
      special: { type: '', agency: '', assignee: '', reportedAt: '', result: '', secretaryAt: '', publicNotice: false, switched: false, note: '' },
      publicUpdates: []
    };
  }
  function ensureA5Foundation(state) {
    const workflowApi = globalThis.ECMISActivity5Workflow;
    if (!workflowApi) return state;
    const normalized = workflowApi.normalizeA5State(state);
    state.workflow = normalized.workflow;
    state.intake = normalized.intake;
    state.assignment = normalized.assignment;
    state.assignmentHistory = normalized.assignmentHistory;
    state.planLifecycle = normalized.planLifecycle;
    state.custody = normalized.custody;
    state.decisionHistory = normalized.decisionHistory;
    return state;
  }
  function ensureInquiry(state) {
    if (!state.inquiry) state.inquiry = defaultInquiry(state);
    ensureA5Foundation(state);
    return state.inquiry;
  }
  /* คดีที่ส่งมาจากกิจกรรมที่ 4 (activity5-dispatch, complete) ยังไม่ได้แปลงเป็นสำนวนกิจกรรมที่ 5 —
   * normalize-on-read ทุกครั้งที่โหลด (ไม่ใช่ one-shot migration) เพื่อไม่ให้ค้างที่ debug fallback */
  function manifestHasDocuments(manifest) {
    return Array.isArray(manifest?.documents) && manifest.documents.length > 0;
  }
  function handoffManifestForIncomingCase(state) {
    const handoffStore = readLegacy(LEGACY_HANDOFF_KEY);
    const records = handoffStore?.records && typeof handoffStore.records === 'object' ? handoffStore.records : {};
    const references = new Set([
      state?.caseData?.id,
      state?.caseData?.sourceReference,
      state?.sourceReference,
      state?.caseData?.activity4HandoffId,
      state?.activity4HandoffId,
      state?.activity4HandoffRef,
      state?.handoffRef,
      state?.inquiry?.intake?.handoffRef
    ].map(value => String(value || '').trim()).filter(Boolean));
    [...references].forEach(reference => {
      const match = reference.match(/^activity4:(.+):activity5$/);
      if (match?.[1]) references.add(match[1]);
    });
    const direct = [...references].map(reference => records[reference]).find(record => manifestHasDocuments(record?.inboundDocumentManifest));
    const handoff = direct || Object.values(records).find(record => manifestHasDocuments(record?.inboundDocumentManifest) && [record?.sourceReference, record?.activity5CaseId, record?.handoffId].some(value => references.has(String(value || '').trim())));
    return handoff?.inboundDocumentManifest || null;
  }
  function normalizeIncomingCase(state) {
    let changed = false;
    const handoffManifest = handoffManifestForIncomingCase(state);
    if (handoffManifest) {
      if (JSON.stringify(state?.inboundDocumentManifest) !== JSON.stringify(handoffManifest)) {
        state.inboundDocumentManifest = handoffManifest;
        changed = true;
      }
    } else if (!manifestHasDocuments(state?.inboundDocumentManifest) && globalThis.ECMISActivity5Handoff?.buildInboundDocumentManifest) {
      const derivedManifest = globalThis.ECMISActivity5Handoff.buildInboundDocumentManifest(state);
      if (!state?.inboundDocumentManifest || manifestHasDocuments(derivedManifest)) {
        state.inboundDocumentManifest = derivedManifest;
        changed = true;
      }
    }
    if (state?.workflow?.stage === 'activity5-dispatch' && state.workflow?.complete) {
      ensureInquiry(state);
      state.workflow.stage = 'a5-intake';
      state.workflow.status = 'ส่งถึงเขตผู้รับผิดชอบแล้ว — รอธุรการคดีรับสำนวน';
      state.workflow.owner = 'clerk';
      state.workflow.complete = false;
      return true;
    }
    return changed;
  }
  function reportOf(reportType, inquiry) { return reportType === '213' ? inquiry.prelim : inquiry.inquiry644; }
  /* กลุ่มเฟส 213 (a5-prelim, a5-prelim-review, a7-213) เทียบกับกลุ่มเฟส 644 (a5-inquiry, a5-inquiry-review, a7-644)
   * ตามการจัดกลุ่มเฟสใน editorForA5 — ใช้แทนที่ ternary ที่กระจายอยู่หลายจุด */
  function reportTypeForStage(stage) {
    return ['a5-prelim', 'a5-prelim-review', 'a7-213'].includes(stage) ? '213' : '644';
  }

  /* ---------- กลไกขยายเวลา (218/2568) ---------- */
  function extensionRound(reportType, inquiry) {
    const history = reportOf(reportType, inquiry).extensionHistory || [];
    const rules = EXTENSION_RULES[reportType];
    if (!rules) return null;
    const round = history.filter(h => h.status === 'APPROVED').length;
    if (round >= rules.rounds.length) return null;
    return { round: round + 1, role: rules.rounds[round], maxDays: EXTENSION_DAYS };
  }
  function pendingExtension(reportType, inquiry) {
    const history = reportOf(reportType, inquiry).extensionHistory || [];
    return [...history].reverse().find(h => h.status === 'PENDING') || null;
  }
  function canApproveExtension(reportType, inquiry, role) {
    const next = extensionRound(reportType, inquiry);
    const pending = pendingExtension(reportType, inquiry);
    if (pending) return pending.role === role;
    return next && next.role === role;
  }
  function requestExtension(state, reportType, reason, requestedDays, byRole, details = {}) {
    if (byRole !== 'investigator') return { ok: false, message: 'ผู้รับผิดชอบสำนวนเท่านั้นที่ยื่นคำขอขยายได้' };
    const days = Number(requestedDays) || 60;
    if (!Number.isFinite(days) || days <= 0 || days > EXTENSION_DAYS) return { ok: false, message: `จำนวนวันที่ขอต้องอยู่ระหว่าง 1-${EXTENSION_DAYS} วัน` };
    const candidate = JSON.parse(JSON.stringify(state || {}));
    const inquiry = ensureInquiry(candidate);
    const rep = reportOf(reportType, inquiry);
    const next = extensionRound(reportType, inquiry);
    if (!next) return { ok: false, message: `ขยาย ${reportType} ครบทุกครั้งแล้ว ต้องเสนอคณะกรรมการ (รายงานเหตุล่าช้า)` };
    const left = daysLeft(rep.deadlineAt);
    if (left !== null && left < 15) return { ok: false, message: `ต้องยื่นคำขอล่วงหน้าไม่น้อยกว่า 15 วันก่อนครบกำหนด (เหลือ ${left} วัน) — กรณีเร่งด่วนให้เสนอรายงานเหตุล่าช้าต่อคณะกรรมการ` };
    rep.extensionHistory.push({ round: next.round, role: next.role, requestedDays: days, reason, progress: details.progress || '', workDone: details.workDone || '', workRemaining: details.workRemaining || '', obstacles: details.obstacles || '', evidence: details.evidence || '', requestedBy: byRole, requestedAt: now(), status: 'PENDING' });
    rep.status = `รออนุมัติขยายครั้งที่ ${next.round} (${ROLE_LABELS[next.role]})`;
    candidate.decisionHistory = candidate.decisionHistory || [];
    candidate.decisionHistory.push({ text: `${ROLE_LABELS[byRole]} ยื่นคำขอขยาย${reportType === '213' ? 'ไต่สวนเบื้องต้น' : 'ไต่สวนชี้มูล'}ครั้งที่ ${next.round} (${days} วัน) — ${reason}`, time: now() });
    Object.assign(state, candidate);
    return { ok: true, next };
  }
  function applyExtension(state, reportType, reason, byRole, requestedDays = EXTENSION_DAYS) {
    const candidate = JSON.parse(JSON.stringify(state || {}));
    const inquiry = ensureInquiry(candidate);
    const rep = reportOf(reportType, inquiry);
    const next = extensionRound(reportType, inquiry);
    if (!next) return { ok: false, message: `ขยาย ${reportType} ครบทุกครั้งแล้ว ต้องเสนอคณะกรรมการพิจารณา` };
    const pending = pendingExtension(reportType, inquiry);
    if (!pending) return { ok: false, message: 'ไม่มีคำขอขยายที่รอการพิจารณา' };
    if (pending.role !== byRole) return { ok: false, message: `รอบนี้ ${ROLE_LABELS[pending.role]} เป็นผู้อนุมัติ` };
    const days = Number(requestedDays) || pending.requestedDays;
    if (![15, 30, 60].includes(days) || days > next.maxDays || days > pending.requestedDays) return { ok: false, message: 'จำนวนวันที่อนุมัติต้องเป็น 15, 30 หรือ 60 วัน และไม่เกินจำนวนวันที่ขอ' };
    const entry = pending;
    entry.status = 'APPROVED'; entry.approvedBy = byRole; entry.approvedAt = now(); entry.reason = reason || entry.reason; entry.approvedDays = days;
    rep.deadlineAt = addDays(rep.deadlineAt, days);
    rep.status = `ขยายครั้งที่ ${entry.round} แล้ว (${days} วัน) — ครบ ${rep.deadlineAt}`;
    candidate.decisionHistory.push({ text: `${ROLE_LABELS[byRole]} อนุมัติขยาย${reportType === '213' ? 'ไต่สวนเบื้องต้น' : 'ไต่สวนชี้มูล'}ครั้งที่ ${entry.round} (${days} วัน) เหตุผล: ${entry.reason}`, time: now() });
    Object.assign(state, candidate);
    return { ok: true, next, deadline: rep.deadlineAt };
  }
  function denyExtension(state, reportType, byRole, note) {
    const candidate = JSON.parse(JSON.stringify(state || {}));
    const inquiry = ensureInquiry(candidate);
    const rep = reportOf(reportType, inquiry);
    const pending = pendingExtension(reportType, inquiry);
    if (!pending) return { ok: false, message: 'ไม่มีคำขอที่รอการพิจารณา' };
    if (pending.role !== byRole) return { ok: false, message: `${ROLE_LABELS[pending.role]} เป็นผู้พิจารณา` };
    pending.status = 'DENIED'; pending.deniedBy = byRole; pending.deniedAt = now(); pending.denyNote = note || '';
    rep.status = `คำขอขยายครั้งที่ ${pending.round} ไม่ผ่าน — ดำเนินการต่อภายในเวลาที่เหลือ (ครบ ${rep.deadlineAt})`;
    candidate.decisionHistory.push({ text: `${ROLE_LABELS[byRole]} ไม่อนุมัติขยายครั้งที่ ${pending.round}${note ? ` — ${note}` : ''}`, time: now() });
    Object.assign(state, candidate);
    return { ok: true };
  }
  function deadlineTone(deadlineIso) {
    const left = daysLeft(deadlineIso);
    if (left === null) return { tone: 'muted', label: 'ยังไม่เริ่มนับ' };
    if (left <= 15) return { tone: 'crit', label: `ครบ ${deadlineIso} — เหลือ ${left} วัน (ต้องขยาย!)` };
    if (left <= 30) return { tone: 'warn', label: `ครบ ${deadlineIso} — เหลือ ${left} วัน` };
    if (left <= 45) return { tone: 'soft', label: `ครบ ${deadlineIso} — เหลือ ${left} วัน` };
    return { tone: 'ok', label: `ครบ ${deadlineIso} — เหลือ ${left} วัน` };
  }
  function caseAgeTone(inquiry) {
    const start = inquiry?.intake?.receivedFirstAt;
    if (!start) return null;
    const years = (Date.now() - new Date(start + 'T00:00:00')) / 315576e5;
    if (years >= 2) return { tone: 'crit', label: `ครบ 2 ปีแล้ว (นับจากรับเรื่องครั้งแรก) — ต้องรายงานเป็นรายกรณี ปกติไม่เกิน 3 ปี ต่างประเทศไม่เกิน 5 ปี` };
    if (years >= 1.5) return { tone: 'warn', label: `ใกล้ครบ 2 ปี (${Math.floor(years)} ปี) — เตรียมรายงานเป็นรายกรณี` };
    return null;
  }

  /* ---------- ลำดับชั้นการตรวจ ---------- */
  function chainState(reportType, inquiry) {
    const rep = reportOf(reportType, inquiry);
    const steps = REVIEW_CHAIN[reportType];
    const done = rep.reviewChain || [];
    const required = steps.filter(s => !s.optional);
    const doneRequired = done.filter(d => !d.skip).map(d => d.level);
    const complete = required.every(s => doneRequired.includes(s.level));
    let current = null;
    for (const s of steps) { if (!done.some(d => d.level === s.level)) { current = s; break; } }
    return { rep, steps, done, current, complete };
  }
  function chainApprove(state, reportType, role, opinion) {
    const inquiry = ensureInquiry(state);
    const cs = chainState(reportType, inquiry);
    if (cs.complete && !cs.current) return { ok: false, message: 'ตรวจครบทุกชั้นแล้ว' };
    if (!cs.current || cs.current.role !== role) return { ok: false, message: `ชั้นนี้ ${ROLE_LABELS[cs.current ? cs.current.role : 'group-director']} เป็นผู้ตรวจ` };
    const step = cs.current;
    cs.rep.reviewChain.push({ level: step.level, role, label: step.label, opinion, by: step.label, at: now() });
    const after = chainState(reportType, inquiry);
    state.decisionHistory.push({ text: `${ROLE_LABELS[role]} ตรวจรายงาน ${reportType} (ชั้น ${step.label}): ${opinion}`, time: now() });
    return { ok: true, complete: after.complete, current: after.current };
  }
  function chainSkipGroup(state, reportType, role, opinion) {
    const inquiry = ensureInquiry(state);
    const cs = chainState(reportType, inquiry);
    if (cs.done.some(d => d.level === 1 && !d.skip) || cs.done.some(d => d.level === 1 && d.skip)) return { ok: false, message: 'ชั้น ผอ.กลุ่มงาน ผ่านไปแล้ว' };
    cs.rep.reviewChain.push({ level: 1, role, label: 'ผอ.กลุ่มงาน', skip: true, opinion: opinion || 'ไม่อยู่ในสายงานของสำนวนนี้', by: ROLE_LABELS[role], at: now() });
    state.decisionHistory.push({ text: `${ROLE_LABELS[role]} ข้ามชั้น ผอ.กลุ่มงาน (ไม่อยู่ในสายงาน)`, time: now() });
    return { ok: true };
  }

  /* ---------- บันทึกสถานะสาธารณะ ---------- */
  function publish(state, text) {
    if (state.workflow?.downstreamStatus) {
      state.publicStatusEvents = Array.isArray(state.publicStatusEvents) ? state.publicStatusEvents : [];
      state.publicStatusEvents.push({ code: 'A5_PUBLIC_WORDING_PENDING', queuedAt: now(), status: 'PENDING_WORDING' });
      return;
    }
    const inquiry = ensureInquiry(state);
    inquiry.publicUpdates.push({ text, at: now() });
    state.caseData.publicStatus = text;
    try {
      // Phase 0 Task 3: this mirrors case status to a second localStorage
      // key ('ecmis-demo-cases') outside the STORAGE_KEY chokepoint above,
      // so it needs its own guard check — see action-matrix.md, this write
      // is reachable from mti213-decide/mti644-decide/close-case/m62-recall.
      globalThis.ECMISActivity5Phase0Guard?.assertWritable();
      const demo = JSON.parse(localStorage.getItem('ecmis-demo-cases') || '[]');
      if (Array.isArray(demo)) {
        const rec = demo.find(r => r.trackingNumber === state.caseData.trackingYear);
        if (rec) { rec.publicStatus = text; rec.internalStatus = text; localStorage.setItem('ecmis-demo-cases', JSON.stringify(demo)); }
      }
    } catch { /* ignore */ }
  }

  /* ---------- stagebar ---------- */
  function journeyStages(state) {
    const w = state.workflow || {};
    const a5 = ['a5-intake', 'a5-prelim', 'a5-prelim-review', 'a7-213', 'a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'];
    const isA5 = a5.includes(w.stage);
    // "กลั่นกรอง/มอบหมาย" here is Activity 4's own initial-complaint screening step
    // (w.stage values admin/officer), not the investigation-report review gate below —
    // the two share a Thai name but are different steps in different activities.
    // เฉพาะขั้นของระบบไต่สวน (ขั้น 6-15 ตามเส้นทางรวม 15 ขั้น — ขั้น 1-5 อยู่ในระบบรับเรื่อง)
    const LATER = ['a5-prelim', 'a5-prelim-review', 'a7-213', 'a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'];
    const stages = [
      { key: 'a5-intake', label: 'รับสำนวน/มอบหมาย', state: ['a5-intake'].includes(w.stage) || LATER.includes(w.stage) },
      { key: 'prelim', label: 'ไต่สวนเบื้องต้น 213', state: ['a5-prelim'].includes(w.stage) || ['a5-prelim-review', 'a7-213', 'a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'prelim-review', label: 'กลั่นกรองรายงาน 213', state: ['a5-prelim-review'].includes(w.stage) || ['a7-213', 'a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'mti213', label: 'คกก. มติรับไต่สวน', state: ['a7-213'].includes(w.stage) || ['a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'inquiry', label: 'ไต่สวนชี้มูล 644', state: ['a5-inquiry'].includes(w.stage) || ['a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'inquiry-review', label: 'กลั่นกรองรายงาน 644', state: ['a5-inquiry-review'].includes(w.stage) || ['a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'mti644', label: 'คกก. ชี้มูล', state: ['a7-644'].includes(w.stage) || ['a5-outcome', 'a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'outcome', label: 'ดำเนินการตามมติ', state: ['a5-outcome'].includes(w.stage) || ['a5-prosecutor', 'closed'].includes(w.stage) },
      { key: 'prosecutor', label: 'ส่งอัยการ/หน่วยงานต้นสังกัด', state: ['a5-prosecutor'].includes(w.stage) },
      { key: 'closed', label: 'ปิดสำนวน', state: w.stage === 'closed' }
    ];
    // current = the LAST stage whose condition matches, not the first — every stage's
    // condition also matches every later real stage.stage (by design, so "done" stages
    // stay lit once passed), so findIndex (first match) always returned 0 and the
    // stepper never advanced past step 1 regardless of actual progress.
    let current = 0;
    stages.forEach((s, idx) => { if (s.state) current = idx; });
    return { stages, current };
  }
  function stagebarA5(state) {
    const stage = state.workflow?.stage || '';
    const processState = state.workflow?.a5Status || '';
    const stages = [
      { label: 'รับและมอบหมาย' },
      { label: 'แผนคดี' },
      { label: 'ไต่สวนเบื้องต้น' },
      { label: 'พิจารณา 213' },
      { label: 'ไต่สวนชี้มูล' },
      { label: 'พิจารณา 644' },
      { label: 'ดำเนินการตามมติ' },
      { label: 'ปิดสำนวน' }
    ];
    const planInProgress = /^(?:PLAN|AMENDMENT)_(?:DRAFT|SUBMITTED|RETURNED)$/.test(processState);
    const stageSteps = { 'a5-intake': 0, 'a5-prelim': 2, 'a5-prelim-review': 2, 'a7-213': 3, 'a5-inquiry': 4, 'a5-inquiry-review': 4, 'a7-644': 5, 'a5-outcome': 6, 'a5-prosecutor': 6, closed: 7 };
    const current = planInProgress ? 1 : (stageSteps[stage] ?? 0);
    const fullTrack = stages.map((s, idx) => {
      const done = idx < current;
      const active = idx === current;
      return `<span class="ws-stage-node ${done ? 'done' : ''} ${active ? 'active' : ''}" title="${escapeHtml(s.label)}"><b>${idx + 1}</b><small>${escapeHtml(s.label)}</small></span>`;
    }).join('');
    return `<nav class="ws-card ws-stagebar a5 a5-stagebar" aria-label="เส้นทางสำนวนคดี"><div id="a5StageCompact" class="a5-stage-compact"><span><small>ความคืบหน้าสำนวน</small><strong>ขั้นที่ ${current + 1} จาก ${stages.length} · ${escapeHtml(stages[current].label)}</strong></span><button type="button" id="a5StageToggle" class="ws-button ghost a5-stage-toggle" aria-expanded="false" aria-controls="a5StageFull">ดูทุกขั้นตอน</button></div><div id="a5StageFull" class="ws-stage-track" hidden>${fullTrack}</div></nav>`;
  }

  function nextA5StagePresentation(source, event) {
    const current = {
      compact: source?.compact === true,
      expanded: source?.expanded !== false,
      userSelected: source?.userSelected === true
    };
    if (event?.type === 'toggle') return { ...current, expanded: !current.expanded, userSelected: true };
    if (event?.type === 'viewport') {
      const compact = event.compact === true;
      return { ...current, compact, expanded: current.userSelected ? current.expanded : !compact };
    }
    return current;
  }
  function bindA5Stagebar(root) {
    const stagebar = $('.a5-stagebar', root);
    const toggle = $('#a5StageToggle', root);
    const full = $('#a5StageFull', root);
    if (!stagebar || !toggle || !full) return;
    const compactQuery = window.matchMedia('(max-width: 1200px)');
    let presentation = { compact: compactQuery.matches, expanded: !compactQuery.matches, userSelected: false };
    const setExpanded = expanded => {
      stagebar.classList.toggle('is-expanded', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'ย่อขั้นตอน' : 'ดูทุกขั้นตอน';
      full.hidden = !expanded;
    };
    const renderPresentation = () => setExpanded(presentation.expanded);
    const syncViewport = () => {
      presentation = nextA5StagePresentation(presentation, { type: 'viewport', compact: compactQuery.matches });
      renderPresentation();
    };
    toggle.addEventListener('click', () => {
      presentation = nextA5StagePresentation(presentation, { type: 'toggle' });
      renderPresentation();
    });
    if (typeof compactQuery.addEventListener === 'function') compactQuery.addEventListener('change', syncViewport);
    syncViewport();
  }

  /* ---------- เอกสาร ---------- */
  function crest() { return `<div class="ws-paper-crest" aria-hidden="true"><svg viewBox="0 0 60 60" width="52" height="52"><circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M30 8l5 10 11-2-6 10 10 5-10 6 2 11-10-5-10 5 2-11-10-6 10-5-6-10 11 2z" fill="currentColor" opacity=".85"/><text x="30" y="34" text-anchor="middle" font-size="9" fill="#fff">ป.ป.ท.</text></svg></div>`; }
  const A5_GARUDA_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADKBAMAAAAFnIJvAAAABGdBTUEAALGIlZj0pgAAADBQTFRFAAAAgAAAAIAAgIAAAACAgACAAICAgICAwMDA/wAAAP8A//8AAAD//wD/AP//////ex+xxAAAAAlwSFlzAAAOQAAADkUBMpLx3wAADBBJREFUeJzVnAuC5LYKRdkB+98lO+CVBZePLNmuT78klWSmuyzrCIEQYDmkf/2h/yZBiFcE+h1Mal/xI/2Q0IaLn15YXjf+6FPm6f9H+O0kVU1QfPNjAkOIJPxyklQ4Rux/068JJJ1QvvjRh0S4EfjnBKa/JsSiG38J/dJnoN8/J2Ca/ozAWgnHrw8JT42aWFy1RpCnBHljJH9NIMhL47a/kEGkEPggPJrgp4TXDIl2gnxFOI1Phh4mAk1Nln29hnYeydF2vp2PPoPwmjOeCHbTmbEieFu2nkMoKrN0ELT7c6I1YkUYzXyE4e4omjrhtcgFNzA2pDNBNjKwqwLalCFBkYEOGVLAaH4S4SAs1BNCUBDYZiYJ1Ahityx0yusoUax97MWvKWmzNHY4yQ2VDbDq6RBt8b2hCcN+dfiiuWM6E9g0vLT7PcHmqRG0EPiQkEEYsi7MXq339RVTtuN9gU0Edb6a4a6dw54whGDv7lgMQy2dQK6nMf51N07YauK42ayKc1czwhCQQdCtFsj+2QlhNx/qsDUXhPELmyROWM/1bqWnEOjO1FAJY5rsXtb9XN8Sjgn2SVoQzJ2OSV7O9OEHxmfDh/CvBjZVE4EqYa1nwlh2l9VcY/aXBLfQw2AvCAyvsZ4mC4xsb5sI4oT0f7tpGIRh9YsWNr9Dzz7o4pegCDjsxf3kywamsiEoCJGSgGDThG9XhOOi7xpre4IMqYZcWkYYElwQ+ueSYJPUCKYb3LoyRynrYa8HcXOWmSDkg5QtgaoYw4GcCDaFYjMhneAG5mIsdjexFZSERQQ3tq7Xf9Y3UdM0ljQ+SwKNXWvrOsRW/EFwaZotFSNZE9gn8Ypgl4790xXSCB6Q7AmxSfr1k+vCzezGj0EEgaqtnFQ9NmgSiBohY1NDnYJOiF/30xR6jnjz3KTeLCtC18Tp9jbGMMUipbfg7KllivM0zffbsAnjWRAgHdbziuBWblY96+HYs2yVYRhTAw/JzCVZMF8IYAr+QGiVHdjWhXmIyGjWwrgbZqWdwNTnes44dMQYIfK0C9XlSl3KJMg1QbLTh4ReOUn14OqEYOXWSycIdQqXJC0CbrcFieHPhD6CvslBqclfERBsRJbR+3C/E1tVtQTJXjgAC4IbfKqodhJwiT9OIoRBbQmYaenX/GcKQZm0WTN+Dg3LmRDOpllBXxNS97gWlUVfYwBmdhsCuY/n6VbrXy0YEcsNkkApwrgCB3KapQxEqN6j9UdWSwFbkxTB8pDhW3MIFA0x/CqE1J6ijFBcawGYgpxOmcYEIbxvncOU4jUoQep3DDVXQIzVfhxuSUoak7M1+pZJiOhiBK0wlgMGCVpLsoXT1kvIOOJu8si83Wc++wgGop5irpWmCXW/T9MY8QNDFX2aSp/Fo6Xd1klCGOUamQm5VqqCI4iLMCRXVF87pdbSt5eqU3TukXiRIRDsmatJ1kXAypDueQsBu6fklmzbp93POWILHZEUxvgI+xPvCAIhi/gWI6Fm4P2M4o6t8UpQT0J7AlM0MuJBSA+EJ9niK9o+jFo/ZOh+TYXXhMNeJPaAWLWWJ1dvPUI+nxEvIfg6gaktZ8mWSrgs/M1OYM7GrCh1OmEYeYaS4M4E0cgibPVbDcIInn/CWrNrheakBNhaP4XgtfCUt+hyqKOmTnZVpOdGUBktCUiDYbjm3fyJkYXjGQ564UVIM1a25eAiLwm5NZXN7vByuJoWAGsck0VBgC9u8WAjsMVlUgyWQCBB6MypylGnLSucLE3lDcEliMWJ5M0usuS1cAtSAhfQ5+RlJjSVkRnJuD8yLNvtO8H9gRB8yYYQ/rF/cE3TvVrLogJJdzxX6SZCrLbIlDAgWwU+YFNmy0TSjes1Ab4ChLJViIdMKFaO5cEhIzqcH0/OIXT41JQCvljMdXESfFfX9Ftedt0S0qLDm5dAVsh9h2QYN6IcLERzXnPpqf+KsjULKiCNoF4dKwSq1tEUsibgXp5MNm6qQXdJSWERfBZhSWCEwcgvGyHbcvGSsYmcU/HpV/fcfHg8igjjHAZDBnO35DqaE4sFAUsiqoLScrK5KWeE0W6/ILTsBZHwnmB/l5tXj7pO9xXjKZHXmUCRmo/tUWllqguCCsGUYIK5cCcRQhCJWOqkhQWhVGvICy2qZ/1B0OoZT8v5HyPkdumbTcsT0m/5phffo/E9oberyo462SLlO914RdDuJY5Yq3DyxxYaLpfCloBJGYVTBNnnT3ru+OIpoW5dWkus5icaxtvwFNreEco8RYRh0Ax0ULymiKfWgA2hevzpB4w8484qzRuE8GuZHvYJr6rZWNE1QcVTGevymiAfEWBRpdPiFOewag+4IaRaI+c8pcHt8luEMkI+dyEUsYJcC7E3AUL4ZEvgTIgzHjuPdE1wRctwGfN5EbUIIbze3mXsCfBxYiWjUw82Sa3tThUbAgXBApQgYGKIOCNJOg/hjoBq4CudIU/Qsfo0CiyUjfnivN7yazu8Mh7SGsEzPN/W2EXohO10rEWwO8yQvD+sLEy7zaIRWXPSHsoQ7oa84j2nRpyrIN37Y0LdOb3c0J4oTv3h940iloSsGvrpjIigUhT7Psazn6a1DKYGIS8rZZnSFziJEcb+wHZ2aBmObQhWwrBnTjrqGpCBfRdF7G/llvH0/y0ZUNIzixyZp3km7KIczlBaFPqcEHOtFCd2zNWZeVWzkaqbx4R6W4kUzYDGejaopp5xZugpQSmUW+ogueWU7whl+shRnxLGFFF5WD894XAhxomeUS/YHUnaEaxeJGVc4gE2vKpYue/4HinjG7aEXNr9GWbdCOMkndqKCEsq9d4nBE/zwzkwzk1Z6ujpVJTvzSDeIdjjjoiHIZj1J173zIoWix/aeYMQmhOcr4H/lPEQOcjmLoygvbx3S/Bd5aiqeWCN+GkUsjzmZ/Gzh8Po3iCU2lorIpuO4zEB9Q8vJ2mfP1RlI1C1+loU2ymefoxDju/tcdhCzW1ADBslSQByF9H39ulRDBtLjiV6UZU8iRfDxylQ2R0N2xHYqrvFFR2lc4UMdZ+Fs13reRsvoVe4v+qOwkGx5CVaO9YtoUYXReHSCf2zAVzErapRIo4x60SwXXV1BOWWYAHqcQZkHADEUQ4jxLMDcgNeVMYeEFqO6+7Zs2cUuYvFbnu5ImhRqFaC+qxkLn+RY10TomjrNFh8nuy7np8nBOz+7iJQJJE4WXoPeELwNZy9SRTcf0TQXIG+sWaC8j1Bqgjtw/6M6wcEPe8ENmMU178h+NawyB58/X1kS12nVkVdCEGTEETrlXf+roY+VYQTJR7lALCuYp0IsYFxDBC73ayIKIsr8uwV4lSvwH4eKwDr+ixCebrR6ro3hFK79dGxZ6VnQl92kqQrQhmQOSI7jn98OdvT9HygRYjXMrTTR0J4EaBvzgTHlEPjVPsNQdXPUOBGjC9PbzYL0ibHLWFOZEolvZ+FwNTLqvW1DPFOTdSMQaBqPG04IfAjwly6q4R0Ut661BWr1d4RyngxzLmugVJ0HfIbhP5sgKynZqxsWYNGfhHt72dJM5NJUcSPPcVGJHYcNW2Ud739k4R0sObhuATEGudyCDkYFuIT3xqnZzL1MUz6b7bXNKrSJvO4kQG9DJwBSPM4nqc8EUbNvvjJLOV3yKQUbxr6G0dUJG11mqezVAAIIOONBp5EoPoS1TNCZkuCp1W+AHgcyKYQwdrcRlyX18TjU3+5xQmea/t6pN37QfeEEsOgwON1y3hZ2T3IxwR/jOKCeELrsV6+VETbLPQBoYQo5NUkZSovsHqd6fJzTSiPbk3vXhEoRirfyBC1QX9RmZwAV+7b3OeaRvVxJAviZSfliBUow6lPCXYziqz+mmyN/5Ru8tA7gh2QHv+KouzMEZ3Zq27f5nHWvQUZY8rtoYeks/g2fxD2U5SjcOuhsPqbk97gO4Kn/bYn4JVr9lNSi1d2PiB49OonAyNeUt6/tvouQW2DswDZt1V/LPFLgtlPvK3qvvt3BIsr4B4kCU8AzwjxOjI1wrPPo4bYqo2Aze8+WX9OiMcL42yls54K8bSd1eqD8EzJbxE8AmYk0Y8Bzwlo/sboPyK8NfoPCe+K8O8jPP5/tXxBeBfwwR3vfv4HpAT+CEwM+dUAAAAASUVORK5CYII=';
  const A5_THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  const a5Num = (n) => String(n).split('').map(ch => A5_THAI_DIGITS[ch] ?? ch).join('');
  const A5_THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const A5_THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const a5Date = (iso) => { const m = String(iso || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return ''; const mi = Number(m[2]) - 1; if (mi < 0 || mi > 11) return ''; return `${Number(m[3])} ${A5_THAI_MONTHS[mi]} พ.ศ. ${Number(m[1]) + 543}`; };
  const a5DateShort = (iso) => { const m = String(iso || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return ''; const mi = Number(m[2]) - 1; if (mi < 0 || mi > 11) return ''; return `${Number(m[3])} ${A5_THAI_MONTHS_SHORT[mi]} ${Number(m[1]) + 543}`; };
  const a5Fill = (value, hint = '.......................................') => { const v = String(value ?? '').trim(); return v ? `<span class="a5-fill">${escapeHtml(v)}</span>` : `<span class="a5-fill a5-blank">${escapeHtml(hint)}</span>`; };
  const a5DateFill = (iso) => a5Fill(a5Date(iso));
  const a5Block = (value, hint = 'ยังไม่มีข้อมูล — โปรดกรอกเพิ่มเติม') => { const v = String(value ?? '').trim(); return `<p class="a5-fill-block${v ? ' has-value' : ''}">${escapeHtml(v || hint)}</p>`; };
  const a5Sub = (num, label, contentHtml) => `<div class="a5-sub"><b>${escapeHtml(num)}</b> ${escapeHtml(label)} ${contentHtml}</div>`;
  const a5Check = (checked, label) => `<div class="a5-check${checked ? ' checked' : ''}"><span>${escapeHtml(label)}</span></div>`;
  const a5SignBlock = (roleLabel, name, note = '') => `<div class="a5-sign-block"><p class="a5-sign-line">(ลงชื่อ) .......................................</p><p>(${name ? escapeHtml(name) : '.......................................'})</p><p>${escapeHtml(roleLabel || '')}</p>${note ? `<p class="a5-sign-note">${escapeHtml(note)}</p>` : ''}</div>`;

  function paperShell(a, b, c, d) {
    if (a && typeof a === 'object' && !Array.isArray(a)) {
      const { formCode = '', headerHtml = '', bodyHtml = '', signHtml = '' } = a;
      return `<section class="a5-paper">${headerHtml}<div class="a5-body">${bodyHtml}</div>${signHtml}${formCode ? `<p class="a5-form-code">${escapeHtml(formCode)}</p>` : ''}</section>`;
    }
    const title = a, meta = b || [], body = c || '', signers = d || [];
    return `<section class="ws-paper"><header class="ws-paper-head">${crest()}<div><h2>${escapeHtml(title)}</h2><p>สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.)</p></div></header><dl class="ws-paper-meta">${meta.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v || '')}</dd></div>`).join('')}</dl><div class="ws-paper-body">${body}</div><footer class="ws-paper-sign">${signers.map(s => `<div><p>${escapeHtml(s.role || '')}</p><strong>${escapeHtml(s.name || '')}</strong><p>${escapeHtml(s.date || '')}</p></div>`).join('')}</footer></section>`;
  }

  function paperMti(state, which) {
    const c = state.caseData, i = state.inquiry, m = which === '213' ? i?.committee213 : i?.committee644;
    const result = m?.result || 'ยังไม่มีมติ';
    const is213 = which === '213';
    const options213 = MTI_213_RESULTS;
    const options644 = MTI_644_RESULTS;
    const checks = (is213 ? options213 : options644).map(o => a5Check(result === o, o)).join('');
    return paperShell({
      formCode: A5_FORMS.mti.code,
      headerHtml: `<header class="a5-crest-head"><img src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="56" height="56"></header><h2 class="a5-memo-title">มติคณะกรรมการ ป.ป.ท.${is213 ? ' (ไต่สวนเบื้องต้น)' : ' (วินิจฉัยชี้มูล)'}</h2><div class="a5-memo-meta"><p><strong>เรื่องที่</strong> ${a5Fill(c?.id)} <strong>มติที่</strong> ${a5Fill(m?.mtiNo)} <strong>วันที่</strong> ${a5DateFill(m?.mtiDate)}</p></div>`,
      bodyHtml: `<div class="a5-section"><h3>ผลมติ</h3><div class="a5-checklist">${checks}</div>${m?.note ? `<p>${escapeHtml(m.note)}</p>` : ''}</div>${is213 && m?.result === 'รับไว้ไต่สวน' ? `<div class="a5-section"><p><strong>การดำเนินการ</strong> แต่งตั้ง${m?.orderType === '24v3' ? 'คณะอนุกรรมการไต่สวน (มาตรา ๒๔ วรรคสาม)' : 'คณะพนักงานไต่สวน (มาตรา ๒๔ วรรคหนึ่ง)'} ${a5Fill(m?.orderNo)} ลงวันที่ ${a5DateFill(m?.orderDate)} ผู้รับผิดชอบชั้น 644: ${a5Fill(m?.investigator644)}${m?.handoverDoc?.letterNo ? ` · หนังสือส่งมอบ ${a5Fill(m?.handoverDoc?.letterNo)}` : ''}</p></div>` : ''}`,
      /* ลายเซ็นใช้ a5Sign (ผ่าน a5SignCol) เพื่อให้มี a5-lock — Word Engine กันแก้ไขลายเซ็น */
      signHtml: `<div class="a5-sign a5-sign-center">${a5SignCol(m?.decidedBy || '', 'ประธานกรรมการ ป.ป.ท.')}${a5SignCol('', 'กรรมการ')}</div>`
    });
  }

  /* ---------- ฟอร์มราชการ A5 (HTML ล้วน — แก้ไขได้ทุกช่อง) ----------
   * แปลง 1:1 จากแบบพิมพ์ราชการ ป.ป.ท. ๒๐ ฉบับ (ลำดับหัวข้อ/ข้อความ/ตาราง/ช่องกรอก ตาม PDF ต้นฉบับ)
   * a5F  = ช่องกรอก (แก้ไขได้ผ่าน Word Engine) · a5Sign = ลายเซ็น (a5-lock กันแก้ไข)
   * a5Hdr คงไว้สำหรับแบบที่มีหัวกระดาษชื่อหน่วยงานจริง — แบบอื่นใช้หัวกระดาษตามชนิดเอกสาร
   * (บันทึกข้อความ / หนังสือออก / แบบศาล) ตามข้อ ๖ "ตรา/ชื่อหน่วยงาน (ถ้าใน PDF มี)" */
  const a5F = (v, w) => `<span class="a5-fill" style="${w ? `min-width:${w}px` : ''}">${escapeHtml(v ?? '')}</span>`;
  const a5Hdr = (title, code) => `<header class="a5-hdr"><p class="a5-hdr-org">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p><p class="a5-hdr-sub">(สำนักงาน ป.ป.ท.)</p><h2 class="a5-hdr-title">${escapeHtml(title)}</h2><p class="a5-hdr-code">${escapeHtml(code)}</p></header>`;
  const a5Sign = (name, role) => `<div><p class="a5-sign-name a5-lock">${escapeHtml(name || '')}</p><p class="a5-sign-note">${escapeHtml(role)}</p></div>`;

  /* --- ตัวช่วยจัดหน้าแบบพิมพ์ (ประกอบจาก helper เดิม ไม่สร้าง a5F/a5Hdr/a5Sign ซ้ำ) --- */
  const A5_PG = '<div class="a5-pg"></div>';
  const A5_OFFICE_ADDR = 'สำนักงาน ป.ป.ท.<br>อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ<br>อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐';
  const A5_COURT = 'อาญาคดีทุจริตและประพฤติมิชอบ';
  /* ช่องติ๊ก ☐/☑ ตามต้นฉบับ (วาดด้วย CSS ไม่ใช่รูปภาพ) */
  const a5Cb = (on, label = '') => `<span class="a5-cb${on ? ' on' : ''}"></span>${label ? `<span>${escapeHtml(label)}</span>` : ''}`;
  /* ช่องกรอกเส้นทึบ — แบบพิมพ์ของศาล (แบบ ๑๑–๑๖) ใช้เส้นใต้ทึบแทนจุดไข่ปลา */
  const a5Us = (v, w) => `<span class="a5-solid">${a5F(v, w)}</span>`;
  const a5PgNo = (n) => `<p class="a5-pgno">-${a5Num(n)}-</p>`;
  /* ตราประจำแบบพิมพ์มุมล่างซ้ายของทุกหน้า ("ปปท. ....." ในต้นฉบับ) */
  const a5Foot = () => `<p class="a5-pgfoot">ปปท. ${a5F('', 70)}</p>`;
  /* บล็อกลายเซ็น: (ลงชื่อ) ......... / (ชื่อ) / ตำแหน่ง — ตรงตามต้นฉบับทุกฉบับ */
  const a5SignCol = (name, role, label = '(ลงชื่อ)', sub = '') =>
    `<div class="a5-sign-col"><p class="a5-sign-rule">${label ? `${escapeHtml(label)} ` : ''}<span class="a5-sign-dots"></span></p>${a5Sign(name, role)}${sub ? `<p class="a5-sign-note">${escapeHtml(sub)}</p>` : ''}</div>`;
  /* Form 1 signature block — 2-line layout per source: dotted line with role text inline, then (name) below */
  const a5SignForm1 = (name, role) =>
    `<div class="a5-sign-col a5-sign-form1-col"><p class="a5-sign-rule"><span class="a5-sign-dots"></span>${escapeHtml(role)}</p><p class="a5-sign-name a5-lock">(${name ? escapeHtml(name) : '...............................'})</p></div>`;
  /* แยกวันที่เป็น วันที่ / เดือน / พ.ศ. ตามช่องกรอกในต้นฉบับ */
  const a5DMY = (iso) => {
    const m = String(iso || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { d: '', mo: '', y: '' };
    return { d: String(Number(m[3])), mo: A5_THAI_MONTHS[Number(m[2]) - 1] || '', y: String(Number(m[1]) + 543) };
  };
  const a5DateParts = (iso, wd = 55, wm = 120, wy = 65) => {
    const p = a5DMY(iso);
    return `วันที่ ${a5F(p.d, wd)} เดือน ${a5F(p.mo, wm)} พ.ศ. ${a5F(p.y, wy)}`;
  };
  /* หัวกระดาษ "บันทึกข้อความ" (แบบ ๒/๓/๔/๑๙) — ตราครุฑ + ชื่อแบบ ตามต้นฉบับ */
  const a5MemoHdr = () => `<header class="a5-hdr a5-hdr-memo"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="50" height="54"><h2 class="a5-hdr-title">บันทึกข้อความ</h2></header>`;
  const a5MemoMeta = (unit, refNo, dateISO) => `
      <div class="a5-line a5-memo-row"><b>ส่วนราชการ</b>${a5F(unit || 'กอง/สำนัก', 300)}<b>โทร.</b>${a5F('', 130)}</div>
      <div class="a5-line a5-memo-row"><b>ที่</b> ปป ๐๐../${a5F(refNo || '', 200)}<b>วันที่</b>${a5F(a5DateShort(dateISO), 170)}</div>`;
  /* หัวกระดาษหนังสือออก (แบบ ๕/๘/๙/๑๐/๑๗/๑๘) — ที่ ปป ซ้าย, ที่อยู่สำนักงานขวา, วันที่กลาง */
  const a5LetterHdr = (note, refNo, dateISO) => `<header class="a5-hdr a5-hdr-letter">
      ${note ? `<p class="a5-letter-note">${escapeHtml(note)}</p>` : ''}
      <div class="a5-letter-top">
        <p class="a5-letter-ref">ที่ ปป ${a5F(refNo || '', 110)}/${a5F('', 70)}</p>
        <img class="a5-garuda a5-garuda-letter" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="44" height="48">
        <p class="a5-letter-org">${A5_OFFICE_ADDR}</p>
      </div>
      <p class="a5-letter-date">${a5DateParts(dateISO)}</p>
    </header>`;
  /* ท้ายหนังสือออก — กอง/สำนัก โทร โทรสาร ผู้รับผิดชอบ */
  /* who = คำเรียกผู้รับผิดชอบท้ายหนังสือ — แบบ ๕ ใช้ "เจ้าของสำนวน", แบบ ๘/๙/๑๐/๑๗/๑๘ ใช้ "ผู้รับผิดชอบ" */
  const a5LetterFoot = (unit, owner, who = 'ผู้รับผิดชอบ') => `<div class="a5-letter-foot">
      <p>กอง/สำนัก ${a5F(unit || '', 200)}</p>
      <p>โทร. ${a5F('', 200)}</p>
      <p>โทรสาร ${a5F('', 200)}</p>
      ${who === 'ผู้รับผิดชอบ' ? `<p>(นาย/นาง/นางสาว ${a5F(owner || '', 200)} ผู้รับผิดชอบ)</p>` : ''}
      <p class="a5-hint">(ระบุชื่อ${escapeHtml(who)}และหมายเลขโทรศัพท์ที่สามารถติดต่อได้สะดวก)</p>
    </div>`;
  /* ===== แบบ ปปท. ๑ — แผนงานคดี (ไต่สวนเบื้องต้น/ไต่สวน) · ๒ หน้า ===== */
  function paperPlan(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, p = i.prelim || {}, intake = i.intake || {}, q = i.inquiry644 || {};
    if (c.decision === '58/2') return paperSpecial58(state);
    const fromNacc = Boolean(intake.sourceTypes?.fromNacc);
    const fromMisconduct = Boolean(intake.sourceTypes?.misconduct);
    const deadline60 = p.deadlineAt || addDays(intake.receivedFirstAt, 60);
    const deadline2Y = p.storedTwoYearDeadlineAt || addDays(intake.receivedFirstAt, 730);
    const accused = (q.accused && q.accused.length) ? q.accused : [];
    const subject = state.documentData?.documentSubject || c.subject || '';
    const issues = p.issues || {}, lim = p.limitation || {};
    const planLines = String(p.plan || '').split('\n').filter(Boolean);
    const workLog = String(p.workLog || '').split('\n').filter(Boolean);
    const witnesses = (p.witnesses || []).filter(Boolean);
    return `<section class="a5-paper">
      <header class="a5-hdr a5-hdr-bare"><h2 class="a5-hdr-title">แผนงานคดี (ไต่สวนเบื้องต้น/ไต่สวน)</h2></header>
      <div class="a5-line a5-plan-top"><b>เรื่องที่</b>${a5F(c.id || '', 220)}<label>${a5Cb(fromNacc, 'คดีรับจาก ป.ป.ช.')}</label><label>${a5Cb(fromMisconduct, 'คดีประพฤติมิชอบ')}</label></div>
      <div class="a5-line">สำนักงาน ป.ป.ท. รับเรื่องเมื่อวันที่${a5F(a5DateShort(intake.receivedFirstAt), 190)}ครบกำหนด ๖๐ วัน วันที่${a5F(a5DateShort(deadline60), 170)}</div>
      <div class="a5-line">ครบกำหนด ๒ ปี วันที่${a5F(a5DateShort(deadline2Y), 190)}</div>
      <div class="a5-line"><b>ผู้กล่าวหา</b>${a5F(c.complainant || '', 560)}</div>
      <div class="a5-line"><b>ผู้ถูกกล่าวหา</b> ${accused.map((name, index) => `<span class="a5-plan-accused-item">${a5Num(index + 1)}.${a5F(name || '', 520)}</span>`).join('') || a5F('', 520)}</div>
      <div class="a5-line"><b>ข้อกล่าวหา (ประเด็นแห่งคดี)</b>${a5F(q.allegations || subject, 440)}</div>
      <div class="a5-line"><b>วันเวลาสถานที่เกิดเหตุ</b>${a5F(p.place || '', 480)}</div>
      <div class="a5-line"><b>อายุความสั้น/ยาวสุด</b> มาตรา${a5F(lim.shortSection || '', 70)} อายุความ${a5F(lim.shortYears || '', 60)} ปี ขาดอายุความวันที่${a5F(a5DateShort(lim.shortExpiry) || lim.shortExpiry || '', 190)}</div>
      <div class="a5-line a5-indent2">มาตรา${a5F(lim.longSection || '', 70)} อายุความ${a5F(lim.longYears || '', 60)} ปี ขาดอายุความวันที่${a5F(a5DateShort(lim.longExpiry) || lim.longExpiry || '', 190)}</div>
      <p class="a5-plan-accused">ผู้ถูกกล่าวหา ${a5F(accused[0] || '', 90)}</p>
      ${(p.accusedTables && p.accusedTables.length ? p.accusedTables : [{ name: accused[0] || '', rows: [
        { issue: 'สถานะ', details: issues.status || '', requiredEvidence: issues.statusDocs || '', action: issues.statusTodo || '', checks: [] },
        { issue: 'อำนาจหน้าที่', details: issues.authority || '', requiredEvidence: issues.authorityDocs || '', action: issues.authorityTodo || '', checks: [] },
        { issue: 'การกระทำความผิด', details: issues.action || '', requiredEvidence: issues.actionDocs || '', action: issues.actionTodo || '', checks: [] },
        { issue: 'ความเสียหาย', details: issues.damage || '', requiredEvidence: issues.damageDocs || '', action: issues.damageTodo || '', checks: [] }
      ] }]).map(table => {
        const rowStatus = table.rows[0], rowAuthority = table.rows[1], rowAct = table.rows[2], rowDamage = table.rows[3];
        return `<table class="a5-tbl a5-plan-tbl"><thead><tr>
        <th style="width:22%">ประเด็น</th><th style="width:38%">ข้อมูลในต้องใช้<br>(แล้วแต่กรณี)</th><th style="width:40%">สิ่งที่ต้องดำเนินการ</th>
      </tr></thead><tbody>
        <tr>
          <td>สถานะ<br>${a5F(rowStatus.details || '', 110)}</td>
          <td class="a5-cbcell">
            <div>${a5Cb(Boolean(rowStatus.checks?.[0]), 'กพ.๗/สัญญาจ้าง')} ${a5F(rowStatus.requiredEvidence || '', 160)}</div>
            <div>${a5Cb(Boolean(rowStatus.checks?.[1]), 'เลขบัตรประชาชน/ทะเบียนราษฎร์')}</div>
            <div>${a5Cb(Boolean(rowStatus.checks?.[2]), 'ระเบียบข้อบังคับ/ประกาศเกี่ยวกับวินัย')}</div>
            <div>${a5Cb(Boolean(rowStatus.checks?.[3]), 'คำสั่งไล่ออก/ให้ออก/ลาออก/เกษียณอายุราชการ/ใบมรณบัตร')}</div>
          </td>
          <td>${a5F(rowStatus.action || '', 180)}</td>
        </tr>
        <tr>
          <td>อำนาจหน้าที่<br>${a5F(rowAuthority.details || '', 110)}</td>
          <td class="a5-cbcell">
            <div>${a5Cb(Boolean(rowAuthority.checks?.[0]), 'คำสั่งแต่งตั้ง/มอบหมาย')} ${a5F(rowAuthority.requiredEvidence || '', 160)}</div>
            <div>${a5Cb(Boolean(rowAuthority.checks?.[1]), 'หลักฐานการมอบหมายให้ทำหน้าที่จากผู้บังคับบัญชา')}</div>
            <div>${a5Cb(Boolean(rowAuthority.checks?.[2]), 'มาตรฐานกำหนดตำแหน่ง (Job Description)')}</div>
          </td>
          <td>${a5F(rowAuthority.action || '', 180)}</td>
        </tr>
        <tr>
          <td>การกระทำความผิด<br>${a5F(rowAct.details || '', 110)}</td>
          <td class="a5-cbcell">
            <div>${a5Cb(Boolean(rowAct.checks?.[0]), 'พยานหลักฐานยืนยันการกระทำความผิด')} ${a5F(rowAct.requiredEvidence || '', 140)}</div>
            <div>${a5Cb(Boolean(rowAct.checks?.[1]), 'รายงาน คกก.สอบข้อเท็จจริง/วินัย/ละเมิดของต้นสังกัด')}</div>
          </td>
          <td>${a5F(rowAct.action || '', 180)}</td>
        </tr>
        <tr>
          <td>ความเสียหาย<br>${a5F(rowDamage.details || '', 110)}</td>
          <td class="a5-cbcell">${a5F(rowDamage.requiredEvidence || '', 240)}</td>
          <td>${a5F(rowDamage.action || '', 180)}</td>
        </tr>
      </tbody></table>`;
      }).join('')}
      ${a5Foot()}
      ${A5_PG}
      ${a5PgNo(2)}
      <p class="a5-plan-h">สรุปที่ต้องดำเนินการ</p>
      ${(workLog.length ? workLog : ['']).map(w => `<div class="a5-line">${a5F(w, 640)}</div>`).join('')}
      <p class="a5-plan-h">พยานบุคคลที่ต้องบันทึกถ้อยคำ/เกี่ยวข้องอย่างไร/สอบประเด็นใด</p>
      <div class="a5-line a5-indent">๑. ผู้กล่าวหา ${a5F(c.complainant || '', 500)}</div>
      ${witnesses.map((row, index) => { const witness = typeof row === 'string' ? { name: row, relevance: '', issues: '' } : row || {}; return `<div class="a5-line a5-indent">${a5Num(index + 2)}. พยาน ${a5F(witness.name || '', 420)}${witness.relevance ? ` <span class="a5-plan-witness-note">เกี่ยวข้อง: ${escapeHtml(witness.relevance)}</span>` : ''}${witness.issues ? ` <span class="a5-plan-witness-note">สอบประเด็น: ${escapeHtml(witness.issues)}</span>` : ''}</div>`; }).join('') || ''}
      <p class="a5-plan-h">พยานเอกสารที่ต้องขอเพิ่มเติมมีอะไรบ้าง/ ขอจากหน่วยงานใด</p>
      ${(p.requestedDocuments?.length ? p.requestedDocuments : [{}, {}, {}]).map((item, index) => `<div class="a5-line a5-indent">${index + 1}. ${a5F(`${item.name || ''}${item.agency ? ` / ${item.agency}` : ''}`, 580)}</div>`).join('')}
      <p class="a5-plan-h">การดำเนินการอื่น ๆ</p>
      ${['ตรวจสอบสถานที่เกิดเหตุ', 'จัดทำแผนที่เกิดเหตุ'].map((fixedLabel, index) => `<div class="a5-line a5-indent">${index + 1}. ${fixedLabel} ${a5F(p.otherOperationsFixed?.[index]?.detail || '', 460)}</div>`).join('')}
      ${(p.otherOperations || []).map((item, index) => `<div class="a5-line a5-indent">${index + 3}. ${a5F(item.description || '', 580)}</div>`).join('')}
      <p class="a5-plan-h">แผนการไต่สวน</p>
      <table class="a5-tbl"><thead><tr><th style="width:28%">วัน/เดือน/ปี</th><th>การดำเนินการ</th></tr></thead><tbody>
        ${(p.scheduleRows?.length ? p.scheduleRows : (planLines.length ? planLines.map(action => ({ date: '', action })) : [{}, {}, {}, {}, {}])).map(row => `<tr><td>${a5F(a5DateShort(row.date) || row.date || '', 120)}</td><td>${a5F(row.action || '', 400)}</td></tr>`).join('')}
      </tbody></table>
      <div class="a5-sign a5-sign-stack a5-sign-form1">
        ${a5SignForm1(intake.investigator, 'พนักงาน ป.ป.ท. เจ้าของสำนวน')}
        ${a5SignForm1((intake.team || [])[0], 'เจ้าหน้าที่ ป.ป.ท. ผู้ช่วยเจ้าของสำนวน')}
        ${a5SignForm1(intake.director, 'หัวหน้าพนักงาน ป.ป.ท.')}
      </div>
      <p class="a5-form-code">${escapeHtml(A5_FORMS.plan.code)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๒ (๒๑๓) / ๓ (๖๔๔) — บันทึกข้อความขอขยายระยะเวลาการไต่สวน · ๓ หน้า ===== */
  function paperExt(state, reportType) {
    const c = state.caseData || {}, i = state.inquiry || {}, rep = reportOf(reportType, i) || {}, intake = i.intake || {};
    const is213 = reportType === '213';
    const formCode = A5_FORMS[is213 ? 'ext213' : 'ext644'].code;
    const history = rep.extensionHistory || [];
    const approved = history.filter(h => h.status === 'APPROVED');
    const pending = history.find(h => h.status === 'PENDING');
    const roundNo = approved.length + 1;
    const priorDays = approved.reduce((sum, h) => sum + Number(h.days || h.requestedDays || 0), 0);
    const days = pending ? (pending.requestedDays ?? '') : EXTENSION_DAYS;
    const deadline = rep.deadlineAt || addDays(intake.receivedFirstAt, is213 ? 60 : 270);
    const nextDeadline = days === '' ? '' : addDays(deadline, days);
    const deadline2Y = addDays(intake.receivedFirstAt, 730);
    const dirs = approved.filter(h => h.role === 'director');
    const secs = approved.filter(h => h.role === 'secretary');
    const pendDir = pending?.role === 'director' ? pending : null;
    const pendSec = pending?.role === 'secretary' ? pending : null;
    const opText = e => !e ? '' : e.status === 'APPROVED' ? (e.reason || 'ตามเสนอ') : e.status === 'DENIED' ? `ไม่อนุมัติ — ${e.denyNote || ''}` : 'รอพิจารณา';
    const steps = [dirs[0] || pendDir, dirs[1] || (dirs.length ? pendDir : null), secs[0] || pendSec, secs[1] || (secs.length ? pendSec : null)];
    const opinions = steps.map(opText);
    const signs = steps.map(s => s?.approvedBy || '');
    const chosen = steps.map(s => s?.status === 'APPROVED');
    const subject = state.documentData?.documentSubject || c.subject || '';
    const requestDetails = pending || approved.at(-1) || {};
    const fromNacc = Boolean(intake.m62?.flag) || String(c.decision || '').includes('62');
    const fromMisconduct = String(c.decision || '').includes('18/4');
    const recv = a5DMY(intake.receivedFirstAt);
    const nx = a5DMY(nextDeadline);
    const st = a5DMY(deadline);
    /* ข้อ ๕–๘ ความเห็นตามลำดับชั้น — โครงเดียวกันทั้งสี่ชั้น ตามต้นฉบับ */
    const opinionBlock = (no, title, meta, idx, role) => `
      <p class="a5-num-h"><b>${no}. ${title}</b>${meta}</p>
      <div class="a5-indent">
        <div class="a5-cbline">${a5Cb(chosen[idx], 'เห็นควรอนุมัติให้ขยายระยะเวลาตามเสนอ')}</div>
        <div class="a5-cbline">${a5Cb(false, 'เห็นควรอนุมัติให้ขยายระยะเวลาจำนวน')}${a5F('', 60)} วัน เนื่องจาก ${a5F(opinions[idx], 300)}</div>
        <div class="a5-cbline">${a5Cb(false, 'อื่น ๆ')} ${a5F('', 430)}</div>
      </div>
      <div class="a5-sign">${a5SignCol(signs[idx], role, '')}</div>`;
    return `<section class="a5-paper">
      ${a5MemoHdr()}
      ${a5MemoMeta(intake.unit, c.id, todayISO())}
      <div class="a5-line a5-memo-row"><b>เรื่อง</b> การขอขยายระยะเวลาการไต่สวน${is213 ? 'เบื้องต้น' : ''} เรื่องที่${a5F(c.id || '', 150)} ครั้งที่ ${a5F(String(roundNo), 60)}</div>
      <div class="a5-line"><b>เรียน</b> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</div>
      <p class="a5-indent">(ผ่านเลขาธิการคณะกรรมการ/ผู้อำนวยการกอง/สำนัก ${a5F(intake.unit || '', 330)})</p>

      <p class="a5-num-h a5-indent"><b>๑. เรื่องเดิม</b></p>
      <p class="a5-indent2">๑.๑ สำนักงาน ป.ป.ท. ได้รับเรื่องกล่าวหา${is213 ? '' : 'จาก'}</p>
      <div class="a5-indent3 a5-cbline">${a5Cb(fromNacc, 'ตามมาตรา ๑๘/๑ (รับมอบจากคณะกรรมการ ป.ป.ช.)')}</div>
      <div class="a5-indent3 a5-cbline">${a5Cb(fromMisconduct, 'ตามมาตรา ๑๘/๔ (คดีประพฤติมิชอบ)')}</div>
      <p>เมื่อวันที่ ${a5F(recv.d, 55)} เดือน ${a5F(recv.mo, 120)} พ.ศ. ${a5F(recv.y, 65)} คดีระหว่าง${a5F(c.complainant || '', 250)} (ผู้กล่าวหา)
        กับ${a5F(a5AccusedLine(state), 230)} (ผู้ถูกกล่าวหา) ตำแหน่ง${a5F('', 160)} สังกัด${a5F(c.agency || '', 250)}
        กรณี (ระบุพฤติการณ์การกระทำผิดพอสังเขป) ${a5F(subject, 330)}</p>
      ${is213 ? `
      <p class="a5-indent2">๑.๒ สำนวนคดีนี้</p>
      <div class="a5-indent3 a5-cbline">${a5Cb(true, 'ครบระยะเวลา ๖๐ วัน ในวันที่')}${a5F(a5DateShort(deadline), 170)} และการขอขยายระยะเวลาในครั้งนี้เป็นครั้งที่ ${a5F(String(roundNo), 55)}</div>
      <p class="a5-indent3">(กรณีเคยขอขยายระยะเวลามาแล้วให้ระบุเพิ่มเติมว่า “โดยที่ผ่านมาได้มีการขอขยายระยะเวลามาแล้วจำนวน ${a5F(String(approved.length), 50)} ครั้ง
        รวมเป็นจำนวน ${a5F(String(priorDays), 55)} วัน และจะครบกำหนดระยะเวลาที่ขอขยายในวันที่ ${a5F(nx.d, 50)} เดือน ${a5F(nx.mo, 110)} พ.ศ. ${a5F(nx.y, 60)}”)</p>
      <div class="a5-indent3 a5-cbline">${a5Cb(false, 'ครบระยะเวลา ๒ ปี ในวันที่')}${a5F(a5DateShort(deadline2Y), 260)}</div>
      <p class="a5-indent2">๑.๓ ชื่อ-สกุล ${a5F(intake.investigator || '', 200)} ตำแหน่ง ${a5F('พนักงาน ป.ป.ท.', 150)} สังกัด ${a5F(intake.unit || '', 170)} ผู้รับผิดชอบสำนวน</p>` : `
      <p class="a5-indent2">๑.๒ สำนวนคดีนี้เป็นการไต่สวนโดย (คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน)
        ตามคำสั่ง${a5F(i.committee213?.orderNo || '', 200)} ลับ ที่ ${a5F('', 90)}/${a5F('', 70)}
        ลง${a5DateParts(i.committee213?.orderDate, 50, 110, 60)} โดยมีองค์ประกอบดังนี้</p>
      <p class="a5-indent3">(๑) ${a5F(intake.director || '', 220)} เป็น (ประธานอนุกรรมการ/หัวหน้าพนักงาน ป.ป.ท.)</p>
      <p class="a5-indent3">(๒) ${a5F((intake.team || [])[0] || '', 220)} เป็น (อนุกรรมการ/พนักงาน ป.ป.ท.)</p>
      <p class="a5-indent3">(๓) ${a5F(i.inquiry644?.investigator || intake.investigator || '', 220)} เป็น (อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวนคดี)</p>
      <p class="a5-indent2">๑.๓ สำนวนการไต่สวนคดีนี้ ครบระยะเวลา ๒ ปี ในวันที่ ${a5F(a5DateShort(deadline), 180)} และการขอขยายระยะเวลาในครั้งนี้ เป็นครั้งที่ ${a5F(String(roundNo), 55)}</p>
      <p class="a5-indent3">(กรณีเคยขอขยายระยะเวลามาแล้วให้ระบุเพิ่มเติมว่า “โดยที่ผ่านมาได้มีการขอขยายระยะเวลามาแล้วจำนวน ${a5F(String(approved.length), 50)} ครั้ง
        รวมเป็นจำนวน ${a5F(String(priorDays), 55)} วัน และจะครบกำหนดระยะเวลาที่ขอขยายในวันที่ ${a5F(nx.d, 50)} เดือน ${a5F(nx.mo, 110)} พ.ศ. ${a5F(nx.y, 60)}”)</p>`}

      <p class="a5-num-h a5-indent"><b>๒. ข้อกฎหมาย</b></p>
      <p class="a5-indent2">๒.๑ พระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม (ฉบับที่ ๔) มาตรา ๒๓ ประกอบบทเฉพาะกาล มาตรา ๒๐ วรรคสอง</p>
      <p class="a5-indent2">๒.๒ ระเบียบคณะกรรมการ ป.ป.ท. ว่าด้วยหลักเกณฑ์และวิธีการไต่สวน พ.ศ. ๒๕๖๘ ข้อ ${is213 ? '๓๘' : '๖๔'}</p>

      <p class="a5-num-h a5-indent"><b>๓. ข้อเท็จจริง</b></p>
      <p class="a5-indent2">${is213 ? 'พนักงาน ป.ป.ท. เจ้าของสำนวน/ผู้รับผิดชอบสำนวน' : 'อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวน/ผู้รับผิดชอบสำนวน'} ขอชี้แจงข้อเท็จจริงการดำเนินการ ดังนี้</p>
      <p class="a5-indent2">๓.๑ รายละเอียดการดำเนินการที่ผ่านมา (พอสังเขป)</p>
      <div class="a5-line">${a5F(requestDetails.workDone || '', 640)}</div>
      <div class="a5-line">${a5F('', 640)}</div>
      <p class="a5-indent2">๓.๒ การดำเนินการที่เหลืออยู่</p>
      <div class="a5-line">${a5F(requestDetails.workRemaining || '', 640)}</div>
      <div class="a5-line">${a5F('', 640)}</div>
      ${is213 ? `
      <p class="a5-indent2">๓.๓ ปัญหาและอุปสรรคที่ไม่สามารถดำเนินการแล้วเสร็จภายในระยะเวลา</p>
      <div class="a5-line">${a5F(requestDetails.obstacles || '', 640)}</div>
      <div class="a5-line">${a5F('', 640)}</div>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}` : `
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <p class="a5-indent2">๓.๓ ปัญหาและอุปสรรคที่ไม่สามารถดำเนินการแล้วเสร็จภายในระยะเวลา</p>
      <div class="a5-line">${a5F(requestDetails.obstacles || '', 640)}</div>
      <div class="a5-line">${a5F('', 640)}</div>`}

      <p class="a5-num-h a5-indent"><b>๔. ข้อพิจารณา</b></p>
      <p class="a5-indent2">เหตุผลและความจำเป็นในการขอขยายระยะเวลา ${a5F(requestDetails.reason || '', 430)}</p>
      <p class="a5-indent2">${is213 ? 'พนักงาน ป.ป.ท. เจ้าของสำนวน/ผู้รับผิดชอบสำนวน' : 'คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน'} จึงขออนุมัติขยายระยะเวลาการไต่สวน
        ครั้งที่ ${a5F(String(roundNo), 55)} จำนวน ${a5F(String(days), 60)} วัน นับตั้งแต่วันที่ ${a5F(st.d, 50)} เดือน ${a5F(st.mo, 110)} พ.ศ. ${a5F(st.y, 60)}
        ทั้งนี้จะครบกำหนดระยะเวลาที่ขอขยายในวันที่ ${a5F(nx.d, 50)} เดือน ${a5F(nx.mo, 110)} พ.ศ. ${a5F(nx.y, 60)}</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณา หากเห็นชอบ ขอได้โปรดอนุมัติตามข้อ ๓</p>
      <div class="a5-sign">${a5SignCol(intake.investigator, is213 ? 'พนักงาน ป.ป.ท. เจ้าของสำนวน / เจ้าหน้าที่ ป.ป.ท. ผู้ช่วย' : 'อนุกรรมการและเลขานุการ / พนักงาน ป.ป.ท. หรือเจ้าหน้าที่ ป.ป.ท. เจ้าของสำนวน', '')}</div>

      ${opinionBlock('๕', 'ความเห็นผู้บังคับบัญชาชั้นต้น', ' (หัวหน้าพนักงาน ป.ป.ท.)', 0, 'หัวหน้าพนักงาน ป.ป.ท.')}
      ${opinionBlock('๖', 'ความเห็นผู้อำนวยการกอง/สำนัก', ` (หัวหน้าพนักงาน ป.ป.ท.) (เรื่องที่ ${a5F(c.id || '', 120)} คำสั่งที่ ${a5F(intake.orderNo || '', 190)})`, 1, 'หัวหน้าพนักงาน ป.ป.ท.')}
      ${a5Foot()}${A5_PG}${a5PgNo(3)}
      ${opinionBlock('๗', 'ความเห็นผู้ช่วยเลขาธิการ / รองเลขาธิการฯ', ` (เรื่องที่ ${a5F(c.id || '', 120)} คำสั่งที่ ${a5F(intake.orderNo || '', 190)})`, 2, 'ผู้ช่วยเลขาธิการ / รองเลขาธิการ ป.ป.ท.')}
      ${opinionBlock('๘', 'ความเห็นเลขาธิการฯ', ` (เรื่องที่ ${a5F(c.id || '', 120)} คำสั่งที่ ${a5F(intake.orderNo || '', 190)})`, 3, 'เลขาธิการคณะกรรมการ ป.ป.ท.')}

      <p class="a5-num-h"><b>เรียน ประธานกรรมการ ป.ป.ท.</b> (เรื่องที่ ${a5F(c.id || '', 120)} คำสั่งที่ ${a5F(intake.orderNo || '', 210)})</p>
      <p class="a5-indent2">เพื่อประโยชน์ในการพิจารณาขยายระยะเวลา${is213 ? 'การไต่สวน' : 'ดำเนินการไต่สวน'}ตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม และเรื่องดังกล่าวอยู่ระหว่างดำเนินการยังไม่แล้วเสร็จตามเงื่อนไขระยะเวลาที่กำหนดไว้ จึงเห็นควรบรรจุเข้าวาระประชุมคณะกรรมการ ป.ป.ท. เพื่อพิจารณา</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณา</p>
      <div class="a5-sign">${a5SignCol(rep.lateReport ? 'เลขาธิการคณะกรรมการ ป.ป.ท.' : '', 'เลขาธิการ ป.ป.ท.', '')}</div>

      <div class="a5-note">
        <p><b>หมายเหตุ</b></p>
        <p>๑. ผู้รับผิดชอบสามารถปรับเนื้อหาให้ตรงกับข้อเท็จจริงของคดีและหากข้อความใดไม่ใช้ให้ตัดทิ้ง</p>
        <p>๒. ให้แนบเอกสาร ดังต่อไปนี้</p>
        <p class="a5-indent">๒.๑ แผนงานคดี และบันทึกการปฏิบัติงาน</p>
        <p class="a5-indent">๒.๒ เอกสารหลักฐานที่ระบุวันที่สำนักงาน ป.ป.ท. รับเรื่อง</p>
        ${is213 ? '' : '<p class="a5-indent">๒.๓ คำสั่งแต่งตั้งไต่สวน</p>'}
        <p>๓. การขอขยายระยะเวลาดังกล่าวต้องเสนอก่อนครบกำหนด ๑๕ วัน เป็นอย่างช้า</p>
      </div>
      <p class="a5-form-code">${escapeHtml(formCode)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๔ — บันทึกข้อความ รายงานการไต่สวนเบื้องต้น · ๖ หน้า ===== */
  function paper213(state) {
    const reportApi = globalThis.ECMISActivity5Report213;
    const normalizedReport = reportApi?.normalizeReport213A5?.(state);
    const canonicalReport = normalizedReport?.state?.a5DocumentStore?.records?.filter(record => record.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
    if (canonicalReport?.payload && Object.keys(canonicalReport.payload).length === 18) return reportApi.renderReport213PaperA5(canonicalReport.payload);
    const c = state.caseData || {}, i = state.inquiry || {}, p = i.prelim || {}, intake = i.intake || {}, m62 = intake.m62 || {}, m = i.committee213 || {}, q = i.inquiry644 || {};
    const deadline60 = p.deadlineAt || addDays(intake.receivedFirstAt, 60);
    const accused = a5AccusedLine(state);
    const subject = state.documentData?.documentSubject || c.subject || '';
    const chain = p.reviewChain || [];
    const lvl = n => chain.find(x => x.level === n) || {};
    const fromNacc = Boolean(m62.flag) || String(c.decision || '').includes('62');
    const issues = p.issues || {};
    const team = intake.team || [];
    const res = m.result || '';
    const isSub = m.orderType === '24v3';
    /* ตัวเลือกข้อ ๑๔.๑ (๑)–(๑๘) ตามต้นฉบับ — ติ๊กตามมติ/ข้อเสนอที่บันทึกไว้ */
    const PROPOSALS = [
      [res === 'รับไว้ไต่สวน', 'เห็นควรรับไว้ไต่สวน ตามนัยมาตรา ๒๔ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากปรากฏพฤติการณ์และพยานหลักฐานเพียงพอที่จะดำเนินการไต่สวนข้อเท็จจริง โดยเห็นควรมอบหมายคณะพนักงานไต่สวน หรือโดยเห็นควรตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องที่สำคัญหรือมีความซับซ้อน (ให้ระบุว่าสำคัญหรือซับซ้อนอย่างไร โดยพิจารณาจากหลักเกณฑ์และเงื่อนไขตามมติคณะกรรมการ ป.ป.ท. ครั้งที่ ๑๖/๒๕๖๘ ลงวันที่ ๕ มีนาคม ๒๕๖๘ แจ้งเวียนตามหนังสือกองกฎหมาย ด่วนที่สุด ที่ ปป ๐๐๐๒/ว ๕๕๙ ลงวันที่ ๖ มีนาคม ๒๕๖๘)'],
      [res === 'ไม่รับไว้ไต่สวน', 'เห็นควรไม่รับไว้ไต่สวนข้อเท็จจริง เนื่องจากไม่ปรากฏพฤติการณ์และพยานหลักฐานเพียงพอจะดำเนินการไต่สวนข้อเท็จจริง'],
      [false, 'ไม่รับเรื่องไว้พิจารณา เนื่องจากผู้ถูกกล่าวหาไม่ใช่เจ้าหน้าที่รัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม'],
      [false, 'ไม่รับเรื่องไว้พิจารณา เนื่องจากไม่ใช่การกล่าวหาว่ากระทำทุจริตในภาครัฐ ตามนัยมาตรา ๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม'],
      [false, 'เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๑ (ข)(๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากขณะรับเรื่องจากคณะกรรมการ ป.ป.ช. ได้ล่วงพ้นเวลาที่จะดำเนินการทางวินัยและดำเนินคดีอาญาแก่ผู้ถูกร้องแล้ว'],
      [false, 'เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๑ (ข)(๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากขณะรับเรื่องจากคณะกรรมการ ป.ป.ช. เหลือเวลาไม่ถึง ๖ เดือนและไม่อยู่ในวิสัยที่จะดำเนินการให้แล้วเสร็จก่อนล่วงพ้นเวลาดังกล่าวได้']
    ];
    const PROPOSALS2 = [
      [false, 'เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช. ดำเนินการตามอำนาจหน้าที่ต่อไป ตามนัยมาตรา ๑๘/๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นกรณีร้องเรียนว่าร่ำรวยผิดปกติ / เป็นกรณีร้องเรียนความผิดตามพระราชบัญญัติว่าด้วยความผิดเกี่ยวกับการเสนอราคาต่อหน่วยงานของรัฐ พ.ศ. ๒๕๔๒ / เป็นกรณีร้องเรียนผู้บริหารท้องถิ่นว่ามีส่วนร่วมในการกระทำความผิด / จึงเป็นเรื่องที่ไม่อยู่ในหน้าที่และอำนาจของคณะกรรมการ ป.ป.ท. หรือเป็นเรื่องที่ไม่อยู่ในหน้าที่และอำนาจของคณะกรรมการ ป.ป.ท. รวมอยู่ด้วย'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๑) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ช. รับไว้พิจารณาหรือได้วินิจฉัยเสร็จเด็ดขาดแล้ว'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๒) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ท. ได้วินิจฉัยเสร็จเด็ดขาดแล้ว และไม่มีพยานหลักฐานใหม่ซึ่งเป็นสาระสำคัญแห่งคดี'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่เป็นคดีอาญาในประเด็นเดียวกันและศาลประทับฟ้องหรือพิพากษาหรือมีคำสั่งเสร็จเด็ดขาดแล้วโดยไม่มีการถอนฟ้องหรือทิ้งฟ้อง หรือเป็นกรณีที่ศาลยังไม่ได้วินิจฉัยในเนื้อหาแห่งคดี'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๕ (๔) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากผู้ถูกร้องตาย'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๕) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ผู้ถูกร้องพ้นจากการเป็นเจ้าหน้าที่ของรัฐก่อนถูกกล่าวหาเกินห้าปี'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๑) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ไม่ระบุพยานหลักฐานหรือระบุพฤติการณ์แห่งการกระทำที่ชัดเจนเพียงพอที่จะดำเนินการไต่สวนได้'],
      [false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๒) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่ล่วงเลยมาแล้วเกินห้าปีนับแต่วันเกิดเหตุจนถึงวันที่มีการกล่าวหาและเป็นเรื่องที่ไม่อาจหาพยานหลักฐานเพียงพอที่จะดำเนินการไต่สวนต่อไปได้']
    ];
    const cbRow = (on, text) => `<div class="a5-cbline a5-indent3">${a5Cb(on, text)}</div>`;
    const numRow = (no, on, text) => `<div class="a5-cbline a5-indent3"><span class="a5-opt-no">(${no})</span>${a5Cb(on, text)}</div>`;
    const opinionSign = (name, role) => `<div class="a5-sign">${a5SignCol(name, role)}</div>`;
    return `<section class="a5-paper">
      ${a5MemoHdr()}
      ${a5MemoMeta(intake.unit || 'สำนัก/กอง', c.id, p.submittedAt || todayISO())}
      <div class="a5-line a5-memo-row"><b>เรื่อง</b> รายงานการไต่สวนเบื้องต้น เรื่องที่ ${a5F(c.id || '', 150)} (คดีรับจากสำนักงาน ป.ป.ช. มาตรา ๖๒ / คดีประพฤติมิชอบ)</div>
      <div class="a5-line"><b>เรียน</b> เลขาธิการคณะกรรมการ ป.ป.ท.</div>

      <p class="a5-num-h a5-indent"><b>๑. การรับเรื่อง</b> (เลือกใส่เฉพาะกรณีตามข้อเท็จจริง)</p>
      <p class="a5-indent2"><b>${a5Cb(fromNacc, '')}(คดีรับจากสำนักงาน ป.ป.ช. มาตรา ๖๒)</b></p>
      <p class="a5-indent2">๑.๑ การรับเรื่องจากสำนักงาน ป.ป.ช.</p>
      <p class="a5-indent3">(๑) เมื่อวันที่ ${a5F(a5DateShort(m62.sourceMtiDate), 150)} สำนักงาน ป.ป.ช. รับเรื่องที่ ${a5F(m62.sourceLetter || '', 180)} (ระบุเลขเรื่องของสำนักงาน ป.ป.ช.)
        จาก ${a5F('', 200)} (ระบุช่องทางการรับเรื่อง เช่น บัตรสนเท่ห์ ผู้ร้อง พนักงานสอบสวน สถานีตำรวจ สำนักงานตรวจเงินแผ่นดิน หรือ ${a5F('', 180)})</p>
      <p class="a5-indent3">(๒) สำนักงาน ป.ป.ช./สำนักงาน ป.ป.ช. จังหวัด ${a5F('', 180)} ส่งเรื่องมายังสำนักงาน ป.ป.ท.
        ตามมติคณะกรรมการ ป.ป.ช. ครั้งที่ ${a5F('', 110)} เมื่อวันที่ ${a5F(a5DateShort(m62.sourceMtiDate), 180)}</p>
      <p class="a5-indent2">๑.๒ การรับเรื่องของสำนักงาน ป.ป.ท.</p>
      <p class="a5-indent3">(๑) เมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${a5F(intake.unit || '', 130)}
        รับเรื่องจากสำนักงาน ป.ป.ช. /สำนักงาน ป.ป.ช. จังหวัด ${a5F('', 160)} ครบกำหนด ๖๐ วัน วันที่ ${a5F(a5DateShort(deadline60), 160)}</p>
      <p class="a5-indent3">(๒) เมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)} สำนัก/กอง รับสำนวนจากศูนย์รับเรื่องร้องเรียน กองบริหารคดี</p>
      <p class="a5-indent3">(๓) เมื่อวันที่ ${a5F(a5DateShort(intake.assignedAt || intake.orderDate), 150)} นาย/นาง/นางสาว ${a5F(intake.investigator || '', 180)}
        พนักงาน ป.ป.ท. สำนัก/กอง ${a5F(intake.unit || '', 160)} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวน โดยมี นาย/นาง/นางสาว ${a5F(team[0] || '', 180)} เจ้าหน้าที่ ป.ป.ท. เป็นผู้ช่วย</p>
      <p class="a5-indent3">(๔) เมื่อวันที่ ${a5F('', 150)} นาย/นาง/นางสาว ${a5F('', 170)} พนักงาน ป.ป.ท. สำนัก/กอง ${a5F('', 150)}
        ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวนต่อจากนาย/นาง/นางสาว ${a5F('', 170)} พนักงาน ป.ป.ท. สำนัก/กอง ${a5F('', 150)}</p>
      <p class="a5-indent2"><b>${a5Cb(!fromNacc, '')}(คดีประพฤติมิชอบ)</b></p>
      <p class="a5-indent2">๑.๑ เมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${a5F(intake.unit || '', 140)}
        รับเรื่อง ${a5F('', 170)} ระบุช่องทางรับเรื่อง เช่น หนังสือร้องเรียน สายด่วน ๑๒๐๖ เว็บไซต์สำนักงาน ป.ป.ท. ${a5F('', 160)} ครบกำหนด ๖๐ วัน วันที่ ${a5F(a5DateShort(deadline60), 160)}</p>
      <p class="a5-indent2">๑.๒ เมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)} สำนัก/กอง รับสำนวนจากศูนย์รับเรื่องร้องเรียน กองบริหารคดี</p>
      <p class="a5-indent2">๑.๓ เมื่อวันที่ ${a5F(a5DateShort(intake.assignedAt || intake.orderDate), 150)} นาย/นาง/นางสาว ${a5F(intake.investigator || '', 180)}
        พนักงาน ป.ป.ท. สำนัก/กอง ${a5F(intake.unit || '', 160)} ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวน โดยมี นาย/นาง/นางสาว ${a5F(team[0] || '', 180)} เจ้าหน้าที่ ป.ป.ท. เป็นผู้ช่วย</p>
      <p class="a5-indent2">๑.๔ เมื่อวันที่ ${a5F('', 150)} นาย/นาง/นางสาว ${a5F('', 170)} พนักงาน ป.ป.ท. สำนัก/กอง ${a5F('', 150)}
        ได้รับมอบหมายให้เป็นผู้รับผิดชอบสำนวนต่อจากนาย/นาง/นางสาว ${a5F('', 170)} พนักงาน ป.ป.ท. สำนัก/กอง ${a5F('', 150)}</p>
      <p class="a5-num-h a5-indent"><b>๒. ผู้ร้องเรียน</b> (ระบุชื่อและที่อยู่ หรือขอปกปิดชื่อ โดยกำหนดเป็นลำดับ) เช่น ผู้ร้องเรียนปกปิดตามพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑</p>
      <div class="a5-line a5-indent2">${a5F(c.complainant || '', 600)}</div>
      <p class="a5-num-h a5-indent"><b>๓. ผู้ถูกร้องเรียน</b> (ให้ระบุชื่อ นามสกุล หมายเลขบัตรประจำตัวประชาชน ตำแหน่ง ยศและสังกัด สถานะปัจจุบัน เป็นรายบุคคล โดยกำหนดเป็นผู้ถูกร้องเรียนเป็นลำดับ หากผู้ถูกกล่าวหามีจำนวนมากอาจทำเป็นบัญชีแนบท้ายที่ได้จากการตรวจสอบ)</p>
      <div class="a5-line a5-indent2">${a5F(accused, 600)}</div>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}

      <p class="a5-num-h a5-indent"><b>๔. ข้อกล่าวหา/ร้องเรียนและพฤติการณ์จากคำกล่าวหา/ร้องเรียน</b></p>
      <p class="a5-indent2"><b>๔.๑ ข้อกล่าวหา/ร้องเรียน</b> (สรุปประเด็นข้อกล่าวหา/ร้องเรียน ตามคำกล่าวหา/ร้องเรียน)</p>
      <div class="a5-line a5-indent2">${a5F(q.allegations || subject, 590)}</div>
      <p class="a5-indent2"><b>๔.๒ พฤติการณ์</b> (สรุปข้อเท็จจริงจากคำกล่าวหา/ร้องเรียน)</p>
      <div class="a5-line a5-indent2">${a5F(subject, 590)}</div>
      <p class="a5-num-h a5-indent"><b>๕. การตรวจสอบข้อเท็จจริง</b> (สรุปข้อเท็จจริงที่ได้รับให้ครบ)</p>
      <p class="a5-indent2">๕.๑ คำให้การของผู้กล่าวหา/ร้องเรียน/พยาน ${a5F('', 340)}</p>
      <p class="a5-indent2">๕.๒ ข้อเท็จจริงที่ได้จากการขอทราบข้อเท็จจริงจากหน่วยงาน ${a5F('', 300)}</p>
      <p class="a5-indent2">๕.๓ ผลการดำเนินการสอบข้อเท็จจริง/วินัย/ละเมิดของหน่วยงานต้นสังกัด ${a5F('', 280)}</p>
      <p class="a5-indent2">๕.๔ อื่น ๆ เช่น การตรวจสอบในท้องที่เกิดเหตุหรือดำเนินการอื่น (ถ้ามี) ${a5F(p.workLog || '', 280)}</p>
      <p class="a5-num-h a5-indent"><b>๖. วัน เวลา และสถานที่เกิดเหตุ</b> (หากยังไม่ชัดเจน ควรกำหนดโดยประมาณ) ${a5F(p.place || '', 300)}</p>
      <p class="a5-num-h a5-indent"><b>๗. ความเสียหาย</b> (หากยังไม่ชัดเจน ควรกำหนดโดยประมาณ) ${a5F(issues.damage || '', 350)}</p>
      <p class="a5-num-h a5-indent"><b>๘. พยานหลักฐานประกอบ</b> (พยานหลักฐานที่ผู้กล่าวหาอ้างประกอบคำกล่าวหา/ร้องเรียน หรือที่ได้มาจากการตรวจสอบข้อเท็จจริง ให้ระบุแยกเป็นข้อ ๆ โดยไม่ต้องใส่รายละเอียด ให้ระบุจำนวน)</p>
      <p class="a5-indent2">๘.๑ พยานบุคคล/พยานผู้เชี่ยวชาญ ${a5F((p.witnesses || []).join(', '), 340)}</p>
      <p class="a5-indent2">๘.๒ พยานเอกสาร ${a5F(p.evidence || '', 420)}</p>
      <p class="a5-indent2">๘.๓ พยานวัตถุ ${a5F('', 440)}</p>
      <p class="a5-indent2">๘.๔ พยานอื่น ๆ (ถ้ามี) ${a5F('', 400)}</p>
      <p class="a5-num-h a5-indent"><b>๙. กฎหมายและระเบียบที่เกี่ยวข้องในช่วงระยะเวลากระทำความผิด</b> (กฎหมายหรือระเบียบที่เกี่ยวกับอำนาจหน้าที่ของผู้ถูกร้องเรียน บทความผิดทางอาญาและวินัย ระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายที่เกี่ยวข้องกับการปฏิบัติงานที่ถูกร้องเรียน ให้ระบุชื่อกฎหมายพร้อมมาตรา หากเป็นระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายเฉพาะให้พิมพ์เนื้อหาด้วย)</p>
      <div class="a5-line a5-indent2">${a5F('', 590)}</div>
      <p class="a5-num-h a5-indent"><b>๑๐. อายุความ</b> (หากกำหนดโดยชัดเจนไม่ได้ ให้กำหนดโดยประมาณ จากทุกฐานความผิดที่เกี่ยวข้อง โดยเฉพาะฐานความผิดที่มีอายุความน้อยที่สุด และกำหนดวันขาดอายุความ)</p>
      <div class="a5-line a5-indent2">มาตรา ${a5F(p.limitation?.shortSection || '', 80)} อายุความ ${a5F(p.limitation?.shortYears || '', 60)} ปี ขาดอายุความวันที่ ${a5F(a5DateShort(p.limitation?.shortExpiry) || p.limitation?.shortExpiry || '', 180)}</div>
      <p class="a5-num-h a5-indent"><b>๑๑. มาตรการคุ้มครองเบื้องต้นตามมาตรา ๕๓</b> (ให้ระบุว่า มีหรือไม่มีการใช้มาตรการคุ้มครองพยานเบื้องต้น ตามมาตรา ๕๓) ${a5F('', 300)}</p>
      <p class="a5-num-h a5-indent"><b>๑๒. ข้อพิจารณา</b> (พิจารณาผลการตรวจสอบข้อเท็จจริง โดยต้องพิจารณาใน ๔ ประเด็น ดังนี้)</p>
      <p class="a5-indent2">๑๒.๑ ประเด็นเกี่ยวกับสถานะของผู้ถูกร้องเรียน เริ่มต้นด้วยการวิเคราะห์ความเป็นหน่วยงานของรัฐที่ผู้ถูกร้องเรียนสังกัดว่าเป็นหน่วยงานประเภทส่วนราชการ รัฐวิสาหกิจ หรือหน่วยงานอื่นของรัฐ จากนั้นวิเคราะห์ว่า (ขณะเกิดเหตุผู้ถูกร้องเรียนเป็นเจ้าหน้าที่ของรัฐประเภท ${a5F(issues.status || '', 150)} ตำแหน่ง ${a5F('', 150)} ระดับ ${a5F('', 110)} สังกัด ${a5F(c.agency || '', 170)})</p>
      <p class="a5-indent2">๑๒.๒ ประเด็นเกี่ยวกับขอบเขตอำนาจหน้าที่ของผู้ถูกร้องเรียน ${a5F(issues.authority || '', 300)}</p>
      <p class="a5-indent2">๑๒.๓ ประเด็นเกี่ยวกับการกระทำของผู้ถูกร้องเรียนว่าถูกต้องตามอำนาจหน้าที่หรือไม่ อย่างไร ${a5F(issues.action || '', 260)}</p>
      <p class="a5-indent2">๑๒.๔ ประเด็นเกี่ยวกับความเสียหาย ${a5F(issues.damage || '', 350)}</p>
      <p class="a5-num-h a5-indent"><b>๑๓. ความเห็น</b> (โดยนำข้อ ๕ และ ข้อ ๑๒ มาประกอบการพิจารณา)</p>
      <p class="a5-indent2">(ให้วินิจฉัยพฤติการณ์จากคำกล่าวหา/ร้องเรียนและข้อเท็จจริงจากการตรวจสอบปรับเข้ากับหลักกฎหมาย ระเบียบ คำสั่ง มติ ข้อบังคับต่าง ๆ ว่าเป็นคำกล่าวหา/ร้องเรียนที่ถูกต้องตามเงื่อนไขที่จะรับไว้</p>
      ${a5Foot()}${A5_PG}${a5PgNo(3)}
      <p class="a5-indent2">ดำเนินการไต่สวนต่อไปหรือไม่ โดยแต่งตั้งคณะพนักงานไต่สวน หรือแต่งตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องสำคัญหรือมีความซับซ้อนแล้วแต่กรณี เพื่อประกอบการพิจารณา)</p>
      <div class="a5-line a5-indent2">${a5F(p.report || '', 590)}</div>
      ${cbRow(res === 'รับไว้ไต่สวน' && !isSub, 'เห็นควรรับพิจารณาดำเนินการไต่สวนโดยแต่งตั้งคณะพนักงานไต่สวน ประกอบด้วย')}
      <p class="a5-indent4">(๑) ${a5F(intake.investigator || '', 260)} พนักงาน ป.ป.ท. เจ้าของสำนวน</p>
      <p class="a5-indent4">(๒) ${a5F(team[0] || '', 260)} เจ้าหน้าที่ ป.ป.ท.</p>
      <p class="a5-indent4">(๓) ${a5F(team[1] || '', 260)} เจ้าหน้าที่ ป.ป.ท.</p>
      ${cbRow(res === 'รับไว้ไต่สวน' && isSub, 'เห็นควรรับพิจารณาดำเนินการไต่สวนข้อเท็จจริง โดยแต่งตั้งคณะอนุกรรมการไต่สวน ประกอบด้วย')}
      <p class="a5-indent4">(๑) ${a5F('', 250)} ประธานอนุกรรมการ · ตำแหน่ง ${a5F('', 130)} สังกัด ${a5F('', 130)}</p>
      <p class="a5-indent4">(๒) ${a5F('', 250)} อนุกรรมการ · ตำแหน่ง ${a5F('', 130)} สังกัด ${a5F('', 130)}</p>
      <p class="a5-indent4">(๓) ${a5F('', 250)} อนุกรรมการและเลขานุการ · ตำแหน่ง ${a5F('', 130)} สังกัด ${a5F('', 130)}</p>

      <p class="a5-num-h a5-indent"><b>๑๔. ข้อเสนอ</b></p>
      <p class="a5-indent2">๑๔.๑ พิจารณาดำเนินการ (เลือกกรณีใดกรณีหนึ่งตามข้อเท็จจริง)</p>
      ${PROPOSALS.map(([on, t], n) => numRow(a5Num(n + 1), on, t)).join('')}
      ${a5Foot()}${A5_PG}${a5PgNo(4)}
      ${PROPOSALS2.slice(0, 6).map(([on, t], n) => numRow(a5Num(n + 7), on, t)).join('')}
      ${numRow('๑๓', false, PROPOSALS2[6][1])}
      ${numRow('๑๔', false, PROPOSALS2[7][1])}
      ${numRow('๑๕', false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๓) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่คณะกรรมการ ป.ป.ท. เห็นว่าไม่ใช่เป็นการกระทำผิดวินัยอย่างร้ายแรง')}
      <div class="a5-cbline a5-indent4">${a5Cb(false, 'เห็นควรส่งให้ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอน หรือไม่ เนื่องจาก')} ${a5F('', 200)}</div>
      <div class="a5-cbline a5-indent4">${a5Cb(false, 'ไม่ส่ง')} ${a5F('', 120)} เนื่องจาก ${a5F('', 220)}</div>
      ${numRow('๑๖', false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๔) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องประพฤติมิชอบที่ไม่ใช่การกระทำความผิดวินัยและไม่ก่อให้เกิดความเสียหายแก่ราชการอย่างร้ายแรง')}
      <div class="a5-cbline a5-indent4">${a5Cb(false, 'เห็นควรส่งให้ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอน หรือไม่ เนื่องจาก')} ${a5F('', 200)}</div>
      <div class="a5-cbline a5-indent4">${a5Cb(false, 'ไม่ส่ง')} ${a5F('', 120)} เนื่องจาก ${a5F('', 220)}</div>
      ${numRow('๑๗', false, 'ไม่รับเรื่องไว้พิจารณา ตามนัยมาตรา ๒๖ (๕) แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม เนื่องจากเป็นเรื่องที่')}
      ${a5Foot()}${A5_PG}${a5PgNo(5)}
      <p class="a5-indent3">องค์กรบริหารงานบุคคลหรือหน่วยงานของรัฐกำลังพิจารณาอยู่หรือได้พิจารณาเป็นที่ยุติแล้ว และไม่มีเหตุแสดงให้เห็นว่าการพิจารณานั้นไม่ชอบ</p>
      <div class="a5-cbline a5-indent3"><span class="a5-opt-no">(๑๘)</span>${a5Cb(res === 'ให้ไต่สวนเบื้องต้นเพิ่มเติม', 'อื่น ๆ')} ${a5F(res === 'ให้ไต่สวนเบื้องต้นเพิ่มเติม' ? (m.note || res) : '', 330)}</div>
      <p class="a5-indent2">๑๔.๒ นำเสนอคณะกรรมการ ป.ป.ท. เพื่อพิจารณา</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณา</p>
      ${opinionSign(intake.investigator, 'พนักงาน ป.ป.ท. ผู้รับผิดชอบสำนวน')}

      <p class="a5-num-h a5-indent"><b>๑๕. ความเห็นผู้บังคับบัญชาชั้นต้น</b> (หัวหน้าพนักงาน ป.ป.ท.) (เรื่องที่ ${a5F(c.id || '', 140)})</p>
      <p class="a5-indent2">(ให้เสนอความเห็นพร้อมเหตุผล เช่น เห็นควรรับ / ไม่รับไว้พิจารณา เนื่องจาก) ${a5F(lvl(2).opinion || '', 280)}</p>
      ${opinionSign(lvl(2).by || intake.director || '', 'หัวหน้าพนักงาน ป.ป.ท.')}
      <p class="a5-num-h a5-indent"><b>๑๖. ความเห็นผู้อำนวยการสำนัก</b> (หัวหน้าพนักงาน ป.ป.ท.) (เรื่องที่ ${a5F(c.id || '', 140)})</p>
      <p class="a5-indent2">(ให้เสนอความเห็นพร้อมเหตุผล เช่น เห็นควรรับ / ไม่รับไว้พิจารณา เนื่องจาก) ${a5F(lvl(3).opinion || '', 280)}</p>
      ${opinionSign(lvl(3).by || '', 'ผู้อำนวยการสำนัก/กอง')}
      <p class="a5-num-h a5-indent"><b>๑๗. ความเห็นรองเลขาธิการฯ</b> (เรื่องที่ ${a5F(c.id || '', 140)}) ${a5F(lvl(3).opinion || '', 260)}</p>
      <div class="a5-line">${a5F('', 640)}</div>
      ${opinionSign(lvl(3).by || '', 'รองเลขาธิการ ป.ป.ท.')}
      <p class="a5-num-h a5-indent"><b>๑๘. ความเห็นเลขาธิการฯ</b></p>
      ${cbRow(res === 'รับไว้ไต่สวน' && !isSub, 'รับไว้ไต่สวน เนื่องจากปรากฏพฤติการณ์ และพยานหลักฐานเพียงพอจะดำเนินการไต่สวน โดยมอบหมายคณะพนักงานไต่สวน')}
      ${cbRow(res === 'รับไว้ไต่สวน' && isSub, 'รับไว้ไต่สวน เนื่องจากปรากฏพฤติการณ์ และพยานหลักฐานเพียงพอจะดำเนินการไต่สวนข้อเท็จจริง โดยเสนอคณะกรรมการ ป.ป.ท. ตั้งคณะอนุกรรมการไต่สวน เนื่องจากเป็นเรื่องที่สำคัญหรือซับซ้อน')}
      <div class="a5-cbline a5-indent3">${a5Cb(false, 'ไม่รับไว้พิจารณา ตามนัยมาตรา')}</div>
      <table class="a5-tbl a5-sec-grid"><tbody>
        <tr><td>${a5Cb(false, '๒๕ (๑)')}</td><td>${a5Cb(false, '๒๖ (๑)')}</td></tr>
        <tr><td>${a5Cb(false, '๒๕ (๒)')}</td><td>${a5Cb(false, '๒๖ (๒)')}</td></tr>
        <tr><td>${a5Cb(false, '๒๕ (๓)')}</td><td>${a5Cb(false, '๒๖ (๓)')}</td></tr>
        <tr><td>${a5Cb(false, '๒๕ (๔)')}</td><td>${a5Cb(false, '๒๖ (๔)')}</td></tr>
        <tr><td>${a5Cb(false, '๒๕ (๕)')}</td><td>${a5Cb(false, '๒๖ (๕)')}</td></tr>
      </tbody></table>
      <p>แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>
      ${a5Foot()}${A5_PG}${a5PgNo(6)}
      ${cbRow(false, 'ไม่รับเรื่องไว้พิจารณา เนื่องจากผู้ถูกกล่าวหาไม่ใช่เจ้าหน้าที่ของรัฐ')}
      ${cbRow(false, 'ไม่รับเรื่องไว้พิจารณา เนื่องจากไม่ใช่การกล่าวหาว่าเจ้าหน้าที่ของรัฐกระทำทุจริตในภาครัฐ')}
      ${cbRow(res === 'ส่งสำนักงาน ป.ป.ช.', 'เห็นควรส่งเรื่องคืนคณะกรรมการ ป.ป.ช.')}
      ${cbRow(false, 'เห็นควรยุติการไต่สวนเนื่องจากผู้ถูกร้องตาย')}
      ${cbRow(res === 'ไม่รับไว้ไต่สวน', 'ไม่รับไว้ไต่สวนข้อเท็จจริง เนื่องจากไม่ปรากฏพฤติการณ์หรือพยานหลักฐานว่าผู้ถูกกล่าวหาได้กระทำการทุจริตในภาครัฐ')}
      <div class="a5-cbline a5-indent3">${a5Cb(false, 'อื่น ๆ')} ${a5F(lvl(4).opinion || '', 400)}</div>
      ${opinionSign(lvl(4).by || '', 'เลขาธิการคณะกรรมการ ป.ป.ท.')}
      <p class="a5-num-h"><b>เรียน ประธานกรรมการ ป.ป.ท.</b> (เรื่องที่ ${a5F(c.id || '', 180)})</p>
      <p class="a5-indent2">ด้วย เลขาธิการคณะกรรมการ ป.ป.ท. ได้มอบหมายให้พนักงาน ป.ป.ท. ดำเนินการไต่สวนเบื้องต้น ตามนัยมาตรา ๒๔ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม พนักงาน ป.ป.ท. ได้ดำเนินการเสร็จเรียบร้อยแล้วตามรายงานการไต่สวนเบื้องต้นที่เสนอมาพร้อมนี้</p>
      <p class="a5-indent2">เห็นควรบรรจุเข้าวาระการประชุมคณะกรรมการ ป.ป.ท.</p>
      <div class="a5-cbline a5-indent3">${a5Cb(Boolean(m.mtiNo), 'เพื่อพิจารณา')}</div>
      <div class="a5-cbline a5-indent3">${a5Cb(false, 'เพื่อทราบ')}</div>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณา</p>
      ${opinionSign(m.decidedBy || '', 'เลขาธิการคณะกรรมการ ป.ป.ท.')}
      <p class="a5-form-code">${escapeHtml(A5_FORMS['213'].code)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๕ — หนังสือส่งบันทึกแจ้งข้อกล่าวหาและสิทธิคัดค้าน · ๒ หน้า ===== */
  function paperNoticeAccusation(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, q = i.inquiry644 || {}, m = i.committee213 || {}, intake = i.intake || {};
    const accused = a5AccusedLine(state);
    const orderNo = m.orderNo || intake.orderNo || '';
    return `<section class="a5-paper">
      ${a5LetterHdr('ตัวอย่างหนังสือส่งบันทึกแจ้งข้อกล่าวหาและสิทธิคัดค้าน “หากเป็นคณะอนุกรรมการไต่สวนให้เปลี่ยนจากคณะพนักงานไต่สวนเป็นคณะอนุกรรมการไต่สวน และคำสั่งเปลี่ยนเป็นคำสั่งคณะกรรมการ ป.ป.ท.”', c.id, q.noticeSentAt || todayISO())}
      <div class="a5-line"><b>เรื่อง</b> แจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน (เรื่องที่ ${a5F(c.id || '', 150)})</div>
      <div class="a5-line"><b>เรียน</b> ${a5F(accused, 400)} <span class="a5-hint">(ให้ระบุชื่อผู้ถูกกล่าวหา)</span></div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> ๑. สำเนาคำสั่งสำนักงาน ป.ป.ท. ลับที่ ${a5F(orderNo, 130)}/${a5F('', 70)} ลงวันที่ ${a5F(a5DateShort(m.orderDate || intake.orderDate), 150)} จำนวน ${a5F('', 60)} แผ่น</div>
      <div class="a5-line a5-indent3">๒. บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน จำนวน ๒ ฉบับ</div>
      <p class="a5-indent2">ด้วย สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ได้มีคำสั่ง ลับที่ ${a5F(orderNo, 130)}/${a5F('', 70)} ลงวันที่ ${a5F(a5DateShort(m.orderDate || intake.orderDate), 140)} เรื่อง แต่งตั้งคณะพนักงานไต่สวน/ กรณีกล่าวหา ${a5F(accused, 200)} ตำแหน่ง ${a5F('', 150)} สังกัด ${a5F(c.agency || '', 200)} ผู้ถูกกล่าวหา ว่ากระทำการทุจริตในภาครัฐ รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย ๑</p>
      <p class="a5-indent2">เพื่อดำเนินการตามมาตรา ๓๓ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม จึงขอส่งบันทึกแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน มายังท่าน จำนวน ๒ ฉบับ รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย ๒ โดยขอให้ท่านดำเนินการ ดังนี้</p>
      <p class="a5-indent2">๑. ลงลายมือชื่อและวันเดือนปีที่รับทราบข้อกล่าวหาในบันทึกการแจ้งข้อกล่าวหาทั้ง ๒ ฉบับ ท่านเก็บไว้เอง จำนวน ๑ ฉบับ แล้วส่งอีก จำนวน ๑ ฉบับ กลับคืนไปยัง กอง/สำนัก ${a5F(intake.unit || '', 180)} สำนักงาน ป.ป.ท. อาคารซอฟต์แวร์ปาร์ค ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี ๑๑๑๒๐ โดยจะถือว่าวันที่ระบุในใบตอบรับทางไปรษณีย์เป็นวันที่ท่านได้รับแจ้งข้อกล่าวหา</p>
      <p class="a5-indent2">๒. ชี้แจงแก้ข้อกล่าวหาภายใน ๓๐ วัน นับแต่วันที่ได้รับแจ้ง โดยท่านจะชี้แจงเป็นหนังสือหรือด้วยวาจาก็ได้และมีสิทธิที่จะแสดงพยานหลักฐานหรือนำพยานบุคคลไปให้ถ้อยคำประกอบการชี้แจง หากชี้แจงด้วยวาจามีสิทธินำทนายความหรือบุคคลที่ท่านไว้วางใจไม่เกิน ๒ คน เข้าฟังการชี้แจงหรือให้ถ้อยคำ หากพ้นกำหนดเวลา ๓๐ วันแล้ว ท่านไม่ชี้แจงแก้ข้อกล่าวหาจะถือว่าผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหาและไม่ประสงค์ที่จะแก้ข้อกล่าวหา</p>
      <p class="a5-indent2">๓. การคัดค้านคณะพนักงานไต่สวน ให้ทำคำร้องเป็นหนังสือ ระบุชื่อและนามสกุลของผู้ถูกคัดค้าน พร้อมทั้งแสดงข้อเท็จจริงที่เป็นเหตุแห่งการคัดค้านไว้ในคำร้องคัดค้านด้วยว่าจะทำให้การไต่สวนข้อเท็จจริงไม่ได้ความจริงและความยุติธรรมอย่างใด โดยต้องยื่นคำร้องต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ผู้ถูกกล่าวหาทราบเหตุแห่งการคัดค้าน</p>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <p class="a5-indent2">อนึ่ง หากท่านประสงค์จะไปรับทราบข้อกล่าวหาด้วยตนเอง ขอให้ท่านไปพบคณะพนักงานไต่สวน ในวันที่ ${a5F('', 160)} เวลา ${a5F('', 90)} ณ กอง/สำนัก ${a5F(intake.unit || '', 170)} สำนักงาน ป.ป.ท. อาคารซอฟต์แวร์ปาร์ค ชั้น ${a5F('', 60)} ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี ทั้งนี้ หากท่านไม่มีทนายความและประสงค์จะให้สำนักงาน ป.ป.ท. จัดหาทนายความให้ ขอให้แจ้ง นาย/นาง/นางสาว ${a5F(intake.investigator || '', 200)} โทร. ${a5F('', 140)} พนักงาน ป.ป.ท. เจ้าของสำนวน ทราบล่วงหน้าก่อนวันนัด</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อทราบ</p>
      <div class="a5-sign a5-sign-center">${a5SignCol(intake.director || '', 'หัวหน้าพนักงาน ป.ป.ท. /ประธานอนุกรรมการไต่สวน', 'ขอแสดงความนับถือ')}</div>
      ${a5LetterFoot(intake.unit, intake.investigator, 'เจ้าของสำนวน')}
      <p class="a5-form-code">${escapeHtml(A5_FORMS.notice.code)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๖ — บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้าน · ๓ หน้า ===== */
  function paperRecordAccusation(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, q = i.inquiry644 || {}, intake = i.intake || {}, m = i.committee213 || {};
    const accused = a5AccusedLine(state);
    const team = intake.team || [];
    const OBJECTIONS = [
      'ผู้ไต่สวนรู้เห็นเหตุการณ์หรือเคยสอบสวนหรือพิจารณาเกี่ยวกับเรื่องที่กล่าวหาในฐานะอื่นที่มิใช่ในฐานะพนักงาน ป.ป.ท. หรือเจ้าหน้าที่ ป.ป.ท. มาก่อน',
      'ผู้ไต่สวนมีส่วนได้เสียในเรื่องที่กล่าวหา',
      'ผู้ไต่สวนมีสาเหตุโกรธเคืองกับผู้กล่าวหาหรือผู้ถูกกล่าวหา',
      'ผู้ไต่สวนเป็นผู้กล่าวหา หรือผู้ถูกกล่าวหา หรือเป็นคู่สมรส บุพการี ผู้สืบสันดาน หรือพี่น้องร่วมบิดามารดา หรือร่วมบิดาหรือมารดากับผู้กล่าวหาหรือผู้ถูกกล่าวหา',
      'ผู้ไต่สวนมีความสัมพันธ์ใกล้ชิดในฐานะญาติ หรือเป็นหุ้นส่วน หรือมีผลประโยชน์ร่วมกัน หรือขัดแย้งกันทางธุรกิจกับผู้กล่าวหาหรือผู้ถูกกล่าวหา'
    ];
    return `<section class="a5-paper">
      ${a5PgNo(1)}
      <header class="a5-hdr a5-hdr-record">
        <p class="a5-hdr-org">สำนักงาน ป.ป.ท.</p>
        <h2 class="a5-hdr-title">บันทึกการแจ้งข้อกล่าวหาและสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน</h2>
        <p class="a5-letter-org a5-right">${A5_OFFICE_ADDR}</p>
        <p class="a5-letter-date">${a5DateParts(q.noticeSentAt || todayISO())}</p>
      </header>
      <p class="a5-indent2"><b>ส่วนที่ ๑ การแจ้งข้อกล่าวหา</b></p>
      <p class="a5-indent2">ด้วย สำนักงาน ป.ป.ท./คณะกรรมการ ป.ป.ท. ได้มีคำสั่งที่ ${a5F(m.orderNo || intake.orderNo || '', 160)} ลงวันที่ ${a5F(a5DateShort(m.orderDate || intake.orderDate), 160)} แต่งตั้งคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน เพื่อดำเนินการไต่สวน กรณีกล่าวหา ${a5F(accused, 230)} (ชื่อ – นามสกุล ตำแหน่งและสังกัดของผู้ถูกกล่าวหา) ว่ากระทำความผิดฐาน ${a5F(q.allegations || c.subject || '', 230)} (ทุจริตต่อหน้าที่ หรือกระทำความผิดต่อตำแหน่งหน้าที่ราชการ หรือกระทำความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม หรือประพฤติมิชอบ ระบุข้อความตามคำสั่งแต่งตั้งพนักงาน ป.ป.ท./คณะอนุกรรมการ) ปรากฏตามเอกสารแนบท้ายบันทึกฉบับนี้</p>
      <p class="a5-indent2">บัดนี้ คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ขอแจ้งให้ท่านทราบก่อนแจ้งข้อกล่าวหาว่าในการชี้แจงแก้ข้อกล่าวหา ผู้ถูกกล่าวหาอาจแก้ข้อกล่าวหาโดยทำเป็นหนังสือหรือมาชี้แจงด้วยวาจาก็ได้ และผู้ถูกกล่าวหามีสิทธิที่จะให้ถ้อยคำหรือไม่ก็ได้ ถ้าผู้ถูกกล่าวหาให้ถ้อยคำ ถ้อยคำของผู้ถูกกล่าวหานั้นอาจใช้เป็นพยานหลักฐานในการพิจารณาคดีได้</p>
      <p class="a5-indent2">ในการชี้แจงแก้ข้อกล่าวหาด้วยวาจาผู้ถูกกล่าวหามีสิทธิที่จะนำทนายความหรือบุคคลซึ่งผู้ถูกกล่าวหาไว้วางใจไม่เกินสองคนเข้าฟังการให้ถ้อยคำของตนได้ ก่อนเริ่มถามคำให้การในคดีที่มีอัตราโทษจำคุกหรือประหารชีวิต หากผู้ถูกกล่าวหาไม่มีทนายความและต้องการทนายความสำนักงาน ป.ป.ท. จะจัดหาทนายความให้ คดีที่ผู้ถูกกล่าวหามีอายุไม่เกินสิบแปดปีในวันที่แจ้งข้อกล่าวหา หากผู้ถูกกล่าวหาไม่มีทนายความ สำนักงาน ป.ป.ท. จะจัดหาทนายความให้ และผู้ถูกกล่าวหาจะนำพยานหลักฐานมาเอง หรือจะอ้างพยานหลักฐานโดยขอให้คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน พิจารณาเรียกพยานหลักฐานนั้นมาก็ได้ ทั้งนี้ มีสิทธิที่จะชี้แจงข้อกล่าวหาและนำพยานหลักฐานมาสืบแก้ข้อกล่าวหาภายในเวลาอันสมควร แต่อย่างช้าไม่เกิน ๓๐ วัน นับแต่วันที่ได้รับทราบข้อกล่าวหาหรือถือว่าได้รับทราบข้อกล่าวหา คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ได้รวบรวมพยานหลักฐานที่เกี่ยวข้องกับข้อกล่าวหาแล้ว จึงขอแจ้งข้อกล่าวหาให้ผู้ถูกกล่าวหาทราบ ดังนี้</p>
      <p class="a5-indent2">๑. ประเด็นเกี่ยวกับเหตุการณ์หรือเรื่องราวที่เกิดขึ้น</p>
      <p class="a5-indent3">ระบุข้อเท็จจริงและพฤติการณ์ในการกระทำผิดเท่าที่จะทำให้ผู้ถูกกล่าวหาเข้าใจข้อกล่าวหาได้ดี จัดลำดับเหตุการณ์ว่ามีความเป็นมาอย่างไร โดยมีรายละเอียดเกี่ยวกับบุคคล สิ่งของ เวลา และสถานที่ตามสมควรและผู้ถูกกล่าวหาเข้าไปเกี่ยวข้องกับเหตุการณ์นั้นอย่างไร ${a5F(q.statements || '', 260)}</p>
      <p class="a5-indent2">๒. ประเด็นเกี่ยวกับองค์ประกอบความผิด</p>
      <p class="a5-indent3">จากการไต่สวนข้อเท็จจริงฟังได้ว่า (พิจารณาองค์ประกอบความผิดตามกฎหมายที่จะแจ้งข้อกล่าวหาต่อผู้ถูกกล่าวหาแต่ละคนแล้วอ้างข้อเท็จจริงว่าผู้ถูกกล่าวหาทำอะไร อย่างไร ให้ครบทุกองค์ประกอบความผิด ตามลำดับประเด็น)</p>
      <p class="a5-indent4">- ประเด็นเกี่ยวกับสถานะ ตำแหน่ง และความเป็นเจ้าหน้าที่ของรัฐ</p>
      <p class="a5-indent4">- ประเด็นเกี่ยวกับอำนาจหน้าที่</p>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <p class="a5-indent4">- ประเด็นเกี่ยวกับการกระทำผิดต่อตำแหน่งหน้าที่</p>
      <p class="a5-indent4">- ประเด็นเกี่ยวกับความเสียหาย</p>
      <p class="a5-indent2">๓. ประเด็นผู้ถูกกล่าวหากระทำผิดกฎหมายในข้อหา</p>
      <p class="a5-indent3">จึงขอแจ้งข้อกล่าวหาว่า ท่านกระทำความผิดทางอาญาในข้อหา ${a5F(q.allegations || '', 300)} (อ้างว่าผู้ถูกกล่าวหากระทำความผิดกฎหมายในฐานความผิดใด โดยระบุข้อความในกฎหมายลงไป แต่ไม่จำเป็นต้องระบุเลขมาตรา)</p>
      <p class="a5-indent3">และมีความผิดทางวินัยฐาน ${a5F('', 380)}</p>
      <p class="a5-indent3">เหตุเกิดวันที่ ${a5F(a5DateShort(i.prelim?.place ? '' : ''), 140)} (หรือระหว่างวันที่ ${a5F('', 120)} ถึงวันที่ ${a5F('', 120)}) สถานที่เกิดเหตุอยู่ในท้องที่ตำบล ${a5F('', 150)} อำเภอ ${a5F('', 150)} จังหวัด ${a5F('', 170)}</p>
      <p class="a5-indent2"><b>ส่วนที่ ๒ การแจ้งสิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน</b></p>
      <p class="a5-indent2">คณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ประกอบด้วยบุคคลตามรายชื่อ ดังต่อไปนี้</p>
      <p class="a5-indent3">๑. ${a5F(intake.director || '', 320)} พนักงาน ป.ป.ท./ประธานอนุกรรมการ</p>
      <p class="a5-indent3">๒. ${a5F(team[0] || '', 320)} เจ้าหน้าที่ ป.ป.ท./อนุกรรมการ</p>
      <p class="a5-indent3">๓. ${a5F(q.investigator || intake.investigator || '', 280)} พนักงาน ป.ป.ท. เจ้าของสำนวน/อนุกรรมการและเลขานุการ</p>
      <p class="a5-indent2">ขอแจ้งให้ทราบว่าผู้ถูกกล่าวหามีสิทธิคัดค้านผู้ได้รับการแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน โดยผู้ถูกกล่าวหาจะต้องทำคำร้องเป็นหนังสือระบุชื่อและนามสกุลของผู้ถูกคัดค้าน พร้อมทั้งแสดงข้อเท็จจริงที่เป็นเหตุแห่งการคัดค้านไว้ในคำร้องคัดค้านด้วยว่าจะทำให้การไต่สวนข้อเท็จจริงไม่ได้ความจริงและความยุติธรรมอย่างใด และยื่นคำร้องคัดค้านเป็นหนังสือต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ผู้ถูกกล่าวหาทราบเหตุแห่งการคัดค้านอย่างหนึ่งอย่างใด ดังต่อไปนี้</p>
      ${OBJECTIONS.map((t, n) => `<p class="a5-indent2">(${a5Num(n + 1)}) ${t}</p>`).join('')}
      <p class="a5-indent2">ทั้งนี้ กรณีที่ผู้ถูกกล่าวหามิได้ดำเนินการให้ครบถ้วนตามเงื่อนไขข้างต้น ให้ถือว่าผู้ถูกกล่าวหาไม่ประสงค์ที่จะคัดค้านผู้ที่ได้รับการแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ในกรณีดังกล่าว</p>
      <div class="a5-sign a5-sign-stack a5-sign-left">
        ${a5SignCol(intake.director || '', 'พนักงาน ป.ป.ท./ประธานอนุกรรมการ', 'ลงชื่อ')}
        ${a5SignCol(team[0] || '', 'เจ้าหน้าที่ ป.ป.ท./อนุกรรมการ', 'ลงชื่อ')}
        ${a5SignCol(q.investigator || intake.investigator || '', 'พนักงาน ป.ป.ท. เจ้าของสำนวน/อนุกรรมการและเลขานุการ', 'ลงชื่อ')}
      </div>
      ${a5Foot()}${A5_PG}${a5PgNo(3)}
      <p class="a5-indent2"><b>ส่วนที่ ๓ การรับทราบข้อกล่าวหา</b></p>
      <p class="a5-indent2">ข้าพเจ้า ${a5F(accused, 280)} (ระบุชื่อ-นามสกุลของผู้ถูกกล่าวหา) ได้รับทราบและเข้าใจข้อกล่าวหาโดยตลอดและได้รับทราบสิทธิการคัดค้านผู้ได้รับแต่งตั้งเป็นคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวนแล้ว โดยได้รับบันทึกนี้จำนวน ๑ ฉบับ และสำเนาคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${a5F(m.orderNo || '', 160)} ลงวันที่ ${a5F(a5DateShort(m.orderDate), 160)} จำนวน ๑ ฉบับ ไว้แล้ว เมื่อวันที่ ${a5F('', 60)} เดือน ${a5F('', 120)} พ.ศ. ${a5F('', 70)} (คือวันที่ได้รับหนังสือแจ้งให้รับทราบข้อกล่าวหาตามที่ระบุในไปรษณีย์ตอบรับ) และประสงค์ที่จะชี้แจงแก้ข้อกล่าวหาภายในวันที่ ${a5F('', 60)} เดือน ${a5F('', 120)} พ.ศ. ${a5F('', 70)} (ต้องชี้แจงภายใน ๓๐ วันนับแต่วันที่ได้รับทราบข้อกล่าวหาหรือถือว่าได้รับทราบข้อกล่าวหา) หากพ้นกำหนดนี้แล้ว ให้ถือว่าข้าพเจ้าไม่ประสงค์ที่จะชี้แจงแก้ข้อกล่าวหา และในกรณีที่ข้าพเจ้าประสงค์จะคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน ข้าพเจ้าจะต้องยื่นคำร้องเป็นหนังสือต่อสำนักงาน ป.ป.ท. ภายใน ๓๐ วัน นับแต่วันที่ทราบเหตุคัดค้าน เพื่อเป็นหลักฐานจึงลงลายมือชื่อไว้เป็นสำคัญ</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', 'ผู้ถูกกล่าวหา', 'ลงชื่อ')}</div>
      <div class="a5-note">
        <p><b>หมายเหตุ</b> บันทึกนี้ให้ทำเป็น ๓ ฉบับ เก็บไว้ในสำนวนการไต่สวนจำนวน ๑ ฉบับ</p>
        <p class="a5-indent">ส่งให้ผู้ถูกกล่าวหาจำนวน ๒ ฉบับ เพื่อให้ผู้ถูกกล่าวหาลงลายมือชื่อและวันเดือนปีที่รับทราบข้อกล่าวหา ผู้ถูกกล่าวหาเก็บไว้ จำนวน ๑ ฉบับ และส่งกลับคืน จำนวน ๑ ฉบับ เก็บรวมไว้ในสำนวนการไต่สวน</p>
      </div>
      <p class="a5-form-code">${escapeHtml(A5_FORMS.record.code)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๗ — รายงานการไต่สวน · ๓ หน้า ===== */
  function paper644(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, q = i.inquiry644 || {}, m = i.committee213 || {}, mc = i.committee644 || {}, intake = i.intake || {}, m62 = intake.m62 || {};
    const accused = a5AccusedLine(state);
    const witnesses = (q.witnesses || []).filter(Boolean).join(', ');
    const subject = state.documentData?.documentSubject || c.subject || '';
    const fromNacc = Boolean(m62.flag) || String(c.decision || '').includes('62');
    const team = intake.team || [];
    return `<section class="a5-paper">
      <header class="a5-hdr a5-hdr-report">
        <p class="a5-hdr-org">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</p>
        <h2 class="a5-hdr-title">รายงานการไต่สวน</h2>
      </header>
      <div class="a5-line"><b>เรื่องที่</b> ${a5F(c.id || '', 560)}</div>
      <div class="a5-line"><b>สำนัก/กอง</b> ${a5F(intake.unit || '', 300)} <span class="a5-hint">ที่เป็นเจ้าของเรื่อง (ตามเลขเรื่อง)</span></div>
      <p class="a5-right">${a5DateParts(q.submittedAt || todayISO())}</p>
      <div class="a5-line"><b>เรียน</b> ประธานกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ</div>

      <p class="a5-num-h"><b>๑. การรับเรื่อง</b> (เลือกใส่เฉพาะกรณีตามข้อเท็จจริง)</p>
      <div class="a5-cbline a5-indent2"><b>${a5Cb(fromNacc, 'กรณีรับจากสำนักงาน ป.ป.ช. ตามมาตรา ๖๒')}</b></div>
      <p class="a5-indent2">๑.๑ เมื่อวันที่ ${a5F(a5DateShort(m62.sourceMtiDate), 150)} สำนักงาน ป.ป.ช. รับเรื่องที่ ${a5F(m62.sourceLetter || '', 160)} (เลขอ้างอิง/เลขดำติดตามที่ ${a5F('', 110)}) จาก ${a5F('', 180)} (ระบุช่องทางการรับเรื่อง เช่น บัตรสนเท่ห์ ผู้ร้อง พนักงานสอบสวน สถานีตำรวจ สำนักงานตรวจเงินแผ่นดิน หรือ ${a5F('', 180)})</p>
      <p class="a5-indent2">๑.๒ สำนักงาน ป.ป.ช./สำนักงาน ป.ป.ช. จังหวัด ${a5F('', 140)} ส่งเรื่องมายังสำนักงาน ป.ป.ท. /สำนักงาน ปปท. เขต ${a5F(intake.unit || '', 130)} ตามมติคณะกรรมการ ป.ป.ช. ครั้งที่ ${a5F('', 100)} เมื่อวันที่ ${a5F(a5DateShort(m62.sourceMtiDate), 150)} ตามหนังสือ ป.ป.ช. ที่ ${a5F(m62.sourceLetter || '', 170)}</p>
      <p class="a5-indent2">๑.๓ สำนักงาน ป.ป.ท. /สำนักงาน ปปท. เขต ${a5F(intake.unit || '', 140)} รับเรื่องเมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 160)}</p>
      <p class="a5-indent2">๑.๔ คณะกรรมการ ป.ป.ท. มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. /สำนักงาน ป.ป.ท. ลับ ที่ ${a5F(m.orderNo || '', 200)} (ในกรณีที่มีคำสั่งให้แก้ไขเพิ่มเติม-ไต่สวนบุคคลใดเพิ่มเติม ให้ระบุไว้ด้วย)</p>
      <div class="a5-cbline a5-indent2"><b>${a5Cb(!fromNacc, 'กรณีคดีประพฤติมิชอบ')}</b></div>
      <p class="a5-indent2">๑.๑ เมื่อวันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)} สำนักงาน ป.ป.ท./สำนักงาน ป.ป.ท. โดยสำนักงาน ปปท. เขต ${a5F(intake.unit || '', 140)} รับเรื่อง ${a5F('', 160)} ระบุช่องทางรับเรื่อง เช่น หนังสือร้องเรียน สายด่วน ๑๒๐๖ เว็บไซต์สำนักงาน ป.ป.ท. ${a5F('', 130)} วันที่ ${a5F(a5DateShort(intake.receivedFirstAt), 150)}</p>
      <p class="a5-indent2">๑.๒ คณะกรรมการ ป.ป.ท. มีมติให้ไต่สวน ตามคำสั่งคณะกรรมการ ป.ป.ท. /สำนักงาน ป.ป.ท. ลับ ที่ ${a5F(m.orderNo || '', 200)} (ในกรณีที่มีคำสั่งให้แก้ไขเพิ่มเติม-ไต่สวนบุคคลใดเพิ่มเติม ให้ระบุไว้ด้วย)</p>
      <p class="a5-num-h"><b>๒. ผู้กล่าวหา</b> (ระบุชื่อ-สกุล ตำแหน่ง และที่อยู่ หรือขอปกปิดชื่อ) ${a5F(c.complainant || '', 330)}</p>
      <p class="a5-num-h"><b>๓. ผู้ถูกกล่าวหา</b> (ให้ระบุชื่อ-สกุล หมายเลขบัตรประจำตัวประชาชน ตำแหน่ง ยศ สังกัด และที่อยู่ (ตามทะเบียนราษฎรขณะแจ้งข้อกล่าวหา) สถานะปัจจุบันเป็นรายบุคคล (หากถูกไล่ออกให้ระบุคำสั่งหรือเหตุที่ถูกไล่ออกด้วย) โดยกำหนดผู้ถูกกล่าวหาเป็นลำดับ หากผู้ถูกกล่าวหามีจำนวนมากอาจทำเป็นบัญชีแนบท้ายที่ได้จากการตรวจสอบ)</p>
      <div class="a5-line a5-indent2">${a5F(accused, 600)}</div>
      <p class="a5-num-h"><b>๔. ข้อกล่าวหา พฤติการณ์ที่กล่าวหา</b> (สรุปพฤติการณ์ตามคำกล่าวหาของผู้กล่าวหาหรือจากคำสั่งแต่งตั้ง)</p>
      <div class="a5-line a5-indent2">${a5F(q.allegations || subject, 600)}</div>
      <p class="a5-num-h"><b>๕. การรวบรวมพยานหลักฐาน</b> (สรุปคำให้การของผู้ให้ถ้อยคำให้ชัดเจนว่าบุคคลนั้นให้การในประเด็นใด มีสาระสำคัญว่าอย่างไร โดยเรียงลำดับตามความสำคัญ และสรุปประเด็นสำคัญของเอกสาร)</p>
      <p class="a5-indent2">๕.๑ พยานบุคคล (สรุปคำให้การผู้กล่าวหา/พยาน) ${a5F(witnesses, 300)}</p>
      <p class="a5-indent2">๕.๒ พยานเอกสาร (สรุปข้อเท็จจริงจากพยานเอกสารที่รวบรวม) ${a5F(q.statements || '', 280)}</p>
      <p class="a5-indent2">๕.๓ พยานวัตถุ และพยานอื่น ๆ ${a5F('', 380)}</p>
      <p class="a5-indent2">๕.๔ ผลการดำเนินการสอบข้อเท็จจริง/วินัย/ละเมิดของหน่วยงานต้นสังกัด ${a5F('', 260)}</p>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}

      <p class="a5-num-h"><b>๖. การดำเนินการอื่น ๆ</b></p>
      <p class="a5-indent2">๖.๑ การคุ้มครองพยาน ${a5F(q.witnessProtection || '', 400)}</p>
      <p class="a5-indent2">๖.๒ การกันบุคคลหรือผู้ถูกกล่าวหาไว้เป็นพยาน ${a5F('', 350)}</p>
      <p class="a5-indent2">๖.๓ การดำเนินการอื่น ๆ (ถ้ามี) เช่น การสืบพยานบุคคลไว้ล่วงหน้า ${a5F('', 280)}</p>
      <p class="a5-num-h"><b>๗. วันเวลาและสถานที่เกิดเหตุ</b> ${a5F(i.prelim?.place || '', 400)}</p>
      <p class="a5-num-h"><b>๘. ความเสียหาย</b> ${a5F(i.prelim?.issues?.damage || '', 440)}</p>
      <p class="a5-num-h"><b>๙. อายุความ</b> (ให้ระบุอายุความและวันขาดอายุความของการกระทำความผิดที่ถูกกล่าวหาทุกข้อกล่าวหา)</p>
      <div class="a5-line a5-indent2">มาตรา ${a5F(i.prelim?.limitation?.longSection || '', 80)} อายุความ ${a5F(i.prelim?.limitation?.longYears || '', 60)} ปี ขาดอายุความวันที่ ${a5F(a5DateShort(i.prelim?.limitation?.longExpiry) || i.prelim?.limitation?.longExpiry || '', 180)}</div>
      <p class="a5-num-h"><b>๑๐. กฎหมายและระเบียบที่เกี่ยวข้อง</b> (กฎหมายหรือระเบียบที่เกี่ยวกับอำนาจหน้าที่ของผู้ถูกร้องเรียน บทความผิดทางอาญาและวินัย ระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายที่เกี่ยวข้องกับการปฏิบัติงานที่ถูกร้องเรียน หากเป็นระเบียบ ข้อบังคับ ประกาศ หรือกฎหมายเฉพาะให้พิมพ์เนื้อหาด้วย ให้ระบุชื่อกฎหมายพร้อมมาตรา)</p>
      <div class="a5-line a5-indent2">${a5F('', 600)}</div>
      <p class="a5-num-h"><b>๑๑. การแจ้งคำสั่ง การคัดค้าน/ผลการคัดค้านผู้ไต่สวน การแจ้งข้อกล่าวหา การชี้แจงแก้ข้อกล่าวหา</b></p>
      <p class="a5-indent2">๑๑.๑ การแจ้งคำสั่ง การคัดค้าน/ผลการคัดค้านผู้ไต่สวน</p>
      <p class="a5-indent3">ได้แจ้งคำสั่งให้ผู้ถูกกล่าวหาทราบแล้ว ตามหนังสือ ${a5F(m.orderNo || '', 300)}</p>
      <p class="a5-indent3">การคัดค้านผู้ไต่สวน/ผลการคัดค้าน ${a5F('', 350)}</p>
      <p class="a5-indent2">๑๑.๒ การแจ้งข้อกล่าวหา</p>
      <p class="a5-indent3">ได้แจ้งข้อกล่าวหาให้ผู้ถูกกล่าวหาทราบ ตามหนังสือ ${a5F('', 170)} เมื่อวันที่ ${a5F(a5DateShort(q.noticeSentAt), 150)} ทางไปรษณีย์ลงทะเบียนตอบรับ และผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหา ทางไปรษณีย์/รับทราบด้วยตนเองแล้ว เมื่อวันที่ ${a5F(a5DateShort(q.noticeSentAt), 170)}</p>
      <p class="a5-indent3">ข้อกล่าวหาที่แจ้ง (รายละเอียดตามบันทึกการแจ้งข้อกล่าวหา) ${a5F(q.allegations || '', 250)}</p>
      <p class="a5-indent2">๑๑.๓ การชี้แจงแก้ข้อกล่าวหา</p>
      <p class="a5-indent3">(๑) คำให้การผู้ถูกกล่าวหา/หนังสือชี้แจงแก้ข้อกล่าวหา ${a5F('', 280)}</p>
      <p class="a5-indent3">(๒) พยานหลักฐานของผู้ถูกกล่าวหา</p>
      <p class="a5-indent4">(๒.๑) พยานบุคคล ${a5F('', 350)}</p>
      <p class="a5-indent4">(๒.๒) พยานเอกสาร ${a5F('', 350)}</p>
      <p class="a5-indent4">(๒.๓) พยานวัตถุ/อื่น ๆ ${a5F('', 340)}</p>
      <p class="a5-num-h"><b>๑๒. เหตุผลในการพิจารณาวินิจฉัย</b> (ให้สรุปพฤติการณ์และพยานหลักฐานโดยปรับให้เข้ากับองค์ประกอบข้อกฎหมาย โดยให้พิจารณาผู้ถูกกล่าวหาแต่ละรายตามลำดับ)</p>
      <p class="a5-indent2">๑๒.๑ ประเด็นเกี่ยวกับสถานะของผู้ถูกกล่าวหา ${a5F(i.prelim?.issues?.status || '', 300)}</p>
      <p class="a5-indent2">๑๒.๒ ประเด็นเกี่ยวกับอำนาจหน้าที่ของผู้ถูกกล่าวหา ${a5F(i.prelim?.issues?.authority || '', 290)}</p>
      <p class="a5-indent2">๑๒.๓ ประเด็นเกี่ยวกับการกระทำของผู้ถูกกล่าวหา ${a5F(i.prelim?.issues?.action || '', 290)}</p>
      <p class="a5-indent2">๑๒.๔ ประเด็นความเสียหาย ${a5F(i.prelim?.issues?.damage || '', 350)}</p>
      <p class="a5-indent2">คดีมีประเด็นที่ต้องวินิจฉัยว่า ${a5F('', 380)}</p>
      <p class="a5-indent2">ข้อเท็จจริงจากการไต่สวนได้ความว่า ${a5F(q.summary || '', 360)}</p>
      ${a5Foot()}${A5_PG}${a5PgNo(3)}

      <p class="a5-indent2">พิเคราะห์แล้วเห็นว่า (ให้ปรับข้อเท็จจริงให้เข้ากับข้อกฎหมายตามองค์ประกอบความผิดในแต่ละฐาน) ${a5F(q.report || '', 300)}</p>
      <p class="a5-indent2">ความเห็น/มติ (ในกรณีที่คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน มีความเห็นแย้ง ให้ระบุเสียงข้างมากและข้างน้อย พร้อมทั้งเหตุผลในการวินิจฉัย หรือในกรณีที่คณะพนักงานไต่สวน ซึ่งไม่สามารถหาเสียงข้างมากได้ ให้ระบุเหตุผลในการวินิจฉัยของแต่ละคน) ${a5F(mc.result || '', 260)}</p>
      <p class="a5-indent2">(ในกรณีที่แจ้งข้อกล่าวหาผู้ถูกกล่าวหาฐานความผิดใดแล้ว จะต้องมีความเห็นในทุกข้อกล่าวหา)</p>
      <p class="a5-num-h"><b>๑๓. สรุปบทความผิดผู้ถูกกล่าวหาแต่ละรายตามลำดับ</b></p>
      <p class="a5-indent2">- กรณีให้ข้อกล่าวหาตกไป (ให้สรุปความเห็นโดยย่อและให้มีความเห็นทางคดี ${a5F(mc.result === 'ข้อกล่าวหาไม่มีมูล/สิทธิฟ้องระงับ' ? (mc.note || mc.result) : '', 230)} จึงเห็นควรให้ข้อกล่าวหาตกไป)</p>
      <p class="a5-indent2">- กรณีมีมูลความผิด</p>
      <p class="a5-indent3">- ความผิดทางอาญา ให้ระบุฐานความผิดตามประมวลกฎหมายอาญา มาตรา ${a5F('', 140)} หรือตามกฎหมายอื่น มาตรา ${a5F('', 200)}</p>
      <p class="a5-indent3">- ความผิดทางวินัย ให้ระบุฐานความผิดวินัย ${a5F('', 180)} ตามกฎหมายของหน่วยงาน ${a5F('', 180)}</p>
      <p class="a5-indent2">- กรณีอื่น ๆ เช่น กรณีไม่มีความผิดทางอาญาแต่มีความผิดทางวินัย หรือกรณีเพิกถอนคำสั่งทางปกครองตามมาตรา ๔๖ แห่งพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม, ส่งเรื่องให้ต้นสังกัดดำเนินการในส่วนที่เกี่ยวข้อง, ส่งคณะกรรมการ ป.ป.ช. เป็นต้น</p>
      <div class="a5-line a5-indent2">${a5F(mc.note || '', 600)}</div>
      <p class="a5-num-h"><b>๑๔. ข้อเสนอ</b></p>
      <p class="a5-indent2">เห็นควรเสนอเรื่องให้คณะกรรมการ ป.ป.ท. พิจารณาวินิจฉัยชี้มูลตามความเห็นในข้อ ๑๓</p>
      <div class="a5-sign a5-sign-stack a5-sign-left">
        ${a5SignCol(intake.director || '', 'ประธานอนุกรรมการ/พนักงาน ป.ป.ท.', 'ลงชื่อ')}
        ${a5SignCol(team[0] || '', 'อนุกรรมการ/เจ้าหน้าที่ ป.ป.ท.', 'ลงชื่อ')}
        ${a5SignCol(q.investigator || intake.investigator || '', 'อนุกรรมการและเลขานุการ/พนักงาน ป.ป.ท. เจ้าของสำนวน', 'ลงชื่อ')}
      </div>
      <p class="a5-form-code">${escapeHtml(A5_FORMS['644'].code)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๘ + ๙ + ๑๐ — หนังสือเกี่ยวกับพนักงานอัยการ · ฉบับละ ๑ หน้า ===== */
  function paperProsecutorLetters(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, o = i.outcome || {}, q = i.inquiry644 || {}, intake = i.intake || {};
    const accused = a5AccusedLine(state);
    const allegations = q.allegations || c.subject || '';
    const prosecutor = o.prosecutor || '';
    const inv = q.investigator || intake.investigator || '';
    const today = todayISO();
    const SEC_GEN = 'เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ';
    return `<section class="a5-paper">
      ${a5LetterHdr('ตัวอย่างหนังสือแจ้งให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการเพื่อฟ้องคดีต่อศาล', c.id, today)}
      <div class="a5-line"><b>เรื่อง</b> ขอให้ไปพบพนักงานอัยการ</div>
      <div class="a5-line"><b>เรียน</b> ${a5F(accused, 380)} <span class="a5-hint">(ชื่อ – นามสกุล ผู้ถูกกล่าวหา)</span></div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> สำเนาหนังสือสำนักงานอัยการ ${a5F(prosecutor, 190)} (ผู้ฟ้องคดี) ที่ ${a5F('', 130)}</div>
      <div class="a5-line a5-indent3">ลงวันที่ ${a5F('', 150)} <span class="a5-hint">(หนังสือที่แจ้งว่าเห็นชอบให้สั่งฟ้องผู้ถูกกล่าวหา)</span></div>
      <p class="a5-indent2">ด้วยพนักงานอัยการได้มีคำสั่งฟ้องท่านต่อศาล ${a5F(`ศาล${A5_COURT}`, 250)} (ที่มีเขตอำนาจพิจารณาพิพากษา) ในความผิดฐาน ${a5F(allegations, 250)} (ฐานความผิดตามที่พนักงานอัยการแจ้ง) รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p>
      <p class="a5-indent2">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) จึงขอแจ้งให้ท่านทราบและขอให้ท่านไปพบพนักงานอัยการ ณ สำนักงานอัยการ ${a5F(prosecutor, 200)} (ผู้ฟ้องคดี) ในวันที่ ${a5F('', 180)} เวลา ${a5F('', 90)} น. ในกรณีที่ท่านประสงค์จะยื่นคำร้องขอปล่อยตัวชั่วคราวในชั้นพนักงานอัยการหรือชั้นศาลขอให้เตรียมหลักประกันไปพร้อมด้วย</p>
      <p class="a5-indent2">อนึ่ง หากท่านไม่ไปพบพนักงานอัยการตามวันเวลาที่กำหนด อาจเป็นเหตุให้ถูกออกหมายจับเพื่อนำตัวส่งฟ้องศาลต่อไปได้</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อทราบ</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', SEC_GEN, 'ขอแสดงความนับถือ', 'หรือผู้ที่ได้รับมอบหมาย')}</div>
      ${a5LetterFoot(intake.unit, inv)}
      ${a5Foot()}

      ${A5_PG}

      ${a5LetterHdr('ตัวอย่างหนังสือแจ้งผู้บังคับบัญชา กรณีให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการเพื่อฟ้องคดีต่อศาล', c.id, today)}
      <div class="a5-line"><b>เรื่อง</b> แจ้งคำสั่งฟ้องคดีของพนักงานอัยการ</div>
      <div class="a5-line"><b>เรียน</b> ${a5F(c.agency || '', 340)} <span class="a5-hint">(ผู้บังคับบัญชาหรือผู้มีอำนาจแต่งตั้งถอดถอนผู้ถูกกล่าวหา)</span></div>
      <div class="a5-line"><b>อ้างถึง</b> หนังสือสำนักงาน ป.ป.ท. ${a5F(state.documentData?.dispatchLetterNo || '', 260)}</div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> สำเนาหนังสือสำนักงานอัยการ ${a5F(prosecutor, 190)} (ผู้ฟ้องคดี) ที่ ${a5F('', 130)}</div>
      <div class="a5-line a5-indent3">ลงวันที่ ${a5F('', 150)} <span class="a5-hint">(หนังสือที่แจ้งว่าเห็นชอบให้สั่งฟ้องผู้ถูกกล่าวหา)</span></div>
      <p class="a5-indent2">ตามที่ได้แจ้งให้ท่านทราบว่าคณะกรรมการ ป.ป.ท. ได้ชี้มูลความผิด ${a5F(accused, 230)} (ระบุชื่อ-สกุล ตำแหน่งของผู้ถูกกล่าวหา) ในฐานความผิด ${a5F(allegations, 230)} (ตามมติของคณะกรรมการ ป.ป.ท.) โดยในส่วนของความผิดทางอาญาได้ส่งเรื่องให้พนักงานอัยการดำเนินการ ความละเอียดแจ้งแล้ว นั้น</p>
      <p class="a5-indent2">สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ขอเรียนว่า พนักงานอัยการได้มีคำสั่งฟ้อง ${a5F(accused, 220)} (ระบุชื่อ-สกุล ตำแหน่งของผู้ถูกกล่าวหา) ในความผิดฐาน ${a5F(allegations, 220)} (ฐานความผิดตามที่พนักงานอัยการแจ้ง) โดยกำหนดให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการ ณ สำนักงานอัยการ ${a5F(prosecutor, 190)} (ผู้ฟ้องคดี) ในวันที่ ${a5F('', 170)} เวลา ${a5F('', 90)} น. รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย ทั้งนี้ หากผู้ถูกกล่าวหาประสงค์จะยื่นคำร้องขอปล่อยตัวชั่วคราวในชั้นพนักงานอัยการหรือชั้นศาลขอให้เตรียมหลักประกันไปในวันดังกล่าว</p>
      <p class="a5-indent2">อนึ่ง หากผู้ถูกกล่าวหาไม่ไปพบพนักงานอัยการตามวันเวลาที่กำหนด อาจเป็นเหตุให้ถูกออกหมายจับเพื่อนำตัวส่งฟ้องศาลต่อไปได้</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดทราบ และแจ้งให้ผู้ถูกกล่าวหาทราบด้วย จักขอบคุณมาก</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', SEC_GEN, 'ขอแสดงความนับถือ', 'หรือผู้ที่ได้รับมอบหมาย')}</div>
      ${a5LetterFoot(intake.unit, inv)}
      ${a5Foot()}

      ${A5_PG}

      ${a5LetterHdr('ตัวอย่างหนังสือแจ้งพนักงานอัยการ แจ้งกำหนดนัดไปรายงานตัวของผู้ถูกกล่าวหา', c.id, today)}
      <div class="a5-line"><b>เรื่อง</b> การแจ้งให้ผู้ถูกกล่าวหามาพบพนักงานอัยการ</div>
      <div class="a5-line"><b>เรียน</b> ${a5F(prosecutor, 340)} <span class="a5-hint">(อัยการผู้ฟ้องคดี)</span></div>
      <div class="a5-line"><b>อ้างถึง</b> หนังสือสำนักงานอัยการ (ผู้ฟ้องคดี) ที่ ${a5F('', 150)} ลงวันที่ ${a5F('', 150)}</div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> สำเนาหนังสือสำนักงาน ป.ป.ท. ที่ ปป ๐๐../${a5F(c.id || '', 120)} ลงวันที่ ${a5F('', 140)}</div>
      <div class="a5-line a5-indent3"><span class="a5-hint">(หนังสือที่แจ้งผู้ถูกกล่าวหามาพบพนักงานอัยการ)</span></div>
      <p class="a5-indent2">ตามที่สำนักงานอัยการ (ผู้ฟ้องคดี) แจ้งให้ทราบว่า พนักงานอัยการได้มีคำสั่งฟ้อง ${a5F(accused, 230)} (ชื่อ – นามสกุล ผู้ถูกกล่าวหา) ในฐานความผิด ${a5F(allegations, 230)} และขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) แจ้งให้ผู้ถูกกล่าวหามาพบพนักงานอัยการตามวันเวลาที่กำหนด ความละเอียดแจ้งแล้ว นั้น</p>
      <p class="a5-indent2">สำนักงาน ป.ป.ท. ขอเรียนว่า ได้มีหนังสือแจ้งให้ ${a5F(accused, 230)} (ชื่อ – นามสกุล ผู้ถูกกล่าวหา) ผู้ถูกกล่าวหามาพบพนักงานอัยการ ณ สำนักงานอัยการ ${a5F(prosecutor, 200)} (ผู้ฟ้องคดี) ในวันที่ ${a5F('', 170)} เวลา ${a5F('', 90)} น. แล้ว รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดทราบ และหากถึงกำหนดวันนัด ผู้ถูกกล่าวหามาพบพนักงานอัยการหรือไม่ โปรดแจ้งให้ทราบด้วย จักขอบคุณมาก</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', SEC_GEN, 'ขอแสดงความนับถือ', 'หรือผู้ที่ได้รับมอบหมาย')}</div>
      ${a5LetterFoot(intake.unit, inv)}
      ${a5Foot()}
      <p class="a5-form-code">${escapeHtml(`${A5_FORMS.p8.code} · ${A5_FORMS.p9.code} · ${A5_FORMS.p10.code}`)}</p>
    </section>`;
  }

  /* ===== แบบ ปปท. ๑๑–๒๐ — ชุดเอกสารหมายจับ · รวม ๑๕ หน้า ===== */
  function paperWarrants(state) {
    const c = state.caseData || {}, i = state.inquiry || {}, q = i.inquiry644 || {}, o = i.outcome || {}, intake = i.intake || {}, m = i.committee213 || {}, mc = i.committee644 || {};
    const w = o.warrant || {};
    const accused = a5AccusedLine(state);
    const inv = q.investigator || intake.investigator || '';
    const allegations = q.allegations || c.subject || '';
    const prosecutor = o.prosecutor || '';
    const today = todayISO();
    const court = w.court || `ศาล${A5_COURT}`;
    const SEC_GEN = 'เลขาธิการคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ';
    /* แถวหัวข้อ:ค่า แบบเส้นใต้ทึบ (แบบพิมพ์ศาล/ตำหนิรูปพรรณ) */
    const row = (label, ...cells) => `<div class="a5-line a5-urow"><span class="a5-ulabel">${label}</span>${cells.join('')}</div>`;
    /* ชุดช่องติ๊กลักษณะรูปพรรณ (แบบ ๑๖) */
    const traits = (label, ...opts) => `<tr><th>${escapeHtml(label)}</th><td>${opts.map(t => `<span class="a5-cbopt">${a5Cb(false, t)}</span>`).join('')}</td></tr>`;
    /* เลขบัตรประชาชน 13 หลัก เป็นกล่องช่องสี่เหลี่ยมตามแบบศาล: [x]-[xxxx]-[xxxxx]-[xx]-[x] */
    const idBoxes = (value) => {
      const digits = String(value || '').replace(/\D/g, '');
      const groups = [digits.slice(0, 1), digits.slice(1, 5), digits.slice(5, 10), digits.slice(10, 12), digits.slice(12, 13)];
      const sizes = [1, 4, 5, 2, 1];
      return `<span class="a5-id-boxes">${groups.map((g, gi) => `<span class="a5-id-group">${Array.from({ length: sizes[gi] }).map((_, i) => `<span class="a5-id-box">${escapeHtml(g[i] || '')}</span>`).join('')}</span>`).join('<span class="a5-id-dash">-</span>')}</span>`;
    };
    const warrantBody = (isAfter) => `
      <div class="a5-warrant-top">
        <span class="a5-circle"></span>
        <span>(๔๗ ทวิ)</span>
        <span class="a5-box-inline">${isAfter ? 'เหตุเกิด ๓๐ เม.ย. ๕๙ เป็นต้นไป' : 'กรณีเหตุเกิดก่อน ๓๐ เม.ย. ๕๙'}</span>
        <span class="a5-right-note">สำหรับศาลใช้</span>
      </div>
      <p class="a5-warrant-title">หมายจับ</p>
      <div class="a5-court-crest"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="54" height="58"></div>
      <p class="a5-right">ที่ ${a5Us(w.warrantNo || '', 130)}/๒๕${a5Us('', 50)}</p>
      <h3 class="a5-center a5-king">ในพระปรมาภิไธยพระมหากษัตริย์</h3>
      <p class="a5-right"><b>ศาล</b> ${a5Us(court, 280)}</p>
      <p class="a5-right">วันที่ ${a5Us('', 60)} เดือน ${a5Us('', 130)} พุทธศักราช ๒๕${a5Us('', 50)}</p>
      <p class="a5-center"><b>ความอาญา</b></p>
      <p class="a5-right">คณะกรรมการ ป.ป.ท. โดย นาย/นาง/นางสาว ${a5Us(inv, 200)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <b>ผู้ร้อง</b></p>
      ${row('หมายถึง', a5Us('ผู้บัญชาการตำรวจแห่งชาติ , คณะกรรมการ ป.ป.ท.', 420))}
      ${row('ด้วย', a5Us(accused, 450))}
      ${row('ซึ่งต้องหาว่ากระทำความผิดฐาน', a5Us(allegations, 380))}
      <p>กรณีมีหลักฐานตามสมควรว่า* ชื่อ-สกุล ผู้ถูกกล่าวหา ${a5Us(accused, 330)}</p>
      <div class="a5-cbline a5-indent">${a5Cb(true, '๑. ได้หรือน่าจะได้กระทำความผิดอาญาซึ่งมีอัตราโทษจำคุกอย่างสูงเกินสามปี')}</div>
      <div class="a5-cbline a5-indent">${a5Cb(true, '๒. ได้หรือน่าจะได้กระทำความผิดอาญาและมีเหตุอันควรเชื่อว่า')}</div>
      <div class="a5-cbline a5-indent2">${a5Cb(true, '๒.๑ จะหลบหนี')}</div>
      <div class="a5-cbline a5-indent2">${a5Cb(false, '๒.๒ จะไปยุ่งเหยิงกับพยานหลักฐาน')}</div>
      <div class="a5-cbline a5-indent2">${a5Cb(false, '๒.๓ ก่อเหตุอันตรายประการอื่น')}</div>
      <div class="a5-cbline a5-indent">${a5Cb(false, '๓. อื่นๆ')} ${a5Us('', 380)}</div>
      <p class="a5-indent">เพราะฉะนั้นให้ท่านจับตัว* ชื่อ-สกุล ผู้ถูกกล่าวหา ${a5Us(accused, 300)}</p>
      ${row('เลขประจำตัวประชาชน', idBoxes(''), '<span class="a5-ulabel">เชื้อชาติ</span>', a5Us('', 150))}
      ${row('สัญชาติ', a5Us('', 130), '<span class="a5-ulabel">อาชีพ</span>', a5Us('', 130), '<span class="a5-ulabel">อยู่บ้านเลขที่</span>', a5Us('', 110), '<span class="a5-ulabel">หมู่ที่</span>', a5Us('', 70))}
      ${row('ถนน', a5Us('', 140), '<span class="a5-ulabel">ตรอก/ซอย</span>', a5Us('', 140), '<span class="a5-ulabel">ใกล้เคียง</span>', a5Us('', 140))}
      ${row('ตำบล/แขวง', a5Us('', 150), '<span class="a5-ulabel">อำเภอ/เขต</span>', a5Us('', 150), '<span class="a5-ulabel">จังหวัด</span>', a5Us('', 150))}
      ${row('โทรศัพท์', a5Us('', 150), '<span class="a5-ulabel">ไปส่งที่</span>', a5Us(prosecutor || 'สำนักงานอัยการพิเศษฝ่าย', 280))}
      <p>ภายในอายุความ ${a5Us(i.prelim?.limitation?.longYears || '', 70)} ปี นับแต่วันที่ ${a5Us('', 70)} เดือน ${a5Us('', 120)} พ.ศ. ๒๕${a5Us('', 50)} เพื่อจะได้ดำเนินการตามกฎหมาย แต่ไม่เกินวันที่ ${a5Us('', 70)} เดือน ${a5Us('', 120)} พ.ศ. ๒๕${a5Us('', 50)}</p>
      <div class="a5-sign">${a5SignCol('', 'ผู้พิพากษา', '')}</div>
      <p class="a5-right a5-hint">(พลิก)</p>
      <div class="a5-note">
        ${isAfter
        ? `<p><b>หมายเหตุ :</b> * ผู้ถูกกล่าวหาได้หลบหนีไปเมื่อวันที่ ${a5F('', 180)} ในระหว่างถูกดำเนินคดี จึงมิให้นับระยะเวลาที่ผู้ต้องหาหลบหนีรวมเป็นส่วนหนึ่งของอายุความ ตามมาตรา ๖๑/๑ แห่ง พ.ร.บ. มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม</p>`
        : `<p><b>หมายเหตุ :</b> * ให้ระบุชื่อตัว ชื่อสกุล และแนบตำหนิรูปพรรณของบุคคลที่จะถูกจับ เท่าที่ทราบไปพร้อมกับหมายนี้ด้วย</p>
           <p class="a5-indent">* เป็นการจับตัวเพื่อนำส่งพนักงานอัยการ เพื่อฟ้องคดีต่อศาล</p>`}
      </div>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <p class="a5-center"><b>บันทึก</b></p>
      <p class="a5-center">วันที่ ${a5F('', 110)} เดือน ${a5F('', 150)} พ.ศ. ๒๕${a5F('', 80)}</p>
      <p>เจ้าพนักงานผู้จัดการตามหมายได้แจ้งข้อความในหมายให้แก่ผู้เกี่ยวข้องทราบและได้ส่งหมายให้ตรวจดูแล้ว</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', 'เจ้าพนักงานผู้จัดการตามหมาย', '')}</div>
      <p class="a5-indent">ข้าพเจ้าผู้มีชื่อข้างท้ายนี้ได้รับทราบข้อความในหมาย และได้ตรวจดูหมายแล้ว</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', 'ผู้รับทราบ', '')}</div>
      <p class="a5-center a5-warn-h"><b>คำเตือน</b></p>
      <p class="a5-indent2">เจ้าพนักงานผู้จัดการตามหมายพึงปฏิบัติตามกฎหมาย และต้องแจ้งข้อกล่าวหาให้ผู้ถูกจับทราบ แสดงหมายจับต่อผู้ถูกจับ พร้อมทั้งแจ้งให้ผู้ถูกจับทราบถึงสิทธิตามประมวลกฎหมายวิธีพิจารณาความอาญา มาตรา ๘</p>`;

    return `<section class="a5-paper">
      ${/* ---- แบบ ปปท. ๑๑ คำร้องขอหมายจับ (๓ หน้า) ---- */ ''}
      <div class="a5-court-crest"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="54" height="58"></div>
      <div class="a5-court-caption"><p>( คำร้อง )</p><p>ขอหมายจับ</p></div>
      <p class="a5-right">ที่ ${a5Us('', 130)}/${a5Us('', 90)}</p>
      <p class="a5-req-mark">รับคำร้อง</p>
      <p class="a5-req-mark">เรียกสอบ</p>
      <div class="a5-line"><span>${a5Us('', 190)} ผู้พิพากษา</span><span class="a5-grow"></span><b>ศาล</b> ${a5Us(court, 260)}</div>
      <p class="a5-right">วันที่ ${a5Us('', 60)} เดือน ${a5Us('', 130)} พุทธศักราช ๒๕${a5Us('', 50)}</p>
      <p class="a5-center"><b>ความอาญา</b></p>
      <p class="a5-right">คณะกรรมการ ป.ป.ท. โดย นาย/นาง/นางสาว ${a5Us(inv, 190)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <b>ผู้ร้อง</b></p>
      ${row('ข้าพเจ้า', a5Us(inv, 230), '<span class="a5-ulabel">ตำแหน่ง</span>', a5Us('พนักงาน ป.ป.ท.', 190))}
      ${row('อายุ', a5Us('', 90), '<span class="a5-ulabel">ปี อาชีพ</span>', a5Us('รับราชการ', 120), '<span class="a5-ulabel">สถานที่ทำงาน</span>', a5Us('สำนักงาน ป.ป.ท.', 170))}
      ${row('แขวง/ตำบล', a5Us('คลองเกลือ', 140), '<span class="a5-ulabel">เขต/อำเภอ</span>', a5Us('ปากเกร็ด', 140), '<span class="a5-ulabel">จังหวัด</span>', a5Us('นนทบุรี', 130))}
      ${row('โทรศัพท์', a5Us('', 180))}
      <p>ขอยื่นคำร้องขอออกหมายจับต่อศาล ดังมีข้อความที่จะกล่าวต่อไปนี้</p>
      <p class="a5-indent"><b>ข้อ ๑.</b> ด้วย ${a5Cb(true, '')}พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5Us(prosecutor, 200)} ได้ขอให้ พนักงาน ป.ป.ท./อนุกรรมการและเลขานุการ ขอศาล${A5_COURT} ${a5Us('', 180)} ขออนุมัติหมายจับ ${a5Us(accused, 230)} เลขประจำตัวประชาชน ${idBoxes('')}</p>
      <p class="a5-indent2">${a5Cb(true, '')}ปรากฏจากรายงานการไต่สวนและวินิจฉัยชี้มูลของ คณะกรรมการ ป.ป.ท. ว่า นาย/นาง/นางสาว ${a5Us(accused, 250)} ผู้ถูกกล่าวหา</p>
      ${row('อายุ', a5Us('', 90), '<span class="a5-ulabel">ปี เชื้อชาติ</span>', a5Us('', 120), '<span class="a5-ulabel">สัญชาติ</span>', a5Us('', 120), '<span class="a5-ulabel">อาชีพ</span>', a5Us('', 110))}
      ${row('อยู่บ้านเลขที่', a5Us('', 130), '<span class="a5-ulabel">หมู่ที่</span>', a5Us('', 90), '<span class="a5-ulabel">ถนน</span>', a5Us('', 130))}
      ${row('ตรอก/ซอย', a5Us('', 130), '<span class="a5-ulabel">ใกล้เคียง</span>', a5Us('', 130), '<span class="a5-ulabel">ตำบล/แขวง</span>', a5Us('', 130))}
      ${row('อำเภอ/เขต', a5Us('', 140), '<span class="a5-ulabel">จังหวัด</span>', a5Us('', 140), '<span class="a5-ulabel">โทรศัพท์</span>', a5Us('', 130))}
      <p>ซึ่งมีตำหนิรูปพรรณตามที่แนบมาพร้อมนี้</p>
      <div class="a5-cbline a5-indent">${a5Cb(true, 'ได้หรือน่าจะได้กระทำความผิดอาญาร้ายแรงซึ่งมีอัตราโทษจำคุกอย่างสูงเกิน ๓ ปี')}</div>
      <div class="a5-cbline a5-indent">${a5Cb(true, 'ได้หรือน่าจะได้กระทำความผิดอาญา และน่าจะหลบหนีหรือจะไปยุ่งเหยิงกับพยานหลักฐานหรือก่ออันตรายประการอื่น')}</div>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      ${row('เหตุเกิดที่', a5Us(i.prelim?.place || '', 430))}
      <p>เมื่อวันที่ ${a5Us('', 90)} เดือน ${a5Us('', 130)} พุทธศักราช ${a5Us('', 90)} เวลา ${a5Us('', 90)} น.</p>
      <p>มีพฤติการณ์กระทำความผิดที่เกี่ยวกับเหตุออกหมายจับ กล่าวคือ</p>
      <p class="a5-indent2">ตามวันเวลาเกิดเหตุ ชื่อ-สกุล สถานะ ตำแหน่ง อำนาจหน้าที่ผู้ถูกกล่าวหา ${a5F(accused, 280)}</p>
      <p class="a5-indent2">พิจารณาพยานหลักฐานจากการไต่สวน ทั้งพยานบุคคลและพยานเอกสารรับฟังได้ความว่า เมื่อวันที่ ${a5F(q.summary || '', 330)}</p>
      <div class="a5-line">${a5F('', 640)}</div>
      <p class="a5-indent2">การกระทำดังกล่าวข้างต้นของผู้ถูกกล่าวหา เป็นเหตุทำให้ (ความเสียหาย) ${a5F(i.prelim?.issues?.damage || '', 300)}</p>
      <p class="a5-indent2">ดังนั้น การกระทำของผู้ถูกกล่าวหา จึงเป็นการกระทำทุจริตในภาครัฐอันเป็นความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${a5F(allegations, 280)}</p>
      <p class="a5-indent2">คณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน ได้แจ้งคำสั่งคณะกรรมการ ป.ป.ท. ที่ ${a5F(m.orderNo || '', 170)} ลงวันที่ ${a5F(a5DateShort(m.orderDate), 150)} เรื่องแต่งตั้งคณะอนุกรรมการไต่สวน/คณะพนักงานไต่สวน กรณีเจ้าหน้าที่ของรัฐกระทำทุจริตในภาครัฐ และสิทธิคัดค้านให้ผู้ถูกกล่าวหาทราบแล้วและได้รวบรวมพยานหลักฐานที่เกี่ยวข้องของผู้ถูกกล่าวหาแล้ว และได้แจ้งข้อกล่าวหาแก่ผู้ถูกกล่าวหา โดยวิธีส่งบันทึกแจ้งข้อกล่าวหาทางไปรษณีย์ ตามหนังสือสำนักงาน ป.ป.ท. ลับ ที่ ${a5F('', 140)} ลงวันที่ ${a5F(a5DateShort(q.noticeSentAt), 140)} พร้อมบันทึกการแจ้งข้อกล่าวหา ฉบับลงวันที่ ${a5F(a5DateShort(q.noticeSentAt), 140)} ส่งไปยัง ณ ภูมิลำเนาของผู้ถูกกล่าวหา ตามหลักฐานทางทะเบียนราษฎร ณ บ้านเลขที่ ${a5F('', 170)} ซึ่งผู้ถูกกล่าวหาได้รับทราบข้อกล่าวหาแล้ว ต่อมาได้มีหนังสือชี้แจงแก้ข้อกล่าวหา ฉบับลงวันที่ ${a5F('', 150)}</p>
      <p class="a5-indent2">ต่อมา คณะกรรมการ ป.ป.ท. ได้มีมติการประชุม ครั้งที่ ${a5F(mc.mtiNo || '', 130)} ลงวันที่ ${a5F(a5DateShort(mc.mtiDate), 140)} ระเบียบวาระที่ ${a5F('', 110)} คณะกรรมการ ป.ป.ท. ได้มีมติวินิจฉัยชี้มูลความผิดทางอาญาและวินัยแก่ ${a5F(accused, 230)} (ชื่อ-สกุล ผู้ถูกกล่าวหา) ดังนี้</p>
      <p class="a5-indent2">ประเด็นที่ ๑ ผู้ถูกกล่าวหา เป็นความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${a5F(allegations, 260)} (ให้แยกประเด็นละมาตรา)</p>
      <p class="a5-indent2">เมื่อวันที่ ${a5F(a5DateShort(o.disciplineSentAt || mc.mtiDate), 150)} คณะกรรมการ ป.ป.ท. ได้ส่งรายงานการไต่สวน พร้อมด้วยเอกสารประกอบเรื่องกล่าวหา เรื่องที่ ${a5F(c.id || '', 140)} ไปยังอธิบดีอัยการ สำนักงานคดีปราบปรามการทุจริต ${a5F(prosecutor, 170)} โดยขอให้พิจารณาคดีอาญาแก่ ${a5F(accused, 210)} (ชื่อ-สกุล ผู้ถูกกล่าวหา) ตามหนังสือสำนักงาน ป.ป.ท. ลับ ที่ ปป ๐๐../${a5F('', 120)} ลงวันที่ ${a5F('', 140)}</p>
      <p class="a5-indent2">เมื่อวันที่ ${a5F('', 140)} พนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 170)} ได้มีหนังสือแจ้งว่าได้มีคำสั่งฟ้อง ${a5F(accused, 210)} ในความผิดตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ${a5F(allegations, 220)} โดยให้ส่งตัวผู้ถูกกล่าวหาไปยังสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 160)} เพื่อฟ้องต่อศาล${A5_COURT} ${a5F('', 140)} ในวันที่ ${a5F('', 140)} เวลา ${a5F('', 90)} นาฬิกา ตามหนังสือ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F('', 150)} ที่ ${a5F('', 120)} ลงวันที่ ${a5F('', 140)}</p>
      <p class="a5-indent2">สำนักงาน ป.ป.ท. มีหนังสือ ลับ ที่ ปป ๐๐../${a5F('', 120)} ลงวันที่ ${a5F('', 140)} ถึงผู้ถูกกล่าวหาแจ้งให้ไปพบพนักงานอัยการที่สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 160)} ในวันที่ ${a5F('', 140)} เวลา ${a5F('', 90)} นาฬิกา โดยได้ส่งหนังสือดังกล่าวไปยังภูมิลำเนาตามทะเบียนราษฎรของผู้ถูกกล่าวหา ณ บ้านเลขที่ ${a5F('', 170)} ด้วยวิธีการส่งไปรษณีย์ด่วนพิเศษในประเทศ (EMS) ซึ่งผู้ถูกกล่าวหาได้รับทราบแล้ว ปรากฏตามไปรษณีย์ตอบรับ ${a5F(state.documentData?.dispatchEms || '', 190)}</p>
      <p class="a5-indent2">ต่อมาพนักงานอัยการ สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 160)} แจ้งว่า ผู้ถูกกล่าวหาไม่ได้ไปพบพนักงานอัยการเพื่อยื่นฟ้องต่อศาล${A5_COURT} ${a5F('', 140)} ในวันที่ ${a5F('', 140)} เวลา ${a5F('', 90)} นาฬิกา ตามกำหนดนัดข้างต้น และไม่แจ้งเหตุขัดข้องให้ทราบและ</p>
      ${a5Foot()}${A5_PG}${a5PgNo(3)}
      <p>ไม่สามารถติดต่อด้วยวิธีอื่นใดได้ กรณีมีพฤติการณ์หลบหนีและเพื่อมิให้เสียหายแก่คดี จึงขอให้พนักงาน ป.ป.ท./อนุกรรมการและเลขานุการคณะอนุกรรมการไต่สวนดำเนินการออกหมายจับ ${a5F(accused, 220)} ต่อศาล${A5_COURT} ${a5F('', 140)} โดยยื่นคำร้องต่อศาลเพื่อขอให้ออกหมายจับ ${a5F(accused, 220)} เนื่องจากผู้ถูกกล่าวหา ได้หรือน่าจะได้กระทำความผิดอาญาตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ ซึ่งมีอัตราโทษ ${a5F('', 170)} และมีพฤติการณ์หลบหนี จึงมีเหตุที่จะออกหมายจับได้ ตามประมวลกฎหมายวิธีพิจารณาความอาญา มาตรา ๖๖ (๒) ตามหนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F('', 150)} ที่ ${a5F('', 120)} ลงวันที่ ${a5F('', 140)}</p>
      <p class="a5-indent2">เป็นการกระทำความผิดฐาน ${a5F(allegations, 280)} ตามประมวลกฎหมายอาญา/กฎหมายอื่น ๆ มาตรา ${a5F('', 170)} รายละเอียดข้อมูลและพยานหลักฐาน ปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
      <p class="a5-indent2">อนึ่ง คดีดังกล่าวเหตุเกิดขึ้นหลังวันที่ ๓๐ เมษายน ๒๕๕๙ โดยผู้ถูกกล่าวหาได้หลบหนีไป เมื่อวันที่ ${a5F('', 180)} ในระหว่างถูกดำเนินคดี จึงมิให้นับระยะเวลาที่ผู้ต้องหาหลบหนีรวมเป็นส่วนหนึ่งของอายุความ ตามมาตรา ๖๑/๑ แห่ง พ.ร.บ. มาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม (ใช้ในกรณีเหตุเกิดขึ้นหลังวันที่ ๓๐ เมษายน ๒๕๕๙)</p>
      <p class="a5-indent"><b>ข้อ ๒.</b> ผู้ร้องประสงค์จะทำการจับกุม ${a5F(accused, 300)}</p>
      <p class="a5-indent2">จึงขอให้ศาลออกหมายจับ ${a5F(accused, 280)} มาดำเนินคดี</p>
      <p class="a5-indent2">ผู้ร้อง ${a5Cb(false, 'เคย')} ${a5Cb(true, 'ไม่เคย')} ร้องขอให้ศาล ${a5F(A5_COURT, 220)} ออกหมายจับบุคคลดังกล่าว โดยอาศัยเหตุแห่งการร้องขอเดียวกันนี้ หรือเหตุอื่น (ระบุ) ${a5F('', 180)}</p>
      <p class="a5-indent2">และศาลมีคำสั่ง ${a5F(w.note || '', 380)}</p>
      <p class="a5-center">ควรมิควรแล้วแต่จะโปรด</p>
      <div class="a5-sign a5-sign-stack">
        ${a5SignCol(inv, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ผู้ร้อง', 'ลงชื่อ')}
        ${a5SignCol(inv, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ผู้เรียง/พิมพ์', 'ลงชื่อ')}
      </div>
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๒ บันทึกคำเบิกความ (๑ หน้า) ---- */ ''}
      <p class="a5-court-title">บันทึกคำเบิกความ</p>
      <p class="a5-right"><b>ศาล</b> ${a5Us(court, 280)}</p>
      <p class="a5-right">วันที่ ${a5Us('', 60)} เดือน ${a5Us('', 130)} พุทธศักราช ๒๕${a5Us('', 50)}</p>
      <p class="a5-center"><b>ความอาญา</b></p>
      <p class="a5-right">คณะกรรมการ ป.ป.ท. โดย นาย/นาง ${a5Us(inv, 200)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <b>ผู้ร้อง</b></p>
      <p class="a5-indent2">พยานได้ปฏิญาณหรือสาบานตนแล้วเบิกความต่อศาล มีสาระสำคัญว่า</p>
      ${row('พยานชื่อ', a5Us(inv, 220), '<span class="a5-ulabel">พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. อายุ</span>', a5Us('', 80), '<span class="a5-ulabel">ปี อาชีพ</span>', a5Us('รับราชการ', 120))}
      ${row('ตั้งบ้านเรือนอยู่เลขที่', a5Us('', 380))}
      <p>เกี่ยวพันกับคดีนี้โดยเป็นผู้ร้องและรู้เห็นในคดีนี้คือ</p>
      <p class="a5-indent2">(เป็นอนุกรรมการและเลขานุการ คณะอนุกรรมการไต่สวน/เป็นพนักงาน ป.ป.ท. เจ้าของสำนวนคดี) โดยเป็นคดีที่คณะกรรมการ ป.ป.ช. ได้มอบหมายให้คณะกรรมการ ป.ป.ท. ดำเนินการแทน ตามมาตรา ๖๒ แห่งพระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑ โดยสำนักงาน ป.ป.ช. ได้ส่งเรื่องมายังสำนักงาน ป.ป.ท. เพื่อดำเนินการตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม ซึ่งมีพฤติการณ์แห่งคดี คือ ${a5F(q.summary || '', 280)} (ให้นำพฤติการณ์ที่ระบุในคำร้องขอออกหมายจับมาระบุให้ครบถ้วน)</p>
      <div class="a5-line">${a5F('', 640)}</div>
      <div class="a5-line">${a5F('', 640)}</div>
      <p class="a5-indent2">ต่อมาคณะกรรมการ ป.ป.ท. มีมติชี้มูลความผิด และส่งสำนวนไปยังสำนักงานอัยการคดีพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 170)} พนักงานอัยการมีคำสั่งฟ้องคดี และแจ้งให้สำนักงาน ป.ป.ท. แจ้งให้ผู้ถูกกล่าวหาไปพบพนักงานอัยการ แต่ผู้ถูกกล่าวหาไม่ไปพบพนักงานอัยการตามแจ้ง และพฤติการณ์น่าเชื่อว่า ผู้ถูกกล่าวหาได้กระทำความผิดจริงและหลบหนี รายละเอียดข้อมูลพยานหลักฐานปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
      <p class="a5-indent2">จึงขอประทานอนุญาตศาล โปรดออกหมายจับผู้ต้องหาตามคำร้อง</p>
      <div class="a5-sign">${a5SignCol(inv, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. พยานผู้ร้อง', 'ลงชื่อ')}</div>
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๓ รายงานกระบวนการพิจารณา (๒ หน้า) ---- */ ''}
      <p class="a5-court-title a5-left">รายงาน<br>กระบวนการ<br>พิจารณา</p>
      <p class="a5-right">คดีหมายเลขดำที่ ${a5Us('', 130)}/ ๒๕${a5Us('', 50)}</p>
      <p class="a5-right">คดีหมายเลขแดงที่ ${a5Us('', 130)}/ ๒๕${a5Us('', 50)}</p>
      <p class="a5-right"><b>ศาล</b> ${a5Us(court, 260)}</p>
      <p class="a5-center">วันที่ ${a5Us('', 60)} เดือน ${a5Us('', 130)} พุทธศักราช ๒๕${a5Us('', 50)}</p>
      <p class="a5-center"><b>ความอาญา</b></p>
      <p class="a5-indent">คณะกรรมการ ป.ป.ท. โดย นาย/นาง/นางสาว ${a5Us(inv, 200)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. <b>ผู้ร้อง</b></p>
      <p>ผู้พิพากษาออกนั่งพิจารณาคดีนี้เวลา ${a5Us('', 130)} นาฬิกา</p>
      <p class="a5-indent2">วันนี้ ${a5Us(inv, 190)} พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ตำแหน่ง ${a5Us('พนักงาน ป.ป.ท.', 170)}</p>
      <p class="a5-right">ได้ยื่นคำร้องขอให้ศาลออกหมายจับ</p>
      <p>สอบพยานผู้ร้องซึ่งเบิกความประกอบพยานหลักฐานที่แนบมาพร้อมคำร้อง ${a5Us('', 120)} ปาก จำนวน ${a5Us('', 120)}</p>
      <p class="a5-indent2">คดีเสร็จสิ้นการไต่สวน ให้รอฟังคำสั่ง</p>
      <p class="a5-right">/อ่านแล้ว</p>
      <div class="a5-sign a5-sign-stack">
        ${a5SignCol('', 'ผู้พิพากษา บันทึก/อ่าน', '')}
        ${a5SignCol(inv, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท. ผู้ร้อง', '')}
      </div>
      <p class="a5-center a5-order-h"><b>คำสั่ง</b></p>
      <p class="a5-indent2">พิเคราะห์พยานหลักฐานของผู้ร้องแล้วเห็นว่า ${a5F(w.note || '', 320)}</p>
      <div class="a5-line">${a5F('', 640)}</div>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <p class="a5-indent2">กรณีมีพยานหลักฐานตามควรว่า ชื่อ-สกุล ผู้ถูกกล่าวหา ${a5F(accused, 280)}</p>
      <div class="a5-cbline a5-indent">${a5Cb(true, 'ได้หรือน่าจะได้กระทำความผิดอาญาร้ายแรงซึ่งมีอัตราโทษจำคุกอย่างสูงเกิน ๓ ปี')}</div>
      <div class="a5-cbline a5-indent">${a5Cb(false, 'ได้หรือน่าจะได้กระทำความผิดอาญา และน่าจะหลบหนีหรือจะไปยุ่งเหยิงกับพยานหลักฐานหรือก่ออันตรายประการอื่น')}</div>
      <p>จึงอนุญาตให้ออกหมายจับ ${a5F(accused, 280)} ตามขอ</p>
      <p>และเมื่อจัดการตามหมายจับได้แล้ว ให้ส่งบันทึกการจับกุมต่อศาลภายใน ${a5F('', 110)} วัน</p>
      <p class="a5-indent2">ให้ถ่ายสำเนา ${a5F('', 380)}</p>
      <p>เพื่อเก็บไว้กับคำร้องและสำเนาหมาย</p>
      <p class="a5-indent2">ได้อ่านคำสั่งให้ผู้ร้องฟังโดยชอบแล้ว</p>
      <p class="a5-right">/อ่านแล้ว</p>
      <div class="a5-sign">${a5SignCol('', 'ผู้พิพากษา', '')}</div>
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๔ หมายจับ (เหตุเกิดก่อน ๓๐ เม.ย. ๕๙ — อายุความไม่สะดุดหยุดลง) ---- */ ''}
      ${warrantBody(false)}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๕ หมายจับ (เหตุเกิด ๓๐ เม.ย. ๕๙ เป็นต้นไป — อายุความสะดุดหยุดลง) ---- */ ''}
      ${warrantBody(true)}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๖ ตำหนิรูปพรรณผู้กระทำความผิด (๒ หน้า) ---- */ ''}
      <div class="a5-photo-box">ภาพถ่าย<br>ผู้ถูกกล่าวหา<br>จาก ทร.14</div>
      <div class="a5-court-crest"><img class="a5-garuda" src="${A5_GARUDA_IMG}" alt="ตราครุฑ" width="46" height="50"></div>
      <p class="a5-center"><b>สำนักงาน ป.ป.ท.</b></p>
      <p class="a5-center a5-trait-title"><b>ตำหนิรูปพรรณผู้กระทำความผิด</b></p>
      <p class="a5-hint">(เติมข้อความในช่องว่าง และกาเครื่องหมาย ✓ ใน ☐ หน้าข้อความที่ต้องการได้มากกว่าหนึ่งรายการ)</p>
      ${row('ส่วนราชการ กลุ่ม/กอง/สำนัก', a5Us(intake.unit || '', 280), '<span class="a5-ulabel">สำนักงาน ป.ป.ท.</span>')}
      ${row('หมายจับที่', a5Us(w.warrantNo || '', 200), '<span class="a5-ulabel">คดี ป.ป.ท. ที่</span>', a5Us(c.id || '', 190))}
      ${row('วันเดือนปีที่ส่งรายงาน', a5Us(a5DateShort(today), 380))}
      ${row('ความผิดฐาน', a5Us(allegations, 430))}
      ${row('วันเดือนปี เวลา และสถานที่เกิดเหตุ', a5Us(i.prelim?.place || '', 330))}
      ${row('วันขาดอายุความหรือกำหนดล่วงเลยในการลงอาญา', a5Us(a5DateShort(i.prelim?.limitation?.longExpiry) || '', 240))}
      ${row('ชื่อนามสกุล (ภาษาไทย)', a5Us(accused, 250), `<span class="a5-ulabel">เพศ</span>${a5Cb(false, 'ชาย')}${a5Cb(false, 'หญิง')}`)}
      ${row('ชื่อนามสกุล (ภาษาอังกฤษตามหนังสือเดินทาง)', a5Us('', 300))}
      <p class="a5-hint">เลขบัตรประจำตัวประชาชน / บัตรประจำตัวเจ้าหน้าที่ของรัฐ – พนักงานองค์การของรัฐ / ใบสำคัญประจำตัวคนต่างด้าว / หนังสือเดินทาง</p>
      ${row('เลขประจำตัว', a5Us('', 430))}
      ${row('ชื่ออื่น', a5Us('', 230), '<span class="a5-ulabel">ชื่อสกุลอื่น</span>', a5Us('', 230))}
      ${row('วันเดือนปีเกิด', a5Us('', 190), '<span class="a5-ulabel">เชื้อชาติ</span>', a5Us('', 150), '<span class="a5-ulabel">สัญชาติ</span>', a5Us('', 150))}
      ${row('ประวัติ คดี', a5Us(c.id || '', 430))}
      ${row('ชื่อนามสกุลบิดา', a5Us('', 230), '<span class="a5-ulabel">ที่พัก</span>', a5Us('', 230))}
      ${row('ชื่อนามสกุลมารดา', a5Us('', 230), '<span class="a5-ulabel">ที่พัก</span>', a5Us('', 230))}
      ${row('ชื่อนามสกุลสามี/ภรรยา', a5Us('', 220), '<span class="a5-ulabel">ที่พัก</span>', a5Us('', 220))}
      ${row('ญาติ / เพื่อนสนิท', a5Us('', 230), '<span class="a5-ulabel">ที่พัก</span>', a5Us('', 230))}
      ${row('อาชีพ อดีต', a5Us('', 430))}
      ${row('สถานที่ทำงาน', a5Us(c.agency || '', 430))}
      ${row('ที่อยู่ครั้งสุดท้าย', a5Us('', 430))}
      ${row('ภูมิลำเนาเดิม', a5Us('', 430))}
      ${row('แหล่งที่ไปเป็นประจำ', a5Us('', 430))}
      ${row('กลุ่มหรือแกงค์ที่มั่วสุม', a5Us('', 430))}
      ${row('รายชื่อบุคคลในกลุ่ม', a5Us('', 430))}
      ${row('ตำหนิรูปพรรณ สูง', a5Us('', 110), '<span class="a5-ulabel">ซม. น้ำหนัก</span>', a5Us('', 110), '<span class="a5-ulabel">กก. หมู่โลหิต</span>', a5Us('', 110))}
      <table class="a5-tbl a5-trait-tbl"><tbody>
        ${traits('รูปร่าง', 'สูง', 'สันทัด', 'เตี้ย', 'ล่ำสัน', 'อ้วน', 'ผอม', 'อื่น ๆ')}
        ${traits('ผิว', 'ขาว', 'ขาวเหลือง', 'ดำ', 'ดำแดง', 'ตกกระ', 'ละเอียด', 'หยาบ', 'อื่น ๆ')}
        ${traits('รูปหน้า', 'กลม', 'รูปไข่', 'สามเหลี่ยม', 'สี่เหลี่ยม', 'แหลมหลิม', 'อื่น ๆ')}
        ${traits('ผม', 'เป๋', 'แสกกลาง', 'เสย', 'เส้นผมตรง', 'เป็นคลื่น', 'หยิก', 'ผมฟู', 'หนา', 'บาง', 'ดำ', 'ขาว', 'หงอก', 'หงอกประปราย', 'แดง', 'ทอง', 'อื่น ๆ')}
      </tbody></table>
      ${a5Foot()}${A5_PG}${a5PgNo(2)}
      <table class="a5-tbl a5-trait-tbl"><tbody>
        ${traits('ศีรษะ', 'ล้านเถิก', 'ล้านเลี่ยน', 'ล้านครึ่งศีรษะ', 'ล้านง่ามถ่อ', 'อื่น ๆ')}
        ${traits('หน้าผาก', 'กว้าง', 'แคบ', 'โหนก', 'ตรง', 'ลาด', 'สั้น', 'อื่น ๆ')}
        ${traits('คิ้ว', 'หนา', 'บาง', 'ต่อ', 'ห่าง', 'สั้น', 'ชู', 'ดำ', 'ขาว', 'แดง', 'หงอกประปราย', 'อื่น ๆ')}
        ${traits('ตา', 'โต', 'เล็ก', 'ชั้นเดียว', 'สองชั้น', 'โปน', 'ลึก', 'ปรือ', 'หยี', 'เหล่', 'เข', 'เอก', 'ถั่ว', 'อื่น ๆ')}
        ${traits('หู', 'กาง', 'ลีบ', 'กลม', 'สามเหลี่ยม', 'สี่เหลี่ยม', 'กะหล่ำปลี', 'ติ่งหูเหลี่ยม', 'ติ่งหูราบ', 'ติ่งหูย้อย', 'อื่น ๆ')}
        ${traits('จมูก', 'ดั้งจมูกราบ', 'ดั้งจมูกโด่ง', 'ดั้งจมูกลึก', 'สันจมูกตรง', 'สันจมูกโค้ง', 'สันจมูกเหลี่ยม', 'สันจมูกสั้น', 'จมูกกว้าง', 'จมูกแคบ', 'จมูกเชิด', 'จมูกงุ้ม', 'อื่น ๆ')}
        ${traits('ปาก', 'หนา', 'บาง', 'กว้าง', 'แคบ', 'รูปกระจับ', 'บนยื่น', 'ล่างยื่น', 'ไม่มีร่องปาก', 'อื่น ๆ')}
        ${traits('ฟัน', 'ใหญ่', 'เล็ก', 'เรียบ', 'เก', 'ห่าง', 'ยื่น', 'หลอ', 'ขาว', 'เหลือง', 'ดำ', 'เลี่ยม', 'อื่น ๆ')}
        ${traits('คาง', 'ตรง', 'สั้น', 'ยื่น', 'ป้าน', 'บุ๋ม', 'เหลี่ยม', 'อื่น ๆ')}
        ${traits('หนวดและเครา', 'หนา', 'บาง', 'เล็กเรียว', 'ยาว', 'สั้น', 'ปลายงอน', 'สีดำ', 'แดง', 'หงอกขาว', 'หงอกประปราย', 'อื่น ๆ')}
        ${traits('สำเนียง', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคตะวันออก', 'ภาคตะวันตก', 'ภาคใต้', 'จีน', 'อื่น ๆ')}
        ${traits('เสียง', 'ดัง', 'ค่อย', 'แหบ', 'แหลม', 'ทุ้ม', 'อื่น ๆ')}
        ${traits('ตำหนิ', 'ไฝ', 'ปาน', 'แผลเป็น', 'อื่น ๆ')}
      </tbody></table>
      ${row('สี ขนาด ตำแหน่ง', a5Us('', 430))}
      ${row('ลายสัก', a5Us('', 450))}
      ${row('รูป สี ตำแหน่ง', a5Us('', 440))}
      ${row('ลักษณะพิการ', a5Us('', 450))}
      ${row('ลักษณะอันน่าสังเกต', a5Us('', 440))}
      <div class="a5-sign a5-sign-center">${a5SignCol(inv, 'พนักงาน ป.ป.ท./เจ้าหน้าที่ ป.ป.ท.', '(ลงชื่อ)', 'ตำแหน่ง')}</div>
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๗ หนังสือแจ้งผลการดำเนินการ กรณีออกหมายจับแล้ว ---- */ ''}
      ${a5LetterHdr('ตัวอย่างหนังสือแจ้งผลดำเนินการ กรณีออกหมายจับแล้ว', c.id, today)}
      <div class="a5-line"><b>เรื่อง</b> แจ้งผลการดำเนินการเพื่อให้ได้ตัวผู้ถูกกล่าวหา</div>
      <div class="a5-line"><b>เรียน</b> อัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 260)}</div>
      <div class="a5-line"><b>อ้างถึง</b> หนังสือสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F('', 230)}</div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> ๑. สำเนาหมายจับศาล${A5_COURT} ${a5F('', 190)}</div>
      <div class="a5-line a5-indent3">ที่ ${a5F(w.warrantNo || '', 150)} ลงวันที่ ${a5F('', 150)} จำนวน ${a5F('', 80)} แผ่น</div>
      <div class="a5-line a5-indent3">๒. สำเนาตำหนิรูปพรรณผู้ถูกกล่าวหา จำนวน ${a5F('', 90)} แผ่น</div>
      <div class="a5-line a5-indent3">๓. สำเนารายการข้อมูลทะเบียนราษฎรของผู้ถูกกล่าวหา จำนวน ${a5F('', 90)} แผ่น</div>
      <p class="a5-indent2">ตามหนังสือที่อ้างถึง สำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 170)} แจ้งว่า ${a5F(accused, 200)} (ชื่อ-สกุล ผู้ถูกกล่าวหา) มิได้ไปพบพนักงานอัยการตามกำหนดนัด โดยไม่ได้แจ้งเหตุผลให้ทราบ จึงไม่อาจยื่นฟ้องได้ และเห็นว่าผู้ถูกกล่าวหามีพฤติการณ์หลบหนี จึงขอให้สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตในภาครัฐ (สำนักงาน ป.ป.ท.) ดำเนินการขอออกหมายจับผู้ถูกกล่าวหาดังกล่าวต่อศาลอาญาทุจริตและประพฤติมิชอบ ${a5F('', 150)} ความละเอียดแจ้งแล้ว นั้น</p>
      <p class="a5-indent2">สำนักงาน ป.ป.ท. ขอเรียนว่า ศาล${A5_COURT} ${a5F('', 150)} ได้ออกหมายจับ ${a5F(accused, 200)} (ชื่อ-สกุล ผู้ถูกกล่าวหา) ตามหมายจับที่ ${a5F(w.warrantNo || '', 160)} ลงวันที่ ${a5F('', 150)} เป็นที่เรียบร้อยแล้ว รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย และจะได้เร่งรัดติดตามจับและควบคุมตัวผู้ถูกกล่าวหา เพื่อนำตัวส่งไปยังพนักงานอัยการเพื่อดำเนินคดีต่อไป ทั้งนี้หากผู้ถูกกล่าวหาไปพบพนักงานอัยการภายหลังศาลออกหมายจับขอโปรดแจ้งให้ทราบด้วย เพื่อจักได้ดำเนินการในส่วนที่เกี่ยวข้อง</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดทราบ</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', SEC_GEN, 'ขอแสดงความนับถือ', 'หรือผู้ที่ได้รับมอบหมาย')}</div>
      ${a5LetterFoot(intake.unit, inv)}
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๘ หนังสือแจ้งผู้บัญชาการตำรวจแห่งชาติ ---- */ ''}
      ${a5LetterHdr('ตัวอย่างหนังสือแจ้งผู้บัญชาการตำรวจแห่งชาติให้ดำเนินการจับกุมผู้ถูกกล่าวหาตามหมายศาล', c.id, today)}
      <div class="a5-line"><b>เรื่อง</b> ขอให้ดำเนินการจับกุมผู้ถูกกล่าวหาตามหมายจับ</div>
      <div class="a5-line"><b>เรียน</b> ผู้บัญชาการตำรวจแห่งชาติ</div>
      <div class="a5-line"><b>สิ่งที่ส่งมาด้วย</b> สำเนาหมายจับและตำหนิรูปพรรณผู้กระทำผิด จำนวน ${a5F('', 90)} แผ่น</div>
      <p class="a5-indent2">ด้วยศาล${A5_COURT} ${a5F('', 150)} ได้ออกหมายจับ ${a5F(accused, 210)} (ชื่อ-สกุล ผู้ถูกกล่าวหา) บัตรประจำตัวประชาชนเลขที่ ${a5F('', 180)} ตามหมายจับที่ ${a5F(w.warrantNo || '', 140)} ลงวันที่ ${a5F('', 150)} ซึ่งต้องหาว่ากระทำความผิดฐาน ${a5F(allegations, 200)} โดยในการดำเนินการจับกุมนั้น คณะกรรมการ ป.ป.ท. ได้มีมติมอบหมายให้เจ้าพนักงานตำรวจดำเนินการจับกุมผู้ถูกกล่าวหาตามหมายจับดังกล่าว เพื่อดำเนินการให้เป็นไปตามพระราชบัญญัติมาตรการของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ และที่แก้ไขเพิ่มเติม รายละเอียดปรากฏตามสิ่งที่ส่งมาด้วย</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการสืบจับตามหน้าที่และอำนาจต่อไป ผลเป็นประการใดโปรดแจ้งให้ทราบด้วย จักขอบคุณมาก</p>
      <div class="a5-sign a5-sign-center">${a5SignCol('', SEC_GEN, 'ขอแสดงความนับถือ', 'ผู้ที่ได้รับมอบหมาย')}</div>
      ${a5LetterFoot(intake.unit, inv)}
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๑๙ บันทึกข้อความส่งหมายจับให้ กอท. ---- */ ''}
      ${a5MemoHdr()}
      ${a5MemoMeta(intake.unit, c.id, today)}
      <div class="a5-line a5-memo-row"><b>เรื่อง</b> ขอส่งสำเนาหมายจับผู้ถูกกล่าวหา ${a5F(accused, 400)}</div>
      <div class="a5-line"><b>เรียน</b> ผอ. กอท.</div>
      <p class="a5-indent2">ด้วยคณะกรรมการ ป.ป.ท. ได้ชี้มูลความผิดคดีเรื่องที่ ${a5F(c.id || '', 190)} และเรื่องที่ ${a5F('', 190)} กรณีกล่าวหา ${a5F(accused, 230)} ว่ากระทำทุจริตในภาครัฐ และสำนักงานอัยการพิเศษฝ่ายคดีปราบปรามการทุจริต ${a5F(prosecutor, 150)} มีความเห็นสั่งฟ้องคดีต่อศาล แต่เนื่องจากผู้ถูกกล่าวหาไม่ไปพบพนักงานอัยการตามกำหนดนัด และแจ้งให้สำนักงาน ป.ป.ท. เป็นผู้ดำเนินการร้องขอต่อศาลให้ออกหมายจับ</p>
      <p class="a5-indent2">บัดนี้ ผู้รับผิดชอบ ได้ยื่นคำร้องขอหมายจับผู้ถูกกล่าวหาดังกล่าว และศาล${A5_COURT} ${a5F('', 140)} ได้อนุมัติหมายจับที่ ${a5F(w.warrantNo || '', 120)}/${a5F('', 80)} ลงวันที่ ${a5F('', 160)} จึงขอส่งสำเนาหมายจับและสำเนาเอกสารหลักฐานที่เกี่ยวข้อง พร้อมรับรองสำเนาถูกต้อง ดังนี้</p>
      <p class="a5-indent2">๑. สำเนาหมายจับศาล${A5_COURT} ${a5F('', 140)} ที่ ${a5F(w.warrantNo || '', 110)}/${a5F('', 80)} ลงวันที่ ${a5F('', 150)}</p>
      <p class="a5-indent2">๒. สำเนาตำหนิรูปพรรณผู้ถูกกล่าวหา</p>
      <p class="a5-indent2">๓. สำเนารายการข้อมูลทะเบียนราษฎรของผู้ถูกกล่าวหา</p>
      <p class="a5-indent2">๔. สำเนาหนังสือแจ้งสำนักงานตำรวจแห่งชาติ</p>
      <p>มายังท่าน เพื่อดำเนินการในส่วนที่เกี่ยวข้องต่อไป รายละเอียดปรากฏตามเอกสารที่แนบมาพร้อมนี้</p>
      <p class="a5-indent2">จึงเรียนมาเพื่อพิจารณา</p>
      <div class="a5-sign">${a5SignCol('', 'ผอ. กอท.', '')}</div>
      ${a5Foot()}

      ${A5_PG}
      ${/* ---- แบบ ปปท. ๒๐ ผนึกซองขอหมายจับ (หน้าซอง) ---- */ ''}
      <div class="a5-envelope">
        <p><b>เรื่อง</b> ขอหมายจับ</p>
        <p><b>เรียน</b> อธิบดีผู้พิพากษาศาล${A5_COURT} ${a5F('', 150)}</p>
        <p class="a5-env-gap">สำนัก/กอง ${a5F(intake.unit || '', 200)}</p>
        <p>สำนักงาน ป.ป.ท.</p>
        <p>คดีอาญา เลขดำ ป.ป.ท. ที่ ${a5F(c.id || '', 150)}/${a5F('', 90)}</p>
        <p>ข้อหา “ฐาน ${a5F(allegations, 480)}</p>
        <div class="a5-line">${a5F('', 560)}</div>
        <p>${a5F('', 300)}”</p>
        <p>จำนวน ๑ หมาย</p>
        <p>อายุความ ${a5F(i.prelim?.limitation?.longYears || '', 80)} ปี (วันขาดอายุความ วันที่ ${a5F(a5DateShort(i.prelim?.limitation?.longExpiry) || '', 190)})</p>
        <p class="a5-env-gap">นาย/นาง/นางสาว ${a5F(inv, 280)} ผู้ร้อง</p>
        <p>โทร. ${a5F('', 220)}</p>
      </div>
      <p class="a5-form-code">${escapeHtml(`${A5_FORMS.p11.code} – ${A5_FORMS.p20.code}`)}</p>
    </section>`;
  }

  /* ===== แบบตรวจสอบข้อเท็จจริง ม.๕๘/๒ – ๕๘/๓ (คงโครงสร้างเดิม ปรับหัวกระดาษ/ช่องกรอกให้ตรงแนวแบบพิมพ์) ===== */
  function paperSpecial58(state) {
    const c = state.caseData || {}, s = state.inquiry?.special || {};
    return `<section class="a5-paper">
      ${a5MemoHdr()}
      ${a5MemoMeta(s.agency || '', c.id, s.reportedAt || todayISO())}
      <div class="a5-line a5-memo-row"><b>เรื่อง</b> รายงานผลการตรวจสอบข้อเท็จจริง (มาตรา ๕๘/๒ – ๕๘/๓) เรื่องที่ ${a5F(c.id || '', 160)}</div>
      <div class="a5-line"><b>เรียน</b> เลขาธิการคณะกรรมการ ป.ป.ท.</div>
      <div class="a5-line"><b>เรื่องที่ร้องเรียน</b> ${a5F(state.documentData?.documentSubject || c.subject || '', 440)}</div>
      <div class="a5-line"><b>ผู้ตรวจสอบ</b> ${a5F(s.assignee || '', 220)} <b>หน่วยงานที่แจ้ง</b> ${a5F(s.agency || '', 220)}</div>
      <p class="a5-num-h a5-indent"><b>๑. ผลการตรวจสอบข้อเท็จจริง</b></p>
      <div class="a5-line a5-indent2">${a5F(s.result || '', 600)}</div>
      <div class="a5-line a5-indent2">${a5F('', 600)}</div>
      <p class="a5-num-h a5-indent"><b>๒. การแจ้งหน่วยงานแก้ไขและประกาศสาธารณะ</b></p>
      <p class="a5-indent2">หน่วยงานที่เกี่ยวข้องรับไปดำเนินการแก้ไขตามข้อเสนอแนะ ${a5F(s.note || '', 320)}</p>
      <div class="a5-cbline a5-indent2">${a5Cb(Boolean(s.publicNotice), 'ประกาศให้ประชาชนทราบแล้ว')} ${a5F(typeof s.publicNotice === 'string' ? s.publicNotice : '', 260)}</div>
      <p class="a5-num-h a5-indent"><b>๓. ข้อเสนอ</b></p>
      <p class="a5-indent2">จึงเรียนมาเพื่อโปรดพิจารณา</p>
      <div class="a5-sign">${a5SignCol(s.assignee || '', 'ผู้ตรวจสอบข้อเท็จจริง')}</div>
      <p class="a5-form-code">๕๘/๒-๕๘/๓</p>
    </section>`;
  }

  /* ---------- รายการสำนวน ---------- */
  const A5_MENU = Object.freeze({
    all: 'รายการสำนวนคดี',
    prelim: 'ไต่สวนเบื้องต้น (213)',
    inquiry: 'ไต่สวนชี้มูล (644)',
    review: 'รอความเห็นตามลำดับชั้น',
    committee: 'เรื่องเสนอ คกก.',
    ext: 'รออนุมัติขยายเวลา',
    due: 'ใกล้ครบกำหนด',
    fast: 'ใบด่วน/เร่งด่วน',
    m62: 'คดีรับจาก ป.ป.ช.',
    '582': 'ตรวจสอบข้อเท็จจริง 58/2'
  });
  function a5qFilter(c, a5q) {
    const i = c.inquiry || {}, w = c.workflow || {}, st = w.stage || '';
    const dl = currentDeadline(c), tone = dl ? deadlineTone(dl) : null;
    switch (a5q) {
      case 'prelim': return ['a5-prelim', 'a5-prelim-review', 'a7-213'].includes(st);
      case 'inquiry': return ['a5-inquiry', 'a5-inquiry-review', 'a7-644'].includes(st);
      case 'review': return ['a5-prelim-review', 'a5-inquiry-review'].includes(st);
      case 'committee': return ['a7-213', 'a7-644'].includes(st);
      case 'ext': {
        const p = i.prelim || {}, q = i.inquiry644 || {};
        return (p.extensionHistory || []).some(h => h.status === 'PENDING') || (q.extensionHistory || []).some(h => h.status === 'PENDING') || !!p.additionalExtensionPending || !!q.additionalExtensionPending;
      }
      case 'due': return !!tone && tone.tone !== 'ok';
      case 'fast': return !!(i.prelim?.fastTrack || i.inquiry644?.fastTrack);
      case 'm62': return !!(i.intake?.m62?.flag);
      case '582': return c.caseData?.decision === '58/2';
      case 'all':
      default: return true;
    }
  }
  function allA5Cases() {
    const store = readStore();
    let changed = false;
    Object.values(store).forEach(s => { if (normalizeIncomingCase(s)) changed = true; });
    if (changed) writeStore(store);
    return Object.values(store).filter(s => {
      const stage = s.workflow?.stage || '';
      return stage.startsWith('a5-') || stage === 'closed' || (stage === 'activity5-dispatch' && s.workflow?.complete) || s.caseData?.decision === '58/2' || s.caseData?.decision === '62';
    }).sort((a, b) => String(b.caseData?.id || '').localeCompare(String(a.caseData?.id || '')));
  }
  function phaseLabel(state) {
    const stage = state.workflow?.stage || '';
    const i = state.inquiry;
    if (stage === 'closed') return 'ปิดสำนวน';
    if (stage === 'a5-intake') return i?.intake?.transfer?.status === 'PENDING' ? 'รอปลายทางรับโอน' : 'รอรับสำนวน/มอบหมาย';
    if (stage === 'a5-prelim') return `ไต่สวนเบื้องต้น (213) — ${i?.prelim?.status || ''}`;
    if (stage === 'a5-prelim-review') return 'เสนอ 213 ตามลำดับชั้น';
    if (stage === 'a7-213') return `คกก. พิจารณา 213 — ${i?.committee213?.result || 'รอมติ'}`;
    if (stage === 'a5-inquiry') return `ไต่สวนชี้มูล (644) — ${i?.inquiry644?.status || ''}`;
    if (stage === 'a5-inquiry-review') return 'เสนอ 644 ตามลำดับชั้น';
    if (stage === 'a7-644') return `คกก. พิจารณา 644 — ${i?.committee644?.result || 'รอมติ'}`;
    if (stage === 'a5-outcome') return `ดำเนินการตามมติ — ${i?.outcome?.type || ''}`;
    if (stage === 'a5-prosecutor') return `อัยการสั่งการ — ${i?.prosecutor?.orderType || 'รอคำสั่ง'}`;
    if (stage === 'activity5-dispatch') return 'ส่งถึงเขตผู้รับผิดชอบแล้ว';
    if (state.caseData?.decision === '58/2') return 'ตรวจสอบข้อเท็จจริง (58/2)';
    if (state.caseData?.decision === '62') return `คดี ม.62 (ป.ป.ช.) — ${state.workflow?.status || ''}`;
    return state.workflow?.status || stage;
  }
  function processStatusLabelA5(status) {
    const labels = {
      PENDING_INTAKE_CHECK: 'รอตรวจรับสำนวน',
      PENDING_DIRECTOR_ASSIGNMENT: 'รอ ผอ.เขตมอบหมายสำนวน',
      INTAKE_CHECKED: 'ตรวจรับสำนวนแล้ว',
      ASSIGNMENT_PROPOSED: 'รออนุมัติมอบหมาย',
      ASSIGNMENT_APPROVED: 'อนุมัติมอบหมายแล้ว',
      OFFICER_ACCEPTED: 'ผู้รับผิดชอบรับมอบแล้ว',
      CLERK_ACKNOWLEDGED: 'ธุรการรับทราบแล้ว',
      PLAN_DRAFT: 'รอจัดทำแผนคดี',
      PLAN_SUBMITTED: 'รอตรวจแผนคดี',
      PLAN_RETURNED: 'ส่งกลับแก้ไขแผนคดี',
      PLAN_APPROVED: 'อนุมัติแผนคดีแล้ว',
      AMENDMENT_DRAFT: 'กำลังแก้ไขแผนคดี',
      AMENDMENT_SUBMITTED: 'รอตรวจแผนคดีฉบับแก้ไข',
      AMENDMENT_RETURNED: 'ส่งกลับแก้ไขแผนคดีอีกครั้ง',
      AMENDMENT_APPROVED: 'อนุมัติแผนคดีฉบับแก้ไขแล้ว',
      LEGACY_ACTIVE: 'อยู่ระหว่างดำเนินการ'
    };
    return labels[status] || '';
  }
  function displayStatusA5(state) {
    const downstreamLabels = {
      REPORT_213_DRAFT: 'จัดทำรายงาน 213', REPORT_213_REVIEW_PENDING: 'รอตรวจรายงาน 213', REPORT_213_RETURNED: 'รายงาน 213 ส่งกลับแก้ไข', REPORT_213_BOARD_READY: 'รายงาน 213 พร้อมส่งพิจารณา', REPORT_213_SENT_TO_A7: 'ส่งรายงาน 213 แล้ว', REPORT_213_WAIT_RESULT: 'รอผลพิจารณา 213', REPORT_213_RESULT_RECEIVED: 'รับผลพิจารณา 213 แล้ว',
      REPORT_644_DRAFT: 'จัดทำรายงาน 644', REPORT_644_REVIEW_PENDING: 'รอตรวจรายงาน 644', REPORT_644_RETURNED: 'รายงาน 644 ส่งกลับแก้ไข', REPORT_644_BOARD_READY: 'รายงาน 644 พร้อมส่งพิจารณา', REPORT_644_SENT_TO_A7: 'ส่งรายงาน 644 แล้ว', REPORT_644_WAIT_RESULT: 'รอผลพิจารณา 644', REPORT_644_RESULT_RECEIVED: 'รับผลพิจารณา 644 แล้ว',
      OUTCOME_TASKS_PENDING: 'รอดำเนินการตามมติ', OUTCOME_TASKS_IN_PROGRESS: 'กำลังดำเนินการตามมติ', PROSECUTOR_PACKAGE_PREPARING: 'เตรียมชุดสำนวนส่งอัยการ', PROSECUTOR_PACKAGE_READY: 'ชุดสำนวนพร้อมส่งอัยการ', PROSECUTOR_RECEIPT_PENDING: 'รอหลักฐานอัยการรับสำนวน', PROSECUTOR_ORDER_PENDING: 'รอคำสั่งอัยการ', PROSECUTOR_ORDER_RECEIVED: 'รับคำสั่งอัยการแล้ว', PROSECUTOR_EXECUTING: 'กำลังดำเนินการตามคำสั่งอัยการ', PROSECUTOR_RESULT_READY: 'ผลดำเนินการพร้อมส่ง', PROSECUTOR_RESULT_SENT: 'ส่งผลดำเนินการแล้ว', PROSECUTOR_RESULT_RECEIVED: 'ปลายทางรับผลแล้ว', CLOSURE_REVIEW: 'รอตรวจอนุมัติปิดสำนวน', CLOSED: 'ปิดสำนวน'
    };
    if (downstreamLabels[state.workflow?.downstreamStatus]) return downstreamLabels[state.workflow.downstreamStatus];
    const processLabel = processStatusLabelA5(state.workflow?.a5Status);
    if (processLabel) return processLabel;
    const status = String(state.workflow?.status || '').trim();
    if (status && !/^[A-Z][A-Z0-9_]+$/.test(status)) return status;
    return phaseLabel(state) || 'อยู่ระหว่างดำเนินการ';
  }
  function currentDeadline(state) {
    const i = state.inquiry;
    if (i?.prelim?.additionalDeadlineAt && ['a5-prelim', 'a5-prelim-review'].includes(state.workflow?.stage)) return i.prelim.additionalDeadlineAt;
    if (i?.inquiry644?.additionalDeadlineAt && ['a5-inquiry', 'a5-inquiry-review'].includes(state.workflow?.stage)) return i.inquiry644.additionalDeadlineAt;
    if (i?.prelim?.deadlineAt && ['a5-prelim', 'a5-prelim-review'].includes(state.workflow?.stage)) return i.prelim.deadlineAt;
    if (i?.inquiry644?.deadlineAt && ['a5-inquiry', 'a5-inquiry-review'].includes(state.workflow?.stage)) return i.inquiry644.deadlineAt;
    return '';
  }
  function currentTaskContextA5(state, activeRole) {
    const stage = state.workflow?.stage || '';
    const processState = state.workflow?.a5Status || '';
    const inquiry = state.inquiry || {};
    const reportType = reportTypeForStage(stage);
    const report = reportOf(reportType, inquiry);
    const pending = ['a5-prelim', 'a5-inquiry'].includes(stage) ? pendingExtension(reportType, inquiry) : null;
    const investigator = inquiry.inquiry644?.investigator || inquiry.intake?.investigator || '';
    const ownerRole = state.workflow?.owner;
    let task = state.workflow?.status || phaseLabel(state);
    let holder = investigator || ROLE_LABELS[ownerRole] || ownerRole || 'ยังไม่ระบุ';
    let nextRecipient = 'รอระบุผู้รับช่วงงาน';
    let blocker = '';

    if (stage === 'a5-intake') {
      const intakeTasks = {
        PENDING_INTAKE_CHECK: ['รับสำนวน 1/4 · ตรวจรับและยืนยันวันรับ', 'clerk', 'ผอ.เขตพิจารณามอบหมาย'],
        PENDING_DIRECTOR_ASSIGNMENT: ['พิจารณาและมอบหมายสำนวน', 'director', 'ผู้รับผิดชอบหลัก'],
        ASSIGNMENT_APPROVED: ['รับสำนวน 3/4 · รับมอบและลงนามรับสำนวน', 'investigator', 'ผู้รับผิดชอบหลักเริ่มจัดทำแผน'],
        OFFICER_ACCEPTED: ['รับสำนวน 4/4 · เริ่มจัดทำแผนคดี', 'investigator', 'ผอ.เขต ตรวจแผน']
      };
      const intakeTask = intakeTasks[processState];
      task = inquiry.intake?.transfer?.status === 'PENDING' ? 'รอสำนักงานปลายทางรับหรือปฏิเสธการโอน' : (intakeTask?.[0] || 'ตรวจรับสำนวน');
      const taskRole = intakeTask?.[1] || 'clerk';
      holder = taskRole === 'investigator' ? (state.assignment?.approvedOfficer || investigator || ROLE_LABELS.investigator) : ROLE_LABELS[taskRole];
      nextRecipient = intakeTask?.[2] || 'รอระบุผู้รับช่วงงาน';
      if (activeRole !== taskRole) blocker = `สิทธิ์ปัจจุบันเป็นผู้ดูข้อมูล — ผู้ดำเนินการคือ ${holder}`;
    } else if (['PLAN_DRAFT', 'PLAN_RETURNED', 'PLAN_SUBMITTED', 'AMENDMENT_DRAFT', 'AMENDMENT_RETURNED', 'AMENDMENT_SUBMITTED'].includes(processState)) {
      const isReview = ['PLAN_SUBMITTED', 'AMENDMENT_SUBMITTED'].includes(processState);
      task = processState.startsWith('AMENDMENT_') ? (isReview ? 'ตรวจแผนคดีฉบับแก้ไข' : 'จัดทำแผนคดีฉบับแก้ไข') : (isReview ? 'ตรวจและอนุมัติแผนคดี' : 'จัดทำแผนคดี');
      holder = isReview ? ROLE_LABELS.director : (state.assignment?.approvedOfficer || investigator || ROLE_LABELS.investigator);
      nextRecipient = isReview ? (state.assignment?.approvedOfficer || ROLE_LABELS.investigator) : ROLE_LABELS.director;
      const taskRole = isReview ? 'director' : 'investigator';
      if (activeRole !== taskRole) blocker = `สิทธิ์ปัจจุบันเป็นผู้ดูข้อมูล — ผู้ดำเนินการคือ ${holder}`;
    } else if (pending) {
      task = `พิจารณาคำขอขยาย ${reportType} ครั้งที่ ${pending.round}`;
      holder = ROLE_LABELS[pending.role] || pending.role;
      nextRecipient = investigator || ROLE_LABELS.investigator;
      if (activeRole !== pending.role) blocker = `สิทธิ์ปัจจุบันเป็นผู้ดูข้อมูล — ผู้พิจารณาคือ ${holder}`;
    } else if (['a5-prelim', 'a5-inquiry'].includes(stage)) {
      task = stage === 'a5-prelim' ? 'จัดทำแผน งานไต่สวน และรายงาน 213' : 'ดำเนินการไต่สวน แจ้งข้อกล่าวหา และจัดทำรายงาน 644';
      holder = investigator || ROLE_LABELS.investigator;
      nextRecipient = ROLE_LABELS['group-director'];
      if (report?.lateReport) blocker = 'ส่งรายงานเหตุล่าช้าแล้ว — รอคณะกรรมการกำหนดแนวทาง';
    } else if (['a5-prelim-review', 'a5-inquiry-review'].includes(stage)) {
      const chain = chainState(reportType, inquiry);
      task = `ตรวจรายงาน ${reportType} ตามลำดับชั้น`;
      holder = chain.current ? chain.current.label : ROLE_LABELS.committee;
      nextRecipient = chain.current ? (chain.steps.find(step => step.level > chain.current.level)?.label || ROLE_LABELS.committee) : ROLE_LABELS.committee;
      if (chain.current?.role !== activeRole) blocker = `รอ ${holder} ตรวจรายงาน`;
    } else if (stage === 'a7-213' || stage === 'a7-644') {
      task = report?.lateReport ? `พิจารณารายงานเหตุล่าช้า ${reportType}` : `พิจารณารายงานและบันทึกมติ ${reportType}`;
      holder = ROLE_LABELS.committee;
      nextRecipient = report?.lateReport ? 'ยืนยันไม่ได้ — รอแนวทางจากคณะกรรมการ' : (investigator || ROLE_LABELS.investigator);
      if (report?.lateReport) blocker = reportType === '644' ? 'ยังไม่ยืนยันขั้นตอนพิเศษ/ครั้งที่ 5 จำนวนวัน และผู้มีอำนาจ' : 'ยังไม่ยืนยันกลไกหลังคณะกรรมการรับรายงานเหตุล่าช้า';
    } else if (stage === 'a5-outcome') {
      task = 'จัดทำหนังสือและดำเนินการตามมติ';
      nextRecipient = inquiry.outcome?.type?.includes('อาญา') ? 'พนักงานอัยการตามหนังสือนำส่ง' : 'หน่วยงานตามผลมติ';
    } else if (stage === 'a5-prosecutor') {
      task = 'บันทึกและดำเนินการตามคำสั่งอัยการ';
      nextRecipient = 'พนักงานอัยการ และรายงานคณะกรรมการตามกรณี';
      blocker = 'initial contract ระหว่าง Activity 5/7 กับอัยการหรือกิจกรรมที่ 10 ยังยืนยันไม่ได้';
    } else if (stage === 'closed') {
      task = 'สำนวนเสร็จสิ้น';
      nextRecipient = 'ไม่มี';
    }
    return { task, holder, nextRecipient, blocker };
  }
  function a5RuleBadge(ruleId) {
    const rule = globalThis.ECMISActivity5Rules?.getA5Rule(ruleId);
    if (!rule) return '';
    return `<span class="a5-rule-badge ${rule.status === 'PENDING_CONFIRMATION' ? 'pending' : 'confirmed'}">${rule.status === 'PENDING_CONFIRMATION' ? 'รอยืนยันกติกากระบวนงาน' : 'กติกายืนยันแล้ว'}</span>`;
  }
  function receivedDateTaskFormA5(state, role) {
    const status = state.workflow?.a5Status;
    const received = state.intake?.receivedDate || {};
    if (status !== 'PENDING_INTAKE_CHECK') {
      if (!received.recordedAt && !received.effectiveDate) return '';
      return `<section class="ws-section a5-received-date-summary"><h3>วันรับและวันเริ่มนับ</h3><dl class="ws-readonly"><div><dt>ช่องทาง</dt><dd>${escapeHtml(received.channel || state.caseData?.channel || '')}</dd></div><div><dt>วันที่ระบบต้นทางบันทึก</dt><dd>${escapeHtml(received.recordedAt || '')}</dd></div><div><dt>วันที่มีผลใน Mock up</dt><dd>${escapeHtml(received.effectiveDate || '')} ${received.outsideHoursOrHoliday ? a5RuleBadge('received-date-outside-office-hours') : a5RuleBadge('received-date-recorded-channel')}</dd></div></dl></section>`;
    }
    if (role !== 'clerk') return '<p class="ws-policy-note">รอธุรการคดีตรวจรับและยืนยันวันรับ</p>';
    return `<section class="ws-section a5-received-date-form"><h3>ตรวจรับสำนวน: วันรับและวันเริ่มนับ</h3><div class="ws-grid-2"><div class="ws-field"><label>ช่องทาง/ต้นทาง</label><input id="a5ReceivedChannel" value="${escapeHtml(received.channel || state.caseData?.channel || '')}" required></div><div class="ws-field"><label>วันที่ระบบต้นทางบันทึก</label><input id="a5ReceivedRecordedAt" type="date" value="${escapeHtml(received.recordedAt || '')}" required></div><div class="ws-field"><label>วันที่เริ่มนับระยะเวลา</label><input id="a5ReceivedEffectiveDate" type="date" value="${escapeHtml(received.effectiveDate || '')}" required><small>ระบบจะไม่คำนวณวันทำการแทนจนกว่าจะยืนยันกติกา</small></div><div class="ws-field"><label>ผลตรวจเขตอำนาจ</label><select id="a5ReviewJurisdiction"><option value="">เลือกผลตรวจ</option><option value="IN_SCOPE">อยู่ในเขตอำนาจ</option><option value="OUT_OF_SCOPE">อยู่นอกเขตอำนาจ</option></select></div><div class="ws-field"><label>ประเภทเรื่อง</label><select id="a5ReviewComplaintType"><option value="">เลือกประเภท</option><option value="CORRUPTION">ทุจริตในภาครัฐ</option><option value="OTHER">อื่น ๆ</option></select></div><div class="ws-field"><label>ความครบถ้วน</label><select id="a5ReviewCompleteness"><option value="">เลือกผลตรวจ</option><option value="COMPLETE">ครบถ้วน</option><option value="INCOMPLETE">ต้องติดตามเพิ่ม</option></select></div><label class="ws-choice"><input id="a5ReceivedPendingRule" type="checkbox" ${received.outsideHoursOrHoliday ? 'checked' : ''}><span><strong>รับนอกเวลาราชการหรือวันหยุด</strong><small>${a5RuleBadge('received-date-outside-office-hours')}</small></span></label><label class="ws-choice"><input id="a5HasOriginal" type="checkbox" ${state.custody?.hasOriginal ? 'checked' : ''}><span><strong>มีต้นฉบับกระดาษ</strong></span></label><div class="ws-field"><label>ผู้ถือต้นฉบับปัจจุบัน</label><input id="a5CustodyHolder" value="${escapeHtml(state.custody?.holder || '')}"></div><div class="ws-field ws-field-full"><label>ข้อสังเกตและความเห็นเสนอ ผอ.เขต</label><textarea id="a5ClerkOpinion" required>${escapeHtml(state.intakeReview?.clerkOpinion || '')}</textarea></div></div></section>`;
  }
  function assignmentTaskFormA5(state, role) {
    const status = state.workflow?.a5Status;
    const assignment = state.assignment || {};
    if (status === 'PENDING_DIRECTOR_ASSIGNMENT' && role === 'director') {
      const caseProfile = { difficulty: Number(state.caseData?.difficulty || 3), requiredExperienceTags: ['จัดซื้อจัดจ้าง', 'การเงิน'], completeness: state.intakeReview?.completenessResult === 'COMPLETE' ? 100 : 60, unit: state.caseData?.region || state.inquiry?.intake?.unit || 'เขต 2' };
      const mockProfiles = MOCK_INVESTIGATOR_PROFILES.map((profile, index) => ({ ...profile, unit: index === MOCK_INVESTIGATOR_PROFILES.length - 1 ? `${caseProfile.unit}-นอกขอบเขต` : caseProfile.unit }));
      const recommendation = globalThis.ECMISActivity5AssignmentRecommendation?.recommendInvestigators(caseProfile, mockProfiles, { generatedAt: state.intakeReview?.reviewedAt || 'mock-snapshot' });
      const savedSelection = A5_ASSIGNMENT_SELECTIONS.get(String(state.caseData?.id || '')) || { primaryOfficerId: '', assistantOfficerIds: [] };
      const candidates = recommendation?.candidates || [];
      const savedFocusId = A5_ASSIGNMENT_FOCUS.get(String(state.caseData?.id || ''));
      const focusedOfficerId = candidates.some(candidate => candidate.officerId === savedFocusId) ? savedFocusId : candidates[0]?.officerId;
      const rows = candidates.map((candidate, index) => {
        const primaryChecked = savedSelection.primaryOfficerId === candidate.officerId ? ' checked' : '';
        const assistantChecked = savedSelection.assistantOfficerIds.includes(candidate.officerId) ? ' checked' : '';
        const selectedRole = primaryChecked ? 'primary' : assistantChecked ? 'assistant' : 'none';
        const isFocused = candidate.officerId === focusedOfficerId;
        return `<article class="a5-master-row${isFocused ? ' is-focused' : ''}" data-a5-candidate-row="${escapeHtml(candidate.officerId)}"><button type="button" class="a5-master-focus" data-a5-candidate-focus="${escapeHtml(candidate.officerId)}" aria-controls="a5CandidateDetail-${index}" aria-pressed="${String(isFocused)}"><span class="a5-master-rank"><small>อันดับ</small><strong>${index + 1}</strong></span><span class="a5-master-identity"><span><strong>${escapeHtml(candidate.officerName)}</strong>${index === 0 ? '<em class="a5-recommended-pill">แนะนำ</em>' : ''}</span><small>ภาระงาน ${candidate.breakdown.workload}/100 · เหมาะสม ${candidate.breakdown.difficultyFit}/100</small></span><span class="a5-master-score"><strong>${candidate.totalScore}</strong><small>/100</small></span></button><div class="a5-role-segment" role="group" aria-label="กำหนดบทบาท ${escapeHtml(candidate.officerName)}"><input class="a5-assignment-native-input" type="radio" name="a5PrimaryOfficer" value="${escapeHtml(candidate.officerId)}" data-officer-name="${escapeHtml(candidate.officerName)}"${primaryChecked}><input class="a5-assignment-native-input" type="checkbox" name="a5AssistantOfficer" value="${escapeHtml(candidate.officerId)}" data-officer-name="${escapeHtml(candidate.officerName)}"${assistantChecked}><button type="button" data-a5-role-choice="primary" data-officer-id="${escapeHtml(candidate.officerId)}" aria-pressed="${String(selectedRole === 'primary')}">หลัก</button><button type="button" data-a5-role-choice="assistant" data-officer-id="${escapeHtml(candidate.officerId)}" aria-pressed="${String(selectedRole === 'assistant')}">ผู้ช่วย</button><button type="button" data-a5-role-choice="none" data-officer-id="${escapeHtml(candidate.officerId)}" aria-pressed="${String(selectedRole === 'none')}">—</button></div></article>`;
      }).join('');
      const candidateDetails = candidates.map((candidate, index) => `<section id="a5CandidateDetail-${index}" class="a5-candidate-detail" data-a5-candidate-detail="${escapeHtml(candidate.officerId)}"${candidate.officerId === focusedOfficerId ? '' : ' hidden'}><header><div><span>ผู้สมัครที่กำลังพิจารณา</span><h4>${escapeHtml(candidate.officerName)}</h4></div><strong>${candidate.totalScore}/100</strong></header><dl><div><dt>ความพร้อมด้านภาระงาน</dt><dd>${candidate.breakdown.workload}/100</dd></div><div><dt>เหมาะสมกับความยาก</dt><dd>${candidate.breakdown.difficultyFit}/100</dd></div><div><dt>ประสบการณ์ที่เกี่ยวข้อง</dt><dd>${candidate.breakdown.relevantExperience}/100</dd></div><div><dt>ความครบถ้วนข้อมูล</dt><dd>${candidate.breakdown.dataCompleteness}/100</dd></div></dl><ul>${candidate.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>${candidate.missingFields.length ? `<p class="a5-warning">ข้อมูลไม่ครบ: ${escapeHtml(candidate.missingFields.join(', '))}</p>` : ''}</section>`).join('');
      return `<section class="ws-section a5-assignment-board"><div class="a5-assignment-heading"><div><h3>ระบบแนะนำเพื่อประกอบการมอบหมาย</h3><p>Mock deterministic v1 · เป็นคำแนะนำ ไม่มอบหมายอัตโนมัติ</p></div><span class="ws-status">ข้อมูลจำลอง</span></div><div class="a5-clerk-opinion"><strong>ความเห็นธุรการ</strong><p>${escapeHtml(state.intakeReview?.clerkOpinion || 'ไม่ระบุ')}</p></div><details class="a5-score-method"><summary>วิธีคำนวณและข้อจำกัดของคะแนน</summary><p>คะแนนรวมถ่วงน้ำหนักจากภาระงาน 40% ความเหมาะสมกับความยาก 25% ประสบการณ์ที่เกี่ยวข้อง 25% และความครบถ้วนข้อมูล 10% ข้อมูลที่ไม่มีให้ 0 คะแนนในองค์ประกอบนั้น ผลลัพธ์เป็นข้อมูลจำลองเพื่อช่วยตัดสินใจเท่านั้น</p></details><div class="a5-master-detail-shell"><div class="a5-master-list" aria-label="รายชื่อผู้ได้รับคำแนะนำ">${rows || '<p class="ws-callout">ไม่มีผู้มีสิทธิ์และพร้อมรับงานในหน่วยงานนี้</p>'}</div><div class="a5-candidate-detail-host">${candidateDetails}</div></div><div class="ws-field a5-assignment-reason"><label for="a5AssignmentDecisionNote">เหตุผลการมอบหมาย/เหตุผลเลือกนอกอันดับหนึ่ง</label><textarea id="a5AssignmentDecisionNote"></textarea></div><div class="a5-selected-team a5-assignment-command" aria-live="polite"><strong>ทีมที่เลือก:</strong><p id="a5SelectedTeamSummary">ยังไม่ได้เลือกผู้รับผิดชอบหลัก</p></div><input type="hidden" id="a5RecommendationSnapshot" value="${escapeHtml(JSON.stringify(recommendation || {}))}"></section>`;
    }
    if (['ASSIGNMENT_APPROVED', 'OFFICER_ACCEPTED'].includes(status)) {
      const account = currentA5Account();
      const canAccept = status === 'ASSIGNMENT_APPROVED' && role === 'investigator' && account?.officerId === assignment.primaryOfficerId;
      const acceptance = canAccept ? '<div class="ws-field"><label>ลงนามอิเล็กทรอนิกส์ (Mock up)</label><input id="a5AcceptanceSignature" value="SIGNED" readonly></div>' : status === 'ASSIGNMENT_APPROVED' && role === 'investigator' ? '<p class="a5-blocked-reason">บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลัก จึงรับมอบแทนไม่ได้</p>' : '';
      return `<section class="ws-section"><h3>คำสั่งมอบหมายและทีม</h3><dl class="ws-readonly"><div><dt>ผู้รับผิดชอบหลัก</dt><dd>${escapeHtml(assignment.primaryOfficerId || assignment.legalOwner || '')}</dd></div><div><dt>ผู้ช่วยผู้รับผิดชอบ</dt><dd>${escapeHtml((assignment.assistantOfficerIds || assignment.teamMembers || []).join(', ') || 'ไม่มี')}</dd></div><div><dt>เหตุผล</dt><dd>${escapeHtml(assignment.decisionNote || 'ไม่ระบุ')}</dd></div><div><dt>เวอร์ชันคำสั่ง</dt><dd>${Number(assignment.assignmentVersion || 0)}</dd></div><div><dt>ผู้รับมอบ</dt><dd>${escapeHtml(assignment.acceptedBy || 'ยังไม่รับมอบ')}</dd></div></dl>${acceptance}</section>`;
    }
    return '';
  }
  function custodyTaskFormA5(state, role) {
    const custody = state.custody || {};
    if (!custody.hasOriginal || role !== 'clerk') return '';
    if (custody.status === 'AT_SOURCE') return `<section class="ws-section a5-custody-form"><h3>ส่งต้นฉบับ/EMS</h3><div class="ws-grid-2"><div class="ws-field"><label>ปลายทาง</label><input id="a5CustodyDestination"></div><div class="ws-field"><label>เลขหนังสือ</label><input id="a5CustodyLetterNo"></div><div class="ws-field"><label>เลข EMS</label><input id="a5CustodyEms"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5CustodyDispatchedAt" type="date"></div></div></section>`;
    if (custody.status === 'IN_TRANSIT') return `<section class="ws-section a5-custody-form"><h3>ต้นฉบับอยู่ระหว่างขนส่ง</h3><p>EMS ${escapeHtml(custody.emsNumber || '')} → ${escapeHtml(custody.destination || '')}</p><div class="ws-grid-2"><div class="ws-field"><label>วันที่รับ</label><input id="a5CustodyReceivedAt" type="date"></div><div class="ws-field"><label>ผู้รับ/ผู้ถือเอกสาร</label><input id="a5CustodyReceivedHolder"></div></div></section>`;
    if (custody.status === 'RECEIVED_AT_DESTINATION') return `<section class="ws-section a5-custody-form"><h3>ต้นฉบับถึงปลายทางแล้ว</h3><p>ผู้ถือเอกสาร: ${escapeHtml(custody.holder || '')}</p><div class="ws-grid-2"><div class="ws-field"><label>วันที่ส่งคืน</label><input id="a5CustodyReturnedAt" type="date"></div><div class="ws-field"><label>เหตุผลส่งคืน</label><input id="a5CustodyReturnReason"></div><div class="ws-field"><label>ผู้รับ/ผู้ถือต้นฉบับหลังส่งคืน</label><input id="a5CustodyReturnHolder"></div></div></section>`;
    return `<p class="ws-policy-note">สถานะต้นฉบับ: ${escapeHtml(custody.status || '')}</p>`;
  }
  function planLifecycleTaskFormA5(state, role) {
    const plan = state.planLifecycle || {};
    const status = state.workflow?.a5Status || '';
    if (!status.includes('PLAN') && !status.includes('AMENDMENT')) return '';
    const due = plan.dueAt ? `<p class="ws-deadline muted">กำหนดจัดทำแผน +2 วัน: ${escapeHtml(plan.dueAt)} ${a5RuleBadge('plan-deadline-day-kind')}</p>` : '';
    const returned = plan.returnReason || plan.amendment?.returnReason;
    let fields = '';
    if (['PLAN_SUBMITTED', 'AMENDMENT_SUBMITTED'].includes(status) && role === 'director') fields = '<div class="ws-field"><label>เหตุผลส่งกลับ</label><input id="a5PlanReturnReason"></div><p class="a5-blocked-reason">รอยืนยันผู้มีอำนาจอนุมัติและลงนามแผนคดี จึงยังไม่เปิดคำสั่งอนุมัติ</p>';
    if (['PLAN_APPROVED', 'AMENDMENT_APPROVED'].includes(status) && role === 'investigator') fields = `<div class="ws-grid-2"><div class="ws-field"><label>เหตุผลแก้ไขแผน</label><input id="a5PlanAmendReason"></div><div class="ws-field"><label>สมาชิกทีมหลังแก้ไข</label><input id="a5PlanAmendTeam" value="${escapeHtml((state.inquiry?.intake?.team || []).join(', '))}"></div></div>`;
    return `<section class="ws-section a5-plan-lifecycle"><h3>วงจรแผนคดี</h3>${due}<p>สถานะ: <strong>${escapeHtml(processStatusLabelA5(status) || 'อยู่ระหว่างดำเนินการ')}</strong> · ฉบับที่ ${Number(plan.version || 0)}</p>${returned ? `<p class="a5-blocked-reason">เหตุผลส่งกลับ: ${escapeHtml(returned)}</p>` : ''}${fields}</section>`;
  }
  function workflowTaskFormsA5(state, role) {
    return `${receivedDateTaskFormA5(state, role)}${assignmentTaskFormA5(state, role)}${custodyTaskFormA5(state, role)}${planLifecycleTaskFormA5(state, role)}`;
  }
  function workflowActorNameA5(state, role) {
    if (role !== 'investigator') return ROLE_LABELS[role] || role;
    return currentA5Account()?.name || '';
  }
  function documentChecklistA5(state) {
    const edits = state.inquiry?.docEdits || {};
    return documentTabItemsA5(state).map(([key, label]) => {
      const saved = Object.keys(edits).some(editKey => editKey.startsWith(`${key}:field:`) || editKey.startsWith(`html-${key}-`));
      return `<li><span>${escapeHtml(label)}</span><strong class="${saved ? 'saved' : ''}">${saved ? 'มีฉบับแก้ไขที่บันทึกแล้ว' : 'แสดงจากข้อมูลสำนวน'}</strong></li>`;
    }).join('');
  }
  function currentTaskPanelA5(state, role) {
    const context = currentTaskContextA5(state, role);
    const deadline = currentDeadline(state);
    const tone = deadline ? deadlineTone(deadline) : null;
    const history = (state.decisionHistory || []).slice(-4).reverse();
    const viewModel = globalThis.ECMISActivity5Workflow?.buildA5ViewModel(state, role, 'current-task');
    const primary = viewModel?.primaryAction;
    const deadlineAlert = globalThis.ECMISActivity5Workflow?.getA5DeadlineAlert(state);
    return `<section class="ws-card a5-current-task" aria-labelledby="a5CurrentTaskTitle"><header><div><p class="ws-kicker">งานปัจจุบัน</p><h2 id="a5CurrentTaskTitle" tabindex="-1">${escapeHtml(context.task)}</h2></div>${deadlineAlert ? `<span class="ws-deadline ${deadlineAlert.level}">วันที่ ${deadlineAlert.elapsedDays} · ${escapeHtml(deadlineAlert.label)}</span>` : tone ? `<span class="ws-deadline ${tone.tone}">${escapeHtml(tone.label)}</span>` : '<span class="ws-deadline muted">ไม่มีกำหนดเวลาใน stage นี้</span>'}</header><div class="a5-current-task-grid"><dl><div><dt>ผู้ถือเรื่อง</dt><dd>${escapeHtml(context.holder)}</dd></div><div><dt>ผู้รับต่อ</dt><dd>${escapeHtml(context.nextRecipient)}</dd></div><div><dt>สถานะ</dt><dd>${escapeHtml(state.workflow?.a5Status || state.workflow?.status || phaseLabel(state))}</dd></div></dl><div><h3>เอกสารที่เปิดใช้ในขั้นนี้</h3><ul class="a5-doc-checklist">${documentChecklistA5(state)}</ul></div><div><h3>ความเคลื่อนไหวล่าสุด</h3><ol class="a5-compact-timeline">${history.map(item => `<li><span>${escapeHtml(item.text)}</span><time>${escapeHtml(item.time || '')}</time></li>`).join('') || '<li><span>ยังไม่มีประวัติ</span></li>'}</ol></div></div><div class="a5-primary-action-descriptor"><span>การดำเนินการหลักตาม workflow</span><strong>${escapeHtml(primary?.label || 'ใช้คำสั่งของขั้นตอนปัจจุบันด้านล่าง')}</strong></div>${context.blocker ? `<p class="a5-blocked-reason"><strong>เหตุที่ดำเนินการต่อไม่ได้:</strong> ${escapeHtml(context.blocker)}</p>` : ''}</section>`;
  }
  function xlBadgeA5(ca, compact = false) {
    const size = ca?.caseSize, req = ca?.xlRequest || {};
    const cls = size === 'XL' ? 'xl-done' : req.status === 'PENDING_BOARD' ? 'xl-board' : req.status === 'PENDING' ? 'xl-pending' : '';
    if (!cls) return '';
    const label = size === 'XL' ? 'คดีใหญ่พิเศษ (XL)' : req.status === 'PENDING_BOARD' ? 'XL · รอมติบอร์ด' : 'XL · รออนุมัติ';
    const hint = size === 'XL' ? 'ผ่านการอนุมัติสาย XL และมติบอร์ดแล้ว' : req.status === 'PENDING_BOARD' ? 'สาย XL ภายในอนุมัติครบ — รอคณะกรรมการ ป.ป.ท. ยืนยัน' : 'อยู่ระหว่างขออนุมัติขนาดคดี XL';
    return `<span class="a5-xl-badge ${cls}" title="${escapeHtml(hint)}">${compact ? 'XL' : escapeHtml(label)}</span>`;
  }

  function renderA5List(activeRole, filters) {
    const root = $('#a5App');
    if (!root) return;
    const cases = allA5Cases();
    const q = (filters?.q || '').toLowerCase(), region = filters?.region || '', phase = filters?.phase || '', investigator = filters?.investigator || '', a5q = filters?.a5q || '';
    const rows = cases.filter(c => {
      const i = c.inquiry || {};
      const searchable = [c.caseData?.id, c.caseData?.subject, c.caseData?.agency, c.caseData?.complainant, i?.intake?.investigator, i?.inquiry644?.investigator].join(' ').toLowerCase();
      return (!q || searchable.includes(q)) && (!region || (i?.intake?.unit || c.caseData?.region) === region) &&
        (!phase || phaseLabel(c) === phase) && (!investigator || (i?.intake?.investigator || i?.inquiry644?.investigator || '') === investigator) &&
        (!a5q || a5qFilter(c, a5q));
    });
    const total = cases.length, pending = cases.filter(c => ['a5-intake'].includes(c.workflow?.stage)).length,
      working = cases.filter(c => ['a5-prelim', 'a5-prelim-review', 'a5-inquiry', 'a5-inquiry-review', 'a7-213', 'a7-644'].includes(c.workflow?.stage)).length,
      done = cases.filter(c => c.workflow?.stage === 'closed' || c.caseData?.decision === '58/2').length;
    $('#a5DashboardTotal').textContent = total; $('#a5DashboardPending').textContent = pending; $('#a5DashboardWorking').textContent = working; $('#a5DashboardDone').textContent = done;
    const investigatorOptions = INVESTIGATORS.map(x => `<option ${investigator === x ? 'selected' : ''}>${x}</option>`).join('');
    const phaseOptions = [...new Set(cases.map(phaseLabel))].map(x => `<option ${phase === x ? 'selected' : ''}>${x}</option>`).join('');
    const body = rows.map(c => {
      const i = c.inquiry || {}, dl = currentDeadline(c), tone = dl ? deadlineTone(dl) : null, age = caseAgeTone(i);
      const assignedOfficerId = c.assignment?.primaryOfficerId || i?.inquiry644?.investigator || i?.intake?.investigator;
      const assignedOfficer = assignedOfficerId ? officerDisplayNameA5(assignedOfficerId, c) : 'ยังไม่มอบหมาย';
      return `<tr data-a5-case="${escapeHtml(c.caseData?.id)}" tabindex="0"><td><strong>${escapeHtml(c.caseData?.id || '')}</strong>${xlBadgeA5(c.caseAdministration, true)}<small>เลขรับบริการ ${c.caseData?.trackingYear || ''} / PIN ${c.caseData?.trackingCode || ''}</small></td><td><strong>${escapeHtml(c.caseData?.subject || '')}</strong><small>${escapeHtml(c.caseData?.agency || '')}</small></td><td><strong>${escapeHtml(c.caseData?.complainant || '')}</strong><small>${escapeHtml(i?.intake?.unit || c.caseData?.region || '')}</small></td><td>${escapeHtml(assignedOfficer)}</td><td><span class="ws-status ${c.workflow?.stage === 'closed' ? 'success' : ''}">${escapeHtml(phaseLabel(c))}</span></td><td>${dl ? `<span class="ws-deadline ${tone.tone}">${escapeHtml(tone.label)}</span>` : '<span class="ws-deadline muted">—</span>'}${age ? `<br><span class="ws-deadline ${age.tone}">${escapeHtml(age.label)}</span>` : ''}</td></tr>`;
    }).join('') || '<tr><td colspan="6" class="ws-empty">ไม่พบสำนวนตามเงื่อนไข</td></tr>';
    $('#a5CaseRows').innerHTML = body;
    $$('[data-a5-case]', root).forEach(r => { const open = () => { window.EXMIS?.showA5(r.dataset.a5Case); }; r.onclick = open; r.onkeydown = e => { if (e.key === 'Enter') open(); }; });
  }

  /* ---------- editor ตามเฟสและบทบาท ---------- */
  function caseReadonlyA5(state) {
    const c = state.caseData, d = state.documentData || {}, i = state.inquiry;
    return `<div class="ws-readonly"><dl><div><dt>เลขสำนวน</dt><dd>${escapeHtml(c.id)}</dd></div><div><dt>เลขรับบริการ / PIN</dt><dd>${c.trackingYear || ''} / ${c.trackingCode || ''}</dd></div><div><dt>เรื่อง</dt><dd>${escapeHtml(d.documentSubject || c.subject)}</dd></div><div><dt>ผู้ร้อง</dt><dd>${escapeHtml(c.complainant)}</dd></div><div><dt>ผู้ถูกร้อง/หน่วยงาน</dt><dd>${escapeHtml(c.agency)}</dd></div><div><dt>มาตรา/ผลการพิจารณา</dt><dd>${escapeHtml(d.decision || '')} · ${escapeHtml(c.channel || '')}</dd></div><div><dt>วันรับเรื่องครั้งแรก (เริ่มนับเวลา)</dt><dd>${escapeHtml(i?.intake?.receivedFirstAt || '')}</dd></div><div><dt>เลขหนังสือส่ง (จาก ก4)</dt><dd>${escapeHtml(d.dispatchLetterNo || '')} · ${escapeHtml(d.dispatchSendMethod || '')} ${escapeHtml(d.dispatchEms || '')}</dd></div></dl></div>`;
  }
  function transferPanelHtml(i, role) {
    let out = '';
    const tr = i.intake.transfer || {}, trp = i.intake.transferPost || {};
    if (tr.status === 'PENDING') {
      out += `<div class="ws-callout a5-blocked-note">เส้นทางโอนตรงเดิมถูกปิดใช้งาน — ต้องส่งกลับ กบค. เพื่อจัดเส้นทางใหม่ในแท็บบริหารสำนวน</div>`;
    }
    if (trp.status === 'PENDING') {
      out += `<div class="ws-callout">โอนหลังมอบหมาย: เสนอโอนไป ${escapeHtml(trp.target)} — รอเลขาธิการอนุมัติ (โดย ${escapeHtml(trp.by || '')})${trp.note ? ` · ${escapeHtml(trp.note)}` : ''}</div>${role === 'secretary' ? `<div class="ws-actions"><button class="ws-button primary" data-a5-action="transfer-post-approve">เลขาธิการอนุมัติโอน</button><button class="ws-button danger" data-a5-action="transfer-post-reject">ไม่อนุมัติ</button></div>` : '<p class="ws-policy-note">รอเลขาธิการพิจารณาอนุมัติ</p>'}`;
    }
    return out;
  }
  function intakeEditor(state, role) {
    const i = state.inquiry, c = state.caseData, m62 = i.intake.m62 || {};
    const canAssign = ['clerk', 'director'].includes(role);
    const foundationAssignment = ['PENDING_INTAKE_CHECK', 'INTAKE_CHECKED', 'ASSIGNMENT_PROPOSED', 'ASSIGNMENT_APPROVED', 'OFFICER_ACCEPTED', 'CLERK_ACKNOWLEDGED'].includes(state.workflow?.a5Status);
    return `<section class="ws-section"><h3>ข้อมูลสำนวนจากสำนักงาน ป.ป.ท.</h3>${caseReadonlyA5(state)}</section>
    <section class="ws-section"><h3>1. ตรวจสอบและมอบหมายผู้รับผิดชอบ</h3><div class="ws-grid-2">
      <div class="ws-field"><label>หน่วยงานเจ้าของสำนวน (เขต/กอง)</label><select id="a5Unit" ${canAssign ? '' : 'disabled'}>${UNITS.map(u => `<option ${(i.intake.unit || c.region) === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
      <div class="ws-field"><label>ผอ.สำนักงาน ป.ป.ท. เขต</label><input id="a5Director" value="${escapeHtml(i.intake.director || '')}" placeholder="เช่น ผอ.สำนักงาน ป.ป.ท. เขต 2" ${canAssign ? '' : 'disabled'}></div>
      <div class="ws-field"><label>ผู้รับผิดชอบเดิมจากข้อมูลต้นทาง (ใช้เป็นบริบท ไม่ใช่หลักฐานมอบหมาย)</label><select id="a5Investigator" ${foundationAssignment || !canAssign ? 'disabled' : ''}><option value="">ยังไม่มอบหมาย</option>${INVESTIGATORS.map(x => `<option ${i.intake.investigator === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="ws-field"><label>ผู้ร่วมปฏิบัติงาน (หลายคนได้)</label><input id="a5Team" value="${escapeHtml((i.intake.team || []).join(', '))}" placeholder="คั่นด้วยจุลภาค" ${canAssign ? '' : 'disabled'}></div>
    </div><p class="ws-policy-note">ผู้รับผิดชอบหลักต้องเป็นพนักงาน ป.ป.ท. เท่านั้น (ตามกฎหมาย)</p></section>
    <section class="ws-section"><h3>2. คำสั่ง/หนังสือมอบหมาย</h3><div class="ws-grid-2"><div class="ws-field"><label>เลขที่คำสั่ง/หนังสือมอบหมาย</label><input id="a5OrderNo" value="${escapeHtml(i.intake.orderNo || '')}" placeholder="เช่น คำสั่งที่ 45/2569" ${canAssign ? '' : 'disabled'}></div><div class="ws-field"><label>วันที่</label>${ThaiDatePicker.html('a5OrderDate', { value: i.intake.orderDate || '', placeholder: 'เลือกวันที่', disabled: !canAssign })}</div></div></section>
    <section class="ws-section"><h3>3. คดีที่รับจาก ป.ป.ช. (มาตรา 62)</h3><label class="ws-choice"><input type="checkbox" id="a5M62Flag" ${m62.flag ? 'checked' : ''} ${canAssign ? '' : 'disabled'}><span><strong>เป็นคดีที่คณะกรรมการ ป.ป.ช. มอบหมาย (ม.62)</strong><small>ต้องมีมติ ป.ป.ช. มอบหมายทุกสำนวน — ตรวจอำนาจก่อน (อายุความเหลือ <6 เดือน → ส่งคืน ป.ป.ช.)</small></span></label><div class="ws-grid-2" id="a5M62Fields"><div class="ws-field"><label>เลขหนังสือ/มติ ป.ป.ช.</label><input id="a5M62Letter" value="${escapeHtml(m62.sourceLetter || '')}" placeholder="เช่น มติที่ 5/2569"></div><div class="ws-field"><label>วันที่มีมติ</label>${ThaiDatePicker.html('a5M62Date', { value: m62.sourceMtiDate || '', placeholder: 'เลือกวันที่มีมติ' })}</div><div class="ws-field ws-field-full"><label>ผลตรวจอำนาจ/อายุความ</label><input id="a5M62Age" value="${escapeHtml(m62.ageCheck || '')}" placeholder="เช่น อายุความเหลือมากกว่า 6 เดือน — อยู่ในอำนาจ ป.ป.ท."></div></div></section>
    ${transferPanelHtml(i, role)}
    ${role === 'clerk' ? '<section class="ws-section"><h3>ส่งผิดสำนักงาน</h3><p class="ws-policy-note">ดำเนินการผ่าน กบค. ในแท็บบริหารสำนวนเท่านั้น ไม่มีการโอนตรงไปสำนักงานอื่น</p></section>' : ''}`;
  }
  function extSectionHtml(reportType, inquiry, role) {
    const rep = reportOf(reportType, inquiry);
    const pending = pendingExtension(reportType, inquiry);
    const age = caseAgeTone(inquiry);
    const tone = rep.deadlineAt ? deadlineTone(rep.deadlineAt) : null;
    const extensionHistory = Array.isArray(rep.extensionHistory) ? rep.extensionHistory : [];
    const highestRecordedOrdinal = extensionHistory.reduce((highest, item, index) => {
      const recorded = Number(item?.round);
      return Math.max(highest, Number.isInteger(recorded) && recorded > 0 ? recorded : index + 1);
    }, 0);
    const nextOrdinal = highestRecordedOrdinal + 1;
    const rounds = extensionHistory.map((item, index) => {
      const ordinal = Number.isInteger(Number(item?.round)) && Number(item.round) > 0 ? Number(item.round) : index + 1;
      const status = item?.status === 'APPROVED' ? 'อนุมัติแล้ว' : ['DENIED', 'REJECTED'].includes(item?.status) ? 'ไม่อนุมัติ' : 'รอพิจารณา';
      return `<span class="a5-ext-round ${item?.status === 'APPROVED' ? 'used' : ''}" title="${escapeHtml(status)}">${ordinal}\u00b7${escapeHtml(status)}</span>`;
    }).join('');
    let actionHtml = '';
    if (pending) {
      actionHtml = `<p class="ws-callout">คำขอขยายครั้งที่ ${pending.round} (${pending.requestedDays} วัน) รอ ${ROLE_LABELS[pending.role]} พิจารณา — เหตุผล: ${escapeHtml(pending.reason || '')}</p>`;
      actionHtml += pending.role === role
        ? `<div class="ws-actions"><button class="ws-button primary" data-a5-action="approve-extension">อนุมัติขยาย</button><button class="ws-button danger" data-a5-action="deny-extension">ไม่อนุมัติ</button></div>`
        : '<p class="ws-policy-note">รอผู้อนุมัติพิจารณา</p>';
    } else if (role === 'investigator') {
      const normalLimit = reportType === '213' ? 2 : 4;
      const late = (inquiry.extensionLateReports || []).find(item => item.reportType === reportType);
      actionHtml = late
        ? `<p class="ws-policy-note">รายงานเหตุล่าช้าอยู่ในสถานะ ${escapeHtml(late.status)}</p>`
        : nextOrdinal > normalLimit
          ? `<button type="button" class="ws-button secondary" data-a5-action="extension-late">จัดทำรายงานเหตุล่าช้าเพื่อส่งกิจกรรมที่ 7</button>`
          : `<button type="button" class="ws-button secondary" data-a5-action="request-extension">จัดทำคำขอขยายเวลา ลำดับที่ ${nextOrdinal}</button>`;
    } else {
      actionHtml = '<p class="ws-policy-note">ผู้รับผิดชอบสำนวนเป็นผู้ยื่นคำขอขยาย ส่วนบทบาทปัจจุบันดูข้อมูลได้เท่านั้น</p>';
    }
    const history = extensionHistory.length
      ? extensionHistory.map(h => {
          let st = h.status === 'PENDING' ? `ขอ ${h.requestedDays} วัน · รออนุมัติ` : ['DENIED', 'REJECTED'].includes(h.status) ? `ขอ ${h.requestedDays} วัน · ไม่อนุมัติ${h.denyNote || h.reviewReason ? ` (${escapeHtml(h.denyNote || h.reviewReason)})` : ''}` : `ขอ ${h.requestedDays} วัน · ${escapeHtml(h.approvedBy || h.role)} อนุมัติ ${h.approvedDays || h.requestedDays} วัน`;
          return `<li>ครั้งที่ ${h.round} · ${st} · ${escapeHtml(h.reason || '')} <time>${h.requestedAt || h.approvedAt || ''}</time></li>`;
        }).join('')
      : '<li>ยังไม่มีการขยายเวลา</li>';
    return `<div class="a5-ext-list"><div class="a5-ext-track"><span class="a5-ext-label">ประวัติคำขอขยาย ${reportType}:</span>${rounds || '<span class="a5-ext-round">ยังไม่มีประวัติ</span>'}</div>${tone ? `<p class="ws-deadline ${tone.tone}">${escapeHtml(tone.label)}</p>` : ''}${age ? `<p class="ws-deadline ${age.tone}">${escapeHtml(age.label)}</p>` : ''}${actionHtml}<ul class="ws-history">${history}</ul></div>`;
  }
  function progressSectionHtml(reportType, inquiry, role) {
    const process = inquiry.extensionProgress || {};
    const appointmentBlocker = reportType === '644' && !(inquiry.extensionSignedArtifacts || []).some(item => item.documentType === 'INQUIRY_APPOINTMENT_ORDER' && item.immutableSnapshot && item.snapshotFingerprint)
      ? '<section class="ws-section"><h3>หลักฐานคำสั่งแต่งตั้งสำหรับแบบขอขยาย 644</h3><p class="ws-policy-note a5-blocked-note">ยังไม่มีคำสั่งแต่งตั้งฉบับลงนามแบบ immutable จากแหล่งที่ได้รับอนุญาต ระบบไม่สร้างหลักฐานจากเลขที่คำสั่งหรือข้อความบนหน้าจอ ต้องรับหรือ register signed artifact จริงก่อน</p></section>'
      : '';
    const obligations = (process.obligations || []).filter(item => String(item.requestId || '').includes(`:${reportType}:`));
    if (process.policyStatus !== 'CONFIRMED') return `${appointmentBlocker}<section class="ws-section"><h3>ติดตามความคืบหน้าระหว่างขยายเวลา</h3><p class="ws-policy-note a5-blocked-note">ยังไม่สร้างรอบ 15 วัน เพราะจุดเริ่มนับรอบยังไม่ได้รับการยืนยัน</p></section>${lateReportProcessHtml(reportType, inquiry, role)}`;
    const list = obligations.length ? `<ul class="ws-history">${obligations.map(item => `<li>งวดที่ ${item.sequenceNo} · ครบ ${escapeHtml(item.dueAt || '')} · ${escapeHtml(globalThis.ECMISActivity5ExtensionProgress?.deriveProgressStatus?.(item, todayISO()) || item.status || '')}${role === 'investigator' && !['SUBMITTED', 'CLOSED'].includes(item.status) ? ` <button type="button" class="ws-button secondary" data-a5-action="progress-report" data-obligation-id="${escapeHtml(item.obligationId)}">จัดทำและส่ง</button>` : ''}<time>${escapeHtml(item.submittedAt || '')}</time></li>`).join('')}</ul>` : '<p class="ws-policy-note">ไม่มีงวดติดตามที่สร้างจากนโยบายที่ยืนยันแล้ว</p>';
    return `${appointmentBlocker}<section class="ws-section"><h3>ติดตามความคืบหน้าระหว่างขยายเวลา</h3>${list}</section>${lateReportProcessHtml(reportType, inquiry, role)}`;
  }
  function lateReportProcessHtml(reportType, inquiry, role) {
    const report = (inquiry.extensionLateReports || []).find(item => item.reportType === reportType);
    if (!report) return '';
    const step = report.routing?.steps?.[report.routingIndex];
    let action = '';
    const id = escapeHtml(report.lateReportId);
    if (['OPINION_GROUP_PENDING', 'OPINION_UNIT_PENDING', 'OPINION_EXECUTIVE_PENDING'].includes(report.status)) {
      if (step?.contract?.reviewerRole === role) action = `<button type="button" class="ws-button primary" data-a5-action="late-review" data-late-report-id="${id}">บันทึกความเห็นหรือส่งกลับ</button>`;
      else if (step?.tier === 'GROUP_DIRECTOR' && step.required === false && role === 'investigator') action = `<button type="button" class="ws-button secondary" data-a5-action="late-skip-group" data-late-report-id="${id}">ยืนยันว่าไม่อยู่ในสาย ผอ.กลุ่มงาน</button>`;
    } else if (report.status === 'SECRETARY_DECISION_PENDING' && step?.contract?.reviewerRole === role) action = `<button type="button" class="ws-button primary" data-a5-action="late-secretary" data-late-report-id="${id}">เลขาธิการพิจารณาด้วยตนเอง</button>`;
    else if (report.status === 'RETURNED' && role === 'investigator') action = `<button type="button" class="ws-button primary" data-a5-action="late-resubmit" data-late-report-id="${id}">ส่งฉบับแก้ไขเข้าตรวจอีกครั้ง</button>`;
    else if (report.status === 'READY_TO_DISPATCH' && !(report.packages || []).length && role === 'investigator') action = `<button type="button" class="ws-button primary" data-a5-action="late-package" data-late-report-id="${id}">สร้างชุดส่งกิจกรรมที่ 7</button>`;
    else if (report.status === 'READY_TO_DISPATCH' && (report.packages || []).length && role === 'clerk') action = `<button type="button" class="ws-button primary" data-a5-action="late-dispatch" data-late-report-id="${id}">ส่งชุดเอกสาร</button>`;
    else if (report.status === 'DISPATCHED' && role === 'clerk') action = `<button type="button" class="ws-button primary" data-a5-action="late-receipt" data-late-report-id="${id}">บันทึกหลักฐานตอบรับ</button>`;
    else if (report.status === 'RECEIVED_BY_ACTIVITY_7' && role === 'investigator') action = `<button type="button" class="ws-button primary" data-a5-action="late-wait" data-late-report-id="${id}">เริ่มรอผลกิจกรรมที่ 7</button>`;
    else if (report.status === 'WAIT_RESULT' && role === 'committee') action = `<button type="button" class="ws-button primary" data-a5-action="late-result" data-late-report-id="${id}">บันทึกผลหรือส่งกลับแก้ไข</button>`;
    return `<section class="ws-section"><h3>กระบวนการรายงานเหตุล่าช้า ${reportType}</h3><p class="ws-callout">สถานะ ${escapeHtml(report.status)} · ทำสำนวนหลักต่อเนื่อง · ไม่เปลี่ยนกำหนดเวลาอัตโนมัติ</p>${action || '<p class="ws-policy-note">รอผู้รับผิดชอบตามขั้นตอนปัจจุบัน</p>'}</section>`;
  }
  function additionalDeadlineHtml(reportType, inquiry, role) {
    const rep = reportOf(reportType, inquiry);
    if (!rep.additionalDeadlineAt) return '';
    const tone = deadlineTone(rep.additionalDeadlineAt);
    const pending = rep.additionalExtensionPending;
    let action = '';
    if (pending) {
      action = role === 'director'
        ? `<div class="ws-actions"><button type="button" class="ws-button primary" data-a5-action="approve-additional-extension">อนุมัติขยายไต่สวนเพิ่มเติม</button><button type="button" class="ws-button danger" data-a5-action="deny-additional-extension">ไม่อนุมัติ</button></div>`
        : `<p class="ws-policy-note">รอ ผอ.สำนักงาน ป.ป.ท. เขต พิจารณาคำขอขยาย — เหตุผล: ${escapeHtml(pending.reason || '')}</p>`;
    } else if (rep.additionalExtendedOnce) {
      action = '<p class="ws-policy-note">ขยายไต่สวนเพิ่มเติมครบ 1 ครั้งแล้ว (30+30) — ครบกำหนดต้องเสนอ คกก.</p>';
    } else if (role === 'investigator') {
      action = `<button type="button" class="ws-button secondary" data-a5-action="request-additional-extension">ขอขยายไต่สวนเพิ่มเติมอีก 30 วัน (ได้ครั้งเดียว)</button>`;
    }
    return `<div class="ws-callout">กำหนดไต่สวนเพิ่มเติม: <span class="ws-deadline ${tone.tone}">${escapeHtml(tone.label)}</span></div>${action}`;
  }
  function chainHtml(reportType, inquiry, role) {
    const cs = chainState(reportType, inquiry);
    return `<div class="a5-ext-list"><strong>ลำดับชั้นตรวจรายงาน ${reportType}:</strong><ol class="ws-list">${cs.steps.map(s => { const d = cs.done.find(x => x.level === s.level); const isCurrent = cs.current && cs.current.level === s.level; return `<li>${d ? `✅ ${escapeHtml(d.label)} — ${escapeHtml(d.by)}${d.skip ? ' (ข้าม)' : ''}: ${escapeHtml(d.opinion || '')}` : `<b>${escapeHtml(s.label)}</b>${isCurrent ? ' ← รอตรวจ' : s.optional ? ' (ไม่บังคับ)' : ''}`}</li>`; }).join('')}</ol>${cs.complete ? '<p class="ws-policy-note">ตรวจครบทุกชั้นแล้ว — พร้อมเสนอคณะกรรมการ</p>' : `<div class="ws-field"><label>ความเห็น (${ROLE_LABELS[role]})</label><textarea id="a5ChainOpinion" placeholder="บันทึกความเห็น..."></textarea></div>${cs.current?.role === role ? '<button type="button" class="ws-button primary" data-a5-action="chain-approve">เห็นชอบ — ส่งชั้นถัดไป</button>' : cs.current?.role === 'director' && role === 'director' ? '' : ''}${role === 'secretary' && cs.current?.level === 4 ? '<label class="ws-choice"><input type="checkbox" id="a5SupportFlag"><span><strong>ส่งคณะอนุกรรมการสนับสนุนเลขาธิการฯ (กรณียุ่งยากซับซ้อน)</strong></span></label>' : ''}${['director', 'secretary', 'group-director'].includes(role) ? '<button type="button" class="ws-button danger" data-a5-action="chain-return">ส่งกลับแก้ไข (ไต่สวนเพิ่มเติม 30 วัน)</button>' : ''}${role === 'group-director' && !cs.done.some(d => d.level === 1) ? '<button type="button" class="ws-button ghost" data-a5-action="chain-skip-group">ไม่อยู่ในสายงาน — ข้ามชั้น</button>' : ''}`}</div>`;
  }
  function prelimEditor(state, role) {
    const i = state.inquiry, p = i.prelim, c = state.caseData;
    const isInvestigator = role === 'investigator';
    const planWorklog = globalThis.ECMISActivity5PlanWorklog;
    const structuredPlan = planWorklog?.renderCasePlanEditorA5?.(state.a5CasePlan, state.a5Worklog, { editable: isInvestigator });
    const reportApi = globalThis.ECMISActivity5Report213;
    const normalizedReport = reportApi?.normalizeReport213A5?.(state);
    const reportRecord = normalizedReport?.state?.a5DocumentStore?.records?.filter(record => record.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
    // รอบ 4: ฟอร์ม input อยู่ซ้ายในส่วน 3 (เต็มความกว้างคอลัมน์กลาง, โหมด full = ไม่มี split preview) ส่วนกระดาษ ปปท. 4 อยู่ doc pane ขวา
    const structuredReport = reportRecord ? reportApi.renderReport213EditorA5(reportRecord.payload, { editable: isInvestigator && reportRecord.status === 'DRAFT', layout: 'full', evidenceVersions: extensionRepositoryA5(state, '213') }) : '';
    return `<section class="ws-section"><h3>กรอบเวลาไต่สวนเบื้องต้น (60 วัน นับจากวันรับเรื่องครั้งแรก ${escapeHtml(i.intake.receivedFirstAt || '')})</h3>${extSectionHtml('213', i, role)}
    <div class="ws-grid-2"><div class="ws-field"><label>วันที่เริ่มนับ (วันรับเรื่องครั้งแรก)</label><input type="date" value="${escapeHtml(p.startedAt || i.intake.receivedFirstAt || '')}" disabled></div><div class="ws-field"><label>วันครบกำหนด</label><input type="date" value="${escapeHtml(p.deadlineAt || '')}" disabled></div></div></section>
    ${progressSectionHtml('213', i, role)}${structuredPlan || `<section class="ws-section"><h3>1. แผนงานคดีและบันทึกการปฏิบัติงาน</h3><div class="ws-field"><label>แผนงานคดี (Case Plan)</label><textarea id="a5Plan" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(p.plan || '')}</textarea></div><div class="ws-field"><label>บันทึกการปฏิบัติงาน/ความคืบหน้า</label><textarea id="a5WorkLog" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(p.workLog || '')}</textarea></div></section>`}<section class="ws-section"><div class="ws-grid-2"><div class="ws-field"><label>สถานะแผนคดี</label><input value="${escapeHtml(p.planStatus || '')}" disabled><small>ผู้มีอำนาจอนุมัติ/ลงนาม: ผอ.สำนักงาน ป.ป.ท. เขต</small></div>${p.planStatus === 'รออนุมัติจากหัวหน้าพนักงาน' && role === 'director' ? '<div class="ws-field"><button type="button" class="ws-button secondary" disabled>รอยืนยันผู้มีอำนาจอนุมัติแผน</button></div>' : ''}</div></section>
    <section class="ws-section"><h3>2. วิเคราะห์ประเด็นแห่งคดี 4 ประเด็น</h3><div class="ws-grid-2">${[['status', 'สถานะผู้ถูกร้อง'], ['authority', 'ขอบเขตอำนาจหน้าที่'], ['action', 'การกระทำถูกต้องตามอำนาจหน้าที่หรือไม่'], ['damage', 'ความเสียหาย']].map(([k, l]) => `<div class="ws-field"><label>${l}</label><textarea id="a5Issue_${k}" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(p.issues?.[k] || '')}</textarea></div>`).join('')}</div>
    <div class="ws-callout">คำขอคุ้มครองพยานใช้แถบด้านบนของสำนวน — ใช้ได้ทุกขั้นตอน; หมายค้นเก็บข้อมูลภายใน Activity 5 เท่านั้น เพราะกิจกรรมที่ 9 รองรับหมายจับ ไม่ใช่หมายค้น</div><div class="ws-grid-2"><div class="ws-field"><label>หมายค้น — ปลายทางยังยืนยันไม่ได้</label><input id="a5A9" value="${escapeHtml(p.searchWarrantResult || p.searchWarrant || '')}" placeholder="บันทึกข้อมูลคำร้อง/ผลศาลภายในสำนวน" ${isInvestigator ? '' : 'disabled'}><p class="ws-policy-note a5-blocked-note">ปิดการส่งต่อไปกิจกรรมที่ 9 จนกว่าจะมี source ของหมายค้นและปลายทางที่ถูกต้อง</p></div></div>
    ${(p.issues?.status && !p.issues.authority) ? '' : ''}<p class="ws-policy-note">ถ้าตรวจพบว่าอยู่ในอำนาจ ป.ป.ช. → เตรียมส่ง ป.ป.ช. (ระบุในสรุปรายงาน)</p></section>
    ${additionalDeadlineHtml('213', i, role)}
    <section class="ws-section"><h3>3. รายงานผลการไต่สวนเบื้องต้น (แบบ ปปท. 4)</h3>${structuredReport || '<p class="ws-policy-note">ไม่พบโมดูลรายงานฉบับมีโครงสร้าง</p>'}</section>`;
  }
  function prelimReviewEditor(state, role) {
    const i = state.inquiry;
    if (i.prelim.supportPending) {
      return `<section class="ws-section"><h3>คณะอนุกรรมการสนับสนุนเลขาธิการฯ — ความเห็นประกอบ (กรณียุ่งยากซับซ้อน)</h3>${paper213(state)}<div class="ws-field"><label>ความเห็นคณะอนุกรรมการสนับสนุนฯ</label><textarea id="a5SupportOpinion">${escapeHtml(i.prelim.supportOpinion || '')}</textarea></div></section>`;
    }
    return `<section class="ws-section"><h3>รายงาน 213 — ตรวจตามลำดับชั้น</h3>${paper213(state)}${chainHtml('213', i, role)}${i.prelim.fastTrack ? '<p class="ws-policy-note">ใช้ใบด่วน (ขอบรรจุวาระเร่งด่วน) — เสนอตรงคณะกรรมการ</p>' : ''}</section>`;
  }
  function committee213Editor(state, role) {
    const i = state.inquiry, m = i.committee213, p = i.prelim || {};
    const late = (i.extensionLateReports || []).find(item => item.reportType === '213');
    if (late) {
      return `<section class="ws-section"><h3>รายงานเหตุล่าช้าหลังใช้รอบขยาย 213 ครบ</h3><div class="ws-callout">สถานะ ${escapeHtml(late.status)} · ผู้รับผิดชอบยังต้องทำสำนวนต่อ</div><p class="ws-policy-note">กระบวนการย่อยไม่เปลี่ยน stage, owner หรือ deadline ของสำนวนหลัก</p></section>`;
    }
    return `<section class="ws-section"><h3>รายงาน 213 — คณะกรรมการ ป.ป.ท. พิจารณา</h3>${paper213(state)}<div class="ws-choice-grid">${MTI_213_RESULTS.map(r => `<label class="ws-choice"><input type="radio" name="a5Mti213" value="${r}" ${m.result === r ? 'checked' : ''}><span><strong>${r}</strong></span></label>`).join('')}</div><div class="ws-grid-2"><div class="ws-field"><label>เลขที่มติ</label><input id="a5Mti213No" value="${escapeHtml(m.mtiNo || '')}"></div><div class="ws-field"><label>วันที่มีมติ</label>${ThaiDatePicker.html('a5Mti213Date', { value: m.mtiDate || '', placeholder: 'เลือกวันที่มีมติ' })}</div><div class="ws-field ws-field-full"><label>ข้อความในมติ/หมายเหตุ</label><textarea id="a5Mti213Note">${escapeHtml(m.note || '')}</textarea></div></div>
    <aside class="ws-callout">รับไว้ไต่สวน → เลือกชุดไต่สวน (ม.24 ว.3 คณะอนุกรรมการ — ประธานกรรมการลงนาม, นับ 270 วันจากวันมติ / ม.24 ว.1 คณะพนักงาน — เลขาธิการลงนาม, นับจากวันลงนาม) + ระบุผู้รับผิดชอบชั้น 644</aside>
    <div class="ws-grid-2"><div class="ws-field"><label>ประเภทชุดไต่สวน</label><select id="a5OrderType"><option value="24v3" ${m.orderType === '24v3' || role === 'committee' ? 'selected' : ''}>คณะอนุกรรมการไต่สวน (ม.24 ว.3)</option><option value="24v1" ${m.orderType === '24v1' ? 'selected' : ''}>คณะพนักงานไต่สวน (ม.24 ว.1)</option></select></div><div class="ws-field"><label>เลขที่คำสั่งแต่งตั้ง</label><input id="a5OrderNo644" value="${escapeHtml(m.orderNo || '')}" placeholder="ระบบออกให้อัตโนมัติเมื่อบันทึกมติ"></div><div class="ws-field"><label>ผู้รับผิดชอบชั้น 644</label><select id="a5Investigator644">${INVESTIGATORS.map(x => `<option ${(m.investigator644 || i.intake.investigator) === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="ws-field"><label>หนังสือส่งมอบสำนวน (ถ้าคนละคนกับชั้น 213)</label><input id="a5Handover" value="${escapeHtml(m.handoverDoc?.letterNo || '')}" placeholder="เลขหนังสือส่งมอบสำนวน"></div></div>${state.workflow?.status?.includes('ปรับองค์คณะ') ? '<button type="button" class="ws-button primary" data-a5-action="org-approve">อนุมัติปรับองค์คณะ</button>' : ''}</section>`;
  }
  function inquiryEditor(state, role) {
    const i = state.inquiry, q = i.inquiry644, m = i.committee213;
    const isInvestigator = role === 'investigator';
    const report644Api = globalThis.ECMISActivity5Report644;
    const normalized644 = report644Api?.normalizeReport644A5?.(state);
    const report644Record = normalized644?.state?.a5DocumentStore?.records?.filter(record => record.documentId === report644Api?.FORM_7_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
    const structured644 = report644Record ? report644Api.renderReport644EditorA5(report644Record.payload, { editable: isInvestigator && report644Record.status === 'DRAFT' }) : '';
    return `<section class="ws-section"><h3>คำสั่งแต่งตั้งและกรอบเวลาไต่สวนชี้มูล (270 วัน + ขยายปกติ 4 รอบ)</h3><div class="ws-grid-2"><div class="ws-field"><label>ชุดไต่สวน</label><input value="${m.orderType === '24v3' ? 'คณะอนุกรรมการไต่สวน (ม.24 ว.3)' : 'คณะพนักงานไต่สวน (ม.24 ว.1)'} ${m.orderNo || ''}" disabled></div><div class="ws-field"><label>ผู้รับผิดชอบชั้น 644</label><input value="${escapeHtml(q.investigator || i.intake.investigator || '')}" disabled>${m.handoverDoc?.letterNo ? `<small>หนังสือส่งมอบสำนวน: ${escapeHtml(m.handoverDoc.letterNo)}</small>` : ''}</div><div class="ws-field"><label>เริ่มนับ 270 วัน</label><input type="date" value="${escapeHtml(q.startedAt || '')}" disabled><small>ว.3 = วันบอร์ดมีมติ / ว.1 = วันเลขาธิการลงนาม</small></div><div class="ws-field"><label>วันครบกำหนด</label><input type="date" value="${escapeHtml(q.deadlineAt || '')}" disabled></div></div>${extSectionHtml('644', i, role)}
    <div class="ws-field"><label>แผนงานคดี (ชั้น 644)</label><textarea id="a5Plan644" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(q.plan || '')}</textarea></div>${q.planStatus === 'รออนุมัติจากหัวหน้าพนักงาน' && role === 'director' ? '<button type="button" class="ws-button primary" data-a5-action="plan-approve-644">อนุมัติแผนคดี 644</button>' : `<small>สถานะแผน: ${escapeHtml(q.planStatus || '')}</small>`}</section>
    ${progressSectionHtml('644', i, role)}<section class="ws-section"><h3>1. การไต่สวน</h3><div class="ws-field"><label>ผู้ถูกกล่าวหา (ทีละบรรทัด)</label><textarea id="a5Accused" ${isInvestigator ? '' : 'disabled'}>${escapeHtml((q.accused || []).join('\n'))}</textarea></div><div class="ws-field"><label>ข้อกล่าวหา</label><textarea id="a5Allegations" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(q.allegations || '')}</textarea></div><div class="ws-grid-2"><div class="ws-field"><label>วันที่แจ้งข้อกล่าวหา</label>${ThaiDatePicker.html('a5NoticeDate', { value: q.noticeSentAt || '', placeholder: 'เลือกวันที่แจ้งข้อกล่าวหา', disabled: !isInvestigator })}<small>แจ้งเมื่อหลักฐานเพียงพอ — เปิดโอกาสชี้แจงก่อนสรุป 644</small></div><div class="ws-field"><label>กันบุคคลเป็นพยาน (ม.58)</label><input id="a5Witnesses" value="${escapeHtml((q.witnesses || []).join(', '))}" ${isInvestigator ? '' : 'disabled'}></div></div><div class="ws-field"><label>บันทึกถ้อยคำ/คำชี้แจง</label><textarea id="a5Statements" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(q.statements || '')}</textarea></div>
    <div class="ws-callout">คำขอคุ้มครองพยานใช้แถบด้านบนของสำนวน — ใช้ได้ทุกขั้นตอน; หมายค้นเก็บข้อมูลภายใน Activity 5 เท่านั้น เพราะกิจกรรมที่ 9 รองรับหมายจับ ไม่ใช่หมายค้น</div><div class="ws-grid-2"><div class="ws-field"><label>หมายค้น — ปลายทางยังยืนยันไม่ได้</label><input id="a5InqA9" value="${escapeHtml(q.searchWarrantResult || q.searchWarrant || '')}" placeholder="บันทึกข้อมูลคำร้อง/ผลศาลภายในสำนวน" ${isInvestigator ? '' : 'disabled'}><p class="ws-policy-note a5-blocked-note">ปิดการส่งต่อไปกิจกรรมที่ 9 จนกว่าจะมี source ของหมายค้นและปลายทางที่ถูกต้อง</p></div></div></section>
    ${additionalDeadlineHtml('644', i, role)}
    ${form56BlockA5(state, role)}
    ${structured644 || `<section class="ws-section"><h3>2. สรุปรายงานการไต่สวนชี้มูล (รายงาน 644)</h3><div class="ws-field"><label>สรุปผล + ความเห็นชี้มูล</label><textarea id="a5InqReport" ${isInvestigator ? '' : 'disabled'}>${escapeHtml(q.report || '')}</textarea></div></section>`}
    ${report644ReviewBlockA5(state, role)}`;
  }
  const A5_DOC_STATUS_LABELS = Object.freeze({ DRAFT: 'ร่าง', SUBMITTED: 'เสนอแล้ว', RETURNED: 'ถูกส่งกลับ', SIGNED: 'ลงนามแล้ว', DISPATCHED: 'จัดส่งแล้ว', RECEIVED: 'ได้รับแล้ว', SUPERSEDED: 'ถูกแทนที่' });
  function evidenceRepositoryOptionsA5(state) {
    return [state.a5EvidenceRepository, state.evidenceRepository, state.documentRepository]
      .flatMap(items => Array.isArray(items) ? items : [])
      .map(item => ({ versionId: item.versionId || item.documentVersionId, name: item.title || item.name || item.documentType || item.artifactId || 'เอกสาร', availability: item.availability || 'AVAILABLE' }))
      .filter(item => item.versionId);
  }
  function report644ReviewBlockA5(state, role) {
    const api = globalThis.ECMISActivity5Report644;
    if (!api) return '';
    const normalized = api.normalizeReport644A5(state);
    const lifecycle = normalized?.state?.a5Report644Lifecycle;
    if (!lifecycle || !(lifecycle.submissions || []).length) return '';
    const submission = lifecycle.submissions.at(-1);
    const signature = (lifecycle.signatures || []).find(item => item.submissionPackageId === submission.packageId);
    const boardPackage = (lifecycle.packages || []).find(item => item.submissionPackageId === submission.packageId);
    const dispatch = (lifecycle.dispatches || []).find(item => item.packageId === boardPackage?.packageId);
    const opinions = (lifecycle.reviewOpinions || []).filter(item => item.reportRevisionNo === submission.report.revisionNo);
    const buttons = [];
    if (lifecycle.status === 'REPORT_644_REVIEW_PENDING' && role === 'director') {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="review-record-opinion">บันทึกความเห็น</button>');
      buttons.push('<button type="button" class="ws-button secondary" data-a5-report-644-action="review-return">ส่งกลับแก้ไข</button>');
    }
    if (lifecycle.status === 'REPORT_644_BOARD_READY' && role === 'director') {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="sign">ลงนามรายงาน</button>');
    }
    if (signature && !boardPackage && ['director', 'clerk'].includes(role)) {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="create-package">จัดชุดเสนอคณะกรรมการ</button>');
    }
    if (boardPackage && !dispatch && role === 'clerk') {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="send-a7">ส่งรายงานไปกิจกรรมที่ 7</button>');
    }
    if (lifecycle.status === 'REPORT_644_SENT_TO_A7' && role === 'clerk') {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="record-receipt">บันทึกหลักฐานรับ</button>');
    }
    if (lifecycle.status === 'REPORT_644_WAIT_RESULT' && role === 'committee') {
      buttons.push('<button type="button" class="ws-button primary" data-a5-report-644-action="record-result">บันทึกผลพิจารณา</button>');
    }
    if (!buttons.length && !opinions.length) return '';
    return `<section class="ws-section"><h3>สถานะการตรวจและเสนอรายงาน 644</h3><dl class="ws-readonly"><div><dt>สถานะปัจจุบัน</dt><dd>${escapeHtml(A5_DOC_STATUS_LABELS[lifecycle.status] || lifecycle.status)}</dd></div></dl>
      ${opinions.length ? `<h4>ความเห็นที่บันทึกแล้ว</h4>${opinions.map(op => `<p class="ws-readonly-line">${escapeHtml(op.reviewerName)} (${op.decision === 'RETURN' ? 'ส่งกลับ' : 'เห็นชอบ'}): ${escapeHtml(op.opinionText)}</p>`).join('')}` : ''}
      <div class="ws-actions" style="position:static">${buttons.join('')}</div></section>`;
  }
  function form56BlockA5(state, role) {
    const api = globalThis.ECMISActivity5Report644;
    if (!api) return '';
    const normalized = api.normalizeReport644A5(state);
    const workingState = normalized?.ok ? normalized.state : state;
    const store = workingState.a5DocumentStore || {};
    const records = Array.isArray(store.records) ? store.records : [];
    const form7 = records.filter(r => r.documentId === api.FORM_7_ID).sort((a, b) => b.revisionNo - a.revisionNo)[0];
    const accusedRows = form7?.payload?.accusedPersons || [];
    if (!accusedRows.length) return '<section class="ws-section"><h3>แจ้งข้อกล่าวหาและสิทธิคัดค้าน (แบบ ปปท. 5–6)</h3><p class="ws-policy-note">ยังไม่มีผู้ถูกกล่าวหาในรายงาน 213 ที่เสนอแล้ว — ยังไม่สร้างเอกสารแจ้งข้อกล่าวหา</p></section>';
    const isInvestigator = role === 'investigator';
    const lifecycle = workingState.a5Report644Lifecycle || {};
    const evidenceVersions = evidenceRepositoryOptionsA5(workingState);
    const blocks = accusedRows.map(row => {
      const form5 = records.find(r => r.documentId === api.form5DocId(row.rowId));
      const form6 = records.find(r => r.documentId === api.form6DocId(row.rowId));
      if (!form5 || !form6) return '';
      const editable5 = isInvestigator && form5.status === 'DRAFT';
      const editable6 = isInvestigator && form6.status === 'DRAFT';
      const serviced = (lifecycle.services || []).some(s => s.accusedRowId === row.rowId);
      const defended = (lifecycle.defences || []).some(d => d.accusedPersonRef === row.rowId);
      const signed = form5.payload.signer?.authorityStatus === 'CONFIRMED';
      const objections = (lifecycle.panelObjections || []).filter(o => o.accusedRowId === row.rowId);
      const rowIdAttr = escapeHtml(row.rowId);
      return `<div class="a5-form56-accused" data-accused-row-id="${rowIdAttr}"><h4>ผู้ถูกกล่าวหา: ${escapeHtml(row.name || 'เอกสารไม่ระบุ')}</h4>
        <details${form5.status === 'DRAFT' ? ' open' : ''}><summary>แบบ ปปท. ๕ — หนังสือแจ้งให้รับทราบข้อกล่าวหา (${escapeHtml(A5_DOC_STATUS_LABELS[form5.status] || form5.status)}${signed ? ' · ลงนามแล้ว' : ''})</summary>
          ${api.renderForm5EditorA5(form5.payload, { editable: editable5, evidenceVersions })}
          ${editable5 ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-form5-action="save" data-accused-row-id="${rowIdAttr}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-form5-action="submit" data-accused-row-id="${rowIdAttr}">เสนอหนังสือแจ้งข้อกล่าวหา</button></div>` : ''}
          ${form5.status === 'SUBMITTED' && !signed && role === 'director' ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button primary" data-a5-form5-action="sign" data-accused-row-id="${rowIdAttr}">ลงนามหนังสือแจ้งข้อกล่าวหา</button></div>` : ''}
          ${form5.status === 'SUBMITTED' && !signed && role !== 'director' ? '<p class="ws-policy-note">รอ ผอ.สำนักงาน ป.ป.ท. เขต/ประธานอนุกรรมการไต่สวนลงนาม</p>' : ''}
          ${signed && !serviced && isInvestigator ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-form5-action="service-record" data-accused-row-id="${rowIdAttr}">บันทึกหลักฐานการส่ง</button></div>` : ''}
          ${serviced ? '<p class="ws-policy-note">บันทึกหลักฐานการส่งบันทึกแจ้งข้อกล่าวหาแล้ว</p>' : ''}
        </details>
        <details${form6.status === 'DRAFT' ? ' open' : ''}><summary>แบบ ปปท. ๖ — บันทึกการแจ้งข้อกล่าวหา (${escapeHtml(A5_DOC_STATUS_LABELS[form6.status] || form6.status)})</summary>
          ${api.renderForm6EditorA5(form6.payload, { editable: editable6, evidenceVersions })}
          ${editable6 ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-form6-action="save" data-accused-row-id="${rowIdAttr}">บันทึกร่าง</button><button type="button" class="ws-button primary" data-a5-form6-action="submit" data-accused-row-id="${rowIdAttr}">เสนอบันทึกแจ้งข้อกล่าวหา</button></div>` : ''}
        </details>
        ${!defended && isInvestigator ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-form6-action="defence-record" data-accused-row-id="${rowIdAttr}">บันทึกคำชี้แจงหรือไม่ยื่นคำชี้แจง</button></div>` : ''}
        ${defended ? '<p class="ws-policy-note">บันทึกคำชี้แจงหรือไม่ยื่นคำชี้แจงแล้ว</p>' : ''}
        <details><summary>สิทธิคัดค้านคณะพนักงานไต่สวน/คณะอนุกรรมการไต่สวน${objections.length ? ` (มีคำร้อง ${objections.length} ฉบับ)` : ''}</summary>
          ${objections.length ? `<ul class="ws-history">${objections.map(o => `<li>คัดค้าน ${escapeHtml((form6.payload.panel || []).find(p => p.rowId === o.panelRowId)?.name || o.panelRowId)} — ${escapeHtml(o.reason)} <time>${escapeHtml(o.filedAt)}</time></li>`).join('')}</ul><p class="ws-policy-note">ปรับองค์คณะที่ถูกคัดค้านผ่านแท็บ "บริหารสำนวน" (ปรับองค์คณะ) ตามผลการพิจารณาคำร้อง</p>` : '<p class="ws-policy-note">ยังไม่มีคำร้องคัดค้าน</p>'}
          ${isInvestigator ? `<div class="ws-actions" style="position:static"><button type="button" class="ws-button secondary" data-a5-form6-action="panel-objection-record" data-accused-row-id="${rowIdAttr}">บันทึกคำร้องคัดค้านองค์คณะ</button></div>` : ''}
        </details>
      </div>`;
    }).join('');
    return `<section class="ws-section"><h3>แจ้งข้อกล่าวหาและสิทธิคัดค้าน (แบบ ปปท. 5–6)</h3>${blocks}</section>`;
  }
  function inquiryReviewEditor(state, role) {
    const i = state.inquiry;
    if (i.inquiry644.supportPending) {
      return `<section class="ws-section"><h3>คณะอนุกรรมการสนับสนุนเลขาธิการฯ — ความเห็นประกอบ (644)</h3>${paper644(state)}<div class="ws-field"><label>ความเห็นคณะอนุกรรมการสนับสนุนฯ</label><textarea id="a5SupportOpinion644">${escapeHtml(i.inquiry644.supportOpinion || '')}</textarea></div></section>`;
    }
    return `<section class="ws-section"><h3>รายงาน 644 — ตรวจตามลำดับชั้น</h3>${paper644(state)}${chainHtml('644', i, role)}${i.inquiry644.fastTrack ? '<p class="ws-policy-note">ใช้ใบด่วน — เสนอตรงคณะกรรมการ</p>' : ''}</section>`;
  }
  function committee644Editor(state, role) {
    const i = state.inquiry, m = i.committee644, q = i.inquiry644 || {};
    const late = (i.extensionLateReports || []).find(item => item.reportType === '644');
    if (late) {
      return `<section class="ws-section"><h3>รายงานเหตุล่าช้าหลังใช้รอบขยาย 644 ครบ</h3><div class="ws-callout">สถานะ ${escapeHtml(late.status)} · ผู้รับผิดชอบยังต้องทำสำนวนต่อ</div><p class="ws-policy-note">กระบวนการย่อยไม่เปิดรอบครั้งที่ 5 และไม่เปลี่ยน stage, owner หรือ deadline ของสำนวนหลัก</p></section>`;
    }
    return `<section class="ws-section"><h3>รายงาน 644 — คณะกรรมการ ป.ป.ท. วินิจฉัยชี้มูล</h3>${paper644(state)}<div class="ws-choice-grid">${MTI_644_RESULTS.map(r => `<label class="ws-choice"><input type="radio" name="a5Mti644" value="${r}" ${m.result === r ? 'checked' : ''}><span><strong>${r}</strong></span></label>`).join('')}</div><div class="ws-grid-2"><div class="ws-field"><label>เลขที่มติ</label><input id="a5Mti644No" value="${escapeHtml(m.mtiNo || '')}"></div><div class="ws-field"><label>วันที่มีมติ</label>${ThaiDatePicker.html('a5Mti644Date', { value: m.mtiDate || '', placeholder: 'เลือกวันที่มีมติ' })}</div><div class="ws-field ws-field-full"><label>ข้อความในมติ/หมายเหตุ</label><textarea id="a5Mti644Note">${escapeHtml(m.note || '')}</textarea></div></div><aside class="ws-callout">Activity 5 จัดทำรายงาน มติ หนังสือนำส่ง และหลักฐานการส่งตามผลมติ ส่วนการเริ่มงานติดตามของกิจกรรมที่ 8 ต้องมาจากกิจกรรมที่ 7 และ initial contract ไปอัยการ/กิจกรรมที่ 10 ยังยืนยันไม่ได้</aside>${state.workflow?.status?.includes('ปรับองค์คณะ') ? '<button type="button" class="ws-button primary" data-a5-action="org-approve">อนุมัติปรับองค์คณะ</button>' : ''}</section>`;
  }
  function warrantSection(i, role) {
    const o = i.outcome || {}, w = o.warrant || {};
    const steps = [['none', 'ยังไม่ได้ยื่นคำร้อง'], ['filed', 'ยื่นคำร้องต่อศาลแล้ว'], ['issued', 'ศาลออกหมายจับแล้ว'], ['denied', 'ศาลไม่ออกหมายจับ'], ['arrested', 'ดำเนินการตามหมาย'], ['notified', 'แจ้งหน่วยงานแล้ว']];
    const st = steps.find(s => s[0] === (w.status || 'none')) || steps[0];
    const can = ['clerk', 'investigator'].includes(role);
    return `<section class="ws-section"><h3>การขอหมายจับ / ส่งศาล <span class="ws-status">${st[1]}</span></h3><div class="ws-grid-2"><div class="ws-field"><label>ศาล</label><input id="a5WarrantCourt" value="${escapeHtml(w.court || '')}" placeholder="ศาลอาญาคดีทุจริตและประพฤติมิชอบ" ${can ? '' : 'disabled'}></div><div class="ws-field"><label>หมายจับที่ / ลงวันที่</label><input id="a5WarrantNo" value="${escapeHtml(w.warrantNo || '')}" placeholder="หมายจับที่ ... ลงวันที่ ..." ${can ? '' : 'disabled'}></div></div><div class="ws-actions" style="position:static;flex-wrap:wrap">${can ? `<button type="button" class="ws-button secondary" data-a5-action="warrant-file">ยื่นคำร้องขอหมายจับต่อศาล</button><button type="button" class="ws-button secondary" data-a5-action="warrant-court" ${w.status === 'filed' ? '' : 'disabled'}>บันทึกผลศาล</button><button type="button" class="ws-button secondary" data-a5-action="warrant-arrest" ${w.status === 'issued' ? '' : 'disabled'}>บันทึกการจับกุม</button><button type="button" class="ws-button primary" data-a5-action="warrant-notify" ${w.status === 'arrested' ? '' : 'disabled'}>แจ้งหน่วยงาน (อัยการ/ผบ.ตร./กอท.)</button>` : ''}</div>${w.note ? `<p class="ws-policy-note">${escapeHtml(w.note)}</p>` : ''}<p class="ws-policy-note">เอกสาร: คำร้องขอหมายจับ (แบบ ปปท. 11) → บันทึกคำเบิกความ (12) → รายงานกระบวนการพิจารณา (13) → หมายจับ (14/15) → ตำหนิรูปพรรณ (16) → แจ้งผลการออกหมาย (17) → แจ้ง ผบ.ตร. (18) → บันทึกส่งหมายจับ กอท. (19) → ผนึกซอง (20)</p></section>`;
  }
  function outcomeEditor(state, role) {
    const i = state.inquiry, o = i.outcome, m = i.committee644, m62 = i.intake.m62 || {};
    const result = m.result || '';
    const isClerk = ['clerk', 'investigator'].includes(role);
    const postRegistry = globalThis.ECMISActivity5PostResolution?.renderPostDocumentEditorA5?.(state, { id: workflowActorNameA5(state, role), name: workflowActorNameA5(state, role), role }, evidenceRepositoryOptionsA5(state)) || '';
    return `<section class="ws-section"><h3>ผลมติคณะกรรมการ: ${escapeHtml(result || 'ยังไม่มีมติ')}</h3><div class="ws-grid-2"><div class="ws-field"><label>แนวทางดำเนินการ</label><input value="${escapeHtml(result)}" disabled></div><div class="ws-field"><label>เลขหนังสือ/เอกสารส่ง</label><input id="a5OutLetters" value="${escapeHtml(o.letters || '')}" ${isClerk ? '' : 'disabled'}></div>${result.includes('อาญา') ? `<div class="ws-field"><label>พนักงานอัยการ (เขตอำนาจ)</label><input id="a5OutProsecutor" value="${escapeHtml(o.prosecutor || '')}" placeholder="อัยการคดีทุจริต / อัยการทหาร" ${isClerk ? '' : 'disabled'}></div>` : ''}${result.includes('วินัย') ? `<div class="ws-field"><label>หน่วยงานต้นสังกัด (วินัย 60 วัน)</label><input id="a5OutDiscipline" value="${escapeHtml(o.disciplineAgency || '')}" ${isClerk ? '' : 'disabled'}></div>` : ''}<div class="ws-field ws-field-full"><label>การติดตามผล (กบต.)</label><textarea id="a5OutFollowup" ${isClerk ? '' : 'disabled'}>${escapeHtml(o.followup || '')}</textarea></div></div>${result.includes('ไม่มีมูล') ? '<p class="ws-policy-note">ต้องแจ้งผู้ถูกกล่าวหา/ต้นสังกัดภายใน 15 วันนับแต่วันที่มีมติ (ระบุในเลขหนังสือ)</p>' : ''}${result.includes('อาญา') ? warrantSection(i, role) : ''}${m62.flag ? `<section class="ws-section"><h3>รายงานผลกลับ ป.ป.ช. (มาตรา 65)</h3><div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือรายงานผล</label><input id="a5M62Report" value="${escapeHtml(m62.report65Letter || '')}" placeholder="เช่น หนังสือที่ สปท 0012/2569"></div><div class="ws-field"><label>วันที่</label>${ThaiDatePicker.html('a5M62ReportDate', { value: m62.report65Date || '', placeholder: 'เลือกวันที่' })}</div></div></section>` : ''}</section>${postRegistry}`;
  }
  // Retired (Phase 10, item 1): superseded by the canonical prosecutor-* downstream chain
  // rendered via currentDownstreamTaskA5(). Kept unremoved per §4.2.2 preservation rule —
  // no entry point calls this anymore (see renderStageEditor/actionsForA5).
  function prosecutorEditor(state, role) {
    const i = state.inquiry, p = i.prosecutor;
    return `<section class="ws-section"><h3>พนักงานอัยการสั่งการ (กิจกรรมที่ 10)</h3><div class="ws-callout">${p.orderType ? `คำสั่งอัยการ: ${escapeHtml(p.orderType)}${p.orderDetail ? ` — ${escapeHtml(p.orderDetail)}` : ''}` : 'รอคำสั่งจากพนักงานอัยการ (อาจสั่งให้ไต่สวนเพิ่มเติม/เพิ่มผู้ถูกกล่าวหา/แยกสำนวน)'}</div>
    <div class="ws-field"><label>คำสั่งอัยการ</label><select id="a5ProsecutorOrder">${PROSECUTOR_ORDERS.map(x => `<option ${p.orderType === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="ws-field"><label>รายละเอียดคำสั่ง</label><textarea id="a5ProsecutorDetail">${escapeHtml(p.orderDetail || '')}</textarea></div><label class="ws-choice"><input type="checkbox" id="a5A7Approve"><span><strong>กรณีแยกสำนวน — คณะกรรมการ ป.ป.ท. เห็นชอบแล้ว</strong><small>การแยกสำนวนต้องเสนอให้กิจกรรมที่ 7 เห็นชอบก่อน</small></span></label>
    <div class="ws-field"><label>เลขหนังสือส่งผลกลับอัยการ</label><input id="a5ProsecutorLetters" value="${escapeHtml(p.letters || '')}" placeholder="เช่น หนังสือที่ สปท 0013/2569"></div></section>`;
  }
  function specialEditor(state, role) {
    const i = state.inquiry, s = i.special, c = state.caseData;
    return `<section class="ws-section"><h3>ตรวจสอบข้อเท็จจริง (มาตรา 58/2-58/3) — ไม่มีเลขสำนวน ไม่เข้าระบบไต่สวน</h3><div class="ws-grid-2"><div class="ws-field"><label>ประเภท</label><select id="a5SpecialType"><option value="582" ${s.type === '582' || c.decision === '58/2' ? 'selected' : ''}>58/2 ปัญหาความเดือดร้อน</option><option value="583" ${s.type === '583' ? 'selected' : ''}>58/3 โครงการวงเงินสูงเกินจริง</option></select></div><div class="ws-field"><label>ผอ. มอบหมายเจ้าหน้าที่</label><input id="a5SpecialAssignee" value="${escapeHtml(s.assignee || '')}" placeholder="ชื่อเจ้าหน้าที่ ป.ป.ท. ผู้ตรวจสอบ"></div><div class="ws-field"><label>หน่วยงานที่แจ้ง (58/2: หน่วยงานรัฐ / 58/3: สตง.)</label><input id="a5SpecialAgency" value="${escapeHtml(s.agency || '')}"></div><div class="ws-field"><label>วันที่รายงาน/แจ้ง</label>${ThaiDatePicker.html('a5SpecialDate', { value: s.reportedAt || '', placeholder: 'เลือกวันที่รายงาน/แจ้ง' })}</div><div class="ws-field ws-field-full"><label>ผลการดำเนินการ/หมายเหตุ</label><textarea id="a5SpecialResult">${escapeHtml(s.result || '')}</textarea></div></div><div class="ws-actions">${s.secretaryAt ? `<span class="ws-status success">เสนอเลขาธิการแล้ว ${escapeHtml(s.secretaryAt)}</span>` : '<button class="ws-button secondary" data-a5-action="special-secretary">เสนอเลขาธิการตามลำดับชั้น</button>'}<button class="ws-button secondary" data-a5-action="special-notice">หน่วยงานไม่แก้ไข — ประกาศให้ประชาชนทราบ</button><button class="ws-button danger" data-a5-action="special-switch">พบพฤติการณ์ทุจริต — เปลี่ยนเส้นทางเข้าคดี</button></div>${s.publicNotice ? '<p class="ws-policy-note">✅ ประกาศให้ประชาชนทราบแล้ว (58/2)</p>' : ''}${s.switched ? '<p class="ws-policy-note">⚠️ เปลี่ยนเส้นทางเข้าสู่คดีตามอำนาจแล้ว</p>' : ''}</section>`;
  }
  function adminCaseTools(state, role) {
    const route = state.returnRoute || {}, admin = state.caseAdministration || {};
    const actions = globalThis.ECMISActivity5Workflow?.getA5AdminActions(state, role) || [];
    const has = id => actions.some(action => action.id === id);
    const actionButton = id => has(id) ? `<button type="button" class="ws-button secondary" data-a5-workflow-action="${id}">${escapeHtml(actions.find(action => action.id === id).label)}</button>` : '';
    let routeForm = `<p class="ws-policy-note">สถานะส่งคืนผ่าน กบค.: ${escapeHtml(route.status || 'ยังไม่เริ่ม')}</p>`;
    if (has('return-request')) routeForm += '<div class="ws-grid-2"><div class="ws-field"><label>เหตุผลที่ส่งผิดสำนักงาน</label><textarea id="a5ReturnReason"></textarea></div><div class="ws-field"><label>ความเห็นเสนอส่งกลับ กบค.</label><textarea id="a5ReturnOpinion"></textarea></div><div class="ws-field ws-field-full"><label>สำนักงานปลายทาง (เขตที่ควรรับเรื่อง)</label><select id="a5ReturnDestination" required><option value="">เลือกสำนักงานปลายทาง</option>' + UNITS.map(unit => `<option value="${unit}">${unit}</option>`).join('') + '</select></div></div>' + actionButton('return-request');
    if (has('return-approve')) routeForm += '<div class="ws-field"><label>ความเห็นผู้อนุมัติ</label><textarea id="a5ReturnApprovalOpinion"></textarea></div>' + actionButton('return-approve');
    if (has('return-dispatch')) routeForm += '<div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือส่งคืน</label><input id="a5ReturnLetterNo"></div><div class="ws-field"><label>เลข EMS</label><input id="a5ReturnEms"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5ReturnDispatchedAt" type="date"></div></div>' + actionButton('return-dispatch');
    if (has('gbk-receive') || has('destination-receive')) routeForm += `<div class="ws-grid-2"><div class="ws-field"><label>วันที่รับ</label><input id="a5RouteReceivedAt" type="date"></div><div class="ws-field"><label>ผู้ถือต้นฉบับ</label><input id="a5RouteHolder"></div></div>${actionButton(has('gbk-receive') ? 'gbk-receive' : 'destination-receive')}`;
    if (has('gbk-reroute')) routeForm += `<div class="ws-grid-2"><div class="ws-field"><label>สำนักงานปลายทาง (จากคำขอ — ไม่สามารถเปลี่ยนได้)</label><input id="a5RerouteDestination" value="${escapeHtml(route.destination || '')}" readonly></div><div class="ws-field"><label>ความเห็น กบค.</label><textarea id="a5RerouteOpinion"></textarea></div><div class="ws-field"><label>ผู้ถือเอกสารตัวจริง</label><input id="a5PhysicalHolder" placeholder="เช่น กบค. / จนท. ชื่อ"></div><div class="ws-field"><label>วันที่ส่งเอกสารตัวจริง</label><input id="a5PhysicalSentAt" type="date"></div><div class="ws-field"><label>เลขไปรษณีย์/EMS</label><input id="a5PhysicalEmsNumber" placeholder="เลข EMS"></div></div>${actionButton('gbk-reroute')}`;
    const pending = state.pendingReassignment || {};
    const pendingStatusLabel = { REQUESTED: 'ยื่นคำขอแล้ว — รอธุรการรับคำขอ', LOGGED: 'ธุรการรับคำขอแล้ว — รอ ผอ. มอบหมายผู้รับผิดชอบหลักคนใหม่', ASSIGNED: 'ผอ. มอบหมายแล้ว — รอผู้รับผิดชอบหลักเดิมส่งมอบงาน', HANDED_OFF: 'ส่งมอบงานแล้ว — รอผู้รับผิดชอบหลักคนใหม่กดรับ' }[pending.status] || '';
    let reassignment = `<p>ผู้รับผิดชอบหลัก: <strong>${escapeHtml(state.assignment?.primaryOfficerId || state.assignment?.legalOwner || 'ยังไม่ระบุ')}</strong> · เวอร์ชัน ${Number(state.assignment?.assignmentVersion || 0)}</p>`;
    if (has('team-update')) reassignment += `<div class="ws-grid-2"><div class="ws-field"><label>ผู้ช่วยผู้รับผิดชอบ</label><input id="a5TeamUpdateAssistants" value="${escapeHtml((state.assignment?.assistantOfficerIds || []).join(', '))}" placeholder="รหัสผู้ช่วย คั่นด้วยจุลภาค"></div><div class="ws-field"><label>เหตุผลการปรับทีม</label><input id="a5TeamUpdateReason"></div></div>${actionButton('team-update')}`;
    // Ceremony (item 4): request (นักสืบในสำนวน — หลักหรือผู้ช่วย — หรือธุรการคดี) → ธุรการรับคำขอ
    // → ผอ. มอบหมาย (primary-reassign) → ส่งมอบงาน (คนเดิม) → รับมอบ (officer-accept เดิม)
    if (pendingStatusLabel) reassignment += `<p class="ws-policy-note a5-reassignment-status">${escapeHtml(pendingStatusLabel)}</p>`;
    if (has('reassignment-request')) reassignment += `<div class="ws-field"><label>เหตุผลขอเปลี่ยนผู้รับผิดชอบหลัก</label><textarea id="a5ReassignRequestReason"></textarea></div>${actionButton('reassignment-request')}`;
    if (has('reassignment-request-log')) reassignment += `<dl class="ws-readonly"><div><dt>ผู้ยื่นคำขอ</dt><dd>${escapeHtml(pending.requestedBy || '')}</dd></div><div><dt>เหตุผล</dt><dd>${escapeHtml(pending.reason || '')}</dd></div></dl>${actionButton('reassignment-request-log')}`;
    if (has('primary-reassign')) reassignment += `<div class="ws-grid-2"><div class="ws-field"><label>ผู้รับผิดชอบหลักคนใหม่</label><select id="a5PrimaryReassignTo"><option value="">เลือก</option>${MOCK_INVESTIGATOR_PROFILES.map(profile => `<option value="${profile.id}">${escapeHtml(profile.name)}</option>`).join('')}</select></div><div class="ws-field"><label>ผู้ช่วยหลังเปลี่ยน</label><input id="a5PrimaryReassignAssistants" value="${escapeHtml((state.assignment?.assistantOfficerIds || []).join(', '))}"></div><div class="ws-field"><label>เหตุผลเปลี่ยนผู้รับผิดชอบหลัก</label><input id="a5PrimaryReassignReason" value="${escapeHtml(pending.reason || '')}"></div></div>${actionButton('primary-reassign')}`;
    if (has('reassignment-handoff')) reassignment += `<div class="ws-field"><label>บันทึกส่งมอบงาน (เอกสาร/ความคืบหน้าที่ส่งต่อ)</label><textarea id="a5ReassignHandoffNote"></textarea></div>${actionButton('reassignment-handoff')}`;
    let panel = '';
    if (has('panel-change-draft')) panel = `<div class="ws-grid-2"><div class="ws-field"><label>เหตุผลปรับองค์คณะ</label><input id="a5PanelReason"></div><div class="ws-field"><label>องค์คณะที่เสนอ</label><input id="a5PanelMembers" placeholder="คั่นด้วยจุลภาค"></div></div>${actionButton('panel-change-draft')}`;
    if (has('panel-change-submit')) panel = `${actionButton('panel-change-submit')}<p class="ws-policy-note">การอนุมัติ ${a5RuleBadge('panel-change-authority')}</p><button type="button" class="ws-button secondary" data-a5-workflow-action="panel-change-approve" disabled>รอยืนยันผู้มีอำนาจอนุมัติ</button>`;
    const relationshipSummary = `<dl class="ws-readonly"><div><dt>สำนวนหลัก</dt><dd>${escapeHtml(admin.primaryCaseId || state.caseData?.id || '')}</dd></div><div><dt>สำนวนรองที่รวมแล้ว</dt><dd>${escapeHtml((admin.mergedCaseIds || []).join(', ') || 'ไม่มี')}</dd></div><div><dt>สำนวนที่แยก</dt><dd>${(admin.splitCases || []).length ? (admin.splitCases || []).map(id => `<span class="a5-rule-badge confirmed">${escapeHtml(id)}</span>`).join(' ') : 'ไม่มี'}</dd></div></dl>`;
    const mergeSplit = role === 'clerk' && !admin.lockedByMerge ? `<div class="ws-grid-2"><div class="ws-field"><label>รวมเข้าเลขสำนวนหลัก</label><input id="a5MergePrimaryId"><small>ระบบตรวจการมีอยู่และวงจรความสัมพันธ์ก่อนเขียน store</small><button type="button" class="ws-button secondary" data-a5-store-action="merge-case">รวมสำนวน</button></div><div class="ws-field"><label>หัวเรื่องที่แยก</label><input id="a5SplitSubject"><label>ข้อกล่าวหาเฉพาะ</label><textarea id="a5SplitAllegations"></textarea><label>ผู้ถูกกล่าวหาที่เลือก</label><textarea id="a5SplitAccused" placeholder="หนึ่งรายต่อหนึ่งบรรทัด"></textarea><label class="ws-choice"><input id="a5SplitBoardRequired" type="checkbox"><span><strong>กรณีนี้ต้องเสนอคณะกรรมการเห็นชอบก่อน</strong><small>${a5RuleBadge('split-case-board-approval')}</small></span></label><button type="button" class="ws-button secondary" data-a5-store-action="split-case">ออกเลขสำนวนใหม่และแยกสำนวน</button></div></div>` : '';
    const caseSizeLabels = { UNDETERMINED: 'ยังไม่กำหนด', S: 'เล็ก (S)', M: 'กลาง (M)', L: 'ใหญ่ (L)', XL: 'ใหญ่พิเศษ (XL)' };
    const componentOptions = [1, 2, 3, 4].map(value => `<option value="${value}">${value} คะแนน</option>`).join('');
    const comps = admin.caseSizeComponents || {};
    const computed = (typeof globalThis.ECMISActivity5Workflow?.computeCaseSizeA5 === 'function') ? globalThis.ECMISActivity5Workflow.computeCaseSizeA5(comps) : null;
    const scoreText = computed && (comps.position || comps.personsOrAllegations || comps.budgetOrDamage || comps.evidenceDifficulty) ? `คะแนนถ่วงน้ำหนัก ${computed.score} → แนะนำ ${computed.suggestion}` : 'ยังไม่ได้กรอกองค์ประกอบ';
    const hint = `<span class="a5-hint" title="ขนาดคดีคำนวณจาก 4 องค์ประกอบถ่วงน้ำหนัก (ตำแหน่ง 5% / จำนวนผู้ถูกกล่าวหาหรือข้อกล่าวหา 30% / งบประมาณหรือมูลค่าความเสียหาย 25% / ความยุ่งยากรวบรวมพยานหลักฐาน 40%) คะแนนรวม 1.00–2.75 = เล็ก (S), 2.76–3.50 = กลาง (M), 3.51–4.00 = ใหญ่ (L) — XL (ใหญ่พิเศษ) ต้องผ่านการอนุมัติตามลำดับชั้นถึง มติคณะกรรมการ ป.ป.ท. (กิจกรรมที่ 7)">?</span>`;
    const xlChainPending = admin.xlRequest?.status === 'PENDING';
    const xlBoardPending = admin.xlRequest?.status === 'PENDING_BOARD';
    const xlPending = xlChainPending || xlBoardPending;
    const xlStatusNote = xlBoardPending
      ? `สาย XL ภายในอนุมัติครบแล้ว (${escapeHtml((admin.xlRequest.approvals || []).map(item => item.step).join(' → '))}) → รอมติบอร์ด (กิจกรรมที่ 7) ยืนยัน (แสดงเป็น L ระหว่างรอ)`
      : `XL กำลังรออนุมัติ: ${escapeHtml((admin.xlRequest?.approvals || []).map(item => item.step).join(' → ') || 'ยังไม่มีขั้นที่อนุมัติ')} → รอขั้นต่อไป (แสดงเป็น L ระหว่างรอ)`;
    const caseSize = role === 'investigator' ? `<div class="ws-grid-2"><div class="ws-field"><label>ขนาดคดี${hint}</label><select id="a5CaseSize"><option value="UNDETERMINED" ${admin.caseSize === 'UNDETERMINED' ? 'selected' : ''}>ยังไม่กำหนด</option><option value="S" ${admin.caseSize === 'S' ? 'selected' : ''}>เล็ก (S)</option><option value="M" ${admin.caseSize === 'M' ? 'selected' : ''}>กลาง (M)</option><option value="L" ${admin.caseSize === 'L' && !xlPending ? 'selected' : ''}>ใหญ่ (L)</option><option value="XL" ${xlPending ? 'selected' : ''}>ใหญ่พิเศษ (XL) — ขออนุมัติผ่านสาย</option></select>${xlPending ? `<p class="ws-policy-note">${xlStatusNote}</p>` : ''}${admin.caseSize === 'XL' ? a5RuleBadge('xl-case-route') : ''}</div><div class="ws-field"><label>ตำแหน่งผู้ถูกกล่าวหา (คะแนน 1–4)</label><select id="a5SizePosition">${componentOptions}</select></div><div class="ws-field"><label>จำนวนผู้ถูกกล่าวหา/ข้อกล่าวหา (1–4)</label><select id="a5SizePersons">${componentOptions}</select></div><div class="ws-field"><label>งบประมาณ/มูลค่าความเสียหาย/ผลกระทบ (1–4)</label><select id="a5SizeBudget">${componentOptions}</select></div><div class="ws-field"><label>ความยุ่งยากรวบรวมพยานหลักฐาน/พยานบุคคล (1–4)</label><select id="a5SizeEvidence">${componentOptions}</select></div><div class="ws-field ws-field-full"><label>เหตุผล (บังคับเมื่อเลือก XL)</label><textarea id="a5SizeReason" placeholder="ระบุเหตุผลที่ขอขนาด XL เช่น คดีสำคัญ ความเสียหายร้ายแรง ประชาชนให้ความสนใจ">${escapeHtml(admin.xlRequest?.reason || '')}</textarea></div><div class="ws-field ws-field-full"><p class="ws-policy-note">${scoreText}</p></div></div>${actionButton('case-size-set')}` : `<p class="ws-policy-note">ขนาดคดี: <strong>${escapeHtml(caseSizeLabels[admin.caseSize] || 'ยังไม่กำหนด')}</strong>${admin.caseSize === 'XL' ? ` (${a5RuleBadge('xl-case-route')})` : xlPending ? ' — กำลังรออนุมัติ XL (แสดงเป็น L ระหว่างรอ)' : ''}</p>${xlPending ? `<p class="ws-policy-note">${xlStatusNote}${admin.xlRequest?.reason ? ` · เหตุผล: ${escapeHtml(admin.xlRequest.reason)}` : ''}</p>` : ''}`;
    const xlApprove = has('xl-approve') ? `<div class="ws-field"><label>ความเห็นอนุมัติ XL</label><textarea id="a5XlOpinion"></textarea></div>${actionButton('xl-approve')}` : '';
    const xlBoardConfirm = has('xl-board-confirm') ? `<div class="ws-grid-2"><div class="ws-field"><label>เลขที่มติบอร์ด (กิจกรรมที่ 7)</label><input id="a5XlBoardMtiNo" placeholder="เช่น 16/2568"></div><div class="ws-field"><label>วันที่มีมติ</label>${ThaiDatePicker.html('a5XlBoardMtiDate', { value: '', placeholder: 'เลือกวันที่มีมติ' })}</div><div class="ws-field"><label>วันที่ชี้แจงต่อบอร์ด</label><input id="a5XlPresentationDate" type="date"></div><div class="ws-field"><label>ผู้ชี้แจง</label><input id="a5XlPresenter" placeholder="ชื่อผู้ชี้แจง"></div><div class="ws-field ws-field-full"><label>สรุปผลการชี้แจง</label><textarea id="a5XlPresentationSummary" placeholder="สรุปผลการชี้แจงต่อบอร์ด"></textarea></div></div>${actionButton('xl-board-confirm')}` : '';
    return `<section class="ws-section a5-admin-operation"><h3>ส่งคืนผ่าน กบค.</h3>${routeForm}</section><section class="ws-section a5-admin-operation"><h3>บริหารทีมสำนวน</h3>${reassignment}<ol class="ws-history">${(state.assignmentHistory || []).filter(item => ['assign', 'team-update', 'primary-reassign'].includes(item.action)).map(item => `<li>${escapeHtml(`${item.action}: ${item.primaryOfficerId || ''} · ${item.reason || ''}`)}<time>${escapeHtml(item.at || '')}</time></li>`).join('') || '<li>ยังไม่มีประวัติ</li>'}</ol></section><section class="ws-section a5-admin-operation"><h3>ปรับองค์คณะ</h3>${panel || '<p class="ws-policy-note">ดูข้อมูลได้ ไม่มี action สำหรับบทบาทนี้</p>'}</section><section class="ws-section a5-admin-operation"><h3>ความสัมพันธ์และขนาดคดี</h3>${admin.lockedByMerge ? `<p class="a5-blocked-reason">สำนวนรองของ ${escapeHtml(admin.primaryCaseId)} — ถูกล็อกการแก้ไขและการค้นหาจะเปิดสำนวนหลัก</p>` : ''}${relationshipSummary}${mergeSplit}${caseSize}${xlApprove}${xlBoardConfirm}</section>`;
  }

  /* ---------- actions + editor select ---------- */
  function captureDetail(state, role) {
    const i = ensureInquiry(state);
    const v = id => $('#' + id)?.value?.trim() || '';
    const cb = id => Boolean($('#' + id)?.checked);
    if (state.workflow?.stage === 'a5-intake') {
      i.intake.unit = v('a5Unit') || i.intake.unit; i.intake.director = v('a5Director') || i.intake.director;
      i.intake.investigator = v('a5Investigator') || i.intake.investigator;
      i.intake.team = v('a5Team') ? v('a5Team').split(',').map(s => s.trim()).filter(Boolean) : i.intake.team;
      i.intake.orderNo = v('a5OrderNo') || i.intake.orderNo; i.intake.orderDate = v('a5OrderDate') || i.intake.orderDate;
      const m62 = i.intake.m62 || {};
      m62.flag = cb('a5M62Flag'); m62.sourceLetter = v('a5M62Letter'); m62.sourceMtiDate = v('a5M62Date'); m62.ageCheck = v('a5M62Age');
      if (m62.flag) state.caseData.decision = '62';
    }
    if (state.workflow?.stage === 'a5-prelim') {
      const plan = state.a5CasePlan;
      if (plan) {
        const setPlanValue = (path, value) => {
          const keys = String(path || '').split('.').filter(Boolean); let cursor = plan;
          keys.forEach((key, index) => { if (index === keys.length - 1) cursor[key] = value; else { const next = keys[index + 1]; if (cursor[key] == null) cursor[key] = /^\d+$/.test(next) ? [] : {}; cursor = cursor[key]; } });
        };
        $$('[data-a5-plan-bind]').forEach(input => setPlanValue(input.dataset.a5PlanBind, input.type === 'checkbox' ? input.checked : input.value.trim()));
        if (Array.isArray(plan.accusedRows)) plan.accusedRows = plan.accusedRows.filter(row => row && (row.name || (Array.isArray(row.fourIssues) && row.fourIssues.some(issue => issue?.details)) || (Array.isArray(row.requiredEvidenceActions) && row.requiredEvidenceActions.some(action => action?.requiredEvidence || action?.action)) || (row.tableRows && Object.values(row.tableRows).some(group => group?.checks?.some(Boolean)))));
        $$('[data-a5-plan-list]').forEach(input => {
          const key = input.dataset.a5PlanList;
          plan[key] = input.value.split('\n').map(value => value.trim()).filter(Boolean).map(value => (key === 'otherOperations' ? { description: value } : { name: value }));
        });
        const scheduleRowEls = $$('[data-a5-plan-row="scheduleRows"]');
        if (scheduleRowEls.length) {
          plan.scheduleRows = scheduleRowEls.map(row => {
            const entry = { rowId: row.dataset.a5PlanRowId || '' };
            $$('[data-a5-plan-row-field]', row).forEach(fieldEl => { entry[fieldEl.dataset.a5PlanRowField] = fieldEl.value.trim(); });
            return entry;
          }).filter(row => row.date || row.action);
        }
        (plan.limitationDates?.limitationRows || []).forEach(row => {
          const years = Number(row.years);
          row.expiresAt = row.years && Number.isFinite(years) ? addDays(plan.caseMetadata?.receivedAt, years * 365) : '';
        });
      }
      i.prelim.plan = v('a5Plan') || i.prelim.plan; i.prelim.workLog = v('a5WorkLog') || i.prelim.workLog;
      i.prelim.issues.status = v('a5Issue_status'); i.prelim.issues.authority = v('a5Issue_authority'); i.prelim.issues.action = v('a5Issue_action'); i.prelim.issues.damage = v('a5Issue_damage');
      i.prelim.evidence = v('a5A6') || i.prelim.evidence; i.prelim.searchWarrant = v('a5A9') || i.prelim.searchWarrant; i.prelim.report = v('a5PrelimReport') || i.prelim.report;
    }
    if (state.workflow?.stage === 'a5-inquiry') {
      i.inquiry644.plan = v('a5Plan644') || i.inquiry644.plan;
      i.inquiry644.accused = v('a5Accused') ? v('a5Accused').split('\n').map(s => s.trim()).filter(Boolean) : i.inquiry644.accused;
      i.inquiry644.allegations = v('a5Allegations') || i.inquiry644.allegations;
      i.inquiry644.noticeSentAt = v('a5NoticeDate') || i.inquiry644.noticeSentAt;
      i.inquiry644.witnesses = v('a5Witnesses') ? v('a5Witnesses').split(',').map(s => s.trim()).filter(Boolean) : i.inquiry644.witnesses;
      i.inquiry644.statements = v('a5Statements') || i.inquiry644.statements;
      i.inquiry644.witnessProtection = v('a5InqA6') || i.inquiry644.witnessProtection; i.inquiry644.searchWarrant = v('a5InqA9') || i.inquiry644.searchWarrant;
      i.inquiry644.report = v('a5InqReport') || i.inquiry644.report;
    }
    if (state.workflow?.stage === 'a5-outcome') {
      i.outcome.letters = v('a5OutLetters') || i.outcome.letters; i.outcome.prosecutor = v('a5OutProsecutor') || i.outcome.prosecutor;
      i.outcome.disciplineAgency = v('a5OutDiscipline') || i.outcome.disciplineAgency; i.outcome.followup = v('a5OutFollowup') || i.outcome.followup;
      const m62 = i.intake.m62 || {};
      m62.report65Letter = v('a5M62Report'); m62.report65Date = v('a5M62ReportDate');
    }
    if (state.workflow?.stage === 'a5-prosecutor') {
      i.prosecutor = i.prosecutor || {};
      i.prosecutor.orderType = v('a5ProsecutorOrder') || i.prosecutor.orderType; i.prosecutor.orderDetail = v('a5ProsecutorDetail') || i.prosecutor.orderDetail; i.prosecutor.letters = v('a5ProsecutorLetters') || i.prosecutor.letters;
    }
    if (state.caseData?.decision === '58/2' || i.special?.type) {
      i.special = i.special || {};
      i.special.type = v('a5SpecialType') || i.special.type; i.special.assignee = v('a5SpecialAssignee') || i.special.assignee;
      i.special.agency = v('a5SpecialAgency') || i.special.agency; i.special.reportedAt = v('a5SpecialDate') || i.special.reportedAt; i.special.result = v('a5SpecialResult') || i.special.result;
    }
    return state;
  }
  function editorForA5(state, role) {
    const stage = state.workflow?.stage || '';
    if (state.caseData?.decision === '58/2') return specialEditor(state, role);
    switch (stage) {
      case 'a5-intake': return intakeEditor(state, role);
      case 'a5-prelim': return prelimEditor(state, role);
      case 'a5-prelim-review': return prelimReviewEditor(state, role);
      case 'a7-213': return committee213Editor(state, role);
      case 'a5-inquiry': return inquiryEditor(state, role);
      case 'a5-inquiry-review': return inquiryReviewEditor(state, role);
      case 'a7-644': return committee644Editor(state, role);
      case 'a5-outcome': return outcomeEditor(state, role);
      // 'a5-prosecutor' intentionally omitted (Phase 10, item 1) — the canonical
      // prosecutor-* downstream chain always supplies operationTask.body for this
      // stage in caseDetailShellA5, so this case is unreachable; falls to default.
      case 'closed': return `<section class="ws-section"><div class="ws-callout">สำนวนปิดแล้ว — ${escapeHtml(state.inquiry?.outcome?.closedBy || '')} ${escapeHtml(state.inquiry?.outcome?.closedAt || '')}</div>${state.inquiry?.intake?.m62?.recalled ? '<p class="ws-policy-note">ป.ป.ช. เรียกสำนวนกลับไปดำเนินการเอง</p>' : ''}</section>`;
      default: return `<section class="ws-section"><div class="ws-callout">เฟส ${escapeHtml(stage)} — กำลังดำเนินการ</div></section>`;
    }
  }
  function actionsForA5(state, role) {
    const stage = state.workflow?.stage || '';
    if (state.caseData?.decision === '58/2') return '<button class="ws-button primary" data-a5-action="special-save">บันทึกผลการตรวจสอบ</button>';
    const reset = '<button class="ws-button ghost" data-a5-action="back">กลับรายการ</button>';
    const adminActionIds = new Set(['return-request', 'return-approve', 'return-dispatch', 'gbk-receive', 'gbk-reroute', 'destination-receive', 'team-update', 'primary-reassign', 'panel-change-draft', 'panel-change-submit', 'case-size-set']);
    const account = currentA5Account();
    const workflowActions = (globalThis.ECMISActivity5Workflow?.getA5AvailableActions(state, role) || []).filter(action => !adminActionIds.has(action.id) && (action.id !== 'officer-accept' || account?.officerId === state.assignment?.primaryOfficerId));
    const workflowMarkup = workflowActions.map(action => `<button type="button" class="ws-button ${action.primary ? 'primary' : 'secondary'}" data-a5-workflow-action="${action.id}">${escapeHtml(action.label)}</button>`).join('');
    const processState = state.workflow?.a5Status || '';
    const acceptancePending = role === 'investigator' && state.assignment?.primaryOfficerId && Number(state.assignment?.acceptedAssignmentVersion || 0) !== Number(state.assignment?.assignmentVersion || 0);
    if (acceptancePending) return `${reset}${workflowMarkup}`;
    if (stage === 'a5-intake') return `${reset}${workflowMarkup}`;
    if (['PLAN_DRAFT', 'PLAN_RETURNED', 'PLAN_SUBMITTED', 'AMENDMENT_DRAFT', 'AMENDMENT_RETURNED', 'AMENDMENT_SUBMITTED'].includes(processState)) return `${reset}<button class="ws-button secondary" data-a5-action="${stage === 'a5-inquiry' ? 'inquiry-save' : 'prelim-save'}">บันทึกร่าง</button>${workflowMarkup}`;
    const approvedPlanTools = ['PLAN_APPROVED', 'AMENDMENT_APPROVED'].includes(processState) ? workflowMarkup.replace('ws-button primary', 'ws-button secondary') : '';
    switch (stage) {
      case 'a5-intake': return `${reset}<button class="ws-button primary" data-a5-action="accept-case">รับสำนวนและมอบหมายนักสืบ</button>`;
      case 'a5-prelim': return `${reset}<button class="ws-button secondary" data-a5-action="prelim-save">บันทึกร่าง</button>${approvedPlanTools}<span class="ws-policy-note">รอเปิดขั้นตอนเสนอรายงานฉบับมีโครงสร้าง</span>`;
      case 'a5-prelim-review': return `${reset}<button class="ws-button secondary" data-a5-action="chain-return">ส่งกลับแก้ไข</button>${state.inquiry?.prelim?.supportPending ? '<button class="ws-button primary" data-a5-action="support-record">รับทราบความเห็นอนุฯ — เสนอ คกก.</button>' : ''}`;
      case 'a7-213': {
        const late = Boolean((state.inquiry?.extensionLateReports || []).find(item => item.reportType === '213'));
        return late ? `${reset}<button class="ws-button secondary" disabled title="รอ source ยืนยันกลไกหลังคณะกรรมการรับรายงาน">รอแนวทางจากคณะกรรมการ</button>` : `${reset}<button class="ws-button primary" data-a5-action="mti213-decide">บันทึกมติ คกก.</button>`;
      }
      case 'a5-inquiry': return `${reset}<button class="ws-button secondary" data-a5-action="inquiry-save">บันทึกร่าง</button>${approvedPlanTools}${role === 'investigator' ? '<button class="ws-button primary" data-a5-action="inquiry-submit">เสนอรายงาน 644 ตามลำดับชั้น</button>' : ''}`;
      case 'a5-inquiry-review': return `${reset}<button class="ws-button secondary" data-a5-action="chain-return">ส่งกลับแก้ไข</button>${state.inquiry?.inquiry644?.supportPending ? '<button class="ws-button primary" data-a5-action="support-record">รับทราบความเห็นอนุฯ — เสนอ คกก.</button>' : ''}`;
      case 'a7-644': {
        const late = Boolean((state.inquiry?.extensionLateReports || []).find(item => item.reportType === '644'));
        return late ? `${reset}<button class="ws-button secondary" disabled title="รอ source ยืนยันครั้งที่ 5 จำนวนวัน และผู้มีอำนาจ">รอ owner decision เรื่องขั้นตอนพิเศษ</button>` : `${reset}<button class="ws-button primary" data-a5-action="mti644-decide">บันทึกมติชี้มูล คกก.</button>`;
      }
      case 'a5-outcome': return `${reset}<button class="ws-button secondary" data-a5-action="outcome-save">บันทึกการดำเนินการ</button>${state.inquiry?.intake?.m62?.flag ? '<button class="ws-button secondary" data-a5-action="m62-report">รายงานผลกลับ ป.ป.ช. (ม.65)</button>' : ''}${state.inquiry?.intake?.m62?.report65Letter ? '<button class="ws-button danger" data-a5-action="m62-recall">ป.ป.ช. เรียกสำนวนกลับ</button>' : ''}<button class="ws-button primary" data-a5-action="close-case">ปิดสำนวน</button>`;
      // 'a5-prosecutor' intentionally omitted (Phase 10, item 1) — see renderStageEditor.
      case 'closed': return `${reset}<button class="ws-button secondary" data-a5-action="reopen">เปิดสำนวนใหม่ (ทบทวนมติ)</button>`;
      default: return reset;
    }
  }

  function onePrimaryActionMarkup(markup) {
    let found = false;
    return String(markup || '').replace(/class="ws-button primary"/g, () => {
      if (found) return 'class="ws-button secondary"';
      found = true;
      return 'class="ws-button primary"';
    });
  }
  function resolveA5CaseId(store, caseId) {
    const seen = new Set();
    let current = String(caseId || '');
    while (store?.[current]?.caseAdministration?.lockedByMerge && store[current].caseAdministration.primaryCaseId) {
      if (seen.has(current)) return null;
      seen.add(current);
      current = String(store[current].caseAdministration.primaryCaseId);
    }
    return store?.[current] ? current : null;
  }
  function executeA5StoreAction(sourceStore, caseId, role, actionId, payload = {}) {
    if (role !== 'clerk') return { ok: false, code: 'ACTOR_MISMATCH', store: sourceStore };
    const workflowApi = globalThis.ECMISActivity5Workflow;
    const store = JSON.parse(JSON.stringify(sourceStore || {}));
    const source = store[caseId];
    if (!source) return { ok: false, code: 'RELATED_CASE_NOT_FOUND', store: sourceStore };
    const normalizedSource = workflowApi?.normalizeA5State(source) || source;
    if (normalizedSource.caseAdministration?.lockedByMerge) return { ok: false, code: 'CASE_LOCKED_BY_MERGE', store: sourceStore };
    if (actionId === 'merge-case') {
      const primaryId = String(payload.primaryCaseId || '').trim();
      if (!primaryId || !store[primaryId]) return { ok: false, code: 'RELATED_CASE_NOT_FOUND', store: sourceStore };
      if (primaryId === caseId) return { ok: false, code: 'MERGE_CYCLE', store: sourceStore };
      let cursor = primaryId;
      const seen = new Set([caseId]);
      while (cursor) {
        if (seen.has(cursor)) return { ok: false, code: 'MERGE_CYCLE', store: sourceStore };
        seen.add(cursor);
        cursor = store[cursor]?.caseAdministration?.primaryCaseId || '';
      }
      const primary = workflowApi?.normalizeA5State(store[primaryId]) || store[primaryId];
      primary.caseAdministration.mergedCaseIds = [...new Set([...(primary.caseAdministration.mergedCaseIds || []), caseId])];
      normalizedSource.caseAdministration.primaryCaseId = primaryId;
      normalizedSource.caseAdministration.lockedByMerge = true;
      normalizedSource.workflow.locked = true;
      const at = String(payload.at || new Date().toISOString());
      primary.decisionHistory.push({ text: `รวมสำนวน ${caseId} เข้าเป็นสำนวนรอง`, time: at, by: String(payload.actorName || '') });
      normalizedSource.decisionHistory.push({ text: `รวมเข้าเป็นสำนวนรองของ ${primaryId}`, time: at, by: String(payload.actorName || '') });
      store[primaryId] = primary;
      store[caseId] = normalizedSource;
      return { ok: true, code: 'MERGED', store, primaryId };
    }
    if (actionId === 'split-case') {
      if (payload.boardApprovalRequired === true) return { ok: false, code: 'PENDING_CONFIRMATION', store: sourceStore, rule: globalThis.ECMISActivity5Rules?.getA5Rule('split-case-board-approval') || null };
      const selected = payload.selected && typeof payload.selected === 'object' ? payload.selected : {};
      if (!String(selected.subject || '').trim()) return { ok: false, code: 'MISSING_REQUIRED_FIELD', errors: ['selected.subject'], store: sourceStore };
      // Authoritative register (Phase 10, item 3): same guarded sequential-issuance
      // pattern as issueOrderNo213 — a real ปีพุทธศักราช-scoped running number, not a
      // string derived from the parent case ID. Collision retry is defensive only;
      // the underlying localStorage sequence already guarantees uniqueness per year.
      let childId = issueSplitCaseId();
      for (let guard = 0; store[childId] && guard < 50; guard += 1) childId = issueSplitCaseId();
      if (store[childId]) return { ok: false, code: 'CASE_ID_COLLISION', store: sourceStore };
      const child = {
        caseData: { id: childId, subject: String(selected.subject), region: source.caseData?.region || '', channel: source.caseData?.channel || '' },
        documentData: { documentSubject: String(selected.subject), decision: source.documentData?.decision || '' },
        workflow: { stage: 'a5-intake', status: 'สำนวนแยกใหม่ — รอตรวจรับ', a5Status: 'PENDING_INTAKE_CHECK', owner: 'clerk', complete: false },
        inquiry: defaultInquiry({ caseData: { id: childId, region: source.caseData?.region || '' } }),
        caseAdministration: { sourceCaseId: caseId, caseSize: 'UNDETERMINED' },
        decisionHistory: [{ text: `แยกจากสำนวน ${caseId} — ออกเลขสำนวนใหม่ ${childId}`, time: String(payload.at || new Date().toISOString()), by: String(payload.actorName || '') }]
      };
      child.inquiry.inquiry644.allegations = String(selected.allegations || '');
      child.inquiry.inquiry644.accused = Array.isArray(selected.accused) ? selected.accused.map(String) : [];
      normalizedSource.caseAdministration.splitCases = [...(normalizedSource.caseAdministration.splitCases || []), childId];
      normalizedSource.decisionHistory.push({ text: `แยกสำนวนใหม่ ${childId}`, time: String(payload.at || new Date().toISOString()), by: String(payload.actorName || '') });
      store[caseId] = normalizedSource;
      store[childId] = workflowApi?.normalizeA5State(child) || child;
      return { ok: true, code: 'SPLIT', store, childId };
    }
    return { ok: false, code: 'INVALID_TRANSITION', store: sourceStore };
  }
  function nextA5TabIndex(currentIndex, length, key) {
    if (!Number.isInteger(currentIndex) || length < 1) return currentIndex;
    if (key === 'ArrowRight') return (currentIndex + 1) % length;
    if (key === 'ArrowLeft') return (currentIndex - 1 + length) % length;
    if (key === 'Home') return 0;
    if (key === 'End') return length - 1;
    return currentIndex;
  }
  function bindA5Tablist(tablist) {
    if (!tablist) return;
    tablist.addEventListener('keydown', event => {
      const tabs = $$('[role="tab"]', tablist);
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = tabs[nextA5TabIndex(currentIndex, tabs.length, event.key)];
      const nextId = next?.id;
      next?.focus();
      next?.click();
      if (nextId) requestAnimationFrame(() => document.getElementById(nextId)?.focus());
    });
  }
  function clampA5FloatingPosition(x, y, viewportWidth, viewportHeight, elementWidth, elementHeight) {
    const gutter = 8;
    const maxX = Math.max(gutter, viewportWidth - elementWidth - gutter);
    const maxY = Math.max(gutter, viewportHeight - elementHeight - gutter);
    return {
      x: Math.max(gutter, Math.min(Number(x) || 0, maxX)),
      y: Math.max(gutter, Math.min(Number(y) || 0, maxY))
    };
  }
  function historyPanelA5(state) {
    const decisions = (state.decisionHistory || []).map(item => `<li><span>${escapeHtml(item.text || '')}</span><time>${escapeHtml(item.time || item.at || '')}</time></li>`).join('');
    const assignments = (state.assignmentHistory || []).map(item => `<li><span>${escapeHtml(`${item.action || ''} ${item.officer || item.newOfficer || ''}`.trim())}</span><time>${escapeHtml(item.at || item.time || '')}</time></li>`).join('');
    const publicUpdates = (state.inquiry?.publicUpdates || []).map(item => `<li><span>${escapeHtml(item.text || '')}</span><time>${escapeHtml(item.at || '')}</time></li>`).join('');
    return `<ol class="a5-history-timeline">${decisions}${assignments}${publicUpdates || ''}${decisions || assignments || publicUpdates ? '' : '<li><span>ยังไม่มีประวัติ</span></li>'}</ol>`;
  }
  function documentListA5(state) {
    return `<ul class="a5-document-list">${documentTabItemsA5(state).map(([key, label]) => `<li><div><strong>${escapeHtml(label)}</strong><small>เปิดดู แก้ไข และพิมพ์จากข้อมูลสำนวนปัจจุบัน</small></div><button type="button" class="ws-button secondary" data-a5-open-doc="${key}">เปิดเอกสาร</button></li>`).join('')}</ul>`;
  }
  function documentEditToolbarA5() {
    return `<div class="doc-edit-bar" id="a5DocEditBar" aria-label="จัดรูปแบบข้อความ"><select class="doc-edit-font" data-format="fontName" title="ฟอนต์"><option value="">ฟอนต์</option><option>Sarabun</option><option>TH Sarabun New</option><option>Tahoma</option><option>Times New Roman</option><option>Angsana New</option></select><select class="doc-edit-size" data-format="fontSize" title="ขนาดตัวอักษร"><option value="">ขนาด</option><option value="3">16</option><option value="4">18</option><option value="5">20</option><option value="6">24</option><option value="7">32</option></select><span class="doc-edit-bar-sep"></span><button type="button" data-format="bold" title="ตัวหนา"><b>B</b></button><button type="button" data-format="italic" title="ตัวเอียง"><i>I</i></button><button type="button" data-format="underline" title="ขีดเส้นใต้"><u>U</u></button><span class="doc-edit-bar-sep"></span><label class="doc-edit-color" title="สีตัวอักษร"><input type="color" data-format="foreColor" value="#17232e"></label><span class="doc-edit-bar-sep"></span><button type="button" data-format="justifyLeft" title="ชิดซ้าย">ซ้าย</button><button type="button" data-format="justifyCenter" title="กึ่งกลาง">กลาง</button><button type="button" data-format="justifyRight" title="ชิดขวา">ขวา</button><span class="doc-edit-bar-sep"></span><button type="button" data-format="insertUnorderedList" title="รายการหัวข้อ">•≡</button><button type="button" data-format="insertOrderedList" title="รายการลำดับเลข">1≡</button><span class="doc-edit-bar-sep"></span><button type="button" data-format="outdent" title="ลดย่อหน้า">⤺</button><button type="button" data-format="indent" title="เพิ่มย่อหน้า">⤻</button><button type="button" data-format="undo" title="เลิกทำ">↶</button><button type="button" data-format="redo" title="ทำซ้ำ">↷</button><span class="doc-edit-bar-tip">แก้ไขเฉพาะช่องข้อมูล</span></div>`;
  }
  function documentViewerA5(state, selectedDocument) {
    const selected = documentTabItemsA5(state).some(([key]) => key === selectedDocument) ? selectedDocument : 'plan';
    const options = documentTabItemsA5(state).map(([key, label]) => `<option value="${key}"${key === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    return `<aside class="ws-doc-pane" id="a5DocumentPane" aria-label="เอกสารประกอบสำนวน"><div class="ws-doc-toolbar"><div class="ws-doc-tabs" role="tablist" aria-label="เลือกเอกสาร">${docTabsA5(state, selected)}</div><label class="ws-doc-jump" title="ข้ามไปยังเอกสาร"><span aria-hidden="true">ไปที่</span><select id="a5DocJump" aria-label="เลือกเอกสาร">${options}</select></label><button type="button" class="ws-button secondary" data-a5-action="print">พิมพ์/PDF</button><button type="button" class="ws-button secondary ws-doc-pane-toggle" title="ย่อแผงเอกสาร" aria-label="ย่อแผงเอกสาร" aria-controls="a5DocumentPane" aria-expanded="true">»</button></div><button type="button" class="ws-doc-pane-rail" title="ขยายแผงเอกสาร" aria-label="ขยายแผงเอกสาร" aria-controls="a5DocumentPane" aria-expanded="false">«<span>เอกสาร</span></button>${documentEditToolbarA5()}<div class="a5-doc-edit-actions" id="a5DocEditActions" hidden><span id="a5DocSaveStatus" role="status" aria-live="polite">บันทึกแล้ว</span><button type="button" class="ws-button secondary" id="a5DocCancel">ยกเลิกการแก้ไข</button><button type="button" class="ws-button primary" id="a5DocSave">บันทึกเอกสาร</button></div><button type="button" class="doc-edit-fab" id="a5DocEditFab" title="แก้ไขเอกสาร"><span class="doc-edit-fab-icon" aria-hidden="true">✎</span><span class="doc-edit-fab-label">แก้ไขเอกสาร</span></button><div class="ws-paper-stage" id="a5-document-panel" role="tabpanel" aria-labelledby="a5-doc-tab-${selected}"><div id="a5PaperStage">${paperForTab(state, selected)}</div></div></aside>`;
  }
  function readOnlyInboundDocumentHtml(html) {
    return String(html || '')
      .replace(/\scontenteditable(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, ' contenteditable="false"')
      .replace(/<(input|select|textarea|button)\b(?![^>]*\bdisabled\b)/gi, '<$1 disabled');
  }
  function inboundDocumentItemsA5(state) {
    const manifest = state.inboundDocumentManifest || globalThis.ECMISActivity5Handoff?.buildInboundDocumentManifest?.(state) || {};
    const documents = Array.isArray(manifest.documents) ? manifest.documents : [];
    const expected = Array.isArray(manifest.expectedDocuments) ? manifest.expectedDocuments : [];
    const attachments = Array.isArray(manifest.attachments) ? manifest.attachments : [];
    const proof = manifest.dispatchProof;
    const expectedIds = new Set(expected.map(item => item.documentId));
    const signedById = new Map(documents.map((item, index) => [item.documentId, { item, index }]));
    const items = expected.map((expectedItem, index) => {
      const signed = signedById.get(expectedItem.documentId);
      return signed
        ? { key: `a4-signed-${signed.index}`, label: signed.item.label || expectedItem.label || signed.item.documentId || `เอกสารฉบับลงนาม ${signed.index + 1}`, kind: 'signed', item: signed.item }
        : { key: `a4-missing-${index}`, label: expectedItem.label || expectedItem.documentId || 'เอกสารที่ยังไม่ได้รับ', kind: 'missing', item: expectedItem };
    });
    documents.forEach((item, index) => {
      if (!expectedIds.has(item.documentId)) items.push({ key: `a4-signed-${index}`, label: item.label || item.documentId || `เอกสารฉบับลงนาม ${index + 1}`, kind: 'signed', item });
    });
    attachments.forEach((item, index) => items.push({ key: `a4-attachment-${index}`, label: item.name || `เอกสารแนบ ${index + 1}`, kind: 'attachment', item }));
    if (proof) items.push({ key: 'a4-dispatch-proof', label: proof.name || 'หลักฐานการจัดส่ง', kind: 'proof', item: proof });
    if (!items.length) items.push({ key: 'a4-empty', label: 'ไม่พบเอกสารรับเข้า', kind: 'empty', item: {} });
    return { manifest, items };
  }
  function extensionTypeForReportA5(reportType) {
    return reportType === '213' ? 'PRELIMINARY_INQUIRY' : 'FULL_INQUIRY';
  }
  function ensureExtensionDeadlineBasisA5(state, reportType) {
    const rules = globalThis.ECMISActivity5ExtensionRules;
    const extensionType = extensionTypeForReportA5(reportType);
    const rep = reportOf(reportType, state.inquiry);
    const derived = rules?.deriveDeadlineBasis?.({
      extensionType,
      receivedFirstAt: state.inquiry?.intake?.receivedFirstAt,
      orderType: state.inquiry?.committee213?.orderType,
      boardResolutionAt: state.inquiry?.committee213?.mtiDate,
      secretaryOrderSignedAt: state.inquiry?.committee213?.orderDate
    });
    if (!derived?.ok) {
      rep.extensionMigration = { status: 'BLOCKED', code: derived?.code || 'DEADLINE_BASIS_MISSING' };
      return derived || { ok: false, code: 'DEADLINE_BASIS_MISSING', errors: [] };
    }
    if (rep.deadlineBasis && JSON.stringify(rep.deadlineBasis) !== JSON.stringify(derived.result.deadlineBasis)) {
      rep.extensionMigration = { status: 'BLOCKED', code: 'DEADLINE_BASIS_CONFLICT' };
      return { ok: false, code: 'DEADLINE_BASIS_CONFLICT', errors: [] };
    }
    if (!rep.deadlineBasis) rep.deadlineBasis = JSON.parse(JSON.stringify(derived.result.deadlineBasis));
    if (!rep.deadlineAt) rep.deadlineAt = derived.result.initialDeadline;
    const approvedCount = (Array.isArray(rep.extensionHistory) ? rep.extensionHistory : []).filter(item => item?.status === 'APPROVED').length;
    if (!Number.isInteger(rep.deadlineVersion) || rep.deadlineVersion < 1) rep.deadlineVersion = 1 + approvedCount;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(rep.deadlineAt || ''))) {
      rep.extensionMigration = { status: 'BLOCKED', code: 'DEADLINE_UNKNOWN' };
      return { ok: false, code: 'DEADLINE_UNKNOWN', errors: [] };
    }
    delete rep.extensionMigration;
    return { ok: true, result: { deadlineBasis: rep.deadlineBasis, deadlineVersion: rep.deadlineVersion, currentDeadline: rep.deadlineAt } };
  }
  function ensureExtensionAuthorityRegistryA5(state) {
    if (state.inquiry.extensionAuthorityRegistry?.schemaVersion === 1) return state.inquiry.extensionAuthorityRegistry;
    const unitKey = String(state.inquiry?.intake?.unit || state.caseData?.region || '').trim();
    if (!globalThis.ECMISCurrentAccount) {
      const mock = globalThis.ECMISActivity5ExtensionAuthority?.createMockAuthorityRegistry?.({
        unitKey,
        effectiveFrom: todayISO()
      });
      if (mock?.ok) state.inquiry.extensionAuthorityRegistry = JSON.parse(JSON.stringify(mock.result));
    }
    if (!state.inquiry.extensionAuthorityRegistry) {
      state.inquiry.extensionAuthorityRegistry = { schemaVersion: 1, version: 1, assignments: [] };
    }
    return state.inquiry.extensionAuthorityRegistry;
  }
  function lateReportRoutingA5(state) {
    const registry = ensureExtensionAuthorityRegistryA5(state);
    const unitKey = String(state.inquiry?.intake?.unit || state.caseData?.region || '').trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-+|-+$/g, '');
    const steps = [];
    for (const [tier, required] of [['GROUP_DIRECTOR', false], ['UNIT_DIRECTOR', true], ['SUPERVISING_EXECUTIVE', true], ['SECRETARY_GENERAL_PERSONAL', true]]) {
      const matches = (registry.assignments || []).filter(item => item.unitKey === unitKey && item.authorityTier === tier && item.status === 'ACTIVE');
      if (matches.length !== 1) {
        if (!required && matches.length === 0) continue;
        return { ok: false, code: 'LATE_REPORT_ROUTING_UNRESOLVED' };
      }
      const assignment = matches[0];
      if (tier === 'SECRETARY_GENERAL_PERSONAL' && (assignment.source !== 'STATE_ASSIGNMENT' || assignment.actingForTier)) return { ok: false, code: 'SECRETARY_PERSONAL_CONFIRMATION_REQUIRED' };
      steps.push({ tier, required, contract: { reviewerId: assignment.actorId, reviewerRole: assignment.actorRole, assignmentId: assignment.assignmentId, assignmentVersion: Number(registry.version), source: assignment.source, actingForTier: assignment.actingForTier || null } });
    }
    return { ok: true, routing: { steps, registryVersion: Number(registry.version) } };
  }
  function currentA5ActorForAuthority(state, role, contract) {
    const account = globalThis.ECMISCurrentAccount;
    if (account?.officerId) return { actorId: String(account.officerId), actorRole: role };
    return { actorId: String(contract?.reviewerId || ''), actorRole: role };
  }
  function extensionOrdinalA5(state, reportType) {
    const history = reportOf(reportType, state.inquiry)?.extensionHistory;
    const entries = Array.isArray(history) ? history : [];
    const highestRecordedOrdinal = entries.reduce((highest, item, index) => {
      const recorded = Number(item?.round);
      return Math.max(highest, Number.isInteger(recorded) && recorded > 0 ? recorded : index + 1);
    }, 0);
    return highestRecordedOrdinal + 1;
  }
  function extensionOwnerA5(state, role) {
    if (role !== 'investigator') return { ok: false, message: 'ผู้รับผิดชอบหลักของสำนวนเท่านั้นที่จัดทำคำขอขยายเวลาได้' };
    const account = currentA5Account();
    const assignment = state.assignment || {};
    const primaryOfficerId = String(assignment.primaryOfficerId || '').trim();
    const assignmentVersion = Number(assignment.assignmentVersion);
    const acceptedAssignmentVersion = Number(assignment.acceptedAssignmentVersion);
    if (!account?.officerId) return { ok: false, message: 'ไม่พบบัญชีผู้ใช้งานปัจจุบัน กรุณาเข้าสู่ระบบใหม่' };
    if (!primaryOfficerId) return { ok: false, message: 'ไม่พบผู้รับผิดชอบหลักของสำนวน กรุณาตรวจข้อมูลมอบหมาย' };
    if (String(account.officerId) !== primaryOfficerId) return { ok: false, message: 'บัญชีปัจจุบันไม่ใช่ผู้รับผิดชอบหลักของสำนวน' };
    if (!Number.isInteger(assignmentVersion) || assignmentVersion < 1 || acceptedAssignmentVersion !== assignmentVersion) {
      return { ok: false, message: 'ผู้รับผิดชอบหลักยังไม่ได้รับมอบหมายเวอร์ชันปัจจุบัน' };
    }
    return {
      ok: true,
      id: primaryOfficerId,
      name: String(account.name || assignment.acceptedBy || primaryOfficerId),
      assignmentVersion,
      acceptedAssignmentVersion
    };
  }
  function extensionCreatedAtA5(value) {
    const text = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return text;
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T00:00:00+07:00`;
    return new Date().toISOString();
  }
  function legacyExtensionRepositoryA5(state, reportType) {
    const c = state.caseData || {}, i = state.inquiry || {}, rep = reportOf(reportType, i) || {};
    const manifest = state.inboundDocumentManifest || globalThis.ECMISActivity5Handoff?.buildInboundDocumentManifest?.(state) || {};
    const repository = [];
    const baseCreatedAt = extensionCreatedAtA5(rep.startedAt || i.intake?.receivedFirstAt);
    const previewSnapshot = { reportType, plan: String(rep.plan || ''), workLog: String(rep.workLog || '') };
    if (previewSnapshot.plan.trim()) repository.push({ artifactId: `${c.id}-${reportType}-case-plan`, versionId: `${c.id}-${reportType}-case-plan-v1`, version: 1, name: `แผนงานคดี ${reportType}`, documentType: 'CASE_PLAN', source: 'SYSTEM', documentNumber: '', reference: c.id || '', createdAt: baseCreatedAt, availability: 'AVAILABLE', binaryPersisted: false, previewDocument: 'plan', previewReportType: reportType, previewSourceField: 'plan', previewSnapshot: { ...previewSnapshot } });
    if (previewSnapshot.workLog.trim()) repository.push({ artifactId: `${c.id}-${reportType}-work-log`, versionId: `${c.id}-${reportType}-work-log-v1`, version: 1, name: `บันทึกการปฏิบัติงาน ${reportType}`, documentType: 'WORK_LOG', source: 'SYSTEM', documentNumber: '', reference: c.id || '', createdAt: baseCreatedAt, availability: 'AVAILABLE', binaryPersisted: false, previewDocument: 'plan', previewReportType: reportType, previewSourceField: 'workLog', previewSnapshot: { ...previewSnapshot } });
    (manifest.documents || []).forEach((documentItem, index) => {
      const artifactId = `${c.id}-a4-${documentItem.documentId || index + 1}`;
      repository.push({ artifactId, versionId: `${artifactId}-v${manifest.signedVersion || 1}`, version: manifest.signedVersion || 1, name: documentItem.label || documentItem.documentId || `เอกสารรับเข้า ${index + 1}`, documentType: 'เอกสารรับเข้า', source: 'A4_HANDOFF', documentNumber: documentItem.documentId || '', reference: c.id || '', createdAt: extensionCreatedAtA5(manifest.signedAt), availability: documentItem.html ? 'AVAILABLE' : 'REFERENCE_ONLY', binaryPersisted: false, sourceDocumentId: documentItem.documentId || '' });
    });
    (manifest.attachments || []).forEach((attachment, index) => {
      const artifactId = `${c.id}-a4-attachment-${index + 1}`;
      repository.push({ artifactId, versionId: `${artifactId}-v1`, version: 1, name: attachment.name || `เอกสารแนบ ${index + 1}`, documentType: attachment.type || 'เอกสารแนบ', source: 'A4_HANDOFF', documentNumber: '', reference: c.id || '', createdAt: extensionCreatedAtA5(manifest.signedAt), availability: 'REFERENCE_ONLY', binaryPersisted: false, pages: attachment.pages, size: attachment.size, description: attachment.description });
    });
    if (manifest.dispatchProof) {
      const artifactId = `${c.id}-a4-dispatch-proof`;
      repository.push({ artifactId, versionId: `${artifactId}-v1`, version: 1, name: manifest.dispatchProof.name || 'หลักฐานการจัดส่ง', documentType: 'หลักฐานการจัดส่ง', source: 'A4_HANDOFF', documentNumber: manifest.dispatchProof.trackingNo || '', reference: c.id || '', createdAt: extensionCreatedAtA5(manifest.dispatchProof.sentDate || manifest.signedAt), availability: 'REFERENCE_ONLY', binaryPersisted: false });
    }
    if (reportType === '644' && i.committee213?.orderNo) {
      const artifactId = `${c.id}-inquiry-appointment-order`;
      repository.push({ artifactId, versionId: `${artifactId}-v1`, version: 1, name: `คำสั่งแต่งตั้ง ${i.committee213.orderNo}`, documentType: 'INQUIRY_APPOINTMENT_ORDER', source: 'SYSTEM', documentNumber: i.committee213.orderNo, reference: c.id || '', createdAt: extensionCreatedAtA5(i.committee213.orderDate), availability: 'REFERENCE_ONLY', binaryPersisted: false });
    }
    return repository;
  }
  function extensionRepositoryA5(state, reportType) {
    const built = globalThis.ECMISActivity5ExtensionDocuments?.buildExtensionRepository?.({ state, reportType });
    return built?.ok ? built.result : [];
  }
  globalThis.ECMISActivity5EvidenceRepository = extensionRepositoryA5;
  function extensionFormPreviewA5(state, workspaceModel) {
    const previewState = JSON.parse(JSON.stringify(state || {}));
    ensureInquiry(previewState);
    const reportType = workspaceModel?.context?.reportType === '213' ? '213' : '644';
    const rep = reportOf(reportType, previewState.inquiry);
    const revision = workspaceModel?.requestState?.revisions?.find(item => item?.revisionNo === workspaceModel.requestState.activeRevisionNo);
    const payload = { ...(revision?.draftPayload || {}), ...(workspaceModel?.ui?.pendingPatch || {}) };
    rep.extensionHistory = (rep.extensionHistory || []).filter(item => item.status !== 'PENDING');
    const requestedDays = String(payload.requestedDays ?? '').trim() === '' ? '' : Number(payload.requestedDays);
    rep.extensionHistory.push({ round: workspaceModel?.context?.roundNo || 1, requestedDays, reason: payload.reason || '', progress: payload.progress || '', workDone: payload.workDone || '', workRemaining: payload.workRemaining || '', obstacles: payload.obstacles || '', status: 'PENDING' });
    return paperExt(previewState, reportType);
  }
  function extensionDocumentPreviewA5(state, documentVersion) {
    if (!documentVersion || documentVersion.availability !== 'AVAILABLE') return '';
    if (documentVersion.previewDocument === 'plan' || ['CASE_PLAN', 'WORK_LOG'].includes(documentVersion.documentType)) {
      const reportType = documentVersion.previewReportType === '213' ? '213' : documentVersion.previewReportType === '644' ? '644' : '';
      const sourceField = documentVersion.previewSourceField === 'workLog' ? 'workLog' : documentVersion.previewSourceField === 'plan' ? 'plan' : '';
      const snapshot = documentVersion.previewSnapshot && typeof documentVersion.previewSnapshot === 'object' ? documentVersion.previewSnapshot : null;
      if (!reportType || !sourceField || snapshot?.reportType !== reportType || !String(snapshot[sourceField] || '').trim()) return '';
      const previewState = JSON.parse(JSON.stringify(state || {}));
      ensureInquiry(previewState);
      const previewReport = reportOf(reportType, previewState.inquiry);
      previewReport.plan = String(snapshot.plan || '');
      previewReport.workLog = String(snapshot.workLog || '');
      if (reportType === '644') previewState.inquiry.prelim = { ...previewState.inquiry.prelim, plan: previewReport.plan, workLog: previewReport.workLog };
      return paperPlan(previewState);
    }
    if (documentVersion.source === 'A4_HANDOFF' && documentVersion.sourceDocumentId) {
      const manifest = state.inboundDocumentManifest || globalThis.ECMISActivity5Handoff?.buildInboundDocumentManifest?.(state) || {};
      const sourceDocument = (manifest.documents || []).find(item => item.documentId === documentVersion.sourceDocumentId);
      return sourceDocument?.html ? `<div class="a5-inbound-paper" data-a5-inbound-readonly="true">${readOnlyInboundDocumentHtml(sourceDocument.html)}</div>` : '';
    }
    return `<article class="a4-paper document-placeholder a5-inbound-reference"><p class="ws-kicker">ตัวอย่างเอกสารในสำนวน</p><h2>${escapeHtml(documentVersion.name || 'เอกสารประกอบ')}</h2><p>เอกสารเวอร์ชันนี้พร้อมใช้ แต่ยังไม่มีตัวแสดงเฉพาะประเภท จึงแสดงข้อมูลกำกับโดยไม่สร้างเนื้อหาแทนเอกสารจริง</p></article>`;
  }
  function openExtensionWorkspaceA5(state, role) {
    if (role !== 'investigator') return { ok: false, message: 'ผู้รับผิดชอบสำนวนเท่านั้นที่จัดทำคำขอขยายเวลาได้' };
    const api = globalThis.ECMISActivity5ExtensionWorkspace;
    if (!api) return { ok: false, message: 'ส่วนจัดทำคำขอขยายเวลาไม่พร้อมใช้งาน กรุณาโหลดหน้าใหม่' };
    const reportType = reportTypeForStage(state.workflow?.stage);
    const owner = extensionOwnerA5(state, role);
    if (!owner.ok) return owner;
    const ordinal = extensionOrdinalA5(state, reportType);
    const existing = state.inquiry.extensionWorkspace;
    const extensionType = extensionTypeForReportA5(reportType);
    const roundCheck = globalThis.ECMISActivity5ExtensionRules?.evaluateNormalRound?.(extensionType, ordinal);
    if (!roundCheck?.ok) {
      const message = roundCheck?.code === 'EXTRAORDINARY_FLOW_REQUIRED'
        ? `ขยายระยะเวลา ${reportType} ครบรอบปกติแล้ว ต้องจัดทำรายงานเหตุล่าช้าเพื่อส่งกิจกรรมที่ 7`
        : 'รอบคำขอขยายเวลาไม่ถูกต้อง';
      return { ok: false, code: roundCheck?.code, signal: roundCheck?.result, message };
    }
    const expectedRequestId = `a5-extension:${state.caseData.id}:${reportType}:${ordinal}`;
    const sameDraft = existing?.active === true;
    const candidate = JSON.parse(JSON.stringify(state));
    ensureInquiry(candidate);
    const receivedEvidence = globalThis.ECMISActivity5ExtensionDocuments?.registerA4ReceivedDateEvidence?.(candidate, { receivedAt: candidate.inquiry?.intake?.receivedFirstAt || candidate.caseData?.received || '' });
    if (receivedEvidence?.ok && receivedEvidence.state) candidate.inquiry.extensionSignedArtifacts = receivedEvidence.state.inquiry.extensionSignedArtifacts;
    const rep = reportOf(reportType, candidate.inquiry);
    const deadline = ensureExtensionDeadlineBasisA5(candidate, reportType);
    if (!deadline.ok) return { ok: false, code: deadline.code, message: 'ไม่พบฐานวันที่เริ่มนับหรือกำหนดเวลาที่ตรวจสอบได้' };
    const registry = ensureExtensionAuthorityRegistryA5(candidate);
    const authority = globalThis.ECMISActivity5ExtensionAuthority?.resolveReviewerContract?.({
      requestId: sameDraft ? existing.requestState.id : expectedRequestId,
      revisionNo: sameDraft ? existing.requestState.activeRevisionNo : 1,
      extensionType,
      roundNo: ordinal,
      unitKey: candidate.inquiry?.intake?.unit || candidate.caseData?.region || '',
      effectiveDate: todayISO(),
      authorityRegistry: registry,
      allowMockRoleSlot: !globalThis.ECMISCurrentAccount
    });
    if (!authority?.ok) return { ok: false, code: authority?.code || 'PENDING_CONFIRMATION', message: 'ยังยืนยันผู้พิจารณาตามสายกำกับไม่ได้' };
    const rule = globalThis.ECMISActivity5ExtensionRules?.getExtensionRule?.(extensionType);
    const created = api.createRequesterWorkspace({
      requestId: sameDraft ? existing.requestState.id : expectedRequestId,
      caseId: state.caseData.id,
      caseNumber: state.caseData.id,
      extensionType,
      reportType,
      roundNo: ordinal,
      actorId: owner.id,
      ownerId: owner.id,
      ownerName: owner.name,
      assignment: {
        primaryOfficerId: owner.id,
        assignmentVersion: owner.assignmentVersion,
        acceptedAssignmentVersion: owner.acceptedAssignmentVersion
      },
      currentDeadline: rep.deadlineAt || '',
      submissionCutoff: addDays(rep.deadlineAt || '', -15),
      deadlineBasis: rep.deadlineBasis,
      deadlineVersion: rep.deadlineVersion,
      reviewerContract: authority.result,
      unitKey: authority.result.unitKey,
      appointmentContext: reportType === '644' ? {
        orderNo: candidate.inquiry?.committee213?.orderNo || '',
        orderType: candidate.inquiry?.committee213?.orderType || '',
        orderDate: candidate.inquiry?.committee213?.orderDate || '',
        panelFingerprint: candidate.inquiry?.committee213?.panelFingerprint || ''
      } : null,
      at: new Date().toISOString(),
      repository: extensionRepositoryA5(candidate, reportType),
      draftPayload: { progress: '', workDone: '', workRemaining: '', obstacles: '', reason: '', requestedDays: '' },
      policy: {
        authorityChain: rule?.authorityChain?.status || 'PENDING_CONFIRMATION',
        approvalDayPolicy: rule?.approvalDayPolicy?.status || 'PENDING_CONFIRMATION',
        roundLimitPolicy: 'CONFIRMED'
      },
      persisted: sameDraft ? existing : null
    });
    if (!created.ok) return { ok: false, message: created.errors?.[0]?.message || 'เปิดพื้นที่จัดทำคำขอขยายเวลาไม่สำเร็จ กรุณาตรวจข้อมูลสำนวน' };
    const liveReport = reportOf(reportType, state.inquiry);
    liveReport.deadlineBasis = JSON.parse(JSON.stringify(rep.deadlineBasis));
    liveReport.deadlineVersion = rep.deadlineVersion;
    liveReport.deadlineAt = rep.deadlineAt;
    state.inquiry.extensionAuthorityRegistry = JSON.parse(JSON.stringify(registry));
    state.inquiry.extensionReviewAssignment = JSON.parse(JSON.stringify(authority.result));
    state.inquiry.extensionSignedArtifacts = JSON.parse(JSON.stringify(candidate.inquiry.extensionSignedArtifacts || []));
    state.inquiry.extensionWorkspace = created.result;
    state.inquiry.extensionWorkspace.active = true;
    state.inquiry.extensionWorkspace.ui.dirty = false;
    state.inquiry.extensionWorkspace.ui.saveState = 'SAVED';
    return { ok: true, workspace: state.inquiry.extensionWorkspace };
  }
  function extensionAccessContextA5(state, role, model) {
    const account = role === 'investigator' ? currentA5Account() : null;
    const assignment = state.assignment || {};
    const reportType = reportTypeForStage(state.workflow?.stage);
    const extensionType = extensionTypeForReportA5(reportType);
    const rule = globalThis.ECMISActivity5ExtensionRules?.getExtensionRule?.(extensionType);
    const roundNo = extensionOrdinalA5(state, reportType);
    return {
      actorId: String(account?.officerId || ''),
      primaryOfficerId: String(assignment.primaryOfficerId || ''),
      assignmentVersion: Number(assignment.assignmentVersion),
      acceptedAssignmentVersion: Number(assignment.acceptedAssignmentVersion),
      caseId: String(state.caseData?.id || ''),
      extensionType,
      formId: String(rule?.formId || ''),
      roundNo,
      requestId: `a5-extension:${state.caseData?.id || ''}:${reportType}:${roundNo}`,
      revisionNo: Number(model?.requestState?.activeRevisionNo)
    };
  }
  function validateExtensionPersistenceA5(latestWorkspace, nextWorkspace, persistenceContext = {}) {
    const message = 'ร่างคำขอมีการเปลี่ยนแปลงจากหน้าต่างอื่น กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก';
    const latestRequest = latestWorkspace?.requestState;
    const nextRequest = nextWorkspace?.requestState;
    const operation = String(persistenceContext.operation || '');
    const expectedRequestVersion = Number(persistenceContext.expectedRequestVersion);
    const finalRequestVersion = Number(persistenceContext.finalRequestVersion);
    const maxAdvance = operation === 'VALIDATE' ? 2 : 1;
    const latestRevisionNo = Number(latestRequest?.activeRevisionNo);
    const nextRevisionNo = Number(nextRequest?.activeRevisionNo);
    const revisionValid = operation === 'CORRECTION'
      ? nextRevisionNo === latestRevisionNo + 1
      : nextRevisionNo === latestRevisionNo;
    const valid = Boolean(latestRequest?.id)
      && latestRequest.id === nextRequest?.id
      && revisionValid
      && ['AUTOSAVE', 'VALIDATE', 'CLOSE', 'SUBMIT', 'CORRECTION'].includes(operation)
      && Number.isInteger(expectedRequestVersion)
      && Number.isInteger(finalRequestVersion)
      && Number(latestRequest.version) === expectedRequestVersion
      && Number(nextRequest?.version) === finalRequestVersion
      && finalRequestVersion >= expectedRequestVersion
      && finalRequestVersion <= expectedRequestVersion + maxAdvance;
    return valid ? { ok: true, message: '' } : { ok: false, message };
  }
  function wireExtensionWorkspaceA5(state, role) {
    const host = $('#a5ExtensionWorkspaceHost');
    const api = globalThis.ECMISActivity5ExtensionWorkspace;
    const model = state.inquiry?.extensionWorkspace;
    if (!host || !api || !model?.active) return null;
    const currentState = () => getState(state.caseData.id) || state;
    const getAccessContext = () => extensionAccessContextA5(currentState(), role, model);
    const verified = api.verifyRequesterAccess?.(model, getAccessContext());
    if (!verified?.ok) {
      host.innerHTML = `<div class="a5-extension-error" role="alert">${escapeHtml(verified?.errors?.[0]?.message || 'ตรวจสอบสิทธิ์จัดทำคำขอไม่สำเร็จ กรุณากลับรายการสำนวน')}</div>`;
      return verified || { ok: false, message: 'ตรวจสอบสิทธิ์จัดทำคำขอไม่สำเร็จ' };
    }
    let mounted = null;
    const persist = (nextModel, persistenceContext = {}) => {
      const latest = currentState();
      const latestAccess = extensionAccessContextA5(latest, role, nextModel);
      const latestVerified = api.verifyRequesterAccess?.(nextModel, latestAccess);
      if (!latestVerified?.ok) throw new Error(latestVerified?.errors?.[0]?.message || 'สิทธิ์ผู้รับผิดชอบสำนวนเปลี่ยนแปลง');
      ensureInquiry(latest);
      const latestWorkspace = latest.inquiry.extensionWorkspace;
      const persistenceCheck = validateExtensionPersistenceA5(latestWorkspace, nextModel, persistenceContext);
      if (!persistenceCheck.ok) throw new Error(persistenceCheck.message);
      latest.inquiry.extensionWorkspace = JSON.parse(JSON.stringify(nextModel));
      saveState(latest.caseData.id, latest);
      state.inquiry.extensionWorkspace = JSON.parse(JSON.stringify(nextModel));
    };
    mounted = api.mountRequesterWorkspace(host, {
      model,
      actorId: verified.result?.context?.ownerId || model.context?.ownerId,
      getAccessContext: () => extensionAccessContextA5(currentState(), role, mounted?.result?.controller?.getModel?.() || model),
      now: () => new Date().toISOString(),
      persist,
      renderForm: workspaceModel => extensionFormPreviewA5(getState(state.caseData.id) || state, workspaceModel),
      renderDocument: documentVersion => extensionDocumentPreviewA5(getState(state.caseData.id) || state, documentVersion),
      onClose: nextModel => {
        mounted?.result?.dispose?.();
        renderA5Detail(nextModel.context.caseId, role, 'current-task');
        const action = A5_EXTENSION_RETURN_FOCUS_ACTION;
        A5_EXTENSION_RETURN_FOCUS_ACTION = '';
        const restoreFocus = () => document.querySelector(`#a5App [data-a5-action="${action}"]`)?.focus();
        if (action) (globalThis.requestAnimationFrame || (callback => callback()))(restoreFocus);
      },
      onPrepared: payload => {
        host.dispatchEvent(new CustomEvent('ecmis:a5-extension-submit-prepared', { bubbles: true, detail: payload }));
        const submitApi = globalThis.ECMISActivity5ExtensionSubmit;
        const liveModel = mounted?.result?.controller?.getModel?.() || model;
        if (!submitApi?.submitPreparedRequest) return {
          ok: false,
          code: 'SUBMIT_UNAVAILABLE',
          state: liveModel,
          result: liveModel,
          errors: [{ field: 'submit', message: 'ส่วนยื่นคำขอไม่พร้อมใช้งาน กรุณาโหลดหน้าใหม่' }],
          events: []
        };
        const rendered = extensionFormPreviewA5(currentState(), liveModel);
        const submitted = submitApi.submitPreparedRequest(liveModel, {
          ...payload,
          idempotencyKey: `${payload.requestId}:${payload.revisionNo}`,
          renderedForm: {
            rendererVersion: 'activity5-paperExt-20260814',
            contentType: 'text/html',
            content: rendered
          }
        });
        if (!submitted.ok) {
          host.dispatchEvent(new CustomEvent('ecmis:a5-extension-submit-failed', { bubbles: true, detail: submitted }));
          return submitted;
        }
        try {
          persist(submitted.result, {
            operation: 'SUBMIT',
            expectedRequestVersion: payload.expectedVersion,
            finalRequestVersion: submitted.result.requestState.version
          });
        } catch (error) {
          return {
            ok: false,
            code: 'PERSIST_FAILED',
            state: liveModel,
            result: liveModel,
            errors: [{ field: 'persist', message: String(error?.message || 'บันทึกการยื่นคำขอไม่สำเร็จ กรุณาลองอีกครั้ง') }],
            events: []
          };
        }
        host.dispatchEvent(new CustomEvent('ecmis:a5-extension-submitted', { bubbles: true, detail: submitted.result.submission }));
        return submitted;
      }
    });
    return mounted;
  }
  function extensionReviewerWorkspaceA5(state) {
    const requestWorkspace = state.inquiry?.extensionWorkspace;
    const api = globalThis.ECMISActivity5ExtensionReview;
    if (!api || !requestWorkspace?.requestState?.id) return null;
    const status = requestWorkspace.requestState.status;
    if (!['SUBMITTED', 'IN_REVIEW', 'RETURNED', 'REJECTED', 'APPROVED'].includes(status)) return null;
    const reportType = requestWorkspace.context?.reportType === '213' ? '213' : '644';
    const prior = state.inquiry?.extensionReviewWorkspace;
    const created = api.createReviewerWorkspace({
      requestState: requestWorkspace.requestState,
      reviewerContract: state.inquiry?.extensionReviewAssignment,
      authorityRegistry: state.inquiry?.extensionAuthorityRegistry,
      progressPolicy: state.inquiry?.extensionProgress?.policy || globalThis.ECMISActivity5ExtensionProgress?.PROGRESS_POLICY,
      progressOwnerAssignment: { assigneeId: state.assignment?.primaryOfficerId || '', assignmentVersion: Number(state.assignment?.assignmentVersion) },
      caseDeadline: reportOf(reportType, state.inquiry)?.deadlineAt || requestWorkspace.context?.currentDeadline,
      reviewDecisions: prior?.reviewDecisions || [],
      timeline: prior?.timeline || []
    });
    return created?.ok ? created.result : null;
  }
  function wireExtensionReviewWorkspaceA5(state, role) {
    const host = $('#a5ExtensionReviewWorkspaceHost');
    const api = globalThis.ECMISActivity5ExtensionReview;
    const model = extensionReviewerWorkspaceA5(state);
    if (!host || !api || !model) return null;
    const currentState = () => getState(state.caseData.id) || state;
    const authorityActor = currentA5ActorForAuthority(state, role, model.reviewerContract);
    return api.mountReviewerWorkspace(host, {
      model,
      actorId: authorityActor.actorId,
      actorRole: authorityActor.actorRole,
      now: () => new Date().toISOString(),
      persist: (nextModel, persistenceContext = {}) => {
        const latest = currentState();
        ensureInquiry(latest);
        const latestRequestWorkspace = latest.inquiry.extensionWorkspace;
        const latestRequest = latestRequestWorkspace?.requestState;
        const reportType = latestRequestWorkspace.context?.reportType === '213' ? '213' : '644';
        const report = reportOf(reportType, latest.inquiry);
        const liveReview = api.createReviewerWorkspace?.({
          requestState: latestRequest,
          reviewerContract: latest.inquiry.extensionReviewAssignment,
          authorityRegistry: latest.inquiry.extensionAuthorityRegistry,
          progressPolicy: latest.inquiry?.extensionProgress?.policy || globalThis.ECMISActivity5ExtensionProgress?.PROGRESS_POLICY,
          progressOwnerAssignment: { assigneeId: latest.assignment?.primaryOfficerId || '', assignmentVersion: Number(latest.assignment?.assignmentVersion) },
          caseDeadline: report?.deadlineAt || latestRequestWorkspace.context?.currentDeadline,
          reviewDecisions: latest.inquiry.extensionReviewWorkspace?.reviewDecisions || [],
          timeline: latest.inquiry.extensionReviewWorkspace?.timeline || []
        });
        const persistenceCheck = liveReview?.ok
          ? api.verifyReviewerPersistence?.(liveReview.result, nextModel, persistenceContext)
          : liveReview;
        if (!persistenceCheck?.ok) {
          throw new Error(persistenceCheck?.errors?.[0]?.message || 'คำขอ ฉบับยื่น หรือกติกาผู้พิจารณาเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด');
        }
        if (nextModel.requestState.status === 'APPROVED') {
          if (String(report.deadlineAt || '') !== String(model.caseDeadline || '')) {
            throw new Error('กำหนดเวลาสำนวนเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด');
          }
          report.deadlineAt = nextModel.caseDeadline;
          report.deadlineVersion = nextModel.requestState.deadlineVersion;
          latest.inquiry.extensionProgress = latest.inquiry.extensionProgress || { version: 1, assignmentVersion: Number(latest.assignment?.assignmentVersion), obligations: [] };
          latest.inquiry.extensionProgress.policyStatus = nextModel.progressScheduleStatus || 'PENDING_CONFIRMATION';
          if (nextModel.progressScheduleStatus === 'CONFIRMED') {
            const existingIds = new Set((latest.inquiry.extensionProgress.obligations || []).map(item => item.obligationId));
            (nextModel.progressSchedule?.obligations || []).forEach(item => { if (!existingIds.has(item.obligationId)) latest.inquiry.extensionProgress.obligations.push(JSON.parse(JSON.stringify(item))); });
          }
        }
        const latestDecision = nextModel.reviewDecisions?.[nextModel.reviewDecisions.length - 1];
        if (latestDecision && ['APPROVE', 'REJECT'].includes(latestDecision.action)) {
          report.extensionHistory = Array.isArray(report.extensionHistory) ? report.extensionHistory : [];
          const alreadyRecorded = report.extensionHistory.some(item => item?.reviewIdempotencyKey === latestDecision.idempotencyKey);
          if (!alreadyRecorded) {
            report.extensionHistory.push({
              requestId: latestDecision.requestId,
              revisionNo: latestDecision.revisionNo,
              round: latestRequestWorkspace.context?.roundNo,
              requestedDays: Number(nextModel.submittedSnapshot?.payload?.deadline?.requestedDays),
              approvedDays: latestDecision.action === 'APPROVE' ? Number(latestDecision.approvedDays) : null,
              reason: String(nextModel.submittedSnapshot?.draftPayload?.reason || ''),
              reviewReason: latestDecision.reason,
              status: latestDecision.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
              approvedBy: latestDecision.action === 'APPROVE' ? (ROLE_LABELS[role] || role) : '',
              approvedAt: latestDecision.action === 'APPROVE' ? latestDecision.at : '',
              rejectedBy: latestDecision.action === 'REJECT' ? (ROLE_LABELS[role] || role) : '',
              rejectedAt: latestDecision.action === 'REJECT' ? latestDecision.at : '',
              reviewIdempotencyKey: latestDecision.idempotencyKey
            });
          }
        }
        latestRequestWorkspace.requestState = JSON.parse(JSON.stringify(nextModel.requestState));
        latestRequestWorkspace.ui = { ...(latestRequestWorkspace.ui || {}), step: 4, dirty: false, saveState: 'SAVED' };
        latest.inquiry.extensionReviewWorkspace = JSON.parse(JSON.stringify(nextModel));
        if (latestDecision) {
          const labels = { START_REVIEW: 'รับเรื่องตรวจคำขอขยายเวลา', RETURN_FOR_CORRECTION: 'ส่งกลับคำขอขยายเวลาให้แก้ไข', REJECT: 'ไม่อนุมัติคำขอขยายเวลา', APPROVE: 'อนุมัติคำขอขยายเวลา' };
          latest.decisionHistory = latest.decisionHistory || [];
          latest.decisionHistory.push({ text: `${ROLE_LABELS[role] || role} ${labels[latestDecision.action] || 'พิจารณาคำขอขยายเวลา'}`, time: latestDecision.at });
        }
        saveState(latest.caseData.id, latest);
        state.inquiry.extensionWorkspace = JSON.parse(JSON.stringify(latestRequestWorkspace));
        state.inquiry.extensionReviewWorkspace = JSON.parse(JSON.stringify(nextModel));
      },
      onChange: () => renderA5Detail(state.caseData.id, role, 'current-task')
    });
  }
  function inboundDocumentPaperA5(state, key) {
    const { manifest, items } = inboundDocumentItemsA5(state);
    if (key === '__all__') {
      const statusLabels = { signed: 'ฉบับลงนาม · อ่านอย่างเดียว', missing: 'ยังไม่ได้รับเอกสาร', attachment: 'ข้อมูลอ้างอิงเอกสารแนบ', proof: 'ข้อมูลอ้างอิงการจัดส่ง', empty: 'ไม่พบเอกสาร' };
      return `<div class="a5-inbound-all" aria-label="เอกสารรับเข้าทั้งหมด">${items.map((entry, index) => `<section class="a5-inbound-all-item" data-a5-inbound-kind="${entry.kind}"><header><div><span>เอกสาร ${index + 1} จาก ${items.length}</span><h2>${escapeHtml(entry.label)}</h2></div><strong>${escapeHtml(statusLabels[entry.kind] || 'อ่านอย่างเดียว')}</strong></header><div class="a5-inbound-all-body">${inboundDocumentPaperA5(state, entry.key)}</div></section>`).join('')}</div>`;
    }
    const selected = items.find(item => item.key === key) || items[0];
    if (selected.kind === 'signed') return `<div class="a5-inbound-paper" data-a5-inbound-readonly="true">${readOnlyInboundDocumentHtml(selected.item.html)}</div>`;
    if (selected.kind === 'missing') return `<article class="a4-paper document-placeholder a5-inbound-reference"><p class="ws-kicker">ตรวจความครบถ้วน</p><h2>${escapeHtml(selected.label)}</h2><p class="ws-callout">ไม่ได้รับเอกสารฉบับนี้จากระบบต้นทาง</p><p>ระบบไม่สร้างเอกสารแทนฉบับที่ขาด และไม่ใช้ข้อมูลปัจจุบันย้อนสร้างเป็นหลักฐานเดิม</p></article>`;
    if (selected.kind === 'attachment') {
      const item = selected.item;
      return `<article class="a4-paper document-placeholder a5-inbound-reference"><p class="ws-kicker">เอกสารแนบจากผู้ร้อง · มีเฉพาะข้อมูลอ้างอิง</p><h2>${escapeHtml(item.name || 'ไม่ระบุชื่อไฟล์')}</h2><dl class="ws-readonly"><div><dt>ประเภท</dt><dd>${escapeHtml(item.type || 'ไม่ระบุ')}</dd></div><div><dt>จำนวนหน้า</dt><dd>${escapeHtml(item.pages == null ? 'ไม่ระบุ' : `${item.pages} หน้า`)}</dd></div><div><dt>ขนาด</dt><dd>${escapeHtml(item.size || 'ไม่ระบุ')}</dd></div><div><dt>รายละเอียด</dt><dd>${escapeHtml(item.description || 'ไม่ระบุ')}</dd></div></dl><p class="ws-policy-note">ข้อมูลต้นทางไม่มี URL หรือไฟล์ binary จึงไม่มีปุ่มเปิดหรือดาวน์โหลดปลอม</p></article>`;
    }
    if (selected.kind === 'proof') {
      const proof = selected.item;
      return `<article class="a4-paper document-placeholder a5-inbound-reference"><p class="ws-kicker">หลักฐานการจัดส่ง · มีเฉพาะข้อมูลอ้างอิง</p><h2>${escapeHtml(proof.name || 'ไม่ระบุชื่อไฟล์')}</h2><dl class="ws-readonly"><div><dt>วิธีส่ง</dt><dd>${escapeHtml(proof.method || 'ไม่ระบุ')}</dd></div><div><dt>เลขติดตาม</dt><dd>${escapeHtml(proof.trackingNo || 'ไม่ระบุ')}</dd></div><div><dt>วันที่ส่ง</dt><dd>${escapeHtml(proof.sentDate || 'ไม่ระบุ')}</dd></div><div><dt>ฉบับลงนาม</dt><dd>${escapeHtml(manifest.signedVersion ? `เวอร์ชัน ${manifest.signedVersion}` : 'ไม่ระบุเวอร์ชัน')}</dd></div></dl></article>`;
    }
    return '<article class="a4-paper document-placeholder a5-inbound-reference"><h2>ไม่พบเอกสารที่ส่งมาจากกิจกรรมที่ 4</h2><p>ตรวจสอบข้อมูลการส่งมอบจากระบบต้นทาง</p></article>';
  }
  function inboundDocumentViewerA5(state, selectedDocument) {
    const { items } = inboundDocumentItemsA5(state);
    const selected = selectedDocument === '__all__' || items.some(item => item.key === selectedDocument) ? selectedDocument : items[0].key;
    const tabs = items.map(item => `<button type="button" id="a5-inbound-tab-${item.key}" role="tab" aria-controls="a5-inbound-document-panel" tabindex="${item.key === selected ? '0' : '-1'}" class="ws-doc-tab${item.key === selected ? ' active' : ''}" data-a5-inbound-doc="${item.key}" aria-selected="${String(item.key === selected)}">${escapeHtml(item.label)}</button>`).join('');
    const options = `<option value="__all__"${selected === '__all__' ? ' selected' : ''}>ดูเอกสารทั้งหมด</option>${items.map(item => `<option value="${item.key}"${item.key === selected ? ' selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}`;
    const panelLabel = selected === '__all__' ? ' aria-label="เอกสารรับเข้าทั้งหมด"' : ` aria-labelledby="a5-inbound-tab-${selected}"`;
    return `<aside class="ws-doc-pane a5-inbound-doc-pane" aria-label="เอกสารที่รับจากเจ้าหน้าที่รับเรื่อง"><div class="ws-doc-toolbar"><div class="ws-doc-tabs" role="tablist" aria-label="เลือกเอกสารที่รับจากกิจกรรมที่ 4">${tabs}</div><label class="ws-doc-jump" title="ข้ามไปยังเอกสาร"><span aria-hidden="true">ไปที่</span><select id="a5InboundDocJump" aria-label="เลือกเอกสารที่รับจากกิจกรรมที่ 4">${options}</select></label><span class="ws-status">อ่านอย่างเดียว</span><button type="button" class="ws-button secondary ws-doc-pane-toggle" title="ย่อแผงเอกสาร" aria-label="ย่อแผงเอกสาร" aria-expanded="true">»</button></div><button type="button" class="ws-doc-pane-rail" title="ขยายแผงเอกสาร" aria-label="ขยายแผงเอกสาร">«<span>เอกสาร</span></button><div class="ws-paper-stage" id="a5-inbound-document-panel" role="tabpanel"${panelLabel}><div id="a5InboundPaperStage">${inboundDocumentPaperA5(state, selected)}</div></div></aside>`;
  }
  function visibleActionsA5(state, role) {
    if (state?.caseAdministration?.lockedByMerge || state?.workflow?.stage === 'closed' || state?.workflow?.complete === true || state?.workflow?.a5Status === 'COMPLETED') return '';
    const markup = String(actionsForA5(state, role) || '');
    const buttons = markup.match(/<button\b[\s\S]*?<\/button>/g) || [];
    const allowed = buttons.filter(button => !/data-a5-action="back"/.test(button));
    const primaryIndex = allowed.findIndex(button => /class="ws-button primary"/.test(button));
    const picked = [];
    if (primaryIndex >= 0) picked.push(allowed[primaryIndex]);
    allowed.forEach((button, index) => {
      if (index !== primaryIndex && picked.length < 4) picked.push(button);
    });
    return onePrimaryActionMarkup(picked.join(''));
  }
  function currentAdministrationTaskA5(state, role) {
    const admin = state.caseAdministration || {};
    const route = state.returnRoute || {};
    const panelRequest = (state.panelChangeRequests || []).at(-1);
    const primary = (action, label) => `<button type="button" class="ws-button primary" data-a5-workflow-action="${action}">${label}</button>`;
    if (admin.lockedByMerge) return {
      heading: `สำนวนนี้รวมเป็นสำนวนรองของ ${admin.primaryCaseId || 'สำนวนหลัก'}`,
      body: `<section class="ws-section"><p class="ws-callout">สำนวนรองถูกล็อกเพื่อป้องกันการแก้ไขข้อมูลซ้ำ กรุณาเปิดสำนวนหลักเพื่อดำเนินงานต่อ</p></section>`,
      actions: ''
    };
    if (route.status === 'RETURN_REQUESTED' && role === 'director') return {
      heading: 'พิจารณาคำขอส่งคืนสำนวนผ่าน กบค.',
      body: `<section class="ws-section"><dl class="ws-readonly"><div><dt>เหตุผล</dt><dd>${escapeHtml(route.reason || '')}</dd></div><div><dt>ความเห็นเสนอ</dt><dd>${escapeHtml(route.requestOpinion || '')}</dd></div><div><dt>สำนักงานปลายทางที่เสนอ</dt><dd>${escapeHtml(route.destination || '')}</dd></div></dl><div class="ws-field"><label>ความเห็นผู้อนุมัติ</label><textarea id="a5ReturnApprovalOpinion"></textarea></div></section><section class="ws-section"><h3>เอกสารทั้งหมดของเรื่อง (จากกิจกรรมที่ 4)</h3>${inboundDocumentPaperA5(state, '__all__')}</section>`,
      actions: primary('return-approve', 'อนุมัติส่งคืน กบค.')
    };
    if (route.status === 'RETURN_APPROVED' && role === 'clerk') return {
      heading: 'จัดส่งสำนวนคืน กบค.',
      body: '<section class="ws-section"><div class="ws-grid-3"><div class="ws-field"><label>เลขหนังสือส่งคืน</label><input id="a5ReturnLetterNo"></div><div class="ws-field"><label>เลข EMS</label><input id="a5ReturnEms"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5ReturnDispatchedAt" type="date"></div></div></section>',
      actions: primary('return-dispatch', 'ยืนยันจัดส่งคืน กบค.')
    };
    if (route.status === 'RETURN_DISPATCHED' && role === 'clerk') return {
      heading: 'กบค. รับสำนวนคืน',
      body: '<section class="ws-section"><div class="ws-grid-2"><div class="ws-field"><label>วันที่ กบค. รับ</label><input id="a5RouteReceivedAt" type="date"></div><div class="ws-field"><label>ผู้ถือต้นฉบับ</label><input id="a5RouteHolder"></div></div></section>',
      actions: primary('gbk-receive', 'ยืนยัน กบค. รับสำนวน')
    };
    if (route.status === 'RETURNED_TO_GBK' && role === 'clerk') return {
      heading: 'กบค. จัดเส้นทางสำนวนใหม่',
      body: `<section class="ws-section"><div class="ws-grid-2"><div class="ws-field"><label>สำนักงานปลายทาง (จากคำขอ — ไม่สามารถเปลี่ยนได้)</label><input id="a5RerouteDestination" value="${escapeHtml(route.destination || '')}" readonly></div><div class="ws-field"><label>ความเห็นจัดเส้นทาง</label><textarea id="a5RerouteOpinion"></textarea></div></div></section>`,
      actions: primary('gbk-reroute', 'ยืนยันจัดเส้นทางใหม่')
    };
    if (route.status === 'REROUTED' && role === 'clerk') return {
      heading: 'สำนักงานปลายทางรับสำนวน',
      body: `<section class="ws-section"><p class="ws-callout">ปลายทาง: ${escapeHtml(route.destination || '')}</p><div class="ws-grid-2"><div class="ws-field"><label>วันที่รับ</label><input id="a5RouteReceivedAt" type="date"></div><div class="ws-field"><label>ผู้ถือต้นฉบับ</label><input id="a5RouteHolder"></div></div></section>`,
      actions: primary('destination-receive', 'ยืนยันปลายทางรับสำนวน')
    };
    if (panelRequest?.status === 'SUBMITTED' && role === 'director') return {
      heading: 'รอยืนยันผู้มีอำนาจอนุมัติการปรับองค์คณะ',
      body: `<section class="ws-section"><p class="ws-callout">คำขอปรับองค์คณะถูกส่งแล้ว ระบบยังไม่เปิดเส้นทางอนุมัติจนกว่าจะยืนยันผู้มีอำนาจ</p><dl class="ws-readonly"><div><dt>เหตุผล</dt><dd>${escapeHtml(panelRequest.reason || '')}</dd></div><div><dt>องค์คณะที่เสนอ</dt><dd>${escapeHtml((panelRequest.proposedMembers || []).join(', '))}</dd></div></dl>${a5RuleBadge('panel-change-authority')}</section>`,
      actions: ''
    };
    return null;
  }
  function currentDownstreamTaskA5(state, role) {
    const status = String(state.workflow?.downstreamStatus || '');
    if (!status) return null;
    const actionList = globalThis.ECMISActivity5Workflow?.getA5AvailableActions(state, role) || [];
    const actionMarkup = actionList.slice(0, 2).map((action, index) => `<button type="button" class="ws-button ${index === 0 && action.primary !== false ? 'primary' : 'secondary'}" data-a5-workflow-action="${action.id}">${escapeHtml(action.label)}</button>`).join('');
    const pendingAuthority = '<span class="a5-rule-badge pending">รอยืนยันกติกากระบวนงาน</span>';
    // Forms 8–20 (post-resolution documents) are only relevant once a case reaches
    // outcome/prosecutor status; injected here because this is the only reachable
    // render path for OUTCOME_TASKS_*/PROSECUTOR_* — the a5-outcome stage editor
    // (outcomeEditor) never renders once downstreamStatus is set (see item 2 note).
    const postRegistryMarkup = /^(OUTCOME_TASKS_|PROSECUTOR_)/.test(status)
      ? (globalThis.ECMISActivity5PostResolution?.renderPostDocumentEditorA5?.(state, { id: workflowActorNameA5(state, role), name: workflowActorNameA5(state, role), role }, evidenceRepositoryOptionsA5(state)) || '')
      : '';
    const reportMatch = status.match(/^REPORT_(213|644)_(.+)$/);
    if (reportMatch) {
      const reportType = reportMatch[1], phase = reportMatch[2];
      const headings = { DRAFT: `จัดทำและเสนอรายงาน ${reportType}`, RETURNED: `แก้ไขและเสนอรายงาน ${reportType}`, REVIEW_PENDING: `ตรวจรายงาน ${reportType} ตามลำดับชั้น`, BOARD_READY: `ส่งรายงาน ${reportType} ไปกิจกรรมที่ 7`, SENT_TO_A7: `บันทึกหลักฐานรับรายงาน ${reportType}`, WAIT_RESULT: `บันทึกผลพิจารณารายงาน ${reportType}`, RESULT_RECEIVED: `ดำเนินการตามผลพิจารณา ${reportType}` };
      let fields = '';
      if (['DRAFT', 'RETURNED'].includes(phase)) fields = `<p class="ws-policy-note">จัดทำและบันทึกรายงาน ${reportType} แบบมีโครงสร้างในแผงเอกสารให้ครบก่อนเสนอ ระบบจะผูกฉบับรายงาน แผนงาน บันทึกการปฏิบัติงาน และพยานหลักฐานฉบับที่แน่นอนเข้าชุดเดียวกัน</p>`;
      if (phase === 'REVIEW_PENDING') fields = `<p class="ws-policy-note">ลำดับผู้ตรวจรายงานยังรอยืนยันจากเอกสารอำนาจหน้าที่ ${pendingAuthority}</p><div class="ws-grid-2"><div class="ws-field"><label>ความเห็นตรวจรายงาน</label><textarea id="a5DownstreamOpinion"></textarea></div><div class="ws-field"><label>เหตุผลส่งกลับแก้ไข</label><textarea id="a5DownstreamReturnReason"></textarea></div></div>`;
      if (phase === 'BOARD_READY') fields = `<div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือนำส่ง</label><input id="a5DownstreamLetterNo"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5DownstreamSentAt" type="date"></div></div>`;
      if (phase === 'SENT_TO_A7') fields = `<div class="ws-grid-2"><div class="ws-field"><label>วันที่ปลายทางรับ</label><input id="a5DownstreamReceivedAt" type="date"></div><div class="ws-field"><label>หลักฐานการรับ</label><input id="a5DownstreamEvidence"></div></div>`;
      if (phase === 'WAIT_RESULT') fields = `<p class="ws-policy-note">ผู้บันทึกผลมติยังรอยืนยัน ${pendingAuthority}</p><div class="ws-grid-2"><div class="ws-field"><label>ผลพิจารณา</label><select id="a5DownstreamResult">${(reportType === '213' ? [['ACCEPT', 'รับไว้ไต่สวน'], ['NOT_ACCEPT', 'ไม่รับไว้ไต่สวน'], ['ADDITIONAL', 'ไต่สวนเพิ่มเติม'], ['NACC', 'ส่ง ป.ป.ช.']] : [['CRIMINAL_DISCIPLINARY', 'ชี้มูลอาญาและวินัย'], ['DISCIPLINARY_ONLY', 'ชี้มูลวินัย'], ['NO_GROUNDS', 'ข้อกล่าวหาไม่มีมูล'], ['NACC', 'ส่ง ป.ป.ช.'], ['POLICE', 'ส่งตำรวจ'], ['ADDITIONAL', 'ไต่สวนเพิ่มเติม'], ['SECTION_18_4', 'เส้นทางมาตรา 18/4 — รอยืนยัน']]).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></div><div class="ws-field"><label>วันที่มีมติ</label><input id="a5DownstreamDecidedAt" type="date"></div></div>`;
      if (phase === 'RESULT_RECEIVED') fields = '<p class="ws-callout">ระบบสร้างงานตามผลพิจารณาแล้ว กรุณาดำเนินงานแต่ละรายการให้ครบก่อนปิดสำนวน</p>';
      return { heading: headings[phase] || `ดำเนินการรายงาน ${reportType}`, body: `<section class="ws-section">${fields}</section>`, actions: actionMarkup };
    }
    const task = (state.downstreamTasks || []).find(item => item.status !== 'COMPLETED');
    if (['OUTCOME_TASKS_PENDING', 'OUTCOME_TASKS_IN_PROGRESS'].includes(status)) {
      const externalTask = task && ['SEND_NACC', 'SEND_POLICE', 'SEND_DISCIPLINE_AGENCY'].includes(task.type);
      const taskFields = task?.status === 'IN_PROGRESS' && externalTask
        ? '<div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือนำส่ง</label><input id="a5DownstreamLetterNo"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5DownstreamSentAt" type="date"></div></div>'
        : task?.status === 'AWAITING_RECEIPT'
          ? '<div class="ws-grid-2"><div class="ws-field"><label>วันที่ปลายทางรับ</label><input id="a5DownstreamReceivedAt" type="date"></div><div class="ws-field"><label>หลักฐานการรับ</label><input id="a5DownstreamEvidence"></div></div>'
          : task?.status === 'IN_PROGRESS'
            ? '<div class="ws-field"><label>หลักฐาน/ผลการดำเนินงาน</label><textarea id="a5DownstreamEvidence"></textarea></div>'
            : '';
      return {
        heading: task ? `ดำเนินการตามมติ: ${downstreamTaskLabelA5(task.type)}` : 'ตรวจความพร้อมปิดสำนวน',
        body: `<section class="ws-section">${task ? `<dl class="ws-readonly"><div><dt>งานปัจจุบัน</dt><dd>${escapeHtml(downstreamTaskLabelA5(task.type))}</dd></div><div><dt>สถานะ</dt><dd>${task.status === 'AWAITING_RECEIPT' ? 'ส่งแล้ว — รอหลักฐานการรับ' : task.status === 'IN_PROGRESS' ? 'กำลังดำเนินการ' : 'รอเริ่มงาน'}</dd></div></dl><input id="a5DownstreamTaskId" type="hidden" value="${escapeHtml(task.id)}">${taskFields}` : '<p class="ws-callout">ยังไม่มีงานที่ยืนยันครบ ระบบไม่อนุญาตให้ปิดสำนวนจากสถานะ legacy นี้</p>'}</section>${postRegistryMarkup}`,
        actions: actionMarkup
      };
    }
    const prosecutorHeadings = { PROSECUTOR_PACKAGE_PREPARING: 'เตรียมชุดสำนวนส่งอัยการ', PROSECUTOR_PACKAGE_READY: 'ส่งชุดสำนวนให้อัยการ', PROSECUTOR_RECEIPT_PENDING: 'บันทึกหลักฐานอัยการรับสำนวน', PROSECUTOR_ORDER_PENDING: 'บันทึกคำสั่งอัยการ', PROSECUTOR_ORDER_RECEIVED: 'เริ่มดำเนินการตามคำสั่งอัยการ', PROSECUTOR_EXECUTING: 'ยืนยันผลดำเนินการตามคำสั่งอัยการ', PROSECUTOR_RESULT_READY: 'ส่งผลดำเนินการกลับอัยการ', PROSECUTOR_RESULT_SENT: 'บันทึกหลักฐานปลายทางรับผล', PROSECUTOR_RESULT_RECEIVED: 'ตรวจความพร้อมปิดสำนวน', CLOSURE_REVIEW: 'ตรวจและอนุมัติปิดสำนวน', CLOSED: 'สำนวนเสร็จสิ้น' };
    let fields = '';
    if (status === 'PROSECUTOR_PACKAGE_PREPARING') fields = '<div class="ws-field"><label>เลขอ้างอิงชุดสำนวน</label><input id="a5ProsecutorPackageRef"></div>';
    if (['PROSECUTOR_PACKAGE_READY', 'PROSECUTOR_RESULT_READY'].includes(status)) fields = '<div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือ</label><input id="a5DownstreamLetterNo"></div><div class="ws-field"><label>วันที่ส่ง</label><input id="a5DownstreamSentAt" type="date"></div></div>';
    if (['PROSECUTOR_RECEIPT_PENDING', 'PROSECUTOR_RESULT_SENT'].includes(status)) fields = '<div class="ws-grid-2"><div class="ws-field"><label>วันที่รับ</label><input id="a5DownstreamReceivedAt" type="date"></div><div class="ws-field"><label>หลักฐานการรับ</label><input id="a5DownstreamEvidence"></div></div>';
    if (status === 'PROSECUTOR_ORDER_PENDING') {
      const orderTypes = globalThis.ECMISActivity5Workflow?.PROSECUTOR_ORDER_TYPES || {};
      const orderTypeOptions = Object.entries(orderTypes).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
      fields = `<div class="ws-grid-2"><div class="ws-field"><label>ประเภทคำสั่งอัยการ</label><select id="a5ProsecutorOrderType"><option value="">— เลือกประเภท —</option>${orderTypeOptions}</select></div><div class="ws-field"><label>วันที่รับคำสั่ง</label><input id="a5DownstreamReceivedAt" type="date"></div></div><div class="ws-field"><label>รายละเอียดคำสั่งอัยการ</label><textarea id="a5ProsecutorOrder"></textarea></div>`;
    }
    if (status === 'PROSECUTOR_EXECUTING') fields = '<div class="ws-field"><label>ผลการดำเนินการตามคำสั่ง</label><textarea id="a5ProsecutorExecutionResult"></textarea></div>';
    if (status === 'CLOSURE_REVIEW') fields = '<div class="ws-field"><label>ความเห็นตรวจปิดสำนวน</label><textarea id="a5ClosureOpinion"></textarea></div>';
    return { heading: prosecutorHeadings[status] || 'ดำเนินงานปลายทาง', body: `<section class="ws-section">${fields || '<p class="ws-callout">ตรวจรายการงานและหลักฐานก่อนดำเนินการต่อ</p>'}</section>${postRegistryMarkup}`, actions: actionMarkup };
  }
  function currentNaccReportTaskA5(state, role) {
    const m62 = state.inquiry?.intake?.m62;
    if (!(state.caseData?.decision === '62' || m62?.flag)) return null;
    const cycles = Array.isArray(state.naccReportCycles) ? state.naccReportCycles : [];
    const history = cycles.length
      ? `<ol class="ws-history">${cycles.map(item => `<li><strong>งวดที่ ${Number(item.sequence || 0)}</strong> · ${escapeHtml(item.letterNo)} · ${escapeHtml(item.reportDate)}<br>${escapeHtml(item.summary)}</li>`).join('')}</ol>`
      : '<p class="ws-policy-note">ยังไม่มีรายงานผลที่บันทึกในระบบใหม่</p>';
    const pendingOwner = '<span class="a5-rule-badge pending">รอยืนยันกติกากระบวนงาน</span>';
    const form = role === 'investigator' ? '<div class="ws-grid-2"><div class="ws-field"><label>เลขหนังสือรายงานผล</label><input id="a5NaccLetterNo"></div><div class="ws-field"><label>วันที่รายงาน</label><input id="a5NaccReportDate" type="date"></div><div class="ws-field ws-field-full"><label>สรุปผลรอบรายงาน</label><textarea id="a5NaccSummary"></textarea></div></div>' : '<p class="ws-callout">สิทธิ์ปัจจุบันดูประวัติได้ ผู้รับผิดชอบสำนวนเป็นผู้เพิ่มรายงานงวดใหม่</p>';
    return {
      heading: 'รายงานผลการดำเนินงานต่อ ป.ป.ช.',
      body: `<section class="ws-section"><p class="ws-policy-note">ใช้ผู้รับผิดชอบสำนวนเป็นผู้บันทึกใน Mock up ระหว่างรอยืนยัน owner ตามกระบวนงาน ${pendingOwner}</p>${history}${form}</section>`,
      actions: role === 'investigator' ? '<button type="button" class="ws-button primary" data-a5-workflow-action="nacc-report-add">เพิ่มรายงานงวดใหม่</button>' : ''
    };
  }
  function downstreamTaskLabelA5(type) {
    return ({ PREPARE_644_START: 'เตรียมเริ่มไต่สวน 644', NOTIFY_DECISION: 'แจ้งผลการพิจารณา', ADDITIONAL_213: 'ไต่สวนเพิ่มเติม 213', ADDITIONAL_644: 'ไต่สวนเพิ่มเติม 644', SEND_NACC: 'ส่งเรื่องให้ ป.ป.ช.', PREPARE_PROSECUTOR_PACKAGE: 'เตรียมชุดสำนวนส่งอัยการ', SEND_DISCIPLINE_AGENCY: 'ส่งผลให้หน่วยงานต้นสังกัดดำเนินการทางวินัย', SEND_POLICE: 'ส่งเรื่องให้ตำรวจ' })[type] || 'งานตามผลพิจารณา';
  }
  function witnessProtectionBarA5(state, role) {
    // ก6 คุ้มครองพยาน — แถบระดับสำนวน ใช้ได้ทุกขั้นตอน (owner 15 ส.ค. 69; xlsx ขั้น 3.0 "การเชื่อม ก6/ก9 ไม่ทำให้การนับเวลาหยุด")
    const i = state.inquiry || {}, w = state.workflow || {};
    const is644 = reportTypeForStage(w.stage) === '644';
    const rep = is644 ? i.inquiry644 : i.prelim;
    if (!rep) return '';
    const isInvestigator = role === 'investigator';
    const req = rep.witnessProtectionReq;
    const statusHtml = !req
      ? '<span class="ws-status">ยังไม่มีคำขอ</span>'
      : req.status === 'result'
        ? '<span class="ws-status success">รับผลการคุ้มครองแล้ว</span>'
        : '<span class="ws-status">ส่งคำขอแล้ว — รอผล</span>';
    const inputId = is644 ? 'a5InqA6' : 'a5A6';
    const buttons = isInvestigator
      ? `<div class="a5-witness-actions">${req && req.status !== 'result'
          ? '<button type="button" class="ws-button secondary" data-a5-action="witness-request">ส่งคำขอแล้ว — แก้คำขอ</button>'
          : '<button type="button" class="ws-button secondary" data-a5-action="witness-request">จัดทำคำขอคุ้มครอง</button>'}<button type="button" class="ws-button ghost" data-a5-action="witness-result" ${req ? '' : 'disabled'}>บันทึกผลการคุ้มครอง</button></div>`
      : '';
    const reqDetail = req
      ? `<p class="a5-witness-req-detail">ผู้ถูกคุ้มครอง: <strong>${escapeHtml(req.person || '')}</strong> — ${escapeHtml(req.risk || '')} (โดย ${escapeHtml(req.by || '')} ${escapeHtml(req.at || '')})</p>`
      : '<p class="a5-witness-req-detail ws-policy-note">ผู้ร้อง พยาน หรือผู้รับผิดชอบเห็นความเสี่ยง → จัดทำคำขอคุ้มครอง — ใช้ได้ทุกขั้นตอนของสำนวน</p>';
    return `<section class="ws-card a5-witness-bar" aria-label="คุ้มครองพยาน">
      <header class="a5-witness-bar-head"><strong>คุ้มครองพยาน</strong>${statusHtml}<span class="a5-witness-bar-note">การขอคุ้มครองไม่หยุดนับเวลาสำนวน</span></header>
      <div class="a5-witness-bar-body">
        <div class="ws-field a5-witness-result-field"><label for="${inputId}">ผลการคุ้มครอง</label><input id="${inputId}" value="${escapeHtml(rep.witnessProtection || '')}" placeholder="ผลการคุ้มครอง" ${isInvestigator ? '' : 'disabled'}></div>
        <div class="a5-witness-req">${reqDetail}${buttons}</div>
      </div>
    </section>`;
  }
  function caseDetailShellA5(state, role, activeTab = 'current-task', selectedDocument = null) {
    state = globalThis.ECMISActivity5Workflow?.normalizeA5State(state) || state;
    ensureInquiry(state);
    const c = state.caseData, w = state.workflow;
    const tabs = [['current-task', 'งานปัจจุบัน'], ['overview', 'ภาพรวม'], ['documents', 'เอกสาร'], ['history', 'ประวัติ'], ['case-admin', 'บริหารสำนวน']];
    const context = currentTaskContextA5(state, role);
    const selectedTab = tabs.some(([id]) => id === activeTab) ? activeTab : 'current-task';
    const extensionWorkspaceActive = selectedTab === 'current-task' && role === 'investigator' && state.inquiry?.extensionWorkspace?.active === true;
    const extensionReviewModel = selectedTab === 'current-task' && role !== 'investigator' ? extensionReviewerWorkspaceA5(state) : null;
    const extensionReviewActive = Boolean(extensionReviewModel);
    const tabMarkup = tabs.map(([id, label]) => `<button type="button" id="a5-tab-${id}" role="tab" aria-selected="${String(selectedTab === id)}" aria-controls="a5-panel-${id}" tabindex="${selectedTab === id ? '0' : '-1'}" class="admin-queue-tab${selectedTab === id ? ' active' : ''}" data-a5-workspace-tab="${id}">${label}</button>`).join('');
    const administrationTask = selectedTab === 'current-task' ? currentAdministrationTaskA5(state, role) : null;
    const naccReportTask = selectedTab === 'current-task' && !administrationTask ? currentNaccReportTaskA5(state, role) : null;
    const authoringReportMatch = String(state.workflow?.downstreamStatus || '').match(/^REPORT_(213|644)_(DRAFT|RETURNED)$/);
    const downstreamTask = selectedTab === 'current-task' && !administrationTask && !naccReportTask && !authoringReportMatch ? currentDownstreamTaskA5(state, role) : null;
    const operationTask = administrationTask || naccReportTask || downstreamTask;
    const taskForms = workflowTaskFormsA5(state, role);
    let body = operationTask?.body || `${taskForms}${w.stage === 'a5-intake' && taskForms ? '' : editorForA5(state, role)}`;
    let heading = context.task;
    let kicker = `งานของ ${ROLE_LABELS[role] || role}`;
    let currentActions = operationTask?.actions ?? visibleActionsA5(state, role);
    if (authoringReportMatch) heading = authoringReportMatch[2] === 'RETURNED'
      ? `แก้ไขรายงาน ${authoringReportMatch[1]}`
      : `จัดทำและเสนอรายงาน ${authoringReportMatch[1]}`;
    if (operationTask) { heading = operationTask.heading; kicker = `งานของ ${ROLE_LABELS[role] || role}`; body = operationTask.body; }
    if (selectedTab === 'overview') { heading = 'ภาพรวมสำนวน'; kicker = 'ข้อมูลสำนวน'; body = caseReadonlyA5(state); }
    if (selectedTab === 'documents') { heading = 'เอกสารในขั้นตอนนี้'; kicker = 'เอกสารสำนวน'; body = `<section class="ws-section"><p class="ws-callout">เลือกเอกสารจากรายการหรือแผงเอกสารด้านข้างเพื่อดู แก้ไข และพิมพ์</p>${documentListA5(state)}</section>`; }
    if (selectedTab === 'history') { heading = 'ประวัติสำนวน'; kicker = 'ลำดับการดำเนินงาน'; body = `<section class="ws-section">${historyPanelA5(state)}</section>`; }
    if (selectedTab === 'case-admin') { heading = 'บริหารสำนวน (ธุรการคดี)'; kicker = 'เครื่องมือธุรการคดี'; body = `<section class="ws-section">${adminCaseTools(state, role) || '<p class="ws-callout">สิทธิ์ปัจจุบันดูข้อมูลส่วนนี้ได้ แต่ไม่มีคำสั่งบริหารสำนวน</p>'}</section>`; }
    if (extensionWorkspaceActive || extensionReviewActive) currentActions = '';
    const extensionMarkup = extensionWorkspaceActive
      ? globalThis.ECMISActivity5ExtensionWorkspace?.renderRequesterWorkspace?.(state.inquiry.extensionWorkspace, { renderForm: model => extensionFormPreviewA5(state, model) })
      : '';
    const editor = extensionWorkspaceActive
      ? `<div id="a5ExtensionWorkspaceHost">${extensionMarkup || '<div class="ws-callout">ส่วนจัดทำคำขอขยายเวลาไม่พร้อมใช้งาน กรุณาโหลดหน้าใหม่</div>'}</div>`
      : extensionReviewActive
        ? `<div id="a5ExtensionReviewWorkspaceHost">${globalThis.ECMISActivity5ExtensionReview?.renderReviewerWorkspace?.(extensionReviewModel) || '<div class="ws-callout">ส่วนพิจารณาคำขอขยายเวลาไม่พร้อมใช้งาน กรุณาโหลดหน้าใหม่</div>'}</div>`
      : `<section class="ws-card ws-editor"><header class="ws-editor-head"><div><p class="ws-kicker">${escapeHtml(kicker)}</p><h2 id="a5ActivePanelTitle">${escapeHtml(heading)}</h2></div><span class="ws-status${w.stage === 'closed' ? ' success' : ''}">${escapeHtml(displayStatusA5(state))}</span></header><div class="ws-editor-body">${body}</div></section>`;
    const intakeCurrentTask = w.stage === 'a5-intake' && selectedTab === 'current-task';
    const preferredDocument = selectedDocument || (authoringReportMatch ? authoringReportMatch[1] : null) || (w.stage === 'a5-prelim' && selectedTab === 'current-task' ? '213' : null);
    const documentPane = extensionWorkspaceActive || extensionReviewActive || administrationTask ? '' : (intakeCurrentTask ? inboundDocumentViewerA5(state, preferredDocument) : documentViewerA5(state, preferredDocument));
    const workspace = documentPane ? `<div class="document-workspace">${editor}${documentPane}</div>` : editor;
    const panels = tabs.map(([id]) => `<section id="a5-panel-${id}" class="a5-tab-panel" role="tabpanel" aria-labelledby="a5-tab-${id}"${selectedTab === id ? '' : ' hidden'}>${selectedTab === id ? workspace : ''}</section>`).join('');
    const ownerId = state.assignment?.primaryOfficerId || state.assignment?.legalOwner || state.assignment?.approvedOfficer || state.inquiry?.inquiry644?.investigator || state.inquiry?.intake?.investigator;
    const owner = ownerId ? officerDisplayNameA5(ownerId, state) : context.holder;
    const actions = selectedTab === 'current-task' ? currentActions : '';
    return `<main class="ws-container"><button class="ws-button ghost" id="a5BackList" style="margin-bottom:.8rem">กลับรายการสำนวน</button><section class="ws-card ws-case-head"><div><p class="ws-kicker">${escapeHtml(c.channel || 'ช่องทางไม่ระบุ')} · ${escapeHtml(state.inquiry.intake.unit || c.region || 'หน่วยงานไม่ระบุ')}</p><h1>เลขสำนวน ${escapeHtml(c.id)}</h1><div class="ws-case-meta"><span>${escapeHtml(state.documentData?.documentSubject || c.subject || '')}</span><span>รับเรื่อง ${escapeHtml(c.received || state.intake?.receivedDate?.effectiveDate || 'รอบันทึก')}</span><span class="a5-case-size-badge" title="ขนาดคดี: ${state.caseAdministration?.caseSize === 'XL' ? 'ใหญ่พิเศษ — ผ่านการอนุมัติแล้ว' : (state.caseAdministration?.xlRequest?.status === 'PENDING' ? 'รออนุมัติ XL (แสดงเป็น L ระหว่างรอ)' : state.caseAdministration?.xlRequest?.status === 'PENDING_BOARD' ? 'สาย XL ภายในอนุมัติครบแล้ว — รอมติบอร์ด (กิจกรรมที่ 7) ยืนยัน' : 'ตามหลักเกณฑ์การกำหนดขนาดของเรื่องกล่าวหา')}">ขนาดคดี: ${escapeHtml({ UNDETERMINED: 'ยังไม่กำหนด', S: 'เล็ก (S)', M: 'กลาง (M)', L: 'ใหญ่ (L)', XL: 'ใหญ่พิเศษ (XL)' }[state.caseAdministration?.caseSize] || 'ยังไม่กำหนด')}${state.caseAdministration?.xlRequest?.status === 'PENDING_BOARD' ? ' · รอมติบอร์ด' : state.caseAdministration?.xlRequest?.status === 'PENDING' ? ' · รอ XL' : ''}</span><span class="a5-urgency-badge ${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'fast' : ''}" title="ความเร่งด่วน: ${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'ใบด่วน/เร่งด่วน — เสนอตรงคณะกรรมการ' : 'ปกติ'}">${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'ใบด่วน/เร่งด่วน' : 'ปกติ'}</span></div></div><div class="ws-case-head-right">${xlBadgeA5(state.caseAdministration)}<span class="ws-status${w.stage === 'closed' ? ' success' : ''}">${escapeHtml(displayStatusA5(state))}</span><p class="a5-case-owner">ผู้รับผิดชอบ: ${escapeHtml(owner || 'ยังไม่ระบุ')}</p></div></section><section class="ws-card a5-urgency-bar" aria-label="ความเร่งด่วน"><header class="a5-witness-bar-head"><strong>ความเร่งด่วน</strong><span class="ws-status ${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'warn' : ''}">${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'ใบด่วน' : 'ปกติ'}</span></header><div class="a5-witness-bar-body"><p class="ws-policy-note">คดีสำคัญ/ใกล้ขาดอายุความ/ผู้มีส่วนได้เสียติดตาม — เปลี่ยนได้ตลอด จะส่งผลให้คณะกรรมการพิจารณาเป็นกรณีเร่งด่วน (ACC017/ACC018)</p><button type="button" class="ws-button secondary" data-a5-action="urgency-toggle">${state.inquiry?.prelim?.fastTrack || state.inquiry?.inquiry644?.fastTrack ? 'ยกเลิกใบด่วน — กลับปกติ' : 'ตั้งเป็นใบด่วน/เร่งด่วน'}</button></div></section>${witnessProtectionBarA5(state, role)}${stagebarA5(state)}<nav class="admin-queue-tabs" role="tablist" aria-label="เมนูสำนวน">${tabMarkup}</nav>${panels}${actions ? `<div class="ws-actions a5-current-actions">${actions}</div>` : ''}</main>`;
  }
  function renderA5Detail(id, role, activeTab = 'current-task', selectedDocument = null) {
    const root = $('#a5App');
    if (!root) return;
    const previousExtensionHost = $('#a5ExtensionWorkspaceHost', root);
    if (previousExtensionHost) globalThis.ECMISActivity5ExtensionWorkspace?.disposeMountedRequesterWorkspace?.(previousExtensionHost);
    const state = getState(id);
    if (!state) { notify('error', 'ไม่พบสำนวน', id); return; }
    ensureInquiry(state);
    root.innerHTML = `${headerA5(role, xlBadgeA5(state.caseAdministration, true))}${caseDetailShellA5(state, role, activeTab, selectedDocument)}`;
    $('#a5MockAccount', root)?.addEventListener('change', event => {
      setCurrentA5MockAccount(event.target.value);
      renderA5Detail(id, role, activeTab, selectedDocument);
    });
    const syncSelectedTeam = () => {
      const primary = root.querySelector('input[name="a5PrimaryOfficer"]:checked');
      root.querySelectorAll('input[name="a5AssistantOfficer"]').forEach(input => {
        input.disabled = Boolean(primary && input.value === primary.value);
        if (input.disabled) input.checked = false;
      });
      const assistants = [...root.querySelectorAll('input[name="a5AssistantOfficer"]:checked')].map(input => input.dataset.officerName || input.value);
      const summary = root.querySelector('#a5SelectedTeamSummary');
      if (summary) summary.textContent = primary ? `ผู้รับผิดชอบหลัก: ${primary.dataset.officerName || primary.value} · ผู้ช่วย: ${assistants.join(', ') || 'ไม่มี'}` : 'ยังไม่ได้เลือกผู้รับผิดชอบหลัก';
      A5_ASSIGNMENT_SELECTIONS.set(String(state.caseData?.id || ''), {
        primaryOfficerId: primary?.value || '',
        assistantOfficerIds: [...root.querySelectorAll('input[name="a5AssistantOfficer"]:checked')].map(input => input.value)
      });
      root.querySelectorAll('[data-a5-role-choice]').forEach(button => {
        const row = button.closest('[data-a5-candidate-row]');
        const primaryInput = row?.querySelector('input[name="a5PrimaryOfficer"]');
        const assistantInput = row?.querySelector('input[name="a5AssistantOfficer"]');
        const selectedRole = primaryInput?.checked ? 'primary' : assistantInput?.checked ? 'assistant' : 'none';
        button.setAttribute('aria-pressed', String(button.dataset.a5RoleChoice === selectedRole));
      });
    };
    root.querySelectorAll('[data-a5-role-choice]').forEach(button => button.addEventListener('click', () => {
      const row = button.closest('[data-a5-candidate-row]');
      const primaryInput = row?.querySelector('input[name="a5PrimaryOfficer"]');
      const assistantInput = row?.querySelector('input[name="a5AssistantOfficer"]');
      if (!primaryInput || !assistantInput) return;
      const choice = button.dataset.a5RoleChoice;
      if (choice === 'primary') {
        assistantInput.checked = false;
        primaryInput.checked = true;
      } else if (choice === 'assistant') {
        primaryInput.checked = false;
        assistantInput.disabled = false;
        assistantInput.checked = true;
      } else {
        primaryInput.checked = false;
        assistantInput.disabled = false;
        assistantInput.checked = false;
      }
      syncSelectedTeam();
    }));
    root.querySelectorAll('[data-a5-candidate-focus]').forEach(button => button.addEventListener('click', () => {
      const officerId = button.dataset.a5CandidateFocus;
      A5_ASSIGNMENT_FOCUS.set(String(state.caseData?.id || ''), officerId);
      root.querySelectorAll('[data-a5-candidate-row]').forEach(row => row.classList.toggle('is-focused', row.dataset.a5CandidateRow === officerId));
      root.querySelectorAll('[data-a5-candidate-focus]').forEach(focusButton => focusButton.setAttribute('aria-pressed', String(focusButton.dataset.a5CandidateFocus === officerId)));
      root.querySelectorAll('[data-a5-candidate-detail]').forEach(detail => { detail.hidden = detail.dataset.a5CandidateDetail !== officerId; });
    }));
    syncSelectedTeam();
    bindA5Stagebar(root);
    $('#a5BackList').onclick = () => {
      const extensionHost = $('#a5ExtensionWorkspaceHost', root);
      const extensionController = globalThis.ECMISActivity5ExtensionWorkspace?.getMountedRequesterController?.(extensionHost);
      if (extensionController && globalThis.ECMISActivity5ExtensionWorkspace?.shouldBlockWorkspaceExit?.(extensionController.getModel())) {
        notify('warning', 'ร่างกำลังบันทึก', 'รอให้ระบบบันทึกร่างเสร็จ หรือใช้ปุ่มกลับสู่งานปัจจุบันในพื้นที่คำขอขยายเวลา');
        return;
      }
      view = 'list'; renderA5(role);
    };
    $$('[data-a5-workspace-tab]', root).forEach(button => button.onclick = () => {
      const extensionHost = $('#a5ExtensionWorkspaceHost', root);
      const extensionController = globalThis.ECMISActivity5ExtensionWorkspace?.getMountedRequesterController?.(extensionHost);
      if (extensionController && globalThis.ECMISActivity5ExtensionWorkspace?.shouldBlockWorkspaceExit?.(extensionController.getModel())) {
        notify('warning', 'ร่างกำลังบันทึก', 'รอให้ระบบบันทึกร่างเสร็จก่อนเปลี่ยนแท็บ');
        return;
      }
      renderA5Detail(id, role, button.dataset.a5WorkspaceTab);
    });
    bindA5Tablist($('.admin-queue-tabs', root));
    bindA5Tablist($('.ws-doc-pane .ws-doc-tabs', root));
    const selectInboundDocument = key => {
      const items = inboundDocumentItemsA5(state).items;
      if (key !== '__all__' && !items.some(item => item.key === key)) return;
      $$('[data-a5-inbound-doc]', root).forEach(button => {
        const active = button.dataset.a5InboundDoc === key;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      const stage = $('#a5InboundPaperStage', root);
      const panel = $('#a5-inbound-document-panel', root);
      if (stage) stage.innerHTML = inboundDocumentPaperA5(state, key);
      if (panel && key === '__all__') {
        panel.removeAttribute('aria-labelledby');
        panel.setAttribute('aria-label', 'เอกสารรับเข้าทั้งหมด');
      } else if (panel) {
        panel.removeAttribute('aria-label');
        panel.setAttribute('aria-labelledby', `a5-inbound-tab-${key}`);
      }
      const jump = $('#a5InboundDocJump', root);
      if (jump) jump.value = key;
    };
    $$('[data-a5-inbound-doc]', root).forEach(button => button.onclick = () => selectInboundDocument(button.dataset.a5InboundDoc));
    $('#a5InboundDocJump', root)?.addEventListener('change', event => selectInboundDocument(event.target.value));
    $$('[data-a5-open-doc]', root).forEach(button => button.onclick = () => renderA5Detail(id, role, 'documents', button.dataset.a5OpenDoc));
    wireExtensionWorkspaceA5(state, role);
    wireExtensionReviewWorkspaceA5(state, role);
    wireA5(state, role);
    wireA5Search(role);
    wireA5FontControls();
  }
  function documentTabItemsA5(state) {
    const w = state.workflow || {}, stage = w.stage || '';
    const i = state.inquiry || {};
    const hasExt213 = (i.prelim?.extensionHistory || []).length > 0 || ['a5-prelim', 'a5-prelim-review', 'a7-213'].includes(stage);
    const hasExt644 = (i.inquiry644?.extensionHistory || []).length > 0;
    const inPrelim = ['a5-prelim', 'a5-prelim-review', 'a7-213'].includes(stage);
    const inInquiry = ['a5-inquiry', 'a5-inquiry-review', 'a7-644', 'a5-outcome', 'a5-prosecutor', 'closed'].includes(stage);
    const tabs = [['plan', 'แผนงานคดี'], ['213', 'รายงาน 213']];
    if (hasExt213) tabs.push(['ext213', 'ขอขยาย 213']);
    if (inInquiry) {
      tabs.push(['644', 'รายงาน 644']);
      if (hasExt644) tabs.push(['ext644', 'ขอขยาย 644']);
      tabs.push(['notice', 'แจ้งข้อกล่าวหา'], ['record', 'บันทึกแจ้งข้อกล่าวหา']);
    }
    if (inPrelim || inInquiry) tabs.push(['mti', 'มติ คกก.']);
    if (['a5-outcome', 'a5-prosecutor', 'closed'].includes(stage)) tabs.push(['postdocs', 'แบบเอกสาร 8–20'], ['letters', 'หนังสืออัยการ'], ['warrants', 'หมายจับ']);
    return tabs;
  }
  function docTabsA5(state, selected = 'plan') {
    const tabs = documentTabItemsA5(state);
    return tabs.map(([k, l]) => `<button type="button" id="a5-doc-tab-${k}" role="tab" aria-controls="a5-document-panel" tabindex="${k === selected ? '0' : '-1'}" class="ws-doc-tab ${k === selected ? 'active' : ''}" data-a5-doc="${k}" aria-selected="${String(k === selected)}">${l}</button>`).join('');
  }
  function fitA5Paper() {
    const stage = $('#a5PaperStage');
    if (!stage) return;
    const paper = stage.querySelector('.a5r-paper') || stage.querySelector('.a5-report-paper') || stage.querySelector('.a5-paper');
    if (!paper) return;
    const avail = (stage.clientWidth || 794) - 8;
    const s = Math.min(1, avail / 794);
    const pages = paper.querySelectorAll('.a5r-page, .a5-paper-page, .a5-pg').length || 1;
    if (s < 1) {
      // fit width to stage without scaling (consistent across all paper types)
      paper.style.transform = '';
      paper.style.width = `${Math.round(794 * s)}px`;
      paper.style.height = '';
      paper.style.marginBottom = '0';
      paper.style.transformOrigin = '';
    } else {
      paper.style.transform = '';
      paper.style.width = '';
      paper.style.height = '';
      paper.style.marginBottom = '';
      paper.style.transformOrigin = '';
    }
  }
  function canonicalPlanPaperStateA5(state) {
    const plan = state.a5CasePlan;
    if (!plan) {
      const view = JSON.parse(JSON.stringify(state));
      const p = view.inquiry = view.inquiry || {};
      p.intake = p.intake || {};
      const decision = String(view.caseData?.decision || '');
      p.intake.sourceTypes = { fromNacc: Boolean(p.intake.m62?.flag) || decision.includes('62'), misconduct: decision.includes('18/4') };
      return view;
    }
    const view = JSON.parse(JSON.stringify(state));
    const p = view.inquiry = view.inquiry || {};
    p.prelim = p.prelim || {};
    p.inquiry644 = p.inquiry644 || {};
    p.intake = p.intake || {};
    const metadata = plan.caseMetadata || {}, limitation = plan.limitationDates || {}, eventContext = plan.eventContext || {};
    view.caseData = { ...(view.caseData || {}), subject: metadata.subject || view.caseData?.subject, complainant: metadata.complainant || view.caseData?.complainant };
    p.intake.receivedFirstAt = metadata.receivedAt || p.intake.receivedFirstAt;
    p.intake.investigator = plan.signatures?.owner?.officerName || p.intake.investigator;
    p.intake.team = plan.signatures?.assistant?.officerId ? [plan.signatures.assistant.officerName] : [];
    p.intake.director = plan.signatures?.head?.officerName || p.intake.director;
    p.intake.sourceTypes = { fromNacc: Boolean(metadata.sourceTypes?.fromNacc), misconduct: Boolean(metadata.sourceTypes?.misconduct) };
    p.prelim.deadlineAt = limitation.preliminaryDeadlineAt || p.prelim.deadlineAt;
    p.prelim.storedTwoYearDeadlineAt = limitation.twoYearDeadlineAt || '';
    p.prelim.place = eventContext.occurredAtPlace || p.prelim.place;
    p.prelim.witnesses = (plan.witnesses || []).map(row => ({ name: row.name || '', relevance: row.relevance || '', issues: row.issues || '' }));
    p.prelim.requestedDocuments = plan.requestedDocuments || [];
    p.prelim.otherOperations = plan.otherOperations || [];
    p.prelim.otherOperationsFixed = plan.otherOperationsFixed || [];
    p.prelim.scheduleRows = plan.scheduleRows || [];
    p.inquiry644.accused = (plan.accusedRows || []).map(row => row.name || '');
    p.inquiry644.allegations = metadata.allegation || p.inquiry644.allegations;
    const issueMap = Object.fromEntries((plan.fourIssues || []).map(row => [row.issue, row]));
    const actionMap = Object.fromEntries((plan.requiredEvidenceActions || []).map(row => [row.issue, row]));
    p.prelim.issues = {
      status: issueMap['สถานะ']?.details || '', authority: issueMap['อำนาจหน้าที่']?.details || '', action: issueMap['การกระทำความผิด']?.details || '', damage: issueMap['ความเสียหาย']?.details || '',
      statusDocs: actionMap['สถานะ']?.requiredEvidence || '', authorityDocs: actionMap['อำนาจหน้าที่']?.requiredEvidence || '', actionDocs: actionMap['การกระทำความผิด']?.requiredEvidence || '', damageDocs: actionMap['ความเสียหาย']?.requiredEvidence || '',
      statusTodo: actionMap['สถานะ']?.action || '', authorityTodo: actionMap['อำนาจหน้าที่']?.action || '', actionTodo: actionMap['การกระทำความผิด']?.action || '', damageTodo: actionMap['ความเสียหาย']?.action || ''
    };
    p.prelim.accusedTables = (plan.accusedRows || []).filter(row => row && row.name).map(row => {
      const nestedIssues = Array.isArray(row.fourIssues) ? row.fourIssues : [];
      const nestedActions = Array.isArray(row.requiredEvidenceActions) ? row.requiredEvidenceActions : [];
      const checks = row.tableRows || {};
      const keys = ['สถานะ', 'อำนาจหน้าที่', 'การกระทำความผิด', 'ความเสียหาย'];
      return {
        name: row.name,
        rows: keys.map((issue, index) => {
          const nestedIssue = nestedIssues[index] || {};
          const nestedAction = nestedActions[index] || {};
          const flatIssue = issueMap[issue] || {};
          const flatAction = actionMap[issue] || {};
          const group = index === 0 ? 'status' : index === 1 ? 'authority' : index === 2 ? 'act' : 'damage';
          return {
            issue,
            details: nestedIssue.details ?? flatIssue.details ?? '',
            requiredEvidence: nestedAction.requiredEvidence ?? flatAction.requiredEvidence ?? '',
            action: nestedAction.action ?? flatAction.action ?? '',
            checks: (checks[group]?.checks || []).map(Boolean)
          };
        })
      };
    });
    const firstLimitation = limitation.limitationRows?.[0] || {};
    const secondLimitation = limitation.limitationRows?.[1] || {};
    p.prelim.limitation = { shortSection: firstLimitation.section || '', shortYears: firstLimitation.years || '', shortExpiry: firstLimitation.expiresAt || '', longSection: secondLimitation.section || '', longYears: secondLimitation.years || '', longExpiry: secondLimitation.expiresAt || '' };
    return view;
  }
  let selectedNoticeAccusedRowId = '';
  function accusedPaperPickerA5(accusedRows, selectedId, selectId) {
    if (!Array.isArray(accusedRows) || accusedRows.length < 2) return '';
    return `<div class="ws-field a5-notice-accused-picker"><label>ผู้ถูกกล่าวหา</label><select id="${selectId}">${accusedRows.map(row => `<option value="${escapeHtml(row.rowId)}"${row.rowId === selectedId ? ' selected' : ''}>${escapeHtml(row.name || row.rowId)}</option>`).join('')}</select></div>`;
  }
  function paperForTab(state, tab) {
    if (state.caseData?.decision === '58/2') return paperSpecial58(state);
    switch (tab) {
      case 'plan': return paperPlan(canonicalPlanPaperStateA5(state));
      case '213': return paper213(state);
      case 'ext213': return paperExt(state, '213');
      case '644': {
        const api = globalThis.ECMISActivity5Report644;
        const normalized = api?.normalizeReport644A5?.(state);
        const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === api?.FORM_7_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        return record ? api.renderReport644PaperA5(record.payload) : paper644(state);
      }
      case 'ext644': return paperExt(state, '644');
      case 'notice': {
        const api = globalThis.ECMISActivity5Report644;
        const normalized = api?.normalizeReport644A5?.(state);
        const form7 = normalized?.state?.a5DocumentStore?.records?.find(item => item.documentId === api?.FORM_7_ID);
        const accusedRows = form7?.payload?.accusedPersons || [];
        const targetId = accusedRows.some(row => row.rowId === selectedNoticeAccusedRowId) ? selectedNoticeAccusedRowId : accusedRows[0]?.rowId;
        const record = targetId && normalized?.state?.a5DocumentStore?.records?.find(item => item.documentId === api.form5DocId(targetId));
        return record ? `${accusedPaperPickerA5(accusedRows, targetId, 'a5NoticeAccusedSelect')}${api.renderForm5PaperA5(record.payload)}` : paperNoticeAccusation(state);
      }
      case 'record': {
        const api = globalThis.ECMISActivity5Report644;
        const normalized = api?.normalizeReport644A5?.(state);
        const form7 = normalized?.state?.a5DocumentStore?.records?.find(item => item.documentId === api?.FORM_7_ID);
        const accusedRows = form7?.payload?.accusedPersons || [];
        const targetId = accusedRows.some(row => row.rowId === selectedNoticeAccusedRowId) ? selectedNoticeAccusedRowId : accusedRows[0]?.rowId;
        const record = targetId && normalized?.state?.a5DocumentStore?.records?.find(item => item.documentId === api.form6DocId(targetId));
        return record ? `${accusedPaperPickerA5(accusedRows, targetId, 'a5RecordAccusedSelect')}${api.renderForm6PaperA5(record.payload)}` : paperRecordAccusation(state);
      }
      case 'letters': return paperProsecutorLetters(state);
      case 'warrants': return paperWarrants(state);
      case 'postdocs': return globalThis.ECMISActivity5PostResolution?.renderPostDocumentPaperA5?.(state) || paperWarrants(state);
      case 'mti': return paperMti(state, state.workflow?.stage === 'a7-644' || state.workflow?.stage === 'a5-outcome' || state.workflow?.stage === 'a5-prosecutor' || state.workflow?.stage === 'closed' ? '644' : '213');
      case 'letter': return paperShell('หนังสือส่งสำนวนคดี', [['เลขที่', state.documentData?.dispatchLetterNo || ''], ['ถึง', state.inquiry.intake.unit || ''], ['วิธีจัดส่ง', state.documentData?.dispatchSendMethod || ''], ['เลข EMS', state.documentData?.dispatchEms || '']], `<p class="ws-paper-text">ส่งสำนวนคดี ${escapeHtml(state.caseData.id)} ไปยัง ${escapeHtml(state.inquiry.intake.unit || '')} เพื่อดำเนินการตามอำนาจหน้าที่ ตามมติ/คำสั่งที่เกี่ยวข้อง</p>`, [{ role: 'หัวหน้าพนักงาน ป.ป.ท.', name: state.inquiry.intake.director || '' }]);
      default: return paper213(state);
    }
  }

  /* ---------- Intelligent Suggest (port จาก A4 — ระบบรับเรื่องร้องเรียน) ---------- */
  function correctThaiWriting(value) {
    const replacements = [
      [/\s{2,}/g, ' '], [/เจา้หน้าที่/g, 'เจ้าหน้าที่'], [/จังหวะด/g, 'จังหวัด'], [/อัติโนมัติ/g, 'อัตโนมัติ'],
      [/ผอ\.?\s*ศรร\.?/g, 'ผู้อำนวยการศูนย์รับเรื่องร้องเรียน'], [/ผอ\.?\s*กบค\.?/g, 'ผู้อำนวยการกองบริหารคดี'], [/ป\.?ป\.?ช\.?/g, 'ป.ป.ช.'], [/ป\.?ป\.?ท\.?/g, 'ป.ป.ท.'],
      [/ส่งกลับไปแก้/g, 'ส่งกลับเพื่อแก้ไข'], [/เช็ค/g, 'ตรวจสอบ'], [/เบิกจ่ายเท็จ/g, 'เบิกจ่ายอันเป็นเท็จ'], [/ชี้มูลผิด/g, 'ชี้มูลความผิด']
    ];
    return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value || '')).trim();
  }
  function formalizeWriting(value) {
    return correctThaiWriting(value)
      .replace(/อยากให้/g, 'เห็นควรให้')
      .replace(/โอเค/g, 'เห็นชอบ')
      .replace(/ทำต่อ/g, 'ดำเนินการต่อ')
      .replace(/ส่งต่อไป/g, 'ส่งต่อเพื่อดำเนินการ')
      .replace(/ไม่จบ/g, 'ไม่แล้วเสร็จ')
      .replace(/ไปดู/g, 'ไปตรวจสอบ');
  }
  const A5_SUGGESTION_STORAGE_KEY = 'ecmis-a5-suggestions-v1';
  const A5_DEFAULT_SUGGESTIONS = {
    keywords: ['โปรดตรวจสอบข้อเท็จจริงเพิ่มเติม', 'เอกสารประกอบยังไม่ครบถ้วน', 'รอเอกสารหลักฐานจากหน่วยงานที่เกี่ยวข้อง', 'เสนอให้สอบปากคำพยานเพิ่มเติม'],
    notAcceptReasons: ['ข้อเท็จจริงไม่เพียงพอต่อการดำเนินการ', 'ไม่อยู่ในอำนาจหน้าที่ของสำนักงาน ป.ป.ท.', 'ไม่ปรากฏพฤติการณ์หรือบุคคลที่เกี่ยวข้องชัดเจน', 'เรื่องอยู่ระหว่างการพิจารณาของหน่วยงานอื่น'],
    contexts: {
      a5Plan: ['รวบรวมพยานหลักฐานจากหน่วยงานต้นสังกัด', 'สอบปากคำผู้กล่าวหาและพยานบุคคลที่เกี่ยวข้อง', 'ตรวจสอบสถานที่เกิดเหตุและจัดทำแผนที่', 'ขอเอกสารการจัดซื้อจัดจ้างและหลักฐานการเงิน', 'รอผลการตรวจสอบจากหน่วยงานภายนอก'],
      a5WorkLog: ['ได้รวบรวมพยานหลักฐานและเอกสารที่เกี่ยวข้องแล้ว', 'สอบปากคำผู้ที่เกี่ยวข้องจำนวน 3 ปาก', 'ขอข้อมูลเพิ่มเติมจากหน่วยงานต้นสังกัดแล้ว', 'ตรวจสอบข้อเท็จจริงและประเด็นแห่งคดีครบถ้วน'],
      a5Allegations: ['ร้องเรียนการจัดซื้อจัดจ้างไม่เป็นไปตามระเบียบ', 'การใช้อำนาจโดยมิชอบของเจ้าหน้าที่รัฐ', 'การเรียกรับผลประโยชน์เพื่อแลกกับการอนุมัติ', 'การเบิกจ่ายงบประมาณอันเป็นเท็จ'],
      a5Accused: ['นาย', 'นาง', 'นางสาว'],
      a5ChainOpinion: ['เห็นชอบตามความเห็นและข้อเสนอของผู้รับผิดชอบสำนวน', 'ตรวจสอบข้อเท็จจริงและรวบรวมเอกสารเพิ่มเติมก่อนเสนอ', 'เห็นควรเสนอคณะกรรมการพิจารณา', 'ส่งกลับให้แก้ไขรายงานให้ครบถ้วน'],
      a5CommitteeExtOpinion: ['อนุมัติให้ขยายระยะเวลาออกไปอีก', 'ไม่อนุมัติให้ขยายระยะเวลา — ให้เร่งรัดดำเนินการ', 'ให้รายงานความคืบหน้าทุก 15 วัน', 'ครั้งสุดท้ายแล้ว หากยังไม่แล้วเสร็จให้เสนอคณะกรรมการพิจารณา'],
      a5Mti213Note: ['มติรับไว้ไต่สวน — ตั้งคณะอนุกรรมการไต่สวนตาม ม.24 ว.3', 'มติรับไว้ไต่สวน — ตั้งคณะพนักงานไต่สวนตาม ม.24 ว.1', 'ไม่รับไว้ไต่สวน — สิทธิฟ้องระงับตาม ม.25-26', 'ส่งสำนักงาน ป.ป.ช. ตาม ม.18/1(ข)(3)'],
      a5Mti644Note: ['ชี้มูลความผิดอาญาและวินัย — ส่งอัยการและต้นสังกัด', 'ชี้มูลวินัยอย่างเดียว — ส่งต้นสังกัดดำเนินการ', 'ยุติเรื่อง — ข้อกล่าวหาไม่มีมูล', 'ส่งพนักงานสอบสวนดำเนินคดีอาญา'],
      a5SpecialResult: ['ตรวจสอบข้อเท็จจริงแล้วไม่พบพฤติการณ์ทุจริต', 'พบความเดือดร้อนของประชาชน — แจ้งหน่วยงานแก้ไข', 'พบพฤติการณ์ทุจริต — เปลี่ยนเส้นทางเข้าคดี', 'แจ้งสำนักงานการตรวจเงินแผ่นดิน (สตง.) ตาม ม.58/3'],
      a5SupportOpinion: ['เห็นสอดคล้องกับคณะพนักงานไต่สวน — เสนอคณะกรรมการพิจารณา', 'มีความเห็นเพิ่มเติมให้ตรวจสอบประเด็น', 'เห็นควรให้รวบรวมพยานหลักฐานเพิ่มเติม']
    },
    usage: {}
  };
  function a5ReadSuggestions() {
    try {
      const stored = JSON.parse(localStorage.getItem(A5_SUGGESTION_STORAGE_KEY) || 'null');
      if (!stored) return structuredClone(A5_DEFAULT_SUGGESTIONS);
      return { ...structuredClone(A5_DEFAULT_SUGGESTIONS), ...stored, contexts: { ...structuredClone(A5_DEFAULT_SUGGESTIONS.contexts), ...(stored.contexts || {}) }, usage: stored.usage || {} };
    } catch { return structuredClone(A5_DEFAULT_SUGGESTIONS); }
  }
  function a5WriteSuggestions(settings) { localStorage.setItem(A5_SUGGESTION_STORAGE_KEY, JSON.stringify(settings)); }
  function a5LearnContextSuggestion(context, value) {
    const text = String(value || '').trim().replace(/\s+/g, ' ');
    if (text.length < 8 || text.length > 160) return;
    const settings = a5ReadSuggestions();
    const usageKey = `${context}:${text}`;
    settings.usage[usageKey] = (settings.usage[usageKey] || 0) + 1;
    settings.contexts[context] = settings.contexts[context] || [];
    if (settings.usage[usageKey] >= 2 && !settings.contexts[context].includes(text)) settings.contexts[context].unshift(text);
    a5WriteSuggestions(settings);
  }
  function a5ContextualSuggestions(context, value) {
    const settings = a5ReadSuggestions();
    const unique = [...(settings.contexts[context] || []), ...settings.keywords].filter((text, index, array) => array.indexOf(text) === index && !value.includes(text));
    const terms = value.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    return unique.map((text, index) => ({ text, index, score: terms.reduce((score, term) => score + (text.toLowerCase().includes(term) ? 2 : 0), 0) + (settings.usage[`${context}:${text}`] || 0) })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 3).map(item => item.text);
  }
  function attachIntelligentSuggestion(id, label, context = id) {
    const input = $(`#${id}`);
    if (!input || input.parentElement?.querySelector(`.smart-inline[data-context="${context}"]`)) return;
    input.closest('.ws-field')?.classList.add('smart-field');
    const panel = document.createElement('div');
    panel.className = 'smart-inline';
    panel.dataset.context = context;
    const popoverId = `smart-inline-${id}`;
    panel.innerHTML = `<button type="button" class="smart-inline-trigger" aria-expanded="false" aria-controls="${popoverId}"><span class="smart-inline-dot"></span><span>คำแนะนำการเขียน</span><small>พร้อมตรวจ</small></button><div class="smart-inline-popover ws-hidden" id="${popoverId}" role="listbox"></div>`;
    input.insertAdjacentElement('afterend', panel);
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', popoverId);
    input.setAttribute('aria-expanded', 'false');
    const trigger = $('.smart-inline-trigger', panel), popover = $('.smart-inline-popover', panel);
    let closeTimer = 0, renderTimer = 0, activeIndex = -1;
    const open = () => { clearTimeout(closeTimer); panel.classList.add('open'); popover.classList.remove('ws-hidden'); trigger.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-expanded', 'true'); };
    const close = () => { panel.classList.remove('open'); popover.classList.add('ws-hidden'); trigger.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-expanded', 'false'); activeIndex = -1; };
    const applyValue = value => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); panel.classList.add('suggestion-selected'); setTimeout(() => panel.classList.remove('suggestion-selected'), 420); };
    const render = () => {
      const value = input.value.trim(), corrected = correctThaiWriting(value), formal = formalizeWriting(value), suggestions = a5ContextualSuggestions(context, value);
      const actions = [];
      if (value && corrected !== value) actions.push(`<button type="button" role="option" class="smart-inline-action" data-smart-value="${escapeHtml(corrected)}"><span>แก้คำและช่องว่าง</span><small>${escapeHtml(corrected)}</small></button>`);
      if (value && formal !== value && formal !== corrected) actions.push(`<button type="button" role="option" class="smart-inline-action" data-smart-value="${escapeHtml(formal)}"><span>ปรับเป็นภาษาราชการ</span><small>${escapeHtml(formal)}</small></button>`);
      const suggestionHtml = suggestions.map(text => `<button type="button" role="option" class="smart-inline-suggestion" data-smart-suggestion="${escapeHtml(text)}">${escapeHtml(text)}</button>`).join('');
      popover.innerHTML = `${actions.join('')}${suggestionHtml ? `<div class="smart-inline-suggestions"><span>${value ? 'ข้อความที่เกี่ยวข้อง' : 'เริ่มต้นด้วยข้อความแนะนำ'}</span>${suggestionHtml}</div>` : ''}${!actions.length && !suggestions.length ? '<p class="smart-inline-clear">ข้อความชัดเจนแล้ว</p>' : ''}`;
      $('small', trigger).textContent = actions.length ? `พบ ${actions.length} จุดที่ปรับได้` : suggestions.length ? `${suggestions.length} ข้อเสนอ` : 'ตรวจแล้ว';
      $$('[data-smart-value]', popover).forEach(button => button.onclick = () => applyValue(button.dataset.smartValue));
      $$('[data-smart-suggestion]', popover).forEach(button => button.onclick = () => { const text = button.dataset.smartSuggestion; if (input.tagName === 'INPUT') applyValue(text); else if (!input.value.includes(text)) applyValue([input.value.trim(), text].filter(Boolean).join('\n')); });
      activeIndex = -1;
    };
    trigger.onclick = () => { render(); panel.classList.contains('open') ? close() : open(); };
    input.addEventListener('focus', () => { render(); open(); });
    input.addEventListener('input', () => { clearTimeout(renderTimer); renderTimer = setTimeout(() => { render(); open(); }, 180); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'Tab') { close(); return; }
      if (event.ctrlKey && event.code === 'Space') { event.preventDefault(); render(); open(); return; }
      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
      const options = $$('[role="option"]', popover);
      if (!options.length) return;
      if (event.key === 'Enter') { if (activeIndex < 0) return; event.preventDefault(); options[activeIndex].click(); return; }
      event.preventDefault();
      open();
      activeIndex = event.key === 'ArrowDown' ? (activeIndex + 1) % options.length : (activeIndex - 1 + options.length) % options.length;
      options.forEach((option, index) => option.classList.toggle('is-active', index === activeIndex));
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    });
    input.addEventListener('blur', () => { closeTimer = setTimeout(close, 180); });
    panel.addEventListener('mousedown', event => event.preventDefault());
    input.addEventListener('change', () => a5LearnContextSuggestion(context, input.value));
    render();
  }
  function wireA5Suggestions() {
    ['a5Plan', 'a5Plan644', 'a5WorkLog', 'a5Allegations', 'a5ChainOpinion', 'a5CommitteeExtOpinion', 'a5Mti213Note', 'a5Mti644Note', 'a5SpecialResult', 'a5SupportOpinion', 'a5SupportOpinion644'].forEach(id => attachIntelligentSuggestion(id, 'คำแนะนำการเขียน', id));
  }
  function wireA5(state, role) {
    ThaiDatePicker.wireAll($('#a5App'));
    wireA5Suggestions();
    /* ---------- Word Engine A5: working copy แยกจากข้อมูลสำนวน ---------- */
    const docStage = $('#a5PaperStage'), docFab = $('#a5DocEditFab'), docBar = $('#a5DocEditBar');
    const docActions = $('#a5DocEditActions'), docSave = $('#a5DocSave'), docCancel = $('#a5DocCancel'), docStatus = $('#a5DocSaveStatus');
    const activeDocumentTab = () => $('.ws-doc-tab.active')?.dataset?.a5Doc || 'plan';
    const editableFields = () => $$('#a5PaperStage .a5-fill, #a5PaperStage .a5-fill-block').filter(el => !el.closest('.a5-lock'));
    const editKey = (tab, index) => `${tab}:field:${index}`;
    let documentDirty = false;

    const sanitizeEditableHtml = html => {
      const template = document.createElement('template');
      template.innerHTML = String(html || '');
      const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'UL', 'OL', 'LI', 'DIV', 'P', 'SPAN', 'FONT']);
      const allowedStyles = new Set(['color', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration']);
      [...template.content.querySelectorAll('*')].forEach(el => {
        if (!allowedTags.has(el.tagName)) {
          el.replaceWith(...el.childNodes);
          return;
        }
        [...el.attributes].forEach(attribute => {
          const isFontAttribute = el.tagName === 'FONT' && ['color', 'face', 'size'].includes(attribute.name);
          if (attribute.name === 'style') {
            [...el.style].forEach(property => { if (!allowedStyles.has(property)) el.style.removeProperty(property); });
            if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
          } else if (!isFontAttribute) el.removeAttribute(attribute.name);
        });
      });
      return template.innerHTML;
    };

    const markDocumentStatus = (text, tone = '') => {
      if (!docStatus) return;
      docStatus.textContent = text;
      docStatus.dataset.tone = tone;
    };

    const applyWorkingCopy = (sourceState = state, tab = activeDocumentTab()) => {
      const edits = sourceState.inquiry?.docEdits || {};
      editableFields().forEach((field, index) => {
        field.dataset.a5EditKey = editKey(tab, index);
        const savedHtml = edits[field.dataset.a5EditKey];
        const legacyText = edits[`html-${tab}-${index}`];
        if (savedHtml !== undefined) field.innerHTML = sanitizeEditableHtml(savedHtml);
        else if (legacyText !== undefined) field.textContent = legacyText;
        const hasOverride = savedHtml !== undefined || legacyText !== undefined;
        if (hasOverride) {
          const hasSavedValue = field.textContent.trim() !== '';
          field.classList.toggle('a5-blank', !hasSavedValue && field.classList.contains('a5-fill'));
          if (field.classList.contains('a5-fill-block')) field.classList.toggle('has-value', hasSavedValue);
        }
      });
    };

    const setDocumentEditMode = on => {
      applyWorkingCopy(getState(state.caseData.id) || state);
      editableFields().forEach(field => {
        if (on) {
          field.setAttribute('contenteditable', 'true');
          field.setAttribute('role', 'textbox');
          field.setAttribute('aria-multiline', 'true');
        } else {
          field.removeAttribute('contenteditable');
          field.removeAttribute('role');
          field.removeAttribute('aria-multiline');
        }
      });
      docStage?.classList.toggle('doc-edit-mode', on);
      docFab?.classList.toggle('active', on);
      docBar?.classList.toggle('show', on);
      if (docActions) docActions.hidden = !on;
      if (docFab) docFab.hidden = on;
      documentDirty = false;
      markDocumentStatus('บันทึกแล้ว', 'saved');
    };

    const saveDocumentWorkingCopy = () => {
      const latest = getState(state.caseData.id) || state;
      ensureInquiry(latest);
      latest.inquiry.docEdits = latest.inquiry.docEdits || {};
      const tab = activeDocumentTab();
      editableFields().forEach((field, index) => {
        latest.inquiry.docEdits[editKey(tab, index)] = sanitizeEditableHtml(field.innerHTML);
      });
      try {
        saveState(latest.caseData.id, latest);
        state.inquiry.docEdits = { ...latest.inquiry.docEdits };
        documentDirty = false;
        markDocumentStatus('บันทึกแล้ว', 'saved');
        setDocumentEditMode(false);
        notify('success', 'บันทึกเอกสารแล้ว', 'ข้อมูลฉบับแก้ไขถูกเก็บแยกจากข้อมูลสำนวนต้นทาง');
      } catch {
        markDocumentStatus('บันทึกไม่สำเร็จ', 'error');
        notify('error', 'บันทึกเอกสารไม่สำเร็จ', 'ข้อมูลยังอยู่บนหน้าจอ กรุณาลองบันทึกอีกครั้ง');
      }
    };

    const cancelDocumentWorkingCopy = () => {
      const latest = getState(state.caseData.id) || state;
      const tab = activeDocumentTab();
      docStage.innerHTML = paperForTab(latest, tab);
      applyWorkingCopy(latest, tab);
      setDocumentEditMode(false);
      fitA5Paper();
    };

    if (docStage) {
      applyWorkingCopy(state);
      docStage.addEventListener('input', event => {
        const field = event.target.closest('[data-a5-edit-key]');
        if (!field) return;
        field.classList.remove('a5-blank');
        if (field.classList.contains('a5-fill-block')) field.classList.add('has-value');
        documentDirty = true;
        markDocumentStatus('ยังไม่บันทึก', 'dirty');
      });
      docStage.addEventListener('paste', event => {
        const field = event.target.closest('[data-a5-edit-key]');
        if (!field) return;
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData?.getData('text/plain') || '');
      });
      fitA5Paper();
    }
    docFab?.addEventListener('click', () => setDocumentEditMode(true));
    docSave?.addEventListener('click', saveDocumentWorkingCopy);
    docCancel?.addEventListener('click', cancelDocumentWorkingCopy);
    docBar?.addEventListener('mousedown', event => {
      if (!event.target.closest('select, input, label')) event.preventDefault();
    });
    docBar?.addEventListener('click', event => {
      const format = event.target.closest('[data-format]');
      if (!format) return;
      document.execCommand(format.dataset.format);
      documentDirty = true;
      markDocumentStatus('ยังไม่บันทึก', 'dirty');
    });
    docBar?.addEventListener('change', event => {
      const format = event.target.closest('[data-format]');
      if (!format || !event.target.value) return;
      document.execCommand(format.dataset.format, false, event.target.value);
      documentDirty = true;
      markDocumentStatus('ยังไม่บันทึก', 'dirty');
    });
    const detailRoleSelector = $('#wsRoleA5');
    if (detailRoleSelector) detailRoleSelector.onchange = event => {
      const extensionHost = $('#a5ExtensionWorkspaceHost');
      const extensionController = globalThis.ECMISActivity5ExtensionWorkspace?.getMountedRequesterController?.(extensionHost);
      if (extensionController && globalThis.ECMISActivity5ExtensionWorkspace?.shouldBlockWorkspaceExit?.(extensionController.getModel())) {
        event.target.value = role;
        notify('warning', 'ร่างกำลังบันทึก', 'รอให้ระบบบันทึกร่างเสร็จก่อนเปลี่ยนสิทธิ์');
        return;
      }
      if (documentDirty) {
        event.target.value = role;
        markDocumentStatus('บันทึกหรือยกเลิกก่อนเปลี่ยนสิทธิ์', 'error');
        return;
      }
      sessionStorage.setItem(A5_ROLE_KEY, event.target.value);
      renderA5Detail(state.caseData.id, event.target.value);
    };
    const closeDocumentViewer = event => {
      event?.preventDefault();
      if (documentDirty) return notify('warning', 'เอกสารยังไม่บันทึก', 'บันทึกหรือยกเลิกการแก้ไขก่อนปิดตัวอย่างเอกสาร');
      const returnDocument = activeDocumentTab();
      renderA5Detail(state.caseData.id, role, 'documents');
      requestAnimationFrame(() => $(`[data-a5-open-doc="${returnDocument}"]`, $('#a5App'))?.focus());
    };
    $('[data-a5-close-document]')?.addEventListener('click', closeDocumentViewer);
    $('.a5-document-dialog')?.addEventListener('cancel', closeDocumentViewer);
    // ปุ่มย่อ/ขยายแผงเอกสาร (เหมือนระบบรับเรื่อง)
    const a5DocWs = document.querySelector('#a5App .document-workspace');
    if (a5DocWs && !a5DocWs.dataset.paneBound) {
      a5DocWs.dataset.paneBound = '1';
      const setPaneCollapsed = collapsed => {
        const pane = $('.ws-doc-pane', a5DocWs);
        const rail = $('.ws-doc-pane-rail', a5DocWs);
        const toggle = $('.ws-doc-pane-toggle', a5DocWs);
        a5DocWs.classList.toggle('pane-collapsed', collapsed);
        if (toggle) toggle.setAttribute('aria-expanded', String(!collapsed));
        if (rail) rail.setAttribute('aria-expanded', String(!collapsed));
        [...(pane?.children || [])].filter(child => child !== rail).forEach(child => {
          child.inert = collapsed;
          if (collapsed) child.setAttribute('aria-hidden', 'true');
          else child.removeAttribute('aria-hidden');
        });
        const focusTarget = collapsed ? rail : toggle;
        if (pane?.contains(document.activeElement)) requestAnimationFrame(() => focusTarget?.focus());
        try { localStorage.setItem('ecmis-a5-docpane-collapsed', collapsed ? '1' : '0'); } catch {}
        setTimeout(() => fitA5Paper(), 320);
      };
      try { if (localStorage.getItem('ecmis-a5-docpane-collapsed') === '1') setPaneCollapsed(true); } catch {}
      a5DocWs.addEventListener('click', e => {
        const t = e.target.closest('.ws-doc-pane-toggle, .ws-doc-pane-rail');
        if (!t) return;
        if (t.classList.contains('ws-doc-pane-rail')) setPaneCollapsed(false);
        else setPaneCollapsed(!a5DocWs.classList.contains('pane-collapsed'));
      });
    }
    // ลากแถบจัดรูปแบบ + ปุ่มแก้ไขเอกสารไปมาได้อิสระ (จำตำแหน่งไว้)
    const makeDraggable = (el, storageKey) => {
      if (!el || el.dataset.dragBound) return;
      el.dataset.dragBound = '1';
      el.style.cursor = 'grab';
      el.style.touchAction = 'none';
      let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, dragging = false;
      const mobileQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 767px)') : null;
      const resetPosition = () => {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.transform = '';
        el.style.margin = '';
      };
      const clampPosition = () => {
        if (!el.isConnected) {
          window.removeEventListener('resize', clampPosition);
          return;
        }
        if (mobileQuery?.matches) {
          resetPosition();
          return;
        }
        if (el.style.position !== 'fixed') return;
        const rect = el.getBoundingClientRect();
        const position = clampA5FloatingPosition(
          Number.parseFloat(el.style.left) || rect.left,
          Number.parseFloat(el.style.top) || rect.top,
          window.innerWidth || 1200,
          window.innerHeight || 800,
          rect.width || 40,
          rect.height || 40
        );
        el.style.left = position.x + 'px';
        el.style.top = position.y + 'px';
      };
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && !mobileQuery?.matches) {
          const [lx, ly] = saved.split(',').map(Number);
          if (Number.isFinite(lx) && Number.isFinite(ly)) {
            el.style.position = 'fixed';
            el.style.left = lx + 'px';
            el.style.top = ly + 'px';
            el.style.transform = 'none';
            el.style.margin = '0';
            clampPosition();
          }
        }
      } catch {}
      window.addEventListener('resize', clampPosition);
      mobileQuery?.addEventListener?.('change', clampPosition);
      el.addEventListener('pointerdown', e => {
        if (mobileQuery?.matches) {
          resetPosition();
          return;
        }
        if (el !== docFab && e.target.closest('button, select, input, a')) return;
        e.preventDefault();
        const r = el.getBoundingClientRect();
        sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
        moved = false; dragging = true;
        el.style.position = 'fixed';
        el.style.left = ox + 'px';
        el.style.top = oy + 'px';
        el.style.transform = 'none';
        el.style.margin = '0';
        el.style.transition = 'none';
        el.style.cursor = 'grabbing';
        try { el.setPointerCapture(e.pointerId); } catch {}
      });
      el.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) > 3) moved = true;
        if (!moved) return;
        const nx = ox + dx, ny = oy + dy;
        const rect = el.getBoundingClientRect();
        const position = clampA5FloatingPosition(nx, ny, window.innerWidth || 1200, window.innerHeight || 800, rect.width || 40, rect.height || 40);
        el.style.left = position.x + 'px';
        el.style.top = position.y + 'px';
      });
      const endDrag = e => {
        if (!dragging) return;
        dragging = false;
        el.style.cursor = 'grab';
        el.style.transition = '';
        if (moved) {
          try { localStorage.setItem(storageKey, el.style.left + ',' + el.style.top); } catch {}
        }
      };
      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);
      el.addEventListener('click', e => { if (moved) { e.stopPropagation(); moved = false; } });
    };
    makeDraggable(docBar, 'ecmis-a5-docbar-pos');
    $$('#a5App [data-a5-doc]').forEach(b => b.onclick = () => {
      if (documentDirty) {
        markDocumentStatus('บันทึกหรือยกเลิกก่อนเปลี่ยนเอกสาร', 'error');
        return;
      }
      $$('#a5App [data-a5-doc]').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      const latest = getState(state.caseData.id) || state;
      $('#a5PaperStage').innerHTML = paperForTab(captureDetail(latest, role), b.dataset.a5Doc);
      // รอบ 4: สลับกลับแท็บ 213 → สะท้อนข้อมูลล่าสุดจากฟอร์มซ้าย (รวมที่ยังไม่บันทึก) ไม่ใช่ state เก่า
      if (b.dataset.a5Doc === '213') {
        const formEditor = $('#a5App .ws-editor-body .a5r-editor');
        const reportApi = globalThis.ECMISActivity5Report213;
        const normalized = reportApi?.normalizeReport213A5?.(latest);
        const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        if (formEditor && record) {
          const payload = reportApi.captureReport213EditorA5(formEditor, record.payload);
          $('#a5PaperStage').innerHTML = reportApi.renderReport213PaperA5(payload);
        }
      }
      $('#a5-document-panel')?.setAttribute('aria-labelledby', b.id);
      applyWorkingCopy(latest, b.dataset.a5Doc);
      setDocumentEditMode(false);
      fitA5Paper();
    });
    ['a5NoticeAccusedSelect', 'a5RecordAccusedSelect'].forEach(id => {
      $(`#${id}`)?.addEventListener('change', event => {
        selectedNoticeAccusedRowId = event.target.value;
        const latest = getState(state.caseData.id) || state;
        const activeTab = $('#a5App [data-a5-doc].active')?.dataset.a5Doc || 'notice';
        $('#a5PaperStage').innerHTML = paperForTab(captureDetail(latest, role), activeTab);
        fitA5Paper();
      });
    });
    // ---- รายงาน 213: กลุ่ม + ตัวอย่างเอกสารสด (owner อนุมัติ redesign 15 ส.ค. 69) ----
    const a5ReportGroups = () => globalThis.ECMISActivity5Report213?.REPORT_213_GROUPS || [];
    const activateA5ReportGroup = id => {
      const editor = $('#a5App .a5-report-editor');
      const groups = a5ReportGroups();
      if (!editor || !groups.length) return;
      const index = groups.findIndex(group => group.id === id);
      if (index < 0) return;
      $$('[data-a5-report-group-body]', editor).forEach(body => { const on = body.dataset.a5ReportGroupBody === id; body.hidden = !on; body.classList.toggle('is-active', on); });
      $$('[data-a5-report-group]', editor).forEach(tab => { const on = tab.dataset.a5ReportGroup === id; tab.classList.toggle('is-active', on); if (on) tab.setAttribute('aria-current', 'step'); else tab.removeAttribute('aria-current'); });
      const title = editor.querySelector('[data-a5-report-group-title]');
      if (title) title.textContent = `ส่วนที่ ${index + 1}/${groups.length} · ${groups[index].label}`;
      const page = editor.querySelector('[data-a5-report-group-page]');
      if (page) page.textContent = `รายงาน 213 · แบบ ปปท. 4 · ตรงแบบพิมพ์หน้า ${groups[index].formPage}`;
      const activeTab = editor.querySelector('[data-a5-report-group][aria-current="step"]');
      const badge = editor.querySelector('[data-a5-report-group-badge]');
      if (badge && activeTab) {
        const map = { complete: ['✓', 'ครบ'], partial: ['◐', 'กรอกบางส่วน'], empty: ['○', 'ยังไม่ครบ'] };
        const [icon, label] = map[activeTab.dataset.a5ReportGroupState] || map.empty;
        badge.className = `a5r-form-head-badge ${activeTab.dataset.a5ReportGroupState || 'empty'}`;
        badge.textContent = `${icon} ${label}`;
      }
      editor.querySelector(`[data-a5-report-group-body="${id}"] h3`)?.focus?.({ preventScroll: true });
    };
    const renderA5ReportPreview = (editor, pageNo, zoomPct) => {
      const reportApi = globalThis.ECMISActivity5Report213;
      const current = getState(state.caseData.id) || state;
      const normalized = reportApi?.normalizeReport213A5?.(current);
      const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
      if (!record) return;
      const payload = reportApi.captureReport213EditorA5(editor, record.payload);
      // รอบ 4: อัปเดตสดกระดาษ ปปท. 4 ใน doc pane เมื่อแท็บ 213 กำลังแสดง (ฟอร์มอยู่ซ้าย เอกสารอยู่ขวา)
      const docTab213 = document.querySelector('.ws-doc-tab[data-a5-doc="213"]');
      if (docTab213?.classList.contains('active')) {
        const stage = $('#a5PaperStage');
        if (stage) stage.innerHTML = reportApi.renderReport213PaperA5(payload);
      }
      const page = Math.min(6, Math.max(1, pageNo || 1));
      const canvas = editor.querySelector('[data-a5-report-preview-canvas]');
      const label = editor.querySelector('[data-a5-report-preview-label]');
      const host = document.createElement('div');
      host.innerHTML = reportApi.renderReport213PaperA5(payload, page);
      const node = host.querySelector('.a5-paper-page');
      if (canvas) { canvas.innerHTML = ''; if (node) { node.style.transform = `scale(${(zoomPct || 100) / 100})`; node.style.transformOrigin = 'top left'; canvas.appendChild(node); } }
      if (label) label.textContent = `${page}/6`;
    };
    const currentA5ReportPage = () => Number($('#a5App .a5-report-editor')?.dataset?.a5ReportPreviewPage || 1);
    const currentA5ReportZoom = () => Number($('#a5App .a5-report-editor')?.dataset?.a5ReportPreviewZoom || 100);
    let a5ReportPreviewTimer = null;
    $('#a5App').addEventListener('input', event => {
      const editor = event.target.closest('.a5r-editor');
      if (!editor) return;
      clearTimeout(a5ReportPreviewTimer);
      a5ReportPreviewTimer = setTimeout(() => renderA5ReportPreview(editor, currentA5ReportPage(), currentA5ReportZoom()), 350);
    });
    $('#a5App').onclick = async event => {
      const previewNav = event.target.closest('[data-a5-report-preview-nav]');
      if (previewNav) {
        const editor = $('#a5App .a5-report-editor');
        if (!editor) return;
        const dir = previewNav.dataset.a5ReportPreviewNav === 'next' ? 1 : -1;
        const next = Math.min(6, Math.max(1, currentA5ReportPage() + dir));
        editor.dataset.a5ReportPreviewPage = String(next);
        renderA5ReportPreview(editor, next, currentA5ReportZoom());
        return;
      }
      const zoomBtn = event.target.closest('[data-a5-report-preview-zoom]');
      if (zoomBtn) {
        const editor = $('#a5App .a5-report-editor');
        if (!editor) return;
        const delta = zoomBtn.dataset.a5ReportPreviewZoom === 'in' ? 10 : -10;
        const zoom = Math.min(160, Math.max(50, currentA5ReportZoom() + delta));
        editor.dataset.a5ReportPreviewZoom = String(zoom);
        const zoomLabel = editor.querySelector('[data-a5-report-preview-zoom-label]');
        if (zoomLabel) zoomLabel.textContent = `${zoom}%`;
        renderA5ReportPreview(editor, currentA5ReportPage(), zoom);
        return;
      }
      const validateBtn = event.target.closest('[data-a5-report-action="validate"]');
      if (validateBtn) {
        const editor = $('#a5App .a5-report-editor');
        if (!editor) return;
        const reportApi = globalThis.ECMISActivity5Report213;
        const current = getState(state.caseData.id) || state;
        const normalized = reportApi?.normalizeReport213A5?.(current);
        const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        if (!record) return;
        const payload = reportApi.captureReport213EditorA5(editor, record.payload);
        const validation = reportApi.validateReport213A5(payload);
        if (!validation.errors.length) return notify('success', 'ตรวจสอบความครบ', 'ข้อมูลรายงานครบถ้วนตามโครงสร้าง — ตรวจสอบรายละเอียดอีกครั้งก่อนเสนอ');
        const first = validation.errors[0];
        const target = String(first.field || '').split('.')[0];
        const group = (reportApi.REPORT_213_GROUPS || []).find(g => g.keys.includes(target));
        if (group) activateA5ReportGroup(group.id);
        const section = $(`#a5App [data-a5-report-section-body="${target}"]`);
        section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        section?.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [role="alert"]')?.focus?.();
        return notify('warning', 'ข้อมูลยังไม่ครบ', `${first.message} (${target})`);
      }
      const groupNav = event.target.closest('[data-a5-report-group-nav]');
      if (groupNav) {
        const editor = $('#a5App .a5-report-editor');
        if (!editor) return;
        const groups = a5ReportGroups();
        const active = editor.querySelector('[data-a5-report-group][aria-current="step"]')?.dataset?.a5ReportGroup;
        const index = groups.findIndex(g => g.id === active);
        const dir = groupNav.dataset.a5ReportGroupNav === 'next' ? 1 : -1;
        const nextIndex = Math.min(groups.length - 1, Math.max(0, (index < 0 ? 0 : index) + dir));
        activateA5ReportGroup(groups[nextIndex].id);
        return;
      }
      const groupTab = event.target.closest('[data-a5-report-group]');
      if (groupTab) { activateA5ReportGroup(groupTab.dataset.a5ReportGroup); return; }
      const accusedButton = event.target.closest('[data-a5-plan-action="accused-add"], [data-a5-plan-action="accused-remove"]');
      if (accusedButton) {
        const planApi = globalThis.ECMISActivity5PlanWorklog;
        const current = getState(state.caseData.id);
        if (!planApi || !current?.a5CasePlan) return;
        const planCopy = JSON.parse(JSON.stringify(current.a5CasePlan));
        if (accusedButton.dataset.a5PlanAction === 'accused-add') {
          const seed = { name: '', fourIssues: ['สถานะ', 'อำนาจหน้าที่', 'การกระทำความผิด', 'ความเสียหาย'].map(issue => ({ issue, details: '' })), requiredEvidenceActions: ['สถานะ', 'อำนาจหน้าที่', 'การกระทำความผิด', 'ความเสียหาย'].map(issue => ({ issue, requiredEvidence: '', action: '' })), tableRows: { status: { checks: [false, false, false, false] }, authority: { checks: [false, false, false] }, act: { checks: [false, false] } } };
          planCopy.accusedRows = [...(planCopy.accusedRows || []), seed];
        } else {
          const index = Number(accusedButton.dataset.a5PlanAccusedIndex || -1);
          if (index < 0 || !(planCopy.accusedRows || []).length) return;
          if ((planCopy.accusedRows || []).length <= 1) return notify('warning', 'ต้องมีผู้ถูกกล่าวหาอย่างน้อยหนึ่งราย', 'ลบแถวสุดท้ายไม่ได้');
          planCopy.accusedRows.splice(index, 1);
        }
        const account = currentA5Account();
        const saved = planApi.saveCasePlanA5(current, { expectedVersion: Number(current.a5DocumentStore?.version || 0), actorId: account?.officerId || '', at: new Date().toISOString(), idempotencyKey: `plan-accused:${current.caseData.id}:${Date.now()}`, payload: planCopy });
        if (saved?.ok) { saveState(saved.state.caseData.id, saved.state); renderA5Detail(saved.state.caseData.id, role, 'current-task', 'plan'); }
        else notify('warning', 'ปรับรายการผู้ถูกกล่าวหาไม่สำเร็จ', saved?.errors?.[0]?.message || 'ไม่สามารถบันทึกได้');
        return;
      }
      const planRowButton = event.target.closest('[data-a5-plan-row-action]');
      if (planRowButton) {
        if (planRowButton.dataset.a5PlanRowAction === 'delete') { planRowButton.closest('[data-a5-plan-row]')?.remove(); return; }
        if (planRowButton.dataset.a5PlanRowAction === 'add') {
          const path = planRowButton.dataset.a5PlanRowPath;
          const list = planRowButton.closest('[data-a5-plan-row-list]');
          if (!list) return;
          const template = $(`[data-a5-plan-row="${path}"]`, list);
          let row;
          if (template) {
            row = template.cloneNode(true);
            row.dataset.a5PlanRowId = `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            $$('[data-a5-plan-row-field]', row).forEach(fieldEl => { fieldEl.value = ''; });
          } else {
            const rowId = `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            const field = (labelText, fieldKey, type = "text") => `<div class="ws-field"><label>${labelText}</label><input type="${type}" data-a5-plan-row-field="${fieldKey}" value=""></div>`;
            row = document.createElement('div');
            row.className = 'a5-plan-row';
            row.dataset.a5PlanRow = path;
            row.dataset.a5PlanRowId = rowId;
            row.innerHTML = `<div class="ws-grid-2">${field('วัน/เดือน/ปี', 'date', 'date')}${field('การดำเนินการ', 'action')}</div><div class="ws-actions"><button type="button" class="ws-button danger" data-a5-plan-row-action="delete">ลบแถว</button></div>`;
          }
          list.insertBefore(row, planRowButton);
          row.querySelector('input, textarea')?.focus();
        }
        return;
      }
      const reportRowButton = event.target.closest('[data-a5-report-row-action]');
      if (reportRowButton) {
        if (role !== 'investigator') return;
        const reportApi = globalThis.ECMISActivity5Report213;
        const current = getState(state.caseData.id);
        const normalized = reportApi?.normalizeReport213A5?.(current);
        const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        const editor = reportRowButton.closest('.a5-report-editor');
        if (!record || !editor) return;
        const captured = reportApi.captureReport213EditorA5(editor, record.payload);
        const payload = reportApi.mutateReport213RowsA5(captured, { path: reportRowButton.dataset.path, action: reportRowButton.dataset.a5ReportRowAction, rowId: reportRowButton.dataset.rowKey, direction: Number(reportRowButton.dataset.direction || 0) });
        editor.outerHTML = reportApi.renderReport213EditorA5(payload, { editable: true, layout: editor.classList.contains('a5r-editor-full') ? 'full' : 'split', evidenceVersions: extensionRepositoryA5(current, '213') });
        const updated = $('#a5App .a5-report-editor');
        const rows = $$(`[data-a5-report-row="${reportRowButton.dataset.path}"]`, updated);
        const focusRow = reportRowButton.dataset.a5ReportRowAction === 'add' ? rows.at(-1) : rows.find(row => row.dataset.rowKey === reportRowButton.dataset.rowKey) || rows[0];
        (focusRow?.querySelector('input, textarea, select, button:not([disabled])') || updated?.querySelector(`[data-a5-report-row-list="${reportRowButton.dataset.path}"] [data-a5-report-row-action="add"]`))?.focus();
        return;
      }
      const actionButton = event.target.closest('[data-a5-action], [data-a5-workflow-action], [data-a5-store-action], [data-a5-plan-action], [data-a5-report-action], [data-a5-report-644-action], [data-a5-form5-action], [data-a5-form6-action], [data-a5-post-action]');
      if (!actionButton) return;
      const action = actionButton.dataset.a5Action || actionButton.dataset.a5WorkflowAction || actionButton.dataset.a5StoreAction || actionButton.dataset.a5PlanAction || actionButton.dataset.a5ReportAction || actionButton.dataset.a5Report644Action || actionButton.dataset.a5Form5Action || actionButton.dataset.a5Form6Action || actionButton.dataset.a5PostAction;
      // Phase 0 Task 4 — primary hard-block check (ชั้น 1). Before any
      // branch body runs (and before getState/captureDetail, so even the
      // normalization side-effect write cannot fire for a blocked action),
      // deny-listed legacy mutations return the guard's Section 4.5
      // envelope and surface the Thai messageTh. action-matrix.md
      // "Deny-list for Task 4" is the sole scope; case-size-set is NOT
      // listed and stays ALLOW.
      const phase0Guard = globalThis.ECMISActivity5Phase0Guard;
      if (phase0Guard?.isBlocked(action)) {
        const blocked = phase0Guard.blockedResult(action, state);
        return notify('warning', 'การดำเนินการถูกระงับชั่วคราว', blocked.messageTh);
      }
      // ชั้น 2 (defense in depth) — run the mutation/persistence steps of
      // this action under Guard.withAction so that if a write is still
      // attempted while a blocked action is ambient, assertWritable() at
      // the Task 3 chokepoints (saveState/writeStore/issueOrderNo213/
      // publish) throws Phase0GuardBlockedError before any setItem.
      // Behaviour is identical for allowed actions.
      const guardRun = fn => phase0Guard ? phase0Guard.withAction(action, fn) : fn();
      if (actionButton.dataset.a5PostAction) {
        const formId = actionButton.dataset.formId;
        const account = currentA5Account();
        const actorId = account?.officerId || workflowActorNameA5(state, role);
        const actorName = account?.name || workflowActorNameA5(state, role);
        const current = getState(state.caseData.id);
        const command = { caseId: current.caseData.id, formId, actorId, actorName, actorRoleCode: role, at: new Date().toISOString(), idempotencyKey: `${action}:${formId}:${Date.now()}`, expectedVersion: Number(current.a5DocumentStore?.version || 0) };
        if (action === 'post-document-create-draft') {
          command.attachments = $$(`select[data-a5-post-attach="${formId}"]`).map(sel => ({ type: sel.dataset.attachType, versionId: sel.value })).filter(item => item.versionId);
        } else if (action === 'external-document-record') {
          const f = suffix => $(`#a5PostExt-${formId}-${suffix}`)?.value?.trim() || '';
          Object.assign(command, { externalDocumentId: f('externalDocumentId'), issuerName: f('issuerName'), issuerReference: f('issuerReference'), issuedAt: f('issuedAt'), receivedAt: f('receivedAt'), receivedBy: f('receivedBy'), versionId: f('versionId'), fileName: f('fileName'), custodyHolder: f('custodyHolder') });
        }
        const result = globalThis.ECMISActivity5Workflow?.executeA5Action?.(current, role, action, command);
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || result?.messageTh || 'ตรวจสอบข้อมูลก่อนบันทึก');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', null);
        return;
      }
      if (actionButton.dataset.a5Report644Action === 'save') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึกรายงาน', 'ผู้รับผิดชอบสำนวนเท่านั้นที่แก้ไขร่างรายงานได้');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const record = current?.state?.a5DocumentStore?.records?.filter(item => item.documentId === api?.FORM_7_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        const account = currentA5Account();
        if (!record || !account) return notify('warning', 'บันทึกร่างไม่สำเร็จ', 'ไม่พบบัญชีผู้รับผิดชอบหรือร่างรายงาน');
        const payload = api.captureReport644EditorA5($('#a5App .a5-report-644-editor'), record.payload);
        const saved = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, 'report-644-save', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `report-644-save:${current.state.caseData.id}:${Date.now()}`, payload });
        if (!saved?.ok) return notify('warning', 'บันทึกร่างไม่สำเร็จ', saved?.errors?.[0]?.message || 'ตรวจสอบข้อมูลรายงาน');
        saveState(saved.state.caseData.id, saved.state);
        renderA5Detail(saved.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (actionButton.dataset.a5Form5Action === 'save' || actionButton.dataset.a5Form5Action === 'submit') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึกเอกสาร', 'ผู้รับผิดชอบสำนวนเท่านั้นที่แก้ไขได้');
        const api = globalThis.ECMISActivity5Report644;
        const accusedRowId = actionButton.dataset.accusedRowId;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const documentId = accusedRowId ? api.form5DocId(accusedRowId) : '';
        const record = current?.state?.a5DocumentStore?.records?.find(item => item.documentId === documentId);
        const account = currentA5Account();
        const container = actionButton.closest('.a5-form56-accused')?.querySelector('.a5-form5-editor');
        if (!record || !account || !container) return notify('warning', 'บันทึกไม่สำเร็จ', 'ไม่พบบัญชีผู้รับผิดชอบหรือเอกสาร');
        const payload = api.captureReport644EditorA5(container, record.payload);
        const isSubmit = actionButton.dataset.a5Form5Action === 'submit';
        const commandAction = isSubmit ? 'form-5-submit' : 'form-5-save';
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, commandAction, { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, accusedRowId, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `${commandAction}:${accusedRowId}:${current.state.caseData.id}:${Date.now()}`, payload });
        if (!result?.ok) return notify('warning', isSubmit ? 'เสนอไม่สำเร็จ' : 'บันทึกร่างไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (actionButton.dataset.a5Form6Action === 'save' || actionButton.dataset.a5Form6Action === 'submit') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึกเอกสาร', 'ผู้รับผิดชอบสำนวนเท่านั้นที่แก้ไขได้');
        const api = globalThis.ECMISActivity5Report644;
        const accusedRowId = actionButton.dataset.accusedRowId;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const documentId = accusedRowId ? api.form6DocId(accusedRowId) : '';
        const record = current?.state?.a5DocumentStore?.records?.find(item => item.documentId === documentId);
        const account = currentA5Account();
        const container = actionButton.closest('.a5-form56-accused')?.querySelector('.a5-form6-editor');
        if (!record || !account || !container) return notify('warning', 'บันทึกไม่สำเร็จ', 'ไม่พบบัญชีผู้รับผิดชอบหรือเอกสาร');
        const payload = api.captureForm6EditorA5(container, record.payload);
        const isSubmit = actionButton.dataset.a5Form6Action === 'submit';
        const commandAction = isSubmit ? 'form-6-submit' : 'form-6-save';
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, commandAction, { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, accusedRowId, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `${commandAction}:${accusedRowId}:${current.state.caseData.id}:${Date.now()}`, payload });
        if (!result?.ok) return notify('warning', isSubmit ? 'เสนอไม่สำเร็จ' : 'บันทึกร่างไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (actionButton.dataset.a5ReportAction === 'save') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึกรายงาน', 'ผู้รับผิดชอบสำนวนเท่านั้นที่แก้ไขร่างรายงานได้');
        const reportApi = globalThis.ECMISActivity5Report213;
        const current = getState(state.caseData.id);
        const normalized = reportApi?.normalizeReport213A5?.(current);
        const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === reportApi?.FORM_ID).sort((left, right) => right.revisionNo - left.revisionNo)[0];
        const account = currentA5Account();
        if (!record || !account) return notify('warning', 'บันทึกร่างไม่สำเร็จ', 'ไม่พบบัญชีผู้รับผิดชอบหรือร่างรายงาน');
        const editor = $('#a5App .a5-report-editor');
        const payload = reportApi.captureReport213EditorA5(editor, record.payload);
        const saved = reportApi.saveReport213DraftA5(current, { caseId: current.caseData.id, expectedVersion: Number(normalized.state.a5DocumentStore.version || 0), actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `report-213-save:${current.caseData.id}:${Date.now()}`, payload });
        if (!saved?.ok) {
          const focusPath = String(saved?.focusTarget || saved?.errors?.[0]?.field || '');
          const target = focusPath.split('.')[0];
          const group = (reportApi.REPORT_213_GROUPS || []).find(g => g.keys.includes(target));
          if (group) activateA5ReportGroup(group.id);
          const section = $(`#a5App [data-a5-report-section-body="${target}"]`);
          const control = section?.querySelector(`[data-a5-report-bind="${focusPath}"]`) || section?.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [role="alert"]');
          control?.focus?.();
          return notify('warning', 'บันทึกร่างไม่สำเร็จ', saved?.errors?.[0]?.message || 'ตรวจสอบข้อมูลรายงาน');
        }
        saveState(saved.state.caseData.id, saved.state);
        renderA5Detail(saved.state.caseData.id, role, 'current-task', '213');
        return;
      }
      if (action === 'print') {
        if (documentDirty) return notify('warning', 'เอกสารยังไม่บันทึก', 'บันทึกหรือยกเลิกการแก้ไขก่อนพิมพ์/PDF');
        window.print();
        return;
      }
      if (action === 'back') {
        if (documentDirty) return notify('warning', 'เอกสารยังไม่บันทึก', 'บันทึกหรือยกเลิกการแก้ไขก่อนกลับรายการ');
        view = 'list';
        renderA5(role);
        return;
      }
      if (documentDirty) return notify('warning', 'เอกสารยังไม่บันทึก', 'บันทึกหรือยกเลิกการแก้ไขก่อนดำเนินงานสำนวน');
      event.preventDefault();
      if (['transfer-request', 'transfer-accept', 'transfer-reject', 'transfer-post-request', 'transfer-post-approve', 'transfer-post-reject'].includes(action)) {
        return notify('warning', 'ปิดเส้นทางโอนตรงแล้ว', 'ใช้กระบวนการส่งคืนผ่าน กบค. ในแท็บบริหารสำนวน');
      }
      const st = captureDetail(getState(state.caseData.id), role);
      const acceptancePending = role === 'investigator' && st.assignment?.primaryOfficerId && Number(st.assignment?.acceptedAssignmentVersion || 0) !== Number(st.assignment?.assignmentVersion || 0);
      if (acceptancePending && action !== 'officer-accept') return notify('warning', 'ต้องรับมอบสำนวนก่อน', 'ผู้รับผิดชอบหลักต้องลงนามรับคำสั่งมอบหมายเวอร์ชันปัจจุบันก่อนดำเนินงาน');
      const i = st.inquiry, w = st.workflow;
      const add = text => { st.decisionHistory = st.decisionHistory || []; st.decisionHistory.push({ text, time: now() }); };
      const v = id => $('#' + id)?.value?.trim() || '';
      const cb = id => Boolean($('#' + id)?.checked);
      const popup = (title, fields, confirmText) => swalForm(title, `<div id="swalForm">${fields.map(([id, label, type = 'text', ph = '']) => type === 'checkbox' ? `<label class="ws-choice" style="text-align:left;margin-bottom:.5rem"><input data-sf="${id}" type="checkbox" ${ph ? 'checked' : ''}><span><strong>${label}</strong></span></label>` : type === 'select' ? `<div class="ws-field" style="text-align:left"><label>${label}</label><select data-sf="${id}" style="width:100%;padding:.55rem;border:1px solid #c9d2dc;border-radius:.5rem;background:#fff">${String(ph).split('|').map(o => `<option>${o}</option>`).join('')}</select></div>` : `<div class="ws-field" style="text-align:left"><label>${label}</label><input data-sf="${id}" type="${type}" placeholder="${ph}" style="width:100%;padding:.55rem;border:1px solid #c9d2dc;border-radius:.5rem"></div>`).join('')}</div>`, confirmText);

      if (actionButton.dataset.a5PlanAction === 'worklog-add') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์เพิ่มบันทึก', 'ผู้รับผิดชอบสำนวนเป็นผู้เพิ่มบันทึกการปฏิบัติงาน');
        const account = currentA5Account();
        if (!account) return notify('warning', 'ยังไม่พบบัญชีผู้ใช้งาน', 'เลือกบัญชีผู้รับผิดชอบสำนวนก่อนเพิ่มบันทึก');
        const response = await popup('เพิ่มบันทึกการปฏิบัติงาน', [['occurredAt', 'วันและเวลาที่ดำเนินการ', 'datetime-local'], ['activityType', 'ประเภทการดำเนินการ'], ['description', 'รายละเอียด'], ['result', 'ผลการดำเนินการ']], 'เพิ่มบันทึก');
        if (!response.isConfirmed) return;
        const values = response.value || {};
        const result = globalThis.ECMISActivity5PlanWorklog?.appendWorklogEntryA5?.(st, { expectedVersion: Number(st.a5DocumentStore?.version || 0), actorId: account.officerId, actorName: account.name, at: new Date().toISOString(), idempotencyKey: `worklog:${st.caseData.id}:${Date.now()}`, entry: { entryId: `worklog:${Date.now()}`, occurredAt: values.occurredAt, activityType: values.activityType, description: values.description, result: values.result, relatedDocumentVersionIds: [] } });
        if (!result?.ok) return notify('warning', 'เพิ่มบันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'กรอกข้อมูลให้ครบถ้วน');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', 'plan');
        return;
      }
      if (actionButton.dataset.a5PlanAction === 'worklog-submit') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์ส่งบันทึก', 'ผู้รับผิดชอบสำนวนเป็นผู้ส่งบันทึกการปฏิบัติงาน');
        const account = currentA5Account();
        if (!account) return notify('warning', 'ยังไม่พบบัญชีผู้ใช้งาน', 'เลือกบัญชีผู้รับผิดชอบสำนวนก่อนส่งบันทึก');
        const confirmed = await confirmDo('ส่งบันทึกการปฏิบัติงาน', 'ระบบจะตรึงฉบับและ hash ปัจจุบัน แก้ไขย้อนหลังไม่ได้ ยืนยันส่ง?', 'ส่งบันทึก');
        if (!confirmed.isConfirmed) return;
        const result = globalThis.ECMISActivity5PlanWorklog?.submitWorklogA5?.(st, { expectedVersion: Number(st.a5DocumentStore?.version || 0), actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `worklog-submit:${st.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'ส่งบันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบบันทึกฉบับปัจจุบัน');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', 'plan');
        return;
      }
      if (['sign-owner', 'sign-assistant'].includes(actionButton.dataset.a5PlanAction)) {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์ลงนาม', 'ผู้รับผิดชอบสำนวนหรือผู้ช่วยที่ได้รับมอบหมายเท่านั้นที่ลงนามได้');
        const account = currentA5Account();
        const signature = actionButton.dataset.a5PlanAction === 'sign-owner' ? st.a5CasePlan?.signatures?.owner : st.a5CasePlan?.signatures?.assistant;
        if (!account || !signature?.officerId || account.officerId !== signature.officerId) return notify('warning', 'บัญชีผู้ใช้ไม่ตรงกับผู้ลงนาม', 'เลือกบัญชีผู้รับผิดชอบตามคำสั่งมอบหมายก่อนลงนาม');
        signature.officerName = account.name;
        signature.signedAt = new Date().toISOString();
        const saved = globalThis.ECMISActivity5PlanWorklog?.saveCasePlanA5?.(st, { expectedVersion: Number(st.a5DocumentStore?.version || 0), actorId: account.officerId, at: signature.signedAt, idempotencyKey: `plan-sign:${st.caseData.id}:${signature.officerId}:${Date.now()}`, payload: st.a5CasePlan });
        if (!saved?.ok) return notify('warning', 'ลงนามไม่สำเร็จ', saved?.errors?.[0]?.message || 'ไม่สามารถบันทึกลายมือชื่อได้');
        saveState(saved.state.caseData.id, saved.state);
        renderA5Detail(saved.state.caseData.id, role, 'current-task', 'plan');
        return;
      }

      if (actionButton.dataset.a5StoreAction) {
        const confirmed = await confirmDo(action === 'merge-case' ? 'รวมสำนวน' : 'แยกสำนวน', action === 'merge-case' ? 'สำนวนรองจะถูกล็อกและเปิดไปยังสำนวนหลัก ยืนยันดำเนินการ?' : 'ระบบจะออกเลขสำนวนใหม่ตามลำดับทะเบียนและคัดลอกเฉพาะข้อมูลที่เลือก ยืนยันดำเนินการ?', 'ยืนยัน');
        if (!confirmed.isConfirmed) return;
        const storePayload = action === 'merge-case'
          ? { primaryCaseId: v('a5MergePrimaryId'), actorName: ROLE_LABELS[role] }
          : { actorName: ROLE_LABELS[role], boardApprovalRequired: cb('a5SplitBoardRequired'), selected: { subject: v('a5SplitSubject'), allegations: v('a5SplitAllegations'), accused: v('a5SplitAccused').split('\n').map(value => value.trim()).filter(Boolean) } };
        const result = executeA5StoreAction(readStore(), st.caseData.id, role, action, storePayload);
        if (!result.ok) {
          const presentation = workflowErrorPresentationA5(result);
          await notify('warning', presentation.title, presentation.message);
          focusWorkflowErrorA5(presentation, $('#a5App'));
          return;
        }
        writeStore(result.store);
        renderA5Detail(st.caseData.id, role, 'case-admin');
        return;
      }

      if (actionButton.dataset.a5WorkflowAction) {
        const account = role === 'investigator' ? currentA5Account() : null;
        const actorName = workflowActorNameA5(st, role);
        const payload = { actorName, at: new Date().toISOString(), ...(account ? { actorOfficerId: account.officerId } : {}) };
        let workflowState = st;
        if (action === 'intake-review-submit') {
          payload.receivedDate = { channel: v('a5ReceivedChannel'), recordedAt: v('a5ReceivedRecordedAt'), effectiveDate: v('a5ReceivedEffectiveDate'), outsideHoursOrHoliday: cb('a5ReceivedPendingRule') };
          payload.hasOriginal = cb('a5HasOriginal');
          payload.custodyHolder = v('a5CustodyHolder');
          payload.intakeReview = { documentResults: inboundDocumentItemsA5(st).items.map(item => ({ id: item.key, result: 'REVIEWED' })), jurisdictionResult: v('a5ReviewJurisdiction'), complaintTypeResult: v('a5ReviewComplaintType'), completenessResult: v('a5ReviewCompleteness'), clerkOpinion: v('a5ClerkOpinion') };
        }
        if (action === 'assignment-confirm') {
          payload.primaryOfficerId = $('input[name="a5PrimaryOfficer"]:checked')?.value || '';
          payload.assistantOfficerIds = $$('input[name="a5AssistantOfficer"]:checked').map(input => input.value);
          payload.decisionNote = v('a5AssignmentDecisionNote');
          try { payload.recommendationSnapshot = JSON.parse($('#a5RecommendationSnapshot')?.value || '{}'); } catch { payload.recommendationSnapshot = {}; }
        }
        if (action === 'officer-accept') payload.signature = v('a5AcceptanceSignature');
        if (action === 'plan-submit') payload.plan = String(st.a5CasePlan?.caseMetadata?.subject || 'แผนงานคดี');
        if (action === 'amendment-submit') payload.plan = v(st.workflow?.stage === 'a5-inquiry' ? 'a5Plan644' : 'a5Plan');
        if (action === 'plan-return' || action === 'amendment-return') payload.reason = v('a5PlanReturnReason');
        if (action === 'plan-amend') {
          payload.reason = v('a5PlanAmendReason');
          payload.teamMembers = v('a5PlanAmendTeam').split(',').map(value => value.trim()).filter(Boolean);
          payload.plan = st.planLifecycle?.plan || '';
        }
        if (action === 'custody-dispatch') Object.assign(payload, { destination: v('a5CustodyDestination'), letterNo: v('a5CustodyLetterNo'), emsNumber: v('a5CustodyEms'), dispatchedAt: v('a5CustodyDispatchedAt') });
        if (action === 'custody-receive') Object.assign(payload, { receivedAt: v('a5CustodyReceivedAt'), holder: v('a5CustodyReceivedHolder') });
        if (action === 'custody-return') Object.assign(payload, { returnedAt: v('a5CustodyReturnedAt'), reason: v('a5CustodyReturnReason'), holder: v('a5CustodyReturnHolder') });
        if (action === 'return-request') Object.assign(payload, { reason: v('a5ReturnReason'), opinion: v('a5ReturnOpinion'), destination: v('a5ReturnDestination') });
        if (action === 'return-approve') payload.opinion = v('a5ReturnApprovalOpinion');
        if (action === 'return-dispatch') Object.assign(payload, { letterNo: v('a5ReturnLetterNo'), emsNumber: v('a5ReturnEms'), dispatchedAt: v('a5ReturnDispatchedAt') });
        if (action === 'gbk-receive' || action === 'destination-receive') Object.assign(payload, { receivedAt: v('a5RouteReceivedAt'), holder: v('a5RouteHolder') });
        if (action === 'gbk-reroute') Object.assign(payload, { destination: $('a5RerouteDestination')?.value || state.returnRoute?.destination || '', opinion: v('a5RerouteOpinion'), physicalHolder: v('a5PhysicalHolder'), physicalSentAt: v('a5PhysicalSentAt'), physicalEmsNumber: v('a5PhysicalEmsNumber') });
        if (action === 'team-update') Object.assign(payload, { assistantOfficerIds: v('a5TeamUpdateAssistants').split(',').map(value => value.trim()).filter(Boolean), reason: v('a5TeamUpdateReason'), expectedVersion: Number(st.assignment?.assignmentVersion || 0) });
        if (action === 'reassignment-request') payload.reason = v('a5ReassignRequestReason');
        if (action === 'reassignment-handoff') payload.note = v('a5ReassignHandoffNote');
        if (action === 'primary-reassign') Object.assign(payload, { primaryOfficerId: v('a5PrimaryReassignTo'), assistantOfficerIds: v('a5PrimaryReassignAssistants').split(',').map(value => value.trim()).filter(Boolean), reason: v('a5PrimaryReassignReason'), expectedVersion: Number(st.assignment?.assignmentVersion || 0) });
        if (action === 'panel-change-draft') Object.assign(payload, { reason: v('a5PanelReason'), proposedMembers: v('a5PanelMembers').split(',').map(value => value.trim()).filter(Boolean) });
        if (action === 'case-size-set') Object.assign(payload, { caseSize: v('a5CaseSize'), caseSizeComponents: { position: Number(v('a5SizePosition')) || 1, personsOrAllegations: Number(v('a5SizePersons')) || 1, budgetOrDamage: Number(v('a5SizeBudget')) || 1, evidenceDifficulty: Number(v('a5SizeEvidence')) || 1 }, reason: v('a5SizeReason') });
        if (action === 'xl-approve') payload.opinion = v('a5XlOpinion');
        if (action === 'xl-board-confirm') Object.assign(payload, { mtiNo: v('a5XlBoardMtiNo'), mtiDate: v('a5XlBoardMtiDate'), presentationDate: v('a5XlPresentationDate'), presenter: v('a5XlPresenter'), presentationSummary: document.getElementById('a5XlPresentationSummary')?.value?.trim() || '' });
        if (action === 'report-213-submit' || action === 'report-644-submit') {
          const api = action === 'report-213-submit' ? globalThis.ECMISActivity5Report213 : globalThis.ECMISActivity5Report644;
          const normalized = action === 'report-213-submit' ? api?.normalizeReport213A5?.(st) : api?.normalizeReport644A5?.(st);
          const documentId = action === 'report-213-submit' ? api?.FORM_ID : api?.FORM_7_ID;
          const record = normalized?.state?.a5DocumentStore?.records?.filter(item => item.documentId === documentId).sort((left, right) => right.revisionNo - left.revisionNo)[0];
          if (!record) return notify('warning', 'เสนอรายงานไม่สำเร็จ', 'ไม่พบร่างรายงานฉบับปัจจุบัน');
          Object.assign(payload, { caseId: st.caseData.id, revisionNo: record.revisionNo, expectedVersion: normalized.state.a5DocumentStore.version, idempotencyKey: `${action}:${st.caseData.id}:${Date.now()}`, packageId: `${action === 'report-213-submit' ? '213' : '644'}:${st.caseData.id}:${record.revisionNo}:${Date.now()}` });
          workflowState = normalized.state;
        }
        if (action.endsWith('review-approve')) payload.opinion = v('a5DownstreamOpinion');
        if (action.endsWith('review-return')) payload.reason = v('a5DownstreamReturnReason');
        if (action.endsWith('send-a7') || action === 'prosecutor-send' || action === 'prosecutor-result-send') Object.assign(payload, { letterNo: v('a5DownstreamLetterNo'), sentAt: v('a5DownstreamSentAt') });
        if (action.endsWith('record-receipt') || action === 'prosecutor-result-receipt') Object.assign(payload, { receivedAt: v('a5DownstreamReceivedAt'), evidence: v('a5DownstreamEvidence') });
        if (action.endsWith('record-result')) Object.assign(payload, { result: v('a5DownstreamResult'), decidedAt: v('a5DownstreamDecidedAt') });
        if (action === 'outcome-task-start') payload.taskId = v('a5DownstreamTaskId');
        if (action === 'outcome-task-complete') Object.assign(payload, { taskId: v('a5DownstreamTaskId'), evidence: v('a5DownstreamEvidence') });
        if (action === 'outcome-task-send') Object.assign(payload, { taskId: v('a5DownstreamTaskId'), letterNo: v('a5DownstreamLetterNo'), sentAt: v('a5DownstreamSentAt') });
        if (action === 'outcome-task-record-receipt') Object.assign(payload, { taskId: v('a5DownstreamTaskId'), receivedAt: v('a5DownstreamReceivedAt'), evidence: v('a5DownstreamEvidence') });
        if (action === 'prosecutor-package-ready') payload.packageRef = v('a5ProsecutorPackageRef');
        if (action === 'prosecutor-record-order') Object.assign(payload, { orderType: v('a5ProsecutorOrderType'), order: v('a5ProsecutorOrder'), receivedAt: v('a5DownstreamReceivedAt') });
        if (action === 'prosecutor-complete-order') payload.result = v('a5ProsecutorExecutionResult');
        if (action === 'case-close') payload.opinion = v('a5ClosureOpinion');
        if (action === 'nacc-report-add') Object.assign(payload, { letterNo: v('a5NaccLetterNo'), reportDate: v('a5NaccReportDate'), summary: v('a5NaccSummary') });
        if (action === 'plan-submit') {
          const planApi = globalThis.ECMISActivity5PlanWorklog;
          const saved = planApi?.saveCasePlanA5?.(st, { expectedVersion: Number(st.a5DocumentStore?.version || 0), actorId: account?.officerId || '', at: payload.at, idempotencyKey: `plan-save:${st.caseData.id}:${Date.now()}`, payload: st.a5CasePlan });
          if (!saved?.ok) {
            const presentation = workflowErrorPresentationA5(saved || {});
            await notify('warning', presentation.title, saved?.errors?.[0]?.message || presentation.message);
            return;
          }
          workflowState = saved.state;
        }
        let result = globalThis.ECMISActivity5Workflow?.executeA5Action(workflowState, role, action, payload);
        if (result?.ok && action === 'plan-submit') {
          const submitted = globalThis.ECMISActivity5PlanWorklog?.submitCasePlanA5?.(result.state, { expectedVersion: Number(result.state.a5DocumentStore?.version || 0), actorId: account?.officerId || '', at: payload.at, idempotencyKey: `plan-submit:${result.state.caseData.id}:${Date.now()}` });
          if (!submitted?.ok) {
            const presentation = workflowErrorPresentationA5(submitted || {});
            await notify('warning', presentation.title, submitted?.errors?.[0]?.message || presentation.message);
            return;
          }
          result = submitted;
        }
        if (!result?.ok) {
          const presentation = workflowErrorPresentationA5(result);
          await notify('warning', presentation.title, presentation.message);
          focusWorkflowErrorA5(presentation, $('#a5App'));
          return;
        }
        guardRun(() => saveState(result.state.caseData.id, result.state));
        const returnTab = actionButton.closest('#a5-panel-case-admin') ? 'case-admin' : 'current-task';
        renderA5Detail(result.state.caseData.id, role, returnTab);
        requestAnimationFrame(() => $(returnTab === 'case-admin' ? '#a5-panel-case-admin h2' : '#a5CurrentTaskTitle')?.focus());
        return;
      }

      if (action === 'accept-case') {
        if (i.intake.m62?.flag && !i.intake.m62.ageCheck) return notify('warning', 'คดี ม.62 ต้องตรวจอำนาจก่อน', 'กรอกผลตรวจอำนาจ/อายุความ (ถ้าเหลือ <6 เดือน ต้องส่งคืน ป.ป.ช.)');
        if (!i.intake.investigator) return notify('warning', 'ยังไม่ได้เลือกผู้รับผิดชอบ', 'มอบหมายนักสืบ (พนักงาน ป.ป.ท.) ก่อนรับสำนวน');
        if (!i.intake.orderNo || !i.intake.orderDate) return notify('warning', 'ยังไม่มีคำสั่ง/หนังสือมอบหมาย', 'กรอกเลขที่และวันที่คำสั่ง');
        w.stage = 'a5-prelim'; w.owner = 'investigator'; w.status = 'รอนักสืบจัดทำแผนคดี'; i.status = 'prelim';
        i.intake.assignedAt = now(); i.intake.acceptedAt = now();
        i.prelim.startedAt = i.prelim.startedAt || i.intake.receivedFirstAt || todayISO();
        i.prelim.deadlineAt = addDays(i.prelim.startedAt, 60);
        add(`${ROLE_LABELS[role]} รับสำนวนและมอบหมาย ${i.intake.investigator} (${i.intake.unit}) — เริ่มนับ 60 วันจาก ${i.prelim.startedAt}`);
        publish(st, `สำนักงานรับเรื่องของท่านไว้แล้ว อยู่ระหว่างไต่สวนเบื้องต้น (ครบ ${i.prelim.deadlineAt})`);
      }
      if (action === 'transfer-request') {
        const target = v('a5TransferTarget'), note = v('a5TransferNoteReq');
        if (!target) return notify('warning', 'เลือกหน่วยงานปลายทาง', '');
        i.intake.transfer = { status: 'PENDING', target, note, by: ROLE_LABELS[role], at: now() };
        w.status = `รอปลายทางรับโอน (${target})`; add(`ส่งคำขอโอนไป ${target} — สถานะรอปลายทางรับโอน (ยังไม่มอบหมายผู้รับผิดชอบ)`);
      }
      if (action === 'transfer-accept') {
        i.intake.transfer.status = 'APPROVED'; i.intake.unit = i.intake.transfer.target; w.status = 'รับโอนแล้ว — รอมอบหมายผู้รับผิดชอบ';
        add(`ปลายทางรับโอน: ${i.intake.unit} — กรอบเวลาไม่เริ่มใหม่`); publish(st, `โอนสำนวนไปยัง ${i.intake.unit}`);
      }
      if (action === 'transfer-reject') {
        i.intake.transfer.status = 'REJECTED'; w.status = 'ปลายทางปฏิเสธการรับโอน — เรื่องคงอยู่ที่สำนักงานเดิม';
        add(`ปลายทางปฏิเสธการรับโอน${v('a5TransferNote') ? ` (${v('a5TransferNote')})` : ''} — เรื่องคงอยู่ที่สำนักงานเดิม`);
      }
      if (action === 'prelim-save') {
        const planApi = globalThis.ECMISActivity5PlanWorklog;
        const account = currentA5Account();
        const saved = planApi?.saveCasePlanA5?.(st, { expectedVersion: Number(st.a5DocumentStore?.version || 0), actorId: account?.officerId || '', at: new Date().toISOString(), idempotencyKey: `plan-save:${st.caseData.id}:${Date.now()}`, payload: st.a5CasePlan });
        if (!saved?.ok) {
          const presentation = workflowErrorPresentationA5(saved || {});
          await notify('warning', presentation.title, saved?.errors?.[0]?.message || presentation.message);
          return;
        }
        add('บันทึกร่างไต่สวนเบื้องต้น');
        guardRun(() => saveState(saved.state.caseData.id, saved.state));
        renderA5Detail(saved.state.caseData.id, role, 'current-task', 'plan');
        return;
      }
      if (action === 'prelim-plan') {
        if (!i.prelim.plan) return notify('warning', 'ยังไม่มีแผนคดี', 'กรอกแผนงานคดีก่อนส่งขออนุมัติ');
        i.prelim.planStatus = 'รออนุมัติจากหัวหน้าพนักงาน'; w.status = 'รอ ผอ. อนุมัติแผนคดี'; add('นักสืบส่งแผนคดีขออนุมัติจาก ผอ.สำนักงาน ป.ป.ท. เขต');
      }
      if (action === 'plan-approve-213' || action === 'plan-approve-644') {
        const key = action === 'plan-approve-213' ? 'prelim' : 'inquiry644';
        const planStatus = state.inquiry?.[key]?.planStatus;
        if (planStatus !== 'รออนุมัติจากหัวหน้าพนักงาน') return notify('warning', 'แผนคดียังไม่พร้อมอนุมัติ', 'ต้องส่งแผนคดีขออนุมัติก่อน');
        state.inquiry[key].planStatus = 'approved';
        state.inquiry[key].planApprovedAt = new Date().toISOString();
        state.inquiry[key].planApprovedBy = currentA5Account()?.name || ROLE_LABELS[role] || role;
        state.decisionHistory = state.decisionHistory || [];
        state.decisionHistory.push({ text: `${ROLE_LABELS[role] || role} อนุมัติแผนคดี ${key === 'prelim' ? '213' : '644'}`, time: now() });
        saveState(state.caseData.id, state);
        renderA5Detail(state.caseData.id, role, 'current-task', 'plan');
        return;
      }
      if (action === 'prelim-submit') {
        if (!i.prelim.plan || i.prelim.planStatus !== 'approved') return notify('warning', 'แผนคดีไม่ครบ', 'จัดทำแผนคดีและรออนุมัติจาก ผอ.สำนักงาน ป.ป.ท. เขต ก่อนเสนอ 213');
        if (!i.prelim.report) return notify('warning', 'ยังไม่มีสรุปรายงาน 213', 'สรุปผลและความเห็นก่อนเสนอตามลำดับชั้น');
        const fast = await popup('เสนอรายงาน 213', [['a5FastTrack', 'เร่งด่วน (ใบด่วน — ใกล้ขาดอายุความ)?', 'checkbox']], 'เสนอ');
        i.prelim.fastTrack = Boolean(fast.value?.a5FastTrack);
        if (i.prelim.fastTrack) { w.stage = 'a7-213'; w.owner = 'committee'; w.status = 'ใบด่วน — คกก. พิจารณา 213 (ขอบรรจุวาระเร่งด่วน)'; i.committee213.note = `${i.committee213.note || ''}\n[ใบด่วน] ขอบรรจุวาระการประชุมเร่งด่วนพร้อมเหตุผลอันสมควร`; add('เสนอรายงาน 213 แบบใบด่วน (เร่งด่วน) — ตรงเข้าคณะกรรมการ'); }
        else { w.stage = 'a5-prelim-review'; w.owner = 'group-director'; w.status = 'รอตรวจตามลำดับชั้น (ผอ.กลุ่ม → ผอ.เขต/กอง → ผู้ช่วย/รองเลขาธิการ → เลขาธิการ)'; i.prelim.submittedAt = now(); add('นักสืบเสนอรายงาน 213 ตามลำดับชั้น'); }
      }
      if (action === 'chain-approve') {
        const reportType = reportTypeForStage(w.stage);
        const opinion = v('a5ChainOpinion') || '';
        if (!opinion) return notify('warning', 'ยังไม่มีความเห็น', 'บันทึกความเห็นก่อนเห็นชอบ');
        if (reportType === '213' && role === 'secretary' && cb('a5SupportFlag')) {
          i.prelim.supportPending = true; i.prelim.supportBy = ROLE_LABELS[role]; w.status = 'คณะอนุกรรมการสนับสนุนเลขาธิการฯ พิจารณา (ยุ่งยากซับซ้อน)';
          const r = chainApprove(st, reportType, role, opinion); add(`${ROLE_LABELS[role]} เห็นชอบรายงาน 213 — ส่งคณะอนุกรรมการสนับสนุนฯ ให้ความเห็นประกอบ`);
        } else if (reportType === '644' && role === 'secretary' && cb('a5SupportFlag')) {
          i.inquiry644.supportPending = true; i.inquiry644.supportBy = ROLE_LABELS[role]; w.status = 'คณะอนุกรรมการสนับสนุนเลขาธิการฯ พิจารณา (644)';
          chainApprove(st, reportType, role, opinion); add(`${ROLE_LABELS[role]} เห็นชอบรายงาน 644 — ส่งคณะอนุกรรมการสนับสนุนฯ`);
        } else {
          const r = chainApprove(st, reportType, role, opinion);
          if (!r.ok) return notify('warning', 'ไม่สามารถตรวจได้', r.message);
          if (r.complete) { w.stage = reportType === '213' ? 'a7-213' : 'a7-644'; w.owner = 'committee'; w.status = `รอคณะกรรมการ ป.ป.ท. พิจารณา (${reportType})`; add(`ตรวจรายงาน ${reportType} ครบทุกชั้น — เสนอคณะกรรมการ (กิจกรรมที่ 7)`); }
          else { w.status = `รอ ${ROLE_LABELS[r.current.role]} ตรวจ (ชั้น ${r.current.label})`; w.owner = r.current.role; add(`${ROLE_LABELS[role]} เห็นชอบรายงาน ${reportType} — ส่งชั้นถัดไป`); }
        }
      }
      if (action === 'chain-skip-group') {
        const reportType = reportTypeForStage(w.stage);
        const r = chainSkipGroup(st, reportType, role, v('a5ChainOpinion'));
        if (!r.ok) return notify('warning', 'ข้ามไม่ได้', r.message);
        add('ข้ามชั้น ผอ.กลุ่มงาน (ไม่อยู่ในสายงานของสำนวน)');
      }
      if (action === 'chain-return') {
        const reportType = reportTypeForStage(w.stage);
        const rep = reportOf(reportType, i);
        w.stage = reportType === '213' ? 'a5-prelim' : 'a5-inquiry'; w.owner = 'investigator'; w.status = `ส่งกลับ — ไต่สวน${reportType === '213' ? 'เบื้องต้น' : 'ชี้มูล'}เพิ่มเติม (30 วัน)`;
        rep.additionalDeadlineAt = addDays(todayISO(), 30); rep.additionalExtendedOnce = false;
        add(`${ROLE_LABELS[role]} ส่งกลับรายงาน ${reportType} — ไต่สวนเพิ่มเติมภายใน 30 วัน`);
      }
      if (action === 'support-record') {
        const reportType = reportTypeForStage(w.stage);
        const rep = reportOf(reportType, i);
        if (reportType === '213') i.prelim.supportOpinion = v('a5SupportOpinion'); else i.inquiry644.supportOpinion = v('a5SupportOpinion644');
        rep.supportPending = false;
        w.stage = reportType === '213' ? 'a7-213' : 'a7-644'; w.owner = 'committee'; w.status = `คกก. พิจารณา (${reportType}) พร้อมความเห็นอนุกรรมการสนับสนุนฯ`;
        add(`คณะอนุกรรมการสนับสนุนฯ ให้ความเห็นประกอบรายงาน ${reportType} — เสนอคณะกรรมการ`);
      }
      if (action === 'mti213-decide') {
        const result = $('input[name="a5Mti213"]:checked')?.value;
        if (!result) return notify('warning', 'ยังไม่ได้เลือกผลมติ', '');
        i.committee213.result = result; i.committee213.mtiNo = v('a5Mti213No'); i.committee213.mtiDate = v('a5Mti213Date'); i.committee213.note = v('a5Mti213Note');
        i.committee213.decidedAt = now(); i.committee213.decidedBy = ROLE_LABELS[role];
        add(`คณะกรรมการ ป.ป.ท. มีมติ 213: ${result}${i.committee213.mtiNo ? ` (${i.committee213.mtiNo})` : ''}`);
        if (result === 'รับไว้ไต่สวน') {
          i.committee213.orderType = v('a5OrderType') || (role === 'secretary' ? '24v1' : '24v3');
          i.committee213.orderNo = i.committee213.orderNo || guardRun(() => issueOrderNo213());
          i.committee213.orderDate = i.committee213.orderDate || todayISO();
          i.committee213.investigator644 = v('a5Investigator644') || i.intake.investigator;
          i.committee213.handoverDoc = { flag: i.committee213.investigator644 !== i.intake.investigator, letterNo: v('a5Handover'), date: todayISO() };
          w.stage = 'a5-inquiry'; w.owner = 'investigator'; w.status = 'รอคำสั่งแต่งตั้งชุดไต่สวน';
          i.inquiry644.investigator = i.committee213.investigator644;
          i.inquiry644.startedAt = i.committee213.orderType === '24v3' ? (i.committee213.mtiDate || todayISO()) : (i.committee213.orderDate || todayISO());
          i.inquiry644.deadlineAt = addDays(i.inquiry644.startedAt, 270);
          if (i.committee213.handoverDoc.flag && !i.committee213.handoverDoc.letterNo) return notify('warning', 'ต้องมีหนังสือส่งมอบสำนวน', `ผู้รับผิดชอบ 213 (${i.intake.investigator}) กับ 644 (${i.committee213.investigator644}) เป็นคนละคน — กรอกเลขหนังสือส่งมอบ`);
          guardRun(() => publish(st, `คณะกรรมการรับไว้ไต่สวนแล้ว — อยู่ระหว่างไต่สวนชี้มูล (ครบ ${i.inquiry644.deadlineAt})`));
          add(`แต่งตั้ง${i.committee213.orderType === '24v3' ? 'คณะอนุกรรมการไต่สวน (ม.24 ว.3)' : 'คณะพนักงานไต่สวน (ม.24 ว.1)'} ${i.committee213.orderNo} — เริ่มนับ 270 วันจาก ${i.inquiry644.startedAt}`);
        } else if (result === 'ไม่รับไว้ไต่สวน') { w.stage = 'a5-outcome'; w.owner = 'clerk'; w.status = 'แจ้งผลผู้ร้อง/ผู้ถูกกล่าวหา (15 วัน)'; i.outcome.type = result; guardRun(() => publish(st, 'คณะกรรมการมีมติไม่รับเรื่องไว้ไต่สวน')); }
        else if (result.includes('เพิ่มเติม')) { w.stage = 'a5-prelim'; w.owner = 'investigator'; w.status = 'ไต่สวนเบื้องต้นเพิ่มเติม (30 วัน + ขยายต่อบอร์ด 1 ครั้ง 30 วัน)'; i.prelim.additionalDeadlineAt = addDays(todayISO(), 30); i.prelim.additionalExtendedOnce = false; }
        else { w.stage = 'a5-outcome'; w.owner = 'clerk'; w.status = 'จัดทำหนังสือส่ง ป.ป.ช.'; i.outcome.type = result; guardRun(() => publish(st, 'คณะกรรมการมีมติส่งเรื่องไปยังสำนักงาน ป.ป.ช.')); }
      }
      if (action === 'inquiry-save') { add('บันทึกร่างไต่สวนชี้มูล'); }
      if (action === 'inquiry-plan') {
        if (!i.inquiry644.plan) return notify('warning', 'ยังไม่มีแผนคดี 644', 'กรอกแผนงานคดีก่อนส่งขออนุมัติ');
        if (i.inquiry644.planStatus === 'approved') return notify('info', 'แผนคดี 644 อนุมัติแล้ว', '');
        i.inquiry644.planStatus = 'รออนุมัติจากหัวหน้าพนักงาน'; w.status = 'รอ ผอ. อนุมัติแผนคดี 644';
        add('ผู้รับผิดชอบสำนวนส่งแผนคดี 644 ขออนุมัติจาก ผอ.สำนักงาน ป.ป.ท. เขต');
      }
      if (action === 'inquiry-submit') {
        if (!i.inquiry644.plan || i.inquiry644.planStatus !== 'approved') return notify('warning', 'แผนคดี 644 ไม่ครบ', 'จัดทำแผนคดีและรออนุมัติก่อนเสนอ 644');
        if (!i.inquiry644.report) return notify('warning', 'ยังไม่มีสรุปรายงาน 644', 'สรุปผลและความเห็นชี้มูลก่อนเสนอ');
        const fast = await popup('เสนอรายงาน 644', [['a5FastTrack644', 'เร่งด่วน (ใบด่วน)?', 'checkbox']], 'เสนอ');
        i.inquiry644.fastTrack = Boolean(fast.value?.a5FastTrack644);
        if (i.inquiry644.fastTrack) { w.stage = 'a7-644'; w.owner = 'committee'; w.status = 'ใบด่วน — คกก. วินิจฉัย 644'; add('เสนอรายงาน 644 แบบใบด่วน'); }
        else { w.stage = 'a5-inquiry-review'; w.owner = 'group-director'; w.status = 'รอตรวจตามลำดับชั้น (ผอ.กลุ่ม → ผอ.เขต/กอง → ผู้ช่วย/รองเลขาธิการ → เลขาธิการ)'; i.inquiry644.submittedAt = now(); add('คณะผู้ไต่สวนเสนอรายงาน 644 ตามลำดับชั้น'); }
      }
      if (action === 'mti644-decide') {
        const result = $('input[name="a5Mti644"]:checked')?.value;
        if (!result) return notify('warning', 'ยังไม่ได้เลือกผลมติชี้มูล', '');
        i.committee644.result = result; i.committee644.mtiNo = v('a5Mti644No'); i.committee644.mtiDate = v('a5Mti644Date'); i.committee644.note = v('a5Mti644Note');
        i.committee644.decidedAt = now(); i.committee644.decidedBy = ROLE_LABELS[role];
        add(`คณะกรรมการ ป.ป.ท. มีมติชี้มูล 644: ${result}${i.committee644.mtiNo ? ` (${i.committee644.mtiNo})` : ''}`);
        if (result.includes('เพิ่มเติม')) { w.stage = 'a5-inquiry'; w.owner = 'investigator'; w.status = 'ไต่สวนชี้มูลเพิ่มเติม (30 วัน + ขยายต่อบอร์ด 1 ครั้ง 30 วัน)'; i.inquiry644.additionalDeadlineAt = addDays(todayISO(), 30); i.inquiry644.additionalExtendedOnce = false; }
        else { w.stage = 'a5-outcome'; w.owner = 'clerk'; w.status = `ดำเนินการตามมติ: ${result}`; i.outcome.type = result; publish(st, result.includes('ไม่มีมูล') ? 'คณะกรรมการมีมติว่าข้อกล่าวหาไม่มีมูล — แจ้งผลภายใน 15 วัน' : `คณะกรรมการมีมติ: ${result}`); }
      }
      if (action === 'outcome-save') { add('บันทึกการดำเนินการตามมติ'); }
      // 'send-prosecutor'/'prosecutor-order'/'prosecutor-return' retired (Phase 10, item 1):
      // superseded by the canonical prosecutor-* downstream chain (PREPARE_PROSECUTOR_PACKAGE
      // task → prosecutor-package-ready → ... → prosecutor-result-receipt), which already
      // enters/leaves stage a5-outcome/a5-prosecutor with actor/version/idempotency guards.
      // No entry point renders these action IDs anymore; kept as a defensive no-op in case a
      // stale cached button still exists in a client's DOM.
      if (['send-prosecutor', 'prosecutor-order', 'prosecutor-return'].includes(action)) {
        return notify('warning', 'ขั้นตอนนี้ถูกแทนที่แล้ว', 'ระบบย้ายกระบวนการส่งอัยการไปที่เมนู "งานปัจจุบัน" ตามลำดับที่ผลมติกำหนด กรุณากลับไปหน้ารายการสำนวนและเปิดสำนวนใหม่');
      }
      if (action === 'm62-report') {
        const m62 = i.intake.m62 || {};
        if (!m62.report65Letter || !m62.report65Date) return notify('warning', 'ข้อมูลไม่ครบ', 'กรอกเลขหนังสือและวันที่รายงานผลกลับ ป.ป.ช. (ม.65)');
        add(`รายงานผลการดำเนินการต่อคณะกรรมการ ป.ป.ช. ตามมาตรา 65 — ${m62.report65Letter} (${m62.report65Date})`);
        publish(st, `รายงานผลต่อ ป.ป.ช. แล้ว (${m62.report65Letter})`);
      }
      if (action === 'm62-recall') {
        i.intake.m62.recalled = true; w.stage = 'closed'; w.status = 'ป.ป.ช. เรียกสำนวนกลับไปดำเนินการเอง'; w.complete = true;
        add('ป.ป.ช. ไม่เห็นด้วยกับมติ — เรียกสำนวนกลับไปดำเนินการเอง'); guardRun(() => publish(st, 'สำนักงาน ป.ป.ช. เรียกสำนวนกลับไปดำเนินการเอง'));
      }
      if (action === 'search-request' || action === 'search-result') {
        return notify('warning', 'ยังไม่เปิดการส่งต่อหมายค้น', 'กิจกรรมที่ 9 รองรับหมายจับ ไม่ใช่หมายค้น และ source ยังไม่ยืนยันปลายทางของหมายค้น');
      }
      if (action === 'witness-request') {
        const rep = reportTypeForStage(w.stage) === '644' ? i.inquiry644 : i.prelim;
        const pop = await popup('จัดทำคำขอคุ้มครองพยาน', [['a5WpPerson', 'ผู้ถูกคุ้มครอง (ผู้ร้อง/พยาน) *', 'text', 'ระบุชื่อ'], ['a5WpRisk', 'เหตุผลความเสี่ยง *', 'text', 'เช่น ถูกข่มขู่/เกรงอันตราย']], 'ส่งคำขอ');
        if (pop.dismiss) return;
        if (!pop.value?.a5WpPerson || !pop.value?.a5WpRisk) return notify('warning', 'กรอกข้อมูลครบ', 'ผู้ถูกคุ้มครอง + เหตุผลความเสี่ยง');
        rep.witnessProtectionReq = { person: pop.value.a5WpPerson, risk: pop.value.a5WpRisk, by: ROLE_LABELS[role], at: now(), status: 'sent' };
        w.status = `ส่งคำขอคุ้มครองพยาน (${pop.value.a5WpPerson}) แล้ว`;
        add(`${ROLE_LABELS[role]} จัดทำคำขอคุ้มครองพยาน (${pop.value.a5WpPerson}) — ${pop.value.a5WpRisk} → ส่งคำขอคุ้มครอง`);
      }
      if (action === 'witness-result') {
        const rep = reportTypeForStage(w.stage) === '644' ? i.inquiry644 : i.prelim;
        const req = rep.witnessProtectionReq;
        if (!req) return notify('warning', 'ยังไม่มีคำขอ', 'จัดทำคำขอก่อนบันทึกผล');
        const pop = await popup('บันทึกผลการคุ้มครอง', [['a5WpResult', 'ผลการคุ้มครอง/คำสั่ง *', 'text', 'ระบุผลที่ได้รับ']], 'บันทึกผล');
        if (!pop.value?.a5WpResult) return notify('warning', 'กรอกผล', '');
        req.status = 'result';
        rep.witnessProtection = pop.value.a5WpResult;
        w.status = 'ได้รับผลการคุ้มครองพยานแล้ว';
        add(`รับผลคุ้มครองพยาน: ${pop.value.a5WpResult}`);
      }
      if (action === 'urgency-toggle') {
        const rep213 = i.prelim, rep644 = i.inquiry644;
        const isFast = Boolean(rep213.fastTrack || rep644.fastTrack);
        if (isFast) {
          rep213.fastTrack = false; rep644.fastTrack = false;
          add('ยกเลิกใบด่วน — กลับเป็นปกติ');
        } else {
          const pop = await popup('ตั้งเป็นใบด่วน/เร่งด่วน', [['a5UrgentReason', 'เหตุผลความเร่งด่วน *', 'select', 'คดีสำคัญตามนโยบายสำคัญที่ต้องเร่งรัดดำเนินการ|คดีใกล้ขาดอายุความ|คดีที่ผู้มีส่วนได้เสียติดตามอย่างใกล้ชิด|อื่น ๆ']], 'ตั้งใบด่วน');
          if (pop.dismiss) return;
          // ใช้ prelim เป็นหลัก ถ้าอยู่ 644 ให้ติด 644 ด้วย
          rep213.fastTrack = true;
          if (String(w.stage).includes('644') || String(state.workflow?.a5Status || '').includes('644')) rep644.fastTrack = true;
          add(`ตั้งเป็นใบด่วน/เร่งด่วน — ${pop.value?.a5UrgentReason || 'เร่งด่วน'} (ACC018: บรรจุวาระเร่งด่วน)`);
          w.status = `${w.status || ''} · ใบด่วน`;
        }
        saveState(state.caseData.id, state);
        renderA5Detail(state.caseData.id, role);
        return;
      }
      if (action === 'sign' && actionButton.dataset.a5Form5Action === 'sign') {
        if (role !== 'director') return notify('warning', 'ไม่มีสิทธิ์ลงนาม', 'ผอ.สำนักงาน ป.ป.ท. เขต/ประธานอนุกรรมการไต่สวนเท่านั้นที่ลงนามได้');
        const accusedRowId = actionButton.dataset.accusedRowId;
        const pop = await popup('ลงนามหนังสือแจ้งข้อกล่าวหา', [['a5SignMethod', 'วิธีลงนาม *', 'select', 'ลายมือชื่ออิเล็กทรอนิกส์|ลงนามด้วยตนเอง']], 'ลงนาม');
        if (pop.dismiss) return;
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'ลงนามไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'director' }, 'form-5-sign', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, accusedRowId, methodLabel: pop.value?.a5SignMethod || 'ลายมือชื่ออิเล็กทรอนิกส์', actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `form-5-sign:${accusedRowId}:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'ลงนามไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'panel-objection-record') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึก', 'ผู้รับผิดชอบสำนวนเท่านั้นที่บันทึกคำร้องคัดค้านได้');
        const accusedRowId = actionButton.dataset.accusedRowId;
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const form6 = current?.state?.a5DocumentStore?.records?.find(item => item.documentId === api?.form6DocId(accusedRowId));
        const panelOptions = (form6?.payload?.panel || []).map(p => p.name || p.rowId).join('|') || 'ยังไม่มีรายชื่อองค์คณะ';
        const pop = await popup('บันทึกคำร้องคัดค้านองค์คณะ', [['a5ObjPanel', 'ผู้ถูกคัดค้าน *', 'select', panelOptions], ['a5ObjReason', 'เหตุแห่งการคัดค้าน *', 'text', 'ระบุเหตุตามข้อ (๑)-(๕)'], ['a5ObjDate', 'วันที่ยื่นคำร้อง *', 'text', 'YYYY-MM-DD']], 'บันทึก');
        if (pop.dismiss) return;
        if (!pop.value?.a5ObjReason || !pop.value?.a5ObjDate) return notify('warning', 'กรอกข้อมูลให้ครบ', '');
        const panelRow = (form6?.payload?.panel || []).find(p => (p.name || p.rowId) === pop.value?.a5ObjPanel);
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, 'panel-objection-record', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, accusedRowId, objectionId: `obj-${accusedRowId}-${Date.now()}`, panelRowId: panelRow?.rowId || pop.value?.a5ObjPanel, reason: pop.value.a5ObjReason, filedAt: pop.value.a5ObjDate, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `panel-objection:${accusedRowId}:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'service-record') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึก', 'ผู้รับผิดชอบสำนวนเท่านั้นที่บันทึกหลักฐานการส่งได้');
        const accusedRowId = actionButton.dataset.accusedRowId;
        const pop = await popup('บันทึกหลักฐานการส่งหนังสือแจ้งข้อกล่าวหา', [['a5SvMethod', 'วิธีส่ง *', 'text', 'เช่น ไปรษณีย์ตอบรับ'], ['a5SvRecipient', 'ผู้รับ *', 'text', 'ชื่อผู้รับ'], ['a5SvDate', 'วันที่ส่ง/ได้รับ *', 'text', 'YYYY-MM-DD'], ['a5SvEvidence', 'รหัสหลักฐาน (คลังเอกสาร) *', 'text', 'รหัสอ้างอิงใบตอบรับ']], 'บันทึก');
        if (pop.dismiss) return;
        if (!pop.value?.a5SvMethod || !pop.value?.a5SvRecipient || !pop.value?.a5SvDate || !pop.value?.a5SvEvidence) return notify('warning', 'กรอกข้อมูลให้ครบ', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, 'form-5-service-record', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, accusedRowId, serviceRecordId: `svc-${accusedRowId}-${Date.now()}`, method: pop.value.a5SvMethod, recipient: pop.value.a5SvRecipient, servedAt: pop.value.a5SvDate, evidenceVersionIds: [pop.value.a5SvEvidence], actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `service-record:${accusedRowId}:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'defence-record') {
        if (role !== 'investigator') return notify('warning', 'ไม่มีสิทธิ์บันทึก', 'ผู้รับผิดชอบสำนวนเท่านั้นที่บันทึกคำชี้แจงได้');
        const accusedRowId = actionButton.dataset.accusedRowId;
        const pop = await popup('บันทึกคำชี้แจงแก้ข้อกล่าวหา', [['a5DfNoDefence', 'ไม่ยื่นคำชี้แจง (พ้นกำหนด 30 วัน)', 'checkbox', ''], ['a5DfStatement', 'คำชี้แจง (ถ้ามี)', 'text', 'สรุปคำชี้แจง']], 'บันทึก');
        if (pop.dismiss) return;
        const noDefence = Boolean(pop.value?.a5DfNoDefence);
        if (!noDefence && !pop.value?.a5DfStatement) return notify('warning', 'กรอกคำชี้แจงหรือระบุไม่ยื่นคำชี้แจง', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'investigator' }, 'defence-record', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, defenceRecordId: `defence-${accusedRowId}-${Date.now()}`, accusedPersonRef: accusedRowId, statement: pop.value?.a5DfStatement || '', noDefence, attachmentVersionIds: [], actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `defence-record:${accusedRowId}:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'review-record-opinion' && actionButton.dataset.a5Report644Action === 'review-record-opinion') {
        if (role !== 'director') return notify('warning', 'ไม่มีสิทธิ์บันทึกความเห็น', 'ผอ.สำนักงาน ป.ป.ท. เขต/ผู้บังคับบัญชาสายตรวจเท่านั้นที่บันทึกความเห็นได้');
        const pop = await popup('บันทึกความเห็นตรวจรายงาน 644', [['a5OpText', 'ความเห็น *', 'text', 'สรุปความเห็น'], ['a5OpFinal', 'เป็นความเห็นชั้นสุดท้าย (พร้อมลงนาม)', 'checkbox', '']], 'บันทึก');
        if (pop.dismiss) return;
        if (!pop.value?.a5OpText) return notify('warning', 'กรอกความเห็น', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        // authorityRef เป็นข้อมูลจำลองรอเชื่อมระบบยืนยันตัวตนจริง (แนวเดียวกับจุดเชื่อม Phase 5)
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'director' }, 'report-644-review-record-opinion', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, opinionId: `op-${current.state.caseData.id}-${Date.now()}`, opinionText: pop.value.a5OpText, finalLevel: Boolean(pop.value.a5OpFinal), authorityRef: { status: 'CONFIRMED', roleCode: 'director' }, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `review-record-opinion:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'review-return' && actionButton.dataset.a5Report644Action === 'review-return') {
        if (role !== 'director') return notify('warning', 'ไม่มีสิทธิ์ส่งกลับแก้ไข', 'ผอ.สำนักงาน ป.ป.ท. เขต/ผู้บังคับบัญชาสายตรวจเท่านั้นที่ส่งกลับแก้ไขได้');
        const pop = await popup('ส่งรายงาน 644 กลับแก้ไข', [['a5RtReason', 'เหตุผลที่ส่งกลับ *', 'text', 'ระบุส่วนที่ต้องแก้ไข']], 'ส่งกลับ');
        if (pop.dismiss) return;
        if (!pop.value?.a5RtReason) return notify('warning', 'กรอกเหตุผล', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'ส่งกลับไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'director' }, 'report-644-review-return', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, reason: pop.value.a5RtReason, affectedFields: ['report'], affectedDocumentVersionIds: [], authorityRef: { status: 'CONFIRMED', roleCode: 'director' }, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `review-return:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'ส่งกลับไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'sign' && actionButton.dataset.a5Report644Action === 'sign') {
        if (role !== 'director') return notify('warning', 'ไม่มีสิทธิ์ลงนาม', 'ผอ.สำนักงาน ป.ป.ท. เขต/ประธานอนุกรรมการไต่สวนเท่านั้นที่ลงนามได้');
        const pop = await popup('ลงนามรายงานการไต่สวน', [['a5RpSignMethod', 'วิธีลงนาม *', 'select', 'ลายมือชื่ออิเล็กทรอนิกส์|ลงนามด้วยตนเอง']], 'ลงนาม');
        if (pop.dismiss) return;
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'ลงนามไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'director' }, 'report-644-sign', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, methodLabel: pop.value?.a5RpSignMethod || 'ลายมือชื่ออิเล็กทรอนิกส์', authorityRef: { status: 'CONFIRMED', roleCode: 'director' }, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `report-644-sign:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'ลงนามไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'create-package' && actionButton.dataset.a5Report644Action === 'create-package') {
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'จัดชุดไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role }, 'report-644-create-package', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, authorityRef: { status: 'CONFIRMED', roleCode: role }, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `create-package:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'จัดชุดไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'send-a7' && actionButton.dataset.a5Report644Action === 'send-a7') {
        const pop = await popup('ส่งรายงาน 644 ไปกิจกรรมที่ 7', [['a5SaRecipient', 'หน่วยงานผู้รับ *', 'text', 'กิจกรรมที่ 7'], ['a5SaLetter', 'เลขที่หนังสือนำส่ง *', 'text', ''], ['a5SaDate', 'วันที่จัดส่ง *', 'text', 'YYYY-MM-DD'], ['a5SaMethod', 'วิธีจัดส่ง *', 'text', 'หนังสือราชการ/ระบบสารบรรณ']], 'ส่ง');
        if (pop.dismiss) return;
        if (!pop.value?.a5SaRecipient || !pop.value?.a5SaLetter || !pop.value?.a5SaDate || !pop.value?.a5SaMethod) return notify('warning', 'กรอกข้อมูลให้ครบ', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'ส่งไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role }, 'report-644-send-a7', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, dispatchId: `dispatch-${current.state.caseData.id}-${Date.now()}`, recipientName: pop.value.a5SaRecipient, letterNo: pop.value.a5SaLetter, dispatchedAt: pop.value.a5SaDate, deliveryMethod: pop.value.a5SaMethod, recipientAuthority: { status: 'CONFIRMED' }, authorityRef: { status: 'CONFIRMED', roleCode: role }, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `send-a7:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'ส่งไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'record-receipt' && actionButton.dataset.a5Report644Action === 'record-receipt') {
        const pop = await popup('บันทึกหลักฐานกิจกรรมที่ 7 รับรายงาน', [['a5RrDate', 'วันที่ได้รับ *', 'text', 'YYYY-MM-DD'], ['a5RrBy', 'ผู้รับ *', 'text', 'ชื่อผู้รับ'], ['a5RrEvidence', 'รหัสหลักฐาน (คลังเอกสาร) *', 'text', '']], 'บันทึก');
        if (pop.dismiss) return;
        if (!pop.value?.a5RrDate || !pop.value?.a5RrBy || !pop.value?.a5RrEvidence) return notify('warning', 'กรอกข้อมูลให้ครบ', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role }, 'report-644-record-receipt', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, receivedAt: pop.value.a5RrDate, receivedBy: pop.value.a5RrBy, evidenceVersionIds: [pop.value.a5RrEvidence], actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `record-receipt:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'record-result' && actionButton.dataset.a5Report644Action === 'record-result') {
        if (role !== 'committee') return notify('warning', 'ไม่มีสิทธิ์บันทึกผล', 'คณะกรรมการ ป.ป.ท. เท่านั้นที่บันทึกผลพิจารณาได้');
        const pop = await popup('บันทึกผลพิจารณาชี้มูล', [['a5RsCode', 'ผลการพิจารณา *', 'select', 'MULFOUND|NOT_FOUND'], ['a5RsRef', 'เลขที่มติ/เอกสารอ้างอิง *', 'text', ''], ['a5RsDate', 'วันที่มีมติ *', 'text', 'YYYY-MM-DD']], 'บันทึกผล');
        if (pop.dismiss) return;
        if (!pop.value?.a5RsRef || !pop.value?.a5RsDate) return notify('warning', 'กรอกข้อมูลให้ครบ', '');
        const api = globalThis.ECMISActivity5Report644;
        const current = api?.normalizeReport644A5?.(getState(state.caseData.id));
        const account = currentA5Account();
        if (!current?.state || !account) return notify('warning', 'บันทึกไม่สำเร็จ', '');
        const result = api.executeReport644Action(current.state, { id: account.officerId, name: account.name, role: 'committee' }, 'report-644-record-result', { caseId: current.state.caseData.id, expectedVersion: current.state.a5DocumentStore.version, resultCode: pop.value.a5RsCode || 'MULFOUND', resultLabel: pop.value.a5RsCode === 'NOT_FOUND' ? 'ไม่มีมูลความผิด' : 'ชี้มูลความผิด', resultReference: pop.value.a5RsRef, decidedAt: pop.value.a5RsDate, actorId: account.officerId, at: new Date().toISOString(), idempotencyKey: `record-result:${current.state.caseData.id}:${Date.now()}` });
        if (!result?.ok) return notify('warning', 'บันทึกไม่สำเร็จ', result?.errors?.[0]?.message || 'ตรวจสอบข้อมูล');
        saveState(result.state.caseData.id, result.state);
        renderA5Detail(result.state.caseData.id, role, 'current-task', '644');
        return;
      }
      if (action === 'warrant-file') {
        const pop = await popup('ยื่นคำร้องขอหมายจับต่อศาล', [['a5WcCourt', 'ศาล *', 'text', 'ศาลอาญาคดีทุจริตและประพฤติมิชอบ'], ['a5WcDate', 'วันที่ยื่นคำร้อง', 'text', '']], 'ยื่นคำร้อง');
        if (!pop.value?.a5WcCourt) return notify('warning', 'ระบุศาล', '');
        i.outcome.warrant = { status: 'filed', court: pop.value.a5WcCourt, filedAt: pop.value.a5WcDate || now() };
        w.status = 'ยื่นคำร้องขอหมายจับต่อศาลแล้ว — รอศาลพิจารณา';
        add(`ยื่นคำร้องขอหมายจับต่อ ${pop.value.a5WcCourt} (แบบ ปปท. 11) — ${pop.value.a5WcDate || ''}`);
      }
      if (action === 'warrant-court') {
        if (!i.outcome.warrant || i.outcome.warrant.status !== 'filed') return notify('warning', 'ต้องยื่นคำร้องก่อน', '');
        const pop = await popup('บันทึกผลศาล', [['a5WcIssue', 'ผลคำสั่งศาล', 'select', 'ออกหมายจับ|ไม่ออกหมายจับ'], ['a5WcNo', 'หมายจับที่ / ลงวันที่', 'text', 'หมายจับที่ ... ลงวันที่ ...']], 'บันทึกผล');
        if (pop.dismiss) return;
        const issued = pop.value?.a5WcIssue !== 'ไม่ออกหมายจับ';
        i.outcome.warrant.status = issued ? 'issued' : 'denied';
        i.outcome.warrant.warrantNo = pop.value?.a5WcNo || '';
        w.status = issued ? `ศาลออกหมายจับแล้ว${pop.value?.a5WcNo ? ` (${pop.value.a5WcNo})` : ''} — ดำเนินการจับกุม` : 'ศาลไม่ออกหมายจับ — ดำเนินการตามคำสั่งศาล';
        add(`ศาล${issued ? 'ออก' : 'ไม่ออก'}หมายจับ${pop.value?.a5WcNo ? ` (${pop.value.a5WcNo})` : ''} — ${issued ? 'แบบ ปปท. 14/15 + ตำหนิรูปพรรณ 16' : 'แจ้งผู้รับผิดชอบ'}`);
      }
      if (action === 'warrant-arrest') {
        if (!i.outcome.warrant || i.outcome.warrant.status !== 'issued') return notify('warning', 'ต้องมีหมายจับก่อน', '');
        const pop = await popup('บันทึกการจับกุม', [['a5WaResult', 'ผลการจับกุม', 'select', 'จับกุมได้|ยังจับกุมไม่ได้'], ['a5WaNote', 'หมายเหตุ', 'text', '']], 'บันทึก');
        if (pop.dismiss) return;
        i.outcome.warrant.status = 'arrested';
        i.outcome.warrant.arrest = pop.value?.a5WaResult || '';
        i.outcome.warrant.note = pop.value?.a5WaNote || '';
        w.status = pop.value?.a5WaResult === 'จับกุมได้' ? 'จับกุมผู้ถูกกล่าวหาได้ — ส่งบันทึกการจับกุมต่อศาลภายใน 48 ชั่วโมง' : 'ยังจับกุมไม่ได้ — ติดตามตามหมายจับ';
        add(`การจับกุม: ${pop.value?.a5WaResult || ''}${pop.value?.a5WaNote ? ` — ${pop.value.a5WaNote}` : ''}`);
      }
      if (action === 'warrant-notify') {
        if (!i.outcome.warrant || i.outcome.warrant.status !== 'arrested') return notify('warning', 'ต้องจับกุม/ดำเนินการตามหมายก่อน', '');
        i.outcome.warrant.status = 'notified';
        i.outcome.warrant.notifiedAt = now();
        w.status = 'แจ้งหน่วยงานแล้ว (อัยการ/ผบ.ตร./กอท.) — หนังสือแจ้งผลการออกหมายจับ';
        add('แจ้งผลการออกหมายจับ: อัยการ (แบบ ปปท. 17) · ผบ.ตร. (แบบ ปปท. 18) · กอท. (แบบ ปปท. 19) · ผนึกซอง (แบบ ปปท. 20)');
      }
      if (action === 'close-case') {
        const confirmed = await confirmDo('ปิดสำนวน', 'ยืนยันปิดสำนวนคดีนี้?', 'ปิดสำนวน');
        if (!confirmed.isConfirmed) return;
        w.stage = 'closed'; w.status = 'ปิดสำนวน'; w.complete = true;
        i.outcome.closedAt = now(); i.outcome.closedBy = ROLE_LABELS[role];
        add(`${ROLE_LABELS[role]} ปิดสำนวน`); guardRun(() => publish(st, `การดำเนินการเสร็จสิ้น${i.outcome.letters ? ` — เลขหนังสือ ${i.outcome.letters}` : ''}`));
      }
      if (action === 'reopen') { w.stage = 'a5-outcome'; w.status = 'ทบทวนมติ — พยานหลักฐานใหม่'; w.complete = false; add('เปิดสำนวนใหม่เพื่อทบทวนมติ (พยานหลักฐานใหม่)'); }
      if (action === 'request-extension') {
        A5_EXTENSION_RETURN_FOCUS_ACTION = 'request-extension';
        const opened = openExtensionWorkspaceA5(st, role);
        if (!opened.ok) {
          A5_EXTENSION_RETURN_FOCUS_ACTION = '';
          return notify('warning', 'เปิดคำขอขยายเวลาไม่ได้', opened.message);
        }
        saveState(st.caseData.id, st);
        renderA5Detail(st.caseData.id, role, 'current-task');
        return;
      }
      if (action === 'approve-extension') {
        const reportType = reportTypeForStage(w.stage);
        const pending = pendingExtension(reportType, i);
        if (!pending) return notify('warning', 'ไม่มีคำขอรอพิจารณา', '');
        if (pending.role !== role) return notify('warning', 'ไม่มีสิทธิ์', `${ROLE_LABELS[pending.role]} เป็นผู้พิจารณา`);
        const pop = await popup(`อนุมัติขยายครั้งที่ ${pending.round}`, [['a5ApproveDays', `จำนวนวัน (ขอ ${pending.requestedDays} วัน)`, 'number', String(pending.requestedDays)], ['a5ApproveNote', 'หมายเหตุ', 'text', '']], 'อนุมัติ');
        const r = applyExtension(st, reportType, pop.value?.a5ApproveNote || pending.reason, role, Number(pop.value?.a5ApproveDays) || pending.requestedDays);
        if (!r.ok) return notify('error', 'อนุมัติไม่ได้', r.message);
        w.status = `ขยายครั้งที่ ${pending.round} แล้ว — ครบ ${r.deadline}`;
      }
      if (action === 'deny-extension') {
        const reportType = reportTypeForStage(w.stage);
        const pop = await popup('ไม่อนุมัติคำขอขยาย', [['a5DenyNote', 'เหตุผล', 'text', '']], 'ไม่อนุมัติ');
        const r = denyExtension(st, reportType, role, pop.value?.a5DenyNote || '');
        if (!r.ok) return notify('error', 'ปฏิเสธไม่ได้', r.message);
        w.status = `คำขอขยายไม่ผ่าน — ดำเนินการต่อภายในเวลาที่เหลือ (ครบ ${reportOf(reportType, i).deadlineAt})`;
      }
      if (action.startsWith('late-')) {
        const api = globalThis.ECMISActivity5ExtensionLateReport;
        const lateReportId = actionButton.dataset.lateReportId || '';
        const report = (i.extensionLateReports || []).find(item => item.lateReportId === lateReportId);
        if (!api || !report) return notify('warning', 'ไม่พบกระบวนการรายงานเหตุล่าช้า', 'โหลดข้อมูลสำนวนใหม่แล้วลองอีกครั้ง');
        const account = currentA5Account();
        const step = report.routing?.steps?.[report.routingIndex];
        const actorId = account?.officerId || step?.contract?.reviewerId || '';
        const base = { lateReportId, expectedVersion: report.version, idempotencyKey: `${action}:${lateReportId}:${Date.now()}`, actorId, actorRole: role, assignmentVersion: Number(step?.contract?.assignmentVersion), at: new Date().toISOString() };
        let result = null;
        if (action === 'late-review') {
          if (step?.contract?.reviewerRole !== role || (account?.officerId && account.officerId !== step.contract.reviewerId)) return notify('warning', 'ไม่มีสิทธิ์', 'บัญชีปัจจุบันไม่ตรงกับ reviewer contract');
          const pop = await popup('ตรวจรายงานเหตุล่าช้า', [['decision', 'ผลการตรวจ', 'select', 'เห็นชอบ|ส่งกลับแก้ไข'], ['opinion', 'ความเห็น/เหตุผล *']], 'บันทึก');
          if (!pop.isConfirmed || !pop.value?.opinion) return;
          result = pop.value.decision === 'ส่งกลับแก้ไข' ? api.returnLateReport(st, base) : api.recordLateReportOpinion(st, { ...base, opinion: pop.value.opinion });
        } else if (action === 'late-skip-group') {
          const pop = await popup('ข้ามความเห็น ผอ.กลุ่มงาน', [['reason', 'เหตุผลว่าไม่อยู่ในสายงาน *']], 'ยืนยัน');
          if (!pop.isConfirmed || !pop.value?.reason) return;
          result = api.skipGroupOpinion(st, { ...base, reason: pop.value.reason });
        } else if (action === 'late-secretary') {
          if (step?.contract?.reviewerRole !== role || (account?.officerId && account.officerId !== step.contract.reviewerId)) return notify('warning', 'ไม่มีสิทธิ์', 'ต้องเป็นเลขาธิการตาม personal assignment เท่านั้น');
          const pop = await popup('เลขาธิการพิจารณาด้วยตนเอง', [['decision', 'คำวินิจฉัย *'], ['correctiveGuidance', 'แนวทางแก้ไข *']], 'บันทึกคำวินิจฉัย');
          if (!pop.isConfirmed || !pop.value?.decision || !pop.value?.correctiveGuidance) return;
          result = api.recordSecretaryPersonalDecision(st, { ...base, decision: pop.value.decision, correctiveGuidance: pop.value.correctiveGuidance });
        } else if (action === 'late-resubmit') {
          const pop = await popup('แก้ไขรายงานเหตุล่าช้า', [['reasonAndNecessity', 'เหตุผลและความจำเป็น *'], ['workDone', 'งานที่ดำเนินการแล้ว *'], ['workRemaining', 'งานที่ยังเหลือ *'], ['obstacles', 'ปัญหาและอุปสรรค *'], ['correctivePlan', 'แนวทางแก้ไข *']], 'บันทึกและส่งใหม่');
          if (!pop.isConfirmed || ['reasonAndNecessity', 'workDone', 'workRemaining', 'obstacles', 'correctivePlan'].some(field => !pop.value?.[field])) return;
          const saved = api.saveLateReportDraft(st, { ...base, patch: { ...pop.value, evidenceVersionIds: [] } });
          if (!saved?.ok) result = saved;
          else {
            const savedReport = saved.result.inquiry.extensionLateReports.find(item => item.lateReportId === lateReportId);
            result = api.submitLateReport(saved.result, { ...base, expectedVersion: savedReport.version, idempotencyKey: `late-resubmit:${lateReportId}:${Date.now()}`, repository: extensionRepositoryA5(st, report.reportType), extensionLedger: reportOf(report.reportType, i).extensionHistory || [], progressObligations: i.extensionProgress?.obligations || [] });
          }
        } else if (action === 'late-package') {
          const activeRevision = report.revisions.find(item => item.revisionNo === report.activeRevisionNo);
          result = api.createLateReportPackage(st, { ...base, packageId: `late-package:${lateReportId}:${Date.now()}`, renderedReport: { contentType: 'application/json', content: JSON.stringify(activeRevision?.submittedSnapshot || {}) }, documentVersionIds: activeRevision?.submittedSnapshot?.evidenceVersions?.map(item => item.versionId) || [] });
        } else if (action === 'late-dispatch') {
          const pkg = report.packages.at(-1);
          result = api.dispatchLateReportPackage(st, { ...base, packageId: pkg?.packageId, packageVersion: pkg?.packageVersion });
        } else if (action === 'late-receipt') {
          const dispatch = report.dispatches.at(-1);
          const pop = await popup('บันทึกหลักฐานตอบรับจากกิจกรรมที่ 7', [['receiptId', 'เลขอ้างอิงหลักฐานตอบรับ *']], 'บันทึก');
          if (!pop.isConfirmed || !pop.value?.receiptId) return;
          result = api.recordActivity7Receipt(st, { ...base, packageId: dispatch?.packageId, packageVersion: dispatch?.packageVersion, receiptId: pop.value.receiptId });
        } else if (action === 'late-wait') {
          result = api.beginWaitActivity7Result(st, base);
        } else if (action === 'late-result') {
          const pkg = report.packages.at(-1);
          const pop = await popup('ผลจากกิจกรรมที่ 7', [['decision', 'ผล', 'select', 'บันทึกผล|ส่งกลับแก้ไข'], ['decisionArtifactVersionId', 'version หลักฐานมติ *']], 'บันทึก');
          if (!pop.isConfirmed) return;
          result = pop.value.decision === 'ส่งกลับแก้ไข'
            ? api.recordActivity7Return(st, base)
            : api.recordActivity7Result(st, { ...base, result: { packageId: pkg?.packageId, packageVersion: pkg?.packageVersion, decisionArtifactVersionId: pop.value.decisionArtifactVersionId } });
        }
        if (!result?.ok) return notify('warning', 'ดำเนินการรายงานเหตุล่าช้าไม่สำเร็จ', result?.code || 'ตรวจสอบข้อมูลและสิทธิ์');
        i.extensionLateReports = result.result.inquiry.extensionLateReports;
        add(`กระบวนการรายงานเหตุล่าช้า: ${result.code}`);
      }
      if (action === 'extension-late') {
        const reportType = reportTypeForStage(w.stage);
        const pop = await popup('ใช้รอบขยายปกติครบแล้วยังไม่แล้วเสร็จ', [['a5LateReport', 'เหตุผลและความจำเป็น *', 'text', 'ระบุเหตุผลล่าช้า'], ['a5LateWorkDone', 'งานที่ดำเนินการแล้ว *', 'text', 'สรุปงานที่ผ่านมา'], ['a5LateRemaining', 'งานที่ยังเหลือ *', 'text', 'ระบุงานคงเหลือ'], ['a5LateObstacles', 'ปัญหาและอุปสรรค *', 'text', 'ระบุอุปสรรค'], ['a5LateRemedy', 'ความเห็น/แนวทางแก้ไข *', 'text', 'เสนอแนวทางเร่งรัดหรือแก้ไข'], ['a5LateEvidence', 'หลักฐานประกอบ', 'text', 'รายการหลักฐาน']], 'เสนอ คกก.');
        const requiredLateFields = ['a5LateReport', 'a5LateWorkDone', 'a5LateRemaining', 'a5LateObstacles', 'a5LateRemedy'];
        if (requiredLateFields.some(key => !pop.value?.[key])) return notify('warning', 'ข้อมูลรายงานเหตุล่าช้าไม่ครบ', 'กรอกเหตุผล งานที่ทำแล้ว งานคงเหลือ อุปสรรค และแนวทางแก้ไข');
        if (extensionRound(reportType, i)) return notify('warning', 'ยังมีรอบขยายปกติเหลืออยู่', 'ใช้กระบวนการยื่นคำขอขยายรอบปกติก่อน');
        const routing = lateReportRoutingA5(st);
        if (!routing.ok) return notify('warning', 'ยังส่งรายงานเหตุล่าช้าไม่ได้', routing.code === 'SECRETARY_PERSONAL_CONFIRMATION_REQUIRED' ? 'ต้องยืนยันเลขาธิการผู้พิจารณาด้วยตนเองจากคำสั่งมอบหมายที่มีผล' : 'ยังยืนยันสายความเห็นครบทุกชั้นไม่ได้');
        const ownerId = currentA5Account()?.officerId || '';
        const api = globalThis.ECMISActivity5ExtensionLateReport;
        const limit = reportType === '213' ? 2 : 4;
        const signal = { type: 'LATE_REPORT_REQUIRED', target: 'ACTIVITY_7', reportType, extensionType: extensionTypeForReportA5(reportType), normalRoundLimit: limit, requestedRoundNo: limit + 1 };
        const created = api?.createLateReport?.(st, { signal, ownerId, actorId: ownerId, caseId: st.caseData.id, deadlineVersion: Number(reportOf(reportType, i).deadlineVersion), routing: routing.routing });
        if (!created?.ok) return notify('warning', 'สร้างรายงานเหตุล่าช้าไม่สำเร็จ', created?.code || 'ตรวจสอบข้อมูล');
        const lateReport = created.result.inquiry.extensionLateReports.find(item => item.reportType === reportType);
        const saved = api.saveLateReportDraft(created.result, { lateReportId: lateReport.lateReportId, expectedVersion: lateReport.version, idempotencyKey: `late-save:${lateReport.lateReportId}:${Date.now()}`, actorId: ownerId, patch: { reasonAndNecessity: pop.value.a5LateReport, workDone: pop.value.a5LateWorkDone, workRemaining: pop.value.a5LateRemaining, obstacles: pop.value.a5LateObstacles, correctivePlan: pop.value.a5LateRemedy, evidenceVersionIds: [] } });
        if (!saved?.ok) return notify('warning', 'บันทึกรายงานเหตุล่าช้าไม่สำเร็จ', saved?.code || 'ตรวจสอบข้อมูล');
        const savedReport = saved.result.inquiry.extensionLateReports.find(item => item.lateReportId === lateReport.lateReportId);
        const submitted = api.submitLateReport(saved.result, { lateReportId: lateReport.lateReportId, expectedVersion: savedReport.version, idempotencyKey: `late-submit:${lateReport.lateReportId}:${Date.now()}`, actorId: ownerId, at: new Date().toISOString(), repository: extensionRepositoryA5(st, reportType), extensionLedger: reportOf(reportType, i).extensionHistory || [], progressObligations: i.extensionProgress?.obligations || [] });
        if (!submitted?.ok) return notify('warning', 'ส่งรายงานเหตุล่าช้าไม่สำเร็จ', submitted?.code || 'ตรวจสอบข้อมูล');
        i.extensionLateReports = submitted.result.inquiry.extensionLateReports;
        add(`ส่งรายงานเหตุล่าช้า ${reportType} เข้าสายความเห็นแล้ว โดยไม่เปลี่ยนกำหนดเวลาและผู้ถือสำนวนหลัก`);
      }
      if (action === 'progress-report') {
        const process = i.extensionProgress;
        const obligationId = actionButton.dataset.obligationId || '';
        const obligation = process?.obligations?.find(item => item.obligationId === obligationId);
        if (!obligation) return notify('warning', 'ไม่พบงวดติดตาม', 'โหลดข้อมูลสำนวนใหม่แล้วลองอีกครั้ง');
        const pop = await popup('รายงานความคืบหน้างวดที่ ' + obligation.sequenceNo, [['progress', 'สรุปความคืบหน้า *'], ['workDone', 'งานที่ดำเนินการแล้ว *'], ['workRemaining', 'งานที่ยังเหลือ *'], ['obstacles', 'ปัญหาและอุปสรรค *'], ['nextAction', 'การดำเนินการถัดไป *']], 'บันทึกและส่ง');
        if (!pop.isConfirmed) return;
        const patch = pop.value || {};
        if (['progress', 'workDone', 'workRemaining', 'obstacles', 'nextAction'].some(field => !String(patch[field] || '').trim())) return notify('warning', 'ข้อมูลไม่ครบ', 'กรอกข้อมูลรายงานความคืบหน้าให้ครบทุกช่อง');
        const api = globalThis.ECMISActivity5ExtensionProgress;
        const actorId = currentA5Account()?.officerId || '';
        const saved = api?.saveProgressDraft?.(process, { obligationId, actorId, expectedVersion: Number(process.version || 1), patch });
        if (!saved?.ok) return notify('warning', 'บันทึกร่างไม่สำเร็จ', saved?.code || 'ตรวจสอบข้อมูล');
        const submitted = api.submitProgressRevision(saved.result, { obligationId, actorId, expectedVersion: Number(saved.result.version || 1), at: new Date().toISOString(), idempotencyKey: `progress-submit:${obligationId}:${Date.now()}`, repository: extensionRepositoryA5(st, reportTypeForStage(w.stage)) });
        if (!submitted?.ok) return notify('warning', 'ส่งรายงานไม่สำเร็จ', submitted?.code || 'ตรวจสอบข้อมูล');
        i.extensionProgress = submitted.result;
        add(`ส่งรายงานความคืบหน้างวดที่ ${obligation.sequenceNo}`);
      }
      if (action === 'request-additional-extension') {
        const reportType = reportTypeForStage(w.stage);
        const rep = reportOf(reportType, i);
        if (!rep.additionalDeadlineAt) return notify('warning', 'ไม่มีกำหนดไต่สวนเพิ่มเติมที่ต้องขยาย', '');
        if (rep.additionalExtendedOnce) return notify('warning', 'ขยายไต่สวนเพิ่มเติมได้เพียงครั้งเดียว', 'ครบกำหนดแล้วต้องเสนอคณะกรรมการ (รายงานเหตุล่าช้า)');
        if (rep.additionalExtensionPending) return notify('warning', 'มีคำขอรอพิจารณาอยู่แล้ว', '');
        const pop = await popup('ขอขยายไต่สวนเพิ่มเติมอีก 30 วัน', [['a5AddExtReason', 'เหตุผลและความจำเป็น *', 'text', 'ระบุเหตุผล...']], 'ยื่นคำขอ');
        if (!pop.value?.a5AddExtReason) return notify('warning', 'ต้องระบุเหตุผล', '');
        rep.additionalExtensionPending = { reason: pop.value.a5AddExtReason, requestedBy: ROLE_LABELS[role], requestedAt: now() };
        w.status = `รอ ผอ. อนุมัติขยายไต่สวนเพิ่มเติม (${reportType})`;
        add(`${ROLE_LABELS[role]} ยื่นคำขอขยายไต่สวนเพิ่มเติมอีก 30 วัน (${reportType}) — ${pop.value.a5AddExtReason}`);
      }
      if (action === 'approve-additional-extension') {
        const reportType = reportTypeForStage(w.stage);
        const rep = reportOf(reportType, i);
        if (!rep.additionalExtensionPending) return notify('warning', 'ไม่มีคำขอรอพิจารณา', '');
        rep.additionalDeadlineAt = addDays(rep.additionalDeadlineAt, 30);
        rep.additionalExtendedOnce = true;
        add(`${ROLE_LABELS[role]} อนุมัติขยายไต่สวนเพิ่มเติมอีก 30 วัน (${reportType}) — ครบกำหนดใหม่ ${rep.additionalDeadlineAt}`);
        rep.additionalExtensionPending = null;
        w.status = `ไต่สวน${reportType === '213' ? 'เบื้องต้น' : 'ชี้มูล'}เพิ่มเติม (ขยายแล้ว) — ครบ ${rep.additionalDeadlineAt}`;
      }
      if (action === 'deny-additional-extension') {
        const reportType = reportTypeForStage(w.stage);
        const rep = reportOf(reportType, i);
        if (!rep.additionalExtensionPending) return notify('warning', 'ไม่มีคำขอรอพิจารณา', '');
        add(`${ROLE_LABELS[role]} ไม่อนุมัติคำขอขยายไต่สวนเพิ่มเติม (${reportType})`);
        rep.additionalExtensionPending = null;
        w.status = `คำขอขยายไต่สวนเพิ่มเติมไม่ผ่าน — ดำเนินการต่อภายในเวลาที่เหลือ (ครบ ${rep.additionalDeadlineAt})`;
      }
      if (action === 'special-save') { add(`บันทึกผลการตรวจสอบข้อเท็จจริง (${i.special.type === '583' ? '58/3 — แจ้ง สตง.' : '58/2 — แจ้งหน่วยงานรัฐ'})`); publish(st, 'อยู่ระหว่างการตรวจสอบข้อเท็จจริง'); }
      if (action === 'special-secretary') { i.special.secretaryAt = now(); add('เสนอรายงานตรวจสอบข้อเท็จจริงต่อเลขาธิการตามลำดับชั้น'); }
      if (action === 'special-notice') { i.special.publicNotice = true; add('หน่วยงานไม่ดำเนินการแก้ไข — สำนักงาน ป.ป.ท. ประกาศให้ประชาชนทราบเป็นการทั่วไป (58/2)'); publish(st, 'ประกาศให้ประชาชนทราบเป็นการทั่วไป'); }
      if (action === 'special-switch') {
        const ok = await confirmDo('เปลี่ยนเส้นทางเข้าคดี', 'พบพฤติการณ์ทุจริต — เปลี่ยนจากเส้นตรวจสอบข้อเท็จจริงเข้าสู่เส้นทางคดีตามอำนาจ?', 'เปลี่ยนเส้นทาง');
        if (!ok.isConfirmed) return;
        i.special.switched = true; st.caseData.decision = '18/1ก';
        w.stage = 'a5-intake'; w.owner = 'clerk'; w.status = 'เปลี่ยนเส้นทางเข้าคดีแล้ว — รอรับสำนวน'; w.complete = false;
        add('พบพฤติการณ์ทุจริต — เปลี่ยนเส้นทางเข้าสู่คดีตามอำนาจหน้าที่ (เลขสำนวนใหม่)'); publish(st, 'เปลี่ยนเส้นทางดำเนินการเข้าสู่กระบวนการคดี');
      }
      if (action === 'org-approve-pending' || action === 'prosecutor-execute') { i.prosecutor.executedAt = now(); add('ดำเนินการตามคำสั่งอัยการแล้ว'); }
      guardRun(() => saveState(st.caseData.id, st));
      renderA5Detail(st.caseData.id, role);
    };
  }

  const FONT_SIZE_STORAGE_KEY = 'ecmis-a4-font-size-v2';
  const DEFAULT_FONT_SIZE_STEP = 1;
  function fontSizeControlsA5() {
    return `<div class="ws-font-controls" role="group" aria-label="ปรับขนาดตัวอักษร"><span>ขนาดตัวอักษร</span><button type="button" data-font-size="decrease" aria-label="ลดขนาดตัวอักษร">A−</button><button type="button" data-font-size="reset" aria-label="ใช้ขนาดตัวอักษรปกติ">A</button><button type="button" data-font-size="increase" aria-label="เพิ่มขนาดตัวอักษร">A+</button><output id="a5FontSizeValue" aria-live="polite">100%</output></div>`;
  }
  function applyFontSizeA5(step) {
    const normalized = Math.max(-1, Math.min(3, Number(step) || 0));
    const fontSize = 16 + normalized;
    document.documentElement.style.fontSize = `${fontSize}px`;
    try { localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(normalized)); } catch {}
    const output = $('#a5FontSizeValue') || $('#fontSizeValue');
    if (output) output.textContent = `${Math.round((fontSize / 16) * 100)}%`;
    $$('[data-font-size]').forEach(button => button.classList.toggle('active', button.dataset.fontSize === 'reset' && normalized === DEFAULT_FONT_SIZE_STEP));
    return normalized;
  }
  function wireA5FontControls() {
    let step = DEFAULT_FONT_SIZE_STEP;
    try {
      const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (stored !== null) step = Number(stored);
    } catch {}
    applyFontSizeA5(Number.isFinite(step) ? step : DEFAULT_FONT_SIZE_STEP);
  }
  const A5_SEARCH_ACTIONS = [
    { label: 'รับสำนวนและมอบหมายนักสืบ', kw: 'รับสำนวน มอบหมาย accept intake', action: 'accept-case' },
    { label: 'จัดทำแผนคดีไต่สวน (213)', kw: 'แผนคดี แผน 213 plan', action: 'prelim-plan' },
    { label: 'บันทึกมติ คกก. (รับไต่สวน)', kw: 'มติ คกก. mti 213 รับไต่สวน', action: 'mti213-decide' },
    { label: 'เสนอรายงาน 644 ตามลำดับชั้น', kw: 'เสนอรายงาน 644 report', action: 'inquiry-submit' },
    { label: 'บันทึกมติชี้มูล คกก.', kw: 'มติชี้มูล คกก. mti 644', action: 'mti644-decide' },
    { label: 'ยื่นคำขอขยายเวลา', kw: 'ขยายเวลา extension 60 วัน', action: 'request-extension' },
    { label: 'จัดทำคำขอคุ้มครองพยาน', kw: 'คุ้มครองพยาน witness', action: 'witness-request' },
    { label: 'หมายค้น — ปลายทางยังยืนยันไม่ได้', kw: 'หมายค้น search warrant', action: 'search-request' },
    { label: 'ยื่นคำร้องขอหมายจับต่อศาล', kw: 'หมายจับ ศาล warrant', action: 'warrant-file' },
    { label: 'แจ้งหน่วยงาน (อัยการ/ผบ.ตร./กอท.)', kw: 'แจ้งหน่วยงาน notify หมายจับ', action: 'warrant-notify' },
    { label: 'พิมพ์/PDF เอกสาร', kw: 'พิมพ์ pdf print เอกสาร', action: 'print' },
    { label: 'ปิดสำนวน', kw: 'ปิดสำนวน close', action: 'close-case' }
  ];
  function wireA5Search(role) {
    const searchInput = $('#a5SearchInput'), searchResults = $('#a5SearchResults');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = '1';
    let searchTimer = null;
    const norm = s => String(s || '').toLowerCase();
    const closeSearch = () => { searchResults.classList.add('ws-hidden'); searchResults.innerHTML = ''; };
    const openTarget = prefer => {
      if (view === 'detail') {
        const h1 = document.querySelector('#a5App .ws-case-head h1');
        if (h1 && h1.textContent.trim()) return h1.textContent.trim();
      }
      const all = allA5Cases();
      const hit = prefer ? all.find(prefer) : null;
      return (hit || all[0])?.caseData?.id || '';
    };
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) { closeSearch(); return; }
        const caseHits = allA5Cases().filter(st => {
          const c = st.caseData || {}, w = st.workflow || {}, i = st.inquiry || {};
          const hay = [c.id, c.trackingYear, c.trackingCode, c.subject, c.complainant, c.agency, c.region, phaseLabel(st), w.status, w.stage, i.intake?.unit, i.intake?.investigator, (i.inquiry644?.accused || []).join(' '), i.inquiry644?.allegations, i.prelim?.plan].map(norm).join(' ');
          return hay.includes(q);
        });
        const docHits = Object.entries(A5_FORMS).filter(([id, f]) => norm(id + ' ' + f.code + ' ' + f.name).includes(q));
        const actionHits = A5_SEARCH_ACTIONS.filter(a => norm(a.label + ' ' + a.kw).includes(q));
        let html = '';
        if (caseHits.length) html += `<div class="ws-search-group">คดี (${caseHits.length})</div>` + caseHits.slice(0, 6).map(st => { const c = st.caseData; return `<button type="button" class="ws-search-item" data-a5-search-case="${escapeHtml(c.id)}"><span>${escapeHtml(c.subject || c.id)}</span><small>${escapeHtml(c.id)} · ${escapeHtml(phaseLabel(st))}</small></button>`; }).join('');
        if (docHits.length) html += `<div class="ws-search-group">เอกสาร (${docHits.length})</div>` + docHits.slice(0, 6).map(([id, f]) => `<button type="button" class="ws-search-item" data-a5-search-doc="${id}"><span>${f.code} ${escapeHtml(f.name)}</span></button>`).join('');
        if (actionHits.length) html += `<div class="ws-search-group">ฟังก์ชัน (${actionHits.length})</div>` + actionHits.slice(0, 6).map(a => `<button type="button" class="ws-search-item" data-a5-search-action="${a.action}"><span>${a.label}</span></button>`).join('');
        if (!html) html = '<div class="ws-search-empty">ไม่พบสิ่งที่ค้นหา</div>';
        searchResults.innerHTML = html;
        searchResults.classList.remove('ws-hidden');
      }, 180);
    });
    searchResults.addEventListener('click', e => {
      const caseBtn = e.target.closest('[data-a5-search-case]');
      if (caseBtn) { window.EXMIS?.showA5(caseBtn.dataset.a5SearchCase); closeSearch(); searchInput.blur(); return; }
      const docBtn = e.target.closest('[data-a5-search-doc]');
      if (docBtn) {
        const target = openTarget();
        window.EXMIS?.showA5(target);
        setTimeout(() => { const tab = document.querySelector(`#a5App [data-a5-doc="${docBtn.dataset.a5SearchDoc}"]`); if (tab) tab.click(); }, 80);
        closeSearch(); searchInput.blur(); return;
      }
      const actBtn = e.target.closest('[data-a5-search-action]');
      if (actBtn) {
        const target = openTarget();
        window.EXMIS?.showA5(target);
        setTimeout(() => { const btn = [...document.querySelectorAll('#a5App [data-a5-action]')].find(b => b.dataset.a5Action === actBtn.dataset.a5SearchAction && !b.disabled); if (btn) btn.click(); }, 80);
        closeSearch(); searchInput.blur();
      }
    });
  }
  function headerA5(role, xlBadge = '') {
    return `<header class="ws-topbar"><div class="ws-topbar-inner"><div class="ws-search"><input id="a5SearchInput" type="search" placeholder="ค้นหาคดี เอกสาร ฟังก์ชัน..." autocomplete="off" aria-label="ค้นหาทุกอย่าง"><div class="ws-search-results ws-hidden" id="a5SearchResults"></div></div><a class="ws-brand" href="index.html"><span class="ws-brand-mark">ศร</span><span><strong>E-CMIS</strong><small>ระบบบริหารจัดการเรื่องร้องเรียน</small></span></a><div class="ws-profile">${xlBadge}${fontSizeControlsA5()}${mockAccountSelectorA5(role)}<span>สิทธิ์การทำงาน</span><select class="ws-role-select" id="wsRoleA5">${ROLE_ORDER.map(r => `<option value="${r}" ${r === role ? 'selected' : ''}>${ROLE_LABELS[r]}</option>`).join('')}</select></div></div></header>`;
  }

  /* ---------- view + render ---------- */
  let view = 'list';
  function activeRole() {
    const stored = sessionStorage.getItem(A5_ROLE_KEY);
    if (stored && ROLE_LABELS[stored]) return stored;
    const a4 = sessionStorage.getItem(ROLE_KEY);
    const map = { admin: 'clerk', officer: 'investigator', center: 'director', division: 'director', acting: 'secretary' };
    return map[a4] || 'clerk';
  }
  function renderA5(role = activeRole()) {
    const root = $('#a5App');
    if (!root) return;
    const a5q = new URLSearchParams(location.search).get('a5q') || '';
    const filters = { q: $('#a5FilterSearch')?.value, region: $('#a5FilterRegion')?.value, phase: $('#a5FilterPhase')?.value, investigator: $('#a5FilterInvestigator')?.value, a5q };
    const menuLabel = A5_MENU[a5q];
    const banner = menuLabel ? `<div class="ws-callout a5q-banner">กำลังแสดง: <strong>${escapeHtml(menuLabel)}</strong> <a class="a5q-clear" href="?view=a5&role=${encodeURIComponent(role)}" title="แสดงสำนวนทั้งหมด">ล้างตัวกรอง</a></div>` : '';
    root.innerHTML = `${headerA5(role)}<main class="ws-container"><section id="a5ListView"><div class="ws-page-head"><div><p class="ws-kicker">ระบบกระบวนการดำเนินงานเรื่องร้องเรียนกล่าวหา</p><h1>${escapeHtml(menuLabel || 'รายการสำนวนคดี')}</h1><p>สำนวนที่ส่งต่อจากสำนักงาน ป.ป.ท. — ไต่สวนเบื้องต้น → คณะกรรมการ → ไต่สวนชี้มูล → อัยการ/ติดตาม → ปิดสำนวน</p></div></div>${banner}
    <section class="ws-dashboard" aria-label="ภาพรวมสำนวน"><article class="ws-dashboard-card overview"><span>สำนวนทั้งหมด</span><strong id="a5DashboardTotal">0</strong><p>ทุกเฟส</p></article><article class="ws-dashboard-card pending"><span>รอรับสำนวน</span><strong id="a5DashboardPending">0</strong><p>รอธุรการคดีมอบหมาย</p></article><article class="ws-dashboard-card reviewing"><span>อยู่ระหว่างไต่สวน</span><strong id="a5DashboardWorking">0</strong><p>213 / 644 / คกก.</p></article><article class="ws-dashboard-card completed"><span>เสร็จสิ้น</span><strong id="a5DashboardDone">0</strong><p>ปิดสำนวน / 58/2</p></article></section>
    <section class="ws-card ws-filters"><div class="ws-filter-grid"><div class="ws-field"><label>คำค้น</label><input id="a5FilterSearch" placeholder="เลขสำนวน เรื่อง หน่วยงาน นักสืบ"></div><div class="ws-field"><label>หน่วยงาน/เขต</label><select id="a5FilterRegion"><option value="">ทุกหน่วยงาน</option>${UNITS.map(u => `<option>${u}</option>`).join('')}</select></div><div class="ws-field"><label>เฟส/สถานะ</label><select id="a5FilterPhase"><option value="">ทุกเฟส</option></select></div><div class="ws-field"><label>ผู้รับผิดชอบ</label><select id="a5FilterInvestigator"><option value="">ทั้งหมด</option>${INVESTIGATORS.map(x => `<option>${x}</option>`).join('')}</select></div></div></section>
    <section class="ws-card"><div class="ws-table-wrap"><table class="ws-table"><thead><tr><th>เลขสำนวน/เลขรับบริการ</th><th>เรื่อง/หน่วยงาน</th><th>ผู้ร้อง/ปลายทาง</th><th>ผู้รับผิดชอบ</th><th>เฟส/สถานะ</th><th>กรอบเวลา</th></tr></thead><tbody id="a5CaseRows"></tbody></table></div></section></section></main>`;
    $('#wsRoleA5').onchange = e => { sessionStorage.setItem(A5_ROLE_KEY, e.target.value); renderA5(e.target.value); };
    $('#a5MockAccount')?.addEventListener('change', event => {
      setCurrentA5MockAccount(event.target.value);
      renderA5(role);
    });
    
    wireA5Search(role);
    wireA5FontControls();
    const phaseSelect = $('#a5FilterPhase');
    [...new Set(allA5Cases().map(phaseLabel))].forEach(p => { const o = document.createElement('option'); o.textContent = p; phaseSelect.appendChild(o); });
    ['Search', 'Region', 'Phase', 'Investigator'].forEach(x => { const el = $(`#a5Filter${x}`); if (el) el.addEventListener(x === 'Search' ? 'input' : 'change', () => renderA5(role)); });
    renderA5List(role, filters);
  }

  /* ---------- migration ---------- */
  function migrateLegacy() {
    try {
      if (localStorage.getItem(MIGRATED_KEY) === '1') return;
      const store = readStore();
      const handoffs = readLegacy(LEGACY_HANDOFF_KEY);
      for (const ref of Object.keys(handoffs.records || {})) {
        const h = handoffs.records[ref];
        const s = store[h?.sourceReference || ref];
        if (s) { ensureInquiry(s); s.inquiry.intake.handoffRef = h?.handoffId || ref; s.inquiry.intake.unit = h?.destinationUnit || s.inquiry.intake.unit || s.caseData?.region || ''; }
      }
      const a5 = readLegacy(LEGACY_A5_KEY);
      for (const c of a5.cases || []) {
        const ref = c.sourceReference || String(c.activity4HandoffId || '').replace('activity4:', '').replace(':activity5', '');
        const s = store[ref] || store[c.referenceNo];
        if (s) { ensureInquiry(s); if (c.report213?.startedAt) { s.inquiry.prelim.startedAt = c.report213.startedAt; s.inquiry.prelim.deadlineAt = c.report213.deadlineAt; } }
      }
      // หมายเหตุ: การแปลงเฟส activity5-dispatch (complete) -> a5-intake ไม่ทำที่นี่อีกต่อไป
      // (เดิมทำครั้งเดียวตาม MIGRATED_KEY ทำให้เคสที่มาถึงทีหลังค้างที่ debug fallback)
      // ย้ายไปที่ normalizeIncomingCase() ซึ่งทำงานทุกครั้งที่อ่านสำนวน (allA5Cases/getState)
      writeStore(store);
      localStorage.setItem(MIGRATED_KEY, '1');
    } catch (err) { console.error('A5 migration failed', err); }
  }

  function showView(which) {
    const a4 = document.getElementById('staffApp'), a5 = document.getElementById('a5App');
    if (!a4 || !a5) return;
    a4.classList.toggle('ws-hidden', which !== 'a4');
    a5.classList.toggle('ws-hidden', which !== 'a5');
    const url = new URL(location.href);
    if (which === 'a5') url.searchParams.set('view', 'a5'); else url.searchParams.delete('view');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    document.body.classList.remove('ecmis-sidebar-mobile-open');
  }
  function showA5(caseId) {
    showView('a5');
    const role = activeRole();
    if (caseId) renderA5Detail(caseId, role); else renderA5(role);
  }
  function showA4() { showView('a4'); }

  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  rootScope.EXMIS = rootScope.EXMIS || {};
  Object.assign(rootScope.EXMIS, {
    showA5, showA4, createInquiry: defaultInquiry,
    normalizeA5State: rootScope.ECMISActivity5Workflow?.normalizeA5State,
    getA5AvailableActions: rootScope.ECMISActivity5Workflow?.getA5AvailableActions,
    getA5AdminActions: rootScope.ECMISActivity5Workflow?.getA5AdminActions,
    getA5PrimaryAction: rootScope.ECMISActivity5Workflow?.getA5PrimaryAction,
    executeA5Action: rootScope.ECMISActivity5Workflow?.executeA5Action,
    buildA5ViewModel: rootScope.ECMISActivity5Workflow?.buildA5ViewModel,
    extensionRound, canApproveExtension, requestExtension, applyExtension, denyExtension, pendingExtension, deadlineTone, daysLeft, addDays,
    chainState, chainApprove, chainSkipGroup, caseAgeTone, parseThaiDate,
    journeyStages, phaseLabel, currentDeadline, ensureInquiry,
    paperForTab, docTabsA5, paperPlan, paperExt, paper213, paper644, paperMti, paperNoticeAccusation, paperRecordAccusation, paperProsecutorLetters, paperWarrants, paperSpecial58,
    extensionRepositoryA5, extensionFormPreviewA5, extensionDocumentPreviewA5, extensionAccessContextA5, validateExtensionPersistenceA5, openExtensionWorkspaceA5, wireExtensionWorkspaceA5, extensionReviewerWorkspaceA5, wireExtensionReviewWorkspaceA5,
    ensureExtensionDeadlineBasisA5, ensureExtensionAuthorityRegistryA5, currentA5ActorForAuthority,
    editorForA5, actionsForA5, caseDetailShellA5, workflowActorNameA5, currentA5Account, setCurrentA5MockAccount, mockAccountSelectorA5, workflowErrorPresentationA5, resolveA5CaseId, executeA5StoreAction, nextA5TabIndex, nextA5StagePresentation, clampA5FloatingPosition, extSectionHtml, progressSectionHtml, reportOf, reportTypeForStage,
    a5qFilter, A5_MENU, renderA5List, allA5Cases, fitA5Paper,
    MOCK_INVESTIGATOR_PROFILES,
    attachIntelligentSuggestion, wireA5Suggestions, correctThaiWriting, formalizeWriting, a5ContextualSuggestions, a5LearnContextSuggestion,
    fontSizeControlsA5, applyFontSizeA5, wireA5FontControls,
    migrateLegacy, STORAGE_KEY
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!document.getElementById('a5App')) return;
      migrateLegacy();
      const initial = new URLSearchParams(location.search).get('view') === 'a5';
      if (initial) showA5(new URLSearchParams(location.search).get('case') || null);
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = rootScope.EXMIS;
})();
