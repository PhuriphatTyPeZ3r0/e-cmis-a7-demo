# 📋 Task Plan: Auto-fill Highlight สีเขียว + เอา Placeholder Dots ออก (ระบบ preview เอกสารทั้งหมด)

> **Plan ID:** `2026-08-31-mergefield-highlight`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** ใน preview เอกสารแต่ละหน้ามีข้อความ placeholder แบบจุดไข่ปลา (`……………`)
  แสดงในช่องที่ยังไม่มีข้อมูล ต้องการเอาออก และต้องการให้ช่องที่มีข้อมูลจากการกรอก Fill แสดง highlight
  สีเขียวเพื่อให้ผู้ใช้เห็นชัดว่ากรอกไปแล้วตรงไหนบ้าง
- **ข้อเท็จจริงสำคัญที่ตรวจพบ:** มีกลไก `ECMIS.mergeField()` (alias `M()`) ที่ห่อทุกค่าฟิลด์ด้วย
  `<span class="mergefield filled">`/`<span class="mergefield empty">` อยู่แล้ว ใช้ร่วมกันทั้งระบบ (~30 หน้า
  preview เอกสาร ไม่ใช่แค่ order.html) แต่ CSS บังคับ `background:transparent !important` มาตั้งแต่ initial
  commit ของ repo — ไม่ใช่บั๊กที่เพิ่งเกิด แต่เป็นสวิตช์ที่ไม่เคยถูกเปิดมาก่อน

## 📐 Design Decisions (จาก grilling session กับผู้ใช้)
1. **ขอบเขต:** แก้ที่ `ECMIS.mergeField()`/CSS ตัวเดียว มีผลทั้งระบบทุกหน้า preview เอกสารทันที
2. **ช่องว่างเปล่า:** เอา placeholder dots ออกทั้งหมด ให้ว่างสนิทจนกว่าจะมีข้อมูลจริง ไม่มี fallback text ใดๆ
3. **Highlight สีเขียว:** แสดงเฉพาะหน้าจอ (screen) เท่านั้น ผ่าน `@media print` กันไม่ให้ติดไปตอนพิมพ์/PDF/DOCX
   (DOCX export ผ่าน docxtemplater คนละเส้นทางอยู่แล้ว ไม่ได้ใช้ CSS นี้เลย) ใช้โทนสีเขียวเดียวกับที่ระบบใช้อยู่แล้ว
   (`#ECFDF5` ตามโทน badge "เสร็จสิ้น/done" อื่นๆ ในระบบ)

---

## 📂 2. Affected Routes & Modules
- [x] Assets JS: `assets/ecmis-app.js` — `mergeField()` function
- [x] Assets CSS: `assets/ecmis-app.css` — `.mergefield`/`.mergefield.filled` rules + `@media print` guard
- [x] ไม่แตะ root HTML ใดๆ โดยตรง (ทุกหน้าที่ใช้ `ECMIS.mergeField()`/`M()` ได้รับผลอัตโนมัติ)

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. ไม่แตะ root HTML จึงไม่ต้อง sync (เฉพาะ `assets/`) — รัน `npm run sync` เพื่อความชัวร์
- [x] 5. ไม่แตะ A4 margin/geometry (แก้แค่สไตล์ inline span ภายในเนื้อหา)
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** แก้ `mergeField()` ใน `ecmis-app.js` — เอา placeholder text ออกจากกรณี empty
      (คืน span ว่างเปล่าแทน `……………`)
- [x] **Task 2:** แก้ CSS `.mergefield`/`.mergefield.filled` — เอา `!important` transparent ออก ใส่
      background เขียว `#ECFDF5` + `border-radius`/`padding` เล็กน้อยให้ดูเป็น highlight chip
- [x] **Task 3:** เพิ่ม `@media print{ .mergefield.filled{ background:transparent !important; ... } }`
      กันไม่ให้ highlight ติดไปตอนพิมพ์/PDF
- [x] **Task 4:** `npm run sync` + `npm test`
- [x] **Task 5:** ทดสอบ UI จริงในเบราว์เซอร์ (order.html + ruling-report.html เพื่อยืนยันผลกระทบทั้งระบบ)

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough (Claude in Chrome):** order.html (แจ้งเขต tab) และ ruling-report.html —
      ฟิลด์ที่มีข้อมูลแสดง highlight เขียวชัดเจน ฟิลด์ว่างไม่มี dots/placeholder ใดๆ เหลืออยู่ ไม่มี console error
- [x] **Dual-Route Sync:** `npm run sync` (0 files synced — ถูกต้อง เพราะแก้เฉพาะ `assets/`)
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100% (0 errors, 0 warnings)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** ระหว่างทดสอบเจอ false alarm — เบราว์เซอร์แคช `ecmis-app.css` เก่าไว้แน่นมาก
  (Python `SimpleHTTPServer` dev server ไม่ส่ง cache-control header ทำให้ Chrome ใช้ heuristic caching)
  แม้ `location.reload(true)` ก็ไม่ช่วย ต้องบังคับเปลี่ยน query string ของ `<link>` เพื่อล้างแคชถึงเห็นผลจริง —
  ไม่ใช่บั๊กของโค้ด ยืนยันด้วย `fetch(..., {cache:'no-store'})` ว่า server ส่งไฟล์ใหม่ถูกต้องตลอด
