# 📋 Task Plan: เพิ่ม Role "คณะอนุกลั่นกรองฯ" (subcommittee)

> **Plan ID:** `2026-08-31-subcommittee-role`
> **Date:** 2026-08-31
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** หน้า `subcommittee-screening.html` (และ alias `screening.html`) มีอยู่แล้วในระบบ
  แต่ `PAGE_PERMISSIONS` อ้างอิง role `subcommittee`, `subcom_1`...`subcom_8` ที่**ไม่เคยถูกประกาศจริง**ใน `ROLES`
  array เลย — จึงไม่มีทางที่ผู้ใช้จะ login เข้าถึงหน้าจอนี้ได้ในฐานะอนุกลั่นกรอง ต้องการเพิ่ม role จริง พร้อมหน้า
  รายการ (inbox) ของตัวเอง โดยเห็นเฉพาะสำนวนที่ถูกกระจายมาให้คณะของตน
- **ข้อกฎหมาย / มติที่เกี่ยวข้อง:** FR-LAW018 (RBAC แยกตามตำแหน่ง เข้าถึงได้เฉพาะข้อมูลในขอบเขตหน้าที่ — อ้างอิง
  NotebookLM E-CMIS) — คณะอนุกรรมการกลั่นกรองชุดที่ 1-8 พิจารณาสำนวนเบื้องต้น (7.1) และวินิจฉัยชี้มูล (7.2)
  ก่อนส่งกลับประธานเพื่อบรรจุวาระ

## 📐 Design Decisions (จาก grilling session กับผู้ใช้)
1. **Role เดียว `subcommittee`** ไม่แยก role ต่อคณะ — สลับดูคณะ 1-8 ผ่าน dropdown ที่ topbar
   (ค่าที่เลือกเก็บใน `sessionStorage`, ไม่ผูกกับ role id)
2. **หน้ารายการใหม่ `subcommittee-inbox.html`** (+ `res/` mirror) ลอกโครงจาก `support-subcommittee-inbox.html`
   filter ด้วย `case.subCommittee === คณะที่เลือก`, ครอบคลุมทั้งสถานะ `IN_SCREENING` (7.1) และ `IN_SCREENING_72` (7.2)
3. **ซ่อน card "การกระจายสำนวนเข้าคณะ (Auto Routing / Manual Assign)"** ทั้งหมดใน `subcommittee-screening.html`
   และ `screening.html` (ไฟล์เนื้อหาเหมือนกันทุกตัวอักษร ต้องแก้คู่กัน) เมื่อ current role คือ `subcommittee`
   — งานนี้เป็นของ ผอ.กบค. (affairs/board_sec) เท่านั้น role อื่นเดิมยังเห็น card ตามปกติ
4. **Login**: เพิ่ม `subcommittee` เข้า `ROLES`, `LOGIN_ALLOWED_ROLE_IDS`, ปุ่ม quick-login ที่ `login.html`,
   `homeHref('subcommittee')` → `subcommittee-inbox.html`
5. **Cleanup**: ลบ dead references `subcom_1`...`subcom_8` ออกจาก `PAGE_PERMISSIONS` แทนที่ด้วย `subcommittee`

---

## 📂 2. Affected Routes & Modules
- [x] Root HTML (ใหม่): `subcommittee-inbox.html`
- [x] Mirror HTML (ใหม่): `res/subcommittee-inbox.html`
- [x] Root HTML (แก้ไข): `login.html`, `subcommittee-screening.html`, `screening.html`
- [x] Mirror HTML (แก้ไข ผ่าน `npm run sync`): `res/login.html`, `res/subcommittee-screening.html`, `res/screening.html`
- [x] Assets JS: `assets/ecmis-app.js` (ROLES, PAGE_PERMISSIONS, LOGIN_ALLOWED_ROLE_IDS, homeHref, team-switcher helper)

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก (ไม่แตะ inbox.html/resolution-inbox.html)
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs (ไม่แตะ)
- [x] 3. ไม่เรียก Supabase โดยตรง
- [x] 4. วางแผนรัน `npm run sync` หลังแก้ไข Root
- [x] 5. ไม่แตะ A4 margin/geometry
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** เพิ่ม role `subcommittee` ใน `ROLES` array (`assets/ecmis-app.js`)
- [x] **Task 2:** แก้ `PAGE_PERMISSIONS` — ลบ `subcom_1..8`, ใส่ `subcommittee` ในหน้าที่เกี่ยวข้อง, เพิ่ม
  `subcommittee-inbox.html` entry
- [x] **Task 3:** เพิ่ม `subcommittee` ใน `LOGIN_ALLOWED_ROLE_IDS`, แก้ `homeHref()` ให้ชี้ไป
  `subcommittee-inbox.html`
- [x] **Task 4:** เพิ่ม team-switcher helper (`currentSubTeam()`/`setSubTeam()`) + dropdown UI ที่ topbar
  (แสดงเฉพาะเมื่อ role === 'subcommittee')
- [x] **Task 5:** สร้าง `subcommittee-inbox.html` ใหม่ (ลอกโครง support-subcommittee-inbox.html) filter ตาม
  `subCommittee` + สถานะ IN_SCREENING/IN_SCREENING_72
- [x] **Task 6:** ซ่อน Auto-Routing/Manual-Assign card ใน `subcommittee-screening.html` และ `screening.html`
  เมื่อ role === 'subcommittee' (ใช้ `d-none` แทนการลบ DOM — พบระหว่างทดสอบว่า `initScreening71/72` ยังเขียนลง
  `#quotaGrid`/`#assignedTeam`/`#manualTeam` ภายในการ์ดนี้อยู่ ลบ DOM ตรงๆ ทำให้เกิด `TypeError` ตอน renderDoc)
- [x] **Task 7:** เพิ่มปุ่ม quick-login ใน `login.html`
- [x] **Task 8:** `npm run sync` + `npm test`

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Manual UI Walkthrough (Claude in Chrome):** login เป็น subcommittee (Sumet.N) → landed บน
  `subcommittee-inbox.html` (คณะที่ 1, ว่าง) → สลับเป็นคณะที่ 4 → เห็นสำนวน 1330/2569 → กด "ดำเนินการ" →
  เปิด `subcommittee-screening.html` โดยไม่เห็น Auto-Routing card → บันทึกมติ/เอกสาร preview render ปกติ
  → ตรวจ role อื่น (affairs) ยังเห็น Auto-Routing card ตามปกติ ไม่กระทบ
- [x] **Dual-Route Sync:** `npm run sync` ผ่าน
- [x] **Enterprise CI (5-Layer):** `npm test` ผ่าน 100% (0 errors, 0 warnings)

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-31
- **Commit Reference:** (ตามที่จะ commit หลัง plan นี้)
- **Notes / Retrospective:** พบ pre-existing bug ที่ไม่เกี่ยวข้อง — `updatePaginationUI` throw
  `ReferenceError: Cannot access 'docTotalPages' before initialization` บน renderDoc ครั้งแรกของทุก role
  (reproduce ได้แม้กับ role `affairs` เดิม) หน้าจอยังทำงานได้ปกติ ไม่ได้แก้ในรอบนี้เพราะอยู่นอกขอบเขตงาน
