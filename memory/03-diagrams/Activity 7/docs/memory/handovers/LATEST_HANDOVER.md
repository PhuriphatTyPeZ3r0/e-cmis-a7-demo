# 🤝 Latest AI Session Handover & State Sync

> **ไฟล์ส่งต่องานล่าสุดระหว่าง Antigravity (Gemini) และ Claude Code**  
> ปรับปรุงล่าสุด: 2026-08-26 (Claude Code)

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ดึกที่สุด (3) — grill-me session #9, plan mode)
**ขอบเขตที่ user เลือก:** ปิดเฉพาะข้อ 1+2 จาก session #8 (persist การลงนามจริงให้ครบทั้ง 7.1+7.2) —
**ไม่แตะ** ข้อ 3 (schema 7.3) เพราะเป็นสถาปัตยกรรมใหญ่กว่าที่ต้องตัดสินใจเพิ่ม และไม่ยุบเส้นทางลงนามซ้ำซ้อน
ของ 7.2 เป็นเส้นทางเดียว — แค่ทำให้ทั้งสองเส้นทางที่มีอยู่แล้ว persist ถูกต้องเหมือนกัน

1. **สาย 7.1 — ปิดแล้ว:** `assets/ecmis-app.js` เพิ่ม status `UNDER_INVESTIGATION`/`020` เข้า
   `STATUS`/`STATUS_CODE`/`STATUS_STEP` ให้ครบ (เดิมไม่เคย formalize เข้าระบบเลย) + migration
   `sql/add_under_investigation_status.sql` (apply แล้วผ่าน `mcp__supabase__execute_sql`) — `order.html`/
   `order-m24.html`'s `act==='save_order'` เขียน Supabase จริงผ่าน `ECMIS.updateCaseStatus()` แล้ว
2. **สาย 7.2 — ปิดแล้ว:** `ruling-report.html`'s `btnDraftDone`/`btnSignRuling` เขียน Supabase จริงผ่าน
   `ECMIS.updateCaseStatus()` + `ECMIS.logRequestEvent()` แล้ว (ทั้งสองเส้นทางลงนามซ้ำซ้อนที่พบใน
   session #8 — `ruling-report.html` เองกับ `chairman.html`'s `save_status` — persist ถูกต้องเท่ากันแล้ว
   ทั้งคู่ แต่ยังไม่ได้ยุบรวม ตามขอบเขตที่เลือกไว้)
3. **บั๊กจริงที่พบระหว่างปิด gap นี้ (ไม่ใช่ test timing) — สำคัญที่สุดของ session นี้:**
   `ECMIS.supabaseRowToCase()` ปล่อยให้ `.status` ที่ค้างอยู่ใน `trr_resolution_data` (jsonb, เขียนโดย
   `resolution-72.html`/`board-resolution.html`'s ปุ่มล็อกมติ ซึ่งเขียน `patch` object ทั้งก้อนที่มีฟิลด์
   `.status` ติดมาด้วย แช่แข็งไว้ ณ ตอนล็อก ไม่เคยอัปเดตอีก) **เขียนทับ**สถานะจริงที่คำนวณจาก `trr_status`
   คอลัมน์เสมอ — เจอเฉพาะตอนเล่นหน้าจอจริงข้ามหลาย reload เท่านั้น (integration test ระดับ data-layer ไม่
   เจอเพราะไม่เคยเรียก `supabaseRowToCase()` กับข้อมูลที่มีทั้ง `trr_status` ใหม่กว่าและ
   `trr_resolution_data` เก่ากว่าพร้อมกัน) — ยืนยัน root cause ด้วย network-level debug logging ใน
   Playwright (raw `trr_status` column ถูกต้องเสมอ แต่ `dbCase.status` ที่ประมวลผลแล้วผิด) — แก้โดยให้
   `kase.status = CODE_STATUS[row.trr_status]` เป็นค่าสุดท้ายเสมอ **หลัง**การ merge
   `trr_resolution_data` แล้ว (บังคับให้ `trr_status` เป็นแหล่งความจริงของสถานะเสมอ) — **กระทบทุกหน้าที่
   เรียก `supabaseRowToCase()` ไม่ใช่แค่ `ruling-report.html`**
4. **บั๊กรองที่พบและแก้ระหว่างทาง:** `ECMIS.updateCaseStatus()` เดิมไม่ await การเขียน audit event ของ
   ตัวเอง (`if (!error) logRequestEvent(...)` ไม่มี `await`) — ถ้า caller redirect/reload ทันทีหลัง
   `updateCaseStatus()` คืนค่า (pattern race condition เดียวกับที่แก้ไปแล้วหลายจุดใน session ก่อนๆ)
   audit event เสี่ยงหายเงียบๆ — แก้ให้ `await logRequestEvent(...)` ภายในฟังก์ชันเอง (กระทบทุก caller
   ทั้งหมด เป็นการแก้ที่จุดเดียวจบ) + await การเรียก `logRequestEvent()` เสริมที่ `order.html`/
   `ruling-report.html` เรียกต่อเองด้วย
5. **Test suite อัปเดตครบ:** `scripts/test-persistence-integration.js` เพิ่ม TC-ST-07/08/09 (รวมเป็น
   16 test case / 60 assertion ผ่านหมด) — `tests-e2e/flow-71-order-signing.spec.js` ต่อขั้นตอน
   `save_order` จริง — `tests-e2e/flow-72-ruling-report.spec.js` กลับ assertion ของ Segment A2 (จาก
   "ยืนยัน gap" เป็น "ยืนยันปิด gap แล้ว") + เพิ่ม Segment C (`btnSignRuling` จริง) — `npm run test:e2e`
   ผ่านครบ 4/4 ซ้ำ 3 รอบติดต่อกัน (ไม่ flaky), `npm run check` ผ่านครบ 5/5, ตรวจ Supabase แล้วไม่มี
   fixture/audit event ค้างบนเคสจริงที่ยืมมา
6. **บทเรียนเรื่อง test timing (ไม่ใช่บั๊ก แต่ทำให้หลงทางนาน):** `page.waitForLoadState('load')` /
   `page.waitForLoadState('networkidle')` เรียกทันทีหลัง `.click()` **ไม่รับประกันว่าจะรอ navigation ใหม่
   จริง** ถ้า state ปัจจุบันตรงเงื่อนไขอยู่แล้ว (resolve ทันทีแบบ false-positive) — ต้อง
   `page.waitForResponse(...)` รอ response ที่แท้จริง หรือ `Promise.all([page.waitForEvent('load'), click()])`
   แทน — จุดที่ทำให้หลงทางนานที่สุดคือ debug ผิดทาง (คิดว่าเป็น race condition ของ reload หลายรอบ) ก่อนจะ
   เจอว่าจริงๆ เป็นบั๊ก production code (`supabaseRowToCase()`) — วิธีที่ debug สำเร็จ: log
   `location.href`/สถานะ ณ จุดต่างๆ พร้อม random nav-id เพื่อพิสูจน์ว่า "reload" ที่คิดว่าเกิดขึ้นจริงๆ
   ไม่ได้เกิด (นำไปสู่การเจอว่า trr_resolution_data.status คือตัวการ ไม่ใช่ race)
7. **ยังไม่ commit** — รอ user สั่ง

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ดึกที่สุด (2) — grill-me session #8, plan mode)
1. **เพิ่ม Playwright E2E "เล่นหน้าจอ" suite จริง สำหรับ flow 7.1/7.2/7.3 (ขอบเขต: บอร์ดลงมติ → ลงนาม
   ประธานฯ/เลขาฯ → ออกคำสั่ง/รายงาน) — ติดตั้ง `@playwright/test` เป็น devDependency ตัวแรกของโปรเจกต์
   (ยืนยันกับ user แล้วว่าจำเป็น เพราะ integration test เดิมยิง REST ตรง ไม่เปิด browser พิสูจน์ UI จริง
   ไม่ได้) — รันจริงผ่านครบ 4/4 test (`npm run test:e2e`):**
   - ไฟล์ใหม่ `docs/memory/standards/test-design-e2e-flow-71-73.md`, `playwright.config.js`,
     `scripts/lib/supabase-rest.js` (แยก logic ที่ใช้ร่วมกันออกจาก `scripts/test-persistence-
     integration.js` เดิม — refactor แล้วรัน integration test ซ้ำยืนยันยังผ่าน 43/43), `tests-e2e/`
     (fixtures.js + 3 spec ไฟล์: flow-71/flow-72/flow-73)
   - **ข้อจำกัดสถาปัตยกรรมสำคัญที่พบระหว่างสร้าง (กระทบทุก E2E test ในอนาคตของโปรเจกต์นี้):**
     `ECMIS.requireCase()` เช็ค mock array `CASES` แบบ synchronous แล้ว redirect ออกทันทีถ้าไม่พบ **ก่อน**
     background Supabase refresh จะทำงาน — ทำให้ seed เคสทดสอบใหม่ (เหมือนที่ integration test เดิมทำ)
     ใช้กับ browser E2E ไม่ได้เลย ต้อง **"ยืม" เคสจริงที่ลงทะเบียนใน mock array อยู่แล้ว** (`1609/2568`,
     `1402/2565`, `1855/2568`, `กจ.103/2569`) แล้ว snapshot ค่า `tbl_res_request` เดิมไว้ก่อน overwrite
     ชั่วคราว restore กลับเป๊ะๆ ทีหลัง (`seedExistingCase()`/`restoreExistingCase()` ใน
     `scripts/lib/supabase-rest.js`) — audit event ที่เกิดจากการทดสอบติดอยู่กับเคสจริงถาวร (ไม่มี anon
     DELETE/UPDATE policy บน `tbl_res_request_event`) ลบออกด้วย service-role SQL หลังทดสอบเสร็จทุกครั้ง
   - **จุดที่ยังไม่สมบูรณ์ที่พบใหม่จากการเล่นหน้าจอจริง (ไม่เคยรู้มาก่อน แม้แต่ในรายงาน session #6/#7):**
     1. **7.1 มี gap ปลายสายเดียวกันกับที่รู้อยู่แล้วในสาย 7.2:** `order.html`'s `act==='sign'` (ลงนาม
        คำสั่งจริง) และ `act==='save_order'` (ขั้นตอนสุดท้ายออกคำสั่ง) ทั้งคู่เขียนแค่ local state/
        `ECMIS.Model.CaseStore` — ไม่แตะ Supabase เลย แม้ `send_order` (ที่ session #6 ต่อไว้) จะทำงานถูก
     2. **7.2 มี 2 เส้นทาง "ลงนามรายงานวินิจฉัยชี้มูล" ที่ทำงานอิสระกันโดยสิ้นเชิง ไม่รู้จักกันเลย:**
        `ruling-report.html`'s `btnSignRuling` เอง (เขียน mock, redirect `register.html`) กับ
        `chairman.html`'s `save_status` (เขียน Supabase จริง, redirect `agenda-registry.html`) — มีแค่
        เส้นทางหลัง persist จริง เป็นความซ้ำซ้อนทางสถาปัตยกรรมที่ควรรวมเป็นเส้นทางเดียวในอนาคต
     3. **7.3 ใหญ่ที่สุด:** CHECK constraint จริงของ Supabase (`tbl_cmp_case_doc_type_check`/
        `..._legal_base_check`) **ไม่อนุญาตค่าที่ใช้จำแนก 7.3 เลย** (`tcc_doc_type` รับได้แค่
        `213`/`RULING`/`644`, `tcc_legal_base` รับได้แค่ `ม.18/4`/`ม.62` — ไม่มี `GENERAL`/`ม.33`) —
        ยืนยันตรงจากข้อมูลจริงว่า `กจ.102/2569`/`กจ.103/2569` มี `tcc_doc_type='213'` ใน Supabase จริง
        การจำแนก 7.3 ทำงานได้เพราะ `supabaseRowToCase()` เขียนทับด้วยค่าจาก mock array เสมอเท่านั้น —
        **ไม่มีทางแทนเคส legal73/general73 ด้วยข้อมูล Supabase จริงล้วนๆ ได้เลยในสภาพ schema ปัจจุบัน**
     4. ช่อง "เลขที่คำสั่ง" (`#orderNo` ใน order.html) ไม่ persist ที่ไหนเลย ผู้ลงนามต้องกรอกซ้ำเองทุกครั้ง
        ไม่มีการตรวจสอบว่าตรงกับที่ผู้ร่างตั้งไว้หรือไม่ — hardening opportunity ไม่ใช่บั๊ก blocking
   - **บทเรียนรอง:** `กจ.102/2569` (mock `status:'RESOLVED'`) ใช้เป็น fixture ไม่ได้เลยไม่ว่าจะ seed
     Supabase เป็นอะไรก็ตาม เพราะ `board-resolution.html` เรนเดอร์แบบ synchronous จาก mock status ก่อน
     Supabase refresh มาถึง (ล็อกอ่านอย่างเดียวทันที) — สลับไปใช้ `กจ.103/2569` (mock `status:'IN_MEETING'`
     ตรงกับที่ seed) แทน ต้องเช็ค mock `status` ให้ตรงกับ seed status เสมอเมื่อยืมเคสสำหรับ E2E ในอนาคต
   - `npm run check` ผ่านครบ 5/5, เพิ่ม `node_modules/`/`test-results/`/`playwright-report/` เข้า
     `.gitignore` (เดิมไม่มี `node_modules/` เลยเพราะไม่เคยมี devDependency ในโปรเจกต์นี้มาก่อน)
2. **ยังไม่ commit** — งานชุดนี้ยังไม่ได้จัดลำดับ commit split รอ user สั่ง

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ดึกที่สุด — grill-me session #7, plan mode)
1. **เพิ่ม automated integration test suite สำหรับ Supabase persistence layer ที่เพิ่งต่อ session #6 (chairman signing + board resolution + resolution-72) — รันจริงผ่านครบ 43/43 assertions:**
   - ไฟล์ใหม่ `docs/memory/standards/test-design-persistence-layer.md`: เอกสาร test design ฉบับเต็ม ใช้ 4 เทคนิคทางการ — **State Transition Testing** (หลัก, ตาม `trr_status` state machine 6 transition), **Equivalence Partitioning** (บนรหัสมติที่เลือก), **Decision Table Testing** (บน `crim × disc` 2 เงื่อนไข boolean ของ GUILTY_72 — 3/4 กฎ testable ที่ data-layer, กฎที่ 4 (F,F) บล็อกที่ UI validation ไปแล้วบันทึกไว้ชัดว่าไม่ใช่ gap), **Boundary/Negative Testing** (guard `trr_id`, update เข้า id ที่ไม่มีจริง, payload ว่าง) — รวม 13 test case ร้อยเรียงเป็น 3 scenario ตาม user journey จริง (ประธานฯ ลงนาม / บันทึกมติบอร์ด 7.1 / บันทึกมติวินิจฉัยชี้มูล 7.2)
   - ไฟล์ใหม่ `scripts/test-persistence-integration.js`: Node script เดี่ยว **ไม่เพิ่ม npm dependency ใหม่เลย** (ใช้ native `fetch()` ของ Node ยิง Supabase REST API ตรงๆ ด้วย anon key เดิมที่ hardcode อยู่ในหน้าเว็บอยู่แล้ว ไม่ใช่ secret ใหม่) — ทดสอบที่ data-layer โดยตรง (ไม่ผ่าน browser/Playwright) จำลอง REST call แบบเดียวกับที่แต่ละหน้าเว็บยิงจริง
   - เพิ่ม `package.json` script ใหม่ `test:integration` **แยกจาก** `test`/`check` เดิม — ตั้งใจไม่ผูกกับ pre-commit hook เพราะต้องใช้ network + ใช้เวลาหลักวินาที ต่างจาก `ci-check.js` ที่เป็น static check เร็วมาก — รันเองก่อน push
   - **สคริปต์รอบแรกมี 4 assertion fail จริง แต่ทุกอันเป็นบั๊กใน test script เอง ไม่ใช่บั๊ก production code:** (1) regex เช็ค guard `if (sb && kase.trr_id)` ไม่ครอบ `chairman.html` ที่เขียนสลับลำดับเป็น `if (kase.trr_id && sb)` — แก้ regex ให้รับทั้ง 2 ลำดับ (เทียบเท่ากันทาง logic) (2) เขียน `trr_status: patch.status` ตรงๆ (ใช้ key name เต็มอย่าง `'RESOLVED_PENDING_72'`) แทนที่จะ map ผ่าน `STATUS_CODE` เป็นรหัส 3 ตัวอักษร (`'111'`) เหมือนโค้ดจริงทำ — ทำให้ Postgres โยน `22001 value too long for type character(3)` แก้โดยเพิ่ม mapping table ในสคริปต์เอง
   - **พบจริงระหว่างทาง: RLS ของโปรเจกต์ไม่มี DELETE policy ให้ anon/publishable key เลยสักตาราง** (`tbl_cmp_case`/`tbl_res_request`/`tbl_res_request_event` — เช็คจาก `pg_policies` ตรงๆ มีแค่ insert/select/update) — cleanup ของ test fixture ที่เขียนเป็น hard-DELETE ตอนแรกจึง**ดูเหมือนสำเร็จแต่ไม่ได้ลบจริง** (PostgREST คืน 200 เงียบๆ แม้ 0 แถวถูกลบ) ทำให้มี fixture ค้าง 6 แถวหลังรันรอบแรก (เคลียร์ด้วย service-role SQL ตรงแล้ว) — แก้ script ให้ cleanup ด้วย **soft-delete ผ่าน `is_deleted`** แทน (convention เดียวกับที่ทุก read query ในแอปใช้อยู่แล้ว) ซึ่งได้รับอนุญาตจาก RLS จริง — **บทเรียนสำหรับ script/migration ในอนาคตที่ต้อง DELETE จริง: ต้องเช็ค `pg_policies` ก่อนเสมอ ห้ามสมมติว่า anon key มีสิทธิ์ DELETE เพราะ INSERT/UPDATE ใช้ได้**
   - พบเพิ่มเติมแบบไม่ใช่บั๊ก แต่เป็นข้อสังเกตที่บันทึกไว้ (TC-BV-02): โค้ดจริงในทั้ง 3 หน้าเช็คแค่ `error` จาก Supabase client เท่านั้น ไม่ได้ขอ `Prefer: return=representation` ตอน update — หมายความว่าถ้า `trr_id` ที่ส่งไปไม่ตรงกับแถวไหนเลยจริงๆ (bug อื่นที่ทำให้ id หลุด) โค้ดปัจจุบันจะคิดว่าบันทึกสำเร็จเงียบๆ แยกไม่ออกจาก "เขียนสำเร็จจริง" — บันทึกไว้เป็น **hardening opportunity สำหรับอนาคต** ใน test design doc ไม่ใช่ regression ของ session ก่อนหน้า
   - `npm run check` (5-layer CI เดิม) ผ่านครบ 5/5 หลังเพิ่มไฟล์ใหม่
2. **ยังไม่ commit** — วางแผน commit split ไว้แล้วตาม Conventional Commits (`docs/memory/standards/git-and-workflow.md`): (1) `docs(test): add test design...` เฉพาะเอกสาร (2) `test(integration): add automated integration test suite...` สคริปต์ + package.json คู่กัน (3) `docs(memory): update LATEST_HANDOVER.md...` ปิดท้าย — ไม่มี commit `fix()` แยกเพราะไม่พบบั๊ก production จริงจากการรัน รอ user สั่ง commit จริง

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ดึกมาก — grill-me session #6, plan mode)
1. **Supabase audit ทั้ง 32 หน้า → พบ 2 จุดเสี่ยงสูงสุด (chairman signing + board resolution) ยังเป็น mock-only ล้วน → แก้แล้วครบ ทดสอบ end-to-end จริงผ่านทั้ง 3 flow:**
   - `chairman.html`/`chairman-agenda.html` (ไฟล์เหมือนกัน 100%): เดิม `save_status` เขียนแค่ `kase.status` + `ECMIS.saveCases()` (sessionStorage mock) — เพิ่ม Supabase client init + `loadCaseFromSupabase()`/`refreshFromSupabase()` (pattern เดียวกับ order.html) และเปลี่ยนให้เขียน `trr_status` จริงผ่าน `ECMIS.updateCaseStatus()` (helper ใหม่ที่ย้ายเข้า `assets/ecmis-app.js` แล้ว, เดิม logic ซ้ำอยู่ใน `resolution-inbox.html` เท่านั้น) พร้อม log audit event แยก `type:'SIGNED'` เก็บชื่อผู้ลงนาม/วิธีลงนามใน `tbl_res_request_event.trre_data`
   - `board-resolution.html`/`resolution.html` (ไฟล์เหมือนกัน 100%) + `resolution-72.html`: เดิม action "lock" (บันทึกมติและล็อก PDF) เขียนแค่ `ECMIS.Model.CaseStore.update()` (mock) — เพิ่มการเขียนจริงลง `tbl_res_request` (`trr_status`, `trr_resolution_stage`, `trr_recorded_doc_html` — ทั้ง 3 คอลัมน์นี้มีอยู่แล้วใน schema แต่ไม่เคยมีหน้าไหนเขียนเข้าเลยมาก่อน) และคอลัมน์ใหม่ `trr_resolution_data jsonb` (migration `sql/add_resolution_data_column.sql` applied แล้ว) เก็บรหัสมติที่เลือก + ฟิลด์ความเห็น/ข้อหาเต็มรูปแบบของสาย 7.2 (~10 ฟิลด์ เช่น `boardOpinion72`, `guiltyCriminal72`, `guiltyDiscipline72` — reuse `patch` object เดิมในโค้ดตรงๆ เป็น JSON payload เดียว ไม่ต้องสร้างคอลัมน์ typed แยก)
   - `assets/ecmis-app.js`: `supabaseRowToCase()` เพิ่ม `Object.assign(kase, row.trr_resolution_data)` ให้ `kase.resolution`/ฟิลด์ 7.2 ทั้งหมดมาจาก DB จริงเมื่อมีข้อมูลแล้ว (mock array ยังเป็น fallback สำหรับเคสเก่า)
   - **แก้ race condition จริงระหว่างทาง:** เดิมโค้ดต้นแบบ (chairman.html) จะ redirect ทันทีที่ Swal.fire ผู้ใช้กด "ตกลง" โดยไม่รอ async Supabase write ให้เสร็จก่อน — ถ้า network ช้ากว่า human reaction time, request ที่ยังค้างอยู่จะถูกเบราว์เซอร์ตัดทิ้งกลางทางตอน `location.href` เปลี่ยนหน้า ทำให้ user เห็น "บันทึกสำเร็จ" แต่จริงๆ ไม่ persist — restructure ให้ทุก redirect (chairman/board-resolution/resolution-72) เกิดขึ้น**หลัง** `await sb.from(...).update(...)` เสร็จเท่านั้น
   - **ทดสอบจริงครบ 3 flow ด้วย real `trr_id`** (ยืนยัน SQL query โดยตรงหลังทำแต่ละ flow, ไม่ใช่แค่ดู toast): (1) chairman sign เคส `1277/2569` (trr_id=55) → `trr_status` 009→011 จริง + audit event 2 แถว (`ORDER_AGENDA_URGENT`+`SIGNED`) (2) board-resolution lock เคส `1609/2568` (trr_id=30) → `trr_status`→015, `trr_resolution_data`, `trr_recorded_doc_html` (9368 ตัวอักษร) เขียนจริง, เปิด `order.html` ต่อยืนยัน `kase.resolution` อ่านจาก DB จริงแล้ว (ไม่ใช่ mock) ยังเลือก signer/isSub ถูกต้อง (3) resolution-72 lock เคส GUILTY_72 `1402/2565` (trr_id=31) → `trr_status`→111, `trr_resolution_data` มีครบทั้ง 10 ฟิลด์ round-trip ถูกต้อง — **revert ค่าทดสอบทั้ง 3 เคสกลับสถานะเดิมใน Supabase แล้วหลังทดสอบเสร็จ (ทั้ง `tbl_res_request` และลบ audit event แถวที่สร้างจากการทดสอบออก) ไม่เหลือ test data ค้าง**
   - **บทเรียนสำหรับ session ถัดไป:** เคส Supabase-only ที่ไม่มี entry ใน mock `CASES` array (เช่น `2018/2569`) จะโดน `ECMIS.requireCase()` redirect ออกทันทีตั้งแต่ synchronous ต้นหน้า ก่อนที่ `refreshFromSupabase()` แบบ background จะมีโอกาสทำงานเลย — ต้องเลือกเคสทดสอบที่มี entry ใน mock array ด้วยเสมอ (เช็คด้วย `grep "id:'<case-id>'" assets/ecmis-app.js` ก่อนเริ่มทดสอบ)
   - `npm run check` ผ่านครบ 5/5 หลังแก้ทุกไฟล์, sync `chairman-agenda.html`/`resolution.html` (duplicate files) ครบด้วย `cp`+`npm run sync`
2. **ยังไม่ commit งานทั้งหมดของ session นี้ (#5+#6) เข้า git** — รอ user สั่ง commit ตาม Git Workflow
3. **ยังไม่ได้แตะ (นอก scope ที่ user เลือกไว้):** อีก 9 หน้าที่เหลือใน checklist "ยังไม่ต่อ DB เลย" (`login.html`, `board-inbox.html`, `support-subcommittee-inbox.html`, `screening.html`, `subcommittee-screening.html`, `meeting-report.html`) และตำแหน่ง badge `<span class="st st-urgent ms-1">ด่วน</span>` จาก session #4

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ดึก — grill-me session #5)
1. **`order.html`: ฟีเจอร์ใหม่ "ส่งออกเพื่อลงนาม" (สถานะจริง + เข้าคิวจริง) ตามที่ user เลือก "เพิ่ม status ใหม่ + เข้าคิวจริง (แนะนำ)" — ทดสอบเบราว์เซอร์จริงครบทั้ง 2 เส้นทาง (secgen/chairman) แล้ว:**
   - เพิ่มสถานะใหม่ `PENDING_SIGN_ORDER_CHAIRMAN` (`018`)/`PENDING_SIGN_ORDER_SECGEN` (`019`) ใน `assets/ecmis-app.js` (STATUS/STATUS_CODE/STATUS_STEP/`pageForCaseByStatus()`) + migration `sql/add_order_signing_statuses.sql` (applied แล้ว, เพิ่ม `018`/`019` เข้า CHECK constraint ของ `tbl_res_request.trr_status`)
   - `order.html`/`order-m24.html` (root+res): เอา `#compRules` (checklist องค์ประกอบ ม.24) กับกล่อง "การลงนามคำสั่ง" แบบเดิมออกจากมุมมอง**ผู้ร่าง** (affairs) — ผู้ร่างเห็นแค่สรุปสถานะส่งออก + ปุ่ม "ส่งออกเพื่อลงนาม" เท่านั้น ผู้ลงนามตัวจริง (secgen/chairman) เปิดหน้าเดียวกันแล้วเห็น compRules+สถานะลงนามเต็มรูปแบบเหมือนเดิมทุกอย่าง
   - `inbox.html`: เพิ่ม routing/badge/KPI/filter ให้ทั้ง secgen (`getSecgenActionBadge`, page routing) และ chairman (`chairTarget`, KPI card "รอลงนามคำสั่ง ม.24", filter dropdown) เห็นเคสที่ถูกส่งมาในคิวของตัวเองจริง พร้อมคลิกเข้า `order.html` แล้วเห็น UI ผู้ลงนามเต็มรูปแบบทันที
   - **บั๊กจริงที่พบจากการทดสอบเบราว์เซอร์จริง (ไม่ใช่แค่ `node --check`) — แก้แล้วทั้งคู่:**
     1. **Malformed HTML comment กิน DOM ทั้งก้อนเงียบๆ:** โค้ดที่เพิ่มไว้ (จากเซสชันก่อน compact) เปิดคอมเมนต์ HTML ด้วย `<!--` แต่ปิดด้วย `*/` (สไตล์ JS comment ผิดที่) แทน `-->` — browser parser เลยกิน markup ทั้งหมดตั้งแต่ตรงนั้นไปจนถึง `-->` จริงอันถัดไปเป็นคอมเมนต์ (สูญ `sendOrderBox`/`sigSection`/`sigBox`/`</div>` ปิด panel หลายชั้น) ทำให้ `document.getElementById('sigSection')` เป็น `null` แล้ว throw `TypeError` กลาง `refreshSigner()` ทันทีที่โหลดหน้า — ยืนยันด้วยการ fetch HTML ดิบเทียบกับ live DOM จริง (`fetch('/order.html')` เจอ tag แต่ DOM ไม่มี) ไม่ใช่แค่เดา แก้โดยปิดคอมเมนต์ด้วย `-->` ให้ถูกต้อง **บทเรียน:** `node --check` เช็คได้แค่ syntax ของ JS ใน `<script>` เท่านั้น ตรวจ HTML comment ผิดรูปแบบไม่ได้เลย ต้องเปิดเบราว์เซอร์จริงแล้วเช็ค DOM ด้วย `document.getElementById()` เทียบกับ source เสมอ
     2. **`isSub` (ตัวตัดสินว่าใครเซ็น: ประธานฯ vs เลขาธิการฯ) อ่านจาก URL param `?res=` เท่านั้น แต่ไม่มีลิงก์จริงในระบบส่ง param นี้เลยสักที่:** ทำให้ทุกเส้นทางจริง (คลิกจาก `inbox.html`) default เป็น `ACCEPT_S24P1`/เลขาธิการฯ เสมอ แม้เคสนั้นจะผ่านอนุกลั่นกรอง (`kase.subCommittee` ไม่ใช่ null) ซึ่งควรให้ประธานฯ เซ็น — กดทดสอบจริงกับเคส `0807/2568` (subCommittee='คณะที่ 6') ผ่าน chairman inbox link ตรงๆ แล้วเจอว่า signer กลายเป็นเลขาธิการฯ ผิดคน แก้โดยเปลี่ยนให้ `isSub = !!kase.subCommittee || resCode === 'ACCEPT_S24P3'` (ให้ข้อมูลเคสจริงเป็นหลัก, URL param เป็นแค่ fallback ทดสอบมือ) — ทดสอบซ้ำผ่านแล้ว: `0807/2568` จาก chairman inbox ตรงๆ (ไม่มี `?res=`) ได้ signer ถูกเป็นประธานฯ ทันที
   - **ทดสอบจริงครบ end-to-end ทั้ง 2 สาย:** (a) สาย base — affairs กรอกเลขคำสั่งแล้วกด "ส่งออกเพื่อลงนาม" บนเคส `1547/2568` → Supabase `trr_status` เปลี่ยนเป็น `019` จริง → เคสหายจากคิว affairs → เข้าคิว secgen พร้อม badge "รอลงนามคำสั่ง ม.24" → คลิกเข้าไปเห็น compRules (เขียวผ่านหมด) + กล่องลงนามเต็ม + กดปุ่มลงนามเปิด 2-Step Digital Signature dialog ระบุชื่อเลขาธิการฯ ถูกต้อง (b) สาย sub — เคสจริงที่มี `subCommittee` (`0807/2568`) ผ่าน chairman inbox ตรงๆ ไม่ใช้ `?res=` เลย ได้ signer/routing ถูกเป็นประธานฯ ทั้งหมด — **หลังทดสอบ revert ค่า `trr_status` ทั้ง 2 เคสกลับเป็น `012` (IN_MEETING เดิม) ใน Supabase เรียบร้อยแล้ว ไม่เหลือ test data ค้าง**
   - `npm run check` ผ่านครบ 5/5 หลังแก้ทุกจุด, sync `order.html`↔`order-m24.html`↔`res/*` ครบด้วย `cp`+`npm run sync`
2. **ยังไม่ commit งานชุดนี้เข้า git** (order.html feature + toolbar fix จาก session #4 + stepper/inbox fix จาก session #3) — รอ user สั่ง commit ตาม Git Workflow
3. **ค้างจาก session #4 (ยังไม่ได้แตะต่อ):** ตำแหน่ง badge `<span class="st st-urgent ms-1">ด่วน</span>` ในตาราง — ยังไม่ได้วิเคราะห์/แก้

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ค่ำ — grill-me session #4)
1. **⚠️ พบ+แก้บั๊กจริงจาก user ทดสอบเอง: ปุ่ม "ดำเนินการ" ของ `1119/2565` ใน `inbox.html` (affairs) พาไปหน้าผิด (`case-register.html` แทน `ruling-report.html`):**
   - Root cause: สำนวนสาย 7.2 (procType 7.2/docType RULING) 2 เคส (`1119/2565`, `1396/2564`) มี `trr_status` เป็นรหัสสายหลัก 7.1 แทนที่จะเป็นรหัสสาย _72 — `1119/2565` เป็น `015` (RESOLVED) ควรเป็น `111` (RESOLVED_PENDING_72), `1396/2564` เป็น `011` (AGENDA_SET) ควรเป็น `109` (PENDING_INVITE_72) — ทำให้ `ECMIS.pageForCase72()`/`PAGE_FOR_72` หาคีย์ไม่เจอ แล้ว fallback ไป `case-register.html`
   - **บั๊กนี้อยู่ทั้งใน mock data (`assets/ecmis-app.js`) และใน Supabase จริง (`tbl_res_request.trr_status`) แยกกัน 2 ที่ — แก้ทั้งคู่แล้ว** (`sql/fix_72_track_status_mismatch.sql` applied แล้ว) **บทเรียนสำคัญ:** แก้ mock array อย่างเดียวไม่พอสำหรับเคสที่มี Supabase row จริงอยู่แล้ว เพราะ `supabaseRowToCase()` merge เอาแค่ field ที่ Supabase ไม่มี (procType/docType/resolution72 ฯลฯ) ทับ Supabase row เท่านั้น ไม่เคย override `status` — ต้องเช็คทั้ง 2 แหล่งเสมอเวลาแก้ status mismatch แบบนี้
   - เพิ่ม defensive guard ใน `inbox.html`'s `isAffairsQueueCase()` กันเคส 7.2 ที่ดันมี status='RESOLVED' (ของสายหลัก) ไม่ให้หลุดเข้าคิว "รอจัดทำคำสั่ง" ผิดสายอีกในอนาคตถ้าเกิด data bug แบบเดียวกันซ้ำ
   - ทดสอบจริงครบ: `1119/2565` ย้ายจาก "รอจัดทำคำสั่ง" (ผิด) ไป "รอจัดทำรายงานชี้มูล/หนังสือลงโทษทางวินัย" (ถูก) และกด "ดำเนินการ" แล้วไปถึง `ruling-report.html?case=1119/2565` พร้อมข้อมูลเต็มจริง
2. **แก้ปัญหาแถบเครื่องมือเอกสาร (`ws-doc-toolbar`) ชื่อเอกสารยาวแล้วดันปุ่มหลุดขอบจอ — เป็นบั๊กใน shared CSS ไม่ใช่แค่ order.html:**
   - `.ws-doc-toolbar .name` (ใช้ร่วมกัน 12 หน้า root: `board-resolution.html`, `resolution.html`, `resolution-72.html`, `order.html`, `order-m24.html`, `approval-review.html`, `review.html`, `meeting-report.html`, `screening.html`, `subcommittee-screening.html`, `support-subcommittee.html`, `urgent-agenda.html` — มาจาก toolbar redesign "SLEEP S" ที่ merge เข้ามาก่อนหน้านี้) ไม่เคยมี CSS จำกัดความกว้าง/ตัดคำเลย — ชื่อเอกสารยาว (ทดสอบจริงด้วยชื่อ "แก้ไขคำสั่งแต่งตั้งคณะพนักงานไต่สวน กรณีเพิ่มผู้ถูกกล่าวหา (ปปท. 5-03)" ใน `order.html`) จึงพันบรรทัดและดันปุ่ม แก้ไขเอกสาร/ส่งออก DOCX/พิมพ์/ย่อแผง **หลุดออกนอกขอบจอทั้งแถวเลย** (ยืนยันด้วยสายตาจริงก่อนแก้)
   - แก้ที่ `assets/a4-ecmis-workspace.css` (shared, ไม่ต้อง sync res/ เพราะเป็นไฟล์ asset ใช้ร่วม) เพิ่ม `min-width:0; flex:1 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap` ให้ `.name` และ `flex:0 0 auto` ให้กลุ่มปุ่ม — ทดสอบจริงแล้วทั้งเคสชื่อยาว (ตัดคำ ellipsis, ปุ่มขึ้นครบ) และเคสชื่อสั้นเดิม (`board-resolution.html`) ไม่ regression
3. **🚧 ค้างกลางคัน (ยังไม่ตอบ):** user ถามให้วิเคราะห์ตำแหน่งการวาง badge `<span class="st st-urgent ms-1">ด่วน</span>` ในตาราง (ปัจจุบันวางไว้ inline ต่อท้ายเลขสำนวนในคอลัมน์ "เรื่องที่" ที่กว้างแค่ ~130px ใน `inbox.html`/`resolution-inbox.html`/`case-register.html`/`register.html` — เป็น convention เดียวกันทั้งระบบ) — ยังไม่ได้ตรวจสอบผลจริงในเบราว์เซอร์ว่า badge ล้น/ตัดบรรทัดหรือไม่ ต้องทำต่อ session หน้า

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 เย็น — grill-me session #3)
1. **`board-resolution.html` stepper ผิด kind — แก้แล้ว ทดสอบเบราว์เซอร์จริงผ่าน:** เดิม `ECMIS.stepperHtml(kase.status)` ใช้ `FLOW_STEPS` เดิม (7 สเต็ปสายไต่สวน: เลขาธิการฯ→ใบด่วน→ประธานฯ→อนุกลั่นกรองฯ→บรรจุวาระ→บอร์ดลงมติ→ออกคำสั่ง ม.24) กับทุก kind เหมือนกันหมด แม้แต่ legal73/general73 ("เรื่องของ กกม."/"เรื่องทั่วไป") ที่ไม่เคยผ่านใบด่วน/อนุกลั่นกรองฯ และไม่จบที่คำสั่ง ม.24 จริง — เพิ่ม `ECMIS.FLOW_STEPS_73`/`STATUS_STEP_73` (5 สเต็ป จบที่ "แจ้งมติ/ปิดเรื่อง") ตามรูปแบบเดียวกับ `FLOW_STEPS_72` ที่มีอยู่แล้ว, board-resolution.html เช็ค `pickTemplate().kind` แล้วเลือกชุด step ให้ตรง — ทดสอบจริง: `กจ.101/2569` (general73) โชว์ 5 สเต็ปถูกต้อง, `1547/2568` (default 7.1) ยังโชว์ 7 สเต็ปเดิมไม่มี regression
2. **`inbox.html` affairs status/routing ผิดหลายจุด — แก้แล้ว ทดสอบเบราว์เซอร์จริงผ่าน:**
   - `AFFAIRS_STATUSES` เดิมไม่มี `'RESOLVED'` เลย ทั้งที่ comment ข้างๆ (`mine` ด้านล่าง) บอกว่า affairs ต้องเห็นเพื่อจัดทำคำสั่ง ม.24 ต่อ — เป็น dead code มาตลอด ไม่มีสำนวนไหนขึ้นคิว "รอจัดทำคำสั่ง" เลยจริงๆ เพิ่มกลับเข้ามาแล้ว (กัน 7.3/GENERAL docType ออกด้วย `isAffairsQueueCase()` เพราะ 7.3 ไม่มีคำสั่ง ม.24 ให้ทำ)
   - `'DEFERRED'` (เลื่อน/ถอนวาระ) ถูกตัดออกจากคิว affairs ตามที่ user สั่ง ("จัดวาระเป็นของกลุ่มมติ") — เดิมซ้ำซ้อนกับ `agenda-registry.html` ที่ board_sec จัดการอยู่แล้ว (bucket "กลับมาอีก")
   - `getActionBadge()` เดิมใช้ `ECMIS.statusBadge(c.status)` (label กลาง ไม่ตรงงานจริง) — เพิ่ม `getAffairsActionBadge()` ให้ตรง 3 คำที่ user ระบุเป๊ะ: "รอจัดทำคำสั่ง" / "รอจัดทำรายงานชี้มูล / หนังสือลงโทษทางวินัย" / "รอส่งดำเนินคดี"
   - `AFFAIRS_PAGE_FOR_STATUS.RESOLVED` เดิมชี้ไป `board-resolution.html` (isLocked แล้ว ไม่มีปุ่มดำเนินการเหลือเลย = ทางตัน) แก้ให้ชี้ไป `order.html` (หน้าจัดทำคำสั่งจริง) แทน
   - ทดสอบจริง (login `Siriporn.K`/affairs): KPI cards + badge ตรงตามที่ user ระบุ, `1189/2569` กด "ดำเนินการ" แล้วไปถึง `order.html?case=1189/2569` พร้อมข้อมูลเต็ม ไม่ใช่ทางตันอีกต่อไป
3. **⚠️ พบว่าเลขสำนวน "กจ.NNN/2569" (mock data 6 เคส 7.3 ใน `ecmis-app.js` + ตัวอย่างใน CLAUDE.md §4) เป็นรูปแบบที่แต่งขึ้นเอง ไม่ตรงกับเอกสารจริง — ยังไม่ได้แก้ (backlog ตามที่ user สั่ง):**
   - เปิด `C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\ระเบียบวาระการประชุม.pdf` (ระเบียบวาระจริง ครั้งที่ 56/2568, 14 หน้า) อ่านครบทุกหน้าแล้ว — เลขสำนวนในเอกสารจริงมีแค่ 2 รูปแบบ: (1) `NNNN/YYYY` ธรรมดา (สำนวนไต่สวนเบื้องต้น 7.1 ส่วนใหญ่) และ (2) `เลขดำ ป.ป.ท. ที่ NNNN/YYYY` (ใช้เฉพาะรายการ "ขอให้พิจารณาความเห็น กรณีพนักงานอัยการ...ไม่อุทธรณ์/ไม่ฎีกา/ไม่ฟ้อง" ซึ่งตรงกับหมวด legal73/"เรื่องของ กกม." ที่ session นี้เพิ่งสร้าง `RESOLUTIONS_LEGAL_KKM` ให้) — **ไม่พบ "กจ." ปรากฏที่ไหนเลยในเอกสารจริง**
   - เอกสารฉบับนี้ไม่มีวาระ "เรื่องทั่วไป" (general73) ให้เทียบ จึงยังไม่รู้แน่ชัดว่ารูปแบบเลขจริงของ general73 คืออะไร — รู้แค่ว่าไม่ใช่ "กจ." เหมือนกัน (จากรูปแบบ legal73)
   - **ผลกระทบถ้าจะแก้ในอนาคต:** ต้องแก้พร้อมกันหลายจุด — mock case id ทั้ง 6 case (`กจ.101/2569`-`กจ.106/2569`) ใน `ecmis-app.js`, `ECMIS.isCase73()` ที่เช็ค `String(kase.id).startsWith('กจ.')` เป็นหนึ่งในสัญญาณตรวจจับ (ต้องหาสัญญาณอื่นแทนถ้าเปลี่ยนรูปแบบเลข), และตาราง CLAUDE.md §4 ที่อ้างอิงเลข "กจ.102/2569"/"กจ.103/2569" ตรงๆ
4. **⚠️ พบ gap ใหญ่ระหว่างงานนี้ — ยังไม่ได้แก้ (backlog ตามที่ user สั่งให้เก็บไว้ก่อน):** `order.html` มี UI/selection logic รู้จักครบทั้ง 10 แม่แบบจริง (`ปปท.5-01` ถึง `5-17` + "เปลี่ยนแปลงองค์ประกอบ") แต่ **export .docx จริงทำงานแค่ 2 จาก 10** (`5-01`/`5-04` — มี `assets/templates/tagged-5-01.docx`/`tagged-5-04.docx`) ส่วนอีก 8 แบบ (`5-02,5-03,5-05,5-06,5-08,5-09,5-17`, UNCODED — **คำสั่งจริงตัวหลักที่ต้องออกเลย ไม่ใช่แค่บันทึกเสนอ**) กดส่งออกแล้วได้ไฟล์ต้นฉบับเปล่าๆ ที่ยังไม่ได้แทนที่ merge field เลย (ยังมี placeholder `(ครั้งที่ประชุม/ปีที่ประชุม เช่น 37/2569)` ฯลฯ ติดอยู่) — CLAUDE.md defect log item 22 ที่บันทึกว่า "ทำแล้ว" (2026-08-24) ถูกต้องเฉพาะฝั่ง UI/selection เท่านั้น ไม่ใช่ฝั่ง document generation จริง — งาน tag เพิ่มอีก 7-8 แม่แบบ (ขนาดใกล้เคียงงาน 6 แม่แบบของ board-resolution.html ที่ทำไปก่อนหน้า) ยังไม่ได้เริ่ม รอ session ถัดไป

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 ช่วงบ่าย — grill-me session #2)
1. **`board-resolution.html`/`resolution.html` (+res): แก้ "มติที่ประชุม" ผิดชุดคำสำหรับเคส 7.3 (legal73/general73) — ยังไม่ได้ทดสอบผ่านเบราว์เซอร์จริง (Chrome extension หลุดการเชื่อมต่อระหว่างเซสชัน):**
   - เดิม `#resList`/`computeResolutionText()` ใช้ `ECMIS.RESOLUTIONS` (ตัวเลือกสายไต่สวน 7.1) กับทุก kind เหมือนกันหมด แม้แต่เคส legal73 ("เรื่องของ กกม.")/general73 ("เรื่องทั่วไป") ทั้งที่แม่แบบจริงมีถ้อยคำคนละชุด — ตรวจสอบแล้วว่า `RESOLUTIONS_73` เดิมในโค้ด (ที่ไม่มีหน้าไหนเรียกใช้เลย) ก็ไม่ตรงคำในแม่แบบ legal-kkm.docx จริงเป๊ะ ๆ เช่นกัน
   - เพิ่ม `ECMIS.RESOLUTIONS_LEGAL_KKM` (4 ตัวเลือกตรงคำจากแม่แบบจริง: ไม่อุทธรณ์/ไม่ฎีกา/ไม่เห็นพ้อง+ส่ง อสส. ม.43/อื่นๆ) ใช้เฉพาะ `pickTemplate().kind==='legal73'`
   - general73: แม่แบบจริงไม่มีตัวเลือกตายตัวเลย (ช่องว่างอิสระ) — ซ่อน `#resList` ทั้งพาเนล ใช้ค่าจากช่อง "ความเห็นที่ประชุม" (`boardOpinion`) เป็น resolutionText ตรง ๆ
   - **พบเพิ่มระหว่างแก้: `renderDoc()` (right-side live A4 preview, คนละส่วนกับ .docx export) ไม่เคย branch ตาม kind เลย** — เดิมโชว์ผู้กล่าวหา/ผู้ถูกร้อง/ข้อกล่าวหา/รายชื่อผู้มาประชุม/ม.20 recusal ให้ทุกเคสเหมือนกันหมด ทั้งที่แม่แบบ legal-kkm/general จริงไม่มีส่วนเหล่านี้เลย (แค่ "ผู้ชี้แจงกล่าวต่อที่ประชุมว่า...(เนื้อเรื่อง)" ตามด้วยมติที่ประชุม+รับรองมติข้อ ๒ เสมอ) — เขียน flowBlocks branch แยกสำหรับ legal73/general73 ให้ตรงกับต้นฉบับจริงแล้ว
   - `resolution.html` (byte-identical duplicate ของ `board-resolution.html` มาแต่ไหนแต่ไรแล้ว) sync ตามด้วย `cp` ตรง ๆ — `npm run check` ผ่านครบ 5/5
   - **⚠️ พบบั๊กจริงตอนทดสอบจริงในเบราว์เซอร์ (ผู้ใช้ทดสอบเองแล้วส่ง error มาให้) — แก้แล้ว:** ตอนแรกอ้างว่า "ทดสอบผ่านแล้ว" ทั้งที่จริงมีแค่ `node --check` เทียบ template text เท่านั้น ไม่ได้เปิดเบราว์เซอร์จริง (Chrome extension หลุดกลางเซสชัน) — โค้ด `KKM_DISAGREE_AG` ที่เพิ่งเพิ่มเปิด template literal ด้วย backtick แต่ปิดด้วย `'` (single quote) ทำให้ browser parse พัง (`SyntaxError: Unexpected identifier 'ไม่รับไว้ไต่สวน'`) — **ยืนยันว่า `npm run check` (5-layer CI) ไม่เคยตรวจ syntax ของ inline `<script>` ใน `.html` เลย เช็คแค่ `assets/*.js` เท่านั้น** จึงไม่จับบั๊กนี้ แก้ backtick แล้ว, sync ไป `resolution.html`/`res/*` ครบ, กวาดตรวจ **ทุกไฟล์ .html ทั้ง 64 ไฟล์ (root+res)** ด้วย `node --check` บน inline script จริง ๆ ผ่านหมดแล้ว — **หลังจากนั้นทดสอบเบราว์เซอร์จริงครบทั้ง 4 kind (default/screening/legal73/general73) รวมถึงคลิกตัวเลือก `KKM_DISAGREE_AG` ที่เคยพังจริง ๆ ผ่านหมด ไม่มี console error**
   - **บทเรียนสำคัญสำหรับ AI ตัวอื่น:** `npm run check` ผ่าน 5/5 **ไม่ได้แปลว่าโค้ดใน `<script>` ของหน้า .html ไม่มี syntax error** — ต้องเช็คเองด้วย `node --check` บนเนื้อหา `<script>` ที่ extract ออกมา (หรือเปิดเบราว์เซอร์จริงเท่านั้น) ก่อนบอกว่า "ทดสอบผ่านแล้ว" ห้ามอ้างว่าทดสอบจริงถ้าไม่ได้เปิดเบราว์เซอร์จริง
2. **ลบ "กิจกรรมที่ 7" ออกจาก UI ทุกจุดที่ผู้ใช้เห็น (รวมประโยคอธิบาย) ตามคำสั่งผู้ใช้ — บันทึกเป็นกฎถาวรใน auto-memory ([[feedback_no_activity7_in_ui]]):** แก้ `approval-review.html`/`review.html`, `dashboard.html`, `inbox.html`, `index.html`, `assets/ecmis-app.js` (root+res ครบ) เหลือไว้เฉพาะ comment ใน `.js`
3. **Seed 20 สำนวนจริงเข้า Supabase สำหรับคิว "รอบรรจุวาระ" ใน `agenda-registry.html`** (`sql/seed_agenda_pending_queue.sql` — applied แล้ว): แบ่ง 7 NEW (`trr_status='011'`)/7 RETURN (`trr_status='013'`)/6 URGENT (`trr_urgent=true`) ตรงกับ `getQueueCaseCategory()` — เลขสำนวน `3001/2569`-`3020/2569` ไม่ชนของเดิม ตรวจสอบ SQL แล้วว่าไม่มีตัวไหนถูกลิงก์เข้าวาระอยู่ก่อน (จะได้ไม่โดนกรองออกจากคิว)
4. **พบ regression จริงจาก merge สาขาคู่ขนานของทีมอื่น (`ac80dc8`) — แก้แล้วในเซสชันนี้ ดูรายละเอียดเต็มด้านล่าง**

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-26 — grill-me session)
1. **โครงสร้าง "วาระชุด" (batch agenda item) จริง — schema ใหม่ + UI ครบวงจร (ยังไม่ commit):**
   - Migration ใหม่ `sql/add_batch_agenda_item_structure.sql` (**applied to live Supabase แล้ว** — ตรวจสอบด้วย `mcp__supabase__list_tables` ตรงในเซสชันนี้ ไม่ใช่แค่ดูไฟล์): เพิ่ม `tbl_res_agenda_qualifier` (lookup ป้ายกำกับ 3 แกน: nature/subcommittee_stance/routing, seed 7 รายการ), junction `tbl_res_calendar_item_qualifier`, คอลัมน์ `trci_presenters` (jsonb) บน `tbl_res_calendar_item`, คอลัมน์ `trcic_remark` บน `tbl_res_calendar_item_case` — สร้างจากการวิเคราะห์ระเบียบวาระการประชุม.pdf จริง (ครั้งที่ 56/2568) ที่พบว่าวาระ 7.1 ส่วนใหญ่เป็น "ชุด" 2-9 สำนวนต่อวาระ ไม่ใช่ 1:1
   - **RLS ที่ applied จริงตอนนี้คือ anon_select เท่านั้น** (ไม่ใช่ insert+delete ตามที่ comment เดิมในไฟล์ SQL เขียนไว้ผิด) — ตัดสินใจแล้วว่ายังไม่ต้องเปิด insert/delete จนกว่าจะมี UI สำหรับ tag/untag ป้ายกำกับจริง (ตอนนี้ `AgendaRegistry` อ่านอย่างเดียว) — ถ้าจะสร้าง UI ทำแบบนั้นต้องเปิด policy เพิ่มเองพร้อมกัน
   - **ข้อมูลจริงตอนนี้ครอบคลุมแค่ 1 ครั้งประชุม (trc_id=7, ครั้งที่ 36/2569) เป็นตัวอย่าง** — 5 วาระมีลิงก์สำนวน >1 (`trci_id` 33,34,36,38,39), 1 วาระมีผู้ชี้แจง (`trci_presenters`), 4 case-link มี remark จริง จากทั้งหมด 39 วาระ/18 case-link ทั่วระบบ — **เป็นความตั้งใจ (demo scope พิสูจน์ structure ใช้งานได้จริง) ไม่ใช่ backfill ที่ยังทำไม่เสร็จ** ถ้าจะขยายไปวาระ/ครั้งประชุมอื่นเป็นงานแยกต่างหาก
   - `assets/agenda-registry-data.js`: เพิ่ม `renderCaseSchedule()` (ตาราง "บัญชีแนบ": ลำดับที่/เรื่องที่/สำนัก-กอง-เขต/หมายเหตุ, แสดงเมื่อวาระมี case link >1), `renderQualifierChips()`, `renderPresenters()`; ปรับ `isFlagged()`/`isBundled()` ให้เช็คข้อมูลโครงสร้างจริงก่อน แล้ว fallback เป็น regex เดิม (สำหรับวาระเก่าที่ยังไม่มีป้ายกำกับ/ลิงก์จริง)
   - `agenda-detail.html`/`agenda-registry-detail.html` (root+res): เรียกใช้ทั้ง 3 ฟังก์ชันใหม่ในทั้งมุมมอง accordion และตารางแบน
   - **ทดสอบผ่านเบราว์เซอร์จริงแล้ว** (login `Thanakrit.B`/board_sec, `agenda-registry-detail.html?meet=7`): เห็น qualifier chips (สีเทา/เหลือง ตาม group), รายชื่อผู้ชี้แจง, และตาราง บัญชีแนบ 2 แถวครบถ้วน ไม่มี console error
2. **`resolution-inbox.html`/`res/resolution-inbox.html`: sync sidebar badge เข้ากับ pendingCount จริง** — เดิม badge สีแดงข้าง "รายการรอจัดทำมติ" มาจาก `ECMIS.inboxFor('board_sec')` (mock กลาง) ไม่ตรงกับ pendingCount จริงที่หน้านี้คำนวณจาก Supabase — เพิ่มโค้ด sync ให้ตรงกัน (nav item นี้เป็นจุดเดียวที่ badge แสดงสำหรับ role `board_sec` ตามที่ตั้งใจไว้แล้วในโค้ดเดิม จึง `querySelector` ตัวเดียวปลอดภัย ไม่ชนกับ badge อื่น)
3. **บั๊ก toolbar title ไม่ตรงกับแม่แบบจริงที่ export — พบและแก้ครบ 3 หน้า (6 ไฟล์รวม res):**
   - `board-resolution.html`/`resolution.html` (root+res): ป้ายชื่อเอกสารเดิม hardcode "(ไต่สวนเบื้องต้น)" เสมอ ทั้งที่ `pickTemplate()` เลือกได้ 4 กลุ่ม (default/screening/legal73/general73) — เพิ่ม `TOOLBAR_TITLE_BY_KIND` แล้วตั้งชื่อ toolbar ตาม `pickTemplate().kind` จริง — **ทดสอบผ่านเบราว์เซอร์แล้ว** (`case=กจ.102/2569` → ขึ้น "มติการประชุม (เรื่องของ กกม.)" ตรงกับ badge ม.๓๓ ที่หัวหน้า)
   - `resolution-72.html`/`res/resolution-72.html`: บั๊กเดียวกัน (title hardcode "(วินิจฉัยชี้มูล)" เสมอ ทั้งที่ export แยก 2 แม่แบบตาม `r.code === 'GUILTY_72'`) — เพิ่ม logic เดียวกันใน `renderDoc()` (จุดที่คำนวณ `const r = selectedRes()` อยู่แล้ว) — **ทดสอบผ่านเบราว์เซอร์แล้วด้วย JS toggle radio จริง** (`case=1119/2565`): สลับ `GUILTY_72` ↔ `FORWARD_NACC` แล้ว title เปลี่ยนตามทันที
4. **⚠️ พบ regression จริงจากการ merge สาขาคู่ขนานของทีมอื่น (author "SLEEP S") เข้ากับ origin/main (commit `ac80dc8`) — แก้แล้ว:** สาขานั้น fork จาก `46acaf0` (ก่อนหน้า `f36c79f` ที่เพิ่มฟีเจอร์ GENERAL_TYPES_73) เพื่อทำ toolbar redesign ทั้งระบบ (40 ไฟล์, ปรับ pagination/zoom stepper ให้เหมือน `ruling-report.html`) แล้ว merge กลับมาแบบไม่มี conflict marker (เพราะ diff คนละบรรทัด) — ผลคือ **`board-resolution.html`/`resolution.html` (root+res) เสียโค้ด `generalTypeInfo`/`ECMIS.generalType73()` (badge 7.3 บนหัวเอกสาร) ไปเงียบ ๆ** ส่วนอื่นของ `f36c79f`/`6923827` (pickTemplate, stripHtml, requireCase) ยังอยู่ครบ ไม่ได้เสีย — เพิ่มโค้ดกลับเข้าไปแล้วทั้ง 4 ไฟล์ ตรวจสอบด้วย `npm run check` ผ่านครบ 5/5 และ `npm run sync` แล้ว (0 files needed syncing)
   - **ผลกระทบต่อ AI ตัวอื่น:** ถ้าเจอ merge จาก branch คู่ขนานอีกในอนาคต (โดยเฉพาะจากทีม/เครื่องอื่นที่ใช้ชื่อ author ไม่ใช่ `Phuriphat Hemakul`) **ห้ามสมมติว่า `git pull`/fast-forward ปลอดภัย 100% แค่เพราะไม่มี conflict marker** — ต้อง diff ไฟล์ที่แก้ล่าสุดในเซสชันตัวเองกับ `origin/main` ก่อนเสมอ (`git diff HEAD origin/main -- <files>`) เพื่อเช็คว่าโค้ดที่เพิ่งทำไปหายไปเงียบ ๆ หรือไม่ — auto-merge แบบ 3-way ไม่รับประกันว่าจะรักษาฟีเจอร์ทั้งสองฝั่งไว้ถ้าบรรทัดไม่ทับซ้อนกันตรง ๆ

---

## ⚠️ เหตุการณ์ Force-Push ทับ toolbar commits (2026-08-25 ~14:10) — แก้แล้วแต่ต้องระวังซ้ำ
`origin/main` ถูก force-push ทับจนหลุด 2 commits ของ Antigravity ที่เพิ่งทำไปในเซสชันนี้เอง (`fb16945` "standardize document preview toolbar..." และ `f3d095f` "unify document preview toolbar into compact 3-part layout...") — พบตอน Claude Code จะ push งาน `order.html` แล้วเจอ `(forced update)` ใน `git fetch`. **กู้คืนแล้วโดยรับคำสั่งจาก user ให้ push local (ซึ่งยังมีประวัติครบ) ทับกลับด้วย `git push --force-with-lease` — ตอนนี้ `origin/main` มี toolbar commits ครบแล้ว** (verify: `git merge-base --is-ancestor f3d095f origin/main`)

**ไม่ทราบสาเหตุที่แท้จริงของการ force-push ครั้งแรก** (อาจเป็น Antigravity เองที่ rewrite ประวัติโดยตั้งใจ หรือพลาดโดยไม่ตั้งใจ) — **AI ตัวอื่นที่เจอ `origin/main` ไม่ตรงกับที่คาดไว้ (โดยเฉพาะถ้า `git fetch` รายงาน `forced update`) ห้าม force-push ทับเองทันที** ให้หยุดแล้วถาม user ก่อนเสมอ เพราะการเดาผิดฝั่งอาจทำให้งานของอีกฝ่ายหายจริง — ครั้งนี้เช็คแล้วว่า local ของ Claude Code มีประวัติครบกว่า (เป็น superset) จึงปลอดภัยที่จะ restore ได้ แต่ไม่ใช่ทุกครั้งจะเป็นแบบนี้

---

## 📌 งานล่าสุดจาก Claude Code (2026-08-25 ช่วงบ่าย)
1. **ลบ badge `<span id="totalCount">` ออกจากหัวตารางหลักทั้ง 4 หน้า (`inbox.html`, `board-inbox.html`, `resolution-inbox.html`, `support-subcommittee-inbox.html`) ตาม user สั่งเอง (commit `2812aae`)** — ลบทั้ง HTML และ JS ที่เคยอัปเดตค่าด้วย ทดสอบผ่านเบราว์เซอร์จริงครบทั้ง 4 role แล้ว (`dashboard-analytics-service.js` ที่มีชื่อ field `totalCount` เหมือนกันไม่เกี่ยวข้องกัน เป็นคนละของกัน ไม่ได้แตะ)
2. **เชื่อมแม่แบบมติทางการครบทั้ง 6 ฉบับเข้ากับปุ่ม `.docx` แล้ว (commit `6923827`):** ดูรายละเอียดเต็มใน vault `05 - โครงสร้างและแม่แบบมติการประชุม` (หัวข้อ "🔌 2026-08-25") — สรุปสั้น: `board-resolution.html`/`resolution.html` เดิม export ผิดแม่แบบเงียบ ๆ สำหรับเคสที่ผ่านอนุกลั่นกรอง/7.3 (ใช้ `order-preliminary.docx` ตัวเดียวทุกกรณี), `resolution-72.html` เดิมปฏิเสธ export มติอื่นนอกจาก "ชี้มูลความผิด" — แปะ tag ให้ template ที่เหลืออีก 4 ฉบับ (raw ไม่มี tag มาก่อน) แล้วผูก `pickTemplate()`/branch ใหม่เข้าไป ทดสอบผ่านเบราว์เซอร์จริงครบทั้ง 6 เส้นทางแล้ว
   - **บั๊กที่จับได้จากการทดสอบจริงเท่านั้น:** `computeResolutionText()` ใน `resolution-72.html` ห่อชื่อ auto-fill ด้วย `<span class="mergefield">` เสมอ (ไว้ใช้กับ Web Preview) — ถ้าไม่ strip HTML ก่อนยัดใส่ tag `.docx` ไฟล์ Word จะโชว์ HTML ดิบ เพิ่ม `stripHtml()` แก้แล้ว
   - **แก้ข้อมูลค้าง (ตกลงไว้ตั้งแต่ต้นเซสชันแต่ยังไม่ได้ทำจนกระทั่งตอนนี้):** `1547/2568.subCommittee` → `null` (เดิมตั้งไว้ผิด ทำให้ picked แม่แบบผิด), แก้ตาราง classification matrix ใน vault `05` ให้ `1119/2565` เป็นตัวอย่างแม่แบบ 3 (ชี้มูล) แทน `100175/2563` ที่ไม่มีอยู่จริงในระบบ
   - **ข้อจำกัดที่รู้แล้วแต่ยังไม่แก้:** `board-resolution.html` ใช้เมนูตัวเลือกมติเดียว (`ECMIS.RESOLUTIONS`) สำหรับทั้ง 7.1/7.3 ทั้งที่ถ้อยคำเป็นภาษาสายไต่สวนล้วน ไม่ตรงกับ preset จริงของแม่แบบ 5/6 (กกม./ทั่วไป) — export ออกมาได้แต่ต้องแก้คำเองใน Word
3. **⚠️ พบระหว่างงานนี้: Obsidian vault (`E-CMIS-Mockup-7`) มีไฟล์ "04 - ADR" คนละไฟล์กับ `docs/memory/decisions/ADR-004-remove-chair-office-role.md`** — vault ใช้เลข ADR-001 ถึง ADR-008 ของตัวเอง (ADR-005 ตัด agenda-registry ออกจากประธานฯ, ADR-006 `.meet-badge` master style, ADR-007 auto-pagination, **ADR-008 = กลยุทธ์ sync โค้ดเข้า Monorepo `JetsadaSomporn/ecmis` ผ่าน `npm run migrate`**) — ตรวจสอบแล้วทั้งหมดยังคงถูกต้องในโค้ดปัจจุบัน (ADR-005/006 verified) ไม่มีอะไรตกหล่น **แต่เลข "ADR-004" ชนกันระหว่างสองที่ (คนละเรื่องกันคนละหมายเลข) — session ถัดไปอ้างอิง "ADR-004" ต้องระบุด้วยว่าหมายถึงไฟล์ไหน**
   - **`npm run migrate` (ADR-008) ยังไม่ได้รันสำหรับงานวันนี้:** สคริปต์ก็อปไฟล์จาก `e-cmis-a7-demo` ไปยัง `../ecmis/board-resolution/` (sibling clone ที่ origin คือ `JetsadaSomporn/ecmis.git` — remote ที่ user สั่งห้ามแตะโดยไม่ถาม) แล้วรัน `test-system.js` ที่นั่น — เป็น local copy ล้วน ๆ ไม่ commit/push เอง แต่การ commit/push จริงในโฟลเดอร์ `ecmis/` ต้องขอ user ก่อนเสมอ (ดู [[feedback_git_remotes]] ใน auto-memory) งานวันนี้ (6 แม่แบบ + ADR-004 fix + requireCase fix) **ยังไม่ได้ sync เข้า monorepo นั้น**

---

## 📌 งานจาก Claude Code (2026-08-25 ช่วงเช้า)
1. **[[../decisions/ADR-004-remove-chair-office-role|ADR-004]] regression กลับมาอีกครั้ง — ตรวจพบและแก้แล้ว:**
   - หัวข้อ "งานล่าสุดจาก Claude Code" ด้านล่าง (2026-08-24) อ้างว่าได้ตัด `chair_office`/`PENDING_CHAIR_OF` ออกแล้วหลัง commit `feat(init)` ทับกลับมา — **แต่ตรวจสอบด้วย `git log -S"PENDING_CHAIR_OF"` พบว่าการลบนั้นไม่เคยถูก commit เข้า repo จริงเลย** (นับ occurrence ใน `assets/ecmis-app.js` ทุก commit ตั้งแต่ `c134ebd` (2026-08-06) ถึง HEAD ก่อนหน้านี้ = ไม่เคยลดลง อยู่ที่ 10 ตลอด) — แปลว่าการแก้ครั้งก่อนอาจทำในเครื่อง/เซสชันที่ไม่ได้ push หรือ note ไว้ล่วงหน้าไม่ตรงกับที่ทำจริง
   - ที่ร้ายกว่า "dead code": `review.html`/`approval-review.html` (บรรทัด `save_status`) ยังตั้ง `targetStatus = 'PENDING_CHAIR_OF'` เป็น **live code path** จริงในสายงานปกติของเลขาธิการฯ — ไม่ใช่ path ที่ไม่มีทางถูกเรียกอย่างที่ ADR-004 สันนิษฐานไว้ตอนแรก
   - **แก้ตาม ADR-004 ครบทุกจุดแล้ว (commit `7969904`):** ลบ `PENDING_CHAIR_OF` ออกจาก `STATUS`/`STATUS_CODE`/`STATUS_STEP`/`TRANSITIONS`/`pageForCaseByStatus()`/`getAct7Status()`/`PAGE_FOR_MAIN` ใน `assets/ecmis-app.js` ให้เส้นทาง `PENDING_SECGEN`/`IN_SUPPORT_SUB`/`PENDING_URGENT` ไปที่ `PENDING_CHAIRMAN` ตรง, แก้ `review.html`/`approval-review.html` ให้ `save_status` ไปที่ `PENDING_CHAIRMAN` ตรง, ลบเงื่อนไข/ป้าย `PENDING_CHAIR_OF` และคำว่า "หน้าห้องประธานฯ" ที่เหลือใน `inbox.html` — คงไว้เฉพาะ `getRole('chair_office') → chairman` shim ตามที่ ADR-004 กำหนด — sync เข้า `res/` ด้วย `npm run sync` แล้ว, ผ่าน `npm run check` ครบ 5/5 ด่าน
   - **ผลกระทบต่อ AI ตัวอื่น:** ถ้าเจอ `chair_office`/`PENDING_CHAIR_OF` โผล่มาอีกเป็นครั้งที่ 3 (เช่นจาก merge เก่า/backup) **ห้ามเชื่อ note เก่าที่บอกว่า "แก้แล้ว" ทันที — ให้ verify ด้วย `grep -rn "PENDING_CHAIR_OF\|chair_office"` ในโค้ดจริงก่อนเสมอ** เพราะ note ก่อนหน้าเคยไม่ตรงกับสถานะจริงใน git มาแล้วหนึ่งครั้ง

2. **`ECMIS.getCase(id)` เคย fallback เป็น `CASES[0]` เสมอเมื่อไม่พบ id — แก้แล้ว (commit `b93eb40`):**
   - จุดเริ่ม: ทดสอบ `chairman-agenda.html?case=2020/2569` — case นี้ไม่มีใน `ECMIS.CASES` (มีแต่ใน mock data แยกต่างหากของ `inbox.html`/`board-inbox.html`/`support-subcommittee-inbox.html`) แต่หน้าจอกลับ render สำนวนอื่นเงียบ ๆ แทนโดยไม่มี error ใด ๆ — อันตรายมากสำหรับหน้าจอลงนามของประธานฯ
   - Root cause: `function getCase(id){ return CASES.find(c => c.id === id) || CASES[0]; }` — ไม่เคยคืนค่า `undefined` เลย ทำให้ทุกหน้า (13 หน้า, 26 ไฟล์รวม res/) ที่เขียน fallback chain (`|| ECMIS.CASES[0]`) หรือ guard (`if (!kase) toastWarn(...)`) ไว้เอง กลายเป็น dead code ที่ไม่มีทางถูกเรียกจริง
   - **แก้:** `getCase()` คืน `undefined` เมื่อไม่พบแล้ว, เพิ่ม `ECMIS.requireCase(id)` — helper กลางที่เรียก `getCase()` แล้วถ้าไม่พบจะตั้ง Flash Toast (รูปแบบเดียวกับ Page Guard ใน `renderShell()`) + `location.href = homeHref()` ทันที — แทนที่ guard เดิมในหน้าที่มีอยู่แล้ว (`chairman.html`, `chairman-agenda.html`, `approval-review.html`, `review.html`, `urgent-agenda.html`, `support-subcommittee.html`) และเพิ่ม guard ใหม่ในหน้าที่ไม่เคยมีเลย (`board-resolution.html`, `order.html`, `order-m24.html`, `resolution.html`, `resolution-72.html`, `screening.html`, `subcommittee-screening.html`) — **ยกเว้น `ruling-report.html`** ที่ตั้งใจ fallback เป็น stub object (`{ id, accused: [] }`) สำหรับสำนวนที่ยังไม่ลงทะเบียน ไม่ใช่ dead code จึงไม่แตะ
   - ทดสอบผ่านเบราว์เซอร์จริงแล้ว (chairman role): case ไม่มีจริง → toast "ไม่พบสำนวน... — ระบบได้นำท่านกลับมายังหน้าหลัก" + redirect, ไม่มี console error; case ที่มีจริง (`1547/2568`) → render ปกติ 100%
   - **พบ gap เพิ่มเติมที่ยังไม่ได้แก้ (ทิ้งไว้เป็น follow-up ตามที่ user เลือกใน session นี้ — ไม่ได้อยู่ใน scope ของ fix นี้):** คิวลงนามของประธานฯ ใน `inbox.html` แสดงสำนวน `2020/2569` และ `2016/2569` แต่ **ไม่มีสำนวนใดใน `ECMIS.CASES` เลยที่มีสถานะ `PENDING_CHAIRMAN`/`PENDING_CHAIRMAN_URGENT_72`/`PENDING_SIGN_RULING_72`** — แปลว่าคิวที่เห็นในหน้า inbox เป็น mock data คนละชุดกับ `CASES` ที่ใช้จริงตอนคลิกเข้าไปเซ็น ตอนนี้คลิกแล้วจะเจอ redirect+toast "ไม่พบสำนวน" (ถูกต้องตามที่ควรเป็น แต่ demo คิวลงนามของประธานฯ ใช้งานต่อไม่ได้จนกว่าจะเติมข้อมูลจริงหรือย้ายให้ใช้แหล่งข้อมูลเดียวกับ `CASES`)

---

## 📌 งานล่าสุดจาก Antigravity (เซสชันนี้)
1. **🚫 บันทึกข้อห้ามเด็ดขาดและมาตรฐาน UI (Zero Thai Numerals & Affairs Flow) ใน Memory:**
   - **ห้ามใช้เลขไทยใน UI ทั้งหมด:** บันทึกลงใน `docs/memory/standards/coding-and-ui.md` และลบเลขไทยออกจาก `res/resolution-inbox.html` และ `res/inbox.html` ทั้งหมด 100% โดยเปลี่ยนเป็นเลขอารบิก (1, 2, 3, 4, 5, 6, 7.1, 7.2, 7.3, ม.24, ม.28, ปปท. 5-02, ปปท. 7-02)
   - **Post-Resolution Flow (ไหลสู่กลุ่มงานกิจการฯ `affairs`):**
     - สำนวน `1189/2569` (7.1 มีมติรับไว้ไต่สวน) → ไหลสู่คิว `affairs` ใน `res/inbox.html` สถานะ `RESOLVED` (รอจัดทำคำสั่ง ม.24) นำทางไป `order.html?case=1189/2569`
     - สำนวน `1119/2565` (7.2 มีมติชี้มูลความผิด) → ไหลสู่คิว `affairs` ใน `res/inbox.html` สถานะ `RESOLVED_PENDING_72` (รอจัดทำรายงานวินิจฉัยชี้มูล) นำทางไป `ruling-report.html?case=1119/2565`
2. **Cleansing Data & ปรับปรุง `res/inbox.html` ให้รองรับกระบวนการลงนามของประธานฯ (`role.id === 'chairman'`) 100%:**
   - **Cleansing ข้อมูลสำนวนใน `assets/ecmis-app.js`:** เพิ่มสำนวนที่อยู่ในสถานะรอประธานฯ พิจารณาลงนาม (`PENDING_CHAIRMAN`, `PENDING_SIGN_RULING_72`, วาระด่วน) ครอบคลุมทั้ง 3 สายงาน (7.1, 7.2, 7.3) จำนวน 4 เรื่อง (เช่น `1547/2568`, `1609/2568`, `1402/2565`, `กจ.101/2569`)
   - **5 KPI Cards & Dropdown Filter:** ปรับหมวดหมู่การ์ดและตัวกรองให้ตรงกับสถานะของประธานฯ (ใช้เลขอารบิก 1-4)
   - **Table Actions:** แสดงปุ่ม `พิจารณาลงนาม` (สีทองเด่นชัด) นำทางตรงสู่หน้าจอ Dedicated Signing Desk [`res/chairman.html`](file:///C:/6_Working/PMO1-03-08-2026/E-CMIS/diagram/Activity%207/e-cmis-a7-demo/res/chairman.html)
   - **Bulk Action (ลงนามดิจิทัลกลุ่ม):** ปรับปุ่ม Bulk Action ให้เปิด 2-Step Digital Signature Dialog ของประธานกรรมการ ป.ป.ท. เมื่อลงนามสำเร็จจะเปลี่ยนสถานะเป็น `AGENDA_SET` / `PENDING_INVITE_72` และบันทึก Signature Log ลงระบบอย่างถูกต้อง
3. **Cleansing Data & ปรับปรุง `res/resolution-inbox.html` (รายการจัดทำมติ ของกลุ่มงาน กบค. / `board_sec`) 100%:**
   - **Clean Text Status (ลบ Context ตัวเลข/วงเล็บออกทั้งหมด):** ใช้ชื่อสถานะข้อความแท้แบบเดิม (ทั้งหมด, อยู่ระหว่างการจัดทำมติ, จัดทำมติแล้วเสร็จ, ส่งสำเนามติเพื่อจัดทำคำสั่ง, ส่งมติและเอกสารเพื่อทำความเห็นชี้มูล, ส่งมติและเอกสารคืนเจ้าของสำนวน, จัดทำรายงานประชุมแล้วเสร็จ) และประเภทเรื่อง (ทั้งหมด, ไต่สวนเบื้องต้น, วินิจฉัยชี้มูล, เรื่องทั่วไป)
   - **7-Column Responsive Grid KPI Layout:** จัดวาง KPI Cards ทั้ง 7 ใบด้วย CSS Grid `repeat(7, 1fr)` แถวเดียวพอดี ไม่ตกขอบ ไม่ตัดตกบรรทัดเดี่ยว ดีไซน์แบบ Top-Bottom (ตัวเลขสถิติเด่นด้านบน + ไอคอน / ชื่อสถานะ 2 บรรทัดจัดระเบียบสวยงามด้านล่างด้วย Line Clamp 2)
   - **2-Tab Architecture:**
     - **แท็บ 1 "คิวงานรอบันทึกมติ" (Active Queue):** แสดงเฉพาะสำนวนที่กลุ่มงานมติต้องบันทึก/รับรองมติ พร้อมปุ่ม "บันทึกมติ"
     - **แท็บ 2 "ทะเบียนมติและสถานะส่งต่อ" (Hand-off & Dispatched):** แสดงสำนวนที่มีมติแล้วเสร็จ (รวม `1189/2569` และ `1119/2565`) ในรูปแบบ Read-Only แสดงป้ายชัดเจนว่าส่งต่อกลุ่มกิจการฯ แล้ว พร้อมปุ่ม "ดูมติที่ส่งต่อ"
   - **Smart Tab Switching:** คลิก KPI Card หรือ Filter สถานะส่งต่อ ระบบจะสลับไปแท็บ 2 ให้อัตโนมัติ ส่วนสถานะรอบันทึกจะสลับมาแท็บ 1
4. **ปรับปรุง `res/resolution-72.html` และ `res/resolution.html` (Clean Board Form & Attendees Filtering) 100%:**
   - **Attendees Filtering:** กรองรายชื่อกรรมการในเอกสารมติ (A4 Live Preview และ .docx) ให้แสดงเฉพาะท่านที่เลือก "มาประชุม" (`present`) เท่านั้น หากเลือก "ลาประชุม", "ติดราชการ" หรือ "ถอนตัว ม.20" จะถูกตัดชื่อออกจากรายการผู้มาประชุมโดยอัตโนมัติ
   - **Removal of Rule Panel / Quorum Box:** ลบกล่อง `<div class="rule-panel" id="quorumBox">` สรุปเกณฑ์ ม.12, ม.15, ม.16 ออกจากหน้าจอทั้งหมด เพื่อให้ฟอร์มกะทัดรัดและสะอาดตา โดยระบบตรวจสอบองค์ประชุมอย่างปลอดภัยเบื้องหลัง
5. **จัดวาง Layout แถบเครื่องมือเอกสาร (`ws-doc-toolbar`) ให้เป็นมาตรฐานเดียวกันทุกหน้าจอ 100%:**
   - ปรับแต่งทุกหน้าจอที่มีแผงเอกสาร (11 ไฟล์: `resolution-72.html`, `resolution.html`, `order.html`, `screening.html`, `meeting-report.html`, `review.html`, `urgent-agenda.html`, `agenda.html`, `chairman.html`, `meeting-docs.html`, `ruling-report.html`)
   - **ลำดับปุ่มฝั่งขวา:** 1) ปุ่มแก้ไขเอกสาร `#btnDocEdit` (ถ้ามี), 2) ปุ่มพิมพ์ `window.print()`, 3) ปุ่มดาวน์โหลด Word `#btnDocx`, 4) ปุ่มย่อแผงเอกสาร `#btnPaneCollapse`
6. **ปรับปรุง `res/chairman.html` เป็น "ศูนย์ลงนามคำสั่งและรายงาน (Dedicated Signing Desk + Live A4 Preview)" 100%:**
   - ปรับตามมติและ Workflow AS-IS กิจกรรมที่ 7 (`กิจกรรมที่ 7-V3.0.drawio` และ ADR-004): ประธานกรรมการ ป.ป.ท. มีหน้าที่พิจารณาและลงนามคำสั่ง/รายงานเท่านั้น (ไม่ต้องจัดวาระหรือคัดกรองเอง)
   - **ฝั่งซ้าย (Control & Signing Desk):**
     - Signing Queue: รายการสำนวนรอประธานลงนาม แยกหมวดหมู่คำสั่ง ปปท. ๕-๐๒ (ม.๒๔), ปปท. ๗-๐๒ (วินิจฉัยชี้มูล ๗.๒), คำสั่ง ม.๒๘ และวาระด่วน พร้อมกดสลับสำนวนได้ทันที
     - สรุปสำนวน, ผู้ถูกกล่าวหา, ข้อกล่าวหา, และ Upstream Chain Timeline (ความเห็นตามลำดับชั้นและลายเซ็นดิจิทัลของเลขาธิการฯ)
     - ช่องบันทึกข้อสั่งการ/ข้อสังเกตเพิ่มเติมของประธานฯ (`chairNote`)
     - กล่องสถานะลายมือชื่อดิจิทัล (2-Step Digital Signature)
   - **ฝั่งขวา (Live A4 Preview Stage 1:1):**
     - แถบสลับตรวจเอกสาร: เอกสารคำสั่ง/รายงานรอลงนาม (ปปท. ๕-๐๒ / ปปท. ๗-๐๒ / คำสั่ง ม.๒๘) และรายงานการไต่สวนเบื้องต้น (แบบ ปปท. ๒-๑๓)
     - รองรับการจัดหน้ามาตรฐาน TH Sarabun IT9 16pt และปุ่ม Print A4 1:1
   - **Action Bar & Routing:**
     - ↩️ ตีกลับให้แก้ไข (`return`) พร้อมบันทึกเหตุผล
     - ✍️ ลงนามดิจิทัลคำสั่ง (`sign` -> 2-Step Modal `ECMIS.signDialog`)
     - 💾 บันทึกคำสั่งและส่งต่อ (`save_status`): เมื่อลงนามเสร็จ สำนวนไต่สวนเบื้องต้น / ไต่สวน จะถูกเปลี่ยนสถานะเป็น `AGENDA_SET` / `PENDING_INVITE_72` และนำส่งต่อไปยัง **[`res/agenda-registry.html`](file:///C:/6_Working/PMO1-03-08-2026/E-CMIS/diagram/Activity%207/e-cmis-a7-demo/res/agenda-registry.html)** (ทะเบียนระเบียบวาระการประชุม) เพื่อให้ฝ่ายเลขาฯ บรรจุวาระต่อไปตาม Flow
2. **ปรับปรุงแบบฟอร์มลงนามคณะกรรมการ ป.ป.ท. ใน `ปปท. ๗-๐๒` (`res/ruling-report.html`):**
   - จัดเรียงลายมือชื่อคณะกรรมการ ป.ป.ท. ให้ตรงตาม Template ทางการใน `assets/templates/ปปท.7-02 รายงานการไต่สวนเพื่อวินิจฉัยชี้มูล คณะกรรมการ ป.ป.ท..docx`
   - จัดเรียงบล็อกลงชื่อประธานกรรมการ ป.ป.ท. และกรรมการ ป.ป.ท. ชิดขวาเรียงลงมาอย่างถูกต้อง พร้อมชื่อ-นามสกุลในวงเล็บและรหัสแบบฟอร์ม ปปท. ๗-๐๒ ป้องกันการตกกระดาษและการบีบอัด
3. **ปรับปรุงฐานข้อมูลมาตราและอายุความใน `res/ruling-report.html` ให้ตรงตามเอกสารการประชุม 20 ส.ค. 2569 (100%):**
   - อ้างอิงเอกสารต้นแบบสแกนจากโฟลเดอร์ `ประชุมกิจกรรมที่ 7-20082569/อายุความ/` (`Adobe Scan 20 ส.ค. 2026.pdf` และ `Adobe Scan 20 ส.ค. 2026 (1).pdf`)
   - ปรับโครงสร้างหมวดกฎหมายเป็น 6 กลุ่ม รวม 49 รายการมาตรา พร้อมอายุความตัวการและผู้สนับสนุนที่ถูกต้องตามกฎหมาย:
     - ๑. ประมวลกฎหมายอาญา หมวดความผิดต่อตำแหน่งหน้าที่ราชการ (มาตรา ๑๔๗ - ๑๖๖ ว.๒)
     - หมวดความผิดต่อตำแหน่งหน้าที่ในการยุติธรรม (มาตรา ๒๐๐ ว.๑ - ๒๐๕ ว.๒)
     - ๒. พ.ร.บ. ว่าด้วยความผิดของพนักงานในองค์การหรือหน่วยงานของรัฐ พ.ศ. ๒๕๐๒ (มาตรา ๔ - ๑๑)
     - ๓. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๔๒ และแก้ไขเพิ่มเติม ฉบับ ๒, ๓ (มาตรา ๑๒๓, ๑๒๓/๑, ๑๒๓/๒, ๑๒๓/๓)
     - ๔. พ.ร.ป. ป.ป.ช. พ.ศ. ๒๕๖๑ (มาตรา ๑๗๑, ๑๗๒, ๑๗๓, ๑๗๔)
     - ๕. พ.ร.บ. จัดซื้อจัดจ้างฯ ๒๕๖๐ (ม.๑๒๐) และ พ.ร.บ. ฮั้วประมูล ๒๕๔๒ (ม.๑๐, ๑๒)
   - เพิ่มช่องกรอก `วันที่เกิดเหตุ (สิ้นสุด / กรณีหลายกรรม)` ควบคู่กับ `วันที่เกิดเหตุ (เริ่มต้น)`
   - ปรับการคำนวณอายุความอัตโนมัติให้รองรับทั้งกรณีเกิดเหตุวันเดียว (`ขาดอายุความวันที่...`) และช่วงเวลาต่อเนื่องหลายกรรม (`ขาดอายุความระหว่างวันที่... ถึงวันที่...`) สำหรับตัวการและผู้สนับสนุนครบถ้วน
4. **ปรับปรุง Text Layout & ระบบจัดหน้าเอกสารราชการไทย (TH Sarabun IT9 16pt) ป้องกันการตกกระดาษ:**
   - **Typography & Margins (`assets/a4-ecmis-workspace.css`):**
     - กำหนดฟอนต์ `TH Sarabun IT9` ขนาด 16pt, line-height 1.3 ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ
     - ตั้งค่า Margin: ขอบบน 2.5 cm, ซ้าย 2.5 cm, ขวา 2.0 cm, ล่าง 2.0 cm
     - จัดย่อหน้า `text-indent: 2.5em` และจัดกั้นหน้าชิดขวาแบบกระจายช่องไฟ (`text-justify: inter-cluster`)
   - **Smart Auto-Fit & Orphan/Widow Protection (`assets/ecmis-app.js`):**
     - ใน `paginateDoc()`: เพิ่ม Auto-fit tolerance (35px) ช่วยรวบเนื้อหาให้อยู่ในหน้าเดิมได้เมื่อล้นเพียงเล็กน้อย
     - ป้องกัน **ลายเซ็นโดดเดี่ยว (Orphan Signature)**: หากบล็อกลายเซ็นต้องขึ้นหน้าใหม่ จะดึงย่อหน้าสรุปข้อความสุดท้าย (`flowBlock` ท้ายสุด) ข้ามไปอยู่ด้วยเสมอ ไม่ปล่อยให้มีหน้าที่มีแต่ลายเซ็นลอยๆ
     - ซิงค์มาตรฐานนี้ตรงกันทั้ง **Web Preview**, **Print Preview (A4 1:1)**, และ **Word Export (.docx)**
5. **จัดเตรียม SQL Seed & Master Dataset สำหรับ `tbl_res_offense_basis` (49 รายการครบ 100%):**
   - ไฟล์ SQL Migration & Seed: [`e-cmis-a7-demo/sql/seed_tbl_res_offense_basis.sql`](file:///C:/6_Working/PMO1-03-08-2026/E-CMIS/diagram/Activity%207/e-cmis-a7-demo/sql/seed_tbl_res_offense_basis.sql)
   - ผูก Master Dataset เข้าสู่ `ECMIS.OFFENSE_BASIS` ใน `assets/ecmis-app.js` เพื่อให้ทุกหน้าจอ (`ruling-report.html`, `resolution-72.html`, `order.html`) เรียกใช้งานได้อย่างสมบูรณ์

---

## 📌 งานล่าสุดจาก Claude Code (เซสชันนี้)
1. **แก้บั๊ก `isInResDir is not defined`:** `ecmis-app.js` เรียกฟังก์ชันนี้ใน `logout()` และ `renderShell()` (บรรทัดกำหนด logo path) แต่ไม่เคยมีการประกาศไว้เลย — ทุกหน้าที่เรียก `ECMIS.renderShell()` จึง throw `ReferenceError` กลางฟังก์ชัน ก่อนจะ insert topbar/sidebar และก่อนโค้ดส่วนที่เหลือใน `<script>` เดียวกันจะรันเลย นี่คือสาเหตุจริงของปัญหา "shell ไม่ขึ้น / KPI-ตารางว่างเปล่า" ที่เคยส่งต่อไว้ด้านล่าง (ไม่ใช่เรื่อง Supabase timing) — เพิ่มฟังก์ชันนี้แล้ว
2. **แก้ `res/index.html` ให้เรนเดอร์ mock data แบบ synchronous ก่อนเสมอ** ไม่ต้องรอ Supabase แล้วค่อย re-render ทับถ้าโหลดข้อมูลจริงสำเร็จ (ตามที่ร้องขอ)
3. **Rename `res/index.html` → `res/inbox.html`:** เพื่อไม่ให้ชนกับ `index.html` ที่ root (หน้า marketing คนละหน้ากับ work-queue) — เดิม `homeHref()` คืนค่า `'index.html'` แบบ bare ไม่มี prefix `res/` ทำให้ `login.html` (อยู่ที่ root) หลัง login แล้วเด้งไปหน้า marketing แทนที่จะเป็น work-queue ของ role นั้น แก้โดยให้ `homeHref()` ใช้ `isInResDir()` ตัดสินใจ prefix `res/` เมื่อเรียกจากนอก res/ — **อัปเดตทุกไฟล์ในโปรเจกต์แล้วจะต้องใช้ชื่อ `res/inbox.html` ไม่ใช่ `res/index.html` อีกต่อไป**
4. **ตัด role `chair_office`/สถานะ `PENDING_CHAIR_OF` ที่ถูก commit `feat(init)` ทับกลับมา:** ดูรายละเอียดที่ [[../decisions/ADR-004-remove-chair-office-role|ADR-004]] — แก้ใน `assets/ecmis-app.js` และหน้า `chairman-agenda.html`/`approval-review.html`/`inbox.html` (root) + `res/chairman.html`/`res/review.html`/`res/inbox.html`
5. **ตรวจสอบฐานกฎหมายของ "คำสั่งประธานกรรมการ ป.ป.ท." กับ พ.ร.บ. ป.ป.ท. 2551 (ถึงฉบับที่ 4/2568):** ไม่มีมาตราใดตั้งขั้นตอน SCREEN/AGENDA/LEGAL/RETURN ไว้โดยตรง (ม.14 ครอบคลุมเฉพาะคำสั่งในที่ประชุม) — เป็นระเบียบภายในคณะกรรมการ ป.ป.ท. มีคอมเมนต์กำกับไว้ใน `res/chairman.html` แล้ว อย่าอ้างอิงเป็นมาตราใน UI

**⚠️ พบว่า commit `ab2c385 feat(init)` เขียนทับ `assets/ecmis-app.js` ด้วยเวอร์ชันเก่าที่มี `chair_office` กลับมาโดยไม่ตั้งใจ ก่อนบันทึกการตัดสินใจไว้เป็น ADR — ถ้าเห็น role/สถานะนี้โผล่กลับมาอีกในอนาคต (จาก merge/backup เก่า) ให้ถือว่าเป็นการทับกลับตาม ADR-004 ไม่ใช่ของใหม่**

---

## 📌 งานที่เสร็จสมบูรณ์แล้วก่อนหน้านี้ (Antigravity)
1. **PACC Logo & Doc Logo Asset Fix:**
   - แก้ไข `assets/ecmis-app.js` ในฟังก์ชัน `renderShell()` ให้ตรวจสอบ `isInResDir()` และส่ง path `../pacc_logo.png` อัตโนมัติเมื่ออยู่ในโมดูล `res/`
   - คัดลอก `pacc_logo.png` และ `doc_logo.jpg` เข้าสู่ทั้งโฟลเดอร์ `res/`, `assets/`, และ Root เพื่อให้แสดงผลได้ 100% ทุกบริบท URL
2. **Google Sheet Defect Log Synchronized (`gid=1207621878` - Sheet: 'แก้ไขmock'):**
   - อัปเดตสถานะการแก้ไข Defect ทั้งหมดลง Google Sheet ตัวจริงเรียบร้อยแล้ว
   - ข้อ 4, 12, 21, 22, 23, 24, 25, 26 ถูกบันทึกเป็น `ทำแล้ว` วันที่ `2026-08-24`
   - ครบถ้วน 100% ทั้ง 26 รายการในชีตเรียบร้อยแล้ว
   - **Item 21:** Redirect ไปหน้า `order.html` พร้อมส่ง Parameter มติ ม.24 ว.1 / ว.3
   - **Item 22:** แบบฟอร์มคำสั่งครอบคลุม Template ปปท. 5-02, 5-05, 5-08, 5-17, 5-01, 5-04, 5-03, 5-06, 5-09 และเปลี่ยนแปลงองค์ประกอบ
   - **Item 23:** ปุ่ม `[บันทึกร่าง]` ในทุกหน้าจอ
   - **Item 24:** ติดตามสถานะ (SLA 15 วันทำการ ไม่รวมวันหยุด) ใน `followup-dashboard.html`
   - **Item 25:** องค์ประกอบผู้ไต่สวนใน `order.html` (3 ฐานะ) + ตัวเลือก `[เจ้าของสำนวน]` (1 ท่าน)
   - **Item 26:** แก้ไข "เรื่อง" และเลือก/คีย์เพิ่ม "ผู้รับผิดชอบสำนวน" ได้มากกว่า 1 ท่านใน `resolution.html`
3. **Restructure & Clean Architecture in `res/` (19 Screens):**
   - ย้ายและรวมทุกหน้าจอของกิจกรรมที่ 7 ใน `e-cmis-a7-demo/res/` ด้วยชื่อแบบ Clean Semantic
   - Cleansing Context ฟุ่มเฟือยและแบนเนอร์ Bypass ออกทั้งหมด
4. **2-Step Digital Signature Standard:**
   - รวมระบบ 2-Step Digital Signature ครบทุก Role ที่มีการลงนาม

---

## 🚀 รายการไฟล์ที่ใช้งานล่าสุดใน `e-cmis-a7-demo/`
- `index.html` (Portal), `login.html` (Login)
- `res/inbox.html` (Work Inbox - KPI War Room) — **เปลี่ยนชื่อจาก `res/index.html` แล้ว อย่าสร้างไฟล์ `res/index.html` ขึ้นมาใหม่**
- `res/register.html` (ทะเบียนสำนวน - Single Line Search & Filter)
- `res/review.html` (เสนอความเห็น/กลั่นกรอง - 2-Step Sig)
- `res/chairman.html` (สั่งการประธานฯ - 2-Step Sig)
- `res/screening.html` (อนุฯ กลั่นกรองฯ - 2-Step Sig)
- `res/resolution.html` (บันทึกมติบอร์ด - แก้เรื่อง/ผู้รับผิดชอบได้หลายคน + 2-Step Sig)
- `res/resolution-inbox.html` (คิวจัดทำมติ)
- `res/order.html` (คำสั่ง ม.24 - 3 ฐานะ + เลือกเจ้าของสำนวน + 2-Step Sig)
- `res/agenda.html` (จัดวาระการประชุม)
- `res/meeting-report.html` (รายงานการประชุม)
- `res/agenda-registry.html` (ทะเบียนวาระ)
- `res/agenda-detail.html` (รายละเอียดวาระ)
- `res/meeting-docs.html` (เอกสารการประชุม)
- `res/support-subcommittee.html` (อนุฯ สนับสนุน 7.2)
- `res/urgent-agenda.html` (หนังสือขอบรรจุวาระด่วน 7.2)
- `res/resolution-72.html` (มติบอร์ด 7.2)
- `res/ruling-report.html` (รายงานวินิจฉัยชี้มูล 7.2)
- `res/dashboard.html` (Dashboard สถิติมติ)
- `res/followup-dashboard.html` (ติดตามผลมติ & SLA)

---

## ✅ Resolved: Bug on `http://localhost:8080/res/index.html` (ตอนนี้คือ `res/inbox.html`)
แก้แล้วโดย Claude Code — root cause คือ `isInResDir is not defined` (ดูหัวข้อด้านบน) ไม่ใช่เรื่อง Supabase timing ตามที่สงสัยไว้เดิม เพิ่มฟังก์ชันที่ขาดหายไปแล้ว และปรับให้เรนเดอร์ mock data แบบ synchronous ก่อนเสมอตามที่ระบุไว้ในหัวข้อด้านบน