# 📋 Task Plan: สถานะ & มติ (outcome) ของคณะอนุกรรมการกลั่นกรองฯ คณะที่ ๑–๘

> **Plan ID:** `2026-09-04-subcommittee-screening-status`
> **Date:** 2026-09-04
> **Author / Agent:** Claude Code
> **Status:** Draft
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective

- **ปัญหา / ความต้องการ:** หน้า `subcommittee-inbox.html` (role `subcommittee`, คณะอนุกลั่นกรองฯ ๑–๘)
  ปัจจุบัน**ไม่มีคอลัมน์/แท็บสถานะ** — ทุกสำนวนในคิวถือโดยปริยายว่า "อยู่ระหว่างกลั่นกรอง" มีเพียง badge
  ประเภท 7.1/7.2 กับ badge SLA เท่านั้น ทำให้:
  - แยกไม่ออกว่าสำนวนไหนยังรอ / รอเอกสารเพิ่ม / ส่งคืนเจ้าของสำนวน / กลั่นกรองเสร็จแล้ว
  - ไม่มีการบันทึก **มติ/ความเห็นของคณะอนุฯ (outcome)** เป็นค่าโครงสร้าง (structured) ที่ตรวจสอบย้อนหลังได้
  - ไม่มี audit trail ของการเปลี่ยนสถานะในระดับคณะอนุฯ
- **เป้าหมาย:** ออกแบบและติดตั้งชุด **workflow status (4 สถานะ)** + **outcome field (แยกชุด 7.1 / 7.2)**
  เฉพาะของคณะอนุฯ โดย map เข้ากับ lifecycle กลาง (`STATUS` / `TRANSITIONS` ใน `ecmis-app.js`) ให้ powered
  ทั้ง (ก) แท็บ/ฟิลเตอร์ + badge, (ข) การ gate ปุ่ม/สิทธิ์ (RBAC/state machine), (ค) audit trail
- **ข้อกฎหมาย / มติที่เกี่ยวข้อง** (อ้างอิง `memory/03-diagrams/Activity 7/law_pacc_68.pdf` — พ.ร.บ. มาตรการ
  ของฝ่ายบริหารในการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๕๑ แก้ไขเพิ่มเติมถึงฉบับที่ ๔ พ.ศ. ๒๕๖๘):
  - **ม.๒๔ วรรคห้า** — ผู้ไต่สวนเสนอสำนวนต่อ **คณะกรรมการ ป.ป.ท.** เพื่อพิจารณาให้ความเห็นชอบและวินิจฉัย
    ชี้มูล; คณะกรรมการ ป.ป.ท. อาจ **สั่งให้ไต่สวนเพิ่มเติม** หรือ **ไต่สวนเองใหม่ทั้งหมด/บางส่วน** (ต้องระบุ
    เหตุผล)
  - **ม.๒๗** — สั่ง **ยุติการดำเนินการไต่สวน** (เรื่องตาม ม.๒๖ (๓)/(๔))
  - **ม.๓๒** — มีมติว่า **ข้อกล่าวหาไม่มีมูล** → แจ้งผู้ถูกกล่าวหาภายใน ๑๕ วัน
  - **ม.๓๓ / ม.๓๘** — พยานหลักฐานเพียงพอ = **มีมูลความผิด** → แจ้งข้อกล่าวหา → มติ **วินิจฉัยชี้มูล**
    ทางวินัย → ประธานฯ แจ้งผู้บังคับบัญชา (พิจารณาโทษวินัยภายใน ๖๐ วัน)
  - **ม.๔๓** — ก.พ.ค. วินิจฉัยอุทธรณ์ฟังขึ้น → ส่งคืนคณะกรรมการ ป.ป.ท. (สาย 7.3 กกม. — **ไม่อยู่ในขอบเขต
    แผนนี้**)
  - **พ.ร.ป. ว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๖๑** (สาย 7.2 วินิจฉัยชี้มูล — template 3/4):
    **ม.๗๒** ชี้มูลความผิด, **ม.๗๑** ไม่มีมูล / ข้อกล่าวหาตกไป, **ม.๖๗** ไต่สวนเพิ่มเติม
  - **ข้อสังเกตเชิงกฎหมายที่กำหนดการออกแบบ:** "คณะอนุกรรมการกลั่นกรอง คณะที่ ๑–๘" **ไม่มีสถานะตามตัวบท**
    เป็นกลไกภายใน ดังนั้น outcome ของคณะอนุฯ มีสถานะเป็น **"ความเห็น / ข้อเสนอ" ต่อคณะกรรมการ ป.ป.ท.
    เท่านั้น ไม่ผูกพัน** — อำนาจวินิจฉัยชี้มูล / ไม่มีมูล / ยุติ / สั่งไต่สวนเพิ่มเติม เป็นของคณะกรรมการ ป.ป.ท.
    ในที่ประชุม `board-resolution.html` / `resolution-72.html` ต้องแสดง outcome เป็น *input* ไม่ใช่มติสุดท้าย

---

## 📐 2. Design Decisions (จาก grilling session กับผู้ใช้ — 2026-09-04)

### 2.1 หน่วยงาน & ขอบเขต
- เป้าหมายคือ role `subcommittee` เดิม (คณะอนุกลั่นกรองฯ ๑–๘) — **คนละหน่วย** กับ `support_sub`
  (คณะอนุสนับสนุนเลขาธิการฯ) หน้า `subcommittee-inbox.html` + `subcommittee-screening.html` มีอยู่แล้ว
- **8 คณะใช้ชุด status + outcome เดียวกันทั้งหมด** แยกด้วย team switcher เดิม (`ECMIS.currentSubTeam()` /
  `setSubTeam()`, sessionStorage key `ecmis_subcommittee_team`)
- **สาย 7.3 ไม่เกี่ยวข้อง** (กกม. / อุทธรณ์ฎีกา / ม.๔๓ / เรื่องทั่วไป ไม่ผ่านอนุกลั่นกรอง ตาม CLAUDE.md §4)
  — คงฟิลเตอร์ประเภทที่มีอยู่ (`ALL` / `7.1` / `7.2`) ไว้เท่าเดิม
- **Persistence: mock client-side เท่านั้น** (`ECMIS.CASES` + `sessionStorage`) — **ไม่แตะ schema Supabase**
  ไม่เพิ่ม column ใน `tbl_res_request` / `tbl_cmp_case`

### 2.2 Workflow status ของคณะอนุฯ (4 สถานะ — ลอก pattern จาก `support-subcommittee-inbox.html`)

| local status | label (badge) | map → `STATUS` กลาง | badge class (reuse) |
| :--- | :--- | :--- | :--- |
| `PENDING` | รอกลั่นกรอง | `IN_SCREENING` (7.1) / `IN_SCREENING_72` (7.2) — **เดิม** | `meet-badge meet-pending` |
| `MORE_INFO` | รอข้อมูลเพิ่มเติม | **ใหม่** `SCREENING_MORE_INFO` / `SCREENING_MORE_INFO_72` (owner `subcommittee`) | `meet-badge meet-scheduled` |
| `RETURNED` | ส่งคืนเจ้าของสำนวน | reuse `RETURNED` / `RETURNED_72` — **เดิม** | `meet-badge meet-returned` |
| `DONE` | กลั่นกรองแล้วเสร็จ | 7.1 → `AGENDA_SET` (event `SCREENING_RESOLVED`) · 7.2 → `PENDING_INVITE_72` (event `SCREEN_DONE_72`) — **เดิม** | `meet-badge meet-done` |

- **สิทธิ์เขียน:** เฉพาะ role `subcommittee` ของคณะนั้นเท่านั้น — role อื่น (`secgen`, `chairman`,
  `board_sec`, `board`) ที่มีสิทธิ์เปิดหน้านี้ = **view-only** (ปุ่มดำเนินการ / เลือก outcome disabled)
- **`MORE_INFO` / `RETURNED`** → ส่งเจ้าของสำนวน (กจ.X / พนักงานไต่สวน) → เมื่อได้ข้อมูล/แก้ไขกลับมา
  → กลับเข้า **คณะเดิม** ที่สถานะ `PENDING`
- **`RETURNED` เป็น pre-board loop** — คณะอนุฯ ส่งกลับเจ้าของสำนวนได้เองโดยไม่ต้องผ่านมติที่ประชุม
  (เป็นความเห็นเสนอ "ควรไต่สวนเพิ่มเติม" อ้าง ม.๒๔ ว.๕ / ม.๖๗)
- **แถว `DONE` / `RETURNED` ค้างอยู่ในคิว** ใต้แท็บของตัวเอง (ไม่หลุดออก) — เพื่อ audit trail
- **SLA:** ยังเป็น badge แยก (`.sla`) ตามเดิม — **หยุดนับ (pause)** ขณะสถานะ `MORE_INFO` / `RETURNED`,
  badge แสดง `รอข้อมูล (n วัน)`, เพิ่ม field `onHoldDays` (สะสมวันที่ pause) เพื่อคำนวณ SLA ที่ใช้จริง
  = `elapsedDays − onHoldDays`

### 2.3 Outcome field — **ความเห็น/ข้อเสนอต่อคณะกรรมการ ป.ป.ท. (ไม่ผูกพัน)**

Field ใหม่บน case object (mock): `subOutcome` (string enum), `subOutcomeLawRef` (string),
`subOutcomeNote` (free text), `subOutcomeAt`, `subOutcomeBy`, `subOutcomeTeam`

#### สาย 7.1 (template 2 "มติการประชุม ผ่านอนุกลั่นกรองคณะฯ")

| `subOutcome` | label | → local status | `subOutcomeLawRef` | → `STATUS` กลาง |
| :--- | :--- | :--- | :--- | :--- |
| `PROPOSE_AS_IS` | เห็นควรเสนอ กก.ป.ป.ท. พิจารณา (ตามสำนวน) | `DONE` | `ม.๓๘` | `AGENDA_SET` |
| `PROPOSE_WITH_NOTE` | เห็นควรเสนอ กก.ป.ป.ท. พิจารณา (มีข้อสังเกต / แก้ไข) | `DONE` | `ม.๓๘` | `AGENDA_SET` |
| `NEED_MORE_INQUIRY` | เห็นควรให้ไต่สวนเพิ่มเติม | `RETURNED` | `ม.๒๔ ว.๕` | `RETURNED` |
| `PROPOSE_DISMISS` | เห็นควรยุติเรื่อง | `DONE` | `ม.๒๗` | `AGENDA_SET` (ที่ประชุมสั่งยุติ) |

#### สาย 7.2 (template 3 / 4 "มติการประชุม ไต่สวน กรณีชี้มูล / ไม่ชี้มูล-ทำเพิ่ม" — อิง พ.ร.ป. ป.ป.ช. ๒๕๖๑)

| `subOutcome` | label | → local status | `subOutcomeLawRef` | → `STATUS` กลาง | DOCX (อัตโนมัติ) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `INDICT` | เห็นควรชี้มูลความผิด (ม.๗๒) | `DONE` | `ม.๗๒ พ.ร.ป. ป.ป.ช. ๒๕๖๑` | `PENDING_INVITE_72` | template 3 |
| `NO_INDICT` | เห็นควรไม่ชี้มูล | `DONE` | `ม.๗๑ พ.ร.ป. ป.ป.ช. ๒๕๖๑` | `PENDING_INVITE_72` | template 4 |
| `NEED_MORE` | เห็นควรทำ (ไต่สวน) เพิ่มเติม | `RETURNED` | `ม.๖๗ พ.ร.ป. ป.ป.ช. ๒๕๖๑` | `RETURNED_72` | template 4 |
| `CHARGE_DROPPED` | ข้อกล่าวหาตกไป | `DONE` | `ม.๗๑ พ.ร.ป. ป.ป.ช. ๒๕๖๑` | `PENDING_INVITE_72` | template 4 |

- **DOCX auto-select (7.2):** `INDICT` → template 3 ; อื่น ๆ → template 4 — set kase field ที่
  `resolution-72.html` ใช้เลือก template โดยอัตโนมัติ (ลด error ตอนออกคำสั่ง)
- **`board-resolution.html` / `resolution-72.html`** แสดง `subOutcome` + `subOutcomeNote` เป็นกล่อง "ความเห็น
  คณะอนุกลั่นกรองฯ (เสนอเพื่อโปรดพิจารณา)" — เป็น input ประกอบ ไม่ใช่มติสุดท้ายของที่ประชุม

### 2.4 Audit trail
- ทุก transition (status และ/หรือ outcome) push 1 entry เข้า `case.history[]`:
  `{ ts, actor, team, from, to, outcome, lawRef, note }`
- แสดงเป็น **timeline** ในหน้า `subcommittee-screening.html` (card ใหม่ "ประวัติการดำเนินการของคณะอนุฯ")

---

## 📂 3. Affected Routes & Modules

- [ ] Root HTML (แก้ไข): `subcommittee-inbox.html` — คอลัมน์ "สถานะกลั่นกรอง", KPI/ฟิลเตอร์ 5 กลุ่ม
  (`ALL` + `PENDING` / `MORE_INFO` / `RETURNED` / `DONE`), คง `typeFilter` 7.1/7.2, badge + SLA pause
- [ ] Root HTML (แก้ไข): `subcommittee-screening.html` **และ** `screening.html`
  (ไฟล์เนื้อหาเหมือนกันทุกตัวอักษร — ต้องแก้คู่กัน): dropdown เลือก `subOutcome` (ชุด 7.1 หรือ 7.2 ตาม
  ประเภทสำนวน), ปุ่ม submit → set local status `DONE`/`RETURNED` ตาม outcome, ปุ่ม "ขอข้อมูล/เอกสารเพิ่มเติม"
  → `MORE_INFO`, card timeline ประวัติ, gate ทุก control ให้ role `subcommittee` เท่านั้น (อื่น view-only)
- [ ] Root HTML (แก้ไข): `board-resolution.html`, `resolution-72.html` — กล่องแสดง `subOutcome` /
  `subOutcomeNote` เป็น input ประกอบ + 7.2 auto-select DOCX template จาก `subOutcome`
- [ ] Mirror HTML (ผ่าน `npm run sync`): `res/subcommittee-inbox.html`, `res/subcommittee-screening.html`,
  `res/screening.html`, `res/board-resolution.html`, `res/resolution-72.html`
- [ ] Assets JS: `assets/ecmis-app.js`
  - `STATUS` map: เพิ่ม `SCREENING_MORE_INFO`, `SCREENING_MORE_INFO_72` (label, cls `st-review`,
    owner `subcommittee`)
  - `STATUS_CODE` map: เพิ่มรหัสให้ 2 สถานะใหม่ (ตรวจเลขว่าง — เดิม `IN_SCREENING`=`010`,
    `IN_SCREENING_72`=`108`; เสนอ `SCREENING_MORE_INFO`=`012`, `SCREENING_MORE_INFO_72`=`110`
    → **ยืนยันเลขว่างตอน implement**)
  - `TRANSITIONS` array: เพิ่ม
    - `IN_SCREENING → SCREENING_MORE_INFO` (event `REQUEST_MORE_INFO`, actor `subcommittee`)
    - `SCREENING_MORE_INFO → IN_SCREENING` (event `MORE_INFO_SUPPLIED`, actor `subcommittee`)
    - `IN_SCREENING → RETURNED` (event `SCREENING_RETURN`, actor `subcommittee`)
    - `RETURNED → IN_SCREENING` (event `SCREENING_RESUBMIT`, actor `subcommittee`)
    - ชุด `_72` เทียบเท่า (`IN_SCREENING_72` ↔ `SCREENING_MORE_INFO_72`, `IN_SCREENING_72` ↔ `RETURNED_72`)
    - guard บน `SCREENING_RESOLVED` (→`AGENDA_SET`) และ `SCREEN_DONE_72` (→`PENDING_INVITE_72`):
      อนุญาตเฉพาะเมื่อ `subOutcome` เป็นค่ากลุ่ม `DONE` ของสายนั้น
  - helper: `subOutcomeOptions(caseType)` คืน enum ชุด 7.1 หรือ 7.2, `mapSubOutcome(subOutcome)` คืน
    `{ localStatus, lawRef, centralStatus, docxTemplate }`
  - helper: `pushCaseHistory(kase, entry)` (ถ้ายังไม่มี) + คำนวณ `onHoldDays` / SLA effective
- [ ] Assets CSS: `assets/ecmis-app.css` — ตรวจว่า `.meet-scheduled` / `.meet-returned` / `.meet-done` /
  `.st-review` มีสไตล์ครบ (มีอยู่แล้วจาก support-sub — คาดว่าไม่ต้องเพิ่ม)
- [ ] Mock data: `assets/agenda-registry-data.js` หรือที่ประกาศ `ECMIS.CASES` — เพิ่ม mock สำนวนตัวอย่าง
  ให้ครบทุกสถานะ/หลาย outcome อย่างน้อย 2 คณะ (bump `CASES_VERSION`)

---

## 🛡️ 4. The 6 Golden Anti-Regression Pre-Check

- [ ] 1. **ไม่กระทบคอลัมน์ "ประเภทเรื่อง"** — ไม่แตะ `inbox.html` / `res/inbox.html` /
  `resolution-inbox.html` (เพิ่มคอลัมน์เฉพาะใน `subcommittee-inbox.html` ซึ่งไม่อยู่ในกฎข้อ ๑)
- [ ] 2. **ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs** — ไม่แตะ `PAGE_PERMISSIONS`
  ของ `agenda-registry.html`
- [ ] 3. **เรียก Supabase ผ่าน `ECMIS.getSupabaseClient()` เท่านั้น** — แผนนี้ไม่แตะ Supabase เลย
  (mock client-side)
- [ ] 4. **วางแผนรัน `npm run sync`** หลังแก้ไขทุกไฟล์ Root (ระบุใน Task สุดท้าย)
- [ ] 5. **ควบคุมระยะขอบ A4 สารบรรณ `15mm 15mm 18mm 20mm`** — การแก้ `board-resolution.html` /
  `resolution-72.html` แตะเฉพาะ logic แสดง outcome + เลือก template ไม่แตะ geometry / secret footer
- [ ] 6. **ไม่ใช้ `--no-verify`** ในการ commit

---

## 📝 5. Step-by-Step Implementation Tasks

- [ ] **Task 1 — Central STATUS/TRANSITIONS (`assets/ecmis-app.js`):** เพิ่ม `SCREENING_MORE_INFO(_72)`
  ใน `STATUS` + `STATUS_CODE` (ยืนยันเลขว่าง), เพิ่ม 8 transitions (MORE_INFO ↔ PENDING, RETURNED ↔
  PENDING สำหรับ 7.1 และ 7.2), ใส่ guard `subOutcome ∈ DONE-group` บน `SCREENING_RESOLVED` /
  `SCREEN_DONE_72`
- [ ] **Task 2 — Helpers (`assets/ecmis-app.js`):** `subOutcomeOptions(caseType)`,
  `mapSubOutcome(subOutcome)` (คืน localStatus / lawRef / centralStatus / docxTemplate),
  `pushCaseHistory()`, ตัวคำนวณ `onHoldDays` + SLA effective
- [ ] **Task 3 — `subcommittee-inbox.html`:** เพิ่มคอลัมน์ "สถานะกลั่นกรอง" (ตาราง 5 → 6 คอลัมน์),
  KPI cards 5 กลุ่ม (`ALL` + 4), `statusFilter` select 5 ค่า, คง `typeFilter` 7.1/7.2 เดิม, render badge
  ตาม `mapSubOutcome`/สถานะปัจจุบัน, SLA badge pause เมื่อ `MORE_INFO`/`RETURNED` (`รอข้อมูล (n วัน)`),
  แถว `DONE`/`RETURNED` ยังแสดงใต้แท็บของตัวเอง
- [ ] **Task 4 — `subcommittee-screening.html` + `screening.html` (แก้คู่กัน):**
  - dropdown `subOutcome` — โหลดชุด 7.1 หรือ 7.2 ตามประเภทสำนวน
  - textarea `subOutcomeNote` (ความเห็น / ข้อสังเกต)
  - ปุ่ม "บันทึกมติคณะอนุฯ" → `mapSubOutcome` → set `subOutcome*`, local status (`DONE`/`RETURNED`),
    central `STATUS` transition, `pushCaseHistory`
  - ปุ่ม "ขอข้อมูล / เอกสารเพิ่มเติม" → `MORE_INFO` + history entry + (mock) แจ้งเจ้าของสำนวน
  - card ใหม่ "ประวัติการดำเนินการของคณะอนุฯ" = timeline จาก `case.history[]`
  - gate: ถ้า `ECMIS.currentRole() !== 'subcommittee'` → ทุก control `disabled` + ป้าย "อ่านอย่างเดียว"
- [ ] **Task 5 — `board-resolution.html` / `resolution-72.html`:** กล่องอ่านอย่างเดียว "ความเห็น
  คณะอนุกลั่นกรองฯ (เสนอเพื่อโปรดพิจารณา)" แสดง `subOutcome` label + `subOutcomeLawRef` +
  `subOutcomeNote` ; `resolution-72.html` auto-select DOCX template จาก `subOutcome`
  (`INDICT`→3, อื่น→4)
- [ ] **Task 6 — Mock data:** เพิ่มสำนวนตัวอย่างครอบทุกสถานะ/หลาย outcome ≥ 2 คณะ, bump `CASES_VERSION`
- [ ] **Task 7 — `npm run sync`** (Root → `/res/` ทั้ง 5 ไฟล์)
- [ ] **Task 8 — `npm test`** (+ `npm run test:integration` เพราะแตะ state/data model)

---

## 🧪 6. Verification & Quality Gate Matrix

- [ ] **Manual UI Walkthrough (Claude in Chrome):**
  - login `subcommittee` (Sumet.N) → `subcommittee-inbox.html` → เห็นคอลัมน์ "สถานะกลั่นกรอง" + KPI 5 กลุ่ม
  - กรอง `typeFilter` 7.1/7.2 ยังทำงานร่วมกับ `statusFilter` ได้
  - เปิดสำนวน 7.1 → เลือก outcome "เห็นควรให้ไต่สวนเพิ่มเติม" → สถานะเป็น `RETURNED`, history มี entry,
    lawRef = ม.๒๔ ว.๕, SLA หยุดนับ, แถวย้ายไปแท็บ `RETURNED`
  - เปิดสำนวน 7.1 อีกเรื่อง → "เห็นควรเสนอ กก. (ตามสำนวน)" → `DONE` → central `AGENDA_SET`
  - เปิดสำนวน 7.2 → "เห็นควรชี้มูล (ม.๗๒)" → `DONE` → central `PENDING_INVITE_72` →
    `resolution-72.html` เลือก template 3 อัตโนมัติ + แสดงกล่องความเห็นคณะอนุฯ
  - "ขอข้อมูลเพิ่มเติม" → `MORE_INFO` → badge "รอข้อมูล (n วัน)" → (mock) กลับมาเป็น `PENDING` คณะเดิม
  - login `board_sec` เปิดหน้าเดียวกัน → ทุก control disabled (view-only)
  - สลับ team switcher คณะที่ ๑ ↔ ๔ → คิว/สถานะแยกตามคณะถูกต้อง
- [ ] **Dual-Route Sync:** `npm run sync` ผ่าน, diff Root ↔ `/res/` = 0
- [ ] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100% (0 errors, 0 warnings)
- [ ] **Integration Test:** `npm run test:integration` ผ่าน (แตะ state/data model)

---

## 🏁 7. Completion & Sign-off

- **Completed Date:** _(รอดำเนินการ)_
- **Commit Reference:** _(รอดำเนินการ)_
- **Notes / Retrospective:**
  - **บั๊กแฝงที่พบระหว่างสำรวจ (นอกขอบเขตแผนนี้):** `board-resolution.html` / `resolution.html` เรียก
    `ECMIS.getRole('scr_sec')` / `getRole('scr_asst')` แต่ role id เหล่านี้ไม่ได้ประกาศใน `ROLES` array
    ปัจจุบัน (`getRole` fallback เป็น `ROLES[0]`) — ควรเปิด issue แยก
  - ต้องบันทึกงานลง External Shared History Log (`D:\Obsidain\Project\Activity 7\`) เมื่อเสร็จ ตาม
    `_HISTORY_PROTOCOL.md` โดยระบุ `ตัวแทน AI = Claude Code`
