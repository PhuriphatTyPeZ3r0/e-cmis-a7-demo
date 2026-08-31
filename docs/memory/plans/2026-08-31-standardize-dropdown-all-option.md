# 📋 Task Plan: มาตรฐานคำว่า "ทั้งหมด" ใน Dropdown ตัวกรองทั่วทั้งระบบ

> **Plan ID:** `2026-08-31-standardize-dropdown-all-option`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement
- ตัวเลือก "ทั้งหมด" ใน dropdown ตัวกรอง (filter) ทั่วทั้งระบบใช้คำไม่เหมือนกัน — บางที่ "ทั้งหมด" เปล่าๆ
  บางที่ "ทุกประเภทเรื่อง"/"ทุกสถานะการประชุม"/"— ทุกหมวดหมู่ —" ฯลฯ

## 📐 Design Decisions (จาก grilling session)
1. มาตรฐาน = คำว่า **"ทั้งหมด"** เปล่าๆ ไม่มีข้อมูลเสริม/วงเล็บต่อท้าย (แม้บางที่จะมีข้อมูลเสริมที่มีประโยชน์
   เช่น "(7.1 + 7.2)" ก็ตัดออก)
2. รูปแบบครอบขีดหน้า-หลัง (`— ทั้งหมด —`) ที่ case-register.html/register.html ใช้อยู่ — เอาขีดออกด้วย
   ให้เป็น "ทั้งหมด" เปล่าเหมือนหน้าอื่น
3. **นอกขอบเขต**: dropdown "โหมดดูข้อมูล" ใน agenda-detail.html/agenda-registry-detail.html
   ("📋 ทะเบียนคุมวาระรวมทุกครั้ง (Master View)") ไม่ใช่ filter ทั่วไป เป็นตัวเลือกโหมด ไม่นับ ไม่แก้

---

## 📂 2. Affected Routes & Modules (พบระหว่างสำรวจทั้งระบบ)
- [x] `inbox.html` — "ทุกประเภทเรื่อง" → "ทั้งหมด"
- [x] `agenda-detail.html` — "— ทุกหมวดหมู่ —" → "ทั้งหมด"
- [x] `agenda-registry-detail.html` — "— ทุกหมวดหมู่ —" → "ทั้งหมด"
- [x] `board-detail.html` — "ทุกระเบียบวาระ (วาระ ๑ ถึง ๖)" → "ทั้งหมด"
- [x] `board-inbox.html` — "ทุกสถานะการประชุม" → "ทั้งหมด"
- [x] `case-register.html` — 4 จุด: "— ทุกสำนัก/กอง/เขต —", "— ทุกประเภทสารบบ —", "— ทั้งหมด —",
  "— ทุกสถานะ —" → "ทั้งหมด" ทุกจุด
- [x] `register.html` — เหมือน case-register.html ทุกจุด
- [x] `dashboard.html` — 2 จุด: "-- ภาพรวมทั้งปีงบประมาณ 2568 --", "ทุกคณะอนุกรรมการ / ภาพรวมทั้งหมด" →
  "ทั้งหมด"
- [x] `followup-dashboard.html` — "ทั้งหมด (ทุกประเภทมติ)" → "ทั้งหมด"
- [x] `subcommittee-inbox.html` — "ทั้งหมด (7.1 + 7.2)" → "ทั้งหมด"
- [x] ตรวจแล้วว่าไม่ต้องแก้: `resolution-inbox.html`, `support-subcommittee-inbox.html` (เป็น "ทั้งหมด"
  เปล่าอยู่แล้ว), เมนู "— เลือก... —" ทุกหน้า (เป็น placeholder ไม่ใช่ตัวกรอง "ทั้งหมด")

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง"
- [x] 2. ไม่เปิดสิทธิ์ agenda-registry.html ให้ Chairman/Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. วางแผนรัน `npm run sync`
- [x] 5. ไม่แตะ A4 margin/geometry
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] แก้ทุกไฟล์ในรายการข้างต้น (แก้เฉพาะ display text ของ `<option>`, ไม่แตะ `value` attribute)
- [x] `npm run sync` + `npm test`
- [x] ทดสอบ UI จริงในเบราว์เซอร์ — สุ่มตรวจหลายหน้า ยืนยันคำว่า "ทั้งหมด" ขึ้นตรงกันและ filter ยังทำงานถูกต้อง

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] Manual UI Walkthrough
- [x] Dual-Route Sync
- [x] Enterprise CI (5-Layer)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** ระหว่างสำรวจพบเพิ่มอีก 1 จุดที่ไม่อยู่ใน grill รอบแรก — `dashboard.html` มี
  dropdown "รอบเดือนสถิติ" ที่มีตัวเลือก "-- ภาพรวมทั้งปีงบประมาณ 2568 --" ด้วย ถือว่าอยู่ในหมวดเดียวกัน
  (ตัวเลือก "ทั้งหมด" ของ dropdown) จึงแก้ไปพร้อมกันตามมาตรฐานเดียวกัน — ยืนยันด้วย
  `fetch(url,{cache:'no-store'})` ทุกไฟล์ว่าไม่มีข้อความเก่าเหลือ, ทดสอบ UI จริง 2 หน้า (inbox.html,
  case-register.html) ไม่มี console error
