# Task Plan: ส่งข้อมูลมติบอร์ดไปแบบฟอร์ม ม.24 และรายงาน ม.72

> **Plan ID:** `2026-09-04-fix-board-data-to-m24-ruling`  
> **Date:** 2026-09-04  
> **Author / Agent:** Codex  
> **Status:** Completed

## Problem

หน้าแบบฟอร์มปลายทางยังอาศัยข้อมูลสำนวนหรือค่าเริ่มต้นทั่วไป ทำให้พฤติการณ์ ฐานความผิด รายชื่อ และสถานะรายผู้ถูกกล่าวหาไม่ตรงกับมติบอร์ดล่าสุด อีกทั้งข้อความรายบุคคลที่เจ้าหน้าที่ปรับแต่งยังไม่ถูกบันทึกกลับฐานข้อมูลสำหรับขั้นตอนลงนาม

## Scope

- [x] บันทึก snapshot พฤติการณ์ ฐานความผิด รายชื่อ และสถานะรายบุคคลในมติบอร์ด 7.1/7.2
- [x] เติมข้อมูลจาก snapshot ลงหน้าแบบฟอร์มคำสั่ง ม.24 โดยยังแก้ไขได้
- [x] เติมและแก้ไขข้อความรายผู้ถูกกล่าวหาในรายงานชี้มูล ม.72 ตามสถานะ
- [x] persist ฉบับร่างรายงานกลับ `trr_resolution_data`
- [x] ซิงค์ `/res/` และเพิ่ม E2E regression coverage

## Anti-regression

- [x] ไม่แตะคอลัมน์ประเภทเรื่อง
- [x] ไม่เปลี่ยน RBAC ของ agenda registry
- [x] ใช้ Supabase singleton เดิม
- [x] วางแผนรัน `npm run sync`
- [x] ไม่แก้ A4 geometry
- [x] ไม่ bypass hooks

## Verification

- [x] มติบอร์ดเก็บข้อมูลรายบุคคลและสถานะกันเป็นพยาน
- [x] ม.24 แสดงรายชื่อ/พฤติการณ์/ฐานความผิดจากมติและแก้ไขได้
- [x] ม.72 แสดงข้อความรายบุคคลตามสถานะและนำไปสร้างเอกสาร
- [x] ฉบับร่างรายงาน round-trip ผ่าน Supabase
- [x] CI, Playwright และ integration tests ผ่าน

## Verification results

- `npm test` — ผ่าน 5/5 หมวด, 0 errors, 0 warnings
- Playwright E2E — Flow 7.1 ผ่าน 1/1 และ Flow 7.2 ผ่าน 2/2
- `npm run test:integration` — ผ่าน 60/60 assertions
- `npm run sync` — root และ `/res/` ตรงกันครบ 35 routes
- `git diff --check` — ผ่าน
