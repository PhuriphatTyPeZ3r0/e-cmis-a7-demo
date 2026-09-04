# Task Plan: แก้ฟังก์ชันล็อกรายชื่อกรรมการในหน้าจัดระเบียบวาระการประชุม

> **Plan ID:** `2026-09-03-fix-meeting-agenda-board-roster-lock`  
> **Date:** 2026-09-03  
> **Author / Agent:** Codex  
> **Status:** Completed  
> **Branch / PR:** `main`

## 1. Problem Statement & Business Objective

- ฟังก์ชันล็อกรายชื่อกรรมการเดิมอยู่ใน modal เพิ่มการประชุม จึงไม่ปรากฏในหน้าจัดระเบียบวาระการประชุมที่ผู้ใช้ทำงานจริง
- ต้องเลือกชุดกรรมการเข้าประชุมครั้งเดียวแล้วใช้กับทุกวาระ และปลดล็อกบางวาระเพื่อกันกรรมการผู้มีส่วนได้เสียได้

## 2. Affected Routes & Modules

- [x] `meeting-docs.html` และ alias `agenda-meeting-docs.html`
- [x] `resolution.html`, `resolution-72.html`, `board-resolution.html` สำหรับอ่านรายชื่อกลาง/ข้อยกเว้นรายวาระ
- [x] `/res/` mirror จาก `npm run sync`
- [x] `tests-e2e/meeting-roster-lock.spec.js`

## 3. The 6 Golden Anti-Regression Pre-Check

- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง"
- [x] 2. ไม่เปลี่ยนสิทธิ์ `agenda-registry.html`
- [x] 3. ไม่เรียก Supabase client โดยตรงเพิ่ม
- [x] 4. จะรัน `npm run sync` หลังแก้ Root
- [x] 5. ไม่แก้ A4 geometry
- [x] 6. ไม่ใช้ `--no-verify`

## 4. Implementation Tasks

- [x] เพิ่ม UI ล็อกชุดกรรมการกลางในหน้าจัดระเบียบวาระ
- [x] เพิ่มการปลดล็อกและเลือกกรรมการเฉพาะวาระ
- [x] บันทึก state แบบ meeting-scoped ใน localStorage และรองรับข้อมูลเดิม
- [x] ให้หน้าบันทึกมติใช้ override ของสำนวนก่อน roster กลาง
- [x] เพิ่ม automated test, sync และรัน quality gates

## 5. Verification

- [x] ล็อกชุดกลางแล้วทุกวาระแสดงจำนวน/รายชื่อเดียวกัน
- [x] ปลดล็อกหนึ่งวาระแล้วแก้ได้โดยไม่กระทบวาระอื่น
- [x] เปิดหน้าบันทึกมติแล้วใช้ override ของวาระนั้น
- [x] `npm run sync`
- [x] `npm test`
- [x] `npx playwright test tests-e2e/meeting-roster-lock.spec.js`

## 6. Completion & Sign-off

- **Completed Date:** 2026-09-03
- **Commit Reference:** -
- **Notes:** Enterprise CI ผ่าน 5/5 และ Playwright ผ่าน 1/1; ยังไม่ได้ commit ตามขอบเขตคำขอ
