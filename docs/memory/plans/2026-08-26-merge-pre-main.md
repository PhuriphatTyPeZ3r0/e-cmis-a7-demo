# 📋 Task Plan: Merge `pre-main` branch into `main`

> **Plan ID:** `2026-08-26-merge-pre-main`  
> **Date:** 2026-08-26  
> **Author / Agent:** Antigravity  
> **Status:** In Progress  
> **Branch / PR:** `pre-main` -> `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** ผสานงานจากสาขา `pre-main` (การปรับปรุง Board Portal, `board-inbox.html`, `board-detail.html`, Private Notes, A4 print layout, 2-tier toolbar) เข้าสู่ `main` ที่มี Supabase Persistence และ Integration Tests
- **ข้อกฎหมาย / มติที่เกี่ยวข้อง:** ระบบบันทึกมติและรายงานวินิจฉัยชี้มูล คณะกรรมการ ป.ป.ท. (ม.๗๒, ม.๒๔)

---

## 📂 2. Affected Routes & Modules
- [ ] New Page: `board-detail.html` & `res/board-detail.html`
- [ ] Modified Pages: `board-inbox.html`, `res/board-inbox.html`, `ruling-report.html`, `res/ruling-report.html`
- [ ] Shared Assets: `assets/ecmis-app.js`, `assets/ecmis-app.css`, `assets/a4-ecmis-workspace.css`
- [ ] Memory & Docs: `docs/memory/plans/2026-08-26-merge-pre-main.md`

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [ ] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [ ] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [ ] 3. เรียก Supabase ผ่าน `ECMIS.getSupabaseClient()` เท่านั้น
- [ ] 4. มีการวางแผนรัน `npm run sync` เพื่อสร้าง `res/board-detail.html`
- [ ] 5. ควบคุมระยะขอบ A4 สารบรรณ `15mm 15mm 18mm 20mm` และท้ายกระดาษลับ `8mm`
- [ ] 6. ไม่ใช้ `--no-verify` ในการ Commit

---

## 📝 4. Step-by-Step Implementation Tasks
- [ ] **Task 1:** เริ่มต้นสั่ง `git merge pre-main` บนสาขา `main`
- [ ] **Task 2:** Resolve Conflict ใน `ruling-report.html` (ผสาน 2-tier toolbar + Private Notes UI กับ Supabase signing persistence)
- [ ] **Task 3:** รัน `npm run sync` เพื่อ mirror `board-detail.html` และ `ruling-report.html` ไปยัง `/res/`
- [ ] **Task 4:** รัน `npm test` เพื่อตรวจสอบ 5 ด่าน CI
- [ ] **Task 5:** รัน `npm run test:integration` เพื่อยืนยันว่าระบบ Persistence ยังคงทำงานได้สมบูรณ์
- [ ] **Task 6:** ทำการ Git Commit การ Merge และอัปเดตไฟล์ Plan เป็น `Completed`

---

## 🧪 5. Verification & Quality Gate Matrix
- [ ] **Dual-Route Sync:** รัน `npm run sync` ครบ 33 paired routes
- [ ] **Enterprise CI (5-Layer):** รัน `npm test` ผ่าน 100% (0 errors, 0 warnings)
- [ ] **Integration Test:** รัน `npm run test:integration` ผ่าน 100%
- [ ] **Anti-Regression Governance:** กฎเหล็ก 6 ข้อผ่านการตรวจสอบสมบูรณ์

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** [Pending]
- **Commit Reference:** [Pending]
- **Notes / Retrospective:** [Pending]
