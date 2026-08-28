# 🧪 Test Design — E2E "เล่นหน้าจอ" Flow 7.1/7.2/7.3

## ขอบเขต

ครอบคลุมเฉพาะช่วงที่เพิ่งต่อ Supabase จริง session ก่อนหน้า — **บอร์ดลงมติ → ลงนามประธานฯ/เลขาฯ →
ออกคำสั่ง/รายงาน** — ไม่รวมขั้นต้นน้ำ (เลขาธิการฯ พิจารณา/กลั่นกรอง/บรรจุวาระ) ที่ยัง mock อยู่

ต่างจาก `docs/memory/standards/test-design-persistence-layer.md` (integration test ยิง Supabase REST
ตรง ไม่เปิด browser) — ชุดนี้ **"เล่นหน้าจอ" จริง** ด้วย Playwright (คลิกปุ่ม/กรอกฟอร์ม/รอ dialog/ตรวจ
DOM) แล้วยืนยันผลจาก Supabase คู่กัน — พิสูจน์ว่าปุ่มบนหน้าจอจริงพาไปถึงจุดที่ integration test ยืนยันไว้
ได้จริง ไม่ใช่แค่ว่า data-layer contract ถูกต้อง

**สคริปต์จริง:** `tests-e2e/*.spec.js` — รันด้วย `npm run test:e2e` (ต้องมี local static server รันอยู่ที่
`127.0.0.1:8080` ก่อนเสมอ — โปรเจกต์นี้ไม่มี dev-server script ในตัว)

## ข้อจำกัดสถาปัตยกรรมที่บังคับให้ต้อง "ยืมเคสจริง" แทนสร้างเคสใหม่

`ECMIS.requireCase()` (`assets/ecmis-app.js`) เช็ค mock array `CASES` **แบบ synchronous** ทันทีที่โหลด
หน้า ถ้าไม่พบจะ toast + redirect ออกทันที **ก่อน**ที่ background Supabase refresh จะมีโอกาสทำงานเลย —
เจอจริงตอนสร้าง test (ลอง seed เคสใหม่ `TEST-E2E-...` แล้ว test timeout เพราะหน้า redirect ไป inbox
ก่อนฟอร์มจะ render) ตรงกับ gap เดียวกันที่เจอด้วยมือ session ก่อนหน้ากับเคส `2018/2569` บน
`chairman.html`

**ผลกระทบ:** ทุก E2E spec ในชุดนี้ "ยืม" เคสจริงที่ลงทะเบียนใน mock array อยู่แล้ว แล้ว snapshot ค่า
`tbl_res_request` เดิมไว้ก่อน overwrite ชั่วคราวเพื่อทดสอบ แล้ว restore กลับเป๊ะๆ ทีหลัง (pattern เดียว
กับที่ทำด้วยมือผ่าน SQL ตลอด session ที่ต่อ Supabase) — ดู `seedExistingCase()`/`restoreExistingCase()`
ใน `scripts/lib/supabase-rest.js`

**ข้อจำกัดที่ยอมรับไม่ได้แก้:** audit event (`tbl_res_request_event`) ที่แอปจริงสร้างขึ้นระหว่างเล่นหน้าจอ
(เช่น `SIGNED`/`RESOLVED`/`RESOLVED_72`) จะติดอยู่กับ `trr_id` ของเคสจริงถาวร เพราะตารางนี้ไม่มี anon
UPDATE/DELETE policy เลย (เหมือนที่พบใน integration test เดิม) — ต้องใช้ service-role SQL ลบด้วยมือถ้า
ต้องการเคลียร์ audit trail ที่เกิดจากการทดสอบออกจากเคสจริง

## Flow 7.1 — `flow-71-order-signing.spec.js`

เคสที่ยืม: `1609/2568` (mock status ตรงกับ `IN_MEETING` พอดี ไม่ชนกับสถานะที่ seed)

Chain ต่อเนื่องเต็ม: `board-resolution.html` (ลงนามรับรองมติ+ล็อก) → `order.html` (ผู้ร่าง/affairs ส่งออก) →
`order.html` (ผู้ลงนามจริง เซ็น) — ยืนยันทุกจุด redirect + `trr_status` ที่ Supabase คู่กันตลอดสาย

**จุดที่พิสูจน์ได้จริงจากการเล่นหน้าจอ (ไม่ใช่แค่ทดสอบ data-layer):**
- การ์ด "การลงนามคำสั่ง" ถูกซ่อนจริงสำหรับผู้ร่าง (ยืนยัน fix จาก session ก่อนหน้ายังทำงานถูกที่ระดับ DOM)
- ช่อง "เลขที่คำสั่ง" (`#orderNo`) เป็น local form field ไม่ persist ที่ไหนเลย — ผู้ลงนามเปิดหน้าใหม่เจอ
  ช่องว่างจริง และระบบบล็อกไม่ให้เปิด dialog ลงนามจนกว่าจะกรอกซ้ำ (ยืนยันด้วยการเล่นจริง ไม่ใช่อ่านโค้ด
  เฉยๆ)
- **พบเพิ่มระหว่างสร้าง test:** ปุ่ม "ลงนามดิจิทัลคำสั่ง" (`act==='sign'`) ใน `order.html` เขียนแค่ local
  state (`signedAppoint`) ไม่เขียน Supabase เลย — `trr_status` ยังคงเป็นค่าที่ `send_order` ตั้งไว้ (018/019)
  ไม่เปลี่ยนตอนเซ็นจริง ทั้งขั้นตอนสุดท้าย `save_order` (ที่ตั้งสถานะ `UNDER_INVESTIGATION`) ก็ยังเป็น
  `ECMIS.Model.CaseStore.update()` (mock ล้วน) เหมือนกัน — เป็น gap เดียวกันชนิดกับ `ruling-report.html`
  ที่พบในสาย 7.2 (ดูด้านล่าง) แต่เกิดในสาย 7.1 — **ยังไม่เคยมีการบันทึกไว้ก่อนหน้านี้เลย จนกระทั่งสร้าง
  E2E test ชุดนี้**

## Flow 7.2 — `flow-72-ruling-report.spec.js` (แยก 3 segment)

- **Segment A** (เคสที่ยืม: `1402/2565`): `resolution-72.html` ลงมติ GUILTY_72 → ล็อก → assert redirect
  `ruling-report.html` + `trr_status='111'` — ผ่านจริง
- **Segment A2** (ต่อจาก A บนเคสเดียวกัน): กดปุ่ม "จัดทำรายงานวินิจฉัยชี้มูลเสร็จ" (`#btnDraftDone`) บน
  `ruling-report.html` แล้ว query DB ว่า `trr_status` เปลี่ยนไหม — **[ปิด gap แล้ว]** เดิม assertion ยืนยัน
  ว่า "ไม่เปลี่ยน" (ยืนยัน gap ที่รู้อยู่แล้วว่ามีจริง) ตอนนี้ `#btnDraftDone` เขียน Supabase จริงผ่าน
  `ECMIS.updateCaseStatus()` แล้ว — assertion กลับด้านเป็นยืนยันว่า `trr_status` เปลี่ยนเป็น `112`
  (`PENDING_SIGN_RULING_72`) จริง
- **Segment C** (ต่อจาก A2 บนเคสเดียวกัน, สลับ role เป็น `chairman`): กดปุ่ม "ลงนามรายงานวินิจฉัยชี้มูล"
  (`#btnSignRuling`) เอง — เส้นทางที่ Segment B ตั้งใจ "ข้าม" ไปก่อนหน้านี้เพราะยังไม่ persist — ตอนนี้
  ปิด gap แล้วเช่นกัน: assert redirect ไป `register.html` + `trr_status` เปลี่ยนเป็น `115`
  (`PENDING_DISPATCH_GUILTY_72`, ตาม resolution code `GUILTY_72` ที่ Segment A ล็อกไว้) + มี audit event
  `SIGNED` ที่ from/to status ถูกต้อง
- **Segment B** (เคสที่ยืม: `1855/2568`, seed ตรงที่ `112`=`PENDING_SIGN_RULING_72`): ทดสอบเส้นทางที่ 2
  (`chairman.html` ลงนามตรงๆ, สำหรับเคสที่คิวอยู่ที่ `PENDING_SIGN_RULING_72`) → assert redirect
  `agenda-registry.html` + `trr_status='109'` + audit event `SIGNED` — ผ่านจริง

**พบระหว่างสร้าง test เดิม (สถาปัตยกรรม ไม่ใช่แค่ data-layer) — ยังไม่ได้แก้ ตั้งใจปล่อยไว้:** แอปมี
**2 เส้นทาง "ลงนามรายงานวินิจฉัยชี้มูล" ที่ทำงานอิสระจากกันโดยสิ้นเชิง** และไม่รู้จักกันเลย —
1. `ruling-report.html` เอง (`btnSignRuling`) → redirect `register.html`
2. `chairman.html` (`save_status`, สำหรับเคสที่คิวอยู่ที่ `PENDING_SIGN_RULING_72`) → redirect
   `agenda-registry.html`

ทั้งสองปลายทาง redirect ต่างกัน — ตอนนี้**ทั้งสองเส้นทาง persist จริงแล้ว** (ปิด gap ตามขอบเขตที่เลือกไว้:
แก้ให้ persist ถูกต้อง ไม่ยุบรวมเป็นเส้นทางเดียว) — การรวมเป็นเส้นทางเดียวยังเป็นความซ้ำซ้อนทาง
สถาปัตยกรรมที่ควรพิจารณาแยกต่างหากในอนาคต

**บั๊กจริงที่พบระหว่างปิด gap นี้ (ไม่ใช่แค่ test timing) — แก้แล้วใน `ECMIS.supabaseRowToCase()`:**
`resolution-72.html`'s ปุ่มล็อกมติเขียน `patch` object (ซึ่งมีฟิลด์ `.status` ติดมาด้วย เช่น
`'RESOLVED_PENDING_72'`) ลง `trr_resolution_data` (jsonb) ตรงๆ ทั้งก้อน — แล้ว `supabaseRowToCase()`
เดิมทำ `Object.assign(kase, row.trr_resolution_data)` **หลัง**จากคำนวณ `kase.status` จาก `trr_status`
คอลัมน์แล้ว ทำให้ `.status` ที่ค้างอยู่ใน `trr_resolution_data` (แช่แข็งไว้ ณ ตอนล็อกมติ ไม่เคยอัปเดตอีก)
**เขียนทับ** สถานะจริงที่เพิ่งคำนวณจาก `trr_status` เสมอ — เจอได้เฉพาะตอนเล่นหน้าจอจริงข้ามหลาย reload
(integration test ไม่เจอเพราะไม่เคยเรียก `supabaseRowToCase()` กับข้อมูลที่มีทั้ง `trr_status` ใหม่กว่า
และ `trr_resolution_data` เก่ากว่าพร้อมกัน) ยืนยันด้วย network-level debug ว่า raw `trr_status` column
ถูกต้อง (`112`) แต่ `dbCase.status` ที่ประมวลผลแล้วผิด (`111`) — แก้โดยให้ `kase.status =
CODE_STATUS[row.trr_status]` เป็นค่าสุดท้ายเสมอ **หลัง**การ merge `trr_resolution_data` แล้ว (บังคับให้
`trr_status` เป็นแหล่งความจริงของสถานะเสมอ ไม่ว่า `trr_resolution_data` จะมีอะไรติดมาด้วย) — กระทบทุกหน้า
ที่เรียก `supabaseRowToCase()` ไม่ใช่แค่ `ruling-report.html`

## Flow 7.3 — `flow-73-general-legal.spec.js`

เคสที่ยืม: `กจ.103/2569` (general73)

**พบเพิ่มที่ใหญ่กว่าตัว flow เอง:** CHECK constraint จริงของ Supabase (`tbl_cmp_case_doc_type_check`/
`tbl_cmp_case_legal_base_check`) **ไม่อนุญาตค่าที่ `pickTemplate()` ใช้จำแนก 7.3 เลย** —
`tcc_doc_type` รับได้แค่ `'213'`/`'RULING'`/`'644'`, `tcc_legal_base` รับได้แค่ `'ม.18/4'`/`'ม.62'` — ไม่มี
`'GENERAL'`/`'ม.33'` เลยสักตัว ยืนยันตรงกับข้อมูลจริง: ทั้ง `กจ.102/2569` และ `กจ.103/2569` มี
`tcc_doc_type='213'` ใน Supabase จริง (ไม่ใช่ `'GENERAL'`) — การจำแนก 7.3 ทำงานได้เพราะ
`supabaseRowToCase()` เขียนทับ `docType`/`legalBase` ด้วยค่าจาก mock array เสมอ **ไม่มีทางแทนเคส
legal73/general73 ด้วยข้อมูล Supabase จริงล้วนๆ ได้เลยในสภาพ schema ปัจจุบัน**

**เหตุผลที่ใช้ `กจ.103/2569` (general73) แทน `กจ.102/2569` (legal73) ที่ตั้งใจไว้แต่แรก:** mock `status`
ของ `กจ.102/2569` เป็น `'RESOLVED'` — ทำให้ initial synchronous render (ก่อน background refresh) ของ
`board-resolution.html` ขึ้นมุมมอง "ล็อกแล้ว" อ่านอย่างเดียวเสมอ ไม่ว่าจะ seed `trr_status` ที่ Supabase
เป็นอะไรก็ตาม (เจอจริงจาก test timeout ตอนพยายามกรอกฟอร์ม) — `กจ.103/2569` มี mock `status` เป็น
`IN_MEETING` ตรงกับที่ seed พอดี จึงเลี่ยงปัญหานี้ได้

ผลที่ยืนยันได้: ล็อกมติ 7.3 แล้ว **ไม่** redirect ไป `order.html` (ต่างจาก 7.1/7.2 เพราะไม่มีคำสั่ง ม.24) —
ไปที่ `ECMIS.homeHref(role.id)` แทน ตรงตามที่โค้ดออกแบบไว้

## สรุปจุดที่ยังไม่สมบูรณ์ที่พบจากชุดนี้ (เรียงตามผลกระทบ)

1. **ใหญ่ที่สุด, ยังไม่แก้ (นอกขอบเขตที่เลือกไว้):** schema ของ Supabase ไม่รองรับการจำแนกเคส 7.3 เลย
   (CHECK constraint ปิดกั้นค่าที่ต้องใช้)
2. **[ปิดแล้ว]** 7.2 มี 2 เส้นทางลงนามซ้ำซ้อน ทำงานอิสระ ไม่รู้จักกัน — ตอนนี้ทั้งสองเส้นทาง persist ถูกต้อง
   แล้ว (`ruling-report.html`'s `btnDraftDone`/`btnSignRuling` เขียน Supabase จริงผ่าน
   `ECMIS.updateCaseStatus()`) — ความซ้ำซ้อนของ 2 เส้นทาง (redirect ปลายทางต่างกัน) ยังอยู่ ไม่ได้ยุบรวม
   ตามขอบเขตที่เลือกไว้
3. **[ปิดแล้ว]** 7.1 ก็มี gap แบบเดียวกัน ที่ปลายสาย — `order.html`'s `save_order` เขียน Supabase จริงแล้ว
   (เพิ่ม status `UNDER_INVESTIGATION`/`020` เข้า `ECMIS.STATUS_CODE` + migration SQL ให้ครบ)
4. ช่อง "เลขที่คำสั่ง" ไม่ persist ที่ไหน ทำให้ผู้ลงนามต้องกรอกซ้ำเอง ไม่มีการตรวจสอบว่าตรงกับที่ผู้ร่าง
   ตั้งไว้หรือไม่ (hardening opportunity, ยังไม่แก้)
5. **พบใหม่ตอนปิดข้อ 2/3:** `ECMIS.supabaseRowToCase()` ปล่อยให้ `.status` ที่ค้างอยู่ใน
   `trr_resolution_data` (jsonb) เขียนทับสถานะจริงจาก `trr_status` เสมอ — แก้แล้ว (ดูรายละเอียดใน Flow 7.2
   ด้านบน) กระทบทุกหน้าที่เรียกฟังก์ชันนี้ ไม่ใช่แค่ `ruling-report.html`
