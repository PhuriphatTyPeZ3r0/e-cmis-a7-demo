# 📋 Task Plan: Master Development Workflow Standard (`dev-workflow.md`)

> **Plan ID:** `2026-08-26-dev-workflow-standard`  
> **Date:** 2026-08-26  
> **Author / Agent:** Antigravity  
> **Status:** Completed  
> **Branch / PR:** `main`

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** จัดทำเอกสารมาตรฐานกลาง `dev-workflow.md` และโครงสร้างโฟลเดอร์ `docs/memory/` สำหรับทีมพัฒนาและ AI Agents ตามที่ระบุไว้ใน `CLAUDE.md` เพื่อควบคุมคุณภาพและป้องกัน Regression
- **ข้อกฎหมาย / มติที่เกี่ยวข้อง:** มาตรฐานสถาปัตยกรรม E-CMIS กิจกรรมที่ ๗, กฎเหล็ก 6 ข้อ (Anti-Regression Rules), และมาตรฐานเอกสารสารบรรณ ป.ป.ท.

---

## 📂 2. Affected Routes & Modules
- [x] Documentation Standard: `docs/memory/standards/dev-workflow.md`
- [x] Memory Plans: `docs/memory/plans/2026-08-26-dev-workflow-standard.md`
- [x] AI Context Reference: `CLAUDE.md`

---

## 🛡️ 3. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [x] 2. ไม่เปิดสิทธิ์ `agenda-registry.html` ให้ Chairman / Affairs
- [x] 3. เรียก Supabase ผ่าน `ECMIS.getSupabaseClient()` เท่านั้น
- [x] 4. มีการวางแผนรัน `npm run sync` หลังแก้ไข Root
- [x] 5. ควบคุมระยะขอบ A4 สารบรรณ `15mm 15mm 18mm 20mm`
- [x] 6. ไม่ใช้ `--no-verify` ในการ Commit

---

## 📝 4. Step-by-Step Implementation Tasks
- [x] **Task 1:** วิเคราะห์และดำเนินการสัมภาษณ์ Grilling Session ร่วมกับผู้ใช้เพื่อตกลงขอบเขตและโครงสร้าง Workflow
- [x] **Task 2:** สร้างไฟล์มาตรฐาน `docs/memory/standards/dev-workflow.md` กำหนดวงจร 4 เฟส (Plan → Implement → Sync & Test → Commit)
- [x] **Task 3:** ตรวจสอบและปรับปรุงการอ้างอิง Path ใน `CLAUDE.md` ให้สอดคล้องกับตำแหน่งไฟล์
- [x] **Task 4:** รันชุดตรวจสอบ `npm run sync` และ `npm test` 5 ด่าน

---

## 🧪 5. Verification & Quality Gate Matrix
- [x] **Documentation Integrity:** ไฟล์ Markdown มีโครงสร้างชัดเจน อ่านง่าย รองรับ Mermaid diagrams
- [x] **Dual-Route Sync:** รัน `npm run sync` เรียบร้อย (32 paired routes)
- [x] **Enterprise CI (5-Layer):** รัน `npm test` ผ่าน 100% (0 errors, 0 warnings)
- [x] **Anti-Regression Governance:** กฎเหล็ก 6 ข้อผ่านการตรวจสอบสมบูรณ์

---

## 🏁 6. Completion & Sign-off
- **Completed Date:** 2026-08-26
- **Commit Reference:** `docs(workflow): establish dev-workflow master standard and memory plans`
- **Notes / Retrospective:** มาตรฐาน Master Workflow พร้อมใช้งานสำหรับทีมพัฒนาและ AI agents ทุกตัว
