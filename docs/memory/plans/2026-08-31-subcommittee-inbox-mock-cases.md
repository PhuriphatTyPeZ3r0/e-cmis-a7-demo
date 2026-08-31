# 📋 Task Plan: เพิ่มรายการตัวอย่าง (Mock Cases) ใน subcommittee-inbox.html สำหรับทดลองใช้งาน

> **Plan ID:** `2026-08-31-subcommittee-inbox-mock-cases`  
> **Date:** 2026-08-31  
> **Author / Agent:** Antigravity (Gemini)  
> **Status:** In Progress  
> **Branch / PR:** `main`  

---

## 🎯 1. Problem Statement & Business Objective
- **ปัญหา / ความต้องการ:** ปัจจุบันหน้า `subcommittee-inbox.html` คัดกรองสำนวนที่อยู่ในคิวกลั่นกรอง (`status === 'IN_SCREENING' || status === 'IN_SCREENING_72'`) ตามคณะที่เลือก (`subCommittee === selectedTeam`) แต่ในชุดข้อมูล `CASES` เดิมมีเพียง 2 สำนวนและผูกอยู่กับ คณะที่ 4 และ คณะที่ 5 เท่านั้น ส่งผลให้เมื่อผู้ใช้เปิดหน้าจอขึ้นมา (ซึ่งค่าเริ่มต้นคือ คณะที่ 1) ตารางคิวงานจะว่างเปล่า (0 รายการ) ไม่สามารถทดลองเล่นหรือทดสอบฟังก์ชันคัดกรอง, ค้นหา, ดูเอกสาร, ลงนาม และส่งมติต่อไปยังระเบียบวาระได้
- **วัตถุประสงค์:**
  1. เพิ่มรายการสำนวนตัวอย่าง (Mock Cases) ให้ครอบคลุมทั้งกิจกรรม 7.1 (ไต่สวนเบื้องต้น / รายงาน 213) และ 7.2 (วินิจฉัยชี้มูล / รายงาน RULING)
  2. ให้ "คณะที่ 1" (คณะเริ่มต้น) มีรายการตัวอย่างพร้อมใช้งานทันที (3 สำนวน: 7.1 ปกติ, 7.1 เตือน SLA, 7.2 ปกติ)
  3. เพิ่มสำนวนให้คณะอื่น ๆ (คณะที่ 2, 3, 4, 5, 6) เพื่อให้ทดสอบการสลับคณะที่แถบด้านบน (Team Switcher) ได้อย่างสมบูรณ์
  4. ปรับเวอร์ชัน `CASES_VERSION` เพื่อให้เบราว์เซอร์ล้างแคชเก่าใน `sessionStorage` และโหลดข้อมูลใหม่ทันที
  5. แก้ไขจุดบกพร่อง TDZ (`docTotalPages`) ใน `subcommittee-screening.html` และ `screening.html` เพื่อให้การกด "ดำเนินการ" เปิดหน้าจอพิจารณาเอกสารได้ราบรื่นโดยไม่เกิด console error

---

## 📐 2. Design Decisions
1. **โครงสร้างสำนวนตัวอย่าง:**
   - คณะที่ 1:
     - `1401/2569` (7.1 ไต่สวนเบื้องต้น / `IN_SCREENING`)
     - `1288/2566` (7.2 วินิจฉัยชี้มูล / `IN_SCREENING_72`)
     - `1405/2569` (7.1 ไต่สวนเบื้องต้น / `IN_SCREENING` / SLA เตือน 11/15 วัน)
   - คณะที่ 2: `1412/2569` (7.1) และ `1370/2566` (7.2)
   - คณะที่ 3: `1420/2569` (7.1)
   - คณะที่ 4: `1385/2566` (7.2 เพิ่มเติมควบคู่กับ 1330/2569 ที่มีอยู่เดิม)
   - คณะที่ 5: `1425/2569` (7.1 เพิ่มเติมควบคู่กับ 1233/2566 ที่มีอยู่เดิม)
   - คณะที่ 6: `1390/2566` (7.2)
2. **Cache Busting:**
   - ปรับ `CASES_VERSION = '2026-08-31-subcommittee-mock-v1'` ใน `assets/ecmis-app.js`
3. **Screening Pagination TDZ Fix:**
   - ย้ายการประกาศ `let docViewMode`, `let docCurrentPage`, `let docTotalPages`, `let docZoomLevel` มาอยู่ก่อนคำสั่ง `if (isRuling) { initScreening72(); } else { initScreening71(); }` ทั้งใน `subcommittee-screening.html` และ `screening.html` เพื่อป้องกัน `Cannot access 'docTotalPages' before initialization`
4. **Mirroring & CI Governance:**
   - รัน `npm run sync` เพื่ออัปเดตไฟล์ใน `res/`
   - รัน `npm test` เพื่อตรวจสอบ 5-layer CI ทั้งหมด

---

## 📂 3. Affected Files
- `assets/ecmis-app.js` (เพิ่ม mock cases ใน CASES array และปรับ CASES_VERSION)
- `subcommittee-screening.html` & `screening.html` (แก้ TDZ pagination variables)
- `res/subcommittee-screening.html` & `res/screening.html` (sync ผ่าน `npm run sync`)

---

## 🛡️ 4. The 6 Golden Rules Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ในตารางหลัก
- [x] 2. ไม่แตะสิทธิ์ `agenda-registry.html`
- [x] 3. ไม่เรียก Supabase โดยตรง (ผ่าน ECMIS layer ตามเดิม)
- [x] 4. รัน `npm run sync` หลังแก้ไข Root HTML
- [x] 5. ไม่แตะเรขาคณิต A4 ราชการ
- [x] 6. ไม่ใช้ `--no-verify` และผ่าน `npm test` 5/5 layers

---

## 📝 5. Step-by-Step Implementation Tasks
- [ ] **Task 1:** เพิ่ม mock cases ใน `assets/ecmis-app.js` และปรับ `CASES_VERSION`
- [ ] **Task 2:** แก้ไข TDZ pagination variables ใน `subcommittee-screening.html` และ `screening.html`
- [ ] **Task 3:** รัน `npm run sync` และ `npm test`
- [ ] **Task 4:** ตรวจสอบฟังก์ชันการทำงานของ `subcommittee-inbox.html` และ `subcommittee-screening.html`
- [ ] **Task 5:** Git commit และบันทึก External Obsidian Log ที่ `D:\Obsidain\Project\Activity 7\`
