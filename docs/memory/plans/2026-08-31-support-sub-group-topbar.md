# 📋 Task Plan: ย้าย Dropdown เลือกกลุ่มของอนุสนับสนุนฯ ขึ้น Topbar

> **Plan ID:** `2026-08-31-support-sub-group-topbar`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** `support-subcommittee-inbox.html` มี dropdown "กลุ่มงานที่รับผิดชอบ" อยู่ใน
  page-head ของหน้านั้นเอง (AJAX, จำค่า 3 ชั้น: URL param + sessionStorage + localStorage) ต่างจาก dropdown
  "คณะที่" ของ role `subcommittee` ที่เพิ่งเพิ่มไป ซึ่งอยู่ใน topbar ของระบบ (sessionStorage-only + reload)
  ต้องการให้ทั้งสองรูปแบบเหมือนกันทุกประการเพื่อความสอดคล้องของ UX ทั้งระบบ

## 📐 Design Decisions (จาก grilling session กับผู้ใช้)
1. ย้าย dropdown ขึ้น topbar (ผ่าน `renderShell`) แสดงเมื่อ `role.id === 'support_sub'`
   (ครอบคลุม `sup_chair`/`sup_sec`/`sup_asst` โดยอัตโนมัติ เพราะ `getRole()` ของ id เหล่านี้ resolve กลับไปเป็น
   role object เดียวกับ `support_sub` อยู่แล้ว — ไม่ต้องเพิ่มเงื่อนไขแยก)
2. เปลี่ยนพฤติกรรมเป็น sessionStorage-only + full page reload เมื่อเปลี่ยนค่า (เหมือน `setSubTeam`)
   เลิกใช้ localStorage และ URL query param `?group=` ทั้งหมด (รวมถึงใน `support-subcommittee.html` ที่เคย
   อ่าน `groupParam` ด้วย)
3. ลบ dropdown เดิมออกจาก page-head ของ `support-subcommittee-inbox.html`

---

## 📂 2. Affected Routes & Modules
- [x] Root HTML (แก้ไข): `support-subcommittee-inbox.html`, `support-subcommittee.html`
- [x] Mirror HTML (แก้ไข ผ่าน `npm run sync`): `res/support-subcommittee-inbox.html`, `res/support-subcommittee.html`
- [x] Assets JS: `assets/ecmis-app.js` (SUPPORT_GROUPS, currentSupportGroup/setSupportGroup helper + topbar UI)

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. วางแผนรัน `npm run sync` หลังแก้ไข Root
- [x] 5. ไม่แตะ A4 margin/geometry
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** เพิ่ม `SUPPORT_GROUPS`, `currentSupportGroup()`, `setSupportGroup()` ใน `ecmis-app.js`
  (มิเรอร์ `SUBCOMMITTEE_TEAMS`/`currentSubTeam`/`setSubTeam`) + export
- [x] **Task 2:** เพิ่ม dropdown UI ใน topbar (`renderShell`) แสดงเมื่อ `role.id === 'support_sub'`
- [x] **Task 3:** ลบ dropdown เดิมออกจาก page-head ของ `support-subcommittee-inbox.html`, ปรับสคริปต์ให้ใช้
  `ECMIS.currentSupportGroup()` แทน `selectedGroup` local state, ลบ URL/localStorage handling,
  ลบ `$('#scopeGroupSelect')` event bindings และ `pageshow` URL-sync listener
- [x] **Task 4:** แก้ `support-subcommittee.html` — ใช้ `ECMIS.currentSupportGroup()` แทน `groupParam`/
  `currentGroup` เดิม, `returnInboxUrl` ตัด query string ออก
- [x] **Task 5:** `npm run sync` + `npm test`

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough (Claude in Chrome):** login เป็น support_sub → เห็น dropdown "กลุ่มงานที่:"
  ที่ topbar (ไม่มีในหน้าเนื้อหาแล้ว) → สลับเป็นกลุ่ม 2 → reload → รายการ/KPI/label กรองตามกลุ่มถูกต้อง →
  เปิดเคส (ลิงก์ไม่มี `?group=` แล้ว) → หน้ารายละเอียดอ่านกลุ่มจาก `ECMIS.currentSupportGroup()` ถูกต้อง →
  ปุ่มกลับ inbox ไม่มี query string ค้าง → ไม่มี console error
- [x] **Dual-Route Sync:** `npm run sync` ผ่าน
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100% (0 errors, 0 warnings)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** ไม่พบปัญหาเพิ่มเติมระหว่างทำ — งานนี้เป็น mirror ของ pattern ที่วางไว้แล้วจาก
  role `subcommittee` (แผนวันเดียวกัน `2026-08-31-subcommittee-role.md`) ทำให้ implement ได้รวดเร็วและ
  ทดสอบผ่านในรอบเดียว
