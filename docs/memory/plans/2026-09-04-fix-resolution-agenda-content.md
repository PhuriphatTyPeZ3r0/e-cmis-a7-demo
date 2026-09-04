# Task Plan: ดึงหัวเรื่องและรายละเอียดวาระเข้าหน้าบันทึกมติ

> **Plan ID:** `2026-09-04-fix-resolution-agenda-content`  
> **Date:** 2026-09-04  
> **Author / Agent:** Codex  
> **Status:** Completed

## Problem

หน้าบันทึกมติใช้หัวเรื่องและรายละเอียดจากข้อมูลสำนวนโดยตรง แม้ระบบจะค้นพบครั้งประชุมและเลขวาระที่เชื่อมกับสำนวนแล้ว ทำให้ข้อมูลที่ผู้ใช้เห็นไม่ตรงกับรายการวาระล่าสุด

## Scope

- [x] เพิ่มหัวเรื่องและรายละเอียดวาระใน agenda context กลาง
- [x] เติมข้อมูลดังกล่าวอัตโนมัติใน `board-resolution.html`, route เดิม `resolution.html` และ `resolution-72.html`
- [x] ใช้ข้อมูลเดียวกันในเอกสารพรีวิวและ DOCX
- [x] ซิงค์ไฟล์ `/res/` และเพิ่ม regression test

## Anti-regression

- [x] ไม่แตะคอลัมน์ประเภทเรื่อง
- [x] ไม่เปลี่ยน RBAC ของ agenda registry
- [x] ใช้ Supabase singleton/data module เดิม
- [x] วางแผนรัน `npm run sync`
- [x] ไม่แก้ A4 geometry
- [x] ไม่ bypass hooks

## Verification

- [x] สำนวนที่เชื่อมวาระแสดง `trci_topic` เป็นหัวเรื่องโดยอัตโนมัติ
- [x] แสดงรายละเอียดจาก `trci_detail`/`trci_description`/`remark` โดยอัตโนมัติ
- [x] `npm run sync` และ `npm test` ผ่าน
- [x] Playwright regression test ผ่าน (3/3)
- [x] Supabase integration test ผ่าน (60/60)
