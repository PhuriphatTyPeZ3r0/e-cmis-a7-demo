# 📋 Task Plan: เพิ่ม Role กองบริหารคดี (case_admin) + หน้ารายการ & หน้า Detail

> **Plan ID:** `2026-09-04-case-admin-role`
> **Date:** 2026-09-04
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective

- **ปัญหา / ความต้องการ:** "กองบริหารคดี (กบค.)" เป็นกองที่ครอบกลุ่มงาน `board_sec` +
  `affairs` อยู่แล้ว (ทั้งคู่ `org:'กองบริหารคดี'`) และ ผอ.กบค. = `dir_case` เป็น workflow actor
  ที่ **ไม่มี login / inbox / nav** (`getRole('dir_case')` fallback ไป `affairs`). ต้องการให้
  **"กลุ่มงานบริหารคดีและบริหารทั่วไป"** มีตัวตนจริงเป็น role ใหม่อิสระ พร้อมหน้ารายการคดี (case-centric)
  ที่มองงานทั้งกอง และหน้า Detail ต่อ 1 สำนวน
- **บทบาทตาม NotebookLM (E-CMIS notebook, กิจกรรมที่ 7):** กบค. = "แม่บ้านใหญ่ฝ่ายคดี" ดูแลคดีตั้งแต่
  รับเรื่อง–ลงทะเบียนคุมคดี–สแกน/ถ่ายสำเนา–ส่งอนุกลั่นกรอง–เสนอบรรจุวาระ–จัดทำหนังสือเชิญประชุม–
  บันทึกมติ–จัดทำคำสั่ง/รายงานวินิจฉัยชี้มูล–แจ้งมติ–ติดตามผล จนปิดคดี. ผอ.กบค. (นางสาวณพัสตร์
  ศรีสมเกียรติ) ปฏิบัติหน้าที่เลขานุการคณะกรรมการ ป.ป.ท. โดยตำแหน่ง.
- **ข้อกฎหมาย** (`D:\Samart-W\กจ.7\PDF\law_pacc_68.pdf` — พ.ร.บ. มาตรการฝ่ายบริหารฯ แก้ไขถึงฉบับที่ ๔
  พ.ศ. ๒๕๖๘) — งาน กบค. อิงมาตรา:
  - **ม.๑๒/๑๓** องค์ประชุม (≥ กึ่งหนึ่ง) · นัดประชุมเป็นหนังสือล่วงหน้า ≥ ๓ วัน
  - **ม.๑๘/๑, ๑๘/๓** ส่งเรื่อง/สำนวนคืน ป.ป.ช. ภายใน ๑๕ วัน + คัดสำเนาเก็บเป็นหลักฐาน + เริ่มนับเวลาไต่สวน
  - **ม.๒๓** เริ่มไต่สวนภายใน ๖๐ วัน · เสร็จภายใน ๒ ปี (ขยาย ≤ ๓ ปี; ต่างประเทศ ≤ ๕ ปี)
  - **ม.๒๔ ว.๕** เสนอสำนวนต่อ คกก. ป.ป.ท. เพื่อเห็นชอบและวินิจฉัยชี้มูล · สั่งไต่สวนเพิ่มเติมได้
  - **ม.๒๗** สั่งยุติการไต่สวน (ม.๒๖(๓)(๔)) + เลขาธิการส่งเรื่องให้ผู้บังคับบัญชา
  - **ม.๒๘** เลขาธิการ pre-screen + รายงานบอร์ดทุก ๑๕ วัน
  - **ม.๓๑** อายุความ ๓ ปีนับแต่ผู้ถูกกล่าวหาพ้นตำแหน่ง · หลบหนีไม่นับเวลา
  - **ม.๓๒** มติไม่มีมูล → แจ้งผู้ถูกกล่าวหาภายใน ๑๕ วัน
  - **ม.๓๓/๓๔** แจ้งข้อกล่าวหาทางไปรษณีย์ลงทะเบียนตอบรับ · ให้สิทธิชี้แจง ≥ ๓๐ วัน
  - **ม.๓๘** มติชี้มูลวินัย → ประธานฯ แจ้งผู้บังคับบัญชา + ส่งรายงานการไต่สวน · ผู้บังคับบัญชาลงโทษภายใน ๖๐ วัน
  - **ม.๓๙** อนุญาตคัดสำเนาสำนวนเพื่ออุทธรณ์
  - **ม.๔๐** ผู้บังคับบัญชาขอทบทวนภายใน ๓๐ วัน · ส่งสำเนาคำสั่งลงโทษภายใน ๑๕ วัน
  - **ม.๔๑** ผู้บังคับบัญชาเพิกเฉย = ผิดวินัยร้ายแรง → เสนอบอร์ดส่ง ป.ป.ช. (ม.๑๕๗)
  - **ม.๔๓** ก.พ.ค. อุทธรณ์ฟังขึ้น → ส่งคืน คกก. ป.ป.ท. ทบทวน
  - **ม.๔๔** ส่งสำนวนให้พนักงานอัยการดำเนินคดีอาญา
  - **ม.๔๖** ชี้มูลแล้วเกิดความเสียหาย → แจ้งหน่วยงานหาตัวผู้รับผิดชดใช้
  - **ม.๕๙** สำนักงานจัดทำบัญชีเรื่อง (ฐานทะเบียนคดีกลาง)

---

## 📐 2. Design Decisions (จาก grilling session — 2026-09-04)

### 2.1 Role
- `id:'case_admin'` — **ใหม่อิสระ** ไม่แตะ `dir_case` / `board_sec` / `affairs` / STATUS owner เดิม
- object:
  ```js
  { id:'case_admin', login:'Napat.S', row:4,
    group:'กองบริหารคดี (กลุ่มงานบริหารคดีและบริหารทั่วไป)',
    title:'ผู้อำนวยการกองบริหารคดี ปฏิบัติหน้าที่เลขานุการคณะกรรมการ ป.ป.ท.',
    name:'นางสาวณพัสตร์ ศรีสมเกียรติ', org:'กองบริหารคดี',
    lane:'L7', flow:'S7 / S11', act:'7.1, 7.2, 7.3',
    perms:['view.all','download','create.agenda','create.invite','record.minutes',
           'doc.generate','dispatch.resolution','urgent.endorse'] }
  ```
- `homeHref('case_admin')` → `case-admin-inbox.html`
- **PAGE_PERMISSIONS** = ชุดเดียวกับ `board_sec` (ทุก key ที่มี `'board_sec'` ให้เพิ่ม `'case_admin'`)
  + 2 key ใหม่: `'case-admin-inbox.html'`, `'case-admin-detail.html'` → `['case_admin']`
- wiring touch-points: `ROLES`, `LOGIN_ALLOWED_ROLE_IDS`, `homeHref()`, `NAV` (+ label case),
  `ROLE_SWITCHER_GROUPS`, `login.html` quick-login, `CLAUDE.md §5`, `GEMINI.md`

### 2.2 `case-admin-inbox.html` (หน้ารายการ)
- 2 แท็บ: **`คิวงานของฉัน`** (default) + **`ทะเบียนคดีทั้งหมด`**
- KPI cards 6 เฟส (คลิก → set `phaseFilter`):

  | เฟส | STATUS |
  | :-- | :-- |
  | 1 รับรองใบด่วน | `PENDING_URGENT`, `PENDING_URGENT_72` |
  | 2 บรรจุวาระ | `AGENDA_SET`, `PENDING_INVITE_72`, `DEFERRED` |
  | 3 ประชุม-บันทึกมติ | `IN_MEETING`, `RESOLVED_PENDING`, `IN_MEETING_72`, `RESOLVED_PENDING_72` |
  | 4 จัดทำคำสั่ง-รายงาน | `RESOLVED`, `PENDING_SIGN_RULING_72`, `PENDING_SIGN_ORDER_CHAIRMAN`, `PENDING_SIGN_ORDER_SECGEN` |
  | 5 แจ้งมติ-ส่งดำเนินคดี | `DISPATCHING`, `PENDING_AREA_NOTICE_72`, `DISPATCHING_NACC_72`, `PENDING_DISPATCH_GUILTY_72` |
  | 6 เสร็จสิ้น | `CLOSED`, `CLOSED_72`, `UNDER_INVESTIGATION` |

  (สถานะที่ไม่อยู่ใน 6 เฟส = ยังไม่ถึงมือ กบค. → ไม่นับใน "คิวงานของฉัน" แต่โผล่ในแท็บ "ทะเบียนคดีทั้งหมด")
- **คิวงานของฉัน** = `ECMIS.CASES.filter(c => { const o = ECMIS.STATUS[c.status]?.owner; return o === 'dir_case' || o === 'board_sec' || o === 'affairs' || c.status === 'DEFERRED'; })`
- **ตาราง 6 คอลัมน์** (กฎเหล็ก #1 — col 2 = `<th>ประเภทเรื่อง</th>`):
  `เรื่องที่ | ประเภทเรื่อง | เรื่องกล่าวหา / ผู้รับผิดชอบ | เฟส/สถานะปัจจุบัน | กำหนดเวลา | ดำเนินการ`
  - แท็บ "ทะเบียนคดีทั้งหมด": ตารางเดียวกัน + คอลัมน์ `ค้างที่` (owner label) แทรกก่อน "กำหนดเวลา" ·
    ไม่ filter owner
- ฟิลเตอร์: `#searchInput`, `#typeFilter` (ALL/7.1/7.2/7.3), `#phaseFilter` (ALL + 6 เฟส), `#btnClearFilter`
- badge ประเภทเรื่อง: `ECMIS.typeBadge(c)` (ตรงกับ inbox.html)
- ปุ่มแถว: "ดูรายละเอียด" (`fa-eye`, btn-navy) → `case-admin-detail.html?case=<id>`
- data: `ECMIS.CASES` mock (ไม่แตะ Supabase)
- โครงหน้า clone จาก `subcommittee-inbox.html` (shell + kpiRow + filter card + table)

### 2.3 `case-admin-detail.html` (หน้า Detail — read-only draft)
- โครง clone จาก `agenda-detail.html` (page-head + not-found box + detail cards)
- Sections:
  1. **หัวคดี** — เลขคดี · `typeBadge` · ผู้ถูกกล่าวหา (จาก `kase.accused[]`) · หน่วยงาน/เจ้าของสำนวน
     (`kase.owner` / `kase.ownerOrg`) · วันที่รับเรื่อง (`kase.receivedDate`) · เลขรับ กบค.
     (`kase.docRef` ถ้ามี) · badge สถานะ + SLA · **ปุ่มเดียว "ดำเนินการต่อ"** →
     `ECMIS.pageForCaseByStatus(kase) + '?case=' + id`
  2. **ไทม์ไลน์สถานะ** — stepper 6 เฟส (ชี้เฟสปัจจุบันจาก mapping ใน 2.2) + list `kase.history[]` ถ้ามี
  3. **กำหนดเวลาตามกฎหมาย** — rows + `<span class="chip">ม.…</span>`; แสดงเฉพาะที่ตรงกับ `procType`:
     - ทุกประเภท: เริ่มไต่สวน ๖๐ วัน (ม.๒๓) · ไต่สวนเสร็จ ๒ ปี ขยาย ≤๓/๕ ปี (ม.๒๓) ·
       อายุความ ๓ ปีนับแต่พ้นตำแหน่ง (ม.๓๑) · องค์ประชุม / เชิญประชุม ≥๓ วัน (ม.๑๒/๑๓)
     - 7.2: แจ้งไม่มีมูล ๑๕ วัน (ม.๓๒) · แจ้งข้อกล่าวหา ≥๓๐ วัน (ม.๓๓/๓๔) · ผู้บังคับบัญชาลงโทษ ๖๐ วัน
       (ม.๓๘) · ส่งสำเนาคำสั่งลงโทษ ๑๕ วัน / ขอทบทวน ๓๐ วัน (ม.๔๐) · ส่งอัยการ (ม.๔๔)
     - 7.3: ก.พ.ค. อุทธรณ์ฟังขึ้น → ทบทวน (ม.๔๓)
     - แสดงค่าที่คำนวณจาก mock ที่มี (`receivedDate`, `deadline60`, `deadline2y`, `prescription`,
       `meetingNo`) — field ไหนไม่มีข้อมูลให้แสดง "—"
  4. **ฐานอำนาจ / กฎหมายที่เกี่ยวข้อง (law box)** — `alert alert-light border` list ม. + quote สั้น
     keyed by `procType`:
     - 7.1 → ม.๒๓, ม.๒๔ ว.๕, ม.๒๗, ม.๒๘
     - 7.2 → ม.๓๒, ม.๓๓, ม.๓๘, ม.๓๙, ม.๔๐, ม.๔๑, ม.๔๓, ม.๔๔, ม.๔๖
     - 7.3 → ม.๔๓, ม.๑๗
     - ทุกประเภท → ม.๑๒/๑๓, ม.๑๘/๑, ม.๑๘/๓, ม.๕๙
- **ไม่มีปุ่ม action ของ กบค. เอง** — read-only + "ดำเนินการต่อ" ลิงก์ออกเท่านั้น (draft แรก)
- helper: เพิ่ม `ECMIS.CASE_ADMIN_PHASES` (map STATUS→phase) + `ECMIS.caseAdminPhase(kase)` +
  `ECMIS.CASE_ADMIN_LAW` (map procType→[{maตรา, quote}]) ใน `ecmis-app.js`, export

---

## 📂 3. Affected Routes & Modules

- [x] `assets/ecmis-app.js` — `ROLES` (+case_admin), `LOGIN_ALLOWED_ROLE_IDS`, `PAGE_PERMISSIONS`
  (+case_admin ทุก key ของ board_sec + 2 key ใหม่), `homeHref()`, `NAV` + label case,
  `ROLE_SWITCHER_GROUPS`, helpers `CASE_ADMIN_PHASES` / `caseAdminPhase()` / `CASE_ADMIN_LAW` + exports
- [x] `case-admin-inbox.html` (ใหม่) + `res/case-admin-inbox.html` (sync)
- [x] `case-admin-detail.html` (ใหม่) + `res/case-admin-detail.html` (sync)
- [x] `login.html` — quick-login button + `res/login.html` (sync)
- [x] `CLAUDE.md §5` — role bullet (GEMINI.md ไม่มี role section เอง — defer ไป CLAUDE.md อยู่แล้ว จึงไม่ต้องแก้)

---

## 🛡️ 4. The 6 Golden Anti-Regression Pre-Check

- [x] 1. `case-admin-inbox.html` เป็นตารางคดี → 6 คอลัมน์ col 2 = `<th>ประเภทเรื่อง</th>` เสมอ ·
  ไม่แตะ `inbox.html` / `resolution-inbox.html`
- [x] 2. **ไม่เพิ่ม `case_admin` ใน `agenda-registry*.html` / `agenda-detail.html`** —
  แม้ board_sec มีสิทธิ์ แต่กฎข้อ 2 ห้ามเปิด agenda-registry ให้ chairman/affairs; ให้ case_admin
  เข้าได้เท่า board_sec ยกเว้น agenda-registry* (ปลอดภัยกว่า — case_admin มี home ของตัวเอง)
- [x] 3. ไม่เรียก Supabase โดยตรง — 2 หน้าใหม่ใช้ `ECMIS.CASES` mock อย่างเดียว
- [x] 4. `npm run sync` หลังเพิ่มไฟล์ Root (3 ไฟล์ใหม่/แก้)
- [x] 5. ไม่แตะ A4 geometry — 2 หน้าใหม่เป็น list/detail ไม่มี `.doc-paper`
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 5. Step-by-Step Implementation Tasks

- [x] **Task 1:** `ecmis-app.js` — เพิ่ม `case_admin` ใน `ROLES` + `LOGIN_ALLOWED_ROLE_IDS`
- [x] **Task 2:** `ecmis-app.js` — `homeHref()` เพิ่ม `if (r === 'case_admin') return resolvePage('case-admin-inbox.html');`
- [x] **Task 3:** `ecmis-app.js` — `PAGE_PERMISSIONS`: เพิ่ม `'case_admin'` ในทุก key ที่มี `'board_sec'`
  **ยกเว้น** `agenda-registry.html` / `agenda-registry-detail.html` / `agenda-detail.html` ·
  เพิ่ม 2 key ใหม่
- [x] **Task 4:** `ecmis-app.js` — `NAV` เพิ่ม section header "กองบริหารคดี" + item
  `{ href:'case-admin-inbox.html', icon:'fa-folder-tree', label:'รายการคดี (กองบริหารคดี)', visible: role => role?.id === 'case_admin' }` ·
  แก้ label function ของ home item ให้มี case `case_admin`
- [x] **Task 5:** `ecmis-app.js` — `ROLE_SWITCHER_GROUPS` เพิ่ม
  `{ group:'กองบริหารคดี', roles:['case_admin'] }`
- [x] **Task 6:** `ecmis-app.js` — helpers `CASE_ADMIN_PHASES`, `caseAdminPhase(kase)`,
  `CASE_ADMIN_LAW` + export ใน `window.ECMIS`
- [x] **Task 7:** สร้าง `case-admin-inbox.html` (clone subcommittee-inbox → 2 tabs, KPI 6 เฟส,
  ตาราง 6 col, phaseFilter, owner-filter สำหรับแท็บคิว)
- [x] **Task 8:** สร้าง `case-admin-detail.html` (clone agenda-detail → 4 sections)
- [x] **Task 9:** `login.html` — quick-login `<button onclick="quickLogin('case_admin')">กองบริหารคดี (Napat.S)</button>`
- [x] **Task 10:** `CLAUDE.md §5` — bullet `case_admin` (GEMINI.md defer ไป CLAUDE.md — ไม่แก้)
- [x] **Task 11:** `npm run sync` + `npm test` + `npm run test:integration`

---

## 🧪 6. Verification & Quality Gate Matrix

- [x] **Manual UI (Claude in Chrome):**
  - login `case_admin` (Napat.S) → landed `case-admin-inbox.html` · แท็บ "คิวงานของฉัน" default ·
    KPI 6 เฟสมีตัวเลข · คลิก KPI → กรองตาราง · แท็บ "ทะเบียนคดีทั้งหมด" → มีคอลัมน์ "ค้างที่" +
    เห็นคดีมากกว่าแท็บคิว
  - ตาราง 6 คอลัมน์ col 2 = ประเภทเรื่อง · badge = meet-type-* ตรงกับ inbox.html
  - กด "ดูรายละเอียด" → `case-admin-detail.html` · 4 sections ครบ · law box เปลี่ยนตาม 7.1/7.2 ·
    stepper ชี้เฟสถูก · ปุ่ม "ดำเนินการต่อ" นำไปหน้าที่ตรงกับ `pageForCaseByStatus`
  - login role อื่น (secgen/affairs) → ไม่เห็นเมนู "กองบริหารคดี" · เปิด `case-admin-inbox.html`
    ตรง ๆ → redirect (ไม่มีสิทธิ์)
  - regression: login `board_sec` → agenda-registry.html ยังเข้าได้ปกติ
- [x] **Dual-Route Sync:** `npm run sync` diff = 0
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100%
- [x] **Integration:** `npm run test:integration` ผ่าน

---

## 🏁 7. Completion & Sign-off

- **Completed Date:** 2026-09-04
- **Commit Reference:** _(commit ถัดไป)_
- **Notes / Retrospective:** npm test 5/5, integration 60/60. Browser walkthrough ผ่าน: inbox 2 แท็บ (คิว 53 / ทะเบียน 103 + คอลัมน์ "ค้างที่"), KPI 6 เฟส คลิกกรองได้, badge ประเภทเรื่องตรง inbox.html, detail 4 sections + law box แยกตาม procType + ปุ่ม "ดำเนินการต่อ" ผ่าน pageForCaseByStatus, RBAC: secgen เปิด case-admin-inbox → redirect /inbox.html, board_sec → agenda-registry.html ไม่ regression. ไม่แตะ dir_case / STATUS owner.

---

## 🔁 8. Amendment (2026-09-04, Phase 2) — ตัดขอบเขตให้เหลือแค่ "ด่านรับ"

> **User feedback:** "ปกติ กองบริหารคดี (กลุ่มงานบริหารคดีและบริหารทั่วไป) ทำหน้าที่แค่ส่งเรื่อง
> เข้าสู่คณะอนุกลั่นกรองฯ เพื่อพิจารณาเรื่องไต่สวนเบื้องต้น" → การออกแบบเดิม (แม่บ้านใหญ่ 6 เฟส
> ครอบทั้ง lifecycle) กว้างเกินจริง

### 8.1 สิ่งที่เปลี่ยน
- **บทบาทใหม่ = "ด่านรับ" (intake desk) เท่านั้น:** รับเรื่อง → ลงทะเบียนคุมคดี → สแกน/เตรียมสำนวน
  → กระจายสำนวนเข้าคณะอนุกลั่นกรองฯ (คณะที่ ๑–๘) สำหรับทั้ง 7.1 และ 7.2 · งานหลังจากนั้นเป็นของกลุ่มงานอื่น
- **`ecmis-app.js`** — ลบบล็อก 6 เฟส (`CASE_ADMIN_PHASES`, `caseAdminPhase`, `isCaseAdminQueue`
  แบบ owner-based, `CASE_ADMIN_LAW` แบบ object keyed by procType) แทนด้วย:
  - `CASE_ADMIN_INTAKE` — 4 ขั้น (RECEIVED / REGISTERED / PREPARED / ROUTED)
  - `CASE_ADMIN_SCREEN_STATUSES = ['IN_SCREENING','IN_SCREENING_72']`
  - `isCaseAdminQueue(kase)` = `status ∈ SCREEN_STATUSES && !kase.subCommittee` (คิวรอส่งเข้าคณะ)
  - `caseAdminRouted(kase)` = `status ∈ SCREEN_STATUSES && !!kase.subCommittee`
  - `caseAdminIntakeStep(kase)` → `'DONE' | 'ROUTED'`
  - `SUBCOMMITTEE_QUOTA` (used-counts เท่า screening.html) + `nextSubcommitteeTeam()` (least-loaded, `used < 40`)
  - `CASE_ADMIN_LAW` — array เดียว 6 มาตรา (ม.๑๘/๑, ๑๘/๓, ๒๓, ๒๔ ว.๑/๓, ๒๘, ๕๙) + `caseAdminLaw()`
- **routing = plain field write ไม่ใช่ workflow transition:** `case_admin` ไม่อยู่ใน TRANSITIONS ใด ๆ
  และ `subCommittee` ไม่ใช่ concept ของ workflow engine → "ส่งเข้าคณะ" = modal (`#swTeam` +
  `#swReason` บังคับเมื่อเลือกคณะ ≠ ที่ระบบเสนอ) → `pushCaseHistory({event:'ROUTE_TO_SUBCOMMITTEE',
  team, ...})` + `CaseStore.update(id, {subCommittee, routedByCaseAdminAt, history})` · handoff
  อัตโนมัติ (subcommittee-inbox filter `c.subCommittee === selectedTeam` อยู่แล้ว)
- **`case-admin-inbox.html`** — REWRITE: 2 แท็บ (QUEUE "คิวงานของฉัน" / ALL "ทะเบียนคุมคดีทั้งหมด"),
  KPI 4 การ์ดต่อแท็บ, ตาราง 7 คอลัมน์ (`เรื่องที่ | ประเภทเรื่อง | เรื่องกล่าวหา/ผู้รับผิดชอบ |
  คณะที่มอบหมาย | สถานะ | กำหนดเวลา | ดำเนินการ`), ปุ่มแถว "ส่งเข้าคณะ" (คิว) / "ดูรายละเอียด" (ส่งแล้ว)
- **`case-admin-detail.html`** — REWRITE: 4 การ์ด (หัวคดี + headActions / ขั้นตอนด่านรับ 4 steps +
  history / กำหนดเวลาตามกฎหมาย 4 แถว / law box 6 มาตรา) · headActions = "ส่งเข้าคณะอนุกลั่นกรองฯ"
  (คิว) หรือ "ดูความคืบหน้าที่คณะฯ" → subcommittee-screening.html (ส่งแล้ว)
- **mock data** — เพิ่ม 5 เคส `1450/2569`, `1452/2569`, `1455/2569` (7.1, IN_SCREENING),
  `1460/2566`, `1465/2566` (7.2, IN_SCREENING_72) ทั้งหมด `subCommittee:null` เพื่อให้มี backlog ในคิว ·
  `CASES_VERSION` → `'2026-09-04-case-admin-intake-v1'`
- **`CLAUDE.md §5`** — แทน bullet เดิมด้วยฉบับตัดขอบเขต

### 8.2 Verification (Phase 2)
- [x] `node -c` + headless smoke: INTAKE 4 steps, `nextSubcommitteeTeam` = คณะที่ 6, law 6 ข้อ,
  queue 5 เคส, routed 9, `CASE_ADMIN_PHASES` gone
- [x] `npm run sync` (2) + `npm test` 5/5 (37 routes, 260 links) + `npm run test:integration` 60/60
- [x] Browser: inbox คิวแสดง 5–6 เคส → กด "ส่งเข้าคณะ" → modal เสนอ คณะที่ 6 → ยืนยัน → toast +
  KPI 6→5 + แถวออกจากคิว · `getCase('1450/2569').subCommittee === 'คณะที่ 6'` (persist) ·
  history entry `team` = คณะที่เลือก (fix: ส่ง `team` เข้า pushCaseHistory ทั้ง inbox + detail)
- [x] detail: routed case → "ดูความคืบหน้าที่คณะฯ" + stepper 4/4 done · queue case → ปุ่มส่งเข้าคณะ +
  stepper step 4 = current · law + deadline การ์ดเรนเดอร์ครบ · console ไม่มี error ของหน้า
- [x] RBAC: secgen เปิด case-admin-inbox.html → redirect /inbox.html
