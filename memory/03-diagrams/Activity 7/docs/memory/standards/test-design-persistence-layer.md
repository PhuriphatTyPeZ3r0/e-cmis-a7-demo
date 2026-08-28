# 🧪 Test Design — Supabase Persistence Layer (Chairman Signing + Board Resolution)

## ขอบเขต

เอกสารนี้ครอบคลุมเฉพาะฟีเจอร์ persistence ที่เชื่อมต่อ `chairman.html`/`chairman-agenda.html`,
`board-resolution.html`/`resolution.html`, `resolution-72.html` เข้ากับ Supabase จริง (แทนที่
`ECMIS.Model.CaseStore`/`SignatureStore` sessionStorage mock เดิม) — **ไม่ครอบคลุม** อีก 21 หน้าที่
เชื่อมต่อ Supabase อยู่ก่อนแล้ว (นอกขอบเขตที่ user เลือกไว้)

**System Under Test:** contract การเขียนจริงที่แต่ละหน้าทำ — `sb.from('tbl_res_request').update({...}).eq('trr_id', ...)`
บวก `ECMIS.logRequestEvent(...)` → `tbl_res_request_event` — สคริปต์ทดสอบยิง REST call ชุดเดียวกัน
ตรงๆ ที่ระดับ data-layer (ไม่ผ่าน browser, ไม่ใช้ Playwright) เพื่อให้รันซ้ำได้เร็วและไม่ต้องมี
dependency ใหม่ (`fetch()` มีในตัว Node แล้ว)

**สคริปต์จริง:** `scripts/test-persistence-integration.js` — รันด้วย `npm run test:integration`

---

## 1. State Transition Testing (เทคนิคหลัก)

ฟีเจอร์นี้คือ state machine ของ `trr_status` (`CHAR(3)`, mapping เต็มอยู่ที่ `ECMIS.STATUS_CODE`
ใน `assets/ecmis-app.js`) — ทุก transition ต้องยืนยัน 2 อย่างเสมอ: (a) `trr_status` เปลี่ยนจริงตอน
re-read และ (b) มี audit event แถวใหม่ที่ `trre_from_status`/`trre_to_status` ตรงกับ transition

| Case | From → To | Trigger | หน้า |
|---|---|---|---|
| TC-ST-01 | `009`(PENDING_CHAIRMAN) → `011`(AGENDA_SET) | chairman sign, สาย base | chairman.html |
| TC-ST-02 | `009` → `109`(PENDING_INVITE_72) | chairman sign, สาย 7.2 | chairman.html |
| TC-ST-03 | `012`(IN_MEETING) → `015`(RESOLVED) | board-resolution lock, ACCEPT_S24P1 | board-resolution.html |
| TC-ST-04 | `012` → `015` | board-resolution lock, ACCEPT_S24P3 (สาย sub) | board-resolution.html |
| TC-ST-05 | `110`(IN_MEETING_72) → `111`(RESOLVED_PENDING_72) | resolution-72 lock, GUILTY_72 | resolution-72.html |
| TC-ST-06 | `110` → `111` | resolution-72 lock, MORE_INVESTIGATE_72 | resolution-72.html |
| TC-ST-07 | `019`(PENDING_SIGN_ORDER_SECGEN) → `020`(UNDER_INVESTIGATION) | save_order (ออกคำสั่ง ม.24 เสร็จสมบูรณ์) | order.html |
| TC-ST-08 | `111`(RESOLVED_PENDING_72) → `112`(PENDING_SIGN_RULING_72) | btnDraftDone (จัดทำรายงานวินิจฉัยชี้มูลเสร็จ) | ruling-report.html |
| TC-ST-09 | `112` → `100`/`113`/`114`/`115` (แล้วแต่ resolution code) | btnSignRuling (ลงนามรายงานวินิจฉัยชี้มูล) | ruling-report.html |

**ข้อสังเกตที่ยืนยันได้จากการรันจริง:** chairman.html สร้าง audit event **2 แถว** ต่อ 1 transition
(แถวจาก `ECMIS.updateCaseStatus()` อัตโนมัติ + แถว `SIGNED` ที่ยิงเพิ่มเอง) ในขณะที่
board-resolution.html/resolution-72.html สร้างแค่ **1 แถว** (`RESOLVED`/`RESOLVED_72`) เพราะไม่ได้
ใช้ `ECMIS.updateCaseStatus()` — เป็นความแตกต่างโดยตั้งใจของโค้ดแต่ละหน้า ไม่ใช่ความไม่สอดคล้องกัน

## 2. Equivalence Partitioning (บนรหัสมติที่เลือก)

| Case | Partition | ยืนยันอะไร |
|---|---|---|
| TC-EP-01 | board-resolution class "order-routing" (ACCEPT_S24P1/S24P3) | `trr_resolution_data.code` ตรงกับที่เลือกจริง |
| TC-EP-02 | resolution-72 class "GUILTY_72" | payload มีฟิลด์ตระกูล guilty ครบ (`guiltyCriminal72`, `guiltyDiscipline72`, `criminalTrack72`, `disciplinaryTrack72`) — ครอบคลุมผ่าน TC-DT-01/02/03 ด้านล่างแล้ว |
| TC-EP-03 | resolution-72 class "ไม่ใช่ GUILTY_72" (MORE_INVESTIGATE_72) | ฟิลด์ตระกูล guilty ต้อง**ไม่ปรากฏ**ใน payload เลย (negative/absence check — กัน bug ฟิลด์เก่าค้างจากมติก่อนหน้า) |

## 3. Decision Table Testing (บน `crim × disc` — 2 เงื่อนไข boolean ของ GUILTY_72)

| # | crim | disc | criminalTrack72 | disciplinaryTrack72 | สถานะ |
|---|---|---|---|---|---|
| TC-DT-01 | T | F | `{status:'PENDING'}` | `null` | ทดสอบแล้ว ✅ |
| TC-DT-02 | F | T | `null` | `{status:'PENDING'}` | ทดสอบแล้ว ✅ |
| TC-DT-03 | T | T | `{status:'PENDING'}` | `{status:'PENDING'}` | ทดสอบแล้ว ✅ (รวมกับ TC-ST-05) |
| — | F | F | *(ไม่เกิดขึ้นจริงที่ data-layer)* | | บล็อกที่ชั้น UI validation (`resolution-72.html`: "ต้องเลือกอย่างน้อย 1 ประเภทความผิด") ก่อนเรียก lock ได้เลย — **ไม่ testable ที่ integration layer นี้ ไม่ใช่ gap ของ test suite** |

## 4. Boundary Value / Negative Testing

| Case | สิ่งที่ทดสอบ | ผล |
|---|---|---|
| TC-BV-01 | guard `if (sb && kase.trr_id)` มีอยู่จริงใน source ที่ deploy จริงของทั้ง 3 หน้า (static regex check, ไม่ใช่ live network call เพราะไม่มีอะไรให้ยิง) | ผ่าน — พบว่า `chairman.html` เขียนลำดับ `kase.trr_id && sb` (สลับกับอีก 2 ไฟล์) แต่เทียบเท่ากันทาง logic |
| TC-BV-02 | PATCH ไปยัง `trr_id` ที่ไม่มีอยู่จริง | ผ่าน — PostgREST คืน 200 + `data:[]` (ไม่ error) เมื่อขอ `Prefer: return=representation` — **หมายเหตุสำคัญ:** โค้ดจริงในหน้าเว็บทั้ง 3 **ไม่ได้ขอ** `return=representation` จึงไม่มีทางแยกแยะ "เขียนสำเร็จ 1 แถว" กับ "ไม่มีแถวไหนตรงเลย" ได้จาก `error` อย่างเดียว — บันทึกไว้เป็น **hardening opportunity** สำหรับอนาคต ไม่ใช่ regression ของงาน session นี้ |
| TC-BV-03 | เขียน `trr_resolution_data = {}` (payload ว่าง) | ผ่าน — คอลัมน์ jsonb ไม่มี schema บังคับภายใน เขียน/อ่านกลับได้ปกติ |

---

## Test Scenarios (ร้อยเรียงตาม user journey จริง)

- **Scenario A — "ประธานฯ ลงนามคำสั่ง"**: TC-ST-01 → TC-ST-02 → TC-ST-07
- **Scenario B — "บันทึกมติบอร์ด (7.1)"**: TC-ST-03 + TC-EP-01 → TC-ST-04 → TC-BV-01 → TC-BV-02 → TC-BV-03
- **Scenario C — "บันทึกมติวินิจฉัยชี้มูล (7.2)"**: TC-ST-05 + TC-DT-03 → TC-DT-01 → TC-DT-02 → TC-ST-06 + TC-EP-03 → TC-ST-08 → TC-ST-09 (equivalence partitioning ครบ 4 branch: MORE_INVESTIGATE_72/NO_MERIT_72/FORWARD_NACC/GUILTY_72)

รวม 16 test cases / 60 assertions — ผ่านทั้งหมด (เพิ่ม TC-ST-07/08/09 ระหว่างปิด gap persist ของ
`order.html`/`ruling-report.html` ที่พบจาก `test-design-e2e-flow-71-73.md`, 2026-08-26)

## Fixtures

`tcc_id`/`trr_id` เป็น auto-generated (`IDENTITY ALWAYS` / `nextval` sequence) — สคริปต์สร้างเคส
ทดสอบของตัวเองทุกครั้ง (`tcc_no = 'TEST-INTEGRATION-<timestamp>-<n>'`) ไม่แตะข้อมูลจริงเลย

**สำคัญ — RLS ไม่มี DELETE policy ให้ anon key เลยสักตาราง** (ยืนยันจาก `pg_policies`: มีแค่
`anon_insert`/`anon_select`/`anon_update` บน `tbl_cmp_case`/`tbl_res_request`, มีแค่ `anon_insert`/
`anon_select` บน `tbl_res_request_event`) — cleanup จึงใช้ **soft-delete ผ่าน `is_deleted`**
(ตาม convention เดียวกับที่ทุก read query ในแอปใช้อยู่แล้ว `.eq('is_deleted', false)`) แทนการ DELETE
จริง ส่วน audit event ปล่อยไว้ถาวรตามธรรมชาติของ audit trail (append-only โดยออกแบบ)

## Cara รัน

```bash
npm run test:integration
```

รันแล้ว fixture ที่สร้างจะถูก soft-delete (`is_deleted=true`) อัตโนมัติทุกครั้งไม่ว่า assertion จะ
ผ่านหรือพัง (`try/finally` ต่อ test case) — ถ้าต้องการเคลียร์แถวที่ soft-delete สะสมไว้จริงๆ (แถว
กายภาพยังอยู่ในตาราง แค่มองไม่เห็นจากแอป) ต้องใช้ service-role key ลบตรง เพราะ anon key ไม่มีสิทธิ์
