# 2026-09-02 — Seed สำนวนคิวสั่งการประธานฯ ที่หายจาก CASES (2016/2569, 2020/2569)

## ปัญหา
เปิด `chairman-agenda.html?case=2016/2569` (Case ด่วน) จากปุ่ม "พิจารณาสั่งการ" ใน `inbox.html`
แล้วไม่มีปุ่มให้บันทึก

## Root cause
- flow 2 ขั้นของ `chairman-agenda.html` (ลงนามดิจิทัล → ปุ่ม "บันทึกคำสั่งและส่งบรรจุวาระ" โผล่)
  ทำงานถูกต้อง — ยืนยันกับ `1277/2569` และ `1203/2569`
- `2016/2569` และ `2020/2569` แสดงในคิวสั่งการของประธานฯ แต่ **ไม่มีใน `ECMIS.CASES`**
  (ตรงกับ `LATEST_HANDOVER.md` ที่ระบุ gap นี้ไว้)
- `getCase()` หลุดไป Supabase XHR fallback → `canAct(kase,'chairman')` ไม่ผ่าน
  → `actionBar()` แสดงข้อความล็อก ไม่มีปุ่มลงนาม/บันทึก

## การแก้
Seed 2 สำนวนเข้า array `CASES` ใน `assets/ecmis-app.js` (ไฟล์กลาง ไม่ต้อง sync `/res/`)

| ฟิลด์ | 2016/2569 | 2020/2569 |
|---|---|---|
| status | `PENDING_URGENT` | `PENDING_CHAIRMAN` |
| procType | 7.1 | 7.1 |
| urgent | true | false |
| urgentCertified | true | — |
| อิงโครงสร้าง | 1203/2569 | 1277/2569 |
| docType / signPhase | 213 / WAIT | 213 / WAIT |

## นอกขอบเขต
- ไม่แตะ `buildButtons()` / `actionBar()` / `canAct()` / routing
- ไม่เพิ่มปุ่ม "บันทึกโดยไม่ลงนาม"

## ผลที่คาดหวัง
- ทั้งสองสำนวนโหลดได้บน `chairman-agenda.html` (เอกสาร ปปท.๕-๐๒)
- ลงนามเสร็จ → ปุ่ม "บันทึกคำสั่งและส่งบรรจุวาระ" โผล่ บันทึกได้ → `AGENDA_SET`
- โผล่ในคิวประธานฯ ที่ `inbox.html`: 2016/2569 = วาระด่วน, 2020/2569 = วาระปกติ

## ทดสอบ
- [ ] `npm test` (5 ด่าน CI) ผ่าน
