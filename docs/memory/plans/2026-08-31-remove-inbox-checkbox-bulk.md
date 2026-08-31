# 📋 Task Plan: ลบ Checkbox Column + ฟีเจอร์ Bulk Action ออกจากตาราง Inbox

> **Plan ID:** `2026-08-31-remove-inbox-checkbox-bulk`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ความต้องการ:** ลบคอลัมน์ checkbox ออกจากตาราง inbox (ทั้ง header และแต่ละแถวข้อมูล)
- **ข้อเท็จจริงสำคัญที่พบ:** checkbox column ไม่ใช่แค่ตกแต่ง — มันขับเคลื่อนฟีเจอร์ "Bulk Action" (เลือกหลาย
  รายการแล้วอนุมัติ/ลงนาม/สั่งการพร้อมกัน) ที่มีอยู่จริงและ role-gated แล้วใน 3 หน้า: `inbox.html`,
  `resolution-inbox.html`, `support-subcommittee-inbox.html`

## 📐 Design Decisions (จาก grilling session กับผู้ใช้)
1. ลบทั้ง 3 หน้าที่มี pattern checkbox+bulk นี้ (ไม่ใช่แค่ inbox.html)
2. ตัดฟีเจอร์ Bulk Action ทิ้งทั้งหมด (ไม่ใช่แค่ซ่อน checkbox แต่เก็บฟีเจอร์ไว้ทางอื่น)
3. อัปเดต CLAUDE.md กฎเหล็กข้อ 1 ให้ตรงกับความจริงใหม่ (7→6 คอลัมน์, ประเภทเรื่อง คอลัมน์ 3→2)

---

## 📂 2. Affected Routes & Modules
- [x] Root HTML: `inbox.html`, `resolution-inbox.html`, `support-subcommittee-inbox.html`
- [x] Mirror HTML (ผ่าน `npm run sync`): `res/inbox.html`, `res/resolution-inbox.html`,
  `res/support-subcommittee-inbox.html`
- [x] `CLAUDE.md` — กฎเหล็กข้อ 1

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. **แก้กฎนี้โดยตรง** — ต้องอัปเดตข้อความให้ตรงความจริงใหม่ (7→6 คอลัมน์) ตามที่ผู้ใช้ยืนยัน
      ไม่ใช่การลบคอลัมน์ ประเภทเรื่อง ออก (ยังอยู่ครบ แค่ขยับตำแหน่ง)
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. วางแผนรัน `npm run sync` หลังแก้ Root
- [x] 5. ไม่แตะ A4 margin/geometry
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** `inbox.html` — ลบ `<col>`/`<th>` checkbox, bulk footer box, checkbox cell ใน row
      template (ทั้ง chairman branch และ general branch), `copy.bulkBtn/bulkTitle/bulkBody` ทั้ง 4 role,
      `initCheckboxHandlers()`/`updateBulkActionsState()`/`btnBulkApprove` listener, colspan 7→6,
      skeleton row, local `updateCaseStatus()` ที่กลายเป็น dead code
- [x] **Task 2:** `resolution-inbox.html` — ลบชุดเดียวกัน (colgroup/th, bulk footer, row checkbox cell,
      `initCheckboxHandlers`/`updateBulkActionsState`/`btnBulkApprove`, colspan 7→6, skeleton row)
- [x] **Task 3:** `support-subcommittee-inbox.html` — ลบชุดเดียวกันแบบ jQuery (`$('#chkAll')`,
      `.case-chk`, `updateBulkUI()`, `$('#btnBulkApprove')` handler, colspan 6→5)
- [x] **Task 4:** อัปเดต `CLAUDE.md` กฎเหล็กข้อ 1
- [x] **Task 5:** `npm run sync` + `npm test`
- [x] **Task 6:** ทดสอบ UI จริงในเบราว์เซอร์ทั้ง 3 หน้า (ทุก role ที่เกี่ยวข้อง) ยืนยันไม่มี error จาก
      element ที่ถูกลบไปแล้ว (`getElementById(...).className` เป็นต้น)

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough:** เปิดทั้ง 3 หน้า ไม่มี checkbox เหลือ ไม่มีปุ่ม Bulk Action เหลือ
      ตารางแสดงผลปกติ ไม่มี console error
- [x] **Dual-Route Sync:** `npm run sync`
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100%

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** ทดสอบผ่านทั้ง 3 หน้าครบทุก role ที่เกี่ยวข้อง (secgen/chairman/board_sec/
  support_sub) ไม่มี console error ระหว่างทดสอบเจอ false alarm อีกครั้งจาก browser cache เก่าของ dev server
  (เห็น checkbox ค้างใน resolution-inbox.html ทั้งที่ source ไม่มีแล้ว) แก้ด้วยการ cache-bust query string —
  ยืนยันด้วย `fetch(url, {cache:'no-store'})` ว่า source ถูกต้อง ไม่ใช่บั๊กโค้ด (ปัญหา cache นี้เกิดซ้ำมาแล้ว
  หลายรอบกับ dev server ตัวนี้ — เป็นข้อจำกัดของ environment ทดสอบ ไม่เกี่ยวกับโค้ดที่แก้)
