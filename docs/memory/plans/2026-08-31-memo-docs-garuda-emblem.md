# 📋 Task Plan: เพิ่มตราครุฑให้เอกสารบันทึกข้อความ 7.x ทั้ง 7 ฉบับ (Preview + DOCX)

> **Plan ID:** `2026-08-31-memo-docs-garuda-emblem`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** เอกสาร 7.x ทั้ง 7 ฉบับใน `order.html` (แจ้งเขต, ส่ง กบค., ขาดอายุความ, แจ้งโทษวินัย,
  เสนอไต่สวน, รายงานวินิจฉัยชี้มูล, ขาดอายุความ(เลขาฯ)) ไม่มีตราครุฑเลยสักฉบับ ทั้ง preview HTML และไฟล์
  `.docx` ที่ดาวน์โหลดได้ — ผิดมาตรฐานเอกสารราชการ
- **ข้อเท็จจริงสำคัญที่ตรวจพบ:** ไม่ต้องดาวน์โหลดรูปใหม่ — `assets/doc_logo.jpg` (648×720) มีอยู่แล้วและถูกใช้
  ซ้ำในหลายหน้า (order.html tab "เสนอลงนาม", chairman.html, ruling-report.html, meeting-docs.html ฯลฯ)

## 📐 Design Decisions (จาก grilling session กับผู้ใช้)
1. ทำครบทั้ง **preview HTML** (`assets/order-memo-docs.js` bodyHtml) **และไฟล์ `.docx`** ทั้ง 7 ไฟล์ใน
   `assets/templates/`
2. ใช้ style เดียวกับ convention ที่มีอยู่แล้วในระบบ — **พบว่า 7 เอกสารไม่ได้เป็น "บันทึกข้อความ" ทั้งหมด**
   จึงต้องแยก 3 กลุ่มตาม precedent ที่มีอยู่แล้วในระบบ (ไม่ใช่ใช้ style เดียวทื่อๆ ทั้ง 7):
   - **5 ฉบับที่เป็น "บันทึกข้อความ" จริง** (`notify_zone`, `transmit_kbc`, `timebar_report`, `submit_inquiry`,
     `timebar_secgen`) → มิเรอร์ `memoHead()` ใน `meeting-docs.html`: ครุฑมุมบนซ้าย `position:absolute`,
     สูง 52px, คู่กับ "บันทึกข้อความ"
   - **`notify_discipline`** เป็นหนังสือราชการภายนอก (ขึ้นต้นด้วย "ที่ ปป.../เรื่อง.../เรียน..." ไม่มีคำว่า
     "บันทึกข้อความ") → มิเรอร์ pattern "invite-pacc" ใน `meeting-docs.html`: ครุฑกึ่งกลางบนสุด ~60px
   - **`ruling_report`** เป็นรายงาน "รายงานการไต่สวนเพื่อวินิจฉัยชี้มูลของคณะกรรมการ ป.ป.ท." (ไม่มี "บันทึกข้อความ")
     → มิเรอร์ pattern `docTab === 'ruling'` ใน `ruling-report.html` ที่มีอยู่แล้ว (เอกสารประเภทเดียวกันเป๊ะ):
     ครุฑกึ่งกลาง 52px
   - เหตุผล: เป็นการนำหลักการที่ผู้ใช้อนุมัติ ("ให้เหมือนกับ convention ที่มีอยู่แล้วในระบบ") มาปรับใช้กับข้อเท็จจริง
     ที่พบเพิ่มเติม ไม่ใช่การตัดสินใจใหม่

---

## 📂 2. Affected Routes & Modules
- [x] Assets JS: `assets/order-memo-docs.js` (bodyHtml ทั้ง 7 บล็อก)
- [x] Assets DOCX: `assets/templates/memo-7x-*.docx` ทั้ง 7 ไฟล์ (ฝังรูปด้วยสคริปต์ python-docx แบบ one-off)
- [x] ไม่แตะ `order.html`/`res/order.html` โดยตรง (ใช้ bodyHtml ที่มีอยู่แล้ว render ผ่าน `renderPipelineMemoDoc()`)

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. ไม่แตะ Root HTML จึงไม่ต้อง sync (เฉพาะ `assets/`) — ยังรัน `npm run sync` เพื่อความชัวร์
- [x] 5. ไม่แตะ A4 margin/geometry (แก้แค่ header ภายใน bodyHtml)
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** เขียนสคริปต์ Node แก้ `bodyHtml` ของ 5 เอกสารบันทึกข้อความ (memoHead style) — one-off
      script ลบทิ้งหลังใช้งาน (`tools/_tmp_add_garuda*.js`)
- [x] **Task 2:** เขียนสคริปต์ Node แก้ `bodyHtml` ของ `notify_discipline` (centered style)
- [x] **Task 3:** เขียนสคริปต์ Node แก้ `bodyHtml` ของ `ruling_report` (centered style)
- [x] **Task 4:** เขียนสคริปต์ python-docx ฝัง `assets/doc_logo.jpg` เข้า header ของไฟล์ `.docx` ทั้ง 7 ไฟล์
      (one-off script ลบทิ้งหลังใช้งาน)
- [x] **Task 5:** `npm run sync` + `npm test`
- [x] **Task 6:** ทดสอบ UI จริงในเบราว์เซอร์ (สลับ 7 แท็บ ตรวจครุฑแสดงถูกต้องทุกแท็บ ไม่มี console error)
      + `unzip -l` ตรวจไฟล์ .docx ทั้ง 7 ไฟล์มี media/image1 ฝังอยู่จริง

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough (Claude in Chrome):** เปิด order.html?case=3027/2569 → คลิกทุกแท็บทั้ง 8
  (เสนอลงนาม + 7 ฉบับ) → ครุฑแสดงถูกตำแหน่งทุกแท็บ (5 ฉบับมุมบนซ้าย, 2 ฉบับ [แจ้งโทษวินัย/รายงานวินิจฉัยชี้มูล]
  กึ่งกลางบนสุด) → ไม่มี console error
- [x] **DOCX spot-check:** `unzip -l` ทั้ง 7 ไฟล์ — พบ media entry ครบทุกไฟล์
- [x] **Dual-Route Sync:** `npm run sync` (0 files synced — ถูกต้อง เพราะแก้แค่ `assets/` ไม่ใช่ root HTML)
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100% (0 errors, 0 warnings)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** ระหว่างทำพบว่า 2 ใน 7 เอกสาร (`notify_discipline`, `ruling_report`) ไม่ใช่
  "บันทึกข้อความ" ตามที่สันนิษฐานไว้ตอน grill รอบแรก แต่เป็นหนังสือราชการภายนอกและรายงานตามลำดับ — แก้ไขโดยใช้
  convention ที่ถูกต้องตามประเภทเอกสารจริง (อ้างอิงจาก `meeting-docs.html` "invite-pacc" และ `ruling-report.html`
  `docTab==='ruling'` ตามลำดับ) แทนที่จะบังคับใช้ style เดียวกันทื่อๆ ทั้ง 7 ฉบับ — เป็นการนำหลักการที่ผู้ใช้อนุมัติ
  (ใช้ convention ที่มีอยู่แล้วในระบบ) มาปรับใช้กับข้อเท็จจริงที่พบเพิ่มเติมระหว่างทำงาน
