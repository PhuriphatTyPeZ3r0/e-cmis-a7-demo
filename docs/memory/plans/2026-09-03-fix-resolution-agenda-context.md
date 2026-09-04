# Task Plan: เชื่อมหน้าบันทึกมติกับครั้งประชุมและวาระล่าสุด

> **Plan ID:** `2026-09-03-fix-resolution-agenda-context`  
> **Date:** 2026-09-03  
> **Author / Agent:** Codex  
> **Status:** Completed

## Problem

หน้าบันทึกมติเปิดสำนวน `0012/2565` จากวาระการประชุม 57/2569 แต่ยังแสดงข้อมูลเดิม 38/2569 วาระ 5.12 และรายชื่อกรรมการเดิม เพราะอ่านข้อมูลจาก case cache ก่อนทะเบียนวาระ

## Scope

- [x] หา meeting/agenda จาก `AgendaRegistry` ด้วย `case_ref`
- [x] เติมครั้งประชุม วันที่ และเลขวาระล่าสุดในหน้าบันทึกมติ
- [x] ให้ roster ของครั้งประชุม/override รายวาระมีลำดับเหนือ attendance เก่า
- [x] ครอบคลุม `resolution.html`, `board-resolution.html`, `resolution-72.html` และ `/res/`
- [x] เพิ่ม E2E regression test

## Anti-regression

- [x] ไม่แตะคอลัมน์ประเภทเรื่อง
- [x] ไม่เปลี่ยน RBAC ของ agenda registry
- [x] ใช้ Supabase singleton/data module เดิม
- [x] จะรัน sync
- [x] ไม่แก้ A4 geometry
- [x] ไม่ bypass hooks

## Verification

- [x] สำนวน 0012/2565 ที่เชื่อมวาระ 5.1 แสดง 57/2569 และวันที่ 10 ตุลาคม 2569
- [x] override รายวาระแสดงผู้ถูกตัดออกเป็น `recused`
- [x] `npm run sync` และ `npm test`
- [x] Playwright regression ผ่าน 2/2
