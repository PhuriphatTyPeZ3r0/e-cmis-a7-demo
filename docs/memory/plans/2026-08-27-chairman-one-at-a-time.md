# 📋 Task Plan: บังคับให้ประธานกรรมการ ป.ป.ท. พิจารณาสั่งการทีละรายการจากหน้ารายการ (inbox.html)

> **Plan ID:** `2026-08-27-chairman-one-at-a-time`
> **Date:** 2026-08-27
> **Author / Agent:** Claude
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา:** `inbox.html` แสดง checkbox + ปุ่ม "สั่งการรายการที่เลือก (Bulk Action)" ให้บทบาท
  `chairman` เลือกหลายสำนวนพร้อมกันแล้วกดสั่งการทีเดียว โดย `transitionMap['PENDING_CHAIRMAN']`
  เปลี่ยนสถานะตรงไปเป็น `IN_SCREENING` — ข้ามหน้า `chairman-agenda.html` ทั้งหมด (ไม่มีการอ่านเอกสาร
  A4, ไม่มีข้อสั่งการ, ไม่มีการลงนามดิจิทัล 2-Step) และสถานะปลายทางยังไม่ตรงกับที่
  `chairman-agenda.html` ใช้จริง (`AGENDA_SET` / `PENDING_INVITE_72`) ทำให้ข้อมูลสถานะไม่สอดคล้องกัน
- **ความต้องการ:** ประธานกรรมการ ป.ป.ท. ต้องพิจารณาสั่งการ/ลงนามสำนวนทีละรายการเท่านั้น โดยเปิดจาก
  หน้ารายการ (`inbox.html`) ไปยังหน้าเอกสารเฉพาะเรื่อง (`chairman-agenda.html`, `order.html`,
  `ruling-report.html`, `urgent-agenda.html` ตามประเภทสถานะ) — ห้ามมีทางลัด Bulk Action สำหรับ
  บทบาทนี้ เช่นเดียวกับที่ `affairs` ถูกปิด Bulk ไปแล้ว (ดูคอมเมนต์บรรทัด 698-700 เดิม)

---

## 📂 2. Affected Routes & Modules
- [x] Root HTML: `inbox.html`
- [x] Mirror HTML: `res/inbox.html` (ผ่าน `npm run sync`)

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" — ยังคง 7 คอลัมน์เท่าเดิม แก้เฉพาะเนื้อหาคอลัมน์ checkbox
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman/Affairs — ไม่แตะส่วนนี้
- [x] 3. ไม่มีการเรียก Supabase เพิ่ม
- [x] 4. วางแผนรัน `npm run sync` หลังแก้ Root
- [x] 5. ไม่แตะ A4 layout
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** ใน `row()` สำหรับ `role.id === 'chairman'` เปลี่ยนคอลัมน์ checkbox ให้แสดงไอคอนล็อก
      เสมอ (ไม่แสดง `<input class="case-chk">` อีกต่อไป) พร้อม title อธิบายเหตุผล
- [x] **Task 2:** ซ่อน master checkbox (`#chkAll`) สำหรับบทบาท chairman เพราะไม่มี checkbox ย่อยให้ติ๊ก
- [x] **Task 3:** ลบ entry `'PENDING_CHAIRMAN'` ออกจาก `transitionMap` ใน bulk-approve handler (dead
      path ที่ไม่ควรเข้าถึงได้อีก และสถานะปลายทางผิดอยู่แล้ว)
- [x] **Task 4:** รัน `npm run sync` + `npm test`

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough:** เปิด inbox.html จริงในเบราว์เซอร์ (http-server ชั่วคราว) ด้วยบทบาท
      chairman — ยืนยันคอลัมน์แรกเป็นไอคอนล็อกทุกแถว ไม่มีแถบ Bulk Action ที่ท้ายตาราง และปุ่ม
      "พิจารณาสั่งการ" พาไปหน้า `chairman-agenda.html?case=<เลขสำนวน>` ของเรื่องนั้นเรื่องเดียวถูกต้อง
- [x] **Dual-Route Sync:** รัน `npm run sync` เรียบร้อย (synced res/inbox.html)
- [x] **Enterprise CI (5-Layer):** รัน `npm test` ผ่าน 100% (0 errors, 0 warnings)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-27
- **Commit Reference:** (ดู git log ถัดจากไฟล์นี้)
