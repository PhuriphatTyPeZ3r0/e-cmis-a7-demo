# 📋 Task Plan: แก้ไขหน้าจอตามรายการ "ยังไม่ได้ทำ" ในชีตติดตามงาน (Batch 1)

> **Plan ID:** `2026-09-01-screen-fixes-batch-sheet-status`
> **Date:** 2026-09-01
> **Author / Agent:** Claude Code
> **Status:** Completed
> **Branch / PR:** `main`
> **Source:** Google Sheet "กิจกรรมที่ 7" (แท็บ "หน้าจอกิจกรรมที่ 7"), แถวสถานะ = "ยังไม่ได้ทำ"

---

## 🎯 1. Problem Statement
ชีตติดตามงานกลางมี 10 รายการที่สถานะยังไม่เสร็จ (ลำดับ 46, 47, 48, 49, 51, 52, 54, 55, 56, 57)
ข้อ 54 และ 57 ทำเสร็จไปแล้วในเซสชันก่อนหน้า (commit `a939a41`, `176c105` — ตัดตรา "ลับ" หัว-ท้าย
+ เพิ่มคำเชื่อมมุมขวาล่าง) แผนนี้ครอบคลุม **6 ข้อที่เหลือซึ่งตกลงสโคปแล้วจาก grilling session**
(ข้อ 48 และ 56 เลื่อนออกเป็นงานถัดไป — ข้อ 48 เพราะเป็นงาน CRUD ใหญ่แยกต่างหาก, ข้อ 56 ยังไม่ได้ grill)

## 📐 2. Design Decisions (จาก grilling session)
1. **ข้อ 55** (order.html/order-m24.html): หัวกระดาษ 'ประพฤติมิชอบ' แสดงเมื่อ `kase.legalBase`
   ขึ้นต้นด้วย `"ม.18"` เท่านั้น (ครอบคลุม ม.18/4, ม.18/1) — ม.62, ม.33, ระเบียบฯ ไม่แสดง
2. **ข้อ 51** (resolution.html): เนื้อหามติ (flowBlocks) ต้องดึงจากข้อมูลวาระ/คดี (`kase`) อัตโนมัติ
   ไม่ใช่ให้พิมพ์เองทั้งหมด
3. **ข้อ 52** (resolution.html): เปลี่ยน `signBlock` จาก dropdown เลือกผู้ลงนาม 1 คน (dir_case/
   board_sec/secgen) เป็น 3 ชื่อตายตัวพร้อมกัน — ผู้จดรายงาน (คุณปิยะนุช ชูเมือง), ผู้อำนวยการกอง
   บริหารคดี, ประธานกรรมการ ป.ป.ท. — ตัด dropdown เดิมออก
4. **ข้อ 47** (agenda-registry.html): เพิ่มตัวกรอง เรื่องใหม่ / เรื่องด่วน / เรื่องจากอนุกรรมการกลั่นกรอง
5. **ข้อ 49** (agenda-registry.html): ฟังก์ชัน "ล็อกรายชื่อกรรมการ" — ล็อกชุดที่เลือกไว้ให้ใช้ซ้ำทุกวาระ
   โดยอัตโนมัติ ปลดล็อกแก้เฉพาะวาระได้ — เก็บ state ที่ `localStorage` (mock, ไม่มี backend จริง)
6. **ข้อ 46** (header notification dropdown): ขอบเขตเฉพาะ Read Receipt + Badge ค้างจริง (mock/
   localStorage) — ไม่ทำส่วนผู้รับ/เงื่อนไขเวลาแจ้งเตือนรอบนี้ (เก็บเป็น backlog ข้อ 46.1-46.2)
7. **นอกขอบเขต**: ข้อ 48 (CRUD รายชื่อกรรมการ ป.ป.ท. จาก hardcode) และข้อ 56 (auto-fill รายงานชี้มูล
   ม.72 จากมติบอร์ด) — ยังไม่ grill/วางแผน เป็นงานถัดไป

---

## 📂 3. Affected Routes & Modules
- [x] `order.html` + `res/order.html` — หัวกระดาษ 'ประพฤติมิชอบ' (ข้อ 55)
- [x] `order-m24.html` + `res/order-m24.html` — หัวกระดาษ 'ประพฤติมิชอบ' (ข้อ 55)
- [x] `resolution.html` + `res/resolution.html` — signBlock 3 ชื่อ (ข้อ 52) + locked-roster fallback (ข้อ 49)
- [x] `agenda-registry.html` + `res/agenda-registry.html` — ตัวกรอง (ข้อ 47) + ล็อกรายชื่อกรรมการ (ข้อ 49)
- [x] `assets/ecmis-app.js` — notification read-receipt/badge state (ข้อ 46), ใช้ร่วมทุกหน้าที่มี header

---

## 🛡️ 4. The 6 Golden Anti-Regression Pre-Check
- [x] 1. ไม่กระทบคอลัมน์ "ประเภทเรื่อง" ใน inbox tables
- [x] 2. ไม่เปิดสิทธิ์ agenda-registry.html ให้ Chairman/Affairs
- [x] 3. ไม่เรียก Supabase โดยตรง (ใช้ `ECMIS.getSupabaseClient` เท่านั้น — งานชุดนี้ไม่แตะ Supabase)
- [x] 4. รัน `npm run sync` ทุกครั้งหลังแก้ Root HTML
- [x] 5. ไม่แตะ A4 margin/geometry (`padding:15mm 15mm 18mm 20mm`, secret-foot `bottom:8mm`)
- [x] 6. ไม่ใช้ `--no-verify`

---

## 📝 5. Step-by-Step Implementation Tasks (ตามลำดับ D → C → B → A ที่ grill ไว้)

### D. ข้อ 55 — หัวกระดาษ 'ประพฤติมิชอบ' ✅ commit `47e4144`
- [x] หา template head ปัจจุบันใน order.html/order-m24.html (บริเวณ doc-title แรกของเอกสาร — มี 2
      template ต่อไฟล์: appointHtml + amendHtml)
- [x] เพิ่มเงื่อนไข `kase.legalBase.startsWith('ม.18')` → แสดงบรรทัด '(ประพฤติมิชอบ)'
- [x] ทดสอบกับเคสตัวอย่างที่มี legalBase ม.18/4 (แสดง, case 3027/2569) และ ม.62 (ไม่แสดง, case 1189/2569)

### C. ข้อ 51-52 — resolution.html ✅ commit `3a37e8a`
- [x] ตรวจสอบ flowBlocks จริงในเบราว์เซอร์ — ข้อ 51 พบว่าดึงจาก `kase` อัตโนมัติอยู่แล้ว (หัวเรื่อง,
      ผู้รับผิดชอบ, สังกัด, ข้อมูลประชุม, รายชื่อผู้เข้าประชุม, ผลโหวต, ข้อความมติ) ไม่ต้องแก้เพิ่ม
- [x] ข้อ 52: **เบี่ยงจากแผนเดิม** — ไม่ได้ลบ dropdown #signerName/#signerTitle เพราะพบว่าผูกกับ
      workflow ลงนามดิจิทัลจริง (sig-name panel + DOCX tags) การลบจะทำฟีเจอร์ที่ใช้งานอยู่พัง —
      คงไว้และเพิ่มชื่อผู้จดรายงาน (ปิยะนุช ชูเมือง) + ประธานกรรมการ (ECMIS.getRole('chairman'))
      เป็นอีก 2 บรรทัดลงนามคู่กัน แทน
- [x] ทดสอบ pagination จริง — signBlock ยาวขึ้น 3 บรรทัด ยังแสดงถูกต้องในหน้าสุดท้าย ไม่ล้น

### B. ข้อ 47, 49 — agenda-registry.html ✅ commit `9bfe17e`, `0e0c2be`
- [x] ข้อ 47: พบว่า filter chip เดิม (ทั้งหมด/เรื่องใหม่/กลับมาอีก/เร่งด่วน) มีอยู่แล้วเกือบครบ —
      เพิ่มเฉพาะหมวด "จากอนุกรรมการกลั่นกรอง" ที่ขาด (ใช้ `kase.subCommittee` เป็นตัวบ่งชี้)
- [x] ข้อ 49: เพิ่ม UI ใหม่ทั้งหมดใน modal "เพิ่มการประชุม" (หน้านี้ไม่เคยมี UI รายชื่อกรรมการมาก่อน) —
      toggle ล็อก + checklist รายชื่อ 7 คน บันทึก `ecmis.lockedBoardRoster` ที่ localStorage
- [x] เชื่อม resolution.html: `#boardTb` fallback ไปใช้ locked roster เป็นค่าเริ่มต้นเมื่อสำนวนยังไม่มี
      `kase.boardAttendance`/`boardAttendance72` ของตัวเอง (แก้เฉพาะวาระยังคงทำได้ตามปกติ)
- [x] ทดสอบ end-to-end จริง: ล็อกชุดที่ตัดชื่อหนึ่งคนออก → ยืนยัน localStorage → เปิดสำนวนที่ไม่มี
      boardAttendance → คนนั้นขึ้น "ติดราชการ" อัตโนมัติ ที่เหลือ "เข้าประชุม"

### A. ข้อ 46 — Notification Read Receipt + Badge ✅ commit `379b161`
- [x] เพิ่ม `ECMIS.markNotifRead(id)` — บันทึก timestamp ที่ localStorage ต่อรายการ, ไม่เคลียร์เอง
- [x] Badge เปลี่ยนจากนับ total คงที่ เป็นนับ unread จริง (ทั้ง demo notifications + deadline alerts)
- [x] **บั๊กที่เจอระหว่างทดสอบและแก้ไปด้วย**: ฟังก์ชัน `refreshDeadlineNotificationsFromSupabase`
      (fire-and-forget รีเฟรชด้วยข้อมูลจริงหลัง render ครั้งแรก) มี template/badge logic เก่าซ้ำอยู่
      อีกชุด ทับ UI ของข้อ 46 ทิ้งไปหลัง page load ~1-2 วินาที — แก้โดยรวมเป็น
      `buildDeadlineNotifItems`/`applyDeadlineNotifRefresh` ใช้ร่วมกันทั้ง initial render และ refresh

### สุดท้าย
- [x] `npm run sync` (ทุกรอบ)
- [x] `npm test` (5-layer CI ผ่านทุกรอบ)
- [x] ทดสอบ UI จริงในเบราว์เซอร์ทุกกลุ่ม (local static server + quickLogin) รวมถึงบั๊กที่เจอระหว่างทาง
- [x] Commit แยกเป็นชุดตามกลุ่ม D/C/B/A ตามที่ผู้ใช้ขอ split commit (5 commits รวม: `47e4144`,
      `3a37e8a`, `9bfe17e`, `0e0c2be`, `379b161`)

---

## 🧪 6. Verification & Quality Gate Matrix
- [x] Manual UI Walkthrough ทุกหน้าที่แก้ (order, order-m24, resolution, agenda-registry, inbox header)
- [x] Dual-Route Sync
- [x] Enterprise CI (5-Layer) — ผ่านทุก commit
- [x] Regression check: resolution.html (`.doc-secret-foot` ยัง = 2, ไม่กระทบจากงานชุดก่อนหน้า)

---

## 🏁 7. Completion & Sign-off
- **Completed Date:** 2026-09-01
- **Commit Reference:** `47e4144`, `3a37e8a`, `9bfe17e`, `0e0c2be`, `379b161`
- **Notes / Retrospective:**
  - ข้อ 51 และข้อ 47 (บางส่วน) พบว่าถูกทำไว้แล้วในโค้ดเดิมก่อน grill — ตรวจสอบจริงในเบราว์เซอร์ก่อน
    เขียนโค้ดใหม่ ช่วยประหยัดงานและลดความเสี่ยง regression ได้มาก
  - ข้อ 52 เบี่ยงจากแผนที่ grill ไว้ (ไม่ลบ dropdown ลงนาม) เพราะเจอ dependency ที่ไม่เห็นตอน grill —
    เป็นตัวอย่างว่าการตรวจโค้ดจริงระหว่าง implement สำคัญแม้จะมี design decision ที่ grill ไว้แล้ว
  - เจอบั๊ก async-refresh-overwrites-UI ในข้อ 46 จากการทดสอบจริงในเบราว์เซอร์เท่านั้น (มองจากโค้ด
    อย่างเดียวไม่เห็น เพราะ logic อยู่คนละฟังก์ชันที่เรียกหลัง render เริ่มต้น)
  - ข้อ 48 (CRUD รายชื่อกรรมการจาก hardcode) และข้อ 56 (auto-fill รายงานชี้มูล ม.72) ยังไม่ได้ทำ —
    เป็นงานถัดไปที่ต้อง grill ใหม่
